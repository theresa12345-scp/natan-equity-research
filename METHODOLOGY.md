# Global Equity Screener

## Valuation Methodology & Technical Documentation

**Version 3.1 | December 2025**

**Prepared by: Nathaniel Luu**

---

## Executive Summary

The Global Equity Screener is an institutional-grade equity screening and valuation system covering **1,203 securities** across the Indonesian Stock Exchange (IDX), S&P 500, and select global markets. The platform integrates three core analytical frameworks:

1. **Discounted Cash Flow (DCF) Valuation** - Damodaran two-stage model with H-model growth decay
2. **Comparable Company Analysis** - GICS-based peer selection with sector-specific multiples
3. **Multi-Factor Quantitative Scoring** - 8-factor model calibrated for emerging market dynamics

This documentation serves as the definitive reference for investment professionals seeking to understand the analytical foundations, assumptions, and limitations of each methodology.

---

## Table of Contents

1. [Investment Philosophy](#1-investment-philosophy)
2. [Multi-Factor (MF) Scoring Model](#2-multi-factor-mf-scoring-model)
3. [DCF Valuation Methodology](#3-dcf-valuation-methodology)
4. [Comparable Company Analysis](#4-comparable-company-analysis)
5. [Sensitivity Analysis](#5-sensitivity-analysis)
6. [Blended Valuation Framework](#6-blended-valuation-framework)
7. [Sector-Specific Considerations](#7-sector-specific-considerations)
8. [Data Sources & Quality](#8-data-sources--quality)
9. [Model Limitations & Risk Factors](#9-model-limitations--risk-factors)
10. [Technical Implementation](#10-technical-implementation)
11. [Glossary of Terms](#11-glossary-of-terms)
12. [Academic References](#12-academic-references)

---

## 1. Investment Philosophy

### 1.1 Core Principles

The platform is built on established valuation principles from leading academic and practitioner sources:

| Principle | Source | Application |
|-----------|--------|-------------|
| Intrinsic value exists independently of market price | Graham & Dodd | DCF fair value calculation |
| Cost of capital reflects systematic risk | CAPM (Sharpe, Lintner) | WACC computation |
| Relative valuation requires comparable businesses | Rosenbaum & Pearl | Peer selection criteria |
| Terminal value requires conservative assumptions | McKinsey Valuation | TV sanity checks |
| Beta mean-reverts toward 1.0 over time | Blume (1971) | Blume-adjusted beta |

### 1.2 Indonesian Market Considerations

**Critical Insight**: Empirical research indicates that 80-90% of Indonesian stock price movement is driven by **sentiment, technicals, and momentum** rather than pure fundamentals. This reality is reflected in the scoring model through:

- Higher weight on Technical factors (20 points) and Sentiment factors (15 points)
- Combined Technical + Sentiment = 35% of total score
- Macro alignment bonus for sector-specific tailwinds

This calibration acknowledges that while DCF provides intrinsic value, short-to-medium term price action in emerging markets is heavily influenced by capital flows, momentum, and market sentiment.

---

## 2. Multi-Factor (MF) Scoring Model

### 2.1 Overview

The MF Scoring Model produces a composite score from 0-100 points, aggregating eight distinct factors that capture different dimensions of investment attractiveness. This proprietary framework is calibrated specifically for emerging market dynamics where sentiment and technicals drive 80-90% of price movement.

| Factor | Maximum Points | Weight | Rationale |
|--------|---------------|--------|-----------|
| Technical | 20 | 20% | Price momentum and risk-adjusted returns |
| Sentiment | 15 | 15% | Market sentiment and institutional confidence |
| Valuation | 15 | 15% | Graham & Dodd value metrics |
| Quality | 15 | 15% | Buffett/Munger quality factors |
| Growth | 10 | 10% | GARP methodology |
| Financial Health | 10 | 10% | Altman Z-Score inspired metrics |
| Liquidity | 10 | 10% | Trading activity and market cap tier |
| Analyst Coverage | 5 | 5% | Coverage breadth proxy |

**Maximum Score**: 100 points (plus up to 5 bonus points for macro alignment)

### 2.2 Score Interpretation

| Score Range | Rating | Investment Implication |
|-------------|--------|------------------------|
| 80-100+ | **Strong Buy** | Exceptional opportunity across multiple factors |
| 70-79 | **Buy** | Attractive risk/reward profile |
| 55-69 | **Hold** | Neutral stance; monitor for catalysts |
| 40-54 | **Underperform** | Caution advised; material concerns present |
| 0-39 | **Sell** | Significant risks; avoid or reduce exposure |

### 2.3 Detailed Factor Methodology

#### 2.3.1 Technical Score (20 Points Maximum)

*Reflects price action and momentum - critical for emerging markets where technicals drive short-term returns.*

**YTD Return Component (0-8 points)**

| YTD Return | Points | Interpretation |
|------------|--------|----------------|
| > 50% | 8 | Strong momentum; institutional accumulation |
| > 30% | 7 | Above-market performance |
| > 20% | 6 | Solid outperformance |
| > 10% | 5 | Modest positive return |
| > 0% | 3 | Positive but underperforming |
| > -10% | 2 | Mild underperformance |
| ≤ -10% | 0 | Significant underperformance |

**Jensen's Alpha Component (0-6 points)**

Jensen's Alpha measures risk-adjusted excess return versus the benchmark (CAPM-predicted return).

| Alpha (α) | Points | Interpretation |
|-----------|--------|----------------|
| > 0.5 | 6 | Strong outperformance vs. risk |
| > 0.2 | 5 | Consistent outperformance |
| > 0 | 4 | Positive alpha generation |
| > -0.2 | 2 | Slight underperformance |
| ≤ -0.2 | 0 | Negative risk-adjusted return |

**Beta Component (0-6 points)**

Beta measures systematic risk relative to the market. The scoring rewards market-like betas (around 1.0) as optimal for most investors.

| Beta Range | Points | Risk Profile |
|------------|--------|--------------|
| 0.8 - 1.2 | 6 | Optimal; market-like risk |
| 0.6 - 1.4 | 4 | Acceptable deviation |
| 0.4 - 1.6 | 2 | Higher tracking error |
| Other | 1 | Extreme beta; specialist holding |

#### 2.3.2 Sentiment Score (15 Points Maximum)

*Proxies market sentiment using momentum and stability metrics. Strong positive momentum combined with appropriate risk suggests institutional confidence.*

The sentiment score synthesizes:
- Momentum strength as a bullish/bearish indicator
- Alpha as sentiment confirmation (positive alpha = favorable sentiment)
- Beta + positive returns = institutional confidence signal

#### 2.3.3 Valuation Score (15 Points Maximum)

*Graham & Dodd inspired metrics. Weighted lower for emerging markets where sentiment often overrides fundamentals.*

**P/E Ratio Component (0-6 points)**

| P/E Ratio | Points | Valuation Tier |
|-----------|--------|----------------|
| < 8 | 6 | Deep value |
| < 12 | 5 | Attractive value |
| < 15 | 4 | Fair value |
| < 20 | 3 | Slight premium |
| < 30 | 2 | Growth premium |
| ≥ 30 | 1 | High growth/speculative |

**P/B Ratio Component (0-5 points)**

| P/B Ratio | Points | Interpretation |
|-----------|--------|----------------|
| < 1.0 | 5 | Trading below book value |
| < 1.5 | 4 | Modest book premium |
| < 2.0 | 3 | Fair book multiple |
| < 3.0 | 2 | Elevated valuation |
| ≥ 3.0 | 1 | Significant premium |

**EV/EBITDA Proxy Component (0-4 points)**

| EV/EBITDA | Points | Interpretation |
|-----------|--------|----------------|
| < 6x | 4 | Attractive enterprise value |
| < 10x | 3 | Fair valuation |
| < 12x | 2 | Moderate premium |
| ≥ 12x | 1 | Elevated valuation |

#### 2.3.4 Quality Score (15 Points Maximum)

*Buffett/Munger quality factors measuring business excellence and capital allocation.*

**Return on Equity (0-6 points)**

| ROE | Points | Quality Tier |
|-----|--------|--------------|
| > 25% | 6 | Exceptional capital efficiency |
| > 20% | 5 | High quality |
| > 15% | 4 | Above average |
| > 10% | 3 | Adequate |
| ≤ 10% | 1 | Below target |

**FCF Conversion (0-5 points)**

Free Cash Flow Conversion = FCF / Net Income. Measures earnings quality.

| FCF Conversion | Points | Interpretation |
|----------------|--------|----------------|
| > 80% | 5 | Excellent cash conversion |
| > 60% | 4 | Good conversion |
| > 40% | 3 | Acceptable |
| > 20% | 2 | Weak conversion |
| ≤ 20% | 1 | Poor cash generation |

**Margin Component (0-4 points)**

Based on EBITDA margin or operating margin as profitability measure.

| Margin | Points | Interpretation |
|--------|--------|----------------|
| > 40% | 4 | Exceptional profitability |
| > 30% | 3 | Strong margins |
| > 20% | 2 | Healthy margins |
| > 10% | 1 | Acceptable margins |

#### 2.3.5 Growth Score (10 Points Maximum)

*GARP (Growth at Reasonable Price) methodology.*

| Component | Maximum Points |
|-----------|---------------|
| Revenue Growth | 4 |
| EPS Growth | 4 |
| Net Income Growth | 2 |

Growth is scored on a relative basis with higher points for sustainable double-digit growth rates, penalizing both declining companies and unsustainably high growth.

#### 2.3.6 Financial Health Score (10 Points Maximum)

*Altman Z-Score inspired metrics assessing balance sheet strength and liquidity.*

**Debt-to-Equity Ratio (0-4 points)**

| D/E Ratio | Points | Risk Level |
|-----------|--------|------------|
| < 25% | 4 | Conservative leverage |
| < 50% | 3 | Moderate leverage |
| < 75% | 2 | Elevated leverage |
| < 100% | 1 | High leverage |
| ≥ 100% | 0 | Concerning leverage |

**Current Ratio (0-3 points)**

| Current Ratio | Points | Liquidity |
|---------------|--------|-----------|
| > 2.0 | 3 | Strong liquidity |
| > 1.5 | 2 | Adequate liquidity |
| > 1.0 | 1 | Tight liquidity |
| ≤ 1.0 | 0 | Liquidity concern |

**Quick Ratio (0-3 points)**

| Quick Ratio | Points | Interpretation |
|-------------|--------|----------------|
| > 1.5 | 3 | Excellent liquidity |
| > 1.0 | 2 | Good liquidity |
| > 0.8 | 1 | Acceptable |
| ≤ 0.8 | 0 | Liquidity risk |

#### 2.3.7 Liquidity Score (10 Points Maximum)

*Trading activity and institutional flow proxy.*

| Component | Maximum Points | Criteria |
|-----------|---------------|----------|
| Market Cap Tier | 5 | Mega cap (>$50B) = 5 pts |
| Index Weight | 5 | Higher weight = more institutional interest |

#### 2.3.8 Analyst Coverage (5 Points Maximum)

*Coverage breadth as a proxy for information efficiency.*

Based on index weight or market cap as proxy for analyst coverage density. Higher coverage typically means more efficient pricing but also more consensus-driven.

### 2.4 Macro Alignment Bonus (+5 Points Maximum)

Sector-specific tailwinds based on current macro conditions can add up to 5 bonus points:

| Sector | Favorable Condition | Bonus Trigger |
|--------|---------------------|---------------|
| Energy | Strong oil prices | Brent > $70/bbl |
| Financial | Optimal rate environment | BI Rate 5.5-7.0% |
| Consumer | Growth + low inflation | GDP > 5% AND Inflation < 3% |
| Technology | Economic expansion | GDP > 5% |
| Materials/Industrial | Manufacturing expansion | PMI > 50 |

---

## 3. DCF Valuation Methodology

### 3.1 Overview

The DCF model follows **Damodaran's Two-Stage Framework** with H-Model growth decay, representing institutional best practice for equity valuation.

**Core Equation:**

```
Enterprise Value = Σ(FCFt / (1+WACC)^t) + Terminal Value / (1+WACC)^n

Where:
  FCFt     = Free Cash Flow to Firm in year t
  WACC     = Weighted Average Cost of Capital
  n        = Explicit forecast period (5-10 years)
  TV       = Terminal Value (Gordon Growth Model)
```

### 3.2 Weighted Average Cost of Capital (WACC)

**WACC Formula:**

```
WACC = (E/V × Re) + (D/V × Rd × (1-T))

Where:
  E/V  = Equity weight (market value of equity / total value)
  D/V  = Debt weight (market value of debt / total value)
  Re   = Cost of Equity
  Rd   = Cost of Debt (pre-tax)
  T    = Corporate tax rate
```

### 3.3 Cost of Equity (CAPM with Country Risk)

**Formula:**

```
Re = Rf + β × ERP + CRP + SRP

Where:
  Rf   = Risk-free rate (10-year government bond)
  β    = Blume-adjusted beta
  ERP  = Equity Risk Premium
  CRP  = Country Risk Premium
  SRP  = Sector Risk Premium (optional)
```

**Blume Beta Adjustment:**

Per Blume (1971), historical betas mean-revert toward 1.0. The adjustment improves forecast accuracy:

```
Adjusted β = (0.67 × Raw β) + (0.33 × 1.0)
```

This adjustment is Bloomberg/CFA standard practice for forward-looking beta estimates.

**Regional Parameters (December 2025):**

| Parameter | Indonesia | United States |
|-----------|-----------|---------------|
| Risk-Free Rate (Rf) | 6.65% | 4.35% |
| Equity Risk Premium (ERP) | 6.0% | 5.5% |
| Country Risk Premium (CRP) | 2.5% | 0% |
| Terminal Growth Rate | 4.0% | 2.5% |
| Corporate Tax Rate | 22% | 21% |

*Sources: Bank Indonesia 10Y bond, US 10Y Treasury, Damodaran country risk data (2025)*

### 3.4 Cost of Debt (Damodaran Synthetic Rating)

The cost of debt is estimated using Damodaran's synthetic rating approach based on Interest Coverage Ratio (ICR).

**Primary Method: Interest Coverage Ratio**

ICR = EBIT / Interest Expense

| ICR | Synthetic Rating | Spread (IDN) | Spread (US) |
|-----|-----------------|--------------|-------------|
| ≥ 12.5 | AAA | 0.75% | 0.63% |
| ≥ 9.5 | AA | 1.00% | 0.78% |
| ≥ 7.5 | A+ | 1.25% | 0.98% |
| ≥ 6.0 | A | 1.50% | 1.13% |
| ≥ 4.5 | A- | 1.75% | 1.28% |
| ≥ 3.5 | BBB+ | 2.25% | 1.63% |
| ≥ 3.0 | BBB | 2.75% | 2.00% |
| ≥ 2.5 | BB+ | 3.50% | 2.50% |
| ≥ 2.0 | BB | 4.25% | 3.00% |
| ≥ 1.5 | B+ | 5.50% | 4.00% |
| ≥ 1.25 | B | 6.50% | 5.00% |
| ≥ 0.8 | CCC | 8.50% | 6.50% |
| ≥ 0.5 | CC | 10.50% | 8.00% |
| < 0.5 | D | 14.00% | 12.00% |

*Source: Damodaran Online (pages.stern.nyu.edu/~adamodar/)*

**Fallback Method: D/E Ratio Based**

When Interest Coverage data is unavailable:

| D/E Ratio | Estimated Rating | Spread (IDN) | Spread (US) |
|-----------|-----------------|--------------|-------------|
| < 30% | A- (estimated) | 1.5% | 1.0% |
| 30-60% | BBB (estimated) | 2.5% | 1.75% |
| 60-100% | BB (estimated) | 4.0% | 3.0% |
| > 100% | B (estimated) | 6.0% | 5.0% |

### 3.5 Free Cash Flow Estimation

**FCFF Formula (per Damodaran/CFA):**

```
FCFF = EBIT × (1-T) + D&A - CapEx - ΔNWC
     = NOPAT + D&A - CapEx - ΔNWC

Where:
  NOPAT = Net Operating Profit After Tax
  D&A   = Depreciation & Amortization
  CapEx = Capital Expenditures
  ΔNWC  = Change in Net Working Capital
```

**Estimation Methods (Priority Order):**

| Priority | Method | Confidence | Description |
|----------|--------|------------|-------------|
| 1 | Direct FCF Data | High | Uses reported FCF if available and passes sanity checks |
| 2 | Net Income Based | High | FCF = Net Income × FCF Conversion Rate (sector-specific) |
| 3 | EBITDA Based | Medium | Full calculation using sector parameters |
| 4 | ROE Based | Medium-Low | Damodaran's reinvestment rate approach |
| 5 | Sector FCF Yield | Low | Market Cap × typical sector FCF yield |

**Sector-Specific FCF Conversion Rates:**

| Sector | FCF Conversion | Rationale |
|--------|----------------|-----------|
| Financial | 85% | Asset-light, high cash conversion |
| Technology | 80-85% | Low capex, high margins |
| Consumer Non-cyclical | 75% | Stable cash generation |
| Healthcare | 70% | Moderate reinvestment |
| Consumer Cyclical | 65% | Working capital needs |
| Industrial | 55% | Capital intensive |
| Basic Materials | 50% | High capex cycles |
| Energy | 45% | Very high capex |
| Utilities | 40% | Continuous infrastructure investment |

### 3.6 Growth Rate Assumptions

**H-Model Decay:**

Growth rates decay linearly from current growth to terminal growth over the explicit forecast period:

```
Year t Growth = Terminal Growth + (Current Growth - Terminal Growth) × ((n - t) / n)

Where:
  n = Forecast period (years)
  t = Current year in projection
```

**Forecast Period Selection:**

| Company Profile | Forecast Period | Rationale |
|-----------------|-----------------|-----------|
| High Growth (>15%) | 10 years | Longer runway to converge to terminal |
| Normal Growth | 5 years | Standard institutional practice |

**Growth Rate Blending:**

```
Blended Growth = (Revenue Growth × 70%) + (Earnings Growth × 30%)
```

Revenue is weighted higher as it is typically more sustainable. Both inputs are capped at ±40% to prevent extreme values.

### 3.7 Terminal Value

**Gordon Growth Model:**

```
Terminal Value = FCF_n × (1 + g) / (WACC - g)

Where:
  FCF_n = Final year projected FCF
  g     = Terminal growth rate
  WACC  = Weighted Average Cost of Capital
```

**Critical Constraint:** WACC must exceed terminal growth rate (WACC > g). If violated, the model produces mathematically invalid results.

**Sanity Checks (per McKinsey Valuation):**

| Check | Threshold | Action if Exceeded |
|-------|-----------|-------------------|
| TV as % of EV | > 85% | Fail - model unreliable |
| TV as % of EV | > 75% | Warning - review assumptions |
| EV to Market Cap | > 5x | Cap EV at 3x Market Cap |
| Upside | > 150% | Cap at 150% upside |
| Downside | > 50% | Floor at 50% of current price |

### 3.8 Net Debt Calculation

**Formula:**

```
Net Debt = Total Debt + Preferred Stock + Minority Interest - Cash & Equivalents
```

**Estimation Methods:**

1. **Direct Balance Sheet** (preferred): Uses reported debt and cash figures
2. **D/E Estimation**: Total Debt = Book Equity × D/E Ratio
3. **Sector Cash Benchmarks**: Cash estimated as % of market cap by sector

**Special Handling for Financials:**

Banks and insurance companies have different capital structures. Their "debt" (deposits, policy liabilities) earns spread income. The model uses a simplified 5% of market cap proxy for effective net debt.

### 3.9 Equity Value and Fair Value

```
Equity Value = Enterprise Value - Net Debt

Fair Value per Share = Current Price × (Equity Value / Market Cap)
```

### 3.10 Confidence Scoring

The model produces a confidence score based on data quality:

| Factor | Impact | Points |
|--------|--------|--------|
| Direct FCF data available | +15 | Higher confidence in cash flow |
| Beta available | +10 | Better risk estimation |
| EBITDA Margin available | +10 | Improved margin analysis |
| Interest Coverage available | +5 | Better debt rating |
| Balance Sheet debt data | +10 | Accurate net debt |
| TV% > 80% | -15 | Model may be unreliable |
| Low FCF confidence | -15 | Base input uncertain |
| Terminal value warning | -10 | Assumption issues |

**Confidence Tiers:**

| Score | Confidence Level |
|-------|------------------|
| ≥ 75 | High |
| 55-74 | Medium |
| 40-54 | Medium-Low |
| < 40 | Low |

---

## 4. Comparable Company Analysis

### 4.1 Overview

Comparable Company Analysis ("Comps") values a company by applying peer group multiples to the target company's financial metrics. The methodology follows **Rosenbaum & Pearl** and **Damodaran** standards.

### 4.2 GICS Hierarchy for Peer Selection

The platform uses the Global Industry Classification Standard (GICS) hierarchy developed by MSCI and S&P:

| Level | Specificity | Example |
|-------|-------------|---------|
| GICS Sector | Broadest | Consumer Staples |
| GICS Industry Group | Broad | Food, Beverage & Tobacco |
| GICS Industry | Specific | Food Products |
| GICS Sub-Industry | Most Specific | Packaged Foods & Meats |

**Selection Priority:**

| Level | Filter Criteria | Minimum Peers |
|-------|-----------------|---------------|
| 1 | Same Sub-Industry + Same Region + 0.5-2x Market Cap | 3 |
| 2 | Same Sub-Industry (any region) OR Same Industry (same region) | 3 |
| 3 | Same Industry + 0.33-3x Market Cap | 3 |
| 4 | Same Industry Group | 3 |
| 5 | Same Sector + 0.2-5x Market Cap | 3 |
| 6 | Legacy Bloomberg Sector (fallback) | Any |

### 4.3 Peer Similarity Scoring

Each potential peer is scored on similarity to the target:

| Factor | Maximum Points | Criteria |
|--------|---------------|----------|
| GICS Specificity | 40 | Exact sub-industry = 40, Industry = 30, Group = 20, Sector = 10 |
| Market Cap Proximity | 25 | 0.5-2x = 25, 0.33-3x = 15, wider = 5 |
| Same Region | 15 | Yes = 15, No = 0 |
| Growth Profile Match | 10 | <5% diff = 10, <10% diff = 5 |
| Margin Profile Match | 10 | <5% diff = 10, <10% diff = 5 |

Top 8 peers by similarity score are selected for the analysis.

### 4.4 Valuation Multiples

**Standard Multiples:**

| Multiple | Formula | Applicability |
|----------|---------|---------------|
| P/E | Price / EPS | All sectors |
| P/B | Price / Book Value per Share | All sectors |
| EV/EBITDA | Enterprise Value / EBITDA | Non-financials only |
| P/TBV | Price / Tangible Book Value | Financials only |

**Why EV/EBITDA Excludes Financials:**

Banks and insurance companies do not have traditional "EBITDA" as their revenue model differs fundamentally. Their "operating income" includes interest income/expense which is core to the business, not a financing item. Using EV/EBITDA for financials produces meaningless results.

### 4.5 Sector-Specific Weighting

| Sector | P/E Weight | P/B Weight | EV/EBITDA Weight | P/TBV Weight |
|--------|------------|------------|------------------|--------------|
| Financial/Banks | 40% | 30% | 0% | 30% |
| Technology | 30% | 15% | 55% | 0% |
| Industrial/Materials | 35% | 20% | 45% | 0% |
| Consumer | 45% | 25% | 30% | 0% |
| Utilities | 40% | 35% | 25% | 0% |
| Default | 40% | 25% | 35% | 0% |

### 4.6 Implied Valuation Calculation

**Per-Multiple Implied Values:**

```
P/E Implied Value = Median Peer P/E × Target EPS × Current Price / Target PE
P/B Implied Value = Median Peer P/B × Target BVPS × Current Price / Target PB
EV/EBITDA Implied = (Median × Target EBITDA - Net Debt) / Shares × Current Price / Market Cap
```

**Weighted Average:**

```
Comps Fair Value = Σ(Implied Value_i × Weight_i) / Σ(Weight_i)
```

### 4.7 Premium/Discount Analysis

The model calculates the target's premium or discount to peer medians:

```
Premium (%) = ((Stock Multiple - Peer Median) / Peer Median) × 100
```

A significant premium may indicate overvaluation or justified by superior fundamentals. A significant discount may indicate undervaluation or fundamental concerns.

### 4.8 Trading Range

The 25th to 75th percentile of peer multiples provides a trading range for the fair value estimate.

---

## 5. Sensitivity Analysis

### 5.1 Overview

Per Goldman Sachs and Morgan Stanley pitch book standards, the platform provides a two-way sensitivity analysis matrix showing fair value under different assumptions.

### 5.2 Matrix Configuration

**Standard 5×5 Grid:**

| Parameter | Base Case | Range | Step Size |
|-----------|-----------|-------|-----------|
| WACC | Model-calculated | ±1.0% | 0.5% |
| Terminal Growth | Region default | ±0.5% | 0.25% |

**Convention:** Lowest values appear top-left, highest values bottom-right (Wall Street standard).

### 5.3 Color Coding

| Implied Upside | Color | Interpretation |
|----------------|-------|----------------|
| > 150% | Dark Green | Strong buy across assumptions |
| 0-150% | Light Green | Positive upside |
| 0% to -25% | Amber | Slight downside risk |
| < -25% | Red | Significant downside |

### 5.4 Investment Recommendations

Based on the distribution of scenarios:

| Condition | Recommendation |
|-----------|----------------|
| All scenarios positive (min > 20%) | Strong Buy |
| All scenarios positive (min > 0%) | Buy |
| Median positive, some negative | Hold |
| Median negative, some positive | Cautious |
| All scenarios negative | Sell |

---

## 6. Blended Valuation Framework

### 6.1 Standard Weighting

| Method | Base Weight | Rationale |
|--------|-------------|-----------|
| DCF | 60% | Intrinsic value anchor |
| Comps | 40% | Market-relative check |

### 6.2 Dynamic Weight Adjustment

| Condition | Adjustment |
|-----------|------------|
| DCF High Confidence | 65% DCF / 35% Comps |
| DCF Low Confidence | 45% DCF / 55% Comps |
| TV% > 80% | Reduce DCF weight to 50% max |
| < 3 Peers | Reduce Comps weight to 30% max |

### 6.3 Convergence Analysis

The spread between DCF and Comps values indicates valuation uncertainty:

| Upside Spread | Convergence | Interpretation |
|---------------|-------------|----------------|
| < 10% | High | Strong valuation consensus |
| 10-25% | Medium | Moderate uncertainty |
| > 25% | Low | Significant model divergence |

---

## 7. Sector-Specific Considerations

### 7.1 Financial Sector (Banks, Insurance, Financial Services)

**Key Differences:**
- EV/EBITDA is NOT applicable (deposits are not traditional debt)
- Primary multiples: P/E, P/TBV, P/B
- ROE vs. Cost of Equity determines P/B premium
- D/E ratio represents deposits, not traditional leverage
- Net debt calculation uses simplified 5% market cap proxy

#### 7.1.1 Bank Valuation Models

The platform includes a dedicated **Bank Valuation Module** with four methodologies:

| Model | Weight | Best For |
|-------|--------|----------|
| Residual Income | 35% | All banks (captures ROE vs. Ke spread) |
| DDM 2-Stage | 25% | Mature, dividend-paying banks |
| DDM 3-Stage | 25% | Growth banks transitioning to maturity |
| Gordon Growth P/B | 15% | Quick relative valuation |

**Residual Income Model (Preferred for Banks):**
```
Value = BV₀ + Σ[(ROE - Ke) × BV_{t-1} / (1+Ke)^t] + Terminal Value
```

**Gordon Growth P/B Model:**
```
Fair P/B = (ROE - g) / (Ke - g)

Interpretation:
- P/B > 1.0 when ROE > Ke (value creator)
- P/B = 1.0 when ROE = Ke (break-even)
- P/B < 1.0 when ROE < Ke (value destroyer)
```

**Bank Quality Score (0-100 Points):**

| Factor | Points | Key Metrics |
|--------|--------|-------------|
| Profitability | 30 | ROE, NIM, Cost-to-Income |
| Asset Quality | 25 | NPL Ratio, NPL Coverage, LLR |
| Capital Strength | 20 | CAR, Tier 1 Ratio |
| Liquidity | 15 | LDR (optimal 78-92%), CASA Ratio |
| Growth | 10 | Loan Growth, NII Growth |

**Indonesian Big 4 Banks Benchmarks:**

| Bank | Tier | Key Characteristics |
|------|------|---------------------|
| BBCA | Tier 1 Private | Premium valuation, best asset quality |
| BBRI | Tier 1 SOE | Micro lending leader, rural focus |
| BMRI | Tier 1 SOE | Corporate banking, growth trajectory |
| BBNI | Tier 2 SOE | Dividend story, international exposure |

#### 7.1.2 Insurance Valuation

**Life Insurance:**
- **Embedded Value (EV):** Adjusted Net Worth + Value of In-Force Business
- **Appraisal Value:** EV + Franchise Value (future new business)
- Primary multiple: P/EV (Price to Embedded Value)

**P&C Insurance:**
- **Combined Ratio Adjustment:** Fair P/B adjusted for underwriting profitability
- CR < 90%: 1.30x P/B multiplier (profitable underwriting)
- CR 95-100%: 1.00x (breakeven)
- CR > 105%: 0.70x (underwriting losses)

#### 7.1.3 Other Financial Services

| Type | Primary Model | Key Metrics |
|------|---------------|-------------|
| Consumer Finance | Modified P/B (60%) + DDM (40%) | NIM, NPL, Gearing |
| Asset Management | AUM Multiple (35%) + Fee Revenue (35%) + P/E (30%) | AUM Growth, Alpha |
| Securities/Investment Banking | Revenue Multiple (40%) + P/B (60%) | Trading Revenue, Advisory |
| Diversified Financials | SOTP with 15% holding discount | Segment breakdowns |

### 7.2 Technology Sector

**Key Differences:**
- Higher weight on EV/EBITDA and EV/Revenue
- Longer forecast period (10 years) for high growth
- Higher FCF conversion (80-85%)
- Lower D&A and CapEx relative to revenue

### 7.3 Energy & Materials

**Key Differences:**
- Commodity price sensitivity critical
- Higher sector risk premiums
- Use through-cycle EBITDA for comps
- Higher capex intensity reduces FCF conversion

### 7.4 Real Estate

**Key Differences:**
- P/NAV is primary multiple
- FFO/AFFO for REITs (not applicable in Indonesia)
- Interest rate sensitivity critical
- Working capital intensity for developers

---

## 8. Data Sources & Quality

### 8.1 Financial Data

| Source | Data Type | Update Frequency |
|--------|-----------|------------------|
| Yahoo Finance API | Prices, fundamentals, ratios | Real-time / Daily |
| Bloomberg (via export) | GICS classification, detailed financials | Periodic |
| Company filings | Verification of key metrics | Quarterly |

### 8.2 Macro Data

| Source | Data Type |
|--------|-----------|
| Bank Indonesia (BI) | Interest rates, inflation, GDP |
| Badan Pusat Statistik (BPS) | GDP, trade data, demographics |
| Federal Reserve | US Treasury yields, economic data |
| Bloomberg | Commodity prices, market indices |

### 8.3 Parameter Sources

| Parameter | Source | Reference |
|-----------|--------|-----------|
| Country Risk Premiums | Damodaran Online | pages.stern.nyu.edu/~adamodar |
| Equity Risk Premiums | Damodaran Annual Update | January 2025 |
| Credit Spreads | Damodaran Rating Tables | pages.stern.nyu.edu/~adamodar |
| Sector Parameters | McKinsey, Damodaran sector data | Industry benchmarks |

---

## 9. Model Limitations & Risk Factors

### 9.1 General Limitations

| Limitation | Description | Mitigation |
|------------|-------------|------------|
| Data Quality | Dependent on source accuracy | Multiple estimation methods, sanity checks |
| Terminal Value Sensitivity | TV often >60% of EV | Sensitivity analysis, TV% warnings |
| Point Estimates | Single fair value masks uncertainty | Provide ranges, confidence scores |
| Backward-Looking Inputs | Historical data may not predict future | H-model decay, sector adjustments |

### 9.2 Indonesian Market Specific

| Factor | Risk | Consideration |
|--------|------|---------------|
| Liquidity | Lower trading volumes | Score includes liquidity factor |
| Currency | IDR volatility | Country risk premium reflects |
| Governance | Variable quality | Not explicitly modeled |
| Sentiment Dominance | 80-90% of price movement | Higher technical/sentiment weights |

### 9.3 What the Model Cannot Capture

- Corporate governance quality
- Management quality and incentives
- ESG factors (not explicitly modeled)
- Event-driven catalysts
- Short-term trading patterns
- Market microstructure effects

---

## 10. Technical Implementation

### 10.1 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React 19.2 | User interface |
| Build Tool | Vite 7.2 | Development and bundling |
| Styling | Tailwind CSS 4.1 | Responsive design |
| Charts | Recharts 3.4 | Data visualization |
| Icons | Lucide React | Professional iconography |
| Data API | Yahoo Finance (yfinance) | Real-time market data |
| Data Pipeline | Python 3, R (tidyverse) | Data processing |
| Hosting | Vercel | Production deployment |

### 10.2 Project Structure

```text
global-equity-screener/
├── src/
│   ├── App.jsx                    # Main application (7,700+ lines)
│   ├── valuation.js               # DCF, Comps, WACC calculations
│   ├── components/
│   │   ├── BankValuationTab.jsx   # FIG valuation interface
│   │   ├── FinancialServicesTab.jsx
│   │   └── InteractiveDCF.jsx     # Interactive DCF with sensitivity
│   ├── services/
│   │   └── liveData.js            # Yahoo Finance API integration
│   └── utils/
│       ├── bankValuation.js       # Bank valuation models (943 lines)
│       ├── financialServicesValuation.js  # FIG models (1,249 lines)
│       └── exportUtils.js         # CSV/Excel export functions
├── public/
│   ├── global_companies_full.json # 1,200+ securities database
│   └── sentiment.json             # News sentiment data
├── scripts/
│   ├── fetch_sp500_data.py        # Data pipeline automation
│   └── merge_gics_data.py         # GICS classification merger
└── METHODOLOGY.md                 # This document
```

### 10.3 Key Files

| File | Lines | Description |
|------|-------|-------------|
| `valuation.js` | ~2,400 | All valuation models, WACC, DCF, Comps |
| `App.jsx` | ~7,700 | UI components, MF scoring, dashboards |
| `bankValuation.js` | ~943 | Bank-specific valuation (DDM, Residual Income) |
| `financialServicesValuation.js` | ~1,249 | Insurance, Asset Management models |
| `liveData.js` | ~737 | Real-time data service with caching |
| `global_companies_full.json` | 1,203 records | Securities database |

### 10.4 Platform Features

| Feature | Description |
|---------|-------------|
| Multi-Factor Screening | 8-factor scoring with customizable weights |
| DCF Valuation | Two-stage model with H-model growth decay |
| Comparable Companies | GICS-based peer selection with sector weights |
| Sensitivity Analysis | Two-way tables and scenario analysis |
| Bank Valuation | Residual Income, DDM, Gordon P/B models |
| Backtest Simulation | Historical strategy performance testing |
| Export | Excel and CSV with professional formatting |
| Dark Mode | Full dark/light theme support |
| Mobile Responsive | Optimized for tablet and mobile viewing |

### 10.5 Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 64+ |
| Safari | 12+ |
| iOS Safari | 12+ |
| Firefox | 67+ |
| Edge | 79+ |

---

## 11. Glossary of Terms

| Term | Definition |
|------|------------|
| **Alpha (Jensen's)** | Risk-adjusted excess return vs. CAPM expectation |
| **Beta** | Measure of systematic risk relative to market |
| **Blume Adjustment** | Statistical adjustment for beta mean reversion |
| **CAPM** | Capital Asset Pricing Model; Re = Rf + β × ERP |
| **CRP** | Country Risk Premium; additional return for EM risk |
| **D/E Ratio** | Debt-to-Equity ratio; leverage measure |
| **DCF** | Discounted Cash Flow; intrinsic valuation method |
| **EBITDA** | Earnings Before Interest, Taxes, Depreciation, Amortization |
| **ERP** | Equity Risk Premium; stock market return over bonds |
| **EV** | Enterprise Value; Market Cap + Net Debt |
| **FCFF** | Free Cash Flow to Firm; cash available to all capital providers |
| **GARP** | Growth at Reasonable Price; balanced growth/value approach |
| **GICS** | Global Industry Classification Standard (MSCI/S&P) |
| **Gordon Growth** | Terminal value model; TV = FCF(1+g)/(r-g) |
| **H-Model** | Growth decay model with linear convergence to terminal |
| **ICR** | Interest Coverage Ratio; EBIT / Interest Expense |
| **NOPAT** | Net Operating Profit After Tax |
| **P/B** | Price-to-Book ratio |
| **P/E** | Price-to-Earnings ratio |
| **P/TBV** | Price to Tangible Book Value |
| **Synthetic Rating** | Credit rating estimated from financial ratios |
| **Terminal Value** | Value of cash flows beyond explicit forecast period |
| **WACC** | Weighted Average Cost of Capital |

---

## 12. Academic References

### Factor Models & Asset Pricing

1. **Fama, Eugene F. & French, Kenneth R.** (1992)
   - "The Cross-Section of Expected Stock Returns" *Journal of Finance*, 47(2): 427-465
   - Foundational paper establishing size (SMB) and value (HML) factors
   - **Application**: Informs valuation factor weighting in MF Score

2. **Fama, Eugene F. & French, Kenneth R.** (1993)
   - "Common Risk Factors in the Returns on Stocks and Bonds" *Journal of Financial Economics*, 33: 3-56
   - Three-factor model explaining 90%+ of portfolio return variation
   - [Kenneth French Data Library](https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html)

3. **Fama, Eugene F. & French, Kenneth R.** (2015)
   - "A Five-Factor Asset Pricing Model" *Journal of Financial Economics*, 116(1): 1-22
   - Extended model adding profitability (RMW) and investment (CMA) factors
   - **Application**: Quality and Growth scoring components

### Momentum & Technical Analysis

4. **Jegadeesh, Narasimhan & Titman, Sheridan** (1993)
   - "Returns to Buying Winners and Selling Losers: Implications for Stock Market Efficiency" *Journal of Finance*, 48(1): 65-91
   - Seminal paper on momentum effect (~1% monthly abnormal returns)
   - **Application**: Technical Score momentum components

5. **Carhart, Mark M.** (1997)
   - "On Persistence in Mutual Fund Performance" *Journal of Finance*, 52(1): 57-82
   - Four-factor model adding momentum (MOM) to Fama-French
   - **Application**: Jensen's Alpha calculation methodology

### Value Investing & Stock Selection

6. **Piotroski, Joseph D.** (2000)
   - "Value Investing: The Use of Historical Financial Statement Information to Separate Winners from Losers" *Journal of Accounting Research*, 38: 1-41
   - F-Score methodology: 9-point financial health scoring
   - 7.5% annual improvement over pure book-to-market strategy
   - [Original Paper (Chicago Booth)](https://www.chicagobooth.edu/~/media/fe874ee65f624aaebd0166b1974fd74d.pdf)
   - **Application**: Financial Health Score design

7. **Greenblatt, Joel** (2006)
   - "The Little Book That Beats the Market" (Wiley)
   - Magic Formula: ROC + Earnings Yield two-factor screening
   - Backtested 30.8% CAGR over 17 years
   - **Application**: Quality and Valuation factor integration

### Financial Distress & Credit Risk

8. **Altman, Edward I.** (1968)
   - "Financial Ratios, Discriminant Analysis and the Prediction of Corporate Bankruptcy" *Journal of Finance*, 23(4): 189-209
   - Z-Score model: 72% accuracy predicting bankruptcy 2 years ahead
   - [Altman Z-Score Paper (NYU Stern)](https://pages.stern.nyu.edu/~ealtman/Zscores.pdf)
   - **Application**: Financial Health metrics (D/E, Current Ratio, Quick Ratio)

9. **Altman, Edward I. et al.** (2017)
   - "Financial Distress Prediction in an International Context" *Journal of International Financial Management & Accounting*, 28(2): 131-171
   - International validation across 31 European + 3 non-European countries
   - **Application**: Cross-border applicability validation

### Valuation Theory

10. **Damodaran, Aswath** (NYU Stern)
    - *Investment Valuation* (3rd Edition, Wiley, 2012)
    - Country Risk Premiums: [pages.stern.nyu.edu/~adamodar](https://pages.stern.nyu.edu/~adamodar/)
    - Synthetic rating methodology, WACC calculation
    - **Application**: DCF model, cost of capital, credit spreads

11. **Rosenbaum, Joshua & Pearl, Joshua**
    - *Investment Banking: Valuation, LBOs, M&A, and IPOs* (3rd Edition, Wiley, 2020)
    - Comparable company analysis methodology
    - **Application**: Comps peer selection and multiple weighting

12. **McKinsey & Company** (Koller, Goedhart, Wessels)
    - *Valuation: Measuring and Managing the Value of Companies* (7th Edition, 2020)
    - Terminal value sanity checks, forecast period guidance
    - **Application**: TV% limits, convergence analysis

### CAPM & Risk Measurement

13. **Sharpe, William F.** (1964)
    - "Capital Asset Prices: A Theory of Market Equilibrium under Conditions of Risk" *Journal of Finance*, 19(3): 425-442
    - Nobel Prize-winning CAPM framework
    - **Application**: Cost of equity calculation

14. **Blume, Marshall E.** (1971)
    - "On the Assessment of Risk" *Journal of Finance*, 26(1): 1-10
    - Beta mean-reversion toward 1.0 over time
    - **Application**: Blume-adjusted beta = 0.67 × Raw β + 0.33 × 1.0

15. **Jensen, Michael C.** (1968)
    - "The Performance of Mutual Funds in the Period 1945-1964" *Journal of Finance*, 23(2): 389-416
    - Jensen's Alpha for risk-adjusted performance
    - **Application**: Technical Score alpha component

### Value Investing Foundations

16. **Graham, Benjamin & Dodd, David** (1934)
    - *Security Analysis* (6th Edition, McGraw-Hill, 2008)
    - Margin of safety, intrinsic value concepts
    - **Application**: Valuation Score design principles

### Industry References

17. **CFA Institute**
    - CFA Level II Equity Valuation Curriculum
    - FCFF calculation standards, GICS classification

18. **Wall Street Prep** - Sensitivity Analysis Best Practices

19. **Financial Edge** - DCF Sensitizing for Key Variables

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.1 | Dec 2025 | Universal branding; expanded global coverage (1,200+ securities); bank valuation module |
| 3.0 | Dec 2025 | Comprehensive rewrite; enhanced explanations; professional formatting |
| 2.1 | Nov 2025 | Safari compatibility, Sensitivity analysis, UI refinements |
| 2.0 | Nov 2025 | 8-Factor scoring, S&P 500 coverage, Enhanced DCF |
| 1.5 | Nov 2025 | Institutional-grade Comps, Sector weighting |
| 1.0 | Oct 2025 | Initial release with IDX coverage |

---

## Author

**Nathaniel Luu**
Investment Analyst Intern | TCW Bahana Asset Management
Jakarta, Indonesia

*Research conducted during internship program, Fall 2025*

---

### Contact & Repository

- **GitHub:** [github.com/theresa12345-scp/natan-equity-research](https://github.com/theresa12345-scp/natan-equity-research)
- **Live Demo:** Available upon request

---

*Global Equity Screener*
*Built with institutional-grade methodology for professional investors*
*Methodology: CFA Institute • Damodaran (NYU Stern) • Rosenbaum & Pearl*

*Last Updated: December 2025*
