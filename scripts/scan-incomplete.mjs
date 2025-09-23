#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd());
const PATTERNS = [
  /coming soon/i,
  /todo/i,
  /placeholder/i,
  /tbd/i,
  /not implemented/i
];

const results = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules','.git','build','dist'].includes(e.name)) continue;
      walk(full);
    } else if (/\.(tsx?|js|md)$/i.test(e.name)) {
      const txt = fs.readFileSync(full,'utf8');
      PATTERNS.forEach(p => {
        const m = txt.match(p);
        if (m) results.push({ file: path.relative(ROOT, full), pattern: p.toString() });
      });
    }
  }
}

walk(ROOT);

if (!results.length) {
  console.log('No incomplete placeholders detected.');
} else {
  console.log('Potential incomplete features:');
  results.forEach(r => console.log(`- ${r.file} => ${r.pattern}`));
}
