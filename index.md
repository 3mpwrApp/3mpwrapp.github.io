---
layout: default
title: Home
description: A community-powered hub for injured workers and persons with disabilities in Canada—connect, learn, and advocate with practical tools and support.
---

<!-- Status Banner -->
{%- include status-banner.html -%}

<!-- Innovative Accessibility Controls -->
<div class="accessibility-toolbar collapsed" role="toolbar" aria-label="Page accessibility controls">
  <!-- Toggle Button -->
  <button class="toolbar-toggle" aria-expanded="false" aria-controls="toolbar-content" id="toolbarToggle">
    <span class="toggle-icon" aria-hidden="true">♿</span>
    <span class="toggle-text">Accessibility Tools</span>
    <span class="badge" aria-label="13 accessibility features available">13 features</span>
    <span class="toggle-arrow" aria-hidden="true">▼</span>
  </button>
  
  <!-- Collapsible Content -->
  <div id="toolbar-content" class="toolbar-content" hidden>
    <!-- Quick Relief Group -->
    <div class="toolbar-group">
      <h3 class="toolbar-group-title">Quick Relief</h3>
      <div class="toolbar-buttons">
        <button id="needBreakBtn" class="toolbar-btn" aria-label="Take a break - dims screen for 5 minutes">
          <span aria-hidden="true">💙</span> Need a break?
        </button>
        <button id="painFlareBtn" class="toolbar-btn" aria-label="Switch to minimal interaction mode">
          <span aria-hidden="true">🔥</span> Pain flare mode
        </button>
        <button id="overwhelmedBtn" class="toolbar-btn" aria-label="Switch to simplified version">
          <span aria-hidden="true">😰</span> I'm overwhelmed
        </button>
        <button id="freezeFrameBtn" class="toolbar-btn" aria-label="Freeze all animations and movement">
          <span aria-hidden="true">❄️</span> Freeze animations
        </button>
      </div>
    </div>
    
    <!-- Reading Aids Group -->
    <div class="toolbar-group">
      <h3 class="toolbar-group-title">Reading Aids</h3>
      <div class="toolbar-buttons">
        <button id="tooMuchTextBtn" class="toolbar-btn" aria-label="Show bullet points only">
          <span aria-hidden="true">📝</span> Too much text?
        </button>
        <button id="brainFogBtn" class="toolbar-btn" aria-label="Show quick summary">
          <span aria-hidden="true">🧠</span> Brain fog helper
        </button>
        <button id="resumeReadingBtn" class="toolbar-btn" style="display:none;" aria-label="Resume where you left off">
          <span aria-hidden="true">📖</span> Resume reading
        </button>
        <button id="spatialMemoryBtn" class="toolbar-btn" aria-label="Show where you've been on this page">
          <span aria-hidden="true">🔍</span> I saw it somewhere...
        </button>
      </div>
    </div>
    
    <!-- Content Tools Group -->
    <div class="toolbar-group">
      <h3 class="toolbar-group-title">Content Tools</h3>
      <div class="toolbar-buttons">
        <button id="chunkingBtn" class="toolbar-btn" aria-label="Break content into smaller chunks">
          <span aria-hidden="true">🧩</span> Chunk content
        </button>
        <button id="decisionHelperBtn" class="toolbar-btn" aria-label="Help me decide what to do">
          <span aria-hidden="true">🎯</span> Decision helper
        </button>
        <button id="groundingBtn" class="toolbar-btn" aria-label="Quick grounding exercise for anxiety">
          <span aria-hidden="true">🧘</span> Grounding exercise
        </button>
      </div>
    </div>
    
    <!-- Settings Group -->
    <div class="toolbar-group">
      <h3 class="toolbar-group-title">Display Settings</h3>
      <div class="toolbar-settings">
        <div class="toolbar-setting">
          <label for="sensoryToggle" class="toolbar-label"><span aria-hidden="true">✨</span> Sensory:</label>
          <select id="sensoryToggle" class="toolbar-select" aria-label="Adjust sensory preferences">
            <option value="default">Default</option>
            <option value="reduced-motion">Reduced motion</option>
            <option value="high-contrast">High contrast</option>
            <option value="minimal">Minimal (text only)</option>
          </select>
        </div>
        <div class="toolbar-setting">
          <label for="readingLevel" class="toolbar-label"><span aria-hidden="true">📚</span> Reading:</label>
          <select id="readingLevel" class="toolbar-select" aria-label="Adjust reading complexity">
            <option value="detailed">Detailed</option>
            <option value="simple">Simple language</option>
          </select>
        </div>
        <div class="toolbar-setting">
          <label for="dyslexiaMode" class="toolbar-label"><span aria-hidden="true">📖</span> Dyslexia:</label>
          <select id="dyslexiaMode" class="toolbar-select" aria-label="Dyslexia-friendly formatting">
            <option value="off">Off</option>
            <option value="font">Font only</option>
            <option value="spacing">Extra spacing</option>
            <option value="full">Full mode</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Tracking Group -->
    <div class="toolbar-group">
      <h3 class="toolbar-group-title">Energy & Time Tracking</h3>
      <div class="toolbar-tracking">
        <div class="spoon-counter">
          <span class="spoon-label"><span aria-hidden="true">🥄</span> Energy used:</span>
          <span id="spoonCount" class="spoon-count" aria-live="polite">0</span>
          <button id="resetSpoons" class="toolbar-btn-small" aria-label="Reset energy counter">Reset</button>
        </div>
        <div class="toolbar-indicators">
          <button id="cognitiveLoadBtn" class="toolbar-btn-indicator" aria-label="Cognitive load indicator" aria-live="polite">
            <span aria-hidden="true">🌡️</span> <span id="cognitiveStatus">Ready</span>
          </button>
          <button id="timeBlindnessBtn" class="toolbar-btn-small" aria-label="Time tracking helper">
            <span aria-hidden="true">⏰</span> <span id="timeSpent">0m</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Progress indicator -->
