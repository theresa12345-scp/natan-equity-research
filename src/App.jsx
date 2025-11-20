import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Building2, Search,
  BarChart3, Calculator, Activity, Award, Info, ChevronRight
} from 'lucide-react';

// Latest Indonesia Macro (Q4 2024 - Real Data)
const INDONESIA_MACRO = {
  date: "Q4 2024",
  gdpGrowth: 5.02,
  gdpGrowthQoQ: 0.53,
  inflation: 1.57,
  biRate: 6.00,
  depositRate: 5.25,
  lendingRate: 6.75,
  jciIndex: 7079.90,
  usdIdr: 16102,
  reserves: 147.2,
  brentCrude: 74.64,
  govBond10Y: 6.997,
  spx: 5881.63,
  usFedRate: 5.13
};

// DCF Parameters
const DCF_PARAMS = {
  Indonesia: {
    riskFreeRate: 6.997,
    marketRiskPremium: 8.5,
    terminalGrowth: 4.0,
    taxRate: 22
  },
  US: {
    riskFreeRate: 4.50,
    marketRiskPremium: 6.0,
    terminalGrowth: 2.5,
    taxRate: 21
  }
};

// Multi-Factor Scoring
const calculateScore = (stock, macro) => {
  let score = 0;

  // Valuation (30 points)
  if (stock.PE && stock.PE > 0) {
    if (stock.PE < 10) score += 12;
    else if (stock.PE < 15) score += 10;
    else if (stock.PE < 20) score += 7;
    else if (stock.PE < 30) score += 4;
    else score += 1;
  }

  if (stock.PB && stock.PB > 0) {
    if (stock.PB < 1) score += 10;
    else if (stock.PB < 2) score += 8;
    else if (stock.PB < 3) score += 6;
    else if (stock.PB < 5) score += 4;
    else score += 1;
  }

  // Quality (25 points)
  if (stock.ROE && stock.ROE > 0) {
    if (stock.ROE > 20) score += 10;
    else if (stock.ROE > 15) score += 8;
    else if (stock.ROE > 10) score += 6;
    else if (stock.ROE > 5) score += 3;
    else score += 1;
  }

  // Growth (20 points)
  if (stock['Revenue Growth'] && stock['Revenue Growth'] > 0) {
    if (stock['Revenue Growth'] > 15) score += 7;
    else if (stock['Revenue Growth'] > 10) score += 5;
    else if (stock['Revenue Growth'] > 5) score += 3;
    else score += 1;
  }

  if (stock['EPS Growth'] && stock['EPS Growth'] > 0) {
    if (stock['EPS Growth'] > 20) score += 7;
    else if (stock['EPS Growth'] > 10) score += 5;
    else if (stock['EPS Growth'] > 5) score += 3;
    else score += 1;
  }

  // Financial Health (15 points)
  if (stock.DE >= 0) {
    if (stock.DE < 30) score += 6;
    else if (stock.DE < 50) score += 5;
    else if (stock.DE < 100) score += 3;
    else score += 1;
  }

  // Momentum (10 points)
  if (stock['Company YTD Return'] !== null && stock['Company YTD Return'] !== undefined) {
    if (stock['Company YTD Return'] > 20) score += 4;
    else if (stock['Company YTD Return'] > 10) score += 3;
    else if (stock['Company YTD Return'] > 0) score += 2;
    else if (stock['Company YTD Return'] > -10) score += 1;
  }

  if (stock.Alpha) {
    if (stock.Alpha > 0.5) score += 3;
    else if (stock.Alpha > 0) score += 2;
    else score += 1;
  }

  // Macro Alignment (5 points)
  if (stock['Industry Sector'] === "Financial" && macro.biRate >= 5.5 && macro.biRate <= 6.5) score += 3;
  if (stock['Industry Sector'] === "Energy" && macro.brentCrude > 70) score += 3;
  if ((stock['Industry Sector'] === "Consumer, Cyclical" || stock['Industry Sector'] === "Consumer, Non-cyclical") && macro.gdpGrowth > 5) score += 2;

  return Math.min(100, Math.round(score));
};

