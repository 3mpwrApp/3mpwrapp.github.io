#!/usr/bin/env node

/**
 * Daily Refetch Launcher - Run at 8 PM ET
 * 
 * Automatically loads API key and starts priority refetch
 * Safe to run daily - picks up where it left off
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

console.log('\n======================================================================');
console.log('🕗 Ontario Priority Refetch - Daily Launcher');
console.log('======================================================================\n');
console.log(`📅 Date: ${new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' })}`);
console.log('🌍 Timezone: Eastern Time (ET)\n\n');

// Check for .env.local
const envPath = path.join(ROOT, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local not found');
  console.log('💡 Create it with: CANLII_API_KEY=your_key_here\n');
  process.exit(1);
}

// Load API key
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/^CANLII_API_KEY=(.+)$/m);

if (!apiKeyMatch) {
  console.log('❌ CANLII_API_KEY not found in .env.local\n');
  process.exit(1);
}

const apiKey = apiKeyMatch[1].trim();
console.log(`✅ API Key: Configured (${apiKey.length} characters)\n`);

// Check quota status (basic check - quota resets at 8 PM ET / Midnight UTC)
const now = new Date();
const hour = now.getHours();
const minute = now.getMinutes();
const etHour = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto', hour: 'numeric', hour12: false });

console.log(`🕐 Current ET time: ${etHour}:${minute.toString().padStart(2, '0')}`);

if (parseInt(etHour) < 20 && parseInt(etHour) >= 8) {
  console.log('⚠️  Warning: Running before 8 PM ET - quota may still be exhausted from earlier today\n');
} else {
  console.log('✅ Running at optimal time (after 8 PM ET - fresh quota)\n');
}

console.log('🚀 Starting priority refetch...\n');
console.log('──────────────────────────────────────────────────────────────────────\n\n');

// Spawn refetch script with API key in environment
const child = spawn('node', ['scripts/refetch-ontario-priority.js'], {
  env: { ...process.env, CANLII_API_KEY: apiKey },
  stdio: 'inherit',
  cwd: ROOT
});

child.on('exit', (code) => {
  console.log('\n──────────────────────────────────────────────────────────────────────\n');
  if (code === 0) {
    console.log('✅ Refetch completed successfully!\n');
    console.log('📋 Next Steps:');
    console.log('  1. Check output: data/tribunal-decisions/ontario-refetched-*.json');
    console.log('  2. Run analytics: node scripts/analyze-patterns.js');
    console.log('  3. Schedule next run for tomorrow 8 PM ET\n');
  } else {
    console.log(`❌ Refetch exited with code ${code}\n`);
  }
});

child.on('error', (error) => {
  console.error('❌ Failed to start refetch:', error);
  process.exit(1);
});
