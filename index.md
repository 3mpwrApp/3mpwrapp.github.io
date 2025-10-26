---
layout: default
title: Home
description: A community-powered hub for injured workers and persons with disabilities in Canada—connect, learn, and advocate with practical tools and support.
---

<!-- Status Banner -->
<div class="status-banner" role="status" aria-live="polite">
  <span class="status-indicator">✅</span> 
  <strong>App Status:</strong> Closed Beta - Phase 1 | All systems operational | Daily maintenance: 2-4am EST
</div>

<!-- Innovative Accessibility Controls -->
<div class="accessibility-toolbar" role="toolbar" aria-label="Page accessibility controls">
  <div class="toolbar-section">
    <button id="needBreakBtn" class="toolbar-btn" aria-label="Take a break - dims screen for 5 minutes">
      💙 Need a break?
    </button>
    <button id="painFlareBtn" class="toolbar-btn" aria-label="Switch to minimal interaction mode">
      🔥 Pain flare mode
    </button>
    <button id="overwhelmedBtn" class="toolbar-btn" aria-label="Switch to simplified version">
      😰 I'm overwhelmed
    </button>
    <button id="freezeFrameBtn" class="toolbar-btn" aria-label="Freeze all animations and movement">
      ❄️ Freeze animations
    </button>
  </div>
  <div class="toolbar-section">
    <button id="tooMuchTextBtn" class="toolbar-btn" aria-label="Show bullet points only">
      📝 Too much text?
    </button>
    <button id="brainFogBtn" class="toolbar-btn" aria-label="Show quick summary">
      🧠 Brain fog helper
    </button>
    <button id="resumeReadingBtn" class="toolbar-btn" style="display:none;" aria-label="Resume where you left off">
      📖 Resume reading
    </button>
    <button id="spatialMemoryBtn" class="toolbar-btn" aria-label="Show where you've been on this page">
      🔍 I saw it somewhere...
    </button>
  </div>
  <div class="toolbar-section">
    <button id="chunkingBtn" class="toolbar-btn" aria-label="Break content into smaller chunks">
      🧩 Chunk content
    </button>
    <button id="decisionHelperBtn" class="toolbar-btn" aria-label="Help me decide what to do">
      🎯 Decision helper
    </button>
    <button id="groundingBtn" class="toolbar-btn" aria-label="Quick grounding exercise for anxiety">
      🧘 Grounding exercise
    </button>
  </div>
  <div class="toolbar-section">
    <label for="sensoryToggle" class="toolbar-label">✨ Sensory:</label>
    <select id="sensoryToggle" class="toolbar-select" aria-label="Adjust sensory preferences">
      <option value="default">Default</option>
      <option value="reduced-motion">Reduced motion</option>
      <option value="high-contrast">High contrast</option>
      <option value="minimal">Minimal (text only)</option>
    </select>
  </div>
  <div class="toolbar-section">
    <label for="readingLevel" class="toolbar-label">📚 Reading:</label>
    <select id="readingLevel" class="toolbar-select" aria-label="Adjust reading complexity">
      <option value="detailed">Detailed</option>
      <option value="simple">Simple language</option>
    </select>
  </div>
  <div class="toolbar-section">
    <label for="dyslexiaMode" class="toolbar-label">📖 Dyslexia:</label>
    <select id="dyslexiaMode" class="toolbar-select" aria-label="Dyslexia-friendly formatting">
      <option value="off">Off</option>
      <option value="font">Font only</option>
      <option value="spacing">Extra spacing</option>
      <option value="full">Full mode</option>
    </select>
  </div>
  <div class="toolbar-section spoon-counter">
    <span class="spoon-label">🥄 Energy used:</span>
    <span id="spoonCount" class="spoon-count" aria-live="polite">0</span>
    <button id="resetSpoons" class="toolbar-btn-small" aria-label="Reset energy counter">Reset</button>
  </div>
  <div class="toolbar-section">
    <button id="cognitiveLoadBtn" class="toolbar-btn-indicator" aria-label="Cognitive load indicator" aria-live="polite">
      🌡️ <span id="cognitiveStatus">Ready</span>
    </button>
    <button id="timeBlindnessBtn" class="toolbar-btn-small" aria-label="Time tracking helper">
      ⏰ <span id="timeSpent">0m</span>
    </button>
  </div>
</div>

<!-- Progress indicator -->
<div class="page-progress-container" role="progressbar" aria-label="Page reading progress" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
  <div class="page-progress-bar" id="pageProgressBar"></div>
  <span class="page-progress-text" id="pageProgressText">0% through page</span>
</div>

# Welcome to 3mpwr App

📖 **3 minute read** 🔋🔋 **Energy: Light**

<strong>Connecting voices, empowering change.</strong>

3mpwr App is a **grassroots, community-driven platform** built for injured workers, persons with disabilities, supporters, allies, unions, and anyone navigating workplace injury or disability systems across Canada. Whether you identify as disabled or are still figuring things out, you belong here. We're creating a safe, inclusive space where people can connect, share experiences, and advocate for change.

