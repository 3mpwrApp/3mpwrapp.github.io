import { render } from '@testing-library/react';

jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));
jest.mock('expo-router', () => ({ Redirect: ({ href }: { href: string }) => <>{`Redirected to ${href}`}</> }));

const Mod = require('../app/(tabs)/advocacy/assistant-hub');
const Screen = (Mod && Mod.default) ? Mod.default : Mod;

describe('Assistant Hub redirect (quick prompt call smoke)', () => {
  it('renders redirect without crash', () => {
    render(<Screen />);
  });
});
