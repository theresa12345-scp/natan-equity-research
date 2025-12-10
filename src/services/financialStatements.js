// ============================================================================
// FINANCIAL STATEMENTS SERVICE - SEC EDGAR (US) + Local Data (Indonesia)
// Primary: SEC EDGAR API (free, official, no daily limits)
// Fallback: App's existing financial metrics for Indonesian stocks
// ============================================================================

// Cache configuration
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const cache = new Map();

// SEC EDGAR API Configuration
// Use proxy endpoint to bypass CORS and add required User-Agent header
const SEC_BASE_URL = '/api/sec';  // Proxied through Vite to https://data.sec.gov
const LOCAL_TICKER_MAP_URL = '/sec_tickers.json'; // Bundled with app for reliability

// ============================================================================
// TICKER TO CIK MAPPING - LOCAL FILE (NO RATE LIMITING)
// ============================================================================

let tickerToCikMap = null;
let tickerMapLoading = false;

/**
 * Load the SEC ticker-to-CIK mapping from local bundled file
 * This avoids SEC rate limiting issues on the live ticker map endpoint
 */
const loadTickerMap = async () => {
  // Return cached map if available
  if (tickerToCikMap && Object.keys(tickerToCikMap).length > 0) {
    return tickerToCikMap;
  }

  // Prevent concurrent loads
  if (tickerMapLoading) {
    // Wait for existing load to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    return loadTickerMap();
  }

  tickerMapLoading = true;
  console.log('📡 Loading SEC ticker map from local file...');

  try {
    const response = await fetch(LOCAL_TICKER_MAP_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Convert to a map of ticker -> { cik, name }
    tickerToCikMap = {};
    Object.values(data).forEach(company => {
      const ticker = company.ticker?.toUpperCase();
      if (ticker) {
        const cik = String(company.cik_str).padStart(10, '0');
        tickerToCikMap[ticker] = { cik, name: company.title };

        // Also add normalized versions for tickers with special characters
        // Convert BRK-B to BRKB, BRK.B, etc.
        if (ticker.includes('-')) {
          tickerToCikMap[ticker.replace(/-/g, '')] = { cik, name: company.title };
          tickerToCikMap[ticker.replace(/-/g, '.')] = { cik, name: company.title };
        }
        if (ticker.includes('.')) {
          tickerToCikMap[ticker.replace(/\./g, '')] = { cik, name: company.title };
          tickerToCikMap[ticker.replace(/\./g, '-')] = { cik, name: company.title };
        }
      }
    });

    console.log(`✅ Loaded ${Object.keys(tickerToCikMap).length} ticker variants from local SEC data`);
    tickerMapLoading = false;
    return tickerToCikMap;

  } catch (error) {
    console.error('❌ Failed to load SEC ticker map:', error.message);
    tickerMapLoading = false;
    tickerToCikMap = {};
    return tickerToCikMap;
  }
};

/**
 * Normalize ticker to try multiple formats
 */
const normalizeTickerVariants = (ticker) => {
  if (!ticker) return [];

  const base = ticker.toUpperCase().replace('.JK', '');
  const variants = new Set([base]);

  // Try different separators
  variants.add(base.replace(/-/g, '.'));
  variants.add(base.replace(/\./g, '-'));
  variants.add(base.replace(/[-\.]/g, ''));

  // For share class tickers like BRK-B
  if (base.includes('-') || base.includes('.')) {
    const parts = base.split(/[-\.]/);
    if (parts.length === 2) {
      variants.add(`${parts[0]}${parts[1]}`);
      variants.add(`${parts[0]}-${parts[1]}`);
      variants.add(`${parts[0]}.${parts[1]}`);
    }
  }

  return Array.from(variants);
};

/**
 * Get CIK for a ticker symbol
 */
const getCikForTicker = async (ticker) => {
  const map = await loadTickerMap();
  const variants = normalizeTickerVariants(ticker);

  for (const variant of variants) {
    if (map[variant]) {
      console.log(`✅ Found CIK for ${ticker} using variant: ${variant}`);
      return map[variant];
    }
  }

  console.log(`❌ No CIK found for ${ticker}, tried:`, variants.slice(0, 5).join(', '));
  return null;
};

/**
 * Check if a stock is Indonesian
 */
export const isIndonesianStock = (ticker, region) => {
  return ticker?.toUpperCase().endsWith('.JK') ||
         region?.toLowerCase() === 'indonesia';
};

// ============================================================================
// SEC EDGAR API CALLS
// ============================================================================

const fetchSECCompanyFacts = async (cik) => {
  const cacheKey = `sec_facts_${cik}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Use proxy URL - Vite proxy adds required User-Agent header
  const url = `${SEC_BASE_URL}/api/xbrl/companyfacts/CIK${cik}.json`;
  console.log(`📡 Fetching SEC data from: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Company not found in SEC database');
      }
      if (response.status === 403) {
        throw new Error('Access denied by SEC - please try again later');
      }
      throw new Error(`SEC API error: ${response.status}`);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    console.log(`✅ Fetched SEC data for ${data.entityName || cik}`);
    return data;

  } catch (error) {
    console.error(`SEC API error for CIK ${cik}:`, error);
    throw error;
  }
};

