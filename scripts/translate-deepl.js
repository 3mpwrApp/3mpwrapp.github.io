#!/usr/bin/env node
/**
 * TRANSLATE-DEEPL.JS
 * Translates English pages to French using DeepL API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DEEPL_API_KEY = 'ba955a40-9523-4dfe-baf0-555513b6f173:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

/**
 * Make HTTPS request to DeepL API
 */
function translateText(text, targetLang = 'FR') {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      auth_key: DEEPL_API_KEY,
      text: text,
      target_lang: targetLang,
      source_lang: 'EN',
      preserve_formatting: '1',
      tag_handling: 'html'
    }).toString();

    const options = {
      method: 'POST',
      hostname: 'api-free.deepl.com',
      path: '/v2/translate',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.translations && data.translations[0]) {
            resolve(data.translations[0].text);
          } else {
            reject(new Error('No translation returned'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Extract frontmatter and content from markdown
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: '', content: content };
  }
  return {
    frontmatter: match[1],
    content: match[2]
  };
}

/**
 * Translate frontmatter fields
 */
async function translateFrontmatter(frontmatter) {
  const lines = frontmatter.split('\n');
  const translated = [];
  let hasLang = false;

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) {
      translated.push(line);
      continue;
    }

    // Translate title, description, image_alt
    if (line.match(/^title:/)) {
      const match = line.match(/^title:\s*(.+?)\s*$/);
      const value = match ? match[1].replace(/^["']|["']$/g, '') : '';
      if (value) {
        const translatedValue = await translateText(value);
        translated.push(`title: "${translatedValue}"`);
      } else {
        translated.push(line);
      }
    } else if (line.match(/^description:/)) {
      const match = line.match(/^description:\s*(.+?)\s*$/);
      const value = match ? match[1].replace(/^["']|["']$/g, '') : '';
      if (value) {
        const translatedValue = await translateText(value);
        translated.push(`description: "${translatedValue}"`);
      } else {
        translated.push(line);
      }
    } else if (line.match(/^image_alt:/)) {
      const match = line.match(/^image_alt:\s*(.+?)\s*$/);
      const value = match ? match[1].replace(/^["']|["']$/g, '') : '';
      if (value) {
        const translatedValue = await translateText(value);
        translated.push(`image_alt: "${translatedValue}"`);
      } else {
        translated.push(line);
      }
    } else if (line.match(/^permalink:/)) {
      // Update permalink to /fr/ path
      const value = line.replace(/^permalink:\s*/, '').trim();
      if (!value.startsWith('/fr')) {
        translated.push(`permalink: /fr${value}`);
      } else {
        translated.push(line);
      }
    } else if (line.match(/^lang:/)) {
      // Change language to fr
      translated.push('lang: fr');
      hasLang = true;
    } else {
      // Keep other fields as-is
      translated.push(line);
    }
  }

  // Add lang: fr if not present
  if (!hasLang && translated.length > 0) {
    translated.splice(1, 0, 'lang: fr');
  }

  return translated.join('\n');
}

/**
 * Translate markdown content in chunks (DeepL has size limits)
 */
async function translateContent(content) {
  // Split by paragraphs to preserve structure
  const chunks = content.split(/\n\n+/);
  const translated = [];

  for (const chunk of chunks) {
    // Skip empty chunks
    if (!chunk.trim()) {
      translated.push('');
      continue;
    }

    // Skip code blocks, frontmatter, and Liquid tags
    if (chunk.match(/^```/) || chunk.match(/^---/) || chunk.match(/\{%|\{\{/)) {
      translated.push(chunk);
      continue;
    }

    // Skip HTML comments
    if (chunk.match(/^<!--/)) {
      translated.push(chunk);
      continue;
    }

    try {
      console.log(`Translating chunk (${chunk.length} chars)...`);
      const translatedChunk = await translateText(chunk);
      translated.push(translatedChunk);
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Error translating chunk: ${err.message}`);
      translated.push(chunk); // Keep original on error
    }
  }

  return translated.join('\n\n');
}

/**
 * Translate a markdown file
 */
async function translateFile(sourcePath, targetPath) {
  console.log(`\n📝 Translating: ${sourcePath}`);
  console.log(`📂 Output: ${targetPath}`);

  const content = fs.readFileSync(sourcePath, 'utf-8');
  const { frontmatter, content: body } = parseFrontmatter(content);

  console.log('🔄 Translating frontmatter...');
  const translatedFrontmatter = await translateFrontmatter(frontmatter);

  console.log('🔄 Translating content...');
  const translatedBody = await translateContent(body);

  const output = `---\n${translatedFrontmatter}\n---\n${translatedBody}`;

  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, output);
  console.log('✅ Translation complete!');
}

/**
 * Main function
 */
async function main() {
  const files = [
    // Root pages
    { source: 'index.md', target: 'fr/index.md' },
    { source: 'about.md', target: 'fr/about.md' },
    { source: 'contact.md', target: 'fr/contact.md' },
    { source: 'accessibility.md', target: 'fr/accessibility.md' },
    { source: 'privacy.md', target: 'fr/privacy.md' },
    { source: 'faq.md', target: 'fr/faq.md' },
    { source: 'roadmap.md', target: 'fr/roadmap.md' },
    { source: 'whats-new.md', target: 'fr/whats-new.md' },
    { source: 'features.md', target: 'fr/features.md' },
    
    // Subdirectory index pages
    { source: 'user-guide/index.md', target: 'fr/user-guide.md' },
    { source: 'events/index.md', target: 'fr/events/index.md' },
    { source: 'site-map/index.md', target: 'fr/site-map/index.md' },
    { source: 'wellness/index.md', target: 'fr/wellness/index.md' },
    { source: 'resources/index.md', target: 'fr/resources/index.md' },
    { source: 'community/index.md', target: 'fr/community/index.md' },
    { source: 'campaigns/index.md', target: 'fr/campaigns/index.md' },
    { source: 'connect/index.md', target: 'fr/connect/index.md' },
    { source: 'community-spotlight/index.md', target: 'fr/community-spotlight/index.md' },
    { source: 'newsletter/index.md', target: 'fr/newsletter/index.md' },
    { source: 'blog/index.md', target: 'fr/blog/index.md' },
    { source: 'terms/index.md', target: 'fr/terms/index.md' },
    { source: 'cookies/index.md', target: 'fr/cookies/index.md' },
    { source: 'privacy/index.md', target: 'fr/privacy/index.md' },
    { source: 'data-ownership/index.md', target: 'fr/data-ownership/index.md' },
    { source: 'privacy-controls/index.md', target: 'fr/privacy-controls/index.md' },
    { source: 'delete-data/index.md', target: 'fr/delete-data/index.md' },
    { source: 'beta/index.md', target: 'fr/beta/index.md' },
    { source: 'beta-guide/index.md', target: 'fr/beta-guide/index.md' },
    { source: 'search/index.md', target: 'fr/search/index.md' }
  ];

  console.log('\n🌍 DeepL Translation Script');
  console.log('═══════════════════════════════════════════════════════\n');

  for (const file of files) {
    const sourcePath = path.join(process.cwd(), file.source);
    const targetPath = path.join(process.cwd(), file.target);

    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  Source file not found: ${sourcePath}`);
      continue;
    }

    try {
      await translateFile(sourcePath, targetPath);
    } catch (err) {
      console.error(`❌ Error translating ${file.source}: ${err.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ All translations complete!\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error(`\n❌ Fatal error: ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { translateText, translateFile };
