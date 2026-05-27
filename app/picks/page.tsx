import PicksClient from "./PicksClient";
import { loadPicks, uniqueSectors } from "@/lib/picks-data";

export const dynamic = "force-dynamic";

export default function PicksPage(): JSX.Element {
  const picks = loadPicks();
  const sectors = uniqueSectors(picks);
  // Keep top 200 by composite — keeps client-side filtering snappy
  const topPicks = picks.slice(0, 200);
  return <PicksClient initialPicks={topPicks} sectors={sectors} totalUniverse={picks.length} />;
}
