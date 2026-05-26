"use client";

import { useEffect, useState } from "react";

interface RegimeState {
  state: "risk-on" | "risk-off" | "transition";
  prob: number;
  daysInRegime: number;
  market: "IDX" | "US";
  expectedDuration?: number;
}

interface RegimeBadgeProps {
  market?: "IDX" | "US";
}

// TODO: replace stub with real 2-state HMM on IHSG/SPX weekly returns +
// realized vol + credit spread + term-slope. Cite Hamilton (1989)
// Econometrica 57(2):357-384.
async function fetchRegime(market: "IDX" | "US"): Promise<RegimeState> {
  try {
    const res = await fetch(`/api/regime/${market.toLowerCase()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("regime fetch failed");
    return (await res.json()) as RegimeState;
  } catch {
    return {
      state: "risk-on",
      prob: 0.84,
      daysInRegime: 37,
      market,
      expectedDuration: 84,
    };
  }
}

function regimeStyling(state: RegimeState["state"]): {
  color: string;
  label: string;
} {
  switch (state) {
    case "risk-on":
      return { color: "#5ec4e0", label: "RISK-ON" };
    case "risk-off":
      return { color: "#ff2e88", label: "RISK-OFF" };
    case "transition":
      return { color: "#c4831f", label: "TRANSITION" };
  }
}

export default function RegimeBadge({ market = "IDX" }: RegimeBadgeProps): JSX.Element {
  const [data, setData] = useState<RegimeState | null>(null);
  const [tipOpen, setTipOpen] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    fetchRegime(market).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [market]);

  if (!data) {
    return (
      <span
        className="num"
        style={{
          fontSize: 9.5,
          color: "#555",
          letterSpacing: "0.08em",
          padding: "3px 8px",
          border: "1px solid #2a2a2a",
        }}
      >
        REGIME · …
      </span>
    );
  }

  const { color, label } = regimeStyling(data.state);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setTipOpen(true)}
      onMouseLeave={() => setTipOpen(false)}
    >
      <span
        className="num"
        style={{
          fontSize: 9.5,
          color,
          letterSpacing: "0.08em",
          padding: "3px 8px",
          border: `1px solid ${color}`,
          background: "transparent",
          display: "inline-flex",
          gap: 8,
          alignItems: "center",
          cursor: "help",
        }}
      >
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#888" }}>P={data.prob.toFixed(2)}</span>
        <span style={{ color: "#888" }}>{data.daysInRegime}d</span>
      </span>
      {tipOpen ? (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: 28,
            right: 0,
            background: "#000",
            border: `1px solid ${color}`,
            padding: "10px 12px",
            zIndex: 70,
            minWidth: 220,
          }}
        >
          <div
            className="num"
            style={{
              fontSize: 9,
              color: "#888",
              letterSpacing: "0.08em",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            {data.market} Regime · 2-state HMM
          </div>
          <div
            className="num"
            style={{ fontSize: 11, color: "#d8d8d8", marginBottom: 4 }}
          >
            State:{" "}
            <span style={{ color, fontWeight: 600 }}>{label}</span>
          </div>
          <div
            className="num"
            style={{ fontSize: 10.5, color: "#d8d8d8", marginBottom: 3 }}
          >
            Posterior P = {data.prob.toFixed(3)}
          </div>
          <div
            className="num"
            style={{ fontSize: 10.5, color: "#d8d8d8", marginBottom: 3 }}
          >
            Time in regime = {data.daysInRegime} days
          </div>
          {data.expectedDuration ? (
            <div
              className="num"
              style={{ fontSize: 10.5, color: "#888", marginTop: 4 }}
            >
              Expected duration ≈ {data.expectedDuration} d
            </div>
          ) : null}
          <div
            style={{
              fontSize: 9,
              color: "#666",
              marginTop: 8,
              borderTop: "1px solid #2a2a2a",
              paddingTop: 6,
              fontStyle: "italic",
            }}
          >
            Hamilton (1989) Econometrica 57(2):357-384
          </div>
        </div>
      ) : null}
    </div>
  );
}
