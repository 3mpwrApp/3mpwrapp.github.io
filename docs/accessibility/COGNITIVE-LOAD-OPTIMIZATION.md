# Cognitive Load Optimization Plan
## 3mpwr App Website Accessibility Analysis

**Date:** January 15, 2026  
**Analyst:** Cognitive Accessibility Specialist  
**Target Audience:** Disabled people, injured workers (experiencing brain fog, fatigue, cognitive impairment)  
**Goal:** Reduce cognitive load while maintaining comprehensive information through better organization

---

## Executive Summary

### Current Status
- **Homepage (index.md):** ~2,850 words ❌ (Target: 800)
- **About (about.md):** ~1,240 words ⚠️ (Target: 1,000)
- **Accessibility (/accessibility):** ~2,100 words ❌ (Target: 1,200)
- **Features (features/index.md):** ~850 words ✅ (Within target)

### Critical Findings
🚨 **Homepage exceeds optimal word count by 256%**  
⚠️ **Accessibility page exceeds target by 75%**  
✅ **About page slightly over but manageable**  
✅ **Features page is well-optimized**

### Priority Ranking
1. **CRITICAL:** Homepage (index.md) - Immediate restructuring needed
2. **HIGH:** Accessibility (/accessibility) - Progressive disclosure needed
3. **MEDIUM:** About (about.md) - Minor optimization
4. **LOW:** Features (features/index.md) - Maintain current structure

---

## Page 1: Homepage (index.md) - CRITICAL PRIORITY

### Current State Analysis

**Word Count:** ~2,850 words  
**Estimated Reading Time:** 12-15 minutes  
**Cognitive Load:** VERY HIGH ❌  
**Energy Cost for Target Audience:** 🔋🔋🔋🔋🔋 (5/5 - Exhausting)

### Problems Identified

1. **Excessive JavaScript code** (700+ lines embedded in HTML)
2. **Multiple long feature lists** without progressive disclosure
3. **Redundant "Community Voices" carousel** with 5 detailed cards
4. **Lengthy events banner** with complex filtering logic
5. **"Built Different" section** with 6+ features expanded inline
6. **Full founder bio** visible (should be excerpt + link)
7. **Multiple call-to-action sections** creating decision fatigue

### Content Breakdown by Section

| Section | Words | Should Move To | Reason |
|---------|-------|----------------|--------|
| Hero + Intro | 120 | ✅ Keep | Essential orientation |
| Accessibility Toolbar | 450 | 📄 `/accessibility-settings/` | Feature documentation, not homepage content |
| Events Banner + Code | 800 | ✅ Keep (simplify display) | Dynamic content, but simplify UI |
| Community Spotlight (Disability Bulletin) | 180 | ✅ Keep | Timely, relevant |
| Community Voices Carousel (5 cards) | 520 | 📄 `/community-spotlight/` | Detailed profiles belong elsewhere |
| "Built Different" expanded features | 240 | 💡 Use `<details>` | Good content, needs progressive disclosure |
| Why 3mpwr? | 140 | ✅ Keep | Core value proposition |
| Features Grid | 180 | ✅ Keep | Essential overview |
| Disability Bulletin Banner | 180 | ⚠️ Consolidate | Duplicate with earlier mention |
| Get Involved | 160 | ✅ Keep | Primary CTA |
| Daily Highlights | 120 | ✅ Keep | Dynamic content |
| Legal & Privacy Links | 60 | ✅ Keep | Required |
| Latest Blog Posts | 80 | ✅ Keep | Dynamic, scannable |
| Weekly Updates + Code | 150 | ⚠️ Simplify | Too much JS inline |
| Meet the Creator | 100 | 💡 Excerpt only | Full bio → `/about` |
| Connect With Us | 170 | ✅ Keep | Community building |

### Recommended Restructuring

#### KEEP on Homepage (Target: ~800 words)
```markdown
1. Hero + Logo + Tagline (80 words)
2. TL;DR Box with 6 key facts (120 words)
3. This Week's Events (simplified display, 80 words visible)
4. Community Spotlight - ONE featured member (100 words)
5. Why 3mpwr? (140 words)
6. Features Grid (4 items, 120 words)
7. Get Involved CTA (100 words)
8. Connect With Us (60 words social links only)
```

