/**
 * Dyslexia Settings Smoke Test
 * 
 * Tests dyslexia support settings:
 * - Applying presets
 * - Updating individual preferences
 * - Persistence via AsyncStorage
 * - Reset functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { DYSLEXIA_PRESETS, DYSLEXIA_STORAGE_KEYS, type DyslexiaPresetKey } from '../constants/dyslexia';
import { DyslexiaProvider, useDyslexia } from '../context/DyslexiaContext';

describe('Dyslexia Settings', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('loads default preferences on mount', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DyslexiaProvider>{children}</DyslexiaProvider>
    );
    
    const { result } = renderHook(() => useDyslexia(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.preferences.font).toBe('system');
      expect(result.current.preferences.fontSize).toBe(100);
      expect(result.current.currentPreset).toBe('standard');
    });
  });

  it('applies preset and persists to storage', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DyslexiaProvider>{children}</DyslexiaProvider>
    );
    
    const { result } = renderHook(() => useDyslexia(), { wrapper });
    
    // Apply recommended preset
    await waitFor(() => result.current.applyPreset('recommended'));
    
    await waitFor(() => {
      expect(result.current.preferences.font).toBe('openDyslexic');
      expect(result.current.preferences.fontSize).toBe(120);
      expect(result.current.currentPreset).toBe('recommended');
    });
    
    // Verify persistence
    const saved = await AsyncStorage.getItem(DYSLEXIA_STORAGE_KEYS.PREFERENCES);
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved!);
    expect(parsed.font).toBe('openDyslexic');
  });

  it('updates individual preference and marks as custom', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DyslexiaProvider>{children}</DyslexiaProvider>
    );
    
    const { result } = renderHook(() => useDyslexia(), { wrapper });
    
    // Update single preference
    await waitFor(() => result.current.setPreferences({ fontSize: 150 }));
    
    await waitFor(() => {
      expect(result.current.preferences.fontSize).toBe(150);
      expect(result.current.currentPreset).toBe('custom');
    });
  });

  it('resets preferences to default', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DyslexiaProvider>{children}</DyslexiaProvider>
    );
    
    const { result } = renderHook(() => useDyslexia(), { wrapper });
    
    // Apply preset
    await waitFor(() => result.current.applyPreset('highContrast'));
    
    await waitFor(() => {
      expect(result.current.preferences.font).toBe('openDyslexic');
    });
    
    // Reset
    await waitFor(() => result.current.reset());
    
    await waitFor(() => {
      expect(result.current.preferences.font).toBe('system');
      expect(result.current.preferences.fontSize).toBe(100);
      expect(result.current.currentPreset).toBe('standard');
    });
    
    // Verify storage cleared
    const saved = await AsyncStorage.getItem(DYSLEXIA_STORAGE_KEYS.PREFERENCES);
    expect(saved).toBeNull();
  });

  it('correctly calculates isEnabled flag', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DyslexiaProvider>{children}</DyslexiaProvider>
    );
    
    const { result } = renderHook(() => useDyslexia(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isEnabled).toBe(false);
    });
    
    // Enable feature
    await waitFor(() => result.current.setPreferences({ coloredOverlay: 'cream' }));
    
    await waitFor(() => {
      expect(result.current.isEnabled).toBe(true);
    });
  });

  it('verifies all presets are valid', () => {
    const presetKeys: DyslexiaPresetKey[] = ['standard', 'recommended', 'highContrast', 'darkMode'];
    
    presetKeys.forEach(key => {
      const preset = DYSLEXIA_PRESETS[key];
      expect(preset).toBeDefined();
      expect(preset.name).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.preferences).toBeDefined();
      expect(preset.preferences.font).toBeTruthy();
      expect(preset.preferences.fontSize).toBeGreaterThanOrEqual(80);
      expect(preset.preferences.fontSize).toBeLessThanOrEqual(200);
    });
  });
});
