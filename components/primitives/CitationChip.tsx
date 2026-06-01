import Link from "next/link";
import { citation } from "@/lib/data/citations";

interface CitationChipProps {
  id: string;
  size?: "xs" | "sm";
  variant?: "outline" | "subtle";
}

// Magenta-outline chip linking to /sources#cite-<id>. Tooltip shows the
// key finding. Falls back silently if id is unknown.
export default function CitationChip({
  id,
  size = "xs",
  variant = "outline",
}: CitationChipProps): JSX.Element | null {
  const c = citation(id);
  if (!c) return null;
  const fontSize = size === "sm" ? 9.5 : 9;
  // Institutional authors ("Bloomberg Intelligence", "MSCI Inc.",
  // "Morningstar Research") use an explicit shortLabel; otherwise pull
  // the lead author's lastname.
  const lastName =
    c.shortLabel ?? c.authors.split(",")[0].split(" ").pop() ?? "—";
  const label = `${lastName} ${c.year}`;
  const tooltip = `${c.title} · ${c.venue}\n${c.keyFinding}`;

  if (variant === "subtle") {
    return (
      <Link
        href={`/sources#cite-${id}`}
        title={tooltip}
        className="num hover:brightness-125"
        style={{
          fontSize,
          color: "#ff2e88",
          letterSpacing: "0.04em",
          textDecoration: "none",
          borderBottom: "1px dotted #ff2e88",
          paddingBottom: 1,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Link>
    );
  }
  return (
    <Link
      href={`/sources#cite-${id}`}
      title={tooltip}
      className="num hover:brightness-125"
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize,
        color: "#ff2e88",
        border: "1px solid #ff2e88",
        background: "rgba(255,46,136,0.05)",
        padding: "1px 5px",
        letterSpacing: "0.06em",
        textDecoration: "none",
        whiteSpace: "nowrap",
        lineHeight: 1.3,
      }}
    >
      {label}
    </Link>
  );
}

// Multi-chip helper for "founded on X, Y, Z" rows.
export function CitationCluster({
  ids,
  label,
  size = "xs",
}: {
  ids: string[];
  label?: string;
  size?: "xs" | "sm";
}): JSX.Element {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {label ? (
        <span
          className="num"
          style={{
            fontSize: size === "sm" ? 9.5 : 9,
            color: "#666",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
      ) : null}
      {ids.map((id) => (
        <CitationChip key={id} id={id} size={size} />
      ))}
    </span>
  );
}
