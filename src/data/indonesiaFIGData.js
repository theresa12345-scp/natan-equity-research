// ============================================================================
// NATAN EQUITY RESEARCH - INDONESIAN FINANCIAL SERVICES DATA
// ============================================================================
// Real market data as of December 2025
// Sources:
// - Bloomberg, Yahoo Finance, Google Finance (Price Data)
// - Bank Quarterly Reports Q3 2024 / FY2024
// - OJK (Indonesia Financial Services Authority) June 2025
// - Company Investor Relations, Annual Reports
// - Bisnis Indonesia, Kontan, IDN Times (News/Data)
// ============================================================================

export const DATA_AS_OF = "December 5, 2025";

// ============================================================================
// BANKS - Big 4 + Major Banks
// Price Source: Yahoo Finance, Google Finance (Dec 2025)
// Financial Source: Q3 2024 Reports, FY2024 Annual Reports
// Research: Samuel Securities, RHB Research, Verdhana Research
// ============================================================================

export const INDONESIAN_BANKS = [
  {
    ticker: "BBCA",
    name: "Bank Central Asia",
    figType: "BANK",
    category: "Private Bank",
    isListed: true, // Publicly traded on IDX
    // Price Data (Dec 5, 2025) - Source: Yahoo Finance, Bisnis Indonesia
    price: 8225,
    ytdReturn: -12.92,
    weekChange: -0.90,
    week52High: 10625,
    week52Low: 7825,
    // Market Cap (IDR Billions)
    marketCap: 1028000,
    sharesOutstanding: 125101,
    // Profitability (FY2024 Annual Report)
    roe: 24.6,
    roa: 3.9,
    nim: 5.8,
    costToIncome: 31.5,
    // Valuation
    pb: 4.12,
    pe: 17.8,
    dividendYield: 2.9,
    payoutRatio: 0.52,
    // Asset Quality (Q3 2024) - Source: Samuel Securities Research
    nplRatio: 1.8,
    nplNet: 0.6,
    nplCoverage: 208.5,
    loanLossReserve: 5.2,
    lar: 5.3,
    creditCost: 0.40,
    // Capital & Liquidity (Q3 2024)
    car: 29.3,
    tier1Ratio: 27.0,
    ldr: 75.0,
    casaRatio: 82.0,
    // Growth (YoY)
    loanGrowth: 14.5,
    depositGrowth: 11.2,
    netIncomeGrowth: 12.8,
    niiGrowth: 9.5,
    beta: 0.89,
    bookValuePerShare: 1996,
    // Balance Sheet (IDR Trillions)
    totalAssets: 1520,
    totalLoans: 880,
    totalDeposits: 1150,
    netIncome: 56800,
    source: "BCA Annual Report 2024, Samuel Securities, Yahoo Finance"
  },
  {
    ticker: "BBRI",
    name: "Bank Rakyat Indonesia",
    figType: "BANK",
    category: "State-Owned Bank",
    isListed: true, // Publicly traded on IDX
    // Price Data (Dec 5, 2025) - Source: Yahoo Finance, Bareksa
    price: 3690,
    ytdReturn: -7.11,
    weekChange: 0.82,
    week52High: 5525,
    week52Low: 3550,
    marketCap: 595600,
    sharesOutstanding: 161384,
    // Profitability - Source: BRI Q3 2024 Presentation
    roe: 19.8,
    roa: 2.9,
    nim: 7.2,
    costToIncome: 38.2,
    pb: 1.85,
    pe: 9.4,
    dividendYield: 6.5,
    payoutRatio: 0.60,
    // Asset Quality (Q3 2024) - Source: BRI IR, PRNewswire
    nplRatio: 2.9,
    nplNet: 0.9,
    nplCoverage: 215,
    loanLossReserve: 6.3,
    lar: 11.2,
    creditCost: 3.39,
    // Capital & Liquidity (Q3 2024)
    car: 26.76,
    tier1Ratio: 23.8,
    ldr: 89.18,
    casaRatio: 62.5,
    loanGrowth: 9.8,
    depositGrowth: 7.5,
    netIncomeGrowth: 2.1,
    niiGrowth: 5.2,
    beta: 1.28,
    bookValuePerShare: 1995,
    totalAssets: 2180,
    totalLoans: 1420,
    totalDeposits: 1680,
    netIncome: 60500,
    source: "BRI Q3 2024 Presentation, PRNewswire, Yahoo Finance"
  },
  {
    ticker: "BMRI",
    name: "Bank Mandiri",
    figType: "BANK",
    category: "State-Owned Bank",
    isListed: true, // Publicly traded on IDX
    // Price Data (Dec 5, 2025) - Source: Yahoo Finance, Bisnis Indonesia
    price: 4800,
    ytdReturn: -11.84,
    weekChange: 3.23,
    week52High: 7275,
    week52Low: 4290,
    marketCap: 502000,
    sharesOutstanding: 104586,
    // Profitability - Source: BMRI Q3 2024, Samuel Securities
    roe: 22.5,
    roa: 3.1,
    nim: 5.4,
    costToIncome: 36.5,
    pb: 1.68,
    pe: 7.5,
    dividendYield: 8.0,
    payoutRatio: 0.60,
    // Asset Quality (Q3 2024)
    nplRatio: 1.2,
    nplNet: 0.4,
    nplCoverage: 320,
    loanLossReserve: 3.0,
    lar: 6.8,
    creditCost: 0.85,
    car: 22.5,
    tier1Ratio: 20.8,
    ldr: 88.5,
    casaRatio: 80.3,
    loanGrowth: 21.0,
    depositGrowth: 7.73,
    netIncomeGrowth: 7.6,
    niiGrowth: 8.5,
    beta: 1.15,
    bookValuePerShare: 2857,
    totalAssets: 1920,
    totalLoans: 1350,
    totalDeposits: 1699,
    netIncome: 56000,
    source: "BMRI Q3 2024, Samuel Securities, Indopremier"
  },
  {
    ticker: "BBNI",
    name: "Bank Negara Indonesia",
    figType: "BANK",
    category: "State-Owned Bank",
    isListed: true, // Publicly traded on IDX
    // Price Data (Dec 5, 2025) - Source: Google Finance, Yahoo Finance
    price: 4310,
    ytdReturn: 1.38,
    weekChange: 1.17,
    week52High: 5750,
    week52Low: 3850,
    marketCap: 160200,
    sharesOutstanding: 37168,
    // Profitability - Source: RHB Research, BBNI Q3 2024
    roe: 15.5,
    roa: 2.3,
    nim: 4.2,
    costToIncome: 42.8,
    pb: 1.08,
    pe: 6.9,
    dividendYield: 8.8,
    payoutRatio: 0.60,
    // Asset Quality (Q3 2024) - Source: RHB Research
    nplRatio: 2.0,
    nplNet: 0.7,
    nplCoverage: 284,
    loanLossReserve: 5.5,
    lar: 10.3,
    creditCost: 1.0,
    car: 21.2,
    tier1Ratio: 18.8,
    ldr: 92.5,
    casaRatio: 70.2,
    loanGrowth: 11.0,
    depositGrowth: 6.5,
    netIncomeGrowth: 4.2,
    niiGrowth: 5.0,
    beta: 1.22,
    bookValuePerShare: 3991,
    totalAssets: 1050,
    totalLoans: 780,
    totalDeposits: 850,
    netIncome: 23200,
    source: "BBNI Q3 2024, RHB Research, Google Finance"
  },
  {
    ticker: "BBTN",
    name: "Bank Tabungan Negara",
    figType: "BANK",
    category: "State-Owned Bank (Mortgage Focus)",
    isListed: true, // Publicly traded on IDX
    price: 1035,
    ytdReturn: -18.5,
    weekChange: -0.48,
    week52High: 1500,
    week52Low: 970,
    marketCap: 14500,
    sharesOutstanding: 14010,
    roe: 10.8,
    roa: 0.85,
    nim: 3.6,
    costToIncome: 58.5,
    pb: 0.52,
    pe: 4.8,
    dividendYield: 4.5,
    payoutRatio: 0.22,
    nplRatio: 3.9,
    nplNet: 1.8,
    nplCoverage: 118,
    loanLossReserve: 4.6,
    lar: 15.2,
    creditCost: 1.85,
    car: 17.5,
    tier1Ratio: 14.8,
    ldr: 105.2,
    casaRatio: 52.8,
    loanGrowth: 5.8,
    depositGrowth: 4.2,
    netIncomeGrowth: -6.5,
    niiGrowth: 2.0,
    beta: 1.42,
    bookValuePerShare: 1990,
    totalAssets: 440,
    totalLoans: 365,
    totalDeposits: 345,
    netIncome: 3000,
    source: "BTN Financial Reports, IDX"
  }
];

