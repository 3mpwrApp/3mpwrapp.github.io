---
layout: default
title: Community Wins - Disability Advocacy Success Stories
description: Real wins from people navigating disability benefits, workplace accommodations, and accessibility. Learn from community strategies that work.
permalink: /wins/
---

<div class="wins-feed-container">
  <header class="wins-header">
    <h1>Community Wins</h1>
    <p class="lead">
      Real success stories from people like you navigating disability systems.
      Learn from proven strategies that work.
    </p>
    
    <div class="cta-box">
      <p><strong>Have a win to share?</strong></p>
      <a href="{{ site.baseurl }}/beta" class="btn btn-primary">
        Download 3mpwr to Share Your Story
      </a>
    </div>
  </header>

  <div class="wins-filters">
    <button class="filter-btn active" data-filter="all">All Wins</button>
    <button class="filter-btn" data-filter="accommodation">Accommodations</button>
    <button class="filter-btn" data-filter="appeal">Appeals Won</button>
    <button class="filter-btn" data-filter="benefits">Benefits Approved</button>
    <button class="filter-btn" data-filter="access">Access Granted</button>
  </div>

  <div id="wins-list" class="wins-list">
    <!-- Wins will be loaded here via JavaScript from Firestore or API -->
    <div class="loading">Loading wins...</div>
  </div>
</div>

<script>
// UTM tracking for social referrals
const urlParams = new URLSearchParams(window.location.search);
const utmSource = urlParams.get('utm_source');
const utmCampaign = urlParams.get('utm_campaign');
const winId = urlParams.get('utm_content');

if (utmSource && utmCampaign === 'win_share') {
  // Track social referral
  fetch('{{ site.baseurl }}/api/track-referral', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: utmSource,
      winId: winId,
      timestamp: Date.now()
    })
  }).catch(console.error);
}

// Load wins from Firestore/API
async function loadWins() {
  try {
    const response = await fetch('{{ site.baseurl }}/api/wins');
    const wins = await response.json();
    
    renderWins(wins);
  } catch (error) {
    console.error('Failed to load wins:', error);
    document.getElementById('wins-list').innerHTML = 
      '<p class="error">Failed to load wins. Please try again later.</p>';
  }
}

function renderWins(wins) {
  const container = document.getElementById('wins-list');
  
  if (!wins || wins.length === 0) {
    container.innerHTML = '<p class="empty">No wins yet. Be the first to share!</p>';
    return;
  }
  
  container.innerHTML = wins.map(win => `
    <article class="win-card" data-type="${win.winType}">
      <div class="win-badge ${win.winType}">
        ${getWinTypeLabel(win.winType)}
      </div>
      
      ${win.privacy === 'anonymous' ? '<span class="anonymous-badge">Anonymous</span>' : ''}
      
      <h2>
        <a href="{{ site.baseurl }}/wins/${win.id}">${escapeHtml(win.title)}</a>
      </h2>
      
      <p class="win-description">${escapeHtml(win.description)}</p>
      
      <div class="win-timeline">
        <strong>Timeline:</strong> ${escapeHtml(win.timeline)}
      </div>
      
      <div class="win-metrics">
        <span title="Helpful votes">👍 ${win.metrics.helpfulVotes}</span>
        <span title="Inspired count">⭐ ${win.metrics.inspiredCount}</span>
        <span title="Shares">${win.metrics.shares}</span>
      </div>
      
      <a href="{{ site.baseurl }}/wins/${win.id}" class="read-more">
        Read Full Story →
      </a>
    </article>
  `).join('');
}

function getWinTypeLabel(type) {
  const labels = {
    'accommodation': 'Workplace Accommodation',
    'appeal_won': 'Appeal Won',
    'settlement': 'Legal Settlement',
    'policy_change': 'Policy Change',
    'benefit_approved': 'Benefits Approved',
    'access_granted': 'Access Granted',
    'other': 'Other Win'
  };
  return labels[type] || 'Win';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Filter functionality
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filter = btn.dataset.filter;
    document.querySelectorAll('.win-card').forEach(card => {
      if (filter === 'all' || card.dataset.type === filter) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Load wins on page load
loadWins();
</script>

<style>
.wins-feed-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.wins-header {
  text-align: center;
  margin-bottom: 3rem;
}

.wins-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.wins-header .lead {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.cta-box {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem auto;
  max-width: 600px;
}

.wins-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-medium);
  background: var(--bg-primary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: var(--btn-primary-bg);
}

.filter-btn.active {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border-color: var(--btn-primary-bg);
}

.wins-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.win-card {
  background: var(--bg-elevated);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.win-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.win-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.win-badge.accommodation { background: var(--info-bg); color: var(--info-text); }
.win-badge.appeal_won { background: var(--success-bg); color: var(--success-text); }
.win-badge.settlement { background: var(--highlight-bg); color: var(--highlight-text); }
.win-badge.policy_change { background: var(--warning-bg); color: var(--warning-text); }
.win-badge.benefit_approved { background: var(--success-bg); color: var(--success-text); }
.win-badge.access_granted { background: var(--info-bg); color: var(--info-text); }
.win-badge.other { background: var(--highlight-bg); color: var(--highlight-text); }

.anonymous-badge {
  float: right;
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.win-card h2 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.win-card h2 a {
  color: var(--text-primary);
  text-decoration: none;
}

.win-card h2 a:hover {
  color: var(--link-hover);
}

.win-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.win-timeline {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.win-metrics {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.read-more {
  font-weight: 600;
  color: var(--link-color);
  text-decoration: none;
}

.read-more:hover {
  text-decoration: underline;
}

.loading, .error, .empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .wins-list {
    grid-template-columns: 1fr;
  }
  
  .wins-header h1 {
    font-size: 2rem;
  }
}
</style>
