#!/usr/bin/env python3
"""
Merge Bloomberg GICS classification data with existing JCI stock data.
This script:
1. Reads the Bloomberg export with GICS classifications
2. Reads the existing global_companies_full.json
3. Merges GICS data by matching tickers
4. Outputs updated JSON with GICS fields
"""

import json
import csv
import os

def clean_ticker(ticker):
    """Extract clean ticker from Bloomberg format (e.g., 'BBCA IJ Equity' -> 'BBCA')"""
    if not ticker:
        return None
    # Remove ' IJ Equity' suffix
    ticker = ticker.replace(' IJ Equity', '').strip()
    return ticker.upper()

def load_gics_data(csv_path):
    """Load GICS data from Bloomberg export CSV"""
    gics_map = {}

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ticker = clean_ticker(row.get('Ticker', ''))
            if ticker:
                gics_map[ticker] = {
                    'GICS Sector': row.get('GICS Sector', '').strip(),
                    'GICS Industry Group': row.get('GICS Industry Group', '').strip(),
                    'GICS Industry': row.get('GICS Industry', '').strip(),
                    'GICS Sub-Industry': row.get('GICS Sub-Industry', '').strip(),
                    # Also keep Bloomberg classifications for reference
                    'Bloomberg Sector': row.get('Sector', '').strip(),
                    'Bloomberg Industry Group': row.get('Industry Group', '').strip(),
                    'Bloomberg Industry Subgroup': row.get('Industry Subgroup', '').strip(),
                }

    return gics_map

def merge_data(stocks_data, gics_map):
    """Merge GICS data into stocks"""
    updated_count = 0
    missing_tickers = []

    for stock in stocks_data:
        ticker = stock.get('Ticker', '').upper()

        if ticker in gics_map:
            gics = gics_map[ticker]
            # Add GICS fields
            stock['GICS Sector'] = gics['GICS Sector']
            stock['GICS Industry Group'] = gics['GICS Industry Group']
            stock['GICS Industry'] = gics['GICS Industry']
            stock['GICS Sub-Industry'] = gics['GICS Sub-Industry']
            # Keep original Bloomberg fields but also add more detailed ones
            stock['Bloomberg Subgroup'] = gics['Bloomberg Industry Subgroup']
            updated_count += 1
        else:
            missing_tickers.append(ticker)

    return stocks_data, updated_count, missing_tickers

def main():
    # Paths
    gics_csv_path = '/Users/nathanielluu/Downloads/JCI Industries and Sectors.csv'
    stocks_json_path = '/Users/nathanielluu/natan-equity-research/natan-equity-research/public/global_companies_full.json'
    output_path = '/Users/nathanielluu/natan-equity-research/natan-equity-research/public/global_companies_full.json'

    print("=" * 60)
    print("GICS Data Merger for Natan Equity Research")
    print("=" * 60)

    # Load GICS data from Bloomberg export
    print(f"\n1. Loading GICS data from: {gics_csv_path}")
    gics_map = load_gics_data(gics_csv_path)
    print(f"   Found {len(gics_map)} tickers with GICS classifications")

    # Show sample GICS sub-industries
    sub_industries = set(g['GICS Sub-Industry'] for g in gics_map.values() if g['GICS Sub-Industry'])
    print(f"   Unique GICS Sub-Industries: {len(sub_industries)}")

    # Load existing stock data
    print(f"\n2. Loading existing stock data from: {stocks_json_path}")
    with open(stocks_json_path, 'r', encoding='utf-8') as f:
        stocks_data = json.load(f)
    print(f"   Found {len(stocks_data)} stocks")

    # Count Indonesian stocks
    indo_stocks = [s for s in stocks_data if s.get('Region') == 'Indonesia']
    print(f"   Indonesian stocks: {len(indo_stocks)}")

    # Merge data
    print("\n3. Merging GICS data...")
    merged_data, updated_count, missing = merge_data(stocks_data, gics_map)
    print(f"   Updated {updated_count} stocks with GICS data")

    if missing:
        indo_missing = [t for t in missing if any(s.get('Ticker') == t and s.get('Region') == 'Indonesia' for s in stocks_data)]
        if indo_missing and len(indo_missing) <= 20:
            print(f"   Missing GICS for Indonesian tickers: {indo_missing}")

    # Save updated data
    print(f"\n4. Saving updated data to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, indent=2, ensure_ascii=False)
    print("   Done!")

    # Print summary of GICS Sub-Industries found
    print("\n" + "=" * 60)
    print("GICS SUB-INDUSTRIES FOUND IN JCI:")
    print("=" * 60)
    for si in sorted(sub_industries):
        count = sum(1 for g in gics_map.values() if g['GICS Sub-Industry'] == si)
        print(f"  {si}: {count} stocks")

    # Print sample of merged data
    print("\n" + "=" * 60)
    print("SAMPLE MERGED DATA:")
    print("=" * 60)
    sample_tickers = ['BBCA', 'TLKM', 'ASII', 'ICBP', 'ADRO']
    for stock in merged_data:
        if stock.get('Ticker') in sample_tickers:
            print(f"\n{stock['Ticker']} - {stock['Name']}")
            print(f"  GICS Sector: {stock.get('GICS Sector', 'N/A')}")
            print(f"  GICS Industry Group: {stock.get('GICS Industry Group', 'N/A')}")
            print(f"  GICS Industry: {stock.get('GICS Industry', 'N/A')}")
            print(f"  GICS Sub-Industry: {stock.get('GICS Sub-Industry', 'N/A')}")

if __name__ == '__main__':
    main()
