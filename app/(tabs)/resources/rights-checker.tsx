import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import { DyslexiaText } from "../../../components/DyslexiaText";
import GapView from "../../../components/GapView";
import ResponsiveScreenWrapper from "../../../components/ResponsiveScreenWrapper";
import { HIT_SLOP_8 } from "../../../constants/A11Y";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useJurisdiction } from "../../../store/jurisdiction";
import { useAppPalette } from "../../../theme/usePalette";
import { announce } from '../../../utils/announce';

type Answer = "yes" | "no" | "unsure" | null;
type RightsCategory = 'all' | 'employment' | 'benefits' | 'disability' | 'safety' | 'harassment';

// Comprehensive rights knowledge base
const RIGHTS_DATABASE = {
  employment: {
    title: 'Employment Rights',
    icon: 'briefcase-outline' as const,
    rights: [
      { id: 'unjust_dismissal', title: 'Protection from Unjust Dismissal', description: 'After 3 months (federal) or probation period (provincial), you cannot be dismissed without just cause or adequate notice/pay in lieu.' },
      { id: 'notice_period', title: 'Notice Period or Pay in Lieu', description: 'Entitled to written notice or pay based on length of service (1 week per year is common minimum, more with common law).' },
      { id: 'severance', title: 'Severance Pay', description: 'After 5 years (Ontario), entitled to 1 week per year of service in severance in addition to notice.' },
      { id: 'termination_letter', title: 'Written Termination Notice', description: 'Right to receive written explanation for termination including reason and effective date.' },
      { id: 'record_of_employment', title: 'Record of Employment (ROE)', description: 'Employer must issue ROE within 5 days for EI purposes.' },
      { id: 'vacation_payout', title: 'Vacation Pay Payout', description: 'All earned vacation pay must be paid out upon termination.' },
      { id: 'commission_bonus', title: 'Outstanding Wages & Commission', description: 'All earned wages, commissions, and bonuses must be paid.' },
    ],
  },
  benefits: {
    title: 'Benefits & Income Support',
    icon: 'cash-multiple' as const,
    rights: [
      { id: 'wsib_claim', title: 'WSIB/WCB Claim Right', description: 'Right to claim for any workplace injury or illness, including occupational disease and mental stress.' },
      { id: 'ltd_claim', title: 'Long-Term Disability Benefits', description: 'If covered by group insurance, right to claim LTD after elimination period (usually 90-180 days).' },
      { id: 'cpp_disability', title: 'CPP Disability Benefits', description: 'If disability is "severe and prolonged" and you have sufficient contributions, you can apply for CPP-D.' },
      { id: 'ei_sickness', title: 'EI Sickness Benefits', description: 'Up to 26 weeks of benefits (55% of earnings to max) if unable to work due to illness/injury.' },
      { id: 'odsp_eligibility', title: 'ODSP Eligibility', description: 'If disability is expected to last 1+ year and you meet income/asset tests, may qualify for ODSP.' },
      { id: 'appeal_rights', title: 'Right to Appeal Denials', description: 'Every denial decision can be appealed - usually within 30-90 days depending on program.' },
      { id: 'claim_file_access', title: 'Access to Your Claim File', description: 'Right to request and receive complete copy of your claim file from any insurer or board.' },
    ],
  },
  disability: {
    title: 'Disability Rights',
    icon: 'wheelchair-accessibility' as const,
    rights: [
      { id: 'duty_accommodate', title: 'Duty to Accommodate', description: 'Employers must accommodate disabilities to point of undue hardship - this is a legal obligation.' },
      { id: 'undue_hardship', title: 'Undue Hardship Standard', description: 'Only cost, health/safety risks, or impossibility can justify refusal - inconvenience is not undue hardship.' },
      { id: 'medical_info', title: 'Medical Information Privacy', description: 'Employer only entitled to functional limitations/restrictions, not diagnosis or full medical records.' },
      { id: 'interactive_process', title: 'Interactive Accommodation Process', description: 'Both employer and employee must engage in good-faith dialogue to find suitable accommodations.' },
      { id: 'modified_duties', title: 'Modified Duties', description: 'Right to modified duties, schedule changes, equipment, or other accommodations if needed.' },
      { id: 'aoda_compliance', title: 'AODA Standards (Ontario)', description: 'Organizations must meet accessibility standards for customer service, information, employment, and built environment.' },
      { id: 'service_animals', title: 'Service Animal Rights', description: 'Right to be accompanied by service animal in employment and public spaces.' },
    ],
  },
  safety: {
    title: 'Workplace Safety',
    icon: 'shield-check-outline' as const,
    rights: [
      { id: 'right_refuse', title: 'Right to Refuse Unsafe Work', description: 'Can refuse work you reasonably believe is dangerous without employer reprisal.' },
      { id: 'right_know', title: 'Right to Know (Hazards)', description: 'Right to information about hazards in workplace, including WHMIS training and safety data sheets.' },
      { id: 'right_participate', title: 'Right to Participate', description: 'Right to participate in safety committees and raise safety concerns without reprisal.' },
      { id: 'report_hazards', title: 'Report Hazards', description: 'Right to report workplace hazards to employer, safety committee, or Ministry of Labour.' },
      { id: 'no_reprisal', title: 'Protection from Reprisal', description: 'Illegal for employer to punish you for exercising health and safety rights.' },
      { id: 'incident_reporting', title: 'Incident Reporting', description: 'Right to have workplace injuries and near-misses properly reported and investigated.' },
      { id: 'violence_prevention', title: 'Violence Prevention', description: 'Employer must assess and address workplace violence risks and have prevention policies.' },
    ],
  },
  harassment: {
    title: 'Harassment & Discrimination',
    icon: 'account-alert-outline' as const,
    rights: [
      { id: 'human_rights', title: 'Human Rights Protection', description: 'Protection from discrimination on grounds including disability, race, sex, age, religion, family status.' },
      { id: 'harassment_free', title: 'Harassment-Free Workplace', description: 'Right to workplace free from harassment, including sexual harassment and bullying.' },
      { id: 'poisoned_environment', title: 'Poisoned Work Environment', description: 'Right to work environment not poisoned by discriminatory comments, jokes, or conduct.' },
      { id: 'file_complaint', title: 'File Human Rights Complaint', description: 'Right to file complaint with Human Rights Tribunal/Commission (usually 1 year deadline).' },
      { id: 'retaliation_protection', title: 'Reprisal Protection', description: 'Illegal to retaliate against someone who files or participates in human rights complaint.' },
      { id: 'investigation_right', title: 'Investigation Rights', description: 'Right to have harassment complaints properly investigated by employer.' },
      { id: 'damages_remedies', title: 'Damages & Remedies', description: 'Can seek compensation for injury to dignity, lost wages, and reinstatement through tribunal.' },
    ],
  },
};

