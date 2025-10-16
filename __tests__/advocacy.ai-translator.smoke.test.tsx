import { act, fireEvent, render, waitFor } from '@testing-library/react';

// Mocks to stabilize RN web tests
jest.mock('../i18n', () => ({
  useTranslation: () => ({ t: (k:string, d?:any) => (d ?? k), lang: 'en' }),
}));
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {}, useScreenReaderEnabled: () => false, useReduceMotionEnabled: () => false }));
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}) }));

// Make LLM return null to force deterministic fallback
jest.mock('../services/llm', () => ({ llmSimplify: async () => null }));

const Mod = require('../app/(tabs)/advocacy/ai-advocate-translator');
const Translator = (Mod && Mod.default) ? Mod.default : Mod;

describe('AI Advocate Translator (smoke)', () => {
  it('simplifies input and shows sections offline', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<Translator />);
    const input = getByPlaceholderText(/Paste text here/i);
    await act(async () => {
      fireEvent.change(input as any, { target: { value: 'Notwithstanding, you shall respond pursuant to policy. Deadline: 10 days.' } });
    });
    (fireEvent as any).press(getByText(/Simplify|translator\.simplify/));
    await waitFor(() => expect(queryByText(/Plain Summary|translator\.summary/)).toBeTruthy());
    // Fallback should include replacements
    const text = document.body.textContent || '';
    expect(/despite|under|will/i.test(text)).toBeTruthy();
  });
});
