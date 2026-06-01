// FRED St. Louis Fed fetcher. Free key required.
// Series IDs:
//   DGS10 — 10-Year Treasury (already pulled via Yahoo ^TNX too)
//   DFF   — Effective Fed Funds Rate
//   CPIAUCSL — Consumer Price Index
//   UNRATE — Unemployment Rate
//   DEXINUS — Indonesia / US FX (legacy)

export interface FREDObservation {
  date: string;
  value: number | null;
}

const BASE = "https://api.stlouisfed.org/fred/series/observations";

export async function fetchFREDSeries(
  seriesId: string,
  limit: number = 2,
): Promise<FREDObservation[]> {
  const key = process.env.FRED_API_KEY;
  if (!key) {
    return [];
  }
  try {
    const url = `${BASE}?series_id=${seriesId}&api_key=${key}&file_type=json&limit=${limit}&sort_order=desc`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let res: Response;
    try {
      res = await fetch(url, { next: { revalidate: 21600 }, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
    if (!res.ok) {
      console.warn(`[brief] FRED ${seriesId} status ${res.status}`);
      return [];
    }
    const j = (await res.json()) as { observations?: { date: string; value: string }[] };
    return (j.observations ?? []).map((o) => ({
      date: o.date,
      value: o.value === "." ? null : parseFloat(o.value),
    }));
  } catch (err) {
    console.warn(`[brief] FRED ${seriesId} failed:`, (err as Error).message);
    return [];
  }
}

export async function fetchFedFunds(): Promise<{ value: number; delta: number } | null> {
  const obs = await fetchFREDSeries("DFF", 5);
  if (obs.length < 2 || obs[0].value === null || obs[1].value === null) return null;
  return {
    value: obs[0].value,
    delta: obs[0].value - obs[1].value,
  };
}
