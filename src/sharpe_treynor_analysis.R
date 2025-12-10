#============================================================================
#============================================================================
#
#  SHARPE & TREYNOR RATIO ANALYSIS
#  JCI Mutual Fund Risk-Adjusted Performance
#
#  Author: Natan Equity Research
#  Date: December 2024
#
#  NOTE: Run this AFTER your main analysis script
#        Requires: merged dataframe with Alpha, Beta columns
#
#============================================================================
#============================================================================

library(tidyverse)
library(gridExtra)

setwd("~/Downloads")

cat("\n")
cat("████████████████████████████████████████████████████████████████████████\n")
cat("█  SHARPE & TREYNOR RATIO ANALYSIS                                     █\n")
cat("█  Risk-Adjusted Performance Metrics for JCI Funds                     █\n")
cat("████████████████████████████████████████████████████████████████████████\n\n")

#============================================================================
# PARAMETERS
#============================================================================

RISK_FREE_RATE <- 0.07118  # Bloomberg GIND10YR 10Y Average

# Market return assumption (JCI historical average)
# You can adjust this based on your data period
MARKET_RETURN <- 0.08  # ~8% historical JCI return

cat("📊 PARAMETERS:\n")
cat("   Risk-Free Rate (Rf):", RISK_FREE_RATE * 100, "%\n")
cat("   Market Return (Rm):", MARKET_RETURN * 100, "% (JCI historical avg)\n")
cat("   Market Risk Premium:", (MARKET_RETURN - RISK_FREE_RATE) * 100, "%\n\n")

#============================================================================
# LOAD DATA (from your previous analysis)
#============================================================================

# Check if merged exists, otherwise load from CSV
if (!exists("merged")) {
  cat("Loading data from JCI_Complete_Fund_Analysis.csv...\n")
  merged <- read_csv("JCI_Complete_Fund_Analysis.csv", show_col_types = FALSE)
}

cat("✅ Loaded", nrow(merged), "funds\n\n")

#============================================================================
# SHARPE RATIO CALCULATION
#============================================================================
#
# Sharpe Ratio = (Rp - Rf) / σp
#
# Where:
#   Rp = Portfolio/Fund return (we use Alpha_annualized as the fund's return)
#   Rf = Risk-free rate
#   σp = Standard deviation of portfolio returns (volatility)
#
# IMPORTANT: We're using Alpha as a proxy for total return here.
# For a more accurate Sharpe, you'd need the actual return series.
#
# Since we don't have individual fund volatility, we'll estimate it using:
#   σp ≈ β × σm (fund volatility ≈ beta × market volatility)
#
# JCI historical volatility is approximately 20-25% annually
#
#============================================================================

MARKET_VOLATILITY <- 0.22  # ~22% JCI historical annual volatility

cat("========================================\n")
cat("📈 SHARPE RATIO CALCULATION\n")
cat("========================================\n\n")

cat("Formula: Sharpe = (Rp - Rf) / σp\n")
cat("Where σp ≈ β × σm (estimated fund volatility)\n")
cat("Market Volatility (σm):", MARKET_VOLATILITY * 100, "%\n\n")

merged <- merged %>%
  mutate(
    # Estimate fund volatility using beta
    # σp = |β| × σm (absolute value of beta × market vol)
    Est_Volatility = abs(Beta) * MARKET_VOLATILITY,

    # Sharpe Ratio = (Return - Rf) / Volatility
    # Using Alpha_annualized as the fund's excess return over benchmark
    # Total Return ≈ Alpha + β × Rm
    Est_Total_Return = Alpha_annualized + (Beta * MARKET_RETURN),

    # Sharpe Ratio
    Sharpe_Ratio = (Est_Total_Return - RISK_FREE_RATE) / Est_Volatility,

    # Handle edge cases
    Sharpe_Ratio = ifelse(Est_Volatility == 0 | is.na(Est_Volatility),
                          NA_real_, Sharpe_Ratio),

    # Sharpe interpretation
    Sharpe_Rating = case_when(
      Sharpe_Ratio >= 1.0 ~ "Excellent (≥1.0)",
      Sharpe_Ratio >= 0.5 ~ "Good (0.5-1.0)",
      Sharpe_Ratio >= 0.0 ~ "Acceptable (0-0.5)",
      Sharpe_Ratio < 0.0 ~ "Poor (<0)",
      TRUE ~ "N/A"
    )
  )

