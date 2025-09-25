import { parseCoachOutput } from '../utils/coachParser';

describe('coach parser', () => {
  it('parses numbered list and extracts inline tips', () => {
    const raw = '1. First step (tip detail)\n2) Second step';
    const res = parseCoachOutput(raw);
    expect(res.steps).toHaveLength(2);
    expect(res.steps[0].order).toBe(1);
    expect(res.steps[0].text).toBe('First step');
    expect(res.steps[0].tips).toEqual(['tip detail']);
    expect(res.steps[1].order).toBe(2);
  });

  it('parses bulleted list', () => {
    const raw = '- Gather evidence (keep concise)\n- Send to employer';
    const res = parseCoachOutput(raw);
    expect(res.steps).toHaveLength(2);
    expect(res.steps[0].text).toBe('Gather evidence');
    expect(res.steps[0].tips).toEqual(['keep concise']);
  });

  it('falls back to a single paragraph step', () => {
    const raw = 'This is a single paragraph of advice without clear bullets.';
    const res = parseCoachOutput(raw);
    expect(res.steps).toHaveLength(1);
    expect(res.steps[0].text.length).toBeGreaterThan(10);
  });
});
