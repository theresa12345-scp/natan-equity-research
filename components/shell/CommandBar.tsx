"use client";

import { useState, type ChangeEvent, type KeyboardEvent } from "react";

interface CommandBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export default function CommandBar({
  value,
  onChange,
  onSubmit,
}: CommandBarProps): JSX.Element {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div
      className="flex items-center"
      style={{
        height: 22,
        width: "100%",
        background: "#000",
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      <span
        className="num"
        aria-hidden="true"
        style={{
          paddingLeft: 10,
          paddingRight: 6,
          fontSize: 11,
          color: isFocused ? "#ff5fa3" : "#ff2e88",
          transition: "color 80ms linear",
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        &gt;
      </span>

      <input
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="type a ticker, command, or query…"
        spellCheck={false}
        autoComplete="off"
        aria-label="Command input"
        className="num placeholder:text-[#555]"
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#f5f5f5",
          fontSize: 11,
          padding: 0,
        }}
      />

      <span
        aria-hidden="true"
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "#1d1d1d",
        }}
      />

      <button
        type="button"
        onClick={onSubmit}
        aria-label="Submit command"
        className="hover:brightness-110"
        style={{
          height: 22,
          padding: "0 8px",
          background: "transparent",
          border: "1px solid #ff2e88",
          color: "#ff2e88",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        GO
      </button>

      <div
        className="flex items-center"
        style={{ gap: 4, paddingLeft: 8, paddingRight: 10 }}
      >
        {/* TODO: platform-detect Ctrl/⌘ for Windows users in V2 */}
        {(["↵", "F1", "⌘K"] as const).map((label) => (
          <span
            key={label}
            className="num"
            aria-hidden="true"
            style={{
              height: 16,
              padding: "0 6px",
              border: "1px solid #2a2a2a",
              background: "transparent",
              color: "#888",
              fontSize: 9,
              display: "inline-flex",
              alignItems: "center",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
