import { fireEvent, render, waitFor } from '@testing-library/react';

// Mock i18n minimal
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k:string) => k }) }));
// Mock palette and a11y hooks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ 
  MAX_FONT_SCALE: 2, 
  useAnnounceOnMount: () => {}, 
  useFocusOnRefOnMount: () => {},
  useScreenReaderEnabled: () => false,
  useReduceMotionEnabled: () => false,
}));

// Mock aiCoachPrompt to be deterministic
jest.mock('../services/aiAdvocacy', () => ({
  aiCoachPrompt: jest.fn(async () => 'Goal: Be supportive\nStep 1: Listen\nStep 2: Offer help')
}));

// Be robust to default vs commonjs export shapes
 
const AllyHubMod = require('../app/(tabs)/advocacy/ally-hub');
const AllyHub = (AllyHubMod && AllyHubMod.default) ? AllyHubMod.default : AllyHubMod;

describe('Ally Hub smoke', () => {
  it('generates coaching output on button press', async () => {
    const { getByTestId, getByText, queryByText } = render(<AllyHub />);
    const btn = getByTestId('ally-generate-btn');
    // Should not show output yet
    expect(queryByText(/Goal:/)).toBeNull();
    // Press generate
  // @ts-ignore
  fireEvent.press(btn);
  await waitFor(() => expect(getByText(/Goal:/)).toBeTruthy(), { timeout: 10000 });
  expect(getByText(/Step 1:/)).toBeTruthy();
  });
});
