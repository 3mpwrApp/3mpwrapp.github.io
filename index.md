---
layout: default
title: 3mpwrApp - Community Support for Injured Workers & Persons with Disabilities
description: Free community-powered platform connecting injured workers, persons with disabilities, and allies. Tools, resources, and support for disability rights and advocacy.
permalink: /
---

<link rel="stylesheet" href="{{ '/assets/css/homepage.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/accessibility-toolbar.css' | relative_url }}">
<script src="{{ '/assets/js/accessibility-toolbar.js' | relative_url }}" defer></script>

<style>
  /* Hide sidebar since spoon counter and emergency mode are now in header */
  .accessibility-toolbar {
    display: none !important;
  }
</style>

{%- include accessibility-toolbar.html -%}
{%- include status-banner.html -%}
{%- include building-public-hero.html -%}

<!-- Flywheels Diagram -->
<section class="flywheels-diagram-hero" style="text-align: center; margin: 2rem auto 3rem; max-width: 1200px;">
  <img src="{{ '/assets/images/flywheels-diagram.png' | relative_url }}" 
       alt="Diagram showing the 3mpwr Flywheels of Change: three interconnected circular arrows representing Evidence Flywheel (blue) with winning cases shared, proven templates, and legal resources leading to hours saved; Pattern Detection Flywheel (orange) analyzing decisions, finding key trends, and predicting outcomes; and Collective Action Flywheel (green) organizing campaigns, advocating for change, and driving policy reform leading to potential for systemic change. Center shows the transformation flow: Lived Experience to Data, Data to Insight, Insight to Action. Logo shows 3mpwrApp with stylized hands and power icon. Tagline: Turning Lived Experience Into Power."
       style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);">
</section>

<!-- Hero Section -->
<section class="homepage-hero">
  <picture>
    <source type="image/webp" srcset="{{ '/assets/empwrapp-logo.webp' | relative_url }}">
    <img src="{{ '/assets/empwrapp-logo.png' | relative_url }}" alt="3mpwrApp logo" width="80" height="80" loading="eager" style="margin-bottom: 1.5rem;">
  </picture>
  
  <h1>Tools, Support & Community � All in One Place</h1>
  
  <p class="homepage-hero-subtitle">
    Empowering injured workers, persons with disabilities, and allies across Canada with 100% free resources
  </p>
  
  <!-- Impact Stats -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; max-width: 900px; margin: 0 auto 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 2px solid rgba(61, 78, 170, 0.2);">
    <div>
      <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem; color: var(--text-color);">97%</div>
      <div style="font-size: 0.9rem; opacity: 0.8;">Complete</div>
    </div>
    <div>
      <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem; color: var(--text-color);">67%</div>
      <div style="font-size: 0.9rem; opacity: 0.8;">Faster</div>
    </div>
    <div>
      <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem; color: var(--text-color);">42%</div>
      <div style="font-size: 0.9rem; opacity: 0.8;">Smaller</div>
    </div>
    <div>
      <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem; color: var(--text-color);">AAA</div>
      <div style="font-size: 0.9rem; opacity: 0.8;">Accessible</div>
    </div>
  </div>
  
  <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
    <a href="/app-waitlist" class="homepage-btn-primary">
      <span>Join the Beta</span>
      <span aria-hidden="true">?</span>
    </a>
    <a href="https://www.youtube.com/watch?v=4i6xPpik_6M" class="homepage-btn-secondary" target="_blank" rel="noopener noreferrer">
      <span>?? Watch Tutorial</span>
    </a>
    <a href="/about" class="homepage-btn-secondary">
      <span>Learn More</span>
    </a>
  </div>
    <div style="margin: 1.5rem 0;">
    <a href="https://www.youtube.com/@3mpwrApp" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #FF0000; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#CC0000'" onmouseout="this.style.background='#FF0000'">
      <span aria-hidden="true">??</span>
      <span>Subscribe on YouTube</span>
    </a>
  </div>
    <div class="homepage-badge">
    <p>
      <span aria-hidden="true">??</span> Privacy Focused
      <span style="margin: 0 1rem; opacity: 0.5;">|</span>
      <span aria-hidden="true">??</span> Community Powered
      <span style="margin: 0 1rem; opacity: 0.5;">|</span>
      <span aria-hidden="true">?</span> No Corporate Control
    </p>
  </div>
