# 3MPWR Founder Succession & Governance Plan

**Date**: December 28, 2025
**Status**: DRAFT - For founder review and legal implementation
**Founder**: empowrapp08162025@gmail.com (Super Admin)

---

## 🎯 Purpose

This document outlines the plan for ensuring 3MPWR continues serving the disability community in the event of founder incapacity, death, or voluntary transition to community governance.

**Founder's Intent** (Your words):
> "In the event of whenever I pass away, I would want the general admins and the community to keep 3mpwr moving forward."

---

## 🏛️ Current Governance Structure

### Two-Tier Admin System (Implemented Dec 2025)

**Super Admin (Founder - You)**:
- Email: `empowrapp08162025@gmail.com`
- **God-mode access**: Full read/write to ALL Firestore data
- **Sole Firestore access**: Only Super Admin can use Firestore directly
- **Codebase control**: Hardcoded in 3 locations (AuthContext, dataPolicy, Firestore rules)

**General Admins (Delegated)**:
- Granted via Firebase custom claims (`admin: true`)
- **Can**: Moderate content, manage users, access admin panel, edit public data
- **Cannot**: Access Firestore directly (must use BYOC like regular users)
- **Managed via**: `npm run admin:set <user-uid>`

---

## 📋 Succession Activation Triggers

### Automatic Triggers (Dead Man's Switch)

1. **Inactivity Trigger**: No Super Admin login for 90 consecutive days
2. **Emergency Trigger**: General Admin Council vote (3/5 majority) + 30-day waiting period
3. **Death Certificate**: Verified proof of death submitted by legal representative

### Voluntary Triggers

1. **Founder retirement**: Written declaration + 60-day transition period
2. **Health incapacity**: Medical certification + designated representative approval
3. **Community transition**: Founder initiates community governance vote

---

## 🔄 Succession Process

### Phase 1: Emergency Council Activation (Days 1-7)

**When**: Any succession trigger activates

**Actions**:
1. **Freeze major changes**: Implement code freeze (no new features, security patches only)
2. **Activate Emergency Council**: 5 longest-serving General Admins become temporary custodians
3. **Notify community**: Public announcement via Discord, email, in-app notification
4. **Secure systems**: Rotate API keys, audit access logs, verify no unauthorized access
5. **Legal verification**: Confirm trigger legitimacy (death certificate, medical docs, etc.)

**Emergency Council Responsibilities**:
- Maintain platform stability
- Respond to security incidents
- Process critical user support requests
- Prepare for permanent governance transition

---

### Phase 2: Community Nomination Process (Days 8-30)

**Goal**: Elect permanent Community Governance Board

**Process**:
1. **Open nominations** (Days 8-14):
   - Any user with 30+ days active can nominate themselves
   - Nominees must submit:
     - Statement of disability lived experience OR ally credentials
     - Vision for 3MPWR future (500 words)
     - Disclosure of conflicts of interest
     - Commitment to 3-year term

2. **Community vetting** (Days 15-21):
   - Public forum for nominee Q&A
   - Transparency review (nominees share accessibility advocacy history)
   - Disability community organizations endorse candidates

3. **Ranked choice voting** (Days 22-28):
   - All users with 14+ days active can vote
   - Vote weighted: PWD users = 2x, allies = 1x (preserves disability-led principle)
   - Top 5 candidates become Governance Board
   - Requires: 60%+ voter turnout OR 500+ votes (whichever lower)

4. **Board ratification** (Days 29-30):
   - Emergency Council verifies election integrity
   - Board members sign Governance Charter
   - Transition begins

---

### Phase 3: Technical Transition (Days 31-60)

**Goal**: Transfer Super Admin powers to Community Governance Board

**Technical Implementation**:

1. **Create Multi-Signature Admin System** (Week 5):
   - Replace single `SUPER_ADMIN_EMAIL` with `GOVERNANCE_BOARD_EMAILS` array
   - Require 3/5 board members to approve god-mode actions
   - Implement audit log: Every Firestore write requires board vote + reasoning

