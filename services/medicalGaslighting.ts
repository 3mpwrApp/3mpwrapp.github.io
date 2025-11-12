/**
 * Medical Gaslighting Detector Service
 * 
 * Privacy-preserving analysis of medical notes to identify dismissive language,
 * minimization patterns, and gaslighting indicators. All processing happens locally.
 */

export interface GaslightingPattern {
  type: 'dismissive' | 'minimization' | 'blame' | 'invalidation' | 'appropriate' | 'supportive';
  text: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  startIndex: number;
  endIndex: number;
}

export interface AnalysisResult {
  overallScore: number; // 0-100, higher = more gaslighting
  riskLevel: 'low' | 'moderate' | 'high';
  patterns: GaslightingPattern[];
  summary: string;
  recommendations: string[];
  positiveNotes?: string[];
}

/**
 * Gaslighting language patterns database
 */
const GASLIGHTING_PATTERNS = {
  dismissive: [
    { pattern: /\b(claims?|alleges?|states?|reports?|complains?)\s+(pain|symptoms?|discomfort)/gi, 
      severity: 'medium' as const,
      explanation: 'Using "claims" or "alleges" suggests doubting the patient\'s reported symptoms' },
    { pattern: /\b(just|only|merely)\s+(anxiety|stress|in your head)/gi,
      severity: 'high' as const,
      explanation: 'Minimizing symptoms by attributing them to psychological causes' },
    { pattern: /\b(exaggerat(ing|ed)|overreacting|overstating)/gi,
      severity: 'high' as const,
      explanation: 'Directly questioning the patient\'s credibility' },
    { pattern: /\b(no objective|no organic|no physical)\s+(findings?|evidence|cause)/gi,
      severity: 'medium' as const,
      explanation: 'Dismissing symptoms because tests are negative' },
    { pattern: /\b(difficult|challenging|non-compliant)\s+(patient|client)/gi,
      severity: 'high' as const,
      explanation: 'Labeling patient negatively in medical records' },
  ],
  
  minimization: [
    { pattern: /\b(it'?s (just|only)|nothing (serious|major|significant))/gi,
      severity: 'medium' as const,
      explanation: 'Minimizing the severity of symptoms' },
    { pattern: /\b(normal for your age|part of (aging|getting older))/gi,
      severity: 'low' as const,
      explanation: 'Attributing symptoms to age without investigation' },
    { pattern: /\b(everyone (has|experiences)|very common)/gi,
      severity: 'low' as const,
      explanation: 'Normalizing symptoms without addressing concerns' },
    { pattern: /\b(probably|likely)\s+(stress|anxiety|depression)/gi,
      severity: 'medium' as const,
      explanation: 'Quickly attributing physical symptoms to mental health' },
  ],
  
  blame: [
    { pattern: /\b(if you (would|had)|you need to|you should have)/gi,
      severity: 'medium' as const,
      explanation: 'Placing blame on the patient for their condition' },
    { pattern: /\b(non-complian(t|ce)|refuses?|unwilling)/gi,
      severity: 'high' as const,
      explanation: 'Framing patient concerns as non-compliance' },
    { pattern: /\b(weight is the (problem|issue)|lose weight and)/gi,
      severity: 'medium' as const,
      explanation: 'Attributing all symptoms to weight without investigation' },
  ],
  
  invalidation: [
    { pattern: /\b(no (real|significant|major) (pain|symptoms?|problems?))/gi,
      severity: 'high' as const,
      explanation: 'Invalidating the patient\'s experience' },
    { pattern: /\b(patient (denies|refuses)|states (but|however))/gi,
      severity: 'low' as const,
      explanation: 'Language that questions patient\'s statements' },
    { pattern: /\b(attention-seeking|drug-seeking|malingering)/gi,
      severity: 'high' as const,
      explanation: 'Extremely dismissive language that questions motives' },
  ],
  
  appropriate: [
    { pattern: /\b(patient reports?|patient describes?|patient experiences?)/gi,
      severity: 'low' as const,
      explanation: 'Neutral documentation of patient\'s reported symptoms' },
    { pattern: /\b(detailed (history|timeline)|thorough examination)/gi,
      severity: 'low' as const,
      explanation: 'Indicates careful attention to patient concerns' },
    { pattern: /\b(discussed|explained|reviewed with patient)/gi,
      severity: 'low' as const,
      explanation: 'Shows collaborative communication' },
  ],
  
  supportive: [
    { pattern: /\b(patient'?s concerns?|validat(ed|ing)|understandabl(e|y))/gi,
      severity: 'low' as const,
      explanation: 'Acknowledging and validating patient experience' },
    { pattern: /\b(working (with|together)|collaborat(e|ing|ion))/gi,
      severity: 'low' as const,
      explanation: 'Indicates partnership in care' },
    { pattern: /\b(believes?|trusts?|credits?)\s+(patient|their)/gi,
      severity: 'low' as const,
      explanation: 'Shows trust in patient\'s reporting' },
  ],
};

/**
 * Analyze medical notes for gaslighting patterns
 */
export function analyzeMedicalNotes(noteText: string): AnalysisResult {
  const patterns: GaslightingPattern[] = [];
  let gaslightingScore = 0;
  let positiveScore = 0;
  
  // Check each pattern type
  Object.entries(GASLIGHTING_PATTERNS).forEach(([type, patternList]) => {
    patternList.forEach(({ pattern, severity, explanation }) => {
      let match;
      const regex = new RegExp(pattern);
      
      while ((match = regex.exec(noteText)) !== null) {
        const matchedText = match[0];
        
        patterns.push({
          type: type as any,
          text: matchedText,
          severity,
          explanation,
          startIndex: match.index,
          endIndex: match.index + matchedText.length,
        });
        
        // Score based on type and severity
        if (type === 'appropriate' || type === 'supportive') {
          positiveScore += severity === 'high' ? 15 : severity === 'medium' ? 10 : 5;
        } else {
          gaslightingScore += severity === 'high' ? 25 : severity === 'medium' ? 15 : 8;
        }
      }
    });
  });
  
  // Calculate overall score (0-100)
  const netScore = Math.max(0, gaslightingScore - positiveScore);
  const overallScore = Math.min(100, netScore);
  
  // Determine risk level
  let riskLevel: 'low' | 'moderate' | 'high';
  if (overallScore >= 60) {
    riskLevel = 'high';
  } else if (overallScore >= 30) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }
  
  // Generate summary
  const dismissiveCount = patterns.filter(p => p.type === 'dismissive').length;
  const minimizationCount = patterns.filter(p => p.type === 'minimization').length;
  const blameCount = patterns.filter(p => p.type === 'blame').length;
  const invalidationCount = patterns.filter(p => p.type === 'invalidation').length;
  const appropriateCount = patterns.filter(p => p.type === 'appropriate').length;
  const supportiveCount = patterns.filter(p => p.type === 'supportive').length;
  
  let summary = '';
  if (overallScore >= 60) {
    summary = `This note contains significant concerning language patterns (${dismissiveCount + minimizationCount + blameCount + invalidationCount} instances). Consider documenting this for your records and discussing with another healthcare provider.`;
  } else if (overallScore >= 30) {
    summary = `This note contains some dismissive language (${dismissiveCount + minimizationCount + blameCount + invalidationCount} instances). While not all may be inappropriate, it's worth noting for your advocacy records.`;
  } else {
    summary = `This note appears to use mostly appropriate medical documentation language. ${appropriateCount + supportiveCount} positive patterns were detected.`;
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (dismissiveCount > 0) {
    recommendations.push('Save this note - dismissive language may be relevant for appeals or complaints');
  }
  
  if (minimizationCount > 0) {
    recommendations.push('Consider requesting a second opinion or referral to a specialist');
  }
  
  if (blameCount > 0) {
    recommendations.push('Document your adherence to treatment recommendations separately');
  }
  
  if (invalidationCount > 0) {
    recommendations.push('This language may support a human rights or licensing complaint - consult a lawyer');
  }
  
  if (overallScore >= 60) {
    recommendations.push('Consider switching healthcare providers if possible');
    recommendations.push('Share this analysis with a patient advocate or ombudsperson');
  }
  
  if (appropriateCount > 3 || supportiveCount > 0) {
    recommendations.push('This provider appears to be documenting appropriately - good for ongoing care');
  }
  
  // Extract positive notes
  const positiveNotes: string[] = [];
  if (supportiveCount > 0) {
    positiveNotes.push('Note contains validating and collaborative language');
  }
  if (appropriateCount > 2) {
    positiveNotes.push('Medical documentation appears thorough and neutral');
  }
  
  return {
    overallScore,
    riskLevel,
    patterns: patterns.sort((a, b) => a.startIndex - b.startIndex),
    summary,
    recommendations,
    positiveNotes: positiveNotes.length > 0 ? positiveNotes : undefined,
  };
}

/**
 * Generate a plain language explanation of the analysis
 */
export function explainAnalysis(result: AnalysisResult): string {
  const sections: string[] = [];
  
  sections.push(`## Analysis Summary\n\n${result.summary}\n`);
  
  if (result.patterns.length > 0) {
    sections.push(`\n## Detected Patterns (${result.patterns.length})\n`);
    
    const byType = {
      dismissive: result.patterns.filter(p => p.type === 'dismissive'),
      minimization: result.patterns.filter(p => p.type === 'minimization'),
      blame: result.patterns.filter(p => p.type === 'blame'),
      invalidation: result.patterns.filter(p => p.type === 'invalidation'),
      appropriate: result.patterns.filter(p => p.type === 'appropriate'),
      supportive: result.patterns.filter(p => p.type === 'supportive'),
    };
    
    Object.entries(byType).forEach(([type, patterns]) => {
      if (patterns.length > 0) {
        const icon = type === 'appropriate' || type === 'supportive' ? '✅' : '🚩';
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        sections.push(`\n### ${icon} ${label} (${patterns.length})\n`);
        
        patterns.slice(0, 5).forEach(pattern => {
          sections.push(`- "${pattern.text}" - ${pattern.explanation}`);
        });
        
        if (patterns.length > 5) {
          sections.push(`\n...and ${patterns.length - 5} more`);
        }
      }
    });
  }
  
  if (result.recommendations.length > 0) {
    sections.push(`\n## Recommendations\n`);
    result.recommendations.forEach(rec => {
      sections.push(`- ${rec}`);
    });
  }
  
  if (result.positiveNotes && result.positiveNotes.length > 0) {
    sections.push(`\n## Positive Notes\n`);
    result.positiveNotes.forEach(note => {
      sections.push(`- ${note}`);
    });
  }
  
  return sections.join('\n');
}

/**
 * Compare multiple medical notes to detect patterns over time
 */
export interface ComparisonResult {
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
  consistentPatterns: string[];
  providerComparison?: {
    bestProvider: string;
    worstProvider: string;
  };
}

export function compareNotes(notes: Array<{ text: string; date: number; provider?: string }>): ComparisonResult {
  const results = notes.map(n => ({
    ...analyzeMedicalNotes(n.text),
    date: n.date,
    provider: n.provider,
  }));
  
  const averageScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
  
  // Determine trend (compare first half to second half)
  const midpoint = Math.floor(results.length / 2);
  const firstHalf = results.slice(0, midpoint);
  const secondHalf = results.slice(midpoint);
  
  const firstAvg = firstHalf.reduce((sum, r) => sum + r.overallScore, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, r) => sum + r.overallScore, 0) / secondHalf.length;
  
  let trend: 'improving' | 'declining' | 'stable';
  if (secondAvg < firstAvg - 10) {
    trend = 'improving';
  } else if (secondAvg > firstAvg + 10) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }
  
  // Find consistent patterns
  const patternTexts = new Map<string, number>();
  results.forEach(r => {
    r.patterns.forEach(p => {
      if (p.type !== 'appropriate' && p.type !== 'supportive') {
        const key = p.text.toLowerCase();
        patternTexts.set(key, (patternTexts.get(key) || 0) + 1);
      }
    });
  });
  
  const consistentPatterns = Array.from(patternTexts.entries())
    .filter(([_, count]) => count >= results.length * 0.5) // Appears in 50%+ of notes
    .map(([text]) => text);
  
  // Provider comparison (if providers specified)
  let providerComparison;
  if (notes.some(n => n.provider)) {
    const providerScores = new Map<string, number[]>();
    results.forEach((r, i) => {
      if (notes[i].provider) {
        const provider = notes[i].provider!;
        const scores = providerScores.get(provider) || [];
        scores.push(r.overallScore);
        providerScores.set(provider, scores);
      }
    });
    
    const providerAvgs = Array.from(providerScores.entries())
      .map(([provider, scores]) => ({
        provider,
        avg: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      }))
      .sort((a, b) => a.avg - b.avg);
    
    if (providerAvgs.length >= 2) {
      providerComparison = {
        bestProvider: providerAvgs[0].provider,
        worstProvider: providerAvgs[providerAvgs.length - 1].provider,
      };
    }
  }
  
  return {
    averageScore,
    trend,
    consistentPatterns,
    providerComparison,
  };
}
