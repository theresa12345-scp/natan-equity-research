// ============================================================================
// NATAN EQUITY RESEARCH - BANK VALUATION MODULE
// ============================================================================
// Based on:
// - Damodaran (NYU Stern): "Valuing Financial Service Firms"
// - Rosenbaum & Pearl: "Investment Banking" (Chapter on FIG)
// - CFA Level II: Equity Valuation - Financial Institutions
// - OJK (Indonesia Financial Services Authority) regulatory standards
// - BASEL III capital requirements
// ============================================================================

// ============================================================================
// PART 1: BANK VALUATION ASSUMPTIONS
// ============================================================================

export const BANK_ASSUMPTIONS = {
  Indonesia: {
    // Cost of Equity components
    riskFreeRate: 6.65,           // 10Y Indonesian Gov Bond (Dec 2025)
    equityRiskPremium: 6.0,        // Mature market ERP
    countryRiskPremium: 2.5,       // Indonesia country risk (CDS-based)

    // Terminal assumptions
    terminalGrowth: 5.0,           // Long-term nominal GDP growth
    sustainableROE: 14.0,          // Long-term normalized ROE

    // Regulatory requirements (OJK / BASEL III)
    minCAR: 12.0,                  // Minimum Capital Adequacy Ratio
    minTier1: 9.5,                 // Minimum Tier 1 Ratio
    targetLDR: { min: 78, max: 92 }, // Optimal LDR range

    // Dividend policy (Indonesian banks typically pay 20-60%)
    typicalPayoutRatio: 0.35,

    // Beta adjustments for bank sub-segments
    betaAdjustments: {
      stateOwned: 1.15,            // BBRI, BMRI, BBNI, BBTN
      private: 0.95,               // BBCA
      regional: 1.20,              // BNGA, BDMN, NISP
      sharia: 1.10                 // BRIS
    }
  },

  US: {
    riskFreeRate: 4.35,
    equityRiskPremium: 5.5,
    countryRiskPremium: 0,
    terminalGrowth: 2.5,
    sustainableROE: 12.0,
    minCAR: 10.5,
    minTier1: 8.5,
    targetLDR: { min: 70, max: 90 },
    typicalPayoutRatio: 0.40,
    betaAdjustments: {
      moneyCenter: 1.10,
      regional: 1.00,
      community: 0.90
    }
  }
};

// ============================================================================
// PART 2: INDONESIAN BANK DATA (Big 4 + Major Banks)
// Source: Bloomberg, Bank financial statements, OJK data (Q3 2024)
// ============================================================================