#============================================================================
# TREYNOR RATIO CALCULATION
#============================================================================
#
# Treynor Ratio = (Rp - Rf) / βp
#
# Where:
#   Rp = Portfolio return
#   Rf = Risk-free rate
#   βp = Portfolio beta (systematic risk)
#
# Treynor measures excess return per unit of SYSTEMATIC risk (beta)
# Unlike Sharpe which uses TOTAL risk (standard deviation)
#
# Interpretation:
#   - Higher = better risk-adjusted performance
#   - Useful for comparing funds within a diversified portfolio
#   - Assumes unsystematic risk is diversified away
#
#============================================================================

cat("========================================\n")
cat("📈 TREYNOR RATIO CALCULATION\n")
cat("========================================\n\n")

cat("Formula: Treynor = (Rp - Rf) / β\n\n")

merged <- merged %>%
  mutate(
    # Treynor Ratio = (Return - Rf) / Beta
    Treynor_Ratio = (Est_Total_Return - RISK_FREE_RATE) / Beta,

    # Handle edge cases (beta = 0 or negative)
    Treynor_Ratio = ifelse(Beta <= 0 | is.na(Beta), NA_real_, Treynor_Ratio),

    # Treynor interpretation (relative to market risk premium)
    # Market Treynor = (Rm - Rf) / 1 = Market Risk Premium
    Market_Treynor = MARKET_RETURN - RISK_FREE_RATE,

    Treynor_Rating = case_when(
      Treynor_Ratio >= Market_Treynor * 1.5 ~ "Excellent (>1.5x Market)",
      Treynor_Ratio >= Market_Treynor ~ "Good (≥ Market)",
      Treynor_Ratio >= 0 ~ "Below Market (0 to Market)",
      Treynor_Ratio < 0 ~ "Negative",
      TRUE ~ "N/A"
    )
  )

#============================================================================
# INFORMATION RATIO (BONUS)
#============================================================================
#
# Information Ratio = Alpha / Tracking Error
#
# Measures alpha per unit of active risk taken
# Since we don't have tracking error, we'll estimate it
#
#============================================================================

# Estimate tracking error based on how far beta deviates from 1
# TE ≈ |1 - β| × σm (simplified approximation)
merged <- merged %>%
  mutate(
    Est_Tracking_Error = abs(1 - Beta) * MARKET_VOLATILITY + 0.02,  # Add 2% base TE
    Information_Ratio = Alpha_annualized / Est_Tracking_Error,

    IR_Rating = case_when(
      Information_Ratio >= 0.5 ~ "Excellent (≥0.5)",
      Information_Ratio >= 0.25 ~ "Good (0.25-0.5)",
      Information_Ratio >= 0 ~ "Acceptable (0-0.25)",
      Information_Ratio < 0 ~ "Negative Alpha",
      TRUE ~ "N/A"
    )
  )

#============================================================================
# RISK-ADJUSTED RANKINGS
#============================================================================

cat("========================================\n")
cat("🏆 RISK-ADJUSTED PERFORMANCE RANKINGS\n")
cat("========================================\n\n")

# Create rankings
merged <- merged %>%
  mutate(
    Sharpe_Rank = rank(-Sharpe_Ratio, na.last = "keep", ties.method = "min"),
    Treynor_Rank = rank(-Treynor_Ratio, na.last = "keep", ties.method = "min"),
    IR_Rank = rank(-Information_Ratio, na.last = "keep", ties.method = "min"),

    # Composite score (average of ranks)
    Composite_Rank = (Sharpe_Rank + Treynor_Rank + IR_Rank) / 3,
    Overall_Risk_Adj_Rank = rank(Composite_Rank, na.last = "keep", ties.method = "min")
  )

#============================================================================
# SUMMARY STATISTICS
#============================================================================

