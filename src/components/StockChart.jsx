// ============================================================================
// STOCK CHART COMPONENT - Interactive Price Charts with Technical Indicators
// Uses Recharts for visualization, Yahoo Finance for data
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  AlertCircle,
  Settings2,
  BarChart3,
  Activity,
  Minus,
} from 'lucide-react';

import {
  fetchChartData,
  enrichChartData,
  formatPrice,
  formatVolume,
  calculatePriceChange,
} from '../services/stockCharts';

// ============================================================================
// TIME RANGE OPTIONS
// ============================================================================

const TIME_RANGES = [
  { value: '1d', label: '1D', interval: '5m' },
  { value: '5d', label: '5D', interval: '15m' },
  { value: '1mo', label: '1M', interval: '1d' },
  { value: '3mo', label: '3M', interval: '1d' },
  { value: '6mo', label: '6M', interval: '1d' },
  { value: '1y', label: '1Y', interval: '1d' },
  { value: '2y', label: '2Y', interval: '1wk' },
  { value: '5y', label: '5Y', interval: '1wk' },
  { value: 'max', label: 'MAX', interval: '1mo' },
];

// ============================================================================
// INDICATOR OPTIONS
// ============================================================================

const INDICATOR_OPTIONS = [
  { id: 'sma20', label: 'SMA 20', color: '#3b82f6', default: true },
  { id: 'sma50', label: 'SMA 50', color: '#f59e0b', default: false },
  { id: 'sma200', label: 'SMA 200', color: '#ef4444', default: false },
  { id: 'ema12', label: 'EMA 12', color: '#10b981', default: false },
  { id: 'ema26', label: 'EMA 26', color: '#8b5cf6', default: false },
  { id: 'bollinger', label: 'Bollinger Bands', color: '#6366f1', default: false },
];

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

