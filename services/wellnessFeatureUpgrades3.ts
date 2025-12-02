/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Advanced Wellness Feature Upgrades - Part 3
 * 
 * Revolutionary AI-powered enhancements for remaining wellness features:
 * Grief & Identity Support, Resilience Points, Wellness Reminders,
 * Reflections Calendar, Dream Tracker, Adaptive Daily Planner
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// 10. GRIEF & IDENTITY SUPPORT - Metamorphosis Navigator
// ============================================================================

export interface IdentityJourney {
  id: string;
  phases: {
    name: string;
    description: string;
    currentProgress: number;
    challenges: string[];
    insights: string[];
    supportNeeded: string[];
    resourcesUsed: string[];
  }[];
  currentPhase: number;
  lossesProcessing: {
    type: 'identity' | 'relationship' | 'ability' | 'role' | 'dream' | 'health';
    description: string;
    stage: 'denial' | 'anger' | 'bargaining' | 'depression' | 'acceptance' | 'integration';
    intensity: number;
    copingStrategies: string[];
  }[];
  emergingIdentity: {
    strengths: string[];
    values: string[];
    newNarratives: string[];
    hopefulVisions: string[];
  };
  supportNetwork: {
    person: string;
    type: 'peer' | 'professional' | 'family' | 'online';
    helpsWith: string[];
  }[];
}

export interface GriefWave {
  id: string;
  timestamp: number;
  intensity: number;
  triggers: string[];
  emotions: string[];
  physicalSymptoms: string[];
  duration: number;
  whatHelped: string[];
  insights: string;
}

export interface IdentityReframe {
  oldBelief: string;
  challenge: string;
  newPerspective: string;
  evidence: string[];
  affirmation: string;
  practiceExercises: string[];
}

export class GriefIdentitySupportAdvancedService {
  private currentJourney: IdentityJourney | null = null;
  private griefWaves: GriefWave[] = [];

  async mapIdentityJourney(
    losses: { type: string; description: string; timeAgo: string }[],
    currentChallenges: string[],
    strengths: string[],
    values: string[],
    supportPeople: string[]
  ): Promise<IdentityJourney> {
    // Map losses to processing stages
    const lossesProcessing = losses.map(loss => ({
      type: loss.type as IdentityJourney['lossesProcessing'][0]['type'],
      description: loss.description,
      stage: this.estimateGriefStage(loss.timeAgo, currentChallenges) as IdentityJourney['lossesProcessing'][0]['stage'],
      intensity: this.calculateIntensity(loss.timeAgo),
      copingStrategies: this.suggestCopingStrategies(loss.type),
    }));

    // Define journey phases
    const phases = [
      {
        name: 'Acknowledgment',
        description: 'Recognizing and honoring what has changed',
        currentProgress: this.calculatePhaseProgress(lossesProcessing, 'acknowledgment'),
        challenges: ['Accepting reality', 'Allowing feelings'],
        insights: [],
        supportNeeded: ['Safe space to grieve', 'Validation'],
        resourcesUsed: [],
      },
      {
        name: 'Processing',
        description: 'Working through emotions and meanings',
        currentProgress: this.calculatePhaseProgress(lossesProcessing, 'processing'),
        challenges: ['Managing waves of grief', 'Finding meaning'],
        insights: [],
        supportNeeded: ['Regular check-ins', 'Professional support if needed'],
        resourcesUsed: [],
      },
      {
        name: 'Redefining',
        description: 'Discovering who you are now',
        currentProgress: this.calculatePhaseProgress(lossesProcessing, 'redefining'),
        challenges: ['Letting go of old identity', 'Embracing uncertainty'],
        insights: [],
        supportNeeded: ['Encouragement', 'Role models'],
        resourcesUsed: [],
      },
      {
        name: 'Integration',
        description: 'Weaving past and present into a new whole',
        currentProgress: this.calculatePhaseProgress(lossesProcessing, 'integration'),
        challenges: ['Carrying both grief and joy', 'Building new life'],
        insights: [],
        supportNeeded: ['Celebration of progress', 'Community'],
        resourcesUsed: [],
      },
    ];

    // Determine current phase
    const currentPhase = phases.findIndex(p => p.currentProgress < 80);

    // Build emerging identity
    const emergingIdentity = {
      strengths,
      values,
      newNarratives: this.generateNewNarratives(strengths, values),
      hopefulVisions: this.generateHopefulVisions(values),
    };

    // Map support network
    const supportNetwork = supportPeople.map(person => ({
      person,
      type: 'family' as const,
      helpsWith: ['Emotional support', 'Practical help'],
    }));

    this.currentJourney = {
      id: `journey-${Date.now()}`,
      phases,
      currentPhase: currentPhase === -1 ? phases.length - 1 : currentPhase,
      lossesProcessing,
      emergingIdentity,
      supportNetwork,
    };

    return this.currentJourney;
  }

  private estimateGriefStage(timeAgo: string, challenges: string[]): string {
    const isRecent = timeAgo.includes('week') || timeAgo.includes('month');
    const hasAngerChallenges = challenges.some(c => 
      c.toLowerCase().includes('angry') || c.toLowerCase().includes('unfair')
    );
    const hasAcceptance = challenges.some(c => 
      c.toLowerCase().includes('accept') || c.toLowerCase().includes('peace')
    );

    if (hasAcceptance) return 'acceptance';
    if (hasAngerChallenges) return 'anger';
    if (isRecent) return 'denial';
    return 'bargaining';
  }

  private calculateIntensity(timeAgo: string): number {
    if (timeAgo.includes('day') || timeAgo.includes('week')) return 90;
    if (timeAgo.includes('month')) return 70;
    if (timeAgo.includes('year')) {
      const years = parseInt(timeAgo) || 1;
      return Math.max(20, 60 - years * 10);
    }
    return 50;
  }

