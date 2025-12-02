/**
 * Advanced Wellness Feature Upgrades - Part 4 (Final)
 * 
 * Revolutionary AI-powered enhancements for remaining wellness features:
 * Adaptive Daily Planner, Accessible Self-Care, Trigger Detector, Harm Reduction Guide
 */


// ============================================================================
// 15. ADAPTIVE DAILY PLANNER - Dynamic Life Architect
// ============================================================================

export interface AdaptiveSchedule {
  id: string;
  date: string;
  capacityBudget: number;
  allocatedCapacity: number;
  remainingBuffer: number;
  timeBlocks: {
    id: string;
    startTime: string;
    endTime: string;
    activity: string;
    category: 'essential' | 'wellness' | 'work' | 'rest' | 'social' | 'optional';
    energyCost: number;
    flexibility: 'fixed' | 'movable' | 'optional';
    adaptations: string[];
    status: 'scheduled' | 'in-progress' | 'completed' | 'skipped' | 'modified';
  }[];
  microBreaks: { time: string; duration: number; suggestion: string }[];
  contingencyPlans: { trigger: string; action: string }[];
  dayType: 'high-capacity' | 'moderate' | 'low-capacity' | 'rest-day' | 'recovery';
}

export interface ScheduleOptimization {
  recommendations: {
    type: 'move' | 'remove' | 'add' | 'modify';
    target: string;
    suggestion: string;
    reason: string;
    impact: number;
  }[];
  riskAreas: { time: string; risk: string; mitigation: string }[];
  balanceScore: number;
  sustainabilityRating: number;
}

export interface DayReview {
  adherenceScore: number;
  energyManagement: 'excellent' | 'good' | 'challenging' | 'overextended';
  completedItems: string[];
  skippedItems: string[];
  unexpectedEvents: string[];
  learnings: string[];
  tomorrowAdjustments: string[];
}

export class AdaptiveDailyPlannerAdvancedService {
  async createAdaptiveSchedule(
    availableEnergy: number,
    mustDos: { activity: string; energyCost: number; deadline?: string }[],
    wantTos: { activity: string; energyCost: number; priority: number }[],
    constraints: { time: string; constraint: string }[],
    preferences: { peakEnergyWindow: string; restPreferences: string[] }
  ): Promise<AdaptiveSchedule> {
    const now = new Date();
    const dayType = this.determineDayType(availableEnergy);

    // Adjust capacity budget based on day type
    const capacityBudget = dayType === 'high-capacity' ? availableEnergy 
      : dayType === 'moderate' ? availableEnergy * 0.8
      : dayType === 'low-capacity' ? availableEnergy * 0.5
      : availableEnergy * 0.3;

    const timeBlocks: AdaptiveSchedule['timeBlocks'] = [];
    let allocatedCapacity = 0;

    // First, schedule must-dos
    for (const mustDo of mustDos) {
      if (allocatedCapacity + mustDo.energyCost <= capacityBudget) {
        const startTime = this.findOptimalSlot(mustDo, constraints, preferences, timeBlocks);
        timeBlocks.push({
          id: `block-${Date.now()}-${Math.random()}`,
          startTime,
          endTime: this.addMinutes(startTime, this.estimateDuration(mustDo.energyCost)),
          activity: mustDo.activity,
          category: 'essential',
          energyCost: mustDo.energyCost,
          flexibility: mustDo.deadline ? 'fixed' : 'movable',
          adaptations: this.generateActivityAdaptations(mustDo.activity, dayType),
          status: 'scheduled',
        });
        allocatedCapacity += mustDo.energyCost;
      }
    }

    // Add rest blocks
    const restBlocks = this.scheduleRestBlocks(timeBlocks, dayType);
    timeBlocks.push(...restBlocks);

    // Add want-tos if capacity remains
    const sortedWantTos = wantTos.sort((a, b) => b.priority - a.priority);
    for (const wantTo of sortedWantTos) {
      if (allocatedCapacity + wantTo.energyCost <= capacityBudget * 0.85) {
        const startTime = this.findOptimalSlot(wantTo, constraints, preferences, timeBlocks);
        if (startTime) {
          timeBlocks.push({
            id: `block-${Date.now()}-${Math.random()}`,
            startTime,
            endTime: this.addMinutes(startTime, this.estimateDuration(wantTo.energyCost)),
            activity: wantTo.activity,
            category: 'optional',
            energyCost: wantTo.energyCost,
            flexibility: 'optional',
            adaptations: this.generateActivityAdaptations(wantTo.activity, dayType),
            status: 'scheduled',
          });
          allocatedCapacity += wantTo.energyCost;
        }
      }
    }

    // Generate micro-breaks
    const microBreaks = this.generateMicroBreaks(timeBlocks, dayType);

    // Create contingency plans
    const contingencyPlans = this.createContingencyPlans(dayType, allocatedCapacity, capacityBudget);

    // Sort blocks by time
    timeBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return {
      id: `schedule-${now.toISOString().split('T')[0]}`,
      date: now.toISOString().split('T')[0],
      capacityBudget: Math.round(capacityBudget),
      allocatedCapacity: Math.round(allocatedCapacity),
      remainingBuffer: Math.round(capacityBudget - allocatedCapacity),
      timeBlocks,
      microBreaks,
      contingencyPlans,
      dayType,
    };
  }

  private determineDayType(energy: number): AdaptiveSchedule['dayType'] {
    if (energy >= 80) return 'high-capacity';
    if (energy >= 60) return 'moderate';
    if (energy >= 40) return 'low-capacity';
    if (energy >= 20) return 'recovery';
    return 'rest-day';
  }

  private findOptimalSlot(
    activity: { activity: string; energyCost: number },
    constraints: { time: string; constraint: string }[],
    preferences: { peakEnergyWindow: string },
    existingBlocks: AdaptiveSchedule['timeBlocks']
  ): string {
    // High-energy activities during peak window
    if (activity.energyCost > 20) {
      return preferences.peakEnergyWindow.split('-')[0];
    }

    // Find first available slot
    const busyTimes = existingBlocks.map(b => b.startTime);
    const hours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

    for (const hour of hours) {
      if (!busyTimes.includes(hour)) {
        const blocked = constraints.some(c => c.time === hour);
        if (!blocked) return hour;
      }
    }

    return '10:00';
  }

