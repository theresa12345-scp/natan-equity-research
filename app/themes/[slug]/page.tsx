import { notFound } from "next/navigation";
import Link from "next/link";
import TickerLink from "@/components/primitives/TickerLink";
import { CitationCluster } from "@/components/primitives/CitationChip";
import Sparkline, { deterministicWalk } from "@/components/primitives/Sparkline";
import { THEMES, themeBySlug } from "@/lib/themes/catalog";
import { buildThemeBasket } from "@/lib/themes/engine";
import type { ThemeBasket, ThemeBasketRow, RelevanceTier } from "@/lib/themes/types";

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams(): { slug: string }[] {
  return THEMES.map((t) => ({ slug: t.slug }));
}

function tone(z: number | null): string {
  if (z == null) return "#666";
  if (z > 0.3) return "#00d97e";
  if (z < -0.3) return "#ff4d4f";
  return "#b8b8b8";
}

function tierColor(t: RelevanceTier): string {
  if (t === "Core") return "#ff2e88";
  if (t === "Significant") return "#5ec4e0";
  return "#7a7a7a";
}

function PanelHead({ title, meta }: { title: string; meta?: string }): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        height: 28,
        padding: "0 14px",
        borderTop: "1px solid #2a2a2a",
        borderBottom: "1px solid #2a2a2a",
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
        {title}
      </span>
      {meta ? (
        <span className="num ml-auto" style={{ fontSize: 9.5, color: "#666", letterSpacing: "0.06em" }}>
          {meta}
        </span>
      ) : null}
    </div>
  );
}

interface PageProps {
  params: { slug: string };
}

