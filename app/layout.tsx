import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/shell/TopBar";
import TickerTape from "@/components/shell/TickerTape";
import RightRail from "@/components/shell/RightRail";
import StatusBar from "@/components/shell/StatusBar";
import ShellChrome from "@/components/shell/ShellChrome";
import NavigationProgressBar from "@/components/shell/NavigationProgressBar";
import { Suspense } from "react";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridian Terminal",
  description:
    "Institutional equity research workstation — IDX & US equities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${jetbrains.variable}`}
    >
      <body
        className={`${GeistSans.className} bg-surface-0 text-fg min-h-screen`}
      >
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <ShellChrome>
          <div
            className="grid min-h-screen"
            style={{ gridTemplateRows: "auto auto 1fr auto" }}
          >
            <TopBar />
            <TickerTape />

            <div
              className="grid main-grid"
              style={{ minHeight: 0 }}
            >
              <main className="overflow-auto min-w-0">{children}</main>
              <aside className="right-rail">
                <RightRail />
              </aside>
            </div>

            <StatusBar />
          </div>
        </ShellChrome>
      </body>
    </html>
  );
}
