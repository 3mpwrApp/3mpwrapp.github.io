/**
 * Script to replace console.error with errorLogger across the codebase
 * Run: node scripts/replace-console-errors.js
 */

const fs = require('fs');
const path = require('path');

const glob = require('glob');

// Files to update
const patterns = [
  'app/**/*.{ts,tsx}',
  'components/**/*.{ts,tsx}',
  'context/**/*.{ts,tsx}',
];

// Patterns to replace
const replacements = [
  {
    // Pattern: console.error('[ComponentName] message:', error);
    regex: /console\.error\('\[([^\]]+)\]\s+([^']+):', error\);/g,
    replacement: "logError('$1', '$2', error);"
  },
  {
    // Pattern: console.error('[ComponentName] message:', error);
    regex: /console\.error\("\[([^\]]+)\]\s+([^"]+):", error\);/g,
    replacement: "logError('$1', '$2', error);"
  },
  {
    // Pattern: console.error('message', error);
    regex: /console\.error\('([^']+)',\s*error\);/g,
    replacement: "errorLogger.error('$1', error);"
  },
  {
    // Pattern: console.warn(...
    regex: /console\.warn\(/g,
    replacement: "errorLogger.warn("
  },
];

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file needs import
  const needsImport = content.includes('console.error') || content.includes('console.warn');
  const hasImport = content.includes('errorLogger') || content.includes('logError');

  if (needsImport && !hasImport) {
    // Add import after other imports
    const importMatch = content.match(/(import .+ from .+;\n)+/);
    if (importMatch) {
      const lastImportEnd = importMatch[0].length;
      content = content.slice(0, lastImportEnd) + 
                "import { errorLogger, logError } from '../../utils/errorLogger';\n" +
                content.slice(lastImportEnd);
      modified = true;
    }
  }

  // Apply replacements
  for (const { regex, replacement } of replacements) {
    const before = content;
    content = content.replace(regex, replacement);
    if (content !== before) modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log('Updated:', filePath);
  }
}

// Process files
for (const pattern of patterns) {
  const files = glob.sync(pattern, { ignore: ['node_modules/**', '__tests__/**'] });
  files.forEach(updateFile);
}

console.log('Done!');