export const INDONESIAN_BANKS_DATA = [
  {
    ticker: "BBCA",
    name: "Bank Central Asia",
    category: "Private",
    // Price & Market Data
    price: 8375,
    marketCap: 1047827940,      // In millions IDR
    sharesOutstanding: 125101,  // In millions

    // Profitability Metrics
    roe: 23.7,                  // Return on Equity (%)
    roa: 3.8,                   // Return on Assets (%)
    nim: 5.8,                   // Net Interest Margin (%)
    costToIncome: 32.5,         // Cost-to-Income Ratio (%)

    // Valuation
    pb: 4.19,                   // Price-to-Book
    pe: 18.39,                  // Price-to-Earnings
    dividendYield: 2.8,         // Dividend Yield (%)
    payoutRatio: 0.55,          // Dividend Payout Ratio

    // Asset Quality
    nplRatio: 1.8,              // Non-Performing Loans (%)
    nplCoverage: 285,           // NPL Coverage Ratio (%)
    loanLossReserve: 5.2,       // LLR / Total Loans (%)

    // Capital & Liquidity
    car: 28.5,                  // Capital Adequacy Ratio (%)
    tier1Ratio: 26.2,           // Tier 1 Capital Ratio (%)
    ldr: 73.8,                  // Loan-to-Deposit Ratio (%)
    casaRatio: 80.5,            // Current + Savings / Total Deposits (%)

    // Growth (YoY)
    loanGrowth: 15.2,
    depositGrowth: 9.8,
    netIncomeGrowth: 12.7,
    niiGrowth: 10.2,

    // Risk
    beta: 0.89,

    // Book Value
    bookValuePerShare: 2000,
    tangibleBookPerShare: 1950,

    // Additional
    totalAssets: 1420000000,    // In millions IDR
    totalLoans: 820000000,
    totalDeposits: 1110000000,
    netIncome: 54836305
  },
  {
    ticker: "BBRI",
    name: "Bank Rakyat Indonesia",
    category: "State-Owned",
    price: 3780,
    marketCap: 610160018,
    sharesOutstanding: 161384,
    roe: 19.53,
    roa: 2.8,
    nim: 7.2,
    costToIncome: 38.5,
    pb: 1.9,
    pe: 9.83,
    dividendYield: 6.2,
    payoutRatio: 0.60,
    nplRatio: 2.9,
    nplCoverage: 215,
    loanLossReserve: 6.2,
    car: 24.8,
    tier1Ratio: 22.1,
    ldr: 85.2,
    casaRatio: 62.3,
    loanGrowth: 11.5,
    depositGrowth: 8.2,
    netIncomeGrowth: 0.14,
    niiGrowth: 4.8,
    beta: 1.33,
    bookValuePerShare: 1989,
    tangibleBookPerShare: 1950,
    totalAssets: 2150000000,
    totalLoans: 1380000000,
    totalDeposits: 1620000000,
    netIncome: 60154887
  },
  {
    ticker: "BMRI",
    name: "Bank Mandiri",
    category: "State-Owned",
    price: 4640,
    marketCap: 485333333,
    sharesOutstanding: 104586,
    roe: 22.74,
    roa: 3.2,
    nim: 5.4,
    costToIncome: 36.8,
    pb: 1.7,
    pe: 7.70,
    dividendYield: 7.8,
    payoutRatio: 0.60,
    nplRatio: 1.2,
    nplCoverage: 320,
    loanLossReserve: 3.8,
    car: 22.1,
    tier1Ratio: 20.5,
    ldr: 88.5,
    casaRatio: 72.1,
    loanGrowth: 18.2,
    depositGrowth: 12.5,
    netIncomeGrowth: 1.32,
    niiGrowth: 8.7,
    beta: 1.16,
    bookValuePerShare: 2729,
    tangibleBookPerShare: 2680,
    totalAssets: 1850000000,
    totalLoans: 1280000000,
    totalDeposits: 1450000000,
    netIncome: 55782742
  },
  {
    ticker: "BBNI",
    name: "Bank Negara Indonesia",
    category: "State-Owned",
    price: 4020,
    marketCap: 149400000,
    sharesOutstanding: 37168,
    roe: 15.8,
    roa: 2.4,
    nim: 4.5,
    costToIncome: 42.5,
    pb: 1.1,
    pe: 6.95,
    dividendYield: 8.5,
    payoutRatio: 0.60,
    nplRatio: 2.4,
    nplCoverage: 185,
    loanLossReserve: 4.4,
    car: 20.8,
    tier1Ratio: 18.5,
    ldr: 92.3,
    casaRatio: 69.8,
    loanGrowth: 9.5,
    depositGrowth: 6.8,
    netIncomeGrowth: 3.2,
    niiGrowth: 5.2,
    beta: 1.25,
    bookValuePerShare: 3655,
    tangibleBookPerShare: 3580,
    totalAssets: 980000000,
    totalLoans: 720000000,
    totalDeposits: 780000000,
    netIncome: 21500000
  },
  {
    ticker: "BBTN",
    name: "Bank Tabungan Negara",
    category: "State-Owned",
    price: 1085,
    marketCap: 15200000,
    sharesOutstanding: 14010,
    roe: 11.2,
    roa: 0.9,
    nim: 3.8,
    costToIncome: 58.5,
    pb: 0.55,
    pe: 4.95,
    dividendYield: 4.2,
    payoutRatio: 0.20,
    nplRatio: 3.8,
    nplCoverage: 125,
    loanLossReserve: 4.8,
    car: 17.2,
    tier1Ratio: 14.8,
    ldr: 108.5,
    casaRatio: 52.1,
    loanGrowth: 6.2,
    depositGrowth: 4.5,
    netIncomeGrowth: -5.2,
    niiGrowth: 2.1,
    beta: 1.45,
    bookValuePerShare: 1973,
    tangibleBookPerShare: 1920,
    totalAssets: 420000000,
    totalLoans: 350000000,
    totalDeposits: 320000000,
    netIncome: 3100000
  }
];

// ============================================================================
// PART 3: COST OF EQUITY CALCULATION (CAPM for Banks)
// ============================================================================

/**
 * Calculate Cost of Equity using CAPM
 * Ke = Rf + Beta × (ERP + CRP)
 *
 * For banks, we adjust beta based on category (state-owned vs private)
 * Source: Damodaran's approach for financial institutions
 */
