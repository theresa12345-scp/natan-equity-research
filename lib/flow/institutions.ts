import type { TrackedInstitution } from "./types";

// 20 tracked institutions for 13F coverage. CIKs verified from SEC
// EDGAR filer lookup. Family offices that converted away from 13F
// reporting (Duquesne / Soros pre-2011) are excluded; their successor
// vehicles are listed where applicable.

export const TRACKED_INSTITUTIONS: TrackedInstitution[] = [
  { cik: "1067983", name: "Berkshire Hathaway",       manager: "Warren Buffett",     aumUsd: 313_000, strategy: "Value" },
  { cik: "1336528", name: "Pershing Square Capital",  manager: "Bill Ackman",        aumUsd: 18_400,  strategy: "Activist" },
  { cik: "1040273", name: "Third Point",              manager: "Dan Loeb",           aumUsd: 14_200,  strategy: "Event-Driven" },
  { cik: "1656456", name: "Appaloosa Management",     manager: "David Tepper",       aumUsd: 16_800,  strategy: "Distressed" },
  { cik: "1079114", name: "Greenlight Capital",       manager: "David Einhorn",      aumUsd: 1_400,   strategy: "Long-Short" },
  { cik: "1061165", name: "Baupost Group",            manager: "Seth Klarman",       aumUsd: 27_000,  strategy: "Value" },
  { cik: "1167483", name: "Tiger Global Management",  manager: "Chase Coleman",      aumUsd: 40_000,  strategy: "Growth" },
  { cik: "1135730", name: "Coatue Management",        manager: "Philippe Laffont",   aumUsd: 50_000,  strategy: "Growth" },
  { cik: "1771602", name: "D1 Capital Partners",      manager: "Dan Sundheim",       aumUsd: 20_000,  strategy: "Long-Short" },
  { cik: "1061768", name: "Lone Pine Capital",        manager: "Steve Mandel",       aumUsd: 19_000,  strategy: "Growth" },
  { cik: "1103804", name: "Viking Global Investors",  manager: "Andreas Halvorsen",  aumUsd: 40_000,  strategy: "Long-Short" },
  { cik: "1003830", name: "Maverick Capital",         manager: "Lee Ainslie",        aumUsd: 9_200,   strategy: "Long-Short" },
  { cik: "1180174", name: "ValueAct Capital",         manager: "Mason Morfit",       aumUsd: 13_000,  strategy: "Activist" },
  { cik: "1791786", name: "Elliott Investment Mgmt",  manager: "Paul Singer",        aumUsd: 63_000,  strategy: "Activist" },
  { cik: "0921669", name: "Icahn Enterprises",        manager: "Carl Icahn",         aumUsd: 25_000,  strategy: "Activist" },
  { cik: "1029160", name: "Soros Fund Management",    manager: "Family Office",      aumUsd: 25_000,  strategy: "Macro" },
  { cik: "1350694", name: "Bridgewater Associates",   manager: "Nir Bar Dea",        aumUsd: 124_000, strategy: "Macro" },
  { cik: "1423053", name: "Citadel Advisors",         manager: "Ken Griffin",        aumUsd: 63_000,  strategy: "Quant" },
  { cik: "1037389", name: "Renaissance Technologies", manager: "Peter Brown",        aumUsd: 130_000, strategy: "Quant" },
  { cik: "1179392", name: "Two Sigma Investments",    manager: "Siegel / Overdeck",  aumUsd: 60_000,  strategy: "Quant" },
];

export function institutionByCik(cik: string): TrackedInstitution | undefined {
  return TRACKED_INSTITUTIONS.find((i) => i.cik === cik);
}

export function institutionByName(name: string): TrackedInstitution | undefined {
  return TRACKED_INSTITUTIONS.find((i) => i.name === name);
}
