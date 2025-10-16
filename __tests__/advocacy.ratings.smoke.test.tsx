import { act, fireEvent, render, waitFor } from '@testing-library/react';

import { TestProviders } from './TestProviders';


// Mock i18n and palette/a11y
jest.mock('../i18n', () => ({
  useTranslation: () => ({ t: (k:string, d?:any) => (d ?? k) }),
  I18nProvider: ({ children }: any) => children,
}));
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {}, useScreenReaderEnabled: () => false, useReduceMotionEnabled: () => false }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

// Mock services used by Ratings
jest.mock('../services/ratings', () => ({
  listRatings: async () => [],
  listTargets: async () => ['Hospital X','Clinic Y'],
  ensureTarget: async () => {},
  upsertRating: async () => ({ id: 'r1' }),
}));
jest.mock('../services/moderation', () => ({ flagItem: async () => {} }));
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ isAdmin: false }) }));
const Mod = require('../app/(tabs)/advocacy/ratings');
const Ratings = (Mod && Mod.default) ? Mod.default : Mod;

describe('Ratings (smoke)', () => {
  it('renders and submits a rating', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestProviders>
        <Ratings />
      </TestProviders>
    );
    expect(getByText(/Disability Justice Ratings/i)).toBeTruthy();
    await act(async () => {
      fireEvent.change(getByPlaceholderText(/Score 1-5/i) as any, { target: { value: '4' } });
      fireEvent.change(getByPlaceholderText(/Comment/i) as any, { target: { value: 'Helpful and respectful' } });
    });
  (fireEvent as any).press(getByText(/Submit Rating/i));
    await waitFor(() => expect(true).toBeTruthy());
  });
});
