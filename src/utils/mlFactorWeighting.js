// ============================================================================
// ML-BASED DYNAMIC FACTOR WEIGHTING MODULE
// ============================================================================
// Based on mentor feedback and research from:
// - Damodaran (NYU Stern)
// - "Machine Learning for Factor Investing" (mlfactor.com)
// - Stanford CS230 Deep RL for Factor Investing
// - CFA Institute Factor Investing Research
// ============================================================================

// ============================================================================
// PART 1: ABSOLUTE EXCLUSION FILTERS (HARD SCREENS)
// ============================================================================
// "Absolute data don't want in portfolio" - Mentor
// These are non-negotiable filters applied BEFORE scoring
// Based on: AAII Screen Construction, Quality Factor Research

export const ABSOLUTE_EXCLUSION_CRITERIA = {
  // Profitability Screens - Avoid money-losing companies
  earnings: {
    name: 'Negative Earnings',
    filter: (stock) => (stock['Net Income'] || stock.netIncome || 0) < 0,
    reason: 'Unprofitable companies excluded'
  },

  // Leverage Screens - Avoid over-leveraged companies
  leverage: {
    name: 'Excessive Leverage',
    filter: (stock) => {
      const debtToEquity = stock['D/E'] || stock.debtToEquity || 0;
      return debtToEquity > 3.0; // D/E > 300%
    },
    reason: 'High bankruptcy risk'
  },

  // Liquidity Screens - Avoid illiquid stocks
  liquidity: {
    name: 'Insufficient Liquidity',
    filter: (stock) => {
      const marketCap = stock['Market Cap'] || stock.marketCap || 0;
      const avgVolume = stock['Avg Volume'] || stock.avgVolume || 0;
      // Market cap < 100B IDR or < $10M USD
      const minMarketCap = stock.currency === 'IDR' ? 100e9 : 10e6;
      return marketCap < minMarketCap;
    },
    reason: 'Too illiquid for meaningful position'
  },

  // Valuation Sanity - Avoid extreme negative valuations
  valuation: {
    name: 'Negative Book Value',
    filter: (stock) => {
      const bookValue = stock['Book Value'] || stock.bookValuePerShare || 0;
      return bookValue < 0;
    },
    reason: 'Negative equity - distressed'
  },

  // Altman Z-Score (for non-financials) - Bankruptcy prediction
  altmanZ: {
    name: 'High Bankruptcy Risk',
    filter: (stock) => {
      // Skip for financials (Z-score not applicable)
      if (stock.sector === 'Financials' || stock.sector === 'Financial Services') {
        return false;
      }
      const zScore = stock['Altman Z'] || stock.altmanZ;
      if (zScore === undefined || zScore === null) return false;
      return zScore < 1.8; // Distress zone
    },
    reason: 'Altman Z-Score indicates distress'
  },

  // Accruals Quality - High accruals = low earnings quality
  accruals: {
    name: 'Poor Earnings Quality',
    filter: (stock) => {
      const accrualRatio = stock['Accrual Ratio'] || stock.accrualRatio;
      if (accrualRatio === undefined || accrualRatio === null) return false;
      return accrualRatio > 0.10; // Accruals > 10% of assets
    },
    reason: 'High accruals indicate low earnings quality'
  },

  // Penny Stock Screen
  pennyStock: {
    name: 'Penny Stock',
    filter: (stock) => {
      const price = stock.Price || stock.price || 0;
      const minPrice = stock.currency === 'IDR' ? 50 : 1; // Rp 50 or $1
      return price < minPrice;
    },
    reason: 'Too speculative'
  }
};

/**
 * Apply all absolute exclusion filters
 * Returns { passed: boolean, excluded: boolean, reasons: string[] }
 */
export const applyAbsoluteFilters = (stock) => {
  const reasons = [];

  for (const [key, criteria] of Object.entries(ABSOLUTE_EXCLUSION_CRITERIA)) {
    if (criteria.filter(stock)) {
      reasons.push(`${criteria.name}: ${criteria.reason}`);
    }
  }

  return {
    passed: reasons.length === 0,
    excluded: reasons.length > 0,
    reasons,
    stock
  };
};

