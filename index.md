---
layout: default
title: 3mpwrApp - Community Support for Injured Workers & Persons with Disabilities
description: Free community-powered platform connecting injured workers, persons with disabilities, and allies. Tools, resources, and support for disability rights and advocacy.
---

<link rel="stylesheet" href="{{ '/assets/css/homepage.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/accessibility-toolbar.css' | relative_url }}">
<script src="{{ '/assets/js/accessibility-toolbar.js' | relative_url }}" defer></script>

{%- include accessibility-toolbar.html -%}
{%- include status-banner.html -%}

<!-- Hero Section -->
<section class="homepage-hero">
  <picture>
    <source type="image/webp" srcset="{{ '/assets/empwrapp-logo.webp' | relative_url }}">
    <img src="{{ '/assets/empwrapp-logo.png' | relative_url }}" alt="3mpwrApp logo" width="80" height="80" loading="eager" style="margin-bottom: 1.5rem;">
  </picture>
  
  <h1>Tools, Support & Community — All in One Place</h1>
  
  <p class="homepage-hero-subtitle">
    Empowering injured workers, persons with disabilities, and allies across Canada with 100% free resources
  </p>
  
  <!-- Impact Stats -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; max-width: 700px; margin: 0 auto 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 2px solid rgba(61, 78, 170, 0.2);">
    <div>
      <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem; color: var(--text-color);">60+</div>
      <div style="font-size: 0.9rem; opacity: 0.8;">Practical Tools</div>
    </div>
    <div>
      <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem; color: var(--text-color);">100%</div>
      <div style="font-size: 0.9rem; opacity: 0.8;">Free Forever</div>
    </div>
    <div>
      <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem; color: var(--text-color);">AAA</div>
      <div style="font-size: 0.9rem; opacity: 0.8;">Accessibility</div>
    </div>
  </div>
  
  <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
    <a href="/app-waitlist/" class="homepage-btn-primary">
      <span>Join the Beta</span>
      <span aria-hidden="true">→</span>
    </a>
    <a href="/about/" class="homepage-btn-secondary">
      <span>Learn More</span>
    </a>
  </div>
  
  <div class="homepage-badge">
    <p>
      <span aria-hidden="true">�️</span> Privacy Focused
      <span style="margin: 0 1rem; opacity: 0.5;">|</span>
      <span aria-hidden="true">🤝</span> Community Powered
      <span style="margin: 0 1rem; opacity: 0.5;">|</span>
      <span aria-hidden="true">✊</span> No Corporate Control
    </p>
  </div>