const getRating = (score) => {
  if (score >= 80) return { rating: 'Strong Buy', color: 'emerald', stars: 5 };
  if (score >= 70) return { rating: 'Buy', color: 'blue', stars: 4 };
  if (score >= 55) return { rating: 'Hold', color: 'slate', stars: 3 };
  if (score >= 40) return { rating: 'Underperform', color: 'amber', stars: 2 };
  return { rating: 'Sell', color: 'red', stars: 1 };
};

function App() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('macro');
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Load full dataset
  useEffect(() => {
    fetch('/global_companies_full.json')
      .then(res => res.json())
      .then(data => {
        console.log(`✅ Loaded ${data.length} companies`);
        setCompanies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  const processedCompanies = useMemo(() => {
    return companies.map(stock => {
      const score = calculateScore(stock, INDONESIA_MACRO);
      return {
        ...stock,
        score,
        rating: getRating(score)
      };
    });
  }, [companies]);

  const filteredStocks = useMemo(() => {
    return processedCompanies.filter(stock => {
      if (stock.score < minScore) return false;
      if (selectedSector !== 'all' && stock['Industry Sector'] !== selectedSector) return false;
      if (selectedRegion !== 'all' && stock.Region !== selectedRegion) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return stock.Ticker?.toLowerCase().includes(search) ||
               stock.Name?.toLowerCase().includes(search);
      }
      return true;
    }).sort((a, b) => b.score - a.score);
  }, [processedCompanies, searchTerm, minScore, selectedSector, selectedRegion]);

  const sectors = useMemo(() => {
    const sectorSet = new Set(processedCompanies.map(s => s['Industry Sector']).filter(Boolean));
    return ['all', ...Array.from(sectorSet).sort()];
  }, [processedCompanies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading NATAN Platform...</p>
          <p className="text-slate-300 text-sm mt-2">Loading 949 global securities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-blue-800 border-b border-slate-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">NATAN EQUITY RESEARCH</h1>
            <Award className="w-7 h-7 text-yellow-400" />
          </div>
          <p className="text-slate-300 text-sm">Professional-Grade Global Investment Analysis Platform</p>
          <p className="text-slate-400 text-xs mt-1">
            AXA Mandiri Investment Team • {processedCompanies.length} Global Securities •
            Multi-Factor Scoring (GS • JPM • MS • BlackRock • Fidelity)
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'macro', label: '🇮🇩 Indonesia Macro', icon: TrendingUp },
              { id: 'screener', label: 'Screener', icon: Search },
              { id: 'analysis', label: 'Analysis', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap ${
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

          <div className="p-6">
            {/* MACRO DASHBOARD */}
            {activeView === 'macro' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <span>🇮🇩</span> Indonesia Economic Dashboard
                  </h3>
                  <p className="text-slate-600 text-sm">Latest macro indicators as of {INDONESIA_MACRO.date}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border-2 border-emerald-200 shadow-lg">
                    <div className="text-xs text-emerald-700 uppercase font-semibold mb-1">GDP Growth</div>
                    <div className="text-3xl font-bold text-emerald-900">{INDONESIA_MACRO.gdpGrowth}%</div>
                    <div className="text-xs text-emerald-600 mt-1">YoY Q4 2024</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200 shadow-lg">
                    <div className="text-xs text-blue-700 uppercase font-semibold mb-1">Inflation</div>
                    <div className="text-3xl font-bold text-blue-900">{INDONESIA_MACRO.inflation}%</div>
                    <div className="text-xs text-blue-600 mt-1">Historic Low</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200 shadow-lg">
                    <div className="text-xs text-purple-700 uppercase font-semibold mb-1">BI Rate</div>
                    <div className="text-3xl font-bold text-purple-900">{INDONESIA_MACRO.biRate}%</div>
                    <div className="text-xs text-purple-600 mt-1">Policy Rate</div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border-2 border-amber-200 shadow-lg">
                    <div className="text-xs text-amber-700 uppercase font-semibold mb-1">10Y Bond</div>
                    <div className="text-3xl font-bold text-amber-900">{INDONESIA_MACRO.govBond10Y}%</div>
                    <div className="text-xs text-amber-600 mt-1">Yield</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-5 border-2 border-slate-200 shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">JCI Index</span>
                      <Activity className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{INDONESIA_MACRO.jciIndex.toFixed(2)}</div>
                    <div className="text-xs text-slate-500 mt-1">Jakarta Composite</div>
                  </div>

                  <div className="bg-white rounded-lg p-5 border-2 border-slate-200 shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">USD/IDR</span>
                      <DollarSign className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{INDONESIA_MACRO.usdIdr.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 mt-1">Exchange Rate</div>
                  </div>

                  <div className="bg-white rounded-lg p-5 border-2 border-slate-200 shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">Brent Crude</span>
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">${INDONESIA_MACRO.brentCrude}</div>
                    <div className="text-xs text-slate-500 mt-1">Oil Price/bbl</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-md">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Investment Environment Analysis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                    <div><strong>Growth:</strong> GDP at 5.02% YoY, driven by domestic consumption</div>
                    <div><strong>Inflation:</strong> Historic low at 1.57%, within BI target</div>
                    <div><strong>Monetary Policy:</strong> BI Rate held at 6.0% for rupiah stability</div>
                    <div><strong>External Position:</strong> Reserves at $147.2B, strong buffer</div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREENER */}
            {activeView === 'screener' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Global Equity Screener</h3>
                  <p className="text-slate-600 text-sm">
                    {processedCompanies.length} securities • Multi-factor institutional analysis
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search ticker or company name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Min NATAN Score</label>
                    <select
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="0">All Scores (0+)</option>
                      <option value="80">Strong Buy (80+) ⭐⭐⭐⭐⭐</option>
                      <option value="70">Buy (70+) ⭐⭐⭐⭐</option>
                      <option value="55">Hold (55+) ⭐⭐⭐</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Sector</label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {sectors.map(s => (
                        <option key={s} value={s}>{s === 'all' ? 'All Sectors' : s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Region</label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="all">All Markets</option>
                      <option value="Indonesia">🇮🇩 Indonesia</option>
                      <option value="US">🇺🇸 United States</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border-2 border-slate-200 shadow-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Ticker</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Company</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase hidden lg:table-cell">Sector</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase hidden sm:table-cell">YTD %</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Score</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredStocks.slice(0, 100).map((stock, idx) => (
                        <tr key={idx} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900">{stock.Ticker}</td>
                          <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{stock.Name}</td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {stock['Industry Sector']}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {stock.Region === "Indonesia" ? `Rp${stock.Price?.toLocaleString()}` : `$${stock.Price?.toFixed(2)}`}
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
                            <span className={`font-semibold ${stock['Company YTD Return'] > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {stock['Company YTD Return'] > 0 ? '+' : ''}{stock['Company YTD Return']?.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-lg font-bold text-${stock.rating.color}-700`}>{stock.score}</span>
                              <span className={`text-xs px-2 py-0.5 rounded bg-${stock.rating.color}-50 text-${stock.rating.color}-700 font-medium`}>
                                {stock.rating.rating}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedStock(stock);
                                setActiveView('analysis');
                              }}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs hover:underline"
                            >
                              Analyze →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                    <div className="text-xs text-blue-600 uppercase font-semibold mb-1">Showing</div>
                    <div className="text-2xl font-bold text-blue-900">{Math.min(filteredStocks.length, 100)}</div>
                    <div className="text-xs text-blue-600 mt-1">of {filteredStocks.length}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 border-2 border-emerald-200">
                    <div className="text-xs text-emerald-600 uppercase font-semibold mb-1">Avg Score</div>
                    <div className="text-2xl font-bold text-emerald-900">
                      {(filteredStocks.reduce((sum, s) => sum + s.score, 0) / filteredStocks.length || 0).toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                    <div className="text-xs text-purple-600 uppercase font-semibold mb-1">Strong Buy</div>
                    <div className="text-2xl font-bold text-purple-900">
                      {filteredStocks.filter(s => s.score >= 80).length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ANALYSIS */}
            {activeView === 'analysis' && selectedStock && (
              <div className="space-y-6">
                <div className={`bg-${selectedStock.rating.color}-50 border-2 border-${selectedStock.rating.color}-200 rounded-xl p-6 shadow-lg`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900">{selectedStock.Ticker}</h3>
                      <p className="text-base text-slate-600 mt-1">{selectedStock.Name}</p>
                      <div className="flex gap-2 mt-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {selectedStock['Industry Sector']}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {selectedStock.Region}
                        </span>
                      </div>
                    </div>
                    <div className={`bg-${selectedStock.rating.color}-50 border-2 border-${selectedStock.rating.color}-200 rounded-xl p-5 text-center shadow-md`}>
                      <div className="text-xs text-slate-600 uppercase mb-1 font-semibold">NATAN Score</div>
                      <div className={`text-4xl font-bold text-${selectedStock.rating.color}-700`}>{selectedStock.score}</div>
                      <div className={`text-xs font-bold text-${selectedStock.rating.color}-700 mt-1`}>{selectedStock.rating.rating}</div>
                      <div className="text-xs text-slate-500 mt-1">{'⭐'.repeat(selectedStock.rating.stars)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[
                      { label: 'Current Price', value: selectedStock.Region === "Indonesia" ? `Rp${selectedStock.Price?.toLocaleString()}` : `$${selectedStock.Price?.toFixed(2)}` },
                      { label: 'YTD Return', value: `${selectedStock['Company YTD Return'] > 0 ? '+' : ''}${selectedStock['Company YTD Return']?.toFixed(2)}%`, className: selectedStock['Company YTD Return'] > 0 ? 'text-emerald-600' : 'text-red-600' },
                      { label: 'Market Cap', value: `$${(selectedStock['Market Cap'] / 1000000000)?.toFixed(1)}B` },
                      { label: 'P/E Ratio', value: selectedStock.PE ? `${selectedStock.PE?.toFixed(1)}x` : 'N/A' }
                    ].map((metric, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200">
                        <div className="text-xs text-slate-600 mb-1">{metric.label}</div>
                        <div className={`text-xl font-bold ${metric.className || 'text-slate-900'}`}>{metric.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-lg">
                  <h4 className="font-bold text-slate-900 mb-4 text-lg">Fundamental Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'P/E Ratio', value: selectedStock.PE, format: 'x' },
                      { label: 'P/B Ratio', value: selectedStock.PB, format: 'x' },
                      { label: 'ROE', value: selectedStock.ROE, format: '%' },
                      { label: 'Beta', value: selectedStock.Beta, format: '' },
                      { label: 'D/E Ratio', value: selectedStock.DE, format: '%' },
                      { label: 'Alpha', value: selectedStock.Alpha, format: '' },
                      { label: 'EPS Growth', value: selectedStock['EPS Growth'], format: '%' },
                      { label: 'Rev Growth', value: selectedStock['Revenue Growth'], format: '%' }
                    ].map((metric, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="text-xs text-slate-600 mb-1 font-medium">{metric.label}</div>
                        <div className="text-lg font-bold text-slate-900">
                          {metric.value ? `${metric.value.toFixed(2)}${metric.format}` : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('screener')}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  ← Back to Screener
                </button>
              </div>
            )}

            {activeView === 'analysis' && !selectedStock && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No stock selected for analysis.</p>
                <button
                  onClick={() => setActiveView('screener')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                >
                  Go to Screener
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