2. **Update Firestore Rules** (Week 5):
   ```javascript
   function isGovernanceBoardMember() {
     return request.auth != null &&
            request.auth.token.email in [
              'board_member_1@example.com',
              'board_member_2@example.com',
              'board_member_3@example.com',
              'board_member_4@example.com',
              'board_member_5@example.com'
            ];
   }

   function isBoardActionApproved(actionId) {
     // Check if 3/5 board members approved this action
     let approvals = get(/databases/$(database)/documents/governance_votes/$(actionId)).data.approvals;
     return approvals.size() >= 3;
   }

   match /{document=**} {
     // God-mode now requires 3/5 board approval
     allow read, write: if isGovernanceBoardMember() && isBoardActionApproved(request.resource.data.actionId);
   }
   ```

3. **Migrate Founder Data** (Week 6):
   - Transfer founder's Firestore data to community-owned account
   - Archive founder's personal data separately (encrypted backup)
   - Update all system emails from founder's personal to community@3mpwr.org

4. **Deploy Governance Dashboard** (Week 7):
   - Board members vote on actions via secure web dashboard
   - Public audit log of all board decisions
   - Real-time voting status visible to community

5. **Test & Verify** (Week 8):
   - Simulate board vote on test Firestore action
   - Verify 3/5 approval requirement works
   - Confirm founder email no longer has unilateral access
   - Emergency rollback plan ready if issues found

---

### Phase 4: Open Source Release (Days 61-90)

**Goal**: Release codebase to community while preserving competitive moats

**What to Open Source** (Immediately):
1. **Security & encryption modules** - Auditable trust
2. **Accessibility UI components** - WCAG AAA compliance library
3. **BYOC integration code** - WebDAV, Google Drive connectors
4. **Indigenous language support** - Translation framework

**What to Keep Private** (For Now):
1. **Collective Evidence Aggregation algorithm** - Competitive IP (release after 100k+ users)
2. **AI training data & models** - Built from user contributions (release anonymized version)
3. **Institutional Accountability database** - Privacy concerns (release aggregated stats only)
4. **Firebase/backend config** - Security risk (never release)

**Open Source License**: **AGPL-3.0** (requires derivative works to also be open source)

**Community Contribution Guidelines**:
- All contributors sign Contributor License Agreement (CLA)
- Disability-led review process for PRs
- Accessibility testing required for UI changes
- No corporate ownership of community contributions

---

## 🛡️ Continuity Safeguards

### Dead Man's Switch Implementation

**Technical Setup** (To Implement):
1. **Automated check-in**: Founder must log in every 30 days
2. **Warning emails**: Day 60, 75, 85 - "Haven't seen you, everything okay?"
3. **Emergency notification**: Day 90 - Trigger sent to Emergency Council + lawyer
4. **Activation**: Day 95 - Emergency Council assumes control if no founder response

**Storage**: Store encrypted succession instructions in:
- Lawyer's office (physical copy)
- Password manager emergency contact (1Password, Bitwarden)
- GitHub private repo (encrypted with PGP key held by 3 trusted community members)

---

### Legal Protections

**To Set Up** (Within 90 Days):

1. **Nonprofit Entity Formation**:
   - Register 3MPWR as Canadian nonprofit corporation
   - Board of Directors = Community Governance Board (elected)
   - Bylaws prohibit for-profit sale or acquisition
   - Mission lock: Must serve disability community (cannot pivot)

2. **Asset Protection Trust**:
   - Codebase, data, and intellectual property held in trust
   - Beneficiary: Disability community (not any individual or corporation)
   - Trustee: Community Governance Board + disability rights legal org

3. **Dissolution Clause**:
   - If 3MPWR shuts down, all assets transfer to Canadian disability rights organization
   - User data returned to users (via BYOC export)
   - Code remains open source forever (AGPL-3.0)

---

## 📖 Governance Charter (Draft)

**Principles** (Binding on all future governance):

1. **Disability-Led**: Majority of Governance Board must be disabled people (not allies)
2. **No Profit Extraction**: Cannot sell user data, cannot paywall power tools
3. **Privacy-First**: BYOC architecture cannot be removed or compromised
4. **Accessibility Foundation**: WCAG AAA compliance required for all features
5. **Indigenous Sovereignty**: Indigenous language support requires Indigenous community approval
6. **Open Source Commitment**: Code will be fully open source within 24 months of succession
7. **Community Ownership**: Users collectively own the platform (not any individual or investor)