cat("📊 SHARPE RATIO SUMMARY:\n")
cat("─────────────────────────────────────────\n")
sharpe_summary <- merged %>%
  summarise(
    N = sum(!is.na(Sharpe_Ratio)),
    Mean = mean(Sharpe_Ratio, na.rm = TRUE),
    Median = median(Sharpe_Ratio, na.rm = TRUE),
    Min = min(Sharpe_Ratio, na.rm = TRUE),
    Max = max(Sharpe_Ratio, na.rm = TRUE),
    SD = sd(Sharpe_Ratio, na.rm = TRUE),
    Pct_Positive = mean(Sharpe_Ratio > 0, na.rm = TRUE) * 100
  )
print(sharpe_summary)

cat("\n📊 TREYNOR RATIO SUMMARY:\n")
cat("─────────────────────────────────────────\n")
treynor_summary <- merged %>%
  summarise(
    N = sum(!is.na(Treynor_Ratio)),
    Mean = mean(Treynor_Ratio, na.rm = TRUE),
    Median = median(Treynor_Ratio, na.rm = TRUE),
    Min = min(Treynor_Ratio, na.rm = TRUE),
    Max = max(Treynor_Ratio, na.rm = TRUE),
    SD = sd(Treynor_Ratio, na.rm = TRUE),
    Market_Benchmark = MARKET_RETURN - RISK_FREE_RATE,
    Pct_Beat_Market = mean(Treynor_Ratio > (MARKET_RETURN - RISK_FREE_RATE), na.rm = TRUE) * 100
  )
print(treynor_summary)

cat("\n📊 INFORMATION RATIO SUMMARY:\n")
cat("─────────────────────────────────────────\n")
ir_summary <- merged %>%
  summarise(
    N = sum(!is.na(Information_Ratio)),
    Mean = mean(Information_Ratio, na.rm = TRUE),
    Median = median(Information_Ratio, na.rm = TRUE),
    Min = min(Information_Ratio, na.rm = TRUE),
    Max = max(Information_Ratio, na.rm = TRUE),
    Pct_Positive = mean(Information_Ratio > 0, na.rm = TRUE) * 100
  )
print(ir_summary)

#============================================================================
# TOP 10 BY EACH RATIO
#============================================================================

cat("\n========================================\n")
cat("🥇 TOP 10 FUNDS BY SHARPE RATIO\n")
cat("========================================\n\n")

top_sharpe <- merged %>%
  filter(!is.na(Sharpe_Ratio)) %>%
  arrange(desc(Sharpe_Ratio)) %>%
  select(Fund, Fund_Name, Sharpe_Ratio, Sharpe_Rating,
         Est_Total_Return, Est_Volatility, Beta) %>%
  head(10) %>%
  mutate(
    Sharpe_Ratio = round(Sharpe_Ratio, 3),
    Est_Total_Return = paste0(round(Est_Total_Return * 100, 2), "%"),
    Est_Volatility = paste0(round(Est_Volatility * 100, 2), "%"),
    Beta = round(Beta, 3)
  )
print(top_sharpe)

cat("\n========================================\n")
cat("🥇 TOP 10 FUNDS BY TREYNOR RATIO\n")
cat("========================================\n\n")

top_treynor <- merged %>%
  filter(!is.na(Treynor_Ratio)) %>%
  arrange(desc(Treynor_Ratio)) %>%
  select(Fund, Fund_Name, Treynor_Ratio, Treynor_Rating,
         Est_Total_Return, Beta) %>%
  head(10) %>%
  mutate(
    Treynor_Ratio = round(Treynor_Ratio, 4),
    Est_Total_Return = paste0(round(Est_Total_Return * 100, 2), "%"),
    Beta = round(Beta, 3)
  )
print(top_treynor)

cat("\n========================================\n")
cat("🥇 TOP 10 FUNDS BY INFORMATION RATIO\n")
cat("========================================\n\n")

