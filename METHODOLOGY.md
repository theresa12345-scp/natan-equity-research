# Meridian Terminal · Scoring Methodology

**Version 4.0 · 2026-05**
**N. Luu**

---

## 1. Investment Philosophy

Meridian is an institutional-grade equity research workstation covering Indonesian (IDX) and US equities. The composite scoring model is built on three principles:

1. **Practitioner-readable, academically anchored.** Eight pillars, each with an explicit literature reference. Weights differ between EM (IDX) and DM (US) per documented empirical evidence.
2. **Sector-relative, regime-conditioned.** Inputs are winsorized within sector before z-scoring; pillar weights shift between Risk-On / Risk-Off regimes per Hamilton (1989) Markov-switching.
3. **Multiple-testing disciplined.** Reported Sharpe ratios are gated by Deflated Sharpe Ratio (DSR) per Bailey & López de Prado (2014). Live performance is projected at 50–70% of backtest Sharpe.

This document supersedes the v3.1 (December 2025) doctrine. The principal change: the citation for the "momentum-fails-on-IDX" claim is corrected from a non-existent "Wirjanto 2023" to **Li, Wei & Zhang (2023)** *Pacific-Basin Finance Journal* 82:102175. Weights are recalibrated correspondingly.

---

## 2. The 8-Pillar Composite

### 2.1 EM-aware (IDX) vs DM-aware (US) weights

| Pillar | IDX weight | US weight | Academic anchor |
|---|---|---|---|
| Valuation | **20%** | 15% | Fama & French (1992); Asness & Frazzini "Devil in HML's Details" (2013) |
| Quality | **20%** | 15% | Asness, Frazzini & Pedersen "Quality Minus Junk" (2019) |
| Profitability | **15%** | 10% | Novy-Marx (2013); Hou, Xue & Zhang q-factor (2015) |
| Financial Health | 10% | 10% | Piotroski F-Score (2000); Altman Z (1968) |
| Low-Vol / Defensive | 10% | 10% | Frazzini & Pedersen "Betting Against Beta" (2014) |
| Sentiment | 10% | 10% | IndoBERT-Financial (Maharani et al. 2023); FinBERT (US) |
| Growth | 5% | 10% | Hou-Mo-Xue-Zhang (2021) expected-growth factor |
| Momentum | **5%** (short-term reversal) | 15% (Carhart 12-1) | Carhart (1997) for US; **EXCLUDED from 12-1 form on IDX** |
| Liquidity | 5% | 5% | Amihud illiquidity; IDX lot-size 100 microstructure |
| **Total** | **100%** | **100%** | |

**Rationale for the IDX vs US split.** Indonesian factor weights deviate from a standard global multi-factor composite due to documented EM-specific empirical evidence. Li, Wei & Zhang (2023, *PBFJ* 82:102175) tested 152 candidate factors on the IDX universe 1991–2022 using Bayesian shrinkage and concluded verbatim: *"size, value, quality, and profitability are the characteristics themes that explain future cross-sectional stock returns during the period 1991–2022. Momentum is not significant."* Our weights reflect this — **Quality + Profitability + Value = 55% of pillar weight on IDX vs 40% on US**, while Momentum drops from 15% (US) to 5% (IDX) and is reframed as short-term reversal.

### 2.2 Pillar definitions

**Valuation** — P/E, P/B, EV/EBITDA, P/FCF, dividend yield. Subject to sector-relative z-scoring. Asness & Frazzini (2013) timely-price B/P preferred over backward-looking variant ("305 to 378 basis points annually of statistically significant alpha").

**Quality** — Asness, Frazzini & Pedersen (2019) QMJ definition: profitability, growth, safety. ROE, gross profits / assets (GPOA), earnings stability, balance-sheet conservatism.

**Profitability** — Stand-alone pillar on top of Quality. ROE, operating margin, FCF / Net Income conversion. For banks: NIM, CIR, NPL.

**Financial Health** — Piotroski F-Score (9 binary signals across profitability, leverage/liquidity, operating efficiency). Altman Z-Score for non-financials. For banks: Tier 1 capital, NPL ratio, coverage ratio.

