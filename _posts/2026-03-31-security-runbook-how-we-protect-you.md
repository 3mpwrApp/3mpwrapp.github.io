---
layout: post
title: "Our Security Runbook: How We Protect You During Emergencies"
date: 2026-03-31 20:00:00 -0400
categories: [security, transparency]
author: 3mpwr App Team
description: "Learn about our emergency security response procedures and how we handled today's npm supply chain attack."
permalink: /2026/03/31/security-runbook-how-we-protect-you/
---

## Why We're Sharing This

Today's axios supply chain attack showed why transparency matters. You deserve to know exactly how we protect your data when threats emerge. This is our emergency response playbook—the same procedures we followed today.

* * *

## Our 4-Step Emergency Response

### Step 1: Detect (Minutes 0-5)

**What We Monitor:**
- Automated security scans (Socket.dev, Dependabot, GitHub Advanced Security)
- npm package advisories and security bulletins
- Community reports (GitHub Security Lab, npm security team)
- Social media security alerts (InfoSec community)

**Today's Example:**
We detected axios 1.14.0/1.14.1/0.30.4 compromise reports on March 31 at approximately 9:00 AM UTC through security community alerts.

### Step 2: Assess (Minutes 5-30)

**Our Verification Process:**

1. **Check Our Dependencies**
   ```
   ✓ Review package-lock.json for exact versions
   ✓ Scan node_modules for compromised packages
   ✓ Verify installation timestamps vs. attack timeline
   ```

2. **Identify Impact Scope**
   - Which workspaces are affected?
   - What data could be at risk?
   - Are user devices compromised?

3. **Determine Severity**
   - Critical: Immediate user data risk
   - High: Potential future exposure
   - Medium: Indirect dependency risk
   - Low: Development-only impact

**Today's Assessment:**
- ✅ **Status:** SAFE - Using axios 1.13.6 (February 27, 2026)
- ✅ **Last Install:** March 30, 2026 (before attack)
- ✅ **User Impact:** NONE
- ✅ **Action Required:** Halt npm operations until all-clear

### Step 3: Mitigate (Minutes 30-60)

**Immediate Actions:**

**If Compromised:**
1. Disconnect affected systems from network
2. Revoke all API keys and tokens
3. Force password reset for affected accounts
4. Preserve forensic evidence
5. Contact users within 1 hour

**If Safe (Like Today):**
1. ✅ Halt all npm install/update operations
2. ✅ Disable automated dependency updates (Dependabot)
3. ✅ Document safe versions in use
4. ✅ Monitor for package updates
5. ✅ Prepare communication for users

**Today's Mitigation:**
- Disabled Dependabot to prevent auto-updates
- Created verification script (safe-package-verify.ps1)
- Documented safe versions: axios 1.13.6
- Published blog posts confirming user safety
- Updated security documentation

### Step 4: Recover (Hours 1-72)

**Communication Timeline:**

**Hour 1:** Internal verification complete
**Hour 2-4:** Publish initial safety status (blog, email, social)
**Day 1-3:** Daily monitoring, update communications
**Day 3-7:** All-clear confirmation, resume normal operations

**What We Tell You:**
1. **What happened** - Clear explanation of the threat
2. **Are you affected?** - Direct answer (yes/no)
3. **What we did** - Specific actions taken
4. **What you should do** - Clear user instructions
5. **When it's safe** - Timeline for resolution

**Long-Term Actions:**
- Root cause analysis
- Update security procedures
- Add detection for similar attacks
- Review vendor security practices
- Conduct security drills

* * *

## How You Can Help

### Report Security Issues

**If you discover a vulnerability:**

**Email:** empowrapp08162025@gmail.com  
**Subject:** "SECURITY: [Brief Description]"

**What to include:**
- Vulnerability description
- Steps to reproduce
- Potential impact
- Your contact info (optional for anonymity)

**Our Response Time:**
- Critical: Within 4 hours
- High: Within 24 hours
- Medium: Within 72 hours
- Low: Within 1 week

### What To Do During An Incident

**If We Send You A Security Alert:**

1. **Read it immediately** - We only send alerts for real threats
2. **Follow instructions** - May include password changes, app updates, or data verification
3. **Don't panic** - We'll tell you exactly what to do
4. **Ask questions** - Email or contact us if anything is unclear
5. **Verify it's really us** - Check sender email matches empowrapp08162025@gmail.com

