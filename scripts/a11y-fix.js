#!/usr/bin/env node
/**
 * Automatically adds accessibility props to Pressable components.
 * Adds accessibilityRole="button" and hitSlop if missing.
 * 
 * Uses proper brace counting to handle arrow functions in JSX attributes.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const TARGET_DIRS = [path.join(ROOT, "app"), path.join(ROOT, "components")];
const TSX_RE = /\.tsx$/i;

function* walk(dir) {
  const entries = fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true })
    : [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (TSX_RE.test(e.name)) yield p;
  }
}

/**
 * Find the end of a JSX opening tag, properly handling nested braces/parens
 */
function findTagEnd(src, startIdx) {
  let i = startIdx;
  let braceCount = 0;
  let parenCount = 0;
  let inString = false;
  let stringChar = '';
  let escape = false;
  
  while (i < src.length) {
    const c = src[i];
    
    if (escape) {
      escape = false;
      i++;
      continue;
    }
    
    if (c === '\\') {
      escape = true;
      i++;
      continue;
    }
    
    if (inString) {
      if (c === stringChar) {
        inString = false;
      }
      i++;
      continue;
    }
    
    if (c === '"' || c === "'" || c === '`') {
      inString = true;
      stringChar = c;
      i++;
      continue;
    }
    
    if (c === '{') braceCount++;
    else if (c === '}') braceCount--;
    else if (c === '(') parenCount++;
    else if (c === ')') parenCount--;
    
    // Tag closes when we see > with balanced braces/parens
    if (c === '>' && braceCount === 0 && parenCount === 0) {
      return i;
    }
    
    // Handle self-closing />
    if (c === '/' && i + 1 < src.length && src[i + 1] === '>' && braceCount === 0 && parenCount === 0) {
      return i + 1;
    }
    
    i++;
  }
  
  return -1; // Not found
}

function fixFile(file, verbose = false) {
  let src = fs.readFileSync(file, "utf8");
  let modified = false;
  
  // Find all Pressable opening tags
  const tagStart = /<Pressable\b/g;
  let match;
  const fixes = [];
  
  while ((match = tagStart.exec(src)) !== null) {
    const startIdx = match.index;
    const tagNameEnd = startIdx + match[0].length;
    const endIdx = findTagEnd(src, tagNameEnd);
    
    if (endIdx === -1) continue;
    
    const tagContent = src.substring(startIdx, endIdx + 1);
    
    // Skip if spreads props
    if (/\{\s*\.\.\./.test(tagContent)) continue;
    
    const needsRole = !/accessibilityRole\s*=/.test(tagContent);
    const needsHitSlop = !/hitSlop\s*=/.test(tagContent);
    
    if (verbose && (needsRole || needsHitSlop)) {
      const ln = src.substring(0, startIdx).split('\n').length;
      console.log(`  Found issue at L${ln}: role=${needsRole}, hitSlop=${needsHitSlop}`);
    }
    
    if (needsRole || needsHitSlop) {
      fixes.push({
        startIdx,
        endIdx,
        tagContent,
        needsRole,
        needsHitSlop
      });
    }
  }
  
  if (verbose) {
    console.log(`  Total fixes needed: ${fixes.length}`);
  }
  
  // Apply fixes in reverse order to preserve indices
  for (let i = fixes.length - 1; i >= 0; i--) {
    const { startIdx, endIdx, tagContent, needsRole, needsHitSlop } = fixes[i];
    
    // Find the position right after <Pressable
    const insertPos = startIdx + '<Pressable'.length;
    
    // Determine indentation from the line
    const lineStart = src.lastIndexOf('\n', startIdx) + 1;
    const indent = src.substring(lineStart, startIdx).match(/^\s*/)[0];
    const propIndent = indent + '  ';
    
    // Build the props to insert
    let propsToAdd = '';
    if (needsRole) {
      propsToAdd += `\n${propIndent}accessibilityRole="button"`;
    }
    if (needsHitSlop) {
      propsToAdd += `\n${propIndent}hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`;
    }
    
    // Insert after <Pressable
    src = src.substring(0, insertPos) + propsToAdd + src.substring(insertPos);
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(file, src, "utf8");
    return true;
  }
  return false;
}

let totalFixed = 0;
const verbose = process.argv.includes('--verbose');
for (const dir of TARGET_DIRS) {
  for (const file of walk(dir)) {
    if (verbose && file.includes('ai-grounding')) {
      console.log('Processing:', file);
    }
    const isVerboseFile = verbose && file.includes('ai-grounding');
    if (fixFile(file, isVerboseFile)) {
      console.log(`Fixed: ${path.relative(ROOT, file)}`);
      totalFixed++;
    }
  }
}

console.log(`\nFixed ${totalFixed} files.`);
