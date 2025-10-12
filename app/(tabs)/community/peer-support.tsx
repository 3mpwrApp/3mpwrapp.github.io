// Peer Support Matching System
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import A11yPressable from '../../../components/A11yPressable';
import { A11yTitle, A11yWrapper } from '../../../components/A11yWrapper';
import { useAuth } from '../../../context/AuthContext';
import { useIndigenousLanguage } from '../../../context/IndigenousLanguageContext';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { useTranslation } from '../../../i18n';

interface PeerProfile {
  id: string;
  userId: string;
  displayName: string;
  profileType: 'mentor' | 'peer' | 'mentee' | 'support_seeker';
  disabilities: DisabilityType[];
  experiences: ExperienceCategory[];
  availabilityHours: AvailabilitySlot[];
  communicationPreferences: CommunicationMethod[];
  languagePreferences: string[];
  culturalBackground?: string;
  accessibilityNeeds: string[];
  supportAreas: SupportArea[];
  ageRange: AgeRange;
  location: LocationPreference;
  bio: string;
  isActive: boolean;
  lastActive: Date;
  matchingPreferences: MatchingPreferences;
  safetyPreferences: SafetyPreferences;
  createdAt: Date;
  rating?: number;
  totalConnections: number;
  successfulMatches: number;
}

interface PeerMatch {
  id: string;
  seekerId: string;
  supporterId: string;
  matchScore: number;
  matchReasons: string[];
  sharedExperiences: string[];
  compatibilityFactors: CompatibilityFactor[];
  status: MatchStatus;
  createdAt: Date;
  acceptedAt?: Date;
  firstMeetingAt?: Date;
  completedAt?: Date;
  feedback?: MatchFeedback;
  communicationLog: CommunicationEntry[];
  culturalConsiderations?: string[];
  safetyNotes?: string[];
}

interface AvailabilitySlot {
  dayOfWeek: number; // 0 = Sunday
  startTime: string; // HH:MM format
  endTime: string;
  timezone: string;
  isFlexible: boolean;
}

interface MatchingPreferences {
  preferredGenderIdentity?: string[];
  preferredAgeRange?: AgeRange;
  preferredExperienceLevel: 'new' | 'some' | 'experienced' | 'any';
  maxTravelDistance?: number; // in km for in-person meetings
  preferredMeetingTypes: ('virtual' | 'in_person' | 'phone' | 'text')[];
  culturalMatching: boolean;
  languageMatching: boolean;
  avoidPreviousConnections: boolean;
}

interface SafetyPreferences {
  requireVerification: boolean;
  allowPhotoSharing: boolean;
  requireReferences: boolean;
  backgroundCheckConsent: boolean;
  emergencyContactRequired: boolean;
  reportingComfort: 'low' | 'medium' | 'high';
  blockList: string[];
}

interface CompatibilityFactor {
  factor: string;
  weight: number; // 0-1
  description: string;
}

interface MatchFeedback {
  rating: number; // 1-5
  helpful: boolean;
  safe: boolean;
  wouldRecommend: boolean;
  comments?: string;
  reportIssues?: string;
}

interface CommunicationEntry {
  id: string;
  type: 'message' | 'call' | 'meeting' | 'email';
  timestamp: Date;
  initiator: string;
  duration?: number; // minutes
  notes?: string;
  mood?: 'positive' | 'neutral' | 'concerning';
}

type DisabilityType = 
  | 'physical'
  | 'visual'
  | 'hearing'
  | 'cognitive'
  | 'neurodivergent'
  | 'mental_health'
  | 'chronic_illness'
  | 'learning'
  | 'invisible'
  | 'multiple';

type ExperienceCategory =
  | 'diagnosis_navigation'
  | 'workplace_advocacy'
  | 'education_accommodation'
  | 'healthcare_navigation'
  | 'benefits_application'
  | 'legal_advocacy'
  | 'technology_adaptation'
  | 'independent_living'
  | 'relationships'
  | 'family_advocacy'
  | 'career_development'
  | 'self_advocacy'
  | 'community_building'
  | 'cultural_navigation';

