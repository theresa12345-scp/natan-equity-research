#!/usr/bin/env python3
"""
NATAN Equity Research - S&P 500 Data Fetcher
Fetches comprehensive financial data for S&P 500 companies + major global companies
Source: Yahoo Finance (via yfinance library)
"""

import yfinance as yf
import pandas as pd
import json
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# S&P 500 tickers - full list as of Nov 2025
SP500_TICKERS = [
    # Technology
    "AAPL", "MSFT", "NVDA", "GOOGL", "GOOG", "META", "AVGO", "ORCL", "AMD", "CRM",
    "ADBE", "CSCO", "ACN", "INTC", "QCOM", "TXN", "IBM", "NOW", "INTU", "AMAT",
    "MU", "ADI", "LRCX", "KLAC", "SNPS", "CDNS", "MRVL", "FTNT", "PANW", "CRWD",
    "WDAY", "ADSK", "TEAM", "DDOG", "ZS", "ANSS", "KEYS", "MPWR", "ON", "NXPI",
    "GEN", "CTSH", "HPQ", "HPE", "JNPR", "AKAM", "FFIV", "EPAM", "IT", "LDOS",

    # Consumer Discretionary
    "AMZN", "TSLA", "HD", "MCD", "NKE", "SBUX", "TJX", "BKNG", "LOW", "CMG",
    "ORLY", "AZO", "ROST", "MAR", "HLT", "YUM", "DRI", "GRMN", "EBAY", "ETSY",
    "POOL", "BBY", "DHI", "LEN", "PHM", "NVR", "KMX", "GPC", "DPZ", "WYNN",
    "LVS", "MGM", "CZR", "RCL", "CCL", "NCLH", "EXPE", "ABNB", "APTV", "BWA",
    "F", "GM", "RIVN", "LCID",

    # Healthcare
    "LLY", "UNH", "JNJ", "MRK", "ABBV", "PFE", "TMO", "ABT", "DHR", "BMY",
    "AMGN", "GILD", "VRTX", "REGN", "MDT", "ISRG", "SYK", "BSX", "EW", "ZBH",
    "BDX", "HCA", "CI", "ELV", "MCK", "CAH", "COR", "IDXX", "IQV", "MTD",
    "A", "WAT", "DGX", "LH", "HOLX", "ALGN", "DXCM", "PODD", "ILMN", "BIIB",
    "MRNA", "GEHC",

    # Financials
    "BRK.B", "JPM", "V", "MA", "BAC", "WFC", "GS", "MS", "SPGI", "BLK",
    "SCHW", "AXP", "C", "PNC", "USB", "TFC", "COF", "CME", "ICE", "MCO",
    "AON", "MMC", "CB", "MET", "AIG", "PRU", "AFL", "TRV", "PGR", "ALL",
    "MTB", "FITB", "KEY", "RF", "HBAN", "CFG", "ZION", "CMA", "WRB", "L",
    "CINF", "GL", "AIZ", "RE", "BRO",

    # Communication Services
    "GOOGL", "META", "NFLX", "DIS", "CMCSA", "T", "VZ", "CHTR", "TMUS", "EA",
    "TTWO", "MTCH", "PARA", "WBD", "FOX", "FOXA", "NWS", "NWSA", "OMC", "IPG",

    # Industrials
    "CAT", "GE", "HON", "RTX", "UNP", "UPS", "DE", "LMT", "BA", "NOC",
    "GD", "TDG", "ITW", "EMR", "ETN", "PH", "ROK", "CARR", "OTIS", "JCI",
    "SWK", "FAST", "CTAS", "PAYX", "VRSK", "RSG", "WM", "PCAR", "NSC", "CSX",
    "FDX", "DAL", "UAL", "LUV", "AAL", "WCN", "IR", "XYL", "AWK", "DOV",
    "AME", "CPRT", "ODFL", "J", "FTV", "PNR", "AOS", "LII",

    # Consumer Staples
    "PG", "KO", "PEP", "COST", "WMT", "PM", "MO", "MDLZ", "CL", "EL",
    "KMB", "GIS", "K", "SJM", "HSY", "MKC", "CPB", "HRL", "CAG", "CHD",
    "TSN", "ADM", "BG", "KR", "SYY", "WBA", "TGT", "DG", "DLTR", "KHC",

    # Energy
    "XOM", "CVX", "COP", "SLB", "EOG", "MPC", "PSX", "VLO", "OXY", "PXD",
    "FANG", "DVN", "HES", "HAL", "BKR", "KMI", "WMB", "OKE", "TRGP", "CTRA",

    # Materials
    "LIN", "APD", "SHW", "ECL", "DD", "NEM", "FCX", "NUE", "VMC", "MLM",
    "ALB", "PPG", "CTVA", "CF", "MOS", "IFF", "FMC", "CE", "EMN", "AVY",

    # Real Estate
    "PLD", "AMT", "EQIX", "PSA", "CCI", "O", "SPG", "WELL", "DLR", "VICI",
    "SBAC", "AVB", "EQR", "VTR", "ARE", "EXR", "MAA", "UDR", "ESS", "KIM",
    "REG", "HST", "PEAK", "CPT", "BXP", "SLG", "AIV", "CBRE", "JLL",

    # Utilities
    "NEE", "SO", "DUK", "AEP", "D", "SRE", "XEL", "ED", "EXC", "PEG",
    "WEC", "ES", "AWK", "EIX", "PPL", "FE", "DTE", "ETR", "AEE", "CMS",
    "CNP", "ATO", "NI", "EVRG", "LNT", "NRG", "VST", "AES", "CEG",
]

