# Project Protection Strategy - Preventing Hijacking & Exploitation

**Created:** May 23, 2026  
**Purpose:** Protect 3mpwrApp from being copied, commercialized, or hijacked by bad actors  
**Risk Level:** MEDIUM-HIGH (open source project with zero budget, disabled founder, valuable data)

---

## 🚨 The Threat Landscape

**Your concerns are 100% valid.** Here's what could happen without protection:

### **Scenario 1: Commercial Exploitation**
- Insurance company clones 3mpwrApp, removes BYOC feature, harvests user data, sells to IME clinics
- "3mpwrApp Pro" launched by VC-backed startup, charges $99/month, outcompetes free version with marketing budget

### **Scenario 2: Hostile Fork**
- Disgruntled contributor forks code, launches "3mpwrApp Alternative", splinters community
- Original project loses momentum, users confused about which is "real"

### **Scenario 3: Brand Confusion**
- Copycat sites using similar names: "3mpower", "ThreeMPWR", "3mpwr.app"
- Users accidentally submit data to fake sites thinking it's you

### **Scenario 4: Data Mining**
- Someone clones your tribunal database (134,000+ decisions), repackages as paid "legal research tool"
- Sells subscriptions to lawyers for $200/month, profits from your work

### **Scenario 5: Corporate Takeover Attempt**
- Large legal tech company offers to "acquire" 3mpwrApp (or just copies it outright)
- Pressures partnerships: "Work with us or the real 3mpwrApp"

---

## 🛡️ 5-Layer Protection Strategy

### **Layer 1: Licensing (MOST IMPORTANT)**

**Current Status:** Need to verify what license you're using

**Recommended License:** **AGPL-3.0 (GNU Affero General Public License v3.0)**

**Why AGPL-3.0?**
- ✅ **Copyleft:** Anyone who modifies your code MUST share their changes publicly
- ✅ **Network Protection:** If someone runs your code on a server (web app), they MUST make source code available
- ✅ **Prevents Commercial Closed-Source Clones:** Can't take your code, add features, and sell closed-source "Pro" version
- ✅ **Community-Friendly:** Other nonprofits, activists, and community orgs CAN use and improve your code
- ❌ **Blocks:** Insurance companies, VC-funded startups, anyone who wants to profit without contributing back

**Alternative Licenses (Less Protective):**

| License | Protection Level | Allows Commercial Use | Forces Source Sharing |
|---------|------------------|----------------------|----------------------|
| **AGPL-3.0** | 🟢 STRONGEST | Yes, but must share code | ✅ YES (even web apps) |
| **GPL-3.0** | 🟡 STRONG | Yes, but must share code | ✅ YES (but not web apps) |
| **MIT** | 🔴 WEAK | Yes, can keep closed | ❌ NO |
| **CC BY-NC-SA 4.0** | 🟡 STRONG | ❌ NO (non-commercial) | ✅ YES |

**AGPL-3.0 is your best defense.**

**Action Items:**
1. Add `LICENSE` file to GitHub repo with AGPL-3.0 text
2. Add license header to every code file
3. Update README to state: "Licensed under AGPL-3.0"
4. Add badge to website: "Free & Open Source (AGPL-3.0)"

---

### **Layer 2: Trademark Protection (NAME & LOGO)**

**Current Status:** "3mpwrApp" is your brand, but likely not trademarked

**The Problem:**
- Anyone can create "3mpwrApp Pro", "3mpwrApp Plus", "3mpwrApp Canada" and confuse users
- Copycat sites using similar names/logos

**Solution: Trademark Registration**

**Option A: Canadian Trademark (RECOMMENDED)**
- **Cost:** ~$300-500 CAD for DIY filing (Canadian Intellectual Property Office)
- **Time:** 12-18 months to approval
- **Protection:** Canada-wide
- **What to trademark:** "3mpwrApp" name + logo (if you have one)

**Option B: Community Trademark (Zero Cost Alternative)**
- **Rely on "common law" trademark:** You don't register, but you establish first use
- **Risk:** Harder to enforce, but free
- **How:** Date all your releases, keep records of when you launched

**Action Items (Budget-Friendly):**
1. **Short-term (free):** Add "™" symbol next to 3mpwrApp everywhere (claims common law trademark)
2. **Document first use:** Screenshot your GitHub commits, website launches, app store submissions
3. **Add trademark notice to website:**  
   > "3mpwrApp™ is a trademark of [Your Legal Name]. Unauthorized use is prohibited."
4. **Long-term (when budget allows):** File for Canadian trademark (~$300-500)

---

### **Layer 3: Domain & Social Media Protection**

**Current Status:** You own 3mpwrapp.ca and app.3mpwrapp.ca

**The Risk:** Squatters could register:
- 3mpwrapp.com (divert traffic)
- 3mpwrapp.org (confuse users)
- 3mpwr.ca (typo squatting)
- @3mpwrapp on Twitter, Instagram, TikTok

**Action Items:**
1. **Register defensive domains (if budget allows):**
   - 3mpwrapp.com ($15/year)
   - 3mpwrapp.org ($15/year)
   - 3mpwr.ca ($15/year)
   - 3mpower.ca ($15/year)
   - **Total:** ~$60/year for protection

