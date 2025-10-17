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

import A11yPressable from '../../../components/A11yPressable';
import { A11yTitle } from '../../../components/A11yWrapper';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useTextScale } from '../../../theme/typography';
import { useAppPalette } from '../../../theme/usePalette';
import { logger } from '../../../utils/logger';

type UserRole = 'pwd' | 'supporter' | 'ally';

interface ProfileState {
  role?: UserRole;
  disabilityCategories: string[];
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
  'Physical Disability',
  'Sensory Disability',
  'Cognitive Disability',
  'Mental Health Condition',
  'Chronic Illness',
  'Neurodivergence',
  'Multiple Disabilities',
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

  const titleRef = useRef<Text>(null);

  // Current profile state (from Firestore)
  const [profile, setProfile] = useState<ProfileState>({
    role: undefined,
    disabilityCategories: [],
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

  // Load profile from Firestore on mount
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!mounted) return;

        if (userDoc.exists()) {
          const data = userDoc.data();
          const loadedProfile: ProfileState = {
            role: data.role || undefined,
            disabilityCategories: data.disabilityCategories || [],
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
  }, [user?.uid]);

  // Track if profile has unsaved changes
  useEffect(() => {
    const changed = JSON.stringify(profile) !== JSON.stringify(originalProfile);
    setHasChanges(changed);
  }, [profile, originalProfile]);

  const handleRoleChange = (role: UserRole) => {
    setProfile(prev => ({ ...prev, role }));
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
    if (!user?.uid) {
      setError('Not authenticated');
      return;
    }

    // Validation
    if (!profile.role) {
      setError(t('profile.editor.error.roleRequired', 'Please select a role'));
      return;
    }

    if (profile.disabilityCategories.length === 0) {
      setError(t('profile.editor.error.disabilityRequired', 'Please select at least one disability category'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updateData = {
        role: profile.role,
        disabilityCategories: profile.disabilityCategories,
        accommodations: profile.accommodations,
        energyPatterns: profile.energyPatterns,
        preferredLanguage: profile.preferredLanguage,
        notificationsEnabled: profile.notificationsEnabled,
        profileUpdatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'users', user.uid), updateData);

      // Update original profile to mark changes as saved
      setOriginalProfile(profile);

      Alert.alert(
        t('common.success', 'Success'),
        t('profile.editor.saved', 'Your profile has been updated.')
      );

      logger.warn('[ProfileEditor] Profile saved successfully');
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

        {(['pwd', 'supporter', 'ally'] as const).map(role => (
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

      {/* Disability Categories */}
      <View style={styles.section}>
        <A11yTitle level={2} style={styles.sectionTitle}>
          {t('profile.editor.disability.title', 'Disability Categories')}
        </A11yTitle>
        <Text style={styles.sectionDescription}>
          {t('profile.editor.disability.description', 'Select all that apply')}
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

      {/* Accommodations */}
      <View style={styles.section}>
        <A11yTitle level={2} style={styles.sectionTitle}>
          {t('profile.editor.accommodations.title', 'Accommodations')}
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
            <View style={styles.energyButtons}>
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
            </View>
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
      <View style={styles.buttonContainer}>
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
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={[styles.buttonText, { color: 'white' }]}>
                {t('profile.editor.save', 'Save Changes')}
              </Text>
            </>
          )}
        </A11yPressable>
      </View>
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
      gap: 8,
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
      gap: 12,
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
