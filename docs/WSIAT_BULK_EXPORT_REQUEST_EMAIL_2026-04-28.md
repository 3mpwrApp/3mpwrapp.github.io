Subject: Request for Bulk Decision Outcome Export - Academic Research & Public Access

To: wsiat.secretariat@ontario.ca
CC: [if applicable]
Date: April 28, 2026

Dear WSIAT Secretariat,

I am writing to request a bulk export of historical decision outcome data from the Workplace Safety and Insurance Appeals Tribunal (WSIAT) for the purpose of improving public access to legal information for injured workers.

## Purpose of Request

I am developing **3mpwrApp**, an open-source platform that helps injured workers and persons with disabilities understand their rights and navigate the tribunal appeal process. Our platform currently provides:

- Searchable database of 35,928 tribunal decisions from CanLII (Ontario and other provinces)
- Plain-language summaries and winning argument templates
- AI-powered outcome predictions to help workers assess their appeal chances

**Challenge:** CanLII decision documents often do not explicitly state outcomes in the text (especially for WSIAT decisions from 2020-2026). We've used natural language processing to predict outcomes, but these predictions have lower confidence for recent WSIAT decisions due to sparse metadata in the CanLII API responses.

## Requested Data

I respectfully request the following fields for WSIAT decisions from **2020-2026** (approximately 11,430 decisions):

| Field | Format | Purpose |
|-------|--------|---------|
| **Decision Number** | Text (e.g., "2020 ONWSIAT 2063") | Match to CanLII records |
| **Decision Date** | Date (YYYY-MM-DD) | Match to CanLII records |
| **Outcome** | Categorical (e.g., "Allowed," "Dismissed," "Remanded," "Partial Win") | Core research data |
| **Panel Members** (optional) | Text | Quality control / error checking |
| **Issue Type** (optional) | Text (e.g., "Entitlement," "Quantum," "Reconsideration") | Enhance research value |

**Format:** CSV, Excel, JSON, or any structured format is acceptable.

## Public Benefit

This data will enable:

1. **Transparency:** Workers can see actual WSIAT success rates by issue type (e.g., chronic pain, pre-existing conditions)
2. **Evidence-based decision-making:** Workers can assess their appeal chances based on real historical outcomes
3. **Academic research:** Researchers can study tribunal decision patterns and identify potential systemic issues
4. **Legal AI training:** Improve outcome prediction accuracy from current 79% (mixed tribunals) to 85%+ for WSIAT-specific cases

**All data will be published openly** under Creative Commons licensing, following the same principles as CanLII's open legal information mandate.

## Precedents for Similar Requests

- **CanLII:** Publishes full decision text publicly under open license
- **WSIAT Annual Reports:** Already publish aggregate win rates (65-73% worker success)
- **Ontario Open Data Directive:** Encourages public sector bodies to release non-sensitive data

## Privacy & Confidentiality

I understand that:
- Worker names, employer names, and personal health information are **not requested**
- Only anonymized outcome data (linked to public decision numbers) is sought
- WSIAT has discretion to redact or exclude any decisions with privacy concerns

## Timeline & Follow-Up

**No immediate urgency.** If this request requires internal review or approvals, I am happy to wait 4-8 weeks for a response. 

If the Secretariat cannot fulfill this request directly, I would appreciate being directed to:
- Freedom of Information (FOI) process
- Alternative data sources (e.g., annual report appendices with case-level data)
- WSIAT Open Data contacts

## About 3mpwrApp

3mpwrApp is a **non-commercial, community-driven platform** built to support injured workers across Canada. Key features:

- 100% free and open source (no paywalls, no subscriptions)
- Fully accessible (WCAG 2.2 AA+)
- Privacy-first architecture (local-first data storage)
- Developed by advocates for injured workers

**Website:** [https://3mpwrapp.ca](https://3mpwrapp.ca)  
**GitHub:** [https://github.com/3mpwrApp](https://github.com/3mpwrApp) (planned - code will be published here)  
**Research Page:** [https://3mpwrapp.github.io/research/](https://3mpwrapp.github.io/research/)

## Contact Information

**Name:** [Your Name]  
**Email:** empowrapp08162025@gmail.com  
**Organization:** 3mpwrApp (Community Project)  
**Mailing Address:** [If required for FOI requests]

## Thank You

I appreciate WSIAT's commitment to transparency and public access to justice. This data will directly help thousands of injured workers make informed decisions about their appeals.

If you have questions about this request or need clarification on how the data will be used, please don't hesitate to contact me.

Sincerely,

[Your Name]  
3mpwrApp Project Lead  
empowrapp08162025@gmail.com

---

## Attachments (if helpful)

- Sample research output: [https://3mpwrapp.github.io/research/#ai-powered-outcome-predictions](https://3mpwrapp.github.io/research/#ai-powered-outcome-predictions)
- Current CanLII database coverage: 35,928 decisions across 4 Ontario tribunals
- AI methodology documentation: 79% accuracy, 256,734 training examples
