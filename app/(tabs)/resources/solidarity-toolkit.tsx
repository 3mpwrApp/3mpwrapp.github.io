import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

export const options = { href: null };

type TabType = 'guides' | 'organize' | 'actions' | 'network';

// Comprehensive organizing guides
const SOLIDARITY_GUIDES = [
  {
    id: 'union-basics',
    title: 'Know Your Union Rights',
    icon: 'badge-account-horizontal' as const,
    category: 'fundamentals',
    items: [
      { title: 'Weingarten Rights', text: 'You have the right to union representation during any investigatory interview that could lead to discipline.' },
      { title: 'Grievance Process', text: 'Your union can file grievances for contract violations. Usually 5-30 day deadline from incident.' },
      { title: 'Collective Agreement', text: 'Review your CA for disability accommodations, modified work, and seniority protections.' },
      { title: 'Steward Access', text: 'You can request to speak with your steward during work hours for workplace issues.' },
      { title: 'Information Requests', text: 'Union can request information from employer relevant to grievances or bargaining.' },
    ],
  },
  {
    id: 'document',
    title: 'Documentation Strategies',
    icon: 'file-document-outline' as const,
    category: 'tactics',
    items: [
      { title: 'Contemporaneous Notes', text: 'Write notes immediately after incidents. Include date, time, location, witnesses, exact words used.' },
      { title: 'Email Trail', text: 'Follow up verbal conversations with "as discussed" emails to create paper trail.' },
      { title: 'Evidence Photos', text: 'Photograph unsafe conditions, inaccessible areas, accommodation failures. Note date/time.' },
      { title: 'Witness Statements', text: 'Ask witnesses to write what they saw/heard. Get signatures and dates.' },
      { title: 'Timeline Tracking', text: 'Use Case Timeline tool to track all events chronologically for grievances/complaints.' },
    ],
  },
  {
    id: 'accommodations',
    title: 'Accommodation Campaigns',
    icon: 'wheelchair-accessibility' as const,
    category: 'campaigns',
    items: [
      { title: 'Formal Request', text: 'Always request in writing. Use Letter Wizard accommodation template.' },
      { title: 'Interactive Process', text: 'Employer must engage in good-faith dialogue. Document their responses.' },
      { title: 'Propose Solutions', text: 'Suggest specific accommodations (modified duties, flexible hours, equipment, remote work).' },
      { title: 'Undue Hardship Defense', text: 'Employer must prove accommodation would cause significant difficulty or expense.' },
      { title: 'Human Rights Complaint', text: 'If denied, you can file complaint with Human Rights Tribunal (usually 1 year deadline).' },
    ],
  },
  {
    id: 'organizing',
    title: 'Building Workplace Power',
    icon: 'account-group' as const,
    category: 'organizing',
    items: [
      { title: 'Mapping Your Workplace', text: 'Identify who are natural leaders, who is trusted, who faces similar issues.' },
      { title: 'One-on-One Conversations', text: 'Have private conversations about shared concerns. Listen more than talk.' },
      { title: 'Finding Common Ground', text: 'Frame disability issues as workplace issues affecting everyone (safety, workload, fairness).' },
      { title: 'Building Committee', text: 'Form informal group of allies who will take action together.' },
      { title: 'Escalating Pressure', text: 'Start with individual asks, move to group asks, then formal complaints.' },
    ],
  },
  {
    id: 'retaliation',
    title: 'Retaliation Response',
    icon: 'shield-alert' as const,
    category: 'protection',
    items: [
      { title: 'Recognize Retaliation', text: 'Sudden poor reviews, shift changes, isolation, discipline after protected activity.' },
      { title: 'Document Pattern', text: 'Show timeline: before activity = good treatment, after activity = bad treatment.' },
      { title: 'Immediate Response', text: 'Report to union, HR, and document in writing. "I believe this is retaliation for..."' },
      { title: 'Formal Complaints', text: 'File with labor board, human rights commission, or OSHA (if safety-related).' },
      { title: 'Stay Strong', text: 'Retaliation often means you\'re being effective. Don\'t let fear silence you.' },
    ],
  },
  {
    id: 'collective-action',
    title: 'Collective Action Tactics',
    icon: 'fist-raised' as const,
    category: 'actions',
    items: [
      { title: 'Petitions', text: 'Gather signatures demanding changes. Numbers show widespread support.' },
      { title: 'Group Grievances', text: 'Multiple workers file grievances on same issue simultaneously.' },
      { title: 'Work to Rule', text: 'Follow every rule exactly - slows things down, highlights unreasonable expectations.' },
      { title: 'Information Pickets', text: 'Distribute leaflets to public about workplace issues (check legality first).' },
      { title: 'Solidarity Actions', text: 'Wear buttons, t-shirts, or take coordinated breaks together.' },
    ],
  },
  {
    id: 'disability-justice',
    title: 'Disability Justice Framework',
    icon: 'heart-multiple' as const,
    category: 'values',
    items: [
      { title: 'Intersectionality', text: 'Disability intersects with race, gender, class. Center most marginalized voices.' },
      { title: 'Collective Access', text: 'When one person gets access, it often helps others too.' },
      { title: 'Nothing About Us Without Us', text: 'Disabled people must lead disability advocacy.' },
      { title: 'Mutual Aid', text: 'Support each other directly, not just through formal channels.' },
      { title: 'System Change', text: 'Individual accommodations help, but fight for systemic accessibility.' },
    ],
  },
];