// ============================================================================
// LIFE INSURANCE - Top Players
// ============================================================================
// VERIFIED DATA ONLY - Sources with dates:
// - Bisnis Indonesia (Feb 23, 2025): "Daftar 5 Asuransi Jiwa dengan Aset dan Premi Terjumbo 2024"
// - OJK Statistics (December 2024 data)
//
// IMPORTANT: For private insurers, only OJK-disclosed data is included.
// Embedded Value, VNB, and other actuarial metrics are NOT publicly disclosed
// and would only be available in M&A due diligence or company disclosures.
// ============================================================================

export const INDONESIAN_LIFE_INSURANCE = [
  {
    ticker: "MANULIFE",
    name: "PT Asuransi Jiwa Manulife Indonesia",
    figType: "LIFE_INSURANCE",
    category: "Life Insurance (Foreign Subsidiary - Manulife Financial)",
    isListed: false,
    // VERIFIED: OJK Data December 2024 via Bisnis Indonesia (Feb 23, 2025)
    totalAssets: 62170, // IDR Billions - #1 by assets
    assetGrowth: 5.11, // YoY growth from 59.15T in 2023
    // Premium income not in top 6 by premium
    // NOT DISCLOSED: Equity, ROE, RBC ratio, Embedded Value, VNB
    dataAvailability: {
      assets: true,
      premiumIncome: false, // Not in top rankings
      equity: false,
      rbc: false,
      embeddedValue: false,
      vnb: false
    },
    source: "OJK December 2024 via Bisnis Indonesia (Feb 23, 2025)",
    sourceUrl: "https://finansial.bisnis.com/read/20250223/215/1841907/daftar-5-asuransi-jiwa-dengan-aset-dan-premi-terjumbo-2024"
  },
  {
    ticker: "PRUDENTIAL",
    name: "PT Prudential Life Assurance",
    figType: "LIFE_INSURANCE",
    category: "Life Insurance (Foreign Subsidiary - Prudential plc)",
    isListed: false,
    // VERIFIED: OJK Data December 2024 via Bisnis Indonesia (Feb 23, 2025)
    totalAssets: 57560, // IDR Billions - #3 by assets
    assetGrowth: -4.41, // YoY decline from 60.22T in 2023
    premiumIncome: 20750, // IDR Billions - #1 by premium
    premiumGrowth: 4.37, // YoY growth from 19.88T in 2023
    // NOT DISCLOSED: Equity, ROE, RBC ratio, Embedded Value, VNB
    dataAvailability: {
      assets: true,
      premiumIncome: true,
      equity: false,
      rbc: false,
      embeddedValue: false,
      vnb: false
    },
    source: "OJK December 2024 via Bisnis Indonesia (Feb 23, 2025)",
    sourceUrl: "https://finansial.bisnis.com/read/20250223/215/1841907/daftar-5-asuransi-jiwa-dengan-aset-dan-premi-terjumbo-2024"
  },
  {
    ticker: "AXA MANDIRI",
    name: "PT AXA Mandiri Financial Services",
    figType: "LIFE_INSURANCE",
    category: "Life Insurance (JV - Bank Mandiri 51%, AXA 49%)",
    isListed: false,
    // VERIFIED: OJK Data December 2024 via Bisnis Indonesia (Feb 23, 2025)
    totalAssets: 40740, // IDR Billions - #4 by assets
    assetGrowth: 1.98, // YoY growth
    premiumIncome: 11860, // IDR Billions - #4 by premium
    premiumGrowth: 1.37, // YoY growth
    // NOT DISCLOSED: Equity, ROE, RBC ratio, Embedded Value, VNB
    // Note: As bancassurance JV, detailed financials consolidated in Bank Mandiri
    dataAvailability: {
      assets: true,
      premiumIncome: true,
      equity: false,
      rbc: false,
      embeddedValue: false,
      vnb: false
    },
    source: "OJK December 2024 via Bisnis Indonesia (Feb 23, 2025)",
    sourceUrl: "https://finansial.bisnis.com/read/20250223/215/1841907/daftar-5-asuransi-jiwa-dengan-aset-dan-premi-terjumbo-2024"
  },
  {
    ticker: "AIA",
    name: "PT AIA Financial",
    figType: "LIFE_INSURANCE",
    category: "Life Insurance (Foreign Subsidiary - AIA Group)",
    isListed: false,
    // VERIFIED: OJK Data December 2024 via Bisnis Indonesia (Feb 23, 2025)
    totalAssets: 39650, // IDR Billions - #5 by assets
    assetGrowth: -5.10, // YoY decline from 41.78T in 2023
    premiumIncome: 9170, // IDR Billions - #5 by premium
    premiumGrowth: -7.12, // YoY decline
    dataAvailability: {
      assets: true,
      premiumIncome: true,
      equity: false,
      rbc: false,
      embeddedValue: false,
      vnb: false
    },
    source: "OJK December 2024 via Bisnis Indonesia (Feb 23, 2025)",
    sourceUrl: "https://finansial.bisnis.com/read/20250223/215/1841907/daftar-5-asuransi-jiwa-dengan-aset-dan-premi-terjumbo-2024"
  },
  {
    ticker: "ALLIANZ LIFE",
    name: "PT Asuransi Allianz Life Indonesia",
    figType: "LIFE_INSURANCE",
    category: "Life Insurance (Foreign Subsidiary - Allianz SE)",
    isListed: false,
    // VERIFIED: OJK Data December 2024 via Bisnis Indonesia (Feb 23, 2025)
    // Assets not in top 5
    premiumIncome: 16540, // IDR Billions - #2 by premium
    premiumGrowth: 11.72, // YoY growth - highest growth rate
    dataAvailability: {
      assets: false, // Not in top 5 by assets
      premiumIncome: true,
      equity: false,
      rbc: false,
      embeddedValue: false,
      vnb: false
    },
    source: "OJK December 2024 via Bisnis Indonesia (Feb 23, 2025)",
    sourceUrl: "https://finansial.bisnis.com/read/20250223/215/1841907/daftar-5-asuransi-jiwa-dengan-aset-dan-premi-terjumbo-2024"
  },
  {
    ticker: "BRI LIFE",
    name: "PT Asuransi BRI Life",
    figType: "LIFE_INSURANCE",
    category: "Life Insurance (Subsidiary of Bank BRI)",
    isListed: false,
    // VERIFIED: OJK Data December 2024 via Bisnis Indonesia (Feb 23, 2025)
    premiumIncome: 8860, // IDR Billions - #6 by premium
    premiumGrowth: 13.89, // YoY growth - strong growth
    dataAvailability: {
      assets: false,
      premiumIncome: true,
      equity: false,
      rbc: false,
      embeddedValue: false,
      vnb: false
    },
    source: "OJK December 2024 via Bisnis Indonesia (Feb 23, 2025)",
    sourceUrl: "https://finansial.bisnis.com/read/20250223/215/1841907/daftar-5-asuransi-jiwa-dengan-aset-dan-premi-terjumbo-2024"
  },
  {
    ticker: "PNLF",
    name: "Panin Financial Tbk",
    figType: "LIFE_INSURANCE",
    category: "Life Insurance (Listed on IDX)",
    isListed: true,
    // VERIFIED: IDX Filing, Yahoo Finance (Dec 2024)
    price: 228,
    ytdReturn: -15.2,
    marketCap: 5472,
    sharesOutstanding: 24000,
    // From IDX Annual Report - publicly disclosed
    totalAssets: 18500,
    totalEquity: 5800,
    roe: 8.2,
    pb: 0.32,
    pe: 3.9,
    dividendYield: 5.5,
    bookValuePerShare: 712,
    dataAvailability: {
      assets: true,
      premiumIncome: true,
      equity: true,
      rbc: true, // Listed companies must disclose
      embeddedValue: false, // Not disclosed in IDX filings
      vnb: false
    },
    source: "IDX Filing, Yahoo Finance (Dec 2024)",
    sourceUrl: "https://www.idx.co.id/en/listed-companies/company-profiles/PNLF"
  }
];