  private addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMins = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMins / 60);
    const newMins = totalMins % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  private estimateDuration(energyCost: number): number {
    return Math.max(15, Math.min(120, energyCost * 3));
  }

  private generateActivityAdaptations(activity: string, dayType: string): string[] {
    const adaptations: string[] = [];

    if (dayType === 'low-capacity' || dayType === 'recovery') {
      adaptations.push('Shorten to minimum viable version');
      adaptations.push('Break into smaller chunks');
      adaptations.push('Delegate parts if possible');
    }

    if (activity.toLowerCase().includes('meeting')) {
      adaptations.push('Request camera-off option');
      adaptations.push('Prepare agenda in advance');
    }

    adaptations.push('Skip if energy drops significantly');
    adaptations.push('Modify intensity as needed');

    return adaptations;
  }

  private scheduleRestBlocks(
    blocks: AdaptiveSchedule['timeBlocks'],
    dayType: string
  ): AdaptiveSchedule['timeBlocks'] {
    const restBlocks: AdaptiveSchedule['timeBlocks'] = [];
    const restFrequency = dayType === 'high-capacity' ? 3 : 2;

    // Add rest block every N activity blocks
    for (let i = restFrequency; i < blocks.length; i += restFrequency + 1) {
      const previousBlock = blocks[i - 1];
      if (previousBlock) {
        restBlocks.push({
          id: `rest-${Date.now()}-${i}`,
          startTime: previousBlock.endTime,
          endTime: this.addMinutes(previousBlock.endTime, dayType === 'low-capacity' ? 20 : 10),
          activity: 'Rest & Recovery',
          category: 'rest',
          energyCost: -10,
          flexibility: 'movable',
          adaptations: ['Extend if needed', 'Use for hydration'],
          status: 'scheduled',
        });
      }
    }

    return restBlocks;
  }

  private generateMicroBreaks(
    blocks: AdaptiveSchedule['timeBlocks'],
    dayType: string
  ): AdaptiveSchedule['microBreaks'] {
    const breaks: AdaptiveSchedule['microBreaks'] = [];
    const suggestions = [
      'Stand up and stretch',
      'Deep breathing (3 breaths)',
      'Look at something distant',
      'Roll your shoulders',
      'Wiggle your fingers and toes',
      'Take a sip of water',
      'Close eyes for 30 seconds',
    ];

    // Add micro-break every hour
    const hours = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
    hours.forEach((hour, i) => {
      breaks.push({
        time: this.addMinutes(hour, 45),
        duration: dayType === 'low-capacity' ? 5 : 2,
        suggestion: suggestions[i % suggestions.length],
      });
    });

    return breaks;
  }

  private createContingencyPlans(
    dayType: string,
    allocated: number,
    budget: number
  ): AdaptiveSchedule['contingencyPlans'] {
    const plans: AdaptiveSchedule['contingencyPlans'] = [
      {
        trigger: 'Energy drops significantly',
        action: 'Switch to essential-only mode, reschedule optional items',
      },
      {
        trigger: 'Unexpected task arises',
        action: 'Evaluate urgency, trade with lowest-priority scheduled item',
      },
      {
        trigger: 'Feeling overwhelmed',
        action: 'Take 10-minute reset break, then reassess',
      },
    ];

    if (allocated > budget * 0.9) {
      plans.push({
        trigger: 'Any additional demand',
        action: 'Schedule is at capacity - defer new items to tomorrow',
      });
    }

    return plans;
  }

  async optimizeSchedule(
    schedule: AdaptiveSchedule,
    feedback: { item: string; difficulty: 'easier' | 'as-expected' | 'harder' }[]
  ): Promise<ScheduleOptimization> {
    const recommendations: ScheduleOptimization['recommendations'] = [];

    // Analyze feedback
    feedback.forEach(fb => {
      if (fb.difficulty === 'harder') {
        recommendations.push({
          type: 'modify',
          target: fb.item,
          suggestion: 'Reduce scope or add buffer time',
          reason: 'This took more energy than expected',
          impact: 15,
        });
      }
    });

    // Check balance
    const categoryBreakdown = {
      essential: schedule.timeBlocks.filter(b => b.category === 'essential').length,
      rest: schedule.timeBlocks.filter(b => b.category === 'rest').length,
      optional: schedule.timeBlocks.filter(b => b.category === 'optional').length,
    };

    if (categoryBreakdown.rest < 2) {
      recommendations.push({
        type: 'add',
        target: 'Rest blocks',
        suggestion: 'Add more recovery time',
        reason: 'Schedule lacks adequate rest periods',
        impact: 20,
      });
    }

    // Check for overload
    const highEnergyCount = schedule.timeBlocks.filter(b => b.energyCost > 25).length;
    if (highEnergyCount > 3) {
      recommendations.push({
        type: 'move',
        target: 'High-energy activities',
        suggestion: 'Spread demanding tasks across days',
        reason: 'Too many high-energy items in one day',
        impact: 25,
      });
    }

    // Calculate scores
    const balanceScore = Math.min(100, 
      (categoryBreakdown.rest / (schedule.timeBlocks.length / 4)) * 100
    );
    
    const sustainabilityRating = Math.max(0, 
      100 - (schedule.allocatedCapacity / schedule.capacityBudget - 0.7) * 100
    );

    // Risk areas
    const riskAreas: ScheduleOptimization['riskAreas'] = [];
    if (schedule.remainingBuffer < 10) {
      riskAreas.push({
        time: 'All day',
        risk: 'No energy buffer for unexpected needs',
        mitigation: 'Remove or shorten one optional item',
      });
    }

    return {
      recommendations,
      riskAreas,
      balanceScore: Math.round(balanceScore),
      sustainabilityRating: Math.round(sustainabilityRating),
    };
  }

  async reviewDay(
    schedule: AdaptiveSchedule,
    outcomes: { blockId: string; outcome: 'completed' | 'skipped' | 'modified' }[],
    reflections: { unexpectedEvents: string[]; energyLevel: number; overallFeel: string }
  ): Promise<DayReview> {
    const completed = outcomes.filter(o => o.outcome === 'completed');
    const skipped = outcomes.filter(o => o.outcome === 'skipped');

    const adherenceScore = Math.round((completed.length / outcomes.length) * 100);

    const energyManagement = reflections.energyLevel > 20 
      ? adherenceScore > 80 ? 'excellent' : 'good'
      : reflections.energyLevel > 0 ? 'challenging' : 'overextended';

    const completedItems = completed.map(c => {
      const block = schedule.timeBlocks.find(b => b.id === c.blockId);
      return block?.activity || 'Unknown';
    });

    const skippedItems = skipped.map(s => {
      const block = schedule.timeBlocks.find(b => b.id === s.blockId);
      return block?.activity || 'Unknown';
    });

    const learnings = this.generateLearnings(schedule, outcomes, reflections);
    const tomorrowAdjustments = this.suggestTomorrowAdjustments(learnings, reflections);

    return {
      adherenceScore,
      energyManagement,
      completedItems,
      skippedItems,
      unexpectedEvents: reflections.unexpectedEvents,
      learnings,
      tomorrowAdjustments,
    };
  }

  private generateLearnings(
    schedule: AdaptiveSchedule,
    outcomes: { blockId: string; outcome: string }[],
    reflections: { unexpectedEvents: string[]; energyLevel: number }
  ): string[] {
    const learnings: string[] = [];

    if (reflections.energyLevel < 10) {
      learnings.push('Day was more draining than anticipated');
    }

    const skippedCount = outcomes.filter(o => o.outcome === 'skipped').length;
    if (skippedCount > 2) {
      learnings.push('Schedule may have been too ambitious');
    }

    if (reflections.unexpectedEvents.length > 2) {
      learnings.push('Unexpected demands impacted the day significantly');
    }

    if (skippedCount === 0 && reflections.energyLevel > 30) {
      learnings.push('Great balance - this capacity level works well');
    }

    return learnings;
  }

  private suggestTomorrowAdjustments(learnings: string[], reflections: { energyLevel: number }): string[] {
    const adjustments: string[] = [];

    if (reflections.energyLevel < 20) {
      adjustments.push('Start with a lighter schedule');
      adjustments.push('Prioritize rest and recovery');
    }

    if (learnings.includes('Schedule may have been too ambitious')) {
      adjustments.push('Reduce total scheduled items by 20%');
    }

    adjustments.push('Build in buffer time between activities');

    return adjustments;
  }
}

