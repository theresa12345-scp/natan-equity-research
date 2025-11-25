#!/usr/bin/env python3
"""
NATAN Equity Research - Stock Data Updater
Fetches real-time stock data from Yahoo Finance API.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Install dependencies if needed
try:
    import yfinance as yf
    import pandas as pd
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'yfinance', 'pandas', '-q'])
    import yfinance as yf
    import pandas as pd

# Indonesian stocks (IDX)
INDONESIA_TICKERS = [
    "BBRI.JK", "BBCA.JK", "BMRI.JK", "BBNI.JK",
    "TLKM.JK", "ASII.JK", "UNVR.JK", "HMSP.JK",
    "ICBP.JK", "INDF.JK", "KLBF.JK", "ADRO.JK",
    "PTBA.JK", "SMGR.JK", "INTP.JK", "UNTR.JK",
    "BSDE.JK", "SMRA.JK", "CTRA.JK", "PWON.JK",
    "GOTO.JK", "BUKA.JK", "EMTK.JK", "MDKA.JK",
    "ANTM.JK", "INCO.JK", "EXCL.JK", "ISAT.JK",
    "TOWR.JK", "TBIG.JK", "MYOR.JK", "GGRM.JK",
    "AMRT.JK", "MAPI.JK", "ACES.JK", "MEDC.JK",
]

# US stocks (top 100)
US_TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK-B",
    "JPM", "V", "MA", "UNH", "JNJ", "XOM", "PG", "HD", "CVX", "MRK",
    "ABBV", "KO", "PEP", "COST", "PFE", "AVGO", "TMO", "MCD", "WMT",
    "CSCO", "ABT", "ACN", "DHR", "LLY", "NKE", "ORCL", "TXN", "NEE",
    "CRM", "AMD", "PM", "UPS", "INTC", "HON", "IBM", "QCOM", "LOW",
    "CAT", "BA", "GE", "AMAT", "SBUX", "RTX", "SPGI", "GS", "BLK",
    "MS", "AXP", "DE", "C", "WFC", "BAC", "GILD", "MDLZ", "ADI",
    "SYK", "ISRG", "REGN", "BKNG", "MMC", "CB", "CME", "PLD", "AMT",
    "CCI", "EQIX", "PSA", "DLR", "O", "WM", "RSG", "DUK", "SO",
    "T", "VZ", "TMUS", "CMCSA", "NFLX", "DIS", "EOG", "SLB", "COP",
    "MPC", "PSX", "VLO", "OXY",
]

SECTOR_MAP = {
    "Technology": ["Technology", "Information Technology"],
    "Financial": ["Financial Services", "Financials"],
    "Healthcare": ["Healthcare"],
    "Consumer, Cyclical": ["Consumer Cyclical", "Consumer Discretionary"],
    "Consumer, Non-cyclical": ["Consumer Defensive", "Consumer Staples"],
    "Industrial": ["Industrials"],
    "Energy": ["Energy"],
    "Basic Materials": ["Basic Materials", "Materials"],
    "Communications": ["Communication Services"],
    "Utilities": ["Utilities"],
    "Real Estate": ["Real Estate"],
}


def get_stock_data(ticker, region):
    """Fetch stock data from Yahoo Finance."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        if not info or 'symbol' not in info:
            return None

        price = info.get('regularMarketPrice') or info.get('currentPrice') or info.get('previousClose')
        market_cap = info.get('marketCap', 0)

        pe = info.get('trailingPE') or info.get('forwardPE')
        pb = info.get('priceToBook')
        ps = info.get('priceToSalesTrailing12Months')

        roe = info.get('returnOnEquity')
        if roe:
            roe = roe * 100

        revenue_growth = info.get('revenueGrowth')
        if revenue_growth:
            revenue_growth = revenue_growth * 100

        earnings_growth = info.get('earningsGrowth')
        if earnings_growth:
            earnings_growth = earnings_growth * 100

        de_ratio = info.get('debtToEquity')
        current_ratio = info.get('currentRatio')
        quick_ratio = info.get('quickRatio')

        gross_margin = info.get('grossMargins')
        if gross_margin:
            gross_margin = gross_margin * 100

        ebitda_margin = info.get('ebitdaMargins')
        if ebitda_margin:
            ebitda_margin = ebitda_margin * 100

        beta = info.get('beta')

        # YTD return
        ytd_return = None
        try:
            hist = stock.history(period="ytd")
            if len(hist) > 0:
                start_price = hist['Close'].iloc[0]
                end_price = hist['Close'].iloc[-1]
                ytd_return = ((end_price - start_price) / start_price) * 100
        except:
            pass

        sector = info.get('sector', 'Unknown')
        industry = info.get('industry', 'Unknown')

        # Map sector
        mapped_sector = sector
        for our_sector, yahoo_sectors in SECTOR_MAP.items():
            if sector in yahoo_sectors:
                mapped_sector = our_sector
                break

        display_ticker = ticker.replace('.JK', '')

        return {
            "Ticker": display_ticker,
            "Name": info.get('longName') or info.get('shortName', ticker),
            "Industry Sector": mapped_sector,
            "Industry Group": industry,
            "Region": region,
            "Market Cap": market_cap,
            "Price": round(price, 2) if price else None,
            "PE": round(pe, 2) if pe else None,
            "PB": round(pb, 2) if pb else None,
            "PS": round(ps, 2) if ps else None,
            "ROE": round(roe, 2) if roe else None,
            "DE": round(de_ratio, 2) if de_ratio else None,
            "Beta": round(beta, 3) if beta else None,
            "Company YTD Return": round(ytd_return, 2) if ytd_return else None,
            "Revenue": info.get('totalRevenue'),
            "Revenue Growth": round(revenue_growth, 2) if revenue_growth else None,
            "Net Income": info.get('netIncomeToCommon'),
            "EPS Growth": round(earnings_growth, 2) if earnings_growth else None,
            "Net Income Growth": round(earnings_growth, 2) if earnings_growth else None,
            "FCF": info.get('freeCashflow'),
            "EBITDA": info.get('ebitda'),
            "EBITDA Margin": round(ebitda_margin, 2) if ebitda_margin else None,
            "Gross Margin": round(gross_margin, 2) if gross_margin else None,
            "Cur Ratio": round(current_ratio, 2) if current_ratio else None,
            "Quick Ratio": round(quick_ratio, 2) if quick_ratio else None,
        }
    except Exception as e:
        print(f"  Error: {ticker} - {e}")
        return None


