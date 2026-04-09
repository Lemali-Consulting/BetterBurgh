import Database from "better-sqlite3";
import { parse } from "csv-parse/sync";
import { readFileSync, existsSync, unlinkSync } from "fs";
import { resolve } from "path";
import {
  CATEGORIES,
  normalizeBigburghCategories,
  normalizeAssetType,
} from "../src/lib/categories";
import { DEMOGRAPHICS, parseDemographics } from "../src/lib/demographics";
import { parseSchedule } from "../src/lib/schedule-parser";
import { normalizeNeighborhood } from "../src/lib/neighborhoods";
import { normalizePhone, extractFirstPhone } from "../src/lib/phone";
import { slugify, deduplicateSlug } from "../src/lib/slugify";

const DATA_DIR = resolve(__dirname, "../data");
const DB_PATH = resolve(__dirname, "../betterburgh.db");

// ─── Helpers ──────────────────────────────────────────────

function readCSV(filename: string): Record<string, string>[] {
  const filepath = resolve(DATA_DIR, filename);
  let content = readFileSync(filepath, "utf-8");

  // Fix CSVs with unquoted newlines in fields (e.g. holiday_exception column).
  // Each record starts with a numeric _id at the beginning of a line.
  // Join any lines that don't start with a number (continuation of previous record).
  const lines = content.split(/\r?\n/);
  const header = lines[0];
  const fixedLines = [header];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    // A new record starts with digits followed by a comma (the _id field)
    if (/^\d+,/.test(line)) {
      fixedLines.push(line);
    } else {
      // Continuation of previous record — append with space
      fixedLines[fixedLines.length - 1] += " " + line;
    }
  }
  content = fixedLines.join("\n");

  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_column_count: true,
  });
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Main ─────────────────────────────────────────────────

