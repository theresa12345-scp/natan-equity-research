import { QUOTE_WATCH, ALERTS, SAVED_SCREENS } from "@/lib/mock-data";
import TickerLink from "@/components/primitives/TickerLink";

function deltaColor(pct: number): string {
  if (pct > 0) return "#00d97e";
  if (pct < 0) return "#ff4d4f";
  return "#888";
}

function SectionHeader({
  abbr,
  title,
  meta,
}: {
  abbr: string;
  title: string;
  meta?: string;
}): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        height: 22,
        padding: "0 10px",
        background: "#050505",
        borderBottom: "1px solid #1d1d1d",
        borderTop: "1px solid #2a2a2a",
        gap: 8,
      }}
    >
      <span
        className="num"
        style={{
          fontSize: 9.5,
          color: "#ff2e88",
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
      >
        {abbr}
      </span>
      <span
        style={{
          fontSize: 10,
          color: "#d8d8d8",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      {meta ? (
        <span
          className="num ml-auto"
          style={{
            fontSize: 9,
            color: "#666",
            letterSpacing: "0.06em",
          }}
        >
          {meta}
        </span>
      ) : null}
    </div>
  );
}

export default function RightRail(): JSX.Element {
  return (
    <aside
      className="flex flex-col overflow-hidden"
      style={{
        background: "#000",
        borderLeft: "1px solid #2a2a2a",
      }}
    >
      {/* QW Quote Watch */}
      <SectionHeader abbr="QW" title="Quote Watch" meta="14:23 WIB" />
      <div>
        {QUOTE_WATCH.map((q) => {
          const tone = deltaColor(q.changePct);
          return (
            <div
              key={q.symbol}
              className="grid items-center hover:bg-[#0a0a0a]"
              style={{
                gridTemplateColumns: "70px 1fr auto",
                height: 22,
                padding: "0 10px",
                borderBottom: "1px solid #111",
                gap: 8,
              }}
            >
              <TickerLink ticker={q.symbol} market="IDX" size="sm" />
              <span
                className="num text-right"
                style={{ fontSize: 10.5, color: "#d8d8d8" }}
              >
                {q.price}
              </span>
              <span
                className="num text-right"
                style={{ fontSize: 10, color: tone, minWidth: 56 }}
              >
                {q.changePct > 0 ? "+" : ""}
                {q.changePct.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* AL Alerts */}
      <SectionHeader
        abbr="AL"
        title="Alerts"
        meta={`${ALERTS.length} active`}
      />
      <div>
        {ALERTS.map((a) => (
          <div
            key={a.ts + a.ticker}
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid #111",
            }}
          >
            <div className="flex items-baseline" style={{ gap: 6 }}>
              <span
                className="num"
                style={{
                  fontSize: 9.5,
                  color: "#666",
                  letterSpacing: "0.04em",
                }}
              >
                {a.ts}
              </span>
              <TickerLink ticker={a.ticker} market="IDX" size="xs" />
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "#d8d8d8",
                lineHeight: 1.45,
                marginTop: 3,
              }}
            >
              {a.body}
            </div>
          </div>
        ))}
      </div>

      {/* SV Saved Screens */}
      <SectionHeader abbr="SV" title="Saved Screens" />
      <div>
        {SAVED_SCREENS.map((s) => (
          <div
            key={s.name}
            className="grid items-center hover:bg-[#0a0a0a]"
            style={{
              gridTemplateColumns: "1fr auto",
              height: 22,
              padding: "0 10px",
              borderBottom: "1px solid #111",
              gap: 8,
              borderLeft: s.active
                ? "2px solid #ff2e88"
                : "2px solid transparent",
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                color: s.active ? "#f5f5f5" : "#d8d8d8",
                letterSpacing: "0.02em",
              }}
            >
              {s.name}
            </span>
            <span
              className="num"
              style={{
                fontSize: 10,
                color: s.active ? "#ff2e88" : "#666",
              }}
            >
              {s.count}
            </span>
          </div>
        ))}
      </div>

      {/* Disclaimer footer */}
      <div
        style={{
          marginTop: "auto",
          padding: "8px 10px",
          borderTop: "1px solid #2a2a2a",
          background: "#050505",
        }}
      >
        <div
          className="num"
          style={{
            fontSize: 9,
            color: "#ff2e88",
            letterSpacing: "0.08em",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          DISC
        </div>
        <div style={{ fontSize: 10, color: "#888", lineHeight: 1.5 }}>
          backtest 2014–25 paper · live SR est 0.55–0.65 ·{" "}
          <span className="num" style={{ color: "#d8d8d8" }}>
            github.com/nluu/idx-factor-backtest
          </span>
        </div>
      </div>
    </aside>
  );
}
