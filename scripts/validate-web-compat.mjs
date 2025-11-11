#!/usr/bin/env node
/**
 * Web Compatibility Validator
 * 
 * Scans codebase for common web incompatibility issues:
 * - Unguarded Platform-specific APIs
 * - Missing dynamic imports for native modules
 * - Direct use of window/document without checks
 * - Unguarded Haptics usage
 * 
 * Usage: node scripts/validate-web-compat.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Patterns to check
const CHECKS = {
  // Native modules that need Platform checks or dynamic imports
  nativeModules: {
    pattern: /import\s+.*\s+from\s+['"](?:expo-haptics|expo-camera|expo-image-picker|expo-file-system|@react-native-camera-roll)['"];/g,
    message: 'Direct import of native module - should use dynamic import or Platform check',
    severity: 'warning',
  },
  
  // Direct Haptics usage without Platform check
  unguardedHaptics: {
    pattern: /Haptics\.(impact|notification|selection)Async\(/g,
    message: 'Haptics usage should be wrapped in Platform.OS check',
    severity: 'warning',
  },
  
  // Direct window/document usage without Platform check
  unguardedWebApis: {
    pattern: /\b(window|document|navigator)\./g,
    message: 'Web API usage should be wrapped in Platform.OS === "web" check',
    severity: 'info',
    // Exceptions: inside useEffect, in hooks/useFocusManagement.ts, etc.
    exceptions: ['hooks/useFocusManagement.ts', 'app/safe-landing.tsx'],
  },
  
  // React Native APIs that don't work on web
  incompatibleApis: {
    pattern: /import\s+\{[^}]*\b(Vibration|CameraRoll|PermissionsAndroid|ToastAndroid|ActionSheetIOS)\b[^}]*\}\s+from\s+['"]react-native['"];/g,
    message: 'React Native API not available on web - needs Platform check',
    severity: 'error',
  },
};

// Directories to scan
const SCAN_DIRS = ['app', 'components', 'services', 'hooks', 'store', 'context', 'utils'];

// Files to ignore
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.expo/,
  /dist/,
  /web-build/,
  /__tests__/,
  /__mocks__/,
  /\.test\./,
  /\.spec\./,
];

class WebCompatValidator {
  constructor() {
    this.issues = [];
    this.scannedFiles = 0;
  }

  shouldIgnore(filePath) {
    return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
  }

  isException(filePath, check) {
    if (!check.exceptions) return false;
    return check.exceptions.some(exc => filePath.includes(exc));
  }

  scanFile(filePath) {
    if (this.shouldIgnore(filePath)) return;
    if (!['.ts', '.tsx', '.js', '.jsx'].some(ext => filePath.endsWith(ext))) return;

    this.scannedFiles++;
    const content = readFileSync(filePath, 'utf-8');
    const relativePath = relative(rootDir, filePath);

    // Check for Platform import (if file uses Platform APIs)
    const hasPlatformImport = /import\s+\{[^}]*\bPlatform\b[^}]*\}\s+from\s+['"]react-native['"];/.test(content);

    for (const [checkName, check] of Object.entries(CHECKS)) {
      const matches = content.matchAll(check.pattern);
      
      for (const match of matches) {
        // Skip if this file is an exception for this check
        if (this.isException(relativePath, check)) continue;

        // For web API check, allow if inside Platform.OS check
        if (checkName === 'unguardedWebApis') {
          const lines = content.split('\n');
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const contextStart = Math.max(0, lineNumber - 5);
          const contextEnd = Math.min(lines.length, lineNumber + 5);
          const context = lines.slice(contextStart, contextEnd).join('\n');
          
          // Skip if already guarded
          if (/Platform\.OS\s*===?\s*['"]web['"]/.test(context) || 
              /if\s*\(\s*Platform\.OS\s*!==?\s*['"]web['"]/.test(context)) {
            continue;
          }
        }

        // For native modules, allow if dynamic import
        if (checkName === 'nativeModules') {
          const lineStart = content.lastIndexOf('\n', match.index) + 1;
          const lineEnd = content.indexOf('\n', match.index);
          const line = content.substring(lineStart, lineEnd);
          
          // Skip if it's a lazy load or inside try-catch
          if (/let\s+\w+\s*:\s*any\s*;\s*try/.test(line) || 
              /await\s+import/.test(line) ||
              /require\(['"]expo-/.test(line)) {
            continue;
          }
        }

        this.issues.push({
          file: relativePath,
          line: content.substring(0, match.index).split('\n').length,
          severity: check.severity,
          message: check.message,
          code: match[0].substring(0, 80),
        });
      }
    }
  }

  scanDirectory(dirPath) {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (stat.isFile()) {
        this.scanFile(fullPath);
      }
    }
  }

  run() {
    console.log('🌐 Web Compatibility Validator\n');
    console.log('Scanning for web incompatibility issues...\n');

    for (const dir of SCAN_DIRS) {
      const fullPath = join(rootDir, dir);
      try {
        this.scanDirectory(fullPath);
      } catch (error) {
        console.error(`Error scanning ${dir}:`, error.message);
      }
    }

    this.printReport();
  }

  printReport() {
    console.log(`\n📊 Scan complete: ${this.scannedFiles} files scanned\n`);

    if (this.issues.length === 0) {
      console.log('✅ No web compatibility issues found!\n');
      return;
    }

    // Group by severity
    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');
    const info = this.issues.filter(i => i.severity === 'info');

    if (errors.length > 0) {
      console.log(`❌ ${errors.length} error(s):\n`);
      this.printIssues(errors);
    }

    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} warning(s):\n`);
      this.printIssues(warnings);
    }

    if (info.length > 0) {
      console.log(`ℹ️  ${info.length} info message(s):\n`);
      this.printIssues(info);
    }

    console.log('\n💡 Tips:');
    console.log('  - Wrap Platform-specific code in: if (Platform.OS !== "web") { ... }');
    console.log('  - Use dynamic imports: const Module = await import("expo-module")');
    console.log('  - Lazy load native modules: let Haptics = null; if (Platform.OS !== "web") { Haptics = require("expo-haptics"); }');
    console.log('  - Check if features are available before using: if (Haptics) { ... }');
    console.log('');

    process.exit(errors.length > 0 ? 1 : 0);
  }

  printIssues(issues) {
    // Group by file
    const byFile = {};
    for (const issue of issues) {
      if (!byFile[issue.file]) byFile[issue.file] = [];
      byFile[issue.file].push(issue);
    }

    for (const [file, fileIssues] of Object.entries(byFile)) {
      console.log(`  ${file}`);
      for (const issue of fileIssues) {
        console.log(`    Line ${issue.line}: ${issue.message}`);
        console.log(`      ${issue.code.trim()}`);
      }
      console.log('');
    }
  }
}

// Run validator
const validator = new WebCompatValidator();
validator.run();
