// Saved Screens — curated strategy presets that load /screener with
// pre-applied filters. Each screen has a slug (URL param), a name,
// a short description, an investment-thesis paragraph, and a filter
// config that gets applied to the loadPicks() universe.

import type { PickRow } from "./picks-data";

export interface ScreenFilter {
  region?: "all" | "IDX" | "US";
  sectors?: string[];
  excludeSectors?: string[];
  minComposite?: number;
  minROE?: number;
  maxPE?: number;
  // Restrict by minimum score on a specific pillar
  minPillar?: { name: keyof PickRow["pillars"]; threshold: number };
}

export interface SavedScreen {
  slug: string;
  name: string;
  short: string;          // 1-line description for chips
  thesis: string;         // 1-2 paragraph thesis
  citation?: string;
  filter: ScreenFilter;
}

export const SAVED_SCREENS: SavedScreen[] = [
  {
    slug: "multi-factor-v21",
    name: "Multi-Factor v2.1",
    short: "Composite z ≥ +1σ · top quartile",
    thesis:
      "The canonical 8-pillar screen. Targets names whose weighted composite z-score clears +1.0σ — the top ~20% of the LQ45 + IDX80 universe by combined Quality + Profitability + Valuation + Financial Health + Low-Vol + Sentiment + Growth + Momentum (short-term reversal on IDX, Carhart 12-1 on US) + Liquidity. Calibrated per Li, Wei & Zhang (2023, PBFJ 82:102175) — momentum-excluded weights on IDX, full Carhart 4-factor on US.",
    citation: "Li, Wei & Zhang (2023), PBFJ 82:102175",
    filter: { region: "IDX", minComposite: 70 },
  },
  {
    slug: "pead-sue-top-decile",
    name: "PEAD · SUE Top Decile",
    short: "High momentum + sentiment crossover",
    thesis:
      "Post-Earnings Announcement Drift overlay: names where the Momentum pillar (short-term reversal on IDX) and Sentiment pillar both clear the 80th percentile. Captures the 60-day post-print drift documented in Ho, Le & Nguyen (2024) for Vietnam PEAD and the Bernard-Thomas (1989) US precedent. Buy-and-hold horizon T+5 to T+60.",
    citation: "Ho, Le, Nguyen (2024), Pac-Basin FJ 78 · Bernard & Thomas (1989), JF 44(2)",
    filter: { region: "IDX", minPillar: { name: "momentum", threshold: 70 } },
  },
  {
    slug: "cross-cohort-flow",
    name: "Cross-Cohort Flow",
    short: "Foreign + retail sentiment alignment",
    thesis:
      "Sentiment pillar + Profitability pillar both elevated, signalling that flows (foreign net-buy + Bahasa news tone) align with fundamentals. Filters out narrative-only chasers. KSEI Komposisi Kepemilikan Efek (Foreign Inclusion Factor) data flows into the Sentiment pillar's foreign-flow sub-input.",
    filter: { region: "IDX", minComposite: 60, minPillar: { name: "profitability", threshold: 65 } },
  },
  {
    slug: "low-vol-defensive",
    name: "Low-Vol Defensive",
    short: "Beta < 1 + top Quality",
    thesis:
      "Betting-Against-Beta (Frazzini & Pedersen 2014, JFE 111:1-25) applied with a Quality overlay (Asness, Frazzini & Pedersen 2019 QMJ). Names with Low-Vol pillar score ≥ 70 AND Quality pillar score ≥ 70. The high-quality defensive sleeve — historically a positive-Sharpe contributor through full cycles.",
    citation: "Frazzini & Pedersen (2014) · Asness-Frazzini-Pedersen (2019)",
    filter: { region: "IDX", minPillar: { name: "lowVol", threshold: 70 } },
  },
  {
    slug: "danantara-catalyst",
    name: "Danantara Catalyst",
    short: "IDX SOE banks + state-linked names",
    thesis:
      "Names exposed to the Daya Anagata Nusantara (BPI Danantara) consolidation: BMRI, BBRI, BBNI, TLKM, PGAS plus the 52-SOE perimeter held via PT Biro Klasifikasi Indonesia. Law No. 1/2025 removed the rule that SOE losses count as state losses — alters governance-risk premium. Watch policy clarity on cooperative-lending exposure.",
    filter: { region: "IDX", sectors: ["Financial", "Communications", "Utilities", "Industrial"] },
  },
  {
    slug: "energy-beta-long",
    name: "Energy Beta Long",
    short: "IDX energy + commodity cyclicals",
    thesis:
      "Cyclical commodity-beta sleeve: ADRO, BYAN, MEDC, AMMN, ANTM, PGAS, BREN. Pillar tilt: Value + Momentum. Backdrop: Newcastle thermal coal softening, Cu/Au constructive on China supply discipline, AMMN long-dated copper-gold cycle. Stress-test via Brinson-Fachler on a −20% commodity reversal scenario in /risk.",
    filter: { region: "IDX", sectors: ["Basic Materials", "Energy"] },
  },
  {
    slug: "value-trap-avoidance",
    name: "Value Trap Avoidance",
    short: "Cheap multiples that survive a Quality screen",
    thesis:
      "Cheap names that are not trapped value. Composite ≥ 60 (clear of the bottom half) AND Quality pillar ≥ 60 (above-median balance-sheet + earnings quality). Filters out the classic value-trap silhouette (low P/E, deteriorating ROE, negative revisions, foreign outflows). Inspired by Piotroski (2000, JAR 38:1-41) F-Score as a quality overlay on book-to-market.",
    citation: "Piotroski (2000), JAR 38:1-41",
    filter: { region: "IDX", minComposite: 60, minPillar: { name: "quality", threshold: 60 } },
  },
  {
    slug: "soe-bank-specifically",
    name: "SOE Bank Specifically",
    short: "BMRI · BBRI · BBNI focus list",
    thesis:
      "Indonesian state-owned banks only: BMRI, BBRI, BBNI. Cooperative-lending policy exposure is the binding risk; BRI Danareksa worst-case modelled −11% to −56% earnings hit, +49-82bp credit costs. The watchlist exists to track quarterly NIM trajectory, CASA print, loan-growth rate, and any policy clarification from the Prabowo administration.",
    citation: "BRI Danareksa Sekuritas worst-case scenario, May 2026",
    filter: { region: "IDX", sectors: ["Financial"], minComposite: 50 },
  },
];