// ============================================================================
// 16. ACCESSIBLE SELF-CARE - Universal Nurturing Engine
// ============================================================================

export interface AccessibleSelfCareMenu {
  id: string;
  generatedFor: {
    energyLevel: number;
    abilities: string[];
    limitations: string[];
    preferences: string[];
    timeAvailable: number;
  };
  categories: {
    name: string;
    description: string;
    activities: {
      name: string;
      description: string;
      duration: string;
      energyRequired: 'minimal' | 'low' | 'moderate';
      adaptations: string[];
      steps: string[];
      benefits: string[];
      alternatives: string[];
    }[];
  }[];
  quickOptions: { name: string; timeNeeded: string; oneStep: string }[];
  unavailableToday: { activity: string; reason: string; alternative: string }[];
}

export interface SelfCareInventory {
  regularPractices: { activity: string; frequency: string; benefit: string }[];
  aspirationalPractices: { activity: string; barrier: string; adaptation: string }[];
  emergencyKit: { situation: string; goTo: string; backup: string }[];
  sensoryPreferences: {
    soothing: string[];
    energizing: string[];
    grounding: string[];
    avoid: string[];
  };
}

export class AccessibleSelfCareAdvancedService {
  async generatePersonalizedMenu(
    currentState: { energy: number; pain: number; mood: number },
    abilities: {
      mobility: 'full' | 'limited' | 'bed-bound';
      vision: 'full' | 'low' | 'none';
      hearing: 'full' | 'reduced' | 'none';
      cognitive: 'clear' | 'foggy' | 'very-limited';
      hands: 'full' | 'limited' | 'minimal';
    },
    preferences: { favorites: string[]; avoid: string[] },
    timeAvailable: number
  ): Promise<AccessibleSelfCareMenu> {
    const categories: AccessibleSelfCareMenu['categories'] = [];

    // Body care category
    categories.push({
      name: 'Body Comfort',
      description: 'Gentle care for your physical self',
      activities: this.generateBodyCareActivities(abilities, currentState.energy),
    });

    // Sensory category
    categories.push({
      name: 'Sensory Soothing',
      description: 'Comfort through the senses',
      activities: this.generateSensoryActivities(abilities, preferences),
    });

    // Emotional category
    categories.push({
      name: 'Emotional Nurturing',
      description: 'Care for your feelings',
      activities: this.generateEmotionalActivities(abilities, currentState.mood),
    });

    // Rest category
    categories.push({
      name: 'Rest & Restoration',
      description: 'Permission to pause',
      activities: this.generateRestActivities(abilities),
    });

    // Quick options for very low energy
    const quickOptions = this.generateQuickOptions(abilities, currentState.energy);

    // Identify unavailable activities
    const unavailableToday = this.identifyUnavailable(currentState, abilities);

    return {
      id: `menu-${Date.now()}`,
      generatedFor: {
        energyLevel: currentState.energy,
        abilities: Object.entries(abilities).map(([k, v]) => `${k}: ${v}`),
        limitations: this.identifyLimitations(abilities),
        preferences: preferences.favorites,
        timeAvailable,
      },
      categories,
      quickOptions,
      unavailableToday,
    };
  }

