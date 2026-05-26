// Daily Morning Brief data — modeled on Apollo Daily Spark (1 chart +
// one paragraph) + BRI Danareksa Equity Snapshot (idea of day + sector
// summary + macro). Synthetic but coherent.

export const BRIEF_META = {
  date: "2026-05-26",
  jktTime: "06:30 WIB",
  estTime: "19:30 EDT prev",
  author: "Meridian Research · auto-compiled",
  edition: "Tuesday Edition · No. 412",
};

export const BRIEF_CHART_OF_DAY = {
  headline: "S&P 500 mega-cap AI cluster now drives 65–75% of YTD index returns",
  takeaway:
    "JPM Cembalest (EOTM '26): 42 GenAI-linked names account for the bulk of S&P returns, profits, and capex since ChatGPT launch. Strip them out and the S&P would have underperformed Europe, Japan, China. The composite's Valuation pillar is doing its job — penalising the cluster despite Quality/Profitability at max.",
  sourceLabel: "JPM EOTM 2026 · Bloomberg index decomposition · Meridian composite",
  // Sparkline-like contribution data (mega7 vs broader 493)
  series: [
    { label: "Mega-7 AI", value: 72, color: "#ff2e88" },
    { label: "Other 493", value: 28, color: "#7a7a7a" },
  ],
};

export const OVERNIGHT_WRAP = [
  { label: "S&P 500", value: "5,842", delta: "+0.42%", tone: "pos" as const },
  { label: "NASDAQ", value: "18,624", delta: "+0.68%", tone: "pos" as const },
  { label: "VIX", value: "14.2", delta: "−2.1%", tone: "pos" as const },
  { label: "UST 10Y", value: "4.50%", delta: "−2bp", tone: "pos" as const },
  { label: "DXY", value: "104.8", delta: "−0.18%", tone: "pos" as const },
  { label: "WTI Crude", value: "$72.40", delta: "+1.21%", tone: "pos" as const },
  { label: "Gold", value: "$2,684", delta: "+0.42%", tone: "pos" as const },
  { label: "USD/IDR", value: "17,742", delta: "+0.21%", tone: "neg" as const },
];

export const IDEA_OF_DAY = {
  ticker: "BBCA",
  exchange: "IDX",
  title: "BBCA · BUY conviction holds on BI dovish-pivot path",
  composite: 2.18,
  prose:
    "BCA composite +2.18σ unchanged WoW. BI-Rate trajectory now pricing 50bp cuts H2'26 per OIS curve; CASA franchise at 81.4% positions BCA as the cleanest beneficiary on NIM lag-down profile. Quality pillar at 94/100 with bootstrap CI tight. Watchpoint: P/BV at 4.62× vs ASEAN bank median 1.4× — premium structural but multi-quarter compression risk if BBRI re-rates first.",
  pillars: [
    { name: "Quality", score: 94 },
    { name: "Profitability", score: 91 },
    { name: "Liquidity", score: 96 },
  ],
};

export const TODAYS_CATALYSTS = [
  { time: "09:30 WIB", region: "IDX", event: "BBNI 1H earnings call", impact: "high" as const, note: "watch NIM trajectory + cooperative-lending exposure" },
  { time: "10:00 WIB", region: "IDX", event: "BPS CPI · April print", impact: "high" as const, note: "consensus 2.84% YoY · BI-Rate path-dependent" },
  { time: "13:00 WIB", region: "ASIA", event: "MSCI quarterly review preview", impact: "medium" as const, note: "Indonesia FIF watch — see Jan 2026 7% drop precedent" },
  { time: "14:30 EDT", region: "US", event: "PCE deflator · April", impact: "high" as const, note: "core PCE consensus +0.21% MoM · Fed reaction function pivot" },
  { time: "16:00 EDT", region: "US", event: "NVDA earnings (FY26 Q1, AMC)", impact: "high" as const, note: "Blackwell yield commentary + China-export framing" },
  { time: "16:30 EDT", region: "US", event: "AVGO custom-silicon update", impact: "medium" as const, note: "ASIC market-share read-through to NVDA" },
];