#### MOVE to `/homepage-full/` (Complexity Mode Toggle)
- Full accessibility toolbar documentation
- All 5 community voice cards
- Expanded "Built Different" features
- Detailed founder story
- Full event filtering logic

#### PROGRESSIVE DISCLOSURE (Details/Summary)
```html
<!-- Example: Built Different Section -->
<details class="cognitive-friendly">
  <summary><strong>✨ Built Different—By Design</strong> (Click to explore 6 unique features)</summary>
  <div class="details-content">
    <!-- Full content here -->
  </div>
</details>
```

### Implementation Examples

#### BEFORE (Current - 520 words):
```markdown
<!-- Featured Community Members Carousel -->
<div style="background: linear-gradient(...)">
  [5 full cards with bios, links, descriptions - 520 words total]
</div>
```

#### AFTER (Simplified - 120 words):
```markdown
<!-- Featured This Week -->
<div class="community-spotlight">
  <h3>🌟 Community Voice: Emily Pot</h3>
  <p>Independent disability journalist & co-founder of The Disability Bulletin. 
  Breaking disability news, centering lived experience.</p>
  <a href="https://x.com/emilypot_">Follow on X →</a>
  <details>
    <summary>See all featured community members (4 more)</summary>
    <!-- Other 4 profiles here -->
  </details>
  <a href="/community-spotlight/">View full directory →</a>
</div>
```

---

## Page 2: Accessibility (/accessibility) - HIGH PRIORITY

### Current State Analysis

**Word Count:** ~2,100 words  
**Estimated Reading Time:** 9-10 minutes  
**Cognitive Load:** HIGH ⚠️  
**Energy Cost:** 🔋🔋🔋🔋 (4/5 - Tiring)

### Problems Identified

1. **Massive WCAG compliance checklists** expanded by default (600+ words)
2. **Redundant "what we've tested" section** (could be in audit report)
3. **Known limitations section** too detailed for overview page
4. **Three separate compliance badge sections** creating visual clutter

### Content Breakdown

| Section | Words | Action | New Location |
|---------|-------|--------|--------------|
| Hero + Quick Summary | 180 | ✅ Keep | - |
| Table of Contents | 80 | ✅ Keep | - |
| Our Commitment | 160 | ✅ Keep | - |
| Accessibility Goals | 140 | ✅ Keep | - |
| Features Overview | 120 | ✅ Keep with links | Link to `/user-guide/` |
| Compliance Status Badges | 140 | ✅ Keep | - |
| WCAG 2.2 Checklists (4 details boxes) | 800 | 💡 Collapsed by default | Use `<details closed>` |
| What We've Tested | 180 | 📄 Move | `/accessibility-audit/` |
| W3C Standards | 160 | 💡 Collapse | `<details>` |
| Known Limitations | 240 | 💡 Collapse | `<details>` |
| In Progress Timeline | 100 | ✅ Keep | - |
| Feedback & Support | 140 | ✅ Keep | - |
| Standards & Guidelines | 80 | ✅ Keep | - |
| Recent/Upcoming Improvements | 120 | ✅ Keep | - |
| Related Pages | 60 | ✅ Keep | - |

### Recommended Changes

#### 1. Collapse WCAG Checklists by Default
**BEFORE:**
```markdown
<details>
<summary><strong>Perceivable (25 criteria) - 100% compliant</strong></summary>
[800 words of detailed criteria expanded by default]
</details>
```

**AFTER:**
```markdown
<details class="wcag-checklist">
  <summary>
    <strong>Perceivable (25 criteria) - 100% compliant ✅</strong>
    <span class="details-hint">Click to see all 25 criteria</span>
  </summary>
  <div class="checklist-content">
    [Same 800 words, but collapsed until user requests]
  </div>
</details>
```

#### 2. Create Simplified Summary Box
```markdown
<div class="accessibility-tldr">
  <h3>⚡ Quick Facts (30 seconds)</h3>
  <ul>
    <li>✅ WCAG 2.2 Level AAA compliant (highest standard)</li>
    <li>✅ 0 accessibility violations found</li>
    <li>✅ Works with all major screen readers</li>
    <li>✅ Full keyboard navigation</li>
    <li>✅ High contrast & dyslexia modes</li>
    <li>📊 Last audited: November 2025</li>
  </ul>
  <p><strong>Need details?</strong> Expand sections below or <a href="/accessibility-audit/">read full audit report</a></p>
</div>
```

