import Link from "next/link";

interface DemoTicker {
  href: string;
  ticker: string;
  exchange: string;
  name: string;
  sector: string;
  market: string;
}

const tickers: DemoTicker[] = [
  {
    href: "/idx/bbca",
    ticker: "BBCA",
    exchange: "IDX",
    name: "Bank Central Asia",
    sector: "Financials · Banks",
    market: "Indonesia",
  },
  {
    href: "/idx/myor",
    ticker: "MYOR",
    exchange: "IDX",
    name: "Mayora Indah",
    sector: "Consumer Staples · Food",
    market: "Indonesia",
  },
  {
    href: "/us/nvda",
    ticker: "NVDA",
    exchange: "NASDAQ",
    name: "NVIDIA Corporation",
    sector: "Information Technology · Semis",
    market: "United States",
  },
];

export default function LandingPage(): JSX.Element {
  return (
    <div className="px-8 py-10">
      <div
        className="mb-8 num"
        style={{
          fontSize: 9,
          color: "var(--fg-4)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        MERIDIAN · INSTITUTIONAL EQUITY RESEARCH WORKSTATION · V0.1
      </div>

      <h1
        className="mb-1"
        style={{ fontSize: 28, fontWeight: 600, color: "var(--fg)", letterSpacing: "-0.02em" }}
      >
        Select a security
      </h1>
      <p
        className="mb-8"
        style={{ fontSize: 12, color: "var(--fg-3)", maxWidth: "60ch", lineHeight: 1.6 }}
      >
        Three demo tickers across two markets and three sectors. Each renders the
        full 6-module workstation: Grade, DCF, Comps, Algo &amp; Factors, News, Audit.
      </p>

      <div style={{ borderTop: "1px solid var(--surface-5)" }}>
        {tickers.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="grid items-center"
            style={{
              gridTemplateColumns: "120px 1fr 220px",
              borderBottom: "1px solid var(--surface-4)",
              height: 48,
              padding: "0 4px",
            }}
          >
            <div className="flex items-baseline gap-2 px-3">
              <span
                className="num"
                style={{ fontSize: 16, color: "var(--mag)", letterSpacing: "-0.01em" }}
              >
                {t.ticker}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "var(--fg-3)",
                  border: "1px solid var(--surface-5)",
                  padding: "1px 4px",
                  letterSpacing: "0.06em",
                }}
              >
                {t.exchange}
              </span>
            </div>
            <div className="px-3">
              <div style={{ fontSize: 12, color: "var(--fg-2)" }}>{t.name}</div>
              <div
                style={{
                  fontSize: 9,
                  color: "var(--fg-4)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                {t.sector}
              </div>
            </div>
            <div
              className="num px-3 text-right"
              style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.08em" }}
            >
              {t.market.toUpperCase()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
