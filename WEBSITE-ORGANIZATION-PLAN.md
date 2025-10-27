# Website Organization Plan
**Date:** October 26, 2025  
**Purpose:** Better organize all pages across the entire 3mpwrApp website for improved navigation and maintainability

---

## 🎯 Current Issues

### Problems Identified:
1. **592 Markdown files** in root and subdirectories - overwhelming and disorganized
2. **Documentation mixed with public pages** - hard to distinguish dev docs from user content
3. **Inconsistent folder structure** - some features in folders, others as standalone files
4. **No clear navigation hierarchy** - users struggle to find what they need
5. **Duplicate/redundant pages** - multiple files covering similar topics
6. **Poor discoverability** - important pages buried in file system

---

## 📁 Proposed New Structure

### **PUBLIC PAGES** (User-Facing)
```
/
├── index.md                          # Homepage
├── about.md                          # About 3mpwrApp
├── contact.md                        # Contact page
├── faq.md                            # FAQ (consolidated)
├── roadmap.md                        # Product roadmap
│
├── /features/                        # All app features
│   ├── index.md                      # Features overview
│   ├── community-support.md          # Community features
│   ├── advocacy-tools.md             # Advocacy & campaigns
│   ├── disability-wizard.md          # Disability Wizard guide
│   ├── legal-workflow.md             # Legal automation
│   ├── evidence-locker.md            # Evidence management
│   ├── master-letter-generator.md    # Letter generator
│   ├── energy-forecast.md            # Energy tracking
│   ├── pain-flare-mode.md            # Pain management
│   └── indigenous-languages.md       # Language support
│
├── /blog/                            # Blog system
│   ├── index.md                      # Blog home
│   └── _posts/                       # Blog posts (dated)
│
├── /beta/                            # Beta testing
│   ├── index.md                      # Beta program overview
│   ├── guide.md                      # Beta testing guide
│   └── app-waitlist.md               # Waitlist signup
│
├── /resources/                       # Support resources
│   ├── index.md                      # Resources hub
│   ├── crisis-resources.md           # Crisis support
│   ├── user-guide.md                 # Complete user guide
│   ├── accessibility-guide.md        # Accessibility features
│   ├── wellness.md                   # Wellness resources
│   └── free-tools.md                 # Free tools list
│
├── /community/                       # Community pages
│   ├── index.md                      # Community hub
│   ├── guidelines.md                 # Community rules
│   ├── spotlight.md                  # Member spotlights
│   ├── connect.md                    # How to connect
│   └── growth-strategy.md            # Community growth
│
├── /legal/                           # Legal pages
│   ├── terms.md                      # Terms of Service
│   ├── privacy.md                    # Privacy Policy
│   ├── data-ownership.md             # Data rights
│   ├── disclaimers.md                # Legal disclaimers
│   ├── cookies.md                    # Cookie policy
│   └── delete-account.html           # Account deletion
│
├── /accessibility/                   # Accessibility
│   ├── index.md                      # Accessibility statement
│   ├── settings.md                   # Accessibility settings
│   ├── walkthrough.md                # Feature walkthrough
│   └── wcag-compliance.md            # WCAG 2.2 report
│
├── /whats-new/                       # Updates
│   ├── index.md                      # Latest updates
│   ├── archives.md                   # Update archives
│   └── _whats_new/                   # Update posts
│
├── /newsletter/                      # Newsletter
│   └── index.md                      # Newsletter signup
│
└── /languages/                       # Translations
    ├── /fr/ (French)
    ├── /es/ (Spanish)
    ├── /zh/ (Chinese)
    ├── /ar/ (Arabic)
    └── /pa/ (Punjabi)
```

### **DOCUMENTATION** (Developer/Internal)
```
/docs/
├── /setup/                           # Setup guides
│   ├── cloudflare-setup.md
│   ├── google-console-setup.md
│   ├── social-media-setup.md
│   ├── monitoring-setup.md
│   └── testing-setup.md
│
├── /development/                     # Dev documentation
│   ├── contributing.md               # How to contribute
│   ├── content-guidelines.md         # Content standards
│   ├── accessibility-testing.md      # A11y testing guide
│   ├── cross-browser-testing.md      # Browser testing
│   ├── e2e-testing.md                # E2E test guide
│   └── security-hardening.md         # Security guide
│
├── /deployment/                      # Deployment docs
│   ├── cloudflare-deployment.md
│   ├── production-checklist.md
│   ├── launch-readiness.md
│   └── cache-clearing.md
│
├── /reports/                         # Status reports
│   ├── accessibility-compliance.md
│   ├── performance-baseline.md
│   ├── wcag-compliance.md
│   ├── security-audit.md
│   └── lighthouse-audit.md
│
├── /archives/                        # Historical docs
│   ├── phase-1-complete.md
│   ├── phase-2-complete.md
│   ├── phase-3-complete.md
│   ├── phase-4-complete.md
│   └── all-phases-complete.md
│
└── /troubleshooting/                 # Issue resolution
    ├── cloudflare-troubleshooting.md
    ├── blog-troubleshooting.md
    ├── x-api-troubleshooting.md
    └── bug-report-template.md
```

