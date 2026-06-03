import Link from "next/link";
import { citation } from "@/lib/data/citations";
import Tooltip from "@/components/primitives/Tooltip";

interface CitationChipProps {
  id: string;
  size?: "xs" | "sm";
  variant?: "outline" | "subtle";
}

// Magenta-outline chip linking to /sources#cite-<id>. Hover tooltip
// shows the citation's title + venue + key finding. Falls back silently
// if id is unknown.
export default function CitationChip({
  id,
  size = "xs",
  variant = "outline",
}: CitationChipProps): JSX.Element | null {
  const c = citation(id);
  if (!c) return null;
  const fontSize = size === "sm" ? 9.5 : 9;
  const lastName =
    c.shortLabel ?? c.authors.split(",")[0].split(" ").pop() ?? "—";
  const label = `${lastName} ${c.year}`;

  const tooltipContent = (
    <>
      <div style={{ color: "#ff2e88", fontWeight: 600, fontSize: 10.5, marginBottom: 3, lineHeight: 1.35 }}>
        {c.authors} ({c.year})
      </div>
      <div style={{ color: "#f5f5f5", fontSize: 10, marginBottom: 4, lineHeight: 1.4 }}>
        {c.title}
      </div>
      <div style={{ color: "#7a7a7a", fontSize: 9.5, marginBottom: 6, fontStyle: "italic" }}>
        {c.venue}
      </div>
      <div style={{ color: "#d8d8d8", fontSize: 10, lineHeight: 1.5 }}>
        {c.keyFinding}
      </div>
    </>
  );

  const chip =
    variant === "subtle" ? (
      <Link
        href={`/sources#cite-${id}`}
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
    ) : (
      <Link
        href={`/sources#cite-${id}`}
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

  return (
    <Tooltip content={tooltipContent} maxWidth={360}>
      {chip}
    </Tooltip>
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