</section>

<!-- CanLII Research Banner -->
<section style="max-width: 1200px; margin: 3rem auto; padding: 2rem; background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); color: white;">
  <div style="text-align: center;">
    <h2 style="font-size: 2rem; margin-bottom: 1rem; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
      <span aria-hidden="true">??</span> NEW: Connecting the Dots � CanLII Keyword Network
    </h2>
    <p style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.95; max-width: 800px; margin-left: auto; margin-right: auto;">
      Explore 134,920+ tribunal decisions: Live interactive network graph revealing keyword relationships, denial patterns, and the hidden language used in Canadian tribunal decisions.
    </p>
    <div style="margin: 1.5rem 0; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px; display: inline-block;">
      <p style="margin: 0; font-weight: 600; font-size: 1.1rem;">
        <span aria-hidden="true">??</span> 134,920 cases analyzed (98,992 WSIAT + 35,928 other tribunals) &nbsp;|&nbsp; <span aria-hidden="true">??</span> 500+ keyword patterns &nbsp;|&nbsp; <span aria-hidden="true">???</span> Live interactive D3.js network
      </p>
    </div>
    <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <a href="/connecting-the-dots-canlii-keyword-visualization-network.html" style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: white; color: #0066cc; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 16px rgba(0,0,0,0.2); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.2)'">
        <span aria-hidden="true">??</span>
        <span>Launch Interactive Visualization</span>
        <span aria-hidden="true">?</span>
      </a>
      <a href="/research.html" style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: rgba(255,255,255,0.15); color: white; border: 2px solid white; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem; transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'">
        <span aria-hidden="true">??</span>
        <span>All Research Tools</span>
      </a>
    </div>
    <p style="margin-top: 1.5rem; font-size: 0.95rem; opacity: 0.85;">
      Analyzing decisions from Ontario (WSIAT, HRTO, ONSBT), BC (BCWCAT), and more. Open source, fully transparent methodology.
    </p>
  </div>
</section>