type SupportArea =
  | 'emotional_support'
  | 'practical_advice'
  | 'advocacy_guidance'
  | 'resource_sharing'
  | 'skill_development'
  | 'goal_setting'
  | 'crisis_support'
  | 'celebration_sharing';

type CommunicationMethod =
  | 'video_call'
  | 'voice_call'
  | 'text_chat'
  | 'email'
  | 'in_person'
  | 'written_letters'
  | 'sign_language'
  | 'assistive_technology';

type AgeRange = '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';

type LocationPreference = {
  type: 'local' | 'regional' | 'national' | 'global';
  maxDistance?: number;
  timezone?: string;
  preferredRegions?: string[];
};

type MatchStatus = 
  | 'pending'
  | 'accepted'
  | 'active'
  | 'completed'
  | 'declined'
  | 'paused'
  | 'ended'
  | 'reported';

export default function PeerSupportMatching() {
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

  const [activeTab, setActiveTab] = useState<'matches' | 'profile' | 'connections' | 'safety'>('matches');
  const [userProfile, setUserProfile] = useState<PeerProfile | null>(null);
  const [availableMatches, setAvailableMatches] = useState<PeerMatch[]>([]);
  const [activeConnections, setActiveConnections] = useState<PeerMatch[]>([]);
  const [_showProfileModal, _setShowProfileModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
    loadMatches();
  }, []);

  const loadUserProfile = async () => {
    try {
      // In production, load from Firestore/user preferences
      const mockProfile: PeerProfile = {
        id: '1',
        userId: user?.uid || 'current_user',
        displayName: user?.displayName || 'Anonymous User',
        profileType: 'peer',
        disabilities: ['neurodivergent', 'chronic_illness'],
        experiences: ['workplace_advocacy', 'healthcare_navigation', 'self_advocacy'],
        availabilityHours: [
          {
            dayOfWeek: 2, // Tuesday
            startTime: '19:00',
            endTime: '21:00',
            timezone: 'America/Toronto',
            isFlexible: true
          },
          {
            dayOfWeek: 6, // Saturday
            startTime: '10:00',
            endTime: '12:00',
            timezone: 'America/Toronto',
            isFlexible: false
          }
        ],
        communicationPreferences: ['video_call', 'text_chat', 'email'],
        languagePreferences: ['en', 'fr'],
        accessibilityNeeds: ['captions', 'screen_reader'],
        supportAreas: ['emotional_support', 'practical_advice', 'resource_sharing'],
        ageRange: '26-35',
        location: {
          type: 'regional',
          maxDistance: 100,
          timezone: 'America/Toronto'
        },
        bio: 'Experienced in workplace advocacy and healthcare navigation. Happy to share resources and provide emotional support.',
        isActive: true,
        lastActive: new Date(),
        matchingPreferences: {
          preferredExperienceLevel: 'any',
          preferredMeetingTypes: ['virtual', 'phone'],
          culturalMatching: false,
          languageMatching: true,
          avoidPreviousConnections: true
        },
        safetyPreferences: {
          requireVerification: true,
          allowPhotoSharing: false,
          requireReferences: false,
          backgroundCheckConsent: false,
          emergencyContactRequired: true,
          reportingComfort: 'high',
          blockList: []
        },
        createdAt: new Date('2024-01-15'),
        rating: 4.8,
        totalConnections: 12,
        successfulMatches: 10
      };

      if (settings.primaryLanguage && settings.communityCenteredApproach) {
        mockProfile.culturalBackground = 'Indigenous';
        mockProfile.languagePreferences.push(settings.primaryLanguage);
      }

      setUserProfile(mockProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadMatches = async () => {
    try {
      setIsLoading(true);

      // Mock matches (in production, from matching algorithm)
      const mockMatches: PeerMatch[] = [
        {
          id: '1',
          seekerId: user?.uid || 'current_user',
          supporterId: 'supporter_1',
          matchScore: 0.94,
          matchReasons: [
            'Shared experience with ADHD advocacy',
            'Both prefer virtual meetings',
            'Similar availability schedule',
            'Language compatibility'
          ],
          sharedExperiences: ['workplace_advocacy', 'self_advocacy'],
          compatibilityFactors: [
            { factor: 'Experience overlap', weight: 0.8, description: 'Both experienced in workplace advocacy' },
            { factor: 'Communication style', weight: 0.9, description: 'Both prefer structured, supportive communication' },
            { factor: 'Availability match', weight: 0.7, description: 'Overlapping availability on weekday evenings' },
            { factor: 'Accessibility needs', weight: 0.95, description: 'Both use captions and screen readers' }
          ],
          status: 'pending',
          createdAt: new Date('2024-02-10'),
          communicationLog: [],
          culturalConsiderations: settings.primaryLanguage ? ['Traditional protocols respected', 'Elder guidance available'] : undefined
        },
        {
          id: '2',
          seekerId: user?.uid || 'current_user',
          supporterId: 'supporter_2',
          matchScore: 0.87,
          matchReasons: [
            'Shared chronic illness experience',
            'Both value emotional support',
            'Compatible time zones',
            'Similar age range'
          ],
          sharedExperiences: ['healthcare_navigation', 'chronic_illness'],
          compatibilityFactors: [
            { factor: 'Health condition overlap', weight: 0.9, description: 'Both navigate chronic health conditions' },
            { factor: 'Support style', weight: 0.8, description: 'Both value emotional and practical support' },
            { factor: 'Age compatibility', weight: 0.6, description: 'Similar life stage and experiences' }
          ],
          status: 'pending',
          createdAt: new Date('2024-02-12'),
          communicationLog: []
        }
      ];

      const mockActiveConnections: PeerMatch[] = [
        {
          id: '3',
          seekerId: user?.uid || 'current_user',
          supporterId: 'supporter_3',
          matchScore: 0.91,
          matchReasons: ['Successful previous connection', 'Ongoing support relationship'],
          sharedExperiences: ['family_advocacy', 'education_accommodation'],
          compatibilityFactors: [
            { factor: 'Trust established', weight: 1.0, description: 'Successful 6-month support relationship' },
            { factor: 'Goal alignment', weight: 0.9, description: 'Both working on family advocacy skills' }
          ],
          status: 'active',
          createdAt: new Date('2023-08-15'),
          acceptedAt: new Date('2023-08-16'),
          firstMeetingAt: new Date('2023-08-20'),
          communicationLog: [
            {
              id: 'c1',
              type: 'meeting',
              timestamp: new Date('2024-02-08'),
              initiator: 'supporter_3',
              duration: 60,
              mood: 'positive',
              notes: 'Discussed upcoming IEP meeting preparation'
            },
            {
              id: 'c2',
              type: 'message',
              timestamp: new Date('2024-02-10'),
              initiator: user?.uid || 'current_user',
              mood: 'positive',
              notes: 'Shared resources for advocacy training'
            }
          ]
        }
      ];

      setAvailableMatches(mockMatches);
      setActiveConnections(mockActiveConnections);

    } catch (error) {
      console.error('Error loading matches:', error);
      Alert.alert('Error', 'Failed to load peer matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptMatch = (matchId: string) => {
    const match = availableMatches.find(m => m.id === matchId);
    if (!match) return;

    Alert.alert(
      'Accept Peer Match',
      `Connect with this peer supporter? You'll be able to start communicating and schedule meetings.`,
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            // Update match status
            const updatedMatch = {
              ...match,
              status: 'accepted' as MatchStatus,
              acceptedAt: new Date()
            };

            setAvailableMatches(prev => prev.filter(m => m.id !== matchId));
            setActiveConnections(prev => [...prev, updatedMatch]);

            Alert.alert(
              'Connection Established!',
              'You can now communicate with your peer supporter. Check the Connections tab to start chatting.',
              [{ text: 'Great!', style: 'default' }]
            );
          }
        }
      ]
    );
  };

  const handleDeclineMatch = (matchId: string) => {
    Alert.alert(
      'Decline Match',
      'This will remove this match from your suggestions. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Decline', 
          style: 'destructive',
          onPress: () => {
            setAvailableMatches(prev => prev.filter(m => m.id !== matchId));
            Alert.alert('Match Declined', 'This peer supporter has been removed from your suggestions.');
          }
        }
      ]
    );
  };

  const handleStartConversation = (_connectionId: string) => {
    Alert.alert(
      'Start Conversation',
      'Open communication with your peer supporter?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Chat', 
          onPress: () => {
            // In production, navigate to chat screen
            Alert.alert('Chat Opening', 'Chat feature would open here in the full app.');
          }
        }
      ]
    );
  };

  const renderTabBar = () => (
    <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {[
        { key: 'matches', label: 'Matches', icon: 'people' },
        { key: 'connections', label: 'Active', icon: 'chatbubbles' },
        { key: 'profile', label: 'Profile', icon: 'person' },
        { key: 'safety', label: 'Safety', icon: 'shield-checkmark' }
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

  const renderMatches = () => (
    <ScrollView style={styles.tabContent}>
      <View style={[styles.sectionHeader, { backgroundColor: colors.card }]}>
        <A11yTitle level={2} style={[styles.sectionTitle, { color: colors.text }]}>
          Recommended Peer Supporters
        </A11yTitle>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Based on shared experiences and compatibility
        </Text>
      </View>

      {availableMatches.map(match => (
        <View key={match.id} style={[styles.matchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.matchHeader}>
            <View style={styles.matchScore}>
              <Text style={[styles.matchScoreText, { color: colors.success }]}>
                {Math.round(match.matchScore * 100)}% match
              </Text>
            </View>
            <View style={styles.matchActions}>
              <A11yPressable
                onPress={() => handleDeclineMatch(match.id)}
                accessibilityRole="button"
                accessibilityLabel="Decline this match"
                style={[styles.declineButton, { borderColor: colors.border }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </A11yPressable>
              <A11yPressable
                onPress={() => handleAcceptMatch(match.id)}
                accessibilityRole="button"
                accessibilityLabel="Accept this match"
                style={[styles.acceptButton, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="checkmark" size={20} color="white" />
              </A11yPressable>
            </View>
          </View>

          <View style={styles.matchReasons}>
            <Text style={[styles.reasonsTitle, { color: colors.text }]}>Why this is a good match:</Text>
            {match.matchReasons.map((reason, index) => (
              <View key={index} style={styles.reasonItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[styles.reasonText, { color: colors.textSecondary }]}>{reason}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sharedExperiences}>
            <Text style={[styles.experiencesTitle, { color: colors.text }]}>Shared experiences:</Text>
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

          {match.culturalConsiderations && (
            <View style={styles.culturalNotes}>
              <Ionicons name="leaf" size={16} color={colors.warning} />
              <Text style={[styles.culturalNotesText, { color: colors.textSecondary }]}>
                Cultural protocols will be observed
              </Text>
            </View>
          )}

          <View style={styles.compatibilityFactors}>
            <Text style={[styles.factorsTitle, { color: colors.text }]}>Compatibility details:</Text>
            {match.compatibilityFactors.slice(0, 2).map((factor, index) => (
              <View key={index} style={styles.factorItem}>
                <View style={styles.factorHeader}>
                  <Text style={[styles.factorName, { color: colors.text }]}>{factor.factor}</Text>
                  <View style={[styles.factorScore, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.factorScoreText, { color: colors.success }]}>
                      {Math.round(factor.weight * 100)}%
                    </Text>
                  </View>
                </View>
                <Text style={[styles.factorDescription, { color: colors.textSecondary }]}>
                  {factor.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      {availableMatches.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No matches available right now. Complete your profile to find better matches!
          </Text>
          <A11yPressable
            onPress={() => setActiveTab('profile')}
            accessibilityRole="button"
            style={[styles.completeProfileButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.completeProfileButtonText}>Complete Profile</Text>
          </A11yPressable>
        </View>
      )}
    </ScrollView>
  );

  const renderConnections = () => (
    <ScrollView style={styles.tabContent}>
      <View style={[styles.sectionHeader, { backgroundColor: colors.card }]}>
        <A11yTitle level={2} style={[styles.sectionTitle, { color: colors.text }]}>
          Active Connections
        </A11yTitle>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Your ongoing peer support relationships
        </Text>
      </View>

      {activeConnections.map(connection => (
        <View key={connection.id} style={[styles.connectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.connectionHeader}>
            <View style={styles.connectionInfo}>
              <Text style={[styles.connectionTitle, { color: colors.text }]}>
                Peer Support Connection
              </Text>
              <Text style={[styles.connectionDate, { color: colors.textSecondary }]}>
                Connected {connection.acceptedAt?.toLocaleDateString()}
              </Text>
            </View>
            <View style={[styles.connectionStatus, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.connectionStatusText, { color: colors.success }]}>
                Active
              </Text>
            </View>
          </View>

          <View style={styles.connectionStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {connection.communicationLog.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Conversations
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {connection.communicationLog.filter(c => c.type === 'meeting').length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Meetings
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {Math.ceil((new Date().getTime() - (connection.acceptedAt?.getTime() || 0)) / (1000 * 60 * 60 * 24 * 7))}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Weeks
              </Text>
            </View>
          </View>

          <View style={styles.recentActivity}>
            <Text style={[styles.activityTitle, { color: colors.text }]}>Recent activity:</Text>
            {connection.communicationLog.slice(-2).map(entry => (
              <View key={entry.id} style={styles.activityItem}>
                <Ionicons 
                  name={entry.type === 'meeting' ? 'videocam' : 'chatbubble'} 
                  size={16} 
                  color={colors.primary} 
                />
                <Text style={[styles.activityText, { color: colors.textSecondary }]}>
                  {entry.type === 'meeting' ? 'Video meeting' : 'Message'} - {entry.timestamp.toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.connectionActions}>
            <A11yPressable
              onPress={() => handleStartConversation(connection.id)}
              accessibilityRole="button"
              style={[styles.chatButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="chatbubbles" size={20} color="white" />
              <Text style={styles.chatButtonText}>Chat</Text>
            </A11yPressable>
            <A11yPressable
              onPress={() => {/* Handle schedule meeting */}}
              accessibilityRole="button"
              style={[styles.meetButton, { borderColor: colors.primary }]}
            >
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.meetButtonText, { color: colors.primary }]}>Schedule</Text>
            </A11yPressable>
          </View>
        </View>
      ))}

      {activeConnections.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No active connections yet. Accept some matches to start building your support network!
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView style={styles.tabContent}>
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.profileHeader}>
          <Text style={[styles.profileTitle, { color: colors.text }]}>Peer Support Profile</Text>
          <A11yPressable
            onPress={() => _setShowProfileModal(true)}
            accessibilityRole="button"
            style={[styles.editButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="create" size={20} color="white" />
          </A11yPressable>
        </View>

        {userProfile && (
          <>
            <View style={styles.profileSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
              <Text style={[styles.profileBio, { color: colors.textSecondary }]}>
                {userProfile.bio}
              </Text>
            </View>

            <View style={styles.profileSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Support Areas</Text>
              <View style={styles.tagContainer}>
                {userProfile.supportAreas.map(area => (
                  <View key={area} style={[styles.profileTag, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.profileTagText, { color: colors.primary }]}>
                      {area.replace('_', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.profileSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Experiences</Text>
              <View style={styles.tagContainer}>
                {userProfile.experiences.map(exp => (
                  <View key={exp} style={[styles.profileTag, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.profileTagText, { color: colors.success }]}>
                      {exp.replace('_', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.profileSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Availability</Text>
              {userProfile.availabilityHours.map((slot, index) => (
                <View key={index} style={styles.availabilitySlot}>
                  <Text style={[styles.availabilityDay, { color: colors.text }]}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][slot.dayOfWeek]}
                  </Text>
                  <Text style={[styles.availabilityTime, { color: colors.textSecondary }]}>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                  {slot.isFlexible && (
                    <Text style={[styles.flexibleTag, { color: colors.warning }]}>Flexible</Text>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {userProfile.rating?.toFixed(1) || 'New'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {userProfile.totalConnections}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Connections</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {userProfile.successfulMatches}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Successful</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );

  const renderSafety = () => (
    <ScrollView style={styles.tabContent}>
      <View style={[styles.safetyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.safetyHeader}>
          <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          <Text style={[styles.safetyTitle, { color: colors.text }]}>Safety & Privacy</Text>
        </View>

        <Text style={[styles.safetyDescription, { color: colors.textSecondary }]}>
          Your safety is our priority. Here are the protections in place:
        </Text>

        <View style={styles.safetyFeatures}>
          {[
            {
              icon: 'checkmark-circle',
              title: 'Identity Verification',
              description: 'All peer supporters go through identity verification',
              active: true
            },
            {
              icon: 'eye-off',
              title: 'Privacy Controls',
              description: 'You control what information you share',
              active: true
            },
            {
              icon: 'shield',
              title: 'Report System',
              description: 'Easy reporting for any safety concerns',
              active: true
            },
            {
              icon: 'people',
              title: 'Moderated Platform',
              description: 'Community guidelines enforced by trained moderators',
              active: true
            },
            {
              icon: 'phone',
              title: 'Crisis Support',
              description: '24/7 crisis hotline available if needed',
              active: true
            }
          ].map((feature, index) => (
            <View key={index} style={styles.safetyFeature}>
              <Ionicons 
                name={feature.icon as any} 
                size={20} 
                color={feature.active ? colors.success : colors.textSecondary} 
              />
              <View style={styles.safetyFeatureContent}>
                <Text style={[styles.safetyFeatureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.safetyFeatureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.emergencySection}>
          <Text style={[styles.emergencyTitle, { color: colors.error }]}>
            In Case of Emergency
          </Text>
          <Text style={[styles.emergencyText, { color: colors.textSecondary }]}>
            If you're in immediate danger, contact emergency services (911).
            For mental health crises, contact the Crisis Hotline: 1-833-456-4566
          </Text>
          <A11yPressable
            onPress={() => Alert.alert('Crisis Resources', 'Crisis support resources would be displayed here.')}
            accessibilityRole="button"
            style={[styles.crisisButton, { backgroundColor: colors.error }]}
          >
            <Ionicons name="call" size={20} color="white" />
            <Text style={styles.crisisButtonText}>Crisis Resources</Text>
          </A11yPressable>
        </View>
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <A11yWrapper style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading peer support matches...
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
          Peer Support
        </A11yTitle>
      </View>

      {settings.primaryLanguage && settings.communityCenteredApproach && (
        <View style={[styles.culturalBanner, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
          <Ionicons name="leaf" size={20} color={colors.warning} />
          <Text style={[styles.culturalBannerText, { color: colors.warning }]}>
            Community-centered approach active - Traditional support systems honored
          </Text>
        </View>
      )}

      {renderTabBar()}

      <View style={styles.content}>
        {activeTab === 'matches' && renderMatches()}
        {activeTab === 'connections' && renderConnections()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'safety' && renderSafety()}
      </View>
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
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
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
  // Match card styles
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
    marginBottom: 16,
  },
  matchScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  matchScoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  declineButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchReasons: {
    marginBottom: 16,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  sharedExperiences: {
    marginBottom: 16,
  },
  experiencesTitle: {
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
    textTransform: 'capitalize',
  },
  culturalNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  culturalNotesText: {
    fontSize: 12,
    marginLeft: 8,
  },
  compatibilityFactors: {
    marginBottom: 8,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  factorItem: {
    marginBottom: 8,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  factorName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  factorScore: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  factorScoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  factorDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Connection card styles
  connectionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  connectionDate: {
    fontSize: 12,
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  connectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  recentActivity: {
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityText: {
    fontSize: 12,
    marginLeft: 8,
  },
  connectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  meetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  meetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Profile styles
  profileCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    marginBottom: 20,
  },
  profileBio: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  profileTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  profileTagText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  availabilitySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityDay: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
  },
  availabilityTime: {
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
  },
  flexibleTag: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  // Safety styles
  safetyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  safetyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  safetyDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  safetyFeatures: {
    marginBottom: 24,
  },
  safetyFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  safetyFeatureContent: {
    flex: 1,
    marginLeft: 12,
  },
  safetyFeatureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  safetyFeatureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  emergencySection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emergencyText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  crisisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  crisisButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  completeProfileButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});