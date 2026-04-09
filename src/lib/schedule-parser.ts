export interface ScheduleEntry {
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  open: string; // "08:00" 24h format
  close: string; // "15:00"
}

const DAY_MAP: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

const ALL_WEEK = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];

/**
 * Parse a time string like "8am", "10:30 AM", "3pm", "noon", "midnight" to 24h "HH:MM".
 */
function parseTime(raw: string): string | null {
  raw = raw.trim().toLowerCase().replace(/\s+/g, "");

  if (raw === "noon" || raw === "12noon") return "12:00";
  if (raw === "midnight") return "00:00";

  const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3];

  if (ampm === "pm" && hours < 12) hours += 12;
  if (ampm === "am" && hours === 12) hours = 0;

  // Sanity check
  if (hours > 23 || minutes > 59) return null;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Expand a day range like "Mon - Fri" into [1, 2, 3, 4, 5].
 * Handles: single days, ranges, comma/ampersand/dash lists, "Mon - Wed - Fri" style.
 */
function parseDays(raw: string): number[] | null {
  raw = raw.trim().toLowerCase();

  // "7 days/week", "365 days/year", "everyday", "daily"
  if (/7\s*days/i.test(raw) || /365\s*days/i.test(raw) || /every\s*day/i.test(raw) || raw === "daily") {
    return ALL_WEEK;
  }

  // "weekdays"
  if (raw === "weekdays") return WEEKDAYS;

  // Range: "mon - fri", "mon-fri", "mon thru fri"
  const rangeMatch = raw.match(
    /^(\w+)\s*[-–—]\s*(\w+)$|^(\w+)\s+(?:thru|through|to)\s+(\w+)$/
  );
  if (rangeMatch) {
    const startStr = rangeMatch[1] || rangeMatch[3];
    const endStr = rangeMatch[2] || rangeMatch[4];
    const start = DAY_MAP[startStr];
    const end = DAY_MAP[endStr];
    if (start === undefined || end === undefined) return null;
    const days: number[] = [];
    for (let d = start; d !== (end + 1) % 7; d = (d + 1) % 7) {
      days.push(d);
      if (days.length > 7) break;
    }
    return days;
  }

  // Dash-separated list: "mon - wed - fri" (not a range, a list)
  const dashParts = raw.split(/\s*[-–—]\s*/);
  if (dashParts.length > 2) {
    const days: number[] = [];
    for (const part of dashParts) {
      const d = DAY_MAP[part.trim()];
      if (d === undefined) return null;
      days.push(d);
    }
    return days.length > 0 ? days : null;
  }

  // Comma/ampersand list: "mon, wed, fri" or "mon & wed"
  const parts = raw.split(/[,&]+/).map((s) => s.trim());
  if (parts.length > 1) {
    const days: number[] = [];
    for (const part of parts) {
      const d = DAY_MAP[part];
      if (d === undefined) return null;
      days.push(d);
    }
    return days;
  }

  // "Mon only" -> strip trailing "only"
  const stripped = raw.replace(/\s+only$/, "");

  // Single day
  const single = DAY_MAP[stripped];
  if (single !== undefined) return [single];

  return null;
}

/**
 * Try to extract a "StartTime - EndTime" range from a segment, ignoring extra text like
 * "(Dinner at 4)" or "breakfast" descriptions.
 */
function extractTimeRange(segment: string): { open: string; close: string } | null {
  // Remove parenthetical notes
  const cleaned = segment.replace(/\([^)]*\)/g, "").trim();

  // Match patterns like "8am - 3pm", "8:00am-3:00pm", "noon - 4pm"
  const match = cleaned.match(
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|noon|midnight)\s*[-–—]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|noon|midnight)/i
  );
  if (!match) return null;

  const open = parseTime(match[1]);
  const close = parseTime(match[2]);
  if (open && close) return { open, close };
  return null;
}

/**
 * Parse a schedule string into structured entries. Returns null if parsing fails.
 *
 * Handles formats like:
 * - "Mon - Fri: 8am - 3pm; Sat: 10am - 2pm"
 * - "7 days/week: 8:00am - 8:30am"
 * - "Mon - Wed - Fri; 8:00 - 10:00am"
 * - "365 days/year; Breakfast at 8:30am; Lunch at 11am" (partial parse)
 */
export function parseSchedule(raw: string): ScheduleEntry[] | null {
  if (!raw || !raw.trim()) return null;

  const cleaned = raw.trim();

  // 24/7 patterns
  if (/24\s*\/?\s*7/i.test(cleaned) || /always\s*open/i.test(cleaned)) {
    return [{ days: [0, 1, 2, 3, 4, 5, 6], open: "00:00", close: "23:59" }];
  }

  // Split by semicolons or newlines
  const segments = cleaned
    .split(/[;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const entries: ScheduleEntry[] = [];

  // Strategy 1: "Days: StartTime - EndTime" pattern (with optional description text)
  for (const segment of segments) {
    // "Days: time - time" or "Days: time - time (note)"
    const colonMatch = segment.match(/^(.+?):\s*(.+)$/);
    if (colonMatch) {
      const days = parseDays(colonMatch[1]);
      if (days) {
        const timeRange = extractTimeRange(colonMatch[2]);
        if (timeRange) {
          entries.push({ days, ...timeRange });
          continue;
        }
      }
    }
  }

  if (entries.length > 0) return entries;

  // Strategy 2: segments where first segment is days, second is time range
  // e.g. "Mon - Wed - Fri; 8:00 - 10:00am"
  if (segments.length >= 2) {
    const days = parseDays(segments[0]);
    if (days) {
      const timeRange = extractTimeRange(segments[1]);
      if (timeRange) {
        return [{ days, ...timeRange }];
      }
    }
  }

  // Strategy 3: "7 days/week" or "365 days/year" followed by time segments
  if (/7\s*days|365\s*days|every\s*day/i.test(segments[0])) {
    for (let i = 1; i < segments.length; i++) {
      const timeRange = extractTimeRange(segments[i]);
      if (timeRange) {
        entries.push({ days: ALL_WEEK, ...timeRange });
      }
    }
    if (entries.length > 0) return entries;
  }

  return null;
}

/**
 * Check if a service is currently open given its schedule entries and a date.
 */
export function isOpenAt(
  schedule: ScheduleEntry[] | null,
  date: Date
): boolean | null {
  if (!schedule) return null; // unknown

  const day = date.getDay();
  const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  for (const entry of schedule) {
    if (entry.days.includes(day) && time >= entry.open && time <= entry.close) {
      return true;
    }
  }
  return false;
}
