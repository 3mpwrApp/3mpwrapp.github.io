// Generate social media posts from curated content
const fs = require('fs');
const path = require('path');

function toISODate(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function generateTweet(item, index, total) {
  const templates = [
    `🔥 Breaking: ${item.title}\n\n${item.description?.slice(0, 80)}...\n\n#DisabilityRights #A11y #3mpwrApp`,
    `📢 Important update for the disability community:\n\n${item.title}\n\n${item.description?.slice(0, 60)}...\n\n#DisabilityJustice #Accessibility`,
    `⚖️ Legal/Policy Update:\n\n${item.title}\n\n${item.description?.slice(0, 70)}...\n\n#HumanRights #CRPD #DisabilityLaw`,
    `🤝 Community spotlight:\n\n${item.title}\n\n${item.description?.slice(0, 75)}...\n\n#DisabilityCommunity #MutualAid`,
    `📊 Data/Research:\n\n${item.title}\n\n${item.description?.slice(0, 70)}...\n\n#DisabilityData #Research #Advocacy`
  ];
  
  const template = templates[index % templates.length];
  let tweet = template;
  
  // Ensure tweet stays under 280 characters including link
  const linkLength = 23; // Twitter's t.co link length
  const maxTextLength = 280 - linkLength - 3; // -3 for spacing and newlines
  
  if (tweet.length > maxTextLength) {
    // Truncate description further
    const baseText = tweet.replace(/\${item\.description.*?}\.\.\./, '');
    const remainingLength = maxTextLength - baseText.length - 3; // -3 for "..."
    const truncatedDesc = item.description?.slice(0, remainingLength) || '';
    tweet = baseText.replace(/\${item\.description.*?}\.\.\./, `${truncatedDesc}...`);
  }
  
  tweet += `\n\n${item.link}`;
  
  return tweet;
}

function generateMastodonPost(item, index, total) {
  const templates = [
    `🌟 Community Update:\n\n${item.title}\n\n${item.description}\n\n${item.link}\n\n#DisabilityRights #A11y #3mpwrApp #DisabilityJustice #Accessibility #HumanRights`,
    `📢 Important for disability advocates:\n\n${item.title}\n\n${item.description}\n\n${item.link}\n\n#DisabilityCommunity #Advocacy #CRPD #AccessibilityMatters #DisabilityLaw`,
    `⚡ Breaking news for our community:\n\n${item.title}\n\n${item.description}\n\n${item.link}\n\n#DisabilityNews #MutualAid #SocialJustice #Inclusion #DisabilityPride`,
    `🔍 Research & Data:\n\n${item.title}\n\n${item.description}\n\n${item.link}\n\n#DisabilityResearch #Data #Evidence #PolicyChange #SystemicChange`,
    `⚖️ Legal & Policy Update:\n\n${item.title}\n\n${item.description}\n\n${item.link}\n\n#DisabilityLaw #HumanRights #PolicyAdvocacy #LegalUpdate #UNCRPD`
  ];
  
  return templates[index % templates.length];
}

function generateLinkedInPost(item, index, total) {
  return `Professional Update: ${item.title}

${item.description}

This is relevant for disability advocates, legal professionals, and organizations working on accessibility and inclusion.

Key areas: #DisabilityRights #Accessibility #InclusiveDesign #HumanResources #LegalCompliance #PolicyAdvocacy

Link: ${item.link}

---
Stay informed with 3mpwrApp - empowering disability advocacy through technology.`;
}

function generateInstagramCaption(item, index, total) {
  return `📱 Community Update Alert!

${item.title}

${item.description?.slice(0, 100)}...

Swipe for more details and check our bio link for the full story.

#DisabilityRights #A11y #3mpwrApp #DisabilityJustice #Accessibility #InclusiveDesign #DisabilityCommunity #Advocacy #HumanRights #SocialJustice #DisabilityPride #MutualAid #Inclusion #CRPD #AccessibilityMatters`;
}

async function main() {
  const today = toISODate(new Date());
  const curationFile = path.join(process.cwd(), '_curation', `${today}-curation.md`);
  
  if (!fs.existsSync(curationFile)) {
    console.log('No curation file found for today, skipping social media generation');
    return;
  }
  
  // Read and parse the curation file
  const content = fs.readFileSync(curationFile, 'utf8');
  const lines = content.split('\n');
  
  const items = [];
  let currentItem = null;
  
  for (const line of lines) {
    const itemMatch = line.match(/^(\d+)\.\s+\[(.+?)\]\((.+?)\)/);
    if (itemMatch) {
      if (currentItem) {
        items.push(currentItem);
      }
      currentItem = {
        index: parseInt(itemMatch[1]),
        title: itemMatch[2],
        link: itemMatch[3],
        description: '',
        score: 0
      };
    } else if (currentItem && line.trim().startsWith('- Score:')) {
      const scoreMatch = line.match(/Score:\s*([\d.]+)/);
      if (scoreMatch) {
        currentItem.score = parseFloat(scoreMatch[1]);
      }
    } else if (currentItem && line.trim().startsWith('-') && line.includes(currentItem.title) === false) {
      const desc = line.replace(/^\s*-\s*/, '').trim();
      if (desc && !desc.startsWith('Score:') && !desc.startsWith('Source:') && !desc.startsWith('Lang:')) {
        currentItem.description = desc;
      }
    }
  }
  
  if (currentItem) {
    items.push(currentItem);
  }
  
  if (items.length === 0) {
    console.log('No items found in curation file');
    return;
  }
  
  // Create social media directory
  const socialDir = path.join(process.cwd(), 'public', 'social', today);
  if (!fs.existsSync(socialDir)) {
    fs.mkdirSync(socialDir, { recursive: true });
  }
  
  // Generate posts for top 5 items
  const topItems = items.slice(0, 5);
  
  const socialPosts = {
    twitter: [],
    mastodon: [],
    linkedin: [],
    instagram: []
  };
  
  topItems.forEach((item, index) => {
    socialPosts.twitter.push(generateTweet(item, index, topItems.length));
    socialPosts.mastodon.push(generateMastodonPost(item, index, topItems.length));
    socialPosts.linkedin.push(generateLinkedInPost(item, index, topItems.length));
    socialPosts.instagram.push(generateInstagramCaption(item, index, topItems.length));
  });
  
  // Write social media posts to files
  for (const [platform, posts] of Object.entries(socialPosts)) {
    const platformFile = path.join(socialDir, `${platform}-posts.txt`);
    const content = posts.map((post, i) => `POST ${i + 1}:\n${post}\n${'='.repeat(50)}\n`).join('\n');
    fs.writeFileSync(platformFile, content, 'utf8');
  }
  
  // Generate a summary file
  const summaryFile = path.join(socialDir, 'summary.json');
  const summary = {
    date: today,
    totalItems: items.length,
    postsGenerated: topItems.length,
    platforms: Object.keys(socialPosts),
    topItems: topItems.map(item => ({
      title: item.title,
      score: item.score,
      link: item.link,
      description: item.description
    }))
  };
  
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');
  
  // Generate scheduling suggestions
  const schedulingFile = path.join(socialDir, 'scheduling-suggestions.txt');
  const schedulingContent = `SOCIAL MEDIA SCHEDULING SUGGESTIONS - ${today}

OPTIMAL POSTING TIMES (EST/EDT):
- Twitter: 9:00 AM, 12:00 PM, 3:00 PM, 6:00 PM
- Mastodon: 10:00 AM, 2:00 PM, 7:00 PM
- LinkedIn: 8:00 AM, 12:00 PM, 5:00 PM
- Instagram: 11:00 AM, 2:00 PM, 5:00 PM, 8:00 PM

SUGGESTED POSTING SCHEDULE:
${topItems.map((item, i) => {
  const times = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM'];
  return `POST ${i + 1} (Score: ${item.score}): ${times[i] || 'Next day 9:00 AM'}
- ${item.title.slice(0, 60)}...`;
}).join('\n\n')}

HASHTAG STRATEGY:
- Primary: #DisabilityRights #A11y #3mpwrApp
- Secondary: #DisabilityJustice #Accessibility #HumanRights
- Platform-specific: Add relevant trending tags

ENGAGEMENT STRATEGY:
- Respond to comments within 2 hours
- Share in relevant disability advocacy groups
- Tag relevant organizations and advocates
- Use alt text for all images
- Include accessibility descriptions
`;
  
  fs.writeFileSync(schedulingFile, schedulingContent, 'utf8');
  
  console.log(`Generated social media content for ${topItems.length} items`);
  console.log(`Files created in: ${socialDir}`);
  console.log('Platforms:', Object.keys(socialPosts).join(', '));
}

main().catch(e => {
  console.error('Social media generation failed:', e);
  process.exit(1);
});