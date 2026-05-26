export interface CommandTarget {
  ticker: string;
  exchange: "IDX" | "NASDAQ";
  name: string;
  href: string;
  aliases?: string[];
}

// Three demo securities plus screener residents. Phase 5 swaps to a real
// search index keyed by symbol/exchange against yahoo-finance2 quoteSummary.
export const COMMAND_TARGETS: CommandTarget[] = [
  { ticker: "BBCA", exchange: "IDX", name: "Bank Central Asia", href: "/idx/bbca", aliases: ["bbca ij"] },
  { ticker: "MYOR", exchange: "IDX", name: "Mayora Indah", href: "/idx/myor", aliases: ["myor ij"] },
  { ticker: "NVDA", exchange: "NASDAQ", name: "NVIDIA Corporation", href: "/us/nvda", aliases: ["nvda us"] },
  // Screener residents — placeholder hrefs route to landing for now.
  { ticker: "BMRI", exchange: "IDX", name: "Bank Mandiri", href: "/", aliases: ["bmri ij"] },
  { ticker: "BBRI", exchange: "IDX", name: "Bank Rakyat Indonesia", href: "/", aliases: ["bbri ij"] },
  { ticker: "BBNI", exchange: "IDX", name: "Bank Negara Indonesia", href: "/", aliases: ["bbni ij"] },
  { ticker: "PGAS", exchange: "IDX", name: "Perusahaan Gas Negara", href: "/", aliases: ["pgas ij"] },
  { ticker: "ADRO", exchange: "IDX", name: "Adaro Energy", href: "/", aliases: ["adro ij"] },
  { ticker: "BREN", exchange: "IDX", name: "Barito Renewables", href: "/", aliases: ["bren ij"] },
  { ticker: "AMMN", exchange: "IDX", name: "Amman Mineral Internasional", href: "/", aliases: ["ammn ij"] },
  { ticker: "ICBP", exchange: "IDX", name: "Indofood CBP", href: "/", aliases: ["icbp ij"] },
  { ticker: "SMGR", exchange: "IDX", name: "Semen Indonesia", href: "/", aliases: ["smgr ij"] },
  { ticker: "INTP", exchange: "IDX", name: "Indocement", href: "/", aliases: ["intp ij"] },
  { ticker: "TLKM", exchange: "IDX", name: "Telkom Indonesia", href: "/", aliases: ["tlkm ij"] },
  { ticker: "UNVR", exchange: "IDX", name: "Unilever Indonesia", href: "/", aliases: ["unvr ij"] },
  { ticker: "ASII", exchange: "IDX", name: "Astra International", href: "/", aliases: ["asii ij"] },
];

export function matchCommand(query: string, limit: number = 6): CommandTarget[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return COMMAND_TARGETS.filter((t) => {
    if (t.ticker.toLowerCase().startsWith(q)) return true;
    if (t.name.toLowerCase().includes(q)) return true;
    if (t.aliases?.some((a) => a.toLowerCase().startsWith(q))) return true;
    return false;
  }).slice(0, limit);
}

export function resolveCommand(query: string): CommandTarget | null {
  const matches = matchCommand(query, 1);
  return matches[0] ?? null;
}
