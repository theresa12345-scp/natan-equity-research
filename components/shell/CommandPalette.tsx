"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { COMMAND_TARGETS } from "@/lib/command-targets";

const FUNCTIONS: Array<{ label: string; href: string; keywords: string[] }> = [
  { label: "Daily Brief · morning digest", href: "/brief", keywords: ["brief", "daily", "morning", "spark"] },
  { label: "Catalyst Calendar · 30d forward", href: "/calendar", keywords: ["calendar", "catalyst", "events", "earnings", "fed", "bi-rate"] },
  { label: "Markets · IDX overview", href: "/markets", keywords: ["markets", "mkts", "ihsg"] },
  { label: "Portfolio · hypothetical tracking", href: "/idx/portfolio", keywords: ["portfolio", "port", "holdings"] },
  { label: "Screener · multi-factor", href: "/screener", keywords: ["screener", "scrn", "screen"] },
  { label: "Research · CPCV / DSR", href: "/research", keywords: ["research", "qres", "cpcv"] },
  { label: "Risk · stress + factor exposure", href: "/risk", keywords: ["risk", "stress", "var"] },
  { label: "Backtest · strategy workbench", href: "/backtest", keywords: ["backtest", "strategy", "cpcv", "dsr"] },
];

const SCENARIOS: Array<{ label: string; href: string; keywords: string[] }> = [
  { label: "Stress · 2008 GFC −38%", href: "/risk?scenario=2008-gfc", keywords: ["2008", "gfc", "lehman"] },
  { label: "Stress · 2013 Taper Tantrum", href: "/risk?scenario=2013-taper", keywords: ["2013", "taper", "tantrum"] },
  { label: "Stress · IDR −10% vs USD", href: "/risk?scenario=idr-shock", keywords: ["idr", "rupiah", "shock"] },
  { label: "Stress · BI Rate +200bp", href: "/risk?scenario=birate-up", keywords: ["bi", "rate", "hike"] },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps): JSX.Element | null {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  function go(href: string): void {
    onClose();
    router.push(href);
  }

  if (!open) return null;

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 110,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        style={{
          position: "fixed",
          top: "20vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: 580,
          maxWidth: "calc(100vw - 32px)",
          background: "#000",
          border: "1px solid #ff2e88",
          zIndex: 111,
          padding: 0,
        }}
      >
        <Command label="Command palette" loop>
          <div
            className="flex items-center"
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid #2a2a2a",
              gap: 8,
            }}
          >
            <span
              className="num"
              style={{
                color: "#ff2e88",
                fontSize: 13,
                userSelect: "none",
              }}
              aria-hidden="true"
            >
              &gt;
            </span>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="type ticker, function, or stress scenario…"
              className="num placeholder:text-[#555]"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f5f5f5",
                fontSize: 13,
                padding: 0,
              }}
            />
            <span
              className="num"
              style={{
                fontSize: 9,
                color: "#666",
                border: "1px solid #2a2a2a",
                padding: "1px 5px",
              }}
            >
              ESC
            </span>
          </div>

          <Command.List
            style={{
              maxHeight: 420,
              overflow: "auto",
              padding: "6px 0",
            }}
          >
            <Command.Empty
              style={{
                padding: "14px 16px",
                color: "#7a7a7a",
                fontSize: 11,
              }}
            >
              No matches.
            </Command.Empty>

            <Command.Group
              heading="Tickers"
              style={{
                fontSize: 9,
                color: "#666",
                letterSpacing: "0.14em",
                padding: "8px 14px 4px",
                textTransform: "uppercase",
              }}
            >
              {COMMAND_TARGETS.map((t) => (
                <Command.Item
                  key={`tk-${t.ticker}`}
                  value={`${t.ticker} ${t.name} ${(t.aliases ?? []).join(" ")}`}
                  onSelect={() => go(t.href)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr auto",
                    gap: 10,
                    padding: "7px 16px",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  <span className="num" style={{ color: "#ff2e88", fontWeight: 500 }}>
                    {t.ticker}
                  </span>
                  <span style={{ color: "#d8d8d8" }}>{t.name}</span>
                  <span
                    className="num"
                    style={{ color: "#666", fontSize: 9.5, letterSpacing: "0.08em" }}
                  >
                    {t.exchange}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group
              heading="Functions"
              style={{
                fontSize: 9,
                color: "#666",
                letterSpacing: "0.14em",
                padding: "8px 14px 4px",
                textTransform: "uppercase",
              }}
            >
              {FUNCTIONS.map((f) => (
                <Command.Item
                  key={`fn-${f.href}`}
                  value={`${f.label} ${f.keywords.join(" ")}`}
                  onSelect={() => go(f.href)}
                  style={{
                    padding: "7px 16px",
                    fontSize: 11,
                    cursor: "pointer",
                    color: "#d8d8d8",
                  }}
                >
                  {f.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group
              heading="Stress Scenarios"
              style={{
                fontSize: 9,
                color: "#666",
                letterSpacing: "0.14em",
                padding: "8px 14px 4px",
                textTransform: "uppercase",
              }}
            >
              {SCENARIOS.map((s) => (
                <Command.Item
                  key={`sc-${s.href}`}
                  value={`${s.label} ${s.keywords.join(" ")}`}
                  onSelect={() => go(s.href)}
                  style={{
                    padding: "7px 16px",
                    fontSize: 11,
                    cursor: "pointer",
                    color: "#d8d8d8",
                  }}
                >
                  {s.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
      <style>{`
        [cmdk-item][data-selected="true"] {
          background: rgba(255, 46, 136, 0.08);
          border-left: 2px solid #ff2e88;
          padding-left: 14px !important;
        }
        [cmdk-group-heading] {
          font-family: var(--font-geist-sans);
        }
      `}</style>
    </>
  );
}
