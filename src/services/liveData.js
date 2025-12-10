// ============================================================================
// LIVE DATA SERVICE - Real-Time Market Data Integration
// Yahoo Finance API + News Integration
// ============================================================================

// Cache configuration
const CACHE_DURATION = {
  quote: 60 * 1000,        // 1 minute for quotes
  news: 5 * 60 * 1000,     // 5 minutes for news
  chart: 5 * 60 * 1000,    // 5 minutes for charts
  market: 60 * 1000,       // 1 minute for market overview
};

// In-memory cache
const cache = new Map();

// Rate limiting
const rateLimiter = {
  lastRequest: 0,
  minInterval: 200, // 200ms between requests (5 req/sec max)
  queue: [],
};

/**
 * Get cached data if valid
 */
const getCached = (key, maxAge) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < maxAge) {
    return cached.data;
  }
  return null;
};

/**
 * Set cache data
 */
const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Rate-limited fetch wrapper
 */
const rateLimitedFetch = async (url, options = {}) => {
  const now = Date.now();
  const timeSinceLastRequest = now - rateLimiter.lastRequest;

  if (timeSinceLastRequest < rateLimiter.minInterval) {
    await new Promise(resolve =>
      setTimeout(resolve, rateLimiter.minInterval - timeSinceLastRequest)
    );
  }

  rateLimiter.lastRequest = Date.now();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// ============================================================================
// TICKER MAPPING - Indonesian stocks need .JK suffix for Yahoo Finance
// ============================================================================

/**
 * Convert ticker to Yahoo Finance format
 */
export const toYahooTicker = (ticker, region = 'Indonesia') => {
  if (!ticker) return null;

  // Already has suffix
  if (ticker.includes('.')) return ticker;

  // US stocks - no suffix needed
  if (region === 'US') return ticker;

  // Indonesian stocks need .JK suffix
  return `${ticker}.JK`;
};

/**
 * Convert Yahoo ticker back to local format
 */
export const fromYahooTicker = (yahooTicker) => {
  if (!yahooTicker) return null;
  return yahooTicker.replace('.JK', '').replace('.', '');
};

// ============================================================================
// LIVE QUOTE FETCHING
// ============================================================================

/**
 * Fetch live quote for a single stock
 * @param {string} ticker - Stock ticker
 * @param {string} region - 'Indonesia' or 'US'
 * @returns {Promise<Object>} Live quote data
 */
export const fetchLiveQuote = async (ticker, region = 'Indonesia') => {
  const yahooTicker = toYahooTicker(ticker, region);
  const cacheKey = `quote:${yahooTicker}`;

  // Check cache first
  const cached = getCached(cacheKey, CACHE_DURATION.quote);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  try {
    // Use Vite proxy for Yahoo Finance API
    const url = `/api/yahoo/v7/finance/quote?symbols=${yahooTicker}`;
    const data = await rateLimitedFetch(url);

    if (!data?.quoteResponse?.result?.[0]) {
      throw new Error('No quote data returned');
    }

    const quote = data.quoteResponse.result[0];

    const result = {
      ticker: fromYahooTicker(quote.symbol),
      yahooTicker: quote.symbol,
      price: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      avgVolume: quote.averageDailyVolume3Month,
      marketCap: quote.marketCap,
      pe: quote.trailingPE,
      eps: quote.epsTrailingTwelveMonths,
      week52High: quote.fiftyTwoWeekHigh,
      week52Low: quote.fiftyTwoWeekLow,
      dividend: quote.trailingAnnualDividendYield,
      beta: quote.beta,
      marketState: quote.marketState, // PRE, REGULAR, POST, CLOSED
      lastUpdated: new Date(quote.regularMarketTime * 1000).toISOString(),
      currency: quote.currency,
      exchange: quote.exchange,
      fromCache: false,
    };

    setCache(cacheKey, result);
    return result;

  } catch (error) {
    console.warn(`Failed to fetch live quote for ${ticker}:`, error.message);
    return null;
  }
};

/**
 * Fetch live quotes for multiple stocks (batch)
 * @param {Array<{ticker: string, region: string}>} stocks - Array of stocks
 * @returns {Promise<Map<string, Object>>} Map of ticker to quote data
 */
export const fetchLiveQuotes = async (stocks) => {
  if (!stocks || stocks.length === 0) return new Map();

  // Group by region and convert to Yahoo format
  const yahooTickers = stocks
    .map(s => toYahooTicker(s.ticker, s.region))
    .filter(Boolean);

  // Check which ones are cached
  const results = new Map();
  const tickersToFetch = [];

  for (const yahooTicker of yahooTickers) {
    const cacheKey = `quote:${yahooTicker}`;
    const cached = getCached(cacheKey, CACHE_DURATION.quote);
    if (cached) {
      results.set(fromYahooTicker(yahooTicker), { ...cached, fromCache: true });
    } else {
      tickersToFetch.push(yahooTicker);
    }
  }

  // Fetch uncached quotes in batches of 20
  const batchSize = 20;
  for (let i = 0; i < tickersToFetch.length; i += batchSize) {
    const batch = tickersToFetch.slice(i, i + batchSize);

    try {
      const url = `/api/yahoo/v7/finance/quote?symbols=${batch.join(',')}`;
      const data = await rateLimitedFetch(url);

      if (data?.quoteResponse?.result) {
        for (const quote of data.quoteResponse.result) {
          const result = {
            ticker: fromYahooTicker(quote.symbol),
            yahooTicker: quote.symbol,
            price: quote.regularMarketPrice,
            previousClose: quote.regularMarketPreviousClose,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            open: quote.regularMarketOpen,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            volume: quote.regularMarketVolume,
            avgVolume: quote.averageDailyVolume3Month,
            marketCap: quote.marketCap,
            pe: quote.trailingPE,
            eps: quote.epsTrailingTwelveMonths,
            week52High: quote.fiftyTwoWeekHigh,
            week52Low: quote.fiftyTwoWeekLow,
            dividend: quote.trailingAnnualDividendYield,
            beta: quote.beta,
            marketState: quote.marketState,
            lastUpdated: new Date(quote.regularMarketTime * 1000).toISOString(),
            currency: quote.currency,
            exchange: quote.exchange,
            fromCache: false,
          };

          setCache(`quote:${quote.symbol}`, result);
          results.set(result.ticker, result);
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch batch quotes:`, error.message);
    }
  }

  return results;
};

// ============================================================================
// MARKET OVERVIEW - Major Indices & Commodities
// ============================================================================

const MARKET_SYMBOLS = {
  // Major Indices
  indices: [
    { symbol: '^JKSE', name: 'IDX Composite', region: 'Indonesia' },
    { symbol: '^GSPC', name: 'S&P 500', region: 'US' },
    { symbol: '^DJI', name: 'Dow Jones', region: 'US' },
    { symbol: '^IXIC', name: 'NASDAQ', region: 'US' },
    { symbol: '^HSI', name: 'Hang Seng', region: 'Hong Kong' },
    { symbol: '^N225', name: 'Nikkei 225', region: 'Japan' },
  ],
  // Commodities
  commodities: [
    { symbol: 'CL=F', name: 'Crude Oil (WTI)', unit: '$/bbl' },
    { symbol: 'BZ=F', name: 'Brent Crude', unit: '$/bbl' },
    { symbol: 'GC=F', name: 'Gold', unit: '$/oz' },
    { symbol: 'SI=F', name: 'Silver', unit: '$/oz' },
    { symbol: 'HG=F', name: 'Copper', unit: '$/lb' },
    { symbol: 'NG=F', name: 'Natural Gas', unit: '$/MMBtu' },
  ],
  // Currencies relevant to Indonesian market
  currencies: [
    { symbol: 'USDIDR=X', name: 'USD/IDR', base: 'USD' },
    { symbol: 'EURUSD=X', name: 'EUR/USD', base: 'EUR' },
    { symbol: 'JPY=X', name: 'USD/JPY', base: 'JPY' },
    { symbol: 'CNY=X', name: 'USD/CNY', base: 'CNY' },
  ],
};

/**
 * Fetch market overview data (indices, commodities, currencies)
 * @returns {Promise<Object>} Market overview data
 */
export const fetchMarketOverview = async () => {
  const cacheKey = 'market:overview';
  const cached = getCached(cacheKey, CACHE_DURATION.market);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  try {
    // Combine all symbols
    const allSymbols = [
      ...MARKET_SYMBOLS.indices.map(s => s.symbol),
      ...MARKET_SYMBOLS.commodities.map(s => s.symbol),
      ...MARKET_SYMBOLS.currencies.map(s => s.symbol),
    ];

    const url = `/api/yahoo/v7/finance/quote?symbols=${allSymbols.join(',')}`;
    const data = await rateLimitedFetch(url);

    const result = {
      indices: [],
      commodities: [],
      currencies: [],
      lastUpdated: new Date().toISOString(),
      fromCache: false,
    };

    if (data?.quoteResponse?.result) {
      for (const quote of data.quoteResponse.result) {
        const item = {
          symbol: quote.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          previousClose: quote.regularMarketPreviousClose,
          marketState: quote.marketState,
        };

        // Categorize
        const indexInfo = MARKET_SYMBOLS.indices.find(s => s.symbol === quote.symbol);
        if (indexInfo) {
          result.indices.push({ ...item, name: indexInfo.name, region: indexInfo.region });
          continue;
        }

        const commodityInfo = MARKET_SYMBOLS.commodities.find(s => s.symbol === quote.symbol);
        if (commodityInfo) {
          result.commodities.push({ ...item, name: commodityInfo.name, unit: commodityInfo.unit });
          continue;
        }

        const currencyInfo = MARKET_SYMBOLS.currencies.find(s => s.symbol === quote.symbol);
        if (currencyInfo) {
          result.currencies.push({ ...item, name: currencyInfo.name, base: currencyInfo.base });
        }
      }
    }

    setCache(cacheKey, result);
    return result;

  } catch (error) {
    console.warn('Failed to fetch market overview:', error.message);
    return null;
  }
};

// ============================================================================
// LIVE NEWS - Stock-specific news
// ============================================================================

/**
 * Fetch news for a specific stock
 * @param {string} ticker - Stock ticker
 * @param {string} region - 'Indonesia' or 'US'
 * @returns {Promise<Array>} Array of news items
 */
export const fetchStockNews = async (ticker, region = 'Indonesia') => {
  const yahooTicker = toYahooTicker(ticker, region);
  const cacheKey = `news:${yahooTicker}`;

  const cached = getCached(cacheKey, CACHE_DURATION.news);
  if (cached) {
    return { items: cached, fromCache: true };
  }

  try {
    // Yahoo Finance news endpoint
    const url = `/api/yahoo/v1/finance/search?q=${yahooTicker}&newsCount=10&quotesCount=0`;
    const data = await rateLimitedFetch(url);

    if (!data?.news) {
      return { items: [], fromCache: false };
    }

    const newsItems = data.news.map(item => ({
      id: item.uuid,
      title: item.title,
      publisher: item.publisher,
      link: item.link,
      publishedAt: item.providerPublishTime
        ? new Date(item.providerPublishTime * 1000).toISOString()
        : null,
      thumbnail: item.thumbnail?.resolutions?.[0]?.url,
      relatedTickers: item.relatedTickers,
    }));

    setCache(cacheKey, newsItems);
    return { items: newsItems, fromCache: false };

  } catch (error) {
    console.warn(`Failed to fetch news for ${ticker}:`, error.message);
    return { items: [], fromCache: false, error: error.message };
  }
};

// ============================================================================
// INTRADAY CHART DATA
// ============================================================================

/**
 * Fetch intraday chart data for a stock
 * @param {string} ticker - Stock ticker
 * @param {string} region - 'Indonesia' or 'US'
 * @param {string} range - '1d', '5d', '1mo', '3mo', '6mo', '1y', '5y'
 * @param {string} interval - '1m', '5m', '15m', '1h', '1d'
 * @returns {Promise<Object>} Chart data
 */
export const fetchChartData = async (ticker, region = 'Indonesia', range = '1d', interval = '5m') => {
  const yahooTicker = toYahooTicker(ticker, region);
  const cacheKey = `chart:${yahooTicker}:${range}:${interval}`;

  const cached = getCached(cacheKey, CACHE_DURATION.chart);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  try {
    const url = `/api/yahoo/v8/finance/chart/${yahooTicker}?range=${range}&interval=${interval}`;
    const data = await rateLimitedFetch(url);

    if (!data?.chart?.result?.[0]) {
      throw new Error('No chart data returned');
    }

    const chartResult = data.chart.result[0];
    const timestamps = chartResult.timestamp || [];
    const quotes = chartResult.indicators?.quote?.[0] || {};

    const chartData = timestamps.map((ts, i) => ({
      timestamp: new Date(ts * 1000).toISOString(),
      time: new Date(ts * 1000).toLocaleTimeString(),
      date: new Date(ts * 1000).toLocaleDateString(),
      open: quotes.open?.[i],
      high: quotes.high?.[i],
      low: quotes.low?.[i],
      close: quotes.close?.[i],
      volume: quotes.volume?.[i],
    })).filter(d => d.close !== null); // Filter out null values

    const result = {
      ticker: fromYahooTicker(yahooTicker),
      yahooTicker,
      range,
      interval,
      data: chartData,
      meta: {
        currency: chartResult.meta?.currency,
        exchange: chartResult.meta?.exchangeName,
        previousClose: chartResult.meta?.previousClose,
        regularMarketPrice: chartResult.meta?.regularMarketPrice,
      },
      fromCache: false,
    };

    setCache(cacheKey, result);
    return result;

  } catch (error) {
    console.warn(`Failed to fetch chart for ${ticker}:`, error.message);
    return null;
  }
};

// ============================================================================
// YTD RETURN CALCULATION
// ============================================================================

/**
 * Calculate YTD (Year-To-Date) return for a stock using historical data
 * @param {string} ticker - Stock ticker
 * @param {string} region - 'Indonesia' or 'US'
 * @returns {Promise<Object>} YTD return data { ytdReturn, startPrice, currentPrice, startDate }
 */
export const fetchYTDReturn = async (ticker, region = 'Indonesia') => {
  const yahooTicker = toYahooTicker(ticker, region);
  const cacheKey = `ytd:${yahooTicker}`;

  // Check cache (cache for 5 minutes)
  const cached = getCached(cacheKey, CACHE_DURATION.chart);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  try {
    // Fetch YTD chart data (from start of year to now)
    const url = `/api/yahoo/v8/finance/chart/${yahooTicker}?range=ytd&interval=1d`;
    const data = await rateLimitedFetch(url);

    if (!data?.chart?.result?.[0]) {
      throw new Error('No chart data returned');
    }

    const chartResult = data.chart.result[0];
    const timestamps = chartResult.timestamp || [];
    const quotes = chartResult.indicators?.quote?.[0] || {};
    const closes = quotes.close || [];

    if (timestamps.length === 0 || closes.length === 0) {
      throw new Error('No price data available');
    }

    // Get first valid close price of the year (start price)
    let startPrice = null;
    let startIndex = 0;
    for (let i = 0; i < closes.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined) {
        startPrice = closes[i];
        startIndex = i;
        break;
      }
    }

    // Get last valid close price (current price)
    let currentPrice = null;
    for (let i = closes.length - 1; i >= 0; i--) {
      if (closes[i] !== null && closes[i] !== undefined) {
        currentPrice = closes[i];
        break;
      }
    }

    if (!startPrice || !currentPrice) {
      throw new Error('Could not determine start or current price');
    }

    // Calculate YTD return
    const ytdReturn = ((currentPrice - startPrice) / startPrice) * 100;

    const result = {
      ticker: fromYahooTicker(yahooTicker),
      yahooTicker,
      ytdReturn: Math.round(ytdReturn * 100) / 100, // Round to 2 decimals
      startPrice,
      currentPrice,
      startDate: new Date(timestamps[startIndex] * 1000).toISOString(),
      dataPoints: timestamps.length,
      fromCache: false,
    };

    setCache(cacheKey, result);
    return result;

  } catch (error) {
    console.warn(`Failed to fetch YTD return for ${ticker}:`, error.message);
    return null;
  }
};

// ============================================================================
// BATCH YTD RETURNS - For Sector Heatmap
// ============================================================================

/**
 * Fetch YTD returns for multiple stocks in batch
 * @param {Array<{ticker: string, region: string}>} stocks - Array of stocks
 * @returns {Promise<Map<string, number>>} Map of ticker to YTD return
 */
export const fetchBatchYTDReturns = async (stocks) => {
  if (!stocks || stocks.length === 0) return new Map();

  const results = new Map();

  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < stocks.length; i += batchSize) {
    const batch = stocks.slice(i, i + batchSize);

    const promises = batch.map(async ({ ticker, region }) => {
      try {
        const ytdData = await fetchYTDReturn(ticker, region);
        if (ytdData?.ytdReturn !== null && ytdData?.ytdReturn !== undefined) {
          return { ticker, ytdReturn: ytdData.ytdReturn };
        }
      } catch (error) {
        console.warn(`Failed to fetch YTD for ${ticker}:`, error.message);
      }
      return null;
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(result => {
      if (result) {
        results.set(result.ticker, result.ytdReturn);
      }
    });

    // Small delay between batches
    if (i + batchSize < stocks.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
};

/**
 * Fetch JCI (Jakarta Composite Index) YTD return
 * @returns {Promise<Object>} JCI YTD data
 */
export const fetchJCIReturn = async () => {
  const cacheKey = 'ytd:^JKSE';

  const cached = getCached(cacheKey, CACHE_DURATION.chart);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  try {
    const url = `/api/yahoo/v8/finance/chart/^JKSE?range=ytd&interval=1d`;
    const data = await rateLimitedFetch(url);

    if (!data?.chart?.result?.[0]) {
      throw new Error('No JCI data returned');
    }

    const chartResult = data.chart.result[0];
    const timestamps = chartResult.timestamp || [];
    const quotes = chartResult.indicators?.quote?.[0] || {};
    const closes = quotes.close || [];

    if (timestamps.length === 0 || closes.length === 0) {
      throw new Error('No JCI price data');
    }

    let startPrice = null;
    for (let i = 0; i < closes.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined) {
        startPrice = closes[i];
        break;
      }
    }

    let currentPrice = null;
    for (let i = closes.length - 1; i >= 0; i--) {
      if (closes[i] !== null && closes[i] !== undefined) {
        currentPrice = closes[i];
        break;
      }
    }

    if (!startPrice || !currentPrice) {
      throw new Error('Could not determine JCI prices');
    }

    const ytdReturn = ((currentPrice - startPrice) / startPrice) * 100;

    const result = {
      ticker: '^JKSE',
      name: 'Jakarta Composite Index',
      ytdReturn: Math.round(ytdReturn * 100) / 100,
      startPrice,
      currentPrice,
      fromCache: false,
    };

    setCache(cacheKey, result);
    return result;

  } catch (error) {
    console.warn('Failed to fetch JCI return:', error.message);
    return null;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clear all cached data
 */
export const clearCache = () => {
  cache.clear();
};

/**
 * Clear cache for specific ticker
 */
export const clearTickerCache = (ticker, region = 'Indonesia') => {
  const yahooTicker = toYahooTicker(ticker, region);
  cache.delete(`quote:${yahooTicker}`);
  cache.delete(`news:${yahooTicker}`);
  // Clear all chart caches for this ticker
  for (const key of cache.keys()) {
    if (key.startsWith(`chart:${yahooTicker}:`)) {
      cache.delete(key);
    }
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  let validEntries = 0;
  let expiredEntries = 0;
  const now = Date.now();

  for (const [key, value] of cache.entries()) {
    const maxAge = key.startsWith('quote:') ? CACHE_DURATION.quote :
                   key.startsWith('news:') ? CACHE_DURATION.news :
                   key.startsWith('chart:') ? CACHE_DURATION.chart :
                   CACHE_DURATION.market;

    if (now - value.timestamp < maxAge) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }

  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries,
  };
};

/**
 * Check if live data service is available (has proxy configured)
 */
export const checkServiceAvailability = async () => {
  try {
    // Try to fetch a simple quote to test connectivity
    const url = `/api/yahoo/v7/finance/quote?symbols=AAPL`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check if we got valid JSON response
    if (response.ok) {
      try {
        const data = await response.json();
        // Check if we got actual quote data
        return !!(data?.quoteResponse?.result?.length > 0);
      } catch {
        return false;
      }
    }

    // 429 means rate limited but service is reachable
    if (response.status === 429) {
      console.warn('Yahoo Finance API rate limited - try again later');
      return true;
    }

    return response.status < 500;
  } catch (error) {
    // Network errors, DNS failures, timeouts
    if (error.name === 'AbortError') {
      console.warn('Live data service check timed out');
    } else {
      console.warn('Live data service check failed:', error.message);
    }
    return false;
  }
};

// Export market symbols for UI
export { MARKET_SYMBOLS };
