// ============================================================================
// NATAN EQUITY RESEARCH - FINANCIAL SERVICES VALUATION MODULE
// ============================================================================
// Comprehensive valuation for ALL financial institution types
// Based on:
// - Damodaran (NYU Stern): "Valuing Financial Service Firms"
// - Rosenbaum & Pearl: "Investment Banking" - FIG Chapter
// - CFA Level II: Equity Valuation - Financial Institutions
// - McKinsey: "Valuation of Financial Institutions"
// - Actuarial Standards for Insurance Valuation (Embedded Value)
// ============================================================================

// ============================================================================
// PART 1: GICS CLASSIFICATION & SUB-SECTOR MAPPING
// ============================================================================

export const FINANCIAL_GICS = {
  // Banks
  '401010': { name: 'Diversified Banks', type: 'BANK', methodology: 'BANK_VALUATION' },
  '401020': { name: 'Regional Banks', type: 'BANK', methodology: 'BANK_VALUATION' },
  '401030': { name: 'Thrifts & Mortgage Finance', type: 'BANK', methodology: 'BANK_VALUATION' },

  // Diversified Financials
  '402010': { name: 'Consumer Finance', type: 'CONSUMER_FINANCE', methodology: 'CONSUMER_FINANCE_VALUATION' },
  '402020': { name: 'Asset Management', type: 'ASSET_MANAGEMENT', methodology: 'AUM_VALUATION' },
  '402030': { name: 'Custody Banks', type: 'CUSTODY', methodology: 'AUM_VALUATION' },
  '402040': { name: 'Diversified Financial Services', type: 'DIVERSIFIED', methodology: 'SOTP_VALUATION' },
  '402050': { name: 'Multi-Sector Holdings', type: 'DIVERSIFIED', methodology: 'SOTP_VALUATION' },

  // Insurance
  '403010': { name: 'Life Insurance', type: 'LIFE_INSURANCE', methodology: 'EMBEDDED_VALUE' },
  '403020': { name: 'Property & Casualty Insurance', type: 'PC_INSURANCE', methodology: 'INSURANCE_VALUATION' },
  '403030': { name: 'Reinsurance', type: 'REINSURANCE', methodology: 'INSURANCE_VALUATION' },
  '403040': { name: 'Multi-line Insurance', type: 'MULTI_INSURANCE', methodology: 'SOTP_VALUATION' },

  // Capital Markets (if separate)
  '404010': { name: 'Investment Banking & Brokerage', type: 'INVESTMENT_BANK', methodology: 'IB_VALUATION' },
  '404020': { name: 'Securities Exchanges', type: 'EXCHANGE', methodology: 'FEE_VALUATION' }
};

// Indonesian-specific mappings (Bloomberg Industry Groups)
export const INDONESIA_FIG_MAPPING = {
  'Banks': 'BANK',
  'Financial Services': 'DIVERSIFIED',
  'Insurance': 'MULTI_INSURANCE',
  'Life Insurance': 'LIFE_INSURANCE',
  'Property & Casualty': 'PC_INSURANCE',
  'Consumer Finance': 'CONSUMER_FINANCE',
  'Asset Management': 'ASSET_MANAGEMENT',
  'Investment Companies': 'ASSET_MANAGEMENT',
  'Multi-line Insurance': 'MULTI_INSURANCE',
  'Diversified Financial': 'DIVERSIFIED'
};

// ============================================================================
// PART 2: ASSUMPTIONS BY FINANCIAL SUB-SECTOR
// ============================================================================

export const FIG_ASSUMPTIONS = {
  Indonesia: {
    // Common assumptions
    riskFreeRate: 6.65,
    equityRiskPremium: 6.0,
    countryRiskPremium: 2.5,
    terminalGrowth: 5.0,
    taxRate: 22,

    // Sub-sector specific
    BANK: {
      sustainableROE: 14.0,
      typicalPayoutRatio: 0.40,
      typicalPB: 1.8,
      betaRange: [0.9, 1.4],
      // Regulatory (OJK)
      minCAR: 12.0,
      minTier1: 9.5,
      targetLDR: { min: 78, max: 92 }
    },

    CONSUMER_FINANCE: {
      sustainableROE: 18.0,        // Higher due to higher yields
      typicalPayoutRatio: 0.30,
      typicalPB: 2.0,
      betaRange: [1.2, 1.8],       // Higher risk
      // Regulatory (OJK for multi-finance)
      minGearingRatio: 10.0,      // Max 10x leverage
      maxNPL: 5.0
    },

    LIFE_INSURANCE: {
      sustainableROE: 15.0,
      typicalPayoutRatio: 0.25,
      typicalPEV: 1.2,             // Price to Embedded Value
      betaRange: [0.8, 1.2],
      // Regulatory (OJK)
      minRBC: 120,                 // Risk-Based Capital min 120%
      solvencyTarget: 150
    },

    PC_INSURANCE: {
      sustainableROE: 12.0,
      typicalPayoutRatio: 0.35,
      typicalPB: 1.5,
      betaRange: [0.7, 1.1],
      // Underwriting targets
      targetCombinedRatio: 95,
      targetLossRatio: 65
    },

    ASSET_MANAGEMENT: {
      sustainableROE: 20.0,
      typicalPayoutRatio: 0.50,
      typicalAUMMultiple: 0.02,    // 2% of AUM
      betaRange: [1.0, 1.5],
      avgFeeRate: 0.0075           // 75 bps average fee
    },

    INVESTMENT_BANK: {
      sustainableROE: 15.0,
      typicalPayoutRatio: 0.40,
      revenueMultiple: 2.5,
      betaRange: [1.3, 1.8]
    },

    DIVERSIFIED: {
      sustainableROE: 14.0,
      typicalPayoutRatio: 0.35,
      typicalPB: 1.5,
      betaRange: [1.0, 1.4],
      holdingDiscount: 0.15        // 15% holding company discount
    }
  }
};

// ============================================================================
// PART 3: BANK VALUATION (Enhanced from previous)
// ============================================================================

/**
 * Calculate Cost of Equity for any financial institution
 */