// ============================================================================
// P&C INSURANCE
// ============================================================================
// NOTE: Most P&C insurers in Indonesia are subsidiaries of conglomerates
// and do not separately disclose detailed financials.
// Only IDX-listed insurers have publicly available data.
// ============================================================================

export const INDONESIAN_PC_INSURANCE = [
  {
    ticker: "ABDA",
    name: "PT Asuransi Bina Dana Arta Tbk",
    figType: "PC_INSURANCE",
    category: "P&C Insurance (Listed on IDX)",
    isListed: true,
    // VERIFIED: IDX Filing, Yahoo Finance (Dec 2024)
    price: 6550,
    ytdReturn: -8.2,
    marketCap: 2130,
    sharesOutstanding: 325,
    roe: 11.8,
    pb: 0.88,
    pe: 7.5,
    dividendYield: 6.5,
    bookValuePerShare: 7443,
    dataAvailability: {
      assets: true,
      combinedRatio: true, // Listed companies disclose
      equity: true,
      rbc: true
    },
    source: "IDX Filing, Yahoo Finance (Dec 2024)",
    sourceUrl: "https://www.idx.co.id/en/listed-companies/company-profiles/ABDA"
  }
  // NOTE: Asuransi Astra, Asuransi Sinar Mas, etc. are subsidiaries
  // of conglomerates and don't separately disclose detailed financials
];

