/**
 * Normalize a phone string into display and raw (tel: link) formats.
 */
export function normalizePhone(raw: string): { display: string; raw: string } | null {
  if (!raw || !raw.trim()) return null;

  // Extract digits only
  const digits = raw.replace(/\D/g, "");

  // Handle various lengths
  let normalized: string;
  if (digits.length === 11 && digits.startsWith("1")) {
    normalized = digits.slice(1); // Remove country code
  } else if (digits.length === 10) {
    normalized = digits;
  } else if (digits.length === 7) {
    // Local number, assume 412 area code
    normalized = `412${digits}`;
  } else {
    // Unusual format -- keep original for display, use digits for tel:
    return { display: raw.trim(), raw: digits };
  }

  const display = `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  return { display, raw: normalized };
}

/**
 * Extract the first phone number from a string that may contain multiple numbers or extensions.
 */
export function extractFirstPhone(raw: string): string {
  if (!raw) return "";
  // Take everything before a comma, semicolon, or "ext"
  const first = raw.split(/[,;]|ext\.?/i)[0].trim();
  return first;
}
