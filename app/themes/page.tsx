import Link from "next/link";
import TickerLink from "@/components/primitives/TickerLink";
import { THEMES, THEME_CATEGORIES } from "@/lib/themes/catalog";
import { buildThemeBasket } from "@/lib/themes/engine";
import type { Theme, ThemeBasket } from "@/lib/themes/types";
import { CitationCluster } from "@/components/primitives/CitationChip";

export const revalidate = 3600;

// ── primitives ──────────────────────────────────────────────────

function tone(z: number): string {
  if (z > 0.3) return "#00d97e";
  if (z < -0.3) return "#ff4d4f";
  return "#b8b8b8";
}

function PanelHead({
  title,
  meta,
}: {
  title: string;
  meta?: React.ReactNode;
}): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        height: 24,
        padding: "0 14px",
        borderTop: "1px solid #2a2a2a",
        borderBottom: "1px solid #2a2a2a",
        background: "#050505",
        gap: 10,
      }}
    >
      <span
        style={{
          fontSize: 9,
          color: "#ff2e88",
          letterSpacing: "0.14em",
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      {meta ? (
        <span className="num ml-auto" style={{ fontSize: 9, color: "#666", letterSpacing: "0.06em" }}>
          {meta}
        </span>
      ) : null}
    </div>
  );
}

// ── header ──────────────────────────────────────────────────────