// ============================================================================
// CONSUMER FINANCE / MULTI-FINANCE
// Source: Q3 2024 / FY2024 Financial Statements (Indopremier, Yahoo Finance)
// ============================================================================

export const INDONESIAN_CONSUMER_FINANCE = [
  {
    ticker: "ADMF",
    name: "Adira Dinamika Multi Finance",
    figType: "CONSUMER_FINANCE",
    category: "Multi-Finance (Astra Group - Danamon)",
    isListed: true, // Publicly traded on IDX
    // Price Dec 2, 2025 - Source: Investing.com, Google Finance
    price: 8725,
    ytdReturn: -12.5,
    week52High: 10400,
    week52Low: 8400,
    marketCap: 8725,
    sharesOutstanding: 1000,
    roe: 20.2,
    roa: 5.8,
    pb: 1.72,
    pe: 8.5,
    dividendYield: 8.2,
    payoutRatio: 0.70,
    // Consumer Finance Metrics
    nim: 18.2,
    nplRatio: 1.3,
    gearingRatio: 4.2,
    yieldOnAssets: 21.5,
    costOfFunds: 8.2,
    loanGrowth: 10.5,
    // FY2024 - Source: Indopremier
    netIncome: 1410, // Down from 1.94T in 2023
    netIncomeGrowth: -27.3,
    beta: 1.22,
    bookValuePerShare: 5073,
    source: "ADMF FY2024, Indopremier, Investing.com"
  },
  {
    ticker: "BFIN",
    name: "BFI Finance Indonesia",
    figType: "CONSUMER_FINANCE",
    category: "Multi-Finance",
    isListed: true, // Publicly traded on IDX
    // Source: Google Finance, Simply Wall St
    price: 785,
    ytdReturn: -18.5,
    week52High: 1150,
    week52Low: 720,
    marketCap: 11775,
    sharesOutstanding: 15000,
    roe: 15.2,
    roa: 4.5,
    pb: 1.08,
    pe: 7.1,
    dividendYield: 6.8,
    payoutRatio: 0.48,
    nim: 15.8,
    nplRatio: 3.0,
    gearingRatio: 3.5,
    yieldOnAssets: 18.5,
    costOfFunds: 9.2,
    loanGrowth: 6.5,
    netIncome: 1650,
    netIncomeGrowth: -12.0,
    beta: 1.38,
    bookValuePerShare: 727,
    source: "BFIN Q3 2024, Simply Wall St, Google Finance"
  },
  {
    ticker: "WOMF",
    name: "Wahana Ottomitra Multiartha",
    figType: "CONSUMER_FINANCE",
    category: "Multi-Finance (Motorcycle)",
    isListed: true, // Publicly traded on IDX
    price: 162,
    ytdReturn: -22.0,
    marketCap: 1458,
    sharesOutstanding: 9000,
    roe: 11.5,
    roa: 3.2,
    pb: 0.78,
    pe: 6.8,
    dividendYield: 4.8,
    payoutRatio: 0.32,
    nim: 13.8,
    nplRatio: 3.8,
    gearingRatio: 5.5,
    yieldOnAssets: 16.2,
    costOfFunds: 9.8,
    loanGrowth: 3.5,
    netIncome: 215,
    netIncomeGrowth: -8.0,
    beta: 1.48,
    bookValuePerShare: 208,
    source: "WOMF Financial Reports, IDX"
  }
];

