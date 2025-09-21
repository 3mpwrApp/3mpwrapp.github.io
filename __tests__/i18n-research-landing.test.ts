import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import fr from '../locales/fr/common.json';

describe('i18n research.landing parity', () => {
  const landingPath = ['research','landing'];
  function get(obj: any, path: string[]) { return path.reduce((acc,k)=> acc && acc[k], obj); }
  const enLanding = get(en, landingPath);
  const esLanding = get(es, landingPath);
  const frLanding = get(fr, landingPath);

  it('english baseline present', () => {
    expect(typeof enLanding).toBe('object');
  });

  const keys = Object.keys(enLanding || {});
  it('spanish has all keys', () => {
    for (const k of keys) {
      expect(esLanding).toHaveProperty(k);
      expect(typeof (esLanding as any)[k]).toBe('string');
    }
  });
  it('french has all keys', () => {
    for (const k of keys) {
      expect(frLanding).toHaveProperty(k);
      expect(typeof (frLanding as any)[k]).toBe('string');
    }
  });
});
