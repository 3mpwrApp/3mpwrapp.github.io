import { fireEvent, render, waitFor } from '@testing-library/react';

// Palette and a11y minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {} }));

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
  it('adds a goal without crash', async () => {
    const { getByText, getByPlaceholderText, getAllByText } = render(<RTWPlanner />);
    expect(getByText(/Return-to-Work Planner/i)).toBeTruthy();
    const titleInput: any = getByPlaceholderText(/Goal title/i);
    fireEvent.change(titleInput, { target: { value: '4-hour shifts' } });
    (fireEvent as any).press(getByText(/Add Goal/i));
    // Wait for a goal card to render by presence of action buttons
    await waitFor(() => expect(getAllByText(/Mark done|Delete/i).length).toBeGreaterThan(0));
  });
});
