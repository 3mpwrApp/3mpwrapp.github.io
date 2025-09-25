import * as fs from 'fs';
import * as path from 'path';

import { withCapturedEvents } from '../services/analyticsClient';
import { ANALYTICS_EVENTS } from '../services/analyticsEvents';

// Auto-discovers analytics event names by scanning for trackEvent("<literal>") or .trackEvent("<literal>") patterns.

function discoverEventNames(root: string): string[] {
  const exts = new Set(['.ts', '.tsx']);
  const names = new Set<string>();
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) { walk(full); continue; }
      const ext = path.extname(entry);
      if (!exts.has(ext)) continue;
      const text = fs.readFileSync(full, 'utf8');
      // Skip test files themselves to avoid circular additions.
      if (/__tests__/.test(full)) continue;
      const regex = /(?:\.|\b)trackEvent\(\s*['"]([a-zA-Z0-9_\.:-]+)['"]/g;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(text))) {
        names.add(m[1]);
      }
    }
  }
  walk(root);
  return Array.from(names).sort();
}

describe('analytics events registry', () => {
  it('registry covers all discovered event names', () => {
    const registry = new Set<string>(Object.values(ANALYTICS_EVENTS));
    const discovered = discoverEventNames(path.join(__dirname, '..'));
    const missing = discovered.filter(n => !registry.has(n));
    if (missing.length) {
      throw new Error(`Unregistered analytics events found: ${missing.join(', ')}\nAdd them to services/analyticsEvents.ts`);
    }
  });

  it('no obvious typos: registry entries are used at least once (warning only)', () => {
    const registry = new Set<string>(Object.values(ANALYTICS_EVENTS));
    const discovered = new Set(discoverEventNames(path.join(__dirname, '..')));
    const unused = Array.from(registry).filter(n => !discovered.has(n));
    // We allow unused (future planned) but assert they are strings.
    for (const n of registry) {
      expect(typeof n).toBe('string');
      expect(n.length).toBeGreaterThan(0);
    }
    if (unused.length) {
       
      console.warn('[analytics] Unused registry events (ok if intentional):', unused);
    }
  });

  it('capture harness still works with registered events', () => {
    const events = withCapturedEvents(() => {
      const client = require('../services/analyticsClient');
      client.trackEvent('tracker_add_entry', { kind: 'symptom' });
      client.trackEvent('campaign_share', { id: 'abc' });
    });
    expect(events.map(e => e.name)).toEqual(['tracker_add_entry', 'campaign_share']);
  });
});
