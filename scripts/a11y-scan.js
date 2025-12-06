#!/usr/bin/env node
/*
  Lightweight accessibility scanner for React Native + Expo Router TSX files.
  Checks for common issues:
  - Pressable without accessibilityRole
  - Pressable without hitSlop
  - Link without accessibilityRole or asChild
*/
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const TARGET_DIRS = [path.join(ROOT, "app"), path.join(ROOT, "components")];
const TSX_RE = /\.tsx$/i;

/** @param {string} dir */
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

function scanFile(file) {
  const src = fs.readFileSync(file, "utf8");
  const issues = [];

  // Find Pressable and Link opening tags with proper brace counting
  // to handle arrow functions like () => inside attributes
  
  function findOpeningTags(src, tagName) {
    const results = [];
    const tagStart = new RegExp(`<${tagName}\\b`, 'g');
    let match;
    
    while ((match = tagStart.exec(src)) !== null) {
      const startIdx = match.index;
      let i = startIdx + match[0].length;
      let braceCount = 0;
      let parenCount = 0;
      let inString = false;
      let stringChar = '';
      let escape = false;
      
      // Find the actual closing > of the opening tag
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
          const tagContent = src.substring(startIdx, i + 1);
          const ln = src.substring(0, startIdx).split('\n').length;
          results.push({ ln, content: tagContent, startIdx });
          break;
        }
        
        // Handle self-closing />
        if (c === '/' && i + 1 < src.length && src[i + 1] === '>' && braceCount === 0 && parenCount === 0) {
          const tagContent = src.substring(startIdx, i + 2);
          const ln = src.substring(0, startIdx).split('\n').length;
          results.push({ ln, content: tagContent, startIdx });
          break;
        }
        
        i++;
      }
    }
    
    return results;
  }

  // Find all Pressable elements
  for (const { ln, content, startIdx } of findOpeningTags(src, 'Pressable')) {
    // Check for suppression comment on the same line
    const lineStart = src.lastIndexOf('\n', startIdx) + 1;
    const lineEnd = src.indexOf('\n', startIdx);
    const line = src.substring(lineStart, lineEnd === -1 ? src.length : lineEnd);
    const isSuppressed = /\/\/\s*a11y-scan:/.test(line);
    
    // Skip if component spreads props (e.g., {...props}) as caller should provide a11y props
    const spreadsPropObject = /\{\s*\.\.\.\s*props\s*\}/.test(content);
    
    if (!isSuppressed && !spreadsPropObject) {
      if (!/accessibilityRole\s*=/.test(content)) {
        issues.push({
          ln,
          msg: 'Pressable missing accessibilityRole (e.g., "button")',
        });
      }
      if (!/hitSlop\s*=/.test(content)) {
        issues.push({
          ln,
          msg: "Pressable missing hitSlop to increase touch target",
        });
      }
    }
  }

  // Find all Link elements
  for (const { ln, content, startIdx } of findOpeningTags(src, 'Link')) {
    // Check for suppression comment on the same line
    const lineStart = src.lastIndexOf('\n', startIdx) + 1;
    const lineEnd = src.indexOf('\n', startIdx);
    const line = src.substring(lineStart, lineEnd === -1 ? src.length : lineEnd);
    const isSuppressed = /\/\/\s*a11y-scan:/.test(line);
    
    if (!isSuppressed) {
      if (!/accessibilityRole\s*=/.test(content) && !/asChild/.test(content)) {
        issues.push({
          ln,
          msg: 'Link missing accessibilityRole="link" or asChild wrapper',
        });
      }
    }
  }

  return issues;
}

let total = 0;
for (const dir of TARGET_DIRS) {
  for (const file of walk(dir)) {
    const issues = scanFile(file);
    if (issues.length) {
      console.log(`\n${path.relative(ROOT, file)}`);
      for (const { ln, msg } of issues) {
        console.log(`  L${ln}: ${msg}`);
      }
      total += issues.length;
    }
  }
}

if (!total) {
  console.log("No accessibility issues detected by static scan.");
} else {
  console.log(`\nFound ${total} potential accessibility issue(s).`);
  process.exitCode = 1;
}
