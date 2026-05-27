"use client";

import { useState } from "react";
import Link from "next/link";
import { useWatchlist } from "@/lib/watchlist";

export default function WatchlistChip(): JSX.Element | null {
  const { items, remove, clear } = useWatchlist();
  const [open, setOpen] = useState<boolean>(false);

  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 56, // sit above the 44px StatusBar
        left: 12,
        zIndex: 90,
      }}
    >
      {open ? (
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 0,
            minWidth: 280,
            maxWidth: 340,
            background: "#000",
            border: "1px solid #ff2e88",
            padding: 0,
          }}
          role="dialog"
          aria-label="Watchlist"
        >
          <div
            className="flex items-center"
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid #2a2a2a",
              background: "#050505",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 9.5,
                color: "#ff2e88",
                letterSpacing: "0.14em",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Watchlist · {items.length}
            </span>
            <button
              type="button"
              onClick={clear}
              className="ml-auto hover:brightness-125"
              style={{
                background: "transparent",
                border: "1px solid #2a2a2a",
                color: "#7a7a7a",
                fontSize: 9,
                padding: "2px 6px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                background: "transparent",
                border: "1px solid #ff2e88",
                color: "#ff2e88",
                fontSize: 11,
                lineHeight: 1,
                width: 20,
                height: 20,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {items.map((it) => (
              <div
                key={it.ticker}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "70px 1fr 18px",
                  height: 26,
                  padding: "0 10px",
                  borderBottom: "1px solid #111",
                  gap: 6,
                }}
              >
                <Link
                  href={`/${it.region.toLowerCase()}/${it.ticker.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="num hover:underline"
                  style={{
                    color: "#ff2e88",
                    fontWeight: 500,
                    fontSize: 11,
                    textDecorationColor: "#ff2e88",
                    textUnderlineOffset: 2,
                  }}
                >
                  {it.ticker}
                </Link>
                <span
                  className="num"
                  style={{ fontSize: 9.5, color: "#666", letterSpacing: "0.06em" }}
                >
                  {it.region}
                </span>
                <button
                  type="button"
                  onClick={() => remove(it.ticker)}
                  aria-label={`Remove ${it.ticker}`}
                  className="hover:brightness-125"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    fontSize: 12,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {items.length >= 2 ? (
            <Link
              href={`/compare?tickers=${items.map((i) => i.ticker).join(",")}`}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "8px 10px",
                background: "#ff2e88",
                color: "#000",
                fontSize: 10,
                letterSpacing: "0.1em",
                fontWeight: 700,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              Compare these ({items.length}) →
            </Link>
          ) : (
            <div
              style={{
                padding: "8px 10px",
                background: "#0a0a0a",
                fontSize: 9.5,
                color: "#7a7a7a",
                letterSpacing: "0.08em",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Add one more to compare
            </div>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Watchlist · ${items.length} items`}
        aria-expanded={open}
        className="num hover:brightness-110"
        style={{
          background: "#000",
          border: "1px solid #ff2e88",
          color: "#ff2e88",
          padding: "5px 12px",
          fontSize: 11,
          letterSpacing: "0.08em",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 600,
        }}
      >
        <span aria-hidden="true">★</span>
        WATCH · {items.length}
      </button>
    </div>
  );
}
