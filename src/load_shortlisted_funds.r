# Load shortlisted funds data
# This script loads and analyzes the top alpha-ranked JCI funds

library(tidyverse)

# Load the complete ranking of all 50 funds
complete_ranking <- read_csv("../data/7_Complete_Ranking_All50.csv")

# Load the top 12 funds (Q4 quartile - BUY recommendations)
top_12_funds <- read_csv("../data/4_Top12_Funds_Q4.csv")

# Load the top alpha funds (top 10)
top_alpha_funds <- read_csv("../data/top_alpha_funds_JCI.csv")

# Load top investment candidates
investment_candidates <- read_csv("../data/JCI_Top_Investment_Candidates.csv")

# Filter only BUY recommendations from complete ranking
shortlisted_funds <- complete_ranking %>%
  filter(Recommendation == "BUY (verify criteria)") %>%
  arrange(desc(Alpha_pct))

# Display summary
cat("Total funds analyzed:", nrow(complete_ranking), "\n")
cat("Shortlisted funds (BUY):", nrow(shortlisted_funds), "\n\n")

# Show top 12 shortlisted funds
cat("=== TOP 12 SHORTLISTED FUNDS ===\n")
print(shortlisted_funds %>%
  select(Rank, Fund, Alpha_pct, Beta_rounded, Expense_Ratio_pct, Age_Yrs, Source))

# Summary statistics for shortlisted funds
cat("\n=== SHORTLIST SUMMARY STATISTICS ===\n")
shortlisted_funds %>%
  summarise(
    mean_alpha = mean(parse_number(Alpha_pct)),
    median_alpha = median(parse_number(Alpha_pct)),
    mean_beta = mean(Beta_rounded),
    mean_age = mean(Age_Yrs)
  ) %>%
  print()

# Export shortlisted funds to project directory
write_csv(shortlisted_funds, "../data/shortlisted_funds.csv")

cat("\nShortlisted funds exported to: ../data/shortlisted_funds.csv\n")
