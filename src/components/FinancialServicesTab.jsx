// ============================================================================
// NATAN EQUITY RESEARCH - FINANCIAL SERVICES VALUATION TAB
// Comprehensive valuation for Banks, Insurance, Asset Management, Securities
// Based on: Damodaran, Rosenbaum & Pearl, CFA Level II
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Building2, TrendingUp, TrendingDown, DollarSign, Shield, Activity,
  BarChart3, PieChart, Target, AlertCircle, CheckCircle, Info,
  ChevronDown, ChevronUp, Calculator, Award, Briefcase, Umbrella,
  Landmark, CreditCard, LineChart, Layers, ExternalLink
} from 'lucide-react';

import {
  calculateFinancialServicesValuation,
  detectFIGType,
  FIG_ASSUMPTIONS
} from '../utils/financialServicesValuation';

import {
  ALL_INDONESIAN_FIG,
  DATA_AS_OF,
  DATA_SOURCES
} from '../data/indonesiaFIGData';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const FIGTypeIcon = ({ type }) => {
  const icons = {
    'BANK': Landmark,
    'LIFE_INSURANCE': Umbrella,
    'PC_INSURANCE': Shield,
    'CONSUMER_FINANCE': CreditCard,
    'ASSET_MANAGEMENT': LineChart,
    'INVESTMENT_BANK': Briefcase,
    'DIVERSIFIED': Layers
  };
  const Icon = icons[type] || Building2;
  return <Icon className="w-5 h-5" />;
};