/**
 * Filter universe by absolute criteria
 */
export const filterUniverse = (stocks) => {
  const results = stocks.map(applyAbsoluteFilters);
  return {
    passed: results.filter(r => r.passed).map(r => r.stock),
    excluded: results.filter(r => r.excluded),
    summary: {
      total: stocks.length,
      passed: results.filter(r => r.passed).length,
      excluded: results.filter(r => r.excluded).length,
      exclusionRate: (results.filter(r => r.excluded).length / stocks.length * 100).toFixed(1) + '%'
    }
  };
};


// ============================================================================
// PART 2: FACTOR DEFINITIONS
// ============================================================================

export const FACTORS = {
  technical: {
    name: 'Technical',
    description: 'Price momentum and risk metrics',
    metrics: ['Alpha', 'Beta', '52W Position', 'RSI', 'Price vs SMA200'],
    calculate: (stock) => {
      const alpha = stock.Alpha || 0;
      const momentum = stock['52W Position'] || 50;
      const rsi = stock.RSI || 50;
      // Normalize to 0-100
      return Math.min(100, Math.max(0,
        (alpha + 10) * 2.5 + // Alpha -10 to +30 -> 0-100
        momentum * 0.3 +
        (rsi > 30 && rsi < 70 ? 20 : 0) // Not oversold/overbought
      ));
    }
  },

  valuation: {
    name: 'Valuation',
    description: 'Value metrics vs peers',
    metrics: ['P/E', 'P/B', 'EV/EBITDA', 'P/S'],
    calculate: (stock, sectorMedians) => {
      const pe = stock['P/E'] || stock.pe || 15;
      const pb = stock['P/B'] || stock.pb || 1.5;
      const evEbitda = stock['EV/EBITDA'] || 10;

      // Lower is better for value - invert and normalize
      const peScore = pe > 0 ? Math.max(0, 100 - pe * 2) : 0;
      const pbScore = pb > 0 ? Math.max(0, 100 - pb * 15) : 0;
      const evScore = evEbitda > 0 ? Math.max(0, 100 - evEbitda * 4) : 0;

      return (peScore * 0.4 + pbScore * 0.3 + evScore * 0.3);
    }
  },

  quality: {
    name: 'Quality',
    description: 'Profitability and earnings quality',
    metrics: ['ROE', 'ROA', 'Gross Margin', 'FCF Conversion'],
    calculate: (stock) => {
      const roe = stock.ROE || stock.roe || 10;
      const roa = stock.ROA || stock.roa || 5;
      const grossMargin = stock['Gross Margin'] || 30;
      const fcfConversion = stock['FCF Conversion'] || 70;

      // Higher is better
      const roeScore = Math.min(100, roe * 3);
      const roaScore = Math.min(100, roa * 5);
      const marginScore = Math.min(100, grossMargin * 1.5);
      const fcfScore = Math.min(100, fcfConversion);

      return (roeScore * 0.35 + roaScore * 0.25 + marginScore * 0.2 + fcfScore * 0.2);
    }
  },

  growth: {
    name: 'Growth',
    description: 'Revenue and earnings growth',
    metrics: ['Revenue Growth', 'EPS Growth', 'Net Income Growth'],
    calculate: (stock) => {
      const revGrowth = stock['Revenue Growth'] || 0;
      const epsGrowth = stock['EPS Growth'] || 0;
      const niGrowth = stock['Net Income Growth'] || 0;

      // Normalize growth rates (-20% to +50% -> 0 to 100)
      const normalize = (g) => Math.min(100, Math.max(0, (g + 20) * 1.43));

      return (normalize(revGrowth) * 0.4 + normalize(epsGrowth) * 0.35 + normalize(niGrowth) * 0.25);
    }
  },

  momentum: {
    name: 'Momentum',
    description: 'Price momentum signals',
    metrics: ['3M Return', '6M Return', '12M Return'],
    calculate: (stock) => {
      const ret3m = stock['3M Return'] || 0;
      const ret6m = stock['6M Return'] || 0;
      const ret12m = stock['12M Return'] || 0;

      // Normalize returns (-30% to +50% -> 0 to 100)
      const normalize = (r) => Math.min(100, Math.max(0, (r + 30) * 1.25));

      // 6M momentum is most predictive (research)
      return (normalize(ret3m) * 0.25 + normalize(ret6m) * 0.5 + normalize(ret12m) * 0.25);
    }
  },

  volatility: {
    name: 'Low Volatility',
    description: 'Lower risk stocks',
    metrics: ['Volatility', 'Beta', 'Max Drawdown'],
    calculate: (stock) => {
      const volatility = stock.Volatility || 25;
      const beta = stock.Beta || 1;
      const maxDD = stock['Max Drawdown'] || -20;

      // Lower is better - invert
      const volScore = Math.max(0, 100 - volatility * 1.5);
      const betaScore = Math.max(0, 100 - Math.abs(beta - 1) * 50);
      const ddScore = Math.max(0, 100 + maxDD * 1.5);

      return (volScore * 0.4 + betaScore * 0.3 + ddScore * 0.3);
    }
  },

  size: {
    name: 'Size',
    description: 'Small cap premium',
    metrics: ['Market Cap'],
    calculate: (stock) => {
      const marketCap = stock['Market Cap'] || 1e12;
      // Smaller companies score higher (small cap premium)
      // Log scale: $100M = 100, $1B = 75, $10B = 50, $100B = 25
      const logMC = Math.log10(marketCap);
      return Math.max(0, Math.min(100, 150 - logMC * 10));
    }
  },

  sentiment: {
    name: 'Sentiment',
    description: 'Market sentiment indicators',
    metrics: ['Analyst Rating', 'Short Interest', 'Insider Activity'],
    calculate: (stock) => {
      const analystRating = stock['Analyst Rating'] || 3; // 1-5 scale
      const shortInterest = stock['Short Interest'] || 5; // percentage
      const insiderBuying = stock['Insider Buying'] || 0;

      const analystScore = (analystRating - 1) * 25; // 1-5 -> 0-100
      const shortScore = Math.max(0, 100 - shortInterest * 5); // Lower short interest = better
      const insiderScore = insiderBuying > 0 ? 75 : 50;

      return (analystScore * 0.5 + shortScore * 0.3 + insiderScore * 0.2);
    }
  }
};


