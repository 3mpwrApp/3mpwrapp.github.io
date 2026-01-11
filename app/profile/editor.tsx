/**
 * Profile Editor Screen
 * Allows users to update their disability profile, role, energy patterns, and preferences after onboarding.
 * 
 * Features:
 * - Edit role (PWD, Supporter, Ally)
 * - Edit disability categories and accommodations
 * - Configure energy patterns (morning/afternoon/evening)
 * - Update language preference
 * - Undo/revert to previous values
 * - Real-time validation and error handling
 * - Firestore persistence with optimistic UI updates
 * - Full accessibility support
 */

import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import A11yPressable from '../../components/A11yPressable';
import { A11yTitle } from '../../components/A11yWrapper';
import GapView from '../../components/GapView';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { db } from '../../firebase/config';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../store/auth';
import { useProfileLocal } from '../../store/profileLocal';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';
import { logger } from '../../utils/logger';

type UserRole = 'pwd' | 'supporter' | 'ally' | 'family';

interface ProfileState {
  role?: UserRole;
  relationshipContext?: string[];
  disabilityCategories: string[];
  symptomsToTrack: string[];
  wellnessToolsPreferences: string[];
  advocacyNeeds: string[];
  accommodations: string[];
  energyPatterns: {
    morning: 'low' | 'medium' | 'high' | null;
    afternoon: 'low' | 'medium' | 'high' | null;
    evening: 'low' | 'medium' | 'high' | null;
  };
  preferredLanguage: string;
  notificationsEnabled: boolean;
}

const DISABILITY_OPTIONS = [
  // Physical & Mobility
  'Physical Disabilities',
  'Mobility Impairments (wheelchair, walker, cane)',
  'Chronic Pain',
  'Arthritis & Joint Conditions',
  'Amputee/Limb Differences',
  
  // Vision & Sensory
  'Vision Disabilities (blind, low vision)',
  'Hearing Disabilities (Deaf, hard of hearing)',
  'Sensory Processing Disorders',
  'Dual Sensory Loss (deafblind)',
  
  // Cognitive & Learning
  'Cognitive Disabilities (memory, executive function)',
  'Learning Disabilities (dyslexia, dyscalculia)',
  'Intellectual Disabilities',
  'Brain Injury (TBI, acquired brain injury)',
  
  // Neurodivergent
  'ADHD (Attention Deficit Hyperactivity Disorder)',
  'Autism Spectrum Disorder',
  'Neurodivergence (various types)',
  
  // Mental Health & Psychosocial
  'Mental Health (depression, anxiety)',
  'PTSD & Complex PTSD',
  'Bipolar Disorder',
  'Schizophrenia & Psychosis',
  'Eating Disorders',
  'Personality Disorders',
  
  // Chronic Illness & Medical
  'Fatigue Conditions (ME/CFS, fibromyalgia)',
  'Autoimmune Diseases (lupus, MS, etc.)',
  'Long COVID & Post-Viral Syndromes',
  'Ehlers-Danlos Syndrome (EDS)',
  'POTS (Postural Orthostatic Tachycardia)',
  'Chronic Migraine & Headache Disorders',
  'Epilepsy & Seizure Disorders',
  'Diabetes & Metabolic Conditions',
  'Heart & Respiratory Conditions',
  'Cancer & Treatment Effects',
  'Endometriosis & Pelvic Pain',
  'Interstitial Cystitis',
  'MAST Cell Activation Syndrome',
  
  // Communication
  'Speech Impairments',
  'Language Disorders',
  'Communication Device Users',
  
  // Environmental
  'Environmental Illness (MCS, chemical sensitivity)',
  'Severe Allergies',
  
  // Multiple/Complex
  'Multiple Disabilities',
  'Complex Medical Needs',
];

