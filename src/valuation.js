// ============================================================================
// NATAN INSTITUTIONAL VALUATION MODELS
// Version 2.0 - November 2025
// Based on: CFA Level II, Damodaran (NYU), Rosenbaum & Pearl (Investment Banking)
// McKinsey Valuation, Goldman Sachs/Morgan Stanley methodologies
// ============================================================================

// ============================================================================
// DCF ASSUMPTIONS - Region-specific parameters
// Sources: Damodaran country risk data (Jan 2025), Bloomberg, Federal Reserve, Bank Indonesia
// ============================================================================

export const DCF_ASSUMPTIONS = {
  Indonesia: {
    riskFreeRate: 6.65,           // 10Y Indonesian Gov Bond (Nov 2025)
    equityRiskPremium: 6.0,        // Mature market ERP (Damodaran)
    countryRiskPremium: 2.5,       // Indonesia CDS spread / country risk
    terminalGrowth: 4.0,           // Long-term nominal GDP growth (must be < WACC)
    taxRate: 22,                   // Corporate tax rate
    // Damodaran synthetic rating spreads based on Interest Coverage Ratio
    // Source: https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ratings.html
    interestCoverageSpread: {
      aaa: { minCoverage: 12.5, spread: 0.75 },
      aa: { minCoverage: 9.5, spread: 1.00 },
      aPlus: { minCoverage: 7.5, spread: 1.25 },
      a: { minCoverage: 6.0, spread: 1.50 },
      aMinus: { minCoverage: 4.5, spread: 1.75 },
      bbbPlus: { minCoverage: 3.5, spread: 2.25 },
      bbb: { minCoverage: 3.0, spread: 2.75 },
      bbPlus: { minCoverage: 2.5, spread: 3.50 },
      bb: { minCoverage: 2.0, spread: 4.25 },
      bPlus: { minCoverage: 1.5, spread: 5.50 },
      b: { minCoverage: 1.25, spread: 6.50 },
      ccc: { minCoverage: 0.8, spread: 8.50 },
      cc: { minCoverage: 0.5, spread: 10.50 },
      d: { minCoverage: 0, spread: 14.00 }
    },
    // Fallback D/E based spreads (when ICR unavailable)
    defaultSpread: {
      low: 1.5,                    // D/E < 30%
      medium: 2.5,                 // D/E 30-60%
      high: 4.0,                   // D/E 60-100%
      veryHigh: 6.0                // D/E > 100%
    }
  },
  US: {
    riskFreeRate: 4.35,            // 10Y Treasury (Nov 2025)
    equityRiskPremium: 5.5,        // US market ERP (Damodaran 2025)
    countryRiskPremium: 0,         // No additional country risk
    terminalGrowth: 2.5,           // Long-term nominal GDP growth
    taxRate: 21,                   // Corporate tax rate
    interestCoverageSpread: {
      aaa: { minCoverage: 12.5, spread: 0.63 },
      aa: { minCoverage: 9.5, spread: 0.78 },
      aPlus: { minCoverage: 7.5, spread: 0.98 },
      a: { minCoverage: 6.0, spread: 1.13 },
      aMinus: { minCoverage: 4.5, spread: 1.28 },
      bbbPlus: { minCoverage: 3.5, spread: 1.63 },
      bbb: { minCoverage: 3.0, spread: 2.00 },
      bbPlus: { minCoverage: 2.5, spread: 2.50 },
      bb: { minCoverage: 2.0, spread: 3.00 },
      bPlus: { minCoverage: 1.5, spread: 4.00 },
      b: { minCoverage: 1.25, spread: 5.00 },
      ccc: { minCoverage: 0.8, spread: 6.50 },
      cc: { minCoverage: 0.5, spread: 8.00 },
      d: { minCoverage: 0, spread: 12.00 }
    },
    defaultSpread: {
      low: 1.0,
      medium: 1.75,
      high: 3.0,
      veryHigh: 5.0
    }
  }
};

// ============================================================================
// SECTOR-SPECIFIC PARAMETERS
// D&A ratios, reinvestment rates, and FCF characteristics by industry
// Source: Damodaran sector data, McKinsey industry benchmarks
// ============================================================================

const SECTOR_PARAMETERS = {
  'Technology': {
    daToEbitda: 0.12,      // Lower D&A (asset-light)
    capexToDA: 0.8,        // Low maintenance capex
    nwcToRevGrowth: 0.05,  // Low working capital intensity
    typicalMargin: 25,
    fcfConversion: 0.85    // High FCF conversion
  },
  'Financial': {
    daToEbitda: 0.03,      // Minimal D&A
    capexToDA: 0.5,
    nwcToRevGrowth: 0.02,
    typicalMargin: 35,
    fcfConversion: 0.90,
    isFinancial: true      // Flag for special handling
  },
  'Consumer, Cyclical': {
    daToEbitda: 0.18,
    capexToDA: 1.2,
    nwcToRevGrowth: 0.12,
    typicalMargin: 12,
    fcfConversion: 0.65
  },
  'Consumer, Non-cyclical': {
    daToEbitda: 0.15,
    capexToDA: 1.0,
    nwcToRevGrowth: 0.08,
    typicalMargin: 15,
    fcfConversion: 0.75
  },
  'Industrial': {
    daToEbitda: 0.22,
    capexToDA: 1.3,
    nwcToRevGrowth: 0.15,
    typicalMargin: 12,
    fcfConversion: 0.55
  },
  'Basic Materials': {
    daToEbitda: 0.28,      // High D&A (capital intensive)
    capexToDA: 1.4,
    nwcToRevGrowth: 0.10,
    typicalMargin: 15,
    fcfConversion: 0.50
  },
  'Energy': {
    daToEbitda: 0.35,      // Very high D&A
    capexToDA: 1.5,
    nwcToRevGrowth: 0.08,
    typicalMargin: 18,
    fcfConversion: 0.45
  },
  'Communications': {
    daToEbitda: 0.25,
    capexToDA: 1.2,
    nwcToRevGrowth: 0.05,
    typicalMargin: 20,
    fcfConversion: 0.60
  },
  'Utilities': {
    daToEbitda: 0.30,
    capexToDA: 1.6,        // High growth capex
    nwcToRevGrowth: 0.03,
    typicalMargin: 25,
    fcfConversion: 0.40
  },
  'Healthcare': {
    daToEbitda: 0.10,
    capexToDA: 0.9,
    nwcToRevGrowth: 0.10,
    typicalMargin: 18,
    fcfConversion: 0.70
  },
  'default': {
    daToEbitda: 0.18,
    capexToDA: 1.1,
    nwcToRevGrowth: 0.10,
    typicalMargin: 15,
    fcfConversion: 0.60
  }
};

