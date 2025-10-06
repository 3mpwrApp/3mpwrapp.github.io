#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const changelogPath = path.join(root, 'docs', 'CHANGELOG.md');
const outPathTs = path.join(root, 'data', 'whatsnew.auto.ts');

// Simple, local-only plain-language pass for user-facing bullets
function plainify(input) {
  if (!input) return '';
  let text = String(input);
  // Remove code ticks, markdown links, and PR refs
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  text = text.replace(/\(#\d+\)/g, '');
  // Remove conventional commit prefixes (feat:, fix:, docs:, etc.)
  text = text.replace(/^(build|chore|ci|docs|doc|feat|fix|perf|refactor|revert|style|test|tests|types|typing|deps)(\([^\)]+\))?:\s*/i, '');
  // Collapse extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  // Jargon mappings
  const map = [
    [/\bi18n\b/gi, 'translations'],
    [/\ba11y\b/gi, 'accessibility'],
    [/\bperf(ormance)?\b/gi, 'performance'],
    [/\brefactor(ed|ing)?\b/gi, 'improved'],
    [/\btelemetry\b/gi, 'analytics'],
    [/\bschema\b/gi, 'data format'],
    [/\bdeps?\b/gi, 'libraries'],
    [/\bthreshold\b/gi, 'limit'],
    [/\basync\b/gi, 'background'],
    [/\bOTA\b/gi, 'over-the-air'],
  ];
  for (const [re, repl] of map) text = text.replace(re, repl);
  // Prefer present-tense simple phrasing
  text = text.replace(/^Added\b/i, 'Add');
  text = text.replace(/^Updated\b/i, 'Update');
  text = text.replace(/^Improved\b/i, 'Improve');
  text = text.replace(/^Fixed\b/i, 'Fix');
  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);
  // Keep it short and simple
  const MAX = 200;
  if (text.length > MAX) text = text.slice(0, MAX - 1).trimEnd() + '…';
  // Ensure ends with period for readability (if not punctuation)
  if (!/[.!?…]$/.test(text)) text += '.';
  return text;
}

function parseChangeLog(md) {
  const lines = md.split(/\r?\n/);
  const items = [];
  let currentDate = new Date().toISOString().slice(0, 10);
  let inSection = false;
  const devNoise = /(\b(lint|eslint|prettier|jest|test|tests|ci|build|refactor|shim|snapshot|coverage|threshold|schema|types?|typing|deps?|dependency|bump|polyfill|mock|fixture|storybook|changelog|readme|docs?)\b|\bexpo doctor\b)/i;
  const userSurface = /(Wellness|Resources|Advocacy|Settings|Notifications|What'?s New|Evidence|Deadlines|Reflections|Exercise|Profile|Home|Community|Bookmarks|Calendar|Export|Share|Accessibility|Translations?|Performance|Bug fix|Crash|Faster|Loading|Badge|Reminder|Offline|Sync|Voice|AI|Assistant|Coach|Planner|Tracker|Reminder|Beta|Improved|Fixed|Added|Updated)/i;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h2 = line.match(/^##\s+(.+?)\s*(\((\d{4}-\d{2}-\d{2})\))?/);
    if (h2) {
      inSection = true;
      currentDate = h2[2] || currentDate;
      continue;
    }
    if (!inSection) continue;
    const bullet = line.match(/^\s*[-*]\s+(.+)/);
    if (bullet) {
      let text = bullet[1];
      if (!text) continue;
      // Skip dev-only bullets early (prefix) or by keyword noise
      if (/^(chore|ci|build|refactor|test|tests|deps|types|typing|release)\b/i.test(text)) continue;
      if (devNoise.test(text) && !/translations|accessibility|performance/i.test(text)) continue;
      // Ensure it's user-facing enough
      if (!userSurface.test(text)) continue;
      // Keep breaking changes but make them clear
      const isBreaking = /breaking/i.test(text);
      // Plainify for users
      let summary = plainify(text);
      // Trim lead-in scopes like "Wellness:" for title brevity but keep meaning
      summary = summary.replace(/^(Wellness|Resources|Advocacy|Settings|Notifications|Community|Home):\s*/i, '');
      // Normalize translation notices
      summary = summary.replace(/^Translations?:\s*/i, 'Improve translations: ');
      if (!summary) continue;
      const title = (isBreaking ? 'Important: ' : '') + (summary.length > 90 ? summary.slice(0, 87) + '…' : summary);
      const iso = new Date(currentDate).toISOString();
      const id = `wn-${currentDate}-${Math.abs(hashCode(title)).toString(36)}`;
      items.push({ id, title, summary, date: iso });
      if (items.length >= 50) break; // cap
    }
  }
  return items;
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function main() {
  if (!fs.existsSync(changelogPath)) {
    console.error('[whatsnew:gen] CHANGELOG.md not found at', changelogPath);
    process.exit(0);
  }
  const md = fs.readFileSync(changelogPath, 'utf8');
  const items = parseChangeLog(md);
  // Ensure output dir exists
  const outDir = path.dirname(outPathTs);
  fs.mkdirSync(outDir, { recursive: true });
  const header = `// Auto-generated from docs/CHANGELOG.md\n` +
    `// Do not edit manually. Run: npm run whatsnew:gen\n` +
    `import type { WhatsNewItem } from './whatsnew';\n`;
  const body = `\nexport const whatsnewAuto: WhatsNewItem[] = ${JSON.stringify(items, null, 2)};\n`;
  fs.writeFileSync(outPathTs, header + body, 'utf8');
  console.log(`[whatsnew:gen] Wrote ${items.length} items to ${outPathTs}`);
}

main();
