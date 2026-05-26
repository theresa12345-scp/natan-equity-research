"use client";

import { useState, useMemo } from "react";
import { CALENDAR_EVENTS, eventsByDate, type CalendarEvent } from "@/lib/mock-calendar";
import TickerLink from "@/components/primitives/TickerLink";

function PanelHead({ title, meta, right }: { title: string; meta?: string; right?: React.ReactNode }): JSX.Element {
  return (
    <div className="flex items-center" style={{ height: 28, padding: "0 12px", borderBottom: "1px solid #1d1d1d", background: "#050505", gap: 10 }}>
      <span style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase" }}>{title}</span>
      {meta ? <span style={{ fontSize: 10, color: "#7a7a7a" }}>{meta}</span> : null}
      {right ? <div className="ml-auto">{right}</div> : null}
    </div>
  );
}

function impactColor(impact: CalendarEvent["impact"]): string {
  if (impact === "high") return "#ff2e88";
  if (impact === "medium") return "#c4831f";
  return "#7a7a7a";
}

function regionColor(region: CalendarEvent["region"]): string {
  if (region === "US") return "#5ec4e0";
  if (region === "IDX") return "#ff2e88";
  return "#7a7a7a";
}

function categoryGlyph(category: CalendarEvent["category"]): string {
  if (category === "Macro") return "◆";
  if (category === "Earnings") return "■";
  if (category === "Regulatory") return "▲";
  if (category === "Policy") return "★";
  if (category === "Index") return "●";
  return "·";
}

function fmtDayHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${days[d.getUTCDay()]} · ${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function CalendarPage(): JSX.Element {
  const [region, setRegion] = useState<"all" | "US" | "IDX" | "GLOBAL">("all");
  const [category, setCategory] = useState<"all" | CalendarEvent["category"]>("all");
  const [impact, setImpact] = useState<"all" | "high" | "medium" | "low">("all");
  const [window, setWindow] = useState<"7d" | "14d" | "30d">("30d");

  const filtered = useMemo(() => {
    let out = CALENDAR_EVENTS.slice();
    if (region !== "all") out = out.filter((e) => e.region === region);
    if (category !== "all") out = out.filter((e) => e.category === category);
    if (impact !== "all") out = out.filter((e) => e.impact === impact);
    const horizon = window === "7d" ? 7 : window === "14d" ? 14 : 30;
    const start = new Date("2026-05-26");
    const end = new Date(start);
    end.setDate(end.getDate() + horizon);
    out = out.filter((e) => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });
    return out;
  }, [region, category, impact, window]);

  const grouped = eventsByDate(filtered);
  const sortedDates = Object.keys(grouped).sort();

  // Summary stats
  const highCount = filtered.filter((e) => e.impact === "high").length;
  const earningsCount = filtered.filter((e) => e.category === "Earnings").length;
  const macroCount = filtered.filter((e) => e.category === "Macro").length;
  const policyCount = filtered.filter((e) => e.category === "Policy").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline" style={{ padding: "14px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12, flexWrap: "wrap" }}>
        <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>07</span>
        <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>Catalyst Calendar</h1>
        <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>
          probability-weighted impact · US + IDX · macro + earnings + policy
        </span>
      </div>

      {/* Summary strip */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", borderBottom: "1px solid #2a2a2a" }}>
        {[
          { label: "EVENTS · IN WINDOW", value: filtered.length, sub: window.toUpperCase() },
          { label: "HIGH IMPACT", value: highCount, sub: "actionable", tone: "mag" },
          { label: "EARNINGS", value: earningsCount, sub: "consensus tracked" },
          { label: "MACRO + POLICY", value: macroCount + policyCount, sub: `${macroCount} macro · ${policyCount} policy` },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: "12px 14px", borderRight: i % 4 === 3 ? "none" : "1px solid #1d1d1d" }}>
            <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>{s.label}</div>
            <div className="num" style={{ fontSize: 22, color: s.tone === "mag" ? "#ff2e88" : "#f5f5f5", fontWeight: 500, letterSpacing: "-0.01em" }}>{s.value}</div>
            <div className="num" style={{ fontSize: 9.5, color: "#7a7a7a", marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div
        className="flex items-center"
        style={{ padding: "10px 14px", borderBottom: "1px solid #2a2a2a", gap: 16, flexWrap: "wrap" }}
      >
        <div className="flex items-center" style={{ gap: 6 }}>
          <span style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase" }}>Window</span>
          {(["7d", "14d", "30d"] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWindow(w)}
              style={{
                height: 22, padding: "0 8px", background: "transparent",
                border: `1px solid ${window === w ? "#ff2e88" : "#2a2a2a"}`,
                color: window === w ? "#ff2e88" : "#7a7a7a",
                fontSize: 10, letterSpacing: "0.08em", cursor: "pointer",
                fontFamily: "var(--font-jetbrains)",
              }}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <span style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase" }}>Region</span>
          {(["all", "US", "IDX", "GLOBAL"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              style={{
                height: 22, padding: "0 8px", background: "transparent",
                border: `1px solid ${region === r ? "#ff2e88" : "#2a2a2a"}`,
                color: region === r ? "#ff2e88" : "#7a7a7a",
                fontSize: 10, letterSpacing: "0.08em", cursor: "pointer",
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <span style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase" }}>Category</span>
          {(["all", "Macro", "Earnings", "Policy", "Index", "Regulatory"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              style={{
                height: 22, padding: "0 8px", background: "transparent",
                border: `1px solid ${category === c ? "#ff2e88" : "#2a2a2a"}`,
                color: category === c ? "#ff2e88" : "#7a7a7a",
                fontSize: 10, letterSpacing: "0.08em", cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <span style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase" }}>Impact</span>
          {(["all", "high", "medium", "low"] as const).map((imp) => (
            <button
              key={imp}
              type="button"
              onClick={() => setImpact(imp)}
              style={{
                height: 22, padding: "0 8px", background: "transparent",
                border: `1px solid ${impact === imp ? "#ff2e88" : "#2a2a2a"}`,
                color: impact === imp ? "#ff2e88" : "#7a7a7a",
                fontSize: 10, letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase",
              }}
            >
              {imp}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar list */}
      <section>
        <PanelHead title={`Schedule · ${sortedDates.length} trading days`} meta="grouped by date · probability-weighted base case" />
        <div>
          {sortedDates.map((date) => (
            <div key={date}>
              <div
                className="flex items-center"
                style={{
                  padding: "8px 14px",
                  background: "#050505",
                  borderBottom: "1px solid #1d1d1d",
                  borderTop: "1px solid #1d1d1d",
                  gap: 12,
                }}
              >
                <span
                  className="num"
                  style={{
                    fontSize: 10.5,
                    color: "#ff2e88",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                  }}
                >
                  {fmtDayHeader(date)}
                </span>
                <span style={{ fontSize: 9.5, color: "#666", letterSpacing: "0.08em" }}>
                  {grouped[date].length} event{grouped[date].length > 1 ? "s" : ""}
                </span>
              </div>
              {grouped[date].map((e, i) => (
                <div
                  key={i}
                  className="grid items-center hover:bg-[#0a0a0a]"
                  style={{
                    gridTemplateColumns: "80px 50px 16px 1fr 110px 70px 60px 50px",
                    height: 30,
                    padding: "0 14px",
                    borderBottom: "1px solid #111",
                    gap: 10,
                  }}
                >
                  <span className="num" style={{ fontSize: 10.5, color: "#b8b8b8" }}>{e.time}</span>
                  <span
                    style={{
                      fontSize: 9.5,
                      color: regionColor(e.region),
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {e.region}
                  </span>
                  <span
                    style={{
                      color: impactColor(e.impact),
                      fontSize: 11,
                      textAlign: "center",
                      lineHeight: 1,
                    }}
                    aria-hidden="true"
                  >
                    {categoryGlyph(e.category)}
                  </span>
                  <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 11.5, color: "#f5f5f5" }}>
                      {e.ticker ? (
                        <>
                          <TickerLink ticker={e.ticker} market={e.region === "US" ? "US" : "IDX"} size="sm" bold />
                          <span style={{ marginLeft: 6 }}>{e.title}</span>
                        </>
                      ) : (
                        e.title
                      )}
                    </span>
                    <span style={{ fontSize: 9.5, color: "#666", marginLeft: 8, fontStyle: "italic" }}>
                      {e.note}
                    </span>
                  </div>
                  <span className="num" style={{ fontSize: 10, color: "#888", textAlign: "right" }}>
                    {e.consensus ?? "—"}
                  </span>
                  <span
                    className="num"
                    style={{ fontSize: 10, color: "#7a7a7a", textAlign: "right" }}
                  >
                    P={e.probWeight.toFixed(2)}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: impactColor(e.impact),
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      border: `1px solid ${impactColor(e.impact)}`,
                      background: e.impact === "high" ? "rgba(255,46,136,0.06)" : e.impact === "medium" ? "rgba(196,131,31,0.06)" : "transparent",
                      padding: "1px 5px",
                      textAlign: "center",
                    }}
                  >
                    {e.impact}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "#7a7a7a",
                      letterSpacing: "0.1em",
                      textAlign: "right",
                      textTransform: "uppercase",
                    }}
                  >
                    {e.category}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Legend */}
      <section style={{ borderTop: "1px solid #2a2a2a" }}>
        <PanelHead title="Legend" />
        <div className="flex items-center" style={{ padding: "10px 14px", gap: 18, flexWrap: "wrap" }}>
          {([
            ["◆", "Macro"], ["■", "Earnings"], ["★", "Policy"], ["●", "Index"], ["▲", "Regulatory"],
          ] as const).map(([g, l]) => (
            <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "#888" }}>
              <span aria-hidden="true" style={{ color: "#ff2e88", fontSize: 11 }}>{g}</span>
              {l}
            </span>
          ))}
          <span style={{ marginLeft: 12, color: "#666", fontSize: 10 }}>
            <span className="num">P=0.65</span> = base-case probability · consensus = mean economist / sell-side estimate
          </span>
        </div>
      </section>
    </div>
  );
}
