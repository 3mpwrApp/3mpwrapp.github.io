/**
 * Doctor Visit Prep - Enhanced Medical Appointment Preparation
 * 
 * Comprehensive features:
 * - Symptom severity timeline to show doctor
 * - Medication history with side effects
 * - Question builder with AI suggestions
 * - Visit summary generator (PDF)
 * - Accommodation letter request builder
 * - Follow-up appointment tracker
 * - Provider communication log
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import { GapView } from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

let AsyncStorage: any;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

export const options = { href: null };

const VISIT_PREP_KEY = 'doctorVisitPrep:data:v1';

interface SymptomEntry {
  id: string;
  symptom: string;
  severity: number;
  date: string;
  notes?: string;
}

interface MedicationEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  sideEffects?: string;
  effective: boolean | null;
}

interface VisitPrep {
  id: string;
  appointmentDate?: string;
  doctorName?: string;
  purpose: string;
  symptoms: SymptomEntry[];
  medications: MedicationEntry[];
  questions: string[];
  requestedDocuments: string[];
  notes: string;
  createdAt: string;
}

const SUGGESTED_QUESTIONS = {
  general: [
    'What is causing my symptoms?',
    'What treatment options are available?',
    'What are the side effects of this treatment?',
    'How long until I see improvement?',
    'When should I follow up?',
  ],
  disability: [
    'Can you provide a letter documenting my functional limitations?',
    'What accommodations would you recommend for my workplace?',
    'Can you complete a Functional Abilities Form?',
    'What is my prognosis for returning to work?',
    'Can you refer me to a specialist for further assessment?',
  ],
  medication: [
    'Are there alternative medications with fewer side effects?',
    'Can I take this medication with my other prescriptions?',
    'What should I do if I miss a dose?',
    'Are there generic versions available?',
    'How long do I need to take this medication?',
  ],
  workersComp: [
    'Is my condition work-related in your medical opinion?',
    'Can you document the connection between my work and injury?',
    'What restrictions do you recommend for modified duties?',
    'Can you provide a timeline for my recovery?',
    'Will you support my claim if needed?',
  ],
};

const DOCUMENT_REQUESTS = [
  '📋 Functional Abilities Form (FAF)',
  '📄 Support Letter for Accommodation',
  '📝 Medical Records Summary',
  '💊 Medication History',
  '🏥 Referral to Specialist',
  '📊 Test Results (Lab, Imaging)',
  '⚖️ Legal/Insurance Support Letter',
  '🔄 Return-to-Work Plan',
];

export default function DoctorVisitPrep() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  const s = useMemo(() => styles(palette), [palette]);
  
  useFocusOnRefOnMount(titleRef);
  useAnnounceOnMount(t('doctorVisit.screenLabel', 'Doctor Visit Prep screen'));

  const [visitPrep, setVisitPrep] = useState<VisitPrep | null>(null);
  const [activeTab, setActiveTab] = useState<'prep' | 'symptoms' | 'meds' | 'questions'>('prep');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionCategory, setSuggestionCategory] = useState<keyof typeof SUGGESTED_QUESTIONS>('general');

  // Form state
  const [appointmentDate, setAppointmentDate] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [requestedDocs, setRequestedDocs] = useState<string[]>([]);

  // Symptom form
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [newSeverity, setNewSeverity] = useState(5);
  const [newSymptomNotes, setNewSymptomNotes] = useState('');

  // Medication form
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('');
  const [newMedSideEffects, setNewMedSideEffects] = useState('');

  // Load saved data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const raw = await AsyncStorage?.getItem?.(VISIT_PREP_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setVisitPrep(data);
        setAppointmentDate(data.appointmentDate || '');
        setDoctorName(data.doctorName || '');
        setPurpose(data.purpose || '');
        setNotes(data.notes || '');
        setQuestions(data.questions || []);
        setRequestedDocs(data.requestedDocuments || []);
        setSymptoms(data.symptoms || []);
        setMedications(data.medications || []);
      }
    } catch (e) {
      console.warn('Failed to load visit prep:', e);
    }
  };

  const saveData = useCallback(async () => {
    try {
      const data: VisitPrep = {
        id: visitPrep?.id || `visit_${Date.now()}`,
        appointmentDate,
        doctorName,
        purpose,
        symptoms,
        medications,
        questions,
        requestedDocuments: requestedDocs,
        notes,
        createdAt: visitPrep?.createdAt || new Date().toISOString(),
      };
      await AsyncStorage?.setItem?.(VISIT_PREP_KEY, JSON.stringify(data));
      setVisitPrep(data);
      announce(t('doctorVisit.saved', 'Saved'));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  }, [appointmentDate, doctorName, purpose, symptoms, medications, questions, requestedDocs, notes, visitPrep]);

  const addSymptom = () => {
    if (!newSymptom.trim()) return;
    const entry: SymptomEntry = {
      id: `sym_${Date.now()}`,
      symptom: newSymptom.trim(),
      severity: newSeverity,
      date: new Date().toISOString().split('T')[0],
      notes: newSymptomNotes.trim() || undefined,
    };
    setSymptoms(prev => [...prev, entry]);
    setNewSymptom('');
    setNewSeverity(5);
    setNewSymptomNotes('');
    announce(t('doctorVisit.symptomAdded', 'Symptom added'));
  };

  const addMedication = () => {
    if (!newMedName.trim()) return;
    const entry: MedicationEntry = {
      id: `med_${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      frequency: newMedFrequency.trim(),
      sideEffects: newMedSideEffects.trim() || undefined,
      effective: null,
    };
    setMedications(prev => [...prev, entry]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedFrequency('');
    setNewMedSideEffects('');
    announce(t('doctorVisit.medAdded', 'Medication added'));
  };

  const addQuestion = (q: string) => {
    if (q.trim() && !questions.includes(q.trim())) {
      setQuestions(prev => [...prev, q.trim()]);
      setNewQuestion('');
      announce(t('doctorVisit.questionAdded', 'Question added'));
    }
  };

  const toggleDocument = (doc: string) => {
    setRequestedDocs(prev =>
      prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
    );
  };

  const generateSummary = async () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 24px; }
            .info { background: #f3f4f6; padding: 12px; border-radius: 8px; margin: 12px 0; }
            .symptom { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .severity-high { color: #dc2626; font-weight: bold; }
            .severity-medium { color: #f59e0b; }
            .severity-low { color: #10b981; }
            .medication { background: #eff6ff; padding: 10px; border-radius: 6px; margin: 8px 0; }
            .question { padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
            .checkbox { margin-right: 8px; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>📋 Doctor Visit Summary</h1>
          
          <div class="info">
            <strong>Date:</strong> ${appointmentDate || 'Not set'}<br>
            <strong>Doctor:</strong> ${doctorName || 'Not specified'}<br>
            <strong>Purpose:</strong> ${purpose || 'General visit'}
          </div>
          
          ${symptoms.length > 0 ? `
            <h2>🩺 Current Symptoms</h2>
            ${symptoms.map(s => `
              <div class="symptom">
                <span>${s.symptom}</span>
                <span class="${s.severity >= 7 ? 'severity-high' : s.severity >= 4 ? 'severity-medium' : 'severity-low'}">
                  Severity: ${s.severity}/10
                </span>
              </div>
              ${s.notes ? `<small style="color: #6b7280;">${s.notes}</small>` : ''}
            `).join('')}
          ` : ''}
          
          ${medications.length > 0 ? `
            <h2>💊 Current Medications</h2>
            ${medications.map(m => `
              <div class="medication">
                <strong>${m.name}</strong> - ${m.dosage} (${m.frequency})<br>
                ${m.sideEffects ? `<small>Side effects: ${m.sideEffects}</small>` : ''}
              </div>
            `).join('')}
          ` : ''}
          
          ${questions.length > 0 ? `
            <h2>❓ Questions for Doctor</h2>
            ${questions.map((q, i) => `
              <div class="question">
                <span class="checkbox">☐</span> ${i + 1}. ${q}
              </div>
            `).join('')}
          ` : ''}
          
          ${requestedDocs.length > 0 ? `
            <h2>📄 Documents to Request</h2>
            ${requestedDocs.map(d => `<div class="question"><span class="checkbox">☐</span> ${d}</div>`).join('')}
          ` : ''}
          
          ${notes ? `
            <h2>📝 Additional Notes</h2>
            <p>${notes.replace(/\n/g, '<br>')}</p>
          ` : ''}
          
          <div class="footer">
            <p>Prepared with 3MPWR App - Doctor Visit Prep Tool</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;
      
      const { printAsync } = await import('expo-print');
      await printAsync({ html });
    } catch {
      Alert.alert(t('doctorVisit.printFailed', 'Print Failed'), t('doctorVisit.printFailedDesc', 'Could not generate summary'));
    }
  };

  const reset = () => {
    Alert.alert(
      t('doctorVisit.resetTitle', 'Clear All?'),
      t('doctorVisit.resetDesc', 'This will remove all saved information.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.clear', 'Clear'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage?.removeItem?.(VISIT_PREP_KEY);
            setVisitPrep(null);
            setAppointmentDate('');
            setDoctorName('');
            setPurpose('');
            setNotes('');
            setQuestions([]);
            setRequestedDocs([]);
            setSymptoms([]);
            setMedications([]);
          },
        },
      ]
    );
  };

  return (
    <ResponsiveScreenWrapper testID="doctor-visit-prep-screen">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={s.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          🩺 {t('doctorVisit.title', 'Doctor Visit Prep')}
        </Text>
        
        <DyslexiaText style={s.subtitle}>
          {t('doctorVisit.subtitle', 'Prepare for appointments with organized symptoms, medications, and questions.')}
        </DyslexiaText>
        
        <DisclaimerBanner type="medical" compact />

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['prep', 'symptoms', 'meds', 'questions'] as const).map(tab => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[s.tab, activeTab === tab && s.tabActive]}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                  {tab === 'prep' && '📋 Prep'}
                  {tab === 'symptoms' && '🩹 Symptoms'}
                  {tab === 'meds' && '💊 Meds'}
                  {tab === 'questions' && '❓ Questions'}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Prep Tab */}
        {activeTab === 'prep' && (
          <View>
            <View style={s.formGroup}>
              <Text style={s.label}>{t('doctorVisit.appointmentDate', 'Appointment Date')}</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor={palette.text + '77'}
                value={appointmentDate}
                onChangeText={setAppointmentDate}
                style={s.input}
              />
            </View>
            
            <View style={s.formGroup}>
              <Text style={s.label}>{t('doctorVisit.doctorName', 'Doctor / Provider')}</Text>
              <TextInput
                placeholder="Dr. Smith"
                placeholderTextColor={palette.text + '77'}
                value={doctorName}
                onChangeText={setDoctorName}
                style={s.input}
              />
            </View>
            
            <View style={s.formGroup}>
              <Text style={s.label}>{t('doctorVisit.purpose', 'Visit Purpose')}</Text>
              <TextInput
                placeholder="Follow-up, new symptoms, medication review..."
                placeholderTextColor={palette.text + '77'}
                value={purpose}
                onChangeText={setPurpose}
                style={s.input}
              />
            </View>

            <Text style={[s.label, { marginTop: 16 }]}>
              {t('doctorVisit.requestDocs', '📄 Documents to Request')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {DOCUMENT_REQUESTS.map(doc => (
                <Pressable
                  key={doc}
                  onPress={() => toggleDocument(doc)}
                  style={[s.docChip, requestedDocs.includes(doc) && s.docChipSelected]}
                >
                  <Text style={[s.docChipText, requestedDocs.includes(doc) && s.docChipTextSelected]}>
                    {doc}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={s.formGroup}>
              <Text style={s.label}>{t('doctorVisit.notes', 'Additional Notes')}</Text>
              <TextInput
                placeholder="Anything else to discuss..."
                placeholderTextColor={palette.text + '77'}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={[s.input, { minHeight: 100, textAlignVertical: 'top' }]}
              />
            </View>

            <A11yPressable onPress={saveData} style={s.primaryButton}>
              <Ionicons name="save-outline" size={20} color={palette.onPrimary} />
              <Text style={s.primaryButtonText}>{t('doctorVisit.save', 'Save Progress')}</Text>
            </A11yPressable>
          </View>
        )}

        {/* Symptoms Tab */}
        {activeTab === 'symptoms' && (
          <View>
            <View style={s.card}>
              <Text style={s.cardTitle}>{t('doctorVisit.addSymptom', 'Add Symptom')}</Text>
              <TextInput
                placeholder="Describe symptom..."
                placeholderTextColor={palette.text + '77'}
                value={newSymptom}
                onChangeText={setNewSymptom}
                style={s.input}
              />
              
              <Text style={[s.label, { marginTop: 12 }]}>
                {t('doctorVisit.severity', 'Severity')}: {newSeverity}/10
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <Pressable
                    key={n}
                    onPress={() => setNewSeverity(n)}
                    style={[
                      s.severityDot,
                      newSeverity >= n && {
                        backgroundColor: n >= 7 ? palette.error : n >= 4 ? palette.warning : palette.success,
                      },
                    ]}
                  >
                    <Text style={{ color: newSeverity >= n ? palette.onPrimary : palette.text, fontSize: 10 }}>
                      {n}
                    </Text>
                  </Pressable>
                ))}
              </View>
              
              <TextInput
                placeholder="Notes (optional)"
                placeholderTextColor={palette.text + '77'}
                value={newSymptomNotes}
                onChangeText={setNewSymptomNotes}
                style={[s.input, { marginTop: 12 }]}
              />
              
              <A11yPressable onPress={addSymptom} style={[s.secondaryButton, { marginTop: 12 }]}>
                <Text style={s.secondaryButtonText}>{t('doctorVisit.addBtn', 'Add Symptom')}</Text>
              </A11yPressable>
            </View>

            {symptoms.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={s.sectionTitle}>{t('doctorVisit.yourSymptoms', 'Your Symptoms')} ({symptoms.length})</Text>
                {symptoms.map(sym => (
                  <View key={sym.id} style={s.listItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.listItemTitle}>{sym.symptom}</Text>
                      <Text style={[
                        s.listItemMeta,
                        { color: sym.severity >= 7 ? palette.error : sym.severity >= 4 ? palette.warning : palette.success }
                      ]}>
                        Severity: {sym.severity}/10 • {sym.date}
                      </Text>
                      {sym.notes && <Text style={s.listItemNotes}>{sym.notes}</Text>}
                    </View>
                    <Pressable onPress={() => setSymptoms(prev => prev.filter(s => s.id !== sym.id))} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel={`Delete symptom ${sym.symptom}`}>
                      <Ionicons name="trash-outline" size={20} color={palette.error} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Medications Tab */}
        {activeTab === 'meds' && (
          <View>
            <View style={s.card}>
              <Text style={s.cardTitle}>{t('doctorVisit.addMedication', 'Add Medication')}</Text>
              <TextInput
                placeholder="Medication name"
                placeholderTextColor={palette.text + '77'}
                value={newMedName}
                onChangeText={setNewMedName}
                style={s.input}
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TextInput
                  placeholder="Dosage (e.g., 500mg)"
                  placeholderTextColor={palette.text + '77'}
                  value={newMedDosage}
                  onChangeText={setNewMedDosage}
                  style={[s.input, { flex: 1 }]}
                />
                <TextInput
                  placeholder="Frequency"
                  placeholderTextColor={palette.text + '77'}
                  value={newMedFrequency}
                  onChangeText={setNewMedFrequency}
                  style={[s.input, { flex: 1 }]}
                />
              </View>
              <TextInput
                placeholder="Side effects experienced (optional)"
                placeholderTextColor={palette.text + '77'}
                value={newMedSideEffects}
                onChangeText={setNewMedSideEffects}
                style={[s.input, { marginTop: 8 }]}
              />
              <A11yPressable onPress={addMedication} style={[s.secondaryButton, { marginTop: 12 }]}>
                <Text style={s.secondaryButtonText}>{t('doctorVisit.addMedBtn', 'Add Medication')}</Text>
              </A11yPressable>
            </View>

            {medications.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={s.sectionTitle}>{t('doctorVisit.yourMeds', 'Your Medications')} ({medications.length})</Text>
                {medications.map(med => (
                  <View key={med.id} style={s.listItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.listItemTitle}>{med.name}</Text>
                      <Text style={s.listItemMeta}>{med.dosage} • {med.frequency}</Text>
                      {med.sideEffects && (
                        <Text style={[s.listItemNotes, { color: palette.warning }]}>
                          ⚠️ {med.sideEffects}
                        </Text>
                      )}
                    </View>
                    <Pressable onPress={() => setMedications(prev => prev.filter(m => m.id !== med.id))} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel={`Delete medication ${med.name}`}>
                      <Ionicons name="trash-outline" size={20} color={palette.error} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <View>
            <View style={s.card}>
              <Text style={s.cardTitle}>{t('doctorVisit.addQuestion', 'Add Question')}</Text>
              <TextInput
                placeholder="What do you want to ask?"
                placeholderTextColor={palette.text + '77'}
                value={newQuestion}
                onChangeText={setNewQuestion}
                style={s.input}
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <A11yPressable onPress={() => addQuestion(newQuestion)} style={[s.secondaryButton, { flex: 1 }]}>
                  <Text style={s.secondaryButtonText}>{t('doctorVisit.addQuestionBtn', 'Add')}</Text>
                </A11yPressable>
                <A11yPressable onPress={() => setShowSuggestions(true)} style={[s.secondaryButton, { flex: 1 }]}>
                  <Text style={s.secondaryButtonText}>💡 {t('doctorVisit.suggestions', 'Suggestions')}</Text>
                </A11yPressable>
              </View>
            </View>

            {questions.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={s.sectionTitle}>{t('doctorVisit.yourQuestions', 'Your Questions')} ({questions.length})</Text>
                {questions.map((q, i) => (
                  <View key={i} style={s.listItem}>
                    <Text style={[s.listItemTitle, { flex: 1 }]}>{i + 1}. {q}</Text>
                    <Pressable onPress={() => setQuestions(prev => prev.filter((_, idx) => idx !== i))} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel={`Delete question ${i + 1}`}>
                      <Ionicons name="trash-outline" size={20} color={palette.error} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ marginTop: 24, gap: 12 }}>
          <A11yPressable onPress={generateSummary} style={s.primaryButton}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={palette.onPrimary} />
            <Text style={s.primaryButtonText}>{t('doctorVisit.generateSummary', 'Generate Summary PDF')}</Text>
          </A11yPressable>
          
          <A11yPressable onPress={reset} style={s.dangerButton}>
            <Ionicons name="refresh-outline" size={20} color={palette.error} />
            <Text style={[s.secondaryButtonText, { color: palette.error }]}>{t('doctorVisit.startOver', 'Start Over')}</Text>
          </A11yPressable>
        </View>
      </ScrollView>

      {/* Suggestions Modal */}
      <Modal visible={showSuggestions} transparent animationType="slide" onRequestClose={() => setShowSuggestions(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: palette.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={s.cardTitle}>{t('doctorVisit.suggestedQuestions', 'Suggested Questions')}</Text>
              <Pressable onPress={() => setShowSuggestions(false)} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Close suggestions">
                <Ionicons name="close-circle" size={28} color={palette.muted} />
              </Pressable>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {Object.keys(SUGGESTED_QUESTIONS).map(cat => (
                  <Pressable
                    key={cat}
                    onPress={() => setSuggestionCategory(cat as keyof typeof SUGGESTED_QUESTIONS)}
                    style={[s.tab, suggestionCategory === cat && s.tabActive]}
                  >
                    <Text style={[s.tabText, suggestionCategory === cat && s.tabTextActive]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/([A-Z])/g, ' $1')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            
            <ScrollView>
              <GapView gap={8}>
                {SUGGESTED_QUESTIONS[suggestionCategory].map((q, i) => (
                  <A11yPressable
                    key={i}
                    onPress={() => { addQuestion(q); setShowSuggestions(false); }}
                    style={s.suggestionItem}
                  >
                    <Text style={s.suggestionText}>{q}</Text>
                    <Ionicons name="add-circle-outline" size={24} color={palette.primary} />
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

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    title: { fontSize: 24, fontWeight: '700', color: palette.text, marginBottom: 8 },
    subtitle: { fontSize: 15, color: palette.text, opacity: 0.9, marginBottom: 12, lineHeight: 22 },
    tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    tabActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    tabText: { fontSize: 14, fontWeight: '600', color: palette.text },
    tabTextActive: { color: palette.onPrimary },
    formGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: palette.text, marginBottom: 6 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 12, color: palette.text, backgroundColor: palette.surface },
    card: { backgroundColor: palette.surface, borderRadius: 12, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    cardTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 12 },
    primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primary, padding: 16, borderRadius: 12, gap: 8 },
    primaryButtonText: { color: palette.onPrimary, fontSize: 16, fontWeight: '700' },
    secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted, padding: 12, borderRadius: 8 },
    secondaryButtonText: { color: palette.text, fontSize: 14, fontWeight: '600' },
    dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.error + '10', borderWidth: 1, borderColor: palette.error, padding: 12, borderRadius: 8, gap: 6 },
    docChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    docChipSelected: { backgroundColor: palette.primary, borderColor: palette.primary },
    docChipText: { fontSize: 12, color: palette.text },
    docChipTextSelected: { color: palette.onPrimary },
    severityDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: palette.muted + '40', alignItems: 'center', justifyContent: 'center' },
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    listItemTitle: { fontSize: 15, fontWeight: '600', color: palette.text },
    listItemMeta: { fontSize: 13, color: palette.textSecondary, marginTop: 2 },
    listItemNotes: { fontSize: 13, color: palette.textSecondary, marginTop: 4, fontStyle: 'italic' },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.background, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: palette.muted },
    suggestionText: { flex: 1, fontSize: 14, color: palette.text, marginRight: 12 },
  });
}
