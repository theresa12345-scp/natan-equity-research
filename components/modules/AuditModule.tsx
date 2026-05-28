import Link from "next/link";

interface Citation {
  tag: string;
  title: string;
  citation: string;
  citationId?: string;
}

// Map existing tag strings to citation IDs in lib/data/citations.ts so
// every audit row deep-links to /sources#cite-<id>.
const TAG_TO_CITATION_ID: Record<string, string> = {
  CPCV: "lopez-de-prado-2018",
  DSR: "bailey-lopez-de-prado-2014",
  PBO: "bailey-borwein-lopez-de-prado-zhu-2017",
  FACTORS: "li-wei-zhang-2023",
  ERP: "damodaran-ctryprem",
  MOMENTUM: "carhart-1997",
  FF5: "fama-french-2015",
  QMJ: "asness-frazzini-pedersen-2019",
  HXZ: "hou-xue-zhang-2015",
  PIOTROSKI: "piotroski-2000",
  "NOVY-MARX": "novy-marx-2013",
  BAB: "frazzini-pedersen-2014",
  PEAD: "bernard-thomas-1989",
  ACCRUALS: "sloan-1996",
  MSCORE: "beneish-1999",
  MOAT: "mauboussin-moat",
};

function resolveCitationId(c: Citation): string | undefined {
  return c.citationId ?? TAG_TO_CITATION_ID[c.tag.toUpperCase()];
}

interface BiasControl {
  label: string;
  active: boolean;
}

interface Repro {
  repoUrl: string;
  commitHash: string;
  buildStatus: string;
  coveragePct: number;
  testCount: { pass: number; total: number };
  codeLines: number;
  license: string;
}

interface AuditModuleProps {
  citations: Citation[];
  biasControls: BiasControl[];
  repro: Repro;
  limitations: string;
  extraNote?: string;
}

function SectionHeader({ title, meta }: { title: string; meta?: string }): JSX.Element {
  return (
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
        {title}
      </span>
      {meta ? <span style={{ fontSize: 10, color: "#7a7a7a" }}>{meta}</span> : null}
    </div>
  );
}

export default function AuditModule({
  citations,
  biasControls,
  repro,
  limitations,
  extraNote,
}: AuditModuleProps): JSX.Element {
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", minHeight: 0 }}>
      {/* Column 1: Methodology citations */}
      <section style={{ borderRight: "1px solid #2a2a2a", minWidth: 0 }}>
        <SectionHeader title="Methodology · Citations" />
        {citations.map((c) => {
          const cid = resolveCitationId(c);
          const tagChip = (
            <span
              style={{
                fontSize: 9.5,
                color: "#ff2e88",
                letterSpacing: "0.14em",
                fontWeight: 600,
                border: "1px solid #ff2e88",
                padding: "1px 5px",
                background: "rgba(255,46,136,0.05)",
                textDecoration: "none",
              }}
            >
              {c.tag}
            </span>
          );
          return (
            <div
              key={c.tag}
              style={{ padding: "10px 12px", borderBottom: "1px solid #111" }}
            >
              <div className="flex items-baseline" style={{ gap: 8 }}>
                {cid ? (
                  <Link
                    href={`/sources#cite-${cid}`}
                    title="View citation on /sources"
                    className="hover:brightness-125"
                    style={{ display: "inline-flex", textDecoration: "none" }}
                  >
                    {tagChip}
                  </Link>
                ) : (
                  tagChip
                )}
                <span style={{ fontSize: 11, color: "#d8d8d8" }}>{c.title}</span>
              </div>
              <p
                className="num"
                style={{
                  fontSize: 10,
                  color: "#7a7a7a",
                  margin: "5px 0 0",
                  fontStyle: "italic",
                  lineHeight: 1.45,
                }}
              >
                {c.citation}
              </p>
            </div>
          );
        })}
      </section>

      {/* Column 2: Bias controls */}
      <section style={{ borderRight: "1px solid #2a2a2a", minWidth: 0 }}>
        <SectionHeader title="Bias Controls" meta={`${biasControls.length}/${biasControls.length} active`} />
        {biasControls.map((b) => (
          <div
            key={b.label}
            className="grid items-center"
            style={{
              gridTemplateColumns: "16px 1fr",
              height: 26,
              padding: "0 12px",
              borderBottom: "1px solid #111",
              gap: 10,
            }}
          >
            <span
              style={{
                color: b.active ? "#00d97e" : "#444",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {b.active ? "✓" : "·"}
            </span>
            <span style={{ fontSize: 11, color: b.active ? "#d8d8d8" : "#555" }}>
              {b.label}
            </span>
          </div>
        ))}
      </section>

      {/* Column 3: Reproducibility + Limitations */}
      <section style={{ minWidth: 0 }}>
        <SectionHeader title="Reproducibility" />
        <div style={{ padding: "10px 12px" }}>
          <div
            style={{
              fontSize: 8.5,
              color: "#666",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Repository
          </div>
          <div
            className="num"
            style={{ fontSize: 11, color: "#ff2e88", marginTop: 3, wordBreak: "break-all" }}
          >
            {repro.repoUrl}
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 8.5,
                  color: "#666",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Commit
              </div>
              <div className="num" style={{ fontSize: 11, color: "#d8d8d8", marginTop: 3 }}>
                {repro.commitHash}
              </div>
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
                Build
              </div>
              <div
                className="num"
                style={{ fontSize: 11, color: "#00d97e", marginTop: 3, textTransform: "uppercase" }}
              >
                {repro.buildStatus}
              </div>
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
                Coverage
              </div>
              <div className="num" style={{ fontSize: 11, color: "#d8d8d8", marginTop: 3 }}>
                {repro.coveragePct.toFixed(1)}%
              </div>
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
                Tests
              </div>
              <div className="num" style={{ fontSize: 11, color: "#00d97e", marginTop: 3 }}>
                {repro.testCount.pass} / {repro.testCount.total}
              </div>
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
                Code · LOC
              </div>
              <div className="num" style={{ fontSize: 11, color: "#d8d8d8", marginTop: 3 }}>
                {repro.codeLines.toLocaleString()}
              </div>
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
                License
              </div>
              <div className="num" style={{ fontSize: 11, color: "#d8d8d8", marginTop: 3 }}>
                {repro.license}
              </div>
            </div>
          </div>
        </div>

        {extraNote ? (
          <div style={{ padding: "0 12px 12px" }}>
            <div
              style={{
                fontSize: 10,
                color: "#7a7a7a",
                lineHeight: 1.5,
                fontStyle: "italic",
              }}
            >
              {extraNote}
            </div>
          </div>
        ) : null}

        <div
          style={{
            margin: "0 12px 12px",
            padding: "10px 12px",
            border: "1px solid #c4831f",
            background: "rgba(196,131,31,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              color: "#c4831f",
              letterSpacing: "0.14em",
              fontWeight: 600,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Limitations
          </div>
          <p
            style={{
              fontSize: 10.5,
              color: "#d8d8d8",
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {limitations}
          </p>
        </div>
      </section>
    </div>
  );
}