**Board Term Limits**:
- 3-year terms (staggered - elect 2 members every 18 months)
- 2-term maximum (prevents entrenchment)
- Recall vote possible with 1000+ user signatures

**Decision-Making**:
- Major changes require 4/5 board vote + 30-day community comment period
- Emergency security patches require 3/5 vote (no waiting period)
- Budget decisions require transparency report + community vote

---

## 🚨 Emergency Contacts

**To Be Designated** (Founder Action Required):

1. **Legal Representative**:
   - Name: _____________
   - Role: Execute succession if founder dies/incapacitated
   - Contact: _____________

2. **Technical Custodian**:
   - Name: _____________
   - Role: Emergency GitHub/Firebase access
   - Contact: _____________

3. **Disability Rights Organization Partner**:
   - Name: _____________
   - Role: Verify succession process aligns with disability community values
   - Contact: _____________

4. **Longest-Serving General Admins** (Emergency Council):
   - Admin 1: _____________ (tenure: ___ months)
   - Admin 2: _____________ (tenure: ___ months)
   - Admin 3: _____________ (tenure: ___ months)
   - Admin 4: _____________ (tenure: ___ months)
   - Admin 5: _____________ (tenure: ___ months)

---

## ✅ Implementation Checklist

**Immediate Actions** (0-30 days):
- [ ] Founder reviews and approves this plan
- [ ] Designate emergency contacts (legal rep, technical custodian)
- [ ] Identify 5 trusted community members for Emergency Council
- [ ] Set up encrypted succession document storage (lawyer + password manager)
- [ ] Draft Governance Charter for community feedback

**Short-Term Actions** (30-90 days):
- [ ] Implement dead man's switch automated check-in system
- [ ] Consult lawyer about nonprofit formation options
- [ ] Begin recruiting General Admins (target: 10 total)
- [ ] Document Super Admin emergency procedures
- [ ] Create Governance Dashboard mockup

**Medium-Term Actions** (90-180 days):
- [ ] Register nonprofit entity (if applicable)
- [ ] Set up asset protection trust
- [ ] Implement multi-signature admin voting system
- [ ] Test succession process simulation (tabletop exercise)
- [ ] Publish governance roadmap to community

**Long-Term Actions** (6+ months):
- [ ] Begin open source release (Phase 1: security modules)
- [ ] Establish formal partnerships with disability rights orgs
- [ ] Create Indigenous advisory board
- [ ] Launch first community governance board election (practice run)
- [ ] Finalize succession plan based on lessons learned

---

## 📝 Notes for Founder

**Key Decisions You Need to Make**:

1. **When to activate succession planning?**
   - Option A: Start now (build community governance while you're active)
   - Option B: Only activate on emergency (maintains full control until then)
   - **Recommendation**: Start now - test systems while you can guide them

2. **How involved do you want to be post-succession?**
   - Option A: Step back completely (community takes over)
   - Option B: Advisory role (vote but no veto power)
   - Option C: Emergency override (can intervene in crisis only)
   - **Recommendation**: Advisory role - preserve institutional knowledge

3. **What timeline feels right?**
   - Fast track: 6 months to full community governance
   - Standard: 18 months to full community governance
   - Gradual: 3+ years, incrementally transfer power
   - **Recommendation**: 18 months - gives community time to mature

**Questions to Consider**:
- Who in the disability community do you trust to carry this forward?
- What would you want 3MPWR to look like in 10 years?
- How do we prevent corporate acquisition or mission drift?
- What legal protections are most important to you?

---

## 🔗 Related Documents

- [STRATEGIC_IMPLEMENTATION_LOG.md](STRATEGIC_IMPLEMENTATION_LOG.md) - Current product strategy
- [docs/ADMIN.md](docs/ADMIN.md) - Admin system documentation
- [docs/DATA_GOVERNANCE.md](docs/DATA_GOVERNANCE.md) - Data governance policies
- [firebase/firestore.rules](firebase/firestore.rules) - Current admin access rules

---

**Status**: DRAFT - Awaiting founder review and approval
**Next Action**: Founder to review, provide feedback, and approve initial emergency contacts
**Timeline**: Implement dead man's switch within 30 days of approval