  private suggestCopingStrategies(lossType: string): string[] {
    const strategies: Record<string, string[]> = {
      identity: [
        'Identity journaling',
        'Values clarification',
        'Trying new activities',
        'Self-compassion practices',
      ],
      relationship: [
        'Memory honoring rituals',
        'Grief support groups',
        'Writing letters',
        'Creating memory items',
      ],
      ability: [
        'Grief for former self',
        'Adaptation exploration',
        'New skill development',
        'Community connection',
      ],
      role: [
        'Exploring new roles',
        'Purpose discovery',
        'Volunteering',
        'Mentoring',
      ],
      dream: [
        'Dream reformulation',
        'Value-aligned goal setting',
        'Finding alternative paths',
        'Celebrating what is possible',
      ],
      health: [
        'Condition acceptance work',
        'New normal building',
        'Peer support',
        'Advocacy engagement',
      ],
    };

    return strategies[lossType] || strategies.identity;
  }

  private calculatePhaseProgress(
    losses: IdentityJourney['lossesProcessing'],
    phase: string
  ): number {
    const stageOrder = ['denial', 'anger', 'bargaining', 'depression', 'acceptance', 'integration'];
    const phaseThresholds: Record<string, number[]> = {
      acknowledgment: [0, 2],
      processing: [2, 4],
      redefining: [4, 5],
      integration: [5, 6],
    };

    const threshold = phaseThresholds[phase] || [0, 6];
    const averageStageIndex = losses.reduce((sum, loss) => {
      return sum + stageOrder.indexOf(loss.stage);
    }, 0) / Math.max(1, losses.length);

    if (averageStageIndex >= threshold[1]) return 100;
    if (averageStageIndex <= threshold[0]) return 0;
    
    return Math.round(((averageStageIndex - threshold[0]) / (threshold[1] - threshold[0])) * 100);
  }

  private generateNewNarratives(strengths: string[], values: string[]): string[] {
    const narratives: string[] = [];

    if (strengths.includes('resilience') || strengths.includes('perseverance')) {
      narratives.push('I have survived difficult things and can continue to grow');
    }
    if (values.includes('connection') || values.includes('love')) {
      narratives.push('My capacity for love remains even as circumstances change');
    }
    if (values.includes('growth') || values.includes('learning')) {
      narratives.push('Every experience, even painful ones, offers lessons');
    }

    narratives.push('Who I am is more than what I can do');
    narratives.push('My worth is inherent, not conditional');

    return narratives;
  }

  private generateHopefulVisions(values: string[]): string[] {
    const visions: string[] = [];

    if (values.includes('connection')) {
      visions.push('Meaningful relationships that accept all of who I am');
    }
    if (values.includes('purpose')) {
      visions.push('Contributing to something larger than myself');
    }
    if (values.includes('peace')) {
      visions.push('Inner calm that persists through external challenges');
    }
    if (values.includes('joy')) {
      visions.push('Moments of genuine happiness in my new reality');
    }

    visions.push('Self-acceptance and self-compassion');
    visions.push('A life aligned with my true values');

    return visions;
  }

  async recordGriefWave(
    intensity: number,
    triggers: string[],
    emotions: string[],
    physicalSymptoms: string[],
    whatHelped: string[],
    insights: string
  ): Promise<GriefWave> {
    const wave: GriefWave = {
      id: `wave-${Date.now()}`,
      timestamp: Date.now(),
      intensity,
      triggers,
      emotions,
      physicalSymptoms,
      duration: 0, // Will be updated when wave passes
      whatHelped,
      insights,
    };

    this.griefWaves.push(wave);
    return wave;
  }

  async generateIdentityReframe(
    oldBelief: string,
    context: string
  ): Promise<IdentityReframe> {
    // Common old beliefs and their reframes
    const reframes: Record<string, Partial<IdentityReframe>> = {
      'worthless': {
        challenge: 'Your worth is not determined by ability or productivity',
        newPerspective: 'I have inherent value as a human being',
        evidence: [
          'People who love me value me for who I am',
          'I contribute to others\' lives in meaningful ways',
          'My experiences and perspective are unique and valuable',
        ],
        affirmation: 'I am worthy of love and belonging exactly as I am',
      },
      'burden': {
        challenge: 'Everyone needs help sometimes - that\'s human interdependence',
        newPerspective: 'Accepting help allows others to express care',
        evidence: [
          'I have helped others when I could',
          'People offer help because they want to',
          'Relationships are built on mutual support',
        ],
        affirmation: 'I am not a burden - I am a person deserving of support',
      },
      'broken': {
        challenge: 'You are not broken - you are adapting to difficult circumstances',
        newPerspective: 'I am a whole person navigating challenges',
        evidence: [
          'I continue to grow and learn',
          'My challenges don\'t define my entirety',
          'Struggle is part of the human experience',
        ],
        affirmation: 'I am whole and complete, even with imperfections',
      },
    };

    // Find matching reframe or generate generic one
    const matchKey = Object.keys(reframes).find(key => 
      oldBelief.toLowerCase().includes(key)
    );

    const template = matchKey ? reframes[matchKey] : {
      challenge: 'This belief may not reflect the full truth of who you are',
      newPerspective: 'I can hold a more balanced view of myself',
      evidence: ['I have qualities I value', 'Others see good in me', 'I am more than this one belief'],
      affirmation: 'I choose to see myself with compassion and accuracy',
    };

    return {
      oldBelief,
      challenge: template.challenge || '',
      newPerspective: template.newPerspective || '',
      evidence: template.evidence || [],
      affirmation: template.affirmation || '',
      practiceExercises: [
        'Write this new perspective daily for a week',
        'Find 3 examples that support the new belief',
        'Share this reframe with someone you trust',
        'Notice when the old belief arises and gently redirect',
      ],
    };
  }
}

// ============================================================================
// 11. RESILIENCE POINTS - Achievement Alchemy Engine
// ============================================================================

export interface ResilienceProfile {
  totalPoints: number;
  level: number;
  levelProgress: number;
  streaks: {
    type: string;
    currentCount: number;
    bestCount: number;
    lastActivity: number;
  }[];
  achievements: {
    id: string;
    name: string;
    description: string;
    unlockedAt: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    category: string;
  }[];
  challenges: {
    id: string;
    name: string;
    description: string;
    progress: number;
    goal: number;
    reward: number;
    expiresAt?: number;
  }[];
  milestones: {
    name: string;
    threshold: number;
    reached: boolean;
    reachedAt?: number;
  }[];
}

