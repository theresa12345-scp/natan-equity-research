"use client";

import { useState } from "react";
import ScoreDerivationDrawer from "./ScoreDerivationDrawer";

interface Pillar {
  name: string;
  weight: number;
  score: number;
  letter: string;
  tone: "mag" | "pos" | "amber" | "neg";
  raw?: Record<string, number | string | undefined>;
  winsorized?: Record<string, number | undefined>;
  pctRank?: number;
  contribution?: number;
}

interface Driver {
  label: string;
  value: string;
  tone: "pos" | "neg" | "neutral";
}

interface GradeAggregate {
  letter: string;
  score: number;
  max: number;
  verdict: string;
  verdictTone: "buy" | "hold" | "sell";
  horizon: string;
  targetPx: number;
  targetUpsidePct: number;
  downsidePx: number;
  downsideDeltaPct: number;
  rrRatio: number;
  positionSize: number;
}

interface GradeHistoryPoint {
  month: string;
  score: number;
  marker?: string;
}

interface GradeModuleProps {
  pillars: Pillar[];
  drivers: Driver[];
  aggregate: GradeAggregate;
  thesis: string;
  history: GradeHistoryPoint[];
  pxFormatter?: (n: number) => string;
  ticker?: string;
  name?: string;
  ciLow?: string;
  ciHigh?: string;
}

function pillarColor(tone: Pillar["tone"]): string {
  if (tone === "mag") return "#ff2e88";
  if (tone === "pos") return "#00d97e";
  if (tone === "amber") return "#c4831f";
  return "#ff4d4f";
}

function driverColor(t: Driver["tone"]): string {
  if (t === "pos") return "#00d97e";
  if (t === "neg") return "#ff4d4f";
  return "#7a7a7a";
}

function verdictColor(t: GradeAggregate["verdictTone"]): string {
  if (t === "buy") return "#00d97e";
  if (t === "sell") return "#ff4d4f";
  return "#ff2e88";
}

function PillarRow({ p }: { p: Pillar }): JSX.Element {
  const pct = (p.score / 100) * 100;
  return (
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: "140px 40px 1fr 40px 40px",
        height: 24,
        padding: "0 12px",
        borderBottom: "1px solid #111",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 11, color: "#d8d8d8" }}>{p.name}</span>
      <span
        className="num"
        style={{ fontSize: 9.5, color: "#666", textAlign: "right" }}
      >
        {p.weight}%
      </span>
      <div
        style={{
          height: 6,
          background: "#1a1a1a",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: pillarColor(p.tone),
            opacity: 0.85,
          }}
        />
      </div>
      <span
        className="num"
        style={{ fontSize: 11, color: "#f5f5f5", textAlign: "right" }}
      >
        {p.score}
      </span>
      <span
        style={{
          fontSize: 11,
          color: pillarColor(p.tone),
          fontWeight: 600,
          textAlign: "right",
        }}
      >
        {p.letter}
      </span>
    </div>
  );
}