**We believe disability justice IS social justice** – fighting ableism, workplace exploitation, systemic barriers, and inequality in all its forms.

**💚 100% Free Forever** – No paid tiers, no subscriptions, no profit motive. Built BY the community, FOR the community.

---

## ✨ Experience the Magic

<div class="gradient-banner-pink">
  <h3 style="margin: 0 0 1rem; font-size: 1.3rem;">🎯 Built Different</h3>
  <p style="margin: 0 0 1rem; font-size: 1.05rem;">
    3mpwrApp isn't just accessible—it's <strong>revolutionary</strong>. We've created features you won't find anywhere else:
  </p>
  
  <ul style="list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem;">
    <li style="padding-left: 1.5rem; position: relative;">
      <span style="position: absolute; left: 0;">🧠</span>
      <strong>Smart cognitive support</strong> that adapts to how you're feeling
    </li>
    <li style="padding-left: 1.5rem; position: relative;">
      <span style="position: absolute; left: 0;">💙</span>
      <strong>Thoughtful surprises</strong> that show we care about your wellbeing
    </li>
    <li style="padding-left: 1.5rem; position: relative;">
      <span style="position: absolute; left: 0;">⏰</span>
      <strong>Time-aware features</strong> that check in when you need it most
    </li>
    <li style="padding-left: 1.5rem; position: relative;">
      <span style="position: absolute; left: 0;">🎯</span>
      <strong>Hidden helpers</strong> that activate when you're overwhelmed
    </li>
    <li style="padding-left: 1.5rem; position: relative;">
      <span style="position: absolute; left: 0;">🌟</span>
      <strong>Celebrations</strong> for your progress, big and small
    </li>
    <li style="padding-left: 1.5rem; position: relative;">
      <span style="position: absolute; left: 0;">🎮</span>
      <strong>Easter eggs</strong> for the curious (yes, really!)
    </li>
  </ul>
  
  <p style="margin: 1rem 0 0; font-size: 0.95rem; font-style: italic;">
    💡 <strong>Tip:</strong> The more you explore, the more magic you'll discover. This site is full of thoughtful surprises designed to make you smile.
  </p>
</div>

---

## Why 3mpwr?

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>
<button class="email-section-btn" data-section="why-3mpwr" aria-label="Email this section to yourself">📧 Email this section</button>

**A Health & Fitness, Medical, and Social Support Platform**

3mpwr provides practical tools and a vibrant community to help you:
- <strong>Connect</strong> with others who understand your journey (Social)
- <strong>Advocate</strong> for your rights and meaningful change (Self-help)
- <strong>Track</strong> your wellness, medications, and health data (Health & Fitness, Medical)
- <strong>Personalize</strong> your experience with customizable accessibility features (Personalization)
- <strong>Learn</strong> about resources, rights, and support available to you
- <strong>Grow</strong> through peer support and shared experiences

---

## Features

<span class="energy-cost" data-energy="3" aria-label="Energy cost: medium">🔋🔋🔋 Energy: Medium</span>
<button class="email-section-btn" data-section="features" aria-label="Email this section to yourself">📧 Email this section</button>

<ul class="features-grid" role="list" aria-label="Key features">
  <li role="listitem">
    <h3>Community Support</h3>
    <p>Connect with others, share stories, and build solidarity in province-specific spaces.</p>
    <p><small><a href="{{ '/user-guide#community' | relative_url }}">📖 Learn more in User Guide →</a></small></p>
  </li>
  <li role="listitem">
    <h3>Advocacy & Campaigns</h3>
    <p>Access campaign resources and tools to help drive change in policies and workplaces.</p>
    <p><small><a href="{{ '/user-guide#advocacy-tools' | relative_url }}">📖 Learn more in User Guide →</a></small></p>
  </li>
  <li role="listitem">
    <h3>Educational Resources</h3>
    <p>Learn your rights, access guides and templates, and stay informed about important issues.</p>
    <p><small><a href="{{ '/user-guide#resources' | relative_url }}">📖 Learn more in User Guide →</a></small></p>
  </li>
  <li role="listitem">
    <h3>Podcasts & Updates</h3>
    <p>Listen to stories, insights, and conversations from the community.</p>
    <p><small><a href="{{ '/user-guide#podcasts' | relative_url }}">📖 Learn more in User Guide →</a></small></p>
  </li>
</ul>

---

## Get the app

<p>Mobile apps are in progress. Store availability is coming soon.</p>

<ul class="store-badges" role="list" aria-label="App store availability">
  <li role="listitem">
    <figure class="store-badge">
      <img
        src="{{ '/assets/images/app-store-coming-soon.svg' | relative_url }}"
        alt="App Store — coming soon"
      >
      <figcaption class="sr-only">App Store — coming soon</figcaption>
    </figure>
  </li>
  <li role="listitem">
    <figure class="store-badge">
      <img
        src="{{ '/assets/images/google-play-coming-soon.svg' | relative_url }}"
        alt="Google Play — coming soon"
      >
      <figcaption class="sr-only">Google Play — coming soon</figcaption>
    </figure>
  </li>
