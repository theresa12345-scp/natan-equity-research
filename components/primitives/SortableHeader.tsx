"use client";

import { useEffect, useState, type MouseEvent } from "react";

export type SortDir = "asc" | "desc";
export interface SortEntry {
  key: string;
  dir: SortDir;
  priority: number;
}

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  align?: "left" | "right";
  sort: SortEntry[];
  onSort: (next: SortEntry[]) => void;
}

export function SortableHeader({
  label,
  sortKey,
  align = "right",
  sort,
  onSort,
}: SortableHeaderProps): JSX.Element {
  const entry = sort.find((s) => s.key === sortKey);
  const dir = entry?.dir;
  const priority = entry?.priority;

  function handleClick(e: MouseEvent<HTMLButtonElement>): void {
    const shift = e.shiftKey;
    let next: SortEntry[];

    if (!entry) {
      // Add new
      if (shift) {
        next = [
          ...sort,
          { key: sortKey, dir: "desc" as SortDir, priority: sort.length + 1 },
        ];
      } else {
        next = [{ key: sortKey, dir: "desc" as SortDir, priority: 1 }];
      }
    } else if (entry.dir === "desc") {
      next = sort.map((s) => (s.key === sortKey ? { ...s, dir: "asc" as SortDir } : s));
    } else {
      // Remove
      const filtered = sort.filter((s) => s.key !== sortKey);
      next = filtered.map((s, i) => ({ ...s, priority: i + 1 }));
    }

    onSort(next);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="hover:text-[#f5f5f5]"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "transparent",
        border: "none",
        padding: 0,
        textAlign: align,
        justifyContent: align === "right" ? "flex-end" : "flex-start",
        fontSize: 9,
        color: entry ? "#ff2e88" : "#555",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontWeight: 500,
        cursor: "pointer",
        whiteSpace: "nowrap",
        width: "100%",
      }}
    >
      {label}
      {dir ? (
        <span style={{ fontSize: 9, color: "#ff2e88" }}>
          {dir === "desc" ? "▼" : "▲"}
        </span>
      ) : null}
      {priority && sort.length > 1 ? (
        <span
          className="num"
          style={{
            fontSize: 8,
            color: "#ff2e88",
            border: "1px solid #ff2e88",
            padding: "0 3px",
            lineHeight: 1.2,
          }}
        >
          {priority}
        </span>
      ) : null}
    </button>
  );
}

export function applySort<T extends Record<string, unknown>>(
  rows: T[],
  sort: SortEntry[],
): T[] {
  if (sort.length === 0) return rows;
  const sorted = [...rows];
  sorted.sort((a, b) => {
    for (const s of sort) {
      const av = a[s.key];
      const bv = b[s.key];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        const as = String(av ?? "");
        const bs = String(bv ?? "");
        cmp = as.localeCompare(bs);
      }
      if (cmp !== 0) return s.dir === "asc" ? cmp : -cmp;
    }
    return 0;
  });
  return sorted;
}

export function useSortState(initial: SortEntry[] = []): [
  SortEntry[],
  (next: SortEntry[]) => void,
] {
  const [sort, setSort] = useState<SortEntry[]>(initial);
  useEffect(() => {
    // sync to URL search params for shareable links
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (sort.length === 0) {
      params.delete("sort");
    } else {
      params.set("sort", sort.map((s) => `${s.key}:${s.dir}`).join(","));
    }
    const newSearch = params.toString();
    const nextUrl =
      window.location.pathname + (newSearch ? `?${newSearch}` : "");
    window.history.replaceState(null, "", nextUrl);
  }, [sort]);
  return [sort, setSort];
}