// ============================================================================
// PART 3: EXPONENTIAL DECAY WEIGHTING
// ============================================================================
// "Neural networks more attention to shorter periods" - Mentor
// Recent data should have more influence on factor calculations

/**
 * Calculate exponential decay weights for time series
 * halfLife: number of periods for weight to decay by 50%
 */
export const calculateExponentialWeights = (numPeriods, halfLife = 6) => {
  const lambda = Math.log(2) / halfLife;
  const weights = [];
  let sum = 0;

  for (let i = 0; i < numPeriods; i++) {
    const weight = Math.exp(-lambda * i);
    weights.push(weight);
    sum += weight;
  }

  // Normalize to sum to 1
  return weights.map(w => w / sum);
};

/**
 * Apply exponential weighted average to historical factor returns
 */
export const exponentialWeightedMean = (values, halfLife = 6) => {
  if (!values || values.length === 0) return 0;

  const weights = calculateExponentialWeights(values.length, halfLife);
  let weightedSum = 0;

  for (let i = 0; i < values.length; i++) {
    weightedSum += values[i] * weights[i];
  }

  return weightedSum;
};


// ============================================================================
// PART 4: NEURAL NETWORK FOR FACTOR WEIGHT OPTIMIZATION
// ============================================================================
// "Neural networks - can determine optimal weighting" - Mentor
// Simple 2-layer NN (research shows shallow networks work best for factors)

/**
 * Simple Feed-Forward Neural Network
 * Architecture: Input(8 factors) -> Hidden(16) -> Hidden(8) -> Output(8 weights)
 * Uses softmax output to ensure weights sum to 1
 */
export class FactorWeightNN {
  constructor(inputSize = 8, hiddenSize = 16) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;

