import type { Position13F } from "../types";

// Deterministic 13F-HR stub for 20 tracked institutions × 25 most-held
// tickers in their Q1 2026 filing (deadline 2026-05-15). QoQ deltas
// computed against the Q4 2025 baseline. CUSIPs left as null in the
// stub — real impl resolves via OpenFIGI in Checkpoint 1.B.

const Q1 = "2026Q1";
const F1 = "2026-05-15"; // standard Q1 13F-HR filing deadline

interface Stub {
  ticker: string;
  managerCik: string;
  managerName: string;
  shares: number;
  valueUsd: number;
  pctPortfolio: number;
  sharesChangeQoQ: number | null; // null = brand-new position
  isNew?: boolean;
  isExit?: boolean;
}

function expand(rows: Stub[]): Position13F[] {
  return rows.map((r) => ({
    ticker: r.ticker,
    cusip: "",
    managerCik: r.managerCik,
    managerName: r.managerName,
    period: Q1,
    filingDate: F1,
    shares: r.shares,
    valueUsd: r.valueUsd,
    pctPortfolio: r.pctPortfolio,
    sharesChangeQoQ: r.sharesChangeQoQ,
    valueChangeQoQUsd:
      r.sharesChangeQoQ != null
        ? r.sharesChangeQoQ * (r.valueUsd / r.shares)
        : null,
    isNew: r.isNew ?? false,
    isExit: r.isExit ?? false,
  }));
}

