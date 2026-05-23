# 3mpwrApp Risk Mitigation & Contingency Plan

**Date Created:** May 23, 2026  
**Last Updated:** May 23, 2026  
**Status:** ACTIVE - Living Document  
**Owner:** Founder + Emergency Council  

---

## 🎯 Purpose

This document outlines identified risks to 3mpwrApp's operations and the community's access to services, along with concrete mitigation strategies and contingency plans.

**Philosophy:** We plan for worst-case scenarios so the disability community never loses access to tools they depend on.

---

## 📊 Risk Register

### 🔴 CRITICAL RISKS (Could cause platform shutdown)

#### **RISK-001: Founder Incapacity or Death**

**Likelihood:** Medium (health complications, accidents, burnout)  
**Impact:** CRITICAL (platform could become abandoned)  

**Mitigation:**
- ✅ [Governance succession plan exists](/docs/legal/governance/GOVERNANCE_SUCCESSION_PLAN.md) (draft, needs finalization)
- ✅ Two-tier admin system implemented (Super Admin + General Admins)
- ⚠️ Dead Man's Switch implementation PENDING (see Action Items below)
- ⚠️ Emergency Council formation PENDING (need 5 General Admins identified)

**Contingency:**
1. **Day 1-7:** Emergency Council activates (5 General Admins become temporary custodians)
2. **Day 8-30:** Community nomination process for permanent Governance Board
3. **Day 31+:** Elected board takes over operations

**Status:** 🟡 **PARTIALLY MITIGATED** (documentation exists, automation needed)

**Action Items:**
- [ ] Finalize governance succession plan with legal review
- [ ] Implement automated Dead Man's Switch (90-day inactivity trigger)
- [ ] Recruit and formally appoint 5 Emergency Council members
- [ ] Document all system access credentials in encrypted vault (1Password, Bitwarden)
- [ ] Quarterly succession plan drill (test Emergency Council can actually deploy)

---

#### **RISK-002: Financial Sustainability Failure**

**Likelihood:** High (currently ~$2/month costs, but will grow with user base)  
**Impact:** HIGH (could force platform closure or compromise principles)  

**Current State:**
- No consistent revenue stream
- PayPal donations exist but not prominently featured
- No grant funding secured yet
- 100% reliant on free tiers (Firebase, Cloudflare, GitHub)

**Mitigation:**
- ✅ Created transparent funding page ([/support](/support))
- ✅ Operating costs fully documented ($2/month current, $150/month sustainable)
- ⚠️ Grant applications PENDING
- ⚠️ Partnership agreements PENDING
- ⚠️ Monthly donation campaigns PENDING

**Contingency:**
1. **If donations < $50/month:** Optimize costs, freeze new features
2. **If donations < $25/month:** Move to cheaper hosting (GitHub Pages only)
3. **If donations = $0 for 6 months:** Community vote on next steps
4. **Emergency fund goal:** $1,800 (12 months operating buffer at $150/month)

**Status:** 🔴 **HIGH RISK** (no financial buffer)

**Action Items:**
- [ ] Apply to 3 grants in next 30 days (Ontario Trillium, Google.org, disability foundations)
- [ ] Formalize Thunder Bay Injured Workers partnership (MOU or letter of support)
- [ ] Create monthly donation campaign automation
- [ ] Build emergency fund (goal: $1,800)
- [ ] Document "graceful shutdown" plan if funding fails

---

#### **RISK-003: Security Breach or Data Loss**

**Likelihood:** Medium (public-facing website + mobile app = attack surface)  
**Impact:** CRITICAL (trust violation, legal liability, community harm)  

**Current State:**
- ✅ Zero data collection architecture (minimal exposure)
- ✅ All 38 security vulnerabilities fixed (npm + Ruby gems)
- ✅ Dependabot re-enabled (weekly automated security updates)
- ✅ BYOC (Bring Your Own Cloud) = user data never touches our servers
- ⚠️ No penetration testing done yet
- ⚠️ No incident response plan formalized

