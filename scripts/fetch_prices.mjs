/**
 * NATAN Stock Price Updater using yahoo-finance2
 * Fetches latest prices and updates the JSON file
 */

import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read existing data
const dataPath = path.join(__dirname, '..', 'public', 'global_companies_full.json');
const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`📊 Updating ${existingData.length} stocks with latest prices...`);

// Create ticker mapping
const tickerMap = {};
for (const stock of existingData) {
  const yahooTicker = stock.Region === 'Indonesia' ? `${stock.Ticker}.JK` : stock.Ticker;
  tickerMap[yahooTicker] = stock;
}

// Fetch quotes in batches
const tickers = Object.keys(tickerMap);
const batchSize = 50;
let updated = 0;
let failed = 0;

for (let i = 0; i < tickers.length; i += batchSize) {
  const batch = tickers.slice(i, i + batchSize);
  console.log(`\nBatch ${Math.floor(i/batchSize) + 1}: Fetching ${batch.length} tickers...`);

  try {
    const quotes = await yahooFinance.quote(batch);

    for (const quote of quotes) {
      if (!quote || !quote.regularMarketPrice) continue;

      const ticker = quote.symbol;
      const stock = tickerMap[ticker];
      if (!stock) continue;

      // Update price
      const newPrice = quote.regularMarketPrice;
      const oldPrice = stock.Price;
      stock.Price = newPrice;

      // Update market cap if available
      if (quote.marketCap) {
        stock["Market Cap"] = quote.marketCap;
      }

      // Update other metrics if available
      if (quote.trailingPE) stock.PE = Math.round(quote.trailingPE * 100) / 100;
      if (quote.priceToBook) stock.PB = Math.round(quote.priceToBook * 100) / 100;

      const pctChange = oldPrice ? ((newPrice - oldPrice) / oldPrice * 100).toFixed(2) : 'N/A';
      console.log(`  ✅ ${stock.Ticker}: ${oldPrice} → ${newPrice} (${pctChange}%)`);
      updated++;
    }
  } catch (err) {
    console.log(`  ❌ Batch error: ${err.message}`);
    failed += batch.length;
  }

  // Rate limiting
  await new Promise(r => setTimeout(r, 1000));
}

// Save updated data
fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Updated: ${updated} stocks`);
console.log(`❌ Failed: ${failed} stocks`);
console.log(`📁 Saved to: ${dataPath}`);
