// Reverse-DCF · Mauboussin Expectations Investing
//
// Given current market price + cost of equity + terminal growth,
// solve for the 5-year implicit revenue CAGR that the market is
// pricing in. The panel shows three implied scenarios and labels
// the "consensus" line — the one matching current price.

interface ReverseDCFProps {
  marketPrice: number;
  intrinsicAtBase: number;
  baseCAGR: number;        // assumed by analyst DCF
  ke: number;              // %
  terminalGrowth: number;  // %
  currency: "IDR" | "USD";
}

function fmt(n: number, currency: "IDR" | "USD"): string {
  return currency === "USD"
    ? `$${n.toFixed(2)}`
    : `Rp ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function ReverseDCFPanel({
  marketPrice,
  intrinsicAtBase,
  baseCAGR,
  ke,
  terminalGrowth,
  currency,
}: ReverseDCFProps): JSX.Element {
  // Solve implied CAGR by approximation: each +1pp of CAGR is
  // worth roughly the difference between intrinsic and a -1pp run.
  // We synthesize three implied scenarios around current price.
  const premium = (marketPrice / intrinsicAtBase - 1) * 100;
  const impliedCAGR = baseCAGR + premium * 0.25; // sensitivity proxy

  const scenarios = [
    {
      label: "Implied · current price",
      cagr: impliedCAGR,
      price: marketPrice,
      tone: "mag" as const,
      desc: `What the market is pricing in: ~${impliedCAGR.toFixed(1)}% revenue CAGR sustained five years to justify the current ${fmt(marketPrice, currency)} quote.`,
    },
    {
      label: "Analyst base case",
      cagr: baseCAGR,
      price: intrinsicAtBase,
      tone: "neutral" as const,
      desc: `Meridian DCF base: ${baseCAGR.toFixed(1)}% CAGR → ${fmt(intrinsicAtBase, currency)} intrinsic. ${premium > 0 ? "Market expectations exceed base." : premium < 0 ? "Market below base — value tilt." : "Market and base aligned."}`,
    },
    {
      label: "Bear · −2pp CAGR",
      cagr: Math.max(0, baseCAGR - 2),
      price: intrinsicAtBase * 0.84,
      tone: "neg" as const,
      desc: `Each 1pp of revenue CAGR is worth roughly ${(intrinsicAtBase * 0.08).toFixed(0)} per share at Ke ${ke.toFixed(2)}% · g∞ ${terminalGrowth.toFixed(2)}%.`,
    },
  ];

  return (
    <div style={{ borderTop: "1px solid #2a2a2a" }}>
      <div
        className="flex items-center"
        style={{
          height: 28,
          padding: "0 12px",
          borderBottom: "1px solid #1d1d1d",
          background: "#050505",
          gap: 10,
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
          Reverse DCF · What's Priced In
        </span>
        <span style={{ fontSize: 10, color: "#7a7a7a" }}>
          Mauboussin · Expectations Investing
        </span>
      </div>

      <div style={{ padding: "12px 14px" }}>
        <p style={{ fontSize: 11, color: "#7a7a7a", margin: "0 0 12px", lineHeight: 1.55, maxWidth: "78ch" }}>
          The market quote, treated as a fixed point, implies a specific 5-year revenue
          CAGR given the same cost of equity ({ke.toFixed(2)}%) and terminal growth ({terminalGrowth.toFixed(2)}%)
          used in the analyst DCF. The premium of {premium >= 0 ? "+" : ""}{premium.toFixed(1)}% over base intrinsic
          reverses to a {Math.abs(impliedCAGR - baseCAGR).toFixed(1)}pp CAGR delta over the explicit projection
          window — a Mauboussin-style "what's priced in" check.
        </p>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {scenarios.map((s) => {
            const color = s.tone === "mag" ? "#ff2e88" : s.tone === "neg" ? "#ff4d4f" : "#d8d8d8";
            return (
              <div
                key={s.label}
                style={{
                  padding: "10px 12px",
                  border: `1px solid ${s.tone === "mag" ? "#ff2e88" : "#2a2a2a"}`,
                  background: s.tone === "mag" ? "rgba(255,46,136,0.04)" : "#050505",
                }}
              >
                <div
                  style={{
                    fontSize: 8.5,
                    color: s.tone === "mag" ? "#ff2e88" : "#666",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </div>
                <div className="num" style={{ fontSize: 22, color, fontWeight: 500, marginTop: 6, letterSpacing: "-0.01em" }}>
                  {s.cagr >= 0 ? "+" : ""}{s.cagr.toFixed(1)}%
                </div>
                <div className="num" style={{ fontSize: 10, color: "#888", marginTop: 3 }}>
                  → {fmt(s.price, currency)}
                </div>
                <p style={{ fontSize: 10.5, color: "#888", marginTop: 8, lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "8px 12px",
            border: "1px solid #c4831f",
            background: "rgba(196,131,31,0.04)",
            fontSize: 10.5,
            color: "#d8d8d8",
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: "#c4831f", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 9, fontWeight: 600, marginRight: 8 }}>
            CAVEAT
          </span>
          Implied-CAGR computed via single-input linearisation. Production version pending port of
          <span className="num" style={{ color: "#ff2e88", marginLeft: 4 }}>lib/dcf/engine.ts</span> · Mauboussin &amp; Rappaport
          (Expectations Investing, 2001/2021) recommend a triangulated reverse-engineering across revenue, margin, and reinvestment.
        </div>
      </div>
    </div>
  );
}
