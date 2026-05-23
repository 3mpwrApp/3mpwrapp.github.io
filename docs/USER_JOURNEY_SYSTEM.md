# 3mpwrApp User Journey System

**Date Created:** May 23, 2026  
**Purpose:** Simplify the 1,842-page website into clear, actionable paths for 4 distinct user groups  
**Philosophy:** Progressive disclosure - show what matters, hide complexity until needed  

---

## 🎯 The 4 Core User Journeys

### **Journey 1: Injured Workers** 🏗️  
**"I just got injured and don't know what to do"**

**User Needs:**
- Immediate crisis support
- Understanding the compensation system
- Filing claim guidance
- Fighting denials
- Evidence collection
- Legal resources

**Entry Points:**
- Homepage: "Just got injured?" button
- Crisis resources banner
- Direct link from unions/community groups

**Journey Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Crisis & Immediate Support (0-7 days)              │
├─────────────────────────────────────────────────────────────┤
│ → Crisis resources (mental health, financial, medical)      │
│ → "What to do in first 24 hours" checklist                  │
│ → Employer reporting template                               │
│ → Medical documentation guide                               │
│ → Emergency contacts (community supports)                   │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Understanding the System (Week 1-4)                │
├─────────────────────────────────────────────────────────────┤
│ → Province-specific guides (WSIB/WCB/CNESST)               │
│ → Compensation basics (what you're entitled to)            │
│ → Timeline expectations (how long things take)             │
│ → Red flags (signs your claim might be denied)             │
│ → Glossary (decode the jargon)                             │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Building Your Case (Month 1-3)                     │
├─────────────────────────────────────────────────────────────┤
│ → Evidence Locker (secure document storage)                │
│ → Letter Wizard (pre-written templates)                    │
│ → Symptom tracker (chronicle your condition)               │
│ → Employer correspondence log                              │
│ → Medical evidence checklist                               │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Fighting Denials (If needed)                       │
├─────────────────────────────────────────────────────────────┤
│ → Appeal deadlines calculator                               │
│ → Tribunal decision database (find similar cases)          │
│ → Legal representation finder                              │
│ → Community support groups (you're not alone)              │
│ → Success stories (what winning looks like)                │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Long-term Support (Ongoing)                        │
├─────────────────────────────────────────────────────────────┤
│ → Wellness Hub (41+ health tools)                          │
│ → Financial resources (disability benefits)                │
│ → Retraining/education support                             │
│ → Community connection (mutual aid)                        │
│ → Advocacy opportunities (help others)                     │
└─────────────────────────────────────────────────────────────┘
```

**Key Pages for Injured Workers:**
1. `/injured-workers` (landing page - CREATE NEW)
2. `/crisis-resources` ✅ (already exists)
3. `/guides/wsib-complete-guide` ✅ (already exists)
4. `/features/evidence-locker` (link to app)
5. `/features/letter-wizard` (link to app)
6. `/research-data-sources` ✅ (tribunal database)
7. `/community` ✅ (support groups)

---

### **Journey 2: Disability Community** 🦽  
**"I'm disabled and need resources/support"**

**User Needs:**
- Accessibility resources
- Peer support
- Health management
- Advocacy tools
- Financial assistance info
- Community connection

**Entry Points:**
- Homepage: "Living with disability?" button
- Accessibility page
- Disability organization referrals

**Journey Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Discover What's Possible                           │
├─────────────────────────────────────────────────────────────┤
│ → Accessibility features tour (WCAG AAA, 6 languages)      │
│ → App demo (try it risk-free)                              │
│ → Success stories (community testimonials)                 │
│ → Feature comparison (Simple/Standard/Power modes)         │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Health & Wellness                                  │
├─────────────────────────────────────────────────────────────┤
│ → Wellness Hub (41 health tools)                           │
│   • Symptom tracking                                       │
│   • Medication reminders                                   │
│   • Chronic pain management                                │
│   • Mental health resources                                │
│ → Energy pacing tools (spoon theory)                       │
│ → Accessible exercise guides                               │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Community Connection                               │
├─────────────────────────────────────────────────────────────┤
│ → 24+ support groups (condition-specific)                  │
│ → Local events calendar                                    │
│ → Mutual aid network                                       │
│ → Peer mentorship                                          │
│ → Storytelling platform (share your experience)            │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Self-Advocacy                                      │
├─────────────────────────────────────────────────────────────┤
│ → Rights education (AODA, accessibility laws)              │
│ → Accommodation request templates                          │
│ → Disability benefits navigation                           │
│ → Employment supports                                      │
│ → Housing advocacy resources                               │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Collective Power                                   │
├─────────────────────────────────────────────────────────────┤
│ → Current campaigns (systemic change)                      │
│ → Policy advocacy tools                                    │
│ → Data for research (contribute your story)                │
│ → Volunteer opportunities                                  │
│ → Help others (pay it forward)                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Pages for Disability Community:**
1. `/disability-community` (landing page - CREATE NEW)
2. `/accessibility` ✅ (already exists)
3. `/features/wellness-hub` (link to app)
4. `/community` ✅ (support groups)
5. `/campaigns` (systemic change efforts)
6. `/resources` (benefits, housing, employment)

---

### **Journey 3: Advocates & Allies** 🤝  
**"I want to help but don't know where to start"**

**User Needs:**
- Understand the issues
- Learn how to support
- Connect with organizations
- Volunteer opportunities
- Educational resources
- Amplify voices

**Entry Points:**
- Homepage: "Want to help?" button
- About page ("Get involved" section)
- Partner organization referrals

**Journey Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Learn & Understand                                 │
├─────────────────────────────────────────────────────────────┤
│ → Why this matters (lived experience context)              │
│ → The compensation system (how it fails people)            │
│ → Data & evidence (134,920+ tribunal decisions)            │
│ → Accessibility fundamentals (how to be inclusive)         │
│ → Language guide (person-first vs. identity-first)         │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: How to Help (Pick Your Path)                       │
├─────────────────────────────────────────────────────────────┤
│ → Donate (financial support)                               │
│ → Volunteer (time & skills)                                │
│   • Content editing                                        │
│   • Development                                            │
│   • Community moderation                                   │
│   • Translation                                            │
│   • Legal review                                           │
│ → Spread the word (social media, word of mouth)            │
│ → Beta testing (stress-test before launch)                 │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Partner Organizations                              │
├─────────────────────────────────────────────────────────────┤
│ → Unions (disability committees)                           │
│ → Legal clinics (access to justice)                        │
│ → Community groups (local support)                         │
│ → Universities (research partnerships)                     │
│ → Employers (workplace inclusion)                          │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Amplify Voices                                     │
├─────────────────────────────────────────────────────────────┤
│ → Share success stories                                    │
│ → Support campaigns (policy change)                        │
│ → Advocate in your workplace                               │
│ → Educate your networks                                    │
│ → Challenge ableism when you see it                        │
└─────────────────────────────────────────────────────────────┘
```

**Key Pages for Advocates & Allies:**
1. `/advocates-allies` (landing page - CREATE NEW)
2. `/about` ✅ (mission & values)
3. `/support` ✅ (donate & volunteer)
4. `/partnerships` (organizations - CREATE NEW based on RISK-010)
5. `/campaigns` (ongoing advocacy efforts)
6. `/user-guide` ✅ (how to use the platform)

---

### **Journey 4: General Public** 🌍  
**"I'm curious but don't know much about disability issues"**

**User Needs:**
- Learn about disability justice
- Understand workers' compensation
- See the data/research
- Dispel myths
- Find entry points to help

**Entry Points:**
- Homepage: "Learn more" button
- Research & data pages
- Blog posts (when created)
- Social media links

**Journey Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: The Human Cost                                     │
├─────────────────────────────────────────────────────────────┤
│ → Real stories (injured worker experiences)                │
│ → Statistics (denial rates, system failures)               │
│ → Interactive visualizations (134,920+ cases)              │
│ → "This could be you" (anyone can become disabled)         │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: The Systemic Issues                                │
├─────────────────────────────────────────────────────────────┤
│ → How the system is rigged (policy analysis)               │
│ → Tribunal data deep-dives (patterns of discrimination)    │
│ → Economic impact (cost of inequality)                     │
│ → Intersection with race, gender, class                    │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: The Solutions                                      │
├─────────────────────────────────────────────────────────────┤
│ → Technology as empowerment (how 3mpwrApp helps)           │
│ → Community organizing (collective power)                  │
│ → Policy reforms (what needs to change)                    │
│ → Disability justice framework (core principles)           │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Take Action                                        │
├─────────────────────────────────────────────────────────────┤
│ → Share this site                                          │
│ → Support current campaigns                                │
│ → Donate to keep it free                                   │
│ → Learn more (become an ally)                              │
│ → Stay updated (newsletter, social media)                  │
└─────────────────────────────────────────────────────────────┘
```

**Key Pages for General Public:**
1. `/learn` (landing page - CREATE NEW)
2. `/research-data-sources` ✅ (tribunal database)
3. `/tribunal-visualizations` ✅ (interactive data)
4. `/about` ✅ (mission statement)
5. `/campaigns` (ways to take action)
6. `/faq` ✅ (common questions)

---

## 🏗️ Implementation Strategy

### **Phase 1: Create 4 Landing Pages** (Week 1)

**New pages to create:**
1. `/injured-workers.md` - Journey 1 entry point
2. `/disability-community.md` - Journey 2 entry point
3. `/advocates-allies.md` - Journey 3 entry point
4. `/learn.md` - Journey 4 entry point (or rename existing `/research.md`)

**Each landing page includes:**
- Hero section (who this is for)
- "Choose your path" buttons
- Quick links to most common needs
- Energy level indicators (🔋🔋🔋 = high energy, 🔋 = low energy)
- Estimated time to complete each path
- Clear next steps

---

### **Phase 2: Update Homepage** (Week 1)

**Current homepage has:**
- 3 buttons: "Join Beta", "Watch Tutorial", "Learn More"

**Proposed new homepage:**

```
┌─────────────────────────────────────────────────────────────┐
│                   3mpwrApp Logo + Tagline                   │
│        "Turning Lived Experience Into Power"                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                WHO ARE YOU? (4 big buttons)                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ 🏗️ Injured   │  │ 🦽 Disabled  │                       │
│  │   Worker     │  │   Person     │                       │
│  └──────────────┘  └──────────────┘                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ 🤝 Advocate  │  │ 🌍 Just      │                       │
│  │   /Ally      │  │   Learning   │                       │
│  └──────────────┘  └──────────────┘                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  OR...                                                      │
│  • Watch 2-min demo video                                  │
│  • Join beta testing (launching soon)                      │
│  • Explore tribunal data (134,920+ cases)                  │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- Instant clarity on who this is for
- Reduces decision paralysis (clear paths vs. open exploration)
- Still allows self-guided browsing (OR section)

---

### **Phase 3: Hide 90% of Content** (Week 2)

**Current navigation shows EVERYTHING:**
- About, Demo, Research, FAQ, Accessibility, Security, Privacy, Contact

**Proposed navigation (simplified):**

**Main Nav (always visible):**
- Home
- About
- Features (dropdown for app features)
- Research & Data
- Community
- Get Help (dropdown: Crisis, Guides, Contact)

**Footer Nav (organized by journey):**

**For Injured Workers:**
- WSIB/WCB Guides
- Tribunal Decisions
- Legal Resources
- Evidence Tools

**For Disability Community:**
- Wellness Hub
- Support Groups
- Accessibility
- Benefits Info

**For Everyone:**
- FAQ
- Privacy & Security
- Terms & Disclaimers
- Donate/Support

**Hidden from main nav (accessible via search/sitemap):**
- All 1,842 blog posts, deep-dive guides, technical docs
- Historical content, drafts, archives
- Specialized visualizations
- Developer documentation

**How to access hidden content:**
- Site search (implement)
- Sitemap page (comprehensive index)
- Direct links from relevant pages
- Google search (SEO still works)

---

### **Phase 4: Progressive Disclosure** (Week 3-4)

**Principle:** Show simple by default, reveal complexity on demand

**Example - Injured Worker Journey:**

**Page 1 (Simple):**
```
"Just Got Injured?"
┌─────────────────────────────────────┐
│ HERE'S WHAT TO DO IN 24 HOURS:     │
│ 1. ✅ Tell your employer            │
│ 2. ✅ See a doctor                  │
│ 3. ✅ Document everything           │
│ 4. ✅ Don't sign anything yet       │
│                                     │
│ [Show me details →]                 │
└─────────────────────────────────────┘
```

**Page 2 (If they click "Show me details"):**
```
Detailed Guide (2,000 words)
- Employer notification template
- Medical documentation checklist
- What NOT to say to adjusters
- Province-specific rules
- etc.

[Show advanced strategies →]
```

**Page 3 (If they click "Show advanced"):**
```
Deep-Dive Analysis
- Case law citations
- Tribunal decision patterns
- Statistical analysis
- Expert lawyer commentary
- etc.
```

**Implementation:**
- Use collapsible sections (`<details>` HTML tags)
- "Simple/Standard/Power User" toggle (already exists in app, mirror on website)
- Energy level warnings (🔋🔋🔋 = dense content, take breaks)

---

## 📊 Success Metrics

**How we'll know this is working:**

### Quantitative (via analytics):
1. **Bounce rate decreases** (users stay longer)
2. **Pages per session increases** (users explore more)
3. **Conversion rate improves** (more beta signups, donations)
4. **Time to first action decreases** (faster to "Join Beta" or "Get Help")

### Qualitative (via user feedback):
1. **"I found what I needed"** survey responses
2. **Lower support requests** ("Where do I...?")
3. **Positive testimonials** ("Finally, a site that makes sense")
4. **Higher beta tester retention** (they actually use the app)

### Operational (easier maintenance):
1. **Fewer broken links** (less surface area)
2. **Faster content updates** (know where things go)
3. **Easier onboarding** (volunteers understand structure)

---

## 🛠️ Technical Implementation

### **File Structure for Landing Pages:**

```
/injured-workers.md          # Journey 1 entry
/disability-community.md     # Journey 2 entry
/advocates-allies.md         # Journey 3 entry
/learn.md                    # Journey 4 entry (or /general-public.md)

/guides/
  /injured-workers/
    /getting-started/
    /building-case/
    /fighting-denials/
  /disability-community/
    /wellness/
    /advocacy/
    /benefits/
  /advocates/
    /volunteering/
    /partnerships/
    /campaigns/

/_includes/
  journey-nav.html          # Reusable journey navigation component
  energy-indicator.html     # 🔋 indicators
  progressive-disclosure.html  # Collapsible sections
```

### **Homepage Modification:**

Update `index.md` to add 4-button journey selector:

```html
<section class="journey-selector">
  <h2>Who Are You?</h2>
  <div class="journey-grid">
    <a href="/injured-workers" class="journey-card">
      <span class="icon">🏗️</span>
      <h3>Injured Worker</h3>
      <p>Filing a claim, fighting denials</p>
    </a>
    <a href="/disability-community" class="journey-card">
      <span class="icon">🦽</span>
      <h3>Disabled Person</h3>
      <p>Wellness, community, advocacy</p>
    </a>
    <a href="/advocates-allies" class="journey-card">
      <span class="icon">🤝</span>
      <h3>Advocate/Ally</h3>
      <p>Support, volunteer, donate</p>
    </a>
    <a href="/learn" class="journey-card">
      <span class="icon">🌍</span>
      <h3>Just Learning</h3>
      <p>Understand the issues, explore data</p>
    </a>
  </div>
</section>
```

### **Navigation Update (_config.yml):**

```yaml
header_pages:
  - about.md
  - features/index.md
  - research-data-sources.md
  - community/index.md
  - support.md  # NEW
  - contact.md
```

---

## 📅 Rollout Timeline

### **Week 1: Foundation** (May 24-31)
- [ ] Create 4 landing pages (injured-workers, disability-community, advocates-allies, learn)
- [ ] Update homepage with 4-button selector
- [ ] Add `/support` page to main navigation
- [ ] Test on mobile devices

### **Week 2: Navigation** (June 1-7)
- [ ] Simplify header navigation (remove rarely-used pages)
- [ ] Reorganize footer into journey-based sections
- [ ] Create comprehensive sitemap page (for accessing hidden content)
- [ ] Implement search functionality (simple keyword search)

### **Week 3: Progressive Disclosure** (June 8-14)
- [ ] Add collapsible sections to long guides
- [ ] Implement energy level indicators (🔋)
- [ ] Add "Simple/Standard/Power" toggle to key pages
- [ ] Create "Continue your journey" recommendations at page bottoms

### **Week 4: Validation** (June 15-21)
- [ ] Beta tester feedback on new structure
- [ ] Analytics implementation (Plausible or Fathom)
- [ ] A/B test original homepage vs. new journey selector
- [ ] Iterate based on data

---

## ✅ Quick Wins (Do Immediately)

These can be done in next 48 hours:

1. **Create `/support` page** ✅ (already done above)
2. **Add 4-button section to homepage** (modify `index.md`)
3. **Update footer** to group links by journey
4. **Hide old backup files** (move to `_archive/` folder so Jekyll ignores them)
5. **Delete temp files** (`temp-campaigns.html`, `test-render.md`, etc.)

---

## 🎯 The Goal

**Before:** "Here's 1,842 pages. Good luck finding what you need."  
**After:** "I'm an injured worker. Here are the 5 pages I need right now, and here's where to go next."

**Complexity still exists** (for power users who want it), but **it's hidden until relevant**.

---

**Questions?** Email empowrapp08162025@gmail.com
