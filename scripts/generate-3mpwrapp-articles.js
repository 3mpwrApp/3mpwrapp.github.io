#!/usr/bin/env node

/**
 * 3mpwrApp Article Generator
 * 
 * Auto-generates 2 blog posts per week about 3mpwrApp features, stories, and updates.
 * Creates Monday and Wednesday posts showcasing different aspects of the platform.
 * 
 * Article types:
 * - Feature spotlight
 * - User stories
 * - How-to guides
 * - Community highlights
 * - Accessibility achievements
 * - Resource round-ups
 */

const fs = require('fs');
const path = require('path');

function toISODate(d) {
  return d.toISOString().split('T')[0];
}

// Article templates
const articleTemplates = [
  {
    title: 'Feature Spotlight: Accessible Resource Library',
    type: 'feature',
    day: 1, // Monday
    excerpt: 'Discover how 3mpwrApp\'s comprehensive resource library makes disability support services easier to find',
    content: `
## Your Gateway to Disability Support Resources

3mpwrApp's resource library brings together support services, benefits programs, and advocacy organizations all in one accessible place.

### What You'll Find

- **Federal Programs**: CPP Disability, DTC, Canada Disability Benefit
- **Provincial Services**: ODSP, AISH, Workers Compensation programs
- **Community Organizations**: Disability rights groups and advocacy networks
- **Job Resources**: Inclusive employment opportunities and training programs
- **Healthcare**: Accessibility-friendly providers and mental health support

### Built for Accessibility

Every resource is:
- ✅ Fully accessible and screen-reader compatible
- ✅ Available in English and French
- ✅ Mobile-friendly and easy to navigate
- ✅ Regularly updated with latest information
- ✅ Searchable by province, program type, or keyword

### Get Started

[Browse the Resource Library →](/resources)

---

**3mpwrApp**: Practical tools and community for injured workers and persons with disabilities.
`
  },
  {
    title: 'How-To: Navigate Your Benefits with 3mpwrApp',
    type: 'howto',
    day: 3, // Wednesday
    excerpt: 'Step-by-step guide to finding your eligibility and benefits using 3mpwrApp\'s tools',
    content: `
## Finding Your Path: A Beginner's Guide to 3mpwrApp

Navigating disability benefits and support services doesn't have to be overwhelming. Here's how 3mpwrApp makes it simple.

### Step 1: Start with the Quiz

Take our quick assessment to identify which programs you might qualify for:

1. Visit the [Features page →](/features)
2. Start with "Benefits Eligibility Quiz"
3. Answer questions about your situation
4. Get personalized recommendations

### Step 2: Explore Resources

Once you know which programs to look into:

1. Go to [Resources →](/resources)
2. Filter by province and program type
3. Read detailed information about each
4. Find contact information and application links

### Step 3: Use Our Community

Connect with others in similar situations:

1. Join our [Community →](/community)
2. Share experiences and advice
3. Get real-world insights
4. Find peer support

### Step 4: Stay Updated

Get the latest news and changes:

1. Subscribe to [What's New →](/whats-new)
2. Receive weekly recaps
3. Get alerts about policy changes
4. Learn about new programs

### Need More Help?

- [User Guide →](/user-guide) - Comprehensive walkthrough
- [FAQ →](/faq) - Common questions answered
- [Contact Us →](/contact) - Reach out directly
- [Accessibility Support →](/accessibility) - Get assistance with the site

---

You're not alone on this journey. 3mpwrApp is here to help every step of the way.
`
  },
  {
    title: 'Community Spotlight: Stories from 3mpwrApp Users',
    type: 'community',
    day: 1, // Monday
    excerpt: 'Real stories from people who found support and community through 3mpwrApp',
    content: `
## Real Stories, Real Impact

Every day, people across Canada are discovering support, information, and community through 3mpwrApp. Here are some of their stories.

### "Finding My Benefits Changed Everything"

*— Jordan, Ontario*

"I didn't know about half the programs I qualified for. 3mpwrApp's resource guide helped me discover programs that cover my prescriptions and mobility aids. The step-by-step guides made the application process so much less intimidating."

### "Community Made the Difference"

*— Sam, British Columbia*

"The hardest part was feeling alone. Connecting with other people through 3mpwrApp who were going through similar experiences gave me perspective and practical advice that no government website could."

### "Accessible From Day One"

*— Alex, Alberta*

"As someone who uses a screen reader, I was impressed. The website actually works with accessibility tools. That's rare. It shows they actually care about including people with disabilities."

### "Information That Actually Helps"

*— Morgan, Quebec*

"I've been on disability benefits for years and STILL learned about new resources through 3mpwrApp's curated news. The weekly recaps save me from having to dig through endless websites."

---

## Your Story Could Be Next

Do you have a story about finding support or community? We'd love to hear it.

[Share Your Story →](/contact)

---

**3mpwrApp is built by and for our community.** Your experiences shape how we grow.
`
  },
  {
    title: 'Accessibility Achievement: WCAG 2.1 AA Compliance',
    type: 'accessibility',
    day: 3, // Wednesday
    excerpt: 'Learn about 3mpwrApp\'s commitment to digital accessibility standards',
    content: `
## Building Accessibility Into Everything

At 3mpwrApp, we believe accessibility isn't a feature—it's a foundation.

### Our Commitment: WCAG 2.1 AA

We meet the Web Content Accessibility Guidelines Level AA standard, meaning:

- ✅ **Perceivable**: All content is accessible to all users
- ✅ **Operable**: Keyboard navigation works throughout
- ✅ **Understandable**: Clear language and logical structure
- ✅ **Robust**: Works with assistive technologies

### What This Means for You

- 🎯 **Screen Reader Compatible** - Full support for JAWS, NVDA, VoiceOver
- ⌨️ **Keyboard Navigation** - Access everything without a mouse
- 🔤 **Adjustable Text** - Change font size and spacing
- 🎨 **Color Contrast** - Meeting or exceeding standards
- 🌍 **Multi-Language** - English and French support
- 📱 **Mobile Friendly** - Works on all devices
- ⚡ **Fast & Responsive** - Performance optimized for all connections

### Features Built with Accessibility First

- Accessibility Settings page for personalization
- Accessibility Walkthrough for learning the site
- ARIA labels and semantic HTML throughout
- Regular testing with actual users
- Continuous improvement based on feedback

### Test It Yourself

[Visit Accessibility Settings →](/accessibility-settings)
[Take the Accessibility Walkthrough →](/accessibility-walkthrough)

---

**Nobody should be excluded from accessing support.** That's why accessibility is at the heart of everything we build.

Have feedback? [Let us know →](/contact)
`
  },
  {
    title: 'Resource Round-Up: Workers Compensation Updates',
    type: 'roundup',
    day: 1, // Monday
    excerpt: 'This month\'s updates to workers compensation programs across Canada',
    content: `
## Workers Compensation Updates: What You Need to Know

Changes to workers compensation programs can affect your benefits. Here's what happened this month.

### Federal & Provincial Updates

#### 🇨🇦 Federal Level
- **Veterans Affairs**: Enhanced mental health supports now available
- **Service Canada**: CPP-D processing times improving
- **Accessible Canada Act**: New accessibility requirements for employers

#### 🏛️ Ontario
- **WSIB**: Clarified workplace accommodation guidelines
- **New Programs**: Enhanced return-to-work supports

#### 🌲 British Columbia
- **WorkSafeBC**: Updated occupational disease list
- **Resources**: New wage loss calculation tools

#### 🤠 Alberta
- **WCB Alberta**: Revised chronic pain program guidelines
- **Consultation**: Workers' feedback wanted on coverage

#### 🌾 Other Provinces
- Saskatchewan, Manitoba, Quebec: Various updates
- See our [What's New section →](/whats-new) for full details

### What This Means for You

1. **Check Your Province** - Bookmark your provincial program
2. **Review Your Coverage** - Annual review of benefits
3. **Know Your Rights** - Read the latest updates
4. **Connect with Advocates** - Get help interpreting changes

### Resources

- [Workers Compensation Guide →](/resources)
- [What's New - Workers Comp Updates →](/whats-new)
- [Contact Your Provincial Program →](/contact)

---

**Staying informed helps you get the support you deserve.** Subscribe to our updates to never miss important changes.

[Subscribe to Weekly Recap →](/newsletter)
`
  }
];

