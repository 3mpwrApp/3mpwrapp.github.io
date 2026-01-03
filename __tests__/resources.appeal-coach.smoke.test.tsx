import { render } from '@testing-library/react';

jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));
jest.mock('expo-router', () => ({ Redirect: ({ href }: { href: string }) => <>{`Redirected to ${href}`}</> }));

const Mod = require('../app/(tabs)/resources/appeal-coach');
const Screen = (Mod && Mod.default) ? Mod.default : Mod;

describe('Resources — Appeal Coach (smoke)', () => {
  it('renders redirect without crash', () => {
    render(<Screen />);
  });
});
