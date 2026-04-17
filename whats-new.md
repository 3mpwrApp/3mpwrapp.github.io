---
layout: default
title: "What's New - Every Update, Every Commit"
description: "Complete transparency - see every feature, fix, and improvement to 3mpwrApp. We're building in public!"
image: /assets/empwrapp-logo.png
image_alt: "3mpwrApp What's New - Complete changelog with full transparency"
permalink: /whats-new/
published: true
---

<link rel="stylesheet" href="{{ '/assets/css/page-enhancements.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/whats-new.css' | relative_url }}">

{%- include sticky-transparency-banner.html -%}

<div class="gradient-banner">
  <h1 style="margin: 0 0 0.5rem;">📜 What's New - Complete History</h1>
  <p style="margin: 0;">Every feature, fix, and improvement to 3mpwrApp. We're building in public - see every commit from day one!</p>
</div>

<!-- Stats Cards -->
<div id="stats-cards" class="stats-grid" style="display: none;">
  <div class="stat-card">
    <div class="stat-number" id="total-entries">0</div>
    <div class="stat-label">Total Updates</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="total-features">0</div>
    <div class="stat-label">✨ Features</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="total-fixes">0</div>
    <div class="stat-label">🐛 Fixes</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="total-improvements">0</div>
    <div class="stat-label">⚡ Improvements</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="total-docs">0</div>
    <div class="stat-label">📚 Docs</div>
  </div>
</div>

<!-- Search and Filter Controls -->
<div class="controls-container">
  <input type="search" id="search-whatsnew" placeholder="🔍 Search updates..." aria-label="Search updates">
  <div class="filter-buttons" role="group" aria-label="Filter by category">
    <button class="filter-btn active" data-category="all">All</button>
    <button class="filter-btn" data-category="feature">✨ Features</button>
    <button class="filter-btn" data-category="fix">🐛 Fixes</button>
    <button class="filter-btn" data-category="improvement">⚡ Improvements</button>
    <button class="filter-btn" data-category="docs">📚 Docs</button>
  </div>
</div>

<div id="loading-message" style="text-align: center; padding: 2rem; color: #666;">
  Loading updates...
</div>

<div id="error-message" style="display: none; text-align: center; padding: 2rem; color: #d32f2f;">
  Unable to load updates. Please try again later.
</div>