const MetricCard = ({ label, value, suffix = '', trend, subtext, color, darkMode }) => (
  <div className={`rounded-lg p-4 border transition-all ${
    darkMode
      ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
      : 'bg-white border-slate-200 hover:shadow-md'
  }`}>
    <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
      {label}
    </div>
    <div className={`text-xl font-bold flex items-center gap-2 ${
      color ? `text-${color}-500` : (darkMode ? 'text-white' : 'text-slate-900')
    }`}>
      {value}{suffix}
      {trend !== undefined && (
        <span className={`text-sm ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </span>
      )}
    </div>
    {subtext && (
      <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {subtext}
      </div>
    )}
  </div>
);

const ValuationCard = ({ model, result, darkMode }) => {
  const [expanded, setExpanded] = useState(false);

  if (!result) return null;

  const fairValue = result.intrinsicValue || result.fairPrice || result.weightedValue || 0;
  const upside = result.upside || 0;

  return (
    <div className={`rounded-xl border overflow-hidden ${
      darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'
    }`}>
      <div
        className="p-4 cursor-pointer hover:bg-opacity-80 transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {model}
            </div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {result.isValueCreator !== undefined && (
                result.isValueCreator ? 'Value Creator' : 'Value Destroyer'
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              IDR {fairValue.toLocaleString()}
            </div>
            <div className={`text-sm font-semibold ${upside >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
            </div>
          </div>
          <div className="ml-4">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className={`p-4 border-t ${darkMode ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(result).map(([key, value]) => {
              if (['model', 'recommendation'].includes(key)) return null;
              if (typeof value === 'object') return null;
              if (typeof value === 'boolean') {
                return (
                  <div key={key}>
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:
                    </span>
                    <span className={`ml-2 font-semibold ${value ? 'text-emerald-500' : 'text-red-500'}`}>
                      {value ? 'Yes' : 'No'}
                    </span>
                  </div>
                );
              }
              return (
                <div key={key}>
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:
                  </span>
                  <span className={`ml-2 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {typeof value === 'number' ? value.toLocaleString() : String(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ScoreBar = ({ score, max, label, darkMode }) => {
  const percentage = (score / max) * 100;
  const getColor = () => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{label}</span>
        <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
          {score}/{max}
        </span>
      </div>
      <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
        <div
          className={`h-full rounded-full ${getColor()} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FinancialServicesTab({ darkMode = false }) {
  const [selectedFirm, setSelectedFirm] = useState(ALL_INDONESIAN_FIG[0]);
  const [filterType, setFilterType] = useState('all');
  const [showMethodology, setShowMethodology] = useState(false);
  const [showSources, setShowSources] = useState(false);

  // Filter firms by type
  const filteredFirms = useMemo(() => {
    if (filterType === 'all') return ALL_INDONESIAN_FIG;
    return ALL_INDONESIAN_FIG.filter(f => f.figType === filterType);
  }, [filterType]);

  // Calculate valuation for selected firm
  const valuation = useMemo(() => {
    return calculateFinancialServicesValuation(selectedFirm, 'Indonesia');
  }, [selectedFirm]);

  // Theme classes
  const theme = {
    bg: darkMode ? 'bg-slate-800' : 'bg-white',
    border: darkMode ? 'border-slate-700' : 'border-slate-200',
    text: darkMode ? 'text-white' : 'text-slate-900',
    textSecondary: darkMode ? 'text-slate-300' : 'text-slate-600',
    textMuted: darkMode ? 'text-slate-400' : 'text-slate-500',
    card: darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200',
    section: darkMode ? 'bg-slate-700/30' : 'bg-slate-50'
  };

  // Get type-specific metrics to display
  // Only show metrics that are actually available in the data
  const getTypeMetrics = () => {
    const metrics = [];

    switch (selectedFirm.figType) {
      case 'BANK':
        // Banks (listed) have full disclosure
        if (selectedFirm.roe !== undefined) metrics.push({ label: 'ROE', value: selectedFirm.roe, suffix: '%' });
        if (selectedFirm.nim !== undefined) metrics.push({ label: 'NIM', value: selectedFirm.nim, suffix: '%' });
        if (selectedFirm.nplRatio !== undefined) metrics.push({ label: 'NPL (Gross)', value: selectedFirm.nplRatio, suffix: '%' });
        if (selectedFirm.car !== undefined) metrics.push({ label: 'CAR', value: selectedFirm.car, suffix: '%' });
        if (selectedFirm.ldr !== undefined) metrics.push({ label: 'LDR', value: selectedFirm.ldr, suffix: '%' });
        if (selectedFirm.casaRatio !== undefined) metrics.push({ label: 'CASA', value: selectedFirm.casaRatio, suffix: '%' });
        break;

      case 'LIFE_INSURANCE':
        // Private insurers only have limited OJK data
        if (selectedFirm.totalAssets !== undefined) metrics.push({ label: 'Total Assets', value: (selectedFirm.totalAssets / 1000).toFixed(1), suffix: 'T IDR' });
        if (selectedFirm.premiumIncome !== undefined) metrics.push({ label: 'Premium Income', value: (selectedFirm.premiumIncome / 1000).toFixed(1), suffix: 'T IDR' });
        if (selectedFirm.assetGrowth !== undefined) metrics.push({ label: 'Asset Growth', value: selectedFirm.assetGrowth, suffix: '% YoY' });
        if (selectedFirm.premiumGrowth !== undefined) metrics.push({ label: 'Premium Growth', value: selectedFirm.premiumGrowth, suffix: '% YoY' });
        // Only show these if actually disclosed (listed companies)
        if (selectedFirm.isListed && selectedFirm.roe !== undefined) metrics.push({ label: 'ROE', value: selectedFirm.roe, suffix: '%' });
        if (selectedFirm.isListed && selectedFirm.pb !== undefined) metrics.push({ label: 'P/B', value: selectedFirm.pb, suffix: 'x' });
        break;

      case 'PC_INSURANCE':
        if (selectedFirm.roe !== undefined) metrics.push({ label: 'ROE', value: selectedFirm.roe, suffix: '%' });
        if (selectedFirm.pb !== undefined) metrics.push({ label: 'P/B', value: selectedFirm.pb, suffix: 'x' });
        if (selectedFirm.pe !== undefined) metrics.push({ label: 'P/E', value: selectedFirm.pe, suffix: 'x' });
        if (selectedFirm.dividendYield !== undefined) metrics.push({ label: 'Div Yield', value: selectedFirm.dividendYield, suffix: '%' });
        break;

      case 'CONSUMER_FINANCE':
        if (selectedFirm.roe !== undefined) metrics.push({ label: 'ROE', value: selectedFirm.roe, suffix: '%' });
        if (selectedFirm.nim !== undefined) metrics.push({ label: 'NIM', value: selectedFirm.nim, suffix: '%' });
        if (selectedFirm.nplRatio !== undefined) metrics.push({ label: 'NPL', value: selectedFirm.nplRatio, suffix: '%' });
        if (selectedFirm.gearingRatio !== undefined) metrics.push({ label: 'Gearing', value: selectedFirm.gearingRatio, suffix: 'x' });
        if (selectedFirm.pb !== undefined) metrics.push({ label: 'P/B', value: selectedFirm.pb, suffix: 'x' });
        if (selectedFirm.pe !== undefined) metrics.push({ label: 'P/E', value: selectedFirm.pe, suffix: 'x' });
        break;

      case 'ASSET_MANAGEMENT':
        // AUM is the main disclosed metric for asset managers
        if (selectedFirm.aum !== undefined) metrics.push({ label: 'AUM', value: (selectedFirm.aum / 1000).toFixed(1), suffix: 'T IDR' });
        if (selectedFirm.marketShare !== undefined) metrics.push({ label: 'Market Share', value: selectedFirm.marketShare, suffix: '%' });
        if (selectedFirm.aumGrowthYTD !== undefined) metrics.push({ label: 'AUM Growth YTD', value: selectedFirm.aumGrowthYTD, suffix: '%' });
        if (selectedFirm.aumGrowthYoY !== undefined) metrics.push({ label: 'AUM Growth YoY', value: selectedFirm.aumGrowthYoY, suffix: '%' });
        if (selectedFirm.shariahAum !== undefined) metrics.push({ label: 'Sharia AUM', value: (selectedFirm.shariahAum / 1000).toFixed(2), suffix: 'T IDR' });
        break;

      case 'INVESTMENT_BANK':
        if (selectedFirm.roe !== undefined) metrics.push({ label: 'ROE', value: selectedFirm.roe, suffix: '%' });
        if (selectedFirm.pb !== undefined) metrics.push({ label: 'P/B', value: selectedFirm.pb, suffix: 'x' });
        if (selectedFirm.pe !== undefined) metrics.push({ label: 'P/E', value: selectedFirm.pe, suffix: 'x' });
        if (selectedFirm.dividendYield !== undefined) metrics.push({ label: 'Div Yield', value: selectedFirm.dividendYield, suffix: '%' });
        break;

      default:
        if (selectedFirm.roe !== undefined) metrics.push({ label: 'ROE', value: selectedFirm.roe, suffix: '%' });
        if (selectedFirm.pb !== undefined) metrics.push({ label: 'P/B', value: selectedFirm.pb, suffix: 'x' });
        if (selectedFirm.pe !== undefined) metrics.push({ label: 'P/E', value: selectedFirm.pe, suffix: 'x' });
    }

    return metrics;
  };

  const getFIGTypeName = (type) => {
    const names = {
      'BANK': 'Commercial Bank',
      'LIFE_INSURANCE': 'Life Insurance',
      'PC_INSURANCE': 'P&C Insurance',
      'CONSUMER_FINANCE': 'Consumer Finance',
      'ASSET_MANAGEMENT': 'Asset Management',
      'INVESTMENT_BANK': 'Securities',
      'DIVERSIFIED': 'Diversified'
    };
    return names[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${theme.text}`}>
            <Building2 className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
            Financial Services Valuation
          </h2>
          <p className={`text-sm ${theme.textSecondary}`}>
            Banks, Insurance, Asset Management, Securities | Damodaran Methodology
          </p>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>
            Data as of: {DATA_AS_OF}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              const filtered = e.target.value === 'all'
                ? ALL_INDONESIAN_FIG
                : ALL_INDONESIAN_FIG.filter(f => f.figType === e.target.value);
              if (filtered.length > 0) setSelectedFirm(filtered[0]);
            }}
            className={`px-3 py-2 rounded-lg border text-sm ${
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="all">All Types ({ALL_INDONESIAN_FIG.length})</option>
            <option value="BANK">Banks ({ALL_INDONESIAN_FIG.filter(f => f.figType === 'BANK').length})</option>
            <option value="LIFE_INSURANCE">Life Insurance ({ALL_INDONESIAN_FIG.filter(f => f.figType === 'LIFE_INSURANCE').length})</option>
            <option value="PC_INSURANCE">P&C Insurance ({ALL_INDONESIAN_FIG.filter(f => f.figType === 'PC_INSURANCE').length})</option>
            <option value="CONSUMER_FINANCE">Consumer Finance ({ALL_INDONESIAN_FIG.filter(f => f.figType === 'CONSUMER_FINANCE').length})</option>
            <option value="ASSET_MANAGEMENT">Asset Management ({ALL_INDONESIAN_FIG.filter(f => f.figType === 'ASSET_MANAGEMENT').length})</option>
            <option value="INVESTMENT_BANK">Securities ({ALL_INDONESIAN_FIG.filter(f => f.figType === 'INVESTMENT_BANK').length})</option>
          </select>

          <select
            value={selectedFirm.ticker}
            onChange={(e) => setSelectedFirm(ALL_INDONESIAN_FIG.find(f => f.ticker === e.target.value))}
            className={`px-3 py-2 rounded-lg border text-sm min-w-[200px] ${
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            {filteredFirms.map(firm => (
              <option key={firm.ticker} value={firm.ticker}>
                {firm.ticker} - {firm.name} {firm.isListed === false ? '(Private)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Firm Summary Card */}
      <div className={`rounded-xl p-6 border-2 ${
        darkMode
          ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700/50'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <FIGTypeIcon type={selectedFirm.figType} />
              <span className={`text-2xl font-bold ${theme.text}`}>
                {selectedFirm.ticker}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {getFIGTypeName(selectedFirm.figType)}
              </span>
              {selectedFirm.isListed === false ? (
                <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                  Private Company
                </span>
              ) : selectedFirm.ytdReturn !== undefined && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedFirm.ytdReturn >= 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  YTD: {selectedFirm.ytdReturn >= 0 ? '+' : ''}{selectedFirm.ytdReturn}%
                </span>
              )}
            </div>
            <div className={`text-lg ${theme.textSecondary}`}>{selectedFirm.name}</div>
            <div className={`text-xs mt-1 ${theme.textMuted}`}>{selectedFirm.category}</div>
          </div>

          <div className="flex flex-wrap gap-6">
            {selectedFirm.isListed === false ? (
              <>
                <div className="text-center">
                  <div className={`text-sm ${theme.textMuted}`}>Total Assets</div>
                  <div className={`text-2xl font-bold ${theme.text}`}>
                    IDR {selectedFirm.totalAssets?.toLocaleString() || 'N/A'}B
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm ${theme.textMuted}`}>Equity</div>
                  <div className={`text-2xl font-bold ${theme.text}`}>
                    IDR {selectedFirm.totalEquity?.toLocaleString() || selectedFirm.adjustedNetWorth?.toLocaleString() || 'N/A'}B
                  </div>
                </div>
                {selectedFirm.embeddedValue && (
                  <div className="text-center">
                    <div className={`text-sm ${theme.textMuted}`}>Embedded Value</div>
                    <div className="text-2xl font-bold text-blue-500">
                      IDR {selectedFirm.embeddedValue?.toLocaleString()}B
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className={`text-sm ${theme.textMuted}`}>Current Price</div>
                  <div className={`text-2xl font-bold ${theme.text}`}>
                    IDR {selectedFirm.price?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm ${theme.textMuted}`}>Fair Value</div>
                  <div className="text-2xl font-bold text-blue-500">
                    IDR {valuation.fairValue?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm ${theme.textMuted}`}>Upside</div>
                  <div className={`text-2xl font-bold ${
                    (valuation.upside || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {(valuation.upside || 0) >= 0 ? '+' : ''}{valuation.upside || 0}%
                  </div>
                </div>
              </>
            )}
            <div className="text-center">
              <div className={`text-sm ${theme.textMuted}`}>Rating</div>
              <div className={`text-xl font-bold px-3 py-1 rounded-full ${
                valuation.recommendation?.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                valuation.recommendation?.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                valuation.recommendation?.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {valuation.recommendation?.rating || 'Hold'}
              </div>
            </div>
          </div>
        </div>

        {/* Source Attribution */}
        {selectedFirm.source && (
          <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-blue-700/30' : 'border-blue-200'}`}>
            <p className={`text-xs ${theme.textMuted}`}>
              <strong>Source:</strong>{' '}
              {selectedFirm.sourceUrl ? (
                <a
                  href={selectedFirm.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {selectedFirm.source} ↗
                </a>
              ) : (
                selectedFirm.source
              )}
            </p>
            {/* Data availability notice for private companies */}
            {selectedFirm.isListed === false && selectedFirm.dataAvailability && (
              <div className={`mt-2 p-2 rounded text-xs ${darkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
                <strong>⚠️ Limited Disclosure:</strong> As a private company, only OJK-reported data is available.
                {!selectedFirm.dataAvailability.equity && ' Equity, '}
                {!selectedFirm.dataAvailability.roe && ' ROE, '}
                {!selectedFirm.dataAvailability.rbc && ' RBC ratio, '}
                {!selectedFirm.dataAvailability.embeddedValue && ' Embedded Value, '}
                {!selectedFirm.dataAvailability.vnb && ' VNB '}
                are not publicly disclosed.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Type-Specific Metrics */}
      <div>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
          <Activity className="w-5 h-5" />
          Key Metrics ({getFIGTypeName(selectedFirm.figType)})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {getTypeMetrics().map((metric, i) => (
            <MetricCard
              key={i}
              label={metric.label}
              value={metric.value}
              suffix={metric.suffix}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>

      {/* Valuation Models */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${theme.text}`}>
            <Calculator className="w-5 h-5" />
            Valuation Models
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className={`text-sm flex items-center gap-1 px-3 py-1 rounded ${
                darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              } hover:opacity-80`}
            >
              <Info className="w-4 h-4" />
              {showMethodology ? 'Hide' : 'Show'} Methodology
            </button>
            <button
              onClick={() => setShowSources(!showSources)}
              className={`text-sm flex items-center gap-1 px-3 py-1 rounded ${
                darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              } hover:opacity-80`}
            >
              <ExternalLink className="w-4 h-4" />
              Data Sources
            </button>
          </div>
        </div>

        {showMethodology && (
          <div className={`rounded-lg p-4 mb-4 border ${theme.section} ${theme.border}`}>
            <div className={`text-sm space-y-2 ${theme.textSecondary}`}>
              <p><strong className={theme.text}>Banks:</strong> Residual Income Model + Gordon Growth P/B. Value = Book Value + PV of Excess Returns (ROE - Cost of Equity). Source: Damodaran (NYU Stern).</p>
              <p><strong className={theme.text}>Life Insurance:</strong> Embedded Value (EV) + Appraisal Value. EV = Adjusted Net Worth + Value of In-Force Business. Source: EEV Principles (CFO Forum).</p>
              <p><strong className={theme.text}>P&C Insurance:</strong> P/B adjusted for Combined Ratio. CR &lt; 95% = underwriting premium, CR &gt; 100% = discount.</p>
              <p><strong className={theme.text}>Consumer Finance:</strong> Modified P/B with NPL adjustment + DDM component. Higher yields but higher risk.</p>
              <p><strong className={theme.text}>Asset Management:</strong> AUM Multiple (typically 2%) + Fee Revenue Multiple + P/E.</p>
              <p><strong className={theme.text}>Securities:</strong> Revenue Multiple + P/B (60/40 weight). Volatile earnings require revenue-based approach.</p>
            </div>
          </div>
        )}

        {showSources && (
          <div className={`rounded-lg p-4 mb-4 border ${theme.section} ${theme.border}`}>
            <div className={`text-sm ${theme.textSecondary}`}>
              <p className={`font-bold mb-2 ${theme.text}`}>Data Sources:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Price Data:</p>
                  <ul className="list-disc list-inside text-xs">
                    {DATA_SOURCES.priceData.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Bank Financials:</p>
                  <ul className="list-disc list-inside text-xs">
                    {DATA_SOURCES.bankFinancials.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Insurance Data:</p>
                  <ul className="list-disc list-inside text-xs">
                    {DATA_SOURCES.insuranceData.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-medium">News & Analysis:</p>
                  <ul className="list-disc list-inside text-xs">
                    {DATA_SOURCES.newsAndAnalysis.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {valuation.valuations && Object.entries(valuation.valuations).map(([key, result]) => (
            <ValuationCard
              key={key}
              model={result?.model || key}
              result={result}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>

      {/* Quality Score & Value Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Score */}
        <div className={`rounded-xl p-6 border ${theme.card}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
            <Award className="w-5 h-5" />
            Quality Score
            <span className={`ml-auto text-2xl font-bold ${
              valuation.qualityScore?.rating?.color === 'emerald' ? 'text-emerald-500' :
              valuation.qualityScore?.rating?.color === 'blue' ? 'text-blue-500' :
              valuation.qualityScore?.rating?.color === 'amber' ? 'text-amber-500' :
              'text-red-500'
            }`}>
              {valuation.qualityScore?.total || 0}/100
            </span>
          </h3>

          {valuation.qualityScore?.breakdown && (
            <div>
              {Object.entries(valuation.qualityScore.breakdown).map(([key, value]) => {
                const maxScores = {
                  profitability: 30, assetQuality: 25, capitalStrength: 20,
                  liquidity: 15, growth: 10, underwriting: 25, solvency: 25,
                  efficiency: 10, aumScale: 25, performance: 25, flows: 20,
                  diversification: 10
                };
                return (
                  <ScoreBar
                    key={key}
                    score={value}
                    max={maxScores[key] || 25}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    darkMode={darkMode}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Value Creation Analysis */}
        <div className={`rounded-xl p-6 border ${theme.card}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
            <Target className="w-5 h-5" />
            Value Creation Analysis
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-sm ${theme.textMuted}`}>ROE</div>
              <div className={`text-2xl font-bold ${theme.text}`}>
                {selectedFirm.roe || 0}%
              </div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${theme.textMuted}`}>vs</div>
              <div className={`text-lg font-bold ${theme.textSecondary}`}>-</div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${theme.textMuted}`}>Cost of Equity</div>
              <div className={`text-2xl font-bold ${theme.text}`}>
                {valuation.costOfEquity?.costOfEquity || 0}%
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg text-center ${
            (selectedFirm.roe || 0) > (valuation.costOfEquity?.costOfEquity || 15)
              ? (darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50')
              : (darkMode ? 'bg-red-900/30' : 'bg-red-50')
          }`}>
            <div className={`text-3xl font-bold ${
              (selectedFirm.roe || 0) > (valuation.costOfEquity?.costOfEquity || 15)
                ? 'text-emerald-500'
                : 'text-red-500'
            }`}>
              {((selectedFirm.roe || 0) - (valuation.costOfEquity?.costOfEquity || 15)).toFixed(1)}%
            </div>
            <div className={`text-sm ${theme.textSecondary}`}>
              {(selectedFirm.roe || 0) > (valuation.costOfEquity?.costOfEquity || 15)
                ? 'Value Creator - justifies P/B premium'
                : 'Value Destroyer - P/B discount warranted'}
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-lg ${theme.section}`}>
            <p className={`text-xs ${theme.textMuted}`}>
              <strong>Damodaran Insight:</strong> Fair P/B = (ROE - g) / (Ke - g).
              If ROE {'>'} Cost of Equity, the firm creates shareholder value and deserves P/B {'>'} 1.0x.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className={`rounded-xl border overflow-hidden ${theme.card}`}>
        <div className={`p-4 border-b ${theme.border}`}>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${theme.text}`}>
            <BarChart3 className="w-5 h-5" />
            {filterType === 'all' ? 'All Financial Services' : getFIGTypeName(filterType)} Comparison
            <span className={`ml-2 text-sm font-normal ${theme.textMuted}`}>
              ({filteredFirms.length} companies)
            </span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${theme.text}`}>
            <thead className={darkMode ? 'bg-slate-700' : 'bg-slate-100'}>
              <tr>
                <th className="text-left px-4 py-3">Firm</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">P/B</th>
                <th className="text-right px-4 py-3">P/E</th>
                <th className="text-right px-4 py-3">ROE</th>
                <th className="text-right px-4 py-3">Div Yield</th>
                <th className="text-right px-4 py-3">Fair Value</th>
                <th className="text-right px-4 py-3">Upside</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme.border}`}>
              {filteredFirms.map(firm => {
                const firmVal = calculateFinancialServicesValuation(firm, 'Indonesia');
                return (
                  <tr
                    key={firm.ticker}
                    className={`cursor-pointer transition-colors ${
                      firm.ticker === selectedFirm.ticker
                        ? darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                        : darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedFirm(firm)}
                  >
                    <td className="px-4 py-3 font-medium">
                      {firm.ticker.replace(' (Unlisted)', '')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        darkMode ? 'bg-slate-600' : 'bg-slate-100'
                      }`}>
                        {getFIGTypeName(firm.figType).slice(0, 8)}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3">
                      {firm.price?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="text-right px-4 py-3">{firm.pb}x</td>
                    <td className="text-right px-4 py-3">
                      {firm.pe?.toFixed(1) || '-'}x
                    </td>
                    <td className="text-right px-4 py-3">{firm.roe}%</td>
                    <td className="text-right px-4 py-3">
                      {firm.dividendYield || '-'}%
                    </td>
                    <td className="text-right px-4 py-3 font-medium">
                      {firmVal.fairValue?.toLocaleString() || 'N/A'}
                    </td>
                    <td className={`text-right px-4 py-3 font-bold ${
                      (firmVal.upside || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {(firmVal.upside || 0) >= 0 ? '+' : ''}{firmVal.upside || 0}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Note */}
      <div className={`rounded-lg p-4 border ${theme.section} ${theme.border}`}>
        <p className={`text-sm ${theme.textSecondary}`}>
          <strong className={theme.text}>Methodology:</strong> Financial services valuation uses
          equity-based models per Damodaran (NYU Stern). Traditional EV/EBITDA is not applicable
          because debt is the raw material for banks/insurers, not financing. Life insurance uses
          Embedded Value (EEV Principles), P&C uses Combined Ratio-adjusted P/B, Asset Managers
          use AUM multiples. Indonesian regulatory requirements per OJK and BASEL III.
          Cost of Equity: Rf ({FIG_ASSUMPTIONS.Indonesia.riskFreeRate}%) + Beta × (ERP {FIG_ASSUMPTIONS.Indonesia.equityRiskPremium}% + CRP {FIG_ASSUMPTIONS.Indonesia.countryRiskPremium}%).
        </p>
      </div>
    </div>
  );
}