  private generateBodyCareActivities(
    abilities: any,
    energy: number
  ): AccessibleSelfCareMenu['categories'][0]['activities'] {
    const activities: AccessibleSelfCareMenu['categories'][0]['activities'] = [];

    // Temperature comfort
    activities.push({
      name: 'Temperature Comfort',
      description: 'Adjust your body temperature for comfort',
      duration: '1-5 minutes',
      energyRequired: 'minimal',
      adaptations: [
        abilities.mobility === 'bed-bound' ? 'Ask someone to adjust blankets' : '',
        abilities.hands === 'limited' ? 'Use easy-grip items' : '',
      ].filter(Boolean),
      steps: [
        'Notice if you feel too warm or cool',
        'Adjust covers, heating pad, or fan',
        'Settle into comfortable temperature',
      ],
      benefits: ['Physical comfort', 'Reduced tension', 'Better rest'],
      alternatives: ['Warm drink', 'Cool cloth on forehead'],
    });

    // Gentle movement if able
    if (abilities.mobility !== 'bed-bound' || energy > 30) {
      activities.push({
        name: 'Micro-Movement',
        description: 'Tiny movements to release tension',
        duration: '2-5 minutes',
        energyRequired: energy < 30 ? 'minimal' : 'low',
        adaptations: [
          abilities.mobility === 'bed-bound' ? 'Do all movements lying down' : '',
          abilities.mobility === 'limited' ? 'Focus on what moves easily' : '',
        ].filter(Boolean),
        steps: [
          'Wiggle fingers and toes',
          'Roll wrists and ankles if able',
          'Gentle head movements if comfortable',
          'Rest after each movement',
        ],
        benefits: ['Circulation', 'Tension release', 'Body awareness'],
        alternatives: ['Just wiggle toes', 'Facial muscle relaxation'],
      });
    }

    // Hydration
    activities.push({
      name: 'Mindful Hydration',
      description: 'Gentle reminder to drink something',
      duration: '1-2 minutes',
      energyRequired: 'minimal',
      adaptations: [
        abilities.hands === 'limited' ? 'Use straw or adapted cup' : '',
        abilities.mobility === 'bed-bound' ? 'Keep drink within reach' : '',
      ].filter(Boolean),
      steps: [
        'Take a few sips of water or preferred drink',
        'Notice the sensation',
        'Thank your body for accepting hydration',
      ],
      benefits: ['Hydration', 'Mindfulness moment', 'Self-care action'],
      alternatives: ['Ice chips', 'Moisturizing lip balm'],
    });

    return activities;
  }

  private generateSensoryActivities(
    abilities: any,
    preferences: { favorites: string[]; avoid: string[] }
  ): AccessibleSelfCareMenu['categories'][0]['activities'] {
    const activities: AccessibleSelfCareMenu['categories'][0]['activities'] = [];

    // Sound-based
    if (abilities.hearing !== 'none') {
      activities.push({
        name: 'Soothing Sounds',
        description: 'Audio comfort',
        duration: 'As needed',
        energyRequired: 'minimal',
        adaptations: [
          abilities.hearing === 'reduced' ? 'Use headphones or increase volume' : '',
        ].filter(Boolean),
        steps: [
          'Choose a calming sound (music, nature, white noise)',
          'Adjust volume to comfortable level',
          'Let sounds wash over you',
        ],
        benefits: ['Nervous system calming', 'Distraction from discomfort', 'Mood lift'],
        alternatives: ['Silence', 'Humming to yourself'],
      });
    }

    // Touch-based
    if (abilities.hands !== 'minimal') {
      activities.push({
        name: 'Comfort Textures',
        description: 'Soothing touch sensations',
        duration: '2-5 minutes',
        energyRequired: 'minimal',
        adaptations: [
          abilities.hands === 'limited' ? 'Use larger, easier-to-hold items' : '',
        ].filter(Boolean),
        steps: [
          'Find a soft texture (blanket, pet, smooth stone)',
          'Gently touch or hold the item',
          'Focus on the pleasant sensation',
        ],
        benefits: ['Grounding', 'Comfort', 'Sensory pleasure'],
        alternatives: ['Feeling fabric of clothing', 'Smooth surfaces nearby'],
      });
    }

    // Scent-based
    activities.push({
      name: 'Gentle Aromatherapy',
      description: 'Comforting scents',
      duration: '1-5 minutes',
      energyRequired: 'minimal',
      adaptations: [
        'Skip if scent-sensitive today',
        abilities.hands === 'minimal' ? 'Ask for help or use already-open scents' : '',
      ],
      steps: [
        'Choose a familiar, comforting scent',
        'Bring it near (don\'t need to apply)',
        'Take gentle breaths',
      ],
      benefits: ['Mood influence', 'Memory/comfort connection', 'Sensory pleasure'],
      alternatives: ['Fresh air', 'Familiar person\'s scent'],
    });

    return activities;
  }

  private generateEmotionalActivities(
    abilities: any,
    mood: number
  ): AccessibleSelfCareMenu['categories'][0]['activities'] {
    const activities: AccessibleSelfCareMenu['categories'][0]['activities'] = [];

    // Self-compassion
    activities.push({
      name: 'Self-Compassion Moment',
      description: 'Kind words for yourself',
      duration: '2-5 minutes',
      energyRequired: 'minimal',
      adaptations: [
        abilities.cognitive === 'foggy' ? 'Use a simple repeated phrase' : '',
        abilities.cognitive === 'very-limited' ? 'Just think "I\'m okay"' : '',
      ].filter(Boolean),
      steps: [
        'Place hand on heart if comfortable',
        'Think or say "This is hard, and I\'m doing my best"',
        'Breathe gently',
        'Repeat as needed',
      ],
      benefits: ['Emotional soothing', 'Reduced self-criticism', 'Comfort'],
      alternatives: ['Think of someone who loves you', 'Imagine being comforted'],
    });

    // Connection
    activities.push({
      name: 'Micro-Connection',
      description: 'Brief touch with others',
      duration: '1-5 minutes',
      energyRequired: 'low',
      adaptations: [
        abilities.cognitive === 'foggy' ? 'Just send an emoji' : '',
        'Skip if interaction feels too hard today',
      ],
      steps: [
        'Think of someone who cares about you',
        'Send a brief message, even just an emoji',
        'Or simply think warmly of them',
      ],
      benefits: ['Connection', 'Feeling remembered', 'Social support'],
      alternatives: ['Look at a photo of loved ones', 'Imagine a hug'],
    });

    // Mood support based on current mood
    if (mood < 40) {
      activities.push({
        name: 'Gentle Validation',
        description: 'Acknowledging how you feel',
        duration: '2 minutes',
        energyRequired: 'minimal',
        adaptations: [],
        steps: [
          'Acknowledge: "I\'m struggling right now"',
          'Validate: "That\'s understandable given what I\'m dealing with"',
          'Offer kindness: "What do I need most right now?"',
        ],
        benefits: ['Emotional processing', 'Self-awareness', 'Permission to feel'],
        alternatives: ['Journal one sentence about feelings', 'Cry if needed'],
      });
    }

    return activities;
  }

