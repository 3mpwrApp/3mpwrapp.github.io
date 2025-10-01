const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'locales', 'es', 'common.json');
const raw = fs.readFileSync(file, 'utf8');

function posToLineCol(text, pos) {
  let line = 1, col = 1;
  for (let i = 0; i < pos && i < text.length; i++) {
    if (text[i] === '\n') { line++; col = 1; } else { col++; }
  }
  return { line, col };
}

try {
  JSON.parse(raw);
  console.log('JSON OK');
} catch (e) {
  console.log('Parse error:', e.message);
  const m = e.message.match(/position (\d+)/);
  if (m) {
    const pos = parseInt(m[1], 10);
    const start = Math.max(0, pos - 120);
    const end = Math.min(raw.length, pos + 120);
    const snippet = raw.slice(start, end);
    const { line, col } = posToLineCol(raw, pos);
    console.log(`At char ${pos} (line ${line}, col ${col})`);
    console.log('--- context ---');
    console.log(snippet);
    console.log('---------------');
  }
}