<div class="page-progress-container" role="progressbar" aria-label="Page reading progress" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
  <div class="page-progress-bar" id="pageProgressBar"></div>
  <span class="page-progress-text" id="pageProgressText">0% through page</span>
</div>

# You're Not Alone. Your Voice Matters.

<span aria-hidden="true">📖</span> **3 minute read** <span aria-hidden="true">🔋🔋</span> **Energy: Light**

**Be part of building something meaningful.**

3mpwr App is a **free, community-powered platform** where injured workers, persons with disabilities, supporters, and allies come together. Whether you identify as disabled or are still figuring things out—**you belong here.**

We're building a safe space to connect, share experiences, and advocate for real change.

**<span aria-hidden="true">💚</span> 100% Free Forever** – No subscriptions. No hidden costs. Built BY the community, FOR the community.

---

<!-- Daily Events Banner - Auto-Updates with Happening Now/Soon Events -->
<div id="daily-events-banner" class="gradient-banner" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin: 2rem 0; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
  <h2 style="margin: 0 0 1rem; color: white; font-size: 1.8rem;">
    <span aria-hidden="true">🔥</span> This Week's Events
    <span class="badge badge--new" style="background: rgba(255,255,255,0.3); color: white; font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 4px; margin-left: 0.5rem;" aria-label="Automatically updated">Auto-updated</span>
  </h2>
  <p style="margin: 0 0 1rem; font-size: 0.95rem; opacity: 0.9;">Events in the next 7 days – automatically synced from 3mpwr App</p>
  <div id="events-banner-content" style="min-height: 100px;">
    <p style="margin: 0; font-size: 1.2rem; opacity: 0.9;">⏳ Loading upcoming events...</p>
  </div>
</div>

<script>
/**
 * ========================================
 * DAILY EVENTS BANNER - HOMEPAGE
 * ========================================
 * Shows events happening in the next 7 days
 * Updates automatically from events calendar API
 * Syncs every 5 minutes with app events
 * ========================================
 */

async function loadDailyEvents() {
  try {
    const response = await fetch('https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=production');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    let events = data.events || [];
    
    // Filter out test events
    events = events.filter(event => {
      if (event.id === 'Yk1p4IJ66gGxkI0F8mCc' || event.id === 'bYfSpZdmLv2o5Pfijv4V') {
        return false;
      }
      return true;
    });
    
    // Get today's date and next 7 days
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Filter events for the next 7 days (including today)
    let upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= todayStart && eventDate <= sevenDaysFromNow;
    });
    
    // If no events in next 7 days, show "no events"
    if (upcomingEvents.length === 0) {
      displayNoEvents();
      return;
    }
    
    // Sort by date (earliest first)
    upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    displayEvents(upcomingEvents);
    
  } catch (error) {
    console.error('❌ Failed to load daily events:', error);
    displayError();
  }
}

