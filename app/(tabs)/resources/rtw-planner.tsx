/**
 * Return-to-Work (RTW) Planner - Enhanced Gradual Return Planning
 * 
 * Comprehensive features:
 * - Phased return schedule builder
 * - Accommodation request integration
 * - Task/duty modification tracker
 * - Progress monitoring
 * - Communication log with employer/insurer
 * - Medical clearance tracking
 * - Template generation for RTW plans
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import { GapView } from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_12, HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

let AsyncStorage: any;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

export const options = { href: null };

const RTW_PLAN_KEY = 'rtwPlanner:data:v1';

interface RTWPhase {
  id: string;
  weekNumber: number;
  hoursPerDay: number;
  daysPerWeek: number;
  duties: string[];
  restrictions: string[];
  accommodations: string[];
  status: 'pending' | 'current' | 'completed' | 'adjusted';
  startDate?: string;
  notes?: string;
}

interface CommunicationLog {
  id: string;
  date: string;
  with: string;
  type: 'email' | 'phone' | 'meeting' | 'letter';
  summary: string;
  followUp?: string;
}

interface RTWPlan {
  id: string;
  employerName: string;
  position: string;
  injuryDate?: string;
  targetReturnDate?: string;
  currentPhase: number;
  phases: RTWPhase[];
  accommodationsRequested: string[];
  communicationLog: CommunicationLog[];
  medicalClearance?: {
    date: string;
    restrictions: string[];
    nextReview?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const COMMON_ACCOMMODATIONS = [
  '🪑 Ergonomic workstation',
  '⏰ Flexible hours',
  '🏠 Work from home options',
  '😌 Regular breaks',
  '🚫 No heavy lifting',
  '🚶 Reduced walking/standing',
  '💻 Modified computer setup',
  '🔇 Quiet workspace',
  '🚗 Parking close to entrance',
  '📋 Modified duties',
  '👥 Reduced client interaction',
  '📞 Phone support alternatives',
];

const COMMON_RESTRICTIONS = [
  'No lifting over 10 lbs',
  'No repetitive motions',
  'Seated work only',
  'Limited standing (max 30 min)',
  'No driving',
  'Avoid stairs',
  'No overtime',
  'No night shifts',
  'Stress-reduced environment',
  'Limited computer use',
];

export default function RTWPlanner() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const router = useRouter();
  const titleRef = React.useRef<Text>(null);
  const s = useMemo(() => styles(palette), [palette]);
  
  useFocusOnRefOnMount(titleRef);
  useAnnounceOnMount(t('rtw.screenLabel', 'Return to Work Planner'));

  const [plan, setPlan] = useState<RTWPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'phases' | 'comms'>('plan');
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showCommModal, setShowCommModal] = useState(false);
  const [_editingPhase, setEditingPhase] = useState<RTWPhase | null>(null);

  // Form state
  const [employerName, setEmployerName] = useState('');
  const [position, setPosition] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);

  // Phase form
  const [phaseWeek, setPhaseWeek] = useState('1');
  const [phaseHours, setPhaseHours] = useState('4');
  const [phaseDays, setPhaseDays] = useState('3');
  const [phaseDuties, setPhaseDuties] = useState('');
  const [phaseRestrictions, setPhaseRestrictions] = useState<string[]>([]);
  const [phaseAccommodations, setPhaseAccommodations] = useState<string[]>([]);

  // Communication form
  const [commWith, setCommWith] = useState('');
  const [commType, setCommType] = useState<CommunicationLog['type']>('email');
  const [commSummary, setCommSummary] = useState('');
  const [commFollowUp, setCommFollowUp] = useState('');

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const raw = await AsyncStorage?.getItem?.(RTW_PLAN_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setPlan(data);
        setEmployerName(data.employerName || '');
        setPosition(data.position || '');
        setTargetDate(data.targetReturnDate || '');
        setSelectedAccommodations(data.accommodationsRequested || []);
      }
    } catch (e) {
      console.warn('Failed to load RTW plan:', e);
    }
  };

  const savePlan = useCallback(async (updates?: Partial<RTWPlan>) => {
    try {
      const data: RTWPlan = {
        id: plan?.id || `rtw_${Date.now()}`,
        employerName,
        position,
        targetReturnDate: targetDate,
        currentPhase: plan?.currentPhase || 0,
        phases: plan?.phases || [],
        accommodationsRequested: selectedAccommodations,
        communicationLog: plan?.communicationLog || [],
        createdAt: plan?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates,
      };
      await AsyncStorage?.setItem?.(RTW_PLAN_KEY, JSON.stringify(data));
      setPlan(data);
      announce(t('rtw.saved', 'Plan saved'));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  }, [plan, employerName, position, targetDate, selectedAccommodations, t]);

  const addPhase = () => {
    const newPhase: RTWPhase = {
      id: `phase_${Date.now()}`,
      weekNumber: parseInt(phaseWeek, 10),
      hoursPerDay: parseInt(phaseHours, 10),
      daysPerWeek: parseInt(phaseDays, 10),
      duties: phaseDuties.split('\n').filter(d => d.trim()),
      restrictions: phaseRestrictions,
      accommodations: phaseAccommodations,
      status: 'pending',
    };
    const phases = [...(plan?.phases || []), newPhase].sort((a, b) => a.weekNumber - b.weekNumber);
    savePlan({ phases });
    setShowPhaseModal(false);
    resetPhaseForm();
    announce(t('rtw.phaseAdded', 'Phase added'));
  };

  const resetPhaseForm = () => {
    setPhaseWeek('1');
    setPhaseHours('4');
    setPhaseDays('3');
    setPhaseDuties('');
    setPhaseRestrictions([]);
    setPhaseAccommodations([]);
    setEditingPhase(null);
  };

  const addCommunication = () => {
    if (!commWith.trim() || !commSummary.trim()) return;
    const newComm: CommunicationLog = {
      id: `comm_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      with: commWith,
      type: commType,
      summary: commSummary,
      followUp: commFollowUp || undefined,
    };
    const logs = [...(plan?.communicationLog || []), newComm];
    savePlan({ communicationLog: logs });
    setShowCommModal(false);
    setCommWith('');
    setCommSummary('');
    setCommFollowUp('');
    announce(t('rtw.commAdded', 'Communication logged'));
  };

  const updatePhaseStatus = (phaseId: string, status: RTWPhase['status']) => {
    const phases = (plan?.phases || []).map(p => 
      p.id === phaseId ? { ...p, status } : p
    );
    savePlan({ phases });
  };

  const generatePlanDocument = async () => {
    if (!plan) return;
    
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
          .phase { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #2563eb; }
          .phase-header { display: flex; justify-content: space-between; }
          .accommodations { background: #f0fdf4; padding: 10px; border-radius: 6px; margin: 10px 0; }
          .restrictions { background: #fef3c7; padding: 10px; border-radius: 6px; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
          th { background: #f3f4f6; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          .signature { margin-top: 40px; display: flex; justify-content: space-between; }
          .sig-line { width: 200px; border-top: 1px solid #000; padding-top: 5px; }
        </style>
      </head>
      <body>
        <h1>📋 Gradual Return-to-Work Plan</h1>
        
        <div class="info">
          <strong>Employee:</strong> [Name]<br>
          <strong>Position:</strong> ${plan.position}<br>
          <strong>Employer:</strong> ${plan.employerName}<br>
          <strong>Target Return Date:</strong> ${plan.targetReturnDate || 'TBD'}<br>
          <strong>Plan Created:</strong> ${new Date(plan.createdAt).toLocaleDateString()}
        </div>
        
        <h2>📅 Phased Return Schedule</h2>
        <table>
          <tr>
            <th>Week</th>
            <th>Hours/Day</th>
            <th>Days/Week</th>
            <th>Duties</th>
          </tr>
          ${plan.phases.map(p => `
            <tr>
              <td>Week ${p.weekNumber}</td>
              <td>${p.hoursPerDay} hours</td>
              <td>${p.daysPerWeek} days</td>
              <td>${p.duties.join(', ') || 'TBD'}</td>
            </tr>
          `).join('')}
        </table>
        
        <h2>♿ Accommodations Requested</h2>
        <div class="accommodations">
          <ul>
            ${plan.accommodationsRequested.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>
        
        ${plan.medicalClearance ? `
          <h2>🩺 Medical Clearance</h2>
          <div class="restrictions">
            <strong>Date:</strong> ${plan.medicalClearance.date}<br>
            <strong>Restrictions:</strong>
            <ul>
              ${plan.medicalClearance.restrictions.map(r => `<li>${r}</li>`).join('')}
            </ul>
            ${plan.medicalClearance.nextReview ? `<strong>Next Review:</strong> ${plan.medicalClearance.nextReview}` : ''}
          </div>
        ` : ''}
        
        <div class="signature">
          <div>
            <div class="sig-line">Employee Signature</div>
            <div style="margin-top: 20px;">Date: _______________</div>
          </div>
          <div>
            <div class="sig-line">Employer Signature</div>
            <div style="margin-top: 20px;">Date: _______________</div>
          </div>
        </div>
        
        <div class="footer">
          <p>This plan may be adjusted based on medical progress and workplace needs.</p>
          <p>Generated with 3MPWR App - RTW Planner</p>
        </div>
      </body>
      </html>
    `;
    
    try {
      const { printAsync } = await import('expo-print');
      await printAsync({ html });
    } catch {
      Alert.alert(t('rtw.exportFailed', 'Export Failed'));
    }
  };

  const sharePlanSummary = async () => {
    if (!plan) return;
    const text = `
Return-to-Work Plan Summary

Employer: ${plan.employerName}
Position: ${plan.position}
Target Return: ${plan.targetReturnDate || 'TBD'}

Phases:
${plan.phases.map(p => `- Week ${p.weekNumber}: ${p.hoursPerDay}h/day, ${p.daysPerWeek} days/week`).join('\n')}

Accommodations Requested:
${plan.accommodationsRequested.map(a => `- ${a}`).join('\n')}

Generated with 3MPWR App
    `.trim();
    
    try {
      await Share.share({ message: text, title: 'RTW Plan' });
    } catch {}
  };

  const reset = () => {
    Alert.alert(
      t('rtw.resetTitle', 'Reset Plan?'),
      t('rtw.resetDesc', 'This will delete your current plan.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.reset', 'Reset'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage?.removeItem?.(RTW_PLAN_KEY);
            setPlan(null);
            setEmployerName('');
            setPosition('');
            setTargetDate('');
            setSelectedAccommodations([]);
          },
        },
      ]
    );
  };

  // Calculate progress
  const progress = useMemo(() => {
    if (!plan?.phases?.length) return { completed: 0, total: 0, percent: 0 };
    const completed = plan.phases.filter(p => p.status === 'completed').length;
    return {
      completed,
      total: plan.phases.length,
      percent: Math.round((completed / plan.phases.length) * 100),
    };
  }, [plan?.phases]);

  return (
    <ResponsiveScreenWrapper testID="rtw-planner-screen">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={s.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          ↩️ {t('rtw.title', 'Return-to-Work Planner')}
        </Text>
        
        <DyslexiaText style={s.subtitle}>
          {t('rtw.subtitle', 'Plan a gradual, supported return with accommodations, phased schedules, and communication tracking.')}
        </DyslexiaText>
        
        <DisclaimerBanner type="legal" compact />
        <DisclaimerBanner type="medical" compact />

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['plan', 'phases', 'comms'] as const).map(tab => (
              <Pressable
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[s.tab, activeTab === tab && s.tabActive]}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                  {tab === 'plan' && '📋 Plan'}
                  {tab === 'phases' && '📅 Phases'}
                  {tab === 'comms' && '📞 Comms'}
                  {tab === 'phases' && plan?.phases?.length ? ` (${plan.phases.length})` : ''}
                  {tab === 'comms' && plan?.communicationLog?.length ? ` (${plan.communicationLog.length})` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Progress Bar */}
        {plan?.phases?.length ? (
          <View style={s.progressCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={s.progressLabel}>{t('rtw.progress', 'Progress')}</Text>
              <Text style={s.progressValue}>{progress.completed}/{progress.total} phases ({progress.percent}%)</Text>
            </View>
            <View style={s.progressBarBg}>
              <View style={[s.progressBarFill, { width: `${progress.percent}%` }]} />
            </View>
          </View>
        ) : null}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <View>
            <View style={s.formGroup}>
              <Text style={s.label}>{t('rtw.employer', 'Employer Name')}</Text>
              <TextInput
                placeholder="Company name"
                placeholderTextColor={palette.text + '77'}
                value={employerName}
                onChangeText={setEmployerName}
                style={s.input}
              />
            </View>
            
            <View style={s.formGroup}>
              <Text style={s.label}>{t('rtw.position', 'Your Position')}</Text>
              <TextInput
                placeholder="Job title"
                placeholderTextColor={palette.text + '77'}
                value={position}
                onChangeText={setPosition}
                style={s.input}
              />
            </View>
            
            <View style={s.formGroup}>
              <Text style={s.label}>{t('rtw.targetDate', 'Target Return Date')}</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor={palette.text + '77'}
                value={targetDate}
                onChangeText={setTargetDate}
                style={s.input}
              />
            </View>

            <Text style={[s.label, { marginTop: 16 }]}>
              {t('rtw.accommodations', '♿ Accommodations Needed')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {COMMON_ACCOMMODATIONS.map(acc => (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  key={acc}
                  onPress={() => {
                    setSelectedAccommodations(prev =>
                      prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
                    );
                  }}
                  style={[s.accChip, selectedAccommodations.includes(acc) && s.accChipSelected]}
                >
                  <Text style={[s.accChipText, selectedAccommodations.includes(acc) && s.accChipTextSelected]}>
                    {acc}
                  </Text>
                </Pressable>
              ))}
            </View>

            <A11yPressable onPress={() => savePlan()} style={[s.primaryButton, { marginTop: 20 }]}>
              <Ionicons name="save-outline" size={20} color={palette.onPrimary} />
              <Text style={s.primaryButtonText}>{t('rtw.savePlan', 'Save Plan')}</Text>
            </A11yPressable>

            {/* Quick Actions */}
            <Text style={[s.sectionTitle, { marginTop: 24 }]}>⚡ {t('rtw.quickActions', 'Quick Actions')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <A11yPressable 
                onPress={() => router.push('/(tabs)/resources/(tools)/letter-wizard')}
                style={s.quickAction}
              >
                <MaterialCommunityIcons name="file-document-edit-outline" size={24} color={palette.primary} />
                <Text style={s.quickActionText}>Write RTW Letter</Text>
              </A11yPressable>
              <A11yPressable 
                onPress={() => router.push('/(tabs)/resources/doctor-visit-prep')}
                style={s.quickAction}
              >
                <MaterialCommunityIcons name="stethoscope" size={24} color={palette.primary} />
                <Text style={s.quickActionText}>Doctor Visit Prep</Text>
              </A11yPressable>
            </View>
          </View>
        )}

        {/* Phases Tab */}
        {activeTab === 'phases' && (
          <View>
            <A11yPressable onPress={() => setShowPhaseModal(true)} style={s.addButton}>
              <Ionicons name="add-circle-outline" size={20} color={palette.onPrimary} />
              <Text style={s.addButtonText}>{t('rtw.addPhase', 'Add Phase')}</Text>
            </A11yPressable>

            {plan?.phases?.length ? (
              <GapView gap={12} style={{ marginTop: 16 }}>
                {plan.phases.map((phase, index) => (
                  <View key={phase.id} style={[s.phaseCard, phase.status === 'current' && s.phaseCardCurrent]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={s.phaseTitle}>Week {phase.weekNumber}</Text>
                      <View style={[s.statusBadge, { backgroundColor: getStatusColor(phase.status, palette) }]}>
                        <Text style={s.statusText}>{phase.status}</Text>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                      <Text style={s.phaseMeta}>⏰ {phase.hoursPerDay}h/day</Text>
                      <Text style={s.phaseMeta}>📅 {phase.daysPerWeek} days/week</Text>
                    </View>
                    
                    {phase.duties.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={s.phaseLabel}>Duties:</Text>
                        {phase.duties.map((d, i) => (
                          <Text key={i} style={s.phaseItem}>• {d}</Text>
                        ))}
                      </View>
                    )}
                    
                    {phase.restrictions.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={[s.phaseLabel, { color: palette.warning }]}>⚠️ Restrictions:</Text>
                        {phase.restrictions.map((r, i) => (
                          <Text key={i} style={s.phaseItem}>{r}</Text>
                        ))}
                      </View>
                    )}
                    
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                      {phase.status !== 'completed' && (
                        <Pressable 
                          onPress={() => updatePhaseStatus(phase.id, 'completed')}
                          style={[s.phaseAction, { backgroundColor: palette.success + '20' }]}
                          accessibilityRole="button"
                          accessibilityLabel={`Complete phase ${phase.weekNumber}`}
                          hitSlop={HIT_SLOP_12}
                        >
                          <Text style={[s.phaseActionText, { color: palette.success }]}>✓ Complete</Text>
                        </Pressable>
                      )}
                      {phase.status === 'pending' && index === plan.phases.findIndex(p => p.status === 'pending') && (
                        <Pressable 
                          onPress={() => updatePhaseStatus(phase.id, 'current')}
                          style={[s.phaseAction, { backgroundColor: palette.primary + '20' }]}
                          accessibilityRole="button"
                          accessibilityLabel={`Start phase ${phase.weekNumber}`}
                          hitSlop={HIT_SLOP_12}
                        >
                          <Text style={[s.phaseActionText, { color: palette.primary }]}>▶ Start</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))}
              </GapView>
            ) : (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="calendar-clock" size={48} color={palette.muted} />
                <Text style={s.emptyText}>{t('rtw.noPhases', 'No phases added yet. Add your first phase to build your gradual return schedule.')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Communications Tab */}
        {activeTab === 'comms' && (
          <View>
            <A11yPressable onPress={() => setShowCommModal(true)} style={s.addButton}>
              <Ionicons name="add-circle-outline" size={20} color={palette.onPrimary} />
              <Text style={s.addButtonText}>{t('rtw.logComm', 'Log Communication')}</Text>
            </A11yPressable>

            {plan?.communicationLog?.length ? (
              <GapView gap={12} style={{ marginTop: 16 }}>
                {[...plan.communicationLog].reverse().map(comm => (
                  <View key={comm.id} style={s.commCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={s.commDate}>{comm.date}</Text>
                      <View style={s.commTypeBadge}>
                        <Text style={s.commTypeText}>{getCommIcon(comm.type)} {comm.type}</Text>
                      </View>
                    </View>
                    <Text style={s.commWith}>With: {comm.with}</Text>
                    <Text style={s.commSummary}>{comm.summary}</Text>
                    {comm.followUp && (
                      <Text style={s.commFollowUp}>📌 Follow-up: {comm.followUp}</Text>
                    )}
                  </View>
                ))}
              </GapView>
            ) : (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="message-text-clock" size={48} color={palette.muted} />
                <Text style={s.emptyText}>{t('rtw.noComms', 'No communications logged. Keep track of all conversations with employers, insurers, and healthcare providers.')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Export Actions */}
        {plan && (
          <View style={{ marginTop: 24, gap: 12 }}>
            <A11yPressable onPress={generatePlanDocument} style={s.secondaryButton}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={palette.text} />
              <Text style={s.secondaryButtonText}>{t('rtw.exportPDF', 'Export Plan as PDF')}</Text>
            </A11yPressable>
            <A11yPressable onPress={sharePlanSummary} style={s.secondaryButton}>
              <Ionicons name="share-outline" size={20} color={palette.text} />
              <Text style={s.secondaryButtonText}>{t('rtw.sharePlan', 'Share Plan Summary')}</Text>
            </A11yPressable>
            <A11yPressable onPress={reset} style={s.dangerButton}>
              <Ionicons name="trash-outline" size={20} color={palette.error} />
              <Text style={[s.secondaryButtonText, { color: palette.error }]}>{t('rtw.resetPlan', 'Reset Plan')}</Text>
            </A11yPressable>
          </View>
        )}
      </ScrollView>

      {/* Add Phase Modal */}
      <Modal visible={showPhaseModal} transparent animationType="slide" onRequestClose={() => setShowPhaseModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: palette.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={s.modalTitle}>{t('rtw.addPhaseTitle', 'Add RTW Phase')}</Text>
              <Pressable onPress={() => { setShowPhaseModal(false); resetPhaseForm(); }} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Close add phase modal">
                <Ionicons name="close-circle" size={28} color={palette.muted} />
              </Pressable>
            </View>
            
            <ScrollView>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Week #</Text>
                  <TextInput value={phaseWeek} onChangeText={setPhaseWeek} keyboardType="numeric" style={s.input} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Hours/Day</Text>
                  <TextInput value={phaseHours} onChangeText={setPhaseHours} keyboardType="numeric" style={s.input} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Days/Week</Text>
                  <TextInput value={phaseDays} onChangeText={setPhaseDays} keyboardType="numeric" style={s.input} />
                </View>
              </View>
              
              <Text style={[s.label, { marginTop: 16 }]}>Duties (one per line)</Text>
              <TextInput
                value={phaseDuties}
                onChangeText={setPhaseDuties}
                multiline
                numberOfLines={3}
                placeholder="e.g., Light paperwork&#10;Answer phones&#10;Attend meetings"
                placeholderTextColor={palette.text + '77'}
                style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
              />
              
              <Text style={[s.label, { marginTop: 16 }]}>⚠️ Restrictions</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {COMMON_RESTRICTIONS.map(r => (
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    key={r}
                    onPress={() => setPhaseRestrictions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                    style={[s.restrictionChip, phaseRestrictions.includes(r) && s.restrictionChipSelected]}
                  >
                    <Text style={[s.restrictionChipText, phaseRestrictions.includes(r) && s.restrictionChipTextSelected]}>{r}</Text>
                  </Pressable>
                ))}
              </View>
              
              <A11yPressable onPress={addPhase} style={[s.primaryButton, { marginTop: 20 }]}>
                <Text style={s.primaryButtonText}>{t('rtw.savePhase', 'Save Phase')}</Text>
              </A11yPressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Communication Modal */}
      <Modal visible={showCommModal} transparent animationType="slide" onRequestClose={() => setShowCommModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: palette.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={s.modalTitle}>{t('rtw.logCommTitle', 'Log Communication')}</Text>
              <Pressable onPress={() => setShowCommModal(false)} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Close log communication modal">
                <Ionicons name="close-circle" size={28} color={palette.muted} />
              </Pressable>
            </View>
            
            <Text style={s.label}>Contact Name/Title</Text>
            <TextInput value={commWith} onChangeText={setCommWith} placeholder="e.g., HR Manager, Case Worker" placeholderTextColor={palette.text + '77'} style={s.input} />
            
            <Text style={[s.label, { marginTop: 12 }]}>Type</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['email', 'phone', 'meeting', 'letter'] as const).map(type => (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  key={type}
                  onPress={() => setCommType(type)}
                  style={[s.typeChip, commType === type && s.typeChipSelected]}
                >
                  <Text style={[s.typeChipText, commType === type && s.typeChipTextSelected]}>
                    {getCommIcon(type)} {type}
                  </Text>
                </Pressable>
              ))}
            </View>
            
            <Text style={[s.label, { marginTop: 12 }]}>Summary</Text>
            <TextInput 
              value={commSummary} 
              onChangeText={setCommSummary} 
              multiline 
              numberOfLines={3}
              placeholder="What was discussed?" 
              placeholderTextColor={palette.text + '77'} 
              style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]} 
            />
            
            <Text style={[s.label, { marginTop: 12 }]}>Follow-up Needed (optional)</Text>
            <TextInput value={commFollowUp} onChangeText={setCommFollowUp} placeholder="e.g., Send documents by Friday" placeholderTextColor={palette.text + '77'} style={s.input} />
            
            <A11yPressable onPress={addCommunication} style={[s.primaryButton, { marginTop: 20 }]}>
              <Text style={s.primaryButtonText}>{t('rtw.saveComm', 'Save Communication')}</Text>
            </A11yPressable>
          </View>
        </View>
      </Modal>
    </ResponsiveScreenWrapper>
  );
}

function getStatusColor(status: RTWPhase['status'], palette: ReturnType<typeof useAppPalette>) {
  const colors: Record<RTWPhase['status'], string> = {
    pending: palette.muted,
    current: palette.primary,
    completed: palette.success,
    adjusted: palette.warning,
  };
  return colors[status];
}

function getCommIcon(type: CommunicationLog['type']) {
  const icons: Record<CommunicationLog['type'], string> = {
    email: '📧',
    phone: '📞',
    meeting: '👥',
    letter: '✉️',
  };
  return icons[type];
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    title: { fontSize: 24, fontWeight: '700', color: palette.text, marginBottom: 8 },
    subtitle: { fontSize: 15, color: palette.text, opacity: 0.9, marginBottom: 12, lineHeight: 22 },
    tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    tabActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    tabText: { fontSize: 14, fontWeight: '600', color: palette.text },
    tabTextActive: { color: palette.onPrimary },
    progressCard: { backgroundColor: palette.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
    progressLabel: { fontSize: 14, fontWeight: '600', color: palette.text },
    progressValue: { fontSize: 14, color: palette.primary, fontWeight: '700' },
    progressBarBg: { height: 8, backgroundColor: palette.muted + '30', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: palette.success, borderRadius: 4 },
    formGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: palette.text, marginBottom: 6 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 12, color: palette.text, backgroundColor: palette.surface },
    primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primary, padding: 16, borderRadius: 12, gap: 8 },
    primaryButtonText: { color: palette.onPrimary, fontSize: 16, fontWeight: '700' },
    secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted, padding: 14, borderRadius: 12, gap: 8 },
    secondaryButtonText: { color: palette.text, fontSize: 15, fontWeight: '600' },
    dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.error + '10', borderWidth: 1, borderColor: palette.error, padding: 14, borderRadius: 12, gap: 8 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primary, padding: 14, borderRadius: 12, gap: 8 },
    addButtonText: { color: palette.onPrimary, fontSize: 15, fontWeight: '700' },
    accChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    accChipSelected: { backgroundColor: palette.success, borderColor: palette.success },
    accChipText: { fontSize: 12, color: palette.text },
    accChipTextSelected: { color: palette.onPrimary },
    restrictionChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    restrictionChipSelected: { backgroundColor: palette.warning, borderColor: palette.warning },
    restrictionChipText: { fontSize: 11, color: palette.text },
    restrictionChipTextSelected: { color: palette.text },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 12 },
    quickAction: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted, borderRadius: 12, padding: 16, alignItems: 'center', width: '47%', gap: 8 },
    quickActionText: { fontSize: 12, fontWeight: '600', color: palette.text, textAlign: 'center' },
    phaseCard: { backgroundColor: palette.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: palette.muted },
    phaseCardCurrent: { borderColor: palette.primary, borderWidth: 2 },
    phaseTitle: { fontSize: 18, fontWeight: '700', color: palette.text },
    phaseMeta: { fontSize: 14, color: palette.textSecondary },
    phaseLabel: { fontSize: 13, fontWeight: '600', color: palette.text, marginBottom: 4 },
    phaseItem: { fontSize: 13, color: palette.text, marginLeft: 8 },
    phaseAction: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    phaseActionText: { fontSize: 12, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '700', color: palette.onPrimary, textTransform: 'uppercase' },
    commCard: { backgroundColor: palette.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: palette.muted },
    commDate: { fontSize: 13, fontWeight: '600', color: palette.textSecondary },
    commTypeBadge: { backgroundColor: palette.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    commTypeText: { fontSize: 11, fontWeight: '600', color: palette.primary, textTransform: 'uppercase' },
    commWith: { fontSize: 15, fontWeight: '600', color: palette.text, marginTop: 8 },
    commSummary: { fontSize: 14, color: palette.text, marginTop: 6, lineHeight: 20 },
    commFollowUp: { fontSize: 13, color: palette.warning, marginTop: 8, fontWeight: '600' },
    typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    typeChipSelected: { backgroundColor: palette.primary, borderColor: palette.primary },
    typeChipText: { fontSize: 12, color: palette.text },
    typeChipTextSelected: { color: palette.onPrimary },
    emptyState: { alignItems: 'center', padding: 32, marginTop: 16 },
    emptyText: { fontSize: 14, color: palette.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: palette.text },
  });
}

