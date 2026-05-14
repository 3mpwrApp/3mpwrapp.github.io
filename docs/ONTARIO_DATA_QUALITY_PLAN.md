# Ontario Data Quality & Knowledge Base Expansion Plan
**3mpwrApp CanLII Intelligence System — Complete Verification & Enhancement**

**Plan Created:** May 13, 2026  
**Timeline:** 2-3 weeks (sustainable pace for injured worker context)  
**Focus:** Data accuracy, authentic voice, citation infrastructure  
**Mission:** Everything feeds the 3mpwrApp flywheel

---

## 🎯 Plan Overview

This plan ensures every piece of Ontario tribunal data, every knowledge base guide, every blog post, and every visualization is **accurate, professional, and authentic** — speaking as an independent injured worker with permanent disabilities to our core audience: injured workers, advocates, and the disability community.

### Core Principle: The Flywheel

```
CanLII Data Collection
    ↓
Tribunal Analysis (WSIAT, ONSBT, WSIB, HRTO, ONCA, OLRB)
    ↓
Knowledge Base Guides (Evidence-Based, Cited)
    ↓
Appeal Templates & Toolkits
    ↓
Visualizations (Outcome Networks, Heatmaps)
    ↓
App Features (Case Law Search, Prediction, Guidance)
    ↓
Community Trust → More Data → Better Intelligence
    ↓
REPEAT (Flywheel Effect)
```

Every component must be accurate and authentic to maintain trust and effectiveness.

---

## 📋 Implementation Phases

### **Phase 1: Data Verification & Blog Audit (Week 1)**

#### 1.1 Tribunal Data Accuracy Verification
**Goal:** Ensure all 5 Ontario tribunal datasets are production-ready

| Tribunal | Files to Verify | Status Check | Blog Post |
|----------|----------------|--------------|-----------|
| **WSIAT** | onwsiat-historical-20260404.json (4,232 records) | ✅ FIXED May 13 | blog-post-snippet.md |
| **ONSBT** | onsbt-2020-2026-consolidated-with-recovered-outcomes.json (13,798) | ✅ READY | ontario-social-tribunals-blog-snippet.md |
| **ONWSIB** | onwsib-2024-2026-complete.json, onwsib-2025-complete.json, onwsib-2026-complete.json | ⚠️ VERIFY | ontario-social-tribunals-blog-snippet.md |
| **HRTO** | Files exist? Coverage? | ⚠️ VERIFY | Need blog post |
| **ONCA** | Files exist? Coverage? | ⚠️ VERIFY | Need blog post |
| **OLRB** | Files exist? Missing 2025-2026 | ⚠️ VERIFY | Need blog post |

**Actions:**
- [ ] Sample validate WSIAT URLs/dates work (post May 13 fix)
- [ ] Verify ONSBT integrity (should be 13,798 records, not 14,298 from old blog)
- [ ] Audit ONWSIB coverage gaps (2020-2023 missing confirmed?)
- [ ] Identify HRTO dataset files and coverage period
- [ ] Identify ONCA dataset files and coverage period  
- [ ] Identify OLRB dataset files and coverage period
- [ ] Create data inventory spreadsheet with record counts, date ranges, integrity scores

#### 1.2 Blog Post Accuracy & Voice Audit
**Goal:** Every blog speaks as independent injured worker with permanent disabilities — professional, evidence-based, relatable

**Existing Blogs to Audit:**
1. **WSIAT Blog** ([blog-post-snippet.md](d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\data\comprehensive-extraction\blog-post-snippet.md))
   - [x] Data snapshot date added (May 13 fix)
   - [x] Methodology disclaimer added (May 13 fix)
   - [ ] **Voice check:** Does it speak as injured worker, not academic researcher?
   - [ ] **Stats accuracy:** Verify 11,430 cases, 77% unclear, 89.1% win rate
   - [ ] **Citation check:** Link to source files, methodology docs

2. **ONSBT/ONWSIB Blog** ([ontario-social-tribunals-blog-snippet.md](d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\docs\ontario-social-tribunals-blog-snippet.md))
   - [x] Data snapshot date added (May 13 fix)
   - [x] Methodology disclaimer added (May 13 fix)
   - [ ] **Voice check:** Authentic injured worker perspective?
   - [ ] **Stats accuracy:** Claims 14,298 ONSBT but file has 13,798 — fix discrepancy
   - [ ] **ONWSIB section:** Verify 463 cases, 95.7% unresolved claim
   - [ ] **Citation check:** Link to data sources

