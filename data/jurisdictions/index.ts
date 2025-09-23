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

const MAP: Record<string, JurisdictionData> = {
  AB: AB as JurisdictionData,
  BC: BC as JurisdictionData,
  FED: FED as JurisdictionData,
  MB: MB as JurisdictionData,
  NB: NB as JurisdictionData,
  NL: NL as JurisdictionData,
  NS: NS as JurisdictionData,
  NT: NT as JurisdictionData,
  NU: NU as JurisdictionData,
  ON: ON as JurisdictionData,
  PE: PE as JurisdictionData,
  QC: QC as JurisdictionData,
  SK: SK as JurisdictionData,
  YT: YT as JurisdictionData,
};

function load(code: string): JurisdictionData | null {
  return MAP[code.toUpperCase()] || null;
}

export const ALL_JURISDICTION_CODES = ['AB','BC','FED','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

export function getJurisdiction(code: string): JurisdictionData | null {
  return load(code.toUpperCase());
}

export function listJurisdictions(): JurisdictionData[] {
  return ALL_JURISDICTION_CODES.map(c => load(c)).filter(Boolean) as JurisdictionData[];
}
