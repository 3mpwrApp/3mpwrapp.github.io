// Advocacy Campaign Coordinator - Route-based lazy loaded component (Phase 4.5)
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import A11yPressable from '../../../components/A11yPressable';
import { A11yTitle, A11yWrapper } from '../../../components/A11yWrapper';
import { GapView } from '../../../components/GapView';
import { useAuth } from '../../../context/AuthContext';
import { useIndigenousLanguage } from '../../../context/IndigenousLanguageContext';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { useTranslation } from '../../../i18n';

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: CampaignCategory;
  estimatedDuration: number; // days
  requiredResources: string[];
  suggestedMilestones: MilestoneTemplate[];
  accessibilityConsiderations: string[];
  culturalSensitivityNotes?: string[];
}

interface MilestoneTemplate {
  name: string;
  description: string;
  suggestedTimeframe: number; // days from start
  requiredActions: string[];
  deliverables: string[];
}

interface CampaignGoal {
  id: string;
  description: string;
  measurable: boolean;
  targetValue?: number;
  targetUnit?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'awareness' | 'policy' | 'funding' | 'accessibility' | 'education';
}

// TODO: Implement task assignment tracking in Phase 6
// interface TaskAssignment {
//   id: string;
//   taskDescription: string;
//   assigneeId: string;
//   assigneeName: string;
//   dueDate: Date;
//   status: 'pending' | 'in_progress' | 'completed' | 'blocked';
//   priority: 'urgent' | 'high' | 'medium' | 'low';
//   estimatedHours: number;
//   skillsRequired: string[];
//   accessibilityRequirements?: string[];
// }

// TODO: Contact information structure for advocacy targets (Phase 6)
// interface ContactInfo {
//   email?: string;
//   phone?: string;
//   address?: string;
//   website?: string;
//   socialMedia?: Record<string, string>;
// }

// TODO: Implement advocacy target tracking in Phase 6
// interface AdvocacyTarget {
//   id: string;
//   name: string;
//   type: 'government' | 'organization' | 'business' | 'institution' | 'public';
//   level: 'municipal' | 'provincial' | 'federal' | 'international';
//   contactInfo: ContactInfo;
//   influence: 'high' | 'medium' | 'low';
//   receptiveness: 'supportive' | 'neutral' | 'opposed' | 'unknown';
//   previousEngagement?: string;
// }

// TODO: Implement communication strategy tracking in Phase 6
// interface CommunicationStrategy {
//   channels: string[];
//   messaging: Record<string, string>; // channel -> message
//   frequency: string;
//   languages: string[];
//   accessibilityFormats: string[];
//   culturalAdaptations?: string[];
// }

type CampaignCategory = 
  | 'accessibility_rights'
  | 'employment_equality'
  | 'healthcare_access'
  | 'education_inclusion'
  | 'transportation'
  | 'housing_rights'
  | 'technology_access'
  | 'mental_health'
  | 'indigenous_disability_rights'
  | 'youth_advocacy'
  | 'elder_advocacy'
  | 'intersectional_rights';

