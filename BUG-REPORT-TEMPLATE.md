# Bug Report Template & Tracking Guide

This document provides standardized templates for reporting, tracking, and managing bugs found during pre-release testing.

---

## Bug Report Template

### Basic Information

```markdown
## Bug Report #[ID]

**Title:** [One-line summary of issue]  
**Date Reported:** [Date]  
**Reported By:** [Tester Name]  
**Severity:** Critical | High | Medium | Low  
**Status:** Open | In Progress | Closed | Verified  

---

## Details

### Component
- **Page/Feature:** [Which page or feature affected]
- **Module:** [Specific module if applicable]
- **Environment:** Staging | Production  

### Affected Users
- [ ] All users
- [ ] Desktop users only
- [ ] Mobile users only
- [ ] Assistive technology users
- [ ] Specific browser(s): [List]
- [ ] Specific device(s): [List]

---

## Reproduction

### Steps to Reproduce
1. [Exact step 1]
2. [Exact step 2]
3. [Exact step 3]

**Expected Behavior:**  
[What should happen]

**Actual Behavior:**  
[What actually happens]

---

## Evidence

### Screenshots
[Attach screenshot showing issue]  
*Right-click image → Copy image link → Paste URL*

### Video/Screen Recording
[Link to video if complex issue]

### Console Logs
```
[Copy-paste relevant console errors]
```

**How to capture console logs:**
1. Open DevTools (F12)
2. Go to Console tab
3. Reproduce issue
4. Copy error messages
5. Paste here

### Browser DevTools
- **Network tab issues:** [Describe]
- **Performance metrics:** [If relevant]
- **Storage/Cookies:** [If relevant]

---

## Technical Details

### Environment
- **Browser:** [e.g., Chrome 128]
- **OS:** [e.g., Windows 10, macOS 14, Android 12]
- **Device:** [e.g., MacBook Pro 16", iPhone 12, Desktop]
- **Screen Resolution:** [e.g., 1920x1080]
- **Network:** [WiFi | Cellular | Wired] [Speed if known]

### Other Information
- **Reproducibility:** Always | Often | Rarely | Can't Reproduce
- **First Observed:** [Version/date]
- **Last Confirmed:** [Date]

---

## Analysis

### Root Cause (if known)
[Technical investigation notes]

### Related Issues
- Issue #123
- Issue #456

### Suggested Fix
[Optional - proposedremedy]

---

## Timeline

| Date | Status | Notes |
|------|--------|-------|
| 2025-10-17 | Reported | Initial report |
| 2025-10-18 | In Progress | Developer assigned |
| 2025-10-19 | Fixed | PR #789 |
| 2025-10-20 | Verified | Tester confirmation |

---

## Checklist

- [ ] Issue clearly described
- [ ] Steps to reproduce provided
- [ ] Screenshots/logs attached
- [ ] Severity assessed
- [ ] Assigned to developer
- [ ] Fixed and tested
- [ ] Verified by reporter
- [ ] Closed and documented
```

---

## Severity Definitions

### Critical 🔴
**Impact:** Complete feature loss, security breach, data loss, application crash  
**Error Rate:** >10% of users affected  
**SLA:** Fix before production launch  
**Examples:**
- RCE (remote code execution)
- Authentication bypass
- Cross-site scripting (XSS) in public input
- Page returns 500 error consistently
- Lost ability to complete critical user flow
- Data corruption or loss

**Remediation Steps:**
1. Assign immediately to senior developer
2. Fix takes priority over all other work
3. Re-test within 2 hours
4. Require code review before merge
5. Document in postmortem

---

### High 🟠
**Impact:** Major feature impaired, significant user friction, >5% error rate  
**SLA:** Fix within 24 hours  
**Examples:**
- Feature only partially functional (e.g., form submits but validation missing)
- Page loads but some content missing/broken
- Broken link to key resource
- Slow performance (>5s load time)
- WCAG accessibility failure blocking content
- UI layout broken on major device (e.g., mobile)
- Missing security header (CSP, HSTS)

**Remediation Steps:**
1. Assign to developer within 1 hour
2. Create fix + unit test
3. Code review required
4. Regression test before merge
5. Document in release notes

---

### Medium 🟡
**Impact:** Minor usability issue, <5% error rate, minor compliance gap  
**SLA:** Fix within 2 weeks  
**Examples:**
- Typo in content
- Minor contrast issue (but still readable)
- Optional form label missing
- Missing recommended accessibility feature
- Slow API response (>2s but <5s)
- CSS animation stutter
- 404 on low-traffic page

**Remediation Steps:**
1. Assign to developer within 3 days
2. Fix included in next sprint
3. Can be bundled with other medium fixes
4. Basic testing sufficient