function PageHeader(): JSX.Element {
  const counts = THEME_CATEGORIES.map((cat) => ({
    cat,
    n: THEMES.filter((t) => t.category === cat).length,
  }));
  const us = THEMES.filter((t) => t.region === "US").length;
  const idx = THEMES.filter((t) => t.region === "IDX").length;

  return (
    <div style={{ padding: "12px 14px", borderBottom: "1px solid #2a2a2a" }}>
      <div className="flex items-baseline" style={{ gap: 12, flexWrap: "wrap" }}>
        <span className="num" style={{ fontSize: 9, color: "#666", letterSpacing: "0.14em" }}>
          12 · DISCOVERY LENS
        </span>
        <h1 style={{ fontSize: 20, color: "#f5f5f5", fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>
          Themes
        </h1>
        <span className="num" style={{ fontSize: 10, color: "#888" }}>
          {THEMES.length} baskets · {us} US · {idx} IDX
        </span>
        <span className="num ml-auto" style={{ fontSize: 9.5, color: "#666", letterSpacing: "0.04em" }}>
          {counts.map((c) => `${c.cat.split(" ")[0]} ${c.n}`).join(" · ")}
        </span>
      </div>
      <p
        style={{
          fontSize: 10.5,
          color: "#7a7a7a",
          margin: "6px 0 0",
          lineHeight: 1.5,
          maxWidth: "120ch",
        }}
      >
        Hand-curated baskets · MSCI relevance + Bloomberg tiers · constituents from 10-K text + XBRL segments + analyst tagging.{" "}
        <span style={{ color: "#ff2e88" }}>Research lens, not a buy signal.</span>{" "}
        Ben-David et al. (2023) finds thematic ETFs underperform broad markets by ~6%/yr in their first 5 years
        (~30% risk-adjusted destruction); Morningstar 91% 15-yr failure rate. Validate every idea on{" "}
        <Link href="/research" className="hover:underline" style={{ color: "#ff2e88" }}>/research</Link> +{" "}
        <Link href="/backtest" className="hover:underline" style={{ color: "#ff2e88" }}>/backtest</Link>{" "}
        before sizing.
      </p>
    </div>
  );
}

// ── compact themes table — the main surface ─────────────────────

function ThemesTable(): JSX.Element {
  const rows = THEMES.map((t) => {
    const b = buildThemeBasket(t);
    const topZ = [...b.rows]
      .filter((r) => r.compositeZ != null)
      .sort((a, b) => (b.compositeZ ?? 0) - (a.compositeZ ?? 0))[0];
    return {
      theme: t,
      basket: b,
      topThree: b.rows.slice(0, 3),
      topZ,
    };
  }).sort((a, b) => b.basket.weightedZ - a.basket.weightedZ);

  return (
    <section>
      <PanelHead
        title="All Themes · sortable"
        meta={`ranked by basket Z · ${rows.length} baskets`}
      />
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: "1fr 36px 110px 220px 40px 36px 56px 60px 50px 110px 90px",
          height: 22,
          padding: "0 14px",
          background: "#050505",
          borderBottom: "1px solid #2a2a2a",
          fontSize: 8.5,
          color: "#555",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          gap: 6,
        }}
      >
        <span>Theme</span>
        <span>Reg</span>
        <span>Category</span>
        <span>Top 3 names</span>
        <span style={{ textAlign: "right" }}>N</span>
        <span style={{ textAlign: "right" }}>Core</span>
        <span style={{ textAlign: "right" }}>Basket Z</span>
        <span style={{ textAlign: "right" }}>Avg Rel</span>
        <span>Tiers</span>
        <span>Top sector</span>
        <span>Weighting</span>
      </div>
      {rows.map((r, i) => {
        const zColor = tone(r.basket.weightedZ);
        const core = r.basket.rows.filter((x) => x.tier === "Core").length;
        const sig = r.basket.rows.filter((x) => x.tier === "Significant").length;
        const peri = r.basket.rows.filter((x) => x.tier === "Peripheral").length;
        const total = r.basket.rows.length || 1;
        return (
          <Link
            key={r.theme.slug}
            href={`/themes/${r.theme.slug}`}
            className="grid items-center hover:bg-[#1a1a1a]"
            style={{
              gridTemplateColumns: "1fr 36px 110px 220px 40px 36px 56px 60px 50px 110px 90px",
              height: 26,
              padding: "0 14px",
              borderBottom: "1px solid #111",
              background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
              fontSize: 11,
              gap: 6,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span
              style={{
                color: "#d8d8d8",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: 500,
              }}
              title={r.theme.blurb}
            >
              {r.theme.name}
            </span>
            <span
              className="num"
              style={{
                fontSize: 9,
                color: "#7a7a7a",
                border: "1px solid #2a2a2a",
                padding: "1px 3px",
                letterSpacing: "0.06em",
                justifySelf: "start",
              }}
            >
              {r.theme.region}
            </span>
            <span
              className="num"
              style={{
                fontSize: 9.5,
                color: "#888",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {r.theme.category}
            </span>
            <span
              style={{
                display: "inline-flex",
                gap: 6,
                alignItems: "center",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {r.topThree.map((row) => (
                <TickerLink
                  key={row.ticker}
                  ticker={row.ticker}
                  market={row.region === "GLOBAL" ? "US" : row.region}
                  size="xs"
                />
              ))}
              {r.basket.rows.length > 3 ? (
                <span className="num" style={{ fontSize: 9, color: "#555" }}>
                  +{r.basket.rows.length - 3}
                </span>
              ) : null}
            </span>
            <span className="num" style={{ textAlign: "right", color: "#d8d8d8" }}>
              {r.basket.totalNames}
            </span>
            <span className="num" style={{ textAlign: "right", color: "#ff2e88", fontWeight: 600 }}>
              {core}
            </span>
            <span
              className="num"
              style={{ textAlign: "right", color: zColor, fontWeight: 600 }}
            >
              {r.basket.weightedZ >= 0 ? "+" : ""}
              {r.basket.weightedZ.toFixed(2)}σ
            </span>
            <span className="num" style={{ textAlign: "right", color: "#ff2e88", fontWeight: 600 }}>
              {r.basket.avgRelevance.toFixed(0)}%
            </span>
            <span
              style={{
                display: "flex",
                height: 4,
                alignSelf: "center",
                background: "#0a0a0a",
                border: "1px solid #1d1d1d",
              }}
              title={`${core} Core · ${sig} Significant · ${peri} Peripheral`}
            >
              <div style={{ width: `${(core / total) * 100}%`, background: "#ff2e88" }} />
              <div style={{ width: `${(sig / total) * 100}%`, background: "#5ec4e0" }} />
              <div style={{ width: `${(peri / total) * 100}%`, background: "#7a7a7a" }} />
            </span>
            <span
              style={{
                color: "#b8b8b8",
                fontSize: 10,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {r.basket.topSector ?? "—"}
            </span>
            <span className="num" style={{ fontSize: 9.5, color: "#7a7a7a", letterSpacing: "0.04em" }}>
              {r.theme.methodology.weighting}
            </span>
          </Link>
        );
      })}
    </section>
  );
}

// ── methodology footer — compact ────────────────────────────────

function MethodologyFooter(): JSX.Element {
  return (
    <div style={{ padding: "10px 14px", borderTop: "1px solid #2a2a2a", background: "#050505" }}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          fontSize: 10,
          color: "#888",
          lineHeight: 1.55,
        }}
      >
        <div>
          <div
            className="num"
            style={{
              fontSize: 8.5,
              color: "#666",
              letterSpacing: "0.1em",
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
            Construction
          </div>
          Direct route = 100% segment-revenue match; indirect route = SIC-mapped revenue, discounted. Eligibility{" "}
          &gt;25%, pure-play ≥50% per MSCI; Bloomberg revenue tiers (T1 &gt;50%, T2 20-50%, T3 &lt;20%). Composite
          Z restricted to constituents = same engine as{" "}
          <Link href="/picks" className="hover:underline" style={{ color: "#ff2e88" }}>/picks</Link>.
          Stage-1 memberships are{" "}
          <span style={{ color: "#ff2e88" }}>analyst-tagged</span>; Stage-2 swaps to EDGAR full-text search + XBRL
          revenue segments + IDX iXBRL with a GICS guardrail.
        </div>
        <div>
          <div
            className="num"
            style={{
              fontSize: 8.5,
              color: "#666",
              letterSpacing: "0.1em",
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
            Honest caveat — founded on
          </div>
          Thematic ETFs have historically delivered the largest behaviour gap in equity investing — peak-hype
          launches, 6%/yr underperformance through five years (Ben-David, Franzoni, Kim &amp; Moussawi 2023),
          ~91% 15-yr failure rate (Morningstar 2022). Use this surface as a discovery and screening tool, validate on{" "}
          <Link href="/research" className="hover:underline" style={{ color: "#ff2e88" }}>/research</Link> +{" "}
          <Link href="/backtest" className="hover:underline" style={{ color: "#ff2e88" }}>/backtest</Link>{" "}
          before sizing.
          <div style={{ marginTop: 8 }}>
            <CitationCluster
              ids={[
                "msci-thematic-relevance",
                "bloomberg-thematic-protocol",
                "ben-david-franzoni-kim-moussawi-2023",
                "morningstar-thematic-2022",
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────

export default function ThemesHubPage(): JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader />
      <ThemesTable />
      <MethodologyFooter />
    </div>
  );
}