export default function AdvocacyCampaignCoordinator() {
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

  const [activeTab, setActiveTab] = useState<'overview' | 'planning' | 'execution' | 'tracking'>('overview');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignTemplates, setCampaignTemplates] = useState<CampaignTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    category: 'accessibility_rights' as CampaignCategory,
    goals: [] as CampaignGoal[],
    startDate: new Date(),
    estimatedEndDate: new Date(),
    budget: 0,
    targetAudience: '',
    primaryFocus: '',
  });

  useEffect(() => {
    loadCampaignData();
    loadCampaignTemplates();
  }, []);

  const loadCampaignTemplates = () => {
    const templates: CampaignTemplate[] = [
      {
        id: 'accessibility_workplace',
        name: 'Workplace Accessibility Campaign',
        description: 'Advocate for improved workplace accommodations and inclusive hiring practices',
        category: 'employment_equality',
        estimatedDuration: 120,
        requiredResources: [
          'Legal research on employment rights',
          'Survey data from disabled employees',
          'Accommodation cost analysis',
          'Best practices documentation'
        ],
        suggestedMilestones: [
          {
            name: 'Research & Documentation',
            description: 'Gather evidence and compile research on workplace barriers',
            suggestedTimeframe: 30,
            requiredActions: [
              'Conduct employee surveys',
              'Research legal frameworks',
              'Document current accessibility gaps',
              'Interview stakeholders'
            ],
            deliverables: [
              'Accessibility audit report',
              'Employee testimony collection',
              'Legal analysis document',
              'Gap analysis presentation'
            ]
          },
          {
            name: 'Stakeholder Engagement',
            description: 'Build coalition and engage with decision makers',
            suggestedTimeframe: 60,
            requiredActions: [
              'Identify key decision makers',
              'Schedule meetings with HR departments',
              'Present findings to management',
              'Build employee coalition'
            ],
            deliverables: [
              'Stakeholder mapping',
              'Meeting presentations',
              'Coalition agreement',
              'Engagement strategy'
            ]
          },
          {
            name: 'Policy Proposal',
            description: 'Develop concrete policy recommendations',
            suggestedTimeframe: 90,
            requiredActions: [
              'Draft policy recommendations',
              'Cost-benefit analysis',
              'Implementation timeline',
              'Pilot program design'
            ],
            deliverables: [
              'Policy proposal document',
              'Implementation guide',
              'Budget projections',
              'Pilot program plan'
            ]
          }
        ],
        accessibilityConsiderations: [
          'All materials in multiple formats (text, audio, easy-read)',
          'Sign language interpretation for meetings',
          'Virtual participation options',
          'Sensory-friendly meeting environments',
          'Large print and high contrast materials'
        ]
      },
      {
        id: 'indigenous_accessibility',
        name: 'Indigenous Disability Rights Campaign',
        description: 'Address unique barriers faced by Indigenous people with disabilities',
        category: 'indigenous_disability_rights',
        estimatedDuration: 180,
        requiredResources: [
          'Traditional knowledge keepers consultation',
          'Indigenous disability statistics',
          'Cultural protocol documentation',
          'Community elder guidance'
        ],
        suggestedMilestones: [
          {
            name: 'Community Consultation',
            description: 'Engage with Indigenous communities and elders',
            suggestedTimeframe: 45,
            requiredActions: [
              'Elder consultation protocols',
              'Community listening sessions',
              'Traditional healing integration',
              'Cultural safety assessment'
            ],
            deliverables: [
              'Community needs assessment',
              'Traditional protocol guide',
              'Elder guidance documentation',
              'Cultural safety plan'
            ]
          },
          {
            name: 'Research & Documentation',
            description: 'Document specific barriers and solutions',
            suggestedTimeframe: 90,
            requiredActions: [
              'Collect community stories',
              'Document systemic barriers',
              'Research traditional supports',
              'Analyze intersectional impacts'
            ],
            deliverables: [
              'Community impact report',
              'Barrier analysis document',
              'Traditional support systems guide',
              'Intersectional analysis'
            ]
          },
          {
            name: 'Advocacy Strategy',
            description: 'Develop culturally appropriate advocacy approach',
            suggestedTimeframe: 135,
            requiredActions: [
              'Develop advocacy messaging',
              'Engage government relations',
              'Build Indigenous coalition',
              'Create awareness campaign'
            ],
            deliverables: [
              'Advocacy strategy document',
              'Government engagement plan',
              'Coalition framework',
              'Awareness campaign materials'
            ]
          }
        ],
        accessibilityConsiderations: [
          'All materials in Indigenous languages where appropriate',
          'Traditional ceremony considerations',
          'Elder accessibility needs prioritized',
          'Land-based meeting options',
          'Traditional communication methods respected'
        ],
        culturalSensitivityNotes: [
          'Elder consultation required for all major decisions',
          'Traditional protocols must be observed',
          'Community ownership of process essential',
          'Traditional healing approaches integrated',
          'Ceremonial considerations for gatherings'
        ]
      },
      {
        id: 'transit_accessibility',
        name: 'Public Transit Accessibility Campaign',
        description: 'Improve accessibility of public transportation systems',
        category: 'transportation',
        estimatedDuration: 150,
        requiredResources: [
          'Transit system accessibility audit',
          'User experience documentation',
          'Engineering feasibility studies',
          'Legal compliance analysis'
        ],
        suggestedMilestones: [
          {
            name: 'System Assessment',
            description: 'Comprehensive evaluation of current transit accessibility',
            suggestedTimeframe: 45,
            requiredActions: [
              'Conduct accessibility audits',
              'Map barrier locations',
              'Document user experiences',
              'Analyze compliance gaps'
            ],
            deliverables: [
              'Accessibility audit report',
              'Barrier mapping database',
              'User experience documentation',
              'Compliance gap analysis'
            ]
          }
        ],
        accessibilityConsiderations: [
          'Physical accessibility testing by disabled users',
          'Cognitive accessibility evaluation',
          'Sensory accessibility assessment',
          'Multiple format information provision'
        ]
      }
    ];

    setCampaignTemplates(templates);
  };

  const loadCampaignData = async () => {
    try {
      // In production, this would load from Firestore
      const mockCampaigns = [
        {
          id: '1',
          title: 'Accessible Campus Initiative',
          description: 'Making university campuses fully accessible for all students',
          category: 'education_inclusion',
          status: 'active',
          progress: 0.65,
          goals: [
            { description: 'Install 50 new accessible entrances', target: 50, current: 32 },
            { description: 'Train 200 faculty members', target: 200, current: 145 },
            { description: 'Retrofit 15 laboratories', target: 15, current: 8 }
          ],
          team: ['Sarah Chen', 'Marcus Johnson', 'Dr. Priya Patel'],
          nextMilestone: 'Faculty Training Complete',
          dueDate: new Date('2024-03-15')
        }
      ];
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.title.trim()) {
      Alert.alert('Error', 'Please enter a campaign title');
      return;
    }

    const campaign = {
      id: Date.now().toString(),
      ...newCampaign,
      status: 'planning',
      progress: 0,
      createdAt: new Date(),
      createdBy: user?.uid || 'anonymous',
      team: [user?.displayName || 'Campaign Creator'],
      culturalProtocols: settings.ceremonialConsiderations ? ['Traditional protocols observed'] : [],
      accessibilityPlan: [
        'All materials in multiple formats',
        'Sign language interpretation available',
        'Screen reader compatible documents',
        'Plain language summaries provided'
      ]
    };

    setCampaigns(prev => [...prev, campaign]);
    setNewCampaign({
      title: '',
      description: '',
      category: 'accessibility_rights',
      goals: [],
      startDate: new Date(),
      estimatedEndDate: new Date(),
      budget: 0,
      targetAudience: '',
      primaryFocus: '',
    });
    setShowCreateModal(false);
    Alert.alert('Success', 'Campaign created successfully!');
  };

  const addGoal = () => {
    const newGoal: CampaignGoal = {
      id: Date.now().toString(),
      description: '',
      measurable: false,
      priority: 'medium',
      category: 'awareness'
    };
    setNewCampaign(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  const updateGoal = (goalId: string, updates: Partial<CampaignGoal>) => {
    setNewCampaign(prev => ({
      ...prev,
      goals: prev.goals.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    }));
  };

  const removeGoal = (goalId: string) => {
    setNewCampaign(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal.id !== goalId)
    }));
  };

  const renderTabBar = () => (
    <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {[
        { key: 'overview', label: 'Overview', icon: 'analytics' },
        { key: 'planning', label: 'Planning', icon: 'clipboard' },
        { key: 'execution', label: 'Execution', icon: 'rocket' },
        { key: 'tracking', label: 'Tracking', icon: 'trending-up' }
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
            size={20} 
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

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <A11yTitle level={2} style={[styles.cardTitle, { color: colors.text }]}>
          Campaign Statistics
        </A11yTitle>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{campaigns.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Campaigns</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {campaigns.filter(c => c.status === 'active').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {campaigns.filter(c => c.progress > 0.8).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Near Completion</Text>
          </View>
        </View>
      </View>

      <View style={[styles.campaignsSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <A11yTitle level={2} style={[styles.cardTitle, { color: colors.text }]}>
            Active Campaigns
          </A11yTitle>
          <A11yPressable
            onPress={() => setShowCreateModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Create new campaign"
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={20} color="white" />
          </A11yPressable>
        </View>

        {campaigns.map(campaign => (
          <View key={campaign.id} style={[styles.campaignCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.campaignHeader}>
              <Text style={[styles.campaignTitle, { color: colors.text }]}>{campaign.title}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: campaign.status === 'active' ? colors.success + '20' : colors.warning + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: campaign.status === 'active' ? colors.success : colors.warning }
                ]}>
                  {campaign.status}
                </Text>
              </View>
            </View>

            <Text style={[styles.campaignDescription, { color: colors.textSecondary }]}>
              {campaign.description}
            </Text>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: colors.text }]}>Progress</Text>
                <Text style={[styles.progressPercentage, { color: colors.primary }]}>
                  {Math.round(campaign.progress * 100)}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: colors.primary,
                      width: `${campaign.progress * 100}%`
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.campaignFooter}>
              <Text style={[styles.nextMilestone, { color: colors.textSecondary }]}>
                Next: {campaign.nextMilestone}
              </Text>
              <Text style={[styles.dueDate, { color: campaign.dueDate < new Date() ? colors.error : colors.textSecondary }]}>
                Due: {campaign.dueDate.toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}

        {campaigns.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No campaigns yet. Create your first advocacy campaign!
            </Text>
            <A11yPressable
              onPress={() => setShowCreateModal(true)}
              accessibilityRole="button"
              style={[styles.createFirstButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.createFirstButtonText}>Create Campaign</Text>
            </A11yPressable>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderPlanning = () => (
    <ScrollView style={styles.tabContent}>
      <View style={[styles.templatesSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <A11yTitle level={2} style={[styles.cardTitle, { color: colors.text }]}>
          Campaign Templates
        </A11yTitle>
        <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
          Use proven templates to start your advocacy campaign
        </Text>

        {campaignTemplates.map(template => (
          <View key={template.id} style={[styles.templateCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.templateHeader}>
              <Text style={[styles.templateName, { color: colors.text }]}>{template.name}</Text>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {template.category.replace('_', ' ')}
                </Text>
              </View>
            </View>

            <Text style={[styles.templateDescription, { color: colors.textSecondary }]}>
              {template.description}
            </Text>

            <View style={styles.templateMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {template.estimatedDuration} days
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {template.suggestedMilestones.length} milestones
                </Text>
              </View>
            </View>

            {template.culturalSensitivityNotes && (
              <View style={styles.culturalNotes}>
                <Ionicons name="leaf" size={16} color={colors.warning} />
                <Text style={[styles.culturalNotesText, { color: colors.textSecondary }]}>
                  Cultural considerations included
                </Text>
              </View>
            )}

            <A11yPressable
              onPress={() => {
                setSelectedTemplate(template);
                setShowCreateModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Use ${template.name} template`}
              style={[styles.useTemplateButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.useTemplateButtonText}>Use Template</Text>
            </A11yPressable>
          </View>
        ))}
      </View>
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
            {selectedTemplate ? `Create from Template: ${selectedTemplate.name}` : 'Create New Campaign'}
          </Text>
          <A11yPressable
            onPress={() => {
              setShowCreateModal(false);
              setSelectedTemplate(null);
            }}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </A11yPressable>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formSection}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Campaign Title *</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={newCampaign.title}
              onChangeText={(text) => setNewCampaign(prev => ({ ...prev, title: text }))}
              placeholder="Enter campaign title"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Campaign title"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={newCampaign.description}
              onChangeText={(text) => setNewCampaign(prev => ({ ...prev, description: text }))}
              placeholder="Describe your campaign goals and approach"
              placeholderTextColor={colors.textSecondary}
              multiline={true}
              numberOfLines={4}
              accessibilityLabel="Campaign description"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Category</Text>
            <GapView style={styles.categoryPicker} gap={8}>
              {[
                { value: 'accessibility_rights', label: 'Accessibility Rights' },
                { value: 'employment_equality', label: 'Employment Equality' },
                { value: 'healthcare_access', label: 'Healthcare Access' },
                { value: 'education_inclusion', label: 'Education Inclusion' },
                { value: 'transportation', label: 'Transportation' },
                { value: 'indigenous_disability_rights', label: 'Indigenous Disability Rights' }
              ].map(category => (
                <A11yPressable
                  key={category.value}
                  onPress={() => setNewCampaign(prev => ({ ...prev, category: category.value as CampaignCategory }))}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newCampaign.category === category.value }}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor: newCampaign.category === category.value ? colors.primary + '20' : colors.card,
                      borderColor: newCampaign.category === category.value ? colors.primary : colors.border
                    }
                  ]}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    { color: newCampaign.category === category.value ? colors.primary : colors.text }
                  ]}>
                    {category.label}
                  </Text>
                </A11yPressable>
              ))}
            </GapView>
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionHeaderWithButton}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Campaign Goals</Text>
              <A11yPressable
                onPress={addGoal}
                accessibilityRole="button"
                accessibilityLabel="Add goal"
                style={[styles.addGoalButton, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="add" size={16} color="white" />
              </A11yPressable>
            </View>

            {newCampaign.goals.map((goal, index) => (
              <View key={goal.id} style={[styles.goalItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.goalHeader}>
                  <Text style={[styles.goalNumber, { color: colors.primary }]}>Goal {index + 1}</Text>
                  <A11yPressable
                    onPress={() => removeGoal(goal.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove goal ${index + 1}`}
                    style={styles.removeGoalButton}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </A11yPressable>
                </View>

                <TextInput
                  style={[styles.goalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={goal.description}
                  onChangeText={(text) => updateGoal(goal.id, { description: text })}
                  placeholder="Describe this goal"
                  placeholderTextColor={colors.textSecondary}
                  accessibilityLabel={`Goal ${index + 1} description`}
                />

                <GapView style={styles.goalOptions} gap={12}>
                  <GapView style={styles.prioritySection} gap={12}>
                    <Text style={[styles.optionLabel, { color: colors.text }]}>Priority:</Text>
                    <GapView style={styles.priorityButtons} gap={8}>
                      {['high', 'medium', 'low'].map(priority => (
                        <A11yPressable
                          key={priority}
                          onPress={() => updateGoal(goal.id, { priority: priority as any })}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: goal.priority === priority }}
                          style={[
                            styles.priorityButton,
                            {
                              backgroundColor: goal.priority === priority ? colors.primary + '20' : colors.background,
                              borderColor: goal.priority === priority ? colors.primary : colors.border
                            }
                          ]}
                        >
                          <Text style={[
                            styles.priorityButtonText,
                            { color: goal.priority === priority ? colors.primary : colors.text }
                          ]}>
                            {priority}
                          </Text>
                        </A11yPressable>
                      ))}
                    </GapView>
                  </GapView>
                </GapView>
              </View>
            ))}
          </View>

          {selectedTemplate && selectedTemplate.culturalSensitivityNotes && (
            <View style={[styles.culturalGuidance, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
              <Ionicons name="leaf" size={20} color={colors.warning} />
              <View style={styles.culturalGuidanceContent}>
                <Text style={[styles.culturalGuidanceTitle, { color: colors.warning }]}>
                  Cultural Considerations
                </Text>
                {selectedTemplate.culturalSensitivityNotes.map((note, index) => (
                  <Text key={index} style={[styles.culturalGuidanceText, { color: colors.textSecondary }]}>
                    • {note}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <GapView style={styles.modalFooter} gap={12}>
            <A11yPressable
              onPress={() => {
                setShowCreateModal(false);
                setSelectedTemplate(null);
              }}
              accessibilityRole="button"
              style={[styles.cancelButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </A11yPressable>
            <A11yPressable
              onPress={handleCreateCampaign}
              accessibilityRole="button"
              style={[styles.createButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.createButtonText}>Create Campaign</Text>
            </A11yPressable>
          </GapView>
        </ScrollView>
      </View>
    </Modal>
  );

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
          Campaign Coordinator
        </A11yTitle>
      </View>

      {settings.primaryLanguage && settings.ceremonialConsiderations && (
        <View style={[styles.culturalBanner, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
          <Ionicons name="leaf" size={20} color={colors.warning} />
          <Text style={[styles.culturalBannerText, { color: colors.warning }]}>
            Traditional protocols are being observed in campaign planning
          </Text>
        </View>
      )}

      {renderTabBar()}

      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'planning' && renderPlanning()}
        {activeTab === 'execution' && (
          <ScrollView style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Execution tools coming soon...
            </Text>
          </ScrollView>
        )}
        {activeTab === 'tracking' && (
          <ScrollView style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Tracking dashboard coming soon...
            </Text>
          </ScrollView>
        )}
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
    fontSize: 28,
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  campaignsSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
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
  campaignDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextMilestone: {
    fontSize: 12,
    flex: 1,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  createFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  templatesSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  templateCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
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
  },
  culturalNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  culturalNotesText: {
    fontSize: 12,
    marginLeft: 8,
  },
  useTemplateButton: {
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  useTemplateButtonText: {
    color: 'white',
    fontSize: 14,
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
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryPicker: {
  },
  categoryOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeaderWithButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addGoalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeGoalButton: {
    padding: 4,
  },
  goalInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  goalOptions: {
  },
  prioritySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityButtons: {
    flexDirection: 'row',
  },
  priorityButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
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
    marginBottom: 4,
  },
  modalFooter: {
    flexDirection: 'row',
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