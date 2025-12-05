/**
 * Firebase Test Lab Detection & Bypass Service
 * 
 * Detects when the app is running in Firebase Test Lab / Google Play
 * Pre-launch Report Robo tests and enables automatic bypass of
 * Terms Gate and authentication for automated testing.
 */

import { Platform } from 'react-native';

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

/**
 * Firebase Test Lab Detection
 * 
 * Firebase Test Lab sets a system setting "firebase.test.lab" = "true"
 * We can detect this to auto-bypass Terms Gate for automated testing.
 * 
 * On Android, Test Lab VMs have specific characteristics:
 * 1. System setting: firebase.test.lab = true
 * 2. Test output directory exists: /sdcard/googletest/
 * 3. Specific device properties
 */
export async function isFirebaseTestLabEnvironment(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  
  try {
    // Method 1: Check via NativeModules for Settings
    const { NativeModules } = require('react-native');
    
    // Check if we're running in test mode (Detox, Robo, etc.)
    // @ts-ignore - testID environment check
    if (global.__DEV__ === false && global.__TEST_RUNNER__) {
      return true;
    }
    
    // Method 2: Check for expo-constants testEnvironment
    try {
      const Constants = require('expo-constants').default;
      if (Constants?.expoConfig?.extra?.testLab === true) {
        return true;
      }
      // Check execution environment
      if (Constants?.executionEnvironment === 'storeClient') {
        // This is a production build - could be Test Lab
        // Additional checks needed
      }
    } catch {}
    
    // Method 3: Check for the firebase test lab file marker
    // Test Lab creates files in /sdcard/googletest/
    try {
      const RNFS = require('react-native-fs');
      if (RNFS) {
        const testDir = '/sdcard/googletest';
        const exists = await RNFS.exists(testDir);
        if (exists) {
           
          console.warn('[TestLab] Firebase Test Lab directory detected');
          return true;
        }
      }
    } catch {}
    
    // Method 4: Check device info for emulator + specific test markers
    try {
      if (NativeModules?.PlatformConstants) {
        const brand = NativeModules.PlatformConstants.Brand;
        const model = NativeModules.PlatformConstants.Model;
        // Test Lab often uses specific device models
        if (brand === 'google' && (model?.includes('sdk') || model?.includes('emulator'))) {
          // Likely an emulator, could be Test Lab
          // Check for additional markers
        }
      }
    } catch {}
    
    return false;
  } catch (error) {
     
    console.warn('[TestLab] Test Lab detection error:', error);
    return false;
  }
}

/**
 * Check for Test Lab bypass via automatic detection or manual flag
 */
export async function checkTestLabBypass(): Promise<boolean> {
  try {
    // First check automatic Test Lab detection
    const isTestLab = await isFirebaseTestLabEnvironment();
    if (isTestLab) {
       
      console.warn('[TestLab] Firebase Test Lab environment detected');
      return true;
    }
    
    // Fallback: Check if manual bypass flag is set
    const bypass = await AsyncStorage?.getItem?.('empowr.testlab.bypass');
    if (bypass === 'true') {
       
      console.warn('[TestLab] Manual test bypass flag detected');
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Set the manual bypass flag (for testing purposes)
 */
export async function setTestLabBypass(enabled: boolean): Promise<void> {
  try {
    if (enabled) {
      await AsyncStorage?.setItem?.('empowr.testlab.bypass', 'true');
    } else {
      await AsyncStorage?.removeItem?.('empowr.testlab.bypass');
    }
  } catch {}
}
