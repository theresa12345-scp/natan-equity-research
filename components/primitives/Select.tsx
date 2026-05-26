"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";

export interface SelectOption {
  value: string;
  label: string;
  meta?: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label?: string;
  width?: number;
}

export default function Select({
  value,
  options,
  onChange,
  label,
  width,
}: SelectProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const [highlight, setHighlight] = useState<number>(
    Math.max(0, options.findIndex((o) => o.value === value)),
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const current = options.find((o) => o.value === value) ?? options[0];

  function handleKey(e: KeyboardEvent<HTMLButtonElement>): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight((h) => Math.max(0, h - 1));
    }
  }

  function pick(v: string): void {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative", width }}>
      {label ? (
        <div
          style={{
            fontSize: 8.5,
            color: "#666",
            letterSpacing: "0.08em",
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="hover:brightness-125"
        style={{
          width: "100%",
          height: 26,
          padding: "0 10px",
          background: "#050505",
          border: `1px solid ${open ? "#ff2e88" : "#2a2a2a"}`,
          color: "#f5f5f5",
          fontSize: 11,
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          letterSpacing: "0.01em",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {current.label}
        </span>
        <span style={{ color: open ? "#ff2e88" : "#666", fontSize: 9, lineHeight: 1 }}>▾</span>
      </button>

      {open ? (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            left: 0,
            right: 0,
            background: "#000",
            border: "1px solid #ff2e88",
            zIndex: 60,
            maxHeight: 280,
            overflowY: "auto",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {options.map((o, i) => {
            const isHi = i === highlight;
            const isSel = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={isSel}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o.value);
                }}
                onMouseEnter={() => setHighlight(i)}
                style={{
                  padding: "7px 10px",
                  fontSize: 11,
                  color: isSel ? "#ff2e88" : "#d8d8d8",
                  fontWeight: isSel ? 600 : 400,
                  background: isHi ? "rgba(255,46,136,0.08)" : "transparent",
                  borderLeft: isHi ? "2px solid #ff2e88" : "2px solid transparent",
                  borderBottom: "1px solid #111",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span>{o.label}</span>
                {o.meta ? (
                  <span className="num" style={{ color: "#666", fontSize: 9.5 }}>
                    {o.meta}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
