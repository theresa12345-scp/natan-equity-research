library(tidyverse)
library(gridExtra)

# Set working directories
setwd("~/Downloads")

cat("\n========================================\n")
cat("LOADING DATA: LQ45 + JCI\n")
cat("========================================\n\n")

#============================================================================
# LOAD LQ45 DATA (with categories - this works)
#============================================================================

# You need to copy LQ45 files from Desktop to Downloads first
# Or adjust paths below

# FOR NOW: Load LQ45 from Desktop
lq45_path <- "~/Desktop/mutual_fund_analysis"

cat("Loading LQ45 data from:", lq45_path, "\n")

# Helper functions
clean_name <- function(x) {
  x %>%
    str_replace_all("_", " ") %>%
    str_squish() %>%
    str_to_upper()
}

find_col <- function(df, patterns) {
  nm <- names(df)
  nm_lower <- tolower(nm)
  for (pat in patterns) {
    idx <- which(str_detect(nm_lower, pat))
    if (length(idx) > 0) return(nm[idx[1]])
  }
  return(NA_character_)
}

parse_expense <- function(x) {
  x_chr <- as.character(x)
  x_chr <- str_trim(x_chr)
  x_chr[x_chr == ""] <- NA
  x_chr <- str_remove_all(x_chr, ",")
  has_pct <- str_detect(x_chr, "%")
  v <- suppressWarnings(as.numeric(str_remove_all(x_chr, "%")))
  v[is.nan(v)] <- NA_real_
  v <- ifelse(!is.na(v) & has_pct, v / 100, v)
  v <- ifelse(!is.na(v) & v > 0.1 & v <= 100 & !has_pct, v / 100, v)
  return(as.numeric(v))
}

compute_age_from_inception <- function(inception_col) {
  dt <- suppressWarnings(as_date(inception_col))
  na_idx <- which(is.na(dt) & !is.na(inception_col))
  if (length(na_idx) > 0) {
    dt_try <- suppressWarnings(parse_date_time(inception_col[na_idx],
                                               orders = c("ymd", "dmy", "mdy", "Ymd", "dby", "dBy")
    ))
    dt[na_idx] <- dt_try
  }
  age <- as.numeric(difftime(Sys.Date(), dt, units = "days")) / 365.25
  age[is.na(dt)] <- NA_real_
  return(age)
}

load_and_standardize_categories <- function(path, source_label = NA_character_) {
  if (!file.exists(path)) {
    warning("File not found: ", path)
    return(tibble())
  }
  df <- read_csv(path, col_types = cols(.default = col_character()))
  
  fund_col       <- find_col(df, c("^fund$", "fund_name", "fund_code", "etf_code", "ticker", "name"))
  aum_col        <- find_col(df, c("^aum$", "asset", "asset_under", "asset_under_management", "a_u_m"))
  expense_col    <- find_col(df, c("expense", "expense_ratio", "ter", "fee"))
  age_col        <- find_col(df, c("^age$", "fund_age", "age_years", "age_yrs"))
  inception_col  <- find_col(df, c("inception", "inception_date", "start_date", "launch"))
  
  std <- tibble(Fund = if (!is.na(fund_col)) df[[fund_col]] else NA_character_)
  
  if (!is.na(aum_col)) {
    aum_num <- suppressWarnings(as.numeric(str_remove_all(df[[aum_col]], "[^0-9\\.-]")))
    std <- std %>% mutate(AUM = aum_num)
  } else std <- std %>% mutate(AUM = NA_real_)
  
  if (!is.na(expense_col)) {
    std <- std %>% mutate(Expense_Ratio = parse_expense(df[[expense_col]]))
  } else std <- std %>% mutate(Expense_Ratio = NA_real_)
  
  if (!is.na(age_col)) {
    age_num <- suppressWarnings(as.numeric(str_remove_all(df[[age_col]], "[^0-9\\.-]")))
    std <- std %>% mutate(Age_Years = age_num)
  } else if (!is.na(inception_col)) {
    std <- std %>% mutate(Age_Years = compute_age_from_inception(df[[inception_col]]))
  } else std <- std %>% mutate(Age_Years = NA_real_)
  
  if (!is.na(source_label)) std <- std %>% mutate(Source = source_label)
  
  std <- std %>%
    mutate(Fund = str_squish(as.character(Fund))) %>%
    filter(!is.na(Fund) & Fund != "")
  
  return(std)
}

# Load LQ45 categories
setwd(lq45_path)
cat_mf_lq45 <- load_and_standardize_categories("MFLQ45Categories.csv", "MF_LQ45")
cat_etf_lq45 <- load_and_standardize_categories("ETFLQ45Categories.csv", "ETF_LQ45")
categories_lq45 <- bind_rows(cat_mf_lq45, cat_etf_lq45) %>%
  mutate(Fund_clean = clean_name(Fund))

# Load LQ45 performance
perf_lq45 <- read_csv("combined_alpha_beta_tstats_LQ45.csv") %>%
  mutate(
    Fund = as.character(Fund),
    Alpha_annualized = as.numeric(Alpha_annualized),
    Beta = as.numeric(Beta),
    Type = as.character(Type),
    Index = "LQ45",
    Fund_clean = clean_name(Fund)
  )

# Merge LQ45
merged_lq45 <- perf_lq45 %>%
  left_join(categories_lq45 %>% select(-Fund), by = "Fund_clean") %>%
  select(-Fund_clean) %>%
  mutate(
    AUM = as.numeric(AUM),
    Expense_Ratio = as.numeric(Expense_Ratio),
    Age_Years = as.numeric(Age_Years)
  )

cat("✅ LQ45 loaded:", nrow(merged_lq45), "funds\n")

#============================================================================
# LOAD JCI DATA (performance only - NO categories)
#============================================================================

setwd("~/Downloads")

perf_jci <- read_csv("combined_alpha_beta_tstats_JCI.csv") %>%
  mutate(
    Fund = as.character(Fund),
    Alpha_annualized = as.numeric(Alpha_annualized),
    Beta = as.numeric(Beta),
    Type = as.character(Type),
    Index = "JCI",
    AUM = NA_real_,
    Expense_Ratio = NA_real_,
    Age_Years = NA_real_,
    Source = case_when(
      Type == "Mutual Fund" ~ "MF_JCI",
      Type == "ETF" ~ "ETF_JCI",
      TRUE ~ "MF_JCI"
    )
  )

cat("✅ JCI loaded:", nrow(perf_jci), "funds (no category data)\n")

#============================================================================
# COMBINE DATASETS
#============================================================================

# Make sure columns match
common_cols <- intersect(names(merged_lq45), names(perf_jci))

merged_combined <- bind_rows(
  merged_lq45 %>% select(all_of(common_cols)),
  perf_jci %>% select(all_of(common_cols))
)

cat("✅ Combined:", nrow(merged_combined), "total funds\n")
cat("   - LQ45:", sum(merged_combined$Index == "LQ45"), "\n")
cat("   - JCI:", sum(merged_combined$Index == "JCI"), "\n\n")

#============================================================================
# ANALYSIS & PLOTS
#============================================================================

