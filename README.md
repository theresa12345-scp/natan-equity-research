# NATAN Equity Research Platform

> **Professional-grade equity screening and valuation platform** for global securities analysis with multi-factor scoring, DCF valuation, and comparable company analysis.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)]()
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-purple)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.17-38bdf8)](https://tailwindcss.com/)

---

## Overview

**NATAN** (Nathaniel's Analytical Trading & Analysis Network) is an institutional-grade equity research platform designed to screen, analyze, and value securities across global markets. Built to support investment decision-making with quantitative rigor and professional workflows.

### Key Capabilities

- **949 Global Securities**: Coverage across Indonesian (IDX) and US markets
- **Multi-Factor Scoring System**: Proprietary 1-10 scoring model based on 5 key categories
- **DCF Valuation Engine**: Full discounted cash flow analysis with sensitivity tables
- **Comparable Analysis**: Sector-relative valuation with peer benchmarking
- **Macro Integration**: Real-time Indonesia economic indicators dashboard
- **AI-Powered Sentiment**: News analysis and market intelligence (experimental)

---

## Features

### 1. Macro Dashboard
Real-time economic indicators for Indonesia including:
- GDP Growth, Inflation, BI Rate, Bond Yields
- Manufacturing PMI, Industrial Production
- Trade Balance, FDI Flows
- Market indices (JCI, S&P 500)
- Commodity prices (Brent, CPO, Coal, Nickel)

### 2. Equity Screener
Advanced filtering and ranking system:
- **Multi-factor scoring** (Fundamental 40%, Valuation 25%, Momentum 15%, Technical 10%, Macro 10%)
- Filter by sector, region, minimum score
- Sort by any metric (P/E, ROE, YTD return, etc.)
- Displays top 100 results with instant search

### 3. Stock Analysis
Comprehensive per-security analysis:
- **Score breakdown** with category-level visualization
- **Fundamental metrics**: P/E, P/B, ROE, Beta, D/E, Growth rates
- **DCF Valuation**: Intrinsic value calculation with WACC and sensitivity analysis
- **Comparable Companies**: Sector median multiples and implied valuations
- Rating system (Strong Buy, Buy, Hold, Underperform, Sell)

---

## Methodology

### Multi-Factor Scoring Model

The NATAN Score (1.0 - 10.0 scale) evaluates stocks across five dimensions:

#### 1. Fundamental (40%)
- **ROE** (Return on Equity) - Primary quality indicator
- **Revenue Growth** - Top-line expansion
- **EPS Growth** - Earnings momentum
- **Financial Health** - Debt/Equity ratio relative to sector benchmarks

#### 2. Valuation (25%)
- **P/E Ratio** - Relative to sector median
- **P/B Ratio** - Relative to sector median
- Incorporates sector-specific valuation benchmarks

#### 3. Momentum (15%)
- **YTD Performance** - Price appreciation
- **Alpha** - Risk-adjusted outperformance

#### 4. Technical (10%)
- **Beta** - Systematic risk and volatility
- **Market Cap** - Liquidity and size factor

#### 5. Macro Alignment (10%)
- Sector-specific macro tailwinds
- Examples:
  - Financials favor optimal interest rate environments
  - Energy benefits from rising oil prices
  - Consumers thrive in strong GDP growth environments

### DCF Valuation

The platform implements a full DCF model:
- 5-year explicit forecast period with decaying growth
- Terminal value using perpetuity growth method
- WACC calculation incorporating Beta and region-specific parameters
- Sensitivity analysis across growth and discount rate assumptions

**Parameters by Region:**

| Parameter | Indonesia | United States |
|-----------|-----------|---------------|
| Risk-Free Rate | 6.997% (10Y Govt Bond) | 4.50% |
| Market Risk Premium | 8.5% | 6.0% |
| Terminal Growth | 4.0% | 2.5% |
| Tax Rate | 22% | 21% |

---

## Tech Stack

### Frontend
- **React 19.2** - UI library with hooks for state management
- **Vite 7.2** - Lightning-fast build tool and dev server
- **TailwindCSS 4.1** - Utility-first CSS framework
- **Lucide React** - Icon system

### Data & Processing
- **949 securities** stored in JSON format
- Client-side computation for instant filtering/sorting
- Memoization for performance optimization
- Real-time score calculation

### Deployment
- Static site generation
- CDN-optimized delivery
- Sub-second page loads

---

## Getting Started

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/natan-equity-research.git
cd natan-equity-research

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

---

## Project Structure

```
natan-equity-research/
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/
│   ├── global_companies_full.json  # 949 securities dataset
│   └── sentiment.json       # AI sentiment analysis data
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## Data Sources

- **Security Data**: Yahoo Finance, Bloomberg, IDX
- **Macro Indicators**: Bank Indonesia, BPS (Statistics Indonesia), Trading Economics
- **Sentiment Analysis**: Financial news APIs with custom NLP processing

**Data Freshness**: Q4 2024 (latest available)

---

## Use Cases

### For Investment Professionals
- **Idea Generation**: Quickly screen for undervalued, high-quality opportunities
- **Due Diligence**: Comprehensive fundamental analysis in one view
- **Macro Context**: Understand sector positioning in current economic environment

### For Portfolio Managers
- **Top-Down Analysis**: Start with macro, filter to attractive sectors, drill into stocks
- **Valuation Discipline**: DCF and comps provide multiple valuation perspectives
- **Risk Assessment**: Beta, D/E, and diversification metrics

### For Equity Analysts
- **Peer Benchmarking**: Instantly compare stocks to sector medians
- **Scenario Analysis**: Sensitivity tables for DCF assumptions
- **Methodology**: Transparent, replicable scoring system

---

## Roadmap

### Planned Features
- [ ] Export to Excel/CSV
- [ ] Portfolio tracking and watchlist
- [ ] Historical backtesting of high-scoring stocks
- [ ] Advanced charting with technical indicators
- [ ] Custom factor weighting
- [ ] PDF report generation
- [ ] Real-time data integration
- [ ] API endpoints for programmatic access

---

## Performance

- **Initial Load**: < 2 seconds
- **Screener Filter**: < 100ms
- **Score Calculation**: Real-time for 949 securities
- **DCF Computation**: < 50ms per stock

Optimizations:
- React memoization for expensive calculations
- Virtual scrolling for large tables (planned)
- Code splitting and lazy loading

---

## Screenshots

### Macro Dashboard
*Indonesia economic indicators with real-time data*

### Equity Screener
*Multi-factor scoring and advanced filtering*

### Stock Analysis
*Comprehensive fundamental analysis with DCF and comps*

---

## Author

**Nathaniel Luu**
- Investment Analyst, AXA Mandiri
- LinkedIn: [Your LinkedIn]
- Email: your.email@example.com
- Portfolio: [Your Portfolio Site]

---

## Acknowledgments

Inspired by institutional equity research methodologies from:
- Goldman Sachs Multi-Factor Models
- JP Morgan Valuation Frameworks
- Morgan Stanley Sector Analysis
- BlackRock Factor Investing
- Fidelity Fundamental Research

---

## License

This project is proprietary and intended for portfolio demonstration purposes.

---

## Contact

For questions, collaboration, or opportunities:
- Email: nathanielnluu@gmail.com
