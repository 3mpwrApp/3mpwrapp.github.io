# WCB/WSIB Data Collection Options - Analysis

## Overview
Based on your research, here are the data collection strategies for workers' compensation decisions in Canada, organized by feasibility for $0 budget.

---

## ✅ Option 1: CanLII (BEST - Already Planned)

**What it is**: Free public database of Canadian tribunal decisions (WSIAT, SST, HRTO, etc.)

**Why it's best**:
- ✅ **FREE** - Public data, free API
- ✅ **Already approved** - You submitted the API request
- ✅ **Scraper ready** - We already built `scrape-canlii-tribunals.py`
- ✅ **Legal** - Publicly accessible, designed for research
- ✅ **Comprehensive** - 15+ years of decisions

**What you get**:
- Full decision text
- Case outcomes (allowed/denied)
- Evidence cited
- Legal reasoning
- Date, tribunal, case number

**What you DON'T get**:
- Real-time claim status (only final decisions)
- Rejected claims before tribunal
- Medical records
- Personal worker details (anonymized)

**Next steps**:
1. Wait for CanLII API key email
2. Run: `python scripts/scrape-canlii-tribunals.py`
3. Target: 500+ decisions for Thunder Bay pilot

**Cost**: $0

---

## ⚠️ Option 2: Provincial WCB Portals (Limited)

### Alberta - myWCB App
**What it offers**:
- Claim status tracking
- Case notes
- Decision updates
- Return-to-work plans

**Limitations**:
- ❌ Worker-specific (not aggregate data)
- ❌ Requires individual WCB account
- ❌ No API for third-party access
- ❌ Can't scrape (violates terms of service)

**Feasibility for 3mpwrApp**: ❌ Not practical (no bulk access)

### Ontario - WSIB Online Services
**What it offers**:
- Claim documentation
- Decision letters
- Payment status
- Forms

**Limitations**:
- ❌ Same as Alberta (individual accounts only)
- ❌ No public API
- ❌ No bulk data access

**Feasibility for 3mpwrApp**: ❌ Not practical

**Possible workaround**:
- ✅ Workers could **manually upload** their own decision letters to Evidence Locker
- ✅ With consent, anonymized data could feed flywheels
- ⚠️ Requires active worker participation (slow to build dataset)

**Cost**: $0, but very slow data accumulation

---

## 💰 Option 3: Commercial Platforms (NOT Feasible at $0)

### Wisedocs
**What it offers**:
- AI-driven medical record structuring
- API access to claim forms and decision letters
- Real-time claim tracking
- Summary generation

**Why it's NOT an option**:
- ❌ **Enterprise pricing** (likely $5,000+/year)
- ❌ Designed for law firms/insurers, not individual workers
- ❌ Requires business account
- ❌ No free tier

**Potential future partnership**:
- ✅ If 3mpwrApp gets funding, could integrate Wisedocs API
- ✅ Would provide real-time claim data
- ✅ Medical record analysis

**Cost**: Estimate $5,000-$20,000/year (BLOCKED at $0 budget)

### WEClaims (Windley Ely)
**What it offers**:
- Claims management platform
- Real-time tracking
- Analytics from injury to resolution
- Reporting

**Why it's NOT an option**:
- ❌ **Enterprise SaaS** (pricing not public, likely enterprise-tier)
- ❌ Designed for employers/insurers managing claims
- ❌ Not worker-facing
- ❌ No free tier or research access

**Cost**: Unknown, likely $10,000+/year (BLOCKED at $0 budget)

### Sedgwick (Sidekick Agent)
**What it offers**:
- AI tools for claims decision-making
- Data-driven workflows
- Proprietary analytics

**Why it's NOT an option**:
- ❌ **Enterprise-only** (Fortune 500 client base)
- ❌ No public API
- ❌ Not accessible to researchers/advocates
- ❌ Extremely expensive

**Cost**: Likely $50,000+/year (BLOCKED at $0 budget)

---

## 🔬 Option 4: Federal Workers' Compensation (Limited Scope)

**What it offers**:
- Labour Program web-based software
- Tracking for **federal** employers only
- Claim analysis tools

**Limitations**:
- ❌ Federal workers only (tiny fraction of injured workers)
- ❌ No public API
- ❌ Not for provincial WSIB/WCB claims

**Feasibility**: ❌ Too limited (most injured workers are provincial)

