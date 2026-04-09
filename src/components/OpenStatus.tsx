"use client";

import { useEffect, useState } from "react";
import type { ScheduleEntry } from "@/types";

function isOpenNow(schedule: ScheduleEntry[]): boolean {
  const now = new Date();
  // Use Eastern time
  const est = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = est.getDay();
  const time = `${est.getHours().toString().padStart(2, "0")}:${est.getMinutes().toString().padStart(2, "0")}`;

  return schedule.some(
    (entry) =>
      entry.days.includes(day) && time >= entry.open && time <= entry.close
  );
}

export default function OpenStatus({
  scheduleStructured,
  scheduleText,
}: {
  scheduleStructured: ScheduleEntry[] | null;
  scheduleText: string | null;
}) {
  const [status, setStatus] = useState<"open" | "closed" | "unknown">(
    "unknown"
  );

  useEffect(() => {
    if (scheduleStructured) {
      setStatus(isOpenNow(scheduleStructured) ? "open" : "closed");
    }
  }, [scheduleStructured]);

  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" aria-hidden="true" />
        Open now
      </span>
    );
  }

  if (status === "closed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" aria-hidden="true" />
        Closed
      </span>
    );
  }

  if (scheduleText) {
    return null; // Schedule text will be shown separately
  }

  return (
    <span className="text-xs text-slate-400">Hours not available</span>
  );
}