const SYMPTOMS_OPTIONS = [
  // Pain & Physical
  'Pain (general chronic pain)',
  'Joint pain & stiffness',
  'Muscle weakness & fatigue',
  'Headaches & migraines',
  'Nerve pain (neuropathy)',
  'Back & neck pain',
  
  // Energy & Fatigue
  'Fatigue (persistent tiredness)',
  'Post-exertional malaise (PEM)',
  'Energy crashes',
  'Flare-ups (symptom worsening)',
  
  // Cognitive & Mental
  'Cognitive fog (brain fog)',
  'Memory problems',
  'Concentration difficulties',
  'Executive function challenges',
  'Sensory overload',
  'Processing delays',
  
  // Mental Health
  'Anxiety',
  'Depression',
  'Panic attacks',
  'Emotional dysregulation',
  'Mood swings',
  'Dissociation',
  'Intrusive thoughts',
  
  // Autonomic & Systemic
  'Dizziness & vertigo',
  'Orthostatic intolerance (POTS symptoms)',
  'Heart palpitations',
  'Temperature dysregulation',
  'Sweating/chills',
  
  // Digestive & GI
  'Nausea',
  'Digestive issues',
  'Appetite changes',
  
  // Sleep
  'Sleep disturbances',
  'Insomnia',
  'Hypersomnia (excessive sleep)',
  'Nightmares',
  
  // Sensory
  'Sensory sensitivity (light, sound, touch)',
  'Visual disturbances',
  'Tinnitus (ringing in ears)',
  
  // Other
  'Medication side effects',
  'Allergic reactions',
  'Mobility limitations',
  'Balance problems',
  'Speech difficulties',
  'Tremors/shaking',
];

const WELLNESS_TOOLS_OPTIONS = [
  // Core Tracking Tools
  'Mood Tracker 2.0 (AI pattern detection)',
  'Pain Log (trigger identification)',
  'Energy Tracker (predictive analytics)',
  'Symptom Tracker (pattern recognition)',
  'Sleep Tracker (quality analysis)',
  'Medication Tracker (schedule optimization)',
  
  // Pacing & Planning
  'Pacing Partner (energy forecasting)',
  'Daily Planner (adaptive scheduling)',
  'Energy Coins (spoon theory)',
  'Activity Scheduler',
  
  // DBT & Coping Skills
  'DBT Skills Library',
  'Distress Tolerance Tools',
  'Grounding Techniques',
  'Breathing Exercises',
  'Mindfulness Practices',
  'Self-Compassion Exercises',
  
  // Wellness Practices
  'Meditation Library',
  'Exercise Videos (adaptive)',
  'Stretching & Yoga',
  'Progressive Muscle Relaxation',
  'Body Scan Meditation',
  
  // Reflective Tools
  'Reflections Calendar (gratitude, wins)',
  'Dream Tracker & Interpreter',
  'Acceptance & Function Tracker',
  'Values Clarification',
  
  // Crisis & Safety
  'Crisis Resources (988, helplines)',
  'Safety Planning',
  'Trigger Detector',
  'Panic Button (quick exit)',
  
  // Social & Support
  'Caregiver Support Tools',
  'Family Communication Guides',
  'Community Connections',
  'Peer Support Matching',
  'Support Group Finder',
  
  // Advocacy & Education
  'Advocacy Resources',
  'Rights Education',
  'Self-Advocacy Tools',
  'Accommodation Request Builder',
  
  // Specialized Tools
  'Harm Reduction Resources',
  'Circadian Rhythm Tracker',
  'Functional Capacity Evaluator',
  'Wellness Reminders',
  'Self-Care Library',
];

