import { NextResponse } from "next/server";
import { existsSync, readdirSync } from "fs";
import { resolve, join } from "path";

export async function GET() {
  const cwd = process.cwd();
  const dirname = __dirname;

  const candidates = [
    resolve(cwd, "betterburgh.db"),
    join(dirname, "betterburgh.db"),
    join(dirname, "..", "betterburgh.db"),
    join(dirname, "..", "..", "betterburgh.db"),
    join(dirname, "..", "..", "..", "betterburgh.db"),
    join(dirname, "..", "..", "..", "..", "betterburgh.db"),
    "/var/task/betterburgh.db",
    "/var/task/.next/server/betterburgh.db",
  ];

  const results = candidates.map((p) => ({
    path: p,
    exists: existsSync(p),
  }));

  // List files in cwd and dirname
  let cwdFiles: string[] = [];
  let dirnameFiles: string[] = [];
  try {
    cwdFiles = readdirSync(cwd).slice(0, 30);
  } catch { /* empty */ }
  try {
    dirnameFiles = readdirSync(dirname).slice(0, 30);
  } catch { /* empty */ }

  return NextResponse.json({
    cwd,
    dirname,
    candidates: results,
    cwdFiles,
    dirnameFiles,
  });
}
