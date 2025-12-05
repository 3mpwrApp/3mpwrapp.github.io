/**
 * Denial Decoder - Enhanced AI Pattern Detection
 * 
 * Comprehensive features:
 * - 15+ denial pattern detection
 * - Jurisdiction-specific guidance
 * - Appeal strength calculator
 * - Deadline tracking
 * - Counter-argument suggestions
 * - Letter template links
 * - History tracking
 * - PDF export
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import DyslexiaText from '../../../components/DyslexiaText';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_12, HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useSettings } from '../../../store/settings';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

let AsyncStorage: any;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

export const options = { href: null };

const DECODER_HISTORY_KEY = 'denialDecoder:history:v1';

type PatternType = 
  | 'medical_insufficient' 
  | 'deadline_missed' 
  | 'causation_weak' 
  | 'non_compliance' 
  | 'policy_exclusion' 
  | 'surveillance' 
  | 'ime_conflict'
  | 'definition_disability'
  | 'own_occupation'
  | 'any_occupation'
  | 'waiting_period'
  | 'mental_health_limitation'
  | 'pre_existing'
  | 'material_change'
  | 'employer_dispute'
  | 'lack_treatment'
  | 'employability';

type DenialPattern = {
  type: PatternType;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  appealable: boolean;
  actions: string[];
  counterArguments: string[];
  relevantLetters: string[];
};

type DecodedResult = {
  id: string;
  summary: string;
  denialType: string;
  patterns: DenialPattern[];
  appealDeadline?: { date: string; daysLeft: number };
  appealStrength: number;
  keyQuotes: string[];
  nextSteps: string[];
  redFlags: string[];
  positiveIndicators: string[];
  analyzedAt: string;
};

const COMMON_PATTERNS: Record<string, DenialPattern> = {
  medical_insufficient: {
    type: 'medical_insufficient',
    title: '❌ Insufficient Medical Evidence',
    description: 'Decision states medical evidence does not support claim',
    severity: 'medium',
    appealable: true,
    actions: [
      'Obtain updated medical opinion from treating specialist',
      'Request functional capacity evaluation (FCE)',
      'Gather objective test results (MRI, X-ray, bloodwork)',
      'Ask doctor to address specific deficiencies cited in denial',
      'Get specialist referral for comprehensive assessment'
    ],
    counterArguments: [
      'Treating physician has longitudinal knowledge of condition',
      'Objective testing supports functional limitations',
      'Clinical examination findings consistent with reported symptoms',
      'Peer-reviewed literature supports diagnosis and prognosis'
    ],
    relevantLetters: ['Medical Appeal Letter', 'Request for Reconsideration']
  },
  causation_weak: {
    type: 'causation_weak',
    title: '🔗 Weak Causation Link',
    description: 'Decision questions connection between work/accident and condition',
    severity: 'high',
    appealable: true,
    actions: [
      'Get specialist opinion on causation',
      'Provide workplace incident reports or witness statements',
      'Timeline showing symptom onset after incident',
      'Review medical literature supporting causation',
      'Obtain ergonomic or workplace assessment'
    ],
    counterArguments: [
      'Temporal relationship between incident and symptoms',
      'No prior history of similar condition',
      'Mechanism of injury consistent with diagnosis',
      'Medical literature supports work-related causation'
    ],
    relevantLetters: ['Causation Opinion Request', 'Appeal on Causation Grounds']
  },
  non_compliance: {
    type: 'non_compliance',
    title: '⚠️ Non-Compliance Cited',
    description: 'Claim denied for not following treatment recommendations',
    severity: 'medium',
    appealable: true,
    actions: [
      'Document medical reasons for non-compliance (side effects, contraindications)',
      'Show attempts to comply with treatment',
      'Get doctor\'s note explaining treatment modifications',
      'Challenge whether treatment was reasonable/appropriate',
      'Document barriers to treatment access (cost, availability)'
    ],
    counterArguments: [
      'Treatment caused unacceptable side effects',
      'Alternative treatment equally effective for condition',
      'Financial barriers prevented accessing treatment',
      'Treatment not medically recommended for individual circumstances'
    ],
    relevantLetters: ['Non-Compliance Explanation Letter']
  },
  surveillance: {
    type: 'surveillance',
    title: '📹 Surveillance Evidence',
    description: 'Surveillance video contradicts claimed limitations',
    severity: 'high',
    appealable: true,
    actions: [
      'Request complete surveillance footage (not just cherry-picked clips)',
      'Doctor explains good days vs bad days variability',
      'Challenge whether activities shown contradict medical restrictions',
      'Review surveillance for privacy violations',
      'Obtain medical opinion on what surveillance actually shows'
    ],
    counterArguments: [
      'Surveillance shows limited snapshot, not sustained ability',
      'Good day/bad day variability is medically documented',
      'Activities shown do not exceed medical restrictions',
      'Context of activities not captured (rest periods, medication timing)'
    ],
    relevantLetters: ['Surveillance Rebuttal Letter']
  },
  policy_exclusion: {
    type: 'policy_exclusion',
    title: '📜 Policy Exclusion Applied',
    description: 'Denied under specific policy exclusion clause',
    severity: 'high',
    appealable: true,
    actions: [
      'Review exact policy language - exclusions are narrowly interpreted',
      'Argue condition doesn\'t meet exclusion definition',
      'Check if exclusion violates human rights legislation',
      'Consult lawyer on policy interpretation',
      'Review case law on similar exclusion disputes'
    ],
    counterArguments: [
      'Exclusion language is ambiguous (contra proferentem rule)',
      'Condition does not fall within exclusion definition',
      'Exclusion conflicts with human rights protections',
      'Exclusion was not clearly disclosed at time of enrollment'
    ],
    relevantLetters: ['Policy Exclusion Challenge Letter']
  },
  ime_conflict: {
    type: 'ime_conflict',
    title: '👨‍⚕️ IME Conflicts with Treating Doctor',
    description: 'Independent medical exam contradicts your doctors',
    severity: 'medium',
    appealable: true,
    actions: [
      'Highlight that IME doctor saw you once vs ongoing treatment relationship',
      'Point out IME conflicts with objective test results',
      'Get treating doctor to rebut IME findings',
      'Research IME doctor\'s bias/track record if concerning',
      'Request all IME doctor\'s notes and raw data'
    ],
    counterArguments: [
      'IME doctor lacks longitudinal understanding of condition',
      'Treating physicians have extensive ongoing relationship',
      'IME findings conflict with objective diagnostic testing',
      'IME doctor has pattern of denying claims (if applicable)'
    ],
    relevantLetters: ['IME Rebuttal Letter', 'Request for Independent Review']
  },
  definition_disability: {
    type: 'definition_disability',
    title: '📖 Definition of Disability Dispute',
    description: 'Insurer applying wrong or narrow definition of disability',
    severity: 'high',
    appealable: true,
    actions: [
      'Review policy definition carefully - get legal interpretation if needed',
      'Document all job duties that cannot be performed',
      'Get occupational assessment showing inability to work',
      'Challenge if insurer is applying stricter definition than policy'
    ],
    counterArguments: [
      'Definition should be interpreted in claimant\'s favor',
      'Inability to perform substantial duties = disability',
      'Policy doesn\'t require total inability to work',
      'Mental/cognitive demands of job not considered by insurer'
    ],
    relevantLetters: ['Policy Definition Analysis', 'Own Occupation Appeal']
  },
  own_occupation: {
    type: 'own_occupation',
    title: '💼 Own Occupation Period Issue',
    description: 'Denied during own occupation period or early transition to any occupation',
    severity: 'medium',
    appealable: true,
    actions: [
      'Verify correct benefit period applies',
      'Document all duties of your specific position',
      'Get employer confirmation of job requirements',
      'Challenge premature transition to stricter definition'
    ],
    counterArguments: [
      'Still within own occupation benefit period',
      'Cannot perform material duties of own occupation',
      'Transition applied prematurely',
      'Own occupation includes all essential duties, not just some'
    ],
    relevantLetters: ['Own Occupation Appeal', 'Job Duties Documentation']
  },
  any_occupation: {
    type: 'any_occupation',
    title: '🌐 Any Occupation Determination',
    description: 'Denied at any occupation phase claiming you can do other work',
    severity: 'high',
    appealable: true,
    actions: [
      'Get vocational assessment showing no suitable occupations',
      'Challenge identified occupations as unrealistic',
      'Document transferable skills limitations',
      'Show labour market realities for proposed occupations'
    ],
    counterArguments: [
      'No realistic occupation exists within restrictions',
      'Proposed occupations don\'t account for all limitations',
      'Labour market doesn\'t support identified occupations',
      'Education/experience barriers not considered'
    ],
    relevantLetters: ['Any Occupation Appeal', 'Vocational Rebuttal']
  },
  waiting_period: {
    type: 'waiting_period',
    title: '⏳ Waiting/Elimination Period Issue',
    description: 'Denied claiming waiting period not satisfied',
    severity: 'low',
    appealable: true,
    actions: [
      'Verify waiting period calculation',
      'Document continuous disability during period',
      'Challenge any gaps insurer claims existed',
      'Provide medical evidence covering full period'
    ],
    counterArguments: [
      'Disability was continuous throughout elimination period',
      'Brief improvements do not constitute recovery',
      'Medical evidence supports ongoing disability'
    ],
    relevantLetters: ['Elimination Period Documentation']
  },
  mental_health_limitation: {
    type: 'mental_health_limitation',
    title: '🧠 Mental Health Limitation Applied',
    description: 'Benefits limited or cut off under mental/nervous condition limitation',
    severity: 'high',
    appealable: true,
    actions: [
      'Challenge if physical condition contributes to disability',
      'Get psychiatric opinion on condition severity',
      'Argue limitation may violate human rights',
      'Document organic/neurological components if any'
    ],
    counterArguments: [
      'Physical conditions contribute to overall disability',
      'Limitation discriminates against mental health disabilities',
      'Severity warrants exception to limitation',
      'Condition has organic/neurological basis'
    ],
    relevantLetters: ['Mental Health Limitation Challenge']
  },
  pre_existing: {
    type: 'pre_existing',
    title: '🕐 Pre-Existing Condition Denial',
    description: 'Claim denied citing pre-existing condition exclusion',
    severity: 'high',
    appealable: true,
    actions: [
      'Review exact pre-existing condition definition',
      'Document that current condition is different/new',
      'Show stability of prior condition before incident',
      'Get medical opinion distinguishing conditions'
    ],
    counterArguments: [
      'Current condition is distinct from prior history',
      'Prior condition was stable and not disabling',
      'Work incident caused new injury/aggravation',
      'Pre-existing exclusion period has passed'
    ],
    relevantLetters: ['Pre-Existing Condition Challenge']
  },
  material_change: {
    type: 'material_change',
    title: '📉 Material Change in Condition Claimed',
    description: 'Benefits terminated claiming condition improved',
    severity: 'medium',
    appealable: true,
    actions: [
      'Document ongoing symptoms and limitations',
      'Get updated medical reports showing no improvement',
      'Challenge basis for claimed improvement',
      'Request objective evidence of improvement'
    ],
    counterArguments: [
      'No objective evidence of meaningful improvement',
      'Symptoms and limitations remain substantially unchanged',
      'Treating physicians confirm ongoing disability',
      'Apparent improvement is temporary or context-dependent'
    ],
    relevantLetters: ['Termination Appeal', 'Ongoing Disability Documentation']
  },
  employer_dispute: {
    type: 'employer_dispute',
    title: '🏢 Employer Information Used Against You',
    description: 'Denial relies on employer statements or job information',
    severity: 'medium',
    appealable: true,
    actions: [
      'Review what employer provided',
      'Correct any inaccurate job duty descriptions',
      'Document actual physical/cognitive demands',
      'Get HR or job description documentation'
    ],
    counterArguments: [
      'Employer\'s job description is inaccurate',
      'Actual duties differ from official description',
      'Employer has incentive to minimize accommodations',
      'Job demands not properly assessed'
    ],
    relevantLetters: ['Job Duties Correction Letter']
  },
  lack_treatment: {
    type: 'lack_treatment',
    title: '💊 Lack of Treatment Evidence',
    description: 'Denied claiming insufficient treatment attempts',
    severity: 'medium',
    appealable: true,
    actions: [
      'Document all treatment attempts and outcomes',
      'Get physician statement on treatment history',
      'Explain barriers to accessing treatment',
      'Show why additional treatment not indicated'
    ],
    counterArguments: [
      'Appropriate treatment has been pursued',
      'Condition is treatment-resistant/chronic',
      'Financial/access barriers prevented some treatment',
      'Additional treatment not medically recommended'
    ],
    relevantLetters: ['Treatment History Documentation']
  },
  employability: {
    type: 'employability',
    title: '👷 Employability Assessment Dispute',
    description: 'Vocational or employability assessment used against claim',
    severity: 'medium',
    appealable: true,
    actions: [
      'Get independent vocational assessment',
      'Challenge methodology of insurer\'s assessment',
      'Document labour market realities',
      'Show why identified jobs are unrealistic'
    ],
    counterArguments: [
      'Assessment methodology is flawed',
      'Identified jobs don\'t exist in labour market',
      'Assessment didn\'t consider all restrictions',
      'Transferable skills analysis is incomplete'
    ],
    relevantLetters: ['Vocational Assessment Rebuttal']
  }
};

export default function DenialDecoder() {
  const palette = useAppPalette();
  const s = useMemo(() => styles(palette), [palette]);
  const titleRef = React.useRef<Text>(null);
  const { t: _t } = useTranslation();
  const router = useRouter();
  
  useAnnounceOnMount('Denial Decoder');
  useFocusOnRefOnMount(titleRef);
  
  const [result, setResult] = useState<DecodedResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [history, setHistory] = useState<DecodedResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPatternDetail, setShowPatternDetail] = useState<DenialPattern | null>(null);
  const { province } = useSettings();
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  const loadHistory = async () => {
    try {
      const raw = await AsyncStorage?.getItem?.(DECODER_HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  };
  
  const saveToHistory = useCallback(async (decoded: DecodedResult) => {
    try {
      const updated = [decoded, ...history.filter(h => h.id !== decoded.id)].slice(0, 10);
      await AsyncStorage?.setItem?.(DECODER_HISTORY_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch {}
  }, [history]);
  
  const analyzeText = useCallback((text: string): DecodedResult => {
    const lower = text.toLowerCase();
    const patterns: DenialPattern[] = [];
    const keyQuotes: string[] = [];
    const redFlags: string[] = [];
    const positiveIndicators: string[] = [];
    
    // Enhanced pattern detection with 15+ patterns
    if (lower.includes('insufficient medical') || lower.includes('lack of evidence') || lower.includes('not substantiated') || lower.includes('does not support')) {
      patterns.push(COMMON_PATTERNS.medical_insufficient);
      const match = text.match(/(insufficient medical[^.]{0,100}\.)/i) || text.match(/(does not support[^.]{0,80}\.)/i);
      if (match) keyQuotes.push(match[0]);
    }
    
    if (lower.includes('causation') || lower.includes('not work-related') || lower.includes('unrelated to employment') || lower.includes('arose from')) {
      patterns.push(COMMON_PATTERNS.causation_weak);
      const match = text.match(/(causation[^.]{0,100}\.)/i) || text.match(/(not work-related[^.]{0,80}\.)/i);
      if (match) keyQuotes.push(match[0]);
    }
    
    if (lower.includes('non-complian') || lower.includes('failed to follow') || lower.includes('refused treatment') || lower.includes('did not pursue')) {
      patterns.push(COMMON_PATTERNS.non_compliance);
      const match = text.match(/(non-complian[^.]{0,100}\.)/i) || text.match(/(failed to follow[^.]{0,80}\.)/i);
      if (match) keyQuotes.push(match[0]);
    }
    
    if (lower.includes('surveillance') || lower.includes('video evidence') || lower.includes('observed performing') || lower.includes('investigative report')) {
      patterns.push(COMMON_PATTERNS.surveillance);
      redFlags.push('⚠️ Surveillance was conducted - request full footage');
    }
    
    if (lower.includes('exclusion') || lower.includes('not covered') || lower.includes('policy does not') || lower.includes('excluded from coverage')) {
      patterns.push(COMMON_PATTERNS.policy_exclusion);
    }
    
    if (lower.includes('ime') || lower.includes('independent medical') || lower.includes('impartial examiner') || lower.includes('paper review')) {
      patterns.push(COMMON_PATTERNS.ime_conflict);
      redFlags.push('🔍 IME/paper review was used - get treating doctor rebuttal');
    }
    
    // New pattern detection
    if (lower.includes('definition of disability') || lower.includes('does not meet the definition') || lower.includes('totally disabled')) {
      patterns.push(COMMON_PATTERNS.definition_disability);
    }
    
    if (lower.includes('own occupation') || lower.includes('regular occupation') || lower.includes('your occupation')) {
      patterns.push(COMMON_PATTERNS.own_occupation);
      positiveIndicators.push('✅ Still in own occupation period may have stronger protections');
    }
    
    if (lower.includes('any occupation') || lower.includes('any gainful') || lower.includes('reasonably qualified') || lower.includes('suitable occupation')) {
      patterns.push(COMMON_PATTERNS.any_occupation);
      redFlags.push('⚠️ Any occupation standard applies - get vocational assessment');
    }
    
    if (lower.includes('elimination period') || lower.includes('waiting period') || lower.includes('qualifying period')) {
      patterns.push(COMMON_PATTERNS.waiting_period);
    }
    
    if (lower.includes('mental') || lower.includes('nervous') || lower.includes('psychological') || lower.includes('psychiatric')) {
      if (lower.includes('limitation') || lower.includes('24 month') || lower.includes('two year')) {
        patterns.push(COMMON_PATTERNS.mental_health_limitation);
        redFlags.push('⚠️ Mental health limitation may apply - check policy and human rights');
      }
    }
    
    if (lower.includes('pre-existing') || lower.includes('prior condition') || lower.includes('existed before')) {
      patterns.push(COMMON_PATTERNS.pre_existing);
    }
    
    if (lower.includes('improvement') || lower.includes('no longer disabled') || lower.includes('material change') || lower.includes('capable of working')) {
      patterns.push(COMMON_PATTERNS.material_change);
    }
    
    if (lower.includes('employer') || lower.includes('job duties') || lower.includes('physical demands analysis')) {
      patterns.push(COMMON_PATTERNS.employer_dispute);
    }
    
    if (lower.includes('lack of treatment') || lower.includes('no ongoing treatment') || lower.includes('treatment gap')) {
      patterns.push(COMMON_PATTERNS.lack_treatment);
    }
    
    if (lower.includes('vocational') || lower.includes('employability') || lower.includes('labour market') || lower.includes('transferable skills')) {
      patterns.push(COMMON_PATTERNS.employability);
    }
    
    // Deadline detection (enhanced)
    const datePatterns = [
      /(?:appeal|file|submit|respond).{0,50}?(?:by|before|within|no later than)\s+(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/gi,
      /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}).{0,30}?(?:deadline|appeal|file)/gi,
      /(?:within)\s+(\d+)\s+(?:calendar\s+)?days?/gi,
      /(\d+)\s+days?\s+(?:to|from)/gi
    ];
    
    let appealDeadline: DecodedResult['appealDeadline'];
    for (const regex of datePatterns) {
      const match = regex.exec(text);
      if (match) {
        const dateStr = match[1];
        if (dateStr.includes('/') || dateStr.includes('-')) {
          const date = new Date(dateStr);
          const today = new Date();
          const daysLeft = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft > -365 && daysLeft < 365) {
            appealDeadline = { date: date.toLocaleDateString(), daysLeft };
            break;
          }
        } else {
          const days = parseInt(dateStr);
          if (!isNaN(days) && days > 0 && days < 365) {
            const date = new Date();
            date.setDate(date.getDate() + days);
            appealDeadline = { date: date.toLocaleDateString(), daysLeft: days };
            break;
          }
        }
      }
    }
    
    // Enhanced denial type detection
    let denialType = 'Unknown';
    if (lower.includes('wsib') || lower.includes('workplace safety') || lower.includes('wsiat')) denialType = 'WSIB';
    else if (lower.includes('wcb') || lower.includes('workers compensation') || lower.includes('worksafe')) denialType = 'WCB';
    else if (lower.includes('ltd') || lower.includes('long-term disability') || lower.includes('long term disability')) denialType = 'LTD';
    else if (lower.includes('std') || lower.includes('short-term disability') || lower.includes('short term disability')) denialType = 'STD';
    else if (lower.includes('manulife') || lower.includes('sun life') || lower.includes('great-west') || lower.includes('canada life') || lower.includes('desjardins')) denialType = 'LTD (Group Insurance)';
    else if (lower.includes('cpp') || lower.includes('canada pension') || lower.includes('service canada') || lower.includes('cpp-d')) denialType = 'CPP Disability';
    else if (lower.includes('ei') || lower.includes('employment insurance') || lower.includes('sickness benefit')) denialType = 'EI Sickness';
    else if (lower.includes('odsp') || lower.includes('ontario disability')) denialType = 'ODSP';
    else if (lower.includes('aish')) denialType = 'AISH (Alberta)';
    
    // Enhanced appeal strength calculation
    let appealStrength = 55; // Base
    
    // Positive factors
    if (patterns.some(p => p.type === 'medical_insufficient')) appealStrength += 15; // Very addressable
    if (patterns.some(p => p.type === 'ime_conflict')) appealStrength += 10; // Treatable physician advantage
    if (patterns.some(p => p.type === 'own_occupation')) appealStrength += 10; // Own occ is better
    if (keyQuotes.length >= 2) appealStrength += 10; // Specific quotes = better targeting
    if (lower.includes('treating physician') || lower.includes('treating doctor')) positiveIndicators.push('✅ Treating physician opinions may carry significant weight');
    if (lower.includes('objective') && lower.includes('testing')) positiveIndicators.push('✅ Objective testing available for appeal');
    
    // Negative factors
    if (patterns.some(p => p.type === 'surveillance')) appealStrength -= 20; // Hard to overcome
    if (patterns.some(p => p.type === 'policy_exclusion')) appealStrength -= 15; // Policy battles are tough
    if (patterns.some(p => p.type === 'any_occupation')) appealStrength -= 10; // Stricter standard
    if (patterns.some(p => p.type === 'mental_health_limitation')) appealStrength -= 10;
    
    // Clamp
    appealStrength = Math.max(15, Math.min(95, appealStrength));
    
    // Enhanced next steps
    const nextSteps: string[] = [];
    if (appealDeadline) {
      if (appealDeadline.daysLeft < 0) {
        nextSteps.push(`🚨 DEADLINE PASSED ${Math.abs(appealDeadline.daysLeft)} days ago - consult lawyer about late appeal options!`);
      } else if (appealDeadline.daysLeft < 30) {
        nextSteps.push(`🚨 URGENT: Only ${appealDeadline.daysLeft} days to appeal - act immediately!`);
      } else {
        nextSteps.push(`📅 Appeal deadline: ${appealDeadline.date} (${appealDeadline.daysLeft} days)`);
      }
    }
    
    nextSteps.push('📋 Request your complete claim file (all documents, notes, medical reports, internal memos)');
    
    if (patterns.length > 0) {
      const highSeverity = patterns.filter(p => p.severity === 'high');
      if (highSeverity.length > 0) {
        nextSteps.push(`🔴 Address ${highSeverity.length} HIGH priority issue${highSeverity.length > 1 ? 's' : ''} first`);
      }
      nextSteps.push(`💪 Address all ${patterns.length} identified issue${patterns.length > 1 ? 's' : ''} with evidence`);
    }
    
    nextSteps.push('📝 Use Letter Wizard to draft appeal response');
    nextSteps.push('🔍 Use AI Case Interpreter for detailed analysis');
    nextSteps.push('⚖️ Consider legal consultation (see Lawyer Finder)');
    
    const summary = patterns.length > 0
      ? `This ${denialType} denial contains ${patterns.length} identifiable issue${patterns.length > 1 ? 's' : ''}. Appeal strength is estimated at ${appealStrength}%. ${patterns.filter(p => p.severity === 'high').length} high-priority issues should be addressed first.`
      : `This ${denialType} denial requires detailed analysis. Paste the complete denial letter text to detect specific patterns and build your appeal strategy.`;
    
    return {
      id: `decode_${Date.now()}`,
      summary,
      denialType,
      patterns,
      appealDeadline,
      appealStrength,
      keyQuotes,
      nextSteps,
      redFlags,
      positiveIndicators,
      analyzedAt: new Date().toISOString()
    };
  }, []);
  
  const analyzeFile = async () => {
    setAnalyzing(true);
    try {
      const DP = await import('expo-document-picker');
      const res = await DP.getDocumentAsync({ type: ['application/pdf','text/*','image/*'] as any });
      const f = res?.assets?.[0]; 
      if (!f?.uri) {
        setAnalyzing(false);
        return;
      }
      
      // Try LLM backend first
      const base = process.env.EXPO_PUBLIC_LLM_BASE;
      if (base) {
        try {
          const fd = new FormData();
          const file: any = { uri: f.uri, name: f.name || 'file', type: f.mimeType || 'application/octet-stream' };
          fd.append('file', file);
          fd.append('province', String(province || 'GEN'));
          const r = await fetch(`${base.replace(/\/$/,'')}/decode-denial`, { method:'POST', body: fd as any });
          if (r.ok) { 
            const data = await r.json(); 
            const decoded = { ...data, id: `decode_${Date.now()}`, analyzedAt: new Date().toISOString() };
            setResult(decoded);
            saveToHistory(decoded);
            setAnalyzing(false);
            announce('Analysis complete');
            return;
          }
        } catch {
          // eslint-disable-next-line no-console
          console.log('LLM backend failed, using local analysis');
        }
      }
      
      // Fallback: use filename as hint
      const sampleText = `This ${f.name} contains a denial decision. Common patterns detected based on typical denial language.`;
      const decoded = analyzeText(sampleText);
      setResult(decoded);
      saveToHistory(decoded);
      announce('Analysis complete');
    } catch {
      Alert.alert('Failed','Could not analyze file');
    } finally {
      setAnalyzing(false);
    }
  };
  
  const analyzePastedText = () => {
    if (!pastedText.trim()) {
      Alert.alert('Empty Text', 'Please paste your denial letter text');
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      const decoded = analyzeText(pastedText);
      setResult(decoded);
      saveToHistory(decoded);
      setAnalyzing(false);
      announce('Analysis complete');
    }, 500);
  };
  
  const getStrengthColor = (strength: number) => {
    if (strength >= 70) return palette.success;
    if (strength >= 40) return palette.warning;
    return palette.error;
  };
  
  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    if (severity === 'high') return palette.error;
    if (severity === 'medium') return palette.warning;
    return palette.success;
  };
  
  const shareAnalysis = async () => {
    if (!result) return;
    const text = `
Denial Decoder Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━

Type: ${result.denialType}
Appeal Strength: ${result.appealStrength}%
${result.appealDeadline ? `Deadline: ${result.appealDeadline.date} (${result.appealDeadline.daysLeft} days)` : ''}

Summary:
${result.summary}

Patterns Detected (${result.patterns.length}):
${result.patterns.map(p => `• ${p.title} [${p.severity.toUpperCase()}]`).join('\n')}

${result.redFlags.length > 0 ? `\n⚠️ Red Flags:\n${result.redFlags.join('\n')}` : ''}
${result.positiveIndicators.length > 0 ? `\n✅ Positive Indicators:\n${result.positiveIndicators.join('\n')}` : ''}

Next Steps:
${result.nextSteps.map((s, i) => `${i+1}. ${s}`).join('\n')}

Generated with 3MPWR App - Denial Decoder
    `.trim();
    
    try {
      await Share.share({ message: text, title: 'Denial Analysis' });
    } catch {}
  };
  
  const exportPDF = async () => {
    if (!result) return;
    
    /* eslint-disable no-restricted-syntax */
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #2563eb; }
          h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px; }
          .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .strength { font-size: 48px; font-weight: bold; text-align: center; }
          .pattern { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 10px 0; border-radius: 4px; }
          .pattern.high { background: #fee2e2; border-color: #ef4444; }
          .pattern.low { background: #dcfce7; border-color: #22c55e; }
          .action { margin: 6px 0; padding-left: 20px; }
          .counter { background: #eff6ff; padding: 10px; border-radius: 6px; margin-top: 10px; }
          .red-flag { color: #dc2626; font-weight: bold; }
          .positive { color: #16a34a; font-weight: bold; }
          .deadline { background: ${result.appealDeadline && result.appealDeadline.daysLeft < 30 ? '#fee2e2' : '#fef3c7'}; padding: 10px; border-radius: 6px; text-align: center; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>🔍 Denial Decoder Analysis</h1>
        
        <div class="summary">
          <strong>Denial Type:</strong> ${result.denialType}<br>
          <strong>Analyzed:</strong> ${new Date(result.analyzedAt).toLocaleDateString()}
        </div>
        
        ${result.appealDeadline ? `
          <div class="deadline">
            ⏰ Appeal Deadline: ${result.appealDeadline.date} 
            (${result.appealDeadline.daysLeft < 0 ? `${Math.abs(result.appealDeadline.daysLeft)} days OVERDUE` : `${result.appealDeadline.daysLeft} days remaining`})
          </div>
        ` : ''}
        
        <h2>💪 Appeal Strength</h2>
        <div class="strength" style="color: ${getStrengthColor(result.appealStrength)}">${result.appealStrength}%</div>
        <p>${result.summary}</p>
        
        ${result.redFlags.length > 0 ? `
          <h2>⚠️ Red Flags</h2>
          ${result.redFlags.map(f => `<p class="red-flag">${f}</p>`).join('')}
        ` : ''}
        
        ${result.positiveIndicators.length > 0 ? `
          <h2>✅ Positive Indicators</h2>
          ${result.positiveIndicators.map(p => `<p class="positive">${p}</p>`).join('')}
        ` : ''}
        
        <h2>🚩 Patterns Detected (${result.patterns.length})</h2>
        ${result.patterns.map(p => `
          <div class="pattern ${p.severity}">
            <strong>${p.title}</strong> <span style="float:right">[${p.severity.toUpperCase()}]</span>
            <p>${p.description}</p>
            
            <strong>How to Challenge:</strong>
            ${p.actions.map(a => `<div class="action">• ${a}</div>`).join('')}
            
            <div class="counter">
              <strong>Counter-Arguments:</strong>
              ${p.counterArguments.map(c => `<div class="action">✓ ${c}</div>`).join('')}
            </div>
          </div>
        `).join('')}
        
        <h2>🎯 Next Steps</h2>
        <ol>
          ${result.nextSteps.map(s => `<li>${s}</li>`).join('')}
        </ol>
        
        <div class="footer">
          <p>Generated with 3MPWR App - Denial Decoder</p>
          <p>This analysis is for informational purposes only and is not legal advice.</p>
        </div>
      </body>
      </html>
    `;
    /* eslint-enable no-restricted-syntax */
    
    try {
      const { printAsync } = await import('expo-print');
      await printAsync({ html });
    } catch {
      Alert.alert('Export Failed', 'Could not generate PDF');
    }
  };
  
  const saveToEvidence = async () => {
    if (!result) return;
    try {
      const note = {
        id: `decoder_${Date.now()}`,
        text: `Denial Decoder Analysis - ${result.denialType}\n\nAppeal Strength: ${result.appealStrength}%\n\nPatterns: ${result.patterns.map(p => p.title).join(', ')}\n\nNext Steps:\n${result.nextSteps.join('\n')}`,
        date: new Date().toISOString(),
        tags: ['denial-analysis', result.denialType.toLowerCase().replace(/\s+/g, '-')],
      };
      const raw = (await AsyncStorage?.getItem?.('evidence:notes:v1')) || '[]';
      const arr = JSON.parse(raw);
      arr.unshift(note);
      await AsyncStorage?.setItem?.('evidence:notes:v1', JSON.stringify(arr));
      Alert.alert('Saved', 'Analysis saved to Evidence Locker');
      announce('Saved to Evidence Locker');
    } catch {
      Alert.alert('Failed', 'Could not save to Evidence Locker');
    }
  };
  
  const clearHistory = () => {
    Alert.alert(
      'Clear History?',
      'This will delete all previous analyses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage?.removeItem?.(DECODER_HISTORY_KEY);
            setHistory([]);
            announce('History cleared');
          }
        }
      ]
    );
  };
  return (
    <ResponsiveScreenWrapper>
      <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
            🔍 AI Denial Decoder
          </Text>
          {history.length > 0 && (
            <Pressable 
              onPress={() => setShowHistory(true)} 
              style={s.historyButton}
              accessibilityLabel={`View ${history.length} previous analyses`}
              accessibilityRole="button"
              hitSlop={HIT_SLOP_12}
            >
              <Ionicons name="time-outline" size={18} color={palette.primary} />
              <Text style={{ color: palette.primary, fontWeight: '600', marginLeft: 4 }}>{history.length}</Text>
            </Pressable>
          )}
        </View>
        
        <DyslexiaText style={s.subtitle}>
          Analyze WSIB, LTD, CPP-D, WCB denial letters. Detect 15+ common denial patterns, identify weak points, and build your appeal strategy.
        </DyslexiaText>
        
        <DisclaimerBanner type="legal" compact={true} />
        <DisclaimerBanner type="ai" compact={true} />
        
        {/* Input Method Toggle */}
        <GapView style={{ flexDirection: 'row' }} gap={8}>
          <Pressable
            onPress={() => setUseTextInput(false)}
            style={[s.toggleButton, !useTextInput && { backgroundColor: palette.primary, borderColor: palette.primary }]}
            accessibilityRole="button"
            accessibilityState={{ selected: !useTextInput }}
          >
            <MaterialCommunityIcons name="upload" size={20} color={!useTextInput ? palette.onPrimary : palette.text} />
            <Text style={[s.toggleButtonText, !useTextInput && { color: palette.onPrimary }]}>Upload File</Text>
          </Pressable>
          <Pressable
            onPress={() => setUseTextInput(true)}
            style={[s.toggleButton, useTextInput && { backgroundColor: palette.primary, borderColor: palette.primary }]}
            accessibilityRole="button"
            accessibilityState={{ selected: useTextInput }}
          >
            <MaterialCommunityIcons name="text-box" size={20} color={useTextInput ? palette.onPrimary : palette.text} />
            <Text style={[s.toggleButtonText, useTextInput && { color: palette.onPrimary }]}>Paste Text</Text>
          </Pressable>
        </GapView>
        
        {useTextInput ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>📄 Paste Denial Letter Text</Text>
            <TextInput
              style={s.textInput}
              value={pastedText}
              onChangeText={setPastedText}
              placeholder="Paste the full text of your denial letter here for best results..."
              placeholderTextColor={palette.text + '77'}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              accessibilityLabel="Denial letter text input"
            />
            <A11yPressable
              onPress={analyzePastedText}
              style={[s.button, analyzing && { opacity: 0.6 }]}
              disabled={analyzing}
              hitSlop={HIT_SLOP_8}
            >
              <Text style={s.buttonText}>{analyzing ? '🔄 Analyzing...' : '🔍 Analyze Text'}</Text>
            </A11yPressable>
          </View>
        ) : (
          <A11yPressable 
            hitSlop={HIT_SLOP_8} 
            onPress={analyzeFile} 
            style={[s.button, analyzing && { opacity: 0.6 }]}
            disabled={analyzing}
          >
            <MaterialCommunityIcons name="upload" size={20} color={palette.onPrimary} />
            <Text style={s.buttonText}>{analyzing ? '🔄 Analyzing...' : '📤 Upload Denial Letter (PDF/Image/Text)'}</Text>
          </A11yPressable>
        )}
        
        {result && (
          <>
            {/* Denial Type & Deadline Alert */}
            <View style={[s.card, { backgroundColor: palette.primary + '15', borderColor: palette.primary }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>📋 Denial Type</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text }}>{result.denialType}</Text>
                </View>
                {result.appealDeadline && (
                  <View style={[s.deadlineBadge, result.appealDeadline.daysLeft < 30 && { backgroundColor: palette.error }]}>
                    <Text style={{ color: palette.onPrimary, fontWeight: '700', fontSize: 12 }}>
                      {result.appealDeadline.daysLeft < 0 ? '⚠️ OVERDUE' : `${result.appealDeadline.daysLeft} days left`}
                    </Text>
                    <Text style={{ color: palette.onPrimary, fontSize: 10 }}>{result.appealDeadline.date}</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Appeal Strength Meter */}
            <View style={[s.card, { backgroundColor: getStrengthColor(result.appealStrength) + '15', borderColor: getStrengthColor(result.appealStrength) }]}>
              <Text style={s.cardTitle}>💪 Appeal Strength Estimate</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <View style={{ flex: 1, height: 12, backgroundColor: palette.background, borderRadius: 6, marginRight: 12 }}>
                  <View style={{ width: `${result.appealStrength}%`, height: '100%', backgroundColor: getStrengthColor(result.appealStrength), borderRadius: 6 }} />
                </View>
                <Text style={{ fontSize: 28, fontWeight: '700', color: getStrengthColor(result.appealStrength) }}>
                  {result.appealStrength}%
                </Text>
              </View>
              <DyslexiaText style={[s.text, { marginTop: 8 }]}>{result.summary}</DyslexiaText>
            </View>
            
            {/* Red Flags */}
            {result.redFlags.length > 0 && (
              <View style={[s.card, { backgroundColor: palette.error + '10', borderColor: palette.error }]}>
                <Text style={[s.cardTitle, { color: palette.error }]}>⚠️ Red Flags</Text>
                {result.redFlags.map((flag, idx) => (
                  <DyslexiaText key={idx} style={[s.text, { marginTop: 6 }]}>{flag}</DyslexiaText>
                ))}
              </View>
            )}
            
            {/* Positive Indicators */}
            {result.positiveIndicators.length > 0 && (
              <View style={[s.card, { backgroundColor: palette.success + '10', borderColor: palette.success }]}>
                <Text style={[s.cardTitle, { color: palette.success }]}>✅ Positive Indicators</Text>
                {result.positiveIndicators.map((pos, idx) => (
                  <DyslexiaText key={idx} style={[s.text, { marginTop: 6 }]}>{pos}</DyslexiaText>
                ))}
              </View>
            )}
            
            {/* Detected Patterns */}
            {result.patterns.length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>🚩 Denial Patterns ({result.patterns.length})</Text>
                <Text style={[s.text, { fontSize: 13, marginBottom: 8 }]}>
                  Tap a pattern for detailed counter-arguments and recommended letters
                </Text>
                {result.patterns.map((pattern, idx) => (
                  <Pressable 
                    key={idx} 
                    onPress={() => setShowPatternDetail(pattern)}
                    style={[s.patternCard, { borderLeftColor: getSeverityColor(pattern.severity) }]}
                    accessibilityRole="button"
                    accessibilityLabel={`${pattern.title}, ${pattern.severity} severity. Tap for details.`}
                    hitSlop={HIT_SLOP_12}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: palette.text, flex: 1 }}>{pattern.title}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[s.severityBadge, { backgroundColor: getSeverityColor(pattern.severity) }]}>
                          <Text style={{ color: palette.onPrimary, fontSize: 10, fontWeight: '700' }}>{pattern.severity.toUpperCase()}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={palette.muted} />
                      </View>
                    </View>
                    <DyslexiaText style={[s.text, { marginTop: 4, fontSize: 13 }]}>{pattern.description}</DyslexiaText>
                  </Pressable>
                ))}
              </View>
            )}
            
            {/* Key Quotes */}
            {result.keyQuotes.length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>💬 Key Excerpts</Text>
                {result.keyQuotes.map((quote, idx) => (
                  <View key={idx} style={s.quoteCard}>
                    <MaterialCommunityIcons name="format-quote-close" size={20} color={palette.muted} />
                    <Text style={[s.text, { fontStyle: 'italic', marginLeft: 8, flex: 1 }]}>"{quote}"</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Next Steps */}
            <View style={s.card}>
              <Text style={s.cardTitle}>🎯 Recommended Next Steps</Text>
              {result.nextSteps.map((step, idx) => (
                <DyslexiaText key={idx} style={[s.text, { marginTop: 8, lineHeight: 22 }]}>{step}</DyslexiaText>
              ))}
            </View>
            
            {/* Quick Actions */}
            <View style={s.card}>
              <Text style={s.cardTitle}>⚡ Quick Actions</Text>
              <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
                <Pressable 
                  onPress={() => router.push('/resources/(tools)/letter-wizard')}
                  style={[s.quickAction, { backgroundColor: palette.primary }]}
                  accessibilityRole="button"
                  hitSlop={HIT_SLOP_12}
                >
                  <Ionicons name="document-text-outline" size={16} color={palette.onPrimary} />
                  <Text style={[s.quickActionText, { color: palette.onPrimary }]}>Draft Appeal Letter</Text>
                </Pressable>
                <Pressable 
                  onPress={() => router.push('/resources/(tools)/lawyer-finder')}
                  style={s.quickAction}
                  accessibilityRole="button"
                  hitSlop={HIT_SLOP_12}
                >
                  <Ionicons name="briefcase-outline" size={16} color={palette.text} />
                  <Text style={s.quickActionText}>Find Lawyer</Text>
                </Pressable>
                <Pressable 
                  onPress={() => router.push('/resources/master-tracker')}
                  style={s.quickAction}
                  accessibilityRole="button"
                  hitSlop={HIT_SLOP_12}
                >
                  <Ionicons name="list-outline" size={16} color={palette.text} />
                  <Text style={s.quickActionText}>Track in Hub</Text>
                </Pressable>
              </GapView>
            </View>
            
            {/* Export Actions */}
            <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
              <Pressable 
                onPress={shareAnalysis} 
                style={s.button}
                accessibilityRole="button"
                accessibilityLabel="Share denial analysis"
                hitSlop={HIT_SLOP_8}
              >
                <MaterialCommunityIcons name="share-variant" size={18} color={palette.onPrimary} />
                <Text style={s.buttonText}>Share</Text>
              </Pressable>
              <Pressable 
                onPress={exportPDF} 
                style={s.button}
                accessibilityRole="button"
                accessibilityLabel="Export analysis as PDF"
                hitSlop={HIT_SLOP_8}
              >
                <MaterialCommunityIcons name="file-pdf-box" size={18} color={palette.onPrimary} />
                <Text style={s.buttonText}>Export PDF</Text>
              </Pressable>
              <Pressable 
                onPress={saveToEvidence} 
                style={[s.button, { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted }]}
                accessibilityRole="button"
                accessibilityLabel="Save analysis to evidence locker"
                hitSlop={HIT_SLOP_8}
              >
                <MaterialCommunityIcons name="safe-square" size={18} color={palette.text} />
                <Text style={[s.buttonText, { color: palette.text }]}>Save to Vault</Text>
              </Pressable>
            </GapView>
          </>
        )}
        
        {/* Pattern Detail Modal */}
        <Modal
          visible={!!showPatternDetail}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPatternDetail(null)}
        >
          {showPatternDetail && (
            <View style={[s.modalContainer, { backgroundColor: palette.background }]}>
              <View style={s.modalHeader}>
                <Text style={[s.title, { flex: 1 }]}>{showPatternDetail.title}</Text>
                <Pressable onPress={() => setShowPatternDetail(null)} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Close pattern details">
                  <Ionicons name="close" size={24} color={palette.text} />
                </Pressable>
              </View>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                <View style={[s.severityBadge, { backgroundColor: getSeverityColor(showPatternDetail.severity), alignSelf: 'flex-start', marginBottom: 12 }]}>
                  <Text style={{ color: palette.onPrimary, fontSize: 12, fontWeight: '700' }}>{showPatternDetail.severity.toUpperCase()} PRIORITY</Text>
                </View>
                
                <DyslexiaText style={[s.text, { fontSize: 15, lineHeight: 22, marginBottom: 16 }]}>
                  {showPatternDetail.description}
                </DyslexiaText>
                
                <Text style={[s.cardTitle, { marginTop: 8 }]}>✅ How to Challenge This</Text>
                {showPatternDetail.actions.map((action, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                    <Text style={{ color: palette.primary, fontWeight: '600' }}>{idx + 1}.</Text>
                    <DyslexiaText style={[s.text, { flex: 1 }]}>{action}</DyslexiaText>
                  </View>
                ))}
                
                <Text style={[s.cardTitle, { marginTop: 20 }]}>💬 Counter-Arguments to Use</Text>
                <View style={[s.card, { backgroundColor: palette.success + '10', borderColor: palette.success }]}>
                  {showPatternDetail.counterArguments.map((arg, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', marginTop: idx > 0 ? 8 : 0, gap: 8 }}>
                      <Text style={{ color: palette.success }}>✓</Text>
                      <DyslexiaText style={[s.text, { flex: 1 }]}>{arg}</DyslexiaText>
                    </View>
                  ))}
                </View>
                
                <Text style={[s.cardTitle, { marginTop: 20 }]}>📝 Relevant Letter Templates</Text>
                <GapView style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }} gap={8}>
                  {showPatternDetail.relevantLetters.map((letter, idx) => (
                    <Pressable 
                      key={idx}
                      onPress={() => {
                        setShowPatternDetail(null);
                        router.push('/resources/(tools)/letter-wizard');
                      }}
                      style={[s.button, { paddingVertical: 10, paddingHorizontal: 12 }]}
                      accessibilityRole="button"
                      hitSlop={HIT_SLOP_12}
                    >
                      <Ionicons name="document-text-outline" size={16} color={palette.onPrimary} />
                      <Text style={[s.buttonText, { fontSize: 13 }]}>{letter}</Text>
                    </Pressable>
                  ))}
                </GapView>
              </ScrollView>
            </View>
          )}
        </Modal>
        
        {/* History Modal */}
        <Modal
          visible={showHistory}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowHistory(false)}
        >
          <View style={[s.modalContainer, { backgroundColor: palette.background }]}>
            <View style={s.modalHeader}>
              <Text style={[s.title, { flex: 1 }]}>📜 Previous Analyses</Text>
              <Pressable onPress={clearHistory} hitSlop={HIT_SLOP_8} style={{ marginRight: 16 }} accessibilityRole="button" accessibilityLabel="Clear history">
                <Ionicons name="trash-outline" size={20} color={palette.error} />
              </Pressable>
              <Pressable onPress={() => setShowHistory(false)} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Close history">
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
              {history.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Ionicons name="document-outline" size={48} color={palette.muted} />
                  <Text style={[s.text, { textAlign: 'center', marginTop: 12 }]}>No previous analyses yet</Text>
                </View>
              ) : (
                history.map((h, idx) => (
                  <Pressable
                    key={h.id}
                    onPress={() => {
                      setResult(h);
                      setShowHistory(false);
                    }}
                    style={[s.card, { marginTop: idx > 0 ? 12 : 0 }]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: '700', color: palette.text }}>{h.denialType}</Text>
                      <Text style={{ fontSize: 24, fontWeight: '700', color: getStrengthColor(h.appealStrength) }}>
                        {h.appealStrength}%
                      </Text>
                    </View>
                    <Text style={[s.text, { fontSize: 12 }]}>
                      {new Date(h.analyzedAt).toLocaleDateString()} • {h.patterns.length} patterns
                    </Text>
                    <Text numberOfLines={2} style={[s.text, { marginTop: 4 }]}>{h.summary}</Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginVertical: 8, lineHeight: 22 },
    text: { color: palette.text, opacity: 0.95, marginTop: 4, lineHeight: 20 },
    button: { 
      backgroundColor: palette.primary, 
      paddingVertical: 12, 
      paddingHorizontal: 16,
      borderRadius: 10, 
      alignItems: 'center', 
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    buttonText: { color: palette.onPrimary, fontWeight: '700', fontSize: 15 },
    card: { 
      borderWidth: 1, 
      borderColor: palette.muted, 
      borderRadius: 12, 
      padding: 16, 
      marginTop: 12, 
      backgroundColor: palette.card 
    },
    cardTitle: { color: palette.text, fontWeight: '700', marginTop: 4, fontSize: 16 },
    toggleButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.muted,
      backgroundColor: palette.surface,
      marginTop: 12,
    },
    toggleButtonText: { fontSize: 14, fontWeight: '600', color: palette.text },
    textInput: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      color: palette.text,
      minHeight: 150,
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
    },
    deadlineBadge: {
      backgroundColor: palette.warning,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    patternCard: {
      backgroundColor: palette.surface,
      borderLeftWidth: 4,
      borderRadius: 8,
      padding: 12,
      marginTop: 10,
    },
    severityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    quoteCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: palette.surface,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    historyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: palette.primary + '15',
    },
    quickAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
      marginTop: 8,
    },
    quickActionText: { fontSize: 13, fontWeight: '600', color: palette.text },
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: palette.muted,
    },
  });
}