export interface PointTransaction {
  id: string;
  timestamp: number;
  points: number;
  reason: string;
  category: string;
  multiplier?: number;
  bonusReason?: string;
}

export interface GamifiedChallenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  requirements: { action: string; count: number; current: number }[];
  rewards: {
    points: number;
    badge?: string;
    unlocks?: string;
  };
  adaptations: string[];
}

export class ResiliencePointsAdvancedService {
  private profile: ResilienceProfile | null = null;
  private transactions: PointTransaction[] = [];

  async initializeProfile(): Promise<ResilienceProfile> {
    const stored = await AsyncStorage.getItem('resilience_profile');
    if (stored) {
      this.profile = JSON.parse(stored);
      return this.profile!;
    }

    this.profile = {
      totalPoints: 0,
      level: 1,
      levelProgress: 0,
      streaks: [
        { type: 'daily_checkin', currentCount: 0, bestCount: 0, lastActivity: 0 },
        { type: 'self_care', currentCount: 0, bestCount: 0, lastActivity: 0 },
        { type: 'movement', currentCount: 0, bestCount: 0, lastActivity: 0 },
        { type: 'mindfulness', currentCount: 0, bestCount: 0, lastActivity: 0 },
      ],
      achievements: [],
      challenges: this.generateInitialChallenges(),
      milestones: this.defineMilestones(),
    };

    await this.saveProfile();
    return this.profile;
  }

  private generateInitialChallenges(): ResilienceProfile['challenges'] {
    return [
      {
        id: 'welcome_warrior',
        name: 'Welcome Warrior',
        description: 'Complete your first week of check-ins',
        progress: 0,
        goal: 7,
        reward: 100,
      },
      {
        id: 'self_care_starter',
        name: 'Self-Care Starter',
        description: 'Log 5 self-care activities',
        progress: 0,
        goal: 5,
        reward: 50,
      },
      {
        id: 'mood_mapper',
        name: 'Mood Mapper',
        description: 'Track your mood for 10 days',
        progress: 0,
        goal: 10,
        reward: 75,
      },
    ];
  }

  private defineMilestones(): ResilienceProfile['milestones'] {
    return [
      { name: 'First Steps', threshold: 100, reached: false },
      { name: 'Building Momentum', threshold: 500, reached: false },
      { name: 'Resilience Rising', threshold: 1000, reached: false },
      { name: 'Wellness Warrior', threshold: 2500, reached: false },
      { name: 'Champion of Self-Care', threshold: 5000, reached: false },
      { name: 'Master of Adaptation', threshold: 10000, reached: false },
      { name: 'Legendary Resilience', threshold: 25000, reached: false },
    ];
  }

  async awardPoints(
    points: number,
    reason: string,
    category: string,
    conditions?: { isStreak?: boolean; isChallenge?: boolean; difficultyMultiplier?: number }
  ): Promise<PointTransaction> {
    if (!this.profile) await this.initializeProfile();

    // Calculate multipliers
    let multiplier = 1;
    let bonusReason: string | undefined;

    if (conditions?.isStreak) {
      const streak = this.profile!.streaks.find(s => s.type === category);
      if (streak && streak.currentCount >= 7) {
        multiplier = 1.5;
        bonusReason = 'Week streak bonus!';
      } else if (streak && streak.currentCount >= 30) {
        multiplier = 2;
        bonusReason = 'Month streak bonus!';
      }
    }

    if (conditions?.difficultyMultiplier) {
      multiplier *= conditions.difficultyMultiplier;
    }

    const finalPoints = Math.round(points * multiplier);

    const transaction: PointTransaction = {
      id: `txn-${Date.now()}`,
      timestamp: Date.now(),
      points: finalPoints,
      reason,
      category,
      multiplier: multiplier > 1 ? multiplier : undefined,
      bonusReason,
    };

    this.transactions.push(transaction);
    this.profile!.totalPoints += finalPoints;

    // Update level
    this.updateLevel();

    // Check milestones
    this.checkMilestones();

    // Update streaks if applicable
    if (conditions?.isStreak) {
      this.updateStreak(category);
    }

    await this.saveProfile();
    return transaction;
  }

