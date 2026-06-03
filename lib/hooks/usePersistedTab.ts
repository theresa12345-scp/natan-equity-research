"use client";

import { useEffect, useState } from "react";

// Persist the active tab key per logical scope (e.g., per-ticker).
// Hydration-safe: initial render uses defaultKey, then we promote to the
// stored value after mount. SSR + first paint look identical so no flash.
export function usePersistedTab(
  scopeKey: string,
  defaultKey: string,
): [string, (k: string) => void] {
  const [active, setActive] = useState(defaultKey);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(`mrdn:tab:${scopeKey}`);
      if (stored) setActive(stored);
    } catch {
      /* private mode / disabled storage — silently ignore */
    }
  }, [scopeKey]);

  function update(k: string): void {
    setActive(k);
    try {
      window.localStorage.setItem(`mrdn:tab:${scopeKey}`, k);
    } catch {
      /* ignore */
    }
  }

  return [active, update];
}