**Low-Vol / Defensive** — Beta (60-month vs index), realized volatility, maximum drawdown, downside beta. Frazzini & Pedersen (2014) Betting Against Beta as theoretical anchor.

**Sentiment** — Bahasa-language IndoBERT-Financial (Maharani, Yustiawan et al. 2023, arXiv 2310.09736; BRIBRAIN Academy / ITB) for IDX; FinBERT for US. Article-level scores aggregated 7-day. Foreign net flow incorporated as a sub-input on IDX (KSEI Komposisi Kepemilikan Efek monthly file).

**Growth** — 3Y revenue CAGR, 3Y EPS CAGR, Hou-Mo-Xue-Zhang (2021) expected-growth proxy (analyst forecast revisions).

**Momentum** — **US:** 12-1 month price return per Carhart (1997). **IDX:** 12-1 momentum factor *excluded* per Li-Wei-Zhang (2023). Replaced by 1-month short-term reversal, which is positive in Indonesian microstructure due to retail-heavy order flow (Ho et al. 2024 Vietnam PEAD; Cai et al. 2021 China PEAD).

**Liquidity** — Average daily trading volume, Amihud illiquidity, lot-size friction. Indonesian lot size is 100 shares (reduced from 500 on 6 January 2014, per IDX rule). PPh Pasal 4(2): 0.1% of gross sale value (sell side only); exchange/clearing levy ≈ 0.04% (BEI + KPEI + KSEI); VAT 11% on commissions; Rp 10,000 stamp duty per daily invoice. Typical round-trip retail cost: 0.40–0.60%.

### 2.3 Letter grade mapping

| z-score | Numeric | Letter | Universe share | Verdict |
|---|---|---|---|---|
| > +1.5 | 90–100 | **A+** | ~7% | Strong Buy, full conviction |
| +1.0 to +1.5 | 80–89 | **A** | ~9% | Buy |
| +0.5 to +1.0 | 70–79 | **A−** | ~15% | Buy, lower conviction |
| 0 to +0.5 | 60–69 | **B+** | ~19% | Hold / Add on weakness |
| −0.5 to 0 | 50–59 | **B** | ~19% | Hold |
| −1.0 to −0.5 | 40–49 | **B−** | ~15% | Hold / Trim |
| −1.5 to −1.0 | 30–39 | **C** | ~9% | Reduce |
| < −1.5 | 0–29 | **D / F** | ~7% | Avoid / Sell |

Each rendered letter grade is published with a **95% bootstrap confidence interval** (1,000 resamples) — e.g., "A− [B+, A]" — as the institutional analog to Morningstar's "Uncertainty Rating."

### 2.4 Verdict synthesis

Verdict ≠ grade. Verdict = grade × regime × DCF margin-of-safety × conviction. Three-axis output:

- **Action**: STRONG BUY / BUY / HOLD / TRIM / AVOID
- **Conviction**: HIGH / MEDIUM / LOW (composite CI width, analyst dispersion, factor-IC stability)
- **Horizon**: 3M / 12M / 36M

### 2.5 Normalization stack

Applied per pillar, every rebalance, in this order:

1. **Sector-relative raw inputs** within IDX-IC sectors (11 sectors for IDX).
2. **Winsorize at 1st/99th percentile** within sector (or Median ± 3·MAD if sector cell count < 30).
3. **Cross-sectional z-score** within sector, then re-aggregate to a universe-wide percentile rank (0–100).
4. **Exponential decay smoothing (λ = 0.7)** to dampen noise (Morningstar QQR stability source).
5. **Sector-median imputation with penalty** for missing values: missing → (sector_median − 0.5σ).
6. **Cap any single pillar contribution at ±2σ** to prevent one extreme reading from dominating the grade.

### 2.6 Multiple-testing discipline

**Deflated Sharpe Ratio (DSR)** per Bailey & López de Prado (2014) "The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting, and Non-Normality." *Journal of Portfolio Management* 40(5):94–107. Closed form:

```
DSR = Z [ ( (SR̂ − SR₀) · √(T − 1) ) /
          √( 1 − γ̂₃·SR̂ + ((γ̂₄ − 1)/4)·SR̂² ) ]
```

