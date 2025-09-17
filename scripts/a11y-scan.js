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
  const lines = src.split(/\r?\n/);
  const issues = [];

  // Simple heuristics per line
  lines.forEach((line, i) => {
    const ln = i + 1;

    // Pressable opening tag
    if (/\<Pressable(\s|>)/.test(line)) {
      if (!/accessibilityRole\s*=/.test(line)) {
        issues.push({
          ln,
          msg: 'Pressable missing accessibilityRole (e.g., "button")',
        });
      }
      if (!/hitSlop\s*=/.test(line)) {
        issues.push({
          ln,
          msg: "Pressable missing hitSlop to increase touch target",
        });
      }
    }

    // expo-router Link
    if (/\<Link(\s|>)/.test(line)) {
      if (!/accessibilityRole\s*=/.test(line) && !/asChild/.test(line)) {
        issues.push({
          ln,
          msg: 'Link missing accessibilityRole="link" or asChild wrapper',
        });
      }
    }
  });

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