**Mitigation:**
- ✅ Weekly automated security scans (Dependabot)
- ✅ Firestore rules hardened (Super Admin only access)
- ⚠️ Security audit PENDING (need volunteer security researcher)
- ⚠️ Backup encryption validation PENDING

**Contingency:**
1. **If breach detected:** Immediate code freeze + forensic analysis
2. **If user data exposed:** Public disclosure within 24 hours (PIPEDA compliance)
3. **If credentials compromised:** Rotate all API keys + force password resets
4. **If website defaced:** Restore from git history + Cloudflare cache

**Status:** 🟡 **PARTIALLY MITIGATED** (architecture is secure, but no formal audit)

**Action Items:**
- [ ] Create formal incident response plan (document next 30 days)
- [ ] Recruit volunteer security researcher for pro-bono audit
- [ ] Document all system credentials in encrypted vault
- [ ] Test backup restoration process (quarterly)
- [ ] Implement automated intrusion detection (Cloudflare free tier tools)

---

### 🟠 HIGH RISKS (Could cause major disruption)

#### **RISK-004: Founder Burnout**

**Likelihood:** HIGH (40+ hours/week, disabled, no team, no income from project)  
**Impact:** HIGH (quality degradation, delays, eventual abandonment)  

**Current State:**
- One person doing work of 10+ people
- No vacation taken since project start
- Health constraints (disabled injured worker)
- No backup for emergencies

**Mitigation:**
- ⚠️ No volunteer team recruited yet
- ⚠️ No delegation system established
- ⚠️ No self-care protocols documented

**Contingency:**
1. **If founder takes health break:** Emergency Council maintains status quo
2. **If burnout severe:** Activate succession plan early
3. **If quality drops:** Community flags issues via GitHub

**Status:** 🔴 **HIGH RISK** (no mitigation in place)

**Action Items:**
- [ ] **URGENT:** Recruit 2-3 volunteers this month (post in IAVGO, Reddit r/disability, Discord)
- [ ] Create clear role descriptions (content editor, developer, community manager)
- [ ] Implement "no work Sundays" policy (force rest)
- [ ] Document all tasks so others can learn
- [ ] Accept that "good enough" is better than "perfect but unsustainable"

---

#### **RISK-005: Free Tier Limits Exceeded**

**Likelihood:** MEDIUM (growth could exceed Firebase/Cloudflare free tiers)  
**Impact:** HIGH (service degradation, unexpected costs, features disabled)  

**Current State:**
- Firebase free tier: 50K reads/day, 20K writes/day, 1GB storage
- Cloudflare Pages: 500 builds/month
- GitHub Actions: 2,000 minutes/month (already exhausted, resets June 1)
- Expo EAS: 30 builds/month

**Mitigation:**
- ⚠️ No usage monitoring dashboard
- ⚠️ No automatic alerts for quota approaching
- ⚠️ No upgrade plan if free tier exceeded

**Contingency:**
1. **If Firebase quota hits 80%:** Implement rate limiting
2. **If Cloudflare builds exhausted:** Manual builds only (slower)
3. **If costs spike unexpectedly:** Emergency fundraiser + community notification

**Status:** 🟡 **PARTIALLY MITIGATED** (aware of limits, no automation)

**Action Items:**
- [ ] Set up Firebase usage alerts (notify at 50%, 75%, 90%)
- [ ] Document paid tier upgrade process
- [ ] Create "quota exceeded" user-facing message
- [ ] Implement caching to reduce Firebase reads
- [ ] Monitor Cloudflare build usage weekly

---

#### **RISK-006: Legal Liability**

**Likelihood:** LOW (but devastating if it happens)  
**Impact:** CRITICAL (lawsuits, personal financial ruin, platform shutdown)  

**Scenarios:**
- User harms themselves after using app
- User makes wrong legal decision based on app guidance
- Copyright infringement claims (tribunal data, images)
- Accessibility lawsuit (AODA non-compliance)
- Privacy violation (data breach, PIPEDA)

**Mitigation:**
- ✅ Comprehensive disclaimers on website + in-app
- ✅ Terms of Service exist
- ✅ Privacy Policy exists
- ✅ Crisis resources prominently featured
- ✅ WCAG 2.2 AAA compliance
- ⚠️ No formal legal review of documents
- ⚠️ No liability insurance
- ⚠️ No incorporation (personal liability exposure)