const ADVOCACY_NEEDS_OPTIONS = [
  // Legal & Benefits
  'Legal help (workplace discrimination, wrongful termination)',
  'Benefits appeals (CPP-D, EI Sickness, ODSP/OW)',
  'WSIB claims & appeals',
  'LTD/STD insurance disputes',
  'Human rights complaints',
  'IME (Independent Medical Exam) objections',
  
  // Healthcare Navigation
  'Healthcare access (finding accessible providers)',
  'Medical records requests',
  'Doctor support letters',
  'Prescription coverage appeals',
  'Medical device/equipment funding',
  'Second opinion navigation',
  
  // Housing & Accessibility
  'Housing accessibility modifications',
  'Housing discrimination',
  'Service animal approval',
  'Parking permit applications/appeals',
  'Accessible housing search',
  
  // Employment & Education
  'Employment accommodations (flexible schedule, remote work)',
  'Workplace harassment/discrimination',
  'Return-to-work planning',
  'Education accommodations (IEP, post-secondary)',
  'Vocational rehabilitation',
  'Career transition support',
  
  // Transportation & Mobility
  'Transportation assistance (accessible transit)',
  'Driver\'s license medical reviews',
  'Mobility device funding',
  
  // Family & Support Services
  'Family support services',
  'Child/dependent care resources',
  'Respite care access',
  'Personal support worker (PSW) services',
  
  // Financial & Economic
  'Debt relief & financial hardship',
  'Tax credits & disability deductions',
  'RDSP (Registered Disability Savings Plan)',
  'Utility assistance programs',
  
  // Community & Social
  'Community resources & programs',
  'Support group connections',
  'Peer support matching',
  'Recreation & leisure accessibility',
  
  // Advocacy & Rights
  'Policy advocacy (systemic change)',
  'Rights education (know your rights)',
  'Self-advocacy skill building',
  'Legislative advocacy',
  
  // Indigenous-Specific
  'Indigenous disability rights & services',
  'Treaty rights & disability benefits',
  'Traditional healing access',
  
  // Intersectional Support
  '2SLGBTQIA+ disability advocacy',
  'Immigrant/refugee disability services',
  'Racialized communities support',
  'Gender-based violence & disability',
];

const RELATIONSHIP_CONTEXT_OPTIONS = [
  'Parent/Guardian',
  'Spouse/Partner',
  'Sibling',
  'Child',
  'Extended Family',
  'Friend',
  'Caregiver',
  'Professional Supporter',
  'Community Ally',
  'Advocate',
  'Healthcare Provider',
  'Educator',
];

const ACCOMMODATION_OPTIONS = [
  'Large Text',
  'High Contrast',
  'Screen Reader Support',
  'Captions',
  'Simplified Navigation',
  'Extended Timeouts',
  'Voice Commands',
  'Adaptive Controls',
];

const ENERGY_LEVELS = ['low', 'medium', 'high'] as const;