#### 3. Complexity Mode Toggle

Add button at top:
```html
<div class="complexity-toggle">
  <button id="toggleSimpleMode" class="btn-toggle">
    <span id="modeIcon">🧠</span>
    <span id="modeText">Switch to Simple Mode</span>
  </button>
  <p class="mode-description">
    <strong>Simple Mode:</strong> Shows only essential info (400 words, 2 min read)<br>
    <strong>Detailed Mode:</strong> Full compliance documentation (2,100 words, 9 min read)
  </p>
</div>

<script>
// Toggle between modes
document.getElementById('toggleSimpleMode').addEventListener('click', function() {
  document.body.classList.toggle('simple-mode');
  const isSimple = document.body.classList.contains('simple-mode');
  
  if (isSimple) {
    document.getElementById('modeText').textContent = 'Switch to Detailed Mode';
    document.getElementById('modeIcon').textContent = '📊';
    // Collapse all details elements
    document.querySelectorAll('details').forEach(d => d.removeAttribute('open'));
  } else {
    document.getElementById('modeText').textContent = 'Switch to Simple Mode';
    document.getElementById('modeIcon').textContent = '🧠';
  }
  
  // Save preference
  localStorage.setItem('accessibilityMode', isSimple ? 'simple' : 'detailed');
});

// Load saved preference
if (localStorage.getItem('accessibilityMode') === 'simple') {
  document.getElementById('toggleSimpleMode').click();
}
</script>

<style>
/* Hide detailed sections in simple mode */
.simple-mode .wcag-checklist,
.simple-mode .known-limitations,
.simple-mode .w3c-standards-detail {
  display: none;
}

.simple-mode::before {
  content: "🧠 Simple Mode Active - Showing essential info only";
  display: block;
  background: #dbeafe;
  padding: 1rem;
  border-left: 4px solid #3b82f6;
  margin-bottom: 2rem;
  border-radius: 4px;
}
</style>
```

---

## Page 3: About (about.md) - MEDIUM PRIORITY

### Current State Analysis

**Word Count:** ~1,240 words  
**Target:** 1,000 words  
**Overage:** +240 words (24%)  
**Cognitive Load:** MEDIUM ⚠️  
**Energy Cost:** 🔋🔋🔋 (3/5 - Manageable)

### Problems Identified

1. **USA Lite section** is lengthy (180 words) - could be collapsed
2. **Founder bio** duplicated from homepage
3. **Injured Workers Unite** table is detailed (could be linked instead)

### Recommended Changes

#### 1. Collapse USA Lite Details
**BEFORE (180 words visible):**
```markdown
### 🇺🇸 USA Lite Now Available!

Following the demo, we're thrilled to welcome American users with **USA Lite** — a streamlined version for US supporters:

- ✅ **Full Wellness Tools** - Energy tracking, mood, pacing partner AI
- ✅ **Community Access** - Connect with the disability rights movement
[... 8 more bullet points]
```

**AFTER (60 words visible):**
```markdown
### 🇺🇸 USA Lite Now Available!

Following our December 2025 demo, American users can now access core 3mpwr features!

<details>
  <summary><strong>See what's included in USA Lite</strong> (7 feature categories)</summary>
  
- ✅ **Full Wellness Tools** - Energy tracking, mood, pacing partner AI
- ✅ **Community Access** - Connect with disability rights movement
[... rest of content]
</details>

<a href="/roadmap#usa-lite">Full USA Lite details →</a>
```

**Savings:** 120 words

#### 2. Simplify Injured Workers Unite Section
**BEFORE (Table + descriptions = 200 words):**
```markdown
| Feature | Description |
|---------|-------------|
| 👁️ **The Eye Oracle** | Incorruptible evidence-driven intelligence. 11 Rabbit Holes, Daily Reports, Legal Framework. |
[... 6 more rows]
```