# Plot 1: Alpha Distribution by Index
p1 <- merged_combined %>%
  filter(!is.na(Alpha_annualized)) %>%
  ggplot(aes(x = Index, y = Alpha_annualized, fill = Index)) +
  geom_boxplot(alpha = 0.6, outlier.alpha = 0.3) +
  geom_jitter(aes(color = Index), width = 0.2, size = 2, alpha = 0.5) +
  labs(title = "Alpha Distribution: LQ45 vs JCI",
       subtitle = "Comparing fund performance across indices",
       x = "Index",
       y = "Alpha (annualized)") +
  scale_fill_manual(values = c("LQ45" = "#1f78b4", "JCI" = "#e41a1c")) +
  scale_color_manual(values = c("LQ45" = "#1f78b4", "JCI" = "#e41a1c")) +
  theme_minimal() +
  theme(legend.position = "none",
        plot.title = element_text(face = "bold", size = 14))

# Plot 2: Alpha vs Beta
p2 <- merged_combined %>%
  filter(!is.na(Alpha_annualized), !is.na(Beta)) %>%
  ggplot(aes(x = Beta, y = Alpha_annualized, color = Index, shape = Type)) +
  geom_point(size = 3, alpha = 0.7) +
  geom_hline(yintercept = 0, linetype = "dashed", color = "gray40") +
  geom_vline(xintercept = 1, linetype = "dashed", color = "gray40") +
  labs(title = "Alpha vs Beta: LQ45 & JCI",
       subtitle = "Risk-adjusted performance comparison",
       x = "Beta (Market Risk)",
       y = "Alpha (annualized)") +
  scale_color_manual(values = c("LQ45" = "#1f78b4", "JCI" = "#e41a1c")) +
  scale_shape_manual(values = c("Mutual Fund" = 16, "ETF" = 17)) +
  theme_minimal() +
  theme(legend.position = "bottom",
        plot.title = element_text(face = "bold", size = 14))

# Plot 3: Only for LQ45 (has AUM data)
p3 <- merged_combined %>%
  filter(Index == "LQ45", !is.na(AUM), !is.na(Alpha_annualized)) %>%
  ggplot(aes(x = log10(AUM), y = Alpha_annualized, color = Source)) +
  geom_point(size = 3, alpha = 0.8) +
  geom_smooth(method = "lm", se = TRUE, aes(group = Source)) +
  labs(title = "Alpha vs AUM - LQ45 Only",
       subtitle = "JCI excluded (no AUM data available)",
       x = "log10(AUM)",
       y = "Alpha (annualized)") +
  scale_color_manual(values = c("MF_LQ45" = "#1f78b4", "ETF_LQ45" = "#33a02c")) +
  theme_minimal() +
  theme(legend.position = "bottom",
        plot.title = element_text(face = "bold", size = 12))

# Save plots
png("LQ45_JCI_Comparison_Alpha_Beta_Only.png", width = 1800, height = 600, res = 150)
grid.arrange(p1, p2, ncol = 2)
dev.off()

png("LQ45_AUM_Analysis.png", width = 800, height = 600, res = 150)
print(p3)
dev.off()

cat("\n✅ Plots saved:\n")
cat("   - LQ45_JCI_Comparison_Alpha_Beta_Only.png\n")
cat("   - LQ45_AUM_Analysis.png\n")

# Statistical test
cat("\n===== T-TEST: LQ45 vs JCI Alpha =====\n")
ttest_result <- t.test(Alpha_annualized ~ Index, data = merged_combined)
print(ttest_result)

cat("\n✅ ANALYSIS COMPLETE!\n")
cat("\n⚠️  NOTE: JCI analysis limited to Alpha/Beta only.\n")
cat("   To include AUM/Expense/Age analysis, you need matching category data.\n")


# GENERATE TEMPLATE FILE
library(tidyverse)
setwd("~/Downloads")

cat("\n========================================\n")
cat("CREATING JCI CATEGORY TEMPLATE\n")
cat("========================================\n\n")

# Load your JCI performance data
perf_jci <- read_csv("combined_alpha_beta_tstats_JCI.csv") %>%
  mutate(
    Fund = as.character(Fund),
    Type = as.character(Type),
    Alpha_annualized = as.numeric(Alpha_annualized),
    Beta = as.numeric(Beta)
  )

cat("Creating template for", nrow(perf_jci), "JCI funds...\n\n")

# Create category template
jci_category_template <- perf_jci %>%
  select(Fund, Type) %>%
  mutate(
    # Extract ticker (remove "_IJ_Equity" suffix)
    Ticker = str_remove(Fund, "_IJ_Equity"),
    
    # Placeholder columns - YOU WILL FILL THESE
    AUM = NA_real_,                    # ← FILL FROM BLOOMBERG/OJK
    Expense_Ratio = NA_real_,          # ← FILL FROM FUND PROSPECTUS
    Inception_Date = NA_character_,    # ← FILL FROM BLOOMBERG (format: YYYY-MM-DD)
    Age_Years = NA_real_,              # ← AUTO-CALCULATED FROM INCEPTION
    
    # Manager info (optional but useful)
    Fund_Manager = NA_character_,
    
    # Source label
    Source = case_when(
      Type == "Mutual Fund" ~ "MF_JCI",
      Type == "ETF" ~ "ETF_JCI",
      TRUE ~ "MF_JCI"
    )
  ) %>%
  arrange(desc(Type), Ticker)  # ETFs first, then MFs alphabetically

# Separate into MF and ETF
template_mf <- jci_category_template %>% 
  filter(Source == "MF_JCI") %>%
  select(Fund, Ticker, AUM, Expense_Ratio, Inception_Date, Age_Years, Fund_Manager, Source)

template_etf <- jci_category_template %>% 
  filter(Source == "ETF_JCI") %>%
  select(Fund, Ticker, AUM, Expense_Ratio, Inception_Date, Age_Years, Fund_Manager, Source)

# Save templates
write_csv(template_mf, "JCI_MF_TEMPLATE_TO_FILL.csv")
write_csv(template_etf, "JCI_ETF_TEMPLATE_TO_FILL.csv")

cat("✅ Templates created:\n")
cat("   - JCI_MF_TEMPLATE_TO_FILL.csv (", nrow(template_mf), " mutual funds)\n", sep="")
cat("   - JCI_ETF_TEMPLATE_TO_FILL.csv (", nrow(template_etf), " ETFs)\n\n", sep="")

# Show what needs to be filled
cat("========================================\n")
cat("FUNDS NEEDING DATA:\n")
cat("========================================\n\n")

cat("--- Mutual Funds (", nrow(template_mf), ") ---\n", sep="")
print(template_mf %>% select(Ticker) %>% head(20))

if (nrow(template_mf) > 20) {
  cat("\n... and", nrow(template_mf) - 20, "more\n")
}

cat("\n--- ETFs (", nrow(template_etf), ") ---\n", sep="")
print(template_etf %>% select(Ticker))

cat("\n========================================\n")
cat("NEXT STEPS:\n")
cat("========================================\n")
cat("1. Open JCI_MF_TEMPLATE_TO_FILL.csv in Excel\n")
cat("2. Fill in AUM, Expense_Ratio, and Inception_Date columns\n")
cat("3. Save as: MFJCICategories_CORRECT.csv\n")
cat("4. Repeat for ETFs\n")
cat("5. Run PHASE 2 code below\n\n")

# Export fund list for Bloomberg lookup
fund_tickers <- jci_category_template %>%
  select(Ticker, Type) %>%
  arrange(Ticker)

write_csv(fund_tickers, "JCI_Fund_List_For_Bloomberg.csv")

cat("✅ Also created: JCI_Fund_List_For_Bloomberg.csv\n")
cat("   (Import this into Bloomberg to batch-download data)\n\n")

# TESTING HERE
library(tidyverse)
setwd("~/Downloads")

