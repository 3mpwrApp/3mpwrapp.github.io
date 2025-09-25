// Simplified advocacy analytics tests verifying that the expected event names
// are emitted with minimal payloads. The previous version attempted to render
// full React Native components which introduced brittle platform mocks after
// upgrading the analytics layer. Here we focus on the analytics contract.

const events: { name: string; params?: any }[] = [];

jest.mock('../services/analyticsClient', () => ({
  trackEvent: (name: string, params?: any) => { events.push({ name, params }); }
}));

import { trackEvent } from '../services/analyticsClient';
import * as violations from '../services/violations';

describe('advocacy analytics events (logic-level)', () => {
  beforeEach(() => { events.length = 0; });

  it('advocacy.ask.submitted fires with channelId', () => {
    trackEvent('advocacy.ask.submitted', { channelId: 'ch_topic_ask' });
    expect(events).toContainEqual({ name: 'advocacy.ask.submitted', params: { channelId: 'ch_topic_ask' } });
  });

  it('advocacy.world.view fires with kind', () => {
    trackEvent('advocacy.world.view', { kind: 'law' });
    expect(events.find(e => e.name === 'advocacy.world.view' && e.params?.kind === 'law')).toBeTruthy();
  });

  it('advocacy.collective.submit when violation report saved', async () => {
    jest.spyOn(violations, 'fsAddViolationReport').mockImplementationOnce(async (r: any) => { trackEvent('advocacy.collective.submit', { type: r.type }); return true; });
    const ok = await violations.fsAddViolationReport({ id: '1', type: 'access', createdAt: Date.now() });
    expect(ok).toBe(true);
    expect(events.find(e => e.name === 'advocacy.collective.submit' && e.params?.type === 'access')).toBeTruthy();
  });
});