**AFTER (60 words):**
```markdown
Beyond 3mpwrApp, founder Lissa Beaulieu runs **[Injured Workers Unite](https://injuredworkersunite.pages.dev/)** — a grassroots activist platform featuring 24/7 monitoring, evidence tracking, and creative resistance through the Memetic Embassy.

<details>
  <summary>See all Injured Workers Unite features</summary>
  [Full table here]
</details>
```

**Savings:** 140 words

#### Total Reduction: ~260 words → **Final: ~980 words ✅**

---

## Page 4: Features (features/index.md) - LOW PRIORITY

### Current State Analysis

**Word Count:** ~850 words  
**Cognitive Load:** LOW ✅  
**Energy Cost:** 🔋🔋 (2/5 - Light)

### Why This Page Works Well

1. ✅ **Scannable table** for Complexity Modes comparison
2. ✅ **Progressive disclosure** through links to User Guide
3. ✅ **Categorized sections** with clear headings
4. ✅ **Minimal redundancy** - links instead of duplicating content

### Recommendations

**NO major changes needed.** This page is a model for the others!

Minor tweaks:
- Add "estimated reading time" to each hub section
- Consider adding energy cost icons (🔋) to each category
- Add a "Simple Language" toggle for technical terms

---

## Complexity Mode Toggle Implementation

### Concept: Site-Wide Complexity Switcher

Add to every page (in header or sidebar):

```html
<div class="complexity-mode-switcher" role="region" aria-label="Content complexity controls">
  <h3>📊 Content Complexity</h3>
  <div class="mode-options">
    <button class="mode-btn" data-mode="simple" aria-pressed="false">
      <span class="mode-icon">🧠</span>
      <span class="mode-label">Simple</span>
      <span class="mode-desc">400-800 words</span>
    </button>
    <button class="mode-btn active" data-mode="standard" aria-pressed="true">
      <span class="mode-icon">📖</span>
      <span class="mode-label">Standard</span>
      <span class="mode-desc">800-1200 words</span>
    </button>
    <button class="mode-btn" data-mode="detailed" aria-pressed="false">
      <span class="mode-icon">🔬</span>
      <span class="mode-label">Detailed</span>
      <span class="mode-desc">Full content</span>
    </button>
  </div>
  <p class="mode-status" aria-live="polite">
    Currently showing: <strong>Standard Mode</strong>
  </p>
</div>

<script>
(function() {
  const savedMode = localStorage.getItem('contentComplexity') || 'standard';
  document.body.setAttribute('data-complexity', savedMode);
  
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const mode = this.getAttribute('data-mode');
      
      // Update UI
      document.querySelectorAll('.mode-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');
      
      // Apply mode
      document.body.setAttribute('data-complexity', mode);
      localStorage.setItem('contentComplexity', mode);
      
      // Update status
      const labels = {simple: 'Simple', standard: 'Standard', detailed: 'Detailed'};
      document.querySelector('.mode-status strong').textContent = labels[mode] + ' Mode';
      
      // Optional: Track in analytics (privacy-preserving)
      if (window.plausible) {
        plausible('Complexity Mode Changed', {props: {mode: mode}});
      }
    });
    
    if (btn.getAttribute('data-mode') === savedMode) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    }
  });
})();
</script>

<style>
/* Hide content based on complexity mode */
body[data-complexity="simple"] .complexity-standard,
body[data-complexity="simple"] .complexity-detailed,
body[data-complexity="standard"] .complexity-detailed {
  display: none !important;
}

/* Show simplified versions in simple mode */
body[data-complexity="simple"] .simple-version {
  display: block !important;
}

body:not([data-complexity="simple"]) .simple-version {
  display: none !important;
}

/* Visual indicator */
body[data-complexity="simple"]::before {
  content: "🧠 Simple Mode Active - Showing essential content only";
  display: block;
  background: #dbeafe;
  color: #1e40af;
  padding: 0.75rem 1rem;
  text-align: center;
  font-weight: 600;
  border-bottom: 3px solid #3b82f6;
}

/* Mode switcher styling */
.complexity-mode-switcher {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid #6366f1;
}

.mode-options {
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.mode-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.mode-btn:hover {
  border-color: #6366f1;
  background: #f9fafb;
}

.mode-btn.active {
  border-color: #6366f1;
  background: #eef2ff;
  font-weight: 600;
}

.mode-icon {
  font-size: 1.5rem;
}

.mode-label {
  font-size: 0.95rem;
  font-weight: 600;
}

.mode-desc {
  font-size: 0.75rem;
  color: #6b7280;
}

.mode-status {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #4b5563;
}

/* Responsive */
@media (max-width: 640px) {
  .mode-options {
    flex-direction: column;
  }
  .mode-btn {
    flex-direction: row;
    justify-content: flex-start;
  }
}
</style>
```