// ============================================================================
// COST OF CAPITAL CALCULATIONS
// Based on: CAPM + Country Risk Premium (Damodaran methodology)
// ============================================================================

/**
 * Calculate Cost of Equity using CAPM with Country Risk Premium
 * Formula: Re = Rf + β × (ERP) + CRP
 *
 * Per Damodaran: For emerging markets, add country risk premium to capture
 * additional sovereign and currency risk not reflected in beta
 *
 * @param {number} beta - Company beta (levered)
 * @param {string} region - 'Indonesia' or 'US'
 * @returns {number} Cost of equity as percentage
 */
export const calculateCostOfEquity = (beta, region) => {
  const params = DCF_ASSUMPTIONS[region] || DCF_ASSUMPTIONS.US;

  // Apply Blume adjustment for beta mean reversion: Adjusted β = 0.67 × Raw β + 0.33 × 1.0
  // This is standard Bloomberg/CFA practice for forward-looking beta
  const rawBeta = beta || 1.0;
  const blumeAdjustedBeta = (0.67 * rawBeta) + (0.33 * 1.0);

  // Cap adjusted beta between 0.4 and 2.5 for reasonableness
  const adjustedBeta = Math.max(0.4, Math.min(2.5, blumeAdjustedBeta));

  return params.riskFreeRate +
         (adjustedBeta * params.equityRiskPremium) +
         params.countryRiskPremium;
};

/**
 * Calculate Cost of Debt using Damodaran's Synthetic Rating approach
 * PRIMARY: Interest Coverage Ratio (EBIT / Interest Expense)
 * FALLBACK: D/E ratio-based spread
 *
 * @param {Object} stock - Stock object with financial data
 * @param {string} region - 'Indonesia' or 'US'
 * @returns {Object} Cost of debt details with synthetic rating
 */
export const calculateCostOfDebt = (stock, region) => {
  const params = DCF_ASSUMPTIONS[region] || DCF_ASSUMPTIONS.US;

  let defaultSpread;
  let syntheticRating = 'NR';
  let method = 'D/E Fallback';

  // PRIMARY METHOD: Interest Coverage Ratio (Damodaran preferred)
  // ICR = EBIT / Interest Expense
  if (stock.InterestCoverage && stock.InterestCoverage > 0) {
    const icr = stock.InterestCoverage;
    const spreads = params.interestCoverageSpread;

    // Find appropriate rating based on coverage
    if (icr >= spreads.aaa.minCoverage) { defaultSpread = spreads.aaa.spread; syntheticRating = 'AAA'; }
    else if (icr >= spreads.aa.minCoverage) { defaultSpread = spreads.aa.spread; syntheticRating = 'AA'; }
    else if (icr >= spreads.aPlus.minCoverage) { defaultSpread = spreads.aPlus.spread; syntheticRating = 'A+'; }
    else if (icr >= spreads.a.minCoverage) { defaultSpread = spreads.a.spread; syntheticRating = 'A'; }
    else if (icr >= spreads.aMinus.minCoverage) { defaultSpread = spreads.aMinus.spread; syntheticRating = 'A-'; }
    else if (icr >= spreads.bbbPlus.minCoverage) { defaultSpread = spreads.bbbPlus.spread; syntheticRating = 'BBB+'; }
    else if (icr >= spreads.bbb.minCoverage) { defaultSpread = spreads.bbb.spread; syntheticRating = 'BBB'; }
    else if (icr >= spreads.bbPlus.minCoverage) { defaultSpread = spreads.bbPlus.spread; syntheticRating = 'BB+'; }
    else if (icr >= spreads.bb.minCoverage) { defaultSpread = spreads.bb.spread; syntheticRating = 'BB'; }
    else if (icr >= spreads.bPlus.minCoverage) { defaultSpread = spreads.bPlus.spread; syntheticRating = 'B+'; }
    else if (icr >= spreads.b.minCoverage) { defaultSpread = spreads.b.spread; syntheticRating = 'B'; }
    else if (icr >= spreads.ccc.minCoverage) { defaultSpread = spreads.ccc.spread; syntheticRating = 'CCC'; }
    else if (icr >= spreads.cc.minCoverage) { defaultSpread = spreads.cc.spread; syntheticRating = 'CC'; }
    else { defaultSpread = spreads.d.spread; syntheticRating = 'D'; }

    method = 'Interest Coverage';
  } else {
    // FALLBACK: D/E ratio based (less accurate but better than nothing)
    let deRatio = normalizeDeRatio(stock.DE);

    if (deRatio < 0.3) { defaultSpread = params.defaultSpread.low; syntheticRating = 'A-est'; }
    else if (deRatio < 0.6) { defaultSpread = params.defaultSpread.medium; syntheticRating = 'BBB-est'; }
    else if (deRatio < 1.0) { defaultSpread = params.defaultSpread.high; syntheticRating = 'BB-est'; }
    else { defaultSpread = params.defaultSpread.veryHigh; syntheticRating = 'B-est'; }
  }

  const preTaxCostOfDebt = params.riskFreeRate + defaultSpread;

  return {
    preTaxCost: Math.round(preTaxCostOfDebt * 100) / 100,
    spread: defaultSpread,
    syntheticRating,
    method
  };
};

/**
 * Normalize D/E ratio - handle percentage vs decimal format
 * @param {number} de - D/E ratio (could be 50 for 50% or 0.5)
 * @returns {number} D/E as decimal
 */
const normalizeDeRatio = (de) => {
  if (de === null || de === undefined) return 0.5; // Default assumption
  // If D/E > 5, likely expressed as percentage (e.g., 50 = 50%)
  // Most companies have D/E < 500%, so 5.0 is a reasonable threshold
  if (de > 5) return de / 100;
  return de;
};

/**
 * Calculate WACC (Weighted Average Cost of Capital)
 * Formula: WACC = (E/V × Re) + (D/V × Rd × (1-T))
 *
 * Uses market value weights per CFA/Damodaran best practice
 *
 * @param {Object} stock - Stock object with financial data
 * @param {string} region - 'Indonesia' or 'US'
 * @returns {Object} WACC details
 */