function displayEvents(events) {
  const container = document.getElementById('events-banner-content');
  
  const eventCount = events.length;
  const countText = eventCount === 1 ? '1 Event' : `${eventCount} Events`;
  
  // Determine the timeframe text
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  const firstEventDate = new Date(events[0].date);
  const isToday = firstEventDate >= todayStart && firstEventDate <= todayEnd;
  
  const timeframeText = isToday ? 'THIS WEEK' : 'UPCOMING WEEK';
  
  let html = `
    <h2 style="margin: 0 0 1rem; font-size: 2rem; color: white;">
      🔥 ${timeframeText}: ${countText}
    </h2>
  `;
  
  // Display all events (grouped by day)
  let currentDay = null;
  
  events.forEach(event => {
    const eventDate = new Date(event.date);
    const dayKey = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    // Add day header if this is a new day
    if (dayKey !== currentDay) {
      currentDay = dayKey;
      const isEventToday = eventDate >= todayStart && eventDate <= todayEnd;
      html += `
        <h3 style="margin: 1.5rem 0 0.5rem; font-size: 1.3rem; color: white; opacity: 0.95;">
          ${isEventToday ? '📅 TODAY' : `📅 ${dayKey}`}
        </h3>
      `;
    }
    
    const eventTime = eventDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    // Determine energy cost
    let energyIndicator = '';
    if (event.isVirtual) {
      energyIndicator = '🔋🔋'; // Virtual = Light
    } else if (event.energyCost) {
      // Use actual energy cost if provided
      const costMap = {
        'Very Light': '🔋',
        'Light': '🔋🔋',
        'Medium': '🔋🔋🔋',
        'High': '🔋🔋🔋🔋',
        'Very High': '🔋🔋🔋🔋🔋'
      };
      energyIndicator = costMap[event.energyCost] || '🔋🔋🔋';
    } else {
      energyIndicator = '🔋🔋🔋'; // Default to Medium for in-person
    }
    
    // Build accessibility badges
    let badges = [];
    if (event.isVirtual) badges.push('🌐 Virtual');
    if (event.location && !event.isVirtual) badges.push(`📍 ${event.location}`);
    if (event.asl) badges.push('🤟 ASL');
    if (event.captions) badges.push('📝 Captions');
    if (event.stepFree) badges.push('♿ Accessible');
    
    const badgeStr = badges.slice(0, 3).join(' • '); // Show first 3 badges
    
    html += `
      <a href="/events/" style="text-decoration: none; color: inherit; display: block;">
        <div style="background: rgba(255,255,255,0.2); padding: 1.5rem; border-radius: 8px; margin: 1rem 0; backdrop-filter: blur(10px); text-align: left; cursor: pointer; transition: transform 0.2s, background 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.background='rgba(255,255,255,0.2)'">
          <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 0 0 0.5rem; font-size: 1.3rem; font-weight: bold;">
                ${eventTime} - ${event.title}
              </p>
              <p style="margin: 0 0 0.5rem; font-size: 0.95rem; opacity: 0.95;">
                ${event.description.substring(0, 120)}${event.description.length > 120 ? '...' : ''}
              </p>
              <p style="margin: 0.5rem 0 0; font-size: 0.9rem; opacity: 0.9;">
                ${badgeStr}
              </p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 0.5rem; font-size: 1.2rem;" title="Energy Cost">
                ${energyIndicator}
              </p>
              ${event.rsvpLink ? `<span onclick="event.preventDefault(); event.stopPropagation(); window.open('${event.rsvpLink}', '_blank');" style="display: inline-block; margin-top: 0.5rem; padding: 8px 16px; background: white; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 0.9rem; cursor: pointer;">📝 RSVP</span>` : ''}
            </div>
          </div>
        </div>
      </a>
    `;
  });
  
  html += `
    <div style="margin-top: 1.5rem;">
      <a href="/events/" style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        📅 View Full Calendar
      </a>
    </div>
  `;
  
  container.innerHTML = html;
}

