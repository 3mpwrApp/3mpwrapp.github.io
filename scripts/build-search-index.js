#!/usr/bin/env node

/**
 * Build Search Index
 * 
 * Generates a comprehensive search index for all blog posts and curated content.
 * Creates public/search-index.json with full-text searchability.
 * 
 * Features:
 * - Indexes blog posts from _posts/
 * - Indexes curated items from _curation/
 * - Indexes What's New items from _whats_new/
 * - Full-text search capability
 * - Category tagging
 * - Date sorting
 * - Metadata preservation
 * 
 * Output: public/search-index.json
 * 
 * Usage: node build-search-index.js
 */

const fs = require('fs');
const path = require('path');

function toISODate(d) {
  return d.toISOString().split('T')[0];
}

// Parse YAML frontmatter
function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0] !== '---') return { metadata: {}, content: content };

  let i = 1;
  const frontmatter = {};

  while (i < lines.length && lines[i] !== '---') {
    const line = lines[i];
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Handle quoted strings
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Parse arrays like [tag1, tag2]
        value = value
          .slice(1, -1)
          .split(',')
          .map(v => v.trim().replace(/^['"]|['"]$/g, ''));
      }

      frontmatter[key] = value;
    }
    i++;
  }

  const bodyStart = i + 1;
  const body = lines.slice(bodyStart).join('\n');

  return { metadata: frontmatter, content: body };
}

// Extract text content and strip markdown
function extractTextContent(markdown) {
  let text = markdown
    // Remove markdown links [text](url)
    .replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1')
    // Remove markdown images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^\)]*\)/g, '$1')
    // Remove markdown bold/italic
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    // Remove markdown headers
    .replace(/^#+\s+/gm, '')
    // Remove markdown code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

// Generate search index entry
function createSearchEntry(source, filename, metadata, content) {
  const url = filename
    .replace(/\.md$/, '')
    .replace(/^/, '/')
    .replace(/index$/, '');

  const textContent = extractTextContent(content);
  const excerpt = textContent.substring(0, 200);

  return {
    id: `${source}/${filename}`,
    source, // 'blog', 'curation', 'whatsnew'
    title: metadata.title || filename,
    excerpt,
    content: textContent,
    date: metadata.date || toISODate(new Date()),
    tags: Array.isArray(metadata.tags)
      ? metadata.tags
      : (metadata.tags ? [metadata.tags] : []),
    categories: Array.isArray(metadata.categories)
      ? metadata.categories
      : (metadata.categories ? [metadata.categories] : []),
    url,
    filesize: textContent.length,
  };
}

// Read all markdown files from directory
function readMarkdownFiles(dirPath, source) {
  const entries = [];

  if (!fs.existsSync(dirPath)) {
    console.log(`[search-index] Directory not found: ${dirPath}`);
    return entries;
  }

  try {
    const files = fs.readdirSync(dirPath);

    for (const filename of files) {
      if (!filename.endsWith('.md')) continue;

      const filePath = path.join(dirPath, filename);
      const stats = fs.statSync(filePath);

      if (!stats.isFile()) continue;

      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { metadata, content } = parseFrontmatter(fileContent);

        const entry = createSearchEntry(source, filename, metadata, content);
        entries.push(entry);
      } catch (e) {
        console.warn(
          `[search-index] Warning parsing ${filename}: ${e.message}`
        );
      }
    }
  } catch (e) {
    console.error(`[search-index] Error reading directory ${dirPath}: ${e.message}`);
  }

  return entries;
}

// Create full-text search index
function createSearchIndex(entries) {
  const index = {
    version: '1.0.0',
    generated: toISODate(new Date()),
    totalDocuments: entries.length,
    documents: entries,
    // For quick lookups
    titleIndex: {},
    tagIndex: {},
    categoryIndex: {},
  };

  // Build reverse indices
  for (const doc of entries) {
    // Title index
    const titleWords = doc.title.toLowerCase().split(/\s+/);
    for (const word of titleWords) {
      if (!index.titleIndex[word]) {
        index.titleIndex[word] = [];
      }
      index.titleIndex[word].push(doc.id);
    }

    // Tag index
    for (const tag of doc.tags) {
      const tagLower = tag.toLowerCase();
      if (!index.tagIndex[tagLower]) {
        index.tagIndex[tagLower] = [];
      }
      index.tagIndex[tagLower].push(doc.id);
    }

    // Category index
    for (const category of doc.categories) {
      const categoryLower = category.toLowerCase();
      if (!index.categoryIndex[categoryLower]) {
        index.categoryIndex[categoryLower] = [];
      }
      index.categoryIndex[categoryLower].push(doc.id);
    }
  }

  return index;
}

// Write search index to file
function writeSearchIndex(index, outputPath) {
  try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), 'utf8');
    console.log(`[search-index] ✓ Index written to ${outputPath}`);
    console.log(
      `[search-index] Total documents indexed: ${index.totalDocuments}`
    );
    return true;
  } catch (e) {
    console.error(`[search-index] Failed to write index: ${e.message}`);
    return false;
  }
}

