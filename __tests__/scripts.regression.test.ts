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
    // Exit code 2 is acceptable (missing events detected, report generated)
    expect([0, 2]).toContain(code);
    expect(out).toMatch(/analytics-report/i);
  });

  it('i18n validators run', () => {
    // Strict validators that must pass with code 0
    const strict = [
      'scripts/i18n-validate-json.js',
      'scripts/i18n-plural-check.js',
      'scripts/i18n-assert-clean.js',
    ];
    for (const s of strict) {
      const { code, out } = runNode(s);
      expect(code).toBe(0);
      expect(out).not.toMatch(/Error/i);
    }
    
    // Non-strict validators that report status but may have non-zero exit codes
    const reports = [
      'scripts/i18n-diff.js',
      'scripts/i18n-threshold.js',
      'scripts/i18n-report-missing.js',
    ];
    for (const s of reports) {
      const { out } = runNode(s);
      // These can exit with non-zero to report status, but should not have hard errors
      expect(out).not.toMatch(/^Error|^TypeError/i);
    }
  });
});
