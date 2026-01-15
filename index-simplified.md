---
layout: default
title: Home - Simplified
description: Community support for injured workers and persons with disabilities in Canada.
---

<!-- Complexity Mode Toggle -->
{%- include complexity-toggle.html -%}

<!-- Status Banner -->
{%- include status-banner.html -%}

<!-- Hero Section -->
<div style="text-align: center; margin: 2rem 0;">
  <picture>
    <source type="image/webp" srcset="{{ '/assets/empwrapp-logo.webp' | relative_url }}">
    <img src="{{ '/assets/empwrapp-logo.png' | relative_url }}" alt="3mpwrApp logo" width="120" height="120" loading="eager">
  </picture>
</div>

# You're Not Alone

<!-- SIMPLE MODE CONTENT (default: visible) -->
<div class="content-simple" data-complexity="simple">

**3mpwr App is free community support for injured workers and people with disabilities in Canada.**

## What We Do

We help you:
- **Connect** with others who understand your challenges
- **Find resources** for WSIB, ODSP, accessibility, and legal support
- **Track your health** and manage your disability
- **Join campaigns** for disability rights
- **Learn your rights** as an injured worker or person with disability

**100% Free Forever.** No hidden costs. Built by community members, for community members.

<div style="text-align: center; margin: 2rem 0;">
  <a href="/app-waitlist/" style="display: inline-block; background: linear-gradient(135deg, #3d4eaa 0%, #4a2867 100%); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 1.3rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
    Join the Beta →
  </a>
</div>

---

## This Week's Events

<div id="events-simple-container">
  <p>Loading upcoming community events...</p>
</div>

<a href="/events/" style="display: inline-block; margin-top: 1rem; padding: 12px 24px; background: white; color: #667eea; border-radius: 8px; text-decoration: none; font-weight: bold; border: 2px solid #667eea;">
  View Full Calendar →
</a>

---

## Recent Campaigns

<div id="campaigns-simple-container">
  <p>Loading recent advocacy campaigns...</p>
</div>

<a href="/campaigns/" style="display: inline-block; margin-top: 1rem; padding: 12px 24px; background: white; color: #047857; border-radius: 8px; text-decoration: none; font-weight: bold; border: 2px solid #047857;">
  All Campaigns →
</a>

---

## Key Features

<details class="auto-collapse" open>
  <summary>60+ Practical Tools</summary>
  <div class="details-content">
    <ul>
      <li>🗂️ <strong>Evidence Locker</strong> - Secure document storage</li>
      <li>📊 <strong>Pain Tracker</strong> - Track symptoms daily</li>
      <li>💊 <strong>Medication Manager</strong> - Never miss a dose</li>
      <li>📝 <strong>Legal Resources</strong> - Know your rights</li>
      <li>🤝 <strong>Community Support</strong> - Connect with peers</li>
    </ul>
    <a href="/features/" style="display: inline-block; margin-top: 1rem; padding: 10px 20px; background: #3d4eaa; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
      See All Features →
    </a>
  </div>
</details>

<details class="auto-collapse">
  <summary>Revolutionary Accessibility</summary>
  <div class="details-content">
    <p>Built for people with brain fog, chronic pain, and fatigue:</p>
    <ul>
      <li>🧠 <strong>Brain Fog Helper</strong> - Simplified interface</li>
      <li>💙 <strong>Need a Break Button</strong> - Instant calm mode</li>
      <li>🔥 <strong>Pain Flare Mode</strong> - Minimal interactions</li>
      <li>🥄 <strong>Spoons Tracker</strong> - Energy management</li>
      <li>📖 <strong>Reading Progress</strong> - Never lose your place</li>
    </ul>
    <a href="/accessibility/" style="display: inline-block; margin-top: 1rem; padding: 10px 20px; background: #3d4eaa; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
      All Accessibility Features →
    </a>
  </div>
</details>

<details class="auto-collapse">
  <summary>Your Privacy Matters</summary>
  <div class="details-content">
    <p>Your data stays yours:</p>
    <ul>
      <li>🔐 <strong>100% Private</strong> - No data selling</li>
      <li>📱 <strong>Offline First</strong> - Works without internet</li>
      <li>🇨🇦 <strong>Canadian Servers</strong> - Data stays in Canada</li>
      <li>🔒 <strong>End-to-End Encryption</strong> - Bank-level security</li>
    </ul>
    <a href="/privacy/" style="display: inline-block; margin-top: 1rem; padding: 10px 20px; background: #3d4eaa; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Read Privacy Policy →
    </a>
  </div>
</details>

---

## Ready to Join?

