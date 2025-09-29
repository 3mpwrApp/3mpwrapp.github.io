import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import fr from '../locales/fr/common.json';

describe('translator.deadlines label localization', () => {
  it('has expected labels in en/fr/es', () => {
    expect(en.translator?.deadlines).toBe('Deadlines');
    expect(fr.translator?.deadlines).toBe('Échéances');
    expect(es.translator?.deadlines).toBe('Plazos');
  });
});