---

### Low 🔵
**Impact:** UX polish, nice-to-have, <1% impact  
**SLA:** Post-launch backlog  
**Examples:**
- Color suggestion
- Content refinement
- Animation polish
- Improved error messaging
- Documentation typo
- Minor spacing adjustment

**Remediation Steps:**
1. Add to backlog
2. Include in next release cycle
3. Bundle with feature work
4. Minimal testing

---

## Bug Tracking System

### Using GitHub Issues

**Issue Title Format:**
```
[SEVERITY] [COMPONENT] Brief description
Examples:
[CRITICAL] [Search] XSS vulnerability in search results
[HIGH] [Mobile] Contact form not submitting
[MEDIUM] [Blog] Typo in featured post
```

**Labels to Apply:**
```
bug           - Defect / issue
enhancement   - Feature request / improvement
documentation - Docs or comments
a11y          - Accessibility issue
performance   - Speed/performance issue
security      - Security vulnerability
mobile        - Mobile-specific
blocked       - Blocked by another issue
duplicate     - Duplicate of another issue
critical      - Security or system-critical
high-priority - Important for launch
```

**Label Examples:**
- `bug` + `critical` + `security`
- `bug` + `high-priority` + `mobile`
- `enhancement` + `a11y`

---

## Bug Triage Meeting Agenda

**Frequency:** Daily during testing  
**Duration:** 15-30 minutes  
**Attendees:** QA Lead, Dev Lead, Product Manager  

### Agenda

1. **New Bugs Review** (5 min)
   - Review any new bugs from yesterday
   - Assess severity
   - Assign priority

2. **Critical/High Priority Updates** (10 min)
   - Status of critical/high bugs
   - Any blockers?
   - ETA for fixes?

3. **Regressions Check** (5 min)
   - Any recent fixes break other features?
   - Need to revert changes?

4. **Launch Readiness** (5 min)
   - Can we launch with known bugs?
   - Need to waive any issues?
   - Document decisions

### Sample Decision Matrix

| Bug | Severity | Fix Time | Launch Decision |
|---|---|---|---|
| Search XSS | Critical | 2 hours | ❌ Block – Fix before launch |
| Mobile menu broken | High | 4 hours | ❌ Block – Fix before launch |
| Typo in footer | Low | 1 hour | ✅ Allow – Fix post-launch |
| Slow blog page | High | 1 week | ⚠️ Conditional – Document, plan fix |

---

## Bug Analysis & Metrics

### Tracking

```python
# During testing week, track:
- Total bugs found: [N]
- By severity:
  - Critical: [N]
  - High: [N]
  - Medium: [N]
  - Low: [N]
- Fixed: [N]
- Verified: [N]
- Deferred: [N]
- Current backlog: [N]

# By component:
- Search: [N]
- Mobile: [N]
- Accessibility: [N]
- Performance: [N]
- Security: [N]
- Other: [N]
```

### Sample Report Format

```markdown
## Bug Report Summary

**Testing Period:** Oct 17–28, 2025  
**Test Team:** [Names]  
**Status:** 90% of bugs fixed, 3 critical blockers remain

### Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Bugs | 47 | <50 | ✅ |
| Critical | 2 | 0 | ⚠️ |
| High | 8 | <5 | ⚠️ |
| Medium | 22 | <30 | ✅ |
| Low | 15 | N/A | ✅ |
| Fixed | 42 | >90% | ✅ |
| Verified | 40 | >95% | ✅ |

### Critical Bugs (Blocking Launch)

1. **XSS in Search** – Fix PR #456, testing today
2. **Mobile Payment Broken** – Investigating, ETA EOD
3. **Database Connection Timeout** – Escalated to DevOps

### Recommendation

✅ **APPROVED FOR LAUNCH** pending:
- [ ] Fix #456 (XSS) verified
- [ ] Payment flow tested on all devices
- [ ] Database timeout resolved
- [ ] Regression testing complete

**Target Launch Date:** Oct 31, 2025
```

---

## Known Issues & Workarounds

### Format for Known Issues

```markdown
## Known Issue: [Title]

**ID:** KI-001  
**Severity:** Medium  
**Status:** Won't Fix | Deferred | Compensating Control  
**Affected Versions:** v1.0  

### Description
[What's wrong]

### Impact
[Who is affected and how]

### Workaround
[Temporary solution for users]

### Expected Fix
[Version when fix planned, or timeline]

### Links
- Original bug: Issue #123
- PR with compensating control: #456
```

---

## Waiver Process (Deferring Bugs)

### When to Waive

