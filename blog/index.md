---
layout: default
title: Blog
description: News, updates, and stories from the 3mpwr community.
---


{%- include status-banner.html -%}

# 3mpwr App Blog

Welcome to our blog! Stay informed with daily news highlights, feature spotlights, weekly recaps, and community updates.

---

## 📑 Quick Navigation (Table of Contents)

**Browse by Section:**
- [📰 Daily News Highlights](#curated-daily) - Curated news from 50+ trusted sources
- [✨ Feature Spotlights](#feature-articles) - App features and tools explained
- [📅 Weekly Recaps](#weekly-recaps) - Weekly development updates
- [💬 Community Updates](#blog-posts) - Announcements and stories

**Other Resources:**
- [📚 Research Hub]({{ '/research' | relative_url }}) - Knowledge base, appeal templates, and comprehensive guides from 11,430 tribunal cases
- [Subscribe via RSS]({{ '/feed.xml' | relative_url }}) | [Newsletter]({{ '/newsletter' | relative_url }})
- [What's New]({{ '/whats-new' | relative_url }}) - Detailed changelog
- [App Tour]({{ '/app-tour' | relative_url }}) - Complete feature walkthrough

---

<div class="blog-social-box">
  <h3 style="margin-top: 0;">📱 Follow Us on Social Media</h3>
  <p>Get daily news and updates delivered to your feed!</p>
  <ul style="margin-bottom: 0;">
    <li><strong>Discord:</strong> <a href="https://discord.gg/P2qQyjxV" target="_blank" rel="noopener">Join Our Community</a> - Live chat, support, beta testing</li>
    <li><strong>X/Twitter:</strong> <a href="https://x.com/3mpwrApp0816" target="_blank" rel="noopener">@3mpwrApp0816</a> - Daily updates</li>
    <li><strong>Facebook:</strong> <a href="https://www.facebook.com/3mpowrapp/" target="_blank" rel="noopener">3mpowrapp</a> - Community groups</li>
    <li><strong>Mastodon:</strong> <a href="https://mastodon.social/@3mpwrapp" target="_blank" rel="noopener">@3mpwrapp@mastodon.social</a> - Daily posts at 9 AM UTC</li>
    <li><strong>Bluesky:</strong> <a href="https://bsky.app/profile/3mpwrapp.bsky.social" target="_blank" rel="noopener">@3mpwrapp.bsky.social</a> - Daily posts at 9 AM UTC</li>
  </ul>
</div>

---

## <span id="curated-daily">📰 Daily News Highlights</span>

<p class="section-description">Fresh news carefully curated from 50+ trusted sources across Canada. Updated every morning at 9 AM UTC with the most relevant stories on disability rights, accessibility, workers' compensation, and social policy changes that affect you.</p>

{% assign daily = site.posts | where_exp: 'p', "p.tags contains 'highlights'" %}
{% if daily and daily.size > 0 %}
<div class="posts-grid">
  {% for post in daily limit:7 %}
  <article class="post-card post-card--curated">
    <div class="post-card__badge">🌟 Curated</div>
    <h3 class="post-card__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p class="post-card__date">📅 {{ post.date | date: "%B %-d, %Y" }}</p>
    {% if post.excerpt %}
    <p class="post-card__excerpt">{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
    {% endif %}
    <a href="{{ post.url | relative_url }}" class="post-card__link">Read more →</a>
  </article>
  {% endfor %}
</div>
<p style="text-align: center; margin-top: 1.5rem;">
  <a href="#all-curated" class="btn-secondary">View All Daily Highlights →</a>
</p>
{% else %}
<p class="empty-state">No curated highlights yet. Check back soon for today's top stories!</p>
{% endif %}

---

## <span id="feature-articles">✨ Feature Spotlights</span>

<p class="section-description">Explore 3mpwrApp features, the app itself, and our website tools. From Evidence Locker and Letter Generator to community features and accessibility innovations—discover how our platform helps you advocate for your rights, navigate systems, and connect with your community.</p>

{% assign feature_articles = site.posts | where_exp: 'p', "p.tags contains 'spotlight'" %}
{% if feature_articles and feature_articles.size > 0 %}
<div class="posts-grid">
  {% for post in feature_articles %}
  <article class="post-card post-card--feature">
    <div class="post-card__badge">✨ Feature</div>
    <h3 class="post-card__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p class="post-card__date">📅 {{ post.date | date: "%B %-d, %Y" }}</p>
    {% if post.excerpt %}
    <p class="post-card__excerpt">{{ post.excerpt | strip_html | truncatewords: 25 }}</p>
    {% endif %}
    <a href="{{ post.url | relative_url }}" class="post-card__link">Read article →</a>
  </article>
  {% endfor %}
</div>
{% else %}
<p class="empty-state">Feature articles coming soon!</p>
{% endif %}

---

## <span id="weekly-recaps">📅 Weekly Recaps</span>

<p class="section-description">Every Monday, we compile the week's most important updates, new features, improvements, and fixes into one easy-to-read recap. See detailed changelog on our <a href="{{ '/whats-new' | relative_url }}">What's New</a> page. Perfect for staying up-to-date on what's changed!</p>

{% assign weekly_recaps = site.posts | where_exp: 'p', "p.tags contains 'weekly'" %}
{% if weekly_recaps and weekly_recaps.size > 0 %}
<div class="posts-grid">
  {% for post in weekly_recaps limit:4 %}
  <article class="post-card post-card--weekly">
    <div class="post-card__badge">📊 Weekly Recap</div>
    <h3 class="post-card__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p class="post-card__date">📅 {{ post.date | date: "%B %-d, %Y" }}</p>
    {% if post.excerpt %}
    <p class="post-card__excerpt">{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
    {% endif %}
    <a href="{{ post.url | relative_url }}" class="post-card__link">Read recap →</a>
  </article>
  {% endfor %}
</div>
{% else %}
<p class="empty-state">Weekly recaps will appear here starting this Friday!</p>
{% endif %}

---

## <span id="blog-posts">💬 Community Updates</span>

<p class="section-description">Announcements, stories, and updates from the 3mpwr community. Learn about new features, community achievements, and important information directly from our team.</p>

<div class="posts-list">
  {% assign community_post_count = 0 %}
  {% for post in site.posts limit:50 %}
    {% unless post.tags contains 'highlights' or post.tags contains 'weekly' or post.tags contains 'features' or post.tags contains 'spotlight' %}
      {% assign community_post_count = community_post_count | plus: 1 %}
      <article class="post-item">
        <h3 class="post-item__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        <p class="post-item__date">📅 {{ post.date | date: "%B %-d, %Y" }}</p>
        {% if post.excerpt %}
        <p class="post-item__excerpt">{{ post.excerpt | strip_html | truncatewords: 30 }}</p>
        {% endif %}
        {% if post.categories and post.categories.size > 0 %}
        <p class="post-item__categories">
          {% for category in post.categories limit:3 %}
            <span class="category-badge">{{ category }}</span>
          {% endfor %}
        </p>
        {% endif %}
        <a href="{{ post.url | relative_url }}" class="post-item__link">Read more →</a>
      </article>
    {% endunless %}
  {% endfor %}
  {% if community_post_count == 0 %}
  <p class="empty-state">Community blog posts coming soon!</p>
  {% endif %}
</div>

---

## <span id="all-curated">📚 All Curated Daily Highlights</span>

<details class="all-posts-archive">
  <summary>View complete archive of daily highlights ({{ daily.size }} posts)</summary>
  <div class="archive-list">
    {% for post in daily %}
    <div class="archive-item">
      <span class="archive-date">{{ post.date | date: "%Y-%m-%d" }}</span>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </div>
    {% endfor %}
  </div>
</details>

---

<style>
/* =============================================
   BLOG PAGE — THEME-AWARE STYLES
   Uses the site's canonical CSS variables:
   --text-primary, --text-secondary, --text-link,
   --bg-color, set by universal-text-legibility.css
   ============================================= */

/* ---- Base tokens bridged for blog page ---- */
.blog-page-root,
.blog-page-root *,
body {
  /* nothing here — rely on universal-text-legibility.css */
}

/* ---- Social box ---- */
.blog-social-box {
  background: color-mix(in srgb, var(--text-link, #003d7a) 8%, transparent);
  border: 2px solid var(--text-link, #003d7a);
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
}

/* ---- Navigation bar ---- */
.blog-navigation {
  background: color-mix(in srgb, currentColor 5%, transparent);
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
}

.blog-navigation a {
  color: var(--text-link, #003d7a);
  text-decoration: none;
  font-weight: 600;
  padding: 0 0.5rem;
}

.blog-navigation a:hover,
.blog-navigation a:focus {
  text-decoration: underline;
}

/* ---- Section description ---- */
.section-description {
  border-left: 4px solid var(--text-link, #003d7a);
  padding: 1rem 1rem 1rem 1.25rem;
  margin: 1rem 0 2rem;
  font-style: italic;
  color: var(--text-secondary, #404040);
  /* background inherits page bg */
}

/* ---- Post grid ---- */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

/* ---- Post cards ---- */
.post-card {
  /* Light mode */
  background: var(--bg-color, #ffffff);
  border: 1px solid color-mix(in srgb, var(--text-primary, #111) 20%, transparent);
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
}

.post-card:hover {
  box-shadow: 0 8px 20px color-mix(in srgb, var(--text-primary, #111) 18%, transparent);
  transform: translateY(-2px);
  border-color: var(--text-link, #003d7a);
}

.post-card__badge {
  position: absolute;
  top: -10px;
  right: 15px;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  /* default — overridden per type */
  background: var(--text-link, #003d7a);
  color: var(--text-on-color);
}

.post-card--curated .post-card__badge  { background: var(--info-bg); }
.post-card--feature .post-card__badge  { background: var(--error-bg); }
.post-card--weekly  .post-card__badge  { background: var(--info-border); }

/* Headings/links inside cards — inherit from universal CSS */
.post-card__title {
  margin: 0.5rem 0 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
}

.post-card__date {
  font-size: 0.9rem;
  margin: 0.5rem 0;
  color: var(--text-secondary, #404040);
}

.post-card__excerpt {
  line-height: 1.6;
  margin: 1rem 0;
  color: var(--text-secondary, #404040);
}

.post-card__link {
  display: inline-block;
  font-weight: 600;
  margin-top: 0.5rem;
  color: var(--text-link, #003d7a);
  text-decoration: none;
}

.post-card__link:hover,
.post-card__link:focus {
  text-decoration: underline;
}

/* ---- Post list items ---- */
.posts-list { margin: 2rem 0; }

.post-item {
  background: var(--bg-color, #ffffff);
  border: 1px solid color-mix(in srgb, var(--text-primary, #111) 20%, transparent);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.post-item:hover {
  box-shadow: 0 4px 12px color-mix(in srgb, var(--text-primary, #111) 15%, transparent);
  border-color: var(--text-link, #003d7a);
}

.post-item__title { margin: 0 0 0.5rem; font-weight: 700; }

.post-item__date {
  font-size: 0.9rem;
  margin: 0.5rem 0;
  color: var(--text-secondary, #404040);
}

.post-item__excerpt  { line-height: 1.6; margin: 1rem 0; color: var(--text-secondary, #404040); }

.post-item__categories {
  margin: 0.75rem 0 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: color-mix(in srgb, var(--text-link, #003d7a) 15%, transparent);
  color: var(--text-link, #003d7a);
  border: 1px solid var(--text-link, #003d7a);
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.post-item__link {
  display: inline-block;
  font-weight: 600;
  color: var(--text-link, #003d7a);
  text-decoration: none;
}

.post-item__link:hover,
.post-item__link:focus { text-decoration: underline; }

/* ---- Empty state ---- */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  font-style: italic;
  border: 1px dashed color-mix(in srgb, var(--text-primary, #111) 30%, transparent);
  border-radius: 8px;
  margin: 2rem 0;
  color: var(--text-secondary, #404040);
}

/* ---- Secondary button ---- */
.btn-secondary {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: transparent;
  border: 2px solid var(--text-link, #003d7a);
  color: var(--text-link, #003d7a) !important;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 700;
  transition: background 0.2s ease, color 0.2s ease;
}

.btn-secondary:hover,
.btn-secondary:focus {
  background: var(--text-link, #003d7a);
  color: var(--text-on-color) !important;
}

/* ---- Archive ---- */
.all-posts-archive {
  border: 1px solid color-mix(in srgb, var(--text-primary, #111) 20%, transparent);
  border-radius: 8px;
  padding: 1rem;
  margin: 2rem 0;
}

.all-posts-archive summary {
  cursor: pointer;
  font-weight: 700;
  color: var(--text-link, #003d7a);
  padding: 0.5rem;
}

.all-posts-archive summary:hover { text-decoration: underline; }

.archive-list {
  margin-top: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.archive-item {
  padding: 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--text-primary, #111) 12%, transparent);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.archive-item:last-child { border-bottom: none; }

.archive-date {
  font-family: monospace;
  font-size: 0.9rem;
  min-width: 100px;
  color: var(--text-secondary, #404040);
}

/* =============================================
   DARK MODE — card backgrounds
   (text is already handled by universal CSS)
   ============================================= */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .post-card,
  :root:not([data-theme="light"]) .post-item,
  :root:not([data-theme="light"]) .empty-state {
    background: color-mix(in srgb, #ffffff 6%, #000000);
  }
  :root:not([data-theme="light"]) .blog-social-box {
    background: color-mix(in srgb, var(--text-link, #80c1ff) 12%, transparent);
    border-color: var(--text-link, #80c1ff);
  }
}

[data-theme="dark"] .post-card,
[data-theme="dark"] .post-item,
[data-theme="dark"] .empty-state {
  background: color-mix(in srgb, #ffffff 6%, #000000);
}

[data-theme="dark"] .blog-social-box {
  background: color-mix(in srgb, var(--text-link, #80c1ff) 12%, transparent);
  border-color: var(--text-link, #80c1ff);
}

/* =============================================
   HIGH CONTRAST MODE
   ============================================= */
@media (prefers-contrast: more) {
  .post-card,
  .post-item {
    border: 3px solid currentColor !important;
    background: Canvas !important;
  }

  .post-card__badge {
    background: CanvasText !important;
    color: Canvas !important;
    border: 2px solid Canvas !important;
  }

  .post-card--curated .post-card__badge,
  .post-card--feature .post-card__badge,
  .post-card--weekly  .post-card__badge {
    background: CanvasText !important;
    color: Canvas !important;
  }

  .btn-secondary {
    border: 3px solid currentColor !important;
    background: Canvas !important;
    color: CanvasText !important;
  }

  .blog-social-box {
    background: Canvas !important;
    border: 3px solid CanvasText !important;
  }

  .section-description {
    border-left: 4px solid CanvasText !important;
    background: Canvas !important;
  }
}

/* data-contrast="high" attribute (site's own toggle) */
[data-contrast="high"] .post-card,
[data-contrast="high"] .post-item {
  border: 3px solid #000 !important;
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

[data-contrast="high"] .post-card__title a,
[data-contrast="high"] .post-item__title a { color: var(--text-primary) !important; }

[data-contrast="high"] .post-card__badge {
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border: 2px solid #fff !important;
}

[data-contrast="high"] .post-card--curated .post-card__badge,
[data-contrast="high"] .post-card--feature .post-card__badge,
[data-contrast="high"] .post-card--weekly  .post-card__badge {
  background: var(--bg-primary) !important;
}

[data-contrast="high"] .btn-secondary {
  border: 3px solid #000 !important;
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

/* =============================================
   FORCED COLORS (Windows High Contrast)
   ============================================= */
@media (forced-colors: active) {
  .post-card, .post-item {
    border: 2px solid ButtonText !important;
    background: Canvas !important;
    color: CanvasText !important;
    forced-color-adjust: auto;
  }
  .post-card__badge {
    background: ButtonFace !important;
    color: ButtonText !important;
    forced-color-adjust: auto;
  }
  .post-card__link,
  .post-item__link,
  .blog-navigation a,
  .archive-item a { color: LinkText !important; }
  .btn-secondary {
    background: ButtonFace !important;
    color: ButtonText !important;
    border: 2px solid ButtonText !important;
    forced-color-adjust: auto;
  }
}

/* =============================================
   RESPONSIVE
   ============================================= */
@media (max-width: 768px) {
  .posts-grid { grid-template-columns: 1fr; }
  .blog-navigation { font-size: 0.9rem; }
  .blog-navigation a { display: inline-block; margin: 0.25rem; }
}

@media (prefers-reduced-motion: reduce) {
  .post-card, .post-item, .btn-secondary { transition: none; }
  .post-card:hover, .post-item:hover { transform: none; }
</style>

<!-- To add a blog post, create a markdown file in the _posts/ directory with the format YYYY-MM-DD-title.md -->
<!-- Use tags: 'highlights' for daily curation, 'weekly' for recaps, 'feature' for articles -->

```

{%- include page-feedback.html -%}