// Collective action planning templates
interface ActionPlan {
  id: string;
  title: string;
  issue: string;
  goal: string;
  allies: string[];
  steps: { task: string; deadline: string; status: 'pending' | 'in-progress' | 'done' }[];
  created: string;
  updated: string;
}

// Support network contacts
interface NetworkContact {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  notes?: string;
}

const STORAGE_KEYS = {
  actionPlans: 'solidarity_action_plans_v1',
  network: 'solidarity_network_v1',
  progress: 'solidarity_progress_v1',
};

// Pre-built action plan templates
const ACTION_TEMPLATES = [
  {
    title: 'Accommodation Campaign',
    issue: 'Employer not providing reasonable accommodations',
    goal: 'Secure accommodations for all workers who need them',
    steps: [
      { task: 'Document current accommodation denials', deadline: 'Week 1', status: 'pending' as const },
      { task: 'Identify other workers facing similar issues', deadline: 'Week 1', status: 'pending' as const },
      { task: 'Meet with union steward', deadline: 'Week 2', status: 'pending' as const },
      { task: 'Draft group letter to management', deadline: 'Week 2', status: 'pending' as const },
      { task: 'Collect signatures from supporters', deadline: 'Week 3', status: 'pending' as const },
      { task: 'Present letter to management', deadline: 'Week 3', status: 'pending' as const },
      { task: 'Follow up if no response within 2 weeks', deadline: 'Week 5', status: 'pending' as const },
      { task: 'Escalate to human rights complaint if needed', deadline: 'Week 6', status: 'pending' as const },
    ],
  },
  {
    title: 'Safety Campaign',
    issue: 'Unsafe working conditions causing injuries',
    goal: 'Employer implements safety improvements',
    steps: [
      { task: 'Document all safety hazards with photos', deadline: 'Week 1', status: 'pending' as const },
      { task: 'Review incident reports and near-misses', deadline: 'Week 1', status: 'pending' as const },
      { task: 'Form safety committee or join existing one', deadline: 'Week 2', status: 'pending' as const },
      { task: 'Present concerns at safety meeting', deadline: 'Week 2', status: 'pending' as const },
      { task: 'Request workplace inspection', deadline: 'Week 3', status: 'pending' as const },
      { task: 'File Ministry of Labour complaint if needed', deadline: 'Week 4', status: 'pending' as const },
    ],
  },
  {
    title: 'Harassment Response',
    issue: 'Workplace harassment not being addressed',
    goal: 'Harassment stops and policies enforced',
    steps: [
      { task: 'Document all incidents in detail', deadline: 'Ongoing', status: 'pending' as const },
      { task: 'Report to HR/management in writing', deadline: 'Week 1', status: 'pending' as const },
      { task: 'Request investigation update timeline', deadline: 'Week 2', status: 'pending' as const },
      { task: 'Contact union about filing grievance', deadline: 'Week 2', status: 'pending' as const },
      { task: 'File human rights complaint if employer fails', deadline: 'Week 4', status: 'pending' as const },
    ],
  },
  {
    title: 'Return to Work Support',
    issue: 'Workers returning from disability leave need support',
    goal: 'Create supportive RTW process for all workers',
    steps: [
      { task: 'Connect with workers on leave', deadline: 'Week 1', status: 'pending' as const },
      { task: 'Document common RTW barriers', deadline: 'Week 2', status: 'pending' as const },
      { task: 'Review collective agreement RTW provisions', deadline: 'Week 2', status: 'pending' as const },
      { task: 'Propose RTW policy improvements to union', deadline: 'Week 3', status: 'pending' as const },
      { task: 'Negotiate RTW improvements in bargaining', deadline: 'As needed', status: 'pending' as const },
    ],
  },
];

