import en from '../locales/en/common.json';

describe('i18n deadlines nav keys', () => {
  test('top-level deadlines.* keys exist', () => {
    expect(en.deadlines).toBeDefined();
    expect(typeof en.deadlines).toBe('object');
    expect('prevMonth' in (en as any).deadlines).toBe(true);
    expect('nextMonth' in (en as any).deadlines).toBe(true);
    expect('reloadShort' in (en as any).deadlines).toBe(true);
  });
});
