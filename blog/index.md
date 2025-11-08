---
layout: default
title: Blog
description: News, updates, and stories from the 3mpwr community.
---


{%- include status-banner.html -%}

# 3mpwr App Blog

Welcome to our blog! Stay informed with daily news highlights, feature spotlights, weekly recaps, and community updates.

<div class="blog-navigation">
  <a href="#curated-daily">📰 Daily News Highlights</a> |
  <a href="#feature-articles">✨ Feature Spotlights</a> |
  <a href="#weekly-recaps">📅 Weekly Recaps</a> |
  <a href="#blog-posts">💬 Community Updates</a>
</div>

<p style="margin-top: 1rem;"><strong>Subscribe:</strong> <a href="{{ '/feed.xml' | relative_url }}">RSS feed</a> | <a href="{{ '/newsletter' | relative_url }}">Newsletter</a></p>

<div style="background: var(--card-bg, #f0f8ff); border: 2px solid var(--link-color, #007bff); border-radius: 8px; padding: 1rem; margin: 1.5rem 0;">
  <h3 style="margin-top: 0;">📱 Follow Us on Social Media</h3>
  <p>Get daily news and updates delivered to your feed!</p>
  <ul style="margin-bottom: 0;">
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

<p class="section-description">In-depth spotlights on 3mpwrApp tools and features. Learn how Evidence Locker, Letter Generator, Disability Wizard, Legal Workflow Automation, and more can help you advocate for your rights, navigate systems, and connect with your community.</p>

{% assign feature_articles = site.posts | where_exp: 'p', "p.tags contains 'features' or p.tags contains 'spotlight'" %}
{% if feature_articles and feature_articles.size > 0 %}
<div class="posts-grid">
  {% for post in feature_articles limit:6 %}
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

## <span id="weekly-recaps">� Weekly Recaps</span>

<p class="section-description">Every Monday, we compile the week's most important updates, new features, improvements, and fixes into one easy-to-read recap. Perfect for staying up-to-date on what's changed!</p>

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

{% assign regular_posts = site.posts | where_exp: 'p', "p.tags contains 'highlights' or p.tags contains 'weekly' or p.tags contains 'features' or p.tags contains 'spotlight'" | size %}
{% assign all_posts_count = site.posts | size %}
{% if all_posts_count > regular_posts %}
<div class="posts-list">
  {% for post in site.posts %}
    {% unless post.tags contains 'highlights' or post.tags contains 'weekly' or post.tags contains 'features' or post.tags contains 'spotlight' %}
    <article class="post-item">
      <h3 class="post-item__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <p class="post-item__date">📅 {{ post.date | date: "%B %-d, %Y" }}</p>
      {% if post.excerpt %}
      <p class="post-item__excerpt">{{ post.excerpt | strip_html | truncatewords: 30 }}</p>
      {% endif %}
      <a href="{{ post.url | relative_url }}" class="post-item__link">Read more →</a>
    </article>
    {% endunless %}
  {% endfor %}
