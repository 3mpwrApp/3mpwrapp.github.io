import type { JurisdictionData } from '../../types/jurisdiction';

import AB from './AB.json';
import BC from './BC.json';
import FED from './FED.json';
import MB from './MB.json';
import NB from './NB.json';
import NL from './NL.json';
import NS from './NS.json';
import NT from './NT.json';
import NU from './NU.json';
import ON from './ON.json';
import PE from './PE.json';
import QC from './QC.json';
import SK from './SK.json';
import YT from './YT.json';
// US Jurisdictions (12 states + federal)
import US_CA from './US-CA.json';
import US_FED from './US-FED.json';
import US_FL from './US-FL.json';
import US_GA from './US-GA.json';
import US_IL from './US-IL.json';
import US_MI from './US-MI.json';
import US_MS from './US-MS.json';
import US_NY from './US-NY.json';
import US_OH from './US-OH.json';
import US_PA from './US-PA.json';
import US_TN from './US-TN.json';
import US_TX from './US-TX.json';
import US_WA from './US-WA.json';

const MAP: Record<string, JurisdictionData> = {
  // Canadian jurisdictions
  AB: AB as unknown as JurisdictionData,
  BC: BC as unknown as JurisdictionData,
  FED: FED as unknown as JurisdictionData,
  MB: MB as unknown as JurisdictionData,
  NB: NB as unknown as JurisdictionData,
  NL: NL as unknown as JurisdictionData,
  NS: NS as unknown as JurisdictionData,
  NT: NT as unknown as JurisdictionData,
  NU: NU as unknown as JurisdictionData,
  ON: ON as unknown as JurisdictionData,
  PE: PE as unknown as JurisdictionData,
  QC: QC as unknown as JurisdictionData,
  SK: SK as unknown as JurisdictionData,
  YT: YT as unknown as JurisdictionData,
  // US jurisdictions (12 states + federal)
  'US-FED': US_FED as unknown as JurisdictionData,
  'US-CA': US_CA as unknown as JurisdictionData,
  'US-NY': US_NY as unknown as JurisdictionData,
  'US-TX': US_TX as unknown as JurisdictionData,
  'US-FL': US_FL as unknown as JurisdictionData,
  'US-IL': US_IL as unknown as JurisdictionData,
  'US-MI': US_MI as unknown as JurisdictionData,
  'US-WA': US_WA as unknown as JurisdictionData,
  'US-OH': US_OH as unknown as JurisdictionData,
  'US-PA': US_PA as unknown as JurisdictionData,
  'US-TN': US_TN as unknown as JurisdictionData,
  'US-GA': US_GA as unknown as JurisdictionData,
  'US-MS': US_MS as unknown as JurisdictionData,
};

function load(code: string): JurisdictionData | null {
  return MAP[code.toUpperCase()] || MAP[code] || null;
}

// Canadian jurisdiction codes
export const CA_JURISDICTION_CODES = ['AB','BC','FED','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

// US jurisdiction codes (12 states + federal)
export const US_JURISDICTION_CODES = ['US-FED','US-CA','US-NY','US-TX','US-FL','US-IL','US-MI','US-WA','US-OH','US-PA','US-TN','US-GA','US-MS'];

// All jurisdiction codes
export const ALL_JURISDICTION_CODES = [...CA_JURISDICTION_CODES, ...US_JURISDICTION_CODES];

export function getJurisdiction(code: string): JurisdictionData | null {
  return load(code.toUpperCase()) || load(code);
}

export function listJurisdictions(): JurisdictionData[] {
  return ALL_JURISDICTION_CODES.map(c => load(c)).filter(Boolean) as JurisdictionData[];
}

export function listJurisdictionsByCountry(country: 'CA' | 'US'): JurisdictionData[] {
  const codes = country === 'CA' ? CA_JURISDICTION_CODES : US_JURISDICTION_CODES;
  return codes.map(c => load(c)).filter(Boolean) as JurisdictionData[];
}