**Contingency:**
1. **If legal threat received:** Consult pro-bono legal clinic immediately
2. **If lawsuit filed:** Activate community legal support network
3. **If judgment against:** Crowdfund legal defense or dissolve project

**Status:** 🟡 **PARTIALLY MITIGATED** (disclaimers exist, but not legally reviewed)

**Action Items:**
- [ ] Get pro-bono legal review of ToS/Privacy Policy (ARCH Disability Law, community clinic)
- [ ] Investigate non-profit incorporation (protects founder personally)
- [ ] Research directors & officers insurance costs
- [ ] Add "this is not legal advice" disclaimers to tribunal data pages
- [ ] Document legal support network (which lawyers would help in emergency)

---

### 🟡 MEDIUM RISKS (Manageable but need monitoring)

#### **RISK-007: Technical Debt Accumulation**

**Likelihood:** HIGH (1,842 files, complex codebase, one maintainer)  
**Impact:** MEDIUM (slows development, increases bugs, eventual rot)  

**Current State:**
- ✅ Just fixed 38 security vulnerabilities
- ✅ Just fixed 123 test failures
- ✅ Just fixed 60 TypeScript errors
- ⚠️ 1,300+ broken links still remaining
- ⚠️ GitHub Actions disabled (free tier exhausted)
- ⚠️ No automated code quality checks

**Mitigation:**
- ✅ Dependabot enabled (prevents vulnerability accumulation)
- ⚠️ No weekly maintenance schedule
- ⚠️ No technical debt tracking system

**Contingency:**
1. **If debt becomes unmanageable:** Code freeze + 2-week debt sprint
2. **If dependencies become obsolete:** Gradual migration plan
3. **If tests start failing:** Prioritize test fixes over new features

**Status:** 🟡 **PARTIALLY MITIGATED** (recent cleanup done, but will accumulate again)

**Action Items:**
- [ ] Implement weekly "Maintenance Monday" (2 hours for fixes, not features)
- [ ] Set up automated broken link checker (run monthly)
- [ ] Create technical debt backlog in GitHub Projects
- [ ] Document "definition of done" (includes tests, docs, no new warnings)
- [ ] Prioritize automation over manual work

---

#### **RISK-008: User Acquisition Failure**

**Likelihood:** MEDIUM (great product, but hard to find)  
**Impact:** MEDIUM (low adoption, wasted effort, no impact)  

**Current State:**
- No marketing strategy
- No SEO optimization (just fixed some pages)
- No social media presence (minimal)
- No user testimonials (beta not launched yet)
- No analytics (don't know what's working)

**Mitigation:**
- ⚠️ No user acquisition plan
- ⚠️ No analytics implementation
- ⚠️ No conversion tracking

**Contingency:**
1. **If user growth stagnant:** Launch referral program
2. **If no beta signups:** Pivot messaging
3. **If wrong audience:** Re-target marketing

**Status:** 🟡 **PARTIALLY MITIGATED** (product is good, but invisible)

**Action Items:**
- [ ] Implement privacy-respecting analytics (Plausible, Fathom)
- [ ] Create simple user acquisition dashboard (signups, active users, retention)
- [ ] Partner with 1 disability organization for co-marketing
- [ ] Launch beta tester program (collect testimonials)
- [ ] Document user journey analytics (where do they drop off?)

---

#### **RISK-009: Misinformation or Harmful Advice**

**Likelihood:** MEDIUM (tribunal data could be misinterpreted)  
**Impact:** MEDIUM (user harm, reputation damage, legal risk)  

**Scenarios:**
- User relies on outdated tribunal data
- User misunderstands legal guidance
- AI-generated content gives wrong advice
- Community member posts harmful advice

**Mitigation:**
- ✅ Disclaimers on all tribunal data pages
- ✅ "This is not legal advice" repeated throughout
- ✅ Encouragement to consult real lawyers
- ⚠️ No content review process
- ⚠️ No fact-checking protocol
- ⚠️ No community moderation guidelines (draft exists, not enforced)

