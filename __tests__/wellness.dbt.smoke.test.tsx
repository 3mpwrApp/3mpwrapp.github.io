import { render } from '@testing-library/react';

jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));
jest.mock('../services/wellness/dbtMatcher', () => ({ matchDBTSkills: () => ['TIP skill','Paced breathing'] }));

const Mod = require('../app/(tabs)/wellness/dbt');
const Screen = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — DBT Skill Matcher (smoke)', () => {
  it('renders skills without crash', () => {
    const { getByText } = render(<Screen />);
    expect(getByText(/DBT Skill Matcher/i)).toBeTruthy();
  });
});
