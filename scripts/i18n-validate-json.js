// Simple JSON validation for locale files to catch malformed structures early.
// Scans locales/*/common.json and attempts a strict JSON.parse.
const fs = require('fs');
const path = require('path');

const localesDir = path.resolve(__dirname, '..', 'locales');
let hadError = false;

function validateFile(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8');
    JSON.parse(raw);
    return true;
  } catch (e) {
    console.error(`Invalid JSON: ${p}`);
    console.error(e.message);
    hadError = true;
    return false;
  }
}

const entries = fs.readdirSync(localesDir, { withFileTypes: true });
for (const ent of entries) {
  if (!ent.isDirectory()) continue;
  const file = path.join(localesDir, ent.name, 'common.json');
  if (fs.existsSync(file)) {
    validateFile(file);
  }
}

if (hadError) process.exit(1);
console.log('i18n-validate-json: OK');