export default function ProfileEditorScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const { user } = useAuth();
  const { profile: localProfile, setProfile: setLocalProfile } = useProfileLocal();

  const titleRef = useRef<Text>(null);

  // Current profile state (from Firestore)
  const [profile, setProfile] = useState<ProfileState>({
    role: undefined,
    relationshipContext: [],
    disabilityCategories: [],
    symptomsToTrack: [],
    wellnessToolsPreferences: [],
    advocacyNeeds: [],
    accommodations: [],
    energyPatterns: {
      morning: null,
      afternoon: null,
      evening: null,
    },
    preferredLanguage: 'en',
    notificationsEnabled: true,
  });

  // Original profile state (for undo/revert)
  const [originalProfile, setOriginalProfile] = useState<ProfileState>(profile);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useAnnounceOnMount(t('profile.editor.title', 'Profile Editor'));
  useFocusOnRefOnMount(titleRef);

  // Load profile from Firestore or local context on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Load from profileLocal context first (immediate sync)
        if (localProfile && Object.keys(localProfile).length > 0 && mounted) {
          logger.log('[ProfileEditor] Loading from profileLocal context:', localProfile);
          // Map localProfile to ProfileState format
          setProfile(prev => ({
            ...prev,
            // Use existing profile data or fallback to defaults
          }));
        }
        
        // If user is authenticated and Firestore is available, try to load from Firestore
        if (user?.uid && db) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!mounted) return;

          if (userDoc.exists()) {
            const data = userDoc.data();
            const loadedProfile: ProfileState = {
              role: data.role || undefined,
              relationshipContext: data.relationshipContext || [],
              disabilityCategories: data.disabilityCategories || [],
              symptomsToTrack: data.symptomsToTrack || [],
              wellnessToolsPreferences: data.wellnessToolsPreferences || [],
              advocacyNeeds: data.advocacyNeeds || [],
              accommodations: data.accommodations || [],
              energyPatterns: data.energyPatterns || {
                morning: null,
                afternoon: null,
                evening: null,
              },
              preferredLanguage: data.preferredLanguage || 'en',
              notificationsEnabled: data.notificationsEnabled !== false,
            };
            setProfile(loadedProfile);
            setOriginalProfile(loadedProfile);
            
            // Sync basic info back to profileLocal context
            await setLocalProfile({
              ...localProfile,
              name: data.name,
              contact: data.contact,
              province: data.province,
            });
          }
        } else {
          // Not authenticated - use whatever is in context
          logger.log('[ProfileEditor] No user, using local profile only');
        }
      } catch (err: any) {
        logger.error('[ProfileEditor] Failed to load profile:', err);
        if (mounted) {
          setError(err?.message || 'Failed to load profile');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.uid, localProfile, setLocalProfile]);

  // Track if profile has unsaved changes
  useEffect(() => {
    const changed = JSON.stringify(profile) !== JSON.stringify(originalProfile);
    setHasChanges(changed);
  }, [profile, originalProfile]);

  const handleRelationshipToggle = (relationship: string) => {
    setProfile(prev => ({
      ...prev,
      relationshipContext: prev.relationshipContext?.includes(relationship)
        ? prev.relationshipContext?.filter(r => r !== relationship)
        : [...(prev.relationshipContext || []), relationship],
    }));
    setError(null);
  };

  const handleRoleChange = (role: UserRole) => {
    setProfile(prev => ({
      ...prev,
      role,
    }));
    setError(null);
  };

  const handleDisabilityToggle = (disability: string) => {
    setProfile(prev => ({
      ...prev,
      disabilityCategories: prev.disabilityCategories.includes(disability)
        ? prev.disabilityCategories.filter(d => d !== disability)
        : [...prev.disabilityCategories, disability],
    }));
    setError(null);
  };

  const handleSymptomToggle = (symptom: string) => {
    setProfile(prev => ({
      ...prev,
      symptomsToTrack: prev.symptomsToTrack.includes(symptom)
        ? prev.symptomsToTrack.filter(s => s !== symptom)
        : [...prev.symptomsToTrack, symptom],
    }));
    setError(null);
  };

  const handleWellnessToolToggle = (tool: string) => {
    setProfile(prev => ({
      ...prev,
      wellnessToolsPreferences: prev.wellnessToolsPreferences.includes(tool)
        ? prev.wellnessToolsPreferences.filter(t => t !== tool)
        : [...prev.wellnessToolsPreferences, tool],
    }));
    setError(null);
  };

  const handleAdvocacyNeedToggle = (need: string) => {
    setProfile(prev => ({
      ...prev,
      advocacyNeeds: prev.advocacyNeeds.includes(need)
        ? prev.advocacyNeeds.filter(n => n !== need)
        : [...prev.advocacyNeeds, need],
    }));
    setError(null);
  };

  const handleAccommodationToggle = (accommodation: string) => {
    setProfile(prev => ({
      ...prev,
      accommodations: prev.accommodations.includes(accommodation)
        ? prev.accommodations.filter(a => a !== accommodation)
        : [...prev.accommodations, accommodation],
    }));
    setError(null);
  };

  const handleEnergyPatternChange = (
    timeOfDay: 'morning' | 'afternoon' | 'evening',
    level: 'low' | 'medium' | 'high' | null
  ) => {
    setProfile(prev => ({
      ...prev,
      energyPatterns: {
        ...prev.energyPatterns,
        [timeOfDay]: level,
      },
    }));
    setError(null);
  };

  const handleNotificationsToggle = () => {
    setProfile(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
    setError(null);
  };

  const handleRevert = () => {
    Alert.alert(
      t('profile.editor.revert.title', 'Discard Changes?'),
      t('profile.editor.revert.message', 'All unsaved changes will be lost.'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('common.discard', 'Discard'),
          onPress: () => {
            setProfile(originalProfile);
            setError(null);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSave = async () => {
    // Validation
    if (!profile.role) {
      setError(t('profile.editor.error.roleRequired', 'Please select a role'));
      return;
    }

    // Only require disability categories for PWD role
    if (profile.role === 'pwd' && profile.disabilityCategories.length === 0) {
      setError(t('profile.editor.error.disabilityRequired', 'Please select at least one disability category'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updateData = {
        role: profile.role,
        relationshipContext: profile.relationshipContext,
        disabilityCategories: profile.disabilityCategories,
        symptomsToTrack: profile.symptomsToTrack,
        wellnessToolsPreferences: profile.wellnessToolsPreferences,
        advocacyNeeds: profile.advocacyNeeds,
        accommodations: profile.accommodations,
        energyPatterns: profile.energyPatterns,
        preferredLanguage: profile.preferredLanguage,
        notificationsEnabled: profile.notificationsEnabled,
        profileUpdatedAt: new Date().toISOString(),
      };

      // Save to profileLocal context (uses correct AsyncStorage key)
      await setLocalProfile({
        ...localProfile,
        // Store any name/contact/province that may have been set
        name: localProfile.name,
        contact: localProfile.contact,
        province: localProfile.province,
      });
      logger.log('[ProfileEditor] Saved to profileLocal context');

      // If user is authenticated and Firestore is available, also save to Firestore
      if (user?.uid && db) {
        try {
          await updateDoc(doc(db, 'users', user.uid), updateData);
          logger.log('[ProfileEditor] Saved to Firestore');
        } catch (firebaseErr: any) {
          logger.error('[ProfileEditor] Failed to save to Firestore, but local save succeeded:', firebaseErr);
        }
      }

      // Update original profile to mark changes as saved
      setOriginalProfile(profile);

      Alert.alert(
        t('common.success', 'Success'),
        t('profile.editor.saved', 'Your profile has been updated.')
      );

      logger.log('[ProfileEditor] Profile saved successfully');
    } catch (err: any) {
      logger.error('[ProfileEditor] Failed to save profile:', err);
      const errorMsg = err?.message || 'Failed to save profile';
      setError(errorMsg);
      Alert.alert(t('common.error', 'Error'), errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const styles = createStyles(palette, factor, insets);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('profile.editor.title', 'Profile Settings')}
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={palette.error} />
          <Text style={[styles.errorText, { color: palette.error }]}>{error}</Text>
        </View>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color={palette.warning} />
          <Text style={[styles.warningText, { color: palette.warning }]}>
            {t('profile.editor.unsavedChanges', 'You have unsaved changes')}
          </Text>
        </View>
      )}

      {/* Role Selection */}
      <View style={styles.section}>
        <A11yTitle level={2} style={styles.sectionTitle}>
          {t('profile.editor.role.title', 'Your Role')}
        </A11yTitle>
        <Text style={styles.sectionDescription}>
          {t('profile.editor.role.description', 'How do you use 3mpwr App?')}
        </Text>

        {(['pwd', 'supporter', 'ally', 'family'] as const).map(role => (
          <A11yPressable
            key={role}
            onPress={() => handleRoleChange(role)}
            style={[
              styles.roleButton,
              profile.role === role && styles.roleButtonSelected,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ checked: profile.role === role }}
            accessibilityLabel={t(`profile.editor.role.${role}`, role)}
            hitSlop={HIT_SLOP_8}
          >
            <View style={styles.roleButtonContent}>
              <Ionicons
                name={profile.role === role ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={profile.role === role ? palette.primary : palette.muted}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  profile.role === role && { color: palette.primary, fontWeight: '600' },
                ]}
              >
                {t(`profile.editor.role.${role}`, role.charAt(0).toUpperCase() + role.slice(1))}
              </Text>
            </View>
          </A11yPressable>
        ))}
      </View>

      {/* Relationship Context - For non-PWD roles */}
      {profile.role && profile.role !== 'pwd' && (
        <View style={styles.section}>
          <A11yTitle level={2} style={styles.sectionTitle}>
            {t('profile.editor.relationship.title', 'Your Relationship to Disability')}
          </A11yTitle>
          <Text style={styles.sectionDescription}>
            {t('profile.editor.relationship.description', 'How are you connected to the disability community?')}
          </Text>

          {RELATIONSHIP_CONTEXT_OPTIONS.map(relationship => (
            <A11yPressable
              key={relationship}
              onPress={() => handleRelationshipToggle(relationship)}
              style={[
                styles.checkboxRow,
                profile.relationshipContext?.includes(relationship) && styles.checkboxRowSelected,
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: profile.relationshipContext?.includes(relationship) }}
              accessibilityLabel={relationship}
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons
                name={profile.relationshipContext?.includes(relationship) ? 'checkbox' : 'checkbox-outline'}
                size={24}
                color={profile.relationshipContext?.includes(relationship) ? palette.primary : palette.muted}
              />
              <Text style={styles.checkboxLabel}>{relationship}</Text>
            </A11yPressable>
          ))}
        </View>
      )}

      {/* Disability Categories - Only for PWD */}
      {profile.role === 'pwd' && (
        <View style={styles.section}>
          <A11yTitle level={2} style={styles.sectionTitle}>
            {t('profile.editor.disability.title', 'Disability Types')}
          </A11yTitle>
          <Text style={styles.sectionDescription}>
            {t('profile.editor.disability.description', 'Select ALL that apply (can choose multiple)')}
          </Text>

          {DISABILITY_OPTIONS.map(disability => (
            <A11yPressable
              key={disability}
              onPress={() => handleDisabilityToggle(disability)}
              style={[
                styles.checkboxRow,
                profile.disabilityCategories.includes(disability) && styles.checkboxRowSelected,
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: profile.disabilityCategories.includes(disability) }}
              accessibilityLabel={disability}
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons
                name={profile.disabilityCategories.includes(disability) ? 'checkbox' : 'checkbox-outline'}
                size={24}
                color={profile.disabilityCategories.includes(disability) ? palette.primary : palette.muted}
              />
              <Text style={styles.checkboxLabel}>{disability}</Text>
            </A11yPressable>
          ))}
        </View>
      )}

      {/* Symptoms to Track - Only for PWD */}
      {profile.role === 'pwd' && (
        <View style={styles.section}>
          <A11yTitle level={2} style={styles.sectionTitle}>
            {t('profile.editor.symptoms.title', 'Symptoms to Track')}
          </A11yTitle>
          <Text style={styles.sectionDescription}>
            {t('profile.editor.symptoms.description', 'Select your most common symptoms (up to 15)')}
          </Text>

          {SYMPTOMS_OPTIONS.map(symptom => (
            <A11yPressable
              key={symptom}
              onPress={() => handleSymptomToggle(symptom)}
              style={[
                styles.checkboxRow,
                profile.symptomsToTrack.includes(symptom) && styles.checkboxRowSelected,
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: profile.symptomsToTrack.includes(symptom) }}
              accessibilityLabel={symptom}
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons
                name={profile.symptomsToTrack.includes(symptom) ? 'checkbox' : 'checkbox-outline'}
                size={24}
                color={profile.symptomsToTrack.includes(symptom) ? palette.primary : palette.muted}
              />
              <Text style={styles.checkboxLabel}>{symptom}</Text>
            </A11yPressable>
          ))}
        </View>
      )}

      {/* Wellness Tools Preferences */}
      <View style={styles.section}>
        <A11yTitle level={2} style={styles.sectionTitle}>
          {t('profile.editor.wellness.title', 'Wellness Tools Preferences')}
        </A11yTitle>
        <Text style={styles.sectionDescription}>
          {t('profile.editor.wellness.description', 'Select your favorite tools (or ones you want to try)')}
        </Text>

        {WELLNESS_TOOLS_OPTIONS.map(tool => (
          <A11yPressable
            key={tool}
            onPress={() => handleWellnessToolToggle(tool)}
            style={[
              styles.checkboxRow,
              profile.wellnessToolsPreferences.includes(tool) && styles.checkboxRowSelected,
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: profile.wellnessToolsPreferences.includes(tool) }}
            accessibilityLabel={tool}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons
              name={profile.wellnessToolsPreferences.includes(tool) ? 'checkbox' : 'checkbox-outline'}
              size={24}
              color={profile.wellnessToolsPreferences.includes(tool) ? palette.primary : palette.muted}
            />
            <Text style={styles.checkboxLabel}>{tool}</Text>
          </A11yPressable>
        ))}
      </View>

      {/* Advocacy Needs */}
      <View style={styles.section}>
        <A11yTitle level={2} style={styles.sectionTitle}>
          {t('profile.editor.advocacy.title', 'Advocacy Needs')}
        </A11yTitle>
        <Text style={styles.sectionDescription}>
          {t('profile.editor.advocacy.description', 'Select what you need help with')}
        </Text>

        {ADVOCACY_NEEDS_OPTIONS.map(need => (
          <A11yPressable
            key={need}
            onPress={() => handleAdvocacyNeedToggle(need)}
            style={[
              styles.checkboxRow,
              profile.advocacyNeeds.includes(need) && styles.checkboxRowSelected,
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: profile.advocacyNeeds.includes(need) }}
            accessibilityLabel={need}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons
              name={profile.advocacyNeeds.includes(need) ? 'checkbox' : 'checkbox-outline'}
              size={24}
              color={profile.advocacyNeeds.includes(need) ? palette.primary : palette.muted}
            />
            <Text style={styles.checkboxLabel}>{need}</Text>
          </A11yPressable>
        ))}
      </View>

      {/* Accommodations */}
      <View style={styles.section}>
        <A11yTitle level={2} style={styles.sectionTitle}>
          {t('profile.editor.accommodations.title', 'Accessibility Accommodations')}
        </A11yTitle>
        <Text style={styles.sectionDescription}>
          {t('profile.editor.accommodations.description', 'Select accommodations you need')}
        </Text>

        {ACCOMMODATION_OPTIONS.map(accommodation => (
          <A11yPressable
            key={accommodation}
            onPress={() => handleAccommodationToggle(accommodation)}
            style={[
              styles.checkboxRow,
              profile.accommodations.includes(accommodation) && styles.checkboxRowSelected,
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: profile.accommodations.includes(accommodation) }}
            accessibilityLabel={accommodation}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons
              name={profile.accommodations.includes(accommodation) ? 'checkbox' : 'checkbox-outline'}
              size={24}
              color={profile.accommodations.includes(accommodation) ? palette.primary : palette.muted}
            />
            <Text style={styles.checkboxLabel}>{accommodation}</Text>
          </A11yPressable>
        ))}
      </View>

      {/* Energy Patterns */}
      <View style={styles.section}>
        <A11yTitle level={2} style={styles.sectionTitle}>
          {t('profile.editor.energy.title', 'Energy Patterns')}
        </A11yTitle>
        <Text style={styles.sectionDescription}>
          {t('profile.editor.energy.description', 'When are you typically most energetic?')}
        </Text>

        {(['morning', 'afternoon', 'evening'] as const).map(timeOfDay => (
          <View key={timeOfDay} style={styles.energyRow}>
            <Text style={styles.energyLabel}>
              {t(`profile.editor.energy.${timeOfDay}`, timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1))}
            </Text>
            <GapView style={styles.energyButtons}>
              {ENERGY_LEVELS.map(level => (
                <A11yPressable
                  key={level}
                  onPress={() => handleEnergyPatternChange(timeOfDay, profile.energyPatterns[timeOfDay] === level ? null : level)}
                  style={[
                    styles.energyButton,
                    profile.energyPatterns[timeOfDay] === level && styles.energyButtonSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${timeOfDay} energy level: ${level}`}
                  accessibilityState={{ checked: profile.energyPatterns[timeOfDay] === level }}
                  hitSlop={HIT_SLOP_8}
                >
                  <Text
                    style={[
                      styles.energyButtonText,
                      profile.energyPatterns[timeOfDay] === level && styles.energyButtonTextSelected,
                    ]}
                  >
                    {level.charAt(0).toUpperCase()}
                  </Text>
                </A11yPressable>
              ))}
            </GapView>
          </View>
        ))}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <View style={styles.notificationRow}>
          <A11yTitle level={3} style={styles.notificationLabel}>
            {t('profile.editor.notifications.title', 'Notifications')}
          </A11yTitle>
          <Switch
            value={profile.notificationsEnabled}
            onValueChange={handleNotificationsToggle}
            accessibilityRole="switch"
            accessibilityLabel={t('profile.editor.notifications.toggle', 'Enable notifications')}
            accessibilityState={{ checked: profile.notificationsEnabled }}
          />
        </View>
        <Text style={styles.notificationDescription}>
          {t('profile.editor.notifications.description', 'Receive push notifications and reminders')}
        </Text>
      </View>

      {/* Action Buttons */}
      <GapView style={styles.buttonContainer}>
        {hasChanges && (
          <A11yPressable
            onPress={handleRevert}
            style={[styles.button, styles.revertButton]}
            accessibilityRole="button"
            accessibilityLabel={t('common.revert', 'Revert changes')}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="arrow-back" size={20} color={palette.primary} />
            <Text style={[styles.buttonText, { color: palette.primary }]}>
              {t('common.revert', 'Revert')}
            </Text>
          </A11yPressable>
        )}

        <A11yPressable
          onPress={handleSave}
          disabled={!hasChanges || saving}
          style={[styles.button, styles.saveButton, (!hasChanges || saving) && styles.buttonDisabled]}
          accessibilityRole="button"
          accessibilityLabel={t('profile.editor.save', 'Save profile changes')}
          accessibilityState={{ disabled: !hasChanges || saving }}
          hitSlop={HIT_SLOP_8}
        >
          {saving ? (
            <ActivityIndicator size="small" color={palette.onPrimary} />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color={palette.onPrimary} />
              <Text style={[styles.buttonText, { color: palette.onPrimary }]}>
                {t('profile.editor.save', 'Save Changes')}
              </Text>
            </>
          )}
        </A11yPressable>
      </GapView>
    </ScrollView>
  );
}

function createStyles(palette: any, factor: number, insets: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 20,
      paddingTop: 16,
      paddingBottom: insets.bottom + 20,
    },
    title: {
      fontSize: 24 * factor,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 20,
    },
    section: {
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 18 * factor,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 14 * factor,
      color: palette.muted,
      marginBottom: 16,
    },
    errorContainer: {
      flexDirection: 'row',
      backgroundColor: `${palette.error}15`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      alignItems: 'center',
    },
    errorText: {
      fontSize: 14 * factor,
      marginLeft: 12,
      flex: 1,
    },
    warningContainer: {
      flexDirection: 'row',
      backgroundColor: `${palette.warning}15`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      alignItems: 'center',
    },
    warningText: {
      fontSize: 14 * factor,
      marginLeft: 12,
      flex: 1,
    },
    roleButton: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: `${palette.text}08`,
    },
    roleButtonSelected: {
      backgroundColor: `${palette.primary}15`,
    },
    roleButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    roleButtonText: {
      fontSize: 16 * factor,
      color: palette.text,
      marginLeft: 12,
      flex: 1,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: `${palette.text}08`,
    },
    checkboxRowSelected: {
      backgroundColor: `${palette.primary}15`,
    },
    checkboxLabel: {
      fontSize: 16 * factor,
      color: palette.text,
      marginLeft: 12,
      flex: 1,
    },
    energyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: `${palette.text}08`,
      paddingHorizontal: 12,
    },
    energyLabel: {
      fontSize: 16 * factor,
      color: palette.text,
      fontWeight: '500',
    },
    energyButtons: {
      flexDirection: 'row',
    },
    energyButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: `${palette.text}12`,
      borderWidth: 1,
      borderColor: `${palette.text}30`,
    },
    energyButtonSelected: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    energyButtonText: {
      fontSize: 14 * factor,
      color: palette.text,
      fontWeight: '600',
    },
    energyButtonTextSelected: {
      color: 'white',
    },
    notificationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: `${palette.text}08`,
    },
    notificationLabel: {
      fontSize: 16 * factor,
      fontWeight: '500',
      color: palette.text,
    },
    notificationDescription: {
      fontSize: 14 * factor,
      color: palette.muted,
      marginTop: 8,
      marginLeft: 12,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 24,
      marginBottom: insets.bottom + 16,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      flex: 1,
    },
    saveButton: {
      backgroundColor: palette.primary,
    },
    revertButton: {
      backgroundColor: `${palette.text}12`,
      borderWidth: 1,
      borderColor: palette.primary,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 16 * factor,
      fontWeight: '600',
      marginLeft: 8,
    },
  });
}
