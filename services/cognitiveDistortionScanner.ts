/**
 * Cognitive Distortion Scanner
 * 
 * Real-time thought pattern recognition, distortion fingerprinting, counter-thought
 * generation, Socratic questioning, and belief decay tracking.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logError } from '../utils/errorLogger';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type CognitiveDistortionType =
  | 'all_or_nothing' // Black-and-white thinking
  | 'overgeneralization' // One event = always/never
  | 'mental_filter' // Focusing only on negatives
  | 'disqualifying_positive' // Rejecting positive experiences
  | 'jumping_to_conclusions' // Mind reading or fortune telling
  | 'magnification' // Catastrophizing or minimizing
  | 'emotional_reasoning' // "I feel it, so it must be true"
  | 'should_statements' // Rigid rules about how things "should" be
  | 'labeling' // Attaching global labels to self/others
  | 'personalization' // Taking blame for things outside your control
  | 'comparison' // Measuring self against others
  | 'what_if' // Endless hypothetical worrying
  | 'fortune_telling' // Predicting negative outcomes without evidence
  | 'mind_reading'; // Assuming you know what others think

export interface ThoughtEntry {
  id: string;
  timestamp: number;
  rawThought: string;
  situation?: string;
  emotion?: string;
  emotionIntensity?: 1 | 2 | 3 | 4 | 5;
  detectedDistortions: DistortionMatch[];
  counterThoughts: string[];
  socraticQuestions: string[];
  believabilityBefore: number; // 0-100
  believabilityAfter?: number; // 0-100
  helpful: boolean | null;
}

export interface DistortionMatch {
  type: CognitiveDistortionType;
  confidence: number; // 0-100
  keywords: string[];
  explanation: string;
}

export interface ThoughtPattern {
  distortionType: CognitiveDistortionType;
  frequency: number;
  averageIntensity: number;
  commonTriggers: string[];
  timePattern?: 'morning' | 'afternoon' | 'evening' | 'night' | 'none';
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface BeliefDecayRecord {
  thoughtId: string;
  originalThought: string;
  initialBelievability: number;
  currentBelievability: number;
  decayRate: number; // Percentage decrease per day
  daysSinceEntry: number;
  milestones: Array<{ day: number; believability: number }>;
}

export interface SocraticDialogue {
  thoughtId: string;
  rounds: SocraticRound[];
  finalInsight?: string;
  believabilityShift: number;
}

export interface SocraticRound {
  questionType: 'evidence' | 'alternative' | 'perspective' | 'impact' | 'reframe';
  question: string;
  userResponse?: string;
  timestamp: number;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  THOUGHTS: 'cognitiveScanner:thoughts:v1',
  PATTERNS: 'cognitiveScanner:patterns:v1',
  DIALOGUES: 'cognitiveScanner:dialogues:v1',
} as const;

const DISTORTION_PATTERNS: Record<
  CognitiveDistortionType,
  { keywords: string[]; examples: string[]; questions: string[] }
> = {
  all_or_nothing: {
    keywords: ['always', 'never', 'every', 'none', 'completely', 'totally', 'entirely'],
    examples: [
      'I always fail at everything',
      'Nobody ever listens to me',
      'This is completely ruined',
    ],
    questions: [
      'Is there any evidence of times when this wasn\'t true?',
      'Are there shades of gray between the extremes?',
      'What percentage of the time is this actually true?',
    ],
  },
  overgeneralization: {
    keywords: ['always', 'never', 'everyone', 'nobody', 'typical', 'pattern'],
    examples: [
      'This always happens to me',
      'Nobody likes me',
      'I never succeed',
    ],
    questions: [
      'How many times has this actually happened?',
      'Can you think of exceptions to this rule?',
      'What evidence do you have for "always" or "never"?',
    ],
  },
  mental_filter: {
    keywords: ['only', 'just', 'except', 'but'],
    examples: [
      'The presentation went well, but I stumbled over one word',
      'I only got one thing wrong on the test',
    ],
    questions: [
      'What positive aspects are you filtering out?',
      'If a friend told you this, what would you say?',
      'What else happened besides the negative part?',
    ],
  },
  disqualifying_positive: {
    keywords: ['doesn\'t count', 'luck', 'anyone could', 'doesn\'t matter'],
    examples: [
      'That compliment doesn\'t count - they were just being nice',
      'I got the job, but anyone could have done it',
    ],
    questions: [
      'Why doesn\'t this positive count?',
      'Would you dismiss a friend\'s achievement this way?',
      'What would it take for a positive to count?',
    ],
  },
  jumping_to_conclusions: {
    keywords: ['probably', 'must', 'obviously', 'clearly', 'definitely'],
    examples: [
      'They didn\'t reply, so they must hate me',
      'I\'ll definitely fail the interview',
    ],
    questions: [
      'What evidence do you have for this conclusion?',
      'What are alternative explanations?',
      'How would you test if this is true?',
    ],
  },
  magnification: {
    keywords: ['disaster', 'terrible', 'awful', 'catastrophe', 'unbearable', 'worst'],
    examples: [
      'This is a complete disaster',
      'I made a mistake - this is the worst thing ever',
    ],
    questions: [
      'On a scale of 1-100, how bad is this really?',
      'Will this matter in a year?',
      'What\'s the worst that could realistically happen?',
    ],
  },
  emotional_reasoning: {
    keywords: ['feel like', 'feel that', 'sense that'],
    examples: [
      'I feel like a failure, so I must be one',
      'I feel guilty, so I must have done something wrong',
    ],
    questions: [
      'Is there evidence beyond your feelings?',
      'Can feelings be inaccurate?',
      'What would the facts say regardless of how you feel?',
    ],
  },
  should_statements: {
    keywords: ['should', 'must', 'ought to', 'have to', 'need to'],
    examples: [
      'I should be able to handle this',
      'People must always be on time',
    ],
    questions: [
      'Who decided this "should" rule?',
      'What happens if you replace "should" with "prefer"?',
      'Is this expectation realistic?',
    ],
  },
  labeling: {
    keywords: ['I am a', 'they are', 'I\'m such a'],
    examples: [
      'I\'m such a loser',
      'They\'re idiots',
      'I\'m a failure',
    ],
    questions: [
      'Does one action define your entire identity?',
      'What behaviors led to this label?',
      'Can you describe the situation without labels?',
    ],
  },
  personalization: {
    keywords: ['my fault', 'I caused', 'because of me'],
    examples: [
      'My friend is upset - it must be my fault',
      'The project failed because I wasn\'t good enough',
    ],
    questions: [
      'What percentage of this was actually in your control?',
      'What other factors contributed?',
      'Would you blame someone else in your position?',
    ],
  },
  comparison: {
    keywords: ['better than', 'worse than', 'compared to', 'unlike'],
    examples: [
      'Everyone else is doing better than me',
      'Compared to them, I\'m worthless',
    ],
    questions: [
      'Are you comparing your insides to their outsides?',
      'What purpose does this comparison serve?',
      'What are your own personal strengths?',
    ],
  },
  what_if: {
    keywords: ['what if', 'suppose', 'imagine if'],
    examples: [
      'What if I fail?',
      'What if everyone thinks I\'m stupid?',
    ],
    questions: [
      'What evidence do you have this will happen?',
      'How many of your "what ifs" have actually come true?',
      'What if things go well?',
    ],
  },
  fortune_telling: {
    keywords: ['will', 'going to', 'won\'t', 'definitely will'],
    examples: [
      'I\'m going to fail',
      'This will never work',
      'They definitely won\'t like me',
    ],
    questions: [
      'Can you predict the future?',
      'What evidence do you have for this prediction?',
      'What are other possible outcomes?',
    ],
  },
  mind_reading: {
    keywords: ['they think', 'they must think', 'I know they'],
    examples: [
      'I know they think I\'m annoying',
      'They must think I\'m incompetent',
    ],
    questions: [
      'What evidence do you have for what they\'re thinking?',
      'Have you asked them directly?',
      'What else might they be thinking?',
    ],
  },
};

// ============================================================================
// Cognitive Distortion Scanner Manager
// ============================================================================

class CognitiveDistortionScannerManager {
  private static instance: CognitiveDistortionScannerManager;
  private thoughts: ThoughtEntry[] = [];
  private patterns: Map<CognitiveDistortionType, ThoughtPattern> = new Map();
  private dialogues: Map<string, SocraticDialogue> = new Map();

  private constructor() {
    this.loadData();
  }

  static getInstance(): CognitiveDistortionScannerManager {
    if (!CognitiveDistortionScannerManager.instance) {
      CognitiveDistortionScannerManager.instance = new CognitiveDistortionScannerManager();
    }
    return CognitiveDistortionScannerManager.instance;
  }

  // ============================================================================
  // Data Management
  // ============================================================================

  private async loadData(): Promise<void> {
    try {
      const [thoughtsStr, patternsStr, dialoguesStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THOUGHTS),
        AsyncStorage.getItem(STORAGE_KEYS.PATTERNS),
        AsyncStorage.getItem(STORAGE_KEYS.DIALOGUES),
      ]);

      if (thoughtsStr) this.thoughts = JSON.parse(thoughtsStr);
      
      if (patternsStr) {
        const patternsArray: ThoughtPattern[] = JSON.parse(patternsStr);
        this.patterns = new Map(patternsArray.map(p => [p.distortionType, p]));
      }

      if (dialoguesStr) {
        const dialoguesArray: SocraticDialogue[] = JSON.parse(dialoguesStr);
        this.dialogues = new Map(dialoguesArray.map(d => [d.thoughtId, d]));
      }

      // Update patterns on load
      await this.updatePatterns();
    } catch (err) {
      logError('Failed to load cognitive scanner data', err);
    }
  }

  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.THOUGHTS, JSON.stringify(this.thoughts.slice(-1000))),
        AsyncStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(Array.from(this.patterns.values()))),
        AsyncStorage.setItem(STORAGE_KEYS.DIALOGUES, JSON.stringify(Array.from(this.dialogues.values()))),
      ]);
    } catch (err) {
      logError('Failed to save cognitive scanner data', err);
    }
  }

  // ============================================================================
  // Thought Scanning
  // ============================================================================

  async scanThought(
    thought: string,
    situation?: string,
    emotion?: string,
    emotionIntensity?: 1 | 2 | 3 | 4 | 5
  ): Promise<ThoughtEntry> {
    const detectedDistortions = this.detectDistortions(thought);
    const counterThoughts = this.generateCounterThoughts(thought, detectedDistortions);
    const socraticQuestions = this.generateSocraticQuestions(detectedDistortions);

    const entry: ThoughtEntry = {
      id: `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      rawThought: thought,
      situation,
      emotion,
      emotionIntensity,
      detectedDistortions,
      counterThoughts,
      socraticQuestions,
      believabilityBefore: 100, // Default to fully believed
      helpful: null,
    };

    this.thoughts.push(entry);
    await this.updatePatterns();
    await this.saveData();

    return entry;
  }

  private detectDistortions(thought: string): DistortionMatch[] {
    const matches: DistortionMatch[] = [];
    const lowerThought = thought.toLowerCase();

    Object.entries(DISTORTION_PATTERNS).forEach(([type, config]) => {
      const matchedKeywords = config.keywords.filter(kw => 
        lowerThought.includes(kw.toLowerCase())
      );

      if (matchedKeywords.length > 0) {
        const confidence = Math.min(100, matchedKeywords.length * 30);
        matches.push({
          type: type as CognitiveDistortionType,
          confidence,
          keywords: matchedKeywords,
          explanation: this.getDistortionExplanation(type as CognitiveDistortionType),
        });
      }
    });

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  private getDistortionExplanation(type: CognitiveDistortionType): string {
    const explanations: Record<CognitiveDistortionType, string> = {
      all_or_nothing: 'Viewing things in absolute, black-and-white categories',
      overgeneralization: 'Viewing a single negative event as a never-ending pattern',
      mental_filter: 'Focusing exclusively on negatives while filtering out positives',
      disqualifying_positive: 'Rejecting positive experiences by insisting they don\'t count',
      jumping_to_conclusions: 'Making negative interpretations without facts',
      magnification: 'Exaggerating the importance of problems or minimizing strengths',
      emotional_reasoning: 'Assuming feelings reflect reality',
      should_statements: 'Criticizing yourself or others with "shoulds" or "musts"',
      labeling: 'Attaching negative labels to yourself or others',
      personalization: 'Blaming yourself for events outside your control',
      comparison: 'Measuring yourself against others and feeling inferior',
      what_if: 'Endlessly worrying about hypothetical negative outcomes',
      fortune_telling: 'Predicting the future will be negative',
      mind_reading: 'Assuming you know what others are thinking',
    };

    return explanations[type];
  }

  private generateCounterThoughts(thought: string, distortions: DistortionMatch[]): string[] {
    if (distortions.length === 0) return [];

    const counters: string[] = [];
    const primaryDistortion = distortions[0];

    // Generate 3-5 counter-thoughts based on the primary distortion
    switch (primaryDistortion.type) {
      case 'all_or_nothing':
        counters.push(
          'What middle ground exists between these extremes?',
          'Can I describe this in shades of gray instead of black-and-white?',
          'What percentage of the time is this actually true?'
        );
        break;

      case 'overgeneralization':
        counters.push(
          'This happened once - it\'s not a universal pattern',
          'What evidence contradicts this "always/never" statement?',
          'Can I restate this as a specific event rather than a pattern?'
        );
        break;

      case 'mental_filter':
        counters.push(
          'What positives am I ignoring?',
          'If a friend described this situation, what else would I notice?',
          'What went right that I\'m filtering out?'
        );
        break;

      case 'jumping_to_conclusions':
      case 'fortune_telling':
      case 'mind_reading':
        counters.push(
          'What evidence supports this conclusion?',
          'What are three alternative explanations?',
          'How could I test whether this is actually true?'
        );
        break;

      case 'magnification':
        counters.push(
          'On a scale of 1-100, how bad is this really?',
          'Will this matter in 5 years?',
          'What\'s the realistic worst-case scenario?'
        );
        break;

      case 'emotional_reasoning':
        counters.push(
          'Feelings aren\'t facts - what do the facts say?',
          'What would I tell a friend who felt this way?',
          'What evidence exists beyond my emotions?'
        );
        break;

      case 'should_statements':
        counters.push(
          'Replace "should" with "I prefer" - does it still feel true?',
          'Who decided this rule?',
          'What would happen if I didn\'t follow this "should"?'
        );
        break;

      case 'labeling':
        counters.push(
          'This is a behavior, not my identity',
          'Can I describe what I did without labeling who I am?',
          'Does one action define my entire self?'
        );
        break;

      case 'personalization':
        counters.push(
          'What percentage of this was actually in my control?',
          'What other factors contributed?',
          'Am I taking responsibility for things outside my influence?'
        );
        break;

      default:
        counters.push(
          'What evidence supports this thought?',
          'What would I tell a friend thinking this?',
          'Is there another way to view this situation?'
        );
    }

    return counters;
  }

  private generateSocraticQuestions(distortions: DistortionMatch[]): string[] {
    if (distortions.length === 0) return [];

    const questions: string[] = [];
    distortions.slice(0, 2).forEach(distortion => {
      const config = DISTORTION_PATTERNS[distortion.type];
      questions.push(...config.questions.slice(0, 2));
    });

    return questions;
  }

  // ============================================================================
  // Belief Decay Tracking
  // ============================================================================

  async updateBelievability(thoughtId: string, newBelievability: number): Promise<void> {
    const thought = this.thoughts.find(t => t.id === thoughtId);
    if (!thought) return;

    thought.believabilityAfter = newBelievability;
    await this.saveData();
  }

  getBeliefDecay(thoughtId: string): BeliefDecayRecord | null {
    const thought = this.thoughts.find(t => t.id === thoughtId);
    if (!thought || thought.believabilityAfter === undefined) return null;

    const daysSinceEntry = (Date.now() - thought.timestamp) / (1000 * 60 * 60 * 24);
    const totalDecay = thought.believabilityBefore - thought.believabilityAfter;
    const decayRate = daysSinceEntry > 0 ? totalDecay / daysSinceEntry : 0;

    // Generate milestones (weekly checks)
    const milestones: Array<{ day: number; believability: number }> = [];
    for (let day = 7; day <= daysSinceEntry; day += 7) {
      const projectedBelievability = Math.max(
        0,
        thought.believabilityBefore - decayRate * day
      );
      milestones.push({ day, believability: Math.round(projectedBelievability) });
    }

    return {
      thoughtId,
      originalThought: thought.rawThought,
      initialBelievability: thought.believabilityBefore,
      currentBelievability: thought.believabilityAfter,
      decayRate: Math.round(decayRate * 10) / 10,
      daysSinceEntry: Math.round(daysSinceEntry),
      milestones,
    };
  }

  getAllDecayRecords(): BeliefDecayRecord[] {
    return this.thoughts
      .filter(t => t.believabilityAfter !== undefined)
      .map(t => this.getBeliefDecay(t.id))
      .filter((r): r is BeliefDecayRecord => r !== null)
      .sort((a, b) => b.decayRate - a.decayRate); // Highest decay first
  }

  // ============================================================================
  // Socratic Dialogue
  // ============================================================================

  async startSocraticDialogue(thoughtId: string): Promise<SocraticDialogue> {
    const thought = this.thoughts.find(t => t.id === thoughtId);
    if (!thought) throw new Error('Thought not found');

    const dialogue: SocraticDialogue = {
      thoughtId,
      rounds: [],
      believabilityShift: 0,
    };

    // Start with evidence question
    const firstQuestion: SocraticRound = {
      questionType: 'evidence',
      question: 'What evidence do you have that supports this thought?',
      timestamp: Date.now(),
    };

    dialogue.rounds.push(firstQuestion);
    this.dialogues.set(thoughtId, dialogue);
    await this.saveData();

    return dialogue;
  }

  async respondToSocraticQuestion(
    thoughtId: string,
    response: string
  ): Promise<SocraticRound | null> {
    const dialogue = this.dialogues.get(thoughtId);
    if (!dialogue) return null;

    const lastRound = dialogue.rounds[dialogue.rounds.length - 1];
    lastRound.userResponse = response;

    // Generate next question based on previous type
    const nextType = this.getNextQuestionType(lastRound.questionType);
    const nextQuestion = this.generateNextSocraticQuestion(nextType, response);

    if (nextQuestion) {
      const newRound: SocraticRound = {
        questionType: nextType,
        question: nextQuestion,
        timestamp: Date.now(),
      };
      dialogue.rounds.push(newRound);
      await this.saveData();
      return newRound;
    }

    return null;
  }

  private getNextQuestionType(current: SocraticRound['questionType']): SocraticRound['questionType'] {
    const sequence: SocraticRound['questionType'][] = [
      'evidence',
      'alternative',
      'perspective',
      'impact',
      'reframe',
    ];
    const currentIndex = sequence.indexOf(current);
    return sequence[Math.min(currentIndex + 1, sequence.length - 1)];
  }

  private generateNextSocraticQuestion(
    type: SocraticRound['questionType'],
    previousResponse: string
  ): string | null {
    const questions: Record<SocraticRound['questionType'], string[]> = {
      evidence: ['What evidence supports this thought?'],
      alternative: [
        'What are some alternative explanations for this situation?',
        'How might someone else interpret this differently?',
      ],
      perspective: [
        'If a good friend had this thought, what would you tell them?',
        'How might you view this situation in 5 years?',
      ],
      impact: [
        'How is believing this thought affecting your behavior?',
        'What would change if you didn\'t believe this thought?',
      ],
      reframe: [
        'Can you restate this thought in a more balanced way?',
        'What\'s a more helpful way to think about this?',
      ],
    };

    const options = questions[type];
    return options[Math.floor(Math.random() * options.length)];
  }

  getSocraticDialogue(thoughtId: string): SocraticDialogue | null {
    return this.dialogues.get(thoughtId) || null;
  }

  // ============================================================================
  // Pattern Analysis
  // ============================================================================

  private async updatePatterns(): Promise<void> {
    // Analyze last 90 days of thoughts
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const recentThoughts = this.thoughts.filter(t => t.timestamp > cutoff);

    // Count distortions
    const distortionCounts = new Map<CognitiveDistortionType, number>();
    const distortionIntensities = new Map<CognitiveDistortionType, number[]>();
    const distortionTriggers = new Map<CognitiveDistortionType, Set<string>>();
    const distortionTimes = new Map<CognitiveDistortionType, number[]>();

    recentThoughts.forEach(thought => {
      thought.detectedDistortions.forEach(distortion => {
        // Count
        distortionCounts.set(
          distortion.type,
          (distortionCounts.get(distortion.type) || 0) + 1
        );

        // Intensity
        if (thought.emotionIntensity) {
          if (!distortionIntensities.has(distortion.type)) {
            distortionIntensities.set(distortion.type, []);
          }
          distortionIntensities.get(distortion.type)!.push(thought.emotionIntensity);
        }

        // Triggers
        if (thought.situation) {
          if (!distortionTriggers.has(distortion.type)) {
            distortionTriggers.set(distortion.type, new Set());
          }
          distortionTriggers.get(distortion.type)!.add(thought.situation);
        }

        // Time
        const hour = new Date(thought.timestamp).getHours();
        if (!distortionTimes.has(distortion.type)) {
          distortionTimes.set(distortion.type, []);
        }
        distortionTimes.get(distortion.type)!.push(hour);
      });
    });

    // Build patterns
    distortionCounts.forEach((frequency, type) => {
      const intensities = distortionIntensities.get(type) || [];
      const avgIntensity = intensities.length > 0
        ? intensities.reduce((sum, i) => sum + i, 0) / intensities.length
        : 0;

      const triggers = Array.from(distortionTriggers.get(type) || []);
      
      const times = distortionTimes.get(type) || [];
      const timePattern = this.identifyTimePattern(times);

      // Calculate trend (last 30 days vs previous 60)
      const last30Days = recentThoughts.filter(t => t.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000);
      const previous60Days = recentThoughts.filter(
        t => t.timestamp <= Date.now() - 30 * 24 * 60 * 60 * 1000
      );

      const recent30Count = last30Days.filter(t =>
        t.detectedDistortions.some(d => d.type === type)
      ).length;
      const previous60Count = previous60Days.filter(t =>
        t.detectedDistortions.some(d => d.type === type)
      ).length;

      let trend: ThoughtPattern['trend'] = 'stable';
      if (recent30Count > previous60Count * 0.6) {
        trend = 'increasing';
      } else if (recent30Count < previous60Count * 0.4) {
        trend = 'decreasing';
      }

      this.patterns.set(type, {
        distortionType: type,
        frequency,
        averageIntensity: Math.round(avgIntensity * 10) / 10,
        commonTriggers: triggers.slice(0, 5),
        timePattern,
        trend,
      });
    });
  }

  private identifyTimePattern(hours: number[]): ThoughtPattern['timePattern'] {
    if (hours.length === 0) return 'none';

    const counts = {
      morning: hours.filter(h => h >= 6 && h < 12).length,
      afternoon: hours.filter(h => h >= 12 && h < 18).length,
      evening: hours.filter(h => h >= 18 && h < 22).length,
      night: hours.filter(h => h >= 22 || h < 6).length,
    };

    const max = Math.max(...Object.values(counts));
    if (max < hours.length * 0.4) return 'none';

    return (Object.entries(counts).find(([, count]) => count === max)?.[0] as ThoughtPattern['timePattern']) || 'none';
  }

  getPatterns(): ThoughtPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency);
  }

  getThoughts(limit: number = 50): ThoughtEntry[] {
    return [...this.thoughts]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async markHelpful(thoughtId: string, helpful: boolean): Promise<void> {
    const thought = this.thoughts.find(t => t.id === thoughtId);
    if (!thought) return;

    thought.helpful = helpful;
    await this.saveData();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const cognitiveDistortionScanner = CognitiveDistortionScannerManager.getInstance();

// ============================================================================
// React Hook
// ============================================================================

export function useCognitiveDistortionScanner() {
  const [patterns, setPatterns] = React.useState<ThoughtPattern[]>(
    cognitiveDistortionScanner.getPatterns()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPatterns(cognitiveDistortionScanner.getPatterns());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    // Scanning
    scanThought: (thought: string, situation?: string, emotion?: string, intensity?: 1 | 2 | 3 | 4 | 5) =>
      cognitiveDistortionScanner.scanThought(thought, situation, emotion, intensity),
    getThoughts: (limit?: number) => cognitiveDistortionScanner.getThoughts(limit),
    
    // Belief decay
    updateBelievability: (thoughtId: string, believability: number) =>
      cognitiveDistortionScanner.updateBelievability(thoughtId, believability),
    getBeliefDecay: (thoughtId: string) => cognitiveDistortionScanner.getBeliefDecay(thoughtId),
    getAllDecayRecords: () => cognitiveDistortionScanner.getAllDecayRecords(),
    
    // Socratic dialogue
    startDialogue: (thoughtId: string) => cognitiveDistortionScanner.startSocraticDialogue(thoughtId),
    respondToQuestion: (thoughtId: string, response: string) =>
      cognitiveDistortionScanner.respondToSocraticQuestion(thoughtId, response),
    getDialogue: (thoughtId: string) => cognitiveDistortionScanner.getSocraticDialogue(thoughtId),
    
    // Patterns
    patterns,
    
    // Feedback
    markHelpful: (thoughtId: string, helpful: boolean) =>
      cognitiveDistortionScanner.markHelpful(thoughtId, helpful),
  };
}

