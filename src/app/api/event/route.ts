import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import { resolve } from "path";

const DB_PATH = resolve(process.cwd(), "betterburgh.db");

const VALID_EVENT_TYPES = new Set([
  "search",
  "view_service",
  "call",
  "filter",
  "view_crisis",
  "map_open",
  "page_view",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { eventType, eventData, sessionId, locale, referrer } = body;

    if (!eventType || !VALID_EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 100) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const db = new Database(DB_PATH);
    db.prepare(
      `INSERT INTO events (timestamp, event_type, event_data, session_id, locale, referrer)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      new Date().toISOString(),
      eventType,
      eventData ? JSON.stringify(eventData) : null,
      sessionId,
      locale || null,
      referrer || null
    );
    db.close();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
