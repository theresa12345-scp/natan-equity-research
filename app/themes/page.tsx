import Link from "next/link";
import TickerLink from "@/components/primitives/TickerLink";
import { THEMES, THEME_CATEGORIES } from "@/lib/themes/catalog";
import { buildThemeBasket } from "@/lib/themes/engine";
import type { Theme, ThemeBasket } from "@/lib/themes/types";

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

function TierBar({ basket }: { basket: ThemeBasket }): JSX.Element {
  const total = basket.rows.length || 1;
  const core = basket.rows.filter((r) => r.tier === "Core").length;
  const sig = basket.rows.filter((r) => r.tier === "Significant").length;
  const peri = basket.rows.filter((r) => r.tier === "Peripheral").length;
  return (
    <div
      style={{
        display: "flex",
        height: 4,
        background: "#0a0a0a",
        marginTop: 8,
        marginBottom: 10,
      }}
      title={`${core} Core · ${sig} Significant · ${peri} Peripheral`}
    >
      <div style={{ width: `${(core / total) * 100}%`, background: "#ff2e88" }} />
      <div style={{ width: `${(sig / total) * 100}%`, background: "#5ec4e0" }} />
      <div style={{ width: `${(peri / total) * 100}%`, background: "#7a7a7a" }} />
    </div>
  );
}