cat("========================================\n")
cat("VERIFYING YOUR FILES\n")
cat("========================================\n\n")

# Check if files exist
if (!file.exists("MFJCICategories_CORRECT.csv")) {
  stop("❌ MFJCICategories_CORRECT.csv not found!")
}
if (!file.exists("ETFJCICategories_CORRECT.csv")) {
  stop("❌ ETFJCICategories_CORRECT.csv not found!")
}

# Load files
mf <- read_csv("MFJCICategories_CORRECT.csv")
etf <- read_csv("ETFJCICategories_CORRECT.csv")

cat("✅ Files loaded successfully\n\n")

cat("Mutual Funds:\n")
cat("  Rows:", nrow(mf), "\n")
cat("  Expected: 43\n")
cat("  Columns:", paste(names(mf), collapse = ", "), "\n")
cat("  Missing AUM:", sum(is.na(mf$AUM)), "\n")
cat("  Missing Expense:", sum(is.na(mf$Expense_Ratio)), "\n\n")

cat("ETFs:\n")
cat("  Rows:", nrow(etf), "\n")
cat("  Expected: 7\n")
cat("  Columns:", paste(names(etf), collapse = ", "), "\n")
cat("  Missing AUM:", sum(is.na(etf$AUM)), "\n")
cat("  Missing Expense:", sum(is.na(etf$Expense_Ratio)), "\n\n")

cat("Sample MF data:\n")
print(head(mf, 3))

cat("\nSample ETF data:\n")
print(head(etf, 3))

cat("\n========================================\n")
if (nrow(mf) == 43 && nrow(etf) == 7 &&
    sum(is.na(mf$AUM)) == 0 && sum(is.na(etf$AUM)) == 0) {
  cat("✅ VERIFICATION PASSED - Ready for analysis!\n")
} else {
  cat("⚠️  CHECK WARNINGS ABOVE\n")
}
cat("========================================\n")

RISK_FREE_RATE <- 0.07118  # 7.118% - Bloomberg GIND10YR Average (01/01/2015 - 11/17/2025)

#============================================================================
# FINAL HERE - RUN THIS ONE
#============================================================================
library(tidyverse)
library(gridExtra)
library(lubridate)

setwd("~/Downloads")

cat("\n========================================\n")
cat("AXA MANDIRI - JCI FUND SELECTION\n")
cat("Investment Analyst Intern Analysis\n")
cat("========================================\n\n")

#============================================================================
# HELPER FUNCTIONS
#============================================================================

clean_name <- function(x) {
  x %>% str_replace_all("_", " ") %>% str_squish() %>% str_to_upper()
}

#============================================================================
# LOAD DATA
#============================================================================

# Performance data
perf_jci <- read_csv("combined_alpha_beta_tstats_JCI.csv") %>%
  mutate(
    Fund = as.character(Fund),
    Alpha_annualized = as.numeric(Alpha_annualized),
    Beta = as.numeric(Beta),
    Type = as.character(Type),
    Fund_clean = clean_name(Fund)
  )

# Category data
cat_mf <- read_csv("MFJCICategories_CORRECT.csv") %>%
  mutate(
    Fund_clean = clean_name(Fund),
    AUM = as.numeric(AUM),
    Expense_Ratio = as.numeric(Expense_Ratio),
    Age_Years = as.numeric(Age_Years)
  )

cat_etf <- read_csv("ETFJCICategories_CORRECT.csv") %>%
  mutate(
    Fund_clean = clean_name(Fund),
    AUM = as.numeric(AUM),
    Expense_Ratio = as.numeric(Expense_Ratio),
    Age_Years = as.numeric(Age_Years)
  )

categories <- bind_rows(cat_mf, cat_etf)

# Merge
merged <- perf_jci %>%
  left_join(categories %>% select(Fund_clean, AUM, Expense_Ratio, Age_Years, Source),
            by = "Fund_clean") %>%
  select(-Fund_clean)

# Verify merge
match_count <- sum(!is.na(merged$AUM))
cat("✅ Data merged:", match_count, "/", nrow(merged), "funds\n\n")

#============================================================================
# INVESTMENT PARAMETERS (BLOOMBERG DATA INTEGRATED)
#============================================================================

# ⭐ BLOOMBERG 10-YEAR INDONESIA GOVERNMENT BOND YIELD ⭐
RISK_FREE_RATE <- 0.07118  # 7.118% - Bloomberg GIND10YR Average (01/01/2015 - 11/17/2025)

# Investment screening criteria (AXA Mandiri standards)
MIN_AUM <- 100000000000        # 100B IDR minimum for liquidity
MAX_EXPENSE_RATIO <- 0.025     # 2.5% maximum
MIN_AGE <- 3                   # 3 years minimum track record
MIN_EXCESS_RETURN <- 0.01      # Must beat risk-free by at least 1%

cat("Investment Criteria:\n")
cat("  Risk-Free Rate (Bloomberg GIND10YR 10Y Avg):", RISK_FREE_RATE * 100, "%\n")
cat("  Min AUM:", format(MIN_AUM / 1e9, big.mark=","), "B IDR\n")
cat("  Max Expense Ratio:", MAX_EXPENSE_RATIO * 100, "%\n")
cat("  Min Age:", MIN_AGE, "years\n")
cat("  Min Excess Return:", MIN_EXCESS_RETURN * 100, "% above risk-free\n\n")

#============================================================================
# CALCULATE INVESTMENT METRICS
#============================================================================

merged <- merged %>%
  mutate(
    # Risk-adjusted metrics
    Excess_Return = Alpha_annualized - RISK_FREE_RATE,
    
    # Quartile ranking
    Alpha_Quartile = ntile(Alpha_annualized, 4),
    Alpha_Quartile_Label = case_when(
      Alpha_Quartile == 4 ~ "Q4 (Top 25%)",
      Alpha_Quartile == 3 ~ "Q3 (50-75%)",
      Alpha_Quartile == 2 ~ "Q2 (25-50%)",
      Alpha_Quartile == 1 ~ "Q1 (Bottom 25%)",
      TRUE ~ NA_character_
    ),
    
    # Investment screening flags
    Meets_AUM = AUM >= MIN_AUM | is.na(AUM),
    Meets_Expense = Expense_Ratio <= MAX_EXPENSE_RATIO,
    Meets_Age = Age_Years >= MIN_AGE | is.na(Age_Years),
    Beats_Risk_Free = Excess_Return >= MIN_EXCESS_RETURN,
    
    # Overall investment grade
    Investment_Grade = Meets_AUM & Meets_Expense & Meets_Age & Beats_Risk_Free,
    
    # Recommendation tier
    Recommendation = case_when(
      Alpha_Quartile == 4 & Investment_Grade ~ "STRONG BUY",
      Alpha_Quartile == 4 & !Investment_Grade ~ "BUY (verify criteria)",
      Alpha_Quartile == 3 & Investment_Grade ~ "CONSIDER",
      Alpha_Quartile >= 2 & Beats_Risk_Free ~ "MONITOR",
      TRUE ~ "EXCLUDE"
    )
  )

#============================================================================
# INVESTMENT RECOMMENDATIONS
#============================================================================

cat("========================================\n")
cat("FUND RECOMMENDATIONS\n")
cat("========================================\n\n")

# Strong Buy recommendations
strong_buy <- merged %>%
  filter(Recommendation == "STRONG BUY") %>%
  arrange(desc(Alpha_annualized)) %>%
  select(Fund, Alpha_annualized, Excess_Return, Beta, AUM, Expense_Ratio, Age_Years, Source)