export const calculateBankCostOfEquity = (bank, region = 'Indonesia') => {
  const assumptions = BANK_ASSUMPTIONS[region];

  // Get beta adjustment based on bank category
  let betaMultiplier = 1.0;
  if (region === 'Indonesia') {
    if (bank.category === 'State-Owned') betaMultiplier = assumptions.betaAdjustments.stateOwned / bank.beta;
    else if (bank.category === 'Private') betaMultiplier = assumptions.betaAdjustments.private / bank.beta;
    else if (bank.category === 'Regional') betaMultiplier = assumptions.betaAdjustments.regional / bank.beta;
    else if (bank.category === 'Sharia') betaMultiplier = assumptions.betaAdjustments.sharia / bank.beta;
  }

  // Use provided beta or calculate adjusted beta
  const adjustedBeta = bank.beta || 1.0;

  // CAPM: Ke = Rf + Beta × (ERP + CRP)
  const costOfEquity = assumptions.riskFreeRate +
    adjustedBeta * (assumptions.equityRiskPremium + assumptions.countryRiskPremium);

  return {
    costOfEquity: Math.round(costOfEquity * 100) / 100,
    riskFreeRate: assumptions.riskFreeRate,
    beta: adjustedBeta,
    equityRiskPremium: assumptions.equityRiskPremium,
    countryRiskPremium: assumptions.countryRiskPremium,
    totalRiskPremium: assumptions.equityRiskPremium + assumptions.countryRiskPremium
  };
};

// ============================================================================
// PART 4: DIVIDEND DISCOUNT MODEL (DDM) - 2-Stage and 3-Stage
// ============================================================================

/**
 * 2-Stage Dividend Discount Model
 *
 * Stage 1: High growth period (years 1-5)
 *   - Uses current dividend growth rate declining to terminal
 *
 * Stage 2: Terminal (perpetual)
 *   - Uses sustainable growth = ROE × (1 - payout)
 *
 * Formula: P = Σ(D₀ × (1+g)ᵗ / (1+Ke)ᵗ) + TV / (1+Ke)ⁿ
 * Terminal Value: TV = Dₙ₊₁ / (Ke - g∞)
 */
export const calculateDDM2Stage = (bank, region = 'Indonesia') => {
  const assumptions = BANK_ASSUMPTIONS[region];
  const { costOfEquity } = calculateBankCostOfEquity(bank, region);
  const ke = costOfEquity / 100;

  // Current dividend per share
  const currentDPS = bank.price * (bank.dividendYield / 100);

  // Growth rates
  const currentGrowth = Math.max(bank.netIncomeGrowth || 5, 0) / 100;
  const terminalGrowth = assumptions.terminalGrowth / 100;

  // Calculate declining growth rates over 5 years
  const growthRates = [];
  for (let year = 1; year <= 5; year++) {
    const decayFactor = (5 - year) / 5;
    growthRates.push(currentGrowth * decayFactor + terminalGrowth * (1 - decayFactor));
  }

  // Project dividends and calculate PV
  let projectedDividends = [];
  let pvDividends = [];
  let dividend = currentDPS;
  let totalPVDividends = 0;

  for (let year = 1; year <= 5; year++) {
    dividend = dividend * (1 + growthRates[year - 1]);
    projectedDividends.push(dividend);
    const pv = dividend / Math.pow(1 + ke, year);
    pvDividends.push(pv);
    totalPVDividends += pv;
  }

  // Terminal Value
  const terminalDividend = dividend * (1 + terminalGrowth);
  const terminalValue = terminalDividend / (ke - terminalGrowth);
  const pvTerminalValue = terminalValue / Math.pow(1 + ke, 5);

  // Intrinsic Value
  const intrinsicValue = totalPVDividends + pvTerminalValue;
  const upside = ((intrinsicValue - bank.price) / bank.price) * 100;

  return {
    model: 'DDM (2-Stage)',
    intrinsicValue: Math.round(intrinsicValue),
    currentPrice: bank.price,
    upside: Math.round(upside * 10) / 10,
    recommendation: getRecommendation(upside),

    // Model inputs
    currentDPS,
    costOfEquity,
    terminalGrowth: assumptions.terminalGrowth,

    // Stage 1 details
    projectedDividends,
    pvDividends,
    totalPVDividends: Math.round(totalPVDividends),
    growthRates: growthRates.map(g => Math.round(g * 1000) / 10),

    // Terminal details
    terminalDividend: Math.round(terminalDividend),
    terminalValue: Math.round(terminalValue),
    pvTerminalValue: Math.round(pvTerminalValue),

    // Valuation breakdown
    pvStage1Pct: Math.round((totalPVDividends / intrinsicValue) * 100),
    pvTerminalPct: Math.round((pvTerminalValue / intrinsicValue) * 100)
  };
};