    // Initialize weights with Xavier initialization
    this.weights1 = this.initWeights(inputSize, hiddenSize);
    this.bias1 = new Array(hiddenSize).fill(0);
    this.weights2 = this.initWeights(hiddenSize, hiddenSize / 2);
    this.bias2 = new Array(hiddenSize / 2).fill(0);
    this.weights3 = this.initWeights(hiddenSize / 2, inputSize);
    this.bias3 = new Array(inputSize).fill(0);
  }

  initWeights(rows, cols) {
    const scale = Math.sqrt(2.0 / (rows + cols));
    return Array(rows).fill().map(() =>
      Array(cols).fill().map(() => (Math.random() - 0.5) * 2 * scale)
    );
  }

  // ReLU activation
  relu(x) {
    return Math.max(0, x);
  }

  // Softmax for output layer (ensures weights sum to 1)
  softmax(arr) {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
  }

  // Forward pass
  forward(factorReturns) {
    // Layer 1
    let hidden1 = new Array(this.hiddenSize).fill(0);
    for (let j = 0; j < this.hiddenSize; j++) {
      for (let i = 0; i < this.inputSize; i++) {
        hidden1[j] += factorReturns[i] * this.weights1[i][j];
      }
      hidden1[j] = this.relu(hidden1[j] + this.bias1[j]);
    }

    // Layer 2
    let hidden2 = new Array(this.hiddenSize / 2).fill(0);
    for (let j = 0; j < this.hiddenSize / 2; j++) {
      for (let i = 0; i < this.hiddenSize; i++) {
        hidden2[j] += hidden1[i] * this.weights2[i][j];
      }
      hidden2[j] = this.relu(hidden2[j] + this.bias2[j]);
    }

    // Output layer
    let output = new Array(this.inputSize).fill(0);
    for (let j = 0; j < this.inputSize; j++) {
      for (let i = 0; i < this.hiddenSize / 2; i++) {
        output[j] += hidden2[i] * this.weights3[i][j];
      }
      output[j] += this.bias3[j];
    }

    // Softmax to get weights that sum to 1
    return this.softmax(output);
  }

  // Simple gradient descent training
  train(historicalFactorReturns, futureReturns, learningRate = 0.01, epochs = 100) {
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let t = 0; t < historicalFactorReturns.length - 1; t++) {
        const input = historicalFactorReturns[t];
        const target = futureReturns[t + 1];

        // Forward pass
        const weights = this.forward(input);

        // Calculate portfolio return with these weights
        const portfolioReturn = weights.reduce((sum, w, i) => sum + w * target[i], 0);

        // Simple gradient: increase weights for factors that did well
        for (let i = 0; i < this.inputSize; i++) {
          const gradient = target[i] - portfolioReturn;
          // Update last layer weights
          for (let j = 0; j < this.hiddenSize / 2; j++) {
            this.weights3[j][i] += learningRate * gradient * 0.01;
          }
        }
      }
    }
  }

  // Get optimal weights given current factor scores
  getOptimalWeights(currentFactorScores) {
    return this.forward(currentFactorScores);
  }
}


// ============================================================================
// PART 5: STATISTICAL SIGNIFICANCE TESTING
// ============================================================================
// "Sig level" - Mentor
// Test if factor returns are statistically significant

/**
 * Calculate t-statistic for factor returns
 */
export const calculateTStatistic = (returns) => {
  if (!returns || returns.length < 2) return { tStat: 0, pValue: 1, significant: false };

  const n = returns.length;
  const mean = returns.reduce((a, b) => a + b, 0) / n;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (n - 1);
  const stdError = Math.sqrt(variance / n);

  const tStat = stdError > 0 ? mean / stdError : 0;

  // Approximate p-value using normal distribution (for large n)
  const pValue = 2 * (1 - normalCDF(Math.abs(tStat)));

  return {
    tStat: Math.round(tStat * 100) / 100,
    pValue: Math.round(pValue * 1000) / 1000,
    significant: pValue < 0.05,
    mean: Math.round(mean * 1000) / 1000,
    stdDev: Math.round(Math.sqrt(variance) * 1000) / 1000,
    n
  };
};

// Normal CDF approximation
const normalCDF = (x) => {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
};

/**
 * Test all factors for statistical significance
 */
