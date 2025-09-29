import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import fr from '../locales/fr/common.json';

describe('deadlines i18n parity between templates.* and top-level', () => {
  const keys = ['prevMonth', 'nextMonth', 'reloadShort'] as const;

  function get(obj: any, path: string[]) {
    return path.reduce((acc, k) => (acc ? acc[k] : undefined), obj);
  }

  it('en has consistent wording (sanity)', () => {
    keys.forEach((k) => {
      expect(get(en, ['templates', 'deadlines', k])).toBeTruthy();
      expect(get(en, ['deadlines', k])).toBeTruthy();
    });
  });

  it('fr matches top-level and templates.deadlines for core nav labels', () => {
    keys.forEach((k) => {
      const top = get(fr, ['deadlines', k]);
      const tmpl = get(fr, ['templates', 'deadlines', k]);
      // If both exist, they should match exactly
      if (top && tmpl) expect(tmpl).toBe(top);
    });
  });

  it('es matches top-level and templates.deadlines for core nav labels', () => {
    keys.forEach((k) => {
      const top = get(es, ['deadlines', k]);
      const tmpl = get(es, ['templates', 'deadlines', k]);
      if (top && tmpl) expect(tmpl).toBe(top);
    });
  });
});