/**
 * 3-Stage DDM (More granular for mature banks)
 * Stage 1: High growth (Years 1-3)
 * Stage 2: Transition (Years 4-7)
 * Stage 3: Terminal (Perpetual)
 */
export const calculateDDM3Stage = (bank, region = 'Indonesia') => {
  const assumptions = BANK_ASSUMPTIONS[region];
  const { costOfEquity } = calculateBankCostOfEquity(bank, region);
  const ke = costOfEquity / 100;

  const currentDPS = bank.price * (bank.dividendYield / 100);
  const highGrowth = Math.max(bank.netIncomeGrowth || 8, 2) / 100;
  const terminalGrowth = assumptions.terminalGrowth / 100;
  const transitionGrowth = (highGrowth + terminalGrowth) / 2;

  let dividend = currentDPS;
  let totalPV = 0;
  let year = 0;

  // Stage 1: Years 1-3 (high growth)
  for (let i = 1; i <= 3; i++) {
    year++;
    dividend = dividend * (1 + highGrowth);
    totalPV += dividend / Math.pow(1 + ke, year);
  }

  // Stage 2: Years 4-7 (transition)
  for (let i = 4; i <= 7; i++) {
    year++;
    const decayFactor = (7 - i) / 4;
    const growth = highGrowth * decayFactor + terminalGrowth * (1 - decayFactor);
    dividend = dividend * (1 + growth);
    totalPV += dividend / Math.pow(1 + ke, year);
  }

  // Stage 3: Terminal
  const terminalDividend = dividend * (1 + terminalGrowth);
  const terminalValue = terminalDividend / (ke - terminalGrowth);
  const pvTerminal = terminalValue / Math.pow(1 + ke, year);

  const intrinsicValue = totalPV + pvTerminal;
  const upside = ((intrinsicValue - bank.price) / bank.price) * 100;

  return {
    model: 'DDM (3-Stage)',
    intrinsicValue: Math.round(intrinsicValue),
    currentPrice: bank.price,
    upside: Math.round(upside * 10) / 10,
    recommendation: getRecommendation(upside),
    costOfEquity,
    highGrowth: Math.round(highGrowth * 100 * 10) / 10,
    transitionGrowth: Math.round(transitionGrowth * 100 * 10) / 10,
    terminalGrowth: assumptions.terminalGrowth,
    pvDividends: Math.round(totalPV),
    pvTerminal: Math.round(pvTerminal)
  };
};

// ============================================================================
// PART 5: RESIDUAL INCOME / EXCESS RETURN MODEL
// ============================================================================

/**
 * Residual Income Model (Damodaran's preferred for banks)
 *
 * Value = Book Value + PV of Excess Returns
 * Excess Return = (ROE - Ke) × Book Value
 *
 * This model is ideal for banks because:
 * 1. Book value is meaningful (assets marked to market)
 * 2. ROE is the key profitability metric
 * 3. Regulatory capital ties directly to book value
 *
 * Formula: P = BV₀ + Σ[(ROE - Ke) × BVₜ₋₁ / (1+Ke)ᵗ] + TV
 */
