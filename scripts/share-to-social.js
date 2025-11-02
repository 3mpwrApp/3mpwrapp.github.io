#!/usr/bin/env node

/**
 * 3mpwrApp Social Media Sharing Script
 * 
 * Automatically posts blog articles and curated content to social media.
 * Supports X (Twitter), Instagram, Facebook, and Mastodon.
 * 
 * Social Media Handles:
 * - X (Twitter): @3mpowrApp0816
 * - Instagram: @3mpwrapp
 * - Facebook: facebook.com/3mpowrapp/
 * - Mastodon: [mastodon.social/@3mpwrapp]
 * 
 * Post types:
 * - Daily curated news items
 * - What's New promotions
 * - Weekly recaps
 * - 3mpwrApp feature articles
 * 
 * Each post includes:
 * - Title/headline
 * - Short description
 * - Direct link to the article/post
 * - Relevant hashtags
 * - Platform-specific formatting
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const siteConfig = require('./site-config');

// Configuration
const CONFIG = {
  baseUrl: siteConfig.url,
  socialHandles: {
    x: '@3mpowrApp0816',
    instagram: '@3mpwrapp',
    facebook: 'facebook.com/3mpowrapp',
    mastodon: 'mastodon.social/@3mpwrapp',
    github: '@3mpwrApp'
  },
  hashtags: {
    general: '#3mpwrApp #DisabilityRights #InjuredWorkers #A11y #DisabilityCommunity',
    news: '#DisabilityNews #WorkersComp #Canada #AccessibilityMatters',
    feature: '#3mpwrApp #Features #DisabilityTech #Accessibility',
    whatsnew: '#WhatsNew #Community #DisabilitySupport #CanadaWide'
  }
};

/**
 * Reads blog posts from the _posts directory
 */
function getBlogPosts(limit = 5) {
  try {
    const postsDir = path.join(process.cwd(), '_posts');
    if (!fs.existsSync(postsDir)) {
      console.log('[social] No _posts directory found');
      return [];
    }

    const files = fs.readdirSync(postsDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, limit);

    const posts = files.map(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (!match) return null;

      const frontmatter = match[1];
      const titleMatch = frontmatter.match(/title:\s*"?([^"\n]*)"?/i);
      const dateMatch = frontmatter.match(/date:\s*([^\n]*)/i);
      const excerptMatch = frontmatter.match(/excerpt:\s*"?([^"\n]*)"?/i);
      const categoryMatch = frontmatter.match(/categories:\s*\[(.*?)\]/i);

      const date = dateMatch ? new Date(dateMatch[1].split('T')[0]) : new Date();
      const slug = file.replace('.md', '');
      
      // Generate correct Jekyll permalink format for posts in _posts directory
      // Format: /YYYY/MM/DD/title-without-date/
      // Example: 2025-10-29-feature-spotlight-dyslexia-support-mode.md -> /2025/10/29/feature-spotlight-dyslexia-support-mode/
      let postPath;
      const datePrefix = slug.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
      if (datePrefix) {
        // Post has date prefix in filename (standard Jekyll _posts format)
        const [, year, month, day, title] = datePrefix;
        postPath = `/${year}/${month}/${day}/${title}/`;
      } else {
        // Fallback for posts without date prefix (shouldn't happen in _posts)
        postPath = `/blog/${slug}/`;
      }

      return {
        filename: file,
        title: titleMatch ? titleMatch[1] : 'Untitled',
        date: date,
        excerpt: excerptMatch ? excerptMatch[1] : '',
        category: categoryMatch ? categoryMatch[1].split(',')[0].trim() : 'news',
        slug: slug,
        url: `${CONFIG.baseUrl}${postPath}`,
        type: determinPostType(slug)
      };
    }).filter(p => p !== null);

    return posts;
  } catch (e) {
    console.error('[social] Error reading blog posts:', e.message);
    return [];
  }
}

/**
 * Determines the post type from slug
 */
function determinPostType(slug) {
  if (slug.includes('weekly-recap')) return 'weekly-recap';
  if (slug.includes('3mpwrapp')) return 'feature';
  if (slug.includes('daily-curation')) return 'curated-news';
  return 'general';
}

/**
 * Generates X (Twitter) post - 280 characters max
 */