export const calculateFIGCostOfEquity = (firm, type, region = 'Indonesia') => {
  const assumptions = FIG_ASSUMPTIONS[region];
  const typeAssumptions = assumptions[type] || assumptions.BANK;

  const beta = firm.beta || (typeAssumptions.betaRange[0] + typeAssumptions.betaRange[1]) / 2;

  const costOfEquity = assumptions.riskFreeRate +
    beta * (assumptions.equityRiskPremium + assumptions.countryRiskPremium);

  return {
    costOfEquity: Math.round(costOfEquity * 100) / 100,
    riskFreeRate: assumptions.riskFreeRate,
    beta,
    erp: assumptions.equityRiskPremium,
    crp: assumptions.countryRiskPremium
  };
};

/**
 * Bank Valuation using Residual Income Model
 * Value = Book Value + PV of Excess Returns
 */
export const calculateBankResidualIncome = (bank, region = 'Indonesia') => {
  const assumptions = FIG_ASSUMPTIONS[region];
  const bankAssumptions = assumptions.BANK;
  const { costOfEquity } = calculateFIGCostOfEquity(bank, 'BANK', region);
  const ke = costOfEquity / 100;

  const roe = (bank.roe || bank.ROE || 15) / 100;
  const terminalROE = bankAssumptions.sustainableROE / 100;
  const terminalGrowth = assumptions.terminalGrowth / 100;
  const payoutRatio = bank.payoutRatio || bankAssumptions.typicalPayoutRatio;

  const currentBV = bank.bookValuePerShare || (bank.price / (bank.pb || bank.PB || 1.5));

  let bv = currentBV;
  let totalPVRI = 0;

  // Project 5 years of residual income
  for (let year = 1; year <= 5; year++) {
    const decayFactor = (5 - year) / 5;
    const yearROE = roe * decayFactor + terminalROE * (1 - decayFactor);
    const ri = (yearROE - ke) * bv;
    totalPVRI += ri / Math.pow(1 + ke, year);
    bv = bv * (1 + yearROE * (1 - payoutRatio));
  }

  // Terminal value
  const terminalRI = (terminalROE - ke) * bv;
  const terminalValue = terminalRI / (ke - terminalGrowth);
  const pvTerminal = terminalValue / Math.pow(1 + ke, 5);

  const intrinsicValue = currentBV + totalPVRI + pvTerminal;
  const upside = ((intrinsicValue - bank.price) / bank.price) * 100;

  return {
    model: 'Residual Income (Bank)',
    intrinsicValue: Math.round(intrinsicValue),
    currentPrice: bank.price,
    upside: Math.round(upside * 10) / 10,
    costOfEquity,
    currentROE: (roe * 100).toFixed(1),
    spreadOverKe: Math.round((roe - ke) * 1000) / 10,
    impliedPB: Math.round((intrinsicValue / currentBV) * 100) / 100,
    isValueCreator: roe > ke
  };
};

/**
 * Fair P/B from Gordon Growth for Banks
 * P/B = (ROE - g) / (Ke - g)
 */
export const calculateBankFairPB = (bank, region = 'Indonesia') => {
  const assumptions = FIG_ASSUMPTIONS[region];
  const { costOfEquity } = calculateFIGCostOfEquity(bank, 'BANK', region);
  const ke = costOfEquity / 100;

  const roe = (bank.roe || bank.ROE || 15) / 100;
  const g = Math.min(assumptions.terminalGrowth / 100, roe * 0.6);

  let fairPB = (roe - g) / (ke - g);
  fairPB = Math.max(0.3, Math.min(fairPB, 5.0));

  const currentPB = bank.pb || bank.PB || 1.5;
  const bvps = bank.bookValuePerShare || (bank.price / currentPB);
  const fairPrice = bvps * fairPB;
  const upside = ((fairPrice - bank.price) / bank.price) * 100;

  return {
    model: 'Gordon Growth P/B (Bank)',
    fairPB: Math.round(fairPB * 100) / 100,
    currentPB,
    fairPrice: Math.round(fairPrice),
    currentPrice: bank.price,
    upside: Math.round(upside * 10) / 10,
    roe: (roe * 100).toFixed(1),
    costOfEquity,
    isValueCreator: roe > ke
  };
};

// ============================================================================
// PART 4: INSURANCE VALUATION - EMBEDDED VALUE (Life Insurance)
// ============================================================================

/**
 * Embedded Value Model for Life Insurance
 *
 * Embedded Value (EV) = Adjusted Net Worth (ANW) + Value of In-Force Business (VIF)
 *
 * Where:
 * - ANW = Net Asset Value adjusted for prudential reserves
 * - VIF = Present Value of future profits from existing policies
 *
 * Trading multiple: P/EV (Price to Embedded Value)
 *
 * Source: European Embedded Value (EEV) Principles, CFO Forum
 */
export const calculateLifeInsuranceEV = (insurer, region = 'Indonesia') => {
  const assumptions = FIG_ASSUMPTIONS[region];
  const lifeAssumptions = assumptions.LIFE_INSURANCE;
  const { costOfEquity } = calculateFIGCostOfEquity(insurer, 'LIFE_INSURANCE', region);

  // Components of Embedded Value
  const adjustedNetWorth = insurer.adjustedNetWorth ||
    insurer.bookValue ||
    (insurer.price * insurer.sharesOutstanding / (insurer.pev || 1.0));

  const valueInForce = insurer.valueInForce ||
    adjustedNetWorth * 0.5; // Estimate if not provided

  const embeddedValue = adjustedNetWorth + valueInForce;

  // Value of New Business (VNB) - key growth metric
  const vnb = insurer.vnb || embeddedValue * 0.08; // 8% VNB margin typical
  const vnbMargin = insurer.vnbMargin || 8.0;

  // Current P/EV
  const marketCap = insurer.marketCap || insurer.price * (insurer.sharesOutstanding || 1000);
  const currentPEV = marketCap / embeddedValue;

  // Fair P/EV based on VNB growth
  const vnbGrowth = insurer.vnbGrowth || 10; // % growth
  const fairPEV = lifeAssumptions.typicalPEV * (1 + vnbGrowth / 100);

  const fairMarketCap = embeddedValue * fairPEV;
  const fairPrice = fairMarketCap / (insurer.sharesOutstanding || (marketCap / insurer.price));
  const upside = ((fairPrice - insurer.price) / insurer.price) * 100;

  return {
    model: 'Embedded Value (Life Insurance)',
    embeddedValue: Math.round(embeddedValue),
    adjustedNetWorth: Math.round(adjustedNetWorth),
    valueInForce: Math.round(valueInForce),
    vnb: Math.round(vnb),
    vnbMargin,

    currentPEV: Math.round(currentPEV * 100) / 100,
    fairPEV: Math.round(fairPEV * 100) / 100,

    fairPrice: Math.round(fairPrice),
    currentPrice: insurer.price,
    upside: Math.round(upside * 10) / 10,

    costOfEquity,
    // Quality metrics
    solvencyRatio: insurer.solvencyRatio || insurer.rbc || 200,
    persistencyRatio: insurer.persistencyRatio || 85
  };
};