export const calculateResidualIncome = (bank, region = 'Indonesia') => {
  const assumptions = BANK_ASSUMPTIONS[region];
  const { costOfEquity } = calculateBankCostOfEquity(bank, region);
  const ke = costOfEquity / 100;

  const roe = bank.roe / 100;
  const terminalROE = assumptions.sustainableROE / 100;
  const terminalGrowth = assumptions.terminalGrowth / 100;
  const payoutRatio = bank.payoutRatio || assumptions.typicalPayoutRatio;

  // Current book value per share
  const currentBV = bank.bookValuePerShare;

  // Project book value growth (retained earnings)
  // BV growth = ROE × (1 - payout)
  let projectedBV = [];
  let residualIncomes = [];
  let pvResidualIncomes = [];
  let bv = currentBV;
  let totalPVRI = 0;

  for (let year = 1; year <= 5; year++) {
    // ROE declines toward sustainable level
    const decayFactor = (5 - year) / 5;
    const yearROE = roe * decayFactor + terminalROE * (1 - decayFactor);

    // Residual Income = (ROE - Ke) × Beginning BV
    const ri = (yearROE - ke) * bv;
    residualIncomes.push(ri);

    const pvRI = ri / Math.pow(1 + ke, year);
    pvResidualIncomes.push(pvRI);
    totalPVRI += pvRI;

    // Book value grows by retained earnings
    const retainedEarnings = yearROE * bv * (1 - payoutRatio);
    bv = bv + retainedEarnings;
    projectedBV.push(bv);
  }

  // Terminal residual income
  const terminalRI = (terminalROE - ke) * bv;
  const terminalValue = terminalRI / (ke - terminalGrowth);
  const pvTerminalValue = terminalValue / Math.pow(1 + ke, 5);

  // Intrinsic Value = Current BV + PV of RI + PV of Terminal
  const intrinsicValue = currentBV + totalPVRI + pvTerminalValue;
  const upside = ((intrinsicValue - bank.price) / bank.price) * 100;

  // Implied P/B
  const impliedPB = intrinsicValue / currentBV;

  return {
    model: 'Residual Income',
    intrinsicValue: Math.round(intrinsicValue),
    currentPrice: bank.price,
    upside: Math.round(upside * 10) / 10,
    recommendation: getRecommendation(upside),

    // Key metrics
    currentROE: bank.roe,
    terminalROE: assumptions.sustainableROE,
    costOfEquity,
    spreadOverKe: Math.round((roe - ke) * 1000) / 10, // ROE - Ke in %

    // Book value analysis
    currentBookValue: currentBV,
    currentPB: bank.pb,
    impliedPB: Math.round(impliedPB * 100) / 100,
    pbDiscount: Math.round((1 - bank.pb / impliedPB) * 100),

    // Valuation breakdown
    pvFromBookValue: currentBV,
    pvFromExcessReturns: Math.round(totalPVRI + pvTerminalValue),
    pctValueFromExcess: Math.round(((totalPVRI + pvTerminalValue) / intrinsicValue) * 100),

    // Detailed projections
    projectedBV,
    residualIncomes,
    pvResidualIncomes,
    terminalValue: Math.round(terminalValue),
    pvTerminalValue: Math.round(pvTerminalValue)
  };
};

// ============================================================================
// PART 6: FAIR P/B CALCULATION (Gordon Growth Derived)
// ============================================================================

/**
 * Fair P/B Ratio from Gordon Growth Model
 *
 * Damodaran's derivation:
 * P/B = (ROE - g) / (Ke - g)
 *
 * Where:
 * - ROE = Return on Equity
 * - g = Sustainable growth rate = ROE × (1 - payout)
 * - Ke = Cost of Equity
 *
 * This is the CORE relationship for bank valuation:
 * - If ROE > Ke → P/B should be > 1 (value creator)
 * - If ROE < Ke → P/B should be < 1 (value destroyer)
 * - If ROE = Ke → P/B should be = 1 (neutral)
 */
export const calculateFairPB = (bank, region = 'Indonesia') => {
  const assumptions = BANK_ASSUMPTIONS[region];
  const { costOfEquity } = calculateBankCostOfEquity(bank, region);
  const ke = costOfEquity / 100;

  const roe = bank.roe / 100;
  const payoutRatio = bank.payoutRatio || assumptions.typicalPayoutRatio;
  const sustainableGrowth = roe * (1 - payoutRatio);
  const terminalGrowth = assumptions.terminalGrowth / 100;

  // Use lower of sustainable growth and terminal growth
  const g = Math.min(sustainableGrowth, terminalGrowth);

  // Fair P/B = (ROE - g) / (Ke - g)
  // Guard against division by zero or negative denominator
  let fairPB;
  if (ke <= g) {
    // If cost of equity is less than growth, model breaks down
    // Use a cap of 5x P/B
    fairPB = 5.0;
  } else {
    fairPB = (roe - g) / (ke - g);
  }

  // Clamp to reasonable range
  fairPB = Math.max(0.3, Math.min(fairPB, 6.0));

  const currentPB = bank.pb;
  const pbDiscount = ((fairPB - currentPB) / fairPB) * 100;

  // Fair price based on P/B
  const fairPrice = bank.bookValuePerShare * fairPB;
  const upside = ((fairPrice - bank.price) / bank.price) * 100;

  return {
    model: 'Gordon Growth P/B',
    fairPB: Math.round(fairPB * 100) / 100,
    currentPB: currentPB,
    pbDiscount: Math.round(pbDiscount * 10) / 10,

    fairPrice: Math.round(fairPrice),
    currentPrice: bank.price,
    upside: Math.round(upside * 10) / 10,
    recommendation: getRecommendation(upside),

    // Key inputs
    roe: bank.roe,
    costOfEquity,
    sustainableGrowth: Math.round(sustainableGrowth * 1000) / 10,
    terminalGrowth: Math.round(g * 1000) / 10,
    payoutRatio: Math.round(payoutRatio * 100),

    // Value creation analysis
    spreadROEvsKe: Math.round((roe - ke) * 1000) / 10,
    isValueCreator: roe > ke,
    valueCreationRating: roe > ke + 0.05 ? 'Strong' :
                         roe > ke ? 'Moderate' :
                         roe > ke - 0.03 ? 'Weak' : 'Destroying'
  };
};

