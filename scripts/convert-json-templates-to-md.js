#!/usr/bin/env node
/**
 * Bulk JSON Template to Markdown Converter
 * Converts 50+ JSON appeal templates to Jekyll-ready markdown files
 * 
 * Usage: node scripts/convert-json-templates-to-md.js
 * 
 * Author: 3mpwrApp
 * Date: April 2026
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '../data/templates');
const OUTPUT_DIR = path.join(__dirname, '../data/templates/generated');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Injury type to title mapping
const INJURY_TO_TITLE = {
  'ankle': 'Ankle Injury',
  'arm': 'Arm Injury',
  'arthritis': 'Arthritis',
  'back-injury': 'Back Injury',
  'brain-injury': 'Brain Injury / TBI',
  'cancer': 'Occupational Cancer',
  'carpal-tunnel': 'Carpal Tunnel Syndrome',
  'cervical': 'Cervical Spine Injury',
  'chronic-fatigue': 'Chronic Fatigue Syndrome',
  'chronic-pain': 'Chronic Pain',
  'concussion': 'Concussion / TBI',
  'depression': 'Depression',
  'dermatitis': 'Occupational Dermatitis',
  'disability': 'General Disability',
  'disc-herniation': 'Disc Herniation',
  'disc': 'Disc Injury',
  'fibromyalgia': 'Fibromyalgia',
  'foot': 'Foot Injury',
  'fracture': 'Fracture',
  'hand': 'Hand Injury',
  'headache': 'Chronic Headaches',
  'hearing-loss': 'Hearing Loss',
  'herniated-disc': 'Herniated Disc',
  'hip': 'Hip Injury',
  'impairment': 'Permanent Impairment Rating',
  'knee-injury': 'Knee Injury',
  'knee': 'Knee Injury',
  'low-back': 'Low Back Pain',
  'lumbar': 'Lumbar Spine Injury',
  'meniscus': 'Meniscus Tear',
  'mental-health': 'Mental Health',
  'ms': 'Multiple Sclerosis',
  'neck': 'Neck Injury',
  'nerve-damage': 'Nerve Damage',
  'neuropathy': 'Peripheral Neuropathy',
  'osteoarthritis': 'Osteoarthritis',
  'post-traumatic-stress': 'Post-Traumatic Stress',
  'ptsd': 'PTSD',
  'respiratory': 'Respiratory Illness',
  'rotator-cuff': 'Rotator Cuff Tear',
  'shoulder-injury': 'Shoulder Injury',
  'shoulder': 'Shoulder Injury',
  'spine': 'Spine Injury',
  'sprain': 'Sprain',
  'strain': 'Strain',
  'stress': 'Work-Related Stress',
  'tear': 'Tendon/Ligament Tear',
  'tendinitis': 'Tendinitis',
  'tendinosis': 'Tendinosis',
  'wrist': 'Wrist Injury'
};

/**
 * Convert JSON template to markdown with Jekyll frontmatter
 */