2. **Claim social media handles (FREE):**
   - Twitter/X: @3mpwrApp
   - Instagram: @3mpwrApp
   - TikTok: @3mpwrApp
   - Reddit: r/3mpwrApp
   - Facebook: facebook.com/3mpwrApp
   - LinkedIn: linkedin.com/company/3mpwrapp
   - **Even if you don't use them immediately,** claim them so no one else can

3. **Set up domain forwarding (FREE):**
   - Redirect all defensive domains to 3mpwrapp.ca

---

### **Layer 4: Data Protection (TRIBUNAL DATABASE)**

**Your tribunal database (134,000+ decisions) is HUGELY valuable.**

**The Risk:**
- Someone scrapes your database, repackages as paid legal research tool
- You've done all the work (parsing, analyzing, tagging), they profit

**Legal Protection:**
- **Public domain data:** Tribunal decisions are public, so anyone can access them
- **Database rights:** Your SELECTION, ARRANGEMENT, and ANNOTATIONS may be protected
- **Licensing:** Your database is a "creative work" and can be licensed

**Action Items:**
1. **License your database separately:**  
   - Add `data/LICENSE` file: "Database licensed under ODbL 1.0 (Open Database License)"
   - **ODbL requires:** Anyone using your database must SHARE THEIR IMPROVEMENTS
   - Example: If someone adds tagging to your data, they must give you the improved data

2. **Add attribution requirement:**  
   - Anyone using your database MUST credit: "Data from 3mpwrApp (3mpwrapp.ca)"

3. **Document your process:**  
   - Your scraping scripts, parsing logic, analysis methods = copyrightable
   - License those under AGPL-3.0 (so no one can commercialize them)

4. **Watermark your data (optional):**  
   - Add metadata: "Processed by 3mpwrApp on [date]"
   - Helps prove someone copied YOUR database, not just the raw tribunal data

---

### **Layer 5: Community Governance (PREVENT HOSTILE FORKS)**

**The Risk:**
- Contributor disputes → fork → community splits → original project dies
- "Council takeover" → bad actor gains control, changes mission

**Solution: Governance Document**

**Action Items:**
1. **Create `GOVERNANCE.md` file** (see template below)
2. **Document decision-making process:**  
   - Who decides: Feature roadmap, partnership approvals, moderation policies?
   - How are disputes resolved?
   - Can someone "take over" the project?

3. **Establish Benevolent Dictator For Life (BDFL) model:**  
   - **You** (founder) have final say on:
     - Mission and values (non-negotiable)
     - Partnership approvals (who we work with)
     - Branding and messaging
   - **Community** has input on:
     - Feature requests
     - Bug prioritization
     - Content contributions

