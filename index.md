---
layout: default
title: 3mpwrApp - Community Support for Injured Workers & Persons with Disabilities
description: Free community-powered platform connecting injured workers, persons with disabilities, and allies. Tools, resources, and support for disability rights and advocacy.
---

<link rel="stylesheet" href="{{ '/assets/css/homepage.css' | relative_url }}">

{%- include complexity-toggle.html -%}
{%- include status-banner.html -%}

<!-- Hero Section -->
<section class="homepage-hero">
  <picture>
    <source type="image/webp" srcset="{{ '/assets/empwrapp-logo.webp' | relative_url }}">
    <img src="{{ '/assets/empwrapp-logo.png' | relative_url }}" alt="3mpwrApp logo" width="140" height="140" loading="eager" style="margin-bottom: 1.5rem;">
  </picture>
  
  <h1>You're Not Alone. Your Voice Matters.</h1>
  
  <p class="homepage-hero-subtitle">
    Free community-powered support for injured workers, persons with disabilities, and allies across Canada
  </p>
  
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
      <span aria-hidden="true">💚</span> 100% Free Forever
      <span style="margin: 0 1rem; opacity: 0.5;">|</span>
      <span aria-hidden="true">🇨🇦</span> Built for Canada
      <span style="margin: 0 1rem; opacity: 0.5;">|</span>
      <span aria-hidden="true">♿</span> Accessibility First
    </p>
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

<!-- Quick Stats -->
<section class="homepage-stats">
  <h2>Our Impact</h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; max-width: 900px; margin: 0 auto;">
    <div>
      <div style="font-size: 3rem; font-weight: bold; margin-bottom: 0.5rem;">60+</div>
      <div style="font-size: 1.1rem; opacity: 0.9;">Practical Tools</div>
    </div>
    <div>
      <div style="font-size: 3rem; font-weight: bold; margin-bottom: 0.5rem;">100%</div>
      <div style="font-size: 1.1rem; opacity: 0.9;">Free Forever</div>
    </div>
    <div>
      <div style="font-size: 3rem; font-weight: bold; margin-bottom: 0.5rem;">AAA</div>
      <div style="font-size: 1.1rem; opacity: 0.9;">Accessibility</div>
    </div>
    <div>
      <div style="font-size: 3rem; font-weight: bold; margin-bottom: 0.5rem;">🇨🇦</div>
      <div style="font-size: 1.1rem; opacity: 0.9;">Canada-Wide</div>
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
  <h2 style="text-align: center; font-size: 2rem; margin-bottom: 2.5rem; color: var(--text-color);">
    Most Popular Tools
  </h2>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 1200px; margin: 0 auto;">
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🗂️</div>
      <h3>Evidence Locker</h3>
      <p>
        Secure document storage for WSIB claims, medical records, and legal files
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📊</div>
      <h3>Pain Tracker</h3>
      <p>
        Track symptoms daily with visual charts for medical appointments
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">💊</div>
      <h3>Med Manager</h3>
      <p>
        Never miss a dose with smart reminders and refill tracking
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🤝</div>
      <h3>Community</h3>
      <p>
        Connect with peers who understand your journey
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📝</div>
      <h3>Legal Hub</h3>
      <p>
        Know your rights with guides for WSIB, ODSP, and disability law
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🥄</div>
      <h3>Spoons Tracker</h3>
      <p>
        Manage your energy with spoon theory tracking
      </p>
    </div>
    
  </div>
  
  <div style="text-align: center; margin-top: 2.5rem;">
    <a href="/features/" style="display: inline-block; padding: 14px 32px; background: #3d4eaa; color: white; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 1.05rem; transition: all 0.2s; box-shadow: 0 2px 8px rgba(61, 78, 170, 0.2);">
      See All 60+ Features →
    </a>
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