**New Blogs Needed:**
3. **HRTO Blog** (Human Rights Tribunal of Ontario)
   - [ ] Draft blog post covering HRTO data scope
   - [ ] Outcome analysis (likely 90%+ unclear from aggregate data)
   - [ ] Connect to disability rights theme (AODA, OHRC)
   - [ ] Voice: Independent disabled person navigating HR system

4. **ONCA Blog** (Ontario Court of Appeal)
   - [ ] Draft blog post covering ONCA appellate decisions
   - [ ] Outcome analysis (likely 90%+ unclear without full text)
   - [ ] Connect to precedent-setting cases theme
   - [ ] Voice: Injured worker understanding how WSIAT gets overturned

5. **OLRB Blog** (Ontario Labour Relations Board)
   - [ ] Draft blog post covering OLRB data
   - [ ] Note 2025-2026 gap, explain why (data collection incomplete)
   - [ ] Connect to wrongful termination, union protection themes
   - [ ] Voice: Worker facing retaliation for claiming injury

**Voice Guidelines for All Blogs:**
- ✅ **DO:** Write as "we" (injured workers collective), "I" (personal experience context), "you" (direct address)
- ✅ **DO:** Acknowledge limitations transparently ("This is what we can see from the data...")
- ✅ **DO:** Use plain language, define legal jargon immediately
- ✅ **DO:** Share why this matters ("When WSIB denies your claim, knowing tribunal patterns helps...")
- ❌ **DON'T:** Academic/clinical tone ("The data demonstrates a statistically significant...")
- ❌ **DON'T:** Legal authority voice ("Pursuant to the Act...")
- ❌ **DON'T:** Tech bro enthusiasm ("We crushed this analysis!")
- ❌ **DON'T:** Hide limitations or oversell data quality

**Example Voice Transformation:**
❌ Before: "Analysis of 11,430 WSIAT tribunal decisions reveals outcome classification challenges."  
✅ After: "We analyzed 11,430 WSIAT decisions hoping to help injured workers understand their chances. What we found: 77% of decisions are so unclear even *we* can't tell who won. This isn't a data problem — it's what injured workers face every day trying to understand tribunal precedents."

---

### **Phase 2: Knowledge Base Guide Reconciliation (Week 1-2)**

#### 2.1 Add Missing 10 Guides to TypeScript Interface

**Current State:**
- ✅ Markdown files exist for ALL 10 guides
- ❌ TypeScript wsibKnowledgeBase.ts only has 6 injury guides + toolkits
- ❌ App can't display the guides without TypeScript entries

**Missing Guides to Add:**
1. **knee-injury-claims.md** → Add to WSIB_GUIDES array
2. **shoulder-rotator-cuff-claims.md** → Add to WSIB_GUIDES array
3. **ankle-injury-claims.md** → Add to WSIB_GUIDES array
4. **elbow-epicondylitis-claims.md** → Add to WSIB_GUIDES array
5. **wrist-carpal-tunnel-claims.md** → Add to WSIB_GUIDES array
6. **hearing-loss-claims.md** → Add to WSIB_GUIDES array
7. **concussion-tbi-claims.md** → Add to WSIB_GUIDES array
8. **neck-whiplash-claims.md** → Add to WSIB_GUIDES array
9. **claim-suppression-retaliation.md** → Add to WSIB_GUIDES array
10. **bill-86-meredith-act.md** → Add to WSIB_GUIDES array (policy guide, not injury)

**For Each Guide Entry:**
1. Read markdown file to extract:
   - Case count mentioned in content
   - Prevalence calculation (cases / 11,430 WSIAT total)
   - Difficulty assessment (easy/moderate/hard/very-hard)
   - Common denial reasons listed
   - Key topics covered

2. Add TypeScript entry following this pattern:
```typescript
{
  id: 'knee-injury',
  title: 'Understanding Knee Injury Claims at WSIB',
  shortTitle: 'Knee Injuries',
  description: '[X] cases analyzed ([Y]% of appeals). Learn how to prove work-relatedness for meniscus tears, ligament damage, and chronic knee pain.',
  emoji: '🦵',
  casesAnalyzed: [actual count from keyword analysis],
  prevalence: [percentage],
  difficulty: 'moderate',
  readingTime: [estimated minutes],
  webUrl: 'https://3mpwrapp.pages.dev/knowledge-base/knee-injury-claims/',
  localPath: 'knowledge-base/knee-injury-claims.md',
  templateId: 'knee-injury-appeal',
  topics: [extract from markdown],
  commonDenials: [extract from markdown]
}
```

