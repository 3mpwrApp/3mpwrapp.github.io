import { renderHook } from '@testing-library/react';
import React from 'react';

import { CoachProgressProvider, useCoachProgress, useCoachProgressOptional } from '../store/coachProgress';

describe('useCoachProgressOptional', () => {
  it('returns undefined when used outside provider (does not throw)', () => {
    const { result } = renderHook(() => useCoachProgressOptional());
    expect(result.current).toBeUndefined();
  });

  it('returns context when used within provider', () => {
    const wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
      <CoachProgressProvider>{children}</CoachProgressProvider>
    );
    const { result } = renderHook(() => useCoachProgress(), { wrapper });
    expect(result.current).toHaveProperty('lessons');
    expect(typeof result.current.percentComplete).toBe('number');
  });
});
