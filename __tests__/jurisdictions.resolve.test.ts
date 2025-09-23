import { ALL_JURISDICTION_CODES, getJurisdiction } from '../data/jurisdictions';

describe('jurisdictions resolve', () => {
  it('each code resolves to non-null data', () => {
    for (const code of ALL_JURISDICTION_CODES) {
      const data = getJurisdiction(code);
      expect(data).not.toBeNull();
      expect(data?.code).toBe(code);
    }
  });
});