// ============================================================================
// XBRL CONCEPT MAPPINGS
// ============================================================================

const INCOME_STATEMENT_CONCEPTS = {
  'Revenues': 'revenue',
  'RevenueFromContractWithCustomerExcludingAssessedTax': 'revenue',
  'SalesRevenueNet': 'revenue',
  'TotalRevenues': 'revenue',
  'CostOfRevenue': 'costOfRevenue',
  'CostOfGoodsAndServicesSold': 'costOfRevenue',
  'CostOfGoodsSold': 'costOfRevenue',
  'GrossProfit': 'grossProfit',
  'OperatingExpenses': 'operatingExpenses',
  'ResearchAndDevelopmentExpense': 'researchAndDevelopmentExpenses',
  'SellingGeneralAndAdministrativeExpense': 'sellingGeneralAndAdministrativeExpenses',
  'GeneralAndAdministrativeExpense': 'generalAndAdministrativeExpenses',
  'OperatingIncomeLoss': 'operatingIncome',
  'InterestExpense': 'interestExpense',
  'InterestIncome': 'interestIncome',
  'InterestIncomeExpenseNet': 'interestNet',
  'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest': 'incomeBeforeTax',
  'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments': 'incomeBeforeTax',
  'IncomeTaxExpenseBenefit': 'incomeTaxExpense',
  'NetIncomeLoss': 'netIncome',
  'ProfitLoss': 'netIncome',
  'EarningsPerShareBasic': 'eps',
  'EarningsPerShareDiluted': 'epsdiluted',
  'WeightedAverageNumberOfSharesOutstandingBasic': 'weightedAverageShsOut',
  'WeightedAverageNumberOfDilutedSharesOutstanding': 'weightedAverageShsOutDil',
};

const BALANCE_SHEET_CONCEPTS = {
  'Assets': 'totalAssets',
  'AssetsCurrent': 'totalCurrentAssets',
  'CashAndCashEquivalentsAtCarryingValue': 'cashAndCashEquivalents',
  'ShortTermInvestments': 'shortTermInvestments',
  'MarketableSecuritiesCurrent': 'shortTermInvestments',
  'AccountsReceivableNetCurrent': 'netReceivables',
  'InventoryNet': 'inventory',
  'AssetsNoncurrent': 'totalNonCurrentAssets',
  'PropertyPlantAndEquipmentNet': 'propertyPlantEquipmentNet',
  'Goodwill': 'goodwill',
  'IntangibleAssetsNetExcludingGoodwill': 'intangibleAssets',
  'Liabilities': 'totalLiabilities',
  'LiabilitiesCurrent': 'totalCurrentLiabilities',
  'AccountsPayableCurrent': 'accountPayables',
  'ShortTermBorrowings': 'shortTermDebt',
  'LongTermDebtNoncurrent': 'longTermDebt',
  'LongTermDebt': 'longTermDebt',
  'LiabilitiesNoncurrent': 'totalNonCurrentLiabilities',
  'StockholdersEquity': 'totalStockholdersEquity',
  'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest': 'totalStockholdersEquity',
  'CommonStockValue': 'commonStock',
  'RetainedEarningsAccumulatedDeficit': 'retainedEarnings',
};