### Content Marking Strategy

Mark content sections with classes:

```html
<!-- Essential content - shown in all modes -->
<div class="content-block">
  <h2>Why 3mpwr?</h2>
  <p>Core value proposition here...</p>
</div>

<!-- Standard mode and above -->
<div class="content-block complexity-standard">
  <h3>Detailed Feature Comparison</h3>
  <p>More detailed explanation...</p>
</div>

<!-- Detailed mode only -->
<div class="content-block complexity-detailed">
  <h3>Technical Implementation Details</h3>
  <p>Deep dive into architecture...</p>
</div>

<!-- Simple mode alternative -->
<div class="simple-version">
  <div class="simple-summary">
    <h3>Quick Summary</h3>
    <ul>
      <li>3mpwr is free forever</li>
      <li>Built for disabled people by disabled people</li>
      <li>Privacy-first, no data mining</li>
    </ul>
  </div>
</div>
```

---

## Simple Language Rewrites

### Technical Terms → Plain Language

Create toggleable tooltips for all jargon:

```html
<span class="tooltip-term" data-simple="Legal language that's hard to understand">
  legalese
  <span class="tooltip-definition">Legal language that's hard to understand</span>
</span>
```

### Key Sections Rewritten

#### BEFORE (Technical):
```markdown
"3mpwrApp provides the tools, resources, and connections you need to navigate 
systems, advocate for change, and build the inclusive world we all deserve."
```

#### AFTER (Simple):
```markdown
"3mpwr helps you:
• Find support
• Understand your rights
• Get your benefits
• Connect with people like you"
```

#### BEFORE (Legal):
```markdown
"We are committed to meeting the requirements of the Accessible Canada Act (ACA), 
Accessibility for Ontarians with Disabilities Act (AODA), and provincial 
accessibility legislation across Canada."
```

#### AFTER (Simple):
```markdown
"We follow Canadian accessibility laws:
• Federal law (Accessible Canada Act)
• Ontario law (AODA)  
• Provincial laws

This means our website works for everyone."
```

### Simple Language Toggle Button

```html
<button id="simpleLangToggle" class="lang-toggle">
  <span class="toggle-icon">💡</span>
  <span class="toggle-text">Use Simple Language</span>
</button>

<script>
document.getElementById('simpleLangToggle').addEventListener('click', function() {
  document.body.classList.toggle('simple-language');
  const isSimple = document.body.classList.contains('simple-language');
  
  this.querySelector('.toggle-text').textContent = 
    isSimple ? 'Use Standard Language' : 'Use Simple Language';
  
  localStorage.setItem('simpleLanguage', isSimple);
});

// Auto-apply saved preference
if (localStorage.getItem('simpleLanguage') === 'true') {
  document.getElementById('simpleLangToggle').click();
}
</script>

<style>
/* Hide technical version in simple language mode */
.simple-language .technical-version {
  display: none;
}

/* Show simple version */
.simple-language .simple-version {
  display: block;
}

:not(.simple-language) .simple-version {
  display: none;
}
</style>
```

---

## Progressive Disclosure Best Practices

### 1. Details/Summary Elements

**Always include:**
- Word count or time estimate in summary
- Clear action verb ("Click to see...", "Expand for...")
- Visual indicator of expanded state

```html
<details class="disclosure-box">
  <summary>
    <span class="summary-icon" aria-hidden="true">📋</span>
    <strong>WCAG 2.2 Full Checklist</strong>
    <span class="summary-meta">(79 criteria, 3 min read)</span>
    <span class="summary-arrow" aria-hidden="true">▼</span>
  </summary>
  <div class="details-content">
    <!-- Content here -->
  </div>
</details>

<style>
details .summary-arrow {
  transition: transform 0.2s;
}

details[open] .summary-arrow {
  transform: rotate(180deg);
}

.disclosure-box {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.disclosure-box summary {
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.disclosure-box summary:hover {
  color: #6366f1;
}

.summary-meta {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: normal;
  margin-left: auto;
}

.details-content {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>
```