function displayNoEvents() {
  const container = document.getElementById('events-banner-content');
  container.innerHTML = `
    <h2 style="margin: 0 0 1rem; font-size: 2rem; color: white;">
      📅 No Events This Week
    </h2>
    <p style="margin: 0 0 1.5rem; font-size: 1.1rem; opacity: 0.95;">
      No events in the next 7 days. Check back soon!
    </p>
    <a href="/events/" style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
      📅 Go to Events Calendar
    </a>
  `;
}

function displayError() {
  const container = document.getElementById('events-banner-content');
  container.innerHTML = `
    <h2 style="margin: 0 0 1rem; font-size: 1.5rem; color: white;">
      ⚠️ Unable to Load Events
    </h2>
    <p style="margin: 0 0 1.5rem; font-size: 1rem; opacity: 0.95;">
      Connection issue. Please visit the events page directly.
    </p>
    <a href="/events/" style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
      📅 View Events Calendar
    </a>
  `;
}

// Load on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadDailyEvents);
} else {
  loadDailyEvents();
}
</script>

---

<!-- Community Spotlight Banner -->
<div class="highlight-banner" style="background: #f8f9fa !important; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; color: #1f2937 !important;">
  <h2 style="margin: 0 0 0.5rem; color: #1e40af !important; font-size: 1.6rem;">
    <span aria-hidden="true">🌟</span> Featured Community Spotlight
    <span class="badge badge--new">New!</span>
  </h2>
  <div style="display: grid; gap: 1rem; margin-top: 1rem;">
    <div>
      <h3 style="margin: 0 0 0.5rem; color: #1e40af !important; font-size: 1.3rem;">Mitchell Tremblay (@ODSPoverty)</h3>
      <p style="margin: 0 0 0.75rem; color: #1f2937 !important; font-size: 1.05rem;">
        🇨🇦 <strong style="color: #1f2937 !important;">Canadian Disability Advocate</strong> fighting for economic justice and dignity for people living with disabilities.
      </p>
      <p style="margin: 0 0 0.75rem; color: #1f2937 !important;">
        <strong style="color: #1f2937 !important;">Fighting for:</strong> ODSP reform, disability rights, and raising awareness about poverty among disabled Canadians.
      </p>
      <div class="highlight-banner__actions" style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
        <a href="https://linktr.ee/odspoor" target="_blank" rel="noopener noreferrer" class="highlight-banner__button" style="background: #3b82f6 !important; color: white !important; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: 600; border: 2px solid #3b82f6;">
          <span aria-hidden="true">🔗</span> Connect with Mitchell
        </a>
        <a href="/community-spotlight/" class="highlight-banner__button" style="background: white !important; color: #3b82f6 !important; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: 600; border: 2px solid #3b82f6;">
          <span aria-hidden="true">🌟</span> View All Community Members
        </a>
      </div>
    </div>
  </div>
  
  {%- include social-share.html title="Meet Mitchell Tremblay - Community Spotlight" description="Canadian disability advocate fighting for ODSP reform and economic justice" compact="true" -%}
</div>

---

## <span aria-hidden="true">✨</span> Built Different—By Design

<div class="gradient-banner-pink" style="color: white !important;">
  <h3 style="margin: 0 0 1rem; font-size: 1.3rem; color: white !important;"><span aria-hidden="true">🎯</span> Thoughtfully Designed for Real Lives</h3>
  <p style="margin: 0 0 1rem; font-size: 1.05rem; color: white !important;">
    3mpwrApp isn't just accessible—it's **thoughtfully built** with features you won't find anywhere else:
  </p>
  
  <ul style="list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; color: white !important;">
    <li style="padding-left: 1.5rem; position: relative; color: white !important;">
      <span style="position: absolute; left: 0;" aria-hidden="true">🧠</span>
      <strong style="color: white !important;">Adaptive cognitive support</strong> that responds to how you're feeling right now
    </li>
    <li style="padding-left: 1.5rem; position: relative; color: white !important;">
      <span style="position: absolute; left: 0;" aria-hidden="true">💙</span>
      <strong style="color: white !important;">Wellness-first features</strong> designed with your wellbeing in mind
    </li>
    <li style="padding-left: 1.5rem; position: relative; color: white !important;">
      <span style="position: absolute; left: 0;" aria-hidden="true">⏰</span>
      <strong style="color: white !important;">Smart check-ins</strong> that respect your time and energy
    </li>
    <li style="padding-left: 1.5rem; position: relative; color: white !important;">
      <span style="position: absolute; left: 0;" aria-hidden="true">🎯</span>
      <strong style="color: white !important;">Hidden helpers</strong> that appear when you need support most
    </li>
    <li style="padding-left: 1.5rem; position: relative; color: white !important;">
      <span style="position: absolute; left: 0;" aria-hidden="true">🌟</span>
      <strong style="color: white !important;">Progress celebrations</strong> for every step forward, big or small
    </li>
    <li style="padding-left: 1.5rem; position: relative; color: white !important;">
      <span style="position: absolute; left: 0;" aria-hidden="true">🎮</span>
      <strong style="color: white !important;">Thoughtful surprises</strong> that make using the app a positive experience
    </li>
  </ul>
  
  <p style="margin: 1rem 0 0; font-size: 0.95rem; font-style: italic; color: white !important;">
    <span aria-hidden="true">💡</span> <strong style="color: white !important;">Note:</strong> The more you use 3mpwrApp, the more helpful features you'll discover—all designed to support you.
  </p>
