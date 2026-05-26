import Link from "next/link";

interface TickerCard {
  ticker: string;
  exchange: string;
  name: string;
  sector: string;
  price: string;
  changePct: number;
  grade: string;
  gradeTone: "pos" | "neutral" | "neg";
  pe: string;
  roe: string;
  href: string;
  market: string;
}

const CARDS: TickerCard[] = [
  {
    ticker: "BBCA", exchange: "IDX", name: "Bank Central Asia",
    sector: "Financials · Banks", price: "Rp 9,650", changePct: 1.32,
    grade: "A−", gradeTone: "pos", pe: "19.4× P/E", roe: "ROE 22.8%",
    href: "/idx/bbca", market: "INDONESIA",
  },
  {
    ticker: "MYOR", exchange: "IDX", name: "Mayora Indah",
    sector: "Consumer Staples · Food", price: "Rp 2,810", changePct: 0.18,
    grade: "B", gradeTone: "neutral", pe: "22.4× P/E", roe: "ROE 21.8%",
    href: "/idx/myor", market: "INDONESIA",
  },
  {
    ticker: "NVDA", exchange: "NASDAQ", name: "NVIDIA Corporation",
    sector: "Information Tech · Semis", price: "$162.84", changePct: 1.21,
    grade: "B+", gradeTone: "neutral", pe: "32.8× P/E", roe: "ROE 98.4%",
    href: "/us/nvda", market: "UNITED STATES",
  },
];

interface SectionTile {
  num: string;
  label: string;
  blurb: string;
  href: string;
  stat: string;
  statTone?: "pos" | "neg" | "neutral";
}

const TILES: SectionTile[] = [
  { num: "00", label: "Daily Brief", blurb: "Apollo Spark + BRIDS · auto-compiled 06:30 WIB", href: "/brief", stat: "Chart of the Day · NVDA AMC", statTone: "pos" },
  { num: "07", label: "Calendar", blurb: "30d forward catalysts · US + IDX", href: "/calendar", stat: "26 events · 6 high impact", statTone: "neutral" },
  { num: "01", label: "Markets", blurb: "IHSG +0.84% · LQ45 +0.92%", href: "/markets", stat: "FIN +1.82% · ENG +3.42%", statTone: "pos" },
  { num: "02", label: "Portfolio", blurb: "Hypothetical tracking · Day +0.93%", href: "/idx/portfolio", stat: "α +9bps vs IHSG TR", statTone: "pos" },
  { num: "03", label: "Screener", blurb: "24 / 184 eligible · top decile", href: "/screener", stat: "Top signal: BMRI +2.41z", statTone: "pos" },
  { num: "04", label: "Research", blurb: "CPCV μ 0.904 · DSR 99.7%", href: "/research", stat: "9/9 paths positive", statTone: "pos" },
  { num: "05", label: "Risk", blurb: "Beta 1.08 · Vol 18.4%", href: "/risk", stat: "VaR 95% −2.84%", statTone: "neg" },
  { num: "06", label: "Backtest", blurb: "Strategy workbench · 5 saved", href: "/backtest", stat: "Sharpe 0.91 · DSR 0.997", statTone: "pos" },
];

const SAVED_SCREENS = [
  { name: "Multi-Factor v2.1", count: 24, active: true },
  { name: "PEAD · SUE Top Decile", count: 11 },
  { name: "Cross-Cohort Flow", count: 17 },
  { name: "Low-Vol Defensive", count: 28 },
  { name: "Danantara Catalyst", count: 9 },
  { name: "Energy Beta Long", count: 14 },
  { name: "Value Trap Avoidance", count: 38 },
  { name: "SOE Bank Specifically", count: 4 },
];

function deltaColor(pct: number): string {
  if (pct > 0) return "#00d97e";
  if (pct < 0) return "#ff4d4f";
  return "#7a7a7a";
}

function gradeColor(t: "pos" | "neg" | "neutral"): string {
  if (t === "pos") return "#00d97e";
  if (t === "neg") return "#ff4d4f";
  return "#ff2e88";
}

function statToneColor(t: SectionTile["statTone"]): string {
  if (t === "pos") return "#00d97e";
  if (t === "neg") return "#ff4d4f";
  return "#7a7a7a";
}

function SectionLabel({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        height: 28,
        padding: "0 14px",
        borderBottom: "1px solid #2a2a2a",
        borderTop: "1px solid #2a2a2a",
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
        {children}
      </span>
    </div>
  );
}

