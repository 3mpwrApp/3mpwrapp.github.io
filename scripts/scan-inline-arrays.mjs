#!/usr/bin/env node
/**
 * Scan for large inline arrays outside of data/ folders to catch candidates for JSON assets.
 * Heuristic: flag arrays with > 50 elements or object literals with > 30 properties directly assigned to const/let at module scope.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const EXCLUDE_DIRS = new Set(['node_modules','.git','.expo','android','ios','.vscode','dist','build']);
const DATA_DIR_NAMES = new Set(['data','assets','locales']);
const EXTENSIONS = new Set(['.ts','.tsx','.js','.jsx']);

let issues = [];

function shouldSkipDir(name) {
  if (EXCLUDE_DIRS.has(name)) return true;
  return false;
}

function isDataPath(p) {
  return p.split(path.sep).some(seg => DATA_DIR_NAMES.has(seg));
}

function scanFile(file) {
  const src = fs.readFileSync(file,'utf8');
  // crude heuristics to avoid a full parser: look for large array literals or object literals at top-level const/let
  const lines = src.split(/\r?\n/);
  for (let i=0;i<lines.length;i++) {
    const line = lines[i];
    if (/^\s*(export\s+)?(const|let)\s+\w+\s*=\s*\[/.test(line)) {
      // collect until matching ]
      let depth = 0; let count = 0; let j=i;
      for (; j<lines.length; j++) {
        const L = lines[j];
        for (const ch of L) {
          if (ch === '[') depth++;
          else if (ch === ']') depth--;
        }
        // naive element count: commas at depth 1
        if (depth >= 1) count += (L.match(/,/g) || []).length;
        if (depth <= 0) break;
      }
      if (count >= 50) {
        issues.push({ file, line: i+1, kind: 'array', count });
      }
      i = j;
    } else if (/^\s*(export\s+)?(const|let)\s+\w+\s*=\s*\{/.test(line)) {
      // collect until matching }
      let depth = 0; let props = 0; let j=i;
      for (; j<lines.length; j++) {
        const L = lines[j];
        for (const ch of L) {
          if (ch === '{') depth++;
          else if (ch === '}') depth--;
        }
        if (depth === 1) props += (L.match(/:\s*/g) || []).length;
        if (depth <= 0) break;
      }
      if (props >= 30) {
        issues.push({ file, line: i+1, kind: 'object', count: props });
      }
      i = j;
    }
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (shouldSkipDir(e.name) || isDataPath(p)) continue;
      walk(p);
    } else if (e.isFile()) {
      const ext = path.extname(e.name);
      if (!EXTENSIONS.has(ext)) continue;
      scanFile(p);
    }
  }
}

walk(ROOT);

if (issues.length) {
  console.log('Large inline structures detected (consider moving to JSON assets):');
  for (const it of issues) {
    console.log(` - ${path.relative(ROOT, it.file)}:${it.line}  (${it.kind} ~ ${it.count} entries)`);
  }
  process.exitCode = 0; // soft gate: report but do not fail
} else {
  console.log('No large inline arrays/objects found outside data folders.');
}