</div>

---

## Why 3mpwr?

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>
<button class="email-section-btn" data-section="why-3mpwr" aria-label="Email this section to yourself">📧 Email this section</button>

**A Health & Fitness, Medical, and Social Support Platform**

3mpwr provides practical tools and a vibrant community to help you:
- <strong>Connect</strong> with others who understand your journey (Social)
- <strong>Advocate</strong> for your rights and meaningful change (Self-help)
- <strong>Track</strong> your wellness, medications, and health data (Health & Fitness, Medical)
- <strong>Personalize</strong> your experience with customizable accessibility features (Personalization)
- <strong>Learn</strong> about resources, rights, and support available to you
- <strong>Grow</strong> through peer support and shared experiences

{%- include social-share.html title="3mpwrApp - Community-Powered Support Platform" description="A free platform for injured workers and persons with disabilities in Canada" -%}

---

## Features

<span class="energy-cost" data-energy="3" aria-label="Energy cost: medium">🔋🔋🔋 Energy: Medium</span>
<button class="email-section-btn" data-section="features" aria-label="Email this section to yourself">📧 Email this section</button>

<ul class="features-grid" aria-label="Key features">
  <li>
    <h3>Community Support</h3>
    <p>Connect with others, share stories, and build solidarity in province-specific spaces.</p>
    <p><small><a href="{{ '/user-guide#community' | relative_url }}">📖 Learn more in User Guide →</a></small></p>
  </li>
  <li>
    <h3>Advocacy & Campaigns</h3>
    <p>Access campaign resources and tools to help drive change in policies and workplaces.</p>
    <p><small><a href="{{ '/user-guide#advocacy-tools' | relative_url }}">📖 Learn more in User Guide →</a></small></p>
  </li>
  <li>
    <h3>Educational Resources</h3>
    <p>Learn your rights, access guides and templates, and stay informed about important issues.</p>
    <p><small><a href="{{ '/user-guide#resources' | relative_url }}">📖 Learn more in User Guide →</a></small></p>
  </li>
  <li>
    <h3>Podcasts & Updates</h3>
    <p>Listen to stories, insights, and conversations from the community.</p>
    <p><small><a href="{{ '/user-guide#podcasts' | relative_url }}">📖 Learn more in User Guide →</a></small></p>
  </li>
</ul>

{%- include social-share.html title="3mpwrApp Features - Community, Advocacy & More" compact="true" -%}

---

## Get the app

<p>Mobile apps are in progress. Store availability is coming soon.</p>

<ul class="store-badges" aria-label="App store availability">
  <li>
    <figure class="store-badge">
      <img src="{{ '/assets/images/app-store-coming-soon.svg' | relative_url }}"
        alt=""
        loading="lazy"
        decoding="async"
      >
      <figcaption class="sr-only">App Store — coming soon</figcaption>
    </figure>
  </li>
  <li>
    <figure class="store-badge">
      <img src="{{ '/assets/images/google-play-coming-soon.svg' | relative_url }}"
        alt=""
        loading="lazy"
        decoding="async"
      >
      <figcaption class="sr-only">Google Play — coming soon</figcaption>
    </figure>
  </li>
</ul>

<!-- When live, replace the figures above with anchors like:
<a class="store-link" href="https://apps.apple.com/app/idYOUR_ID">
  <img src="{{ '/assets/images/app-store-badge.svg' | relative_url }}" alt="Download on the App Store" loading="lazy" decoding="async">