</section>
<!-- Theme Song Vote Section -->
<section class="theme-song-vote" style="margin: 4rem auto; max-width: 800px; padding: 2.5rem; background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(61, 78, 170, 0.1) 100%); border-radius: 16px; border: 2px solid rgba(147, 51, 234, 0.3); box-shadow: 0 8px 32px rgba(147, 51, 234, 0.15);">
  <h2 style="text-align: center; font-size: 2.2rem; margin-bottom: 1rem; color: var(--text-color);">
    <span aria-hidden="true">🎶</span> COMMUNITY VOTE TIME!
  </h2>
  
  <div style="text-align: center; font-size: 1.15rem; line-height: 1.7; color: var(--text-color); margin-bottom: 2rem;">
    <p style="margin-bottom: 1rem;">
      <strong>Help us choose the official 3mpwr App theme song / jingle!</strong>
    </p>
    <p style="margin-bottom: 1rem;">
      We've created two versions, and your voice matters. This app is about empowerment, community, and collective action — so we want <strong>YOU</strong> to decide which one represents us best.
    </p>
  </div>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin: 2rem 0;">
    <!-- Option 1 -->
    <div style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px; border: 2px solid rgba(61, 78, 170, 0.3); text-align: center;">
      <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--text-color);">
        <span aria-hidden="true">🎧</span> Option 1
      </h3>
      <a href="https://suno.com/s/enuXDfFsc65WWAMr" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.75rem 1.5rem; background: #3d4eaa; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s ease;" onmouseover="this.style.background='#2d3e8a'" onmouseout="this.style.background='#3d4eaa'">
        <span aria-hidden="true">▶️</span> Listen to Option 1
      </a>
    </div>
    
    <!-- Option 2 -->
    <div style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px; border: 2px solid rgba(147, 51, 234, 0.3); text-align: center;">
      <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--text-color);">
        <span aria-hidden="true">🎧</span> Option 2
      </h3>
      <a href="https://suno.com/s/L8ODWoVmMMhEcl67" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.75rem 1.5rem; background: #9333ea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s ease;" onmouseover="this.style.background='#7c22c7'" onmouseout="this.style.background='#9333ea'">
        <span aria-hidden="true">▶️</span> Listen to Option 2
      </a>
    </div>
  </div>
  
  <!-- Vote Poll - Google Form Embed -->
  <div style="text-align: center; padding: 2rem; background: rgba(255, 255, 255, 0.03); border-radius: 12px; margin-top: 2rem;">
    <h3 style="font-size: 1.3rem; margin-bottom: 1.5rem; color: var(--text-color);">
      <span aria-hidden="true">🗳️</span> Cast Your Vote:
    </h3>
    
    <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSerzXn2RpkzKIP9X7zrNYQWtVuBbl8gQhzpl93ymLKgKPgRlg/viewform?embedded=true" width="100%" height="500" frameborder="0" marginheight="0" marginwidth="0" style="max-width: 640px; border-radius: 8px;">Loading…</iframe>
    
    <p style="font-size: 1.05rem; font-style: italic; color: var(--text-secondary); margin-top: 1.5rem;">
      This isn't just a song — it's our anthem.<br>
      Let's build 3mpwr together. <span aria-hidden="true" style="color: #9333ea;">💜</span>
    </p>
    
    <div style="margin-top: 1.5rem;">
      <a href="https://docs.google.com/forms/d/e/1FAIpQLSerzXn2RpkzKIP9X7zrNYQWtVuBbl8gQhzpl93ymLKgKPgRlg/viewanalytics" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.5rem 1rem; background: rgba(147, 51, 234, 0.2); border: 1px solid rgba(147, 51, 234, 0.4); color: var(--text-color); text-decoration: none; border-radius: 6px; font-size: 0.95rem; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(147, 51, 234, 0.3)'" onmouseout="this.style.background='rgba(147, 51, 234, 0.2)'">
        <span aria-hidden="true">📊</span> View Live Results
      </a>
    </div>
  </div>
  
  <!-- Social Sharing -->
  <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
    <p style="font-size: 1rem; margin-bottom: 1rem; color: var(--text-secondary);">
      <span aria-hidden="true">📢</span> Share with your community:
    </p>
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <a href="https://twitter.com/intent/tweet?text=Help%20choose%20the%20official%203mpwr%20App%20theme%20song!%20%F0%9F%8E%B6%20Vote%20now%20at%20https://3mpwrapp.github.io/%23theme-song-vote" target="_blank" rel="noopener noreferrer" style="padding: 0.5rem 1rem; background: #1DA1F2; color: white; text-decoration: none; border-radius: 6px; font-size: 0.95rem;" aria-label="Share on Twitter">
        <span aria-hidden="true">🐦</span> Twitter
      </a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=https://3mpwrapp.github.io/%23theme-song-vote" target="_blank" rel="noopener noreferrer" style="padding: 0.5rem 1rem; background: #4267B2; color: white; text-decoration: none; border-radius: 6px; font-size: 0.95rem;" aria-label="Share on Facebook">
        <span aria-hidden="true">📘</span> Facebook
      </a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://3mpwrapp.github.io/%23theme-song-vote" target="_blank" rel="noopener noreferrer" style="padding: 0.5rem 1rem; background: #0077B5; color: white; text-decoration: none; border-radius: 6px; font-size: 0.95rem;" aria-label="Share on LinkedIn">
        <span aria-hidden="true">💼</span> LinkedIn
      </a>
      <a href="https://reddit.com/submit?url=https://3mpwrapp.github.io/%23theme-song-vote&title=Help%20choose%20the%20official%203mpwr%20App%20theme%20song!" target="_blank" rel="noopener noreferrer" style="padding: 0.5rem 1rem; background: #FF4500; color: white; text-decoration: none; border-radius: 6px; font-size: 0.95rem;" aria-label="Share on Reddit">
        <span aria-hidden="true">🤖</span> Reddit
      </a>
    </div>
  </div>
</section>
<!-- Value Proposition Cards -->
<section class="value-props" style="margin-bottom: 4rem;">
  <h2 style="text-align: center; font-size: 2rem; margin-bottom: 2.5rem; color: var(--text-color);">
    Why 3mpwrApp?
  </h2>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto;">
    
    <!-- Card 1: Community -->
    <div class="homepage-value-card">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🤝</div>
      <h3>Built BY Community, FOR Community</h3>
      <p>
        Created by someone who lived it. Every feature designed with real experiences from injured workers and disabled people.
      </p>
      <a href="/about/" style="color: #3d4eaa; text-decoration: none; font-weight: 600;">
        Our Story →
      </a>
    </div>
    
    <!-- Card 2: Tools -->
    <div class="homepage-value-card">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🛠️</div>
      <h3>60+ Practical Tools</h3>
      <p>
        Evidence locker, pain tracker, medication manager, legal resources, and more. Everything you need in one place.
      </p>
      <a href="/features/" style="color: #047857; text-decoration: none; font-weight: 600;">
        Explore Features →
      </a>
    </div>
    
    <!-- Card 3: Accessibility -->
    <div class="homepage-value-card">
      <div style="font-size: 3rem; margin-bottom: 1rem;">♿</div>
      <h3>Revolutionary Accessibility</h3>
      <p>
        Built for brain fog, chronic pain, and fatigue. Complexity toggle, need-a-break button, and pain flare mode.
      </p>
      <a href="/accessibility/" style="color: #9333ea; text-decoration: none; font-weight: 600;">
        Accessibility Features →
      </a>
    </div>
    
  </div>
