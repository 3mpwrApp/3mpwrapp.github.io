---
layout: default
title: Inside 3mpwrApp - Visual Tour
description: Take a visual tour inside 3mpwrApp. See how our platform empowers the disability community, injured workers, their families, supporters, and allies with AI advocacy tools, wellness tracking, evidence management, research resources, and community support.
permalink: /app-tour/
---

<link rel="stylesheet" href="{{ '/assets/css/page-enhancements.css' | relative_url }}">

<style>
.gallery-hero {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%) !important;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.gallery-hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1b5e20 !important;
}

.gallery-hero p {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
  color: #1a1a1a !important;
}

.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 0.5rem;
}

.category-nav a {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: #ffffff !important;
  text-decoration: none;
  border-radius: 2rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.category-nav a:hover,
.category-nav a:focus {
  background: #1b5e20;
  transform: translateY(-2px);
}

.category-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: #fafafa !important;
  border-radius: 1rem;
  border-left: 4px solid #4caf50;
}

.category-section h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  color: #1b5e20 !important;
}

.category-section .category-desc {
  color: #1a1a1a !important;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.preview-card {
  background: #ffffff !important;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.preview-card img {
  width: 100%;
  height: auto;
  display: block;
  cursor: zoom-in;
}

.preview-card .caption {
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #1a1a1a !important;
  background: #e8e8e8 !important;
  text-align: center;
  background: #f5f5f5;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin: 1.5rem 0;
  padding: 1rem;
  background: #4caf50;
  border-radius: 0.5rem;
  color: #ffffff;
}

.stat-item {
  text-align: center;
  color: #ffffff;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-size: 0.85rem;
  color: #ffffff;
}

/* Lightbox styles */
.lightbox {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.95);
  z-index: 99999;
  cursor: zoom-out;
  padding: 2rem;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
}

.lightbox.active {
  display: flex !important;
}

