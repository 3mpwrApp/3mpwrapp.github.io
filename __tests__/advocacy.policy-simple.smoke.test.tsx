import { act, fireEvent, render, waitFor } from '@testing-library/react';

// i18n and palette/a11y mocks
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k:string, d?:any) => (d ?? k) }) }));
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {}, useScreenReaderEnabled: () => false, useReduceMotionEnabled: () => false }));
// Avoid importing real expo-router which pulls react-navigation assets
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}) }));

// Use real aiAdvocacy (has deterministic fallback), but ensure no LLM
jest.mock('../services/llm', () => ({ llmSimplify: async () => null, llmInterpret: async () => null }));

const Mod = require('../app/(tabs)/advocacy/policy-simple');
const PolicySimple = (Mod && Mod.default) ? Mod.default : Mod;

describe('Policy Made Simple (smoke)', () => {
  it('simplifies input text and shows summary/key points', async () => {
  const { getByText, getByLabelText, queryByText } = render(<PolicySimple />);
    const input = getByLabelText('Policy text input');
    // Type policy-like text
    await act(async () => {
      // Use web-style change to keep typing happy in RN web test env
      fireEvent.change(input as any, { target: { value: 'Notwithstanding barrier; shall provide accommodations pursuant to policy.' } });
    });
    // Trigger simplify
  (fireEvent as any).press(getByText(/Simplify|advocacy\.policy\.simplify/));
  await waitFor(() => expect(queryByText(/Summary|advocacy\.policy\.summary/)).toBeTruthy(), { timeout: 5000 });
  // The fallback replaces notwithstanding->despite, shall->will, pursuant to->under.
  // Be tolerant of multiple occurrences by checking container text content.
  const containerText = document.body.textContent || '';
  expect(/despite|under|will/i.test(containerText)).toBeTruthy();
  });
});
