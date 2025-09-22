import en from '../locales/en/common.json';
import fr from '../locales/fr/common.json';
import es from '../locales/es/common.json';

describe('Advocacy i18n keys', () => {
  const requiredKeys = [
    'advocacy.ally.intro',
    'advocacy.ally.linksHeader',
    'advocacy.ally.coachHeader',
    'advocacy.ally.coachHelp',
    'advocacy.ally.generate',
    'advocacy.policy.aiHeader',
    'advocacy.policy.aiHelp',
    'advocacy.policy.simplify',
    'advocacy.policy.summary',
    'advocacy.policy.keyPoints',
    'advocacy.coach.practiceHeader',
    'advocacy.coach.practiceHelp',
    'advocacy.coach.generate',
    'advocacy.coach.subtitle',
    'advocacy.coach.defaultPrompt',
    'advocacy.disclaimer.notLegal',
    'advocacy.disclaimer.privacy'
  ];

  function has(obj: any, path: string) {
    return path.split('.').every(p => (obj = obj?.[p]) !== undefined);
  }

  const locales = { en, fr, es } as const;

  for (const [code, data] of Object.entries(locales)) {
    it(`${code} has all required advocacy keys`, () => {
      const missing = requiredKeys.filter(k => !has(data, k));
      expect(missing).toEqual([]);
    });
  }

  it('coach lessons have titles and three bullets in EN', () => {
    const ids = ['conf-1','speak-1','assert-1','docs-1'];
    ids.forEach(id => {
      const base = (en as any).advocacy.coach.lesson[id];
      expect(base).toBeTruthy();
      expect(base.title).toBeTruthy();
      expect(base.b1 && base.b2 && base.b3).toBeTruthy();
    });
  });
});
