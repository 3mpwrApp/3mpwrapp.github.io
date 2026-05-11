#!/usr/bin/env node

/**
 * Bluesky Auto-Poster for Daily Curation
 * Posts curated content to Bluesky account via AT Protocol
 * 
 * Environment variables:
 * - BLUESKY_HANDLE: Your Bluesky handle (e.g., 3mpwrapp.bsky.social)
 * - BLUESKY_PASSWORD: App password from Bluesky settings (NOT your main password)
 * - BLUESKY_PDS: Bluesky PDS URL (default: https://bsky.social)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const BLUESKY_HANDLE = process.env.BLUESKY_HANDLE || '3mpwrapp.bsky.social';
const BLUESKY_PASSWORD = process.env.BLUESKY_PASSWORD;
const BLUESKY_PDS = process.env.BLUESKY_PDS || 'https://bsky.social';

// Paths
const CURATION_DIR = path.join(__dirname, '..', '_curation');

let authToken = null;
let did = null;

/**
 * Smart truncate text to fit Bluesky's 300 character limit
 * Preserves whole words, handles emoji correctly, adds read-more suffix
 * 
 * @param {string} text - Text to truncate
 * @param {string|null} url - Optional URL to add as "Read more" link
 * @param {number} maxLength - Maximum character length (default: 280 for 20 char safety buffer)
 * @returns {string} Truncated text
 */
function smartTruncate(text, url = null, maxLength = 280) {
  // If text already fits, return as-is
  if (text.length <= maxLength) {
    return text;
  }

  // Calculate space needed for suffix
  const suffix = url ? `\n\n... Read more: ${url}` : '\n\n...';
  const targetLength = maxLength - suffix.length;

  if (targetLength <= 0) {
    // If suffix alone is too long, just truncate hard
    return text.substring(0, maxLength - 3) + '...';
  }

  // Find last space before target length to preserve whole words
  let truncateAt = targetLength;
  const lastSpace = text.lastIndexOf(' ', targetLength);
  
  if (lastSpace > targetLength * 0.8) {
    // Use last space if it's not too far back (at least 80% of target)
    truncateAt = lastSpace;
  }

  // Handle emoji at boundaries - they can be 2-4 bytes
  // Check if we're cutting in the middle of a multi-byte character
  const truncated = text.substring(0, truncateAt);
  
  // Verify the truncation doesn't break emoji (basic check)
  try {
    // If encoding works without issues, we're good
    Buffer.from(truncated, 'utf-8');
  } catch (e) {
    // If encoding fails, back up a few characters
    truncateAt = Math.max(0, truncateAt - 4);
  }

  return text.substring(0, truncateAt).trim() + suffix;
}

/**
 * Make HTTPS request
 */
function makeRequest(url, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : require('http');
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '3mpwrApp-Daily-Curator/1.0'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = protocol.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve({ success: true, status: res.statusCode });
          }
        } else {
          reject({
            status: res.statusCode,
            message: responseData
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Authenticate with Bluesky
 */
async function authenticate() {
  console.log('🔐 Authenticating with Bluesky...');
  
  if (!BLUESKY_PASSWORD) {
    throw new Error('❌ BLUESKY_PASSWORD not set in environment');
  }

  try {
    const response = await makeRequest(`${BLUESKY_PDS}/xrpc/com.atproto.server.createSession`, 'POST', {
      identifier: BLUESKY_HANDLE,
      password: BLUESKY_PASSWORD
    });

    if (response.accessJwt && response.did) {
      authToken = response.accessJwt;
      did = response.did;
      console.log(`✅ Authenticated as: ${response.handle}`);
      return true;
    } else {
      throw new Error('Invalid response from Bluesky');
    }
  } catch (error) {
    if (error.status === 401) {
      throw new Error('❌ Bluesky auth failed: 401 - Check BLUESKY_HANDLE and BLUESKY_PASSWORD');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error(`❌ Cannot connect to Bluesky PDS: ${BLUESKY_PDS}`);
    } else {
      throw new Error(`❌ Authentication error: ${error.message}`);
    }
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getToday() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Parse curation file and extract top items
 */
function parseCurationFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('❌ Curation file not found:', filePath);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const items = [];
  
  // Parse numbered list format: "1. [Title](URL) - Description"
  const regex = /^(\d+)\.\s+\[([^\]]+)\]\(([^)]+)\)\s*-?\s*(.*)$/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    items.push({
      number: parseInt(match[1]),
      title: match[2],
      url: match[3],
      description: match[4].trim()
    });
  }

  return items;
}

/**
 * Parse URLs and create facets for Bluesky linkification
 */
function createFacetsFromContent(content) {
  const facets = [];
  
  // Find all URLs in content
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let match;

  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[1];
    const startIndex = match.index;
    const endIndex = startIndex + url.length;

    facets.push({
      index: {
        byteStart: startIndex,
        byteEnd: endIndex
      },
      features: [
        {
          $type: 'app.bsky.richtext.facet#link',
          uri: url
        }
      ]
    });
  }

  return facets;
}

/**
 * Format content for Bluesky (max 300 characters)
 */
