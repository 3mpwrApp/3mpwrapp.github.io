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

export type DetectedViolation = {
  type: string;
  ruleHint?: string;
  confidence: number; // 0-1
};

export async function detectViolations(text: string, jurisdictionCode?: string): Promise<DetectedViolation[]> {
  const trimmed = (text || '').trim();
  if (!trimmed) return [];
  try {
    const remote = await llmInterpret(
      `You extract likely rights/policy violations from a short description. Output JSON: { items:[{type, ruleHint, confidence}] }.
Text: ${trimmed}
Jurisdiction: ${jurisdictionCode || 'Unspecified'}`
    );
    // Our llmInterpret returns {summary,next[]}. If backend supports custom JSON, it may embed as lines.
    if (remote) {
      const lines = [remote.summary, ...(remote.next || [])].filter(Boolean);
      const parsed = lines
        .map((ln) => {
          const m = String(ln).match(/^(?:-\s*)?(.*?)(?:\s*\(([^)]+)\))?$/);
          if (!m) return null;
          const type = m[1].trim();
          const hint = m[2]?.trim();
          if (!type) return null;
          return { type, ruleHint: hint, confidence: 0.6 } as DetectedViolation;
        })
        .filter(Boolean) as DetectedViolation[];
      if (parsed.length) return parsed.slice(0, 6);
    }
  } catch {}
  // fallback heuristics
  const items: DetectedViolation[] = [];
  const lc = trimmed.toLowerCase();
  if (/accommodat(e|ion)/i.test(trimmed) || /adaptac/i.test(lc)) items.push({ type: 'Accommodation possibly denied', ruleHint: 'Duty to accommodate (human rights)', confidence: 0.7 });
  if (/deadline|late|tim(e|o) limit|plazo/i.test(lc)) items.push({ type: 'Procedural deadline at risk', ruleHint: 'Appeal/complaint timelines', confidence: 0.65 });
  if (/harass|bully|hostil/i.test(lc)) items.push({ type: 'Harassment/discrimination', ruleHint: 'Workplace safety/human rights', confidence: 0.6 });
  if (/benefit|claim|denied|refus/i.test(lc)) items.push({ type: 'Benefit denial', ruleHint: 'Decision letter + reconsideration', confidence: 0.6 });
  return items.slice(0, 6);
}

export async function draftAccountabilityLetter(params: {
  issue: string;
  target?: string;
  recipient?: string;
  jurisdictionCode?: string;
}): Promise<string> {
  const issue = (params.issue || '').trim();
  if (!issue) return '';
  const target = (params.target || '').trim();
  const recipient = (params.recipient || '').trim() || 'To whom it may concern';
  try {
    const remote = await llmInterpret(
      `Draft a firm, plain-language accountability letter. Use short paragraphs and a clear ask + deadline.
Fields:
- Recipient: ${recipient}
- Target: ${target || 'Unknown'}
- Jurisdiction: ${params.jurisdictionCode || 'Unspecified'}
- Issue: ${issue}
Return plain text.`
    );
    if (typeof remote === 'string') return remote;
    if (remote?.summary || remote?.next?.length) {
      return [remote.summary, ...(remote.next || [])].filter(Boolean).join('\n');
    }
  } catch {}
  const today = new Date().toISOString().slice(0, 10);
  return [
    `${recipient},`,
    '',
    `Re: Accountability concerns regarding ${target || 'your office/organization'}`,
    '',
    `I am writing regarding the following issue: ${issue}. This matter affects my rights and access to fair process.`,
    '',
    'Key points:',
    '- What happened and when (attach timeline).',
    '- Relevant policies/laws (cite if known).',
    '- Impact and any barriers faced (accessibility).',
    '',
    'I am requesting:',
    '- A written response to the issues raised;',
    '- A concrete remedy or next step;',
    '- A response by 14 days from today.',
    '',
    'Please confirm receipt. I am available to discuss reasonable solutions. Thank you.',
    '',
    `Sincerely,
${today}`,
  ].join('\n');
}

export async function buildAllyBrief(params: {
  issue: string;
  target?: string;
  plan?: string;
}): Promise<string> {
  const issue = (params.issue || '').trim();
  const target = (params.target || '').trim();
  try {
    const remote = await llmInterpret(
      `Create a concise ally briefing (bullets). Include: context, what happened, why it matters, how to help (concrete asks), safety.
Issue: ${issue}
Target: ${target}
Plan: ${params.plan || ''}`
    );
    if (typeof remote === 'string') return remote;
    if (remote?.summary || remote?.next?.length) {
      const lines = [remote.summary, ...(remote.next || [])].filter(Boolean);
      return lines.map((l) => (String(l).startsWith('-') ? String(l) : `- ${l}`)).join('\n');
    }
  } catch {}
  return [
    'Context: short summary of what happened and to whom.',
    `Target: ${target || 'agency/organization'}.`,
    'Why it matters: rights, access, fairness, safety.',
    'How you can help:',
    '- Share expertise or sample letters',
    '- Co-sign letter or attend meeting',
    '- Amplify (if safe) and document responses',
    'Safety: avoid retaliation; consent before sharing.',
  ].map((l) => (l.startsWith('-') ? l : `- ${l}`)).join('\n');
}
