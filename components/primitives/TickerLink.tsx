import Link from "next/link";

interface TickerLinkProps {
  ticker: string;
  market?: "IDX" | "US";
  href?: string;
  className?: string;
  bold?: boolean;
  size?: "xs" | "sm" | "md";
}

const KNOWN_ROUTES: Record<string, string> = {
  BBCA: "/idx/bbca",
  MYOR: "/idx/myor",
  NVDA: "/us/nvda",
};

export default function TickerLink({
  ticker,
  market = "IDX",
  href,
  className = "",
  bold = false,
  size = "sm",
}: TickerLinkProps): JSX.Element {
  const resolved =
    href ?? KNOWN_ROUTES[ticker] ?? `/${market.toLowerCase()}/${ticker.toLowerCase()}`;
  const fontSize = size === "xs" ? 10 : size === "md" ? 12 : 11;

  return (
    <Link
      href={resolved}
      className={`num hover:underline ${className}`}
      data-ticker={ticker.toUpperCase()}
      style={{
        color: "#ff2e88",
        fontWeight: bold ? 600 : 500,
        textDecorationColor: "#ff2e88",
        textUnderlineOffset: 2,
        letterSpacing: "0.02em",
        fontSize,
        padding: "0 2px",
        margin: "0 -2px",
      }}
    >
      {ticker}
    </Link>
  );
}