</a>
-->

---

## Get Involved

Ready to join the movement? Here's how you can get started:

<div class="gradient-banner" style="color: white !important;">
  <h3 style="margin: 0 0 0.5rem; color: white !important;"><span aria-hidden="true">🚀</span> Phase 1 Beta Testing - Now Accepting Signups!</h3>
  <p style="margin: 0 0 1rem; font-size: 1rem; color: white !important;">Be among the first testers to shape the future of disability advocacy technology.</p>
  <a href="https://forms.gle/46yVp37vfitfitLT9" target="_blank" rel="noopener noreferrer" class="cta-button" style="display: inline-block; background: #ffffff !important; color: #5568d3 !important; padding: 0.75rem 2rem; border-radius: 4px; font-weight: bold; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Sign Up for Beta Testing →</a>
  <p style="margin: 1rem 0 0; font-size: 0.9rem; color: white !important;"><a href="{{ '/app-waitlist' | relative_url }}" style="color: white !important; text-decoration: underline; font-weight: 500;">Learn more about the app waitlist</a> | <a href="{{ '/beta-guide' | relative_url }}" style="color: white !important; text-decoration: underline; font-weight: 500;">Beta testing guide</a></p>
</div>

- <a href="{{ '/user-guide' | relative_url }}"><strong><span aria-hidden="true">📖</span> Read Our Complete User Guide</strong></a> – **NEW Phase 2!** Comprehensive guide with Disability Wizard, Legal Workflow Automation, Indigenous Languages, and more ([Download PDF](/assets/downloads/3mpwrapp-user-guide-full.pdf))
- <a href="{{ '/features' | relative_url }}">Explore All Features</a> – Detailed step-by-step guides for every feature
- <a href="{{ '/newsletter' | relative_url }}">Subscribe to Our Newsletter</a> – Stay updated with the latest news and resources
- <a href="{{ '/blog' | relative_url }}">Explore Our Blog</a> – Read stories, updates, and important information

{%- include social-share.html title="Join 3mpwrApp Beta Testing - Shape the Future" description="Be among the first to test disability advocacy technology" -%}

---

## Curated Daily Highlights

<section class="highlight-banner" role="region" aria-labelledby="latest-curated">
  {% comment %}Filter posts to show only TODAY's content{% endcomment %}
  {% assign today = 'now' | date: '%Y-%m-%d' %}
  {% assign all_daily = site.posts | where_exp: 'p', "p.tags contains 'highlights'" %}
  {% assign daily_today = '' | split: '' %}
  {% for post in all_daily %}
    {% assign post_date = post.date | date: '%Y-%m-%d' %}
    {% if post_date == today %}
      {% assign daily_today = daily_today | push: post %}
    {% endif %}
  {% endfor %}
  {% assign latest_curated = daily_today | first %}
  <h3 id="latest-curated" style="color: #1f2937 !important;">
    <span aria-hidden="true">🎯</span> Daily highlights from across Canada
    {% if latest_curated %}
      <span class="badge badge--new" aria-label="Updated today">✅ {{ today | date: "%B %-d, %Y" }}</span>
    {% endif %}
  </h3>
  <p class="highlight-banner__desc" style="color: #1f2937 !important;">A quick, accessible round-up of community stories, resources, and calls-to-action <strong style="color: #1f2937 !important;">updated automatically every day</strong>.</p>
  <div class="highlight-banner__actions">
    <a class="highlight-banner__button" href="{{ '/blog/#curated-daily' | relative_url }}" aria-describedby="curated-daily-desc" style="color: #1f2937 !important;">
      Check out today's curated feed →
    </a>
    <span id="curated-daily-desc" class="sr-only">This link takes you to the curated daily feed section on our blog.</span>
  </div>

  {% if daily_today and daily_today.size > 0 %}
    <ul class="highlight-banner__list" aria-label="Today's curated items">
      {% for post in daily_today limit:3 %}
      <li>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        <small> — {{ post.date | date: "%B %-d, %Y" }}</small>
      </li>
      {% endfor %}
    </ul>
    <p style="margin:0.25rem 0 0;"><a href="{{ '/blog/#curated-daily' | relative_url }}">See all daily highlights →</a></p>
  {% else %}
    <p class="highlight-banner__desc" style="margin:0;"><strong>📅 Today is {{ today | date: "%B %-d, %Y" }}</strong> – No highlights yet today. Check back soon - new content posted daily at 9 AM UTC!</p>
  {% endif %}
