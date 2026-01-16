---
layout: default
title: 3mpwrApp - Community Support for Injured Workers & Persons with Disabilities
description: Free community-powered platform connecting injured workers, persons with disabilities, and allies. Tools, resources, and support for disability rights and advocacy.
---

<link rel="stylesheet" href="{{ '/assets/css/homepage.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/accessibility-toolbar.css' | relative_url }}">
<script src="{{ '/assets/js/accessibility-toolbar.js' | relative_url }}" defer></script>

{%- include complexity-toggle.html -%}
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

<!-- Feature Carousel -->
<section class="feature-carousel-section" style="margin-bottom: 4rem;">
  <h2 style="text-align: center; font-size: 2rem; margin-bottom: 2.5rem; color: var(--text-color);">
    Explore & Discover
  </h2>
  
  <div class="carousel-container">
    <button class="carousel-btn carousel-prev" aria-label="Previous slide">‹</button>
    
    <div class="carousel-track-container">
      <div class="carousel-track">
        
        <!-- Slide 1: Disability Bulletin -->
        <div class="carousel-slide" data-slide="1">
          <div class="carousel-card">
            <div class="carousel-icon">📰</div>
            <h3>Disability Bulletin</h3>
            <p>Stay informed with latest news, policy changes, and rights updates affecting the disability community</p>
            <a href="/blog/" class="carousel-link">Read Latest →</a>
          </div>
        </div>
        
        <!-- Slide 2: Paul & Richard YouTube -->
        <div class="carousel-slide" data-slide="2">
          <div class="carousel-card">
            <div class="carousel-icon">🎥</div>
            <h3>Paul & Richard Show</h3>
            <p>Watch inspiring conversations with advocates, survivors, and changemakers in the disability rights movement</p>
            <a href="https://www.youtube.com/@PaulAndRichardShow" target="_blank" rel="noopener" class="carousel-link">Watch Now →</a>
          </div>
        </div>
        
        <!-- Slide 3: Community Spotlight -->
        <div class="carousel-slide" data-slide="3">
          <div class="carousel-card">
            <div class="carousel-icon">⭐</div>
            <h3>Community Spotlight</h3>
            <p>Meet amazing members making a difference - their stories, struggles, and victories inspire us all</p>
            <a href="/community-spotlight/" class="carousel-link">View Profiles →</a>
          </div>
        </div>
        
        <!-- Slide 4: Evidence Locker -->
        <div class="carousel-slide" data-slide="4">
          <div class="carousel-card">
            <div class="carousel-icon">🗂️</div>
            <h3>Evidence Locker</h3>
            <p>Secure cloud storage for WSIB claims, medical records, and legal documents - encrypted and always accessible</p>
            <a href="/features/#evidence-locker" class="carousel-link">Learn More →</a>
          </div>
        </div>
        
        <!-- Slide 5: Wellness Hub -->
        <div class="carousel-slide" data-slide="5">
          <div class="carousel-card">
            <div class="carousel-icon">🧘</div>
            <h3>Wellness Hub</h3>
            <p>Guided meditations, breathing exercises, and pain management techniques designed for chronic conditions</p>
            <a href="/wellness/" class="carousel-link">Start Healing →</a>
          </div>
        </div>
        
        <!-- Slide 6: Legal Resources -->
        <div class="carousel-slide" data-slide="6">
          <div class="carousel-card">
            <div class="carousel-icon">⚖️</div>
            <h3>Know Your Rights</h3>
            <p>Free legal guides for WSIB appeals, ODSP applications, and disability discrimination cases</p>
            <a href="/legal/" class="carousel-link">Access Guides →</a>
          </div>
        </div>
        
        <!-- Slide 7: Crisis Resources -->
        <div class="carousel-slide" data-slide="7">
          <div class="carousel-card">
            <div class="carousel-icon">🆘</div>
            <h3>Crisis Support</h3>
            <p>Immediate help when you need it most - mental health hotlines, emergency contacts, and safety planning</p>
            <a href="/crisis-resources/" class="carousel-link">Get Help Now →</a>
          </div>
        </div>
        
        <!-- Slide 8: Accessibility Tools -->
        <div class="carousel-slide" data-slide="8">
          <div class="carousel-card">
            <div class="carousel-icon">♿</div>
            <h3>Accessibility Features</h3>
            <p>Brain fog mode, complexity toggle, text-to-speech, and more - built for real accessibility needs</p>
            <a href="/accessibility/" class="carousel-link">Explore Tools →</a>
          </div>
        </div>
        
        <!-- Slide 9: Events Calendar -->
        <div class="carousel-slide" data-slide="9">
          <div class="carousel-card">
            <div class="carousel-icon">📅</div>
            <h3>Community Events</h3>
            <p>Support groups, advocacy meetups, and educational workshops - connect with others who understand</p>
            <a href="/events/" class="carousel-link">View Calendar →</a>
          </div>
        </div>
        
        <!-- Slide 10: Advocacy Campaigns -->
        <div class="carousel-slide" data-slide="10">
          <div class="carousel-card">
            <div class="carousel-icon">✊</div>
            <h3>Active Campaigns</h3>
            <p>Join movements for policy change, rate increases, and disability rights - your voice counts</p>
            <a href="/campaigns/" class="carousel-link">Take Action →</a>
          </div>
        </div>
        
        <!-- Slide 11: Pain Tracker -->
        <div class="carousel-slide" data-slide="11">
          <div class="carousel-card">
            <div class="carousel-icon">📊</div>
            <h3>Symptom Tracking</h3>
            <p>Visual charts and reports to share with doctors - track pain, fatigue, mood, and medication effects</p>
            <a href="/features/#pain-tracker" class="carousel-link">Start Tracking →</a>
          </div>
        </div>
        
        <!-- Slide 12: Peer Support -->
        <div class="carousel-slide" data-slide="12">
          <div class="carousel-card">
            <div class="carousel-icon">💬</div>
            <h3>Peer Support Groups</h3>
            <p>Safe spaces to share experiences, ask questions, and find understanding without judgment</p>
            <a href="/community/" class="carousel-link">Join Groups →</a>
          </div>
        </div>
        
        <!-- Slide 13: Success Stories -->
        <div class="carousel-slide" data-slide="13">
          <div class="carousel-card">
            <div class="carousel-icon">🏆</div>
            <h3>Victory Stories</h3>
            <p>Read about successful WSIB appeals, ODSP wins, and workplace accommodations - hope is real</p>
            <a href="/blog/category/success-stories/" class="carousel-link">Read Stories →</a>
          </div>
        </div>
        
        <!-- Slide 14: Resource Library -->
        <div class="carousel-slide" data-slide="14">
          <div class="carousel-card">
            <div class="carousel-icon">📚</div>
            <h3>Resource Library</h3>
            <p>Downloadable guides, templates, and checklists for benefits applications and appeals</p>
            <a href="/resources/" class="carousel-link">Browse Library →</a>
          </div>
        </div>
        
        <!-- Slide 15: App Tour -->
        <div class="carousel-slide" data-slide="15">
          <div class="carousel-card">
            <div class="carousel-icon">📱</div>
            <h3>Take a Tour</h3>
            <p>See how the app works - screenshots, walkthroughs, and feature demos to get you started</p>
            <a href="/app-tour/" class="carousel-link">Start Tour →</a>
          </div>
        </div>
        
      </div>
    </div>
    
    <button class="carousel-btn carousel-next" aria-label="Next slide">›</button>
  </div>
  
  <div class="carousel-dots" role="tablist" aria-label="Carousel navigation">
    <button class="carousel-dot active" data-slide="1" role="tab" aria-label="Slide 1"></button>
    <button class="carousel-dot" data-slide="2" role="tab" aria-label="Slide 2"></button>
    <button class="carousel-dot" data-slide="3" role="tab" aria-label="Slide 3"></button>
    <button class="carousel-dot" data-slide="4" role="tab" aria-label="Slide 4"></button>
    <button class="carousel-dot" data-slide="5" role="tab" aria-label="Slide 5"></button>
    <button class="carousel-dot" data-slide="6" role="tab" aria-label="Slide 6"></button>
    <button class="carousel-dot" data-slide="7" role="tab" aria-label="Slide 7"></button>
    <button class="carousel-dot" data-slide="8" role="tab" aria-label="Slide 8"></button>
    <button class="carousel-dot" data-slide="9" role="tab" aria-label="Slide 9"></button>
    <button class="carousel-dot" data-slide="10" role="tab" aria-label="Slide 10"></button>
    <button class="carousel-dot" data-slide="11" role="tab" aria-label="Slide 11"></button>
    <button class="carousel-dot" data-slide="12" role="tab" aria-label="Slide 12"></button>
    <button class="carousel-dot" data-slide="13" role="tab" aria-label="Slide 13"></button>
    <button class="carousel-dot" data-slide="14" role="tab" aria-label="Slide 14"></button>
    <button class="carousel-dot" data-slide="15" role="tab" aria-label="Slide 15"></button>
  </div>
  
  <div class="carousel-controls" style="text-align: center; margin-top: 1.5rem;">
    <button id="carousel-pause" class="carousel-control-btn" aria-label="Pause automatic slideshow">⏸️ Pause</button>
    <span class="carousel-status" role="status" aria-live="polite" aria-atomic="true"></span>
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

