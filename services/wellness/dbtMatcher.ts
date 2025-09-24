export type DBTState = 'sad'|'angry'|'anxious'|'overwhelmed'|'numb';

const LIB: Record<DBTState,string[]> = {
  sad:[
    'Opposite action: brief activation (walk, shower, sunlight)',
    'Self-soothe: warmth, weighted blanket, calm music',
    'Check the facts: what is the loss? what remains?'
  ],
  angry:[
    'TIPP: paced breathing (4-6) for 2 minutes',
    'Opposite action: soften posture, lower voice, take space',
    'Effectiveness: what is my goal? what works now?'
  ],
  anxious:[
    'TIPP: cold water + paced breathing',
    'PLEASE skills: hydration, nutrition, sleep hygiene',
    'Grounding: 5-4-3-2-1 sensory scan'
  ],
  overwhelmed:[
    'STOP skill: Stop, Take a step back, Observe, Proceed mindfully',
    'Break task into smallest next step',
    'Self-validate: it makes sense I feel this way'
  ],
  numb:[
    'Opposite action: gentle activating movement (stretching)',
    'Savor small pleasant sensations (tea, texture, scent)',
    'Reach out: short message to a safe person'
  ]
};

export function matchDBTSkills(state: DBTState): string[] { return LIB[state] || []; }
