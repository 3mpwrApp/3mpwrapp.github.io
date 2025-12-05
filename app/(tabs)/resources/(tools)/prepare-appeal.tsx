/**
 * Prepare to Appeal - Comprehensive Appeal Preparation Guide
 * 
 * A step-by-step, interactive guide for preparing appeals including:
 * - Interactive checklist with progress tracking
 * - Document gathering requirements
 * - Argument building assistance
 * - Timeline management
 * - Evidence organization
 * - Letter template integration
 * - Hearing preparation
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../../components/A11yPressable';
import DisclaimerBanner from '../../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../../components/DyslexiaText';
import { GapView } from '../../../../components/GapView';
import ResponsiveScreenWrapper from '../../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../../hooks/useA11y';
import { useTranslation } from '../../../../i18n';
import { useAppPalette } from '../../../../theme/usePalette';
import { announce } from '../../../../utils/announce';

let AsyncStorage: any;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

export const options = { href: null };

// Storage key
const APPEAL_PREP_KEY = 'appealPrep:data:v1';

// Appeal Types
type AppealType = 
  | 'workers_comp'      // WSIB, WorkSafe, etc.
  | 'disability_insurance' // LTD, STD
  | 'social_security'   // SSDI, SSI, CPP-D
  | 'health_insurance'  // Coverage denials
  | 'employment'        // Termination, accommodation
  | 'housing'           // Eviction, accessibility
  | 'other';

interface AppealData {
  id: string;
  type: AppealType;
  title: string;
  denialDate?: string;
  deadlineDate?: string;
  createdAt: string;
  updatedAt: string;
  completedSteps: string[];
  notes: Record<string, string>;
  documents: AppealDocument[];
  arguments: AppealArgument[];
}

interface AppealDocument {
  id: string;
  name: string;
  type: 'medical' | 'employment' | 'financial' | 'witness' | 'legal' | 'correspondence' | 'other';
  status: 'needed' | 'requested' | 'received' | 'submitted';
  notes?: string;
  addedAt: string;
}

interface AppealArgument {
  id: string;
  title: string;
  description: string;
  supportingDocs: string[];
  strength: 'weak' | 'moderate' | 'strong';
}

// Step definitions
interface PrepStep {
  id: string;
  phase: 1 | 2 | 3 | 4;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  titleKey: string;
  descriptionKey: string;
  tips: string[];
  action?: 'navigate' | 'checklist' | 'text' | 'documents';
  actionRoute?: string;
  checklistItems?: string[];
}

const PREP_STEPS: PrepStep[] = [
  // Phase 1: Understanding Your Denial
  {
    id: 'read_denial',
    phase: 1,
    icon: 'file-document-outline',
    titleKey: 'appeal.steps.readDenial.title',
    descriptionKey: 'appeal.steps.readDenial.desc',
    tips: [
      'Highlight the specific reasons given for denial',
      'Note any deadlines mentioned in the letter',
      'Look for instructions on how to appeal',
      'Check if internal review is required first',
    ],
    action: 'navigate',
    actionRoute: '/(tabs)/resources/denial-decoder',
  },
  {
    id: 'understand_reasons',
    phase: 1,
    icon: 'magnify',
    titleKey: 'appeal.steps.understandReasons.title',
    descriptionKey: 'appeal.steps.understandReasons.desc',
    tips: [
      'Make a list of every reason cited for denial',
      'Note which reasons you can dispute with evidence',
      'Identify if any reasons are factually incorrect',
      'Research if similar denials have been overturned',
    ],
    action: 'text',
  },
  {
    id: 'check_deadline',
    phase: 1,
    icon: 'calendar-clock',
    titleKey: 'appeal.steps.checkDeadline.title',
    descriptionKey: 'appeal.steps.checkDeadline.desc',
    tips: [
      'Most appeals must be filed within 30-90 days',
      'Some jurisdictions allow extensions with good cause',
      'Set multiple calendar reminders',
      'If deadline is near, request extension immediately',
    ],
    action: 'navigate',
    actionRoute: '/(tabs)/resources/deadlines',
  },
  
  // Phase 2: Gathering Evidence
  {
    id: 'gather_medical',
    phase: 2,
    icon: 'hospital-box-outline',
    titleKey: 'appeal.steps.gatherMedical.title',
    descriptionKey: 'appeal.steps.gatherMedical.desc',
    tips: [
      'Request complete medical records from all providers',
      'Get updated functional capacity evaluation if possible',
      'Ask treating doctor for detailed support letter',
      'Include specialist reports and test results',
    ],
    action: 'documents',
  },
  {
    id: 'request_support_letter',
    phase: 2,
    icon: 'file-sign',
    titleKey: 'appeal.steps.requestSupportLetter.title',
    descriptionKey: 'appeal.steps.requestSupportLetter.desc',
    tips: [
      'Doctor should specifically address denial reasons',
      'Include functional limitations in detail',
      'Ask doctor to state prognosis and expected duration',
      'Letter should be on official letterhead and signed',
    ],
    action: 'navigate',
    actionRoute: '/(tabs)/resources/(tools)/letter-wizard',
  },
  {
    id: 'gather_employment',
    phase: 2,
    icon: 'briefcase-outline',
    titleKey: 'appeal.steps.gatherEmployment.title',
    descriptionKey: 'appeal.steps.gatherEmployment.desc',
    tips: [
      'Get job description showing physical/mental demands',
      'Collect performance reviews before and after injury',
      'Document accommodation requests and responses',
      'Include witness statements from coworkers if helpful',
    ],
    action: 'documents',
  },
  {
    id: 'gather_financial',
    phase: 2,
    icon: 'cash-multiple',
    titleKey: 'appeal.steps.gatherFinancial.title',
    descriptionKey: 'appeal.steps.gatherFinancial.desc',
    tips: [
      'Collect pay stubs showing income before disability',
      'Document lost wages and reduced hours',
      'Include receipts for medical expenses',
      'Show economic hardship from benefit denial',
    ],
    action: 'documents',
  },
  
  // Phase 3: Building Your Case
  {
    id: 'write_appeal_letter',
    phase: 3,
    icon: 'pencil-outline',
    titleKey: 'appeal.steps.writeAppealLetter.title',
    descriptionKey: 'appeal.steps.writeAppealLetter.desc',
    tips: [
      'Address each denial reason point by point',
      'Reference specific evidence supporting your position',
      'Use clear, professional language',
      'Keep emotions out - focus on facts',
    ],
    action: 'navigate',
    actionRoute: '/(tabs)/resources/(tools)/letter-wizard',
  },
  {
    id: 'organize_evidence',
    phase: 3,
    icon: 'folder-multiple-outline',
    titleKey: 'appeal.steps.organizeEvidence.title',
    descriptionKey: 'appeal.steps.organizeEvidence.desc',
    tips: [
      'Create a table of contents for all documents',
      'Number every page consecutively',
      'Use tabs or dividers for major sections',
      'Include a cover letter summarizing contents',
    ],
    action: 'navigate',
    actionRoute: '/(tabs)/resources/evidence-locker',
  },
  {
    id: 'legal_research',
    phase: 3,
    icon: 'gavel',
    titleKey: 'appeal.steps.legalResearch.title',
    descriptionKey: 'appeal.steps.legalResearch.desc',
    tips: [
      'Review applicable policies and laws',
      'Find precedent cases with similar facts',
      'Identify procedural errors in original decision',
      'Consider consulting with lawyer or advocate',
    ],
    action: 'text',
  },
  
  // Phase 4: Submission & Follow-up
  {
    id: 'submit_appeal',
    phase: 4,
    icon: 'send-outline',
    titleKey: 'appeal.steps.submitAppeal.title',
    descriptionKey: 'appeal.steps.submitAppeal.desc',
    tips: [
      'Submit before deadline - consider courier for proof',
      'Keep copies of EVERYTHING submitted',
      'Get written confirmation of receipt',
      'Note date, time, and method of submission',
    ],
    action: 'checklist',
    checklistItems: [
      'Made copies of all documents',
      'Submitted by deadline',
      'Got confirmation of receipt',
      'Noted submission details',
    ],
  },
  {
    id: 'prepare_hearing',
    phase: 4,
    icon: 'account-voice',
    titleKey: 'appeal.steps.prepareHearing.title',
    descriptionKey: 'appeal.steps.prepareHearing.desc',
    tips: [
      'Practice explaining your case clearly and briefly',
      'Prepare for common questions from adjudicators',
      'Bring organized copies of all evidence',
      'Consider asking for witness or representative',
    ],
    action: 'text',
  },
  {
    id: 'follow_up',
    phase: 4,
    icon: 'phone-in-talk-outline',
    titleKey: 'appeal.steps.followUp.title',
    descriptionKey: 'appeal.steps.followUp.desc',
    tips: [
      'Note expected timeline for decision',
      'Set reminder to follow up if no response',
      'Keep log of all communications',
      'Know next steps if appeal is denied again',
    ],
    action: 'checklist',
    checklistItems: [
      'Noted expected decision timeline',
      'Set follow-up reminder',
      'Prepared for possible next steps',
    ],
  },
];

const PHASES = [
  { id: 1, title: 'Understanding Your Denial', icon: 'magnify' as const, color: 'error' },
  { id: 2, title: 'Gathering Evidence', icon: 'folder-multiple' as const, color: 'warning' },
  { id: 3, title: 'Building Your Case', icon: 'file-document-edit' as const, color: 'primary' },
  { id: 4, title: 'Submission & Follow-up', icon: 'send-check' as const, color: 'success' },
];

export default function PrepareAppeal() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const router = useRouter();
  const titleRef = useRef<Text>(null);
  
  useFocusOnRefOnMount(titleRef);
  useAnnounceOnMount(t('appeal.screenLabel', 'Prepare to Appeal screen'));
  
  const [appealData, setAppealData] = useState<AppealData | null>(null);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  // Load saved data
  useEffect(() => {
    loadAppealData();
  }, []);
  
  const loadAppealData = async () => {
    try {
      const raw = await AsyncStorage?.getItem?.(APPEAL_PREP_KEY);
      if (raw) {
        setAppealData(JSON.parse(raw));
      }
    } catch (err) {
      console.warn('Failed to load appeal data:', err);
    }
  };
  
  const saveAppealData = async (data: AppealData) => {
    try {
      await AsyncStorage?.setItem?.(APPEAL_PREP_KEY, JSON.stringify(data));
      setAppealData(data);
    } catch (err) {
      console.warn('Failed to save appeal data:', err);
    }
  };
  
  const startNewAppeal = (type: AppealType) => {
    const newAppeal: AppealData = {
      id: `appeal_${Date.now()}`,
      type,
      title: getAppealTypeLabel(type),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedSteps: [],
      notes: {},
      documents: [],
      arguments: [],
    };
    saveAppealData(newAppeal);
    setShowTypeModal(false);
    announce(t('appeal.started', 'Appeal preparation started'));
  };
  
  const toggleStepComplete = (stepId: string) => {
    if (!appealData) return;
    
    const isCompleted = appealData.completedSteps.includes(stepId);
    const updatedSteps = isCompleted
      ? appealData.completedSteps.filter(id => id !== stepId)
      : [...appealData.completedSteps, stepId];
    
    saveAppealData({
      ...appealData,
      completedSteps: updatedSteps,
      updatedAt: new Date().toISOString(),
    });
    
    announce(isCompleted ? t('appeal.stepUncompleted', 'Step marked incomplete') : t('appeal.stepCompleted', 'Step completed'));
  };
  
  const getAppealTypeLabel = (type: AppealType): string => {
    const labels: Record<AppealType, string> = {
      workers_comp: 'Workers\' Compensation Appeal',
      disability_insurance: 'Disability Insurance Appeal',
      social_security: 'Social Security / CPP-D Appeal',
      health_insurance: 'Health Insurance Coverage Appeal',
      employment: 'Employment/Accommodation Appeal',
      housing: 'Housing/Accessibility Appeal',
      other: 'Other Appeal',
    };
    return labels[type];
  };
  
  // Calculate progress
  const progress = useMemo(() => {
    if (!appealData) return { total: 0, completed: 0, percentage: 0 };
    const total = PREP_STEPS.length;
    const completed = appealData.completedSteps.length;
    return {
      total,
      completed,
      percentage: Math.round((completed / total) * 100),
    };
  }, [appealData?.completedSteps]);
  
  // Get steps for current phase
  const phaseSteps = useMemo(() => {
    return PREP_STEPS.filter(step => step.phase === currentPhase);
  }, [currentPhase]);
  
  const styles = useMemo(() => createStyles(palette), [palette]);

  // Render No Appeal State
  if (!appealData) {
    return (
      <ResponsiveScreenWrapper testID="prepare-appeal-screen">
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text
            ref={titleRef}
            accessibilityRole="header"
            style={styles.title}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            ⚖️ {t('appeal.prepareTitle', 'Prepare Your Appeal')}
          </Text>
          
          <DyslexiaText style={styles.subtitle}>
            {t('appeal.prepareSubtitle', 'Step-by-step guidance to build a winning appeal. Track progress, gather evidence, and stay organized.')}
          </DyslexiaText>
          
          <DisclaimerBanner type="legal" compact />
          
          {/* Empty State Card */}
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="scale-balance" size={64} color={palette.primary} />
            <Text style={styles.emptyTitle}>
              {t('appeal.emptyTitle', 'No Appeal in Progress')}
            </Text>
            <DyslexiaText style={styles.emptyDesc}>
              {t('appeal.emptyDesc', 'Start preparing your appeal with our comprehensive guide. We\'ll help you every step of the way.')}
            </DyslexiaText>
            
            <A11yPressable
              onPress={() => setShowTypeModal(true)}
              style={styles.primaryButton}
              accessibilityRole="button"
              accessibilityLabel={t('appeal.startNew', 'Start New Appeal')}
            >
              <MaterialCommunityIcons name="plus-circle" size={24} color={palette.onPrimary} />
              <Text style={styles.primaryButtonText}>
                {t('appeal.startNew', 'Start New Appeal')}
              </Text>
            </A11yPressable>
          </View>
          
          {/* What You'll Do */}
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>
              📋 {t('appeal.whatYouDo', 'What You\'ll Do')}
            </Text>
            <GapView gap={12} style={{ marginTop: 12 }}>
              {PHASES.map(phase => (
                <View key={phase.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.phaseIcon, { backgroundColor: (palette as any)[phase.color] + '20' }]}>
                    <MaterialCommunityIcons name={phase.icon} size={20} color={(palette as any)[phase.color]} />
                  </View>
                  <Text style={styles.phaseTitle}>{phase.title}</Text>
                </View>
              ))}
            </GapView>
          </View>
        </ScrollView>
        
        {/* Type Selection Modal */}
        <Modal visible={showTypeModal} transparent animationType="slide" onRequestClose={() => setShowTypeModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t('appeal.selectType', 'What type of appeal?')}
                </Text>
                <Pressable onPress={() => setShowTypeModal(false)} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Close modal">
                  <Ionicons name="close-circle" size={28} color={palette.muted} />
                </Pressable>
              </View>
              
              <ScrollView style={{ maxHeight: 400 }}>
                <GapView gap={12}>
                  {(['workers_comp', 'disability_insurance', 'social_security', 'health_insurance', 'employment', 'housing', 'other'] as AppealType[]).map(type => (
                    <A11yPressable
                      key={type}
                      onPress={() => startNewAppeal(type)}
                      style={styles.typeOption}
                      accessibilityRole="button"
                    >
                      <Text style={styles.typeOptionText}>{getAppealTypeLabel(type)}</Text>
                      <Ionicons name="chevron-forward" size={20} color={palette.muted} />
                    </A11yPressable>
                  ))}
                </GapView>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ResponsiveScreenWrapper>
    );
  }

  // Render Active Appeal
  return (
    <ResponsiveScreenWrapper testID="prepare-appeal-screen">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={styles.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          ⚖️ {appealData.title}
        </Text>
        
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.progressLabel}>
              {t('appeal.progress', 'Progress')}
            </Text>
            <Text style={styles.progressValue}>
              {progress.completed}/{progress.total} steps ({progress.percentage}%)
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
          </View>
          {appealData.deadlineDate && (
            <Text style={styles.deadlineText}>
              ⏰ {t('appeal.deadline', 'Deadline')}: {new Date(appealData.deadlineDate).toLocaleDateString()}
            </Text>
          )}
        </View>
        
        {/* Phase Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {PHASES.map(phase => {
              const phaseComplete = PREP_STEPS
                .filter(s => s.phase === phase.id)
                .every(s => appealData.completedSteps.includes(s.id));
              const isActive = currentPhase === phase.id;
              
              return (
                <Pressable
                  key={phase.id}
                  onPress={() => setCurrentPhase(phase.id)}
                  style={[
                    styles.phaseTab,
                    isActive && { backgroundColor: (palette as any)[phase.color], borderColor: (palette as any)[phase.color] },
                    phaseComplete && { opacity: 0.7 },
                  ]}
                >
                  <MaterialCommunityIcons 
                    name={phaseComplete ? 'check-circle' : phase.icon} 
                    size={18} 
                    color={isActive ? palette.onPrimary : palette.text} 
                  />
                  <Text style={[styles.phaseTabText, isActive && { color: palette.onPrimary }]}>
                    Phase {phase.id}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
        
        {/* Phase Title */}
        <Text style={styles.sectionTitle}>
          {PHASES.find(p => p.id === currentPhase)?.title}
        </Text>
        
        {/* Steps */}
        <GapView gap={12}>
          {phaseSteps.map(step => {
            const isCompleted = appealData.completedSteps.includes(step.id);
            const isExpanded = expandedStep === step.id;
            
            return (
              <View key={step.id} style={styles.stepCard}>
                <Pressable
                  onPress={() => setExpandedStep(isExpanded ? null : step.id)}
                  style={styles.stepHeader}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(step.titleKey, step.titleKey)}. ${isCompleted ? 'Completed' : 'Not completed'}. Tap to expand.`}
                >
                  <Pressable
                    onPress={() => toggleStepComplete(step.id)}
                    style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
                    hitSlop={HIT_SLOP_8}
                  >
                    {isCompleted && <Ionicons name="checkmark" size={16} color={palette.onPrimary} />}
                  </Pressable>
                  
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={[styles.stepTitle, isCompleted && styles.stepTitleCompleted]}>
                      {t(step.titleKey, step.titleKey)}
                    </Text>
                  </View>
                  
                  <Ionicons 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={palette.muted} 
                  />
                </Pressable>
                
                {isExpanded && (
                  <View style={styles.stepContent}>
                    <DyslexiaText style={styles.stepDesc}>
                      {t(step.descriptionKey, step.descriptionKey)}
                    </DyslexiaText>
                    
                    {/* Tips */}
                    <View style={styles.tipsBox}>
                      <Text style={styles.tipsTitle}>💡 Tips:</Text>
                      {step.tips.map((tip, i) => (
                        <Text key={i} style={styles.tipItem}>• {tip}</Text>
                      ))}
                    </View>
                    
                    {/* Action Button */}
                    {step.action === 'navigate' && step.actionRoute && (
                      <A11yPressable
                        onPress={() => router.push(step.actionRoute as any)}
                        style={styles.actionButton}
                      >
                        <MaterialCommunityIcons name={step.icon} size={20} color={palette.primary} />
                        <Text style={styles.actionButtonText}>Open Tool</Text>
                      </A11yPressable>
                    )}
                    
                    {/* Mark Complete Button */}
                    <A11yPressable
                      onPress={() => toggleStepComplete(step.id)}
                      style={[styles.completeButton, isCompleted && styles.completeButtonDone]}
                    >
                      <Ionicons 
                        name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'} 
                        size={20} 
                        color={isCompleted ? palette.success : palette.text} 
                      />
                      <Text style={[styles.completeButtonText, isCompleted && { color: palette.success }]}>
                        {isCompleted ? 'Completed' : 'Mark Complete'}
                      </Text>
                    </A11yPressable>
                  </View>
                )}
              </View>
            );
          })}
        </GapView>
        
        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          ⚡ {t('appeal.quickActions', 'Quick Actions')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <A11yPressable 
            onPress={() => router.push('/(tabs)/resources/(tools)/letter-wizard')}
            style={styles.quickAction}
          >
            <MaterialCommunityIcons name="file-document-edit-outline" size={24} color={palette.primary} />
            <Text style={styles.quickActionText}>Write Appeal Letter</Text>
          </A11yPressable>
          <A11yPressable 
            onPress={() => router.push('/(tabs)/resources/evidence-locker')}
            style={styles.quickAction}
          >
            <MaterialCommunityIcons name="folder-lock" size={24} color={palette.primary} />
            <Text style={styles.quickActionText}>Evidence Locker</Text>
          </A11yPressable>
          <A11yPressable 
            onPress={() => router.push('/(tabs)/resources/deadlines')}
            style={styles.quickAction}
          >
            <MaterialCommunityIcons name="clock-alert-outline" size={24} color={palette.error} />
            <Text style={styles.quickActionText}>Set Deadline</Text>
          </A11yPressable>
          <A11yPressable 
            onPress={() => router.push('/(tabs)/resources/denial-decoder')}
            style={styles.quickAction}
          >
            <MaterialCommunityIcons name="file-search-outline" size={24} color={palette.warning} />
            <Text style={styles.quickActionText}>Analyze Denial</Text>
          </A11yPressable>
        </View>
        
        {/* Reset Option */}
        <A11yPressable
          onPress={() => {
            Alert.alert(
              t('appeal.resetConfirm', 'Start Over?'),
              t('appeal.resetConfirmDesc', 'This will clear all progress and start a new appeal preparation.'),
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Start Over', 
                  style: 'destructive',
                  onPress: async () => {
                    await AsyncStorage?.removeItem?.(APPEAL_PREP_KEY);
                    setAppealData(null);
                    setCurrentPhase(1);
                  }
                },
              ]
            );
          }}
          style={styles.resetButton}
        >
          <Ionicons name="refresh-outline" size={20} color={palette.error} />
          <Text style={styles.resetButtonText}>{t('appeal.startOver', 'Start Over')}</Text>
        </A11yPressable>
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: palette.text,
      opacity: 0.9,
      marginBottom: 16,
      lineHeight: 22,
    },
    emptyCard: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      marginTop: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyDesc: {
      fontSize: 15,
      color: palette.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    primaryButtonText: {
      color: palette.onPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    overviewCard: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
    },
    overviewTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
    },
    phaseIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    phaseTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.text,
    },
    progressCard: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
    },
    progressLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
    },
    progressValue: {
      fontSize: 14,
      color: palette.primary,
      fontWeight: '700',
    },
    progressBarBg: {
      height: 8,
      backgroundColor: palette.muted + '30',
      borderRadius: 4,
      marginTop: 8,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: palette.success,
      borderRadius: 4,
    },
    deadlineText: {
      fontSize: 13,
      color: palette.error,
      fontWeight: '600',
      marginTop: 8,
    },
    phaseTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
      gap: 6,
    },
    phaseTabText: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.text,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 12,
    },
    stepCard: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      overflow: 'hidden',
    },
    stepHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: palette.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: palette.success,
      borderColor: palette.success,
    },
    stepTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.text,
    },
    stepTitleCompleted: {
      textDecorationLine: 'line-through',
      opacity: 0.7,
    },
    stepContent: {
      padding: 16,
      paddingTop: 0,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.muted,
    },
    stepDesc: {
      fontSize: 14,
      color: palette.text,
      lineHeight: 20,
      marginBottom: 12,
    },
    tipsBox: {
      backgroundColor: palette.primary + '10',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    tipsTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 6,
    },
    tipItem: {
      fontSize: 13,
      color: palette.text,
      lineHeight: 20,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.primary + '15',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 8,
      marginBottom: 8,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.primary,
    },
    completeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 6,
    },
    completeButtonDone: {},
    completeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
    },
    quickAction: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      width: '47%',
      gap: 8,
    },
    quickActionText: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.text,
      textAlign: 'center',
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 32,
      padding: 12,
      gap: 6,
    },
    resetButtonText: {
      fontSize: 14,
      color: palette.error,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: palette.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
    },
    typeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: palette.background,
      padding: 16,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    typeOptionText: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.text,
    },
  });
}