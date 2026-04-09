export interface DemographicDef {
  slug: string;
  nameEn: string;
  nameEs: string;
}

export const DEMOGRAPHICS: DemographicDef[] = [
  { slug: "everyone", nameEn: "Everyone", nameEs: "Todos" },
  { slug: "veterans", nameEn: "Veterans", nameEs: "Veteranos" },
  { slug: "men", nameEn: "Men", nameEs: "Hombres" },
  { slug: "women", nameEn: "Women", nameEs: "Mujeres" },
  { slug: "youth", nameEn: "Youth (Under 25)", nameEs: "Jóvenes (Menores de 25)" },
  { slug: "seniors", nameEn: "Seniors (60+)", nameEs: "Mayores (60+)" },
  { slug: "families", nameEn: "Families", nameEs: "Familias" },
  { slug: "lgbtq", nameEn: "LGBTQ+", nameEs: "LGBTQ+" },
  { slug: "children", nameEn: "Children & Teens", nameEs: "Niños y Adolescentes" },
  { slug: "pregnant", nameEn: "Pregnant", nameEs: "Embarazadas" },
  { slug: "reentry", nameEn: "Formerly Incarcerated", nameEs: "Previamente Encarcelados" },
];

const PATTERNS: [RegExp, string][] = [
  [/\bveteran/i, "veterans"],
  [/\bvets?\b/i, "veterans"],
  [/\bmen\b/i, "men"],
  [/\bmale/i, "men"],
  [/\bwomen\b/i, "women"],
  [/\bfemale/i, "women"],
  [/\byouth/i, "youth"],
  [/\bteen/i, "youth"],
  [/\byoung\b/i, "youth"],
  [/\bages?\s*1[3-9]/i, "youth"],
  [/\b2[0-4]\s*(and|&)\s*(under|younger)/i, "youth"],
  [/\bsenior/i, "seniors"],
  [/\belder/i, "seniors"],
  [/\b6[05]\s*(and|&)\s*(over|older)/i, "seniors"],
  [/\bfamil/i, "families"],
  [/\bchildren\b/i, "children"],
  [/\bkids\b/i, "children"],
  [/\blgbt/i, "lgbtq"],
  [/\btransgender/i, "lgbtq"],
  [/\bpregnant/i, "pregnant"],
  [/\bmoms?-to-be/i, "pregnant"],
  [/\bincarcerat/i, "reentry"],
  [/\bre-?entry/i, "reentry"],
];

/**
 * Parse free-text recommended_for and requirements fields into demographic tags.
 * Returns unique slugs. Defaults to ["everyone"] if no specific pattern matches.
 */
export function parseDemographics(
  recommendedFor: string,
  requirements: string
): string[] {
  const text = `${recommendedFor} ${requirements}`.toLowerCase();
  if (!text.trim()) return ["everyone"];

  const matched = new Set<string>();
  for (const [pattern, slug] of PATTERNS) {
    if (pattern.test(text)) {
      matched.add(slug);
    }
  }

  if (matched.size === 0) return ["everyone"];
  return Array.from(matched);
}