.lightbox img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 0.5rem;
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .gallery-hero h1 {
    font-size: 1.75rem;
  }
  
  .preview-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-bar {
    gap: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .gallery-hero {
    background: linear-gradient(135deg, #1a3d1a 0%, #2d2d2d 100%) !important;
  }
  
  .gallery-hero h1 {
    color: #81c784 !important;
  }
  
  .gallery-hero p {
    color: #e0e0e0 !important;
  }
  
  .category-nav {
    background: #2d2d2d !important;
  }
  
  .category-section {
    background: #2d2d2d !important;
    border-left-color: #81c784;
  }
  
  .category-section h2 {
    color: #81c784 !important;
  }
  
  .category-section .category-desc {
    color: #e0e0e0 !important;
  }
  
  .preview-card {
    background: #3d3d3d !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  
  .preview-card .caption {
    background: #4d4d4d !important;
    color: #ffffff !important;
  }
  
  .lightbox-close {
    background: #333333;
    color: #ffffff;
  }
}

/* Also support data attribute dark mode */
[data-theme="dark"] .gallery-hero,
.dark-mode .gallery-hero {
  background: linear-gradient(135deg, #1a3d1a 0%, #2d2d2d 100%) !important;
}

[data-theme="dark"] .gallery-hero h1,
.dark-mode .gallery-hero h1 {
  color: #81c784 !important;
}

[data-theme="dark"] .gallery-hero p,
.dark-mode .gallery-hero p {
  color: #e0e0e0 !important;
}

[data-theme="dark"] .category-nav,
.dark-mode .category-nav {
  background: #2d2d2d !important;
}

[data-theme="dark"] .category-section,
.dark-mode .category-section {
  background: #2d2d2d !important;
}

[data-theme="dark"] .category-section h2,
.dark-mode .category-section h2 {
  color: #81c784 !important;
}

[data-theme="dark"] .category-section .category-desc,
.dark-mode .category-section .category-desc {
  color: #e0e0e0 !important;
}

[data-theme="dark"] .preview-card,
.dark-mode .preview-card {
  background: #3d3d3d !important;
}

[data-theme="dark"] .preview-card .caption,
.dark-mode .preview-card .caption {
  background: #4d4d4d !important;
  color: #ffffff !important;
}
</style>

<div class="gallery-hero">
  <h1>🎯 Inside 3mpwrApp</h1>
  <p>Take a visual tour of the platform built to empower the disability community, injured workers, their families, supporters, and allies. See our AI-powered advocacy tools, wellness features, and community support in action.</p>
</div>

<div class="stats-bar">
  <div class="stat-item">
    <div class="stat-number">172</div>
    <div class="stat-label">Visuals</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">11</div>
    <div class="stat-label">Categories</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">150+</div>
    <div class="stat-label">Features</div>
  </div>
</div>

<nav class="category-nav" aria-label="Feature categories">
  <a href="#home">🏠 Home</a>
  <a href="#advocacy">⚖️ Advocacy</a>
  <a href="#wellness">💚 Wellness</a>
  <a href="#resources">📚 Resources</a>
  <a href="#research">🔬 Research</a>
  <a href="#campaigns">📢 Campaigns</a>
  <a href="#events">📅 Events</a>
  <a href="#community">👥 Community</a>
  <a href="#profile">👤 Profile</a>
  <a href="#settings">⚙️ Settings</a>
  <a href="#onboarding">🚪 Onboarding</a>
</nav>

---

<section id="home" class="category-section">
  <h2>🏠 Home Dashboard</h2>
  <p class="category-desc">Your personalized command center with AI assistant, quick actions, and real-time updates.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Learn about AI Assistant features">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/AIAssistantTab1-YouNext3Steps-RecommendedTools.png" alt="AI Assistant showing personalized next steps and recommended tools for disability advocacy - 3mpwrApp home dashboard" loading="lazy">
      </a>
      <div class="caption">AI Assistant - Next Steps | <a href="/beta-guide/#priority-february-2026-personalization">Beta</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Learn about AI resources">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/AIAssistantTab2-HelpfulRessources-NeedMoreHelp.png" alt="AI Assistant providing helpful resources and additional support options - 3mpwrApp AI advocacy tools" loading="lazy">
      </a>
      <div class="caption">AI Assistant - Resources | <a href="/beta-guide/#priority-february-2026-personalization">Beta</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Personalize your dashboard">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/HomeScreenTab1.png" alt="3mpwrApp home dashboard with personalized widgets, quick actions, and AI assistant for disability rights advocacy" loading="lazy">
      </a>
      <div class="caption">Home Dashboard | <a href="/beta-guide/#priority-february-2026-personalization">Beta</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Home features overview">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/HomeScreenTab2.png" alt="3mpwrApp home screen showing wellness tracking, evidence management, and community support features" loading="lazy">
      </a>
      <div class="caption">Home Features | <a href="/user-guide/#personalization-setup">Guide</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#complexity-mode?utm_source=app_tour&utm_campaign=visual_refresh" title="Simple Mode for accessibility">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/HomeCommunityHubSimpleMode.png" alt="Community Hub in simple complexity mode - accessible interface for disability community connection - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Community Hub - Simple Mode | <a href="/user-guide/#complexity-mode">Learn More</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#evidence-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Secure evidence storage">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/HomeEvidenceVault-EvidenceCommandCenter.png" alt="Quick access to Evidence Command Center from home - encrypted document storage for workers compensation cases - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Evidence Vault | <a href="/user-guide/#evidence-command-center">Documentation</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#wellness-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="41 wellness tools">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/HomeWellnessCommand.png" alt="Wellness Hub quick access with health tracking, mood logging, and energy management tools - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Wellness Command | <a href="/user-guide/#wellness-hub">Explore</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#quick-start?utm_source=app_tour&utm_campaign=visual_refresh" title="Getting started tutorial">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/Step1-StartYourFirstCase.png" alt="Start your first workers compensation case - guided onboarding tutorial - 3mpwrApp beta" loading="lazy">
      </a>
      <div class="caption">Tutorial Step 1 | <a href="/beta-guide/#how-to-join-beta-testing">Join Beta</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#evidence-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Upload secure documents">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/Step2-UploadDocumentsIntoEvidenceCommandCenter.png" alt="Upload and encrypt documents into Evidence Command Center - secure storage tutorial - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Tutorial Step 2 | <a href="/user-guide/#encryption">Security</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Join support groups">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/Step3-FindYourPeople-CommunityHub.png" alt="Find your support community - join 24 disability support groups - 3mpwrApp community" loading="lazy">
      </a>
      <div class="caption">Tutorial Step 3 | <a href="/user-guide/#support-groups">Community</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Customize themes">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/bg_emberforge.png" alt="Ember Forge theme background - customizable accessibility theme - 3mpwrApp personalization" loading="lazy">
      </a>
      <div class="caption">Theme: Ember Forge | <a href="/user-guide/#accessibility-settings">Themes</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Visual accessibility">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/bg_LanternAscension.jpeg" alt="Lantern Ascension theme background - visual accessibility options - 3mpwrApp settings" loading="lazy">
      </a>
      <div class="caption">Theme: Lantern Ascension | <a href="/user-guide/#accessibility-settings">Settings</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Neurodivergent-friendly design">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/bg_VerdantSanctuary.png" alt="Verdant Sanctuary theme background - calming visual design for neurodivergent users - 3mpwrApp accessibility" loading="lazy">
      </a>
      <div class="caption">Theme: Verdant Sanctuary | <a href="/user-guide/#accessibility-settings">Accessibility</a></div>
    </div>
  </div>
</section>

---

<section id="advocacy" class="category-section">
  <h2>⚖️ Advocacy Hub</h2>
  <p class="category-desc">AI-powered tools for building your case, managing evidence, finding legal help, and generating professional letters.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <a href="/user-guide/#legal-action-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Access Advocacy Hub">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/AdvocacyHub1-WhatDoYouNeedHelpWithToday.png" alt="Advocacy Hub main dashboard asking 'What do you need help with today?' - personalized legal support for injured workers - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Advocacy Hub Dashboard | <a href="/beta-guide/#january-2026-powertools">Beta</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#appeal-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Track appeal deadlines">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/AdvocacyHub2-Jusrisdiction-AppealDeadlineCalculator.png" alt="Jurisdiction selection and appeal deadline calculator - track critical legal deadlines for workers compensation - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Jurisdiction & Deadlines | <a href="/user-guide/#appeal-command-center">Appeals</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="AI form assistance">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/AdvocacyHub3-FormHelper-SearchTools.png" alt="Form helper and search tools for navigating complex legal documents - disability rights advocacy - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Form Helper & Search | <a href="/user-guide/#ai-advocacy-suite">AI Tools</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#legal-action-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Quick access tools">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/AdvocacyHub4-MainHubs-QuickTools.png" alt="Main advocacy hubs with quick tools for evidence, appeals, and legal action - workers comp case management - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Main Hubs & Quick Access | <a href="/user-guide/#master-tracker-hub">Tracking</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="6 AI-powered tools">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/AIAdvocacySuite.png" alt="Complete AI Advocacy Suite with 6 AI-powered tools - document translator, form helper, letter generator - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">AI Advocacy Suite | <a href="/user-guide/#ai-advocacy-suite">Explore</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Build your network">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/AllyANDSupportNetwork.png" alt="Connect with allies and build your support network for disability advocacy - community organizing - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Ally & Support Network | <a href="/user-guide/#community-hub">Community</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#campaigns?utm_source=app_tour&utm_campaign=visual_refresh" title="Organize collective action">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/CollectiveLegalActionHub.png" alt="Collective Legal Action Hub for organizing group advocacy and class action support - workers rights - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Collective Legal Action | <a href="/user-guide/#campaigns">Campaigns</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#evidence-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Encrypted evidence storage">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/EvidenceCommandCenter.png" alt="Evidence Command Center - encrypted document storage, timeline builder, voice memos for legal cases - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Evidence Command Center | <a href="/user-guide/#evidence-command-center">Documentation</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#legal-action-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="5 legal action tabs">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/LegalActionHub.png" alt="Legal Action Hub with 5 tabs - evidence, appeals, lawyers, case tracking, self-advocacy coach - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Legal Action Hub | <a href="/user-guide/#legal-action-hub">Guide</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Self-advocacy guidance">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/SelfAdvocacyCoach.png" alt="Self-Advocacy Coach providing guidance and templates for representing yourself - disability rights - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Self-Advocacy Coach | <a href="/beta-guide/#what-to-test">Beta</a></div>
    </div>
  </div>
</section>

---

<section id="wellness" class="category-section">
  <h2>💚 Wellness Center</h2>
  <p class="category-desc">Comprehensive health tracking, mental wellness support, movement guidance, and crisis resources - 41 tools across 6 categories.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <a href="/user-guide/#wellness-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="41 wellness tools">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/Wellness1-Tab.png" alt="Wellness Hub main interface with 41 tools across 6 categories - chronic pain management, fatigue tracking, mental health support - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Wellness Hub - 41 Tools | <a href="/user-guide/#wellness-hub">Explore</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#wellness-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="12 crisis tools">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/Wellness2-12MentalHealthCrisisTools.png" alt="12 mental health crisis intervention tools - DBT distraction games, breathing exercises, emergency contacts - 3mpwrApp wellness" loading="lazy">
      </a>
      <div class="caption">Mental Health Crisis Tools | <a href="/user-guide/#wellness-hub">Crisis Support</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#mood-tracker-20?utm_source=app_tour&utm_campaign=visual_refresh" title="Energy & Mood tracking">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/Wellness3-EnergyMoodDashboard.png" alt="Energy and mood dashboard with AI-enhanced tracking and pattern recognition - spoon theory digital management - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Energy & Mood Dashboard | <a href="/user-guide/#energy-coins">Spoon Theory</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#wellness-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Triple-tap emergency">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/Wellness4-EmotionalFirstAid1-CrisisIntervention-TripleTapEmergencyCrisisContact.png" alt="Emotional First Aid crisis intervention with triple-tap emergency contact activation - mental health support - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Emotional First Aid - Crisis | <a href="/beta-guide/#priority-february-2026-personalization">Beta</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#wellness-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="DBT tools">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/Wellness5-EmotionalFirstAid2-DBTDistractionGames.png" alt="Emotional First Aid DBT distraction games for managing anxiety and panic - dialectical behavior therapy tools - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Emotional First Aid - DBT | <a href="/user-guide/#wellness-hub">Mental Health</a></div>
    </div>
  </div>
</section>

---

<section id="resources" class="category-section">
  <h2>📚 Resources Center</h2>
  <p class="category-desc">Master tracker, appeal center, evidence management, letter templates, and comprehensive guides - 38 powerful tools for your case.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <a href="/user-guide/#master-tracker-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="PowerTools hub">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/ResourcesTab1-PowerTools.png" alt="Resources tab showing PowerTools hub with advocacy, wellness, and legal action tools - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">PowerTools Overview | <a href="/user-guide/#master-tracker-hub">Hub</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#appeal-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Appeals tools">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/ResourcesTab2-FeaturedTools-AppealsAdvocacy.png" alt="Featured tools for appeals and advocacy - workers compensation claim assistance - 3mpwrApp resources" loading="lazy">
      </a>
      <div class="caption">Appeals & Advocacy | <a href="/user-guide/#appeal-command-center">Appeals</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#document-management?utm_source=app_tour&utm_campaign=visual_refresh" title="Forms hub">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/ResourcesTab3-DocumentsANDForms-HealthANDWorkPlanning.png" alt="Documents, forms, health tracking, and return-to-work planning resources - disability case management - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Documents & Forms | <a href="/user-guide/#document-management">Forms</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="AI tools">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/ResourcesTab4-SupportANDLearning-AIPoweredTools.png" alt="Support, learning resources, and AI-powered advocacy tools - disability rights education - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Support & AI Tools | <a href="/user-guide/#ai-advocacy-suite">AI</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#appeal-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Appeal status">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/AppealCommandCenter1-AppealStatus-CriticalToolsActNow-HighPriority.png" alt="Appeal Command Center showing appeal status, critical deadline tools, and high-priority action items - 3mpwrApp appeals" loading="lazy">
      </a>
      <div class="caption">Appeal Status | <a href="/user-guide/#appeal-command-center">Track</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#appeal-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Appeal resources">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/AppealCommandCenter2-AdditionalResources-AppealSuccessTips.png" alt="Appeal Command Center with additional resources, success tips, and strategy guidance - workers comp appeals - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Appeal Resources | <a href="/beta-guide/#what-to-test">Beta</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Rights checker">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/AutomatedRightsChecker-CheckRights1.png" alt="Automated Rights Checker analyzing your situation and checking applicable disability rights - 3mpwrApp legal tools" loading="lazy">
      </a>
      <div class="caption">Automated Rights Checker | <a href="/user-guide/#ai-advocacy-suite">Check</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Rights results">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/AutomatedRightsChecker-CheckRights2.png" alt="Rights Checker results showing relevant laws, rights, and next steps for advocacy - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Rights Results | <a href="/user-guide/#ai-advocacy-suite">Results</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Rights library">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/AutomatedRightsChecker-RightsLibrary1.png" alt="Rights Library with searchable database of disability rights, workers compensation laws, and legal protections - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Rights Library | <a href="/user-guide/#ai-advocacy-suite">Browse</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Rights categories">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/AutomatedRightsChecker-RightsLibrary2.png" alt="Rights Library organized by category - employment, healthcare, housing, benefits - 3mpwrApp legal resources" loading="lazy">
      </a>
      <div class="caption">Rights Categories | <a href="/user-guide/#ai-advocacy-suite">Explore</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Rights details">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/AutomatedRightsChecker-RightsLibrary3.png" alt="Rights Library detailed view with plain-language explanations and action steps - 3mpwrApp accessibility" loading="lazy">
      </a>
      <div class="caption">Rights Details | <a href="/user-guide/#ai-advocacy-suite">Learn</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#master-tracker-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Personal history">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/AutomatedRightsChecker-UserPersonalHistory.png" alt="Rights Checker tracking your personal history and applicable rights over time - 3mpwrApp case tracking" loading="lazy">
      </a>
      <div class="caption">Personal Rights History | <a href="/user-guide/#master-tracker-hub">Track</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#evidence-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Timeline builder">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/CaseTimelineBuilder.png" alt="Interactive case timeline builder for documenting injury progression and legal milestones - 3mpwrApp evidence" loading="lazy">
      </a>
      <div class="caption">Case Timeline Builder | <a href="/user-guide/#evidence-command-center">Timeline</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#master-tracker-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Case tracker hub">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/CaseTrackerPro-MasterHub.png" alt="Case Tracker Pro master hub managing multiple claims, deadlines, and case stages - 3mpwrApp case management" loading="lazy">
      </a>
      <div class="caption">Case Tracker Pro Hub | <a href="/user-guide/#master-tracker-hub">Manage</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#master-tracker-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Claims view">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/CaseTrackerPro-Claims.png" alt="Case Tracker Pro claims management interface tracking status and next actions - workers compensation - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Claims Management | <a href="/user-guide/#master-tracker-hub">Claims</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#appeal-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Deadline tracking">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/CaseTrackerPro-Deadlines.png" alt="Case Tracker Pro deadline management with alerts and countdown timers - critical legal dates - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Deadline Tracking | <a href="/user-guide/#appeal-command-center">Deadlines</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#appeal-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Denial management">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/CaseTrackerPro-Denial.png" alt="Case Tracker Pro managing claim denials with appeal pathways and resources - workers comp denials - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Denial Management | <a href="/user-guide/#appeal-command-center">Appeals</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#master-tracker-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="RTW planning">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/CaseTrackerPro-RTW.png" alt="Case Tracker Pro return-to-work planning with accommodation tracking and transition support - 3mpwrApp RTW" loading="lazy">
      </a>
      <div class="caption">Return-to-Work | <a href="/user-guide/#master-tracker-hub">RTW</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Claims navigator">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/ClaimsNavigator.png" alt="Claims Navigator guiding users through workers compensation claim filing process - step-by-step legal help - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Claims Navigator | <a href="/user-guide/#ai-advocacy-suite">Guide</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Denial decoder">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/DenialDecoder.png" alt="Denial Decoder translating complex denial letters into plain language with appeal strategies - 3mpwrApp AI tools" loading="lazy">
      </a>
      <div class="caption">Denial Decoder | <a href="/user-guide/#ai-advocacy-suite">Decode</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#letter-wizard?utm_source=app_tour&utm_campaign=visual_refresh" title="Document factory">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/DocumentFactory1.png" alt="Document Factory generating professional legal letters and forms with AI assistance - 3mpwrApp document automation" loading="lazy">
      </a>
      <div class="caption">Document Factory | <a href="/user-guide/#letter-wizard">Generate</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#letter-wizard?utm_source=app_tour&utm_campaign=visual_refresh" title="Templates">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/DocumentFactory2.png" alt="Document Factory template library for appeals, accommodations, and legal correspondence - 3mpwrApp resources" loading="lazy">
      </a>
      <div class="caption">Document Templates | <a href="/user-guide/#letter-wizard">Templates</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#evidence-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Evidence locker">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/EvidenceCommandCenter1-Locker.png" alt="Evidence Command Center encrypted locker for storing medical records, photos, and legal documents - 3mpwrApp security" loading="lazy">
      </a>
      <div class="caption">Evidence Locker | <a href="/user-guide/#encryption">Secure</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#evidence-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Timeline view">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/EvidenceCommandCenter2-Timeline.png" alt="Evidence Command Center timeline view organizing documents chronologically for case building - 3mpwrApp evidence" loading="lazy">
      </a>
      <div class="caption">Evidence Timeline | <a href="/user-guide/#evidence-command-center">Organize</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#evidence-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Voice memos">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/EvidenceCommandCenter3-Voice.png" alt="Evidence Command Center voice memo feature for documenting symptoms and incidents - 3mpwrApp accessibility" loading="lazy">
      </a>
      <div class="caption">Voice Memos | <a href="/user-guide/#evidence-command-center">Record</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#evidence-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Checklist">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/EvidenceCommandCenter4-Checklist.png" alt="Evidence Command Center checklist ensuring all required documentation for appeals - 3mpwrApp case prep" loading="lazy">
      </a>
      <div class="caption">Evidence Checklist | <a href="/user-guide/#evidence-command-center">Verify</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Policy simulator">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/InteractivePolicySimulator1-WhatsYourSituation.png" alt="Interactive Policy Simulator asking 'What's your situation?' to provide relevant legal guidance - 3mpwrApp AI" loading="lazy">
      </a>
      <div class="caption">Policy Simulator | <a href="/user-guide/#ai-advocacy-suite">Simulate</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="File claim">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/InteractivePolicySimulator2-FileWorkersCompClaim.png" alt="Interactive Policy Simulator: File a workers compensation claim walkthrough - step-by-step tutorial - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">File Claim Tutorial | <a href="/user-guide/#ai-advocacy-suite">File</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#appeal-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Appeal denial">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/InteractivePolicySimulator3-AppealDeniedClaim.png" alt="Interactive Policy Simulator: Appeal a denied workers comp claim with AI-generated strategy - 3mpwrApp appeals" loading="lazy">
      </a>
      <div class="caption">Appeal Denial Tutorial | <a href="/user-guide/#appeal-command-center">Appeal</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Accommodations">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/InteractivePolicySimulator4-RequestWorkplaceAccomodation.png" alt="Interactive Policy Simulator: Request workplace accommodations under ADA/human rights laws - 3mpwrApp disability" loading="lazy">
      </a>
      <div class="caption">Accommodations Tutorial | <a href="/user-guide/#ai-advocacy-suite">Request</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#master-tracker-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="RTW planning">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/InteractivePolicySimulator5-ReturnToWorkPlanning.png" alt="Interactive Policy Simulator: Return-to-work planning with gradual transition strategies - 3mpwrApp RTW" loading="lazy">
      </a>
      <div class="caption">RTW Planning Tutorial | <a href="/user-guide/#master-tracker-hub">Plan</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#campaigns?utm_source=app_tour&utm_campaign=visual_refresh" title="Human rights">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/InteractivePolicySimulator7-FileHumanRightsComplaint.png" alt="Interactive Policy Simulator: File human rights complaint for discrimination - disability rights - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Human Rights Tutorial | <a href="/user-guide/#campaigns">Rights</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Must-know rights">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/KnowledgeBase1-MustKnowRights.png" alt="Knowledge Base highlighting must-know disability rights and workers compensation protections - 3mpwrApp education" loading="lazy">
      </a>
      <div class="caption">Must-Know Rights | <a href="/user-guide/#ai-advocacy-suite">Know</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Browse categories">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/KnowledgeBase2-BrowseByCategory.png" alt="Knowledge Base browse by category - benefits, employment, healthcare, housing, legal rights - 3mpwrApp resources" loading="lazy">
      </a>
      <div class="caption">Knowledge Base | <a href="/beta-guide/#what-to-test">Browse</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#appeal-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Appeal guide">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/PrepareToAppealGuide1.png" alt="Prepare to Appeal comprehensive guide covering evidence gathering and deadline preparation - 3mpwrApp appeals" loading="lazy">
      </a>
      <div class="caption">Prepare To Appeal - Part 1 | <a href="/user-guide/#appeal-command-center">Prepare</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#letter-wizard?utm_source=app_tour&utm_campaign=visual_refresh" title="Appeal letters">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/PrepareToAppealGuide2.png" alt="Prepare to Appeal guide part 2 with appeal letter templates and submission process - 3mpwrApp legal help" loading="lazy">
      </a>
      <div class="caption">Prepare To Appeal - Part 2 | <a href="/user-guide/#letter-wizard">Submit</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Plain language">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/RightsExplained-PlainLanguage.png" alt="Rights Explained in plain language - legal jargon translated for accessibility - 3mpwrApp education" loading="lazy">
      </a>
      <div class="caption">Rights in Plain Language | <a href="/user-guide/#ai-advocacy-suite">Translate</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#letter-wizard?utm_source=app_tour&utm_campaign=visual_refresh" title="Success templates">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/SuccessTemplates.png" alt="Success Templates library with proven appeal letters, accommodation requests, and legal documents - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Success Templates | <a href="/user-guide/#letter-wizard">Use</a></div>
    </div>
  </div>
</section>

---

<section id="research" class="category-section">
  <h2>🔬 Research Library</h2>
  <p class="category-desc">Access medical research, legal precedents, UNCRPD guides, and evidence-based information for disability rights advocacy.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Research library">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/research/researchtab3mpwrapp.png" alt="Research tab providing access to disability rights research, legal databases, and advocacy resources - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Research Library | <a href="/beta-guide/#original-priority-features">Beta</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="External resources">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/research/researchtabexternalresources3mpwrapp.png" alt="Research tab external resources linking to disability rights organizations and legal aid - 3mpwrApp research" loading="lazy">
      </a>
      <div class="caption">External Resources | <a href="/user-guide/#community-hub">Resources</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Research index">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/research/researchtabmasterresearchindex3mpwrapp.png" alt="Research tab master index organizing legal research by topic and jurisdiction - 3mpwrApp knowledge base" loading="lazy">
      </a>
      <div class="caption">Master Research Index | <a href="/user-guide/#community-hub">Index</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Research documents">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/research/researchtabresearchlibrary3mpwrapp.png" alt="Research library with curated articles, case law, and disability advocacy studies - 3mpwrApp education" loading="lazy">
      </a>
      <div class="caption">Research Documents | <a href="/user-guide/#community-hub">Library</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="UNCRPD framework">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/research/researchtabuncrpdframeworknapplicationguide3mpwrapp.png" alt="UN Convention on the Rights of Persons with Disabilities (UNCRPD) framework and application guide - 3mpwrApp international rights" loading="lazy">
      </a>
      <div class="caption">UNCRPD Guide | <a href="/beta-guide/#original-priority-features">Rights</a></div>
    </div>
  </div>
</section>

---

<section id="campaigns" class="category-section">
  <h2>📢 Campaigns</h2>
  <p class="category-desc">Join or create advocacy campaigns for disability rights, workers compensation reform, and collective action.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <a href="/user-guide/#campaigns?utm_source=app_tour&utm_campaign=visual_refresh" title="Active campaigns">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/campaigns/campaignstab3mpwrapp.png" alt="Campaigns tab showing active disability rights campaigns and community organizing efforts - 3mpwrApp advocacy" loading="lazy">
      </a>
      <div class="caption">Active Campaigns | <a href="/user-guide/#campaigns">Organize</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#campaigns?utm_source=app_tour&utm_campaign=visual_refresh" title="Create campaign">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/campaigns/createcampaigncampaignstab3mpwrapp.png" alt="Create a new advocacy campaign for disability rights and workers compensation reform - 3mpwrApp community organizing" loading="lazy">
      </a>
      <div class="caption">Create Campaign | <a href="/user-guide/#community-hub">Start</a></div>
    </div>
  </div>
</section>

---

<section id="events" class="category-section">
  <h2>📅 Events Calendar</h2>
  <p class="category-desc">Stay connected with community events, support group meetings, advocacy actions, and important deadlines.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Events calendar">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventscalendar3mpwrapp1.png" alt="Events calendar month view for planning disability community events and support group meetings - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Calendar - Month View | <a href="/user-guide/#community-hub">Schedule</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Week view">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventscalendar3mpwrapp2.png" alt="Events calendar week view with color-coded categories and accessibility information - 3mpwrApp events" loading="lazy">
      </a>
      <div class="caption">Calendar - Week View | <a href="/user-guide/#community-hub">Events</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Upcoming events">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventstab13mpwrapp.png" alt="Events tab showing upcoming disability community events, support groups, and advocacy meetups - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Upcoming Events | <a href="/beta-guide/#original-priority-features">Join</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Event details">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventstab23mpwrapp.png" alt="Events tab with detailed event information, accessibility notes, and RSVP options - 3mpwrApp community" loading="lazy">
      </a>
      <div class="caption">Event Details | <a href="/user-guide/#community-hub">RSVP</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Filter events">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventstabfilterevents3mpwrapp.png" alt="Events filter options by type, location, accessibility, and advocacy focus - 3mpwrApp community tools" loading="lazy">
      </a>
      <div class="caption">Filter Events | <a href="/user-guide/#community-hub">Search</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Create event">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventstabscreateevent3mpwrapp.png" alt="Create a community event, support group meeting, or advocacy action - 3mpwrApp event management" loading="lazy">
      </a>
      <div class="caption">Create Event | <a href="/beta-guide/#original-priority-features">Organize</a></div>
    </div>
  </div>
</section>

---

<section id="community" class="category-section">
  <h2>👥 Community Hub</h2>
  <p class="category-desc">Connect with the disability community, injured workers, advocates, and allies - 24 support groups and counting.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Community Hub">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/community/communityhubtab3mpwrapp.png" alt="Community Hub main interface connecting disability community members, injured workers, and advocates - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Community Hub | <a href="/user-guide/#community-hub">Connect</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Discussions">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/community/communitytab13mpwrapp.png" alt="Community tab discussion forums for disability support, workers compensation advice, and peer connection - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Discussions | <a href="/user-guide/#support-groups">Forums</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#support-groups?utm_source=app_tour&utm_campaign=visual_refresh" title="24 support groups">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/community/communitytab23mpwrapp.png" alt="Community tab with 24 support groups filtered by disability type, location, and advocacy focus - 3mpwrApp community" loading="lazy">
      </a>
      <div class="caption">Support Groups - 24+ | <a href="/user-guide/#support-groups">Join</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Discord integration">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/community/communitytab3discord3mpwrapp.png" alt="Community Discord integration for real-time chat and peer support - 3mpwrApp social features" loading="lazy">
      </a>
      <div class="caption">Discord Integration | <a href="/user-guide/#community-hub">Chat</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#where-to-send-feedback?utm_source=app_tour&utm_campaign=visual_refresh" title="Beta testers">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/community/testerschatcommunitytab3mpwrapp.png" alt="Beta tester community chat for providing feedback and connecting with other testers - 3mpwrApp beta program" loading="lazy">
      </a>
      <div class="caption">Beta Testers Chat | <a href="/beta-guide/#where-to-send-feedback">Feedback</a></div>
    </div>
  </div>
</section>

---

<section id="profile" class="category-section">
  <h2>👤 User Profile</h2>
  <p class="category-desc">Personalize your experience with role selection, wellness preferences, advocacy needs, and accessibility accommodations.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Choose avatar">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/Profile-Avatar-1.png" alt="Profile avatar selection with diverse representation for disability community - 3mpwrApp personalization" loading="lazy">
      </a>
      <div class="caption">Avatar Selection | <a href="/user-guide/#personalization-setup">Customize</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Customize avatar">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/Profile-Avatar-2.png" alt="Profile avatar customization options for accessibility and self-expression - 3mpwrApp settings" loading="lazy">
      </a>
      <div class="caption">Avatar Customization | <a href="/user-guide/#personalization-setup">Options</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Avatar gallery">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/Profile-Avatar-3.png" alt="Profile avatar gallery with inclusive character designs for all users - 3mpwrApp diversity" loading="lazy">
      </a>
      <div class="caption">Avatar Gallery | <a href="/user-guide/#personalization-setup">Gallery</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Setup profile">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/SetupProfile-1-RoleANDWellnessToolsPreferences.png" alt="Setup profile step 1: Choose your role (person with disability, supporter, ally, family) and wellness tool preferences - 3mpwrApp personalization" loading="lazy">
      </a>
      <div class="caption">Setup - Role & Wellness | <a href="/beta-guide/#priority-february-2026-personalization">Beta</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Advocacy needs">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/SetupProfile-2-AdvocacyNeeds.png" alt="Setup profile step 2: Select advocacy needs (benefits appeals, legal help, housing, employment, healthcare) - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Setup - Advocacy Needs | <a href="/user-guide/#personalization-setup">Configure</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#complexity-mode?utm_source=app_tour&utm_campaign=visual_refresh" title="Accessibility setup">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/SetupProfile-3-AccessibilityAccomodationsANDEnergyPatterns.png" alt="Setup profile step 3: Configure accessibility accommodations and track energy patterns for spoon theory - 3mpwrApp accessibility" loading="lazy">
      </a>
      <div class="caption">Setup - Accessibility | <a href="/user-guide/#energy-coins">Spoon Theory</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Notifications">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/SetupProfile-4-PushNotificationsANDReminders-SaveProfile.png" alt="Setup profile step 4: Configure push notifications, reminders, and save personalized experience - 3mpwrApp settings" loading="lazy">
      </a>
      <div class="caption">Setup - Notifications | <a href="/user-guide/#personalization-setup">Save</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Emergency wallet card">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/emergencywalletcard-1.png" alt="Emergency wallet card with critical medical info, emergency contacts, and accommodations - 3mpwrApp safety" loading="lazy">
      </a>
      <div class="caption">Emergency Wallet Card | <a href="/beta-guide/#privacy--safety">Safety</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Emergency contacts">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/emergencywalletcard-2-emergencycontacts.png" alt="Emergency contacts wallet card for first responders - disability-aware crisis information - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Emergency Contacts | <a href="/beta-guide/#privacy--safety">Contacts</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#wellness-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Daily check-in">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/wellnesscheckin.png" alt="Wellness check-in feature tracking daily mood, energy, pain, and symptoms - 3mpwrApp health tracking" loading="lazy">
      </a>
      <div class="caption">Wellness Check-In | <a href="/user-guide/#wellness-hub">Track</a></div>
    </div>
  </div>
</section>

---

<section id="settings" class="category-section">
  <h2>⚙️ Settings & Accessibility</h2>
  <p class="category-desc">Comprehensive accessibility options including cognitive support, neurodivergent features, cultural safety, complexity modes, WCAG AAA compliance, encryption, and privacy controls.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Language & notifications">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings1-LanguageNotification.png" alt="Settings for language selection and notification preferences - multilingual accessibility - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Language & Notifications | <a href="/user-guide/#accessibility-settings">Configure</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Quiet hours">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings2-QuietHoursAlertTypes.png" alt="Settings quiet hours configuration and alert type customization - cognitive accessibility - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Quiet Hours & Alerts | <a href="/user-guide/#accessibility-settings">Customize</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#complexity-mode?utm_source=app_tour&utm_campaign=visual_refresh" title="Complexity modes">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings3-PushNotificationTypes-ComplexityModes.png" alt="Settings push notification types and complexity mode selection (simple, standard, power user) - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Notifications & Complexity | <a href="/user-guide/#complexity-mode">Modes</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#complexity-mode?utm_source=app_tour&utm_campaign=visual_refresh" title="Bad Day & Simple modes">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings-ComplexityModes1-BadDayModeANDSimpleMode.png" alt="Complexity modes: Bad Day Mode (5features) and Simple Mode (20 features) for cognitive accessibility - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Bad Day & Simple Modes | <a href="/user-guide/#complexity-mode">Simplify</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#complexity-mode?utm_source=app_tour&utm_campaign=visual_refresh" title="Standard & Power modes">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings-ComplexityModes2- StandardANDPowerUserMode.png" alt="Complexity modes: Standard (50 features) and Power User (150+ features) for advanced advocacy - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Standard & Power Modes | <a href="/user-guide/#complexity-mode">Advanced</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Accessibility settings">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings1-Accessibility-TextSize-PreferredResourceFormat.png" alt="More settings accessibility options including text size, preferred format, and reading level - WCAG AAA - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Accessibility Options | <a href="/user-guide/#accessibility-settings">Customize</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Cultural & language">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings2-QuickSettings-CulturalANDLanguage.png" alt="More settings quick access to cultural safety, language options, and personalization - 3mpwrApp diversity" loading="lazy">
      </a>
      <div class="caption">Cultural & Language | <a href="/user-guide/#accessibility-settings">Personalize</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#encryption?utm_source=app_tour&utm_campaign=visual_refresh" title="Privacy & security">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings3-PrivacySecurity-RequirePasscodeFeature.png" alt="More settings privacy and security including passcode protection and encryption options - 3mpwrApp data safety" loading="lazy">
      </a>
      <div class="caption">Privacy & Security | <a href="/user-guide/#encryption">Secure</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#data-ownership?utm_source=app_tour&utm_campaign=visual_refresh" title="Data management">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings4-AutoLockTimeout-Analytics-ErrorReporting-SaveSearchHistory-DataManagement.png" alt="More settings auto-lock timeout, analytics opt-in, error reporting, search history, and data management - 3mpwrApp privacy" loading="lazy">
      </a>
      <div class="caption">Data Management | <a href="/user-guide/#data-ownership">Control</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Help & support">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings6-HelpANDSupport.png" alt="More settings help and support options with tutorials, FAQs, and contact channels - 3mpwrApp assistance" loading="lazy">
      </a>
      <div class="caption">Help & Support | <a href="/beta-guide/#where-to-send-feedback">Contact</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Troubleshooting">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings7-TroubleshootingANDHelp1.png" alt="More settings troubleshooting guide for common issues and bug fixes - 3mpwrApp support" loading="lazy">
      </a>
      <div class="caption">Troubleshooting | <a href="/beta-guide/#where-to-send-feedback">Help</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Help resources">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings8-TroubleshootingANDHelp2.png" alt="More settings help resources with video tutorials and step-by-step guides - 3mpwrApp learning" loading="lazy">
      </a>
      <div class="caption">Help Resources | <a href="/user-guide/#accessibility-settings">Learn</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Terms & policies">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings9-TermsANDPolicies.png" alt="More settings access to terms of service, privacy policy, and legal disclaimers - 3mpwrApp transparency" loading="lazy">
      </a>
      <div class="caption">Terms & Policies | <a href="/beta-guide/#privacy--safety">Legal</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Advanced accessibility">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility1.png" alt="Advanced accessibility settings overview with WCAG AAA compliance options - 3mpwrApp inclusive design" loading="lazy">
      </a>
      <div class="caption">Advanced Accessibility | <a href="/user-guide/#accessibility-settings">WCAG AAA</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Visual accessibility">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility2.png" alt="Advanced accessibility visual settings: contrast, color blindness modes, font options - 3mpwrApp vision" loading="lazy">
      </a>
      <div class="caption">Visual Accessibility | <a href="/user-guide/#accessibility-settings">Vision</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Motor accessibility">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility3.png" alt="Advanced accessibility motor settings: touch targets, dwell time, switch control - 3mpwrApp physical disabilities" loading="lazy">
      </a>
      <div class="caption">Motor Accessibility | <a href="/user-guide/#accessibility-settings">Physical</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Cognitive accessibility">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility4.png" alt="Advanced accessibility cognitive settings: simplified language, reduced motion, focus indicators - 3mpwrApp neurodivergent" loading="lazy">
      </a>
      <div class="caption">Cognitive Accessibility | <a href="/user-guide/#accessibility-settings">Neurodivergent</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Auditory accessibility">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility5.png" alt="Advanced accessibility auditory settings: captions, visual alerts, haptic feedback - 3mpwrApp hearing" loading="lazy">
      </a>
      <div class="caption">Auditory Accessibility | <a href="/user-guide/#accessibility-settings">Hearing</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Custom presets">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility-6.png" alt="Advanced accessibility custom presets saving personalized accessibility configurations - 3mpwrApp preferences" loading="lazy">
      </a>
      <div class="caption">Custom Presets | <a href="/user-guide/#accessibility-settings">Save</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#encryption?utm_source=app_tour&utm_campaign=visual_refresh" title="Security overview">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedSecurity1-Overview.png" alt="Advanced security settings overview with encryption, air-gapped mode, and data ownership - 3mpwrApp privacy" loading="lazy">
      </a>
      <div class="caption">Security Overview | <a href="/user-guide/#encryption">Protect</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#encryption?utm_source=app_tour&utm_campaign=visual_refresh" title="Authentication">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedSecurity2-AuthenticationSettings.png" alt="Advanced security authentication settings with biometric login and multi-factor authentication - 3mpwrApp security" loading="lazy">
      </a>
      <div class="caption">Authentication | <a href="/user-guide/#encryption">Login</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#encryption?utm_source=app_tour&utm_campaign=visual_refresh" title="Encryption">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedSecurity3-Encryption.png" alt="Advanced security encryption options for protecting medical records and legal documents - 3mpwrApp data protection" loading="lazy">
      </a>
      <div class="caption">Encryption | <a href="/user-guide/#encryption">Encrypt</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#data-ownership?utm_source=app_tour&utm_campaign=visual_refresh" title="Privacy settings">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedSecurity4-Privacy.png" alt="Advanced security privacy settings controlling data sharing and analytics - 3mpwrApp user control" loading="lazy">
      </a>
      <div class="caption">Privacy Controls | <a href="/user-guide/#data-ownership">Control</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#data-ownership?utm_source=app_tour&utm_campaign=visual_refresh" title="Audit log">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedSecurity5-Audit.png" alt="Advanced security audit log showing who accessed your data and when - HIPAA compliance - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Audit Log | <a href="/user-guide/#data-ownership">Track</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#data-ownership?utm_source=app_tour&utm_campaign=visual_refresh" title="Emergency access">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedSecurity6-Emergency.png" alt="Advanced security emergency access for trusted contacts in crisis situations - 3mpwrApp safety" loading="lazy">
      </a>
      <div class="caption">Emergency Access | <a href="/beta-guide/#privacy--safety">Safety</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#byoc?utm_source=app_tour&utm_campaign=visual_refresh" title="BYOC connected">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/BYOC-Connected1.png" alt="Bring Your Own Cloud (BYOC) connected to Google Drive - user-controlled data storage - 3mpwrApp data ownership" loading="lazy">
      </a>
      <div class="caption">BYOC - Connected | <a href="/user-guide/#byoc">Cloud</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#byoc?utm_source=app_tour&utm_campaign=visual_refresh" title="BYOC sync">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/BYOC-Connected2.png" alt="BYOC sync settings managing what data syncs to your personal cloud storage - 3mpwrApp privacy" loading="lazy">
      </a>
      <div class="caption">BYOC - Sync Settings | <a href="/user-guide/#byoc">Manage</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#byoc?utm_source=app_tour&utm_campaign=visual_refresh" title="BYOC disconnected">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/BYOC-Disconnected1.png" alt="BYOC disconnected status showing local-only data storage - complete privacy - 3mpwrApp offline mode" loading="lazy">
      </a>
      <div class="caption">BYOC - Local Only | <a href="/user-guide/#byoc">Offline</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#byoc?utm_source=app_tour&utm_campaign=visual_refresh" title="BYOC options">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/BYOC-Disconnected2.png" alt="BYOC connection options for Google Drive, Dropbox, or local-only storage - 3mpwrApp data control" loading="lazy">
      </a>
      <div class="caption">BYOC - Connect Options | <a href="/user-guide/#byoc">Setup</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Cognitive accessibility">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/CognitiveAccessibility1.png" alt="Cognitive accessibility settings reducing cognitive load for neurodivergent users - 3mpwrApp inclusive design" loading="lazy">
      </a>
      <div class="caption">Cognitive Accessibility | <a href="/user-guide/#accessibility-settings">Neurodivergent</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Cognitive features">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/CognitiveAccessibility2.png" alt="Cognitive accessibility features: simplified menus, clear labels, progress indicators - 3mpwrApp ADHD autism" loading="lazy">
      </a>
      <div class="caption">Cognitive Features | <a href="/user-guide/#accessibility-settings">Simplify</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Cognitive comfort">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/CognitiveComfort1.png" alt="Cognitive comfort settings creating calming digital environment for sensory sensitivities - 3mpwrApp neurodivergent" loading="lazy">
      </a>
      <div class="caption">Cognitive Comfort | <a href="/user-guide/#accessibility-settings">Calm</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Comfort customization">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/CognitiveComfort2.png" alt="Cognitive comfort customization with reduced animations, quiet interface, focus modes - 3mpwrApp accessibility" loading="lazy">
      </a>
      <div class="caption">Comfort Customization | <a href="/user-guide/#accessibility-settings">Focus</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Cultural safety">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/CulturalSafety1-CulturalProfileSetup.png" alt="Cultural Safety profile setup configuring culturally appropriate language and content - 3mpwrApp diversity equity inclusion" loading="lazy">
      </a>
      <div class="caption">Cultural Safety | <a href="/user-guide/#accessibility-settings">Diversity</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Neurodivergent support">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/NeurodivergentSupport1.png" alt="Neurodivergent support settings overview for ADHD, autism, and cognitive differences - 3mpwrApp inclusive design" loading="lazy">
      </a>
      <div class="caption">Neurodivergent Support | <a href="/user-guide/#accessibility-settings">Overview</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="ADHD support">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/NeurodivergentSupport2.png" alt="Neurodivergent support ADHD-specific features: timers, reminders, focus tools - 3mpwrApp executive function" loading="lazy">
      </a>
      <div class="caption">ADHD Support | <a href="/user-guide/#accessibility-settings">ADHD</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Autism support">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/NeurodivergentSupport3.png" alt="Neurodivergent support autism-specific features: sensory settings, communication tools - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Autism Support | <a href="/user-guide/#accessibility-settings">Autism</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Learning disabilities">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/NeurodivergentSupport4.png" alt="Neurodivergent support learning disabilities features: text-to-speech, visual aids - 3mpwrApp accessibility" loading="lazy">
      </a>
      <div class="caption">Learning Support | <a href="/user-guide/#accessibility-settings">Learn</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Anxiety management">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/NeurodivergentSupport5.png" alt="Neurodivergent support anxiety management: calming interface, predictability, control - 3mpwrApp mental health" loading="lazy">
      </a>
      <div class="caption">Anxiety Management | <a href="/user-guide/#accessibility-settings">Anxiety</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Custom neurodivergent">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/NeurodivergentSupport6.png" alt="Neurodivergent support custom combinations for individual cognitive accessibility needs - 3mpwrApp personalization" loading="lazy">
      </a>
      <div class="caption">Custom Neurodivergent | <a href="/user-guide/#accessibility-settings">Personalize</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#encryption?utm_source=app_tour&utm_campaign=visual_refresh" title="Evidence encryption">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/EvidenceEncryptionSync2-BackgroundSync.png" alt="Evidence encryption and background sync settings for secure document management - 3mpwrApp data security" loading="lazy">
      </a>
      <div class="caption">Evidence Encryption | <a href="/user-guide/#encryption">Sync</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Troubleshooting">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/TroubleshootingANDHelp1-CommonIssues.png" alt="Troubleshooting common issues guide with solutions for app problems - 3mpwrApp support" loading="lazy">
      </a>
      <div class="caption">Common Issues | <a href="/beta-guide/#where-to-send-feedback">Troubleshoot</a></div>
    </div>
  </div>
</section>

---

<section id="onboarding" class="category-section">
  <h2>🚪 Onboarding & Terms</h2>
  <p class="category-desc">Welcome experience, guided tutorials, terms of service, privacy policies, and important disclaimers to ensure informed consent and successful onboarding.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <a href="/user-guide/#quick-start?utm_source=app_tour&utm_campaign=visual_refresh" title="First launch">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/1stscreenuponlaunch3mpwrApp.png" alt="3mpwrApp first launch welcome screen - start your disability advocacy journey - beta testing" loading="lazy">
      </a>
      <div class="caption">First Launch | <a href="/beta-guide/#how-to-join-beta-testing">Beta</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#quick-start?utm_source=app_tour&utm_campaign=visual_refresh" title="Welcome detailed">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/1welcometo3mpwrappDetailedReview.png" alt="Welcome to 3mpwrApp detailed review of features and capabilities - onboarding tutorial" loading="lazy">
      </a>
      <div class="caption">Welcome Details | <a href="/user-guide/#quick-start">Features</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#quick-start?utm_source=app_tour&utm_campaign=visual_refresh" title="Welcome tutorial 1">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/Welcometo3mpwrAppLetsGetStarted1.png" alt="Welcome to 3mpwrApp onboarding tutorial step 1 - getting started guide - disability app" loading="lazy">
      </a>
      <div class="caption">Tutorial Step 1 | <a href="/user-guide/#quick-start">Start</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Welcome tutorial 2">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/Welcometo3mpwrAppLetsGetStarted2.png" alt="Welcome tutorial step 2 explaining AI-powered advocacy tools - 3mpwrApp features" loading="lazy">
      </a>
      <div class="caption">Tutorial Step 2 - AI | <a href="/user-guide/#ai-advocacy-suite">AI Tools</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#wellness-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Welcome tutorial 3">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/Welcometo3mpwrAppLetsGetStarted3.png" alt="Welcome tutorial step 3 showcasing wellness tracking and health management - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Tutorial Step 3 - Wellness | <a href="/user-guide/#wellness-hub">Wellness</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#evidence-command-center?utm_source=app_tour&utm_campaign=visual_refresh" title="Welcome tutorial 4">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/Welcometo3mpwrAppLetsGetStarted4.png" alt="Welcome tutorial step 4 demonstrating evidence management and legal tools - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Tutorial Step 4 - Evidence | <a href="/user-guide/#evidence-command-center">Evidence</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Welcome tutorial 5">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/Welcometo3mpwrAppLetsGetStarted5.png" alt="Welcome tutorial step 5 introducing community support and peer connection - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Tutorial Step 5 - Community | <a href="/user-guide/#community-hub">Community</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#encryption?utm_source=app_tour&utm_campaign=visual_refresh" title="Welcome tutorial 6">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/Welcometo3mpwrAppLetsGetStarted6.png" alt="Welcome tutorial step 6 explaining privacy and data ownership - 3mpwrApp security" loading="lazy">
      </a>
      <div class="caption">Tutorial Step 6 - Privacy | <a href="/beta-guide/#privacy--safety">Privacy</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#how-to-join-beta-testing?utm_source=app_tour&utm_campaign=visual_refresh" title="Welcome tutorial 7">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/Welcometo3mpwrAppLetsGetStarted7.png" alt="Welcome tutorial step 7 final onboarding step ready to start - 3mpwrApp beta" loading="lazy">
      </a>
      <div class="caption">Tutorial Step 7 - Ready | <a href="/beta-guide/#how-to-join-beta-testing">Join</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="First settings">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/1st-SettingsLanguageNotifications.png" alt="First-time settings: language and notification preferences - 3mpwrApp personalization" loading="lazy">
      </a>
      <div class="caption">First Settings | <a href="/user-guide/#accessibility-settings">Settings</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Quiet hours">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/2-QuietHoursAlertTypes.png" alt="First-time settings: quiet hours and alert type configuration - 3mpwrApp accessibility" loading="lazy">
      </a>
      <div class="caption">Quiet Hours Setup | <a href="/user-guide/#accessibility-settings">Configure</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="First home">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/1stHomeScreen-GetStarted3mpwrApp.png" alt="First home screen after onboarding with next steps - 3mpwrApp getting started" loading="lazy">
      </a>
      <div class="caption">First Home Screen | <a href="/user-guide/#quick-start">Dashboard</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Home base">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/2ndHomeScreen-HomeBase.png" alt="Home base dashboard showing main features and quick actions - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Home Base | <a href="/user-guide/#personalization-setup">Base</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#ai-advocacy-suite?utm_source=app_tour&utm_campaign=visual_refresh" title="Parse claim tutorial">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/3rdHomeScreen-ParseClaim.png" alt="Tutorial screen: parse your workers compensation claim with AI - 3mpwrApp AI tools" loading="lazy">
      </a>
      <div class="caption">Tutorial - Parse Claim | <a href="/user-guide/#ai-advocacy-suite">Parse</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#letter-wizard?utm_source=app_tour&utm_campaign=visual_refresh" title="Write letters tutorial">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/4thHomeScreen-WriteLetters.png" alt="Tutorial screen: write professional appeal letters with AI assistance - 3mpwrApp advocacy" loading="lazy">
      </a>
      <div class="caption">Tutorial - Write Letters | <a href="/user-guide/#letter-wizard">Write</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#wellness-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Track health tutorial">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/5thHomeScreen-TrackHealth.png" alt="Tutorial screen: track health symptoms and energy patterns - 3mpwrApp wellness" loading="lazy">
      </a>
      <div class="caption">Tutorial - Track Health | <a href="/user-guide/#wellness-hub">Track</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#community-hub?utm_source=app_tour&utm_campaign=visual_refresh" title="Community tutorial">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/6thHomeScreen-NotAlone-Community.png" alt="Tutorial screen: you're not alone, join the disability community - 3mpwrApp support" loading="lazy">
      </a>
      <div class="caption">Tutorial - Community | <a href="/user-guide/#support-groups">Connect</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#how-to-join-beta-testing?utm_source=app_tour&utm_campaign=visual_refresh" title="Tutorial complete">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/7thHomeScreen-YoureReady-EndOftutorial.png" alt="Tutorial complete: you're ready to start using 3mpwrApp - onboarding finished" loading="lazy">
      </a>
      <div class="caption">Tutorial Complete | <a href="/beta-guide/#how-to-join-beta-testing">Ready</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#quick-start?utm_source=app_tour&utm_campaign=visual_refresh" title="Quick overview 1">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/QuickOverviewStep1.png" alt="Quick overview tutorial step 1 highlighting key features - 3mpwrApp walkthrough" loading="lazy">
      </a>
      <div class="caption">Quick Overview Step 1 | <a href="/user-guide/#quick-start">Overview</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#quick-start?utm_source=app_tour&utm_campaign=visual_refresh" title="Quick overview 2">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/QuickOverviewStep2.png" alt="Quick overview tutorial step 2 explaining navigation and tools - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Quick Overview Step 2 | <a href="/user-guide/#quick-start">Navigation</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#quick-start?utm_source=app_tour&utm_campaign=visual_refresh" title="Quick overview complete">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/QuickOverviewStep3Final.png" alt="Quick overview tutorial final step ready to explore - 3mpwrApp onboarding" loading="lazy">
      </a>
      <div class="caption">Quick Overview Complete | <a href="/user-guide/#quick-start">Explore</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Complete profile 1">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/CompleteYourProfile1-Role-Location.png" alt="Complete your profile: select role (person with disability, supporter, ally) and location - 3mpwrApp personalization" loading="lazy">
      </a>
      <div class="caption">Profile Step 1 - Role | <a href="/user-guide/#personalization-setup">Role</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Complete profile 2">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/CompleteYourProfile2-WellnessToolsPreferences.png" alt="Complete profile: choose wellness tools preferences and health tracking options - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Profile Step 2 - Wellness | <a href="/user-guide/#wellness-hub">Preferences</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Complete profile 3">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/CompleteYourProfile3-AdvocacyNeeds.png" alt="Complete profile: select advocacy needs (benefits, legal, employment, housing) - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Profile Step 3 - Advocacy | <a href="/user-guide/#personalization-setup">Needs</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Complete profile 4">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/CompleteYourProfile4-AccessibilityAccomodationsANDEnergyPatterns.png" alt="Complete profile: configure accessibility accommodations and energy pattern tracking - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Profile Step 4 - Accessibility | <a href="/user-guide/#accessibility-settings">Access</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#privacy--safety?utm_source=app_tour&utm_campaign=visual_refresh" title="Terms of service">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/2termsofservicev3.03mpowrapp.png" alt="Terms of Service v3.0 - legal agreement for using 3mpwrApp - user agreement" loading="lazy">
      </a>
      <div class="caption">Terms of Service | <a href="/beta-guide/#privacy--safety">Terms</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#privacy--safety?utm_source=app_tour&utm_campaign=visual_refresh" title="Privacy policy">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/3privacypolicyv2,03mpwrapp.png" alt="Privacy Policy v2.0 - how 3mpwrApp protects your data and respects privacy - data protection" loading="lazy">
      </a>
      <div class="caption">Privacy Policy | <a href="/beta-guide/#privacy--safety">Privacy</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#privacy--safety?utm_source=app_tour&utm_campaign=visual_refresh" title="Medical disclaimer">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/4medicaldisclaimer3mpwrapp.png" alt="Medical Disclaimer - 3mpwrApp is not a substitute for professional medical advice - health information" loading="lazy">
      </a>
      <div class="caption">Medical Disclaimer | <a href="/beta-guide/#privacy--safety">Medical</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#privacy--safety?utm_source=app_tour&utm_campaign=visual_refresh" title="Legal disclaimer">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/5legaldisclaimer3mpwrapp.png" alt="Legal Disclaimer - 3mpwrApp provides information, not legal representation - advocacy tools" loading="lazy">
      </a>
      <div class="caption">Legal Disclaimer | <a href="/beta-guide/#privacy--safety">Legal</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#privacy--safety?utm_source=app_tour&utm_campaign=visual_refresh" title="Financial disclaimer">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/6financialdisclaimer3mpwrapp.png" alt="Financial Disclaimer - 3mpwrApp does not provide financial advice - benefits information" loading="lazy">
      </a>
      <div class="caption">Financial Disclaimer | <a href="/beta-guide/#privacy--safety">Financial</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#privacy--safety?utm_source=app_tour&utm_campaign=visual_refresh" title="AI disclaimer">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/7aicontentdisclaimer3mpwrapp.png" alt="AI Content Disclaimer - AI-generated content should be reviewed by professionals - 3mpwrApp AI tools" loading="lazy">
      </a>
      <div class="caption">AI Content Disclaimer | <a href="/user-guide/#ai-advocacy-suite">AI</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#privacy--safety?utm_source=app_tour&utm_campaign=visual_refresh" title="Crisis disclaimer">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/8crisisnemergencydisclaimer3mpwrapp.png" alt="Crisis & Emergency Disclaimer - 3mpwrApp is not a crisis hotline, call emergency services - mental health" loading="lazy">
      </a>
      <div class="caption">Crisis Disclaimer | <a href="/user-guide/#wellness-hub">Crisis</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#how-to-join-beta-testing?utm_source=app_tour&utm_campaign=visual_refresh" title="Final agreement">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/9finalagreement3mpwrapp.png" alt="Final agreement acknowledging all disclaimers before accessing 3mpwrApp - consent" loading="lazy">
      </a>
      <div class="caption">Final Agreement | <a href="/beta-guide/#how-to-join-beta-testing">Agree</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#how-to-join-beta-testing?utm_source=app_tour&utm_campaign=visual_refresh" title="What's new">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/10whatsnew3mpwrapp.png" alt="What's New in 3mpwrApp - latest features, updates, and improvements - changelog" loading="lazy">
      </a>
      <div class="caption">What's New | <a href="/beta-guide/#how-to-join-beta-testing">Updates</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#how-to-join-beta-testing?utm_source=app_tour&utm_campaign=visual_refresh" title="Explore first">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/11getstartedexplorefirst3mpwrapp.png" alt="Get started option to explore 3mpwrApp features before creating account - guest mode" loading="lazy">
      </a>
      <div class="caption">Explore First | <a href="/user-guide/#quick-start">Guest</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#how-to-join-beta-testing?utm_source=app_tour&utm_campaign=visual_refresh" title="Login register">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/12loginregister3mpwrapp.png" alt="Login or register screen for creating 3mpwrApp account - beta testing access" loading="lazy">
      </a>
      <div class="caption">Login / Register | <a href="/beta-guide/#how-to-join-beta-testing">Join</a></div>
    </div>
  </div>
</section>

---

## Ready to Experience 3mpwrApp?

<div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, var(--primary, #4caf50) 0%, var(--primary-dark, #1b5e20) 100%); border-radius: 1rem; color: white; margin-top: 2rem;">
  <h3 style="margin-bottom: 1rem; color: white;">Join Our Beta Program</h3>
  <p style="margin-bottom: 1.5rem; opacity: 0.95;">Be among the first to access these powerful features. Help us build the platform injured workers deserve.</p>
  <a href="/beta/" style="display: inline-block; padding: 1rem 2rem; background: white; color: var(--primary-dark, #1b5e20); text-decoration: none; border-radius: 2rem; font-weight: 600;">Join the Beta →</a>
</div>

<!-- Lightbox -->
<div class="lightbox" id="lightbox">
  <button class="lightbox-close" aria-label="Close image viewer" id="lightbox-close">×</button>
  <img src="" alt="" id="lightbox-img">
</div>

{% raw %}
<script>
(function() {
  // Wait for full page load including images
  window.addEventListener('load', function() {
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxClose = document.getElementById('lightbox-close');
    var previewImages = document.querySelectorAll('.preview-card img');
    
    console.log('Lightbox initialized, found ' + previewImages.length + ' images');
    
    // Add click listeners to all preview images
    for (var i = 0; i < previewImages.length; i++) {
      (function(img) {
        img.style.cursor = 'pointer';
        img.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Image clicked:', img.src);
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
          lightbox.style.display = 'flex';
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
          return false;
        };
      })(previewImages[i]);
    }
    
    // Close lightbox function
    function closeLightbox() {
      lightbox.style.display = 'none';
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // Close on background click
    lightbox.onclick = function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    };
    
    // Close button
    lightboxClose.onclick = function(e) {
      e.stopPropagation();
      closeLightbox();
    };
    
    // Close on Escape key
    document.onkeydown = function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeLightbox();
      }
    };
  });
})();
</script>
{% endraw %}


