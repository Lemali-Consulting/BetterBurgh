/**
 * Normalize inconsistent neighborhood spellings to canonical forms.
 */
const SPELLING_MAP: Record<string, string> = {
  "north side": "North Side",
  "northside": "North Side",
  "northside (east allegheny)": "North Side",
  "northside/allegheny city central": "North Side",
  "northside/marshall-shadeland": "North Side",
  "mckees rocks": "McKees Rocks",
  "mckeesport": "McKeesport",
  "wilkinsburg": "Wilkinsburg",
  "bellvue": "Bellevue",
  "bellevue": "Bellevue",
  "mt. washington": "Mt. Washington",
  "mt washington": "Mt. Washington",
  "east liberty": "East Liberty",
  "east end": "East End",
};

export function normalizeNeighborhood(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  const key = trimmed.toLowerCase();
  return SPELLING_MAP[key] ?? trimmed;
}
