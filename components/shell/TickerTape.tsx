import { TICKER_TAPE_IDX, type TickerTapeItem } from "@/lib/mock-data";

interface TickerTapeProps {
  items?: TickerTapeItem[];
}

function colorForDelta(changePct: number | undefined): string {
  if (changePct === undefined) return "#888";
  if (changePct > 0) return "#00d97e";
  if (changePct < 0) return "#ff4d4f";
  return "#888";
}

export default function TickerTape({
  items = TICKER_TAPE_IDX,
}: TickerTapeProps): JSX.Element {
  return (
    <div
      className="flex items-stretch overflow-hidden"
      style={{
        height: 24,
        background: "#000",
        borderBottom: "1px solid #1d1d1d",
      }}
      aria-label="Market ticker tape"
    >
      {items.map((item) => {
        const tone = colorForDelta(item.changePct);
        return (
          <div
            key={item.symbol}
            className="flex items-center"
            style={{
              gap: 6,
              padding: "0 14px",
              borderRight: "1px solid #111",
              flexShrink: 0,
            }}
          >
            <span
              className="num"
              style={{
                fontSize: 10,
                color: "#888",
                letterSpacing: "0.06em",
                fontWeight: 500,
              }}
            >
              {item.symbol}
            </span>
            <span
              className="num"
              style={{
                fontSize: 10.5,
                color: "#f5f5f5",
              }}
            >
              {item.price}
            </span>
            {item.delta ? (
              <span
                className="num"
                style={{
                  fontSize: 10,
                  color: tone,
                }}
              >
                {item.delta}
              </span>
            ) : null}
            {item.changePct !== undefined && item.delta ? (
              <span
                className="num"
                style={{
                  fontSize: 10,
                  color: tone,
                  opacity: 0.8,
                }}
              >
                /{" "}
                {item.changePct > 0 ? "+" : ""}
                {item.changePct.toFixed(2)}%
              </span>
            ) : null}
          </div>
        );
      })}

      {/* Right-side timestamp */}
      <div
        className="flex items-center ml-auto"
        style={{
          padding: "0 14px",
          borderLeft: "1px solid #111",
          flexShrink: 0,
        }}
      >
        <span
          className="num"
          style={{
            fontSize: 9.5,
            color: "#555",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          BEI SESI II · 14:23:08 WIB
        </span>
      </div>
    </div>
  );
}