top_ir <- merged %>%
  filter(!is.na(Information_Ratio)) %>%
  arrange(desc(Information_Ratio)) %>%
  select(Fund, Fund_Name, Information_Ratio, IR_Rating,
         Alpha_annualized, Est_Tracking_Error) %>%
  head(10) %>%
  mutate(
    Information_Ratio = round(Information_Ratio, 3),
    Alpha_annualized = paste0(round(Alpha_annualized * 100, 2), "%"),
    Est_Tracking_Error = paste0(round(Est_Tracking_Error * 100, 2), "%")
  )
print(top_ir)

#============================================================================
# OVERALL RISK-ADJUSTED RANKING (COMPOSITE)
#============================================================================

cat("\n========================================\n")
cat("🏆 TOP 10 OVERALL RISK-ADJUSTED (COMPOSITE)\n")
cat("========================================\n")
cat("Composite = Average rank across Sharpe, Treynor, IR\n\n")

top_composite <- merged %>%
  filter(!is.na(Overall_Risk_Adj_Rank)) %>%
  arrange(Overall_Risk_Adj_Rank) %>%
  select(Fund, Fund_Name, Overall_Risk_Adj_Rank, Sharpe_Rank, Treynor_Rank, IR_Rank,
         Sharpe_Ratio, Treynor_Ratio, Information_Ratio) %>%
  head(10) %>%
  mutate(
    Sharpe_Ratio = round(Sharpe_Ratio, 3),
    Treynor_Ratio = round(Treynor_Ratio, 4),
    Information_Ratio = round(Information_Ratio, 3)
  )
print(top_composite)

#============================================================================
# RATING DISTRIBUTION
#============================================================================

cat("\n========================================\n")
cat("📊 RATING DISTRIBUTION\n")
cat("========================================\n\n")

cat("SHARPE RATIO RATINGS:\n")
print(table(merged$Sharpe_Rating, useNA = "ifany"))

cat("\nTREYNOR RATIO RATINGS:\n")
print(table(merged$Treynor_Rating, useNA = "ifany"))

cat("\nINFORMATION RATIO RATINGS:\n")
print(table(merged$IR_Rating, useNA = "ifany"))

#============================================================================
# VISUALIZATIONS
#============================================================================

cat("\n========================================\n")
cat("📊 CREATING VISUALIZATIONS\n")
cat("========================================\n\n")

# Plot 1: Sharpe Ratio Distribution
p1 <- ggplot(merged %>% filter(!is.na(Sharpe_Ratio)),
             aes(x = reorder(Fund, Sharpe_Ratio), y = Sharpe_Ratio, fill = Sharpe_Rating)) +
  geom_bar(stat = "identity") +
  geom_hline(yintercept = 0, color = "black", linewidth = 1) +
  geom_hline(yintercept = 0.5, color = "darkgreen", linetype = "dashed", linewidth = 0.8) +
  geom_hline(yintercept = 1.0, color = "green", linetype = "dashed", linewidth = 0.8) +
  coord_flip() +
  scale_fill_manual(values = c(
    "Excellent (≥1.0)" = "#2ca02c",
    "Good (0.5-1.0)" = "#98df8a",
    "Acceptable (0-0.5)" = "#ffbb78",
    "Poor (<0)" = "#d62728"
  )) +
  labs(
    title = "Sharpe Ratio by Fund",
    subtitle = "Dashed lines: 0.5 (Good), 1.0 (Excellent)",
    x = "",
    y = "Sharpe Ratio",
    fill = "Rating"
  ) +
  theme_minimal() +
  theme(
    axis.text.y = element_text(size = 6),
    legend.position = "bottom",
    plot.title = element_text(face = "bold")
  )

# Plot 2: Treynor Ratio Distribution
market_treynor <- MARKET_RETURN - RISK_FREE_RATE

