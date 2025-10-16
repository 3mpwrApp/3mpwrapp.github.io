// Enhanced Community Features for Disability Advocacy Networks
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
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
import { A11yTitle, A11yWrapper } from './A11yWrapper';

// Types for enhanced community features
interface AdvocacyGroup {
  id: string;
  name: string;
  description: string;
  category: AdvocacyCategory;
  memberCount: number;
  isPrivate: boolean;
  tags: string[];
  culturalConsiderations?: string[];
  accessibilityFeatures: string[];
  languageSupport: string[];
  lastActivity: Date;
  moderators: string[];
  rules?: string[];
}

interface PeerSupportMatch {
  id: string;
  type: 'mentor' | 'peer' | 'buddy';
  sharedExperiences: string[];
  availabilitySchedule: AvailabilitySlot[];
  communicationPreferences: string[];
  culturalBackground?: string;
  languagePreferences: string[];
  accessibilityNeeds: string[];
  matchScore: number;
  status: 'pending' | 'active' | 'completed';
}

interface AdvocacyCampaign {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  goals: string[];
  milestones: CampaignMilestone[];
  resources: string[];
  collaborators: string[];
  timeline: CampaignTimeline;
  culturalSensitivity: string[];
  accessibilityPlan: string[];
  status: 'planning' | 'active' | 'completed' | 'paused';
}

interface VirtualMeetup {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number; // minutes
  type: 'support_group' | 'workshop' | 'advocacy_planning' | 'social' | 'cultural_ceremony';
  accessibilityFeatures: AccessibilityFeature[];
  languageSupport: string[];
  capacity: number;
  registeredCount: number;
  culturalProtocols?: string[];
  facilitators: string[];
  materials?: string[];
}

type AdvocacyCategory = 
  | 'physical_disabilities'
  | 'neurodivergent'
  | 'chronic_illness'
  | 'mental_health'
  | 'sensory_disabilities'
  | 'intellectual_disabilities'
  | 'invisible_disabilities'
  | 'intersectional'
  | 'indigenous_advocacy'
  | 'youth_advocacy'
  | 'elder_advocacy'
  | 'general_advocacy';

interface AvailabilitySlot {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string;
}

interface CampaignMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  assignees: string[];
}

interface CampaignTimeline {
  startDate: Date;
  endDate: Date;
  phases: CampaignPhase[];
}

interface CampaignPhase {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  objectives: string[];
  deliverables: string[];
}

interface AccessibilityFeature {
  type: 'captions' | 'sign_language' | 'audio_description' | 'screen_reader' | 'large_text' | 'simplified_interface';
  description: string;
  available: boolean;
}