  private updateLevel(): void {
    if (!this.profile) return;

    // Level thresholds (exponential)
    const getThreshold = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));

    let level = 1;
    let pointsAccountedFor = 0;

    while (pointsAccountedFor + getThreshold(level) <= this.profile.totalPoints) {
      pointsAccountedFor += getThreshold(level);
      level++;
    }

    const currentLevelThreshold = getThreshold(level);
    const pointsInCurrentLevel = this.profile.totalPoints - pointsAccountedFor;
    const progress = (pointsInCurrentLevel / currentLevelThreshold) * 100;

    this.profile.level = level;
    this.profile.levelProgress = Math.round(progress);
  }

  private checkMilestones(): void {
    if (!this.profile) return;

    this.profile.milestones.forEach(milestone => {
      if (!milestone.reached && this.profile!.totalPoints >= milestone.threshold) {
        milestone.reached = true;
        milestone.reachedAt = Date.now();

        // Award achievement for milestone
        this.profile!.achievements.push({
          id: `milestone-${milestone.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: milestone.name,
          description: `Reached ${milestone.threshold} resilience points!`,
          unlockedAt: Date.now(),
          rarity: milestone.threshold >= 10000 ? 'legendary' 
            : milestone.threshold >= 5000 ? 'epic'
            : milestone.threshold >= 1000 ? 'rare'
            : milestone.threshold >= 500 ? 'uncommon' : 'common',
          category: 'milestone',
        });
      }
    });
  }

  private updateStreak(type: string): void {
    if (!this.profile) return;

    const streak = this.profile.streaks.find(s => s.type === type);
    if (!streak) return;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const daysSinceLastActivity = (now - streak.lastActivity) / oneDayMs;

    if (daysSinceLastActivity < 2) {
      // Continue streak
      streak.currentCount++;
      if (streak.currentCount > streak.bestCount) {
        streak.bestCount = streak.currentCount;
      }
    } else {
      // Streak broken
      streak.currentCount = 1;
    }

    streak.lastActivity = now;
  }

  async generatePersonalizedChallenge(
    abilities: { physical: number; cognitive: number; emotional: number },
    preferences: string[],
    currentChallengeCount: number
  ): Promise<GamifiedChallenge> {
    // Determine appropriate difficulty
    const avgAbility = (abilities.physical + abilities.cognitive + abilities.emotional) / 3;
    const difficulty = avgAbility > 70 ? 'hard' 
      : avgAbility > 50 ? 'medium' 
      : 'easy';

    // Generate challenge based on preferences and abilities
    const challengeTemplates = this.getChallengeTemplates(preferences, abilities);
    const template = challengeTemplates[Math.floor(Math.random() * challengeTemplates.length)];

    // Scale requirements to difficulty
    const countMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'easy' ? 0.5 : 1;
    const pointMultiplier = difficulty === 'hard' ? 2 : difficulty === 'easy' ? 1 : 1.5;

    const challenge: GamifiedChallenge = {
      id: `challenge-${Date.now()}`,
      name: template.name,
      description: template.description,
      type: 'weekly',
      difficulty,
      requirements: template.requirements.map(r => ({
        ...r,
        count: Math.round(r.count * countMultiplier),
        current: 0,
      })),
      rewards: {
        points: Math.round(template.basePoints * pointMultiplier),
        badge: template.badge,
      },
      adaptations: this.generateAdaptations(template.name, abilities),
    };

    return challenge;
  }

  private getChallengeTemplates(
    preferences: string[],
    abilities: { physical: number; cognitive: number; emotional: number }
  ): { name: string; description: string; requirements: { action: string; count: number }[]; basePoints: number; badge?: string }[] {
    const templates = [
      {
        name: 'Mindful Moments',
        description: 'Practice mindfulness throughout the week',
        requirements: [{ action: 'Complete meditation or breathing exercise', count: 5 }],
        basePoints: 75,
        badge: 'Mindful Master',
      },
      {
        name: 'Gratitude Journey',
        description: 'Record things you\'re grateful for',
        requirements: [{ action: 'Log gratitude entries', count: 7 }],
        basePoints: 50,
        badge: 'Gratitude Guru',
      },
      {
        name: 'Self-Care Week',
        description: 'Prioritize your wellbeing with daily self-care',
        requirements: [{ action: 'Complete self-care activity', count: 7 }],
        basePoints: 100,
        badge: 'Self-Care Champion',
      },
      {
        name: 'Movement Mission',
        description: 'Add gentle movement to your days',
        requirements: [{ action: 'Log movement/stretching', count: 5 }],
        basePoints: 80,
        badge: 'Movement Maven',
      },
      {
        name: 'Connection Quest',
        description: 'Reach out and connect with others',
        requirements: [{ action: 'Meaningful social interaction', count: 3 }],
        basePoints: 60,
        badge: 'Connection Captain',
      },
    ];

    // Filter based on abilities
    return templates.filter(t => {
      if (t.name.includes('Movement') && abilities.physical < 30) return false;
      return true;
    });
  }

  private generateAdaptations(challengeName: string, abilities: { physical: number; cognitive: number; emotional: number }): string[] {
    const adaptations: string[] = [];

    if (abilities.physical < 50) {
      adaptations.push('Rest counts as self-care');
      adaptations.push('Bed or chair exercises count for movement');
    }

    if (abilities.cognitive < 50) {
      adaptations.push('Short activities count the same as long ones');
      adaptations.push('Voice notes count as journaling');
    }

    if (abilities.emotional < 50) {
      adaptations.push('Any attempt counts, regardless of completion');
      adaptations.push('Difficult days can be rest days');
    }

    adaptations.push('Challenges can be paused during flares');
    adaptations.push('All progress counts, even small steps');

    return adaptations;
  }

  private async saveProfile(): Promise<void> {
    if (this.profile) {
      await AsyncStorage.setItem('resilience_profile', JSON.stringify(this.profile));
    }
  }
}

// ============================================================================
// 12. WELLNESS REMINDERS - Intelligent Nudge Engine
// ============================================================================

export interface SmartReminder {
  id: string;
  type: 'medication' | 'self-care' | 'movement' | 'hydration' | 'rest' | 'social' | 'custom';
  title: string;
  message: string;
  scheduledTime: string;
  frequency: 'once' | 'daily' | 'weekly' | 'adaptive';
  priority: 'critical' | 'important' | 'helpful';
  adaptations: {
    delayIfBusyMinutes: number;
    skipIfLowEnergy: boolean;
    alternativeAction?: string;
  };
  effectiveness: number;
  dismissCount: number;
  completionCount: number;
}

export interface NudgeOptimization {
  optimalTimes: { time: string; reason: string; successRate: number }[];
  messagingTips: string[];
  frequencyRecommendation: string;
  personalizedApproaches: string[];
}

export class WellnessRemindersAdvancedService {
  private reminders: SmartReminder[] = [];

  async createSmartReminder(
    type: SmartReminder['type'],
    title: string,
    baseTime: string,
    userPatterns: { wakeTime: string; peakEnergy: string; windDown: string },
    importance: 'critical' | 'important' | 'helpful'
  ): Promise<SmartReminder> {
    // Optimize timing based on user patterns
    const optimizedTime = this.optimizeTiming(type, baseTime, userPatterns);

    // Generate personalized message
    const message = this.generatePersonalizedMessage(type, title);

    const reminder: SmartReminder = {
      id: `reminder-${Date.now()}`,
      type,
      title,
      message,
      scheduledTime: optimizedTime,
      frequency: this.determineFrequency(type, importance),
      priority: importance,
      adaptations: {
        delayIfBusyMinutes: importance === 'critical' ? 5 : 30,
        skipIfLowEnergy: importance !== 'critical',
        alternativeAction: this.getAlternativeAction(type),
      },
      effectiveness: 0,
      dismissCount: 0,
      completionCount: 0,
    };

    this.reminders.push(reminder);
    return reminder;
  }

  private optimizeTiming(
    type: SmartReminder['type'],
    baseTime: string,
    patterns: { wakeTime: string; peakEnergy: string; windDown: string }
  ): string {
    // Medication reminders respect exact times
    if (type === 'medication') return baseTime;

    // Movement best during peak energy
    if (type === 'movement') return patterns.peakEnergy;

    // Self-care during wind down
    if (type === 'self-care' || type === 'rest') return patterns.windDown;

    // Hydration throughout day (return as-is or slight adjustment)
    return baseTime;
  }

  private generatePersonalizedMessage(type: SmartReminder['type'], title: string): string {
    const messages: Record<string, string[]> = {
      medication: [
        `Time for ${title} 💊`,
        `${title} reminder - you've got this!`,
        `Don't forget: ${title}`,
      ],
      'self-care': [
        `You deserve some care: ${title} 💙`,
        `A gentle reminder for ${title}`,
        `Self-care moment: ${title}`,
      ],
      movement: [
        `Time to move a little: ${title} 🌟`,
        `Gentle movement reminder: ${title}`,
        `Your body might enjoy some ${title}`,
      ],
      hydration: [
        `Stay hydrated! 💧`,
        `Water check-in time`,
        `A sip of water would be great right now`,
      ],
      rest: [
        `Rest is productive: time to pause`,
        `Your body is asking for rest`,
        `Permission to rest: granted`,
      ],
      social: [
        `Connection time: ${title}`,
        `Reach out to someone?`,
        `A moment for connection`,
      ],
      custom: [`${title}`],
    };

    const options = messages[type] || messages.custom;
    return options[Math.floor(Math.random() * options.length)];
  }

  private determineFrequency(type: SmartReminder['type'], importance: string): SmartReminder['frequency'] {
    if (type === 'medication' || importance === 'critical') return 'daily';
    if (type === 'hydration') return 'adaptive';
    return 'daily';
  }

  private getAlternativeAction(type: SmartReminder['type']): string | undefined {
    const alternatives: Record<string, string> = {
      movement: 'Try gentle stretches in bed',
      'self-care': 'Even a deep breath counts',
      social: 'Send a quick emoji to someone',
      hydration: 'Have a few sips when you can',
    };
    return alternatives[type];
  }

  async optimizeNudges(
    reminderHistory: { id: string; shown: number; completed: number; dismissed: number; delayed: number }[],
    userFeedback: { tooFrequent: boolean; wrongTiming: boolean; notHelpful: boolean }
  ): Promise<NudgeOptimization> {
    // Analyze effectiveness
    const optimalTimes: NudgeOptimization['optimalTimes'] = [];
    
    // Find times with best completion rates
    const timeAnalysis = new Map<string, { completed: number; total: number }>();
    // This would analyze actual reminder completion data

    optimalTimes.push(
      { time: '9:00 AM', reason: 'Post-morning routine, energy building', successRate: 0.75 },
      { time: '2:00 PM', reason: 'Afternoon energy dip - good for rest reminders', successRate: 0.70 },
      { time: '7:00 PM', reason: 'Evening wind-down', successRate: 0.80 },
    );

    // Messaging tips
    const messagingTips: string[] = [];
    if (userFeedback.notHelpful) {
      messagingTips.push('Try more encouraging, less directive language');
      messagingTips.push('Include the "why" to increase motivation');
    }

    // Frequency recommendation
    let frequencyRecommendation = 'Current frequency seems appropriate';
    if (userFeedback.tooFrequent) {
      frequencyRecommendation = 'Consider reducing reminder frequency or grouping similar reminders';
    }

    return {
      optimalTimes,
      messagingTips,
      frequencyRecommendation,
      personalizedApproaches: [
        'Front-load important reminders in your high-energy window',
        'Use adaptive timing that responds to your daily patterns',
        'Allow snoozing without guilt for non-critical items',
      ],
    };
  }
}

// ============================================================================
// 13. REFLECTIONS CALENDAR - Temporal Insight Mapper
// ============================================================================

export interface ReflectionEntry {
  id: string;
  date: string;
  type: 'daily' | 'weekly' | 'monthly' | 'milestone' | 'free';
  prompts: { question: string; answer: string }[];
  mood: number;
  energy: number;
  symptoms: string[];
  gratitudes: string[];
  wins: string[];
  challenges: string[];
  insights: string[];
  tags: string[];
}

export interface TemporalPattern {
  type: 'weekly' | 'monthly' | 'seasonal';
  pattern: string;
  description: string;
  affectedAreas: string[];
  suggestions: string[];
  confidence: number;
}

export interface ReflectionSummary {
  period: string;
  overallMood: number;
  moodTrend: 'improving' | 'stable' | 'declining' | 'variable';
  topThemes: string[];
  growthAreas: string[];
  challengePatterns: string[];
  insights: string[];
  recommendations: string[];
}

export class ReflectionsCalendarAdvancedService {
  private entries: ReflectionEntry[] = [];

  async generateReflectionPrompts(
    type: 'daily' | 'weekly' | 'monthly',
    recentEntries: ReflectionEntry[],
    currentMood: number,
    currentChallenges: string[]
  ): Promise<{ question: string; category: string }[]> {
    const prompts: { question: string; category: string }[] = [];

    if (type === 'daily') {
      prompts.push(
        { question: 'What\'s one thing that went well today, even if small?', category: 'wins' },
        { question: 'What challenged you today?', category: 'challenges' },
        { question: 'What are you grateful for right now?', category: 'gratitude' },
      );

      if (currentMood < 40) {
        prompts.push(
          { question: 'What would feel supportive right now?', category: 'self-care' },
          { question: 'What helped you cope today?', category: 'coping' },
        );
      }
    } else if (type === 'weekly') {
      prompts.push(
        { question: 'What was the highlight of your week?', category: 'wins' },
        { question: 'What patterns did you notice this week?', category: 'patterns' },
        { question: 'What would you like to do differently next week?', category: 'intentions' },
        { question: 'How did you take care of yourself?', category: 'self-care' },
      );
    } else if (type === 'monthly') {
      prompts.push(
        { question: 'What are you most proud of this month?', category: 'wins' },
        { question: 'How have you grown?', category: 'growth' },
        { question: 'What lessons will you carry forward?', category: 'insights' },
        { question: 'What goals do you have for next month?', category: 'intentions' },
        { question: 'Who or what are you grateful for?', category: 'gratitude' },
      );
    }

    // Add personalized prompts based on recent entries
    if (currentChallenges.length > 0) {
      prompts.push({
        question: `How are you managing ${currentChallenges[0]}?`,
        category: 'challenges',
      });
    }

    return prompts;
  }

  async analyzeTemporalPatterns(
    entries: ReflectionEntry[],
    healthData: { date: string; symptoms: string[]; energy: number }[]
  ): Promise<TemporalPattern[]> {
    const patterns: TemporalPattern[] = [];

    // Analyze weekly patterns
    const byDayOfWeek = this.groupByDayOfWeek(entries);
    const weeklyPattern = this.findWeeklyPattern(byDayOfWeek);
    if (weeklyPattern) {
      patterns.push(weeklyPattern);
    }

    // Analyze monthly patterns
    const byWeekOfMonth = this.groupByWeekOfMonth(entries);
    const monthlyPattern = this.findMonthlyPattern(byWeekOfMonth);
    if (monthlyPattern) {
      patterns.push(monthlyPattern);
    }

    // Analyze mood patterns
    const moodPattern = this.analyzeMoodPatterns(entries);
    if (moodPattern) {
      patterns.push(moodPattern);
    }

    return patterns;
  }

  private groupByDayOfWeek(entries: ReflectionEntry[]): Map<number, ReflectionEntry[]> {
    const grouped = new Map<number, ReflectionEntry[]>();
    entries.forEach(entry => {
      const day = new Date(entry.date).getDay();
      const dayEntries = grouped.get(day) || [];
      dayEntries.push(entry);
      grouped.set(day, dayEntries);
    });
    return grouped;
  }

  private groupByWeekOfMonth(entries: ReflectionEntry[]): Map<number, ReflectionEntry[]> {
    const grouped = new Map<number, ReflectionEntry[]>();
    entries.forEach(entry => {
      const week = Math.ceil(new Date(entry.date).getDate() / 7);
      const weekEntries = grouped.get(week) || [];
      weekEntries.push(entry);
      grouped.set(week, weekEntries);
    });
    return grouped;
  }

  private findWeeklyPattern(byDay: Map<number, ReflectionEntry[]>): TemporalPattern | null {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const averages = new Map<number, number>();

    byDay.forEach((entries, day) => {
      const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
      averages.set(day, avgMood);
    });

    // Find best and worst days
    let bestDay = 0, worstDay = 0, bestMood = 0, worstMood = 100;
    averages.forEach((mood, day) => {
      if (mood > bestMood) { bestMood = mood; bestDay = day; }
      if (mood < worstMood) { worstMood = mood; worstDay = day; }
    });

    if (bestMood - worstMood > 15) {
      return {
        type: 'weekly',
        pattern: `${dayNames[bestDay]}s tend to be better; ${dayNames[worstDay]}s more challenging`,
        description: `Your mood patterns show a ${Math.round(bestMood - worstMood)} point difference between days`,
        affectedAreas: ['mood', 'energy'],
        suggestions: [
          `Plan demanding tasks for ${dayNames[bestDay]}`,
          `Build in extra self-care for ${dayNames[worstDay]}`,
        ],
        confidence: Math.min(0.9, byDay.size * 0.1),
      };
    }

    return null;
  }

  private findMonthlyPattern(byWeek: Map<number, ReflectionEntry[]>): TemporalPattern | null {
    const weekAverages = new Map<number, number>();

    byWeek.forEach((entries, week) => {
      const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
      weekAverages.set(week, avgMood);
    });

    // Check for end-of-month patterns
    const week1 = weekAverages.get(1) || 50;
    const week4 = weekAverages.get(4) || 50;

    if (Math.abs(week1 - week4) > 10) {
      const trend = week4 > week1 ? 'improve' : 'decline';
      return {
        type: 'monthly',
        pattern: `Energy tends to ${trend} through the month`,
        description: `Week 4 averages ${Math.round(Math.abs(week4 - week1))} points ${trend === 'improve' ? 'higher' : 'lower'} than week 1`,
        affectedAreas: ['energy', 'mood'],
        suggestions: trend === 'decline'
          ? ['Plan lighter commitments for end of month', 'Build in recovery time']
          : ['Leverage end-of-month energy for bigger projects'],
        confidence: 0.6,
      };
    }

    return null;
  }

  private analyzeMoodPatterns(entries: ReflectionEntry[]): TemporalPattern | null {
    if (entries.length < 7) return null;

    const recentMoods = entries.slice(-7).map(e => e.mood);
    const olderMoods = entries.slice(-14, -7).map(e => e.mood);

    if (recentMoods.length === 0 || olderMoods.length === 0) return null;

    const recentAvg = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
    const olderAvg = olderMoods.reduce((a, b) => a + b, 0) / olderMoods.length;
    const change = recentAvg - olderAvg;

    if (Math.abs(change) > 10) {
      return {
        type: 'weekly',
        pattern: change > 0 ? 'Mood improving' : 'Mood declining',
        description: `${Math.abs(Math.round(change))} point ${change > 0 ? 'improvement' : 'decline'} over past week`,
        affectedAreas: ['mood'],
        suggestions: change > 0
          ? ['Keep doing what\'s working!', 'Note what contributed to improvement']
          : ['Consider what might be affecting you', 'Reach out for support if needed'],
        confidence: 0.7,
      };
    }

    return null;
  }

  async generateReflectionSummary(
    entries: ReflectionEntry[],
    period: 'week' | 'month'
  ): Promise<ReflectionSummary> {
    const moods = entries.map(e => e.mood);
    const overallMood = moods.length > 0 
      ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length)
      : 50;

    // Determine mood trend
    const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
    const secondHalf = moods.slice(Math.floor(moods.length / 2));
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 50;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 50;
    
    const moodTrend = secondAvg > firstAvg + 5 ? 'improving'
      : secondAvg < firstAvg - 5 ? 'declining'
      : Math.max(...moods) - Math.min(...moods) > 30 ? 'variable'
      : 'stable';

    // Extract themes
    const allTags = entries.flatMap(e => e.tags);
    const tagCounts = new Map<string, number>();
    allTags.forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
    const topThemes = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // Growth areas from wins
    const growthAreas = entries
      .flatMap(e => e.wins)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3);

    // Challenge patterns
    const challengePatterns = entries
      .flatMap(e => e.challenges)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3);

    // Insights
    const insights = entries
      .flatMap(e => e.insights)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5);

    return {
      period: period === 'week' ? 'This Week' : 'This Month',
      overallMood,
      moodTrend,
      topThemes,
      growthAreas,
      challengePatterns,
      insights,
      recommendations: this.generateRecommendations(moodTrend, challengePatterns),
    };
  }

  private generateRecommendations(trend: string, challenges: string[]): string[] {
    const recommendations: string[] = [];

    if (trend === 'declining') {
      recommendations.push('Consider what might be contributing to the downward trend');
      recommendations.push('Increase self-care activities this week');
      recommendations.push('Reach out to someone you trust');
    } else if (trend === 'improving') {
      recommendations.push('Note what\'s been helping - do more of it!');
      recommendations.push('Celebrate your progress');
    }

    if (challenges.length > 0) {
      recommendations.push(`Focus on addressing ${challenges[0]} this period`);
    }

    recommendations.push('Continue your reflection practice - it\'s valuable data');

    return recommendations.slice(0, 4);
  }
}