p2 <- ggplot(merged %>% filter(!is.na(Treynor_Ratio)),
             aes(x = reorder(Fund, Treynor_Ratio), y = Treynor_Ratio, fill = Treynor_Rating)) +
  geom_bar(stat = "identity") +
  geom_hline(yintercept = 0, color = "black", linewidth = 1) +
  geom_hline(yintercept = market_treynor, color = "blue", linetype = "dashed", linewidth = 0.8) +
  coord_flip() +
  scale_fill_manual(values = c(
    "Excellent (>1.5x Market)" = "#2ca02c",
    "Good (≥ Market)" = "#98df8a",
    "Below Market (0 to Market)" = "#ffbb78",
    "Negative" = "#d62728"
  )) +
  labs(
    title = "Treynor Ratio by Fund",
    subtitle = paste0("Blue dashed line = Market benchmark (", round(market_treynor * 100, 2), "%)"),
    x = "",
    y = "Treynor Ratio",
    fill = "Rating"
  ) +
  theme_minimal() +
  theme(
    axis.text.y = element_text(size = 6),
    legend.position = "bottom",
    plot.title = element_text(face = "bold")
  )

# Plot 3: Sharpe vs Treynor Scatter
p3 <- ggplot(merged %>% filter(!is.na(Sharpe_Ratio) & !is.na(Treynor_Ratio)),
             aes(x = Sharpe_Ratio, y = Treynor_Ratio, color = Alpha_Quartile_Label)) +
  geom_point(size = 3, alpha = 0.7) +
  geom_hline(yintercept = market_treynor, color = "blue", linetype = "dashed") +
  geom_vline(xintercept = 0.5, color = "green", linetype = "dashed") +
  geom_text(aes(label = ifelse(Sharpe_Ratio > 0.3 | Treynor_Ratio > 0.02, Fund, "")),
            size = 2, hjust = -0.1, vjust = 0.5, check_overlap = TRUE) +
  labs(
    title = "Sharpe vs Treynor Ratio",
    subtitle = "Funds in upper-right quadrant have best risk-adjusted performance",
    x = "Sharpe Ratio",
    y = "Treynor Ratio",
    color = "Alpha Quartile"
  ) +
  scale_color_manual(values = c(
    "Q4 (Top 25%)" = "#2ca02c",
    "Q3 (50-75%)" = "#ff7f0e",
    "Q2 (25-50%)" = "#1f77b4",
    "Q1 (Bottom 25%)" = "#d62728"
  )) +
  theme_minimal() +
  theme(
    legend.position = "bottom",
    plot.title = element_text(face = "bold")
  )

# Plot 4: Risk-Return Tradeoff
p4 <- ggplot(merged %>% filter(!is.na(Est_Volatility)),
             aes(x = Est_Volatility, y = Est_Total_Return, color = Sharpe_Rating)) +
  geom_point(size = 3, alpha = 0.7) +
  geom_hline(yintercept = RISK_FREE_RATE, color = "red", linetype = "dashed") +
  geom_abline(slope = 0.5, intercept = RISK_FREE_RATE, color = "green", linetype = "dotted") +  # Sharpe = 0.5
  geom_abline(slope = 1.0, intercept = RISK_FREE_RATE, color = "darkgreen", linetype = "dotted") +  # Sharpe = 1.0
  labs(
    title = "Risk-Return Tradeoff",
    subtitle = paste0("Red = Risk-Free (", RISK_FREE_RATE*100, "%) | Dotted lines = Sharpe 0.5, 1.0"),
    x = "Estimated Volatility (σ)",
    y = "Estimated Total Return",
    color = "Sharpe Rating"
  ) +
  scale_x_continuous(labels = scales::percent) +
  scale_y_continuous(labels = scales::percent) +
  scale_color_manual(values = c(
    "Excellent (≥1.0)" = "#2ca02c",
    "Good (0.5-1.0)" = "#98df8a",
    "Acceptable (0-0.5)" = "#ffbb78",
    "Poor (<0)" = "#d62728"
  )) +
  theme_minimal() +
  theme(
    legend.position = "bottom",
    plot.title = element_text(face = "bold")
  )

# Save plots
png("Sharpe_Ratio_Distribution.png", width = 1200, height = 1000, res = 150)
print(p1)
dev.off()
cat("✅ Sharpe_Ratio_Distribution.png\n")

png("Treynor_Ratio_Distribution.png", width = 1200, height = 1000, res = 150)
print(p2)
dev.off()
cat("✅ Treynor_Ratio_Distribution.png\n")