### 2. Accordion Pattern for Multiple Sections

```html
<div class="accordion">
  <div class="accordion-item">
    <button class="accordion-trigger" aria-expanded="false" aria-controls="panel-1">
      <span class="accordion-title">Visual Accessibility</span>
      <span class="accordion-meta">7 features</span>
      <span class="accordion-icon" aria-hidden="true">+</span>
    </button>
    <div id="panel-1" class="accordion-panel" hidden>
      <!-- Content -->
    </div>
  </div>
  <!-- More items -->
</div>

<script>
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', function() {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    const panel = document.getElementById(this.getAttribute('aria-controls'));
    
    this.setAttribute('aria-expanded', !expanded);
    panel.hidden = expanded;
    this.querySelector('.accordion-icon').textContent = expanded ? '+' : '−';
  });
});
</script>
```

### 3. "Show More" Truncation

For long lists:

```html
<ul class="truncated-list" data-max="5">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
  <li>Item 4</li>
  <li>Item 5</li>
  <li class="hidden-item">Item 6</li>
  <li class="hidden-item">Item 7</li>
  <li class="hidden-item">Item 8</li>
</ul>
<button class="show-more-btn" data-target=".hidden-item">
  Show 3 more items
</button>

<script>
document.querySelectorAll('.show-more-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const items = document.querySelectorAll(this.getAttribute('data-target'));
    items.forEach(item => item.classList.remove('hidden-item'));
    this.remove();
  });
});
</script>
```

---

## Measurement & Success Criteria

### How to Measure Success

1. **Word Count Targets**
   - Homepage: ≤ 800 words visible by default
   - About: ≤ 1,000 words visible by default
   - Accessibility: ≤ 1,200 words visible by default

2. **User Metrics** (via privacy-preserving analytics)
   - % of users who enable Simple Mode
   - Average time on page (should decrease)
   - Bounce rate (should decrease)
   - Scroll depth (should be shallower)

3. **Cognitive Load Indicators**
   - Reading grade level (target: Grade 8 or lower for Simple Mode)
   - Sentence length (target: ≤ 20 words average)
   - Paragraph length (target: ≤ 4 sentences)

4. **Accessibility Metrics**
   - Screen reader user session length
   - Keyboard-only navigation completion rate
   - Feature discovery (are users finding what they need?)

### Testing Tools

```bash
# Word count verification
wc -w index.md about.md /accessibility

# Reading level (Flesch-Kincaid)
textstat index.md

# Link checker
lychee **/*.md

# Accessibility scanner
pa11y https://3mpwrapp.ca/
```

---

## Implementation Timeline

### Phase 1: Critical (Week 1-2)
- [ ] Homepage restructuring
  - [ ] Move accessibility toolbar docs to `/accessibility-settings/`
  - [ ] Collapse community carousel to 1 featured + details
  - [ ] Simplify events banner display
  - [ ] Move full founder bio to about page
  - [ ] Create `/homepage-full/` for detailed mode
- [ ] Add Complexity Mode toggle to site header
- [ ] Implement localStorage persistence

**Target Completion:** January 29, 2026

### Phase 2: High Priority (Week 3-4)
- [ ] Accessibility page optimization
  - [ ] Collapse WCAG checklists by default
  - [ ] Move "what we tested" to audit report
  - [ ] Add simple mode toggle
  - [ ] Create TL;DR summary box
- [ ] Create simple language toggle
- [ ] Rewrite 20 most common sections in plain language

**Target Completion:** February 12, 2026

### Phase 3: Medium Priority (Week 5-6)
- [ ] About page minor optimizations
  - [ ] Collapse USA Lite details
  - [ ] Simplify Injured Workers Unite section
- [ ] Add energy cost icons to all pages
- [ ] Create reading time estimates

**Target Completion:** February 26, 2026

### Phase 4: Polish & Testing (Week 7-8)
- [ ] User testing with target audience
- [ ] A/B test simple vs. standard mode
- [ ] Gather feedback on complexity toggle
- [ ] Measure word count compliance
- [ ] Document patterns for future pages

