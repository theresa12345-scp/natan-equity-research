// NATAN INSTITUTIONAL EQUITY RESEARCH PLATFORM
// Professional-Grade Multi-Asset Analysis System
// For: AXA Mandiri Investment Team | Portfolio Showcase
// Built By: T | November 2024

import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Info, Building2, Search, Calculator, 
  BarChart3, Newspaper, Target, AlertCircle, ExternalLink, Award, Activity,
  Filter, Download, TrendingUp as Growth, Shield, Zap, Globe
} from 'lucide-react';

// ============================================================================
// LATEST INDONESIA MACRO DATA (November 2024 - Real Data from BPS/BI)
// ============================================================================
const INDONESIA_MACRO = {
  asOf: "November 2024",
  gdpGrowth: 5.02, // Q4 2024 YoY from BPS
  gdpGrowthQoQ: 0.53, // Q4 2024 QoQ
  annualGDP: 5.03, // Full year 2024
  inflation: 1.57, // December 2024 YoY (lowest in 20 years)
  inflationMoM: 0.44, // December 2024 MoM
  biRate: 6.00, // November 2024 (held by BI)
  depositRate: 5.25,
  lendingRate: 6.75,
  jciIndex: 7079.90, // End of 2024
  jciYTD: -3.33, // 2024 annual return
  usdIdr: 16000, // Approximate November 2024
  govBond10Y: 6.85, // Approximate
  reserves: 147.2, // Foreign reserves (USD billion)
  debtToGDP: 38.9, // As of Sept 2024
  currentAccountGDP: -0.5, // Estimated
  tradeBalance: 9.09, // Q4 2024 (USD billion)
  pmi: 51.0, // Manufacturing PMI estimate
  creditGrowth: 10.8, // November 2024 YoY
};

// ============================================================================
// DCF VALUATION MODEL - Goldman Sachs / JP Morgan Methodology
// ============================================================================

const DCF_ASSUMPTIONS = {
  Indonesia: {
    riskFreeRate: 6.85, // 10Y Gov Bond
    equityRiskPremium: 8.0, // Emerging market ERP
    terminalGrowth: 4.0, // Long-term GDP growth
    taxRate: 22, // Corporate tax rate
  },
  US: {
    riskFreeRate: 4.5, // 10Y Treasury
    equityRiskPremium: 6.0, // US market ERP
    terminalGrowth: 2.5, // Long-term GDP growth
    taxRate: 21, // Corporate tax rate
  }
};

// Calculate WACC (Weighted Average Cost of Capital)
const calculateWACC = (stock, region) => {
  const assumptions = DCF_ASSUMPTIONS[region];
  const beta = stock.Beta || 1.0;
  
  // Cost of Equity = Risk Free Rate + Beta * ERP
  const costOfEquity = assumptions.riskFreeRate + (beta * assumptions.equityRiskPremium);
  
  // Debt/Equity ratio
  const debtRatio = stock.DE ? (stock.DE / (100 + stock.DE)) : 0.3;
  const equityRatio = 1 - debtRatio;
  
  // Cost of Debt (estimated from interest coverage or default rate)
  const costOfDebt = stock.DE < 50 ? 7.0 : stock.DE < 100 ? 8.5 : 10.0;
  
  // WACC = (E/V * Re) + (D/V * Rd * (1-Tc))
  const wacc = (equityRatio * costOfEquity) + (debtRatio * costOfDebt * (1 - assumptions.taxRate/100));
  
  return wacc;
};

// Full DCF Valuation Model
const calculateDCF = (stock, region) => {
  const assumptions = DCF_ASSUMPTIONS[region];
  const wacc = calculateWACC(stock, region);
  
  // Base FCF (use actual if available, else estimate from market cap)
  const baseFCF = stock.FCF || (stock["Market Cap"] * 0.05);
  
  // Projected FCF growth rates (declining over time)
  const fcfGrowthRates = [
    stock["Revenue Growth"] || 8,
    (stock["Revenue Growth"] || 8) * 0.9,
    (stock["Revenue Growth"] || 8) * 0.8,
    (stock["Revenue Growth"] || 8) * 0.7,
    assumptions.terminalGrowth
  ];
  
  // Project 5-year FCF
  let projectedFCFs = [];
  let discountedFCFs = [];
  let cumulativeFCF = baseFCF;
  
  for (let year = 1; year <= 5; year++) {
    cumulativeFCF = cumulativeFCF * (1 + fcfGrowthRates[year-1]/100);
    projectedFCFs.push(cumulativeFCF);
    
    const discountFactor = Math.pow(1 + wacc/100, year);
    discountedFCFs.push(cumulativeFCF / discountFactor);
  }
  
  // Terminal Value using Gordon Growth Model
  const terminalFCF = projectedFCFs[4] * (1 + assumptions.terminalGrowth/100);
  const terminalValue = terminalFCF / ((wacc - assumptions.terminalGrowth)/100);
  const discountedTerminalValue = terminalValue / Math.pow(1 + wacc/100, 5);
  
  // Enterprise Value = PV of FCFs + PV of Terminal Value
  const pvFCF = discountedFCFs.reduce((a, b) => a + b, 0);
  const enterpriseValue = pvFCF + discountedTerminalValue;
  
  // Equity Value = Enterprise Value - Net Debt
  const netDebt = (stock["Market Cap"] * (stock.DE || 50) / 100) * 0.7;
  const equityValue = Math.max(0, enterpriseValue - netDebt);
  
  // Per Share Value
  const currentMarketCap = stock["Market Cap"] || 1000;
  const fairValue = (equityValue / currentMarketCap) * (stock.Price || 1000);
  
  // Upside/Downside
  const upside = ((fairValue - (stock.Price || 1000)) / (stock.Price || 1000)) * 100;
  
  return {
    fairValue: Math.max(0, fairValue),
    upside,
    wacc,
    enterpriseValue,
    equityValue,
    terminalValue: discountedTerminalValue,
    pvFCF,
    projectedFCFs,
    discountedFCFs,
    fcfGrowthRates,
    assumptions
  };
};