png("Sharpe_vs_Treynor_Scatter.png", width = 1000, height = 800, res = 150)
print(p3)
dev.off()
cat("✅ Sharpe_vs_Treynor_Scatter.png\n")

png("Risk_Return_Tradeoff.png", width = 1000, height = 800, res = 150)
print(p4)
dev.off()
cat("✅ Risk_Return_Tradeoff.png\n")

# Combined 4-panel
png("Risk_Adjusted_Analysis_4Panel.png", width = 2000, height = 1600, res = 150)
grid.arrange(p1, p2, p3, p4, ncol = 2,
             top = grid::textGrob("JCI Fund Risk-Adjusted Performance Analysis",
                                  gp = grid::gpar(fontsize = 18, fontface = "bold")))
dev.off()
cat("✅ Risk_Adjusted_Analysis_4Panel.png\n\n")

#============================================================================
# EXPORT RESULTS
#============================================================================

cat("========================================\n")
cat("📁 EXPORTING RESULTS\n")
cat("========================================\n\n")

# Full dataset with ratios
risk_adjusted_full <- merged %>%
  arrange(desc(Sharpe_Ratio)) %>%
  select(
    Fund, Fund_Name, Type, Source,
    Alpha_annualized, Beta,
    Est_Total_Return, Est_Volatility,
    Sharpe_Ratio, Sharpe_Rating, Sharpe_Rank,
    Treynor_Ratio, Treynor_Rating, Treynor_Rank,
    Information_Ratio, IR_Rating, IR_Rank,
    Overall_Risk_Adj_Rank,
    AUM, Expense_Ratio, Age_Years
  ) %>%
  mutate(
    Alpha_pct = paste0(round(Alpha_annualized * 100, 2), "%"),
    Return_pct = paste0(round(Est_Total_Return * 100, 2), "%"),
    Volatility_pct = paste0(round(Est_Volatility * 100, 2), "%")
  )

write_csv(risk_adjusted_full, "JCI_Risk_Adjusted_Analysis.csv")
cat("✅ JCI_Risk_Adjusted_Analysis.csv\n")

# Summary table for presentation
summary_table <- data.frame(
  Metric = c(
    "SHARPE RATIO",
    "Mean Sharpe", "Median Sharpe", "Best Sharpe", "Worst Sharpe",
    "Funds with Sharpe ≥ 0.5 (Good)", "Funds with Sharpe ≥ 1.0 (Excellent)",
    "",
    "TREYNOR RATIO",
    "Mean Treynor", "Median Treynor", "Best Treynor", "Worst Treynor",
    "Market Benchmark Treynor", "Funds Beating Market",
    "",
    "INFORMATION RATIO",
    "Mean IR", "Median IR", "Best IR", "Worst IR",
    "Funds with Positive IR",
    "",
    "PARAMETERS",
    "Risk-Free Rate", "Market Return", "Market Volatility"
  ),
  Value = c(
    "",
    round(sharpe_summary$Mean, 3), round(sharpe_summary$Median, 3),
    round(sharpe_summary$Max, 3), round(sharpe_summary$Min, 3),
    sum(merged$Sharpe_Ratio >= 0.5, na.rm = TRUE),
    sum(merged$Sharpe_Ratio >= 1.0, na.rm = TRUE),
    "",
    "",
    round(treynor_summary$Mean, 4), round(treynor_summary$Median, 4),
    round(treynor_summary$Max, 4), round(treynor_summary$Min, 4),
    round(market_treynor, 4),
    sum(merged$Treynor_Ratio > market_treynor, na.rm = TRUE),
    "",
    "",
    round(ir_summary$Mean, 3), round(ir_summary$Median, 3),
    round(ir_summary$Max, 3), round(ir_summary$Min, 3),
    sum(merged$Information_Ratio > 0, na.rm = TRUE),
    "",
    "",
    paste0(RISK_FREE_RATE * 100, "%"),
    paste0(MARKET_RETURN * 100, "%"),
    paste0(MARKET_VOLATILITY * 100, "%")
  ),
  stringsAsFactors = FALSE
)

