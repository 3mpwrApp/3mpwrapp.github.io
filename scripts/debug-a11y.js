const fs = require('fs');
const path = require('path');

// Read from absolute path like the fix script does
const ROOT = process.cwd();
const file = path.join(ROOT, 'app', '(tabs)', 'wellness', 'ai-grounding.tsx');
console.log('Reading from:', file);
const src = fs.readFileSync(file, 'utf8');

function findTagEnd(src, startIdx) {
  let i = startIdx;
  let braceCount = 0;
  let parenCount = 0;
  let inString = false;
  let stringChar = '';
  let escape = false;
  
  while (i < src.length) {
    const c = src[i];
    
    if (escape) { escape = false; i++; continue; }
    if (c === '\\') { escape = true; i++; continue; }
    
    if (inString) {
      if (c === stringChar) { inString = false; }
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
    
    if (c === '>' && braceCount === 0 && parenCount === 0) { return i; }
    if (c === '/' && i + 1 < src.length && src[i + 1] === '>' && braceCount === 0 && parenCount === 0) { return i + 1; }
    i++;
  }
  return -1;
}

const re = /<Pressable\b/g;
let count = 0;
let needsFix = 0;
let m;
while ((m = re.exec(src)) !== null) {
  count++;
  const ln = src.substring(0, m.index).split('\n').length;
  const endIdx = findTagEnd(src, m.index + m[0].length);
  if (endIdx === -1) {
    console.log(`L${ln}: endIdx not found`);
    continue;
  }
  const tagContent = src.substring(m.index, endIdx + 1);
  
  // Skip if spreads props (matching fix script logic)
  if (/\{\s*\.\.\./.test(tagContent)) {
    console.log(`L${ln}: skipped (spreads props)`);
    continue;
  }
  
  const needsRole = !/accessibilityRole\s*=/.test(tagContent);
  const needsHitSlop = !/hitSlop\s*=/.test(tagContent);
  if (needsRole || needsHitSlop) {
    console.log(`L${ln}: NEEDS FIX - role=${needsRole}, hitSlop=${needsHitSlop}`);
    needsFix++;
  } else {
    console.log(`L${ln}: OK`);
  }
}
console.log('Total Pressables:', count);
console.log('Needs fix:', needsFix);
