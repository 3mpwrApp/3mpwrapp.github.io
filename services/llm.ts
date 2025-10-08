import { devCostAlert } from './costGuard';
import { FLAGS } from './featureFlags';
const BASE = process.env.EXPO_PUBLIC_LLM_BASE || "";

async function post(path: string, body: any) {
  if (!FLAGS.llm || !BASE) return null;
  try {
    // Developer cost alert for LLM network usage
    devCostAlert({ feature: 'llm', action: `request:POST ${path}`, details: { keys: Object.keys(body || {}) } });
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function llmSimplify(text: string): Promise<string | null> {
  const data = await post("/simplify", { text });
  return data && typeof data.summary === "string"
    ? (data.summary as string)
    : null;
}

export async function llmInterpret(
  text: string,
): Promise<{ summary: string; next: string[] } | null> {
  const data = await post("/interpret", { text });
  if (data && typeof data.summary === "string" && Array.isArray(data.next))
    {return data as any;}
  return null;
}
