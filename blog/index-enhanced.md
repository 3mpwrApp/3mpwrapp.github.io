---
layout: default
title: Blog
description: News, updates, and stories from the 3mpwr community.
---

{%- include status-banner.html -%}

# 3mpwr App Blog

Our blog is organized into 6 core topics that matter to you. Find what you need:

<div class="topic-nav-grid">
  <a href="#workers-rights" class="topic-nav-card">
    <div class="topic-icon">⚖️</div>
    <h3>Workers Rights & Compensation</h3>
    <p>WSIB, workplace injuries, return to work strategies</p>
  </a>
  
  <a href="#disability-benefits" class="topic-nav-card">
    <div class="topic-icon">💰</div>
    <h3>Disability Benefits Navigation</h3>
    <p>ODSP, AISH, CPP-D, DTC, and how to apply</p>
  </a>
  
  <a href="#accessibility" class="topic-nav-card">
    <div class="topic-icon">♿</div>
    <h3>Accessibility & Inclusive Design</h3>
    <p>Accessible technology, barrier removal, inclusive practices</p>
  </a>
  
  <a href="#legal-victories" class="topic-nav-card">
    <div class="topic-icon">⚔️</div>
    <h3>Legal Victories & Rights</h3>
    <p>Court decisions, human rights cases, landmark rulings</p>
  </a>
  
  <a href="#health-wellness" class="topic-nav-card">
    <div class="topic-icon">🧘</div>
    <h3>Health & Wellness Support</h3>
    <p>Mental health, chronic illness, wellness resources</p>
  </a>
  
  <a href="#community-action" class="topic-nav-card">
    <div class="topic-icon">🤝</div>
    <h3>Community Action & Events</h3>
    <p>Events, campaigns, community spotlights, getting involved</p>
  </a>
</div>

<hr class="section-divider">

<p style="margin-top: 1rem; text-align: center;">
  <strong>Stay Updated:</strong> 
  <a href="{{ '/feed.xml' | relative_url }}">RSS feed</a> | 
  <a href="{{ '/newsletter' | relative_url }}">Newsletter</a> |
  <a href="#follow-social">Follow on social</a>
</p>

<div style="background: var(--card-bg, #f0f8ff); border: 2px solid var(--link-color, #007bff); border-radius: 8px; padding: 1rem; margin: 1.5rem 0;">
  <h3 id="follow-social" style="margin-top: 0;">📱 Follow Us on Social Media</h3>
  <p>Get daily updates delivered to your feed!</p>
  <ul style="margin-bottom: 0;">
    <li><strong>Mastodon:</strong> <a href="https://mastodon.social/@3mpwrapp" target="_blank" rel="noopener">@3mpwrapp@mastodon.social</a> - Daily updates at 9 AM UTC</li>
    <li><strong>Bluesky:</strong> <a href="https://bsky.app/profile/3mpwrapp.bsky.social" target="_blank" rel="noopener">@3mpwrapp.bsky.social</a> - Daily updates at 9 AM UTC</li>
    <li><strong>X/Twitter:</strong> <a href="https://x.com/3mpwrApp0816" target="_blank" rel="noopener">@3mpwrApp0816</a> - Breaking news & quick tips</li>
  </ul>
</div>

---

## <span id="workers-rights">⚖️ Workers Rights & Compensation</span>

<p class="section-description">Workplace injury recovery, WSIB claims, return-to-work support, and your rights as an injured worker. Includes strategies for fighting denials and understanding compensation.</p>

