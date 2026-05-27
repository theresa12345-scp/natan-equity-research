import FlowClient from "./FlowClient";
import { CONGRESS_STUB, POLITICIAN_LEADERBOARD } from "@/lib/flow/stubs/congress";
import { FORM4_STUB, FORM4_AS_OF } from "@/lib/flow/stubs/form4";
import {
  THIRTEEN_F_STUB,
  NOTABLE_EXITS,
  THIRTEEN_F_AS_OF,
  THIRTEEN_F_PERIOD_END,
} from "@/lib/flow/stubs/thirteen-f";
import { computeSMC, unionTickers } from "@/lib/flow/aggregators";
import { TRACKED_INSTITUTIONS } from "@/lib/flow/institutions";

export const revalidate = 3600;

export default function FlowPage(): JSX.Element {
  const tickers = unionTickers(CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);
  const smc = computeSMC(tickers, CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);
  smc.sort((a, b) => b.smcZ - a.smcZ);

  // KPI strip values
  const ref = new Date("2026-05-26");
  const within = (d: string, days: number): boolean => {
    const t = new Date(d).getTime();
    const r = ref.getTime();
    const diff = Math.floor((r - t) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= days;
  };
  const congress7d = CONGRESS_STUB.filter((c) => within(c.tradeDate, 7));
  const congressNet7d =
    congress7d.filter((c) => c.transactionType === "Buy")
      .reduce((s, c) => s + (c.amountMin + c.amountMax) / 2, 0) -
    congress7d.filter((c) => c.transactionType === "Sale")
      .reduce((s, c) => s + (c.amountMin + c.amountMax) / 2, 0);
  const adds = THIRTEEN_F_STUB.filter(
    (p) => p.isNew || (p.sharesChangeQoQ != null && p.sharesChangeQoQ > 0),
  ).length;
  const exits =
    THIRTEEN_F_STUB.filter(
      (p) => p.isExit || (p.sharesChangeQoQ != null && p.sharesChangeQoQ < 0),
    ).length + NOTABLE_EXITS.length;
  const form47d = FORM4_STUB.filter((f) => within(f.transactionDate, 7));
  const insiderNet7d =
    form47d.filter((f) => f.txnCode === "P" && !f.is10b51)
      .reduce((s, f) => s + f.valueUsd, 0) -
    form47d.filter((f) => f.txnCode === "S" && !f.is10b51)
      .reduce((s, f) => s + f.valueUsd, 0);

  // Cluster tickers (≥3 distinct P-code buyers in 30d)
  const clusterByTicker = new Map<string, Set<string>>();
  FORM4_STUB.filter(
    (f) => f.txnCode === "P" && !f.is10b51 && within(f.transactionDate, 30),
  ).forEach((f) => {
    if (!clusterByTicker.has(f.ticker)) clusterByTicker.set(f.ticker, new Set());
    clusterByTicker.get(f.ticker)!.add(f.insiderName);
  });
  const clusters7d = Array.from(clusterByTicker.entries())
    .filter(([, s]) => s.size >= 3).length;

  return (
    <FlowClient
      smc={smc.slice(0, 25)}
      congress={CONGRESS_STUB}
      thirteenF={THIRTEEN_F_STUB}
      notableExits={NOTABLE_EXITS}
      form4={FORM4_STUB}
      institutions={TRACKED_INSTITUTIONS}
      politicianLeaderboard={POLITICIAN_LEADERBOARD}
      kpis={{
        congressTrades7d: congress7d.length,
        congressNetUsd7d: congressNet7d,
        instAdds: adds,
        instExits: exits,
        clusters30d: clusters7d,
        insiderNetUsd7d: insiderNet7d,
      }}
      meta={{
        congressAsOf: CONGRESS_STUB.reduce(
          (max, c) => (c.filingDate > max ? c.filingDate : max),
          "1900-01-01",
        ),
        form4AsOf: FORM4_AS_OF,
        thirteenFAsOf: THIRTEEN_F_AS_OF,
        thirteenFPeriodEnd: THIRTEEN_F_PERIOD_END,
      }}
    />
  );
}