// ============================================================================
// 14. DREAM TRACKER & INTERPRETER - Subconscious Navigator
// ============================================================================

export interface DreamEntry {
  id: string;
  timestamp: number;
  content: string;
  emotions: string[];
  symbols: string[];
  clarity: number; // 0-100
  lucidity: boolean;
  recurring: boolean;
  themes: string[];
  interpretation?: string;
  personalConnections?: string[];
}

export interface DreamPattern {
  type: 'recurring_symbol' | 'emotional_theme' | 'narrative_pattern' | 'timing_pattern';
  pattern: string;
  frequency: number;
  examples: string[];
  possibleMeaning: string;
  reflectionQuestions: string[];
}

export interface DreamInterpretation {
  summary: string;
  symbolAnalysis: { symbol: string; possibleMeanings: string[]; personalContext: string }[];
  emotionalInsights: string[];
  potentialConnections: { area: string; connection: string }[];
  reflectionPrompts: string[];
  disclaimer: string;
}

export class DreamTrackerAdvancedService {
  private dreams: DreamEntry[] = [];

  async recordDream(
    content: string,
    emotions: string[],
    clarity: number,
    lucidity: boolean,
    recurring: boolean
  ): Promise<DreamEntry> {
    // Extract symbols from content
    const symbols = this.extractSymbols(content);

    // Identify themes
    const themes = this.identifyThemes(content, emotions);

    const entry: DreamEntry = {
      id: `dream-${Date.now()}`,
      timestamp: Date.now(),
      content,
      emotions,
      symbols,
      clarity,
      lucidity,
      recurring,
      themes,
    };

    this.dreams.push(entry);
    return entry;
  }