export default function LandingPage(): JSX.Element {
  return (
    <div>
      <div style={{ padding: "20px 14px", borderBottom: "1px solid #2a2a2a" }}>
        <div
          className="num"
          style={{
            fontSize: 9,
            color: "#666",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          MERIDIAN · COMMAND CENTER · V0.1
        </div>
        <h1
          style={{
            fontSize: 26,
            color: "#f5f5f5",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            margin: "6px 0 4px",
          }}
        >
          Welcome back, N. LUU
        </h1>
        <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
          Three demo securities · six workstation sections · IDX + US ·{" "}
          <span className="num" style={{ color: "#d8d8d8" }}>session II · 14:23 WIB</span>
        </p>
      </div>

      <SectionLabel>Demo Securities</SectionLabel>
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {CARDS.map((c, i) => (
          <Link
            key={c.ticker}
            href={c.href}
            className="hover:bg-[#0a0a0a]"
            style={{
              padding: "16px 16px 18px",
              borderRight: i < CARDS.length - 1 ? "1px solid #2a2a2a" : "none",
              borderBottom: "1px solid #2a2a2a",
              display: "block",
              color: "inherit",
              minHeight: 168,
            }}
          >
            <div className="flex items-baseline" style={{ gap: 8 }}>
              <span
                className="num"
                style={{
                  fontSize: 24,
                  color: "#ff2e88",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                {c.ticker}
              </span>
              <span
                className="num"
                style={{
                  fontSize: 9,
                  color: "#7a7a7a",
                  border: "1px solid #2a2a2a",
                  padding: "1px 5px",
                  letterSpacing: "0.06em",
                }}
              >
                {c.exchange}
              </span>
              <div
                className="ml-auto flex items-center"
                style={{
                  border: `1px solid ${gradeColor(c.gradeTone)}`,
                  padding: "2px 8px",
                  background: "rgba(255,46,136,0.05)",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: gradeColor(c.gradeTone),
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {c.grade}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#d8d8d8", marginTop: 4 }}>{c.name}</div>
            <div
              style={{
                fontSize: 9,
                color: "#666",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              {c.sector}
            </div>

            <div className="flex items-baseline" style={{ gap: 8, marginTop: 18 }}>
              <span
                className="num"
                style={{ fontSize: 18, color: "#f5f5f5", fontWeight: 500, letterSpacing: "-0.01em" }}
              >
                {c.price}
              </span>
              <span className="num" style={{ fontSize: 11, color: deltaColor(c.changePct) }}>
                {c.changePct >= 0 ? "+" : ""}{c.changePct.toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center" style={{ gap: 12, marginTop: 12 }}>
              <span className="num" style={{ fontSize: 10, color: "#888" }}>{c.pe}</span>
              <span style={{ color: "#333" }}>·</span>
              <span className="num" style={{ fontSize: 10, color: "#888" }}>{c.roe}</span>
              <span className="ml-auto num" style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: "0.08em" }}>
                {c.market}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <SectionLabel>Workstation Sections</SectionLabel>
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {TILES.map((t, i) => (
          <Link
            key={t.num}
            href={t.href}
            className="hover:bg-[#0a0a0a]"
            style={{
              padding: "14px 16px",
              borderRight: (i + 1) % 3 === 0 ? "none" : "1px solid #2a2a2a",
              borderBottom: i < 3 ? "1px solid #2a2a2a" : "none",
              display: "block",
              color: "inherit",
            }}
          >
            <div className="flex items-baseline" style={{ gap: 8 }}>
              <span
                className="num"
                style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}
              >
                {t.num}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: "#f5f5f5",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
              >
                {t.label}
              </span>
            </div>
            <div className="num" style={{ fontSize: 10.5, color: "#888", marginTop: 6 }}>
              {t.blurb}
            </div>
            <div
              className="num"
              style={{ fontSize: 10, color: statToneColor(t.statTone), marginTop: 4 }}
            >
              {t.stat}
            </div>
          </Link>
        ))}
      </div>

      <SectionLabel>Saved Screens · global</SectionLabel>
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {SAVED_SCREENS.map((s, i) => (
          <div
            key={s.name}
            className="hover:bg-[#0a0a0a]"
            style={{
              padding: "12px 14px",
              borderRight: (i + 1) % 4 === 0 ? "none" : "1px solid #1d1d1d",
              borderBottom: i < 4 ? "1px solid #1d1d1d" : "none",
              borderLeft: s.active ? "2px solid #ff2e88" : "2px solid transparent",
            }}
          >
            <div style={{ fontSize: 11, color: s.active ? "#f5f5f5" : "#d8d8d8" }}>
              {s.name}
            </div>
            <div
              className="num"
              style={{
                fontSize: 9.5,
                color: s.active ? "#ff2e88" : "#666",
                marginTop: 4,
                letterSpacing: "0.04em",
              }}
            >
              {s.count} eligible
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