export const WATCHLIST_MOVERS = [
  { ticker: "BREN", name: "Barito Renewables", change: 4.81, region: "IDX" as const, note: "intraday breakout +2.4× ADTV" },
  { ticker: "AMMN", name: "Amman Mineral", change: 2.43, region: "IDX" as const, note: "copper futures tailwind" },
  { ticker: "PGAS", name: "Perusahaan Gas Negara", change: 1.84, region: "IDX" as const, note: "policy chatter on retail gas tariffs" },
  { ticker: "BBRI", name: "Bank Rakyat Indonesia", change: -0.53, region: "IDX" as const, note: "foreign net sell Rp 412mrd 5d" },
  { ticker: "ADRO", name: "Adaro Energy", change: -0.42, region: "IDX" as const, note: "Newcastle thermal coal soft" },
];

export const SECTOR_RUNDOWN = [
  { sector: "Financials", idx: 1.82, us: 0.42, note: "Bank steepener trade — IDX private banks lead" },
  { sector: "Energy", idx: 3.42, us: 1.21, note: "Brent +1.2%, IDX coal/gas catching" },
  { sector: "Basic Materials", idx: 2.84, us: -0.42, note: "AMMN/ANTM strong on Cu/Au" },
  { sector: "Tech", idx: 4.21, us: 0.68, note: "Indonesia tech narrow (GOTO/BUKA) · US Mag-7 narrow" },
  { sector: "Cons Staples", idx: 0.42, us: -0.18, note: "Defensive bid soft pre-PCE" },
  { sector: "Industrials", idx: -1.21, us: 0.21, note: "ASII drag on auto inventories" },
  { sector: "Real Estate", idx: -1.84, us: -0.84, note: "Rate sensitivity asymmetric to dovish surprise" },
  { sector: "Utilities", idx: 1.21, us: -0.21, note: "PGEO + POWR · regulated-utility bid" },
  { sector: "Comm Svcs", idx: -2.18, us: 0.32, note: "TLKM weak · META/GOOGL steady" },
  { sector: "Cons Disc", idx: 0.84, us: 0.18, note: "Watching MAPI / ACES for retail-mix read" },
  { sector: "Health Care", idx: -0.42, us: -0.32, note: "KLBF flat · UNH overhang" },
];

export const MACRO_DRIVERS = [
  { label: "BI-Rate path", desc: "OIS pricing 50bp of cuts into H2'26; BCA NIM-lag positive" },
  { label: "USD/IDR", desc: "17,742 · trading in 17,500–17,800 box · IDR convergence trade quiet" },
  { label: "Fed reaction function", desc: "Core PCE +0.21% MoM consensus; Sep '26 cut prob @ 64%" },
  { label: "MSCI Indonesia", desc: "Jan 2026 review left FIF frozen; May review preview pending" },
  { label: "China supply / commodities", desc: "Cu/Au constructive · NEW thermal coal softening" },
];

export interface FlowItem {
  label: string;
  value: string;
  tone: "pos" | "neg" | "neutral";
}

export const SIDEBAR_FLOWS: FlowItem[] = [
  { label: "IDX foreign net 5d", value: "+Rp 412 mrd", tone: "pos" },
  { label: "LQ45 ADV 5d", value: "Rp 12.4 trn", tone: "neutral" },
  { label: "US ETF flows 5d (QQQ)", value: "+$8.2 bn", tone: "pos" },
  { label: "BofA BBI (proxy)", value: "5.4 / 10", tone: "neutral" },
  { label: "Bull-Bear ratio (II)", value: "1.84", tone: "pos" },
  { label: "BBCA short interest", value: "0.4%", tone: "neutral" },
];
