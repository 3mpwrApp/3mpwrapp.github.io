// Legal Process Automation for Disability Rights
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useIndigenousLanguage } from '../context/IndigenousLanguageContext';
import { useThemeColor } from '../hooks/useThemeColor';
import { useTranslation } from '../i18n';

import A11yPressable from './A11yPressable';

const A11yWrapper = ({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) => (
  <View style={style} accessibilityElementsHidden={false} importantForAccessibility="yes">
    {children}
  </View>
);

const A11yTitle = ({ level: _level = 2, style, children }: { level?: 1 | 2 | 3 | 4 | 5 | 6; style?: StyleProp<TextStyle>; children: ReactNode }) => (
  <Text accessibilityRole="header" style={style}>
    {children}
  </Text>
);

// Legal process types and interfaces
interface LegalProcess {
  id: string;
  type: LegalProcessType;
  title: string;
  description: string;
  status: ProcessStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  jurisdiction: Jurisdiction;
  startDate: Date;
  estimatedCompletion?: Date;
  actualCompletionDate?: Date;
  currentStep: ProcessStep;
  steps: ProcessStep[];
  documents: LegalDocument[];
  deadlines: LegalDeadline[];
  contacts: LegalContact[];
  notes: ProcessNote[];
  culturalConsiderations?: string[];
  accessibilityAccommodations: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  stepNumber: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked';
  estimatedDuration: number; // days
  actualDuration?: number;
  requiredActions: StepAction[];
  documents: string[]; // document IDs
  deadlines: string[]; // deadline IDs
  dependencies: string[]; // other step IDs
  completedAt?: Date;
  notes?: string;
}

interface StepAction {
  id: string;
  description: string;
  type: 'form_completion' | 'document_preparation' | 'submission' | 'meeting' | 'research' | 'communication';
  isCompleted: boolean;
  completedAt?: Date;
  instructions?: string;
  resources?: ActionResource[];
}

interface ActionResource {
  title: string;
  type: 'template' | 'guide' | 'contact' | 'law' | 'precedent';
  url?: string;
  content?: string;
  accessibilityNotes?: string;
}

interface LegalDocument {
  id: string;
  name: string;
  type: DocumentType;
  status: 'required' | 'in_progress' | 'completed' | 'submitted' | 'approved' | 'rejected';
  templateId?: string;
  filePath?: string;
  createdAt: Date;
  dueDate?: Date;
  submittedAt?: Date;
  notes?: string;
  version: number;
  isGenerated: boolean;
  generationPrompt?: string;
}

interface LegalDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  type: 'filing' | 'response' | 'hearing' | 'appeal' | 'review' | 'meeting';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'upcoming' | 'due_soon' | 'overdue' | 'completed' | 'extended';
  associatedDocuments: string[];
  remindersSent: Date[];
  completedAt?: Date;
  extensionRequested?: boolean;
  extensionGranted?: boolean;
  newDueDate?: Date;
}

interface LegalContact {
  id: string;
  name: string;
  role: ContactRole;
  organization?: string;
  email?: string;
  phone?: string;
  address?: string;
  specializations: string[];
  communicationPreferences: string[];
  accessibilityNotes?: string;
  culturalCompetency?: string[];
  lastContact?: Date;
  relationship: 'representing' | 'opposing' | 'neutral' | 'advisor';
}

interface ProcessNote {
  id: string;
  content: string;
  type: 'general' | 'strategy' | 'concern' | 'achievement' | 'deadline' | 'communication';
  createdAt: Date;
  createdBy: string;
  isPrivate: boolean;
  attachments?: string[];
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: DocumentType;
  jurisdiction: Jurisdiction;
  content: string;
  variables: TemplateVariable[];
  instructions: string;
  requiredFields: string[];
  accessibilityNotes: string[];
  culturalAdaptations?: Record<string, string>;
  lastUpdated: Date;
  version: string;
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'date' | 'number' | 'boolean' | 'select' | 'multiselect';
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  defaultValue?: any;
  validation?: string;
}

// Workflow interface for future expansion
export interface LegalWorkflow {
  id: string;
  name: string;
  description: string;
  processType: LegalProcessType;
  jurisdiction: Jurisdiction;
  steps: WorkflowStep[];
  estimatedDuration: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'expert_required';
  prerequisites: string[];
  outcomes: string[];
  successRate: number;
  lastUpdated: Date;
}

interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  estimatedDuration: number;
  actions: string[];
  documents: string[];
  tips: string[];
  pitfalls: string[];
  accessibilityConsiderations: string[];
}

type LegalProcessType = 
  | 'disability_benefits_application'
  | 'workplace_accommodation_request'
  | 'education_accommodation_appeal'
  | 'discrimination_complaint'
  | 'accessibility_violation_report'
  | 'housing_accommodation_request'
  | 'transportation_accessibility_complaint'
  | 'healthcare_advocacy'
  | 'guardianship_proceedings'
  | 'disability_rights_advocacy'
  | 'appeals_process'
  | 'legal_name_change'
  | 'accessibility_audit_request';

type DocumentType = 
  | 'application_form'
  | 'medical_evidence'
  | 'accommodation_request'
  | 'appeal_letter'
  | 'complaint_form'
  | 'supporting_statement'
  | 'legal_brief'
  | 'correspondence'
  | 'evidence_submission'
  | 'witness_statement'
  | 'expert_report'
  | 'timeline_document';

type ProcessStatus = 
  | 'planning'
  | 'in_progress'
  | 'awaiting_response'
  | 'under_review'
  | 'completed'
  | 'rejected'
  | 'appealed'
  | 'settled'
  | 'withdrawn'
  | 'escalated';

type Jurisdiction = 
  | 'federal'
  | 'alberta'
  | 'british_columbia'
  | 'manitoba'
  | 'new_brunswick'
  | 'newfoundland_labrador'
  | 'northwest_territories'
  | 'nova_scotia'
  | 'nunavut'
  | 'ontario'
  | 'prince_edward_island'
  | 'quebec'
  | 'saskatchewan'
  | 'yukon';

type ContactRole = 
  | 'lawyer'
  | 'legal_aid'
  | 'advocate'
  | 'case_worker'
  | 'adjudicator'
  | 'court_clerk'
  | 'mediator'
  | 'expert_witness'
  | 'government_official'
  | 'organization_representative';