export const calculateWACC = (stock, region) => {
  const params = DCF_ASSUMPTIONS[region] || DCF_ASSUMPTIONS.US;

  // Get normalized D/E ratio
  const deRatio = normalizeDeRatio(stock.DE);

  // Capital structure weights (from D/E ratio)
  // D/V = D/E / (1 + D/E), E/V = 1 / (1 + D/E)
  const debtWeight = deRatio / (1 + deRatio);
  const equityWeight = 1 - debtWeight;

  // Component costs
  const costOfEquity = calculateCostOfEquity(stock.Beta, region);
  const debtData = calculateCostOfDebt(stock, region);
  const afterTaxCostOfDebt = debtData.preTaxCost * (1 - params.taxRate / 100);

  // WACC calculation
  const wacc = (equityWeight * costOfEquity) + (debtWeight * afterTaxCostOfDebt);

  return {
    wacc: Math.round(wacc * 100) / 100,
    costOfEquity: Math.round(costOfEquity * 100) / 100,
    costOfDebt: debtData.preTaxCost,
    afterTaxCostOfDebt: Math.round(afterTaxCostOfDebt * 100) / 100,
    debtWeight: Math.round(debtWeight * 1000) / 10,
    equityWeight: Math.round(equityWeight * 1000) / 10,
    beta: stock.Beta || 1.0,
    syntheticRating: debtData.syntheticRating,
    debtRatingMethod: debtData.method
  };
};

// ============================================================================
// FREE CASH FLOW ESTIMATION
// Based on: Damodaran FCF methodology, CFA Level II, McKinsey Valuation
// ============================================================================

/**
 * Estimate Free Cash Flow to Firm (FCFF)
 *
 * CORRECT FORMULA (per Damodaran/CFA):
 * FCFF = EBIT × (1-T) + D&A - CapEx - ΔNWC
 *      = NOPAT + D&A - CapEx - ΔNWC
 *      = NOPAT × (1 - Reinvestment Rate)
 *
 * Where Reinvestment Rate = (CapEx - D&A + ΔNWC) / NOPAT
 *       Or approximated as: Expected Growth / ROIC
 *
 * @param {Object} stock - Stock object with financial data
 * @param {string} region - 'Indonesia' or 'US'
 * @returns {Object} FCFF estimate with methodology details
 */
export const estimateFCFF = (stock, region) => {
  const params = DCF_ASSUMPTIONS[region] || DCF_ASSUMPTIONS.US;
  const sector = stock["Industry Sector"] || 'default';
  const sectorParams = SECTOR_PARAMETERS[sector] || SECTOR_PARAMETERS.default;

  let fcff = 0;
  let method = '';
  let confidence = 'Low';

  // METHOD 1: Direct FCF data (highest confidence)
  if (stock.FCF && stock.FCF > 0) {
    fcff = stock.FCF;
    method = 'Direct FCF';
    confidence = 'High';
    return { fcff, method, confidence };
  }

  // METHOD 2: Full FCFF calculation from EBITDA (preferred estimation method)
  // FCFF = EBIT(1-T) + D&A - CapEx - ΔNWC
  if (stock["EBITDA Margin"] && stock["Market Cap"]) {
    // Derive Revenue from P/S or Market Cap assumptions
    const impliedRevenue = stock["Market Cap"] / (stock.PS || 2);
    const ebitdaMargin = stock["EBITDA Margin"] / 100;
    const ebitda = impliedRevenue * ebitdaMargin;

    // Estimate D&A using sector-specific ratio
    const da = ebitda * sectorParams.daToEbitda;

    // EBIT = EBITDA - D&A
    const ebit = ebitda - da;

    // NOPAT = EBIT × (1 - Tax Rate)
    const nopat = ebit * (1 - params.taxRate / 100);

    // Estimate CapEx (maintenance + growth)
    // CapEx typically runs at 100-150% of D&A depending on growth stage
    const capex = da * sectorParams.capexToDA;

    // Estimate Working Capital change
    // ΔNWC typically 5-15% of revenue growth
    const revenueGrowth = (stock["Revenue Growth"] || 5) / 100;
    const deltaNWC = impliedRevenue * revenueGrowth * sectorParams.nwcToRevGrowth;

    // FCFF = NOPAT + D&A - CapEx - ΔNWC
    // Or equivalently: EBIT(1-T) + D&A - CapEx - ΔNWC
    fcff = nopat + da - capex - deltaNWC;

    method = 'EBITDA-Based (NOPAT + D&A - CapEx - ΔNWC)';
    confidence = 'Medium';

    // Store intermediate values for debugging/transparency
    return {
      fcff: Math.max(0, fcff),
      method,
      confidence,
      details: {
        impliedRevenue: Math.round(impliedRevenue),
        ebitda: Math.round(ebitda),
        ebit: Math.round(ebit),
        nopat: Math.round(nopat),
        da: Math.round(da),
        capex: Math.round(capex),
        deltaNWC: Math.round(deltaNWC)
      }
    };
  }

  // METHOD 3: Damodaran's Reinvestment Rate approach
  // FCFF = NOPAT × (1 - Reinvestment Rate)
  // Reinvestment Rate = g / ROIC
  if (stock.ROE && stock["Market Cap"] && stock.PB) {
    // Estimate Net Income from ROE and Book Value
    const bookValue = stock["Market Cap"] / (stock.PB || 2);
    const netIncome = bookValue * (stock.ROE / 100);

    // Estimate ROIC (Return on Invested Capital)
    // ROIC ≈ ROE × (E/V) for approximation, or use 80% of ROE as proxy
    const roic = (stock.ROE / 100) * 0.85;

    // Expected growth rate
    const expectedGrowth = Math.min((stock["Revenue Growth"] || 5) / 100, 0.20);

    // Reinvestment Rate = Growth / ROIC (Damodaran fundamental growth equation)
    // Capped at 80% to avoid negative FCF in high-growth scenarios
    const reinvestmentRate = Math.min(expectedGrowth / Math.max(roic, 0.08), 0.80);

    // Convert Net Income to NOPAT approximation
    // NOPAT ≈ Net Income × (1 + D/E × (1-T)) for rough conversion
    const deRatio = normalizeDeRatio(stock.DE);
    const nopat = netIncome * (1 + deRatio * (1 - params.taxRate / 100));

    // FCFF = NOPAT × (1 - Reinvestment Rate)
    fcff = nopat * (1 - reinvestmentRate);

    method = 'Reinvestment Rate (g/ROIC)';
    confidence = 'Medium-Low';

    return {
      fcff: Math.max(0, fcff),
      method,
      confidence,
      details: {
        netIncome: Math.round(netIncome),
        roic: Math.round(roic * 100) / 100,
        reinvestmentRate: Math.round(reinvestmentRate * 100) / 100,
        nopat: Math.round(nopat)
      }
    };
  }

  // METHOD 4: Sector FCF Yield (last resort)
  // Based on historical FCF/Market Cap ratios by sector
  const sectorFCFYields = {
    'Technology': 0.035,           // Tech: 3.5% FCF yield typical
    'Financial': 0.055,            // Financials: Higher payout
    'Consumer, Cyclical': 0.04,
    'Consumer, Non-cyclical': 0.045,
    'Industrial': 0.045,
    'Basic Materials': 0.05,
    'Energy': 0.06,                // Energy: Higher FCF yield
    'Communications': 0.04,
    'Utilities': 0.055,
    'Healthcare': 0.04,
    'default': 0.045
  };

  const fcfYield = sectorFCFYields[sector] || sectorFCFYields.default;
  fcff = (stock["Market Cap"] || 1000000000) * fcfYield;

  return {
    fcff: Math.max(0, fcff),
    method: 'Sector FCF Yield',
    confidence: 'Low',
    details: { fcfYield }
  };
};

