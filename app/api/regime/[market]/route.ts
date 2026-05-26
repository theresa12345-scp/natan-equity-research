import { type NextRequest, NextResponse } from "next/server";

// TODO: replace stub with real 2-state HMM on weekly index returns +
// realized vol + credit spread + term-slope. Cite Hamilton (1989)
// Econometrica 57(2):357-384.

const STUB: Record<string, {
  state: "risk-on" | "risk-off" | "transition";
  prob: number;
  daysInRegime: number;
  expectedDuration: number;
}> = {
  idx: { state: "risk-on", prob: 0.84, daysInRegime: 37, expectedDuration: 84 },
  us: { state: "risk-on", prob: 0.72, daysInRegime: 21, expectedDuration: 68 },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { market: string } },
): Promise<NextResponse> {
  const market = params.market.toLowerCase();
  const data = STUB[market] ?? STUB.idx;
  return NextResponse.json({
    ...data,
    market: market.toUpperCase(),
  });
}
