import { describe, expect, it } from '@jest/globals';

import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import fr from '../locales/fr/common.json';


// Minimal parity test: ensure certain critical new keys exist in all locales.
// We focus on recent additions (deadlines CSV, evidence locker queue, policy sections).

const REQUIRED_KEYS = [
  // deadlines CSV
  'templates.deadlines.csvHeaderDate',
  'templates.deadlines.csvHeaderTitle',
  'templates.deadlines.csvHeaderNotes',
  'templates.deadlines.csvHeaderDone',
  'templates.deadlines.csvSaved',
  // evidence locker queue
  'templates.evidenceLocker.processingPct',
  'templates.evidenceLocker.queueTitle',
  // policy simple sections
  'advocacy.policy.sectionRights',
  'advocacy.policy.linkDuty',
  // new advocacy tool sentinel keys
  'advocacy.collective.title',
  'advocacy.collective.submit',
  'advocacy.finder.title',
  'advocacy.finder.searchPlaceholder',
  'advocacy.support.title',
  'advocacy.support.website',
  'advocacy.ask.title',
  'advocacy.ask.submit',
  'advocacy.world.title',
  'advocacy.world.hint',
];

// Helper to safely read nested key path
function has(obj: any, path: string){
  return path.split('.').reduce((acc,k)=> (acc && k in acc) ? acc[k] : undefined, obj) !== undefined;
}

describe('i18n locale parity (selected keys)', () => {
  const locales = { en, fr, es } as const;
  for (const key of REQUIRED_KEYS) {
    it(`all locales contain key: ${key}`, () => {
      for (const [_code, data] of Object.entries(locales)) {
        expect(has(data, key)).toBe(true);
      }
    });
  }
});