**Contingency:**
1. **If harmful content identified:** Remove immediately + notify affected users
2. **If user harmed:** Crisis support resources + legal consultation
3. **If pattern of misinformation:** Implement mandatory content review

**Status:** 🟡 **PARTIALLY MITIGATED** (disclaimers exist, no active monitoring)

**Action Items:**
- [ ] Create content review checklist
- [ ] Recruit volunteer fact-checker (paralegal, law student)
- [ ] Implement community flagging system
- [ ] Document content correction process
- [ ] Regular audit of high-traffic pages (quarterly)

---

#### **RISK-010: Partnership Conflicts**

**Likelihood:** MEDIUM (as you grow, organizations will want involvement)  
**Impact:** MEDIUM (mission drift, compromised values, community distrust)  

**Scenarios:**
- Partner wants branding/control in exchange for funding
- Partner's values misalign with community
- Partner demands user data
- Partner tries to influence content

**Mitigation:**
- ⚠️ No formal partnership policy
- ⚠️ No MOU template
- ⚠️ No conflict of interest process

**Contingency:**
1. **If values conflict:** Politely decline partnership
2. **If partner overreaches:** Terminate agreement
3. **If community objects:** Listen to community, not partner

**Status:** 🔴 **HIGH RISK** (Thunder Bay partnership unclear, no formal policy)

**Action Items:**
- [ ] **URGENT:** Create partnership policy document (next 14 days)
- [ ] Define what qualifies as "mission-aligned" partner
- [ ] Create MOU template (volunteer lawyer can help)
- [ ] Formalize Thunder Bay Injured Workers relationship (letter of support vs. formal partnership?)
- [ ] Document "red lines" (never compromise: data privacy, free access, community control)

---

### 🟢 LOW RISKS (Monitor but not urgent)

#### **RISK-011: Technology Obsolescence**

**Likelihood:** LOW (React Native/Expo are stable, widely used)  
**Impact:** MEDIUM (would require expensive rewrite)  

**Mitigation:**
- ✅ Using mainstream tech stack
- ✅ Expo SDK updates regularly
- ⚠️ No migration plan if tech becomes obsolete

**Contingency:**
1. If Expo dies: Migrate to bare React Native
2. If React Native dies: Migrate to Flutter or native
3. If web framework obsolete: Static site rebuild

**Status:** 🟢 **LOW RISK** (modern stack, active community)

---

#### **RISK-012: Regulatory Changes**

**Likelihood:** LOW (but increasing with AI/data regulations)  
**Impact:** MEDIUM (compliance costs, feature restrictions)  

**Scenarios:**
- New privacy laws (stronger than PIPEDA)
- Accessibility regulations (beyond AODA)
- AI content regulations
- Health data rules

**Mitigation:**
- ✅ Already privacy-first (zero data collection)
- ✅ Already WCAG AAA compliant
- ⚠️ No legal monitoring system

**Contingency:**
1. If new regulations: Compliance audit + adjust
2. If costs prohibitive: Simplify features
3. If impossible to comply: Shut down gracefully

**Status:** 🟢 **LOW RISK** (already conservative on privacy/accessibility)

---

## 🚨 Emergency Response Protocols

### **SCENARIO A: Founder Disappears (Death, Coma, Sudden Incapacity)**

**TIMELINE:**

**Week 1 (Days 1-7):**
1. ✅ Automated Dead Man's Switch triggers (no login for 90 days)
2. ✅ Emergency Council notified automatically
3. ✅ Public announcement posted (website banner, Discord, social media)
4. ✅ Code freeze implemented (no new deployments)
5. ✅ System access logs audited
6. ✅ Legal verification process begins

**Week 2-4 (Days 8-30):**
1. ✅ Community nomination process opens
2. ✅ Nominees submit credentials + vision statements
3. ✅ Public Q&A forums held
4. ✅ Ranked choice voting conducted
5. ✅ Top 5 become Governance Board

**Month 2+ (Day 31+):**
1. ✅ Board assumes control
2. ✅ New roadmap developed
3. ✅ Community updates resume