// ============================================================================
// ASSET MANAGEMENT
// ============================================================================
// VERIFIED DATA: OJK Mutual Fund Statistics via Bareksa (Oct-Nov 2025)
// Source: https://www.bareksa.com/berita/reksa-dana/2025-11-17/top-10-manajer-investasi-terbesar
//
// NOTE: For asset managers, only AUM is publicly disclosed by OJK.
// Profitability metrics (ROE, fee revenue) are NOT publicly disclosed
// for most unlisted asset managers.
// ============================================================================

export const INDONESIAN_ASSET_MANAGEMENT = [
  {
    ticker: "MAMI",
    name: "PT Manulife Aset Manajemen Indonesia",
    figType: "ASSET_MANAGEMENT",
    category: "Asset Management (Manulife Financial)",
    isListed: false,
    // VERIFIED: OJK Data via Bareksa (October 2025)
    aum: 57300, // IDR Billions - #1 by AUM
    marketShare: 9.0, // % of total industry AUM
    aumGrowthMoM: 8.0, // Monthly growth
    aumGrowthYTD: 32.0, // Year-to-date
    aumGrowthYoY: 29.0, // Year-over-year
    // NOT DISCLOSED: ROE, ROA, fee revenue, profitability
    dataAvailability: {
      aum: true,
      aumGrowth: true,
      marketShare: true,
      roe: false, // Not publicly disclosed
      feeRevenue: false,
      profitability: false
    },
    source: "OJK via Bareksa (Oct 2025)",
    sourceUrl: "https://www.bareksa.com/berita/reksa-dana/2025-11-17/top-10-manajer-investasi-terbesar-mami-trimegah-pimpin-lagi-aum-reksadana-oktober-2025"
  },
  {
    ticker: "TRIMEGAH AM",
    name: "PT Trimegah Asset Management",
    figType: "ASSET_MANAGEMENT",
    category: "Asset Management",
    isListed: false,
    // VERIFIED: OJK Data via Bareksa (October 2025)
    aum: 55800, // IDR Billions - #2 by AUM
    marketShare: 9.0,
    dataAvailability: {
      aum: true,
      aumGrowth: true,
      marketShare: true,
      roe: false,
      feeRevenue: false,
      profitability: false
    },
    source: "OJK via Bareksa (Oct 2025)",
    sourceUrl: "https://www.bareksa.com/berita/reksa-dana/2025-11-17/top-10-manajer-investasi-terbesar-mami-trimegah-pimpin-lagi-aum-reksadana-oktober-2025"
  },
  {
    ticker: "BAHANA TCW",
    name: "PT Bahana TCW Investment Management",
    figType: "ASSET_MANAGEMENT",
    category: "Asset Management (JV - Bahana BUMN & TCW Group)",
    isListed: false,
    // VERIFIED: OJK Data via Bareksa (October 2025)
    aum: 54490, // IDR Billions - #3 by AUM
    marketShare: 9.0,
    aumGrowthMoM: 10.0,
    aumGrowthYTD: 25.0,
    aumGrowthYoY: 24.0,
    // Note: Also #3 in Sharia mutual funds with Rp3.79T AUM
    shariahAum: 3790, // IDR Billions
    productCount: 24, // Sharia products
    dataAvailability: {
      aum: true,
      aumGrowth: true,
      marketShare: true,
      roe: false,
      feeRevenue: false,
      profitability: false
    },
    source: "OJK via Bareksa (Oct 2025)",
    sourceUrl: "https://www.bareksa.com/berita/reksa-dana/2025-11-17/top-10-manajer-investasi-terbesar-mami-trimegah-pimpin-lagi-aum-reksadana-oktober-2025"
  },
  {
    ticker: "MMI",
    name: "PT Mandiri Manajemen Investasi",
    figType: "ASSET_MANAGEMENT",
    category: "Asset Management (Bank Mandiri Group)",
    isListed: false,
    // VERIFIED: OJK Data via Bareksa (March 2024)
    aum: 24840, // IDR Billions - Position #9 in March 2024
    // Historical: Rp43.34T at end of 2023
    dataAvailability: {
      aum: true,
      aumGrowth: true,
      marketShare: true,
      roe: false,
      feeRevenue: false,
      profitability: false
    },
    source: "OJK via Bareksa (March 2024)",
    sourceUrl: "https://www.bareksa.com/berita/reksa-dana/2024-04-17/manulife-am-pimpin-top-manajer-investasi-dengan-kelolaan-terbesar-pada-maret-2024"
  }
];