**Red Flags (Contact Us Immediately):**
- App asks for passwords unexpectedly
- Strange network activity
- Unusual permission requests
- Data appears modified
- App behavior changes suddenly

* * *

## Our Security Layers

**Layer 1: Supply Chain Protection**
- Socket.dev automated scanning
- Locked dependency versions
- Publisher verification
- Malicious package detection

**Layer 2: Code Security**
- GitHub Advanced Security
- Secret scanning
- Code scanning (CodeQL)
- Automated vulnerability alerts

**Layer 3: Infrastructure Security**
- Cloudflare DDoS protection
- Firebase security rules
- Encrypted data at rest (AES-256)
- Encrypted data in transit (TLS 1.3)

**Layer 4: Access Control**
- Multi-factor authentication (2FA)
- Branch protection rules
- Deploy key rotation
- Principle of least privilege

**Layer 5: Monitoring & Response**
- 24/7 automated monitoring
- Security community engagement
- Incident response procedures
- Regular security audits

**Layer 6: Transparency**
- Public security changelog
- Incident disclosure policy
- Open-source verification
- Community security reports

* * *

## Real-World Example: Today's Axios Attack

**Timeline:**

**March 27, 2026 (19:01 UTC):** axios 1.14.0 published with malicious code  
**March 31, 2026 (00:21 UTC):** axios 1.14.1 published (continued attack)  
**March 31, 2026 (01:00 UTC):** axios 0.30.4 published (version spoofing)  
**March 31, 2026 (09:00 UTC):** Security community detects compromise  
**March 31, 2026 (10:00 UTC):** We verify our safety status  
**March 31, 2026 (12:00 UTC):** Blog posts published confirming safety  
**March 31, 2026 (14:00 UTC):** Socket.dev integration completed  
**March 31, 2026 (20:00 UTC):** This runbook published  

**Our Response:**
✅ Verified safe within 1 hour of detection  
✅ Published transparency blog within 3 hours  
✅ Strengthened defenses within 5 hours  
✅ Zero user impact  
✅ Zero data compromise  

* * *

## Questions & Answers

**Q: How do I know if a security alert is really from you?**  
A: Legitimate alerts come from empowrapp08162025@gmail.com and are always posted on our blog at 3mpwrapp.pages.dev. We will NEVER ask for passwords via email.

**Q: What data do you collect that could be at risk?**  
A: We follow a "bring your own cloud" model. Your personal data stays on YOUR devices or YOUR cloud accounts (Google Drive, Dropbox). We don't host your sensitive information.

**Q: Have you ever had a security breach?**  
A: No. We launched in 2025 and have maintained a zero-breach record. Today's axios incident is the first major supply chain attack we've responded to, and we were not affected.

**Q: How often do you update security procedures?**  
A: We review procedures quarterly and update immediately after any incident (like today). This runbook will be reviewed on June 30, 2026.

**Q: Can I see your security code?**  
A: Our security infrastructure code is available on GitHub. Sensitive implementation details (like API keys, encryption keys) are never published.

**Q: What if I don't use the app but want to report a website security issue?**  
A: Same process - email empowrapp08162025@gmail.com with subject "SECURITY: Website Vulnerability". We treat all reports seriously.

* * *

## Commitment To You

**We Promise:**
- To detect threats quickly through automated monitoring
- To verify our safety status within hours of any incident
- To communicate clearly and honestly about risks
- To protect your data with multiple security layers
- To learn from every incident and strengthen our defenses
- To never hide security issues from you

**You Can Expect:**
- Transparent incident reporting
- Clear action steps during emergencies
- Regular security updates
- Responsive support for security concerns
- Continuous improvement of protections

* * *

## Stay Informed

**Subscribe for Security Alerts:**
- Blog RSS: [https://3mpwrapp.pages.dev/feed.xml](https://3mpwrapp.pages.dev/feed.xml)
- Email updates: Coming soon for beta testers
- Social media: [@3mpowrApp0816](https://x.com/3mpowrapp0816)

**Latest Security Status:**
- [Security Policy](https://3mpwrapp.pages.dev/security/)
- [Blog Posts](https://3mpwrapp.pages.dev/)
- [GitHub Security Advisories](https://github.com/S0vryn9-C011ect1ve/empowrapp-main/security/advisories)

* * *

**Last Updated:** March 31, 2026  
**Next Review:** June 30, 2026  
**Questions?** Email empowrapp08162025@gmail.com

---

*This runbook is part of our commitment to transparency and user safety. We believe you have the right to know exactly how we protect your data.*