// ============================================================================
// NET DEBT ESTIMATION
// Based on: Rosenbaum & Pearl, CFA Level II
// ============================================================================

/**
 * Calculate Net Debt using balance sheet data or estimation
 *
 * CORRECT FORMULA (per IB standards):
 * Net Debt = Total Debt + Preferred Stock + Minority Interest - Cash & Equivalents
 *
 * For estimation when balance sheet unavailable:
 * Total Debt = Book Equity × D/E ratio (where Book Equity = Market Cap / P/B)
 * Cash = Estimated from current ratio or sector benchmarks
 *
 * @param {Object} stock - Stock object with financial data
 * @returns {Object} Net debt calculation with methodology
 */
const calculateNetDebt = (stock) => {
  const marketCap = stock["Market Cap"] || 1000000000;

  // METHOD 1: Direct balance sheet data (highest accuracy)
  if (stock.TotalDebt !== undefined && stock.Cash !== undefined) {
    const netDebt = stock.TotalDebt - stock.Cash +
                    (stock.PreferredStock || 0) +
                    (stock.MinorityInterest || 0);
    return {
      netDebt,
      totalDebt: stock.TotalDebt,
      cash: stock.Cash,
      method: 'Balance Sheet',
      confidence: 'High'
    };
  }

  // METHOD 2: Estimate from Book Value and D/E ratio
  // Book Equity = Market Cap / P/B
  // Total Debt = Book Equity × D/E
  const pb = stock.PB || 2;
  const bookEquity = marketCap / pb;
  const deRatio = normalizeDeRatio(stock.DE);

  // Total Debt from D/E ratio applied to book equity (not market cap!)
  const totalDebt = bookEquity * deRatio;

  // Estimate Cash using multiple signals
  let estimatedCash;
  let cashMethod = '';

  // Cash estimation hierarchy:
  // 1. If current ratio available, use liquidity-based estimate
  if (stock["Cur Ratio"] && stock["Cur Ratio"] > 0) {
    // Higher current ratio implies more liquid assets
    // Estimate cash as portion of current assets
    // Current Assets ≈ Current Liabilities × Current Ratio
    // Assume short-term debt ≈ 20% of total debt
    const currentLiabilities = totalDebt * 0.20;
    const currentAssets = currentLiabilities * stock["Cur Ratio"];
    // Cash typically 30-50% of current assets
    estimatedCash = currentAssets * 0.35;
    cashMethod = 'Current Ratio';
  }
  // 2. Sector-based cash holdings (% of market cap)
  else {
    const sectorCashRatios = {
      'Technology': 0.15,      // Tech holds more cash
      'Financial': 0.05,       // Banks: different balance sheet
      'Consumer, Cyclical': 0.08,
      'Consumer, Non-cyclical': 0.10,
      'Industrial': 0.07,
      'Basic Materials': 0.06,
      'Energy': 0.08,
      'Communications': 0.10,
      'Utilities': 0.05,
      'Healthcare': 0.12,
      'default': 0.08
    };
    const sector = stock["Industry Sector"] || 'default';
    const cashRatio = sectorCashRatios[sector] || sectorCashRatios.default;
    estimatedCash = marketCap * cashRatio;
    cashMethod = 'Sector Benchmark';
  }

  // Net Debt = Total Debt - Cash
  const netDebt = totalDebt - estimatedCash;

  return {
    netDebt: Math.max(-marketCap * 0.5, netDebt), // Floor at -50% market cap (net cash position)
    totalDebt: Math.round(totalDebt),
    cash: Math.round(estimatedCash),
    bookEquity: Math.round(bookEquity),
    method: `Estimated (D/E: ${(deRatio * 100).toFixed(0)}%, Cash: ${cashMethod})`,
    confidence: 'Medium'
  };
};

// ============================================================================
// DCF VALUATION MODEL
// Two-stage DCF with explicit forecast period + terminal value
// Based on: Damodaran, CFA Level II, McKinsey Valuation
// ============================================================================

/**
 * Full DCF Valuation with institutional-grade methodology
 *
 * KEY IMPROVEMENTS:
 * 1. Proper FCFF calculation (NOPAT + D&A - CapEx - ΔNWC)
 * 2. Balance sheet-derived Net Debt
 * 3. Terminal Value sanity checks per McKinsey
 * 4. H-model growth decay with 10-year option for high growth
 * 5. Confidence scoring based on data quality
 *
 * @param {Object} stock - Stock object with financial data
 * @param {string} region - 'Indonesia' or 'US'
 * @returns {Object} Complete DCF analysis
 */
