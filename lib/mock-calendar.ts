export interface CalendarEvent {
  date: string;          // YYYY-MM-DD
  time: string;          // local HH:MM
  region: "US" | "IDX" | "GLOBAL";
  category: "Macro" | "Earnings" | "Regulatory" | "Policy" | "Index";
  ticker?: string;
  title: string;
  consensus?: string;
  impact: "high" | "medium" | "low";
  probWeight: number;    // 0-1 base-case probability
  note: string;
}

// Forward 30-day calendar.
export const CALENDAR_EVENTS: CalendarEvent[] = [
  // This week
  { date: "2026-05-26", time: "10:00 WIB", region: "IDX", category: "Macro", title: "BPS CPI · April", consensus: "+2.84% YoY", impact: "high", probWeight: 0.75, note: "BI-Rate path-dependent · doves need <2.7%" },
  { date: "2026-05-26", time: "14:30 EDT", region: "US", category: "Macro", title: "Core PCE deflator · April", consensus: "+0.21% MoM", impact: "high", probWeight: 0.62, note: "Fed reaction function pivot; Sep cut prob 64%" },
  { date: "2026-05-26", time: "16:00 EDT", region: "US", category: "Earnings", ticker: "NVDA", title: "NVDA FY26 Q1 earnings", consensus: "EPS $0.84 · Rev $43.2B", impact: "high", probWeight: 0.70, note: "Blackwell yield + China export framing" },
  { date: "2026-05-27", time: "09:30 WIB", region: "IDX", category: "Earnings", ticker: "BBNI", title: "BBNI 1H earnings call", consensus: "NIM 4.8%", impact: "high", probWeight: 0.55, note: "Cooperative-lending exposure read" },
  { date: "2026-05-28", time: "13:00 WIB", region: "GLOBAL", category: "Index", title: "MSCI quarterly review preview", impact: "medium", probWeight: 0.40, note: "ID FIF watch · Jan 2026 7% drop precedent" },
  { date: "2026-05-28", time: "10:00 EDT", region: "US", category: "Macro", title: "Initial jobless claims", consensus: "215k", impact: "low", probWeight: 0.65, note: "Labor market read" },
  { date: "2026-05-29", time: "14:00 EDT", region: "US", category: "Earnings", ticker: "AVGO", title: "AVGO Q2 results", consensus: "EPS $1.42", impact: "high", probWeight: 0.60, note: "ASIC vs NVDA read-through" },
  { date: "2026-05-30", time: "09:00 WIB", region: "IDX", category: "Earnings", ticker: "BMRI", title: "BMRI 1H call", consensus: "Loan growth 11%", impact: "medium", probWeight: 0.58, note: "State bank cooperative-policy exposure" },
  // Week 2
  { date: "2026-06-02", time: "14:30 EDT", region: "US", category: "Macro", title: "ISM Manufacturing PMI", consensus: "48.4", impact: "high", probWeight: 0.55, note: "Contraction extending — recession signal?" },
  { date: "2026-06-03", time: "10:00 WIB", region: "IDX", category: "Macro", title: "BPS GDP Q1 advance", consensus: "+4.9% YoY", impact: "high", probWeight: 0.70, note: "Domestic consumption read" },
  { date: "2026-06-04", time: "14:30 EDT", region: "US", category: "Macro", title: "ADP private payrolls", consensus: "+128k", impact: "medium", probWeight: 0.60, note: "NFP preview" },
  { date: "2026-06-05", time: "07:30 EDT", region: "US", category: "Macro", title: "Initial jobless claims", impact: "low", probWeight: 0.70, note: "Trend continuation" },
  { date: "2026-06-06", time: "08:30 EDT", region: "US", category: "Macro", title: "Nonfarm payrolls + unemployment · May", consensus: "+148k · 4.2%", impact: "high", probWeight: 0.65, note: "Fed dual-mandate input" },
  { date: "2026-06-06", time: "09:00 WIB", region: "IDX", category: "Macro", title: "BI foreign reserves · May", impact: "low", probWeight: 0.80, note: "FX intervention read" },
  // Week 3
  { date: "2026-06-09", time: "14:30 EDT", region: "US", category: "Macro", title: "CPI · May", consensus: "+2.4% YoY", impact: "high", probWeight: 0.60, note: "Fed June-meeting input · core sticky" },
  { date: "2026-06-11", time: "14:00 EDT", region: "US", category: "Policy", title: "FOMC decision · Powell presser", consensus: "Hold 5.00-5.25%", impact: "high", probWeight: 0.78, note: "Dot plot · 2026 cut count" },
  { date: "2026-06-12", time: "14:00 WIB", region: "IDX", category: "Policy", title: "Bank Indonesia BI-Rate decision", consensus: "Hold 5.25%", impact: "high", probWeight: 0.65, note: "Dovish-pivot guidance watch · BBCA NIM lever" },
  { date: "2026-06-13", time: "16:00 EDT", region: "US", category: "Earnings", ticker: "ORCL", title: "Oracle Q4", consensus: "EPS $1.65", impact: "medium", probWeight: 0.55, note: "Hyperscaler capex read" },
  // Week 4
  { date: "2026-06-16", time: "10:00 WIB", region: "IDX", category: "Macro", title: "Trade balance · May", consensus: "+$2.4 bn", impact: "medium", probWeight: 0.55, note: "Commodity export bellwether" },
  { date: "2026-06-18", time: "14:30 EDT", region: "US", category: "Macro", title: "Retail sales · May", consensus: "+0.3% MoM", impact: "high", probWeight: 0.55, note: "Consumer health · K-shape read" },
  { date: "2026-06-19", time: "AMC EDT", region: "US", category: "Earnings", ticker: "MSFT", title: "MSFT FY26 Q4 prelim", impact: "high", probWeight: 0.30, note: "Azure AI revenue inflection" },
  { date: "2026-06-20", time: "09:00 WIB", region: "IDX", category: "Index", title: "MSCI semi-annual review", impact: "high", probWeight: 0.50, note: "Indonesia FIF inclusion outcome" },
  { date: "2026-06-24", time: "10:00 EDT", region: "US", category: "Macro", title: "Consumer confidence · June", consensus: "100.2", impact: "medium", probWeight: 0.55, note: "Spending propensity" },
  { date: "2026-06-26", time: "14:00 EDT", region: "US", category: "Macro", title: "GDP Q1 final", consensus: "+1.6% AR", impact: "medium", probWeight: 0.62, note: "Revision tail" },
];

export function eventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  return events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});
}

export interface CalendarFilter {
  region?: "all" | "US" | "IDX" | "GLOBAL";
  category?: "all" | CalendarEvent["category"];
  impact?: "all" | "high" | "medium" | "low";
}