export const THIRTEEN_F_STUB: Position13F[] = expand([
  // ── Berkshire ──
  { ticker: "AAPL",  managerCik: "1067983", managerName: "Berkshire Hathaway", shares: 905_560_000, valueUsd: 178_300_000_000, pctPortfolio: 47.2, sharesChangeQoQ: -10_000_000 },
  { ticker: "BAC",   managerCik: "1067983", managerName: "Berkshire Hathaway", shares: 682_000_000, valueUsd:  28_780_000_000, pctPortfolio:  7.6, sharesChangeQoQ:  0 },
  { ticker: "AXP",   managerCik: "1067983", managerName: "Berkshire Hathaway", shares: 151_610_000, valueUsd:  28_240_000_000, pctPortfolio:  7.5, sharesChangeQoQ:  0 },
  { ticker: "KO",    managerCik: "1067983", managerName: "Berkshire Hathaway", shares: 400_000_000, valueUsd:  25_180_000_000, pctPortfolio:  6.7, sharesChangeQoQ:  0 },
  { ticker: "CVX",   managerCik: "1067983", managerName: "Berkshire Hathaway", shares: 118_610_000, valueUsd:  17_400_000_000, pctPortfolio:  4.6, sharesChangeQoQ:  -8_000_000 },
  { ticker: "OXY",   managerCik: "1067983", managerName: "Berkshire Hathaway", shares: 264_180_000, valueUsd:  14_120_000_000, pctPortfolio:  3.7, sharesChangeQoQ:  +12_000_000 },
  // ── Pershing Square ──
  { ticker: "HLT",   managerCik: "1336528", managerName: "Pershing Square Capital", shares:  10_400_000, valueUsd:  2_840_000_000, pctPortfolio: 17.4, sharesChangeQoQ:  +400_000 },
  { ticker: "CMG",   managerCik: "1336528", managerName: "Pershing Square Capital", shares:   3_800_000, valueUsd:  2_280_000_000, pctPortfolio: 14.2, sharesChangeQoQ:  +200_000 },
  { ticker: "ALPHA", managerCik: "1336528", managerName: "Pershing Square Capital", shares:   8_200_000, valueUsd:  1_840_000_000, pctPortfolio: 11.4, sharesChangeQoQ:  null, isNew: true },
  // ── Third Point ──
  { ticker: "META",  managerCik: "1040273", managerName: "Third Point", shares: 2_400_000, valueUsd: 1_498_000_000, pctPortfolio:  9.8, sharesChangeQoQ:  +400_000 },
  { ticker: "GOOGL", managerCik: "1040273", managerName: "Third Point", shares: 4_200_000, valueUsd:   774_000_000, pctPortfolio:  5.1, sharesChangeQoQ:  +1_200_000 },
  { ticker: "DIS",   managerCik: "1040273", managerName: "Third Point", shares: 3_400_000, valueUsd:   382_000_000, pctPortfolio:  2.5, sharesChangeQoQ:  -800_000 },
  // ── Appaloosa ──
  { ticker: "BABA",  managerCik: "1656456", managerName: "Appaloosa Management", shares:  4_800_000, valueUsd:    482_000_000, pctPortfolio:  9.4, sharesChangeQoQ:  +600_000 },
  { ticker: "NVDA",  managerCik: "1656456", managerName: "Appaloosa Management", shares:  1_200_000, valueUsd:    194_000_000, pctPortfolio:  3.8, sharesChangeQoQ:  null, isNew: true },
  // ── Greenlight (Einhorn) ──
  { ticker: "GRBK",  managerCik: "1079114", managerName: "Greenlight Capital", shares:  5_200_000, valueUsd:    321_000_000, pctPortfolio: 22.4, sharesChangeQoQ:  +200_000 },
  { ticker: "CC",    managerCik: "1079114", managerName: "Greenlight Capital", shares:  8_400_000, valueUsd:    248_000_000, pctPortfolio: 17.3, sharesChangeQoQ:  0 },
  // ── Baupost ──
  { ticker: "LBRDA", managerCik: "1061165", managerName: "Baupost Group", shares: 12_400_000, valueUsd:   898_000_000, pctPortfolio: 12.4, sharesChangeQoQ:  +800_000 },
  { ticker: "VRSK",  managerCik: "1061165", managerName: "Baupost Group", shares:  3_800_000, valueUsd:   1_120_000_000, pctPortfolio: 15.4, sharesChangeQoQ:  +400_000 },
  // ── Tiger Global ──
  { ticker: "META",  managerCik: "1167483", managerName: "Tiger Global Management", shares:  4_200_000, valueUsd:  2_624_000_000, pctPortfolio: 14.2, sharesChangeQoQ:  +1_400_000 },
  { ticker: "GOOGL", managerCik: "1167483", managerName: "Tiger Global Management", shares:  8_400_000, valueUsd:  1_548_000_000, pctPortfolio:  8.4, sharesChangeQoQ:  +2_400_000 },
  { ticker: "NVDA",  managerCik: "1167483", managerName: "Tiger Global Management", shares:  9_200_000, valueUsd:  1_492_000_000, pctPortfolio:  8.1, sharesChangeQoQ:  +1_800_000 },
  { ticker: "SE",    managerCik: "1167483", managerName: "Tiger Global Management", shares: 18_400_000, valueUsd:    882_000_000, pctPortfolio:  4.8, sharesChangeQoQ:  +2_400_000 },
  { ticker: "SPOT",  managerCik: "1167483", managerName: "Tiger Global Management", shares:  2_400_000, valueUsd:    948_000_000, pctPortfolio:  5.1, sharesChangeQoQ:  null, isNew: true },
  // ── Coatue ──
  { ticker: "META",  managerCik: "1135730", managerName: "Coatue Management", shares: 3_400_000, valueUsd:  2_124_000_000, pctPortfolio:  9.8, sharesChangeQoQ:  +800_000 },
  { ticker: "NVDA",  managerCik: "1135730", managerName: "Coatue Management", shares: 7_200_000, valueUsd:  1_168_000_000, pctPortfolio:  5.4, sharesChangeQoQ:  +400_000 },
  { ticker: "TSM",   managerCik: "1135730", managerName: "Coatue Management", shares: 4_200_000, valueUsd:    824_000_000, pctPortfolio:  3.8, sharesChangeQoQ:  null, isNew: true },
  // ── D1 Capital ──
  { ticker: "MSFT",  managerCik: "1771602", managerName: "D1 Capital Partners", shares: 2_800_000, valueUsd:  1_184_000_000, pctPortfolio: 11.4, sharesChangeQoQ:  +200_000 },
  { ticker: "ANET",  managerCik: "1771602", managerName: "D1 Capital Partners", shares: 1_800_000, valueUsd:    624_000_000, pctPortfolio:  6.0, sharesChangeQoQ:  +400_000 },
  // ── Lone Pine ──
  { ticker: "MSFT",  managerCik: "1061768", managerName: "Lone Pine Capital", shares: 4_400_000, valueUsd:  1_864_000_000, pctPortfolio:  9.8, sharesChangeQoQ:  +400_000 },
  { ticker: "META",  managerCik: "1061768", managerName: "Lone Pine Capital", shares: 2_200_000, valueUsd:  1_374_000_000, pctPortfolio:  7.2, sharesChangeQoQ:  +200_000 },
  // ── Viking Global ──
  { ticker: "GOOGL", managerCik: "1103804", managerName: "Viking Global Investors", shares: 8_400_000, valueUsd:  1_548_000_000, pctPortfolio:  3.9, sharesChangeQoQ:  +1_200_000 },
  { ticker: "MSFT",  managerCik: "1103804", managerName: "Viking Global Investors", shares: 3_800_000, valueUsd:  1_612_000_000, pctPortfolio:  4.0, sharesChangeQoQ:  +200_000 },
  { ticker: "AMZN",  managerCik: "1103804", managerName: "Viking Global Investors", shares: 4_400_000, valueUsd:    824_000_000, pctPortfolio:  2.1, sharesChangeQoQ:  -200_000 },
  // ── Maverick ──
  { ticker: "AMZN",  managerCik: "1003830", managerName: "Maverick Capital", shares: 2_800_000, valueUsd:    524_000_000, pctPortfolio:  5.8, sharesChangeQoQ:  +200_000 },
  { ticker: "TSM",   managerCik: "1003830", managerName: "Maverick Capital", shares: 1_800_000, valueUsd:    354_000_000, pctPortfolio:  3.9, sharesChangeQoQ:  +200_000 },
  // ── ValueAct ──
  { ticker: "DIS",   managerCik: "1180174", managerName: "ValueAct Capital", shares:  6_400_000, valueUsd:    724_000_000, pctPortfolio:  9.4, sharesChangeQoQ:  +400_000 },
  { ticker: "INSP",  managerCik: "1180174", managerName: "ValueAct Capital", shares:  3_400_000, valueUsd:    624_000_000, pctPortfolio:  8.2, sharesChangeQoQ:  +200_000 },
  // ── Elliott ──
  { ticker: "SU",    managerCik: "1791786", managerName: "Elliott Investment Mgmt", shares:  18_400_000, valueUsd:    824_000_000, pctPortfolio:  4.2, sharesChangeQoQ:  +1_400_000 },
  { ticker: "WBA",   managerCik: "1791786", managerName: "Elliott Investment Mgmt", shares:  24_000_000, valueUsd:    284_000_000, pctPortfolio:  1.4, sharesChangeQoQ:  null, isNew: true },
  // ── Icahn ──
  { ticker: "CZR",   managerCik: "0921669", managerName: "Icahn Enterprises", shares:  16_400_000, valueUsd:    784_000_000, pctPortfolio: 12.4, sharesChangeQoQ:  +400_000 },
  // ── Soros ──
  { ticker: "TSM",   managerCik: "1029160", managerName: "Soros Fund Management", shares: 1_400_000, valueUsd:    274_000_000, pctPortfolio:  4.8, sharesChangeQoQ:  +200_000 },
  { ticker: "NVDA",  managerCik: "1029160", managerName: "Soros Fund Management", shares: 1_200_000, valueUsd:    194_000_000, pctPortfolio:  3.4, sharesChangeQoQ:  +200_000 },
  // ── Bridgewater ──
  { ticker: "SPY",   managerCik: "1350694", managerName: "Bridgewater Associates", shares: 4_400_000, valueUsd:  2_576_000_000, pctPortfolio: 17.4, sharesChangeQoQ:  +200_000 },
  { ticker: "WMT",   managerCik: "1350694", managerName: "Bridgewater Associates", shares: 6_400_000, valueUsd:    624_000_000, pctPortfolio:  4.2, sharesChangeQoQ:  +400_000 },
  { ticker: "PG",    managerCik: "1350694", managerName: "Bridgewater Associates", shares: 4_400_000, valueUsd:    782_000_000, pctPortfolio:  5.3, sharesChangeQoQ:  +200_000 },
  { ticker: "KO",    managerCik: "1350694", managerName: "Bridgewater Associates", shares: 8_400_000, valueUsd:    528_000_000, pctPortfolio:  3.6, sharesChangeQoQ:  +400_000 },
  // ── Citadel Advisors ──
  { ticker: "NVDA",  managerCik: "1423053", managerName: "Citadel Advisors", shares: 22_400_000, valueUsd:  3_628_000_000, pctPortfolio:  4.2, sharesChangeQoQ:  +4_400_000 },
  { ticker: "AMZN",  managerCik: "1423053", managerName: "Citadel Advisors", shares: 14_400_000, valueUsd:  2_684_000_000, pctPortfolio:  3.1, sharesChangeQoQ:  +2_400_000 },
  { ticker: "MSFT",  managerCik: "1423053", managerName: "Citadel Advisors", shares:  6_400_000, valueUsd:  2_716_000_000, pctPortfolio:  3.1, sharesChangeQoQ:  -800_000 },
  // ── Renaissance ──
  { ticker: "NVDA",  managerCik: "1037389", managerName: "Renaissance Technologies", shares:  9_400_000, valueUsd:  1_524_000_000, pctPortfolio:  1.4, sharesChangeQoQ:  -1_200_000 },
  { ticker: "META",  managerCik: "1037389", managerName: "Renaissance Technologies", shares:  3_400_000, valueUsd:  2_124_000_000, pctPortfolio:  2.0, sharesChangeQoQ:  +400_000 },
  { ticker: "VRTX",  managerCik: "1037389", managerName: "Renaissance Technologies", shares:  2_400_000, valueUsd:  1_124_000_000, pctPortfolio:  1.0, sharesChangeQoQ:  +200_000 },
  // ── Two Sigma ──
  { ticker: "AAPL",  managerCik: "1179392", managerName: "Two Sigma Investments", shares: 8_400_000, valueUsd:  1_654_000_000, pctPortfolio:  1.8, sharesChangeQoQ:  -400_000 },
  { ticker: "NVDA",  managerCik: "1179392", managerName: "Two Sigma Investments", shares: 6_400_000, valueUsd:  1_038_000_000, pctPortfolio:  1.2, sharesChangeQoQ:  +800_000 },
]);

// Notable Q1 2026 entries — for the conviction-moves panel.
// "isNew" entries above will surface as biggest-new-positions when
// valueUsd > $500M threshold. Exits below.
export const NOTABLE_EXITS: Position13F[] = expand([
  { ticker: "PARA",  managerCik: "1167483", managerName: "Tiger Global Management",   shares: 0, valueUsd:  724_000_000, pctPortfolio: 0, sharesChangeQoQ: -12_400_000, isExit: true },
  { ticker: "PYPL",  managerCik: "1771602", managerName: "D1 Capital Partners",       shares: 0, valueUsd:  582_000_000, pctPortfolio: 0, sharesChangeQoQ:  -8_200_000, isExit: true },
  { ticker: "SNAP",  managerCik: "1135730", managerName: "Coatue Management",         shares: 0, valueUsd:  624_000_000, pctPortfolio: 0, sharesChangeQoQ: -22_000_000, isExit: true },
]);

export const THIRTEEN_F_AS_OF = F1;
export const THIRTEEN_F_PERIOD_END = "2026-03-31";
