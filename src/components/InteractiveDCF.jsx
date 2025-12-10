// ============================================================================
// INTERACTIVE DCF VALUATION COMPONENT - EMBEDDED VERSION
// Industry best practices: Goldman Sachs, Morgan Stanley, McKinsey
// Smooth, intuitive, real-time interactive valuation
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  AlertTriangle,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  DollarSign,
  Percent,
  Calendar,
  Shield,
  Layers,
  LineChart
} from 'lucide-react';
import { calculateDCF, INDUSTRY_PRESETS, DCF_ASSUMPTIONS } from '../valuation.js';

// ============================================================================
// CUSTOM SLIDER COMPONENT - Smooth, interactive with tooltips
// ============================================================================
const SmoothSlider = ({
  value,
  onChange,
  min,
  max,
  step,
  label,
  unit = '%',
  icon: Icon,
  color = 'blue',
  darkMode,
  description
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const colorClasses = {
    blue: { track: 'from-blue-500 to-blue-600', thumb: 'bg-blue-500 ring-blue-200', text: 'text-blue-600' },
    emerald: { track: 'from-emerald-500 to-emerald-600', thumb: 'bg-emerald-500 ring-emerald-200', text: 'text-emerald-600' },
    purple: { track: 'from-purple-500 to-purple-600', thumb: 'bg-purple-500 ring-purple-200', text: 'text-purple-600' },
    amber: { track: 'from-amber-500 to-amber-600', thumb: 'bg-amber-500 ring-amber-200', text: 'text-amber-600' },
    indigo: { track: 'from-indigo-500 to-indigo-600', thumb: 'bg-indigo-500 ring-indigo-200', text: 'text-indigo-600' },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const formatValue = (val) => {
    if (unit === ' yrs') return `${val.toFixed(0)}${unit}`;
    if (unit === 'x') return `${val.toFixed(2)}${unit}`;
    return `${val.toFixed(1)}${unit}`;
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'} group-hover:${colors.text} transition-colors`} />}
          <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
          {description && (
            <div className="relative">
              <Info
                className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'} cursor-help`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              {showTooltip && (
                <div className={`absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg shadow-xl whitespace-nowrap ${
                  darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'
                }`}>
                  {description}
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${
                    darkMode ? 'border-t-slate-700' : 'border-t-slate-800'
                  }`} />
                </div>
              )}
            </div>
          )}
        </div>
        <div className={`text-sm font-bold tabular-nums transition-all duration-200 ${
          isDragging ? `${colors.text} scale-110` : (darkMode ? 'text-white' : 'text-slate-900')
        }`}>
          {formatValue(value)}
        </div>
      </div>

      <div className="relative h-8 flex items-center">
        {/* Track background */}
        <div className={`absolute inset-x-0 h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

        {/* Filled track */}
        <div
          className={`absolute left-0 h-2 rounded-full bg-gradient-to-r ${colors.track} transition-all duration-75`}
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb indicator */}
        <div
          className={`absolute w-5 h-5 rounded-full shadow-lg transition-transform duration-75 ${colors.thumb} ${
            isDragging ? 'scale-125 ring-4' : 'scale-100 hover:scale-110'
          }`}
          style={{ left: `calc(${percentage}% - 10px)` }}
        />

        {/* Actual input - invisible but functional */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1">
        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{formatValue(min)}</span>
        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{formatValue(max)}</span>
      </div>
    </div>
  );
};

// ============================================================================
// SCENARIO CARD COMPONENT
// ============================================================================
const ScenarioCard = ({ scenario, result, isActive, onClick, darkMode, currentPrice, formatPrice }) => {
  const configs = {
    bull: {
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
      bg: darkMode ? 'bg-emerald-900/20 border-emerald-700 hover:bg-emerald-900/30' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
      activeBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      text: 'text-emerald-500'
    },
    base: {
      icon: Target,
      gradient: 'from-blue-500 to-indigo-600',
      bg: darkMode ? 'bg-blue-900/20 border-blue-700 hover:bg-blue-900/30' : 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      activeBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      text: 'text-blue-500'
    },
    bear: {
      icon: TrendingDown,
      gradient: 'from-red-500 to-rose-600',
      bg: darkMode ? 'bg-red-900/20 border-red-700 hover:bg-red-900/30' : 'bg-red-50 border-red-200 hover:bg-red-100',
      activeBg: 'bg-gradient-to-br from-red-500 to-rose-600',
      text: 'text-red-500'
    }
  };

  const config = configs[scenario.key];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 transform text-left w-full ${
        isActive
          ? `${config.activeBg} text-white border-transparent shadow-lg scale-[1.02]`
          : `${config.bg} ${darkMode ? 'text-white' : 'text-slate-900'}`
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : (darkMode ? 'bg-slate-700' : 'bg-white')}`}>
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : config.text}`} />
        </div>
        <div>
          <h4 className="font-bold">{scenario.name}</h4>
          <p className={`text-xs ${isActive ? 'text-white/70' : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
            {scenario.description}
          </p>
        </div>
      </div>

      {result && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isActive ? 'text-white/70' : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
              Fair Value
            </span>
            <span className="font-bold text-lg">{formatPrice(result.fairValue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isActive ? 'text-white/70' : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
              Upside
            </span>
            <span className={`font-bold ${result.upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.upside >= 0 ? '+' : ''}{result.upside?.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {isActive && (
        <div className="absolute top-2 right-2">
          <Sparkles className="w-4 h-4 text-white/50" />
        </div>
      )}
    </button>
  );
};

// ============================================================================
// MONTE CARLO SIMULATION
// ============================================================================
const runMonteCarloSimulation = (stock, region, baseAssumptions, iterations = 1000) => {
  const results = [];

  const normalRandom = (mean, std) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * std;
  };

  for (let i = 0; i < iterations; i++) {
    const simAssumptions = {
      initialGrowth: normalRandom(baseAssumptions.initialGrowth || 10, Math.abs(baseAssumptions.initialGrowth || 10) * 0.20),
      terminalGrowth: Math.max(1, Math.min(6, normalRandom(baseAssumptions.terminalGrowth || 3, 0.5))),
      beta: Math.max(0.4, Math.min(2.5, normalRandom(baseAssumptions.beta || 1, 0.15))),
      equityRiskPremium: normalRandom(baseAssumptions.equityRiskPremium || 5.5, 0.5),
      forecastYears: baseAssumptions.forecastYears,
      riskFreeRate: baseAssumptions.riskFreeRate,
      countryRiskPremium: baseAssumptions.countryRiskPremium,
      taxRate: baseAssumptions.taxRate
    };

    try {
      const dcfResult = calculateDCF(stock, region, simAssumptions);
      if (dcfResult?.fairValue && !isNaN(dcfResult.fairValue)) {
        results.push(dcfResult.fairValue);
      }
    } catch (e) {}
  }

  if (results.length === 0) return null;

  results.sort((a, b) => a - b);

  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  const getPercentile = (p) => results[Math.floor(results.length * p)] || 0;

  // Create histogram
  const min = results[0];
  const max = results[results.length - 1];
  const bucketCount = 25;
  const bucketSize = (max - min) / bucketCount;
  const histogram = Array(bucketCount).fill(0);

  results.forEach(v => {
    const bucket = Math.min(bucketCount - 1, Math.floor((v - min) / bucketSize));
    histogram[bucket]++;
  });

  return {
    mean,
    median: getPercentile(0.5),
    p5: getPercentile(0.05),
    p25: getPercentile(0.25),
    p75: getPercentile(0.75),
    p95: getPercentile(0.95),
    min, max, histogram, bucketSize,
    count: results.length
  };
};

// ============================================================================
// MAIN EMBEDDED COMPONENT
// ============================================================================
const InteractiveDCF = ({ stock, region, darkMode }) => {
  const baseParams = DCF_ASSUMPTIONS[region] || DCF_ASSUMPTIONS.US;

  // Initialize assumptions from stock data
  const [assumptions, setAssumptions] = useState(() => {
    const revenueGrowth = stock?.["Revenue Growth"] || 8;
    const initialGrowth = Math.min(35, Math.max(-15, revenueGrowth));

    return {
      initialGrowth: Math.round(initialGrowth * 10) / 10,
      terminalGrowth: baseParams.terminalGrowth,
      forecastYears: revenueGrowth > 15 ? 10 : 5,
      beta: stock?.Beta || 1.0,
      riskFreeRate: baseParams.riskFreeRate,
      equityRiskPremium: baseParams.equityRiskPremium,
      countryRiskPremium: baseParams.countryRiskPremium,
      taxRate: baseParams.taxRate
    };
  });

  const [activeScenario, setActiveScenario] = useState('base');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [monteCarloResults, setMonteCarloResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('assumptions');

  // Reset when stock changes
  useEffect(() => {
    if (stock) {
      const revenueGrowth = stock["Revenue Growth"] || 8;
      const initialGrowth = Math.min(35, Math.max(-15, revenueGrowth));

      setAssumptions({
        initialGrowth: Math.round(initialGrowth * 10) / 10,
        terminalGrowth: baseParams.terminalGrowth,
        forecastYears: revenueGrowth > 15 ? 10 : 5,
        beta: stock.Beta || 1.0,
        riskFreeRate: baseParams.riskFreeRate,
        equityRiskPremium: baseParams.equityRiskPremium,
        countryRiskPremium: baseParams.countryRiskPremium,
        taxRate: baseParams.taxRate
      });
      setMonteCarloResults(null);
      setActiveScenario('base');
    }
  }, [stock?.ticker]);

  // Calculate DCF
  const dcfResult = useMemo(() => {
    if (!stock) return null;
    try {
      return calculateDCF(stock, region, assumptions);
    } catch (e) {
      return null;
    }
  }, [stock, region, assumptions]);

  // Scenario definitions
  const scenarios = {
    bull: { key: 'bull', name: 'Bull Case', description: 'Optimistic outlook', mult: { growth: 1.25, wacc: 0.92 } },
    base: { key: 'base', name: 'Base Case', description: 'Most likely scenario', mult: { growth: 1.0, wacc: 1.0 } },
    bear: { key: 'bear', name: 'Bear Case', description: 'Conservative outlook', mult: { growth: 0.75, wacc: 1.12 } }
  };

  // Calculate all scenarios
  const scenarioResults = useMemo(() => {
    if (!stock) return {};
    const results = {};

    Object.entries(scenarios).forEach(([key, scenario]) => {
      const scenarioAssumptions = {
        ...assumptions,
        initialGrowth: assumptions.initialGrowth * scenario.mult.growth,
        equityRiskPremium: assumptions.equityRiskPremium * scenario.mult.wacc
      };
      try {
        results[key] = calculateDCF(stock, region, scenarioAssumptions);
      } catch (e) {
        results[key] = null;
      }
    });

    return results;
  }, [stock, region, assumptions]);

  // Sensitivity matrix
  const sensitivityMatrix = useMemo(() => {
    if (!dcfResult || !stock) return null;

    const baseWACC = dcfResult.wacc;
    const baseGrowth = assumptions.terminalGrowth;
    const waccSteps = [-2, -1, 0, 1, 2];
    const growthSteps = [-1, -0.5, 0, 0.5, 1];

    const waccValues = waccSteps.map(s => Math.round((baseWACC + s) * 10) / 10);
    const growthValues = growthSteps.map(s => Math.max(1, Math.round((baseGrowth + s) * 10) / 10));

    const matrix = waccValues.map((wacc, ri) =>
      growthValues.map((growth, ci) => {
        if (wacc <= growth) return { invalid: true };
        try {
          const result = calculateDCF(stock, region, { ...assumptions, terminalGrowth: growth, wacc });
          return { fairValue: result.fairValue, upside: result.upside, isBase: ri === 2 && ci === 2 };
        } catch {
          return { invalid: true };
        }
      })
    );

    return { matrix, waccValues, growthValues };
  }, [stock, region, assumptions, dcfResult]);

  // Run Monte Carlo
  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const results = runMonteCarloSimulation(stock, region, assumptions, 1000);
      setMonteCarloResults(results);
      setIsSimulating(false);
    }, 50);
  };

  // Format helpers
  const formatPrice = (value) => {
    if (!value) return 'N/A';
    if (region === 'Indonesia') return `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatLarge = (value) => {
    if (!value) return 'N/A';
    const prefix = region === 'Indonesia' ? 'Rp ' : '$';
    if (value >= 1e12) return `${prefix}${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${prefix}${(value / 1e9).toFixed(1)}B`;
    return `${prefix}${(value / 1e6).toFixed(0)}M`;
  };

  // Apply preset
  const applyPreset = (key) => {
    const preset = INDUSTRY_PRESETS[key];
    if (preset) {
      setAssumptions(prev => ({
        ...prev,
        initialGrowth: preset.initialGrowth || prev.initialGrowth,
        terminalGrowth: preset.terminalGrowth || prev.terminalGrowth,
        forecastYears: preset.forecastYears || prev.forecastYears
      }));
    }
  };

  // Reset
  const resetAssumptions = () => {
    const revenueGrowth = stock?.["Revenue Growth"] || 8;
    const initialGrowth = Math.min(35, Math.max(-15, revenueGrowth));
    setAssumptions({
      initialGrowth: Math.round(initialGrowth * 10) / 10,
      terminalGrowth: baseParams.terminalGrowth,
      forecastYears: revenueGrowth > 15 ? 10 : 5,
      beta: stock?.Beta || 1.0,
      riskFreeRate: baseParams.riskFreeRate,
      equityRiskPremium: baseParams.equityRiskPremium,
      countryRiskPremium: baseParams.countryRiskPremium,
      taxRate: baseParams.taxRate
    });
    setMonteCarloResults(null);
  };

  if (!stock) return null;

  const theme = {
    card: darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200',
    text: darkMode ? 'text-white' : 'text-slate-900',
    textMuted: darkMode ? 'text-slate-400' : 'text-slate-500',
    border: darkMode ? 'border-slate-700' : 'border-slate-200'
  };

  return (
    <div className="space-y-6">
      {/* Results Header - Always Visible */}
      <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200'}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-white'} border ${theme.border}`}>
            <div className={`text-xs font-bold uppercase mb-1 ${theme.textMuted}`}>Current Price</div>
            <div className={`text-2xl font-bold ${theme.text}`}>{formatPrice(stock.Price)}</div>
          </div>

          <div className={`p-4 rounded-xl bg-gradient-to-br ${dcfResult?.upside >= 0 ? 'from-blue-500 to-indigo-600' : 'from-red-500 to-rose-600'} text-white`}>
            <div className="text-xs font-bold uppercase mb-1 text-white/70">Fair Value (DCF)</div>
            <div className="text-2xl font-bold">{formatPrice(dcfResult?.fairValue)}</div>
          </div>

          <div className={`p-4 rounded-xl ${dcfResult?.upside >= 0 ? (darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50') : (darkMode ? 'bg-red-900/30' : 'bg-red-50')} border ${theme.border}`}>
            <div className={`text-xs font-bold uppercase mb-1 ${dcfResult?.upside >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>Upside/Downside</div>
            <div className={`text-2xl font-bold ${dcfResult?.upside >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {dcfResult?.upside >= 0 ? '+' : ''}{dcfResult?.upside?.toFixed(1)}%
            </div>
          </div>

          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-white'} border ${theme.border}`}>
            <div className={`text-xs font-bold uppercase mb-1 ${theme.textMuted}`}>WACC</div>
            <div className={`text-2xl font-bold ${theme.text}`}>{dcfResult?.wacc?.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`flex gap-1 p-1 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {[
          { id: 'assumptions', label: 'Assumptions', icon: Sliders },
          { id: 'scenarios', label: 'Scenarios', icon: Layers },
          { id: 'sensitivity', label: 'Sensitivity', icon: BarChart3 },
          { id: 'montecarlo', label: 'Monte Carlo', icon: Activity }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : `${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ASSUMPTIONS TAB */}
      {activeTab === 'assumptions' && (
        <div className={`rounded-2xl p-6 border ${theme.card}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${theme.text}`}>Model Assumptions</h3>
              <p className={`text-sm ${theme.textMuted}`}>Adjust parameters to see real-time valuation changes</p>
            </div>
            <button
              onClick={resetAssumptions}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Growth Assumptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <SmoothSlider
              value={assumptions.initialGrowth}
              onChange={(v) => setAssumptions(prev => ({ ...prev, initialGrowth: v }))}
              min={-10} max={40} step={0.5}
              label="Initial Growth Rate"
              unit="%"
              icon={TrendingUp}
              color="emerald"
              darkMode={darkMode}
              description="Expected growth in first forecast year"
            />

            <SmoothSlider
              value={assumptions.terminalGrowth}
              onChange={(v) => setAssumptions(prev => ({ ...prev, terminalGrowth: v }))}
              min={1} max={6} step={0.25}
              label="Terminal Growth Rate"
              unit="%"
              icon={Target}
              color="blue"
              darkMode={darkMode}
              description="Perpetual growth rate (should not exceed GDP growth)"
            />

            <SmoothSlider
              value={assumptions.forecastYears}
              onChange={(v) => setAssumptions(prev => ({ ...prev, forecastYears: v }))}
              min={3} max={15} step={1}
              label="Forecast Period"
              unit=" yrs"
              icon={Calendar}
              color="purple"
              darkMode={darkMode}
              description="Length of explicit forecast period"
            />

            <SmoothSlider
              value={assumptions.beta}
              onChange={(v) => setAssumptions(prev => ({ ...prev, beta: v }))}
              min={0.4} max={2.5} step={0.05}
              label="Beta"
              unit="x"
              icon={Activity}
              color="amber"
              darkMode={darkMode}
              description="Systematic risk relative to market"
            />
          </div>

          {/* Advanced WACC Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 text-sm font-semibold mb-4 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced WACC Components
          </button>

          {showAdvanced && (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl mb-6 ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
              <SmoothSlider
                value={assumptions.riskFreeRate}
                onChange={(v) => setAssumptions(prev => ({ ...prev, riskFreeRate: v }))}
                min={1} max={10} step={0.1}
                label="Risk-Free Rate"
                unit="%"
                icon={Shield}
                color="blue"
                darkMode={darkMode}
                description="10-year government bond yield"
              />

              <SmoothSlider
                value={assumptions.equityRiskPremium}
                onChange={(v) => setAssumptions(prev => ({ ...prev, equityRiskPremium: v }))}
                min={3} max={10} step={0.25}
                label="Equity Risk Premium"
                unit="%"
                icon={BarChart3}
                color="indigo"
                darkMode={darkMode}
                description="Expected excess return over risk-free rate"
              />

              <SmoothSlider
                value={assumptions.countryRiskPremium}
                onChange={(v) => setAssumptions(prev => ({ ...prev, countryRiskPremium: v }))}
                min={0} max={8} step={0.25}
                label="Country Risk Premium"
                unit="%"
                icon={AlertTriangle}
                color="amber"
                darkMode={darkMode}
                description="Additional risk for emerging markets"
              />

              <SmoothSlider
                value={assumptions.taxRate}
                onChange={(v) => setAssumptions(prev => ({ ...prev, taxRate: v }))}
                min={15} max={35} step={1}
                label="Tax Rate"
                unit="%"
                icon={Percent}
                color="purple"
                darkMode={darkMode}
                description="Corporate income tax rate"
              />
            </div>
          )}

          {/* Industry Presets */}
          <div>
            <h4 className={`text-sm font-bold uppercase mb-3 ${theme.textMuted}`}>Quick Industry Presets</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(INDUSTRY_PRESETS).slice(0, 10).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                      : 'bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700'
                  }`}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Flow Chart */}
          {dcfResult?.projectedFCFs && (
            <div className="mt-6">
              <h4 className={`text-sm font-bold uppercase mb-4 ${theme.textMuted}`}>Projected Free Cash Flows</h4>
              <div className="flex items-end gap-2 h-32">
                {dcfResult.projectedFCFs.map((fcf, i) => {
                  const maxFCF = Math.max(...dcfResult.projectedFCFs);
                  const height = (fcf / maxFCF) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                      <div
                        className={`w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-500`}
                        style={{ height: `${height}%` }}
                      />
                      <div className={`text-xs font-bold mt-2 ${theme.text}`}>Y{i + 1}</div>
                      <div className={`text-xs ${theme.textMuted}`}>{formatLarge(fcf)}</div>
                      <div className={`text-xs ${dcfResult.growthRates[i] >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {dcfResult.growthRates[i]?.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCENARIOS TAB */}
      {activeTab === 'scenarios' && (
        <div className={`rounded-2xl p-6 border ${theme.card}`}>
          <h3 className={`text-lg font-bold mb-6 ${theme.text}`}>Scenario Analysis</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <ScenarioCard
                key={key}
                scenario={scenario}
                result={scenarioResults[key]}
                isActive={activeScenario === key}
                onClick={() => setActiveScenario(key)}
                darkMode={darkMode}
                currentPrice={stock.Price}
                formatPrice={formatPrice}
              />
            ))}
          </div>

          {/* Football Field Chart */}
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <h4 className={`text-sm font-bold uppercase mb-4 ${theme.textMuted}`}>Valuation Range</h4>
            <div className="relative h-12 mb-8">
              {(() => {
                const values = Object.values(scenarioResults).filter(r => r?.fairValue).map(r => r.fairValue);
                if (values.length === 0) return null;

                const minVal = Math.min(...values);
                const maxVal = Math.max(...values);
                const range = maxVal - minVal;
                const chartMin = minVal - range * 0.1;
                const chartMax = maxVal + range * 0.1;
                const chartRange = chartMax - chartMin;
                const currentPos = ((stock.Price - chartMin) / chartRange) * 100;

                return (
                  <>
                    <div className={`absolute inset-0 rounded-lg ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`} />
                    <div
                      className="absolute inset-y-0 bg-gradient-to-r from-red-400 via-blue-400 to-emerald-400 rounded-lg"
                      style={{
                        left: `${((minVal - chartMin) / chartRange) * 100}%`,
                        right: `${((chartMax - maxVal) / chartRange) * 100}%`
                      }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-yellow-500 z-10"
                      style={{ left: `${Math.max(0, Math.min(100, currentPos))}%` }}
                    >
                      <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap px-2 py-1 rounded ${darkMode ? 'bg-yellow-500 text-black' : 'bg-yellow-400 text-black'}`}>
                        Current: {formatPrice(stock.Price)}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex justify-between text-sm">
              <div className="text-red-500">
                <div className="font-bold">{formatPrice(scenarioResults.bear?.fairValue)}</div>
                <div className={theme.textMuted}>Bear</div>
              </div>
              <div className="text-blue-500 text-center">
                <div className="font-bold">{formatPrice(scenarioResults.base?.fairValue)}</div>
                <div className={theme.textMuted}>Base</div>
              </div>
              <div className="text-emerald-500 text-right">
                <div className="font-bold">{formatPrice(scenarioResults.bull?.fairValue)}</div>
                <div className={theme.textMuted}>Bull</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SENSITIVITY TAB */}
      {activeTab === 'sensitivity' && sensitivityMatrix && (
        <div className={`rounded-2xl p-6 border ${theme.card}`}>
          <h3 className={`text-lg font-bold mb-2 ${theme.text}`}>Sensitivity Analysis</h3>
          <p className={`text-sm mb-6 ${theme.textMuted}`}>WACC vs Terminal Growth Rate</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className={`p-2 text-xs font-bold ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} rounded-tl-lg`}>
                    WACC \ TG
                  </th>
                  {sensitivityMatrix.growthValues.map((g, i) => (
                    <th key={i} className={`p-2 text-xs font-bold text-center ${
                      i === 2 ? 'bg-blue-600 text-white' : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')
                    } ${i === sensitivityMatrix.growthValues.length - 1 ? 'rounded-tr-lg' : ''}`}>
                      {g.toFixed(1)}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sensitivityMatrix.matrix.map((row, ri) => (
                  <tr key={ri}>
                    <td className={`p-2 text-xs font-bold text-center ${
                      ri === 2 ? 'bg-blue-600 text-white' : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')
                    } ${ri === sensitivityMatrix.matrix.length - 1 ? 'rounded-bl-lg' : ''}`}>
                      {sensitivityMatrix.waccValues[ri].toFixed(1)}%
                    </td>
                    {row.map((cell, ci) => {
                      let bg, text;
                      if (cell.invalid) {
                        bg = darkMode ? 'bg-slate-800' : 'bg-slate-200';
                        text = darkMode ? 'text-slate-600' : 'text-slate-400';
                      } else if (cell.isBase) {
                        bg = 'bg-blue-600';
                        text = 'text-white';
                      } else if (cell.upside >= 30) {
                        bg = darkMode ? 'bg-emerald-700' : 'bg-emerald-500';
                        text = 'text-white';
                      } else if (cell.upside >= 0) {
                        bg = darkMode ? 'bg-emerald-900/50' : 'bg-emerald-100';
                        text = darkMode ? 'text-emerald-300' : 'text-emerald-700';
                      } else if (cell.upside >= -30) {
                        bg = darkMode ? 'bg-amber-900/50' : 'bg-amber-100';
                        text = darkMode ? 'text-amber-300' : 'text-amber-700';
                      } else {
                        bg = darkMode ? 'bg-red-900/50' : 'bg-red-100';
                        text = darkMode ? 'text-red-300' : 'text-red-700';
                      }

                      return (
                        <td key={ci} className={`p-2 text-center ${bg} ${text} ${
                          ri === sensitivityMatrix.matrix.length - 1 && ci === row.length - 1 ? 'rounded-br-lg' : ''
                        }`}>
                          {cell.invalid ? 'N/A' : (
                            <div>
                              <div className="font-bold text-xs">{formatPrice(cell.fairValue)}</div>
                              <div className="text-[10px] opacity-75">{cell.upside >= 0 ? '+' : ''}{cell.upside?.toFixed(0)}%</div>
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
        </div>
      )}

      {/* MONTE CARLO TAB */}
      {activeTab === 'montecarlo' && (
        <div className={`rounded-2xl p-6 border ${theme.card}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${theme.text}`}>Monte Carlo Simulation</h3>
              <p className={`text-sm ${theme.textMuted}`}>1,000 iterations with randomized assumptions</p>
            </div>
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                isSimulating
                  ? 'bg-slate-400 cursor-wait'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
              }`}
            >
              {isSimulating ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Running...</>
              ) : (
                <><Play className="w-4 h-4" /> Run Simulation</>
              )}
            </button>
          </div>

          {monteCarloResults ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-red-900/30' : 'bg-red-50'} border ${theme.border}`}>
                  <div className="text-xs font-bold text-red-500 mb-1">5th Percentile</div>
                  <div className={`text-lg font-bold ${theme.text}`}>{formatPrice(monteCarloResults.p5)}</div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-white'} border ${theme.border}`}>
                  <div className={`text-xs font-bold mb-1 ${theme.textMuted}`}>Median</div>
                  <div className={`text-lg font-bold ${theme.text}`}>{formatPrice(monteCarloResults.median)}</div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-white'} border ${theme.border}`}>
                  <div className={`text-xs font-bold mb-1 ${theme.textMuted}`}>Mean</div>
                  <div className={`text-lg font-bold ${theme.text}`}>{formatPrice(monteCarloResults.mean)}</div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'} border ${theme.border}`}>
                  <div className="text-xs font-bold text-emerald-500 mb-1">95th Percentile</div>
                  <div className={`text-lg font-bold ${theme.text}`}>{formatPrice(monteCarloResults.p95)}</div>
                </div>
              </div>

              {/* Histogram */}
              <div className={`p-4 rounded-xl mb-6 ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                <h4 className={`text-sm font-bold uppercase mb-4 ${theme.textMuted}`}>Distribution</h4>
                <div className="flex items-end gap-px h-32">
                  {monteCarloResults.histogram.map((count, i) => {
                    const maxCount = Math.max(...monteCarloResults.histogram);
                    const height = (count / maxCount) * 100;
                    const value = monteCarloResults.min + (i * monteCarloResults.bucketSize);
                    const isAtPrice = value <= stock.Price && stock.Price < value + monteCarloResults.bucketSize;

                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${isAtPrice ? 'bg-yellow-500' : 'bg-blue-500 hover:bg-blue-400'}`}
                        style={{ height: `${height}%` }}
                        title={`${formatPrice(value)}: ${count} simulations`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className={theme.textMuted}>{formatPrice(monteCarloResults.min)}</span>
                  <span className="text-yellow-500 font-bold">Current: {formatPrice(stock.Price)}</span>
                  <span className={theme.textMuted}>{formatPrice(monteCarloResults.max)}</span>
                </div>
              </div>

              {/* Probability */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-white'} border ${theme.border}`}>
                <h4 className={`text-sm font-bold mb-3 ${theme.text}`}>Probability Analysis</h4>
                {(() => {
                  const aboveCount = monteCarloResults.histogram.reduce((acc, count, i) => {
                    const value = monteCarloResults.min + (i * monteCarloResults.bucketSize);
                    return value > stock.Price ? acc + count : acc;
                  }, 0);
                  const probAbove = (aboveCount / monteCarloResults.count) * 100;

                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={theme.textMuted}>Probability fair value exceeds current price:</span>
                        <span className={`font-bold ${probAbove >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {probAbove.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme.textMuted}>90% confidence range:</span>
                        <span className={`font-bold ${theme.text}`}>
                          {formatPrice(monteCarloResults.p5)} - {formatPrice(monteCarloResults.p95)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            <div className={`p-8 rounded-xl border-2 border-dashed ${theme.border} text-center`}>
              <Activity className={`w-12 h-12 mx-auto mb-4 ${theme.textMuted}`} />
              <p className={`${theme.text} mb-2`}>Run a simulation to see the probability distribution</p>
              <p className={`text-sm ${theme.textMuted}`}>This randomizes growth, beta, and risk premium across 1,000 iterations</p>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className={`flex flex-wrap gap-4 text-xs ${theme.textMuted}`}>
        <span>Method: Two-Stage DCF with H-Model</span>
        <span>FCF: {dcfResult?.fcfMethod}</span>
        <span>Terminal Value: {dcfResult?.terminalValuePct}% of EV</span>
        <span className={dcfResult?.confidence === 'High' ? 'text-emerald-500' : dcfResult?.confidence === 'Medium' ? 'text-amber-500' : 'text-red-500'}>
          Confidence: {dcfResult?.confidence}
        </span>
      </div>
    </div>
  );
};

export default InteractiveDCF;