// Enhanced Community Hub Component
export default function EnhancedHubContent() {
  const insets = useSafeAreaInsets();
  // @ts-expect-error - router reserved for future navigation features
  const _router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const { t: _t } = useTranslation();
  const { user: _user } = useAuth();
  const { settings } = useIndigenousLanguage();

  // Create colors object for compatibility
  const colors = {
    text: textColor,
    background: backgroundColor,
    primary: textColor,
    border: textColor + '20',
    card: backgroundColor,
    notification: textColor + '90',
    success: textColor + '70',
    warning: textColor + '60',
    error: textColor + '80',
    surface: backgroundColor,
    accent: textColor + '80',
    textSecondary: textColor + '60'
  };
  
  const [activeTab, setActiveTab] = useState<'groups' | 'peer_support' | 'campaigns' | 'meetups'>('groups');
  const [advocacyGroups, setAdvocacyGroups] = useState<AdvocacyGroup[]>([]);
  const [peerMatches, setPeerMatches] = useState<PeerSupportMatch[]>([]);
  const [campaigns, setCampaigns] = useState<AdvocacyCampaign[]>([]);
  const [meetups, setMeetups] = useState<VirtualMeetup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setIsLoading(true);
      
      // Load mock data (in production, this would come from Firestore)
      const mockGroups: AdvocacyGroup[] = [
        {
          id: '1',
          name: 'Neurodivergent Advocacy Network',
          description: 'Supporting ADHD, autism, and learning difference advocacy',
          category: 'neurodivergent',
          memberCount: 156,
          isPrivate: false,
          tags: ['ADHD', 'autism', 'accessibility', 'workplace'],
          accessibilityFeatures: ['screen_reader', 'simplified_interface', 'audio_description'],
          languageSupport: ['en', 'fr'],
          lastActivity: new Date(),
          moderators: ['mod1', 'mod2'],
          rules: [
            'Respect neurodivergent experiences',
            'Use person-first language when requested',
            'Share resources constructively',
            'Maintain confidentiality'
          ]
        },
        {
          id: '2',
          name: 'Indigenous Disability Rights',
          description: 'Advocating for disability rights within Indigenous communities',
          category: 'indigenous_advocacy',
          memberCount: 89,
          isPrivate: true,
          tags: ['Indigenous', 'cultural_safety', 'traditional_healing'],
          culturalConsiderations: [
            'Elder consultation protocols',
            'Traditional healing respect',
            'Ceremonial considerations'
          ],
          accessibilityFeatures: ['screen_reader', 'large_text', 'captions'],
          languageSupport: ['en', 'cree', 'ojibwe'],
          lastActivity: new Date(),
          moderators: ['elder1', 'advocate1']
        },
        {
          id: '3',
          name: 'Chronic Illness Support Circle',
          description: 'Peer support for invisible and chronic disabilities',
          category: 'chronic_illness',
          memberCount: 234,
          isPrivate: false,
          tags: ['chronic_pain', 'fatigue', 'invisible_disabilities'],
          accessibilityFeatures: ['captions', 'large_text'],
          languageSupport: ['en', 'fr', 'es'],
          lastActivity: new Date(),
          moderators: ['health_advocate1']
        }
      ];

      const mockMatches: PeerSupportMatch[] = [
        {
          id: '1',
          type: 'mentor',
          sharedExperiences: ['ADHD', 'workplace_advocacy', 'education_rights'],
          availabilitySchedule: [
            { dayOfWeek: 2, startTime: '14:00', endTime: '16:00', timezone: 'America/Toronto' },
            { dayOfWeek: 4, startTime: '10:00', endTime: '12:00', timezone: 'America/Toronto' }
          ],
          communicationPreferences: ['video_call', 'chat', 'email'],
          languagePreferences: ['en', 'fr'],
          accessibilityNeeds: ['captions', 'screen_reader'],
          matchScore: 0.92,
          status: 'pending'
        },
        {
          id: '2',
          type: 'peer',
          sharedExperiences: ['chronic_pain', 'housing_advocacy', 'healthcare_navigation'],
          availabilitySchedule: [
            { dayOfWeek: 1, startTime: '19:00', endTime: '21:00', timezone: 'America/Toronto' }
          ],
          communicationPreferences: ['chat', 'phone'],
          culturalBackground: 'Indigenous',
          languagePreferences: ['en', 'cree'],
          accessibilityNeeds: ['large_text'],
          matchScore: 0.87,
          status: 'active'
        }
      ];

      const mockCampaigns: AdvocacyCampaign[] = [
        {
          id: '1',
          title: 'Accessible Transit Campaign',
          description: 'Advocating for improved public transit accessibility across urban areas',
          targetAudience: 'Municipal government, transit authorities',
          goals: [
            'Install audio announcements on all routes',
            'Improve wheelchair accessibility at stations',
            'Implement real-time accessibility status updates'
          ],
          milestones: [
            {
              id: 'm1',
              title: 'Research Phase Complete',
              description: 'Gather accessibility audit data',
              dueDate: new Date('2024-02-15'),
              status: 'completed',
              assignees: ['research_team']
            },
            {
              id: 'm2',
              title: 'Petition Launch',
              description: 'Launch online petition with 1000 signatures goal',
              dueDate: new Date('2024-03-01'),
              status: 'in_progress',
              assignees: ['campaign_lead']
            }
          ],
          resources: ['accessibility_audit.pdf', 'transit_policy_analysis.doc'],
          collaborators: ['transit_advocacy_group', 'disability_rights_org'],
          timeline: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-06-30'),
            phases: [
              {
                id: 'p1',
                name: 'Research & Documentation',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-02-28'),
                objectives: ['Document accessibility gaps', 'Gather user testimonials'],
                deliverables: ['Accessibility report', 'User story collection']
              }
            ]
          },
          culturalSensitivity: ['Include Indigenous community needs', 'Consider rural accessibility'],
          accessibilityPlan: ['All materials in multiple formats', 'Sign language interpretation at events'],
          status: 'active'
        }
      ];

      const mockMeetups: VirtualMeetup[] = [
        {
          id: '1',
          title: 'Neurodivergent Workplace Rights Workshop',
          description: 'Learn about accommodation rights and self-advocacy strategies',
          date: new Date('2024-02-20T19:00:00'),
          duration: 90,
          type: 'workshop',
          accessibilityFeatures: [
            { type: 'captions', description: 'Live captioning available', available: true },
            { type: 'sign_language', description: 'ASL interpretation', available: true },
            { type: 'audio_description', description: 'Visual content described', available: true }
          ],
          languageSupport: ['en', 'fr'],
          capacity: 50,
          registeredCount: 32,
          facilitators: ['workplace_advocate', 'legal_expert'],
          materials: ['rights_guide.pdf', 'accommodation_templates.doc']
        },
        {
          id: '2',
          title: 'Indigenous Healing Circle',
          description: 'Traditional healing practices for holistic wellness',
          date: new Date('2024-02-25T18:00:00'),
          duration: 120,
          type: 'cultural_ceremony',
          accessibilityFeatures: [
            { type: 'audio_description', description: 'Ceremony actions described', available: true },
            { type: 'large_text', description: 'Large text for materials', available: true }
          ],
          languageSupport: ['en', 'cree', 'ojibwe'],
          capacity: 25,
          registeredCount: 18,
          culturalProtocols: [
            'Elder opening and closing',
            'Smudging ceremony (virtual adaptation)',
            'Traditional protocol observations'
          ],
          facilitators: ['elder_marie', 'traditional_healer']
        }
      ];

      setAdvocacyGroups(mockGroups);
      setPeerMatches(mockMatches);
      setCampaigns(mockCampaigns);
      setMeetups(mockMeetups);
      
    } catch (error) {
      console.error('Error loading community data:', error);
      Alert.alert('Error', 'Failed to load community data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleJoinGroup = (_groupId: string) => {
    Alert.alert(
      'Join Group',
      'Would you like to join this advocacy group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          onPress: () => {
            // In production, this would update Firestore
            Alert.alert('Success', 'You have joined the group!');
          }
        }
      ]
    );
  };

  const handleAcceptMatch = (matchId: string) => {
    Alert.alert(
      'Accept Peer Match',
      'Would you like to connect with this peer supporter?',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            setPeerMatches(prev => 
              prev.map(match => 
                match.id === matchId 
                  ? { ...match, status: 'active' as const }
                  : match
              )
            );
            Alert.alert('Success', 'Peer connection established! Check your messages for contact details.');
          }
        }
      ]
    );
  };

  const handleRegisterMeetup = (meetupId: string) => {
    const meetup = meetups.find(m => m.id === meetupId);
    if (!meetup) return;

    if (meetup.registeredCount >= meetup.capacity) {
      Alert.alert('Full', 'This meetup is at capacity. You can join the waitlist.');
      return;
    }

    Alert.alert(
      'Register for Meetup',
      `Register for "${meetup.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Register', 
          onPress: () => {
            setMeetups(prev => 
              prev.map(m => 
                m.id === meetupId 
                  ? { ...m, registeredCount: m.registeredCount + 1 }
                  : m
              )
            );
            Alert.alert('Registered', 'You are registered for this meetup. Check your email for details.');
          }
        }
      ]
    );
  };

  const renderTabBar = () => (
    <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {[
        { key: 'groups', label: 'Groups', icon: 'people' },
        { key: 'peer_support', label: 'Peer Support', icon: 'heart' },
        { key: 'campaigns', label: 'Campaigns', icon: 'megaphone' },
        { key: 'meetups', label: 'Meetups', icon: 'calendar' }
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

  const renderAdvocacyGroups = () => (
    <FlatList
      data={advocacyGroups}
      keyExtractor={item => item.id}
      renderItem={({ item: group }) => (
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.groupHeader}>
            <View style={styles.groupInfo}>
              <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
              <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>
                {group.description}
              </Text>
              <View style={styles.groupMeta}>
                <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
                  {group.memberCount} members
                </Text>
                {group.isPrivate && (
                  <View style={[styles.privateBadge, { backgroundColor: colors.warning + '20' }]}>
                    <Ionicons name="lock-closed" size={12} color={colors.warning} />
                    <Text style={[styles.privateBadgeText, { color: colors.warning }]}>Private</Text>
                  </View>
                )}
              </View>
            </View>
            <A11yPressable
              onPress={() => handleJoinGroup(group.id)}
              accessibilityRole="button"
              accessibilityLabel={`Join ${group.name}`}
              style={[styles.joinButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.joinButtonText}>Join</Text>
            </A11yPressable>
          </View>
          
          <View style={styles.groupTags}>
            {group.tags.map(tag => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>

          {group.culturalConsiderations && group.culturalConsiderations.length > 0 && (
            <View style={styles.culturalNote}>
              <Ionicons name="leaf" size={16} color={colors.success} />
              <Text style={[styles.culturalNoteText, { color: colors.textSecondary }]}>
                Cultural protocols observed
              </Text>
            </View>
          )}

          <View style={styles.accessibilityIndicators}>
            {group.accessibilityFeatures.map(feature => (
              <View key={feature} style={styles.accessibilityBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={[styles.accessibilityText, { color: colors.success }]}>
                  {feature.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No advocacy groups found. Create the first one!
        </Text>
      }
    />
  );

  const renderPeerSupport = () => (
    <View>
      <View style={[styles.sectionHeader, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Matches</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Based on shared experiences and availability
        </Text>
      </View>
      
      <FlatList
        data={peerMatches}
        keyExtractor={item => item.id}
        renderItem={({ item: match }) => (
          <View style={[styles.matchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.matchHeader}>
              <View style={styles.matchType}>
                <Ionicons 
                  name={match.type === 'mentor' ? 'school' : match.type === 'peer' ? 'people' : 'heart'} 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={[styles.matchTypeText, { color: colors.primary }]}>
                  {match.type.charAt(0).toUpperCase() + match.type.slice(1)}
                </Text>
              </View>
              <View style={styles.matchScore}>
                <Text style={[styles.matchScoreText, { color: colors.success }]}>
                  {Math.round(match.matchScore * 100)}% match
                </Text>
              </View>
            </View>

            <View style={styles.sharedExperiences}>
              <Text style={[styles.experiencesLabel, { color: colors.text }]}>Shared experiences:</Text>
              <View style={styles.experiencesTags}>
                {match.sharedExperiences.map(exp => (
                  <View key={exp} style={[styles.experienceTag, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.experienceTagText, { color: colors.primary }]}>
                      {exp.replace('_', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {match.culturalBackground && (
              <View style={styles.culturalMatch}>
                <Ionicons name="leaf" size={16} color={colors.success} />
                <Text style={[styles.culturalMatchText, { color: colors.textSecondary }]}>
                  Cultural background: {match.culturalBackground}
                </Text>
              </View>
            )}

            <View style={styles.matchActions}>
              <A11yPressable
                onPress={() => handleAcceptMatch(match.id)}
                accessibilityRole="button"
                accessibilityLabel="Accept this peer match"
                style={[styles.acceptButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.acceptButtonText}>Connect</Text>
              </A11yPressable>
              <A11yPressable
                onPress={() => {/* Handle maybe later */}}
                accessibilityRole="button"
                accessibilityLabel="Maybe later"
                style={[styles.maybeButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.maybeButtonText, { color: colors.textSecondary }]}>
                  Maybe Later
                </Text>
              </A11yPressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No peer matches available. Update your profile to find connections.
          </Text>
        }
      />
    </View>
  );

  const renderCampaigns = () => (
    <FlatList
      data={campaigns}
      keyExtractor={item => item.id}
      renderItem={({ item: campaign }) => (
        <View style={[styles.campaignCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

          <View style={styles.campaignGoals}>
            <Text style={[styles.goalsLabel, { color: colors.text }]}>Goals:</Text>
            {campaign.goals.slice(0, 2).map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                <Text style={[styles.goalText, { color: colors.textSecondary }]}>{goal}</Text>
              </View>
            ))}
            {campaign.goals.length > 2 && (
              <Text style={[styles.moreGoals, { color: colors.textSecondary }]}>
                +{campaign.goals.length - 2} more goals
              </Text>
            )}
          </View>

          <View style={styles.campaignMeta}>
            <View style={styles.collaborators}>
              <Ionicons name="people" size={16} color={colors.textSecondary} />
              <Text style={[styles.collaboratorsText, { color: colors.textSecondary }]}>
                {campaign.collaborators.length} collaborators
              </Text>
            </View>
            <A11yPressable
              onPress={() => {/* Handle campaign details */}}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${campaign.title}`}
              style={[styles.detailsButton, { borderColor: colors.primary }]}
            >
              <Text style={[styles.detailsButtonText, { color: colors.primary }]}>Details</Text>
            </A11yPressable>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No active campaigns. Start a new advocacy campaign!
        </Text>
      }
    />
  );

  const renderMeetups = () => (
    <FlatList
      data={meetups}
      keyExtractor={item => item.id}
      renderItem={({ item: meetup }) => (
        <View style={[styles.meetupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.meetupHeader}>
            <Text style={[styles.meetupTitle, { color: colors.text }]}>{meetup.title}</Text>
            <View style={[styles.meetupType, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.meetupTypeText, { color: colors.primary }]}>
                {meetup.type.replace('_', ' ')}
              </Text>
            </View>
          </View>

          <Text style={[styles.meetupDescription, { color: colors.textSecondary }]}>
            {meetup.description}
          </Text>

          <View style={styles.meetupDetails}>
            <View style={styles.meetupTime}>
              <Ionicons name="time" size={16} color={colors.textSecondary} />
              <Text style={[styles.meetupTimeText, { color: colors.textSecondary }]}>
                {meetup.date.toLocaleDateString()} at {meetup.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.meetupDuration}>
              <Ionicons name="hourglass" size={16} color={colors.textSecondary} />
              <Text style={[styles.meetupDurationText, { color: colors.textSecondary }]}>
                {meetup.duration} minutes
              </Text>
            </View>
          </View>

          <View style={styles.accessibilityFeatures}>
            {meetup.accessibilityFeatures.filter(f => f.available).map(feature => (
              <View key={feature.type} style={styles.featureBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={[styles.featureText, { color: colors.success }]}>
                  {feature.type.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>

          {meetup.culturalProtocols && meetup.culturalProtocols.length > 0 && (
            <View style={styles.culturalProtocols}>
              <Ionicons name="leaf" size={16} color={colors.warning} />
              <Text style={[styles.culturalProtocolsText, { color: colors.textSecondary }]}>
                Traditional protocols observed
              </Text>
            </View>
          )}

          <View style={styles.meetupFooter}>
            <Text style={[styles.capacityText, { color: colors.textSecondary }]}>
              {meetup.registeredCount}/{meetup.capacity} registered
            </Text>
            <A11yPressable
              onPress={() => handleRegisterMeetup(meetup.id)}
              accessibilityRole="button"
              accessibilityLabel={`Register for ${meetup.title}`}
              style={[
                styles.registerButton, 
                { backgroundColor: meetup.registeredCount >= meetup.capacity ? colors.border : colors.primary }
              ]}
              disabled={meetup.registeredCount >= meetup.capacity}
            >
              <Text style={[
                styles.registerButtonText,
                { color: meetup.registeredCount >= meetup.capacity ? colors.textSecondary : 'white' }
              ]}>
                {meetup.registeredCount >= meetup.capacity ? 'Full' : 'Register'}
              </Text>
            </A11yPressable>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No upcoming meetups. Create one to bring the community together!
        </Text>
      }
    />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'groups':
        return renderAdvocacyGroups();
      case 'peer_support':
        return renderPeerSupport();
      case 'campaigns':
        return renderCampaigns();
      case 'meetups':
        return renderMeetups();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <A11yWrapper style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading community features...
          </Text>
        </View>
      </A11yWrapper>
    );
  }

  return (
    <A11yWrapper style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <A11yTitle level={1} style={[styles.title, { color: colors.text }]}>
          Community Hub
        </A11yTitle>
        <A11yPressable
          onPress={handleCreateNew}
          accessibilityRole="button"
          accessibilityLabel="Create new community content"
          style={[styles.createButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={24} color="white" />
        </A11yPressable>
      </View>

      {settings.primaryLanguage && settings.ceremonialConsiderations && (
        <View style={[styles.culturalBanner, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
          <Ionicons name="leaf" size={20} color={colors.warning} />
          <Text style={[styles.culturalBannerText, { color: colors.warning }]}>
            Cultural protocols active - Traditional ceremonies and protocols are being observed
          </Text>
        </View>
      )}

      {renderTabBar()}
      
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Create Modal would be implemented here */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create New</Text>
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
            <A11yPressable
              onPress={() => {/* Handle create group */}}
              accessibilityRole="button"
              style={[styles.createOption, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="people" size={24} color={colors.primary} />
              <View style={styles.createOptionText}>
                <Text style={[styles.createOptionTitle, { color: colors.text }]}>Advocacy Group</Text>
                <Text style={[styles.createOptionDescription, { color: colors.textSecondary }]}>
                  Create a focused advocacy group
                </Text>
              </View>
            </A11yPressable>

            <A11yPressable
              onPress={() => {/* Handle create campaign */}}
              accessibilityRole="button"
              style={[styles.createOption, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="megaphone" size={24} color={colors.primary} />
              <View style={styles.createOptionText}>
                <Text style={[styles.createOptionTitle, { color: colors.text }]}>Campaign</Text>
                <Text style={[styles.createOptionDescription, { color: colors.textSecondary }]}>
                  Launch an advocacy campaign
                </Text>
              </View>
            </A11yPressable>

            <A11yPressable
              onPress={() => {/* Handle create meetup */}}
              accessibilityRole="button"
              style={[styles.createOption, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <View style={styles.createOptionText}>
                <Text style={[styles.createOptionTitle, { color: colors.text }]}>Virtual Meetup</Text>
                <Text style={[styles.createOptionDescription, { color: colors.textSecondary }]}>
                  Host a virtual community meetup
                </Text>
              </View>
            </A11yPressable>
          </ScrollView>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  // Group styles
  groupCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
    marginRight: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    marginRight: 12,
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  privateBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  groupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  culturalNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  culturalNoteText: {
    fontSize: 12,
    marginLeft: 8,
  },
  accessibilityIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  accessibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  accessibilityText: {
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  // Peer support styles
  sectionHeader: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  matchCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchTypeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  matchScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchScoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sharedExperiences: {
    marginBottom: 12,
  },
  experiencesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  experiencesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  experienceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  experienceTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  culturalMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  culturalMatchText: {
    fontSize: 12,
    marginLeft: 8,
  },
  matchActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  maybeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  maybeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Campaign styles
  campaignCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  campaignTitle: {
    fontSize: 18,
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
  campaignGoals: {
    marginBottom: 12,
  },
  goalsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  moreGoals: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  campaignMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collaborators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collaboratorsText: {
    fontSize: 12,
    marginLeft: 8,
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Meetup styles
  meetupCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  meetupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  meetupType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  meetupTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  meetupDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  meetupDetails: {
    marginBottom: 12,
  },
  meetupTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  meetupTimeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  meetupDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetupDurationText: {
    fontSize: 14,
    marginLeft: 8,
  },
  accessibilityFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  culturalProtocols: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  culturalProtocolsText: {
    fontSize: 12,
    marginLeft: 8,
  },
  meetupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 12,
  },
  registerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  createOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  createOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  createOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  createOptionDescription: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
});