// Enhanced questions with follow-ups
interface Question {
  id: string;
  text: string;
  category: RightsCategory;
  followUp?: { condition: Answer; questions: string[] };
  triggersRights: string[];
  urgencyLevel: 'info' | 'action' | 'urgent';
}

const QUESTIONS: Question[] = [
  { id: 'q1', text: 'Are you currently employed or were you recently terminated?', category: 'employment', triggersRights: ['unjust_dismissal', 'notice_period', 'severance'], urgencyLevel: 'info' },
  { id: 'q2', text: 'Are you a union member?', category: 'employment', triggersRights: [], urgencyLevel: 'info' },
  { id: 'q3', text: 'Do you have a disability or chronic health condition?', category: 'disability', triggersRights: ['duty_accommodate', 'human_rights'], urgencyLevel: 'info' },
  { id: 'q4', text: 'Have you been denied benefits (WSIB, LTD, CPP-D, EI, ODSP)?', category: 'benefits', triggersRights: ['appeal_rights', 'claim_file_access'], urgencyLevel: 'urgent' },
  { id: 'q5', text: 'Are you experiencing harassment or discrimination at work?', category: 'harassment', triggersRights: ['harassment_free', 'file_complaint', 'retaliation_protection'], urgencyLevel: 'urgent' },
  { id: 'q6', text: 'Have you been fired, disciplined, or demoted?', category: 'employment', triggersRights: ['unjust_dismissal', 'termination_letter', 'record_of_employment'], urgencyLevel: 'urgent' },
  { id: 'q7', text: 'Have you requested workplace accommodation?', category: 'disability', triggersRights: ['duty_accommodate', 'interactive_process', 'medical_info'], urgencyLevel: 'action' },
  { id: 'q8', text: 'Have you experienced a workplace injury or illness?', category: 'safety', triggersRights: ['wsib_claim', 'incident_reporting'], urgencyLevel: 'urgent' },
  { id: 'q9', text: 'Are there unsafe conditions at your workplace?', category: 'safety', triggersRights: ['right_refuse', 'right_know', 'report_hazards'], urgencyLevel: 'action' },
  { id: 'q10', text: 'Has your employer refused to accommodate your disability?', category: 'disability', triggersRights: ['duty_accommodate', 'undue_hardship', 'file_complaint'], urgencyLevel: 'urgent' },
  { id: 'q11', text: 'Were you terminated while on medical leave?', category: 'employment', triggersRights: ['human_rights', 'unjust_dismissal', 'duty_accommodate'], urgencyLevel: 'urgent' },
  { id: 'q12', text: 'Has your LTD or WSIB claim been cut off?', category: 'benefits', triggersRights: ['appeal_rights', 'claim_file_access'], urgencyLevel: 'urgent' },
];

