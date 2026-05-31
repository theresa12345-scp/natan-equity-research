// Live pulsating dot — for "LIVE" chips and streaming indicators.
// Hard-edged square per design language (no rounded corners).
// Animation gated by prefers-reduced-motion via globals.css.

interface PulseProps {
  color?: string;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

export default function Pulse({
  color = "#00d97e",
  size = 7,
  className,
  ariaLabel,
}: PulseProps): JSX.Element {
  return (
    <span
      aria-label={ariaLabel ?? "live"}
      role={ariaLabel ? "img" : undefined}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        background: color,
        verticalAlign: "middle",
        flexShrink: 0,
      }}
      className={`mrdn-pulse ${className ?? ""}`}
    />
  );
}
