// ============================================================================
// FINANCIAL STATEMENTS VIEWER - Professional IB-Style Design
// Income Statement, Balance Sheet, Cash Flow with Historical Comparison
// Data Source: SEC EDGAR (US stocks) - Free, Official, No API Key Required
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  BarChart3,
  PieChart,
  Activity,
  Building2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Globe,
  Shield,
} from 'lucide-react';

import {
  fetchIncomeStatement,
  fetchBalanceSheet,
  fetchCashFlowStatement,
  fetchFinancialRatios,
  INCOME_STATEMENT_ITEMS,
  BALANCE_SHEET_ITEMS,
  CASH_FLOW_ITEMS,
  formatFinancialNumber,
  formatPercent,
  calculateGrowth,
} from '../services/financialStatements';

// ============================================================================
// FINANCIAL TABLE COMPONENT
// ============================================================================

const FinancialTable = ({
  items,
  statements,
  currency,
  showGrowth,
  showCommonSize,
  commonSizeBase,
  darkMode,
  expandedSections,
  toggleSection,
}) => {
  // Calculate common size percentages
  const getCommonSizePercent = (value, statement) => {
    if (!showCommonSize || !value || !statement) return null;
    const base = statement[commonSizeBase];
    if (!base || base === 0) return null;
    return (value / base) * 100;
  };

  // Calculate YoY growth
  const getGrowth = (currentStmt, prevStmt, key) => {
    if (!showGrowth || !currentStmt || !prevStmt) return null;
    return calculateGrowth(currentStmt[key], prevStmt[key]);
  };

  // Group items by section if they have section property
  const sections = useMemo(() => {
    const grouped = {};
    items.forEach(item => {
      const section = item.section || 'main';
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(item);
    });
    return grouped;
  }, [items]);

  const renderValue = (value, isPercent, isShares) => {
    if (value === null || value === undefined) {
      return <span className={darkMode ? 'text-slate-600' : 'text-slate-400'}>—</span>;
    }

    if (isPercent) {
      return formatPercent(value);
    }

    if (isShares) {
      return formatFinancialNumber(value, '', true).replace('$', '');
    }

    return formatFinancialNumber(value, currency, true);
  };

  const renderGrowthBadge = (growth) => {
    if (growth === null || growth === undefined) return null;

    const isPositive = growth >= 0;
    const absGrowth = Math.abs(growth);

    return (
      <span className={`inline-flex items-center text-xs font-medium ml-2 ${
        isPositive ? 'text-emerald-500' : 'text-red-500'
      }`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {absGrowth.toFixed(1)}%
      </span>
    );
  };

  const renderRow = (item, index) => {
    const isExpandable = item.section && toggleSection;
    const isExpanded = !expandedSections || expandedSections[item.section] !== false;

    return (
      <tr
        key={item.key}
        className={`
          ${item.isTotal ? (darkMode ? 'bg-slate-700/50' : 'bg-slate-100') : ''}
          ${item.isSubtotal ? (darkMode ? 'bg-slate-800/30' : 'bg-slate-50') : ''}
          ${item.isHeader ? 'border-t-2 ' + (darkMode ? 'border-slate-600' : 'border-slate-300') : ''}
          ${darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}
          transition-colors
        `}
      >
        {/* Line Item Label */}
        <td className={`
          py-2 px-4 text-sm whitespace-nowrap sticky left-0 z-10
          ${darkMode ? 'bg-slate-800' : 'bg-white'}
          ${item.isTotal || item.isSubtotal ? 'font-semibold' : 'font-normal'}
          ${item.isTotal ? (darkMode ? 'text-white' : 'text-slate-900') : (darkMode ? 'text-slate-300' : 'text-slate-700')}
          ${!item.isTotal && !item.isSubtotal && !item.isHeader ? 'pl-6' : ''}
        `}>
          {isExpandable && item.isSubtotal ? (
            <button
              onClick={() => toggleSection(item.section)}
              className="flex items-center gap-1"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {item.label}
            </button>
          ) : (
            item.label
          )}
        </td>

        {/* Values for each period */}
        {statements.map((stmt, stmtIndex) => {
          const value = stmt[item.key];
          const prevStmt = statements[stmtIndex + 1];
          const growth = getGrowth(stmt, prevStmt, item.key);
          const commonSize = getCommonSizePercent(value, stmt);

          return (
            <td
              key={stmt.date || stmtIndex}
              className={`
                py-2 px-4 text-sm text-right whitespace-nowrap
                ${item.isTotal || item.isSubtotal ? 'font-semibold' : 'font-normal'}
                ${value < 0 ? 'text-red-500' : (darkMode ? 'text-slate-200' : 'text-slate-800')}
              `}
            >
              <div className="flex flex-col items-end">
                <span>{renderValue(value, item.isPercent, item.isShares)}</span>
                {showGrowth && growth !== null && !item.isPercent && (
                  renderGrowthBadge(growth)
                )}
                {showCommonSize && commonSize !== null && !item.isPercent && (
                  <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {commonSize.toFixed(1)}%
                  </span>
                )}
              </div>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className={darkMode ? 'bg-slate-900' : 'bg-slate-100'}>
            <th className={`
              py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 z-10
              ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}
            `}>
              Line Item
            </th>
            {statements.map((stmt, idx) => (
              <th
                key={stmt.date || idx}
                className={`py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                <div className="flex flex-col items-end">
                  <span>{stmt.fiscalYear || new Date(stmt.date).getFullYear()}</span>
                  <span className={`font-normal ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {stmt.period === 'FY' ? 'Annual' : stmt.period}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-slate-200'}`}>
          {items.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// KEY METRICS CARD
// ============================================================================

const KeyMetricsCard = ({ ratios, darkMode }) => {
  if (!ratios || ratios.length === 0) return null;

  const latestRatios = ratios[0];

  const metrics = [
    { label: 'Gross Margin', value: latestRatios.grossProfitMargin, isPercent: true, icon: PieChart },
    { label: 'Operating Margin', value: latestRatios.operatingProfitMargin, isPercent: true, icon: BarChart3 },
    { label: 'Net Margin', value: latestRatios.netProfitMargin, isPercent: true, icon: TrendingUp },
    { label: 'ROE', value: latestRatios.returnOnEquity, isPercent: true, icon: Activity },
    { label: 'ROA', value: latestRatios.returnOnAssets, isPercent: true, icon: Building2 },
    { label: 'Current Ratio', value: latestRatios.currentRatio, isPercent: false, icon: Wallet },
    { label: 'D/E Ratio', value: latestRatios.debtEquityRatio, isPercent: false, icon: DollarSign },
    { label: 'Debt Ratio', value: latestRatios.debtRatio, isPercent: true, icon: TrendingDown },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {metrics.map(({ label, value, isPercent, icon: Icon }) => (
        <div
          key={label}
          className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'} border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
          </div>
          <div className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {value !== null && value !== undefined
              ? isPercent
                ? `${(value * 100).toFixed(1)}%`
                : value.toFixed(2)
              : '—'
            }
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// NOT SUPPORTED / NOT FOUND MESSAGE
// ============================================================================

const NotSupportedMessage = ({ stock, darkMode, isIndonesian, errorMessage }) => {
  if (isIndonesian) {
    // Format large numbers in IDR
    const formatIDR = (value) => {
      if (value === null || value === undefined) return '—';
      const absValue = Math.abs(value);
      if (absValue >= 1e12) return `Rp ${(value / 1e12).toFixed(1)}T`;
      if (absValue >= 1e9) return `Rp ${(value / 1e9).toFixed(1)}B`;
      if (absValue >= 1e6) return `Rp ${(value / 1e6).toFixed(1)}M`;
      return `Rp ${value.toLocaleString()}`;
    };

    const formatPercent = (value) => {
      if (value === null || value === undefined) return '—';
      return `${value.toFixed(1)}%`;
    };

    const formatRatio = (value) => {
      if (value === null || value === undefined) return '—';
      return value.toFixed(2);
    };

    // Extract metrics from stock object
    const incomeMetrics = [
      { label: 'Revenue', value: formatIDR(stock?.Revenue) },
      { label: 'Revenue Growth', value: formatPercent(stock?.['Revenue Growth']) },
      { label: 'Net Income', value: formatIDR(stock?.['Net Income']) },
      { label: 'Net Income Growth', value: formatPercent(stock?.['Net Income Growth']) },
      { label: 'EBITDA', value: formatIDR(stock?.EBITDA) },
      { label: 'EPS Growth', value: formatPercent(stock?.['EPS Growth']) },
    ];

    const marginMetrics = [
      { label: 'Gross Margin', value: formatPercent(stock?.['Gross Margin']) },
      { label: 'EBITDA Margin', value: formatPercent(stock?.['EBITDA Margin']) },
      { label: 'ROE', value: formatPercent(stock?.ROE) },
      { label: 'FCF Conversion', value: formatRatio(stock?.['FCF Conversion']) },
    ];

    const balanceMetrics = [
      { label: 'Market Cap', value: formatIDR(stock?.['Market Cap']) },
      { label: 'P/E Ratio', value: formatRatio(stock?.PE) },
      { label: 'P/B Ratio', value: formatRatio(stock?.PB) },
      { label: 'D/E Ratio', value: formatRatio(stock?.DE) },
      { label: 'Current Ratio', value: formatRatio(stock?.['Cur Ratio']) },
      { label: 'Quick Ratio', value: formatRatio(stock?.['Quick Ratio']) },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-amber-50 border-amber-200'} border`}>
          <div className="flex items-center gap-3 mb-2">
            <Globe className={`w-6 h-6 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
              Indonesian Stock - IDX Data
            </h3>
          </div>
          <p className={`text-sm ${darkMode ? 'text-amber-200/70' : 'text-amber-700'}`}>
            Full financial statements are not available for Indonesian stocks. Below are the key metrics from IDX filings.
          </p>
        </div>

        {/* Income & Growth Metrics */}
        <div className={`rounded-xl p-5 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} border`}>
          <h4 className={`text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <TrendingUp className="w-4 h-4" />
            Income & Growth
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {incomeMetrics.map(({ label, value }) => (
              <div key={label}>
                <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
                <div className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Profitability Metrics */}
        <div className={`rounded-xl p-5 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} border`}>
          <h4 className={`text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <PieChart className="w-4 h-4" />
            Profitability & Efficiency
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {marginMetrics.map(({ label, value }) => (
              <div key={label}>
                <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
                <div className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Valuation & Balance Sheet */}
        <div className={`rounded-xl p-5 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} border`}>
          <h4 className={`text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <Building2 className="w-4 h-4" />
            Valuation & Balance Sheet
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {balanceMetrics.map(({ label, value }) => (
              <div key={label}>
                <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
                <div className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Source Footer */}
        <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Data from BPS Statistics Indonesia, Bank Indonesia, IDX</span>
          </div>
          <span>Currency: IDR</span>
        </div>
      </div>
    );
  }

  // US stock not found message
  return (
    <div className={`rounded-xl p-8 text-center ${darkMode ? 'bg-slate-800/50' : 'bg-blue-50'} border ${darkMode ? 'border-slate-700' : 'border-blue-200'}`}>
      <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
      <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        Ticker Not Found in SEC Database
      </h3>
      <p className={`mb-4 max-w-lg mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {errorMessage || `The ticker "${stock?.ticker}" could not be found in the SEC EDGAR database.`}
      </p>
      <div className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'} max-w-md mx-auto`}>
        <p className="mb-2">This could happen because:</p>
        <ul className="list-disc list-inside text-left space-y-1">
          <li>The ticker symbol format differs from SEC records</li>
          <li>The company doesn't file with the SEC (foreign ADRs, OTC stocks)</li>
          <li>It's a newer listing not yet in the database</li>
        </ul>
        <p className="mt-4 text-xs">
          Try searching for the company on <a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">SEC EDGAR</a> to find the correct ticker.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN FINANCIAL STATEMENTS COMPONENT
// ============================================================================

const FinancialStatements = ({ stock, darkMode }) => {
  // State
  const [activeTab, setActiveTab] = useState('income');
  const [period, setPeriod] = useState('annual');
  const [showGrowth, setShowGrowth] = useState(true);
  const [showCommonSize, setShowCommonSize] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data state
  const [incomeData, setIncomeData] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [cashFlowData, setCashFlowData] = useState(null);
  const [ratiosData, setRatiosData] = useState(null);

  // Expanded sections for balance sheet
  const [expandedSections, setExpandedSections] = useState({
    assets: true,
    liabilities: true,
    equity: true,
    metrics: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch data when stock or period changes
  const fetchData = useCallback(async () => {
    if (!stock) return;

    setLoading(true);
    setError(null);

    const region = stock.region || stock.Region || 'US';
    const ticker = stock.ticker || stock.Ticker;

    try {
      // Fetch all data in parallel
      const [income, balance, cashFlow, ratios] = await Promise.all([
        fetchIncomeStatement(ticker, region, period, 5),
        fetchBalanceSheet(ticker, region, period, 5),
        fetchCashFlowStatement(ticker, region, period, 5),
        fetchFinancialRatios(ticker, region, period, 5),
      ]);

      setIncomeData(income);
      setBalanceData(balance);
      setCashFlowData(cashFlow);
      setRatiosData(ratios);

      // Check for errors
      if (income.error && !income.notSupported) {
        setError(income.error);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [stock, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tab configuration
  const tabs = [
    { id: 'income', label: 'Income Statement', icon: TrendingUp },
    { id: 'balance', label: 'Balance Sheet', icon: Building2 },
    { id: 'cashflow', label: 'Cash Flow', icon: DollarSign },
  ];

  // Get current data based on active tab
  const currentData = activeTab === 'income' ? incomeData
    : activeTab === 'balance' ? balanceData
    : cashFlowData;

  const currentItems = activeTab === 'income' ? INCOME_STATEMENT_ITEMS
    : activeTab === 'balance' ? BALANCE_SHEET_ITEMS
    : CASH_FLOW_ITEMS;

  const commonSizeBase = activeTab === 'income' ? 'revenue'
    : activeTab === 'balance' ? 'totalAssets'
    : 'netCashProvidedByOperatingActivities';

  // Check if data is not supported
  const notSupported = incomeData?.notSupported || balanceData?.notSupported || cashFlowData?.notSupported;
  const isIndonesianStock = incomeData?.isIndonesian || balanceData?.isIndonesian || cashFlowData?.isIndonesian;
  const notSupportedError = incomeData?.error || balanceData?.error || cashFlowData?.error;

  return (
    <div className="space-y-6">
      {/* Controls Bar - Only show when we have data */}
      {!notSupported && (
        <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl ${darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
          <div className="flex items-center gap-4">
            {/* Period Toggle */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Period:</span>
              <div className={`flex rounded-lg border ${darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-white'}`}>
                <button
                  onClick={() => setPeriod('annual')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                    period === 'annual'
                      ? 'bg-blue-600 text-white'
                      : darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Annual (10-K)
                </button>
                <button
                  onClick={() => setPeriod('quarter')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                    period === 'quarter'
                      ? 'bg-blue-600 text-white'
                      : darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Quarterly (10-Q)
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Analysis Options */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrowth(!showGrowth)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  showGrowth
                    ? darkMode ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : darkMode ? 'border-slate-600 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-slate-900'
                }`}
                title="Show Year-over-Year Growth"
              >
                <TrendingUp className="w-4 h-4 inline mr-1.5" />
                YoY Growth
              </button>
              <button
                onClick={() => setShowCommonSize(!showCommonSize)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  showCommonSize
                    ? darkMode ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-purple-100 border-purple-300 text-purple-700'
                    : darkMode ? 'border-slate-600 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-slate-900'
                }`}
                title="Show Common Size Analysis (as % of Revenue/Assets)"
              >
                <PieChart className="w-4 h-4 inline mr-1.5" />
                Common Size
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchData}
              disabled={loading}
              className={`p-2.5 rounded-lg border transition-colors ${
                darkMode ? 'border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700' : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Show not supported message */}
      {notSupported ? (
        <NotSupportedMessage
          stock={stock}
          darkMode={darkMode}
          isIndonesian={isIndonesianStock}
          errorMessage={notSupportedError}
        />
      ) : (
        <>
          {/* Key Metrics */}
          {ratiosData?.ratios?.length > 0 && (
            <KeyMetricsCard ratios={ratiosData.ratios} darkMode={darkMode} />
          )}

          {/* Tabs */}
          <div className={`flex border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-500'
                      : `border-transparent ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className={`rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className={`w-8 h-8 animate-spin mx-auto mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Loading from SEC EDGAR...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <AlertCircle className={`w-12 h-12 mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                <p className={`text-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {error}
                </p>
                <button
                  onClick={fetchData}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : currentData?.statements?.length > 0 ? (
              <FinancialTable
                items={currentItems}
                statements={currentData.statements}
                currency={currentData.currency}
                showGrowth={showGrowth}
                showCommonSize={showCommonSize}
                commonSizeBase={commonSizeBase}
                darkMode={darkMode}
                expandedSections={activeTab === 'balance' ? expandedSections : null}
                toggleSection={activeTab === 'balance' ? toggleSection : null}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <Info className={`w-12 h-12 mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <p className={`text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  No financial statement data available for this stock.
                </p>
                <p className={`text-sm mt-2 text-center ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  Try switching to a different period or check if the ticker is correct.
                </p>
              </div>
            )}
          </div>

          {/* Data Source Footer */}
          <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              <span>
                Data from SEC EDGAR (Official US Government Source)
                {currentData?.fromCache && ' • Cached'}
              </span>
            </div>
            <span>
              Currency: {currentData?.currency || 'USD'}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialStatements;