export const calculateDCF = (stock, region) => {
  const params = DCF_ASSUMPTIONS[region] || DCF_ASSUMPTIONS.US;
  const waccData = calculateWACC(stock, region);
  const wacc = waccData.wacc;

  // Base FCF estimation using improved methodology
  const fcfData = estimateFCFF(stock, region);
  const baseFCF = fcfData.fcff;

  // Growth rate assumptions (decay from current to terminal)
  // Cap current growth at reasonable levels
  const rawGrowth = stock["Revenue Growth"] || 8;
  const currentGrowth = Math.min(35, Math.max(-15, rawGrowth));
  const terminalGrowth = params.terminalGrowth;

  // Determine forecast period based on growth profile (McKinsey approach)
  // High growth companies warrant longer explicit forecast
  const isHighGrowth = currentGrowth > 15;
  const forecastYears = isHighGrowth ? 10 : 5;

  // H-Model style decay: linear convergence to terminal growth
  // This is more theoretically sound than step functions
  const growthRates = [];
  for (let year = 1; year <= forecastYears; year++) {
    // Linear interpolation from current to terminal growth
    const decayFactor = (forecastYears - year) / forecastYears;
    const yearGrowth = terminalGrowth + (currentGrowth - terminalGrowth) * decayFactor;
    growthRates.push(yearGrowth);
  }

  // Project FCFs and discount
  let projectedFCFs = [];
  let discountedFCFs = [];
  let cumulativeFCF = baseFCF;

  for (let year = 1; year <= forecastYears; year++) {
    const growthRate = growthRates[year - 1] / 100;
    cumulativeFCF = cumulativeFCF * (1 + growthRate);
    projectedFCFs.push(cumulativeFCF);

    const discountFactor = Math.pow(1 + wacc / 100, year);
    discountedFCFs.push(cumulativeFCF / discountFactor);
  }

  // Terminal Value using Gordon Growth Model
  // TV = FCF_n × (1 + g) / (WACC - g)
  const finalFCF = projectedFCFs[forecastYears - 1];
  const terminalFCF = finalFCF * (1 + terminalGrowth / 100);

  // CRITICAL: WACC must exceed terminal growth
  // If not, the model is mathematically invalid
  let terminalValueWarning = null;
  let effectiveWACC = wacc;

  if (wacc <= terminalGrowth) {
    // This indicates a fundamental problem with assumptions
    effectiveWACC = terminalGrowth + 3; // Force minimum 3% spread
    terminalValueWarning = 'WACC adjusted: Original WACC <= terminal growth rate';
  } else if (wacc - terminalGrowth < 2) {
    terminalValueWarning = 'Low WACC-g spread may inflate terminal value';
  }

  const terminalValue = terminalFCF / ((effectiveWACC - terminalGrowth) / 100);
  const discountedTV = terminalValue / Math.pow(1 + wacc / 100, forecastYears);

  // Enterprise Value
  const pvFCF = discountedFCFs.reduce((a, b) => a + b, 0);
  const enterpriseValue = pvFCF + discountedTV;

  // Terminal Value as % of EV (McKinsey sanity check)
  const tvPercentage = (discountedTV / enterpriseValue) * 100;

  // TV% sanity checks per McKinsey Valuation
  let tvSanityCheck = 'Pass';
  if (tvPercentage > 85) {
    tvSanityCheck = 'Fail: TV > 85% of EV - model may be unreliable';
    if (!terminalValueWarning) terminalValueWarning = 'High terminal value concentration';
  } else if (tvPercentage > 75) {
    tvSanityCheck = 'Warning: TV > 75% of EV - review growth assumptions';
  } else if (tvPercentage < 40) {
    tvSanityCheck = 'Note: Low TV% - verify explicit period FCFs';
  }

  // Net Debt using improved calculation
  const netDebtData = calculateNetDebt(stock);
  const netDebt = netDebtData.netDebt;

  // Equity Value = Enterprise Value - Net Debt
  const marketCap = stock["Market Cap"] || 1000000000;
  const equityValue = Math.max(0, enterpriseValue - netDebt);

  // Fair Value per Share
  // Implied price = Current Price × (Equity Value / Market Cap)
  const currentPrice = stock.Price || 1000;
  const fairValue = currentPrice * (equityValue / marketCap);

  // Upside/Downside
  const upside = ((fairValue - currentPrice) / currentPrice) * 100;

  // Comprehensive confidence scoring
  let confidenceScore = 50; // Base score
  let confidenceFactors = [];

  // Data quality factors
  if (stock.FCF) { confidenceScore += 15; confidenceFactors.push('+FCF data'); }
  if (stock.Beta) { confidenceScore += 10; confidenceFactors.push('+Beta'); }
  if (stock["EBITDA Margin"]) { confidenceScore += 10; confidenceFactors.push('+EBITDA'); }
  if (stock.InterestCoverage) { confidenceScore += 5; confidenceFactors.push('+ICR'); }
  if (stock.TotalDebt !== undefined) { confidenceScore += 10; confidenceFactors.push('+B/S Debt'); }

  // Penalty factors
  if (tvPercentage > 80) { confidenceScore -= 15; confidenceFactors.push('-High TV%'); }
  if (terminalValueWarning) { confidenceScore -= 10; confidenceFactors.push('-TV Warning'); }
  if (fcfData.confidence === 'Low') { confidenceScore -= 15; confidenceFactors.push('-Low FCF conf'); }

  let confidence;
  if (confidenceScore >= 75) confidence = 'High';
  else if (confidenceScore >= 55) confidence = 'Medium';
  else if (confidenceScore >= 40) confidence = 'Medium-Low';
  else confidence = 'Low';

  return {
    fairValue: Math.round(fairValue * 100) / 100,
    upside: Math.round(upside * 10) / 10,
    wacc: waccData.wacc,
    waccDetails: waccData,
    enterpriseValue: Math.round(enterpriseValue),
    equityValue: Math.round(equityValue),
    terminalValue: Math.round(discountedTV),
    terminalValuePct: Math.round(tvPercentage),
    tvSanityCheck,
    pvFCF: Math.round(pvFCF),
    netDebt: Math.round(netDebt),
    netDebtDetails: netDebtData,
    projectedFCFs: projectedFCFs.map(f => Math.round(f)),
    discountedFCFs: discountedFCFs.map(f => Math.round(f)),
    growthRates: growthRates.map(g => Math.round(g * 10) / 10),
    baseFCF: Math.round(baseFCF),
    fcfMethod: fcfData.method,
    fcfDetails: fcfData.details,
    forecastYears,
    assumptions: params,
    confidence,
    confidenceScore,
    confidenceFactors,
    warnings: terminalValueWarning ? [terminalValueWarning] : []
  };
};

// ============================================================================
// COMPARABLE COMPANY ANALYSIS
// Based on: Rosenbaum & Pearl, Morgan Stanley, Goldman Sachs methodologies
// ============================================================================

/**
 * Calculate EV/EBITDA multiple with improved EV calculation
 * Note: EV/EBITDA is NOT applicable to financial companies
 *
 * @param {Object} stock - Stock object
 * @returns {number|null} EV/EBITDA multiple
 */
const calculateEVEBITDA = (stock) => {
  // CRITICAL: EV/EBITDA is meaningless for financials
  // Banks/Insurance don't have traditional "EBITDA"
  const sector = stock["Industry Sector"] || '';
  if (sector.includes('Financial') || sector.includes('Bank') || sector.includes('Insurance')) {
    return null;
  }

  if (!stock["EBITDA Margin"] || !stock["Market Cap"]) return null;

  // Estimate EBITDA from margin
  const impliedRevenue = stock["Market Cap"] / (stock.PS || 2);
  const ebitda = impliedRevenue * (stock["EBITDA Margin"] / 100);

  if (ebitda <= 0) return null;

  // Calculate EV using improved Net Debt methodology
  const netDebtData = calculateNetDebt(stock);
  const ev = stock["Market Cap"] + netDebtData.netDebt;

  if (ev <= 0) return null;

  return ev / ebitda;
};

