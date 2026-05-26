import {
  STATUS_TOP,
  STATUS_BOTTOM,
  FN_KEYS,
  SESSION,
  type StatusItem,
} from "@/lib/mock-data";

function toneColor(tone?: StatusItem["tone"]): string {
  if (tone === "pos") return "#00d97e";
  if (tone === "neg") return "#ff4d4f";
  return "#d8d8d8";
}

function StatusCell({ item }: { item: StatusItem }): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 5,
        padding: "0 10px",
        borderRight: "1px solid #111",
        height: "100%",
      }}
    >
      <span
        style={{
          fontSize: 9,
          color: "#666",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {item.label}
      </span>
      <span
        className="num"
        style={{
          fontSize: 9.5,
          color: toneColor(item.tone),
          letterSpacing: "0.02em",
        }}
      >
        {item.value}
      </span>
    </div>
  );
}

export default function StatusBar(): JSX.Element {
  return (
    <footer
      style={{
        background: "#000",
        borderTop: "1px solid #2a2a2a",
      }}
    >
      {/* Top row — market state */}
      <div
        className="flex items-stretch"
        style={{ height: 22, borderBottom: "1px solid #111" }}
      >
        {STATUS_TOP.map((item) => (
          <StatusCell key={item.label} item={item} />
        ))}
      </div>

      {/* Bottom row — feed + session + function keys */}
      <div className="flex items-stretch" style={{ height: 22 }}>
        {/* Live feed indicator */}
        <div
          className="flex items-center"
          style={{
            gap: 6,
            padding: "0 10px",
            borderRight: "1px solid #111",
            height: "100%",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              background: "#00d97e",
              display: "inline-block",
              animation: "pulse-live 1.6s ease-in-out infinite",
            }}
          />
          <span
            className="num"
            style={{
              fontSize: 9.5,
              color: "#00d97e",
              letterSpacing: "0.08em",
            }}
          >
            FEED LIVE
          </span>
          <span
            className="num"
            style={{ fontSize: 9, color: "#666" }}
          >
            · LAT {SESSION.latencyMs}ms
          </span>
        </div>

        {STATUS_BOTTOM.map((item) => (
          <StatusCell key={item.label} item={item} />
        ))}

        {/* Function key reference — right aligned */}
        <div
          className="flex items-center ml-auto"
          style={{
            gap: 12,
            padding: "0 12px",
            borderLeft: "1px solid #111",
            height: "100%",
          }}
        >
          {FN_KEYS.map((fn) => (
            <span
              key={fn.key}
              className="flex items-center"
              style={{ gap: 4 }}
            >
              <span
                className="num"
                style={{
                  fontSize: 9.5,
                  color: "#ff2e88",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {fn.key}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "#888",
                  letterSpacing: "0.08em",
                }}
              >
                {fn.label}
              </span>
            </span>
          ))}
          <span
            className="num"
            style={{
              fontSize: 9.5,
              color: "#666",
              letterSpacing: "0.04em",
              marginLeft: 4,
            }}
          >
            ⌘K CMD
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse-live {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </footer>
  );
}
