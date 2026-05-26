import Link from "next/link";
import CommandBar from "./CommandBar";
import { SECTION_TABS, SESSION } from "@/lib/mock-data";

export default function TopBar(): JSX.Element {
  return (
    <header
      className="flex items-center"
      style={{
        height: 38,
        background: "#000",
        borderBottom: "1px solid #2a2a2a",
        paddingLeft: 10,
        paddingRight: 10,
        gap: 12,
      }}
    >
      {/* Brand block */}
      <div className="flex items-center" style={{ gap: 8, flexShrink: 0 }}>
        <span
          aria-hidden="true"
          style={{
            width: 9,
            height: 9,
            background: "#ff2e88",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#f5f5f5",
            letterSpacing: "0.02em",
          }}
        >
          {SESSION.brand}
        </span>
        <span style={{ color: "#444", fontSize: 11 }}>·</span>
        <span
          className="num"
          style={{
            fontSize: 11,
            color: "#ff2e88",
            letterSpacing: "0.04em",
          }}
        >
          {SESSION.product}
        </span>
        <span
          className="num"
          style={{
            fontSize: 9.5,
            color: "#666",
            marginLeft: 6,
            letterSpacing: "0.04em",
          }}
        >
          {SESSION.version}
        </span>
        <span
          className="num"
          style={{
            fontSize: 9.5,
            color: "#555",
            marginLeft: 4,
            letterSpacing: "0.04em",
          }}
        >
          · {SESSION.timestamp}
        </span>
      </div>

      {/* Vertical divider */}
      <span
        aria-hidden="true"
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "#1d1d1d",
        }}
      />

      {/* Command bar (flex: 1 to fill) */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <CommandBar />
      </div>

      {/* Vertical divider */}
      <span
        aria-hidden="true"
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "#1d1d1d",
        }}
      />

      {/* Section tabs */}
      <nav
        className="flex items-center"
        style={{ gap: 0, flexShrink: 0 }}
        aria-label="Workstation sections"
      >
        {SECTION_TABS.map((tab) => (
          <Link
            key={tab.num}
            href={tab.href}
            className="hover:brightness-125"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "0 10px",
              height: 38,
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: tab.active ? "#f5f5f5" : "#888",
              borderBottom: tab.active
                ? "2px solid #ff2e88"
                : "2px solid transparent",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            <span
              className="num"
              style={{
                color: tab.active ? "#ff2e88" : "#555",
                fontSize: 9.5,
              }}
            >
              {tab.num}
            </span>
            <span>{tab.label}</span>
            {tab.active ? (
              <span
                aria-hidden="true"
                style={{
                  width: 5,
                  height: 5,
                  background: "#ff2e88",
                  display: "inline-block",
                  marginLeft: 2,
                }}
              />
            ) : null}
          </Link>
        ))}
      </nav>

      {/* Vertical divider */}
      <span
        aria-hidden="true"
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "#1d1d1d",
        }}
      />

      {/* User / session block */}
      <div className="flex items-center" style={{ gap: 6, flexShrink: 0 }}>
        <span
          aria-hidden="true"
          style={{
            width: 9,
            height: 9,
            background: "#ff2e88",
            display: "inline-block",
          }}
        />
        <span
          className="num"
          style={{
            fontSize: 10,
            color: "#f5f5f5",
            letterSpacing: "0.06em",
          }}
        >
          {SESSION.user}
        </span>
        <span style={{ color: "#444", fontSize: 10 }}>·</span>
        <span
          className="num"
          style={{
            fontSize: 10,
            color: "#888",
            letterSpacing: "0.06em",
          }}
        >
          {SESSION.workspace}
        </span>
      </div>
    </header>
  );
}
