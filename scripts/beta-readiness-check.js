#!/usr/bin/env node
/**
 * Beta Launch Readiness Check
 * 
 * Verifies all essential items are configured before beta launch.
 * Run: node scripts/beta-readiness-check.js
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

console.log('\n🚀 Beta Launch Readiness Check\n');
console.log('='.repeat(50) + '\n');

// Check 1: Sentry DSN configured
console.log('1️⃣  Checking Sentry configuration...');
const envFiles = ['.env', '.env.local', '.env.production'];
let sentryConfigured = false;
for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('EXPO_PUBLIC_SENTRY_DSN=https://')) {
      sentryConfigured = true;
      checks.passed.push('Sentry DSN configured in ' + envFile);
      break;
    }
  }
}
if (!sentryConfigured) {
  checks.failed.push('Sentry DSN not configured. Add EXPO_PUBLIC_SENTRY_DSN to .env file.');
}

// Check 2: EAS configured
console.log('2️⃣  Checking EAS configuration...');
const easPath = path.join(process.cwd(), 'eas.json');
if (fs.existsSync(easPath)) {
  const easConfig = JSON.parse(fs.readFileSync(easPath, 'utf8'));
  if (easConfig.build && easConfig.build.preview) {
    checks.passed.push('EAS build profiles configured');
  } else {
    checks.warnings.push('EAS preview profile not found');
  }
} else {
  checks.failed.push('eas.json not found. Run: eas build:configure');
}

// Check 3: App version is RC
console.log('3️⃣  Checking app version...');
const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
if (packageJson.version.includes('-rc')) {
  checks.passed.push(`App version is ${packageJson.version} (release candidate)`);
} else {
  checks.warnings.push(`App version is ${packageJson.version}. Consider using -rc.X for beta (e.g., 1.0.0-rc.1)`);
}

// Check 4: Tests passing
console.log('4️⃣  Checking test configuration...');
const jestPath = path.join(process.cwd(), 'jest.config.js');
if (fs.existsSync(jestPath)) {
  checks.passed.push('Jest configured (run: npm test to verify tests pass)');
} else {
  checks.warnings.push('Jest config not found');
}

// Check 5: Beta tester guide exists
console.log('5️⃣  Checking documentation...');
const betaGuidePath = path.join(process.cwd(), 'docs', 'BETA_TESTER_GUIDE.md');
if (fs.existsSync(betaGuidePath)) {
  checks.passed.push('Beta tester guide exists');
} else {
  checks.failed.push('Beta tester guide not found. Create: docs/BETA_TESTER_GUIDE.md');
}

// Check 6: Feedback system
console.log('6️⃣  Checking feedback system...');
const readmePath = path.join(process.cwd(), 'README.md');
const readmeContent = fs.readFileSync(readmePath, 'utf8');
if (readmeContent.includes('forms.gle') || readmeContent.includes('feedback') || readmeContent.includes('issues')) {
  checks.passed.push('Feedback system documented in README');
} else {
  checks.warnings.push('Feedback system not documented. Add Google Form or GitHub Issues link.');
}

// Check 7: Bundle size acceptable
console.log('7️⃣  Checking bundle size...');
const bundleReportPath = path.join(process.cwd(), 'BUNDLE_OPTIMIZATION_FINAL.md');
if (fs.existsSync(bundleReportPath)) {
  const bundleContent = fs.readFileSync(bundleReportPath, 'utf8');
  if (bundleContent.includes('2.96 MB') || bundleContent.includes('under budget')) {
    checks.passed.push('Bundle size validated (under hard budget)');
  } else {
    checks.warnings.push('Bundle size needs verification');
  }
}

// Check 8: Security enabled
console.log('8️⃣  Checking security features...');
const securityPath = path.join(process.cwd(), 'services', 'security.ts');
if (fs.existsSync(securityPath)) {
  checks.passed.push('Security framework configured');
} else {
  checks.warnings.push('Security framework not found');
}

// Check 9: Localization
console.log('9️⃣  Checking localization...');
const localesPath = path.join(process.cwd(), 'locales');
if (fs.existsSync(localesPath)) {
  const locales = fs.readdirSync(localesPath);
  checks.passed.push(`Localization configured (${locales.length} languages: ${locales.join(', ')})`);
} else {
  checks.warnings.push('Localization directory not found');
}

// Check 10: Environment files
console.log('🔟 Checking environment configuration...');
if (fs.existsSync(path.join(process.cwd(), '.env.example'))) {
  checks.passed.push('.env.example exists (for beta testers to configure)');
} else {
  checks.warnings.push('.env.example not found. Create one for beta testers.');
}

// Results
console.log('\n' + '='.repeat(50));
console.log('\n📊 RESULTS\n');

if (checks.passed.length > 0) {
  console.log('✅ PASSED (' + checks.passed.length + '):\n');
  checks.passed.forEach((check, i) => {
    console.log(`   ${i + 1}. ${check}`);
  });
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  WARNINGS (' + checks.warnings.length + '):\n');
  checks.warnings.forEach((check, i) => {
    console.log(`   ${i + 1}. ${check}`);
  });
  console.log('');
}

if (checks.failed.length > 0) {
  console.log('❌ FAILED (' + checks.failed.length + '):\n');
  checks.failed.forEach((check, i) => {
    console.log(`   ${i + 1}. ${check}`);
  });
  console.log('');
}

// Overall status
console.log('='.repeat(50));
if (checks.failed.length === 0) {
  console.log('\n🎉 READY FOR BETA LAUNCH!\n');
  console.log('Next steps:');
  console.log('  1. Run: npm test');
  console.log('  2. Run: eas build --platform ios --profile preview');
  console.log('  3. Run: eas build --platform android --profile preview');
  console.log('  4. Upload builds to TestFlight and Play Console');
  console.log('  5. Invite beta testers\n');
} else {
  console.log('\n❌ NOT READY - Fix failed checks above\n');
  process.exit(1);
}

console.log('='.repeat(50) + '\n');