</div>
{% else %}
<p class="empty-state">Community blog posts coming soon!</p>
{% endif %}

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
.blog-navigation {
  background: var(--card-bg, #f5f5f5);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
  border: 1px solid var(--border-color, #ddd);
}

.blog-navigation a {
  color: var(--link-color, #007bff);
  text-decoration: none;
  font-weight: 600;
  padding: 0 0.5rem;
}

.blog-navigation a:hover {
  text-decoration: underline;
  color: var(--link-hover, #0056b3);
}

.section-description {
  background: var(--card-bg, #f9f9f9);
  border-left: 4px solid var(--link-color, #007bff);
  padding: 1rem;
  margin: 1rem 0 2rem;
  font-style: italic;
  color: var(--text-secondary, #555);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.post-card {
  background: var(--main-bg, white);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  color: var(--text-color, #333);
}

.post-card:hover {
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  transform: translateY(-2px);
  border-color: var(--link-color, #007bff);
}

.post-card__badge {
  position: absolute;
  top: -10px;
  right: 15px;
  background: var(--link-color, #007bff);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.post-card--curated .post-card__badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.post-card--feature .post-card__badge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.post-card--weekly .post-card__badge {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.post-card__title {
  margin: 0.5rem 0 0.75rem;
  font-size: 1.25rem;
}

.post-card__title a {
  color: var(--text-color, #333);
  text-decoration: none;
}

.post-card__title a:hover {
  color: var(--link-color, #007bff);
}

.post-card__date {
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.post-card__excerpt {
  color: var(--text-color, #555);
  line-height: 1.6;
  margin: 1rem 0;
}

.post-card__link {
  display: inline-block;
  color: var(--link-color, #007bff);
  text-decoration: none;
  font-weight: 600;
  margin-top: 0.5rem;
}

.post-card__link:hover {
  text-decoration: underline;
}

.posts-list {
  margin: 2rem 0;
}

.post-item {
  background: var(--main-bg, white);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: box-shadow 0.3s ease;
  color: var(--text-color, #333);
}

.post-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: var(--link-color, #007bff);
}

.post-item__title {
  margin: 0 0 0.5rem;
}

.post-item__title a {
  color: var(--text-color, #333);
  text-decoration: none;
}

.post-item__title a:hover {
  color: var(--link-color, #007bff);
}

.post-item__date {
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.post-item__excerpt {
  color: var(--text-color, #555);
  line-height: 1.6;
  margin: 1rem 0;
}

.post-item__link {
  display: inline-block;
  color: var(--link-color, #007bff);
  text-decoration: none;
  font-weight: 600;
}

.post-item__link:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary, #666);
  font-style: italic;
  background: var(--card-bg, #f9f9f9);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  margin: 2rem 0;
}

.btn-secondary {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--main-bg, white);
  border: 2px solid var(--link-color, #007bff);
  color: var(--link-color, #007bff);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--link-color, #007bff);
  color: white;
}

.all-posts-archive {
  background: var(--card-bg, #f9f9f9);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  padding: 1rem;
  margin: 2rem 0;
}

.all-posts-archive summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--link-color, #007bff);
  padding: 0.5rem;
}

.all-posts-archive summary:hover {
  text-decoration: underline;
}

.archive-list {
  margin-top: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.archive-item {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color, #eee);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.archive-item:last-child {
  border-bottom: none;
}

.archive-date {
  color: var(--text-secondary, #666);
  font-family: monospace;
  font-size: 0.9rem;
  min-width: 100px;
}

.archive-item a {
  color: var(--text-color, #333);
  text-decoration: none;
}

.archive-item a:hover {
  color: var(--link-color, #007bff);
  text-decoration: underline;
}

/* Dark mode specific styles */
body[data-theme="dark"] .post-card,
body[data-theme="dark"] .post-item {
  background: var(--main-bg, #111a2b);
  border-color: var(--border-color, #355c7d);
}

body[data-theme="dark"] .empty-state {
  background: var(--main-bg, #111a2b);
  border-color: var(--border-color, #355c7d);
  color: var(--text-color, #f2f5f9);
}

/* High contrast mode */
body[data-contrast="high"] .post-card,
body[data-contrast="high"] .post-item {
  border: 3px solid #000 !important;
}

body[data-contrast="high"] .post-card__badge {
  background: #000 !important;
  color: #fff !important;
  border: 2px solid #fff !important;
}

body[data-contrast="high"] .btn-secondary {
  border: 3px solid #000 !important;
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .blog-navigation {
    font-size: 0.9rem;
  }
  
  .blog-navigation a {
    display: inline-block;
    margin: 0.25rem;
  }
}

/* Accessibility: Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .post-card,
  .post-item,
  .btn-secondary {
    transition: none;
  }
  
  .post-card:hover,
  .post-item:hover {
    transform: none;
  }
}
</style>

<!-- To add a blog post, create a markdown file in the _posts/ directory with the format YYYY-MM-DD-title.md -->
<!-- Use tags: 'highlights' for daily curation, 'weekly' for recaps, 'feature' for articles -->

```

{%- include page-feedback.html -%}