/**
 * Alternative: Appraisal Value for Life Insurance
 * Appraisal Value = EV + Franchise Value (value of future new business)
 */
export const calculateLifeInsuranceAppraisal = (insurer, region = 'Indonesia') => {
  const evResult = calculateLifeInsuranceEV(insurer, region);
  const assumptions = FIG_ASSUMPTIONS[region];
  const { costOfEquity } = calculateFIGCostOfEquity(insurer, 'LIFE_INSURANCE', region);
  const ke = costOfEquity / 100;

  // Franchise Value = PV of future VNB stream
  const vnb = evResult.vnb;
  const vnbGrowth = (insurer.vnbGrowth || 10) / 100;
  const terminalGrowth = assumptions.terminalGrowth / 100;

  // 5-year high growth then terminal
  let franchiseValue = 0;
  let projectedVNB = vnb;

  for (let year = 1; year <= 5; year++) {
    projectedVNB = projectedVNB * (1 + vnbGrowth * ((5 - year) / 5) + terminalGrowth * (year / 5));
    franchiseValue += projectedVNB / Math.pow(1 + ke, year);
  }

  // Terminal franchise value
  const terminalVNB = projectedVNB * (1 + terminalGrowth);
  const terminalFranchise = terminalVNB / (ke - terminalGrowth);
  franchiseValue += terminalFranchise / Math.pow(1 + ke, 5);

  const appraisalValue = evResult.embeddedValue + franchiseValue;
  const marketCap = insurer.marketCap || insurer.price * (insurer.sharesOutstanding || 1000);
  const fairPrice = appraisalValue / (marketCap / insurer.price);
  const upside = ((fairPrice - insurer.price) / insurer.price) * 100;

  return {
    model: 'Appraisal Value (Life Insurance)',
    appraisalValue: Math.round(appraisalValue),
    embeddedValue: evResult.embeddedValue,
    franchiseValue: Math.round(franchiseValue),
    fairPrice: Math.round(fairPrice),
    currentPrice: insurer.price,
    upside: Math.round(upside * 10) / 10,
    costOfEquity
  };
};

// ============================================================================
// PART 5: P&C INSURANCE VALUATION
// ============================================================================

/**
 * P&C Insurance Valuation
 *
 * Key difference from Life: No embedded value (policies are short-term)
 * Use: P/B adjusted for underwriting quality
 *
 * Fair P/B = f(Combined Ratio, Reserve Quality, ROE)
 *
 * Combined Ratio < 100% = underwriting profit
 * Combined Ratio = Loss Ratio + Expense Ratio
 */
export const calculatePCInsuranceValuation = (insurer, region = 'Indonesia') => {
  const assumptions = FIG_ASSUMPTIONS[region];
  const pcAssumptions = assumptions.PC_INSURANCE;
  const { costOfEquity } = calculateFIGCostOfEquity(insurer, 'PC_INSURANCE', region);
  const ke = costOfEquity / 100;

  // Get key metrics
  const combinedRatio = insurer.combinedRatio || 95;
  const lossRatio = insurer.lossRatio || 65;
  const expenseRatio = insurer.expenseRatio || (combinedRatio - lossRatio);
  const roe = (insurer.roe || insurer.ROE || 12) / 100;

  // Underwriting margin
  const underwritingMargin = 100 - combinedRatio;

  // Fair P/B based on underwriting quality and ROE
  // Premium for CR < 95%, discount for CR > 100%
  let pbAdjustment = 1.0;
  if (combinedRatio < 90) pbAdjustment = 1.3;
  else if (combinedRatio < 95) pbAdjustment = 1.15;
  else if (combinedRatio < 100) pbAdjustment = 1.0;
  else if (combinedRatio < 105) pbAdjustment = 0.85;
  else pbAdjustment = 0.7;

  // Base fair P/B from ROE
  const g = assumptions.terminalGrowth / 100;
  let baseFairPB = (roe - g) / (ke - g);
  baseFairPB = Math.max(0.5, Math.min(baseFairPB, 3.0));

  const fairPB = baseFairPB * pbAdjustment;
  const currentPB = insurer.pb || insurer.PB || 1.0;
  const bvps = insurer.bookValuePerShare || (insurer.price / currentPB);
  const fairPrice = bvps * fairPB;
  const upside = ((fairPrice - insurer.price) / insurer.price) * 100;

  return {
    model: 'P&C Insurance Valuation',

    // Underwriting analysis
    combinedRatio,
    lossRatio,
    expenseRatio,
    underwritingMargin,
    underwritingQuality: combinedRatio < 95 ? 'Excellent' :
                         combinedRatio < 100 ? 'Good' :
                         combinedRatio < 105 ? 'Weak' : 'Poor',

    // Valuation
    fairPB: Math.round(fairPB * 100) / 100,
    currentPB,
    pbAdjustment: Math.round(pbAdjustment * 100) / 100,
    fairPrice: Math.round(fairPrice),
    currentPrice: insurer.price,
    upside: Math.round(upside * 10) / 10,

    // ROE analysis
    roe: (roe * 100).toFixed(1),
    costOfEquity,
    isValueCreator: roe > ke
  };
};

// ============================================================================
// PART 6: CONSUMER FINANCE VALUATION
// ============================================================================

/**
 * Consumer Finance / Multi-Finance Valuation
 *
 * Similar to banks but:
 * - Higher yields (credit cards, personal loans, vehicle finance)
 * - Higher NPLs
 * - Higher cost of funding (no deposits)
 * - Higher equity risk premium
 *
 * Key metrics: NIM, NPL, Gearing Ratio, Yield on Earning Assets
 */