write_csv(summary_table, "JCI_Risk_Adjusted_Summary.csv")
cat("✅ JCI_Risk_Adjusted_Summary.csv\n")

# Top performers table
top_performers <- merged %>%
  filter(Overall_Risk_Adj_Rank <= 10) %>%
  arrange(Overall_Risk_Adj_Rank) %>%
  select(
    Overall_Rank = Overall_Risk_Adj_Rank,
    Fund, Fund_Name,
    Sharpe = Sharpe_Ratio,
    Treynor = Treynor_Ratio,
    IR = Information_Ratio,
    Alpha = Alpha_annualized,
    Beta,
    Expense_Ratio
  ) %>%
  mutate(
    Sharpe = round(Sharpe, 3),
    Treynor = round(Treynor, 4),
    IR = round(IR, 3),
    Alpha = paste0(round(Alpha * 100, 2), "%"),
    Beta = round(Beta, 3),
    Expense_Ratio = paste0(round(Expense_Ratio * 100, 2), "%")
  )

write_csv(top_performers, "JCI_Top10_Risk_Adjusted.csv")
cat("✅ JCI_Top10_Risk_Adjusted.csv\n\n")

#============================================================================
# FINAL SUMMARY
#============================================================================

cat("████████████████████████████████████████████████████████████████████████\n")
cat("█  RISK-ADJUSTED ANALYSIS COMPLETE                                     █\n")
cat("████████████████████████████████████████████████████████████████████████\n\n")

cat("📊 KEY FINDINGS:\n")
cat("─────────────────────────────────────────\n")
cat(sprintf("   Sharpe Ratio:  Mean = %.3f, %d/%d funds > 0.5 (Good)\n",
            sharpe_summary$Mean, sum(merged$Sharpe_Ratio >= 0.5, na.rm = TRUE), nrow(merged)))
cat(sprintf("   Treynor Ratio: Mean = %.4f, %d/%d funds > Market (%.4f)\n",
            treynor_summary$Mean, sum(merged$Treynor_Ratio > market_treynor, na.rm = TRUE),
            nrow(merged), market_treynor))
cat(sprintf("   Info Ratio:    Mean = %.3f, %d/%d funds > 0 (Positive Alpha)\n",
            ir_summary$Mean, sum(merged$Information_Ratio > 0, na.rm = TRUE), nrow(merged)))
cat("\n")

cat("🏆 TOP 3 RISK-ADJUSTED PERFORMERS:\n")
top3 <- merged %>% arrange(Overall_Risk_Adj_Rank) %>% head(3)
for (i in 1:3) {
  cat(sprintf("   %d. %s (Sharpe: %.3f, Treynor: %.4f)\n",
              i, top3$Fund[i], top3$Sharpe_Ratio[i], top3$Treynor_Ratio[i]))
}
cat("\n")

cat("📁 FILES CREATED:\n")
cat("   📊 Sharpe_Ratio_Distribution.png\n")
cat("   📊 Treynor_Ratio_Distribution.png\n")
cat("   📊 Sharpe_vs_Treynor_Scatter.png\n")
cat("   📊 Risk_Return_Tradeoff.png\n")
cat("   📊 Risk_Adjusted_Analysis_4Panel.png\n")
cat("   📁 JCI_Risk_Adjusted_Analysis.csv (full data)\n")
cat("   📁 JCI_Risk_Adjusted_Summary.csv (summary stats)\n")
cat("   📁 JCI_Top10_Risk_Adjusted.csv (top performers)\n\n")

cat("💡 INTERPRETATION GUIDE:\n")
cat("   Sharpe Ratio:  ≥1.0 Excellent | 0.5-1.0 Good | 0-0.5 OK | <0 Poor\n")
cat("   Treynor Ratio: Compare to market (", round(market_treynor * 100, 2), "%) - higher is better\n", sep = "")
cat("   Info Ratio:    ≥0.5 Excellent | 0.25-0.5 Good | >0 Acceptable\n\n")

cat("========================================\n")
cat("✅ Analysis saved to ~/Downloads/\n")
cat("========================================\n")
