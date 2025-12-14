import { getJurisdiction, listJurisdictions } from '../data/jurisdictions';

describe('jurisdictions schema', () => {
  const requiredString = ['code','name'];
  
  // Canadian jurisdiction fields (legacy)
  const canadianFields = ['benefitPrograms','humanRights','workplaceInjury','antiDiscrimination','accommodations'];
  
  // US jurisdiction fields (6-component structure)
  const usFields = ['workersCompensation','disabilityPrograms','civilRightsFramework','legislativeAuthority','enforcementOversight','proceduralSafeguards'];
  
  it('each jurisdiction passes minimal schema', () => {
    const all = listJurisdictions();
    expect(all.length).toBeGreaterThan(0);
    for (const j of all) {
      for (const key of requiredString) {
        expect(typeof (j as any)[key]).toBe('string');
        expect((j as any)[key].length).toBeGreaterThan(0);
      }
      // Check for either Canadian OR US jurisdiction structure
      const hasCanadianSection = canadianFields.some(k => Array.isArray((j as any)[k]) || typeof (j as any)[k] === 'object');
      const hasUSSection = usFields.some(k => Array.isArray((j as any)[k]) || typeof (j as any)[k] === 'object');
      expect(hasCanadianSection || hasUSSection).toBe(true);
      expect(getJurisdiction(j.code)).toBeTruthy();
    }
  });
});
