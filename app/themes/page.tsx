import Link from "next/link";
import { THEMES, THEME_CATEGORIES } from "@/lib/themes/catalog";
import { buildThemeBasket } from "@/lib/themes/engine";
import type { Theme } from "@/lib/themes/types";

export const revalidate = 3600;

function tone(z: number): string {
  if (z > 0.3) return "#00d97e";
  if (z < -0.3) return "#ff4d4f";
  return "#b8b8b8";
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

function PageHeader(): JSX.Element {
  return (
    <div style={{ padding: "20px 14px", borderBottom: "1px solid #2a2a2a" }}>
      <div className="num" style={{ fontSize: 9, color: "#666", letterSpacing: "0.14em", textTransform: "uppercase" }}>
        MERIDIAN · DISCOVERY LENS · 12
      </div>
      <h1 style={{ fontSize: 26, color: "#f5f5f5", fontWeight: 500, letterSpacing: "-0.01em", margin: "6px 0 4px" }}>
        Themes
      </h1>
      <p style={{ fontSize: 12, color: "#888", margin: 0, maxWidth: "82ch", lineHeight: 1.55 }}>
        Hand-curated thematic baskets — IDX + US — built bottom-up from segment revenue + business-description text +
        analyst-tagging. Each theme shows relevance tiers (Core / Significant / Peripheral), a composite-Z restricted
        to constituents, and explicit methodology. <span style={{ color: "#ff2e88" }}>This is a research lens, not a
        buy signal.</span> Ben-David et al. (2023, <em>RFS</em>) find specialized thematic ETFs lose ~30% risk-adjusted
        over their first five years; Morningstar reports a ~91% 15-year failure rate. We surface themes with that
        evidence attached.
      </p>
    </div>
  );
}

function ThemeCard({ theme }: { theme: Theme }): JSX.Element {
  const basket = buildThemeBasket(theme);
  const zColor = tone(basket.weightedZ);
  const coreCount = basket.coreNames;
  return (
    <Link
      href={`/themes/${theme.slug}`}
      className="hover:bg-[#0a0a0a]"
      style={{
        display: "block",
        padding: "16px 16px 14px",
        textDecoration: "none",
        color: "inherit",
        borderRight: "1px solid #1d1d1d",
        borderBottom: "1px solid #1d1d1d",
        minHeight: 184,
      }}
    >
      <div className="flex items-baseline" style={{ gap: 8, marginBottom: 4 }}>
        <span
          className="num"
          style={{
            fontSize: 9,
            color: "#7a7a7a",
            border: "1px solid #2a2a2a",
            padding: "1px 5px",
            letterSpacing: "0.08em",
          }}
        >
          {theme.region}
        </span>
        <span
          className="num"
          style={{
            fontSize: 9,
            color: "#666",
            letterSpacing: "0.04em",
          }}
        >
          {theme.category}
        </span>
      </div>
      <div
        style={{
          fontSize: 16,
          color: "#f5f5f5",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          lineHeight: 1.25,
          marginBottom: 6,
        }}
      >
        {theme.name}
      </div>
      <div style={{ fontSize: 11, color: "#888", lineHeight: 1.5, marginBottom: 12 }}>
        {theme.blurb}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        <div>
          <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em" }}>NAMES</div>
          <div className="num" style={{ fontSize: 14, color: "#f5f5f5", marginTop: 2 }}>
            {basket.totalNames}
          </div>
          <div className="num" style={{ fontSize: 9, color: "#7a7a7a", marginTop: 1 }}>
            {coreCount} core
          </div>
        </div>
        <div>
          <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em" }}>BASKET Z</div>
          <div
            className="num"
            style={{ fontSize: 14, color: zColor, marginTop: 2, fontWeight: 600 }}
          >
            {basket.weightedZ >= 0 ? "+" : ""}
            {basket.weightedZ.toFixed(2)}σ
          </div>
          <div className="num" style={{ fontSize: 9, color: "#7a7a7a", marginTop: 1 }}>
            {theme.methodology.weighting}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em" }}>AVG REL</div>
          <div className="num" style={{ fontSize: 14, color: "#ff2e88", marginTop: 2, fontWeight: 600 }}>
            {basket.avgRelevance.toFixed(0)}%
          </div>
          <div className="num" style={{ fontSize: 9, color: "#7a7a7a", marginTop: 1 }}>
            floor {theme.methodology.eligibilityFloorPct}%
          </div>
        </div>
      </div>
    </Link>
  );
}

function CategorySection({ cat }: { cat: Theme["category"] }): JSX.Element {
  const themes = THEMES.filter((t) => t.category === cat);
  if (themes.length === 0) return <></>;
  return (
    <section>
      <PanelHead title={cat} meta={`${themes.length} themes`} />
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        }}
      >
        {themes.map((t) => (
          <ThemeCard key={t.slug} theme={t} />
        ))}
      </div>
    </section>
  );
}

function MethodologyFooter(): JSX.Element {
  return (
    <div style={{ padding: "14px 14px", borderTop: "1px solid #2a2a2a", background: "#050505" }}>
      <div className="num" style={{ fontSize: 9, color: "#666", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
        Methodology · /themes
      </div>
      <div style={{ fontSize: 10.5, color: "#888", lineHeight: 1.55, maxWidth: "100ch" }}>
        Construction follows the MSCI thematic-relevance pattern (direct route: revenue counts 100% if segment matches
        theme keyword; indirect route: SIC-mapped revenue discounted; eligibility &gt;25%, pure-play ≥50%) crossed with
        Bloomberg revenue-tied tiers (Tier 1 &gt;50%, Tier 2 20–50%, Tier 3 &lt;20%). The score restricted to theme
        constituents is identical to the composite Z shown on <Link href="/picks" style={{ color: "#ff2e88" }}>/picks</Link>{" "}
        and per-ticker pages. Weighting choices: relevance (MSCI-style), equal (ARK / Global X), market-cap, or
        score-vol (Meridian Conviction × inverse-vol). All Stage-1 memberships are <span style={{ color: "#ffa940" }}>analyst-tagged</span>;
        Stage-2 will swap to SEC EDGAR full-text search + XBRL revenue segments + IDX iXBRL with a GICS guardrail.
      </div>
      <div style={{ fontSize: 10.5, color: "#888", lineHeight: 1.55, maxWidth: "100ch", marginTop: 8 }}>
        <span style={{ color: "#ff4d4f", fontWeight: 600 }}>Honest caveat.</span> Thematic ETFs have historically
        delivered the largest behavior gap in equity investing. The peer-reviewed evidence
        (<Link href="/sources#cite-ben-david-franzoni-kim-moussawi-2023" style={{ color: "#ff2e88" }}>Ben-David, Franzoni, Kim &amp; Moussawi 2023</Link>{" "}
        and{" "}
        <Link href="/sources#cite-morningstar-thematic-2022" style={{ color: "#ff2e88" }}>Morningstar 2022</Link>) is
        that thematic launches arrive at peak hype, underperform broad markets by 6%/yr in their first five years,
        and survive-and-outperform only ~10% of the time over 15 years. Use /themes as a discovery and screening tool;
        validate each idea on /research and /backtest before sizing.
      </div>
    </div>
  );
}

export default function ThemesPage(): JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader />
      {THEME_CATEGORIES.map((cat) => (
        <CategorySection key={cat} cat={cat} />
      ))}
      <MethodologyFooter />
    </div>
  );
}
