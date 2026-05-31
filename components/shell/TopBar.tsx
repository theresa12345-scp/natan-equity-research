"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CommandBar from "./CommandBar";
import RegimeBadge from "@/components/primitives/RegimeBadge";
import { useCommandPalette } from "./ShellChrome";
import { SECTION_TABS, SESSION } from "@/lib/mock-data";

function isTabActive(tabHref: string, pathname: string): boolean {
  if (tabHref === "/") return false;
  return pathname === tabHref || pathname.startsWith(`${tabHref}/`);
}

export default function TopBar(): JSX.Element {
  const pathname = usePathname();
  const cmd = useCommandPalette();

  return (
    <header
      className="flex items-center"
      style={{
        height: 38,
        background: "#000",
        borderBottom: "1px solid #2a2a2a",
        paddingLeft: 10,
        paddingRight: 8,
        gap: 8,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {/* Brand block — clickable home link */}
      <Link
        href="/"
        className="flex items-center hover:brightness-125"
        aria-label="Go to home"
        style={{
          gap: 8,
          flexShrink: 0,
          textDecoration: "none",
          color: "inherit",
        }}
      >
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
      </Link>

      {/* version + timestamp — desktop only */}
      <span
        className="num hidden xl:inline"
        style={{
          fontSize: 9.5,
          color: "#666",
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}
      >
        {SESSION.version}
      </span>
      <span
        className="num hidden 2xl:inline"
        style={{
          fontSize: 9.5,
          color: "#555",
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}
      >
        · {SESSION.timestamp}
      </span>

      <span
        aria-hidden="true"
        className="hidden sm:inline-block"
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "#1d1d1d",
          flexShrink: 0,
        }}
      />

      {/* Command bar (flex: 1 to fill) */}
      <div style={{ flex: 1, minWidth: 80 }}>
        <CommandBar />
      </div>

      <span
        aria-hidden="true"
        className="hidden md:inline-block"
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "#1d1d1d",
          flexShrink: 0,
        }}
      />

      {/* Section tabs — hide below md */}
      <nav
        className="hidden md:flex items-center"
        style={{ gap: 0, flexShrink: 0, overflow: "hidden" }}
        aria-label="Workstation sections"
      >
        {SECTION_TABS.map((tab) => {
          const active = isTabActive(tab.href, pathname);
          return (
            <Link
              key={tab.num}
              href={tab.href}
              className="hover:brightness-125"
              title={`${tab.num} ${tab.label}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "0 6px",
                height: 38,
                fontSize: 10,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: active ? "#f5f5f5" : "#888",
                borderBottom: active
                  ? "2px solid #ff2e88"
                  : "2px solid transparent",
                cursor: "pointer",
                lineHeight: 1,
                transition: "color 140ms ease-out, border-color 140ms ease-out",
              }}
            >
              <span
                className="num"
                style={{
                  color: active ? "#ff2e88" : "#555",
                  fontSize: 9.5,
                  transition: "color 140ms ease-out",
                }}
              >
                {tab.num}
              </span>
              <span className="hidden 2xl:inline">{tab.label}</span>
              {active ? (
                <span
                  aria-hidden="true"
                  style={{
                    width: 4,
                    height: 4,
                    background: "#ff2e88",
                    display: "inline-block",
                    marginLeft: 2,
                  }}
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <span
        aria-hidden="true"
        className="hidden sm:inline-block"
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "#1d1d1d",
          flexShrink: 0,
        }}
      />

      {/* ⌘K trigger */}
      <button
        type="button"
        onClick={cmd.open}
        aria-label="Open command palette"
        className="num hover:brightness-125"
        style={{
          background: "transparent",
          border: "1px solid #2a2a2a",
          color: "#888",
          padding: "3px 8px",
          fontSize: 9.5,
          letterSpacing: "0.08em",
          cursor: "pointer",
          flexShrink: 0,
          lineHeight: 1,
          height: 22,
        }}
      >
        ⌘K
      </button>

      {/* Regime badge — desktop+ only */}
      <span className="hidden md:inline-block" style={{ flexShrink: 0 }}>
        <RegimeBadge market="IDX" />
      </span>

      <span
        aria-hidden="true"
        className="hidden xl:inline-block"
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "#1d1d1d",
          flexShrink: 0,
        }}
      />

      {/* User block — only on wide screens */}
      <div
        className="hidden xl:flex items-center"
        style={{ gap: 6, flexShrink: 0 }}
      >
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
