#!/usr/bin/env node
/**
 * 3mpwr App - Folder Structure Validator
 * 
 * Validates the project structure against defined conventions:
 * - Naming conventions (PascalCase, camelCase, kebab-case)
 * - File placement (components/, hooks/, services/, etc.)
 * - Detects misplaced, redundant, or deprecated files
 * 
 * Usage:
 *   node scripts/validate-structure.mjs [--fix] [--verbose]
 * 
 * Options:
 *   --fix       Auto-fix simple issues (rename files, suggest moves)
 *   --verbose   Show all files, not just issues
 *   --report    Generate JSON report file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ============================================================================
// Configuration
// ============================================================================

const RULES = {
  components: {
    path: 'components',
    pattern: /^(index|[A-Z][a-zA-Z0-9]*)(\.(ios|android|web|native))?(\.(tsx?|styles\.ts))?$/,
    description: 'PascalCase.tsx or index.ts (barrel exports), platform suffixes allowed',
    extensions: ['.tsx', '.ts'],
  },
  hooks: {
    path: 'hooks',
    pattern: /^use[A-Z][a-zA-Z0-9]*(\.(ios|android|web|native))?\.tsx?$/,
    description: 'useCamelCase.ts (platform suffixes allowed)',
    extensions: ['.ts', '.tsx'],
  },
  utils: {
    path: 'utils',
    pattern: /^[a-z][a-zA-Z0-9]*\.tsx?$/,
    description: 'camelCase.ts or camelCase.tsx (if JSX)',
    extensions: ['.ts', '.tsx'],
  },
  services: {
    path: 'services',
    pattern: /^[a-z][a-zA-Z0-9]*(\.(d\.ts|ts))$/,
    description: 'camelCase.ts or camelCase.d.ts',
    extensions: ['.ts', '.d.ts'],
  },
  constants: {
    path: 'constants',
    pattern: /^([A-Z_]+|[A-Z][a-zA-Z0-9]*)\.ts$/,
    description: 'SCREAMING_SNAKE_CASE.ts or PascalCase.ts',
    extensions: ['.ts'],
  },
  types: {
    path: 'types',
    pattern: /^([A-Z][a-zA-Z0-9]*|[a-z][a-zA-Z0-9]*|[a-z][a-z0-9-]+)(\.d)?\.ts$/,
    description: 'PascalCase.ts, camelCase.ts, or kebab-case.d.ts',
    extensions: ['.ts', '.d.ts'],
  },
  scripts: {
    path: 'scripts',
    pattern: /^[a-z][a-z0-9-]*\.(m?js|ts|ps1|sh)$/,
    description: 'kebab-case.js/mjs/ts/ps1/sh',
    extensions: ['.js', '.mjs', '.ts', '.ps1', '.sh'],
  },
  tests: {
    path: '__tests__',
    pattern: /^([a-z][a-zA-Z0-9.-]*\.(test|spec)\.(tsx?|jsx?)|[A-Z][a-zA-Z0-9]*\.tsx?)$/,
    description: '*.test.ts, *.spec.ts, or PascalCase.tsx (test helpers)',
    extensions: ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx', '.ts', '.tsx'],
  },
  testHelpers: {
    path: '__tests__/helpers',
    pattern: /^[A-Z][a-zA-Z0-9]*\.tsx?$/,
    description: 'PascalCase.ts/tsx (test utilities)',
    extensions: ['.ts', '.tsx'],
  },
  testMocks: {
    path: '__tests__/mocks',
    pattern: /^[a-z][a-zA-Z0-9]*\.mock\.ts$/,
    description: 'camelCase.mock.ts',
    extensions: ['.ts', '.tsx'],
  },
  testHelpersGeneric: {
    path: '__tests__/__helpers__',
    pattern: /^[a-z][a-zA-Z0-9]*\.ts$/,
    description: 'camelCase.ts (test setup helpers)',
    extensions: ['.ts', '.tsx'],
  },
};

const IGNORED_PATHS = [
  'node_modules',
  '.git',
  '.expo',
  'dist',
  'build',
  '.next',
  'coverage',
  '.husky',
  '.vscode',
  '.idea',
  'play-store-assets',
  'i18n-auto-translated',
];

const DEPRECATED_FOLDERS = ['config', 'security'];

const ALLOWED_ROOT_FILES = [
  // Config files
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.strict.json',
  'babel.config.js',
  'metro.config.js',
  'jest.config.js',
  'jest.setup.js',
  'eslint.config.js',
  '.eslintrc.js',
  'app.json',
  'eas.json',
  'expo-env.d.ts',
  '.editorconfig',
  '.nvmrc',
  '.gitignore',
  '.gitattributes',
  '.gitleaksignore',
  '.env',
  // Firebase config
  'firebase.json',
  'google-services.json',
  'serviceAccountKey.json',
  '@3mpwrapp__empowrapp.jks',
  // Documentation
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'LICENSE.md',
  // Build artifacts (should be in .gitignore)
  'wcag-report.json',
  'i18n-baseline.json',
  'structure-report.json',
  'firestore-restore.json',
];

const TEMP_FILES_PATTERN = /^(temp-.*|.*\.tmp|tsc_.*\.txt|.*-untranslated\.csv)$/;

// ============================================================================
// Utilities
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function success(msg) {
  log(colors.green, '✓', msg);
}

function error(msg) {
  log(colors.red, '✗', msg);
}

function warning(msg) {
  log(colors.yellow, '⚠', msg);
}

function info(msg) {
  log(colors.blue, 'ℹ', msg);
}

function suggestion(msg) {
  log(colors.magenta, '💡', msg);
}

// ============================================================================
// File System Scanning
// ============================================================================

function walkDir(dir, callback, relativeTo = ROOT) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    const relativePath = path.relative(relativeTo, fullPath);
    
    // Skip ignored paths
    if (IGNORED_PATHS.some(ignored => relativePath.startsWith(ignored))) {
      continue;
    }
    
    if (file.isDirectory()) {
      walkDir(fullPath, callback, relativeTo);
    } else {
      callback(fullPath, relativePath, file);
    }
  }
}

// ============================================================================
// Validation Rules
// ============================================================================

function validateFileName(fileName, rule) {
  return rule.pattern.test(fileName);
}

function checkFileExtension(fileName, rule) {
  return rule.extensions.some(ext => fileName.endsWith(ext));
}

function getFolderForFile(filePath) {
  const parts = filePath.split(path.sep);
  
  // Check if file is in app/ (Expo Router - exempt from strict rules)
  if (parts[0] === 'app') {
    return 'app';
  }
  
  // Check for test helpers/mocks subfolders first
  if (parts[0] === '__tests__') {
    if (parts[1] === 'helpers') return '__tests__/helpers';
    if (parts[1] === 'mocks') return '__tests__/mocks';
    if (parts[1] === '__helpers__') return '__tests__/__helpers__';
  }
  
  // Check if in a known folder
  for (const [folderName, rule] of Object.entries(RULES)) {
    if (parts[0] === rule.path) {
      return rule.path;
    }
  }
  
  return parts[0];
}

function suggestCorrectFolder(fileName, currentFolder) {
  // Component files (but not test helpers)
  if (/^[A-Z][a-zA-Z0-9]*\.tsx$/.test(fileName) && currentFolder !== '__tests__') {
    return 'components';
  }
  
  // Hook files
  if (/^use[A-Z][a-zA-Z0-9]*\.tsx?$/.test(fileName)) {
    return 'hooks';
  }
  
  // Test files
  if (/\.(test|spec)\.(tsx?|jsx?)$/.test(fileName)) {
    return '__tests__';
  }
  
  // Service files
  if (/Service\.ts$/.test(fileName) || currentFolder === 'api') {
    return 'services';
  }
  
  // Util files
  if (/^[a-z][a-zA-Z0-9]*\.ts$/.test(fileName) && currentFolder === 'helpers') {
    return 'utils';
  }
  
  return null;
}

// ============================================================================
// Main Validation
// ============================================================================

function validateStructure(options = {}) {
  const { verbose = false, fix = false } = options;
  
  const issues = {
    namingViolations: [],
    misplacedFiles: [],
    deprecatedFolders: [],
    tempFiles: [],
    rootClutter: [],
  };
  
  let totalFiles = 0;
  let validFiles = 0;
  
  console.log('\n' + colors.cyan + '🔍 Validating 3mpwr App Structure...' + colors.reset + '\n');
  
  // Check for deprecated folders
  for (const folder of DEPRECATED_FOLDERS) {
    const fullPath = path.join(ROOT, folder);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      issues.deprecatedFolders.push(folder);
      warning(`Deprecated folder found: ${folder}/`);
      suggestion(`  Move contents to appropriate location and remove folder`);
    }
  }
  
  // Check root directory clutter
  const rootFiles = fs.readdirSync(ROOT);
  for (const file of rootFiles) {
    const fullPath = path.join(ROOT, file);
    if (fs.statSync(fullPath).isFile()) {
      const isAllowed = ALLOWED_ROOT_FILES.includes(file);
      const isTemp = TEMP_FILES_PATTERN.test(file);
      const isMd = file.endsWith('.md') && file !== 'README.md' && file !== 'CHANGELOG.md' && file !== 'LICENSE.md';
      
      if (isTemp) {
        issues.tempFiles.push(file);
        warning(`Temporary file in root: ${file}`);
        suggestion(`  Add to .gitignore or move to docs/`);
      } else if (isMd) {
        issues.rootClutter.push(file);
        if (verbose) {
          info(`Documentation in root: ${file} (consider moving to docs/)`);
        }
      } else if (!isAllowed && !file.startsWith('.')) {
        issues.rootClutter.push(file);
        warning(`Unexpected file in root: ${file}`);
      }
    }
  }
  
  // Walk through all files
  walkDir(ROOT, (fullPath, relativePath, file) => {
    totalFiles++;
    
    const fileName = file.name;
    const folder = getFolderForFile(relativePath);
    const rule = Object.values(RULES).find(r => r.path === folder);
    
    // Skip app/ folder (Expo Router has its own conventions)
    if (folder === 'app') {
      validFiles++;
      if (verbose) {
        success(`${relativePath} (Expo Router)`);
      }
      return;
    }
    
    // Skip if no rule for this folder
    if (!rule) {
      if (verbose) {
        info(`${relativePath} (no rule)`);
      }
      validFiles++;
      return;
    }
    
    // Check extension
    if (!checkFileExtension(fileName, rule)) {
      error(`${relativePath}`);
      error(`  Wrong extension for ${folder}/ - expected: ${rule.extensions.join(', ')}`);
      issues.namingViolations.push({ file: relativePath, reason: 'extension' });
      return;
    }
    
    // Check naming convention
    if (!validateFileName(fileName, rule)) {
      error(`${relativePath}`);
      error(`  Naming violation in ${folder}/ - expected: ${rule.description}`);
      issues.namingViolations.push({ file: relativePath, reason: 'naming' });
      return;
    }
    
    // Check if file is in correct folder
    const suggestedFolder = suggestCorrectFolder(fileName, folder);
    if (suggestedFolder && suggestedFolder !== folder) {
      warning(`${relativePath}`);
      suggestion(`  Consider moving to ${suggestedFolder}/`);
      issues.misplacedFiles.push({
        file: relativePath,
        current: folder,
        suggested: suggestedFolder,
      });
    }
    
    validFiles++;
    if (verbose) {
      success(relativePath);
    }
  });
  
  // Summary
  console.log('\n' + colors.cyan + '📊 Validation Summary' + colors.reset + '\n');
  console.log(`Total files scanned: ${totalFiles}`);
  console.log(`${colors.green}Valid files: ${validFiles}${colors.reset}`);
  
  const totalIssues = Object.values(issues).flat().length;
  
  if (totalIssues === 0) {
    console.log('\n' + colors.green + '✨ All checks passed! Structure is compliant.' + colors.reset + '\n');
    return { success: true, issues };
  }
  
  console.log(`${colors.red}Issues found: ${totalIssues}${colors.reset}\n`);
  
  // Detailed issues
  if (issues.namingViolations.length > 0) {
    console.log(colors.red + `\n❌ Naming Violations (${issues.namingViolations.length})` + colors.reset);
    issues.namingViolations.forEach(issue => {
      console.log(`   ${issue.file} (${issue.reason})`);
    });
  }
  
  if (issues.misplacedFiles.length > 0) {
    console.log(colors.yellow + `\n⚠️  Possibly Misplaced Files (${issues.misplacedFiles.length})` + colors.reset);
    issues.misplacedFiles.forEach(issue => {
      console.log(`   ${issue.file}`);
      console.log(`   ${colors.magenta}→ Suggest: ${issue.suggested}/${colors.reset}`);
    });
  }
  
  if (issues.deprecatedFolders.length > 0) {
    console.log(colors.yellow + `\n⚠️  Deprecated Folders (${issues.deprecatedFolders.length})` + colors.reset);
    issues.deprecatedFolders.forEach(folder => {
      console.log(`   ${folder}/`);
    });
  }
  
  if (issues.tempFiles.length > 0) {
    console.log(colors.yellow + `\n⚠️  Temporary Files (${issues.tempFiles.length})` + colors.reset);
    issues.tempFiles.forEach(file => {
      console.log(`   ${file}`);
    });
  }
  
  console.log('\n' + colors.cyan + '💡 Recommendations:' + colors.reset);
  console.log('   1. Fix naming violations to match conventions');
  console.log('   2. Move misplaced files to suggested locations');
  console.log('   3. Remove or archive deprecated folders');
  console.log('   4. Clean up temporary files\n');
  console.log('   Run with --report to generate JSON report\n');
  
  // Check baseline threshold
  const baseline = parseInt(process.env.STRUCTURE_VALIDATION_BASELINE || '0', 10);
  if (baseline > 0 && totalIssues <= baseline) {
    console.log(colors.yellow + `ℹ️  Total issues (${totalIssues}) within baseline threshold (${baseline})` + colors.reset);
    console.log(colors.yellow + '   Not failing due to STRUCTURE_VALIDATION_BASELINE' + colors.reset + '\n');
    return { success: true, issues, totalIssues, baseline };
  }
  
  return { success: false, issues, totalIssues };
}

// ============================================================================
// CLI
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose'),
    report: args.includes('--report'),
  };
  
  const result = validateStructure(options);
  
  if (options.report) {
    const reportPath = path.join(ROOT, 'structure-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
    info(`Report saved to: structure-report.json`);
  }
  
  process.exit(result.success ? 0 : 1);
}

main();
