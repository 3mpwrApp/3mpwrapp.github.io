describe('BYOC strict mode', () => {
  const OLD_ENV = process.env;
  beforeEach(() => { jest.resetModules(); process.env = { ...OLD_ENV, EXPO_PUBLIC_DATA_POLICY: 'strict_byoc', JEST_WORKER_ID: '1' }; });
  afterEach(() => { process.env = OLD_ENV; });

  it('disables firebase and firestore writes', async () => {
    const cfg = require('../firebase/config');
    expect(cfg.db).toBeNull();
    const fs = require('../services/firestore');
    const ok = await fs.fsAddEvent({ id: 'x', title: 't', description: '', date: '2025-10-10' });
    expect(ok).toBe(false);
  });
});
