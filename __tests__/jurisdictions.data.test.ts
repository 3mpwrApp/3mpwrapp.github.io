import { getJurisdiction, listJurisdictions } from '../data/jurisdictions';

// Basic structural validation for jurisdiction data integrity.

describe('jurisdictions data integrity', () => {
  const all = listJurisdictions();

  it('includes expected codes (FED + ON)', () => {
    const codes = all.map(j => j.code);
    expect(codes).toContain('FED');
    expect(codes).toContain('ON');
  });

  it('federal (FED) and Ontario (ON) have core fields populated', () => {
    const fed = getJurisdiction('FED');
    const on = getJurisdiction('ON');
    expect(fed?.humanRights?.name).toBeTruthy();
    expect(fed?.benefitPrograms && fed.benefitPrograms.length).toBeGreaterThan(0);
    expect(on?.workplaceInjury?.name).toBeTruthy();
    expect(on?.benefitPrograms && on.benefitPrograms.length).toBeGreaterThan(0);
  });

  it('no jurisdiction objects are missing required basics', () => {
    for (const j of all) {
      expect(j.code).toMatch(/^[A-Z]{2,3}$/);
      expect(j.name.length).toBeGreaterThan(1);
    }
  });

  it('optional arrays are truly arrays when present', () => {
    for (const j of all) {
      if (j.accommodationGuidance) expect(Array.isArray(j.accommodationGuidance)).toBe(true);
      if (j.evidenceFocus) expect(Array.isArray(j.evidenceFocus)).toBe(true);
      if (j.limitationNotes) expect(Array.isArray(j.limitationNotes)).toBe(true);
      if (j.benefitPrograms) expect(Array.isArray(j.benefitPrograms)).toBe(true);
    }
  });
});