  private extractSymbols(content: string): string[] {
    const commonSymbols = [
      'water', 'ocean', 'river', 'rain',
      'flying', 'falling', 'running', 'chasing',
      'house', 'room', 'door', 'window',
      'car', 'vehicle', 'road', 'path',
      'animal', 'dog', 'cat', 'bird', 'snake',
      'family', 'mother', 'father', 'child',
      'death', 'birth', 'wedding',
      'teeth', 'hair', 'naked',
      'school', 'test', 'work',
      'money', 'treasure', 'lost', 'found',
    ];

    const lower = content.toLowerCase();
    return commonSymbols.filter(symbol => lower.includes(symbol));
  }

  private identifyThemes(content: string, emotions: string[]): string[] {
    const themes: string[] = [];
    const lower = content.toLowerCase();

    // Emotional themes
    if (emotions.some(e => ['fear', 'scared', 'anxious'].includes(e.toLowerCase()))) {
      themes.push('anxiety');
    }
    if (emotions.some(e => ['happy', 'joy', 'peaceful'].includes(e.toLowerCase()))) {
      themes.push('positive');
    }
    if (emotions.some(e => ['sad', 'grief', 'loss'].includes(e.toLowerCase()))) {
      themes.push('grief');
    }

    // Content themes
    if (lower.includes('chas') || lower.includes('run') || lower.includes('escape')) {
      themes.push('pursuit');
    }
    if (lower.includes('lost') || lower.includes('can\'t find') || lower.includes('searching')) {
      themes.push('searching');
    }
    if (lower.includes('fly') || lower.includes('float') || lower.includes('soar')) {
      themes.push('freedom');
    }
    if (lower.includes('fall') || lower.includes('drop')) {
      themes.push('loss of control');
    }
    if (lower.includes('naked') || lower.includes('exposed') || lower.includes('vulnerable')) {
      themes.push('vulnerability');
    }
    if (lower.includes('test') || lower.includes('exam') || lower.includes('unprepared')) {
      themes.push('performance anxiety');
    }

    return themes;
  }

