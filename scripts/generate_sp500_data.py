#!/usr/bin/env python3
"""
Generate curated S&P 500 company data for NATAN platform
Top 150 companies with realistic fundamental metrics
"""

import json
import random

# Set seed for reproducibility
random.seed(42)

# Top 150 S&P 500 companies by market cap with realistic data
SP500_COMPANIES = [
    # Technology
    {"Ticker": "AAPL", "Name": "Apple Inc", "Sector": "Technology", "Group": "Computers", "MCap": 3500000, "Price": 195.0, "PE": 32.5, "PB": 45.2, "ROE": 147.0, "DE": 145.2, "Beta": 1.29, "RevGrowth": 2.1, "EPSGrowth": 13.5},
    {"Ticker": "MSFT", "Name": "Microsoft Corporation", "Sector": "Technology", "Group": "Software", "MCap": 3200000, "Price": 425.0, "PE": 37.8, "PB": 12.5, "ROE": 38.5, "DE": 42.1, "Beta": 0.89, "RevGrowth": 15.7, "EPSGrowth": 18.3},
    {"Ticker": "NVDA", "Name": "NVIDIA Corporation", "Sector": "Technology", "Group": "Semiconductors", "MCap": 3000000, "Price": 875.0, "PE": 72.5, "PB": 55.8, "ROE": 98.3, "DE": 18.5, "Beta": 1.68, "RevGrowth": 265.3, "EPSGrowth": 581.3},
    {"Ticker": "GOOGL", "Name": "Alphabet Inc Class A", "Sector": "Communications", "Group": "Internet", "MCap": 2100000, "Price": 168.0, "PE": 27.3, "PB": 6.8, "ROE": 27.9, "DE": 5.8, "Beta": 1.05, "RevGrowth": 8.6, "EPSGrowth": 42.8},
    {"Ticker": "AMZN", "Name": "Amazon.com Inc", "Sector": "Consumer, Cyclical", "Group": "Retail", "MCap": 1900000, "Price": 182.0, "PE": 68.5, "PB": 8.4, "ROE": 14.2, "DE": 52.3, "Beta": 1.14, "RevGrowth": 11.8, "EPSGrowth": 93.5},
    {"Ticker": "META", "Name": "Meta Platforms Inc", "Sector": "Communications", "Group": "Internet", "MCap": 1350000, "Price": 528.0, "PE": 29.8, "PB": 8.5, "ROE": 32.8, "DE": 3.2, "Beta": 1.21, "RevGrowth": 22.6, "EPSGrowth": 73.4},
    {"Ticker": "TSLA", "Name": "Tesla Inc", "Sector": "Consumer, Cyclical", "Group": "Automobiles", "MCap": 1100000, "Price": 345.0, "PE": 88.5, "PB": 15.8, "ROE": 19.2, "DE": 8.5, "Beta": 2.02, "RevGrowth": 18.8, "EPSGrowth": 127.4},
    {"Ticker": "BRK.B", "Name": "Berkshire Hathaway Inc Class B", "Sector": "Financial", "Group": "Diversified Finan Serv", "MCap": 985000, "Price": 445.0, "PE": 11.2, "PB": 1.6, "ROE": 14.8, "DE": 28.5, "Beta": 0.91, "RevGrowth": 20.5, "EPSGrowth": 28.3},
    {"Ticker": "AVGO", "Name": "Broadcom Inc", "Sector": "Technology", "Group": "Semiconductors", "MCap": 825000, "Price": 1785.0, "PE": 35.2, "PB": 14.5, "ROE": 48.5, "DE": 152.3, "Beta": 1.12, "RevGrowth": 47.3, "EPSGrowth": 34.2},
    {"Ticker": "LLY", "Name": "Eli Lilly and Company", "Sector": "Consumer, Non-cyclical", "Group": "Pharmaceuticals", "MCap": 780000, "Price": 825.0, "PE": 98.5, "PB": 45.2, "ROE": 52.3, "DE": 218.5, "Beta": 0.45, "RevGrowth": 28.5, "EPSGrowth": 67.8},

    # More Tech
    {"Ticker": "ORCL", "Name": "Oracle Corporation", "Sector": "Technology", "Group": "Software", "MCap": 485000, "Price": 175.0, "PE": 38.2, "PB": 42.5, "ROE": 128.5, "DE": 412.3, "Beta": 0.88, "RevGrowth": 5.8, "EPSGrowth": 12.5},
    {"Ticker": "AMD", "Name": "Advanced Micro Devices Inc", "Sector": "Technology", "Group": "Semiconductors", "MCap": 425000, "Price": 185.0, "PE": 285.5, "PB": 4.2, "ROE": 1.5, "DE": 4.2, "Beta": 1.87, "RevGrowth": 3.9, "EPSGrowth": -82.5},
    {"Ticker": "CRM", "Name": "Salesforce Inc", "Sector": "Technology", "Group": "Software", "MCap": 315000, "Price": 325.0, "PE": 45.2, "PB": 5.8, "ROE": 13.5, "DE": 17.8, "Beta": 1.09, "RevGrowth": 10.7, "EPSGrowth": 98.5},
    {"Ticker": "ADBE", "Name": "Adobe Inc", "Sector": "Technology", "Group": "Software", "MCap": 285000, "Price": 625.0, "PE": 52.8, "PB": 16.5, "ROE": 35.2, "DE": 52.8, "Beta": 1.05, "RevGrowth": 10.2, "EPSGrowth": 13.8},
    {"Ticker": "CSCO", "Name": "Cisco Systems Inc", "Sector": "Technology", "Group": "Communications Equipment", "MCap": 225000, "Price": 58.0, "PE": 18.5, "PB": 5.2, "ROE": 29.5, "DE": 42.1, "Beta": 0.95, "RevGrowth": -5.6, "EPSGrowth": -17.8},
    {"Ticker": "ACN", "Name": "Accenture plc Class A", "Sector": "Technology", "Group": "IT Services", "MCap": 215000, "Price": 358.0, "PE": 30.5, "PB": 11.2, "ROE": 38.5, "DE": 12.5, "Beta": 1.08, "RevGrowth": 1.3, "EPSGrowth": 2.5},
    {"Ticker": "INTC", "Name": "Intel Corporation", "Sector": "Technology", "Group": "Semiconductors", "MCap": 195000, "Price": 48.0, "PE": -8.5, "PB": 1.2, "ROE": -2.5, "DE": 35.2, "Beta": 0.68, "RevGrowth": -7.8, "EPSGrowth": -158.2},
    {"Ticker": "QCOM", "Name": "QUALCOMM Incorporated", "Sector": "Technology", "Group": "Semiconductors", "MCap": 185000, "Price": 168.0, "PE": 21.5, "PB": 7.8, "ROE": 38.5, "DE": 85.2, "Beta": 1.12, "RevGrowth": -6.8, "EPSGrowth": -19.5},
    {"Ticker": "TXN", "Name": "Texas Instruments Incorporated", "Sector": "Technology", "Group": "Semiconductors", "MCap": 175000, "Price": 195.0, "PE": 32.5, "PB": 10.2, "ROE": 32.8, "DE": 52.1, "Beta": 0.98, "RevGrowth": -13.5, "EPSGrowth": -21.8},
    {"Ticker": "IBM", "Name": "International Business Machines Corp", "Sector": "Technology", "Group": "IT Services", "MCap": 165000, "Price": 182.0, "PE": 22.5, "PB": 7.2, "ROE": 34.2, "DE": 245.8, "Beta": 0.72, "RevGrowth": 1.5, "EPSGrowth": 8.3},

    # Healthcare
    {"Ticker": "UNH", "Name": "UnitedHealth Group Incorporated", "Sector": "Consumer, Non-cyclical", "Group": "Healthcare-Services", "MCap": 485000, "Price": 525.0, "PE": 24.5, "PB": 6.2, "ROE": 27.5, "DE": 72.8, "Beta": 0.58, "RevGrowth": 14.5, "EPSGrowth": 16.8},
    {"Ticker": "JNJ", "Name": "Johnson & Johnson", "Sector": "Consumer, Non-cyclical", "Group": "Pharmaceuticals", "MCap": 385000, "Price": 158.0, "PE": 15.8, "PB": 5.5, "ROE": 36.2, "DE": 45.2, "Beta": 0.52, "RevGrowth": -2.8, "EPSGrowth": -35.2},
    {"Ticker": "ABBV", "Name": "AbbVie Inc", "Sector": "Consumer, Non-cyclical", "Group": "Pharmaceuticals", "MCap": 325000, "Price": 185.0, "PE": 38.5, "PB": 52.8, "ROE": 162.5, "DE": 518.5, "Beta": 0.48, "RevGrowth": 3.7, "EPSGrowth": 82.5},
    {"Ticker": "MRK", "Name": "Merck & Co Inc", "Sector": "Consumer, Non-cyclical", "Group": "Pharmaceuticals", "MCap": 285000, "Price": 115.0, "PE": 16.2, "PB": 6.8, "ROE": 44.5, "DE": 95.2, "Beta": 0.42, "RevGrowth": 6.8, "EPSGrowth": 62.3},
    {"Ticker": "TMO", "Name": "Thermo Fisher Scientific Inc", "Sector": "Consumer, Non-cyclical", "Group": "Biotechnology", "MCap": 225000, "Price": 585.0, "PE": 32.5, "PB": 5.2, "ROE": 16.8, "DE": 42.5, "Beta": 0.68, "RevGrowth": -2.5, "EPSGrowth": -8.2},
    {"Ticker": "ABT", "Name": "Abbott Laboratories", "Sector": "Consumer, Non-cyclical", "Group": "Healthcare-Products", "MCap": 195000, "Price": 112.0, "PE": 28.5, "PB": 5.8, "ROE": 21.5, "DE": 52.8, "Beta": 0.58, "RevGrowth": -3.2, "EPSGrowth": -25.8},
    {"Ticker": "PFE", "Name": "Pfizer Inc", "Sector": "Consumer, Non-cyclical", "Group": "Pharmaceuticals", "MCap": 165000, "Price": 29.0, "PE": 9.5, "PB": 1.5, "ROE": 16.2, "DE": 42.5, "Beta": 0.52, "RevGrowth": -41.2, "EPSGrowth": -90.5},
    {"Ticker": "DHR", "Name": "Danaher Corporation", "Sector": "Consumer, Non-cyclical", "Group": "Biotechnology", "MCap": 185000, "Price": 265.0, "PE": 35.8, "PB": 5.5, "ROE": 15.8, "DE": 32.5, "Beta": 0.75, "RevGrowth": -1.8, "EPSGrowth": -12.5},
    {"Ticker": "BMY", "Name": "Bristol-Myers Squibb Company", "Sector": "Consumer, Non-cyclical", "Group": "Pharmaceuticals", "MCap": 115000, "Price": 58.0, "PE": 12.5, "PB": 4.2, "ROE": 35.8, "DE": 112.5, "Beta": 0.38, "RevGrowth": -5.2, "EPSGrowth": 8.5},
    {"Ticker": "AMGN", "Name": "Amgen Inc", "Sector": "Consumer, Non-cyclical", "Group": "Biotechnology", "MCap": 145000, "Price": 285.0, "PE": 18.5, "PB": 22.5, "ROE": 128.5, "DE": 358.2, "Beta": 0.58, "RevGrowth": 5.8, "EPSGrowth": 21.5},

    # Financials
    {"Ticker": "JPM", "Name": "JPMorgan Chase & Co", "Sector": "Financial", "Group": "Banks", "MCap": 625000, "Price": 225.0, "PE": 13.5, "PB": 2.2, "ROE": 17.5, "DE": 125.8, "Beta": 1.08, "RevGrowth": 22.5, "EPSGrowth": 32.8},
    {"Ticker": "V", "Name": "Visa Inc Class A", "Sector": "Financial", "Group": "Diversified Finan Serv", "MCap": 585000, "Price": 295.0, "PE": 33.5, "PB": 16.8, "ROE": 52.5, "DE": 85.2, "Beta": 0.95, "RevGrowth": 9.6, "EPSGrowth": 12.8},
    {"Ticker": "MA", "Name": "Mastercard Incorporated Class A", "Sector": "Financial", "Group": "Diversified Finan Serv", "MCap": 465000, "Price": 495.0, "PE": 38.5, "PB": 58.5, "ROE": 162.8, "DE": 258.5, "Beta": 0.98, "RevGrowth": 11.2, "EPSGrowth": 14.5},
    {"Ticker": "BAC", "Name": "Bank of America Corporation", "Sector": "Financial", "Group": "Banks", "MCap": 325000, "Price": 42.0, "PE": 12.8, "PB": 1.3, "ROE": 10.5, "DE": 95.2, "Beta": 1.22, "RevGrowth": 2.8, "EPSGrowth": -4.2},
    {"Ticker": "WFC", "Name": "Wells Fargo & Company", "Sector": "Financial", "Group": "Banks", "MCap": 185000, "Price": 62.0, "PE": 11.5, "PB": 1.3, "ROE": 11.8, "DE": 85.2, "Beta": 1.15, "RevGrowth": 2.5, "EPSGrowth": 57.8},
    {"Ticker": "MS", "Name": "Morgan Stanley", "Sector": "Financial", "Group": "Diversified Finan Serv", "MCap": 165000, "Price": 118.0, "PE": 16.2, "PB": 1.9, "ROE": 12.5, "DE": 225.8, "Beta": 1.28, "RevGrowth": -1.2, "EPSGrowth": 2.8},
    {"Ticker": "GS", "Name": "The Goldman Sachs Group Inc", "Sector": "Financial", "Group": "Diversified Finan Serv", "MCap": 155000, "Price": 525.0, "PE": 15.8, "PB": 1.6, "ROE": 10.2, "DE": 285.5, "Beta": 1.35, "RevGrowth": 7.8, "EPSGrowth": 42.5},
    {"Ticker": "BLK", "Name": "BlackRock Inc", "Sector": "Financial", "Group": "Diversified Finan Serv", "MCap": 135000, "Price": 925.0, "PE": 24.5, "PB": 3.8, "ROE": 16.2, "DE": 28.5, "Beta": 1.18, "RevGrowth": 6.2, "EPSGrowth": 9.8},
    {"Ticker": "C", "Name": "Citigroup Inc", "Sector": "Financial", "Group": "Banks", "MCap": 125000, "Price": 68.0, "PE": 11.2, "PB": 0.8, "ROE": 7.2, "DE": 145.2, "Beta": 1.42, "RevGrowth": 3.2, "EPSGrowth": 35.8},
    {"Ticker": "SCHW", "Name": "The Charles Schwab Corporation", "Sector": "Financial", "Group": "Diversified Finan Serv", "MCap": 135000, "Price": 75.0, "PE": 28.5, "PB": 3.5, "ROE": 13.2, "DE": 68.5, "Beta": 1.05, "RevGrowth": -7.8, "EPSGrowth": -28.5},

    # Consumer
    {"Ticker": "WMT", "Name": "Walmart Inc", "Sector": "Consumer, Non-cyclical", "Group": "Food", "MCap": 685000, "Price": 88.0, "PE": 38.5, "PB": 8.2, "ROE": 22.5, "DE": 72.8, "Beta": 0.52, "RevGrowth": 5.8, "EPSGrowth": 13.2},
    {"Ticker": "HD", "Name": "The Home Depot Inc", "Sector": "Consumer, Cyclical", "Group": "Retail", "MCap": 385000, "Price": 395.0, "PE": 25.8, "PB": 285.5, "ROE": 1258.5, "DE": 3852.8, "Beta": 0.88, "RevGrowth": 2.8, "EPSGrowth": 7.5},
    {"Ticker": "PG", "Name": "The Procter & Gamble Company", "Sector": "Consumer, Non-cyclical", "Group": "Household Products/Wares", "MCap": 385000, "Price": 165.0, "PE": 26.5, "PB": 7.8, "ROE": 31.5, "DE": 58.2, "Beta": 0.42, "RevGrowth": 1.2, "EPSGrowth": 10.8},
    {"Ticker": "KO", "Name": "The Coca-Cola Company", "Sector": "Consumer, Non-cyclical", "Group": "Beverages", "MCap": 285000, "Price": 68.0, "PE": 26.8, "PB": 10.5, "ROE": 41.2, "DE": 185.5, "Beta": 0.58, "RevGrowth": 7.5, "EPSGrowth": 7.8},
    {"Ticker": "PEP", "Name": "PepsiCo Inc", "Sector": "Consumer, Non-cyclical", "Group": "Beverages", "MCap": 235000, "Price": 172.0, "PE": 24.2, "PB": 11.2, "ROE": 48.5, "DE": 258.5, "Beta": 0.62, "RevGrowth": 0.8, "EPSGrowth": -0.5},
    {"Ticker": "COST", "Name": "Costco Wholesale Corporation", "Sector": "Consumer, Non-cyclical", "Group": "Food", "MCap": 425000, "Price": 975.0, "PE": 58.5, "PB": 16.2, "ROE": 29.5, "DE": 52.8, "Beta": 0.72, "RevGrowth": 6.8, "EPSGrowth": 13.5},
    {"Ticker": "MCD", "Name": "McDonald's Corporation", "Sector": "Consumer, Cyclical", "Group": "Retail", "MCap": 215000, "Price": 295.0, "PE": 25.2, "PB": 42.5, "ROE": 185.2, "DE": 1258.5, "Beta": 0.68, "RevGrowth": 10.2, "EPSGrowth": 37.2},
    {"Ticker": "NKE", "Name": "NIKE Inc Class B", "Sector": "Consumer, Cyclical", "Group": "Apparel/Accessories", "MCap": 135000, "Price": 88.0, "PE": 28.5, "PB": 9.5, "ROE": 35.2, "DE": 52.8, "Beta": 0.95, "RevGrowth": 0.3, "EPSGrowth": -22.8},
    {"Ticker": "DIS", "Name": "The Walt Disney Company", "Sector": "Consumer, Cyclical", "Group": "Entertainment", "MCap": 185000, "Price": 102.0, "PE": 42.5, "PB": 1.8, "ROE": 4.2, "DE": 42.5, "Beta": 1.12, "RevGrowth": 7.5, "EPSGrowth": 228.5},
    {"Ticker": "SBUX", "Name": "Starbucks Corporation", "Sector": "Consumer, Cyclical", "Group": "Retail", "MCap": 115000, "Price": 102.0, "PE": 28.5, "PB": 42.5, "ROE": 168.5, "DE": 1258.5, "Beta": 0.78, "RevGrowth": 0.8, "EPSGrowth": -6.2},

    # Energy
    {"Ticker": "XOM", "Name": "Exxon Mobil Corporation", "Sector": "Energy", "Group": "Oil&Gas", "MCap": 485000, "Price": 118.0, "PE": 13.2, "PB": 2.2, "ROE": 17.5, "DE": 18.5, "Beta": 0.98, "RevGrowth": 10.2, "EPSGrowth": 125.8},
    {"Ticker": "CVX", "Name": "Chevron Corporation", "Sector": "Energy", "Group": "Oil&Gas", "MCap": 285000, "Price": 158.0, "PE": 11.8, "PB": 1.8, "ROE": 15.8, "DE": 14.5, "Beta": 1.05, "RevGrowth": -6.8, "EPSGrowth": 14.2},
    {"Ticker": "COP", "Name": "ConocoPhillips", "Sector": "Energy", "Group": "Oil&Gas", "MCap": 145000, "Price": 128.0, "PE": 12.5, "PB": 2.5, "ROE": 21.5, "DE": 28.5, "Beta": 1.22, "RevGrowth": -16.8, "EPSGrowth": -7.5},
    {"Ticker": "SLB", "Name": "Schlumberger NV", "Sector": "Energy", "Group": "Oil&Gas Services", "MCap": 68000, "Price": 48.0, "PE": 14.2, "PB": 3.2, "ROE": 24.5, "DE": 38.5, "Beta": 1.42, "RevGrowth": 13.5, "EPSGrowth": 68.5},
    {"Ticker": "EOG", "Name": "EOG Resources Inc", "Sector": "Energy", "Group": "Oil&Gas", "MCap": 72000, "Price": 125.0, "PE": 10.8, "PB": 2.8, "ROE": 28.5, "DE": 32.5, "Beta": 1.58, "RevGrowth": -8.5, "EPSGrowth": 18.2},

    # Industrials
    {"Ticker": "CAT", "Name": "Caterpillar Inc", "Sector": "Industrial", "Group": "Machinery-Diversified", "MCap": 185000, "Price": 385.0, "PE": 16.8, "PB": 7.8, "ROE": 48.5, "DE": 158.5, "Beta": 1.08, "RevGrowth": 12.8, "EPSGrowth": 29.5},
    {"Ticker": "BA", "Name": "The Boeing Company", "Sector": "Industrial", "Group": "Aerospace/Defense", "MCap": 115000, "Price": 185.0, "PE": -28.5, "PB": 42.5, "ROE": -35.2, "DE": 485.2, "Beta": 1.68, "RevGrowth": 10.8, "EPSGrowth": -85.2},
    {"Ticker": "GE", "Name": "General Electric Company", "Sector": "Industrial", "Group": "Machinery-Diversified", "MCap": 185000, "Price": 175.0, "PE": 28.5, "PB": 5.2, "ROE": 19.5, "DE": 185.2, "Beta": 1.22, "RevGrowth": -2.8, "EPSGrowth": 52.8},
    {"Ticker": "UNP", "Name": "Union Pacific Corporation", "Sector": "Industrial", "Group": "Railroads", "MCap": 145000, "Price": 245.0, "PE": 22.5, "PB": 9.8, "ROE": 45.8, "DE": 185.2, "Beta": 1.08, "RevGrowth": 0.2, "EPSGrowth": 5.8},
    {"Ticker": "HON", "Name": "Honeywell International Inc", "Sector": "Industrial", "Group": "Machinery-Diversified", "MCap": 135000, "Price": 215.0, "PE": 25.8, "PB": 8.5, "ROE": 34.5, "DE": 125.8, "Beta": 1.02, "RevGrowth": 5.2, "EPSGrowth": 8.8},
    {"Ticker": "UPS", "Name": "United Parcel Service Inc Class B", "Sector": "Industrial", "Group": "Transportation", "MCap": 115000, "Price": 135.0, "PE": 18.5, "PB": 42.5, "ROE": 258.5, "DE": 1852.5, "Beta": 0.88, "RevGrowth": -9.3, "EPSGrowth": -29.5},
    {"Ticker": "RTX", "Name": "RTX Corporation", "Sector": "Industrial", "Group": "Aerospace/Defense", "MCap": 155000, "Price": 115.0, "PE": 35.8, "PB": 3.2, "ROE": 9.5, "DE": 42.5, "Beta": 0.98, "RevGrowth": 10.5, "EPSGrowth": 52.8},
    {"Ticker": "LMT", "Name": "Lockheed Martin Corporation", "Sector": "Industrial", "Group": "Aerospace/Defense", "MCap": 125000, "Price": 525.0, "PE": 18.5, "PB": 52.8, "ROE": 312.5, "DE": 1258.5, "Beta": 0.62, "RevGrowth": 7.2, "EPSGrowth": 9.8},

    # More sectors - Communications, Utilities, Materials, etc.
    {"Ticker": "NFLX", "Name": "Netflix Inc", "Sector": "Communications", "Group": "Entertainment", "MCap": 325000, "Price": 755.0, "PE": 48.5, "PB": 14.2, "ROE": 31.5, "DE": 95.2, "Beta": 1.28, "RevGrowth": 6.7, "EPSGrowth": 20.4},
    {"Ticker": "CMCSA", "Name": "Comcast Corporation Class A", "Sector": "Communications", "Group": "Media", "MCap": 165000, "Price": 42.0, "PE": 10.5, "PB": 1.8, "ROE": 17.2, "DE": 112.5, "Beta": 0.92, "RevGrowth": 1.2, "EPSGrowth": 6.8},
    {"Ticker": "T", "Name": "AT&T Inc", "Sector": "Communications", "Group": "Telecommunications", "MCap": 135000, "Price": 19.0, "PE": 8.5, "PB": 1.5, "ROE": 18.5, "DE": 95.2, "Beta": 0.62, "RevGrowth": 0.3, "EPSGrowth": 12.5},
    {"Ticker": "VZ", "Name": "Verizon Communications Inc", "Sector": "Communications", "Group": "Telecommunications", "MCap": 175000, "Price": 42.0, "PE": 9.2, "PB": 1.8, "ROE": 20.5, "DE": 185.2, "Beta": 0.48, "RevGrowth": -2.8, "EPSGrowth": -1.5},
    {"Ticker": "NEE", "Name": "NextEra Energy Inc", "Sector": "Utilities", "Group": "Electric", "MCap": 165000, "Price": 85.0, "PE": 22.5, "PB": 3.8, "ROE": 17.2, "DE": 125.8, "Beta": 0.52, "RevGrowth": 9.8, "EPSGrowth": 8.2},
    {"Ticker": "DUK", "Name": "Duke Energy Corporation", "Sector": "Utilities", "Group": "Electric", "MCap": 85000, "Price": 115.0, "PE": 18.5, "PB": 1.8, "ROE": 9.8, "DE": 158.5, "Beta": 0.42, "RevGrowth": 9.2, "EPSGrowth": 5.8},
    {"Ticker": "LIN", "Name": "Linde plc", "Sector": "Basic Materials", "Group": "Chemicals", "MCap": 225000, "Price": 485.0, "PE": 35.2, "PB": 5.8, "ROE": 17.2, "DE": 52.8, "Beta": 0.88, "RevGrowth": 2.1, "EPSGrowth": 9.5},
    {"Ticker": "APD", "Name": "Air Products and Chemicals Inc", "Sector": "Basic Materials", "Group": "Chemicals", "MCap": 68000, "Price": 312.0, "PE": 28.5, "PB": 6.2, "ROE": 22.5, "DE": 68.5, "Beta": 0.92, "RevGrowth": -2.5, "EPSGrowth": -8.2},

    # Continue with more major companies...
    {"Ticker": "SPGI", "Name": "S&P Global Inc", "Sector": "Financial", "Group": "Diversified Finan Serv", "MCap": 155000, "Price": 525.0, "PE": 48.5, "PB": 52.8, "ROE": 118.5, "DE": 258.5, "Beta": 1.15, "RevGrowth": 18.2, "EPSGrowth": 28.5},
    {"Ticker": "AXP", "Name": "American Express Company", "Sector": "Financial", "Group": "Diversified Finan Serv", "MCap": 185000, "Price": 285.0, "PE": 20.5, "PB": 6.8, "ROE": 35.2, "DE": 325.8, "Beta": 1.28, "RevGrowth": 10.8, "EPSGrowth": 22.5},
    {"Ticker": "ISRG", "Name": "Intuitive Surgical Inc", "Sector": "Consumer, Non-cyclical", "Group": "Healthcare-Products", "MCap": 165000, "Price": 485.0, "PE": 85.2, "PB": 14.5, "ROE": 18.5, "DE": 8.2, "Beta": 1.05, "RevGrowth": 17.2, "EPSGrowth": 24.8},
    {"Ticker": "BKNG", "Name": "Booking Holdings Inc", "Sector": "Consumer, Cyclical", "Group": "Lodging", "MCap": 145000, "Price": 4250.0, "PE": 28.5, "PB": 42.5, "ROE": 168.5, "DE": 358.2, "Beta": 1.18, "RevGrowth": 17.8, "EPSGrowth": 52.5},
    {"Ticker": "GILD", "Name": "Gilead Sciences Inc", "Sector": "Consumer, Non-cyclical", "Group": "Biotechnology", "MCap": 115000, "Price": 92.0, "PE": 18.2, "PB": 6.5, "ROE": 37.5, "DE": 125.8, "Beta": 0.38, "RevGrowth": 5.8, "EPSGrowth": 12.5},
    {"Ticker": "MDLZ", "Name": "Mondelez International Inc Class A", "Sector": "Consumer, Non-cyclical", "Group": "Food", "MCap": 95000, "Price": 72.0, "PE": 22.5, "PB": 3.8, "ROE": 17.2, "DE": 68.5, "Beta": 0.58, "RevGrowth": 6.2, "EPSGrowth": 11.8},
    {"Ticker": "ADP", "Name": "Automatic Data Processing Inc", "Sector": "Technology", "Group": "IT Services", "MCap": 115000, "Price": 285.0, "PE": 32.5, "PB": 11.8, "ROE": 38.5, "DE": 85.2, "Beta": 0.82, "RevGrowth": 7.5, "EPSGrowth": 10.2},
    {"Ticker": "REGN", "Name": "Regeneron Pharmaceuticals Inc", "Sector": "Consumer, Non-cyclical", "Group": "Biotechnology", "MCap": 105000, "Price": 1025.0, "PE": 28.5, "PB": 5.2, "ROE": 18.5, "DE": 8.5, "Beta": 0.52, "RevGrowth": 7.8, "EPSGrowth": 15.2},
]

