---
layout: default
title: What's New
description: Every change, every improvement, built in public. Track all updates to 3mpwrApp in real-time.
permalink: /whats-new/
---

{%- include status-banner.html -%}

<!-- Building in Public Banner -->
<div id="transparency-banner" class="transparency-banner">
  <div class="transparency-content">
    <span class="transparency-emoji">🚧</span>
    <span class="transparency-text">
      <strong>Building in Public</strong> — 
      <span id="recent-count">Loading...</span> updates this week
    </span>
    <a href="#recent" class="transparency-link">See what's new →</a>
  </div>
</div>

# What's New

<p class="whatsnew-intro">
  Every single commit, every improvement, every fix—built in public and shared transparently with our community. 
  <strong id="total-count">Loading...</strong> updates since October 2025.
</p>

<div class="whatsnew-stats">
  <div class="stat-card">
    <div class="stat-number" id="stat-recent">–</div>
    <div class="stat-label">Last 30 Days</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="stat-features">–</div>
    <div class="stat-label">Features</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="stat-fixes">–</div>
    <div class="stat-label">Bug Fixes</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="stat-total">–</div>
    <div class="stat-label">Total Updates</div>
  </div>
</div>

<p>
  Subscribe to updates: <a href="{{ '/whats-new/feed.xml' | relative_url }}">RSS Feed</a>
</p>

<!-- Loading Indicator -->
<div id="loading-indicator" class="loading-indicator">
  <div class="spinner"></div>
  <p>Loading latest updates...</p>
</div>

<!-- Recent Updates (Last 30 Days) -->
<h2 id="recent">Recent (Last 30 Days)</h2>
<ul id="recent-list" class="whatsnew-list">
  <!-- Populated by JavaScript -->
</ul>

<!-- Archive (Older than 30 Days) -->
<h2 id="archive">Archive</h2>
<p class="archive-note">Updates older than 30 days, grouped by month</p>
<div id="archive-container">
  <!-- Populated by JavaScript -->
</div>

<!-- All Updates (Expandable) -->
<details id="all-updates">
  <summary><strong>All Updates (Since Launch)</strong></summary>
  <ul id="all-list" class="whatsnew-list">
    <!-- Populated by JavaScript -->
  </ul>
</details>

<!-- Styles -->
<style>
/* Transparency Banner */
.transparency-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  margin: -20px -20px 24px -20px;
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.transparency-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.transparency-emoji {
  font-size: 24px;
}

.transparency-text {
  font-size: 16px;
  line-height: 1.4;
}

.transparency-link {
  color: white;
  text-decoration: none;
  border-bottom: 2px solid rgba(255,255,255,0.5);
  font-weight: 600;
  transition: border-color 0.2s;
}

.transparency-link:hover {
  border-bottom-color: white;
}

/* Intro */
.whatsnew-intro {
  font-size: 18px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 24px;
}

