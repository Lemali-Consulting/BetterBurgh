import type { CategoryInfo } from "@/types";

export interface BucketDef {
  slug: string;
  nameEn: string;
  nameEs: string;
  color: string;
  emoji: string;
}

// Six macro-buckets used on the map for color/icon coding. Ordered by
// approximate urgency so that a service tagged with multiple categories picks
// the most "survival-critical" bucket first.
export const BUCKETS: BucketDef[] = [
  { slug: "shelter", nameEn: "Shelter & Housing", nameEs: "Refugio y Vivienda", color: "#2563eb", emoji: "🏠" },
  { slug: "food", nameEn: "Food & Meals", nameEs: "Comida", color: "#ea580c", emoji: "🍽️" },
  { slug: "health", nameEn: "Health & Medical", nameEs: "Salud y Médica", color: "#dc2626", emoji: "🏥" },
  { slug: "hygiene", nameEn: "Hygiene & Supplies", nameEs: "Higiene y Suministros", color: "#0d9488", emoji: "🚿" },
  { slug: "money-legal", nameEn: "Money, Jobs & Legal", nameEs: "Dinero, Empleo y Legal", color: "#7c3aed", emoji: "💲" },
  { slug: "community", nameEn: "Community & Other", nameEs: "Comunidad y Otros", color: "#475569", emoji: "👥" },
];

// Map each of the 17 category slugs to one of the 6 buckets.
const CATEGORY_TO_BUCKET: Record<string, string> = {
  "shelter-overnight": "shelter",
  "shelter-day": "shelter",
  "housing": "shelter",
  "meals": "food",
  "food-pantries": "food",
  "health": "health",
  "showers": "hygiene",
  "supplies": "hygiene",
  "financial-help": "money-legal",
  "jobs-education": "money-legal",
  "expert-help": "money-legal",
  "activities": "community",
  "seniors": "community",
  "veterans": "community",
  "family-support": "community",
  "libraries": "community",
  "transportation": "community",
};

const BUCKET_BY_SLUG: Record<string, BucketDef> = Object.fromEntries(
  BUCKETS.map((b) => [b.slug, b]),
);

export function getBucket(slug: string): BucketDef | null {
  return BUCKET_BY_SLUG[slug] ?? null;
}

/**
 * Pick the primary bucket for a service. Services can have multiple
 * categories; we choose by BUCKETS order (urgency), falling back to
 * "community" if nothing matches.
 */
export function primaryBucket(categories: CategoryInfo[]): BucketDef {
  const bucketSlugs = new Set(
    categories
      .map((c) => CATEGORY_TO_BUCKET[c.slug])
      .filter((s): s is string => Boolean(s)),
  );
  for (const bucket of BUCKETS) {
    if (bucketSlugs.has(bucket.slug)) return bucket;
  }
  return BUCKET_BY_SLUG["community"];
}