</section>
---

## <span aria-hidden="true">📄</span> Legal & Privacy

We're committed to transparency and protecting your rights:

- **[Terms of Service](/terms/)** - Our terms and comprehensive disclaimers
- **[Privacy Policy](/privacy/)** - How we handle your data
- **[Data Ownership](/data-ownership/)** - Your 100% data sovereignty guarantee
- **[Privacy Controls](/privacy-controls/)** - Manage your privacy settings
- **[Community Guidelines](/community/guidelines/)** - Community standards
- **[Legal Disclaimers](/legal/disclaimers/)** - All disclaimers in one place

---

{% if site.posts.size > 0 %}
<section aria-labelledby="latest-posts">
  <h2 id="latest-posts"><span aria-hidden="true">📰</span> Latest from the blog <span class="badge badge--new" aria-label="Automatically updated">Auto-updated</span></h2>
  <p style="margin: 0 0 1rem; font-size: 0.95rem; opacity: 0.9;">Showing the 3 most recent blog posts (excluding daily highlights) – automatically stays current</p>
  <ul class="post-list">
    {% assign shown = 0 %}
    {% for post in site.posts %}
      {% unless post.tags contains 'highlights' %}
        <li>
          <h3 style="margin-bottom: 0.25rem;">
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          </h3>
          <p><small>{{ post.date | date: "%B %-d, %Y" }}</small></p>
          {% if post.excerpt %}
          <p>{{ post.excerpt }}</p>
          {% endif %}
        </li>
        {% assign shown = shown | plus: 1 %}
      {% endunless %}
      {% if shown == 3 %}{% break %}{% endif %}
    {% endfor %}
  </ul>
  <p><a href="{{ '/blog' | relative_url }}">See all posts →</a></p>
</section>
---
{% endif %}

## <span aria-hidden="true">📅</span> Weekly updates <span class="badge badge--new" aria-label="Automatically updated">Auto-updated</span>

{% assign weeklies = site.posts | where_exp: 'p', "p.tags contains 'weekly'" %}
{% assign today = 'now' | date: '%s' %}
{% assign one_week_ago = today | minus: 604800 %}
{% assign this_week_posts = '' | split: '' %}
{% for p in weeklies %}
  {% assign post_date = p.date | date: '%s' %}
  {% if post_date >= one_week_ago %}
    {% assign this_week_posts = this_week_posts | push: p %}
  {% endif %}
{% endfor %}
{% if this_week_posts and this_week_posts.size > 0 %}
<p style="margin: 0 0 1rem; font-size: 0.95rem; opacity: 0.9;">Showing weekly updates from the past 7 days – automatically filtered to current week</p>
<div class="weekly-swiper" role="region" aria-labelledby="weekly-title">
  <h3 id="weekly-title" class="sr-only">Weekly update posts</h3>
  <div class="weekly-track" data-weekly-track>
    {% for p in this_week_posts limit:3 %}
    <article class="weekly-card">
      <h3 class="weekly-card__title"><a href="{{ p.url | relative_url }}">{{ p.title }}</a></h3>
      <p class="weekly-card__meta">{{ p.date | date: "%B %-d, %Y" }}</p>
      {% if p.excerpt %}<p class="weekly-card__excerpt">{{ p.excerpt }}</p>{% endif %}
    </article>
    {% endfor %}
  </div>
  <div class="weekly-controls" role="group" aria-label="Weekly navigation">
    <button class="weekly-btn" data-dir="-1" aria-label="Previous">‹</button>
    <button class="weekly-btn" data-dir="1" aria-label="Next">›</button>
    <a class="weekly-all" href="{{ '/blog' | relative_url }}">All posts →</a>
  </div>
</div>
<!-- Note: CSS styles moved to external stylesheets per W3C HTML5 spec - style elements must be in head, not in main content area -->
<!-- The .weekly-* and related styles are now in assets/css/homepage-animations.css -->
.weekly-all:hover {
  text-decoration: underline;
}
@media (prefers-reduced-motion: no-preference) {
  .weekly-track { scroll-behavior: smooth; }
}
</style>

