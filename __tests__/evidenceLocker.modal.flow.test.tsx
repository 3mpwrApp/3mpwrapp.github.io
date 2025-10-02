import { fireEvent, render, waitFor } from '@testing-library/react';

jest.setTimeout(30000);

import EvidenceLocker from '../app/(tabs)/resources/evidence-locker';

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
jest.mock('react-native', () => {
  const React = require('react');
  const strip = ({ accessibilityRole, accessibilityLabel, _accessible, _placeholderTextColor, _maxFontSizeMultiplier, onPress, ...rest }: any) => {
    const out: any = { ...rest };
    if (accessibilityLabel) out['aria-label'] = accessibilityLabel;
    if (accessibilityRole === 'button') out.role = 'button';
    if (onPress) out.onClick = onPress;
    return out;
  };
  const View = ({ children, ...rest }: any) => React.createElement('div', strip(rest), children);
  const Text = ({ children, ...rest }: any) => React.createElement('span', strip(rest), children);
  const TextInput = ({ value, onChangeText, placeholder, secureTextEntry, ...rest }: any) =>
    React.createElement('input', {
      ...strip(rest),
      placeholder,
      value: value || '',
      type: secureTextEntry ? 'password' : 'text',
      onChange: (e: any) => onChangeText && onChangeText(e.target.value),
    });
  const FlatList = ({ data, renderItem, keyExtractor, contentContainerStyle }: any) =>
    React.createElement(
      'div',
      { style: contentContainerStyle },
      (data || []).map((item: any, index: number) => {
        const key = keyExtractor ? keyExtractor(item) : String(index);
        const element = renderItem({ item, index });
        return React.createElement('div', { key }, element);
      })
    );
  const Modal = ({ children }: any) => React.createElement('div', {}, children);
  const StyleSheet = { hairlineWidth: 1, create: (s: any) => s };
  const Alert = { alert: jest.fn(), prompt: jest.fn() };
  const I18nManager = { isRTL: false, allowRTL: jest.fn(), forceRTL: jest.fn() };
  const AccessibilityInfo = { announceForAccessibility: jest.fn() };
  return { View, Text, TextInput, FlatList, Modal, StyleSheet, Alert, I18nManager, AccessibilityInfo };
});
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

jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {} }));

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
  it('shows export modal and proceeds when passphrase strong and confirmed', async () => {
    const { getAllByText, getByText, getByPlaceholderText, queryByText } = renderWithProviders();

    const exportBtns = getAllByText(/^Export$/i);
    fireEvent.click(exportBtns[0]);
    expect(getByText(/Export encrypted/i)).toBeTruthy();

  // Use exact placeholder to avoid matching the confirm field
  const pass = getByPlaceholderText(/^Passphrase$/i);
  fireEvent.change(pass, { target: { value: 'Very$trongPass123' } });
  const confirm = getByPlaceholderText(/Confirm passphrase/i);
  fireEvent.change(confirm, { target: { value: 'Very$trongPass123' } });

  const okButtons = getAllByText(/OK/i);
  fireEvent.click(okButtons[okButtons.length - 1]);

    await waitFor(() => expect(queryByText(/Export encrypted/i)).toBeNull());
  });

  it('opens import modal and completes import', async () => {
    const { getAllByText, getByText, getByPlaceholderText, queryByText, findByText } = renderWithProviders();

    // Trigger Document Picker
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