// ============================================================================
// PART 7: BANK-SPECIFIC QUALITY SCORING
// ============================================================================

/**
 * Bank Quality Score (0-100)
 *
 * Weighted scoring based on:
 * 1. Profitability (30%) - ROE, NIM, Cost-to-Income
 * 2. Asset Quality (25%) - NPL, Coverage, LLR
 * 3. Capital Strength (20%) - CAR, Tier 1
 * 4. Liquidity (15%) - LDR, CASA
 * 5. Growth (10%) - Loan growth, NII growth
 *
 * Based on: OJK health ratings, CAMELS framework
 */
export const calculateBankQualityScore = (bank) => {
  let scores = {
    profitability: 0,     // 30 points max
    assetQuality: 0,      // 25 points max
    capitalStrength: 0,   // 20 points max
    liquidity: 0,         // 15 points max
    growth: 0             // 10 points max
  };

  // 1. PROFITABILITY (30 points)
  // ROE scoring (15 points)
  if (bank.roe >= 20) scores.profitability += 15;
  else if (bank.roe >= 15) scores.profitability += 12;
  else if (bank.roe >= 12) scores.profitability += 9;
  else if (bank.roe >= 8) scores.profitability += 6;
  else scores.profitability += 3;

  // NIM scoring (10 points)
  if (bank.nim >= 6) scores.profitability += 10;
  else if (bank.nim >= 5) scores.profitability += 8;
  else if (bank.nim >= 4) scores.profitability += 6;
  else if (bank.nim >= 3) scores.profitability += 4;
  else scores.profitability += 2;

  // Cost-to-Income scoring (5 points) - lower is better
  if (bank.costToIncome <= 35) scores.profitability += 5;
  else if (bank.costToIncome <= 40) scores.profitability += 4;
  else if (bank.costToIncome <= 45) scores.profitability += 3;
  else if (bank.costToIncome <= 50) scores.profitability += 2;
  else scores.profitability += 1;

  // 2. ASSET QUALITY (25 points)
  // NPL Ratio scoring (12 points) - lower is better
  if (bank.nplRatio <= 1.5) scores.assetQuality += 12;
  else if (bank.nplRatio <= 2.5) scores.assetQuality += 10;
  else if (bank.nplRatio <= 3.5) scores.assetQuality += 7;
  else if (bank.nplRatio <= 5.0) scores.assetQuality += 4;
  else scores.assetQuality += 1;

  // NPL Coverage scoring (8 points) - higher is better
  if (bank.nplCoverage >= 250) scores.assetQuality += 8;
  else if (bank.nplCoverage >= 200) scores.assetQuality += 6;
  else if (bank.nplCoverage >= 150) scores.assetQuality += 4;
  else if (bank.nplCoverage >= 100) scores.assetQuality += 2;
  else scores.assetQuality += 0;

  // Loan Loss Reserve scoring (5 points)
  if (bank.loanLossReserve >= 5) scores.assetQuality += 5;
  else if (bank.loanLossReserve >= 4) scores.assetQuality += 4;
  else if (bank.loanLossReserve >= 3) scores.assetQuality += 3;
  else if (bank.loanLossReserve >= 2) scores.assetQuality += 2;
  else scores.assetQuality += 1;

  // 3. CAPITAL STRENGTH (20 points)
  // CAR scoring (12 points)
  if (bank.car >= 25) scores.capitalStrength += 12;
  else if (bank.car >= 20) scores.capitalStrength += 10;
  else if (bank.car >= 15) scores.capitalStrength += 7;
  else if (bank.car >= 12) scores.capitalStrength += 4;
  else scores.capitalStrength += 1;

  // Tier 1 Ratio scoring (8 points)
  if (bank.tier1Ratio >= 22) scores.capitalStrength += 8;
  else if (bank.tier1Ratio >= 18) scores.capitalStrength += 6;
  else if (bank.tier1Ratio >= 14) scores.capitalStrength += 4;
  else if (bank.tier1Ratio >= 10) scores.capitalStrength += 2;
  else scores.capitalStrength += 0;

  // 4. LIQUIDITY (15 points)
  // LDR scoring (8 points) - optimal range 78-92%
  if (bank.ldr >= 78 && bank.ldr <= 92) scores.liquidity += 8;
  else if (bank.ldr >= 70 && bank.ldr <= 100) scores.liquidity += 6;
  else if (bank.ldr >= 60 && bank.ldr <= 110) scores.liquidity += 4;
  else scores.liquidity += 2;

  // CASA Ratio scoring (7 points) - higher is better (cheaper funding)
  if (bank.casaRatio >= 75) scores.liquidity += 7;
  else if (bank.casaRatio >= 65) scores.liquidity += 5;
  else if (bank.casaRatio >= 55) scores.liquidity += 4;
  else if (bank.casaRatio >= 45) scores.liquidity += 2;
  else scores.liquidity += 1;

  // 5. GROWTH (10 points)
  // Loan Growth scoring (5 points)
  if (bank.loanGrowth >= 15) scores.growth += 5;
  else if (bank.loanGrowth >= 10) scores.growth += 4;
  else if (bank.loanGrowth >= 5) scores.growth += 3;
  else if (bank.loanGrowth >= 0) scores.growth += 2;
  else scores.growth += 0;

  // NII Growth scoring (5 points)
  if (bank.niiGrowth >= 12) scores.growth += 5;
  else if (bank.niiGrowth >= 8) scores.growth += 4;
  else if (bank.niiGrowth >= 5) scores.growth += 3;
  else if (bank.niiGrowth >= 0) scores.growth += 2;
  else scores.growth += 0;

  const totalScore = scores.profitability + scores.assetQuality +
                     scores.capitalStrength + scores.liquidity + scores.growth;

  return {
    total: totalScore,
    max: 100,
    rating: getBankRating(totalScore),
    breakdown: scores,
    strengths: identifyStrengths(scores),
    weaknesses: identifyWeaknesses(scores)
  };
};

