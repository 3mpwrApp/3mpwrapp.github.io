import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { awardBadge, hasBadge, ProfileLocalProvider } from '../store/profileLocal';

// Mock AsyncStorage
const mockAsyncStorage: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn((key: string) => Promise.resolve(mockAsyncStorage[key] || null)),
    setItem: jest.fn((key: string, value: string) => {
      mockAsyncStorage[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete mockAsyncStorage[key];
      return Promise.resolve();
    }),
  },
}));

describe('Beta Tester Badge System', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockAsyncStorage).forEach((key) => delete mockAsyncStorage[key]);
    jest.clearAllMocks();
  });

  it('awards beta tester badge with correct data', async () => {
    await awardBadge('betaTester', { phase: 'closed' });

    const hasIt = await hasBadge('betaTester');
    expect(hasIt).toBe(true);
  });

  it('does not overwrite existing badge', async () => {
    const firstAward = new Date('2025-01-01').toISOString();
    await awardBadge('betaTester', { awarded: firstAward, phase: 'closed' });

    // Try to award again
    await awardBadge('betaTester', { phase: 'open' });

    // Should still have the original award date and phase
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const raw = await AsyncStorage.getItem('empowr.profile.local.v1');
    const profile = JSON.parse(raw!);

    expect(profile.badges.betaTester.awarded).toBe(firstAward);
    expect(profile.badges.betaTester.phase).toBe('closed');
  });

  it('awards multiple different badges', async () => {
    await awardBadge('betaTester', { phase: 'closed' });
    await awardBadge('earlyAdopter');
    await awardBadge('contributor');

    expect(await hasBadge('betaTester')).toBe(true);
    expect(await hasBadge('earlyAdopter')).toBe(true);
    expect(await hasBadge('contributor')).toBe(true);
    expect(await hasBadge('verified')).toBe(false);
  });

  it('handles missing storage gracefully', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

    await expect(awardBadge('betaTester')).resolves.not.toThrow();
  });

  it('returns false for non-existent badge', async () => {
    expect(await hasBadge('betaTester')).toBe(false);
  });

  it('preserves other profile data when awarding badge', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // Set up existing profile data
    await AsyncStorage.setItem(
      'empowr.profile.local.v1',
      JSON.stringify({
        name: 'Test User',
        contact: 'test@example.com',
        province: 'ON',
      })
    );

    await awardBadge('betaTester', { phase: 'closed' });

    const raw = await AsyncStorage.getItem('empowr.profile.local.v1');
    const profile = JSON.parse(raw!);

    expect(profile.name).toBe('Test User');
    expect(profile.contact).toBe('test@example.com');
    expect(profile.province).toBe('ON');
    expect(profile.badges.betaTester).toBeDefined();
  });
});

describe('useBetaTesterBadge Hook', () => {
  beforeEach(() => {
    Object.keys(mockAsyncStorage).forEach((key) => delete mockAsyncStorage[key]);
    jest.clearAllMocks();
  });

  it('awards badge when EXPO_PUBLIC_BETA=1', async () => {
    process.env.EXPO_PUBLIC_BETA = '1';
    
    const { useBetaTesterBadge } = require('../hooks/useBetaTesterBadge');
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProfileLocalProvider>{children}</ProfileLocalProvider>
    );

    renderHook(() => useBetaTesterBadge(), { wrapper });

    // Wait for effect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const hasIt = await hasBadge('betaTester');
    expect(hasIt).toBe(true);

    delete process.env.EXPO_PUBLIC_BETA;
  });

  it('does not award badge when not in beta', async () => {
    delete process.env.EXPO_PUBLIC_BETA;
    
    const { useBetaTesterBadge } = require('../hooks/useBetaTesterBadge');
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProfileLocalProvider>{children}</ProfileLocalProvider>
    );

    renderHook(() => useBetaTesterBadge(), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const hasIt = await hasBadge('betaTester');
    expect(hasIt).toBe(false);
  });

  it('does not award badge if already awarded', async () => {
    process.env.EXPO_PUBLIC_BETA = '1';
    
    // Pre-award the badge
    await awardBadge('betaTester', { phase: 'closed' });
    
    const { useBetaTesterBadge } = require('../hooks/useBetaTesterBadge');
    
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
    const initialCallCount = setItemSpy.mock.calls.length;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProfileLocalProvider>{children}</ProfileLocalProvider>
    );

    renderHook(() => useBetaTesterBadge(), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Should not have called setItem again (badge already exists)
    expect(setItemSpy.mock.calls.length).toBe(initialCallCount);

    delete process.env.EXPO_PUBLIC_BETA;
  });
});