const CASH_FLOW_CONCEPTS = {
  'NetCashProvidedByUsedInOperatingActivities': 'netCashProvidedByOperatingActivities',
  'DepreciationDepletionAndAmortization': 'depreciationAndAmortization',
  'ShareBasedCompensation': 'stockBasedCompensation',
  'NetCashProvidedByUsedInInvestingActivities': 'netCashUsedForInvestingActivites',
  'PaymentsToAcquirePropertyPlantAndEquipment': 'capitalExpenditure',
  'PaymentsToAcquireBusinessesNetOfCashAcquired': 'acquisitionsNet',
  'NetCashProvidedByUsedInFinancingActivities': 'netCashUsedProvidedByFinancingActivities',
  'RepaymentsOfDebt': 'debtRepayment',
  'PaymentsOfDividends': 'dividendsPaid',
  'PaymentsForRepurchaseOfCommonStock': 'commonStockRepurchased',
  'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalentsPeriodIncreaseDecreaseIncludingExchangeRateEffect': 'netChangeInCash',
  'CashAndCashEquivalentsPeriodIncreaseDecrease': 'netChangeInCash',
};

// ============================================================================
// DATA EXTRACTION FROM SEC FILINGS
// ============================================================================

const extractFinancialData = (facts, conceptMap, formType = '10-K', limit = 5) => {
  const usGaap = facts?.facts?.['us-gaap'] || {};
  const periods = {};

  Object.entries(conceptMap).forEach(([xbrlConcept, fieldName]) => {
    const conceptData = usGaap[xbrlConcept];
    if (!conceptData?.units) return;

    const units = conceptData.units.USD || conceptData.units.shares || conceptData.units.pure;
    if (!units) return;

    units
      .filter(item => {
        if (formType === '10-K') {
          return item.form === '10-K' && item.fp === 'FY';
        } else {
          return item.form === '10-Q';
        }
      })
      .forEach(item => {
        const periodKey = item.fy?.toString() || item.end?.slice(0, 4);
        if (!periodKey) return;

        if (!periods[periodKey]) {
          periods[periodKey] = {
            date: item.end,
            fiscalYear: item.fy?.toString(),
            period: formType === '10-K' ? 'FY' : `Q${item.fp?.replace('Q', '')}`,
            form: item.form,
            filed: item.filed,
          };
        }

        if (periods[periodKey][fieldName] === undefined) {
          periods[periodKey][fieldName] = item.val;
        }
      });
  });

  return Object.values(periods)
    .sort((a, b) => (b.fiscalYear || '0').localeCompare(a.fiscalYear || '0'))
    .slice(0, limit);
};

const calculateDerivedMetrics = (statements) => {
  return statements.map(stmt => {
    const enhanced = { ...stmt };

    if (stmt.revenue && stmt.grossProfit) {
      enhanced.grossProfitRatio = stmt.grossProfit / stmt.revenue;
    }
    if (stmt.revenue && stmt.operatingIncome) {
      enhanced.operatingIncomeRatio = stmt.operatingIncome / stmt.revenue;
    }
    if (stmt.revenue && stmt.netIncome) {
      enhanced.netIncomeRatio = stmt.netIncome / stmt.revenue;
    }
    if (stmt.shortTermDebt !== undefined || stmt.longTermDebt !== undefined) {
      enhanced.totalDebt = (stmt.shortTermDebt || 0) + (stmt.longTermDebt || 0);
    }
    if (enhanced.totalDebt !== undefined && stmt.cashAndCashEquivalents !== undefined) {
      enhanced.netDebt = enhanced.totalDebt - stmt.cashAndCashEquivalents;
    }
    if (stmt.netCashProvidedByOperatingActivities !== undefined && stmt.capitalExpenditure !== undefined) {
      enhanced.freeCashFlow = stmt.netCashProvidedByOperatingActivities - Math.abs(stmt.capitalExpenditure);
    }

    return enhanced;
  });
};