<!-- Value Proposition Cards -->
<section class="value-props" style="margin-bottom: 4rem;">

  <!-- AI Interactive Demo -->
  <section style="max-width: 900px; margin: 2rem auto 2rem; text-align: center; padding: 2rem 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);">
    <h2 style="font-size: 1.4rem; margin-bottom: 1rem; color: #fff;">?? See 3MPWRAPP In Action</h2>
    <p style="font-size: 1.05rem; margin-bottom: 1.5rem; color: #fff; opacity: 0.95;">Try our interactive demo! Explore how Evidence Locker, Parse Claim, Deadline Tracker, and Letter Wizard help Canadians organize evidence, decode decisions, and create systemic change.</p>
    <a href="/demo/" style="display: inline-block; padding: 16px 36px; background: #fff; color: #667eea; border-radius: 8px; font-weight: 600; font-size: 1.1rem; text-decoration: none; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
      <span aria-hidden="true">??</span> Launch Interactive Demo
    </a>
  </section>

  <!-- Data Download / GitHub Link -->
  <section style="max-width: 900px; margin: 2rem auto 2rem; text-align: center; padding: 2rem 1rem; background: var(--card-bg); border-radius: 12px; border: 2px solid var(--border-color);">
    <h2 style="font-size: 1.4rem; margin-bottom: 1rem; color: var(--text-color);">Open Data: Download & Explore</h2>
    <p style="font-size: 1.05rem; margin-bottom: 1.5rem; color: var(--text-color); opacity: 0.9;">All tribunal and research data is public and open source. Download, analyze, or contribute directly on GitHub.</p>
    <a href="https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io/tree/main/data" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 16px 36px; background: var(--primary-color, #24292f); color: #fff; border-radius: 8px; font-weight: 600; font-size: 1.1rem; text-decoration: none; transition: background 0.2s;">
      <span aria-hidden="true">??</span> See Data on GitHub
    </a>
  </section>
  <h2 style="text-align: center; font-size: 2rem; margin-bottom: 2.5rem; color: var(--text-color);">
    Why 3mpwrApp?
  </h2>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto;">
    
    <!-- Card 1: Community -->
    <div class="homepage-value-card">
      <div style="font-size: 3rem; margin-bottom: 1rem;">??</div>
      <h3>Built BY Community, FOR Community</h3>
      <p>
        Created by someone who lived it. Every feature designed with real experiences from injured workers and disabled people.
      </p>
      <a href="/about" style="color: #003d7a; text-decoration: none; font-weight: 600;">
        Learn More About 3mpwrApp ?
      </a>
    </div>
    
    <!-- Card 2: Tools -->
    <div class="homepage-value-card">
      <div style="font-size: 3rem; margin-bottom: 1rem;">???</div>
      <h3>60+ Practical Tools</h3>
      <p>
        Evidence locker, pain tracker, medication manager, legal resources, and more. Everything you need in one place.
      </p>
      <a href="/features/" style="color: #005a00; text-decoration: none; font-weight: 600;">
        Explore All Features ?
      </a>
    </div>
    
    <!-- Card 3: Accessibility -->
    <div class="homepage-value-card">
      <div style="font-size: 3rem; margin-bottom: 1rem;">?</div>
      <h3>Revolutionary Accessibility</h3>
      <p>
        Built for brain fog, chronic pain, and fatigue. Complexity toggle, need-a-break button, and pain flare mode.
      </p>
      <a href="/accessibility" style="color: #5a189a; text-decoration: none; font-weight: 600;">
        Accessibility Features ?
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
        <span aria-hidden="true">??</span> This Week's Events
      </h2>
      <p style="opacity: 0.9; margin-bottom: 1.5rem;">Community meetups, support groups, and advocacy gatherings</p>
      
      <div id="events-simple-container" style="min-height: 150px;">
        <p>Loading upcoming events...</p>
      </div>
      
      <a href="/events/" class="homepage-box-link">
        View Full Community Events Calendar ?
      </a>
    </div>
    
    <!-- Campaigns Column -->
    <div class="homepage-campaigns-box">
      <h2>
        <span aria-hidden="true">?</span> Active Campaigns
      </h2>
      <p style="opacity: 0.9; margin-bottom: 1.5rem;">Join us in advocating for disability rights and policy change</p>
      
      <div id="campaigns-simple-container" style="min-height: 150px;">
        <p>Loading advocacy campaigns...</p>
      </div>
      
      <a href="/campaigns/" class="homepage-box-link">
        View All Advocacy Campaigns ?
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
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">??</div>
      <h3>Evidence Locker</h3>
      <p>
        <strong>COLLECTIVE POWER:</strong> Photo your documents, AI extracts text, community validates - crowdsourced justice that gets stronger with every upload
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">??</div>
      <h3>Community & Campaigns</h3>
      <p>
        <strong>NETWORK STRENGTH:</strong> Together we organize, advocate, and win - more voices mean more power for real systemic change
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">??</div>
      <h3>Legal & Knowledge Sharing</h3>
      <p>
        <strong>SHARED WISDOM:</strong> Shared legal strategies, winning patterns, resources - every case we track helps everyone else win
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">??</div>
      <h3>Appeal Command Center</h3>
      <p>
        <strong>STRATEGIC POWER:</strong> Deadline tracking, document management, tribunal prep - everything you need to fight back and win your appeal
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">??</div>
      <h3>Financial Safety Net</h3>
      <p>
        <strong>SURVIVAL TOOLS:</strong> Budget tracking, benefit calculators, emergency resources - manage finances when every dollar counts
      </p>
    </div>
    
    <div class="homepage-feature-box">
      <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">??</div>
      <h3>Wellness Hub</h3>
      <p>
        <strong>HOLISTIC CARE:</strong> Pain tracking, symptom journals, exercise routines, meditation - tools for managing your health day by day
      </p>
    </div>
    
  </div>
  
  <div style="text-align: center; margin-top: 2.5rem;">
    <a href="/features/" style="display: inline-block; padding: 14px 32px; background: #3d4eaa; color: white; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 1.05rem; transition: all 0.2s; box-shadow: 0 2px 8px rgba(61, 78, 170, 0.2);">
      See All 60+ Revolutionary Features ?
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
    
    <!-- Home Screen Tab 1 -->
    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/HomeScreenTab1.png' | relative_url }}" 
           alt="3mpwrApp home dashboard with personalized widgets, quick actions, and AI assistant for disability rights advocacy" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">Home Dashboard</h3>
        <p class="app-tour-card-description">Personalized widgets, quick actions, and AI assistant for your advocacy journey</p>
      </div>
    </div>
    
    <!-- AI Assistant -->    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/AIAssistantTab1-YouNext3Steps-RecommendedTools.png' | relative_url }}" 
           alt="AI Assistant showing personalized next steps and recommended tools for disability advocacy - 3mpwrApp home dashboard" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">AI Assistant</h3>
        <p class="app-tour-card-description">Personalized next steps and recommended tools for your advocacy needs</p>
      </div>
    </div>
    
    <!-- Evidence Command Center -->
    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/HomeEvidenceVault-EvidenceCommandCenter.png' | relative_url }}" 
           alt="Quick access to Evidence Command Center from home - encrypted document storage for workers compensation cases - 3mpwrApp" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">Evidence Command Center</h3>
        <p class="app-tour-card-description">Encrypted document storage and timeline builder for your legal case</p>
      </div>
    </div>
    
    <!-- Wellness Hub -->
    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/HomeWellnessCommand.png' | relative_url }}" 
           alt="Wellness Hub quick access with health tracking, mood logging, and energy management tools - 3mpwrApp" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">Wellness Hub</h3>
        <p class="app-tour-card-description">Health tracking, mood logging, and energy management tools</p>
      </div>
    </div>
    
    <!-- Getting Started Tutorial -->
    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/Step1-StartYourFirstCase.png' | relative_url }}" 
           alt="Start your first workers compensation case - guided onboarding tutorial - 3mpwrApp beta" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">Getting Started</h3>
        <p class="app-tour-card-description">Guided walkthrough to start your first workers compensation case</p>
      </div>
    </div>
    
    <!-- Community Hub -->
    <div class="app-tour-card">
      <img src="{{ '/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/Step3-FindYourPeople-CommunityHub.png' | relative_url }}" 
           alt="Find your support community - join 24 disability support groups - 3mpwrApp community" 
           loading="lazy">
      <div class="app-tour-card-content">
        <h3 class="app-tour-card-title">Community Hub</h3>
        <p class="app-tour-card-description">Find your support community and join 24 disability support groups</p>
      </div>
    </div>
    
  </div>
  
  <div class="app-tour-cta">
    <a href="/app-waitlist" class="app-tour-cta-button">
      ?? Get Early Access � Launching Q2 2026
    </a>
    <p class="app-tour-cta-text">
      <strong>Limited beta spots</strong> � Be among the first 1,000 users
    </p>
  </div>
</section>

<!-- Theme Song Winner Announcement -->
<section class="theme-song-winner">
  <div class="trophy">??</div>
  <h2>
    <span aria-hidden="true">??</span> Official 3mpwr Theme Song
  </h2>
  <p class="winner-text">
    Community Vote Winner: Option 1
  </p>
  <a href="https://suno.com/s/enuXDfFsc65WWAMr" target="_blank" rel="noopener noreferrer" class="btn-listen">
    <span aria-hidden="true">??</span> Listen to Our Anthem
  </a>
  <p class="tagline">
    This isn't just a song � it's our anthem. <span aria-hidden="true">??</span>
  </p>
</section>

<!-- CTA Section -->
<section class="homepage-cta">
  <h2>
    Ready to Join Our Community?
  </h2>
  <p>
    Be part of building something meaningful. Your voice matters, your experience counts, and you belong here.
  </p>
  <a href="/app-waitlist" class="homepage-btn-primary" style="display: inline-block; padding: 18px 40px; font-size: 1.2rem;">
    Join the Beta Waitlist ?
  </a>
  <p style="margin-top: 1.5rem; opacity: 0.9; font-size: 0.95rem;">
    No credit card required � 100% free forever � Cancel anytime (but there's nothing to cancel!)
  </p>
</section>

<!-- Newsletter Signup -->
<section class="newsletter" style="margin-bottom: 4rem;">
  {%- include newsletter-signup.html -%}
</section>

<!-- Learn More Section -->
<section style="margin-bottom: 4rem; padding: 2.5rem; background: linear-gradient(135deg, rgba(61, 78, 170, 0.08) 0%, rgba(61, 78, 170, 0.03) 100%); border-radius: 12px; border: 2px solid rgba(61, 78, 170, 0.15);">
  <h2 style="text-align: center; font-size: 1.9rem; margin-bottom: 2rem; color: var(--text-color);">
    <span aria-hidden="true">??</span> Learn More About 3mpwrApp
  </h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 1100px; margin: 0 auto;">
    
    <div style="padding: 1.5rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #3d4eaa;">
      <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: #3d4eaa;">
        <span aria-hidden="true">??</span> Documentation
      </h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="margin: 0.5rem 0;"><a href="/user-guide/" style="color: #003d7a; text-decoration: none; font-weight: 500;">User Guide</a></li>
        <li style="margin: 0.5rem 0;"><a href="/faq/" style="color: #003d7a; text-decoration: none; font-weight: 500;">FAQ</a></li>
        <li style="margin: 0.5rem 0;"><a href="/app-tour/" style="color: #003d7a; text-decoration: none; font-weight: 500;">App Tour</a></li>
        <li style="margin: 0.5rem 0;"><a href="/whats-new/" style="color: #003d7a; text-decoration: none; font-weight: 500;">What's New</a></li>
      </ul>
    </div>
    
    <div style="padding: 1.5rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #10b981;">
      <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: #10b981;">
        <span aria-hidden="true">???</span> Privacy & Security
      </h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="margin: 0.5rem 0;"><a href="/privacy/" style="color: #003d7a; text-decoration: none; font-weight: 500;">Privacy Policy</a></li>
        <li style="margin: 0.5rem 0;"><a href="/security/" style="color: #003d7a; text-decoration: none; font-weight: 500;">Security</a></li>
        <li style="margin: 0.5rem 0;"><a href="/accessibility" style="color: #003d7a; text-decoration: none; font-weight: 500;">Accessibility</a></li>
        <li style="margin: 0.5rem 0;"><a href="/delete-account.html" style="color: #003d7a; text-decoration: none; font-weight: 500;">Delete Account</a></li>
      </ul>
    </div>
    
    <div style="padding: 1.5rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #f59e0b;">
      <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: #f59e0b;">
        <span aria-hidden="true">??</span> Community & Support
      </h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="margin: 0.5rem 0;"><a href="/community/" style="color: #003d7a; text-decoration: none; font-weight: 500;">Community Hub</a></li>
        <li style="margin: 0.5rem 0;"><a href="/community/guidelines/" style="color: #003d7a; text-decoration: none; font-weight: 500;">Community Guidelines</a></li>
        <li style="margin: 0.5rem 0;"><a href="/contact/" style="color: #003d7a; text-decoration: none; font-weight: 500;">Contact Us</a></li>
        <li style="margin: 0.5rem 0;"><a href="/crisis-resources/" style="color: #003d7a; text-decoration: none; font-weight: 500;">Crisis Resources</a></li>
      </ul>
    </div>
    
    <div style="padding: 1.5rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #dc2626;">
      <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: #dc2626;">
        <span aria-hidden="true">??</span> Research & Data
      </h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="margin: 0.5rem 0;"><a href="/research.html" style="color: #003d7a; text-decoration: none; font-weight: 500;">Research Tools</a></li>
        <li style="margin: 0.5rem 0;"><a href="/research-data-sources/" style="color: #003d7a; text-decoration: none; font-weight: 500;">Data Sources</a></li>
        <li style="margin: 0.5rem 0;"><a href="/tribunal-visualizations/" style="color: #003d7a; text-decoration: none; font-weight: 500;">Visualizations</a></li>
        <li style="margin: 0.5rem 0;"><a href="/how-to-use-this-data/" style="color: #003d7a; text-decoration: none; font-weight: 500;">How to Use Data</a></li>
      </ul>
    </div>
    
  </div>
</section>

<!-- Social Media Links -->
<section style="text-align: center; margin-bottom: 4rem; padding: 2rem; background: rgba(61, 78, 170, 0.05); border-radius: 12px;">
  <h2 style="font-size: 1.75rem; margin-bottom: 1.5rem; color: var(--text-color);">Stay Connected</h2>
  <p style="margin-bottom: 1.5rem; opacity: 0.9;">Follow us on social media for daily updates, community stories, and transparency reports</p>
  <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1rem;">
    <a href="https://discord.gg/P2qQyjxV" target="_blank" rel="noopener" style="padding: 0.75rem 1.5rem; background: #5865F2; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">?? Discord</a>
    <a href="https://x.com/3mpwrApp0816" target="_blank" rel="noopener" style="padding: 0.75rem 1.5rem; background: #000000; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">?? X/Twitter</a>
    <a href="https://www.facebook.com/3mpowrapp/" target="_blank" rel="noopener" style="padding: 0.75rem 1.5rem; background: #1877F2; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">?? Facebook</a>
    <a href="https://mastodon.social/@3mpwrapp" target="_blank" rel="noopener" style="padding: 0.75rem 1.5rem; background: #6364FF; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">?? Mastodon</a>
    <a href="https://bsky.app/profile/3mpwrapp.bsky.social" target="_blank" rel="noopener" style="padding: 0.75rem 1.5rem; background: #1285FE; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">?? Bluesky</a>
  </div>
  <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">Email: <a href="mailto:empowrapp08162025@gmail.com" style="color: #003d7a;">empowrapp08162025@gmail.com</a></p>
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
// Simple event loading - shows events in next 7 days
async function loadSimpleEvents() {
  try {
    const response = await fetch('https://3mpwrapp.ca/api/events.json?ts=' + Date.now(), { cache: 'no-store' });
    const events = await response.json();
    
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    // Get events in next 7 days, filter for community events only
    const upcomingEvents = events
      .filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= now && eventDate <= sevenDaysFromNow;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    
    const container = document.getElementById('events-simple-container');
    if (upcomingEvents.length === 0) {
      container.innerHTML = '<p style="opacity: 0.9;">No events this week. Check the <a href="/events/">full calendar</a>!</p>';
      return;
    }
    
    container.innerHTML = upcomingEvents.map(e => {
      const date = new Date(e.date);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `
        <div class="homepage-event-item">
          <div class="event-title">${e.title}</div>
          <div class="event-meta">?? ${dateStr} at ${timeStr}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Events load error:', err);
    document.getElementById('events-simple-container').innerHTML = '<p style="opacity: 0.8;">Unable to load events</p>';
  }
}

// Simple campaigns loading
async function loadSimpleCampaigns() {
  try {
    const response = await fetch('https://3mpwrapp.ca/api/campaigns.json?ts=' + Date.now(), { cache: 'no-store' });
    const campaigns = await response.json();
    
    // Get active campaigns (not completed)
    const activeCampaigns = campaigns.filter(c => c.status === 'active').slice(0, 3);
    
    const container = document.getElementById('campaigns-simple-container');
    if (activeCampaigns.length === 0) {
      container.innerHTML = '<p style="opacity: 0.9;">No active campaigns. Check the <a href="/campaigns/">campaigns page</a>!</p>';
      return;
    }
    
    container.innerHTML = activeCampaigns.map(c => `
      <div class="homepage-campaign-item">
        <div class="campaign-title">${c.title}</div>
        <div class="campaign-summary">${(c.description || '').substring(0, 100)}...</div>
        ${c.actionUrl ? `<a href="${c.actionUrl}" target="_blank" rel="noopener" style="font-size: 0.9rem; color: #5a189a;">Take Action ?</a>` : ''}
      </div>
    `).join('');
  } catch (err) {
    console.error('Campaigns load error:', err);
    document.getElementById('campaigns-simple-container').innerHTML = '<p style="opacity: 0.8;">Unable to load campaigns</p>';
  }
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
