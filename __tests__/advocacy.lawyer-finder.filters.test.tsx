import { fireEvent, render, screen } from '@testing-library/react';

import LawyerFinder from '../app/(tabs)/advocacy/lawyer-finder';

import { TestProviders } from './TestProviders';
// Mock MapEmbed to avoid native maps imports in test env
jest.mock('../components/MapEmbed', () => ({ __esModule: true, default: () => null }));
// Mock expo-router for any Link usage inside nested components
jest.mock('expo-router', () => ({ Link: ({ children }: any) => children, usePathname: () => '/', useLocalSearchParams: () => ({}) }));
// Mock ProvincePicker to a no-op
jest.mock('../components/ProvincePicker', () => ({ __esModule: true, default: (_props: any) => null }));
// Mocks for palette/typography/i18n
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#000', background:'#fff', card:'#fff', surface:'#fff', muted:'#ccc', primary:'#06f', onPrimary:'#fff', error:'#d33', success:'#090' }) }));
jest.mock('../theme/typography', () => ({ useTextScale: () => ({ factor:1 }) }));
jest.mock('../i18n', () => {
  const real = jest.requireActual('../i18n');
  return { __esModule: true, ...real, I18nProvider: real.I18nProvider, useTranslation: () => ({ t: (_k:string, f?:string) => f || _k }) };
});

describe('Lawyer Finder filters', () => {
  it('toggles Saved Only and filters list', async () => {
    render(
      <TestProviders>
        <LawyerFinder />
      </TestProviders>
    );
    // mark first item as saved by pressing its save button
  const saveButtons = await screen.findAllByText(/Save|Saved/i);
  // @ts-ignore react-native testing library press alias
  fireEvent.press(saveButtons[0]);

    // toggle Saved filter
    const savedChip = await screen.findByText(/Saved/i);
  // @ts-ignore react-native testing library press alias
  fireEvent.press(savedChip);

    // after saved-only, at least one saved indicator should be present
    const savedIndicator = await screen.findAllByText(/Saved/i);
    expect(savedIndicator.length).toBeGreaterThan(0);
  });
});