export default function LegalAutomationContent() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const { t: _t } = useTranslation();
  const { user } = useAuth();
  const { settings } = useIndigenousLanguage();

  // Create colors object for compatibility
  const colors = {
    text: textColor,
    background: backgroundColor,
    primary: textColor,
    border: `${textColor}20`,
    card: backgroundColor,
    notification: `${textColor}90`,
    success: `${textColor}70`,
    warning: `${textColor}60`,
    error: `${textColor}80`,
    surface: backgroundColor,
    accent: `${textColor}80`,
    textSecondary: `${textColor}60`
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'processes' | 'documents' | 'deadlines' | 'templates'>('dashboard');
  const [legalProcesses, setLegalProcesses] = useState<LegalProcess[]>([]);
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<LegalDeadline[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProcessType, setSelectedProcessType] = useState<LegalProcessType>('disability_benefits_application');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction>('federal');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLegalData();
  }, []);

  const loadLegalData = async () => {
    try {
      setIsLoading(true);

      // Mock legal processes
      const mockProcesses: LegalProcess[] = [
        {
          id: '1',
          type: 'disability_benefits_application',
          title: 'Canada Disability Benefit Application',
          description: 'Application for federal disability benefits under the new Canada Disability Benefit program',
          status: 'in_progress',
          priority: 'high',
          jurisdiction: 'federal',
          startDate: new Date('2024-01-15'),
          estimatedCompletion: new Date('2024-04-15'),
          currentStep: {
            id: 'step_2',
            title: 'Medical Documentation',
            description: 'Gather required medical evidence and assessments',
            stepNumber: 2,
            status: 'in_progress',
            estimatedDuration: 14,
            requiredActions: [
              {
                id: 'action_1',
                description: 'Request medical records from family doctor',
                type: 'communication',
                isCompleted: true,
                completedAt: new Date('2024-02-01')
              },
              {
                id: 'action_2',
                description: 'Schedule assessment with occupational therapist',
                type: 'meeting',
                isCompleted: false,
                instructions: 'Book appointment within 2 weeks to meet deadline'
              },
              {
                id: 'action_3',
                description: 'Complete disability impact questionnaire',
                type: 'form_completion',
                isCompleted: false,
                resources: [
                  {
                    title: 'DTC Disability Impact Form',
                    type: 'template',
                    content: 'Comprehensive form for documenting daily living impacts',
                    accessibilityNotes: 'Available in large print and screen reader compatible format'
                  }
                ]
              }
            ],
            documents: ['doc_1', 'doc_2'],
            deadlines: ['deadline_1'],
            dependencies: []
          },
          steps: [
            {
              id: 'step_1',
              title: 'Initial Application',
              description: 'Complete and submit initial application forms',
              stepNumber: 1,
              status: 'completed',
              estimatedDuration: 7,
              actualDuration: 5,
              requiredActions: [],
              documents: [],
              deadlines: [],
              dependencies: [],
              completedAt: new Date('2024-01-20')
            }
          ],
          documents: [
            {
              id: 'doc_1',
              name: 'T2201 Disability Tax Credit Certificate',
              type: 'application_form',
              status: 'in_progress',
              createdAt: new Date('2024-01-16'),
              dueDate: new Date('2024-03-01'),
              version: 1,
              isGenerated: false
            },
            {
              id: 'doc_2',
              name: 'Medical Assessment Report',
              type: 'medical_evidence',
              status: 'required',
              createdAt: new Date('2024-02-01'),
              dueDate: new Date('2024-02-28'),
              version: 1,
              isGenerated: false
            }
          ],
          deadlines: [
            {
              id: 'deadline_1',
              title: 'Medical Documentation Submission',
              description: 'All medical evidence must be submitted',
              dueDate: new Date('2024-03-01'),
              type: 'filing',
              priority: 'high',
              status: 'upcoming',
              associatedDocuments: ['doc_1', 'doc_2'],
              remindersSent: []
            }
          ],
          contacts: [
            {
              id: 'contact_1',
              name: 'Legal Aid Society',
              role: 'legal_aid',
              organization: 'Legal Aid Society of Alberta',
              email: 'disability@legalaid.ab.ca',
              phone: '1-866-845-3425',
              specializations: ['Disability Rights', 'Benefits Appeals'],
              communicationPreferences: ['email', 'phone'],
              relationship: 'advisor'
            }
          ],
          notes: [
            {
              id: 'note_1',
              content: 'Application started after consultation with disability advocate. Focus on functional limitations rather than diagnosis.',
              type: 'strategy',
              createdAt: new Date('2024-01-15'),
              createdBy: user?.uid || 'user',
              isPrivate: false
            }
          ],
          accessibilityAccommodations: ['Large print documents', 'Extra time for forms', 'Video call options'],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-10')
        },
        {
          id: '2',
          type: 'workplace_accommodation_request',
          title: 'Workplace Ergonomic Assessment Request',
          description: 'Formal request for ergonomic workspace modifications due to chronic back pain',
          status: 'awaiting_response',
          priority: 'medium',
          jurisdiction: 'ontario',
          startDate: new Date('2024-02-01'),
          estimatedCompletion: new Date('2024-03-15'),
          currentStep: {
            id: 'step_3',
            title: 'Employer Response Period',
            description: 'Waiting for employer to respond to accommodation request',
            stepNumber: 3,
            status: 'in_progress',
            estimatedDuration: 21,
            requiredActions: [
              {
                id: 'action_1',
                description: 'Follow up with HR if no response by deadline',
                type: 'communication',
                isCompleted: false,
                instructions: 'Send professional follow-up email referencing duty to accommodate'
              }
            ],
            documents: ['doc_3'],
            deadlines: ['deadline_2'],
            dependencies: []
          },
          steps: [],
          documents: [
            {
              id: 'doc_3',
              name: 'Formal Accommodation Request Letter',
              type: 'accommodation_request',
              status: 'submitted',
              createdAt: new Date('2024-02-01'),
              submittedAt: new Date('2024-02-02'),
              version: 1,
              isGenerated: true,
              generationPrompt: 'Workplace accommodation request for ergonomic modifications'
            }
          ],
          deadlines: [
            {
              id: 'deadline_2',
              title: 'Employer Response Required',
              description: 'Employer must respond to accommodation request under duty to accommodate',
              dueDate: new Date('2024-02-23'),
              type: 'response',
              priority: 'medium',
              status: 'upcoming',
              associatedDocuments: ['doc_3'],
              remindersSent: []
            }
          ],
          contacts: [],
          notes: [],
          accessibilityAccommodations: ['Email communication preferred', 'Flexible meeting times'],
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-10')
        }
      ];

      const mockDeadlines: LegalDeadline[] = mockProcesses.flatMap(p => p.deadlines);

      const mockTemplates: DocumentTemplate[] = [
        {
          id: 'template_1',
          name: 'Workplace Accommodation Request Letter',
          description: 'Formal letter requesting workplace accommodations under human rights legislation',
          type: 'accommodation_request',
          jurisdiction: 'federal',
          content: `Dear [EMPLOYER_NAME],

I am writing to formally request workplace accommodations under the duty to accommodate provisions of the Canadian Human Rights Act and applicable provincial human rights legislation.

[DISABILITY_DISCLOSURE]

I am requesting the following accommodations:
[ACCOMMODATION_LIST]

These accommodations would enable me to perform the essential functions of my position while managing my disability-related needs.

Medical documentation supporting this request is available upon request.

I look forward to working collaboratively to implement these accommodations.

Sincerely,
[EMPLOYEE_NAME]
[DATE]`,
          variables: [
            {
              name: 'EMPLOYER_NAME',
              type: 'text',
              label: 'Employer/HR Department Name',
              required: true
            },
            {
              name: 'DISABILITY_DISCLOSURE',
              type: 'text',
              label: 'Disability Information (optional)',
              description: 'Brief description of disability relevant to accommodations',
              required: false
            },
            {
              name: 'ACCOMMODATION_LIST',
              type: 'text',
              label: 'Requested Accommodations',
              description: 'Specific accommodations needed',
              required: true
            },
            {
              name: 'EMPLOYEE_NAME',
              type: 'text',
              label: 'Your Name',
              required: true
            }
          ],
          instructions: 'Complete all required fields. Be specific about accommodations but focus on functional needs rather than medical details.',
          requiredFields: ['EMPLOYER_NAME', 'ACCOMMODATION_LIST', 'EMPLOYEE_NAME'],
          accessibilityNotes: [
            'Template available in large print',
            'Screen reader compatible',
            'Plain language version available'
          ],
          culturalAdaptations: settings.primaryLanguage ? {
            [settings.primaryLanguage]: 'Traditional consultation protocols may be incorporated where appropriate'
          } : undefined,
          lastUpdated: new Date('2024-01-01'),
          version: '2.1'
        },
        {
          id: 'template_2',
          name: 'Disability Benefits Appeal Letter',
          description: 'Template for appealing denied disability benefit applications',
          type: 'appeal_letter',
          jurisdiction: 'federal',
          content: `[DATE]

[APPEAL_BOARD_ADDRESS]

Re: Appeal of Decision - [APPLICATION_NUMBER]
Applicant: [APPLICANT_NAME]

Dear Members of the Appeal Board,

I am writing to formally appeal the decision dated [DECISION_DATE] regarding my application for [BENEFIT_TYPE].

Grounds for Appeal:
[APPEAL_GROUNDS]

New Evidence:
[NEW_EVIDENCE]

I respectfully request that the Board review this decision and approve my application based on the evidence provided.

Thank you for your consideration.

Sincerely,
[APPLICANT_NAME]
[CONTACT_INFORMATION]`,
          variables: [
            {
              name: 'APPEAL_BOARD_ADDRESS',
              type: 'text',
              label: 'Appeal Board Address',
              required: true
            },
            {
              name: 'APPLICATION_NUMBER',
              type: 'text',
              label: 'Application/Reference Number',
              required: true
            },
            {
              name: 'APPLICANT_NAME',
              type: 'text',
              label: 'Your Full Name',
              required: true
            },
            {
              name: 'DECISION_DATE',
              type: 'date',
              label: 'Date of Original Decision',
              required: true
            },
            {
              name: 'BENEFIT_TYPE',
              type: 'select',
              label: 'Type of Benefit',
              options: ['Canada Disability Benefit', 'CPP Disability', 'Provincial Disability', 'Other'],
              required: true
            },
            {
              name: 'APPEAL_GROUNDS',
              type: 'text',
              label: 'Grounds for Appeal',
              description: 'Why you believe the decision was incorrect',
              required: true
            },
            {
              name: 'NEW_EVIDENCE',
              type: 'text',
              label: 'New Evidence',
              description: 'Any new medical or other evidence since original application',
              required: false
            }
          ],
          instructions: 'Appeals must be filed within specific timeframes. Check your jurisdiction\'s requirements.',
          requiredFields: ['APPEAL_BOARD_ADDRESS', 'APPLICATION_NUMBER', 'APPLICANT_NAME', 'DECISION_DATE', 'BENEFIT_TYPE', 'APPEAL_GROUNDS'],
          accessibilityNotes: [
            'Template includes appeal timeline guidance',
            'Available in accessible formats',
            'Legal aid contact information included'
          ],
          lastUpdated: new Date('2024-01-15'),
          version: '1.3'
        }
      ];

      setLegalProcesses(mockProcesses);
      setUpcomingDeadlines(mockDeadlines);
      setDocumentTemplates(mockTemplates);

    } catch (error) {
      console.error('Error loading legal data:', error);
      Alert.alert('Error', 'Failed to load legal process data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProcess = () => {
    // Reserved for future implementation - process creation flow
    const _newProcess: Partial<LegalProcess> = {
      type: selectedProcessType,
      jurisdiction: selectedJurisdiction,
      status: 'planning',
      priority: 'medium',
      startDate: new Date(),
      steps: [],
      documents: [],
      deadlines: [],
      contacts: [],
      notes: [],
      accessibilityAccommodations: ['Standard accommodations as needed'],
      culturalConsiderations: settings.ceremonialConsiderations ? 
        ['Traditional consultation protocols will be observed'] : undefined
    };

    // In production, this would navigate to a detailed creation flow
    Alert.alert(
      'Create Legal Process',
      `This would start the creation flow for: ${selectedProcessType.replace('_', ' ')} in ${selectedJurisdiction}`,
      [{ text: 'OK', style: 'default' }]
    );
    setShowCreateModal(false);
  };

  const generateDocument = (templateId: string) => {
    const template = documentTemplates.find(t => t.id === templateId);
    if (!template) return;

    Alert.alert(
      'Generate Document',
      `Generate "${template.name}" with guided form completion?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            // In production, navigate to document generation wizard
            Alert.alert('Document Generator', 'Document generation wizard would open here.');
          }
        }
      ]
    );
  };

  const renderTabBar = () => (
    <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {[
        { key: 'dashboard', label: 'Dashboard', icon: 'speedometer' },
        { key: 'processes', label: 'Processes', icon: 'list' },
        { key: 'documents', label: 'Documents', icon: 'document-text' },
        { key: 'deadlines', label: 'Deadlines', icon: 'alarm' },
        { key: 'templates', label: 'Templates', icon: 'library' }
      ].map(tab => (
        <A11yPressable
          key={tab.key}
          onPress={() => setActiveTab(tab.key as any)}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab.key }}
          style={[
            styles.tabItem,
            activeTab === tab.key && { backgroundColor: colors.primary + '20' }
          ]}
        >
          <Ionicons 
            name={tab.icon as any} 
            size={18} 
            color={activeTab === tab.key ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabLabel,
            { color: activeTab === tab.key ? colors.primary : colors.textSecondary }
          ]}>
            {tab.label}
          </Text>
        </A11yPressable>
      ))}
    </View>
  );

  const renderDashboard = () => (
    <ScrollView style={styles.tabContent}>
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <A11yTitle level={2} style={[styles.cardTitle, { color: colors.text }]}>
          Legal Process Overview
        </A11yTitle>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {legalProcesses.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Active Processes
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {upcomingDeadlines.filter(d => d.status === 'due_soon' || d.status === 'upcoming').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Upcoming Deadlines
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {legalProcesses.filter(p => p.status === 'completed').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Completed
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.deadlinesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <A11yTitle level={2} style={[styles.cardTitle, { color: colors.text }]}>
          Urgent Deadlines
        </A11yTitle>
        {upcomingDeadlines.slice(0, 3).map(deadline => (
          <View key={deadline.id} style={[styles.deadlineItem, { borderColor: colors.border }]}>
            <View style={styles.deadlineInfo}>
              <Text style={[styles.deadlineTitle, { color: colors.text }]}>
                {deadline.title}
              </Text>
              <Text style={[styles.deadlineDate, { 
                color: deadline.priority === 'critical' ? colors.error : 
                      deadline.priority === 'high' ? colors.warning : colors.textSecondary 
              }]}>
                Due: {deadline.dueDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: deadline.priority === 'critical' ? colors.error + '20' : 
                                deadline.priority === 'high' ? colors.warning + '20' : colors.border }
            ]}>
              <Text style={[
                styles.priorityText,
                { color: deadline.priority === 'critical' ? colors.error : 
                        deadline.priority === 'high' ? colors.warning : colors.textSecondary }
              ]}>
                {deadline.priority}
              </Text>
            </View>
          </View>
        ))}
        {upcomingDeadlines.length === 0 && (
          <Text style={[styles.noDeadlinesText, { color: colors.textSecondary }]}>
            No urgent deadlines at this time.
          </Text>
        )}
      </View>

      <View style={[styles.quickActionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <A11yTitle level={2} style={[styles.cardTitle, { color: colors.text }]}>
          Quick Actions
        </A11yTitle>
        <View style={styles.quickActionsGrid}>
          <A11yPressable
            onPress={() => setShowCreateModal(true)}
            accessibilityRole="button"
            style={[styles.quickActionButton, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.primary }]}>
              Start New Process
            </Text>
          </A11yPressable>
          <A11yPressable
            onPress={() => setActiveTab('templates')}
            accessibilityRole="button"
            style={[styles.quickActionButton, { backgroundColor: colors.success + '20', borderColor: colors.success }]}
          >
            <Ionicons name="document-text" size={24} color={colors.success} />
            <Text style={[styles.quickActionText, { color: colors.success }]}>
              Generate Document
            </Text>
          </A11yPressable>
          <A11yPressable
            onPress={() => setActiveTab('deadlines')}
            accessibilityRole="button"
            style={[styles.quickActionButton, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}
          >
            <Ionicons name="calendar" size={24} color={colors.warning} />
            <Text style={[styles.quickActionText, { color: colors.warning }]}>
              Review Deadlines
            </Text>
          </A11yPressable>
          <A11yPressable
            onPress={() => Alert.alert('Legal Resources', 'Legal resource directory would open here.')}
            accessibilityRole="button"
            style={[styles.quickActionButton, { backgroundColor: colors.textSecondary + '20', borderColor: colors.textSecondary }]}
          >
            <Ionicons name="library" size={24} color={colors.textSecondary} />
            <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>
              Legal Resources
            </Text>
          </A11yPressable>
        </View>
      </View>
    </ScrollView>
  );

  const renderProcesses = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.processesHeader}>
        <A11yTitle level={2} style={[styles.sectionTitle, { color: colors.text }]}>
          Legal Processes
        </A11yTitle>
        <A11yPressable
          onPress={() => setShowCreateModal(true)}
          accessibilityRole="button"
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={20} color="white" />
        </A11yPressable>
      </View>

      {legalProcesses.map(process => (
        <View key={process.id} style={[styles.processCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.processHeader}>
            <View style={styles.processInfo}>
              <Text style={[styles.processTitle, { color: colors.text }]}>
                {process.title}
              </Text>
              <Text style={[styles.processDescription, { color: colors.textSecondary }]}>
                {process.description}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: process.status === 'in_progress' ? colors.primary + '20' : 
                                process.status === 'completed' ? colors.success + '20' : colors.warning + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: process.status === 'in_progress' ? colors.primary : 
                        process.status === 'completed' ? colors.success : colors.warning }
              ]}>
                {process.status.replace('_', ' ')}
              </Text>
            </View>
          </View>

          <View style={styles.processProgress}>
            <Text style={[styles.currentStepTitle, { color: colors.text }]}>
              Current Step: {process.currentStep.title}
            </Text>
            <Text style={[styles.currentStepDescription, { color: colors.textSecondary }]}>
              {process.currentStep.description}
            </Text>
          </View>

          <View style={styles.processActions}>
            <A11yPressable
              onPress={() => Alert.alert('Process Details', 'Detailed process view would open here.')}
              accessibilityRole="button"
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.actionButtonText}>View Details</Text>
            </A11yPressable>
            <A11yPressable
              onPress={() => Alert.alert('Update Progress', 'Progress update form would open here.')}
              accessibilityRole="button"
              style={[styles.actionButton, { borderColor: colors.primary, backgroundColor: 'transparent' }]}
            >
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Update</Text>
            </A11yPressable>
          </View>

          {process.culturalConsiderations && process.culturalConsiderations.length > 0 && (
            <View style={styles.culturalNote}>
              <Ionicons name="leaf" size={16} color={colors.warning} />
              <Text style={[styles.culturalNoteText, { color: colors.textSecondary }]}>
                Cultural protocols being observed
              </Text>
            </View>
          )}
        </View>
      ))}

      {legalProcesses.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="briefcase-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No legal processes yet. Start your first legal process to track progress and deadlines.
          </Text>
          <A11yPressable
            onPress={() => setShowCreateModal(true)}
            accessibilityRole="button"
            style={[styles.startButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.startButtonText}>Start Legal Process</Text>
          </A11yPressable>
        </View>
      )}
    </ScrollView>
  );

  const renderTemplates = () => (
    <ScrollView style={styles.tabContent}>
      <A11yTitle level={2} style={[styles.sectionTitle, { color: colors.text }]}>
        Document Templates
      </A11yTitle>
      <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
        Generate legal documents using proven templates
      </Text>

      {documentTemplates.map(template => (
        <View key={template.id} style={[styles.templateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.templateHeader}>
            <View style={styles.templateInfo}>
              <Text style={[styles.templateName, { color: colors.text }]}>
                {template.name}
              </Text>
              <Text style={[styles.templateDescription, { color: colors.textSecondary }]}>
                {template.description}
              </Text>
            </View>
            <View style={[styles.jurisdictionBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.jurisdictionText, { color: colors.primary }]}>
                {template.jurisdiction}
              </Text>
            </View>
          </View>

          <View style={styles.templateMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="document" size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {template.type.replace('_', ' ')}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                v{template.version}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.metaText, { color: colors.success }]}>
                {template.requiredFields.length} fields
              </Text>
            </View>
          </View>

          {template.culturalAdaptations && (
            <View style={styles.culturalAdaptations}>
              <Ionicons name="leaf" size={16} color={colors.warning} />
              <Text style={[styles.culturalAdaptationsText, { color: colors.textSecondary }]}>
                Cultural adaptations available
              </Text>
            </View>
          )}

          <View style={styles.accessibilityIndicators}>
            {template.accessibilityNotes.map((note, index) => (
              <View key={index} style={styles.accessibilityBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={[styles.accessibilityText, { color: colors.success }]}>
                  {note}
                </Text>
              </View>
            ))}
          </View>

          <A11yPressable
            onPress={() => generateDocument(template.id)}
            accessibilityRole="button"
            style={[styles.generateButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="create" size={20} color="white" />
            <Text style={styles.generateButtonText}>Generate Document</Text>
          </A11yPressable>
        </View>
      ))}
    </ScrollView>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Start New Legal Process
          </Text>
          <A11yPressable
            onPress={() => setShowCreateModal(false)}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </A11yPressable>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formSection}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Process Type</Text>
            <View style={styles.processTypeGrid}>
              {[
                { value: 'disability_benefits_application', label: 'Disability Benefits Application' },
                { value: 'workplace_accommodation_request', label: 'Workplace Accommodation' },
                { value: 'discrimination_complaint', label: 'Discrimination Complaint' },
                { value: 'appeals_process', label: 'Appeals Process' },
                { value: 'accessibility_violation_report', label: 'Accessibility Violation' },
                { value: 'housing_accommodation_request', label: 'Housing Accommodation' }
              ].map(type => (
                <A11yPressable
                  key={type.value}
                  onPress={() => setSelectedProcessType(type.value as LegalProcessType)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedProcessType === type.value }}
                  style={[
                    styles.processTypeOption,
                    {
                      backgroundColor: selectedProcessType === type.value ? colors.primary + '20' : colors.card,
                      borderColor: selectedProcessType === type.value ? colors.primary : colors.border
                    }
                  ]}
                >
                  <Text style={[
                    styles.processTypeText,
                    { color: selectedProcessType === type.value ? colors.primary : colors.text }
                  ]}>
                    {type.label}
                  </Text>
                </A11yPressable>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Jurisdiction</Text>
            <View style={styles.jurisdictionGrid}>
              {[
                { value: 'federal', label: 'Federal' },
                { value: 'ontario', label: 'Ontario' },
                { value: 'alberta', label: 'Alberta' },
                { value: 'british_columbia', label: 'British Columbia' },
                { value: 'quebec', label: 'Quebec' },
                { value: 'manitoba', label: 'Manitoba' }
              ].map(jurisdiction => (
                <A11yPressable
                  key={jurisdiction.value}
                  onPress={() => setSelectedJurisdiction(jurisdiction.value as Jurisdiction)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedJurisdiction === jurisdiction.value }}
                  style={[
                    styles.jurisdictionOption,
                    {
                      backgroundColor: selectedJurisdiction === jurisdiction.value ? colors.primary + '20' : colors.card,
                      borderColor: selectedJurisdiction === jurisdiction.value ? colors.primary : colors.border
                    }
                  ]}
                >
                  <Text style={[
                    styles.jurisdictionText,
                    { color: selectedJurisdiction === jurisdiction.value ? colors.primary : colors.text }
                  ]}>
                    {jurisdiction.label}
                  </Text>
                </A11yPressable>
              ))}
            </View>
          </View>

          {settings.ceremonialConsiderations && (
            <View style={[styles.culturalGuidance, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
              <Ionicons name="leaf" size={20} color={colors.warning} />
              <View style={styles.culturalGuidanceContent}>
                <Text style={[styles.culturalGuidanceTitle, { color: colors.warning }]}>
                  Cultural Protocols
                </Text>
                <Text style={[styles.culturalGuidanceText, { color: colors.textSecondary }]}>
                  Traditional consultation protocols will be incorporated into this legal process where appropriate.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.modalFooter}>
            <A11yPressable
              onPress={() => setShowCreateModal(false)}
              accessibilityRole="button"
              style={[styles.cancelButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </A11yPressable>
            <A11yPressable
              onPress={handleCreateProcess}
              accessibilityRole="button"
              style={[styles.createButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.createButtonText}>Start Process</Text>
            </A11yPressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <A11yWrapper style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading legal automation tools...
          </Text>
        </View>
      </A11yWrapper>
    );
  }

  return (
    <A11yWrapper style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <A11yPressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[styles.backButton, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </A11yPressable>
        <A11yTitle level={1} style={[styles.title, { color: colors.text }]}>
          Legal Process Automation
        </A11yTitle>
      </View>

      {settings.primaryLanguage && settings.ceremonialConsiderations && (
        <View style={[styles.culturalBanner, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
          <Ionicons name="leaf" size={20} color={colors.warning} />
          <Text style={[styles.culturalBannerText, { color: colors.warning }]}>
            Traditional consultation protocols will be honored in legal processes
          </Text>
        </View>
      )}

      {renderTabBar()}

      <View style={styles.content}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'processes' && renderProcesses()}
        {activeTab === 'documents' && (
          <ScrollView style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Document management coming soon...
            </Text>
          </ScrollView>
        )}
        {activeTab === 'deadlines' && (
          <ScrollView style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Deadline tracking coming soon...
            </Text>
          </ScrollView>
        )}
        {activeTab === 'templates' && renderTemplates()}
      </View>

      {renderCreateModal()}
    </A11yWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  culturalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  culturalBannerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  deadlinesCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  deadlineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deadlineDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  noDeadlinesText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  quickActionsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: 150,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  processesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  processHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  processInfo: {
    flex: 1,
    marginRight: 12,
  },
  processTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  processDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  processProgress: {
    marginBottom: 12,
  },
  currentStepTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentStepDescription: {
    fontSize: 14,
  },
  processActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  culturalNote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  culturalNoteText: {
    fontSize: 12,
    marginLeft: 8,
  },
  templateCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  templateInfo: {
    flex: 1,
    marginRight: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  jurisdictionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jurisdictionText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  templateMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  culturalAdaptations: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  culturalAdaptationsText: {
    fontSize: 12,
    marginLeft: 8,
  },
  accessibilityIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  accessibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  accessibilityText: {
    fontSize: 11,
    marginLeft: 4,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 24,
  },
  startButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoonText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  processTypeGrid: {
    gap: 8,
  },
  processTypeOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  processTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  jurisdictionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  jurisdictionOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  culturalGuidance: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
  },
  culturalGuidanceContent: {
    flex: 1,
    marginLeft: 12,
  },
  culturalGuidanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  culturalGuidanceText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});