#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data/tribunal-decisions');
const tribunals = ['onwsiat', 'onsbt', 'onwsib', 'onhrt', 'onlrb', 'onca'];

console.log('🔍 Checking for corrupted JSON files...\n');

let corrupted = [];

for (const tribunal of tribunals) {
  process.stdout.write(`Checking ${tribunal}... `);
  
  const files = fs.readdirSync(dataDir)
    .filter(f => f.includes(tribunal) && f.endsWith('.json') && !f.includes('BACKUP'));
  
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
    } catch (err) {
      console.log(`\n  ❌ CORRUPTED: ${file}`);
      console.log(`     Error: ${err.message}`);
      corrupted.push({ file, error: err.message });
      continue;
    }
  }
  
  console.log('✅');
}

if (corrupted.length > 0) {
  console.log(`\n⚠️  Found ${corrupted.length} corrupted file(s):`);
  corrupted.forEach(c => console.log(`  - ${c.file}`));
  console.log('\n💡 Restoring from backup...\n');
  
  for (const c of corrupted) {
    const corruptedPath = path.join(dataDir, c.file);
    const backupPath = corruptedPath.replace('.json', '-BACKUP-NESTED.json');
    
    if (fs.existsSync(backupPath)) {
      console.log(`✅ Restoring ${c.file} from backup`);
      fs.copyFileSync(backupPath, corruptedPath);
    } else {
      console.log(`❌ No backup found for ${c.file}`);
    }
  }
} else {
  console.log('\n✅ All JSON files are valid!');
}
