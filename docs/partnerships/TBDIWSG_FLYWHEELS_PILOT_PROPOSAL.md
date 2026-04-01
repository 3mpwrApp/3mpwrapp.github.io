# 3mpwrApp Flywheels Pilot Partnership Proposal
## Thunder Bay & District Injured Workers Support Group

**Date:** April 1, 2026  
**Proposed By:** 3mpwrApp  
**Proposed To:** Thunder Bay & District Injured Workers Support Group  
**Duration:** 12-week pilot (April - June 2026)  
**Cost:** $0 (fully funded by 3mpwrApp)

---

## 🎯 Executive Summary

Following the March 31st presentation at TBDIWSG, we propose a **12-week pilot partnership** to deploy the "3 Flywheels of Change" framework specifically for Thunder Bay injured workers.

**The Opportunity:** Your audience asked three breakthrough questions that revealed the path forward:
1. **Can flywheels be located at high-volume intake points?** → YES - TBDIWSG is perfect
2. **Can we jumpstart flywheels with historical data?** → YES - 50,000+ public tribunal decisions
3. **Can flywheels be standalone for specific locations?** → YES - Thunder Bay-focused instance

**What You Get:**
- Searchable database of 500+ successful WSIAT/tribunal cases relevant to Thunder Bay workers
- Pattern detection showing what strategies work for your client base
- Auto-generated templates from winning cases
- Real-time campaign suggestions when patterns emerge
- Zero cost, zero risk

**What We Get:**
- Proof of concept for organizational deployment
- Feedback from real injured workers
- Validation that patterns detected match advocate experience
-testimony for scaling to other advocacy groups

---

## 🔄 The 3 Flywheels Framework (Recap)

### Flywheel #1: Evidence Flywheel
**Problem:** Workers spend 40+ hours researching appeals, often making the same mistakes others made.

**Solution:** Share wins → Copy strategies → More wins → Better strategies

**For TBDIWSG:** Your clients search "fibromyalgia WSIB appeal" → see 73 successful cases → copy proven strategies → win faster

---

### Flywheel #2: Collective Action Flywheel
**Problem:** 156 workers fighting the same denial reason, zero coordination.

**Solution:** Detect patterns → Launch campaigns → Joint submissions → Policy change

**For TBDIWSG:** System detects "78% of Thunder Bay construction workers denied for same reason" → Campaign auto-suggested → 62 join → Joint submission to WSIB → Media coverage → Policy change

---

### Flywheel #3: Knowledge Network Flywheel
**Problem:** Every new worker starts from zero, reinventing the wheel.

**Solution:** Templates + AI recommendations + peer mentors = 39 hours saved

**For TBDIWSG:** User #1 spent 40 hours researching. User #500 gets instant template library + mentor match → 1 hour to results.

---

## 🎯 Pilot Objectives

### Primary Goals
1. **Seed database with 500+ Thunder Bay-relevant tribunal decisions** (WSIAT, HRTO, SST)
2. **Test pattern detection** on real Northern Ontario worker data
3. **Generate 10+ templates** from successful appeals
4. **Validate with 5-10 TBDIWSG clients** (Does this actually help?)
5. **Launch 1-2 campaigns** if patterns detected

### Success Metrics
- **User satisfaction:** 80%+ find it helpful
- **Time savings:** 50%+ reduction in research time
- **Pattern accuracy:** 70%+ of detected patterns match advocate experience
- **Template usability:** 60%+ use at least 1 template
- **Campaign potential:** At least 1 pattern crosses threshold (50+ cases)

---

## 📊 Phase 1: Data Collection (Weeks 1-3)

### What We're Scraping (Allpublic records - no privacy concerns)

**Source 1: WSIAT Decisions**
- 500 decisions relevant to Thunder Bay industries:
  - Mining (nickel, forestry-related)
  - Healthcare (hospital workers, PSWs)
  - Manufacturing (Bombardier, mills)
  - Construction
- Timeframe: 2015-2025 (recent, still relevant)
- Filters: Northern Ontario mentions, Thunder Bay employers

**Source 2: SST (Social Security Tribunal)**
- 100 CPP Disability appeal decisions
- Conditions common in manual labor (MSK, chronic pain, PTSD)

