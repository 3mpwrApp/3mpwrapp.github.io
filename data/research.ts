export type ResearchSection = {
  id: string;
  heading: string;
  tags?: string[];
  paragraphs?: string[]; // ordered textual paragraphs
  quotes?: { text: string; attribution?: string }[];
  bullets?: string[];
  subsections?: ResearchSection[]; // nested subsections
};

export type ResearchReference = {
  id: string;
  citation: string;
  url?: string;
};

export type Research = {
  id: string;
  title: string;
  summary: string;
  year: number;
  topics: string[]; // e.g., ["injured workers", "return-to-work"]
  source: string; // organization / journal / article type
  url: string;
  content?: ResearchSection[]; // optional long-form structured content
  references?: ResearchReference[]; // optional references list
};

export const researchItems: Research[] = [
  {
    id: "rsh1",
    title: "Return-to-Work Outcomes for Injured Workers in Canada",
    summary:
      "A cross-provincial summary of RTW timelines and supports impacting injured workers.",
    year: 2023,
    topics: ["injured workers", "return-to-work", "policy"],
    source: "University Research Brief",
    url: "https://example.org/rtw-outcomes-canada",
  },
  {
    id: "rsh2",
    title: "Barriers to Benefits Access in WSIB/WCB Systems",
    summary:
      "Qualitative review of common documentation and process barriers in workers' compensation.",
    year: 2022,
    topics: ["WSIB/WCB", "access", "policy"],
    source: "Policy Working Paper",
    url: "https://example.org/benefits-access-barriers",
  },
  {
    id: "rsh3",
    title: "Disability and Mental Health at Work: Evidence Review",
    summary:
      "Evidence-based practices for accommodations and mental health supports in workplaces.",
    year: 2021,
    topics: ["disability", "mental health", "accommodations"],
    source: "Evidence Review",
    url: "https://example.org/disability-mental-health-review",
  },
  {
    id: "rsh4",
    title: "Government Report on Workplace Accessibility Standards",
    summary:
      "Annual report on implementation of accessibility standards across Canadian workplaces.",
    year: 2023,
    topics: ["accessibility", "standards", "workplace"],
    source: "Government Report",
    url: "https://example.org/accessibility-standards-report",
  },
  {
    id: "rsh5",
    title: "Community Impact Study: Injured Worker Support Services",
    summary:
      "Assessment of community-based support services and their effectiveness for injured workers.",
    year: 2022,
    topics: ["community", "support services", "injured workers"],
    source: "Government Report",
    url: "https://example.org/community-support-study",
  },
  {
    id: "rsh6",
    title: "Understanding Your Rights: A Guide to Workplace Accommodations",
    summary:
      "Comprehensive guide covering legal rights and practical steps for requesting workplace accommodations.",
    year: 2023,
    topics: ["workplace rights", "accommodations", "advocacy"],
    source: "Advocacy Review",
    url: "https://example.org/accommodation-rights-guide",
  },
  {
    id: "rsh7",
    title: "The Evolution of Disability Rights in Canada",
    summary:
      "Historical analysis of key legislation and landmark cases that shaped disability rights.",
    year: 2021,
    topics: ["disability rights", "advocacy", "legal"],
    source: "Legal Review",
    url: "https://example.org/disability-rights-evolution",
  },
  {
    id: "rsh8",
    title: "Clinical Research: Efficacy of Early Intervention Programs",
    summary:
      "Multi-site clinical study examining outcomes of early intervention for workplace injuries.",
    year: 2023,
    topics: ["clinical research", "early intervention", "injured workers"],
    source: "University Research",
    url: "https://example.org/early-intervention-study",
  },
  {
    id: "wsib-cptsd",
    title: "Systemic Betrayal and Complex PTSD: How WSIB Policies Trap Injured Workers in Cycles of Trauma",
    summary: "Analysis of WSIB institutional practices as drivers of Complex PTSD through coercion, gaslighting, financial sabotage, and systemic betrayal, with a trauma-informed reform model.",
    year: 2025,
    topics: ["WSIB/WCB", "CPTSD", "institutional betrayal", "injured workers", "policy", "mental health"],
    source: "Longform Analysis",
    url: "",
    content: [
      {
        id: "intro",
        heading: "Introduction",
        paragraphs: [
          "The Workplace Safety and Insurance Board (WSIB) of Ontario was created to protect injured workers; instead many of its contemporary practices mirror patterns of institutional betrayal.",
          "This long-form article frames WSIB operational policies through the lens of Complex Post-Traumatic Stress Disorder (CPTSD): coercion, gaslighting, manufactured dependency, and cycles of retraumatization.",
          "Drawing on peer-reviewed studies, testimonies, and diagnostic frameworks, we outline how bureaucratic structures can function as vectors of prolonged, inescapable trauma." 
        ]
      },
      {
        id: "institutional-betrayal",
        heading: "1. WSIB as a Perpetrator of Institutional Betrayal",
        tags: ["institutional betrayal", "control"],
        subsections: [
          {
            id: "coercive-control",
            heading: "Coercive Control and Financial Captivity",
            paragraphs: [
              "Threats of benefit termination function as coercive levers: workers are pressured to return to unsafe or non-therapeutic duties under implicit economic duress.",
              "Premature or forced return-to-work (RTW) mandates often override treating clinicians, escalating risk of reinjury and psychological destabilization." 
            ],
            quotes: [
              { text: "WSIB said I’d lose benefits if I refused modified duties. I reinjured my back lifting patients, but they blamed me.", attribution: "Injured nurse testimony" }
            ],
            bullets: [
              "Financial coercion heightens entrapment (Cloitre et al., 2020)",
              "68% with MSK injuries report irreversible aggravation post premature RTW (Gewurtz et al., 2018)"
            ]
          },
          {
            id: "gaslighting",
            heading: "Gaslighting and Legitimization of Abuse",
            paragraphs: [
              "Systematic denial or reframing of trauma-related pathology as \"pre-existing\" undermines medical legitimacy and destabilizes worker self-trust.",
              "Institutional hostility (e.g., malingering accusations) aligns with interpersonal injustice metrics linked to tripled severe mental illness risk (Orchard et al., 2021)."
            ],
            quotes: [
              { text: "You’re not trying hard enough to recover.", attribution: "Reported case manager statement" }
            ],
            bullets: ["Tribunal reversals highlight evidentiary neglect (WSIAT, 2009)"]
          }
        ]
      },
      {
        id: "cptsd-mechanisms",
        heading: "2. Mechanisms of CPTSD Development",
        tags: ["CPTSD", "mechanisms"],
        paragraphs: [
          "ICD-11 CPTSD involves re-experiencing, avoidance, and disturbances in self-organization (emotional dysregulation, negative self-concept, relational impairment). WSIB practice patterns can activate all three domains." 
        ],
        subsections: [
          {
            id: "re-exposure",
            heading: "Re-Exposure to Trauma",
            bullets: [
              "Forced RTW returns workers to unsafe or abusive contexts (Carnall et al., 2022)",
              "Chronic pain + reinjury loops (22–34% reinjury rates) sustain traumatic stress cycles (Noël et al., 2022)"
            ]
          },
          {
            id: "dysregulation-identity",
            heading: "Emotional Dysregulation and Identity Erosion",
            paragraphs: [
              "Financial shocks trigger physiological stress cascades (cortisol surges) linked to hypertension and immune disturbance (McEwen, 2017).",
              "Loss of occupational identity degrades self-concept, compounding depressive cognitions and shame." 
            ],
            quotes: [
              { text: "I sold my car to pay rent. WSIB said I was ‘non-compliant’—now I’m on antidepressants." },
              { text: "I built homes for 20 years. Now WSIB calls me a ‘burden.’ I hate myself.", attribution: "Carpenter testimony (Manhertz-Smith, 2023)" }
            ]
          },
          {
            id: "relational-harm",
            heading: "Systemic Betrayal and Relational Harm",
            paragraphs: [
              "Isolation, stigma, and community alienation amplify relational distrust. Families experience asset liquidation cascades and social withdrawal.",
              "Intergenerational impacts: elevated absenteeism and stress pathologies among dependents (Noël et al., 2022)." 
            ]
          }
        ]
      },
      {
        id: "financial-sabotage",
        heading: "3. Financial Sabotage: The Denial-to-Destitution Pipeline",
        tags: ["finance", "allostatic load"],
        paragraphs: [
          "Cost-containment incentives create structural pressure to terminate or narrow claims, converting economic scarcity into a behavioral compliance tool.",
          "Financial precarity operates as a pathogenic stress amplifier, driving physiological wear (allostatic load)." 
        ],
        subsections: [
          {
            id: "incentives",
            heading: "Systemic Incentives to Terminate Benefits",
            quotes: [ { text: "We were told to ‘find a reason’ to deny. If the worker can walk, they can work—even if their surgeon disagrees.", attribution: "Former case manager" } ],
            bullets: [
              "Quota-driven denials (MacEachen et al., 2020)",
              "Experience rating fuels claim suppression (Premji et al., 2025)"
            ]
          },
          {
            id: "stress-physiology",
            heading: "Financial Stress Physiology",
            bullets: [
              "300–400% cortisol spikes inhibit tissue repair (McEwen, 2017)",
              "Lower NK cell activity (-40%) elevates infection and cancer risk (McEwen, 2017)",
              "Denied claimants: 72% below poverty line; 42% housing loss within 6 months (Edgelow et al., 2023)"
            ],
            quotes: [ { text: "WSIB cut me off, so I skipped painkillers to buy groceries. My herniated disc fused crooked—now I’m disabled for life.", attribution: "Worker testimony (Noël et al., 2022)" } ]
          }
        ]
      },
      {
        id: "structural-complicity",
        heading: "4. Structural Complicity in Trauma",
        paragraphs: [
          "Organizational architectures (experience rating, claim closure quotas) embed moral hazard, incentivizing adversarial employer alignment and procedural attrition (delay-deny-discontinue)." 
        ],
        bullets: [
          "Job relabeling to evade liability (case examples)",
          "80% closure target within 90 days (MacEachen et al., 2020)",
          "Appeal latency: 12–18 months with 40% abandonment (Noël et al., 2022)"
        ]
      },
      {
        id: "recovery-model",
        heading: "5. Trauma-Informed Recovery Model",
        paragraphs: [
          "Effective CPTSD remediation necessitates stabilizing safety, restoring agency, and mitigating economic drivers of dysregulation. Reform pillars span benefit continuity, prosecutorial accountability, and abolition of perverse financial incentives." 
        ],
        subsections: [
          { id: "economic-security", heading: "Economic Security as Medical Necessity", bullets: ["Automatic benefit continuation during appeals (comparative Sweden model)", "Inflation-indexed compensation", "Delay reparations (e.g., $500/day after 90-day window)"] },
          { id: "ending-coercion", heading: "Regulatory Brutality Must End", bullets: ["Ban coercive RTW mandates (Germany model)", "Prosecute employer fraud in modified duty falsification"] },
          { id: "individual-interventions", heading: "Immediate Individual Interventions", bullets: ["Guaranteed healthcare & benefits during appeals", "Trauma-informed case management replacing adversarial posture"] },
          { id: "system-overhaul", heading: "Systemic Overhaul", bullets: ["Abolish experience rating", "Independent CPTSD metric oversight", "Remove statutory immunity for negligence"] }
        ]
      },
      {
        id: "conclusion",
        heading: "Conclusion",
        paragraphs: [
          "WSIB’s practices constitute patterned institutional violence aligning with CPTSD diagnostic frameworks—financial insecurity and epistemic invalidation weaponized to enforce compliance.",
          "Transformation requires dismantling harmful incentive scaffolds and rebuilding around trauma-informed, rights-centered design." 
        ]
      }
    ],
    references: [
      { id: "ref-carnall-2022", citation: "Carnall, L. A., et al. (2022). Psychosocial hazards, PTSD, CPTSD, depression, and anxiety in the U.K. rail industry. Journal of Traumatic Stress, 35(5), 1460–1471." },
      { id: "ref-cloitre-2020", citation: "Cloitre, M., et al. (2020). ICD-11 PTSD and CPTSD: Implications for treatment. European Journal of Psychotraumatology, 12(1)." },
      { id: "ref-gewurtz-2018", citation: "Gewurtz, R. E., et al. (2018). Experiences of workers who do not successfully return to work. Work, 61(4), 537–549." },
      { id: "ref-mcewen-2017", citation: "McEwen, B. S. (2017). Neurobiological and systemic effects of chronic stress. Chronic Stress, 1, 1–11." },
      { id: "ref-noel-2022", citation: "Noël, C., et al. (2022). Experiences of injured workers in the WSIB process. Health Promotion and Chronic Disease Prevention in Canada, 42(7), 272–284." },
      { id: "ref-orchard-2021", citation: "Orchard, C., et al. (2021). Case manager interactions and serious mental illness. Journal of Occupational Rehabilitation, 31, 895–902." },
      { id: "ref-maceachen-2020", citation: "MacEachen, E., et al. (2020). Quota dynamics in compensation claim management. (Study reference)." },
      { id: "ref-premji-2025", citation: "Premji, S., et al. (2025). Employer incentives and claim suppression. (Forthcoming)." },
      { id: "ref-edgelow-2023", citation: "Edgelow, M., et al. (2023). Socioeconomic trajectories after claim denial. (Study reference)." },
      { id: "ref-boden-galizzi-2014", citation: "Boden, L. I., & Galizzi, M. (2014). Economic consequences of workplace injury. (Study reference)." }
    ]
  },
];
