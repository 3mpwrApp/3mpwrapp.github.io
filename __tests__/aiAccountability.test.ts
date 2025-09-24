import { aiAccountabilityPlan, buildAllyBrief, detectViolations, draftAccountabilityLetter } from '../services/aiAccountability';

jest.mock('../services/llm', () => ({
  llmInterpret: async () => null,
}));

describe('aiAccountability helpers', () => {
  it('aiAccountabilityPlan returns structured fallback', async () => {
    const out = await aiAccountabilityPlan('Benefits denied after injury', 'Workers Board', 'CA-ON');
    expect(out).toMatch(/Goal:/);
    expect(out).toMatch(/Step 1/);
    expect(out.split('\n').length).toBeGreaterThan(3);
  });

  it('detectViolations returns heuristic items', async () => {
    const items = await detectViolations('Accommodation was denied and deadline was missed.');
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].type).toBeTruthy();
    expect(items[0].confidence).toBeGreaterThan(0);
  });

  it('draftAccountabilityLetter returns a plain letter', async () => {
    const letter = await draftAccountabilityLetter({ issue: 'Harassment at work', target: 'HR Department' });
    expect(letter).toMatch(/Re:/);
    expect(letter).toMatch(/Sincerely|Atte/);
  });

  it('buildAllyBrief returns bullet list', async () => {
    const brief = await buildAllyBrief({ issue: 'Denied benefits', target: 'Agency' });
    expect(brief).toMatch(/- /);
  });
});