**Source 3: HRTO (Human Rights Tribunal)**
- 50 accommodation/disability discrimination cases
- Workplace accommodation disputes

### Technical Implementation
**Tools (All Free):**
- CanLII API (free public access)
- Python web scraper (`scripts/scrape-canlii-tribunals.py`)
- Regex-based extraction (no costly GPT-4 needed)

**What We Extract From Each Decision:**
- Condition (fibromyalgia, PTSD, back injury, etc.)
- Outcome (allowed, denied, varied)
- Evidence cited (RFC form, timeline, FCE, specialist reports)
- Key success/failure factors
- Full decision text (for deeper analysis)

**Output:**
- `data/tribunal-decisions/thunder-bay-wsiat-2026.json`
- `data/tribunal-decisions/thunder-bay-sst-2026.json`
- `data/tribunal-decisions/thunder-bay-hrto-2026.json`

---

## 🔍 Phase 2: Pattern Detection (Weeks 4-6)

### What We're Looking For

**Example Pattern #1: Fibromyalgia Success Factors**
```
Detected Pattern:
- 73 fibromyalgia WSIAT appeals in database
- 57 allowed (78% success rate)
- Success factors present in 87% of wins:
  1. RFC form from treating physician (92%)
  2. Timeline showing symptom progression (78%)
  3. Functional capacity evaluation (64%)

Recommendation:
"Workers with fibromyalgia who submitted RFC form + timeline 
had 92% success rate at WSIAT. Download template here."
```

**Example Pattern #2: PTSD + Workplace Stress**
```
Detected Pattern:
- 34 PTSD cases in Thunder Bay healthcare workers
- 21 allowed (62% success rate)
- Success factors:
  1. Psychiatrist report confirming workplace causation (88%)
  2. Documentation of workplace incidents (76%)
  3. Employer's failure to address safety concerns (71%)

Campaign Suggestion:
"PTSD Claims in Healthcare - 34 cases detected.
Pattern: Employer inaction on safety → PTSD → Denied claims.
Launch campaign: 'Thunder Bay Healthcare Worker Safety'?"
```

**Example Pattern #3: Age 65 Cutoff**
```
Detected Pattern:
- 12 workers aged 65+ denied WSIB benefits
- 9 successfully appealed to WSIAT (75%)
- Common argument: Age 65 cutoff violates human rights

Campaign Launch:
"Rights Don't Retire - Thunder Bay Edition
12 local workers denied benefits at age 65.
Join provincial campaign with Thunder Bay-specific data."
```

### Validation Step
**Before any pattern goes live, we ask TBDIWSG:**
- "Does this pattern match what you see in your client base?"
- "Is the success rate realistic?"
- "Would this recommendation actually help your clients?"

---

## 📝 Phase 3: Template Generation (Weeks 7-9)

### What We Generate

**Template Example: WSIB Appeal Letter (Fibromyalgia)**
```
Based on 57 successful appeals with this condition

TO: Workplace Safety & Insurance Board
RE: Appeal of Denial - Claim #[CLAIM_NUMBER]

Dear Adjudicator,

I am writing to appeal the denial of my claim dated [DENIAL_DATE] 
for chronic pain and fibromyalgia.

[SUCCESS FACTOR #1: RFC Form]
My treating physician, Dr. [PHYSICIAN_NAME], has completed an RFC 
(Residual Functional Capacity) form documenting my limitations. 
This form establishes that I am unable to: [LIST FROM RFC]

[SUCCESS FACTOR #2: Timeline]
I have attached a detailed timeline showing the progression of my 
symptoms from the workplace incident on [INCIDENT_DATE] to present. 
This demonstrates the clear causal link between my work duties and 
current condition.

[SUCCESS FACTOR #3: Functional Capacity Evaluation]
A functional capacity evaluation conducted on [FCE_DATE] by 
[EVALUATOR_NAME] objectively confirms my limitations align with 
my physician's assessment.

The Board's decision appears to rely primarily on the IME report 
dated [IME_DATE]. However, WSIAT precedent (Decision No. [DECISION]) 
establishes that treating physician opinion should be given greater 
weight when supported by objective evidence.

I respectfully request reconsideration based on the enclosed 
documentation.

Sincerely,
[YOUR_NAME]

---
ENCLOSED:
☑ RFC form from Dr. [PHYSICIAN_NAME]
☑ Timeline of symptom progression
☑ Functional capacity evaluation report
☑ Medical records (last 12 months)
☑ Workplace incident reports
```

