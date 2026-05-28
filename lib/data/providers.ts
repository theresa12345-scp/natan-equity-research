// Provider abstraction layer — the playbook's "#1 architectural lever".
//
// Pattern: every data class (price / fundamentals / macro / news) has a
// typed interface. Each provider implements the interface; a router
// picks the first available one and falls back to the next on
// rate-limit / 5xx / parse error. Counters fed into /sources page so
// reviewers can see real-time provider health.
//
// This file declares the pattern. Concrete provider implementations
// (yfinance, Finnhub, EDGAR, FRED, IDX-Surface, BPS) will land as
// lib/data/fetchers/*.ts when wired.

import { SOURCES, type SourceRecord, type SourceStatus } from "./sources";

export type DataClass =
  | "price-eod" // daily OHLC
  | "fundamentals-quarterly"
  | "filings-us"
  | "filings-id"
  | "macro-us"
  | "macro-id"
  | "news-firehose"
  | "factor-loadings"
  | "treasury-rates"
  | "country-risk";

// Each provider implements a subset of data classes.
export interface ProviderCapability {
  providerId: string; // matches SourceRecord.id
  dataClass: DataClass;
  priority: number; // lower = preferred
  status: SourceStatus;
  notes?: string;
}

// Fallback chain by data class — order = preference. Each entry must
// match a SOURCES.id. Add a new provider by extending this map; router
// reads top-down until one returns.
export const FALLBACK_CHAIN: Record<DataClass, string[]> = {
  "price-eod": ["yfinance", "stooq", "finnhub-free", "twelvedata-free"],
  "fundamentals-quarterly": ["sec-edgar", "openbb", "fmp-free", "alphavantage-free"],
  "filings-us": ["sec-edgar", "sec-edgar-fts", "sec-edgar-rss"],
  "filings-id": ["idx-ixbrl", "idx-filings", "idx-monthly-ratio"],
  "macro-us": ["fred", "fiscaldata", "world-bank"],
  "macro-id": ["bps", "bi-stats", "ojk-stats"],
  "news-firehose": ["gdelt", "newsapi", "finnhub-free"],
  "factor-loadings": ["ken-french", "aqr"],
  "treasury-rates": ["fiscaldata", "fred"],
  "country-risk": ["damodaran"],
};

// Per-provider rate-limit + sustainability metadata (drives router).
export interface ProviderHealth {
  providerId: string;
  status: SourceStatus;
  reqPerSec?: number;
  reqPerDay?: number;
  lastError?: string;
  lastSuccess?: string;
}

// Lookup helper — given a data class, return ordered provider records.
export function providersFor(dc: DataClass): SourceRecord[] {
  const ids = FALLBACK_CHAIN[dc] ?? [];
  return ids
    .map((id) => SOURCES.find((s) => s.id === id))
    .filter((s): s is SourceRecord => s != null);
}

// Render-time helper: data class summary card for /sources.
export interface DataClassSummary {
  dataClass: DataClass;
  label: string;
  description: string;
  primary: SourceRecord | null;
  fallback: SourceRecord[];
  primaryStatus: SourceStatus;
}

export const DATA_CLASS_LABELS: Record<DataClass, string> = {
  "price-eod": "Price · EOD OHLC",
  "fundamentals-quarterly": "Fundamentals · Quarterly",
  "filings-us": "Filings · SEC EDGAR",
  "filings-id": "Filings · IDX",
  "macro-us": "Macro · United States",
  "macro-id": "Macro · Indonesia",
  "news-firehose": "News · Firehose",
  "factor-loadings": "Factor loadings · academic",
  "treasury-rates": "Treasury rates",
  "country-risk": "Country risk premia",
};

export const DATA_CLASS_DESCRIPTIONS: Record<DataClass, string> = {
  "price-eod":
    "Daily OHLC for US + IDX universes. Cache 60s on quotes, 24h on EOD bars.",
  "fundamentals-quarterly":
    "Quarterly financials per ticker. EDGAR XBRL companyfacts = primary truth for US; IDX iXBRL for ID.",
  "filings-us":
    "10-K / 10-Q / 8-K / 13F / Form 4 / S-1 — all canonical via EDGAR with mandatory UA header.",
  "filings-id":
    "IDX listed-company financial statements + iXBRL — mandatory since Nov 2 2015.",
  "macro-us":
    "Yield curve, CPI, unemployment, HY OAS, jobless claims, payrolls — FRED API v2.",
  "macro-id":
    "BI-Rate, JISDOR, CPI, GDP, IBS, trade, Sakernas labour — BPS + BI.",
  "news-firehose":
    "Headline + sentiment firehose. GDELT 2.0 every 15 min in 100+ languages.",
  "factor-loadings":
    "Fama-French 3F/5F + Momentum monthly factors — Ken French data library.",
  "treasury-rates":
    "Daily UST curve + auction results — Treasury FiscalData (free, no key).",
  "country-risk":
    "Damodaran annual update — ERPs, betas, country risk premia.",
};

export function dataClassSummary(dc: DataClass): DataClassSummary {
  const providers = providersFor(dc);
  const primary = providers[0] ?? null;
  return {
    dataClass: dc,
    label: DATA_CLASS_LABELS[dc],
    description: DATA_CLASS_DESCRIPTIONS[dc],
    primary,
    fallback: providers.slice(1),
    primaryStatus: primary?.status ?? "planned",
  };
}

export const ALL_DATA_CLASSES: DataClass[] = Object.keys(
  DATA_CLASS_LABELS,
) as DataClass[];