// ============================================================================
// PART 8: COMPREHENSIVE BANK VALUATION (All Models Combined)
// ============================================================================

/**
 * Run all valuation models and aggregate
 */
export const calculateBankValuation = (bank, region = 'Indonesia') => {
  const ddm2 = calculateDDM2Stage(bank, region);
  const ddm3 = calculateDDM3Stage(bank, region);
  const ri = calculateResidualIncome(bank, region);
  const fairPB = calculateFairPB(bank, region);
  const qualityScore = calculateBankQualityScore(bank);
  const costOfEquity = calculateBankCostOfEquity(bank, region);

  // Weighted average intrinsic value
  // Weight: DDM2 (25%), DDM3 (25%), RI (35%), Fair PB (15%)
  const weightedIntrinsicValue = Math.round(
    ddm2.intrinsicValue * 0.25 +
    ddm3.intrinsicValue * 0.25 +
    ri.intrinsicValue * 0.35 +
    fairPB.fairPrice * 0.15
  );

  const weightedUpside = ((weightedIntrinsicValue - bank.price) / bank.price) * 100;

  return {
    ticker: bank.ticker,
    name: bank.name,
    category: bank.category,
    currentPrice: bank.price,

    // Aggregated valuation
    weightedIntrinsicValue,
    weightedUpside: Math.round(weightedUpside * 10) / 10,
    recommendation: getRecommendation(weightedUpside),

    // Individual models
    models: {
      ddm2Stage: ddm2,
      ddm3Stage: ddm3,
      residualIncome: ri,
      gordonPB: fairPB
    },

    // Quality & Risk
    qualityScore,
    costOfEquity,

    // Key metrics for quick reference
    keyMetrics: {
      roe: bank.roe,
      nim: bank.nim,
      nplRatio: bank.nplRatio,
      car: bank.car,
      pb: bank.pb,
      pe: bank.pe,
      dividendYield: bank.dividendYield
    }
  };
};

// ============================================================================
// PART 9: BANK PEER COMPARISON
// ============================================================================

/**
 * Compare bank against peers using key metrics
 */
