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
import random
from datetime import datetime, date
from concurrent.futures import ThreadPoolExecutor, as_completed

# Rate limiting configuration
MAX_RETRIES = 3
BASE_DELAY = 2  # Base delay between requests in seconds
MAX_BACKOFF = 120  # Maximum backoff time in seconds

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

# =============================================================================
# UNITED KINGDOM - FTSE 100 (London Stock Exchange)
# Yahoo Finance format: TICKER.L
# =============================================================================
UK_FTSE100_TICKERS = [
    # Mega Cap (>£50B)
    "AZN.L", "SHEL.L", "HSBA.L", "ULVR.L", "BP.L", "GSK.L", "RIO.L", "DGE.L",
    "LSEG.L", "REL.L", "AAL.L", "BATS.L", "NG.L", "CPG.L", "EXPN.L",
    # Large Cap Financials
    "LLOY.L", "BARC.L", "NWG.L", "STAN.L", "PHNX.L", "LGEN.L", "AV.L", "PRU.L",
    "SMIN.L", "III.L", "HLMA.L", "SDR.L",
    # Large Cap Consumer
    "TSCO.L", "ABF.L", "RKT.L", "IMB.L", "SBRY.L", "JD.L", "FRAS.L", "BDEV.L",
    "PSN.L", "TW.L", "WTB.L", "OCDO.L",
    # Industrials & Materials
    "CRH.L", "ANTO.L", "GLEN.L", "MNDI.L", "WEIR.L", "SMDS.L", "RS1.L", "RTO.L",
    "BA.L", "RR.L", "MEL.L", "SGE.L",
    # Energy & Utilities
    "SSE.L", "SVT.L", "CNA.L", "UU.L", "PNN.L",
    # Tech & Telecom
    "VOD.L", "BT-A.L", "SAGE.L", "AUTO.L", "DARK.L",
    # Healthcare
    "HIK.L", "SN.L", "CRDA.L",
    # Other Large Cap
    "IAG.L", "IHG.L", "WPP.L", "ITV.L", "ENT.L", "FERG.L", "INF.L", "BNZL.L",
    "BRBY.L", "RMV.L", "LAND.L", "BLND.L", "SGRO.L", "UTG.L",
]

# =============================================================================
# GERMANY - DAX 40 (Frankfurt Stock Exchange)
# Yahoo Finance format: TICKER.DE
# =============================================================================
GERMANY_DAX40_TICKERS = [
    # Mega Cap
    "SAP.DE", "SIE.DE", "ALV.DE", "DTE.DE", "MRK.DE", "MBG.DE", "BMW.DE",
    # Large Cap
    "DHL.DE", "AIR.DE", "MUV2.DE", "BAS.DE", "BAYN.DE", "ADS.DE", "IFX.DE",
    "VOW3.DE", "HEN3.DE", "BEI.DE", "DB1.DE", "DBK.DE", "RWE.DE", "EON.DE",
    "FRE.DE", "HNR1.DE", "CON.DE", "SY1.DE", "1COV.DE", "PAH3.DE", "MTX.DE",
    "VNA.DE", "PUM.DE", "ZAL.DE", "SHL.DE", "QIA.DE", "SRT3.DE", "HEI.DE",
    "RHM.DE", "ENR.DE", "BNR.DE",
]

# =============================================================================
# FRANCE - CAC 40 (Euronext Paris)
# Yahoo Finance format: TICKER.PA
# =============================================================================
FRANCE_CAC40_TICKERS = [
    # Luxury & Consumer
    "MC.PA", "OR.PA", "KER.PA", "HO.PA", "RI.PA", "EL.PA",
    # Energy & Industrials
    "TTE.PA", "AI.PA", "AIR.PA", "SU.PA", "SGO.PA", "CAP.PA", "BN.PA", "DG.PA",
    # Financials
    "BNP.PA", "GLE.PA", "ACA.PA", "CS.PA",
    # Healthcare
    "SAN.PA", "EL.PA",
    # Tech & Telecom
    "DSY.PA", "STM.PA", "ORA.PA", "ATO.PA",
    # Utilities
    "ENGI.PA", "VIE.PA",
    # Other
    "PUB.PA", "VIV.PA", "ML.PA", "EN.PA", "RMS.PA", "TEP.PA", "URW.PA",
    "LR.PA", "WLN.PA", "STLA.PA", "ERF.PA",
]