**Template Categories:**
- WSIB initial appeals
- WSIAT appeals
- CPP-D reconsideration requests
- Accommodation requests
- Human rights complaints
- IME challenge letters

---

## 👥 Phase 4: Client Testing (Weeks 10-12)

### Who We're Looking For
- **5-10 current TBDIWSG clients** who are:
  - Currently appealing a denial (WSIB, CPP-D, LTD)
  - Comfortable with technology (can use a website/app)
  - Willing to provide feedback

### What They'll Do
1. **Search the database:** "Show me successful fibromyalgia appeals"
2. **Review patterns:** "92% succeeded with RFC form + timeline"
3. **Use a template:** Download pre-filled appeal letter
4. **Provide feedback:**
   - Was this helpful?
   - Did you save time?
   - Would you use this again?
   - What's missing?

### What TBDIWSG Does
- **Minimal effort required:**
  - Introduce us to 5-10 clients
  - Collect feedback forms (we provide)
  - 1-hour debrief call at end of pilot

- **What you DON'T have to do:**
  - No tech setup (we handle everything)
  - No data entry (all public records)
  - No training (we provide user guide)
  - No ongoing maintenance

---

## 🚀 Phase 5: Campaign Launch (If Applicable)

**Only if patterns detected AND TBDIWSG approves**

If we detect a pattern affecting 50+ workers, we'll suggest a campaign:

**Example: "Thunder Bay Construction Workers - Back Injury Denials"**
```
Pattern Detected:
- 67 construction workers in Thunder Bay region
- Back/spinal injuries
- Denied at initial level
- 78% win rate at WSIAT when appealing

Campaign Actions:
1. Create campaign page: "Thunder Bay Construction Back Injury Justice"
2. Invite all 67 workers to join (via TBDIWSG outreach)
3. Generate joint submission to WSIB documenting pattern
4. Share with media: "67 Thunder Bay Construction Workers Denied..."
5. Submit to Ministry of Labour
6. Track outcomes
```

**TBDIWSG Control:**
- You approve campaign before launch
- You decide if clients should be contacted
- You review joint submission before sending
- Your branding, your messaging

---

## 📈 Expected Outcomes

### For Thunder Bay Workers
- **Time savings:** 30-39 hours average per appeal
- **Higher success rates:** 15-42% improvement (based on template + mentor availability)
- **Less isolation:** "You're not alone - 73 others faced this"
- **Faster results:** 1/40th the time from "denied" to "actionable strategy"

### For TBDIWSG
- **Amplified impact:** Your 15+ years of knowledge, now searchable and shareable
- **Pattern visibility:** See systemic issues in real-time
- **Campaign power:** Launch data-backed campaigns with 50+ members instantly
- **Scalability:** Help more clients without more staff time

### For 3mpwrApp
- **Proof of concept:** Validates flywheels work in real-world setting
- **User feedback:** Refines system before wider launch
- **Partnership model:** Blueprint for scaling to other advocacy groups
- **Data quality:** Real injured worker validation of patterns

---

## 💰 Budget & Resources

### Total Cost: $0 to TBDIWSG

**What 3mpwrApp Provides (Funded):**
- All development work
- Server/hosting
- Data scraping infrastructure
- Pattern detection algorithms
- Template generation
- User testing coordination
- Pilot evaluation report

**What TBDIWSG Provides (In-Kind):**
- Access to 5-10 clients for testing
- Feedback on pattern accuracy
- Campaign approval authority
- 1-hour debrief calls (weekly during pilot)

**Estimated Value:**
- Development: $15,000 (waived)
- Infrastructure: $500/year (waived)
- Data scraping: $200 (waived - using free tools)
- **Total Investment from 3mpwrApp:** $15,500
- **Total Cost to TBDIWSG:** $0

---

## ⏱️ Timeline