cat("🟢 STRONG BUY RECOMMENDATIONS (", nrow(strong_buy), " funds):\n", sep="")
if (nrow(strong_buy) > 0) {
  print(strong_buy)
} else {
  cat("   No funds meet all STRONG BUY criteria.\n")
  cat("   Relaxing criteria may be needed.\n")
}

# Consider tier
consider <- merged %>%
  filter(Recommendation == "CONSIDER") %>%
  arrange(desc(Alpha_annualized)) %>%
  select(Fund, Alpha_annualized, Excess_Return, Beta, AUM, Expense_Ratio, Age_Years, Source)

cat("\n🟡 CONSIDER (", nrow(consider), " funds):\n", sep="")
if (nrow(consider) > 0) {
  print(head(consider, 10))
  if (nrow(consider) > 10) {
    cat("   ... and", nrow(consider) - 10, "more\n")
  }
}

# High alpha but needs verification
verify <- merged %>%
  filter(Recommendation == "BUY (verify criteria)") %>%
  arrange(desc(Alpha_annualized)) %>%
  select(Fund, Alpha_annualized, Excess_Return, AUM, Expense_Ratio, Age_Years)

if (nrow(verify) > 0) {
  cat("\n⚠️  HIGH ALPHA - NEEDS VERIFICATION (", nrow(verify), " funds):\n", sep="")
  cat("   (Strong performance but doesn't meet all screening criteria)\n")
  print(verify)
}

#============================================================================
# QUARTILE ANALYSIS
#============================================================================

cat("\n========================================\n")
cat("QUARTILE BREAKDOWN\n")
cat("========================================\n\n")

