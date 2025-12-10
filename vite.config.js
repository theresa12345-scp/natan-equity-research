import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'safari >= 12', 'iOS >= 12'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
  build: {
    // Safari compatibility - es2019 supports Safari 13.1+
    target: 'es2019',
    // Ensure compatibility with older browsers
    cssTarget: 'safari12',
  },
  // ============================================================================
  // PROXY CONFIGURATION - Bypass CORS for Yahoo Finance API
  // Routes /api/yahoo/* to Yahoo Finance endpoints
  // Using query2.finance.yahoo.com as primary (more reliable)
  // ============================================================================
  server: {
    port: 5174,
    proxy: {
      // Yahoo Finance API v7 (quotes)
      '/api/yahoo/v7': {
        target: 'https://query2.finance.yahoo.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      // Yahoo Finance API v8 (charts)
      '/api/yahoo/v8': {
        target: 'https://query2.finance.yahoo.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      // Yahoo Finance API v1 (search/news)
      '/api/yahoo/v1': {
        target: 'https://query2.finance.yahoo.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      // Yahoo Finance API alternate endpoint (query1) - fallback for rate limiting
      '/api/yahoo-alt': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo-alt/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      // Financial Modeling Prep API (financial statements) - deprecated
      '/api/fmp': {
        target: 'https://financialmodelingprep.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/fmp/, '/api'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      },
      // SEC EDGAR API (company facts/financials) - requires User-Agent header
      '/api/sec': {
        target: 'https://data.sec.gov',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/sec/, ''),
        headers: {
          'User-Agent': 'NatanEquityResearch/1.0 (Educational Research Tool; research@example.com)',
          'Accept': 'application/json',
        },
      },
    },
  },
})
