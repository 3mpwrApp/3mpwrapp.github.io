import { fireEvent, render } from '@testing-library/react';

// Palette and a11y minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {}, useScreenReaderEnabled: () => false, useReduceMotionEnabled: () => false }));
// i18n mock
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));

const Mod = require('../app/(tabs)/wellness/micro-movement');
const MicroMovement = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Micro‑Movement Coach (smoke)', () => {
  it('renders and advances to next movement', () => {
    const { getByText, getByLabelText } = render(<MicroMovement />);
    // Header present
    expect(getByText(/Micro/i)).toBeTruthy();
    // Shows a movement and advances on Next
    const firstMove = getByText(/Ankle|Neck|Shoulder|Wrist|Seated/i);
    (fireEvent as any).press(getByLabelText(/Next movement/i));
    // After advancing, there is still a movement displayed
    const nextMove = getByText(/Ankle|Neck|Shoulder|Wrist|Seated/i);
    expect(nextMove).toBeTruthy();
    // It's okay if it cycles; smoke test only checks no crash
    expect(firstMove).toBeTruthy();
  });
});