function main() {
  console.log("Building BetterBurgh database...");

  // Remove old DB
  if (existsSync(DB_PATH)) unlinkSync(DB_PATH);
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = DELETE");

  // ─── Create Schema ──────────────────────────────────────
  db.exec(`
    CREATE TABLE services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      facility TEXT,
      organization TEXT,
      address TEXT,
      neighborhood TEXT,
      latitude REAL,
      longitude REAL,
      phone TEXT,
      phone_raw TEXT,
      schedule_text TEXT,
      schedule_structured TEXT,
      holiday_exception TEXT,
      requirements TEXT,
      recommended_for TEXT,
      source TEXT,
      last_updated TEXT
    );

    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_es TEXT NOT NULL,
      icon TEXT,
      display_order INTEGER
    );

    CREATE TABLE service_categories (
      service_id INTEGER REFERENCES services(id),
      category_id INTEGER REFERENCES categories(id),
      PRIMARY KEY (service_id, category_id)
    );

    CREATE TABLE demographics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_es TEXT NOT NULL
    );

    CREATE TABLE service_demographics (
      service_id INTEGER REFERENCES services(id),
      demographic_id INTEGER REFERENCES demographics(id),
      PRIMARY KEY (service_id, demographic_id)
    );

    CREATE TABLE crisis_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      organization TEXT,
      phone TEXT,
      phone_raw TEXT,
      description TEXT,
      schedule_text TEXT,
      address TEXT,
      latitude REAL,
      longitude REAL,
      display_order INTEGER
    );

    CREATE VIRTUAL TABLE services_fts USING fts5(
      name, description, organization, neighborhood, address,
      content='services', content_rowid='id'
    );

    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_data TEXT,
      session_id TEXT,
      locale TEXT,
      referrer TEXT
    );
  `);

  // ─── Insert Categories ──────────────────────────────────
  const insertCategory = db.prepare(
    `INSERT INTO categories (slug, name_en, name_es, icon, display_order) VALUES (?, ?, ?, ?, ?)`
  );
  for (const cat of CATEGORIES) {
    insertCategory.run(cat.slug, cat.nameEn, cat.nameEs, cat.icon, cat.displayOrder);
  }
  const categoryIdMap = new Map<string, number>();
  for (const row of db.prepare("SELECT id, slug FROM categories").all() as { id: number; slug: string }[]) {
    categoryIdMap.set(row.slug, row.id);
  }

  // ─── Insert Demographics ────────────────────────────────
  const insertDemographic = db.prepare(
    `INSERT INTO demographics (slug, name_en, name_es) VALUES (?, ?, ?)`
  );
  for (const demo of DEMOGRAPHICS) {
    insertDemographic.run(demo.slug, demo.nameEn, demo.nameEs);
  }
  const demoIdMap = new Map<string, number>();
  for (const row of db.prepare("SELECT id, slug FROM demographics").all() as { id: number; slug: string }[]) {
    demoIdMap.set(row.slug, row.id);
  }

  // ─── Insert Services ────────────────────────────────────
  const insertService = db.prepare(`
    INSERT INTO services (name, slug, description, facility, organization, address, neighborhood,
      latitude, longitude, phone, phone_raw, schedule_text, schedule_structured,
      holiday_exception, requirements, recommended_for, source, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertServiceCategory = db.prepare(
    `INSERT OR IGNORE INTO service_categories (service_id, category_id) VALUES (?, ?)`
  );
  const insertServiceDemographic = db.prepare(
    `INSERT OR IGNORE INTO service_demographics (service_id, demographic_id) VALUES (?, ?)`
  );

  const slugSet = new Set<string>();
  // Track services for dedup: normalized name+lat+lon
  const serviceKeys = new Map<string, { id: number; source: string }>();

  // ── BigBurgh Services ─────────────────────────────────
  console.log("Processing BigBurgh services...");
  const allServices = readCSV("bigburgh-services.csv");
  const months = [...new Set(allServices.map((r) => r.year_month))].sort();
  const latestMonth = months[months.length - 1];
  const latest = allServices.filter((r) => r.year_month === latestMonth);
  console.log(`  Latest snapshot: ${latestMonth} (${latest.length} services)`);

  let bbCount = 0;
  const insertBigburghBatch = db.transaction(() => {
    for (const row of latest) {
      const name = row.service_name?.trim();
      if (!name) continue;

      const slug = deduplicateSlug(slugify(name), slugSet);
      const neighborhood = normalizeNeighborhood(row.neighborhood || "");
      const phoneResult = normalizePhone(extractFirstPhone(row.phone || ""));
      const schedule = parseSchedule(row.schedule || "");
      const lat = parseFloat(row.latitude) || null;
      const lon = parseFloat(row.longitude) || null;

      const result = insertService.run(
        name,
        slug,
        row.narrative?.trim() || null,
        row.program_or_facility?.trim() || null,
        row.organization?.trim() || null,
        row.address?.trim() || null,
        neighborhood || null,
        lat,
        lon,
        phoneResult?.display || null,
        phoneResult?.raw || null,
        row.schedule?.trim() || null,
        schedule ? JSON.stringify(schedule) : null,
        row.holiday_exception?.trim() || null,
        row.requirements?.trim() || null,
        row.recommended_for?.trim() || null,
        "bigburgh",
        latestMonth
      );
      const serviceId = Number(result.lastInsertRowid);

      // Track for dedup
      const dedupKey = name.toLowerCase();
      serviceKeys.set(dedupKey, { id: serviceId, source: "bigburgh" });

      // Categories
      const catSlugs = normalizeBigburghCategories(row.category || "");
      for (const catSlug of catSlugs) {
        const catId = categoryIdMap.get(catSlug);
        if (catId) insertServiceCategory.run(serviceId, catId);
      }

      // Demographics
      const demoSlugs = parseDemographics(
        row.recommended_for || "",
        row.requirements || ""
      );
      for (const demoSlug of demoSlugs) {
        const demoId = demoIdMap.get(demoSlug);
        if (demoId) insertServiceDemographic.run(serviceId, demoId);
      }

      bbCount++;
    }
  });
  insertBigburghBatch();
  console.log(`  Inserted ${bbCount} BigBurgh services`);

  // ── County Assets ─────────────────────────────────────
  console.log("Processing Allegheny County assets...");
  const allAssets = readCSV("allegheny-county-assets.csv");
  const relevantTypes = new Set([
    "food_banks", "homeless_shelters", "senior_centers",
    "family_support_centers", "health_centers", "achd_clinics",
    "libraries", "va_facilities",
  ]);

  let countyCount = 0;
  let skipCount = 0;
  const insertCountyBatch = db.transaction(() => {
    for (const row of allAssets) {
      if (!relevantTypes.has(row.asset_type)) continue;

      const name = row.name?.trim();
      if (!name) continue;

      // Dedup: skip if a similar service already exists from BigBurgh
      const dedupKey = name.toLowerCase();
      if (serviceKeys.has(dedupKey)) {
        skipCount++;
        continue;
      }

      // Also check by proximity if we have coords
      const lat = parseFloat(row.latitude) || null;
      const lon = parseFloat(row.longitude) || null;
      if (lat && lon) {
        let tooClose = false;
        for (const [, existing] of serviceKeys) {
          const existingRow = db
            .prepare("SELECT latitude, longitude FROM services WHERE id = ?")
            .get(existing.id) as { latitude: number | null; longitude: number | null } | undefined;
          if (
            existingRow?.latitude &&
            existingRow?.longitude &&
            haversineDistance(lat, lon, existingRow.latitude, existingRow.longitude) < 100
          ) {
            tooClose = true;
            break;
          }
        }
        if (tooClose) {
          skipCount++;
          continue;
        }
      }

      const slug = deduplicateSlug(slugify(name), slugSet);
      const phoneResult = normalizePhone(extractFirstPhone(row.phone || ""));
      const schedule = parseSchedule(row.hours_of_operation || "");

      const result = insertService.run(
        name,
        slug,
        null, // no narrative
        null, // no facility
        null, // no org
        row.street_address?.trim() || null,
        null, // county assets don't have neighborhood
        lat,
        lon,
        phoneResult?.display || null,
        phoneResult?.raw || null,
        row.hours_of_operation?.trim() || null,
        schedule ? JSON.stringify(schedule) : null,
        null, // no holiday exception
        null, // no requirements
        null, // no recommended_for
        "county",
        "2020"
      );
      const serviceId = Number(result.lastInsertRowid);
      serviceKeys.set(dedupKey, { id: serviceId, source: "county" });

      // Category from asset type
      const catSlug = normalizeAssetType(row.asset_type);
      if (catSlug) {
        const catId = categoryIdMap.get(catSlug);
        if (catId) insertServiceCategory.run(serviceId, catId);
      }

      // Demographics: county assets don't have this info, default to everyone
      const everyoneId = demoIdMap.get("everyone");
      if (everyoneId) insertServiceDemographic.run(serviceId, everyoneId);

      countyCount++;
    }
  });
  insertCountyBatch();
  console.log(`  Inserted ${countyCount} county assets (skipped ${skipCount} duplicates)`);

  // ── Crisis Resources ──────────────────────────────────
  console.log("Processing crisis resources...");
  const allSafePlaces = readCSV("bigburgh-safeplaces.csv");
  const spMonths = [...new Set(allSafePlaces.map((r) => r.year_month))].sort();
  const spLatest = spMonths[spMonths.length - 1];
  const latestSP = allSafePlaces.filter((r) => r.year_month === spLatest);

  const insertCrisis = db.prepare(`
    INSERT INTO crisis_resources (name, organization, phone, phone_raw, description,
      schedule_text, address, latitude, longitude, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let crisisCount = 0;
  const insertCrisisBatch = db.transaction(() => {
    for (let i = 0; i < latestSP.length; i++) {
      const row = latestSP[i];
      const name = row.safe_place_name?.trim();
      if (!name) continue;

      const phoneResult = normalizePhone(extractFirstPhone(row.phone || ""));
      const lat = parseFloat(row.latitude) || null;
      const lon = parseFloat(row.longitude) || null;

      insertCrisis.run(
        name,
        row.organization?.trim() || null,
        phoneResult?.display || row.phone?.trim() || null,
        phoneResult?.raw || null,
        row.narrative?.trim() || null,
        row.schedule?.trim() || null,
        row.address?.trim() || null,
        lat,
        lon,
        i + 1
      );
      crisisCount++;
    }
  });
  insertCrisisBatch();
  console.log(`  Inserted ${crisisCount} crisis resources`);

  // ── Build FTS Index ───────────────────────────────────
  console.log("Building full-text search index...");
  db.exec(`
    INSERT INTO services_fts(rowid, name, description, organization, neighborhood, address)
    SELECT id, name, COALESCE(description, ''), COALESCE(organization, ''),
           COALESCE(neighborhood, ''), COALESCE(address, '')
    FROM services
  `);

  // ── Summary ───────────────────────────────────────────
  const totalServices = (db.prepare("SELECT COUNT(*) as c FROM services").get() as { c: number }).c;
  const totalCrisis = (db.prepare("SELECT COUNT(*) as c FROM crisis_resources").get() as { c: number }).c;
  const totalCategories = (db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number }).c;
  const totalDemographics = (db.prepare("SELECT COUNT(*) as c FROM demographics").get() as { c: number }).c;

  console.log("\n=== Build Complete ===");
  console.log(`  Services: ${totalServices}`);
  console.log(`  Crisis resources: ${totalCrisis}`);
  console.log(`  Categories: ${totalCategories}`);
  console.log(`  Demographics: ${totalDemographics}`);
  console.log(`  Database: ${DB_PATH}`);

  db.close();
}

main();
