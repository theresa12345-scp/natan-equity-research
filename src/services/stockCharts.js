// ============================================================================
// STOCK CHARTS SERVICE - Historical Price Data & Technical Indicators
// Yahoo Finance API for price data (works for both JCI and US stocks)
// ============================================================================

// Cache configuration - use longer cache to minimize API calls
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for production
const cache = new Map();

// Rate limiting - very conservative to avoid 429 errors
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
const MAX_RETRIES = 2;
const RETRY_DELAY = 5000; // 5 seconds base delay for retries

// Yahoo Finance endpoints - we'll try multiple if one fails
const YAHOO_ENDPOINTS = [
  '/api/yahoo',        // Primary: query2.finance.yahoo.com via proxy
  '/api/yahoo-alt',    // Fallback: query1.finance.yahoo.com via proxy
];

// ============================================================================
// TICKER MAPPING
// ============================================================================

/**
 * Convert ticker to Yahoo Finance format
 */
export const toYahooTicker = (ticker, region = 'Indonesia') => {
  if (!ticker) return null;

  // Already has suffix
  if (ticker.includes('.')) return ticker;

  // US stocks - no suffix needed
  if (region === 'US' || region === 'United States') return ticker;

  // Indonesian stocks need .JK suffix
  return `${ticker}.JK`;
};

// ============================================================================
// PRICE DATA FETCHING
// ============================================================================

/**
 * Sleep helper for delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch historical chart data from Yahoo Finance with retry logic and endpoint fallback
 * @param {string} ticker - Stock ticker
 * @param {string} region - 'Indonesia' or 'US'
 * @param {string} range - Time range: '1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max'
 * @param {string} interval - Data interval: '1m', '5m', '15m', '1h', '1d', '1wk', '1mo'
 */
