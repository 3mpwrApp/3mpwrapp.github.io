// Generates a weekly blog post from the last 7 days of the What's New collection.
// No dependencies; parses simple YAML front matter and falls back to first paragraph.
// Writes _posts/YYYY-MM-DD-weekly-update-week-NN.md if it doesn't already exist.

const fs = require('fs');
const path = require('path');

function isoDateUTC(d=new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function formatISODate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth()+1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isoWeekNumber(d) {
  // Copy date so don't modify original
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  // Thursday in current week decides the year
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(),0,4));
  const diff = date - firstThursday;
  return 1 + Math.round(diff / (7*24*60*60*1000));
}

function parseFrontMatter(src) {
  const out = { fm: {}, body: src };
  const lines = src.split(/\r?\n/);
  if (lines[0] !== '---') return out;
  let i=1; const fmLines = [];
  for (; i<lines.length; i++) {
    if (lines[i] === '---') { i++; break; }
    fmLines.push(lines[i]);
  }
  const fm = {};
  for (const line of fmLines) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) {
      const k = m[1].trim();
      let v = m[2].trim();
      v = v.replace(/^"|"$/g,'');
      fm[k] = v;
    }
  }
  out.fm = fm;
  out.body = lines.slice(i).join('\n');
  return out;
}

function firstParagraph(markdown) {
  const body = markdown.replace(/\r/g,'');
  const parts = body.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
  return parts[0] || '';
}

function safeInline(text) {
  return text.replace(/\s+/g,' ').trim();
}

(function main(){
  const repoRoot = process.cwd();
  const whatsNewDir = path.join(repoRoot, '_whats_new');
  const postsDir = path.join(repoRoot, '_posts');
  const now = isoDateUTC(new Date());
  const todayISO = formatISODate(now);
  const week = isoWeekNumber(now);
  const sevenDaysAgo = new Date(now.getTime() - 7*24*60*60*1000);

  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

  const title = `Weekly Update — Week ${String(week).padStart(2,'0')}`;
  const slug = `weekly-update-week-${String(week).padStart(2,'0')}`;
  const file = path.join(postsDir, `${todayISO}-${slug}.md`);
  if (fs.existsSync(file)) {
    console.log(`Post already exists for ${todayISO}, skipping.`);
    return;
  }

  const items = [];
  let cfg = { introText: 'Here’s what changed this week, in simple terms:', maxItems: 12 };
  const cfgPath = path.join(repoRoot, '_data', 'weekly.json');
  if (fs.existsSync(cfgPath)) {
    try { cfg = { ...cfg, ...JSON.parse(fs.readFileSync(cfgPath, 'utf8')) }; } catch(e) {}
  }
  if (fs.existsSync(whatsNewDir)) {
    const files = fs.readdirSync(whatsNewDir).filter(f=>f.endsWith('.md'));
    for (const f of files) {
      const full = path.join(whatsNewDir, f);
      try {
        const src = fs.readFileSync(full,'utf8');
        const parsed = parseFrontMatter(src);
        let d = parsed.fm.date || '';
        let t = parsed.fm.title || '';
        let desc = parsed.fm.description || '';
        if (!desc) desc = firstParagraph(parsed.body);
        if (!d) {
          // try derive from filename prefix YYYY-MM-DD
          const m = f.match(/^(\d{4}-\d{2}-\d{2})/);
          if (m) d = m[1];
        }
        if (!d || !t) continue;
        const dt = new Date(d + 'T00:00:00Z');
        if (isNaN(dt.getTime())) continue;
        if (dt >= sevenDaysAgo && dt <= now) {
          items.push({ date: d, title: t, desc: safeInline(desc) });
        }
      } catch (e) {
        console.warn('Skipping', f, e.message);
      }
    }
  }

  items.sort((a,b)=> (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const limited = items.slice(-cfg.maxItems);

  const lines = [];
  lines.push('---');
  lines.push('layout: post');
  lines.push(`title: ${title} (${todayISO})`);
  lines.push(`date: ${todayISO} 09:00:00 +0000`);
  lines.push('tags: [weekly, updates]');
  lines.push('categories: [updates]');
  lines.push('---');
  lines.push('');
  lines.push(cfg.introText);
  lines.push('');
  if (limited.length === 0) {
    lines.push('- No major changes were published this week.');
  } else {
    for (const it of limited) {
      const dash = it.desc ? ` — ${it.desc}` : '';
      lines.push(`- ${it.date}: ${it.title}${dash}`);
    }
  }
  lines.push('');
  lines.push('Want updates in your inbox? Subscribe on the Newsletter page.');
  lines.push('');

  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('Wrote', file);
})();
