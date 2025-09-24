#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd());
const PATTERNS = [
  { re: /coming soon/i, label: 'coming soon' },
  { re: /todo/i, label: 'todo' },
  { re: /placeholder/i, label: 'placeholder' },
  { re: /tbd/i, label: 'tbd' },
  { re: /not implemented/i, label: 'not implemented' }
];

const fileToPatterns = new Map();

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
      for (const { re, label } of PATTERNS) {
        if (re.test(txt)) {
          const rel = path.relative(ROOT, full).replace(/\\/g,'/');
          if (!fileToPatterns.has(rel)) fileToPatterns.set(rel, new Set());
          fileToPatterns.get(rel).add(label);
        }
      }
    }
  }
}

walk(ROOT);

// args
const SOFT = process.argv.includes('--soft');
const mdIdx = process.argv.indexOf('--md');
const jsonIdx = process.argv.indexOf('--json');
const mdOut = mdIdx !== -1 ? process.argv[mdIdx + 1] : null;
const jsonOut = jsonIdx !== -1 ? process.argv[jsonIdx + 1] : null;

const results = Array.from(fileToPatterns.entries()).map(([file, pats]) => ({ file, patterns: Array.from(pats) }));

if (!results.length) {
  console.log('No incomplete placeholders detected.');
  process.exit(0);
} else {
  // optional outputs
  if (jsonOut) {
    const payload = { count: results.length, results };
    fs.mkdirSync(path.dirname(jsonOut), { recursive: true });
    fs.writeFileSync(jsonOut, JSON.stringify(payload, null, 2));
    console.log(`Wrote JSON report: ${jsonOut}`);
  }
  if (mdOut) {
    const groups = new Map();
    for (const r of results) {
      const top = r.file.split('/')[0];
      if (!groups.has(top)) groups.set(top, []);
      groups.get(top).push(r);
    }
    const lines = [];
    lines.push(`# Unfinished Work Report`);
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');
    lines.push(`Total files flagged: ${results.length}`);
    lines.push('');
    const order = Array.from(groups.keys()).sort();
    for (const key of order) {
      lines.push(`## ${key}`);
      const items = groups.get(key).sort((a,b)=>a.file.localeCompare(b.file));
      for (const r of items) {
        lines.push(`- \`${r.file}\`: ${r.patterns.join(', ')}`);
      }
      lines.push('');
    }
    fs.mkdirSync(path.dirname(mdOut), { recursive: true });
    fs.writeFileSync(mdOut, lines.join('\n'));
    console.log(`Wrote Markdown report: ${mdOut}`);
  }

  // console summary
  console.log('Potential incomplete features:');
  results.forEach(r => console.log(`- ${r.file} => ${r.patterns.join(', ')}`));
  if (!SOFT) process.exit(1);
}