/**
 * Calculate P/Tangible Book Value (important for financials)
 * P/TBV = Price / (Book Value - Intangibles - Goodwill)
 *
 * @param {Object} stock - Stock object
 * @returns {number|null} P/TBV multiple
 */
const calculatePTBV = (stock) => {
  // If we have tangible book data
  if (stock.PTBV) return stock.PTBV;

  // Estimate: Assume intangibles are ~20% of book value for financials
  // This is a rough proxy; actual data is preferred
  if (stock.PB) {
    const sector = stock["Industry Sector"] || '';
    if (sector.includes('Financial') || sector.includes('Bank')) {
      // Banks typically have lower intangibles ratio
      return stock.PB * 1.05; // Slight premium as TBV < BV
    }
    // For others, assume higher intangibles
    return stock.PB * 1.15;
  }

  return null;
};

/**
 * Statistical helper functions
 */
const calculateStats = (arr) => {
  if (!arr || arr.length === 0) return null;

  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;

  const mean = arr.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 ? sorted[Math.floor(n / 2)] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const min = sorted[0];
  const max = sorted[n - 1];

  // 25th and 75th percentile for trading range
  const p25 = sorted[Math.floor(n * 0.25)];
  const p75 = sorted[Math.floor(n * 0.75)];

  return { mean, median, min, max, p25, p75, count: n };
};

/**
 * Comprehensive Comparable Company Analysis
 * With institutional-grade methodology
 *
 * KEY IMPROVEMENTS:
 * 1. Tighter peer selection (0.33x to 3x market cap)
 * 2. EV/EBITDA excluded for financials
 * 3. P/TBV added for banks
 * 4. Growth-adjusted peer matching
 * 5. Statistical range reporting (25th/75th percentile)
 *
 * @param {Object} stock - Target stock
 * @param {Array} allStocks - All available stocks for comparison
 * @returns {Object} Comps analysis results
 */