#### 2.2 Guide Content Accuracy Verification

**For Each of 22 Markdown Guides, Verify:**

1. **Case Count Accuracy**
   - [ ] Run keyword search on WSIAT data: `node scripts/count-keyword-frequency.js`
   - [ ] Compare markdown claim vs actual tribunal data
   - [ ] Update if discrepancy found (like low-back-pain 62% → 3.4% error)

2. **Statistics Disclosure**
   - [ ] Every guide header includes: "Based on [X] cases from 11,430 WSIAT decisions"
   - [ ] Every guide includes: "⚠️ Outcome classification based on keyword analysis. 77% of tribunal decisions have unclear outcomes."
   - [ ] No false prevalence claims (check every percentage)

3. **Voice Consistency**
   - [ ] Speaks as injured worker collective ("we", "our community")
   - [ ] Plain language explanations before legal terms
   - [ ] Personal context examples ("If WSIB says your knee pain is pre-existing...")
   - [ ] Acknowledges reader's exhaustion/pain ("This is a lot. Take breaks.")

4. **Practical Utility**
   - [ ] Every guide has "What WSIAT Looks For" section
   - [ ] Every guide has "Common Denials" section with counter-strategies
   - [ ] Every guide has "Red Flags to Avoid" section
   - [ ] Every guide has "Medical Evidence" section with specifics

5. **Citation Infrastructure** (see Phase 3)

#### 2.3 Template Reconciliation

**Verify Templates Referenced in Guides Actually Exist:**
- [ ] Audit `templateId` field in each guide
- [ ] Check if template files exist in app
- [ ] Create missing templates or remove broken references

---

### **Phase 3: Citation Infrastructure Expansion (Week 2)**

**Current State:** ~20% of knowledge base statements have case citations  
**Target:** ≥90% citation rate

#### 3.1 Citation Standards

**Two Types of Citations:**

**A. Data-Derived Citations** (Statistical Claims)
Every numerical claim must cite data source:

```markdown
**Low back pain appears in 390 WSIAT decisions (3.4% of 11,430 analyzed cases).**
*Source: CanLII WSIAT keyword analysis, 2020-2026 decisions, analyzed April 2026*
```

**B. Case Law Citations** (Legal Principles)
Every legal principle must cite specific tribunal decisions:

```markdown
**The "thin skull" principle means WSIB must "take you as they find you" — pre-existing conditions don't disqualify you.**
*See: Decision No. 1580/09 (2011 ONWSIAT 1580), where tribunal found worker entitled despite pre-existing degenerative spine disease. WSIB argued "natural progression" but tribunal ruled work significantly contributed to acceleration.*

[Read full decision →](https://canlii.ca/t/2d1nk)
```

#### 3.2 Implementation Strategy

**Phase 3A: Data Citations (Week 2, Days 1-3)**
- [ ] Create citation template markdown snippet
- [ ] Add data source citations to every guide's statistical claims
- [ ] Link to DATA_QUALITY_DISCLOSURE.md for methodology details
- [ ] Add "Data Sources" section to each guide footer

**Phase 3B: Case Law Citations (Week 2-3)**
- [ ] For each guide, identify 3-5 exemplar cases from WSIAT data
- [ ] Read actual tribunal decisions (full text from CanLII)
- [ ] Extract key quotes and outcomes
- [ ] Add case citations to relevant sections
- [ ] Create "Key Tribunal Decisions" section in each guide

**Phase 3C: Citation Verification Script**
- [ ] Create script: `scripts/verify-citations.js`
- [ ] Scans all markdown files for citation patterns
- [ ] Counts cited vs uncited claims
- [ ] Generates citation coverage report
- [ ] Target: 90%+ coverage before completion

---

### **Phase 4: Visualization Verification (Week 2)**

#### 4.1 Existing Visualizations Audit

**Files Found:**
1. [wsib-denial-network-visualization.html](d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\wsib-denial-network-visualization.html)
2. [connecting-the-dots-canlii-keyword-visualization-network.html](d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\connecting-the-dots-canlii-keyword-visualization-network.html)

