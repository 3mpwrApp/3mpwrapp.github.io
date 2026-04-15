---
layout: post
title: "Security Fortress Complete: 24 Vulnerabilities Eliminated, Zero Compromises"
date: 2026-04-14
categories: [security, community-updates, transparency]
tags: [community-updates, security, announcement]
author: 3mpwrApp Security Team
permalink: /blog/2026/04/14/security-fortress-complete-24-vulnerabilities-eliminated/
excerpt: "Transparency update: We ran a routine security audit and found 24 potential security issues in our development tools (not the app itself). Think of them like unlocked doors we discovered before anyone could use them. Here's what we found and fixed."
image: /assets/images/security-fortress-complete-2026-04-14.png
---

# Security Fortress Complete: 24 Vulnerabilities Eliminated

**TL;DR:** During a routine security check, we found 24 potential security issues in our development tools (not the app itself). Think of them like unlocked doors we discovered before anyone could use them. We fixed all of them. **3mpwrApp was never attacked or compromised.** Beta testing resumes this week.

---

## What Are Vulnerabilities? (Plain English)

**Think of vulnerabilities like unlocked doors in a house:**
- They're potential ways someone *could* break in
- They don't mean someone *has* broken in
- Finding and fixing them before anyone discovers them = smart security

**What we did:** Ran a routine security audit on our development tools and website infrastructure (not the app itself). Found 24 potential security issues—like discovering 24 unlocked doors before any unwanted visitors showed up.

**Important:** 3mpwrApp was never attacked, hacked, or compromised. This is preventive maintenance, not crisis response.

---

## What We Found

**Date:** April 14, 2026  
**Context:** After the broader npm community experienced supply chain attacks in March 2026, we waited 11 days (to let security researchers identify all affected packages), then ran our own comprehensive audit.

**Result:** Found 24 vulnerabilities in our development tools and website systems, plus a configuration bug that was preventing some of our security updates from working properly.

## The Critical Bug: Duplicate Overrides

While reviewing `package.json`, we discovered something alarming:

```json
{
  "overrides": {
    "@sentry/browser": "^7.119.1",
    "node-forge": "^1.3.2",
    // ... 12 more security overrides
  },
  "overrides": {
    "lodash": "^4.17.21",
   "@xmldom/xmldom": "^0.9.0",
    // ... 7 more security overrides
  }
}
```

**The problem:** JSON only allows one property with the same name. The second `"overrides"` section was **silently overwriting the first one**, nullifying 12 security fixes we thought were active.

**This is why transparency matters.** We could have said "we have security overrides" and moved on. Instead, we're showing you the actual bug and how we fixed it.

---

## What We Fixed

### Before Security Audit
- **24 npm vulnerabilities**
  - 2 Critical
  - 9 High-severity
  - 1 Moderate
  - 12 Low-severity
- **30 GitHub Dependabot alerts**
- **Duplicate overrides configuration** (first section ignored)

### After Security Fixes
- **0 npm vulnerabilities** ✅
- **1 GitHub Dependabot alert** (97% reduction)
- **Single comprehensive override** (19 security packages)

---

## Critical Vulnerabilities Resolved

### 1. axios ≤ 1.14.0 (Critical)
**What is axios?** A tool our website build system uses to fetch data from the internet.

**What was wrong:** Old versions had bugs that could let attackers trick our build system into accessing things it shouldn't.

**Plain English impact:** Like someone finding a way to convince your mail carrier to deliver your neighbor's mail to them instead of you.

**Your data:** Never at risk. This affects our website build process, not user data.

**Fixed:** Updated to the latest secure version

**Prevention layer:** Our [.npmrc 7-day release age protection](/2026/04/01/npm-supply-chain-protection-npmrc-hardening/) would have blocked this even if we'd tried to install the compromised versions.

---

### 2. handlebars 4.0.0 - 4.7.8 (Critical)
**Issues:** 8 separate JavaScript injection vulnerabilities
- AST type confusion via `@partial-block` tampering
- Prototype pollution leading to XSS
- Missing `__lookupSetter__` blocklist entry
- Property access validation bypass
- Unescaped names in CLI precompiler
- Denial of Service via malformed decorator syntax

