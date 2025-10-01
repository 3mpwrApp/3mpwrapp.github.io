const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'locales', 'es', 'common.json');
const s = fs.readFileSync(file, 'utf8');
console.log('len', s.length);
try {
  JSON.parse(s);
  console.log('OK: JSON parsed successfully');
} catch (e) {
  console.log('ERR:', e.message);
  const m = /position (\d+)/.exec(e.message);
  if (m) {
    const i = Number(m[1]);
    const start = Math.max(0, i - 120);
    const end = Math.min(s.length, i + 120);
    const context = s.slice(start, end);
    console.log('Context around position', i, ':');
    console.log(context.replace(/\n/g, '\n'));
  }
}