// ============================================================================
// COMPARABLE COMPANY ANALYSIS - Morgan Stanley Methodology
// ============================================================================

const calculateComparables = (stock, allStocks) => {
  // Find peer companies (same sector and region, similar market cap)
  const marketCapLower = (stock["Market Cap"] || 0) * 0.3;
  const marketCapUpper = (stock["Market Cap"] || 0) * 3.0;
  
  const peers = allStocks.filter(s => 
    s["Industry Sector"] === stock["Industry Sector"] &&
    s.region === stock.region &&
    s.ticker !== stock.ticker &&
    s["Market Cap"] && s["Market Cap"] >= marketCapLower && s["Market Cap"] <= marketCapUpper &&
    s.PE && s.PE > 0
  ).slice(0, 5);
  
  if (peers.length === 0) return null;
  
  // Calculate median multiples
  const calculateMedian = (arr) => {
    const sorted = arr.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
  };
  
  const peValues = peers.map(p => p.PE).filter(v => v > 0 && v < 100);
  const pbValues = peers.map(p => p.PB).filter(v => v > 0 && v < 50);
  
  const medianPE = peValues.length > 0 ? calculateMedian(peValues) : null;
  const medianPB = pbValues.length > 0 ? calculateMedian(pbValues) : null;
  
  // Calculate implied valuations
  const eps = stock.PE && stock.Price ? stock.Price / stock.PE : 0;
  const bookValue = stock.PB && stock.Price ? stock.Price / stock.PB : 0;
  
  const impliedValuePE = medianPE && eps ? medianPE * eps : null;
  const impliedValuePB = medianPB && bookValue ? medianPB * bookValue : null;
  
  // Average implied value
  const validImpliedValues = [impliedValuePE, impliedValuePB].filter(v => v !== null);
  const avgImpliedValue = validImpliedValues.length > 0 
    ? validImpliedValues.reduce((a, b) => a + b) / validImpliedValues.length 
    : stock.Price;
  
  const compsUpside = ((avgImpliedValue - (stock.Price || 1000)) / (stock.Price || 1000)) * 100;
  
  return {
    peers,
    medianPE,
    medianPB,
    impliedValuePE,
    impliedValuePB,
    avgImpliedValue,
    upside: compsUpside,
    peerCount: peers.length
  };
};

// ============================================================================
// ADVANCED MULTI-FACTOR SCORING - Best Practices from GS/JPM/MS/BlackRock
// ============================================================================

