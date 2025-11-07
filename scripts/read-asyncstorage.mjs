#!/usr/bin/env node
/**
 * READ ASYNCSTORAGE EVENTS FROM APP
 * 
 * This script reads events from the app's AsyncStorage location
 * and displays them so we can sync them to Firestore.
 * 
 * React Native AsyncStorage typically stores in:
 * - Android: /data/data/[package]/databases/RKStorage
 * - iOS: ~/Library/Developer/CoreSimulator/Devices/[id]/data/Containers/Data/Application/[id]/Library/AsyncStorage
 * - Web: LocalStorage in browser
 */

import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║        🔍 SEARCHING FOR YOUR 3 EVENTS IN ASYNCSTORAGE      ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Try common AsyncStorage locations
const possiblePaths = [
  // Expo data directory
  join(homedir(), '.expo', 'AsyncStorage'),
  // React Native Debugger
  join(homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Local Storage'),
  // Common simulator paths
  join(homedir(), 'Library', 'Developer', 'CoreSimulator'),
];

console.log('🔍 Checking AsyncStorage locations...\n');

// Also check if running in development - can query the debugger
console.log('💡 ALTERNATIVE: Query from React Native Debugger\n');
console.log('If your app is running with React Native Debugger:');
console.log('1. Open Chrome DevTools (Cmd+Opt+I / Ctrl+Shift+I)');
console.log('2. Go to Console tab');
console.log('3. Paste this command:\n');
console.log('   AsyncStorage.getItem(\'events:local:v1\').then(d => console.log(JSON.parse(d)))\n');
console.log('4. Copy the output and send it to me\n');

console.log('══════════════════════════════════════════════════════════════\n');

// Alternative: Create a React Native helper component
console.log('📱 OR: Run this in your app\'s console:\n');
console.log('JavaScript code to add to your app temporarily:\n');
console.log(`
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this somewhere in your app (e.g., in Events screen)
const debugEvents = async () => {
  const data = await AsyncStorage.getItem('events:local:v1');
  if (data) {
    const events = JSON.parse(data);
    console.log('===== YOUR 3 EVENTS =====');
    console.log(JSON.stringify(events, null, 2));
    console.log('=========================');
  }
};

// Call it
debugEvents();
`);

console.log('\n══════════════════════════════════════════════════════════════\n');
console.log('🎯 EASIEST METHOD: Tell me your 3 event details directly:\n');
console.log('Event 1: Title, Date, Location?');
console.log('Event 2: Title, Date, Location?');
console.log('Event 3: Title, Date, Location?\n');

// Try to find Chrome storage for Expo web
const chromeStoragePath = join(
  homedir(), 
  'AppData', 
  'Local', 
  'Google', 
  'Chrome', 
  'User Data', 
  'Default', 
  'Local Storage', 
  'leveldb'
);

if (existsSync(chromeStoragePath)) {
  console.log('✅ Found Chrome LocalStorage at:', chromeStoragePath);
  console.log('   (Requires manual inspection with SQLite tools)\n');
} else {
  console.log('❌ Chrome LocalStorage not found at default location\n');
}

process.exit(0);