export const calculateConsumerFinanceValuation = (firm, region = 'Indonesia') => {
  const assumptions = FIG_ASSUMPTIONS[region];
  const cfAssumptions = assumptions.CONSUMER_FINANCE;
  const { costOfEquity } = calculateFIGCostOfEquity(firm, 'CONSUMER_FINANCE', region);
  const ke = costOfEquity / 100;

  const roe = (firm.roe || firm.ROE || 18) / 100;
  const g = Math.min(assumptions.terminalGrowth / 100, roe * 0.7);

  // Fair P/B with adjustment for credit quality
  const npl = firm.nplRatio || firm.npl || 3.0;
  let nplAdjustment = 1.0;
  if (npl < 2) nplAdjustment = 1.15;
  else if (npl < 3) nplAdjustment = 1.0;
  else if (npl < 5) nplAdjustment = 0.85;
  else nplAdjustment = 0.7;

  let baseFairPB = (roe - g) / (ke - g);
  baseFairPB = Math.max(0.5, Math.min(baseFairPB, 4.0));

  const fairPB = baseFairPB * nplAdjustment;
  const currentPB = firm.pb || firm.PB || 2.0;
  const bvps = firm.bookValuePerShare || (firm.price / currentPB);
  const fairPrice = bvps * fairPB;
  const upside = ((fairPrice - firm.price) / firm.price) * 100;

  // DDM component
  const dividendYield = firm.dividendYield || 3;
  const dps = firm.price * dividendYield / 100;
  const dividendGrowth = roe * (1 - (firm.payoutRatio || 0.3));

  let ddmValue = 0;
  let projectedDPS = dps;
  for (let year = 1; year <= 5; year++) {
    projectedDPS = projectedDPS * (1 + dividendGrowth);
    ddmValue += projectedDPS / Math.pow(1 + ke, year);
  }
  const terminalDPS = projectedDPS * (1 + g);
  ddmValue += (terminalDPS / (ke - g)) / Math.pow(1 + ke, 5);

  // Weighted average
  const weightedValue = (fairPrice * 0.6) + (ddmValue * 0.4);
  const weightedUpside = ((weightedValue - firm.price) / firm.price) * 100;

  return {
    model: 'Consumer Finance Valuation',

    // Key metrics
    nim: firm.nim || firm.NIM || 15,
    npl,
    nplAdjustment: Math.round(nplAdjustment * 100) / 100,
    gearingRatio: firm.gearingRatio || 5,
    yieldOnAssets: firm.yieldOnAssets || 20,

    // P/B valuation
    fairPB: Math.round(fairPB * 100) / 100,
    currentPB,
    pbBasedValue: Math.round(fairPrice),

    // DDM valuation
    ddmValue: Math.round(ddmValue),

    // Weighted
    weightedValue: Math.round(weightedValue),
    currentPrice: firm.price,
    upside: Math.round(weightedUpside * 10) / 10,

    roe: (roe * 100).toFixed(1),
    costOfEquity,
    isValueCreator: roe > ke
  };
};

// ============================================================================
// PART 7: ASSET MANAGEMENT VALUATION
// ============================================================================

/**
 * Asset Management Valuation
 *
 * Value = f(AUM, Fee Rate, Cost Structure)
 *
 * Methods:
 * 1. % of AUM (typically 1-3% for active managers)
 * 2. Fee revenue multiple
 * 3. Earnings multiple with AUM growth adjustment
 *
 * Key: AUM is the primary value driver
 */
export const calculateAssetManagementValuation = (firm, region = 'Indonesia') => {
  const assumptions = FIG_ASSUMPTIONS[region];
  const amAssumptions = assumptions.ASSET_MANAGEMENT;
  const { costOfEquity } = calculateFIGCostOfEquity(firm, 'ASSET_MANAGEMENT', region);
  const ke = costOfEquity / 100;

  // AUM-based valuation
  const aum = firm.aum || firm.AUM || 50000; // in billions
  const feeRate = firm.feeRate || amAssumptions.avgFeeRate;
  const feeRevenue = aum * feeRate;

  // Typical multiples
  const aumMultiple = firm.aumMultiple || amAssumptions.typicalAUMMultiple;
  const aumBasedValue = aum * aumMultiple * 1000; // Convert to per-share

  // Fee revenue multiple (typically 8-15x for asset managers)
  const feeMultiple = firm.feeMultiple || 10;
  const feeBasedValue = feeRevenue * feeMultiple;

  // Earnings-based (P/E with growth adjustment)
  const pe = firm.pe || firm.PE || 15;
  const aumGrowth = firm.aumGrowth || 10;
  const peg = pe / aumGrowth;
  const fairPE = Math.min(20, Math.max(8, 15 * (1 + aumGrowth / 20)));
  const eps = firm.eps || (firm.price / pe);
  const earningsBasedValue = eps * fairPE;

  // Market cap for comparison
  const sharesOut = firm.sharesOutstanding || (firm.marketCap / firm.price) || 1000;

  // Weighted valuation (normalize to per-share)
  const aumPerShare = aumBasedValue / sharesOut;
  const feePerShare = (feeBasedValue * 1000) / sharesOut;

  const weightedValue = (aumPerShare * 0.35) + (feePerShare * 0.35) + (earningsBasedValue * 0.30);
  const upside = ((weightedValue - firm.price) / firm.price) * 100;

  return {
    model: 'Asset Management Valuation',

    // AUM analysis
    aum,
    aumGrowth,
    feeRate: (feeRate * 100).toFixed(2) + '%',
    feeRevenue: Math.round(feeRevenue),

    // Valuations
    aumMultiple: (aumMultiple * 100).toFixed(1) + '%',
    aumBasedValue: Math.round(aumPerShare),

    feeMultiple,
    feeBasedValue: Math.round(feePerShare),

    fairPE: Math.round(fairPE * 10) / 10,
    earningsBasedValue: Math.round(earningsBasedValue),

    // Final
    weightedValue: Math.round(weightedValue),
    currentPrice: firm.price,
    upside: Math.round(upside * 10) / 10,

    costOfEquity
  };
};

