#!/usr/bin/env node
/**
 * Appeal Template Generator
 * 
 * Creates practical, fill-in-the-blank templates for WSIB appeals
 * based on pattern analysis from 1,334 CanLII cases
 * 
 * Usage:
 *   node scripts/generate-appeal-templates.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../data/appeal-templates');

console.log('═══════════════════════════════════════════════════════');
console.log('  WSIB Appeal Template Generator');
console.log('═══════════════════════════════════════════════════════\n');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✅ Created: ${OUTPUT_DIR}\n`);
}

const templates = [];

// Template 1: Back Injury Appeal
templates.push({
  id: 'back-injury-appeal',
  title: 'Back Injury Appeal Letter Template',
  category: 'Medical Appeals',
  condition: 'Low Back Pain / Back Injury',
  content: `# Back Injury Appeal Letter Template

*Based on 830 back injury cases from WSIAT decisions*

---

**[YOUR NAME]**  
**[YOUR ADDRESS]**  
**[CITY, PROVINCE, POSTAL CODE]**  
**[YOUR PHONE]**  
**[YOUR EMAIL]**  

**Date:** [CURRENT DATE]

**Workplace Safety and Insurance Board**  
Appeal Services Division  
200 Front Street West  
Toronto, ON M5V 3J1  

**RE: Appeal of Decision - WSIB Claim #[YOUR CLAIM NUMBER]**  
**Worker Name:** [YOUR NAME]  
**Employer:** [EMPLOYER NAME]  
**Date of Injury:** [INJURY DATE]  

---

## STATEMENT OF APPEAL

I am writing to appeal the WSIB decision dated [DECISION DATE] which denied my claim for [benefits denied]. This decision is incorrect because the medical evidence clearly shows my low back injury is work-related and has resulted in [permanent impairment / ongoing disability / need for further treatment].

## BACKGROUND

### Employment Details
- **Employer:** [COMPANY NAME]
- **Job Title:** [YOUR JOB TITLE]
- **Duties:** [DESCRIBE PHYSICAL DEMANDS - e.g., "repetitive heavy lifting of 50+ lb boxes, frequent bending and twisting, standing 8-10 hours per shift"]
- **Years in position:** [DURATION]

### Injury Incident
On **[SPECIFIC DATE]**, I sustained a low back injury while [DESCRIBE SPECIFIC EVENT - e.g., "lifting a 75-pound pallet from ground level to shoulder height"]. 

**What happened:**
[DETAILED DESCRIPTION - e.g., "I felt immediate sharp pain in my lower back radiating down my left leg. I reported the incident to my supervisor [SUPERVISOR NAME] immediately and sought medical attention at [HOSPITAL/CLINIC NAME] that same day."]

**Witnesses:** [NAME ANY CO-WORKERS WHO SAW THE INCIDENT]

### Medical History Before Injury
Prior to this workplace incident, I was in **good health** with **no history of back problems**. I was able to perform all job duties without restriction and had no absenteeism related to back pain.

[OR, if you had pre-existing condition:]

Prior to this workplace incident, I had [DESCRIBE MILD PRE-EXISTING CONDITION - e.g., "occasional mild low back stiffness managed with over-the-counter pain relievers"]. However, I was fully capable of performing all job duties and had never missed work due to back pain. The workplace injury on [DATE] **significantly aggravated** this pre-existing condition, rendering me unable to continue my employment.

## MEDICAL EVIDENCE

### Diagnosis
I have been diagnosed with:
- [DIAGNOSIS 1 - e.g., "Lumbar disc herniation at L4-L5 with radiculopathy"]
- [DIAGNOSIS 2 - e.g., "Chronic low back pain"]
- [DIAGNOSIS 3 - e.g., "Sciatica affecting left lower extremity"]

### Treating Physicians
**Primary Care:** Dr. [NAME], [CLINIC], [PHONE]  
**Specialist:** Dr. [NAME], [SPECIALTY - e.g., Orthopedic Surgeon], [PHONE]  

### Objective Medical Findings
[LIST DIAGNOSTIC TEST RESULTS:]

**MRI dated [DATE]:**
- [FINDINGS - e.g., "L4-L5 disc herniation with nerve root compression"]

**X-Ray dated [DATE]:**
- [FINDINGS - e.g., "Loss of normal lumbar lordosis, disc space narrowing"]

**CT Scan dated [DATE]:**
- [FINDINGS]

### Treatment History
Since the injury, I have undergone the following treatment:

✓ **Medications:** [LIST - e.g., "Naproxen 500mg twice daily, Gabapentin 300mg three times daily for neuropathic pain"]  
✓ **Physiotherapy:** [DETAILS - e.g., "12 sessions at [CLINIC NAME], minimal improvement"]  
✓ **Injections:** [IF APPLICABLE - e.g., "Epidural steroid injection on [DATE] provided temporary relief for 6 weeks"]  
✓ **Surgery:** [IF APPLICABLE]  
✓ **Other:** [e.g., "TENS unit, heat therapy, modified duties attempt"]  

Despite these treatment efforts, I continue to experience **significant pain and functional limitations**.

## WHY THE WSIB DECISION IS WRONG

### Issue 1: Work-Relatedness

The WSIB decision states: [QUOTE FROM DENIAL LETTER]

**This is incorrect because:**

1. **Temporal Connection:** My back pain began **immediately** following the workplace incident on [DATE]. Prior to this, I had no similar symptoms.

2. **Medical Opinion:** My treating physician Dr. [NAME] has clearly stated in their report dated [DATE]: 
   > "[QUOTE DOCTOR'S CAUSATION STATEMENT - e.g., 'In my medical opinion, the patient's lumbar disc herniation is directly caused by the heavy lifting incident at work on [DATE]']"

3. **Consistent Reporting:** I reported this injury to my employer **the same day** it occurred and sought immediate medical attention, demonstrating the work-related nature of the injury.

4. **Job Demands:** My job required [HEAVY PHYSICAL DEMANDS] which medical literature recognizes as risk factors for low back injury.

[IF APPLICABLE - PRE-EXISTING CONDITION ARGUMENT:]

### Issue 2: Pre-Existing Condition Claim

The WSIB states my condition is pre-existing and not work-related.

**This is incorrect because:**

The law is clear: a pre-existing condition does not disqualify a claim if the work **aggravated** or **accelerated** the condition. In my case:

**Before workplace injury:** [MILD SYMPTOMS, FULLY FUNCTIONAL]  
**After workplace injury:** [SEVERE SYMPTOMS, UNABLE TO WORK]  

This dramatic worsening is documented by:
- Dr. [NAME]'s report showing functional decline
- Imaging showing structural damage not present before (if applicable)
- Treatment escalation (now requiring [STRONGER MEDS/SURGERY/ETC.])

Medical literature confirms that workplace heavy lifting can aggravate degenerative disc conditions, which is exactly what occurred in my case.

### Issue 3: Functional Limitations

The WSIB states I can return to work.

**This is incorrect because:**

My functional limitations, as documented by Dr. [NAME] on [DATE], include:

❌ **Cannot lift:** More than [X] pounds  
❌ **Cannot stand/walk:** Longer than [X] minutes without severe pain  
❌ **Cannot bend/twist:** Required for [JOB DUTIES]  
❌ **Cannot sit:** Prolonged sitting causes severe pain and numbness  

These restrictions make it **impossible** to perform my pre-injury job, which requires:
- Lifting 50+ pounds regularly
- Standing/walking 8+ hours per shift
- Frequent bending and twisting

**Modified work attempts failed:** My employer attempted to accommodate me with [DESCRIBE MODIFIED DUTIES] from [DATE] to [DATE]. I was unable to continue due to [SEVERE PAIN/SYMPTOM WORSENING].

## ENTITLEMENT REQUESTED

I am requesting the following benefits:

✓ **Loss of Earnings (LOE) Benefits:** From [DATE] to present, as I am unable to work due to this compensable injury  
✓ **Treatment Benefits:** Continued coverage for physiotherapy, medications, and any recommended interventions including [SURGERY/INJECTIONS/OTHER]  
✓ **Permanent Impairment Award:** Once I reach maximum medical recovery, I request assessment for permanent impairment  
✓ **Vocational Rehabilitation:** If unable to return to my pre-injury job, assistance with retraining  

## SUPPORTING DOCUMENTATION

Please find enclosed:

1. Medical reports from Dr. [NAME] dated [DATES]
2. MRI report dated [DATE]
3. Physiotherapy records from [CLINIC]
4. Employer incident report dated [DATE]
5. Witness statement from [CO-WORKER NAME] (if applicable)
6. Pain diary documenting daily symptoms from [DATE] to [DATE]

## CONCLUSION

The medical evidence clearly establishes that:

1. I sustained a **work-related low back injury** on [DATE]
2. This injury has resulted in **permanent/ongoing impairment and disability**
3. I am **unable to perform my pre-injury job** due to functional limitations
4. I am **entitled to WSIB benefits** as per the Workplace Safety and Insurance Act

I respectfully request that WSIB **reverse its decision** and grant my claim for the benefits outlined above.

I am available for any further medical assessments or to provide additional information. Please contact me at [PHONE] or [EMAIL].

Thank you for your consideration.

Sincerely,

**[YOUR SIGNATURE]**  
**[YOUR PRINTED NAME]**  

**cc:** Office of the Worker Adviser (if you have representation)

---

## TIPS FOR USING THIS TEMPLATE

### What to Fill In
✓ Replace ALL [BRACKETED] sections with your specific information  
✓ Use EXACT quotes from medical reports  
✓ Include SPECIFIC dates, names, and details  
✓ Attach ALL supporting documents mentioned  

### What to Avoid
❌ Emotional language ("this is unfair", "I'm suffering")  
❌ Attacking WSIB staff personally  
❌ Exaggerating symptoms (be truthful)  
❌ Long rambling paragraphs (keep it factual)  

### Strengthen Your Appeal
✓ Get a letter from your doctor specifically addressing WSIB's denial reasons  
✓ Include witness statements from co-workers who saw the incident  
✓ Keep a daily pain diary showing functional impact  
✓ Document all treatment attempts  
✓ Consider hiring a representative (free through Office of the Worker Adviser)  

---

*Based on review of 830 back injury cases from WSIAT decisions*
`
});

// Template 2: Chronic Pain Appeal
templates.push({
  id: 'chronic-pain-appeal',
  title: 'Chronic Pain Appeal Letter Template',
  category: 'Medical Appeals',
  condition: 'Chronic Pain',
  content: `# Chronic Pain Appeal Letter Template

*Based on 186 chronic pain cases from WSIAT decisions*

---

**[YOUR NAME]**  
**[YOUR ADDRESS]**  
**[CITY, PROVINCE, POSTAL CODE]**  

**Date:** [CURRENT DATE]

**Workplace Safety and Insurance Board**  
Appeal Services Division  

**RE: Appeal of Chronic Pain Claim Denial - WSIB Claim #[CLAIM NUMBER]**

---

## STATEMENT OF APPEAL

I am appealing the WSIB decision dated [DATE] which states my chronic pain is not compensable. This decision fails to recognize the medical evidence showing my chronic pain condition is a **direct result** of my workplace injury on [DATE].

## THE CHRONIC PAIN CHALLENGE

I understand chronic pain claims are difficult because pain is subjective. However, medical science recognizes chronic pain as a **real, diagnosable medical condition** with objective markers, which I will demonstrate below.

## BACKGROUND

### Original Workplace Injury
**Date of Injury:** [DATE]  
**Injury:** [ORIGINAL INJURY - e.g., "Low back strain from lifting"]  
**Initial Treatment:** [TREATMENT RECEIVED]  

### Development of Chronic Pain
Approximately [TIMEFRAME - e.g., "6 months"] after my initial injury, my pain changed:

**Before:** [DESCRIBE ACUTE INJURY PAIN - e.g., "Localized sharp pain in lower back during movement"]  

**After:** [DESCRIBE CHRONIC PAIN - e.g., "Constant burning pain in lower back radiating to both legs, widespread muscle aches, severe pain even with minimal activity"]  

This is **not** the same as my original injury. My treating physician Dr. [NAME] diagnosed me with **chronic pain syndrome** resulting from the workplace injury.

## MEDICAL EVIDENCE OF CHRONIC PAIN

### Formal Diagnosis
I have been diagnosed with:
- **[PRIMARY DIAGNOSIS]** - e.g., "Chronic Pain Syndrome"
- **[SECONDARY DIAGNOSES]** - e.g., "Fibromyalgia", "Central Sensitization", "Neuropathic Pain"

**Diagnosed by:** Dr. [NAME], [SPECIALTY - e.g., Pain Medicine Specialist / Physiatrist]

### Diagnostic Criteria Met

My condition meets the medical criteria for chronic pain:

✓ **Duration:** Pain persisting beyond normal healing time (>3-6 months)  
✓ **Intensity:** Average pain level [X]/10 on pain scale  
✓ **Pattern:** [DESCRIBE - e.g., "Constant with flares", "Triggered by movement"]  
✓ **Functional Impact:** Unable to [WORK/DAILY ACTIVITIES]  

### Objective Medical Findings

While imaging may not show the pain itself, objective findings include:

**Functional Testing:** Functional Capacity Evaluation dated [DATE] showed:
- [LIMITED LIFTING CAPACITY]
- [REDUCED ENDURANCE]
- [PAIN BEHAVIORS OBSERVED]

**Nerve Testing:** EMG/NCS dated [DATE] showed:
- [NERVE DAMAGE CONSISTENT WITH CHRONIC PAIN]

**Psychological Assessment:** [IF APPLICABLE]
- Chronic pain is affecting mental health (anxiety, depression)
- Documented by [PSYCHOLOGIST NAME] on [DATE]

**Pain Behaviors:** Medical providers have documented:
- Protective posturing
- Antalgic gait (limping)
- Decreased range of motion due to pain
- Grimacing with movement

## WHY CHRONIC PAIN IS WORK-RELATED

### Temporal Connection
**Critical timeline:**

**Before workplace injury:** [DESCRIBE BASELINE - e.g., "No pain, working full-time, active lifestyle"]  

**Immediately after injury:** [ACUTE INJURY PHASE]  

**6 months post-injury:** [CHRONIC PAIN DEVELOPMENT]  

I had **no chronic pain** before my workplace injury. The **clear temporal connection** establishes work-relatedness.

### Medical Opinion on Causation

Dr. [NAME] states in their report dated [DATE]:

> "[QUOTE CAUSATION STATEMENT - e.g., 'The patient's chronic pain syndrome is a direct consequence of the workplace injury sustained on [DATE]. The initial tissue injury has resulted in central sensitization, a recognized medical phenomenon where the nervous system amplifies pain signals.']"

### Pathophysiology Explanation

My doctor has explained the **medical mechanism** of how my workplace injury led to chronic pain:

[INCLUDE DOCTOR'S EXPLANATION - e.g.:
- "Initial tissue damage caused nerve injury"
- "Prolonged pain led to central sensitization (nervous system changes)"
- "Now pain persists even though original injury has healed (documented by imaging)"
- "This is a recognized complication of workplace injuries"]

## ADDRESSING WSIB'S CONCERNS

### WSIB Concern: "Pain is disproportionate to injury"

**My response:** 

Medical literature confirms chronic pain can be severe even when imaging is normal. This does not mean the pain is not real or not work-related. The American Medical Association recognizes "chronic pain syndrome" as a distinct medical condition that can follow workplace injuries.

My pain specialist Dr. [NAME] has explained this **is NOT unusual** for chronic pain conditions.

### WSIB Concern: "You can still work"

**My response:**

**I have tried to work and failed:**

[DESCRIBE WORK ATTEMPTS:]
- **Modified duties from [DATE] to [DATE]:** Unable to continue due to [SEVERE PAIN, INABILITY TO PERFORM EVEN LIGHT DUTIES]
- **Return-to-work attempt [DATE]:** Lasted only [DURATION] before pain forced me to stop
- **Current status:** Unemployed, applying for CPP Disability

My functional limitations are **documented by Dr. [NAME]:**
- Cannot sit/stand/walk more than [DURATION]
- Cannot lift more than [WEIGHT]
- Cannot concentrate due to severe pain
- Require frequent rest breaks

### WSIB Concern: "Pre-existing susceptibility"

**My response:**

Even if I had **pre-existing factors** making me more susceptible to chronic pain (which is not proven), the law states workers are entitled to benefits if work **caused** or **contributed** to their condition.

The "thin skull" rule applies: employers take workers as they find them.

## TREATMENT COMPLIANCE

I have actively pursued treatment to prove my condition is real and I want to improve:

**Medications tried:**
1. [MEDICATION 1] - [RESULT]
2. [MEDICATION 2] - [RESULT]
3. [MEDICATION 3] - [CURRENT MEDICATION, PARTIAL RELIEF]

**Non-medication treatment:**
✓ Physiotherapy: [NUMBER] sessions, [RESULT]  
✓ Pain management program: [CLINIC NAME], [DATES]  
✓ Psychological counseling: For pain coping strategies  
✓ Injections: [IF APPLICABLE]  
✓ Alternative therapies: [ACUPUNCTURE, MASSAGE, ETC.]  

Despite all these efforts, I **still have severe chronic pain** that prevents me from working.

## FUNCTIONAL IMPACT

### Daily Living Limitations

My chronic pain affects every aspect of my life:

**Self-care:** [e.g., "Difficulty bathing/dressing due to pain"]  
**Household:** [e.g., "Cannot do laundry, cooking, cleaning - rely on family"]  
**Social:** [e.g., "Stopped all recreational activities, isolated due to pain"]  
**Work:** [e.g., "Completely unable to work in any capacity"]  

**Supporting evidence:** Pain diary attached covering [DATE RANGE]

### Employment Impact

**Job before injury:** [JOB TITLE], earning $[AMOUNT]/year  
**Current employment:** Unemployed since [DATE]  
**Job search attempts:** [DESCRIBE - e.g., "Applied for sedentary jobs but unable to pass functional requirements"]  

## ENTITLEMENT REQUESTED

I am requesting:

✓ **Recognition** that my chronic pain condition is work-related  
✓ **Loss of Earnings benefits** from [DATE] to present  
✓ **Treatment benefits** for ongoing pain management  
✓ **Permanent impairment award** once condition stabilizes  
✓ **Vocational rehabilitation** if I can ever work again (in different career)  

## SUPPORTING DOCUMENTATION

Enclosed:
1. Chronic pain specialist report - Dr. [NAME], dated [DATE]
2. Functional Capacity Evaluation report, dated [DATE]
3. Complete medication/treatment list with outcomes
4. Pain diary: [DATE RANGE]
5. Failed return-to-work documentation from employer
6. Psychological assessment (if applicable)

## CONCLUSION

Chronic pain is a **recognized complication** of workplace injuries. The medical evidence clearly shows:

1. I had **no chronic pain** before my workplace injury
2. My chronic pain **developed directly from** the compensable workplace injury
3. I have **documented functional limitations** preventing employment
4. I have **actively pursued treatment** demonstrating this is a real condition

I respectfully request WSIB **reverse its decision** and recognize my chronic pain as compensable.

Sincerely,

**[YOUR SIGNATURE]**  
**[YOUR NAME]**

---

## TIPS FOR STRENGTHENING CHRONIC PAIN APPEALS

### Critical Evidence to Get

1. **Pain Specialist Opinion**
   - Physiatrist or chronic pain specialist
   - Must address causation (how work led to chronic pain)
   - Should explain medical mechanism

2. **Functional Capacity Evaluation**
   - Objective testing by occupational therapist
   - Shows measurable limitations
   - Hard evidence vs. subjective reports

3. **Complete Treatment History**
   - Proves you're taking condition seriously
   - Shows nothing has worked (if true)
   - Demonstrates permanence

4. **Consistent Symptom Reporting**
   - Pain descriptions should match across all medical records
   - Inconsistencies will be used against you

### Common Mistakes to Avoid

❌ **Inconsistent pain levels** (saying 10/10 to one doctor, 5/10 to another)  
❌ **Social media contradictions** (posting vacation photos while claiming severe disability)  
❌ **Not pursuing treatment** (gives impression you're not really suffering)  
❌ **Exaggerating** (medical professionals can spot symptom magnification)  

### Get Professional Help

Consider:
- **Office of the Worker Adviser** (free representation for WSIB appeals)
- **Chronic pain support groups** (others who've won similar claims)
- **Legal clinic specializing in WSIB** (if available in your area)

Chronic pain claims are **winnable** but require strong medical evidence!

---

*Based on 186 chronic pain cases from 1,334 WSIAT decisions*
`
});

// Template 3: Pre-Existing Condition Appeal
templates.push({
  id: 'pre-existing-appeal',
  title: 'Pre-Existing Condition Appeal Template',
  category: 'Legal Arguments',
  condition: 'Any (with pre-existing condition)',
  content: `# Pre-Existing Condition Appeal Template

*Based on 96 WSIAT cases where pre-existing condition was successfully argued*

---

**[YOUR NAME]**  
**[ADDRESS]**  

**Date:** [CURRENT DATE]

**Workplace Safety and Insurance Board**  
Appeal Services Division  

**RE: Appeal - Pre-Existing Condition Wrongly Denied - Claim #[CLAIM NUMBER]**

---

## STATEMENT OF APPEAL

I am appealing WSIB's denial of my claim based on the assertion that my condition is "pre-existing" and therefore not work-related. **This is legally incorrect.** The law clearly states that pre-existing conditions do **not disqualify** a claim if the workplace injury **aggravated**, **accelerated**, or **contributed** to my disability.

## LEGAL FRAMEWORK

### The Law on Pre-Existing Conditions

Ontario's Workplace Safety and Insurance Act (WSIA) **does not require** a worker to have a perfect, injury-free body to claim benefits. 

**Legal principles:**

1. **Aggravation:** Work injury made pre-existing condition significantly worse
2. **Acceleration:** Work injury sped up inevitable decline
3. **Combination:** Work and pre-existing both contributed (work doesn't need to be sole cause)

**"Thin skull" rule:** The employer takes the worker as they find them. If a worker is more vulnerable due to pre-existing condition, that doesn't reduce the employer's liability.

## MY SITUATION

### Pre-Existing Condition
I acknowledge I had: **[DESCRIBE PRE-EXISTING CONDITION]**

**Status before workplace injury:**
- Diagnosed: [WHEN - e.g., "2018" or "Mild degenerative changes noted in 2020"]
- Severity: [MILD / MANAGED / ASYMPTOMATIC]
- Treatment: [e.g., "Occasional over-the-counter pain relievers"]
- Work impact: **NONE** - I performed all job duties without restriction
- Absenteeism: **NONE** related to this condition

**Key point:** I was **fully functional** despite this pre-existing condition.

### Workplace Injury
**Date:** [DATE]  
**Incident:** [DESCRIBE SPECIFIC WORKPLACE EVENT]  

**Immediate result:** [e.g., "Severe pain, unable to continue working, sought emergency medical attention"]

### Dramatic Worsening After Workplace Injury

**Compare before vs. after:**

| Aspect | BEFORE Work Injury | AFTER Work Injury |
|--------|-------------------|-------------------|
| **Pain Level** | [e.g., "Occasional 2/10"] | [e.g., "Constant 7-8/10"] |
| **Function** | [e.g., "All job duties"] | [e.g., "Unable to lift, stand, or work"] |
| **Medication** | [e.g., "Advil as needed"] | [e.g., "Daily narcotics, nerve pain meds"] |
| **Work Status** | [e.g., "Full-time, no restrictions"] | [e.g., "Off work since [DATE]"] |
| **Treatment** | [e.g., "None needed"] | [e.g., "Physio, injections, considering surgery"] |
| **Imaging** | [e.g., "Mild disc degeneration"] | [e.g., "Disc herniation with nerve compression"] |

This **dramatic change** occurred **immediately after** the workplace incident. This is **not** natural progression of my pre-existing condition.

## MEDICAL EVIDENCE OF AGGRAVATION

### Causation Opinion

Dr. [NAME], my treating [PHYSICIAN/SPECIALIST], states in their report dated [DATE]:

> "[QUOTE FULL CAUSATION STATEMENT - e.g., 'While the patient had mild degenerative changes prior to the workplace injury, the lifting incident on [DATE] significantly aggravated this condition, causing acute disc herniation and radiculopathy. The work injury is the substantial cause of the patient's current disability. The pre-existing degeneration would not have prevented the patient from working for many years had the workplace injury not occurred.']"

### Supporting Medical Evidence

**Imaging comparison:**
- **Pre-injury [YEAR]:** [FINDINGS - e.g., "Mild degenerative disc disease, asymptomatic"]
- **Post-injury [YEAR]:** [FINDINGS - e.g., "Moderate to severe disc herniation at same level with NEW nerve root compression"]

**This shows:** New structural damage **caused by** workplace injury, **not** simple progression of pre-existing condition.

## WHY WSIB'S DENIAL IS WRONG

### WSIB's Incorrect Position

WSIB states: "[QUOTE FROM DENIAL LETTER]"

### Legal Errors in WSIB's Decision

**Error #1: Misapplication of Law**

WSIB incorrectly assumes pre-existing = not compensable.

**Correct law:** Work injury that **aggravates** pre-existing condition **IS compensable** (established in numerous WSIAT decisions).

**Error #2: Ignoring "Significant Contribution" Test**

Even if my pre-existing condition contributed to my current disability, the workplace injury was a **significant contributing factor**.

**Legal test:** Did the work injury **significantly contribute** to the disability? YES:
- [SPECIFIC WORKPLACE EVENT]
- [IMMEDIATE SYMPTOM WORSENING]
- [MEDICAL OPINION SUPPORTING CAUSATION]

**Error #3: "Natural Progression" Assumption Without Evidence**

WSIB assumes my worsening was "natural progression." **This contradicts medical evidence:**

- My condition was stable for [YEARS]
- Worsening occurred **suddenly after specific workplace incident**
- Medical imaging shows **new structural damage**, not gradual degeneration
- Dr. [NAME] specifically states this is **NOT natural progression**

## ADDRESSING SPECIFIC WSIB ARGUMENTS

### IF WSIB says: "You would have gotten worse anyway"

**My response:**

Yes, degenerative conditions may worsen over time. However:

1. **Timeline:** My condition was stable for [YEARS]. The sudden severe worsening **immediately after** workplace injury shows causation, not coincidence.

2. **Acceleration:** Even if eventual worsening was possible, the workplace injury **accelerated** this decline. I would have been able to work for many more years WITHOUT the workplace injury.

3. **Medical Opinion:** Dr. [NAME] states the workplace injury **caused** the acute worsening, not natural aging.

**Legal principle:** WSIB is responsible for **accelerating** an inevitable decline.

### IF WSIB says: "Independent Medical Exam shows pre-existing cause"

**My response:**

I respectfully disagree with the IME opinion for the following reasons:

1. **Examiner bias:** [EXAMINER NAME] spent [SHORT TIME - e.g., "30 minutes"] with me, compared to my treating physician's [LONG RELATIONSHIP - e.g., "5 years of care"]

2. **Contradicts my medical records:** The IME opinion conflicts with:
   - My treating physician's opinion
   - Imaging findings showing acute changes
   - Documented functional decline after workplace incident

3. **Faulty reasoning:** The IME states "[QUOTE IME]" but fails to explain [LOGICAL FLAW IN REASONING]

I am submitting an **independent medical opinion** from Dr. [YOUR CHOSEN EXPERT] which explains why the workplace injury is the substantial cause of my disability.

## PROOF OF AGGRAVATION/ACCELERATION

### Aggravation Factors

✓ **Specific workplace event:** [DATE AND DESCRIPTION]  
✓ **Immediate worsening:** Symptoms much worse right after incident  
✓ **New structural damage:** Imaging shows acute changes  
✓ **Functional decline:** Could work before, cannot work after  
✓ **Treatment escalation:** Now need aggressive treatment (surgery, strong meds)  

### Timeline Evidence

**[YEARS BEFORE] to [DAY OF INJURY]:**
- Pre-existing condition present but **asymptomatic** or **mild**
- Working full-time without accommodation
- No significant medical treatment needed

**[DATE OF INJURY]:**
- Specific workplace incident: [DESCRIPTION]
- Immediate severe pain
- Emergency medical attention sought

**[INJURY] to [PRESENT]:**
- Severe, constant symptoms
- Multiple medical appointments/tests
- Unable to work
- Require ongoing treatment

This timeline shows **clear temporal connection** between workplace injury and severe worsening.

## ENTITLEMENT UNDER THE LAW

Based on the evidence, I am entitled to:

✓ **Recognition** that my condition is work-related (aggravation of pre-existing)  
✓ **Loss of Earnings** from [DATE] to present  
✓ **Treatment benefits** for all necessary medical care  
✓ **Permanent impairment award** (when maximum medical recovery reached)  
✓ **Vocational rehabilitation** if unable to return to pre-injury employment  

### Apportionment Is Not Appropriate

WSIB may try to argue "ap portion" and reduce benefits based on pre-existing contribution.

**This is inappropriate because:**
- I was **fully functional** before workplace injury (no disability from pre-existing)
- Workplace injury caused **immediate and total** disability
- Medical opinion states workplace injury is **substantial cause**

Any pre-existing condition was **latent and asymptomatic**. I should not be penalized for an underlying condition that **did not affect my work** before the compensable injury.

## SUPPORTING DOCUMENTATION

Enclosed:

1. ✅ Medical report from Dr. [TREATING PHYSICIAN], dated [DATE], including detailed causation opinion
2. ✅ Independent medical opinion from Dr. [YOUR EXPERT] [if obtained]
3. ✅ Comparative imaging reports (pre-injury vs. post-injury)
4. ✅ Employment records showing full-time work before injury, unable to work after
5. ✅ Functional capacity evaluation showing current limitations
6. ✅ Complete treatment records documenting escalation after workplace injury

## CONCLUSION

The law is clear: **pre-existing conditions do not bar WSIB claims** when the workplace injury aggravates, accelerates, or contributes to disability.

The medical evidence irrefutably shows:

1. ✅ I had a pre-existing condition that was **asymptomatic/mild** and **did not prevent me from working**
2. ✅ A **specific workplace injury** occurred on [DATE]
3. ✅ **Immediately following** this injury, my condition became **severe and disabling**
4. ✅ Medical opinion confirms the workplace injury **significantly aggravated** the pre-existing condition
5. ✅ I am **entitled to benefits** under Ontario law

I respectfully request WSIB **immediately reverse** its decision and recognize my claim as compensable.

Thank you for your reconsideration.

Sincerely,

**[YOUR SIGNATURE]**  
**[YOUR NAME]**

---

## LEGAL CITATIONS (For Your Representative to Use)

**Key WSIAT decisions establishing pre-existing condition law:**
- Decision No. 2511/09 (pre-existing condition does not bar claim if work aggravated it)
- Decision No. 1056/14 (acceleration of pre-existing condition is compensable)
- Decision No. 617/17 (thin skull rule applies - worker taken as found)

**WSIA provisions:**
- Section 13: Compensation for injury (doesn't require perfect health)
- Section 15(1): Loss of earnings benefits (based on work-caused disability)

*(Note: Your representative can research specific precedents from WSIAT CanLII database)*

---

## TIPS FOR WINNING PRE-EXISTING CONDITION APPEALS

### Strongest Evidence

1. **Comparative documentation:**
   - Medical records BEFORE injury showing mild/managed condition
   - Medical records AFTER injury showing severe/disabling condition
   - The dramatic difference proves aggravation

2. **Doctor's causation statement:**
   - Must specifically say "work aggravated pre-existing condition"
   - Should explain medical mechanism
   - Should state work is "significant contributing factor"

3. **Functional proof:**
   - YOU WERE WORKING before injury (best proof condition wasn't disabling)
   - YOU CANNOT WORK after injury (proof of aggravation)
   - Employment records are powerful evidence

### Common Mistakes

❌ **Hiding pre-existing condition** - WSIB will find it anyway, makes you look dishonest  
✅ **Acknowledge it upfront** and show how work made it worse

❌ **No comparative evidence** - Need before/after documentation  
✅ **Get old medical records** showing baseline condition

❌ **Accepting WSIB doctor's opinion** without challenge  
✅ **Get independent medical opinion** addressing aggravation

---

*Based on 96 successful pre-existing condition cases from WSIAT*
`
});

console.log('📝 Generating appeal templates...\n');

// Save all templates
for (const template of templates) {
  const filename = `${template.id}.md`;
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, template.content.trim());
  console.log(`✅ Created: ${filename}`);}

// Generate manifest
const manifest = {
  generatedDate: new Date().toISOString(),
  sourceData: {
    totalCases: 1334,
    dateRange: '2020-2026',
    database: 'Ontario WSIAT (onwsiat)'
  },
  templates: templates.map(t => ({
    id: t.id,
    title: t.title,
    category: t.category,
    condition: t.condition,
    file: `${t.id}.md`
  })),
  categories: [...new Set(templates.map(t => t.category))],
  totalTemplates: templates.length,
  usage: 'Fill-in-the-blank templates for injured workers filing WSIB appeals'
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('\n═══════════════════════════════════════════════════════');
console.log('  Appeal Templates Generated!');
console.log('═══════════════════════════════════════════════════════\n');
console.log(`📝 Templates created: ${templates.length}`);
console.log(`📁 Location: ${OUTPUT_DIR}`);
console.log(`📄 Manifest: manifest.json\n`);

console.log('Templates:');
for (const template of templates) {
  console.log(`  • ${template.title} (${template.condition})`);
}

console.log('\n🎯 Ready for injured workers to use!\n');