# =============================================================================
# SWITZERLAND - SMI 20 (Swiss Market Index)
# Yahoo Finance format: TICKER.SW
# =============================================================================
SWITZERLAND_SMI_TICKERS = [
    "NESN.SW", "ROG.SW", "NOVN.SW", "UBSG.SW", "CSGN.SW", "ABBN.SW", "ZURN.SW",
    "SREN.SW", "GIVN.SW", "LONN.SW", "GEBN.SW", "SIKA.SW", "HOLN.SW", "SCMN.SW",
    "SLHN.SW", "PGHN.SW", "SGSN.SW", "ALC.SW", "BAER.SW", "LOGN.SW",
]

# =============================================================================
# NETHERLANDS - AEX 25 (Amsterdam Exchange)
# Yahoo Finance format: TICKER.AS
# =============================================================================
NETHERLANDS_AEX_TICKERS = [
    "ASML.AS", "ADYEN.AS", "PRX.AS", "INGA.AS", "HEIA.AS", "AD.AS", "KPN.AS",
    "RAND.AS", "UNA.AS", "ABN.AS", "AKZA.AS", "WKL.AS", "PHIA.AS", "DSM.AS",
    "ASM.AS", "AGN.AS", "NN.AS", "IMCD.AS", "BESI.AS", "URW.AS", "LIGHT.AS",
]

# =============================================================================
# SPAIN - IBEX 35 (Madrid Stock Exchange)
# Yahoo Finance format: TICKER.MC
# =============================================================================
SPAIN_IBEX35_TICKERS = [
    "ITX.MC", "IBE.MC", "SAN.MC", "BBVA.MC", "TEF.MC", "REP.MC", "FER.MC",
    "AENA.MC", "AMS.MC", "ENG.MC", "CLNX.MC", "GRF.MC", "IAG.MC", "RED.MC",
    "ELE.MC", "MEL.MC", "MAP.MC", "ACS.MC", "CABK.MC", "SAB.MC", "ANE.MC",
    "ACX.MC", "BKT.MC", "MTS.MC", "SGRE.MC", "COL.MC", "FDR.MC", "ALM.MC",
    "LOG.MC", "PHM.MC", "MRL.MC", "ROVI.MC", "SOL.MC", "UNI.MC",
]

# =============================================================================
# ITALY - FTSE MIB 40 (Milan Stock Exchange)
# Yahoo Finance format: TICKER.MI
# =============================================================================
ITALY_FTSEMIB_TICKERS = [
    "ENI.MI", "ENEL.MI", "ISP.MI", "UCG.MI", "G.MI", "STM.MI", "TIT.MI",
    "PRY.MI", "SRG.MI", "RACE.MI", "TEN.MI", "AMP.MI", "BMED.MI", "MB.MI",
    "CPR.MI", "BAMI.MI", "SPM.MI", "UNI.MI", "STLA.MI", "A2A.MI", "MONC.MI",
    "FBK.MI", "DIA.MI", "BGN.MI", "NEXI.MI", "PST.MI", "IG.MI", "HER.MI",
    "INW.MI", "SFER.MI", "IP.MI", "REC.MI", "BPSO.MI", "PIA.MI", "AZM.MI",
]