// ============================================================================
// PART 8: INVESTMENT BANK / SECURITIES VALUATION
// ============================================================================

/**
 * Investment Bank / Securities Firm Valuation
 *
 * Revenue-based approach due to:
 * - Volatile earnings
 * - Large trading books
 * - Significant off-balance sheet items
 *
 * Use: Revenue multiple, adjusted for return profile
 */
export const calculateInvestmentBankValuation = (firm, region = 'Indonesia') => {
  const assumptions = FIG_ASSUMPTIONS[region];
  const ibAssumptions = assumptions.INVESTMENT_BANK;
  const { costOfEquity } = calculateFIGCostOfEquity(firm, 'INVESTMENT_BANK', region);
  const ke = costOfEquity / 100;

  const revenue = firm.revenue || firm.Revenue || 1000;
  const roe = (firm.roe || firm.ROE || 15) / 100;

  // Revenue multiple based on ROE and growth
  let revenueMultiple = ibAssumptions.revenueMultiple;
  if (roe > 0.18) revenueMultiple *= 1.2;
  else if (roe > 0.15) revenueMultiple *= 1.0;
  else if (roe > 0.12) revenueMultiple *= 0.85;
  else revenueMultiple *= 0.7;

  const revenueBasedValue = revenue * revenueMultiple;

  // P/B approach
  const g = assumptions.terminalGrowth / 100;
  let fairPB = (roe - g) / (ke - g);
  fairPB = Math.max(0.5, Math.min(fairPB, 3.0));

  const currentPB = firm.pb || firm.PB || 1.5;
  const bvps = firm.bookValuePerShare || (firm.price / currentPB);
  const pbBasedValue = bvps * fairPB;

  // Weighted (60% P/B, 40% Revenue for securities firms)
  const sharesOut = firm.sharesOutstanding || 1000;
  const revenuePerShare = (revenueBasedValue * 1000) / sharesOut;

  const weightedValue = (pbBasedValue * 0.6) + (revenuePerShare * 0.4);
  const upside = ((weightedValue - firm.price) / firm.price) * 100;

  return {
    model: 'Investment Bank Valuation',

    revenue,
    revenueMultiple: Math.round(revenueMultiple * 100) / 100,
    revenueBasedValue: Math.round(revenuePerShare),

    fairPB: Math.round(fairPB * 100) / 100,
    currentPB,
    pbBasedValue: Math.round(pbBasedValue),

    weightedValue: Math.round(weightedValue),
    currentPrice: firm.price,
    upside: Math.round(upside * 10) / 10,

    roe: (roe * 100).toFixed(1),
    costOfEquity
  };
};

// ============================================================================
// PART 9: DIVERSIFIED FINANCIALS - SUM OF THE PARTS
// ============================================================================

/**
 * Sum-of-the-Parts (SOTP) Valuation for Diversified Financials
 *
 * Used for: Multi-line insurance, financial conglomerates
 *
 * Steps:
 * 1. Identify segments and their types
 * 2. Value each segment using appropriate method
 * 3. Sum segment values
 * 4. Apply holding company discount (typically 10-20%)
 */
export const calculateSOTPValuation = (firm, segments, region = 'Indonesia') => {
  const assumptions = FIG_ASSUMPTIONS[region];
  const holdingDiscount = assumptions.DIVERSIFIED.holdingDiscount;

  let totalSOTPValue = 0;
  const segmentValuations = [];

  segments.forEach(segment => {
    let segmentValue = 0;
    let valuation = {};

    switch (segment.type) {
      case 'BANK':
        valuation = calculateBankResidualIncome(segment, region);
        segmentValue = valuation.intrinsicValue * segment.ownership;
        break;
      case 'LIFE_INSURANCE':
        valuation = calculateLifeInsuranceEV(segment, region);
        segmentValue = valuation.fairPrice * segment.ownership;
        break;
      case 'PC_INSURANCE':
        valuation = calculatePCInsuranceValuation(segment, region);
        segmentValue = valuation.fairPrice * segment.ownership;
        break;
      case 'ASSET_MANAGEMENT':
        valuation = calculateAssetManagementValuation(segment, region);
        segmentValue = valuation.weightedValue * segment.ownership;
        break;
      case 'CONSUMER_FINANCE':
        valuation = calculateConsumerFinanceValuation(segment, region);
        segmentValue = valuation.weightedValue * segment.ownership;
        break;
      default:
        // Use book value for unknown segments
        segmentValue = (segment.bookValue || 0) * segment.ownership;
    }

    segmentValuations.push({
      name: segment.name,
      type: segment.type,
      ownership: segment.ownership,
      value: Math.round(segmentValue),
      methodology: valuation.model || 'Book Value'
    });

    totalSOTPValue += segmentValue;
  });

  // Apply holding company discount
  const discountedValue = totalSOTPValue * (1 - holdingDiscount);
  const upside = ((discountedValue - firm.price) / firm.price) * 100;

  return {
    model: 'Sum-of-the-Parts',

    segments: segmentValuations,
    grossSOTPValue: Math.round(totalSOTPValue),

    holdingDiscount: (holdingDiscount * 100) + '%',
    discountedValue: Math.round(discountedValue),

    currentPrice: firm.price,
    upside: Math.round(upside * 10) / 10
  };
};

// ============================================================================
// PART 10: QUALITY SCORING BY FIG TYPE
// ============================================================================

/**
 * Quality Score for Banks (100 points)
 */
