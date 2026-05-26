"use client";

import { useState, type ChangeEvent, type KeyboardEvent } from "react";

interface CommandBarProps {
  value?: string;
  onSubmit?: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CommandBar({
  value: controlledValue,
  onSubmit,
  placeholder = "BBCA IJ <EQUITY> DES · type ticker, command, or query…",
  className = "",
}: CommandBarProps): JSX.Element {
  const [internal, setInternal] = useState<string>(controlledValue ?? "");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const value = controlledValue ?? internal;

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    setInternal(e.target.value);
  }

  function fire(): void {
    if (onSubmit) onSubmit(value);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") {
      e.preventDefault();
      fire();
    }
  }

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ height: 22, minWidth: 0 }}
    >
      <span
        className="num"
        aria-hidden="true"
        style={{
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
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
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

      <button
        type="button"
        onClick={fire}
        aria-label="Submit command"
        className="hover:brightness-110"
        style={{
          height: 22,
          padding: "0 8px",
          marginLeft: 8,
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
        style={{ gap: 4, marginLeft: 8 }}
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
