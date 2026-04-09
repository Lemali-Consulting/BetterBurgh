/**
 * Generate a URL-friendly slug from a string.
 * "412 Youth Zone" -> "412-youth-zone"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Deduplicate slugs by appending numeric suffixes.
 */
export function deduplicateSlug(slug: string, existing: Set<string>): string {
  if (!existing.has(slug)) {
    existing.add(slug);
    return slug;
  }
  let i = 2;
  while (existing.has(`${slug}-${i}`)) i++;
  const unique = `${slug}-${i}`;
  existing.add(unique);
  return unique;
}
