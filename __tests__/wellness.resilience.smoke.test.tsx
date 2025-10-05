import { fireEvent, render } from '@testing-library/react';

jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));
jest.mock('../store/resilience', () => ({ useResilience: () => ({ points: 0, actions: [{ id:'a', name:'Small step', tKey:'wellness.resilience.small', points:1, icon:'+' }], award: () => {} }) }));

const Mod = require('../app/(tabs)/wellness/resilience');
const Screen = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Resilience Points (smoke)', () => {
  it('renders and awards without crash', () => {
    const { getByText } = render(<Screen />);
    expect(getByText(/Resilience Points/i)).toBeTruthy();
    (fireEvent as any).press(getByText(/Small step/i));
  });
});
