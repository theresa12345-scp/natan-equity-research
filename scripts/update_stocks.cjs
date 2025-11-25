/**
 * NATAN Equity Research - Stock Data Updater
 * ============================================
 * Fetches real-time stock data from Yahoo Finance.
 *
 * Usage: node scripts/update_stocks.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Tickers to fetch
const INDONESIA_TICKERS = [
  "BBRI.JK", "BBCA.JK", "BMRI.JK", "BBNI.JK",
  "TLKM.JK", "ASII.JK", "UNVR.JK", "HMSP.JK",
  "ICBP.JK", "INDF.JK", "KLBF.JK", "ADRO.JK",
  "PTBA.JK", "SMGR.JK", "INTP.JK", "UNTR.JK",
  "GOTO.JK", "EMTK.JK", "MDKA.JK", "ANTM.JK",
  "INCO.JK", "EXCL.JK", "ISAT.JK", "TOWR.JK",
  "TBIG.JK", "MYOR.JK", "GGRM.JK", "AMRT.JK",
  "MEDC.JK", "BRIS.JK",
];

const US_TICKERS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK-B",
  "JPM", "V", "MA", "UNH", "JNJ", "XOM", "PG", "HD", "CVX", "MRK",
  "ABBV", "KO", "PEP", "COST", "PFE", "AVGO", "TMO", "MCD", "WMT",
  "CSCO", "ABT", "ACN", "DHR", "LLY", "NKE", "ORCL", "TXN", "NEE",
  "CRM", "AMD", "PM", "UPS", "INTC", "HON", "IBM", "QCOM", "LOW",
  "CAT", "BA", "GE", "AMAT", "SBUX", "RTX", "SPGI", "GS", "BLK",
  "MS", "AXP", "DE", "C", "WFC", "BAC", "GILD", "T", "VZ", "NFLX",
  "DIS", "EOG", "SLB", "COP",
];

const SECTOR_MAP = {
  "Technology": ["Technology"],
  "Financial": ["Financial Services"],
  "Healthcare": ["Healthcare"],
  "Consumer, Cyclical": ["Consumer Cyclical"],
  "Consumer, Non-cyclical": ["Consumer Defensive"],
  "Industrial": ["Industrials"],
  "Energy": ["Energy"],
  "Basic Materials": ["Basic Materials"],
  "Communications": ["Communication Services"],
  "Utilities": ["Utilities"],
  "Real Estate": ["Real Estate"],
};

function mapSector(yahooSector) {
  for (const [ourSector, yahooSectors] of Object.entries(SECTOR_MAP)) {
    if (yahooSectors.includes(yahooSector)) {
      return ourSector;
    }
  }
  return yahooSector || 'Unknown';
}

function fetchYahooFinance(ticker) {
  return new Promise((resolve, reject) => {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price,summaryDetail,defaultKeyStatistics,financialData`;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getStockData(ticker, region) {
  try {
    const data = await fetchYahooFinance(ticker);

    if (!data.quoteSummary || !data.quoteSummary.result) {
      console.log(`  ⚠️ No data for ${ticker}`);
      return null;
    }

    const result = data.quoteSummary.result[0];
    const price = result.price || {};
    const summary = result.summaryDetail || {};
    const keyStats = result.defaultKeyStatistics || {};
    const financials = result.financialData || {};

    const marketCap = price.marketCap?.raw || 0;
    const currentPrice = price.regularMarketPrice?.raw || 0;
    const pe = summary.trailingPE?.raw || keyStats.forwardPE?.raw;
    const pb = keyStats.priceToBook?.raw;
    const roe = financials.returnOnEquity?.raw;
    const de = summary.debtToEquity?.raw;
    const beta = keyStats.beta?.raw;
    const revenueGrowth = financials.revenueGrowth?.raw;
    const earningsGrowth = financials.earningsGrowth?.raw;
    const ebitdaMargin = financials.ebitdaMargins?.raw;
    const grossMargin = financials.grossMargins?.raw;
    const currentRatio = financials.currentRatio?.raw;
    const quickRatio = financials.quickRatio?.raw;
    const revenue = financials.totalRevenue?.raw;
    const fcf = financials.freeCashflow?.raw;
    const ebitda = financials.ebitda?.raw;

    const sector = price.sector || 'Unknown';
    const industry = price.industry || 'Unknown';

    const displayTicker = ticker.replace('.JK', '');

    return {
      Ticker: displayTicker,
      Name: price.longName || price.shortName || ticker,
      "Industry Sector": mapSector(sector),
      "Industry Group": industry,
      Region: region,
      "Market Cap": marketCap,
      Price: currentPrice ? Math.round(currentPrice * 100) / 100 : null,
      PE: pe ? Math.round(pe * 100) / 100 : null,
      PB: pb ? Math.round(pb * 100) / 100 : null,
      ROE: roe ? Math.round(roe * 10000) / 100 : null,
      DE: de ? Math.round(de * 100) / 100 : null,
      Beta: beta ? Math.round(beta * 1000) / 1000 : null,
      "Revenue Growth": revenueGrowth ? Math.round(revenueGrowth * 10000) / 100 : null,
      "EPS Growth": earningsGrowth ? Math.round(earningsGrowth * 10000) / 100 : null,
      Revenue: revenue,
      FCF: fcf,
      EBITDA: ebitda,
      "EBITDA Margin": ebitdaMargin ? Math.round(ebitdaMargin * 10000) / 100 : null,
      "Gross Margin": grossMargin ? Math.round(grossMargin * 10000) / 100 : null,
      "Cur Ratio": currentRatio ? Math.round(currentRatio * 100) / 100 : null,
      "Quick Ratio": quickRatio ? Math.round(quickRatio * 100) / 100 : null,
    };
  } catch (error) {
    console.log(`  ❌ Error: ${ticker} - ${error.message}`);
    return null;
  }
}

function formatMarketCap(mc) {
  if (mc >= 1e12) return `$${(mc/1e12).toFixed(1)}T`;
  if (mc >= 1e9) return `$${(mc/1e9).toFixed(1)}B`;
  return `$${(mc/1e6).toFixed(1)}M`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('='.repeat(60));
  console.log('NATAN Stock Data Updater');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  const allStocks = [];

  // Indonesia
  console.log(`\n📊 Fetching ${INDONESIA_TICKERS.length} Indonesian stocks...`);
  for (let i = 0; i < INDONESIA_TICKERS.length; i++) {
    const ticker = INDONESIA_TICKERS[i];
    process.stdout.write(`  [${i+1}/${INDONESIA_TICKERS.length}] ${ticker}... `);

    const data = await getStockData(ticker, 'Indonesia');
    if (data) {
      allStocks.push(data);
      console.log(`OK - ${formatMarketCap(data["Market Cap"])}`);
    } else {
      console.log('SKIP');
    }

    await sleep(500); // Rate limiting
  }

  // US
  console.log(`\n📊 Fetching ${US_TICKERS.length} US stocks...`);
  for (let i = 0; i < US_TICKERS.length; i++) {
    const ticker = US_TICKERS[i];
    process.stdout.write(`  [${i+1}/${US_TICKERS.length}] ${ticker}... `);

    const data = await getStockData(ticker, 'US');
    if (data) {
      allStocks.push(data);
      console.log(`OK - ${formatMarketCap(data["Market Cap"])}`);
    } else {
      console.log('SKIP');
    }

    await sleep(500); // Rate limiting
  }

  // Sort by market cap
  allStocks.sort((a, b) => (b["Market Cap"] || 0) - (a["Market Cap"] || 0));

  // Save
  const outputPath = path.join(__dirname, '..', 'public', 'global_companies_full.json');
  fs.writeFileSync(outputPath, JSON.stringify(allStocks, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Saved ${allStocks.length} stocks to ${outputPath}`);
  console.log('\nTop 5 by Market Cap:');
  allStocks.slice(0, 5).forEach(s => {
    console.log(`  ${s.Ticker.padEnd(6)} ${formatMarketCap(s["Market Cap"]).padEnd(10)} $${s.Price}`);
  });
  console.log('='.repeat(60));
}

main().catch(console.error);
