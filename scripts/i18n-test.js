#!/usr/bin/env node
const { execSync } = require('child_process');
function run(cmd){console.log('> '+cmd);execSync(cmd,{stdio:'inherit'});} 
run('node ./scripts/i18n-diff.js');
run('node ./scripts/i18n-threshold.js');
run('node ./scripts/i18n-assert-clean.js');
console.log('i18n test sequence complete');