  async interpretDream(
    dream: DreamEntry,
    userContext: {
      currentStressors: string[];
      recentEvents: string[];
      personalAssociations: Record<string, string>;
    }
  ): Promise<DreamInterpretation> {
    // Symbol analysis
    const symbolAnalysis = dream.symbols.map(symbol => ({
      symbol,
      possibleMeanings: this.getSymbolMeanings(symbol),
      personalContext: userContext.personalAssociations[symbol] 
        || 'Consider what this symbol means to you personally',
    }));

    // Emotional insights
    const emotionalInsights = this.generateEmotionalInsights(dream.emotions, dream.themes);

    // Potential connections to life
    const potentialConnections = this.findConnections(
      dream,
      userContext.currentStressors,
      userContext.recentEvents
    );

    // Reflection prompts
    const reflectionPrompts = this.generateReflectionPrompts(dream);

    return {
      summary: this.generateSummary(dream),
      symbolAnalysis,
      emotionalInsights,
      potentialConnections,
      reflectionPrompts,
      disclaimer: 'Dream interpretation is subjective. These insights are meant as starting points for self-reflection, not definitive meanings.',
    };
  }

  private getSymbolMeanings(symbol: string): string[] {
    const meanings: Record<string, string[]> = {
      water: ['Emotions', 'Unconscious mind', 'Cleansing', 'Change'],
      flying: ['Freedom', 'Ambition', 'Escape from limitations', 'Perspective'],
      falling: ['Anxiety', 'Loss of control', 'Letting go', 'Failure fears'],
      house: ['Self/psyche', 'Security', 'Different aspects of personality'],
      teeth: ['Confidence', 'Appearance concerns', 'Communication', 'Aging fears'],
      chasing: ['Avoiding something', 'Anxiety', 'Goals', 'Fears'],
      death: ['Transformation', 'Endings', 'Fear of change', 'New beginnings'],
      naked: ['Vulnerability', 'Authenticity', 'Exposure fears', 'Freedom'],
      test: ['Self-evaluation', 'Performance anxiety', 'Judgment fears'],
      animal: ['Instincts', 'Untamed aspects of self', 'Particular qualities of that animal'],
    };

    return meanings[symbol] || ['Consider your personal associations with this symbol'];
  }

