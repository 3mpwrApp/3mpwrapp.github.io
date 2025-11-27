import { act, fireEvent, render, waitFor } from '@testing-library/react';

// Minimal mocks
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k:string, d?:any) => (d ?? k) }) }));
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {}, useScreenReaderEnabled: () => false, useReduceMotionEnabled: () => false }));
// Force fallback path
jest.mock('../services/llm', () => ({ llmInterpret: async () => null }));

const Mod = require('../app/(tabs)/advocacy/ai-case-interpreter');
const CaseInterpreter = (Mod && Mod.default) ? Mod.default : Mod;

describe('AI Case Interpreter (smoke)', () => {
  it('interprets text and shows next steps offline', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<CaseInterpreter />);
    const input = getByPlaceholderText(/Paste text here/i);
    await act(async () => {
      fireEvent.change(input as any, { target: { value: 'This letter includes a deadline and mentions reconsideration and medical records.' } });
    });
  (fireEvent as any).press(getByText(/Analyze Document/i));
    await waitFor(() => expect(queryByText(/Summary/)).toBeTruthy());
    const text = document.body.textContent || '';
    expect(/Next steps/i.test(text)).toBeTruthy();
  });
});