export const fetchChartData = async (ticker, region = 'Indonesia', range = '1y', interval = '1d') => {
  const yahooTicker = toYahooTicker(ticker, region);
  const cacheKey = `chart:${yahooTicker}:${range}:${interval}`;

  // Check cache first - return cached data if available
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📊 Using cached chart data for ${yahooTicker}`);
    return { ...cached.data, fromCache: true };
  }

  // Rate limiting - ensure minimum interval between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
    await sleep(waitTime);
  }

  let lastError = null;

  // Try each endpoint
  for (const baseEndpoint of YAHOO_ENDPOINTS) {
    // Retry logic for each endpoint
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        lastRequestTime = Date.now();

        // Use the Vite proxy to avoid CORS
        const url = `${baseEndpoint}/v8/finance/chart/${yahooTicker}?interval=${interval}&range=${range}`;
        console.log(`📈 Fetching chart data (${baseEndpoint}, attempt ${attempt}/${MAX_RETRIES}): ${yahooTicker}`);

        const response = await fetch(url);

        // Handle rate limiting (429) - wait and try next endpoint
        if (response.status === 429) {
          console.warn(`⚠️ Rate limited (429) on ${baseEndpoint}. Trying fallback...`);
          lastError = new Error('Rate limited (429). Yahoo Finance is temporarily blocking requests. Please try again in a few minutes.');
          await sleep(RETRY_DELAY);
          break; // Try next endpoint
        }

        if (!response.ok) {
          throw new Error(`Yahoo Finance API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.chart?.error) {
          throw new Error(data.chart.error.description || 'Chart data not available');
        }

        const result = data.chart?.result?.[0];
        if (!result) {
          throw new Error('No chart data returned');
        }

        // Parse the response
        const meta = result.meta;
        const timestamps = result.timestamp || [];
        const quote = result.indicators?.quote?.[0] || {};
        const adjclose = result.indicators?.adjclose?.[0]?.adjclose || quote.close;

        // Build OHLCV data array
        const rawChartData = timestamps.map((timestamp, i) => ({
          date: new Date(timestamp * 1000).toISOString().split('T')[0],
          timestamp: timestamp * 1000,
          open: quote.open?.[i] ?? null,
          high: quote.high?.[i] ?? null,
          low: quote.low?.[i] ?? null,
          close: quote.close?.[i] ?? null,
          adjClose: adjclose?.[i] ?? quote.close?.[i] ?? null,
          volume: quote.volume?.[i] ?? null,
        })).filter(d => d.close !== null); // Filter out null data points

        // Sort by timestamp and remove duplicates (keep last value for each date)
        const dateMap = new Map();
        rawChartData.forEach(d => {
          dateMap.set(d.date, d);
        });
        const chartData = Array.from(dateMap.values()).sort((a, b) => a.timestamp - b.timestamp);

        const chartResult = {
          ticker,
          yahooTicker,
          currency: meta.currency,
          exchangeName: meta.exchangeName,
          instrumentType: meta.instrumentType,
          regularMarketPrice: meta.regularMarketPrice,
          previousClose: meta.chartPreviousClose,
          fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
          range,
          interval,
          data: chartData,
          fromCache: false,
        };

        // Cache the result
        cache.set(cacheKey, { data: chartResult, timestamp: Date.now() });
        console.log(`✅ Loaded ${chartData.length} data points for ${yahooTicker}`);

        return chartResult;

      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} on ${baseEndpoint} failed for ${ticker}:`, error.message);

        // Don't retry on non-retryable errors
        if (error.message.includes('not available') || error.message.includes('No chart data')) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < MAX_RETRIES) {
          const backoffDelay = RETRY_DELAY * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
          await sleep(backoffDelay);
        }
      }
    }
  }

  // All endpoints and retries failed
  console.error(`Failed to fetch chart data for ${ticker} after trying all endpoints`);
  throw lastError || new Error('Failed to fetch chart data');
};

// ============================================================================
// TECHNICAL INDICATORS
// ============================================================================

/**
 * Calculate Simple Moving Average (SMA)
 * Properly handles null/missing data points
 */
export const calculateSMA = (data, period) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      // Get the window of data points
      const window = data.slice(i - period + 1, i + 1);
      // Filter out null/undefined close values
      const validValues = window.filter(d => d?.close != null).map(d => d.close);

      // Only calculate SMA if we have ALL data points in the window
      if (validValues.length === period) {
        const sum = validValues.reduce((a, b) => a + b, 0);
        result.push(sum / period);
      } else {
        result.push(null);
      }
    }
  }
  return result;
};

/**
 * Calculate Exponential Moving Average (EMA)
 * Properly handles null/missing data points
 */
export const calculateEMA = (data, period) => {
  const result = [];
  const multiplier = 2 / (period + 1);

  // First EMA is SMA - need all values in the initial period
  let ema = null;
  let emaStarted = false;

  for (let i = 0; i < data.length; i++) {
    const close = data[i]?.close;

    if (close === null || close === undefined) {
      result.push(null);
      continue;
    }

    if (i < period - 1) {
      result.push(null);
    } else if (!emaStarted) {
      // Calculate initial SMA for EMA
      const initialWindow = data.slice(i - period + 1, i + 1);
      const validValues = initialWindow.filter(d => d?.close != null).map(d => d.close);

      if (validValues.length === period) {
        ema = validValues.reduce((a, b) => a + b, 0) / period;
        emaStarted = true;
        result.push(ema);
      } else {
        result.push(null);
      }
    } else {
      ema = (close - ema) * multiplier + ema;
      result.push(ema);
    }
  }
  return result;
};

/**
 * Calculate Relative Strength Index (RSI)
 * Properly handles null/missing data points
 */
export const calculateRSI = (data, period = 14) => {
  const result = [];
  const gains = [];
  const losses = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(null);
      continue;
    }

    const currentClose = data[i]?.close;
    const prevClose = data[i - 1]?.close;

    // Skip if either value is null/undefined
    if (currentClose == null || prevClose == null) {
      result.push(null);
      gains.push(0);
      losses.push(0);
      continue;
    }

    const change = currentClose - prevClose;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);

    if (i < period) {
      result.push(null);
    } else {
      const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    }
  }
  return result;
};

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);

  // MACD Line = Fast EMA - Slow EMA
  const macdLine = emaFast.map((fast, i) => {
    if (fast === null || emaSlow[i] === null) return null;
    return fast - emaSlow[i];
  });

  // Signal Line = EMA of MACD Line
  const macdData = macdLine.map(v => ({ close: v }));
  const signalLine = calculateEMA(macdData, signalPeriod);

  // Histogram = MACD Line - Signal Line
  const histogram = macdLine.map((macd, i) => {
    if (macd === null || signalLine[i] === null) return null;
    return macd - signalLine[i];
  });

  return { macdLine, signalLine, histogram };
};

/**
 * Calculate Bollinger Bands
 * Properly handles null/missing data points
 */
export const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
  const sma = calculateSMA(data, period);
  const upper = [];
  const lower = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1 || sma[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const validValues = slice.filter(d => d?.close != null).map(d => d.close);

      // Only calculate if we have all values
      if (validValues.length !== period) {
        upper.push(null);
        lower.push(null);
        continue;
      }

      const mean = sma[i];
      const squaredDiffs = validValues.map(close => Math.pow(close - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      const std = Math.sqrt(variance);

      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
  }

  return { middle: sma, upper, lower };
};

/**
 * Calculate Volume Moving Average
 * Properly handles null/missing data points
 */
export const calculateVolumeMA = (data, period = 20) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const window = data.slice(i - period + 1, i + 1);
      const validValues = window.filter(d => d?.volume != null).map(d => d.volume);

      if (validValues.length === period) {
        const sum = validValues.reduce((a, b) => a + b, 0);
        result.push(sum / period);
      } else {
        result.push(null);
      }
    }
  }
  return result;
};

// ============================================================================
// DATA ENRICHMENT - Add indicators to chart data
// ============================================================================

/**
 * Enrich chart data with technical indicators
 */
export const enrichChartData = (chartData, indicators = {}) => {
  const data = chartData.data;
  if (!data || data.length === 0) return chartData;

  const enrichedData = [...data];

  // Add SMAs
  if (indicators.sma20 !== false) {
    const sma20 = calculateSMA(data, 20);
    enrichedData.forEach((d, i) => { d.sma20 = sma20[i]; });
  }
  if (indicators.sma50) {
    const sma50 = calculateSMA(data, 50);
    enrichedData.forEach((d, i) => { d.sma50 = sma50[i]; });
  }
  if (indicators.sma200) {
    const sma200 = calculateSMA(data, 200);
    enrichedData.forEach((d, i) => { d.sma200 = sma200[i]; });
  }

  // Add EMAs
  if (indicators.ema12) {
    const ema12 = calculateEMA(data, 12);
    enrichedData.forEach((d, i) => { d.ema12 = ema12[i]; });
  }
  if (indicators.ema26) {
    const ema26 = calculateEMA(data, 26);
    enrichedData.forEach((d, i) => { d.ema26 = ema26[i]; });
  }

  // Add RSI
  if (indicators.rsi !== false) {
    const rsi = calculateRSI(data, 14);
    enrichedData.forEach((d, i) => { d.rsi = rsi[i]; });
  }

  // Add MACD
  if (indicators.macd) {
    const macd = calculateMACD(data);
    enrichedData.forEach((d, i) => {
      d.macdLine = macd.macdLine[i];
      d.macdSignal = macd.signalLine[i];
      d.macdHistogram = macd.histogram[i];
    });
  }

  // Add Bollinger Bands
  if (indicators.bollinger) {
    const bb = calculateBollingerBands(data, 20, 2);
    enrichedData.forEach((d, i) => {
      d.bbUpper = bb.upper[i];
      d.bbMiddle = bb.middle[i];
      d.bbLower = bb.lower[i];
    });
  }

  // Add Volume MA
  if (indicators.volumeMA !== false) {
    const volMA = calculateVolumeMA(data, 20);
    enrichedData.forEach((d, i) => { d.volumeMA = volMA[i]; });
  }

  return {
    ...chartData,
    data: enrichedData,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format price for display
 */
export const formatPrice = (price, currency = 'USD') => {
  if (price === null || price === undefined) return '—';

  if (currency === 'IDR') {
    return `Rp ${price.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
  }

  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format volume for display
 */
export const formatVolume = (volume) => {
  if (volume === null || volume === undefined) return '—';

  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return volume.toString();
};

/**
 * Calculate price change and percentage
 */
export const calculatePriceChange = (currentPrice, previousClose) => {
  if (!currentPrice || !previousClose) return { change: 0, changePercent: 0 };

  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;

  return { change, changePercent };
};

/**
 * Clear chart cache
 */
export const clearChartCache = () => {
  cache.clear();
};
