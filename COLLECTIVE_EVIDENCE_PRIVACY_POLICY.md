# Collective Evidence Privacy Policy

**Last Updated**: December 29, 2025
**Effective Date**: December 29, 2025
**Version**: 1.0

---

## Overview

The 3MPWR App's **Collective Evidence** feature allows users to voluntarily contribute anonymized evidence to help detect patterns of discrimination in disability benefit denials, healthcare denials, and accommodation requests. This document explains how we protect your privacy while enabling collective power.

---

## What is Collective Evidence?

Collective Evidence is an **opt-in** feature that:
- Anonymizes your evidence notes (removes names, dates, locations, and all personal identifiers)
- Detects patterns across many users (e.g., "78% of fibromyalgia claims denied for 'medical necessity'")
- Only shows patterns when **50+ users** have contributed (privacy threshold)
- Enables advocacy through data: "You're not just being denied—this is a system-wide pattern"

---

## Privacy-First Principles

### 1. **Opt-In Only**

- Collective Evidence is **off by default**
- You are prompted to opt in after saving 3+ evidence notes
- You can opt out at any time with one tap
- Opting out **immediately deletes all your contributions**

### 2. **PII Removal (Personally Identifiable Information)**

Before any evidence is contributed, we automatically remove:

**Names**:
- Your name, doctor names, insurance adjuster names, employer names
- Example: "Dr. Jane Smith" → "[REDACTED]"

**Dates**:
- Exact dates are converted to relative time
- Example: "March 15, 2024" → "~18 days ago"

**Locations**:
- Cities, addresses, specific locations → Broad regions only
- Example: "Vancouver General Hospital, 123 Main St" → "Southwest"

**Contact Information**:
- Email addresses, phone numbers, street addresses
- Example: "jane.doe@email.com" → "[REDACTED]"

**Medical Record Numbers**:
- Claim IDs, medical record numbers, policy numbers
- Example: "Claim #12345" → "[REDACTED]"

### 3. **50-User Minimum Threshold**

- No patterns are shown unless **50+ users** have contributed
- This prevents re-identification from small datasets
- If fewer than 50 users, dashboard shows: "Building Our Database - We need at least 50 users to share insights safely"

### 4. **What Gets Shared**

After PII removal, we keep **only these categories**:

| Category | What We Keep | What We Remove |
|----------|--------------|----------------|
| **Denial Reason** | Categories (e.g., "medical necessity", "experimental treatment") | Specific details, names, dates |
| **Condition** | General categories (e.g., "chronic pain", "mental health") | Specific diagnosis, doctor names |
| **Region** | Broad regions (e.g., "Southwest", "Northeast") | City, province, address |
| **Timeline** | Days/weeks (e.g., "~18 days", "~3 months") | Exact dates |
| **Insurance Type** | Public/Private | Company names, policy numbers |
| **Missing Documents** | Categories (e.g., "medical records", "prior authorization") | Specific document names |

### 5. **What We DON'T Collect**

We **never** collect or store:
- Your user ID or account identifier
- Device identifiers (IMEI, advertising ID, etc.)
- IP addresses
- Exact timestamps (only day counts)
- Raw evidence text (only anonymized contributions)

---

## How Anonymization Works

### Example: Before & After

**BEFORE (Your Private Notes)**:
```
"On March 15, my doctor at Vancouver General submitted prior auth for Humira. Denied April 2 because 'not medical necessity.' I live at 123 Main St, contact is jane.doe@email.com"
```

**AFTER (Anonymized Contribution)**:
```json
{
  "region": "Southwest",
  "conditionCategory": "chronic_inflammatory",
  "denialReason": "medical_necessity",
  "timelineDays": 18,
  "insuranceType": "public",
  "themes": ["prior-auth", "biologics"],
  "daysAgo": 267
}
```

**Removed**:
- Names: "doctor", "Vancouver General", "jane.doe@email.com"
- Dates: "March 15", "April 2" → Converted to relative days
- Locations: "Vancouver General", "123 Main St" → Region only
- Contact info: Email address completely removed

---

## Your Rights

### 1. **Right to Opt Out**

- Tap "Opt Out & Delete My Data" on the Collective Evidence dashboard
- All your contributions are **immediately deleted** (no soft delete, no backups)
- You can opt back in at any time

### 2. **Right to Know**

- View your contribution count on the dashboard
- See when you last contributed
- Request a copy of what data is stored (contact: privacy@3mpwrapp.com)

### 3. **Right to Deletion**

- Opt-out deletes all contributions immediately
- No retention period, no backups, no logs
- Deletion is irreversible