**Target Completion:** March 12, 2026

---

## Code Examples Library

### 1. TL;DR Box Component

```html
<div class="tldr-box" role="complementary" aria-labelledby="tldr-heading">
  <h3 id="tldr-heading">
    <span class="tldr-icon" aria-hidden="true">⚡</span>
    Quick Summary
    <span class="tldr-time">(30 seconds)</span>
  </h3>
  <div class="tldr-content">
    <ul class="tldr-list">
      <li class="tldr-item">
        <span class="tldr-emoji" aria-hidden="true">💚</span>
        <strong>100% Free Forever</strong> - No subscriptions, no hidden costs
      </li>
      <!-- More items -->
    </ul>
  </div>
  <button class="tldr-expand" aria-expanded="false">
    Read full page (12 min) →
  </button>
</div>

<style>
.tldr-box {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 4px solid #3b82f6;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
}

.tldr-heading {
  margin: 0 0 1rem;
  color: #1e40af;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tldr-time {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: normal;
}

.tldr-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.tldr-item {
  display: flex;
  align-items: start;
  gap: 0.75rem;
}

.tldr-emoji {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.tldr-expand {
  margin-top: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.tldr-expand:hover {
  background: #2563eb;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tldr-box {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    color: #f0f9ff;
  }
  
  .tldr-heading {
    color: #bfdbfe;
  }
}
</style>
```

### 2. Energy Cost Badge

```html
<span class="energy-badge" data-energy="2" role="img" aria-label="Energy cost: Light - 2 out of 5">
  <span class="energy-icon" aria-hidden="true">🔋🔋</span>
  <span class="energy-label">Light</span>
</span>

<style>
.energy-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0fdf4;
  color: #166534;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #bbf7d0;
}

.energy-badge[data-energy="1"] {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.energy-badge[data-energy="2"] {
  background: #ecfeff;
  color: #0e7490;
  border-color: #a5f3fc;
}

.energy-badge[data-energy="3"] {
  background: #fef9c3;
  color: #854d0e;
  border-color: #fde047;
}

.energy-badge[data-energy="4"] {
  background: #ffedd5;
  color: #9a3412;
  border-color: #fdba74;
}

.energy-badge[data-energy="5"] {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fca5a5;
}
</style>
```

### 3. Reading Progress Indicator

```html
<div class="reading-progress" role="progressbar" aria-label="Reading progress" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar"></div>
  <div class="progress-stats">
    <span id="readPercent">0%</span> read
    <span class="progress-separator">•</span>
    <span id="timeRemaining">8 min remaining</span>
  </div>
</div>

<script>
(function() {
  const progressBar = document.querySelector('.progress-bar');
  const readPercent = document.getElementById('readPercent');
  const timeRemaining = document.getElementById('timeRemaining');
  const progressContainer = document.querySelector('.reading-progress');
  
  // Calculate total reading time (assuming 200 words/min)
  const wordCount = document.body.innerText.split(/\s+/).length;
  const totalMinutes = Math.ceil(wordCount / 200);
  
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    const percent = Math.min(Math.round(scrollPercent), 100);
    progressBar.style.width = percent + '%';
    progressContainer.setAttribute('aria-valuenow', percent);
    readPercent.textContent = percent + '%';
    
    const remaining = Math.ceil(totalMinutes * (1 - scrollPercent / 100));
    timeRemaining.textContent = remaining > 0 ? remaining + ' min remaining' : 'Complete!';
  }
  
  window.addEventListener('scroll', updateProgress, {passive: true});
  updateProgress(); // Initial call
})();
</script>

<style>
.reading-progress {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 2px solid #e5e7eb;
  padding: 0.5rem 1rem;
}

.progress-bar {
  height: 4px;
  background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
  width: 0%;
  transition: width 0.1s ease-out;
  border-radius: 2px;
}

.progress-stats {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #6b7280;
  text-align: center;
}

.progress-separator {
  margin: 0 0.5rem;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .progress-bar {
    transition: none;
  }
}
</style>
```

---

## Monitoring & Iteration

### Monthly Review Checklist

- [ ] Verify word counts still within targets
- [ ] Check Simple Mode usage rate
- [ ] Review user feedback on complexity
- [ ] Update reading times if content changes
- [ ] Test with screen readers
- [ ] Validate with cognitive accessibility users