// ============================================================================
// INDONESIAN STOCK DATA FROM APP'S EXISTING METRICS
// ============================================================================

const createIndonesianFinancialSummary = (stock) => {
  // Extract available metrics from the stock object
  const metrics = {
    revenue: stock.Revenue,
    revenueGrowth: stock['Revenue Growth'],
    netIncome: stock['Net Income'],
    netIncomeGrowth: stock['Net Income Growth'],
    epsGrowth: stock['EPS Growth'],
    grossMargin: stock['Gross Margin'],
    ebitdaMargin: stock['EBITDA Margin'],
    ebitda: stock.EBITDA,
    fcf: stock.FCF,
    fcfConversion: stock['FCF Conversion'],
    pe: stock.PE,
    pb: stock.PB,
    roe: stock.ROE,
    de: stock.DE,
    currentRatio: stock['Cur Ratio'],
    quickRatio: stock['Quick Ratio'],
    marketCap: stock['Market Cap'],
  };

  return {
    ticker: stock.Ticker || stock.ticker,
    companyName: stock.Name || stock.name,
    region: 'Indonesia',
    currency: 'IDR',
    metrics,
    hasFullStatements: false,
    source: 'App Data',
  };
};

// ============================================================================
// PUBLIC API - INCOME STATEMENT
// ============================================================================

export const INCOME_STATEMENT_ITEMS = [
  { key: 'revenue', label: 'Revenue', isHeader: true },
  { key: 'costOfRevenue', label: 'Cost of Revenue' },
  { key: 'grossProfit', label: 'Gross Profit', isSubtotal: true },
  { key: 'grossProfitRatio', label: 'Gross Margin', isPercent: true },
  { key: 'researchAndDevelopmentExpenses', label: 'R&D Expenses' },
  { key: 'sellingGeneralAndAdministrativeExpenses', label: 'SG&A Expenses' },
  { key: 'operatingExpenses', label: 'Total Operating Expenses' },
  { key: 'operatingIncome', label: 'Operating Income (EBIT)', isSubtotal: true },
  { key: 'operatingIncomeRatio', label: 'Operating Margin', isPercent: true },
  { key: 'interestIncome', label: 'Interest Income' },
  { key: 'interestExpense', label: 'Interest Expense' },
  { key: 'incomeBeforeTax', label: 'Income Before Tax', isSubtotal: true },
  { key: 'incomeTaxExpense', label: 'Income Tax Expense' },
  { key: 'netIncome', label: 'Net Income', isTotal: true },
  { key: 'netIncomeRatio', label: 'Net Margin', isPercent: true },
  { key: 'eps', label: 'EPS (Basic)' },
  { key: 'epsdiluted', label: 'EPS (Diluted)' },
  { key: 'weightedAverageShsOut', label: 'Shares Outstanding (Basic)', isShares: true },
  { key: 'weightedAverageShsOutDil', label: 'Shares Outstanding (Diluted)', isShares: true },
];

