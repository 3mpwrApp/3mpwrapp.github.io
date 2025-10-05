const { rmSync } = require('fs');
const { join } = require('path');
const os = require('os');

try {
  const dir = join(os.tmpdir(), 'jest');
  rmSync(dir, { recursive: true, force: true });
  // Also attempt default cache location under node_modules/.cache/jest
  rmSync(join(process.cwd(), 'node_modules', '.cache', 'jest'), { recursive: true, force: true });
  // No output on success
} catch (e) {
  // Ignore errors; cache being absent or locked should not fail tests
}
