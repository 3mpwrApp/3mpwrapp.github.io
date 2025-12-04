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
    <div class="stat-number">100+</div>
    <div class="stat-label">Visuals</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">11</div>
    <div class="stat-label">Categories</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">50+</div>
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
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/home13mpwrapp.png" alt="3mpwrApp main dashboard showing personalized widgets and quick access to all features" loading="lazy">
      <div class="caption">Main Dashboard</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/home23mpwrapp.png" alt="Dashboard with activity feed and notifications" loading="lazy">
      <div class="caption">Dashboard Overview</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/home33mpwrapp.png" alt="Dashboard additional features" loading="lazy">
      <div class="caption">Dashboard Features</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/assistanthome3mpwrapp.png" alt="AI Assistant interface helping users navigate the platform" loading="lazy">
      <div class="caption">AI Assistant</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/homeask3mpwrapp.png" alt="Ask AI feature for getting help" loading="lazy">
      <div class="caption">Ask AI</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/aicaseinterpreter3mpwrapp.png" alt="AI Case Interpreter helping understand legal documents" loading="lazy">
      <div class="caption">AI Case Interpreter</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/onboardingfirst7dayshome13mpwrapp.png" alt="First 7 days onboarding experience" loading="lazy">
      <div class="caption">Onboarding Day 1</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/onboardingfirst7dayshome23mpwrapp.png" alt="Onboarding continuation" loading="lazy">
      <div class="caption">Onboarding Journey</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/homesearch3mpwrapp.png" alt="Global search feature finding content across the app" loading="lazy">
      <div class="caption">Global Search</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/revolutionnaryfeatures13mpwrapp.png" alt="Revolutionary features overview" loading="lazy">
      <div class="caption">Revolutionary Features</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/revolutionnaryfeatures23mpwrapp.png" alt="More revolutionary features" loading="lazy">
      <div class="caption">More Features</div>
    </div>
  </div>
</section>

---

<section id="advocacy" class="category-section">
  <h2>⚖️ Advocacy Hub</h2>
  <p class="category-desc">AI-powered tools for building your case, managing evidence, finding legal help, and generating professional letters.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/advocacy13mpwrapp.png" alt="Advocacy tab main view" loading="lazy">
      <div class="caption">Advocacy Overview</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/advocacy23mpwrapp.png" alt="Advocacy tools and options" loading="lazy">
      <div class="caption">Advocacy Tools</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/advocacy33mpwrapp.png" alt="Additional advocacy features" loading="lazy">
      <div class="caption">More Advocacy Features</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/aicommandcenter1advocacytab3mpwrapp.png" alt="AI Advocacy Command Centre dashboard" loading="lazy">
      <div class="caption">AI Command Centre</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/aicommandcenter2advocacytab3mpwrapp.png" alt="Command centre active tasks" loading="lazy">
      <div class="caption">Tasks & Actions</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/aicommandcenter3advocacytab3mpwrapp.png" alt="AI-generated action plan" loading="lazy">
      <div class="caption">Action Plan</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/evidencemanageradvocacytab3mpwrapp.png" alt="Evidence Manager for organizing case documents" loading="lazy">
      <div class="caption">Evidence Manager</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/lawyeradvocatefinder3mpwrapp.png" alt="Lawyer & Advocate Finder" loading="lazy">
      <div class="caption">Lawyer Finder</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/selfadvocacycoachadvocacytab3mpwrapp.png" alt="Self Advocacy Coach" loading="lazy">
      <div class="caption">Self-Advocacy Coach</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/casetrackercoachingadvocacytab3mpwrapp.png" alt="Case Tracker with coaching" loading="lazy">
      <div class="caption">Case Tracker</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/advocacy/communityratingsadvocacytab3mpwrapp.png" alt="Community ratings for lawyers and advocates" loading="lazy">
      <div class="caption">Community Ratings</div>
    </div>
  </div>
</section>

---

