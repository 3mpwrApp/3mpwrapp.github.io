import { llmSimplify, llmInterpret } from './llm';

// Shared deterministic fallback helpers for offline / no-backend scenarios.

export async function aiSimplify(input: string) {
  if (!input.trim()) return '';
  const remote = await llmSimplify(input);
  if (remote) return remote;
  // simple local rule-based simplification fallback
  return input
    .replace(/notwithstanding/gi, 'despite')
    .replace(/pursuant to/gi, 'under')
    .replace(/shall/gi, 'will')
    .split(/[,;]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .join('\n');
}

export async function aiInterpret(input: string) {
  if (!input.trim()) return { summary: '', next: [] };
  const remote = await llmInterpret(input);
  if (remote) return remote;
  const lower = input.toLowerCase();
  const next: string[] = [];
  if (lower.includes('appeal')) next.push('Note any appeal deadlines on a calendar.');
  if (lower.includes('medical')) next.push('Gather updated medical notes focused on functional limits.');
  if (lower.includes('overpayment')) next.push('Review repayment options; consider hardship request.');
  if (!next.length) next.push('Document details and consider seeking legal guidance.');
  const summary = input.split(/\n|\./).slice(0,4).join('. ').trim();
  return { summary: summary || 'Summary unavailable - provide more detail.', next };
}

export async function aiPolicySimplify(topic: string, text: string) {
  if (!text.trim()) return { summary: '', keyPoints: [] as string[] };
  // No remote endpoint yet; reuse aiSimplify and extract bullet-ish lines
  const simple = await aiSimplify(text);
  const lines = simple.split(/\n+/).map(l=>l.trim()).filter(l=>l.length>4);
  return { summary: lines.slice(0,3).join(' '), keyPoints: lines.slice(0,8) };
}

export async function aiCoachPrompt(prompt: string) {
  if (!prompt.trim()) return '';
  // Mocked structured coaching response
  return `Goal: ${prompt}\nStep 1: Clarify the specific outcome you want.\nStep 2: Gather supporting evidence (documents, dates).\nStep 3: Draft a concise request using plain language.\nBarrier Check: Identify any access barriers and accommodations needed.\nConfidence Tip: Focus on functional limits not just diagnosis.`;
}

export type CollectiveInterest = { id: string; title: string; description?: string; supporters: number; personal?: boolean };
