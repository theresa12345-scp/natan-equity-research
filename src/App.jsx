// NATAN EQUITY RESEARCH PLATFORM
// DCF & Comps: CFA Level II, Damodaran (NYU), Rosenbaum & Pearl methodology

import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Info, Building2, Search, Calculator,
  BarChart3, Newspaper, Target, AlertCircle, ExternalLink, Award, Activity,
  Filter, Download, TrendingUp as Growth, Shield, Zap, Globe
} from 'lucide-react';

// Import institutional-grade valuation models
import {
  calculateDCF as calculateDCFNew,
  calculateComparables as calculateComparablesNew,
  calculateWACC as calculateWACCNew,
  calculateSensitivityAnalysis,
  DCF_ASSUMPTIONS
} from './valuation.js';

// ============================================================================
// LATEST INDONESIA MACRO DATA (November 2025 - Real Data from BPS/BI)
// ============================================================================
const INDONESIA_MACRO = {
  asOf: "November 2025",
  gdpGrowth: 5.12, // Q3 2025 YoY from BPS
  gdpGrowthQoQ: 0.61, // Q3 2025 QoQ
  annualGDP: 5.15, // Full year 2025 estimate
  inflation: 2.23, // October 2025 YoY
  inflationMoM: 0.28, // October 2025 MoM
  biRate: 5.75, // November 2025 (cut by BI)
  depositRate: 5.00,
  lendingRate: 6.50,
  jciIndex: 7245.50, // November 2025
  jciYTD: 2.34, // 2025 YTD return
  usdIdr: 15850, // November 2025 (stronger)
  govBond10Y: 6.65, // November 2025
  reserves: 151.8, // Foreign reserves (USD billion)
  debtToGDP: 38.2, // As of Sept 2025
  currentAccountGDP: 0.3, // Improved to surplus
  tradeBalance: 10.52, // Q3 2025 (USD billion)
  pmi: 52.3, // Manufacturing PMI (expansion)
  creditGrowth: 11.5, // November 2025 YoY
  brentCrude: 78.20, // Oil price
  spx: 5975.80, // S&P 500 index
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
  const [sortBy, setSortBy] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [newsFilter, setNewsFilter] = useState('all');

  // Advanced screener filters (Finviz/Bloomberg style)
  const [marketCapFilter, setMarketCapFilter] = useState('all'); // all, mega, large, mid, small, micro
  const [peMin, setPeMin] = useState('');
  const [peMax, setPeMax] = useState('');
  const [roeMin, setRoeMin] = useState('');
  const [divYieldMin, setDivYieldMin] = useState('');
  const [upsideMin, setUpsideMin] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

  // Calculate sensitivity analysis on-demand when a stock is selected
  // Per Wall Street Prep: "Sensitivity tables should be calculated dynamically"
  const sensitivityAnalysis = useMemo(() => {
    if (!selectedStock || !selectedStock.dcf) return null;
    console.log('📊 Calculating sensitivity analysis for:', selectedStock.ticker);
    return calculateSensitivityAnalysis(selectedStock, selectedStock.region || 'Indonesia', selectedStock.dcf);
  }, [selectedStock]);

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
  }, [ALL_STOCKS_DATA, minScore, selectedSector, selectedRegion, searchTerm, sortBy, sortDirection, marketCapFilter, peMin, peMax, roeMin, divYieldMin, upsideMin]);

  const sectors = useMemo(() => {
    if (!ALL_STOCKS_DATA || ALL_STOCKS_DATA.length === 0) return ['all'];
    const sectorSet = new Set(ALL_STOCKS_DATA.map(s => s.sector).filter(Boolean));
    return ['all', ...Array.from(sectorSet).sort()];
  }, [ALL_STOCKS_DATA]);

  const regions = ['all', 'Indonesia', 'US'];

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
          <h2 className="text-2xl font-bold text-white mb-2">Loading Natan Equity Research...</h2>
          <p className="text-slate-300">Loading 949 global securities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header - Clean & Minimal per Bloomberg UX standards */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Natan Equity Research</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:block">Indonesia & US Markets</span>
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'macro', label: '🇮🇩 Macro Dashboard', icon: Activity },
              { id: 'screener', label: 'Equity Screener', icon: Search },
              { id: 'valuation', label: 'DCF Valuation', icon: Calculator },
              { id: 'comps', label: 'Comparable Analysis', icon: BarChart3 },
              { id: 'news', label: 'Market News', icon: Newspaper },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap ${
                    activeView === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-xl p-6 text-white shadow-2xl">
                  <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                    <Activity className="w-8 h-8" />
                    Global Economic Dashboard
                  </h2>
                  <p className="text-slate-300 text-sm">
                    Real-time macro indicators • Updated: November 21, 2025 • Sources: BPS, Bank Indonesia, Federal Reserve, Bloomberg
                  </p>
                </div>

                {/* INDONESIA SECTION */}
                <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-slate-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200">
                    <span className="text-4xl">🇮🇩</span>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">INDONESIA</h3>
                      <p className="text-sm text-slate-600">Southeast Asia's Largest Economy • GDP: $1.4T</p>
                    </div>
                  </div>

                  {/* Key Indicators Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border-2 border-emerald-300 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-emerald-700 uppercase font-black tracking-wide">GDP Growth</div>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-4xl font-black text-emerald-900 mb-1">{INDONESIA_MACRO.gdpGrowth}%</div>
                      <div className="text-xs text-emerald-700 font-semibold">Q3 2025 YoY</div>
                      <div className="text-xs text-emerald-600 mt-2 pt-2 border-t border-emerald-200">
                        Full Year Est: {INDONESIA_MACRO.annualGDP}%
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-300 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-blue-700 uppercase font-black tracking-wide">Inflation</div>
                        <Info className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-4xl font-black text-blue-900 mb-1">{INDONESIA_MACRO.inflation}%</div>
                      <div className="text-xs text-blue-700 font-semibold">October 2025 YoY</div>
                      <div className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-200">
                        Target: 1.5-3.5%
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-300 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-purple-700 uppercase font-black tracking-wide">BI Rate</div>
                        <TrendingDown className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-4xl font-black text-purple-900 mb-1">{INDONESIA_MACRO.biRate}%</div>
                      <div className="text-xs text-purple-700 font-semibold">November 2025</div>
                      <div className="text-xs text-purple-600 mt-2 pt-2 border-t border-purple-200">
                        Cut 25bps (easing)
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border-2 border-amber-300 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-amber-700 uppercase font-black tracking-wide">JCI Index</div>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-4xl font-black text-amber-900 mb-1">{INDONESIA_MACRO.jciIndex.toFixed(0)}</div>
                      <div className="text-xs text-amber-700 font-semibold">November 21, 2025</div>
                      <div className="text-xs text-emerald-600 font-bold mt-2 pt-2 border-t border-amber-200">
                        +{INDONESIA_MACRO.jciYTD}% YTD
                      </div>
                    </div>
                  </div>

                  {/* Secondary Indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">USD/IDR</div>
                      <div className="text-2xl font-black text-slate-900">{INDONESIA_MACRO.usdIdr.toLocaleString()}</div>
                      <div className="text-xs text-emerald-600 font-semibold mt-1">↓ Stronger</div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">Reserves</div>
                      <div className="text-2xl font-black text-slate-900">${INDONESIA_MACRO.reserves}B</div>
                      <div className="text-xs text-slate-600 mt-1">Foreign FX</div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">10Y Bond</div>
                      <div className="text-2xl font-black text-slate-900">{INDONESIA_MACRO.govBond10Y}%</div>
                      <div className="text-xs text-slate-600 mt-1">Govt Yield</div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">PMI</div>
                      <div className="text-2xl font-black text-emerald-600">{INDONESIA_MACRO.pmi}</div>
                      <div className="text-xs text-emerald-600 font-semibold mt-1">↑ Expansion</div>
                    </div>
                  </div>
                </div>

                {/* UNITED STATES SECTION */}
                <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-slate-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200">
                    <span className="text-4xl">🇺🇸</span>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">UNITED STATES</h3>
                      <p className="text-sm text-slate-600">World's Largest Economy • GDP: $28.8T</p>
                    </div>
                  </div>

                  {/* Key Indicators Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border-2 border-emerald-300 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-emerald-700 uppercase font-black tracking-wide">GDP Growth</div>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-4xl font-black text-emerald-900 mb-1">2.8%</div>
                      <div className="text-xs text-emerald-700 font-semibold">Q3 2025 YoY</div>
                      <div className="text-xs text-emerald-600 mt-2 pt-2 border-t border-emerald-200">
                        Revised: 2.9%
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-300 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-blue-700 uppercase font-black tracking-wide">CPI</div>
                        <Info className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-4xl font-black text-blue-900 mb-1">3.2%</div>
                      <div className="text-xs text-blue-700 font-semibold">October 2025 YoY</div>
                      <div className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-200">
                        Core: 3.3%
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-300 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-purple-700 uppercase font-black tracking-wide">Fed Rate</div>
                        <TrendingDown className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-4xl font-black text-purple-900 mb-1">4.75%</div>
                      <div className="text-xs text-purple-700 font-semibold">November 2025</div>
                      <div className="text-xs text-purple-600 mt-2 pt-2 border-t border-purple-200">
                        Cut 50bps (easing cycle)
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border-2 border-amber-300 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-amber-700 uppercase font-black tracking-wide">S&P 500</div>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-4xl font-black text-amber-900 mb-1">{INDONESIA_MACRO.spx.toFixed(0)}</div>
                      <div className="text-xs text-amber-700 font-semibold">November 21, 2025</div>
                      <div className="text-xs text-emerald-600 font-bold mt-2 pt-2 border-t border-amber-200">
                        +18.4% YTD
                      </div>
                    </div>
                  </div>

                  {/* Secondary Indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">10Y Treasury</div>
                      <div className="text-2xl font-black text-slate-900">4.45%</div>
                      <div className="text-xs text-slate-600 mt-1">Yield</div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">Unemployment</div>
                      <div className="text-2xl font-black text-emerald-600">3.8%</div>
                      <div className="text-xs text-emerald-600 font-semibold mt-1">↓ Near Historic Low</div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">PMI</div>
                      <div className="text-2xl font-black text-emerald-600">52.5</div>
                      <div className="text-xs text-emerald-600 font-semibold mt-1">↑ Expansion</div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">DXY Index</div>
                      <div className="text-2xl font-black text-slate-900">104.2</div>
                      <div className="text-xs text-slate-600 mt-1">Dollar Index</div>
                    </div>
                  </div>
                </div>

                {/* LIVE MARKET CHARTS */}
                <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-slate-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">Live Market Charts</h3>
                      <p className="text-sm text-slate-600">Real-time index performance • Powered by TradingView</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* JCI Chart */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">🇮🇩</span> JCI (Jakarta Composite Index)
                      </h4>
                      <div className="h-72 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_jkse&symbol=IDX%3ACOMPOSITE&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Asia%2FJakarta&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="JCI Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* S&P 500 Chart */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">🇺🇸</span> S&P 500 Index
                      </h4>
                      <div className="h-72 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_spx&symbol=FOREXCOM%3ASPXUSD&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=America%2FNew_York&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="S&P 500 Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* USD/IDR Chart */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">💱</span> USD/IDR Exchange Rate
                      </h4>
                      <div className="h-72 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_usdidr&symbol=FX_IDC%3AUSDIDR&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Asia%2FJakarta&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="USD/IDR Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Gold Chart */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">🥇</span> Gold (XAU/USD)
                      </h4>
                      <div className="h-72 rounded-lg overflow-hidden">
                        <iframe
                          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_gold&symbol=OANDA%3AXAUUSD&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=America%2FNew_York&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
                          style={{width: '100%', height: '100%', border: 'none'}}
                          title="Gold Chart"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-4 text-center">
                    Charts provided by TradingView • Data delayed by exchange rules • For informational purposes only
                  </p>
                </div>

                {/* INSTITUTIONAL OUTLOOK */}
                <div className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-xl p-6 text-white shadow-2xl">
                  <h3 className="font-black text-2xl mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Market Outlook & Investment Thesis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-emerald-400 mb-3 text-sm uppercase tracking-wide">🇮🇩 Indonesia: Constructive</h4>
                      <ul className="space-y-2 text-sm text-slate-200">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>GDP:</strong> Strong 5.12% growth supported by infrastructure spending & consumption</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>Inflation:</strong> Well-contained at 2.23%, giving BI room to cut rates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>JCI Equity:</strong> +2.34% YTD with attractive valuations post-2024 correction</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400">△</span>
                          <span><strong>Risk:</strong> Rupiah stability dependent on Fed policy and capital flows</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-400 mb-3 text-sm uppercase tracking-wide">🇺🇸 United States: Neutral to Positive</h4>
                      <ul className="space-y-2 text-sm text-slate-200">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>GDP:</strong> Resilient 2.8% growth despite higher rates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>Fed Pivot:</strong> Rate cuts underway (4.75%), supporting risk assets</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>S&P 500:</strong> +18.4% YTD driven by tech & AI momentum</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400">△</span>
                          <span><strong>Risk:</strong> Elevated valuations (P/E 22x) vs. historical averages</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-600">
                    <p className="text-sm text-slate-300">
                      <strong className="text-white">Investment Strategy:</strong> Overweight Indonesia financials and consumer stocks.
                      In US markets, favor quality tech with strong FCF. Monitor Fed policy trajectory and emerging market flows.
                    </p>
                  </div>
                </div>

                {/* Data Sources Footer */}
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
                  <p className="text-xs text-slate-600 text-center">
                    <strong>Data Sources:</strong> BPS Statistics Indonesia • Bank Indonesia • Federal Reserve • U.S. Bureau of Economic Analysis • Bloomberg • Trading Economics
                  </p>
                </div>
              </div>
            )}

            {/* SCREENER - Continues in next part... */}
            {activeView === 'screener' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Global Equity Screener</h2>
                    <p className="text-slate-600 text-sm">
                      Multi-factor analysis • {ALL_STOCKS_DATA.length} securities • CFA/Damodaran methodology
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by ticker or company name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Primary Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Min Score</label>
                    <select
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">All (0+)</option>
                      <option value="80">Strong Buy (80+)</option>
                      <option value="70">Buy (70+)</option>
                      <option value="55">Hold (55+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Region</label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {regions.map(r => (
                        <option key={r} value={r}>{r === 'all' ? 'All Markets' : r === 'Indonesia' ? '🇮🇩 Indonesia' : '🇺🇸 United States'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Sector</label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {sectors.map(s => (
                        <option key={s} value={s}>{s === 'all' ? 'All Sectors' : s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Market Cap</label>
                    <select
                      value={marketCapFilter}
                      onChange={(e) => setMarketCapFilter(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">&nbsp;</label>
                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        showAdvancedFilters
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-blue-500'
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                    </button>
                  </div>
                </div>

                {/* Advanced Filters Panel (Finviz/Bloomberg Style) */}
                {showAdvancedFilters && (
                  <div className="bg-gradient-to-r from-slate-100 to-blue-50 rounded-lg border-2 border-blue-200 p-5 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-blue-600" />
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
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Reset All
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {/* P/E Range */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">P/E Min</label>
                        <input
                          type="number"
                          placeholder="Any"
                          value={peMin}
                          onChange={(e) => setPeMin(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">P/E Max</label>
                        <input
                          type="number"
                          placeholder="Any"
                          value={peMax}
                          onChange={(e) => setPeMax(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* ROE Min */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">ROE Min (%)</label>
                        <input
                          type="number"
                          placeholder="Any"
                          value={roeMin}
                          onChange={(e) => setRoeMin(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Dividend Yield */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Div Yield Min (%)</label>
                        <input
                          type="number"
                          placeholder="Any"
                          value={divYieldMin}
                          onChange={(e) => setDivYieldMin(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* DCF Upside */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">DCF Upside Min (%)</label>
                        <input
                          type="number"
                          placeholder="Any"
                          value={upsideMin}
                          onChange={(e) => setUpsideMin(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
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
                <div className="bg-white rounded-xl border-2 border-slate-300 overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white border-b-2 border-slate-600">
                        <tr>
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
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredStocks.slice(0, 100).map((stock, idx) => {
                          const scoreRating = getScoreRating(stock.natanScore.total);
                          const fairValue = stock.dcf?.fairValue || stock.Price;
                          const upside = stock.dcf?.upside || 0;

                          return (
                            <tr key={idx} className="hover:bg-blue-50 transition-all border-l-4 border-transparent hover:border-l-blue-500">
                              <td className="px-3 py-3 font-bold text-slate-900 text-sm">{stock.ticker}</td>
                              <td className="px-3 py-3 text-slate-700 font-medium max-w-xs truncate">
                                {stock.name || stock.Name}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                                  {stock.sector?.split(',')[0] || 'N/A'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right font-bold text-slate-900">
                                {formatPrice(stock.Price, stock.region)}
                              </td>
                              <td className="px-3 py-3 text-right font-bold bg-blue-50 text-blue-900">
                                {formatPrice(fairValue, stock.region)}
                              </td>
                              <td className="px-3 py-3 text-right font-bold bg-blue-50">
                                <span className={`px-2 py-1 rounded font-bold text-xs ${
                                  upside > 20 ? 'bg-emerald-600 text-white' :
                                  upside > 10 ? 'bg-emerald-500 text-white' :
                                  upside > 0 ? 'bg-blue-500 text-white' :
                                  upside > -10 ? 'bg-amber-500 text-white' :
                                  'bg-red-600 text-white'
                                }`}>
                                  {upside > 0 ? '+' : ''}{upside.toFixed(0)}%
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right font-semibold text-slate-700">
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
                              <td className="px-3 py-3 text-right font-semibold">
                                <span className={(stock.ROE || 0) > 15 ? 'text-emerald-600' : 'text-slate-700'}>
                                  {stock.ROE ? `${stock.ROE.toFixed(1)}%` : 'N/A'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right font-bold">
                                <span className={(stock["Company YTD Return"] || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                  {formatPercent(stock["Company YTD Return"])}
                                </span>
                              </td>
                              <td className="px-3 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex">
                                    {[...Array(scoreRating.stars)].map((_, i) => (
                                      <span key={i} className="text-yellow-500 text-sm">★</span>
                                    ))}
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${scoreRating.bgClass} ${scoreRating.textClass} border ${scoreRating.borderColor}`}>
                                    {scoreRating.rating}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`text-2xl font-black ${scoreRating.textClass}`}>
                                    {stock.natanScore.total}
                                  </span>
                                  <span className="text-xs text-slate-500 font-medium">/100</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedStock(stock);
                                    setActiveView('valuation');
                                  }}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                                >
                                  Full Analysis
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
                    NATAN Multi-Factor Scoring Framework (100 pts)
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

            {/* DCF VALUATION VIEW */}
            {activeView === 'valuation' && selectedStock && (
              <div className="space-y-6">
                {/* Stock Header */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border-2 border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-slate-900">{selectedStock.ticker}</h2>
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          selectedStock.region === 'US' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {selectedStock.region}
                        </span>
                      </div>
                      <p className="text-lg text-slate-600 mb-3">{selectedStock.name || selectedStock.Name}</p>
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
                          <div className="text-xs text-slate-600 uppercase font-bold mb-1">NATAN Score</div>
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
                    <div>
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">Current Price</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {formatPrice(selectedStock.Price, selectedStock.region)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">Market Cap</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {formatMarketCap(selectedStock["Market Cap"], selectedStock.region)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">P/E Ratio</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {formatRatio(selectedStock.PE)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">YTD Return</div>
                      <div className={`text-2xl font-bold ${(selectedStock["Company YTD Return"] || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatPercent(selectedStock["Company YTD Return"])}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DCF Valuation Results */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-6">
                    <Calculator className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-slate-900">Discounted Cash Flow (DCF) Valuation</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-2">Current Price</div>
                      <div className="text-3xl font-bold text-slate-900">
                        {formatPrice(selectedStock.Price, selectedStock.region)}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-2">Fair Value (DCF)</div>
                      <div className="text-3xl font-bold text-blue-900">
                        {formatPrice(selectedStock.dcf?.fairValue, selectedStock.region)}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-2">Upside/Downside</div>
                      <div className={`text-3xl font-bold ${(selectedStock.dcf?.upside || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatPercent(selectedStock.dcf?.upside)}
                      </div>
                    </div>
                  </div>

                  {/* Investment Recommendation */}
                  <div className={`p-5 rounded-lg border-2 ${
                    selectedStock.dcf?.upside > 30 ? 'bg-emerald-50 border-emerald-300' :
                    selectedStock.dcf?.upside > 15 ? 'bg-blue-50 border-blue-300' :
                    selectedStock.dcf?.upside > 0 ? 'bg-slate-50 border-slate-300' :
                    'bg-amber-50 border-amber-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5" />
                      <h4 className="font-bold text-sm">DCF-Based Investment Recommendation</h4>
                    </div>
                    <p className="text-sm">
                      {selectedStock.dcf?.upside > 30 ?
                        `Strong buy opportunity with significant ${selectedStock.dcf.upside.toFixed(0)}% upside to fair value. DCF analysis suggests meaningful undervaluation based on projected cash flows.` :
                        selectedStock.dcf?.upside > 15 ?
                        `Attractive buy opportunity with ${selectedStock.dcf.upside.toFixed(0)}% upside potential. Valuation appears favorable relative to fundamentals.` :
                        selectedStock.dcf?.upside > 0 ?
                        `Stock appears fairly valued with modest ${selectedStock.dcf.upside.toFixed(0)}% upside. Consider for long-term hold or wait for better entry point.` :
                        `Stock appears overvalued with ${Math.abs(selectedStock.dcf.upside).toFixed(0)}% downside risk. DCF suggests caution at current price levels.`
                      }
                    </p>
                  </div>
                </div>

                {/* DCF Model Details */}
                <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-5 text-lg">DCF Model Components & Assumptions</h4>

                  {/* Key Assumptions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1 font-bold">WACC</div>
                      <div className="text-xl font-bold text-slate-900">
                        {selectedStock.dcf?.wacc ? `${selectedStock.dcf.wacc.toFixed(1)}%` : 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Discount Rate</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1 font-bold">Terminal Growth</div>
                      <div className="text-xl font-bold text-slate-900">
                        {selectedStock.dcf?.assumptions?.terminalGrowth || 3}%
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Perpetual</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1 font-bold">PV of FCFs</div>
                      <div className="text-xl font-bold text-slate-900">
                        {formatValuationNumber(selectedStock.dcf?.pvFCF, selectedStock.region)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">5-Year Total</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1 font-bold">Terminal Value</div>
                      <div className="text-xl font-bold text-slate-900">
                        {formatValuationNumber(selectedStock.dcf?.terminalValue, selectedStock.region)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Discounted</div>
                    </div>
                  </div>

                  {/* 5-Year FCF Projection Table */}
                  {selectedStock.dcf?.projectedFCFs && selectedStock.dcf.projectedFCFs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-slate-200">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase border-b border-slate-200">Metric</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase border-b border-slate-200">Year 1</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase border-b border-slate-200">Year 2</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase border-b border-slate-200">Year 3</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase border-b border-slate-200">Year 4</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase border-b border-slate-200">Year 5</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="px-4 py-3 font-semibold">FCF</td>
                          {selectedStock.dcf.projectedFCFs.slice(0, 5).map((fcf, i) => (
                            <td key={i} className="px-4 py-3 text-right">{formatValuationNumber(fcf, selectedStock.region)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="px-4 py-3 font-semibold">Growth Rate</td>
                          {(selectedStock.dcf.growthRates || [0,0,0,0,0]).slice(0, 5).map((rate, i) => (
                            <td key={i} className="px-4 py-3 text-right text-slate-600">{rate != null ? `${rate.toFixed(1)}%` : 'N/A'}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold">PV of FCF</td>
                          {(selectedStock.dcf.discountedFCFs || [0,0,0,0,0]).slice(0, 5).map((fcf, i) => (
                            <td key={i} className="px-4 py-3 text-right font-bold text-blue-600">{formatValuationNumber(fcf, selectedStock.region)}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-4 text-center text-slate-500 text-sm">
                      Detailed FCF projections not available for this stock
                    </div>
                  )}
                </div>

                {/* SENSITIVITY ANALYSIS TABLE - Investment Banking Standard */}
                {sensitivityAnalysis && (
                <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">Sensitivity Analysis</h4>
                      <p className="text-xs text-slate-500 mt-1">WACC vs Terminal Growth Rate (Fair Value per Share)</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      sensitivityAnalysis.recommendationColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                      sensitivityAnalysis.recommendationColor === 'green' ? 'bg-green-100 text-green-700' :
                      sensitivityAnalysis.recommendationColor === 'amber' ? 'bg-amber-100 text-amber-700' :
                      sensitivityAnalysis.recommendationColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {sensitivityAnalysis.recommendation}
                    </div>
                  </div>

                  {/* Sensitivity Matrix Table */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr>
                          <th className="p-2 text-xs font-bold text-slate-500 border border-slate-200 bg-slate-50" rowSpan="2">
                            WACC
                          </th>
                          <th className="p-2 text-xs font-bold text-slate-500 border border-slate-200 bg-slate-50 text-center" colSpan={sensitivityAnalysis.growthValues.length}>
                            Terminal Growth Rate
                          </th>
                        </tr>
                        <tr>
                          {sensitivityAnalysis.growthValues.map((g, i) => (
                            <th key={i} className={`p-2 text-xs font-bold border border-slate-200 text-center ${
                              Math.abs(g - sensitivityAnalysis.baseTerminalGrowth) < 0.01
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-50 text-slate-600'
                            }`}>
                              {g.toFixed(2)}%
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sensitivityAnalysis.matrix.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            <td className={`p-2 text-xs font-bold border border-slate-200 text-center ${
                              Math.abs(sensitivityAnalysis.waccValues[rowIdx] - sensitivityAnalysis.baseWACC) < 0.01
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-50 text-slate-600'
                            }`}>
                              {sensitivityAnalysis.waccValues[rowIdx].toFixed(1)}%
                            </td>
                            {row.map((cell, colIdx) => {
                              // Professional color coding based on upside (more granular)
                              // Per IB standards: green gradient for upside, red for downside
                              let bgColor, textColor, borderColor;
                              if (cell.isInvalid || cell.fairValue === null) {
                                bgColor = 'bg-slate-200';
                                textColor = 'text-slate-500';
                                borderColor = 'border-slate-300';
                              } else if (cell.isBaseCase) {
                                bgColor = 'bg-blue-600';
                                textColor = 'text-white';
                                borderColor = 'border-blue-700 border-2';
                              } else if (cell.upside >= 200) {
                                bgColor = 'bg-emerald-700';
                                textColor = 'text-white';
                                borderColor = 'border-emerald-800';
                              } else if (cell.upside >= 150) {
                                bgColor = 'bg-emerald-600';
                                textColor = 'text-white';
                                borderColor = 'border-emerald-700';
                              } else if (cell.upside >= 100) {
                                bgColor = 'bg-emerald-500';
                                textColor = 'text-white';
                                borderColor = 'border-emerald-600';
                              } else if (cell.upside >= 50) {
                                bgColor = 'bg-emerald-400';
                                textColor = 'text-white';
                                borderColor = 'border-emerald-500';
                              } else if (cell.upside >= 25) {
                                bgColor = 'bg-emerald-300';
                                textColor = 'text-emerald-900';
                                borderColor = 'border-emerald-400';
                              } else if (cell.upside >= 0) {
                                bgColor = 'bg-emerald-100';
                                textColor = 'text-emerald-800';
                                borderColor = 'border-emerald-200';
                              } else if (cell.upside >= -25) {
                                bgColor = 'bg-amber-100';
                                textColor = 'text-amber-800';
                                borderColor = 'border-amber-200';
                              } else if (cell.upside >= -50) {
                                bgColor = 'bg-orange-200';
                                textColor = 'text-orange-900';
                                borderColor = 'border-orange-300';
                              } else {
                                bgColor = 'bg-red-300';
                                textColor = 'text-red-900';
                                borderColor = 'border-red-400';
                              }

                              return (
                                <td key={colIdx} className={`p-1.5 text-center border ${borderColor} ${bgColor} ${textColor} transition-all hover:opacity-80`}>
                                  {cell.isInvalid || cell.fairValue === null ? (
                                    <span className="text-xs font-medium">N/A</span>
                                  ) : (
                                    <div className="flex flex-col leading-tight">
                                      <span className={`text-xs font-bold ${cell.isBaseCase ? 'underline' : ''}`}>
                                        {formatPrice(cell.fairValue, selectedStock.region)}
                                      </span>
                                      <span className={`text-[10px] font-medium ${cell.isBaseCase ? 'text-blue-200' : 'opacity-90'}`}>
                                        {cell.upside > 0 ? '+' : ''}{cell.upside.toFixed(0)}%
                                      </span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Valuation Range Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 font-medium mb-1">Min Fair Value</div>
                      <div className="text-lg font-bold text-red-600">
                        {formatPrice(sensitivityAnalysis.valuationRange.min, selectedStock.region)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {sensitivityAnalysis.upsideRange.min > 0 ? '+' : ''}{sensitivityAnalysis.upsideRange.min}%
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="text-xs text-blue-600 font-medium mb-1">Base Case</div>
                      <div className="text-lg font-bold text-blue-700">
                        {formatPrice(sensitivityAnalysis.valuationRange.baseCase, selectedStock.region)}
                      </div>
                      <div className="text-xs text-blue-600">
                        {sensitivityAnalysis.upsideRange.baseCase > 0 ? '+' : ''}{sensitivityAnalysis.upsideRange.baseCase}%
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 font-medium mb-1">Max Fair Value</div>
                      <div className="text-lg font-bold text-emerald-600">
                        {formatPrice(sensitivityAnalysis.valuationRange.max, selectedStock.region)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {sensitivityAnalysis.upsideRange.max > 0 ? '+' : ''}{sensitivityAnalysis.upsideRange.max}%
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 font-medium mb-1">Valuation Spread</div>
                      <div className="text-lg font-bold text-slate-700">
                        {sensitivityAnalysis.valuationRange.rangePercent}%
                      </div>
                      <div className="text-xs text-slate-500">Range vs Current</div>
                    </div>
                  </div>

                  {/* Football Field Visualization */}
                  <div className="bg-gradient-to-r from-red-50 via-amber-50 to-emerald-50 rounded-lg p-4 border border-slate-200">
                    <div className="text-xs font-bold text-slate-600 mb-3">VALUATION RANGE (Football Field)</div>
                    <div className="relative h-8 bg-gradient-to-r from-red-200 via-amber-200 to-emerald-200 rounded-full overflow-hidden">
                      {/* Current Price Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-slate-800 z-10"
                        style={{
                          left: `${Math.max(0, Math.min(100,
                            ((sensitivityAnalysis.currentPrice - sensitivityAnalysis.valuationRange.min) /
                            (sensitivityAnalysis.valuationRange.max - sensitivityAnalysis.valuationRange.min)) * 100
                          ))}%`
                        }}
                        title={`Current: ${formatPrice(sensitivityAnalysis.currentPrice, selectedStock.region)}`}
                      >
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-slate-700 whitespace-nowrap">
                          Current
                        </div>
                      </div>
                      {/* Base Case Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-2 bg-blue-600 rounded z-20"
                        style={{
                          left: `${Math.max(0, Math.min(100,
                            ((sensitivityAnalysis.valuationRange.baseCase - sensitivityAnalysis.valuationRange.min) /
                            (sensitivityAnalysis.valuationRange.max - sensitivityAnalysis.valuationRange.min)) * 100
                          ))}%`
                        }}
                        title={`Base: ${formatPrice(sensitivityAnalysis.valuationRange.baseCase, selectedStock.region)}`}
                      >
                        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-blue-700 whitespace-nowrap">
                          Base
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-600">
                      <span>{formatPrice(sensitivityAnalysis.valuationRange.min, selectedStock.region)}</span>
                      <span className="font-bold text-blue-700">
                        {formatPrice(sensitivityAnalysis.valuationRange.baseCase, selectedStock.region)}
                      </span>
                      <span>{formatPrice(sensitivityAnalysis.valuationRange.max, selectedStock.region)}</span>
                    </div>
                  </div>

                  {/* Methodology Note */}
                  <div className="mt-4 text-xs text-slate-500 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Methodology:</span> {sensitivityAnalysis.methodology}.
                      <span className="text-slate-400 ml-1">{sensitivityAnalysis.note}</span>
                    </div>
                  </div>
                </div>
                )}

                {/* Score Breakdown */}
                <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-5 text-lg">8-Factor Score Analysis</h4>
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
                            <span className="capitalize text-sm font-semibold text-slate-700">
                              {key.replace('_', ' ')}
                            </span>
                            <span className="font-bold text-slate-900">{value}/{maxValue}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
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
                <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-200">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <h4 className="font-bold text-amber-900 text-sm">Key Risk Factors & Disclosures</h4>
                  </div>
                  <ul className="text-sm text-amber-800 space-y-2">
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
                    onClick={() => setActiveView('comps')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Comparable Analysis →
                  </button>
                  <button
                    onClick={() => setActiveView('screener')}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    ← Back to Screener
                  </button>
                </div>
              </div>
            )}

            {/* COMPARABLE ANALYSIS VIEW */}
            {activeView === 'comps' && selectedStock && selectedStock.comps && (
              <div className="space-y-6">
                {/* Stock Header (reuse from DCF) */}
                <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl p-6 border-2 border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-3xl font-bold text-slate-900">{selectedStock.ticker}</h2>
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      selectedStock.region === 'US' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {selectedStock.region}
                    </span>
                  </div>
                  <p className="text-lg text-slate-600">{selectedStock.name || selectedStock.Name}</p>
                </div>

                {/* Comps Summary */}
                <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-slate-900">Comparable Company Analysis</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-5 border-2 border-purple-200 shadow-sm">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-2">Current Price</div>
                      <div className="text-3xl font-bold text-slate-900">
                        {formatPrice(selectedStock.Price, selectedStock.region)}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border-2 border-purple-200 shadow-sm">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-2">Implied Value (Comps)</div>
                      <div className="text-3xl font-bold text-purple-900">
                        {formatPrice(selectedStock.comps.avgImpliedValue, selectedStock.region)}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border-2 border-purple-200 shadow-sm">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-2">Upside/Downside</div>
                      <div className={`text-3xl font-bold ${(selectedStock.comps.upside || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatPercent(selectedStock.comps.upside)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Peer Comparison Table */}
                <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-5 text-lg">Peer Group Valuation Multiples</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-2 border-slate-200">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase border-b-2 border-slate-300">Company</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase border-b-2 border-slate-300">P/E</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase border-b-2 border-slate-300">P/B</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase border-b-2 border-slate-300">ROE</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase border-b-2 border-slate-300">Market Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-blue-50 font-bold border-b-2 border-blue-200">
                          <td className="px-4 py-3">{selectedStock.ticker} (Target)</td>
                          <td className="px-4 py-3 text-right">{formatRatio(selectedStock.PE)}</td>
                          <td className="px-4 py-3 text-right">{formatRatio(selectedStock.PB)}</td>
                          <td className="px-4 py-3 text-right">{selectedStock.ROE ? `${selectedStock.ROE.toFixed(1)}%` : 'N/A'}</td>
                          <td className="px-4 py-3 text-right">{formatMarketCap(selectedStock["Market Cap"], selectedStock.region)}</td>
                        </tr>
                        {selectedStock.comps.peers.map((peer, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3">{peer.ticker}</td>
                            <td className="px-4 py-3 text-right">{formatRatio(peer.pe)}</td>
                            <td className="px-4 py-3 text-right">{formatRatio(peer.pb)}</td>
                            <td className="px-4 py-3 text-right">{peer.revenueGrowth ? `${peer.revenueGrowth.toFixed(1)}%` : 'N/A'}</td>
                            <td className="px-4 py-3 text-right">{formatMarketCap(peer.marketCap, selectedStock.region)}</td>
                          </tr>
                        ))}
                        <tr className="bg-purple-50 font-bold border-t-2 border-purple-300">
                          <td className="px-4 py-3">Peer Median</td>
                          <td className="px-4 py-3 text-right text-purple-600">
                            {formatRatio(selectedStock.comps.medianPE)}
                          </td>
                          <td className="px-4 py-3 text-right text-purple-600">
                            {formatRatio(selectedStock.comps.medianPB)}
                          </td>
                          <td className="px-4 py-3 text-right">-</td>
                          <td className="px-4 py-3 text-right">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Valuation Summary - DCF vs Comps */}
                <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-5 text-lg">Multi-Method Valuation Summary</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-slate-200">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Method</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Fair Value</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Upside</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Assessment</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="px-4 py-3 font-semibold">DCF Analysis</td>
                          <td className="px-4 py-3 text-right font-bold">
                            {formatPrice(selectedStock.dcf?.fairValue, selectedStock.region)}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${(selectedStock.dcf?.upside || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatPercent(selectedStock.dcf?.upside)}
                          </td>
                          <td className="px-4 py-3 text-sm">Intrinsic value based on cash flows</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="px-4 py-3 font-semibold">Comparable Analysis</td>
                          <td className="px-4 py-3 text-right font-bold">
                            {formatPrice(selectedStock.comps.avgImpliedValue, selectedStock.region)}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${(selectedStock.comps.upside || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatPercent(selectedStock.comps.upside)}
                          </td>
                          <td className="px-4 py-3 text-sm">Relative valuation vs {selectedStock.comps.peerCount} peers</td>
                        </tr>
                        <tr className="bg-blue-50 font-bold border-t-2 border-slate-300">
                          <td className="px-4 py-3">Average Fair Value</td>
                          <td className="px-4 py-3 text-right text-blue-900">
                            {formatPrice(((selectedStock.dcf?.fairValue || 0) + (selectedStock.comps.avgImpliedValue || 0)) / 2, selectedStock.region)}
                          </td>
                          <td className={`px-4 py-3 text-right ${(((selectedStock.dcf?.upside || 0) + (selectedStock.comps.upside || 0)) / 2) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatPercent(((selectedStock.dcf?.upside || 0) + (selectedStock.comps.upside || 0)) / 2)}
                          </td>
                          <td className="px-4 py-3 text-blue-700 text-sm font-semibold">Blended valuation estimate</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveView('valuation')}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    ← Back to DCF
                  </button>
                  <button
                    onClick={() => setActiveView('screener')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Back to Screener
                  </button>
                </div>
              </div>
            )}

            {/* PROFESSIONAL NEWS & SENTIMENT TAB */}
            {activeView === 'news' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-xl p-6 text-white shadow-2xl">
                  <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                    <Newspaper className="w-8 h-8" />
                    Market News & Sentiment Analysis
                  </h2>
                  <p className="text-slate-300 text-sm">
                    Real-time news with AI-powered sentiment scoring • Sourced from Bloomberg, Investing.com, Reuters
                  </p>
                </div>

                {/* INDONESIAN NEWS SECTION (PRIORITY) */}
                <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-emerald-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-emerald-200">
                    <span className="text-4xl">🇮🇩</span>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">INDONESIAN MARKET NEWS</h3>
                      <p className="text-sm text-slate-600">JCI, Banking & Indonesian Economic Updates</p>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                          className="block bg-gradient-to-r from-emerald-50 to-white rounded-xl p-5 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h4 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors flex-1">
                              {news.headline}
                            </h4>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                                news.sentiment === 'positive' ? 'bg-emerald-600 text-white' :
                                news.sentiment === 'negative' ? 'bg-red-600 text-white' :
                                'bg-slate-600 text-white'
                              }`}>
                                {news.sentiment === 'positive' ? '📈 BULLISH' : news.sentiment === 'negative' ? '📉 BEARISH' : '➡️ NEUTRAL'}
                              </span>
                              <ExternalLink className="w-5 h-5 text-emerald-600 group-hover:text-emerald-800" />
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                            {news.impact}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold">
                              <Newspaper className="w-3 h-3" />
                              {news.source}
                            </span>
                            <span>•</span>
                            <span>{news.date}</span>
                            <span>•</span>
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-bold">Score: {news.score}/10</span>
                            <span>•</span>
                            <span className="px-2 py-1 bg-slate-100 rounded font-medium capitalize">{news.category?.replace('_', ' ')}</span>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p>No Indonesia-specific news available. Showing global market news below.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* GLOBAL / U.S. NEWS SECTION */}
                <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                    <span className="text-4xl">🌍</span>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">GLOBAL MARKET NEWS</h3>
                      <p className="text-sm text-slate-600">U.S. Markets, Global Economy & Emerging Markets</p>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                        className="block bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors flex-1">
                            {news.headline}
                          </h4>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                              news.sentiment === 'positive' ? 'bg-emerald-600 text-white' :
                              news.sentiment === 'negative' ? 'bg-red-600 text-white' :
                              'bg-slate-600 text-white'
                            }`}>
                              {news.sentiment === 'positive' ? '📈 BULLISH' : news.sentiment === 'negative' ? '📉 BEARISH' : '➡️ NEUTRAL'}
                            </span>
                            <ExternalLink className="w-5 h-5 text-blue-600 group-hover:text-blue-800" />
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                          {news.impact}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold">
                            <Newspaper className="w-3 h-3" />
                            {news.source}
                          </span>
                          <span>•</span>
                          <span>{news.date}</span>
                          <span>•</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold">Score: {news.score}/10</span>
                          <span>•</span>
                          <span className="px-2 py-1 bg-slate-100 rounded font-medium capitalize">{news.category?.replace('_', ' ')}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Info Footer */}
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
                  <p className="text-xs text-slate-600 text-center">
                    <strong>Data Sources:</strong> News sentiment powered by AI analysis of Bloomberg Markets, Investing.com, Reuters • Scores based on relevance and market impact
                  </p>
                </div>
              </div>
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
          <p>Natan Equity Research Platform</p>
          <p className="mt-1">Methodology: CFA Institute • Damodaran (NYU Stern) • Rosenbaum & Pearl</p>
          <p className="mt-1">Data Sources: BPS Statistics Indonesia • Bank Indonesia • Indonesia Stock Exchange</p>
        </div>
      </div>
    </div>
  );
}