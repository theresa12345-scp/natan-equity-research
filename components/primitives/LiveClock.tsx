"use client";

import { useEffect, useState } from "react";

interface LiveClockProps {
  timeZone?: string; // IANA tz, e.g. "Asia/Jakarta"
  suffix?: string; // e.g. "WIB"
  showSeconds?: boolean;
}

// Ticking clock — replaces static "14:23 WIB" timestamps. Defaults to
// Jakarta time (where the IDX user is) but accepts any IANA zone.
// Hydration-safe: renders empty on the server so the client takes over
// without a mismatch warning.
export default function LiveClock({
  timeZone = "Asia/Jakarta",
  suffix = "WIB",
  showSeconds = false,
}: LiveClockProps): JSX.Element {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(
      () => setNow(new Date()),
      showSeconds ? 1000 : 30000,
    );
    return () => clearInterval(interval);
  }, [showSeconds]);

  if (!now) {
    return (
      <span className="num" aria-label="loading clock">
        —
      </span>
    );
  }

  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    ...(showSeconds ? { second: "2-digit" } : {}),
    hour12: false,
  });
  return (
    <span className="num" suppressHydrationWarning>
      {fmt.format(now)} {suffix}
    </span>
  );
}
