"use client";

import { useWatchlist } from "@/lib/watchlist";

interface StarButtonProps {
  ticker: string;
  region: "IDX" | "US";
  size?: "sm" | "md";
}

export default function StarButton({ ticker, region, size = "sm" }: StarButtonProps): JSX.Element {
  const { has, toggle } = useWatchlist();
  const isOn = has(ticker.toUpperCase());
  const fontSize = size === "md" ? 14 : 12;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(ticker, region);
      }}
      aria-label={isOn ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`}
      aria-pressed={isOn}
      className="hover:brightness-125"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: isOn ? "#ff2e88" : "#444",
        fontSize,
        lineHeight: 1,
        width: fontSize + 4,
        height: fontSize + 4,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 80ms linear",
      }}
    >
      {isOn ? "★" : "☆"}
    </button>
  );
}
