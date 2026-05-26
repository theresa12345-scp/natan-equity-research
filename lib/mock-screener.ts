export interface ScreenerRow {
  rank: number;
  ticker: string;
  emiten: string;
  sect: string;
  compZ: number;
  val: number;
  qual: number;
  prof: number;
  lvol: number;
  pead: number;
  flow: number;
  sent: number;
  cat: number;
  perf3m: number;
  mcap: number;  // trn IDR
}

export const SCREENER_ROWS: ScreenerRow[] = [
  { rank: 1, ticker: "BMRI", emiten: "Bank Mandiri", sect: "Fin", compZ: 2.41, val: 1.84, qual: 2.12, prof: 1.94, lvol: 0.42, pead: 1.42, flow: 2.18, sent: 1.64, cat: 0.84, perf3m: 1.84, mcap: 721 },
  { rank: 2, ticker: "BBCA", emiten: "Bank Central Asia", sect: "Fin", compZ: 2.18, val: -0.84, qual: 2.84, prof: 2.41, lvol: 1.84, pead: 0.84, flow: 1.42, sent: 1.21, cat: 0.62, perf3m: -4.21, mcap: 1189 },
  { rank: 3, ticker: "PGAS", emiten: "Perusahaan Gas Negara", sect: "Eng", compZ: 2.04, val: 2.41, qual: 1.21, prof: 1.42, lvol: 1.18, pead: 0.84, flow: 0.42, sent: 1.84, cat: -0.21, perf3m: 1.84, mcap: 42 },
  { rank: 4, ticker: "ADRO", emiten: "Adaro Energy", sect: "Eng", compZ: 1.92, val: 2.84, qual: 1.18, prof: 1.42, lvol: 0.84, pead: 0.62, flow: 0.21, sent: 1.42, cat: 0.21, perf3m: -2.41, mcap: 38 },
  { rank: 5, ticker: "ICBP", emiten: "Indofood CBP", sect: "CSt", compZ: 1.78, val: 0.42, qual: 2.12, prof: 1.84, lvol: 1.42, pead: 0.42, flow: 0.62, sent: 0.84, cat: 0.42, perf3m: 0.39, mcap: 96 },
  { rank: 6, ticker: "SMGR", emiten: "Semen Indonesia", sect: "BMt", compZ: 1.64, val: 2.12, qual: 1.42, prof: 0.84, lvol: 1.21, pead: 0.84, flow: -0.21, sent: 0.62, cat: 1.84, perf3m: 0.62, mcap: 28 },
  { rank: 7, ticker: "BBNI", emiten: "Bank Negara Indonesia", sect: "Fin", compZ: 1.52, val: 2.41, qual: 0.84, prof: 1.18, lvol: 0.62, pead: 0.42, flow: 0.84, sent: 0.42, cat: 0, perf3m: -2.41, mcap: 182 },
  { rank: 8, ticker: "CPIN", emiten: "Charoen Pokphand", sect: "CSt", compZ: 1.38, val: 0.84, qual: 1.42, prof: 1.84, lvol: 1.12, pead: 0.62, flow: 0.42, sent: 0.62, cat: 0.21, perf3m: 1.21, mcap: 92 },
  { rank: 9, ticker: "INTP", emiten: "Indocement Tunggal Prakarsa", sect: "BMt", compZ: 1.21, val: 1.42, qual: 1.21, prof: 0.84, lvol: 1.42, pead: 0.42, flow: -0.12, sent: 0.84, cat: 1.42, perf3m: -0.42, mcap: 26 },
  { rank: 10, ticker: "JSMR", emiten: "Jasa Marga (BUMN)", sect: "Inf", compZ: 1.18, val: 2.12, qual: 0.84, prof: 0.62, lvol: 0.42, pead: 0.62, flow: 0.42, sent: 0.42, cat: 0.84, perf3m: 0.18, mcap: 32 },
  { rank: 11, ticker: "BBRI", emiten: "Bank Rakyat Indonesia · alt", sect: "Fin", compZ: 0.94, val: 2.41, qual: 0.42, prof: 0.62, lvol: 0.42, pead: -1.42, flow: -0.84, sent: -0.62, cat: 0.21, perf3m: -8.42, mcap: 568 },
  { rank: 12, ticker: "UNVR", emiten: "Unilever Indonesia", sect: "CSt", compZ: 0.68, val: -1.84, qual: 2.84, prof: 2.41, lvol: 1.84, pead: -0.84, flow: -1.21, sent: -0.42, cat: 0.42, perf3m: -0.78, mcap: 73 },
  { rank: 13, ticker: "TLKM", emiten: "Telkom Indonesia", sect: "Tel", compZ: 0.62, val: 1.18, qual: 0.84, prof: 0.42, lvol: 0.84, pead: 0.42, flow: -0.12, sent: 0.42, cat: -0.84, perf3m: -1.21, mcap: 282 },
  { rank: 14, ticker: "ANTM", emiten: "Aneka Tambang (BUMN)", sect: "BMt", compZ: 0.58, val: 1.42, qual: 0.21, prof: 0.62, lvol: 0.84, pead: 0.42, flow: 0.18, sent: 0.62, cat: 0.42, perf3m: 0.42, mcap: 32 },
  { rank: 15, ticker: "MYOR", emiten: "Mayora Indah", sect: "CSt", compZ: 0.51, val: -0.42, qual: 1.84, prof: 1.21, lvol: 1.42, pead: 0.18, flow: 0.31, sent: 0.42, cat: -0.18, perf3m: 0.18, mcap: 63 },
  { rank: 16, ticker: "EXCL", emiten: "XL Axiata", sect: "Tel", compZ: 0.42, val: 0.84, qual: 0.62, prof: 0.42, lvol: 0.62, pead: 0.21, flow: 0.42, sent: 0.21, cat: 0.18, perf3m: 1.84, mcap: 28 },
  { rank: 17, ticker: "AALI", emiten: "Astra Agro Lestari", sect: "CSt", compZ: 0.31, val: 1.84, qual: 0.42, prof: 0.18, lvol: 0.62, pead: -0.42, flow: -0.62, sent: 0.18, cat: 0.42, perf3m: -3.21, mcap: 12 },
  { rank: 18, ticker: "BRMS", emiten: "Bumi Resources Minerals", sect: "BMt", compZ: 0.18, val: 2.41, qual: -0.84, prof: -0.42, lvol: -0.62, pead: 0.18, flow: 0.42, sent: 0.18, cat: 0.84, perf3m: 4.21, mcap: 18 },
  { rank: 19, ticker: "MEDC", emiten: "Medco Energi Int'l", sect: "Eng", compZ: 0.12, val: 1.42, qual: 0.42, prof: 0.42, lvol: 0.21, pead: -0.18, flow: -0.42, sent: 0.21, cat: -0.21, perf3m: -1.21, mcap: 14 },
  { rank: 20, ticker: "TBIG", emiten: "Tower Bersama Infrastructure", sect: "Inf", compZ: -0.04, val: 0.84, qual: 0.42, prof: 0.42, lvol: 1.21, pead: 0.21, flow: -0.42, sent: -0.42, cat: -0.62, perf3m: 0.42, mcap: 9 },
  { rank: 21, ticker: "ITMG", emiten: "Indo Tambangraya Megah", sect: "Eng", compZ: -0.21, val: 1.84, qual: 0.21, prof: 0.42, lvol: 0.42, pead: -0.84, flow: -1.21, sent: -0.42, cat: 0, perf3m: -4.84, mcap: 8 },
  { rank: 22, ticker: "EMTK", emiten: "Elang Mahkota Teknologi", sect: "Com", compZ: -0.38, val: -0.42, qual: -0.84, prof: -0.21, lvol: -0.42, pead: 0.42, flow: 0.18, sent: 0.42, cat: -0.62, perf3m: -2.41, mcap: 7 },
  { rank: 23, ticker: "BUKA", emiten: "Bukalapak.com", sect: "Com", compZ: -0.62, val: -1.42, qual: -1.84, prof: -2.41, lvol: -0.62, pead: 0.42, flow: 0.84, sent: -0.42, cat: 0.42, perf3m: 8.42, mcap: 3 },
  { rank: 24, ticker: "GOTO", emiten: "GoTo Gojek Tokopedia", sect: "Com", compZ: -0.84, val: -2.41, qual: -1.42, prof: -2.84, lvol: -0.84, pead: 0.62, flow: 1.21, sent: 0.42, cat: 0.84, perf3m: 12.84, mcap: 14 },
];

export const SCREENER_WEIGHTS = [
  { factor: "Value", wt: 0.25 },
  { factor: "Quality", wt: 0.25 },
  { factor: "Profitability", wt: 0.20 },
  { factor: "Low-Volatility", wt: 0.20 },
  { factor: "Size (SMB)", wt: 0.10 },
  { factor: "Momentum", wt: 0.00, off: true },
];

export const SCREENER_OVERLAY_WEIGHTS = [
  { factor: "PEAD · SUE", wt: 0.40 },
  { factor: "Cross-cohort Flow", wt: 0.30 },
  { factor: "Bahasa Sentiment", wt: 0.20 },
  { factor: "Catalyst", wt: 0.10 },
];