export const testFactorSignificance = (factorReturnsHistory) => {
  const results = {};

  for (const [factorName, returns] of Object.entries(factorReturnsHistory)) {
    results[factorName] = calculateTStatistic(returns);
  }

  return results;
};


// ============================================================================
// PART 6: WALK-FORWARD OPTIMIZATION
// ============================================================================
// "Test across periods" + "Recurring process and backtesting" - Mentor

/**
 * Walk-Forward Optimization Configuration
 */
export const WFO_CONFIG = {
  trainingWindow: 12,      // 12 months of training data
  testingWindow: 1,        // 1 month out-of-sample test
  stepSize: 1,             // Move forward 1 month each iteration
  minTrainingPeriods: 6,   // Minimum 6 months before starting
  reoptimizeFrequency: 1   // Re-optimize weights every month
};

/**
 * Run Walk-Forward Optimization
 * Returns performance metrics and optimal weights over time
 */
export const runWalkForwardOptimization = (historicalData, config = WFO_CONFIG) => {
  const results = {
    periods: [],
    inSampleReturns: [],
    outOfSampleReturns: [],
    weightHistory: [],
    cumulativeReturn: 1,
    sharpeRatio: 0,
    maxDrawdown: 0
  };

  const totalPeriods = historicalData.length;
  let startIdx = config.minTrainingPeriods;

  // Initialize neural network
  const nn = new FactorWeightNN(Object.keys(FACTORS).length);

  while (startIdx + config.testingWindow <= totalPeriods) {
    const trainStart = Math.max(0, startIdx - config.trainingWindow);
    const trainEnd = startIdx;
    const testEnd = Math.min(startIdx + config.testingWindow, totalPeriods);

    // Training data
    const trainData = historicalData.slice(trainStart, trainEnd);

    // Train the model
    const factorReturns = trainData.map(d => d.factorReturns);
    nn.train(factorReturns, factorReturns, 0.01, 50);

    // Get optimal weights
    const lastFactorScores = trainData[trainData.length - 1].factorScores;
    const optimalWeights = nn.getOptimalWeights(lastFactorScores);

    // Test on out-of-sample data
    const testData = historicalData.slice(trainEnd, testEnd);
    let periodReturn = 0;

    for (const period of testData) {
      const portfolioReturn = optimalWeights.reduce(
        (sum, w, i) => sum + w * period.factorReturns[i], 0
      );
      periodReturn += portfolioReturn;
    }

    // Record results
    results.periods.push({
      trainStart,
      trainEnd,
      testStart: trainEnd,
      testEnd,
      weights: optimalWeights
    });
    results.outOfSampleReturns.push(periodReturn);
    results.weightHistory.push(optimalWeights);
    results.cumulativeReturn *= (1 + periodReturn / 100);

    startIdx += config.stepSize;
  }

  // Calculate performance metrics
  const returns = results.outOfSampleReturns;
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  );

  results.sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(12) : 0; // Annualized
  results.annualizedReturn = ((results.cumulativeReturn ** (12 / returns.length)) - 1) * 100;
  results.maxDrawdown = calculateMaxDrawdown(returns);

  return results;
};

/**
 * Calculate maximum drawdown
 */
const calculateMaxDrawdown = (returns) => {
  let peak = 0;
  let maxDD = 0;
  let cumReturn = 1;

  for (const r of returns) {
    cumReturn *= (1 + r / 100);
    if (cumReturn > peak) peak = cumReturn;
    const drawdown = (peak - cumReturn) / peak;
    if (drawdown > maxDD) maxDD = drawdown;
  }

  return -maxDD * 100;
};


// ============================================================================
// PART 7: MONTHLY REBALANCING SYSTEM
// ============================================================================
// "Weightings change every month" + "Stocks changing every month" - Mentor

/**
 * Monthly rebalancing configuration
 */
export const REBALANCING_CONFIG = {
  frequency: 'monthly',
  maxTurnover: 0.30,           // Max 30% portfolio turnover per month
  minHoldingPeriod: 1,         // Minimum 1 month holding
  maxPositions: 20,            // Maximum 20 positions
  positionSizeMin: 0.02,       // Minimum 2% position
  positionSizeMax: 0.10,       // Maximum 10% position
  rebalanceDay: 1              // Rebalance on 1st of month
};