function GradeHistoryChart({ data }: { data: GradeHistoryPoint[] }): JSX.Element {
  const w = 520;
  const h = 140;
  const pad = { l: 28, r: 12, t: 12, b: 24 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const min = 60;
  const max = 100;
  const xStep = innerW / (data.length - 1);

  const x = (i: number): number => pad.l + i * xStep;
  const y = (v: number): number =>
    pad.t + innerH - ((v - min) / (max - min)) * innerH;

  const pts = data.map((d, i) => `${x(i)},${y(d.score)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="12-month grade history">
      {/* gridlines */}
      {[60, 70, 80, 90, 100].map((v) => (
        <g key={v}>
          <line
            x1={pad.l}
            x2={w - pad.r}
            y1={y(v)}
            y2={y(v)}
            stroke="#1a1a1a"
            strokeDasharray="2 3"
          />
          <text
            x={pad.l - 6}
            y={y(v) + 3}
            textAnchor="end"
            style={{
              fontSize: 8.5,
              fill: "#555",
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            {v}
          </text>
        </g>
      ))}
      {/* polyline */}
      <polyline
        fill="none"
        stroke="#ff2e88"
        strokeWidth={1.5}
        points={pts}
      />
      {/* dots + markers */}
      {data.map((d, i) => (
        <g key={d.month}>
          <circle cx={x(i)} cy={y(d.score)} r={2.2} fill="#ff2e88" />
          {d.marker ? (
            <>
              <line
                x1={x(i)}
                x2={x(i)}
                y1={pad.t}
                y2={h - pad.b}
                stroke="#ff2e88"
                strokeDasharray="2 2"
                opacity={0.4}
              />
              <text
                x={x(i) + 3}
                y={pad.t + 9}
                style={{
                  fontSize: 8,
                  fill: "#ff2e88",
                  fontFamily: "var(--font-jetbrains)",
                }}
              >
                {d.marker}
              </text>
            </>
          ) : null}
        </g>
      ))}
      {/* x labels every 3rd */}
      {data.map((d, i) =>
        i % 2 === 0 ? (
          <text
            key={d.month}
            x={x(i)}
            y={h - 6}
            textAnchor="middle"
            style={{ fontSize: 8.5, fill: "#666", fontFamily: "var(--font-jetbrains)" }}
          >
            {d.month}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export default function GradeModule({
  pillars,
  drivers,
  aggregate,
  thesis,
  history,
  pxFormatter = (n) => n.toLocaleString("en-US"),
  ticker = "",
  name = "",
  ciLow,
  ciHigh,
}: GradeModuleProps): JSX.Element {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "40% 60%", minHeight: 0 }}
    >
      {/* LEFT: pillars + aggregate + drivers */}
      <section style={{ borderRight: "1px solid #2a2a2a", minWidth: 0 }}>
        <div
          className="flex items-center"
          style={{
            height: 28,
            padding: "0 12px",
            borderBottom: "1px solid #1d1d1d",
            background: "#050505",
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
            8-Pillar Decomposition · MF v2.1
          </span>
        </div>
        {pillars.map((p) => (
          <PillarRow key={p.name} p={p} />
        ))}

        {/* aggregate block */}
        <div
          style={{
            padding: "14px 12px",
            borderTop: "1px solid #2a2a2a",
            background: "#050505",
          }}
        >
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div
                style={{
                  fontSize: 8.5,
                  color: "#666",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Aggregate · weighted
              </div>
              <div
                className="num"
                style={{
                  fontSize: 26,
                  color: "#f5f5f5",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  marginTop: 4,
                }}
              >
                {aggregate.score.toFixed(1)}{" "}
                <span style={{ color: "#555", fontSize: 14 }}>
                  / {aggregate.max}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="hover:brightness-125"
                aria-label="Open score derivation drawer"
                style={{
                  fontSize: 22,
                  color: "#ff2e88",
                  fontWeight: 700,
                  marginTop: 2,
                  letterSpacing: "-0.02em",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(255,46,136,0.4)",
                  textUnderlineOffset: 3,
                }}
              >
                {aggregate.letter}
              </button>
            </div>
            <div>
              <div
                style={{
                  fontSize: 8.5,
                  color: "#666",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Targets · {aggregate.horizon}
              </div>
              <div
                className="num"
                style={{ fontSize: 11, color: "#d8d8d8", marginTop: 8 }}
              >
                TGT{" "}
                <span style={{ color: "#00d97e" }}>
                  {pxFormatter(aggregate.targetPx)}
                </span>{" "}
                ({aggregate.targetUpsidePct >= 0 ? "+" : ""}
                {aggregate.targetUpsidePct.toFixed(1)}%)
              </div>
              <div
                className="num"
                style={{ fontSize: 11, color: "#d8d8d8", marginTop: 2 }}
              >
                DN{" "}
                <span style={{ color: "#ff4d4f" }}>
                  {pxFormatter(aggregate.downsidePx)}
                </span>{" "}
                ({aggregate.downsideDeltaPct.toFixed(1)}%)
              </div>
              <div
                className="num"
                style={{ fontSize: 10, color: "#7a7a7a", marginTop: 4 }}
              >
                R/R {aggregate.rrRatio.toFixed(2)}×
              </div>
            </div>
          </div>
        </div>

        {/* drivers */}
        <div
          style={{
            padding: "10px 12px",
            borderTop: "1px solid #2a2a2a",
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {drivers.map((d) => (
            <div
              key={d.label}
              className="num"
              style={{
                padding: "3px 8px",
                border: "1px solid #2a2a2a",
                fontSize: 10,
                color: driverColor(d.tone),
                letterSpacing: "0.04em",
                lineHeight: 1.3,
              }}
            >
              <span style={{ color: "#666" }}>{d.label}</span>{" "}
              <span>{d.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* RIGHT: thesis + history chart */}
      <section style={{ minWidth: 0 }}>
        <div
          className="flex items-center"
          style={{
            height: 28,
            padding: "0 12px",
            borderBottom: "1px solid #1d1d1d",
            background: "#050505",
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
            Research Overview · Composite Analysis
          </span>
        </div>
        <div
          style={{
            padding: "14px 16px",
            fontSize: 11.5,
            color: "#d8d8d8",
            lineHeight: 1.65,
            maxWidth: "68ch",
          }}
        >
          {thesis.split(/\n\n+/).map((para, i) => (
            <p
              key={i}
              style={{
                margin: i === 0 ? 0 : "10px 0 0",
              }}
            >
              {para}
            </p>
          ))}
        </div>

        <div
          className="flex items-center"
          style={{
            height: 28,
            padding: "0 12px",
            borderTop: "1px solid #2a2a2a",
            borderBottom: "1px solid #1d1d1d",
            background: "#050505",
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
            Grade History · 12mo
          </span>
        </div>
        <div style={{ padding: "8px 12px" }}>
          <GradeHistoryChart data={history} />
        </div>
      </section>

      <ScoreDerivationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ticker={ticker}
        name={name}
        pillars={pillars}
        aggregate={aggregate}
        positionCap={aggregate.positionSize}
        ciLow={ciLow}
        ciHigh={ciHigh}
      />
    </div>
  );
}