<section id="wellness" class="category-section">
  <h2>💚 Wellness Center</h2>
  <p class="category-desc">Comprehensive health tracking, mental wellness support, movement guidance, and crisis resources.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/wellnesstab13mpwrapp.png" alt="Wellness tab main view" loading="lazy">
      <div class="caption">Wellness Overview</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/wellnesstab23mpwrapp.png" alt="Wellness features list" loading="lazy">
      <div class="caption">Wellness Features</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/wellnesstab33mpwrapp.png" alt="Additional wellness options" loading="lazy">
      <div class="caption">More Wellness</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/wellnesstabunifiedhealthtracker13mpwrapp.png" alt="Unified Health Tracker dashboard" loading="lazy">
      <div class="caption">Health Tracker</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/wellnesstabunifiedhealthtracker23mpwrapp.png" alt="Health tracking details" loading="lazy">
      <div class="caption">Health Details</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/wellnesstabmentalwellnesstoolkit3mpwrapp.png" alt="Mental Wellness Toolkit" loading="lazy">
      <div class="caption">Mental Wellness Toolkit</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/wellnesstabmovementnrehabhub3mpwrapp.png" alt="Movement & Rehab Hub" loading="lazy">
      <div class="caption">Movement Hub</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/wellnesstabfunctionalcapacityassessment3mpwrapp.png" alt="Functional Capacity Assessment" loading="lazy">
      <div class="caption">Capacity Assessment</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/wellness/wellnesstabwellnessnworkbalanceai3mpwrapp.png" alt="Wellness & Work Balance AI" loading="lazy">
      <div class="caption">Work-Life Balance AI</div>
    </div>
  </div>
</section>

---

<section id="resources" class="category-section">
  <h2>📚 Resources Center</h2>
  <p class="category-desc">Master tracker, appeal center, evidence management, letter templates, and comprehensive guides.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcestab13mpwrapp.png" alt="Resources tab main view" loading="lazy">
      <div class="caption">Resources Overview</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcestabs23mpwrapp.png" alt="Resources additional features" loading="lazy">
      <div class="caption">Resources Features</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcestab33mpwrapp.png" alt="More resources" loading="lazy">
      <div class="caption">More Resources</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcestab43mpwrapp.png" alt="Resources continued" loading="lazy">
      <div class="caption">Additional Tools</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcesmastertrackerdashboard13mpwrapp.png" alt="Master Tracker Dashboard" loading="lazy">
      <div class="caption">Master Tracker</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcesmastertrackerdashboard23mpwrapp.png" alt="Master Tracker details" loading="lazy">
      <div class="caption">Tracker Details</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcestabappealcommandcenter13mpwrapp.png" alt="Appeal Command Center" loading="lazy">
      <div class="caption">Appeal Command Center</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcestabappealcommandcenter23mpwrapp.png" alt="Appeal Command Center tools" loading="lazy">
      <div class="caption">Appeal Tools</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcestabevidencemanager3mpwrapp.png" alt="Evidence Manager" loading="lazy">
      <div class="caption">Evidence Manager</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcestabmasterlettergenerator13mpwrapp.png" alt="Letter Generator interface" loading="lazy">
      <div class="caption">Letter Generator</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcestabmasterlettergenerator23mpwrapp.png.png" alt="Letter template selection" loading="lazy">
      <div class="caption">Letter Templates</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/resources/resourcestabmasterlettergenerator33mpwrapp.png.png" alt="Generated letter preview" loading="lazy">
      <div class="caption">Letter Preview</div>
    </div>
  </div>
</section>

---

<section id="research" class="category-section">
  <h2>🔬 Research Library</h2>
  <p class="category-desc">Access medical research, legal precedents, UNCRPD guides, and evidence-based information.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/research/researchtab3mpwrapp.png" alt="Research Library main interface" loading="lazy">
      <div class="caption">Research Library</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/research/researchtabexternalresources3mpwrapp.png" alt="External resources" loading="lazy">
      <div class="caption">External Resources</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/research/researchtabmasterresearchindex3mpwrapp.png" alt="Master Research Index" loading="lazy">
      <div class="caption">Master Research Index</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/research/researchtabresearchlibrary3mpwrapp.png" alt="Research document viewer" loading="lazy">
      <div class="caption">Research Documents</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/research/researchtabuncrpdframeworknapplicationguide3mpwrapp.png" alt="UNCRPD Framework & Application Guide" loading="lazy">
      <div class="caption">UNCRPD Guide</div>
    </div>
  </div>
</section>

---

<section id="campaigns" class="category-section">
  <h2>📢 Campaigns</h2>
  <p class="category-desc">Join or create advocacy campaigns, track progress, and amplify your collective voice.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/campaigns/campaignstab3mpwrapp.png" alt="Campaigns tab showing active campaigns" loading="lazy">
      <div class="caption">Active Campaigns</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/campaigns/createcampaigncampaignstab3mpwrapp.png" alt="Create new campaign interface" loading="lazy">
      <div class="caption">Create Campaign</div>
    </div>
  </div>
</section>

---

