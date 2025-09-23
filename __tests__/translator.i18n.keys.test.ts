import en from '../locales/en/common.json';

describe('translator i18n keys', () => {
  const required = [
    'translator.simplify',
    'translator.summary',
    'translator.keyTerms',
    'translator.deadlines',
    'translator.actions',
    'translator.fullText',
    'translator.copiedTitle',
    'translator.copiedBody'
  ];
  it('contains required keys in en locale', () => {
    required.forEach(k => {
      const parts = k.split('.');
      let cur: any = en;
      for (const p of parts) cur = cur?.[p];
      expect(cur).toBeTruthy();
    });
  });
});
