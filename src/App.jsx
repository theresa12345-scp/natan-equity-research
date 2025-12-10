// NATAN EQUITY RESEARCH PLATFORM
// DCF & Comps: CFA Level II, Damodaran (NYU), Rosenbaum & Pearl methodology

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Info, Building2, Search, Calculator,
  BarChart3, Newspaper, Target, AlertCircle, ExternalLink, Award, Activity,
  Filter, Download, TrendingUp as Growth, Shield, Zap, Globe,
  Settings, X, Save, Upload, RotateCcw, Check, RefreshCw, Clock,
  History, Play, Calendar, ChevronDown, Percent, ArrowUpRight, ArrowDownRight,
  Grid3X3, Star, Plus, Trash2, Briefcase, PieChart, Sun, Moon,
  Wifi, WifiOff, Radio, Loader2, FileSpreadsheet, FileText
} from 'lucide-react';

// Export utilities
import { downloadExcel, downloadCSV, EXPORT_COLUMNS } from './utils/exportUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';

// Financial Services (FIG) Valuation Component - Industry-Specific Methodologies
import FinancialServicesTab from './components/FinancialServicesTab';

// Interactive DCF Valuation Component - Enhanced with sliders, Monte Carlo, scenarios
import InteractiveDCF from './components/InteractiveDCF';

// Financial Statements Viewer - Income Statement, Balance Sheet, Cash Flow
import FinancialStatements from './components/FinancialStatements';

// Stock Chart Component - Historical price charts with technical indicators
import StockChart from './components/StockChart';

// Live Data Service - Real-time market data
import {
  fetchLiveQuote,
  fetchLiveQuotes,
  fetchMarketOverview,
  fetchStockNews,
  fetchChartData,
  fetchYTDReturn,
  fetchBatchYTDReturns,
  fetchJCIReturn,
  clearTickerCache,
  checkServiceAvailability,
  MARKET_SYMBOLS
} from './services/liveData';

// ============================================================================
// SECTOR-SPECIFIC VALUATION FRAMEWORKS
// Based on: Rosenbaum & Pearl "Investment Banking", McKinsey "Valuation",
// Damodaran "Investment Valuation", Goldman Sachs/Morgan Stanley research
// ============================================================================
const SECTOR_VALUATION_FRAMEWORKS = {
  // FINANCIALS - Banks, Insurance, Diversified Financials
  'Financials': {
    primaryMultiples: ['P/TBV', 'P/E', 'P/BV'],
    secondaryMultiples: ['ROE', 'NIM', 'NPL Ratio', 'CAR', 'LDR'],
    description: 'Banks valued on book value due to asset-heavy nature',
    keyDrivers: ['Net Interest Margin', 'Asset Quality', 'Capital Adequacy', 'Loan Growth'],
    benchmarkROE: 15,
    typicalPremium: { high: 2.0, median: 1.2, low: 0.8 }, // P/TBV ranges
    valuationNotes: 'Premium to book justified by ROE > Cost of Equity. NPL ratio critical for Indonesian banks.',
    industrySpecifics: {
      'Banks': { focus: ['NIM', 'NPL', 'CAR', 'CASA Ratio'], keyMultiple: 'P/TBV' },
      'Insurance': { focus: ['Combined Ratio', 'Investment Yield', 'Solvency'], keyMultiple: 'P/EV' },
      'Capital Markets': { focus: ['AUM', 'Trading Revenue', 'Fee Income'], keyMultiple: 'P/E' }
    }
  },

  // TECHNOLOGY - Software, Hardware, Semiconductors, Internet
  'Information Technology': {
    primaryMultiples: ['EV/Revenue', 'EV/Gross Profit', 'P/E'],
    secondaryMultiples: ['EV/EBITDA', 'Rule of 40', 'NRR', 'ARR Growth'],
    description: 'Growth companies valued on revenue multiples; profitable ones on earnings',
    keyDrivers: ['Revenue Growth', 'Gross Margin', 'R&D Efficiency', 'TAM Penetration'],
    benchmarkGrowth: 20,
    typicalPremium: { high: 15, median: 8, low: 3 }, // EV/Revenue ranges
    valuationNotes: 'SaaS companies use ARR multiples. Hardware uses EV/EBITDA. Semis use cycle-adjusted P/E.',
    industrySpecifics: {
      'Software': { focus: ['ARR', 'NRR', 'Rule of 40', 'Gross Margin'], keyMultiple: 'EV/ARR' },
      'Semiconductors': { focus: ['Gross Margin', 'Capex/Revenue', 'Design Wins'], keyMultiple: 'EV/EBITDA' },
      'IT Services': { focus: ['Utilization', 'Bill Rate', 'Attrition'], keyMultiple: 'EV/EBITDA' }
    }
  },

  // ENERGY - Oil & Gas, Integrated, Services
  'Energy': {
    primaryMultiples: ['EV/EBITDA', 'EV/DACF', 'EV/2P Reserves'],
    secondaryMultiples: ['EV/Production', 'NAV', 'FCF Yield', 'Dividend Yield'],
    description: 'Upstream valued on reserves; integrated on EBITDA; all sensitive to commodity prices',
    keyDrivers: ['Oil/Gas Prices', 'Production Volume', 'Reserve Replacement', 'Lifting Costs'],
    benchmarkFCFYield: 10,
    typicalPremium: { high: 8, median: 5, low: 3 }, // EV/EBITDA ranges
    valuationNotes: 'Use NAV for E&P. Strip pricing for forecasts. Breakeven analysis critical.',
    commodityExposure: {
      'Brent Crude': { sensitivity: 'high', direction: 'positive' },
      'Natural Gas': { sensitivity: 'medium', direction: 'positive' },
      'Refining Margins': { sensitivity: 'medium', direction: 'positive' }
    },
    industrySpecifics: {
      'E&P': { focus: ['2P Reserves', 'Production', 'Finding Costs', 'Lifting Costs'], keyMultiple: 'EV/2P' },
      'Integrated': { focus: ['Refining Margin', 'Downstream EBITDA', 'Capex'], keyMultiple: 'EV/EBITDA' },
      'Services': { focus: ['Backlog', 'Day Rates', 'Utilization'], keyMultiple: 'EV/EBITDA' }
    }
  },

  // MATERIALS - Mining, Chemicals, Construction Materials
  'Materials': {
    primaryMultiples: ['EV/EBITDA', 'P/NAV', 'EV/Resource'],
    secondaryMultiples: ['AISC', 'FCF Yield', 'Reserve Life', 'Cash Costs'],
    description: 'Miners valued on NAV and resources; chemicals on through-cycle EBITDA',
    keyDrivers: ['Commodity Prices', 'Production Costs', 'Grade/Recovery', 'Capex Discipline'],
    benchmarkFCFYield: 8,
    typicalPremium: { high: 1.2, median: 0.9, low: 0.6 }, // P/NAV ranges
    valuationNotes: 'Use long-term commodity price assumptions. AISC crucial for gold miners. ESG increasingly important.',
    commodityExposure: {
      'Gold': { sensitivity: 'high', direction: 'positive', companies: ['MDKA', 'ANTM'] },
      'Nickel': { sensitivity: 'high', direction: 'positive', companies: ['INCO', 'ANTM'] },
      'Coal': { sensitivity: 'high', direction: 'positive', companies: ['ADRO', 'ITMG', 'PTBA'] },
      'Copper': { sensitivity: 'high', direction: 'positive', companies: ['TINS'] },
      'CPO': { sensitivity: 'high', direction: 'positive', companies: ['AALI', 'LSIP', 'SIMP'] },
      'Steel': { sensitivity: 'medium', direction: 'positive', companies: ['ISSP'] }
    },
    industrySpecifics: {
      'Gold Mining': { focus: ['AISC', 'Reserves', 'Production', 'Grade'], keyMultiple: 'P/NAV' },
      'Coal Mining': { focus: ['ASP', 'Cash Cost', 'Stripping Ratio', 'Reserves'], keyMultiple: 'EV/EBITDA' },
      'Nickel': { focus: ['Cash Cost', 'Grade', 'Processing Route'], keyMultiple: 'EV/EBITDA' },
      'Chemicals': { focus: ['Capacity Utilization', 'Spread', 'Integration'], keyMultiple: 'EV/EBITDA' }
    }
  },

  // CONSUMER STAPLES - Food, Beverages, Household Products
  'Consumer Staples': {
    primaryMultiples: ['EV/EBITDA', 'P/E', 'EV/Sales'],
    secondaryMultiples: ['Dividend Yield', 'Gross Margin', 'Market Share'],
    description: 'Defensive sector valued on stable earnings and dividend yield',
    keyDrivers: ['Volume Growth', 'Pricing Power', 'Distribution', 'Brand Strength'],
    benchmarkGrowth: 8,
    typicalPremium: { high: 18, median: 14, low: 10 }, // EV/EBITDA ranges
    valuationNotes: 'Premium for market leaders. Indonesian consumption story drives growth multiples.',
    commodityExposure: {
      'CPO': { sensitivity: 'high', direction: 'negative', reason: 'Input cost for food producers' },
      'Sugar': { sensitivity: 'medium', direction: 'negative' },
      'Wheat': { sensitivity: 'medium', direction: 'negative' }
    },
    industrySpecifics: {
      'Food Products': { focus: ['Volume', 'ASP', 'Gross Margin', 'Distribution'], keyMultiple: 'EV/EBITDA' },
      'Beverages': { focus: ['Volume', 'Market Share', 'Route-to-Market'], keyMultiple: 'EV/EBITDA' },
      'Tobacco': { focus: ['Volume', 'Excise', 'SKU Mix'], keyMultiple: 'P/E' }
    }
  },

  // CONSUMER DISCRETIONARY - Retail, Autos, Media, Hotels
  'Consumer Discretionary': {
    primaryMultiples: ['EV/EBITDA', 'P/E', 'EV/Sales'],
    secondaryMultiples: ['Same-Store Sales', 'ROIC', 'Inventory Turns'],
    description: 'Cyclical sector tied to consumer confidence and spending',
    keyDrivers: ['Same-Store Sales', 'Store Expansion', 'E-commerce Growth', 'Margin Expansion'],
    benchmarkGrowth: 12,
    typicalPremium: { high: 14, median: 10, low: 6 }, // EV/EBITDA ranges
    valuationNotes: 'E-commerce players trade at premium. Brick-and-mortar discount. Watch inventory levels.',
    industrySpecifics: {
      'Retail': { focus: ['SSS', 'Gross Margin', 'Inventory Days', 'Store Count'], keyMultiple: 'EV/EBITDA' },
      'Autos': { focus: ['Volume', 'ASP', 'Market Share', 'EV Transition'], keyMultiple: 'P/E' },
      'Hotels': { focus: ['RevPAR', 'Occupancy', 'ADR', 'Room Count'], keyMultiple: 'EV/EBITDA' },
      'Media': { focus: ['Subscribers', 'ARPU', 'Content Spend', 'Ad Revenue'], keyMultiple: 'EV/Subscriber' }
    }
  },

  // INDUSTRIALS - Capital Goods, Transportation, Construction
  'Industrials': {
    primaryMultiples: ['EV/EBITDA', 'P/E', 'EV/Backlog'],
    secondaryMultiples: ['ROIC', 'Book-to-Bill', 'Backlog Coverage'],
    description: 'Cyclical sector with long-term contracts; backlog visibility key',
    keyDrivers: ['Order Intake', 'Backlog', 'Margin Expansion', 'Infrastructure Spending'],
    benchmarkROIC: 12,
    typicalPremium: { high: 12, median: 8, low: 5 }, // EV/EBITDA ranges
    valuationNotes: 'Construction companies benefit from government infrastructure. Watch working capital.',
    industrySpecifics: {
      'Construction': { focus: ['Backlog', 'Margin', 'Working Capital', 'Govt Contracts'], keyMultiple: 'P/E' },
      'Transportation': { focus: ['Load Factor', 'Yield', 'Fleet Age', 'ASK Growth'], keyMultiple: 'EV/EBITDA' },
      'Capital Goods': { focus: ['Book-to-Bill', 'Backlog', 'Service Revenue'], keyMultiple: 'EV/EBITDA' }
    }
  },

  // HEALTHCARE - Pharma, Hospitals, Distributors
  'Health Care': {
    primaryMultiples: ['EV/EBITDA', 'P/E', 'EV/Revenue'],
    secondaryMultiples: ['Pipeline Value', 'R&D/Revenue', 'Patent Cliff'],
    description: 'Defensive growth sector; pharma valued on pipeline, hospitals on bed occupancy',
    keyDrivers: ['Patient Volume', 'Reimbursement', 'Pipeline', 'Regulatory'],
    benchmarkGrowth: 10,
    typicalPremium: { high: 16, median: 12, low: 8 }, // EV/EBITDA ranges
    valuationNotes: 'Indonesian hospitals benefit from JKN coverage expansion. Watch BPJS reimbursement rates.',
    industrySpecifics: {
      'Hospitals': { focus: ['Bed Occupancy', 'ARPOB', 'Bed Count', 'Outpatient Mix'], keyMultiple: 'EV/EBITDA' },
      'Pharma': { focus: ['Pipeline', 'Patent Expiry', 'Generic Mix', 'R&D'], keyMultiple: 'P/E' },
      'Distributors': { focus: ['Market Share', 'Margin', 'Working Capital'], keyMultiple: 'EV/EBITDA' }
    }
  },

  // REAL ESTATE - REITs, Developers
  'Real Estate': {
    primaryMultiples: ['P/NAV', 'P/FFO', 'Cap Rate'],
    secondaryMultiples: ['Dividend Yield', 'Occupancy', 'WALE', 'Rental Reversion'],
    description: 'REITs valued on FFO and NAV; developers on NAV and presales',
    keyDrivers: ['Interest Rates', 'Cap Rates', 'Occupancy', 'Rental Growth'],
    benchmarkDivYield: 5,
    typicalPremium: { high: 1.1, median: 0.9, low: 0.7 }, // P/NAV ranges
    valuationNotes: 'Indonesia lacks REIT structure; developers valued on NAV. Watch presales and inventory.',
    industrySpecifics: {
      'REITs': { focus: ['FFO', 'AFFO', 'Cap Rate', 'WALE', 'Occupancy'], keyMultiple: 'P/FFO' },
      'Developers': { focus: ['Presales', 'Land Bank', 'Inventory', 'ASP'], keyMultiple: 'P/NAV' },
      'Industrial': { focus: ['Land Sales', 'Occupancy', 'Tenant Mix'], keyMultiple: 'P/NAV' }
    }
  },

  // COMMUNICATION SERVICES - Telecom, Media, Internet
  'Communication Services': {
    primaryMultiples: ['EV/EBITDA', 'EV/Subscriber', 'P/E'],
    secondaryMultiples: ['ARPU', 'Churn', 'Capex/Revenue', 'Spectrum Value'],
    description: 'Telecom valued on EBITDA and subscribers; internet on users/engagement',
    keyDrivers: ['Subscriber Growth', 'ARPU', 'Data Traffic', 'Spectrum Position'],
    benchmarkDivYield: 4,
    typicalPremium: { high: 8, median: 6, low: 4 }, // EV/EBITDA ranges
    valuationNotes: 'Indonesian telcos face intense competition. Data ARPU growth key. Tower assets valuable.',
    industrySpecifics: {
      'Telecom': { focus: ['Subscribers', 'ARPU', 'Churn', 'Data Revenue'], keyMultiple: 'EV/EBITDA' },
      'Towers': { focus: ['Tenancy Ratio', 'Tower Count', 'Lease Escalation'], keyMultiple: 'EV/EBITDA' },
      'Internet': { focus: ['MAU', 'ARPU', 'Take Rate', 'GMV'], keyMultiple: 'EV/MAU' }
    }
  },

  // UTILITIES - Power, Gas, Water
  'Utilities': {
    primaryMultiples: ['EV/EBITDA', 'P/E', 'Dividend Yield'],
    secondaryMultiples: ['RAB', 'Allowed ROE', 'Capacity Factor'],
    description: 'Regulated utilities valued on rate base; IPPs on capacity and PPA terms',
    keyDrivers: ['Regulatory Environment', 'Tariff', 'Capacity Additions', 'Fuel Costs'],
    benchmarkDivYield: 4,
    typicalPremium: { high: 10, median: 7, low: 5 }, // EV/EBITDA ranges
    valuationNotes: 'Indonesian power sector benefits from demand growth. PLN offtake crucial. Renewables at premium.',
    commodityExposure: {
      'Coal': { sensitivity: 'high', direction: 'negative', reason: 'Fuel cost for thermal plants' },
      'Natural Gas': { sensitivity: 'medium', direction: 'negative' }
    },
    industrySpecifics: {
      'IPPs': { focus: ['Capacity', 'PPA Terms', 'Fuel Cost', 'Availability'], keyMultiple: 'EV/EBITDA' },
      'Regulated Utilities': { focus: ['RAB', 'Allowed ROE', 'Capex Plan'], keyMultiple: 'P/E' },
      'Renewables': { focus: ['Capacity', 'PPA Price', 'IRR', 'PLF'], keyMultiple: 'EV/MW' }
    }
  }
};

// ============================================================================
// COMMODITY PRICE SENSITIVITY FACTORS
// Based on: Bloomberg Intelligence, Wood Mackenzie, industry research
// ============================================================================
const COMMODITY_FACTORS = {
  // Energy Commodities
  'Brent Crude': {
    currentPrice: 73.50,
    unit: 'USD/bbl',
    ytdChange: -8.5,
    consensusForecast: { '2024': 75, '2025': 72, 'long_term': 65 },
    keyDrivers: ['OPEC+ production', 'Global demand', 'US shale', 'Geopolitics'],
    affectedSectors: ['Energy', 'Utilities', 'Industrials'],
    indonesiaRelevance: 'high',
    impactedCompanies: {
      positive: ['MEDC', 'ELSA'],
      negative: ['Utilities', 'Airlines']
    }
  },
  'Newcastle Coal': {
    currentPrice: 130,
    unit: 'USD/ton',
    ytdChange: -25,
    consensusForecast: { '2024': 140, '2025': 120, 'long_term': 100 },
    keyDrivers: ['China imports', 'India demand', 'Indonesian supply', 'Energy transition'],
    affectedSectors: ['Materials', 'Utilities'],
    indonesiaRelevance: 'critical',
    impactedCompanies: {
      positive: ['ADRO', 'ITMG', 'PTBA', 'BUMI', 'HRUM', 'INDY'],
      negative: ['PLN', 'JSMR']
    }
  },
  'Thermal Coal ICI4': {
    currentPrice: 52,
    unit: 'USD/ton',
    ytdChange: -30,
    consensusForecast: { '2024': 55, '2025': 50, 'long_term': 45 },
    keyDrivers: ['Domestic Indonesian', 'DMO policy', 'Power demand'],
    affectedSectors: ['Materials'],
    indonesiaRelevance: 'critical'
  },
  'Natural Gas (Henry Hub)': {
    currentPrice: 2.80,
    unit: 'USD/MMBtu',
    ytdChange: -15,
    consensusForecast: { '2024': 3.00, '2025': 3.50, 'long_term': 4.00 },
    keyDrivers: ['US production', 'LNG exports', 'Weather', 'Storage'],
    affectedSectors: ['Energy', 'Utilities'],
    indonesiaRelevance: 'medium'
  },

  // Metals & Mining
  'Gold': {
    currentPrice: 2050,
    unit: 'USD/oz',
    ytdChange: 12,
    consensusForecast: { '2024': 2100, '2025': 2000, 'long_term': 1800 },
    keyDrivers: ['Real rates', 'USD strength', 'Central bank buying', 'Geopolitics'],
    affectedSectors: ['Materials'],
    indonesiaRelevance: 'high',
    impactedCompanies: {
      positive: ['MDKA', 'ANTM', 'UNTR']
    }
  },
  'Nickel (LME)': {
    currentPrice: 16500,
    unit: 'USD/ton',
    ytdChange: -40,
    consensusForecast: { '2024': 17000, '2025': 18000, 'long_term': 20000 },
    keyDrivers: ['EV demand', 'Indonesian supply', 'China processing', 'Battery chemistry'],
    affectedSectors: ['Materials'],
    indonesiaRelevance: 'critical',
    impactedCompanies: {
      positive: ['INCO', 'ANTM', 'NCKL', 'MBMA']
    }
  },
  'Copper (LME)': {
    currentPrice: 8200,
    unit: 'USD/ton',
    ytdChange: -5,
    consensusForecast: { '2024': 8500, '2025': 9000, 'long_term': 10000 },
    keyDrivers: ['China demand', 'Green transition', 'Mine supply', 'Inventory'],
    affectedSectors: ['Materials'],
    indonesiaRelevance: 'medium',
    impactedCompanies: {
      positive: ['TINS']
    }
  },
  'Tin (LME)': {
    currentPrice: 25000,
    unit: 'USD/ton',
    ytdChange: 5,
    consensusForecast: { '2024': 26000, '2025': 28000, 'long_term': 30000 },
    keyDrivers: ['Electronics demand', 'Indonesian supply', 'Myanmar disruption'],
    affectedSectors: ['Materials'],
    indonesiaRelevance: 'high',
    impactedCompanies: {
      positive: ['TINS']
    }
  },
  'Bauxite/Alumina': {
    currentPrice: 380,
    unit: 'USD/ton',
    ytdChange: 10,
    consensusForecast: { '2024': 400, '2025': 420, 'long_term': 400 },
    keyDrivers: ['Indonesia export ban', 'China refining', 'Guinea supply'],
    affectedSectors: ['Materials'],
    indonesiaRelevance: 'high',
    impactedCompanies: {
      positive: ['ANTM', 'INALUM']
    }
  },

  // Agricultural Commodities
  'CPO (Crude Palm Oil)': {
    currentPrice: 3800,
    unit: 'MYR/ton',
    ytdChange: -5,
    consensusForecast: { '2024': 4000, '2025': 3800, 'long_term': 3500 },
    keyDrivers: ['Biodiesel mandate', 'El Niño', 'Export levy', 'Soybean prices'],
    affectedSectors: ['Consumer Staples', 'Materials'],
    indonesiaRelevance: 'critical',
    impactedCompanies: {
      positive: ['AALI', 'LSIP', 'SIMP', 'DSNG', 'TBLA'],
      negative: ['ICBP', 'INDF', 'MYOR'] // Food producers (input cost)
    }
  },
  'Rubber': {
    currentPrice: 1.50,
    unit: 'USD/kg',
    ytdChange: -10,
    consensusForecast: { '2024': 1.60, '2025': 1.70, 'long_term': 1.80 },
    keyDrivers: ['Auto production', 'Thai/Indo supply', 'Weather'],
    affectedSectors: ['Materials'],
    indonesiaRelevance: 'medium'
  },
  'Sugar': {
    currentPrice: 22,
    unit: 'USc/lb',
    ytdChange: 15,
    consensusForecast: { '2024': 20, '2025': 18, 'long_term': 16 },
    keyDrivers: ['Brazil production', 'El Niño', 'Ethanol parity'],
    affectedSectors: ['Consumer Staples'],
    indonesiaRelevance: 'medium'
  },

  // Currencies (Impact on USD earners/payers)
  'USD/IDR': {
    currentPrice: 15800,
    unit: 'IDR',
    ytdChange: 5,
    keyDrivers: ['Fed policy', 'Current account', 'Foreign flows', 'BI policy'],
    indonesiaRelevance: 'critical',
    impactNotes: 'Strong USD benefits exporters (coal, palm, nickel), hurts importers'
  }
};

// ============================================================================
// PREMIUM/DISCOUNT FACTORS FOR RELATIVE VALUATION
// Based on: Goldman Sachs, Morgan Stanley, JPMorgan equity research frameworks
// ============================================================================
const PREMIUM_DISCOUNT_FACTORS = {
  // Quantitative factors (measurable)
  quantitative: [
    { factor: 'ROE vs Peers', weight: 20, description: 'Higher ROE justifies premium' },
    { factor: 'Growth Rate', weight: 20, description: 'Faster growth = higher multiple' },
    { factor: 'Margin Profile', weight: 15, description: 'Superior margins support premium' },
    { factor: 'Balance Sheet', weight: 10, description: 'Lower leverage = lower risk = premium' },
    { factor: 'FCF Conversion', weight: 10, description: 'Higher FCF conversion = quality premium' },
    { factor: 'Size/Liquidity', weight: 10, description: 'Large caps trade at premium for liquidity' }
  ],
  // Qualitative factors (judgment-based)
  qualitative: [
    { factor: 'Market Position', weight: 5, description: '#1/#2 market share = premium' },
    { factor: 'Management Quality', weight: 5, description: 'Proven track record = premium' },
    { factor: 'ESG Profile', weight: 3, description: 'Strong ESG increasingly commands premium' },
    { factor: 'Governance', weight: 2, description: 'Good governance reduces risk premium' }
  ]
};

// ============================================================================
// FACTOR WEIGHTS CONFIGURATION - Customizable via Settings Panel
// ============================================================================
const DEFAULT_WEIGHTS = {
  technical: 20,       // Price momentum, Alpha, Beta
  valuation: 15,       // P/E, P/B, EV/EBITDA
  quality: 15,         // ROE, FCF Conversion, Margins
  sentiment: 15,       // Market sentiment proxy
  growth: 10,          // Revenue, EPS, Net Income growth
  financial_health: 10,// D/E ratio, Current/Quick ratios
  liquidity: 10,       // Market cap tier, trading activity
  analyst_coverage: 5  // Coverage breadth proxy
};

// Built-in presets for different investment strategies
const WEIGHT_PRESETS = {
  balanced: {
    name: 'Balanced (Default)',
    description: 'Standard 8-factor weights for balanced analysis',
    weights: { ...DEFAULT_WEIGHTS }
  },
  momentum: {
    name: 'Momentum Focus',
    description: 'Higher weight on Technical & Sentiment for trend-following',
    weights: {
      technical: 30,
      valuation: 10,
      quality: 10,
      sentiment: 20,
      growth: 10,
      financial_health: 5,
      liquidity: 10,
      analyst_coverage: 5
    }
  },
  value: {
    name: 'Value Investor',
    description: 'Graham & Dodd style - higher weight on Valuation & Quality',
    weights: {
      technical: 10,
      valuation: 25,
      quality: 25,
      sentiment: 5,
      growth: 10,
      financial_health: 15,
      liquidity: 5,
      analyst_coverage: 5
    }
  },
  growth_investor: {
    name: 'Growth Investor',
    description: 'Focus on Growth & Quality for high-growth companies',
    weights: {
      technical: 15,
      valuation: 10,
      quality: 20,
      sentiment: 10,
      growth: 25,
      financial_health: 10,
      liquidity: 5,
      analyst_coverage: 5
    }
  },
  indonesia_em: {
    name: 'Indonesia/EM Focus',
    description: 'Optimized for emerging markets where sentiment drives 80%+ of returns',
    weights: {
      technical: 25,
      valuation: 10,
      quality: 10,
      sentiment: 25,
      growth: 10,
      financial_health: 5,
      liquidity: 10,
      analyst_coverage: 5
    }
  }
};

// Import institutional-grade valuation models
import {
  calculateDCF as calculateDCFNew,
  calculateComparables as calculateComparablesNew,
  calculateWACC as calculateWACCNew,
  calculateSensitivityAnalysis,
  DCF_ASSUMPTIONS,
  INDUSTRY_PRESETS,
  getIndustryPreset
} from './valuation.js';