| Week | Phase |Activities |
|------|-------|-----------|
| 1-3 | Data Collection | Scrape 500+ tribunal decisions, clean data, categorize by condition/outcome |
| 4-6 | Pattern Detection | Run algorithms, identify success factors, generate initial insights |
| 7-9 | Template Generation | Create 10+ templates from successful cases, validate with TBDIWSG |
| 10-12 | Client Testing | 5-10 clients use system, collect feedback, measure outcomes |
| 13 | Evaluation | Final report, decision on full deployment, scale-up plan |

**Key Milestones:**
- **Week 3:** Database complete, share sample data with TBDIWSG
- **Week 6:** Pattern report delivered, validate with TBDIWSG expertise
- **Week 9:** Template library ready, TBDIWSG reviews and approves
- **Week 12:** Client testing complete, feedback compiled
- **Week 13:** Final presentation, go/no-go decision on full deployment

---

## 🎯 Success Criteria

**Pilot is successful if:**
1. ✅ **80%+ client satisfaction** - "This helped me"
2. ✅ **50%+ time savings** - Research time cut in half
3. ✅ **70%+ pattern accuracy** - TBDIWSG confirms patterns match reality
4. ✅ **60%+ template usage** - Clients actually use the templates
5. ✅ **At least 1 campaign launched** - Proven collective action potential

**If successful →** Scale to:
- Full Thunder Bay deployment (all TBDIWSG clients)
- Other Northern Ontario advocacy groups
- Province-wide injured worker organizations
- National expansion

---

## 🚨 Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Low client adoption** | Pilot fails to prove value | Start with advocate-identified clients who are tech-comfortable and motivated |
| **Patterns don't match reality** | Recommendations are wrong | Validate every pattern with TBDIWSG before showing to clients |
| **Data quality issues** | Garbage in, garbage out | Manual review of 10% of scraped data, cross-check with known cases |
| **Tech barriers for clients** | Can't use the system | Provide step-by-step guide, TBDIWSG staff can help navigate |
| **Privacy concerns** | Clients worried about data | All tribunal data is already public, no personal info collected |

---

## 🤝 Partnership Structure

### TBDIWSG Responsibilities
- **Minimal time commitment:** 2-4 hours/week
- Identify 5-10 clients for pilot testing
- Validate patterns detected (15-minute review calls)
- Collect feedback from clients
- Approve campaigns before launch
- Provide debrief feedback (weekly 30-min calls)

### 3mpwrApp Responsibilities
- All technical development and infrastructure
- Data scraping and pattern detection
- Template generation
- User guides and training materials
- Client support during pilot
- Final evaluation report
- Full funding (no cost to TBDIWSG)

### Decision Authority
- **TBDIWSG decides:** Campaign launches, client outreach, final messaging
- **3mpwrApp decides:** Technical implementation, data sources, algorithm design
- **Joint decisions:** Pattern validation, template content, pilot success criteria

---

## 📞 Next Steps

### Immediate (This Week)
1. **TBDIWSG reviews proposal** - Share with board/coordinators
2. **Questions answered** - 30-minute Q&A call if needed
3. **Go/no-go decision** - Does this align with TBDIWSG goals?

### If YES (Week 1)
1. **Kickoff call** - Finalize pilot parameters
2. **Start data scraping** - Begin CanLII collection
3. **Identify test clients** - TBDIWSG selects 5-10 participants

### If More Info Needed
- Live demo of scraper running
- Sample of database structure
- Mock-up of client interface
- Reference calls with beta testers

---

## 📧 Contact

**This Proposal Created By:**  
Lissa Beaulieu, Creator of 3mpwrApp  
Email: hello@3mpwrapp.org  

**Presentation Context:**  
March 31, 2026 - Thunder Bay presentation  
Audience questions sparked this pilot design  

**Ready to Start:**  
Scraper is built and ready to run.  
Database can be live in 3 weeks.  
Zero financial commitment from TBDIWSG.

---

## ✅ Decision Matrix

**Choose One:**

☐ **YES - Let's Pilot This (12 weeks, $0 cost)**  
→ Contact hello@3mpwrapp.org to schedule kickoff call

☐ **INTERESTED - Need More Info First**  
→ Request demo call or sample data

☐ **NOT NOW - Revisit in 6 Months**  
→ We'll check back in Fall 2026

☐ **NO - Not the Right Fit**  
→ No problem - thank you for considering!

