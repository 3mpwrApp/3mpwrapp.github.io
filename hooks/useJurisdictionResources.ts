import { useMemo } from 'react';

import { resources } from '../data/resources';
import { useJurisdiction } from '../store/jurisdiction';
import type { Resource } from '../types/models';

/**
 * Returns resources relevant to the selected jurisdiction code.
 * Logic:
 * - Always include Canada-wide (scope==='canada')
 * - Include province-scoped where resource.province === selected code
 * - Include any resource specifying jurisdictions[] containing selected code or 'FED' when selected is federal
 */
export function useJurisdictionResources() {
  const { code } = useJurisdiction();
  return useMemo<Resource[]>(() => {
    return resources.filter(r => {
      if (r.scope === 'canada') return true;
      if (r.scope === 'province' && r.province === code) return true;
      if (r.jurisdictions && r.jurisdictions.includes(code)) return true;
      return false;
    });
  }, [code]);
}