---

### **SCENARIO B: Financial Crisis (Donations Dry Up)**

**TIMELINE:**

**Month 1:**
1. ✅ Public transparency post ("We need help")
2. ✅ Emergency fundraising campaign
3. ✅ Cost optimization (move to free-tier everything)
4. ✅ Feature freeze (maintenance only)

**Month 2:**
1. ✅ Reach out to unions/foundations
2. ✅ Apply for emergency grants
3. ✅ Community brainstorm alternative revenue

**Month 3:**
1. ✅ If still failing: Community vote on next steps
2. ✅ Options: Pause development, graceful shutdown, find sponsor

---

### **SCENARIO C: Security Breach**

**TIMELINE:**

**Hour 1:**
1. ✅ Immediate code freeze
2. ✅ Rotate all credentials
3. ✅ Take affected systems offline

**Day 1:**
1. ✅ Forensic analysis
2. ✅ Public disclosure (PIPEDA compliance)
3. ✅ User notification (if data exposed)

**Week 1:**
1. ✅ Patch vulnerabilities
2. ✅ Third-party security audit
3. ✅ Gradual system restoration

---

## 📅 Quarterly Risk Review Process

**Every 3 months (March, June, September, December):**

1. ✅ Review risk register (any new risks? Any resolved?)
2. ✅ Test one emergency scenario (succession drill, backup restore, etc.)
3. ✅ Update contact information (Emergency Council, legal support, partners)
4. ✅ Document lessons learned
5. ✅ Community transparency report

**Next review:** June 2026

---

## ✅ Action Items Summary (Prioritized)

### 🔴 CRITICAL (Do in next 30 days):

1. [ ] **Recruit 2-3 volunteers** (post in IAVGO, Reddit, Discord) - RISK-004
2. [ ] **Apply to 3 grants** (Ontario Trillium, Google.org, disability foundations) - RISK-002
3. [ ] **Create partnership policy document** - RISK-010
4. [ ] **Formalize Thunder Bay relationship** (MOU or letter of support) - RISK-010
5. [ ] **Implement Dead Man's Switch automation** - RISK-001
6. [ ] **Recruit 5 Emergency Council members** - RISK-001

### 🟠 HIGH (Do in next 60 days):

7. [ ] **Get legal review of ToS/Privacy Policy** - RISK-006
8. [ ] **Create incident response plan** - RISK-003
9. [ ] **Implement usage monitoring alerts** (Firebase, Cloudflare) - RISK-005
10. [ ] **Set up analytics** (Plausible, Fathom) - RISK-008
11. [ ] **Weekly "Maintenance Monday" protocol** - RISK-007
12. [ ] **Build emergency fund** (goal: $1,800) - RISK-002

### 🟡 MEDIUM (Do in next 90 days):

13. [ ] **Document all system credentials in encrypted vault** - RISK-001, RISK-003
14. [ ] **Quarterly succession plan drill** - RISK-001
15. [ ] **Recruit volunteer security researcher** - RISK-003
16. [ ] **Create content review checklist** - RISK-009
17. [ ] **Fix top 100 broken links** - RISK-007
18. [ ] **Launch beta tester program** - RISK-008

---

## 📞 Emergency Contacts

**Founder:**  
📧 empowrapp08162025@gmail.com

**Emergency Council** (to be appointed):  
⚠️ PENDING - need 5 General Admins identified

**Legal Support:**
- ARCH Disability Law Centre: [Contact info]
- Community legal clinic: [Contact info]
- Pro-bono lawyer network: [Contact info]

**Technical Support:**
- GitHub: [@3mpowrApp](https://github.com/3mpowrApp)
- Discord: [Link when available]

**Partners:**
- Thunder Bay Injured Workers: [Contact to be confirmed]
- IAVGO: [Contact info]

---

## 📝 Document Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| May 23, 2026 | 1.0 | Initial creation - comprehensive risk register | GitHub Copilot + Founder |

---

**This is a living document.** Update quarterly or whenever significant risks change.

**Questions?** Email empowrapp08162025@gmail.com