### 4. **Right to Access**

- View aggregated patterns on the Collective Evidence dashboard
- See how many users contributed to each pattern
- Understand the privacy threshold (50+ users)

---

## Data Storage & Security

### Local Storage

- All contributions are stored **locally on your device** via AsyncStorage
- No cloud sync, no server uploads
- Data stays on your device unless you explicitly opt in

### Encryption

- Evidence notes are encrypted at rest (device encryption)
- Contributions are encrypted in transit (HTTPS)
- No server-side storage of raw evidence text

### Retention

- **Opted In**: Contributions stored until you opt out
- **Opted Out**: Immediate deletion, no retention
- **Pattern Data**: Only shown if 50+ users, never includes PII

---

## Legal Basis for Processing

We process anonymized contributions under the following legal bases:

1. **Consent** (GDPR Article 6(1)(a)):
   - Explicit opt-in required
   - Clear explanation of what is shared
   - Easy opt-out with data deletion

2. **Legitimate Interest** (GDPR Article 6(1)(f)):
   - Detecting systemic discrimination against people with disabilities
   - Advocacy for policy change
   - Public interest research

3. **Special Category Data** (GDPR Article 9(2)(j)):
   - Health data processed for public health purposes
   - Anonymization removes identification risk
   - No individual health records stored

---

## Compliance

### Canada (PIPEDA)

- ✅ Consent obtained before collection
- ✅ Purpose clearly stated
- ✅ PII safeguards in place
- ✅ Access and deletion rights provided
- ✅ Accountability principle (privacy audit)

### EU (GDPR)

- ✅ Explicit consent (Article 7)
- ✅ Right to erasure (Article 17)
- ✅ Data minimization (Article 5)
- ✅ Privacy by design (Article 25)
- ✅ Transparent processing (Article 13)

### US (HIPAA - Not Applicable)

- ❌ HIPAA does not apply: We are not a "covered entity" or "business associate"
- ✅ We follow HIPAA anonymization standards voluntarily
- ✅ Safe Harbor method: All 18 identifiers removed

---

## Third-Party Access

**We do NOT share collective evidence data with third parties**, except:

1. **Policy Organizations** (Future):
   - Aggregated, anonymized pattern reports
   - Only if 1000+ users contribute
   - Requires separate user consent
   - Example: "Report shows 78% denial rate for fibromyalgia claims"

2. **Academic Researchers** (Future):
   - Anonymized datasets for peer-reviewed research
   - Ethics board approval required
   - Data use agreements in place
   - No individual records, only aggregated patterns

3. **Legal Compliance**:
   - If required by law (court order, subpoena)
   - We will notify you unless prohibited by law
   - We will challenge overboard requests

**We will NEVER**:
- Sell your data
- Share with insurance companies
- Share with employers
- Share with advertisers
- Use for marketing

---

## Children's Privacy

- This feature is for users **18 years and older**
- We do not knowingly collect data from children under 18
- If you are under 18, do not opt in to Collective Evidence

---

## Changes to This Policy

- We will notify you of major changes via in-app notification
- You can review this policy anytime in Settings → Privacy → Collective Evidence Privacy
- Continued use after changes = acceptance of new terms
- You can always opt out if you disagree

---

## Privacy Audit

We conduct quarterly privacy audits to verify:
- PII removal effectiveness (100% removal rate target)
- 50-user threshold enforcement (no exceptions)
- Opt-out deletion verification (immediate, complete)
- Re-identification risk testing (no successful re-identification)

**Last Audit**: December 2025
**Next Audit**: March 2026

---

## Contact

**Privacy Questions**:
Email: privacy@3mpwrapp.com
Response time: 5 business days

**Data Subject Access Requests**:
Email: privacy@3mpwrapp.com with subject "DSAR - Collective Evidence"
Response time: 30 days (as required by GDPR)

**Complaints**:
If you believe your privacy rights have been violated, contact:
- **Canada**: Office of the Privacy Commissioner of Canada (www.priv.gc.ca)
- **EU**: Your local Data Protection Authority
- **US**: Federal Trade Commission (www.ftc.gov)

---

## Transparency Commitment

We are committed to full transparency:
- This privacy policy is public and versioned on GitHub
- Privacy audit reports published annually
- Open-source PII removal algorithm (services/collectiveEvidence.ts)
- Community feedback welcome (privacy@3mpwrapp.com)

---

**End of Collective Evidence Privacy Policy**

**Version History**:
- v1.0 (Dec 29, 2025): Initial release with Phase 2 launch
