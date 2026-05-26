/**
 * NATAN Equity Research - S&P 500 Data Fetcher
 * Fetches comprehensive financial data for S&P 500 + major global companies
 * Source: Yahoo Finance (via yahoo-finance2)
 */

import YahooFinance from 'yahoo-finance2';
import fs from 'fs';

// Instantiate yahoo-finance2
const yahooFinance = new YahooFinance();

// S&P 500 tickers - major components + all sectors
const SP500_TICKERS = [
  // Mega Cap Tech (Top 10 by market cap)
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'BRK-B', 'AVGO', 'LLY',

  // Technology
  'ORCL', 'AMD', 'CRM', 'ADBE', 'CSCO', 'ACN', 'INTC', 'QCOM', 'TXN', 'IBM',
  'NOW', 'INTU', 'AMAT', 'MU', 'ADI', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MRVL',
  'FTNT', 'PANW', 'CRWD', 'WDAY', 'ADSK', 'DDOG', 'ZS', 'ANSS', 'KEYS', 'MPWR',
  'ON', 'NXPI', 'GEN', 'CTSH', 'HPQ', 'HPE',

  // Healthcare
  'UNH', 'JNJ', 'MRK', 'ABBV', 'PFE', 'TMO', 'ABT', 'DHR', 'BMY', 'AMGN',
  'GILD', 'VRTX', 'REGN', 'MDT', 'ISRG', 'SYK', 'BSX', 'EW', 'ZBH', 'BDX',
  'HCA', 'CI', 'ELV', 'MCK', 'IDXX', 'IQV', 'A', 'DGX', 'HOLX', 'ALGN',
  'DXCM', 'BIIB', 'MRNA', 'GEHC',

  // Financial Services
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'SPGI', 'BLK', 'SCHW',
  'AXP', 'C', 'PNC', 'USB', 'TFC', 'COF', 'CME', 'ICE', 'MCO', 'AON',
  'MMC', 'CB', 'MET', 'AIG', 'PRU', 'AFL', 'TRV', 'PGR', 'ALL', 'MTB',
  'FITB', 'KEY', 'RF', 'HBAN', 'CFG',

  // Consumer Discretionary
  'HD', 'MCD', 'NKE', 'SBUX', 'TJX', 'BKNG', 'LOW', 'CMG', 'ORLY', 'AZO',
  'ROST', 'MAR', 'HLT', 'YUM', 'DRI', 'GRMN', 'EBAY', 'ETSY', 'BBY', 'DHI',
  'LEN', 'PHM', 'NVR', 'F', 'GM', 'APTV',

  // Consumer Staples
  'PG', 'KO', 'PEP', 'COST', 'WMT', 'PM', 'MO', 'MDLZ', 'CL', 'EL',
  'KMB', 'GIS', 'K', 'HSY', 'MKC', 'CAG', 'CHD', 'TSN', 'ADM', 'KR',
  'SYY', 'TGT', 'DG', 'DLTR', 'KHC',

  // Communication Services
  'NFLX', 'DIS', 'CMCSA', 'T', 'VZ', 'CHTR', 'TMUS', 'EA', 'TTWO', 'PARA',
  'WBD', 'FOX', 'OMC', 'IPG',

  // Industrials
  'CAT', 'GE', 'HON', 'RTX', 'UNP', 'UPS', 'DE', 'LMT', 'BA', 'NOC',
  'GD', 'TDG', 'ITW', 'EMR', 'ETN', 'PH', 'ROK', 'CARR', 'OTIS', 'JCI',
  'SWK', 'FAST', 'CTAS', 'PAYX', 'VRSK', 'RSG', 'WM', 'PCAR', 'NSC', 'CSX',
  'FDX', 'DAL', 'UAL', 'LUV', 'IR', 'XYL', 'DOV', 'AME', 'CPRT', 'ODFL',

  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'DVN',
  'HES', 'HAL', 'BKR', 'KMI', 'WMB', 'OKE', 'TRGP',

  // Materials
  'LIN', 'APD', 'SHW', 'ECL', 'DD', 'NEM', 'FCX', 'NUE', 'VMC', 'MLM',
  'ALB', 'PPG', 'CTVA', 'CF', 'MOS', 'IFF',

  // Real Estate
  'PLD', 'AMT', 'EQIX', 'PSA', 'CCI', 'O', 'SPG', 'WELL', 'DLR', 'VICI',
  'SBAC', 'AVB', 'EQR', 'EXR', 'MAA',

  // Utilities
  'NEE', 'SO', 'DUK', 'AEP', 'D', 'SRE', 'XEL', 'ED', 'EXC', 'PEG',
  'WEC', 'ES', 'EIX', 'PPL', 'FE', 'DTE', 'AEE', 'CMS', 'AES', 'CEG',
];