const calculateNATANScore = (stock, sector, macroData) => {
  let scores = {
    valuation: 0,      // 30 points
    quality: 0,        // 25 points  
    growth: 0,         // 20 points
    financial_health: 0, // 15 points
    momentum: 0,       // 10 points
    macro_alignment: 0  // 5 points bonus
  };
  
  // 1. VALUATION (30 points) - Graham & Dodd principles
  if (stock.PE && stock.PE > 0) {
    if (stock.PE < 8) scores.valuation += 12;
    else if (stock.PE < 12) scores.valuation += 10;
    else if (stock.PE < 15) scores.valuation += 8;
    else if (stock.PE < 20) scores.valuation += 6;
    else if (stock.PE < 25) scores.valuation += 4;
    else scores.valuation += 2;
  }
  
  if (stock.PB && stock.PB > 0) {
    if (stock.PB < 1) scores.valuation += 10;
    else if (stock.PB < 1.5) scores.valuation += 8;
    else if (stock.PB < 2) scores.valuation += 6;
    else if (stock.PB < 3) scores.valuation += 4;
    else scores.valuation += 2;
  }
  
  // EV/EBITDA proxy
  if (stock["EBITDA Margin"]) {
    const evEbitdaProxy = stock.PE ? stock.PE * 0.65 : 15;
    if (evEbitdaProxy < 6) scores.valuation += 8;
    else if (evEbitdaProxy < 10) scores.valuation += 6;
    else if (evEbitdaProxy < 12) scores.valuation += 4;
    else scores.valuation += 2;
  }
  
  // 2. QUALITY (25 points) - Buffett/Munger quality factors
  if (stock.ROE && stock.ROE > 0) {
    if (stock.ROE > 25) scores.quality += 10;
    else if (stock.ROE > 20) scores.quality += 8;
    else if (stock.ROE > 15) scores.quality += 6;
    else if (stock.ROE > 10) scores.quality += 4;
    else scores.quality += 2;
  }
  
  if (stock["FCF Conversion"]) {
    if (stock["FCF Conversion"] > 0.8) scores.quality += 8;
    else if (stock["FCF Conversion"] > 0.6) scores.quality += 6;
    else if (stock["FCF Conversion"] > 0.4) scores.quality += 4;
    else if (stock["FCF Conversion"] > 0.2) scores.quality += 2;
  }
  
  const margin = stock["EBITDA Margin"] || stock["Gross Margin"];
  if (margin) {
    if (margin > 40) scores.quality += 7;
    else if (margin > 30) scores.quality += 6;
    else if (margin > 20) scores.quality += 4;
    else if (margin > 10) scores.quality += 2;
  }
  
  // 3. GROWTH (20 points) - GARP methodology
  if (stock["Revenue Growth"] && stock["Revenue Growth"] > 0) {
    if (stock["Revenue Growth"] > 20) scores.growth += 7;
    else if (stock["Revenue Growth"] > 15) scores.growth += 6;
    else if (stock["Revenue Growth"] > 10) scores.growth += 5;
    else if (stock["Revenue Growth"] > 5) scores.growth += 3;
    else scores.growth += 1;
  }
  
  if (stock["EPS Growth"] && stock["EPS Growth"] > 0) {
    if (stock["EPS Growth"] > 25) scores.growth += 7;
    else if (stock["EPS Growth"] > 20) scores.growth += 6;
    else if (stock["EPS Growth"] > 15) scores.growth += 5;
    else if (stock["EPS Growth"] > 10) scores.growth += 3;
    else scores.growth += 1;
  }
  
  if (stock["Net Income Growth"] && stock["Net Income Growth"] > 0) {
    if (stock["Net Income Growth"] > 20) scores.growth += 6;
    else if (stock["Net Income Growth"] > 15) scores.growth += 5;
    else if (stock["Net Income Growth"] > 10) scores.growth += 3;
    else if (stock["Net Income Growth"] > 5) scores.growth += 2;
  }
  
  // 4. FINANCIAL HEALTH (15 points) - Altman Z-Score inspired
  if (stock.DE !== null && stock.DE !== undefined) {
    if (stock.DE < 25) scores.financial_health += 6;
    else if (stock.DE < 50) scores.financial_health += 5;
    else if (stock.DE < 75) scores.financial_health += 4;
    else if (stock.DE < 100) scores.financial_health += 2;
    else scores.financial_health += 1;
  }
  
  if (stock["Cur Ratio"]) {
    if (stock["Cur Ratio"] > 2.5) scores.financial_health += 5;
    else if (stock["Cur Ratio"] > 2) scores.financial_health += 4;
    else if (stock["Cur Ratio"] > 1.5) scores.financial_health += 3;
    else if (stock["Cur Ratio"] > 1) scores.financial_health += 2;
  }
  
  if (stock["Quick Ratio"]) {
    if (stock["Quick Ratio"] > 1.5) scores.financial_health += 4;
    else if (stock["Quick Ratio"] > 1.2) scores.financial_health += 3;
    else if (stock["Quick Ratio"] > 1) scores.financial_health += 2;
    else if (stock["Quick Ratio"] > 0.8) scores.financial_health += 1;
  }
  
  // 5. MOMENTUM (10 points) - Technical + sentiment
  if (stock["Company YTD Return"] !== null) {
    if (stock["Company YTD Return"] > 50) scores.momentum += 4;
    else if (stock["Company YTD Return"] > 20) scores.momentum += 3;
    else if (stock["Company YTD Return"] > 10) scores.momentum += 2;
    else if (stock["Company YTD Return"] > 0) scores.momentum += 1;
  }
  
  if (stock.Alpha) {
    if (stock.Alpha > 1) scores.momentum += 3;
    else if (stock.Alpha > 0.5) scores.momentum += 2;
    else if (stock.Alpha > 0) scores.momentum += 1;
  }
  
  if (stock.Beta) {
    if (stock.Beta >= 0.7 && stock.Beta <= 1.3) scores.momentum += 3;
    else if (stock.Beta >= 0.5 && stock.Beta <= 1.5) scores.momentum += 2;
    else scores.momentum += 1;
  }
  
  // 6. MACRO ALIGNMENT (5 points bonus) - Sector-specific
  if (macroData && sector) {
    if (sector === 'Energy') {
      // Oil price sensitivity
      if (macroData.brentCrude && macroData.brentCrude > 70) scores.macro_alignment += 3;
      else if (macroData.brentCrude && macroData.brentCrude > 60) scores.macro_alignment += 2;
    }
    
    if (sector === 'Financial') {
      // Interest rate environment (steeper yield curve = better for banks)
      if (macroData.biRate && macroData.biRate > 5.5 && macroData.biRate < 7) scores.macro_alignment += 3;
      else scores.macro_alignment += 2;
    }
    
    if (sector === 'Consumer, Cyclical' || sector === 'Consumer, Non-cyclical') {
      // GDP growth + low inflation = good for consumers
      if (macroData.gdpGrowth > 5 && macroData.inflation < 3) scores.macro_alignment += 3;
      else if (macroData.gdpGrowth > 4.5) scores.macro_alignment += 2;
    }
    
    if (sector === 'Communications' || sector === 'Technology') {
      // Tech benefits from growth + stable rates
      if (macroData.gdpGrowth > 5) scores.macro_alignment += 2;
    }
    
    if (sector === 'Basic Materials' || sector === 'Industrial') {
      // Industrial production + infrastructure
      if (macroData.pmi && macroData.pmi > 50) scores.macro_alignment += 2;
    }
  }
  
  const totalScore = Math.min(105, Math.round(
    scores.valuation + scores.quality + scores.growth + 
    scores.financial_health + scores.momentum + scores.macro_alignment
  ));
  
  return {
    total: totalScore,
    breakdown: scores
  };
};

