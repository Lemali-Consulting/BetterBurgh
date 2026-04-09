import Database from "better-sqlite3";
import { resolve, join } from "path";
import { existsSync } from "fs";
import type {
  Service,
  CategoryInfo,
  DemographicInfo,
  CrisisResource,
  SearchFilters,
} from "@/types";

// Try multiple paths to find the DB file — process.cwd() works locally,
// but on Vercel serverless we need to look relative to the bundle.
function findDbPath(): string {
  const candidates = [
    resolve(process.cwd(), "betterburgh.db"),
    join(__dirname, "..", "..", "betterburgh.db"),
    join(__dirname, "..", "..", "..", "betterburgh.db"),
    join(__dirname, "..", "..", "..", "..", "betterburgh.db"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  // Fallback to cwd — will produce a clear error if missing
  return resolve(process.cwd(), "betterburgh.db");
}

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(findDbPath(), { readonly: true });
    _db.pragma("journal_mode = WAL");
  }
  return _db;
}

// ─── Raw row types from SQLite ────────────────────────────

interface ServiceRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  facility: string | null;
  organization: string | null;
  address: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  phone_raw: string | null;
  schedule_text: string | null;
  schedule_structured: string | null;
  holiday_exception: string | null;
  requirements: string | null;
  recommended_for: string | null;
  source: string;
  last_updated: string | null;
}

interface CategoryRow {
  id: number;
  slug: string;
  name_en: string;
  name_es: string;
  icon: string;
  display_order: number;
}

interface DemographicRow {
  id: number;
  slug: string;
  name_en: string;
  name_es: string;
}

interface CrisisRow {
  id: number;
  name: string;
  organization: string | null;
  phone: string | null;
  phone_raw: string | null;
  description: string | null;
  schedule_text: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  display_order: number;
}

// ─── Transformers ─────────────────────────────────────────

function toService(row: ServiceRow): Service {
  const db = getDb();

  const catRows = db
    .prepare(
      `SELECT c.slug, c.name_en, c.name_es, c.icon, c.display_order
       FROM service_categories sc JOIN categories c ON c.id = sc.category_id
       WHERE sc.service_id = ? ORDER BY c.display_order`
    )
    .all(row.id) as CategoryRow[];

  const demoRows = db
    .prepare(
      `SELECT d.slug, d.name_en, d.name_es
       FROM service_demographics sd JOIN demographics d ON d.id = sd.demographic_id
       WHERE sd.service_id = ?`
    )
    .all(row.id) as DemographicRow[];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    facility: row.facility,
    organization: row.organization,
    address: row.address,
    neighborhood: row.neighborhood,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    phoneRaw: row.phone_raw,
    scheduleText: row.schedule_text,
    scheduleStructured: row.schedule_structured
      ? JSON.parse(row.schedule_structured)
      : null,
    holidayException: row.holiday_exception,
    requirements: row.requirements,
    recommendedFor: row.recommended_for,
    categories: catRows.map((c) => ({
      slug: c.slug,
      nameEn: c.name_en,
      nameEs: c.name_es,
      icon: c.icon,
      displayOrder: c.display_order,
    })),
    demographics: demoRows.map((d) => ({
      slug: d.slug,
      nameEn: d.name_en,
      nameEs: d.name_es,
    })),
    source: row.source as "bigburgh" | "county",
    lastUpdated: row.last_updated,
  };
}

function toCrisisResource(row: CrisisRow): CrisisResource {
  return {
    id: row.id,
    name: row.name,
    organization: row.organization,
    phone: row.phone,
    phoneRaw: row.phone_raw,
    description: row.description,
    scheduleText: row.schedule_text,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    displayOrder: row.display_order,
  };
}

// ─── Query Functions ──────────────────────────────────────

export function getServices(filters: SearchFilters = {}): Service[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  let baseQuery: string;

  if (filters.query) {
    baseQuery = `
      SELECT s.* FROM services s
      JOIN services_fts fts ON fts.rowid = s.id
      WHERE services_fts MATCH ?
    `;
    params.push(filters.query);
  } else {
    baseQuery = `SELECT s.* FROM services s WHERE 1=1`;
  }

  if (filters.category) {
    conditions.push(
      `s.id IN (SELECT sc.service_id FROM service_categories sc JOIN categories c ON c.id = sc.category_id WHERE c.slug = ?)`
    );
    params.push(filters.category);
  }

  if (filters.demographic) {
    conditions.push(
      `s.id IN (SELECT sd.service_id FROM service_demographics sd JOIN demographics d ON d.id = sd.demographic_id WHERE d.slug = ?)`
    );
    params.push(filters.demographic);
  }

  if (filters.neighborhood) {
    conditions.push(`s.neighborhood = ?`);
    params.push(filters.neighborhood);
  }

  const where =
    conditions.length > 0 ? ` AND ${conditions.join(" AND ")}` : "";
  const sql = `${baseQuery}${where} ORDER BY s.name LIMIT 500`;

  const rows = db.prepare(sql).all(...params) as ServiceRow[];
  return rows.map(toService);
}

export function getServiceBySlug(slug: string): Service | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM services WHERE slug = ?")
    .get(slug) as ServiceRow | undefined;
  return row ? toService(row) : null;
}

export function getAllServiceSlugs(): string[] {
  const db = getDb();
  const rows = db.prepare("SELECT slug FROM services").all() as {
    slug: string;
  }[];
  return rows.map((r) => r.slug);
}

export function getCategories(): CategoryInfo[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT c.*, COUNT(sc.service_id) as cnt
       FROM categories c
       LEFT JOIN service_categories sc ON sc.category_id = c.id
       GROUP BY c.id
       HAVING cnt > 0
       ORDER BY c.display_order`
    )
    .all() as (CategoryRow & { cnt: number })[];

  return rows.map((c) => ({
    slug: c.slug,
    nameEn: c.name_en,
    nameEs: c.name_es,
    icon: c.icon,
    displayOrder: c.display_order,
  }));
}

export function getDemographics(): DemographicInfo[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT d.*, COUNT(sd.service_id) as cnt
       FROM demographics d
       LEFT JOIN service_demographics sd ON sd.demographic_id = d.id
       GROUP BY d.id
       HAVING cnt > 0
       ORDER BY d.name_en`
    )
    .all() as (DemographicRow & { cnt: number })[];

  return rows.map((d) => ({
    slug: d.slug,
    nameEn: d.name_en,
    nameEs: d.name_es,
  }));
}

export function getNeighborhoods(): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT DISTINCT neighborhood FROM services
       WHERE neighborhood IS NOT NULL AND neighborhood != ''
       ORDER BY neighborhood`
    )
    .all() as { neighborhood: string }[];
  return rows.map((r) => r.neighborhood);
}

export function getCrisisResources(): CrisisResource[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM crisis_resources ORDER BY display_order")
    .all() as CrisisRow[];
  return rows.map(toCrisisResource);
}

export function getServiceCount(): number {
  const db = getDb();
  return (
    db.prepare("SELECT COUNT(*) as c FROM services").get() as { c: number }
  ).c;
}

export function getAllServicesForOffline(): Service[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM services ORDER BY name")
    .all() as ServiceRow[];
  return rows.map(toService);
}