// Action templates for different situations
const ACTION_TEMPLATES = {
  immediate_termination: [
    '📋 Request written reason for termination within 24 hours',
    '📄 Request your complete personnel file',
    '💼 Document your final pay, vacation owed, and commissions',
    '📝 File for EI immediately (don\'t delay)',
    '⚖️ Consult employment lawyer about wrongful dismissal (many offer free consultations)',
  ],
  denial_received: [
    '📋 Request complete claim file from insurer/board',
    '🔍 Use Denial Decoder to analyze denial letter',
    '📅 Note all appeal deadlines (usually 30-90 days)',
    '📝 Gather supporting medical documentation',
    '✍️ Use Letter Wizard for appeal letter templates',
  ],
  harassment_ongoing: [
    '📝 Document every incident (date, time, witnesses, what happened)',
    '📧 Keep all emails, texts, and written communications',
    '📢 Report to HR/management IN WRITING to create paper trail',
    '🤝 If unionized, file grievance immediately',
    '📅 Note: Human rights complaint deadline is typically 1 year',
  ],
  accommodation_denied: [
    '📝 Get denial in writing if not already provided',
    '❓ Ask specifically what "undue hardship" analysis was done',
    '🩺 Provide updated functional limitations from doctor',
    '💡 Propose alternative accommodations',
    '📞 Contact human rights commission for advice',
  ],
  workplace_injury: [
    '🏥 Seek medical attention immediately',
    '📋 Report injury to employer (Form 7 in Ontario)',
    '📝 File WSIB claim within 6 months of injury',
    '📄 Get copies of all medical records',
    '👥 Identify any witnesses to incident',
  ],
};

interface SavedAssessment {
  id: string;
  date: string;
  answers: Record<string, Answer>;
  summary: any;
}

export const options = { href: null };

const STORAGE_KEY = 'rights_checker_history_v1';

