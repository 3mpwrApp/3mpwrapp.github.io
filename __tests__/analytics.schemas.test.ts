import { ANALYTICS_EVENTS } from '../services/analyticsEvents';
import { eventsMissingSchemas, validateAndRedactEvent } from '../services/analyticsEventSchemas';

// Basic shape tests for schema coverage and validation behaviors.

describe('analytics event schemas', () => {
  test('every registered event has a schema entry (empty allowed)', () => {
    const missing = eventsMissingSchemas();
    expect(missing).toEqual([]);
  });

  test('expected redaction works for sensitive params', () => {
    const event = ANALYTICS_EVENTS.ACCOUNT_DELETE_FAILED;
    const { sanitized, warnings } = validateAndRedactEvent(event, { code: 'auth/error', message: 'Actual backend secret' });
    expect(warnings).toEqual([]);
    expect(sanitized).toEqual({ code: 'auth/error', message: '[redacted]' });
  });

  test('type mismatch and unknown params produce warnings', () => {
    const event = ANALYTICS_EVENTS.ENERGY_SPEND;
    const { warnings } = validateAndRedactEvent(event, { label: 123, cost: 'oops', extra: true } as any);
    expect(warnings.some(w => w.includes("label"))).toBe(true);
    expect(warnings.some(w => w.includes("cost"))).toBe(true);
    expect(warnings.some(w => w.includes("Unexpected param 'extra'"))).toBe(true);
  });

  test('required param missing', () => {
    const event = ANALYTICS_EVENTS.CAMPAIGN_SHARE;
    const { warnings } = validateAndRedactEvent(event, {} as any);
    expect(warnings.some(w => w.includes("Missing required param 'id'"))).toBe(true);
  });

  test('no warnings for valid event payloads', () => {
    const event = ANALYTICS_EVENTS.NOTIFICATION_DELIVERED;
    const sample = {
      templateId: 'welcome',
      templateVersion: 1,
      event: 'daily_check_in',
      channel: 'push',
      category: 'engagement',
      quiet: false,
      throttle: 0,
      cat_enabled: 1,
      push_enabled: true,
    };
    const { warnings } = validateAndRedactEvent(event, sample);
    expect(warnings).toHaveLength(0);
  });
});
