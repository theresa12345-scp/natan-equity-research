"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Thin magenta progress strip at the top of the viewport during Next.js
// navigation. Fires on every pathname/search change; auto-completes once
// the new route has painted. Single-line CSS animation — no spinner, no
// shimmer, no bounce.
export default function NavigationProgressBar(): JSX.Element {
  const pathname = usePathname();
  const search = useSearchParams();
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    // Run on any pathname or search-params change. Skip the initial mount.
    setPhase("loading");
    const doneTimer = setTimeout(() => setPhase("done"), 220);
    const idleTimer = setTimeout(() => setPhase("idle"), 480);
    return () => {
      clearTimeout(doneTimer);
      clearTimeout(idleTimer);
    };
  }, [pathname, search]);

  if (phase === "idle") return <></>;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          background: "#ff2e88",
          width: phase === "loading" ? "70%" : "100%",
          transition:
            phase === "loading"
              ? "width 200ms ease-out"
              : "width 120ms ease-in, opacity 200ms ease-out 80ms",
          opacity: phase === "done" ? 0 : 1,
        }}
      />
    </div>
  );
}
