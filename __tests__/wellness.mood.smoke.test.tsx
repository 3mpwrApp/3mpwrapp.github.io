import { fireEvent, render } from '@testing-library/react';

jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k:string, d?:any) => (d ?? k) }) }));
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
// Avoid importing real expo-router which pulls react-navigation assets
jest.mock('expo-router', () => ({ Link: ({ children }: any) => children }));

const Mod = require('../app/(tabs)/wellness.mood');
const Mood = (Mod && Mod.default) ? Mod.default : Mod;

describe('Mood Tracker (smoke)', () => {
  it('renders and adds an entry', () => {
    const { getByText, getByPlaceholderText } = render(<Mood />);
    fireEvent.change(getByPlaceholderText(/Optional note/i) as any, { target: { value: 'Feeling okay' } });
    (fireEvent as any).press(getByText(/Save|mood\.save/));
  });
});
