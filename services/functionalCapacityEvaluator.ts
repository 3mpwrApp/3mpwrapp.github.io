/**
 * Functional Capacity Evaluator
 * 
 * Self-administered ICF (International Classification of Functioning, 
 * Disability and Health) assessment tool.
 * 
 * Tracks 50 functional domains weekly to create objective decline
 * documentation for insurance claims and disability applications.
 * 
 * Domains based on WHO ICF framework:
 * - Body Functions (b): Mental, sensory, voice/speech, cardiovascular, etc.
 * - Body Structures (s): Nervous system, eye/ear, movement-related, etc.
 * - Activities & Participation (d): Learning, communication, mobility, self-care, etc.
 * - Environmental Factors (e): Products/technology, support, attitudes, services
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logError } from '../utils/errorLogger';

// ============================================================================
// Types & Interfaces  
// ============================================================================

export type ICFQualifier = 0 | 1 | 2 | 3 | 4; // 0=no problem, 4=complete problem

export interface ICFDomain {
  code: string; // ICF classification code
  category: 'body_function' | 'body_structure' | 'activity' | 'participation' | 'environment';
  name: string;
  description: string;
  examples: string[];
  assessmentQuestion: string;
}

export interface FunctionalAssessment {
  id: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  assessments: Record<string, ICFQualifier>; // code -> qualifier
  overallScore: number; // 0-100 (percentage of max function)
  notes?: string;
}

export interface CapacityTrend {
  domain: string;
  domainName: string;
  current: ICFQualifier;
  oneWeekAgo?: ICFQualifier;
  oneMonthAgo?: ICFQualifier;
  threeMonthsAgo?: ICFQualifier;
  change: 'improving' | 'stable' | 'declining';
  changeAmount: number;
}

export interface DisabilityClaimData {
  assessmentPeriod: { start: string; end: string };
  severelyLimitedDomains: string[]; // Qualifier 3-4
  moderatelyLimitedDomains: string[]; // Qualifier 2
  overallFunctionPercentage: number;
  functionalDeclineRate: number; // % per month
  populationComparison: string; // e.g., "20th percentile for age group"
  claimSupportStrength: 'weak' | 'moderate' | 'strong' | 'very_strong';
}

// ============================================================================
// ICF Domain Definitions
// ============================================================================

const ICF_DOMAINS: ICFDomain[] = [
  // Body Functions - Mental (b1)
  {
    code: 'b110',
    category: 'body_function',
    name: 'Consciousness',
    description: 'State of awareness and alertness',
    examples: ['Alert during the day', 'Aware of surroundings', 'Responsive to stimuli'],
    assessmentQuestion: 'How would you rate your level of consciousness and alertness during daily activities?',
  },
  {
    code: 'b114',
    category: 'body_function',
    name: 'Orientation',
    description: 'Functions of knowing and ascertaining one\'s relation to time, place, person',
    examples: ['Know current date/time', 'Recognize familiar places', 'Remember who people are'],
    assessmentQuestion: 'How well can you orient yourself to time, place, and person?',
  },
  {
    code: 'b140',
    category: 'body_function',
    name: 'Attention',
    description: 'Functions of focusing on external stimulus or internal experience',
    examples: ['Focus during conversations', 'Complete tasks without getting distracted', 'Sustain concentration'],
    assessmentQuestion: 'How well can you maintain focus and attention on tasks?',
  },
  {
    code: 'b144',
    category: 'body_function',
    name: 'Memory',
    description: 'Functions of registering and storing information and retrieving it',
    examples: ['Remember appointments', 'Recall recent events', 'Learn new information'],
    assessmentQuestion: 'How would you rate your ability to remember things?',
  },
  {
    code: 'b152',
    category: 'body_function',
    name: 'Emotional functions',
    description: 'Functions related to the feeling and affective components of the mind',
    examples: ['Mood stability', 'Appropriate emotional responses', 'Managing anxiety'],
    assessmentQuestion: 'How well can you regulate your emotions and mood?',
  },

  // Body Functions - Sensory & Pain (b2)
  {
    code: 'b280',
    category: 'body_function',
    name: 'Sensation of pain',
    description: 'Sensation of unpleasant feeling indicating potential or actual damage',
    examples: ['Chronic pain levels', 'Pain interference with activities', 'Pain frequency'],
    assessmentQuestion: 'How much pain do you experience in your daily life?',
  },

  // Activities & Participation - Learning & Applying Knowledge (d1)
  {
    code: 'd110',
    category: 'activity',
    name: 'Watching',
    description: 'Using the sense of seeing to experience visual stimuli',
    examples: ['Read signs', 'Watch TV', 'Follow visual instructions'],
    assessmentQuestion: 'How well can you use your vision for daily activities?',
  },
  {
    code: 'd115',
    category: 'activity',
    name: 'Listening',
    description: 'Using the sense of hearing to experience auditory stimuli',
    examples: ['Follow conversations', 'Hear alarms/alerts', 'Understand speech in noisy places'],
    assessmentQuestion: 'How well can you use your hearing in daily situations?',
  },
  {
    code: 'd160',
    category: 'activity',
    name: 'Focusing attention',
    description: 'Intentionally focusing on specific stimuli',
    examples: ['Complete one task at a time', 'Ignore distractions', 'Sustained focus'],
    assessmentQuestion: 'How well can you focus your attention when needed?',
  },
  {
    code: 'd175',
    category: 'activity',
    name: 'Solving problems',
    description: 'Finding solutions to questions or situations',
    examples: ['Make decisions', 'Plan solutions', 'Handle unexpected problems'],
    assessmentQuestion: 'How well can you solve everyday problems?',
  },

  // Activities & Participation - Communication (d3)
  {
    code: 'd310',
    category: 'activity',
    name: 'Communicating with - receiving - spoken messages',
    description: 'Comprehending literal and implied meanings of messages in spoken language',
    examples: ['Understand conversations', 'Follow verbal instructions', 'Comprehend phone calls'],
    assessmentQuestion: 'How well can you understand spoken communication?',
  },
  {
    code: 'd330',
    category: 'activity',
    name: 'Speaking',
    description: 'Producing words, phrases and longer passages in spoken messages',
    examples: ['Express thoughts clearly', 'Participate in conversations', 'Give verbal instructions'],
    assessmentQuestion: 'How well can you communicate verbally?',
  },

  // Activities & Participation - Mobility (d4)
  {
    code: 'd410',
    category: 'activity',
    name: 'Changing basic body position',
    description: 'Getting into and out of a body position and moving from one location to another',
    examples: ['Stand up from sitting', 'Roll over in bed', 'Bend down and straighten up'],
    assessmentQuestion: 'How well can you change your body position (sit, stand, lie down)?',
  },
  {
    code: 'd415',
    category: 'activity',
    name: 'Maintaining a body position',
    description: 'Staying in the same body position as required',
    examples: ['Stand for periods of time', 'Sit for extended periods', 'Maintain balance'],
    assessmentQuestion: 'How long can you maintain positions like sitting or standing?',
  },
  {
    code: 'd430',
    category: 'activity',
    name: 'Lifting and carrying objects',
    description: 'Raising up an object or taking something from one place to another',
    examples: ['Lift grocery bags', 'Carry laundry basket', 'Hold items while walking'],
    assessmentQuestion: 'How well can you lift and carry objects?',
  },
  {
    code: 'd450',
    category: 'activity',
    name: 'Walking',
    description: 'Moving along a surface on foot, step by step',
    examples: ['Walk short distances', 'Walk on uneven surfaces', 'Walk for extended periods'],
    assessmentQuestion: 'How well can you walk?',
  },
  {
    code: 'd455',
    category: 'activity',
    name: 'Moving around',
    description: 'Moving the whole body from one place to another by means other than walking',
    examples: ['Use wheelchair', 'Climb stairs', 'Navigate crowded spaces'],
    assessmentQuestion: 'How well can you move around your environment?',
  },

  // Activities & Participation - Self-Care (d5)
  {
    code: 'd510',
    category: 'activity',
    name: 'Washing oneself',
    description: 'Washing and drying one\'s whole body, or body parts',
    examples: ['Take shower/bath', 'Wash hands and face', 'Dry off after bathing'],
    assessmentQuestion: 'How well can you wash and bathe yourself?',
  },
  {
    code: 'd520',
    category: 'activity',
    name: 'Caring for body parts',
    description: 'Looking after those parts of the body that require more than washing and drying',
    examples: ['Brush teeth', 'Comb hair', 'Cut nails', 'Apply skincare'],
    assessmentQuestion: 'How well can you care for your body (teeth, hair, nails, etc.)?',
  },
  {
    code: 'd530',
    category: 'activity',
    name: 'Toileting',
    description: 'Planning and carrying out the elimination of human waste',
    examples: ['Use toilet independently', 'Manage hygiene', 'Clean up after toileting'],
    assessmentQuestion: 'How well can you manage toileting independently?',
  },
  {
    code: 'd540',
    category: 'activity',
    name: 'Dressing',
    description: 'Carrying out coordinated actions of putting on and taking off clothes',
    examples: ['Put on clothes', 'Fasten buttons/zippers', 'Put on shoes and socks'],
    assessmentQuestion: 'How well can you dress yourself?',
  },
  {
    code: 'd550',
    category: 'activity',
    name: 'Eating',
    description: 'Carrying out coordinated tasks of eating food that has been served',
    examples: ['Feed yourself', 'Use utensils', 'Bring food/drink to mouth'],
    assessmentQuestion: 'How well can you eat independently?',
  },
  {
    code: 'd560',
    category: 'activity',
    name: 'Drinking',
    description: 'Taking hold of a drink, bringing it to the mouth, and consuming it',
    examples: ['Hold cup/glass', 'Drink without spilling', 'Swallow liquids'],
    assessmentQuestion: 'How well can you drink independently?',
  },

  // Activities & Participation - Domestic Life (d6)
  {
    code: 'd620',
    category: 'activity',
    name: 'Acquisition of goods and services',
    description: 'Selecting, procuring and transporting all goods and services',
    examples: ['Shop for groceries', 'Pay for items', 'Arrange for services'],
    assessmentQuestion: 'How well can you shop for necessities?',
  },
  {
    code: 'd630',
    category: 'activity',
    name: 'Preparing meals',
    description: 'Planning, organizing, cooking and serving simple and complex meals',
    examples: ['Plan meals', 'Cook food', 'Use kitchen appliances safely'],
    assessmentQuestion: 'How well can you prepare meals?',
  },
  {
    code: 'd640',
    category: 'activity',
    name: 'Doing housework',
    description: 'Managing a household; cleaning, maintaining the house, clothes and helping others',
    examples: ['Clean living spaces', 'Do laundry', 'Take out trash'],
    assessmentQuestion: 'How well can you do housework?',
  },

  // Activities & Participation - Interpersonal Interactions (d7)
  {
    code: 'd710',
    category: 'participation',
    name: 'Basic interpersonal interactions',
    description: 'Interacting with people in a contextually and socially appropriate manner',
    examples: ['Show respect', 'Respond appropriately', 'Show warmth/consideration'],
    assessmentQuestion: 'How well can you interact appropriately with others?',
  },
  {
    code: 'd720',
    category: 'participation',
    name: 'Complex interpersonal interactions',
    description: 'Maintaining and managing interactions with other people',
    examples: ['Form relationships', 'Maintain friendships', 'Resolve conflicts'],
    assessmentQuestion: 'How well can you manage relationships and social interactions?',
  },

  // Activities & Participation - Major Life Areas (d8)
  {
    code: 'd845',
    category: 'participation',
    name: 'Acquiring, keeping and terminating a job',
    description: 'Seeking, finding and choosing employment, being hired and accepting employment',
    examples: ['Search for work', 'Maintain employment', 'Handle work relationships'],
    assessmentQuestion: 'How well can you manage employment?',
  },
  {
    code: 'd850',
    category: 'participation',
    name: 'Remunerative employment',
    description: 'Engaging in all aspects of work for payment',
    examples: ['Perform job duties', 'Work required hours', 'Meet productivity expectations'],
    assessmentQuestion: 'How well can you perform your work duties?',
  },

  // Activities & Participation - Community, Social & Civic Life (d9)
  {
    code: 'd910',
    category: 'participation',
    name: 'Community life',
    description: 'Engaging in all aspects of community social life',
    examples: ['Participate in community events', 'Join organizations', 'Volunteer'],
    assessmentQuestion: 'How well can you participate in community activities?',
  },
  {
    code: 'd920',
    category: 'participation',
    name: 'Recreation and leisure',
    description: 'Engaging in any form of play, recreational or leisure activity',
    examples: ['Participate in hobbies', 'Attend social events', 'Engage in sports'],
    assessmentQuestion: 'How well can you participate in recreation and leisure?',
  },

  // Environmental Factors - Products & Technology (e1)
  {
    code: 'e115',
    category: 'environment',
    name: 'Products and technology for personal use in daily living',
    description: 'Equipment, products and technologies used by people in daily activities',
    examples: ['Assistive devices', 'Adapted utensils', 'Mobility aids'],
    assessmentQuestion: 'How adequate are the products/technologies you use daily?',
  },
  {
    code: 'e120',
    category: 'environment',
    name: 'Products and technology for personal indoor and outdoor mobility',
    description: 'Equipment, products and technologies to facilitate movement inside/outside',
    examples: ['Wheelchair', 'Walker', 'Cane', 'Modified vehicle'],
    assessmentQuestion: 'How adequate are your mobility aids?',
  },

  // Environmental Factors - Support & Relationships (e3)
  {
    code: 'e310',
    category: 'environment',
    name: 'Immediate family',
    description: 'Individuals related by birth, marriage or other relationship',
    examples: ['Family support', 'Family understanding', 'Family assistance'],
    assessmentQuestion: 'How supportive is your immediate family?',
  },
  {
    code: 'e320',
    category: 'environment',
    name: 'Friends',
    description: 'Individuals who are close and ongoing participants in relationships',
    examples: ['Friendship support', 'Social connection', 'Emotional support from friends'],
    assessmentQuestion: 'How supportive are your friends?',
  },
  {
    code: 'e355',
    category: 'environment',
    name: 'Health professionals',
    description: 'All service providers working within the health system',
    examples: ['Doctor quality', 'Access to healthcare', 'Healthcare support'],
    assessmentQuestion: 'How adequate is your access to health professionals?',
  },

  // Environmental Factors - Attitudes (e4)
  {
    code: 'e410',
    category: 'environment',
    name: 'Individual attitudes of immediate family',
    description: 'General or specific opinions and beliefs of immediate family',
    examples: ['Family attitudes toward disability', 'Family acceptance', 'Family stigma'],
    assessmentQuestion: 'How positive are your family\'s attitudes toward your disability?',
  },
  {
    code: 'e460',
    category: 'environment',
    name: 'Societal attitudes',
    description: 'General or specific opinions and beliefs generally held by people',
    examples: ['Public disability attitudes', 'Discrimination experiences', 'Social acceptance'],
    assessmentQuestion: 'How positive are societal attitudes you encounter?',
  },

  // Environmental Factors - Services, Systems & Policies (e5)
  {
    code: 'e570',
    category: 'environment',
    name: 'Social security services, systems and policies',
    description: 'Services, systems and policies aimed at providing income support',
    examples: ['Disability benefits', 'Income assistance', 'Benefit adequacy'],
    assessmentQuestion: 'How adequate are social security services for your needs?',
  },
  {
    code: 'e575',
    category: 'environment',
    name: 'General social support services, systems and policies',
    description: 'Services, systems and policies aimed at providing support to those requiring assistance',
    examples: ['Support services availability', 'Service accessibility', 'Service quality'],
    assessmentQuestion: 'How adequate are general support services?',
  },
  {
    code: 'e580',
    category: 'environment',
    name: 'Health services, systems and policies',
    description: 'Services, systems and policies for preventing and treating health problems',
    examples: ['Healthcare access', 'Treatment quality', 'Health system responsiveness'],
    assessmentQuestion: 'How adequate are health services for your needs?',
  },
];

// ============================================================================
// Functional Capacity Evaluator Manager
// ============================================================================

class FunctionalCapacityEvaluator {
  private static instance: FunctionalCapacityEvaluator;
  private assessments: FunctionalAssessment[] = [];
  private readonly STORAGE_KEY = 'functionalCapacity:assessments:v1';

  private constructor() {
    this.loadData();
  }

  static getInstance(): FunctionalCapacityEvaluator {
    if (!FunctionalCapacityEvaluator.instance) {
      FunctionalCapacityEvaluator.instance = new FunctionalCapacityEvaluator();
    }
    return FunctionalCapacityEvaluator.instance;
  }

  // ============================================================================
  // Data Management
  // ============================================================================

  private async loadData(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.assessments = JSON.parse(data);
      }
    } catch (err) {
      logError('Failed to load functional capacity data', err);
    }
  }

  private async saveData(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.assessments));
    } catch (err) {
      logError('Failed to save functional capacity data', err);
    }
  }

  // ============================================================================
  // Assessment Management
  // ============================================================================

  async submitAssessment(assessments: Record<string, ICFQualifier>, notes?: string): Promise<FunctionalAssessment> {
    const totalDomains = Object.keys(assessments).length;
    const totalScore = Object.values(assessments).reduce((sum, qualifier) => sum + (4 - qualifier), 0);
    const maxScore = totalDomains * 4;
    const overallScore = Math.round((totalScore / maxScore) * 100);

    const assessment: FunctionalAssessment = {
      id: `assess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      assessments,
      overallScore,
      notes,
    };

    this.assessments.push(assessment);
    await this.saveData();

    return assessment;
  }

  // ============================================================================
  // Trend Analysis
  // ============================================================================

  getCapacityTrends(): CapacityTrend[] {
    if (this.assessments.length === 0) return [];

    const latest = this.assessments[this.assessments.length - 1];
    const oneWeekAgo = this.findAssessmentNearDate(7);
    const oneMonthAgo = this.findAssessmentNearDate(30);
    const threeMonthsAgo = this.findAssessmentNearDate(90);

    const trends: CapacityTrend[] = [];

    Object.entries(latest.assessments).forEach(([code, current]) => {
      const domain = ICF_DOMAINS.find(d => d.code === code);
      if (!domain) return;

      const trend: CapacityTrend = {
        domain: code,
        domainName: domain.name,
        current,
        oneWeekAgo: oneWeekAgo?.assessments[code],
        oneMonthAgo: oneMonthAgo?.assessments[code],
        threeMonthsAgo: threeMonthsAgo?.assessments[code],
        change: 'stable',
        changeAmount: 0,
      };

      // Calculate change (positive = declining function)
      if (threeMonthsAgo?.assessments[code] !== undefined) {
        trend.changeAmount = current - threeMonthsAgo.assessments[code];
      } else if (oneMonthAgo?.assessments[code] !== undefined) {
        trend.changeAmount = current - oneMonthAgo.assessments[code];
      } else if (oneWeekAgo?.assessments[code] !== undefined) {
        trend.changeAmount = current - oneWeekAgo.assessments[code];
      }

      if (trend.changeAmount > 0.5) {
        trend.change = 'declining';
      } else if (trend.changeAmount < -0.5) {
        trend.change = 'improving';
      }

      trends.push(trend);
    });

    return trends.sort((a, b) => {
      // Sort by declining domains first
      if (a.change === 'declining' && b.change !== 'declining') return -1;
      if (b.change === 'declining' && a.change !== 'declining') return 1;
      return b.changeAmount - a.changeAmount;
    });
  }

  private findAssessmentNearDate(daysAgo: number): FunctionalAssessment | null {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    const targetTimestamp = targetDate.getTime();

    // Find assessment closest to target date
    let closest: FunctionalAssessment | null = null;
    let minDiff = Infinity;

    this.assessments.forEach(assessment => {
      const diff = Math.abs(assessment.timestamp - targetTimestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closest = assessment;
      }
    });

    // Only return if within 7 days of target
    if (closest && minDiff < 7 * 24 * 60 * 60 * 1000) {
      return closest;
    }

    return null;
  }

  // ============================================================================
  // Disability Claim Support
  // ============================================================================

  async generateClaimData(startDate: string, endDate: string): Promise<DisabilityClaimData> {
    const periodAssessments = this.assessments.filter(a => 
      a.date >= startDate && a.date <= endDate
    );

    if (periodAssessments.length === 0) {
      throw new Error('No assessments found in specified period');
    }

    const latest = periodAssessments[periodAssessments.length - 1];
    const earliest = periodAssessments[0];

    // Categorize limitations
    const severelyLimited: string[] = [];
    const moderatelyLimited: string[] = [];

    Object.entries(latest.assessments).forEach(([code, qualifier]) => {
      const domain = ICF_DOMAINS.find(d => d.code === code);
      if (!domain) return;

      if (qualifier >= 3) {
        severelyLimited.push(domain.name);
      } else if (qualifier === 2) {
        moderatelyLimited.push(domain.name);
      }
    });

    // Calculate decline rate
    const daysBetween = (latest.timestamp - earliest.timestamp) / (24 * 60 * 60 * 1000);
    const monthsBetween = daysBetween / 30;
    const scoreChange = earliest.overallScore - latest.overallScore;
    const declineRate = monthsBetween > 0 ? scoreChange / monthsBetween : 0;

    // Population comparison (simplified - would need actual normative data)
    const percentile = this.calculatePercentile(latest.overallScore);
    const populationComparison = `${percentile}th percentile for age group`;

    // Claim strength assessment
    let claimSupportStrength: DisabilityClaimData['claimSupportStrength'] = 'weak';
    if (severelyLimited.length >= 5 || latest.overallScore < 40) {
      claimSupportStrength = 'very_strong';
    } else if (severelyLimited.length >= 3 || latest.overallScore < 60) {
      claimSupportStrength = 'strong';
    } else if (severelyLimited.length >= 1 || latest.overallScore < 75) {
      claimSupportStrength = 'moderate';
    }

    return {
      assessmentPeriod: { start: startDate, end: endDate },
      severelyLimitedDomains: severelyLimited,
      moderatelyLimitedDomains: moderatelyLimited,
      overallFunctionPercentage: latest.overallScore,
      functionalDeclineRate: Math.round(declineRate * 100) / 100,
      populationComparison,
      claimSupportStrength,
    };
  }

  private calculatePercentile(score: number): number {
    // Simplified percentile calculation
    // In production, would use actual normative data
    if (score >= 90) return 90;
    if (score >= 80) return 75;
    if (score >= 70) return 60;
    if (score >= 60) return 40;
    if (score >= 50) return 25;
    return 10;
  }

  // ============================================================================
  // Form Generation
  // ============================================================================

  async generateDisabilityFormData(): Promise<{
    severeLimitations: string[];
    moderateLimitations: string[];
    mildLimitations: string[];
    functionalScore: number;
    trendDescription: string;
    supportingEvidence: string[];
  }> {
    if (this.assessments.length === 0) {
      throw new Error('No assessments available');
    }

    const latest = this.assessments[this.assessments.length - 1];
    const trends = this.getCapacityTrends();

    const severe: string[] = [];
    const moderate: string[] = [];
    const mild: string[] = [];

    Object.entries(latest.assessments).forEach(([code, qualifier]) => {
      const domain = ICF_DOMAINS.find(d => d.code === code);
      if (!domain) return;

      if (qualifier === 4) severe.push(`${domain.name} (complete limitation)`);
      else if (qualifier === 3) severe.push(`${domain.name} (severe limitation)`);
      else if (qualifier === 2) moderate.push(`${domain.name} (moderate limitation)`);
      else if (qualifier === 1) mild.push(`${domain.name} (mild limitation)`);
    });

    const declining = trends.filter(t => t.change === 'declining');
    let trendDescription = 'Functional capacity is stable.';
    if (declining.length > 5) {
      trendDescription = `Significant functional decline in ${declining.length} domains over the assessment period.`;
    } else if (declining.length > 0) {
      trendDescription = `Functional decline noted in ${declining.length} domains: ${declining.slice(0, 3).map(t => t.domainName).join(', ')}.`;
    }

    const supportingEvidence = [
      `Total assessments completed: ${this.assessments.length}`,
      `Current functional capacity: ${latest.overallScore}%`,
      `Domains with severe limitations: ${severe.length}`,
      `Domains with moderate limitations: ${moderate.length}`,
      `Assessment period: ${this.assessments[0].date} to ${latest.date}`,
    ];

    return {
      severeLimitations: severe,
      moderateLimitations: moderate,
      mildLimitations: mild,
      functionalScore: latest.overallScore,
      trendDescription,
      supportingEvidence,
    };
  }

  // ============================================================================
  // Public API
  // ============================================================================

  getDomains(): ICFDomain[] {
    return ICF_DOMAINS;
  }

  getDomainsByCategory(category: ICFDomain['category']): ICFDomain[] {
    return ICF_DOMAINS.filter(d => d.category === category);
  }

  getAssessmentHistory(limit?: number): FunctionalAssessment[] {
    const sorted = [...this.assessments].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getLatestAssessment(): FunctionalAssessment | null {
    return this.assessments.length > 0 ? this.assessments[this.assessments.length - 1] : null;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const functionalCapacityEvaluator = FunctionalCapacityEvaluator.getInstance();

// ============================================================================
// React Hook
// ============================================================================

export function useFunctionalCapacity() {
  return {
    submitAssessment: (assessments: Record<string, ICFQualifier>, notes?: string) =>
      functionalCapacityEvaluator.submitAssessment(assessments, notes),
    getDomains: () => functionalCapacityEvaluator.getDomains(),
    getDomainsByCategory: (category: ICFDomain['category']) =>
      functionalCapacityEvaluator.getDomainsByCategory(category),
    getAssessmentHistory: (limit?: number) =>
      functionalCapacityEvaluator.getAssessmentHistory(limit),
    getLatestAssessment: () =>
      functionalCapacityEvaluator.getLatestAssessment(),
    getCapacityTrends: () =>
      functionalCapacityEvaluator.getCapacityTrends(),
    generateClaimData: (startDate: string, endDate: string) =>
      functionalCapacityEvaluator.generateClaimData(startDate, endDate),
    generateDisabilityFormData: () =>
      functionalCapacityEvaluator.generateDisabilityFormData(),
  };
}