function generateXPost(post) {
  const maxLength = 280;
  let text;

  switch (post.type) {
    case 'feature':
      text = `🎯 New: ${post.title}\n\n${post.excerpt || 'Check out the latest'}\n\n${CONFIG.hashtags.feature}\n\n${post.url}`;
      break;
    case 'weekly-recap':
      text = `📋 Weekly Recap: Top stories from the disability community across Canada\n\n${CONFIG.hashtags.whatsnew}\n\n${post.url}`;
      break;
    case 'curated-news':
      text = `📰 Daily Curated News: Latest updates affecting injured workers & persons with disabilities\n\n${CONFIG.hashtags.news}\n\n${post.url}`;
      break;
    default:
      text = `✅ ${post.title}\n\n${CONFIG.hashtags.general}\n\n${post.url}`;
  }

  // Truncate to fit
  if (text.length > maxLength) {
    const urlLength = post.url.length;
    const overhead = 30; // Space for URL and spacing
    const availableLength = maxLength - urlLength - overhead;
    text = `${post.title.substring(0, availableLength)}...\n\n${post.url}`;
  }

  return text;
}

/**
 * Generates Instagram post - formatted with line breaks and hashtags
 */
function generateInstagramPost(post) {
  let caption = '';

  switch (post.type) {
    case 'feature':
      caption = `🚀 ${post.title}\n\n${post.excerpt || 'Check out what\'s new'}\n\nLink in bio 🔗\n\n${CONFIG.hashtags.feature}`;
      break;
    case 'weekly-recap':
      caption = `📊 Weekly Recap\n\nCatch up on top stories from the disability community across Canada.\n\nLink in bio 🔗\n\n${CONFIG.hashtags.whatsnew}`;
      break;
    case 'curated-news':
      caption = `📰 Daily News Update\n\nStay informed about programs, policies, and support for injured workers & persons with disabilities.\n\nLink in bio 🔗\n\n${CONFIG.hashtags.news}`;
      break;
    default:
      caption = `✨ ${post.title}\n\nRead more → ${post.url}\n\n${CONFIG.hashtags.general}`;
  }

  return caption;
}

/**
 * Generates Facebook post - allows for longer format
 */
function generateFacebookPost(post) {
  let text = '';

  switch (post.type) {
    case 'feature':
      text = `🎯 **${post.title}**\n\n${post.excerpt || 'Check out the latest feature'}\n\n[Read the full article](${post.url})\n\n${CONFIG.hashtags.feature}`;
      break;
    case 'weekly-recap':
      text = `📋 **Weekly Recap** 📋\n\nTop stories from across Canada affecting the disability community:\n\n✅ Latest policy updates\n✅ Community highlights\n✅ Resources and support\n\n[Read this week's recap](${post.url})\n\n${CONFIG.hashtags.whatsnew}`;
      break;
    case 'curated-news':
      text = `📰 **Daily Curated News** 📰\n\nInformed by 26 Canadian news sources covering:\n\n✅ Workers compensation\n✅ Disability programs\n✅ Accessibility updates\n✅ Community news\n\n[See today's curated stories](${post.url})\n\n${CONFIG.hashtags.news}`;
      break;
    default:
      text = `✅ ${post.title}\n\n${post.excerpt || ''}\n\n[Read more](${post.url})\n\n${CONFIG.hashtags.general}`;
  }

  return text;
}

/**
 * Generates Mastodon post - 500 character limit
 */
function generateMastodonPost(post) {
  let text;

  switch (post.type) {
    case 'feature':
      text = `🎯 ${post.title}\n\n${post.excerpt}\n\n${post.url}\n\n${CONFIG.hashtags.feature}`;
      break;
    case 'weekly-recap':
      text = `📋 Weekly Recap: Top stories from the disability community across Canada\n\n${post.url}\n\n${CONFIG.hashtags.whatsnew}`;
      break;
    case 'curated-news':
      text = `📰 Daily Curated News: Latest updates for injured workers & persons with disabilities\n\n${post.url}\n\n${CONFIG.hashtags.news}`;
      break;
    default:
      text = `✅ ${post.title}\n\n${post.url}\n\n${CONFIG.hashtags.general}`;
  }

  // Truncate to 500 chars if needed
  if (text.length > 500) {
    text = text.substring(0, 497) + '...';
  }

  return text;
}