function formatBlueskyContent(items) {
  if (items.length === 0) {
    return null;
  }

  const today = getToday();
  const blogLink = 'https://3mpwrapp.pages.dev/blog/#curated-daily';
  
  // Build content and use smart truncation
  let content = `📰 Daily News - ${today}\n\n`;
  
  // Add top item
  const topItem = items[0];
  content += `🟢 ${topItem.title}\n\n`;
  content += `📰 All stories: ${blogLink}`;

  // Apply smart truncation with URL for full context
  return smartTruncate(content, blogLink, 300);
}

/**
 * Format content for multi-post thread on Bluesky
 */
function formatBlueskyThread(items) {
  const posts = [];
  const today = getToday();
  const blogLink = 'https://3mpwrapp.pages.dev/blog/#curated-daily';

  // First post - intro
  let firstPost = `📰 Daily News Highlights - ${today}\n\n`;
  firstPost += `${items.length} quality stories from Canada on disability rights, accessibility & workers' compensation:`;
  posts.push(firstPost);

  // Individual item posts (max 3 to avoid spam)
  const itemsToPost = items.slice(0, 3);
  itemsToPost.forEach((item, index) => {
    let post = `${index + 1}. ${item.title}\n\n${item.url}`;
    if (item.description) {
      post += `\n\n${item.description.substring(0, 150)}`;
    }
    posts.push(post);
  });

  // Final post - link to website
  let finalPost = `🔗 Read all ${items.length} stories:\n${blogLink}\n\n📖 User Guide: https://3mpwrapp.pages.dev/user-guide/\n\n#DisabilityRights #Accessibility #WorkersComp #Canada`;
  posts.push(finalPost);

  return posts;
}

/**
 * Post to Bluesky
 */
async function postToBluesky(content, replyTo = null) {
  if (!authToken || !did) {
    throw new Error('❌ Not authenticated with Bluesky');
  }

  try {
    const now = new Date().toISOString();
    
    // Check content length (Bluesky uses UTF-8 byte length)
    const byteLength = Buffer.byteLength(content, 'utf-8');
    if (byteLength > 300) {
      console.warn(`⚠️  Content exceeds 300 bytes (${byteLength}), truncating...`);
      content = content.substring(0, 280) + '...';
    }

    const facets = createFacetsFromContent(content);

    const postData = {
      $type: 'app.bsky.feed.post',
      text: content,
      createdAt: now,
      facets: facets.length > 0 ? facets : undefined
    };

    if (replyTo) {
      postData.reply = replyTo;
    }

    const response = await makeRequest(
      `${BLUESKY_PDS}/xrpc/com.atproto.repo.createRecord`,
      'POST',
      {
        repo: did,
        collection: 'app.bsky.feed.post',
        record: postData
      },
      authToken
    );

    if (response.uri && response.cid) {
      const postUrl = `https://bsky.app/profile/${BLUESKY_HANDLE}/post/${response.uri.split('/').pop()}`;
      console.log(`✅ Posted to Bluesky: ${postUrl}`);
      return {
        success: true,
        uri: response.uri,
        cid: response.cid,
        url: postUrl
      };
    } else {
      throw new Error('No URI in response');
    }
  } catch (error) {
    const errorMsg = typeof error.message === 'string' ? error.message : JSON.stringify(error);
    throw new Error(`❌ Error posting to Bluesky: ${errorMsg}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n🦋 Bluesky Auto-Poster');
  console.log(`📍 Handle: ${BLUESKY_HANDLE}`);
  console.log(`🔑 Password: ${BLUESKY_PASSWORD ? 'Set' : 'NOT SET'}\n`);

  // Check credentials
  if (!BLUESKY_PASSWORD) {
    console.warn('⚠️  BLUESKY_PASSWORD not set - skipping Bluesky posting');
    process.exit(0);
  }

  // Authenticate
  try {
    await authenticate();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  // Get today's curation
  const today = getToday();
  const curationPath = path.join(CURATION_DIR, `${today}-curation.md`);

  console.log('📂 Reading curation file...');
  const items = parseCurationFile(curationPath);
  
  if (items.length === 0) {
    console.log('⚠️  No items found in curation file');
    process.exit(0);
  }

  console.log(`✅ Found ${items.length} curated items`);

  // Format and post content
  console.log('📝 Formatting content for Bluesky...');
  const content = formatBlueskyContent(items);
  
  if (!content) {
    console.log('⚠️  Could not format content');
    process.exit(0);
  }

  console.log('\n📤 Posting to Bluesky...');
  
  try {
    const result = await postToBluesky(content);
    
    console.log('\n✅ Daily curation successfully posted to Bluesky!');
    console.log(`   ${result.url}`);
    
    // Optional: Post as thread for more content
    if (process.env.BLUESKY_THREAD === '1' && items.length > 1) {
      console.log('\n🔗 Posting thread...');
      const threadPosts = formatBlueskyThread(items);
      
      let replyTo = null;
      for (let i = 0; i < threadPosts.length; i++) {
        const post = threadPosts[i];
        const threadResult = await postToBluesky(post, replyTo);
        
        if (i === 0) {
          replyTo = {
            root: {
              uri: threadResult.uri,
              cid: threadResult.cid
            },
            parent: {
              uri: threadResult.uri,
              cid: threadResult.cid
            }
          };
        } else {
          replyTo.parent = {
            uri: threadResult.uri,
            cid: threadResult.cid
          };
        }
      }
      
      console.log('✅ Thread posted successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
