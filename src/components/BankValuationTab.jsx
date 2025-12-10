// ============================================================================
// NATAN EQUITY RESEARCH - BANK VALUATION TAB COMPONENT
// Professional-grade bank valuation UI based on IB/Damodaran methodology
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Building2, TrendingUp, TrendingDown, DollarSign, Shield, Activity,
  BarChart3, PieChart, Target, AlertCircle, CheckCircle, Info,
  ChevronDown, ChevronUp, Calculator, Award
} from 'lucide-react';

import {
  INDONESIAN_BANKS_DATA,
  calculateBankValuation,
  calculateBankPeerComparison,
  calculateBankCostOfEquity,
  calculateDDM2Stage,
  calculateResidualIncome,
  calculateFairPB,
  calculateBankQualityScore
} from '../utils/bankValuation';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const MetricCard = ({ label, value, suffix = '', trend, subtext, darkMode }) => (
  <div className={`rounded-lg p-4 border transition-all ${
    darkMode
      ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
      : 'bg-white border-slate-200 hover:shadow-md'
  }`}>
    <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
      {label}
    </div>
    <div className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
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

const ScoreBar = ({ score, max, label, darkMode }) => {
  const percentage = (score / max) * 100;
  const color = percentage >= 80 ? 'emerald' : percentage >= 60 ? 'blue' : percentage >= 40 ? 'amber' : 'red';

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
          className={`h-full rounded-full bg-${color}-500 transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const ValuationModelCard = ({ model, result, darkMode }) => {
  const [expanded, setExpanded] = useState(false);

  const bgColor = result.upside >= 15 ? 'emerald' : result.upside >= 0 ? 'blue' : result.upside >= -15 ? 'amber' : 'red';

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
              {result.recommendation?.rating || 'N/A'}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              IDR {result.intrinsicValue?.toLocaleString() || result.fairPrice?.toLocaleString() || 'N/A'}
            </div>
            <div className={`text-sm font-semibold ${
              result.upside >= 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {result.upside >= 0 ? '+' : ''}{result.upside?.toFixed(1)}%
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
            {result.costOfEquity && (
              <div>
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Cost of Equity:</span>
                <span className={`ml-2 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {result.costOfEquity}%
                </span>
              </div>
            )}
            {result.terminalGrowth && (
              <div>
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Terminal Growth:</span>
                <span className={`ml-2 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {result.terminalGrowth}%
                </span>
              </div>
            )}
            {result.currentROE && (
              <div>
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Current ROE:</span>
                <span className={`ml-2 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {result.currentROE}%
                </span>
              </div>
            )}
            {result.spreadOverKe && (
              <div>
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>ROE - Ke Spread:</span>
                <span className={`ml-2 font-semibold ${result.spreadOverKe >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {result.spreadOverKe >= 0 ? '+' : ''}{result.spreadOverKe}%
                </span>
              </div>
            )}
            {result.fairPB && (
              <div>
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Fair P/B:</span>
                <span className={`ml-2 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {result.fairPB}x
                </span>
              </div>
            )}
            {result.currentPB && (
              <div>
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Current P/B:</span>
                <span className={`ml-2 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {result.currentPB}x
                </span>
              </div>
            )}
            {result.isValueCreator !== undefined && (
              <div className="col-span-2">
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Value Creation:</span>
                <span className={`ml-2 font-semibold ${result.isValueCreator ? 'text-emerald-500' : 'text-red-500'}`}>
                  {result.valueCreationRating || (result.isValueCreator ? 'Creating Value' : 'Destroying Value')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BankValuationTab({ darkMode = false }) {
  const [selectedBank, setSelectedBank] = useState(INDONESIAN_BANKS_DATA[0]);
  const [showMethodology, setShowMethodology] = useState(false);

  // Calculate all valuations for selected bank
  const valuation = useMemo(() => {
    return calculateBankValuation(selectedBank, 'Indonesia');
  }, [selectedBank]);

  const peerComparison = useMemo(() => {
    return calculateBankPeerComparison(selectedBank, INDONESIAN_BANKS_DATA);
  }, [selectedBank]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${theme.text}`}>
            <Building2 className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
            Bank Valuation
          </h2>
          <p className={`text-sm ${theme.textSecondary}`}>
            Damodaran methodology: DDM, Residual Income, Fair P/B
          </p>
        </div>

        {/* Bank Selector */}
        <select
          value={selectedBank.ticker}
          onChange={(e) => setSelectedBank(INDONESIAN_BANKS_DATA.find(b => b.ticker === e.target.value))}
          className={`px-4 py-2 rounded-lg border font-medium ${
            darkMode
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          {INDONESIAN_BANKS_DATA.map(bank => (
            <option key={bank.ticker} value={bank.ticker}>
              {bank.ticker} - {bank.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bank Summary Card */}
      <div className={`rounded-xl p-6 border-2 ${
        darkMode
          ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700/50'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold ${theme.text}`}>{selectedBank.ticker}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                selectedBank.category === 'Private'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {selectedBank.category}
              </span>
            </div>
            <div className={`text-lg ${theme.textSecondary}`}>{selectedBank.name}</div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <div className={`text-sm ${theme.textMuted}`}>Current Price</div>
              <div className={`text-2xl font-bold ${theme.text}`}>
                IDR {selectedBank.price.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${theme.textMuted}`}>Fair Value (Weighted)</div>
              <div className="text-2xl font-bold text-blue-500">
                IDR {valuation.weightedIntrinsicValue.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${theme.textMuted}`}>Upside</div>
              <div className={`text-2xl font-bold ${
                valuation.weightedUpside >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {valuation.weightedUpside >= 0 ? '+' : ''}{valuation.weightedUpside}%
              </div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${theme.textMuted}`}>Recommendation</div>
              <div className={`text-xl font-bold px-3 py-1 rounded-full ${
                valuation.recommendation.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                valuation.recommendation.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                valuation.recommendation.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {valuation.recommendation.rating}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
          <Activity className="w-5 h-5" />
          Key Bank Metrics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <MetricCard label="ROE" value={selectedBank.roe} suffix="%" darkMode={darkMode}
            subtext={selectedBank.roe >= 15 ? 'Strong' : 'Moderate'} />
          <MetricCard label="NIM" value={selectedBank.nim} suffix="%" darkMode={darkMode}
            subtext="Net Interest Margin" />
          <MetricCard label="NPL Ratio" value={selectedBank.nplRatio} suffix="%" darkMode={darkMode}
            subtext={selectedBank.nplRatio <= 2 ? 'Healthy' : 'Monitor'} />
          <MetricCard label="CAR" value={selectedBank.car} suffix="%" darkMode={darkMode}
            subtext={selectedBank.car >= 20 ? 'Well-capitalized' : 'Adequate'} />
          <MetricCard label="LDR" value={selectedBank.ldr} suffix="%" darkMode={darkMode}
            subtext={selectedBank.ldr >= 78 && selectedBank.ldr <= 92 ? 'Optimal' : 'Review'} />
          <MetricCard label="CASA" value={selectedBank.casaRatio} suffix="%" darkMode={darkMode}
            subtext="Low-cost funding" />
        </div>
      </div>

      {/* Valuation Models Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${theme.text}`}>
            <Calculator className="w-5 h-5" />
            Valuation Models
          </h3>
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className={`text-sm flex items-center gap-1 ${theme.textSecondary} hover:underline`}
          >
            <Info className="w-4 h-4" />
            {showMethodology ? 'Hide' : 'Show'} Methodology
          </button>
        </div>

        {showMethodology && (
          <div className={`rounded-lg p-4 mb-4 border ${theme.section} ${theme.border}`}>
            <div className={`text-sm space-y-2 ${theme.textSecondary}`}>
              <p><strong>DDM (Dividend Discount Model):</strong> Values bank based on present value of future dividends. Best for dividend-paying banks.</p>
              <p><strong>Residual Income:</strong> Value = Book Value + PV of Excess Returns (ROE - Cost of Equity). Damodaran's preferred method for banks.</p>
              <p><strong>Fair P/B (Gordon Growth):</strong> Fair P/B = (ROE - g) / (Ke - g). Core relationship for bank valuation.</p>
              <p><strong>Weighted Average:</strong> DDM 2-Stage (25%) + DDM 3-Stage (25%) + Residual Income (35%) + Fair P/B (15%)</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValuationModelCard
            model="DDM (2-Stage)"
            result={valuation.models.ddm2Stage}
            darkMode={darkMode}
          />
          <ValuationModelCard
            model="DDM (3-Stage)"
            result={valuation.models.ddm3Stage}
            darkMode={darkMode}
          />
          <ValuationModelCard
            model="Residual Income"
            result={valuation.models.residualIncome}
            darkMode={darkMode}
          />
          <ValuationModelCard
            model="Fair P/B (Gordon)"
            result={valuation.models.gordonPB}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Quality Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Breakdown */}
        <div className={`rounded-xl p-6 border ${theme.card}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
            <Award className="w-5 h-5" />
            Quality Score
            <span className={`ml-auto text-2xl font-bold ${
              valuation.qualityScore.rating.color === 'emerald' ? 'text-emerald-500' :
              valuation.qualityScore.rating.color === 'blue' ? 'text-blue-500' :
              valuation.qualityScore.rating.color === 'amber' ? 'text-amber-500' :
              'text-red-500'
            }`}>
              {valuation.qualityScore.total}/100
            </span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              valuation.qualityScore.rating.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
              valuation.qualityScore.rating.color === 'blue' ? 'bg-blue-100 text-blue-700' :
              valuation.qualityScore.rating.color === 'amber' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              Grade {valuation.qualityScore.rating.grade}
            </span>
          </h3>

          <ScoreBar score={valuation.qualityScore.breakdown.profitability} max={30}
            label="Profitability (ROE, NIM, C/I)" darkMode={darkMode} />
          <ScoreBar score={valuation.qualityScore.breakdown.assetQuality} max={25}
            label="Asset Quality (NPL, Coverage)" darkMode={darkMode} />
          <ScoreBar score={valuation.qualityScore.breakdown.capitalStrength} max={20}
            label="Capital Strength (CAR, Tier 1)" darkMode={darkMode} />
          <ScoreBar score={valuation.qualityScore.breakdown.liquidity} max={15}
            label="Liquidity (LDR, CASA)" darkMode={darkMode} />
          <ScoreBar score={valuation.qualityScore.breakdown.growth} max={10}
            label="Growth (Loans, NII)" darkMode={darkMode} />

          {/* Strengths & Weaknesses */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className={`text-xs font-bold uppercase mb-2 text-emerald-500`}>Strengths</div>
              {valuation.qualityScore.strengths.length > 0 ? (
                valuation.qualityScore.strengths.map((s, i) => (
                  <div key={i} className={`text-sm flex items-center gap-1 ${theme.textSecondary}`}>
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    {s}
                  </div>
                ))
              ) : (
                <div className={`text-sm ${theme.textMuted}`}>No major strengths identified</div>
              )}
            </div>
            <div>
              <div className={`text-xs font-bold uppercase mb-2 text-red-500`}>Risks</div>
              {valuation.qualityScore.weaknesses.length > 0 ? (
                valuation.qualityScore.weaknesses.map((w, i) => (
                  <div key={i} className={`text-sm flex items-center gap-1 ${theme.textSecondary}`}>
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    {w}
                  </div>
                ))
              ) : (
                <div className={`text-sm ${theme.textMuted}`}>No major risks identified</div>
              )}
            </div>
          </div>
        </div>

        {/* Peer Comparison */}
        <div className={`rounded-xl p-6 border ${theme.card}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
            <BarChart3 className="w-5 h-5" />
            Peer Comparison
            <span className={`ml-auto text-sm font-normal ${theme.textMuted}`}>
              vs {peerComparison.peerCount} peers
            </span>
          </h3>

          <div className={`mb-4 p-3 rounded-lg ${theme.section}`}>
            <div className="flex justify-between items-center">
              <span className={theme.textSecondary}>P/B vs Peer Median</span>
              <span className={`font-bold ${
                peerComparison.pbVsPeerMedian > 0 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {peerComparison.pbVsPeerMedian > 0 ? '+' : ''}{peerComparison.pbVsPeerMedian}%
                {peerComparison.isPremium ? ' (Premium)' : ' (Discount)'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className={theme.textSecondary}>P/E vs Peer Median</span>
              <span className={`font-bold ${
                peerComparison.peVsPeerMedian > 0 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {peerComparison.peVsPeerMedian > 0 ? '+' : ''}{peerComparison.peVsPeerMedian}%
              </span>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${theme.text}`}>
              <thead>
                <tr className={`border-b ${theme.border}`}>
                  <th className="text-left py-2">Metric</th>
                  <th className="text-right py-2">{selectedBank.ticker}</th>
                  <th className="text-right py-2">Peer Median</th>
                  <th className="text-right py-2">Rank</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme.border}`}>
                {peerComparison.comparison.slice(0, 8).map(row => (
                  <tr key={row.metric}>
                    <td className={`py-2 ${theme.textSecondary}`}>
                      {row.metric.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </td>
                    <td className="text-right py-2 font-medium">
                      {typeof row.bankValue === 'number' ? row.bankValue.toFixed(1) : row.bankValue}
                    </td>
                    <td className={`text-right py-2 ${theme.textMuted}`}>
                      {row.peerMedian}
                    </td>
                    <td className="text-right py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        row.rank === 1 ? 'bg-emerald-100 text-emerald-700' :
                        row.rank <= 2 ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        #{row.rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Value Creation Analysis */}
      <div className={`rounded-xl p-6 border ${
        darkMode
          ? 'bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border-emerald-700/50'
          : 'bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
          <Target className="w-5 h-5" />
          Value Creation Analysis (Damodaran Framework)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-sm ${theme.textMuted}`}>ROE</div>
            <div className={`text-3xl font-bold ${theme.text}`}>{selectedBank.roe}%</div>
          </div>
          <div className="text-center">
            <div className={`text-sm ${theme.textMuted}`}>vs</div>
            <div className={`text-xl font-bold ${theme.textSecondary}`}>minus</div>
          </div>
          <div className="text-center">
            <div className={`text-sm ${theme.textMuted}`}>Cost of Equity</div>
            <div className={`text-3xl font-bold ${theme.text}`}>{valuation.costOfEquity.costOfEquity}%</div>
          </div>
          <div className="text-center">
            <div className={`text-sm ${theme.textMuted}`}>= ROE - Ke Spread</div>
            <div className={`text-3xl font-bold ${
              selectedBank.roe > valuation.costOfEquity.costOfEquity ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {(selectedBank.roe - valuation.costOfEquity.costOfEquity).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
          <div className={`text-sm ${theme.textSecondary}`}>
            <strong>Interpretation:</strong> {selectedBank.name} {' '}
            {selectedBank.roe > valuation.costOfEquity.costOfEquity ? (
              <span className="text-emerald-500">
                is creating shareholder value with ROE exceeding cost of equity by {(selectedBank.roe - valuation.costOfEquity.costOfEquity).toFixed(1)}%.
                This justifies a P/B premium above 1.0x (current: {selectedBank.pb}x, fair: {valuation.models.gordonPB.fairPB}x).
              </span>
            ) : (
              <span className="text-red-500">
                is destroying shareholder value with ROE below cost of equity.
                This suggests the stock should trade at a P/B discount to 1.0x.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Indonesian Banks Comparison Table */}
      <div className={`rounded-xl border overflow-hidden ${theme.card}`}>
        <div className={`p-4 border-b ${theme.border}`}>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${theme.text}`}>
            <Building2 className="w-5 h-5" />
            Indonesian Banks Overview
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${theme.text}`}>
            <thead className={darkMode ? 'bg-slate-700' : 'bg-slate-100'}>
              <tr>
                <th className="text-left px-4 py-3">Bank</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">P/B</th>
                <th className="text-right px-4 py-3">P/E</th>
                <th className="text-right px-4 py-3">ROE</th>
                <th className="text-right px-4 py-3">NIM</th>
                <th className="text-right px-4 py-3">NPL</th>
                <th className="text-right px-4 py-3">CAR</th>
                <th className="text-right px-4 py-3">Div Yield</th>
                <th className="text-right px-4 py-3">Fair Value</th>
                <th className="text-right px-4 py-3">Upside</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme.border}`}>
              {INDONESIAN_BANKS_DATA.map(bank => {
                const bankVal = calculateBankValuation(bank, 'Indonesia');
                return (
                  <tr
                    key={bank.ticker}
                    className={`cursor-pointer transition-colors ${
                      bank.ticker === selectedBank.ticker
                        ? darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                        : darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedBank(bank)}
                  >
                    <td className="px-4 py-3 font-medium">{bank.ticker}</td>
                    <td className="text-right px-4 py-3">{bank.price.toLocaleString()}</td>
                    <td className="text-right px-4 py-3">{bank.pb}x</td>
                    <td className="text-right px-4 py-3">{bank.pe.toFixed(1)}x</td>
                    <td className="text-right px-4 py-3">{bank.roe}%</td>
                    <td className="text-right px-4 py-3">{bank.nim}%</td>
                    <td className={`text-right px-4 py-3 ${bank.nplRatio > 3 ? 'text-red-500' : ''}`}>
                      {bank.nplRatio}%
                    </td>
                    <td className="text-right px-4 py-3">{bank.car}%</td>
                    <td className="text-right px-4 py-3">{bank.dividendYield}%</td>
                    <td className="text-right px-4 py-3 font-medium">
                      {bankVal.weightedIntrinsicValue.toLocaleString()}
                    </td>
                    <td className={`text-right px-4 py-3 font-bold ${
                      bankVal.weightedUpside >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {bankVal.weightedUpside >= 0 ? '+' : ''}{bankVal.weightedUpside}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Notes */}
      <div className={`rounded-lg p-4 border ${theme.section} ${theme.border}`}>
        <p className={`text-sm ${theme.textSecondary}`}>
          <strong className={theme.text}>Methodology:</strong> Bank valuations use equity-based models per Damodaran (NYU Stern).
          Traditional EV/EBITDA and DCF are not applicable to banks because debt is the raw material, not financing.
          Cost of Equity: Rf ({valuation.costOfEquity.riskFreeRate}%) + Beta × (ERP {valuation.costOfEquity.equityRiskPremium}% + CRP {valuation.costOfEquity.countryRiskPremium}%).
          Indonesian regulatory requirements per OJK and BASEL III standards.
        </p>
      </div>
    </div>
  );
}
