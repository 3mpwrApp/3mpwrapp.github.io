---
layout: default
title: Update Archives
description: Historical record of all 3mpwrApp updates, features, and improvements
permalink: /whats-new/archives/
---


{%- include status-banner.html -%}

# Update Archives 📦

A complete historical record of all updates to 3mpwrApp. Browse by year and month to see how we've evolved.

---

## Archive by Date

{% assign updates_by_year = site.data.updates | group_by_exp: "update", "update.date | date: '%Y'" | sort: 'name' | reverse %}

{% for year_group in updates_by_year %}
  {% assign year = year_group.name %}
  {% assign year_updates = year_group.items %}
  
  <section class="archive-year">
    <h2>{{ year }}</h2>
    
    {% assign updates_by_month = year_updates | group_by_exp: "update", "update.date | date: '%B'" %}
    
    {% for month_group in updates_by_month %}
      {% assign month = month_group.name %}
      {% assign month_updates = month_group.items | sort: 'date' | reverse %}
      
      <details class="archive-month" open>
        <summary>
          <h3>{{ month }} {{ year }} <span class="count">({{ month_updates | size }} updates)</span></h3>
        </summary>
        
        <div class="updates-list">
          {% for update in month_updates %}
          <article class="update-item">
            <header class="update-header">
              <h4>{{ update.title }}</h4>
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
          {% endfor %}
        </div>
      </details>
    {% endfor %}
  </section>
{% endfor %}

---

## Archive Statistics

{% assign total_updates = site.data.updates | size %}
{% assign feature_updates = site.data.updates | where: "type", "feature" | size %}
{% assign improvement_updates = site.data.updates | where: "type", "improvement" | size %}
{% assign fix_updates = site.data.updates | where: "type", "fix" | size %}
{% assign accessibility_updates = site.data.updates | where: "type", "accessibility" | size %}
{% assign performance_updates = site.data.updates | where: "type", "performance" | size %}
{% assign security_updates = site.data.updates | where: "type", "security" | size %}

<div class="archive-stats">
  <div class="stat-card">
    <div class="stat-number">{{ total_updates }}</div>
    <div class="stat-label">Total Updates</div>
  </div>
  
  <div class="stat-card">
    <div class="stat-number">{{ feature_updates }}</div>
    <div class="stat-label">✨ Features</div>
  </div>
  
  <div class="stat-card">
    <div class="stat-number">{{ improvement_updates }}</div>
    <div class="stat-label">🚀 Improvements</div>
  </div>
  
  <div class="stat-card">
    <div class="stat-number">{{ accessibility_updates }}</div>
    <div class="stat-label">♿ Accessibility</div>
  </div>
  
  <div class="stat-card">
    <div class="stat-number">{{ performance_updates }}</div>
    <div class="stat-label">⚡ Performance</div>
  </div>
  
  <div class="stat-card">
    <div class="stat-number">{{ security_updates }}</div>
    <div class="stat-label">🔒 Security</div>
  </div>
</div>

---

## Transparency Commitment

We believe in **radical transparency**. Every change, no matter how small, is documented here so you can:

- ✅ See exactly what we're working on
- ✅ Track our progress over time
- ✅ Understand why changes were made
- ✅ Hold us accountable to our commitments
- ✅ Provide feedback on our direction

---

<div class="back-to-current">
  <a href="/whats-new/" class="btn btn-primary">← Back to Recent Updates</a>
</div>

<style>
.archive-year {
  margin-bottom: 3rem;
}

.archive-year h2 {
  color: var(--primary-color, #007bff);
  border-bottom: 3px solid var(--primary-color, #007bff);
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.archive-month {
  margin-bottom: 2rem;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  padding: 1rem;
  background: var(--card-bg, #f9f9f9);
}

.archive-month summary {
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.archive-month summary::-webkit-details-marker {
  display: none;
}

.archive-month summary h3 {
  display: inline-block;
  margin: 0;
  font-size: 1.5rem;
}

.archive-month summary h3::before {
  content: '▶';
  display: inline-block;
  margin-right: 0.5rem;
  transition: transform 0.3s ease;
}

.archive-month[open] summary h3::before {
  transform: rotate(90deg);
}

.count {
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
  font-weight: normal;
}

.updates-list {
  margin-top: 1.5rem;
}

.update-item {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.update-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.update-header h4 {
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

.archive-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.back-to-current {
  text-align: center;
  margin: 3rem 0;
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
  background: var(--primary-color, #007bff);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

@media (max-width: 768px) {
  .update-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .archive-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

{%- include page-feedback.html -%}
