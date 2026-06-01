import {
  SOURCES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  countByStatus,
  type SourceRecord,
  type SourceStatus,
  type SourceSustain,
  type SourceAuth,
} from "@/lib/data/sources";
import {
  CITATIONS,
  CITE_CATEGORY_LABELS,
  type Citation,
  type CiteCategory,
} from "@/lib/data/citations";
import {
  ALL_DATA_CLASSES,
  dataClassSummary,
  type DataClass,
} from "@/lib/data/providers";
import { fetchEdgarSnapshot, fmtEdgarValue, type EdgarSnapshot } from "@/lib/data/fetchers/edgar";
import { fetchFREDSeries } from "@/lib/fetchers/fred";
import Pulse from "@/components/primitives/Pulse";

// Force-dynamic: this page hits SEC EDGAR + FRED at render time and we
// don't want Next.js to attempt prerender during build (those external
// services can block Vercel build IPs / hang past the 60s static-gen cap
// and fail the deployment). Render on request with the fetcher's own
// cache + the LIVE/FALLBACK chips on the page.
export const dynamic = "force-dynamic";

// ── colour mappings ──────────────────────────────────────────────

function statusColor(s: SourceStatus): string {
  if (s === "live") return "#00d97e";
  if (s === "fallback") return "#ffa940";
  if (s === "paid-only") return "#7a7a7a";
  return "#ff2e88"; // planned
}

function statusLabel(s: SourceStatus): string {
  if (s === "paid-only") return "PAID";
  return s.toUpperCase();
}

function sustainColor(s: SourceSustain): string {
  if (s === "stable") return "#00d97e";
  if (s === "tightened") return "#ffa940";
  if (s === "fragile") return "#ff4d4f";
  return "#666"; // deprecated
}

function authColor(a: SourceAuth): string {
  if (a === "none") return "#00d97e";
  if (a === "ua-only") return "#7a7a7a";
  if (a === "key") return "#ffa940";
  return "#ff4d4f"; // oauth
}

function edgeBadgeColor(rank: 1 | 2 | 3): string {
  if (rank === 1) return "#ff2e88";
  if (rank === 2) return "#5ec4e0";
  return "#666";
}

// ── primitives ───────────────────────────────────────────────────

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

// ── header ───────────────────────────────────────────────────────

