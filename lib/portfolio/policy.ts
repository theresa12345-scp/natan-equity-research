// Portfolio policy + volatility estimator for the Meridian Model Portfolio.
// Pure functions — given a universe + a policy, the engine produces a set
// of target weights. No I/O, no time-series — vol is estimated from beta
// + sector idio per CAPM. When real σ history wires in (Phase 5), only
// `estimateAnnualVol` changes.

import type { UniverseRow } from "@/lib/universe-loader";

export interface PortfolioPolicy {
  name: string;
  region: "IDX" | "US";
  topN: number;
  nameCapPct: number; // hard cap per single name (e.g. 8 = 8%)
  sectorCapPct: number; // hard cap per sector (e.g. 30 = 30%)
  cashBufferPct: number; // intentional cash sleeve (e.g. 4.81 = ~5%)
  minScore: number; // floor — anything ≤ this gets zero weight
  benchmark: string;
}

export const IDX_DEFAULT_POLICY: PortfolioPolicy = {
  name: "Meridian IDX Conviction · v1",
  region: "IDX",
  topN: 28,
  nameCapPct: 8,
  sectorCapPct: 30,
  cashBufferPct: 4.81,
  minScore: 50, // grade B+ floor; below this excluded from sleeve
  benchmark: "IHSG TR",
};

// ── Volatility estimator (CAPM proxy) ────────────────────────────
// σ_i² ≈ (β_i × σ_market)² + σ_idio²
// Real σ wiring (Phase 5) replaces this with realized 252d vol.

const MARKET_VOL = { IDX: 0.18, US: 0.16 } as const;

const SECTOR_IDIO: Record<string, number> = {
  Financial: 0.14,
  Financials: 0.14,
  Energy: 0.32,
  "Basic Materials": 0.26,
  "Industrial Materials": 0.26,
  Materials: 0.26,
  Technology: 0.26,
  "Information Technology": 0.26,
  Healthcare: 0.18,
  "Health Care": 0.18,
  "Consumer Staples": 0.12,
  "Consumer Defensive": 0.12,
  "Consumer Cyclical": 0.20,
  "Consumer Discretionary": 0.20,
  Industrials: 0.18,
  "Communication Services": 0.18,
  Communications: 0.18,
  "Comm Svcs": 0.18,
  Utilities: 0.12,
  "Real Estate": 0.18,
  Infrastructure: 0.18,
};

export function estimateAnnualVol(r: UniverseRow): number {
  const sigmaM = MARKET_VOL[r.region];
  const beta = r.beta ?? 1.0;
  const sigmaIdio = SECTOR_IDIO[r.sector] ?? 0.22;
  return Math.sqrt(Math.pow(beta * sigmaM, 2) + Math.pow(sigmaIdio, 2));
}

// ── Sector-cap iterative balancer ────────────────────────────────
// Apply name cap + sector cap with redistribution. Convergent within
// ~3–5 passes for typical conviction-weighted distributions.

export interface RawWeight {
  ticker: string;
  sector: string;
  weight: number; // current normalized weight (sums to 1.0 over set)
}

export function applyCaps(
  raw: RawWeight[],
  nameCap: number,
  sectorCap: number,
  maxIterations = 8,
): RawWeight[] {
  const w = raw.map((r) => ({ ...r }));

  for (let pass = 0; pass < maxIterations; pass++) {
    let adjusted = false;

    // Name cap
    let excess = 0;
    for (const r of w) {
      if (r.weight > nameCap) {
        excess += r.weight - nameCap;
        r.weight = nameCap;
        adjusted = true;
      }
    }
    if (excess > 0) redistribute(w, excess, nameCap);

    // Sector cap
    const sectorTotals = new Map<string, number>();
    for (const r of w) {
      sectorTotals.set(r.sector, (sectorTotals.get(r.sector) ?? 0) + r.weight);
    }
    let sectorExcess = 0;
    for (const [sector, total] of sectorTotals.entries()) {
      if (total > sectorCap) {
        const scale = sectorCap / total;
        sectorExcess += total - sectorCap;
        for (const r of w) if (r.sector === sector) r.weight *= scale;
        adjusted = true;
      }
    }
    if (sectorExcess > 0) redistribute(w, sectorExcess, nameCap);

    if (!adjusted) break;
  }

  return w;
}

function redistribute(
  w: RawWeight[],
  excess: number,
  nameCap: number,
): void {
  // Distribute proportionally to names below the cap.
  const eligible = w.filter((r) => r.weight < nameCap - 0.001);
  const eligibleTotal = eligible.reduce((s, r) => s + r.weight, 0);
  if (eligibleTotal <= 0) return;
  for (const r of eligible) {
    const headroom = nameCap - r.weight;
    const share = (r.weight / eligibleTotal) * excess;
    r.weight += Math.min(share, headroom);
  }
}
