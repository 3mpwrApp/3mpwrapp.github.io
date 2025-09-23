export interface PolicyExtraction {
  obligations: string[];
  actions: string[];
}

export function extractPolicyHeuristics(raw: string): PolicyExtraction {
  let lines = raw.split(/\n+/).map(l=>l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    // Fallback: split into sentences if text provided as single paragraph
    lines = raw.split(/(?<=[.!?])\s+/).map(l=>l.trim()).filter(Boolean);
  }
  lines = lines.slice(0,300);
  const obligations: string[] = [];
  const actions: string[] = [];
  lines.forEach(l => {
    const lower = l.toLowerCase();
    if(/\b(must|shall|required|obliged)\b/.test(lower)) obligations.push(l);
    else if(/\b(should|recommend|consider|encouraged)\b/.test(lower)) actions.push(l);
  });
  return { obligations: obligations.slice(0,20), actions: actions.slice(0,20) };
}
