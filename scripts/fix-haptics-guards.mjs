#!/usr/bin/env node
/**
 * Fix Haptics Platform Guards
 * 
 * Automatically adds Platform.OS checks to Haptics usage
 * for better web compatibility.
 * 
 * This script:
 * 1. Finds all Haptics imports
 * 2. Converts to lazy-load pattern
 * 3. Adds Platform checks before usage
 * 
 * Run: node scripts/fix-haptics-guards.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const FILES_TO_FIX = [
  'components/CopilotSuggestionBanner.tsx',
  'components/VoiceFirstButton.tsx',
  'components/PanicButton.tsx',
  'services/ambience.ts',
  'services/celebrations.ts',
  'hooks/useDwellClick.ts',
];

const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Haptics Platform Guard Fixer\n');
if (DRY_RUN) {
  console.log('⚠️  DRY RUN MODE - No files will be modified\n');
}

let filesModified = 0;
let filesSkipped = 0;

for (const file of FILES_TO_FIX) {
  const filePath = join(rootDir, file);
  console.log(`Processing: ${file}`);
  
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let modified = false;

    // Check if file has direct Haptics import
    const hasDirectImport = /import \* as Haptics from ['"]expo-haptics['"];?/.test(content);
    
    if (hasDirectImport) {
      console.log('  ✓ Found direct Haptics import');
      
      // Replace import with lazy-load pattern
      content = content.replace(
        /import \* as Haptics from ['"]expo-haptics['"];?\s*/,
        `// Lazy-load Haptics only on native platforms
let Haptics: any = null;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch {
    // Haptics not available
  }
}

`
      );
      
      // Ensure Platform is imported
      if (!/import.*Platform.*from ['"]react-native['"]/.test(content)) {
        // Add Platform import at the top after other imports
        const importMatch = content.match(/^import .* from ['"].*['"];?\s*/m);
        if (importMatch) {
          const insertPos = importMatch.index + importMatch[0].length;
          content = content.slice(0, insertPos) + 
                    "import { Platform } from 'react-native';\n" +
                    content.slice(insertPos);
        }
      }
      
      modified = true;
      console.log('  ✓ Converted to lazy-load pattern');
    }

    // Add Platform checks around Haptics usage (if not already guarded)
    const hapticsCallPattern = /(Haptics\.(impact|notification|selection)Async\([^)]*\))/g;
    let match;
    let addedGuards = 0;

    // Simple check: if there's no "Platform.OS" near the Haptics call, wrap it
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line has Haptics call
      if (/Haptics\.(impact|notification|selection)Async/.test(line)) {
        // Check if already guarded (look 5 lines back for Platform check)
        const contextStart = Math.max(0, i - 5);
        const context = lines.slice(contextStart, i + 1).join('\n');
        
        if (!/Platform\.OS/.test(context)) {
          // Not guarded - add guard
          const indent = line.match(/^(\s*)/)[1];
          newLines.push(`${indent}if (Haptics && Platform.OS !== 'web') {`);
          newLines.push(line);
          newLines.push(`${indent}}`);
          addedGuards++;
          modified = true;
          continue;
        }
      }
      
      newLines.push(line);
    }
    
    if (addedGuards > 0) {
      content = newLines.join('\n');
      console.log(`  ✓ Added ${addedGuards} Platform guard(s)`);
    }

    if (modified) {
      if (!DRY_RUN) {
        writeFileSync(filePath, content, 'utf-8');
        console.log('  ✅ File updated');
      } else {
        console.log('  ✅ Would update file (dry run)');
      }
      filesModified++;
    } else {
      console.log('  ℹ️  No changes needed');
      filesSkipped++;
    }
    
    console.log('');
  } catch (error) {
    console.error(`  ❌ Error processing file: ${error.message}\n`);
  }
}

console.log('Summary:');
console.log(`  Modified: ${filesModified}`);
console.log(`  Skipped: ${filesSkipped}`);
console.log(`  Total: ${FILES_TO_FIX.length}\n`);

if (DRY_RUN) {
  console.log('Run without --dry-run to apply changes');
} else {
  console.log('✅ Complete! Run `npm run web:validate` to verify fixes.');
}