export default function RightsChecker() {
  const palette = useAppPalette();
  const s = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  const { data: jurisdictionData } = useJurisdiction();
  useAnnounceOnMount("Automated Rights Checker");
  useFocusOnRefOnMount(titleRef);

  // State
  const [activeTab, setActiveTab] = React.useState<'checker' | 'library' | 'history'>('checker');
  const [showInfo, setShowInfo] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState<RightsCategory>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [savedAssessments, setSavedAssessments] = React.useState<SavedAssessment[]>([]);
  const [showRightsDetail, setShowRightsDetail] = React.useState<string | null>(null);

  // Answer state for all 12 questions
  const [answers, setAnswers] = React.useState<Record<string, Answer>>({});
  
  const setAnswer = (qId: string, value: Answer) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const ready = QUESTIONS.every(q => answers[q.id] !== undefined && answers[q.id] !== null);
  const answeredCount = Object.values(answers).filter(a => a !== null && a !== undefined).length;

  // Load saved assessments
  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) setSavedAssessments(JSON.parse(data));
    }).catch(() => {});
  }, []);

  // Generate comprehensive summary
  const summary = React.useMemo(() => {
    if (!ready) return null;

    const rights: { id: string; title: string; description: string; category: string; urgency: string }[] = [];
    const actions: { text: string; priority: 'urgent' | 'action' | 'info' }[] = [];
    const deadlines: string[] = [];
    const resources: { title: string; description: string }[] = [];

    // Analyze answers and build rights list
    QUESTIONS.forEach(q => {
      if (answers[q.id] === 'yes') {
        q.triggersRights.forEach(rightId => {
          // Find the right in database
          Object.entries(RIGHTS_DATABASE).forEach(([_category, data]) => {
            const right = data.rights.find(r => r.id === rightId);
            if (right && !rights.find(r => r.id === rightId)) {
              rights.push({
                ...right,
                category: data.title,
                urgency: q.urgencyLevel,
              });
            }
          });
        });
      }
    });

    // Generate situation-specific actions
    if (answers.q6 === 'yes') {
      ACTION_TEMPLATES.immediate_termination.forEach(action => {
        actions.push({ text: action, priority: 'urgent' });
      });
    }

    if (answers.q4 === 'yes' || answers.q12 === 'yes') {
      ACTION_TEMPLATES.denial_received.forEach(action => {
        actions.push({ text: action, priority: 'urgent' });
      });
    }

    if (answers.q5 === 'yes') {
      ACTION_TEMPLATES.harassment_ongoing.forEach(action => {
        actions.push({ text: action, priority: 'urgent' });
      });
    }

    if (answers.q10 === 'yes') {
      ACTION_TEMPLATES.accommodation_denied.forEach(action => {
        actions.push({ text: action, priority: 'action' });
      });
    }

    if (answers.q8 === 'yes') {
      ACTION_TEMPLATES.workplace_injury.forEach(action => {
        actions.push({ text: action, priority: 'urgent' });
      });
    }

    // Add union-specific guidance
    if (answers.q2 === 'yes') {
      actions.push({ text: '🤝 Contact your union representative immediately', priority: 'urgent' });
      actions.push({ text: '📋 Review your collective agreement for relevant provisions', priority: 'action' });
      if (answers.q6 === 'yes') {
        actions.push({ text: '⏰ File grievance BEFORE deadline (usually 5-30 days)', priority: 'urgent' });
      }
    }

    // Add jurisdiction-specific deadlines
    if (jurisdictionData) {
      if (jurisdictionData.workplaceInjury?.appealLevels?.[0]?.typicalDeadlineDays) {
        deadlines.push(`⚠️ WSIB Appeal: ${jurisdictionData.workplaceInjury.appealLevels[0].typicalDeadlineDays} days from decision`);
      }
      if (jurisdictionData.humanRights?.complaintDeadlineMonths) {
        deadlines.push(`⚠️ Human Rights Complaint: ${jurisdictionData.humanRights.complaintDeadlineMonths} months from incident`);
      }
    }

    // Add general deadlines
    if (answers.q4 === 'yes') {
      deadlines.push('⚠️ LTD Appeal: Check policy (usually 30-90 days)');
      deadlines.push('⚠️ CPP-D Reconsideration: 90 days from decision');
    }
    if (answers.q6 === 'yes') {
      deadlines.push('⚠️ Employment Standards Claim: 2 years');
      deadlines.push('⚠️ Wrongful Dismissal Lawsuit: 2 years');
    }

    // Build resources list
    resources.push({ title: 'Denial Decoder', description: 'Analyze denial letters to understand and counter arguments' });
    resources.push({ title: 'Letter Wizard', description: '22+ templates for appeals, requests, and complaints' });
    resources.push({ title: 'Appeal Command Center', description: 'Step-by-step appeal process guidance' });
    resources.push({ title: 'Claims Navigator', description: 'Understand which benefits you may be eligible for' });

    // Calculate urgency level
    const urgentCount = rights.filter(r => r.urgency === 'urgent').length;
    const overallUrgency = urgentCount >= 3 ? 'critical' : urgentCount >= 1 ? 'high' : 'normal';

    return {
      rights,
      actions: [...new Map(actions.map(a => [a.text, a])).values()], // Remove duplicates
      deadlines,
      resources,
      overallUrgency,
      answersSnapshot: { ...answers },
    };
  }, [ready, answers, jurisdictionData]);

  React.useEffect(() => { 
    if (summary) announce(t('rightsChecker.summaryReady', 'Rights summary ready')); 
  }, [summary, t]);

  const reset = () => {
    setAnswers({});
    announce(t('rightsChecker.resetAnnounce', 'Answers cleared'));
  };

  const saveAssessment = async () => {
    if (!summary) return;
    try {
      const newAssessment: SavedAssessment = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        answers: { ...answers },
        summary,
      };
      const updated = [newAssessment, ...savedAssessments].slice(0, 10);
      setSavedAssessments(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      Alert.alert('Saved', 'Assessment saved to history.');
    } catch {
      Alert.alert('Error', 'Could not save assessment.');
    }
  };

  const loadAssessment = (assessment: SavedAssessment) => {
    setAnswers(assessment.answers);
    setActiveTab('checker');
    announce('Previous assessment loaded');
  };

  const deleteAssessment = async (id: string) => {
    const updated = savedAssessments.filter(a => a.id !== id);
    setSavedAssessments(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const copySummary = async () => {
    if (!summary) return;
    try {
      const mod = await import('expo-clipboard');
      const text = `YOUR RIGHTS SUMMARY\n\nRIGHTS IDENTIFIED (${summary.rights.length}):\n${summary.rights.map(r => `• ${r.title}`).join('\n')}\n\nRECOMMENDED ACTIONS:\n${summary.actions.map(a => a.text).join('\n')}\n\nKEY DEADLINES:\n${summary.deadlines.join('\n')}`;
      await mod.setStringAsync(text);
      Alert.alert('Copied', 'Summary copied to clipboard.');
    } catch {
      Alert.alert('Clipboard not available', 'Install expo-clipboard to enable copy.');
    }
  };

  const exportSummary = async () => {
    if (!summary) return;
    try {
      const FS = await import('expo-file-system');
      const Share = await import('expo-sharing');
      const text = `YOUR RIGHTS SUMMARY\nGenerated: ${new Date().toLocaleDateString()}\n\n` +
        `URGENCY LEVEL: ${summary.overallUrgency.toUpperCase()}\n\n` +
        `RIGHTS IDENTIFIED (${summary.rights.length}):\n${summary.rights.map(r => `✅ ${r.title}\n   ${r.description}`).join('\n\n')}\n\n` +
        `RECOMMENDED ACTIONS:\n${summary.actions.map(a => a.text).join('\n')}\n\n` +
        `KEY DEADLINES:\n${summary.deadlines.join('\n')}\n\n` +
        `HELPFUL RESOURCES:\n${summary.resources.map(r => `• ${r.title}: ${r.description}`).join('\n')}`;
      const path = FS.cacheDirectory + `rights_summary_${Date.now()}.txt`;
      await FS.writeAsStringAsync(path, text);
      if (await Share.isAvailableAsync()) await Share.shareAsync(path);
      else Alert.alert('Share unavailable', 'System share sheet not available.');
    } catch {
      Alert.alert('Share failed', 'Could not share summary file.');
    }
  };

  // Filter rights library
  const filteredRights = React.useMemo(() => {
    let rights: Array<{ category: string; icon: any; right: typeof RIGHTS_DATABASE.employment.rights[0] }> = [];
    
    Object.entries(RIGHTS_DATABASE).forEach(([key, data]) => {
      if (selectedCategory === 'all' || selectedCategory === key) {
        data.rights.forEach(right => {
          if (!searchQuery || 
              right.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              right.description.toLowerCase().includes(searchQuery.toLowerCase())) {
            rights.push({ category: data.title, icon: data.icon, right });
          }
        });
      }
    });
    
    return rights;
  }, [selectedCategory, searchQuery]);

  const Choice = ({ label, value, questionId }: { label: string; value: Answer; questionId: string }) => {
    const selected = answers[questionId];
    const isSelected = selected === value;
    
    return (
      <A11yPressable
        hitSlop={HIT_SLOP_8}
        onPress={() => setAnswer(questionId, value)}
        accessibilityRole="button"
        accessibilityLabel={`${label} answer option`}
        accessibilityState={{ selected: isSelected }}
        style={[s.choice, isSelected && s.choiceActive]}
      >
        <MaterialCommunityIcons
          name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={20}
          color={isSelected ? palette.onPrimary : palette.text}
        />
        <Text style={[s.choiceText, isSelected && s.choiceTextActive]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{label}</Text>
      </A11yPressable>
    );
  };

  const TabButton = ({ tab, label, icon }: { tab: typeof activeTab; label: string; icon: string }) => (
    <A11yPressable
      onPress={() => setActiveTab(tab)}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeTab === tab }}
      style={[s.tabButton, activeTab === tab && s.tabButtonActive]}
    >
      <MaterialCommunityIcons name={icon as any} size={18} color={activeTab === tab ? palette.onPrimary : palette.text} />
      <Text style={[s.tabButtonText, activeTab === tab && { color: palette.onPrimary }]}>{label}</Text>
    </A11yPressable>
  );

  const CategoryButton = ({ category, label, icon }: { category: RightsCategory; label: string; icon: string }) => (
    <A11yPressable
      onPress={() => setSelectedCategory(category)}
      accessibilityRole="button"
      accessibilityState={{ selected: selectedCategory === category }}
      style={[s.categoryButton, selectedCategory === category && s.categoryButtonActive]}
    >
      <MaterialCommunityIcons name={icon as any} size={16} color={selectedCategory === category ? palette.onPrimary : palette.text} />
      <Text style={[s.categoryButtonText, selectedCategory === category && { color: palette.onPrimary }]}>{label}</Text>
    </A11yPressable>
  );

  return (
    <ResponsiveScreenWrapper
      scrollable
      backgroundColor={palette.background}
      accessibilityLabel="Automated Rights Checker screen"
    >
      <View style={{ padding: 16 }}>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={s.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t('rightsChecker.title', 'Automated Rights Checker')}
        </Text>
        <DisclaimerBanner type="legal" compact={true} />
        <DyslexiaText style={s.subtitle}>
          Answer questions to receive personalized rights analysis with actionable next steps. Browse the Rights Library to learn about your protections.
        </DyslexiaText>

        {/* Tab Navigation */}
        <View style={s.tabRow}>
          <TabButton tab="checker" label="Check Rights" icon="checkbox-marked-circle-outline" />
          <TabButton tab="library" label="Rights Library" icon="book-open-variant" />
          <TabButton tab="history" label="History" icon="history" />
        </View>

        {/* CHECKER TAB */}
        {activeTab === 'checker' && (
          <>
            {/* How to Use Card */}
            <View style={s.infoCard}>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => setShowInfo(s => !s)} accessibilityRole="button" style={s.infoHeader}>
                <Text style={s.infoTitle}>How to Use</Text>
                <Text style={s.infoToggle}>{showInfo ? 'Hide' : 'Show'}</Text>
              </A11yPressable>
              {showInfo && (
                <View>
                  <DyslexiaText style={s.infoText}>Answer each question honestly. Choose "Unsure" if you don't know.</DyslexiaText>
                  <DyslexiaText style={s.infoText}>A comprehensive summary appears when all questions are answered.</DyslexiaText>
                  <DyslexiaText style={s.infoText}>Save assessments to History to track changes over time.</DyslexiaText>
                </View>
              )}
            </View>

            {/* Progress Indicator */}
            <View style={s.progressCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: palette.text, fontWeight: '700' }}>Progress</Text>
                <Text style={{ color: palette.text, fontWeight: '700' }}>{answeredCount}/{QUESTIONS.length}</Text>
              </View>
              <View style={{ height: 8, backgroundColor: palette.background, borderRadius: 4 }}>
                <View style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%`, height: '100%', backgroundColor: palette.primary, borderRadius: 4 }} />
              </View>
            </View>

            {/* Questions */}
            {QUESTIONS.map((q, idx) => (
              <View key={q.id} style={s.questionCard}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={[s.questionNumber, { backgroundColor: answers[q.id] ? palette.success : palette.muted }]}>
                    <Text style={{ color: palette.onPrimary, fontWeight: '700', fontSize: 12 }}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <DyslexiaText style={s.questionText}>{q.text}</DyslexiaText>
                    {q.urgencyLevel === 'urgent' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <MaterialCommunityIcons name="alert" size={14} color={palette.error} />
                        <Text style={{ color: palette.error, fontSize: 12, marginLeft: 4 }}>May require urgent action</Text>
                      </View>
                    )}
                  </View>
                </View>
                <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
                  <Choice label="Yes" value="yes" questionId={q.id} />
                  <Choice label="No" value="no" questionId={q.id} />
                  <Choice label="Unsure" value="unsure" questionId={q.id} />
                </GapView>
              </View>
            ))}

            {/* Action Buttons */}
            <GapView style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 }} gap={8}>
              <A11yPressable onPress={reset} style={[s.actionButton, { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted }]}>
                <MaterialCommunityIcons name="refresh" size={18} color={palette.text} />
                <Text style={[s.actionButtonText, { color: palette.text }]}>Reset All</Text>
              </A11yPressable>
              {summary && (
                <>
                  <A11yPressable onPress={saveAssessment} style={s.actionButton}>
                    <MaterialCommunityIcons name="content-save" size={18} color={palette.onPrimary} />
                    <Text style={s.actionButtonText}>Save</Text>
                  </A11yPressable>
                  <A11yPressable onPress={copySummary} style={s.actionButton}>
                    <MaterialCommunityIcons name="content-copy" size={18} color={palette.onPrimary} />
                    <Text style={s.actionButtonText}>Copy</Text>
                  </A11yPressable>
                  <A11yPressable onPress={exportSummary} style={s.actionButton}>
                    <MaterialCommunityIcons name="share-variant" size={18} color={palette.onPrimary} />
                    <Text style={s.actionButtonText}>Export</Text>
                  </A11yPressable>
                </>
              )}
            </GapView>

            {/* Summary Results */}
            {summary && (
              <>
                {/* Urgency Banner */}
                {summary.overallUrgency !== 'normal' && (
                  <View style={[s.urgencyBanner, { backgroundColor: summary.overallUrgency === 'critical' ? palette.error : palette.warning }]}>
                    <MaterialCommunityIcons name="alert-circle" size={24} color={palette.onPrimary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: palette.onPrimary, fontWeight: '700', fontSize: 16 }}>
                        {summary.overallUrgency === 'critical' ? 'Critical Situation Detected' : 'Action Required'}
                      </Text>
                      <Text style={{ color: palette.onPrimary, opacity: 0.9 }}>
                        Review recommended actions and deadlines below.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Rights Summary */}
                <View style={[s.summaryCard, { borderLeftColor: palette.success }]}>
                  <Text style={s.summaryTitle}>
                    <MaterialCommunityIcons name="shield-check" size={20} color={palette.success} /> Your Rights ({summary.rights.length})
                  </Text>
                  {summary.rights.map((right, idx) => (
                    <A11yPressable 
                      key={idx} 
                      onPress={() => setShowRightsDetail(right.id)}
                      style={s.rightItem}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={s.rightTitle}>✅ {right.title}</Text>
                        <Text style={s.rightDescription} numberOfLines={2}>{right.description}</Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={palette.muted} />
                    </A11yPressable>
                  ))}
                </View>

                {/* Actions */}
                {summary.actions.length > 0 && (
                  <View style={[s.summaryCard, { borderLeftColor: palette.info }]}>
                    <Text style={s.summaryTitle}>
                      <MaterialCommunityIcons name="clipboard-check" size={20} color={palette.info} /> Recommended Actions ({summary.actions.length})
                    </Text>
                    {summary.actions.map((action, idx) => (
                      <View key={idx} style={s.actionItem}>
                        <View style={[s.priorityDot, { backgroundColor: action.priority === 'urgent' ? palette.error : action.priority === 'action' ? palette.warning : palette.info }]} />
                        <DyslexiaText style={s.actionText}>{action.text}</DyslexiaText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Deadlines */}
                {summary.deadlines.length > 0 && (
                  <View style={[s.summaryCard, { borderLeftColor: palette.error }]}>
                    <Text style={s.summaryTitle}>
                      <MaterialCommunityIcons name="clock-alert" size={20} color={palette.error} /> Key Deadlines
                    </Text>
                    {summary.deadlines.map((deadline, idx) => (
                      <Text key={idx} style={s.deadlineText}>{deadline}</Text>
                    ))}
                  </View>
                )}

                {/* Resources */}
                <View style={[s.summaryCard, { borderLeftColor: palette.primary }]}>
                  <Text style={s.summaryTitle}>
                    <MaterialCommunityIcons name="toolbox" size={20} color={palette.primary} /> Helpful Tools
                  </Text>
                  {summary.resources.map((resource, idx) => (
                    <View key={idx} style={s.resourceItem}>
                      <Text style={s.resourceTitle}>{resource.title}</Text>
                      <Text style={s.resourceDescription}>{resource.description}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <>
            <TextInput
              style={s.searchInput}
              placeholder="Search rights..."
              placeholderTextColor={palette.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search rights library"
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
              <GapView style={{ flexDirection: 'row' }} gap={8}>
                <CategoryButton category="all" label="All" icon="view-grid" />
                <CategoryButton category="employment" label="Employment" icon="briefcase-outline" />
                <CategoryButton category="benefits" label="Benefits" icon="cash-multiple" />
                <CategoryButton category="disability" label="Disability" icon="wheelchair-accessibility" />
                <CategoryButton category="safety" label="Safety" icon="shield-check-outline" />
                <CategoryButton category="harassment" label="Harassment" icon="account-alert-outline" />
              </GapView>
            </ScrollView>

            <Text style={{ color: palette.text, marginBottom: 12 }}>
              Showing {filteredRights.length} rights
            </Text>

            {filteredRights.map((item, idx) => (
              <A11yPressable 
                key={idx}
                onPress={() => setShowRightsDetail(item.right.id)}
                style={s.libraryCard}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MaterialCommunityIcons name={item.icon} size={20} color={palette.primary} />
                  <Text style={s.libraryCategory}>{item.category}</Text>
                </View>
                <Text style={s.libraryTitle}>{item.right.title}</Text>
                <Text style={s.libraryDescription} numberOfLines={3}>{item.right.description}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ color: palette.primary, fontWeight: '600', fontSize: 13 }}>Learn More</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={palette.primary} />
                </View>
              </A11yPressable>
            ))}
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <>
            {savedAssessments.length === 0 ? (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="history" size={48} color={palette.muted} />
                <Text style={s.emptyStateTitle}>No Saved Assessments</Text>
                <Text style={s.emptyStateText}>Complete the rights checker and save your results to track changes over time.</Text>
              </View>
            ) : (
              savedAssessments.map((assessment, _idx) => (
                <View key={assessment.id} style={s.historyCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={s.historyDate}>{new Date(assessment.date).toLocaleDateString()}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <A11yPressable onPress={() => loadAssessment(assessment)} style={s.historyAction}>
                        <MaterialCommunityIcons name="restore" size={16} color={palette.primary} />
                        <Text style={{ color: palette.primary, fontWeight: '600', fontSize: 12, marginLeft: 4 }}>Load</Text>
                      </A11yPressable>
                      <A11yPressable onPress={() => deleteAssessment(assessment.id)} style={s.historyAction}>
                        <MaterialCommunityIcons name="delete-outline" size={16} color={palette.error} />
                      </A11yPressable>
                    </View>
                  </View>
                  <Text style={s.historyRights}>{assessment.summary.rights.length} rights identified</Text>
                  <Text style={s.historyActions}>{assessment.summary.actions.length} actions recommended</Text>
                  {assessment.summary.overallUrgency !== 'normal' && (
                    <View style={[s.historyUrgency, { backgroundColor: assessment.summary.overallUrgency === 'critical' ? palette.error + '20' : palette.warning + '20' }]}>
                      <Text style={{ color: assessment.summary.overallUrgency === 'critical' ? palette.error : palette.warning, fontWeight: '600', fontSize: 12 }}>
                        {assessment.summary.overallUrgency === 'critical' ? 'Critical' : 'Action Required'}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </>
        )}

        {/* Rights Detail Modal */}
        <Modal visible={!!showRightsDetail} animationType="slide" transparent>
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: palette.background }]}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Right Details</Text>
                <A11yPressable onPress={() => setShowRightsDetail(null)}>
                  <MaterialCommunityIcons name="close" size={24} color={palette.text} />
                </A11yPressable>
              </View>
              {showRightsDetail && (() => {
                let foundRight: any = null;
                Object.values(RIGHTS_DATABASE).forEach(category => {
                  const right = category.rights.find(r => r.id === showRightsDetail);
                  if (right) foundRight = { ...right, categoryTitle: category.title };
                });
                if (!foundRight) return null;
                return (
                  <ScrollView style={{ padding: 16 }}>
                    <View style={{ backgroundColor: palette.primary + '15', padding: 8, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 }}>
                      <Text style={{ color: palette.primary, fontWeight: '600' }}>{foundRight.categoryTitle}</Text>
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: palette.text, marginBottom: 12 }}>{foundRight.title}</Text>
                    <DyslexiaText style={{ color: palette.text, lineHeight: 24, fontSize: 16 }}>{foundRight.description}</DyslexiaText>
                    
                    <View style={{ marginTop: 24, padding: 16, backgroundColor: palette.info + '15', borderRadius: 12 }}>
                      <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 8 }}>💡 What This Means</Text>
                      <DyslexiaText style={{ color: palette.text, lineHeight: 22 }}>
                        This right is protected by law. If you believe this right has been violated, you may have grounds for a complaint or legal action. Document everything and consult with an advocate or lawyer.
                      </DyslexiaText>
                    </View>
                    
                    <A11yPressable 
                      onPress={() => { setShowRightsDetail(null); setActiveTab('checker'); }}
                      style={[s.actionButton, { marginTop: 16 }]}
                    >
                      <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={18} color={palette.onPrimary} />
                      <Text style={s.actionButtonText}>Check If This Applies To You</Text>
                    </A11yPressable>
                  </ScrollView>
                );
              })()}
            </View>
          </View>
        </Modal>
      </View>
    </ResponsiveScreenWrapper>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", color: palette.text, marginBottom: 8 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 16, lineHeight: 22 },
    
    // Tabs
    tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    tabButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    tabButtonText: { fontSize: 13, fontWeight: '600', color: palette.text },
    
    // Info Card
    infoCard: { 
      borderWidth: 1, 
      borderColor: palette.muted, 
      backgroundColor: palette.surface, 
      padding: 12, 
      borderRadius: 10, 
      marginBottom: 16 
    },
    infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    infoTitle: { color: palette.primary, fontWeight: '700', fontSize: 16 },
    infoToggle: { color: palette.text, fontSize: 12 },
    infoText: { color: palette.text, marginTop: 4, lineHeight: 20 },
    
    // Progress
    progressCard: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },
    
    // Questions
    questionCard: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    questionNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    questionText: { color: palette.text, fontWeight: '600', fontSize: 15, lineHeight: 22 },
    
    // Choices
    choice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: palette.surface,
    },
    choiceActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    choiceText: { color: palette.text, fontSize: 14 },
    choiceTextActive: { color: palette.onPrimary, fontWeight: "700" },
    
    // Actions
    actionButton: {
      backgroundColor: palette.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
    },
    actionButtonText: { color: palette.onPrimary, fontWeight: '700', fontSize: 14 },
    
    // Urgency Banner
    urgencyBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
    },
    
    // Summary Cards
    summaryCard: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      borderLeftWidth: 4,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
    },
    summaryTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 12 },
    
    // Rights
    rightItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: palette.muted,
    },
    rightTitle: { color: palette.text, fontWeight: '600', fontSize: 15 },
    rightDescription: { color: palette.text, opacity: 0.8, fontSize: 13, marginTop: 2 },
    
    // Actions
    actionItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 8,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 6,
      marginRight: 10,
    },
    actionText: { flex: 1, color: palette.text, lineHeight: 20 },
    
    // Deadlines
    deadlineText: { color: palette.text, marginBottom: 8, lineHeight: 20 },
    
    // Resources
    resourceItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: palette.muted },
    resourceTitle: { color: palette.primary, fontWeight: '700', fontSize: 15 },
    resourceDescription: { color: palette.text, opacity: 0.8, fontSize: 13, marginTop: 2 },
    
    // Category Buttons
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    categoryButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    categoryButtonText: { fontSize: 13, fontWeight: '600', color: palette.text },
    
    // Search
    searchInput: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 10,
      padding: 12,
      color: palette.text,
      fontSize: 15,
    },
    
    // Library Cards
    libraryCard: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    libraryCategory: { color: palette.primary, fontWeight: '600', fontSize: 12, marginLeft: 8 },
    libraryTitle: { color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 6 },
    libraryDescription: { color: palette.text, opacity: 0.8, lineHeight: 20 },
    
    // History
    historyCard: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    historyDate: { color: palette.text, fontWeight: '700', fontSize: 15 },
    historyAction: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: palette.surface,
    },
    historyRights: { color: palette.success, fontWeight: '600', marginTop: 8 },
    historyActions: { color: palette.info, fontWeight: '600', marginTop: 4 },
    historyUrgency: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 8,
    },
    
    // Empty State
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyStateTitle: { color: palette.text, fontWeight: '700', fontSize: 18, marginTop: 16 },
    emptyStateText: { color: palette.text, opacity: 0.7, textAlign: 'center', marginTop: 8 },
    
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: palette.muted,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: palette.text },
  });
}
