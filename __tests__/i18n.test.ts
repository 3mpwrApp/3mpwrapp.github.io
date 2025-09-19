import { I18nProvider, useTranslation } from '../i18n';
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

// Simple in-memory render for hooks
const wrapper = ({ children }: { children: React.ReactNode }) => <I18nProvider>{children}</I18nProvider>;

describe('i18n basic', () => {
  it('returns key as fallback when missing', () => {
    const { result } = renderHook(()=> useTranslation(), { wrapper });
    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
  });
  it('translates existing key', () => {
    const { result } = renderHook(()=> useTranslation(), { wrapper });
    const v = result.current.t('nav.home');
    expect(typeof v).toBe('string');
    expect(v.length).toBeGreaterThan(0);
  });
  it('handles plural forms', () => {
    const { result } = renderHook(()=> useTranslation(), { wrapper });
    expect(result.current.tCount('demoPlural.item', 1)).toContain('1');
    expect(result.current.tCount('demoPlural.item', 3)).toContain('3');
  });
});
