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
  it('includes canada-wide plus ON specific when code=ON', () => {
    const list = filterResources('ON');
    expect(list.some(r => r.scope === 'canada')).toBe(true);
    expect(list.every(r => r.scope === 'canada' || r.province === 'ON' || (r.jurisdictions && r.jurisdictions.includes('ON')))).toBe(true);
  });
  it('switching to BC includes BC provincial entries', () => {
    const list = filterResources('BC');
    expect(list.some(r => r.province === 'BC')).toBe(true);
  });
  it('non-matching province does not include unrelated province-only resources', () => {
    const onOnly = resources.filter(r => r.province === 'ON');
    const bcList = filterResources('BC');
    // At least one ON only resource should be absent when filtering for BC
    expect(onOnly.every(r => bcList.find(b => b.id === r.id))).toBe(false);
  });
});
