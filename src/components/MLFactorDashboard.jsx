// ============================================================================
// ML FACTOR WEIGHTING DASHBOARD
// ============================================================================
// Visualizes: Dynamic weights, factor dominance, walk-forward results,
// statistical significance, and rebalancing recommendations
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Layers,
  Calendar,
  Percent,
  Filter,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Play,
  Settings
} from 'lucide-react';

import {
  FACTORS,
  ABSOLUTE_EXCLUSION_CRITERIA,
  filterUniverse,
  calculateDynamicFactorWeights,
  analyzeFactorDominance,
  testFactorSignificance,
  calculateTStatistic,
  runWalkForwardOptimization,
  generateRebalancing,
  WFO_CONFIG,
  REBALANCING_CONFIG
} from '../utils/mlFactorWeighting.js';

// Advanced Neural Network Module
import {
  runNeuralFactorPipeline,
  calculateFactorMomentum,
  detectMarketRegime,
  calculateOptimalHalfLife,
  FactorTimingLSTM,
  FactorEnsemble
} from '../utils/neuralNetworkFactors.js';

// Portfolio Backtest Engine (Lopez de Prado, Chincarini & Kim methodology)
import {
  runPortfolioBacktest,
  BACKTEST_CONFIG,
  US_BACKTEST_CONFIG,
  IDX_BACKTEST_CONFIG,
  POSITION_SIZING,
  calculatePerformanceMetrics,
  detectMarket,
  filterByMarket,
  getBacktestConfig
} from '../utils/portfolioBacktest.js';

// Institutional-Grade Quant Engine (AQR, MSCI Barra, Lopez de Prado)
import {
  runQuantFactorPipeline,
  calculateICStatistics,
  deflatedSharpeRatio,
  hierarchicalRiskParity,
  crossSectionalZScore,
  sectorNeutralize
} from '../utils/quantFactorEngine.js';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', darkMode }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-violet-600'
  };

  return (
    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {title}
        </span>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</div>
      {subtitle && <div className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</div>}
    </div>
  );
};