// ============================================================================
// SECURITIES / INVESTMENT BANKS
// ============================================================================

export const INDONESIAN_SECURITIES = [
  {
    ticker: "PANS",
    name: "Panin Sekuritas",
    figType: "INVESTMENT_BANK",
    category: "Securities Firm",
    isListed: true, // Publicly traded on IDX
    price: 1780,
    ytdReturn: -8.5,
    marketCap: 2136,
    sharesOutstanding: 1200,
    roe: 11.8,
    roa: 5.2,
    pb: 0.82,
    pe: 6.9,
    dividendYield: 7.2,
    payoutRatio: 0.50,
    revenue: 820,
    tradingRevenue: 420,
    brokerageRevenue: 265,
    advisoryRevenue: 135,
    costToIncome: 62,
    beta: 1.52,
    bookValuePerShare: 2171,
    source: "IDX, PANS Financial Reports"
  },
  {
    ticker: "TRIM",
    name: "Trimegah Sekuritas",
    figType: "INVESTMENT_BANK",
    category: "Securities Firm",
    isListed: true, // Publicly traded on IDX
    price: 368,
    ytdReturn: -12.0,
    marketCap: 1472,
    sharesOutstanding: 4000,
    roe: 9.5,
    roa: 4.2,
    pb: 0.68,
    pe: 7.2,
    dividendYield: 5.8,
    payoutRatio: 0.42,
    revenue: 585,
    tradingRevenue: 295,
    brokerageRevenue: 185,
    advisoryRevenue: 105,
    costToIncome: 68,
    beta: 1.58,
    bookValuePerShare: 541,
    source: "IDX, TRIM Financial Reports"
  }
];

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export const ALL_INDONESIAN_FIG = [
  ...INDONESIAN_BANKS,
  ...INDONESIAN_LIFE_INSURANCE,
  ...INDONESIAN_PC_INSURANCE,
  ...INDONESIAN_CONSUMER_FINANCE,
  ...INDONESIAN_ASSET_MANAGEMENT,
  ...INDONESIAN_SECURITIES
];