# =============================================================================
# JAPAN - Nikkei 225 Core (Top 50 by Market Cap)
# Yahoo Finance format: CODE.T (Tokyo)
# =============================================================================
JAPAN_NIKKEI_TICKERS = [
    # Mega Cap
    "7203.T", "6758.T", "9984.T", "6861.T", "6902.T", "8306.T", "9432.T",
    "6501.T", "7267.T", "6098.T", "8035.T", "4063.T", "6367.T", "9433.T",
    "8316.T", "7974.T", "4502.T", "4503.T", "4568.T", "6954.T",
    # Large Cap
    "8058.T", "8001.T", "8031.T", "9020.T", "9022.T", "7751.T", "6988.T",
    "7269.T", "4519.T", "4661.T", "6273.T", "6702.T", "4901.T", "8802.T",
    "5108.T", "6503.T", "7201.T", "3382.T", "8766.T", "2914.T",
    # Mid Cap
    "6857.T", "6752.T", "8801.T", "9434.T", "4911.T", "6981.T", "7733.T",
    "7270.T", "8411.T", "2802.T",
]

# =============================================================================
# AUSTRALIA - ASX 50 (Australian Securities Exchange)
# Yahoo Finance format: TICKER.AX
# =============================================================================
AUSTRALIA_ASX50_TICKERS = [
    # Mega Cap
    "BHP.AX", "CBA.AX", "CSL.AX", "NAB.AX", "WBC.AX", "ANZ.AX", "WES.AX",
    "MQG.AX", "FMG.AX", "WDS.AX", "RIO.AX", "TLS.AX", "WOW.AX", "GMG.AX",
    # Large Cap
    "TCL.AX", "STO.AX", "REA.AX", "COL.AX", "ALL.AX", "QBE.AX", "SUN.AX",
    "IAG.AX", "APA.AX", "ORG.AX", "NCM.AX", "JHX.AX", "AMC.AX", "MIN.AX",
    "S32.AX", "XRO.AX", "CPU.AX", "SHL.AX", "ASX.AX", "RMD.AX", "TWE.AX",
    # Mid Cap
    "BXB.AX", "AGL.AX", "MPL.AX", "SCG.AX", "GPT.AX", "DXS.AX", "NST.AX",
    "NHF.AX", "CAR.AX", "EVN.AX", "ORI.AX", "SEK.AX", "ILU.AX", "CTX.AX",
]

# =============================================================================
# CANADA - TSX 60 (Toronto Stock Exchange)
# Yahoo Finance format: TICKER.TO
# =============================================================================
CANADA_TSX60_TICKERS = [
    # Mega Cap
    "RY.TO", "TD.TO", "ENB.TO", "CNR.TO", "BNS.TO", "BMO.TO", "CP.TO", "BCE.TO",
    "CNQ.TO", "TRP.TO", "SU.TO", "CM.TO", "ATD.TO", "MFC.TO", "NTR.TO",
    # Large Cap Financials
    "SLF.TO", "NA.TO", "POW.TO", "GWO.TO", "IFC.TO", "FFH.TO",
    # Energy
    "CVE.TO", "IMO.TO", "PPL.TO", "ARX.TO", "OVV.TO", "TOU.TO", "WCP.TO",
    # Materials
    "ABX.TO", "NEM.TO", "FM.TO", "TECK.TO", "FNV.TO", "WPM.TO", "AEM.TO",
    # Industrials
    "WCN.TO", "TIH.TO", "CAE.TO", "WSP.TO", "TFII.TO",
    # Tech & Telecom
    "SHOP.TO", "CSU.TO", "OTEX.TO", "T.TO", "RCI-B.TO", "QBR-B.TO",
    # Consumer & Healthcare
    "L.TO", "DOL.TO", "MRU.TO", "EMP-A.TO", "GIB-A.TO",
    # REITs
    "BAM.TO", "BN.TO", "BIP-UN.TO", "BEP-UN.TO",
]

# =============================================================================
# HONG KONG - Hang Seng (Top Companies - excluding mainland China-focused)
# Yahoo Finance format: CODE.HK
# =============================================================================
HONGKONG_HANGSENG_TICKERS = [
    # Financials (HK-focused)
    "0005.HK", "0011.HK", "0388.HK", "2388.HK", "0023.HK", "0017.HK",
    # Property (HK)
    "0016.HK", "0001.HK", "0012.HK", "0004.HK", "0083.HK",
    # Utilities & Conglomerates
    "0002.HK", "0003.HK", "0006.HK", "0019.HK", "0066.HK", "0027.HK",
    # Consumer & Retail
    "0941.HK", "0992.HK", "1038.HK", "0762.HK", "0883.HK",
]

