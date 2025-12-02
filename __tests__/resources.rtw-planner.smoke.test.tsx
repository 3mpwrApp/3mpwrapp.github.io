import { fireEvent, render, waitFor } from '@testing-library/react';

// Palette and a11y minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa', card:'#fff', error:'#c00', success:'#0a0', warning:'#fa0', info:'#08f' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {}, useScreenReaderEnabled: () => false, useReduceMotionEnabled: () => false }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (key: string, fb?: string) => fb || key }) }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Firebase config and firestore mocks used by services/rtw
jest.mock('../firebase/config', () => ({ auth: { currentUser: { uid: 'u1' } }, db: {} }));
const docs: any[] = [];
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(async (_col, data) => { docs.unshift({ id: String(Date.now()), data: () => data }); }),
  collection: jest.fn(() => ({})),
  deleteDoc: jest.fn(async () => {}),
  doc: jest.fn(() => ({})),
  getDocs: jest.fn(async () => ({ docs })),
  orderBy: jest.fn(() => ({})),
  query: jest.fn(() => ({})),
  serverTimestamp: jest.fn(() => ({})),
  updateDoc: jest.fn(async () => {}),
}));

const Mod = require('../app/(tabs)/resources/rtw-planner');
const RTWPlanner = (Mod && Mod.default) ? Mod.default : Mod;

describe('Resources — Return-to-Work Planner (smoke)', () => {
  it('renders and shows basic plan info fields', async () => {
    const { getByText, getByPlaceholderText } = render(<RTWPlanner />);
    expect(getByText(/Return-to-Work Planner/i)).toBeTruthy();
    // Check that plan tab fields are present
    expect(getByPlaceholderText(/Company name/i)).toBeTruthy();
    expect(getByPlaceholderText(/Job title/i)).toBeTruthy();
    expect(getByPlaceholderText(/YYYY-MM-DD/i)).toBeTruthy();
  });

  it('switches between tabs without crash', async () => {
    const { getAllByText } = render(<RTWPlanner />);
    // Click Phases tab (use getAllByText since text may appear in both tab and content)
    const phaseTabs = getAllByText(/Phases/i);
    (fireEvent as any).press(phaseTabs[0]);
    // After clicking Phases tab, should show Add Phase button or empty state
    await waitFor(() => expect(getAllByText(/Add Phase/i).length).toBeGreaterThan(0));
    // Click Comms tab
    const commsTabs = getAllByText(/Comms/i);
    (fireEvent as any).press(commsTabs[0]);
    // After clicking Comms tab, should show Log Communication button or empty state
    await waitFor(() => expect(getAllByText(/Log Communication/i).length).toBeGreaterThan(0));
  });
});
