import { llmInterpret } from './llm';

export async function aiAccountabilityPlan(issue: string, target?: string, jurisdictionCode?: string) {
  const trimmed = (issue || '').trim();
  if (!trimmed) return '';
  const who = (target || '').trim();
  try {
    const remote = await llmInterpret(
      `You are an accountability planning assistant. Given an issue description, output a concise, actionable plan to hold a government agency or organization accountable.
Issue: ${trimmed}
Target: ${who || 'Unknown'}
Jurisdiction: ${jurisdictionCode || 'Unspecified'}
Format strictly as plain text with lines starting with these headings when applicable:
Summary: <one sentence>
Step 1: Intake and documentation
Step 2: Identify rules/laws/policies violated
Step 3: Evidence and timeline
Step 4: File internal complaint
Step 5: External oversight (regulator/ombud/public body)
Step 6: FOI/ATIP request (if relevant)
Step 7: Draft letter in plain language
Step 8: Escalation plan (appeal, media, legal)
Safety: retaliation and safety considerations
Note: keep steps short, specific, and accessible.`
    );
    if (remote && (remote.summary || remote.next?.length)) {
      const bullets = (remote.next || []).slice(0, 8).map((n, i) => `Step ${i + 1}: ${n}`);
      const summary = remote.summary ? `Summary: ${remote.summary}` : '';
      return [summary, ...bullets, 'Safety: Document retaliation; request accommodations if needed.'].filter(Boolean).join('\n');
    }
  } catch {}
  // Deterministic fallback
  const header = who ? `Goal: Accountability plan for ${who}` : 'Goal: Accountability plan';
  return (
    `${header}\n` +
    `Summary: Create a concise, step-by-step plan in plain language.\n` +
    `Step 1: Write a short description of what happened and when.\n` +
    `Step 2: Identify any rules, policies, or laws possibly violated.\n` +
    `Step 3: List your evidence (documents, emails, dates, witnesses). Build a timeline.\n` +
    `Step 4: File or escalate an internal complaint and request a written response.\n` +
    `Step 5: Identify external oversight (regulator, ombuds, tribunal). Note filing deadlines.\n` +
    `Step 6: Consider FOI/ATIP to request records supporting your case.\n` +
    `Step 7: Draft a short letter in plain language with a clear ask and deadline.\n` +
    `Step 8: Plan escalation (appeal, media statement, legal clinic) if not resolved.\n` +
    `Safety: Document retaliation and ask for accommodations where applicable.`
  );
}

export type AccountabilityPlan = string;
