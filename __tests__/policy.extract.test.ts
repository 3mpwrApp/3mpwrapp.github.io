import { extractPolicyHeuristics } from '../utils/policyExtract';

describe('policy heuristics extraction', () => {
  it('extracts obligations and actions', () => {
    const sample = `Employees must submit the form within 10 days. Employers should provide accessible formats. The party shall retain records. It is recommended to consider early disclosure.`;
    const { obligations, actions } = extractPolicyHeuristics(sample);
    expect(obligations.length).toBeGreaterThan(0);
    expect(actions.length).toBeGreaterThan(0);
    expect(obligations.some(l=>/must/.test(l.toLowerCase()) || /shall/.test(l.toLowerCase()))).toBe(true);
    expect(actions.some(l=>/should/.test(l.toLowerCase()) || /recommended|consider/.test(l.toLowerCase()))).toBe(true);
  });

  it('limits result sizes', () => {
    const lines = Array.from({ length: 100 }, (_,i)=> `You must comply with rule ${i}.` ).join('\n');
    const { obligations } = extractPolicyHeuristics(lines);
    expect(obligations.length).toBeLessThanOrEqual(20);
  });
});
