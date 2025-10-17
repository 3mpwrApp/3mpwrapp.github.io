// Deletes _curation/* files whose content indicates no items met threshold.
// Safe: only removes files containing the exact marker line.

const fs = require('fs');
const path = require('path');

(function main(){
  const dir = path.join(process.cwd(), '_curation');
  if (!fs.existsSync(dir)) {
    console.log('No _curation directory; nothing to clean.');
    return;
  }
  const files = fs.readdirSync(dir).filter(f=>f.endsWith('-curation.md'));
  let removed = 0;
  for (const f of files) {
    const full = path.join(dir, f);
    try {
      const txt = fs.readFileSync(full,'utf8');
      if (/^- None met the minimum score today\./m.test(txt) && !/\d+\. \[/.test(txt)) { // no numbered items
        fs.unlinkSync(full);
        removed++;
        console.log('Removed empty curation file:', f);
      }
    } catch(e){
      console.warn('Skip', f, e.message);
    }
  }
  console.log(`Cleanup complete. Removed ${removed} empty file(s).`);
})();
