import { fireEvent, render } from '@testing-library/react';

// Minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ 
  MAX_FONT_SCALE: 2, 
  useAnnounceOnMount: () => {}, 
  useFocusOnRefOnMount: () => {},
  useScreenReaderEnabled: () => false,
  useReduceMotionEnabled: () => false
}));
jest.mock('../services/cache', () => ({ getCachedJSON: jest.fn(async()=>null), setCachedJSON: jest.fn(async()=>{}) }));
jest.mock('../services/calendar', () => ({ addEvent: jest.fn(async ()=> true) }));
jest.mock('../services/ics', () => ({ buildICSMany: () => 'BEGIN:VCALENDAR\nEND:VCALENDAR' }));
jest.mock('expo-file-system', () => ({ cacheDirectory: '/tmp/', EncodingType: { UTF8:'utf8' }, writeAsStringAsync: async ()=>{} }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: async ()=> false, shareAsync: async ()=>{} }));

const Mod = require('../app/(tabs)/wellness/daily-planner');
const DailyPlanner = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Adaptive Daily Planner (smoke)', () => {
  it('adds appointments, builds plan, shares and exports rests without crash', async () => {
    const { getByText, getByLabelText } = render(<DailyPlanner />);

    // Add a couple appointments using labeled inputs
    (fireEvent as any).change(getByLabelText(/Time input/i), { target: { value: '10:00' } });
    (fireEvent as any).change(getByLabelText(/Appointment title input/i), { target: { value: 'Physio' } });
  (fireEvent as any).press(getByLabelText(/Add appointment/i));

    (fireEvent as any).change(getByLabelText(/Time input/i), { target: { value: '13:30' } });
    (fireEvent as any).change(getByLabelText(/Appointment title input/i), { target: { value: 'Call with case manager' } });
  (fireEvent as any).press(getByLabelText(/Add appointment/i));

    // Build plan and use quick templates
    (fireEvent as any).press(getByText(/^Build plan$/));
    (fireEvent as any).press(getByText(/^Morning template$/));
    (fireEvent as any).press(getByText(/^Afternoon template$/));

    // Share and export rests ICS
  (fireEvent as any).press(getByText(/^Share$/));
  (fireEvent as any).press(getByLabelText(/Add rest break to calendar/i));
  (fireEvent as any).press(getByLabelText(/Add all rest breaks to calendar/i));
  (fireEvent as any).press(getByLabelText(/Export rest breaks as ICS/i));

    // Header present
    expect(getByText(/Adaptive Daily Planner/i)).toBeTruthy();
  });
});
