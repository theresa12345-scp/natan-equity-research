// ============================================================================
// NATAN EQUITY RESEARCH - VALUATION MODELS
// Based on: CFA Level II, Damodaran (NYU Stern), Rosenbaum & Pearl, McKinsey
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
// INDUSTRY-SPECIFIC DCF PRESETS - More granular subsector assumptions
// Based on: Damodaran industry data, Bloomberg sector medians, McKinsey benchmarks
// NOTE: Subsector-level data can be enhanced with Bloomberg exports
// ============================================================================

export const INDUSTRY_PRESETS = {
  // ==================== FINANCIAL SECTOR ====================
  'Banks - Diversified': {
    name: 'Diversified Banks',
    description: 'Large-cap commercial banks (BBCA, BBRI, BMRI)',
    forecastYears: 5,
    terminalGrowth: 4.5, // Indonesia: nominal GDP + spread growth
    initialGrowth: 12,
    fcfConversion: 0.85,
    useRoeModel: true, // Banks: value = BV × (ROE-g)/(Ke-g)
    typicalRoe: 18,
    typicalPb: 2.5,
    betaAdjustment: 0.95, // Banks slightly less volatile
    sectorRiskPremium: 0,
    ebitdaMargin: null, // Not applicable for banks
    daToEbitda: null,
    capexToDA: null,
    nwcToRevGrowth: null
  },
  'Banks - Regional': {
    name: 'Regional Banks',
    description: 'Mid-cap regional banks (BNGA, BDMN)',
    forecastYears: 5,
    terminalGrowth: 4.0,
    initialGrowth: 10,
    fcfConversion: 0.80,
    useRoeModel: true,
    typicalRoe: 14,
    typicalPb: 1.5,
    betaAdjustment: 1.05,
    sectorRiskPremium: 0.5,
    ebitdaMargin: null,
    daToEbitda: null,
    capexToDA: null,
    nwcToRevGrowth: null
  },
  'Insurance': {
    name: 'Insurance',
    description: 'Life & P&C insurers',
    forecastYears: 5,
    terminalGrowth: 4.0,
    initialGrowth: 8,
    fcfConversion: 0.75,
    useRoeModel: true,
    typicalRoe: 15,
    typicalPb: 1.8,
    betaAdjustment: 0.9,
    sectorRiskPremium: 0,
    ebitdaMargin: null,
    daToEbitda: null,
    capexToDA: null,
    nwcToRevGrowth: null
  },
  'Financial Services': {
    name: 'Financial Services',
    description: 'Asset managers, securities firms, fintech',
    forecastYears: 5,
    terminalGrowth: 4.5,
    initialGrowth: 15,
    fcfConversion: 0.80,
    useRoeModel: false,
    typicalRoe: 20,
    betaAdjustment: 1.15,
    sectorRiskPremium: 0.5,
    ebitdaMargin: 35,
    daToEbitda: 0.05,
    capexToDA: 0.5,
    nwcToRevGrowth: 0.03
  },

  // ==================== CONSUMER SECTOR ====================
  'Consumer Staples - Food': {
    name: 'Food & Beverage',
    description: 'Packaged food, beverages (ICBP, MYOR, INDF)',
    forecastYears: 5,
    terminalGrowth: 4.0,
    initialGrowth: 8,
    fcfConversion: 0.75,
    useRoeModel: false,
    typicalRoe: 18,
    betaAdjustment: 0.85, // Defensive
    sectorRiskPremium: -0.5,
    ebitdaMargin: 18,
    daToEbitda: 0.12,
    capexToDA: 1.0,
    nwcToRevGrowth: 0.08
  },
  'Consumer Staples - Retail': {
    name: 'Retail - Staples',
    description: 'Grocery, convenience stores (AMRT)',
    forecastYears: 5,
    terminalGrowth: 4.0,
    initialGrowth: 10,
    fcfConversion: 0.65,
    useRoeModel: false,
    typicalRoe: 15,
    betaAdjustment: 0.90,
    sectorRiskPremium: 0,
    ebitdaMargin: 8,
    daToEbitda: 0.20,
    capexToDA: 1.3,
    nwcToRevGrowth: 0.10
  },
  'Consumer Discretionary - Auto': {
    name: 'Automotive',
    description: 'Auto manufacturers, dealers (ASII)',
    forecastYears: 5,
    terminalGrowth: 3.5,
    initialGrowth: 6,
    fcfConversion: 0.55,
    useRoeModel: false,
    typicalRoe: 12,
    betaAdjustment: 1.20, // Cyclical
    sectorRiskPremium: 1.0,
    ebitdaMargin: 12,
    daToEbitda: 0.22,
    capexToDA: 1.4,
    nwcToRevGrowth: 0.15
  },
  'Consumer Discretionary - Retail': {
    name: 'Retail - Discretionary',
    description: 'Department stores, specialty retail',
    forecastYears: 5,
    terminalGrowth: 3.5,
    initialGrowth: 8,
    fcfConversion: 0.60,
    useRoeModel: false,
    typicalRoe: 14,
    betaAdjustment: 1.15,
    sectorRiskPremium: 0.5,
    ebitdaMargin: 10,
    daToEbitda: 0.18,
    capexToDA: 1.2,
    nwcToRevGrowth: 0.12
  },

  // ==================== TECHNOLOGY ====================
  'Technology - Software': {
    name: 'Software & SaaS',
    description: 'Enterprise software, cloud services',
    forecastYears: 10, // High growth warrants longer period
    terminalGrowth: 3.5,
    initialGrowth: 25,
    fcfConversion: 0.85,
    useRoeModel: false,
    typicalRoe: 25,
    betaAdjustment: 1.25,
    sectorRiskPremium: 0,
    ebitdaMargin: 30,
    daToEbitda: 0.08,
    capexToDA: 0.6,
    nwcToRevGrowth: 0.03
  },
  'Technology - Hardware': {
    name: 'Hardware & Electronics',
    description: 'Computer hardware, consumer electronics',
    forecastYears: 5,
    terminalGrowth: 3.0,
    initialGrowth: 12,
    fcfConversion: 0.70,
    useRoeModel: false,
    typicalRoe: 18,
    betaAdjustment: 1.15,
    sectorRiskPremium: 0.5,
    ebitdaMargin: 20,
    daToEbitda: 0.15,
    capexToDA: 1.0,
    nwcToRevGrowth: 0.08
  },
  'Technology - Semiconductor': {
    name: 'Semiconductors',
    description: 'Chip manufacturers, foundries',
    forecastYears: 7,
    terminalGrowth: 3.5,
    initialGrowth: 18,
    fcfConversion: 0.55, // High capex
    useRoeModel: false,
    typicalRoe: 20,
    betaAdjustment: 1.30, // Highly cyclical
    sectorRiskPremium: 1.0,
    ebitdaMargin: 35,
    daToEbitda: 0.25,
    capexToDA: 1.8,
    nwcToRevGrowth: 0.05
  },

  // ==================== INDUSTRIAL ====================
  'Industrial - Construction': {
    name: 'Construction & Engineering',
    description: 'Infrastructure, construction (WIKA, ADHI, PTPP)',
    forecastYears: 5,
    terminalGrowth: 4.0,
    initialGrowth: 10,
    fcfConversion: 0.45, // Working capital intensive
    useRoeModel: false,
    typicalRoe: 10,
    betaAdjustment: 1.20,
    sectorRiskPremium: 1.5,
    ebitdaMargin: 10,
    daToEbitda: 0.20,
    capexToDA: 1.2,
    nwcToRevGrowth: 0.20 // High NWC needs
  },
  'Industrial - Cement': {
    name: 'Cement & Building Materials',
    description: 'Cement, concrete, aggregates (INTP, SMGR)',
    forecastYears: 5,
    terminalGrowth: 4.0,
    initialGrowth: 6,
    fcfConversion: 0.50,
    useRoeModel: false,
    typicalRoe: 8,
    betaAdjustment: 1.10,
    sectorRiskPremium: 0.5,
    ebitdaMargin: 25,
    daToEbitda: 0.30,
    capexToDA: 1.3,
    nwcToRevGrowth: 0.08
  },
  'Industrial - Logistics': {
    name: 'Transportation & Logistics',
    description: 'Shipping, logistics, ports',
    forecastYears: 5,
    terminalGrowth: 4.0,
    initialGrowth: 8,
    fcfConversion: 0.55,
    useRoeModel: false,
    typicalRoe: 12,
    betaAdjustment: 1.05,
    sectorRiskPremium: 0.5,
    ebitdaMargin: 20,
    daToEbitda: 0.25,
    capexToDA: 1.4,
    nwcToRevGrowth: 0.10
  },

  // ==================== BASIC MATERIALS ====================
  'Materials - Mining': {
    name: 'Mining & Metals',
    description: 'Coal, nickel, gold mining (ADRO, PTBA, ANTM)',
    forecastYears: 5,
    terminalGrowth: 3.0, // Commodity cycles
    initialGrowth: 5,
    fcfConversion: 0.45,
    useRoeModel: false,
    typicalRoe: 15,
    betaAdjustment: 1.25, // Commodity exposure
    sectorRiskPremium: 2.0, // High volatility
    ebitdaMargin: 30,
    daToEbitda: 0.30,
    capexToDA: 1.5,
    nwcToRevGrowth: 0.08
  },
  'Materials - Chemicals': {
    name: 'Chemicals',
    description: 'Specialty chemicals, fertilizers',
    forecastYears: 5,
    terminalGrowth: 3.5,
    initialGrowth: 8,
    fcfConversion: 0.55,
    useRoeModel: false,
    typicalRoe: 12,
    betaAdjustment: 1.10,
    sectorRiskPremium: 0.5,
    ebitdaMargin: 18,
    daToEbitda: 0.22,
    capexToDA: 1.3,
    nwcToRevGrowth: 0.10
  },

  // ==================== ENERGY ====================
  'Energy - Oil & Gas': {
    name: 'Oil & Gas',
    description: 'Upstream, downstream, integrated (PGAS, MEDC)',
    forecastYears: 5,
    terminalGrowth: 2.5, // Energy transition discount
    initialGrowth: 5,
    fcfConversion: 0.40,
    useRoeModel: false,
    typicalRoe: 12,
    betaAdjustment: 1.20,
    sectorRiskPremium: 2.0,
    ebitdaMargin: 25,
    daToEbitda: 0.35,
    capexToDA: 1.6,
    nwcToRevGrowth: 0.06
  },
  'Energy - Renewable': {
    name: 'Renewable Energy',
    description: 'Solar, wind, geothermal',
    forecastYears: 10,
    terminalGrowth: 4.0,
    initialGrowth: 20,
    fcfConversion: 0.35, // Very high capex
    useRoeModel: false,
    typicalRoe: 10,
    betaAdjustment: 1.00,
    sectorRiskPremium: 0,
    ebitdaMargin: 45,
    daToEbitda: 0.35,
    capexToDA: 2.0,
    nwcToRevGrowth: 0.03
  },

  // ==================== TELECOMMUNICATIONS ====================
  'Telecom - Wireless': {
    name: 'Wireless Telecom',
    description: 'Mobile carriers (TLKM, EXCL, ISAT)',
    forecastYears: 5,
    terminalGrowth: 3.5,
    initialGrowth: 6,
    fcfConversion: 0.55,
    useRoeModel: false,
    typicalRoe: 15,
    betaAdjustment: 0.85,
    sectorRiskPremium: 0,
    ebitdaMargin: 45,
    daToEbitda: 0.28,
    capexToDA: 1.3,
    nwcToRevGrowth: 0.03
  },
  'Telecom - Towers': {
    name: 'Tower Infrastructure',
    description: 'Telecom towers, data centers (TOWR, TBIG)',
    forecastYears: 7,
    terminalGrowth: 4.0,
    initialGrowth: 12,
    fcfConversion: 0.50,
    useRoeModel: false,
    typicalRoe: 18,
    betaAdjustment: 0.80, // Contracted revenue
    sectorRiskPremium: -0.5,
    ebitdaMargin: 55,
    daToEbitda: 0.25,
    capexToDA: 1.4,
    nwcToRevGrowth: 0.02
  },

  // ==================== UTILITIES ====================
  'Utilities - Power': {
    name: 'Electric Utilities',
    description: 'Power generation, distribution',
    forecastYears: 5,
    terminalGrowth: 4.0,
    initialGrowth: 6,
    fcfConversion: 0.35, // High reinvestment
    useRoeModel: false,
    typicalRoe: 10,
    betaAdjustment: 0.70, // Regulated
    sectorRiskPremium: -0.5,
    ebitdaMargin: 30,
    daToEbitda: 0.30,
    capexToDA: 1.8,
    nwcToRevGrowth: 0.03
  },

  // ==================== HEALTHCARE ====================
  'Healthcare - Pharma': {
    name: 'Pharmaceuticals',
    description: 'Drug manufacturers (KLBF, KAEF)',
    forecastYears: 5,
    terminalGrowth: 4.0,
    initialGrowth: 10,
    fcfConversion: 0.70,
    useRoeModel: false,
    typicalRoe: 18,
    betaAdjustment: 0.85,
    sectorRiskPremium: 0,
    ebitdaMargin: 22,
    daToEbitda: 0.10,
    capexToDA: 0.9,
    nwcToRevGrowth: 0.10
  },
  'Healthcare - Hospitals': {
    name: 'Hospitals & Clinics',
    description: 'Hospital operators (MIKA, SILO)',
    forecastYears: 7,
    terminalGrowth: 4.5,
    initialGrowth: 15,
    fcfConversion: 0.60,
    useRoeModel: false,
    typicalRoe: 15,
    betaAdjustment: 0.90,
    sectorRiskPremium: 0,
    ebitdaMargin: 18,
    daToEbitda: 0.15,
    capexToDA: 1.2,
    nwcToRevGrowth: 0.08
  },

  // ==================== REAL ESTATE ====================
  'Real Estate - Developers': {
    name: 'Property Developers',
    description: 'Residential, commercial developers (BSDE, CTRA, SMRA)',
    forecastYears: 5,
    terminalGrowth: 3.5,
    initialGrowth: 8,
    fcfConversion: 0.40, // High inventory
    useRoeModel: false,
    typicalRoe: 8,
    betaAdjustment: 1.25, // Interest rate sensitive
    sectorRiskPremium: 1.5,
    ebitdaMargin: 35,
    daToEbitda: 0.05,
    capexToDA: 0.5,
    nwcToRevGrowth: 0.25 // High land bank needs
  },
  'Real Estate - REITs': {
    name: 'REITs',
    description: 'Real estate investment trusts',
    forecastYears: 5,
    terminalGrowth: 3.0,
    initialGrowth: 5,
    fcfConversion: 0.85, // High dividend payout
    useRoeModel: false,
    typicalRoe: 8,
    betaAdjustment: 0.85,
    sectorRiskPremium: 0,
    ebitdaMargin: 65,
    daToEbitda: 0.20,
    capexToDA: 0.8,
    nwcToRevGrowth: 0.02
  },

  // ==================== DEFAULT ====================
  'default': {
    name: 'General Industry',
    description: 'Default assumptions for unclassified companies',
    forecastYears: 5,
    terminalGrowth: 4.0,
    initialGrowth: 8,
    fcfConversion: 0.60,
    useRoeModel: false,
    typicalRoe: 15,
    betaAdjustment: 1.0,
    sectorRiskPremium: 0,
    ebitdaMargin: 15,
    daToEbitda: 0.18,
    capexToDA: 1.1,
    nwcToRevGrowth: 0.10
  }
};