where Z[·] is the standard-normal CDF; SR̂ is the observed (non-annualized) Sharpe; T is the sample length; γ̂₃ is skewness; γ̂₄ is kurtosis (non-excess); and the deflated benchmark

```
SR₀ = √Var{SRₙ} · {(1 − γ)·Φ⁻¹(1 − 1/N) + γ·Φ⁻¹(1 − 1/(N·e⁻¹))}
```

with γ ≈ 0.5772 (Euler–Mascheroni) and N = number of independent trials tested. Reject the null only at **DSR > 0.95**.

**Probability of Backtest Overfitting (PBO)** via Combinatorial Symmetric Cross-Validation (Bailey, Borwein, López de Prado & Zhu 2017).

**Bonferroni and Benjamini-Hochberg FDR correction** on factor-IC t-statistics. Unadjusted vs adjusted p-values displayed side-by-side.

**CPCV path-distribution histogram** plus a Sharpe-degradation curve showing how Sharpe falls as the top-k best paths are removed.

---

## 3. DCF Valuation

Damodaran two-stage with explicit 5-year period + Gordon perpetuity. Cost of equity from CAPM.

| Parameter | Indonesia | United States |
|---|---|---|
| Risk-Free Rate | 6.842% (ID 10Y, May 2026) | 4.50% (UST 10Y) |
| Equity Risk Premium | 4.35% (Damodaran 2026 ID) | 6.00% (Damodaran 2026 US) |
| Terminal Growth (g∞) | 4.00% | 2.50% |
| Tax Rate | 22% | 21% |
| Damodaran CRP | embedded in ERP | base (mature) market |

Per-security Beta is 60-month regression vs IHSG (IDX) or S&P 500 (US). For banks, P/TBV multiple with ROE-driven excess returns supplements the cash-flow DCF.

---

## 4. Factor Engine

Long-only IDX universe (~184 LQ45 + IDX80 overlap) and US universe (S&P 500 + NASDAQ 100). CPCV 10×2 splits → 9 paths.

Reported metrics: **CPCV μ**, **DSR** per §2.6, **CAGR net** of transaction costs (LQ45 18bps; S&P 4bps), **MaxDD** (12-year peak-to-trough), **Hit Rt** (percentage of months with positive composite return).

---

## 5. Regime Detection

Two-state Hamilton (1989) Markov-switching model on weekly returns of IHSG (IDX) and SPX (US):

- **States**: Low-Vol / High-Return ("Risk-On") and High-Vol / Low-Return ("Risk-Off"), per Ang & Bekaert (2002).
- **Inputs**: weekly index return, realized vol, credit spread (IDR 10Y − 1Y on IDX; IG OAS on US), term-structure slope.
- **Output**: posterior probability of each state, time-in-regime, expected duration.

**Regime-conditional pillar weights**: in Risk-Off, increase Low-Vol weight by +5pp and decrease Momentum/Growth correspondingly (Kritzman et al. 2012). Persistent regime badge surfaces at the top-right of every page.

---

## 6. Position Sizing from Grade

| Grade × Conviction | Max single-name weight |
|---|---|
| A+, HIGH | 8% |
| A, HIGH | 6% |
| A−, MED | 4% |
| B+ | 2% |
| B and below | 0% (do not size from grade alone) |

Apply half-Kelly cap; cap sector weight at 25%.

---

## 7. Performance Attribution

Brinson-Fachler (1985) attribution decomposes portfolio P&L vs benchmark into:

- **Allocation Effect (i)** = (wp_i − wb_i) × Rb_i
- **Selection Effect (i)** = wb_i × (Rp_i − Rb_i)

Interaction folded into Selection per Brinson & Fachler (1985, *JPM* Spring:73–76). Surfaced in the Risk module's stress-scenario click-to-expand.

---

## 8. Indonesian Microstructure Notes