**3mpwr App is in public beta.** Join thousands of community members already using the platform.

<div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin: 2rem 0;">
  <a href="/app-waitlist/" style="display: inline-block; background: linear-gradient(135deg, #3d4eaa 0%, #4a2867 100%); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 1.1rem;">
    Join Beta Program
  </a>
  <a href="/user-guide/" style="display: inline-block; background: white; color: #3d4eaa; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 1.1rem; border: 2px solid #3d4eaa;">
    Read User Guide
  </a>
</div>

---

## Questions?

- **Email:** [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
- **Documentation:** [User Guide](/user-guide/)
- **Support:** [Contact Us](/contact/)

</div>

<!-- STANDARD MODE CONTENT (collapsed details, balanced) -->
<div class="content-standard" data-complexity="standard" hidden>
  
<!-- This will include the current homepage content with auto-collapse details -->
{%- comment -%}
Standard mode shows the full current homepage.md content
with details elements set to auto-collapse by default.
The existing accessibility toolbar, event banners, campaigns, etc.
{%- endcomment -%}

<!-- Placeholder - full homepage content goes here in implementation -->
<p><em>Standard view: Full homepage content with collapsible sections</em></p>

</div>

<!-- DETAILED MODE CONTENT (everything expanded) -->
<div class="content-detailed" data-complexity="detailed" hidden>

<!-- This will be identical to standard but with all details open -->
{%- comment -%}
Detailed mode shows everything expanded by default.
All the rich content, banners, carousels, spotlights.
{%- endcomment -%}

<!-- Placeholder - full homepage content goes here in implementation -->
<p><em>Detailed view: Everything expanded and visible</em></p>

</div>

<!-- Simplified event loader for simple mode -->
<script>
// Simple event loader (reduced complexity)
async function loadSimpleEvents() {
  try {
    const response = await fetch('https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=production&ts=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load');
    
    const data = await response.json();
    let events = [];
    if (data.success && data.events && Array.isArray(data.events)) {
      const now = new Date();
      const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      events = data.events
        .filter(e => {
          const eventDate = new Date(e.date);
          return eventDate >= now && eventDate <= sevenDaysOut;
        })
        .slice(0, 3);
    }
    
    const container = document.getElementById('events-simple-container');
    if (events.length === 0) {
      container.innerHTML = '<p>No events this week. <a href="/events/">Check the calendar</a> for upcoming events.</p>';
      return;
    }
    
    container.innerHTML = '<ul style="list-style: none; padding: 0;">' + events.map(event => {
      const date = new Date(event.date);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `
        <li style="margin: 1rem 0; padding: 1rem; background: #f3f4f6; border-radius: 8px;">
          <strong>${event.title}</strong><br>
          📅 ${dateStr} at ${timeStr}<br>
          ${event.isVirtual ? '🌐 Virtual' : '📍 In-person'}
        </li>
      `;
    }).join('') + '</ul>';
    
  } catch (error) {
    document.getElementById('events-simple-container').innerHTML = '<p>Unable to load events. <a href="/events/">View calendar</a></p>';
  }
}

async function loadSimpleCampaigns() {
  try {
    const response = await fetch('https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns');
    if (!response.ok) throw new Error('Failed');
    
    const data = await response.json();
    let campaigns = [];
    if (data.success && data.campaigns) {
      campaigns = data.campaigns.filter(c => c.status === 'completed').slice(0, 2);
    }
    
    const container = document.getElementById('campaigns-simple-container');
    if (campaigns.length === 0) {
      container.innerHTML = '<p>No recent campaigns. <a href="/campaigns/">Check back soon</a></p>';
      return;
    }
    
    container.innerHTML = '<ul style="list-style: none; padding: 0;">' + campaigns.map(c => `
      <li style="margin: 1rem 0; padding: 1rem; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
        <strong>${c.icon || '📣'} ${c.title}</strong> (✓ Completed)<br>
        ${c.summary || ''}
      </li>
    `).join('') + '</ul>';
    
  } catch (error) {
    document.getElementById('campaigns-simple-container').innerHTML = '<p>Unable to load campaigns. <a href="/campaigns/">View all campaigns</a></p>';
  }
}

// Load data
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    loadSimpleEvents();
    loadSimpleCampaigns();
  });
} else {
  loadSimpleEvents();
  loadSimpleCampaigns();
}
</script>

<!-- Load Complexity Mode -->
<script src="{{ '/assets/js/complexity-mode.js' | relative_url }}" defer></script>
<link rel="stylesheet" href="{{ '/assets/css/complexity-mode.css' | relative_url }}">