def main():
    print("=" * 60)
    print("NATAN Stock Data Updater")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    all_stocks = []

    # Indonesia
    print(f"\nFetching {len(INDONESIA_TICKERS)} Indonesian stocks...")
    for i, ticker in enumerate(INDONESIA_TICKERS):
        print(f"  [{i+1}/{len(INDONESIA_TICKERS)}] {ticker}...", end=" ")
        data = get_stock_data(ticker, "Indonesia")
        if data:
            all_stocks.append(data)
            mc = data.get('Market Cap', 0)
            if mc >= 1e12:
                mc_str = f"${mc/1e12:.1f}T"
            elif mc >= 1e9:
                mc_str = f"${mc/1e9:.1f}B"
            else:
                mc_str = f"${mc/1e6:.1f}M"
            print(f"OK - {mc_str}")
        else:
            print("SKIP")

    # US
    print(f"\nFetching {len(US_TICKERS)} US stocks...")
    for i, ticker in enumerate(US_TICKERS):
        print(f"  [{i+1}/{len(US_TICKERS)}] {ticker}...", end=" ")
        data = get_stock_data(ticker, "US")
        if data:
            all_stocks.append(data)
            mc = data.get('Market Cap', 0)
            if mc >= 1e12:
                mc_str = f"${mc/1e12:.1f}T"
            elif mc >= 1e9:
                mc_str = f"${mc/1e9:.1f}B"
            else:
                mc_str = f"${mc/1e6:.1f}M"
            print(f"OK - {mc_str}")
        else:
            print("SKIP")

    # Sort by market cap
    all_stocks.sort(key=lambda x: x.get('Market Cap', 0) or 0, reverse=True)

    # Save
    output_path = Path(__file__).parent.parent / "public" / "global_companies_full.json"
    with open(output_path, 'w') as f:
        json.dump(all_stocks, f, indent=2)

    print(f"\n{'='*60}")
    print(f"Saved {len(all_stocks)} stocks to {output_path}")
    print(f"\nTop 5 by Market Cap:")
    for s in all_stocks[:5]:
        mc = s.get('Market Cap', 0)
        print(f"  {s['Ticker']:6} {s['Name'][:30]:30} ${mc/1e12:.2f}T  ${s.get('Price', 0)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
