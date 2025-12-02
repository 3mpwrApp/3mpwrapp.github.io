/**
 * Claims Navigator - Enhanced Guided Claims System
 * 
 * Comprehensive features:
 * - Multi-step claim process wizard
 * - Jurisdiction-specific guidance (WSIB, WCB, etc.)
 * - Document checklist generator
 * - Progress tracking
 * - Deadline reminders
 * - Template letter suggestions
 * - Evidence requirements
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import { DyslexiaText } from "../../../components/DyslexiaText";
import { GapView } from "../../../components/GapView";
import ResponsiveScreenWrapper from "../../../components/ResponsiveScreenWrapper";
import { HIT_SLOP_8 } from "../../../constants/A11Y";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useAppPalette } from "../../../theme/usePalette";
import { announce } from "../../../utils/announce";

let AsyncStorage: any;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

export const options = { href: null };

const CLAIMS_DATA_KEY = 'claimsNavigator:data:v1';

type ClaimType = 'wsib' | 'wcb' | 'ltd' | 'std' | 'cpp-d' | 'odsp' | 'ei-sickness' | 'other';
type ClaimPhase = 'initial' | 'medical' | 'documentation' | 'filing' | 'review' | 'appeal';

interface ClaimStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  documents?: string[];
  deadline?: string;
  completed: boolean;
  notes?: string;
}

interface ClaimData {
  id: string;
  type: ClaimType;
  phase: ClaimPhase;
  incident: string;
  incidentDate?: string;
  limitations: string;
  employer: string;
  jurisdiction: string;
  steps: ClaimStep[];
  documents: { name: string; collected: boolean }[];
  deadlines: { date: string; description: string }[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const CLAIM_TYPES: { value: ClaimType; label: string; icon: string }[] = [
  { value: 'wsib', label: 'WSIB (Ontario)', icon: '🏭' },
  { value: 'wcb', label: 'WCB (Other Provinces)', icon: '🏗️' },
  { value: 'ltd', label: 'Long-Term Disability', icon: '📋' },
  { value: 'std', label: 'Short-Term Disability', icon: '⏰' },
  { value: 'cpp-d', label: 'CPP Disability', icon: '🍁' },
  { value: 'odsp', label: 'ODSP', icon: '🏠' },
  { value: 'ei-sickness', label: 'EI Sickness Benefits', icon: '💼' },
  { value: 'other', label: 'Other/Multiple', icon: '📁' },
];

const PHASE_CONFIG: Record<ClaimPhase, { label: string; icon: string; color: string }> = {
  initial: { label: 'Initial Report', icon: '📝', color: '#3b82f6' },
  medical: { label: 'Medical Evidence', icon: '🏥', color: '#10b981' },
  documentation: { label: 'Documentation', icon: '📋', color: '#8b5cf6' },
  filing: { label: 'Filing Claim', icon: '📤', color: '#f59e0b' },
  review: { label: 'Under Review', icon: '⏳', color: '#6b7280' },
  appeal: { label: 'Appeal Process', icon: '⚖️', color: '#ef4444' },
};

const JURISDICTIONS = [
  'Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 
  'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland & Labrador',
  'Prince Edward Island', 'Northwest Territories', 'Yukon', 'Nunavut', 'Federal'
];

const COMMON_DOCUMENTS: Record<ClaimType, string[]> = {
  wsib: [
    'Form 6 - Worker\'s Report of Injury',
    'Form 7 - Employer\'s Report of Injury',
    'Form 8 - Health Professional\'s Report',
    'Functional Abilities Form (FAF)',
    'Medical reports/clinical notes',
    'Witness statements',
    'Photos of injury/workplace',
    'Employment records',
  ],
  wcb: [
    'Worker\'s Report of Injury',
    'Employer\'s Report of Injury',
    'Physician\'s First Report',
    'Functional Capacity Evaluation',
    'Medical records',
    'Incident report',
  ],
  ltd: [
    'Claim application form',
    'Employer statement',
    'Attending Physician Statement (APS)',
    'Functional Abilities Form',
    'Medical records (2+ years)',
    'Specialist reports',
    'Test results (labs, imaging)',
    'Treatment plan',
  ],
  std: [
    'Claim initiation form',
    'Medical certificate',
    'Employer confirmation',
    'Return-to-work plan',
  ],
  'cpp-d': [
    'Application Kit (ISP-1151)',
    'Medical Report (ISP-2519)',
    'Questionnaire (ISP-1152)',
    'Authorization forms',
    'Medical records summary',
    'Work history (15 years)',
    'Medication list',
  ],
  odsp: [
    'Application for Income Support',
    'Health Status Report',
    'Activities of Daily Living Report',
    'Consent forms',
    'Proof of identity',
    'Proof of residence',
    'Income verification',
  ],
  'ei-sickness': [
    'Medical certificate',
    'Record of Employment (ROE)',
    'Application form',
    'Direct deposit info',
  ],
  other: [
    'Incident/injury report',
    'Medical documentation',
    'Employment records',
    'Financial documents',
  ],
};

function generateStepsForClaim(type: ClaimType, data: Partial<ClaimData>): ClaimStep[] {
  const baseSteps: ClaimStep[] = [
    {
      id: 'report',
      title: 'Document the Incident',
      description: 'Write a detailed incident report including date, time, location, what happened, and any witnesses.',
      required: true,
      completed: false,
    },
    {
      id: 'notify',
      title: 'Notify Employer',
      description: data.employer 
        ? `Notify ${data.employer} in writing. Request written acknowledgement.`
        : 'Notify your employer in writing. Keep a copy and request acknowledgement.',
      required: true,
      completed: false,
    },
    {
      id: 'medical',
      title: 'Seek Medical Attention',
      description: 'Get medical treatment and documentation. Ask for copies of all reports.',
      required: true,
      documents: ['Medical records', 'Clinical notes', 'Test results'],
      completed: false,
    },
    {
      id: 'faf',
      title: 'Request Functional Abilities Form',
      description: 'Ask your treating physician to complete a Functional Abilities Form (FAF) documenting your limitations.',
      required: true,
      documents: ['Functional Abilities Form'],
      completed: false,
    },
  ];

  // Add type-specific steps
  const typeSpecificSteps: Record<ClaimType, ClaimStep[]> = {
    wsib: [
      {
        id: 'form6',
        title: 'Complete Form 6',
        description: 'Worker\'s Report of Injury/Disease - submit within 6 months of awareness.',
        required: true,
        deadline: '6 months from injury date',
        documents: ['Form 6'],
        completed: false,
      },
      {
        id: 'form8',
        title: 'Ensure Form 8 is Submitted',
        description: 'Your healthcare provider should submit Health Professional\'s Report.',
        required: true,
        documents: ['Form 8'],
        completed: false,
      },
      {
        id: 'wsib-track',
        title: 'Track Your Claim',
        description: 'Use WSIB\'s online portal to monitor claim status. Note your claim number.',
        required: false,
        completed: false,
      },
    ],
    wcb: [
      {
        id: 'worker-report',
        title: 'Submit Worker\'s Report',
        description: 'Complete and submit your Worker\'s Report of Injury form.',
        required: true,
        completed: false,
      },
      {
        id: 'physician-report',
        title: 'Physician\'s First Report',
        description: 'Ensure your doctor submits the initial medical report.',
        required: true,
        completed: false,
      },
    ],
    ltd: [
      {
        id: 'review-policy',
        title: 'Review Your Policy',
        description: 'Get a copy of your LTD policy. Note the definition of disability, waiting period, and exclusions.',
        required: true,
        completed: false,
      },
      {
        id: 'apply-std',
        title: 'Apply for STD First (if applicable)',
        description: 'Many LTD policies require you to be on STD first during the elimination period.',
        required: false,
        completed: false,
      },
      {
        id: 'aps',
        title: 'Attending Physician Statement',
        description: 'Have your doctor complete the APS form from your insurer.',
        required: true,
        documents: ['Attending Physician Statement'],
        completed: false,
      },
      {
        id: 'ltd-apply',
        title: 'Submit LTD Application',
        description: 'Complete and submit the full application package with all supporting documents.',
        required: true,
        completed: false,
      },
    ],
    std: [
      {
        id: 'std-initiate',
        title: 'Initiate STD Claim',
        description: 'Contact your employer\'s HR or benefits administrator to start the claim.',
        required: true,
        completed: false,
      },
      {
        id: 'std-medical',
        title: 'Get Medical Certificate',
        description: 'Obtain a medical certificate stating your inability to work.',
        required: true,
        documents: ['Medical certificate'],
        completed: false,
      },
    ],
    'cpp-d': [
      {
        id: 'cpp-kit',
        title: 'Get Application Kit',
        description: 'Request the CPP-D Application Kit from Service Canada or download online.',
        required: true,
        completed: false,
      },
      {
        id: 'cpp-medical',
        title: 'Medical Report (ISP-2519)',
        description: 'Have your doctor complete the detailed medical report.',
        required: true,
        documents: ['Medical Report ISP-2519'],
        completed: false,
      },
      {
        id: 'cpp-questionnaire',
        title: 'Complete Questionnaire',
        description: 'Fill out the questionnaire about your daily activities and work history.',
        required: true,
        documents: ['Questionnaire ISP-1152'],
        completed: false,
      },
      {
        id: 'cpp-submit',
        title: 'Submit Application',
        description: 'Mail or submit online. Keep copies of everything.',
        required: true,
        deadline: 'As soon as possible - can take 4-6 months to process',
        completed: false,
      },
    ],
    odsp: [
      {
        id: 'odsp-apply',
        title: 'Apply for ODSP',
        description: 'Submit application for income support online or at local office.',
        required: true,
        completed: false,
      },
      {
        id: 'odsp-health',
        title: 'Health Status Report',
        description: 'Have your healthcare provider complete the Disability Determination Package.',
        required: true,
        documents: ['Health Status Report'],
        completed: false,
      },
      {
        id: 'odsp-adl',
        title: 'Activities of Daily Living',
        description: 'Complete the ADL report describing how your disability affects daily life.',
        required: true,
        documents: ['Activities of Daily Living Report'],
        completed: false,
      },
    ],
    'ei-sickness': [
      {
        id: 'ei-roe',
        title: 'Get Record of Employment',
        description: 'Your employer must issue an ROE when you stop working.',
        required: true,
        documents: ['Record of Employment'],
        completed: false,
      },
      {
        id: 'ei-apply',
        title: 'Apply Online',
        description: 'Submit EI application through Service Canada website.',
        required: true,
        completed: false,
      },
      {
        id: 'ei-cert',
        title: 'Medical Certificate',
        description: 'Get a medical certificate if requested.',
        required: false,
        documents: ['Medical certificate'],
        completed: false,
      },
    ],
    other: [],
  };

  const allSteps = [...baseSteps, ...(typeSpecificSteps[type] || [])];
  
  // Add final steps
  allSteps.push({
    id: 'track',
    title: 'Track All Communications',
    description: 'Log every call, email, and letter in your Evidence Locker.',
    required: true,
    completed: false,
  });
  
  allSteps.push({
    id: 'deadlines',
    title: 'Set Deadline Reminders',
    description: 'Use the Deadline Calculator to track important dates.',
    required: true,
    completed: false,
  });

  return allSteps;
}

export default function ClaimsNavigator() {
  const palette = useAppPalette();
  const s = useMemo(() => createStyles(palette), [palette]);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  const router = useRouter();
  
  useAnnounceOnMount(t("claimsNavigator.title", "Guided Claims Navigator"));
  useFocusOnRefOnMount(titleRef);

  const [claim, setClaim] = useState<ClaimData | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'steps' | 'docs'>('info');
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  // Form state
  const [claimType, setClaimType] = useState<ClaimType>('wsib');
  const [incident, setIncident] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [limitations, setLimitations] = useState("");
  const [employer, setEmployer] = useState("");
  const [jurisdiction, setJurisdiction] = useState("Ontario");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadClaim();
  }, []);

  const loadClaim = async () => {
    try {
      const raw = await AsyncStorage?.getItem?.(CLAIMS_DATA_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setClaim(data);
        setClaimType(data.type);
        setIncident(data.incident);
        setIncidentDate(data.incidentDate || '');
        setLimitations(data.limitations);
        setEmployer(data.employer);
        setJurisdiction(data.jurisdiction);
        setNotes(data.notes);
      }
    } catch {}
  };

  const saveClaim = useCallback(async (updates?: Partial<ClaimData>) => {
    try {
      const steps = claim?.steps || generateStepsForClaim(claimType, { employer, incident, limitations });
      const documents = claim?.documents || COMMON_DOCUMENTS[claimType].map(d => ({ name: d, collected: false }));
      
      const data: ClaimData = {
        id: claim?.id || `claim_${Date.now()}`,
        type: claimType,
        phase: claim?.phase || 'initial',
        incident,
        incidentDate: incidentDate || undefined,
        limitations,
        employer,
        jurisdiction,
        steps,
        documents,
        deadlines: claim?.deadlines || [],
        notes,
        createdAt: claim?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates,
      };
      await AsyncStorage?.setItem?.(CLAIMS_DATA_KEY, JSON.stringify(data));
      setClaim(data);
      announce(t('claimsNavigator.saved', 'Claim saved'));
    } catch {}
  }, [claim, claimType, incident, incidentDate, limitations, employer, jurisdiction, notes, t]);

  const generatePlan = () => {
    if (!incident.trim()) {
      Alert.alert('Missing Information', 'Please describe what happened before generating your plan.');
      return;
    }
    const steps = generateStepsForClaim(claimType, { employer, incident, limitations });
    const documents = COMMON_DOCUMENTS[claimType].map(d => ({ name: d, collected: false }));
    saveClaim({ steps, documents });
    setActiveTab('steps');
    announce('Plan generated');
  };

  const toggleStep = (stepId: string) => {
    if (!claim) return;
    const steps = claim.steps.map(s => 
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    saveClaim({ steps });
  };

  const toggleDocument = (docName: string) => {
    if (!claim) return;
    const documents = claim.documents.map(d => 
      d.name === docName ? { ...d, collected: !d.collected } : d
    );
    saveClaim({ documents });
  };

  const updatePhase = (phase: ClaimPhase) => {
    saveClaim({ phase });
    announce(`Phase updated to ${PHASE_CONFIG[phase].label}`);
  };

  const exportPlan = async () => {
    if (!claim) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #2563eb; }
          h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
          .info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .step { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .step.completed { opacity: 0.6; }
          .step-title { font-weight: 600; }
          .step-desc { color: #6b7280; margin-top: 4px; }
          .required { color: #ef4444; font-size: 12px; }
          .doc { padding: 8px 0; }
          .doc.collected { color: #10b981; }
          .footer { margin-top: 30px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        </style>
      </head>
      <body>
        <h1>📋 Claims Navigator Plan</h1>
        
        <div class="info">
          <strong>Claim Type:</strong> ${CLAIM_TYPES.find(c => c.value === claim.type)?.label}<br>
          <strong>Phase:</strong> ${PHASE_CONFIG[claim.phase].label}<br>
          <strong>Jurisdiction:</strong> ${claim.jurisdiction}<br>
          ${claim.employer ? `<strong>Employer:</strong> ${claim.employer}<br>` : ''}
          ${claim.incidentDate ? `<strong>Incident Date:</strong> ${claim.incidentDate}<br>` : ''}
        </div>
        
        <h2>📝 Incident Description</h2>
        <p>${claim.incident}</p>
        
        ${claim.limitations ? `<h2>⚠️ Limitations</h2><p>${claim.limitations}</p>` : ''}
        
        <h2>✅ Action Steps (${claim.steps.filter(s => s.completed).length}/${claim.steps.length})</h2>
        ${claim.steps.map(s => `
          <div class="step ${s.completed ? 'completed' : ''}">
            <div class="step-title">${s.completed ? '✅' : '⬜'} ${s.title} ${s.required ? '<span class="required">(Required)</span>' : ''}</div>
            <div class="step-desc">${s.description}</div>
            ${s.deadline ? `<div class="step-desc">⏰ Deadline: ${s.deadline}</div>` : ''}
          </div>
        `).join('')}
        
        <h2>📁 Documents (${claim.documents.filter(d => d.collected).length}/${claim.documents.length})</h2>
        ${claim.documents.map(d => `
          <div class="doc ${d.collected ? 'collected' : ''}">${d.collected ? '✅' : '⬜'} ${d.name}</div>
        `).join('')}
        
        <div class="footer">
          Generated with 3MPWR App - Claims Navigator<br>
          Created: ${new Date(claim.createdAt).toLocaleDateString()}<br>
          Updated: ${new Date(claim.updatedAt).toLocaleDateString()}
        </div>
      </body>
      </html>
    `;
    
    try {
      const { printAsync } = await import("expo-print");
      await printAsync({ html });
    } catch {}
  };

  const sharePlan = async () => {
    if (!claim) return;
    const text = `
Claims Navigator Plan

Type: ${CLAIM_TYPES.find(c => c.value === claim.type)?.label}
Phase: ${PHASE_CONFIG[claim.phase].label}
Jurisdiction: ${claim.jurisdiction}
${claim.employer ? `Employer: ${claim.employer}` : ''}

Incident: ${claim.incident}
${claim.limitations ? `Limitations: ${claim.limitations}` : ''}

Steps (${claim.steps.filter(s => s.completed).length}/${claim.steps.length}):
${claim.steps.map(s => `${s.completed ? '✅' : '⬜'} ${s.title}`).join('\n')}

Documents (${claim.documents.filter(d => d.collected).length}/${claim.documents.length}):
${claim.documents.map(d => `${d.collected ? '✅' : '⬜'} ${d.name}`).join('\n')}

Generated with 3MPWR App
    `.trim();
    
    try {
      await Share.share({ message: text, title: 'Claims Navigator Plan' });
    } catch {}
  };

  const resetClaim = () => {
    Alert.alert(
      'Reset Claim?',
      'This will delete your current claim plan. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage?.removeItem?.(CLAIMS_DATA_KEY);
            setClaim(null);
            setIncident('');
            setIncidentDate('');
            setLimitations('');
            setEmployer('');
            setNotes('');
            setActiveTab('info');
          },
        },
      ]
    );
  };

  // Progress calculation
  const progress = useMemo(() => {
    if (!claim?.steps?.length) return { steps: 0, docs: 0 };
    const stepsComplete = Math.round((claim.steps.filter(s => s.completed).length / claim.steps.length) * 100);
    const docsComplete = claim.documents.length 
      ? Math.round((claim.documents.filter(d => d.collected).length / claim.documents.length) * 100)
      : 0;
    return { steps: stepsComplete, docs: docsComplete };
  }, [claim]);

  return (
    <ResponsiveScreenWrapper testID="claims-navigator-screen">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={s.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          🧭 {t("claimsNavigator.title", "Guided Claims Navigator")}
        </Text>
        
        <DyslexiaText style={s.subtitle}>
          {t("claimsNavigator.subtitle", "Turn your situation into a clear, actionable plan with step-by-step guidance.")}
        </DyslexiaText>
        
        <DisclaimerBanner type="legal" compact />

        {/* Phase Indicator */}
        {claim && (
          <View style={s.phaseCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 24 }}>{PHASE_CONFIG[claim.phase].icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.phaseLabel}>Current Phase</Text>
                <Text style={s.phaseTitle}>{PHASE_CONFIG[claim.phase].label}</Text>
              </View>
              <Pressable onPress={() => setShowTypeModal(true)} hitSlop={HIT_SLOP_8}>
                <Ionicons name="chevron-down" size={24} color={palette.primary} />
              </Pressable>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.progressLabel}>Steps: {progress.steps}%</Text>
                <View style={s.progressBarBg}>
                  <View style={[s.progressBar, { width: `${progress.steps}%`, backgroundColor: palette.primary }]} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.progressLabel}>Docs: {progress.docs}%</Text>
                <View style={s.progressBarBg}>
                  <View style={[s.progressBar, { width: `${progress.docs}%`, backgroundColor: palette.success }]} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={{ flexDirection: 'row', gap: 8, marginVertical: 16 }}>
          {(['info', 'steps', 'docs'] as const).map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[s.tab, activeTab === tab && s.tabActive]}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                {tab === 'info' && '📝 Info'}
                {tab === 'steps' && `✅ Steps ${claim ? `(${claim.steps.filter(s => s.completed).length}/${claim.steps.length})` : ''}`}
                {tab === 'docs' && `📁 Docs ${claim ? `(${claim.documents.filter(d => d.collected).length}/${claim.documents.length})` : ''}`}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <View>
            <Text style={s.formLabel}>Claim Type</Text>
            <Pressable onPress={() => setShowTypeModal(true)} style={s.selectButton}>
              <Text style={s.selectButtonText}>
                {CLAIM_TYPES.find(c => c.value === claimType)?.icon} {CLAIM_TYPES.find(c => c.value === claimType)?.label}
              </Text>
              <Ionicons name="chevron-down" size={20} color={palette.muted} />
            </Pressable>

            <Text style={s.formLabel}>Jurisdiction/Province</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {JURISDICTIONS.slice(0, 6).map(j => (
                  <Pressable
                    key={j}
                    onPress={() => setJurisdiction(j)}
                    style={[s.jurisdictionChip, jurisdiction === j && s.jurisdictionChipActive]}
                  >
                    <Text style={[s.jurisdictionChipText, jurisdiction === j && s.jurisdictionChipTextActive]}>
                      {j}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text style={s.formLabel}>What Happened? *</Text>
            <TextInput
              value={incident}
              onChangeText={setIncident}
              placeholder="Describe the incident, injury, or condition in detail..."
              placeholderTextColor={palette.text + "77"}
              multiline
              numberOfLines={4}
              style={[s.input, { minHeight: 100, textAlignVertical: 'top' }]}
            />

            <Text style={s.formLabel}>Incident Date</Text>
            <TextInput
              value={incidentDate}
              onChangeText={setIncidentDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={palette.text + "77"}
              style={s.input}
            />

            <Text style={s.formLabel}>Work Limitations</Text>
            <TextInput
              value={limitations}
              onChangeText={setLimitations}
              placeholder="Describe how this affects your ability to work..."
              placeholderTextColor={palette.text + "77"}
              multiline
              numberOfLines={3}
              style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
            />

            <Text style={s.formLabel}>Employer/Contact</Text>
            <TextInput
              value={employer}
              onChangeText={setEmployer}
              placeholder="Employer name or main contact"
              placeholderTextColor={palette.text + "77"}
              style={s.input}
            />

            <A11yPressable onPress={generatePlan} style={s.primaryButton}>
              <MaterialCommunityIcons name="rocket-launch-outline" size={20} color={palette.onPrimary} />
              <Text style={s.primaryButtonText}>
                {claim ? 'Update Plan' : 'Generate My Plan'}
              </Text>
            </A11yPressable>
          </View>
        )}

        {/* Steps Tab */}
        {activeTab === 'steps' && (
          <View>
            {claim?.steps?.length ? (
              <GapView gap={10}>
                {claim.steps.map((step, idx) => (
                  <Pressable
                    key={step.id}
                    onPress={() => toggleStep(step.id)}
                    style={[s.stepCard, step.completed && s.stepCardCompleted]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                      <View style={[s.checkbox, step.completed && s.checkboxChecked]}>
                        {step.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[s.stepTitle, step.completed && s.stepTitleCompleted]}>
                            {idx + 1}. {step.title}
                          </Text>
                          {step.required && (
                            <Text style={s.requiredBadge}>Required</Text>
                          )}
                        </View>
                        <Text style={s.stepDesc}>{step.description}</Text>
                        {step.deadline && (
                          <Text style={s.stepDeadline}>⏰ {step.deadline}</Text>
                        )}
                        {step.documents?.length ? (
                          <Text style={s.stepDocs}>📎 {step.documents.join(', ')}</Text>
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                ))}
              </GapView>
            ) : (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="format-list-checks" size={48} color={palette.muted} />
                <Text style={s.emptyText}>
                  No steps generated yet. Fill in your claim information and tap "Generate My Plan".
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Documents Tab */}
        {activeTab === 'docs' && (
          <View>
            {claim?.documents?.length ? (
              <GapView gap={8}>
                {claim.documents.map(doc => (
                  <Pressable
                    key={doc.name}
                    onPress={() => toggleDocument(doc.name)}
                    style={[s.docItem, doc.collected && s.docItemCollected]}
                  >
                    <View style={[s.checkbox, doc.collected && s.checkboxChecked]}>
                      {doc.collected && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                    <Text style={[s.docText, doc.collected && s.docTextCollected]}>
                      {doc.name}
                    </Text>
                  </Pressable>
                ))}
                
                <A11yPressable 
                  onPress={() => router.push('/(tabs)/resources/evidence-locker' as any)} 
                  style={s.linkButton}
                >
                  <MaterialCommunityIcons name="folder-lock" size={20} color={palette.primary} />
                  <Text style={s.linkButtonText}>Save to Evidence Locker</Text>
                  <Ionicons name="chevron-forward" size={18} color={palette.muted} />
                </A11yPressable>
              </GapView>
            ) : (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="file-document-outline" size={48} color={palette.muted} />
                <Text style={s.emptyText}>
                  Document checklist will appear after generating your plan.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Quick Links */}
        <Text style={[s.sectionTitle, { marginTop: 24 }]}>🔗 Related Tools</Text>
        <GapView gap={8}>
          <A11yPressable 
            onPress={() => router.push('/(tabs)/resources/(tools)/letter-wizard' as any)} 
            style={s.linkButton}
          >
            <MaterialCommunityIcons name="file-document-edit-outline" size={20} color={palette.primary} />
            <Text style={s.linkButtonText}>Letter Wizard</Text>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </A11yPressable>
          <A11yPressable 
            onPress={() => router.push('/(tabs)/resources/deadlines' as any)} 
            style={s.linkButton}
          >
            <MaterialCommunityIcons name="calendar-clock" size={20} color={palette.primary} />
            <Text style={s.linkButtonText}>Deadline Calculator</Text>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </A11yPressable>
        </GapView>

        {/* Export Actions */}
        {claim && (
          <View style={{ marginTop: 24, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <A11yPressable onPress={exportPlan} style={[s.secondaryButton, { flex: 1 }]}>
                <MaterialCommunityIcons name="file-pdf-box" size={18} color={palette.primary} />
                <Text style={s.secondaryButtonText}>PDF</Text>
              </A11yPressable>
              <A11yPressable onPress={sharePlan} style={[s.secondaryButton, { flex: 1 }]}>
                <Ionicons name="share-outline" size={18} color={palette.primary} />
                <Text style={s.secondaryButtonText}>Share</Text>
              </A11yPressable>
              <A11yPressable onPress={resetClaim} style={[s.secondaryButton, { flex: 1, borderColor: palette.error }]}>
                <Ionicons name="trash-outline" size={18} color={palette.error} />
                <Text style={[s.secondaryButtonText, { color: palette.error }]}>Reset</Text>
              </A11yPressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Claim Type Modal */}
      <Modal visible={showTypeModal} transparent animationType="slide" onRequestClose={() => setShowTypeModal(false)}>
        <Pressable 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          onPress={() => setShowTypeModal(false)}
        >
          <View style={{ backgroundColor: palette.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
            <Text style={s.modalTitle}>Select Claim Type</Text>
            <ScrollView>
              {CLAIM_TYPES.map(type => (
                <Pressable
                  key={type.value}
                  onPress={() => { setClaimType(type.value); setShowTypeModal(false); }}
                  style={[s.typeOption, claimType === type.value && s.typeOptionActive]}
                >
                  <Text style={{ fontSize: 24 }}>{type.icon}</Text>
                  <Text style={[s.typeOptionText, claimType === type.value && s.typeOptionTextActive]}>
                    {type.label}
                  </Text>
                  {claimType === type.value && (
                    <Ionicons name="checkmark-circle" size={24} color={palette.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
            
            {claim && (
              <>
                <Text style={[s.modalTitle, { marginTop: 16 }]}>Update Phase</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 8 }}>
                    {(Object.keys(PHASE_CONFIG) as ClaimPhase[]).map(phase => {
                      const cfg = PHASE_CONFIG[phase];
                      return (
                        <Pressable
                          key={phase}
                          onPress={() => { updatePhase(phase); setShowTypeModal(false); }}
                          style={[s.phaseChip, claim.phase === phase && { backgroundColor: cfg.color }]}
                        >
                          <Text style={[s.phaseChipText, claim.phase === phase && { color: '#fff' }]}>
                            {cfg.icon} {cfg.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </ResponsiveScreenWrapper>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    title: { fontSize: 24, fontWeight: "700", color: palette.text, marginBottom: 8 },
    subtitle: { fontSize: 15, color: palette.text, opacity: 0.9, marginBottom: 12, lineHeight: 22 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 12 },
    phaseCard: { backgroundColor: palette.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: palette.muted },
    phaseLabel: { fontSize: 12, color: palette.textSecondary },
    phaseTitle: { fontSize: 18, fontWeight: '700', color: palette.text },
    progressLabel: { fontSize: 12, color: palette.textSecondary, marginBottom: 4 },
    progressBarBg: { height: 6, backgroundColor: palette.muted + '30', borderRadius: 3, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 3 },
    tab: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: palette.surface, alignItems: 'center', borderWidth: 1, borderColor: palette.muted },
    tabActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    tabText: { fontSize: 13, fontWeight: '600', color: palette.text },
    tabTextActive: { color: palette.onPrimary },
    formLabel: { fontSize: 14, fontWeight: '600', color: palette.text, marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 12, color: palette.text, backgroundColor: palette.surface, marginBottom: 8 },
    selectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 12, backgroundColor: palette.surface, marginBottom: 12 },
    selectButtonText: { fontSize: 15, color: palette.text },
    jurisdictionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    jurisdictionChipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    jurisdictionChipText: { fontSize: 13, color: palette.text },
    jurisdictionChipTextActive: { color: palette.onPrimary },
    primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primary, padding: 16, borderRadius: 12, gap: 8, marginTop: 16 },
    primaryButtonText: { color: palette.onPrimary, fontSize: 16, fontWeight: '700' },
    secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted, padding: 12, borderRadius: 10, gap: 6 },
    secondaryButtonText: { color: palette.text, fontSize: 14, fontWeight: '600' },
    stepCard: { backgroundColor: palette.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: palette.muted },
    stepCardCompleted: { backgroundColor: palette.success + '10', borderColor: palette.success },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: palette.muted, alignItems: 'center', justifyContent: 'center' },
    checkboxChecked: { backgroundColor: palette.success, borderColor: palette.success },
    stepTitle: { fontSize: 15, fontWeight: '600', color: palette.text },
    stepTitleCompleted: { textDecorationLine: 'line-through', opacity: 0.7 },
    stepDesc: { fontSize: 13, color: palette.textSecondary, marginTop: 4, lineHeight: 18 },
    stepDeadline: { fontSize: 12, color: palette.warning, marginTop: 6, fontWeight: '500' },
    stepDocs: { fontSize: 12, color: palette.primary, marginTop: 4 },
    requiredBadge: { fontSize: 10, color: palette.error, fontWeight: '700', backgroundColor: palette.error + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    docItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: palette.surface, borderRadius: 10, borderWidth: 1, borderColor: palette.muted },
    docItemCollected: { backgroundColor: palette.success + '10', borderColor: palette.success },
    docText: { fontSize: 14, color: palette.text, flex: 1 },
    docTextCollected: { textDecorationLine: 'line-through', opacity: 0.7 },
    linkButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted, padding: 14, borderRadius: 12, gap: 12 },
    linkButtonText: { flex: 1, fontSize: 15, fontWeight: '600', color: palette.text },
    emptyState: { alignItems: 'center', padding: 32 },
    emptyText: { fontSize: 14, color: palette.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 16 },
    typeOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, marginBottom: 8, backgroundColor: palette.background },
    typeOptionActive: { backgroundColor: palette.primary + '15' },
    typeOptionText: { flex: 1, fontSize: 15, color: palette.text },
    typeOptionTextActive: { color: palette.primary, fontWeight: '600' },
    phaseChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    phaseChipText: { fontSize: 13, fontWeight: '600', color: palette.text },
  });
}
