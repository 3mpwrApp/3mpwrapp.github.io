import { fireEvent, render } from '@testing-library/react';

import { HomeGuide } from '../components/HomeGuide';

// Mock translation
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k:string, def?:string)=> def || _k }) }));
// Mock mood store (optional)
jest.mock('../store/mood', () => ({ useMood: () => ({ recentAverage: 3, todayEntries: [] }) }));
// Mock settings store
jest.mock('../store/settings', () => ({ useSettings: () => ({ moodNudgesEnabled: true }) }));
// Mock palette
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ surface:'#fff', muted:'#ccc', primary:'#036', onPrimary:'#fff', text:'#111' }) }));
// Mock tool registry (include filterToolsByFlags used by component)
jest.mock('../services/toolRegistry', () => ({
  getToolMeta: (id:string) => ({ id, category:'advocacy', i18nLabelKey:'homeGuide.tool.coach', icon:'coach', a11yLabelKey:'a11y.tool.coach' }),
  resolveToolRoute: () => '/',
  filterToolsByFlags: () => ([{ id:'coach', category:'advocacy', i18nLabelKey:'homeGuide.tool.coach', icon:'coach', a11yLabelKey:'a11y.tool.coach' }])
}));
// Mock expo-router to avoid navigation stack import chain
jest.mock('expo-router', () => ({
  Link: ({ children, onPress }: any) => <div onClick={onPress}>{children}</div>,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })
}));
// Mock react-native primitives for web test environment
jest.mock('react-native', () => ({
  Pressable: (p:any) => <button onClick={p.onPress} aria-label={p.accessibilityLabel}>{p.children}</button>,
  Text: (p:any) => <span>{p.children}</span>,
  View: (p:any) => <div>{p.children}</div>,
  StyleSheet: { create: (s:any)=> s, hairlineWidth: 1 }
}));

// Spy usage
const viewSpy = jest.fn();
jest.mock('../services/usage', () => ({ usage: { view: (...args:any[]) => viewSpy(...args), getBuffer: () => [] } }));
// Personalization mock: deterministic suggestion list
jest.mock('../services/personalization', () => ({
  useSuggestions: () => ([{ toolId:'coach', score: 5, reason:[{ key:'novelty' }, { key:'rotation' }] }]),
  submitFeedback: jest.fn().mockResolvedValue(undefined),
  scoreTools: jest.fn().mockResolvedValue([])
}));

describe('HomeGuide analytics', () => {
  it('emits enriched usage.view payload when opening suggestion', () => {
    const { getByRole } = render(<HomeGuide />);
    const openBtn = getByRole('button', { name: 'Open' });
  fireEvent.click(openBtn);
    expect(viewSpy).toHaveBeenCalled();
    const last = viewSpy.mock.calls.pop();
  // usage.view(tool, route, meta)
  expect(last[0]).toBe('home_guide_select');
  expect(last[1]).toEqual('/');
  const meta = last[2];
  expect(meta.tool).toBe('coach');
  expect(meta.category).toBe('advocacy');
  expect(meta.reasons).toEqual(expect.arrayContaining(['novelty','rotation']));
  });
});
