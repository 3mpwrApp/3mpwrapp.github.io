# 3mpwr App Enhancement Suggestions
**Date:** October 13, 2025  
**Prepared by:** AI Analysis of Disability Coverage, Technical Architecture, and Unique Features  
**Status:** ✅ **Phase 1 Item #4 COMPLETED** - Letter Wizard expanded from 5 to 22 letter types (Oct 13, 2025)

---

## 📋 Implementation Status

### ✅ **Completed Features**
- **Expanded Letter Wizard** (Phase 1, Item #4) - Completed Oct 13, 2025
  - Expanded from 5 letter types to 22 comprehensive letter types
  - Added 6 new situation categories (medical leave, workplace issues, insurance disputes, medical support, housing accessibility, human rights)
  - Implemented 17 new letter templates covering:
    - **Medical Leave & Workplace**: Medical leave request, leave extension, WSIB claims, harassment complaints, wrongful termination
    - **Insurance & Medical**: LTD appeals, IME objections, doctor support requests, medical records requests, prescription coverage appeals
    - **Housing & Accessibility**: Housing modifications, service animal approval, parking permit appeals
    - **Human Rights & Legal**: Human rights complaints, cease and desist, demand letters
  - Added 200+ translation keys (English & French)
  - File grew from ~300 lines to 1310 lines
  - All TypeScript errors resolved, ESLint clean

### 🔄 **In Progress**
- None currently

### ⏳ **Planned (Phase 1)**
1. Episodic/Fluctuating Disabilities support (Bad Day Mode, Flare Tracker)
2. Smart Deadline Engine (auto-calculate deadlines, escalating reminders)
3. Offline-First Architecture (queue system for evidence uploads)
4. ~~Expanded Letter Wizard (+30 letter types covering all situations)~~ ✅ COMPLETED
5. Privacy-First E2E Encryption (zero-knowledge architecture)

---

## 1. 🧠 Disability Wizard - Complete Coverage Analysis

### Currently Covered (✅)
Based on analysis of `services/disabilityWizard.ts`:

**Disability Types:**
- ✅ Physical disabilities (mobility, chronic pain, fatigue)
- ✅ Cognitive disabilities (executive function, memory, processing)
- ✅ Sensory disabilities (vision, hearing, sensory processing)
- ✅ Mental health (depression, anxiety, PTSD, substance use disorders)
- ✅ Chronic illness (autoimmune, pain syndromes, long COVID)
- ✅ Neurodivergent (ADHD, autism, learning differences)
- ✅ Multiple/intersecting disabilities

### Critical Gaps to Fill (🔴 HIGH PRIORITY)

#### 1.1 **Episodic/Fluctuating Disabilities**
**Problem:** Many disabilities have good days/bad days (MS, lupus, ME/CFS, bipolar, epilepsy), but wizard assumes static needs.

**Solution:**
```typescript
// Add to DisabilityProfile
export interface DisabilityProfile {
  // ... existing fields ...
  
  // NEW: Fluctuation tracking
  hasFluctuatingSymptoms: boolean;
  fluctuationPattern?: 'daily' | 'weekly' | 'monthly' | 'unpredictable';
  currentEnergyLevel?: 1 | 2 | 3 | 4 | 5; // Real-time adjustment
  badDayTriggers?: string[]; // e.g., weather, stress, overexertion
  
  // NEW: Spoon theory integration
  dailySpoonCount?: number; // Energy budget (spoon theory)
  spoonsRemaining?: number; // Current capacity
}
```

**Features to Add:**
- **"Bad Day Mode"** - One-tap to switch to low-energy tools only
- **Flare-Up Tracker** - Log triggers and patterns for episodic conditions
- **Energy Budget Calculator** - Spoon theory-based task planning
- **Weather/Barometric Sensitivity** - Alert when conditions may trigger symptoms

#### 1.2 **Invisible Disabilities Advocacy**
**Problem:** Users with invisible disabilities face unique discrimination (e.g., "you don't look disabled").

**Solution:**
```typescript
// New tool category
{
  id: 'invisible_disability_toolkit',
  category: 'advocacy',
  title: 'Invisible Disability Toolkit',
  description: 'Scripts, letters, and strategies for defending invisible disabilities',
  features: [
    'Response scripts for "you don\'t look disabled" comments',
    'Medical documentation templates emphasizing functional limitations',
    'Parking permit advocacy letters',
    'Accommodation request strategies for non-obvious needs',
    'Social scripts for explaining invisible disabilities to family/employers'
  ]
}
```

#### 1.3 **Communication Disabilities**
**Problem:** Currently assumes text-based interaction. Missing:
- Speech disabilities (aphasia, stuttering, selective mutism)
- Language processing disorders
- Non-speaking autism

**Solution:**
```typescript
// Add to DisabilityProfile
communicationNeeds?: {
  useAAC: boolean; // Augmentive & Alternative Communication
  needsExtraProcessingTime: boolean;
  prefersSymbols: boolean;
  usesSignLanguage: boolean;
  needsWrittenFollowup: boolean;
}

// New accessibility features
accessibilityFeatures: [
  ...existing,
  'AAC_compatible',      // Works with AAC devices
  'symbol_based',        // Picture/symbol UI option
  'no_time_pressure',    // No timeouts or rush
  'text_to_speech',      // Read everything aloud
  'speech_to_text'       // Voice input everywhere
]
```

#### 1.4 **Developmental & Intellectual Disabilities**
**Problem:** App may be too complex for users with intellectual disabilities or their caregivers.

**Solution:**
- **Easy-Read Mode** - Simple words, short sentences, pictures
- **Caregiver Mode** - Allow trusted person to help manage advocacy
- **Visual Schedules** - Picture-based task lists
- **Plain Language Override** - Automatically simplify all legal/medical text (max grade 5 reading level)

```typescript
// New profile option
supportedBy?: {
  hasCaregiver: boolean;
  caregiverEmail?: string;
  caregiverCanAccess?: 'full' | 'limited' | 'view_only';
  needsSimplifiedLanguage: 'always' | 'optional';
}
```

#### 1.5 **Environmental Sensitivities**
**Problem:** Missing: MCS (Multiple Chemical Sensitivity), electromagnetic hypersensitivity, severe allergies.

**Solution:**
```typescript
// Add to disabilityTypes
disabilityTypes: [
  ...existing,
  'environmental_illness', // MCS, EI, EMF sensitivity
  'severe_allergies'       // Life-threatening allergies
]

// New tools
{
  id: 'environmental_accommodation_builder',
  title: 'Environmental Accommodation Request',
  description: 'Request scent-free workplace, allergen removal, or EMF accommodations',
  letterTemplates: [
    'Scent-free workplace policy request',
    'Chemical exposure accommodation',
    'Allergen removal (food, latex, etc.)',
    'Lighting accommodation (fluorescent sensitivity)',
    'Remote work for environmental illness'
  ]
}
```

#### 1.6 **Specific Missing Conditions**

Add explicit support for commonly stigmatized/misunderstood conditions:

```typescript
// Expand conditions list
conditions?: Array<
  // Currently generic, make specific
  | 'fibromyalgia'           // Often dismissed by doctors
  | 'me_cfs'                 // Chronic Fatigue Syndrome
  | 'long_covid'             // Post-viral syndrome
  | 'ehlers_danlos'          // EDS - connective tissue disorder
  | 'pots'                   // Postural Orthostatic Tachycardia Syndrome
  | 'mast_cell_activation'   // MCAS
  | 'endometriosis'          // Often undiagnosed for years
  | 'pelvic_pain'            // Chronic pelvic pain syndrome
  | 'interstitial_cystitis'  // IC/painful bladder
  | 'migraine_chronic'       // Chronic daily headache
  | 'complex_ptsd'           // C-PTSD
  | 'dissociative_disorders' // DID, DPDR
  | 'eating_disorders'       // Often not seen as disability
  | 'functional_neurological' // FND/conversion disorder
>;
```

**Why These Matter:**
- **High dismissal rates** by medical professionals
- **Difficult to document** (no visible signs, inconsistent tests)
- **Unique accommodation needs** not covered by standard templates
- **Need condition-specific advocacy scripts**

#### 1.7 **Intersectionality**

**Problem:** Disability intersects with race, gender, age, immigration status, poverty - creating unique barriers.

**Solution:**
```typescript
// Add to profile
intersectionalFactors?: {
  racialized: boolean;           // Experience racial bias in healthcare
  immigrant: boolean;             // Language barriers, fear of deportation
  lgbtqia: boolean;              // Face discrimination in healthcare
  lowincome: boolean;            // Can't afford accommodations/legal help
  rural: boolean;                // Limited access to specialists
  indigenous: boolean;           // Systemic barriers in colonial systems (Canada-specific)
  elderlyOrYouth: boolean;       // Age-based dismissal
}

// Adjust tool recommendations based on intersectional barriers
// e.g., Immigrants see: "Know Your Rights (Immigration-Safe Advocacy)"
//       Indigenous users see: "Culturally Safe Healthcare Navigation"
```

---

## 2. 💻 AI & Coding Architecture Suggestions

### 2.1 **Offline-First Architecture** (🔴 CRITICAL)

**Problem:** Many disabled users have:
- Inconsistent internet (poverty, rural areas)
- Can't access app during hospital stays (no wifi/data)
- Cognitive load of "did it save?" anxiety

**Solution:**
```typescript
// Implement robust offline-first with queue system

// services/offlineQueue.ts
export class OfflineActionQueue {
  private queue: Action[] = [];
  
  async enqueue(action: Action) {
    // Save to AsyncStorage immediately
    await this.persistQueue();
    
    // Try to sync if online
    if (await this.isOnline()) {
      await this.syncQueue();
    }
  }
  
  async syncQueue() {
    // Process queue in order when connection restored
    // Retry failed actions with exponential backoff
  }
}

// Key areas to make offline-capable:
// 1. Evidence Locker uploads (queue photos/documents)
// 2. Letter generation (local generation, cloud sync later)
// 3. Mood/symptom tracking (all local with background sync)
// 4. Community posts (draft mode when offline)
// 5. Resource bookmarks (cached content)
```

**Features:**
- ✅ **Visual offline indicator** - "Working Offline - Will sync when connected"
- ✅ **Queue visibility** - Show pending uploads: "3 evidence items waiting to sync"
- ✅ **Manual retry button** - "Retry Sync Now"
- ✅ **Conflict resolution** - If online/offline edits conflict, let user choose

### 2.2 **Voice-First Interaction** (🟡 HIGH VALUE)

**Problem:** Typing is painful/impossible for many users (arthritis, motor disabilities, fatigue).

**Solution:**
```typescript
// Implement comprehensive voice control

// components/VoiceInput.tsx
export function VoiceInput({ onTranscript, placeholder }) {
  // Use expo-speech or react-native-voice
  // Allow voice for:
  // - Evidence notes ("Describe what happened...")
  // - Letter drafting ("Dictate your accommodation request...")
  // - Search ("Find resources for chronic pain...")
  // - Navigation ("Go to wellness tools")
}

// Key features:
// 1. Voice commands for navigation ("Open evidence locker")
// 2. Dictation for long-form content
// 3. Voice shortcuts ("Start mood check", "Log symptom")
// 4. Multi-language voice support (EN, FR, + more)
```

### 2.3 **Smart Deadline Engine** (🔴 CRITICAL)

**Problem:** Users miss deadlines because they're overwhelmed, cognitively impaired, or just forgot.

**Solution:**
```typescript
// services/deadlineEngine.ts

export interface Deadline {
  id: string;
  type: 'appeal' | 'application' | 'renewal' | 'hearing' | 'medical_appointment';
  dueDate: Date;
  jurisdiction: string; // Different rules per province
  description: string;
  consequenceOfMissing: string; // "You will lose your right to appeal"
  canExtend: boolean;
  extensionProcess?: string;
  reminderSchedule: Date[]; // When to notify
  status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
}

export class DeadlineEngine {
  // Auto-calculate deadlines from:
  // - Rights Checker answers ("denied benefits on X date")
  // - Uploaded decision letters (OCR to extract dates)
  // - Jurisdiction rules (WSIB = 6 months, ODSP = 30 days, etc.)
  
  async calculateDeadlines(context: UserContext): Promise<Deadline[]> {
    // Smart deadline detection
  }
  
  async scheduleReminders(deadline: Deadline) {
    // Push notifications: 30 days, 14 days, 7 days, 3 days, 1 day before
    // Email reminders
    // SMS reminders (if enabled)
    // In-app prominent banner
  }
  
  async checkExtensionEligibility(deadline: Deadline): Promise<ExtensionInfo> {
    // Can this deadline be extended?
    // What's the process?
    // Generate extension request letter automatically
  }
}
```

**UI Features:**
- 🔴 **Deadline Dashboard** - All deadlines in one place, sorted by urgency
- 🟠 **Traffic Light System** - Red (overdue), Yellow (< 7 days), Green (> 7 days)
- 🔔 **Escalating Reminders** - Get more frequent as deadline approaches
- 📄 **One-Tap Extension** - Auto-generate extension request letter

### 2.4 **AI Co-Pilot for Advocacy** (🟡 HIGH VALUE)

**Problem:** AI Assistant is reactive (user asks questions). Need proactive AI that watches and helps.

**Solution:**
```typescript
// services/aiCoPilot.ts

export class AICoPilot {
  // Proactive assistance based on user behavior
  
  async analyzeUserJourney(): Promise<ProactiveHelp[]> {
    // Detect patterns:
    // - "User uploaded denial letter but hasn't started appeal" → Suggest appeal wizard
    // - "User logged 3 bad mood days in a row" → Suggest peer support
    // - "User opened rights checker 5 times" → Suggest booking call with advocate
    // - "User has evidence but no legal workflow" → Suggest Legal Workflow Assistant
    
    return suggestions;
  }
  
  async smartFormPrefill(formType: string): Promise<PrefillData> {
    // Use AI to pre-fill forms based on:
    // - Previous form submissions
    // - Evidence locker content
    // - Profile information
    // - Symptom tracker data
    
    // Example: Appeal form auto-fills with:
    // - Name/address from profile
    // - Denial date from uploaded letter (OCR)
    // - Symptoms from tracker history
    // - Medical providers from previous forms
  }
  
  async detectDocumentType(file: File): Promise<DocumentInsights> {
    // OCR + AI classification:
    // "This looks like a denial letter for WSIB. Key dates: ..."
    // "This is a medical report. Want me to extract functional limitations?"
    // "This appears to be an accommodation denial. Generate appeal?"
  }
}
```

### 2.5 **Privacy-First Architecture** (🔴 CRITICAL)

**Problem:** Users are sharing highly sensitive medical/legal info. One breach = catastrophic.

**Solution:**
```typescript
// Implement zero-knowledge architecture

// security/encryption.ts
export class E2EEncryption {
  // End-to-end encryption for sensitive data
  // - User generates key pair on device
  // - Private key never leaves device (stored in secure enclave)
  // - All evidence/notes encrypted before upload
  // - Server only stores encrypted blobs
  // - Only user can decrypt their own data
  
  async encryptEvidence(data: Evidence): Promise<EncryptedBlob> {
    const userPublicKey = await this.getUserPublicKey();
    return await encrypt(data, userPublicKey);
  }
}

// Additional privacy features:
// 1. Biometric locks for Evidence Locker
// 2. Auto-logout after inactivity
// 3. Screenshot protection for sensitive screens
// 4. Audit log (who accessed what, when)
// 5. Data export (GDPR compliance)
// 6. Account deletion (complete data wipe)
```

### 2.6 **Performance Optimization**

**Problem:** Low-end phones, data caps, battery life matter to disabled users (often low income).

**Solution:**
```typescript
// Optimize for low-end devices and limited data

// 1. Image compression
// - Compress evidence photos before upload (save data)
// - Lazy load images (save memory)
// - Use WebP format (smaller size)

// 2. Code splitting
// - Load features on-demand
// - Don't load AI features if user isn't using them
// - Progressive enhancement

// 3. Battery optimization
// - Reduce background syncing
// - Batch network requests
// - Use efficient data structures

// 4. Data usage indicators
// - Show "This will use 5MB" before downloading
// - Offer "Lite Mode" (text-only, no images)
```

### 2.7 **Testing & Accessibility**

```typescript
// __tests__/accessibility/WCAG_AAA_compliance.test.tsx

describe('WCAG AAA Compliance', () => {
  test('All interactive elements have 44x44pt touch targets', () => {
    // Minimum for motor impairments
  });
  
  test('Color contrast ratio >= 7:1 for all text', () => {
    // AAA standard (higher than AA's 4.5:1)
  });
  
  test('All features work with keyboard only', () => {
    // For users who can't use touch
  });
  
  test('All images have alt text', () => {
    // Screen reader support
  });
  
  test('All forms have clear labels and error messages', () => {
    // Cognitive accessibility
  });
  
  test('App works with 200% text zoom', () => {
    // Vision impairments
  });
  
  test('No flashing content (seizure safety)', () => {
    // Epilepsy safety
  });
});

// User testing with actual disabled people
// - Pay testers fairly
// - Recruit across disability types
// - Test with assistive tech (screen readers, switch controls, voice control)
// - Iterative feedback loops
```

---

## 3. 🚀 One-of-a-Kind Features (Unique Value Propositions)

### 3.1 **"Accountability Network"** - Hold Bad Actors Accountable

**Problem:** Employers/insurers get away with discrimination because there's no public record.

**Solution:**
```typescript
// Crowdsourced accountability platform

interface AccountabilityReport {
  entityType: 'employer' | 'insurance_company' | 'medical_provider' | 'government_agency';
  entityName: string;
  jurisdiction: string;
  violationType: 'discrimination' | 'benefit_denial' | 'accommodation_refusal' | 'harassment';
  outcomeType: 'won_appeal' | 'lost_appeal' | 'settled' | 'ongoing';
  timeline: string; // How long did process take?
  advice: string;   // What would you tell others facing this?
  verified: boolean; // Admin-verified or user-reported
}

// Features:
// 1. **Employer/Insurer Ratings**
//    - "WorkSafeBC - 2.3/5 stars - 456 reports of benefit denials"
//    - "Manulife Insurance - 1.8/5 - High denial rate for mental health"
//    - "Acme Corp - 4.2/5 - Good accommodation track record"

// 2. **Pattern Detection**
//    - "23 users reported XYZ Insurance denying fibromyalgia claims"
//    - "This employer has 12 unresolved discrimination complaints"
//    - "Warning: This doctor frequently writes reports favoring insurers"

// 3. **Class Action Matching**
//    - "15 others facing same issue with your insurer. Join forces?"
//    - Auto-connect users with similar cases
//    - Crowd-fund legal fees

// 4. **Media Amplification**
//    - Auto-generate press release
//    - Connect with disability rights journalists
//    - Social media campaign templates (#DisabilityJustice)
```

**Implementation:**
```typescript
// app/(tabs)/accountability/report.tsx
export default function ReportBadActor() {
  // Form to report violations
  // - Entity name (searchable database)
  // - Violation type
  // - Evidence upload (optional, encrypted)
  // - Outcome
  // - Advice for others
  
  // Moderation:
  // - Require minimum account age (prevent spam)
  // - Admin review before publishing
  // - Allow entity to respond (fairness)
}

// app/(tabs)/accountability/search.tsx
export default function SearchAccountability() {
  // Search by:
  // - Employer name
  // - Insurance company
  // - Province
  // - Violation type
  
  // Show:
  // - Rating (1-5 stars)
  // - Number of reports
  // - Success rate of appeals
  // - Average timeline
  // - Recent patterns
}
```

### 3.2 **"Justice Wallet"** - Micro-Donations for Legal Fees

**Problem:** Legal representation costs thousands. Most disabled people can't afford it.

**Solution:**
```typescript
// Crowdfunding platform for legal fees

interface JusticeCase {
  id: string;
  userName: string; // Anonymous or public
  caseType: 'wrongful_termination' | 'benefit_denial' | 'discrimination' | 'other';
  jurisdiction: string;
  goalAmount: number;
  raisedAmount: number;
  story: string;
  updates: CaseUpdate[];
  legalRepresentation: string; // Which lawyer/clinic
  verified: boolean; // Verified by legal clinic
}

// Features:
// 1. **Micro-donations**
//    - "Donate $5 to help Sarah appeal her LTD denial"
//    - Community supports each other

// 2. **Legal Clinic Partnerships**
//    - Partner with clinics to verify cases
//    - Funds go directly to clinic (not user)
//    - Ensures money used for legal fees

// 3. **Transparency**
//    - Case updates ("We won the appeal!")
//    - Show exactly how funds used
//    - Refund unused funds or forward to next case

// 4. **Matching System**
//    - "Your case is similar to 3 funded cases. Success rate: 67%"
//    - Connect donors to cases in their province
```

### 3.3 **"Disability Rights AI Lawyer"** - Free Legal Analysis

**Problem:** Can't afford lawyer consultation. Need to know if you have a case.

**Solution:**
```typescript
// AI legal analysis (NOT legal advice, but informed analysis)

export async function analyzeLegalCase(context: CaseContext): Promise<LegalAnalysis> {
  // AI analyzes:
  // - Uploaded denial letters
  // - Description of situation
  // - Jurisdiction laws
  // - Evidence strength
  // - Similar case outcomes
  
  return {
    caseStrength: 'strong' | 'moderate' | 'weak',
    reasoning: string[],
    similarCases: Case[], // "23 similar cases in Ontario, 78% success rate"
    suggestedActions: string[],
    requiredEvidence: string[], // "You need: functional capacity evaluation, medical report from specialist"
    estimatedTimeline: string, // "6-12 months for WSIB appeal"
    estimatedCost: string, // "Legal clinic = free, private lawyer = $5k-15k"
    
    // KEY: Clear disclaimer
    disclaimer: "This is AI analysis, not legal advice. Consult a lawyer for your specific situation."
  };
}

// UI:
// - Upload denial letter → AI extracts key info
// - Answer questions → AI assesses case strength
// - Get analysis → "You have a strong case for appeal because..."
// - Next steps → "Here's what to do next..."
```

### 3.4 **"Accommodation Negotiation Coach"** - Live Meeting Support

**Problem:** Users freeze in accommodation meetings. Need real-time support.

**Solution:**
```typescript
// Live meeting companion

export function AccommodationMeetingCoach() {
  // Before meeting:
  // - Generate meeting agenda
  // - Prepare responses to common pushback
  // - Print cheat sheet with key points
  
  // During meeting (phone in pocket, earbuds):
  // - Voice-activated prompts
  // - "If they say X, respond with Y"
  // - Real-time script suggestions
  // - Record meeting (legal in Canada with one-party consent)
  
  // After meeting:
  // - Auto-generate follow-up email
  // - Transcribe recording to text
  // - Identify red flags ("They said they 'can't' accommodate, but legally they must")
  // - Suggest next steps
}

// Features:
// 1. **Script Generator**
//    - "How to ask for remote work accommodation"
//    - "How to respond to 'but you look fine'"
//    - "How to pushback on intrusive medical questions"

// 2. **Power Phrases**
//    - "Under the Human Rights Code, you have a duty to accommodate..."
//    - "My doctor has confirmed these limitations..."
//    - "What alternatives can you propose?"

// 3. **Red Flag Detection**
//    - "That phrase suggests they're discriminating. Here's why..."
//    - "They asked an illegal question. You don't have to answer."
```

### 3.5 **"Medical Gaslighting Detector"** - Validate Your Experience

**Problem:** Doctors dismiss disabled patients, especially women, people of color, fat people.

**Solution:**
```typescript
// Detect patterns of medical gaslighting

export function MedicalGaslightingDetector() {
  // After medical appointments, user logs:
  // - What they said
  // - How doctor responded
  // - Outcome (got help vs dismissed)
  
  // AI detects red flags:
  // ❌ "It's just anxiety"
  // ❌ "You're too young for that"
  // ❌ "Have you tried yoga?"
  // ❌ "Lose weight and you'll feel better"
  // ❌ "It's all in your head"
  // ❌ Interrupting repeatedly
  // ❌ Spending < 5 minutes with patient
  
  // Suggestions:
  // ✅ "Find a new doctor" (with directory of disability-friendly doctors)
  // ✅ "Bring advocate to next appointment"
  // ✅ "File complaint with College of Physicians"
  // ✅ "Use evidence locker to document pattern"
  
  // Crowdsourced doctor ratings:
  // - "Dr. Smith - Good with chronic pain patients (4.2/5)"
  // - "Dr. Jones - Known for dismissing women (1.8/5)"
}
```

### 3.6 **"Benefit Maximizer"** - Find ALL Money You're Eligible For

**Problem:** Users miss out on benefits because they don't know they exist.

**Solution:**
```typescript
// Comprehensive benefit finder + application assistant

export async function findAllBenefits(profile: UserProfile): Promise<Benefit[]> {
  // Scan ALL possible benefits:
  // Federal:
  // - CPP-D (Canada Pension Plan Disability)
  // - Disability Tax Credit
  // - Medical Expense Tax Credit
  // - Registered Disability Savings Plan (RDSP) grants
  // - Employment Insurance Sickness Benefits
  
  // Provincial (example Ontario):
  // - ODSP (Ontario Disability Support Program)
  // - Trillium Drug Benefit
  // - Assistive Devices Program
  // - Special Services at Home
  // - Accessibility equipment tax credits
  
  // Municipal:
  // - Transit passes
  // - Recreation subsidies
  // - Property tax breaks
  
  // Private:
  // - Employer LTD (Long Term Disability)
  // - Union benefits
  // - Veterans benefits
  
  // Hidden benefits:
  // - Telecommunication discounts
  // - Utility bill assistance
  // - Free legal services
  // - Food bank programs
  // - Prescription assistance programs
  
  return benefits.map(b => ({
    name: string,
    estimatedValue: number, // "$12,000/year"
    eligibilityMatch: number, // 0-100% "You likely qualify"
    applicationDifficulty: 'easy' | 'moderate' | 'complex',
    requiredDocuments: string[],
    applicationDeadline: Date | null,
    canApplyOnline: boolean,
    estimatedProcessingTime: string,
  }));
}

// Auto-apply feature:
// - "You qualify for 7 benefits worth $34,000/year"
// - "Let me help you apply to all of them"
// - Pre-fill forms using profile data
// - Track application status
// - Remind about renewals
```

### 3.7 **"Crisis Mode"** - Emergency Support

**Problem:** Users in crisis need immediate help, not complex navigation.

**Solution:**
```typescript
// One-tap crisis support

export function CrisisMode() {
  // Big red button: "I NEED HELP NOW"
  
  // Offers:
  // 1. Emergency contacts (pre-configured)
  // 2. Crisis lines (mental health, suicide prevention, domestic violence)
  // 3. Location sharing with trusted contacts
  // 4. Pre-written emergency messages ("I need help at [location]")
  // 5. Evidence quick-capture ("Take photo of injury/situation")
  // 6. Safety planning (escape routes, safe people, danger signs)
  // 7. Hospital rights card (print/show to ER staff)
  
  // After crisis:
  // - Document what happened (for legal case)
  // - Connect with peer support
  // - Schedule follow-up appointments
  // - Update safety plan
}
```

---

## 4. 📝 Expanded Letter Wizard - Complete Letter Types

### Currently Covered (✅)
- ✅ Accommodation Request
- ✅ Appeal Letter
- ✅ Reconsideration Request
- ✅ Return-to-Work Plan
- ✅ Union Assistance Request

### New Letter Types to Add

#### 4.1 **Government & Benefits Letters**

```typescript
// Add to LETTER_TEMPLATES in letter-wizard.tsx

{
  type: 'cpp_disability_application',
  titleKey: 'CPP-D Application Supporting Letter',
  descKey: 'Letter from employer/doctor supporting CPP Disability application',
  fields: [
    'name', 'sin', 'doctorName', 'employerName', 'lastWorkDate',
    'diagnosisSummary', 'functionalLimitations', 'treatmentHistory', 'prognosis'
  ],
},
{
  type: 'odsp_application',
  titleKey: 'ODSP Application Supporting Letter',
  descKey: 'Supporting letter for Ontario Disability Support Program application',
  fields: [
    'name', 'dateOfBirth', 'diagnosis', 'dailyLimitations',
    'medicalSupports', 'employmentHistory', 'financialHardship'
  ],
},
{
  type: 'dtc_application',
  titleKey: 'Disability Tax Credit Application',
  descKey: 'Request doctor complete T2201 form',
  fields: [
    'name', 'doctorName', 'diagnosisDate', 'limitationsDescription',
    'assistiveDevicesUsed', 'timeSpentOnActivities'
  ],
},
{
  type: 'rdsp_application',
  titleKey: 'RDSP Application Letter',
  descKey: 'Apply to open Registered Disability Savings Plan',
  fields: [
    'name', 'sin', 'dtcApprovalDate', 'bankName', 'investmentGoals'
  ],
},
{
  type: 'benefit_renewal',
  titleKey: 'Benefit Renewal Letter',
  descKey: 'Request renewal of expiring benefits (LTD, ODSP, etc.)',
  fields: [
    'name', 'benefitType', 'currentExpiryDate', 'conditionUpdate',
    'continuingLimitations', 'newMedicalEvidence'
  ],
},

// 4.2 **Employer Relations Letters**

{
  type: 'medical_leave_request',
  titleKey: 'Medical Leave Request',
  descKey: 'Request extended medical leave or STD/LTD benefits',
  fields: [
    'name', 'position', 'employeeSince', 'requestedLeaveStart',
    'estimatedDuration', 'medicalReason', 'doctorName', 'returnPlan'
  ],
},
{
  type: 'leave_extension',
  titleKey: 'Medical Leave Extension Request',
  descKey: 'Request to extend existing medical leave',
  fields: [
    'name', 'originalLeaveEnd', 'extensionRequested', 'medicalUpdate',
    'newReturnDate', 'doctorRecommendation'
  ],
},
{
  type: 'wsib_claim',
  titleKey: 'WSIB Claim Supporting Letter',
  descKey: 'Letter to support workplace injury claim',
  fields: [
    'name', 'employeeSince', 'position', 'incidentDate', 'incidentDescription',
    'witnesses', 'injuriesSustained', 'medicalTreatment', 'timeOffWork'
  ],
},
{
  type: 'harassment_complaint',
  titleKey: 'Workplace Harassment Complaint',
  descKey: 'Formal complaint about harassment or discrimination',
  fields: [
    'name', 'position', 'harasserName', 'incidentDates', 'incidentDescriptions',
    'witnesses', 'impactOnWork', 'previousReports', 'desiredResolution'
  ],
},
{
  type: 'constructive_dismissal',
  titleKey: 'Constructive Dismissal Letter',
  descKey: 'Allege employer created intolerable working conditions',
  fields: [
    'name', 'position', 'employedSince', 'conditionsDescription',
    'attemptedResolution', 'impactOnHealth', 'resignationDate'
  ],
},
{
  type: 'wrongful_termination',
  titleKey: 'Wrongful Termination Complaint',
  descKey: 'Allege you were fired due to disability discrimination',
  fields: [
    'name', 'position', 'hireDate', 'terminationDate', 'reasonGiven',
    'evidenceOfDiscrimination', 'accommodationRequests', 'desiredOutcome'
  ],
},

// 4.3 **Insurance & Medical Letters**

{
  type: 'ltd_appeal',
  titleKey: 'LTD Denial Appeal',
  descKey: 'Appeal denial of Long Term Disability insurance benefits',
  fields: [
    'name', 'policyNumber', 'denialDate', 'denialReasons', 'medicalEvidence',
    'functionalCapacity', 'doctorOpinion', 'workHistory'
  ],
},
{
  type: 'ime_objection',
  titleKey: 'IME Objection Letter',
  descKey: 'Object to Independent Medical Examination report',
  fields: [
    'name', 'policyNumber', 'imeDate', 'imeDoctorName', 'objections',
    'treatingDoctorOpinion', 'requestReassessment'
  ],
},
{
  type: 'surveillance_complaint',
  titleKey: 'Surveillance Complaint Letter',
  descKey: 'Complain about invasive surveillance by insurer/employer',
  fields: [
    'name', 'surveillanceDates', 'surveillanceDescription', 'privacyViolation',
    'emotionalDistress', 'requestCeaseAndDesist'
  ],
},
{
  type: 'doctor_support_request',
  titleKey: 'Request Doctor Support Letter',
  descKey: 'Ask your doctor to write letter supporting your claim',
  fields: [
    'name', 'doctorName', 'purposeOfLetter', 'specificPoints',
    'deadline', 'recipientName'
  ],
},
{
  type: 'medical_records_request',
  titleKey: 'Medical Records Access Request',
  descKey: 'Request copies of your medical records',
  fields: [
    'name', 'dateOfBirth', 'recordsPeriod', 'purposeOfRequest',
    'deliveryMethod', 'authorizationConsent'
  ],
},
{
  type: 'prescription_coverage_appeal',
  titleKey: 'Prescription Coverage Appeal',
  descKey: 'Appeal denial of drug coverage',
  fields: [
    'name', 'policyNumber', 'drugName', 'prescribingDoctor', 'denialReason',
    'medicalNecessity', 'alternativesTried', 'costImpact'
  ],
},

// 4.4 **Housing & Accessibility Letters**

{
  type: 'housing_accommodation',
  titleKey: 'Housing Accommodation Request',
  descKey: 'Request accessibility modifications from landlord',
  fields: [
    'name', 'address', 'landlordName', 'modificationsRequested',
    'medicalNecessity', 'costEstimate', 'offerToPayPortion'
  ],
},
{
  type: 'service_animal_approval',
  titleKey: 'Service Animal Approval Request',
  descKey: 'Request approval for service animal in housing/workplace',
  fields: [
    'name', 'animalType', 'certifications', 'medicalNecessity',
    'training', 'behaviorHistory', 'responsibilityAgreement'
  ],
},
{
  type: 'parking_permit_appeal',
  titleKey: 'Accessible Parking Permit Appeal',
  descKey: 'Appeal denial of accessible parking permit',
  fields: [
    'name', 'denialReason', 'mobilityLimitations', 'medicalSupport',
    'alternativeTransportChallenges', 'functionalImpact'
  ],
},

// 4.5 **Education Letters**

{
  type: 'iep_request',
  titleKey: 'IEP Request Letter',
  descKey: 'Request Individual Education Plan for student',
  fields: [
    'studentName', 'grade', 'schoolName', 'disabilityDescription',
    'currentChallenges', 'requestedAccommodations', 'assessmentRequest'
  ],
},
{
  type: 'academic_accommodation',
  titleKey: 'Post-Secondary Accommodation Request',
  descKey: 'Request accommodations at college/university',
  fields: [
    'name', 'studentId', 'program', 'disabilityDescription',
    'requestedAccommodations', 'medicalDocumentation', 'urgency'
  ],
},
{
  type: 'exam_accommodation',
  titleKey: 'Exam Accommodation Request',
  descKey: 'Request specific exam accommodations (extra time, quiet room, etc.)',
  fields: [
    'name', 'course', 'examDate', 'accommodationsNeeded',
    'justification', 'previousAccommodations'
  ],
},

// 4.6 **Human Rights & Legal Letters**

{
  type: 'human_rights_complaint',
  titleKey: 'Human Rights Tribunal Complaint',
  descKey: 'File formal complaint with Human Rights Tribunal',
  fields: [
    'name', 'respondentName', 'protectedGround', 'incidentDetails',
    'attemptedResolution', 'impact', 'desiredRemedy', 'jurisdiction'
  ],
},
{
  type: 'cease_and_desist',
  titleKey: 'Cease and Desist Letter',
  descKey: 'Demand someone stop harmful behavior',
  fields: [
    'name', 'recipientName', 'harmfulBehavior', 'legalBasis',
    'consequencesIfContinued', 'deadline'
  ],
},
{
  type: 'demand_letter',
  titleKey: 'Legal Demand Letter',
  descKey: 'Formal demand for action or compensation',
  fields: [
    'name', 'recipientName', 'wrongDescription', 'legalBasis',
    'demandedAction', 'compensationRequested', 'deadline', 'nextSteps'
  ],
},
{
  type: 'complaint_to_regulator',
  titleKey: 'Complaint to Professional Regulator',
  descKey: 'File complaint against doctor, lawyer, or other professional',
  fields: [
    'name', 'professionalName', 'profession', 'regulatoryBody',
    'misconductDescription', 'evidence', 'standardsViolated', 'desiredOutcome'
  ],
},

// 4.7 **Financial & Social Services Letters**

{
  type: 'debt_hardship',
  titleKey: 'Financial Hardship Letter',
  descKey: 'Request payment plan or debt forgiveness due to disability',
  fields: [
    'name', 'accountNumber', 'debtAmount', 'disabilityExplanation',
    'incomeReduction', 'medicalExpenses', 'proposedPaymentPlan'
  ],
},
{
  type: 'credit_dispute',
  titleKey: 'Credit Report Dispute',
  descKey: 'Dispute credit report errors caused by disability-related financial hardship',
  fields: [
    'name', 'creditBureau', 'disputedItems', 'circumstancesExplanation',
    'documentationProvided', 'requestCorrection'
  ],
},
{
  type: 'utility_assistance',
  titleKey: 'Utility Assistance Request',
  descKey: 'Request help with utility bills or disconnection prevention',
  fields: [
    'name', 'accountNumber', 'utilityType', 'disabilityRelatedNeeds',
    'financialSituation', 'assistancePrograms', 'paymentProposal'
  ],
},

// 4.8 **Miscellaneous Advocacy Letters**

{
  type: 'airline_complaint',
  titleKey: 'Airline Accessibility Complaint',
  descKey: 'Complain about airline failing to accommodate disability',
  fields: [
    'name', 'flightNumber', 'date', 'accommodationRequested',
    'airlineResponse', 'incidentDescription', 'impact', 'desiredResolution'
  ],
},
{
  type: 'gym_membership_freeze',
  titleKey: 'Gym Membership Medical Freeze',
  descKey: 'Request to freeze gym membership due to medical inability to attend',
  fields: [
    'name', 'membershipNumber', 'medicalReason', 'doctorNote',
    'requestedFreezeDuration', 'returnToActivityPlan'
  ],
},
{
  type: 'jury_duty_exemption',
  titleKey: 'Jury Duty Medical Exemption',
  descKey: 'Request exemption from jury duty due to disability',
  fields: [
    'name', 'juryDutyDate', 'courtName', 'disabilityDescription',
    'reasonUnableToServe', 'medicalDocumentation'
  ],
},
{
  type: 'volunteer_accommodation',
  titleKey: 'Volunteer Role Accommodation Request',
  descKey: 'Request accommodations for volunteer position',
  fields: [
    'name', 'organization', 'volunteerRole', 'limitationsDescription',
    'requestedModifications', 'benefitsOfInclusion'
  ],
},
```

### Implementation Plan for Expanded Letters

```typescript
// 1. Add all new letter types to LETTER_TEMPLATES object
// 2. Create new situation categories:

const SITUATIONS: SituationOption[] = [
  ...existing,
  {
    id: 'government_benefits',
    icon: '🏛️',
    titleKey: 'Applying for Government Benefits',
    descKey: 'CPP-D, ODSP, tax credits, RDSP',
    recommendedLetters: ['cpp_disability_application', 'odsp_application', 'dtc_application', 'rdsp_application']
  },
  {
    id: 'insurance_dispute',
    icon: '📄',
    titleKey: 'Insurance Dispute',
    descKey: 'LTD denial, IME objection, surveillance complaint',
    recommendedLetters: ['ltd_appeal', 'ime_objection', 'surveillance_complaint']
  },
  {
    id: 'employer_leave',
    icon: '🏥',
    titleKey: 'Medical Leave',
    descKey: 'Request or extend medical leave',
    recommendedLetters: ['medical_leave_request', 'leave_extension', 'wsib_claim']
  },
  {
    id: 'workplace_issues',
    icon: '⚠️',
    titleKey: 'Workplace Problems',
    descKey: 'Harassment, discrimination, wrongful termination',
    recommendedLetters: ['harassment_complaint', 'constructive_dismissal', 'wrongful_termination']
  },
  {
    id: 'housing_accessibility',
    icon: '🏠',
    titleKey: 'Housing & Accessibility',
    descKey: 'Modifications, service animals, parking permits',
    recommendedLetters: ['housing_accommodation', 'service_animal_approval', 'parking_permit_appeal']
  },
  {
    id: 'education',
    icon: '🎓',
    titleKey: 'School/College Accommodations',
    descKey: 'IEP, academic accommodations, exam modifications',
    recommendedLetters: ['iep_request', 'academic_accommodation', 'exam_accommodation']
  },
  {
    id: 'human_rights',
    icon: '⚖️',
    titleKey: 'Human Rights Complaint',
    descKey: 'File discrimination complaint or legal action',
    recommendedLetters: ['human_rights_complaint', 'cease_and_desist', 'demand_letter']
  },
  {
    id: 'financial_hardship',
    icon: '💰',
    titleKey: 'Financial Hardship',
    descKey: 'Debt relief, payment plans, utility assistance',
    recommendedLetters: ['debt_hardship', 'credit_dispute', 'utility_assistance']
  },
  {
    id: 'medical_support',
    icon: '🩺',
    titleKey: 'Medical Documentation',
    descKey: 'Request doctor support, medical records, prescription coverage',
    recommendedLetters: ['doctor_support_request', 'medical_records_request', 'prescription_coverage_appeal']
  },
];

// 3. Add comprehensive translation keys (EN/FR) for all new letters
// 4. Create letter preview templates for each type
// 5. Add smart suggestions based on user context
//    e.g., If Rights Checker shows "benefits denied", suggest appeal letters
```

---

## Priority Implementation Roadmap

### 🔴 **Phase 1: Critical Gaps (Q1 2026)**
1. Episodic/Fluctuating Disabilities support (Bad Day Mode, Flare Tracker)
2. Smart Deadline Engine (auto-calculate deadlines, escalating reminders)
3. Offline-First Architecture (queue system for evidence uploads)
4. Expanded Letter Wizard (+30 letter types covering all situations)
5. Privacy-First E2E Encryption (zero-knowledge architecture)

### 🟠 **Phase 2: High-Value Adds (Q2 2026)**
1. Accountability Network (employer/insurer ratings, pattern detection)
2. AI Co-Pilot (proactive suggestions, smart form prefill, document OCR)
3. Voice-First Interaction (voice commands, dictation, navigation)
4. Benefit Maximizer (find ALL eligible benefits, auto-apply)
5. Medical Gaslighting Detector (validate user experiences)

### 🟡 **Phase 3: One-of-a-Kind Features (Q3 2026)**
1. Justice Wallet (crowdfunding for legal fees)
2. Disability Rights AI Lawyer (free case strength analysis)
3. Accommodation Negotiation Coach (live meeting support)
4. Crisis Mode (one-tap emergency support)
5. Intersectionality Support (adjust tools for race, gender, immigration, poverty)

### 🟢 **Phase 4: Advanced Enhancements (Q4 2026)**
1. Communication Disabilities support (AAC, symbol-based UI)
2. Developmental/Intellectual Disabilities support (Easy-Read Mode, Caregiver Mode)
3. Environmental Sensitivities support (scent-free accommodations, etc.)
4. Performance Optimization (low-end devices, data saving, battery life)
5. Comprehensive User Testing (paid testers across disability types)

---

## Success Metrics

**How to measure if these features actually help:**

1. **Outcomes Tracking**
   - % of users who win appeals (track "I won!" vs "I lost")
   - Time from denial to resolution
   - $ amount recovered in benefits/settlements

2. **User Engagement**
   - Daily active users (especially returning users = app is helping)
   - Feature completion rates (% who start appeal and finish it)
   - Evidence locker usage (sign they're building case)

3. **Accountability Impact**
   - # of employers/insurers with multiple reports
   - Media coverage generated from accountability reports
   - Class action suits formed through platform

4. **Community Health**
   - # of peer support connections made
   - User ratings of peer support quality
   - Retention rate (users stay because community helps)

5. **Financial Impact**
   - Total $ in benefits secured by users
   - # of successful crowdfunding campaigns
   - Average legal costs saved

---

## Conclusion

**What makes 3mpwr truly one-of-a-kind:**

1. **First app to focus on ACCOUNTABILITY** - Not just help individuals, but hold bad actors accountable publicly
2. **Justice as a Service** - Democratize access to legal help through AI, crowdfunding, and community
3. **Disability-Led Design** - Built BY disabled people FOR disabled people (not "inspiration porn")
4. **Radical Accessibility** - Works offline, on low-end devices, with voice, with AAC, with easy-read
5. **Intersectional** - Acknowledges that disability intersects with race, gender, class, immigration
6. **Evidence-Based** - Track outcomes, measure success, iterate based on what actually helps
7. **Community Power** - Users support each other financially, emotionally, and tactically

**The North Star:** 
> "When a disabled person in Canada faces discrimination, their first thought should be: 'Open 3mpwr.' The app becomes their lawyer, their advocate, their community, and their weapon for justice."

---

**Next Steps:**
1. Prioritize Phase 1 features
2. User research with diverse disabled community
3. Legal review (ensure accountability features are legally sound)
4. Partner with disability rights organizations
5. Secure funding for development (grants, crowdfunding, impact investors)
6. Build with disabled developers and designers
7. Launch beta with 100 diverse testers
8. Iterate based on real-world feedback
9. Scale across Canada, then internationally

---

*This document prepared with deep respect for the disability community and commitment to creating tools that actually help, not just look good.*