### Key Performance Indicators (KPIs)

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Homepage word count | 2,850 | ≤ 800 | `wc -w index.md` |
| Accessibility word count | 2,100 | ≤ 1,200 | `wc -w /accessibility` |
| About word count | 1,240 | ≤ 1,000 | `wc -w about.md` |
| Avg. reading time (homepage) | 12 min | ≤ 4 min | Analytics |
| Simple mode adoption | N/A | ≥ 25% | localStorage tracking |
| Page completion rate | N/A | ≥ 60% | Scroll depth analytics |
| Bounce rate | N/A | ≤ 40% | Analytics |

### Continuous Improvement

1. **Quarterly User Testing**
   - Recruit 5 users with cognitive disabilities
   - Test both Simple and Detailed modes
   - Gather qualitative feedback

2. **A/B Testing Plan**
   - Test different TL;DR box placements
   - Compare collapsed vs. expanded default states
   - Measure impact of energy cost badges

3. **Analytics Implementation** (Privacy-Preserving)
   ```javascript
   // Track mode changes without PII
   function trackModeChange(mode) {
     if (window.plausible) {
       plausible('Complexity Mode', {
         props: {
           mode: mode,
           page: window.location.pathname
         }
       });
     }
   }
   ```

---

## Appendix: Additional Resources

### Plain Language Guidelines
- [PlainLanguage.gov](https://www.plainlanguage.gov/)
- [Hemingway Editor](https://hemingwayapp.com/) - Check readability
- [Readable](https://readable.com/) - Reading level analysis

### Cognitive Accessibility Standards
- [WCAG 2.2 - Guideline 3.1 Readable](https://www.w3.org/WAI/WCAG22/Understanding/reading-level)
- [Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/)
- [W3C Cognitive Accessibility Task Force](https://www.w3.org/WAI/GL/task-forces/coga/)

### Testing Tools
- **Word Count:** `wc -w filename.md`
- **Reading Level:** [readable.com](https://readable.com/)
- **Accessibility:** `pa11y`, `axe-core`
- **User Testing:** [UserTesting.com](https://www.usertesting.com/)

### Internal Documentation
- [User Guide - Accessibility Features](/user-guide/#accessibility-features)
- [Accessibility Statement](/accessibility)
- [Accessibility Settings](/accessibility-settings/)
- [WCAG Compliance Checklist](/WCAG-COMPLIANCE-CHECKLIST.md)

---

## Conclusion

### Summary of Recommendations

1. **CRITICAL - Homepage (index.md)**
   - Reduce from 2,850 to ~800 words visible
   - Move 2,000+ words to progressive disclosure
   - Create `/homepage-full/` for detailed mode

2. **HIGH - Accessibility (/accessibility)**
   - Reduce from 2,100 to ~1,200 words visible
   - Collapse WCAG checklists by default
   - Add Complexity Mode toggle

3. **MEDIUM - About (about.md)**
   - Reduce from 1,240 to ~980 words visible
   - Collapse USA Lite and IWU sections

4. **Site-Wide**
   - Implement Complexity Mode switcher
   - Add Simple Language toggle
   - Create TL;DR boxes for all major pages
   - Add energy cost badges
   - Implement reading progress indicators

### Expected Outcomes

✅ **Reduced cognitive load** for users with brain fog, fatigue, cognitive disabilities  
✅ **Faster information finding** through better organization  
✅ **Maintained comprehensiveness** - all info still available, just better structured  
✅ **User empowerment** through choice (Simple vs. Detailed mode)  
✅ **Improved accessibility** beyond WCAG AAA compliance  

### Next Steps

1. **Immediate:** Review and approve this plan
2. **Week 1:** Begin homepage restructuring
3. **Week 2:** Implement Complexity Mode toggle
4. **Week 3-4:** Optimize Accessibility page
5. **Week 5-6:** Polish About page
6. **Week 7-8:** User testing and refinement

**Questions or feedback?** Contact the accessibility team at empowrapp08162025@gmail.com

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2026  
**Next Review:** February 15, 2026  
**Owner:** Accessibility Team  
**Status:** Ready for Implementation 🚀