function ThemeCard({ theme }: { theme: Theme }): JSX.Element {
  const basket = buildThemeBasket(theme);
  const zColor = tone(basket.weightedZ);
  const coreCount = basket.coreNames;
  // Top 3 by basket weight for the preview row
  const topThree = basket.rows.slice(0, 3);
  // Highest-Z constituent for the "top conviction" line
  const topZ = [...basket.rows]
    .filter((r) => r.compositeZ != null)
    .sort((a, b) => (b.compositeZ ?? 0) - (a.compositeZ ?? 0))[0];

  return (
    <Link
      href={`/themes/${theme.slug}`}
      className="hover:bg-[#0a0a0a]"
      style={{
        display: "block",
        padding: "14px 16px 12px",
        textDecoration: "none",
        color: "inherit",
        borderRight: "1px solid #1d1d1d",
        borderBottom: "1px solid #1d1d1d",
        minHeight: 200,
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
        <span
          className="num ml-auto"
          style={{
            fontSize: 8.5,
            color: zColor,
            border: `1px solid ${zColor}`,
            padding: "1px 5px",
            letterSpacing: "0.08em",
            fontWeight: 600,
            background: "rgba(255,46,136,0.04)",
          }}
        >
          {basket.weightedZ >= 0 ? "+" : ""}
          {basket.weightedZ.toFixed(2)}σ
        </span>
      </div>
      <div
        style={{
          fontSize: 15,
          color: "#f5f5f5",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          lineHeight: 1.25,
          marginBottom: 4,
        }}
      >
        {theme.name}
      </div>
      <div style={{ fontSize: 11, color: "#888", lineHeight: 1.45 }}>
        {theme.blurb}
      </div>

      {/* Tier distribution bar — core/significant/peripheral split */}
      <TierBar basket={basket} />

      {/* Top 3 ticker preview (avoids the user needing to click) */}
      <div
        className="flex items-center"
        style={{ gap: 8, flexWrap: "wrap", marginBottom: 10 }}
      >
        {topThree.map((r) => (
          <TickerLink
            key={r.ticker}
            ticker={r.ticker}
            market={r.region === "GLOBAL" ? "US" : r.region}
            size="xs"
          />
        ))}
        {basket.rows.length > 3 ? (
          <span
            className="num"
            style={{ fontSize: 9.5, color: "#666", letterSpacing: "0.04em" }}
          >
            +{basket.rows.length - 3} more
          </span>
        ) : null}
      </div>

      {/* Compact KPI row */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
          borderTop: "1px solid #1d1d1d",
          paddingTop: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 8, color: "#666", letterSpacing: "0.08em" }}>NAMES</div>
          <div className="num" style={{ fontSize: 12, color: "#f5f5f5", marginTop: 2 }}>
            {basket.totalNames}
            <span style={{ color: "#666", fontSize: 9, marginLeft: 4 }}>
              ({coreCount} core)
            </span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: "#666", letterSpacing: "0.08em" }}>AVG REL</div>
          <div className="num" style={{ fontSize: 12, color: "#ff2e88", marginTop: 2, fontWeight: 600 }}>
            {basket.avgRelevance.toFixed(0)}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: "#666", letterSpacing: "0.08em" }}>TOP Z</div>
          <div
            className="num"
            style={{
              fontSize: 11,
              color: "#f5f5f5",
              marginTop: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={topZ ? `${topZ.ticker} ${topZ.compositeZ?.toFixed(2) ?? ""}σ` : ""}
          >
            {topZ ? (
              <>
                <span style={{ color: "#ff2e88", fontWeight: 600 }}>{topZ.ticker}</span>
                <span style={{ color: tone(topZ.compositeZ ?? 0), marginLeft: 4 }}>
                  {topZ.compositeZ != null
                    ? `${topZ.compositeZ >= 0 ? "+" : ""}${topZ.compositeZ.toFixed(2)}`
                    : "—"}
                </span>
              </>
            ) : (
              "—"
            )}
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

function AllThemesTable(): JSX.Element {
  // Compare-all table — Bloomberg BI BSKT<GO> + ETFdb convention.
  const rows = THEMES.map((t) => {
    const b = buildThemeBasket(t);
    return {
      slug: t.slug,
      name: t.name,
      region: t.region,
      category: t.category,
      total: b.totalNames,
      core: b.coreNames,
      basketZ: b.weightedZ,
      avgRel: b.avgRelevance,
      topSector: b.topSector,
      weighting: t.methodology.weighting,
    };
  }).sort((a, b) => b.basketZ - a.basketZ);

  return (
    <section>
      <PanelHead
        title="All Themes · sortable comparison"
        meta="ranked by basket Z ▾"
      />
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: "1fr 50px 180px 60px 80px 80px 130px 100px",
          height: 24,
          padding: "0 14px",
          background: "#050505",
          borderBottom: "1px solid #2a2a2a",
          fontSize: 9,
          color: "#555",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          gap: 8,
        }}
      >
        <span>Theme</span>
        <span>Reg</span>
        <span>Category</span>
        <span style={{ textAlign: "right" }}>Names</span>
        <span style={{ textAlign: "right" }}>Basket Z</span>
        <span style={{ textAlign: "right" }}>Avg Rel</span>
        <span>Top Sector</span>
        <span>Weighting</span>
      </div>
      {rows.map((r, i) => {
        const zColor = tone(r.basketZ);
        return (
          <Link
            key={r.slug}
            href={`/themes/${r.slug}`}
            className="grid items-center hover:bg-[#1a1a1a]"
            style={{
              gridTemplateColumns: "1fr 50px 180px 60px 80px 80px 130px 100px",
              height: 26,
              padding: "0 14px",
              borderBottom: "1px solid #111",
              background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
              fontSize: 11,
              gap: 8,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span style={{ color: "#d8d8d8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.name}
            </span>
            <span
              className="num"
              style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: "0.06em" }}
            >
              {r.region}
            </span>
            <span
              className="num"
              style={{ fontSize: 9.5, color: "#888", letterSpacing: "0.04em" }}
            >
              {r.category}
            </span>
            <span className="num" style={{ textAlign: "right", color: "#d8d8d8" }}>
              {r.total}
              <span style={{ color: "#666", fontSize: 9, marginLeft: 3 }}>
                ({r.core})
              </span>
            </span>
            <span
              className="num"
              style={{ textAlign: "right", color: zColor, fontWeight: 600 }}
            >
              {r.basketZ >= 0 ? "+" : ""}
              {r.basketZ.toFixed(2)}σ
            </span>
            <span className="num" style={{ textAlign: "right", color: "#ff2e88", fontWeight: 600 }}>
              {r.avgRel.toFixed(0)}%
            </span>
            <span style={{ color: "#b8b8b8", fontSize: 10.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.topSector ?? "—"}
            </span>
            <span className="num" style={{ fontSize: 9.5, color: "#7a7a7a", letterSpacing: "0.04em" }}>
              {r.weighting}
            </span>
          </Link>
        );
      })}
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
      <AllThemesTable />
      <MethodologyFooter />
    </div>
  );
}