function PageHeader(): JSX.Element {
  const counts = countByStatus();
  return (
    <div style={{ padding: "20px 14px", borderBottom: "1px solid #2a2a2a" }}>
      <div className="num" style={{ fontSize: 9, color: "#666", letterSpacing: "0.14em", textTransform: "uppercase" }}>
        MERIDIAN · DATA PROVENANCE · §11
      </div>
      <h1 style={{ fontSize: 26, color: "#f5f5f5", fontWeight: 500, letterSpacing: "-0.01em", margin: "6px 0 4px" }}>
        Free Edge Sources
      </h1>
      <p style={{ fontSize: 12, color: "#888", margin: 0, maxWidth: "82ch", lineHeight: 1.5 }}>
        Every data feed, citation, and provider abstraction backing this dashboard. The thesis: real edge from free data
        comes from primary documents (SEC EDGAR XBRL, IDX iXBRL, KSEI demographics) + macro/regime context (FRED, BI,
        BPS) + the academic factor library (Damodaran, Ken French, Novy-Marx, Piotroski, Mauboussin). Price feeds are
        commoditised — they're inputs, not edge. Show the citations, not just the charts.
      </p>

      <div className="grid" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 0, marginTop: 16, border: "1px solid #2a2a2a" }}>
        {[
          { label: "TOTAL SOURCES", value: String(SOURCES.length), tone: "#f5f5f5" },
          { label: "LIVE", value: String(counts.live), tone: "#00d97e" },
          { label: "FALLBACK", value: String(counts.fallback), tone: "#ffa940" },
          { label: "PLANNED", value: String(counts.planned), tone: "#ff2e88" },
          { label: "PAID-ONLY", value: String(counts["paid-only"]), tone: "#7a7a7a" },
        ].map((c, i) => (
          <div
            key={c.label}
            style={{
              padding: "10px 14px",
              borderRight: i < 4 ? "1px solid #1d1d1d" : "none",
            }}
          >
            <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.1em", marginBottom: 4 }}>{c.label}</div>
            <div className="num" style={{ fontSize: 18, color: c.tone, fontWeight: 600, letterSpacing: "-0.01em" }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── data-class router strip ──────────────────────────────────────

function ProviderRouterStrip(): JSX.Element {
  return (
    <section>
      <PanelHead title="Provider Abstraction · fallback chains" meta="lib/data/providers.ts" />
      <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        {ALL_DATA_CLASSES.map((dc, idx) => {
          const sum = dataClassSummary(dc);
          return (
            <div
              key={dc}
              style={{
                padding: "10px 14px",
                borderRight: idx % 2 === 0 ? "1px solid #1d1d1d" : "none",
                borderBottom: "1px solid #1d1d1d",
                minHeight: 96,
              }}
            >
              <div className="flex items-baseline" style={{ gap: 8 }}>
                <span style={{ fontSize: 10, color: "#ff2e88", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                  {sum.label}
                </span>
                <span
                  className="num ml-auto"
                  style={{
                    fontSize: 8.5,
                    color: statusColor(sum.primaryStatus),
                    border: `1px solid ${statusColor(sum.primaryStatus)}`,
                    padding: "1px 5px",
                    letterSpacing: "0.12em",
                    fontWeight: 600,
                  }}
                >
                  {statusLabel(sum.primaryStatus)}
                </span>
              </div>
              <div style={{ fontSize: 10.5, color: "#888", marginTop: 4, lineHeight: 1.45 }}>
                {sum.description}
              </div>
              <div className="num" style={{ fontSize: 9.5, color: "#7a7a7a", marginTop: 6, letterSpacing: "0.04em" }}>
                <span style={{ color: "#d8d8d8" }}>
                  {sum.primary?.name ?? "—"}
                </span>
                {sum.fallback.length > 0 ? (
                  <span style={{ color: "#555" }}>
                    {" → "}
                    {sum.fallback.map((f) => f.name).join(" → ")}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── sources table (per category) ─────────────────────────────────

function SourceRow({ s, i }: { s: SourceRecord; i: number }): JSX.Element {
  return (
    <div
      className="grid items-center hover:bg-[#1a1a1a]"
      style={{
        gridTemplateColumns: "200px 50px 60px 70px 1fr 110px 60px 60px",
        height: 30,
        padding: "0 14px",
        borderBottom: "1px solid #111",
        background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
        gap: 8,
      }}
    >
      <a
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 11,
          color: "#d8d8d8",
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textDecoration: "none",
        }}
        title={s.url}
      >
        {s.name}
      </a>
      <span className="num" style={{ fontSize: 9.5, color: "#7a7a7a", letterSpacing: "0.06em" }}>
        {s.region}
      </span>
      <span
        className="num"
        style={{
          fontSize: 9,
          color: authColor(s.auth),
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
      >
        {s.auth.toUpperCase()}
      </span>
      <span
        className="num"
        style={{
          fontSize: 9,
          color: sustainColor(s.sustainability),
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
        title={`Sustainability: ${s.sustainability}`}
      >
        {s.sustainability.toUpperCase().slice(0, 6)}
      </span>
      <span
        style={{
          fontSize: 10.5,
          color: "#b8b8b8",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={s.useCases}
      >
        {s.useCases}
      </span>
      <span
        className="num"
        style={{
          fontSize: 9.5,
          color: "#888",
          letterSpacing: "0.04em",
        }}
        title="Free tier limits"
      >
        {s.freeTier}
      </span>
      <span
        className="num"
        style={{
          fontSize: 9,
          color: edgeBadgeColor(s.edgeRank),
          border: `1px solid ${edgeBadgeColor(s.edgeRank)}`,
          padding: "1px 5px",
          letterSpacing: "0.06em",
          fontWeight: 600,
          textAlign: "center",
        }}
        title={
          s.edgeRank === 1
            ? "Tier 1 — primary edge"
            : s.edgeRank === 2
              ? "Tier 2 — workhorse"
              : "Tier 3 — commodity"
        }
      >
        T{s.edgeRank}
      </span>
      <span
        className="num"
        style={{
          fontSize: 9,
          color: statusColor(s.status),
          border: `1px solid ${statusColor(s.status)}`,
          padding: "1px 5px",
          letterSpacing: "0.1em",
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {statusLabel(s.status)}
      </span>
    </div>
  );
}

function CategorySection({ cat }: { cat: keyof typeof CATEGORY_LABELS }): JSX.Element {
  const records = SOURCES.filter((s) => s.category === cat);
  if (records.length === 0) return <></>;
  return (
    <section>
      <PanelHead title={CATEGORY_LABELS[cat]} meta={`${records.length} sources`} />
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: "200px 50px 60px 70px 1fr 110px 60px 60px",
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
        <span>Source</span>
        <span>Region</span>
        <span>Auth</span>
        <span>Sustain</span>
        <span>Use cases</span>
        <span>Free tier</span>
        <span style={{ textAlign: "center" }}>Edge</span>
        <span style={{ textAlign: "center" }}>Status</span>
      </div>
      {records.map((s, i) => (
        <SourceRow key={s.id} s={s} i={i} />
      ))}
    </section>
  );
}

// ── citations section ────────────────────────────────────────────

function CitationRow({ c, i }: { c: Citation; i: number }): JSX.Element {
  return (
    <div
      id={`cite-${c.id}`}
      style={{
        padding: "10px 14px",
        borderBottom: "1px solid #111",
        background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
        scrollMarginTop: 80,
      }}
    >
      <div className="flex items-baseline" style={{ gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, color: "#f5f5f5", fontWeight: 500 }}>{c.title}</span>
        <span className="num" style={{ fontSize: 10, color: "#ff2e88", letterSpacing: "0.04em" }}>
          {c.authors} ({c.year})
        </span>
        <span className="num ml-auto" style={{ fontSize: 9.5, color: "#666", letterSpacing: "0.06em" }}>
          {c.venue}
        </span>
      </div>
      <div style={{ fontSize: 10.5, color: "#b8b8b8", marginTop: 4, lineHeight: 1.5 }}>
        {c.keyFinding}
      </div>
      <div className="num" style={{ fontSize: 9.5, color: "#7a7a7a", marginTop: 4, letterSpacing: "0.04em" }}>
        <span style={{ color: "#666" }}>applies to · </span>
        {c.appliesTo.join(" · ")}
      </div>
    </div>
  );
}

function CitationsSection(): JSX.Element {
  const cats: CiteCategory[] = ["factor", "methodology", "data", "regime"];
  return (
    <>
      {cats.map((cat) => {
        const records = CITATIONS.filter((c) => c.category === cat);
        if (records.length === 0) return null;
        return (
          <section key={cat}>
            <PanelHead title={CITE_CATEGORY_LABELS[cat]} meta={`${records.length} citations`} />
            {records.map((c, i) => (
              <CitationRow key={c.id} c={c} i={i} />
            ))}
          </section>
        );
      })}
    </>
  );
}

// ── ToS / risk callouts ──────────────────────────────────────────

function RiskCallouts(): JSX.Element {
  const items = [
    {
      title: "ToS · IDX commercial redistribution forbidden",
      body:
        "IDX Terms of Use §5 explicitly forbids commercial redistribution of data obtained from idx.co.id without written consent. This dashboard is a personal/mentor demo only; any commercial deployment requires a licensed feed (Refinitiv, Bloomberg, ICDX).",
      tone: "#ff4d4f",
    },
    {
      title: "ToS · yfinance personal use",
      body:
        "Yahoo ToS limits yfinance scraping to personal use; using it to back a public dashboard is technically a violation. Mitigate via Stooq + Finnhub fallback chain.",
      tone: "#ffa940",
    },
    {
      title: "Sustainability · Twitter/X effectively paid",
      body:
        "Feb 6 2026: X moved all new developers to pay-per-use. Pay-per-use $0.005 read / $0.015 write; URL writes repriced to $0.20 on Apr 20 2026. Treat as paid. Use Bluesky as the FinTwit migration target.",
      tone: "#7a7a7a",
    },
    {
      title: "Sustainability · FRED API v2 tightened",
      body:
        "Nov 4 2025: FRED launched API v2 and tightened key enforcement on /data/. Scraping libs (e.g., original freduse) broken. Migrate to fredapi (Python) and store the key in an env var.",
      tone: "#ffa940",
    },
    {
      title: "Sustainability · IEX Cloud retired",
      body:
        "Aug 31 2024: IEX Cloud retired. Do not build new integrations on it. Listed in catalog only as historical reference.",
      tone: "#666",
    },
    {
      title: "OpenBB v4.7 · Polygon provider removed",
      body:
        "v4.7 removed the Polygon extension from the core repo. If a Polygon integration is needed, pin OpenBB to v4.6 or install the legacy extension separately.",
      tone: "#ffa940",
    },
  ];

  return (
    <section>
      <PanelHead title="ToS · Sustainability · Risk Callouts" meta="from §12 of the playbook" />
      <div>
        {items.map((it, i) => (
          <div
            key={it.title}
            style={{
              padding: "10px 14px",
              borderBottom: i < items.length - 1 ? "1px solid #111" : "none",
              borderLeft: `2px solid ${it.tone}`,
              background: "#0d0d0d",
            }}
          >
            <div style={{ fontSize: 11, color: "#f5f5f5", fontWeight: 600, letterSpacing: "0.02em" }}>
              {it.title}
            </div>
            <div style={{ fontSize: 10.5, color: "#b8b8b8", marginTop: 4, lineHeight: 1.5, maxWidth: "92ch" }}>
              {it.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── footer ───────────────────────────────────────────────────────

function MethodologyFooter(): JSX.Element {
  return (
    <div style={{ padding: "14px 14px", borderTop: "1px solid #2a2a2a", background: "#050505" }}>
      <div className="num" style={{ fontSize: 9, color: "#666", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
        Methodology · /sources
      </div>
      <div style={{ fontSize: 10.5, color: "#888", lineHeight: 1.55, maxWidth: "100ch" }}>
        Catalog drawn from "The Free Edge Sources Playbook" (May 28 2026). Edge tiers — T1 = primary edge / unique
        information, T2 = workhorse / commodity-with-quota, T3 = commodity. Sustainability — STABLE = generous quota +
        no recent breakage, TIGHTENED = recently rate-limited or key-enforced, FRAGILE = unofficial / scraped,
        DEPRECATED = retired. Status — LIVE = wired and running, FALLBACK = stub-data with parser ready, PLANNED =
        catalogued but not yet wired, PAID = excluded from free build. Provider abstraction in lib/data/providers.ts
        defines fallback chains per data class; the router picks the first available and falls back on rate-limit /
        5xx / parse error. The competitive moat is synthesis: Indonesia + US side-by-side, primary filings + academic
        factors + named research, with cited sources next to every number.
      </div>
    </div>
  );
}

// ── Live Provider Probes — actually hit EDGAR + FRED at render time ──

interface FredProbe {
  series: string;
  label: string;
  ok: boolean;
  latestValue: number | null;
  latestDate: string | null;
  error?: string;
}

async function probeFred(seriesId: string, label: string): Promise<FredProbe> {
  if (!process.env.FRED_API_KEY) {
    return { series: seriesId, label, ok: false, latestValue: null, latestDate: null, error: "FRED_API_KEY not set" };
  }
  const obs = await fetchFREDSeries(seriesId, 1);
  if (obs.length === 0) {
    return { series: seriesId, label, ok: false, latestValue: null, latestDate: null, error: "no observations returned" };
  }
  return { series: seriesId, label, ok: obs[0].value != null, latestValue: obs[0].value, latestDate: obs[0].date };
}

function LiveProbes({
  edgar,
  fred,
}: {
  edgar: EdgarSnapshot | null;
  fred: FredProbe[];
}): JSX.Element {
  const edgarOk = edgar && edgar.source === "live" && edgar.metrics.length > 0;
  const fredAnyOk = fred.some((p) => p.ok);
  return (
    <section>
      <PanelHead
        title="Live Provider Probes · runtime evidence"
        meta="SEC EDGAR + FRED — executed at render time · 6h cache"
      />
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* EDGAR probe */}
        <div style={{ padding: "12px 14px", borderRight: "1px solid #1d1d1d", borderBottom: "1px solid #1d1d1d" }}>
          <div className="flex items-baseline" style={{ gap: 8 }}>
            <span style={{ fontSize: 10, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase" }}>
              SEC EDGAR · companyfacts
            </span>
            <span
              className="num ml-auto flex items-center"
              style={{
                fontSize: 9,
                color: edgarOk ? "#00d97e" : "#ff4d4f",
                border: `1px solid ${edgarOk ? "#00d97e" : "#ff4d4f"}`,
                padding: "1px 5px",
                letterSpacing: "0.12em",
                fontWeight: 600,
                gap: 4,
              }}
            >
              {edgarOk ? <Pulse color="#00d97e" size={6} /> : null}
              {edgarOk ? "LIVE" : "FALLBACK"}
            </span>
          </div>
          {edgar ? (
            <>
              <div className="num" style={{ fontSize: 10, color: "#888", marginTop: 4, letterSpacing: "0.04em" }}>
                {edgar.ticker} · CIK {edgar.cik || "—"} · {edgar.entityName || "—"}
              </div>
              {edgarOk ? (
                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
                  {edgar.metrics.slice(0, 8).map((m) => (
                    <div
                      key={m.concept}
                      className="grid items-baseline"
                      style={{ gridTemplateColumns: "1fr auto", gap: 4, fontSize: 10.5, height: 18 }}
                    >
                      <span style={{ color: "#888" }}>{m.label}</span>
                      <span className="num" style={{ color: "#d8d8d8" }}>{fmtEdgarValue(m)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 10, color: "#888", marginTop: 6, fontStyle: "italic" }}>
                  {edgar.errors?.join(" · ") ?? "no metrics returned"}
                </div>
              )}
              {edgarOk && edgar.metrics[0] ? (
                <div className="num" style={{ fontSize: 9, color: "#666", marginTop: 6, letterSpacing: "0.04em" }}>
                  latest filing · {edgar.metrics[0].form} · FY{edgar.metrics[0].fy} {edgar.metrics[0].fp} · filed {edgar.metrics[0].filed}
                </div>
              ) : null}
            </>
          ) : (
            <div style={{ fontSize: 10, color: "#888", marginTop: 6, fontStyle: "italic" }}>
              No EDGAR probe response.
            </div>
          )}
        </div>

        {/* FRED probe */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #1d1d1d" }}>
          <div className="flex items-baseline" style={{ gap: 8 }}>
            <span style={{ fontSize: 10, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase" }}>
              FRED · St. Louis Fed
            </span>
            <span
              className="num ml-auto flex items-center"
              style={{
                fontSize: 9,
                color: fredAnyOk ? "#00d97e" : "#ffa940",
                border: `1px solid ${fredAnyOk ? "#00d97e" : "#ffa940"}`,
                padding: "1px 5px",
                letterSpacing: "0.12em",
                fontWeight: 600,
                gap: 4,
              }}
            >
              {fredAnyOk ? <Pulse color="#00d97e" size={6} /> : null}
              {fredAnyOk ? "LIVE" : "FALLBACK"}
            </span>
          </div>
          <div className="num" style={{ fontSize: 10, color: "#888", marginTop: 4, letterSpacing: "0.04em" }}>
            FRED_API_KEY · {process.env.FRED_API_KEY ? "set" : "not set (graceful fallback)"}
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
            {fred.map((p) => (
              <div
                key={p.series}
                className="grid items-baseline"
                style={{ gridTemplateColumns: "1fr auto auto", gap: 6, fontSize: 10.5, height: 18 }}
              >
                <span style={{ color: "#888" }}>{p.label}</span>
                <span className="num" style={{ color: p.ok ? "#d8d8d8" : "#666" }}>
                  {p.latestValue != null ? p.latestValue.toFixed(2) : "—"}
                </span>
                <span className="num" style={{ color: p.ok ? "#00d97e" : "#ff4d4f", fontSize: 9, letterSpacing: "0.1em" }}>
                  {p.ok ? "OK" : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── page ─────────────────────────────────────────────────────────

export default async function SourcesPage(): Promise<JSX.Element> {
  // Live probes — single-flight, cached 6h.
  const [edgar, fredObs] = await Promise.all([
    fetchEdgarSnapshot("NVDA"),
    Promise.all([
      probeFred("DGS10", "UST 10Y"),
      probeFred("DFF", "Fed Funds"),
      probeFred("CPIAUCSL", "CPI · all-urban"),
      probeFred("BAMLH0A0HYM2", "HY OAS"),
      probeFred("UNRATE", "Unemployment"),
      probeFred("ICSA", "Jobless claims"),
    ]),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader />
      <LiveProbes edgar={edgar} fred={fredObs} />
      <ProviderRouterStrip />
      {CATEGORY_ORDER.map((cat) => (
        <CategorySection key={cat} cat={cat} />
      ))}
      <CitationsSection />
      <RiskCallouts />
      <MethodologyFooter />
    </div>
  );
}