# Major European companies (STOXX 50 + key names)
EUROPE_TICKERS = [
    "ASML", "LVMH.PA", "SAP", "NVO", "AZN", "SHEL", "TTE", "NESN.SW", "ROG.SW",
    "MC.PA", "OR.PA", "SAN.PA", "ULVR.L", "BP.L", "GSK.L", "RIO.L", "BHP",
]

# Major Asian companies (excluding Indonesia which we already have)
ASIA_TICKERS = [
    "TSM", "BABA", "JD", "PDD", "BIDU", "NIO", "XPEV", "LI",  # China ADRs
    "7203.T", "6758.T", "9984.T", "6861.T",  # Japan
    "005930.KS", "000660.KS",  # Korea
]

# Sector mapping for Yahoo Finance to our format
SECTOR_MAP = {
    'Technology': 'Technology',
    'Information Technology': 'Technology',
    'Communication Services': 'Communications',
    'Consumer Cyclical': 'Consumer, Cyclical',
    'Consumer Defensive': 'Consumer, Non-cyclical',
    'Financial Services': 'Financial',
    'Financial': 'Financial',
    'Healthcare': 'Healthcare',
    'Industrials': 'Industrial',
    'Basic Materials': 'Basic Materials',
    'Energy': 'Energy',
    'Utilities': 'Utilities',
    'Real Estate': 'Financial',  # Map REIT to Financial for comps
}


def fetch_stock_data(ticker, region='US'):
    """Fetch comprehensive data for a single stock from Yahoo Finance"""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        if not info or 'regularMarketPrice' not in info:
            print(f"  ⚠️ No data for {ticker}")
            return None

        # Get basic price and market data
        price = info.get('regularMarketPrice') or info.get('currentPrice', 0)
        market_cap = info.get('marketCap', 0)

        if not price or not market_cap:
            print(f"  ⚠️ Missing price/market cap for {ticker}")
            return None

        # Get valuation metrics
        pe = info.get('trailingPE')
        if pe and (pe < 0 or pe > 1000):
            pe = info.get('forwardPE')  # Use forward PE if trailing is invalid

        pb = info.get('priceToBook')
        if pb and pb > 1000:
            pb = None  # Invalid

        ps = info.get('priceToSalesTrailing12Months')

        # Get profitability metrics
        roe = info.get('returnOnEquity')
        if roe:
            roe = roe * 100  # Convert to percentage

        roa = info.get('returnOnAssets')
        if roa:
            roa = roa * 100

        # Get growth metrics
        revenue_growth = info.get('revenueGrowth')
        if revenue_growth:
            revenue_growth = revenue_growth * 100

        earnings_growth = info.get('earningsGrowth')
        if earnings_growth:
            earnings_growth = earnings_growth * 100

        # Get financial health metrics
        de = info.get('debtToEquity')
        current_ratio = info.get('currentRatio')
        quick_ratio = info.get('quickRatio')

        # Get cash flow metrics
        fcf = info.get('freeCashflow')
        operating_cf = info.get('operatingCashflow')

        # Get margins
        gross_margin = info.get('grossMargins')
        if gross_margin:
            gross_margin = gross_margin * 100

        ebitda = info.get('ebitda')
        revenue = info.get('totalRevenue', 0)
        ebitda_margin = None
        if ebitda and revenue and revenue > 0:
            ebitda_margin = (ebitda / revenue) * 100

        # Get income metrics
        net_income = info.get('netIncomeToCommon')
        eps = info.get('trailingEps')

        # Get beta
        beta = info.get('beta')

        # Get YTD return
        ytd_return = info.get('52WeekChange')
        if ytd_return:
            ytd_return = ytd_return * 100

        # Get dividend yield
        dividend_yield = info.get('dividendYield')
        if dividend_yield:
            dividend_yield = dividend_yield * 100

        # Map sector
        raw_sector = info.get('sector', 'Unknown')
        sector = SECTOR_MAP.get(raw_sector, raw_sector)

        # Build the data structure
        return {
            'Ticker': ticker.replace('.', '-'),  # Normalize ticker format
            'Name': info.get('shortName') or info.get('longName', ticker),
            'Industry Sector': sector,
            'Industry Group': info.get('industry', ''),
            'Region': region,
            'Market Cap': market_cap,
            'Price': price,
            'PE': round(pe, 2) if pe else None,
            'PB': round(pb, 2) if pb else None,
            'PS': round(ps, 2) if ps else None,
            'ROE': round(roe, 2) if roe else None,
            'ROA': round(roa, 2) if roa else None,
            'DE': round(de, 2) if de else None,
            'Beta': round(beta, 4) if beta else None,
            'Alpha': None,  # Would need historical data to calculate
            'Company YTD Return': round(ytd_return, 2) if ytd_return else None,
            'Revenue': revenue,
            'Revenue Growth': round(revenue_growth, 2) if revenue_growth else None,
            'Net Income': net_income,
            'EPS Growth': round(earnings_growth, 2) if earnings_growth else None,
            'Net Income Growth': round(earnings_growth, 2) if earnings_growth else None,
            'FCF': fcf,
            'EBITDA': ebitda,
            'FCF Conversion': round(fcf / net_income, 2) if (fcf and net_income and net_income > 0) else None,
            'Gross Margin': round(gross_margin, 2) if gross_margin else None,
            'EBITDA Margin': round(ebitda_margin, 2) if ebitda_margin else None,
            'Cur Ratio': round(current_ratio, 2) if current_ratio else None,
            'Quick Ratio': round(quick_ratio, 2) if quick_ratio else None,
            'Dividend Yield': round(dividend_yield, 2) if dividend_yield else None,
            'Weight': None,  # Index weight not available from yfinance
        }

    except Exception as e:
        print(f"  ❌ Error fetching {ticker}: {str(e)[:50]}")
        return None


