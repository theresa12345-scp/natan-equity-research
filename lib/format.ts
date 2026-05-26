import type { Currency } from "./types";

const idr = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const usd = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const usdCompact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const idrCompact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatIDR(value: number): string {
  return `Rp ${idr.format(Math.round(value))}`;
}

export function formatUSD(value: number): string {
  return `$${usd.format(value)}`;
}

export function formatPrice(value: number, currency: Currency): string {
  return currency === "IDR" ? formatIDR(value) : formatUSD(value);
}

export function formatPercent(value: number, digits: number = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatPercentPlain(value: number, digits: number = 2): string {
  return `${value.toFixed(digits)}%`;
}

export function formatBp(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${Math.round(value)}bp`;
}

export function formatCompact(value: number, currency: Currency): string {
  if (currency === "IDR") return `Rp ${idrCompact.format(value)}`;
  return `$${usdCompact.format(value)}`;
}

export function formatMarketCap(value: number, currency: Currency): string {
  return formatCompact(value, currency);
}