export const calculateBankQualityScore = (bank) => {
  let scores = {
    profitability: 0,     // 30 points
    assetQuality: 0,      // 25 points
    capitalStrength: 0,   // 20 points
    liquidity: 0,         // 15 points
    growth: 0             // 10 points
  };

  // Profitability (30 points)
  const roe = bank.roe || bank.ROE || 0;
  if (roe >= 20) scores.profitability += 15;
  else if (roe >= 15) scores.profitability += 12;
  else if (roe >= 12) scores.profitability += 9;
  else if (roe >= 8) scores.profitability += 6;
  else scores.profitability += 3;

  const nim = bank.nim || bank.NIM || 0;
  if (nim >= 6) scores.profitability += 10;
  else if (nim >= 5) scores.profitability += 8;
  else if (nim >= 4) scores.profitability += 6;
  else if (nim >= 3) scores.profitability += 4;
  else scores.profitability += 2;

  const cti = bank.costToIncome || 50;
  if (cti <= 35) scores.profitability += 5;
  else if (cti <= 40) scores.profitability += 4;
  else if (cti <= 45) scores.profitability += 3;
  else if (cti <= 50) scores.profitability += 2;
  else scores.profitability += 1;

  // Asset Quality (25 points)
  const npl = bank.nplRatio || bank.npl || 5;
  if (npl <= 1.5) scores.assetQuality += 12;
  else if (npl <= 2.5) scores.assetQuality += 10;
  else if (npl <= 3.5) scores.assetQuality += 7;
  else if (npl <= 5.0) scores.assetQuality += 4;
  else scores.assetQuality += 1;

  const coverage = bank.nplCoverage || 100;
  if (coverage >= 250) scores.assetQuality += 8;
  else if (coverage >= 200) scores.assetQuality += 6;
  else if (coverage >= 150) scores.assetQuality += 4;
  else if (coverage >= 100) scores.assetQuality += 2;
  else scores.assetQuality += 0;

  const llr = bank.loanLossReserve || 2;
  if (llr >= 5) scores.assetQuality += 5;
  else if (llr >= 4) scores.assetQuality += 4;
  else if (llr >= 3) scores.assetQuality += 3;
  else if (llr >= 2) scores.assetQuality += 2;
  else scores.assetQuality += 1;

  // Capital (20 points)
  const car = bank.car || bank.CAR || 12;
  if (car >= 25) scores.capitalStrength += 12;
  else if (car >= 20) scores.capitalStrength += 10;
  else if (car >= 15) scores.capitalStrength += 7;
  else if (car >= 12) scores.capitalStrength += 4;
  else scores.capitalStrength += 1;

  const tier1 = bank.tier1Ratio || car * 0.85;
  if (tier1 >= 22) scores.capitalStrength += 8;
  else if (tier1 >= 18) scores.capitalStrength += 6;
  else if (tier1 >= 14) scores.capitalStrength += 4;
  else if (tier1 >= 10) scores.capitalStrength += 2;
  else scores.capitalStrength += 0;

  // Liquidity (15 points)
  const ldr = bank.ldr || bank.LDR || 85;
  if (ldr >= 78 && ldr <= 92) scores.liquidity += 8;
  else if (ldr >= 70 && ldr <= 100) scores.liquidity += 6;
  else if (ldr >= 60 && ldr <= 110) scores.liquidity += 4;
  else scores.liquidity += 2;

  const casa = bank.casaRatio || bank.CASA || 50;
  if (casa >= 75) scores.liquidity += 7;
  else if (casa >= 65) scores.liquidity += 5;
  else if (casa >= 55) scores.liquidity += 4;
  else if (casa >= 45) scores.liquidity += 2;
  else scores.liquidity += 1;

  // Growth (10 points)
  const loanGrowth = bank.loanGrowth || 0;
  if (loanGrowth >= 15) scores.growth += 5;
  else if (loanGrowth >= 10) scores.growth += 4;
  else if (loanGrowth >= 5) scores.growth += 3;
  else if (loanGrowth >= 0) scores.growth += 2;
  else scores.growth += 0;

  const niiGrowth = bank.niiGrowth || 0;
  if (niiGrowth >= 12) scores.growth += 5;
  else if (niiGrowth >= 8) scores.growth += 4;
  else if (niiGrowth >= 5) scores.growth += 3;
  else if (niiGrowth >= 0) scores.growth += 2;
  else scores.growth += 0;

  const total = scores.profitability + scores.assetQuality +
                scores.capitalStrength + scores.liquidity + scores.growth;

  return {
    total,
    breakdown: scores,
    rating: getQualityRating(total)
  };
};

/**
 * Quality Score for Insurance (100 points)
 */
export const calculateInsuranceQualityScore = (insurer, type = 'LIFE_INSURANCE') => {
  let scores = {
    profitability: 0,      // 25 points
    underwriting: 0,       // 25 points (P&C) or persistency (Life)
    solvency: 0,           // 25 points
    growth: 0,             // 15 points
    efficiency: 0          // 10 points
  };

  const roe = insurer.roe || insurer.ROE || 10;

  // Profitability (25 points)
  if (roe >= 18) scores.profitability += 25;
  else if (roe >= 15) scores.profitability += 20;
  else if (roe >= 12) scores.profitability += 15;
  else if (roe >= 8) scores.profitability += 10;
  else scores.profitability += 5;

  if (type === 'PC_INSURANCE') {
    // Underwriting (25 points) - Combined Ratio
    const cr = insurer.combinedRatio || 100;
    if (cr < 90) scores.underwriting += 25;
    else if (cr < 95) scores.underwriting += 20;
    else if (cr < 100) scores.underwriting += 15;
    else if (cr < 105) scores.underwriting += 10;
    else scores.underwriting += 5;
  } else {
    // Persistency for Life (25 points)
    const persistency = insurer.persistencyRatio || 80;
    if (persistency >= 90) scores.underwriting += 25;
    else if (persistency >= 85) scores.underwriting += 20;
    else if (persistency >= 80) scores.underwriting += 15;
    else if (persistency >= 75) scores.underwriting += 10;
    else scores.underwriting += 5;
  }

  // Solvency (25 points)
  const rbc = insurer.solvencyRatio || insurer.rbc || 150;
  if (rbc >= 300) scores.solvency += 25;
  else if (rbc >= 200) scores.solvency += 20;
  else if (rbc >= 150) scores.solvency += 15;
  else if (rbc >= 120) scores.solvency += 10;
  else scores.solvency += 5;

  // Growth (15 points)
  const premiumGrowth = insurer.premiumGrowth || insurer.vnbGrowth || 5;
  if (premiumGrowth >= 15) scores.growth += 15;
  else if (premiumGrowth >= 10) scores.growth += 12;
  else if (premiumGrowth >= 5) scores.growth += 8;
  else if (premiumGrowth >= 0) scores.growth += 4;
  else scores.growth += 0;

  // Efficiency (10 points)
  const expenseRatio = insurer.expenseRatio || 35;
  if (expenseRatio <= 25) scores.efficiency += 10;
  else if (expenseRatio <= 30) scores.efficiency += 8;
  else if (expenseRatio <= 35) scores.efficiency += 6;
  else if (expenseRatio <= 40) scores.efficiency += 4;
  else scores.efficiency += 2;

  const total = scores.profitability + scores.underwriting +
                scores.solvency + scores.growth + scores.efficiency;

  return {
    total,
    breakdown: scores,
    rating: getQualityRating(total)
  };
};