</section>

<!-- Events & Campaigns Grid -->
<section class="content-grid" style="margin-bottom: 4rem;">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2rem;">
    
    <!-- Events Column -->
    <div class="homepage-events-box">
      <h2>
        <span aria-hidden="true">📅</span> This Week's Events
      </h2>
      <p style="opacity: 0.9; margin-bottom: 1.5rem;">Community meetups, support groups, and advocacy gatherings</p>
      
      <div id="events-simple-container" style="min-height: 150px;">
        <p>Loading upcoming events...</p>
      </div>
      
      <a href="/events/" class="homepage-box-link">
        View Full Calendar →
      </a>
    </div>
    
    <!-- Campaigns Column -->
    <div class="homepage-campaigns-box">
      <h2>
        <span aria-hidden="true">✊</span> Active Campaigns
      </h2>
      <p style="opacity: 0.9; margin-bottom: 1.5rem;">Join us in advocating for disability rights and policy change</p>
      
      <div id="campaigns-simple-container" style="min-height: 150px;">
        <p>Loading advocacy campaigns...</p>
      </div>
      
      <a href="/campaigns/" class="homepage-box-link">
        All Campaigns →
      </a>
    </div>
    
  </div>
</section>

<!-- Core Features Highlights -->
<section class="features-highlight" style="margin-bottom: 4rem;">
  <h2 style="text-align: center; font-size: 2rem; margin-bottom: 1rem; color: var(--text-color);">
    Features That Grow Stronger Together
  </h2>
  <p style="text-align: center; font-size: 1.1rem; color: var(--text-secondary); max-width: 800px; margin: 0 auto 2.5rem; line-height: 1.6;">
    The more people who join, the more powerful these features become - collective strength that creates real change
  </p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 1200px; margin: 0 auto;">
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📸</div>
      <h3>Evidence Locker</h3>
      <p>
        <strong>COLLECTIVE POWER:</strong> Photo your documents, AI extracts text, community validates - crowdsourced justice that gets stronger with every upload
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📢</div>
      <h3>Community & Campaigns</h3>
      <p>
        <strong>NETWORK STRENGTH:</strong> Together we organize, advocate, and win - more voices mean more power for real systemic change
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">⚖️</div>
      <h3>Legal & Knowledge Sharing</h3>
      <p>
        <strong>SHARED WISDOM:</strong> Shared legal strategies, winning patterns, resources - every case we track helps everyone else win
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📋</div>
      <h3>Appeal Command Center</h3>
      <p>
        <strong>STRATEGIC POWER:</strong> Deadline tracking, document management, tribunal prep - everything you need to fight back and win your appeal
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">💰</div>
      <h3>Financial Safety Net</h3>
      <p>
        <strong>SURVIVAL TOOLS:</strong> Budget tracking, benefit calculators, emergency resources - manage finances when every dollar counts
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🌿</div>
      <h3>Wellness Hub</h3>
      <p>
        <strong>HOLISTIC CARE:</strong> Pain tracking, symptom journals, exercise routines, meditation - tools for managing your health day by day
      </p>
    </div>
    
  </div>
  
  <div style="text-align: center; margin-top: 2.5rem;">
    <a href="/features/" style="display: inline-block; padding: 14px 32px; background: #3d4eaa; color: white; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 1.05rem; transition: all 0.2s; box-shadow: 0 2px 8px rgba(61, 78, 170, 0.2);">
      See All 60+ Revolutionary Features →
    </a>
  </div>
</section>

