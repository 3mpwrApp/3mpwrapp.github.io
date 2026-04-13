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

<!-- Recent Updates (< 30 days) -->
<section id="recent-section" style="display: none;">
  <h2>🔥 Recent Updates (Last 30 Days)</h2>
  <div id="recent-updates" class="updates-container"></div>
</section>

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

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.update-title {
  font-weight: bold;
  font-size: 1.125rem;
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
  border-bottom: 2px solid #667eea;
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
  
  // Render a single entry
  function renderEntry(entry) {
    const days = daysAgo(entry.date);
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    return `
      <div class="update-entry ${entry.category}" data-category="${entry.category}">
        <div class="update-header">
          <div class="update-title">${entry.emoji} ${entry.summary}</div>
          <div class="update-date">${formattedDate}</div>
        </div>
        <div class="update-category category-${entry.category}">
          ${entry.category}
        </div>
      </div>
    `;
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
      
      archiveContainer.innerHTML = sortedMonths.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(year, parseInt(month) - 1, 1).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        
        return `
          <div class="month-group">
            <h3 class="month-header">${monthName}</h3>
            ${monthGroups[monthKey].map(renderEntry).join('')}
          </div>
        `;
      }).join('');
      
      document.getElementById('archive-section').style.display = 'block';
    }
    
    document.getElementById('loading-message').style.display = 'none';
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