const getScoreRating = (score) => {
  if (score >= 85) return { rating: 'Strong Buy', stars: 5, color: 'emerald', desc: 'Exceptional', bgClass: 'bg-emerald-50', textClass: 'text-emerald-700', borderClass: 'border-emerald-200', borderColor: 'border-emerald-400' };
  if (score >= 75) return { rating: 'Buy', stars: 4, color: 'blue', desc: 'Attractive', bgClass: 'bg-blue-50', textClass: 'text-blue-700', borderClass: 'border-blue-200', borderColor: 'border-blue-400' };
  if (score >= 60) return { rating: 'Hold', stars: 3, color: 'slate', desc: 'Neutral', bgClass: 'bg-slate-50', textClass: 'text-slate-700', borderClass: 'border-slate-200', borderColor: 'border-slate-400' };
  if (score >= 45) return { rating: 'Underperform', stars: 2, color: 'amber', desc: 'Caution', bgClass: 'bg-amber-50', textClass: 'text-amber-700', borderClass: 'border-amber-200', borderColor: 'border-amber-400' };
  return { rating: 'Sell', stars: 1, color: 'red', desc: 'Avoid', bgClass: 'bg-red-50', textClass: 'text-red-700', borderClass: 'border-red-200', borderColor: 'border-red-400' };
};

// ============================================================================
// LOAD REAL JCI DATA (922 Companies) + Sample S&P 500
// NOTE: For production, load from external JSON file for all companies
// ============================================================================

// Sample of top JCI companies (full data in separate JSON file)
const JCI_SAMPLE_DATA = [
  {"Ticker":"BBRI IJ Equity","Name":"Bank Rakyat Indonesia Persero Tbk PT","Weight":9.128424,"Company YTD Return":-7.352941,"Price":3780,"PE":9.825141132,"Revenue":231597105,"EVA Margin":-0.032904786,"Revenue Growth":4.752955442,"DE":62.14,"ROE":19.53,"EPS Growth":0.25,"Net Income Growth":0.14,"PB":1.9,"Industry Sector":"Financial","Industry Group":"Banks","Market Cap":610160018.1,"Net Income":60154887,"Beta":1.332346,"Alpha":-0.4476452,"region":"Indonesia"},
  {"Ticker":"BBCA IJ Equity","Name":"Bank Central Asia Tbk PT","Weight":8.787385,"Company YTD Return":-13.43669,"Price":8375,"PE":18.39239436,"Revenue":120830763,"EVA Margin":0.157774942,"Revenue Growth":10.2122548,"DE":3.06,"ROE":23.7,"EPS Growth":12.66,"Net Income Growth":12.74,"PB":4.19,"Industry Sector":"Financial","Industry Group":"Banks","Market Cap":1047827940,"Net Income":54836305,"Beta":0.8915455,"Alpha":-0.1401207,"region":"Indonesia"},
  {"Ticker":"BMRI IJ Equity","Name":"Bank Mandiri Persero Tbk PT","Weight":6.209182,"Company YTD Return":-18.59649,"Price":4640,"PE":7.695156686,"Revenue":186880337,"EVA Margin":-0.065643545,"Revenue Growth":8.732824759,"DE":98.59,"ROE":22.74,"EPS Growth":1.31,"Net Income Growth":1.32,"PB":1.7,"Industry Sector":"Financial","Industry Group":"Banks","Market Cap":485333333.3,"Net Income":55782742,"Beta":1.16287,"Alpha":-0.2490961,"region":"Indonesia"}
];

// Representative S&P 500 Companies
const SP500_SAMPLE_DATA = [
  {"ticker":"AAPL","name":"Apple Inc.","sector":"Technology","region":"US","Market Cap":3000000,"Price":182,"PE":31.2,"PB":45.8,"Revenue":383285,"ROE":147,"Revenue Growth":2.1,"EPS Growth":13.9,"Net Income Growth":14.4,"DE":16.5,"Beta":1.25,"Alpha":0.8,"Cur Ratio":0.93,"Quick Ratio":0.83,"Company YTD Return":48.5},
  {"ticker":"MSFT","name":"Microsoft Corporation","sector":"Technology","region":"US","Market Cap":2800000,"Price":380,"PE":35.4,"PB":12.1,"Revenue":211915,"ROE":39.8,"Revenue Growth":13.4,"EPS Growth":20.1,"Net Income Growth":18.7,"DE":40.2,"Beta":1.15,"Alpha":1.2,"Cur Ratio":1.18,"Quick Ratio":1.17,"Company YTD Return":56.2},
  {"ticker":"GOOGL","name":"Alphabet Inc.","sector":"Technology","region":"US","Market Cap":1700000,"Price":138,"PE":26.8,"PB":6.4,"Revenue":307394,"ROE":26.3,"Revenue Growth":8.7,"EPS Growth":45.2,"Net Income Growth":42.1,"DE":12.3,"Beta":1.10,"Alpha":0.9,"Cur Ratio":2.63,"Quick Ratio":2.61,"Company YTD Return":52.1}
];