// ============================================================================
// GICS SUB-INDUSTRY TO DCF PRESET MAPPING
// Maps 118 GICS Sub-Industries from Bloomberg to our DCF presets
// Based on: Standard & Poor's GICS classification system
// ============================================================================

export const GICS_TO_PRESET_MAP = {
  // ==================== FINANCIALS ====================
  'Diversified Banks': 'Banks - Diversified',
  'Regional Banks': 'Banks - Regional',
  'Life & Health Insurance': 'Insurance',
  'Multi-line Insurance': 'Insurance',
  'Property & Casualty Insurance': 'Insurance',
  'Reinsurance': 'Insurance',
  'Consumer Finance': 'Financial Services',
  'Investment Banking & Brokerage': 'Financial Services',
  'Asset Management & Custody Ban': 'Financial Services',
  'Financial Exchanges & Data': 'Financial Services',
  'Specialized Finance': 'Financial Services',
  'Transaction & Payment Processi': 'Financial Services',

  // ==================== REAL ESTATE ====================
  'Real Estate Development': 'Real Estate - Developers',
  'Real Estate Operating Companie': 'Real Estate - REITs',
  'Diversified Real Estate Activi': 'Real Estate - Developers',

  // ==================== CONSUMER STAPLES ====================
  'Packaged Foods & Meats': 'Consumer Staples - Food',
  'Agricultural Products & Servic': 'Consumer Staples - Food',
  'Soft Drinks & Non-alcoholic Be': 'Consumer Staples - Food',
  'Brewers': 'Consumer Staples - Food',
  'Distillers & Vintners': 'Consumer Staples - Food',
  'Food Distributors': 'Consumer Staples - Retail',
  'Food Retail': 'Consumer Staples - Retail',
  'Consumer Staples Merchandise R': 'Consumer Staples - Retail',
  'Household Products': 'Consumer Staples - Food',
  'Personal Care Products': 'Consumer Staples - Food',
  'Tobacco': 'Consumer Staples - Food',

  // ==================== CONSUMER DISCRETIONARY ====================
  'Broadline Retail': 'Consumer Discretionary - Retail',
  'Apparel Retail': 'Consumer Discretionary - Retail',
  'Other Specialty Retail': 'Consumer Discretionary - Retail',
  'Home Improvement Retail': 'Consumer Discretionary - Retail',
  'Computer & Electronics Retail': 'Consumer Discretionary - Retail',
  'Automotive Retail': 'Consumer Discretionary - Auto',
  'Automotive Parts & Equipment': 'Consumer Discretionary - Auto',
  'Restaurants': 'Consumer Discretionary - Retail',
  'Hotels, Resorts & Cruise Lines': 'Consumer Discretionary - Retail',
  'Leisure Facilities': 'Consumer Discretionary - Retail',
  'Leisure Products': 'Consumer Discretionary - Retail',
  'Apparel, Accessories & Luxury': 'Consumer Discretionary - Retail',
  'Footwear': 'Consumer Discretionary - Retail',
  'Home Furnishings': 'Consumer Discretionary - Retail',
  'Housewares & Specialties': 'Consumer Discretionary - Retail',
  'Household Appliances': 'Consumer Discretionary - Retail',
  'Textiles': 'Consumer Discretionary - Retail',
  'Movies & Entertainment': 'Consumer Discretionary - Retail',
  'Distributors': 'Consumer Discretionary - Retail',
  'Specialized Consumer Services': 'Consumer Discretionary - Retail',
  'Education Services': 'Consumer Discretionary - Retail',

  // ==================== INDUSTRIALS ====================
  'Construction & Engineering': 'Industrial - Construction',
  'Construction Materials': 'Industrial - Cement',
  'Building Products': 'Industrial - Cement',
  'Construction Machinery & Heavy': 'Industrial - Construction',
  'Industrial Conglomerates': 'Industrial - Construction',
  'Industrial Machinery & Supplie': 'Industrial - Construction',
  'Trading Companies & Distributo': 'Industrial - Logistics',
  'Marine Transportation': 'Industrial - Logistics',
  'Marine Ports & Services': 'Industrial - Logistics',
  'Air Freight & Logistics': 'Industrial - Logistics',
  'Cargo Ground Transportation': 'Industrial - Logistics',
  'Rail Transportation': 'Industrial - Logistics',
  'Passenger Airlines': 'Industrial - Logistics',
  'Passenger Ground Transportatio': 'Industrial - Logistics',
  'Airport Services': 'Industrial - Logistics',
  'Highways & Railtracks': 'Industrial - Logistics',
  'Diversified Support Services': 'Industrial - Construction',
  'Environmental & Facilities Ser': 'Industrial - Construction',
  'Office Services & Supplies': 'Industrial - Construction',
  'Research & Consulting Services': 'Industrial - Construction',
  'Aerospace & Defense': 'Industrial - Construction',
  'Electrical Components & Equipm': 'Technology - Hardware',

  // ==================== TECHNOLOGY ====================
  'Application Software': 'Technology - Software',
  'IT Consulting & Other Services': 'Technology - Software',
  'Internet Services & Infrastruc': 'Technology - Software',
  'Interactive Media & Services': 'Technology - Software',
  'Technology Hardware, Storage &': 'Technology - Hardware',
  'Technology Distributors': 'Technology - Hardware',
  'Communications Equipment': 'Technology - Hardware',
  'Electronic Components': 'Technology - Semiconductor',
  'Electronic Equipment & Instrum': 'Technology - Hardware',
  'Semiconductors': 'Technology - Semiconductor',

  // ==================== MATERIALS ====================
  'Diversified Metals & Mining': 'Materials - Mining',
  'Gold': 'Materials - Mining',
  'Copper': 'Materials - Mining',
  'Aluminum': 'Materials - Mining',
  'Steel': 'Materials - Mining',
  'Commodity Chemicals': 'Materials - Chemicals',
  'Specialty Chemicals': 'Materials - Chemicals',
  'Diversified Chemicals': 'Materials - Chemicals',
  'Industrial Gases': 'Materials - Chemicals',
  'Fertilizers & Agricultural Che': 'Materials - Chemicals',
  'Paper Products': 'Materials - Chemicals',
  'Forest Products': 'Materials - Chemicals',
  'Paper & Plastic Packaging Prod': 'Materials - Chemicals',
  'Metal, Glass & Plastic Contain': 'Materials - Chemicals',

  // ==================== ENERGY ====================
  'Coal & Consumable Fuels': 'Energy - Oil & Gas',
  'Oil & Gas Exploration & Produc': 'Energy - Oil & Gas',
  'Oil & Gas Refining & Marketing': 'Energy - Oil & Gas',
  'Oil & Gas Storage & Transporta': 'Energy - Oil & Gas',
  'Oil & Gas Equipment & Services': 'Energy - Oil & Gas',
  'Oil & Gas Drilling': 'Energy - Oil & Gas',
  'Renewable Electricity': 'Energy - Renewable',
  'Independent Power Producers &': 'Energy - Renewable',

  // ==================== TELECOMMUNICATIONS ====================
  'Integrated Telecommunication S': 'Telecom - Wireless',
  'Wireless Telecommunication Ser': 'Telecom - Wireless',
  'Alternative Carriers': 'Telecom - Towers',
  'Cable & Satellite': 'Telecom - Towers',

  // ==================== MEDIA & ENTERTAINMENT ====================
  'Broadcasting': 'Consumer Discretionary - Retail',
  'Publishing': 'Consumer Discretionary - Retail',
  'Advertising': 'Consumer Discretionary - Retail',
  'Commercial Printing': 'Consumer Discretionary - Retail',

  // ==================== UTILITIES ====================
  'Electric Utilities': 'Utilities - Power',
  'Gas Utilities': 'Utilities - Power',

  // ==================== HEALTHCARE ====================
  'Pharmaceuticals': 'Healthcare - Pharma',
  'Health Care Facilities': 'Healthcare - Hospitals',
  'Health Care Services': 'Healthcare - Hospitals',
  'Health Care Distributors': 'Healthcare - Pharma',
  'Health Care Supplies': 'Healthcare - Pharma',

  // ==================== TIRES & RUBBER ====================
  'Tires & Rubber': 'Consumer Discretionary - Auto',
};

