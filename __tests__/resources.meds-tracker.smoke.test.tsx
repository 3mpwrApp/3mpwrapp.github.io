import { fireEvent, render } from '@testing-library/react';

// Minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y');

jest.mock('../services/meds', () => ({
  addMedication: jest.fn(async ()=>{}),
  listMedications: jest.fn(async ()=>[{ id:'m1', name:'Ibuprofen', dose:'200mg', schedule:'2x daily', reminderTime:'09:00' }]),
  deleteMedication: jest.fn(async ()=>{}),
  addMedLog: jest.fn(async ()=>{}),
  listLogs: jest.fn(async ()=>[]),
}));
jest.mock('../services/notifications', () => ({ scheduleAt: jest.fn(async ()=>{}) }));
jest.mock('expo-file-system', () => ({ cacheDirectory: '/tmp/', EncodingType: { UTF8: 'utf8' }, writeAsStringAsync: async () => {} }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: async () => false, shareAsync: async () => {} }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: async () => ({ assets: [] }) }));

const Mod = require('../app/(tabs)/resources/meds-tracker');
const Meds = (Mod && Mod.default) ? Mod.default : Mod;

describe('Resources — Meds Tracker (smoke)', () => {
  it('renders and performs basic actions without crash', async () => {
    const { getByText, getByPlaceholderText, findByText } = render(<Meds />);
    // Add a medication
    (fireEvent as any).change(getByPlaceholderText(/Medication name/i), { target: { value: 'Acetaminophen' } });
    (fireEvent as any).change(getByPlaceholderText(/Dose/i), { target: { value: '500mg' } });
    (fireEvent as any).change(getByPlaceholderText(/Schedule/i), { target: { value: '3x daily' } });
    (fireEvent as any).press(getByText(/Add Medication/i));

  // Should render list item from mocked listMedications
  expect(await findByText(/Ibuprofen/i)).toBeTruthy();

  // Trigger exports (top action bar)
  (fireEvent as any).press(getByText(/^Export CSV$/));
  (fireEvent as any).press(getByText(/^Export JSON$/));

  // Open Logs afterward to avoid duplicate Export CSV queries
  (fireEvent as any).press(getByText(/^Logs$/));
  });
});
