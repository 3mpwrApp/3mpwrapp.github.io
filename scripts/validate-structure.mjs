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
    pattern: /^[A-Z][a-zA-Z0-9]*\.tsx?$/,
    description: 'PascalCase.tsx',
    extensions: ['.tsx', '.ts'],
  },
  hooks: {
    path: 'hooks',
    pattern: /^use[A-Z][a-zA-Z0-9]*\.tsx?$/,
    description: 'useCamelCase.ts',
    extensions: ['.ts', '.tsx'],
  },
  utils: {
    path: 'utils',
    pattern: /^[a-z][a-zA-Z0-9]*\.ts$/,
    description: 'camelCase.ts',
    extensions: ['.ts'],
  },
  services: {
    path: 'services',
    pattern: /^[a-z][a-zA-Z0-9]*\.ts$/,
    description: 'camelCase.ts',
    extensions: ['.ts'],
  },
  constants: {
    path: 'constants',
    pattern: /^([A-Z_]+|[A-Z][a-zA-Z0-9]*)\.ts$/,
    description: 'SCREAMING_SNAKE_CASE.ts or PascalCase.ts',
    extensions: ['.ts'],
  },
  types: {
    path: 'types',
    pattern: /^[A-Za-z][a-zA-Z0-9]*\.ts$/,
    description: 'PascalCase.ts or camelCase.ts',
    extensions: ['.ts', '.d.ts'],
  },
  scripts: {
    path: 'scripts',
    pattern: /^[a-z][a-z0-9-]*\.(m?js|ts)$/,
    description: 'kebab-case.js/mjs/ts',
    extensions: ['.js', '.mjs', '.ts'],
  },
  tests: {
    path: '__tests__',
    pattern: /^[a-z][a-zA-Z0-9.-]*\.(test|spec)\.(tsx?|jsx?)$/,
    description: '*.test.ts or *.spec.ts',
    extensions: ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'],
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
  // Documentation
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'LICENSE.md',
  // Build artifacts (should be in .gitignore)
  'wcag-report.json',
  'i18n-baseline.json',
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
  
  // Check if in a known folder
  for (const [folderName, rule] of Object.entries(RULES)) {
    if (parts[0] === rule.path) {
      return rule.path;
    }
  }
  
  return parts[0];
}

function suggestCorrectFolder(fileName, currentFolder) {
  // Component files
  if (/^[A-Z][a-zA-Z0-9]*\.tsx$/.test(fileName)) {
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
