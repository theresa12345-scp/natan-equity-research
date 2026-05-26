// Anthropic Claude prose generation for the Daily Brief.
// Graceful fallback: if ANTHROPIC_API_KEY is missing, returns null so
// the caller can substitute a hand-written placeholder.

import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are the in-house writer for an institutional equity research terminal called Meridian. Your audience is a buy-side PM running US + Indonesia mandates.

Voice rules:
- Dense, declarative sentences. No hedging fluff ("interestingly", "it's worth noting"). No exclamation marks.
- Cite specific numbers from the data you are given. Never invent figures.
- One paragraph, 60–90 words, unless the user asks for a one-liner.
- Use sector / pillar / regime terminology consistent with quantitative research (composite z-score, factor tilt, regime sensitivity, etc.).
- Reference the source by name when relevant (Apollo Daily Spark, JPM EOTM, BRIDS Equity Snapshot, MSCI review, BI-Rate, FOMC).
- No headers, no bullet points, no markdown — flowing prose only.`;

function client(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

async function callClaude(prompt: string, maxTokens: number = 260): Promise<string | null> {
  const c = client();
  if (!c) return null;
  try {
    const msg = await c.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const block = msg.content[0];
    if (block && block.type === "text") return block.text.trim();
    return null;
  } catch (err) {
    console.warn("[brief] claude call failed:", (err as Error).message);
    return null;
  }
}

export async function generateChartTakeaway(
  headline: string,
  data: object,
): Promise<string | null> {
  const prompt = `Write the takeaway paragraph for the Chart of the Day in today's Daily Brief.

Headline: ${headline}

Data:
${JSON.stringify(data, null, 2)}

Constraints: one paragraph, 60–90 words. Cite the specific numbers from the data. Frame the implication for an institutional reader (factor tilt, valuation pillar, regime).`;
  return callClaude(prompt, 260);
}

export async function generateIdeaBlurb(
  ticker: string,
  composite: number,
  pillars: { name: string; score: number }[],
  context: string,
): Promise<string | null> {
  const prompt = `Write the Idea of the Day paragraph for ${ticker}.

Composite z-score: ${composite >= 0 ? "+" : ""}${composite.toFixed(2)}σ.
Top pillar scores: ${pillars.map((p) => `${p.name} ${p.score}`).join(", ")}.
Context: ${context}

Constraints: one paragraph, 80–110 words. Open with the composite movement. Cite at least two of the pillar scores. Close with one watchpoint or risk. Do not use the words BUY, SELL, HOLD, AVOID — frame as research, not transaction.`;
  return callClaude(prompt, 320);
}

export async function generateSectorRead(
  sector: string,
  idxPerf: number,
  usPerf: number,
  topNames: { ticker: string; change: number }[],
): Promise<string | null> {
  const prompt = `Write one short line (10–18 words, no punctuation at end) summarising today's tape in ${sector}.

IDX ${idxPerf >= 0 ? "+" : ""}${idxPerf.toFixed(2)}%. US ${usPerf >= 0 ? "+" : ""}${usPerf.toFixed(2)}%.
Notable names: ${topNames.map((n) => `${n.ticker} ${n.change >= 0 ? "+" : ""}${n.change.toFixed(2)}%`).join(", ")}.

Output only the one line. No header, no quotes.`;
  return callClaude(prompt, 80);
}

export async function generateMacroDriver(
  label: string,
  facts: string,
): Promise<string | null> {
  const prompt = `One-line macro-driver entry for the Daily Brief.

Topic: ${label}
Facts: ${facts}

Write 12–22 words, no punctuation at end, declarative. No quotation marks.`;
  return callClaude(prompt, 80);
}