---

## 🔄 Reorganization Steps

### Phase 1: Create New Structure (Week 1)
1. **Create `/docs/` folder** for all internal documentation
2. **Create organized subfolders** within `/docs/`
3. **Keep public pages** in logical top-level folders

### Phase 2: Move Files (Week 2)
1. **Move all-caps .md files to `/docs/archives/`**
   - Examples: `ALL-4-PHASES-COMPLETE.md`, `EXECUTIVE-SUMMARY-*.md`
   
2. **Move setup guides to `/docs/setup/`**
   - Examples: `CLOUDFLARE-*.md`, `GOOGLE-CONSOLE-SETUP.md`
   
3. **Move testing docs to `/docs/development/`**
   - Examples: `*-TESTING-GUIDE.md`, `E2E-TESTING-GUIDE.md`
   
4. **Move reports to `/docs/reports/`**
   - Examples: `ACCESSIBILITY-COMPLIANCE-REPORT.md`, `WCAG-*.md`

5. **Consolidate feature pages into `/features/`**
   - Split `user-guide.md` into individual feature pages
   - Create clean, focused pages for each feature

### Phase 3: Update Navigation (Week 3)
1. **Update main navigation** in `_includes/header.html`
2. **Create breadcrumbs** for nested pages
3. **Add contextual navigation** within sections
4. **Update internal links** across all files

### Phase 4: Improve Discoverability (Week 4)
1. **Create site map page** (`/site-map/`)
2. **Add "Related Pages" sections** to each page
3. **Improve search functionality**
4. **Create landing pages** for major sections

---

## 🎨 Navigation Improvements

### **Main Navigation Menu**
```
┌─────────────────────────────────────────────────┐
│ 3mpwr App    [Features] [Blog] [Resources] [FAQ]│
│              [Beta] [Community] [About] [Contact]│
└─────────────────────────────────────────────────┘
```

### **Features Dropdown**
```
Features ▼
├── All Features
├── Disability Wizard
├── Legal Workflow Automation
├── Evidence Locker
├── Master Letter Generator
├── Energy Forecast & Scheduling
├── Pain Flare Mode
└── Indigenous Languages
```

### **Resources Dropdown**
```
Resources ▼
├── User Guide (Complete)
├── Crisis Resources
├── Accessibility Guide
├── Wellness Resources
├── Free Tools
└── FAQ
```

### **Footer Navigation**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ About        │ Resources    │ Community    │ Legal        │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ About Us     │ User Guide   │ Join         │ Terms        │
│ Roadmap      │ Crisis Help  │ Guidelines   │ Privacy      │
│ Features     │ Wellness     │ Spotlight    │ Data Rights  │
│ Blog         │ Accessibility│ Growth       │ Disclaimers  │
│ Contact      │ Free Tools   │ Connect      │ Cookies      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 📊 File Consolidation Plan

### **Pages to Merge:**
1. **FAQ Pages** → Single consolidated `/faq.md`
   - `faq.md`
   - FAQ sections from various pages
   
2. **Accessibility Pages** → `/accessibility/` folder
   - `accessibility.md`
   - `accessibility-settings.md`
   - `accessibility-walkthrough.md`
   - Keep: `WCAG-2.2-COMPLIANCE-REPORT.md` → Move to `/docs/reports/`

3. **Beta Pages** → `/beta/` folder
   - `beta-guide/index.md` → `/beta/guide.md`
   - `app-waitlist.md` → `/beta/waitlist.md`

4. **User Guide** → Split into feature pages
   - Current: One massive 3000+ line file
   - New: Individual feature pages in `/features/`
   - Keep overview in `/resources/user-guide.md`

### **Pages to Archive:**
Move to `/docs/archives/`:
- All `PHASE-*-COMPLETE.md` files
- All `EXECUTIVE-SUMMARY-*.md` files
- All `WEEK-*-COMPLETE.md` files
- All `*-STATUS-*.md` files
- All `SESSION-*.md` files

### **Pages to Delete:**
(After confirming no valuable info):
- Duplicate test files
- Temporary files (`temp-*.txt`)
- Old backup files

---

## 🔍 Search & Discoverability