export default function ThemeDetailPage({ params }: PageProps): JSX.Element {
  const theme = themeBySlug(params.slug);
  if (!theme) notFound();
  const basket = buildThemeBasket(theme);

  const benchmark = theme.benchmark;
  const region = theme.region;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Compact header */}
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #2a2a2a" }}>
        <div className="flex items-baseline" style={{ gap: 8, flexWrap: "wrap" }}>
          <Link href="/themes" className="num hover:text-[#ff2e88]" style={{ color: "#7a7a7a", textDecoration: "none", fontSize: 9, letterSpacing: "0.14em" }}>
            ← THEMES
          </Link>
          <span className="num" style={{ fontSize: 9, color: "#444" }}>·</span>
          <span className="num" style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {theme.category}
          </span>
          <span className="num" style={{ fontSize: 9, color: "#444" }}>·</span>
          <span className="num" style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: "0.1em" }}>{theme.region}</span>
        </div>
        <div className="flex items-baseline" style={{ gap: 12, marginTop: 4, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 20, color: "#f5f5f5", fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>
            {theme.name}
          </h1>
          <span style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }} title={theme.definition}>
            {theme.blurb}
          </span>
        </div>
      </div>

      {/* Compact KPI strip — 5 cells, 8px padding */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))", borderBottom: "1px solid #2a2a2a" }}
      >
        {[
          { label: "CONSTITUENTS", value: String(basket.totalNames), sub: `${basket.coreNames} core · ${basket.inUniverseNames}/${basket.totalNames} have live data`, tone: "#f5f5f5" },
          {
            label: "BASKET Z",
            value: `${basket.weightedZ >= 0 ? "+" : ""}${basket.weightedZ.toFixed(2)}σ`,
            sub: `${theme.methodology.weighting} weighting`,
            tone: tone(basket.weightedZ),
          },
          {
            label: "AVG RELEVANCE",
            value: `${basket.avgRelevance.toFixed(0)}%`,
            sub: `floor ${theme.methodology.eligibilityFloorPct}% · pure-play ≥50%`,
            tone: "#ff2e88",
          },
          {
            label: "TOP SECTOR",
            value: basket.topSector ?? "—",
            sub: `vs ${benchmark}`,
            tone: "#f5f5f5",
          },
          {
            label: "LAST REVIEW",
            value: theme.methodology.lastReview,
            sub: `cadence: ${theme.methodology.rebalanceCadence.toLowerCase()}`,
            tone: "#f5f5f5",
          },
        ].map((k, i) => (
          <div
            key={k.label}
            style={{
              padding: "8px 12px",
              borderRight: i < 4 ? "1px solid #1d1d1d" : "none",
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 8, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              {k.label}
            </div>
            <div className="num" style={{ fontSize: 15, color: k.tone, fontWeight: 500, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {k.value}
            </div>
            <div className="num" style={{ marginTop: 2, fontSize: 9, color: "#888", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={k.sub}>
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Exposure + Seedwords — side by side */}
      <div className="grid" style={{ gridTemplateColumns: "60% 40%", borderBottom: "1px solid #2a2a2a" }}>
        <div style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title="Exposure · sectors and tiers" meta="basket-weighted share" />
          <div style={{ padding: "10px 14px" }}>
            <SectorExposureBar basket={basket} />
            <TierExposureBar basket={basket} />
          </div>
        </div>
        <div>
          <PanelHead title="Seedwords · curated set" meta={`${theme.seedwords.length} terms`} />
          <div style={{ padding: "10px 14px" }}>
            <div className="flex items-center" style={{ flexWrap: "wrap", gap: 4 }}>
              {theme.seedwords.map((s) => (
                <span
                  key={s}
                  className="num"
                  style={{
                    fontSize: 9.5,
                    color: "#d8d8d8",
                    border: "1px solid #2a2a2a",
                    padding: "1px 5px",
                    background: "#0a0a0a",
                    letterSpacing: "0.02em",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Constituents */}
      <PanelHead
        title="Constituents · basket leaderboard"
        meta={`${basket.totalNames} names · sorted by basket weight ▾`}
      />
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: "70px 1fr 70px 70px 60px 60px 80px 76px 110px 100px",
          height: 22,
          padding: "0 14px",
          background: "#050505",
          borderBottom: "1px solid #2a2a2a",
          fontSize: 8.5,
          color: "#555",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          gap: 8,
        }}
      >
        <span>Ticker</span>
        <span>Name</span>
        <span style={{ textAlign: "right" }}>Wt %</span>
        <span style={{ textAlign: "right" }}>Score</span>
        <span style={{ textAlign: "right" }}>Z</span>
        <span style={{ textAlign: "right" }}>Rel %</span>
        <span>Tier</span>
        <span>Spark</span>
        <span>Sector</span>
        <span>Source</span>
      </div>
      {basket.rows.map((r, i) => (
        <ConstituentRow key={r.ticker} r={r} i={i} />
      ))}

      {/* Rationale — 2-column grid */}
      <PanelHead title="Rationale · per-constituent" meta="analyst-tagged · why this name belongs" />
      <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        {basket.rows.map((r, i) => (
          <div
            key={r.ticker}
            style={{
              padding: "8px 14px",
              borderBottom: "1px solid #111",
              borderRight: i % 2 === 0 ? "1px solid #1d1d1d" : "none",
              background: i % 4 < 2 ? "#0d0d0d" : "#0a0a0a",
            }}
          >
            <div className="flex items-baseline" style={{ gap: 6 }}>
              <TickerLink ticker={r.ticker} market={r.region === "GLOBAL" ? "US" : r.region} size="sm" />
              <span
                className="num"
                style={{
                  fontSize: 8.5,
                  color: tierColor(r.tier),
                  border: `1px solid ${tierColor(r.tier)}`,
                  padding: "0 4px",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                {r.tier.toUpperCase()} · {r.relevancePct}%
              </span>
            </div>
            <div style={{ fontSize: 10.5, color: "#d8d8d8", marginTop: 3, lineHeight: 1.4 }}>
              {r.rationale}
            </div>
          </div>
        ))}
      </div>

      {/* Methodology — compact 4-column key/value grid */}
      <PanelHead title="Methodology · reproducible from public data" />
      <div style={{ padding: "10px 14px" }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "8px 18px",
            fontSize: 10.5,
          }}
        >
          {[
            ["Scoring formula", theme.methodology.scoringFormula],
            ["Data provenance", theme.methodology.dataProvenance],
            ["Eligibility floor", `${theme.methodology.eligibilityFloorPct}% relevance`],
            ["Weighting", theme.methodology.weighting],
            ["Rebalance", theme.methodology.rebalanceCadence],
            ["Last review", theme.methodology.lastReview],
          ].map(([label, value]) => (
            <div key={label} style={{ minWidth: 0 }}>
              <div className="num" style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ color: "#d8d8d8", lineHeight: 1.45 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="num" style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
            Limitations
          </div>
          <div style={{ fontSize: 10.5, color: "#b8b8b8", lineHeight: 1.5, marginBottom: 10 }}>
            {theme.methodology.limitations}
          </div>
          <CitationCluster label="founded on" ids={theme.citationIds} />
        </div>
      </div>

      {/* Honest risk callout — compact */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #2a2a2a",
          borderLeft: "2px solid #ff4d4f",
          background: "rgba(255,77,79,0.04)",
        }}
      >
        <div className="flex items-baseline" style={{ gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span className="num" style={{ fontSize: 8.5, color: "#ff4d4f", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase" }}>
            Theme-specific risk
          </span>
          <span style={{ fontSize: 11, color: "#d8d8d8", lineHeight: 1.5 }}>{theme.riskNote}</span>
        </div>
        <div style={{ fontSize: 10, color: "#7a7a7a", lineHeight: 1.5 }}>
          <span style={{ color: "#ff4d4f", fontWeight: 600 }}>Class-wide caveat. </span>
          Ben-David et al. (2023, <em>RFS</em> 36(3)): thematic ETFs lose ~30% risk-adjusted in first 5 years
          (~ −3%/yr after fees) on overvaluation at launch. Morningstar (2022): ~91% 15-yr survive-and-outperform
          failure rate. Use this as a discovery + screening lens, validate on /research + /backtest before sizing.
        </div>
      </div>
    </div>
  );
}

// Sector exposure as a horizontal stacked bar (institutional standard:
// Bloomberg basket detail + ETFdb theme pages).
const SECTOR_PALETTE = [
  "#ff2e88", "#5ec4e0", "#00d97e", "#c4831f",
  "#9a2a2c", "#b8b8b8", "#7a7a7a", "#555555",
];

function SectorExposureBar({ basket }: { basket: ThemeBasket }): JSX.Element {
  const map = new Map<string, number>();
  basket.rows.forEach((r) => {
    if (r.sector && r.basketWeight > 0) {
      map.set(r.sector, (map.get(r.sector) ?? 0) + r.basketWeight);
    }
  });
  const segments = Array.from(map.entries())
    .map(([sector, weight]) => ({ sector, weight }))
    .sort((a, b) => b.weight - a.weight);
  const total = segments.reduce((s, x) => s + x.weight, 0) || 1;

  if (segments.length === 0) {
    return (
      <div style={{ fontSize: 10.5, color: "#666", fontStyle: "italic" }}>
        No sector data — constituents not yet in the universe loader.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div className="num" style={{ fontSize: 9, color: "#666", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
        Sector exposure
      </div>
      <div
        style={{
          display: "flex",
          height: 16,
          border: "1px solid #1d1d1d",
          background: "#0a0a0a",
        }}
        title={segments.map((s) => `${s.sector} ${((s.weight / total) * 100).toFixed(1)}%`).join(" · ")}
      >
        {segments.map((seg, i) => (
          <div
            key={seg.sector}
            style={{
              width: `${(seg.weight / total) * 100}%`,
              background: SECTOR_PALETTE[i] ?? "#444",
              borderRight: i < segments.length - 1 ? "1px solid #000" : "none",
            }}
          />
        ))}
      </div>
      <div
        className="flex items-center"
        style={{ marginTop: 8, gap: 12, flexWrap: "wrap", fontSize: 10.5 }}
      >
        {segments.map((seg, i) => (
          <span
            key={seg.sector}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#d8d8d8" }}
          >
            <span
              aria-hidden="true"
              style={{ width: 8, height: 8, background: SECTOR_PALETTE[i] ?? "#444" }}
            />
            {seg.sector}
            <span className="num" style={{ color: "#888", marginLeft: 3 }}>
              {((seg.weight / total) * 100).toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function TierExposureBar({ basket }: { basket: ThemeBasket }): JSX.Element {
  const core = basket.rows.filter((r) => r.tier === "Core");
  const sig = basket.rows.filter((r) => r.tier === "Significant");
  const peri = basket.rows.filter((r) => r.tier === "Peripheral");
  const wCore = core.reduce((s, r) => s + r.basketWeight, 0);
  const wSig = sig.reduce((s, r) => s + r.basketWeight, 0);
  const wPeri = peri.reduce((s, r) => s + r.basketWeight, 0);
  const total = wCore + wSig + wPeri || 1;

  return (
    <div>
      <div className="num" style={{ fontSize: 9, color: "#666", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
        Tier purity · MSCI ≥50% pure-play / Bloomberg Tier 1
      </div>
      <div
        style={{
          display: "flex",
          height: 16,
          border: "1px solid #1d1d1d",
          background: "#0a0a0a",
        }}
      >
        <div style={{ width: `${(wCore / total) * 100}%`, background: "#ff2e88" }} />
        <div style={{ width: `${(wSig / total) * 100}%`, background: "#5ec4e0" }} />
        <div style={{ width: `${(wPeri / total) * 100}%`, background: "#7a7a7a" }} />
      </div>
      <div
        className="flex items-center"
        style={{ marginTop: 8, gap: 14, fontSize: 10.5 }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#d8d8d8" }}>
          <span aria-hidden="true" style={{ width: 8, height: 8, background: "#ff2e88" }} />
          Core ({core.length})
          <span className="num" style={{ color: "#888", marginLeft: 3 }}>
            {((wCore / total) * 100).toFixed(0)}%
          </span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#d8d8d8" }}>
          <span aria-hidden="true" style={{ width: 8, height: 8, background: "#5ec4e0" }} />
          Significant ({sig.length})
          <span className="num" style={{ color: "#888", marginLeft: 3 }}>
            {((wSig / total) * 100).toFixed(0)}%
          </span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#d8d8d8" }}>
          <span aria-hidden="true" style={{ width: 8, height: 8, background: "#7a7a7a" }} />
          Peripheral ({peri.length})
          <span className="num" style={{ color: "#888", marginLeft: 3 }}>
            {((wPeri / total) * 100).toFixed(0)}%
          </span>
        </span>
      </div>
    </div>
  );
}

function ConstituentRow({ r, i }: { r: ThemeBasketRow; i: number }): JSX.Element {
  const trend = r.ytdReturn ?? 0;
  return (
    <div
      className="grid items-center hover:bg-[#1a1a1a]"
      style={{
        gridTemplateColumns: "70px 1fr 70px 70px 60px 60px 80px 76px 110px 100px",
        height: 28,
        padding: "0 14px",
        borderBottom: "1px solid #111",
        background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
        gap: 8,
      }}
    >
      <TickerLink ticker={r.ticker} market={r.region === "GLOBAL" ? "US" : r.region} size="sm" />
      <span
        style={{
          fontSize: 11,
          color: "#d8d8d8",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {r.name}
      </span>
      <span
        className="num"
        style={{
          fontSize: 11,
          color: "#f5f5f5",
          textAlign: "right",
          fontWeight: 500,
        }}
      >
        {(r.basketWeight * 100).toFixed(2)}
      </span>
      <span
        className="num"
        style={{
          fontSize: 11,
          color: r.score == null ? "#666" : r.score >= 75 ? "#ff2e88" : "#d8d8d8",
          textAlign: "right",
          fontWeight: r.score != null && r.score >= 75 ? 600 : 400,
        }}
      >
        {r.score == null ? "—" : r.score.toFixed(0)}
      </span>
      <span
        className="num"
        style={{ fontSize: 11, color: tone(r.compositeZ), textAlign: "right" }}
      >
        {r.compositeZ == null ? "—" : `${r.compositeZ >= 0 ? "+" : ""}${r.compositeZ.toFixed(2)}`}
      </span>
      <span
        className="num"
        style={{ fontSize: 11, color: "#ff2e88", textAlign: "right", fontWeight: 600 }}
      >
        {r.relevancePct}%
      </span>
      <span
        className="num"
        style={{
          fontSize: 9.5,
          color: tierColor(r.tier),
          border: `1px solid ${tierColor(r.tier)}`,
          padding: "1px 5px",
          letterSpacing: "0.08em",
          fontWeight: 600,
          justifySelf: "start",
          alignSelf: "center",
        }}
      >
        {r.tier.toUpperCase()}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center" }}>
        <Sparkline
          values={deterministicWalk(r.ticker, 24, trend / 100, 0.025)}
          width={72}
          height={16}
          showAreaFill
        />
      </span>
      <span
        style={{
          fontSize: 10.5,
          color: "#b8b8b8",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {r.sector ?? "—"}
      </span>
      <span
        className="num"
        style={{ fontSize: 9.5, color: "#7a7a7a", letterSpacing: "0.04em" }}
      >
        {r.source}
      </span>
    </div>
  );
}
