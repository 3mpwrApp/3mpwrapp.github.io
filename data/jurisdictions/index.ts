import type { JurisdictionData } from '../../types/jurisdiction';

// Lazy require JSON to keep bundle size manageable if tree-shaken.
function load(code: string): JurisdictionData | null {
  try {
    // Dynamically import JSON – Metro may need explicit requires if dynamic fails; adjust if bundler warns.
     
    const data: JurisdictionData = require(`./${code}.json`);
    return data;
  } catch {
    return null;
  }
}

export const ALL_JURISDICTION_CODES = [
  'FED','ON','BC','AB','SK','MB','QC','NB','NS','PE','NL','YT','NT','NU'
];

export function getJurisdiction(code: string): JurisdictionData | null {
  return load(code.toUpperCase());
}

export function listJurisdictions(): JurisdictionData[] {
  return ALL_JURISDICTION_CODES.map(c => load(c)).filter(Boolean) as JurisdictionData[];
}