- **Lot size**: 100 shares (reduced from 500 on 6 January 2014).
- **PPh Pasal 4(2)**: 0.1% of gross sale value, sell side only (PP 41/1994 as amended by PP 14/1997).
- **Exchange/clearing levy**: ≈ 0.04% (BEI 0.018% + KPEI clearing 0.009% + KSEI 0.003% + KPEI guarantee fund 0.01%); VAT 11% on broker commission (UU HPP 7/2021); Rp 10,000 stamp duty per daily invoice.
- **Typical round-trip retail cost**: 0.40–0.60%.
- **Tick size**: 5 tiers per IDX Decree Kep-00023/BEI/04-2016. Max daily move = 10× tick.
- **UMA flag**: trading activities IDX deems unusual. Escalation: UMA → clarification request → Special Monitoring Watchlist Board → suspension; delisting after 24 consecutive months of suspension.

---

## 9. Limitations

Paper-tested on point-in-time data 2014–2025. Live performance typically 50–70% of backtest Sharpe after slippage, borrow costs, and regime shift. Expected live Sharpe: 0.55–0.65. Composite signal is not market-neutral (Beta ~1.05).

Morningstar's own out-of-sample R² benchmark — Quantitative Valuation R² against analyst output averaging "approximately 24%" over Oct 2017–Sep 2024 — is the honest comparator for any quant-equity score on a small universe. Meridian's CPCV-mean Sharpe of 0.904 ± 0.040 is respectable, not heroic.

---

## 10. Bibliography

- Asness, C., & Frazzini, A. (2013). "The Devil in HML's Details." *Journal of Portfolio Management* 39(4):49–68.
- Asness, C., Frazzini, A., & Pedersen, L. H. (2019). "Quality Minus Junk." *Review of Accounting Studies* 24(1):34–112.
- Bailey, D. H., & López de Prado, M. L. (2014). "The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting, and Non-Normality." *Journal of Portfolio Management* 40(5):94–107.
- Brinson, G. P., & Fachler, N. (1985). "Measuring Non-US Equity Portfolio Performance." *Journal of Portfolio Management* (Spring):73–76.
- Carhart, M. M. (1997). "On Persistence in Mutual Fund Performance." *Journal of Finance* 52(1).
- Damodaran, A. (annual). "Country Risk: Determinants, Measures and Implications." NYU Stern Country Risk Dataset.
- Fama, E. F., & French, K. R. (1992). "The Cross-Section of Expected Stock Returns." *Journal of Finance* 47(2):427–465.
- Fama, E. F., & French, K. R. (2015). "A Five-Factor Asset Pricing Model." *Journal of Financial Economics* 116(1):1–22.
- Frazzini, A., & Pedersen, L. H. (2014). "Betting Against Beta." *Journal of Financial Economics* 111(1):1–25.
- Gu, S., Kelly, B., & Xiu, D. (2020). "Empirical Asset Pricing via Machine Learning." *Review of Financial Studies* 33(5):2223–2273.
- Hamilton, J. D. (1989). "A New Approach to the Economic Analysis of Nonstationary Time Series and the Business Cycle." *Econometrica* 57(2):357–384.
- Harvey, C. R., Liu, Y., & Zhu, H. (2016). "...and the Cross-Section of Expected Returns." *Review of Financial Studies* 29(1):5–68.
- Hou, K., Xue, C., & Zhang, L. (2015). "Digesting Anomalies: An Investment Approach." *Review of Financial Studies* 28(3):650–705.
- Li, N., Wei, C., & Zhang, L. (2023). "Risk factors in the Indonesian stock market." *Pacific-Basin Finance Journal* Vol. 82, Article 102175. doi:10.1016/j.pacfin.2023.102175.
- López de Prado, M. (2018). *Advances in Financial Machine Learning.* Wiley.
- Piotroski, J. D. (2000). "Value Investing: The Use of Historical Financial Statement Information to Separate Winners from Losers." *Journal of Accounting Research* 38:1–41.

---

## 11. Citation Correction

Earlier internal documents (v3.1, December 2025) attributed the "IDX 152-factor Bayesian shrinkage" finding to "Wirjanto et al. (2023) Pac-Basin FJ 81, 102127." **That citation does not exist.** The paper actually meant — and the one Meridian's IDX weights are derived from — is **Li, Wei & Zhang (2023)**, *Pacific-Basin Finance Journal* 82, Article 102175. All mock-data citation tags across `lib/mock-*.ts` and the in-product Audit module have been updated accordingly.