export function findScreen(slug: string | undefined): SavedScreen {
  return SAVED_SCREENS.find((s) => s.slug === slug) ?? SAVED_SCREENS[0];
}

export function applyScreen(rows: PickRow[], filter: ScreenFilter): PickRow[] {
  return rows.filter((r) => {
    if (filter.region && filter.region !== "all" && r.region !== filter.region) return false;
    if (filter.sectors && filter.sectors.length > 0 && !filter.sectors.some((s) => r.sector === s)) return false;
    if (filter.excludeSectors && filter.excludeSectors.some((s) => r.sector === s)) return false;
    if (filter.minComposite != null && r.composite < filter.minComposite) return false;
    if (filter.minROE != null && (r.roe == null || r.roe < filter.minROE)) return false;
    if (filter.maxPE != null && r.pe != null && r.pe > filter.maxPE) return false;
    if (filter.minPillar) {
      const score = r.pillars[filter.minPillar.name];
      if (score < filter.minPillar.threshold) return false;
    }
    return true;
  });
}

export interface ScreenWithCount extends SavedScreen {
  count: number;
}

export function annotateCounts(
  screens: SavedScreen[],
  picks: PickRow[],
): ScreenWithCount[] {
  return screens.map((s) => ({ ...s, count: applyScreen(picks, s.filter).length }));
}