- **Low/Medium severity** bugs that don't block core functionality
- **Time constraints** prevent fixing before launch
- **Compensating control** in place (documented)
- **Risk assessment** confirms acceptable for launch

### Waiver Template

```markdown
## Bug Waiver: [Issue Title]

**Issue ID:** #456  
**Severity:** Medium  
**Requested By:** [QA Lead]  
**Approved By:** [Product Manager, CTO]  

### Justification
[Why we're deferring this bug]

### Compensating Controls
- [Control 1]
- [Control 2]

### Monitoring Plan
- [How we'll track impact post-launch]

### Post-Launch Action
- **Fix Target:** v1.1 (due Nov 15)
- **Owner:** [Developer]
- **Tracking:** Issue #456

### Sign-Off

- [ ] QA Lead: _________________ Date: _______
- [ ] Product Manager: _________________ Date: _______
- [ ] CTO: _________________ Date: _______
```

---

## Communication Template

### Daily Standup Update

```markdown
## Daily Bug Status – Oct 18, 2025

### Closed Since Yesterday
- ✅ [FIXED] Search XSS vulnerability (Issue #123)
- ✅ [VERIFIED] Mobile menu broken (Issue #124)

### In Progress
- 🔧 [WIP] Contact form validation (Issue #125) – 90% complete
- 🔧 [WIP] Performance optimization (Issue #126) – Needs review

### Blockers
- ⚠️ [BLOCKED] Database timeout (Issue #127) – Waiting on DevOps
- ⚠️ [BLOCKED] SSL certificate (Issue #128) – Waiting on vendor

### Next Steps
1. Merge search XSS fix
2. Complete form validation
3. Escalate database issue
4. Retest mobile flows

### Launch Readiness
- **Critical:** 0 remaining ✅
- **High:** 3 remaining ⚠️
- **On Track for Oct 31 Launch** (pending 3 high-priority fixes)
```

### Escalation Email

```
Subject: [URGENT] 2 Critical Bugs Block October Launch

Hi Team,

We have discovered 2 critical bugs that require immediate attention:

1. **XSS in Search** (Issue #123)
   - Severity: CRITICAL
   - Found: Oct 18, 9:00 AM
   - Impact: Attackers can inject malicious scripts
   - Estimated Fix: 2 hours
   - Owner: [Developer]

2. **Payment Processing Timeout** (Issue #124)
   - Severity: CRITICAL
   - Found: Oct 18, 2:00 PM
   - Impact: Users cannot complete purchases
   - Estimated Fix: 4 hours
   - Owner: [Backend Team]

**Recommendation:** Delay launch by 1-2 days to fix and test these issues.

**Next Steps:**
- Daily standup at 10 AM to monitor progress
- All other work deprioritized
- Testing team on standby for verification

Please confirm you can commit resources to fix these issues today.

Best regards,
QA Lead
```

---

## Sign-Off Template

```markdown
# Pre-Release Bug Report – Final Sign-Off

**Testing Period:** Oct 17–28, 2025  
**Final Report Date:** Oct 28, 2025

## Summary

- **Total Bugs Found:** 47
- **Fixed & Verified:** 44
- **Deferred (with approval):** 3
- **Critical Issues Remaining:** 0
- **High Issues Remaining:** 0

## Sign-Off

### QA Sign-Off
I certify that testing has been completed per the test plan, all critical and high-priority bugs have been fixed and verified, and the site is ready for production launch.

**QA Lead:** _________________ Date: _______

### Security Sign-Off
I certify that security testing has been completed, all high/critical vulnerabilities have been remediated, and security headers are in place.

**Security Engineer:** _________________ Date: _______

### Accessibility Sign-Off
I certify that accessibility testing has been completed per WCAG 2.1 AA, all critical failures have been fixed, and the site is accessible to users of assistive technologies.

**Accessibility Specialist:** _________________ Date: _______

### Product Sign-Off
I approve launching on [DATE]. Known deferred issues have been approved and compensating controls are in place.

**Product Manager:** _________________ Date: _______

### CTO Sign-Off
I approve launching on [DATE]. All technical requirements met, security measures in place, and deployment plan reviewed.

**CTO/Tech Lead:** _________________ Date: _______

---

**APPROVED FOR LAUNCH:** ✅ Yes | ❌ No  
**Launch Date:** October 31, 2025  
**Contingency Plan:** See [LINK]
```

---

## Resources

- **GitHub Issues:** https://github.com/3mpwrApp/3mpwrapp.github.io/issues
- **Bug Tracking Best Practices:** https://www.atlassian.com/agile/project-management/bug-tracking
- **CVSS Scoring:** https://www.first.org/cvss/calculator/3.1