quartile_summary <- merged %>%
  group_by(Alpha_Quartile_Label) %>%
  summarise(
    N = n(),
    Min_Alpha = min(Alpha_annualized, na.rm = TRUE),
    Max_Alpha = max(Alpha_annualized, na.rm = TRUE),
    Avg_Alpha = mean(Alpha_annualized, na.rm = TRUE),
    Avg_Excess = mean(Excess_Return, na.rm = TRUE),
    Avg_Expense = mean(Expense_Ratio, na.rm = TRUE),
    Investment_Grade = sum(Investment_Grade, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  arrange(desc(Alpha_Quartile_Label))

print(quartile_summary)

#============================================================================
# MIN/MAX STATISTICS
#============================================================================

cat("\n========================================\n")
cat("MIN/MAX PERFORMANCE RANGE\n")
cat("========================================\n\n")

min_max <- merged %>%
  summarise(
    Best_Alpha = max(Alpha_annualized, na.rm = TRUE),
    Worst_Alpha = min(Alpha_annualized, na.rm = TRUE),
    Alpha_Range = Best_Alpha - Worst_Alpha,
    Best_Excess = max(Excess_Return, na.rm = TRUE),
    Worst_Excess = min(Excess_Return, na.rm = TRUE),
    Avg_Alpha = mean(Alpha_annualized, na.rm = TRUE),
    Median_Alpha = median(Alpha_annualized, na.rm = TRUE),
    Avg_Expense = mean(Expense_Ratio, na.rm = TRUE),
    Funds_Beat_RiskFree = sum(Beats_Risk_Free, na.rm = TRUE)
  )

print(min_max)

cat("\n🏆 TOP 5 PERFORMERS:\n")
top5 <- merged %>%
  arrange(desc(Alpha_annualized)) %>%
  select(Fund, Alpha_annualized, Excess_Return, Expense_Ratio, AUM, Recommendation) %>%
  head(5)
print(top5)

cat("\n📉 BOTTOM 5 PERFORMERS:\n")
bottom5 <- merged %>%
  arrange(Alpha_annualized) %>%
  select(Fund, Alpha_annualized, Excess_Return, Expense_Ratio, Recommendation) %>%
  head(5)
print(bottom5)

cat("\n📊 KEY INSIGHTS:\n")
cat("   • Alpha range:", round(min_max$Alpha_Range * 100, 2), "percentage points\n")
cat("   • Average alpha:", round(min_max$Avg_Alpha * 100, 2), "%\n")
cat("   • Funds beating risk-free rate (", RISK_FREE_RATE*100, "%):", 
    min_max$Funds_Beat_RiskFree, "out of", nrow(merged), "\n", sep="")
cat("   • Investment-grade funds:", sum(merged$Investment_Grade, na.rm=TRUE), "\n")
cat("   • Average excess return:", 
    round(mean(merged$Excess_Return, na.rm=TRUE) * 100, 2), "% above risk-free\n")

#============================================================================
# VISUALIZATIONS
#============================================================================

# Plot 1: Recommendations by Quartile
p1 <- ggplot(merged, aes(x = Alpha_Quartile_Label, y = Alpha_annualized, 
                         color = Recommendation)) +
  geom_jitter(size = 3, alpha = 0.8, width = 0.2) +
  geom_hline(yintercept = RISK_FREE_RATE, linetype = "dashed", 
             color = "red", linewidth = 1) +
  annotate("text", x = 4, y = RISK_FREE_RATE + 0.01, 
           label = paste0("Risk-Free: ", round(RISK_FREE_RATE*100, 2), "% (Bloomberg)"), 
           color = "red", size = 3.5, fontface = "bold") +
  labs(title = "JCI Fund Selection - Performance by Quartile",
       subtitle = "AXA Mandiri Investment Analysis | Bloomberg GIND10YR 10Y Avg: 7.118%",
       x = "Performance Quartile",
       y = "Alpha (annualized)") +
  scale_color_manual(values = c(
    "STRONG BUY" = "#2ca02c",
    "BUY (verify criteria)" = "#9467bd",
    "CONSIDER" = "#ff7f0e",
    "MONITOR" = "#8c564b",
    "EXCLUDE" = "#d62728"
  )) +
  theme_minimal() +
  theme(legend.position = "bottom", 
        plot.title = element_text(face = "bold", size = 14),
        plot.subtitle = element_text(size = 10))

# Plot 2: Expense Ratio vs Alpha (Value Analysis)
p2 <- ggplot(merged %>% filter(!is.na(AUM)), 
             aes(x = Expense_Ratio, y = Alpha_annualized, 
                 color = Recommendation, size = AUM)) +
  geom_point(alpha = 0.7) +
  geom_hline(yintercept = RISK_FREE_RATE, linetype = "dashed", color = "red") +
  geom_vline(xintercept = MAX_EXPENSE_RATIO, linetype = "dashed", color = "orange") +
  annotate("text", x = MAX_EXPENSE_RATIO + 0.002, 
           y = max(merged$Alpha_annualized, na.rm=TRUE),
           label = "Max Expense", angle = 90, vjust = -0.5, size = 3) +
  labs(title = "Value Analysis: Alpha vs Expense Ratio",
       subtitle = "Bubble size = AUM (larger = more liquid)",
       x = "Expense Ratio",
       y = "Alpha (annualized)") +
  scale_color_manual(values = c(
    "STRONG BUY" = "#2ca02c",
    "BUY (verify criteria)" = "#9467bd",
    "CONSIDER" = "#ff7f0e",
    "MONITOR" = "#8c564b",
    "EXCLUDE" = "#d62728"
  )) +
  scale_size_continuous(range = c(2, 12), labels = scales::comma) +
  theme_minimal() +
  theme(legend.position = "bottom")

# Plot 3: Performance Ranking
ranked <- merged %>%
  arrange(desc(Alpha_annualized)) %>%
  mutate(Rank = row_number())

p3 <- ggplot(ranked, aes(x = Rank, y = Alpha_annualized, color = Recommendation)) +
  geom_point(size = 3, alpha = 0.8) +
  geom_hline(yintercept = RISK_FREE_RATE, color = "red", linewidth = 1) +
  annotate("rect", xmin = 0, xmax = 12.5, ymin = -Inf, ymax = Inf, 
           alpha = 0.1, fill = "green") +
  annotate("text", x = 6, y = max(ranked$Alpha_annualized, na.rm=TRUE), 
           label = "Top Quartile", size = 3.5, fontface = "bold") +
  labs(title = "Fund Performance Ranking (All 50 Funds)",
       subtitle = paste0("Green zone = Top 25% | Red line = Risk-Free (7.118%)"),
       x = "Rank (by Alpha)",
       y = "Alpha (annualized)") +
  scale_color_manual(values = c(
    "STRONG BUY" = "#2ca02c",
    "BUY (verify criteria)" = "#9467bd",
    "CONSIDER" = "#ff7f0e",
    "MONITOR" = "#8c564b",
    "EXCLUDE" = "#d62728"
  )) +
  theme_minimal() +
  theme(legend.position = "bottom")

# Save combined plot
png("AXA_Mandiri_JCI_Investment_Analysis.png", 
    width = 2100, height = 700, res = 150)
grid.arrange(p1, p2, p3, ncol = 3,
             top = grid::textGrob("AXA Mandiri - JCI Fund Selection Analysis",
                                  gp = grid::gpar(fontsize = 16, fontface = "bold")))
dev.off()

# Save individual high-res plots
png("JCI_Quartile_Analysis.png", width = 1000, height = 700, res = 150)
print(p1)
dev.off()

png("JCI_Value_Analysis.png", width = 1000, height = 700, res = 150)
print(p2)
dev.off()

png("JCI_Performance_Ranking.png", width = 1200, height = 700, res = 150)
print(p3)
dev.off()

#============================================================================
# EXPORT RESULTS
#============================================================================

# Full analysis dataset
write_csv(merged %>% arrange(desc(Alpha_annualized)), 
          "JCI_Complete_Fund_Analysis.csv")

# Strong Buy recommendations only
if (nrow(strong_buy) > 0) {
  write_csv(strong_buy, "JCI_STRONG_BUY_Recommendations.csv")
}

# Top candidates (Strong Buy + Consider)
top_candidates <- merged %>%
  filter(Recommendation %in% c("STRONG BUY", "CONSIDER", "BUY (verify criteria)")) %>%
  arrange(desc(Alpha_annualized)) %>%
  select(Fund, Alpha_annualized, Excess_Return, Beta, AUM, 
         Expense_Ratio, Age_Years, Source, Recommendation)

write_csv(top_candidates, "JCI_Top_Investment_Candidates.csv")

# Summary report
summary_report <- tibble(
  Metric = c("Total Funds Analyzed",
             "STRONG BUY Recommendations",
             "CONSIDER Tier",
             "BUY (verify criteria)",
             "Funds Beating Risk-Free Rate",
             "Investment-Grade Funds",
             "Best Alpha",
             "Worst Alpha",
             "Alpha Range",
             "Average Alpha",
             "Median Alpha",
             "Average Excess Return",
             "Risk-Free Rate (Bloomberg 10Y)",
             "Average Expense Ratio",
             "Data Source - Expense"),
  Value = c(nrow(merged),
            nrow(strong_buy),
            nrow(consider),
            nrow(verify),
            min_max$Funds_Beat_RiskFree,
            sum(merged$Investment_Grade, na.rm=TRUE),
            paste0(round(min_max$Best_Alpha * 100, 2), "%"),
            paste0(round(min_max$Worst_Alpha * 100, 2), "%"),
            paste0(round(min_max$Alpha_Range * 100, 2), " pp"),
            paste0(round(min_max$Avg_Alpha * 100, 2), "%"),
            paste0(round(min_max$Median_Alpha * 100, 2), "%"),
            paste0(round(mean(merged$Excess_Return, na.rm=TRUE) * 100, 2), "%"),
            paste0(RISK_FREE_RATE * 100, "% (GIND10YR 2015-2025)"),
            paste0(round(min_max$Avg_Expense * 100, 2), "%"),
            "Bloomberg + 2% industry avg for missing")
)

write_csv(summary_report, "JCI_Analysis_Summary_Report.csv")

#============================================================================
# FINAL OUTPUT
#============================================================================

cat("\n========================================\n")
cat("✅ ANALYSIS COMPLETE!\n")
cat("========================================\n\n")

cat("Files saved to ~/Downloads/:\n")
cat("   📊 AXA_Mandiri_JCI_Investment_Analysis.png (3-panel chart)\n")
cat("   📊 JCI_Quartile_Analysis.png\n")
cat("   📊 JCI_Value_Analysis.png\n")
cat("   📊 JCI_Performance_Ranking.png\n")
cat("   📁 JCI_Complete_Fund_Analysis.csv (all 50 funds)\n")
if (nrow(strong_buy) > 0) {
  cat("   ⭐ JCI_STRONG_BUY_Recommendations.csv (", nrow(strong_buy), " funds)\n", sep="")
}
cat("   📁 JCI_Top_Investment_Candidates.csv\n")
cat("   📁 JCI_Analysis_Summary_Report.csv\n\n")

cat("Quick Summary for Your Manager:\n")
cat("   • Analyzed:", nrow(merged), "JCI-tracking funds\n")
cat("   • STRONG BUY:", nrow(strong_buy), "funds\n")
cat("   • CONSIDER:", nrow(consider), "funds\n")
cat("   • BUY (verify):", nrow(verify), "funds\n")
cat("   • Alpha range:", round(min_max$Worst_Alpha*100, 2), "% to", 
    round(min_max$Best_Alpha*100, 2), "%\n")
cat("   • Risk-free benchmark: 7.118% (Bloomberg GIND10YR 10Y avg)\n")
cat("   • Funds beating risk-free:", min_max$Funds_Beat_RiskFree, "\n")
cat("   • Average excess return:", 
    round(mean(merged$Excess_Return, na.rm=TRUE) * 100, 2), "%\n\n")

cat("Data Notes:\n")
cat("   • Risk-Free Rate: Bloomberg GIND10YR (01/01/2015 - 11/17/2025)\n")
cat("   • Expense Ratios: Bloomberg + 2% industry avg for missing data\n")
cat("   • AUM: Bloomberg (in IDR)\n\n")

cat("Next Steps:\n")
cat("   1. Review STRONG BUY recommendations\n")
cat("   2. Open AXA_Mandiri_JCI_Investment_Analysis.png\n")
cat("   3. Check JCI_Analysis_Summary_Report.csv for key stats\n")
cat("   4. Present findings to manager\n")

cat("\n========================================\n")

# STOP RIGHT HERE - NEXT VARIATION DOWN HERE
library(tidyverse)
library(writexl)  # Install if needed: install.packages("writexl")

setwd("~/Downloads")

cat("\n========================================\n")
cat("EXPORTING PROFESSIONAL ANALYSIS REPORTS\n")
cat("========================================\n\n")

#============================================================================
# LOAD COMPLETE ANALYSIS DATA
#============================================================================

merged <- read_csv("JCI_Complete_Fund_Analysis.csv", show_col_types = FALSE)

# Analysis parameters
RISK_FREE_RATE <- 0.07118  # Bloomberg GIND10YR 10Y average

#============================================================================
# 1. EXECUTIVE SUMMARY
#============================================================================

# Calculate key statistics first
best_alpha <- max(merged$Alpha_annualized, na.rm = TRUE)
worst_alpha <- min(merged$Alpha_annualized, na.rm = TRUE)
best_fund <- merged %>% filter(Alpha_annualized == best_alpha) %>% pull(Fund) %>% first()
worst_fund <- merged %>% filter(Alpha_annualized == worst_alpha) %>% pull(Fund) %>% first()

q4_avg_alpha <- mean(merged$Alpha_annualized[merged$Alpha_Quartile == 4], na.rm = TRUE)
q4_avg_excess <- mean(merged$Excess_Return[merged$Alpha_Quartile == 4], na.rm = TRUE)
q3_avg_alpha <- mean(merged$Alpha_annualized[merged$Alpha_Quartile == 3], na.rm = TRUE)
q3_avg_excess <- mean(merged$Excess_Return[merged$Alpha_Quartile == 3], na.rm = TRUE)
q2_avg_alpha <- mean(merged$Alpha_annualized[merged$Alpha_Quartile == 2], na.rm = TRUE)
q2_avg_excess <- mean(merged$Excess_Return[merged$Alpha_Quartile == 2], na.rm = TRUE)
q1_avg_alpha <- mean(merged$Alpha_annualized[merged$Alpha_Quartile == 1], na.rm = TRUE)
q1_avg_excess <- mean(merged$Excess_Return[merged$Alpha_Quartile == 1], na.rm = TRUE)

executive_summary <- data.frame(
  Section = c(
    "RISK-FREE RATE (BLOOMBERG)",
    "Risk-Free Rate (10Y Avg)",
    "Source",
    "Period",
    "",
    "MIN/MAX ANALYSIS",
    "Maximum Alpha",
    "Minimum Alpha",
    "Alpha Range",
    "Best Excess Return",
    "Worst Excess Return",
    "Best Performing Fund",
    "Worst Performing Fund",
    "",
    "QUARTILE SUMMARY",
    "Total Funds Analyzed",
    "Q4 (Top 25%) - Count",
    "Q4 - Avg Alpha",
    "Q4 - Avg Excess Return",
    "Q3 (50-75%) - Count",
    "Q3 - Avg Alpha",
    "Q3 - Avg Excess Return",
    "Q2 (25-50%) - Count",
    "Q2 - Avg Alpha",
    "Q2 - Avg Excess Return",
    "Q1 (Bottom 25%) - Count",
    "Q1 - Avg Alpha",
    "Q1 - Avg Excess Return",
    "",
    "KEY FINDINGS",
    "Funds Beating Risk-Free Rate",
    "Investment-Grade Funds",
    "Average Alpha (All Funds)",
    "Median Alpha (All Funds)",
    "Average Expense Ratio",
    "",
    "INVESTMENT CONCLUSION",
    "Recommendation"
  ),
  Value = c(
    "",
    paste0(round(RISK_FREE_RATE * 100, 3), "%"),
    "Bloomberg GIND10YR Index",
    "01/01/2015 - 11/17/2025",
    "",
    "",
    paste0(round(best_alpha * 100, 2), "%"),
    paste0(round(worst_alpha * 100, 2), "%"),
    paste0(round((best_alpha - worst_alpha) * 100, 2), " pp"),
    paste0(round(max(merged$Excess_Return, na.rm = TRUE) * 100, 2), "%"),
    paste0(round(min(merged$Excess_Return, na.rm = TRUE) * 100, 2), "%"),
    best_fund,
    worst_fund,
    "",
    "",
    as.character(nrow(merged)),
    as.character(sum(merged$Alpha_Quartile == 4, na.rm = TRUE)),
    paste0(round(q4_avg_alpha * 100, 2), "%"),
    paste0(round(q4_avg_excess * 100, 2), "%"),
    as.character(sum(merged$Alpha_Quartile == 3, na.rm = TRUE)),
    paste0(round(q3_avg_alpha * 100, 2), "%"),
    paste0(round(q3_avg_excess * 100, 2), "%"),
    as.character(sum(merged$Alpha_Quartile == 2, na.rm = TRUE)),
    paste0(round(q2_avg_alpha * 100, 2), "%"),
    paste0(round(q2_avg_excess * 100, 2), "%"),
    as.character(sum(merged$Alpha_Quartile == 1, na.rm = TRUE)),
    paste0(round(q1_avg_alpha * 100, 2), "%"),
    paste0(round(q1_avg_excess * 100, 2), "%"),
    "",
    "",
    paste0(sum(merged$Beats_Risk_Free, na.rm = TRUE), " out of ", nrow(merged)),
    as.character(sum(merged$Investment_Grade, na.rm = TRUE)),
    paste0(round(mean(merged$Alpha_annualized, na.rm = TRUE) * 100, 2), "%"),
    paste0(round(median(merged$Alpha_annualized, na.rm = TRUE) * 100, 2), "%"),
    paste0(round(mean(merged$Expense_Ratio, na.rm = TRUE) * 100, 2), "%"),
    "",
    "",
    "Zero JCI funds beat risk-free rate; bond-heavy allocation recommended"
  ),
  stringsAsFactors = FALSE
)

#============================================================================
# 2. DETAILED QUARTILE BREAKDOWN
#============================================================================

quartile_detailed <- merged %>%
  group_by(Alpha_Quartile_Label) %>%
  summarise(
    N_Funds = n(),
    Min_Alpha_pct = paste0(round(min(Alpha_annualized, na.rm = TRUE) * 100, 2), "%"),
    Max_Alpha_pct = paste0(round(max(Alpha_annualized, na.rm = TRUE) * 100, 2), "%"),
    Avg_Alpha_pct = paste0(round(mean(Alpha_annualized, na.rm = TRUE) * 100, 2), "%"),
    Median_Alpha_pct = paste0(round(median(Alpha_annualized, na.rm = TRUE) * 100, 2), "%"),
    Avg_Excess_Return_pct = paste0(round(mean(Excess_Return, na.rm = TRUE) * 100, 2), "%"),
    Avg_Expense_Ratio_pct = paste0(round(mean(Expense_Ratio, na.rm = TRUE) * 100, 2), "%"),
    Avg_AUM_B_IDR = paste0(round(mean(AUM, na.rm = TRUE) / 1e9, 2), "B"),
    Investment_Grade_Count = sum(Investment_Grade, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  arrange(desc(Alpha_Quartile_Label))

#============================================================================
# 3. TOP 12 FUNDS (Best Available - Q4)
#============================================================================

top_12_funds <- merged %>%
  filter(Alpha_Quartile == 4) %>%
  arrange(desc(Alpha_annualized)) %>%
  mutate(
    Rank = row_number(),
    Alpha_pct = paste0(round(Alpha_annualized * 100, 2), "%"),
    Excess_Return_pct = paste0(round(Excess_Return * 100, 2), "%"),
    Beta_rounded = round(Beta, 3),
    Expense_Ratio_pct = paste0(round(Expense_Ratio * 100, 2), "%"),
    AUM_B_IDR = if_else(is.na(AUM), "N/A", paste0(round(AUM / 1e9, 2), "B")),
    Age_Yrs = if_else(is.na(Age_Years), "N/A", as.character(round(Age_Years, 1)))
  ) %>%
  select(Rank, Fund, Alpha_pct, Excess_Return_pct, Beta_rounded, 
         Expense_Ratio_pct, AUM_B_IDR, Age_Yrs, Source, Recommendation)

#============================================================================
# 4. BOTTOM 12 FUNDS (Funds to Avoid - Q1)
#============================================================================

bottom_12_funds <- merged %>%
  filter(Alpha_Quartile == 1) %>%
  arrange(Alpha_annualized) %>%
  mutate(
    Rank = row_number(),
    Alpha_pct = paste0(round(Alpha_annualized * 100, 2), "%"),
    Excess_Return_pct = paste0(round(Excess_Return * 100, 2), "%"),
    Beta_rounded = round(Beta, 3),
    Expense_Ratio_pct = paste0(round(Expense_Ratio * 100, 2), "%"),
    AUM_B_IDR = if_else(is.na(AUM), "N/A", paste0(round(AUM / 1e9, 2), "B"))
  ) %>%
  select(Rank, Fund, Alpha_pct, Excess_Return_pct, Beta_rounded, 
         Expense_Ratio_pct, AUM_B_IDR, Recommendation)

#============================================================================
# 5. MIN/MAX COMPARISON TABLE
#============================================================================

best_fund_data <- merged %>% filter(Alpha_annualized == max(Alpha_annualized, na.rm = TRUE))
worst_fund_data <- merged %>% filter(Alpha_annualized == min(Alpha_annualized, na.rm = TRUE))

min_max_comparison <- data.frame(
  Metric = c(
    "Fund Name",
    "Alpha (annualized)",
    "Excess Return vs Risk-Free",
    "Beta",
    "Expense Ratio",
    "AUM (IDR)",
    "Fund Age (years)",
    "Source Type",
    "",
    "Performance vs Risk-Free (7.118%)",
    "10-Year $100k Investment Value"
  ),
  Best_Performer = c(
    best_fund_data$Fund,
    paste0(round(best_fund_data$Alpha_annualized * 100, 2), "%"),
    paste0(round(best_fund_data$Excess_Return * 100, 2), "%"),
    as.character(round(best_fund_data$Beta, 3)),
    paste0(round(best_fund_data$Expense_Ratio * 100, 2), "%"),
    paste0(format(best_fund_data$AUM, big.mark = ",", scientific = FALSE), " IDR"),
    as.character(round(best_fund_data$Age_Years, 1)),
    best_fund_data$Source,
    "",
    paste0(round(best_fund_data$Excess_Return * 100, 2), "% below"),
    paste0("$", format(round(100000 * (1 + best_fund_data$Alpha_annualized)^10, 0), big.mark = ","))
  ),
  Worst_Performer = c(
    worst_fund_data$Fund,
    paste0(round(worst_fund_data$Alpha_annualized * 100, 2), "%"),
    paste0(round(worst_fund_data$Excess_Return * 100, 2), "%"),
    as.character(round(worst_fund_data$Beta, 3)),
    paste0(round(worst_fund_data$Expense_Ratio * 100, 2), "%"),
    paste0(format(worst_fund_data$AUM, big.mark = ",", scientific = FALSE), " IDR"),
    as.character(round(worst_fund_data$Age_Years, 1)),
    worst_fund_data$Source,
    "",
    paste0(round(worst_fund_data$Excess_Return * 100, 2), "% below"),
    paste0("$", format(round(100000 * (1 + worst_fund_data$Alpha_annualized)^10, 0), big.mark = ","))
  ),
  Risk_Free_Bond = c(
    "Indonesia 10Y Govt Bond",
    "7.118% (Bloomberg avg)",
    "0.00% (benchmark)",
    "0.000 (risk-free)",
    "0.00%",
    "N/A",
    "N/A",
    "Government",
    "",
    "0.00% (benchmark)",
    paste0("$", format(round(100000 * (1 + 0.07118)^10, 0), big.mark = ","))
  ),
  stringsAsFactors = FALSE
)

#============================================================================
# 6. INVESTMENT SCENARIOS (10-Year Projections)
#============================================================================

investment_scenarios <- data.frame(
  Scenario = c(
    "Indonesia Government Bonds (Risk-Free)",
    "Top Quartile Average (Q4)",
    "Best Single Fund (SUCOREQ)",
    "Second Best Fund (TRMGHBB)",
    "Average JCI Fund (All 50)",
    "Median JCI Fund",
    "Bottom Quartile Average (Q1)",
    "Worst Single Fund (LIPEQPL)"
  ),
  Annual_Return = c(
    paste0(round(RISK_FREE_RATE * 100, 2), "%"),
    paste0(round(q4_avg_alpha * 100, 2), "%"),
    paste0(round(best_alpha * 100, 2), "%"),
    paste0(round(merged$Alpha_annualized[merged$Fund == "TRMGHBB_IJ_Equity"] * 100, 2), "%"),
    paste0(round(mean(merged$Alpha_annualized, na.rm = TRUE) * 100, 2), "%"),
    paste0(round(median(merged$Alpha_annualized, na.rm = TRUE) * 100, 2), "%"),
    paste0(round(q1_avg_alpha * 100, 2), "%"),
    paste0(round(worst_alpha * 100, 2), "%")
  ),
  Initial_100k = rep("$100,000", 8),
  Value_After_10Y = c(
    paste0("$", format(round(100000 * (1 + RISK_FREE_RATE)^10, 0), big.mark = ",")),
    paste0("$", format(round(100000 * (1 + q4_avg_alpha)^10, 0), big.mark = ",")),
    paste0("$", format(round(100000 * (1 + best_alpha)^10, 0), big.mark = ",")),
    paste0("$", format(round(100000 * (1 + merged$Alpha_annualized[merged$Fund == "TRMGHBB_IJ_Equity"])^10, 0), big.mark = ",")),
    paste0("$", format(round(100000 * (1 + mean(merged$Alpha_annualized, na.rm = TRUE))^10, 0), big.mark = ",")),
    paste0("$", format(round(100000 * (1 + median(merged$Alpha_annualized, na.rm = TRUE))^10, 0), big.mark = ",")),
    paste0("$", format(round(100000 * (1 + q1_avg_alpha)^10, 0), big.mark = ",")),
    paste0("$", format(round(100000 * (1 + worst_alpha)^10, 0), big.mark = ","))
  ),
  Gain_Loss = c(
    paste0("$", format(round(100000 * ((1 + RISK_FREE_RATE)^10 - 1), 0), big.mark = ",")),
    paste0("$", format(round(100000 * ((1 + q4_avg_alpha)^10 - 1), 0), big.mark = ",")),
    paste0("$", format(round(100000 * ((1 + best_alpha)^10 - 1), 0), big.mark = ",")),
    paste0("$", format(round(100000 * ((1 + merged$Alpha_annualized[merged$Fund == "TRMGHBB_IJ_Equity"])^10 - 1), 0), big.mark = ",")),
    paste0("$", format(round(100000 * ((1 + mean(merged$Alpha_annualized, na.rm = TRUE))^10 - 1), 0), big.mark = ",")),
    paste0("$", format(round(100000 * ((1 + median(merged$Alpha_annualized, na.rm = TRUE))^10 - 1), 0), big.mark = ",")),
    paste0("$", format(round(100000 * ((1 + q1_avg_alpha)^10 - 1), 0), big.mark = ",")),
    paste0("$", format(round(100000 * ((1 + worst_alpha)^10 - 1), 0), big.mark = ","))
  ),
  vs_Risk_Free = c(
    "$0 (benchmark)",
    paste0("-$", format(abs(round(100000 * ((1 + RISK_FREE_RATE)^10 - (1 + q4_avg_alpha)^10), 0)), big.mark = ",")),
    paste0("-$", format(abs(round(100000 * ((1 + RISK_FREE_RATE)^10 - (1 + best_alpha)^10), 0)), big.mark = ",")),
    paste0("-$", format(abs(round(100000 * ((1 + RISK_FREE_RATE)^10 - (1 + merged$Alpha_annualized[merged$Fund == "TRMGHBB_IJ_Equity"])^10), 0)), big.mark = ",")),
    paste0("-$", format(abs(round(100000 * ((1 + RISK_FREE_RATE)^10 - (1 + mean(merged$Alpha_annualized, na.rm = TRUE))^10), 0)), big.mark = ",")),
    paste0("-$", format(abs(round(100000 * ((1 + RISK_FREE_RATE)^10 - (1 + median(merged$Alpha_annualized, na.rm = TRUE))^10), 0)), big.mark = ",")),
    paste0("-$", format(abs(round(100000 * ((1 + RISK_FREE_RATE)^10 - (1 + q1_avg_alpha)^10), 0)), big.mark = ",")),
    paste0("-$", format(abs(round(100000 * ((1 + RISK_FREE_RATE)^10 - (1 + worst_alpha)^10), 0)), big.mark = ","))
  ),
  stringsAsFactors = FALSE
)

#============================================================================
# 7. COMPLETE FUND RANKING (All 50)
#============================================================================

complete_ranking <- merged %>%
  arrange(desc(Alpha_annualized)) %>%
  mutate(
    Overall_Rank = row_number(),
    Alpha_pct = paste0(round(Alpha_annualized * 100, 2), "%"),
    Excess_Return_pct = paste0(round(Excess_Return * 100, 2), "%"),
    Beta_rounded = round(Beta, 3),
    Expense_Ratio_pct = paste0(round(Expense_Ratio * 100, 2), "%"),
    AUM_B_IDR = if_else(is.na(AUM), "N/A", paste0(round(AUM / 1e9, 2), "B")),
    Age_Yrs = if_else(is.na(Age_Years), "N/A", as.character(round(Age_Years, 1)))
  ) %>%
  select(Overall_Rank, Fund, Alpha_Quartile_Label, Alpha_pct, Excess_Return_pct, 
         Beta_rounded, Expense_Ratio_pct, AUM_B_IDR, Age_Yrs, Source, 
         Recommendation)

#============================================================================
# EXPORT ALL REPORTS
#============================================================================

cat("Exporting reports...\n")

# Export to Excel (all sheets in one file)
excel_sheets <- list(
  "Executive Summary" = executive_summary,
  "Quartile Breakdown" = quartile_detailed,
  "Min-Max Comparison" = min_max_comparison,
  "Top 12 Funds (Q4)" = top_12_funds,
  "Bottom 12 Funds (Q1)" = bottom_12_funds,
  "Investment Scenarios" = investment_scenarios,
  "Complete Ranking (All 50)" = complete_ranking
)

write_xlsx(excel_sheets, "AXA_Mandiri_JCI_Investment_Analysis_Report.xlsx")

# Also export individual CSVs
write_csv(executive_summary, "1_Executive_Summary.csv")
write_csv(quartile_detailed, "2_Quartile_Breakdown.csv")
write_csv(min_max_comparison, "3_MinMax_Comparison.csv")
write_csv(top_12_funds, "4_Top12_Funds_Q4.csv")
write_csv(bottom_12_funds, "5_Bottom12_Funds_Q1.csv")
write_csv(investment_scenarios, "6_Investment_Scenarios.csv")
write_csv(complete_ranking, "7_Complete_Ranking_All50.csv")

cat("\n========================================\n")
cat("✅ ANALYSIS REPORTS EXPORTED!\n")
cat("========================================\n\n")

cat("📁 MAIN DELIVERABLE (All-in-One Excel File):\n")
cat("   ⭐ AXA_Mandiri_JCI_Investment_Analysis_Report.xlsx\n")
cat("      (7 sheets: Executive Summary, Quartiles, Min/Max, Top 12, Bottom 12, Scenarios, Rankings)\n\n")

cat("📊 INDIVIDUAL CSV FILES:\n")
cat("   1️⃣  1_Executive_Summary.csv\n")
cat("   2️⃣  2_Quartile_Breakdown.csv\n")
cat("   3️⃣  3_MinMax_Comparison.csv\n")
cat("   4️⃣  4_Top12_Funds_Q4.csv\n")
cat("   5️⃣  5_Bottom12_Funds_Q1.csv\n")
cat("   6️⃣  6_Investment_Scenarios.csv\n")
cat("   7️⃣  7_Complete_Ranking_All50.csv\n\n")

cat("📈 REPORT CONTENTS:\n\n")

cat("1. EXECUTIVE SUMMARY:\n")
cat("   ✅ Risk-Free Rate (Bloomberg 7.118%)\n")
cat("   ✅ Min/Max Analysis\n")
cat("   ✅ Quartile Summary (Q1-Q4)\n")
cat("   ✅ Key Findings\n")
cat("   ✅ Investment Conclusion\n\n")

cat("2. QUARTILE BREAKDOWN:\n")
cat("   ✅ 4 quartiles with detailed statistics\n")
cat("   ✅ Min/max alpha per quartile\n")
cat("   ✅ Average excess returns\n")
cat("   ✅ Investment-grade count\n\n")

cat("3. MIN/MAX COMPARISON:\n")
cat("   ✅ Best vs Worst vs Risk-Free side-by-side\n")
cat("   ✅ 10-year investment projections\n")
cat("   ✅ Performance gaps highlighted\n\n")

cat("4. TOP 12 FUNDS (Q4):\n")
cat("   ✅ Best performers ranked\n")
cat("   ✅ Full metrics for each fund\n")
cat("   ✅ Recommendation status\n\n")

cat("5. BOTTOM 12 FUNDS (Q1):\n")
cat("   ✅ Worst performers to avoid\n")
cat("   ✅ Shows underperformance magnitude\n\n")

cat("6. INVESTMENT SCENARIOS:\n")
cat("   ✅ $100k invested over 10 years\n")
cat("   ✅ 8 different scenarios compared\n")
cat("   ✅ Shows opportunity cost vs bonds\n\n")

cat("7. COMPLETE RANKING:\n")
cat("   ✅ All 50 funds ranked by alpha\n")
cat("   ✅ Quartile assignments\n")
cat("   ✅ Full performance data\n\n")

cat("========================================\n")
cat("ANALYSIS SUMMARY:\n")
cat("========================================\n\n")

cat("📊 Analysis Framework:\n")
cat("   ✅ Min/Max: -2.51% to 6.34% (8.85pp range)\n")
cat("   ✅ Quartiles: Q1-Q4 breakdown complete\n")
cat("   ✅ Risk-Free: 7.118% (Bloomberg GIND10YR)\n\n")

cat("🎯 Key Finding:\n")
cat("   0 out of 50 funds beat risk-free rate\n")
cat("   Average excess return: -5.4%\n")
cat("   Recommendation: Bond-heavy allocation\n\n")

cat("📧 DELIVERABLES:\n")
cat("   Primary: AXA_Mandiri_JCI_Investment_Analysis_Report.xlsx\n")
cat("   Supporting: AXA_Mandiri_JCI_Investment_Analysis.png\n\n")

cat("✅ All files saved to ~/Downloads/\n")
cat("========================================\n")