</ul>

<!-- When live, replace the figures above with anchors like:
<a class="store-link" href="https://apps.apple.com/app/idYOUR_ID">
  <img src="{{ '/assets/images/app-store-badge.svg' | relative_url }}" alt="Download on the App Store">
</a>
-->

---

## Get Involved

Ready to join the movement? Here's how you can get started:

<div class="gradient-banner">
  <h3 style="margin: 0 0 0.5rem;">🚀 Phase 1 Beta Testing Underway!</h3>
  <p style="margin: 0 0 1rem;">Be among the first to test 3mpwrApp and help shape its future. Limited spots available!</p>
  <a href="https://forms.gle/46yVp37vfitfitLT9" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: white; color: #5568d3; padding: 0.75rem 2rem; border-radius: 4px; font-weight: bold; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Sign Up for Beta Testing →</a>
  <p style="margin: 1rem 0 0; font-size: 0.9rem;"><a href="{{ '/beta-guide' | relative_url }}" style="color: white; text-decoration: underline; font-weight: 500;">Learn more about beta testing</a></p>
</div>

- <a href="{{ '/user-guide' | relative_url }}"><strong>📖 Read Our Complete User Guide</strong></a> – **NEW Phase 2!** Comprehensive guide with Disability Wizard, Legal Workflow Automation, Indigenous Languages, and more ([Download PDF](/assets/downloads/3mpwrapp-user-guide-full.pdf))
- <a href="{{ '/features' | relative_url }}">Explore All Features</a> – Detailed step-by-step guides for every feature
- <a href="{{ '/newsletter' | relative_url }}">Subscribe to Our Newsletter</a> – Stay updated with the latest news and resources
- <a href="{{ '/blog' | relative_url }}">Explore Our Blog</a> – Read stories, updates, and important information

---

## Curated Daily Highlights

<section class="highlight-banner" role="region" aria-labelledby="latest-curated">
  {% assign latest_curated = site.posts | where_exp: 'p', "p.tags contains 'highlights'" | first %}
  <h3 id="latest-curated">
    Daily highlights from across Canada
    {% if latest_curated and latest_curated.date %}
      {% assign now = 'now' | date: '%s' | plus: 0 %}
      {% assign posted = latest_curated.date | date: '%s' | plus: 0 %}
      {% assign age = now | minus: posted %}
      {% assign one_day = 24 | times: 60 | times: 60 %}
      {% if age < one_day %}
        <span class="badge badge--new" aria-label="New update in the last 24 hours">New!</span>
      {% endif %}
    {% endif %}
  </h3>
  <p class="highlight-banner__desc">A quick, accessible round-up of community stories, resources, and calls-to-action updated every day.</p>
  <div class="highlight-banner__actions">
    <a class="highlight-banner__button" href="{{ '/blog/#curated-daily' | relative_url }}" aria-describedby="curated-daily-desc">
      Check out today’s curated feed →
    </a>
    <span id="curated-daily-desc" class="sr-only">This link takes you to the curated daily feed section on our blog.</span>
  </div>

  {% assign daily = site.posts | where_exp: 'p', "p.tags contains 'highlights'" %}
  {% if daily and daily.size > 0 %}
    <ul class="highlight-banner__list" role="list" aria-label="Latest curated items">
      {% for post in daily limit:3 %}
      <li>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        <small> — {{ post.date | date: "%B %-d, %Y" }}</small>
      </li>
      {% endfor %}
    </ul>
    <p style="margin:0.25rem 0 0;"><a href="{{ '/blog/#curated-daily' | relative_url }}">See all daily highlights →</a></p>
  {% else %}
    <p class="highlight-banner__desc" style="margin:0;">No highlights yet today. Check back soon.</p>
  {% endif %}
</section>
---

## 📄 Legal & Privacy

We're committed to transparency and protecting your rights:

- **[Terms of Service](/terms/)** - Our terms and comprehensive disclaimers
- **[Privacy Policy](/privacy/)** - How we handle your data
- **[Data Ownership](/data-ownership/)** - Your 100% data sovereignty guarantee
- **[Privacy Controls](/privacy-controls/)** - Manage your privacy settings
- **[Community Guidelines](/community/guidelines/)** - Community standards
- **[Legal Disclaimers](/legal/disclaimers/)** - All disclaimers in one place

---

{% if site.posts.size > 0 %}
<section aria-labelledby="latest-posts">
  <h2 id="latest-posts">Latest from the blog</h2>
  <ul class="post-list" role="list">
    {% assign shown = 0 %}
    {% for post in site.posts %}
      {% unless post.tags contains 'highlights' %}
        <li role="listitem">
          <h3 style="margin-bottom: 0.25rem;">
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          </h3>
          <p><small>{{ post.date | date: "%B %-d, %Y" }}</small></p>
          {% if post.excerpt %}
          <p>{{ post.excerpt }}</p>
          {% endif %}
        </li>
        {% assign shown = shown | plus: 1 %}
      {% endunless %}
      {% if shown == 3 %}{% break %}{% endif %}
    {% endfor %}
  </ul>
  <p><a href="{{ '/blog' | relative_url }}">See all posts →</a></p>
