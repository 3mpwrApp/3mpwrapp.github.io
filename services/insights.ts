import { getCachedJSON } from "./cache";

type SymptomEntry = { id: string; date: string; pain?: string; symptoms?: string; impact?: string; meds?: string; tags?: string };
type SleepEntry = { id: string; date: string; sleepHours?: string; sleepQuality?: string; energy?: string; notes?: string };

export async function buildSymptomSummary(): Promise<string> {
  const entries = (await getCachedJSON<SymptomEntry[]>("wellness_symptom_entries")) || [];
  if (!entries.length) return "No symptom/pain entries available.";
  const pains = entries.map((e) => parseFloat(e.pain || "0")).filter((n) => !isNaN(n));
  const avg = pains.length ? (pains.reduce((a,b)=>a+b,0)/pains.length).toFixed(1) : "0";
  const min = pains.length ? Math.min(...pains) : 0;
  const max = pains.length ? Math.max(...pains) : 0;
  const bullets = entries.slice(0, 10).map((e) => `• ${e.date}: pain ${e.pain ?? "?"}; impact: ${e.impact ?? "-"}`);
  return [
    `Symptom & Pain Summary`,
    `Pain 0–10: avg ${avg}, range ${min}–${max}`,
    ...bullets,
  ].join("\n");
}

export async function buildSleepSummary(): Promise<string> {
  const entries = (await getCachedJSON<SleepEntry[]>("wellness_sleep_entries")) || [];
  if (!entries.length) return "No sleep/energy entries available.";
  const hours = entries.map((e) => parseFloat(e.sleepHours || "0")).filter((n) => !isNaN(n));
  const avg = hours.length ? (hours.reduce((a,b)=>a+b,0)/hours.length).toFixed(1) : "0";
  const bullets = entries.slice(0, 10).map((e) => `• ${e.date}: ${e.sleepHours ?? "?"}h; energy ${e.energy ?? "?"}`);
  return [
    `Sleep & Energy Summary`,
    `Sleep hours/day (avg): ${avg}`,
    ...bullets,
  ].join("\n");
}

export async function buildCombinedEvidenceSummary(): Promise<string> {
  const [sym, slp] = await Promise.all([buildSymptomSummary(), buildSleepSummary()]);
  return `${sym}\n\n${slp}\n\nNote: Attach medical notes where possible to corroborate functional impact.`;
}