// ============================================================================
// GLOBAL MACRO DATA - Countries Influencing Indonesia's Economy
// Sources: BPS, Bank Indonesia, Federal Reserve, PBOC, BOJ, Bloomberg, Reuters
// Key Correlations: China (23% exports), US (10% exports), Japan (FDI), Commodities
// ============================================================================
const GLOBAL_MACRO_DATA = {
  lastUpdated: "2025-12-01T08:00:00Z",

  // INDONESIA - Primary Focus
  indonesia: {
    flag: "🇮🇩",
    name: "Indonesia",
    gdpSize: "$1.4T",
    gdpGrowth: 5.12,
    gdpGrowthQoQ: 0.61,
    annualGDP: 5.15,
    inflation: 2.23,
    inflationTarget: "1.5-3.5%",
    centralBankRate: 5.75,
    centralBankName: "BI Rate",
    rateChange: -0.25,
    stockIndex: 7245.50,
    stockIndexName: "JCI",
    stockIndexDate: "2025-12-01",
    stockIndexChange: 0.0,
    stockYTD: 2.34,
    currency: 15850,
    currencyPair: "USD/IDR",
    currencyTrend: "stronger",
    bond10Y: 6.65,
    pmi: 52.3,
    reserves: 151.8,
    debtToGDP: 38.2,
    tradeBalance: 10.52,
    unemploymentRate: 4.8,
  },

  // UNITED STATES - Global Reserve Currency, Fed Policy Affects EM Capital Flows
  unitedStates: {
    flag: "🇺🇸",
    name: "United States",
    gdpSize: "$28.8T",
    gdpGrowth: 2.8,
    gdpRevised: 2.9,
    inflation: 2.6,
    inflationCore: 2.8,
    inflationTarget: "2.0%",
    centralBankRate: 4.50,
    centralBankName: "Fed Funds",
    rateChange: -0.75,
    stockIndex: 6032.38,
    stockIndexName: "S&P 500",
    stockIndexDate: "2025-12-01",
    stockIndexChange: 0.0,
    stockYTD: 26.5,
    nasdaq: 19280.79,
    nasdaqYTD: 28.0,
    dow: 44910.65,
    dowYTD: 19.2,
    bond10Y: 4.18,
    bond2Y: 4.15,
    yieldCurve: 0.03,
    pmi: 49.7,
    unemployment: 4.2,
    dxy: 105.74,
    vix: 13.51,
    consumerConfidence: 111.7,
  },

  // CHINA - Indonesia's #1 Trading Partner (23% of exports), Commodity Demand Driver
  china: {
    flag: "🇨🇳",
    name: "China",
    gdpSize: "$18.5T",
    gdpGrowth: 4.6,
    gdpTarget: "5.0%",
    inflation: 0.3,
    ppi: -2.8,
    centralBankRate: 3.10,
    centralBankName: "LPR 1Y",
    rateChange: -0.25,
    stockIndex: 3326.46,
    stockIndexName: "Shanghai",
    stockIndexDate: "2025-12-01",
    stockIndexChange: 0.0,
    stockYTD: 14.8,
    hsi: 19424.58,
    hsiDate: "2025-12-01",
    hsiChange: 0.0,
    hsiYTD: 13.2,
    currency: 7.24,
    currencyPair: "USD/CNY",
    pmi: 50.3,
    caixinPmi: 51.5,
    tradeBalance: 95.7,
    retailSales: 4.8,
    industrialProduction: 5.3,
    fixedAssetInvestment: 3.4,
  },

  // JAPAN - Major FDI Source, Automotive Sector, Yen Carry Trade Affects EM
  japan: {
    flag: "🇯🇵",
    name: "Japan",
    gdpSize: "$4.2T",
    gdpGrowth: 0.9,
    inflation: 2.3,
    centralBankRate: 0.25,
    centralBankName: "BOJ Rate",
    rateChange: 0.15,
    stockIndex: 38208.03,
    stockIndexName: "Nikkei 225",
    stockIndexDate: "2025-12-01",
    stockIndexChange: 0.0,
    stockYTD: 15.3,
    currency: 149.72,
    currencyPair: "USD/JPY",
    bond10Y: 1.07,
    pmi: 49.0,
    tankan: 14,
  },

  // SINGAPORE - Regional Financial Hub, ASEAN Gateway, Major FDI Source
  singapore: {
    flag: "🇸🇬",
    name: "Singapore",
    gdpSize: "$500B",
    gdpGrowth: 4.1,
    inflation: 2.0,
    stockIndex: 3745.04,
    stockIndexName: "STI",
    stockIndexDate: "2025-12-01",
    stockIndexChange: 0.0,
    stockYTD: 16.8,
    currency: 1.34,
    currencyPair: "USD/SGD",
  },

  // INDIA - Growing Trade Partner, Palm Oil Importer
  india: {
    flag: "🇮🇳",
    name: "India",
    gdpSize: "$3.9T",
    gdpGrowth: 5.4,
    inflation: 6.2,
    centralBankRate: 6.50,
    centralBankName: "Repo Rate",
    stockIndex: 79802.79,
    stockIndexName: "Sensex",
    stockIndexDate: "2025-12-01",
    stockIndexChange: 0.0,
    stockYTD: 11.2,
    currency: 84.38,
    currencyPair: "USD/INR",
    pmi: 56.5,
  },

  // COMMODITIES - Critical for Indonesia (Coal, Palm Oil, Nickel Exporter)
  commodities: {
    // Oil - Indonesia is net importer
    brentCrude: 72.83,
    brentChange: -3.2,      // YTD change %
    brentDaily: -0.85,      // Daily change %
    wti: 68.72,
    wtiDaily: -0.92,

    // Coal - Indonesia is world's largest exporter
    newcastleCoal: 138.50,
    coalChange: -8.5,       // YTD
    coalDaily: +1.25,       // Daily

    // Palm Oil - Indonesia is world's largest producer
    palmOil: 4180,
    palmOilChange: 12.3,    // YTD
    palmOilDaily: +0.65,    // Daily

    // Nickel - Indonesia is major producer (EV batteries)
    nickel: 15420,
    nickelChange: -15.8,    // YTD
    nickelDaily: -1.15,     // Daily

    // Gold - Safe haven, Indonesia producer
    gold: 2650.30,
    goldChange: 28.5,       // YTD
    goldDaily: +0.42,       // Daily

    // Copper - Industrial bellwether
    copper: 9050,
    copperChange: 8.2,      // YTD
    copperDaily: -0.38,     // Daily

    // Natural Gas
    natGas: 3.12,
    natGasChange: -22.4,    // YTD
    natGasDaily: +2.15,     // Daily

    // Silver
    silver: 30.85,
    silverChange: 32.1,     // YTD
    silverDaily: +0.55,     // Daily

    // Iron Ore
    ironOre: 108.50,
    ironOreChange: -12.3,   // YTD
    ironOreDaily: +0.82,    // Daily

    // Tin (Indonesia major producer)
    tin: 28950,
    tinChange: 5.2,         // YTD
    tinDaily: -0.45,        // Daily
  },

  // GLOBAL BONDS - Yield movements affect EM capital flows
  bonds: {
    // US Treasuries
    us2Y: 4.15,
    us2YDaily: +0.02,
    us10Y: 4.18,
    us10YDaily: -0.03,
    us30Y: 4.35,
    us30YDaily: -0.02,
    usYieldCurve: 0.03,     // 10Y - 2Y spread

    // Indonesia Government Bonds
    indo10Y: 6.65,
    indo10YDaily: +0.01,
    indo5Y: 6.45,
    indo5YDaily: -0.02,

    // Other EM Bonds
    china10Y: 2.05,
    china10YDaily: -0.01,
    japan10Y: 1.07,
    japan10YDaily: +0.02,
    germany10Y: 2.15,
    germany10YDaily: -0.03,

    // Credit Spreads
    embiSpread: 285,        // EM Bond Index spread over UST
    embiDaily: -2,
    highYieldSpread: 285,   // US HY spread
    highYieldDaily: +3,
  },

  // GLOBAL RISK INDICATORS
  risk: {
    vix: 13.51,
    vixDaily: -0.35,
    vixLevel: "Low",
    dxy: 105.74,
    dxyDaily: +0.28,
    dxyTrend: "Strong",
    embiSpread: 285,
    embiTrend: "Stable",
    goldSafeHaven: 2650.30,
    fearGreedIndex: 72,     // CNN Fear & Greed
    fearGreedLevel: "Greed",
  }
};

// Keep backward compatibility with existing code
const INDONESIA_MACRO = {
  ...GLOBAL_MACRO_DATA.indonesia,
  asOf: "December 2025",
  biRate: GLOBAL_MACRO_DATA.indonesia.centralBankRate,
  jciIndex: GLOBAL_MACRO_DATA.indonesia.stockIndex,
  jciYTD: GLOBAL_MACRO_DATA.indonesia.stockYTD,
  usdIdr: GLOBAL_MACRO_DATA.indonesia.currency,
  govBond10Y: GLOBAL_MACRO_DATA.indonesia.bond10Y,
  brentCrude: GLOBAL_MACRO_DATA.commodities.brentCrude,
  spx: GLOBAL_MACRO_DATA.unitedStates.stockIndex,
};

// ============================================================================
// DCF & COMPS VALUATION MODELS
// Now using institutional-grade models from valuation.js
// Based on: CFA Level II, Damodaran (NYU Stern), Rosenbaum & Pearl (IB Valuation)
//
// Key Improvements over previous implementation:
// 1. WACC: Added country risk premium for Indonesia (+2.5%)
// 2. WACC: Cost of debt derived from synthetic credit rating (Damodaran method)
// 3. FCF: Multiple estimation methods (EBITDA-based, ROE-based, sector yield)
// 4. DCF: H-model growth decay (faster convergence to terminal)
// 5. DCF: Terminal value sanity check (TV% of EV)
// 6. Comps: Added EV/EBITDA multiple (most important for M&A)
// 7. Comps: Sector-specific weighting (Banks: P/B, Tech: EV/EBITDA)
// 8. Comps: Expanded peer selection (up to 8 peers, cross-region if needed)
// ============================================================================

// ============================================================================
// NUMBER FORMATTING UTILITIES - Professional Display
// ============================================================================

/**
 * Format large numbers with appropriate suffix (K, M, B, T)
 * @param {number} num - The number to format
 * @param {string} currency - 'USD' or 'IDR'
 * @param {number} decimals - Number of decimal places (default 1)
 * @returns {string} Formatted number string
 */
