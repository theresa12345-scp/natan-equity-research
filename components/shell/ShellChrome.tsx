"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import CommandPalette from "@/components/shell/CommandPalette";
import WatchlistChip from "@/components/shell/WatchlistChip";

interface CmdContextValue {
  open: () => void;
}

const CmdContext = createContext<CmdContextValue>({ open: () => {} });

export function useCommandPalette(): CmdContextValue {
  return useContext(CmdContext);
}

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
    <CmdContext.Provider value={{ open: () => setPaletteOpen(true) }}>
      {children}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <WatchlistChip />
    </CmdContext.Provider>
  );
}