  private generateEmotionalInsights(emotions: string[], themes: string[]): string[] {
    const insights: string[] = [];

    if (emotions.length > 0) {
      insights.push(`Your dream carried these emotions: ${emotions.join(', ')}. These may reflect unprocessed feelings.`);
    }

    if (themes.includes('anxiety')) {
      insights.push('Anxiety themes often reflect waking life stressors seeking expression.');
    }
    if (themes.includes('pursuit')) {
      insights.push('Being chased can represent avoiding something in waking life.');
    }
    if (themes.includes('freedom')) {
      insights.push('Flying or freedom themes may indicate a desire for liberation or accomplishment.');
    }

    return insights;
  }

  private findConnections(
    dream: DreamEntry,
    stressors: string[],
    events: string[]
  ): { area: string; connection: string }[] {
    const connections: { area: string; connection: string }[] = [];

    // Check for stressor connections
    stressors.forEach(stressor => {
      if (dream.themes.some(t => stressor.toLowerCase().includes(t))) {
        connections.push({
          area: 'Current stressor',
          connection: `This dream may be processing feelings about: ${stressor}`,
        });
      }
    });

    // Check for event connections
    events.forEach(event => {
      connections.push({
        area: 'Recent event',
        connection: `Consider if this relates to: ${event}`,
      });
    });

    // Theme-based connections
    if (dream.themes.includes('performance anxiety')) {
      connections.push({
        area: 'Self-evaluation',
        connection: 'You may be feeling tested or judged in some area of life',
      });
    }

    return connections.slice(0, 4);
  }

  private generateReflectionPrompts(dream: DreamEntry): string[] {
    const prompts: string[] = [
      'What stood out most in this dream?',
      'How did you feel upon waking?',
    ];

    if (dream.recurring) {
      prompts.push('This is a recurring dream - what might need attention?');
    }

    if (dream.symbols.length > 0) {
      prompts.push(`What does "${dream.symbols[0]}" mean to you personally?`);
    }

    prompts.push('Is there anything in your waking life that feels similar to this dream?');

    return prompts;
  }

  private generateSummary(dream: DreamEntry): string {
    const themeDesc = dream.themes.length > 0 
      ? `with themes of ${dream.themes.slice(0, 2).join(' and ')}`
      : '';

    const emotionDesc = dream.emotions.length > 0
      ? `You felt ${dream.emotions[0].toLowerCase()}`
      : 'Complex emotions were present';

    return `A ${dream.clarity > 70 ? 'vivid' : dream.clarity > 40 ? 'moderately clear' : 'hazy'} dream ${themeDesc}. ${emotionDesc}. ${dream.symbols.length > 0 ? `Key symbols included ${dream.symbols.slice(0, 3).join(', ')}.` : ''}`;
  }

  async findDreamPatterns(dreams: DreamEntry[]): Promise<DreamPattern[]> {
    const patterns: DreamPattern[] = [];

    // Recurring symbols
    const symbolCounts = new Map<string, number>();
    dreams.forEach(d => d.symbols.forEach(s => 
      symbolCounts.set(s, (symbolCounts.get(s) || 0) + 1)
    ));

    symbolCounts.forEach((count, symbol) => {
      if (count >= 3) {
        patterns.push({
          type: 'recurring_symbol',
          pattern: `"${symbol}" appears frequently`,
          frequency: count,
          examples: dreams.filter(d => d.symbols.includes(symbol)).map(d => d.content.slice(0, 50)),
          possibleMeaning: this.getSymbolMeanings(symbol)[0] || 'Personal significance',
          reflectionQuestions: [
            `What does ${symbol} represent to you?`,
            `When did ${symbol} start appearing?`,
            `What\'s happening in life when ${symbol} dreams occur?`,
          ],
        });
      }
    });

    // Emotional themes
    const emotionCounts = new Map<string, number>();
    dreams.forEach(d => d.emotions.forEach(e => 
      emotionCounts.set(e, (emotionCounts.get(e) || 0) + 1)
    ));

    emotionCounts.forEach((count, emotion) => {
      if (count >= 4) {
        patterns.push({
          type: 'emotional_theme',
          pattern: `${emotion} is a common dream emotion`,
          frequency: count,
          examples: [],
          possibleMeaning: `Unprocessed ${emotion.toLowerCase()} may be seeking expression`,
          reflectionQuestions: [
            `What in waking life brings up ${emotion.toLowerCase()}?`,
            `How are you processing ${emotion.toLowerCase()} feelings?`,
          ],
        });
      }
    });

    return patterns;
  }
}

// ============================================================================
// Export all services
// ============================================================================

export const griefIdentitySupportAdvanced = new GriefIdentitySupportAdvancedService();
export const resiliencePointsAdvanced = new ResiliencePointsAdvancedService();
export const wellnessRemindersAdvanced = new WellnessRemindersAdvancedService();
export const reflectionsCalendarAdvanced = new ReflectionsCalendarAdvancedService();
export const dreamTrackerAdvanced = new DreamTrackerAdvancedService();