export default function SolidarityToolkit() {
  const palette = useAppPalette();
  const s = styles(palette);
  const router = useRouter();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Union & Worker Solidarity Toolkit');
  useFocusOnRefOnMount(titleRef);

  // State
  const [activeTab, setActiveTab] = React.useState<TabType>('guides');
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [actionPlans, setActionPlans] = React.useState<ActionPlan[]>([]);
  const [network, setNetwork] = React.useState<NetworkContact[]>([]);
  const [showNewPlan, setShowNewPlan] = React.useState(false);
  const [showNewContact, setShowNewContact] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<typeof ACTION_TEMPLATES[0] | null>(null);
  
  // New plan/contact form state
  const [newPlanTitle, setNewPlanTitle] = React.useState('');
  const [newPlanIssue, setNewPlanIssue] = React.useState('');
  const [newPlanGoal, setNewPlanGoal] = React.useState('');
  const [newContactName, setNewContactName] = React.useState('');
  const [newContactRole, setNewContactRole] = React.useState('');
  const [newContactPhone, setNewContactPhone] = React.useState('');
  const [newContactEmail, setNewContactEmail] = React.useState('');

  // Load saved data
  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.actionPlans).then(data => {
      if (data) setActionPlans(JSON.parse(data));
    }).catch(() => {});
    AsyncStorage.getItem(STORAGE_KEYS.network).then(data => {
      if (data) setNetwork(JSON.parse(data));
    }).catch(() => {});
  }, []);

  const toggleSection = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createPlanFromTemplate = (template: typeof ACTION_TEMPLATES[0]) => {
    const plan: ActionPlan = {
      id: Date.now().toString(),
      title: template.title,
      issue: template.issue,
      goal: template.goal,
      allies: [],
      steps: template.steps.map(s => ({ ...s })),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    const updated = [plan, ...actionPlans];
    setActionPlans(updated);
    AsyncStorage.setItem(STORAGE_KEYS.actionPlans, JSON.stringify(updated));
    setSelectedTemplate(null);
    setActiveTab('organize');
    announce('Action plan created');
  };

  const createCustomPlan = () => {
    if (!newPlanTitle.trim() || !newPlanIssue.trim()) {
      Alert.alert('Required', 'Please enter a title and issue.');
      return;
    }
    const plan: ActionPlan = {
      id: Date.now().toString(),
      title: newPlanTitle.trim(),
      issue: newPlanIssue.trim(),
      goal: newPlanGoal.trim(),
      allies: [],
      steps: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    const updated = [plan, ...actionPlans];
    setActionPlans(updated);
    AsyncStorage.setItem(STORAGE_KEYS.actionPlans, JSON.stringify(updated));
    setNewPlanTitle('');
    setNewPlanIssue('');
    setNewPlanGoal('');
    setShowNewPlan(false);
    announce('Custom action plan created');
  };

  const toggleStepStatus = (planId: string, stepIndex: number) => {
    const updated = actionPlans.map(plan => {
      if (plan.id === planId) {
        const newSteps = [...plan.steps];
        const statuses: ActionPlan['steps'][0]['status'][] = ['pending', 'in-progress', 'done'];
        const currentIdx = statuses.indexOf(newSteps[stepIndex].status);
        newSteps[stepIndex].status = statuses[(currentIdx + 1) % 3];
        return { ...plan, steps: newSteps, updated: new Date().toISOString() };
      }
      return plan;
    });
    setActionPlans(updated);
    AsyncStorage.setItem(STORAGE_KEYS.actionPlans, JSON.stringify(updated));
  };

  const deletePlan = (id: string) => {
    Alert.alert('Delete Plan', 'Are you sure you want to delete this action plan?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        const updated = actionPlans.filter(p => p.id !== id);
        setActionPlans(updated);
        AsyncStorage.setItem(STORAGE_KEYS.actionPlans, JSON.stringify(updated));
      }},
    ]);
  };

  const addContact = () => {
    if (!newContactName.trim() || !newContactRole.trim()) {
      Alert.alert('Required', 'Please enter name and role.');
      return;
    }
    const contact: NetworkContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      role: newContactRole.trim(),
      phone: newContactPhone.trim() || undefined,
      email: newContactEmail.trim() || undefined,
    };
    const updated = [contact, ...network];
    setNetwork(updated);
    AsyncStorage.setItem(STORAGE_KEYS.network, JSON.stringify(updated));
    setNewContactName('');
    setNewContactRole('');
    setNewContactPhone('');
    setNewContactEmail('');
    setShowNewContact(false);
    announce('Contact added');
  };

  const deleteContact = (id: string) => {
    const updated = network.filter(c => c.id !== id);
    setNetwork(updated);
    AsyncStorage.setItem(STORAGE_KEYS.network, JSON.stringify(updated));
  };

  const exportPlan = async (plan: ActionPlan) => {
    try {
      const FS = await import('expo-file-system');
      const Share = await import('expo-sharing');
      const completedSteps = plan.steps.filter(s => s.status === 'done').length;
      const text = `ACTION PLAN: ${plan.title}\nCreated: ${new Date(plan.created).toLocaleDateString()}\n\nISSUE: ${plan.issue}\n\nGOAL: ${plan.goal}\n\nPROGRESS: ${completedSteps}/${plan.steps.length} steps complete\n\nSTEPS:\n${plan.steps.map((s, i) => `${i+1}. [${s.status.toUpperCase()}] ${s.task} (${s.deadline})`).join('\n')}`;
      const path = FS.cacheDirectory + `action_plan_${Date.now()}.txt`;
      await FS.writeAsStringAsync(path, text);
      if (await Share.isAvailableAsync()) await Share.shareAsync(path);
    } catch {
      Alert.alert('Error', 'Could not export plan.');
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: TabType; label: string; icon: string }) => (
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

  return (
    <ResponsiveScreenWrapper scrollable backgroundColor={palette.background}>
      <View style={{ padding: 16 }}>
        <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Union & Worker Solidarity Toolkit
        </Text>
        <DisclaimerBanner type="general" compact={true} />
        <DyslexiaText style={s.subtitle}>
          Comprehensive resources for organizing workplace support, building collective power, and fighting for disability justice.
        </DyslexiaText>

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
          <GapView style={{ flexDirection: 'row' }} gap={8}>
            <TabButton tab="guides" label="Guides" icon="book-open-variant" />
            <TabButton tab="organize" label="Action Plans" icon="clipboard-check" />
            <TabButton tab="actions" label="Templates" icon="file-document-multiple" />
            <TabButton tab="network" label="Network" icon="account-group" />
          </GapView>
        </ScrollView>

        {/* GUIDES TAB */}
        {activeTab === 'guides' && (
          <>
            {SOLIDARITY_GUIDES.map(section => (
              <View key={section.id} style={s.sectionCard}>
                <A11yPressable
                  onPress={() => toggleSection(section.id)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: expanded.has(section.id) }}
                  hitSlop={HIT_SLOP_8}
                  style={s.sectionHeader}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <MaterialCommunityIcons name={section.icon} size={22} color={palette.primary} />
                    <Text style={s.sectionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {section.title}
                    </Text>
                  </View>
                  <MaterialCommunityIcons 
                    name={expanded.has(section.id) ? 'chevron-down' : 'chevron-right'} 
                    size={22} 
                    color={palette.primary} 
                  />
                </A11yPressable>
                
                {expanded.has(section.id) && (
                  <View style={s.sectionContent}>
                    {section.items.map((item, idx) => (
                      <View key={idx} style={s.guideItem}>
                        <Text style={s.guideItemTitle}>• {item.title}</Text>
                        <DyslexiaText style={s.guideItemText}>{item.text}</DyslexiaText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {/* Quick Links */}
            <View style={{ marginTop: 16 }}>
              <Text style={s.h2} accessibilityRole="header">Quick Tools</Text>
              <GapView gap={8}>
                <A11yPressable onPress={() => router.push("/(tabs)/resources/templates-gallery" as any)} hitSlop={HIT_SLOP_8} style={s.linkButton}>
                  <MaterialCommunityIcons name="file-document-outline" size={20} color={palette.primary} />
                  <Text style={s.linkText}>Letter Templates</Text>
                </A11yPressable>
                <A11yPressable onPress={() => router.push("/(tabs)/resources/rights-checker" as any)} hitSlop={HIT_SLOP_8} style={s.linkButton}>
                  <MaterialCommunityIcons name="shield-check" size={20} color={palette.primary} />
                  <Text style={s.linkText}>Rights Checker</Text>
                </A11yPressable>
                <A11yPressable onPress={() => router.push("/(tabs)/resources/case-timeline" as any)} hitSlop={HIT_SLOP_8} style={s.linkButton}>
                  <MaterialCommunityIcons name="timeline-clock" size={20} color={palette.primary} />
                  <Text style={s.linkText}>Case Timeline</Text>
                </A11yPressable>
              </GapView>
            </View>
          </>
        )}

        {/* ACTION PLANS TAB */}
        {activeTab === 'organize' && (
          <>
            <A11yPressable onPress={() => setShowNewPlan(true)} style={s.primaryButton}>
              <MaterialCommunityIcons name="plus" size={20} color={palette.onPrimary} />
              <Text style={s.primaryButtonText}>Create New Action Plan</Text>
            </A11yPressable>

            {actionPlans.length === 0 ? (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="clipboard-outline" size={48} color={palette.muted} />
                <Text style={s.emptyTitle}>No Action Plans Yet</Text>
                <DyslexiaText style={s.emptyText}>
                  Create an action plan to organize your campaign for change. Use our templates or create your own.
                </DyslexiaText>
              </View>
            ) : (
              actionPlans.map(plan => {
                const completedSteps = plan.steps.filter(s => s.status === 'done').length;
                const progress = plan.steps.length > 0 ? (completedSteps / plan.steps.length) * 100 : 0;
                
                return (
                  <View key={plan.id} style={s.planCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.planTitle}>{plan.title}</Text>
                        <Text style={s.planMeta}>Created {new Date(plan.created).toLocaleDateString()}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <A11yPressable onPress={() => exportPlan(plan)} style={s.iconButton}>
                          <MaterialCommunityIcons name="share-variant" size={18} color={palette.primary} />
                        </A11yPressable>
                        <A11yPressable onPress={() => deletePlan(plan.id)} style={s.iconButton}>
                          <MaterialCommunityIcons name="delete-outline" size={18} color={palette.error} />
                        </A11yPressable>
                      </View>
                    </View>

                    <View style={s.planIssue}>
                      <Text style={{ color: palette.text, fontWeight: '600' }}>Issue:</Text>
                      <DyslexiaText style={{ color: palette.text, marginTop: 4 }}>{plan.issue}</DyslexiaText>
                    </View>

                    {plan.goal && (
                      <View style={s.planGoal}>
                        <Text style={{ color: palette.text, fontWeight: '600' }}>Goal:</Text>
                        <DyslexiaText style={{ color: palette.text, marginTop: 4 }}>{plan.goal}</DyslexiaText>
                      </View>
                    )}

                    {/* Progress Bar */}
                    <View style={{ marginTop: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ color: palette.text, fontWeight: '600' }}>Progress</Text>
                        <Text style={{ color: palette.text }}>{completedSteps}/{plan.steps.length} steps</Text>
                      </View>
                      <View style={s.progressBar}>
                        <View style={[s.progressFill, { width: `${progress}%` }]} />
                      </View>
                    </View>

                    {/* Steps */}
                    {plan.steps.length > 0 && (
                      <View style={{ marginTop: 12 }}>
                        {plan.steps.map((step, idx) => (
                          <A11yPressable 
                            key={idx} 
                            onPress={() => toggleStepStatus(plan.id, idx)}
                            style={s.stepItem}
                          >
                            <MaterialCommunityIcons 
                              name={step.status === 'done' ? 'checkbox-marked-circle' : step.status === 'in-progress' ? 'progress-clock' : 'checkbox-blank-circle-outline'} 
                              size={22} 
                              color={step.status === 'done' ? palette.success : step.status === 'in-progress' ? palette.warning : palette.muted} 
                            />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                              <Text style={[s.stepText, step.status === 'done' && s.stepDone]}>{step.task}</Text>
                              <Text style={s.stepDeadline}>{step.deadline}</Text>
                            </View>
                          </A11yPressable>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'actions' && (
          <>
            <Text style={s.h2}>Pre-Built Campaign Templates</Text>
            <DyslexiaText style={s.subtitle}>
              Start with a proven framework. Customize to fit your situation.
            </DyslexiaText>

            {ACTION_TEMPLATES.map((template, idx) => (
              <View key={idx} style={s.templateCard}>
                <Text style={s.templateTitle}>{template.title}</Text>
                <DyslexiaText style={s.templateIssue}>{template.issue}</DyslexiaText>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12 }}>
                  <MaterialCommunityIcons name="clipboard-list-outline" size={16} color={palette.muted} />
                  <Text style={{ color: palette.muted, marginLeft: 6 }}>{template.steps.length} steps</Text>
                </View>
                <A11yPressable onPress={() => setSelectedTemplate(template)} style={s.secondaryButton}>
                  <MaterialCommunityIcons name="eye-outline" size={18} color={palette.primary} />
                  <Text style={s.secondaryButtonText}>Preview & Use</Text>
                </A11yPressable>
              </View>
            ))}

            {/* Emergency Contacts */}
            <View style={[s.sectionCard, { backgroundColor: palette.warning + '15', borderColor: palette.warning, marginTop: 20 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialCommunityIcons name="alert-circle" size={24} color={palette.warning} />
                <Text style={[s.h2, { marginLeft: 8, marginBottom: 0 }]}>Emergency Contacts</Text>
              </View>
              <DyslexiaText style={s.itemText}>• Your Union Rep/Steward</DyslexiaText>
              <DyslexiaText style={s.itemText}>• Workers' Comp Board (WSIB, WCB)</DyslexiaText>
              <DyslexiaText style={s.itemText}>• Human Rights Commission/Tribunal</DyslexiaText>
              <DyslexiaText style={s.itemText}>• Legal Aid or Community Legal Clinic</DyslexiaText>
              <DyslexiaText style={s.itemText}>• Occupational Health & Safety Inspector</DyslexiaText>
            </View>
          </>
        )}

        {/* NETWORK TAB */}
        {activeTab === 'network' && (
          <>
            <A11yPressable onPress={() => setShowNewContact(true)} style={s.primaryButton}>
              <MaterialCommunityIcons name="account-plus" size={20} color={palette.onPrimary} />
              <Text style={s.primaryButtonText}>Add Contact</Text>
            </A11yPressable>

            <DyslexiaText style={[s.subtitle, { marginTop: 12 }]}>
              Build your support network. Store contacts for union reps, advocates, lawyers, and allies.
            </DyslexiaText>

            {network.length === 0 ? (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="account-group-outline" size={48} color={palette.muted} />
                <Text style={s.emptyTitle}>No Contacts Yet</Text>
                <DyslexiaText style={s.emptyText}>
                  Add your union rep, advocacy contacts, legal resources, and workplace allies.
                </DyslexiaText>
              </View>
            ) : (
              network.map(contact => (
                <View key={contact.id} style={s.contactCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.contactName}>{contact.name}</Text>
                      <Text style={s.contactRole}>{contact.role}</Text>
                    </View>
                    <A11yPressable onPress={() => deleteContact(contact.id)} style={s.iconButton}>
                      <MaterialCommunityIcons name="delete-outline" size={18} color={palette.error} />
                    </A11yPressable>
                  </View>
                  {contact.phone && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <MaterialCommunityIcons name="phone" size={16} color={palette.primary} />
                      <Text style={{ color: palette.text, marginLeft: 8 }}>{contact.phone}</Text>
                    </View>
                  )}
                  {contact.email && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <MaterialCommunityIcons name="email" size={16} color={palette.primary} />
                      <Text style={{ color: palette.text, marginLeft: 8 }}>{contact.email}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </>
        )}

        {/* New Plan Modal */}
        <Modal visible={showNewPlan} animationType="slide" transparent>
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: palette.background }]}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Create Action Plan</Text>
                <A11yPressable onPress={() => setShowNewPlan(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={palette.text} />
                </A11yPressable>
              </View>
              <ScrollView style={{ padding: 16 }}>
                <Text style={s.inputLabel}>Plan Title *</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="e.g., Accommodation Campaign"
                  placeholderTextColor={palette.muted}
                  value={newPlanTitle}
                  onChangeText={setNewPlanTitle}
                />
                <Text style={s.inputLabel}>What's the Issue? *</Text>
                <TextInput
                  style={[s.textInput, { minHeight: 80 }]}
                  placeholder="Describe the problem you're trying to solve..."
                  placeholderTextColor={palette.muted}
                  value={newPlanIssue}
                  onChangeText={setNewPlanIssue}
                  multiline
                />
                <Text style={s.inputLabel}>What's Your Goal?</Text>
                <TextInput
                  style={[s.textInput, { minHeight: 60 }]}
                  placeholder="What outcome are you working toward?"
                  placeholderTextColor={palette.muted}
                  value={newPlanGoal}
                  onChangeText={setNewPlanGoal}
                  multiline
                />
                <A11yPressable onPress={createCustomPlan} style={[s.primaryButton, { marginTop: 16 }]}>
                  <Text style={s.primaryButtonText}>Create Plan</Text>
                </A11yPressable>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* New Contact Modal */}
        <Modal visible={showNewContact} animationType="slide" transparent>
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: palette.background }]}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Add Contact</Text>
                <A11yPressable onPress={() => setShowNewContact(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={palette.text} />
                </A11yPressable>
              </View>
              <ScrollView style={{ padding: 16 }}>
                <Text style={s.inputLabel}>Name *</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="Contact name"
                  placeholderTextColor={palette.muted}
                  value={newContactName}
                  onChangeText={setNewContactName}
                />
                <Text style={s.inputLabel}>Role *</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="e.g., Union Steward, Lawyer, Advocate"
                  placeholderTextColor={palette.muted}
                  value={newContactRole}
                  onChangeText={setNewContactRole}
                />
                <Text style={s.inputLabel}>Phone</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="Phone number"
                  placeholderTextColor={palette.muted}
                  value={newContactPhone}
                  onChangeText={setNewContactPhone}
                  keyboardType="phone-pad"
                />
                <Text style={s.inputLabel}>Email</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="Email address"
                  placeholderTextColor={palette.muted}
                  value={newContactEmail}
                  onChangeText={setNewContactEmail}
                  keyboardType="email-address"
                />
                <A11yPressable onPress={addContact} style={[s.primaryButton, { marginTop: 16 }]}>
                  <Text style={s.primaryButtonText}>Add Contact</Text>
                </A11yPressable>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Template Preview Modal */}
        <Modal visible={!!selectedTemplate} animationType="slide" transparent>
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: palette.background }]}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>{selectedTemplate?.title}</Text>
                <A11yPressable onPress={() => setSelectedTemplate(null)}>
                  <MaterialCommunityIcons name="close" size={24} color={palette.text} />
                </A11yPressable>
              </View>
              <ScrollView style={{ padding: 16 }}>
                <View style={{ backgroundColor: palette.info + '15', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <Text style={{ color: palette.text, fontWeight: '600' }}>Issue</Text>
                  <DyslexiaText style={{ color: palette.text, marginTop: 4 }}>{selectedTemplate?.issue}</DyslexiaText>
                </View>
                <View style={{ backgroundColor: palette.success + '15', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <Text style={{ color: palette.text, fontWeight: '600' }}>Goal</Text>
                  <DyslexiaText style={{ color: palette.text, marginTop: 4 }}>{selectedTemplate?.goal}</DyslexiaText>
                </View>
                <Text style={s.h2}>Steps ({selectedTemplate?.steps.length})</Text>
                {selectedTemplate?.steps.map((step, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: palette.muted }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: palette.onPrimary, fontWeight: '700', fontSize: 12 }}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: palette.text, fontWeight: '600' }}>{step.task}</Text>
                      <Text style={{ color: palette.muted, fontSize: 13 }}>{step.deadline}</Text>
                    </View>
                  </View>
                ))}
                <A11yPressable onPress={() => selectedTemplate && createPlanFromTemplate(selectedTemplate)} style={[s.primaryButton, { marginTop: 20 }]}>
                  <MaterialCommunityIcons name="plus" size={20} color={palette.onPrimary} />
                  <Text style={s.primaryButtonText}>Use This Template</Text>
                </A11yPressable>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </ResponsiveScreenWrapper>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: '700', color: palette.text, marginBottom: 8 },
    subtitle: { color: palette.text, opacity: 0.9, lineHeight: 22 },
    h2: { color: palette.text, fontWeight: '700', fontSize: 18, marginBottom: 12 },
    
    // Tabs
    tabButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    tabButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    tabButtonText: { fontSize: 13, fontWeight: '600', color: palette.text },
    
    // Section Cards
    sectionCard: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
      flex: 1,
      marginLeft: 10,
    },
    sectionContent: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: palette.muted,
    },
    
    // Guide Items
    guideItem: {
      marginBottom: 12,
    },
    guideItemTitle: {
      color: palette.primary,
      fontWeight: '700',
      fontSize: 14,
    },
    guideItemText: {
      color: palette.text,
      marginTop: 4,
      lineHeight: 20,
    },
    itemText: {
      fontSize: 14,
      color: palette.text,
      lineHeight: 22,
      marginBottom: 6,
    },
    
    // Buttons
    primaryButton: {
      backgroundColor: palette.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 10,
    },
    primaryButtonText: { color: palette.onPrimary, fontWeight: '700', fontSize: 15 },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.primary,
      backgroundColor: palette.primary + '10',
    },
    secondaryButtonText: { color: palette.primary, fontWeight: '600', fontSize: 14 },
    iconButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: palette.surface,
    },
    linkButton: {
      backgroundColor: palette.surface,
      borderRadius: 10,
      padding: 14,
      borderWidth: 1,
      borderColor: palette.muted,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    linkText: {
      color: palette.primary,
      fontWeight: '600',
      fontSize: 15,
    },
    
    // Plan Cards
    planCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    planTitle: { fontSize: 18, fontWeight: '700', color: palette.text },
    planMeta: { color: palette.muted, fontSize: 13, marginTop: 4 },
    planIssue: {
      marginTop: 12,
      padding: 12,
      backgroundColor: palette.surface,
      borderRadius: 8,
    },
    planGoal: {
      marginTop: 8,
      padding: 12,
      backgroundColor: palette.success + '15',
      borderRadius: 8,
    },
    progressBar: {
      height: 8,
      backgroundColor: palette.background,
      borderRadius: 4,
    },
    progressFill: {
      height: '100%',
      backgroundColor: palette.success,
      borderRadius: 4,
    },
    
    // Steps
    stepItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: palette.muted,
    },
    stepText: { color: palette.text, fontSize: 14, lineHeight: 20 },
    stepDone: { textDecorationLine: 'line-through', opacity: 0.6 },
    stepDeadline: { color: palette.muted, fontSize: 12, marginTop: 2 },
    
    // Templates
    templateCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    templateTitle: { fontSize: 17, fontWeight: '700', color: palette.text },
    templateIssue: { color: palette.text, opacity: 0.8, marginTop: 4, lineHeight: 20 },
    
    // Contacts
    contactCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    contactName: { fontSize: 17, fontWeight: '700', color: palette.text },
    contactRole: { color: palette.primary, fontWeight: '600', marginTop: 2 },
    
    // Empty State
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyTitle: { color: palette.text, fontWeight: '700', fontSize: 18, marginTop: 16 },
    emptyText: { color: palette.text, opacity: 0.7, textAlign: 'center', marginTop: 8, maxWidth: 280 },
    
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '85%',
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
    
    // Form
    inputLabel: { color: palette.text, fontWeight: '600', marginTop: 16, marginBottom: 6 },
    textInput: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 10,
      padding: 12,
      color: palette.text,
      fontSize: 15,
    },
  });
}
