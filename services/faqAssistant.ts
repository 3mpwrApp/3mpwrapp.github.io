import type { Faq } from '../types/faq';

export interface FaqSuggestion { id: string; q: string; a: string; score: number; }

// Basic term weighting and fuzzy includes scoring.
function scoreFaq(query: string, f: Faq): number {
  if(!query) return 0;
  const q = query.toLowerCase();
  const question = f.q.toLowerCase();
  const answer = f.a.toLowerCase();
  let score = 0;
  if(question === q) score += 8;
  if(question.startsWith(q)) score += 4;
  if(question.includes(q)) score += 3;
  if(answer.includes(q)) score += 1;
  // token overlap
  const tokens = q.split(/\s+/).filter(Boolean);
  const qTokens = new Set(question.split(/\W+/));
  let overlap = 0; tokens.forEach(t=> { if(qTokens.has(t)) overlap++; });
  score += overlap * 2;
  return score;
}

export function getFaqSuggestions(query: string, faqs: Faq[], limit = 5): FaqSuggestion[] {
  const scored = faqs.map(f => ({ id: f.id, q: f.q, a: f.a, score: scoreFaq(query,f) }))
    .filter(s => s.score > 0)
    .sort((a,b)=> b.score - a.score)
    .slice(0, limit);
  return scored;
}

export async function getLLMEnhancedSuggestions(query: string, faqs: Faq[], opts: { baseUrl?: string; apiKey?: string } = {}) {
  // Optional: send top local suggestions as context to remote LLM summarizer if base provided.
  if(!opts.baseUrl) return getFaqSuggestions(query, faqs, 5);
  try {
    const context = getFaqSuggestions(query, faqs, 8);
    const res = await fetch(`${opts.baseUrl.replace(/\/$/,'')}/faq_suggest`, {
      method:'POST', headers:{ 'Content-Type':'application/json', ...(opts.apiKey? { 'Authorization': `Bearer ${opts.apiKey}` }: {}) },
      body: JSON.stringify({ query, context })
    });
    if(!res.ok) throw new Error('bad status');
    const data = await res.json();
    if(Array.isArray(data?.suggestions)) return data.suggestions;
  } catch {}
  return getFaqSuggestions(query, faqs, 5);
}