const ProgressBar = ({ value, max = 100, color = 'blue', darkMode }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colorClasses = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MLFactorDashboard = ({ stocks, darkMode = true }) => {
  const [activeTab, setActiveTab] = useState('weights');
  const [isCalculating, setIsCalculating] = useState(false);
  const [dynamicWeights, setDynamicWeights] = useState(null);
  const [factorDominance, setFactorDominance] = useState(null);
  const [wfoResults, setWfoResults] = useState(null);
  const [excludedStocks, setExcludedStocks] = useState(null);

  // Neural Network State
  const [nnResults, setNnResults] = useState(null);
  const [marketRegime, setMarketRegime] = useState(null);
  const [momentumSignals, setMomentumSignals] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(0);

  // Portfolio Backtest State
  const [backtestResults, setBacktestResults] = useState(null);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [detectedMarket, setDetectedMarket] = useState('US');
  const [activeConfig, setActiveConfig] = useState(US_BACKTEST_CONFIG);

  // Institutional Quant Analysis State
  const [quantAnalysis, setQuantAnalysis] = useState(null);

  // Mock historical factor returns (in real implementation, fetch from backend)
  const mockHistoricalReturns = useMemo(() => {
    const periods = 24; // 24 months
    const factorNames = Object.keys(FACTORS);

    return Array(periods).fill().map(() =>
      factorNames.map(() => (Math.random() - 0.3) * 10) // -3% to +7% monthly returns
    );
  }, []);

  // Calculate on mount
  useEffect(() => {
    if (stocks && stocks.length > 0) {
      runCalculations();
    }
  }, [stocks]);

  const runCalculations = async () => {
    setIsCalculating(true);

    // Simulate async calculation
    await new Promise(resolve => setTimeout(resolve, 500));

    // 1. Filter universe
    const filteredResult = filterUniverse(stocks || []);
    setExcludedStocks(filteredResult);

    // 2. Calculate dynamic weights
    const currentScores = Object.keys(FACTORS).map(() => Math.random() * 100);
    const weights = calculateDynamicFactorWeights(mockHistoricalReturns, currentScores, {
      useNeuralNetwork: true,
      recencyHalfLife: 6,
      minSignificanceLevel: 0.10
    });
    setDynamicWeights(weights);

    // 3. Analyze factor dominance
    const dominance = analyzeFactorDominance(
      mockHistoricalReturns.map(period => {
        const obj = {};
        Object.keys(FACTORS).forEach((f, i) => obj[i] = period[i]);
        return period;
      }),
      12
    );
    setFactorDominance(dominance);

    // 4. Run actual backtest to get WFO results (instead of mock data)
    // The backtest will set wfoResults via runBacktest()

    // 5. Run Neural Network Pipeline
    setTrainingProgress(10);
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      // Market regime detection
      const marketReturns = mockHistoricalReturns.map(period =>
        period.reduce((a, b) => a + b, 0) / period.length
      );
      const regime = detectMarketRegime(marketReturns);
      setMarketRegime(regime);
      setTrainingProgress(30);

      // Momentum signals
      const momentum = calculateFactorMomentum(mockHistoricalReturns);
      setMomentumSignals(momentum);
      setTrainingProgress(50);

      await new Promise(resolve => setTimeout(resolve, 300));

      // Run full neural pipeline
      const nnOutput = runNeuralFactorPipeline(mockHistoricalReturns, {
        useEnsemble: true,
        epochs: 50,
        sequenceLength: 12
      });
      setNnResults(nnOutput);

      // 6. Run Institutional Quant Analysis Pipeline
      const quantResults = runQuantFactorPipeline(stocks || [], mockHistoricalReturns.map(r => ({ returns: r })), {
        numTrials: 100
      });
      setQuantAnalysis(quantResults);

      setTrainingProgress(100);

    } catch (error) {
      console.error('Neural network error:', error);
    }

    setIsCalculating(false);
  };

  const theme = {
    card: darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200',
    text: darkMode ? 'text-white' : 'text-slate-900',
    textMuted: darkMode ? 'text-slate-400' : 'text-slate-500',
    border: darkMode ? 'border-slate-700' : 'border-slate-200'
  };

  const tabs = [
    { id: 'weights', label: 'Dynamic Weights', icon: Brain },
    { id: 'portfolio', label: 'Portfolio', icon: Layers },
    { id: 'quant', label: 'Quant Analysis', icon: BarChart3 },
    { id: 'lstm', label: 'LSTM Network', icon: Zap },
    { id: 'dominance', label: 'Factor Dominance', icon: Award },
    { id: 'backtest', label: 'Walk-Forward', icon: Activity },
    { id: 'filters', label: 'Exclusion Filters', icon: Filter }
  ];

  // Run portfolio backtest
  const runBacktest = async () => {
    if (!stocks || stocks.length === 0) return;

    setIsBacktesting(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Detect market and get appropriate config
      const market = detectMarket(stocks);
      setDetectedMarket(market);

      const config = market === 'IDX' ? IDX_BACKTEST_CONFIG : US_BACKTEST_CONFIG;
      setActiveConfig(config);

      // Filter stocks to only include stocks from the detected market
      const filteredStocks = filterByMarket(stocks, market);

      // Get current factor weights
      const factorWeights = dynamicWeights?.weightsArray || Object.keys(FACTORS).map(() => 1 / Object.keys(FACTORS).length);

      // Run the backtest with market-appropriate settings
      const initialCapital = market === 'IDX' ? 1000000000 : 1000000; // Rp 1B or $1M
      const results = runPortfolioBacktest(filteredStocks, factorWeights, config, {
        numMonths: 30,
        initialCapital,
        sizingMethod: POSITION_SIZING.SCORE_WEIGHTED
      });

      setBacktestResults({ ...results, market, filteredCount: filteredStocks.length, totalCount: stocks.length });

      // Update WFO results with real data
      if (results.performance) {
        setWfoResults({
          annualizedReturn: parseFloat(results.performance.annualizedReturn),
          sharpeRatio: parseFloat(results.performance.sharpeRatio),
          maxDrawdown: parseFloat(results.performance.maxDrawdown),
          winRate: parseFloat(results.performance.winRate),
          totalPeriods: results.performance.numPeriods,
          profitablePeriods: results.performance.winningMonths
        });
      }
    } catch (error) {
      console.error('Backtest error:', error);
    }

    setIsBacktesting(false);
  };

  // Run backtest when weights change (always re-run, not just when no results)
  useEffect(() => {
    if (dynamicWeights && stocks?.length > 0) {
      runBacktest();
    }
  }, [dynamicWeights]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${theme.text}`}>ML Factor Weighting</h2>
              <p className={`text-sm ${theme.textMuted}`}>
                LSTM-Attention neural network • Walk-forward backtested • Monthly rebalancing
              </p>
            </div>
          </div>
          <button
            onClick={runCalculations}
            disabled={isCalculating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              isCalculating
                ? 'bg-slate-600 cursor-wait'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white'
            }`}
          >
            {isCalculating ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Calculating...</>
            ) : (
              <><Play className="w-4 h-4" /> Run Analysis</>
            )}
          </button>
        </div>

        {/* Summary Stats - Row 1: Key Performance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard
            title="Annualized Return"
            value={wfoResults ? `${wfoResults.annualizedReturn}%` : '--'}
            subtitle={wfoResults?.annualizedReturn >= 14 ? "✓ Hitting 14% target" : "Walk-forward OOS"}
            icon={TrendingUp}
            color="emerald"
            darkMode={darkMode}
          />
          <StatCard
            title="Sharpe Ratio"
            value={wfoResults ? wfoResults.sharpeRatio.toFixed(2) : '--'}
            subtitle={wfoResults?.sharpeRatio >= 1 ? "Excellent risk-adjusted" : "Risk-adjusted"}
            icon={Target}
            color="blue"
            darkMode={darkMode}
          />
          <StatCard
            title="Max Drawdown"
            value={wfoResults ? `${wfoResults.maxDrawdown}%` : '--'}
            subtitle="Worst peak-to-trough"
            icon={TrendingDown}
            color="red"
            darkMode={darkMode}
          />
          <StatCard
            title="Win Rate"
            value={wfoResults ? `${wfoResults.winRate}%` : '--'}
            subtitle={wfoResults ? `${wfoResults.profitablePeriods}/${wfoResults.totalPeriods} profitable months` : ''}
            icon={Award}
            color="purple"
            darkMode={darkMode}
          />
        </div>

        {/* Summary Stats - Row 2: Model Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
            <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Model</div>
            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {nnResults?.methodology?.model || 'LSTM-Attention'}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
            <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Regime</div>
            <div className={`text-sm font-bold ${
              marketRegime?.regime?.includes('bull') ? 'text-emerald-400' :
              marketRegime?.regime?.includes('bear') ? 'text-red-400' :
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {marketRegime?.regime?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Detecting...'}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
            <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rebalance</div>
            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Monthly</div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
            <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Factors</div>
            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{Object.keys(FACTORS).length} Active</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`flex gap-1 p-1 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? `${darkMode ? 'bg-slate-700' : 'bg-white'} text-purple-500 shadow-sm`
                : `${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'weights' && (
        <div className={`rounded-2xl p-6 border ${theme.card}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${theme.text}`}>Dynamic Factor Weights</h3>
              <p className={`text-sm ${theme.textMuted}`}>Neural network optimized weights for current period</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
            }`}>
              <Zap className="w-3 h-3" />
              ML Optimized
            </div>
          </div>

          {dynamicWeights ? (
            <div className="space-y-4">
              {Object.entries(dynamicWeights.weights).map(([factor, weight], i) => {
                const sig = dynamicWeights.significance[factor];
                const isSignificant = sig?.significant;

                return (
                  <div key={factor} className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${theme.text}`}>
                          {FACTORS[factor]?.name || factor}
                        </span>
                        {isSignificant ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> Significant
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400">
                            p={sig?.pValue?.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className={`text-lg font-bold ${isSignificant ? 'text-emerald-400' : theme.text}`}>
                        {weight.toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={weight}
                      max={30}
                      color={isSignificant ? 'emerald' : 'blue'}
                      darkMode={darkMode}
                    />
                    <div className={`flex justify-between mt-2 text-xs ${theme.textMuted}`}>
                      <span>t-stat: {sig?.tStat?.toFixed(2)}</span>
                      <span>Recent: {dynamicWeights.recentPerformance[factor]?.toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })}

              {/* Methodology Note */}
              <div className={`mt-6 p-4 rounded-xl border ${theme.border} ${darkMode ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                <div className="flex items-start gap-3">
                  <Info className={`w-5 h-5 ${theme.textMuted} flex-shrink-0 mt-0.5`} />
                  <div className={`text-xs ${theme.textMuted}`}>
                    <p className="font-semibold mb-1">Methodology</p>
                    <p>Weights are calculated using a 2-layer neural network trained on {dynamicWeights.methodology.dataPoints} months of factor returns.
                    Recent data is weighted with {dynamicWeights.methodology.recencyHalfLife}-month half-life decay.
                    Factors with p-value {'>'} {dynamicWeights.methodology.minSignificanceLevel} are down-weighted.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`text-center py-12 ${theme.textMuted}`}>
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Click "Run Analysis" to calculate optimal weights</p>
            </div>
          )}
        </div>
      )}

      {/* PORTFOLIO TAB - Holdings, Trades, Equity Curve */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          {/* Run Backtest Button */}
          {!backtestResults && (
            <div className={`rounded-2xl p-6 border ${theme.card} text-center`}>
              <Layers className={`w-16 h-16 mx-auto mb-4 ${theme.textMuted} opacity-50`} />
              <h3 className={`text-lg font-bold mb-2 ${theme.text}`}>Portfolio Backtest</h3>
              <p className={`text-sm mb-4 ${theme.textMuted}`}>
                Run a 36-month walk-forward backtest with transaction costs
              </p>
              <button
                onClick={runBacktest}
                disabled={isBacktesting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isBacktesting ? (
                  <><RefreshCw className="w-4 h-4 inline mr-2 animate-spin" /> Running Backtest...</>
                ) : (
                  <><Play className="w-4 h-4 inline mr-2" /> Run Portfolio Backtest</>
                )}
              </button>
            </div>
          )}

          {backtestResults && (
            <>
              {/* Performance Summary */}
              <div className={`rounded-2xl p-6 border ${theme.card}`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-lg font-bold ${theme.text}`}>Backtest Performance</h3>
                    <p className={`text-sm ${theme.textMuted}`}>
                      {backtestResults.summary.numPeriods} months •{' '}
                      {backtestResults.market === 'IDX'
                        ? `Rp ${(backtestResults.summary.initialCapital / 1e9).toFixed(1)}B initial • JCI benchmark`
                        : `$${(backtestResults.summary.initialCapital / 1e6).toFixed(1)}M initial • S&P 500 benchmark`}
                      {backtestResults.filteredCount !== backtestResults.totalCount && (
                        <span className="text-amber-400 ml-2">
                          ({backtestResults.filteredCount}/{backtestResults.totalCount} {backtestResults.market} stocks)
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={runBacktest}
                    disabled={isBacktesting}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                      darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                    } ${theme.text}`}
                  >
                    <RefreshCw className={`w-4 h-4 ${isBacktesting ? 'animate-spin' : ''}`} />
                    Re-run
                  </button>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                    <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Final Value</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {backtestResults.market === 'IDX'
                        ? `Rp ${(backtestResults.summary.finalValue / 1e9).toFixed(2)}B`
                        : `$${(backtestResults.summary.finalValue / 1e6).toFixed(2)}M`}
                    </div>
                    <div className={`text-xs ${theme.textMuted}`}>
                      {parseFloat(backtestResults.summary.totalReturn) >= 0 ? '+' : ''}{backtestResults.summary.totalReturn}% total
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Sharpe Ratio</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {backtestResults.performance.sharpeRatio}
                    </div>
                    <div className={`text-xs ${theme.textMuted}`}>
                      Sortino: {backtestResults.performance.sortinoRatio}
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                    <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Max Drawdown</div>
                    <div className="text-2xl font-bold text-red-400">
                      {backtestResults.performance.maxDrawdown}%
                    </div>
                    <div className={`text-xs ${theme.textMuted}`}>
                      Best: +{backtestResults.performance.bestMonth}%
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'}`}>
                    <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Win Rate</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {backtestResults.performance.winRate}%
                    </div>
                    <div className={`text-xs ${theme.textMuted}`}>
                      {backtestResults.performance.winningMonths}/{backtestResults.performance.numPeriods} months
                    </div>
                  </div>
                </div>

                {/* Equity Curve */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <h4 className={`text-sm font-semibold mb-3 ${theme.text}`}>Equity Curve</h4>
                  <div className="h-32 flex items-end gap-1">
                    {backtestResults.performance.equityCurve.slice(1).map((value, i) => {
                      const normalizedHeight = ((value - 0.8) / 0.6) * 100; // Normalize to 80%-140% range
                      const isPositive = value >= 1;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-t transition-all ${
                            isPositive ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                          style={{ height: `${Math.max(5, Math.min(100, normalizedHeight))}%` }}
                          title={`Month ${i + 1}: ${((value - 1) * 100).toFixed(1)}%`}
                        />
                      );
                    })}
                  </div>
                  <div className={`flex justify-between mt-2 text-xs ${theme.textMuted}`}>
                    <span>Month 1</span>
                    <span>Month {backtestResults.performance.numPeriods}</span>
                  </div>
                </div>
              </div>

              {/* Current Holdings */}
              <div className={`rounded-2xl p-6 border ${theme.card}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-bold ${theme.text}`}>Current Holdings</h3>
                    <p className={`text-sm ${theme.textMuted}`}>
                      Top {Math.min(10, backtestResults.currentHoldings?.length || 0)} positions by weight
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                    {backtestResults.summary.avgHoldings} avg positions
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${theme.border}`}>
                        <th className={`text-left py-2 px-3 font-semibold ${theme.textMuted}`}>#</th>
                        <th className={`text-left py-2 px-3 font-semibold ${theme.textMuted}`}>Ticker</th>
                        <th className={`text-left py-2 px-3 font-semibold ${theme.textMuted}`}>Name</th>
                        <th className={`text-right py-2 px-3 font-semibold ${theme.textMuted}`}>Weight</th>
                        <th className={`text-right py-2 px-3 font-semibold ${theme.textMuted}`}>Score</th>
                        <th className={`text-left py-2 px-3 font-semibold ${theme.textMuted}`}>Sector</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backtestResults.currentHoldings?.slice(0, 10).map((holding, i) => (
                        <tr key={holding.ticker} className={`border-b ${theme.border} hover:${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                          <td className={`py-3 px-3 ${theme.textMuted}`}>{i + 1}</td>
                          <td className={`py-3 px-3 font-mono font-bold ${theme.text}`}>{holding.ticker}</td>
                          <td className={`py-3 px-3 ${theme.text}`}>{holding.name?.substring(0, 20)}</td>
                          <td className={`py-3 px-3 text-right font-semibold ${theme.text}`}>
                            {holding.weightPct}%
                          </td>
                          <td className={`py-3 px-3 text-right ${
                            holding.compositeScore >= 60 ? 'text-emerald-400' :
                            holding.compositeScore >= 40 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {holding.compositeScore?.toFixed(1)}
                          </td>
                          <td className={`py-3 px-3 text-xs ${theme.textMuted}`}>{holding.sector}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Last Rebalancing Trades */}
              {backtestResults.lastTrades && (
                <div className={`rounded-2xl p-6 border ${theme.card}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-bold ${theme.text}`}>Latest Trade Signals</h3>
                      <p className={`text-sm ${theme.textMuted}`}>
                        Turnover: {backtestResults.lastTrades.summary.turnover}% • Costs: Rp {(backtestResults.lastTrades.summary.totalCosts / 1e6).toFixed(1)}M
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Buys */}
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                        <span className={`font-semibold ${theme.text}`}>
                          Buys ({backtestResults.lastTrades.summary.numBuys})
                        </span>
                      </div>
                      {backtestResults.lastTrades.trades.filter(t => t.action === 'BUY').slice(0, 5).map(trade => (
                        <div key={trade.ticker} className={`flex justify-between items-center py-2 border-b ${theme.border} last:border-0`}>
                          <div>
                            <span className={`font-mono font-semibold ${theme.text}`}>{trade.ticker}</span>
                            <span className={`text-xs ml-2 ${theme.textMuted}`}>{trade.reason}</span>
                          </div>
                          <span className="text-emerald-400 font-semibold">+{trade.targetWeight}%</span>
                        </div>
                      ))}
                      {backtestResults.lastTrades.summary.numBuys === 0 && (
                        <p className={`text-sm ${theme.textMuted}`}>No buy signals this period</p>
                      )}
                    </div>

                    {/* Sells */}
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-red-500/10' : 'bg-red-50'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowDownRight className="w-5 h-5 text-red-400" />
                        <span className={`font-semibold ${theme.text}`}>
                          Sells ({backtestResults.lastTrades.summary.numSells})
                        </span>
                      </div>
                      {backtestResults.lastTrades.trades.filter(t => t.action === 'SELL').slice(0, 5).map(trade => (
                        <div key={trade.ticker} className={`flex justify-between items-center py-2 border-b ${theme.border} last:border-0`}>
                          <div>
                            <span className={`font-mono font-semibold ${theme.text}`}>{trade.ticker}</span>
                            <span className={`text-xs ml-2 ${theme.textMuted}`}>{trade.reason}</span>
                          </div>
                          <span className="text-red-400 font-semibold">-{trade.currentWeight}%</span>
                        </div>
                      ))}
                      {backtestResults.lastTrades.summary.numSells === 0 && (
                        <p className={`text-sm ${theme.textMuted}`}>No sell signals this period</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Methodology & Settings */}
              <div className={`rounded-2xl p-6 border ${theme.card}`}>
                <div className="flex items-start gap-3">
                  <Info className={`w-5 h-5 ${theme.textMuted} flex-shrink-0 mt-0.5`} />
                  <div className={`text-xs ${theme.textMuted}`}>
                    <p className="font-semibold mb-2">Backtest Methodology</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="font-medium">Walk-Forward</p>
                        <p>12m train / 1m test</p>
                      </div>
                      <div>
                        <p className="font-medium">Transaction Costs</p>
                        <p>10 bps spread + impact</p>
                      </div>
                      <div>
                        <p className="font-medium">Position Sizing</p>
                        <p>Score-weighted, 2-10%</p>
                      </div>
                      <div>
                        <p className="font-medium">Max Turnover</p>
                        <p>30% monthly limit</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] opacity-70">
                      Based on: Lopez de Prado (2018), Chincarini & Kim QEPM, AQR Factor Research, Two Sigma methodology
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* INSTITUTIONAL QUANT ANALYSIS TAB */}
      {activeTab === 'quant' && (
        <div className="space-y-6">
          {/* Header */}
          <div className={`rounded-2xl p-6 border ${theme.card}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-bold ${theme.text}`}>Institutional Quant Analysis</h3>
                <p className={`text-sm ${theme.textMuted}`}>
                  AQR • MSCI Barra • Lopez de Prado methodology
                </p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
                <BarChart3 className="w-3 h-3" />
                Institutional Grade
              </div>
            </div>

            {quantAnalysis ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* IC Analysis */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${theme.textMuted}`}>Mean IC</div>
                  <div className={`text-2xl font-bold ${
                    (quantAnalysis.icAnalysis?.meanIC || 0) >= 0.05 ? 'text-emerald-400' :
                    (quantAnalysis.icAnalysis?.meanIC || 0) >= 0.02 ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {quantAnalysis.icAnalysis?.meanIC?.toFixed(3) || '--'}
                  </div>
                  <div className={`text-xs ${theme.textMuted}`}>
                    {quantAnalysis.icAnalysis?.quality || 'N/A'} signal
                  </div>
                </div>

                {/* IC t-stat */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${theme.textMuted}`}>IC t-stat</div>
                  <div className={`text-2xl font-bold ${
                    (quantAnalysis.icAnalysis?.tStat || 0) >= 1.96 ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {quantAnalysis.icAnalysis?.tStat?.toFixed(2) || '--'}
                  </div>
                  <div className={`text-xs ${theme.textMuted}`}>
                    {quantAnalysis.icAnalysis?.significant ? '✓ Significant' : 'Not significant'}
                  </div>
                </div>

                {/* Deflated Sharpe */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${theme.textMuted}`}>Deflated SR</div>
                  <div className={`text-2xl font-bold ${
                    (quantAnalysis.deflatedSharpe?.deflatedSharpe || 0) > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {quantAnalysis.deflatedSharpe?.deflatedSharpe?.toFixed(2) || '--'}
                  </div>
                  <div className={`text-xs ${theme.textMuted}`}>
                    p={quantAnalysis.deflatedSharpe?.pValue?.toFixed(3) || '--'}
                  </div>
                </div>

                {/* IC IR */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <div className={`text-xs uppercase font-semibold tracking-wider mb-1 ${theme.textMuted}`}>IC IR (ann.)</div>
                  <div className={`text-2xl font-bold ${
                    (quantAnalysis.icAnalysis?.icIR || 0) >= 0.5 ? 'text-emerald-400' :
                    (quantAnalysis.icAnalysis?.icIR || 0) >= 0.2 ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {quantAnalysis.icAnalysis?.icIR?.toFixed(2) || '--'}
                  </div>
                  <div className={`text-xs ${theme.textMuted}`}>
                    Annualized IC/σ
                  </div>
                </div>
              </div>
            ) : (
              <div className={`text-center py-8 ${theme.textMuted}`}>
                Click "Run Analysis" to generate quant metrics
              </div>
            )}
          </div>

          {/* Factor Z-Scores */}
          {quantAnalysis?.factorZScores && (
            <div className={`rounded-2xl p-6 border ${theme.card}`}>
              <h4 className={`text-lg font-bold mb-4 ${theme.text}`}>Cross-Sectional Z-Scores</h4>
              <p className={`text-sm mb-4 ${theme.textMuted}`}>
                Industry-standard factor standardization (winsorized, sector-neutralized)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(quantAnalysis.factorZScores).slice(0, 6).map(([factor, scores]) => {
                  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                  const maxScore = scores.length ? Math.max(...scores) : 0;
                  const minScore = scores.length ? Math.min(...scores) : 0;
                  return (
                    <div key={factor} className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                      <div className={`text-sm font-semibold mb-2 ${theme.text}`}>{factor}</div>
                      <div className={`text-xs ${theme.textMuted} space-y-1`}>
                        <div className="flex justify-between">
                          <span>Mean:</span>
                          <span className="font-mono">{avgScore.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Range:</span>
                          <span className="font-mono">[{minScore.toFixed(2)}, {maxScore.toFixed(2)}]</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deflated Sharpe Details */}
          {quantAnalysis?.deflatedSharpe && (
            <div className={`rounded-2xl p-6 border ${theme.card}`}>
              <h4 className={`text-lg font-bold mb-4 ${theme.text}`}>Deflated Sharpe Ratio Analysis</h4>
              <p className={`text-sm mb-4 ${theme.textMuted}`}>
                Corrects for selection bias, multiple testing, and non-normal returns (Lopez de Prado 2014)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <div className={`text-xs ${theme.textMuted}`}>Original Sharpe</div>
                  <div className={`text-lg font-bold ${theme.text}`}>
                    {quantAnalysis.deflatedSharpe.originalSharpe?.toFixed(2)}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <div className={`text-xs ${theme.textMuted}`}>Expected Max SR</div>
                  <div className={`text-lg font-bold ${theme.text}`}>
                    {quantAnalysis.deflatedSharpe.expectedMaxSharpe?.toFixed(2)}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <div className={`text-xs ${theme.textMuted}`}>Skewness</div>
                  <div className={`text-lg font-bold ${theme.text}`}>
                    {quantAnalysis.deflatedSharpe.skewness?.toFixed(2)}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <div className={`text-xs ${theme.textMuted}`}>Excess Kurtosis</div>
                  <div className={`text-lg font-bold ${theme.text}`}>
                    {quantAnalysis.deflatedSharpe.kurtosis?.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className={`mt-4 p-3 rounded-lg ${
                quantAnalysis.deflatedSharpe.significant
                  ? darkMode ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'
                  : darkMode ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  {quantAnalysis.deflatedSharpe.significant ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <span className={`text-sm font-semibold ${theme.text}`}>
                    {quantAnalysis.deflatedSharpe.significant
                      ? 'Strategy passes deflated Sharpe test (p < 0.05)'
                      : 'Strategy may be overfit - fails deflated Sharpe test'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Methodology */}
          <div className={`rounded-2xl p-6 border ${theme.card}`}>
            <div className="flex items-start gap-3">
              <Info className={`w-5 h-5 ${theme.textMuted} flex-shrink-0 mt-0.5`} />
              <div className={`text-xs ${theme.textMuted}`}>
                <p className="font-semibold mb-2">Institutional Methodology</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Factor Construction</p>
                    <p>Cross-sectional z-scores with sector neutralization (AQR, MSCI Barra)</p>
                  </div>
                  <div>
                    <p className="font-medium">Signal Quality</p>
                    <p>Information Coefficient (IC) with Spearman correlation (Grinold & Kahn)</p>
                  </div>
                  <div>
                    <p className="font-medium">Portfolio Optimization</p>
                    <p>Hierarchical Risk Parity (Lopez de Prado 2016)</p>
                  </div>
                  <div>
                    <p className="font-medium">Validation</p>
                    <p>Deflated Sharpe Ratio + CPCV (Lopez de Prado 2014, 2018)</p>
                  </div>
                </div>
                <p className="mt-3 text-[10px] opacity-70">
                  Sources: AQR "Quality Minus Junk", MSCI Barra Factor Models, "Advances in Financial Machine Learning"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LSTM NEURAL NETWORK TAB */}
      {activeTab === 'lstm' && (
        <div className={`rounded-2xl p-6 border ${theme.card}`}>
          <div className="mb-6">
            <h3 className={`text-lg font-bold ${theme.text}`}>LSTM Neural Network</h3>
            <p className={`text-sm ${theme.textMuted}`}>Deep learning for factor timing • Attention mechanism • Regime-adjusted</p>
          </div>

          {/* Training Progress */}
          {isCalculating && (
            <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${theme.text}`}>Training Neural Network...</span>
                <span className={`text-sm font-bold text-purple-400`}>{trainingProgress}%</span>
              </div>
              <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>
              <p className={`text-xs mt-2 ${theme.textMuted}`}>
                {trainingProgress < 30 ? 'Detecting market regime...' :
                 trainingProgress < 50 ? 'Calculating momentum signals...' :
                 trainingProgress < 100 ? 'Training LSTM ensemble...' :
                 'Complete!'}
              </p>
            </div>
          )}

          {nnResults ? (
            <div className="space-y-6">
              {/* Architecture Info */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-purple-400" />
                  <div>
                    <p className={`font-bold ${theme.text}`}>{nnResults.methodology?.model || 'LSTM-Attention'}</p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      {nnResults.methodology?.sequenceLength || 12} month lookback • {nnResults.methodology?.epochs || 50} epochs
                    </p>
                  </div>
                </div>
                <p className={`text-xs ${theme.textMuted}`}>
                  <strong>Architecture:</strong> LSTM cells capture temporal dependencies → Multi-head attention weights important time periods → Regime-adjusted output
                </p>
              </div>

              {/* Market Regime */}
              {marketRegime && (
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-semibold ${theme.text}`}>Detected Market Regime</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      marketRegime.regime?.includes('bull') ? 'bg-emerald-500/20 text-emerald-400' :
                      marketRegime.regime?.includes('bear') ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {marketRegime.regime?.replace(/_/g, ' ').toUpperCase() || 'Unknown'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-lg font-bold ${theme.text}`}>{marketRegime.volatility || '--'}%</div>
                      <div className={`text-xs ${theme.textMuted}`}>Annualized Vol</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${marketRegime.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {marketRegime.trend >= 0 ? '+' : ''}{(marketRegime.trend * 100).toFixed(1) || '--'}%
                      </div>
                      <div className={`text-xs ${theme.textMuted}`}>Trend</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${theme.text}`}>{marketRegime.confidence || '--'}%</div>
                      <div className={`text-xs ${theme.textMuted}`}>Confidence</div>
                    </div>
                  </div>
                </div>
              )}

              {/* NN Predicted Weights */}
              <div>
                <h4 className={`text-sm font-semibold mb-3 ${theme.text}`}>Neural Network Predicted Weights</h4>
                <div className="space-y-3">
                  {Object.keys(FACTORS).map((factor, i) => {
                    const weight = nnResults.weights?.[i] || 0;
                    const momentum = momentumSignals?.[i];

                    return (
                      <div key={factor} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${theme.text}`}>
                              {FACTORS[factor]?.name || factor}
                            </span>
                            {momentum && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                momentum.momentumSignal > 0 ? 'bg-emerald-500/20 text-emerald-400' :
                                momentum.momentumSignal < 0 ? 'bg-red-500/20 text-red-400' :
                                'bg-slate-500/20 text-slate-400'
                              }`}>
                                {momentum.momentumSignal > 0 ? '↑ Momentum' : momentum.momentumSignal < 0 ? '↓ Momentum' : '→ Neutral'}
                              </span>
                            )}
                          </div>
                          <span className={`text-lg font-bold text-purple-400`}>{weight.toFixed(1)}%</span>
                        </div>
                        <ProgressBar value={weight} max={30} color="purple" darkMode={darkMode} />
                        {momentum && (
                          <div className={`flex justify-between mt-2 text-xs ${theme.textMuted}`}>
                            <span>Z-Score: {momentum.zScore}</span>
                            <span>Short Momentum: {momentum.shortMomentum?.toFixed(2)}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attention Weights Visualization */}
              {nnResults.attention && nnResults.attention.length > 0 && (
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <h4 className={`text-sm font-semibold mb-3 ${theme.text}`}>Attention Weights (Time Importance)</h4>
                  <p className={`text-xs mb-3 ${theme.textMuted}`}>
                    Which months the model focused on most (higher = more important for prediction)
                  </p>
                  <div className="flex items-end gap-1 h-20">
                    {nnResults.attention.map((weight, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-purple-500 to-indigo-400 rounded-t transition-all hover:from-purple-400 hover:to-indigo-300"
                        style={{ height: `${Math.max(10, weight * 100)}%` }}
                        title={`Month ${i + 1}: ${(weight * 100).toFixed(1)}%`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs ${theme.textMuted}`}>Oldest</span>
                    <span className={`text-xs ${theme.textMuted}`}>Most Recent</span>
                  </div>
                </div>
              )}

              {/* Methodology Note */}
              <div className={`p-4 rounded-xl border ${theme.border}`}>
                <div className="flex items-start gap-3">
                  <Info className={`w-5 h-5 ${theme.textMuted} flex-shrink-0`} />
                  <div className={`text-xs ${theme.textMuted}`}>
                    <p className="font-semibold mb-1">LSTM-Attention Architecture</p>
                    <p className="mb-2">
                      Based on research from PMC (2024), arXiv, and Nature Scientific Reports.
                      LSTM cells capture temporal dependencies in factor returns.
                      Multi-head attention identifies which historical periods are most predictive.
                      Regime detection adjusts factor tilts based on market conditions.
                    </p>
                    <p>
                      <strong>Sources:</strong> "Advanced investing with deep learning" (PMC 2024),
                      "Advancing Investment Frontiers" (arXiv 2024),
                      "LSTM for Stock Price Prediction" (IEEE)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`text-center py-12 ${theme.textMuted}`}>
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Click "Run Analysis" to train the neural network</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'dominance' && (
        <div className={`rounded-2xl p-6 border ${theme.card}`}>
          <div className="mb-6">
            <h3 className={`text-lg font-bold ${theme.text}`}>Factor Dominance Analysis</h3>
            <p className={`text-sm ${theme.textMuted}`}>Which factors are driving returns over the past 12 months</p>
          </div>

          {factorDominance ? (
            <>
              {/* Dominant Factor Highlight */}
              <div className={`p-4 rounded-xl mb-6 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30`}>
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className={`text-xs ${theme.textMuted}`}>Most Dominant Factor</p>
                    <p className={`text-xl font-bold text-purple-400`}>
                      {FACTORS[factorDominance.dominantFactor]?.name || factorDominance.dominantFactor}
                    </p>
                  </div>
                </div>
              </div>

              {/* Factor Rankings */}
              <div className="space-y-3">
                {factorDominance.ranking.map((factor, index) => (
                  <div
                    key={factor.factor}
                    className={`p-4 rounded-xl flex items-center gap-4 ${
                      index === 0 ? 'bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20' :
                      darkMode ? 'bg-slate-700/30' : 'bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-purple-500 text-white' :
                      index === 1 ? 'bg-slate-600 text-white' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {factor.rank}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${theme.text}`}>
                          {FACTORS[factor.factor]?.name || factor.factor}
                        </span>
                        <span className={`text-sm font-bold ${factor.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {factor.avgReturn >= 0 ? '+' : ''}{factor.avgReturn}%
                        </span>
                      </div>
                      <div className={`flex gap-4 text-xs ${theme.textMuted}`}>
                        <span>IR: {factor.informationRatio}</span>
                        <span>Hit Rate: {factor.hitRate}%</span>
                        <span className={factor.significant ? 'text-emerald-400' : ''}>
                          {factor.significant ? 'Significant' : `p=${factor.pValue}`}
                        </span>
                      </div>
                    </div>

                    <div className={`text-right ${theme.textMuted}`}>
                      <div className={`text-lg font-bold ${theme.text}`}>{factor.dominanceScore}</div>
                      <div className="text-xs">Score</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Significant Factors */}
              <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'} border border-emerald-500/20`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className={`text-sm font-semibold text-emerald-400`}>Statistically Significant Factors</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {factorDominance.significantFactors.length > 0 ? (
                    factorDominance.significantFactors.map(f => (
                      <span key={f} className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                        {FACTORS[f]?.name || f}
                      </span>
                    ))
                  ) : (
                    <span className={theme.textMuted}>No factors currently significant at p {'<'} 0.05</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={`text-center py-12 ${theme.textMuted}`}>
              <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Click "Run Analysis" to analyze factor dominance</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'backtest' && (
        <div className={`rounded-2xl p-6 border ${theme.card}`}>
          <div className="mb-6">
            <h3 className={`text-lg font-bold ${theme.text}`}>Walk-Forward Optimization</h3>
            <p className={`text-sm ${theme.textMuted}`}>Out-of-sample performance across rolling windows</p>
          </div>

          {wfoResults ? (
            <>
              {/* Config Summary */}
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6`}>
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <div className={`text-xs ${theme.textMuted}`}>Training Window</div>
                  <div className={`text-lg font-bold ${theme.text}`}>{WFO_CONFIG.trainingWindow} months</div>
                </div>
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <div className={`text-xs ${theme.textMuted}`}>Test Window</div>
                  <div className={`text-lg font-bold ${theme.text}`}>{WFO_CONFIG.testingWindow} month</div>
                </div>
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <div className={`text-xs ${theme.textMuted}`}>Reoptimize</div>
                  <div className={`text-lg font-bold ${theme.text}`}>Monthly</div>
                </div>
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <div className={`text-xs ${theme.textMuted}`}>Max Turnover</div>
                  <div className={`text-lg font-bold ${theme.text}`}>{REBALANCING_CONFIG.maxTurnover * 100}%</div>
                </div>
              </div>

              {/* Performance Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={theme.textMuted}>Annualized Return</span>
                    <span className={`font-bold ${wfoResults.annualizedReturn >= 14 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {wfoResults.annualizedReturn}%
                    </span>
                  </div>
                  <ProgressBar value={wfoResults.annualizedReturn} max={25} color="emerald" darkMode={darkMode} />
                  <div className={`text-xs mt-1 ${theme.textMuted}`}>Target: 14%</div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className={theme.textMuted}>Sharpe Ratio</span>
                    <span className={`font-bold ${wfoResults.sharpeRatio >= 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {wfoResults.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                  <ProgressBar value={wfoResults.sharpeRatio} max={2} color="blue" darkMode={darkMode} />
                  <div className={`text-xs mt-1 ${theme.textMuted}`}>Target: {'>'} 1.0</div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className={theme.textMuted}>Win Rate</span>
                    <span className={`font-bold ${wfoResults.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {wfoResults.winRate}%
                    </span>
                  </div>
                  <ProgressBar value={wfoResults.winRate} max={100} color="purple" darkMode={darkMode} />
                  <div className={`text-xs mt-1 ${theme.textMuted}`}>{wfoResults.profitablePeriods} profitable out of {wfoResults.totalPeriods} months</div>
                </div>
              </div>

              {/* Methodology Note */}
              <div className={`mt-6 p-4 rounded-xl border ${theme.border}`}>
                <div className="flex items-start gap-3">
                  <Info className={`w-5 h-5 ${theme.textMuted} flex-shrink-0`} />
                  <div className={`text-xs ${theme.textMuted}`}>
                    <p className="font-semibold mb-1">Walk-Forward Methodology</p>
                    <p>Train model on {WFO_CONFIG.trainingWindow} months of data, test on next {WFO_CONFIG.testingWindow} month.
                    Roll forward and repeat. All results shown are out-of-sample (the model never saw the test data during training).
                    This prevents overfitting and simulates real-world performance.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={`text-center py-12 ${theme.textMuted}`}>
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Click "Run Analysis" to run walk-forward optimization</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'filters' && (
        <div className={`rounded-2xl p-6 border ${theme.card}`}>
          <div className="mb-6">
            <h3 className={`text-lg font-bold ${theme.text}`}>Absolute Exclusion Filters</h3>
            <p className={`text-sm ${theme.textMuted}`}>Hard screens applied before factor scoring - "absolute data don't want in portfolio"</p>
          </div>

          {/* Filter Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(ABSOLUTE_EXCLUSION_CRITERIA).map(([key, criteria]) => (
              <div key={key} className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className={`font-semibold ${theme.text}`}>{criteria.name}</span>
                </div>
                <p className={`text-xs ${theme.textMuted}`}>{criteria.reason}</p>
              </div>
            ))}
          </div>

          {/* Exclusion Summary */}
          {excludedStocks && (
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`font-semibold ${theme.text}`}>Universe Filter Results</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {excludedStocks.summary.passed} stocks passed
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${theme.text}`}>{excludedStocks.summary.total}</div>
                  <div className={`text-xs ${theme.textMuted}`}>Total Universe</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{excludedStocks.summary.passed}</div>
                  <div className={`text-xs ${theme.textMuted}`}>Passed Filters</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{excludedStocks.summary.excluded}</div>
                  <div className={`text-xs ${theme.textMuted}`}>Excluded ({excludedStocks.summary.exclusionRate})</div>
                </div>
              </div>

              {/* Excluded stocks list */}
              {excludedStocks.excluded.length > 0 && (
                <div className="mt-4 max-h-48 overflow-y-auto">
                  <div className={`text-xs font-semibold mb-2 ${theme.textMuted}`}>Recently Excluded:</div>
                  <div className="space-y-2">
                    {excludedStocks.excluded.slice(0, 10).map((item, i) => (
                      <div key={i} className={`flex items-center justify-between p-2 rounded ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        <span className={`text-sm ${theme.text}`}>{item.stock.ticker || item.stock.Ticker}</span>
                        <span className="text-xs text-red-400">{item.reasons[0]?.split(':')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={`text-xs ${theme.textMuted} flex flex-wrap gap-4`}>
        <span>Methodology: Shallow NN (2 layers) • Walk-Forward OOS Testing</span>
        <span>Rebalance: Monthly</span>
        <span>Based on: Damodaran, CFA, mlfactor.com research</span>
      </div>
    </div>
  );
};

export default MLFactorDashboard;
