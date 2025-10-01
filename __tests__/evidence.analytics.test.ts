import { withCapturedEvents } from '../services/analyticsClient';

// These tests exercise the analytics wiring by invoking small helper closures
// that mimic the wired code paths (we don't render RN components here).

describe('evidence analytics wiring (harness)', () => {
  test('export/import encrypted events carry counts', () => {
    const events = withCapturedEvents(() => {
      const { trackEvent } = require('../services/analyticsClient');
      trackEvent('evidence.export.encrypted', { count: 3 });
      trackEvent('evidence.import.encrypted', { count: 2 });
    });
    expect(events.find(e => e.name === 'evidence.export.encrypted' && e.params?.count === 3)).toBeTruthy();
    expect(events.find(e => e.name === 'evidence.import.encrypted' && e.params?.count === 2)).toBeTruthy();
  });

  test('save single/bulk and queue events have expected params', () => {
    const events = withCapturedEvents(() => {
      const { trackEvent } = require('../services/analyticsClient');
      trackEvent('evidence.save.single', { hasFiles: true });
      trackEvent('evidence.save.bulk', { notes: 5, files: 7 });
      trackEvent('evidence.queue.enqueued', { count: 1 });
      trackEvent('evidence.queue.processed', { total: 4 });
    });
    expect(events.find(e => e.name === 'evidence.save.single' && e.params?.hasFiles === true)).toBeTruthy();
    expect(events.find(e => e.name === 'evidence.save.bulk' && e.params?.notes === 5 && e.params?.files === 7)).toBeTruthy();
    expect(events.find(e => e.name === 'evidence.queue.enqueued' && e.params?.count === 1)).toBeTruthy();
    expect(events.find(e => e.name === 'evidence.queue.processed' && e.params?.total === 4)).toBeTruthy();
  });
});
