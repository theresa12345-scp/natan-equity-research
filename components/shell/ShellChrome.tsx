"use client";

import { useEffect, useState, type ReactNode } from "react";
import CommandPalette from "@/components/shell/CommandPalette";
import RegimeBadge from "@/components/primitives/RegimeBadge";

interface ShellChromeProps {
  children: ReactNode;
}

export default function ShellChrome({ children }: ShellChromeProps): JSX.Element {
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 6,
          right: 12,
          zIndex: 80,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <RegimeBadge market="IDX" />
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label="Open command palette (⌘K)"
          className="num hover:brightness-125"
          style={{
            background: "transparent",
            border: "1px solid #2a2a2a",
            color: "#888",
            padding: "3px 8px",
            fontSize: 9.5,
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          ⌘K
        </button>
      </div>
      {children}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
