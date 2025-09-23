import type { JurisdictionData } from '../../types/jurisdiction';

// Static imports to satisfy Metro (dynamic template requires can fail in production bundles)
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

const MAP: Record<string, JurisdictionData> = {
  FED: FED as JurisdictionData,
  ON: ON as JurisdictionData,
  BC: BC as JurisdictionData,
  AB: AB as JurisdictionData,
  SK: SK as JurisdictionData,
  MB: MB as JurisdictionData,
  QC: QC as JurisdictionData,
  NB: NB as JurisdictionData,
  NS: NS as JurisdictionData,
  PE: PE as JurisdictionData,
  NL: NL as JurisdictionData,
  YT: YT as JurisdictionData,
  NT: NT as JurisdictionData,
  NU: NU as JurisdictionData,
};

function load(code: string): JurisdictionData | null {
  return MAP[code.toUpperCase()] || null;
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
