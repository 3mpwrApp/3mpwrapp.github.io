export interface CoachStep { order: number; text: string; tips?: string[]; }
export interface CoachParseResult { steps: CoachStep[]; raw: string; }

/**
 * Parses AI coach text into structured steps.
 * Supported formats:
 * 1. Numbered lists: "1. Do thing" / "1) Do thing"
 * 2. Bulleted lists: lines starting with - or * or •
 * 3. Mixed paragraphs -> single step fallback
 * Tips: Inline parenthetical hints extracted as tips when short (<80 chars).
 */
export function parseCoachOutput(raw: string): CoachParseResult {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const steps: CoachStep[] = [];
  const numbered = lines.filter(l => /^\d+[\.)]/.test(l));
  const bulleted = lines.filter(l => /^[\-*•]\s+/.test(l));
  let mode: 'numbered' | 'bulleted' | 'paragraph' = 'paragraph';
  if (numbered.length >= Math.max(2, lines.length * 0.4)) mode = 'numbered';
  else if (bulleted.length >= Math.max(2, lines.length * 0.4)) mode = 'bulleted';

  const source = mode === 'numbered' ? lines.filter(l => /^\d+[\.)]/.test(l))
    : mode === 'bulleted' ? lines.filter(l => /^[\-*•]\s+/.test(l))
    : [lines.join(' ')];

  source.forEach((rawLine, idx) => {
    let line = rawLine.replace(/^\d+[\.)]\s*/, '').replace(/^[\-*•]\s+/, '').trim();
    const tips: string[] = [];
    // Extract short parenthetical hints
  line = line.replace(/\(([^)]+)\)/g, (_m, g1) => {
      const clean = String(g1).trim();
      if (clean.length > 0 && clean.length < 80) tips.push(clean);
      return '';
    }).replace(/\s{2,}/g,' ').trim();
    steps.push({ order: idx + 1, text: line, tips: tips.length ? tips : undefined });
  });

  return { steps, raw };
}