// Generate summary statistics
function generateSummary(index) {
  const sources = {};
  const categoryStats = {};
  const tagStats = {};

  for (const doc of index.documents) {
    // Source breakdown
    if (!sources[doc.source]) {
      sources[doc.source] = 0;
    }
    sources[doc.source]++;

    // Category breakdown
    for (const cat of doc.categories) {
      if (!categoryStats[cat]) {
        categoryStats[cat] = 0;
      }
      categoryStats[cat]++;
    }

    // Tag breakdown (top 20)
    for (const tag of doc.tags) {
      if (!tagStats[tag]) {
        tagStats[tag] = 0;
      }
      tagStats[tag]++;
    }
  }

  // Sort tags by frequency
  const topTags = Object.entries(tagStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }));

  return {
    sources,
    categories: categoryStats,
    topTags,
  };
}

// Main function
async function main() {
  console.log('[search-index] Building search index...');
  const cwd = process.cwd();

  const allEntries = [];

  // Read blog posts
  console.log('[search-index] Reading blog posts from _posts/');
  const blogEntries = readMarkdownFiles(path.join(cwd, '_posts'), 'blog');
  allEntries.push(...blogEntries);
  console.log(`[search-index]   Found ${blogEntries.length} blog posts`);

  // Read curated items
  console.log('[search-index] Reading curated items from _curation/');
  const curationEntries = readMarkdownFiles(
    path.join(cwd, '_curation'),
    'curation'
  );
  allEntries.push(...curationEntries);
  console.log(
    `[search-index]   Found ${curationEntries.length} curated items`
  );

  // Read What's New items
  console.log('[search-index] Reading What\'s New items from _whats_new/');
  const whatsnewEntries = readMarkdownFiles(
    path.join(cwd, '_whats_new'),
    'whatsnew'
  );
  allEntries.push(...whatsnewEntries);
  console.log(`[search-index]   Found ${whatsnewEntries.length} What's New items`);

  // Sort by date (newest first)
  allEntries.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  console.log(`[search-index] Total entries collected: ${allEntries.length}`);

  // Create search index
  const searchIndex = createSearchIndex(allEntries);

  // Generate summary
  const summary = generateSummary(searchIndex);

  // Write search index
  const outputPath = path.join(cwd, 'public', 'search-index.json');
  const success = writeSearchIndex(searchIndex, outputPath);

  if (success) {
    // Log summary
    console.log('[search-index] Summary:');
    console.log(`  Blog posts: ${summary.sources.blog || 0}`);
    console.log(`  Curated items: ${summary.sources.curation || 0}`);
    console.log(`  What's New: ${summary.sources.whatsnew || 0}`);
    console.log(`  Categories: ${Object.keys(summary.categories).length}`);
    console.log(`  Top tags: ${summary.topTags.map(t => t.tag).join(', ')}`);
    console.log('[search-index] ✓ Complete');
  } else {
    console.error('[search-index] ✗ Failed to complete');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[search-index] Error:', err.message);
  process.exit(1);
});