{% assign posts = site.posts | where_exp: 'p', "p.categories contains 'workers-rights'" %}
{% if posts and posts.size > 0 %}
<div class="posts-grid">
  {% for post in posts limit:6 %}
  <article class="post-card">
    <h3 class="post-card__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p class="post-card__date">📅 {{ post.date | date: "%B %-d, %Y" }}</p>
    {% if post.excerpt %}
    <p class="post-card__excerpt">{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
    {% endif %}
    <a href="{{ post.url | relative_url }}" class="post-card__link">Read more →</a>
  </article>
  {% endfor %}
</div>
{% else %}
<p class="no-posts">Check back soon for updates on workers' rights and compensation.</p>
{% endif %}

<p style="text-align: center; margin-top: 1.5rem;">
  <a href="{{ '/newsletter' | relative_url }}" class="cta-button">Get updates on workers' rights</a>
</p>

---

## <span id="disability-benefits">💰 Disability Benefits Navigation</span>

<p class="section-description">Everything about applying for, maintaining, and maximizing disability benefits. Covers ODSP, AISH, CPP-D, DTC, and income assistance programs across Canada.</p>

{% assign posts = site.posts | where_exp: 'p', "p.categories contains 'disability-benefits'" %}
{% if posts and posts.size > 0 %}
<div class="posts-grid">
  {% for post in posts limit:6 %}
  <article class="post-card">
    <h3 class="post-card__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p class="post-card__date">📅 {{ post.date | date: "%B %-d, %Y" }}</p>
    {% if post.excerpt %}
    <p class="post-card__excerpt">{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
    {% endif %}
    <a href="{{ post.url | relative_url }}" class="post-card__link">Read more →</a>
  </article>
  {% endfor %}
</div>
{% else %}
<p class="no-posts">Check back soon for benefits navigation guides.</p>
{% endif %}

<p style="text-align: center; margin-top: 1.5rem;">
  <a href="{{ '/newsletter' | relative_url }}" class="cta-button">Get benefits updates</a>
</p>

---

## <span id="accessibility">♿ Accessibility & Inclusive Design</span>

<p class="section-description">Breaking barriers to access. Digital accessibility, inclusive design principles, assistive technology, and organizations removing obstacles to independence.</p>

{% assign posts = site.posts | where_exp: 'p', "p.categories contains 'accessibility'" %}
{% if posts and posts.size > 0 %}
<div class="posts-grid">
  {% for post in posts limit:6 %}
  <article class="post-card">
    <h3 class="post-card__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p class="post-card__date">📅 {{ post.date | date: "%B %-d, %Y" }}</p>
    {% if post.excerpt %}
    <p class="post-card__excerpt">{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
    {% endif %}
    <a href="{{ post.url | relative_url }}" class="post-card__link">Read more →</a>
  </article>
  {% endfor %}
</div>
{% else %}
<p class="no-posts">Check back soon for accessibility updates.</p>
{% endif %}

<p style="text-align: center; margin-top: 1.5rem;">
  <a href="{{ '/newsletter' | relative_url }}" class="cta-button">Get accessibility updates</a>
</p>

---

## <span id="legal-victories">⚔️ Legal Victories & Rights</span>

<p class="section-description">Court decisions, human rights rulings, and landmark cases that protect disability rights. Understand what these victories mean for you.</p>

{% assign posts = site.posts | where_exp: 'p', "p.categories contains 'legal-victories'" %}
{% if posts and posts.size > 0 %}
<div class="posts-grid">
  {% for post in posts limit:6 %}
  <article class="post-card">
    <h3 class="post-card__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p class="post-card__date">📅 {{ post.date | date: "%B %-d, %Y" }}</p>
    {% if post.excerpt %}
    <p class="post-card__excerpt">{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
    {% endif %}
    <a href="{{ post.url | relative_url }}" class="post-card__link">Read more →</a>
  </article>
  {% endfor %}
</div>
{% else %}
<p class="no-posts">Check back soon for legal victory updates.</p>
{% endif %}

<p style="text-align: center; margin-top: 1.5rem;">
  <a href="{{ '/newsletter' | relative_url }}" class="cta-button">Get legal updates</a>
</p>

---

## <span id="health-wellness">🧘 Health & Wellness Support</span>

<p class="section-description">Mental health resources, chronic illness management, wellness strategies, and self-care for the disability community. Practical support for your wellbeing.</p>

{% assign posts = site.posts | where_exp: 'p', "p.categories contains 'health-wellness'" %}
{% if posts and posts.size > 0 %}
<div class="posts-grid">
  {% for post in posts limit:6 %}
  <article class="post-card">
    <h3 class="post-card__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p class="post-card__date">📅 {{ post.date | date: "%B %-d, %Y" }}</p>
    {% if post.excerpt %}
    <p class="post-card__excerpt">{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
    {% endif %}
    <a href="{{ post.url | relative_url }}" class="post-card__link">Read more →</a>
  </article>
  {% endfor %}
</div>
{% else %}
<p class="no-posts">Check back soon for wellness updates.</p>
{% endif %}

<p style="text-align: center; margin-top: 1.5rem;">
  <a href="{{ '/newsletter' | relative_url }}" class="cta-button">Get wellness updates</a>
</p>

---

## <span id="community-action">🤝 Community Action & Events</span>

<p class="section-description">Community spotlights, upcoming events, campaigns you can join, and stories from people making a difference. Get involved and build with us.</p>

{% assign posts = site.posts | where_exp: 'p', "p.categories contains 'community-action'" %}
{% if posts and posts.size > 0 %}
<div class="posts-grid">
  {% for post in posts limit:6 %}
  <article class="post-card">
    <h3 class="post-card__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p class="post-card__date">📅 {{ post.date | date: "%B %-d, %Y" }}</p>
    {% if post.excerpt %}
    <p class="post-card__excerpt">{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
    {% endif %}
    <a href="{{ post.url | relative_url }}" class="post-card__link">Read more →</a>
  </article>
  {% endfor %}
</div>
{% else %}
<p class="no-posts">Check back soon for community updates.</p>
{% endif %}

<p style="text-align: center; margin-top: 1.5rem;">
  <a href="{{ '/newsletter' | relative_url }}" class="cta-button">Get community updates</a>
</p>

---

## Latest from Our Daily News Feed

Our team curates 50 stories daily from 25+ trusted sources. Here's a snapshot of what's trending today:

<div style="background: var(--card-bg, #f0f8ff); border-left: 4px solid var(--link-color, #007bff); padding: 1rem; margin: 2rem 0;">
  <h3 style="margin-top: 0;">📰 Check out our daily curation</h3>
  <p>See all 50+ curated stories covering disability, accessibility, workers' rights, and social policy changes.</p>
  <a href="{{ '/blog' | relative_url }}#curated-daily" class="cta-button">View today's curation</a>
</div>

---

<style>
.topic-nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.topic-nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  background: var(--card-bg, #f8f9fa);
  border: 2px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.topic-nav-card:hover {
  border-color: var(--link-color, #007bff);
  background: var(--hover-bg, #f0f8ff);
  transform: translateY(-2px);
}

.topic-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.topic-nav-card h3 {
  margin: 0.5rem 0;
  color: var(--link-color, #007bff);
}

.topic-nav-card p {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: var(--text-muted, #666);
}

.section-divider {
  margin: 3rem 0 2rem 0;
  border: none;
  border-top: 2px solid var(--border-color, #e0e0e0);
}

.section-description {
  font-size: 1.05rem;
  color: var(--text-muted, #666);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.post-card {
  padding: 1.5rem;
  background: var(--card-bg, white);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.post-card:hover {
  border-color: var(--link-color, #007bff);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.post-card__title {
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.post-card__title a {
  color: var(--link-color, #007bff);
  text-decoration: none;
}

.post-card__title a:hover {
  text-decoration: underline;
}

.post-card__date {
  font-size: 0.85rem;
  color: var(--text-muted, #999);
  margin: 0;
}

.post-card__excerpt {
  margin: 0.75rem 0;
  font-size: 0.95rem;
  color: var(--text-secondary, #555);
  flex-grow: 1;
}

.post-card__link {
  color: var(--link-color, #007bff);
  text-decoration: none;
  font-weight: 500;
  align-self: flex-start;
  margin-top: 0.75rem;
}

.post-card__link:hover {
  text-decoration: underline;
}

.no-posts {
  color: var(--text-muted, #999);
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--link-color, #007bff);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: var(--link-hover-color, #0056b3);
  text-decoration: none;
}

/* Accessibility */
.post-card:focus-within {
  outline: 2px solid var(--focus-color, #0056b3);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .topic-nav-grid {
    grid-template-columns: 1fr;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>

{%- include page-feedback.html -%}