export const fetchIncomeStatement = async (ticker, region = 'US', period = 'annual', limit = 5, stock = null) => {
  const cacheKey = `income:${ticker}:${period}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { ...cached.data, fromCache: true };
  }

  const isIndo = isIndonesianStock(ticker, region);

  // For Indonesian stocks, return available metrics from stock object
  if (isIndo) {
    if (stock) {
      const summary = createIndonesianFinancialSummary(stock);
      return {
        statements: [],
        ...summary,
        notSupported: true,
        isIndonesian: true,
        error: null,
      };
    }
    return {
      statements: [],
      error: 'Indonesian stocks: SEC EDGAR only covers US companies. Basic metrics shown in Screener.',
      notSupported: true,
      isIndonesian: true,
    };
  }

  try {
    const cikData = await getCikForTicker(ticker);

    if (!cikData) {
      return {
        statements: [],
        error: `Ticker "${ticker}" not found in SEC database. Verify the ticker symbol or try a different stock.`,
        notSupported: true,
        isIndonesian: false,
      };
    }

    const facts = await fetchSECCompanyFacts(cikData.cik);
    const formType = period === 'annual' ? '10-K' : '10-Q';

    let statements = extractFinancialData(facts, INCOME_STATEMENT_CONCEPTS, formType, limit);
    statements = calculateDerivedMetrics(statements);
    statements = statements.map(s => ({ ...s, currency: 'USD' }));

    const result = {
      ticker,
      companyName: cikData.name || facts.entityName,
      cik: cikData.cik,
      period,
      statements,
      currency: 'USD',
      source: 'SEC EDGAR',
      fromCache: false,
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;

  } catch (error) {
    console.error(`Failed to fetch income statement for ${ticker}:`, error.message);
    return {
      statements: [],
      error: error.message,
      notSupported: false,
      isIndonesian: false,
    };
  }
};

// ============================================================================
// PUBLIC API - BALANCE SHEET
// ============================================================================

export const BALANCE_SHEET_ITEMS = [
  { key: 'totalAssets', label: 'Total Assets', isTotal: true, section: 'assets' },
  { key: 'totalCurrentAssets', label: 'Current Assets', isSubtotal: true, section: 'assets' },
  { key: 'cashAndCashEquivalents', label: 'Cash & Equivalents', section: 'assets' },
  { key: 'shortTermInvestments', label: 'Short-Term Investments', section: 'assets' },
  { key: 'netReceivables', label: 'Accounts Receivable', section: 'assets' },
  { key: 'inventory', label: 'Inventory', section: 'assets' },
  { key: 'totalNonCurrentAssets', label: 'Non-Current Assets', isSubtotal: true, section: 'assets' },
  { key: 'propertyPlantEquipmentNet', label: 'PP&E (Net)', section: 'assets' },
  { key: 'goodwill', label: 'Goodwill', section: 'assets' },
  { key: 'intangibleAssets', label: 'Intangible Assets', section: 'assets' },
  { key: 'totalLiabilities', label: 'Total Liabilities', isTotal: true, section: 'liabilities' },
  { key: 'totalCurrentLiabilities', label: 'Current Liabilities', isSubtotal: true, section: 'liabilities' },
  { key: 'accountPayables', label: 'Accounts Payable', section: 'liabilities' },
  { key: 'shortTermDebt', label: 'Short-Term Debt', section: 'liabilities' },
  { key: 'totalNonCurrentLiabilities', label: 'Non-Current Liabilities', isSubtotal: true, section: 'liabilities' },
  { key: 'longTermDebt', label: 'Long-Term Debt', section: 'liabilities' },
  { key: 'totalStockholdersEquity', label: 'Total Equity', isTotal: true, section: 'equity' },
  { key: 'commonStock', label: 'Common Stock', section: 'equity' },
  { key: 'retainedEarnings', label: 'Retained Earnings', section: 'equity' },
  { key: 'totalDebt', label: 'Total Debt', isSubtotal: true, section: 'metrics' },
  { key: 'netDebt', label: 'Net Debt', section: 'metrics' },
];

export const fetchBalanceSheet = async (ticker, region = 'US', period = 'annual', limit = 5, stock = null) => {
  const cacheKey = `balance:${ticker}:${period}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { ...cached.data, fromCache: true };
  }

  const isIndo = isIndonesianStock(ticker, region);

  if (isIndo) {
    return {
      statements: [],
      notSupported: true,
      isIndonesian: true,
      error: null,
    };
  }

  try {
    const cikData = await getCikForTicker(ticker);

    if (!cikData) {
      return {
        statements: [],
        error: `Ticker "${ticker}" not found in SEC database.`,
        notSupported: true,
        isIndonesian: false,
      };
    }

    const facts = await fetchSECCompanyFacts(cikData.cik);
    const formType = period === 'annual' ? '10-K' : '10-Q';

    let statements = extractFinancialData(facts, BALANCE_SHEET_CONCEPTS, formType, limit);
    statements = calculateDerivedMetrics(statements);
    statements = statements.map(s => ({ ...s, currency: 'USD' }));

    const result = {
      ticker,
      companyName: cikData.name || facts.entityName,
      cik: cikData.cik,
      period,
      statements,
      currency: 'USD',
      source: 'SEC EDGAR',
      fromCache: false,
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;

  } catch (error) {
    console.error(`Failed to fetch balance sheet for ${ticker}:`, error.message);
    return { statements: [], error: error.message };
  }
};

