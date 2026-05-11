#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, '_posts');

function listTargetFiles() {
  const files = fs.readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.md'))
    .filter((name) => (
      name.includes('dev-update') ||
      name.includes('dev-diary') ||
      name.includes('weekly-update-week-')
    ))
    .map((name) => path.join(POSTS_DIR, name));

  return files;
}

function replaceMojibake(text) {
  const replacements = [
    [/â€™/g, "'"],
    [/â€˜/g, "'"],
    [/â€œ/g, '"'],
    [/â€\x9d/g, '"'],
    [/â€”/g, '-'],
    [/â€“/g, '-'],
    [/â€¦/g, '...'],
    [/Ã¢â‚¬"/g, '-'],
    [/Ã¢â‚¬\"/g, '"'],
    [/Ã¢â‚¬â„¢/g, "'"],
    [/Ã¢â‚¬Å“/g, '"'],
    [/Ã¢â‚¬\x9d/g, '"'],
    [/Â/g, ''],
    [/Ã/g, ''],
    [/¢/g, ''],
    [/‚/g, ''],
    [/€|â‚¬/g, ''],
    [/âœ¨/g, ''],
    [/ðŸ”§/g, ''],
    [/âš™ï¸/g, ''],
    [/ðŸ§ /g, ''],
    [/ðŸ“±/g, ''],
    [/ðŸ“¬/g, ''],
    [/ðŸ’¬/g, ''],
    [/ðŸš€/g, ''],
    [/ðŸ“š/g, ''],
    [/ðŸ¤–/g, ''],
    [/ðŸŽ‰/g, ''],
    [/ðŸ™/g, ''],
    [/ðŸ†•/g, ''],
    [/ðŸ—‘/g, ''],
    [/ðŸ“–/g, ''],
    [/ðŸ§ª/g, ''],
    [/ðŸ”’/g, ''],
    [/ðŸ“„/g, ''],
    [/ðŸ”/g, ''],
    [/âœ…/g, ''],
    [/âŒ/g, ''],
    [/â­️?/g, ''],
    [/Ã¯¸/g, ''],
    [/ï¸/g, '' ]
  ];

  let output = text;
  for (const [pattern, value] of replacements) {
    output = output.replace(pattern, value);
  }
  return output;
}

function removeEmoji(text) {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u2600-\u27BF]/g, '');
}

function enforceAscii(text) {
  return text.replace(/[^\x00-\x7F]/g, '');
}

function normalizeWhitespace(text) {
  return text
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trimEnd() + '\n';
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = original;

  updated = replaceMojibake(updated);
  updated = removeEmoji(updated);
  updated = enforceAscii(updated);
  updated = normalizeWhitespace(updated);

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
  }

  return false;
}

function main() {
  const targets = listTargetFiles();
  let changed = 0;

  for (const filePath of targets) {
    const didChange = processFile(filePath);
    if (didChange) {
      changed += 1;
      console.log(`updated ${path.relative(ROOT, filePath)}`);
    }
  }

  console.log(`processed ${targets.length} files; updated ${changed}`);
}

main();
