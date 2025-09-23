import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { MoodProvider, useMood } from '../store/mood';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined)
  }
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MoodProvider>{children}</MoodProvider>;
}

describe('Mood store', () => {
  it('adds entry and updates state & average', () => {
    const { result } = renderHook(() => useMood(), { wrapper: Wrapper });
    expect(result.current.entries.length).toBe(0);
    act(()=> { result.current.addEntry(2, 'Great'); });
    expect(result.current.entries.length).toBe(1);
    expect(result.current.recentAverage).toBe(2);
    act(()=> { result.current.addEntry(-2, 'Low'); });
    expect(result.current.entries.length).toBe(2);
    expect(result.current.recentAverage).toBe(0);
  });
});
