/**
 * Consolidation Redirects Configuration
 * Maps legacy screen routes to new PowerTool destinations
 */

export interface RedirectMapping {
  source: string;
  target: string;
  tab?: string;
  description: string;
}

export const REDIRECT_MAPPINGS: RedirectMapping[] = [
  // Evidence Screens → Evidence Command Center
  {
    source: '/resources/evidence-locker',
    target: '/resources/evidence-command-center',
    tab: 'locker',
    description: 'Legacy evidence locker to Evidence Command Center',
  },
  {
    source: '/resources/evidence-queue',
    target: '/resources/evidence-command-center',
    tab: 'locker',
    description: 'Legacy evidence queue to Evidence Command Center',
  },
  {
    source: '/advocacy/evidence-manager',
    target: '/resources/evidence-command-center',
    description: 'Legacy evidence manager to Evidence Command Center',
  },
  {
    source: '/advocacy/evidence-vault',
    target: '/resources/evidence-command-center',
    tab: 'locker',
    description: 'Legacy evidence vault to Evidence Command Center',
  },

  // Document/Letter Screens → Document Factory
  {
    source: '/resources/letter-wizard',
    target: '/resources/document-factory',
    tab: 'letters',
    description: 'Legacy letter wizard to Document Factory',
  },
  {
    source: '/resources/letter-factory',
    target: '/resources/document-factory',
    tab: 'letters',
    description: 'Legacy letter factory to Document Factory',
  },
  {
    source: '/resources/letters',
    target: '/resources/document-factory',
    tab: 'letters',
    description: 'Legacy letters to Document Factory',
  },
  {
    source: '/resources/templates-gallery',
    target: '/resources/document-factory',
    tab: 'templates',
    description: 'Legacy templates gallery to Document Factory',
  },
  {
    source: '/resources/accommodation-request',
    target: '/resources/document-factory',
    tab: 'accommodation',
    description: 'Legacy accommodation request to Document Factory',
  },
  {
    source: '/resources/prepare-appeal',
    target: '/resources/document-factory',
    tab: 'appeals',
    description: 'Legacy prepare appeal to Document Factory',
  },
  {
    source: '/resources/appeal-coach',
    target: '/resources/document-factory',
    tab: 'appeals',
    description: 'Legacy appeal coach to Document Factory',
  },

  // Case Tracking Screens → Case Tracker Pro
  {
    source: '/resources/deadlines',
    target: '/resources/case-tracker-pro',
    tab: 'deadlines',
    description: 'Legacy deadlines to Case Tracker Pro',
  },
  {
    source: '/resources/deadlines-list',
    target: '/resources/case-tracker-pro',
    tab: 'deadlines',
    description: 'Legacy deadlines list to Case Tracker Pro',
  },
  {
    source: '/resources/case-timeline',
    target: '/resources/case-tracker-pro',
    tab: 'master',
    description: 'Legacy case timeline to Case Tracker Pro',
  },
  {
    source: '/resources/master-tracker-hub',
    target: '/resources/case-tracker-pro',
    tab: 'master',
    description: 'Legacy master tracker hub to Case Tracker Pro',
  },
  {
    source: '/resources/denial-decoder',
    target: '/resources/case-tracker-pro',
    tab: 'denial',
    description: 'Legacy denial decoder to Case Tracker Pro',
  },
  {
    source: '/resources/claims-navigator',
    target: '/resources/case-tracker-pro',
    tab: 'claims',
    description: 'Legacy claims navigator to Case Tracker Pro',
  },
  {
    source: '/resources/rtw-planner',
    target: '/resources/case-tracker-pro',
    tab: 'rtw',
    description: 'Legacy RTW planner to Case Tracker Pro',
  },

  // Health Tracking Screens → Unified Health Hub
  {
    source: '/wellness/health-tracker',
    target: '/wellness/health-tracker-pro',
    description: 'Legacy health tracker to Unified Health Hub',
  },
  {
    source: '/wellness/health-management-hub',
    target: '/wellness/health-tracker-pro',
    description: 'Legacy health management hub to Unified Health Hub',
  },
  {
    source: '/wellness/symptom-tracker',
    target: '/wellness/health-tracker-pro',
    tab: 'symptoms',
    description: 'Legacy symptom tracker to Unified Health Hub',
  },
  {
    source: '/wellness/medications',
    target: '/wellness/health-tracker-pro',
    tab: 'meds',
    description: 'Legacy medications to Unified Health Hub',
  },
  {
    source: '/wellness/meds-tracker',
    target: '/wellness/health-tracker-pro',
    tab: 'meds',
    description: 'Legacy meds tracker to Unified Health Hub',
  },
  {
    source: '/wellness/doctor-visit-prep',
    target: '/wellness/health-tracker-pro',
    tab: 'doctor',
    description: 'Legacy doctor visit prep to Unified Health Hub',
  },
  {
    source: '/wellness/cognitive-scanner',
    target: '/wellness/health-tracker-pro',
    tab: 'body',
    description: 'Legacy cognitive scanner to Unified Health Hub',
  },
  {
    source: '/wellness/functional-capacity',
    target: '/wellness/health-tracker-pro',
    tab: 'body',
    description: 'Legacy functional capacity to Unified Health Hub',
  },
  {
    source: '/wellness/environmental-adaptation',
    target: '/wellness/health-tracker-pro',
    tab: 'environment',
    description: 'Legacy environmental adaptation to Unified Health Hub',
  },
  {
    source: '/wellness/trigger-detector',
    target: '/wellness/health-tracker-pro',
    tab: 'symptoms',
    description: 'Legacy trigger detector to Unified Health Hub',
  },

  // Energy Management Screens → Energy Command Center
  {
    source: '/wellness/spoon-economist',
    target: '/wellness/energy-command-center',
    tab: 'dashboard',
    description: 'Legacy spoon economist to Energy Command Center',
  },
  {
    source: '/wellness/spoon-marketplace',
    target: '/wellness/energy-command-center',
    tab: 'pacing',
    description: 'Legacy spoon marketplace to Energy Command Center',
  },
  {
    source: '/wellness/energy-mood-dashboard',
    target: '/wellness/energy-command-center',
    tab: 'mood',
    description: 'Legacy energy mood dashboard to Energy Command Center',
  },
  {
    source: '/wellness/pacing-partner',
    target: '/wellness/energy-command-center',
    tab: 'pacing',
    description: 'Legacy pacing partner to Energy Command Center',
  },
  {
    source: '/wellness/pain-forecast',
    target: '/wellness/energy-command-center',
    tab: 'forecast',
    description: 'Legacy pain forecast to Energy Command Center',
  },
  {
    source: '/wellness/symptom-symphony',
    target: '/wellness/energy-command-center',
    tab: 'dashboard',
    description: 'Legacy symptom symphony to Energy Command Center',
  },
  {
    source: '/wellness/sleep-energy-tracker',
    target: '/wellness/energy-command-center',
    tab: 'sleep',
    description: 'Legacy sleep energy tracker to Energy Command Center',
  },

  // Mental Health Screens → Mental Wellness Toolkit
  {
    source: '/wellness/cbt-coach',
    target: '/wellness/mental-wellness-toolkit',
    tab: 'cbt',
    description: 'Legacy CBT coach to Mental Wellness Toolkit',
  },
  {
    source: '/wellness/dbt',
    target: '/wellness/mental-wellness-toolkit',
    tab: 'dbt',
    description: 'Legacy DBT to Mental Wellness Toolkit',
  },
  {
    source: '/wellness/opposite-action',
    target: '/wellness/mental-wellness-toolkit',
    tab: 'opposite',
    description: 'Legacy opposite action to Mental Wellness Toolkit',
  },
  {
    source: '/wellness/radical-acceptance',
    target: '/wellness/mental-wellness-toolkit',
    tab: 'acceptance',
    description: 'Legacy radical acceptance to Mental Wellness Toolkit',
  },
  {
    source: '/wellness/acceptance-function',
    target: '/wellness/mental-wellness-toolkit',
    tab: 'function',
    description: 'Legacy acceptance function to Mental Wellness Toolkit',
  },
  {
    source: '/wellness/distress-tolerance',
    target: '/wellness/mental-wellness-toolkit',
    tab: 'distress',
    description: 'Legacy distress tolerance to Mental Wellness Toolkit',
  },
  {
    source: '/wellness/belief-meter',
    target: '/wellness/mental-wellness-toolkit',
    tab: 'beliefs',
    description: 'Legacy belief meter to Mental Wellness Toolkit',
  },
  {
    source: '/wellness/ai-grounding',
    target: '/wellness/mental-wellness-toolkit',
    tab: 'grounding',
    description: 'Legacy AI grounding to Mental Wellness Toolkit',
  },
];

/**
 * Get redirect target for a given source path
 */
export function getRedirectTarget(sourcePath: string): RedirectMapping | undefined {
  return REDIRECT_MAPPINGS.find((mapping) => mapping.source === sourcePath);
}

/**
 * Build full redirect URL with optional tab parameter
 */
export function buildRedirectUrl(mapping: RedirectMapping): string {
  const baseUrl = mapping.target;
  return mapping.tab ? `${baseUrl}?tab=${mapping.tab}` : baseUrl;
}