// Helper function to get industry preset by GICS Sub-Industry (primary) or sector (fallback)
export const getIndustryPreset = (sector, subsector, gicsSubIndustry) => {
  // Priority 1: GICS Sub-Industry (most granular - from Bloomberg)
  if (gicsSubIndustry && GICS_TO_PRESET_MAP[gicsSubIndustry]) {
    const presetKey = GICS_TO_PRESET_MAP[gicsSubIndustry];
    if (INDUSTRY_PRESETS[presetKey]) {
      return {
        ...INDUSTRY_PRESETS[presetKey],
        matchedOn: 'GICS Sub-Industry',
        gicsSubIndustry
      };
    }
  }

  // Priority 2: Exact subsector match (our custom presets)
  if (subsector && INDUSTRY_PRESETS[subsector]) {
    return {
      ...INDUSTRY_PRESETS[subsector],
      matchedOn: 'Subsector',
      gicsSubIndustry
    };
  }

  // Priority 3: Map Bloomberg sector to best-fit preset
  const sectorMapping = {
    'Financial': 'Banks - Diversified',
    'Technology': 'Technology - Software',
    'Consumer, Cyclical': 'Consumer Discretionary - Retail',
    'Consumer, Non-cyclical': 'Consumer Staples - Food',
    'Industrial': 'Industrial - Construction',
    'Basic Materials': 'Materials - Mining',
    'Energy': 'Energy - Oil & Gas',
    'Communications': 'Telecom - Wireless',
    'Utilities': 'Utilities - Power',
    'Healthcare': 'Healthcare - Pharma',
    // GICS Sectors
    'Financials': 'Banks - Diversified',
    'Information Technology': 'Technology - Software',
    'Consumer Discretionary': 'Consumer Discretionary - Retail',
    'Consumer Staples': 'Consumer Staples - Food',
    'Industrials': 'Industrial - Construction',
    'Materials': 'Materials - Mining',
    'Energy': 'Energy - Oil & Gas',
    'Communication Services': 'Telecom - Wireless',
    'Utilities': 'Utilities - Power',
    'Health Care': 'Healthcare - Pharma',
    'Real Estate': 'Real Estate - Developers'
  };

  const mappedKey = sectorMapping[sector] || 'default';
  const preset = INDUSTRY_PRESETS[mappedKey] || INDUSTRY_PRESETS['default'];

  return {
    ...preset,
    matchedOn: 'Sector Fallback',
    gicsSubIndustry
  };
};

