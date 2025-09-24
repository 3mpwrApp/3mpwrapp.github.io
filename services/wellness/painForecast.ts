import { getCachedJSON } from "../../services/cache";

type SymptomEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  pain?: string; // 0-10
  tags?: string;
};

export type PainForecast = {
  avg7d: number;
  trend: "improving" | "worsening" | "stable" | "unknown";
  tips: string[];
  next3d: Array<{ date: string; expected: "lower" | "similar" | "higher" }>;
};

export async function forecastPain(): Promise<PainForecast> {
  const entries = (await getCachedJSON<SymptomEntry[]>("wellness_symptom_entries")) || [];
  const byDate = entries
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((e) => ({ ...e, p: toNum(e.pain) }))
    .filter((e) => e.p !== null) as Array<SymptomEntry & { p: number }>;
  const last7 = byDate.slice(-7);
  const prev7 = byDate.slice(-14, -7);
  const avg7d = avg(last7.map((e) => e.p)) ?? 0;
  const avgPrev7 = avg(prev7.map((e) => e.p));
  let trend: PainForecast["trend"] = "unknown";
  if (avgPrev7 != null) {
    const delta = avg7d - avgPrev7;
    trend = Math.abs(delta) < 0.2 ? "stable" : delta < 0 ? "improving" : "worsening";
  }
  const tips: string[] = [];
  if (trend === "worsening") tips.push("Plan lighter tasks and increase rest blocks.");
  if (trend === "improving") tips.push("Consider gentle progression but keep pacing.");
  if (containsTag(last7, "med-change")) tips.push("Recent med change — monitor interactions and hydration.");
  if (containsTag(last7, "stress")) tips.push("Stress spike — add brief grounding breaks.");
  if (containsTag(last7, "sleep")) tips.push("Prioritize sleep routine tonight (wind-down alarm).");
  const next3d: PainForecast["next3d"] = [];
  const today = new Date();
  for (let i = 1; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    // naive rule: if worsening -> higher, improving -> lower, else similar
    const expected = trend === "worsening" ? "higher" : trend === "improving" ? "lower" : "similar";
    next3d.push({ date: d.toISOString().slice(0, 10), expected });
  }
  return { avg7d, trend, tips, next3d };
}

function toNum(x?: string): number | null {
  if (!x) return null;
  const n = parseFloat(x);
  return isNaN(n) ? null : n;
}

function avg(arr: number[]): number | null {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function containsTag(list: Array<{ tags?: string }>, tag: string) {
  return list.some((e) => (e.tags || "").toLowerCase().includes(tag));
}
