"use client";

import { useState, type ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  width?: number;
}

export default function Tooltip({ content, children, width = 240 }: TooltipProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div
      style={{ position: "relative", display: "block" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open ? (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            background: "#000",
            border: "1px solid #ff2e88",
            padding: "10px 12px",
            zIndex: 50,
            width,
            opacity: 1,
            transition: "opacity 100ms linear",
            pointerEvents: "none",
          }}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
}