**Impact:** Template-based attacks could execute arbitrary JavaScript.

**Fixed:** Updated to ≥ 4.7.9

---

### 3. lodash ≤ 4.17.23 (High)
**Issues:**
- Code injection via `_.template` imports key names
- Prototype pollution via array path bypass in `_.unset` and `_.omit`

**Impact:** Attackers could modify object prototypes or inject code.

**Fixed:** Updated to ≥ 4.17.24

---

### 4. node-forge ≤ 1.3.3 (High)
**Issues:**
- Certificate chain verification bypass (RFC 5280 violation)
- Ed25519 signature forgery
- RSA-PKCS signature forgery due to ASN.1 extra field
- Denial of Service via infinite loop in `BigInteger.modInverse()` with zero input

**Impact:** Cryptographic security could be compromised.

**Fixed:** Updated to ≥ 1.3.4

---

### 5. basic-ftp ≤ 5.2.1 (High)
**Issues:**
- Incomplete CRLF injection protection
- Arbitrary FTP command execution via credentials and MKD commands

**Fixed:** Updated to ≥ 5.2.2

---

### 6. minimatch 9.0.0 - 9.0.6 (High)
**Issues:** 3 separate ReDoS (Regular Expression Denial of Service) vulnerabilities
- Repeated wildcards with non-matching literal
- Multiple non-adjacent GLOBSTAR segments
- Nested `*()` extglobs causing catastrophic backtracking

**Fixed:** Updated to ≥ 9.0.7

---

### 7. follow-redirects ≤ 1.15.11 (Moderate)
**Issue:** Custom authentication headers leak to cross-domain redirect targets

**Fixed:** Updated to ≥ 1.15.12

---

## What Wasn't Fixed (And Why)

**Remaining alert:** `@tootallnate/once < 3.0.1` (Low severity, dev dependency)

**Why we didn't fix it:** Requires `npm audit fix --force`, which would downgrade `firebase-admin` from 13.7.0 to 10.3.0 (a breaking change).

**Risk assessment:** Low-severity vulnerability in dev dependencies only, not present in production bundles. Acceptable residual risk.

---

## Our Protection Layers (All Active)

1. **Socket.dev GitHub App** - 24/7 monitoring of both app and website repos
2. **Socket.dev GitHub Actions** - Daily scans + PR checks
3. **.npmrc time-delay protection** - 7-day release age minimum
4. **.npmrc script blocking** - No install scripts allowed
5. **19 security overrides** - Now properly configured (bug fixed)
6. **GitHub Advanced Security** - Secret scanning + CodeQL
7. **BYOC architecture** - User data never touches our servers

---

## The Numbers

| Metric | Result |
|--------|--------|
| Total execution time | ~2 hours |
| Vulnerabilities eliminated | 24 → 0 (100%) |
| Critical vulnerabilities | 2 → 0 |
| High-severity vulnerabilities | 9 → 0 |
| Dependabot alerts | 30 → 1 (97% reduction) |
| npm packages changed | 6 packages updated, 1 added |
| Configuration bugs found | 1 (duplicate overrides) |

---

## What This Means for Beta Testers

**Short version:** Beta testing resumes this week.