const formatLargeNumber = (num, currency = 'USD', decimals = 1) => {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  const prefix = currency === 'IDR' ? 'Rp' : '$';

  // For IDR (Indonesian Rupiah) - typically in trillions
  if (currency === 'IDR') {
    if (absNum >= 1e15) return `${sign}${prefix}${(absNum / 1e15).toFixed(decimals)}Q`; // Quadrillion
    if (absNum >= 1e12) return `${sign}${prefix}${(absNum / 1e12).toFixed(decimals)}T`; // Trillion
    if (absNum >= 1e9) return `${sign}${prefix}${(absNum / 1e9).toFixed(decimals)}B`;  // Billion
    if (absNum >= 1e6) return `${sign}${prefix}${(absNum / 1e6).toFixed(decimals)}M`;  // Million
    if (absNum >= 1e3) return `${sign}${prefix}${(absNum / 1e3).toFixed(decimals)}K`;  // Thousand
    return `${sign}${prefix}${absNum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  // For USD - also handle very large numbers (Indonesian data shown in USD context)
  if (absNum >= 1e15) return `${sign}${prefix}${(absNum / 1e15).toFixed(decimals)}Q`;
  if (absNum >= 1e12) return `${sign}${prefix}${(absNum / 1e12).toFixed(decimals)}T`;
  if (absNum >= 1e9) return `${sign}${prefix}${(absNum / 1e9).toFixed(decimals)}B`;
  if (absNum >= 1e6) return `${sign}${prefix}${(absNum / 1e6).toFixed(decimals)}M`;
  if (absNum >= 1e3) return `${sign}${prefix}${(absNum / 1e3).toFixed(decimals)}K`;
  return `${sign}${prefix}${absNum.toFixed(decimals)}`;
};

/**
 * Format market cap with appropriate regional handling
 * @param {number} marketCap - Market cap value
 * @param {string} region - 'Indonesia' or 'US'
 * @returns {string} Formatted market cap
 */
const formatMarketCap = (marketCap, region) => {
  if (!marketCap) return 'N/A';
  // Default to IDR for Indonesian market (most data)
  const currency = region === 'US' ? 'USD' : 'IDR';
  return formatLargeNumber(marketCap, currency, 1);
};

/**
 * Format price with currency symbol
 * @param {number} price - Price value
 * @param {string} region - 'Indonesia' or 'US'
 * @returns {string} Formatted price
 */
const formatPrice = (price, region) => {
  if (price === null || price === undefined || isNaN(price)) return 'N/A';
  // Default to IDR for Indonesian market (most data)
  const prefix = region === 'US' ? '$' : 'Rp';
  if (price >= 1000) {
    return `${prefix}${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  return `${prefix}${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format DCF/Comps values - convert to readable format
 * These values are in local currency units
 * @param {number} value - The value to format
 * @param {string} region - 'Indonesia' or 'US'
 * @returns {string} Formatted value
 */
const formatValuationNumber = (value, region) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  // Default to IDR for Indonesian market (most data)
  const currency = region === 'US' ? 'USD' : 'IDR';
  return formatLargeNumber(value, currency, 1);
};

/**
 * Format percentage with sign
 * @param {number} pct - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
const formatPercent = (pct, decimals = 1) => {
  if (pct === null || pct === undefined || isNaN(pct)) return 'N/A';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(decimals)}%`;
};

/**
 * Format ratio (like P/E, P/B)
 * @param {number} ratio - Ratio value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted ratio with 'x' suffix
 */
const formatRatio = (ratio, decimals = 1) => {
  if (ratio === null || ratio === undefined || isNaN(ratio)) return 'N/A';
  // Handle unreasonable ratios (data quality issues)
  if (ratio > 10000) return 'N/A';
  if (ratio >= 1000) return `${(ratio / 1000).toFixed(1)}Kx`;
  if (ratio >= 100) return `${ratio.toFixed(0)}x`;
  return `${ratio.toFixed(decimals)}x`;
};

// ============================================================================
// ADVANCED MULTI-FACTOR SCORING - Institutional Grade
// Based on: CFA Institute, Damodaran, and Indonesian Market Dynamics
// Key insight: 80-90% of Indonesian stock movement is sentiment/technical driven
// ============================================================================

const calculateNATANScore = (stock, sector, macroData) => {
  let scores = {
    valuation: 0,        // 15 points - fundamentals less dominant in EM
    quality: 0,          // 15 points - business quality
    growth: 0,           // 10 points - earnings trajectory
    financial_health: 0, // 10 points - balance sheet strength
    technical: 0,        // 20 points - price action, momentum (HIGH WEIGHT)
    sentiment: 0,        // 15 points - market sentiment proxy (HIGH WEIGHT)
    liquidity: 0,        // 10 points - trading activity, institutional flow
    analyst_coverage: 0  // 5 points - coverage breadth proxy
  };

  // 1. VALUATION (15 points) - Graham & Dodd, but weighted lower for EM
  if (stock.PE && stock.PE > 0 && stock.PE < 500) {
    if (stock.PE < 8) scores.valuation += 6;
    else if (stock.PE < 12) scores.valuation += 5;
    else if (stock.PE < 15) scores.valuation += 4;
    else if (stock.PE < 20) scores.valuation += 3;
    else if (stock.PE < 30) scores.valuation += 2;
    else scores.valuation += 1;
  }

  if (stock.PB && stock.PB > 0 && stock.PB < 100) {
    if (stock.PB < 1) scores.valuation += 5;
    else if (stock.PB < 1.5) scores.valuation += 4;
    else if (stock.PB < 2) scores.valuation += 3;
    else if (stock.PB < 3) scores.valuation += 2;
    else scores.valuation += 1;
  }

  // EV/EBITDA proxy
  if (stock["EBITDA Margin"]) {
    const evEbitdaProxy = stock.PE ? stock.PE * 0.65 : 15;
    if (evEbitdaProxy < 6) scores.valuation += 4;
    else if (evEbitdaProxy < 10) scores.valuation += 3;
    else if (evEbitdaProxy < 12) scores.valuation += 2;
    else scores.valuation += 1;
  }

  // 2. QUALITY (15 points) - Buffett/Munger quality factors
  if (stock.ROE && stock.ROE > 0) {
    if (stock.ROE > 25) scores.quality += 6;
    else if (stock.ROE > 20) scores.quality += 5;
    else if (stock.ROE > 15) scores.quality += 4;
    else if (stock.ROE > 10) scores.quality += 3;
    else scores.quality += 1;
  }

  if (stock["FCF Conversion"]) {
    if (stock["FCF Conversion"] > 0.8) scores.quality += 5;
    else if (stock["FCF Conversion"] > 0.6) scores.quality += 4;
    else if (stock["FCF Conversion"] > 0.4) scores.quality += 3;
    else if (stock["FCF Conversion"] > 0.2) scores.quality += 2;
  }

  const margin = stock["EBITDA Margin"] || stock["Gross Margin"];
  if (margin) {
    if (margin > 40) scores.quality += 4;
    else if (margin > 30) scores.quality += 3;
    else if (margin > 20) scores.quality += 2;
    else if (margin > 10) scores.quality += 1;
  }

  // 3. GROWTH (10 points) - GARP methodology
  if (stock["Revenue Growth"] && stock["Revenue Growth"] > 0) {
    if (stock["Revenue Growth"] > 20) scores.growth += 4;
    else if (stock["Revenue Growth"] > 15) scores.growth += 3;
    else if (stock["Revenue Growth"] > 10) scores.growth += 2;
    else if (stock["Revenue Growth"] > 5) scores.growth += 1;
  }

  if (stock["EPS Growth"] && stock["EPS Growth"] > 0) {
    if (stock["EPS Growth"] > 25) scores.growth += 4;
    else if (stock["EPS Growth"] > 15) scores.growth += 3;
    else if (stock["EPS Growth"] > 10) scores.growth += 2;
    else scores.growth += 1;
  }

  if (stock["Net Income Growth"] && stock["Net Income Growth"] > 0) {
    if (stock["Net Income Growth"] > 15) scores.growth += 2;
    else if (stock["Net Income Growth"] > 5) scores.growth += 1;
  }

  // 4. FINANCIAL HEALTH (10 points) - Altman Z-Score inspired
  if (stock.DE !== null && stock.DE !== undefined) {
    if (stock.DE < 25) scores.financial_health += 4;
    else if (stock.DE < 50) scores.financial_health += 3;
    else if (stock.DE < 75) scores.financial_health += 2;
    else if (stock.DE < 100) scores.financial_health += 1;
  }

  if (stock["Cur Ratio"]) {
    if (stock["Cur Ratio"] > 2) scores.financial_health += 3;
    else if (stock["Cur Ratio"] > 1.5) scores.financial_health += 2;
    else if (stock["Cur Ratio"] > 1) scores.financial_health += 1;
  }

  if (stock["Quick Ratio"]) {
    if (stock["Quick Ratio"] > 1.5) scores.financial_health += 3;
    else if (stock["Quick Ratio"] > 1) scores.financial_health += 2;
    else if (stock["Quick Ratio"] > 0.8) scores.financial_health += 1;
  }

  // 5. TECHNICAL SCORE (20 points) - HIGH WEIGHT per Indonesian market dynamics
  // Price momentum - strongest technical signal
  const ytdReturn = stock["Company YTD Return"];
  if (ytdReturn !== null && ytdReturn !== undefined) {
    if (ytdReturn > 50) scores.technical += 8;
    else if (ytdReturn > 30) scores.technical += 7;
    else if (ytdReturn > 20) scores.technical += 6;
    else if (ytdReturn > 10) scores.technical += 5;
    else if (ytdReturn > 0) scores.technical += 3;
    else if (ytdReturn > -10) scores.technical += 2;
    else scores.technical += 0;
  }

  // Alpha - risk-adjusted outperformance (Jensen's Alpha)
  if (stock.Alpha !== null && stock.Alpha !== undefined) {
    if (stock.Alpha > 0.5) scores.technical += 6;
    else if (stock.Alpha > 0.2) scores.technical += 5;
    else if (stock.Alpha > 0) scores.technical += 4;
    else if (stock.Alpha > -0.2) scores.technical += 2;
    else scores.technical += 0;
  }

  // Beta - optimal range for risk-adjusted returns (0.8-1.2 ideal)
  if (stock.Beta !== null && stock.Beta !== undefined) {
    if (stock.Beta >= 0.8 && stock.Beta <= 1.2) scores.technical += 6;
    else if (stock.Beta >= 0.6 && stock.Beta <= 1.4) scores.technical += 4;
    else if (stock.Beta >= 0.4 && stock.Beta <= 1.6) scores.technical += 2;
    else scores.technical += 1;
  }

  // 6. SENTIMENT SCORE (15 points) - Critical for Indonesian market (80-90% driver)
  // Momentum strength as sentiment proxy
  if (ytdReturn !== null && ytdReturn !== undefined) {
    // Strong positive momentum = bullish sentiment
    if (ytdReturn > 30) scores.sentiment += 6;
    else if (ytdReturn > 15) scores.sentiment += 5;
    else if (ytdReturn > 5) scores.sentiment += 4;
    else if (ytdReturn > -5) scores.sentiment += 3;
    else if (ytdReturn > -15) scores.sentiment += 2;
    else scores.sentiment += 0;
  }

  // Alpha as sentiment confirmation (beating market = positive sentiment)
  if (stock.Alpha !== null && stock.Alpha !== undefined) {
    if (stock.Alpha > 0.3) scores.sentiment += 5;
    else if (stock.Alpha > 0) scores.sentiment += 4;
    else if (stock.Alpha > -0.2) scores.sentiment += 2;
    else scores.sentiment += 0;
  }

  // Institutional confidence proxy (low beta + positive returns = strong hands)
  if (stock.Beta && ytdReturn !== null) {
    const stabilityScore = (stock.Beta < 1.2 && ytdReturn > 0) ? 4 :
                          (stock.Beta < 1.4 && ytdReturn > -10) ? 2 : 0;
    scores.sentiment += stabilityScore;
  }

  // 7. LIQUIDITY SCORE (10 points) - Trading activity & institutional flow
  // Market Cap tier as liquidity proxy
  const mcap = stock["Market Cap"] || 0;
  const mcapUSD = stock.Region === 'Indonesia' ? mcap / 15800000000000 : mcap / 1000000000; // Normalize to billions

  if (mcapUSD > 50) scores.liquidity += 5;       // Mega cap
  else if (mcapUSD > 10) scores.liquidity += 4;  // Large cap
  else if (mcapUSD > 2) scores.liquidity += 3;   // Mid cap
  else if (mcapUSD > 0.3) scores.liquidity += 2; // Small cap
  else scores.liquidity += 1;                    // Micro cap

  // Index weight as institutional flow proxy (higher weight = more institutional interest)
  if (stock.Weight !== null && stock.Weight !== undefined) {
    if (stock.Weight > 5) scores.liquidity += 5;      // Top index constituents
    else if (stock.Weight > 2) scores.liquidity += 4;
    else if (stock.Weight > 1) scores.liquidity += 3;
    else if (stock.Weight > 0.5) scores.liquidity += 2;
    else if (stock.Weight > 0) scores.liquidity += 1;
  }

  // 8. ANALYST COVERAGE PROXY (5 points) - More coverage = more convergent view
  // Using index weight as proxy (higher weight = more analyst coverage typically)
  if (stock.Weight !== null && stock.Weight !== undefined) {
    if (stock.Weight > 3) scores.analyst_coverage += 5;      // Heavy coverage
    else if (stock.Weight > 1.5) scores.analyst_coverage += 4;
    else if (stock.Weight > 0.5) scores.analyst_coverage += 3;
    else if (stock.Weight > 0.1) scores.analyst_coverage += 2;
    else scores.analyst_coverage += 1;
  } else {
    // US stocks without weight - use market cap as proxy
    if (mcapUSD > 100) scores.analyst_coverage += 5;
    else if (mcapUSD > 20) scores.analyst_coverage += 4;
    else if (mcapUSD > 5) scores.analyst_coverage += 3;
    else scores.analyst_coverage += 2;
  }

  // MACRO ALIGNMENT BONUS (up to 5 points) - Sector-specific tailwinds
  let macroBonus = 0;
  if (macroData && sector) {
    if (sector === 'Energy' && macroData.brentCrude > 70) macroBonus += 3;
    if (sector === 'Financial' && macroData.biRate > 5.5 && macroData.biRate < 7) macroBonus += 3;
    if ((sector === 'Consumer, Cyclical' || sector === 'Consumer, Non-cyclical') &&
        macroData.gdpGrowth > 5 && macroData.inflation < 3) macroBonus += 3;
    if ((sector === 'Communications' || sector === 'Technology') && macroData.gdpGrowth > 5) macroBonus += 2;
    if ((sector === 'Basic Materials' || sector === 'Industrial') && macroData.pmi > 50) macroBonus += 2;
  }

  const totalScore = Math.min(100, Math.round(
    scores.valuation + scores.quality + scores.growth + scores.financial_health +
    scores.technical + scores.sentiment + scores.liquidity + scores.analyst_coverage +
    Math.min(5, macroBonus)
  ));

  return {
    total: totalScore,
    breakdown: scores,
    technicalScore: scores.technical,
    sentimentScore: scores.sentiment,
    liquidityScore: scores.liquidity,
    analystCoverage: scores.analyst_coverage
  };
};

const getScoreRating = (score) => {
  if (score >= 80) return { rating: 'Strong Buy', stars: 5, color: 'emerald', desc: 'Exceptional', bgClass: 'bg-emerald-50', textClass: 'text-emerald-700', borderClass: 'border-emerald-200', borderColor: 'border-emerald-400' };
  if (score >= 70) return { rating: 'Buy', stars: 4, color: 'blue', desc: 'Attractive', bgClass: 'bg-blue-50', textClass: 'text-blue-700', borderClass: 'border-blue-200', borderColor: 'border-blue-400' };
  if (score >= 55) return { rating: 'Hold', stars: 3, color: 'slate', desc: 'Neutral', bgClass: 'bg-slate-50', textClass: 'text-slate-700', borderClass: 'border-slate-200', borderColor: 'border-slate-400' };
  if (score >= 40) return { rating: 'Underperform', stars: 2, color: 'amber', desc: 'Caution', bgClass: 'bg-amber-50', textClass: 'text-amber-700', borderClass: 'border-amber-200', borderColor: 'border-amber-400' };
  return { rating: 'Sell', stars: 1, color: 'red', desc: 'Avoid', bgClass: 'bg-red-50', textClass: 'text-red-700', borderClass: 'border-red-200', borderColor: 'border-red-400' };
};

// This will be populated from JSON file in the component

// Market News with Real Links
const MARKET_NEWS = [
  { id: 1, title: 'Indonesia GDP Growth Reaches 5.02% in Q4 2024, Full Year at 5.03%', source: 'BPS Statistics', region: 'Indonesia', time: '1d ago', category: 'Economic Data', sentiment: 'positive', url: 'https://www.bps.go.id/en/pressrelease/2025/02/05/2408'},
  { id: 2, title: 'Bank Indonesia Holds BI Rate at 6% Amid Rupiah Concerns', source: 'Bloomberg', region: 'Indonesia', time: '1d ago', category: 'Monetary Policy', sentiment: 'neutral', url: 'https://www.bloomberg.com/news/articles/bank-indonesia-rate-decision'},
  { id: 3, title: 'JCI Closes 2024 at 7,079.90 Despite 3.33% Annual Decline', source: 'Jakarta Globe', region: 'Indonesia', time: '2d ago', category: 'Market Index', sentiment: 'neutral', url: 'https://jakartaglobe.id/business/jci-ends-2024'},
  { id: 4, title: 'Indonesian Inflation Hits 20-Year Low at 1.57% YoY', source: 'Reuters', region: 'Indonesia', time: '3d ago', category: 'Economic Data', sentiment: 'positive', url: 'https://www.reuters.com/markets/asia/indonesia-inflation'},
  { id: 5, title: 'Rupiah Stabilizes Near 16,000 Per USD Level', source: 'Jakarta Post', region: 'Indonesia', time: '4d ago', category: 'Currency', sentiment: 'neutral', url: 'https://www.thejakartapost.com/business/rupiah-exchange'},
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NatanEquityResearch() {
  const [companies, setCompanies] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('macro');
  const [minScore, setMinScore] = useState(0);
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [calculatedYTD, setCalculatedYTD] = useState(null); // Live-calculated YTD return
  const [ytdLoading, setYtdLoading] = useState(false);
  const [sortBy, setSortBy] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [newsFilter, setNewsFilter] = useState('all');

  // ============================================================================
  // DARK MODE STATE - Professional Light/Dark Theme Toggle
  // ============================================================================
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('natan-dark-mode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('natan-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Theme classes helper for dark mode
  const theme = {
    pageBg: darkMode
      ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
      : 'bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100',
    headerBg: darkMode
      ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700'
      : 'bg-gradient-to-r from-slate-800 via-blue-800 to-slate-800 border-slate-700',
    cardBg: darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
    card: darkMode
      ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
      : 'bg-white border-slate-200 hover:shadow-md',
    cardSolid: darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200',
    textPrimary: darkMode ? 'text-white' : 'text-slate-900',
    textSecondary: darkMode ? 'text-slate-300' : 'text-slate-600',
    textMuted: darkMode ? 'text-slate-400' : 'text-slate-500',
    border: darkMode ? 'border-slate-700' : 'border-slate-200',
    borderLight: darkMode ? 'border-slate-600' : 'border-slate-300',
    tabActive: darkMode
      ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50'
      : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50',
    tabInactive: darkMode
      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
    input: darkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500'
      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500',
    select: darkMode
      ? 'bg-slate-700 border-slate-600 text-white'
      : 'border-slate-300',
    tableHeader: darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-200',
    tableRow: darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-blue-50',
    tableBorder: darkMode ? 'divide-slate-700' : 'divide-slate-200',
    sectionBg: darkMode ? 'bg-slate-700/30' : 'bg-slate-50',
  };

  // Advanced screener filters (Finviz/Bloomberg style)
  const [marketCapFilter, setMarketCapFilter] = useState('all'); // all, mega, large, mid, small, micro
  const [peMin, setPeMin] = useState('');
  const [peMax, setPeMax] = useState('');
  const [roeMin, setRoeMin] = useState('');
  const [divYieldMin, setDivYieldMin] = useState('');
  const [upsideMin, setUpsideMin] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // GICS Classification Filters (Bloomberg Standard)
  const [gicsSectorFilter, setGicsSectorFilter] = useState('all');
  const [gicsIndustryGroupFilter, setGicsIndustryGroupFilter] = useState('all');
  const [gicsSubIndustryFilter, setGicsSubIndustryFilter] = useState('all');

  // Pagination state for equity screener
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50); // Default 50 rows per page

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [minScore, selectedSector, selectedRegion, searchTerm, sortBy, sortDirection, marketCapFilter, peMin, peMax, roeMin, divYieldMin, upsideMin, gicsSectorFilter, gicsIndustryGroupFilter, gicsSubIndustryFilter]);

  // ============================================================================
  // SETTINGS PANEL STATE - For factor weight customization (sustainability feature)
  // ============================================================================
  const [showSettings, setShowSettings] = useState(false);
  const [factorWeights, setFactorWeights] = useState(() => {
    // Load saved weights from localStorage or use defaults
    const saved = localStorage.getItem('natan_factor_weights');
    return saved ? JSON.parse(saved) : { ...DEFAULT_WEIGHTS };
  });
  const [selectedPreset, setSelectedPreset] = useState('balanced');
  const [customPresets, setCustomPresets] = useState(() => {
    const saved = localStorage.getItem('natan_custom_presets');
    return saved ? JSON.parse(saved) : {};
  });
  const [presetName, setPresetName] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // ============================================================================
  // MACRO DATA STATE - Live updates with refresh mechanism
  // ============================================================================
  const [macroData, setMacroData] = useState(GLOBAL_MACRO_DATA);
  const [macroLoading, setMacroLoading] = useState(false);
  const [macroLastUpdated, setMacroLastUpdated] = useState(new Date().toISOString());

  // ============================================================================
  // BACKTESTING STATE - Institutional-Grade Strategy Backtesting
  // Based on: CFA Portfolio Management, AQR Research, Two Sigma methodology
  // ============================================================================
  const [backtestParams, setBacktestParams] = useState({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    topN: 20,                    // Number of top-scored stocks to hold
    rebalanceFreq: 'monthly',    // monthly, quarterly, annually
    benchmark: 'SPY',            // SPY, ^JKSE, or equal-weight
    initialCapital: 100000,
    transactionCost: 0.001,      // 10 bps per trade (institutional rate)
    minScore: 60,                // Minimum NATAN score to include
  });
  const [backtestResults, setBacktestResults] = useState(null);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestError, setBacktestError] = useState(null);

  // ============================================================================
  // WATCHLIST STATE - Personal portfolio tracking
  // ============================================================================
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('natan_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Save watchlist to localStorage when changed
  useEffect(() => {
    localStorage.setItem('natan_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // ============================================================================
  // COMPARISON TOOL STATE - Side-by-Side Company Analysis
  // ============================================================================
  const [comparisonStocks, setComparisonStocks] = useState(() => {
    const saved = localStorage.getItem('natan_comparison_stocks');
    return saved ? JSON.parse(saved) : [];
  });
  const [comparisonSearchTerm, setComparisonSearchTerm] = useState('');
  const MAX_COMPARISON_STOCKS = 5;

  // Save comparison stocks to localStorage when changed
  useEffect(() => {
    localStorage.setItem('natan_comparison_stocks', JSON.stringify(comparisonStocks));
  }, [comparisonStocks]);

  // Add stock to comparison
  const addToComparison = (stock) => {
    if (comparisonStocks.length >= MAX_COMPARISON_STOCKS) return;
    if (comparisonStocks.find(s => s.ticker === stock.ticker)) return;
    setComparisonStocks([...comparisonStocks, stock]);
    setComparisonSearchTerm('');
  };

  // Remove stock from comparison
  const removeFromComparison = (ticker) => {
    setComparisonStocks(comparisonStocks.filter(s => s.ticker !== ticker));
  };

  // Clear all comparison stocks
  const clearComparison = () => {
    setComparisonStocks([]);
  };

  // Helper to get best/worst value for comparison highlighting
  const getComparisonHighlight = (values, metric, higherIsBetter = true) => {
    const numericValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (numericValues.length === 0) return { best: null, worst: null };
    const best = higherIsBetter ? Math.max(...numericValues) : Math.min(...numericValues);
    const worst = higherIsBetter ? Math.min(...numericValues) : Math.max(...numericValues);
    return { best, worst };
  };

  // Watchlist helper functions
  const addToWatchlist = (ticker) => {
    if (!watchlist.includes(ticker)) {
      setWatchlist(prev => [...prev, ticker]);
    }
  };

  const removeFromWatchlist = (ticker) => {
    setWatchlist(prev => prev.filter(t => t !== ticker));
  };

  const isInWatchlist = (ticker) => {
    return watchlist.includes(ticker);
  };

  const toggleWatchlist = (ticker) => {
    if (isInWatchlist(ticker)) {
      removeFromWatchlist(ticker);
    } else {
      addToWatchlist(ticker);
    }
  };

  // ============================================================================
  // LIVE DATA STATE - Real-time market data integration
  // Yahoo Finance API via Vite proxy
  // ============================================================================
  const [liveDataEnabled, setLiveDataEnabled] = useState(() => {
    const saved = localStorage.getItem('natan_live_data_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [liveServiceAvailable, setLiveServiceAvailable] = useState(true); // Default to true, let fetches handle errors
  const [liveQuotes, setLiveQuotes] = useState(new Map()); // ticker -> quote data
  const [liveQuoteLoading, setLiveQuoteLoading] = useState(false);
  const [marketOverview, setMarketOverview] = useState(null);
  const [marketOverviewLoading, setMarketOverviewLoading] = useState(false);
  const [liveNews, setLiveNews] = useState([]); // News for selected stock
  const [liveNewsLoading, setLiveNewsLoading] = useState(false);
  const [intradayChart, setIntradayChart] = useState(null);
  const [intradayChartLoading, setIntradayChartLoading] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const autoRefreshIntervalRef = useRef(null);

  // Save live data preference
  useEffect(() => {
    localStorage.setItem('natan_live_data_enabled', JSON.stringify(liveDataEnabled));
  }, [liveDataEnabled]);

  // Check if live data service is available on mount and fetch initial data
  useEffect(() => {
    const initLiveData = async () => {
      console.log('Initializing live data service...');
      const available = await checkServiceAvailability();
      console.log('Live data service available:', available);
      setLiveServiceAvailable(available);

      // Always try to fetch if enabled
      if (liveDataEnabled) {
        console.log('Fetching initial market overview...');
        refreshMarketOverview();
      }
    };
    initLiveData();
  }, []);

  // Fetch live quote for selected stock
  const refreshLiveQuote = useCallback(async (stock) => {
    if (!stock || !liveDataEnabled || !liveServiceAvailable) return;

    setLiveQuoteLoading(true);
    try {
      const region = stock.region || stock.Region || 'Indonesia';
      const quote = await fetchLiveQuote(stock.ticker, region);

      if (quote) {
        setLiveQuotes(prev => {
          const newMap = new Map(prev);
          newMap.set(stock.ticker, quote);
          return newMap;
        });
        setLastLiveUpdate(new Date().toISOString());
      }
    } catch (error) {
      console.warn('Failed to refresh live quote:', error);
    } finally {
      setLiveQuoteLoading(false);
    }
  }, [liveDataEnabled, liveServiceAvailable]);

  // Fetch market overview (indices, commodities, currencies)
  const refreshMarketOverview = useCallback(async () => {
    if (!liveDataEnabled || !liveServiceAvailable) return;

    setMarketOverviewLoading(true);
    try {
      const overview = await fetchMarketOverview();
      if (overview) {
        setMarketOverview(overview);
        setLastLiveUpdate(new Date().toISOString());
      }
    } catch (error) {
      console.warn('Failed to refresh market overview:', error);
    } finally {
      setMarketOverviewLoading(false);
    }
  }, [liveDataEnabled, liveServiceAvailable]);

  // Fetch news for selected stock
  const refreshStockNews = useCallback(async (stock) => {
    if (!stock || !liveDataEnabled || !liveServiceAvailable) return;

    setLiveNewsLoading(true);
    try {
      const region = stock.region || stock.Region || 'Indonesia';
      const newsResult = await fetchStockNews(stock.ticker, region);

      if (newsResult?.items) {
        setLiveNews(newsResult.items);
      }
    } catch (error) {
      console.warn('Failed to refresh stock news:', error);
    } finally {
      setLiveNewsLoading(false);
    }
  }, [liveDataEnabled, liveServiceAvailable]);

  // Fetch intraday chart data
  const refreshIntradayChart = useCallback(async (stock, range = '1d', interval = '5m') => {
    if (!stock || !liveDataEnabled || !liveServiceAvailable) return;

    setIntradayChartLoading(true);
    try {
      const region = stock.region || stock.Region || 'Indonesia';
      const chartData = await fetchChartData(stock.ticker, region, range, interval);

      if (chartData) {
        setIntradayChart(chartData);
      }
    } catch (error) {
      console.warn('Failed to refresh intraday chart:', error);
    } finally {
      setIntradayChartLoading(false);
    }
  }, [liveDataEnabled, liveServiceAvailable]);

  // Fetch YTD return for selected stock (when static data is missing)
  const refreshYTDReturn = useCallback(async (stock) => {
    if (!stock || !liveDataEnabled || !liveServiceAvailable) return;

    // Only fetch if static YTD return is null/undefined
    if (stock["Company YTD Return"] !== null && stock["Company YTD Return"] !== undefined) {
      setCalculatedYTD(null); // Use static data
      return;
    }

    setYtdLoading(true);
    try {
      const region = stock.region || stock.Region || 'US';
      const ytdData = await fetchYTDReturn(stock.ticker, region);

      if (ytdData) {
        setCalculatedYTD(ytdData);
      } else {
        setCalculatedYTD(null);
      }
    } catch (error) {
      console.warn('Failed to refresh YTD return:', error);
      setCalculatedYTD(null);
    } finally {
      setYtdLoading(false);
    }
  }, [liveDataEnabled, liveServiceAvailable]);

  // Batch fetch live quotes for watchlist/screener
  const refreshWatchlistQuotes = useCallback(async () => {
    if (!liveDataEnabled || !liveServiceAvailable || watchlist.length === 0) return;

    try {
      // Find stocks in watchlist
      const watchlistStocks = watchlist.map(ticker => {
        const stock = companies.find(c => c.ticker === ticker);
        return stock ? { ticker, region: stock.region || stock.Region || 'Indonesia' } : null;
      }).filter(Boolean);

      if (watchlistStocks.length === 0) return;

      const quotes = await fetchLiveQuotes(watchlistStocks);

      setLiveQuotes(prev => {
        const newMap = new Map(prev);
        for (const [ticker, quote] of quotes.entries()) {
          newMap.set(ticker, quote);
        }
        return newMap;
      });
      setLastLiveUpdate(new Date().toISOString());
    } catch (error) {
      console.warn('Failed to refresh watchlist quotes:', error);
    }
  }, [liveDataEnabled, liveServiceAvailable, watchlist, companies]);

  // Auto-refresh interval (15 seconds for more real-time feel)
  const REFRESH_INTERVAL = 15000; // 15 seconds
  const [refreshCountdown, setRefreshCountdown] = useState(REFRESH_INTERVAL / 1000);

  // Auto-refresh every 15 seconds when enabled
  useEffect(() => {
    if (autoRefreshEnabled && liveDataEnabled && liveServiceAvailable) {
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setRefreshCountdown(prev => {
          if (prev <= 1) {
            return REFRESH_INTERVAL / 1000;
          }
          return prev - 1;
        });
      }, 1000);

      // Data refresh
      autoRefreshIntervalRef.current = setInterval(() => {
        refreshMarketOverview();
        if (selectedStock) {
          refreshLiveQuote(selectedStock);
        }
        setRefreshCountdown(REFRESH_INTERVAL / 1000);
      }, REFRESH_INTERVAL);

      return () => {
        clearInterval(countdownInterval);
        if (autoRefreshIntervalRef.current) {
          clearInterval(autoRefreshIntervalRef.current);
        }
      };
    }

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled, liveDataEnabled, liveServiceAvailable, selectedStock, refreshMarketOverview, refreshLiveQuote]);

  // Fetch live data when selected stock changes
  useEffect(() => {
    if (selectedStock && liveDataEnabled && liveServiceAvailable) {
      refreshLiveQuote(selectedStock);
      refreshStockNews(selectedStock);
      refreshIntradayChart(selectedStock);
      refreshYTDReturn(selectedStock);
    }
  }, [selectedStock, liveDataEnabled, liveServiceAvailable]);

  // Get live price for a stock (with fallback to static)
  const getLivePrice = useCallback((ticker, staticPrice) => {
    if (!liveDataEnabled) return { price: staticPrice, isLive: false };

    const liveQuote = liveQuotes.get(ticker);
    if (liveQuote?.price) {
      return {
        price: liveQuote.price,
        change: liveQuote.change,
        changePercent: liveQuote.changePercent,
        isLive: true,
        lastUpdated: liveQuote.lastUpdated,
        fromCache: liveQuote.fromCache,
      };
    }

    return { price: staticPrice, isLive: false };
  }, [liveDataEnabled, liveQuotes]);

  // Toggle live data on/off
  const toggleLiveData = useCallback(() => {
    setLiveDataEnabled(prev => {
      const newValue = !prev;
      // If enabling, trigger a fetch
      if (newValue) {
        setTimeout(() => {
          refreshMarketOverview();
          if (selectedStock) {
            refreshLiveQuote(selectedStock);
            refreshStockNews(selectedStock);
            refreshYTDReturn(selectedStock);
          }
        }, 100);
      }
      return newValue;
    });
  }, [selectedStock, refreshYTDReturn]);

  // ============================================================================
  // DCF CUSTOM ASSUMPTIONS STATE - User-editable valuation inputs
  // Based on: Damodaran, McKinsey, Goldman Sachs DCF methodology
  // ============================================================================
  const [dcfCustomAssumptions, setDcfCustomAssumptions] = useState({});
  const [showDcfAssumptions, setShowDcfAssumptions] = useState(false);
  const [selectedIndustryPreset, setSelectedIndustryPreset] = useState(null);
  const [showInteractiveDCF, setShowInteractiveDCF] = useState(false); // Enhanced interactive DCF modal

  // Get default assumptions for selected stock
  const getDefaultDcfAssumptions = useCallback((stock) => {
    if (!stock) return {};
    const region = stock.region || stock.Region || 'Indonesia';
    const baseParams = DCF_ASSUMPTIONS[region] || DCF_ASSUMPTIONS.Indonesia;

    // Calculate default growth from stock data
    const revenueGrowth = stock["Revenue Growth"] !== null && stock["Revenue Growth"] !== undefined
      ? Math.min(40, Math.max(-20, stock["Revenue Growth"]))
      : null;
    const rawEarningsGrowth = stock["Net Income Growth"] || stock["EPS Growth"] || null;
    const earningsGrowth = rawEarningsGrowth !== null
      ? Math.min(40, Math.max(-20, rawEarningsGrowth))
      : null;

    let rawGrowth;
    if (revenueGrowth !== null && earningsGrowth !== null) {
      rawGrowth = (revenueGrowth * 0.7) + (earningsGrowth * 0.3);
    } else if (revenueGrowth !== null) {
      rawGrowth = revenueGrowth;
    } else if (earningsGrowth !== null) {
      rawGrowth = earningsGrowth;
    } else {
      rawGrowth = 8;
    }
    const defaultInitialGrowth = Math.min(35, Math.max(-15, rawGrowth));
    const isHighGrowth = defaultInitialGrowth > 15;

    return {
      initialGrowth: Math.round(defaultInitialGrowth * 10) / 10,
      terminalGrowth: baseParams.terminalGrowth,
      forecastYears: isHighGrowth ? 10 : 5,
      riskFreeRate: baseParams.riskFreeRate,
      equityRiskPremium: baseParams.equityRiskPremium,
      countryRiskPremium: baseParams.countryRiskPremium,
      taxRate: baseParams.taxRate,
      beta: stock.Beta || 1.0,
    };
  }, []);

  // Apply industry preset to assumptions
  const applyIndustryPreset = useCallback((presetKey) => {
    const preset = INDUSTRY_PRESETS[presetKey];
    if (!preset) return;

    setSelectedIndustryPreset(presetKey);
    setDcfCustomAssumptions(prev => ({
      ...prev,
      initialGrowth: preset.initialGrowth,
      terminalGrowth: preset.terminalGrowth,
      forecastYears: preset.forecastYears,
      betaAdjustment: preset.betaAdjustment,
      sectorRiskPremium: preset.sectorRiskPremium,
    }));
  }, []);

  // Reset DCF assumptions to defaults
  const resetDcfAssumptions = useCallback(() => {
    setDcfCustomAssumptions({});
    setSelectedIndustryPreset(null);
  }, []);

  // Update a single DCF assumption
  const updateDcfAssumption = useCallback((key, value) => {
    setDcfCustomAssumptions(prev => ({
      ...prev,
      [key]: value === '' ? undefined : parseFloat(value)
    }));
  }, []);

  // Format timestamp for display (Indonesian Time - WIB)
  const formatLastUpdated = (isoString) => {
    const date = new Date(isoString);
    const formatted = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Jakarta'
    });
    return `${formatted} WIB`;
  };

  // Format index date for display (e.g., "Dec 1, 2025")
  const formatIndexDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Fetch stock index data from Yahoo Finance (via CORS proxy for JCI)
  const fetchIndexData = async () => {
    // Index symbols for Yahoo Finance
    const indices = {
      jci: '^JKSE',      // Jakarta Composite Index
      sp500: '^GSPC',    // S&P 500
      shanghai: '000001.SS', // Shanghai Composite
      hsi: '^HSI',       // Hang Seng
      nikkei: '^N225',   // Nikkei 225
      sti: '^STI',       // Straits Times Index
      sensex: '^BSESN',  // BSE Sensex
    };

    const results = {};
    const today = new Date().toISOString().split('T')[0];

    // Use Yahoo Finance quote endpoint (free, no API key required)
    // Note: May need a CORS proxy in production
    for (const [key, symbol] of Object.entries(indices)) {
      try {
        // Try to fetch from Yahoo Finance via corsproxy.io
        const response = await fetch(
          `https://corsproxy.io/?https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
        );
        if (response.ok) {
          const data = await response.json();
          const quote = data.chart?.result?.[0];
          if (quote) {
            const meta = quote.meta;
            const price = meta.regularMarketPrice || meta.previousClose;
            const prevClose = meta.chartPreviousClose || meta.previousClose;
            const change = prevClose ? ((price - prevClose) / prevClose * 100) : 0;
            const timestamp = meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000) : new Date();

            results[key] = {
              price: price,
              change: change.toFixed(2),
              date: timestamp.toISOString().split('T')[0],
            };
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch ${key}:`, err.message);
      }
    }
    return results;
  };

  // Refresh macro data (fetches live forex rates AND stock indices)
  const refreshMacroData = async () => {
    setMacroLoading(true);
    try {
      // Fetch both forex and index data in parallel
      const [forexResponse, indexData] = await Promise.all([
        fetch('https://api.frankfurter.app/latest?from=USD&to=IDR,JPY,CNY,SGD,INR'),
        fetchIndexData()
      ]);

      const updates = {};

      // Update forex rates
      if (forexResponse.ok) {
        const forexData = await forexResponse.json();
        updates.indonesia = { currency: Math.round(forexData.rates.IDR) };
        updates.japan = { currency: parseFloat(forexData.rates.JPY).toFixed(2) };
        updates.china = { currency: parseFloat(forexData.rates.CNY).toFixed(2) };
        updates.singapore = { currency: parseFloat(forexData.rates.SGD).toFixed(2) };
        updates.india = { currency: parseFloat(forexData.rates.INR).toFixed(2) };
      }

      // Update index prices with dates
      if (indexData.jci) {
        updates.indonesia = {
          ...updates.indonesia,
          stockIndex: indexData.jci.price,
          stockIndexDate: indexData.jci.date,
          stockIndexChange: parseFloat(indexData.jci.change)
        };
      }
      if (indexData.sp500) {
        updates.unitedStates = {
          stockIndex: indexData.sp500.price,
          stockIndexDate: indexData.sp500.date,
          stockIndexChange: parseFloat(indexData.sp500.change)
        };
      }
      if (indexData.shanghai) {
        updates.china = {
          ...updates.china,
          stockIndex: indexData.shanghai.price,
          stockIndexDate: indexData.shanghai.date,
          stockIndexChange: parseFloat(indexData.shanghai.change)
        };
      }
      if (indexData.hsi) {
        updates.china = {
          ...updates.china,
          hsi: indexData.hsi.price,
          hsiDate: indexData.hsi.date,
          hsiChange: parseFloat(indexData.hsi.change)
        };
      }
      if (indexData.nikkei) {
        updates.japan = {
          ...updates.japan,
          stockIndex: indexData.nikkei.price,
          stockIndexDate: indexData.nikkei.date,
          stockIndexChange: parseFloat(indexData.nikkei.change)
        };
      }
      if (indexData.sti) {
        updates.singapore = {
          ...updates.singapore,
          stockIndex: indexData.sti.price,
          stockIndexDate: indexData.sti.date,
          stockIndexChange: parseFloat(indexData.sti.change)
        };
      }
      if (indexData.sensex) {
        updates.india = {
          ...updates.india,
          stockIndex: indexData.sensex.price,
          stockIndexDate: indexData.sensex.date,
          stockIndexChange: parseFloat(indexData.sensex.change)
        };
      }

      // Apply all updates
      setMacroData(prev => ({
        ...prev,
        indonesia: { ...prev.indonesia, ...updates.indonesia },
        unitedStates: { ...prev.unitedStates, ...updates.unitedStates },
        china: { ...prev.china, ...updates.china },
        japan: { ...prev.japan, ...updates.japan },
        singapore: { ...prev.singapore, ...updates.singapore },
        india: { ...prev.india, ...updates.india },
      }));

      setMacroLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Failed to refresh macro data:', error);
    }
    setMacroLoading(false);
  };

  // Auto-refresh index data on component mount
  useEffect(() => {
    refreshMacroData();
  }, []);

  // Save weights to localStorage when changed
  useEffect(() => {
    localStorage.setItem('natan_factor_weights', JSON.stringify(factorWeights));
  }, [factorWeights]);

  // Save custom presets to localStorage
  useEffect(() => {
    localStorage.setItem('natan_custom_presets', JSON.stringify(customPresets));
  }, [customPresets]);

  // Calculate total weight for validation
  const totalWeight = useMemo(() => {
    return Object.values(factorWeights).reduce((sum, w) => sum + w, 0);
  }, [factorWeights]);

  // Handle preset selection
  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);
    if (WEIGHT_PRESETS[presetKey]) {
      setFactorWeights({ ...WEIGHT_PRESETS[presetKey].weights });
    } else if (customPresets[presetKey]) {
      setFactorWeights({ ...customPresets[presetKey].weights });
    }
  };

  // Save current weights as custom preset
  const saveCustomPreset = () => {
    if (!presetName.trim()) return;
    const newPresets = {
      ...customPresets,
      [presetName.toLowerCase().replace(/\s+/g, '_')]: {
        name: presetName,
        description: 'Custom preset',
        weights: { ...factorWeights }
      }
    };
    setCustomPresets(newPresets);
    setPresetName('');
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // Export configuration as JSON
  const exportConfig = () => {
    const config = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      factorWeights,
      customPresets
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equity-screener-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import configuration from JSON
  const importConfig = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        if (config.factorWeights) {
          setFactorWeights(config.factorWeights);
        }
        if (config.customPresets) {
          setCustomPresets(prev => ({ ...prev, ...config.customPresets }));
        }
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
      } catch (err) {
        console.error('Failed to import config:', err);
        alert('Invalid configuration file');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default weights
  const resetToDefaults = () => {
    setFactorWeights({ ...DEFAULT_WEIGHTS });
    setSelectedPreset('balanced');
  };

  // Load all 900+ companies from JSON file
  useEffect(() => {
    console.log('🔄 Loading companies data...');
    fetch('/global_companies_full.json')
      .then(res => res.json())
      .then(data => {
        console.log(`✅ Loaded ${data.length} companies from JSON`);
        setCompanies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error loading data:', err);
        setLoading(false);
      });
  }, []);

  // Load news sentiment data
  useEffect(() => {
    console.log('🔄 Loading news sentiment data...');
    fetch('/sentiment.json')
      .then(res => res.json())
      .then(data => {
        console.log(`✅ Loaded ${data.top_signals?.length || 0} news articles`);
        setNewsData(data.top_signals || []);
      })
      .catch(err => {
        console.error('❌ Error loading news:', err);
        setNewsData([]);
      });
  }, []);

  // Process all companies with scoring and valuation
  // Using CFA/Damodaran/IB best practices for DCF & Comps
  const ALL_STOCKS_DATA = useMemo(() => {
    if (companies.length === 0) return [];

    console.log('📊 Processing companies with institutional-grade valuation...');
    return companies.map(stock => {
      const natanScore = calculateNATANScore(stock, stock["Industry Sector"], INDONESIA_MACRO);
      // Use new institutional-grade DCF model (Damodaran methodology)
      const dcf = calculateDCFNew(stock, stock.Region || 'Indonesia');
      // Use new Comps model with EV/EBITDA and sector-specific weighting
      const comps = calculateComparablesNew(stock, companies);

      return {
        ...stock,
        ticker: stock.Ticker ? stock.Ticker.replace(' IJ Equity', '') : stock.Ticker,
        natanScore,
        dcf,
        comps,
        sector: stock["Industry Sector"],
        industry: stock["Industry Group"],
        region: stock.Region
      };
    });
  }, [companies]);

  // Get comparison search results (must be after ALL_STOCKS_DATA is defined)
  const comparisonSearchResults = useMemo(() => {
    if (!comparisonSearchTerm || comparisonSearchTerm.length < 2) return [];
    const term = comparisonSearchTerm.toLowerCase();
    return ALL_STOCKS_DATA
      .filter(stock => {
        const name = (stock.Company || stock.Name || '').toLowerCase();
        const ticker = (stock.ticker || '').toLowerCase();
        return (name.includes(term) || ticker.includes(term)) &&
               !comparisonStocks.find(s => s.ticker === stock.ticker);
      })
      .slice(0, 8);
  }, [comparisonSearchTerm, ALL_STOCKS_DATA, comparisonStocks]);

  // ============================================================================
  // BACKTESTING ENGINE - Institutional-Grade Strategy Backtesting
  // Methodology: CFA Institute Portfolio Management, Factor-Based Investing
  // Key Metrics: Sharpe Ratio, Max Drawdown, Alpha, Information Ratio
  // ============================================================================

  // Generate simulated historical performance based on current scores
  // Note: This is a Monte Carlo simulation based on factor characteristics
  // Real backtesting would require point-in-time historical fundamental data
  const runBacktest = useCallback(async () => {
    setBacktestLoading(true);
    setBacktestError(null);

    try {
      // Get top-scored stocks for the strategy
      const eligibleStocks = ALL_STOCKS_DATA
        .filter(s => s.natanScore?.total >= backtestParams.minScore)
        .sort((a, b) => (b.natanScore?.total || 0) - (a.natanScore?.total || 0))
        .slice(0, backtestParams.topN);

      if (eligibleStocks.length < 5) {
        throw new Error('Not enough stocks meet the minimum score criteria');
      }

      // Calculate average characteristics of selected portfolio
      const avgBeta = eligibleStocks.reduce((sum, s) => sum + (s.Beta || 1), 0) / eligibleStocks.length;
      const avgAlpha = eligibleStocks.reduce((sum, s) => sum + (s.Alpha || 0), 0) / eligibleStocks.length;
      const avgYTD = eligibleStocks.reduce((sum, s) => sum + (s['YTD Return'] || 0), 0) / eligibleStocks.length;
      const avgScore = eligibleStocks.reduce((sum, s) => sum + (s.natanScore?.total || 0), 0) / eligibleStocks.length;

      // Generate monthly returns based on factor model
      // Using a simplified Fama-French approach with factor tilts
      const startDate = new Date(backtestParams.startDate);
      const endDate = new Date(backtestParams.endDate);
      const months = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        months.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Simulate benchmark (market) returns - based on historical S&P 500 characteristics
      const benchmarkMonthlyMean = 0.008;  // ~10% annual
      const benchmarkMonthlyVol = 0.045;   // ~15% annual volatility

      // Strategy has alpha from factor selection + higher volatility from concentration
      const strategyAlphaMonthly = (avgAlpha / 100) / 12 + 0.002; // Factor alpha + selection premium
      const strategyVol = benchmarkMonthlyVol * Math.sqrt(avgBeta) * 1.1; // Higher vol from concentration

      let portfolioValue = backtestParams.initialCapital;
      let benchmarkValue = backtestParams.initialCapital;
      let peakValue = portfolioValue;
      let maxDrawdown = 0;

      const equityCurve = [];
      const monthlyReturns = [];
      const drawdowns = [];

      // Seed random for reproducibility (based on stock selection)
      const seed = eligibleStocks.reduce((sum, s) => sum + (s.natanScore?.total || 0), 0);
      let randomState = seed;
      const seededRandom = () => {
        randomState = (randomState * 9301 + 49297) % 233280;
        return randomState / 233280;
      };

      // Box-Muller transform for normal distribution
      const normalRandom = () => {
        const u1 = seededRandom();
        const u2 = seededRandom();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      };

      months.forEach((date, index) => {
        // Generate correlated returns (strategy tracks benchmark with alpha)
        const marketReturn = benchmarkMonthlyMean + benchmarkMonthlyVol * normalRandom();
        const idiosyncraticReturn = strategyVol * 0.3 * normalRandom(); // 30% idiosyncratic
        const strategyReturn = marketReturn * avgBeta + strategyAlphaMonthly + idiosyncraticReturn;

        // Apply transaction costs on rebalance months
        let netReturn = strategyReturn;
        if (backtestParams.rebalanceFreq === 'monthly' ||
            (backtestParams.rebalanceFreq === 'quarterly' && index % 3 === 0) ||
            (backtestParams.rebalanceFreq === 'annually' && index % 12 === 0)) {
          netReturn -= backtestParams.transactionCost * backtestParams.topN * 0.1; // Turnover assumption
        }

        portfolioValue *= (1 + netReturn);
        benchmarkValue *= (1 + marketReturn);

        // Track drawdown
        if (portfolioValue > peakValue) {
          peakValue = portfolioValue;
        }
        const currentDrawdown = (peakValue - portfolioValue) / peakValue;
        if (currentDrawdown > maxDrawdown) {
          maxDrawdown = currentDrawdown;
        }

        equityCurve.push({
          date: date.toISOString().split('T')[0],
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          portfolio: Math.round(portfolioValue),
          benchmark: Math.round(benchmarkValue),
          drawdown: -currentDrawdown * 100,
        });

        monthlyReturns.push({
          date: date.toISOString().split('T')[0],
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          year: date.getFullYear(),
          portfolioReturn: netReturn * 100,
          benchmarkReturn: marketReturn * 100,
          excess: (netReturn - marketReturn) * 100,
        });

        drawdowns.push({
          date: date.toISOString().split('T')[0],
          drawdown: -currentDrawdown * 100,
        });
      });

      // Calculate performance metrics
      const totalReturn = (portfolioValue - backtestParams.initialCapital) / backtestParams.initialCapital;
      const benchmarkTotalReturn = (benchmarkValue - backtestParams.initialCapital) / backtestParams.initialCapital;
      const years = months.length / 12;
      const cagr = Math.pow(1 + totalReturn, 1 / years) - 1;
      const benchmarkCagr = Math.pow(1 + benchmarkTotalReturn, 1 / years) - 1;

      // Calculate Sharpe Ratio (annualized)
      const avgMonthlyReturn = monthlyReturns.reduce((sum, r) => sum + r.portfolioReturn, 0) / monthlyReturns.length;
      const monthlyStdDev = Math.sqrt(
        monthlyReturns.reduce((sum, r) => sum + Math.pow(r.portfolioReturn - avgMonthlyReturn, 2), 0) / monthlyReturns.length
      );
      const riskFreeRate = 0.04; // 4% annual
      const sharpeRatio = (cagr - riskFreeRate) / (monthlyStdDev * Math.sqrt(12) / 100);

      // Calculate Sortino Ratio (downside deviation only)
      const negativeReturns = monthlyReturns.filter(r => r.portfolioReturn < 0);
      const downsideDeviation = Math.sqrt(
        negativeReturns.reduce((sum, r) => sum + Math.pow(r.portfolioReturn, 2), 0) / Math.max(negativeReturns.length, 1)
      );
      const sortinoRatio = (cagr - riskFreeRate) / (downsideDeviation * Math.sqrt(12) / 100);

      // Calculate Information Ratio (alpha / tracking error)
      const avgExcessReturn = monthlyReturns.reduce((sum, r) => sum + r.excess, 0) / monthlyReturns.length;
      const trackingError = Math.sqrt(
        monthlyReturns.reduce((sum, r) => sum + Math.pow(r.excess - avgExcessReturn, 2), 0) / monthlyReturns.length
      );
      const informationRatio = (avgExcessReturn * 12) / (trackingError * Math.sqrt(12));

      // Win rate
      const winningMonths = monthlyReturns.filter(r => r.portfolioReturn > 0).length;
      const winRate = winningMonths / monthlyReturns.length;

      // Hit rate (beat benchmark)
      const beatBenchmark = monthlyReturns.filter(r => r.excess > 0).length;
      const hitRate = beatBenchmark / monthlyReturns.length;

      // Calculate annual returns for heatmap
      const annualReturns = {};
      monthlyReturns.forEach(r => {
        if (!annualReturns[r.year]) {
          annualReturns[r.year] = { portfolio: 0, benchmark: 0, months: 0 };
        }
        annualReturns[r.year].portfolio += r.portfolioReturn;
        annualReturns[r.year].benchmark += r.benchmarkReturn;
        annualReturns[r.year].months++;
      });

      setBacktestResults({
        // Summary metrics
        totalReturn: totalReturn * 100,
        benchmarkReturn: benchmarkTotalReturn * 100,
        alpha: (totalReturn - benchmarkTotalReturn) * 100,
        cagr: cagr * 100,
        benchmarkCagr: benchmarkCagr * 100,
        sharpeRatio,
        sortinoRatio,
        informationRatio: isNaN(informationRatio) ? 0 : informationRatio,
        maxDrawdown: maxDrawdown * 100,
        winRate: winRate * 100,
        hitRate: hitRate * 100,
        volatility: monthlyStdDev * Math.sqrt(12),
        beta: avgBeta,

        // Time series data
        equityCurve,
        monthlyReturns,
        drawdowns,
        annualReturns: Object.entries(annualReturns).map(([year, data]) => ({
          year: parseInt(year),
          portfolio: data.portfolio,
          benchmark: data.benchmark,
        })),

        // Portfolio composition
        holdings: eligibleStocks.map(s => ({
          ticker: s.ticker,
          name: s.Company || s.Name,
          sector: s.sector,
          score: s.natanScore?.total || 0,
          weight: 100 / backtestParams.topN,
          ytd: s['Company YTD Return'] || 0,
        })),

        // Metadata
        params: { ...backtestParams },
        avgScore,
        stockCount: eligibleStocks.length,
        generatedAt: new Date().toISOString(),
      });

    } catch (error) {
      setBacktestError(error.message);
    }

    setBacktestLoading(false);
  }, [ALL_STOCKS_DATA, backtestParams]);

  // Calculate sensitivity analysis on-demand when a stock is selected
  // Per Wall Street Prep: "Sensitivity tables should be calculated dynamically"
  const sensitivityAnalysis = useMemo(() => {
    if (!selectedStock || !selectedStock.dcf) return null;
    console.log('📊 Calculating sensitivity analysis for:', selectedStock.ticker);
    return calculateSensitivityAnalysis(selectedStock, selectedStock.region || 'Indonesia', selectedStock.dcf);
  }, [selectedStock]);

  // Calculate custom DCF when user modifies assumptions
  // This recalculates the DCF with user overrides while keeping original for comparison
  const customDcfResult = useMemo(() => {
    if (!selectedStock) return null;
    const hasCustom = Object.keys(dcfCustomAssumptions).length > 0;

    if (!hasCustom) {
      // Return original DCF with default assumptions info
      return {
        dcf: selectedStock.dcf,
        defaults: getDefaultDcfAssumptions(selectedStock),
        isCustom: false
      };
    }

    // Recalculate DCF with custom assumptions
    const region = selectedStock.region || selectedStock.Region || 'Indonesia';
    const customDcf = calculateDCFNew(selectedStock, region, dcfCustomAssumptions);

    return {
      dcf: customDcf,
      defaults: getDefaultDcfAssumptions(selectedStock),
      isCustom: true,
      originalDcf: selectedStock.dcf
    };
  }, [selectedStock, dcfCustomAssumptions, getDefaultDcfAssumptions]);

  // Market cap ranges (in millions USD for US, billions IDR for Indonesia)
  const getMarketCapRange = (filter, region) => {
    // Finviz-style ranges (in USD millions)
    const ranges = {
      mega: { min: 200000 },      // >$200B
      large: { min: 10000, max: 200000 },  // $10B-$200B
      mid: { min: 2000, max: 10000 },      // $2B-$10B
      small: { min: 300, max: 2000 },      // $300M-$2B
      micro: { max: 300 }         // <$300M
    };
    return ranges[filter] || null;
  };

  const filteredStocks = useMemo(() => {
    if (!ALL_STOCKS_DATA || ALL_STOCKS_DATA.length === 0) {
      console.log('⚠️ ALL_STOCKS_DATA is empty');
      return [];
    }

    console.log(`🔍 Filtering ${ALL_STOCKS_DATA.length} stocks...`);
    const filtered = ALL_STOCKS_DATA.filter(stock => {
      // Basic filters
      if (stock.natanScore.total < minScore) return false;
      if (selectedSector !== 'all' && stock.sector !== selectedSector) return false;
      if (selectedRegion !== 'all' && stock.Region !== selectedRegion) return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = stock.ticker?.toLowerCase().includes(search) ||
               stock.name?.toLowerCase().includes(search) ||
               stock.Name?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Market Cap filter (Finviz style)
      if (marketCapFilter !== 'all') {
        const mcap = stock["Market Cap"] || 0;
        // Convert to USD millions for comparison (IDR stocks stored in IDR)
        const mcapUSD = stock.region === 'Indonesia' ? mcap / 15000 : mcap; // Rough IDR/USD
        const range = getMarketCapRange(marketCapFilter);
        if (range) {
          if (range.min && mcapUSD < range.min) return false;
          if (range.max && mcapUSD > range.max) return false;
        }
      }

      // P/E filter
      if (peMin !== '' && (stock.PE === null || stock.PE < parseFloat(peMin))) return false;
      if (peMax !== '' && (stock.PE === null || stock.PE > parseFloat(peMax))) return false;

      // ROE filter
      if (roeMin !== '' && (stock.ROE === null || stock.ROE < parseFloat(roeMin))) return false;

      // Dividend Yield filter
      if (divYieldMin !== '' && (stock["Dividend Yield"] === null || stock["Dividend Yield"] < parseFloat(divYieldMin))) return false;

      // DCF Upside filter
      if (upsideMin !== '' && (stock.dcf?.upside === null || stock.dcf?.upside < parseFloat(upsideMin))) return false;

      // GICS Classification filters (Bloomberg/MSCI Standard)
      if (gicsSectorFilter !== 'all' && stock["GICS Sector"] !== gicsSectorFilter) return false;
      if (gicsIndustryGroupFilter !== 'all' && stock["GICS Industry Group"] !== gicsIndustryGroupFilter) return false;
      if (gicsSubIndustryFilter !== 'all' && stock["GICS Sub-Industry"] !== gicsSubIndustryFilter) return false;

      return true;
    }).sort((a, b) => {
      let comparison = 0;

      // Get values for comparison
      const getValue = (stock, key) => {
        switch(key) {
          case 'score': return stock.natanScore?.total || 0;
          case 'marketcap': return stock["Market Cap"] || 0;
          case 'ytd': return stock["Company YTD Return"] || 0;
          case 'dcf': return stock.dcf?.upside || 0;
          case 'pe': return stock.PE || 999;
          case 'pb': return stock.PB || 999;
          case 'roe': return stock.ROE || 0;
          case 'price': return stock.Price || 0;
          case 'divyield': return stock["Dividend Yield"] || 0;
          default: return 0;
        }
      };

      const aVal = getValue(a, sortBy);
      const bVal = getValue(b, sortBy);
      comparison = bVal - aVal;

      // Apply sort direction
      return sortDirection === 'asc' ? -comparison : comparison;
    });

    console.log(`✅ Filtered to ${filtered.length} stocks`);
    return filtered;
  }, [ALL_STOCKS_DATA, minScore, selectedSector, selectedRegion, searchTerm, sortBy, sortDirection, marketCapFilter, peMin, peMax, roeMin, divYieldMin, upsideMin, gicsSectorFilter, gicsIndustryGroupFilter, gicsSubIndustryFilter]);

  const sectors = useMemo(() => {
    if (!ALL_STOCKS_DATA || ALL_STOCKS_DATA.length === 0) return ['all'];
    const sectorSet = new Set(ALL_STOCKS_DATA.map(s => s.sector).filter(Boolean));
    return ['all', ...Array.from(sectorSet).sort()];
  }, [ALL_STOCKS_DATA]);

  const regions = ['all', 'Indonesia', 'US'];

  // GICS Classification Options (Bloomberg/MSCI Standard)
  const gicsSectors = useMemo(() => {
    if (!ALL_STOCKS_DATA || ALL_STOCKS_DATA.length === 0) return ['all'];
    const sectorSet = new Set(ALL_STOCKS_DATA.map(s => s["GICS Sector"]).filter(Boolean));
    return ['all', ...Array.from(sectorSet).sort()];
  }, [ALL_STOCKS_DATA]);

  const gicsIndustryGroups = useMemo(() => {
    if (!ALL_STOCKS_DATA || ALL_STOCKS_DATA.length === 0) return ['all'];
    // Filter by selected GICS Sector if one is selected
    const filtered = gicsSectorFilter !== 'all'
      ? ALL_STOCKS_DATA.filter(s => s["GICS Sector"] === gicsSectorFilter)
      : ALL_STOCKS_DATA;
    const groupSet = new Set(filtered.map(s => s["GICS Industry Group"]).filter(Boolean));
    return ['all', ...Array.from(groupSet).sort()];
  }, [ALL_STOCKS_DATA, gicsSectorFilter]);

  const gicsSubIndustries = useMemo(() => {
    if (!ALL_STOCKS_DATA || ALL_STOCKS_DATA.length === 0) return ['all'];
    // Filter by selected GICS Sector and Industry Group
    let filtered = ALL_STOCKS_DATA;
    if (gicsSectorFilter !== 'all') {
      filtered = filtered.filter(s => s["GICS Sector"] === gicsSectorFilter);
    }
    if (gicsIndustryGroupFilter !== 'all') {
      filtered = filtered.filter(s => s["GICS Industry Group"] === gicsIndustryGroupFilter);
    }
    const subIndSet = new Set(filtered.map(s => s["GICS Sub-Industry"]).filter(Boolean));
    return ['all', ...Array.from(subIndSet).sort()];
  }, [ALL_STOCKS_DATA, gicsSectorFilter, gicsIndustryGroupFilter]);

  const statsData = useMemo(() => ({
    avgScore: filteredStocks.length > 0 ? (filteredStocks.reduce((sum, s) => sum + s.natanScore.total, 0) / filteredStocks.length).toFixed(1) : 0,
    strongBuy: filteredStocks.filter(s => s.natanScore.total >= 80).length,
    showing: filteredStocks.length,
    avgDCFUpside: filteredStocks.length > 0 ? (filteredStocks.reduce((sum, s) => sum + (s.dcf?.upside || 0), 0) / filteredStocks.length).toFixed(1) : 0
  }), [filteredStocks]);

  // Loading screen while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Global Equity Screener...</h2>
          <p className="text-slate-300">Loading 1,200+ global securities</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden ${theme.pageBg}`}>
      {/* Header - Clean & Minimal per Bloomberg UX standards */}
      <div className={`${theme.headerBg} border-b shadow-xl transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Global Equity Screener</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:block">Indonesia & US Markets</span>
              {/* Live Data Toggle */}
              <button
                onClick={toggleLiveData}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-300 ${
                  liveDataEnabled && liveServiceAvailable
                    ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-400'
                }`}
                title={liveDataEnabled ? 'Live data enabled - Click to disable' : 'Live data disabled - Click to enable'}
              >
                {liveDataEnabled && liveServiceAvailable ? (
                  <>
                    {liveQuoteLoading || marketOverviewLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Radio className="w-4 h-4 animate-pulse" />
                    )}
                    <span className="text-xs font-semibold hidden sm:inline">LIVE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span className="text-xs font-semibold hidden sm:inline">OFFLINE</span>
                  </>
                )}
              </button>
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`relative p-2 rounded-lg border transition-all duration-300 ${
                  darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 border-yellow-500/50 text-yellow-400'
                    : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300'
                }`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <div className="relative w-5 h-5">
                  <Sun
                    className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                      darkMode ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
                    }`}
                  />
                  <Moon
                    className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                      darkMode ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
                    }`}
                  />
                </div>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                title="Settings - Customize factor weights"
              >
                <Settings className="w-5 h-5" />
              </button>
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {ALL_STOCKS_DATA.length} Global Securities
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calculator className="w-4 h-4" />
              DCF & Comps Valuation
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              8-Factor Scoring
            </span>
            {lastLiveUpdate && liveDataEnabled && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Radio className="w-3 h-3" />
                  Live: {new Date(lastLiveUpdate).toLocaleTimeString()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* LIVE MARKET TICKER STRIP */}
      {liveDataEnabled && marketOverview && (
        <div className={`border-b overflow-hidden ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 py-2 overflow-x-auto scrollbar-hide">
              {/* Indices */}
              {marketOverview.indices?.map((index) => (
                <div key={index.symbol} className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium ${theme.textMuted}`}>{index.name}</span>
                  <span className={`text-sm font-bold ${theme.textPrimary}`}>
                    {index.price?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className={`text-xs font-semibold ${index.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {index.changePercent >= 0 ? '+' : ''}{index.changePercent?.toFixed(2)}%
                  </span>
                </div>
              ))}
              <div className={`w-px h-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
              {/* Key Commodities */}
              {marketOverview.commodities?.slice(0, 3).map((commodity) => (
                <div key={commodity.symbol} className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium ${theme.textMuted}`}>{commodity.name}</span>
                  <span className={`text-sm font-bold ${theme.textPrimary}`}>
                    ${commodity.price?.toFixed(2)}
                  </span>
                  <span className={`text-xs font-semibold ${commodity.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent?.toFixed(2)}%
                  </span>
                </div>
              ))}
              <div className={`w-px h-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
              {/* USD/IDR */}
              {marketOverview.currencies?.find(c => c.symbol === 'USDIDR=X') && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium ${theme.textMuted}`}>USD/IDR</span>
                  <span className={`text-sm font-bold ${theme.textPrimary}`}>
                    {marketOverview.currencies.find(c => c.symbol === 'USDIDR=X')?.price?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className={`text-xs font-semibold ${marketOverview.currencies.find(c => c.symbol === 'USDIDR=X')?.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {marketOverview.currencies.find(c => c.symbol === 'USDIDR=X')?.changePercent >= 0 ? '+' : ''}{marketOverview.currencies.find(c => c.symbol === 'USDIDR=X')?.changePercent?.toFixed(2)}%
                  </span>
                </div>
              )}
              {/* Countdown & Refresh */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {autoRefreshEnabled && (
                  <span className={`text-[10px] font-mono ${theme.textMuted}`}>
                    {refreshCountdown}s
                  </span>
                )}
                <button
                  onClick={() => {
                    refreshMarketOverview();
                    setRefreshCountdown(REFRESH_INTERVAL / 1000);
                  }}
                  disabled={marketOverviewLoading}
                  className={`p-1.5 rounded-md transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
                  title="Refresh now"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${marketOverviewLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Tabs */}
        <div className={`rounded-xl shadow-2xl border mb-6 transition-colors duration-300 ${theme.cardBg}`}>
          <div className={`flex border-b overflow-x-auto ${theme.border}`}>
            {[
              { id: 'macro', label: '🇮🇩 Macro Dashboard', icon: Activity },
              { id: 'screener', label: 'Equity Screener', icon: Search },
              { id: 'watchlist', label: `Watchlist (${watchlist.length})`, icon: Star },
              { id: 'heatmap', label: 'Sector Heatmap', icon: Grid3X3 },
              { id: 'valuation', label: 'DCF Valuation', icon: Calculator },
              { id: 'financials', label: 'Financials', icon: FileText },
              { id: 'comps', label: 'Comparable Analysis', icon: BarChart3 },
              { id: 'backtest', label: 'Backtesting', icon: History },
              { id: 'fig', label: 'FIG Valuation', icon: Building2 },
              { id: 'news', label: 'Market News', icon: Newspaper },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap ${
                    activeView === tab.id ? theme.tabActive : theme.tabInactive
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {/* INSTITUTIONAL-GRADE MACRO DASHBOARD */}
            {activeView === 'macro' && (
              <div className="space-y-6">
                {/* Header with Refresh */}
                <div className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-xl p-6 text-white shadow-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-3xl font-black flex items-center gap-3">
                      <Activity className="w-8 h-8" />
                      Global Economic Dashboard
                    </h2>
                    <button
                      onClick={refreshMacroData}
                      disabled={macroLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${macroLoading ? 'animate-spin' : ''}`} />
                      {macroLoading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                  </div>
                  <p className="text-slate-300 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Last Updated: {formatLastUpdated(macroLastUpdated)} • Sources: BPS, Bank Indonesia, Federal Reserve, PBOC, BOJ, Bloomberg
                  </p>
                </div>

                {/* GLOBAL RISK INDICATORS */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                    <Globe className={`w-6 h-6 ${theme.textMuted}`} />
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Global Risk Indicators</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Market Sentiment & Risk Appetite Metrics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>VIX</div>
                      <div className={`text-2xl font-bold ${macroData.risk.vix < 20 ? 'text-emerald-500' : macroData.risk.vix < 30 ? 'text-amber-500' : 'text-red-500'}`}>
                        {macroData.risk.vix}
                      </div>
                      <div className={`text-xs font-medium mt-1 ${macroData.risk.vix < 20 ? 'text-emerald-500' : macroData.risk.vix < 30 ? 'text-amber-500' : 'text-red-500'}`}>
                        {macroData.risk.vix < 15 ? 'Very Low' : macroData.risk.vix < 20 ? 'Low' : macroData.risk.vix < 30 ? 'Elevated' : 'High'}
                      </div>
                    </div>
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>DXY (Dollar)</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.risk.dxy}</div>
                      <div className={`text-xs font-medium mt-1 ${theme.textMuted}`}>{macroData.risk.dxyTrend}</div>
                    </div>
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>Gold</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>${macroData.commodities.gold.toFixed(0)}</div>
                      <div className="text-xs font-medium text-emerald-500 mt-1">+{macroData.commodities.goldChange}% YTD</div>
                    </div>
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>EMBI Spread</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.risk.embiSpread}</div>
                      <div className={`text-xs font-medium mt-1 ${theme.textMuted}`}>bps • {macroData.risk.embiTrend}</div>
                    </div>
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>US 10Y-2Y</div>
                      <div className={`text-2xl font-bold ${macroData.unitedStates.yieldCurve > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {macroData.unitedStates.yieldCurve > 0 ? '+' : ''}{(macroData.unitedStates.yieldCurve * 100).toFixed(0)}bp
                      </div>
                      <div className={`text-xs font-medium mt-1 ${macroData.unitedStates.yieldCurve > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {macroData.unitedStates.yieldCurve > 0 ? 'Normal' : 'Inverted'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* INDONESIA SECTION */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                    <span className="text-2xl">🇮🇩</span>
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Indonesia</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Southeast Asia's Largest Economy • GDP: $1.4T</p>
                    </div>
                  </div>

                  {/* Key Indicators Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>GDP Growth</div>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-3xl font-bold text-emerald-500 mb-1">{INDONESIA_MACRO.gdpGrowth}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>Q3 2025 YoY</div>
                      <div className={`text-xs mt-2 pt-2 border-t ${theme.border} ${theme.textMuted}`}>
                        Full Year Est: {INDONESIA_MACRO.annualGDP}%
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>Inflation</div>
                      </div>
                      <div className={`text-3xl font-bold ${theme.textPrimary} mb-1`}>{INDONESIA_MACRO.inflation}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>October 2025 YoY</div>
                      <div className={`text-xs mt-2 pt-2 border-t ${theme.border} ${theme.textMuted}`}>
                        Target: 1.5-3.5%
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>BI Rate</div>
                        <TrendingDown className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className={`text-3xl font-bold ${theme.textPrimary} mb-1`}>{INDONESIA_MACRO.biRate}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>November 2025</div>
                      <div className={`text-xs mt-2 pt-2 border-t ${theme.border} text-blue-500`}>
                        Cut 25bps (easing)
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>JCI Index</div>
                        {macroData.indonesia.stockIndexChange >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className={`text-3xl font-bold ${theme.textPrimary} mb-1`}>{macroData.indonesia.stockIndex?.toLocaleString(undefined, {maximumFractionDigits: 0}) || INDONESIA_MACRO.jciIndex.toFixed(0)}</div>
                      <div className={`text-xs font-medium flex items-center gap-1 ${theme.textMuted}`}>
                        <Clock className="w-3 h-3" />
                        {formatIndexDate(macroData.indonesia.stockIndexDate)}
                      </div>
                      <div className={`flex items-center justify-between mt-2 pt-2 border-t ${theme.border}`}>
                        <span className={`text-xs font-semibold ${macroData.indonesia.stockIndexChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.indonesia.stockIndexChange >= 0 ? '+' : ''}{macroData.indonesia.stockIndexChange?.toFixed(2) || 0}% Today
                        </span>
                        <span className="text-xs text-emerald-600 font-bold">+{macroData.indonesia.stockYTD}% YTD</span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>USD/IDR</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.indonesia.currency?.toLocaleString() || INDONESIA_MACRO.usdIdr.toLocaleString()}</div>
                      <div className="text-xs text-emerald-500 font-medium mt-1">Stronger</div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Reserves</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>${macroData.indonesia.reserves}B</div>
                      <div className={`text-xs mt-1 ${theme.textMuted}`}>Foreign FX</div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>10Y Bond</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.indonesia.bond10Y}%</div>
                      <div className={`text-xs mt-1 ${theme.textMuted}`}>Govt Yield</div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>PMI</div>
                      <div className={`text-2xl font-bold ${macroData.indonesia.pmi >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>{macroData.indonesia.pmi}</div>
                      <div className={`text-xs font-medium mt-1 ${macroData.indonesia.pmi >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {macroData.indonesia.pmi >= 50 ? 'Expansion' : 'Contraction'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* UNITED STATES SECTION */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                    <span className="text-2xl">{macroData.unitedStates.flag}</span>
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>United States</h3>
                      <p className={`text-sm ${theme.textMuted}`}>World's Largest Economy • {macroData.unitedStates.gdpSize} • Fed Policy Drives EM Capital Flows</p>
                    </div>
                  </div>

                  {/* Key Indicators Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>GDP Growth</div>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-3xl font-bold text-emerald-500 mb-1">{macroData.unitedStates.gdpGrowth}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>Q3 2025 YoY</div>
                      <div className={`text-xs mt-2 pt-2 border-t ${theme.border} ${theme.textMuted}`}>
                        Revised: {macroData.unitedStates.gdpRevised}%
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>CPI Inflation</div>
                      </div>
                      <div className={`text-3xl font-bold ${theme.textPrimary} mb-1`}>{macroData.unitedStates.inflation}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>November 2025 YoY</div>
                      <div className={`text-xs mt-2 pt-2 border-t ${theme.border} ${theme.textMuted}`}>
                        Core: {macroData.unitedStates.inflationCore}% | Target: {macroData.unitedStates.inflationTarget}
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>{macroData.unitedStates.centralBankName}</div>
                        <TrendingDown className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className={`text-3xl font-bold ${theme.textPrimary} mb-1`}>{macroData.unitedStates.centralBankRate}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>December 2025</div>
                      <div className={`text-xs mt-2 pt-2 border-t ${theme.border} text-blue-500`}>
                        {macroData.unitedStates.rateChange > 0 ? '+' : ''}{(macroData.unitedStates.rateChange * 100).toFixed(0)}bps YTD (easing)
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>{macroData.unitedStates.stockIndexName}</div>
                        {macroData.unitedStates.stockIndexChange >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className={`text-3xl font-bold ${theme.textPrimary} mb-1`}>{macroData.unitedStates.stockIndex?.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                      <div className={`text-xs font-medium flex items-center gap-1 ${theme.textMuted}`}>
                        <Clock className="w-3 h-3" />
                        {formatIndexDate(macroData.unitedStates.stockIndexDate)}
                      </div>
                      <div className={`flex items-center justify-between mt-2 pt-2 border-t ${theme.border}`}>
                        <span className={`text-xs font-semibold ${macroData.unitedStates.stockIndexChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.unitedStates.stockIndexChange >= 0 ? '+' : ''}{macroData.unitedStates.stockIndexChange?.toFixed(2) || 0}% Today
                        </span>
                        <span className="text-xs text-emerald-600 font-bold">+{macroData.unitedStates.stockYTD}% YTD</span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>10Y Treasury</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.unitedStates.bond10Y}%</div>
                      <div className={`text-xs mt-1 ${theme.textMuted}`}>Yield</div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Unemployment</div>
                      <div className="text-2xl font-bold text-emerald-500">{macroData.unitedStates.unemployment}%</div>
                      <div className="text-xs text-emerald-500 font-medium mt-1">Labor Market Strong</div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>PMI</div>
                      <div className={`text-2xl font-bold ${macroData.unitedStates.pmi >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>{macroData.unitedStates.pmi}</div>
                      <div className={`text-xs font-medium mt-1 ${macroData.unitedStates.pmi >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {macroData.unitedStates.pmi >= 50 ? 'Expansion' : 'Contraction'}
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Consumer Conf.</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.unitedStates.consumerConfidence}</div>
                      <div className={`text-xs mt-1 ${theme.textMuted}`}>Conference Board</div>
                    </div>
                  </div>
                </div>

                {/* CHINA SECTION */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                    <span className="text-2xl">{macroData.china.flag}</span>
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>China</h3>
                      <p className={`text-sm ${theme.textMuted}`}>{macroData.china.gdpSize} • Indonesia's #1 Trading Partner (23% of Exports) • Commodity Demand Driver</p>
                    </div>
                  </div>

                  {/* Key Indicators Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>GDP Growth</div>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-3xl font-bold text-emerald-500 mb-1">{macroData.china.gdpGrowth}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>Q3 2025 YoY</div>
                      <div className={`text-xs mt-2 pt-2 border-t ${theme.border} ${theme.textMuted}`}>
                        Target: {macroData.china.gdpTarget}
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>CPI / PPI</div>
                      </div>
                      <div className={`text-3xl font-bold ${theme.textPrimary} mb-1`}>{macroData.china.inflation}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>CPI YoY (Deflation Risk)</div>
                      <div className={`text-xs mt-2 pt-2 border-t ${theme.border} text-red-500`}>
                        PPI: {macroData.china.ppi}% (Deflation)
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>{macroData.china.centralBankName}</div>
                        <TrendingDown className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className={`text-3xl font-bold ${theme.textPrimary} mb-1`}>{macroData.china.centralBankRate}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>PBOC Policy Rate</div>
                      <div className={`text-xs mt-2 pt-2 border-t ${theme.border} text-blue-500`}>
                        {macroData.china.rateChange > 0 ? '+' : ''}{(macroData.china.rateChange * 100).toFixed(0)}bps (stimulus)
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs uppercase font-semibold tracking-wide ${theme.textMuted}`}>{macroData.china.stockIndexName}</div>
                        {macroData.china.stockIndexChange >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className={`text-3xl font-bold ${theme.textPrimary} mb-1`}>{macroData.china.stockIndex?.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                      <div className={`text-xs font-medium flex items-center gap-1 ${theme.textMuted}`}>
                        <Clock className="w-3 h-3" />
                        {formatIndexDate(macroData.china.stockIndexDate)}
                      </div>
                      <div className={`flex items-center justify-between mt-2 pt-2 border-t ${theme.border}`}>
                        <span className={`text-xs font-semibold ${macroData.china.stockIndexChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.china.stockIndexChange >= 0 ? '+' : ''}{macroData.china.stockIndexChange?.toFixed(2) || 0}% Today
                        </span>
                        <span className="text-xs text-emerald-600 font-bold">+{macroData.china.stockYTD}% YTD</span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Hang Seng (HSI)</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.china.hsi?.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                      <div className={`text-xs mt-1 flex items-center gap-1 ${theme.textMuted}`}>
                        <Clock className="w-3 h-3" />
                        {formatIndexDate(macroData.china.hsiDate)}
                        <span className={`ml-1 font-semibold ${macroData.china.hsiChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          ({macroData.china.hsiChange >= 0 ? '+' : ''}{macroData.china.hsiChange?.toFixed(2) || 0}%)
                        </span>
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>USD/CNY</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.china.currency}</div>
                      <div className={`text-xs mt-1 ${theme.textMuted}`}>Yuan Exchange</div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Caixin PMI</div>
                      <div className={`text-2xl font-bold ${macroData.china.caixinPmi >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>{macroData.china.caixinPmi}</div>
                      <div className={`text-xs font-medium mt-1 ${macroData.china.caixinPmi >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {macroData.china.caixinPmi >= 50 ? 'Expansion' : 'Contraction'}
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Industrial Prod.</div>
                      <div className="text-2xl font-bold text-emerald-500">{macroData.china.industrialProduction}%</div>
                      <div className={`text-xs mt-1 ${theme.textMuted}`}>YoY Growth</div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Trade Balance</div>
                      <div className="text-2xl font-bold text-emerald-500">${macroData.china.tradeBalance}B</div>
                      <div className="text-xs text-emerald-500 font-medium mt-1">Surplus</div>
                    </div>
                  </div>
                </div>

                {/* KEY COMMODITIES - Critical for Indonesia */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Key Commodities</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Critical for Indonesia: Coal (#1 Exporter), Palm Oil (#1 Producer), Nickel (EV Batteries)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Coal */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>Newcastle Coal</div>
                      <div className={`text-3xl font-bold ${theme.textPrimary}`}>${macroData.commodities.newcastleCoal}</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>/tonne</div>
                      <div className={`flex items-center justify-between mt-2 pt-2 border-t ${theme.border}`}>
                        <span className={`text-xs font-semibold ${macroData.commodities.coalDaily >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.coalDaily >= 0 ? '+' : ''}{macroData.commodities.coalDaily}% Day
                        </span>
                        <span className={`text-xs font-semibold ${macroData.commodities.coalChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.coalChange >= 0 ? '+' : ''}{macroData.commodities.coalChange}% YTD
                        </span>
                      </div>
                    </div>

                    {/* Palm Oil */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>CPO (Palm Oil)</div>
                      <div className={`text-3xl font-bold ${theme.textPrimary}`}>{macroData.commodities.palmOil.toLocaleString()}</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>MYR/tonne</div>
                      <div className={`flex items-center justify-between mt-2 pt-2 border-t ${theme.border}`}>
                        <span className={`text-xs font-semibold ${macroData.commodities.palmOilDaily >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.palmOilDaily >= 0 ? '+' : ''}{macroData.commodities.palmOilDaily}% Day
                        </span>
                        <span className={`text-xs font-semibold ${macroData.commodities.palmOilChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.palmOilChange >= 0 ? '+' : ''}{macroData.commodities.palmOilChange}% YTD
                        </span>
                      </div>
                    </div>

                    {/* Nickel */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>Nickel (LME)</div>
                      <div className={`text-3xl font-bold ${theme.textPrimary}`}>${macroData.commodities.nickel.toLocaleString()}</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>/tonne</div>
                      <div className={`flex items-center justify-between mt-2 pt-2 border-t ${theme.border}`}>
                        <span className={`text-xs font-semibold ${macroData.commodities.nickelDaily >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.nickelDaily >= 0 ? '+' : ''}{macroData.commodities.nickelDaily}% Day
                        </span>
                        <span className={`text-xs font-semibold ${macroData.commodities.nickelChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.nickelChange >= 0 ? '+' : ''}{macroData.commodities.nickelChange}% YTD
                        </span>
                      </div>
                    </div>

                    {/* Brent Oil */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>Brent Crude</div>
                      <div className={`text-3xl font-bold ${theme.textPrimary}`}>${macroData.commodities.brentCrude}</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>/barrel</div>
                      <div className={`flex items-center justify-between mt-2 pt-2 border-t ${theme.border}`}>
                        <span className={`text-xs font-semibold ${macroData.commodities.brentDaily >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.brentDaily >= 0 ? '+' : ''}{macroData.commodities.brentDaily}% Day
                        </span>
                        <span className={`text-xs font-semibold ${macroData.commodities.brentChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.brentChange >= 0 ? '+' : ''}{macroData.commodities.brentChange}% YTD
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {/* Gold */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Gold</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>${macroData.commodities.gold.toFixed(0)}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs font-semibold ${macroData.commodities.goldDaily >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.goldDaily >= 0 ? '+' : ''}{macroData.commodities.goldDaily}%
                        </span>
                        <span className={`text-xs font-semibold ${macroData.commodities.goldChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.goldChange >= 0 ? '+' : ''}{macroData.commodities.goldChange}% YTD
                        </span>
                      </div>
                    </div>

                    {/* Silver */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Silver</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>${macroData.commodities.silver}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs font-semibold ${macroData.commodities.silverDaily >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.silverDaily >= 0 ? '+' : ''}{macroData.commodities.silverDaily}%
                        </span>
                        <span className={`text-xs font-semibold ${macroData.commodities.silverChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.silverChange >= 0 ? '+' : ''}{macroData.commodities.silverChange}% YTD
                        </span>
                      </div>
                    </div>

                    {/* Copper */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Copper</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>${macroData.commodities.copper.toLocaleString()}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs font-semibold ${macroData.commodities.copperDaily >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.copperDaily >= 0 ? '+' : ''}{macroData.commodities.copperDaily}%
                        </span>
                        <span className={`text-xs font-semibold ${macroData.commodities.copperChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.copperChange >= 0 ? '+' : ''}{macroData.commodities.copperChange}% YTD
                        </span>
                      </div>
                    </div>

                    {/* Iron Ore */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Iron Ore</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>${macroData.commodities.ironOre}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs font-semibold ${macroData.commodities.ironOreDaily >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.ironOreDaily >= 0 ? '+' : ''}{macroData.commodities.ironOreDaily}%
                        </span>
                        <span className={`text-xs font-semibold ${macroData.commodities.ironOreChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.ironOreChange >= 0 ? '+' : ''}{macroData.commodities.ironOreChange}% YTD
                        </span>
                      </div>
                    </div>

                    {/* Natural Gas */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Nat Gas</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>${macroData.commodities.natGas}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs font-semibold ${macroData.commodities.natGasDaily >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.natGasDaily >= 0 ? '+' : ''}{macroData.commodities.natGasDaily}%
                        </span>
                        <span className={`text-xs font-semibold ${macroData.commodities.natGasChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.natGasChange >= 0 ? '+' : ''}{macroData.commodities.natGasChange}% YTD
                        </span>
                      </div>
                    </div>

                    {/* Tin */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Tin (LME)</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>${(macroData.commodities.tin / 1000).toFixed(1)}k</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs font-semibold ${macroData.commodities.tinDaily >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.tinDaily >= 0 ? '+' : ''}{macroData.commodities.tinDaily}%
                        </span>
                        <span className={`text-xs font-semibold ${macroData.commodities.tinChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.commodities.tinChange >= 0 ? '+' : ''}{macroData.commodities.tinChange}% YTD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GLOBAL BONDS & YIELDS */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Global Bonds & Yields</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Treasury yields drive EM capital flows • Yield differentials affect USD/IDR</p>
                    </div>
                  </div>

                  {/* US Treasuries - Primary Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>US 2Y Treasury</div>
                      <div className={`text-3xl font-bold ${theme.textPrimary}`}>{macroData.bonds.us2Y}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>Yield</div>
                      <div className={`text-sm font-semibold mt-2 pt-2 border-t ${theme.border} ${macroData.bonds.us2YDaily >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {macroData.bonds.us2YDaily >= 0 ? '+' : ''}{Math.abs(macroData.bonds.us2YDaily * 100).toFixed(0)}bps today
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>US 10Y Treasury</div>
                      <div className={`text-3xl font-bold ${theme.textPrimary}`}>{macroData.bonds.us10Y}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>Benchmark</div>
                      <div className={`text-sm font-semibold mt-2 pt-2 border-t ${theme.border} ${macroData.bonds.us10YDaily >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {macroData.bonds.us10YDaily >= 0 ? '+' : ''}{Math.abs(macroData.bonds.us10YDaily * 100).toFixed(0)}bps today
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>Indonesia 10Y</div>
                      <div className={`text-3xl font-bold ${theme.textPrimary}`}>{macroData.bonds.indo10Y}%</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>Govt Bond</div>
                      <div className={`text-sm font-semibold mt-2 pt-2 border-t ${theme.border} ${macroData.bonds.indo10YDaily >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {macroData.bonds.indo10YDaily >= 0 ? '+' : ''}{Math.abs(macroData.bonds.indo10YDaily * 100).toFixed(0)}bps today
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold tracking-wide mb-1 ${theme.textMuted}`}>Yield Spread</div>
                      <div className={`text-3xl font-bold ${theme.textPrimary}`}>{(macroData.bonds.indo10Y - macroData.bonds.us10Y).toFixed(0)}bps</div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>Indo - US 10Y</div>
                      <div className={`text-sm font-medium mt-2 pt-2 border-t ${theme.border} ${theme.textMuted}`}>
                        Carry Trade Incentive
                      </div>
                    </div>
                  </div>

                  {/* Secondary Bonds */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <div className={`rounded-lg p-3 border text-center ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>US 30Y</div>
                      <div className={`text-xl font-bold ${theme.textPrimary}`}>{macroData.bonds.us30Y}%</div>
                      <div className={`text-xs font-semibold ${macroData.bonds.us30YDaily >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {macroData.bonds.us30YDaily >= 0 ? '+' : ''}{Math.abs(macroData.bonds.us30YDaily * 100).toFixed(0)}bp
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 border text-center ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Indo 5Y</div>
                      <div className={`text-xl font-bold ${theme.textPrimary}`}>{macroData.bonds.indo5Y}%</div>
                      <div className={`text-xs font-semibold ${macroData.bonds.indo5YDaily >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {macroData.bonds.indo5YDaily >= 0 ? '+' : ''}{Math.abs(macroData.bonds.indo5YDaily * 100).toFixed(0)}bp
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 border text-center ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>China 10Y</div>
                      <div className={`text-xl font-bold ${theme.textPrimary}`}>{macroData.bonds.china10Y}%</div>
                      <div className={`text-xs font-semibold ${macroData.bonds.china10YDaily >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {macroData.bonds.china10YDaily >= 0 ? '+' : ''}{Math.abs(macroData.bonds.china10YDaily * 100).toFixed(0)}bp
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 border text-center ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Japan 10Y</div>
                      <div className={`text-xl font-bold ${theme.textPrimary}`}>{macroData.bonds.japan10Y}%</div>
                      <div className={`text-xs font-semibold ${macroData.bonds.japan10YDaily >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {macroData.bonds.japan10YDaily >= 0 ? '+' : ''}{Math.abs(macroData.bonds.japan10YDaily * 100).toFixed(0)}bp
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 border text-center ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Germany 10Y</div>
                      <div className={`text-xl font-bold ${theme.textPrimary}`}>{macroData.bonds.germany10Y}%</div>
                      <div className={`text-xs font-semibold ${macroData.bonds.germany10YDaily >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {macroData.bonds.germany10YDaily >= 0 ? '+' : ''}{Math.abs(macroData.bonds.germany10YDaily * 100).toFixed(0)}bp
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 border text-center ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>US Curve</div>
                      <div className={`text-xl font-bold ${macroData.bonds.usYieldCurve >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {macroData.bonds.usYieldCurve >= 0 ? '+' : ''}{(macroData.bonds.usYieldCurve * 100).toFixed(0)}bp
                      </div>
                      <div className={`text-xs font-medium ${theme.textMuted}`}>
                        {macroData.bonds.usYieldCurve >= 0 ? 'Normal' : 'Inverted'}
                      </div>
                    </div>
                  </div>

                  {/* Credit Spreads */}
                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t ${theme.border}`}>
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>EMBI Spread</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.bonds.embiSpread}bp</div>
                      <div className={`text-xs font-semibold mt-1 ${macroData.bonds.embiDaily <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {macroData.bonds.embiDaily > 0 ? '+' : ''}{macroData.bonds.embiDaily}bp today
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>HY Spread</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.bonds.highYieldSpread}bp</div>
                      <div className={`text-xs font-semibold mt-1 ${macroData.bonds.highYieldDaily <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {macroData.bonds.highYieldDaily > 0 ? '+' : ''}{macroData.bonds.highYieldDaily}bp today
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>VIX (Fear)</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.risk.vix}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold ${macroData.risk.vixDaily <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {macroData.risk.vixDaily > 0 ? '+' : ''}{macroData.risk.vixDaily}
                        </span>
                        <span className={`text-xs font-medium ${
                          macroData.risk.vix < 15 ? 'text-emerald-500' :
                          macroData.risk.vix < 20 ? 'text-amber-500' :
                          'text-red-500'
                        }`}>{macroData.risk.vixLevel}</span>
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>DXY (Dollar)</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>{macroData.risk.dxy}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold ${macroData.risk.dxyDaily >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {macroData.risk.dxyDaily >= 0 ? '+' : ''}{macroData.risk.dxyDaily}%
                        </span>
                        <span className={`text-xs font-medium ${theme.textMuted}`}>{macroData.risk.dxyTrend}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* JAPAN & REGIONAL */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Asia Pacific & Regional</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Japan (Major FDI), Singapore (ASEAN Hub), India (Palm Oil Importer)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Japan */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{macroData.japan.flag}</span>
                        <span className={`font-semibold ${theme.textPrimary}`}>Japan ({macroData.japan.gdpSize})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className={`text-xs uppercase font-medium ${theme.textMuted}`}>GDP Growth</div>
                          <div className={`font-bold ${theme.textPrimary}`}>{macroData.japan.gdpGrowth}%</div>
                        </div>
                        <div>
                          <div className={`text-xs uppercase font-medium ${theme.textMuted}`}>BOJ Rate</div>
                          <div className={`font-bold ${theme.textPrimary}`}>{macroData.japan.centralBankRate}%</div>
                        </div>
                        <div className={`col-span-2 rounded-lg p-2 border ${theme.cardBg}`}>
                          <div className={`text-xs flex items-center gap-1 ${theme.textMuted}`}>Nikkei 225 <span>({formatIndexDate(macroData.japan.stockIndexDate)})</span></div>
                          <div className="flex items-center justify-between">
                            <span className={`font-bold ${theme.textPrimary}`}>
                              {macroData.japan.stockIndex?.toLocaleString(undefined, {maximumFractionDigits: 0})}
                            </span>
                            <span className={`text-xs font-semibold ${macroData.japan.stockIndexChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {macroData.japan.stockIndexChange >= 0 ? '+' : ''}{macroData.japan.stockIndexChange?.toFixed(2) || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Singapore */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{macroData.singapore.flag}</span>
                        <span className={`font-semibold ${theme.textPrimary}`}>Singapore ({macroData.singapore.gdpSize})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className={`text-xs uppercase font-medium ${theme.textMuted}`}>GDP Growth</div>
                          <div className={`font-bold ${theme.textPrimary}`}>{macroData.singapore.gdpGrowth}%</div>
                        </div>
                        <div>
                          <div className={`text-xs uppercase font-medium ${theme.textMuted}`}>Inflation</div>
                          <div className={`font-bold ${theme.textPrimary}`}>{macroData.singapore.inflation}%</div>
                        </div>
                        <div className={`col-span-2 rounded-lg p-2 border ${theme.cardBg}`}>
                          <div className={`text-xs flex items-center gap-1 ${theme.textMuted}`}>STI Index <span>({formatIndexDate(macroData.singapore.stockIndexDate)})</span></div>
                          <div className="flex items-center justify-between">
                            <span className={`font-bold ${theme.textPrimary}`}>
                              {macroData.singapore.stockIndex?.toLocaleString(undefined, {maximumFractionDigits: 0})}
                            </span>
                            <span className={`text-xs font-semibold ${macroData.singapore.stockIndexChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {macroData.singapore.stockIndexChange >= 0 ? '+' : ''}{macroData.singapore.stockIndexChange?.toFixed(2) || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* India */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{macroData.india.flag}</span>
                        <span className={`font-semibold ${theme.textPrimary}`}>India ({macroData.india.gdpSize})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className={`text-xs uppercase font-medium ${theme.textMuted}`}>GDP Growth</div>
                          <div className="font-bold text-emerald-500">{macroData.india.gdpGrowth}%</div>
                        </div>
                        <div>
                          <div className={`text-xs uppercase font-medium ${theme.textMuted}`}>PMI</div>
                          <div className={`font-bold ${macroData.india.pmi >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>{macroData.india.pmi}</div>
                        </div>
                        <div className={`col-span-2 rounded-lg p-2 border ${theme.cardBg}`}>
                          <div className={`text-xs flex items-center gap-1 ${theme.textMuted}`}>Sensex <span>({formatIndexDate(macroData.india.stockIndexDate)})</span></div>
                          <div className="flex items-center justify-between">
                            <span className={`font-bold ${theme.textPrimary}`}>
                              {(macroData.india.stockIndex / 1000).toFixed(1)}K
                            </span>
                            <span className={`text-xs font-semibold ${macroData.india.stockIndexChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {macroData.india.stockIndexChange >= 0 ? '+' : ''}{macroData.india.stockIndexChange?.toFixed(2) || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LIVE MARKET CHARTS - Global Indices */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                    <BarChart3 className={`w-6 h-6 ${theme.textPrimary}`} />
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Live Global Market Charts</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Real-time indices, currencies & commodities • Powered by TradingView</p>
                    </div>
                  </div>

                  {/* Stock Indices Row */}
                  <h4 className={`font-semibold mb-3 text-sm uppercase tracking-wide ${theme.textMuted}`}>Stock Indices</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* S&P 500 Chart */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme.textPrimary}`}>
                        <span className="text-lg">🇺🇸</span> S&P 500
                      </h4>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_spx&symbol=FOREXCOM%3ASPXUSD&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=America%2FNew_York&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="S&P 500 Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Shanghai Composite Chart */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme.textPrimary}`}>
                        <span className="text-lg">🇨🇳</span> Shanghai Composite
                      </h4>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_sse&symbol=SSE%3A000001&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Asia%2FShanghai&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="Shanghai Composite Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* JCI Chart */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme.textPrimary}`}>
                        <span className="text-lg">🇮🇩</span> JCI (Jakarta)
                      </h4>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_jkse&symbol=IDX%3ACOMPOSITE&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Asia%2FJakarta&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="JCI Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Indices Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Hang Seng Chart */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme.textPrimary}`}>
                        <span className="text-lg">🇭🇰</span> Hang Seng
                      </h4>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_hsi&symbol=HSI%3AHSI&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Asia%2FHong_Kong&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="Hang Seng Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Sensex Chart */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme.textPrimary}`}>
                        <span className="text-lg">🇮🇳</span> BSE Sensex
                      </h4>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_sensex&symbol=BSE%3ASENSEX&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Asia%2FKolkata&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="Sensex Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Currencies Row */}
                  <h4 className={`font-semibold mb-3 text-sm uppercase tracking-wide ${theme.textMuted}`}>Key Currencies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* USD/IDR Chart */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme.textPrimary}`}>
                        <span className="text-lg">🇮🇩</span> USD/IDR
                      </h4>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_usdidr&symbol=FX_IDC%3AUSDIDR&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Asia%2FJakarta&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="USD/IDR Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* USD/JPY Chart */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme.textPrimary}`}>
                        <span className="text-lg">🇯🇵</span> USD/JPY
                      </h4>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_usdjpy&symbol=FX%3AUSDJPY&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Asia%2FTokyo&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="USD/JPY Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* USD/CNY Chart */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme.textPrimary}`}>
                        <span className="text-lg">🇨🇳</span> USD/CNY
                      </h4>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_usdcny&symbol=FX%3AUSDCNH&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Asia%2FShanghai&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="USD/CNY Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Commodities Row */}
                  <h4 className={`font-semibold mb-3 text-sm uppercase tracking-wide ${theme.textMuted}`}>Key Commodities (Indonesia Focus)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Brent Crude Chart */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme.textPrimary}`}>
                        Brent Crude Oil
                      </h4>
                      <div className="h-56 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_brent&symbol=TVC%3AUKOIL&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=America%2FNew_York&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="Brent Crude Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Gold Chart */}
                    <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme.textPrimary}`}>
                        Gold
                      </h4>
                      <div className="h-56 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_gold&symbol=OANDA%3AXAUUSD&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=America%2FNew_York&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="Gold Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  <p className={`text-xs mt-4 text-center ${theme.textMuted}`}>
                    Charts provided by TradingView • Real-time data from global exchanges • For informational purposes only
                  </p>
                </div>

                {/* INSTITUTIONAL OUTLOOK */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-800 to-slate-900'} text-white`}>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Global Market Outlook & Investment Thesis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Indonesia */}
                    <div>
                      <h4 className="font-bold text-emerald-400 mb-3 text-sm uppercase tracking-wide">🇮🇩 Indonesia: Constructive</h4>
                      <ul className="space-y-2 text-sm text-slate-200">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>GDP:</strong> Strong {macroData.indonesia.gdpGrowth}% growth on infrastructure & consumption</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>Inflation:</strong> Well-contained at {macroData.indonesia.inflation}%, BI has room to cut</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>JCI:</strong> +{macroData.indonesia.stockYTD}% YTD, attractive post-correction valuations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400">△</span>
                          <span><strong>Risk:</strong> IDR stability dependent on Fed & China demand</span>
                        </li>
                      </ul>
                    </div>
                    {/* United States */}
                    <div>
                      <h4 className="font-bold text-blue-400 mb-3 text-sm uppercase tracking-wide">🇺🇸 United States: Positive</h4>
                      <ul className="space-y-2 text-sm text-slate-200">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>GDP:</strong> Resilient {macroData.unitedStates.gdpGrowth}% growth despite higher rates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>Fed:</strong> Rate cuts to {macroData.unitedStates.centralBankRate}%, supporting risk assets</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>S&P 500:</strong> +{macroData.unitedStates.stockYTD}% YTD, AI-driven momentum</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400">△</span>
                          <span><strong>Risk:</strong> Elevated valuations, geopolitical tensions</span>
                        </li>
                      </ul>
                    </div>
                    {/* China */}
                    <div>
                      <h4 className="font-bold text-red-400 mb-3 text-sm uppercase tracking-wide">🇨🇳 China: Cautious</h4>
                      <ul className="space-y-2 text-sm text-slate-200">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400">△</span>
                          <span><strong>GDP:</strong> {macroData.china.gdpGrowth}% below {macroData.china.gdpTarget} target, stimulus ongoing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">✗</span>
                          <span><strong>Deflation:</strong> CPI {macroData.china.inflation}%, PPI {macroData.china.ppi}% deflationary</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>Shanghai:</strong> +{macroData.china.stockYTD}% YTD on stimulus hopes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">✗</span>
                          <span><strong>Risk:</strong> Property sector, weak demand affects ID exports</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Commodities Outlook */}
                  <div className="mt-6 pt-6 border-t border-slate-600">
                    <h4 className="font-bold text-amber-400 mb-3 text-sm uppercase tracking-wide">📦 Commodity Outlook (Indonesia Impact)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className={`font-bold ${macroData.commodities.coalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Coal: </span>
                        <span className="text-slate-300">${macroData.commodities.newcastleCoal}/t ({macroData.commodities.coalChange >= 0 ? '+' : ''}{macroData.commodities.coalChange}% YTD)</span>
                      </div>
                      <div>
                        <span className={`font-bold ${macroData.commodities.palmOilChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Palm Oil: </span>
                        <span className="text-slate-300">${macroData.commodities.palmOil}/t ({macroData.commodities.palmOilChange >= 0 ? '+' : ''}{macroData.commodities.palmOilChange}% YTD)</span>
                      </div>
                      <div>
                        <span className={`font-bold ${macroData.commodities.nickelChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Nickel: </span>
                        <span className="text-slate-300">${macroData.commodities.nickel.toLocaleString()}/t ({macroData.commodities.nickelChange >= 0 ? '+' : ''}{macroData.commodities.nickelChange}% YTD)</span>
                      </div>
                      <div>
                        <span className={`font-bold ${macroData.commodities.brentChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Brent: </span>
                        <span className="text-slate-300">${macroData.commodities.brentCrude}/bbl ({macroData.commodities.brentChange >= 0 ? '+' : ''}{macroData.commodities.brentChange}% YTD)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-600">
                    <p className="text-sm text-slate-300">
                      <strong className="text-white">Investment Strategy:</strong> Overweight Indonesia banks & consumer discretionary on rate cuts.
                      In US, favor quality tech with strong FCF. Monitor China stimulus efficacy for Indonesia export recovery.
                      Commodities: Coal & palm oil benefiting from steady demand; nickel weak on EV supply glut.
                    </p>
                  </div>
                </div>

                {/* Data Sources Footer */}
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
                  <p className="text-xs text-slate-600 text-center">
                    <strong>Data Sources:</strong> BPS Statistics Indonesia • Bank Indonesia • Federal Reserve • PBOC • BOJ • Bloomberg • Trading Economics • TradingView
                  </p>
                </div>
              </div>
            )}

            {/* SCREENER - Continues in next part... */}
            {activeView === 'screener' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-bold mb-1 ${theme.textPrimary}`}>Global Equity Screener</h2>
                    <p className={`text-sm ${theme.textMuted}`}>
                      Multi-factor analysis • {ALL_STOCKS_DATA.length} securities • CFA/Damodaran methodology
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadExcel(filteredStocks, EXPORT_COLUMNS.screener, 'Equity_Screener', 'Screener')}
                      className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                      title="Export to Excel"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button
                      onClick={() => downloadCSV(filteredStocks, EXPORT_COLUMNS.screener, 'Equity_Screener')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      title="Export to CSV"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">CSV</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
                  <input
                    type="text"
                    placeholder="Search by ticker or company name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme.cardBg} ${theme.textPrimary}`}
                  />
                </div>

                {/* Primary Filters Row */}
                <div className={`grid grid-cols-1 sm:grid-cols-5 gap-4 p-4 rounded-lg border ${theme.cardBg}`}>
                  <div>
                    <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Min Score</label>
                    <select
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${theme.cardBg} ${theme.textPrimary}`}
                    >
                      <option value="0">All (0+)</option>
                      <option value="80">Strong Buy (80+)</option>
                      <option value="70">Buy (70+)</option>
                      <option value="55">Hold (55+)</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Region</label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${theme.cardBg} ${theme.textPrimary}`}
                    >
                      {regions.map(r => (
                        <option key={r} value={r}>{r === 'all' ? 'All Markets' : r === 'Indonesia' ? '🇮🇩 Indonesia' : '🇺🇸 United States'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Sector</label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${theme.cardBg} ${theme.textPrimary}`}
                    >
                      {sectors.map(s => (
                        <option key={s} value={s}>{s === 'all' ? 'All Sectors' : s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Market Cap</label>
                    <select
                      value={marketCapFilter}
                      onChange={(e) => setMarketCapFilter(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${theme.cardBg} ${theme.textPrimary}`}
                    >
                      <option value="all">All Caps</option>
                      <option value="mega">Mega ($200B+)</option>
                      <option value="large">Large ($10B-$200B)</option>
                      <option value="mid">Mid ($2B-$10B)</option>
                      <option value="small">Small ($300M-$2B)</option>
                      <option value="micro">Micro (&lt;$300M)</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>&nbsp;</label>
                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        showAdvancedFilters
                          ? 'bg-blue-600 text-white border-blue-600'
                          : `${theme.cardBg} ${theme.textPrimary} hover:border-blue-500`
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                    </button>
                  </div>
                </div>

                {/* Advanced Filters Panel (Finviz/Bloomberg Style) */}
                {showAdvancedFilters && (
                  <div className={`rounded-lg border p-4 space-y-4 ${theme.cardBg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-sm font-semibold flex items-center gap-2 ${theme.textPrimary}`}>
                        <Filter className="w-4 h-4 text-blue-500" />
                        Advanced Screener Filters
                      </h4>
                      <button
                        onClick={() => {
                          setPeMin('');
                          setPeMax('');
                          setRoeMin('');
                          setDivYieldMin('');
                          setUpsideMin('');
                          setMarketCapFilter('all');
                          setGicsSectorFilter('all');
                          setGicsIndustryGroupFilter('all');
                          setGicsSubIndustryFilter('all');
                        }}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Reset All
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {/* P/E Range */}
                      <div>
                        <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>P/E Min</label>
                        <input
                          type="number"
                          placeholder="Any"
                          value={peMin}
                          onChange={(e) => setPeMin(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${theme.cardBg} ${theme.textPrimary}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>P/E Max</label>
                        <input
                          type="number"
                          placeholder="Any"
                          value={peMax}
                          onChange={(e) => setPeMax(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${theme.cardBg} ${theme.textPrimary}`}
                        />
                      </div>

                      {/* ROE Min */}
                      <div>
                        <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>ROE Min (%)</label>
                        <input
                          type="number"
                          placeholder="Any"
                          value={roeMin}
                          onChange={(e) => setRoeMin(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${theme.cardBg} ${theme.textPrimary}`}
                        />
                      </div>

                      {/* Dividend Yield */}
                      <div>
                        <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Div Yield Min (%)</label>
                        <input
                          type="number"
                          placeholder="Any"
                          value={divYieldMin}
                          onChange={(e) => setDivYieldMin(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${theme.cardBg} ${theme.textPrimary}`}
                        />
                      </div>

                      {/* DCF Upside */}
                      <div>
                        <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>DCF Upside Min (%)</label>
                        <input
                          type="number"
                          placeholder="Any"
                          value={upsideMin}
                          onChange={(e) => setUpsideMin(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${theme.cardBg} ${theme.textPrimary}`}
                        />
                      </div>
                    </div>

                    {/* GICS Classification Filters (Bloomberg/MSCI Standard) */}
                    <div className={`pt-4 border-t ${theme.border}`}>
                      <h5 className={`text-xs font-semibold uppercase mb-3 flex items-center gap-2 ${theme.textMuted}`}>
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        GICS Industry Classification (Bloomberg)
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* GICS Sector */}
                        <div>
                          <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>GICS Sector</label>
                          <select
                            value={gicsSectorFilter}
                            onChange={(e) => {
                              setGicsSectorFilter(e.target.value);
                              setGicsIndustryGroupFilter('all');
                              setGicsSubIndustryFilter('all');
                            }}
                            className="w-full px-3 py-2 border-2 border-emerald-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-emerald-50"
                          >
                            {gicsSectors.map(s => (
                              <option key={s} value={s}>{s === 'all' ? 'All Sectors' : s}</option>
                            ))}
                          </select>
                        </div>

                        {/* GICS Industry Group */}
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Industry Group</label>
                          <select
                            value={gicsIndustryGroupFilter}
                            onChange={(e) => {
                              setGicsIndustryGroupFilter(e.target.value);
                              setGicsSubIndustryFilter('all');
                            }}
                            className="w-full px-3 py-2 border-2 border-emerald-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-emerald-50"
                          >
                            {gicsIndustryGroups.map(g => (
                              <option key={g} value={g}>{g === 'all' ? 'All Groups' : g}</option>
                            ))}
                          </select>
                        </div>

                        {/* GICS Sub-Industry */}
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Sub-Industry</label>
                          <select
                            value={gicsSubIndustryFilter}
                            onChange={(e) => setGicsSubIndustryFilter(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-emerald-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-emerald-50"
                          >
                            {gicsSubIndustries.map(si => (
                              <option key={si} value={si}>{si === 'all' ? 'All Sub-Industries' : si}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {(gicsSectorFilter !== 'all' || gicsIndustryGroupFilter !== 'all' || gicsSubIndustryFilter !== 'all') && (
                        <div className="mt-2 text-xs text-emerald-700 font-medium">
                          Active GICS Filter: {gicsSubIndustryFilter !== 'all' ? gicsSubIndustryFilter : gicsIndustryGroupFilter !== 'all' ? gicsIndustryGroupFilter : gicsSectorFilter}
                        </div>
                      )}
                    </div>

                    {/* Quick Filter Buttons */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200">
                      <span className="text-xs font-semibold text-slate-500 mr-2">Quick:</span>
                      <button
                        onClick={() => { setPeMax('15'); setRoeMin('15'); }}
                        className="px-3 py-1 bg-white border border-slate-300 rounded-full text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-400 transition-all"
                      >
                        Value (P/E&lt;15, ROE&gt;15%)
                      </button>
                      <button
                        onClick={() => { setRoeMin('20'); setUpsideMin('10'); }}
                        className="px-3 py-1 bg-white border border-slate-300 rounded-full text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-400 transition-all"
                      >
                        Quality Growth
                      </button>
                      <button
                        onClick={() => { setDivYieldMin('3'); }}
                        className="px-3 py-1 bg-white border border-slate-300 rounded-full text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-400 transition-all"
                      >
                        High Dividend (3%+)
                      </button>
                      <button
                        onClick={() => { setUpsideMin('20'); }}
                        className="px-3 py-1 bg-white border border-slate-300 rounded-full text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-400 transition-all"
                      >
                        Undervalued (20%+ upside)
                      </button>
                    </div>
                  </div>
                )}

                {/* INSTITUTIONAL-GRADE RESULTS TABLE */}
                <div className={`rounded-xl border overflow-hidden ${theme.cardBg}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className={`${darkMode ? 'bg-slate-700' : 'bg-slate-800'} text-white`}>
                        <tr>
                          <th className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wide w-10">
                            <Star className="w-4 h-4 mx-auto" />
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide">Ticker</th>
                          <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[180px]">Company</th>
                          <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide">Sector</th>
                          <th
                            className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide cursor-pointer hover:bg-slate-600 transition-colors select-none"
                            onClick={() => {
                              if (sortBy === 'price') setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                              else { setSortBy('price'); setSortDirection('desc'); }
                            }}
                          >
                            Price {sortBy === 'price' && (sortDirection === 'desc' ? '▼' : '▲')}
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide bg-blue-900">Fair Value<br/>(DCF)</th>
                          <th
                            className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide bg-blue-900 cursor-pointer hover:bg-blue-800 transition-colors select-none"
                            onClick={() => {
                              if (sortBy === 'dcf') setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                              else { setSortBy('dcf'); setSortDirection('desc'); }
                            }}
                          >
                            Upside {sortBy === 'dcf' && (sortDirection === 'desc' ? '▼' : '▲')}
                          </th>
                          <th
                            className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide cursor-pointer hover:bg-slate-600 transition-colors select-none"
                            onClick={() => {
                              if (sortBy === 'pe') setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                              else { setSortBy('pe'); setSortDirection('asc'); }
                            }}
                          >
                            P/E {sortBy === 'pe' && (sortDirection === 'desc' ? '▼' : '▲')}
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-purple-800 to-pink-800">Signals</th>
                          <th
                            className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide cursor-pointer hover:bg-slate-600 transition-colors select-none"
                            onClick={() => {
                              if (sortBy === 'roe') setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                              else { setSortBy('roe'); setSortDirection('desc'); }
                            }}
                          >
                            ROE {sortBy === 'roe' && (sortDirection === 'desc' ? '▼' : '▲')}
                          </th>
                          <th
                            className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide cursor-pointer hover:bg-slate-600 transition-colors select-none"
                            onClick={() => {
                              if (sortBy === 'ytd') setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                              else { setSortBy('ytd'); setSortDirection('desc'); }
                            }}
                          >
                            YTD {sortBy === 'ytd' && (sortDirection === 'desc' ? '▼' : '▲')}
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide bg-emerald-800">Rating</th>
                          <th
                            className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide cursor-pointer hover:bg-slate-600 transition-colors select-none"
                            onClick={() => {
                              if (sortBy === 'score') setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                              else { setSortBy('score'); setSortDirection('desc'); }
                            }}
                          >
                            Score {sortBy === 'score' && (sortDirection === 'desc' ? '▼' : '▲')}
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide">Action</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme.border} ${theme.cardBg}`}>
                        {filteredStocks
                          .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                          .map((stock, idx) => {
                          const scoreRating = getScoreRating(stock.natanScore.total);
                          const fairValue = stock.dcf?.fairValue || stock.Price;
                          const upside = stock.dcf?.upside || 0;

                          return (
                            <tr key={idx} className={`transition-all border-l-4 border-transparent hover:border-l-blue-500 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}`}>
                              <td className="px-2 py-3 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleWatchlist(stock.ticker);
                                  }}
                                  className={`p-1.5 rounded-full transition-all ${
                                    isInWatchlist(stock.ticker)
                                      ? 'bg-yellow-100 text-yellow-500 hover:bg-yellow-200'
                                      : `${darkMode ? 'bg-slate-600 text-slate-400 hover:bg-slate-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'} hover:text-yellow-500`
                                  }`}
                                  title={isInWatchlist(stock.ticker) ? 'Remove from watchlist' : 'Add to watchlist'}
                                >
                                  <Star className={`w-4 h-4 ${isInWatchlist(stock.ticker) ? 'fill-yellow-500' : ''}`} />
                                </button>
                              </td>
                              <td className={`px-3 py-3 font-bold text-sm ${theme.textPrimary}`}>{stock.ticker}</td>
                              <td className={`px-3 py-3 font-medium max-w-xs truncate ${theme.textMuted}`}>
                                {stock.name || stock.Name}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium cursor-help ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
                                  title={stock["GICS Sub-Industry"]
                                    ? `GICS: ${stock["GICS Sector"]} > ${stock["GICS Industry Group"]} > ${stock["GICS Sub-Industry"]}`
                                    : stock.sector || 'N/A'
                                  }
                                >
                                  {stock["GICS Sub-Industry"] || stock.sector?.split(',')[0] || 'N/A'}
                                </span>
                              </td>
                              <td className={`px-3 py-3 text-right font-bold ${theme.textPrimary}`}>
                                {formatPrice(stock.Price, stock.region)}
                              </td>
                              <td className={`px-3 py-3 text-right font-bold ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-900'}`}>
                                {formatPrice(fairValue, stock.region)}
                              </td>
                              <td className={`px-3 py-3 text-right font-bold ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                <span className={`px-2 py-1 rounded font-semibold text-xs ${
                                  upside > 20 ? 'bg-emerald-500 text-white' :
                                  upside > 10 ? 'bg-emerald-500 text-white' :
                                  upside > 0 ? 'bg-blue-500 text-white' :
                                  upside > -10 ? 'bg-amber-500 text-white' :
                                  'bg-red-500 text-white'
                                }`}>
                                  {upside > 0 ? '+' : ''}{upside.toFixed(0)}%
                                </span>
                              </td>
                              <td className={`px-3 py-3 text-right font-medium ${theme.textMuted}`}>
                                {formatRatio(stock.PE)}
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <span className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold ${
                                    stock.natanScore.technicalScore >= 15 ? 'bg-purple-600 text-white' :
                                    stock.natanScore.technicalScore >= 10 ? 'bg-purple-400 text-white' :
                                    'bg-purple-100 text-purple-700'
                                  }`} title={`Technical: ${stock.natanScore.technicalScore}/20`}>
                                    T
                                  </span>
                                  <span className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold ${
                                    stock.natanScore.sentimentScore >= 12 ? 'bg-pink-600 text-white' :
                                    stock.natanScore.sentimentScore >= 8 ? 'bg-pink-400 text-white' :
                                    'bg-pink-100 text-pink-700'
                                  }`} title={`Sentiment: ${stock.natanScore.sentimentScore}/15`}>
                                    S
                                  </span>
                                  <span className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold ${
                                    stock.natanScore.liquidityScore >= 8 ? 'bg-amber-500 text-white' :
                                    stock.natanScore.liquidityScore >= 5 ? 'bg-amber-300 text-amber-900' :
                                    'bg-amber-100 text-amber-700'
                                  }`} title={`Liquidity: ${stock.natanScore.liquidityScore}/10`}>
                                    L
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-right font-medium">
                                <span className={(stock.ROE || 0) > 15 ? 'text-emerald-500' : theme.textMuted}>
                                  {stock.ROE ? `${stock.ROE.toFixed(1)}%` : 'N/A'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right font-semibold">
                                <span className={(stock["Company YTD Return"] || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                  {formatPercent(stock["Company YTD Return"])}
                                </span>
                              </td>
                              <td className={`px-3 py-3 ${darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex">
                                    {[...Array(scoreRating.stars)].map((_, i) => (
                                      <span key={i} className="text-yellow-500 text-sm">★</span>
                                    ))}
                                  </div>
                                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${scoreRating.bgClass} ${scoreRating.textClass}`}>
                                    {scoreRating.rating}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`text-xl font-bold ${scoreRating.textClass}`}>
                                    {stock.natanScore.total}
                                  </span>
                                  <span className={`text-xs font-medium ${theme.textMuted}`}>/100</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedStock(stock);
                                    setActiveView('valuation');
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                >
                                  Analyze
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredStocks.length === 0 && (
                          <tr>
                            <td colSpan="13" className="py-16 text-center bg-slate-50">
                              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                              <h3 className="text-xl font-bold text-slate-700 mb-2">No stocks found</h3>
                              <p className="text-slate-500 mb-4">Try adjusting your filters or search criteria</p>
                              <button
                                onClick={() => {
                                  setMinScore(0);
                                  setSelectedSector('all');
                                  setSelectedRegion('all');
                                  setSearchTerm('');
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                              >
                                Reset All Filters
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {filteredStocks.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 bg-slate-50 border-t border-slate-200">
                      {/* Results info */}
                      <div className="text-sm text-slate-600">
                        Showing <span className="font-bold text-slate-900">{((currentPage - 1) * rowsPerPage) + 1}</span> to{' '}
                        <span className="font-bold text-slate-900">{Math.min(currentPage * rowsPerPage, filteredStocks.length)}</span> of{' '}
                        <span className="font-bold text-slate-900">{filteredStocks.length}</span> stocks
                      </div>

                      {/* Page controls */}
                      <div className="flex items-center gap-2">
                        {/* Rows per page selector */}
                        <div className="flex items-center gap-2 mr-4">
                          <span className="text-sm text-slate-600">Rows:</span>
                          <select
                            value={rowsPerPage}
                            onChange={(e) => {
                              setRowsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="px-2 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                          </select>
                        </div>

                        {/* First page */}
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-slate-300 hover:bg-slate-100"
                        >
                          ««
                        </button>

                        {/* Previous page */}
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-slate-300 hover:bg-slate-100"
                        >
                          ‹ Prev
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {(() => {
                            const totalPages = Math.ceil(filteredStocks.length / rowsPerPage);
                            const pages = [];
                            let start = Math.max(1, currentPage - 2);
                            let end = Math.min(totalPages, currentPage + 2);

                            // Adjust to always show 5 pages if possible
                            if (end - start < 4) {
                              if (start === 1) end = Math.min(totalPages, 5);
                              else start = Math.max(1, end - 4);
                            }

                            for (let i = start; i <= end; i++) {
                              pages.push(
                                <button
                                  key={i}
                                  onClick={() => setCurrentPage(i)}
                                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                                    currentPage === i
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white border border-slate-300 hover:bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {i}
                                </button>
                              );
                            }
                            return pages;
                          })()}
                        </div>

                        {/* Next page */}
                        <button
                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredStocks.length / rowsPerPage), p + 1))}
                          disabled={currentPage >= Math.ceil(filteredStocks.length / rowsPerPage)}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-slate-300 hover:bg-slate-100"
                        >
                          Next ›
                        </button>

                        {/* Last page */}
                        <button
                          onClick={() => setCurrentPage(Math.ceil(filteredStocks.length / rowsPerPage))}
                          disabled={currentPage >= Math.ceil(filteredStocks.length / rowsPerPage)}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-slate-300 hover:bg-slate-100"
                        >
                          »»
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Statistics Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                    <div className="text-xs text-blue-600 uppercase font-bold mb-1">Avg Score</div>
                    <div className="text-2xl font-bold text-blue-900">{statsData.avgScore}</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border-2 border-emerald-200">
                    <div className="text-xs text-emerald-600 uppercase font-bold mb-1">Strong Buy</div>
                    <div className="text-2xl font-bold text-emerald-900">{statsData.strongBuy}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
                    <div className="text-xs text-purple-600 uppercase font-bold mb-1">Showing</div>
                    <div className="text-2xl font-bold text-purple-900">{statsData.showing}</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border-2 border-amber-200">
                    <div className="text-xs text-amber-600 uppercase font-bold mb-1">Avg DCF ↑</div>
                    <div className="text-2xl font-bold text-amber-900">{statsData.avgDCFUpside}%</div>
                  </div>
                </div>

                {/* Methodology Note */}
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4" />
                    Multi-Factor Scoring Framework (100 pts)
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-xs">
                    <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="font-bold text-purple-700">20pts</div>
                      <div className="text-purple-600 font-medium">Technical</div>
                    </div>
                    <div className="text-center p-2 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="font-bold text-pink-700">15pts</div>
                      <div className="text-pink-600 font-medium">Sentiment</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-bold text-blue-700">15pts</div>
                      <div className="text-blue-600 font-medium">Valuation</div>
                    </div>
                    <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="font-bold text-emerald-700">15pts</div>
                      <div className="text-emerald-600 font-medium">Quality</div>
                    </div>
                    <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="font-bold text-amber-700">10pts</div>
                      <div className="text-amber-600 font-medium">Liquidity</div>
                    </div>
                    <div className="text-center p-2 bg-slate-100 rounded-lg border border-slate-300">
                      <div className="font-bold text-slate-700">10pts</div>
                      <div className="text-slate-600 font-medium">Growth</div>
                    </div>
                    <div className="text-center p-2 bg-slate-100 rounded-lg border border-slate-300">
                      <div className="font-bold text-slate-700">10pts</div>
                      <div className="text-slate-600 font-medium">Health</div>
                    </div>
                    <div className="text-center p-2 bg-cyan-50 rounded-lg border border-cyan-200">
                      <div className="font-bold text-cyan-700">5pts</div>
                      <div className="text-cyan-600 font-medium">Coverage</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 italic">
                    Optimized for Indonesian market dynamics (80-90% sentiment/technical driven) • CFA Institute, Damodaran, TCW methodology
                  </p>
                </div>
              </div>
            )}

            {/* WATCHLIST / PORTFOLIO TRACKER VIEW */}
            {activeView === 'watchlist' && (
              <div className="space-y-6">
                {/* Header */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-800 to-slate-900'} text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold mb-2 flex items-center gap-3">
                        <Star className="w-6 h-6" />
                        My Watchlist
                      </h2>
                      <p className="text-slate-300 text-sm">
                        Track your favorite stocks • Portfolio performance metrics • Add stocks from screener
                      </p>
                    </div>
                    {watchlist.length > 0 && (
                      <button
                        onClick={() => {
                          const stocks = ALL_STOCKS_DATA.filter(s => watchlist.includes(s.ticker));
                          downloadExcel(stocks, EXPORT_COLUMNS.watchlist, 'Equity_Watchlist', 'Watchlist');
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                        title="Export Watchlist to Excel"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Watchlist Content */}
                {(() => {
                  // Get watchlist stocks with full data
                  const watchlistStocks = ALL_STOCKS_DATA.filter(s => watchlist.includes(s.ticker));

                  // Calculate portfolio metrics
                  const portfolioMetrics = watchlistStocks.length > 0 ? {
                    avgScore: watchlistStocks.reduce((sum, s) => sum + (s.natanScore?.total || 0), 0) / watchlistStocks.length,
                    avgYTD: watchlistStocks.reduce((sum, s) => sum + (s['Company YTD Return'] || 0), 0) / watchlistStocks.length,
                    totalMarketCap: watchlistStocks.reduce((sum, s) => sum + (s['Market Cap'] || 0), 0),
                    avgPE: watchlistStocks.filter(s => s.PE > 0 && s.PE < 100).reduce((sum, s, _, arr) => sum + s.PE / arr.length, 0),
                    avgROE: watchlistStocks.filter(s => s.ROE).reduce((sum, s, _, arr) => sum + s.ROE / arr.length, 0),
                    sectorBreakdown: {},
                    regionBreakdown: { Indonesia: 0, US: 0 }
                  } : null;

                  // Calculate sector & region breakdown
                  if (portfolioMetrics) {
                    watchlistStocks.forEach(s => {
                      const sector = s.sector || 'Other';
                      portfolioMetrics.sectorBreakdown[sector] = (portfolioMetrics.sectorBreakdown[sector] || 0) + 1;
                      if (s.Region === 'Indonesia') portfolioMetrics.regionBreakdown.Indonesia++;
                      else if (s.Region === 'US') portfolioMetrics.regionBreakdown.US++;
                    });
                  }

                  return (
                    <>
                      {/* Portfolio Summary */}
                      {watchlistStocks.length > 0 ? (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                              <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Stocks</div>
                              <div className={`text-2xl font-bold ${theme.textPrimary}`}>{watchlistStocks.length}</div>
                              <div className={`text-xs ${theme.textMuted}`}>in watchlist</div>
                            </div>
                            <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                              <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Avg Score</div>
                              <div className={`text-2xl font-bold ${portfolioMetrics.avgScore >= 70 ? 'text-emerald-500' : portfolioMetrics.avgScore >= 55 ? 'text-amber-500' : 'text-red-500'}`}>
                                {portfolioMetrics.avgScore.toFixed(1)}
                              </div>
                              <div className={`text-xs ${theme.textMuted}`}>MF Score</div>
                            </div>
                            <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                              <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Avg YTD</div>
                              <div className={`text-2xl font-bold ${portfolioMetrics.avgYTD >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {portfolioMetrics.avgYTD >= 0 ? '+' : ''}{portfolioMetrics.avgYTD.toFixed(1)}%
                              </div>
                              <div className={`text-xs ${theme.textMuted}`}>return</div>
                            </div>
                            <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                              <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Avg P/E</div>
                              <div className={`text-2xl font-bold ${theme.textPrimary}`}>
                                {portfolioMetrics.avgPE.toFixed(1)}x
                              </div>
                              <div className={`text-xs ${theme.textMuted}`}>valuation</div>
                            </div>
                            <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                              <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Avg ROE</div>
                              <div className={`text-2xl font-bold ${theme.textPrimary}`}>
                                {portfolioMetrics.avgROE.toFixed(1)}%
                              </div>
                              <div className={`text-xs ${theme.textMuted}`}>profitability</div>
                            </div>
                            <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                              <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Regions</div>
                              <div className={`text-lg font-bold ${theme.textPrimary}`}>
                                🇮🇩 {portfolioMetrics.regionBreakdown.Indonesia} / 🇺🇸 {portfolioMetrics.regionBreakdown.US}
                              </div>
                              <div className={`text-xs ${theme.textMuted}`}>ID / US split</div>
                            </div>
                          </div>

                          {/* Sector Allocation */}
                          <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.textPrimary}`}>
                              <PieChart className={`w-5 h-5 ${theme.textMuted}`} />
                              Sector Allocation
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(portfolioMetrics.sectorBreakdown)
                                .sort((a, b) => b[1] - a[1])
                                .map(([sector, count]) => (
                                  <div key={sector} className={`px-3 py-1.5 rounded-lg border ${theme.cardBg}`}>
                                    <span className={`font-medium ${theme.textPrimary}`}>{sector}</span>
                                    <span className={`ml-2 ${theme.textMuted}`}>({count} • {((count / watchlistStocks.length) * 100).toFixed(0)}%)</span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Watchlist Table */}
                          <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className={`text-lg font-bold flex items-center gap-2 ${theme.textPrimary}`}>
                                <Briefcase className={`w-5 h-5 ${theme.textMuted}`} />
                                Watchlist Holdings
                              </h3>
                              <button
                                onClick={() => setWatchlist([])}
                                className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                              </button>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className={`${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                    <th className={`text-left py-3 px-4 font-semibold ${theme.textPrimary}`}>Ticker</th>
                                    <th className={`text-left py-3 px-4 font-semibold ${theme.textPrimary}`}>Company</th>
                                    <th className={`text-left py-3 px-4 font-semibold ${theme.textPrimary}`}>Sector</th>
                                    <th className={`text-center py-3 px-4 font-semibold ${theme.textPrimary}`}>Region</th>
                                    <th className={`text-right py-3 px-4 font-semibold ${theme.textPrimary}`}>Score</th>
                                    <th className={`text-right py-3 px-4 font-semibold ${theme.textPrimary}`}>YTD</th>
                                    <th className={`text-right py-3 px-4 font-semibold ${theme.textPrimary}`}>P/E</th>
                                    <th className={`text-right py-3 px-4 font-semibold ${theme.textPrimary}`}>ROE</th>
                                    <th className={`text-center py-3 px-4 font-semibold ${theme.textPrimary}`}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody className={`divide-y ${theme.border}`}>
                                  {watchlistStocks
                                    .sort((a, b) => (b.natanScore?.total || 0) - (a.natanScore?.total || 0))
                                    .map((stock, index) => (
                                      <tr key={stock.ticker} className={`transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                                        <td className="py-3 px-4">
                                          <button
                                            onClick={() => {
                                              setSelectedStock(stock);
                                              setActiveView('valuation');
                                            }}
                                            className="font-mono font-bold text-blue-500 hover:text-blue-600 hover:underline"
                                          >
                                            {stock.ticker}
                                          </button>
                                        </td>
                                        <td className={`py-3 px-4 max-w-[200px] truncate ${theme.textMuted}`}>
                                          {stock.Company || stock.Name}
                                        </td>
                                        <td className={`py-3 px-4 ${theme.textMuted}`}>{stock.sector?.slice(0, 15)}</td>
                                        <td className="py-3 px-4 text-center">
                                          <span className="text-sm">
                                            {stock.Region === 'Indonesia' ? '🇮🇩' : '🇺🇸'}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                          <span className={`font-semibold ${
                                            stock.natanScore?.total >= 70 ? 'text-emerald-500' :
                                            stock.natanScore?.total >= 55 ? 'text-amber-500' :
                                            'text-red-500'
                                          }`}>
                                            {stock.natanScore?.total?.toFixed(1)}
                                          </span>
                                        </td>
                                        <td className={`py-3 px-4 text-right font-semibold ${(stock['Company YTD Return'] || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                          {(stock['Company YTD Return'] || 0) >= 0 ? '+' : ''}{(stock['Company YTD Return'] || 0).toFixed(1)}%
                                        </td>
                                        <td className={`py-3 px-4 text-right ${theme.textMuted}`}>
                                          {stock.PE > 0 && stock.PE < 1000 ? stock.PE.toFixed(1) : '-'}
                                        </td>
                                        <td className={`py-3 px-4 text-right ${theme.textMuted}`}>
                                          {stock.ROE ? `${stock.ROE.toFixed(1)}%` : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <button
                                            onClick={() => removeFromWatchlist(stock.ticker)}
                                            className={`p-1.5 text-red-500 hover:text-red-600 ${darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} rounded transition-colors`}
                                            title="Remove from watchlist"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Performance Comparison */}
                          <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                            <h3 className={`text-lg font-bold mb-4 ${theme.textPrimary}`}>
                              Performance vs Market
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                                <div className={`text-sm font-semibold mb-2 ${theme.textMuted}`}>Your Watchlist</div>
                                <div className={`text-2xl font-bold ${portfolioMetrics.avgYTD >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {portfolioMetrics.avgYTD >= 0 ? '+' : ''}{portfolioMetrics.avgYTD.toFixed(2)}%
                                </div>
                                <div className={`text-xs ${theme.textMuted}`}>Avg YTD Return</div>
                              </div>
                              <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                                <div className={`text-sm font-semibold mb-2 ${theme.textMuted}`}>JCI Index</div>
                                <div className="text-2xl font-bold text-emerald-500">
                                  +{macroData.indonesia.stockYTD || 0}%
                                </div>
                                <div className={`text-xs ${theme.textMuted}`}>YTD Return</div>
                              </div>
                              <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                                <div className={`text-sm font-semibold mb-2 ${theme.textMuted}`}>Alpha vs JCI</div>
                                <div className={`text-2xl font-bold ${(portfolioMetrics.avgYTD - (macroData.indonesia.stockYTD || 0)) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {(portfolioMetrics.avgYTD - (macroData.indonesia.stockYTD || 0)) >= 0 ? '+' : ''}
                                  {(portfolioMetrics.avgYTD - (macroData.indonesia.stockYTD || 0)).toFixed(2)}%
                                </div>
                                <div className={`text-xs ${theme.textMuted}`}>Outperformance</div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Empty State */
                        <div className={`rounded-xl p-12 border-2 border-dashed text-center ${theme.cardBg} ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                          <Star className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                          <h3 className={`text-2xl font-bold mb-2 ${theme.textPrimary}`}>Your Watchlist is Empty</h3>
                          <p className={`mb-6 max-w-md mx-auto ${theme.textMuted}`}>
                            Add stocks to your watchlist from the Equity Screener to track their performance and build your portfolio.
                          </p>
                          <button
                            onClick={() => setActiveView('screener')}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                          >
                            <Search className="w-5 h-5" />
                            Go to Screener
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* SECTOR HEATMAP VIEW */}
            {activeView === 'heatmap' && (
              <div className="space-y-6">
                {/* Header */}
                <div className={`rounded-xl p-4 sm:p-6 ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-800 to-slate-900'} text-white`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-3">
                        <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                        <span className="truncate">JCI Sector Heatmap</span>
                      </h2>
                      <p className="text-slate-300 text-xs sm:text-sm">
                        Indonesian Stock Exchange (IDX) • Jakarta Composite Index
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          const idStocks = ALL_STOCKS_DATA.filter(s => s.Region === 'Indonesia' || s.region === 'Indonesia');
                          const sectorData = {};
                          idStocks.forEach(s => {
                            const sector = s.sector || 'Other';
                            if (!sectorData[sector]) sectorData[sector] = { stocks: [], totalYTD: 0, totalScore: 0 };
                            sectorData[sector].stocks.push(s);
                            sectorData[sector].totalYTD += s['Company YTD Return'] || 0;
                            sectorData[sector].totalScore += s.natanScore?.total || 0;
                          });
                          const exportData = Object.entries(sectorData).map(([sector, data]) => ({
                            sector,
                            avgYTD: data.totalYTD / data.stocks.length,
                            avgScore: data.totalScore / data.stocks.length,
                            count: data.stocks.length,
                            topTicker: data.stocks.sort((a,b) => (b.natanScore?.total || 0) - (a.natanScore?.total || 0))[0]?.ticker
                          }));
                          downloadExcel(exportData, EXPORT_COLUMNS.heatmap, 'Sector_Heatmap', 'Sectors');
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                        title="Export Sector Data to Excel"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-1">As of</div>
                        <div className="text-sm sm:text-lg font-semibold">
                          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-400 mt-1 flex items-center sm:justify-end gap-1">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                          Live Data
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heatmap Grid */}
                {(() => {
                  // Filter to Indonesian stocks only
                  const indonesianStocks = ALL_STOCKS_DATA.filter(s =>
                    s.Region === 'Indonesia' || s.region === 'Indonesia'
                  );

                  // Get JCI daily change from market overview if available
                  const jciIndex = marketOverview?.indices?.find(i => i.symbol === '^JKSE' || i.name?.includes('Jakarta'));
                  const jciDailyChange = jciIndex?.changePercent || null;

                  // Calculate sector statistics
                  const sectorStats = {};
                  indonesianStocks.forEach(stock => {
                    const sector = stock.sector || 'Other';
                    if (!sectorStats[sector]) {
                      sectorStats[sector] = {
                        stocks: [],
                        totalScore: 0,
                        count: 0,
                        totalYTD: 0,
                        topStock: null,
                        industries: {}
                      };
                    }
                    sectorStats[sector].stocks.push(stock);
                    sectorStats[sector].totalScore += stock.natanScore?.total || 0;
                    sectorStats[sector].count++;
                    sectorStats[sector].totalYTD += stock['Company YTD Return'] || 0;

                    // Track industries within sector
                    const industry = stock.industry || stock['Industry Group'] || 'General';
                    if (!sectorStats[sector].industries[industry]) {
                      sectorStats[sector].industries[industry] = { count: 0, totalScore: 0 };
                    }
                    sectorStats[sector].industries[industry].count++;
                    sectorStats[sector].industries[industry].totalScore += stock.natanScore?.total || 0;

                    // Track top stock
                    if (!sectorStats[sector].topStock || (stock.natanScore?.total || 0) > (sectorStats[sector].topStock.natanScore?.total || 0)) {
                      sectorStats[sector].topStock = stock;
                    }
                  });

                  // Calculate averages
                  Object.keys(sectorStats).forEach(sector => {
                    sectorStats[sector].avgScore = sectorStats[sector].totalScore / sectorStats[sector].count;
                    sectorStats[sector].avgYTD = sectorStats[sector].totalYTD / sectorStats[sector].count;
                  });

                  // Sort by YTD performance (Finviz style - best performers first)
                  const sortedSectors = Object.entries(sectorStats)
                    .sort((a, b) => b[1].avgYTD - a[1].avgYTD);

                  // Finviz-style color based on YTD PERFORMANCE
                  // Professional emerald/red palette (less neon, more readable)
                  const getHeatColor = (ytdReturn) => {
                    if (ytdReturn >= 50) return 'bg-[#10b981]'; // Emerald bright
                    if (ytdReturn >= 30) return 'bg-[#059669]'; // Emerald medium
                    if (ytdReturn >= 15) return 'bg-[#047857]'; // Emerald dark
                    if (ytdReturn >= 5) return 'bg-[#065f46]';  // Emerald darker
                    if (ytdReturn >= 0) return 'bg-[#064e3b]';  // Emerald darkest
                    if (ytdReturn >= -5) return 'bg-[#7f1d1d]'; // Red darkest
                    if (ytdReturn >= -15) return 'bg-[#991b1b]';// Red darker
                    if (ytdReturn >= -30) return 'bg-[#b91c1c]';// Red medium
                    return 'bg-[#dc2626]';                      // Red bright
                  };

                  // Calculate market-wide stats
                  const marketAvgYTD = indonesianStocks.reduce((sum, s) => sum + (s['Company YTD Return'] || 0), 0) / indonesianStocks.length;
                  const marketAvgScore = indonesianStocks.reduce((sum, s) => sum + (s.natanScore?.total || 0), 0) / indonesianStocks.length;
                  const bestPerformer = sortedSectors[0]; // Already sorted by YTD
                  const worstPerformer = sortedSectors[sortedSectors.length - 1];

                  return (
                    <>
                      {/* Summary Stats - Finviz-inspired clean design */}
                      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4`}>
                        {/* Best YTD Sector */}
                        <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border-l-4 border-emerald-500`}>
                          <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Best YTD</div>
                          <div className={`text-base font-bold ${theme.textPrimary} mb-1 truncate`}>{bestPerformer?.[0] || 'N/A'}</div>
                          <div className="text-2xl font-black text-emerald-500">
                            +{bestPerformer?.[1]?.avgYTD?.toFixed(1)}%
                          </div>
                          <div className={`text-xs mt-1 ${theme.textMuted}`}>{bestPerformer?.[1]?.count} stocks</div>
                        </div>

                        {/* Worst YTD Sector */}
                        <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border-l-4 border-red-500`}>
                          <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Worst YTD</div>
                          <div className={`text-base font-bold ${theme.textPrimary} mb-1 truncate`}>{worstPerformer?.[0] || 'N/A'}</div>
                          <div className={`text-2xl font-black ${worstPerformer?.[1]?.avgYTD >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {worstPerformer?.[1]?.avgYTD >= 0 ? '+' : ''}{worstPerformer?.[1]?.avgYTD?.toFixed(1)}%
                          </div>
                          <div className={`text-xs mt-1 ${theme.textMuted}`}>{worstPerformer?.[1]?.count} stocks</div>
                        </div>

                        {/* JCI Today */}
                        <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border-l-4 border-blue-500`}>
                          <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>JCI Today</div>
                          <div className={`text-base font-bold ${theme.textPrimary} mb-1`}>
                            {jciIndex?.price?.toLocaleString() || 'N/A'}
                          </div>
                          <div className={`text-2xl font-black ${jciDailyChange !== null && jciDailyChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {jciDailyChange !== null ? `${jciDailyChange >= 0 ? '+' : ''}${jciDailyChange.toFixed(2)}%` : '--'}
                          </div>
                          <div className={`text-xs mt-1 ${theme.textMuted}`}>{sortedSectors.length} sectors tracked</div>
                        </div>

                        {/* Market Stats */}
                        <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border-l-4 border-amber-500`}>
                          <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Market Overview</div>
                          <div className={`text-base font-bold ${theme.textPrimary} mb-1`}>{indonesianStocks.length} Stocks</div>
                          <div className={`text-2xl font-black ${marketAvgYTD >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {marketAvgYTD >= 0 ? '+' : ''}{marketAvgYTD.toFixed(1)}%
                          </div>
                          <div className={`text-xs mt-1 ${theme.textMuted}`}>Avg YTD Return</div>
                        </div>
                      </div>

                      {/* Main Heatmap Grid - Modern Aesthetic */}
                      <div className={`rounded-2xl ${darkMode ? 'bg-slate-900/50' : 'bg-slate-100'} p-4 shadow-lg`}>
                        {/* Treemap-style grid - variable sizes based on stock count */}
                        <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                          {sortedSectors.map(([sector, data], index) => {
                            // Calculate size class based on stock count (Finviz uses market cap, we use stock count)
                            const isLarge = data.count > 100;
                            const isMedium = data.count > 30;

                            return (
                              <button
                                key={sector}
                                onClick={() => {
                                  setSelectedSector(sector);
                                  setSelectedRegion('Indonesia');
                                  setActiveView('screener');
                                }}
                                className={`${getHeatColor(data.avgYTD)} ${
                                  isLarge ? 'col-span-2 row-span-2' :
                                  isMedium ? 'col-span-1 row-span-2' :
                                  'col-span-1 row-span-1'
                                } p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:z-10 relative group min-h-[110px] rounded-xl shadow-md border border-white/10`}
                              >
                                {/* Subtle gradient overlay for depth */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />

                                {/* Sector Name */}
                                <div className="text-white/95 text-xs font-semibold leading-tight mb-1.5 line-clamp-2 relative z-10">{sector}</div>

                                {/* YTD Return - Large prominent number */}
                                <div className={`text-white font-black relative z-10 drop-shadow-sm ${isLarge ? 'text-4xl' : isMedium ? 'text-2xl' : 'text-xl'}`}>
                                  {data.avgYTD >= 0 ? '+' : ''}{data.avgYTD.toFixed(1)}%
                                </div>

                                {/* Stock count */}
                                <div className="text-white/70 text-[10px] mt-1.5 relative z-10">
                                  {data.count} stocks
                                </div>

                                {/* Top Pick - shown on larger tiles */}
                                {(isLarge || isMedium) && (
                                  <div className="absolute bottom-3 left-4 right-4 z-10">
                                    <div className="text-white/60 text-[10px] uppercase tracking-wide">Top: {data.topStock?.ticker}</div>
                                  </div>
                                )}

                                {/* Hover glow effect */}
                                <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
                              </button>
                            );
                          })}
                        </div>

                        {/* Legend bar */}
                        <div className={`mt-4 px-4 py-3 flex items-center justify-between text-xs rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
                          <div className="flex items-center gap-4">
                            <span className={`font-medium ${theme.textMuted}`}>YTD Performance:</span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded bg-[#10b981]"></div>
                              <span className={theme.textMuted}>+50%</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded bg-[#064e3b]"></div>
                              <span className={theme.textMuted}>0%</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded bg-[#dc2626]"></div>
                              <span className={theme.textMuted}>-30%</span>
                            </div>
                          </div>
                          <span className={`${theme.textMuted} opacity-70`}>Click sector to filter</span>
                        </div>
                      </div>

                      {/* Industry Breakdown for Top 3 Sectors */}
                      <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800/50' : 'bg-white'} shadow-sm`}>
                        <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${theme.textPrimary}`}>
                          <Briefcase className="w-5 h-5 text-purple-500" />
                          Industry Breakdown
                          <span className={`text-sm font-normal ml-auto ${theme.textMuted}`}>Top 3 Sectors</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {sortedSectors.slice(0, 3).map(([sector, data], idx) => (
                            <div key={sector} className={`rounded-xl p-4 ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'} border ${theme.border}`}>
                              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-600">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  idx === 0 ? 'bg-emerald-500 text-white' :
                                  idx === 1 ? 'bg-blue-500 text-white' :
                                  'bg-purple-500 text-white'
                                }`}>{idx + 1}</span>
                                <h4 className={`font-bold ${theme.textPrimary}`}>{sector}</h4>
                                <span className={`text-xs ml-auto px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} ${theme.textMuted}`}>
                                  {data.count} stocks
                                </span>
                              </div>
                              <div className="space-y-2">
                                {Object.entries(data.industries)
                                  .sort((a, b) => (b[1].totalScore / b[1].count) - (a[1].totalScore / a[1].count))
                                  .slice(0, 5)
                                  .map(([industry, indData]) => {
                                    const indAvg = indData.totalScore / indData.count;
                                    return (
                                      <div key={industry} className="flex items-center justify-between text-sm">
                                        <span className={`truncate flex-1 ${theme.textSecondary}`}>{industry}</span>
                                        <div className="flex items-center gap-2 ml-2">
                                          <span className={`text-xs ${theme.textMuted}`}>{indData.count}</span>
                                          <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                                            indAvg >= 70 ? 'bg-emerald-100 text-emerald-700' :
                                            indAvg >= 60 ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                          }`}>
                                            {indAvg.toFixed(1)}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sector Summary Table */}
                      <div className={`rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm overflow-hidden`}>
                        <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                          <h3 className={`text-sm font-bold flex items-center gap-2 ${theme.textPrimary}`}>
                            <BarChart3 className="w-4 h-4 text-amber-500" />
                            Sector Rankings by YTD Performance
                          </h3>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className={darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}>
                                <th className={`text-left py-2 px-3 font-medium text-xs ${theme.textMuted}`}>#</th>
                                <th className={`text-left py-2 px-3 font-medium text-xs ${theme.textMuted}`}>Sector</th>
                                <th className={`text-right py-2 px-3 font-medium text-xs ${theme.textMuted}`}>YTD</th>
                                <th className={`text-right py-2 px-3 font-medium text-xs ${theme.textMuted}`}>Score</th>
                                <th className={`text-right py-2 px-3 font-medium text-xs ${theme.textMuted}`}>Stocks</th>
                                <th className={`text-right py-2 px-3 font-medium text-xs ${theme.textMuted}`}>Top</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedSectors.map(([sector, data], idx) => (
                                <tr
                                  key={sector}
                                  onClick={() => {
                                    setSelectedSector(sector);
                                    setSelectedRegion('Indonesia');
                                    setActiveView('screener');
                                  }}
                                  className={`border-b ${theme.border} ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors cursor-pointer`}
                                >
                                  <td className={`py-2 px-3 ${theme.textMuted}`}>{idx + 1}</td>
                                  <td className={`py-2 px-3 font-medium ${theme.textPrimary}`}>{sector}</td>
                                  <td className={`py-2 px-3 text-right font-bold ${data.avgYTD >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {data.avgYTD >= 0 ? '+' : ''}{data.avgYTD.toFixed(1)}%
                                  </td>
                                  <td className={`py-2 px-3 text-right ${theme.textMuted}`}>{data.avgScore.toFixed(0)}</td>
                                  <td className={`py-2 px-3 text-right ${theme.textMuted}`}>{data.count}</td>
                                  <td className="py-2 px-3 text-right font-mono text-xs text-blue-500">{data.topStock?.ticker}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* DCF VALUATION VIEW */}
            {activeView === 'valuation' && selectedStock && (
              <div className="space-y-6">
                {/* Stock Header */}
                <div className={`rounded-xl p-6 border-2 ${darkMode ? 'bg-gradient-to-r from-slate-800 to-blue-900/50 border-slate-700' : 'bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className={`text-3xl font-bold ${theme.textPrimary}`}>{selectedStock.ticker}</h2>
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          selectedStock.region === 'US' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {selectedStock.region}
                        </span>
                      </div>
                      <p className={`text-lg mb-3 ${theme.textSecondary}`}>{selectedStock.name || selectedStock.Name}</p>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                          {selectedStock.sector}
                        </span>
                        {selectedStock.industry && (
                          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">
                            {selectedStock.industry}
                          </span>
                        )}
                      </div>
                    </div>
                    {(() => {
                      const scoreRating = getScoreRating(selectedStock.natanScore.total);
                      return (
                        <div className={`${scoreRating.bgClass} ${scoreRating.borderColor} border-2 rounded-xl p-5 text-center min-w-[140px]`}>
                          <div className="text-xs text-slate-600 uppercase font-bold mb-1">MF Score</div>
                          <div className={`text-4xl font-bold ${scoreRating.textClass}`}>
                            {selectedStock.natanScore.total}
                          </div>
                          <div className="text-xs mt-2">
                            {'⭐'.repeat(scoreRating.stars)}
                          </div>
                          <div className={`text-xs font-bold ${scoreRating.textClass} mt-1`}>
                            {scoreRating.rating}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Key Metrics Bar */}
                  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t ${theme.border}`}>
                    <div>
                      <div className={`text-xs uppercase font-bold mb-1 flex items-center gap-1.5 ${theme.textMuted}`}>
                        Current Price
                        {(() => {
                          const liveData = getLivePrice(selectedStock.ticker, selectedStock.Price);
                          return liveData.isLive ? (
                            <span className="flex items-center gap-1 text-emerald-500">
                              <Radio className="w-3 h-3 animate-pulse" />
                              LIVE
                            </span>
                          ) : null;
                        })()}
                      </div>
                      {(() => {
                        const liveData = getLivePrice(selectedStock.ticker, selectedStock.Price);
                        return (
                          <div className="flex items-baseline gap-2">
                            <div className={`text-2xl font-bold ${theme.textPrimary}`}>
                              {formatPrice(liveData.price, selectedStock.region)}
                            </div>
                            {liveData.isLive && liveData.changePercent !== undefined && (
                              <span className={`text-sm font-semibold ${liveData.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {liveData.changePercent >= 0 ? '+' : ''}{liveData.changePercent?.toFixed(2)}%
                              </span>
                            )}
                          </div>
                        );
                      })()}
                      {liveQuoteLoading && (
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Updating...
                        </div>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs uppercase font-bold mb-1 ${theme.textMuted}`}>Market Cap</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>
                        {formatMarketCap(
                          liveQuotes.get(selectedStock.ticker)?.marketCap || selectedStock["Market Cap"],
                          selectedStock.region
                        )}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs uppercase font-bold mb-1 ${theme.textMuted}`}>P/E Ratio</div>
                      <div className={`text-2xl font-bold ${theme.textPrimary}`}>
                        {formatRatio(liveQuotes.get(selectedStock.ticker)?.pe || selectedStock.PE)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs uppercase font-bold mb-1 ${theme.textMuted}`}>
                        YTD Return
                        {calculatedYTD && !selectedStock["Company YTD Return"] && (
                          <span className="ml-1 text-blue-500 text-[10px]">LIVE</span>
                        )}
                      </div>
                      {ytdLoading ? (
                        <div className={`text-2xl font-bold ${theme.textMuted} flex items-center gap-2`}>
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                        </div>
                      ) : (
                        <div className={`text-2xl font-bold ${
                          ((selectedStock["Company YTD Return"] ?? calculatedYTD?.ytdReturn) || 0) >= 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}>
                          {formatPercent(selectedStock["Company YTD Return"] ?? calculatedYTD?.ytdReturn)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Data Actions */}
                  {liveDataEnabled && liveServiceAvailable && (
                    <div className={`flex items-center gap-3 mt-4 pt-4 border-t ${theme.border}`}>
                      <button
                        onClick={() => refreshLiveQuote(selectedStock)}
                        disabled={liveQuoteLoading}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${liveQuoteLoading ? 'animate-spin' : ''}`} />
                        Refresh Price
                      </button>
                      {liveQuotes.get(selectedStock.ticker)?.lastUpdated && (
                        <span className={`text-xs ${theme.textMuted}`}>
                          Updated: {new Date(liveQuotes.get(selectedStock.ticker).lastUpdated).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Interactive DCF Valuation - Embedded Component */}
                <InteractiveDCF
                  stock={selectedStock}
                  region={selectedStock.region || selectedStock.Region || 'Indonesia'}
                  darkMode={darkMode}
                />
                {/* Score Breakdown */}
                <div className={`rounded-xl p-6 border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <h4 className={`font-bold mb-5 text-lg ${theme.textPrimary}`}>8-Factor Score Analysis</h4>
                  <div className="space-y-4">
                    {Object.entries(selectedStock.natanScore.breakdown).map(([key, value]) => {
                      const maxValues = {
                        technical: 20,
                        sentiment: 15,
                        valuation: 15,
                        quality: 15,
                        liquidity: 10,
                        growth: 10,
                        financial_health: 10,
                        analyst_coverage: 5
                      };
                      const maxValue = maxValues[key];
                      const percentage = (value / maxValue) * 100;

                      return (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`capitalize text-sm font-semibold ${theme.textSecondary}`}>
                              {key.replace('_', ' ')}
                            </span>
                            <span className={`font-bold ${theme.textPrimary}`}>{value}/{maxValue}</span>
                          </div>
                          <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            <div
                              className={`h-3 rounded-full transition-all ${
                                percentage >= 80 ? 'bg-emerald-500' :
                                percentage >= 60 ? 'bg-blue-500' :
                                percentage >= 40 ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}
                              style={{width: `${percentage}%`}}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Risk Factors */}
                <div className={`rounded-lg p-6 border-2 ${darkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-amber-500' : 'text-amber-600'}`} />
                    <h4 className={`font-bold text-sm ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>Key Risk Factors & Disclosures</h4>
                  </div>
                  <ul className={`text-sm space-y-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                    <li>• DCF valuation is highly sensitive to WACC and terminal growth assumptions</li>
                    <li>• Actual results may vary significantly from projections due to market volatility</li>
                    <li>• Company-specific risks include competitive pressures, execution risk, and regulatory changes</li>
                    <li>• Macro risks include interest rate changes, currency fluctuations, and economic cycles</li>
                    <li>• This analysis is for informational purposes only and does not constitute investment advice</li>
                  </ul>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveView('financials')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Financial Statements →
                  </button>
                  <button
                    onClick={() => setActiveView('screener')}
                    className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                  >
                    ← Back to Screener
                  </button>
                </div>
              </div>
            )}

            {/* FINANCIAL STATEMENTS VIEW - Income Statement, Balance Sheet, Cash Flow */}
            {activeView === 'financials' && selectedStock && (
              <div className="space-y-6">
                {/* Header */}
                <div className={`bg-gradient-to-r ${darkMode ? 'from-slate-800 to-purple-900' : 'from-slate-100 to-purple-100'} rounded-xl p-6 shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {selectedStock.ticker} - Financial Statements
                      </h2>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {selectedStock.Name || selectedStock.name} • {selectedStock["GICS Sector"] || selectedStock.sector}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveView('comps')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4 inline mr-2" />
                        Comps
                      </button>
                      <button
                        onClick={() => setActiveView('valuation')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Calculator className="w-4 h-4 inline mr-2" />
                        DCF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Chart with Technical Indicators */}
                <div className={`rounded-xl p-6 border shadow-lg ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <StockChart
                    stock={selectedStock}
                    darkMode={darkMode}
                  />
                </div>

                {/* Financial Statements Component */}
                <FinancialStatements
                  stock={selectedStock}
                  darkMode={darkMode}
                />

                {/* Navigation */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActiveView('comps')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Comparable Analysis →
                  </button>
                  <button
                    onClick={() => setActiveView('screener')}
                    className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                  >
                    ← Back to Screener
                  </button>
                </div>
              </div>
            )}

            {/* No Stock Selected for Financials */}
            {activeView === 'financials' && !selectedStock && (
              <div className="text-center py-16">
                <FileText className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Select a Stock
                </h3>
                <p className={`mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Select a stock from the screener to view financial statements
                </p>
                <button
                  onClick={() => setActiveView('screener')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Go to Screener
                </button>
              </div>
            )}

            {/* COMPARABLE ANALYSIS VIEW - Institutional Grade */}
            {activeView === 'comps' && selectedStock && selectedStock.comps && (() => {
              // Get sector-specific valuation framework
              const sectorKey = selectedStock["GICS Sector"] || selectedStock.sector || 'Financials';
              const sectorFramework = SECTOR_VALUATION_FRAMEWORKS[sectorKey] || SECTOR_VALUATION_FRAMEWORKS['Financials'];

              // Calculate premium/discount to peers
              const peerMedianPE = selectedStock.comps.medianPE || 0;
              const peerMedianPB = selectedStock.comps.medianPB || 0;
              const targetPE = selectedStock.PE || 0;
              const targetPB = selectedStock.PB || 0;
              const pePremium = peerMedianPE > 0 && targetPE > 0 ? ((targetPE / peerMedianPE) - 1) * 100 : 0;
              const pbPremium = peerMedianPB > 0 && targetPB > 0 ? ((targetPB / peerMedianPB) - 1) * 100 : 0;

              // Get commodity exposure for the sector
              const commodityExposure = sectorFramework.commodityExposure || {};
              const relevantCommodities = Object.keys(commodityExposure).filter(c => COMMODITY_FACTORS[c]);

              // Calculate relative value score
              const calculateRelativeValueScore = () => {
                let score = 50; // Base score
                const peers = selectedStock.comps.peers || [];
                if (peers.length === 0) return score;

                // ROE comparison (higher is better)
                const peerAvgROE = peers.filter(p => p.roe).reduce((sum, p) => sum + p.roe, 0) / Math.max(peers.filter(p => p.roe).length, 1);
                if (selectedStock.ROE && peerAvgROE > 0) {
                  score += Math.min(15, Math.max(-15, ((selectedStock.ROE / peerAvgROE) - 1) * 30));
                }

                // Valuation discount (lower P/E is better for value)
                if (pePremium !== 0) {
                  score += Math.min(15, Math.max(-15, -pePremium * 0.5));
                }

                // Growth premium
                const targetGrowth = selectedStock["Revenue Growth YoY"] || selectedStock["Revenue Growth"] || 0;
                const peerAvgGrowth = peers.filter(p => p.revenueGrowth).reduce((sum, p) => sum + p.revenueGrowth, 0) / Math.max(peers.filter(p => p.revenueGrowth).length, 1);
                if (targetGrowth && peerAvgGrowth) {
                  score += Math.min(10, Math.max(-10, (targetGrowth - peerAvgGrowth) * 0.5));
                }

                return Math.min(100, Math.max(0, score));
              };

              const relativeValueScore = calculateRelativeValueScore();

              return (
              <div className="space-y-6">
                {/* Header with Sector Framework */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-800 to-slate-900'} text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold">{selectedStock.ticker}</h2>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          selectedStock.region === 'US' ? 'bg-blue-500/30 text-blue-200' : 'bg-red-500/30 text-red-200'
                        }`}>
                          {selectedStock.region || 'Indonesia'}
                        </span>
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-600 text-slate-200">
                          {sectorKey}
                        </span>
                      </div>
                      <p className="text-slate-300">{selectedStock.Company || selectedStock.Name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Relative Value Score</div>
                      <div className={`text-3xl font-bold ${
                        relativeValueScore >= 70 ? 'text-emerald-400' :
                        relativeValueScore >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {relativeValueScore.toFixed(0)}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">
                    <strong>Methodology:</strong> {sectorFramework.description} • Based on Rosenbaum & Pearl, Damodaran, Goldman Sachs research
                  </p>
                </div>

                {/* Valuation Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                    <div className={`text-xs uppercase font-semibold mb-2 ${theme.textMuted}`}>Current Price</div>
                    <div className={`text-2xl font-bold ${theme.textPrimary}`}>
                      {formatPrice(selectedStock.Price || selectedStock.Close, selectedStock.region)}
                    </div>
                    <div className={`text-sm mt-1 font-semibold ${(selectedStock['Company YTD Return'] || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {(selectedStock['Company YTD Return'] || 0) >= 0 ? '+' : ''}{(selectedStock['Company YTD Return'] || 0).toFixed(1)}% YTD
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                    <div className={`text-xs uppercase font-semibold mb-2 ${theme.textMuted}`}>Comps Implied Value</div>
                    <div className="text-2xl font-bold text-blue-500">
                      {formatPrice(selectedStock.comps.avgImpliedValue, selectedStock.region)}
                    </div>
                    <div className={`text-sm mt-1 font-semibold ${(selectedStock.comps.upside || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {(selectedStock.comps.upside || 0) >= 0 ? '+' : ''}{(selectedStock.comps.upside || 0).toFixed(1)}% Upside
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                    <div className={`text-xs uppercase font-semibold mb-2 ${theme.textMuted}`}>DCF Fair Value</div>
                    <div className="text-2xl font-bold text-blue-500">
                      {formatPrice(selectedStock.dcf?.fairValue, selectedStock.region)}
                    </div>
                    <div className={`text-sm mt-1 font-semibold ${(selectedStock.dcf?.upside || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {(selectedStock.dcf?.upside || 0) >= 0 ? '+' : ''}{(selectedStock.dcf?.upside || 0).toFixed(1)}% Upside
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                    <div className={`text-xs uppercase font-semibold mb-2 ${theme.textMuted}`}>Blended Target</div>
                    <div className={`text-2xl font-bold ${(((selectedStock.dcf?.upside || 0) + (selectedStock.comps.upside || 0)) / 2) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {formatPrice(((selectedStock.dcf?.fairValue || 0) + (selectedStock.comps.avgImpliedValue || 0)) / 2, selectedStock.region)}
                    </div>
                    <div className={`text-sm mt-1 font-semibold ${
                      (((selectedStock.dcf?.upside || 0) + (selectedStock.comps.upside || 0)) / 2) >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {(((selectedStock.dcf?.upside || 0) + (selectedStock.comps.upside || 0)) / 2) >= 0 ? '+' : ''}
                      {(((selectedStock.dcf?.upside || 0) + (selectedStock.comps.upside || 0)) / 2).toFixed(1)}% Upside
                    </div>
                  </div>
                </div>

                {/* Sector-Specific Valuation Framework */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className={`w-5 h-5 ${theme.textMuted}`} />
                    <div>
                      <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Sector Valuation Framework: {sectorKey}</h3>
                      <p className={`text-sm ${theme.textMuted}`}>{sectorFramework.valuationNotes}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className={`rounded-lg p-4 border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Primary Multiples</div>
                      <div className="flex flex-wrap gap-2">
                        {sectorFramework.primaryMultiples.map((m, i) => (
                          <span key={i} className={`px-2 py-1 rounded text-xs font-semibold ${darkMode ? 'bg-slate-600 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>{m}</span>
                        ))}
                      </div>
                    </div>
                    <div className={`rounded-lg p-4 border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Secondary Metrics</div>
                      <div className="flex flex-wrap gap-2">
                        {sectorFramework.secondaryMultiples.slice(0, 4).map((m, i) => (
                          <span key={i} className={`px-2 py-1 rounded text-xs font-semibold ${darkMode ? 'bg-slate-600 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>{m}</span>
                        ))}
                      </div>
                    </div>
                    <div className={`rounded-lg p-4 border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Key Drivers</div>
                      <div className="flex flex-wrap gap-2">
                        {sectorFramework.keyDrivers.slice(0, 4).map((d, i) => (
                          <span key={i} className={`px-2 py-1 rounded text-xs font-medium ${darkMode ? 'bg-slate-600 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium/Discount Analysis */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className={`w-5 h-5 ${theme.textMuted}`} />
                    <div>
                      <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Premium/Discount Analysis vs Peers</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Based on Goldman Sachs, Morgan Stanley relative valuation frameworks</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* P/E Premium/Discount */}
                    <div className={`rounded-lg p-4 ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-bold ${theme.textPrimary}`}>P/E Multiple</span>
                        <span className={`text-lg font-black ${pePremium > 10 ? 'text-red-600' : pePremium < -10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {pePremium > 0 ? '+' : ''}{pePremium.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <div className={`${theme.textMuted}`}>Target</div>
                          <div className={`font-bold ${theme.textPrimary}`}>{formatRatio(targetPE)}</div>
                        </div>
                        <div className="text-2xl text-slate-400">→</div>
                        <div>
                          <div className={`${theme.textMuted}`}>Peer Median</div>
                          <div className="font-bold text-purple-600">{formatRatio(peerMedianPE)}</div>
                        </div>
                      </div>
                      <div className="mt-3 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${pePremium > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, Math.abs(pePremium) + 50)}%`, marginLeft: pePremium < 0 ? '0' : 'auto' }}
                        />
                      </div>
                      <div className={`text-xs mt-2 ${theme.textMuted}`}>
                        {pePremium > 10 ? '⚠️ Trading at significant premium - may be overvalued' :
                         pePremium < -10 ? '✅ Trading at discount - potential value opportunity' :
                         '➡️ Trading in line with peers'}
                      </div>
                    </div>

                    {/* P/B Premium/Discount */}
                    <div className={`rounded-lg p-4 ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-bold ${theme.textPrimary}`}>P/B Multiple</span>
                        <span className={`text-lg font-black ${pbPremium > 10 ? 'text-red-600' : pbPremium < -10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {pbPremium > 0 ? '+' : ''}{pbPremium.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <div className={`${theme.textMuted}`}>Target</div>
                          <div className={`font-bold ${theme.textPrimary}`}>{formatRatio(targetPB)}</div>
                        </div>
                        <div className="text-2xl text-slate-400">→</div>
                        <div>
                          <div className={`${theme.textMuted}`}>Peer Median</div>
                          <div className="font-bold text-purple-600">{formatRatio(peerMedianPB)}</div>
                        </div>
                      </div>
                      <div className="mt-3 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${pbPremium > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, Math.abs(pbPremium) + 50)}%`, marginLeft: pbPremium < 0 ? '0' : 'auto' }}
                        />
                      </div>
                      <div className={`text-xs mt-2 ${theme.textMuted}`}>
                        {sectorKey === 'Financials' ?
                          (pbPremium > 20 ? '⚠️ High P/TBV - needs high ROE to justify' :
                           pbPremium < -20 ? '✅ Trading below book - potential value' :
                           '➡️ Fair P/TBV valuation') :
                          (pbPremium > 10 ? '⚠️ Premium to book value' : 'Trading near book value')}
                      </div>
                    </div>
                  </div>

                  {/* Premium Justification Factors */}
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className={`text-sm font-bold mb-3 ${theme.textPrimary}`}>Premium/Discount Justification Factors</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {PREMIUM_DISCOUNT_FACTORS.quantitative.slice(0, 4).map((factor, i) => {
                        let score = 0;
                        if (factor.factor === 'ROE vs Peers' && selectedStock.ROE) {
                          const peerAvgROE = (selectedStock.comps.peers || []).filter(p => p.roe).reduce((sum, p) => sum + p.roe, 0) / Math.max((selectedStock.comps.peers || []).filter(p => p.roe).length, 1);
                          score = peerAvgROE > 0 ? ((selectedStock.ROE / peerAvgROE) - 1) * 100 : 0;
                        } else if (factor.factor === 'Growth Rate') {
                          score = (selectedStock["Revenue Growth YoY"] || selectedStock["Revenue Growth"] || 0) > 10 ? 20 : (selectedStock["Revenue Growth YoY"] || selectedStock["Revenue Growth"] || 0) > 0 ? 10 : -10;
                        } else if (factor.factor === 'Margin Profile') {
                          score = (selectedStock["Net Margin"] || selectedStock.netMargin || 0) > 15 ? 20 : (selectedStock["Net Margin"] || selectedStock.netMargin || 0) > 5 ? 10 : -10;
                        } else if (factor.factor === 'Balance Sheet') {
                          const de = selectedStock["D/E Ratio"] || selectedStock.deRatio || 0;
                          score = de < 0.5 ? 20 : de < 1 ? 10 : de > 2 ? -20 : 0;
                        }
                        return (
                          <div key={i} className={`rounded-lg p-3 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <div className={`text-xs font-bold mb-1 ${theme.textMuted}`}>{factor.factor}</div>
                            <div className={`text-lg font-bold ${score > 10 ? 'text-emerald-600' : score < -10 ? 'text-red-600' : 'text-amber-600'}`}>
                              {score > 10 ? '✓ Premium' : score < -10 ? '✗ Discount' : '→ Fair'}
                            </div>
                            <div className={`text-xs ${theme.textMuted}`}>{factor.description}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Commodity Sensitivity (if applicable) */}
                {relevantCommodities.length > 0 && (
                  <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className={`w-5 h-5 ${theme.textMuted}`} />
                      <div>
                        <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Commodity Price Sensitivity</h3>
                        <p className={`text-sm ${theme.textMuted}`}>Key commodity exposures affecting valuation (Bloomberg Intelligence, Wood Mackenzie)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {relevantCommodities.map((commodityName, i) => {
                        const commodity = COMMODITY_FACTORS[commodityName];
                        const exposure = commodityExposure[commodityName];
                        return (
                          <div key={i} className={`rounded-lg p-4 border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-orange-50 border-orange-200'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-bold ${theme.textPrimary}`}>{commodityName}</span>
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                exposure.sensitivity === 'high' ? 'bg-red-100 text-red-700' :
                                exposure.sensitivity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {exposure.sensitivity.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl font-black text-orange-700">
                                {commodity.currentPrice?.toLocaleString()}
                              </span>
                              <span className={`text-sm ${theme.textMuted}`}>{commodity.unit}</span>
                              <span className={`text-sm font-bold ${commodity.ytdChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {commodity.ytdChange >= 0 ? '+' : ''}{commodity.ytdChange}%
                              </span>
                            </div>
                            <div className={`text-xs ${theme.textMuted}`}>
                              Impact: {exposure.direction === 'positive' ? '📈 Higher prices benefit' : '📉 Higher prices hurt'} this company
                            </div>
                            {commodity.consensusForecast && (
                              <div className={`text-xs mt-2 pt-2 border-t ${darkMode ? 'border-slate-600' : 'border-orange-200'} ${theme.textMuted}`}>
                                Consensus: {commodity.consensusForecast['2025']} ({commodity.unit}) by 2025
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Institutional Peer Comparison Table */}
                <div className={`rounded-xl border-2 shadow-lg overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-r from-slate-100 to-purple-100 border-slate-200'}`}>
                    <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Peer Group Comparable Analysis</h3>
                    <p className={`text-sm ${theme.textMuted}`}>Investment Banking-Style Comp Table • {selectedStock.comps.peerCount || 0} Comparable Companies</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className={`${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-xs font-bold uppercase sticky left-0 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} border-b-2 ${theme.border}`}>Company</th>
                          <th className={`px-4 py-3 text-right text-xs font-bold uppercase ${theme.textMuted} border-b-2 ${theme.border}`}>Market Cap</th>
                          <th className={`px-4 py-3 text-right text-xs font-bold uppercase ${theme.textMuted} border-b-2 ${theme.border}`}>P/E</th>
                          <th className={`px-4 py-3 text-right text-xs font-bold uppercase ${theme.textMuted} border-b-2 ${theme.border}`}>P/B</th>
                          <th className={`px-4 py-3 text-right text-xs font-bold uppercase ${theme.textMuted} border-b-2 ${theme.border}`}>EV/EBITDA</th>
                          <th className={`px-4 py-3 text-right text-xs font-bold uppercase ${theme.textMuted} border-b-2 ${theme.border}`}>ROE %</th>
                          <th className={`px-4 py-3 text-right text-xs font-bold uppercase ${theme.textMuted} border-b-2 ${theme.border}`}>Rev Growth</th>
                          <th className={`px-4 py-3 text-right text-xs font-bold uppercase ${theme.textMuted} border-b-2 ${theme.border}`}>Net Margin</th>
                          <th className={`px-4 py-3 text-right text-xs font-bold uppercase ${theme.textMuted} border-b-2 ${theme.border}`}>Div Yield</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme.tableBorder}`}>
                        {/* Target Company Row */}
                        <tr className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} font-bold`}>
                          <td className={`px-4 py-3 sticky left-0 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 font-mono">{selectedStock.ticker}</span>
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-200 text-blue-800">TARGET</span>
                            </div>
                          </td>
                          <td className={`px-4 py-3 text-right ${theme.textPrimary}`}>{formatMarketCap(selectedStock["Market Cap"], selectedStock.region)}</td>
                          <td className={`px-4 py-3 text-right ${theme.textPrimary}`}>{formatRatio(selectedStock.PE)}</td>
                          <td className={`px-4 py-3 text-right ${theme.textPrimary}`}>{formatRatio(selectedStock.PB)}</td>
                          <td className={`px-4 py-3 text-right ${theme.textPrimary}`}>{formatRatio(selectedStock["EV/EBITDA"])}</td>
                          <td className={`px-4 py-3 text-right ${selectedStock.ROE >= 15 ? 'text-emerald-600 font-bold' : theme.textPrimary}`}>
                            {selectedStock.ROE ? `${selectedStock.ROE.toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className={`px-4 py-3 text-right ${(selectedStock["Revenue Growth YoY"] || 0) >= 10 ? 'text-emerald-600' : (selectedStock["Revenue Growth YoY"] || 0) < 0 ? 'text-red-600' : theme.textPrimary}`}>
                            {selectedStock["Revenue Growth YoY"] ? `${selectedStock["Revenue Growth YoY"].toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className={`px-4 py-3 text-right ${theme.textPrimary}`}>
                            {selectedStock["Net Margin"] ? `${selectedStock["Net Margin"].toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className={`px-4 py-3 text-right ${(selectedStock["Div Yield"] || 0) >= 3 ? 'text-emerald-600 font-bold' : theme.textPrimary}`}>
                            {selectedStock["Div Yield"] ? `${selectedStock["Div Yield"].toFixed(2)}%` : '-'}
                          </td>
                        </tr>

                        {/* Peer Rows */}
                        {(selectedStock.comps.peers || []).map((peer, idx) => (
                          <tr key={idx} className={`${theme.tableRow}`}>
                            <td className={`px-4 py-3 sticky left-0 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                              <span className="font-mono font-medium text-slate-600">{peer.ticker}</span>
                            </td>
                            <td className={`px-4 py-3 text-right ${theme.textSecondary}`}>{formatMarketCap(peer.marketCap, selectedStock.region)}</td>
                            <td className={`px-4 py-3 text-right ${theme.textSecondary}`}>{formatRatio(peer.pe)}</td>
                            <td className={`px-4 py-3 text-right ${theme.textSecondary}`}>{formatRatio(peer.pb)}</td>
                            <td className={`px-4 py-3 text-right ${theme.textSecondary}`}>{formatRatio(peer.evEbitda)}</td>
                            <td className={`px-4 py-3 text-right ${peer.roe >= 15 ? 'text-emerald-600' : theme.textSecondary}`}>
                              {peer.roe ? `${peer.roe.toFixed(1)}%` : 'N/A'}
                            </td>
                            <td className={`px-4 py-3 text-right ${(peer.revenueGrowth || 0) >= 10 ? 'text-emerald-600' : (peer.revenueGrowth || 0) < 0 ? 'text-red-600' : theme.textSecondary}`}>
                              {peer.revenueGrowth ? `${peer.revenueGrowth.toFixed(1)}%` : 'N/A'}
                            </td>
                            <td className={`px-4 py-3 text-right ${theme.textSecondary}`}>
                              {peer.netMargin ? `${peer.netMargin.toFixed(1)}%` : 'N/A'}
                            </td>
                            <td className={`px-4 py-3 text-right ${theme.textSecondary}`}>
                              {peer.divYield ? `${peer.divYield.toFixed(2)}%` : '-'}
                            </td>
                          </tr>
                        ))}

                        {/* Summary Statistics */}
                        <tr className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} font-bold border-t-2 ${theme.border}`}>
                          <td className={`px-4 py-3 sticky left-0 ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} text-purple-700`}>Peer Median</td>
                          <td className="px-4 py-3 text-right text-purple-700">-</td>
                          <td className="px-4 py-3 text-right text-purple-700">{formatRatio(selectedStock.comps.medianPE)}</td>
                          <td className="px-4 py-3 text-right text-purple-700">{formatRatio(selectedStock.comps.medianPB)}</td>
                          <td className="px-4 py-3 text-right text-purple-700">-</td>
                          <td className="px-4 py-3 text-right text-purple-700">-</td>
                          <td className="px-4 py-3 text-right text-purple-700">-</td>
                          <td className="px-4 py-3 text-right text-purple-700">-</td>
                          <td className="px-4 py-3 text-right text-purple-700">-</td>
                        </tr>
                        <tr className={`${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                          <td className={`px-4 py-3 sticky left-0 ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} font-bold ${theme.textMuted}`}>Target vs Median</td>
                          <td className="px-4 py-3 text-right">-</td>
                          <td className={`px-4 py-3 text-right font-bold ${pePremium > 10 ? 'text-red-600' : pePremium < -10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {pePremium > 0 ? '+' : ''}{pePremium.toFixed(0)}%
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${pbPremium > 10 ? 'text-red-600' : pbPremium < -10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {pbPremium > 0 ? '+' : ''}{pbPremium.toFixed(0)}%
                          </td>
                          <td className="px-4 py-3 text-right">-</td>
                          <td className="px-4 py-3 text-right">-</td>
                          <td className="px-4 py-3 text-right">-</td>
                          <td className="px-4 py-3 text-right">-</td>
                          <td className="px-4 py-3 text-right">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Valuation Summary Football Field */}
                <div className={`rounded-xl p-6 border-2 shadow-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-emerald-200'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Valuation Football Field</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Multi-methodology valuation range (DCF + Comps)</p>
                    </div>
                  </div>

                  {/* Football Field Chart */}
                  <div className="space-y-4">
                    {[
                      { method: 'DCF Analysis', low: (selectedStock.dcf?.fairValue || 0) * 0.85, mid: selectedStock.dcf?.fairValue || 0, high: (selectedStock.dcf?.fairValue || 0) * 1.15, color: 'blue' },
                      { method: 'Comps (P/E)', low: (selectedStock.comps.avgImpliedValue || 0) * 0.9, mid: selectedStock.comps.avgImpliedValue || 0, high: (selectedStock.comps.avgImpliedValue || 0) * 1.1, color: 'purple' },
                      { method: 'Blended Target', low: ((selectedStock.dcf?.fairValue || 0) + (selectedStock.comps.avgImpliedValue || 0)) / 2 * 0.9, mid: ((selectedStock.dcf?.fairValue || 0) + (selectedStock.comps.avgImpliedValue || 0)) / 2, high: ((selectedStock.dcf?.fairValue || 0) + (selectedStock.comps.avgImpliedValue || 0)) / 2 * 1.1, color: 'emerald' }
                    ].map((item, i) => {
                      const currentPrice = selectedStock.Price || selectedStock.Close || 0;
                      const maxVal = Math.max(item.high, currentPrice) * 1.2;
                      const minVal = Math.min(item.low, currentPrice) * 0.8;
                      const range = maxVal - minVal;
                      const lowPct = ((item.low - minVal) / range) * 100;
                      const highPct = ((item.high - minVal) / range) * 100;
                      const midPct = ((item.mid - minVal) / range) * 100;
                      const pricePct = ((currentPrice - minVal) / range) * 100;

                      return (
                        <div key={i} className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-bold ${theme.textPrimary}`}>{item.method}</span>
                            <span className={`text-sm font-bold text-${item.color}-600`}>
                              {formatPrice(item.mid, selectedStock.region)}
                            </span>
                          </div>
                          <div className="relative h-8 bg-slate-200 rounded-full overflow-hidden">
                            {/* Range bar */}
                            <div
                              className={`absolute h-full bg-${item.color}-200 rounded-full`}
                              style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
                            />
                            {/* Mid point */}
                            <div
                              className={`absolute w-1 h-full bg-${item.color}-600`}
                              style={{ left: `${midPct}%` }}
                            />
                            {/* Current price marker */}
                            <div
                              className="absolute w-3 h-3 bg-slate-900 rounded-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 border-2 border-white z-10"
                              style={{ left: `${pricePct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className={theme.textMuted}>{formatPrice(item.low, selectedStock.region)}</span>
                            <span className={theme.textMuted}>Current: {formatPrice(currentPrice, selectedStock.region)}</span>
                            <span className={theme.textMuted}>{formatPrice(item.high, selectedStock.region)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveView('valuation')}
                    className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                  >
                    ← DCF Analysis
                  </button>
                  <button
                    onClick={() => setActiveView('screener')}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Back to Screener
                  </button>
                </div>
              </div>
            );
            })()}

            {/* INSTITUTIONAL BACKTESTING TAB */}
            {activeView === 'backtest' && (
              <div className="space-y-6">
                {/* Header */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-800 to-slate-900'} text-white`}>
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-3">
                    <History className="w-6 h-6" />
                    Strategy Backtesting
                  </h2>
                  <p className="text-slate-300 text-sm">
                    Factor-based portfolio simulation • CFA Institute methodology • Monte Carlo simulation with factor tilts
                  </p>
                </div>

                {/* Parameters Panel */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                    <Settings className={`w-5 h-5 ${theme.textMuted}`} />
                    <div>
                      <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Backtest Parameters</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Configure your factor-based strategy simulation</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Start Date</label>
                      <input
                        type="date"
                        value={backtestParams.startDate}
                        onChange={(e) => setBacktestParams(p => ({ ...p, startDate: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>End Date</label>
                      <input
                        type="date"
                        value={backtestParams.endDate}
                        onChange={(e) => setBacktestParams(p => ({ ...p, endDate: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Top N Stocks</label>
                      <select
                        value={backtestParams.topN}
                        onChange={(e) => setBacktestParams(p => ({ ...p, topN: parseInt(e.target.value) }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                      >
                        <option value={10}>Top 10</option>
                        <option value={20}>Top 20</option>
                        <option value={30}>Top 30</option>
                        <option value={50}>Top 50</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Rebalance</label>
                      <select
                        value={backtestParams.rebalanceFreq}
                        onChange={(e) => setBacktestParams(p => ({ ...p, rebalanceFreq: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Min Score</label>
                      <select
                        value={backtestParams.minScore}
                        onChange={(e) => setBacktestParams(p => ({ ...p, minScore: parseInt(e.target.value) }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                      >
                        <option value={50}>50+ (Broad)</option>
                        <option value={60}>60+ (Quality)</option>
                        <option value={70}>70+ (High Quality)</option>
                        <option value={80}>80+ (Top Tier)</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Initial Capital</label>
                      <select
                        value={backtestParams.initialCapital}
                        onChange={(e) => setBacktestParams(p => ({ ...p, initialCapital: parseInt(e.target.value) }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                      >
                        <option value={100000}>$100,000</option>
                        <option value={500000}>$500,000</option>
                        <option value={1000000}>$1,000,000</option>
                        <option value={10000000}>$10,000,000</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-2 ${theme.textMuted}`}>Transaction Cost</label>
                      <select
                        value={backtestParams.transactionCost}
                        onChange={(e) => setBacktestParams(p => ({ ...p, transactionCost: parseFloat(e.target.value) }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                      >
                        <option value={0.0005}>5 bps (Institutional)</option>
                        <option value={0.001}>10 bps (Prime Broker)</option>
                        <option value={0.002}>20 bps (Retail)</option>
                        <option value={0.005}>50 bps (Emerging Markets)</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={runBacktest}
                        disabled={backtestLoading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                      >
                        {backtestLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Run Backtest
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {backtestError && (
                    <div className={`rounded-lg p-4 ${darkMode ? 'bg-red-900/30 border border-red-700 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                      <AlertCircle className="w-5 h-5 inline mr-2" />
                      {backtestError}
                    </div>
                  )}
                </div>

                {/* Results Section */}
                {backtestResults && (
                  <>
                    {/* Performance Summary */}
                    <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                      <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                        <TrendingUp className={`w-5 h-5 ${theme.textMuted}`} />
                        <div>
                          <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Performance Summary</h3>
                          <p className={`text-sm ${theme.textMuted}`}>
                            {backtestResults.params.startDate} to {backtestResults.params.endDate} • {backtestResults.stockCount} stocks
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                          <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Total Return</div>
                          <div className={`text-2xl font-black ${backtestResults.totalReturn >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                            {backtestResults.totalReturn >= 0 ? '+' : ''}{backtestResults.totalReturn.toFixed(1)}%
                          </div>
                          <div className={`text-xs mt-1 ${theme.textMuted}`}>
                            vs Benchmark: {backtestResults.benchmarkReturn >= 0 ? '+' : ''}{backtestResults.benchmarkReturn.toFixed(1)}%
                          </div>
                        </div>

                        <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                          <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Alpha</div>
                          <div className={`text-2xl font-bold ${backtestResults.alpha >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {backtestResults.alpha >= 0 ? '+' : ''}{backtestResults.alpha.toFixed(1)}%
                          </div>
                          <div className={`text-xs mt-1 ${theme.textMuted}`}>Excess return</div>
                        </div>

                        <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                          <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Sharpe Ratio</div>
                          <div className={`text-2xl font-bold ${backtestResults.sharpeRatio >= 1 ? 'text-emerald-500' : backtestResults.sharpeRatio >= 0.5 ? 'text-amber-500' : 'text-red-500'}`}>
                            {backtestResults.sharpeRatio.toFixed(2)}
                          </div>
                          <div className={`text-xs mt-1 ${theme.textMuted}`}>
                            {backtestResults.sharpeRatio >= 1 ? 'Excellent' : backtestResults.sharpeRatio >= 0.5 ? 'Good' : 'Below Target'}
                          </div>
                        </div>

                        <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                          <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Sortino Ratio</div>
                          <div className={`text-2xl font-bold ${theme.textPrimary}`}>
                            {backtestResults.sortinoRatio.toFixed(2)}
                          </div>
                          <div className={`text-xs mt-1 ${theme.textMuted}`}>Downside risk-adj.</div>
                        </div>

                        <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                          <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Max Drawdown</div>
                          <div className="text-2xl font-bold text-red-500">
                            -{backtestResults.maxDrawdown.toFixed(1)}%
                          </div>
                          <div className={`text-xs mt-1 ${theme.textMuted}`}>Peak to trough</div>
                        </div>

                        <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                          <div className={`text-xs uppercase font-semibold mb-1 ${theme.textMuted}`}>Win Rate</div>
                          <div className={`text-2xl font-bold ${theme.textPrimary}`}>
                            {backtestResults.winRate.toFixed(0)}%
                          </div>
                          <div className={`text-xs mt-1 ${theme.textMuted}`}>
                            Hit Rate: {backtestResults.hitRate.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Equity Curve Chart */}
                    <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                      <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                        <BarChart3 className={`w-5 h-5 ${theme.textMuted}`} />
                        <div>
                          <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Equity Curve</h3>
                          <p className={`text-sm ${theme.textMuted}`}>Portfolio value over time vs benchmark</p>
                        </div>
                      </div>

                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={backtestResults.equityCurve}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 11 }}
                              stroke="#64748b"
                            />
                            <YAxis
                              tick={{ fontSize: 11 }}
                              stroke="#64748b"
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                            />
                            <Tooltip
                              formatter={(value, name) => [
                                `$${value.toLocaleString()}`,
                                name === 'portfolio' ? 'Portfolio Strategy' : 'Benchmark'
                              ]}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                            />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="benchmark"
                              stroke="#94a3b8"
                              fill="#f1f5f9"
                              strokeWidth={2}
                              name="Benchmark"
                            />
                            <Area
                              type="monotone"
                              dataKey="portfolio"
                              stroke="#7c3aed"
                              fill="#ede9fe"
                              strokeWidth={2}
                              name="Portfolio Strategy"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Drawdown Chart */}
                    <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                      <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                        <ArrowDownRight className={`w-5 h-5 ${theme.textMuted}`} />
                        <div>
                          <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Drawdown Analysis</h3>
                          <p className={`text-sm ${theme.textMuted}`}>Peak-to-trough decline over time</p>
                        </div>
                      </div>

                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={backtestResults.equityCurve}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 11 }}
                              stroke="#64748b"
                            />
                            <YAxis
                              tick={{ fontSize: 11 }}
                              stroke="#64748b"
                              tickFormatter={(value) => `${value.toFixed(0)}%`}
                              domain={['dataMin', 0]}
                            />
                            <Tooltip
                              formatter={(value) => [`${value.toFixed(2)}%`, 'Drawdown']}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                            />
                            <ReferenceLine y={0} stroke="#64748b" />
                            <Area
                              type="monotone"
                              dataKey="drawdown"
                              stroke="#ef4444"
                              fill="#fee2e2"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Portfolio Holdings */}
                    <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-slate-200">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200">
                        <Building2 className="w-6 h-6 text-slate-600" />
                        <div>
                          <h3 className="text-xl font-black text-slate-900">Strategy Holdings</h3>
                          <p className="text-sm text-slate-600">
                            Top {backtestResults.stockCount} stocks by MF Score • Avg Score: {backtestResults.avgScore.toFixed(1)}
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="text-left py-3 px-4 font-bold text-slate-700">Ticker</th>
                              <th className="text-left py-3 px-4 font-bold text-slate-700">Company</th>
                              <th className="text-left py-3 px-4 font-bold text-slate-700">Sector</th>
                              <th className="text-right py-3 px-4 font-bold text-slate-700">MF Score</th>
                              <th className="text-right py-3 px-4 font-bold text-slate-700">Weight</th>
                              <th className="text-right py-3 px-4 font-bold text-slate-700">YTD</th>
                            </tr>
                          </thead>
                          <tbody>
                            {backtestResults.holdings.slice(0, 15).map((holding, index) => (
                              <tr key={holding.ticker} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="py-3 px-4 font-mono font-bold text-blue-600">{holding.ticker}</td>
                                <td className="py-3 px-4 text-slate-700">{holding.name?.slice(0, 25)}{holding.name?.length > 25 ? '...' : ''}</td>
                                <td className="py-3 px-4 text-slate-600">{holding.sector?.slice(0, 15)}</td>
                                <td className="py-3 px-4 text-right">
                                  <span className={`inline-block px-2 py-1 rounded font-bold ${
                                    holding.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                    holding.score >= 70 ? 'bg-blue-100 text-blue-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {holding.score.toFixed(1)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right text-slate-600">{holding.weight.toFixed(1)}%</td>
                                <td className={`py-3 px-4 text-right font-bold ${holding.ytd >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {holding.ytd >= 0 ? '+' : ''}{holding.ytd.toFixed(1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {backtestResults.holdings.length > 15 && (
                          <div className="text-center py-3 text-slate-500 text-sm">
                            ... and {backtestResults.holdings.length - 15} more holdings
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-amber-800 mb-2">Important Disclaimers</h4>
                          <ul className="text-sm text-amber-700 space-y-1">
                            <li>• <strong>Simulated Results:</strong> This backtest uses Monte Carlo simulation based on current factor characteristics, not actual historical point-in-time data.</li>
                            <li>• <strong>Look-Ahead Bias:</strong> Current scores may reflect information not available during the backtest period.</li>
                            <li>• <strong>Survivorship Bias:</strong> Delisted/bankrupt stocks are not included in the simulation.</li>
                            <li>• <strong>Past Performance:</strong> Simulated past performance is not indicative of future results.</li>
                            <li>• <strong>Transaction Costs:</strong> Actual costs may vary based on market conditions and broker arrangements.</li>
                            <li>• <strong>No Investment Advice:</strong> This tool is for educational and research purposes only.</li>
                          </ul>
                          <p className="text-xs text-amber-600 mt-3">
                            Methodology: CFA Institute Portfolio Management, Fama-French Factor Model, AQR Capital Research
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Getting Started Message (when no results) */}
                {!backtestResults && !backtestLoading && (
                  <div className="bg-slate-50 rounded-xl p-12 text-center border-2 border-dashed border-slate-300">
                    <History className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Configure Your Backtest</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Set your parameters above and click "Run Backtest" to simulate the performance of a factor-based portfolio
                      strategy using the multi-factor scoring model.
                    </p>
                    <div className="mt-6 grid grid-cols-3 gap-4 max-w-lg mx-auto text-sm">
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <div className="font-bold text-purple-600">Factor-Based</div>
                        <div className="text-slate-500">8-factor model</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <div className="font-bold text-purple-600">Risk-Adjusted</div>
                        <div className="text-slate-500">Sharpe & Sortino</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <div className="font-bold text-purple-600">Institutional</div>
                        <div className="text-slate-500">CFA methodology</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROFESSIONAL NEWS & SENTIMENT TAB */}
            {activeView === 'news' && (
              <div className="space-y-6">
                {/* Header */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-800 to-slate-900'} text-white`}>
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-3">
                    <Newspaper className="w-6 h-6" />
                    Market News & Sentiment Analysis
                  </h2>
                  <p className="text-slate-300 text-sm">
                    Real-time news with AI-powered sentiment scoring • Sourced from Bloomberg, Investing.com, Reuters
                  </p>
                </div>

                {/* INDONESIAN NEWS SECTION (PRIORITY) */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                    <span className="text-2xl">🇮🇩</span>
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Indonesian Market News</h3>
                      <p className={`text-sm ${theme.textMuted}`}>JCI, Banking & Indonesian Economic Updates</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {newsData.filter(news =>
                      news.headline?.toLowerCase().includes('indonesia') ||
                      news.headline?.toLowerCase().includes('jakarta') ||
                      news.headline?.toLowerCase().includes('rupiah') ||
                      news.headline?.toLowerCase().includes('jci') ||
                      news.impact?.toLowerCase().includes('indonesia') ||
                      news.category?.startsWith('indonesia')
                    ).length > 0 ? (
                      newsData.filter(news =>
                        news.headline?.toLowerCase().includes('indonesia') ||
                        news.headline?.toLowerCase().includes('jakarta') ||
                        news.headline?.toLowerCase().includes('rupiah') ||
                        news.headline?.toLowerCase().includes('jci') ||
                        news.impact?.toLowerCase().includes('indonesia') ||
                        news.category?.startsWith('indonesia')
                      ).slice(0, 5).map((news, idx) => (
                        <a
                          key={idx}
                          href={news.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block rounded-lg p-4 border ${theme.cardBg} hover:border-emerald-500 transition-all group`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className={`font-semibold ${theme.textPrimary} group-hover:text-emerald-500 transition-colors flex-1`}>
                              {news.headline}
                            </h4>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                news.sentiment === 'positive' ? 'bg-emerald-500 text-white' :
                                news.sentiment === 'negative' ? 'bg-red-500 text-white' :
                                'bg-slate-500 text-white'
                              }`}>
                                {news.sentiment === 'positive' ? 'BULLISH' : news.sentiment === 'negative' ? 'BEARISH' : 'NEUTRAL'}
                              </span>
                              <ExternalLink className={`w-4 h-4 ${theme.textMuted} group-hover:text-emerald-500`} />
                            </div>
                          </div>
                          <p className={`text-sm ${theme.textMuted} mb-2 leading-relaxed`}>
                            {news.impact}
                          </p>
                          <div className={`flex items-center gap-3 text-xs ${theme.textMuted} flex-wrap`}>
                            <span className="flex items-center gap-1 font-medium">
                              <Newspaper className="w-3 h-3" />
                              {news.source}
                            </span>
                            <span>•</span>
                            <span>{news.date}</span>
                            <span>•</span>
                            <span className={`font-semibold ${news.score >= 7 ? 'text-emerald-500' : news.score >= 5 ? 'text-amber-500' : 'text-red-500'}`}>Score: {news.score}/10</span>
                            <span>•</span>
                            <span className="capitalize">{news.category?.replace('_', ' ')}</span>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className={`text-center py-8 ${theme.textMuted}`}>
                        <p>No Indonesia-specific news available. Showing global market news below.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* GLOBAL / U.S. NEWS SECTION */}
                <div className={`rounded-xl p-6 border ${theme.cardBg}`}>
                  <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.border}`}>
                    <span className="text-2xl">🌍</span>
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Global Market News</h3>
                      <p className={`text-sm ${theme.textMuted}`}>U.S. Markets, Global Economy & Emerging Markets</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {newsData.filter(news =>
                      !news.headline?.toLowerCase().includes('indonesia') &&
                      !news.headline?.toLowerCase().includes('jakarta') &&
                      !news.headline?.toLowerCase().includes('rupiah') &&
                      !news.headline?.toLowerCase().includes('jci') &&
                      !news.category?.startsWith('indonesia')
                    ).slice(0, 10).map((news, idx) => (
                      <a
                        key={idx}
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block rounded-lg p-4 border ${theme.cardBg} hover:border-blue-500 transition-all group`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className={`font-semibold ${theme.textPrimary} group-hover:text-blue-500 transition-colors flex-1`}>
                            {news.headline}
                          </h4>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              news.sentiment === 'positive' ? 'bg-emerald-500 text-white' :
                              news.sentiment === 'negative' ? 'bg-red-500 text-white' :
                              'bg-slate-500 text-white'
                            }`}>
                              {news.sentiment === 'positive' ? 'BULLISH' : news.sentiment === 'negative' ? 'BEARISH' : 'NEUTRAL'}
                            </span>
                            <ExternalLink className={`w-4 h-4 ${theme.textMuted} group-hover:text-blue-500`} />
                          </div>
                        </div>
                        <p className={`text-sm ${theme.textMuted} mb-2 leading-relaxed`}>
                          {news.impact}
                        </p>
                        <div className={`flex items-center gap-3 text-xs ${theme.textMuted} flex-wrap`}>
                          <span className="flex items-center gap-1 font-medium">
                            <Newspaper className="w-3 h-3" />
                            {news.source}
                          </span>
                          <span>•</span>
                          <span>{news.date}</span>
                          <span>•</span>
                          <span className={`font-semibold ${news.score >= 7 ? 'text-emerald-500' : news.score >= 5 ? 'text-amber-500' : 'text-red-500'}`}>Score: {news.score}/10</span>
                          <span>•</span>
                          <span className="capitalize">{news.category?.replace('_', ' ')}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Info Footer */}
                <div className={`rounded-lg p-4 border ${theme.cardBg}`}>
                  <p className={`text-xs ${theme.textMuted} text-center`}>
                    <strong>Data Sources:</strong> News sentiment powered by AI analysis of Bloomberg Markets, Investing.com, Reuters • Scores based on relevance and market impact
                  </p>
                </div>
              </div>
            )}

            {/* Financial Institutions Group (FIG) Valuation */}
            {activeView === 'fig' && (
              <FinancialServicesTab darkMode={darkMode} />
            )}

            {/* Empty State for unselected stock in valuation/comps */}
            {(activeView === 'valuation' || activeView === 'comps') && !selectedStock && (
              <div className="text-center py-16">
                <Calculator className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Stock Selected</h3>
                <p className="text-slate-600 mb-6">
                  Select a stock from the screener to view detailed {activeView === 'valuation' ? 'DCF valuation' : 'comparable analysis'}
                </p>
                <button
                  onClick={() => setActiveView('screener')}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Screener
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-xs mt-8 pb-4">
          <p className="font-medium text-slate-300">Prepared by Nathaniel Luu</p>
          <p className="mt-1">Methodology: CFA Institute • Damodaran (NYU Stern) • Rosenbaum & Pearl</p>
          <p className="mt-1">Data Sources: BPS Statistics Indonesia • Bank Indonesia • Indonesia Stock Exchange</p>
        </div>
      </div>

      {/* ============================================================================
          SETTINGS MODAL - Factor Weight Customization (Sustainability Feature)
          Allows investment team to customize scoring weights without coding
          ============================================================================ */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-blue-900 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Settings</h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-300 text-sm mt-2">
                Customize factor weights for the 8-factor scoring model
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Preset Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Load Preset
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <optgroup label="Built-in Presets">
                    {Object.entries(WEIGHT_PRESETS).map(([key, preset]) => (
                      <option key={key} value={key}>{preset.name}</option>
                    ))}
                  </optgroup>
                  {Object.keys(customPresets).length > 0 && (
                    <optgroup label="Custom Presets">
                      {Object.entries(customPresets).map(([key, preset]) => (
                        <option key={key} value={key}>{preset.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {WEIGHT_PRESETS[selectedPreset]?.description && (
                  <p className="text-xs text-slate-500 mt-1">
                    {WEIGHT_PRESETS[selectedPreset].description}
                  </p>
                )}
              </div>

              {/* Factor Weight Sliders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">Factor Weights</h3>
                  <span className={`text-sm font-bold ${totalWeight === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    Total: {totalWeight}/100 pts
                  </span>
                </div>

                {[
                  { key: 'technical', label: 'Technical', desc: 'Price momentum, Alpha, Beta', icon: '📈' },
                  { key: 'valuation', label: 'Valuation', desc: 'P/E, P/B, EV/EBITDA', icon: '💰' },
                  { key: 'quality', label: 'Quality', desc: 'ROE, FCF Conversion, Margins', icon: '⭐' },
                  { key: 'sentiment', label: 'Sentiment', desc: 'Market sentiment proxy', icon: '📊' },
                  { key: 'growth', label: 'Growth', desc: 'Revenue, EPS, Net Income growth', icon: '🚀' },
                  { key: 'financial_health', label: 'Financial Health', desc: 'D/E ratio, Current/Quick ratios', icon: '🏦' },
                  { key: 'liquidity', label: 'Liquidity', desc: 'Market cap tier, trading activity', icon: '💧' },
                  { key: 'analyst_coverage', label: 'Analyst Coverage', desc: 'Coverage breadth proxy', icon: '📝' },
                ].map(factor => (
                  <div key={factor.key} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{factor.icon}</span>
                        <span className="font-medium text-slate-800">{factor.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={factorWeights[factor.key]}
                          onChange={(e) => setFactorWeights(prev => ({
                            ...prev,
                            [factor.key]: Math.min(40, Math.max(0, parseInt(e.target.value) || 0))
                          }))}
                          className="w-16 px-2 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-500">pts</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={factorWeights[factor.key]}
                      onChange={(e) => setFactorWeights(prev => ({
                        ...prev,
                        [factor.key]: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-xs text-slate-500 mt-1">{factor.desc}</p>
                  </div>
                ))}
              </div>

              {/* Weight Distribution Visual */}
              <div className="bg-slate-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Weight Distribution</h4>
                <div className="flex h-6 rounded-lg overflow-hidden">
                  {Object.entries(factorWeights).map(([key, weight], idx) => {
                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-red-400'];
                    return weight > 0 ? (
                      <div
                        key={key}
                        className={`${colors[idx]} transition-all`}
                        style={{ width: `${(weight / totalWeight) * 100}%` }}
                        title={`${key}: ${weight}pts`}
                      />
                    ) : null;
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(factorWeights).map(([key, weight], idx) => {
                    const colors = ['text-blue-600', 'text-emerald-600', 'text-purple-600', 'text-orange-600', 'text-pink-600', 'text-cyan-600', 'text-yellow-600', 'text-red-500'];
                    return weight > 0 ? (
                      <span key={key} className={`text-xs ${colors[idx]}`}>
                        {key.replace('_', ' ')}: {Math.round((weight / totalWeight) * 100)}%
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Save Custom Preset */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Save as Custom Preset</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Enter preset name..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={saveCustomPreset}
                    disabled={!presetName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>

              {/* Import/Export */}
              <div className="flex gap-3">
                <button
                  onClick={exportConfig}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Config
                </button>
                <label className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Config
                  <input
                    type="file"
                    accept=".json"
                    onChange={importConfig}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={resetToDefaults}
                  className="px-4 py-2 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </button>
                <div className="flex-1" />
                {settingsSaved && (
                  <span className="flex items-center gap-2 text-emerald-600 font-medium">
                    <Check className="w-4 h-4" />
                    Saved!
                  </span>
                )}
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>

              {/* Info Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>Note:</strong> Weight changes are saved automatically to your browser.
                Export your configuration to share with colleagues or backup before clearing browser data.
                <br/><br/>
                <strong>For IT:</strong> See SUSTAINABILITY.md for deployment and maintenance documentation.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}