**Verification Checklist (Each Visualization):**
- [ ] Data source accurately cited
- [ ] Data current (post-May 13 fix for WSIAT)
- [ ] Methodology explained in plain language
- [ ] Interactive elements work (hover tooltips, zoom, filters)
- [ ] Accessible color palette (colorblind-friendly)
- [ ] Mobile responsive
- [ ] Voice check: Does explanatory text sound like injured worker, not data scientist?

#### 4.2 New Visualizations Needed

**Proposed:**
1. **WSIAT Outcome Timeline** — Win rates by year (2020-2026)
2. **Pre-Existing Condition Network** — How WSIB connects conditions to deny claims
3. **Tribunal Success Rate Comparison** — WSIAT vs ONSBT vs HRTO bar chart
4. **Geographic Heatmap** — WSIB denial rates by region (if data available)

**For Each Visualization:**
- [ ] Draft design mockup
- [ ] Verify data availability
- [ ] Write injured-worker-voice explanation text
- [ ] Implement with D3.js or Chart.js
- [ ] Test accessibility (keyboard nav, screen reader labels)
- [ ] Add to knowledge base guides as supporting evidence

---

### **Phase 5: Cross-System Verification (Week 3)**

#### 5.1 Flywheel Integration Check

**Verify Every Component Connects:**

1. **CanLII Data → Knowledge Base**
   - [ ] Every guide cites specific tribunal data
   - [ ] No orphaned data files (collected but never analyzed)
   - [ ] No orphaned guides (written without data backing)

2. **Knowledge Base → Templates**
   - [ ] Every guide references applicable appeal template
   - [ ] Every template references evidence from guides
   - [ ] No broken template links

3. **Knowledge Base → Visualizations**
   - [ ] Guides link to relevant visualizations
   - [ ] Visualizations link back to detailed guides
   - [ ] Data sources match between vis and guides

4. **Knowledge Base → App Features**
   - [ ] TypeScript interfaces populated (Phase 2 completes this)
   - [ ] All markdown files accessible in app
   - [ ] Search functionality finds guides by injury type
   - [ ] Outcome prediction feature uses tribunal data

5. **App Features → Community Trust → Data Collection**
   - [ ] In-app feedback loop for error reporting (exists?)
   - [ ] Community can suggest missing guides (exists?)
   - [ ] Transparency documents build trust (completed May 13)

#### 5.2 Final Quality Checks

**Content Accuracy:**
- [ ] No false statistics remaining
- [ ] All case counts verified against actual data
- [ ] All percentages double-checked
- [ ] All URLs tested (no 404s)

**Voice Consistency:**
- [ ] All blogs sound like same injured worker author
- [ ] All guides maintain professional but relatable tone
- [ ] No academic jargon without plain language translation
- [ ] Disability rights perspective integrated (not just injury focus)

**Technical Quality:**
- [ ] All JSON files valid (no syntax errors)
- [ ] All markdown renders correctly
- [ ] All TypeScript compiles without errors
- [ ] All visualizations load on mobile

**Transparency:**
- [ ] Every data limitation disclosed
- [ ] Every methodology explained
- [ ] Every data gap acknowledged
- [ ] Update dates on all content

---

## 📊 Success Metrics

| Metric | Current | Target | Verification Method |
|--------|---------|--------|---------------------|
| **Tribunal Data Integrity** | WSIAT 95/100, ONSBT 95/100 | All tribunals ≥90/100 | Run integrity audit script |
| **Knowledge Base Completeness** | 12 guides in TypeScript | 22 guides in TypeScript | Count WSIB_GUIDES array entries |
| **Citation Coverage** | ~20% | ≥90% | Run `verify-citations.js` script |
| **Blog Post Coverage** | 2 tribunals | 5 tribunals (WSIAT, ONSBT, WSIB, HRTO, ONCA, OLRB) | Count blog files |
| **Voice Consistency** | Varies | 100% injured worker voice | Manual review + community feedback |
| **Visualization Accuracy** | Unknown | 100% data-backed | Manual verification |
| **Flywheel Integration** | Partial | 100% connected | Integration checklist complete |

---

## 🛠️ Tools & Scripts Needed

### Existing Scripts to Use:
1. `fix-wsiat-snippet-extraction.js` — Already created, already run ✅
2. `extract-outcomes-advanced.js` — Outcome classification (needs review)
3. Analysis scripts in `scripts/` folder