/**
 * Formats posts for all platforms
 */
function formatPostsForSocialMedia(posts) {
  const formatted = [];

  for (const post of posts) {
    const socialPost = {
      title: post.title,
      slug: post.slug,
      date: post.date,
      url: post.url,
      type: post.type,
      platforms: {
        x: generateXPost(post),
        instagram: generateInstagramPost(post),
        facebook: generateFacebookPost(post),
        mastodon: generateMastodonPost(post)
      }
    };

    formatted.push(socialPost);
  }

  return formatted;
}

/**
 * Saves social media posts to a file for reference
 */
function saveSocialPosts(posts) {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    fs.mkdirSync(publicDir, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(publicDir, `social-posts-${timestamp}.json`);

    const output = {
      generated: new Date().toISOString(),
      baseUrl: CONFIG.baseUrl,
      socialHandles: CONFIG.socialHandles,
      posts: posts,
      instructions: {
        x: 'Copy each post and share via https://x.com/3mpowrApp0816',
        instagram: 'Copy caption and share on https://instagram.com/3mpwrapp',
        facebook: 'Copy text and share on facebook.com/3mpowrapp',
        mastodon: 'Copy post and share on https://mastodon.social/@3mpwrapp'
      }
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`[social] Saved social media posts to ${outputPath}`);

    return outputPath;
  } catch (e) {
    console.error('[social] Error saving social posts:', e.message);
    return null;
  }
}

/**
 * Creates a shareable summary with links
 */
function generateShareSummary(posts) {
  let summary = `# Social Media Share Summary\n\n`;
  summary += `Generated: ${new Date().toISOString()}\n\n`;
  summary += `## Sharing Instructions\n\n`;
  summary += `### Social Media Handles\n`;
  summary += `- **X (Twitter):** ${CONFIG.socialHandles.x}\n`;
  summary += `- **Instagram:** ${CONFIG.socialHandles.instagram}\n`;
  summary += `- **Facebook:** ${CONFIG.socialHandles.facebook}\n`;
  summary += `- **Mastodon:** ${CONFIG.socialHandles.mastodon}\n\n`;

  summary += `## Posts to Share\n\n`;

  posts.forEach((post, idx) => {
    summary += `### ${idx + 1}. ${post.title}\n`;
    summary += `- **Type:** ${post.type}\n`;
    summary += `- **URL:** ${post.url}\n\n`;

    summary += `#### X (Twitter)\n\`\`\`\n${post.platforms.x}\n\`\`\`\n\n`;
    summary += `#### Instagram\n\`\`\`\n${post.platforms.instagram}\n\`\`\`\n\n`;
    summary += `#### Facebook\n\`\`\`\n${post.platforms.facebook}\n\`\`\`\n\n`;
    summary += `#### Mastodon\n\`\`\`\n${post.platforms.mastodon}\n\`\`\`\n\n`;
    summary += `---\n\n`;
  });

  return summary;
}

/**
 * Main function
 */
async function main() {
  console.log('[social-share] Starting social media post generation...\n');

  // Get recent posts
  const posts = getBlogPosts(5);
  if (posts.length === 0) {
    console.log('[social-share] No blog posts found to share');
    return;
  }

  console.log(`[social-share] Found ${posts.length} posts to share:\n`);
  posts.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.title} (${p.type})`);
  });
  console.log('');

  // Format for all platforms
  const socialPosts = formatPostsForSocialMedia(posts);

  // Save posts
  saveSocialPosts(socialPosts);

  // Generate summary
  const summary = generateShareSummary(socialPosts);
  const summaryPath = path.join(process.cwd(), 'public', `social-posts-summary-${new Date().toISOString().split('T')[0]}.md`);
  fs.writeFileSync(summaryPath, summary, 'utf8');
  console.log(`[social-share] ✅ Generated social media posts for ${posts.length} articles`);
  console.log(`[social-share] Summary saved to: ${summaryPath}\n`);

  // Print sample
  console.log('[social-share] Sample X Post (first article):\n');
  console.log('---');
  console.log(socialPosts[0].platforms.x);
  console.log('---\n');

  console.log('[social-share] ✅ Ready to share! Copy posts from the generated files.');
}

main().catch(err => {
  console.error('[social-share] Error:', err.message);
  process.exit(1);
});