export const calculateBankPeerComparison = (bank, peers = INDONESIAN_BANKS_DATA) => {
  // Filter out the subject bank from peers
  const comparablePeers = peers.filter(p => p.ticker !== bank.ticker);

  // Calculate peer medians
  const metrics = ['roe', 'nim', 'nplRatio', 'nplCoverage', 'car', 'ldr', 'casaRatio',
                   'costToIncome', 'pb', 'pe', 'dividendYield', 'loanGrowth'];

  const peerMedians = {};
  const peerRanks = {};

  metrics.forEach(metric => {
    const values = comparablePeers.map(p => p[metric]).filter(v => v != null).sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    peerMedians[metric] = values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;

    // Calculate rank (1 = best)
    const allValues = [...values, bank[metric]].sort((a, b) => {
      // For metrics where lower is better
      if (['nplRatio', 'costToIncome', 'pe', 'pb'].includes(metric)) {
        return a - b;
      }
      return b - a;
    });
    peerRanks[metric] = allValues.indexOf(bank[metric]) + 1;
  });

  // Calculate implied values from peer multiples
  const impliedFromPeerPE = peerMedians.pe * (bank.price / bank.pe) * bank.pe / bank.pe;
  const impliedFromPeerPB = peerMedians.pb * bank.bookValuePerShare;

  // Premium/Discount analysis
  const peVsPeer = ((bank.pe / peerMedians.pe) - 1) * 100;
  const pbVsPeer = ((bank.pb / peerMedians.pb) - 1) * 100;

  return {
    bank: bank.ticker,
    peerCount: comparablePeers.length,

    // Relative valuation
    peVsPeerMedian: Math.round(peVsPeer * 10) / 10,
    pbVsPeerMedian: Math.round(pbVsPeer * 10) / 10,
    isPremium: bank.pb > peerMedians.pb,

    // Implied values
    impliedFromPeerPB: Math.round(impliedFromPeerPB),

    // Rankings (1 = best in peer group)
    rankings: peerRanks,

    // Peer medians
    peerMedians: Object.fromEntries(
      Object.entries(peerMedians).map(([k, v]) => [k, Math.round(v * 100) / 100])
    ),

    // Detailed comparison
    comparison: metrics.map(metric => ({
      metric,
      bankValue: bank[metric],
      peerMedian: Math.round(peerMedians[metric] * 100) / 100,
      rank: peerRanks[metric],
      vsMedian: Math.round(((bank[metric] / peerMedians[metric]) - 1) * 100 * 10) / 10
    }))
  };
};

// ============================================================================
// PART 10: UTILITY FUNCTIONS
// ============================================================================

function getRecommendation(upside) {
  if (upside >= 30) return { rating: 'Strong Buy', color: 'emerald' };
  if (upside >= 15) return { rating: 'Buy', color: 'blue' };
  if (upside >= 0) return { rating: 'Hold', color: 'slate' };
  if (upside >= -15) return { rating: 'Underperform', color: 'amber' };
  return { rating: 'Sell', color: 'red' };
}

function getBankRating(score) {
  if (score >= 85) return { grade: 'A', description: 'Excellent', color: 'emerald' };
  if (score >= 70) return { grade: 'B', description: 'Good', color: 'blue' };
  if (score >= 55) return { grade: 'C', description: 'Fair', color: 'amber' };
  if (score >= 40) return { grade: 'D', description: 'Weak', color: 'orange' };
  return { grade: 'F', description: 'Poor', color: 'red' };
}

function identifyStrengths(scores) {
  const strengths = [];
  if (scores.profitability >= 25) strengths.push('Strong profitability');
  if (scores.assetQuality >= 20) strengths.push('Excellent asset quality');
  if (scores.capitalStrength >= 16) strengths.push('Well-capitalized');
  if (scores.liquidity >= 12) strengths.push('Strong liquidity position');
  if (scores.growth >= 8) strengths.push('Healthy growth trajectory');
  return strengths;
}

function identifyWeaknesses(scores) {
  const weaknesses = [];
  if (scores.profitability < 15) weaknesses.push('Weak profitability');
  if (scores.assetQuality < 12) weaknesses.push('Asset quality concerns');
  if (scores.capitalStrength < 10) weaknesses.push('Capital adequacy risk');
  if (scores.liquidity < 8) weaknesses.push('Liquidity pressure');
  if (scores.growth < 4) weaknesses.push('Stagnant growth');
  return weaknesses;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  BANK_ASSUMPTIONS,
  INDONESIAN_BANKS_DATA,
  calculateBankCostOfEquity,
  calculateDDM2Stage,
  calculateDDM3Stage,
  calculateResidualIncome,
  calculateFairPB,
  calculateBankQualityScore,
  calculateBankValuation,
  calculateBankPeerComparison
};