// ============================================================================
// DATA SOURCES REFERENCE
// ============================================================================

export const DATA_SOURCES = {
  priceData: [
    "Yahoo Finance (finance.yahoo.com)",
    "Google Finance (google.com/finance)",
    "Investing.com",
    "Stockbit (stockbit.com)"
  ],
  bankFinancials: [
    "Bank Investor Relations (ir-bri.com, bca.co.id)",
    "Samuel Securities Research",
    "RHB TradesSmart Research",
    "Verdhana Research",
    "Indopremier (indopremier.com)"
  ],
  insuranceData: [
    "OJK (Otoritas Jasa Keuangan) - ojk.go.id",
    "Kontan (keuangan.kontan.co.id)",
    "IDN Times Business",
    "Company Annual Reports"
  ],
  newsAndAnalysis: [
    "Bisnis Indonesia (bisnis.com)",
    "Bareksa (bareksa.com)",
    "Bloomberg (bloomberg.com)",
    "PRNewswire"
  ]
};

export default {
  DATA_AS_OF,
  INDONESIAN_BANKS,
  INDONESIAN_LIFE_INSURANCE,
  INDONESIAN_PC_INSURANCE,
  INDONESIAN_CONSUMER_FINANCE,
  INDONESIAN_ASSET_MANAGEMENT,
  INDONESIAN_SECURITIES,
  ALL_INDONESIAN_FIG,
  DATA_SOURCES
};