// ============================================================================
// PUBLIC API - CASH FLOW STATEMENT
// ============================================================================

export const CASH_FLOW_ITEMS = [
  { key: 'netCashProvidedByOperatingActivities', label: 'Cash from Operations', isTotal: true, section: 'operating' },
  { key: 'depreciationAndAmortization', label: 'D&A', section: 'operating' },
  { key: 'stockBasedCompensation', label: 'Stock-Based Compensation', section: 'operating' },
  { key: 'netCashUsedForInvestingActivites', label: 'Cash from Investing', isTotal: true, section: 'investing' },
  { key: 'capitalExpenditure', label: 'Capital Expenditures', section: 'investing' },
  { key: 'acquisitionsNet', label: 'Acquisitions', section: 'investing' },
  { key: 'netCashUsedProvidedByFinancingActivities', label: 'Cash from Financing', isTotal: true, section: 'financing' },
  { key: 'debtRepayment', label: 'Debt Repayment', section: 'financing' },
  { key: 'commonStockRepurchased', label: 'Stock Buybacks', section: 'financing' },
  { key: 'dividendsPaid', label: 'Dividends Paid', section: 'financing' },
  { key: 'netChangeInCash', label: 'Net Change in Cash', isTotal: true, section: 'summary' },
  { key: 'freeCashFlow', label: 'Free Cash Flow', isTotal: true, section: 'fcf' },
];

