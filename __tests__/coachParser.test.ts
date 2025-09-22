import { parseCoachOutput } from '../utils/coachParser';

describe('coach parser', () => {
  it('parses numbered list', () => {
    const raw = '1. First step\n2. Second step (tip detail)\n3) Third step';
    const res = parseCoachOutput(raw);
    expect(res.steps).toHaveLength(3);
    expect(res.steps[1].tips?.[0]).toBe('tip detail');
  });

  it('parses bulleted list', () => {
    const raw = '- Gather evidence\n- Draft letter (keep concise)\n- Send to employer';
    const res = parseCoachOutput(raw);
    expect(res.steps).toHaveLength(3);
    expect(res.steps[1].tips?.[0]).toContain('keep concise');
  });

  it('falls back to paragraph', () => {
    const raw = 'This is a single paragraph of advice without clear bullets.';
    const res = parseCoachOutput(raw);
    expect(res.steps).toHaveLength(1);
    expect(res.steps[0].text.length).toBeGreaterThan(10);
  });

  it('extracts multiple tips', () => {
    const raw = '1. Step with (tip one) and (tip two) extras';
    const res = parseCoachOutput(raw);
    expect(res.steps[0].tips).toEqual(['tip one','tip two']);
  });
});