**What's next:**
1. **Firebase integration fix** (in progress today)
2. **Sentry error monitoring setup** (in progress today)
3. **Production stress testing preparation** (this week)
4. **Beta tester email** (you'll get one today)

**Timeline:**
- April 14-15: Firebase/Sentry fixes
- April 16-17: Final pre-production testing
- April 17: Beta deadline (as previously announced)
- April 20-May 31: Production stress testing phase

---

## Lessons Learned

### 1. Always Verify Your Security Config
We thought we had 19 security overrides. We actually had 7, because the first 12 were being silently ignored. **Trust, but verify.**

### 2. Conservative Waiting Periods Work
We waited 11 days after the last axios attacks before running npm operations. All vulnerabilities were auto-fixed with `npm audit fix` - no manual intervention needed. **Patience prevented panic.**

### 3. Defense in Depth is Essential
Even with the duplicate overrides bug, our .npmrc protection would have blocked the axios attack. Multiple layers = safety margins. **Redundancy saves lives.**

### 4. Transparency Builds Trust
We could have quietly fixed this and never mentioned it. But you deserve to know when we mess up, how we found it, and what we did about it. **Honesty > marketing.**

---

## Documentation Created

We don't just fix things - we document them so future audits are easier:

1. **[SECURITY_STATUS_REPORT.md](https://github.com/S0vryn9-C011ect1ve/empowrapp-main/blob/main/docs/SECURITY_STATUS_REPORT.md)** - Comprehensive vulnerability breakdown
2. **[SECURITY_FIX_COMPLETE_SUMMARY.md](https://github.com/S0vryn9-C011ect1ve/empowrapp-main/blob/main/docs/SECURITY_FIX_COMPLETE_SUMMARY.md)** - Full timeline and results
3. **[comprehensive-security-fix.ps1](https://github.com/S0vryn9-C011ect1ve/empowrapp-main/blob/main/scripts/comprehensive-security-fix.ps1)** - Automated fix script for future use

All documentation is public on GitHub.

---

## Why We Do This Publicly

Most apps would fix these vulnerabilities quietly and never tell users. We're different:

**1. We're building for a community that's had too many secrets kept from them.** WSIB denials, ODSP cuts, inaccessible systems - you've been gaslit enough. Not here.

**2. Other developers can learn from our mistakes.** That duplicate overrides bug? Someone else will make it. Now they can search for this article and avoid it.

**3. Security through transparency works.** Open-source security is stronger than closed-source security. When our code is public, bugs get found faster.

**4. You deserve to know what protects your data.** You're trusting us with medical records, legal documents, and benefit applications. You have a right to know how we secure them.

---

## Next Steps

**For Beta Testers:**
- Watch your email today (subject: "Beta Testing Resumes: Firebase Fixed + Production Prep")
- Training sessions schedule this week
- April 17 deadline still stands

**For Our Team:**
- Complete Firebase/Sentry integration (today)
- Run full regression testing (April 15-16)
- Monitor Socket.dev dashboard daily
- Weekly security scan reports (automated)

**For the Community:**
- All security documentation is public on [GitHub](https://github.com/S0vryn9-C011ect1ve/empowrapp-main/tree/main/docs)
- Questions? Email empowrapp08162025@gmail.com or DM @3mpwrApp on Mastodon/Bluesky
- Want to audit our code? It's all open-source.

---

## Previous Security Updates

- [npm Supply Chain Protection Added (April 1, 2026)](/2026/04/01/npm-supply-chain-protection-npmrc-hardening/)
- [axios Supply Chain Attack: 3mpwrApp Safe (March 31, 2026)](/2026/03/31/axios-supply-chain-attack-3mpwrapp-safe/)
- [Security Runbook: How We Protect You (March 31, 2026)](/2026/03/31/security-runbook-how-we-protect-you/)

---

## Final Thought

**Security isn't a feature we added.** It's the foundation everything else is built on.

When you're storing medical records to fight a WSIB denial, when you're documenting symptoms for a CPP Disability appeal, when you're collecting evidence for a human rights complaint - **you need to trust that data is safe.**

Today we eliminated 24 vulnerabilities, fixed a critical configuration bug, and strengthened our defenses.

Tomorrow we keep building.

**Because collective empowerment requires collective security.**

---

**Questions? Concerns? Found a vulnerability?**  
Email: empowrapp08162025@gmail.com  
Mastodon: [@3mpwrApp@mastodon.social](https://mastodon.social/@3mpwrApp)  
Bluesky: [@3mpwrapp.bsky.social](https://bsky.app/profile/3mpwrapp.bsky.social)  
GitHub: [Security Advisories](https://github.com/S0vryn9-C011ect1ve/empowrapp-main/security/advisories)

**All code is open-source. All security documentation is public. Always.**
