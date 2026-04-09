import { NextResponse } from "next/server";
import { getAllServicesForOffline, getCrisisResources } from "@/lib/db";

export async function GET() {
  const services = getAllServicesForOffline();
  const crisisResources = getCrisisResources();

  return NextResponse.json(
    { services, crisisResources },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    }
  );
}
