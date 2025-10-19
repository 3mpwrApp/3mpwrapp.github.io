---
layout: default
title: What's New
description: Latest updates, features, and improvements to 3mpwrApp
permalink: /whats-new/
---

# What's New 🎉

Stay up to date with the latest features, improvements, and fixes to 3mpwrApp.

---

## Recent Updates (Last 30 Days)

{% assign thirty_days_ago = site.time | date: '%s' | minus: 2592000 %}

<div class="updates-list">
{% for update in site.data.updates %}
  {% assign update_timestamp = update.date | date: '%s' %}
  {% if update_timestamp >= thirty_days_ago %}
  <article class="update-item" data-date="{{ update.date }}">
    <header class="update-header">
      <h3>{{ update.title }}</h3>
      <time datetime="{{ update.date | date: '%Y-%m-%d' }}">
        {{ update.date | date: '%B %d, %Y' }}
      </time>
      {% if update.type %}
      <span class="update-type update-type-{{ update.type }}">
        {% if update.type == 'feature' %}✨ Feature
        {% elsif update.type == 'improvement' %}🚀 Improvement
        {% elsif update.type == 'fix' %}🐛 Fix
        {% elsif update.type == 'security' %}🔒 Security
        {% elsif update.type == 'accessibility' %}♿ Accessibility
        {% elsif update.type == 'performance' %}⚡ Performance
        {% else %}📝 Update
        {% endif %}
      </span>
      {% endif %}
    </header>
    
    <div class="update-content">
      {{ update.description | markdownify }}
    </div>
    
    {% if update.details %}
    <details class="update-details">
      <summary>View Details</summary>
      <div class="update-details-content">
        {{ update.details | markdownify }}
      </div>
    </details>
    {% endif %}
    
    {% if update.link %}
    <a href="{{ update.link }}" class="update-link">Learn More →</a>
    {% endif %}
  </article>
  {% endif %}
{% endfor %}
</div>

---

## Archives

View updates from previous months to see how 3mpwrApp has evolved.

<div class="archives-list">
  <a href="/whats-new/archives/" class="archive-link">📦 View All Archives →</a>
</div>

---

## Stay Updated

<div class="update-subscription">
  <h3>Never Miss an Update</h3>
  <p>Get notified when we release new features and improvements.</p>
  
  <div class="subscription-options">
    <a href="/newsletter/" class="btn btn-primary">📧 Subscribe to Newsletter</a>
    <a href="https://github.com/3mpowrApp/3mpwrapp.github.io/releases" class="btn btn-secondary" target="_blank">👀 Watch on GitHub</a>
  </div>
</div>

---

## Suggest a Feature

Have an idea for a new feature? We'd love to hear it!

<a href="/contact/?subject=Feature Request" class="btn btn-secondary">💡 Submit Your Idea</a>

<style>
.updates-list {
  margin: 2rem 0;
}

.update-item {
  background: var(--card-bg, #f9f9f9);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: box-shadow 0.3s ease;
}

.update-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.update-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.update-header h3 {
  margin: 0;
  flex: 1;
}

.update-header time {
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
}

.update-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.update-type-feature {
  background: #e3f2fd;
  color: #1976d2;
}

.update-type-improvement {
  background: #f3e5f5;
  color: #7b1fa2;
}

.update-type-fix {
  background: #fff3e0;
  color: #e65100;
}

.update-type-security {
  background: #ffebee;
  color: #c62828;
}

.update-type-accessibility {
  background: #e8f5e9;
  color: #2e7d32;
}

.update-type-performance {
  background: #fff9c4;
  color: #f57f17;
}

.update-content {
  margin: 1rem 0;
  line-height: 1.6;
}

.update-details {
  margin-top: 1rem;
  border-top: 1px solid var(--border-color, #ddd);
  padding-top: 1rem;
}

.update-details summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--primary-color, #007bff);
}

.update-details-content {
  margin-top: 1rem;
  padding-left: 1rem;
}

.update-link {
  display: inline-block;
  margin-top: 1rem;
  color: var(--primary-color, #007bff);
  text-decoration: none;
  font-weight: 600;
}

.update-link:hover {
  text-decoration: underline;
}

.archives-list {
  text-align: center;
  margin: 2rem 0;
}

.archive-link {
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--card-bg, #f9f9f9);
  border: 2px solid var(--border-color, #ddd);
  border-radius: 8px;
  color: var(--text-color, #333);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.archive-link:hover {
  background: var(--primary-color, #007bff);
  color: white;
  border-color: var(--primary-color, #007bff);
}

.update-subscription {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  margin: 2rem 0;
}

.update-subscription h3 {
  margin-top: 0;
  color: white;
}

.subscription-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

@media (max-width: 768px) {
  .update-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .subscription-options {
    flex-direction: column;
  }
}
</style>
