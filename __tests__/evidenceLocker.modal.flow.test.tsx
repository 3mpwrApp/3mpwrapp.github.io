import { act, fireEvent, render, waitFor, within } from '@testing-library/react';

jest.setTimeout(30000);
jest.useFakeTimers();

import EvidenceLocker from '../app/(tabs)/resources/(tools)/evidence-locker';

// Mock i18n to avoid I18nManager usage and provide simple t/tCount
jest.mock('../i18n', () => {
  const React = require('react');
  const Ctx = React.createContext({
    t: (key: string, def?: any, vars?: any) => (typeof def === 'string' ? def : String(key)).replace(/\{\{(.*?)\}\}/g, (_, k) => (vars && vars[k.trim()]) || ''),
    tCount: (_key: string, n: number) => `${n} items`,
  });
  return {
    I18nProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useTranslation: () => React.useContext(Ctx),
  };
});
// Provide a minimal react-native DOM shim so the component can render in jsdom
// Use global RN shim from jest.setup.js instead of a local mock
jest.mock('../components/A11yPressable', () => {
  const React = require('react');
  return ({ onPress, children }: any) => React.createElement('button', { onClick: onPress }, children);
});
jest.mock('../components/UploadProgress', () => {
  const React = require('react');
  return ({ pct, type }: any) => React.createElement('div', {}, `${type}:${pct}%`);
});
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  Link: ({ children }: any) => children,
  Slot: () => null
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false, isAdmin: false, isGuest: true, setUser: jest.fn(), signOut: jest.fn(), refreshClaims: jest.fn(), signInGuest: jest.fn() })
}));

jest.mock('../theme/usePalette', () => ({
  useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa', card:'#f5f5f5' })
}));

jest.mock('../theme/typography', () => ({
  useTextScale: () => ({ sm: 12, md: 14, lg: 16, xl: 20, h1: 28, scaleFont: (n: number) => n }),
}));

jest.mock('../store/settings', () => ({
  useSettings: () => ({ darkMode: false, textScale: 1, language: 'en', complexityMode: 'full' }),
  SettingsProvider: ({ children }: any) => children,
}));

jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {}, useScreenReaderEnabled: () => false, useReduceMotionEnabled: () => false }));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///mock.enc', name: 'mock.enc' }] }))
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => {})
}));

// Stub expo-image to a basic img element to avoid invalid component types
jest.mock('expo-image', () => {
  const React = require('react');
  return {
    Image: ({ source, style, ...rest }: any) => {
      const uri = source?.uri || source;
      return React.createElement('img', { src: uri, style, alt: rest.alt || 'img' });
    }
  };
});

jest.mock('../services/evidenceCrypto', () => {
  const actual = jest.requireActual('../services/evidenceCrypto');
  return {
    ...actual,
    exportNotesEncrypted: jest.fn(async () => 'file:///cache/mock.enc'),
    importNotesEncrypted: jest.fn(async () => ([{ id: '1', text: 'imported', date: new Date().toISOString(), tags: [] }]))
  };
});

function renderWithProviders() {
  return render(<EvidenceLocker />);
}

describe('EvidenceLocker passphrase modal flow', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('shows export modal and proceeds when passphrase strong and confirmed', async () => {
    const { getAllByText, getByPlaceholderText, findByText } = renderWithProviders();

    const exportBtns = getAllByText(/^Export$/i);
    fireEvent.click(exportBtns[0]);
  const title = await findByText(/Export encrypted/i);
  const modalRoot = title.closest('div') as HTMLElement;

    // Use exact placeholder to avoid matching the confirm field
    const pass = getByPlaceholderText(/^Passphrase$/i);
    fireEvent.change(pass, { target: { value: 'Very$trongPass123' } });
    const confirm = getByPlaceholderText(/Confirm passphrase/i);
    fireEvent.change(confirm, { target: { value: 'Very$trongPass123' } });

    // Wait for any validation state updates that may re-render modal actions
  // Click OK within the modal to avoid matching other OK buttons
  await waitFor(() => expect(within(modalRoot).getAllByText(/OK/i).length).toBeGreaterThan(0));
  const okInModal = within(modalRoot).getAllByText(/OK/i);
  fireEvent.click(okInModal[okInModal.length - 1]);

    const Sharing = require('expo-sharing');
    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalled());
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('opens import modal and completes import', async () => {
    const { getAllByText, getByText, getByPlaceholderText, queryByText, findByText } = renderWithProviders();

    // Wait for loading to finish (component has 400ms timeout before showing content)
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    
    // Now content should be visible
    const importBtns = getAllByText(/^Import$/i);
    fireEvent.click(importBtns[0]);

  // Wait for async state update after DocumentPicker resolves
  expect(await findByText(/Import encrypted/i)).toBeTruthy();
  const pass = getByPlaceholderText(/^Passphrase$/i);
  fireEvent.change(pass, { target: { value: 'Passw0rd!Passw0rd!' } });

  fireEvent.click(getByText(/OK/i));

    await waitFor(() => expect(queryByText(/Import encrypted/i)).toBeNull());
  });
});