export const fetchCashFlowStatement = async (ticker, region = 'US', period = 'annual', limit = 5, stock = null) => {
  const cacheKey = `cashflow:${ticker}:${period}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { ...cached.data, fromCache: true };
  }

  const isIndo = isIndonesianStock(ticker, region);

  if (isIndo) {
    return {
      statements: [],
      notSupported: true,
      isIndonesian: true,
      error: null,
    };
  }

  try {
    const cikData = await getCikForTicker(ticker);

    if (!cikData) {
      return {
        statements: [],
        error: `Ticker "${ticker}" not found in SEC database.`,
        notSupported: true,
        isIndonesian: false,
      };
    }

    const facts = await fetchSECCompanyFacts(cikData.cik);
    const formType = period === 'annual' ? '10-K' : '10-Q';

    let statements = extractFinancialData(facts, CASH_FLOW_CONCEPTS, formType, limit);
    statements = calculateDerivedMetrics(statements);
    statements = statements.map(s => ({ ...s, currency: 'USD' }));

    const result = {
      ticker,
      companyName: cikData.name || facts.entityName,
      cik: cikData.cik,
      period,
      statements,
      currency: 'USD',
      source: 'SEC EDGAR',
      fromCache: false,
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;

  } catch (error) {
    console.error(`Failed to fetch cash flow for ${ticker}:`, error.message);
    return { statements: [], error: error.message };
  }
};

// ============================================================================
// PUBLIC API - FINANCIAL RATIOS
// ============================================================================

export const fetchFinancialRatios = async (ticker, region = 'US', period = 'annual', limit = 5) => {
  try {
    const [income, balance] = await Promise.all([
      fetchIncomeStatement(ticker, region, period, limit),
      fetchBalanceSheet(ticker, region, period, limit),
    ]);

    if (income.notSupported || balance.notSupported) {
      return { ratios: [], error: income.error || balance.error, notSupported: true };
    }

    const ratios = income.statements.map((incomeStmt, i) => {
      const balanceStmt = balance.statements[i] || {};

      return {
        date: incomeStmt.date,
        period: incomeStmt.period,
        grossProfitMargin: incomeStmt.grossProfitRatio,
        operatingProfitMargin: incomeStmt.operatingIncomeRatio,
        netProfitMargin: incomeStmt.netIncomeRatio,
        returnOnAssets: balanceStmt.totalAssets ? incomeStmt.netIncome / balanceStmt.totalAssets : null,
        returnOnEquity: balanceStmt.totalStockholdersEquity ? incomeStmt.netIncome / balanceStmt.totalStockholdersEquity : null,
        currentRatio: balanceStmt.totalCurrentLiabilities ? balanceStmt.totalCurrentAssets / balanceStmt.totalCurrentLiabilities : null,
        debtEquityRatio: balanceStmt.totalStockholdersEquity ? balanceStmt.totalDebt / balanceStmt.totalStockholdersEquity : null,
        debtRatio: balanceStmt.totalAssets ? balanceStmt.totalLiabilities / balanceStmt.totalAssets : null,
      };
    });

    return {
      ticker,
      period,
      ratios,
      source: 'SEC EDGAR (Calculated)',
      fromCache: false,
    };

  } catch (error) {
    console.error(`Failed to fetch ratios for ${ticker}:`, error.message);
    return { ratios: [], error: error.message };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatFinancialNumber = (value, currency = 'USD', compact = true) => {
  if (value === null || value === undefined) return '—';

  const absValue = Math.abs(value);
  const isNegative = value < 0;

  let formatted;
  let suffix = '';

  if (compact) {
    if (absValue >= 1e12) {
      formatted = (absValue / 1e12).toFixed(1);
      suffix = 'T';
    } else if (absValue >= 1e9) {
      formatted = (absValue / 1e9).toFixed(1);
      suffix = 'B';
    } else if (absValue >= 1e6) {
      formatted = (absValue / 1e6).toFixed(1);
      suffix = 'M';
    } else if (absValue >= 1e3) {
      formatted = (absValue / 1e3).toFixed(1);
      suffix = 'K';
    } else {
      formatted = absValue.toFixed(0);
    }
  } else {
    formatted = absValue.toLocaleString();
  }

  const currencySymbol = currency === 'IDR' ? 'Rp' : currency === 'USD' ? '$' : currency;
  return `${isNegative ? '(' : ''}${currencySymbol}${formatted}${suffix}${isNegative ? ')' : ''}`;
};

export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(decimals)}%`;
};

export const calculateGrowth = (current, previous) => {
  if (!current || !previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

export const clearFinancialCache = () => {
  cache.clear();
  tickerToCikMap = null;
  tickerMapLoading = false;
};

// Legacy API key functions (kept for backwards compatibility)
export const setFMPApiKey = () => {};
export const getFMPApiKey = () => '';
export const hasFMPApiKey = () => true;

// Connection test - verifies local ticker map loads correctly
export const testFMPConnection = async () => {
  try {
    const map = await loadTickerMap();
    const tickerCount = Object.keys(map).length;
    if (tickerCount > 0) {
      return {
        success: true,
        message: `SEC EDGAR ready - ${tickerCount} tickers loaded from local data`
      };
    } else {
      return {
        success: false,
        error: 'Ticker map is empty - check that /sec_tickers.json exists in public folder'
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};
