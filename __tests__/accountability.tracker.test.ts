import { addEvent, getCaseByKey, listCases, upsertCase } from '../services/accountability.tracker';

jest.mock('@react-native-async-storage/async-storage', () => {
  const mem = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k: string) => (mem.has(k) ? mem.get(k)! : null)),
      setItem: jest.fn(async (k: string, v: string) => { mem.set(k, v); }),
      removeItem: jest.fn(async (k: string) => { mem.delete(k); }),
    },
  };
});

describe('accountability.tracker', () => {
  it('creates and updates a case with events', async () => {
    const c1 = await upsertCase({ target: 'Agency A', issue: 'Denied claim' }, { type: 'plan', text: 'Plan text' });
    expect(c1.id).toContain('Agency A');
    expect(c1.events.length).toBe(1);
    await addEvent(c1.id, 'response', 'They replied');
    const cases = await listCases();
    expect(cases[0].events[0].text).toContain('They replied');
    const byKey = await getCaseByKey('Agency A', 'Denied claim');
    expect(byKey?.id).toBe(c1.id);
  });
});