function convertJSONToMarkdown(jsonPath) {
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const basename = path.basename(jsonPath, '-templates.json');
  const title = INJURY_TO_TITLE[basename] || basename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Generate permalink
  const permalink = `/templates/${basename}-appeal/`;
  
  // Build markdown content
  let markdown = `---
layout: default
title: ${title} Appeal Template - Free WSIB Appeal Letter
description: Fill-in-the-blank appeal template for WSIB ${title.toLowerCase()} denials. Professional legal arguments based on tribunal decision analysis.
permalink: ${permalink}
categories: [templates, wsib, appeals]
tags: [${basename}, appeal-template, wsib-denial]
generated: true
source: json
---

# ${title} Appeal Template

**USE THIS TEMPLATE TO APPEAL WSIB DENIAL OF ${title.toUpperCase()} CLAIM**

This template addresses common denial patterns for ${title.toLowerCase()} claims based on analysis of tribunal decisions.

**📋 INSTRUCTIONS:**
1. Fill in all [BRACKETS] with your specific information
2. Delete sections that don't apply to your case
3. Attach supporting documents (medical records, imaging reports, work task descriptions)
4. Send to: WSIAT, 505 University Avenue, 7th Floor, Toronto, ON M5G 2P1
5. Keep a copy for your records

---

## APPEAL TO WSIAT - ${title.toUpperCase()} CLAIM

**Worker Name:** [Your Full Legal Name]  
**WSIB Claim Number:** [Your claim number]  
**Date of Injury/Onset:** [Date]  
**Date of WSIB Denial:** [Date of denial]  
**Employer:** [Employer name]  
**Occupation:** [Your job title]

**Date of This Appeal:** [Today's date]

---

## I. GROUNDS FOR APPEAL

I am appealing the WSIB decision dated [DATE] which denied my claim for ${title.toLowerCase()}.

**Primary Denial Reason:** [Copy reason from denial letter]

### The Decision is Wrong Because:

`;

  // Add sections from JSON data
  if (jsonData.common_denials) {
    markdown += `## II. ADDRESSING WSIB'S DENIAL REASONS\n\n`;
    jsonData.common_denials.forEach((denial, idx) => {
      markdown += `### ${idx + 1}. ${denial.pattern || 'Denial Pattern'}\n\n`;
      markdown += `**WSIB Claims:** ${denial.claim || '[Describe WSIB\'s claim]'}\n\n`;
      markdown += `**The Evidence Shows:** ${denial.counter || '[Your counter-argument]'}\n\n`;
    });
  }

  if (jsonData.key_arguments) {
    markdown += `\n## III. KEY LEGAL ARGUMENTS\n\n`;
    jsonData.key_arguments.forEach((arg, idx) => {
      markdown += `### ${idx + 1}. ${arg.title || 'Legal Argument'}\n\n`;
      markdown += `${arg.content || ''}\n\n`;
    });
  }

  if (jsonData.evidence_checklist) {
    markdown += `\n## IV. EVIDENCE CHECKLIST\n\n`;
    markdown += `### Medical Evidence Required:\n\n`;
    jsonData.evidence_checklist.forEach(item => {
      markdown += `- [ ] ${item}\n`;
    });
    markdown += `\n`;
  }

  // Add standard sections
  markdown += `
## V. CONCLUSION

For the reasons stated above, I respectfully request that WSIAT:

1. **Allow my appeal** and find that my ${title.toLowerCase()} is work-related
2. **Order WSIB to accept my claim** for ${title.toLowerCase()}
3. **Award full benefits** including:
   - Loss of earnings (LOE) benefits
   - Non-economic loss (NEL) benefits (if applicable)
   - Healthcare benefits (all treatment, medication, therapy)
   - Future economic loss (FEL) if permanently disabled

I am available for a hearing and will provide any additional evidence requested.

---

**Signature:** _________________________  
**Date:** _________________________

---

## APPENDIX: Supporting Documents

- [ ] Medical records from treating physician
- [ ] Imaging reports (X-ray, MRI, CT scan)
- [ ] Specialist reports
- [ ] Job description / physical demands analysis
- [ ] Witness statements from coworkers
- [ ] Timeline of symptoms and treatment
- [ ] Pre-injury functional baseline evidence

---

**📧 Need Help?** Email empowrapp08162025@gmail.com or visit [3mpwrapp.pages.dev/research](https://3mpwrapp.pages.dev/research/) for more resources.

**💡 Pro Tip:** Consider getting help from:
- [Legal Aid Ontario](https://www.legalaid.on.ca) - Community legal clinics (free, income-qualified)
- [Ontario Network of Injured Workers Groups](https://oniwg.ca) - Peer support
- Private lawyer specializing in WSIB appeals (if you can afford)

---

*This template is based on analysis of thousands of tribunal decisions. It is not legal advice. Consider consulting with a legal professional for your specific case.*
`;

  return { markdown, permalink, title, basename };
}

/**
 * Main conversion process
 */
function main() {
  console.log('🔄 JSON Template to Markdown Converter');
  console.log('=====================================\n');

  const jsonFiles = fs.readdirSync(TEMPLATES_DIR)
    .filter(f => f.endsWith('-templates.json') && !f.startsWith('all-') && !f.startsWith('templates-summary'));

  console.log(`Found ${jsonFiles.length} JSON template files\n`);

  const converted = [];
  const index = [];

  jsonFiles.forEach(file => {
    try {
      const jsonPath = path.join(TEMPLATES_DIR, file);
      const { markdown, permalink, title, basename } = convertJSONToMarkdown(jsonPath);
      
      const outputPath = path.join(OUTPUT_DIR, `${basename}-appeal.md`);
      fs.writeFileSync(outputPath, markdown, 'utf8');
      
      converted.push(file);
      index.push({ title, permalink, basename });
      
      console.log(`✅ ${file} → ${basename}-appeal.md`);
    } catch (error) {
      console.error(`❌ Error converting ${file}:`, error.message);
    }
  });

  // Generate index file
  const indexPath = path.join(OUTPUT_DIR, '_index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

  console.log(`\n✅ Converted ${converted.length}/${jsonFiles.length} templates`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📋 Index: ${indexPath}`);
  console.log('\n🚀 Next Steps:');
  console.log('1. Review generated templates in data/templates/generated/');
  console.log('2. Move to main templates directory: mv data/templates/generated/*.md data/templates/');
  console.log('3. Update research.md to link to new templates');
  console.log('4. Commit and deploy');
}

main();
