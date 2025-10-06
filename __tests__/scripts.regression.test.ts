import { spawnSync } from 'child_process';
import path from 'path';

// Lightweight CLI shape tests to avoid regressions in CI utilities.

function runNode(script: string, args: string[] = []) {
  const full = path.join(process.cwd(), script);
  const res = spawnSync(process.execPath, [full, ...args], { encoding: 'utf8' });
  return { code: res.status ?? 0, out: (res.stdout||'') + (res.stderr||'') };
}

describe('scripts regression', () => {
  it('analytics-report runs and writes file', () => {
    const { code, out } = runNode('scripts/analytics-report.mjs');
    expect(code).toBe(0);
    expect(out).toMatch(/analytics-report/i);
  });

  it('i18n validators run', () => {
    const tools = [
      'scripts/i18n-validate-json.js',
      'scripts/i18n-diff.js',
      'scripts/i18n-plural-check.js',
      'scripts/i18n-threshold.js',
      'scripts/i18n-assert-clean.js',
      'scripts/i18n-report-missing.js',
    ];
    for (const s of tools) {
      const { code, out } = runNode(s);
      expect(code).toBe(0);
      expect(out).not.toMatch(/Error/i);
    }
  });
});