// Sector mapping
const SECTOR_MAP = {
  'Technology': 'Technology',
  'Healthcare': 'Healthcare',
  'Financial Services': 'Financial',
  'Consumer Cyclical': 'Consumer, Cyclical',
  'Consumer Defensive': 'Consumer, Non-cyclical',
  'Communication Services': 'Communications',
  'Industrials': 'Industrial',
  'Basic Materials': 'Basic Materials',
  'Energy': 'Energy',
  'Utilities': 'Utilities',
  'Real Estate': 'Financial',
};

async function fetchStockData(ticker) {
  try {
    const quote = await yahooFinance.quoteSummary(ticker, {
      modules: ['price', 'summaryDetail', 'defaultKeyStatistics', 'financialData', 'assetProfile', 'incomeStatementHistory']
    });

    if (!quote || !quote.price) {
      console.log(`  ⚠️ No data for ${ticker}`);
      return null;
    }

    const price = quote.price;
    const summary = quote.summaryDetail || {};
    const keyStats = quote.defaultKeyStatistics || {};
    const financial = quote.financialData || {};
    const profile = quote.assetProfile || {};
    const incomeHistory = quote.incomeStatementHistory?.incomeStatementHistory || [];

    const currentPrice = price.regularMarketPrice;
    const marketCap = price.marketCap;

    if (!currentPrice || !marketCap) {
      console.log(`  ⚠️ Missing price/market cap for ${ticker}`);
      return null;
    }

    // Map sector from assetProfile (more reliable)
    const rawSector = profile.sector || price.sector || 'Unknown';
    const sector = SECTOR_MAP[rawSector] || rawSector;
    const industry = profile.industry || price.industry || '';

    // Calculate metrics
    const pe = summary.trailingPE || keyStats.forwardPE;
    const pb = summary.priceToBook;
    const roe = financial.returnOnEquity ? financial.returnOnEquity * 100 : null;
    const de = financial.debtToEquity;
    const revenueGrowth = financial.revenueGrowth ? financial.revenueGrowth * 100 : null;
    const earningsGrowth = financial.earningsGrowth ? financial.earningsGrowth * 100 : null;
    const grossMargin = financial.grossMargins ? financial.grossMargins * 100 : null;
    const ebitdaMargin = financial.ebitdaMargins ? financial.ebitdaMargins * 100 : null;
    const currentRatio = financial.currentRatio;
    const quickRatio = financial.quickRatio;
    const beta = summary.beta;
    const dividendYield = summary.dividendYield ? summary.dividendYield * 100 : null;
    const fcf = financial.freeCashflow;
    const revenue = financial.totalRevenue;
    const netIncome = financial.netIncomeToCommon;
    const ebitda = financial.ebitda;

    // YTD return (52 week change)
    const ytdReturn = summary.fiftyTwoWeekChange ? summary.fiftyTwoWeekChange * 100 : null;

    // Get Net Income from income history if not available from financialData
    let finalNetIncome = netIncome;
    if (!finalNetIncome && incomeHistory.length > 0) {
      finalNetIncome = incomeHistory[0]?.netIncome;
    }

    return {
      Ticker: ticker,
      Name: price.shortName || price.longName || ticker,
      'Industry Sector': sector,
      'Industry Group': industry,
      Region: 'US',
      'Market Cap': marketCap,
      Price: currentPrice,
      PE: pe ? Math.round(pe * 100) / 100 : null,
      PB: pb ? Math.round(pb * 100) / 100 : null,
      ROE: roe ? Math.round(roe * 100) / 100 : null,
      DE: de ? Math.round(de * 100) / 100 : null,
      Beta: beta ? Math.round(beta * 10000) / 10000 : null,
      Alpha: null,
      'Company YTD Return': ytdReturn ? Math.round(ytdReturn * 100) / 100 : null,
      Revenue: revenue,
      'Revenue Growth': revenueGrowth ? Math.round(revenueGrowth * 100) / 100 : null,
      'Net Income': finalNetIncome,
      'EPS Growth': earningsGrowth ? Math.round(earningsGrowth * 100) / 100 : null,
      'Net Income Growth': earningsGrowth ? Math.round(earningsGrowth * 100) / 100 : null,
      FCF: fcf,
      EBITDA: ebitda,
      'FCF Conversion': (fcf && finalNetIncome && finalNetIncome > 0) ? Math.round((fcf / finalNetIncome) * 100) / 100 : null,
      'Gross Margin': grossMargin ? Math.round(grossMargin * 100) / 100 : null,
      'EBITDA Margin': ebitdaMargin ? Math.round(ebitdaMargin * 100) / 100 : null,
      'Cur Ratio': currentRatio ? Math.round(currentRatio * 100) / 100 : null,
      'Quick Ratio': quickRatio ? Math.round(quickRatio * 100) / 100 : null,
      'Dividend Yield': dividendYield ? Math.round(dividendYield * 100) / 100 : null,
      Weight: null,
    };
  } catch (error) {
    console.log(`  ❌ Error fetching ${ticker}: ${error.message.substring(0, 50)}`);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('='.repeat(60));
  console.log('NATAN Equity Research - S&P 500 Data Fetcher');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  const allData = [];
  const uniqueTickers = [...new Set(SP500_TICKERS)];
  const total = uniqueTickers.length;

  console.log(`\n📊 Fetching ${total} US stocks...`);

  // Fetch in batches with rate limiting
  const batchSize = 5;
  for (let i = 0; i < total; i += batchSize) {
    const batch = uniqueTickers.slice(i, i + batchSize);
    console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(total / batchSize)}: ${batch.join(', ')}`);

    const promises = batch.map(ticker => fetchStockData(ticker));
    const results = await Promise.all(promises);

    for (const result of results) {
      if (result) allData.push(result);
    }

    // Rate limiting
    if (i + batchSize < total) {
      await sleep(1000);
    }
  }

  console.log(`  ✅ Successfully fetched ${allData.length}/${total} US stocks`);

  // Load existing Indonesian data
  try {
    const existingData = JSON.parse(fs.readFileSync('public/global_companies_full.json', 'utf8'));
    const indoData = existingData.filter(d => d.Region === 'Indonesia');
    console.log(`\n📊 Keeping ${indoData.length} Indonesian stocks from existing data`);
    allData.push(...indoData);
  } catch (e) {
    console.log(`⚠️ Could not load existing data: ${e.message}`);
  }

  // Remove duplicates and sort by market cap
  const seen = new Set();
  const uniqueData = allData.filter(d => {
    if (seen.has(d.Ticker)) return false;
    seen.add(d.Ticker);
    return true;
  }).sort((a, b) => (b['Market Cap'] || 0) - (a['Market Cap'] || 0));

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const regions = {};
  uniqueData.forEach(d => {
    const r = d.Region || 'Unknown';
    regions[r] = (regions[r] || 0) + 1;
  });

  console.log(`Total companies: ${uniqueData.length}`);
  Object.entries(regions).sort().forEach(([r, count]) => {
    console.log(`  ${r}: ${count}`);
  });

  // Save to file
  const outputPath = 'public/global_companies_full.json';
  fs.writeFileSync(outputPath, JSON.stringify(uniqueData, null, 2));

  console.log(`\n✅ Saved to ${outputPath}`);
  console.log(`Finished: ${new Date().toISOString()}`);
}

main().catch(console.error);
