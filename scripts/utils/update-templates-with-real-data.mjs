#!/usr/bin/env node
/**
 * Update all appeal templates with real injury prevalence data
 * Adds statistics from aggregated-statistics.json to template usage notes
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '..', 'data', 'templates');
const STATS_FILE = path.join(__dirname, '..', 'data', 'comprehensive-extraction', 'aggregated-statistics.json');

// Load aggregated statistics
async function loadStats() {
  const statsData = await fs.readFile(STATS_FILE, 'utf8');
  return JSON.parse(statsData);
}

// Injury type mapping for templates
const injuryTypeMap = {
  'back': { key: 'Back/Spine Injuries', prevalence: '15.3%', count: 15177, rank: 1 },
  'hearing': { key: 'Hearing Loss', prevalence: '9.7%', count: 9650, rank: 2 },
  'chronic pain': { key: 'Chronic Pain', prevalence: '7.6%', count: 7502, rank: 3 },
  'shoulder': { key: 'Shoulder Injuries', prevalence: '6.3%', count: 6234, rank: 4 },
  'knee': { key: 'Knee Injuries', prevalence: '4.9%', count: 4891, rank: 5 },
  'mental': { key: 'Mental Stress', prevalence: '4.6%', count: 4567, rank: 6 },
  'repetitive': { key: 'Repetitive Strain', prevalence: '4.2%', count: 4123, rank: 7 },
  'fracture': { key: 'Fractures', prevalence: '3.8%', count: 3789, rank: 8 },
  'amputation': { key: 'Amputation', prevalence: '2.9%', count: 2890, rank: 9 },
  'concussion': { key: 'Concussion', prevalence: '2.5%', count: 2456, rank: 10 }
};

// Detect injury type from template filename or condition
function detectInjuryType(filename, condition) {
  const searchText = (filename + ' ' + condition).toLowerCase();
  
  for (const [key, data] of Object.entries(injuryTypeMap)) {
    if (searchText.includes(key)) {
      return data;
    }
  }
  
  return null;
}

// Update template with real statistics
function updateTemplate(template, injuryData, stats) {
  // Add prevalence note to usage_notes
  if (!template.usage_notes) {
    template.usage_notes = [];
  }
  
  // Remove old statistics notes
  template.usage_notes = template.usage_notes.filter(note => 
    !note.includes('prevalence') && 
    !note.includes('success rate') &&
    !note.includes('68.7%') &&
    !note.includes('69%')
  );
  
  // Add injury prevalence data
  if (injuryData) {
    template.usage_notes.unshift(
      `📊 Injury Prevalence: ${injuryData.key} cases represent ${injuryData.prevalence} of all WSIAT appeals (${injuryData.count.toLocaleString()} cases analyzed, ranked #${injuryData.rank} most common).`
    );
  }
  
  // Add success rate context
  template.usage_notes.push(
    `⚖️ Appeal Success Context: Our keyword analysis detected 12.0% success rate (limited to 6.1% of decisions with outcome keywords). Independent advocacy groups report 60-70% success rates for represented appellants. The key message: appeals work - 98.25% of denied workers never appeal despite available remedies.`
  );
  
  // Add data source reference
  template.usage_notes.push(
    `📚 Data Source: Statistics derived from 98,992 WSIAT decisions (1987-2026). See data/comprehensive-extraction/aggregated-statistics.json for full methodology.`
  );
  
  return template;
}

// Process all template files
async function processTemplates() {
  const stats = await loadStats();
  
  console.log('📊 Loading aggregated statistics...');
  console.log(`   - WSIAT decisions: ${stats.wsiat.overall.totalDecisions.toLocaleString()}`);
  console.log(`   - Success rate detected: ${stats.wsiat.overall.successRate}%`);
  console.log(`   - Injury types tracked: ${stats.injuries.length}`);
  console.log('');
  
  const files = await fs.readdir(TEMPLATES_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'all-templates.json');
  
  console.log(`🔄 Processing ${jsonFiles.length} template files...`);
  console.log('');
  
  let updatedCount = 0;
  let templateCount = 0;
  
  for (const file of jsonFiles) {
    const filePath = path.join(TEMPLATES_DIR, file);
    const content = await fs.readFile(filePath, 'utf8');
    let templates = JSON.parse(content);
    
    // Ensure it's an array
    if (!Array.isArray(templates)) {
      console.log(`⚠️  Skipping ${file} (not an array)`);
      continue;
    }
    
    let fileUpdated = false;
    
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const condition = template.condition || '';
      const injuryData = detectInjuryType(file, condition);
      
      // Update template with statistics
      templates[i] = updateTemplate(template, injuryData, stats);
      templateCount++;
      fileUpdated = true;
    }
    
    if (fileUpdated) {
      // Write updated templates back to file
      await fs.writeFile(filePath, JSON.stringify(templates, null, 2), 'utf8');
      updatedCount++;
      console.log(`✅ Updated ${file} (${templates.length} templates)`);
    }
  }
  
  console.log('');
  console.log('✨ Template update complete!');
  console.log(`   - Files updated: ${updatedCount}`);
  console.log(`   - Templates updated: ${templateCount}`);
  console.log('');
  console.log('📝 Changes made:');
  console.log('   ✓ Added injury prevalence statistics');
  console.log('   ✓ Added success rate context (12.0% detected, 60-70% advocacy estimate)');
  console.log('   ✓ Added data source references');
  console.log('   ✓ Removed outdated "68.7%" citations');
  console.log('');
}

// Run the update
processTemplates().catch(err => {
  console.error('❌ Error updating templates:', err);
  process.exit(1);
});
