// Configuration constants for the smart-money composite (SMC).
// All weights normalize to 1 when an enabled component is present.

export const SMC_WEIGHTS = {
  congress: 0.25,
  institutional: 0.25,
  insider: 0.25,
  options: 0.25, // null until Checkpoint 3 → mass redistributed
};

export const SMC_WEIGHTS_CP1 = {
  congress: 0.33,
  institutional: 0.33,
  insider: 0.34,
  options: 0,
};

export const CLUSTER_DEFINITION = {
  windowDays: 30,
  minDistinctBuyers: 3, // ≥3 distinct insiders = qualifies as a cluster
  pCodeOnly: true,
  excludeRule10b51: true,
};

export const CONGRESS_WINDOW_DAYS = 90;
export const FORM4_WINDOW_DAYS = 30;
export const INSTITUTIONAL_BIG_POSITION_USD = 500_000_000; // $500M threshold for "biggest new"

export const CACHE_TTL_SECONDS = {
  congress: 3600, // 1h
  form4: 3600, // 1h
  thirteenF: 86400, // 24h
  smcAggregate: 3600,
};

export const FLOW_CONGRESS_PROVIDER: "quiver" | "stub" =
  (process.env.FLOW_CONGRESS_PROVIDER as "quiver" | "stub") ?? "stub";

// Party chip palette (functional data colors, like green/red on deltas)
export const PARTY_COLOR = {
  R: "#dc2626",
  D: "#2563eb",
  I: "#71717a",
} as const;