export const calculateComparables = (stock, allStocks) => {
  if (!stock || !allStocks || allStocks.length === 0) return null;

  const marketCap = stock["Market Cap"] || 0;
  if (marketCap === 0) return null;

  const sector = stock["Industry Sector"] || '';
  const isFinancial = sector.includes('Financial') || sector.includes('Bank') || sector.includes('Insurance');

  // TIGHTENED peer selection criteria (per Rosenbaum & Pearl)
  // Standard: 0.5x to 2x market cap
  // Relaxed: 0.33x to 3x market cap (if insufficient peers)
  const tightLower = marketCap * 0.5;
  const tightUpper = marketCap * 2.0;
  const relaxedLower = marketCap * 0.33;
  const relaxedUpper = marketCap * 3.0;

  // Primary peer criteria
  const primaryFilter = (s) =>
    s["Industry Sector"] === stock["Industry Sector"] &&
    s.Region === stock.Region &&
    s.Ticker !== stock.Ticker &&
    s["Market Cap"] &&
    s["Market Cap"] >= tightLower &&
    s["Market Cap"] <= tightUpper &&
    s.PE && s.PE > 0 && s.PE < 100;

  // Relaxed peer criteria (same sector, any region, wider size)
  const relaxedFilter = (s) =>
    s["Industry Sector"] === stock["Industry Sector"] &&
    s.Ticker !== stock.Ticker &&
    s["Market Cap"] &&
    s["Market Cap"] >= relaxedLower &&
    s["Market Cap"] <= relaxedUpper &&
    s.PE && s.PE > 0 && s.PE < 100;

  // Cross-sector fallback (same industry group)
  const crossSectorFilter = (s) =>
    s["Industry Group"] === stock["Industry Group"] &&
    s.Ticker !== stock.Ticker &&
    s["Market Cap"] &&
    s["Market Cap"] >= relaxedLower &&
    s["Market Cap"] <= relaxedUpper &&
    s.PE && s.PE > 0 && s.PE < 100;

  // Try tightest criteria first, then expand
  let peers = allStocks.filter(primaryFilter);
  let selectionMethod = 'Primary (same sector/region, 0.5-2x cap)';

  if (peers.length < 4) {
    peers = allStocks.filter(relaxedFilter);
    selectionMethod = 'Relaxed (same sector, any region, 0.33-3x cap)';
  }

  if (peers.length < 3) {
    peers = allStocks.filter(crossSectorFilter);
    selectionMethod = 'Expanded (same industry group)';
  }

  // Score peers by similarity and take top 8
  peers = peers
    .map(p => {
      let similarityScore = 0;

      // Market cap proximity (most important)
      const capRatio = p["Market Cap"] / marketCap;
      if (capRatio >= 0.5 && capRatio <= 2.0) similarityScore += 30;
      else if (capRatio >= 0.33 && capRatio <= 3.0) similarityScore += 20;
      else similarityScore += 10;

      // Same region bonus
      if (p.Region === stock.Region) similarityScore += 20;

      // Growth profile similarity
      const targetGrowth = stock["Revenue Growth"] || 5;
      const peerGrowth = p["Revenue Growth"] || 5;
      const growthDiff = Math.abs(targetGrowth - peerGrowth);
      if (growthDiff < 5) similarityScore += 15;
      else if (growthDiff < 10) similarityScore += 10;
      else similarityScore += 5;

      // Profitability similarity
      const targetMargin = stock["EBITDA Margin"] || 15;
      const peerMargin = p["EBITDA Margin"] || 15;
      const marginDiff = Math.abs(targetMargin - peerMargin);
      if (marginDiff < 5) similarityScore += 15;
      else if (marginDiff < 10) similarityScore += 10;

      return { ...p, similarityScore, capDiff: Math.abs(p["Market Cap"] - marketCap) };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore || a.capDiff - b.capDiff)
    .slice(0, 8);

  if (peers.length === 0) return null;

  // Extract multiples from peers
  const peValues = peers.map(p => p.PE).filter(v => v > 0 && v < 80);
  const pbValues = peers.map(p => p.PB).filter(v => v > 0 && v < 15);

  // EV/EBITDA only for non-financials
  const evEbitdaValues = isFinancial
    ? []
    : peers.map(p => calculateEVEBITDA(p)).filter(v => v && v > 0 && v < 25);

  // P/TBV for financials
  const ptbvValues = isFinancial
    ? peers.map(p => calculatePTBV(p)).filter(v => v && v > 0 && v < 10)
    : [];

  // Calculate comprehensive statistics
  const peStats = calculateStats(peValues);
  const pbStats = calculateStats(pbValues);
  const evEbitdaStats = calculateStats(evEbitdaValues);
  const ptbvStats = calculateStats(ptbvValues);

  // Calculate stock's own multiples
  const stockEVEBITDA = isFinancial ? null : calculateEVEBITDA(stock);
  const stockPTBV = isFinancial ? calculatePTBV(stock) : null;

  // Calculate implied valuations
  const currentPrice = stock.Price || 1000;

  // EPS = Price / PE
  const eps = stock.PE && stock.PE > 0 ? currentPrice / stock.PE : 0;
  // Book Value per Share = Price / PB
  const bvps = stock.PB && stock.PB > 0 ? currentPrice / stock.PB : 0;
  // Tangible Book Value per Share
  const tbvps = stockPTBV && stockPTBV > 0 ? currentPrice / stockPTBV : 0;

  const impliedValuePE = peStats?.median && eps ? peStats.median * eps : null;
  const impliedValuePB = pbStats?.median && bvps ? pbStats.median * bvps : null;
  const impliedValuePTBV = ptbvStats?.median && tbvps ? ptbvStats.median * tbvps : null;

  // EV/EBITDA implied value (only for non-financials)
  let impliedValueEVEBITDA = null;
  if (!isFinancial && evEbitdaStats?.median && stock["EBITDA Margin"] && stock["Market Cap"]) {
    const impliedRevenue = stock["Market Cap"] / (stock.PS || 2);
    const ebitda = impliedRevenue * (stock["EBITDA Margin"] / 100);
    const netDebtData = calculateNetDebt(stock);

    const impliedEV = evEbitdaStats.median * ebitda;
    const impliedEquity = impliedEV - netDebtData.netDebt;
    impliedValueEVEBITDA = currentPrice * (impliedEquity / stock["Market Cap"]);
  }

  // SECTOR-SPECIFIC WEIGHTING (per industry best practice)
  let weights;
  let methodologyNote;

  if (isFinancial) {
    // BANKS/INSURANCE: P/E and P/B (or P/TBV) only
    // EV/EBITDA is meaningless for financials
    weights = {
      pe: 0.40,
      pb: ptbvStats ? 0.30 : 0.60,  // If we have P/TBV, split with P/B
      ptbv: ptbvStats ? 0.30 : 0,
      evEbitda: 0  // ZERO weight for financials
    };
    methodologyNote = 'Financial sector: P/E and P/TBV weighted (EV/EBITDA excluded)';
  } else if (sector.includes('Technology') || sector.includes('Communications')) {
    // TECH: Higher weight on EV/EBITDA and growth-adjusted metrics
    weights = { pe: 0.30, pb: 0.15, ptbv: 0, evEbitda: 0.55 };
    methodologyNote = 'Tech/Comms sector: EV/EBITDA emphasized';
  } else if (sector.includes('Industrial') || sector.includes('Material') || sector.includes('Energy')) {
    // CYCLICALS: Balance between P/E and EV/EBITDA
    weights = { pe: 0.35, pb: 0.20, ptbv: 0, evEbitda: 0.45 };
    methodologyNote = 'Cyclical sector: Balanced P/E and EV/EBITDA';
  } else if (sector.includes('Consumer')) {
    // CONSUMER: Higher P/E weight (earnings quality important)
    weights = { pe: 0.45, pb: 0.25, ptbv: 0, evEbitda: 0.30 };
    methodologyNote = 'Consumer sector: P/E emphasized';
  } else if (sector.includes('Utilities')) {
    // UTILITIES: Dividend and asset-based
    weights = { pe: 0.40, pb: 0.35, ptbv: 0, evEbitda: 0.25 };
    methodologyNote = 'Utilities: P/E and P/B weighted';
  } else {
    // DEFAULT
    weights = { pe: 0.40, pb: 0.25, ptbv: 0, evEbitda: 0.35 };
    methodologyNote = 'Default sector weighting';
  }

  // Weighted average implied value
  let weightedSum = 0;
  let totalWeight = 0;

  if (impliedValuePE) { weightedSum += impliedValuePE * weights.pe; totalWeight += weights.pe; }
  if (impliedValuePB) { weightedSum += impliedValuePB * weights.pb; totalWeight += weights.pb; }
  if (impliedValuePTBV) { weightedSum += impliedValuePTBV * weights.ptbv; totalWeight += weights.ptbv; }
  if (impliedValueEVEBITDA) { weightedSum += impliedValueEVEBITDA * weights.evEbitda; totalWeight += weights.evEbitda; }

  const avgImpliedValue = totalWeight > 0 ? weightedSum / totalWeight : currentPrice;

  // Premium/Discount analysis
  const premiumPE = peStats?.median && stock.PE ? ((stock.PE - peStats.median) / peStats.median) * 100 : null;
  const premiumPB = pbStats?.median && stock.PB ? ((stock.PB - pbStats.median) / pbStats.median) * 100 : null;
  const premiumEVEBITDA = evEbitdaStats?.median && stockEVEBITDA
    ? ((stockEVEBITDA - evEbitdaStats.median) / evEbitdaStats.median) * 100 : null;

  // Upside calculation
  const compsUpside = ((avgImpliedValue - currentPrice) / currentPrice) * 100;

  // Trading range (25th to 75th percentile implied values)
  const tradingRange = {
    low: null,
    high: null
  };
  if (peStats?.p25 && eps) {
    tradingRange.low = Math.round(peStats.p25 * eps * 100) / 100;
    tradingRange.high = Math.round(peStats.p75 * eps * 100) / 100;
  }

  return {
    // Peer information
    peers: peers.map(p => ({
      ticker: p.Ticker,
      name: p.Name || p.name,
      marketCap: p["Market Cap"],
      pe: p.PE,
      pb: p.PB,
      evEbitda: isFinancial ? null : calculateEVEBITDA(p),
      ptbv: isFinancial ? calculatePTBV(p) : null,
      revenueGrowth: p["Revenue Growth"],
      similarityScore: p.similarityScore
    })),
    peerCount: peers.length,
    selectionMethod,

    // Statistical summaries (median, mean, range)
    peStats: peStats ? {
      median: Math.round(peStats.median * 10) / 10,
      mean: Math.round(peStats.mean * 10) / 10,
      range: `${peStats.min.toFixed(1)}x - ${peStats.max.toFixed(1)}x`,
      p25: Math.round(peStats.p25 * 10) / 10,
      p75: Math.round(peStats.p75 * 10) / 10
    } : null,
    pbStats: pbStats ? {
      median: Math.round(pbStats.median * 10) / 10,
      mean: Math.round(pbStats.mean * 10) / 10,
      range: `${pbStats.min.toFixed(1)}x - ${pbStats.max.toFixed(1)}x`
    } : null,
    evEbitdaStats: evEbitdaStats ? {
      median: Math.round(evEbitdaStats.median * 10) / 10,
      mean: Math.round(evEbitdaStats.mean * 10) / 10,
      range: `${evEbitdaStats.min.toFixed(1)}x - ${evEbitdaStats.max.toFixed(1)}x`
    } : null,
    ptbvStats: ptbvStats ? {
      median: Math.round(ptbvStats.median * 10) / 10,
      range: `${ptbvStats.min.toFixed(1)}x - ${ptbvStats.max.toFixed(1)}x`
    } : null,

    // Legacy format for backward compatibility
    medianPE: peStats ? Math.round(peStats.median * 10) / 10 : null,
    medianPB: pbStats ? Math.round(pbStats.median * 10) / 10 : null,
    medianEVEBITDA: evEbitdaStats ? Math.round(evEbitdaStats.median * 10) / 10 : null,
    medianPTBV: ptbvStats ? Math.round(ptbvStats.median * 10) / 10 : null,

    // Stock's current multiples
    stockPE: stock.PE ? Math.round(stock.PE * 10) / 10 : null,
    stockPB: stock.PB ? Math.round(stock.PB * 10) / 10 : null,
    stockEVEBITDA: stockEVEBITDA ? Math.round(stockEVEBITDA * 10) / 10 : null,
    stockPTBV: stockPTBV ? Math.round(stockPTBV * 10) / 10 : null,

    // Premium/Discount vs peers
    premiumPE: premiumPE ? Math.round(premiumPE) : null,
    premiumPB: premiumPB ? Math.round(premiumPB) : null,
    premiumEVEBITDA: premiumEVEBITDA ? Math.round(premiumEVEBITDA) : null,

    // Implied values by method
    impliedValuePE: impliedValuePE ? Math.round(impliedValuePE * 100) / 100 : null,
    impliedValuePB: impliedValuePB ? Math.round(impliedValuePB * 100) / 100 : null,
    impliedValueEVEBITDA: impliedValueEVEBITDA ? Math.round(impliedValueEVEBITDA * 100) / 100 : null,
    impliedValuePTBV: impliedValuePTBV ? Math.round(impliedValuePTBV * 100) / 100 : null,

    // Final weighted implied value
    avgImpliedValue: Math.round(avgImpliedValue * 100) / 100,
    upside: Math.round(compsUpside * 10) / 10,

    // Trading range
    tradingRange,

    // Methodology info
    weights,
    methodologyNote,
    sector,
    isFinancial
  };
};

// ============================================================================
// BLENDED VALUATION (DCF + Comps)
// Based on: Investment Banking best practices
// ============================================================================

/**
 * Calculate blended fair value from DCF and Comps
 *
 * Standard weighting: 60% DCF, 40% Comps
 * Adjusted based on data quality and model confidence
 *
 * @param {Object} dcfResult - DCF valuation result
 * @param {Object} compsResult - Comps valuation result
 * @param {number} currentPrice - Current stock price
 * @returns {Object} Blended valuation with methodology details
 */
export const calculateBlendedValuation = (dcfResult, compsResult, currentPrice) => {
  if (!dcfResult && !compsResult) return null;

  const dcfFairValue = dcfResult?.fairValue || currentPrice;
  const compsFairValue = compsResult?.avgImpliedValue || currentPrice;

  // Dynamic weighting based on confidence levels
  let dcfWeight = 0.60;
  let compsWeight = 0.40;
  let weightingNote = 'Standard IB weighting';

  // Adjust weights based on DCF confidence
  if (dcfResult?.confidence === 'High') {
    dcfWeight = 0.65;
    compsWeight = 0.35;
    weightingNote = 'Increased DCF weight (high confidence)';
  } else if (dcfResult?.confidence === 'Low') {
    dcfWeight = 0.45;
    compsWeight = 0.55;
    weightingNote = 'Reduced DCF weight (low confidence)';
  }

  // If TV% is too high, reduce DCF weight
  if (dcfResult?.terminalValuePct > 80) {
    dcfWeight = Math.min(dcfWeight, 0.50);
    compsWeight = 1 - dcfWeight;
    weightingNote = 'Reduced DCF weight (high terminal value %)';
  }

  // If we have very few peers, reduce Comps weight
  if (compsResult?.peerCount < 3) {
    compsWeight = Math.min(compsWeight, 0.30);
    dcfWeight = 1 - compsWeight;
    weightingNote = 'Reduced Comps weight (limited peers)';
  }

  const blendedFairValue = (dcfFairValue * dcfWeight) + (compsFairValue * compsWeight);
  const blendedUpside = ((blendedFairValue - currentPrice) / currentPrice) * 100;

  // Calculate valuation range
  const dcfUpside = dcfResult?.upside || 0;
  const compsUpside = compsResult?.upside || 0;
  const upsideSpread = Math.abs(dcfUpside - compsUpside);

  let convergence;
  if (upsideSpread < 10) convergence = 'High';
  else if (upsideSpread < 25) convergence = 'Medium';
  else convergence = 'Low';

  return {
    fairValue: Math.round(blendedFairValue * 100) / 100,
    upside: Math.round(blendedUpside * 10) / 10,
    dcfFairValue: Math.round(dcfFairValue * 100) / 100,
    compsFairValue: Math.round(compsFairValue * 100) / 100,
    dcfUpside: dcfResult?.upside || 0,
    compsUpside: compsResult?.upside || 0,
    dcfWeight: Math.round(dcfWeight * 100),
    compsWeight: Math.round(compsWeight * 100),
    dcfContribution: Math.round(dcfFairValue * dcfWeight * 100) / 100,
    compsContribution: Math.round(compsFairValue * compsWeight * 100) / 100,
    methodology: `DCF (${Math.round(dcfWeight * 100)}%) + Comps (${Math.round(compsWeight * 100)}%)`,
    weightingNote,
    convergence,
    upsideSpread: Math.round(upsideSpread * 10) / 10,
    dcfConfidence: dcfResult?.confidence,
    compsMethodology: compsResult?.methodologyNote
  };
};

// ============================================================================
// EXPORT HELPERS
// ============================================================================

/**
 * Helper to get sector parameters
 */
export const getSectorParameters = (sector) => {
  return SECTOR_PARAMETERS[sector] || SECTOR_PARAMETERS.default;
};

/**
 * Helper to normalize D/E ratio
 */
export { normalizeDeRatio };
