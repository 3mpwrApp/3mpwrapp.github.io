import { renderHook } from '@testing-library/react';
import { router } from 'expo-router';

import { useVoiceCommands } from '../hooks/useVoiceMode';

// Mock router push/back
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
// Mock settings to enable voice mode
jest.mock('../store/settings', () => ({ useSettings: () => ({ voiceMode: true }) }));

describe('voice navigation smoke', () => {
  beforeEach(() => {
    (router.push as jest.Mock).mockReset();
    (router.back as jest.Mock).mockReset();
  });

  it('routes to resources with "open resources"', () => {
    const { result } = renderHook(() => useVoiceCommands());
    const r = result.current.handleVoiceCommand('Open resources');
    expect(r.handled).toBe(true);
    expect(router.push).toHaveBeenCalledWith('/(tabs)/resources');
  });

  it('goes back on "go back"', () => {
    const { result } = renderHook(() => useVoiceCommands());
    const r = result.current.handleVoiceCommand('go back');
    expect(r.handled).toBe(true);
    expect(router.back).toHaveBeenCalled();
  });
});
