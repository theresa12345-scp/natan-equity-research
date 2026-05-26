export default function BBCAPage(): JSX.Element {
  return (
    <div className="px-8 py-10">
      <div
        className="num mb-2"
        style={{
          fontSize: 9,
          color: "var(--fg-4)",
          letterSpacing: "0.12em",
        }}
      >
        IDX · INDONESIA · FINANCIALS
      </div>
      <h1
        className="num mb-1"
        style={{
          fontSize: 28,
          color: "var(--mag)",
          letterSpacing: "-0.01em",
          fontWeight: 600,
        }}
      >
        BBCA
      </h1>
      <div style={{ fontSize: 13, color: "var(--fg-2)" }}>Bank Central Asia</div>
      <div
        className="num"
        style={{
          fontSize: 10,
          color: "var(--fg-3)",
          marginTop: 24,
          letterSpacing: "0.08em",
        }}
      >
        ROUTE LOADED — MODULE CONTENT PENDING (Phase 2)
      </div>
    </div>
  );
}
