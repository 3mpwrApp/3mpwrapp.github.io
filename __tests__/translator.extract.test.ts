import { DEFAULT_TRANSLATOR_CONFIG, extractTranslatorSections } from '../utils/translatorExtract';

describe('translatorExtract', () => {
  it('extracts key sections', () => {
    const text = `You must submit the appeal form by 12/10/2025. The tribunal hearing is scheduled within 30 days. Provide medical evidence. Accessibility accommodations available.`;
    const res = extractTranslatorSections(text);
    expect(res.summary.length).toBeGreaterThan(0);
    expect(res.keyTerms.length).toBeGreaterThan(0);
    expect(res.deadlines.length).toBeGreaterThan(0);
    expect(res.actions.length).toBeGreaterThan(0);
  });

  it('deduplicates identical lines', () => {
    const line = 'You must submit the form';
    const text = Array(5).fill(line).join('\n');
    const res = extractTranslatorSections(text);
    expect(res.actions.length).toBe(1); // only one action captured
  });

  it('respects config limits', () => {
    const cfg = { ...DEFAULT_TRANSLATOR_CONFIG, maxActions: 2 };
    const text = `You must send A. You must send B. You must send C.`;
    const res = extractTranslatorSections(text, cfg);
    expect(res.actions.length).toBeLessThanOrEqual(2);
  });
});
