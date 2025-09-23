import { getJurisdiction, listJurisdictions } from '../data/jurisdictions';

describe('jurisdictions schema', () => {
  const requiredString = ['code','name'];
  it('each jurisdiction passes minimal schema', () => {
    const all = listJurisdictions();
    expect(all.length).toBeGreaterThan(0);
    for (const j of all) {
      for (const key of requiredString) {
        expect(typeof (j as any)[key]).toBe('string');
        expect((j as any)[key].length).toBeGreaterThan(0);
      }
      const hasSection = ['benefitPrograms','humanRights','workplaceInjury','antiDiscrimination','accommodations']
        .some(k => Array.isArray((j as any)[k]) || typeof (j as any)[k] === 'object');
      expect(hasSection).toBe(true);
      expect(getJurisdiction(j.code)).toBeTruthy();
    }
  });
});