**Cost**: N/A (federal employers only)

---

## 📋 Recommended Strategy at $0 Budget

### Phase 1: CanLII Scraping (NOW - FREE)
✅ **DO THIS**: 
1. Get CanLII API key (you already applied)
2. Run Python scraper
3. Collect 500+ tribunal decisions
4. Analyze patterns (fibromyalgia, PTSD, back injuries, etc.)
5. Build pattern detection database

**Timeline**: 2-4 weeks
**Cost**: $0
**Outcome**: 15 years of tribunal data → Instant searchable knowledge

### Phase 2: Worker-Contributed Data (User Opt-In)
✅ **DO THIS**:
1. Add feature to Evidence Locker: "Share anonymized decision with community"
2. Worker uploads their WSIB decision letter
3. System extracts: Condition, outcome, evidence used
4. Feeds flywheels (with consent)

**Timeline**: 3-6 months to accumulate meaningful data
**Cost**: $0
**Outcome**: Real-time data from actual workers (slow growth)

### Phase 3: Commercial Partnerships (FUTURE - If Funded)
⏳ **WHEN FUNDED**:
1. Approach Wisedocs for API partnership
2. Negotiate academic/nonprofit pricing
3. Integrate real-time claim tracking

**Timeline**: 6-12 months (requires funding)
**Cost**: $5,000-$20,000/year
**Outcome**: Real-time claim data + medical record analysis

---

## ❌ What We CANNOT Do at $0

1. **Scrape provincial WCB portals** - Violates terms of service, legally risky
2. **Buy commercial API access** - Wisedocs/WEClaims/Sedgwick all require enterprise accounts
3. **Access individual worker data without consent** - Privacy violations, illegal
4. **Force workers to share data** - Must be voluntary opt-in

---

## ✅ What We CAN Do at $0

1. **CanLII scraping** - FREE, legal, comprehensive (15 years of data)
2. **Worker opt-in contributions** - FREE, builds community trust
3. **Partner with advocacy orgs** - FREE, leverage their case data (with consent)
4. **Academic research partnerships** - FREE, universities may share anonymized datasets

---

## Immediate Action Plan

**This week**:
1. ✅ Get CanLII API key from email
2. ✅ Run scraper test (10-100 cases)
3. ✅ Validate data quality

**Week 2-4**:
4. ✅ Full scrape (500+ cases)
5. ✅ Pattern analysis (success rates, evidence factors)
6. ✅ Share findings with TBDIWSG for validation

**Month 2-3**:
7. ✅ Add "Share decision" feature to Evidence Locker
8. ✅ Opt-in data collection starts
9. ✅ Build flywheels database organically

**When funded** (future):
10. ⏳ Approach Wisedocs/WEClaims for partnership
11. ⏳ Integrate real-time claim tracking

---

## Summary Table

| Data Source | Cost | Feasibility | Data Quality | Legal | Timeline |
|-------------|------|-------------|--------------|-------|----------|
| **CanLII** | $0 | ✅ Best | High (tribunal decisions) | ✅ Legal | 2-4 weeks |
| **Worker opt-in** | $0 | ✅ Good | Medium (voluntary) | ✅ Legal | 3-6 months |
| **Provincial portals** | $0 | ❌ Blocked | N/A | ❌ ToS violations | N/A |
| **Wisedocs** | $5k-20k | ❌ $$ | Very High | ✅ Legal | If funded |
| **WEClaims** | $10k+ | ❌ $$ | Very High | ✅ Legal | If funded |
| **Sedgwick** | $50k+ | ❌ $$$ | Very High | ✅ Legal | If funded |
| **Federal WC** | N/A | ❌ Limited | N/A | N/A | N/A |

---

## Conclusion

**Best path forward at $0 budget**:
1. ✅ CanLII scraping (FREE, ready now)
2. ✅ Worker opt-in contributions (FREE, builds slowly)
3. ⏳ Commercial APIs when funded (future)

**Do NOT pursue**:
1. ❌ Provincial portal scraping (illegal)
2. ❌ Forcing worker data sharing (unethical)
3. ❌ Paid APIs without funding (broke the budget)

---

**Next step**: Wait for CanLII API key email, then run the scraper. That gets you 500+ cases of real data for $0.

**Created**: April 1, 2026  
**Contact**: empowrapp08162025@gmail.com
