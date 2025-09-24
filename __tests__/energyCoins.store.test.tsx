import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { EnergyCoinsProvider, useEnergyCoins } from '../store/energyCoins';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

function Wrapper({ children }: { children: React.ReactNode }){
  return <EnergyCoinsProvider>{children}</EnergyCoinsProvider>;
}

describe('energyCoins store', () => {
  it('sets daily and spends coins', async () => {
    const { result } = renderHook(() => useEnergyCoins(), { wrapper: Wrapper });
    expect(result.current.coins).toBeGreaterThanOrEqual(0);
    await act(async () => { await result.current.setDaily(8); });
    const before = result.current.coins;
    await act(async () => { await result.current.spend('Test', 2); });
    expect(result.current.coins).toBe(before - 2);
    expect(result.current.spent.length).toBe(1);
  });
});
