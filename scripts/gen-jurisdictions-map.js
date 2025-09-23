#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname,'..','data','jurisdictions');
const target = path.join(DIR,'index.ts');

const files = fs.readdirSync(DIR).filter(f=> f.endsWith('.json'));
files.sort();

const imports = files.map(f=> `import ${path.basename(f,'.json')} from './${f}';`).join('\n');
const mapEntries = files.map(f=> `  ${path.basename(f,'.json')}: ${path.basename(f,'.json')} as JurisdictionData,`).join('\n');
const codesArray = files.map(f=> `'${path.basename(f,'.json')}'`).join(',');

const out = `import type { JurisdictionData } from '../../types/jurisdiction';\n${imports}\n\nconst MAP: Record<string, JurisdictionData> = {\n${mapEntries}\n};\n\nfunction load(code: string): JurisdictionData | null {\n  return MAP[code.toUpperCase()] || null;\n}\n\nexport const ALL_JURISDICTION_CODES = [${codesArray}];\n\nexport function getJurisdiction(code: string): JurisdictionData | null {\n  return load(code.toUpperCase());\n}\n\nexport function listJurisdictions(): JurisdictionData[] {\n  return ALL_JURISDICTION_CODES.map(c => load(c)).filter(Boolean) as JurisdictionData[];\n}\n`;

fs.writeFileSync(target, out);
console.log(`Regenerated jurisdictions index with ${files.length} entries.`);
