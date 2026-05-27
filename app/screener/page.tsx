import { loadPicks } from "@/lib/picks-data";
import {
  SAVED_SCREENS,
  findScreen,
  applyScreen,
  annotateCounts,
} from "@/lib/saved-screens";
import ScreenerClient from "./ScreenerClient";

export const dynamic = "force-dynamic";

interface ScreenerPageProps {
  searchParams: { screen?: string };
}

export default function ScreenerPage({ searchParams }: ScreenerPageProps): JSX.Element {
  const picks = loadPicks();
  const screens = annotateCounts(SAVED_SCREENS, picks);
  const active = findScreen(searchParams.screen);
  const rows = applyScreen(picks, active.filter).slice(0, 80);

  return (
    <ScreenerClient
      screens={screens}
      active={active.slug}
      rows={rows}
      totalUniverse={picks.length}
    />
  );
}
