import { render } from '@testing-library/react';
jest.mock('../i18n', () => {
  return {
    useTranslation: () => ({
      t: (k: string, fallback?: string) => ({
        'loading.generic': 'Loading…',
        'loading.community': 'Loading community…',
        'loading.deadlines': 'Loading deadlines…',
        'loading.evidence': 'Loading evidence locker…',
        'loading.reflections': 'Loading reflections…'
      } as any)[k] || fallback || k,
    }),
  };
});

jest.mock('../hooks/useA11y', () => ({ useAnnounceOnMount: () => {}, MAX_FONT_SCALE:2 }));
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ background:'#fff', text:'#111', surface:'#f5f5f5', primary:'#06f', onPrimary:'#fff', muted:'#ccc', error:'#c00', warning:'#fa0' }) }));

import ScreenSkeleton from '../components/ScreenSkeleton';

describe('A11y Loading Announcements', () => {
  it('renders community loading label', () => {
  const { getByLabelText } = render(<ScreenSkeleton labelKey='loading.community' />);
    expect(getByLabelText(/Loading community/i)).toBeTruthy();
  });
  it('renders deadlines loading label', () => {
  const { getByLabelText } = render(<ScreenSkeleton labelKey='loading.deadlines' />);
    expect(getByLabelText(/Loading deadlines/i)).toBeTruthy();
  });
  it('renders evidence loading label', () => {
  const { getByLabelText } = render(<ScreenSkeleton labelKey='loading.evidence' />);
    expect(getByLabelText(/Loading evidence locker/i)).toBeTruthy();
  });
  it('renders reflections loading label', () => {
  const { getByLabelText } = render(<ScreenSkeleton labelKey='loading.reflections' />);
    expect(getByLabelText(/Loading reflections/i)).toBeTruthy();
  });
  it('falls back to generic when key missing', () => {
  const { getByLabelText } = render(<ScreenSkeleton labelKey='loading.missing_key' />);
    expect(getByLabelText(/Loading…$/i)).toBeTruthy();
  });
});