### New Scripts to Create:
1. **`verify-citations.js`** — Scans markdown for citation coverage percentage
2. **`count-keyword-frequency.js`** — Counts injury keywords across WSIAT data
3. **`audit-guide-stats.js`** — Cross-checks guide claims vs actual data
4. **`generate-blog-post-template.js`** — Generates injured-worker-voice blog skeleton
5. **`check-flywheel-links.js`** — Verifies all cross-references work

---

## 📅 Timeline (Sustainable Pace)

**Week 1: Data & Blog Verification**
- Days 1-2: Tribunal data inventory and accuracy checks
- Days 3-4: Blog post audit and voice consistency fixes
- Day 5: ONSBT discrepancy resolution (14,298 → 13,798)
- Weekend: Rest

**Week 2: Knowledge Base Expansion**
- Days 1-2: Add 10 missing guides to TypeScript
- Days 3-4: Guide content accuracy verification
- Day 5: Begin citation infrastructure (data sources)
- Weekend: Rest

**Week 3: Citations & Final Verification**
- Days 1-3: Case law citation expansion (targeting 90%)
- Day 4: Visualization audit and voice check
- Day 5: Flywheel integration verification
- Weekend: Final quality checks

**Week 4 Buffer:** Handle any issues discovered, community feedback integration

---

## 🎤 Voice Guidelines Reference

**Our Voice As Independent Injured Worker with Permanent Disabilities:**

✅ **We are:**
- Experienced (lived through WSIB denials)
- Evidence-based (data doesn't lie)
- Transparent (admit what we don't know)
- Supportive (we're all in this together)
- Professional (credible, careful, accurate)
- Plain-speaking (no legal BS unless necessary)

❌ **We are not:**
- Lawyers (we're workers helping workers)
- Academics (we're activists using data as a tool)
- Corporate (we're grassroots, not polished)
- Infallible (we make mistakes and fix them)

**Tone Examples:**

**Opening Hook:**
✅ "I've been through four WSIB denials. So has my friend with the crushed hand. And the guy I met at physio with the destroyed back. We all won our appeals eventually — but only after learning what WSIAT really looks for."

**Data Presentation:**
✅ "We analyzed 11,430 tribunal decisions hoping to find patterns that could help other injured workers. The results surprised us: 77% of decisions are so unclear we couldn't tell who won. If *we* can't figure it out with spreadsheets and scripts, how is an exhausted worker supposed to know?"

**Limitation Disclosure:**
✅ "Full disclosure: This analysis is based on keywords from CanLII, not full text. We're missing details. But even with limitations, this is the most comprehensive outcome analysis of recent WSIAT decisions available to injured workers."

**Call to Action:**
✅ "If you spot errors in our data or have a decision we missed, tell us. This intelligence system only works if we all contribute what we know."

---

## 🚀 Getting Started

**Immediate Next Steps (Today/Tomorrow):**

1. **Run Tribunal Data Inventory:**
   ```powershell
   cd "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main"
   node scripts/generate-data-inventory.js  # Create this if doesn't exist
   ```

2. **Count ONSBT Records (Verify Blog Claim):**
   ```powershell
   $onsbtData = Get-Content "data\tribunal-decisions\onsbt-2020-2026-consolidated-with-recovered-outcomes.json" | ConvertFrom-Json
   $onsbtData.Count  # Should be 13,798, not 14,298
   ```

3. **Read First Missing Guide:**
   - Read `knee-injury-claims.md` to understand structure
   - Extract case count, topics, denials for TypeScript entry
   - Draft TypeScript object for WSIB_GUIDES array

4. **Audit WSIAT Blog Voice:**
   - Re-read `blog-post-snippet.md`
   - Rewrite opening paragraph in injured worker voice
   - Compare before/after

---

## 💬 Questions for User Before Starting

1. **Priority Order:** Should I start with missing TypeScript guides or blog voice audit?
2. **Citation Depth:** For 90% target, do you want case citations in every guide section, or just data source citations for now?
3. **HRTO/ONCA Blogs:** These tribunals have limited outcome data (90%+ unclear). Should blogs focus on explaining *why* outcomes are unclear and what that means for workers?
4. **Voice Review:** Want me to draft a "before/after" voice comparison for one blog post so you can approve the tone before I apply it everywhere?
5. **Sustainable Pace:** 2-3 week timeline assume ~2-3 hours/day capacity. Adjust if needed.

---

**Plan Status:** READY TO EXECUTE  
**Next Action:** Awaiting user directive on priority order and any adjustments