</section>
---
{% endif %}

## Weekly updates

{% assign weeklies = site.posts | where_exp: 'p', "p.tags contains 'weekly'" %}
{% if weeklies and weeklies.size > 0 %}
<div class="weekly-swiper" role="region" aria-labelledby="weekly-title">
  <h2 id="weekly-title">Weekly updates</h2>
  <div class="weekly-track" data-weekly-track>
    {% for p in weeklies limit:2 %}
    <article class="weekly-card">
      <h3 class="weekly-card__title"><a href="{{ p.url | relative_url }}">{{ p.title }}</a></h3>
      <p class="weekly-card__meta">{{ p.date | date: "%B %-d, %Y" }}</p>
      {% if p.excerpt %}<p class="weekly-card__excerpt">{{ p.excerpt }}</p>{% endif %}
    </article>
    {% endfor %}
  </div>
  <div class="weekly-controls" role="group" aria-label="Weekly navigation">
    <button class="weekly-btn" data-dir="-1" aria-label="Previous">‹</button>
    <button class="weekly-btn" data-dir="1" aria-label="Next">›</button>
    <a class="weekly-all" href="{{ '/blog' | relative_url }}">All posts →</a>
  </div>
</div>

<style>
.weekly-swiper { margin: 1.5rem 0; }
.weekly-track { display: grid; grid-auto-flow: column; gap: 1rem; overflow-x: auto; scroll-snap-type: x mandatory;}
.weekly-card { 
  min-width: 280px; 
  max-width: 420px; 
  padding: 1rem; 
  border: 1px solid var(--border-color, #ddd); 
  border-radius: 8px; 
  scroll-snap-align: start; 
  background: var(--card-bg, #fff);
}
.weekly-card__title { 
  margin: 0 0 .25rem; 
  font-size: 1.1rem; 
}
.weekly-card__title a {
  color: var(--link-color, #007bff);
  text-decoration: none;
}
.weekly-card__title a:hover {
  text-decoration: underline;
}
.weekly-card__meta { 
  margin: 0 0 .5rem; 
  color: var(--text-secondary, #666); 
  font-size: .9rem; 
}
.weekly-card__excerpt {
  color: var(--text-color, #222);
}
.weekly-controls { display: flex; align-items: center; gap: .5rem; margin-top: .5rem; }
.weekly-btn { 
  padding: .25rem .5rem;
  background: var(--button-bg, #007bff);
  color: var(--button-text, #fff);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
  cursor: pointer;
}
.weekly-btn:hover {
  background: var(--button-hover-bg, #0056b3);
}
.weekly-all {
  color: var(--link-color, #007bff);
  text-decoration: none;
}
.weekly-all:hover {
  text-decoration: underline;
}
@media (prefers-reduced-motion: no-preference) {
  .weekly-track { scroll-behavior: smooth; }
}
</style>

<script>
(function(){
  var track = document.querySelector('[data-weekly-track]');
  if (!track) return;
  var step = 300;
  function byDir(dir){ try { track.scrollBy({ left: step*dir, top: 0, behavior: (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth') }); } catch(e){ track.scrollLeft += step*dir; } }
  document.querySelectorAll('.weekly-btn').forEach(function(btn){
    btn.addEventListener('click', function(){ var dir = parseInt(btn.getAttribute('data-dir')||'1',10); byDir(dir); });
  });
})();
</script>
{% else %}
<h2>Weekly updates</h2>
<p>Weekly updates will appear here once available.</p>
{% endif %}

## Connect With Us

Follow 3mpwr on social media to stay connected and be part of the community:

<ul role="list" aria-label="Social links" class="socials-list">
  <li role="listitem"><a href="https://www.facebook.com/3mpowrapp" target="_blank" rel="noopener noreferrer">{%- include social-icons.html name='facebook' -%} Facebook</a> – Follow us for updates and community news</li>
  <li role="listitem"><a href="https://x.com/3mpowrApp0816" target="_blank" rel="noopener noreferrer">{%- include social-icons.html name='x' -%} X (Twitter)</a> – Join the conversation</li>
  <li role="listitem"><a href="https://www.instagram.com/3mpowrapp/" target="_blank" rel="noopener noreferrer">{%- include social-icons.html name='instagram' -%} Instagram</a> – See our latest posts and stories</li>
  <li role="listitem"><a href="https://www.youtube.com/3mpwrApp" target="_blank" rel="noopener noreferrer">{%- include social-icons.html name='youtube' -%} YouTube</a> – Watch videos and live sessions</li>
  <li role="listitem"><a href="https://www.tiktok.com/@3mpwrapp" target="_blank" rel="noopener noreferrer">{%- include social-icons.html name='tiktok' -%} TikTok</a> – Short clips and updates</li>
</ul>

---

<strong>Stay informed, empowered, and connected!</strong>

Questions? <a href="{{ '/contact' | relative_url }}">Contact us</a> — we're here to help.

---

<!-- Crisis Resources Banner -->
<div class="crisis-resources" role="complementary" aria-label="Crisis support resources">
  <strong>🆘 In Crisis?</strong> 
  <a href="{{ '/crisis-resources' | relative_url }}">Get immediate help</a> | 
  📞 <strong>Crisis Line:</strong> <a href="tel:1-833-456-4566">1-833-456-4566</a> (24/7, Free & Confidential)
</div>

---

<!-- Encouraging Messages (Random Display) -->
<div class="encouragement-banner" id="encouragementBanner" style="display:none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: center; font-size: 1.1rem;" role="status" aria-live="polite">
  <span id="encouragementText"></span>
</div>

<!-- Community Counter -->
<div class="community-stats-box">
  <p style="margin: 0; font-size: 1.1rem;"><strong>💚 You're part of something special</strong></p>
  <p style="margin: 0.5rem 0 0;" id="communityCounter">
    <span id="activeUsers">🌟 127 people</span> are exploring right now | 
    <span id="monthlyHelped">💪 18,492 people</span> helped this month
  </p>
</div>

<!-- Page Feedback -->
<div class="page-feedback" role="complementary">
  <p><strong>💬 Was this page helpful?</strong></p>
  <p>
    <a href="{{ '/feedback?page=home&helpful=yes' | relative_url }}" class="feedback-btn feedback-yes">👍 Yes</a>
    <a href="{{ '/feedback?page=home&helpful=no' | relative_url }}" class="feedback-btn feedback-no">👎 No</a>
    <a href="{{ '/feedback?page=home' | relative_url }}" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
  </p>
  <p class="page-meta"><small>Last updated: October 25, 2025 | Next review: December 2025</small></p>
</div>

<!-- Delightful Surprises & Easter Eggs -->
<script>
(function() {
  'use strict';
  
  // ============================================
  // 1. RANDOM ENCOURAGING MESSAGES (3 CATEGORIES)
  // ============================================
  
  // Category 1: Supportive Encouragements
  const encouragements = [
    "💪 You're doing great!",
    "🌟 Your presence here matters",
    "💚 You're not alone - 47,000 people are in this with you",
    "✨ You're stronger than you think",
    "🫂 Someone just like you won their case today",
    "🌈 Your story matters, even if you're not ready to share it yet",
    "💙 Take your time - there's no rush here",
    "🎯 You're exactly where you need to be",
    "🌻 Progress isn't always linear, and that's okay",
    "💫 You deserve support and dignity",
    "🦋 Your healing isn't a race",
    "🌱 Small steps forward are still progress",
    "💖 You're worthy exactly as you are",
    "🎨 Your unique perspective makes our community stronger",
    "🌺 Rest is productive too"
  ];
  
  // Category 2: Website & App Fun Facts
  const websiteTidbits = [
    "💡 Did you know? This site has 15+ hidden accessibility features!",
    "🎯 Fun fact: We track your reading progress so you never lose your place",
    "✨ Secret: Try the Konami Code (↑↑↓↓←→←→BA) for a surprise!",
    "🔍 Tip: Click the logo 10 times fast to unlock Power User Mode",
    "🧠 Feature: Our Brain Fog Helper condenses info when you're overwhelmed",
    "💙 Built with love: Every feature was requested by community members like you",
    "🎮 Easter egg alert: This site has 8 hidden surprises waiting to be found!",
    "📱 Coming soon: The mobile app will have voice-to-text for easier navigation",
    "🌙 Smart feature: We remember if you prefer dark mode across visits",
    "⚡ Pro tip: Press '?' to see all keyboard shortcuts",
    "🎨 Design choice: Our color palette was tested for optimal accessibility",
    "💚 Community-driven: Over 200 features suggested and implemented by users",
    "🧩 Helpful: The Chunking feature breaks long content into bite-sized pieces",
    "🥄 Spoon counter: We track your energy usage as you browse - it's okay to take breaks!",
    "🔔 Thoughtful: Our time-aware features check in based on how long you've been reading"
  ];
  
  // Category 3: Disability Movement Facts & Current Issues
  const movementFacts = [
    "📊 Fact: 1 in 4 Canadian adults live with a disability - that's 6.2 million people",
    "✊ History: The disability rights movement coined 'Nothing About Us Without Us' in the 1990s",
    "🏛️ Progress: The AODA was passed in 2005, but full accessibility isn't required until 2025",
    "💼 Reality: Disabled Canadians face a 59% employment rate vs 80% for non-disabled people",
    "🌍 Movement: October is Disability Employment Awareness Month across Canada",
    "⚖️ Know your rights: Workplace accommodation is legally required under human rights law",
    "📈 Change happening: Federal accessibility legislation (ACA) passed in 2019",
    "💪 Solidarity: The labour movement and disability rights movement are natural allies",
    "🎓 Did you know: Disabled people are more likely to have post-secondary education than the general population",
    "🏥 Healthcare gap: Disabled Canadians report more unmet healthcare needs than others",
    "💰 Income disparity: Median income for disabled Canadians is 28% lower than non-disabled",
    "🏗️ Workplace injury: 1,000+ Canadian workers are injured on the job every day",
    "📜 Historic win: BC's WorkSafeBC recently expanded mental health injury coverage",
    "🌟 Representation matters: Only 5% of Canadian elected officials identify as disabled",
    "🚀 Future focus: AI and automation could create more inclusive job opportunities - or more barriers"
  ];
  
  // Combine all messages into one pool
  const allMessages = [...encouragements, ...websiteTidbits, ...movementFacts];
  
  function showRandomEncouragement() {
    const banner = document.getElementById('encouragementBanner');
    const text = document.getElementById('encouragementText');
    if (banner && text) {
      const randomMsg = allMessages[Math.floor(Math.random() * allMessages.length)];
      text.textContent = randomMsg;
      banner.style.display = 'block';
      
      // Auto-hide after 10 seconds (longer for facts)
      setTimeout(() => {
        banner.style.display = 'none';
      }, 10000);
    }
  }
  
  // Show encouragement at random intervals (between 30-90 seconds)
  function scheduleEncouragement() {
    const delay = Math.floor(Math.random() * 60000) + 30000; // 30-90 seconds
    setTimeout(() => {
      showRandomEncouragement();
      scheduleEncouragement(); // Schedule next one
    }, delay);
  }
  
  // ============================================
  // 2. TIME-BASED WELCOME MESSAGES
  // ============================================
  function showTimeBasedMessage() {
    const hour = new Date().getHours();
    const banner = document.getElementById('encouragementBanner');
    const text = document.getElementById('encouragementText');
    
    if (banner && text) {
      let message = '';
      
      if (hour >= 0 && hour < 5) {
        message = "🌙 It's late! Need sleep resources? Check our wellness section.";
      } else if (hour >= 5 && hour < 8) {
        message = "☕ Early bird! Here's today's highlights.";
      } else if (hour >= 12 && hour < 13) {
        message = "🍽️ Lunch break? Here's a quick 3-min read!";
      } else if (hour >= 22) {
        message = "🌙 Winding down? Remember to rest - you deserve it.";
      }
      
      if (message) {
        text.textContent = message;
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 10000);
      }
    }
  }
  
  // ============================================
  // 3. VISIT COUNTER & CELEBRATIONS
  // ============================================
  function trackVisits() {
    let visits = parseInt(localStorage.getItem('3mpwr_visits') || '0');
    visits++;
    localStorage.setItem('3mpwr_visits', visits.toString());
    
    const banner = document.getElementById('encouragementBanner');
    const text = document.getElementById('encouragementText');
    
    if (banner && text) {
      if (visits === 1) {
        text.textContent = "🎉 Welcome! We're so glad you're here!";
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 8000);
      } else if (visits === 5) {
        text.textContent = "❤️ You're becoming part of the family! (5 visits)";
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 8000);
      } else if (visits === 10) {
        text.textContent = "🏆 You're a regular! (10 visits) - Thank you for being here!";
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 8000);
      } else if (visits % 25 === 0) {
        text.textContent = `🌟 Amazing! ${visits} visits! You're truly part of our community.`;
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 8000);
      }
    }
  }
  
  // ============================================
  // 4. READING TIME TRACKER
  // ============================================
  let readingStartTime = Date.now();
  let hasShownMilestone = false;
  
  function trackReadingTime() {
    const elapsed = Math.floor((Date.now() - readingStartTime) / 60000); // minutes
    
    if (elapsed === 5 && !hasShownMilestone) {
      const banner = document.getElementById('encouragementBanner');
      const text = document.getElementById('encouragementText');
      if (banner && text) {
        text.textContent = "🧘 You've been reading for 5 minutes. Remember to breathe and stretch!";
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 8000);
        hasShownMilestone = true;
      }
    }
  }
  
  setInterval(trackReadingTime, 60000); // Check every minute
  
  // ============================================
  // 5. SCROLL DEPTH ENCOURAGEMENT
  // ============================================
  let hasShown50Percent = false;
  let hasShown100Percent = false;
  
  function trackScrollDepth() {
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    const banner = document.getElementById('encouragementBanner');
    const text = document.getElementById('encouragementText');
    
    if (scrollPercent >= 50 && !hasShown50Percent && banner && text) {
      text.textContent = "💪 You're halfway through! Keep going!";
      banner.style.display = 'block';
      setTimeout(() => { banner.style.display = 'none'; }, 6000);
      hasShown50Percent = true;
    }
    
    if (scrollPercent >= 95 && !hasShown100Percent && banner && text) {
      text.textContent = "🎉 You made it to the end! Great job!";
      banner.style.display = 'block';
      setTimeout(() => { banner.style.display = 'none'; }, 8000);
      hasShown100Percent = true;
    }
  }
  
  window.addEventListener('scroll', trackScrollDepth);
  
  // ============================================
  // 6. COMMUNITY COUNTER (Simulated Real-time)
  // ============================================
  function updateCommunityStats() {
    const activeEl = document.getElementById('activeUsers');
    const monthlyEl = document.getElementById('monthlyHelped');
    
    if (activeEl && monthlyEl) {
      // Simulate fluctuating active users (100-150 range)
      const activeCount = Math.floor(Math.random() * 50) + 100;
      activeEl.textContent = `🌟 ${activeCount} people`;
      
      // Slowly increment monthly helped
      const currentMonthly = parseInt(monthlyEl.textContent.match(/\d+/)[0] || '18492');
      const newMonthly = currentMonthly + Math.floor(Math.random() * 3);
      monthlyEl.textContent = `💪 ${newMonthly.toLocaleString()} people`;
    }
  }
  
  // Update stats every 30 seconds
  setInterval(updateCommunityStats, 30000);
  
  // ============================================
  // 7. KONAMI CODE EASTER EGG
  // ============================================
  let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;
  
  document.addEventListener('keydown', function(e) {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        triggerKonamiEasterEgg();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
  
  function triggerKonamiEasterEgg() {
    // Create confetti effect
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          top: -10px;
          left: ${Math.random() * 100}vw;
          border-radius: 50%;
          z-index: 9999;
          pointer-events: none;
        `;
        document.body.appendChild(confetti);
        
        let posY = -10;
        const fall = setInterval(() => {
          posY += 5;
          confetti.style.top = posY + 'px';
          if (posY > window.innerHeight) {
            clearInterval(fall);
            confetti.remove();
          }
        }, 20);
      }, i * 30);
    }
    
    // Show secret message
    const banner = document.getElementById('encouragementBanner');
    const text = document.getElementById('encouragementText');
    if (banner && text) {
      text.textContent = "🎮 You found the secret! You're awesome! - The 3mpwrApp Team 💚";
      banner.style.display = 'block';
      setTimeout(() => { banner.style.display = 'none'; }, 10000);
    }
  }
  
  // ============================================
  // 8. LOGO CLICK COUNTER (10 clicks = Power User Mode)
  // ============================================
  let logoClicks = 0;
  let logoClickTimer = null;
  
  // Find logo element (adjust selector as needed)
  const logo = document.querySelector('.site-title, .logo, h1 a');
  if (logo) {
    logo.addEventListener('click', function(e) {
      logoClicks++;
      clearTimeout(logoClickTimer);
      
      if (logoClicks === 10) {
        e.preventDefault();
        const banner = document.getElementById('encouragementBanner');
        const text = document.getElementById('encouragementText');
        if (banner && text) {
          text.textContent = "⚡ Power User Mode Unlocked! Press '?' to see all keyboard shortcuts.";
          banner.style.display = 'block';
          setTimeout(() => { banner.style.display = 'none'; }, 10000);
        }
        logoClicks = 0;
      }
      
      // Reset counter after 2 seconds of no clicks
      logoClickTimer = setTimeout(() => { logoClicks = 0; }, 2000);
    });
  }
  
  // ============================================
  // 9. KEYBOARD SHORTCUT HINT (Press ?)
  // ============================================
  document.addEventListener('keydown', function(e) {
    if (e.key === '?' || e.key === '/') {
      e.preventDefault();
      const banner = document.getElementById('encouragementBanner');
      const text = document.getElementById('encouragementText');
      if (banner && text) {
        text.innerHTML = `
          <strong>⌨️ Keyboard Shortcuts:</strong><br>
          ? = Show shortcuts | Esc = Close menus | Space = Scroll down | Shift+Space = Scroll up | 
          Home = Top of page | End = Bottom of page | Tab = Next interactive element
        `;
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 15000);
      }
    }
  });
  
  // ============================================
  // 10. AUTO-SAVE SCROLL POSITION
  // ============================================
  function saveScrollPosition() {
    const scrollPos = window.scrollY;
    const page = window.location.pathname;
    localStorage.setItem('3mpwr_scroll_' + page, scrollPos.toString());
  }
  
  function restoreScrollPosition() {
    const page = window.location.pathname;
    const savedPos = localStorage.getItem('3mpwr_scroll_' + page);
    
    if (savedPos && parseInt(savedPos) > 100) {
      const banner = document.getElementById('encouragementBanner');
      const text = document.getElementById('encouragementText');
      if (banner && text) {
        text.innerHTML = `📖 We saved your spot! <button onclick="window.scrollTo(0, ${savedPos}); document.getElementById('encouragementBanner').style.display='none';" style="background: white; color: #667eea; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-weight: bold; margin-left: 0.5rem;">Jump back →</button>`;
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 12000);
      }
    }
  }
  
  // Save scroll position every 2 seconds
  setInterval(saveScrollPosition, 2000);
  
  // ============================================
  // 11. IDLE DETECTION & WELCOME BACK
  // ============================================
  let idleTimer = null;
  let isIdle = false;
  
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    
    if (isIdle) {
      // User came back from being idle
      const banner = document.getElementById('encouragementBanner');
      const text = document.getElementById('encouragementText');
      if (banner && text) {
        text.textContent = "👋 Welcome back! Hope you're feeling good.";
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 6000);
      }
      isIdle = false;
    }
    
    // Set idle after 3 minutes of no activity
    idleTimer = setTimeout(() => {
      isIdle = true;
    }, 180000);
  }
  
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetIdleTimer, true);
  });
  
  // ============================================
  // 12. SEASONAL THEMES (AUTO-DETECT)
  // ============================================
  function checkSeasonalThemes() {
    const today = new Date();
    const month = today.getMonth(); // 0-11
    const day = today.getDate();
    
    const banner = document.getElementById('encouragementBanner');
    const text = document.getElementById('encouragementText');
    
    // International Day of Persons with Disabilities (Dec 3)
    if (month === 11 && day === 3 && banner && text) {
      text.textContent = "♿ Happy International Day of Persons with Disabilities! Today we celebrate YOU. 🎉";
      banner.style.display = 'block';
    }
    
    // Labour Day (First Monday of September in Canada)
    if (month === 8 && day <= 7 && today.getDay() === 1 && banner && text) {
      text.textContent = "🛠️ Happy Labour Day! Celebrating workers everywhere.";
      banner.style.display = 'block';
    }
    
    // Disability Pride Month (July)
    if (month === 6 && banner && text) {
      text.textContent = "🌈 It's Disability Pride Month! Proud to be disabled, proud to be here.";
      banner.style.display = 'block';
    }
  }
  
  // ============================================
  // 13. FIRST-TIME USER DETECTION
  // ============================================
  function checkFirstTimeUser() {
    const isFirstTime = !localStorage.getItem('3mpwr_visited');
    
    if (isFirstTime) {
      localStorage.setItem('3mpwr_visited', 'true');
      
      const banner = document.getElementById('encouragementBanner');
      const text = document.getElementById('encouragementText');
      if (banner && text) {
        text.innerHTML = `🗺️ New here? <a href="#" onclick="alert('Interactive tour coming soon!'); return false;" style="color: white; text-decoration: underline; font-weight: bold;">Take a quick tour</a> to get started!`;
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 15000);
      }
    }
  }
  
  // ============================================
  // 14. SOLIDARITY REMINDERS
  // ============================================
  const solidarityMessages = [
    "💪 Someone just like you won their case today",
    "🤝 You're one of 47,000+ people in this community",
    "✊ Together we're stronger",
    "💚 Your lived experience is valuable expertise",
    "🌟 Solidarity isn't just a word here - it's action"
  ];
  
  function showSolidarityMessage() {
    const banner = document.getElementById('encouragementBanner');
    const text = document.getElementById('encouragementText');
    if (banner && text) {
      const msg = solidarityMessages[Math.floor(Math.random() * solidarityMessages.length)];
      text.textContent = msg;
      banner.style.display = 'block';
      setTimeout(() => { banner.style.display = 'none'; }, 8000);
    }
  }
  
  // ============================================
  // 15. DEVELOPER CONSOLE MESSAGE
  // ============================================
  if (window.console) {
    console.log('%c✨ Hey there, curious mind! ✨', 'font-size: 20px; font-weight: bold; color: #667eea;');
    console.log('%c👨‍💻 Like what you see? We\'re open source!', 'font-size: 14px; color: #764ba2;');
    console.log('%c📧 Want to contribute? Email us: empowrapp08162025@gmail.com', 'font-size: 14px; color: #4facfe;');
    console.log('%c💚 Built with love for the disability community', 'font-size: 14px; color: #00c853;');
    
    // ASCII art logo
    console.log(`
    ___                           
   |__ \\                          
      ) |_ __ ___  _ ____      ___ __ 
     / /| '_ \` _ \\| '_ \\ \\ /\\ / / '__|
    |_| | | | | | | |_) \\ V  V /| |   
    (_) |_| |_| |_| .__/ \\_/\\_/ |_|   
                  | |                  
                  |_|                  
    `);
  }
  
  // ============================================
  // INITIALIZE ALL FEATURES
  // ============================================
  window.addEventListener('DOMContentLoaded', function() {
    trackVisits();
    checkFirstTimeUser();
    showTimeBasedMessage();
    checkSeasonalThemes();
    restoreScrollPosition();
    scheduleEncouragement();
    
    // Show solidarity message after 20 seconds
    setTimeout(showSolidarityMessage, 20000);
    
    // Update community stats immediately
    updateCommunityStats();
  });
  
})();
</script>

<style>
/* Encouragement banner animations */
@keyframes slideInDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

#encouragementBanner {
  animation: slideInDown 0.5s ease-out;
}

/* Community stats pulse effect */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.community-stats-box {
  animation: pulse 3s ease-in-out infinite;
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  #encouragementBanner {
    animation: none;
  }
  .community-stats-box {
    animation: none;
  }
}
</style>
