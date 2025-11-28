# NATAN Institutional Equity Research Platform
## Valuation & Scoring Methodology Documentation

**Version 2.0 | November 2025**

---

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [8-Factor Scoring Model](#8-factor-scoring-model)
3. [DCF Valuation Model](#dcf-valuation-model)
4. [Comparable Company Analysis](#comparable-company-analysis)
5. [Data Sources](#data-sources)
6. [Academic References](#academic-references)

---

## Platform Overview

NATAN Institutional Research Platform is a professional-grade equity screening and valuation system covering:

- **1,200+ companies** across US (S&P 500) and Indonesia (IDX)
- **Real-time DCF valuation** using Damodaran methodology
- **Comparable company analysis** per Rosenbaum & Pearl standards
- **8-Factor scoring model** calibrated for emerging market dynamics

### Key Insight: Indonesian Market Dynamics
Per industry discussions, 80-90% of Indonesian stock price movement is driven by **sentiment, technicals, and momentum** rather than pure fundamentals. The NATAN scoring model reflects this reality by weighting technical and sentiment factors at 35% of total score.

---

## 8-Factor Scoring Model

### Overview (100 Points Total)

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Technical | 20 pts | Price momentum, alpha, beta |
| Sentiment | 15 pts | Market sentiment proxy |
| Valuation | 15 pts | Graham & Dodd metrics |
| Quality | 15 pts | Buffett/Munger factors |
| Growth | 10 pts | GARP methodology |
| Financial Health | 10 pts | Altman Z-Score inspired |
| Liquidity | 10 pts | Trading activity |
| Analyst Coverage | 5 pts | Coverage breadth proxy |

### Score Thresholds

| Score | Rating | Interpretation |
|-------|--------|----------------|
| 80-100 | **Strong Buy** | Exceptional opportunity |
| 70-79 | **Buy** | Attractive risk/reward |
| 55-69 | **Hold** | Neutral stance |
| 40-54 | **Underperform** | Caution advised |
| 0-39 | **Sell** | Avoid |

### Detailed Factor Methodology

#### 1. Technical Score (20 points)
*Reflects price action and momentum - critical for EM markets*

**YTD Return (0-8 points):**
```
> 50%:  8 pts
> 30%:  7 pts
> 20%:  6 pts
> 10%:  5 pts
> 0%:   3 pts
> -10%: 2 pts
≤ -10%: 0 pts
```

**Alpha - Jensen's Alpha (0-6 points):**
```
α > 0.5:  6 pts (Strong outperformance)
α > 0.2:  5 pts
α > 0:    4 pts
α > -0.2: 2 pts
α ≤ -0.2: 0 pts
```

**Beta (0-6 points):**
```
0.8-1.2:  6 pts (Optimal risk profile)
0.6-1.4:  4 pts
0.4-1.6:  2 pts
Other:    1 pt
```

#### 2. Sentiment Score (15 points)
*Proxies market sentiment using momentum and stability metrics*

- Momentum strength as bullish/bearish indicator
- Alpha as sentiment confirmation
- Beta + positive returns = institutional confidence

#### 3. Valuation Score (15 points)
*Graham & Dodd inspired - weighted lower for EM due to sentiment dominance*

**P/E Ratio (0-6 points):**
```
P/E < 8:  6 pts (Deep value)
P/E < 12: 5 pts
P/E < 15: 4 pts
P/E < 20: 3 pts
P/E < 30: 2 pts
P/E ≥ 30: 1 pt
```

**P/B Ratio (0-5 points):**
```
P/B < 1.0: 5 pts
P/B < 1.5: 4 pts
P/B < 2.0: 3 pts
P/B < 3.0: 2 pts
P/B ≥ 3.0: 1 pt
```

**EV/EBITDA Proxy (0-4 points):**
```
< 6x:  4 pts
< 10x: 3 pts
< 12x: 2 pts
≥ 12x: 1 pt
```

#### 4. Quality Score (15 points)
*Buffett/Munger quality factors*

**ROE (0-6 points):**
```
> 25%: 6 pts (Exceptional)
> 20%: 5 pts
> 15%: 4 pts
> 10%: 3 pts
≤ 10%: 1 pt
```

**FCF Conversion (0-5 points):**
```
> 80%: 5 pts
> 60%: 4 pts
> 40%: 3 pts
> 20%: 2 pts
```

**Margins (0-4 points):**
```
> 40%: 4 pts
> 30%: 3 pts
> 20%: 2 pts
> 10%: 1 pt
```

#### 5. Growth Score (10 points)
*GARP (Growth at Reasonable Price) methodology*

- Revenue Growth: 0-4 pts
- EPS Growth: 0-4 pts
- Net Income Growth: 0-2 pts

#### 6. Financial Health Score (10 points)
*Altman Z-Score inspired metrics*

**D/E Ratio (0-4 points):**
```
< 25%:  4 pts
< 50%:  3 pts
< 75%:  2 pts
< 100%: 1 pt
```

**Current Ratio (0-3 points):**
```
> 2.0: 3 pts
> 1.5: 2 pts
> 1.0: 1 pt
```

**Quick Ratio (0-3 points):**
```
> 1.5: 3 pts
> 1.0: 2 pts
> 0.8: 1 pt
```

#### 7. Liquidity Score (10 points)
*Trading activity and institutional flow proxy*

- Market Cap tier: 0-5 pts (Mega cap > $50B = 5 pts)
- Index weight: 0-5 pts (Higher weight = more institutional interest)

#### 8. Analyst Coverage (5 points)
*Coverage breadth as a convergence proxy*

Based on index weight or market cap as proxy for analyst coverage density.

#### Macro Alignment Bonus (+5 points max)
Sector-specific tailwinds based on macro conditions:
- Energy: Oil > $70
- Financial: BI Rate 5.5-7%
- Consumer: GDP > 5% & Inflation < 3%
- Tech/Comms: GDP > 5%
- Materials/Industrial: PMI > 50

---

## DCF Valuation Model

### Methodology: Damodaran Two-Stage DCF with H-Model Decay

**Formula:**
```
Enterprise Value = Σ(FCFt / (1+WACC)^t) + Terminal Value / (1+WACC)^n

Where:
- FCF = Free Cash Flow to Firm
- WACC = Weighted Average Cost of Capital
- n = Forecast period (5-10 years based on growth)
```

### Cost of Capital (WACC)

**Formula:**
```
WACC = (E/V × Re) + (D/V × Rd × (1-T))

Where:
- E/V = Equity weight
- D/V = Debt weight
- Re = Cost of Equity
- Rd = Cost of Debt
- T = Tax rate
```

### Cost of Equity (CAPM with Country Risk)

**Formula:**
```
Re = Rf + β × ERP + CRP

Where:
- Rf = Risk-free rate
- β = Blume-adjusted beta (0.67 × Raw β + 0.33 × 1.0)
- ERP = Equity Risk Premium
- CRP = Country Risk Premium
```

**Regional Parameters (November 2025):**

| Parameter | Indonesia | US |
|-----------|-----------|-----|
| Risk-Free Rate | 6.65% | 4.35% |
| Equity Risk Premium | 6.0% | 5.5% |
| Country Risk Premium | 2.5% | 0% |
| Terminal Growth | 4.0% | 2.5% |
| Corporate Tax Rate | 22% | 21% |

### Cost of Debt (Damodaran Synthetic Rating)

**Primary Method: Interest Coverage Ratio**

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

**Fallback Method: D/E Ratio Based**

| D/E Ratio | Estimated Rating | Spread (IDN) |
|-----------|-----------------|--------------|
| < 30% | A- est | 1.5% |
| 30-60% | BBB est | 2.5% |
| 60-100% | BB est | 4.0% |
| > 100% | B est | 6.0% |

### Free Cash Flow Estimation

**FCFF Formula (per Damodaran/CFA):**
```
FCFF = EBIT × (1-T) + D&A - CapEx - ΔNWC
     = NOPAT + D&A - CapEx - ΔNWC
```

**Estimation Methods (in priority order):**
1. **Direct FCF data** (highest confidence)
2. **Net Income based**: FCF = Net Income × FCF Conversion Rate
3. **EBITDA based**: Full calculation with sector parameters
4. **ROE based**: Using Damodaran's reinvestment rate approach
5. **Sector FCF Yield**: Market Cap × typical sector yield (fallback)

### Terminal Value

**Gordon Growth Model:**
```
TV = FCFn × (1 + g) / (WACC - g)

Where g = Terminal growth rate (must be < WACC)
```

**Sanity Checks (per McKinsey):**
- TV% of EV should be < 85% (warning if > 75%)
- WACC must exceed terminal growth rate
- EV capped at 5x Market Cap for reasonableness

### Growth Rate Assumptions

**H-Model Decay:**
- High growth companies (>15%): 10-year explicit forecast
- Normal companies: 5-year explicit forecast
- Linear decay from current growth to terminal growth

---

## Comparable Company Analysis

### Methodology: Rosenbaum & Pearl Standards

### Peer Selection Criteria

**Primary Filter (Tightest):**
- Same sector AND region
- Market cap: 0.5x to 2.0x target
- Valid P/E (0 < P/E < 100)

**Relaxed Filter:**
- Same sector, any region
- Market cap: 0.33x to 3.0x target

**Expanded Filter:**
- Same industry group
- Market cap: 0.33x to 3.0x target

### Peer Similarity Scoring

| Factor | Weight | Scoring |
|--------|--------|---------|
| Market Cap Proximity | 30 pts | 0.5-2x = 30, 0.33-3x = 20 |
| Same Region | 20 pts | Yes = 20, No = 0 |
| Growth Profile Match | 15 pts | <5% diff = 15, <10% = 10 |
| Margin Profile Match | 15 pts | <5% diff = 15, <10% = 10 |

Top 8 peers by similarity score are selected.

### Valuation Multiples

**Standard Multiples:**
- P/E Ratio
- P/B Ratio
- EV/EBITDA (non-financials only)
- P/TBV (financials only)

### Sector-Specific Weighting

| Sector | P/E | P/B | EV/EBITDA | P/TBV |
|--------|-----|-----|-----------|-------|
| Financial/Banks | 40% | 30% | 0% | 30% |
| Technology | 30% | 15% | 55% | 0% |
| Industrial/Materials | 35% | 20% | 45% | 0% |
| Consumer | 45% | 25% | 30% | 0% |
| Utilities | 40% | 35% | 25% | 0% |
| Default | 40% | 25% | 35% | 0% |

**Note:** EV/EBITDA is meaningless for financial companies (banks, insurance) because they don't have traditional EBITDA. The model correctly excludes this multiple for financials.

### Implied Valuation

```
Implied Value = Σ(Multiple_i × Per-Share Metric_i × Weight_i)

Where:
- P/E implied = Median Peer P/E × Company EPS
- P/B implied = Median Peer P/B × Company BVPS
- EV/EBITDA implied = Median × EBITDA, adjusted for Net Debt
```

### Blended Valuation (DCF + Comps)

**Standard Weighting:**
- DCF: 60%
- Comps: 40%

**Dynamic Adjustment:**
- High DCF confidence → 65% DCF / 35% Comps
- Low DCF confidence → 45% DCF / 55% Comps
- TV% > 80% → Reduce DCF weight
- Few peers (<3) → Reduce Comps weight

---

## Data Sources

### Financial Data
- **Yahoo Finance** (via yahoo-finance2 API)
  - Real-time prices and market cap
  - Financial statements
  - Key ratios and metrics

### Macro Data
- **Bank Indonesia (BI)**: Interest rates, inflation
- **Badan Pusat Statistik (BPS)**: GDP, trade data
- **Bloomberg**: Market indices, commodity prices
- **Federal Reserve**: US Treasury yields

### Parameters
- **Damodaran Online**: Country risk premiums, credit spreads
- **CFA Institute**: Valuation standards
- **McKinsey**: Industry benchmarks

---

## Academic References

1. **Damodaran, Aswath** (NYU Stern)
   - "Investment Valuation" (3rd Edition)
   - Country Risk Premiums: https://pages.stern.nyu.edu/~adamodar/

2. **Rosenbaum, Joshua & Pearl, Joshua**
   - "Investment Banking: Valuation, LBOs, M&A, and IPOs" (3rd Edition)

3. **CFA Institute**
   - CFA Level II Equity Valuation Curriculum
   - Global Investment Performance Standards (GIPS)

4. **McKinsey & Company**
   - "Valuation: Measuring and Managing the Value of Companies" (7th Edition)

5. **Graham, Benjamin & Dodd, David**
   - "Security Analysis" (6th Edition)

6. **Blume, Marshall E.**
   - "On the Assessment of Risk" (Journal of Finance, 1971)
   - Beta adjustment: Adjusted β = 0.67 × Raw β + 0.33 × 1.0

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Nov 2025 | 8-Factor scoring, S&P 500 coverage, Enhanced DCF |
| 1.5 | Nov 2025 | Institutional-grade Comps, Sector weighting |
| 1.0 | Oct 2025 | Initial release with IDX coverage |

---

*NATAN Institutional Research Platform*
*Built with institutional-grade methodology for professional equity analysis*
