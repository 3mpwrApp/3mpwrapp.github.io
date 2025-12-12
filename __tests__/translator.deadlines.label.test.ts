import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import fr from '../locales/fr/common.json';

// Type assertion for locale files with dynamic keys
type LocaleFile = Record<string, unknown>;

describe('translator.deadlines label localization', () => {
  it('has expected labels in en/fr/es', () => {
    const enLocale = en as LocaleFile;
    const frLocale = fr as LocaleFile;
    const esLocale = es as LocaleFile;
    
    expect((enLocale.translator as Record<string, string>)?.deadlines).toBe('Deadlines');
    expect((frLocale.translator as Record<string, string>)?.deadlines).toBe('Échéances');
    expect((esLocale.translator as Record<string, string>)?.deadlines).toBe('Plazos');
  });
});
