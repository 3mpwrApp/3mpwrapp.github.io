const fs = require('fs');
const path = require('path');

function showError(file) {
  const s = fs.readFileSync(file, 'utf8');
  try {
    JSON.parse(s);
    console.log('OK:', file);
  } catch (e) {
    const pos = e.pos || e.position || null;
    console.error('ERROR in', file);
    console.error(String(e.message || e));
    if (pos != null) {
      const start = Math.max(0, pos - 200);
      const end = Math.min(s.length, pos + 200);
      const snippet = s.slice(start, end);
      console.error('Position:', pos);
      console.error('Snippet:\n' + snippet);
      // Also attempt to compute approximate line/col
      const before = s.slice(0, pos);
      const line = before.split(/\r?\n/).length;
      const col = pos - before.lastIndexOf('\n');
      console.error('Line:', line, 'Col:', col);
    }
  }
}

const target = process.argv[2] || 'locales/es/common.json';
showError(path.resolve(target));