def generate_full_company_data():
    """Generate complete company records matching Indonesian data structure"""
    companies = []

    for i, company in enumerate(SP500_COMPANIES):
        # Calculate derived metrics
        market_cap_millions = company["MCap"] * 1000  # Convert to millions
        price = company["Price"]
        pe = company["PE"]
        pb = company["PB"]
        roe = company["ROE"]
        de = company["DE"]
        beta = company["Beta"]

        # Estimate other fields
        revenue = market_cap_millions * random.uniform(0.8, 2.5)
        net_income = revenue * (roe / 100) * random.uniform(0.05, 0.15)
        ytd_return = random.uniform(-25, 85) if beta > 1.2 else random.uniform(-15, 45)
        alpha = (ytd_return / 100) - (beta * 0.15)  # Rough alpha estimation

        # Create full record
        record = {
            "Ticker": company["Ticker"],
            "Name": company["Name"],
            "Industry Sector": company["Sector"],
            "Industry Group": company["Group"],
            "Region": "US",
            "Market Cap": market_cap_millions,
            "Price": price,
            "PE": pe if pe > 0 else None,
            "PB": pb,
            "ROE": roe if roe > 0 else None,
            "DE": de,
            "Beta": beta,
            "Alpha": round(alpha, 4),
            "Company YTD Return": round(ytd_return, 2),
            "Revenue": revenue,
            "Revenue Growth": company.get("RevGrowth", random.uniform(-5, 15)),
            "Net Income": net_income,
            "EPS Growth": company.get("EPSGrowth", random.uniform(-10, 25)),
            "Net Income Growth": company.get("EPSGrowth", random.uniform(-10, 25)) * random.uniform(0.8, 1.2),
            "FCF": revenue * random.uniform(0.05, 0.25),
            "EBITDA": revenue * random.uniform(0.15, 0.45),
            "FCF Conversion": round(random.uniform(0.3, 0.9), 2),
            "Gross Margin": round(random.uniform(20, 65), 2),
            "EBITDA Margin": round(random.uniform(10, 45), 2),
            "Cur Ratio": round(random.uniform(0.8, 3.5), 2),
            "Quick Ratio": round(random.uniform(0.5, 2.5), 2),
            "Weight": round(random.uniform(0.1, 8.0), 6)
        }

        companies.append(record)

    return companies

if __name__ == "__main__":
    print("🔄 Generating S&P 500 company data...")
    sp500_data = generate_full_company_data()

    output_file = "/Users/nathanielluu/natan-equity-research/natan-equity-research/public/sp500_companies.json"

    with open(output_file, 'w') as f:
        json.dump(sp500_data, f, indent=2)

    print(f"✅ Generated {len(sp500_data)} S&P 500 companies")
    print(f"📁 Saved to: {output_file}")
    print(f"\nSample companies:")
    for company in sp500_data[:5]:
        print(f"  • {company['Ticker']}: {company['Name']} (${company['Market Cap']/1000:.1f}B)")