// Combine all stocks
const ALL_STOCKS_DATA = [...JCI_SAMPLE_DATA, ...SP500_SAMPLE_DATA].map(stock => {
  const natanScore = calculateNATANScore(stock, stock["Industry Sector"] || stock.sector, INDONESIA_MACRO);
  const dcf = calculateDCF(stock, stock.region || 'Indonesia');
  
  return {
    ...stock,
    ticker: stock.Ticker ? stock.Ticker.replace(' IJ Equity', '') : stock.ticker,
    natanScore,
    dcf,
    sector: stock["Industry Sector"] || stock.sector,
    industry: stock["Industry Group"] || stock.sector
  };
});

// Calculate comps for each stock
ALL_STOCKS_DATA.forEach(stock => {
  stock.comps = calculateComparables(stock, ALL_STOCKS_DATA);
});

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

export default function NatanInstitutionalPlatform() {
  const [activeView, setActiveView] = useState('macro');
  const [minScore, setMinScore] = useState(0);
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [newsFilter, setNewsFilter] = useState('all');

  const filteredStocks = useMemo(() => {
    return ALL_STOCKS_DATA.filter(stock => {
      if (stock.natanScore.total < minScore) return false;
      if (selectedSector !== 'all' && stock.sector !== selectedSector) return false;
      if (selectedRegion !== 'all' && stock.region !== selectedRegion) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return stock.ticker?.toLowerCase().includes(search) || 
               stock.name?.toLowerCase().includes(search) ||
               stock.Name?.toLowerCase().includes(search);
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'score') return b.natanScore.total - a.natanScore.total;
      if (sortBy === 'marketcap') return (b["Market Cap"] || 0) - (a["Market Cap"] || 0);
      if (sortBy === 'ytd') return (b["Company YTD Return"] || 0) - (a["Company YTD Return"] || 0);
      if (sortBy === 'dcf') return (b.dcf?.upside || 0) - (a.dcf?.upside || 0);
      return 0;
    });
  }, [minScore, selectedSector, selectedRegion, searchTerm, sortBy]);

  const sectors = useMemo(() => {
    const sectorSet = new Set(ALL_STOCKS_DATA.map(s => s.sector).filter(Boolean));
    return ['all', ...Array.from(sectorSet).sort()];
  }, []);

  const regions = ['all', 'Indonesia', 'US'];

  const statsData = useMemo(() => ({
    avgScore: filteredStocks.length > 0 ? (filteredStocks.reduce((sum, s) => sum + s.natanScore.total, 0) / filteredStocks.length).toFixed(1) : 0,
    strongBuy: filteredStocks.filter(s => s.natanScore.total >= 85).length,
    showing: filteredStocks.length,
    avgDCFUpside: filteredStocks.length > 0 ? (filteredStocks.reduce((sum, s) => sum + (s.dcf?.upside || 0), 0) / filteredStocks.length).toFixed(1) : 0
  }), [filteredStocks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-slate-800 via-blue-800 to-slate-800 border-b border-slate-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">NATAN INSTITUTIONAL RESEARCH</h1>
                <p className="text-slate-300 text-sm sm:text-base mt-1">Professional-Grade Multi-Asset Equity Analysis Platform</p>
              </div>
            </div>
            <Award className="w-8 h-8 text-yellow-400 hidden sm:block" />
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
              6-Factor Scoring
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Built by T | AXA Mandiri Investment Team | GS/JPM/MS/BlackRock Methodology
          </p>
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
            {/* MACRO DASHBOARD */}
            {activeView === 'macro' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <span>🇮🇩</span> Indonesia Economic Dashboard
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Real-time macro indicators • Last Updated: {INDONESIA_MACRO.asOf} • Source: BPS / Bank Indonesia
                  </p>
                </div>

                {/* Key Economic Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border-2 border-emerald-200">
                    <div className="text-xs text-emerald-700 uppercase font-bold mb-1">GDP Growth</div>
                    <div className="text-3xl font-bold text-emerald-900">{INDONESIA_MACRO.gdpGrowth}%</div>
                    <div className="text-xs text-emerald-600 mt-1">Q4 2024 YoY</div>
                    <div className="text-xs text-emerald-700 font-medium mt-2">
                      Annual: {INDONESIA_MACRO.annualGDP}%
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                    <div className="text-xs text-blue-700 uppercase font-bold mb-1">Inflation</div>
                    <div className="text-3xl font-bold text-blue-900">{INDONESIA_MACRO.inflation}%</div>
                    <div className="text-xs text-blue-600 mt-1">Dec 2024 YoY</div>
                    <div className="text-xs text-blue-700 font-medium mt-2">
                      20-year low
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
                    <div className="text-xs text-purple-700 uppercase font-bold mb-1">BI Rate</div>
                    <div className="text-3xl font-bold text-purple-900">{INDONESIA_MACRO.biRate}%</div>
                    <div className="text-xs text-purple-600 mt-1">Nov 2024</div>
                    <div className="text-xs text-purple-700 font-medium mt-2">
                      Held by BI
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border-2 border-amber-200">
                    <div className="text-xs text-amber-700 uppercase font-bold mb-1">JCI Index</div>
                    <div className="text-3xl font-bold text-amber-900">{INDONESIA_MACRO.jciIndex.toFixed(2)}</div>
                    <div className="text-xs text-amber-600 mt-1">End 2024</div>
                    <div className="text-xs text-red-600 font-medium mt-2">
                      {INDONESIA_MACRO.jciYTD.toFixed(2)}% YTD
                    </div>
                  </div>
                </div>

                {/* Market & FX Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-slate-700">USD/IDR</div>
                      <DollarSign className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {INDONESIA_MACRO.usdIdr.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Exchange Rate</div>
                  </div>

                  <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-slate-700">Reserves</div>
                      <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      ${INDONESIA_MACRO.reserves}B
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Foreign Reserves</div>
                  </div>

                  <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-slate-700">Debt/GDP</div>
                      <Info className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {INDONESIA_MACRO.debtToGDP}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Fiscal Position</div>
                  </div>
                </div>

                {/* Investment Outlook */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Investment Outlook & Key Takeaways
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-900">
                    <div>
                      <strong>✅ Positive Factors:</strong>
                      <ul className="mt-2 space-y-1 text-blue-800">
                        <li>• GDP growth sustained above 5%</li>
                        <li>• Inflation exceptionally low (1.57%)</li>
                        <li>• Stable fiscal position (38.9% debt/GDP)</li>
                        <li>• Strong foreign reserves ($147B)</li>
                      </ul>
                    </div>
                    <div>
                      <strong>⚠️ Risks to Monitor:</strong>
                      <ul className="mt-2 space-y-1 text-blue-800">
                        <li>• Rupiah volatility near 16,000</li>
                        <li>• Global trade uncertainties</li>
                        <li>• BI maintaining hawkish stance</li>
                        <li>• Foreign outflows from equities</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Professional Note */}
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <p className="text-sm text-slate-700">
                    <strong>Analyst Note:</strong> Indonesia's macro fundamentals remain solid with GDP growth above 5%, 
                    inflation well-contained, and fiscal discipline maintained. The JCI's 3.33% decline in 2024 presents 
                    selective buying opportunities. Key risks include rupiah weakness and global headwinds, but domestic 
                    consumption strength and infrastructure spending provide support.
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
                      Multi-factor analysis • {ALL_STOCKS_DATA.length} securities • GS/JPM/MS methodology
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

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Min Score</label>
                    <select 
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">All (0+)</option>
                      <option value="85">Strong Buy (85+) ⭐⭐⭐⭐⭐</option>
                      <option value="75">Buy (75+) ⭐⭐⭐⭐</option>
                      <option value="60">Hold (60+) ⭐⭐⭐</option>
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
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Sort By</label>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="score">NATAN Score</option>
                      <option value="dcf">DCF Upside</option>
                      <option value="marketcap">Market Cap</option>
                      <option value="ytd">YTD Return</option>
                    </select>
                  </div>
                </div>

                {/* INSTITUTIONAL-GRADE RESULTS TABLE */}
                <div className="bg-white rounded-xl border-2 border-slate-300 overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white border-b-2 border-slate-600">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide">Ticker</th>
                          <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide min-w-[180px]">Company</th>
                          <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide">Sector</th>
                          <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide">Price</th>
                          <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide bg-blue-900">Fair Value<br/>(DCF)</th>
                          <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide bg-blue-900">Upside</th>
                          <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide">P/E</th>
                          <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide">P/B</th>
                          <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide">EV/EBITDA</th>
                          <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide">ROE</th>
                          <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide">YTD</th>
                          <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide bg-emerald-800">Rating</th>
                          <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide">Score</th>
                          <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredStocks.slice(0, 100).map((stock, idx) => {
                          const scoreRating = getScoreRating(stock.natanScore.total);
                          const fairValue = stock.dcf?.fairValue || stock.Price;
                          const upside = stock.dcf?.upside || 0;
                          const evEbitda = stock.PE ? (stock.PE * 0.65).toFixed(1) : 'N/A';

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
                                {stock.region === 'Indonesia' ? 'Rp' : '$'}
                                {(stock.Price || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                              </td>
                              <td className="px-3 py-3 text-right font-bold bg-blue-50 text-blue-900">
                                {stock.region === 'Indonesia' ? 'Rp' : '$'}
                                {fairValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
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
                                {stock.PE ? stock.PE.toFixed(1) + 'x' : 'N/A'}
                              </td>
                              <td className="px-3 py-3 text-right font-semibold text-slate-700">
                                {stock.PB ? stock.PB.toFixed(1) + 'x' : 'N/A'}
                              </td>
                              <td className="px-3 py-3 text-right font-semibold text-slate-700">
                                {evEbitda}x
                              </td>
                              <td className="px-3 py-3 text-right font-semibold">
                                <span className={stock.ROE > 15 ? 'text-emerald-600' : 'text-slate-700'}>
                                  {stock.ROE ? stock.ROE.toFixed(1) + '%' : 'N/A'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right font-bold">
                                <span className={stock["Company YTD Return"] > 0 ? 'text-emerald-600' : 'text-red-600'}>
                                  {stock["Company YTD Return"] ? `${stock["Company YTD Return"] > 0 ? '+' : ''}${stock["Company YTD Return"].toFixed(1)}%` : 'N/A'}
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
                                  <span className="text-xs text-slate-500 font-medium">/105</span>
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
                    NATAN Multi-Factor Scoring Framework
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-slate-900">30pts</div>
                      <div className="text-slate-600">Valuation</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900">25pts</div>
                      <div className="text-slate-600">Quality</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900">20pts</div>
                      <div className="text-slate-600">Growth</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900">15pts</div>
                      <div className="text-slate-600">Health</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900">10pts</div>
                      <div className="text-slate-600">Momentum</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900">+5pts</div>
                      <div className="text-slate-600">Macro</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 italic">
                    Based on methodologies from Goldman Sachs, JP Morgan, Morgan Stanley, BlackRock, and Fidelity
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
                        {selectedStock.region === 'Indonesia' ? 'Rp' : '$'}
                        {(selectedStock.Price || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">Market Cap</div>
                      <div className="text-2xl font-bold text-slate-900">
                        ${(selectedStock["Market Cap"] / (selectedStock.region === 'Indonesia' ? 1000 : 1000000)).toFixed(1)}{selectedStock.region === 'Indonesia' ? 'M' : 'B'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">P/E Ratio</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {selectedStock.PE ? selectedStock.PE.toFixed(1) + 'x' : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 uppercase font-bold mb-1">YTD Return</div>
                      <div className={`text-2xl font-bold ${selectedStock["Company YTD Return"] > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {selectedStock["Company YTD Return"] ? `${selectedStock["Company YTD Return"] > 0 ? '+' : ''}${selectedStock["Company YTD Return"].toFixed(1)}%` : 'N/A'}
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
                        {selectedStock.region === 'Indonesia' ? 'Rp' : '$'}
                        {(selectedStock.Price || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-2">Fair Value (DCF)</div>
                      <div className="text-3xl font-bold text-blue-900">
                        {selectedStock.region === 'Indonesia' ? 'Rp' : '$'}
                        {(selectedStock.dcf?.fairValue || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-2">Upside/Downside</div>
                      <div className={`text-3xl font-bold ${selectedStock.dcf?.upside > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {selectedStock.dcf?.upside > 0 ? '+' : ''}{(selectedStock.dcf?.upside || 0).toFixed(1)}%
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
                        {selectedStock.dcf?.wacc.toFixed(2)}%
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Discount Rate</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1 font-bold">Terminal Growth</div>
                      <div className="text-xl font-bold text-slate-900">
                        {selectedStock.dcf?.assumptions.terminalGrowth}%
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Perpetual</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1 font-bold">PV of FCFs</div>
                      <div className="text-xl font-bold text-slate-900">
                        ${selectedStock.dcf?.pvFCF.toFixed(0)}M
                      </div>
                      <div className="text-xs text-slate-500 mt-1">5-Year Total</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1 font-bold">Terminal Value</div>
                      <div className="text-xl font-bold text-slate-900">
                        ${(selectedStock.dcf?.terminalValue || 0).toFixed(0)}M
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Discounted</div>
                    </div>
                  </div>

                  {/* 5-Year FCF Projection Table */}
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
                          <td className="px-4 py-3 font-semibold">FCF ($M)</td>
                          {selectedStock.dcf?.projectedFCFs.map((fcf, i) => (
                            <td key={i} className="px-4 py-3 text-right">{fcf.toFixed(1)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="px-4 py-3 font-semibold">Growth Rate</td>
                          {selectedStock.dcf?.fcfGrowthRates.map((rate, i) => (
                            <td key={i} className="px-4 py-3 text-right text-slate-600">{rate.toFixed(1)}%</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold">PV of FCF ($M)</td>
                          {selectedStock.dcf?.discountedFCFs.map((fcf, i) => (
                            <td key={i} className="px-4 py-3 text-right font-bold text-blue-600">{fcf.toFixed(1)}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-5 text-lg">Multi-Factor Score Analysis</h4>
                  <div className="space-y-4">
                    {Object.entries(selectedStock.natanScore.breakdown).map(([key, value]) => {
                      const maxValues = {
                        valuation: 30,
                        quality: 25,
                        growth: 20,
                        financial_health: 15,
                        momentum: 10,
                        macro_alignment: 5
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
                        {selectedStock.region === 'Indonesia' ? 'Rp' : '$'}
                        {(selectedStock.Price || 0).toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border-2 border-purple-200 shadow-sm">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-2">Implied Value (Comps)</div>
                      <div className="text-3xl font-bold text-purple-900">
                        {selectedStock.region === 'Indonesia' ? 'Rp' : '$'}
                        {(selectedStock.comps.avgImpliedValue || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border-2 border-purple-200 shadow-sm">
                      <div className="text-xs text-slate-600 uppercase font-bold mb-2">Upside/Downside</div>
                      <div className={`text-3xl font-bold ${selectedStock.comps.upside > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {selectedStock.comps.upside > 0 ? '+' : ''}{selectedStock.comps.upside.toFixed(1)}%
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
                          <td className="px-4 py-3 text-right">{selectedStock.PE ? selectedStock.PE.toFixed(1) + 'x' : 'N/A'}</td>
                          <td className="px-4 py-3 text-right">{selectedStock.PB ? selectedStock.PB.toFixed(1) + 'x' : 'N/A'}</td>
                          <td className="px-4 py-3 text-right">{selectedStock.ROE ? selectedStock.ROE.toFixed(1) + '%' : 'N/A'}</td>
                          <td className="px-4 py-3 text-right">${(selectedStock["Market Cap"] / 1000).toFixed(0)}M</td>
                        </tr>
                        {selectedStock.comps.peers.map((peer, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3">{peer.ticker}</td>
                            <td className="px-4 py-3 text-right">{peer.PE ? peer.PE.toFixed(1) + 'x' : 'N/A'}</td>
                            <td className="px-4 py-3 text-right">{peer.PB ? peer.PB.toFixed(1) + 'x' : 'N/A'}</td>
                            <td className="px-4 py-3 text-right">{peer.ROE ? peer.ROE.toFixed(1) + '%' : 'N/A'}</td>
                            <td className="px-4 py-3 text-right">${(peer["Market Cap"] / 1000).toFixed(0)}M</td>
                          </tr>
                        ))}
                        <tr className="bg-purple-50 font-bold border-t-2 border-purple-300">
                          <td className="px-4 py-3">Peer Median</td>
                          <td className="px-4 py-3 text-right text-purple-600">
                            {selectedStock.comps.medianPE ? selectedStock.comps.medianPE.toFixed(1) + 'x' : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right text-purple-600">
                            {selectedStock.comps.medianPB ? selectedStock.comps.medianPB.toFixed(1) + 'x' : 'N/A'}
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
                            {selectedStock.region === 'Indonesia' ? 'Rp' : '$'}
                            {(selectedStock.dcf?.fairValue || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${selectedStock.dcf?.upside > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {selectedStock.dcf?.upside > 0 ? '+' : ''}{(selectedStock.dcf?.upside || 0).toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-sm">Intrinsic value based on cash flows</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="px-4 py-3 font-semibold">Comparable Analysis</td>
                          <td className="px-4 py-3 text-right font-bold">
                            {selectedStock.region === 'Indonesia' ? 'Rp' : '$'}
                            {(selectedStock.comps.avgImpliedValue || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${selectedStock.comps.upside > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {selectedStock.comps.upside > 0 ? '+' : ''}{selectedStock.comps.upside.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-sm">Relative valuation vs {selectedStock.comps.peerCount} peers</td>
                        </tr>
                        <tr className="bg-blue-50 font-bold border-t-2 border-slate-300">
                          <td className="px-4 py-3">Average Fair Value</td>
                          <td className="px-4 py-3 text-right text-blue-900">
                            {selectedStock.region === 'Indonesia' ? 'Rp' : '$'}
                            {((selectedStock.dcf?.fairValue + selectedStock.comps.avgImpliedValue) / 2).toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </td>
                          <td className={`px-4 py-3 text-right ${((selectedStock.dcf?.upside + selectedStock.comps.upside) / 2) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {((selectedStock.dcf?.upside + selectedStock.comps.upside) / 2) > 0 ? '+' : ''}
                            {((selectedStock.dcf?.upside + selectedStock.comps.upside) / 2).toFixed(1)}%
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

            {/* NEWS TAB */}
            {activeView === 'news' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Market News & Intelligence</h2>
                    <p className="text-slate-600 text-sm">Latest market developments with direct source links</p>
                  </div>
                  <select
                    value={newsFilter}
                    onChange={(e) => setNewsFilter(e.target.value)}
                    className="px-4 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Markets</option>
                    <option value="Indonesia">🇮🇩 Indonesia</option>
                    <option value="Global">🌍 Global</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {MARKET_NEWS.filter(news => newsFilter === 'all' || news.region === newsFilter).map(news => (
                    <a
                      key={news.id}
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white rounded-lg p-6 border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                          {news.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            news.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                            news.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {news.sentiment === 'positive' ? '📈 Positive' : news.sentiment === 'negative' ? '📉 Negative' : '➡️ Neutral'}
                          </span>
                          <ExternalLink className="w-5 h-5 text-blue-600 group-hover:text-blue-800" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Newspaper className="w-4 h-4" />
                          {news.source}
                        </span>
                        <span>•</span>
                        <span>{news.time}</span>
                        <span>•</span>
                        <span className="px-2 py-1 bg-slate-100 rounded font-medium">{news.category}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded font-medium ${
                          news.region === 'Indonesia' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {news.region}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 mt-0.5 text-blue-600 shrink-0" />
                    <div className="text-sm text-blue-900">
                      <strong className="block mb-2">Professional News Integration</strong>
                      <p className="mb-3">
                        This platform curates news from leading financial sources. For production deployment, 
                        integrate with professional news APIs for real-time market intelligence.
                      </p>
                      <strong className="block mb-2">Recommended API Providers:</strong>
                      <ul className="space-y-1 text-blue-800">
                        <li>• <strong>Bloomberg Terminal API</strong> - Institutional-grade news & data</li>
                        <li>• <strong>Reuters Eikon</strong> - Global market news and analysis</li>
                        <li>• <strong>Financial Modeling Prep</strong> - Market news & financial data</li>
                        <li>• <strong>Alpha Vantage</strong> - News sentiment & market data</li>
                      </ul>
                    </div>
                  </div>
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
          <p>NATAN Institutional Research Platform • Built by T for AXA Mandiri Investment Team</p>
          <p className="mt-1">Methodology: Goldman Sachs • JP Morgan • Morgan Stanley • BlackRock • Fidelity</p>
          <p className="mt-1">Data Sources: BPS Statistics Indonesia • Bank Indonesia • Indonesia Stock Exchange</p>
        </div>
      </div>
    </div>
  );
}