// Carousel functionality
function initCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return; // Exit if carousel not found
  
  const slides = Array.from(track.children);
  if (slides.length === 0) return; // Exit if no slides
  
  const nextButton = document.querySelector('.carousel-next');
  const prevButton = document.querySelector('.carousel-prev');
  const dotsNav = document.querySelector('.carousel-dots');
  const dots = Array.from(dotsNav.children);
  const pauseButton = document.getElementById('carousel-pause');
  const statusEl = document.querySelector('.carousel-status');
  
  if (!nextButton || !prevButton || !dotsNav || !pauseButton || !statusEl) return;
  
  let currentSlide = 0;
  let autoPlayInterval;
  let isPaused = false;
  
  // Set explicit widths on slides based on container
  const containerWidth = document.querySelector('.carousel-track-container').offsetWidth;
  slides.forEach(slide => {
    slide.style.width = `${containerWidth}px`;
  });
  
  const moveToSlide = (currentIndex, targetIndex) => {
    const currentDot = dots[currentIndex];
    const targetDot = dots[targetIndex];
    
    // Get the container width
    const containerWidth = document.querySelector('.carousel-track-container').offsetWidth;
    // Move by container width for each slide
    const moveAmount = targetIndex * containerWidth;
    console.log(`Moving to slide ${targetIndex + 1}, container width: ${containerWidth}px, moving: -${moveAmount}px`);
    track.style.transform = `translateX(-${moveAmount}px)`;
    currentDot.classList.remove('active');
    targetDot.classList.add('active');
    
    // Announce to screen readers
    const slideCard = slides[targetIndex].querySelector('.carousel-card h3');
    if (slideCard) {
      statusEl.textContent = `Showing: ${slideCard.textContent}. Slide ${targetIndex + 1} of ${slides.length}`;
    }
  };
  
  // Add resize handler to recalculate on window resize
  window.addEventListener('resize', () => {
    const containerWidth = document.querySelector('.carousel-track-container').offsetWidth;
    const moveAmount = currentSlide * containerWidth;
    track.style.transform = `translateX(-${moveAmount}px)`;
  });
  
  const nextSlide = () => {
    const nextIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    moveToSlide(currentSlide, nextIndex);
    currentSlide = nextIndex;
  };
  
  const prevSlide = () => {
    const prevIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    moveToSlide(currentSlide, prevIndex);
    currentSlide = prevIndex;
  };
  
  // Auto-play
  const startAutoPlay = () => {
    if (!isPaused && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      autoPlayInterval = setInterval(nextSlide, 6000); // 6 seconds per slide
    }
  };
  
  const stopAutoPlay = () => {
    clearInterval(autoPlayInterval);
  };
  
  // Next button
  nextButton.addEventListener('click', () => {
    stopAutoPlay();
    nextSlide();
    if (!isPaused) startAutoPlay();
  });
  
  // Previous button
  prevButton.addEventListener('click', () => {
    stopAutoPlay();
    prevSlide();
    if (!isPaused) startAutoPlay();
  });
  
  // Dot navigation
  dotsNav.addEventListener('click', (e) => {
    const targetDot = e.target.closest('.carousel-dot');
    if (!targetDot) return;
    
    stopAutoPlay();
    const targetIndex = dots.indexOf(targetDot);
    moveToSlide(currentSlide, targetIndex);
    currentSlide = targetIndex;
    if (!isPaused) startAutoPlay();
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('.carousel-container')) {
      if (e.key === 'ArrowLeft') {
        stopAutoPlay();
        prevSlide();
        if (!isPaused) startAutoPlay();
      } else if (e.key === 'ArrowRight') {
        stopAutoPlay();
        nextSlide();
        if (!isPaused) startAutoPlay();
      }
    }
  });
  
  // Pause/Play toggle
  pauseButton.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      stopAutoPlay();
      pauseButton.textContent = '▶️ Play';
      pauseButton.setAttribute('aria-label', 'Resume automatic slideshow');
      statusEl.textContent = 'Slideshow paused';
    } else {
      startAutoPlay();
      pauseButton.textContent = '⏸️ Pause';
      pauseButton.setAttribute('aria-label', 'Pause automatic slideshow');
      statusEl.textContent = 'Slideshow playing';
    }
  });
  
  // Pause on hover/focus
  const carouselContainer = document.querySelector('.carousel-container');
  carouselContainer.addEventListener('mouseenter', stopAutoPlay);
  carouselContainer.addEventListener('mouseleave', () => {
    if (!isPaused) startAutoPlay();
  });
  
  carouselContainer.addEventListener('focusin', stopAutoPlay);
  carouselContainer.addEventListener('focusout', () => {
    if (!isPaused) startAutoPlay();
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    const containerWidth = document.querySelector('.carousel-track-container').offsetWidth;
    slides.forEach(slide => {
      slide.style.width = `${containerWidth}px`;
    });
    track.style.transform = `translateX(-${currentSlide * containerWidth}px)`;
  });
  
  // Start auto-play
  startAutoPlay();
  
  // Set initial status
  statusEl.textContent = `Showing: ${slides[0].querySelector('.carousel-card h3').textContent}. Slide 1 of ${slides.length}`;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadSimpleEvents();
    loadSimpleCampaigns();
    initCarousel();
  });
} else {
  loadSimpleEvents();
  loadSimpleCampaigns();
  initCarousel();
}
</script>
