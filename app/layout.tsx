import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridian Terminal",
  description: "Institutional equity research workstation — IDX & US equities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className={`${GeistSans.variable} ${jetbrains.variable}`}>
      <body className="bg-surface-0 text-fg min-h-screen">
        <div className="grid min-h-screen" style={{ gridTemplateRows: "auto auto 1fr auto" }}>
          {/* TopBar slot — Phase 2 */}
          <header
            className="border-b"
            style={{ borderColor: "var(--surface-5)", height: 38 }}
          >
            <div
              className="flex items-center h-full px-3 num"
              style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              MERIDIAN · TOPBAR SLOT
            </div>
          </header>

          {/* TickerTape slot — Phase 2 */}
          <div
            className="border-b"
            style={{ borderColor: "var(--surface-4)", height: 22 }}
          >
            <div
              className="flex items-center h-full px-3 num"
              style={{ fontSize: 9.5, color: "var(--fg-4)", letterSpacing: "0.08em" }}
            >
              TICKER TAPE SLOT
            </div>
          </div>

          {/* Main split: content + right rail */}
          <div className="grid" style={{ gridTemplateColumns: "1fr 260px", minHeight: 0 }}>
            <main className="overflow-auto">{children}</main>
            <aside
              className="border-l"
              style={{ borderColor: "var(--surface-5)" }}
            >
              <div
                className="px-3 py-2 num"
                style={{ fontSize: 9.5, color: "var(--fg-4)", letterSpacing: "0.08em" }}
              >
                RIGHT RAIL SLOT
              </div>
            </aside>
          </div>

          {/* StatusBar slot — Phase 2 */}
          <footer
            className="border-t"
            style={{ borderColor: "var(--surface-5)", height: 22 }}
          >
            <div
              className="flex items-center h-full px-3 num"
              style={{ fontSize: 9.5, color: "var(--fg-4)", letterSpacing: "0.08em" }}
            >
              STATUS BAR SLOT · F1 HELP · F2 SCRN · F3 DCF · F4 COMPS · F5 ALGO · F6 NEWS
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
