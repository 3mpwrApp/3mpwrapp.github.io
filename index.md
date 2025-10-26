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

# Welcome to 3mpwr App

📖 **3 minute read**

<strong>Connecting voices, empowering change.</strong>

3mpwr App is a **grassroots, community-driven platform** built for injured workers and persons with disabilities across Canada. We're creating a safe, inclusive space where people can connect, share experiences, and advocate for change.

**💚 100% Free Forever** – No paid tiers, no subscriptions, no profit motive. Built BY the community, FOR the community.

---

## Why 3mpwr?

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

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 8px; margin: 1rem 0 1.5rem; text-align: center;">
  <h3 style="color: white; margin: 0 0 0.5rem;">🚀 Phase 1 Beta Testing Underway!</h3>
  <p style="color: rgba(255,255,255,0.95); margin: 0 0 1rem;">Be among the first to test 3mpwrApp and help shape its future. Limited spots available!</p>
  <a href="https://forms.gle/46yVp37vfitfitLT9" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: white; color: #5568d3; padding: 0.75rem 2rem; border-radius: 4px; font-weight: bold; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Sign Up for Beta Testing →</a>
  <p style="color: rgba(255,255,255,0.9); margin: 1rem 0 0; font-size: 0.9rem;"><a href="{{ '/beta-guide' | relative_url }}" style="color: white; text-decoration: underline; font-weight: 500;">Learn more about beta testing</a></p>
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
