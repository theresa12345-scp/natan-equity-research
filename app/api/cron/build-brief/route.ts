import { NextResponse, type NextRequest } from "next/server";
import { buildBrief } from "@/lib/brief/build";

// Daily Brief cron endpoint.
//
// Triggered by Vercel Cron (see vercel.json) at:
//   23:30 UTC = 06:30 WIB     (Indonesia open)
//   12:00 UTC = 08:00 EDT     (US pre-open, Mon-Fri)
//
// Manual force-rebuild:
//   curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/build-brief
//
// In dev / when CRON_SECRET is unset, the endpoint accepts unauth requests
// for local testing.

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel Hobby caps at 60s; Pro 300s.

export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    // Vercel Cron sends `Bearer <CRON_SECRET>` automatically when env var is set
    if (auth !== `Bearer ${secret}`) {
      return new NextResponse("forbidden", { status: 403 });
    }
  }

  const start = Date.now();
  const brief = await buildBrief();
  const elapsedMs = Date.now() - start;

  // TODO: when Vercel KV is provisioned, persist:
  //   import { kv } from "@vercel/kv";
  //   await kv.set("brief:latest", brief, { ex: 60 * 60 * 24 * 7 });
  //   await kv.set(`brief:${brief.date}`, brief, { ex: 60 * 60 * 24 * 90 });
  // For V1 the brief page itself calls buildBrief() with revalidate:21600
  // so cron is non-blocking — used for monitoring + forced refresh.

  return NextResponse.json(
    {
      ok: true,
      date: brief.date,
      source: brief.source,
      sourceDetail: brief.sourceDetail,
      elapsedMs,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
