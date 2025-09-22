import { aiCoachPrompt, aiInterpret, aiPolicySimplify, aiSimplify } from '../services/aiAdvocacy';

jest.mock('../services/llm', () => ({
  llmSimplify: async () => null,
  llmInterpret: async () => null,
}));

describe('aiAdvocacy fallbacks', () => {
  it('aiSimplify returns simplified text lines', async () => {
    const input = 'Notwithstanding the decision; pursuant to policy, you shall provide forms.';
    const out = await aiSimplify(input);
    expect(out).toContain('despite');
    expect(out).toContain('under');
    expect(out).not.toContain('Notwithstanding');
  });

  it('aiInterpret returns summary and next steps', async () => {
    const { summary, next } = await aiInterpret('Appeal letter referencing medical evidence.');
    expect(summary.length).toBeGreaterThan(5);
    expect(next.some(s => s.toLowerCase().includes('appeal'))).toBeTruthy();
  });

  it('aiPolicySimplify returns points', async () => {
    const { summary, keyPoints } = await aiPolicySimplify('topic','Shall provide accommodation; notwithstanding barriers; pursuant to policy.');
    expect(summary.length).toBeGreaterThan(5);
    expect(keyPoints.length).toBeGreaterThan(0);
  });

  it('aiCoachPrompt returns structured steps', async () => {
    const out = await aiCoachPrompt('Request modified duties');
    expect(out).toMatch(/Goal:/);
    expect(out).toMatch(/Step 1/);
  });
});