/**
 * Quality Score for Asset Management (100 points)
 */
export const calculateAssetMgmtQualityScore = (firm) => {
  let scores = {
    aumScale: 0,          // 25 points
    performance: 0,        // 25 points
    flows: 0,              // 20 points
    profitability: 0,      // 20 points
    diversification: 0     // 10 points
  };

  // AUM Scale (25 points)
  const aum = firm.aum || firm.AUM || 10000;
  if (aum >= 100000) scores.aumScale += 25;
  else if (aum >= 50000) scores.aumScale += 20;
  else if (aum >= 20000) scores.aumScale += 15;
  else if (aum >= 10000) scores.aumScale += 10;
  else scores.aumScale += 5;

  // Performance (25 points) - alpha generation
  const alpha = firm.alpha || firm.Alpha || 0;
  if (alpha >= 3) scores.performance += 25;
  else if (alpha >= 2) scores.performance += 20;
  else if (alpha >= 1) scores.performance += 15;
  else if (alpha >= 0) scores.performance += 10;
  else scores.performance += 5;

  // Flows (20 points)
  const aumGrowth = firm.aumGrowth || 5;
  if (aumGrowth >= 20) scores.flows += 20;
  else if (aumGrowth >= 15) scores.flows += 16;
  else if (aumGrowth >= 10) scores.flows += 12;
  else if (aumGrowth >= 5) scores.flows += 8;
  else if (aumGrowth >= 0) scores.flows += 4;
  else scores.flows += 0;

  // Profitability (20 points)
  const roe = firm.roe || firm.ROE || 15;
  if (roe >= 25) scores.profitability += 20;
  else if (roe >= 20) scores.profitability += 16;
  else if (roe >= 15) scores.profitability += 12;
  else if (roe >= 10) scores.profitability += 8;
  else scores.profitability += 4;

  // Diversification (10 points)
  const productCount = firm.productCount || 5;
  if (productCount >= 10) scores.diversification += 10;
  else if (productCount >= 7) scores.diversification += 8;
  else if (productCount >= 5) scores.diversification += 6;
  else if (productCount >= 3) scores.diversification += 4;
  else scores.diversification += 2;

  const total = scores.aumScale + scores.performance +
                scores.flows + scores.profitability + scores.diversification;

  return {
    total,
    breakdown: scores,
    rating: getQualityRating(total)
  };
};

// ============================================================================
// PART 11: MASTER VALUATION FUNCTION
// ============================================================================

/**
 * Detect financial institution type and apply appropriate valuation
 */
export const detectFIGType = (firm) => {
  // Check GICS code first
  if (firm.gicsCode && FINANCIAL_GICS[firm.gicsCode]) {
    return FINANCIAL_GICS[firm.gicsCode].type;
  }

  // Check industry group
  const industry = firm.industryGroup || firm['Industry Group'] || firm.industry || '';

  if (INDONESIA_FIG_MAPPING[industry]) {
    return INDONESIA_FIG_MAPPING[industry];
  }

  // Keyword-based detection
  const name = (firm.name || firm.Name || '').toLowerCase();
  const sector = (firm.sector || firm['Industry Sector'] || '').toLowerCase();

  if (name.includes('bank') || sector.includes('bank')) return 'BANK';
  if (name.includes('insurance') || name.includes('asuransi')) {
    if (name.includes('life') || name.includes('jiwa')) return 'LIFE_INSURANCE';
    return 'PC_INSURANCE';
  }
  if (name.includes('multifinance') || name.includes('finance')) return 'CONSUMER_FINANCE';
  if (name.includes('asset') || name.includes('investment manager')) return 'ASSET_MANAGEMENT';
  if (name.includes('sekuritas') || name.includes('securities')) return 'INVESTMENT_BANK';

  return 'DIVERSIFIED'; // Default
};

/**
 * Master function to value any financial institution
 */