<script>
(function(){
  var track = document.querySelector('[data-weekly-track]');
  if (!track) return;
  var step = 300;
  function byDir(dir){ try { track.scrollBy({ left: step*dir, top: 0, behavior: (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth') }); } catch(e){ track.scrollLeft += step*dir; } }
  document.querySelectorAll('.weekly-btn').forEach(function(btn){
    btn.addEventListener('click', function(){ var dir = parseInt(btn.getAttribute('data-dir')||'1',10); byDir(dir); });
  });
})();
</script>
{% else %}
<p>No weekly updates in the past 7 days. Check back soon or <a href="{{ '/blog' | relative_url }}">view all posts →</a></p>
{% endif %}

## Connect With Us

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border: 3px solid #ffd700;">
  <h3 style="color: #fff; margin-top: 0; font-size: 1.4em; text-align: center;">🌟 Join Our Community! 🌟</h3>
  <p style="color: #fff; text-align: center; font-size: 1.1em; margin: 10px 0;">
    <strong>New!</strong> Connect with fellow 3mpwr users, share experiences, and get support in the <strong>3mpwr App Hub</strong>
  </p>
  <div style="text-align: center; margin: 15px 0;">
    <a href="https://www.facebook.com/groups/1848263672453552" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #ffd700; color: #333; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.2em; box-shadow: 0 3px 10px rgba(0,0,0,0.3); transition: transform 0.2s;">
      {%- include social-icons.html name='facebook' -%} Join 3mpwr App Hub on Facebook →
    </a>
  </div>
</div>

Follow 3mpwr on social media to stay connected and be part of the community:

<p style="margin: 0.5rem 0 1rem; font-size: 1.05rem; color: #4b5563;">
  <strong>Use <span style="background: #f3f4f6; padding: 3px 8px; border-radius: 4px; font-family: monospace; color: #1f2937;">#3mpwrApp</span> to join the conversation!</strong>
</p>

<ul aria-label="Social links" class="socials-list">
  <li><a href="https://www.facebook.com/3mpowrapp" target="_blank" rel="noopener noreferrer">{%- include social-icons.html name='facebook' -%} Facebook</a> – Follow us for updates and community news</li>
  <li><a href="https://x.com/3mpowrApp0816" target="_blank" rel="noopener noreferrer">{%- include social-icons.html name='x' -%} X (Twitter)</a> – Join the conversation</li>
  <li><a href="https://www.instagram.com/3mpowrapp/" target="_blank" rel="noopener noreferrer">{%- include social-icons.html name='instagram' -%} Instagram</a> – See our latest posts and stories</li>
  <li><a href="https://www.youtube.com/3mpwrApp" target="_blank" rel="noopener noreferrer">{%- include social-icons.html name='youtube' -%} YouTube</a> – Watch videos and live sessions</li>
  <li><a href="https://www.tiktok.com/@3mpwrapp" target="_blank" rel="noopener noreferrer">{%- include social-icons.html name='tiktok' -%} TikTok</a> – Short clips and updates</li>
</ul>

{%- include social-share.html title="Connect with 3mpwrApp Community" description="Join injured workers and persons with disabilities across Canada" compact="true" -%}

---

<strong>Stay informed, empowered, and connected!</strong>

Questions? <a href="{{ '/contact' | relative_url }}">Contact us</a> — we're here to help.

---

<!-- Community Counter -->
<div class="community-stats-box" style="color: #1f2937 !important;">
  <p style="margin: 0; font-size: 1.1rem; color: #1f2937 !important;"><strong style="color: #1f2937 !important;"><span aria-hidden="true">💚</span> Join Our Growing Community</strong></p>
  <p style="margin: 0.5rem 0 0; color: #1f2937 !important;">
    Currently launching Phase 1 closed beta - <a href="{{ '/beta' | relative_url }}" style="color: #0645ad !important;">sign up to be among the first testers</a>
  </p>
</div>

<!-- Page Feedback -->


{%- include page-feedback.html -%}

<!-- Homepage Styles & Scripts (external for performance) -->
<link rel="stylesheet" href="{{ '/assets/css/design-system.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/homepage-animations.css' | relative_url }}">
<script src="{{ '/assets/js/accessibility-toolbar.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/homepage-features.js' | relative_url }}" defer></script>

<!-- REMOVED: 700+ lines of inline JavaScript moved to external file -->
<!-- This improves: page load speed, caching, parsing performance -->