  private generateRestActivities(
    abilities: any
  ): AccessibleSelfCareMenu['categories'][0]['activities'] {
    return [
      {
        name: 'Permission Slip',
        description: 'Giving yourself permission to rest',
        duration: '1 minute',
        energyRequired: 'minimal',
        adaptations: [],
        steps: [
          'Say or think: "I have permission to rest"',
          '"Rest is productive for my body"',
          '"I don\'t need to earn rest"',
        ],
        benefits: ['Guilt reduction', 'Mental relief', 'Self-acceptance'],
        alternatives: ['Write permission on paper', 'Ask someone to tell you it\'s okay'],
      },
      {
        name: 'Cozy Cocoon',
        description: 'Creating maximum physical comfort',
        duration: '5-10 minutes',
        energyRequired: 'low',
        adaptations: [
          abilities.mobility === 'bed-bound' ? 'Adjust what you can reach' : '',
        ].filter(Boolean),
        steps: [
          'Gather comfort items (blanket, pillow, etc.)',
          'Arrange yourself in most comfortable position',
          'Adjust temperature, lighting, sound',
          'Settle in and rest',
        ],
        benefits: ['Physical comfort', 'Sense of safety', 'Rest quality'],
        alternatives: ['Just adjust one thing for comfort', 'Eye mask'],
      },
      {
        name: 'Nothing Time',
        description: 'Guilt-free doing nothing',
        duration: 'Any amount',
        energyRequired: 'minimal',
        adaptations: [],
        steps: [
          'Choose to do nothing intentionally',
          'Let your mind wander or rest',
          'No productivity required',
          'Just exist',
        ],
        benefits: ['Deep rest', 'Mental reset', 'Reduced pressure'],
        alternatives: ['Stare at ceiling', 'Watch something mindless'],
      },
    ];
  }

  private generateQuickOptions(
    abilities: any,
    energy: number
  ): AccessibleSelfCareMenu['quickOptions'] {
    const options: AccessibleSelfCareMenu['quickOptions'] = [
      { name: 'One breath', timeNeeded: '10 seconds', oneStep: 'Take one slow, deep breath' },
      { name: 'Water sip', timeNeeded: '30 seconds', oneStep: 'Take a sip of water' },
      { name: 'Kind thought', timeNeeded: '10 seconds', oneStep: 'Think "I\'m doing my best"' },
      { name: 'Toe wiggle', timeNeeded: '10 seconds', oneStep: 'Wiggle your toes' },
      { name: 'Eye rest', timeNeeded: '30 seconds', oneStep: 'Close eyes for 30 seconds' },
    ];

    return options;
  }

  private identifyLimitations(abilities: any): string[] {
    const limitations: string[] = [];
    if (abilities.mobility !== 'full') limitations.push('Limited mobility');
    if (abilities.vision !== 'full') limitations.push('Visual limitations');
    if (abilities.hearing !== 'full') limitations.push('Hearing limitations');
    if (abilities.cognitive !== 'clear') limitations.push('Cognitive challenges');
    if (abilities.hands !== 'full') limitations.push('Hand/arm limitations');
    return limitations;
  }

  private identifyUnavailable(
    state: { energy: number; pain: number },
    abilities: any
  ): AccessibleSelfCareMenu['unavailableToday'] {
    const unavailable: AccessibleSelfCareMenu['unavailableToday'] = [];

    if (state.energy < 20) {
      unavailable.push({
        activity: 'Any moderate-energy activities',
        reason: 'Energy too low today',
        alternative: 'Focus on minimal-energy options only',
      });
    }

    if (abilities.cognitive === 'very-limited') {
      unavailable.push({
        activity: 'Complex multi-step activities',
        reason: 'Cognitive capacity limited today',
        alternative: 'Use simple one-step options',
      });
    }

    return unavailable;
  }
}

// ============================================================================
// 17. TRIGGER DETECTOR - Pattern Sentinel
// ============================================================================

export interface TriggerMap {
  id: string;
  knownTriggers: {
    trigger: string;
    category: 'physical' | 'emotional' | 'environmental' | 'social' | 'temporal';
    severity: 'mild' | 'moderate' | 'severe';
    effects: string[];
    timeToImpact: string;
    frequency: 'rare' | 'occasional' | 'frequent' | 'always';
    lastOccurrence?: number;
  }[];
  suspectedTriggers: {
    trigger: string;
    confidence: number;
    occurrences: number;
    effects: string[];
    needsMoreData: boolean;
  }[];
  protectiveFactors: {
    factor: string;
    strength: 'slight' | 'moderate' | 'strong';
    helps: string[];
  }[];
  patterns: {
    pattern: string;
    description: string;
    recommendation: string;
  }[];
}

export interface TriggerAlert {
  type: 'warning' | 'pattern-detected' | 'exposure-risk';
  trigger: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  preventionStrategies: string[];
}

export interface TriggerAnalysis {
  recentExposures: { trigger: string; when: string; severity: string }[];
  cumulativeLoad: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
  recoveryEstimate: string;
}

export class TriggerDetectorAdvancedService {
  private triggerMap: TriggerMap | null = null;
  private exposureHistory: { trigger: string; timestamp: number; severity: number }[] = [];

  async initializeTriggerMap(
    userInput: {
      knownTriggers: { name: string; category: string; severity: string; effects: string[] }[];
      suspectedTriggers: string[];
      helpfulFactors: string[];
    }
  ): Promise<TriggerMap> {
    this.triggerMap = {
      id: `map-${Date.now()}`,
      knownTriggers: userInput.knownTriggers.map(t => ({
        trigger: t.name,
        category: t.category as TriggerMap['knownTriggers'][0]['category'],
        severity: t.severity as 'mild' | 'moderate' | 'severe',
        effects: t.effects,
        timeToImpact: this.estimateTimeToImpact(t.severity),
        frequency: 'occasional',
      })),
      suspectedTriggers: userInput.suspectedTriggers.map(t => ({
        trigger: t,
        confidence: 0.3,
        occurrences: 0,
        effects: [],
        needsMoreData: true,
      })),
      protectiveFactors: userInput.helpfulFactors.map(f => ({
        factor: f,
        strength: 'moderate' as const,
        helps: ['General wellbeing'],
      })),
      patterns: [],
    };

    return this.triggerMap;
  }