/* Stats Cards */
.whatsnew-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.stat-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Loading */
.loading-indicator {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* What's New List */
.whatsnew-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.whatsnew-item {
  padding: 16px;
  border-left: 4px solid #ddd;
  margin-bottom: 12px;
  background: #f9f9f9;
  border-radius: 4px;
  transition: border-color 0.2s, background 0.2s;
}

.whatsnew-item:hover {
  background: #f5f5f5;
  border-left-color: #667eea;
}

.whatsnew-item.feature { border-left-color: #667eea; }
.whatsnew-item.fix { border-left-color: #f56565; }
.whatsnew-item.improvement { border-left-color: #48bb78; }
.whatsnew-item.docs { border-left-color: #ed8936; }

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.item-emoji {
  font-size: 20px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.item-date {
  font-size: 12px;
  color: #888;
}

.item-summary {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
  margin: 6px 0;
}

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #999;
  margin-top: 6px;
}

.item-repo,
.item-category {
  text-transform: capitalize;
}

/* Archive */
.archive-note {
  color: #777;
  font-size: 14px;
  margin-bottom: 16px;
}

.archive-month {
  margin-top: 24px;
}

.archive-month h3 {
  font-size: 18px;
  color: #667eea;
  margin-bottom: 12px;
  border-bottom: 2px solid #667eea;
  padding-bottom: 6px;
}

/* Responsive */
@media (max-width: 600px) {
  .transparency-banner {
    padding: 12px 16px;
  }
  
  .transparency-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .whatsnew-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-number {
    font-size: 24px;
  }
}
</style>

<!-- JavaScript to Load Data -->
<script>
(async function() {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  // Function to load JSON from app repo
  async function loadWhatsNewYear(year) {
    try {
      // Try to fetch from GitHub raw content (update with actual repo)
      const response = await fetch(`https://raw.githubusercontent.com/YOUR-ORG/empowrapp-new/main/public/whatsnew-${year}.json`);
      if (!response.ok) throw new Error('Not found');
      return await response.json();
    } catch (err) {
      console.warn(`Could not load whatsnew-${year}.json:`, err);
      return null;
    }
  }
  
  // Load data for current and last year
  const [currentData, lastYearData] = await Promise.all([
    loadWhatsNewYear(currentYear),
    loadWhatsNewYear(lastYear)
  ]);
  
  // Combine entries
  let allEntries = [];
  if (currentData && currentData.entries) {
    allEntries.push(...currentData.entries);
  }
  if (lastYearData && lastYearData.entries) {
    allEntries.push(...lastYearData.entries);
  }
  
  // Sort by date (newest first)
  allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Hide loading
  document.getElementById('loading-indicator').style.display = 'none';
  
  if (allEntries.length === 0) {
    document.getElementById('recent-list').innerHTML = '<li>No updates yet. Check back soon!</li>';
    return;
  }
  
  // Split into recent (30 days) and archive
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  const recentEntries = allEntries.filter(e => new Date(e.date) >= thirtyDaysAgo);
  const archivedEntries = allEntries.filter(e => new Date(e.date) < thirtyDaysAgo);
  const weeklyEntries = allEntries.filter(e => new Date(e.date) >= sevenDaysAgo);
  
  // Update stats
  document.getElementById('stat-recent').textContent = recentEntries.length;
  document.getElementById('stat-features').textContent = allEntries.filter(e => e.category === 'feature').length;
  document.getElementById('stat-fixes').textContent = allEntries.filter(e => e.category === 'fix').length;
  document.getElementById('stat-total').textContent = allEntries.length;
  document.getElementById('total-count').textContent = `${allEntries.length} updates`;
  document.getElementById('recent-count').textContent = `${weeklyEntries.length}`;
  
  // Function to render entry
  function renderEntry(entry) {
    const emoji = {
      feature: '✨',
      fix: '🐛',
      improvement: '⚡',
      docs: '📚'
    }[entry.category] || '📝';
    
    const repoIcon = entry.repo === 'app' ? '📱 App' : '🌐 Website';
    const dateStr = new Date(entry.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return `
      <li class="whatsnew-item ${entry.category}">
        <div class="item-header">
          <span class="item-emoji">${emoji}</span>
          <span class="item-title">${entry.title}</span>
          <span class="item-date">${dateStr}</span>
        </div>
        <div class="item-summary">${entry.summary}</div>
        <div class="item-meta">
          <span class="item-repo">${repoIcon}</span>
          <span class="item-category">${entry.category}</span>
        </div>
      </li>
    `;
  }
  
  // Render recent
  document.getElementById('recent-list').innerHTML = recentEntries.length > 0
    ? recentEntries.map(renderEntry).join('')
    : '<li>No updates in the last 30 days</li>';
  
  // Render archive grouped by month
  const archiveByMonth = {};
  archivedEntries.forEach(entry => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    if (!archiveByMonth[monthKey]) {
      archiveByMonth[monthKey] = {
        label: monthLabel,
        entries: []
      };
    }
    archiveByMonth[monthKey].entries.push(entry);
  });
  
  const archiveHtml = Object.keys(archiveByMonth)
    .sort().reverse()
    .map(key => {
      const month = archiveByMonth[key];
      return `
        <div class="archive-month">
          <h3>${month.label}</h3>
          <ul class="whatsnew-list">
            ${month.entries.map(renderEntry).join('')}
          </ul>
        </div>
      `;
    }).join('');
  
  document.getElementById('archive-container').innerHTML = archiveHtml || '<p>No archived updates yet</p>';
  
  // Render all (for expandable section)
  document.getElementById('all-list').innerHTML = allEntries.map(renderEntry).join('');
})();
</script>

{%- include page-feedback.html -%}