4. **Document what happens if you become incapacitated** (Dead Man's Switch scenario):
   - Emergency Council (3-5 trusted people) takes over temporarily
   - Council CANNOT change mission or sell project
   - Council's job: Keep servers running, maintain code, find new maintainer

5. **Add fork policy to README:**
   > **Forking Policy:**  
   > 3mpwrApp is open source (AGPL-3.0), so you're free to fork the code. However:  
   > - You MUST use a different name (not "3mpwrApp")  
   > - You MUST share your source code (AGPL-3.0 requirement)  
   > - You MUST credit the original project  
   > - You CANNOT claim to be the "official" 3mpwrApp  
   >
   > **Hostile forks will be publicly called out.** We support friendly collaboration, not community splitting.

---

## 📋 Governance Template (For Your Repo)

**Add this as `GOVERNANCE.md` in your GitHub repo:**

```markdown
# 3mpwrApp Governance Model

## Mission & Values (NON-NEGOTIABLE)

The following are the **permanent, unchangeable mission** of 3mpwrApp:

1. **Free & accessible** to all injured workers and disabled people (no paywalls)
2. **Privacy-first** (BYOC architecture, zero data collection, users own their data)
3. **Community-led** (decisions guided by injured workers, not corporations)
4. **Disability justice** (intersectional, anti-ableist, pro-labor)
5. **Open source** (AGPL-3.0, transparent development)

**These values CANNOT be changed, even by the founder.**  
Anyone who tries to commercialize, surveil, or exploit this project is violating its core mission.

---

## Decision-Making Structure

### **Founder (BDFL - Benevolent Dictator For Life)**

**Current Founder:** [Your Name]

**Final authority on:**
- Mission and values (guardian of non-negotiables)
- Partnership approvals (who we work with)
- Branding and messaging (name, logo, tone)
- Major architectural decisions (BYOC, Firebase, etc.)
- Moderation policies (community standards)

**Cannot unilaterally decide:**
- Nothing. This is a BDFL model. BUT founder commits to:
  - Listening to community feedback
  - Transparent decision-making (explain why)
  - Stepping down if unable to serve mission

---

### **Community Contributors**

**Anyone can contribute** (code, content, feedback) via:
- GitHub pull requests
- Community forum suggestions
- Beta testing feedback

**Community input shapes:**
- Feature prioritization
- Bug fixes
- Content improvements
- Translations

**Final approval:** Founder (or designated maintainers)

---

### **Emergency Council (Activated if Founder Incapacitated)**

**Purpose:** Keep 3mpwrApp running if founder becomes unable to maintain project (illness, death, burnout, etc.)

**Current Council Members:**  
_[To be established - need 3-5 trusted people from different organizations]_

**Council Powers (TEMPORARY, until new maintainer found):**
- Keep servers running (pay bills, renew domains)
- Merge critical bug fixes
- Respond to partnership inquiries
- Moderate community (enforce Code of Conduct)

**Council CANNOT:**
- Change mission or values
- Sell or commercialize project
- Grant exclusive partnerships
- Change license
- Rebrand or rename

**Council Activation:**
- Triggered by Dead Man's Switch (90 days of founder inactivity)
- Council votes to activate (3/5 majority)
- Council publicly announces activation + plan
- Council recruits new maintainer within 6 months
- Council dissolves once new maintainer confirmed

---

## Forking Policy

3mpwrApp is open source (AGPL-3.0). You're free to fork, but:

**Friendly Forks (ENCOURAGED):**
- Regional adaptations (e.g., "3mpwrApp Quebec" for French-first version)
- Specialized versions (e.g., "3mpwrApp for Construction Workers")
- Must use different name, credit original, share improvements

**Hostile Forks (DISCOURAGED):**
- Forks that commercialize (charge fees, sell data)
- Forks that violate privacy (remove BYOC, add tracking)
- Forks that claim to be "official" 3mpwrApp
- **We will publicly call out hostile forks** and warn community

---

## Dispute Resolution

**If disagreements arise:**
1. **Direct conversation** (DM, email, or call)
2. **Mediation** (neutral third party from community)
3. **Founder decides** (final authority)
4. **Dissenter can fork** (but must follow fork policy)

**Transparency:** Major disputes will be documented publicly (anonymized if needed)

---

## Succession Plan

**If founder steps down voluntarily:**
- Founder nominates successor (or Emergency Council recruits)
- Successor must commit to mission/values
- 30-day transition period
- Public announcement

**If founder becomes incapacitated (Dead Man's Switch):**
- See Emergency Council activation process above

---

**Last Updated:** May 23, 2026  
**Questions?** Email empowrapp08162025@gmail.com
```

---

## 🚀 Implementation Checklist (Priority Order)

### **THIS WEEK (Critical):**
- [x] Create `GOVERNANCE.md` (use template above)
- [ ] Add AGPL-3.0 license to GitHub repo (if not already)
- [ ] Add trademark notice to website footer: "3mpwrApp™ is a trademark of [Your Name]"
- [ ] Claim social media handles (@3mpwrApp on Twitter, Instagram, TikTok, Reddit)

### **THIS MONTH (High Priority):**
- [ ] Add ODbL license to tribunal database (`data/LICENSE`)
- [ ] Document your first use of "3mpwrApp" name (GitHub commit dates, app store submission)
- [ ] Create fork policy in README
- [ ] Add license headers to all code files

### **NEXT 3 MONTHS (Medium Priority):**
- [ ] Register defensive domains (3mpwrapp.com, .org, 3mpwr.ca) - ~$60/year
- [ ] Recruit Emergency Council members (3-5 people from community)
- [ ] Set up Dead Man's Switch (already in RISK_MITIGATION_PLAN.md)

### **NEXT 12 MONTHS (Low Priority, When Budget Allows):**
- [ ] File Canadian trademark application (~$300-500)
- [ ] Legal review of governance docs (pro-bono lawyer or law clinic)

---

## 💰 Budget Reality Check

**Zero-Cost Protection (Immediate):**
- ✅ AGPL-3.0 license (free)
- ✅ Governance documentation (free)
- ✅ Social media handle claiming (free)
- ✅ Trademark common law notice (free)
- ✅ Fork policy (free)

**Low-Cost Protection (When Budget Allows):**
- $60/year: Defensive domains
- $300-500: Canadian trademark filing

**The best protection is FREE (licensing + governance).** Do that immediately.

---

## ⚖️ Legal Disclaimer

**I am not a lawyer.** This is general guidance based on open-source best practices. For formal legal advice:
- **Community Legal Clinic:** Kinna-Aweya or your local clinic (free)
- **Pro-Bono Lawyers:** PBLO.org (Pro Bono Law Ontario)
- **Samuelson-Glushko Canadian Internet Policy & Public Interest Clinic (CIPPIC):** Free IP advice for nonprofits

---

## 🎯 Summary: Your Best Defense

1. **AGPL-3.0 license** = Prevents commercial closed-source clones
2. **Trademark notice** = Protects your name
3. **Governance doc** = Prevents hostile takeover
4. **Social media handles** = Prevents brand confusion
5. **Database license (ODbL)** = Protects your data work
6. **Dead Man's Switch** = Protects project if you're incapacitated

**Total cost to implement: $0** (except domain registration later)

**Your concerns are valid, but you're not defenseless.** Open source has strong protections when done right.

---

**Questions? Let's discuss which protections to implement first.** 🛡️