export const calculateFinancialServicesValuation = (firm, region = 'Indonesia') => {
  const figType = detectFIGType(firm);

  let valuations = {};
  let qualityScore = {};
  let primaryValuation = null;

  switch (figType) {
    case 'BANK':
      valuations.residualIncome = calculateBankResidualIncome(firm, region);
      valuations.gordonPB = calculateBankFairPB(firm, region);
      qualityScore = calculateBankQualityScore(firm);
      // Weighted: 60% RI, 40% Gordon PB
      primaryValuation = {
        value: Math.round(valuations.residualIncome.intrinsicValue * 0.6 +
                         valuations.gordonPB.fairPrice * 0.4),
        upside: Math.round((valuations.residualIncome.upside * 0.6 +
                           valuations.gordonPB.upside * 0.4) * 10) / 10
      };
      break;

    case 'LIFE_INSURANCE':
      valuations.embeddedValue = calculateLifeInsuranceEV(firm, region);
      valuations.appraisalValue = calculateLifeInsuranceAppraisal(firm, region);
      qualityScore = calculateInsuranceQualityScore(firm, 'LIFE_INSURANCE');
      primaryValuation = {
        value: Math.round(valuations.embeddedValue.fairPrice * 0.5 +
                         valuations.appraisalValue.fairPrice * 0.5),
        upside: Math.round((valuations.embeddedValue.upside * 0.5 +
                           valuations.appraisalValue.upside * 0.5) * 10) / 10
      };
      break;

    case 'PC_INSURANCE':
    case 'REINSURANCE':
      valuations.pcValuation = calculatePCInsuranceValuation(firm, region);
      qualityScore = calculateInsuranceQualityScore(firm, 'PC_INSURANCE');
      primaryValuation = {
        value: valuations.pcValuation.fairPrice,
        upside: valuations.pcValuation.upside
      };
      break;

    case 'CONSUMER_FINANCE':
      valuations.cfValuation = calculateConsumerFinanceValuation(firm, region);
      qualityScore = calculateBankQualityScore(firm); // Similar metrics
      primaryValuation = {
        value: valuations.cfValuation.weightedValue,
        upside: valuations.cfValuation.upside
      };
      break;

    case 'ASSET_MANAGEMENT':
    case 'CUSTODY':
      valuations.amValuation = calculateAssetManagementValuation(firm, region);
      qualityScore = calculateAssetMgmtQualityScore(firm);
      primaryValuation = {
        value: valuations.amValuation.weightedValue,
        upside: valuations.amValuation.upside
      };
      break;

    case 'INVESTMENT_BANK':
      valuations.ibValuation = calculateInvestmentBankValuation(firm, region);
      qualityScore = calculateBankQualityScore(firm);
      primaryValuation = {
        value: valuations.ibValuation.weightedValue,
        upside: valuations.ibValuation.upside
      };
      break;

    case 'MULTI_INSURANCE':
    case 'DIVERSIFIED':
    default:
      // Use P/B approach with holding discount
      const { costOfEquity } = calculateFIGCostOfEquity(firm, 'DIVERSIFIED', region);
      const ke = costOfEquity / 100;
      const roe = (firm.roe || firm.ROE || 12) / 100;
      const g = FIG_ASSUMPTIONS[region].terminalGrowth / 100;

      let fairPB = (roe - g) / (ke - g);
      fairPB = Math.max(0.5, Math.min(fairPB, 3.0)) * 0.85; // 15% holding discount

      const currentPB = firm.pb || firm.PB || 1.0;
      const bvps = firm.bookValuePerShare || (firm.price / currentPB);
      const fairPrice = bvps * fairPB;
      const upside = ((fairPrice - firm.price) / firm.price) * 100;

      valuations.diversified = {
        model: 'Diversified Financials (P/B with discount)',
        fairPB: Math.round(fairPB * 100) / 100,
        fairPrice: Math.round(fairPrice),
        upside: Math.round(upside * 10) / 10,
        holdingDiscount: '15%'
      };
      qualityScore = { total: 50, rating: { grade: 'C', description: 'Fair' } };
      primaryValuation = { value: Math.round(fairPrice), upside: Math.round(upside * 10) / 10 };
  }

  return {
    ticker: firm.ticker || firm.Ticker,
    name: firm.name || firm.Name,
    figType,
    figTypeName: getFIGTypeName(figType),
    methodology: getMethodologyDescription(figType),

    currentPrice: firm.price || firm.Price,
    fairValue: primaryValuation.value,
    upside: primaryValuation.upside,
    recommendation: getRecommendation(primaryValuation.upside),

    valuations,
    qualityScore,

    costOfEquity: calculateFIGCostOfEquity(firm, figType, region)
  };
};

// ============================================================================
// PART 12: UTILITY FUNCTIONS
// ============================================================================

function getQualityRating(score) {
  if (score >= 85) return { grade: 'A', description: 'Excellent', color: 'emerald' };
  if (score >= 70) return { grade: 'B', description: 'Good', color: 'blue' };
  if (score >= 55) return { grade: 'C', description: 'Fair', color: 'amber' };
  if (score >= 40) return { grade: 'D', description: 'Weak', color: 'orange' };
  return { grade: 'F', description: 'Poor', color: 'red' };
}

function getRecommendation(upside) {
  if (upside >= 30) return { rating: 'Strong Buy', color: 'emerald' };
  if (upside >= 15) return { rating: 'Buy', color: 'blue' };
  if (upside >= 0) return { rating: 'Hold', color: 'slate' };
  if (upside >= -15) return { rating: 'Underperform', color: 'amber' };
  return { rating: 'Sell', color: 'red' };
}

function getFIGTypeName(type) {
  const names = {
    'BANK': 'Commercial Bank',
    'CONSUMER_FINANCE': 'Consumer Finance',
    'LIFE_INSURANCE': 'Life Insurance',
    'PC_INSURANCE': 'P&C Insurance',
    'REINSURANCE': 'Reinsurance',
    'MULTI_INSURANCE': 'Multi-line Insurance',
    'ASSET_MANAGEMENT': 'Asset Management',
    'CUSTODY': 'Custody Bank',
    'INVESTMENT_BANK': 'Investment Bank / Securities',
    'DIVERSIFIED': 'Diversified Financials',
    'EXCHANGE': 'Securities Exchange'
  };
  return names[type] || 'Financial Services';
}

function getMethodologyDescription(type) {
  const methods = {
    'BANK': 'Residual Income Model + Gordon Growth P/B (Damodaran)',
    'CONSUMER_FINANCE': 'Modified P/B with NPL adjustment + DDM',
    'LIFE_INSURANCE': 'Embedded Value + Appraisal Value (EEV Principles)',
    'PC_INSURANCE': 'P/B adjusted for Combined Ratio',
    'REINSURANCE': 'P/B adjusted for Combined Ratio',
    'MULTI_INSURANCE': 'Sum-of-the-Parts with holding discount',
    'ASSET_MANAGEMENT': 'AUM Multiple + Fee Revenue Multiple + P/E',
    'CUSTODY': 'AUM-based + Fee Revenue Multiple',
    'INVESTMENT_BANK': 'Revenue Multiple + P/B',
    'DIVERSIFIED': 'P/B with 15% holding company discount',
    'EXCHANGE': 'Fee Revenue Multiple'
  };
  return methods[type] || 'Standard P/B valuation';
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  FINANCIAL_GICS,
  INDONESIA_FIG_MAPPING,
  FIG_ASSUMPTIONS,

  // Detection
  detectFIGType,

  // Master function
  calculateFinancialServicesValuation,

  // Individual valuations
  calculateBankResidualIncome,
  calculateBankFairPB,
  calculateLifeInsuranceEV,
  calculateLifeInsuranceAppraisal,
  calculatePCInsuranceValuation,
  calculateConsumerFinanceValuation,
  calculateAssetManagementValuation,
  calculateInvestmentBankValuation,
  calculateSOTPValuation,

  // Quality scores
  calculateBankQualityScore,
  calculateInsuranceQualityScore,
  calculateAssetMgmtQualityScore,

  // Cost of equity
  calculateFIGCostOfEquity
};
