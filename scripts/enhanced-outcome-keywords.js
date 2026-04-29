/**
 * ENHANCED OUTCOME KEYWORDS - Based on NotebookLM Analysis
 * 
 * Findings from analyzing 100+ WSIAT/ONSBT/ONWSIB/ONHRT decisions:
 * - ONWSIB uses administrative language (not standard tribunal phrasing)
 * - Tribunals use "deemed", "reversing", "directed" patterns
 * - Outcome confidence levels: High (explicit), Medium (implied), Low (ambiguous)
 * 
 * Source: NotebookLM analysis of Ontario tribunal decisions (1986-2025)
 * Date: April 28, 2026
 */

module.exports = {
  
  // ===== WSIAT (Ontario WSIAT) =====
  wsiat: {
    workerWins: {
      high: [
        'appeal allowed',
        'appeal is allowed',
        'granted entitlement',
        'entitlement granted',
        'directed the board to',
        'directed wsib to',
        'allowed the worker\'s appeal',
        'worker\'s appeal allowed',
        'reconsideration granted',
        'panel granted',
        'tribunal granted'
      ],
      medium: [
        'reversing initial entitlement',  // Context-dependent: check if employer appealing
        'benefits awarded',
        'entitled to benefits',
        'nel award granted',
        'fel award granted',
        'loe benefits awarded'
      ]
    },
    
    workerLoses: {
      high: [
        'appeal dismissed',
        'appeal is dismissed',
        'denied entitlement',
        'entitlement denied',
        'denied this appeal',
        'dismissed this appeal',
        'leave denied',
        'leave to appeal denied'
      ],
      medium: [
        'reversing initial entitlement',  // Context-dependent: check if worker appealing Board allowance
        'deemed not to have',
        'deemed ineligible',
        'deemed not entitled',
        'considered not to be'
      ]
    },
    
    mixed: {
      high: [
        'appeal partially allowed',
        'partially successful',
        'appeal allowed in part'
      ]
    },
    
    procedural: {
      remitted: [
        'remitted',
        'sent back to the board',
        'referred back to wsib',
        'referred back to the board',
        'returned to the board'
      ],
      varied: [
        'decision varied',
        'varied the decision',
        'decision is varied',
        'increased to',       // SIEF relief context
        'decreased to',
        'relief increased',
        'relief decreased'
      ],
      withdrawn: [
        'endorsed withdrawal',
        'withdrawal endorsed',
        'appeal withdrawn',
        'worker withdrew',
        'employer withdrew'
      ],
      adjourned: [
        'adjourned pending',
        'appeal adjourned',
        'placed in inactive status'
      ]
    }
  },
  
  // ===== ONWSIB (WSIB Internal Reviews) - CRITICAL FOR 95.4% UNKNOWN RATE =====
  onwsib: {
    workerWins: {
      high: [
        // Administrative approval language
        'reconsideration results in approval',
        'reconsideration results in entitlement',
        'upon review, the board finds entitlement',
        'upon review, entitlement is granted',
        'internal review grants',
        'internal review approves',
        
        // Decision modification language
        'original decision is amended to allow',
        'original decision is amended to grant',
        'original decision is overturned',
        'original decision is reversed',
        'board reverses its earlier determination',
        'board reverses its previous decision',
        
        // Error admission
        'board admits error',
        'board corrects its error',
        'upon reconsideration, the board finds',
        
        // Variation language
        'decision varied in favour',
        'decision modified to grant',
        'benefits reinstated',
        'benefits restored'
      ],
      medium: [
        'reconsideration results',  // Check next words
        'upon review, the board',   // Check next phrase
        'amended decision',
        'modified decision',
        'board reconsiders'
      ]
    },
    
    workerLoses: {
      high: [
        // Administrative denial language
        'reconsideration results in denial',
        'reconsideration upholds original',
        'reconsideration confirms original',
        'upon review, the board maintains',
        'upon review, original decision stands',
        'internal review denies',
        'internal review upholds',
        
        // Decision affirmation language
        'original decision is maintained',
        'original decision is confirmed',
        'original decision is upheld',
        'board affirms its earlier determination',
        'board affirms its previous decision',
        'board stands by its decision',
        
        // Rejection language
        'decision stands',
        'no change to original decision',
        'reconsideration does not result',
        'benefits remain denied'
      ]
    }
  },
  
  // ===== ONSBT (Ontario Social Benefits Tribunal) =====
  onsbt: {
    workerWins: {
      high: [
        'appeal allowed',
        'eligible for odsp',
        'approved for odsp',
        'meets the disability criteria',
        'substantial impairment found',
        'approved for benefits',
        'entitlement granted',
        'disability established'
      ],
      medium: [
        'consent order approving',
        'consent order granting',
        'parties agree to grant'
      ]
    },
    
    workerLoses: {
      high: [
        'appeal dismissed',
        'not eligible for odsp',
        'does not meet disability criteria',
        'substantial impairment not established',
        'not substantially impaired',
        'denied odsp eligibility',
        'procedural dismissal'
      ],
      medium: [
        'consent order denying',
        'consent order dismissing',
        'withdrawn',
        'abandoned'
      ]
    }
  },
  
  // ===== ONHRT (Ontario Human Rights Tribunal) =====
  onhrt: {
    workerWins: {
      high: [
        'discrimination found',
        'application successful',
        'remedy ordered',
        'prima facie case established',
        'damages awarded',
        'compensation awarded to',
        'violation of the code',
        'breach of human rights'
      ],
      medium: [
        'settlement approved',
        'consent agreement',
        'parties agreed to remedy'
      ]
    },
    
    workerLoses: {
      high: [
        'no discrimination found',
        'failed to establish prima facie case',
        'application dismissed',
        'no remedy warranted',
        'no violation found',
        'procedural dismissal',
        'outside tribunal jurisdiction'
      ]
    }
  },
  
  // ===== COMMON "DEEMED" LANGUAGE (ALL TRIBUNALS) =====
  deemedLanguage: {
    workerLoses: [
      'deemed not to have',
      'deemed ineligible',
      'deemed not entitled',
      'deemed to have no',
      'considered not to be',
      'determined not to have'
    ],
    workerWins: [
      'deemed entitled',
      'deemed eligible',
      'deemed to have',
      'considered to be',
      'determined to have'
    ]
  },
  
  // ===== CONFIDENCE SCORING GUIDE =====
  confidenceLevels: {
    high: 'Explicit outcome statement (e.g., "appeal allowed")',
    medium: 'Implied from reasoning/disposition (e.g., "benefits awarded")',
    low: 'Ambiguous or requires context (e.g., "reversing" without clarifying who appealed)'
  }
  
};