# =============================================================================
# COMBINED REGIONAL LISTS
# =============================================================================
EUROPE_TICKERS = (
    UK_FTSE100_TICKERS +
    GERMANY_DAX40_TICKERS +
    FRANCE_CAC40_TICKERS +
    SWITZERLAND_SMI_TICKERS +
    NETHERLANDS_AEX_TICKERS +
    SPAIN_IBEX35_TICKERS +
    ITALY_FTSEMIB_TICKERS
)

ASIA_PACIFIC_TICKERS = (
    JAPAN_NIKKEI_TICKERS +
    AUSTRALIA_ASX50_TICKERS +
    HONGKONG_HANGSENG_TICKERS
)

CANADA_TICKERS = CANADA_TSX60_TICKERS

# Indonesian IDX stocks - Top companies by market cap
INDONESIA_TICKERS = [
    # Top 50 by market cap (most important)
    "BREN.JK", "BBCA.JK", "DSSA.JK", "TPIA.JK", "DCII.JK", "BBRI.JK", "BYAN.JK", "AMMN.JK", "BMRI.JK", "TLKM.JK",
    "BRPT.JK", "CUAN.JK", "ASII.JK", "PANI.JK", "CDIA.JK", "SRAJ.JK", "BNLI.JK", "IMPC.JK", "BBNI.JK", "MORA.JK",
    "RISE.JK", "BRMS.JK", "MLPT.JK", "DNET.JK", "BRIS.JK", "UNVR.JK", "ICBP.JK", "UNTR.JK", "PTRO.JK", "HMSP.JK",
    "MPRO.JK", "BUMI.JK", "SMMA.JK", "FILM.JK", "CPIN.JK", "AMRT.JK", "EMTK.JK", "ISAT.JK", "PGUN.JK", "ANTM.JK",
    "GOTO.JK", "CASA.JK", "INDF.JK", "MBMA.JK", "NCKL.JK", "BELI.JK", "AADI.JK", "MDKA.JK", "KLBF.JK", "ADRO.JK",
    # 51-100
    "ADMR.JK", "GEMS.JK", "COIN.JK", "PGEO.JK", "SUPR.JK", "MTEL.JK", "CMRY.JK", "EXCL.JK", "MYOR.JK", "BNGA.JK",
    "TBIG.JK", "INKP.JK", "PGAS.JK", "INCO.JK", "MEGA.JK", "CBDK.JK", "TCPI.JK", "MIKA.JK", "TAPG.JK", "BUVA.JK",
    "MEDC.JK", "BBHI.JK", "NISP.JK", "SILO.JK", "TOWR.JK", "JARR.JK", "GGRM.JK", "ARCI.JK", "AVIA.JK", "RATU.JK",
    "JPFA.JK", "ARTO.JK", "BINA.JK", "PTBA.JK", "MDIY.JK", "ENRG.JK", "MSIN.JK", "JSMR.JK", "PNBN.JK", "ITMG.JK",
    "AKRA.JK", "SCMA.JK", "BDMN.JK", "TINS.JK", "INTP.JK", "RAJA.JK", "MKPI.JK", "BTPN.JK", "TKIM.JK", "HEAL.JK",
    # 101-150
    "VKTR.JK", "FAPA.JK", "MAPI.JK", "SRTG.JK", "BKSL.JK", "MAPA.JK", "SOHO.JK", "WIFI.JK", "BSDE.JK", "LIFE.JK",
    "FASW.JK", "BUKA.JK", "POLU.JK", "SMGR.JK", "DSNG.JK", "BSIM.JK", "PWON.JK", "DEWA.JK", "BBTN.JK", "CITA.JK",
    "SIDO.JK", "CTRA.JK", "ULTJ.JK", "BNII.JK", "SSMS.JK", "RMKE.JK", "AALI.JK", "STAA.JK", "APIC.JK", "SMAR.JK",
    "BBSI.JK", "BANK.JK", "PSAB.JK", "SHIP.JK", "BBKP.JK", "GOOD.JK", "YUPI.JK", "MCOL.JK", "KPIG.JK", "CMNT.JK",
    "SGRO.JK", "JRPT.JK", "HRUM.JK", "STTP.JK", "MIDI.JK", "CARE.JK", "TSPC.JK", "AUTO.JK", "BMAS.JK", "NSSS.JK",
    # 151-200
    "CLEO.JK", "PRAY.JK", "MLBI.JK", "ARKO.JK", "NICL.JK", "BFIN.JK", "POWR.JK", "ADMF.JK", "ESSA.JK", "BTPS.JK",
    "BSSR.JK", "SMSM.JK", "ALII.JK", "CYBR.JK", "EDGE.JK", "SIMP.JK", "CNMA.JK", "GIAA.JK", "TLDN.JK", "LSIP.JK",
    "MFIN.JK", "INDY.JK", "LINK.JK", "ADES.JK", "CMNP.JK", "PLIN.JK", "JSPT.JK", "BJBR.JK", "SSIA.JK", "BJTM.JK",
    "BNBR.JK", "ABMM.JK", "PNLF.JK", "BBMD.JK", "DUTI.JK", "KRAS.JK", "INPP.JK", "MTDL.JK", "TMAS.JK", "ACES.JK",
    "BHAT.JK", "SAME.JK", "TOBA.JK", "SGER.JK", "NIRO.JK", "FISH.JK", "CLAY.JK", "HRTA.JK", "ERAA.JK", "MAYA.JK",
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


def fetch_stock_data(ticker, region='US', retry_count=0):
    """Fetch comprehensive data for a single stock from Yahoo Finance with retry logic"""
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

        # Get YTD return - Calculate from historical data for accuracy
        ytd_return = None
        try:
            # Get start of year
            year_start = date(date.today().year, 1, 1)
            hist = stock.history(start=year_start, end=date.today())
            if not hist.empty and len(hist) > 1:
                start_price = hist['Close'].iloc[0]
                current_price = hist['Close'].iloc[-1]
                if start_price and start_price > 0:
                    ytd_return = ((current_price - start_price) / start_price) * 100
        except Exception as ytd_err:
            # Fallback to 52WeekChange if historical data fails
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
        error_str = str(e)
        # Check for rate limiting (429 error)
        if '429' in error_str and retry_count < MAX_RETRIES:
            backoff = min(BASE_DELAY * (2 ** retry_count) + random.uniform(0, 2), MAX_BACKOFF)
            print(f"  ⏳ Rate limited on {ticker}, waiting {backoff:.1f}s (retry {retry_count + 1}/{MAX_RETRIES})")
            time.sleep(backoff)
            return fetch_stock_data(ticker, region, retry_count + 1)
        print(f"  ❌ Error fetching {ticker}: {error_str[:50]}")
        return None


def fetch_batch_data(tickers, region='US', batch_size=3, delay=20):
    """Fetch data for multiple stocks with aggressive rate limiting"""
    results = []
    total = len(tickers)
    consecutive_errors = 0

    print(f"\n📊 Fetching {total} {region} stocks...")

    for i in range(0, total, batch_size):
        batch = tickers[i:i+batch_size]
        batch_num = i//batch_size + 1
        total_batches = (total-1)//batch_size + 1
        print(f"  Processing batch {batch_num}/{total_batches}: {', '.join(batch[:5])}...")

        # Sequential fetching to avoid rate limits
        for ticker in batch:
            try:
                # Add random jitter between requests
                jitter = random.uniform(1.5, 3.5)
                time.sleep(jitter)

                result = fetch_stock_data(ticker, region)
                if result:
                    results.append(result)
                    consecutive_errors = 0
                else:
                    consecutive_errors += 1
            except Exception as e:
                print(f"  ❌ Error fetching {ticker}: {str(e)[:50]}")
                consecutive_errors += 1

        # If too many consecutive errors, increase delay
        if consecutive_errors > 5:
            extended_delay = delay * 2 + random.uniform(0, 10)
            print(f"  ⚠️ Multiple errors, extended wait: {extended_delay:.1f}s")
            time.sleep(extended_delay)
            consecutive_errors = 0

        # Longer delay between batches with randomization
        if i + batch_size < total:
            actual_delay = delay + random.uniform(0, 8)
            print(f"  ⏳ Waiting {actual_delay:.1f}s (batch {batch_num}/{total_batches} done, {len(results)} stocks fetched)")
            time.sleep(actual_delay)

    print(f"  ✅ Successfully fetched {len(results)}/{total} {region} stocks")
    return results


def save_progress(data, output_path='public/global_companies_full.json'):
    """Save current data to file (for incremental progress)"""
    # Remove duplicates by ticker
    seen = set()
    unique_data = []
    for d in data:
        if d['Ticker'] not in seen:
            seen.add(d['Ticker'])
            unique_data.append(d)
    # Sort by market cap
    unique_data.sort(key=lambda x: x.get('Market Cap', 0) or 0, reverse=True)
    with open(output_path, 'w') as f:
        json.dump(unique_data, f, indent=2)
    return unique_data


def main():
    """Main function to fetch all data and update JSON"""
    print("=" * 60)
    print("Global Equity Screener - Data Fetcher")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Load existing data to preserve US and Indonesia stocks
    output_path = 'public/global_companies_full.json'
    try:
        with open(output_path, 'r') as f:
            existing_data = json.load(f)
        print(f"📂 Loaded {len(existing_data)} existing stocks")
        # Filter to keep only US and Indonesia data (already fetched)
        all_data = [d for d in existing_data if d.get('Region') in ['US', 'Indonesia']]
        print(f"   Keeping {len(all_data)} US/Indonesia stocks from cache")
    except FileNotFoundError:
        print("📂 No existing data found, starting fresh")
        all_data = []
        # Fetch US data since no cache exists
        unique_sp500 = list(dict.fromkeys(SP500_TICKERS))
        sp500_data = fetch_batch_data(unique_sp500, region='US', batch_size=3, delay=25)
        all_data.extend(sp500_data)
        # Fetch Indonesia data
        unique_indo = list(dict.fromkeys(INDONESIA_TICKERS))
        indo_data = fetch_batch_data(unique_indo, region='Indonesia', batch_size=3, delay=25)
        all_data.extend(indo_data)

    print("\n🌍 Now fetching NEW global markets...")
    print("   Using conservative rate limiting to avoid blocks...")

    # Longer delays to avoid rate limiting (45s between batches)
    BATCH_SIZE = 2
    BATCH_DELAY = 45

    # ==========================================================================
    # 3. UNITED KINGDOM - FTSE 100
    # ==========================================================================
    unique_uk = list(dict.fromkeys(UK_FTSE100_TICKERS))
    uk_data = fetch_batch_data(unique_uk, region='UK', batch_size=BATCH_SIZE, delay=BATCH_DELAY)
    all_data.extend(uk_data)
    save_progress(all_data)
    print("   💾 Progress saved after UK")
    time.sleep(60)  # Extra pause between regions

    # ==========================================================================
    # 4. GERMANY - DAX 40
    # ==========================================================================
    unique_germany = list(dict.fromkeys(GERMANY_DAX40_TICKERS))
    germany_data = fetch_batch_data(unique_germany, region='Germany', batch_size=BATCH_SIZE, delay=BATCH_DELAY)
    all_data.extend(germany_data)
    save_progress(all_data)
    print("   💾 Progress saved after Germany")
    time.sleep(60)

    # ==========================================================================
    # 5. FRANCE - CAC 40
    # ==========================================================================
    unique_france = list(dict.fromkeys(FRANCE_CAC40_TICKERS))
    france_data = fetch_batch_data(unique_france, region='France', batch_size=BATCH_SIZE, delay=BATCH_DELAY)
    all_data.extend(france_data)
    save_progress(all_data)
    print("   💾 Progress saved after France")
    time.sleep(60)

    # ==========================================================================
    # 6. SWITZERLAND - SMI 20
    # ==========================================================================
    unique_swiss = list(dict.fromkeys(SWITZERLAND_SMI_TICKERS))
    swiss_data = fetch_batch_data(unique_swiss, region='Switzerland', batch_size=BATCH_SIZE, delay=BATCH_DELAY)
    all_data.extend(swiss_data)
    save_progress(all_data)
    print("   💾 Progress saved after Switzerland")
    time.sleep(60)

    # ==========================================================================
    # 7. NETHERLANDS - AEX 25
    # ==========================================================================
    unique_nl = list(dict.fromkeys(NETHERLANDS_AEX_TICKERS))
    nl_data = fetch_batch_data(unique_nl, region='Netherlands', batch_size=BATCH_SIZE, delay=BATCH_DELAY)
    all_data.extend(nl_data)
    save_progress(all_data)
    print("   💾 Progress saved after Netherlands")
    time.sleep(60)

    # ==========================================================================
    # 8. SPAIN - IBEX 35
    # ==========================================================================
    unique_spain = list(dict.fromkeys(SPAIN_IBEX35_TICKERS))
    spain_data = fetch_batch_data(unique_spain, region='Spain', batch_size=BATCH_SIZE, delay=BATCH_DELAY)
    all_data.extend(spain_data)
    save_progress(all_data)
    print("   💾 Progress saved after Spain")
    time.sleep(60)

    # ==========================================================================
    # 9. ITALY - FTSE MIB 40
    # ==========================================================================
    unique_italy = list(dict.fromkeys(ITALY_FTSEMIB_TICKERS))
    italy_data = fetch_batch_data(unique_italy, region='Italy', batch_size=BATCH_SIZE, delay=BATCH_DELAY)
    all_data.extend(italy_data)
    save_progress(all_data)
    print("   💾 Progress saved after Italy")
    time.sleep(60)

    # ==========================================================================
    # 10. JAPAN - Nikkei 225 Core
    # ==========================================================================
    unique_japan = list(dict.fromkeys(JAPAN_NIKKEI_TICKERS))
    japan_data = fetch_batch_data(unique_japan, region='Japan', batch_size=BATCH_SIZE, delay=BATCH_DELAY)
    all_data.extend(japan_data)
    save_progress(all_data)
    print("   💾 Progress saved after Japan")
    time.sleep(60)

    # ==========================================================================
    # 11. AUSTRALIA - ASX 50
    # ==========================================================================
    unique_aus = list(dict.fromkeys(AUSTRALIA_ASX50_TICKERS))
    aus_data = fetch_batch_data(unique_aus, region='Australia', batch_size=BATCH_SIZE, delay=BATCH_DELAY)
    all_data.extend(aus_data)
    save_progress(all_data)
    print("   💾 Progress saved after Australia")
    time.sleep(60)

    # ==========================================================================
    # 12. CANADA - TSX 60
    # ==========================================================================
    unique_canada = list(dict.fromkeys(CANADA_TSX60_TICKERS))
    canada_data = fetch_batch_data(unique_canada, region='Canada', batch_size=BATCH_SIZE, delay=BATCH_DELAY)
    all_data.extend(canada_data)
    save_progress(all_data)
    print("   💾 Progress saved after Canada")
    time.sleep(60)

    # ==========================================================================
    # 13. HONG KONG - Hang Seng (HK-focused companies only)
    # ==========================================================================
    unique_hk = list(dict.fromkeys(HONGKONG_HANGSENG_TICKERS))
    hk_data = fetch_batch_data(unique_hk, region='Hong Kong', batch_size=BATCH_SIZE, delay=BATCH_DELAY)
    all_data.extend(hk_data)

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
