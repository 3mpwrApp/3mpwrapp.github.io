#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const changelogPath = path.join(root, 'docs', 'CHANGELOG.md');
const outPath = path.join(root, 'data', 'whatsnew.auto.json');

function parseChangeLog(md) {
  const lines = md.split(/\r?\n/);
  const items = [];
  let currentDate = new Date().toISOString().slice(0, 10);
  let inSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h2 = line.match(/^##\s+(.+?)\s*(\((\d{4}-\d{2}-\d{2})\))?/);
    if (h2) {
      inSection = true;
      currentDate = h2[3] || currentDate;
      continue;
    }
    if (!inSection) continue;
    const bullet = line.match(/^\s*[-*]\s+(.+)/);
    if (bullet) {
      const text = bullet[1].replace(/`([^`]+)`/g, '$1').trim();
      if (!text) continue;
      // Skip obviously dev-only bullets
      if (/^chore:|^ci:|^docs\(changelog\)/i.test(text)) continue;
      const title = text.length > 90 ? text.slice(0, 87) + '…' : text;
      const iso = new Date(currentDate).toISOString();
      const id = `wn-${currentDate}-${Math.abs(hashCode(title)).toString(36)}`;
      items.push({ id, title, summary: text, date: iso });
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
  const outDir = path.dirname(outPath);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2));
  console.log(`[whatsnew:gen] Wrote ${items.length} items to ${outPath}`);
}

main();
