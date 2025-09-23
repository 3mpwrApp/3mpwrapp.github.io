import { extractTranslatorSections, getTranslatorConfigForLocale } from '../utils/translatorExtract';

describe('translator locale heuristics', () => {
  it('extracts Spanish action and deadline lines', () => {
    const text = `Debes presentar el formulario dentro de 10 dias. La decision final llega antes del 15 de octubre.`;
    const cfg = getTranslatorConfigForLocale('es');
    const res = extractTranslatorSections(text, cfg);
    expect(res.actions.some(l => /debes presentar/i.test(l))).toBe(true);
    expect(res.deadlines.some(l => /dentro de 10 dias/i.test(l))).toBe(true);
  });
  it('extracts French action lines', () => {
    const text = `Vous devez soumettre le formulaire dans 5 jours. La decision sera rendue avant le 20 novembre.`;
    const cfg = getTranslatorConfigForLocale('fr');
    const res = extractTranslatorSections(text, cfg);
    expect(res.actions.some(l => /vous devez soumettre/i.test(l))).toBe(true);
    expect(res.deadlines.some(l => /avant le 20 novembre/i.test(l))).toBe(true);
  });
});
