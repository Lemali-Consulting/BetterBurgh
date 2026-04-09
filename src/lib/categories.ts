export interface CategoryDef {
  slug: string;
  nameEn: string;
  nameEs: string;
  icon: string;
  displayOrder: number;
}

// Unified category definitions, ordered by 211 demand data
export const CATEGORIES: CategoryDef[] = [
  { slug: "shelter-overnight", nameEn: "Overnight Shelter", nameEs: "Refugio Nocturno", icon: "🏠", displayOrder: 1 },
  { slug: "meals", nameEn: "Meals", nameEs: "Comidas", icon: "🍽️", displayOrder: 2 },
  { slug: "food-pantries", nameEn: "Food Pantries", nameEs: "Bancos de Alimentos", icon: "🛒", displayOrder: 3 },
  { slug: "shelter-day", nameEn: "Daytime Shelter", nameEs: "Refugio Diurno", icon: "☀️", displayOrder: 4 },
  { slug: "health", nameEn: "Health & Medical", nameEs: "Salud y Médica", icon: "🏥", displayOrder: 5 },
  { slug: "financial-help", nameEn: "Financial & Legal Help", nameEs: "Ayuda Financiera y Legal", icon: "💲", displayOrder: 6 },
  { slug: "housing", nameEn: "Housing Crisis", nameEs: "Crisis de Vivienda", icon: "🏘️", displayOrder: 7 },
  { slug: "showers", nameEn: "Showers & Hygiene", nameEs: "Duchas e Higiene", icon: "🚿", displayOrder: 8 },
  { slug: "supplies", nameEn: "Supplies & Clothing", nameEs: "Suministros y Ropa", icon: "📦", displayOrder: 9 },
  { slug: "jobs-education", nameEn: "Jobs & Education", nameEs: "Empleo y Educación", icon: "💼", displayOrder: 10 },
  { slug: "activities", nameEn: "Activities & Programs", nameEs: "Actividades y Programas", icon: "⭐", displayOrder: 11 },
  { slug: "expert-help", nameEn: "Expert Help & Referrals", nameEs: "Ayuda y Referencias Profesionales", icon: "📋", displayOrder: 12 },
  { slug: "seniors", nameEn: "Senior Services", nameEs: "Servicios para Mayores", icon: "👴", displayOrder: 13 },
  { slug: "veterans", nameEn: "Veterans Services", nameEs: "Servicios para Veteranos", icon: "🎖️", displayOrder: 14 },
  { slug: "family-support", nameEn: "Family Support", nameEs: "Apoyo Familiar", icon: "👨‍👩‍👧", displayOrder: 15 },
  { slug: "libraries", nameEn: "Libraries", nameEs: "Bibliotecas", icon: "📚", displayOrder: 16 },
  { slug: "transportation", nameEn: "Transportation", nameEs: "Transporte", icon: "🚌", displayOrder: 17 },
];

// Map raw BigBurgh category strings to normalized slugs
const RAW_TO_SLUG: Record<string, string> = {
  "meals": "meals",
  "meals-foodpantries": "food-pantries",
  "pantries-supplies": "food-pantries",
  "roof-daytime": "shelter-day",
  "roof-overnight": "shelter-overnight",
  "health": "health",
  "clinic": "health",
  "activities": "activities",
  "expert-lookup": "expert-help",
  "miscl-showers": "showers",
  "miscl-supplies": "supplies",
  "miscl-freeshuttle": "transportation",
  "finances": "financial-help",
  "housing": "housing",
  "jobs": "jobs-education",
};

// Map county asset types to normalized slugs
const ASSET_TYPE_TO_SLUG: Record<string, string> = {
  "food_banks": "food-pantries",
  "homeless_shelters": "shelter-overnight",
  "senior_centers": "seniors",
  "family_support_centers": "family-support",
  "health_centers": "health",
  "achd_clinics": "health",
  "libraries": "libraries",
  "va_facilities": "veterans",
};

/**
 * Parse a pipe-delimited BigBurgh category string into normalized category slugs.
 * e.g. "roof-daytime|miscl-showers" -> ["shelter-day", "showers"]
 */
export function normalizeBigburghCategories(raw: string): string[] {
  if (!raw) return [];
  const parts = raw.split("|").map((s) => s.trim().toLowerCase());
  const slugs = new Set<string>();
  for (const part of parts) {
    const slug = RAW_TO_SLUG[part];
    if (slug) slugs.add(slug);
  }
  return Array.from(slugs);
}

/**
 * Map a county asset type to a normalized category slug.
 */
export function normalizeAssetType(assetType: string): string | null {
  return ASSET_TYPE_TO_SLUG[assetType] ?? null;
}