<!-- App Tour with Real Screenshots -->
<!-- App Tour with Real Screenshots -->
<section class="app-tour-section">
  <h2 class="app-tour-heading">
    See the App in Action
  </h2>
  <p class="app-tour-intro">
    Real screenshots from the 3mpwr App. <strong>Available Q2 2026</strong> for iOS and Android.
  </p>
  
  <div class="app-tour-grid">
    
    <!-- Home Screen -->
    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/home13mpwrapp.png' | relative_url }}" 
           alt="3mpwr App Home Screen Dashboard" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">Home Dashboard</h3>
        <p class="app-tour-card-description">Quick access to all your essential tools and resources</p>
      </div>
    </div>
    
    <!-- Wellness Hub -->
    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/wellnesstab13mpwrapp.png' | relative_url }}" 
           alt="3mpwr App Wellness Hub with pain tracking and symptom logging" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">Wellness Hub</h3>
        <p class="app-tour-card-description">Track symptoms, pain levels, and manage your health</p>
      </div>
    </div>
    
    <!-- Community -->
    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/community/communityhubtab3mpwrapp.png' | relative_url }}" 
           alt="3mpwr App Community Hub for peer support" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">Community Hub</h3>
        <p class="app-tour-card-description">Connect with others who understand your journey</p>
      </div>
    </div>
    
    <!-- Advocacy Tools -->
    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/advocacy13mpwrapp.png' | relative_url }}" 
           alt="3mpwr App Advocacy Tools with evidence locker and case tracking" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">Advocacy Tools</h3>
        <p class="app-tour-card-description">Evidence locker, case tracking, and legal resources</p>
      </div>
    </div>
    
    <!-- Resources Library -->
    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcestab13mpwrapp.png' | relative_url }}" 
           alt="3mpwr App Resources Library with guides and templates" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">Resources Library</h3>
        <p class="app-tour-card-description">Guides, templates, and expert knowledge at your fingertips</p>
      </div>
    </div>
    
    <!-- Settings & Accessibility -->
    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/settings/settingsadvancedaccessibility13mpwrapp.png' | relative_url }}" 
           alt="3mpwr App Settings and Accessibility Features" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">Settings & Accessibility</h3>
        <p class="app-tour-card-description">Customize your experience with 13+ accessibility features</p>
      </div>
    </div>
    
  </div>
  
  <div class="app-tour-cta">
    <a href="/app-waitlist/" class="app-tour-cta-button">
      🎯 Get Early Access — Launching Q2 2026
    </a>
    <p class="app-tour-cta-text">
      <strong>Limited beta spots</strong> • Be among the first 1,000 users
    </p>
  </div>
</section>

<!-- CTA Section -->
<section class="homepage-cta">
  <h2>
    Ready to Join Our Community?
  </h2>
  <p>
    Be part of building something meaningful. Your voice matters, your experience counts, and you belong here.
  </p>
  <a href="/app-waitlist/" class="homepage-btn-primary" style="display: inline-block; padding: 18px 40px; font-size: 1.2rem;">
    Join the Beta Waitlist →
  </a>
  <p style="margin-top: 1.5rem; opacity: 0.9; font-size: 0.95rem;">
    No credit card required • 100% free forever • Cancel anytime (but there's nothing to cancel!)
  </p>
</section>

<!-- Newsletter Signup -->
<section class="newsletter" style="margin-bottom: 4rem;">
  {%- include newsletter-signup.html -%}
</section>

<style>
/* Hover effects */
.value-props > div > div:hover,
.features-highlight > div > div:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(61, 78, 170, 0.4);
}

.btn-secondary:hover {
  background: #3d4eaa;
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem !important;
  }
  
  .hero p {
    font-size: 1.1rem !important;
  }
  
  .value-props h2,
  .features-highlight h2,
  .stats h2,
  .cta h2 {
    font-size: 1.75rem !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .value-props > div > div,
  .features-highlight > div > div,
  .btn-primary,
  .btn-secondary {
    transition: none !important;
    transform: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: more) {
  .value-props > div > div,
  .features-highlight > div > div {
    border: 3px solid currentColor;
  }
}
</style>

<script>
// Simple event loading (reuse existing logic)
async function loadSimpleEvents() {
  try {
    const response = await fetch('https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=production&ts=' + Date.now(), { cache: 'no-store' });
    const data = await response.json();
    let events = (data.events || []).filter(e => e.category === 'community' || e.category === 'support');
    
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    events = events.filter(e => {
      const d = new Date(e.date);
      return d >= now && d <= next7Days;
    }).slice(0, 3);
    
    const container = document.getElementById('events-simple-container');
    if (events.length === 0) {
      container.innerHTML = '<p style="opacity: 0.9;">No events scheduled this week. Check back soon!</p>';
      return;
    }
    
    container.innerHTML = events.map(e => {
      const date = new Date(e.date);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `
        <div class="homepage-event-item">
          <div class="event-title">${e.title}</div>
          <div class="event-meta">📅 ${dateStr} at ${timeStr}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    document.getElementById('events-simple-container').innerHTML = '<p style="opacity: 0.8;">Unable to load events</p>';
  }
}

// Simple campaigns loading
async function loadSimpleCampaigns() {
  const container = document.getElementById('campaigns-simple-container');
  container.innerHTML = '<p style="opacity: 0.9;">New campaigns launching soon. Check back!</p>';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadSimpleEvents();
    loadSimpleCampaigns();
  });
} else {
  loadSimpleEvents();
  loadSimpleCampaigns();
}
</script>
