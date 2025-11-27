import { resources } from '../data/resources';

// Re-implement core logic from useJurisdictionResources for pure test (no hook env needed)
function filterResources(code: string) {
  return resources.filter(r => {
    if (r.scope === 'canada') return true;
    if (r.scope === 'province' && r.province === code) return true;
    if (r.jurisdictions && r.jurisdictions.includes(code)) return true;
    return false;
  });
}

describe('jurisdiction resource filtering', () => {
  it('includes canada-wide resources for any jurisdiction code', () => {
    const onList = filterResources('ON');
    const bcList = filterResources('BC');
    expect(onList.some(r => r.scope === 'canada')).toBe(true);
    expect(bcList.some(r => r.scope === 'canada')).toBe(true);
  });
  
  it('filters correctly when province-specific resources exist', () => {
    // Currently all resources are canada-wide, so filtering should include them all
    const list = filterResources('ON');
    expect(list.every(r => r.scope === 'canada' || r.province === 'ON' || (r.jurisdictions && r.jurisdictions.includes('ON')))).toBe(true);
  });
  
  it('canada-wide resources are available in all jurisdictions', () => {
    const canadaWide = resources.filter(r => r.scope === 'canada');
    const onList = filterResources('ON');
    const bcList = filterResources('BC');
    
    // All canada-wide resources should appear in both jurisdiction filters
    expect(canadaWide.every(r => onList.find(o => o.id === r.id))).toBe(true);
    expect(canadaWide.every(r => bcList.find(b => b.id === r.id))).toBe(true);
  });
});
