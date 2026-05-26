"use client";

import { useState, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { matchCommand, resolveCommand, type CommandTarget } from "@/lib/command-targets";

interface CommandBarProps {
  placeholder?: string;
  className?: string;
}

export default function CommandBar({
  placeholder = "BBCA IJ <EQUITY> DES · type ticker, command, or query…",
  className = "",
}: CommandBarProps): JSX.Element {
  const router = useRouter();
  const [value, setValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<CommandTarget[]>([]);
  const [highlight, setHighlight] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function update(v: string): void {
    setValue(v);
    const matches = matchCommand(v);
    setSuggestions(matches);
    setHighlight(0);
  }

  function navigate(target: CommandTarget): void {
    setSuggestions([]);
    setValue("");
    router.push(target.href);
    inputRef.current?.blur();
  }

  function submit(): void {
    if (suggestions.length > 0) {
      navigate(suggestions[highlight] ?? suggestions[0]);
      return;
    }
    const fallback = resolveCommand(value);
    if (fallback) navigate(fallback);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(suggestions.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Escape") {
      setSuggestions([]);
      inputRef.current?.blur();
    }
  }

  const showDropdown = isFocused && suggestions.length > 0;

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ height: 22, minWidth: 0, position: "relative" }}
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
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => update(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 120)}
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
        onClick={submit}
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

      <div className="flex items-center" style={{ gap: 4, marginLeft: 8 }}>
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

      {showDropdown ? (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: 26,
            left: 0,
            right: 0,
            background: "#000",
            border: "1px solid #2a2a2a",
            zIndex: 60,
            maxHeight: 280,
            overflowY: "auto",
            boxShadow: "0 0 0 1px #000",
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={s.ticker}
              type="button"
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => {
                e.preventDefault();
                navigate(s);
              }}
              onMouseEnter={() => setHighlight(i)}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 60px",
                gap: 10,
                width: "100%",
                padding: "8px 12px",
                background: i === highlight ? "rgba(255,46,136,0.08)" : "transparent",
                border: "none",
                borderLeft: i === highlight ? "2px solid #ff2e88" : "2px solid transparent",
                borderBottom: "1px solid #111",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              <span className="num" style={{ color: "#ff2e88", fontWeight: 500 }}>
                {s.ticker}
              </span>
              <span style={{ color: "#d8d8d8" }}>{s.name}</span>
              <span
                className="num"
                style={{
                  color: "#666",
                  fontSize: 9.5,
                  letterSpacing: "0.08em",
                  textAlign: "right",
                }}
              >
                {s.exchange}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
