/**
 * Legal DNA Sequencer
 * 
 * Case genome mapping, precedent matching, weak point detection, timeline
 * reconstruction, and credibility scoring for legal advocacy.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Platform } from 'react-native';

import { logError } from '../utils/errorLogger';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LegalCase {
  id: string;
  title: string;
  type: 'discrimination' | 'accommodation' | 'employment' | 'housing' | 'healthcare' | 'ssdi' | 'other';
  status: 'planning' | 'filed' | 'discovery' | 'trial' | 'appeal' | 'settled' | 'won' | 'lost';
  createdAt: number;
  updatedAt: number;
  parties: CaseParty[];
  events: CaseEvent[];
  evidence: CaseEvidence[];
  claims: LegalClaim[];
  genome: CaseGenome | null;
}

export interface CaseParty {
  id: string;
  name: string;
  role: 'plaintiff' | 'defendant' | 'witness' | 'expert' | 'other';
  credibilityScore?: number; // 0-100
  biasIndicators?: string[];
  relationships?: Array<{ partyId: string; type: string }>;
}

export interface CaseEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  title: string;
  description: string;
  evidenceIds?: string[];
  witnessIds?: string[];
  significance: 1 | 2 | 3 | 4 | 5; // 1=minor, 5=critical
  verified: boolean;
}

export interface CaseEvidence {
  id: string;
  type: 'document' | 'photo' | 'video' | 'audio' | 'testimony' | 'medical' | 'email' | 'text' | 'other';
  title: string;
  description: string;
  dateObtained: string;
  dateOfEvent?: string;
  source?: string;
  chainOfCustody: Array<{ date: string; handler: string }>;
  tags: string[];
  credibilityScore?: number;
}

export interface LegalClaim {
  id: string;
  type: string; // e.g., "ADA Title I Violation", "FMLA Interference"
  statute: string;
  elementsRequired: string[];
  elementsMet: Record<string, { met: boolean; evidence: string[] }>;
  strength: number; // 0-100
  precedents: Precedent[];
}

export interface Precedent {
  id: string;
  caseName: string;
  citation: string;
  court: string;
  year: number;
  matchScore: number; // 0-100 similarity to current case
  keyHolding: string;
  favorableTo: 'plaintiff' | 'defendant' | 'neutral';
  distinguishingFactors?: string[];
}

export interface CaseGenome {
  caseId: string;
  generatedAt: number;
  nodeCount: number;
  edgeCount: number;
  nodes: GenomeNode[];
  edges: GenomeEdge[];
  clusters: GenomeCluster[];
  weakPoints: WeakPoint[];
  strengthScore: number; // 0-100
}

export interface GenomeNode {
  id: string;
  type: 'event' | 'evidence' | 'party' | 'claim' | 'statute';
  label: string;
  data: any;
  importance: number; // 0-100
  verified: boolean;
}

export interface GenomeEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  type: 'supports' | 'contradicts' | 'related' | 'caused' | 'witnessed';
  weight: number; // 0-1 strength of relationship
}

export interface GenomeCluster {
  id: string;
  label: string;
  nodeIds: string[];
  theme: string;
  strength: number; // 0-100
}

export interface WeakPoint {
  id: string;
  type: 'missing_evidence' | 'contradictory_evidence' | 'credibility_gap' | 'timeline_gap' | 'legal_element_unmet';
  severity: 1 | 2 | 3 | 4 | 5; // 1=minor, 5=critical
  description: string;
  relatedNodes: string[];
  suggestions: string[];
}

export interface TimelineReconstruction {
  caseId: string;
  events: ReconstructedEvent[];
  gaps: TimelineGap[];
  inconsistencies: TimelineInconsistency[];
  completeness: number; // 0-100
}

export interface ReconstructedEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  description: string;
  confidence: number; // 0-100
  sources: string[]; // evidence IDs
  participants: string[]; // party IDs
}

export interface TimelineGap {
  startDate: string;
  endDate: string;
  durationDays: number;
  significance: string;
  possibleEvents: string[];
}

export interface TimelineInconsistency {
  eventIds: string[];
  issue: string;
  resolutionSuggestions: string[];
}

export interface CredibilityAnalysis {
  partyId: string;
  partyName: string;
  overallScore: number; // 0-100
  factors: CredibilityFactor[];
  recommendations: string[];
}

export interface CredibilityFactor {
  name: string;
  score: number; // 0-100
  weight: number; // How much this affects overall
  evidence: string[];
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  CASES: 'legalDNA:cases:v1',
  GENOMES: 'legalDNA:genomes:v1',
  PRECEDENTS: 'legalDNA:precedents:v1',
} as const;

// Common legal claim types with required elements
const CLAIM_TEMPLATES: Record<string, { statute: string; elements: string[] }> = {
  'ADA Title I Employment Discrimination': {
    statute: '42 U.S.C. § 12112',
    elements: [
      'Plaintiff has a disability',
      'Plaintiff is qualified for the position',
      'Plaintiff suffered an adverse employment action',
      'Action occurred under circumstances giving rise to inference of discrimination',
    ],
  },
  'FMLA Interference': {
    statute: '29 U.S.C. § 2615',
    elements: [
      'Plaintiff is an eligible employee',
      'Defendant is a covered employer',
      'Plaintiff was entitled to FMLA leave',
      'Plaintiff gave adequate notice',
      'Employer denied FMLA benefits',
    ],
  },
  'Fair Housing Act Violation': {
    statute: '42 U.S.C. § 3604',
    elements: [
      'Plaintiff is disabled or associated with disabled person',
      'Defendant refused reasonable accommodation',
      'Accommodation was necessary',
      'Accommodation would not cause undue burden',
    ],
  },
  'SSDI Wrongful Denial': {
    statute: '42 U.S.C. § 423',
    elements: [
      'Plaintiff has qualifying disability',
      'Disability prevents substantial gainful activity',
      'Disability expected to last 12+ months or result in death',
      'Plaintiff has sufficient work credits',
    ],
  },
};

// ============================================================================
// Legal DNA Sequencer Manager
// ============================================================================

class LegalDNASequencerManager {
  private static instance: LegalDNASequencerManager;
  private cases: Map<string, LegalCase> = new Map();
  private genomes: Map<string, CaseGenome> = new Map();
  private precedentLibrary: Precedent[] = [];

  private constructor() {
    this.loadData();
  }

  static getInstance(): LegalDNASequencerManager {
    if (!LegalDNASequencerManager.instance) {
      LegalDNASequencerManager.instance = new LegalDNASequencerManager();
    }
    return LegalDNASequencerManager.instance;
  }

  // ============================================================================
  // Data Management
  // ============================================================================

  private async loadData(): Promise<void> {
    try {
      // Skip on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') return;
      
      const [casesStr, genomesStr, precedentsStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CASES),
        AsyncStorage.getItem(STORAGE_KEYS.GENOMES),
        AsyncStorage.getItem(STORAGE_KEYS.PRECEDENTS),
      ]);

      if (casesStr) {
        const casesArray: LegalCase[] = JSON.parse(casesStr);
        this.cases = new Map(casesArray.map(c => [c.id, c]));
      }

      if (genomesStr) {
        const genomesArray: CaseGenome[] = JSON.parse(genomesStr);
        this.genomes = new Map(genomesArray.map(g => [g.caseId, g]));
      }

      if (precedentsStr) {
        this.precedentLibrary = JSON.parse(precedentsStr);
      }
    } catch (err) {
      logError('legalDNASequencer', 'Failed to load legal DNA data', err);
    }
  }

  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(Array.from(this.cases.values()))),
        AsyncStorage.setItem(STORAGE_KEYS.GENOMES, JSON.stringify(Array.from(this.genomes.values()))),
        AsyncStorage.setItem(STORAGE_KEYS.PRECEDENTS, JSON.stringify(this.precedentLibrary)),
      ]);
    } catch (err) {
      logError('legalDNASequencer', 'Failed to save legal DNA data', err);
    }
  }

  // ============================================================================
  // Case Management
  // ============================================================================

  async createCase(data: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt' | 'genome'>): Promise<LegalCase> {
    const newCase: LegalCase = {
      ...data,
      id: `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      genome: null,
    };

    this.cases.set(newCase.id, newCase);
    await this.saveData();
    return newCase;
  }

  async updateCase(caseId: string, updates: Partial<LegalCase>): Promise<LegalCase | null> {
    const existingCase = this.cases.get(caseId);
    if (!existingCase) return null;

    const updated = {
      ...existingCase,
      ...updates,
      id: caseId, // Prevent ID change
      updatedAt: Date.now(),
    };

    this.cases.set(caseId, updated);
    await this.saveData();
    return updated;
  }

  getCase(caseId: string): LegalCase | null {
    return this.cases.get(caseId) || null;
  }

  getAllCases(): LegalCase[] {
    return Array.from(this.cases.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // ============================================================================
  // Case Genome Mapping
  // ============================================================================

  async generateCaseGenome(caseId: string): Promise<CaseGenome> {
    const legalCase = this.cases.get(caseId);
    if (!legalCase) throw new Error('Case not found');

    const nodes: GenomeNode[] = [];
    const edges: GenomeEdge[] = [];

    // Add event nodes
    legalCase.events.forEach(event => {
      nodes.push({
        id: `event_${event.id}`,
        type: 'event',
        label: event.title,
        data: event,
        importance: event.significance * 20,
        verified: event.verified,
      });

      // Connect events to evidence
      event.evidenceIds?.forEach(evidenceId => {
        edges.push({
          id: `edge_${event.id}_${evidenceId}`,
          source: `event_${event.id}`,
          target: `evidence_${evidenceId}`,
          type: 'supports',
          weight: 0.8,
        });
      });

      // Connect events to witnesses
      event.witnessIds?.forEach(witnessId => {
        edges.push({
          id: `edge_${event.id}_${witnessId}`,
          source: `party_${witnessId}`,
          target: `event_${event.id}`,
          type: 'witnessed',
          weight: 0.6,
        });
      });
    });

    // Add evidence nodes
    legalCase.evidence.forEach(evidence => {
      nodes.push({
        id: `evidence_${evidence.id}`,
        type: 'evidence',
        label: evidence.title,
        data: evidence,
        importance: evidence.credibilityScore || 50,
        verified: evidence.chainOfCustody.length > 0,
      });
    });

    // Add party nodes
    legalCase.parties.forEach(party => {
      nodes.push({
        id: `party_${party.id}`,
        type: 'party',
        label: party.name,
        data: party,
        importance: party.role === 'expert' ? 80 : 50,
        verified: true,
      });

      // Connect parties via relationships
      party.relationships?.forEach(rel => {
        edges.push({
          id: `edge_${party.id}_${rel.partyId}`,
          source: `party_${party.id}`,
          target: `party_${rel.partyId}`,
          type: 'related',
          weight: 0.5,
        });
      });
    });

    // Add claim nodes
    legalCase.claims.forEach(claim => {
      nodes.push({
        id: `claim_${claim.id}`,
        type: 'claim',
        label: claim.type,
        data: claim,
        importance: claim.strength,
        verified: true,
      });

      // Connect claims to evidence
      Object.values(claim.elementsMet).forEach(element => {
        element.evidence.forEach(evidenceId => {
          edges.push({
            id: `edge_claim_${claim.id}_${evidenceId}`,
            source: `claim_${claim.id}`,
            target: `evidence_${evidenceId}`,
            type: 'supports',
            weight: element.met ? 0.9 : 0.3,
          });
        });
      });
    });

    // Cluster analysis
    const clusters = this.identifyClusters(nodes, edges);

    // Weak point detection
    const weakPoints = this.detectWeakPoints(legalCase, nodes, edges);

    // Calculate overall case strength
    const strengthScore = this.calculateCaseStrength(legalCase, weakPoints);

    const genome: CaseGenome = {
      caseId,
      generatedAt: Date.now(),
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodes,
      edges,
      clusters,
      weakPoints,
      strengthScore,
    };

    this.genomes.set(caseId, genome);
    
    // Update case with genome reference
    await this.updateCase(caseId, { genome });

    await this.saveData();
    return genome;
  }

  private identifyClusters(nodes: GenomeNode[], _edges: GenomeEdge[]): GenomeCluster[] {
    // Simple clustering: group by event date proximity
    const clusters: GenomeCluster[] = [];
    
    // Group events by month
    const eventsByMonth = new Map<string, GenomeNode[]>();
    nodes.filter(n => n.type === 'event').forEach(node => {
      const event = node.data as CaseEvent;
      const monthKey = event.date.substring(0, 7); // YYYY-MM
      if (!eventsByMonth.has(monthKey)) {
        eventsByMonth.set(monthKey, []);
      }
      eventsByMonth.get(monthKey)!.push(node);
    });

    eventsByMonth.forEach((clusterNodes, monthKey) => {
      if (clusterNodes.length > 0) {
        const avgImportance = clusterNodes.reduce((sum, n) => sum + n.importance, 0) / clusterNodes.length;
        clusters.push({
          id: `cluster_${monthKey}`,
          label: `Events in ${monthKey}`,
          nodeIds: clusterNodes.map(n => n.id),
          theme: 'temporal',
          strength: avgImportance,
        });
      }
    });

    return clusters;
  }

  private detectWeakPoints(legalCase: LegalCase, _nodes: GenomeNode[], _edges: GenomeEdge[]): WeakPoint[] {
    const weakPoints: WeakPoint[] = [];

    // Check for unmet legal elements
    legalCase.claims.forEach(claim => {
      Object.entries(claim.elementsMet).forEach(([element, status]) => {
        if (!status.met) {
          weakPoints.push({
            id: `weak_${claim.id}_${element}`,
            type: 'legal_element_unmet',
            severity: 5,
            description: `Legal element not met: ${element}`,
            relatedNodes: [`claim_${claim.id}`],
            suggestions: [
              'Gather additional evidence to prove this element',
              'Consider alternative legal theories',
              'Consult with expert witnesses',
            ],
          });
        } else if (status.evidence.length < 2) {
          weakPoints.push({
            id: `weak_${claim.id}_${element}_evidence`,
            type: 'missing_evidence',
            severity: 3,
            description: `Weak evidence for: ${element} (only ${status.evidence.length} piece)`,
            relatedNodes: [`claim_${claim.id}`, ...status.evidence.map(e => `evidence_${e}`)],
            suggestions: [
              'Obtain corroborating evidence',
              'Request additional discovery',
            ],
          });
        }
      });
    });

    // Check for timeline gaps
    const sortedEvents = legalCase.events.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < sortedEvents.length; i++) {
      const prev = new Date(sortedEvents[i - 1].date);
      const curr = new Date(sortedEvents[i].date);
      const dayGap = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (dayGap > 90) {
        weakPoints.push({
          id: `weak_gap_${sortedEvents[i - 1].id}_${sortedEvents[i].id}`,
          type: 'timeline_gap',
          severity: 2,
          description: `${Math.floor(dayGap)} day gap between "${sortedEvents[i - 1].title}" and "${sortedEvents[i].title}"`,
          relatedNodes: [`event_${sortedEvents[i - 1].id}`, `event_${sortedEvents[i].id}`],
          suggestions: [
            'Investigate what happened during this period',
            'Request employment/medical records for this timeframe',
          ],
        });
      }
    }

    // Check for low credibility parties
    legalCase.parties.forEach(party => {
      if (party.credibilityScore && party.credibilityScore < 40) {
        weakPoints.push({
          id: `weak_credibility_${party.id}`,
          type: 'credibility_gap',
          severity: 4,
          description: `${party.name} has low credibility score (${party.credibilityScore}/100)`,
          relatedNodes: [`party_${party.id}`],
          suggestions: [
            'Consider corroborating testimony from other witnesses',
            'Emphasize documentary evidence over testimony',
            'Prepare for cross-examination challenges',
          ],
        });
      }
    });

    return weakPoints.sort((a, b) => b.severity - a.severity);
  }

  private calculateCaseStrength(legalCase: LegalCase, weakPoints: WeakPoint[]): number {
    let score = 100;

    // Deduct for weak points
    weakPoints.forEach(wp => {
      score -= wp.severity * 3;
    });

    // Deduct for incomplete claims
    legalCase.claims.forEach(claim => {
      const totalElements = Object.keys(claim.elementsMet).length;
      const metElements = Object.values(claim.elementsMet).filter(e => e.met).length;
      const completion = metElements / totalElements;
      
      if (completion < 1) {
        score -= (1 - completion) * 20;
      }
    });

    // Boost for strong precedents
    const strongPrecedents = legalCase.claims.flatMap(c => c.precedents)
      .filter(p => p.matchScore > 75 && p.favorableTo === 'plaintiff');
    score += Math.min(strongPrecedents.length * 5, 20);

    return Math.max(0, Math.min(100, score));
  }

  getCaseGenome(caseId: string): CaseGenome | null {
    return this.genomes.get(caseId) || null;
  }

  // ============================================================================
  // Precedent Matching
  // ============================================================================

  async findMatchingPrecedents(claim: LegalClaim): Promise<Precedent[]> {
    // In production, this would query a real legal database (e.g., Westlaw, LexisNexis API)
    // For now, return filtered local precedents
    
    return this.precedentLibrary
      .filter(p => p.citation.includes(claim.statute) || p.keyHolding.toLowerCase().includes(claim.type.toLowerCase()))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  async addPrecedent(precedent: Omit<Precedent, 'id'>): Promise<Precedent> {
    const newPrecedent: Precedent = {
      ...precedent,
      id: `prec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.precedentLibrary.push(newPrecedent);
    await this.saveData();
    return newPrecedent;
  }

  // ============================================================================
  // Timeline Reconstruction
  // ============================================================================

  reconstructTimeline(caseId: string): TimelineReconstruction {
    const legalCase = this.cases.get(caseId);
    if (!legalCase) throw new Error('Case not found');

    // Sort events chronologically
    const sortedEvents = legalCase.events.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      
      // If same date, compare times
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      return 0;
    });

    // Build reconstructed events with confidence scores
    const reconstructedEvents: ReconstructedEvent[] = sortedEvents.map(event => ({
      id: event.id,
      date: event.date,
      time: event.time,
      title: event.title,
      description: event.description,
      confidence: event.verified ? 100 : (event.evidenceIds?.length || 0) * 25,
      sources: event.evidenceIds || [],
      participants: event.witnessIds || [],
    }));

    // Identify gaps
    const gaps: TimelineGap[] = [];
    for (let i = 1; i < sortedEvents.length; i++) {
      const prev = new Date(sortedEvents[i - 1].date);
      const curr = new Date(sortedEvents[i].date);
      const dayGap = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (dayGap > 30) {
        gaps.push({
          startDate: sortedEvents[i - 1].date,
          endDate: sortedEvents[i].date,
          durationDays: Math.floor(dayGap),
          significance: dayGap > 90 ? 'Critical gap requiring investigation' : 'Notable gap',
          possibleEvents: [
            'Review medical records',
            'Check employment records',
            'Interview witnesses about this period',
          ],
        });
      }
    }

    // Check for inconsistencies (e.g., conflicting witness accounts)
    const inconsistencies: TimelineInconsistency[] = [];
    // TODO: Implement logic to detect contradictory evidence

    const completeness = Math.min(100, (reconstructedEvents.length / Math.max(1, gaps.length)) * 10);

    return {
      caseId,
      events: reconstructedEvents,
      gaps,
      inconsistencies,
      completeness,
    };
  }

  // ============================================================================
  // Credibility Analysis
  // ============================================================================

  analyzeCredibility(caseId: string, partyId: string): CredibilityAnalysis {
    const legalCase = this.cases.get(caseId);
    if (!legalCase) throw new Error('Case not found');

    const party = legalCase.parties.find(p => p.id === partyId);
    if (!party) throw new Error('Party not found');

    const factors: CredibilityFactor[] = [];

    // Factor 1: Consistency
    const statements = legalCase.events.filter(e => e.witnessIds?.includes(partyId));
    const consistencyScore = statements.length > 1 ? 70 : 50; // Simplified
    factors.push({
      name: 'Statement Consistency',
      score: consistencyScore,
      weight: 0.3,
      evidence: statements.map(s => s.title),
    });

    // Factor 2: Bias indicators
    const biasScore = party.biasIndicators && party.biasIndicators.length > 0 ? 30 : 80;
    factors.push({
      name: 'Potential Bias',
      score: biasScore,
      weight: 0.2,
      evidence: party.biasIndicators || [],
    });

    // Factor 3: Corroboration
    const corroborationCount = legalCase.evidence.filter(e => 
      e.source === party.name || e.type === 'testimony'
    ).length;
    const corroborationScore = Math.min(100, corroborationCount * 25);
    factors.push({
      name: 'Corroboration',
      score: corroborationScore,
      weight: 0.3,
      evidence: [`${corroborationCount} pieces of corroborating evidence`],
    });

    // Factor 4: Expertise (if expert witness)
    if (party.role === 'expert') {
      factors.push({
        name: 'Expert Qualifications',
        score: 90,
        weight: 0.2,
        evidence: ['Expert witness credentials'],
      });
    }

    // Calculate overall score
    const overallScore = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);

    const recommendations: string[] = [];
    if (overallScore < 50) {
      recommendations.push('Consider supplementing with documentary evidence');
      recommendations.push('Prepare extensive cross-examination preparation');
    }
    if (biasScore < 50) {
      recommendations.push('Address potential bias head-on in direct examination');
    }
    if (corroborationScore < 50) {
      recommendations.push('Seek additional corroborating witnesses or documents');
    }

    return {
      partyId,
      partyName: party.name,
      overallScore,
      factors,
      recommendations,
    };
  }

  // ============================================================================
  // Claim Templates
  // ============================================================================

  getClaimTemplates(): Record<string, { statute: string; elements: string[] }> {
    return { ...CLAIM_TEMPLATES };
  }

  async createClaimFromTemplate(caseId: string, claimType: string): Promise<LegalClaim | null> {
    const template = CLAIM_TEMPLATES[claimType];
    if (!template) return null;

    const legalCase = this.cases.get(caseId);
    if (!legalCase) return null;

    const newClaim: LegalClaim = {
      id: `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: claimType,
      statute: template.statute,
      elementsRequired: template.elements,
      elementsMet: Object.fromEntries(
        template.elements.map(el => [el, { met: false, evidence: [] }])
      ),
      strength: 0,
      precedents: [],
    };

    legalCase.claims.push(newClaim);
    await this.updateCase(caseId, { claims: legalCase.claims });

    return newClaim;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const legalDNASequencer = LegalDNASequencerManager.getInstance();

// ============================================================================
// React Hook
// ============================================================================

export function useLegalDNASequencer() {
  const [cases, setCases] = React.useState<LegalCase[]>(legalDNASequencer.getAllCases());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCases(legalDNASequencer.getAllCases());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return {
    // Case management
    cases,
    createCase: (data: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt' | 'genome'>) =>
      legalDNASequencer.createCase(data),
    updateCase: (caseId: string, updates: Partial<LegalCase>) =>
      legalDNASequencer.updateCase(caseId, updates),
    getCase: (caseId: string) => legalDNASequencer.getCase(caseId),
    
    // Genome
    generateGenome: (caseId: string) => legalDNASequencer.generateCaseGenome(caseId),
    getGenome: (caseId: string) => legalDNASequencer.getCaseGenome(caseId),
    
    // Precedents
    findPrecedents: (claim: LegalClaim) => legalDNASequencer.findMatchingPrecedents(claim),
    addPrecedent: (precedent: Omit<Precedent, 'id'>) => legalDNASequencer.addPrecedent(precedent),
    
    // Timeline
    reconstructTimeline: (caseId: string) => legalDNASequencer.reconstructTimeline(caseId),
    
    // Credibility
    analyzeCredibility: (caseId: string, partyId: string) =>
      legalDNASequencer.analyzeCredibility(caseId, partyId),
    
    // Claims
    getClaimTemplates: () => legalDNASequencer.getClaimTemplates(),
    createClaim: (caseId: string, claimType: string) =>
      legalDNASequencer.createClaimFromTemplate(caseId, claimType),
  };
}

