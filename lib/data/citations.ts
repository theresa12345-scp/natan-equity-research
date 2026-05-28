// Academic citations backing every factor / screen / methodology choice.
// Pulled from §4 of the Free Edge Sources Playbook (May 28 2026).
// Every score, screen, or attribution should reference one of these.

export type CiteCategory = "factor" | "methodology" | "data" | "regime";

export interface Citation {
  id: string;
  authors: string;
  year: number;
  title: string;
  venue: string;
  url?: string;
  keyFinding: string;
  appliesTo: string[]; // app concept tags the citation justifies
  category: CiteCategory;
}

export const CITATIONS: Citation[] = [
  // ── Factor library ─────────────────────────────────────────────
  {
    id: "fama-french-1993",
    authors: "Fama, E. F. & French, K. R.",
    year: 1993,
    title: "Common risk factors in the returns on stocks and bonds",
    venue: "Journal of Financial Economics 33(1): 3–56",
    url: "https://www.sciencedirect.com/science/article/pii/0304405X93900235",
    keyFinding:
      "Three-factor model (Mkt, SMB, HML) explains the cross-section of equity returns. Foundation of modern factor investing.",
    appliesTo: ["Valuation pillar", "factor regression", "/backtest attribution"],
    category: "factor",
  },
  {
    id: "fama-french-2015",
    authors: "Fama, E. F. & French, K. R.",
    year: 2015,
    title: "A five-factor asset pricing model",
    venue: "Journal of Financial Economics 116(1): 1–22",
    keyFinding:
      "FF5 adds Profitability (RMW) and Investment (CMA) to FF3. RMW absorbs much of HML in US.",
    appliesTo: ["Profitability pillar", "Quality pillar", "factor framework"],
    category: "factor",
  },
  {
    id: "carhart-1997",
    authors: "Carhart, M. M.",
    year: 1997,
    title: "On persistence in mutual fund performance",
    venue: "Journal of Finance 52(1): 57–82",
    keyFinding:
      "Adds 12-1 momentum to FF3. Foundation for the US Momentum pillar in this app.",
    appliesTo: ["Momentum pillar (US)", "US factor framework"],
    category: "factor",
  },
  {
    id: "novy-marx-2013",
    authors: "Novy-Marx, R.",
    year: 2013,
    title: "The other side of value: The gross profitability premium",
    venue: "Journal of Financial Economics 108(1): 1–28",
    url: "https://www.nber.org/papers/w15940",
    keyFinding:
      "Gross profits / total assets has roughly the same power as B/M in predicting cross-section. Quality factor canonical implementation.",
    appliesTo: ["Profitability pillar", "Quality screen", "gross-margin tilt"],
    category: "factor",
  },
  {
    id: "frazzini-pedersen-2014",
    authors: "Frazzini, A. & Pedersen, L. H.",
    year: 2014,
    title: "Betting against beta",
    venue: "Journal of Financial Economics 111(1): 1–25",
    keyFinding:
      "Long low-beta, short high-beta delivers significant alpha. Low-Vol pillar foundation.",
    appliesTo: ["Low-Vol pillar", "risk parity", "BAB overlay"],
    category: "factor",
  },
  {
    id: "piotroski-2000",
    authors: "Piotroski, J. D.",
    year: 2000,
    title:
      "Value investing: The use of historical financial statement information to separate winners from losers",
    venue: "Journal of Accounting Research 38: 1–41",
    keyFinding:
      "F-score 8–9 long / 0–1 short returned 23.0%/yr above market 1976–1996. Long-only high-F-score on cheap universe earned 13.4% mean market-adjusted return vs 5.9% for full high-B/M portfolio. Works best small-/mid-cap.",
    appliesTo: ["Financial Health pillar", "Piotroski F-Score screen", "/screener"],
    category: "factor",
  },
  {
    id: "jegadeesh-titman-1993",
    authors: "Jegadeesh, N. & Titman, S.",
    year: 1993,
    title: "Returns to buying winners and selling losers",
    venue: "Journal of Finance 48(1): 65–91",
    keyFinding: "3–12mo momentum delivers significant returns; canonical 12-1 specification with last-month skip.",
    appliesTo: ["Momentum pillar", "/picks ranking"],
    category: "factor",
  },
  {
    id: "sloan-1996",
    authors: "Sloan, R. G.",
    year: 1996,
    title:
      "Do stock prices fully reflect information in accruals and cash flows about future earnings?",
    venue: "Accounting Review 71(3): 289–315",
    keyFinding:
      "High accruals (NI − CFO) / Avg assets predict negative future returns. Quality-of-earnings filter.",
    appliesTo: ["Quality pillar accruals check", "earnings-quality screen"],
    category: "factor",
  },
  {
    id: "beneish-1999",
    authors: "Beneish, M. D.",
    year: 1999,
    title: "The detection of earnings manipulation",
    venue: "Financial Analysts Journal 55(5): 24–36",
    keyFinding: "Eight-variable M-Score flags earnings manipulation candidates.",
    appliesTo: ["Quality pillar", "fraud / red-flag overlay"],
    category: "factor",
  },
  {
    id: "bernard-thomas-1989",
    authors: "Bernard, V. L. & Thomas, J. K.",
    year: 1989,
    title: "Post-earnings-announcement drift",
    venue: "Journal of Accounting Research 27: 1–36",
    keyFinding:
      "SUE-ranked decile spread persists 60+ days after earnings. PEAD anomaly canonical.",
    appliesTo: ["PEAD overlay", "Daily Brief catalyst integration"],
    category: "factor",
  },
  {
    id: "cohen-malloy-pomorski-2012",
    authors: "Cohen, L., Malloy, C. & Pomorski, L.",
    year: 2012,
    title: "Decoding inside information",
    venue: "Journal of Finance 67(3): 1009–1043",
    keyFinding:
      "'Opportunistic' insiders (irregular traders) outperform routine sellers. Foundation for filtering Form 4 cluster signal.",
    appliesTo: ["/flow Form 4 cluster", "SMC insider component"],
    category: "factor",
  },
  {
    id: "cohen-frazzini-malloy-2010",
    authors: "Cohen, L., Frazzini, A. & Malloy, C.",
    year: 2010,
    title: "Sell-side school ties",
    venue: "Journal of Finance",
    keyFinding:
      "Top managers' best ideas (overweights) beat their full portfolios. Justifies 13F-clone strategies.",
    appliesTo: ["/flow 13F heatmap", "SMC institutional component"],
    category: "factor",
  },

  // ── Indonesia / IDX specific ───────────────────────────────────
  {
    id: "li-wei-zhang-2023",
    authors: "Li, J., Wei, K. C. J. & Zhang, J.",
    year: 2023,
    title: "Anomalies in Indonesian equity returns: A Bayesian study of 152 factors",
    venue: "Pacific-Basin Finance Journal 82, Article 102175",
    keyFinding:
      "On IDX, momentum is NOT priced; 5-factor with momentum-excluded is the validated framework. Drives the IDX scoring model.",
    appliesTo: ["IDX factor framework", "BBCA/MYOR pillars", "IDX universe scoring"],
    category: "factor",
  },

  // ── Methodology & quality ──────────────────────────────────────
  {
    id: "lopez-de-prado-2018",
    authors: "López de Prado, M.",
    year: 2018,
    title: "Advances in financial machine learning",
    venue: "Wiley · Ch. 12 (CPCV)",
    keyFinding:
      "Combinatorial Purged Cross-Validation prevents leakage in finance backtests where samples overlap.",
    appliesTo: ["/research CPCV", "/backtest validation"],
    category: "methodology",
  },
  {
    id: "bailey-lopez-de-prado-2014",
    authors: "Bailey, D. H. & López de Prado, M.",
    year: 2014,
    title: "The deflated Sharpe ratio",
    venue: "Journal of Portfolio Management 40(5): 94–107",
    keyFinding:
      "DSR adjusts Sharpe for multiple-testing across N trials; required when reporting Sharpe from a backtest pipeline.",
    appliesTo: ["/backtest DSR", "Audit module"],
    category: "methodology",
  },
  {
    id: "bailey-borwein-lopez-de-prado-zhu-2017",
    authors: "Bailey, D. H., Borwein, J. M., López de Prado, M. & Zhu, Q. J.",
    year: 2017,
    title: "The probability of backtest overfitting",
    venue: "Journal of Computational Finance 20(4): 39–69",
    keyFinding: "PBO quantifies likelihood that an in-sample Sharpe collapses out-of-sample.",
    appliesTo: ["/backtest PBO", "Bias controls"],
    category: "methodology",
  },
  {
    id: "asness-frazzini-pedersen-2019",
    authors: "Asness, C. S., Frazzini, A. & Pedersen, L. H.",
    year: 2019,
    title: "Quality minus junk",
    venue: "Review of Accounting Studies 24(1): 34–112",
    keyFinding:
      "QMJ as a multi-dimensional quality composite (profitability + growth + safety + payout) delivers Sharpe ~0.9 over 1986–2016.",
    appliesTo: ["Quality pillar composite", "QMJ overlay"],
    category: "factor",
  },
  {
    id: "hou-xue-zhang-2015",
    authors: "Hou, K., Xue, C. & Zhang, L.",
    year: 2015,
    title: "Digesting anomalies: An investment approach",
    venue: "Review of Financial Studies 28(3): 650–705",
    keyFinding: "q-factor model (Mkt, ME, I/A, ROE) — alternative to FF5; ROE absorbs FF5 RMW.",
    appliesTo: ["alternate factor framework", "Audit module"],
    category: "factor",
  },

  // ── Data sources (not academic but canonical) ──────────────────
  {
    id: "damodaran-ctryprem",
    authors: "Damodaran, A.",
    year: 2026,
    title: "Country risk premiums + industry data update",
    venue: "NYU Stern · annual update (Spring)",
    url: "https://pages.stern.nyu.edu/~adamodar/",
    keyFinding:
      "Industry betas, ERPs by country, cost of capital by industry. 2025 update covered 47,810 firms / 94 industries.",
    appliesTo: ["DCF CAPM cards", "country risk premium", "/risk module"],
    category: "data",
  },
  {
    id: "mauboussin-moat",
    authors: "Mauboussin, M. J. & Callahan, D.",
    year: 2024,
    title: "Measuring the moat: Assessing the magnitude and sustainability of value creation",
    venue: "Counterpoint Global Insights · Morgan Stanley IM",
    keyFinding:
      "ROIC for US-listed NYSE/NASDAQ/NYSE American firms 2013–2023 reverts substantially toward the mean; ROIC as a quality factor with a forecastable decay curve.",
    appliesTo: ["Moat / Quality pillar", "ROIC mean-reversion in DCF", "Comps prose"],
    category: "data",
  },
  {
    id: "shiller-cape",
    authors: "Shiller, R. J.",
    year: 1981,
    title: "Do stock prices move too much to be justified by subsequent changes in dividends?",
    venue: "American Economic Review 71(3): 421–436",
    keyFinding:
      "CAPE (10y real-earnings PE) as long-horizon valuation regime gauge. Series back to 1871.",
    appliesTo: ["regime model", "Brief macro drivers"],
    category: "regime",
  },
];

// Lookup helpers
export function citation(id: string): Citation | undefined {
  return CITATIONS.find((c) => c.id === id);
}

export function citationsFor(tag: string): Citation[] {
  return CITATIONS.filter((c) =>
    c.appliesTo.some((a) => a.toLowerCase().includes(tag.toLowerCase())),
  );
}

export function citationShortForm(c: Citation): string {
  // e.g. "Piotroski (2000), JAR 38: 1–41"
  return `${c.authors.split(",")[0].split(" ").pop()} (${c.year})`;
}

export const CITE_CATEGORY_LABELS: Record<CiteCategory, string> = {
  factor: "Factor evidence — what actually paid 30+ years",
  methodology: "Methodology — CPCV / DSR / PBO controls",
  data: "Data sources — Damodaran, Mauboussin",
  regime: "Regime — CAPE, macro context",
};