/**
 * Generate monthly rebalancing recommendations
 */
export const generateRebalancing = (
  currentPortfolio,
  newScores,
  factorWeights,
  config = REBALANCING_CONFIG
) => {
  // Score all stocks with current factor weights
  const scoredStocks = newScores.map(stock => {
    let totalScore = 0;
    const factorNames = Object.keys(FACTORS);

    factorNames.forEach((factor, i) => {
      const factorScore = FACTORS[factor].calculate(stock);
      totalScore += factorScore * factorWeights[i];
    });

    return {
      ...stock,
      compositeScore: totalScore,
      factorScores: factorNames.map(f => FACTORS[f].calculate(stock))
    };
  });

  // Sort by composite score
  scoredStocks.sort((a, b) => b.compositeScore - a.compositeScore);

  // Select top N stocks (after absolute filters)
  const { passed: filteredStocks } = filterUniverse(scoredStocks);
  const targetPortfolio = filteredStocks.slice(0, config.maxPositions);

  // Calculate changes
  const currentTickers = new Set(currentPortfolio.map(s => s.ticker));
  const targetTickers = new Set(targetPortfolio.map(s => s.ticker));

  const buys = targetPortfolio.filter(s => !currentTickers.has(s.ticker));
  const sells = currentPortfolio.filter(s => !targetTickers.has(s.ticker));
  const holds = targetPortfolio.filter(s => currentTickers.has(s.ticker));

  // Calculate turnover
  const turnover = (buys.length + sells.length) / (2 * Math.max(currentPortfolio.length, targetPortfolio.length));

  // If turnover exceeds limit, reduce changes
  let finalBuys = buys;
  let finalSells = sells;

  if (turnover > config.maxTurnover) {
    const maxChanges = Math.floor(config.maxTurnover * currentPortfolio.length);
    finalBuys = buys.slice(0, Math.ceil(maxChanges / 2));
    finalSells = sells.slice(0, Math.floor(maxChanges / 2));
  }

  return {
    date: new Date().toISOString().slice(0, 10),
    currentPortfolio,
    targetPortfolio,
    buys: finalBuys,
    sells: finalSells,
    holds,
    turnover: Math.round(turnover * 100),
    metrics: {
      avgScore: targetPortfolio.reduce((sum, s) => sum + s.compositeScore, 0) / targetPortfolio.length,
      topScore: targetPortfolio[0]?.compositeScore,
      bottomScore: targetPortfolio[targetPortfolio.length - 1]?.compositeScore
    }
  };
};


// ============================================================================
// PART 8: FACTOR DOMINANCE ANALYSIS
// ============================================================================
// "Which one is more dominant" - Mentor

/**
 * Analyze which factors are driving returns
 */
export const analyzeFactorDominance = (factorReturnsHistory, lookbackPeriods = 12) => {
  const factorNames = Object.keys(FACTORS);
  const recentReturns = factorReturnsHistory.slice(-lookbackPeriods);

  const analysis = {};

  factorNames.forEach((factor, i) => {
    const returns = recentReturns.map(period => period[i]);
    const stats = calculateTStatistic(returns);

    // Calculate information ratio
    const avgReturn = stats.mean;
    const trackingError = stats.stdDev;
    const informationRatio = trackingError > 0 ? avgReturn / trackingError : 0;

    // Calculate hit rate (% of positive periods)
    const hitRate = returns.filter(r => r > 0).length / returns.length;

    // Exponential weighted recent performance
    const recentPerformance = exponentialWeightedMean(returns.reverse(), 3);

    analysis[factor] = {
      avgReturn: Math.round(avgReturn * 100) / 100,
      stdDev: Math.round(trackingError * 100) / 100,
      tStat: stats.tStat,
      pValue: stats.pValue,
      significant: stats.significant,
      informationRatio: Math.round(informationRatio * 100) / 100,
      hitRate: Math.round(hitRate * 100),
      recentPerformance: Math.round(recentPerformance * 100) / 100,
      dominanceScore: Math.round((informationRatio * 30 + hitRate * 0.5 + (stats.significant ? 20 : 0)) * 10) / 10
    };
  });

  // Rank by dominance
  const ranked = Object.entries(analysis)
    .sort((a, b) => b[1].dominanceScore - a[1].dominanceScore)
    .map(([name, data], rank) => ({ factor: name, rank: rank + 1, ...data }));

  return {
    factorAnalysis: analysis,
    ranking: ranked,
    dominantFactor: ranked[0]?.factor,
    significantFactors: ranked.filter(f => f.significant).map(f => f.factor)
  };
};


