import { getSensitiveFieldMeta, getSensitiveFields } from '../services/analyticsEventSchemas';
import { ANALYTICS_EVENTS } from '../services/analyticsEvents';

describe('analytics sensitive metadata', () => {
  it('marks account delete failed message sensitive', () => {
    const map = getSensitiveFields();
    expect(map[ANALYTICS_EVENTS.ACCOUNT_DELETE_FAILED]).toContain('message');
  });

  it('includes classification metadata for sensitive message field', () => {
    const meta = getSensitiveFieldMeta();
    const rows = meta[ANALYTICS_EVENTS.ACCOUNT_DELETE_FAILED];
    expect(rows).toBeTruthy();
    const msg = rows.find(r => r.field === 'message');
    expect(msg?.classification).toBe('secret');
  });
});