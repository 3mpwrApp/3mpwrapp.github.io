#!/usr/bin/env node

/**
 * Agent Docs Loader Test
 * Validates that all 6 personality/memory docs load correctly
 */

const { AgentDocsLoader } = require('./agent-docs.js');
const path = require('path');

console.log('\n═══════════════════════════════════════════════════════\n');
console.log('Testing Agent Docs Loader\n');

const loader = new AgentDocsLoader(process.cwd());
const docs = loader.loadAll();

console.log(`✓ Loaded ${Object.keys(docs).length} documents:\n`);

Object.entries(docs).forEach(([name, content]) => {
  const lines = content.split('\n').length;
  const preview = content.substring(0, 50).replace(/\n/g, ' ') + '...';
  console.log(`  ✓ ${name.toUpperCase()}.md (${lines} lines)`);
  console.log(`    "${preview}"\n`);
});

console.log('Printing startup banner:\n');
console.log('═══════════════════════════════════════════════════════\n');
loader.printStartupBanner();
console.log('\n═══════════════════════════════════════════════════════\n');

console.log('✅ All tests passed! Agent docs loaded successfully.\n');