  private estimateTimeToImpact(severity: string): string {
    return severity === 'severe' ? 'Immediate to 2 hours'
      : severity === 'moderate' ? '2-24 hours'
      : '24-48 hours';
  }

  async recordExposure(
    trigger: string,
    severity: number,
    context: { circumstances: string; priorState: string }
  ): Promise<TriggerAlert | null> {
    const exposure = {
      trigger,
      timestamp: Date.now(),
      severity,
    };

    this.exposureHistory.push(exposure);

    // Check if this is a known severe trigger
    const known = this.triggerMap?.knownTriggers.find(
      t => t.trigger.toLowerCase() === trigger.toLowerCase()
    );

    if (known && known.severity === 'severe') {
      return {
        type: 'warning',
        trigger,
        message: `You've been exposed to "${trigger}" - a known severe trigger`,
        urgency: 'high',
        suggestedActions: [
          'Implement protective measures immediately',
          'Reduce other demands if possible',
          'Have emergency coping tools ready',
        ],
        preventionStrategies: known.effects.map(e => `Monitor for: ${e}`),
      };
    }

    // Check cumulative load
    const recentExposures = this.exposureHistory.filter(
      e => Date.now() - e.timestamp < 24 * 60 * 60 * 1000
    );

    const cumulativeLoad = recentExposures.reduce((sum, e) => sum + e.severity, 0);

    if (cumulativeLoad > 50) {
      return {
        type: 'pattern-detected',
        trigger: 'Multiple triggers',
        message: 'High cumulative trigger exposure in last 24 hours',
        urgency: 'medium',
        suggestedActions: [
          'Prioritize rest and recovery',
          'Limit additional exposures',
          'Use protective factors actively',
        ],
        preventionStrategies: ['Clear schedule if possible', 'Increase self-care'],
      };
    }

    return null;
  }

  async analyzeTriggerPatterns(
    symptomsLog: { symptom: string; severity: number; timestamp: number }[],
    activityLog: { activity: string; timestamp: number }[],
    environmentLog: { factor: string; level: number; timestamp: number }[]
  ): Promise<TriggerAnalysis> {
    const recentExposures = this.exposureHistory
      .filter(e => Date.now() - e.timestamp < 48 * 60 * 60 * 1000)
      .map(e => ({
        trigger: e.trigger,
        when: this.formatTimeAgo(e.timestamp),
        severity: e.severity > 70 ? 'high' : e.severity > 40 ? 'moderate' : 'low',
      }));

    const cumulativeLoad = this.exposureHistory
      .filter(e => Date.now() - e.timestamp < 24 * 60 * 60 * 1000)
      .reduce((sum, e) => sum + e.severity, 0);

    const riskLevel = cumulativeLoad > 80 ? 'critical'
      : cumulativeLoad > 60 ? 'high'
      : cumulativeLoad > 40 ? 'moderate'
      : 'low';

    // Generate recommendations
    const recommendations = this.generateTriggerRecommendations(riskLevel, recentExposures);

    // Estimate recovery
    const recoveryEstimate = cumulativeLoad > 60 
      ? '24-48 hours of reduced activity recommended'
      : cumulativeLoad > 40 
      ? '12-24 hours of rest helpful'
      : 'Normal activity with mindfulness';

    // Look for patterns in the data
    this.updatePatterns(symptomsLog, activityLog, environmentLog);

    return {
      recentExposures,
      cumulativeLoad: Math.round(cumulativeLoad),
      riskLevel,
      recommendations,
      recoveryEstimate,
    };
  }

  private formatTimeAgo(timestamp: number): string {
    const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (hours < 1) return 'Less than an hour ago';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  }

  private generateTriggerRecommendations(
    riskLevel: string,
    exposures: { trigger: string; severity: string }[]
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Prioritize rest and recovery immediately');
      recommendations.push('Cancel or postpone non-essential activities');
      recommendations.push('Increase protective factors');
      recommendations.push('Have support person on standby');
    } else if (riskLevel === 'moderate') {
      recommendations.push('Monitor symptoms closely');
      recommendations.push('Reduce additional trigger exposures');
      recommendations.push('Implement self-care proactively');
    } else {
      recommendations.push('Continue normal activities with awareness');
      recommendations.push('Note any delayed reactions');
    }

    // Specific recommendations based on triggers
    exposures.forEach(exp => {
      if (exp.severity === 'high') {
        recommendations.push(`Specific attention to "${exp.trigger}" effects`);
      }
    });

    return recommendations.slice(0, 5);
  }

  private updatePatterns(
    symptoms: { symptom: string; severity: number; timestamp: number }[],
    activities: { activity: string; timestamp: number }[],
    environment: { factor: string; level: number; timestamp: number }[]
  ): void {
    if (!this.triggerMap) return;

    // Look for activity-symptom correlations
    symptoms.forEach(symptom => {
      const priorActivities = activities.filter(a => 
        symptom.timestamp - a.timestamp > 0 &&
        symptom.timestamp - a.timestamp < 24 * 60 * 60 * 1000
      );

      priorActivities.forEach(activity => {
        const suspected = this.triggerMap!.suspectedTriggers.find(
          t => t.trigger.toLowerCase() === activity.activity.toLowerCase()
        );

        if (suspected) {
          suspected.occurrences++;
          suspected.confidence = Math.min(0.9, suspected.confidence + 0.1);
          if (suspected.occurrences >= 3) {
            suspected.needsMoreData = false;
          }
        }
      });
    });

    // Update patterns array
    const patterns: TriggerMap['patterns'] = [];

    // Look for time-based patterns
    const symptomsByHour = new Map<number, number>();
    symptoms.forEach(s => {
      const hour = new Date(s.timestamp).getHours();
      symptomsByHour.set(hour, (symptomsByHour.get(hour) || 0) + s.severity);
    });

    let worstHour = 0;
    let worstSeverity = 0;
    symptomsByHour.forEach((severity, hour) => {
      if (severity > worstSeverity) {
        worstSeverity = severity;
        worstHour = hour;
      }
    });

    if (worstSeverity > 0) {
      patterns.push({
        pattern: 'Time-based vulnerability',
        description: `Symptoms tend to be worse around ${worstHour}:00`,
        recommendation: `Plan extra rest or protection around ${worstHour}:00`,
      });
    }

    this.triggerMap.patterns = patterns;
  }
}

