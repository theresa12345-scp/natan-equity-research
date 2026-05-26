// Finnhub earnings calendar — free 60 req/min.

export interface EarningsCalendarEvent {
  symbol: string;
  date: string;
  hour: string; // "bmo" | "amc" | "dmh"
  epsEstimate: number | null;
  revenueEstimate: number | null;
  year: number;
  quarter: number;
}

export async function fetchEarningsCalendar(
  fromIso: string,
  toIso: string,
): Promise<EarningsCalendarEvent[]> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return [];
  try {
    const url = `https://finnhub.io/api/v1/calendar/earnings?from=${fromIso}&to=${toIso}&token=${key}`;
    const res = await fetch(url, { next: { revalidate: 14400 } });
    if (!res.ok) {
      console.warn("[brief] finnhub earnings status", res.status);
      return [];
    }
    const j = (await res.json()) as { earningsCalendar?: EarningsCalendarEvent[] };
    return j.earningsCalendar ?? [];
  } catch (err) {
    console.warn("[brief] finnhub earnings failed:", (err as Error).message);
    return [];
  }
}