<!-- Daily Highlights (Today's Progress) -->
<section id="daily-highlights" style="display: none;">
  <div class="daily-progress">
    <h2>🌟 Today's Progress</h2>
    <p class="progress-summary" id="progress-summary">Latest improvements to make 3mpwrApp work better for you.</p>
    <div class="highlights-list" id="highlights-list"></div>
  </div>
</section>

<!-- Recent Updates (< 30 days) -->
<section id="recent-section" style="display: none;">
  <h2>🔥 Recent Updates (Last 30 Days)</h2>
  <div id="recent-updates" class="updates-container"></div>
</section>

<!-- Table of Contents -->
<section id="toc-section" style="display: none;">
  <h2>📑 Jump to Month</h2>
  <div id="month-toc" class="month-toc"></div>
</section>

<!-- Recent Updates (animated scroll target) -->
<div id="recent-anchor"></div>

<!-- Archive (> 30 days) -->
<section id="archive-section" style="display: none;">
  <h2>📚 Archive (Older Updates)</h2>
  <p class="archive-note">Complete history of all changes to 3mpwrApp, organized by month.</p>
  <div id="archive-updates" class="updates-container"></div>
</section>

<div id="no-results" style="display: none; text-align: center; padding: 2rem; color: #666;">
  No updates found matching your search.
</div>

<!-- Styles -->
<style>
html {
  scroll-behavior: smooth;
}

.gradient-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: var(--card-bg, #f5f5f5);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.5rem;
}

.controls-container {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

#search-whatsnew {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #eef0ff;
}

.filter-btn.active {
  background: #667eea;
  color: white;
}

.updates-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.update-entry {
  background: var(--card-bg, #ffffff);
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.update-entry:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.update-entry.feature {
  border-left-color: #667eea;
}

.update-entry.fix {
  border-left-color: #ef4444;
}

.update-entry.improvement {
  border-left-color: #10b981;
}

.update-entry.docs {
  border-left-color: #f59e0b;
}

.daily-progress {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.daily-progress h2 {
  margin: 0 0 0.5rem;
  color: white;
}

.progress-summary {
  margin: 0 0 1.5rem;
  opacity: 0.95;
  font-size: 1.125rem;
}

.highlights-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.highlight-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border-left: 3px solid rgba(255, 255, 255, 0.5);
  font-size: 1.05rem;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.update-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.75rem;
}

.toggle-details {
  padding: 0.4rem 0.75rem;
  background: var(--card-bg, #f5f5f5);
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.toggle-details:hover {
  background: #e5e7eb;
  border-color: #667eea;
}

.commit-details {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--card-bg, #f9fafb);
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 0.9rem;
  color: #6b7280;
}

.commit-summary {
  margin: 0 0 0.75rem;
  font-family: 'Courier New', monospace;
  color: #374151;
}

.commit-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
}

.commit-repo {
  padding: 0.25rem 0.5rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 4px;
  font-weight: 600;
}

.commit-sha a {
  color: #667eea;
  text-decoration: none;
  font-family: 'Courier New', monospace;
}

.commit-sha a:hover {
  text-decoration: underline;
}

.update-title {
  font-weight: bold;
  font-size: 1.125rem;
  line-height: 1.5;
  flex: 1;
}

.update-date {
  font-size: 0.875rem;
  color: #666;
  white-space: nowrap;
}

.update-category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 0.5rem;
}

.category-feature {
  background: #eef0ff;
  color: #667eea;
}

.category-fix {
  background: #fee;
  color: #ef4444;
}

.category-improvement {
  background: #ecfdf5;
  color: #10b981;
}

.category-docs {
  background: #fef3c7;
  color: #f59e0b;
}

.month-group {
  margin-bottom: 2rem;
}

.month-header {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  padding-top: 1rem;
  border-bottom: 2px solid #667eea;
  scroll-margin-top: 100px;
}

.month-toc {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.month-toc a {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.month-toc a:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.2);
}

.archive-note {
  color: #666;
  font-style: italic;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .update-header {
    flex-direction: column;
  }
  
  .update-date {
    align-self: flex-start;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .stat-card {
    background: #2d3748;
  }
  
  .filter-btn {
    background: #2d3748;
    border-color: #667eea;
    color: #a5b4fc;
  }
  
  .filter-btn:hover {
    background: #374151;
  }
  
  .filter-btn.active {
    background: #667eea;
    color: white;
  }
  
  .update-entry {
    background: #2d3748;
  }
}
</style>

<!-- JavaScript for loading and displaying updates -->
<script>
(async function() {
  const currentYear = new Date().getFullYear();
  const allEntries = [];
  
  // Load data from unified JSON files
  async function loadData() {
    try {
      // Load from assets/data folder
      const years = [2025, 2026];
      
      for (const year of years) {
        try {
          const response = await fetch(`/assets/data/whatsnew-${year}.json`);
          if (response.ok) {
            const data = await response.json();
            if (data.entries && Array.isArray(data.entries)) {
              allEntries.push(...data.entries);
            }
          }
        } catch (err) {
          console.warn(`Failed to load whatsnew-${year}.json:`, err);
        }
      }
      
      if (allEntries.length === 0) {
        throw new Error('No data loaded');
      }
      
      return allEntries;
    } catch (error) {
      console.error('Error loading What\'s New data:', error);
      document.getElementById('loading-message').style.display = 'none';
      document.getElementById('error-message').style.display = 'block';
      return [];
    }
  }
  
  // Calculate days ago
  function daysAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  
  // Group entries by month for archive
  function groupByMonth(entries) {
    const groups = {};
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(entry);
    });
    return groups;
  }
  
  // Render a single entry with 2-tier system
  function renderEntry(entry) {
    const days = daysAgo(entry.date);
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Generate human-readable impact summary (fallback to commit summary)
    const humanSummary = entry.humanSummary || generateHumanSummary(entry);
    
    return `
      <div class="update-entry ${entry.category}" data-category="${entry.category}">
        <div class="update-header">
          <div class="update-title">${humanSummary}</div>
          <div class="update-date">${formattedDate}</div>
        </div>
        <div class="update-meta">
          <span class="update-category category-${entry.category}">
            ${entry.category}
          </span>
          <button class="toggle-details" onclick="toggleDetails(this)" aria-label="Show technical details">
            📋 Technical Details
          </button>
        </div>
        <div class="commit-details" style="display: none;">
          <p class="commit-summary">${entry.summary}</p>
          <div class="commit-meta">
            <span class="commit-repo">${entry.repo}</span>
            <span class="commit-sha">
              <a href="https://github.com/S0vryn9-C011ect1ve/${entry.repo === 'app' ? 'empowrapp-main' : '3mpwrapp.github.io'}/commit/${entry.commitSha}" 
                 target="_blank" rel="noopener">
                ${entry.commitSha.substring(0, 7)}
              </a>
            </span>
          </div>
        </div>
      </div>
    `;
  }
  
  // Generate human-readable summary from commit message
  function generateHumanSummary(entry) {
    const summary = entry.summary;
    
    // Simple transformations for common patterns
    const humanized = summary
      .replace(/^(feat|fix|chore|docs|improvement):\s*/i, '')
      .replace(/\b(i18n|a11y|perf|auth|OAuth|API|UI|UX)\b/gi, match => {
        const map = {
          'i18n': 'translations',
          'a11y': 'accessibility',
          'perf': 'performance',
          'auth': 'login',
          'OAuth': 'sign-in',
          'API': 'service',
          'UI': 'interface',
          'UX': 'experience'
        };
        return map[match] || match;
      });
    
    // Add impact-focused prefixes
    if (entry.category === 'feature') return `✨ You can now: ${humanized}`;
    if (entry.category === 'fix') return `🔧 Fixed: ${humanized}`;
    if (entry.category === 'improvement') return `⚡ Improved: ${humanized}`;
    return humanized;
  }
  
  // Toggle technical details visibility
  window.toggleDetails = function(btn) {
    const entry = btn.closest('.update-entry');
    const details = entry.querySelector('.commit-details');
    const isVisible = details.style.display !== 'none';
    
    details.style.display = isVisible ? 'none' : 'block';
    btn.textContent = isVisible ? '📋 Technical Details' : '🔼 Hide Details';
    btn.setAttribute('aria-expanded', !isVisible);
  }
  
  // Display entries
  function displayEntries(entries) {
    const recentEntries = entries.filter(e => daysAgo(e.date) <= 30);
    const archiveEntries = entries.filter(e => daysAgo(e.date) > 30);
    
    // Update stats
    const stats = {
      total: entries.length,
      feature: entries.filter(e => e.category === 'feature').length,
      fix: entries.filter(e => e.category === 'fix').length,
      improvement: entries.filter(e => e.category === 'improvement').length,
      docs: entries.filter(e => e.category === 'docs').length,
    };
    
    document.getElementById('total-entries').textContent = stats.total;
    document.getElementById('total-features').textContent = stats.feature;
    document.getElementById('total-fixes').textContent = stats.fix;
    document.getElementById('total-improvements').textContent = stats.improvement;
    document.getElementById('total-docs').textContent = stats.docs;
    document.getElementById('stats-cards').style.display = 'grid';
    
    // Generate and display daily highlights
    generateDailyHighlights(entries);
    
    // Display recent
    const recentContainer = document.getElementById('recent-updates');
    if (recentEntries.length > 0) {
      recentContainer.innerHTML = recentEntries.map(renderEntry).join('');
      document.getElementById('recent-section').style.display = 'block';
    }
    
    // Display archive grouped by month
    const archiveContainer = document.getElementById('archive-updates');
    if (archiveEntries.length > 0) {
      const monthGroups = groupByMonth(archiveEntries);
      const sortedMonths = Object.keys(monthGroups).sort().reverse();
      
      // Generate table of contents
      const tocContainer = document.getElementById('month-toc');
      tocContainer.innerHTML = sortedMonths.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(year, parseInt(month) - 1, 1).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        const monthId = `month-${monthKey}`;
        
        return `<a href="#${monthId}" class="month-toc-link">${monthName}</a>`;
      }).join('');
      document.getElementById('toc-section').style.display = 'block';
      
      archiveContainer.innerHTML = sortedMonths.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(year, parseInt(month) - 1, 1).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        const monthId = `month-${monthKey}`;
        
        return `
          <div class="month-group">
            <h3 id="${monthId}" class="month-header">${monthName}</h3>
            ${monthGroups[monthKey].map(renderEntry).join('')}
          </div>
        `;
      }).join('');
      
      document.getElementById('archive-section').style.display = 'block';
    }
    
    document.getElementById('loading-message').style.display = 'none';
  }
  
  // Generate daily highlights - summarize recent activity
  function generateDailyHighlights(entries) {
    // Get entries from last 7 days
    const recentDays = entries
      .filter(e => daysAgo(e.date) <= 7)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (recentDays.length === 0) return;
    
    // Group by date
    const byDate = {};
    recentDays.forEach(entry => {
      const dateKey = entry.date.split('T')[0];
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(entry);
    });
    
    // Get most recent date
    const latestDate = Object.keys(byDate).sort().reverse()[0];
    const todaysEntries = byDate[latestDate];
    
    if (todaysEntries.length === 0) return;
    
    // Generate summary based on categories
    const categories = {
      feature: todaysEntries.filter(e => e.category === 'feature').length,
      fix: todaysEntries.filter(e => e.category === 'fix').length,
      improvement: todaysEntries.filter(e => e.category === 'improvement').length,
      docs: todaysEntries.filter(e => e.category === 'docs').length,
    };
    
    // Create progress summary
    const parts = [];
    if (categories.feature > 0) parts.push(`${categories.feature} new feature${categories.feature > 1 ? 's' : ''}`);
    if (categories.fix > 0) parts.push(`${categories.fix} bug fix${categories.fix > 1 ? 'es' : ''}`);
    if (categories.improvement > 0) parts.push(`${categories.improvement} improvement${categories.improvement > 1 ? 's' : ''}`);
    if (categories.docs > 0) parts.push(`${categories.docs} documentation update${categories.docs > 1 ? 's' : ''}`);
    
    const dateFmt = new Date(latestDate).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const summary = parts.length > 0 
      ? `Latest update from ${dateFmt}: ${parts.join(', ')}`
      : `Working hard to make 3mpwrApp better - ${dateFmt}`;
    
    // Show up to 6 highlights
    const highlights = todaysEntries.slice(0, 6).map(entry => {
      return `<div class="highlight-item">${generateHumanSummary(entry)}</div>`;
    }).join('');
    
    // Display highlights
    document.getElementById('progress-summary').textContent = summary;
    document.getElementById('highlights-list').innerHTML = highlights;
    document.getElementById('daily-highlights').style.display = 'block';
  }
  
  // Search and filter
  let currentFilter = 'all';
  let currentSearch = '';
  
  function applyFilters() {
    const entries = document.querySelectorAll('.update-entry');
    let visibleCount = 0;
    
    entries.forEach(entry => {
      const category = entry.dataset.category;
      const text = entry.textContent.toLowerCase();
      
      const matchesCategory = currentFilter === 'all' || category === currentFilter;
      const matchesSearch = currentSearch === '' || text.includes(currentSearch.toLowerCase());
      
      if (matchesCategory && matchesSearch) {
        entry.style.display = 'block';
        visibleCount++;
      } else {
        entry.style.display = 'none';
      }
    });
    
    document.getElementById('no-results').style.display = visibleCount === 0 ? 'block' : 'none';
    document.getElementById('recent-section').style.display = 
      document.querySelectorAll('#recent-updates .update-entry[style*="display: block"]').length > 0 ? 'block' : 'none';
    document.getElementById('archive-section').style.display = 
      document.querySelectorAll('#archive-updates .update-entry[style*="display: block"]').length > 0 ? 'block' : 'none';
  }
  
  // Event listeners
  document.getElementById('search-whatsnew').addEventListener('input', (e) => {
    currentSearch = e.target.value;
    applyFilters();
  });
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.category;
      applyFilters();
    });
  });
  
  // Load and display data
  const entries = await loadData();
  if (entries.length > 0) {
    displayEntries(entries);
  }
})();
</script>

{%- include page-feedback.html -%}