// ============================================================================
// 18. HARM REDUCTION GUIDE - Safety Navigation Engine
// ============================================================================

export interface HarmReductionPlan {
  id: string;
  riskArea: string;
  currentLevel: 'low' | 'moderate' | 'high' | 'crisis';
  strategies: {
    strategy: string;
    category: 'prevention' | 'harm-minimization' | 'recovery';
    difficulty: 'easy' | 'moderate' | 'challenging';
    effectiveness: number;
    personalNotes?: string;
  }[];
  safetyMeasures: {
    measure: string;
    inPlace: boolean;
    priority: 'essential' | 'recommended' | 'helpful';
  }[];
  supportResources: {
    name: string;
    type: 'hotline' | 'person' | 'place' | 'tool';
    contact: string;
    whenToUse: string;
  }[];
  progressMarkers: {
    marker: string;
    achieved: boolean;
    date?: number;
  }[];
}

export interface SafetyCheck {
  overallSafety: 'safe' | 'cautious' | 'concerning' | 'urgent';
  currentRisks: { risk: string; level: number; mitigation: string }[];
  protectiveFactors: { factor: string; strength: number }[];
  recommendations: string[];
  needsProfessionalSupport: boolean;
  crisisResources: { name: string; contact: string }[];
}

export interface CopingPlan {
  situation: string;
  urgeLevel: number;
  immediateActions: string[];
  delayTactics: string[];
  alternatives: string[];
  supportToCall: string[];
  aftercare: string[];
}

export class HarmReductionAdvancedService {
  async createHarmReductionPlan(
    riskArea: string,
    currentBehaviors: string[],
    goals: string[],
    availableSupport: string[],
    barriers: string[]
  ): Promise<HarmReductionPlan> {
    // Assess current level
    const currentLevel = this.assessRiskLevel(currentBehaviors);

    // Generate strategies based on risk area and level
    const strategies = this.generateStrategies(riskArea, currentLevel, barriers);

    // Identify safety measures
    const safetyMeasures = this.identifySafetyMeasures(riskArea, currentLevel);

    // Compile support resources
    const supportResources = this.compileSupportResources(riskArea, availableSupport);

    // Define progress markers
    const progressMarkers = goals.map(goal => ({
      marker: goal,
      achieved: false,
    }));

    return {
      id: `plan-${Date.now()}`,
      riskArea,
      currentLevel,
      strategies,
      safetyMeasures,
      supportResources,
      progressMarkers,
    };
  }

  private assessRiskLevel(behaviors: string[]): HarmReductionPlan['currentLevel'] {
    const highRiskIndicators = ['daily', 'increasing', 'unable to stop', 'hiding'];
    const moderateIndicators = ['weekly', 'sometimes', 'trying to reduce'];

    const hasHighRisk = behaviors.some(b => 
      highRiskIndicators.some(i => b.toLowerCase().includes(i))
    );
    const hasModerateRisk = behaviors.some(b => 
      moderateIndicators.some(i => b.toLowerCase().includes(i))
    );

    if (hasHighRisk) return 'high';
    if (hasModerateRisk) return 'moderate';
    return 'low';
  }

  private generateStrategies(
    riskArea: string,
    level: string,
    barriers: string[]
  ): HarmReductionPlan['strategies'] {
    const strategies: HarmReductionPlan['strategies'] = [];

    // Prevention strategies
    strategies.push({
      strategy: 'Identify and avoid known triggers',
      category: 'prevention',
      difficulty: 'moderate',
      effectiveness: 0.7,
    });

    strategies.push({
      strategy: 'Build routine that reduces vulnerability',
      category: 'prevention',
      difficulty: 'challenging',
      effectiveness: 0.8,
    });

    // Harm minimization
    strategies.push({
      strategy: 'If urge is strong, use safer alternatives',
      category: 'harm-minimization',
      difficulty: 'moderate',
      effectiveness: 0.6,
    });

    strategies.push({
      strategy: 'Delay tactics (wait 10 minutes, then reassess)',
      category: 'harm-minimization',
      difficulty: 'easy',
      effectiveness: 0.5,
    });

    strategies.push({
      strategy: 'Reduce frequency/intensity rather than stopping completely',
      category: 'harm-minimization',
      difficulty: 'moderate',
      effectiveness: 0.7,
    });

    // Recovery strategies
    strategies.push({
      strategy: 'Self-compassion after slip (not spiral)',
      category: 'recovery',
      difficulty: 'moderate',
      effectiveness: 0.8,
    });

    strategies.push({
      strategy: 'Identify what led up to it, plan differently',
      category: 'recovery',
      difficulty: 'moderate',
      effectiveness: 0.7,
    });

    // Adjust for barriers
    if (barriers.includes('isolation')) {
      strategies.push({
        strategy: 'Build connection even in small ways',
        category: 'prevention',
        difficulty: 'moderate',
        effectiveness: 0.6,
      });
    }

    return strategies;
  }

  private identifySafetyMeasures(
    riskArea: string,
    level: string
  ): HarmReductionPlan['safetyMeasures'] {
    const measures: HarmReductionPlan['safetyMeasures'] = [];

    // Universal measures
    measures.push({
      measure: 'Crisis hotline number saved in phone',
      inPlace: false,
      priority: 'essential',
    });

    measures.push({
      measure: 'At least one person knows what you\'re working on',
      inPlace: false,
      priority: 'essential',
    });

    measures.push({
      measure: 'Safe environment modifications',
      inPlace: false,
      priority: level === 'high' ? 'essential' : 'recommended',
    });

    measures.push({
      measure: 'Emergency coping kit assembled',
      inPlace: false,
      priority: 'recommended',
    });

    measures.push({
      measure: 'Regular check-ins scheduled with support person',
      inPlace: false,
      priority: 'recommended',
    });

    measures.push({
      measure: 'Healthy alternatives readily available',
      inPlace: false,
      priority: 'helpful',
    });

    return measures;
  }

