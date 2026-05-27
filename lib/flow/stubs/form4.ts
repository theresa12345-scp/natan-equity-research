import type { Form4Txn } from "../types";

// Deterministic Form 4 stub — 50 transactions across major US tickers,
// last 60 days. Mix of open-market P-code buys (highest signal),
// S sales, A grants, M derivative exercises, and a few 10b5-1
// flagged sales. The cluster detection uses ONLY P-code, non-10b5-1.

export const FORM4_STUB: Form4Txn[] = [
  // ─── NVDA cluster (5 distinct buyers, last 30d) ─── highest-signal
  { id: "f01", ticker: "NVDA", issuerCik: "1045810", insiderName: "Jensen Huang",   insiderTitle: "CEO & President",     transactionDate: "2026-05-12", filingDate: "2026-05-14", txnCode: "P", shares:  10000, pricePerShare: 162.40, valueUsd:  1_624_000, postTxnShares: 858_492_140, is10b51: false },
  { id: "f02", ticker: "NVDA", issuerCik: "1045810", insiderName: "Colette Kress",  insiderTitle: "EVP & CFO",            transactionDate: "2026-05-08", filingDate: "2026-05-10", txnCode: "P", shares:   5000, pricePerShare: 161.80, valueUsd:    809_000, postTxnShares:   1_482_318, is10b51: false },
  { id: "f03", ticker: "NVDA", issuerCik: "1045810", insiderName: "Dawn Hudson",    insiderTitle: "Director",             transactionDate: "2026-05-05", filingDate: "2026-05-07", txnCode: "P", shares:   2500, pricePerShare: 162.20, valueUsd:    405_500, postTxnShares:      48_204, is10b51: false },
  { id: "f04", ticker: "NVDA", issuerCik: "1045810", insiderName: "Tench Coxe",     insiderTitle: "Director",             transactionDate: "2026-04-30", filingDate: "2026-05-02", txnCode: "P", shares:   1500, pricePerShare: 161.40, valueUsd:    242_100, postTxnShares:      94_815, is10b51: false },
  { id: "f05", ticker: "NVDA", issuerCik: "1045810", insiderName: "Mark Stevens",   insiderTitle: "Director",             transactionDate: "2026-04-26", filingDate: "2026-04-28", txnCode: "P", shares:   2000, pricePerShare: 160.20, valueUsd:    320_400, postTxnShares:      62_142, is10b51: false },

  // ─── PANW cluster (3 distinct buyers) ─── second-tier signal
  { id: "f06", ticker: "PANW", issuerCik: "1327567", insiderName: "Nikesh Arora",   insiderTitle: "CEO",                  transactionDate: "2026-05-10", filingDate: "2026-05-12", txnCode: "P", shares:   3000, pricePerShare: 388.40, valueUsd:  1_165_200, postTxnShares:   2_184_320, is10b51: false },
  { id: "f07", ticker: "PANW", issuerCik: "1327567", insiderName: "Lee Klarich",    insiderTitle: "Chief Product Officer", transactionDate: "2026-05-06", filingDate: "2026-05-08", txnCode: "P", shares:   1500, pricePerShare: 386.20, valueUsd:    579_300, postTxnShares:     412_184, is10b51: false },
  { id: "f08", ticker: "PANW", issuerCik: "1327567", insiderName: "Asheem Chandna", insiderTitle: "Director",             transactionDate: "2026-04-28", filingDate: "2026-04-30", txnCode: "P", shares:   1200, pricePerShare: 384.80, valueUsd:    461_760, postTxnShares:      28_410, is10b51: false },

  // ─── META cluster (3 distinct buyers) ───
  { id: "f09", ticker: "META", issuerCik: "1326801", insiderName: "Susan Li",       insiderTitle: "CFO",                  transactionDate: "2026-05-08", filingDate: "2026-05-12", txnCode: "P", shares:    800, pricePerShare: 624.20, valueUsd:    499_360, postTxnShares:     142_318, is10b51: false },
  { id: "f10", ticker: "META", issuerCik: "1326801", insiderName: "Peggy Alford",   insiderTitle: "Director",             transactionDate: "2026-05-02", filingDate: "2026-05-06", txnCode: "P", shares:    500, pricePerShare: 622.80, valueUsd:    311_400, postTxnShares:      18_204, is10b51: false },
  { id: "f11", ticker: "META", issuerCik: "1326801", insiderName: "John Arnold",    insiderTitle: "Director",             transactionDate: "2026-04-22", filingDate: "2026-04-24", txnCode: "P", shares:    400, pricePerShare: 618.40, valueUsd:    247_360, postTxnShares:      32_184, is10b51: false },

  // ─── AAPL — Tim Cook 10b5-1 sale (excluded from cluster math) ───
  { id: "f12", ticker: "AAPL", issuerCik: "0320193", insiderName: "Tim Cook",       insiderTitle: "CEO",                  transactionDate: "2026-05-09", filingDate: "2026-05-13", txnCode: "S", shares: 250000, pricePerShare: 198.20, valueUsd: 49_550_000, postTxnShares:   3_280_184, is10b51: true  },
  { id: "f13", ticker: "AAPL", issuerCik: "0320193", insiderName: "Luca Maestri",   insiderTitle: "Senior VP & CFO",      transactionDate: "2026-04-22", filingDate: "2026-04-24", txnCode: "S", shares:  50000, pricePerShare: 196.40, valueUsd:  9_820_000, postTxnShares:     184_392, is10b51: true  },
  { id: "f14", ticker: "AAPL", issuerCik: "0320193", insiderName: "Katherine Adams",insiderTitle: "Senior VP & General Counsel", transactionDate: "2026-04-15", filingDate: "2026-04-17", txnCode: "S", shares:  20000, pricePerShare: 194.80, valueUsd:  3_896_000, postTxnShares:     128_482, is10b51: true  },

  // ─── TSLA — Musk sales (not 10b5-1) ───
  { id: "f15", ticker: "TSLA", issuerCik: "1318605", insiderName: "Elon Musk",      insiderTitle: "CEO",                  transactionDate: "2026-04-30", filingDate: "2026-05-02", txnCode: "S", shares: 100000, pricePerShare: 184.60, valueUsd: 18_460_000, postTxnShares: 411_062_076, is10b51: false },

  // ─── ORCL — Larry Ellison purchase ───
  { id: "f16", ticker: "ORCL", issuerCik: "1341439", insiderName: "Larry Ellison",  insiderTitle: "Chairman & CTO",       transactionDate: "2026-05-06", filingDate: "2026-05-08", txnCode: "P", shares: 100000, pricePerShare: 168.40, valueUsd: 16_840_000, postTxnShares: 1_124_320_482, is10b51: false },

  // ─── JPM ───
  { id: "f17", ticker: "JPM",  issuerCik: "0019617", insiderName: "Jamie Dimon",    insiderTitle: "Chairman & CEO",       transactionDate: "2026-04-22", filingDate: "2026-04-24", txnCode: "S", shares: 100000, pricePerShare: 218.40, valueUsd: 21_840_000, postTxnShares:   8_240_184, is10b51: false },

  // ─── AMZN ───
  { id: "f18", ticker: "AMZN", issuerCik: "1018724", insiderName: "Andrew Jassy",   insiderTitle: "CEO",                  transactionDate: "2026-05-02", filingDate: "2026-05-06", txnCode: "S", shares:  20000, pricePerShare: 184.20, valueUsd:  3_684_000, postTxnShares:     482_184, is10b51: true  },

  // ─── MSFT ───
  { id: "f19", ticker: "MSFT", issuerCik: "0789019", insiderName: "Satya Nadella",  insiderTitle: "CEO",                  transactionDate: "2026-04-26", filingDate: "2026-04-30", txnCode: "S", shares:  50000, pricePerShare: 424.60, valueUsd: 21_230_000, postTxnShares:     820_412, is10b51: true  },

  // ─── GOOGL ───
  { id: "f20", ticker: "GOOGL",issuerCik: "1652044", insiderName: "Sundar Pichai",  insiderTitle: "CEO",                  transactionDate: "2026-05-12", filingDate: "2026-05-14", txnCode: "P", shares:  10000, pricePerShare: 184.20, valueUsd:  1_842_000, postTxnShares:   1_482_184, is10b51: false },

  // ─── AVGO cluster (4 distinct buyers) ───
  { id: "f21", ticker: "AVGO", issuerCik: "1730168", insiderName: "Hock Tan",       insiderTitle: "CEO",                  transactionDate: "2026-05-09", filingDate: "2026-05-13", txnCode: "P", shares:   5000, pricePerShare: 1854.20, valueUsd: 9_271_000, postTxnShares:     482_184, is10b51: false },
  { id: "f22", ticker: "AVGO", issuerCik: "1730168", insiderName: "Kirsten Spears", insiderTitle: "CFO",                  transactionDate: "2026-05-05", filingDate: "2026-05-09", txnCode: "P", shares:   1500, pricePerShare: 1842.80, valueUsd: 2_764_200, postTxnShares:      28_412, is10b51: false },
  { id: "f23", ticker: "AVGO", issuerCik: "1730168", insiderName: "Henry Samueli",  insiderTitle: "Chairman",             transactionDate: "2026-04-30", filingDate: "2026-05-02", txnCode: "P", shares:   2000, pricePerShare: 1838.40, valueUsd: 3_676_800, postTxnShares:   2_482_184, is10b51: false },
  { id: "f24", ticker: "AVGO", issuerCik: "1730168", insiderName: "Eddy Hartenstein",insiderTitle: "Director",            transactionDate: "2026-04-24", filingDate: "2026-04-26", txnCode: "P", shares:    500, pricePerShare: 1812.40, valueUsd:   906_200, postTxnShares:      18_482, is10b51: false },

  // ─── BAC ───
  { id: "f25", ticker: "BAC",  issuerCik: "0070858", insiderName: "Brian Moynihan", insiderTitle: "Chairman & CEO",       transactionDate: "2026-04-29", filingDate: "2026-05-01", txnCode: "P", shares:  50000, pricePerShare:  42.20, valueUsd:  2_110_000, postTxnShares:     820_412, is10b51: false },

  // ─── GS ───
  { id: "f26", ticker: "GS",   issuerCik: "0886982", insiderName: "David Solomon",  insiderTitle: "Chairman & CEO",       transactionDate: "2026-04-28", filingDate: "2026-04-30", txnCode: "S", shares:  10000, pricePerShare: 524.20, valueUsd:  5_242_000, postTxnShares:     128_320, is10b51: true  },

  // ─── XOM cluster (3 buyers) ───
  { id: "f27", ticker: "XOM",  issuerCik: "0034088", insiderName: "Darren Woods",   insiderTitle: "Chairman & CEO",       transactionDate: "2026-05-12", filingDate: "2026-05-14", txnCode: "P", shares:  10000, pricePerShare: 118.40, valueUsd:  1_184_000, postTxnShares:     482_184, is10b51: false },
  { id: "f28", ticker: "XOM",  issuerCik: "0034088", insiderName: "Kathryn Mikells",insiderTitle: "Senior VP & CFO",      transactionDate: "2026-05-05", filingDate: "2026-05-07", txnCode: "P", shares:   2500, pricePerShare: 117.80, valueUsd:    294_500, postTxnShares:      28_412, is10b51: false },
  { id: "f29", ticker: "XOM",  issuerCik: "0034088", insiderName: "Karen Vasilieff",insiderTitle: "Director",             transactionDate: "2026-04-29", filingDate: "2026-05-01", txnCode: "P", shares:   1000, pricePerShare: 116.40, valueUsd:    116_400, postTxnShares:      14_282, is10b51: false },

  // ─── UNH ───
  { id: "f30", ticker: "UNH",  issuerCik: "0731766", insiderName: "Andrew Witty",   insiderTitle: "CEO",                  transactionDate: "2026-04-25", filingDate: "2026-04-29", txnCode: "S", shares:  20000, pricePerShare: 484.20, valueUsd:  9_684_000, postTxnShares:     142_318, is10b51: true  },

  // ─── PFE cluster (3 buyers) ───
  { id: "f31", ticker: "PFE",  issuerCik: "0078003", insiderName: "Albert Bourla",  insiderTitle: "Chairman & CEO",       transactionDate: "2026-05-08", filingDate: "2026-05-12", txnCode: "P", shares:  20000, pricePerShare:  27.40, valueUsd:    548_000, postTxnShares:     282_184, is10b51: false },
  { id: "f32", ticker: "PFE",  issuerCik: "0078003", insiderName: "David Denton",   insiderTitle: "CFO",                  transactionDate: "2026-05-03", filingDate: "2026-05-07", txnCode: "P", shares:  10000, pricePerShare:  27.20, valueUsd:    272_000, postTxnShares:      48_184, is10b51: false },
  { id: "f33", ticker: "PFE",  issuerCik: "0078003", insiderName: "Susan Desmond-Hellmann",insiderTitle:"Director",       transactionDate: "2026-04-28", filingDate: "2026-04-30", txnCode: "P", shares:   5000, pricePerShare:  26.80, valueUsd:    134_000, postTxnShares:      14_282, is10b51: false },

  // ─── More individual transactions for variety ───
  { id: "f34", ticker: "LMT",  issuerCik: "0936468", insiderName: "James Taiclet",  insiderTitle: "Chairman & CEO",       transactionDate: "2026-05-09", filingDate: "2026-05-13", txnCode: "P", shares:   3000, pricePerShare: 558.20, valueUsd:  1_674_600, postTxnShares:     128_412, is10b51: false },
  { id: "f35", ticker: "RTX",  issuerCik: "0101829", insiderName: "Chris Calio",    insiderTitle: "CEO",                  transactionDate: "2026-05-06", filingDate: "2026-05-08", txnCode: "P", shares:   5000, pricePerShare: 124.20, valueUsd:    621_000, postTxnShares:      82_184, is10b51: false },
  { id: "f36", ticker: "BA",   issuerCik: "0012927", insiderName: "Kelly Ortberg",  insiderTitle: "President & CEO",      transactionDate: "2026-05-12", filingDate: "2026-05-14", txnCode: "P", shares:  10000, pricePerShare: 184.60, valueUsd:  1_846_000, postTxnShares:     142_184, is10b51: false },
  { id: "f37", ticker: "CRM",  issuerCik: "1108524", insiderName: "Marc Benioff",   insiderTitle: "Chairman & CEO",       transactionDate: "2026-05-05", filingDate: "2026-05-09", txnCode: "S", shares:  50000, pricePerShare: 284.40, valueUsd: 14_220_000, postTxnShares:     482_184, is10b51: true  },
  { id: "f38", ticker: "AMD",  issuerCik: "0002488", insiderName: "Lisa Su",        insiderTitle: "Chair & CEO",          transactionDate: "2026-05-08", filingDate: "2026-05-12", txnCode: "P", shares:  20000, pricePerShare: 168.40, valueUsd:  3_368_000, postTxnShares:     482_184, is10b51: false },
  { id: "f39", ticker: "NFLX", issuerCik: "1065280", insiderName: "Ted Sarandos",   insiderTitle: "Co-CEO",               transactionDate: "2026-04-22", filingDate: "2026-04-24", txnCode: "S", shares:   5000, pricePerShare: 624.20, valueUsd:  3_121_000, postTxnShares:      82_184, is10b51: true  },
  { id: "f40", ticker: "INTC", issuerCik: "0050863", insiderName: "Pat Gelsinger",  insiderTitle: "CEO (former)",         transactionDate: "2026-04-15", filingDate: "2026-04-17", txnCode: "S", shares:  20000, pricePerShare:  24.20, valueUsd:    484_000, postTxnShares:      48_184, is10b51: true  },
];

export const FORM4_AS_OF = "2026-05-14";