def fetch_batch_data(tickers, region='US', batch_size=10, delay=1):
    """Fetch data for multiple stocks with rate limiting"""
    results = []
    total = len(tickers)

    print(f"\n📊 Fetching {total} {region} stocks...")

    for i in range(0, total, batch_size):
        batch = tickers[i:i+batch_size]
        print(f"  Processing batch {i//batch_size + 1}/{(total-1)//batch_size + 1}: {', '.join(batch[:5])}...")

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {executor.submit(fetch_stock_data, t, region): t for t in batch}
            for future in as_completed(futures):
                result = future.result()
                if result:
                    results.append(result)

        # Rate limiting
        if i + batch_size < total:
            time.sleep(delay)

    print(f"  ✅ Successfully fetched {len(results)}/{total} stocks")
    return results


def main():
    """Main function to fetch all data and update JSON"""
    print("=" * 60)
    print("NATAN Equity Research - Data Fetcher")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    all_data = []

    # 1. Fetch S&P 500 data
    unique_sp500 = list(dict.fromkeys(SP500_TICKERS))  # Remove duplicates
    sp500_data = fetch_batch_data(unique_sp500, region='US', batch_size=20, delay=2)
    all_data.extend(sp500_data)

    # 2. Load existing Indonesian data (keep it)
    try:
        with open('public/global_companies_full.json', 'r') as f:
            existing_data = json.load(f)

        indo_data = [d for d in existing_data if d.get('Region') == 'Indonesia']
        print(f"\n📊 Keeping {len(indo_data)} Indonesian stocks from existing data")
        all_data.extend(indo_data)
    except Exception as e:
        print(f"⚠️ Could not load existing data: {e}")

    # 3. Fetch European data
    europe_data = fetch_batch_data(EUROPE_TICKERS, region='Europe', batch_size=10, delay=2)
    all_data.extend(europe_data)

    # 4. Fetch Asian data
    asia_data = fetch_batch_data(ASIA_TICKERS, region='Asia', batch_size=10, delay=2)
    all_data.extend(asia_data)

    # Remove duplicates by ticker
    seen = set()
    unique_data = []
    for d in all_data:
        if d['Ticker'] not in seen:
            seen.add(d['Ticker'])
            unique_data.append(d)

    # Sort by market cap (descending)
    unique_data.sort(key=lambda x: x.get('Market Cap', 0) or 0, reverse=True)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    regions = {}
    for d in unique_data:
        r = d.get('Region', 'Unknown')
        regions[r] = regions.get(r, 0) + 1

    print(f"Total companies: {len(unique_data)}")
    for r, count in sorted(regions.items()):
        print(f"  {r}: {count}")

    # Save to file
    output_path = 'public/global_companies_full.json'
    with open(output_path, 'w') as f:
        json.dump(unique_data, f, indent=2)

    print(f"\n✅ Saved to {output_path}")
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == '__main__':
    main()