// ============================================================================
// PART 9: MAIN DYNAMIC WEIGHTING FUNCTION
// ============================================================================

/**
 * Main function: Calculate optimal factor weights for current period
 */
export const calculateDynamicFactorWeights = (
  historicalFactorReturns,
  currentFactorScores,
  options = {}
) => {
  const {
    useNeuralNetwork = true,
    recencyHalfLife = 6,
    minSignificanceLevel = 0.10
  } = options;

  // 1. Test factor significance
  const factorNames = Object.keys(FACTORS);
  const significanceTests = {};

  factorNames.forEach((factor, i) => {
    const returns = historicalFactorReturns.map(period => period[i]);
    significanceTests[factor] = calculateTStatistic(returns);
  });

  // 2. Calculate exponentially weighted recent performance
  const recentPerformance = {};
  factorNames.forEach((factor, i) => {
    const returns = historicalFactorReturns.map(period => period[i]).reverse();
    recentPerformance[factor] = exponentialWeightedMean(returns, recencyHalfLife);
  });

  // 3. Get neural network weights (if enabled)
  let nnWeights = null;
  if (useNeuralNetwork && historicalFactorReturns.length >= 12) {
    const nn = new FactorWeightNN(factorNames.length);
    nn.train(historicalFactorReturns, historicalFactorReturns, 0.01, 100);
    nnWeights = nn.getOptimalWeights(currentFactorScores);
  }

  // 4. Calculate blended weights
  // Base weights (equal weight)
  const baseWeight = 1 / factorNames.length;

  // Adjust based on significance and recent performance
  let weights = factorNames.map((factor, i) => {
    let weight = baseWeight;

    // Boost significant factors
    if (significanceTests[factor].significant) {
      weight *= 1.2;
    } else if (significanceTests[factor].pValue > minSignificanceLevel) {
      weight *= 0.8; // Reduce weight of non-significant factors
    }

    // Adjust by recent performance
    const recentPerf = recentPerformance[factor];
    weight *= (1 + recentPerf / 100);

    // Blend with NN weights if available
    if (nnWeights) {
      weight = weight * 0.5 + nnWeights[i] * 0.5;
    }

    return Math.max(0.05, weight); // Minimum 5% weight
  });

  // Normalize to sum to 1
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  weights = weights.map(w => w / totalWeight);

  return {
    weights: Object.fromEntries(factorNames.map((f, i) => [f, Math.round(weights[i] * 1000) / 10])),
    weightsArray: weights,
    significance: significanceTests,
    recentPerformance,
    nnWeights: nnWeights ? Object.fromEntries(factorNames.map((f, i) => [f, Math.round(nnWeights[i] * 1000) / 10])) : null,
    methodology: {
      useNeuralNetwork,
      recencyHalfLife,
      minSignificanceLevel,
      dataPoints: historicalFactorReturns.length
    }
  };
};


// ============================================================================
// PART 10: EXPORTS & SUMMARY
// ============================================================================

export default {
  // Filters
  ABSOLUTE_EXCLUSION_CRITERIA,
  applyAbsoluteFilters,
  filterUniverse,

  // Factors
  FACTORS,

  // Weighting
  calculateExponentialWeights,
  exponentialWeightedMean,
  calculateDynamicFactorWeights,

  // Neural Network
  FactorWeightNN,

  // Statistics
  calculateTStatistic,
  testFactorSignificance,

  // Walk-Forward
  WFO_CONFIG,
  runWalkForwardOptimization,

  // Rebalancing
  REBALANCING_CONFIG,
  generateRebalancing,

  // Analysis
  analyzeFactorDominance
};
