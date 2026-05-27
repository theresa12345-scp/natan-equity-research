"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "meridian:watchlist:v1";

export interface WatchlistItem {
  ticker: string;
  region: "IDX" | "US";
  addedAt: number;
}

function readStorage(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WatchlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items: WatchlistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("meridian:watchlist-changed"));
  } catch {
    // quota exceeded / private mode — ignore
  }
}

export function useWatchlist(): {
  items: WatchlistItem[];
  has: (ticker: string) => boolean;
  toggle: (ticker: string, region: "IDX" | "US") => void;
  remove: (ticker: string) => void;
  clear: () => void;
} {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    setItems(readStorage());
    function onChange(): void {
      setItems(readStorage());
    }
    window.addEventListener("meridian:watchlist-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("meridian:watchlist-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const has = useCallback(
    (ticker: string): boolean => items.some((i) => i.ticker === ticker),
    [items],
  );

  const toggle = useCallback((ticker: string, region: "IDX" | "US"): void => {
    const upper = ticker.toUpperCase();
    const current = readStorage();
    const exists = current.some((i) => i.ticker === upper);
    const next = exists
      ? current.filter((i) => i.ticker !== upper)
      : [...current, { ticker: upper, region, addedAt: Date.now() }];
    writeStorage(next);
    setItems(next);
  }, []);

  const remove = useCallback((ticker: string): void => {
    const upper = ticker.toUpperCase();
    const next = readStorage().filter((i) => i.ticker !== upper);
    writeStorage(next);
    setItems(next);
  }, []);

  const clear = useCallback((): void => {
    writeStorage([]);
    setItems([]);
  }, []);

  return { items, has, toggle, remove, clear };
}
