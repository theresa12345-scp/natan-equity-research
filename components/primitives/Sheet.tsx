"use client";

import { useEffect, useState, type ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: number;
  children: ReactNode;
}

export default function Sheet({
  open,
  onClose,
  title,
  width = 480,
  children,
}: SheetProps): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        role="presentation"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 100,
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width,
          background: "#000",
          borderLeft: "1px solid #2a2a2a",
          zIndex: 101,
          overflow: "auto",
          animation: "sheet-in 180ms ease-out",
        }}
      >
        <div
          className="flex items-center"
          style={{
            height: 38,
            padding: "0 14px",
            borderBottom: "1px solid #2a2a2a",
            background: "#050505",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "#ff2e88",
              letterSpacing: "0.14em",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto hover:brightness-125"
            style={{
              background: "transparent",
              border: "1px solid #ff2e88",
              color: "#ff2e88",
              cursor: "pointer",
              width: 24,
              height: 24,
              fontSize: 13,
              lineHeight: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
        <div>{children}</div>
      </aside>
      <style>{`
        @keyframes sheet-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          aside[role="dialog"] { animation: none !important; }
        }
      `}</style>
    </>
  );
}