### **Improvements:**
1. **Enhanced Search Page** (`/search/`)
   - Filter by category (Features, Blog, Resources, etc.)
   - Recent searches
   - Popular pages
   - Suggested results

2. **Breadcrumb Navigation**
   ```
   Home > Resources > User Guide > Disability Wizard
   ```

3. **"You Are Here" Indicator**
   - Highlight current page in navigation
   - Show section context

4. **Related Pages Widget**
   - At bottom of each page
   - Shows 3-5 related pages
   - Based on category/tags

5. **Site Map Page**
   - Visual hierarchy
   - All pages organized by category
   - Quick access to any page

---

## 📝 Content Improvements

### **Every Page Should Have:**
1. ✅ **Clear title and description**
2. ✅ **Breadcrumb navigation**
3. ✅ **Last updated date**
4. ✅ **Reading time estimate**
5. ✅ **Energy cost indicator** (🔋 for cognitive load)
6. ✅ **Related pages section**
7. ✅ **Feedback widget** (Was this helpful?)
8. ✅ **Print-friendly version**
9. ✅ **Share buttons** (optional)
10. ✅ **Table of contents** (for long pages)

### **Consistent Formatting:**
```yaml
---
layout: default
title: Page Title
description: Clear, concise description for SEO
category: features  # or: blog, resources, community, legal
tags: [disability-wizard, automation, accessibility]
last_updated: 2025-10-26
reading_time: 5 min
energy_cost: medium  # light, medium, high
related_pages:
  - /features/legal-workflow
  - /resources/user-guide
  - /beta/guide
---
```

---

## 🚀 Implementation Priority

### **High Priority (Do First):**
1. ✅ Create `/docs/` folder structure
2. ✅ Move all development documentation to `/docs/`
3. ✅ Consolidate FAQ into single page
4. ✅ Update main navigation menu
5. ✅ Add breadcrumbs to all pages

### **Medium Priority (Do Next):**
1. ✅ Split user guide into feature pages
2. ✅ Reorganize `/features/` folder
3. ✅ Create site map page
4. ✅ Add "Related Pages" to all pages
5. ✅ Improve search functionality

### **Low Priority (Nice to Have):**
1. ✅ Create visual navigation diagrams
2. ✅ Add page analytics/tracking
3. ✅ Implement progressive disclosure
4. ✅ Create guided tours for new users
5. ✅ Add keyboard shortcuts for navigation

---

## 📋 Checklist

### **Before Starting:**
- [ ] Backup entire site
- [ ] Create new branch for reorganization
- [ ] Document current link structure
- [ ] Create redirect map for moved pages

### **During Reorganization:**
- [ ] Create all new folders
- [ ] Move files systematically (by category)
- [ ] Update internal links as you go
- [ ] Test navigation after each major change
- [ ] Update sitemap.xml

### **After Completion:**
- [ ] Full site link check (lychee)
- [ ] Test all navigation paths
- [ ] Update external documentation
- [ ] Submit sitemap to Google
- [ ] Monitor 404 errors

---

## 🎯 Success Metrics

### **User Experience:**
- ✅ Reduce clicks to find any page (max 3 clicks)
- ✅ Improve page load times (remove clutter)
- ✅ Increase engagement (better discovery)
- ✅ Reduce bounce rate (clear navigation)

### **Maintainability:**
- ✅ Clear separation: public vs. documentation
- ✅ Logical folder structure
- ✅ Easy to add new content
- ✅ Consistent file naming

### **Accessibility:**
- ✅ Clear navigation landmarks
- ✅ Breadcrumbs for context
- ✅ Skip navigation links
- ✅ ARIA labels on all navigation

---

## 📚 Resources

### **Tools for Reorganization:**
- **Link Checker:** Lychee (already configured)
- **Search & Replace:** VS Code (regex support)
- **Sitemap Generator:** Jekyll sitemap plugin
- **Redirect Tool:** Cloudflare redirects (_headers file)

### **Documentation to Update:**
- README.md
- CONTRIBUTING.md
- Site map page
- Navigation menu
- Footer links

---

## 🆘 Crisis Resources Notice

**IMPORTANT:** When reorganizing, ensure crisis resources remain easily accessible:
- Keep `/crisis-resources` URL working (redirect if needed)
- Ensure footer crisis link always visible
- Test crisis resource page on all devices
- Maintain 24/7 crisis line visibility

---

## 📞 Questions or Concerns?

**Contact:** See /contact page  
**Documentation:** See /docs/ folder (after reorganization)  
**Issues:** File bug report using template in /docs/troubleshooting/

---

**Last Updated:** October 26, 2025  
**Next Review:** After Phase 1 completion  
**Owner:** Website maintenance team
