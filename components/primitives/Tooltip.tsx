"use client";

import { useState, useRef, type ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  delayMs?: number;
  align?: "start" | "center" | "end";
  maxWidth?: number;
  inline?: boolean; // render trigger as inline span (default) vs block div
}

// Terminal-style tooltip: 250ms delay, no animation, hard edges, magenta
// border, JetBrains Mono. Replaces HTML `title=` on chips and KPI labels.
export default function Tooltip({
  content,
  children,
  side = "top",
  delayMs = 250,
  align = "start",
  maxWidth = 320,
  inline = true,
}: TooltipProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show(): void {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delayMs);
  }
  function hide(): void {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  }

  const placement = side === "top"
    ? { bottom: "calc(100% + 6px)" }
    : { top: "calc(100% + 6px)" };
  const justify = align === "center"
    ? { left: "50%", transform: "translateX(-50%)" }
    : align === "end"
      ? { right: 0 }
      : { left: 0 };

  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            ...placement,
            ...justify,
            background: "#000",
            border: "1px solid #ff2e88",
            color: "#d8d8d8",
            padding: "6px 10px",
            fontSize: 10.5,
            lineHeight: 1.5,
            letterSpacing: "0.01em",
            fontFamily: "var(--font-jetbrains, ui-monospace), monospace",
            zIndex: 200,
            maxWidth,
            width: "max-content",
            whiteSpace: "normal",
            pointerEvents: "none",
            boxShadow: "0 0 0 1px #000 inset",
          }}
        >
          {content}
        </span>
      ) : null}
    </Wrapper>
  );
}