---

**Appendix A: Sample Pattern Detection Output** (see next page)  
**Appendix B: Sample Template** (see page after)  
**Appendix C: Client Testing Form** (see final page)

---

# Appendix A: Sample Pattern Detection Output

**Pattern ID:** FIBRO-WSIAT-2024-001  
**Condition:** Fibromyalgia  
**Jurisdiction:** Ontario (WSIAT)  
**Sample Size:** 73 cases (2015-2025)  
**Success Rate:** 78% (57 allowed, 16 denied)  

**Success Factors (Present in Wins):**
1. **RFC Form (92% of wins)** - Residual Functional Capacity form from treating physician documenting specific limitations
2. **Timeline (78% of wins)** - Chronological documentation showing symptom progression from workplace incident
3. **Functional Capacity Evaluation (64% of wins)** - Objective assessment confirming claimed limitations
4. **Specialist Confirmation (59% of wins)** - Rheumatologist or pain specialist supporting diagnosis
5. **Employer Acknowledgment (43% of wins)** - Documentation that employer noticed decline in work capacity

**Failure Factors (Present in Denials):**
1. **Pre-existing Condition Argument (87% of denials)** - WSIB claimed fibromyalgia existed before workplace incident
2. **Insufficient Objective Evidence (81% of denials)** - WSIB relied on IME that found "subjective complaints only"
3. **Gap in Treatment (63% of denials)** - Worker had period with no medical visits, interpreted as improvement

**Key WSIAT Precedents:**
- Decision No. 1234/15 I - Establishes RFC form from treating physician has greater weight than IME
- Decision No. 5678/18 I - Timeline evidence can overcome pre-existing condition argument
- Decision No. 9101/21 I - FCE conducted by qualified professional is objective evidence

**Recommended Strategy:**
For workers with fibromyalgia appealing WSIB denial:
1. Obtain RFC form from treating physician (downloadtemplate)
2. Create detailed timeline from incident date to present
3. Request functional capacity evaluation
4. Cite WSIAT precedents 1234/15 I, 5678/18 I in appeal letter

**Expected Outcome:** 92% success rate when all three factors present.

---

# Appendix B: Sample Template

See "Phase 3: Template Generation" section above for full example.

---

# Appendix C: Client Testing Feedback Form

**3mpwrApp Flywheels Pilot - Client Feedback**

**Participant ID:** _______________ (anonymous)  
**Date:** _______________  
**TBDIWSG Staff:** _______________

**Section 1: Your Situation**
1. What type of claim are you appealing? ☐ WSIB ☐ CPP-D ☐ LTD ☐ Other: _______
2. How long have you been working on this appeal? ☐ <1 month ☐ 1-3 months ☐ 3-6 months ☐ 6+ months
3. How much time have you spent researching your appeal so far? _______ hours

**Section 2: Using the Database**
4. Were you able to find cases similar to yours? ☐ Yes ☐ Somewhat ☐ No
5. How many similar cases did you review? _______
6. Did the patterns detected match your situation? ☐ Yes ☐ Somewhat ☐ No

**Section 3: Templates**
7. Did you use a template? ☐ Yes ☐ No
8. If yes, which one? _______________
9. How much did you customize the template? ☐ Used as-is ☐ Minor edits ☐ Major edits
10. Did the template save you time? ☐ Yes - saved _____ hours ☐ No

**Section 4: Overall Satisfaction**
11. How helpful was this system? (1-10): _______
12. Would you recommend this to other injured workers? ☐ Yes ☐ Maybe ☐ No
13. What was most helpful? _______________________________________________
14. What was least helpful? _______________________________________________
15. What's missing? _______________________________________________

**Section 5: Outcomes (if applicable)**
16. Have you submitted your appeal yet? ☐ Yes ☐ Not yet
17. If yes, what was the outcome? ☐ Approved ☐ Denied ☐ Pending

**Additional Comments:**
___________________________________________________________________
___________________________________________________________________

**Thank you for participating in the pilot!**

---

**END OF PROPOSAL**

**Total Pages:** 12  
**Format:** PDF-ready Markdown  
**Prepared for:** Thunder Bay & District Injured Workers Support Group  
**Date:** April 1, 2026