// ============================================================================
// COST OF CAPITAL CALCULATIONS
// Based on: CAPM + Country Risk Premium (Damodaran methodology)
// ============================================================================

/**
 * Calculate Cost of Equity using CAPM with Country Risk Premium
 * Formula: Re = Rf + β × (ERP) + CRP + Sector Risk Premium
 *
 * Per Damodaran: For emerging markets, add country risk premium to capture
 * additional sovereign and currency risk not reflected in beta
 *
 * @param {number} beta - Company beta (levered)
 * @param {string} region - 'Indonesia' or 'US'
 * @param {Object} customOverrides - Optional custom assumption overrides
 * @returns {number} Cost of equity as percentage
 */
export const calculateCostOfEquity = (beta, region, customOverrides = {}) => {
  const baseParams = DCF_ASSUMPTIONS[region] || DCF_ASSUMPTIONS.US;

  // Merge custom overrides with base params
  const params = {
    riskFreeRate: customOverrides.riskFreeRate ?? baseParams.riskFreeRate,
    equityRiskPremium: customOverrides.equityRiskPremium ?? baseParams.equityRiskPremium,
    countryRiskPremium: customOverrides.countryRiskPremium ?? baseParams.countryRiskPremium,
  };

  // Apply Blume adjustment for beta mean reversion: Adjusted β = 0.67 × Raw β + 0.33 × 1.0
  // This is standard Bloomberg/CFA practice for forward-looking beta
  // Allow user to override beta adjustment factor or disable it entirely
  const rawBeta = customOverrides.beta ?? beta ?? 1.0;
  const useBlumeAdjustment = customOverrides.useBlumeAdjustment !== false;
  const betaAdjustmentFactor = customOverrides.betaAdjustment ?? 1.0;

  let adjustedBeta;
  if (useBlumeAdjustment) {
    const blumeAdjustedBeta = (0.67 * rawBeta) + (0.33 * 1.0);
    adjustedBeta = blumeAdjustedBeta * betaAdjustmentFactor;
  } else {
    adjustedBeta = rawBeta * betaAdjustmentFactor;
  }

  // Cap adjusted beta between 0.4 and 2.5 for reasonableness
  adjustedBeta = Math.max(0.4, Math.min(2.5, adjustedBeta));

  // Add sector risk premium if provided (from industry preset)
  const sectorRiskPremium = customOverrides.sectorRiskPremium ?? 0;

  return params.riskFreeRate +
         (adjustedBeta * params.equityRiskPremium) +
         params.countryRiskPremium +
         sectorRiskPremium;
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
 * @param {Object} customOverrides - Optional custom assumption overrides
 * @returns {Object} WACC details
 */
export const calculateWACC = (stock, region, customOverrides = {}) => {
  const baseParams = DCF_ASSUMPTIONS[region] || DCF_ASSUMPTIONS.US;

  // Merge custom overrides for tax rate
  const taxRate = customOverrides.taxRate ?? baseParams.taxRate;

  // Get normalized D/E ratio (allow user override)
  const deRatio = customOverrides.deRatio ?? normalizeDeRatio(stock.DE);

  // Capital structure weights (from D/E ratio)
  // D/V = D/E / (1 + D/E), E/V = 1 / (1 + D/E)
  const debtWeight = deRatio / (1 + deRatio);
  const equityWeight = 1 - debtWeight;

  // Component costs (pass custom overrides through)
  const costOfEquity = calculateCostOfEquity(stock.Beta, region, customOverrides);
  const debtData = calculateCostOfDebt(stock, region);

  // Allow custom cost of debt spread override
  const preTaxCostOfDebt = customOverrides.costOfDebt ?? debtData.preTaxCost;
  const afterTaxCostOfDebt = preTaxCostOfDebt * (1 - taxRate / 100);

  // WACC calculation (allow direct override as well)
  let wacc;
  if (customOverrides.wacc !== undefined) {
    wacc = customOverrides.wacc;
  } else {
    wacc = (equityWeight * costOfEquity) + (debtWeight * afterTaxCostOfDebt);
  }

  return {
    wacc: Math.round(wacc * 100) / 100,
    costOfEquity: Math.round(costOfEquity * 100) / 100,
    costOfDebt: preTaxCostOfDebt,
    afterTaxCostOfDebt: Math.round(afterTaxCostOfDebt * 100) / 100,
    debtWeight: Math.round(debtWeight * 1000) / 10,
    equityWeight: Math.round(equityWeight * 1000) / 10,
    beta: customOverrides.beta ?? stock.Beta ?? 1.0,
    syntheticRating: debtData.syntheticRating,
    debtRatingMethod: debtData.method,
    taxRate,
    isCustom: Object.keys(customOverrides).length > 0
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
  const isFinancial = sector.includes('Financial') || sector.includes('Bank');

  let fcff = 0;
  let method = '';
  let confidence = 'Low';

  // SANITY CHECK HELPER: FCF Yield should be 1-10% typically
  // If FCF Yield is below 0.5%, the data is likely in wrong units (millions vs actual currency)
  const marketCap = stock["Market Cap"] || 1;
  const checkFCFYield = (fcfValue) => {
    const fcfYield = (fcfValue / marketCap) * 100;
    return fcfYield >= 0.5; // Minimum 0.5% FCF yield to be plausible
  };

  // METHOD 1: Direct FCF data (highest confidence)
  // SANITY CHECKS:
  // 1. FCF should be comparable to Net Income (within 100x)
  // 2. FCF yield should be at least 0.5%
  if (stock.FCF && stock.FCF > 0) {
    const netIncome = stock["Net Income"];
    const fcfToNetIncomeRatio = netIncome ? (netIncome / stock.FCF) : 1;

    // Check both: Net Income ratio AND FCF yield
    if (fcfToNetIncomeRatio < 100 && checkFCFYield(stock.FCF)) {
      fcff = stock.FCF;
      method = 'Direct FCF';
      confidence = 'High';
      return { fcff, method, confidence };
    }
    // FCF data is unreliable - fall through to other methods
  }

  // METHOD 2: Use actual Net Income data when available
  // For financials: FCF ≈ Net Income × 0.85 (high cash conversion)
  // For others: FCF ≈ Net Income × 0.65-0.80 (after reinvestment)
  if (stock["Net Income"] && stock["Net Income"] > 0) {
    const netIncome = stock["Net Income"];

    // SANITY CHECK: Net Income yield should also be reasonable (at least 0.3%)
    const netIncomeYield = (netIncome / marketCap) * 100;
    if (netIncomeYield >= 0.3) {
      // FCF conversion rate depends on sector
      let fcfConversionRate;
      if (isFinancial) {
        fcfConversionRate = 0.85; // Banks have high cash conversion
      } else if (sector === 'Technology') {
        fcfConversionRate = 0.80; // Tech has good FCF conversion
      } else if (sector === 'Energy' || sector === 'Basic Materials') {
        fcfConversionRate = 0.50; // Capital intensive
      } else {
        fcfConversionRate = 0.65; // Default
      }

      fcff = netIncome * fcfConversionRate;
      method = 'Net Income Based';
      confidence = 'High';

      return {
        fcff,
        method,
        confidence,
        details: {
          netIncome: Math.round(netIncome),
          fcfConversionRate
        }
      };
    }
    // Net Income data is unreliable - fall through to EBITDA method
  }

  // METHOD 3: Full FCFF calculation from EBITDA
  // FCFF = EBIT(1-T) + D&A - CapEx - ΔNWC
  if (stock["EBITDA Margin"] && stock["Market Cap"]) {
    // SANITY CHECK: Revenue/Market Cap should be at least 5% (most companies have PS < 20)
    // If Revenue is way too low relative to Market Cap, it's likely in wrong units
    let impliedRevenue;
    const revenueYield = stock.Revenue ? (stock.Revenue / marketCap * 100) : 0;

    if (revenueYield >= 5) {
      // Revenue looks reasonable
      impliedRevenue = stock.Revenue;
    } else {
      // Revenue is missing or in wrong units - estimate from Market Cap / PS
      // Use sector-typical PS multiples if PS is missing
      const sectorPS = {
        'Technology': 8,
        'Financial': 3,
        'Consumer, Cyclical': 1.5,
        'Consumer, Non-cyclical': 2.5,
        'Industrial': 1.5,
        'Basic Materials': 1.5,
        'Energy': 1,
        'Communications': 3,
        'Utilities': 2,
        'Healthcare': 4,
        'default': 2.5
      };
      const typicalPS = sectorPS[sector] || sectorPS.default;
      const psToUse = stock.PS || typicalPS;
      impliedRevenue = marketCap / psToUse;
    }

    const ebitdaMargin = stock["EBITDA Margin"] / 100;
    const ebitda = impliedRevenue * ebitdaMargin;

    const da = ebitda * sectorParams.daToEbitda;
    const ebit = ebitda - da;
    const nopat = ebit * (1 - params.taxRate / 100);
    const capex = da * sectorParams.capexToDA;
    const revenueGrowth = (stock["Revenue Growth"] || 5) / 100;
    const deltaNWC = impliedRevenue * revenueGrowth * sectorParams.nwcToRevGrowth;

    fcff = nopat + da - capex - deltaNWC;

    method = 'EBITDA-Based';
    confidence = 'Medium';

    return {
      fcff: Math.max(0, fcff),
      method,
      confidence,
      details: {
        impliedRevenue: Math.round(impliedRevenue),
        ebitda: Math.round(ebitda),
        nopat: Math.round(nopat)
      }
    };
  }

  // METHOD 4: Damodaran's Reinvestment Rate approach
  if (stock.ROE && stock["Market Cap"] && stock.PB) {
    const bookValue = stock["Market Cap"] / (stock.PB || 2);
    const netIncome = bookValue * (stock.ROE / 100);
    const roic = (stock.ROE / 100) * 0.85;
    const expectedGrowth = Math.min((stock["Revenue Growth"] || 5) / 100, 0.20);
    const reinvestmentRate = Math.min(expectedGrowth / Math.max(roic, 0.08), 0.80);
    const deRatio = normalizeDeRatio(stock.DE);
    const nopat = netIncome * (1 + deRatio * (1 - params.taxRate / 100));

    fcff = nopat * (1 - reinvestmentRate);

    method = 'ROE-Based';
    confidence = 'Medium-Low';

    return {
      fcff: Math.max(0, fcff),
      method,
      confidence,
      details: {
        netIncome: Math.round(netIncome),
        reinvestmentRate: Math.round(reinvestmentRate * 100) / 100,
        nopat: Math.round(nopat)
      }
    };
  }

  // METHOD 5: Sector FCF Yield (last resort)
  const sectorFCFYields = {
    'Technology': 0.035,
    'Financial': 0.055,
    'Consumer, Cyclical': 0.04,
    'Consumer, Non-cyclical': 0.045,
    'Industrial': 0.045,
    'Basic Materials': 0.05,
    'Energy': 0.06,
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
  const sector = stock["Industry Sector"] || 'default';
  const isFinancial = sector.includes('Financial') || sector.includes('Bank');

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

  // SPECIAL HANDLING FOR FINANCIALS (Banks, Insurance)
  // For banks, D/E ratio represents deposits/liabilities, NOT traditional debt
  // Net Debt concept doesn't apply the same way
  // Use a simplified approach: assume minimal net debt for valuation purposes
  if (isFinancial) {
    // For banks, use a small percentage of market cap as net debt proxy
    // This reflects that banks' "debt" is mostly deposits which earn spread income
    const netDebt = marketCap * 0.05; // Assume 5% of market cap as effective net debt
    return {
      netDebt,
      totalDebt: 0,
      cash: 0,
      bookEquity: marketCap / (stock.PB || 2),
      method: 'Financial Sector (simplified)',
      confidence: 'Medium'
    };
  }

  // METHOD 2: Estimate from Book Value and D/E ratio for non-financials
  const pb = stock.PB || 2;
  const bookEquity = marketCap / pb;
  const deRatio = normalizeDeRatio(stock.DE);

  // Total Debt from D/E ratio applied to book equity
  const totalDebt = bookEquity * deRatio;

  // Estimate Cash - use sector benchmarks (more reliable than Current Ratio estimation)
  // Tech companies especially often have significant cash relative to market cap
  const sectorCashRatios = {
    'Technology': 0.12,        // Tech companies typically have large cash positions
    'Consumer, Cyclical': 0.06,
    'Consumer, Non-cyclical': 0.08,
    'Industrial': 0.06,
    'Basic Materials': 0.05,
    'Energy': 0.06,
    'Communications': 0.08,
    'Utilities': 0.04,
    'Healthcare': 0.10,
    'default': 0.07
  };

  const cashRatio = sectorCashRatios[sector] || sectorCashRatios.default;
  let estimatedCash = marketCap * cashRatio;
  let cashMethod = 'Sector Benchmark';

  // For high P/B companies, increase cash estimate (they often have more cash than book value implies)
  if (pb > 10) {
    estimatedCash = Math.max(estimatedCash, marketCap * 0.10);
    cashMethod = 'High P/B Adjustment';
  }

  // Net Debt = Total Debt - Cash
  const netDebt = totalDebt - estimatedCash;

  return {
    netDebt: Math.max(-marketCap * 0.5, netDebt),
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
 * 6. NEW: User-editable assumptions with industry presets
 *
 * @param {Object} stock - Stock object with financial data
 * @param {string} region - 'Indonesia' or 'US'
 * @param {Object} customOverrides - Optional custom assumption overrides
 * @returns {Object} Complete DCF analysis
 */
export const calculateDCF = (stock, region, customOverrides = {}) => {
  const baseParams = DCF_ASSUMPTIONS[region] || DCF_ASSUMPTIONS.US;

  // Merge custom overrides with base params
  const params = {
    ...baseParams,
    terminalGrowth: customOverrides.terminalGrowth ?? baseParams.terminalGrowth,
    taxRate: customOverrides.taxRate ?? baseParams.taxRate,
    riskFreeRate: customOverrides.riskFreeRate ?? baseParams.riskFreeRate,
    equityRiskPremium: customOverrides.equityRiskPremium ?? baseParams.equityRiskPremium,
    countryRiskPremium: customOverrides.countryRiskPremium ?? baseParams.countryRiskPremium,
  };

  // Calculate WACC with custom overrides
  const waccData = calculateWACC(stock, region, customOverrides);
  const wacc = waccData.wacc;

  // Base FCF estimation using improved methodology
  // Allow custom FCF override for manual analyst input
  let fcfData;
  let baseFCF;

  if (customOverrides.baseFCF !== undefined) {
    baseFCF = customOverrides.baseFCF;
    fcfData = { fcff: baseFCF, method: 'User Override', confidence: 'Custom' };
  } else {
    fcfData = estimateFCFF(stock, region);
    baseFCF = fcfData.fcff;
  }

  // Growth rate assumptions (decay from current to terminal)
  // Use blended growth rate: 70% Revenue Growth + 30% Earnings Growth
  // This balances top-line growth with bottom-line improvements (margin expansion, buybacks)
  // Cap each input at reasonable sustainable levels before blending
  const revenueGrowth = stock["Revenue Growth"] !== null && stock["Revenue Growth"] !== undefined
    ? Math.min(40, Math.max(-20, stock["Revenue Growth"]))
    : null;
  const rawEarningsGrowth = stock["Net Income Growth"] || stock["EPS Growth"] || null;
  // Cap earnings growth at +40% as higher is usually one-time/unsustainable
  const earningsGrowth = rawEarningsGrowth !== null
    ? Math.min(40, Math.max(-20, rawEarningsGrowth))
    : null;

  let rawGrowth;
  if (revenueGrowth !== null && earningsGrowth !== null) {
    // Blend: 70% revenue, 30% earnings (revenue is more sustainable)
    rawGrowth = (revenueGrowth * 0.7) + (earningsGrowth * 0.3);
  } else if (revenueGrowth !== null) {
    rawGrowth = revenueGrowth;
  } else if (earningsGrowth !== null) {
    rawGrowth = earningsGrowth;
  } else {
    rawGrowth = 8; // Default assumption
  }

  // Final cap on blended growth - allow user override
  const defaultCurrentGrowth = Math.min(35, Math.max(-15, rawGrowth));
  const currentGrowth = customOverrides.initialGrowth ?? defaultCurrentGrowth;
  const terminalGrowth = params.terminalGrowth;

  // Determine forecast period based on growth profile (McKinsey approach)
  // High growth companies warrant longer explicit forecast
  // Allow user override
  const isHighGrowth = currentGrowth > 15;
  const defaultForecastYears = isHighGrowth ? 10 : 5;
  const forecastYears = customOverrides.forecastYears ?? defaultForecastYears;

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
  let enterpriseValue = pvFCF + discountedTV;

  // SANITY CHECK: Enterprise Value should not exceed 5x Market Cap
  // If it does, the model is producing unrealistic results
  const marketCap = stock["Market Cap"] || 1000000000;
  const evToMarketCap = enterpriseValue / marketCap;
  let evCapped = false;

  if (evToMarketCap > 5) {
    // Cap EV at 3x market cap for reasonableness
    enterpriseValue = marketCap * 3;
    evCapped = true;
    if (!terminalValueWarning) terminalValueWarning = 'EV capped: Model produced unrealistic value';
  }

  // Terminal Value as % of EV (McKinsey sanity check)
  const tvPercentage = (discountedTV / (pvFCF + discountedTV)) * 100;

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
  const equityValue = Math.max(0, enterpriseValue - netDebt);

  // Fair Value per Share
  // Implied price = Current Price × (Equity Value / Market Cap)
  const currentPrice = stock.Price || 1000;
  let fairValue = currentPrice * (equityValue / marketCap);

  // SANITY CHECK: Cap upside at reasonable levels
  // Most institutional research caps price targets at +/- 100% from current
  const maxUpside = 1.5; // 150% max upside
  const maxDownside = 0.5; // 50% max downside (fair value = 50% of current)

  if (fairValue > currentPrice * (1 + maxUpside)) {
    fairValue = currentPrice * (1 + maxUpside);
  } else if (fairValue < currentPrice * maxDownside) {
    fairValue = currentPrice * maxDownside;
  }

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

  // Track which assumptions are custom vs default
  const customAssumptionsUsed = {
    terminalGrowth: customOverrides.terminalGrowth !== undefined,
    initialGrowth: customOverrides.initialGrowth !== undefined,
    forecastYears: customOverrides.forecastYears !== undefined,
    riskFreeRate: customOverrides.riskFreeRate !== undefined,
    equityRiskPremium: customOverrides.equityRiskPremium !== undefined,
    countryRiskPremium: customOverrides.countryRiskPremium !== undefined,
    beta: customOverrides.beta !== undefined,
    taxRate: customOverrides.taxRate !== undefined,
    wacc: customOverrides.wacc !== undefined,
    baseFCF: customOverrides.baseFCF !== undefined,
  };
  const hasCustomAssumptions = Object.values(customAssumptionsUsed).some(v => v);

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
    warnings: terminalValueWarning ? [terminalValueWarning] : [],
    evCapped,
    evToMarketCapRatio: Math.round(evToMarketCap * 100) / 100,
    // NEW: Custom assumption tracking
    currentGrowth: Math.round(currentGrowth * 10) / 10,
    terminalGrowth: params.terminalGrowth,
    hasCustomAssumptions,
    customAssumptionsUsed,
    customOverrides: { ...customOverrides },
    // Computed values for UI display
    computedDefaults: {
      initialGrowth: Math.round(defaultCurrentGrowth * 10) / 10,
      forecastYears: defaultForecastYears,
      terminalGrowth: baseParams.terminalGrowth,
      riskFreeRate: baseParams.riskFreeRate,
      equityRiskPremium: baseParams.equityRiskPremium,
      countryRiskPremium: baseParams.countryRiskPremium,
      taxRate: baseParams.taxRate,
    }
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
 * With institutional-grade methodology using GICS classification hierarchy
 *
 * KEY IMPROVEMENTS (Updated Dec 2025):
 * 1. GICS Sub-Industry → Industry → Industry Group → Sector hierarchy for peer selection
 * 2. Tighter peer selection (0.33x to 3x market cap)
 * 3. EV/EBITDA excluded for financials
 * 4. P/TBV added for banks
 * 5. Growth-adjusted peer matching with GICS specificity weighting
 * 6. Statistical range reporting (25th/75th percentile)
 *
 * Per Rosenbaum & Pearl / Damodaran: "Peers should be in the same specific industry
 * with similar business models, size, and growth profiles"
 *
 * @param {Object} stock - Target stock
 * @param {Array} allStocks - All available stocks for comparison
 * @returns {Object} Comps analysis results
 */
export const calculateComparables = (stock, allStocks) => {
  if (!stock || !allStocks || allStocks.length === 0) return null;

  const marketCap = stock["Market Cap"] || 0;
  if (marketCap === 0) return null;

  // Extract GICS classifications (most specific to least specific)
  const gicsSubIndustry = stock["GICS Sub-Industry"] || '';
  const gicsIndustry = stock["GICS Industry"] || '';
  const gicsIndustryGroup = stock["GICS Industry Group"] || '';
  const gicsSector = stock["GICS Sector"] || '';

  // Fallback to legacy Bloomberg classification if GICS unavailable
  const legacySector = stock["Industry Sector"] || '';

  const isFinancial = gicsSector.includes('Financial') || legacySector.includes('Financial') ||
                      legacySector.includes('Bank') || legacySector.includes('Insurance');

  // Market cap ranges per Rosenbaum & Pearl
  // Tight: 0.5x to 2x market cap (ideal peers)
  // Relaxed: 0.33x to 3x market cap (acceptable peers)
  // Wide: 0.2x to 5x market cap (last resort)
  const tightLower = marketCap * 0.5;
  const tightUpper = marketCap * 2.0;
  const relaxedLower = marketCap * 0.33;
  const relaxedUpper = marketCap * 3.0;
  const wideLower = marketCap * 0.2;
  const wideUpper = marketCap * 5.0;

  // Base quality filter (valid PE, not the target stock)
  const baseFilter = (s) =>
    s.Ticker !== stock.Ticker &&
    s["Market Cap"] &&
    s.PE && s.PE > 0 && s.PE < 100;

  // ============================================================================
  // GICS HIERARCHY PEER SELECTION (Industry Best Practice)
  // Per Damodaran: "Start with the most specific industry classification"
  // ============================================================================

  // LEVEL 1: GICS Sub-Industry (most specific - e.g., "Agricultural Products & Services")
  // Same sub-industry + same region + tight market cap
  const level1Filter = (s) =>
    baseFilter(s) &&
    s["GICS Sub-Industry"] && s["GICS Sub-Industry"] === gicsSubIndustry &&
    s.Region === stock.Region &&
    s["Market Cap"] >= tightLower && s["Market Cap"] <= tightUpper;

  // LEVEL 2: GICS Sub-Industry + any region OR same GICS Industry + same region
  // Slightly relaxed geography or one level up in classification
  const level2Filter = (s) =>
    baseFilter(s) &&
    ((s["GICS Sub-Industry"] && s["GICS Sub-Industry"] === gicsSubIndustry) ||
     (s["GICS Industry"] && s["GICS Industry"] === gicsIndustry && s.Region === stock.Region)) &&
    s["Market Cap"] >= relaxedLower && s["Market Cap"] <= relaxedUpper;

  // LEVEL 3: GICS Industry (e.g., "Food Products") + relaxed market cap
  const level3Filter = (s) =>
    baseFilter(s) &&
    s["GICS Industry"] && s["GICS Industry"] === gicsIndustry &&
    s["Market Cap"] >= relaxedLower && s["Market Cap"] <= relaxedUpper;

  // LEVEL 4: GICS Industry Group (e.g., "Food, Beverage & Tobacco")
  const level4Filter = (s) =>
    baseFilter(s) &&
    s["GICS Industry Group"] && s["GICS Industry Group"] === gicsIndustryGroup &&
    s["Market Cap"] >= relaxedLower && s["Market Cap"] <= relaxedUpper;

  // LEVEL 5: GICS Sector (e.g., "Consumer Staples") - broad but still GICS
  const level5Filter = (s) =>
    baseFilter(s) &&
    s["GICS Sector"] && s["GICS Sector"] === gicsSector &&
    s["Market Cap"] >= wideLower && s["Market Cap"] <= wideUpper;

  // LEVEL 6: Legacy Bloomberg sector (fallback for stocks without GICS)
  const legacyFilter = (s) =>
    baseFilter(s) &&
    s["Industry Sector"] === legacySector &&
    s["Market Cap"] >= wideLower && s["Market Cap"] <= wideUpper;

  // Apply filters in order of specificity, requiring minimum 3 peers
  let peers = [];
  let selectionMethod = '';
  let gicsMatchLevel = 0;

  // Try each level until we have enough peers
  if (gicsSubIndustry) {
    peers = allStocks.filter(level1Filter);
    if (peers.length >= 3) {
      selectionMethod = `GICS Sub-Industry: ${gicsSubIndustry} (same region, 0.5-2x cap)`;
      gicsMatchLevel = 1;
    }
  }

  if (peers.length < 3 && (gicsSubIndustry || gicsIndustry)) {
    peers = allStocks.filter(level2Filter);
    if (peers.length >= 3) {
      selectionMethod = `GICS Sub-Industry/Industry: ${gicsSubIndustry || gicsIndustry} (relaxed)`;
      gicsMatchLevel = 2;
    }
  }

  if (peers.length < 3 && gicsIndustry) {
    peers = allStocks.filter(level3Filter);
    if (peers.length >= 3) {
      selectionMethod = `GICS Industry: ${gicsIndustry} (0.33-3x cap)`;
      gicsMatchLevel = 3;
    }
  }

  if (peers.length < 3 && gicsIndustryGroup) {
    peers = allStocks.filter(level4Filter);
    if (peers.length >= 3) {
      selectionMethod = `GICS Industry Group: ${gicsIndustryGroup}`;
      gicsMatchLevel = 4;
    }
  }

  if (peers.length < 3 && gicsSector) {
    peers = allStocks.filter(level5Filter);
    if (peers.length >= 3) {
      selectionMethod = `GICS Sector: ${gicsSector} (broad)`;
      gicsMatchLevel = 5;
    }
  }

  // Final fallback to legacy classification
  if (peers.length < 3) {
    peers = allStocks.filter(legacyFilter);
    selectionMethod = `Legacy Sector: ${legacySector} (fallback)`;
    gicsMatchLevel = 6;
  }

  // Score peers by similarity, incorporating GICS match specificity
  peers = peers
    .map(p => {
      let similarityScore = 0;

      // GICS SPECIFICITY BONUS (most important for comps quality)
      // Per Damodaran: "The more specific the industry match, the better the comp"
      if (p["GICS Sub-Industry"] === gicsSubIndustry && gicsSubIndustry) {
        similarityScore += 40; // Exact sub-industry match
      } else if (p["GICS Industry"] === gicsIndustry && gicsIndustry) {
        similarityScore += 30; // Same industry
      } else if (p["GICS Industry Group"] === gicsIndustryGroup && gicsIndustryGroup) {
        similarityScore += 20; // Same industry group
      } else if (p["GICS Sector"] === gicsSector && gicsSector) {
        similarityScore += 10; // Same sector only
      }

      // Market cap proximity (second most important)
      const capRatio = p["Market Cap"] / marketCap;
      if (capRatio >= 0.5 && capRatio <= 2.0) similarityScore += 25;
      else if (capRatio >= 0.33 && capRatio <= 3.0) similarityScore += 15;
      else similarityScore += 5;

      // Same region bonus
      if (p.Region === stock.Region) similarityScore += 15;

      // Growth profile similarity
      const targetGrowth = stock["Revenue Growth"] || 5;
      const peerGrowth = p["Revenue Growth"] || 5;
      const growthDiff = Math.abs(targetGrowth - peerGrowth);
      if (growthDiff < 5) similarityScore += 10;
      else if (growthDiff < 10) similarityScore += 5;

      // Profitability similarity
      const targetMargin = stock["EBITDA Margin"] || 15;
      const peerMargin = p["EBITDA Margin"] || 15;
      const marginDiff = Math.abs(targetMargin - peerMargin);
      if (marginDiff < 5) similarityScore += 10;
      else if (marginDiff < 10) similarityScore += 5;

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
  } else if (gicsSector.includes('Technology') || gicsSector.includes('Information') || legacySector.includes('Technology') || legacySector.includes('Communications')) {
    // TECH: Higher weight on EV/EBITDA and growth-adjusted metrics
    weights = { pe: 0.30, pb: 0.15, ptbv: 0, evEbitda: 0.55 };
    methodologyNote = 'Tech/Comms sector: EV/EBITDA emphasized';
  } else if (gicsSector.includes('Industrial') || gicsSector.includes('Material') || gicsSector.includes('Energy') || legacySector.includes('Industrial') || legacySector.includes('Material') || legacySector.includes('Energy')) {
    // CYCLICALS: Balance between P/E and EV/EBITDA
    weights = { pe: 0.35, pb: 0.20, ptbv: 0, evEbitda: 0.45 };
    methodologyNote = 'Cyclical sector: Balanced P/E and EV/EBITDA';
  } else if (gicsSector.includes('Consumer') || legacySector.includes('Consumer')) {
    // CONSUMER: Higher P/E weight (earnings quality important)
    weights = { pe: 0.45, pb: 0.25, ptbv: 0, evEbitda: 0.30 };
    methodologyNote = 'Consumer sector: P/E emphasized';
  } else if (gicsSector.includes('Utilities') || legacySector.includes('Utilities')) {
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
    // Peer information with GICS classification
    peers: peers.map(p => ({
      ticker: p.Ticker,
      name: p.Name || p.name,
      marketCap: p["Market Cap"],
      pe: p.PE,
      pb: p.PB,
      evEbitda: isFinancial ? null : calculateEVEBITDA(p),
      ptbv: isFinancial ? calculatePTBV(p) : null,
      revenueGrowth: p["Revenue Growth"],
      similarityScore: p.similarityScore,
      // GICS classification for peer quality assessment
      gicsSubIndustry: p["GICS Sub-Industry"],
      gicsIndustry: p["GICS Industry"],
      gicsIndustryGroup: p["GICS Industry Group"]
    })),
    peerCount: peers.length,
    selectionMethod,
    gicsMatchLevel, // 1=Sub-Industry (best), 2-5=broader, 6=legacy fallback

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
    sector: legacySector, // Legacy Bloomberg sector
    isFinancial,

    // GICS Classification (target stock)
    gicsClassification: {
      sector: gicsSector,
      industryGroup: gicsIndustryGroup,
      industry: gicsIndustry,
      subIndustry: gicsSubIndustry
    }
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
// SENSITIVITY ANALYSIS - Investment Banking Standard
// Based on: Goldman Sachs, Morgan Stanley, McKinsey pitch book methodology
// Reference: Wall Street Prep, Breaking Into Wall Street, Damodaran
// ============================================================================

/**
 * Professional Sensitivity Analysis for DCF Valuation
 * Creates a 5x5 matrix varying WACC and Terminal Growth Rate
 *
 * Industry Best Practices Applied:
 * 1. 5x5 matrix (standard in IB pitch books)
 * 2. WACC ±1% in 0.5% steps (per Financial Edge recommendation)
 * 3. Terminal Growth ±0.5% in 0.25% steps (conservative per McKinsey)
 * 4. Lowest value top-left, highest bottom-right (Wall Street convention)
 * 5. Base case highlighted in center
 *
 * @param {Object} stock - Stock object with financial data
 * @param {string} region - 'Indonesia' or 'US'
 * @param {Object} baseDCF - Base case DCF result (optional, will calculate if not provided)
 * @returns {Object} Complete sensitivity analysis
 */
export const calculateSensitivityAnalysis = (stock, region, baseDCF = null) => {
  // Get base case DCF if not provided
  const dcf = baseDCF || calculateDCF(stock, region);
  if (!dcf) return null;

  const params = DCF_ASSUMPTIONS[region] || DCF_ASSUMPTIONS.US;
  const currentPrice = stock.Price || 1000;
  const marketCap = stock["Market Cap"] || 1000000000;

  // Base case values
  const baseWACC = dcf.wacc;
  const baseTerminalGrowth = params.terminalGrowth;

  // Define sensitivity ranges (per industry standards)
  // WACC: ±1% in 0.5% increments (5 values)
  // Terminal Growth: ±0.5% in 0.25% increments (5 values)
  const waccSteps = [-1.0, -0.5, 0, 0.5, 1.0];
  const growthSteps = [-0.5, -0.25, 0, 0.25, 0.5];

  const waccValues = waccSteps.map(step => Math.round((baseWACC + step) * 10) / 10);
  const growthValues = growthSteps.map(step => Math.round((baseTerminalGrowth + step) * 100) / 100);

  // Get base FCF and growth profile from DCF
  const baseFCF = dcf.baseFCF;
  const growthRates = dcf.growthRates;
  const forecastYears = dcf.forecastYears;

  // Calculate fair value for each WACC/Growth combination
  const matrix = [];
  let minFairValue = Infinity;
  let maxFairValue = -Infinity;
  let minUpside = Infinity;
  let maxUpside = -Infinity;

  // Build matrix (rows = WACC descending, cols = Growth ascending)
  // This follows the convention: lowest values top-left, highest bottom-right
  for (let i = waccValues.length - 1; i >= 0; i--) {
    const wacc = waccValues[i];
    const row = [];

    for (let j = 0; j < growthValues.length; j++) {
      const terminalGrowth = growthValues[j];

      // Skip invalid combinations (WACC must be > terminal growth)
      if (wacc <= terminalGrowth) {
        row.push({
          fairValue: null,
          upside: null,
          wacc,
          terminalGrowth,
          isBaseCase: false,
          isInvalid: true
        });
        continue;
      }

      // Recalculate DCF with new assumptions
      const result = recalculateDCFWithAssumptions(
        stock, region, baseFCF, growthRates, forecastYears,
        wacc, terminalGrowth, dcf.netDebt, marketCap, currentPrice
      );

      const isBaseCase = (Math.abs(wacc - baseWACC) < 0.01) &&
                         (Math.abs(terminalGrowth - baseTerminalGrowth) < 0.01);

      // Track min/max for range analysis
      if (result.fairValue !== null) {
        minFairValue = Math.min(minFairValue, result.fairValue);
        maxFairValue = Math.max(maxFairValue, result.fairValue);
        minUpside = Math.min(minUpside, result.upside);
        maxUpside = Math.max(maxUpside, result.upside);
      }

      row.push({
        fairValue: result.fairValue,
        upside: result.upside,
        wacc,
        terminalGrowth,
        isBaseCase,
        isInvalid: false
      });
    }
    matrix.push(row);
  }

  // Calculate percentiles for color coding
  const allUpsides = matrix.flat()
    .filter(cell => cell.upside !== null)
    .map(cell => cell.upside)
    .sort((a, b) => a - b);

  const p25 = allUpsides[Math.floor(allUpsides.length * 0.25)] || 0;
  const p50 = allUpsides[Math.floor(allUpsides.length * 0.50)] || 0;
  const p75 = allUpsides[Math.floor(allUpsides.length * 0.75)] || 0;

  // Summary statistics
  const validCells = matrix.flat().filter(cell => !cell.isInvalid);
  const avgFairValue = validCells.reduce((sum, c) => sum + (c.fairValue || 0), 0) / validCells.length;
  const avgUpside = validCells.reduce((sum, c) => sum + (c.upside || 0), 0) / validCells.length;

  // Valuation range analysis (per McKinsey methodology)
  const valuationRange = {
    min: Math.round(minFairValue * 100) / 100,
    max: Math.round(maxFairValue * 100) / 100,
    range: Math.round((maxFairValue - minFairValue) * 100) / 100,
    rangePercent: Math.round(((maxFairValue - minFairValue) / currentPrice) * 100),
    baseCase: dcf.fairValue,
    average: Math.round(avgFairValue * 100) / 100
  };

  const upsideRange = {
    min: Math.round(minUpside * 10) / 10,
    max: Math.round(maxUpside * 10) / 10,
    range: Math.round((maxUpside - minUpside) * 10) / 10,
    baseCase: dcf.upside,
    average: Math.round(avgUpside * 10) / 10,
    p25: Math.round(p25 * 10) / 10,
    p50: Math.round(p50 * 10) / 10,
    p75: Math.round(p75 * 10) / 10
  };

  // Investment recommendation based on sensitivity range
  let recommendation;
  let recommendationColor;
  if (minUpside > 20) {
    recommendation = 'Strong Buy - Upside in all scenarios';
    recommendationColor = 'emerald';
  } else if (minUpside > 0) {
    recommendation = 'Buy - Positive upside across range';
    recommendationColor = 'green';
  } else if (p50 > 0) {
    recommendation = 'Hold - Mixed valuation signals';
    recommendationColor = 'amber';
  } else if (maxUpside > 0) {
    recommendation = 'Cautious - Limited upside scenarios';
    recommendationColor = 'orange';
  } else {
    recommendation = 'Sell - Downside in all scenarios';
    recommendationColor = 'red';
  }

  return {
    matrix,
    waccValues: waccValues.slice().reverse(), // Match matrix row order (high to low)
    growthValues,
    baseWACC,
    baseTerminalGrowth,
    currentPrice,
    valuationRange,
    upsideRange,
    recommendation,
    recommendationColor,
    colorThresholds: { p25, p50, p75 },
    methodology: 'Two-way sensitivity: WACC (±1.0%) vs Terminal Growth (±0.5%)',
    note: 'Per investment banking standards (Goldman Sachs, Morgan Stanley pitch book format)'
  };
};

/**
 * Helper: Recalculate DCF with specific WACC and Terminal Growth assumptions
 * Reuses projected FCFs from base case for consistency
 *
 * NOTE: Per investment banking standards (Goldman Sachs, Morgan Stanley),
 * sensitivity analysis shows FULL theoretical range without capping.
 * This allows analysts to see true model sensitivity to assumptions.
 */
const recalculateDCFWithAssumptions = (
  stock, region, baseFCF, growthRates, forecastYears,
  wacc, terminalGrowth, netDebt, marketCap, currentPrice
) => {
  // Project FCFs using base growth rates
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

  // Terminal Value (Gordon Growth Model)
  // TV = FCF_terminal × (1 + g) / (WACC - g)
  const finalFCF = projectedFCFs[forecastYears - 1];
  const terminalFCF = finalFCF * (1 + terminalGrowth / 100);
  const waccMinusG = (wacc - terminalGrowth) / 100;

  // Prevent division by zero or negative spread
  if (waccMinusG <= 0.01) {
    return { fairValue: null, upside: null };
  }

  const terminalValue = terminalFCF / waccMinusG;
  const discountedTV = terminalValue / Math.pow(1 + wacc / 100, forecastYears);

  // Enterprise Value
  const pvFCF = discountedFCFs.reduce((a, b) => a + b, 0);
  let enterpriseValue = pvFCF + discountedTV;

  // Sanity check: cap EV at 10x market cap for sensitivity (more permissive than base DCF)
  // This prevents mathematically absurd values while showing meaningful sensitivity
  if (enterpriseValue > marketCap * 10) {
    enterpriseValue = marketCap * 10;
  }

  // Equity Value
  const equityValue = Math.max(0, enterpriseValue - netDebt);

  // Fair Value per Share (NO CAPPING for sensitivity analysis)
  // Per IB standards: show full theoretical range to demonstrate model sensitivity
  let fairValue = currentPrice * (equityValue / marketCap);

  // Only apply minimal sanity bounds for extreme cases
  // Cap at 5x current price (400% upside) and floor at 0.2x (80% downside)
  const maxFairValue = currentPrice * 5;
  const minFairValue = currentPrice * 0.2;

  if (fairValue > maxFairValue) {
    fairValue = maxFairValue;
  } else if (fairValue < minFairValue) {
    fairValue = minFairValue;
  }

  const upside = ((fairValue - currentPrice) / currentPrice) * 100;

  return {
    fairValue: Math.round(fairValue * 100) / 100,
    upside: Math.round(upside * 10) / 10
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
