import type { CongressTrade } from "../types";

// Deterministic stub — 60 congressional trades over the past 90 days
// across House + Senate. Schema matches Quiver Quantitative exactly so
// the live-API swap is a one-line provider switch.
// Amount buckets per STOCK Act:
//   $1,001 – $15,000  ·  $15,001 – $50,000  ·  $50,001 – $100,000
//   $100,001 – $250,000  ·  $250,001 – $500,000  ·  $500,001 – $1M
//   $1M – $5M  ·  $5M – $25M  ·  $25M – $50M  ·  >$50M

export const CONGRESS_STUB: CongressTrade[] = [
  { id: "c01", politician: "Nancy Pelosi",       party: "D", chamber: "House",  state: "CA", ticker: "NVDA",  transactionType: "Buy",  tradeDate: "2026-04-22", filingDate: "2026-05-09", amountMin:  1000000, amountMax: 5000000, filingLagDays: 17 },
  { id: "c02", politician: "Nancy Pelosi",       party: "D", chamber: "House",  state: "CA", ticker: "GOOGL", transactionType: "Buy",  tradeDate: "2026-04-22", filingDate: "2026-05-09", amountMin:   500000, amountMax: 1000000, filingLagDays: 17 },
  { id: "c03", politician: "Nancy Pelosi",       party: "D", chamber: "House",  state: "CA", ticker: "PANW",  transactionType: "Buy",  tradeDate: "2026-05-08", filingDate: "2026-05-18", amountMin:   250000, amountMax:  500000, filingLagDays: 10 },
  { id: "c04", politician: "Nancy Pelosi",       party: "D", chamber: "House",  state: "CA", ticker: "AMZN",  transactionType: "Sale", tradeDate: "2026-03-12", filingDate: "2026-04-04", amountMin:  1000000, amountMax: 5000000, filingLagDays: 23 },
  { id: "c05", politician: "Tommy Tuberville",   party: "R", chamber: "Senate", state: "AL", ticker: "LMT",   transactionType: "Buy",  tradeDate: "2026-05-12", filingDate: "2026-05-22", amountMin:    50000, amountMax:  100000, filingLagDays: 10 },
  { id: "c06", politician: "Tommy Tuberville",   party: "R", chamber: "Senate", state: "AL", ticker: "RTX",   transactionType: "Buy",  tradeDate: "2026-05-12", filingDate: "2026-05-22", amountMin:    50000, amountMax:  100000, filingLagDays: 10 },
  { id: "c07", politician: "Tommy Tuberville",   party: "R", chamber: "Senate", state: "AL", ticker: "NOC",   transactionType: "Buy",  tradeDate: "2026-04-30", filingDate: "2026-05-14", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c08", politician: "Dan Crenshaw",       party: "R", chamber: "House",  state: "TX", ticker: "XOM",   transactionType: "Buy",  tradeDate: "2026-05-06", filingDate: "2026-05-18", amountMin:    15001, amountMax:   50000, filingLagDays: 12 },
  { id: "c09", politician: "Dan Crenshaw",       party: "R", chamber: "House",  state: "TX", ticker: "CVX",   transactionType: "Buy",  tradeDate: "2026-05-06", filingDate: "2026-05-18", amountMin:    15001, amountMax:   50000, filingLagDays: 12 },
  { id: "c10", politician: "Daniel Goldman",     party: "D", chamber: "House",  state: "NY", ticker: "AAPL",  transactionType: "Buy",  tradeDate: "2026-05-03", filingDate: "2026-05-15", amountMin:   100000, amountMax:  250000, filingLagDays: 12 },
  { id: "c11", politician: "Daniel Goldman",     party: "D", chamber: "House",  state: "NY", ticker: "MSFT",  transactionType: "Buy",  tradeDate: "2026-05-03", filingDate: "2026-05-15", amountMin:   100000, amountMax:  250000, filingLagDays: 12 },
  { id: "c12", politician: "Daniel Goldman",     party: "D", chamber: "House",  state: "NY", ticker: "META",  transactionType: "Buy",  tradeDate: "2026-04-15", filingDate: "2026-04-29", amountMin:    50000, amountMax:  100000, filingLagDays: 14 },
  { id: "c13", politician: "Susie Lee",          party: "D", chamber: "House",  state: "NV", ticker: "WYNN",  transactionType: "Buy",  tradeDate: "2026-05-09", filingDate: "2026-05-20", amountMin:    15001, amountMax:   50000, filingLagDays: 11 },
  { id: "c14", politician: "Jared Moskowitz",    party: "D", chamber: "House",  state: "FL", ticker: "GD",    transactionType: "Buy",  tradeDate: "2026-05-14", filingDate: "2026-05-24", amountMin:    15001, amountMax:   50000, filingLagDays: 10 },
  { id: "c15", politician: "Jared Moskowitz",    party: "D", chamber: "House",  state: "FL", ticker: "LMT",   transactionType: "Buy",  tradeDate: "2026-05-14", filingDate: "2026-05-24", amountMin:    50000, amountMax:  100000, filingLagDays: 10 },
  { id: "c16", politician: "Ro Khanna",          party: "D", chamber: "House",  state: "CA", ticker: "MSFT",  transactionType: "Buy",  tradeDate: "2026-05-01", filingDate: "2026-05-11", amountMin:    15001, amountMax:   50000, filingLagDays: 10 },
  { id: "c17", politician: "Ro Khanna",          party: "D", chamber: "House",  state: "CA", ticker: "GOOGL", transactionType: "Buy",  tradeDate: "2026-05-01", filingDate: "2026-05-11", amountMin:    15001, amountMax:   50000, filingLagDays: 10 },
  { id: "c18", politician: "Mark Green",         party: "R", chamber: "House",  state: "TN", ticker: "PFE",   transactionType: "Buy",  tradeDate: "2026-04-28", filingDate: "2026-05-12", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c19", politician: "Mark Green",         party: "R", chamber: "House",  state: "TN", ticker: "MRK",   transactionType: "Buy",  tradeDate: "2026-04-28", filingDate: "2026-05-12", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c20", politician: "Markwayne Mullin",   party: "R", chamber: "Senate", state: "OK", ticker: "XOM",   transactionType: "Buy",  tradeDate: "2026-05-10", filingDate: "2026-05-20", amountMin:   100000, amountMax:  250000, filingLagDays: 10 },
  { id: "c21", politician: "Markwayne Mullin",   party: "R", chamber: "Senate", state: "OK", ticker: "OXY",   transactionType: "Buy",  tradeDate: "2026-05-10", filingDate: "2026-05-20", amountMin:    50000, amountMax:  100000, filingLagDays: 10 },
  { id: "c22", politician: "Lauren Boebert",     party: "R", chamber: "House",  state: "CO", ticker: "TSLA",  transactionType: "Buy",  tradeDate: "2026-04-18", filingDate: "2026-05-02", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c23", politician: "MTG",                party: "R", chamber: "House",  state: "GA", ticker: "TSLA",  transactionType: "Buy",  tradeDate: "2026-04-20", filingDate: "2026-05-05", amountMin:    15001, amountMax:   50000, filingLagDays: 15 },
  { id: "c24", politician: "MTG",                party: "R", chamber: "House",  state: "GA", ticker: "NVDA",  transactionType: "Buy",  tradeDate: "2026-04-20", filingDate: "2026-05-05", amountMin:    15001, amountMax:   50000, filingLagDays: 15 },
  { id: "c25", politician: "Josh Gottheimer",    party: "D", chamber: "House",  state: "NJ", ticker: "JPM",   transactionType: "Buy",  tradeDate: "2026-05-07", filingDate: "2026-05-17", amountMin:    50000, amountMax:  100000, filingLagDays: 10 },
  { id: "c26", politician: "Josh Gottheimer",    party: "D", chamber: "House",  state: "NJ", ticker: "GS",    transactionType: "Buy",  tradeDate: "2026-05-07", filingDate: "2026-05-17", amountMin:    50000, amountMax:  100000, filingLagDays: 10 },
  { id: "c27", politician: "Tim Sheehy",         party: "R", chamber: "Senate", state: "MT", ticker: "BA",    transactionType: "Buy",  tradeDate: "2026-04-25", filingDate: "2026-05-09", amountMin:   250000, amountMax:  500000, filingLagDays: 14 },
  { id: "c28", politician: "Tim Sheehy",         party: "R", chamber: "Senate", state: "MT", ticker: "LMT",   transactionType: "Buy",  tradeDate: "2026-04-25", filingDate: "2026-05-09", amountMin:    50000, amountMax:  100000, filingLagDays: 14 },
  { id: "c29", politician: "Roger Marshall",     party: "R", chamber: "Senate", state: "KS", ticker: "UNH",   transactionType: "Buy",  tradeDate: "2026-04-12", filingDate: "2026-04-26", amountMin:    50000, amountMax:  100000, filingLagDays: 14 },
  { id: "c30", politician: "Roger Marshall",     party: "R", chamber: "Senate", state: "KS", ticker: "LLY",   transactionType: "Buy",  tradeDate: "2026-04-12", filingDate: "2026-04-26", amountMin:   100000, amountMax:  250000, filingLagDays: 14 },
  { id: "c31", politician: "Sheldon Whitehouse", party: "D", chamber: "Senate", state: "RI", ticker: "BAC",   transactionType: "Buy",  tradeDate: "2026-05-05", filingDate: "2026-05-19", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c32", politician: "Shelley Capito",     party: "R", chamber: "Senate", state: "WV", ticker: "XOM",   transactionType: "Buy",  tradeDate: "2026-05-09", filingDate: "2026-05-19", amountMin:    15001, amountMax:   50000, filingLagDays: 10 },
  { id: "c33", politician: "Rick Scott",         party: "R", chamber: "Senate", state: "FL", ticker: "WMT",   transactionType: "Buy",  tradeDate: "2026-04-17", filingDate: "2026-05-01", amountMin:   100000, amountMax:  250000, filingLagDays: 14 },
  { id: "c34", politician: "Rick Scott",         party: "R", chamber: "Senate", state: "FL", ticker: "COST",  transactionType: "Buy",  tradeDate: "2026-04-17", filingDate: "2026-05-01", amountMin:    50000, amountMax:  100000, filingLagDays: 14 },
  { id: "c35", politician: "Diana DeGette",      party: "D", chamber: "House",  state: "CO", ticker: "VRTX",  transactionType: "Buy",  tradeDate: "2026-04-30", filingDate: "2026-05-13", amountMin:    15001, amountMax:   50000, filingLagDays: 13 },
  { id: "c36", politician: "Sherrod Brown",      party: "D", chamber: "Senate", state: "OH", ticker: "C",     transactionType: "Buy",  tradeDate: "2026-04-22", filingDate: "2026-05-06", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  // Older trades within the 90-day window
  { id: "c37", politician: "Nancy Pelosi",       party: "D", chamber: "House",  state: "CA", ticker: "AVGO",  transactionType: "Buy",  tradeDate: "2026-03-08", filingDate: "2026-03-22", amountMin:  1000000, amountMax: 5000000, filingLagDays: 14 },
  { id: "c38", politician: "Tommy Tuberville",   party: "R", chamber: "Senate", state: "AL", ticker: "AMD",   transactionType: "Buy",  tradeDate: "2026-03-10", filingDate: "2026-03-25", amountMin:    50000, amountMax:  100000, filingLagDays: 15 },
  { id: "c39", politician: "Daniel Goldman",     party: "D", chamber: "House",  state: "NY", ticker: "NVDA",  transactionType: "Buy",  tradeDate: "2026-03-15", filingDate: "2026-04-01", amountMin:   250000, amountMax:  500000, filingLagDays: 17 },
  { id: "c40", politician: "Tim Sheehy",         party: "R", chamber: "Senate", state: "MT", ticker: "NOC",   transactionType: "Buy",  tradeDate: "2026-03-18", filingDate: "2026-04-02", amountMin:    50000, amountMax:  100000, filingLagDays: 15 },
  { id: "c41", politician: "Markwayne Mullin",   party: "R", chamber: "Senate", state: "OK", ticker: "MRO",   transactionType: "Buy",  tradeDate: "2026-03-20", filingDate: "2026-04-05", amountMin:    50000, amountMax:  100000, filingLagDays: 16 },
  { id: "c42", politician: "Diana DeGette",      party: "D", chamber: "House",  state: "CO", ticker: "REGN",  transactionType: "Buy",  tradeDate: "2026-03-25", filingDate: "2026-04-09", amountMin:    15001, amountMax:   50000, filingLagDays: 15 },
  { id: "c43", politician: "Mark Green",         party: "R", chamber: "House",  state: "TN", ticker: "JNJ",   transactionType: "Buy",  tradeDate: "2026-03-22", filingDate: "2026-04-07", amountMin:    15001, amountMax:   50000, filingLagDays: 16 },
  { id: "c44", politician: "Sheldon Whitehouse", party: "D", chamber: "Senate", state: "RI", ticker: "JPM",   transactionType: "Buy",  tradeDate: "2026-03-12", filingDate: "2026-03-26", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c45", politician: "Ro Khanna",          party: "D", chamber: "House",  state: "CA", ticker: "AAPL",  transactionType: "Buy",  tradeDate: "2026-03-04", filingDate: "2026-03-18", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c46", politician: "Josh Gottheimer",    party: "D", chamber: "House",  state: "NJ", ticker: "MS",    transactionType: "Buy",  tradeDate: "2026-03-15", filingDate: "2026-03-30", amountMin:    50000, amountMax:  100000, filingLagDays: 15 },
  { id: "c47", politician: "Susie Lee",          party: "D", chamber: "House",  state: "NV", ticker: "MGM",   transactionType: "Buy",  tradeDate: "2026-03-08", filingDate: "2026-03-22", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c48", politician: "Lauren Boebert",     party: "R", chamber: "House",  state: "CO", ticker: "PLTR",  transactionType: "Buy",  tradeDate: "2026-03-22", filingDate: "2026-04-05", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c49", politician: "Pat Toomey (former)",party: "R", chamber: "Senate", state: "PA", ticker: "MSFT",  transactionType: "Sale", tradeDate: "2026-03-04", filingDate: "2026-03-18", amountMin:   100000, amountMax:  250000, filingLagDays: 14 },
  { id: "c50", politician: "Tommy Tuberville",   party: "R", chamber: "Senate", state: "AL", ticker: "ETN",   transactionType: "Buy",  tradeDate: "2026-04-10", filingDate: "2026-04-24", amountMin:    50000, amountMax:  100000, filingLagDays: 14 },
  { id: "c51", politician: "Rick Scott",         party: "R", chamber: "Senate", state: "FL", ticker: "MA",    transactionType: "Buy",  tradeDate: "2026-04-12", filingDate: "2026-04-26", amountMin:    50000, amountMax:  100000, filingLagDays: 14 },
  { id: "c52", politician: "MTG",                party: "R", chamber: "House",  state: "GA", ticker: "PLTR",  transactionType: "Buy",  tradeDate: "2026-03-27", filingDate: "2026-04-11", amountMin:    50000, amountMax:  100000, filingLagDays: 15 },
  { id: "c53", politician: "Dan Crenshaw",       party: "R", chamber: "House",  state: "TX", ticker: "OXY",   transactionType: "Buy",  tradeDate: "2026-04-02", filingDate: "2026-04-16", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c54", politician: "Sherrod Brown",      party: "D", chamber: "Senate", state: "OH", ticker: "F",     transactionType: "Buy",  tradeDate: "2026-04-05", filingDate: "2026-04-19", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c55", politician: "Mark Green",         party: "R", chamber: "House",  state: "TN", ticker: "ABBV",  transactionType: "Buy",  tradeDate: "2026-04-14", filingDate: "2026-04-28", amountMin:    50000, amountMax:  100000, filingLagDays: 14 },
  { id: "c56", politician: "Ro Khanna",          party: "D", chamber: "House",  state: "CA", ticker: "AMD",   transactionType: "Buy",  tradeDate: "2026-04-08", filingDate: "2026-04-22", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c57", politician: "Nancy Pelosi",       party: "D", chamber: "House",  state: "CA", ticker: "VST",   transactionType: "Buy",  tradeDate: "2026-04-05", filingDate: "2026-04-19", amountMin:   500000, amountMax: 1000000, filingLagDays: 14 },
  { id: "c58", politician: "Tim Sheehy",         party: "R", chamber: "Senate", state: "MT", ticker: "RTX",   transactionType: "Buy",  tradeDate: "2026-04-12", filingDate: "2026-04-26", amountMin:   100000, amountMax:  250000, filingLagDays: 14 },
  { id: "c59", politician: "Shelley Capito",     party: "R", chamber: "Senate", state: "WV", ticker: "CVX",   transactionType: "Buy",  tradeDate: "2026-04-18", filingDate: "2026-05-02", amountMin:    15001, amountMax:   50000, filingLagDays: 14 },
  { id: "c60", politician: "Roger Marshall",     party: "R", chamber: "Senate", state: "KS", ticker: "ABBV",  transactionType: "Buy",  tradeDate: "2026-04-22", filingDate: "2026-05-06", amountMin:    50000, amountMax:  100000, filingLagDays: 14 },
];

// Politician 12M return table (computed offline from disclosed
// trades; treated as a static leaderboard for the stub. Real impl
// recomputes per the hold-until-next-inverse-trade methodology.)
export const POLITICIAN_LEADERBOARD: Array<{
  politician: string;
  party: "R" | "D" | "I";
  chamber: "House" | "Senate";
  trades12m: number;
  winRate: number;
  est12mReturn: number;
}> = [
  { politician: "Nancy Pelosi",       party: "D", chamber: "House",  trades12m: 24, winRate: 0.79, est12mReturn:  38.4 },
  { politician: "Daniel Goldman",     party: "D", chamber: "House",  trades12m: 32, winRate: 0.72, est12mReturn:  28.2 },
  { politician: "Tim Sheehy",         party: "R", chamber: "Senate", trades12m: 18, winRate: 0.68, est12mReturn:  24.8 },
  { politician: "Markwayne Mullin",   party: "R", chamber: "Senate", trades12m: 21, winRate: 0.62, est12mReturn:  22.4 },
  { politician: "Susie Lee",          party: "D", chamber: "House",  trades12m: 14, winRate: 0.65, est12mReturn:  18.4 },
  { politician: "Ro Khanna",          party: "D", chamber: "House",  trades12m: 28, winRate: 0.61, est12mReturn:  16.8 },
  { politician: "Tommy Tuberville",   party: "R", chamber: "Senate", trades12m: 42, winRate: 0.58, est12mReturn:  14.2 },
  { politician: "Josh Gottheimer",    party: "D", chamber: "House",  trades12m: 19, winRate: 0.58, est12mReturn:  12.4 },
  { politician: "Diana DeGette",      party: "D", chamber: "House",  trades12m: 11, winRate: 0.64, est12mReturn:  11.2 },
  { politician: "Jared Moskowitz",    party: "D", chamber: "House",  trades12m: 12, winRate: 0.58, est12mReturn:   8.4 },
];
