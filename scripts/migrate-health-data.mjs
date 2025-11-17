#!/usr/bin/env node

/**
 * Health Tracker Data Migration Script
 *
 * Migrates existing symptom/pain/chronic/rehab/pacing data to unified health tracker format.
 * Run this script before deploying the unified health tracker.
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock AsyncStorage for Node.js environment
const mockAsyncStorage = {
  data: {},
  getItem: async (key) => mockAsyncStorage.data[key] || null,
  setItem: async (key, value) => { mockAsyncStorage.data[key] = value; },
  removeItem: async (key) => { delete mockAsyncStorage.data[key]; },
  getAllKeys: async () => Object.keys(mockAsyncStorage.data),
};

// Load existing data (in real app, this would use actual AsyncStorage)
async function loadExistingData() {
  const data = {};

  // Load symptom tracker data
  const symptomData = await mockAsyncStorage.getItem('empowr.symptomEntries');
  if (symptomData) {
    data.symptomEntries = JSON.parse(symptomData);
  }

  // Load pain forecast data
  const painForecast = await mockAsyncStorage.getItem('empowr.painForecast');
  if (painForecast) {
    data.painForecast = JSON.parse(painForecast);
  }

  // Load chronic tracker data (from Firestore simulation)
  const chronicData = await mockAsyncStorage.getItem('empowr.chronicEntries');
  if (chronicData) {
    data.chronicEntries = JSON.parse(chronicData);
  }

  // Load rehab tracker data
  const rehabData = await mockAsyncStorage.getItem('empowr.rehabProgress');
  if (rehabData) {
    data.rehabProgress = JSON.parse(rehabData);
  }

  // Load pacing data
  const pacingData = await mockAsyncStorage.getItem('empowr.pacingData');
  if (pacingData) {
    data.pacingData = JSON.parse(pacingData);
  }

  return data;
}

// Transform data to unified format
function transformData(existingData) {
  const unifiedData = {
    version: '1.0',
    migratedAt: new Date().toISOString(),
    symptoms: [],
    chronic: [],
    rehab: [],
    pacing: [],
    forecasts: [],
  };

  // Transform symptom entries
  if (existingData.symptomEntries) {
    unifiedData.symptoms = existingData.symptomEntries.map(entry => ({
      id: entry.id || `symptom_${Date.now()}_${Math.random()}`,
      date: entry.date,
      pain: entry.pain,
      symptoms: entry.symptoms,
      impact: entry.impact,
      meds: entry.meds,
      tags: entry.tags,
      flareStatus: entry.flareStatus,
      flareIntensity: entry.flareIntensity,
      flareTrigger: entry.flareTrigger,
      source: 'symptom_tracker',
      migrated: true,
    }));
  }

  // Transform chronic entries
  if (existingData.chronicEntries) {
    unifiedData.chronic = existingData.chronicEntries.map(entry => ({
      id: entry.id || `chronic_${Date.now()}_${Math.random()}`,
      date: entry.date,
      symptom: entry.symptom,
      severity: entry.severity,
      trigger: entry.trigger,
      accommodations: entry.accommodations,
      notes: entry.notes,
      source: 'chronic_tracker',
      migrated: true,
    }));
  }

  // Transform rehab data
  if (existingData.rehabProgress) {
    unifiedData.rehab = existingData.rehabProgress.map(entry => ({
      id: entry.id || `rehab_${Date.now()}_${Math.random()}`,
      date: entry.date,
      walk: entry.walk,
      grip: entry.grip,
      painFree: entry.painFree,
      note: entry.note,
      frequency: entry.frequency,
      timesPerDay: entry.timesPerDay,
      reminderTime: entry.reminderTime,
      source: 'rehab_tracker',
      migrated: true,
    }));
  }

  // Transform pacing data
  if (existingData.pacingData) {
    unifiedData.pacing = existingData.pacingData.map(entry => ({
      id: entry.id || `pacing_${Date.now()}_${Math.random()}`,
      date: entry.date,
      activity: entry.activity,
      minutes: entry.minutes,
      intensity: entry.intensity,
      painLevel: entry.painLevel,
      fatigueLevel: entry.fatigueLevel,
      notes: entry.notes,
      source: 'pacing_partner',
      migrated: true,
    }));
  }

  // Transform pain forecast data
  if (existingData.painForecast) {
    unifiedData.forecasts = existingData.painForecast.map(forecast => ({
      id: forecast.id || `forecast_${Date.now()}_${Math.random()}`,
      date: forecast.date,
      avg7d: forecast.avg7d,
      trend: forecast.trend,
      tips: forecast.tips,
      next3d: forecast.next3d,
      source: 'pain_forecast',
      migrated: true,
    }));
  }

  return unifiedData;
}

// Save migrated data
async function saveMigratedData(unifiedData) {
  const key = 'empowr.healthTracker.v1';

  await mockAsyncStorage.setItem(key, JSON.stringify(unifiedData));
  console.log(`✅ Migrated data saved to ${key}`);

  return unifiedData;
}

// Create backup of original data
async function createBackup(existingData) {
  const backupKey = `empowr.healthTracker.backup.${Date.now()}`;
  const backupData = {
    timestamp: new Date().toISOString(),
    originalData: existingData,
  };

  await mockAsyncStorage.setItem(backupKey, JSON.stringify(backupData));
  console.log(`📦 Backup created: ${backupKey}`);

  return backupKey;
}

// Main migration function
async function migrateHealthTrackerData() {
  console.log('🚀 Starting Health Tracker Data Migration...');

  try {
    // Load existing data
    console.log('📖 Loading existing data...');
    const existingData = await loadExistingData();
    console.log(`📊 Found data for ${Object.keys(existingData).length} trackers`);

    // Create backup
    console.log('💾 Creating backup...');
    const backupKey = await createBackup(existingData);

    // Transform data
    console.log('🔄 Transforming data to unified format...');
    const unifiedData = transformData(existingData);

    // Save migrated data
    console.log('💾 Saving migrated data...');
    await saveMigratedData(unifiedData);

    // Summary
    console.log('✅ Migration completed successfully!');
    console.log(`   📊 Symptoms: ${unifiedData.symptoms.length}`);
    console.log(`   📊 Chronic: ${unifiedData.chronic.length}`);
    console.log(`   📊 Rehab: ${unifiedData.rehab.length}`);
    console.log(`   📊 Pacing: ${unifiedData.pacing.length}`);
    console.log(`   📊 Forecasts: ${unifiedData.forecasts.length}`);
    console.log(`   📦 Backup: ${backupKey}`);

    return { success: true, unifiedData, backupKey };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Export for use in app
export { migrateHealthTrackerData };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateHealthTrackerData()
    .then(result => {
      console.log('Migration result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}