  private compileSupportResources(
    riskArea: string,
    available: string[]
  ): HarmReductionPlan['supportResources'] {
    const resources: HarmReductionPlan['supportResources'] = [];

    // Generic crisis resources
    resources.push({
      name: 'National Crisis Hotline',
      type: 'hotline',
      contact: '988',
      whenToUse: 'When feeling unsafe or in crisis',
    });

    resources.push({
      name: 'Crisis Text Line',
      type: 'hotline',
      contact: 'Text HOME to 741741',
      whenToUse: 'When you prefer texting over calling',
    });

    // Add personal resources
    available.forEach(support => {
      resources.push({
        name: support,
        type: 'person',
        contact: '[Add contact]',
        whenToUse: 'When you need personal support',
      });
    });

    return resources;
  }

  async performSafetyCheck(
    currentState: { mood: number; urges: number; hopelessness: number; isolation: number },
    recentEvents: string[],
    protectiveFactors: string[]
  ): Promise<SafetyCheck> {
    // Calculate risk factors
    const risks: SafetyCheck['currentRisks'] = [];

    if (currentState.mood < 30) {
      risks.push({
        risk: 'Low mood',
        level: 100 - currentState.mood,
        mitigation: 'Reach out to support, use mood-lifting activities',
      });
    }

    if (currentState.urges > 50) {
      risks.push({
        risk: 'Elevated urges',
        level: currentState.urges,
        mitigation: 'Use delay tactics, contact support',
      });
    }

    if (currentState.hopelessness > 60) {
      risks.push({
        risk: 'Hopelessness',
        level: currentState.hopelessness,
        mitigation: 'Remember this feeling is temporary, seek support',
      });
    }

    if (currentState.isolation > 70) {
      risks.push({
        risk: 'Isolation',
        level: currentState.isolation,
        mitigation: 'Reach out even briefly, join online community',
      });
    }

    // Calculate protective factors
    const protectiveStrengths = protectiveFactors.map(f => ({
      factor: f,
      strength: 50 + Math.random() * 30, // Would be calculated based on actual data
    }));

    // Determine overall safety
    const avgRisk = risks.length > 0 
      ? risks.reduce((sum, r) => sum + r.level, 0) / risks.length 
      : 0;
    const avgProtection = protectiveStrengths.length > 0
      ? protectiveStrengths.reduce((sum, p) => sum + p.strength, 0) / protectiveStrengths.length
      : 0;

    const safetyScore = avgProtection - avgRisk;

    const overallSafety: SafetyCheck['overallSafety'] = 
      currentState.urges > 80 || currentState.hopelessness > 80 ? 'urgent'
      : safetyScore < -30 ? 'concerning'
      : safetyScore < 10 ? 'cautious'
      : 'safe';

    // Generate recommendations
    const recommendations = this.generateSafetyRecommendations(overallSafety, risks);

    return {
      overallSafety,
      currentRisks: risks,
      protectiveFactors: protectiveStrengths,
      recommendations,
      needsProfessionalSupport: overallSafety === 'urgent' || overallSafety === 'concerning',
      crisisResources: [
        { name: 'National Crisis Hotline', contact: '988' },
        { name: 'Crisis Text Line', contact: 'Text HOME to 741741' },
      ],
    };
  }

  private generateSafetyRecommendations(
    safety: SafetyCheck['overallSafety'],
    risks: SafetyCheck['currentRisks']
  ): string[] {
    const recommendations: string[] = [];

    if (safety === 'urgent') {
      recommendations.push('Please reach out to a crisis line or trusted person now');
      recommendations.push('You don\'t have to face this alone');
      recommendations.push('Focus only on getting through the next hour safely');
    } else if (safety === 'concerning') {
      recommendations.push('Consider reaching out to your support network');
      recommendations.push('Use your coping strategies actively');
      recommendations.push('Remove access to means of harm if possible');
      recommendations.push('Don\'t be alone if you can help it');
    } else if (safety === 'cautious') {
      recommendations.push('Monitor how you\'re feeling');
      recommendations.push('Use preventive self-care');
      recommendations.push('Have support numbers ready just in case');
    } else {
      recommendations.push('Continue your protective practices');
      recommendations.push('Notice what\'s working and do more of it');
    }

    return recommendations;
  }

  async createCopingPlan(
    situation: string,
    urgeLevel: number,
    availableSupports: string[]
  ): Promise<CopingPlan> {
    return {
      situation,
      urgeLevel,
      immediateActions: [
        'Take 3 slow, deep breaths',
        'Move to a different room if possible',
        'Hold ice cubes or take a cold drink',
        'Name 5 things you can see',
        'Call someone from your support list',
      ],
      delayTactics: [
        'Wait 10 minutes before acting on urge',
        'Do something with your hands',
        'Write down how you\'re feeling',
        'Take a shower or bath',
        'Go for a walk if safe to do so',
      ],
      alternatives: [
        'Exercise or movement',
        'Creative expression',
        'Sensory experiences (smell, taste, touch)',
        'Helping someone else',
        'Watching something comforting',
      ],
      supportToCall: availableSupports.length > 0 ? availableSupports : [
        'Crisis line: 988',
        'Crisis Text: Text HOME to 741741',
      ],
      aftercare: [
        'Be gentle with yourself',
        'Rest and hydrate',
        'Journal about what helped',
        'Plan for if urges return',
        'Acknowledge your strength in getting through',
      ],
    };
  }
}

// ============================================================================
// Export all services
// ============================================================================

export const adaptiveDailyPlannerAdvanced = new AdaptiveDailyPlannerAdvancedService();
export const accessibleSelfCareAdvanced = new AccessibleSelfCareAdvancedService();
export const triggerDetectorAdvanced = new TriggerDetectorAdvancedService();
export const harmReductionAdvanced = new HarmReductionAdvancedService();