const CustomTooltip = ({ active, payload, label, currency, darkMode }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className={`p-3 rounded-lg shadow-lg border ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <div className={`text-xs font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {data.date}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Open:</span>
        <span className={`font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {formatPrice(data.open, currency)}
        </span>
        <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>High:</span>
        <span className={`font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {formatPrice(data.high, currency)}
        </span>
        <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Low:</span>
        <span className={`font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {formatPrice(data.low, currency)}
        </span>
        <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Close:</span>
        <span className={`font-mono font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {formatPrice(data.close, currency)}
        </span>
        <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Volume:</span>
        <span className={`font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {formatVolume(data.volume)}
        </span>
      </div>
      {/* Indicators */}
      {data.sma20 && (
        <div className="mt-2 pt-2 border-t border-slate-600 text-xs">
          <span className="text-blue-400">SMA20: {formatPrice(data.sma20, currency)}</span>
        </div>
      )}
      {data.rsi && (
        <div className="text-xs">
          <span className={data.rsi > 70 ? 'text-red-400' : data.rsi < 30 ? 'text-green-400' : 'text-slate-400'}>
            RSI: {data.rsi.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// RSI CHART COMPONENT
// ============================================================================

const RSIChart = ({ data, darkMode }) => {
  const filteredData = data.filter(d => d.rsi !== null);

  return (
    <div className="h-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis
            domain={[0, 100]}
            ticks={[30, 50, 70]}
            width={30}
            tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" strokeOpacity={0.3} />
          <Area
            type="monotone"
            dataKey="rsi"
            stroke="#8b5cf6"
            fill="url(#rsiGradient)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============================================================================
// VOLUME CHART COMPONENT
// ============================================================================

const VolumeChart = ({ data, darkMode }) => {
  const volumeData = data.map(d => ({
    ...d,
    volumeColor: d.close >= d.open ? '#22c55e' : '#ef4444',
  }));

  return (
    <div className="h-20">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={volumeData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <XAxis dataKey="date" hide />
          <YAxis
            width={40}
            tickFormatter={formatVolume}
            tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="volume" fill={darkMode ? '#475569' : '#cbd5e1'} />
          {data[0]?.volumeMA && (
            <Line
              type="monotone"
              dataKey="volumeMA"
              stroke="#f59e0b"
              strokeWidth={1}
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============================================================================
// MAIN STOCK CHART COMPONENT
// ============================================================================

const StockChart = ({ stock, darkMode }) => {
  // State
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState('1y');
  const [showIndicators, setShowIndicators] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState({
    sma20: true,
    sma50: false,
    sma200: false,
    ema12: false,
    ema26: false,
    bollinger: false,
    rsi: true,
    macd: false,
    volumeMA: true,
  });

  // Get ticker and region
  const ticker = stock?.Ticker || stock?.ticker;
  const region = stock?.Region || stock?.region || 'Indonesia';
  const currency = region === 'Indonesia' ? 'IDR' : 'USD';

  // Fetch chart data
  const loadChartData = useCallback(async () => {
    if (!ticker) return;

    setLoading(true);
    setError(null);

    try {
      const rangeConfig = TIME_RANGES.find(r => r.value === selectedRange);
      const data = await fetchChartData(
        ticker,
        region,
        selectedRange,
        rangeConfig?.interval || '1d'
      );

      // Enrich with indicators
      const enrichedData = enrichChartData(data, activeIndicators);
      setChartData(enrichedData);

    } catch (err) {
      console.error('Failed to load chart data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ticker, region, selectedRange, activeIndicators]);

  // Load data when stock or range changes
  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  // Calculate price change
  const priceChange = useMemo(() => {
    if (!chartData?.data?.length) return null;
    const firstPrice = chartData.data[0]?.close;
    const lastPrice = chartData.data[chartData.data.length - 1]?.close;
    if (!firstPrice || !lastPrice) return null;

    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;
    return { change, changePercent, isPositive: change >= 0 };
  }, [chartData]);

  // Toggle indicator
  const toggleIndicator = (id) => {
    setActiveIndicators(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Format date for X axis
  const formatXAxis = (date) => {
    if (!date) return '';
    if (selectedRange === '1d') {
      return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (selectedRange === '5d' || selectedRange === '1mo') {
      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  if (!stock) {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
        <BarChart3 className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
        <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
          Select a stock to view price chart
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {ticker} Price Chart
          </h3>
          {priceChange && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {formatPrice(chartData?.data?.[chartData.data.length - 1]?.close, currency)}
              </span>
              <span className={`flex items-center text-sm font-medium ${
                priceChange.isPositive ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {priceChange.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {priceChange.isPositive ? '+' : ''}{priceChange.changePercent.toFixed(2)}%
              </span>
              <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                ({selectedRange})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Indicator Toggle */}
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showIndicators
                ? 'bg-blue-600 text-white'
                : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            Indicators
          </button>

          {/* Refresh */}
          <button
            onClick={loadChartData}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className={`flex gap-1 p-1 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {TIME_RANGES.map(range => (
          <button
            key={range.value}
            onClick={() => setSelectedRange(range.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              selectedRange === range.value
                ? 'bg-blue-600 text-white'
                : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Indicator Options */}
      {showIndicators && (
        <div className={`flex flex-wrap gap-2 p-3 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {INDICATOR_OPTIONS.map(ind => (
            <button
              key={ind.id}
              onClick={() => toggleIndicator(ind.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                activeIndicators[ind.id]
                  ? 'text-white'
                  : darkMode ? 'bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              style={activeIndicators[ind.id] ? { backgroundColor: ind.color } : {}}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ind.color }} />
              {ind.label}
            </button>
          ))}
          <button
            onClick={() => toggleIndicator('rsi')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              activeIndicators.rsi
                ? 'bg-purple-500 text-white'
                : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}
          >
            <Activity className="w-3 h-3" />
            RSI
          </button>
        </div>
      )}

      {/* Chart Container */}
      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <Loader2 className={`w-8 h-8 animate-spin mx-auto mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-80 px-4">
            <AlertCircle className={`w-12 h-12 mb-3 ${error.includes('429') || error.includes('Rate limited') ? 'text-amber-400' : darkMode ? 'text-red-400' : 'text-red-500'}`} />
            <p className={`text-center mb-2 font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {error.includes('429') || error.includes('Rate limited') ? 'Temporarily Rate Limited' : 'Chart Unavailable'}
            </p>
            <p className={`text-center text-sm mb-4 max-w-md ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {error.includes('429') || error.includes('Rate limited')
                ? 'Yahoo Finance is limiting requests. Wait a minute and try again, or switch stocks to use cached data.'
                : error}
            </p>
            <button
              onClick={loadChartData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : chartData?.data?.length > 0 ? (
          <div className="p-4">
            {/* Main Price Chart */}
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={priceChange?.isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={priceChange?.isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={darkMode ? '#334155' : '#e2e8f0'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatXAxis}
                    tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={50}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={currency === 'IDR' ? 70 : 50}
                    tickFormatter={(v) => currency === 'IDR' ? `${(v/1000).toFixed(0)}K` : v.toFixed(0)}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} darkMode={darkMode} />} />

                  {/* Bollinger Bands */}
                  {activeIndicators.bollinger && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="bbUpper"
                        stroke="none"
                        fill="#6366f1"
                        fillOpacity={0.1}
                        connectNulls
                      />
                      <Line type="monotone" dataKey="bbUpper" stroke="#6366f1" strokeWidth={1} dot={false} strokeDasharray="3 3" connectNulls />
                      <Line type="monotone" dataKey="bbMiddle" stroke="#6366f1" strokeWidth={1} dot={false} connectNulls />
                      <Line type="monotone" dataKey="bbLower" stroke="#6366f1" strokeWidth={1} dot={false} strokeDasharray="3 3" connectNulls />
                    </>
                  )}

                  {/* Price Area */}
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke={priceChange?.isPositive ? '#22c55e' : '#ef4444'}
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                  />

                  {/* Moving Averages - connectNulls to skip gaps in data */}
                  {activeIndicators.sma20 && (
                    <Line type="monotone" dataKey="sma20" stroke="#3b82f6" strokeWidth={1.5} dot={false} connectNulls />
                  )}
                  {activeIndicators.sma50 && (
                    <Line type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={1.5} dot={false} connectNulls />
                  )}
                  {activeIndicators.sma200 && (
                    <Line type="monotone" dataKey="sma200" stroke="#ef4444" strokeWidth={1.5} dot={false} connectNulls />
                  )}
                  {activeIndicators.ema12 && (
                    <Line type="monotone" dataKey="ema12" stroke="#10b981" strokeWidth={1.5} dot={false} connectNulls />
                  )}
                  {activeIndicators.ema26 && (
                    <Line type="monotone" dataKey="ema26" stroke="#8b5cf6" strokeWidth={1.5} dot={false} connectNulls />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* RSI Chart */}
            {activeIndicators.rsi && chartData.data.some(d => d.rsi !== null) && (
              <div className={`mt-2 pt-2 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  RSI (14)
                </div>
                <RSIChart data={chartData.data} darkMode={darkMode} />
              </div>
            )}

            {/* Volume Chart */}
            <div className={`mt-2 pt-2 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Volume
              </div>
              <VolumeChart data={chartData.data} darkMode={darkMode} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80">
            <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>No chart data available</p>
          </div>
        )}
      </div>

      {/* Chart Info Footer */}
      {chartData && (
        <div className={`flex flex-wrap items-center justify-between text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          <div className="flex items-center gap-4">
            <span>52W High: {formatPrice(chartData.fiftyTwoWeekHigh, currency)}</span>
            <span>52W Low: {formatPrice(chartData.fiftyTwoWeekLow, currency)}</span>
          </div>
          <span>
            Data from Yahoo Finance {chartData.fromCache && '(cached)'}
          </span>
        </div>
      )}
    </div>
  );
};

export default StockChart;