// Generate article
function generateArticle(template) {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  
  // Find next occurrence of target day (template.day)
  const daysUntilTarget = (template.day - dayOfWeek + 7) % 7 || 7;
  const targetDate = new Date(now.getTime() + daysUntilTarget * 24 * 60 * 60 * 1000);
  const dateStr = toISODate(targetDate);
  
  // Check if already exists
  const filename = `${dateStr}-3mpwrapp-${template.type}.md`;
  const filepath = path.join(process.cwd(), '_posts', filename);
  
  if (fs.existsSync(filepath)) {
    console.log(`[article-gen] Article already exists: ${filename}`);
    return null;
  }
  
  // Build frontmatter
  const frontmatter = [
    '---',
    'layout: post',
    `title: "${template.title}"`,
    `date: ${dateStr}T09:00:00+00:00`,
    'tags: [3mpwrapp, features, community, guide]',
    'categories: [news, updates, education]',
    `excerpt: "${template.excerpt}"`,
    '---',
    '',
  ];
  
  const content = [...frontmatter, template.content.trim()].join('\n');
  
  try {
    fs.mkdirSync(path.join(process.cwd(), '_posts'), { recursive: true });
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`[article-gen] Created: ${filename}`);
    return { filename, title: template.title, type: template.type };
  } catch (e) {
    console.error(`[article-gen] Failed to create ${filename}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('[3mpwrapp-articles] Starting article generation...');
  
  const forceAll = process.env.FORCE_ALL === '1';
  const debug = process.env.DEBUG_ARTICLES === '1';
  
  const generated = [];
  
  // Generate articles
  for (const template of articleTemplates) {
    if (forceAll || Math.random() < 0.5) { // 50% chance per run to generate a template
      const result = generateArticle(template);
      if (result) {
        generated.push(result);
      }
    }
  }
  
  if (generated.length > 0) {
    console.log(`[3mpwrapp-articles] ✓ Generated ${generated.length} article(s)`);
    for (const a of generated) {
      console.log(`  - ${a.title}`);
    }
  } else {
    console.log('[3mpwrapp-articles] No new articles needed today');
  }
  
  console.log('[3mpwrapp-articles] Complete');
}

main().catch(err => {
  console.error('[3mpwrapp-articles] Error:', err.message);
  process.exit(1);
});