<section id="events" class="category-section">
  <h2>📅 Events Calendar</h2>
  <p class="category-desc">Stay connected with community events, deadlines, support groups, and webinars.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventscalendar3mpwrapp1.png" alt="Events calendar view" loading="lazy">
      <div class="caption">Calendar View</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventscalendar3mpwrapp2.png" alt="Calendar with events" loading="lazy">
      <div class="caption">Calendar Details</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventstab13mpwrapp.png" alt="Events list view" loading="lazy">
      <div class="caption">Events List</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventstab23mpwrapp.png" alt="Event details" loading="lazy">
      <div class="caption">Event Details</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventstabfilterevents3mpwrapp.png" alt="Event filters" loading="lazy">
      <div class="caption">Filter Events</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/events/eventstabscreateevent3mpwrapp.png" alt="Create new event" loading="lazy">
      <div class="caption">Create Event</div>
    </div>
  </div>
</section>

---

<section id="community" class="category-section">
  <h2>👥 Community Hub</h2>
  <p class="category-desc">Connect with fellow injured workers, join support groups, and access the beta testers chat.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/community/communityhubtab3mpwrapp.png" alt="Community Hub main interface" loading="lazy">
      <div class="caption">Community Hub</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/community/testerschatcommunitytab3mpwrapp.png" alt="Beta Testers Chat room" loading="lazy">
      <div class="caption">Beta Testers Chat</div>
    </div>
  </div>
</section>

---

<section id="profile" class="category-section">
  <h2>👤 User Profile</h2>
  <p class="category-desc">Manage your personal information, track your journey, and customize your experience.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/profile/profile13mpwrapp.png" alt="User profile overview with personal details" loading="lazy">
      <div class="caption">Profile Overview</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/profile/profile/profile23mpwrapp.png" alt="Profile settings and customization" loading="lazy">
      <div class="caption">Profile Settings</div>
    </div>
  </div>
</section>

---

<section id="settings" class="category-section">
  <h2>⚙️ Settings & Accessibility</h2>
  <p class="category-desc">Comprehensive accessibility options including cognitive support, neurodivergent features, cultural safety, and complexity modes.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/settings/settingstab13mpwrapp.png" alt="Settings tab main menu" loading="lazy">
      <div class="caption">Settings Overview</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/settings/settingstab23mpwrapp.png" alt="Account settings" loading="lazy">
      <div class="caption">Account Settings</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/settings/settingstab33mpwrapp.png" alt="Privacy settings" loading="lazy">
      <div class="caption">Privacy Settings</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/settings/settingsadvancedaccessibility13mpwrapp.png" alt="Advanced accessibility" loading="lazy">
      <div class="caption">Advanced Accessibility</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/settings/settingscognitiveaccessibility13mpwrapp.png" alt="Cognitive accessibility" loading="lazy">
      <div class="caption">Cognitive Support</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/settings/settingscomplexitymode13mpwrapp.png" alt="Complexity modes" loading="lazy">
      <div class="caption">Complexity Modes</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/settings/settingsculturalsafety13mpwrapp.png" alt="Cultural safety settings" loading="lazy">
      <div class="caption">Cultural Safety</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/settings/settingsneurodivergentsupport13mpwrapp.png" alt="Neurodivergent support" loading="lazy">
      <div class="caption">Neurodivergent Support</div>
    </div>
  </div>
</section>

---

<section id="onboarding" class="category-section">
  <h2>🚪 Onboarding & Terms</h2>
  <p class="category-desc">Welcome experience, terms of service, privacy policies, and important disclaimers.</p>
  
  <div class="preview-grid">
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/termsgate/1welcometo3mpwrapp.png" alt="Welcome screen" loading="lazy">
      <div class="caption">Welcome Screen</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/termsgate/2termsofservicev3.03mpowrapp.png" alt="Terms of Service" loading="lazy">
      <div class="caption">Terms of Service</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/termsgate/3privacypolicyv2,03mpwrapp.png" alt="Privacy Policy" loading="lazy">
      <div class="caption">Privacy Policy</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/termsgate/4medicaldisclaimer3mpwrapp.png" alt="Medical Disclaimer" loading="lazy">
      <div class="caption">Medical Disclaimer</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/termsgate/10whatsnew3mpwrapp.png" alt="What's New" loading="lazy">
      <div class="caption">What's New</div>
    </div>
    <div class="preview-card">
      <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/termsgate/termsgate/12loginregister3mpwrapp.png" alt="Login / Register" loading="lazy">
      <div class="caption">Login / Register</div>
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


