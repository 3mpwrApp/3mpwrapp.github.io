/// <reference types="jest" />
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { I18nProvider, useTranslation } from '../i18n';

function getI18n(): Promise<ReturnType<typeof useTranslation>> {
  return new Promise(resolve => {
    function HookProbe() {
      const api = useTranslation();
      React.useEffect(() => { resolve(api); }, [api]);
      return null;
    }
    render(<I18nProvider><HookProbe /></I18nProvider>);
  });
}

describe('i18n basic', () => {
  test('fallback returns key when missing', async () => {
    const api = await getI18n();
    expect(api.t('nonexistent.key')).toBe('nonexistent.key');
  });
  test('translates existing key', async () => {
    const api = await getI18n();
    const v = api.t('nav.home');
    expect(typeof v).toBe('string');
    expect(v.length).toBeGreaterThan(0);
  });
  test('plural one/other', async () => {
    const api = await getI18n();
    expect(api.tCount('demoPlural.item',1)).toBe('1 item');
    expect(api.tCount('demoPlural.item',3)).toBe('3 items');
  });
  test('plural fallback when base missing', async () => {
    const api = await getI18n();
    const out = api.tCount('missing.namespace.key', 5, 'missing.namespace.key');
    expect(out).toContain('missing.namespace.key');
  });
  test('language switching updates lang state', async () => {
    function useLangTracker() {
      const api = useTranslation();
      const [lang, setLang] = React.useState(api.lang);
      React.useEffect(() => { setLang(api.lang); }, [api.lang]);
      return { api, lang };
    }
    const resolutions: string[] = [];
    function Tracker() {
      const { api, lang } = useLangTracker();
      React.useEffect(() => {
        if (resolutions.length === 0 && lang === api.lang) {
          api.setLanguage('fr');
        } else if (resolutions.length === 1 && lang === 'fr') {
          api.setLanguage('es');
        } else if (resolutions.length === 2 && lang === 'es') {
          // no further changes
        }
      }, [lang, api]);
      React.useEffect(() => {
        if (resolutions.length === 0 && lang === 'en') {
          resolutions.push('en');
        } else if (resolutions.length === 1 && lang === 'fr') {
          resolutions.push('fr');
        } else if (resolutions.length === 2 && lang === 'es') {
          resolutions.push('es');
        }
      }, [lang]);
      return null;
    }
    render(<I18nProvider><Tracker /></I18nProvider>);
    await waitFor(() => expect(resolutions).toContain('fr'));
    await waitFor(() => expect(resolutions).toContain('es'));
  });
  test('plural interpolation inserts count', async () => {
    const api = await getI18n();
    expect(api.tCount('demoPlural.item', 7)).toBe('7 items');
  });
  test('justiceService template placeholders preserved', async () => {
    const api = await getI18n();
    const raw = api.t('justiceService.evidenceLine');
    expect(raw).toContain('{{noteCount}}');
    expect(raw).toContain('{{docCount}}');
  });
  test('badge flag adds marker for tagged strings', async () => {
    // First verify plain (no badge flag) strips [T]
    delete process.env.EXPO_PUBLIC_I18N_BADGE;
    let api = await getI18n();
    expect(api.t('test.badge')).toBe('BadgeMarker');
    // Now enable badge flag and validate across language switches.
    process.env.EXPO_PUBLIC_I18N_BADGE = '1';
    const outputs: string[] = [];
    function BadgeStepper() {
      const { lang, t, setLanguage } = useTranslation();
      React.useEffect(() => {
        const v = t('test.badge');
        if (!outputs.includes(v)) outputs.push(v);
        if (lang === 'en') setLanguage('fr');
        else if (lang === 'fr') setLanguage('es');
      }, [lang, t, setLanguage]);
      return null;
    }
    render(<I18nProvider><BadgeStepper /></I18nProvider>);
    await waitFor(() => expect(outputs).toContain('BadgeMarker ◀'));
    await waitFor(() => expect(outputs).toContain('BadgeMarque ◀'));
    await waitFor(() => expect(outputs).toContain('IndicadorInsignia ◀'));
    delete process.env.EXPO_PUBLIC_I18N_BADGE;
  });
});
