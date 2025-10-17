import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import A11yPressable from '../../components/A11yPressable';
import { A11yTitle, A11yWrapper } from '../../components/A11yWrapper';
import { useScreenReaderEnabled } from '../../hooks/useA11y';
import { useThemeColor } from '../../hooks/useThemeColor';

interface AccessibilityPreferences {
  dyslexiaMode: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  audioDescriptionsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  hapticFeedback: boolean;
}

interface DisabilityProfile {
  primaryDisability: string;
  accommodations: string[];
  preferredLanguage: string;
  needsInterpreter: boolean;
  emergencyContact?: string;
}

type UserRole = 'pwd' | 'supporter' | 'ally' | undefined;

interface SupporterProfile {
  relationshipToPWD: string;
  supportType: string[];
}

interface AllyProfile {
  organizationName?: string;
  allyType: string;
  advocacyAreas: string[];
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const isScreenReaderEnabled = useScreenReaderEnabled();
  
  // For now, we'll create a simple announce function
  const announceForAccessibility = (message: string) => {
    // This would typically use AccessibilityInfo.announceForScreenReader
    // or similar platform-specific announcement method
    console.log('Accessibility announcement:', message);
  };
  
  const [step, setStep] = useState<'role-select' | 'welcome' | 'accessibility' | 'disability' | 'supporter-info' | 'ally-info' | 'ready'>('role-select');
  const [userRole, setUserRole] = useState<UserRole>(undefined);
  const [supporterProfile, setSupporterProfile] = useState<SupporterProfile>({
    relationshipToPWD: '',
    supportType: [],
  });
  const [allyProfile, setAllyProfile] = useState<AllyProfile>({
    organizationName: '',
    allyType: '',
    advocacyAreas: [],
  });
  const [a11yPrefs, setA11yPrefs] = useState<AccessibilityPreferences>({
    dyslexiaMode: false,
    highContrast: false,
    screenReaderOptimized: false,
    audioDescriptionsEnabled: false,
    fontSize: 'medium',
    hapticFeedback: true,
  });
  const [disabilityProfile, setDisabilityProfile] = useState<DisabilityProfile>({
    primaryDisability: '',
    accommodations: [],
    preferredLanguage: 'en',
    needsInterpreter: false,
  });

  const colors = {
    text: textColor,
    background: backgroundColor,
    primary: '#007AFF',
    secondary: '#5AC8FA',
    success: '#34C759',
    warning: '#FF9500',
    border: `${textColor}20`,
  };

  useEffect(() => {
    // Announce to screen readers
    if (step === 'role-select') {
      announceForAccessibility('Welcome to 3mpwr App. Onboarding step 1: Select your role');
    } else if (step === 'welcome') {
      announceForAccessibility('Welcome to 3mpwr App. Onboarding step 2 of 5: Welcome');
    } else if (step === 'accessibility') {
      announceForAccessibility('Step 3 of 5: Configure accessibility preferences');
    } else if (step === 'disability') {
      announceForAccessibility('Step 4 of 5: Set up your disability profile');
    } else if (step === 'supporter-info') {
      announceForAccessibility('Step 4 of 5: Tell us about your support role');
    } else if (step === 'ally-info') {
      announceForAccessibility('Step 4 of 5: Tell us about your advocacy work');
    }
  }, [step, announceForAccessibility]);

  const handleAccessibilityToggle = (key: keyof Omit<AccessibilityPreferences, 'fontSize'>) => {
    setA11yPrefs(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    announceForAccessibility(`${key} ${!a11yPrefs[key] ? 'enabled' : 'disabled'}`);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setA11yPrefs(prev => ({ ...prev, fontSize: size }));
    announceForAccessibility(`Font size changed to ${size}`);
  };

  const handleDisabilityOption = (disability: string) => {
    setDisabilityProfile(prev => ({
      ...prev,
      primaryDisability: prev.primaryDisability === disability ? '' : disability,
    }));
  };

  const handleAccommodationToggle = (accommodation: string) => {
    setDisabilityProfile(prev => ({
      ...prev,
      accommodations: prev.accommodations.includes(accommodation)
        ? prev.accommodations.filter(a => a !== accommodation)
        : [...prev.accommodations, accommodation],
    }));
  };

  const proceedToLogin = () => {
    // Save preferences to AsyncStorage/Context (implementation would go here)
    announceForAccessibility('Onboarding complete. Proceeding to login.');
    router.push('/(auth)/login' as Href);
  };

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    announceForAccessibility(`Role selected: ${role === 'pwd' ? 'Person with Disability' : role === 'supporter' ? 'Supporter' : 'Ally'}`);
    setStep('welcome');
  };

  const renderRoleSelect = () => (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerSection}>
        <Ionicons name="people-circle" size={64} color={colors.primary} style={{ marginBottom: 16 }} />
        <A11yTitle level={1} style={[styles.title, { color: colors.text }]}>
          What's Your Role?
        </A11yTitle>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          This helps us personalize your experience and provide relevant resources.
        </Text>
      </View>

      <A11yPressable
        onPress={() => handleRoleSelect('pwd')}
        accessibilityRole="button"
        accessibilityLabel="I am a person with a disability"
        style={[
          styles.roleCard,
          {
            backgroundColor: colors.background,
            borderColor: userRole === 'pwd' ? colors.primary : colors.border,
            borderWidth: userRole === 'pwd' ? 3 : 1,
          },
        ]}
      >
        <Ionicons name="person-circle" size={48} color={colors.primary} style={{ marginBottom: 12 }} />
        <A11yTitle level={3} style={[styles.roleCardTitle, { color: colors.text }]}>
          Person with Disability
        </A11yTitle>
        <Text style={[styles.roleCardDescription, { color: colors.text }]}>
          Access personalized accommodations, resources, and community support tailored to your needs.
        </Text>
      </A11yPressable>

      <A11yPressable
        onPress={() => handleRoleSelect('supporter')}
        accessibilityRole="button"
        accessibilityLabel="I am a supporter or family member"
        style={[
          styles.roleCard,
          {
            backgroundColor: colors.background,
            borderColor: userRole === 'supporter' ? colors.primary : colors.border,
            borderWidth: userRole === 'supporter' ? 3 : 1,
          },
        ]}
      >
        <Ionicons name="heart-circle" size={48} color={colors.secondary} style={{ marginBottom: 12 }} />
        <A11yTitle level={3} style={[styles.roleCardTitle, { color: colors.text }]}>
          Supporter / Family Member
        </A11yTitle>
        <Text style={[styles.roleCardDescription, { color: colors.text }]}>
          Help loved ones navigate resources, find local support, and advocate for their rights.
        </Text>
      </A11yPressable>

      <A11yPressable
        onPress={() => handleRoleSelect('ally')}
        accessibilityRole="button"
        accessibilityLabel="I am an advocate or professional ally"
        style={[
          styles.roleCard,
          {
            backgroundColor: colors.background,
            borderColor: userRole === 'ally' ? colors.primary : colors.border,
            borderWidth: userRole === 'ally' ? 3 : 1,
          },
        ]}
      >
        <Ionicons name="handshake" size={48} color={colors.success} style={{ marginBottom: 12 }} />
        <A11yTitle level={3} style={[styles.roleCardTitle, { color: colors.text }]}>
          Advocate / Professional Ally
        </A11yTitle>
        <Text style={[styles.roleCardDescription, { color: colors.text }]}>
          Connect with communities, share expertise, and collaborate on policy and advocacy initiatives.
        </Text>
      </A11yPressable>

      <View style={styles.buttonsContainer}>
        <A11yPressable
          onPress={() => userRole && setStep('welcome')}
          accessibilityRole="button"
          accessibilityLabel="Continue to next step"
          disabled={!userRole}
          style={[
            styles.button,
            {
              backgroundColor: userRole ? colors.primary : colors.primary + '60',
              opacity: userRole ? 1 : 0.5,
            },
          ]}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </A11yPressable>

        <A11yPressable
          onPress={proceedToLogin}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          style={[styles.buttonSecondary, { borderColor: colors.primary }]}
        >
          <Text style={[styles.buttonSecondaryText, { color: colors.primary }]}>Skip for Now</Text>
        </A11yPressable>
      </View>
    </ScrollView>
  );

  const renderWelcome = () => (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerSection}>
        <Ionicons name="accessibility" size={64} color={colors.primary} style={{ marginBottom: 16 }} />
        <A11yTitle level={1} style={[styles.title, { color: colors.text }]}>
          Welcome to 3mpwr App
        </A11yTitle>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Empowering {userRole === 'pwd' ? 'injured workers & persons with disabilities' : userRole === 'supporter' ? 'supporters and advocates' : 'allies and professionals'}.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Ionicons name="checkmark-circle" size={24} color={colors.success} style={{ marginBottom: 12 }} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>Accessibility First</Text>
        <Text style={[styles.cardDescription, { color: colors.text }]}>
          Your accessibility preferences are set up in the next steps to ensure the app works perfectly for you.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Ionicons name="shield-checkmark" size={24} color={colors.success} style={{ marginBottom: 12 }} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>Your Privacy Matters</Text>
        <Text style={[styles.cardDescription, { color: colors.text }]}>
          Your personal and health information is encrypted and only shared with your permission.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Ionicons name="people" size={24} color={colors.success} style={{ marginBottom: 12 }} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>Connect & Advocate</Text>
        <Text style={[styles.cardDescription, { color: colors.text }]}>
          Join communities, access resources, and advocate for your rights.
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <A11yPressable
          onPress={() => setStep('accessibility')}
          accessibilityRole="button"
          accessibilityLabel="Start onboarding"
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </A11yPressable>

        <A11yPressable
          onPress={proceedToLogin}
          accessibilityRole="button"
          accessibilityLabel="Skip to login"
          style={[styles.buttonSecondary, { borderColor: colors.primary }]}
        >
          <Text style={[styles.buttonSecondaryText, { color: colors.primary }]}>Skip for Now</Text>
        </A11yPressable>
      </View>
    </ScrollView>
  );

  const renderAccessibility = () => (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
      <A11yTitle level={2} style={[styles.stepTitle, { color: colors.text }]}>
        Accessibility Preferences
      </A11yTitle>
      <Text style={[styles.stepSubtitle, { color: colors.text }]}>
        Customize how the app works for you. You can change these anytime in Settings.
      </Text>

      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Visual Settings</Text>

        <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
          <View style={styles.preferenceLabel}>
            <Ionicons name="contrast" size={20} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.preferenceName, { color: colors.text }]}>High Contrast Mode</Text>
              <Text style={[styles.preferenceDescription, { color: colors.text }]}>Increases color contrast for better visibility</Text>
            </View>
          </View>
          <Switch
            value={a11yPrefs.highContrast}
            onValueChange={() => handleAccessibilityToggle('highContrast')}
            accessibilityRole="switch"
            accessibilityState={{ checked: a11yPrefs.highContrast }}
            accessibilityLabel="High contrast mode"
          />
        </View>

        <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
          <View style={styles.preferenceLabel}>
            <Ionicons name="text" size={20} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.preferenceName, { color: colors.text }]}>Dyslexia-Friendly Font</Text>
              <Text style={[styles.preferenceDescription, { color: colors.text }]}>Uses font optimized for dyslexia</Text>
            </View>
          </View>
          <Switch
            value={a11yPrefs.dyslexiaMode}
            onValueChange={() => handleAccessibilityToggle('dyslexiaMode')}
            accessibilityRole="switch"
            accessibilityState={{ checked: a11yPrefs.dyslexiaMode }}
            accessibilityLabel="Dyslexia friendly font"
          />
        </View>

        <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
          <View style={styles.preferenceLabel}>
            <Ionicons name="text-outline" size={20} color={colors.primary} />
            <Text style={[styles.preferenceName, { color: colors.text }]}>Font Size: {a11yPrefs.fontSize}</Text>
          </View>
        </View>
        <View style={styles.fontSizeButtons}>
          {(['small', 'medium', 'large'] as const).map(size => (
            <A11yPressable
              key={size}
              onPress={() => handleFontSizeChange(size)}
              accessibilityRole="radio"
              accessibilityState={{ checked: a11yPrefs.fontSize === size }}
              style={[
                styles.fontSizeButton,
                {
                  backgroundColor: a11yPrefs.fontSize === size ? colors.primary : colors.background,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[
                styles.fontSizeButtonText,
                { color: a11yPrefs.fontSize === size ? 'white' : colors.text, fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16 },
              ]}>
                {size.charAt(0).toUpperCase()}
              </Text>
            </A11yPressable>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Audio Settings</Text>

        <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
          <View style={styles.preferenceLabel}>
            <Ionicons name="volume-high" size={20} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.preferenceName, { color: colors.text }]}>Audio Descriptions</Text>
              <Text style={[styles.preferenceDescription, { color: colors.text }]}>Provides spoken descriptions of images</Text>
            </View>
          </View>
          <Switch
            value={a11yPrefs.audioDescriptionsEnabled}
            onValueChange={() => handleAccessibilityToggle('audioDescriptionsEnabled')}
            accessibilityRole="switch"
            accessibilityState={{ checked: a11yPrefs.audioDescriptionsEnabled }}
            accessibilityLabel="Audio descriptions"
          />
        </View>

        <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
          <View style={styles.preferenceLabel}>
            <Ionicons name="radio" size={20} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.preferenceName, { color: colors.text }]}>Screen Reader Optimized</Text>
              <Text style={[styles.preferenceDescription, { color: colors.text }]}>Optimizes layout for screen reader navigation</Text>
            </View>
          </View>
          <Switch
            value={a11yPrefs.screenReaderOptimized}
            onValueChange={() => handleAccessibilityToggle('screenReaderOptimized')}
            accessibilityRole="switch"
            accessibilityState={{ checked: a11yPrefs.screenReaderOptimized }}
            accessibilityLabel="Screen reader optimized"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Interaction Settings</Text>

        <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
          <View style={styles.preferenceLabel}>
            <Ionicons name="phone-portrait" size={20} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.preferenceName, { color: colors.text }]}>Haptic Feedback</Text>
              <Text style={[styles.preferenceDescription, { color: colors.text }]}>Vibration feedback on interactions</Text>
            </View>
          </View>
          <Switch
            value={a11yPrefs.hapticFeedback}
            onValueChange={() => handleAccessibilityToggle('hapticFeedback')}
            accessibilityRole="switch"
            accessibilityState={{ checked: a11yPrefs.hapticFeedback }}
            accessibilityLabel="Haptic feedback"
          />
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <A11yPressable
          onPress={() => setStep(userRole === 'pwd' ? 'disability' : userRole === 'supporter' ? 'supporter-info' : 'ally-info')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.buttonText}>Next</Text>
        </A11yPressable>

        <A11yPressable
          onPress={() => setStep('welcome')}
          accessibilityRole="button"
          style={[styles.buttonSecondary, { borderColor: colors.primary }]}
        >
          <Text style={[styles.buttonSecondaryText, { color: colors.primary }]}>Back</Text>
        </A11yPressable>
      </View>
    </ScrollView>
  );

  const renderSupporterProfile = () => (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
      <A11yTitle level={2} style={[styles.stepTitle, { color: colors.text }]}>
        Your Support Role
      </A11yTitle>
      <Text style={[styles.stepSubtitle, { color: colors.text }]}>
        Help us understand how you support people with disabilities so we can provide relevant resources.
      </Text>

      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Relationship to Person with Disability</Text>

        {[
          { id: 'family', label: 'Family Member' },
          { id: 'friend', label: 'Friend' },
          { id: 'caregiver', label: 'Caregiver' },
          { id: 'healthcare', label: 'Healthcare Professional' },
          { id: 'other', label: 'Other' },
        ].map(relationship => (
          <A11yPressable
            key={relationship.id}
            onPress={() =>
              setSupporterProfile(prev => ({
                ...prev,
                relationshipToPWD: prev.relationshipToPWD === relationship.id ? '' : relationship.id,
              }))
            }
            accessibilityRole="radio"
            accessibilityState={{ checked: supporterProfile.relationshipToPWD === relationship.id }}
            style={[
              styles.disabilityOption,
              {
                backgroundColor:
                  supporterProfile.relationshipToPWD === relationship.id ? colors.primary + '20' : colors.background,
                borderColor:
                  supporterProfile.relationshipToPWD === relationship.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name="person"
              size={24}
              color={
                supporterProfile.relationshipToPWD === relationship.id ? colors.primary : colors.text
              }
            />
            <Text
              style={[
                styles.disabilityOptionText,
                {
                  color:
                    supporterProfile.relationshipToPWD === relationship.id ? colors.primary : colors.text,
                },
              ]}
            >
              {relationship.label}
            </Text>
          </A11yPressable>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Types of Support You Provide</Text>

        {[
          { id: 'emotional', label: 'Emotional Support' },
          { id: 'practical', label: 'Practical Assistance' },
          { id: 'financial', label: 'Financial Support' },
          { id: 'advocacy', label: 'Advocacy & Navigation' },
          { id: 'transportation', label: 'Transportation' },
        ].map(support => (
          <A11yPressable
            key={support.id}
            onPress={() =>
              setSupporterProfile(prev => ({
                ...prev,
                supportType: prev.supportType.includes(support.id)
                  ? prev.supportType.filter(s => s !== support.id)
                  : [...prev.supportType, support.id],
              }))
            }
            accessibilityRole="checkbox"
            accessibilityState={{ checked: supporterProfile.supportType.includes(support.id) }}
            style={[styles.accommodationOption, { borderColor: colors.border }]}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: supporterProfile.supportType.includes(support.id)
                    ? colors.primary
                    : 'transparent',
                  borderColor: colors.primary,
                },
              ]}
            >
              {supporterProfile.supportType.includes(support.id) && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text style={[styles.accommodationLabel, { color: colors.text }]}>
              {support.label}
            </Text>
          </A11yPressable>
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        <A11yPressable
          onPress={() => setStep('ready')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.buttonText}>Complete Setup</Text>
        </A11yPressable>

        <A11yPressable
          onPress={() => setStep('accessibility')}
          accessibilityRole="button"
          style={[styles.buttonSecondary, { borderColor: colors.primary }]}
        >
          <Text style={[styles.buttonSecondaryText, { color: colors.primary }]}>Back</Text>
        </A11yPressable>
      </View>
    </ScrollView>
  );

  const renderAllyProfile = () => (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
      <A11yTitle level={2} style={[styles.stepTitle, { color: colors.text }]}>
        Your Advocacy Work
      </A11yTitle>
      <Text style={[styles.stepSubtitle, { color: colors.text }]}>
        Tell us about your advocacy and professional work so we can suggest relevant initiatives.
      </Text>

      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Type of Ally</Text>

        {[
          { id: 'nonprofit', label: 'Nonprofit / NGO' },
          { id: 'government', label: 'Government Official' },
          { id: 'lawyer', label: 'Lawyer / Legal Professional' },
          { id: 'healthcare', label: 'Healthcare Professional' },
          { id: 'academic', label: 'Academic / Researcher' },
          { id: 'business', label: 'Business / Corporate' },
          { id: 'individual', label: 'Individual Advocate' },
        ].map(type => (
          <A11yPressable
            key={type.id}
            onPress={() =>
              setAllyProfile(prev => ({
                ...prev,
                allyType: prev.allyType === type.id ? '' : type.id,
              }))
            }
            accessibilityRole="radio"
            accessibilityState={{ checked: allyProfile.allyType === type.id }}
            style={[
              styles.disabilityOption,
              {
                backgroundColor:
                  allyProfile.allyType === type.id ? colors.primary + '20' : colors.background,
                borderColor: allyProfile.allyType === type.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name="briefcase"
              size={24}
              color={allyProfile.allyType === type.id ? colors.primary : colors.text}
            />
            <Text
              style={[
                styles.disabilityOptionText,
                { color: allyProfile.allyType === type.id ? colors.primary : colors.text },
              ]}
            >
              {type.label}
            </Text>
          </A11yPressable>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Advocacy Focus Areas</Text>

        {[
          { id: 'employment', label: 'Employment Rights' },
          { id: 'accessibility', label: 'Accessibility' },
          { id: 'policy', label: 'Policy Reform' },
          { id: 'education', label: 'Education' },
          { id: 'healthcare', label: 'Healthcare Access' },
          { id: 'legal', label: 'Legal Rights' },
        ].map(area => (
          <A11yPressable
            key={area.id}
            onPress={() =>
              setAllyProfile(prev => ({
                ...prev,
                advocacyAreas: prev.advocacyAreas.includes(area.id)
                  ? prev.advocacyAreas.filter(a => a !== area.id)
                  : [...prev.advocacyAreas, area.id],
              }))
            }
            accessibilityRole="checkbox"
            accessibilityState={{ checked: allyProfile.advocacyAreas.includes(area.id) }}
            style={[styles.accommodationOption, { borderColor: colors.border }]}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: allyProfile.advocacyAreas.includes(area.id)
                    ? colors.primary
                    : 'transparent',
                  borderColor: colors.primary,
                },
              ]}
            >
              {allyProfile.advocacyAreas.includes(area.id) && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text style={[styles.accommodationLabel, { color: colors.text }]}>
              {area.label}
            </Text>
          </A11yPressable>
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        <A11yPressable
          onPress={() => setStep('ready')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.buttonText}>Complete Setup</Text>
        </A11yPressable>

        <A11yPressable
          onPress={() => setStep('accessibility')}
          accessibilityRole="button"
          style={[styles.buttonSecondary, { borderColor: colors.primary }]}
        >
          <Text style={[styles.buttonSecondaryText, { color: colors.primary }]}>Back</Text>
        </A11yPressable>
      </View>
    </ScrollView>
  );

  const renderDisabilityProfile = () => (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
      <A11yTitle level={2} style={[styles.stepTitle, { color: colors.text }]}>
        Your Disability Profile
      </A11yTitle>
      <Text style={[styles.stepSubtitle, { color: colors.text }]}>
        Help us personalize your experience. This information helps us suggest relevant resources and accommodations.
      </Text>

      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Primary Disability Category</Text>

        {[
          { id: 'mobility', label: 'Mobility Disability', icon: 'walk' },
          { id: 'visual', label: 'Vision Loss', icon: 'eye-off' },
          { id: 'hearing', label: 'Hearing Loss', icon: 'volume-mute' },
          { id: 'cognitive', label: 'Cognitive Disability', icon: 'brain' },
          { id: 'mental_health', label: 'Mental Health Condition', icon: 'heart' },
          { id: 'chronic_illness', label: 'Chronic Illness', icon: 'medical' },
          { id: 'multiple', label: 'Multiple Disabilities', icon: 'layers' },
          { id: 'prefer_not', label: 'Prefer not to say', icon: 'help-circle' },
        ].map(disability => (
          <A11yPressable
            key={disability.id}
            onPress={() => handleDisabilityOption(disability.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: disabilityProfile.primaryDisability === disability.id }}
            style={[
              styles.disabilityOption,
              {
                backgroundColor: disabilityProfile.primaryDisability === disability.id ? colors.primary + '20' : colors.background,
                borderColor: disabilityProfile.primaryDisability === disability.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name={disability.icon as any}
              size={24}
              color={disabilityProfile.primaryDisability === disability.id ? colors.primary : colors.text}
            />
            <Text style={[
              styles.disabilityOptionText,
              { color: disabilityProfile.primaryDisability === disability.id ? colors.primary : colors.text },
            ]}>
              {disability.label}
            </Text>
          </A11yPressable>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Needed Accommodations</Text>

        {[
          { id: 'accessible_parking', label: 'Accessible Parking' },
          { id: 'interpreters', label: 'Sign Language Interpreters' },
          { id: 'large_print', label: 'Large Print Materials' },
          { id: 'audio_format', label: 'Audio Format Documents' },
          { id: 'extra_time', label: 'Extra Time for Tasks' },
          { id: 'medication_breaks', label: 'Medication/Rest Breaks' },
        ].map(accommodation => (
          <A11yPressable
            key={accommodation.id}
            onPress={() => handleAccommodationToggle(accommodation.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: disabilityProfile.accommodations.includes(accommodation.id) }}
            style={[styles.accommodationOption, { borderColor: colors.border }]}
          >
            <View style={[
              styles.checkbox,
              {
                backgroundColor: disabilityProfile.accommodations.includes(accommodation.id) ? colors.primary : 'transparent',
                borderColor: colors.primary,
              },
            ]}>
              {disabilityProfile.accommodations.includes(accommodation.id) && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text style={[styles.accommodationLabel, { color: colors.text }]}>
              {accommodation.label}
            </Text>
          </A11yPressable>
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        <A11yPressable
          onPress={() => setStep('ready')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.buttonText}>Complete Setup</Text>
        </A11yPressable>

        <A11yPressable
          onPress={() => setStep('accessibility')}
          accessibilityRole="button"
          style={[styles.buttonSecondary, { borderColor: colors.primary }]}
        >
          <Text style={[styles.buttonSecondaryText, { color: colors.primary }]}>Back</Text>
        </A11yPressable>
      </View>
    </ScrollView>
  );

  const renderReady = () => (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.readyContainer}>
        <Ionicons name="checkmark-circle" size={80} color={colors.success} style={{ marginBottom: 24 }} />
        <A11yTitle level={1} style={[styles.readyTitle, { color: colors.text }]}>
          You're All Set!
        </A11yTitle>
        <Text style={[styles.readyDescription, { color: colors.text }]}>
          Your accessibility preferences and profile have been saved.
        </Text>

        <View style={[styles.readyCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="bulb" size={24} color={colors.warning} />
          <Text style={[styles.readyCardText, { color: colors.text }]}>
            Pro tip: You can update these settings anytime in the Settings tab.
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <A11yPressable
            onPress={proceedToLogin}
            accessibilityRole="button"
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </A11yPressable>

          <A11yPressable
            onPress={() => router.push('/(auth)/register' as Href)}
            accessibilityRole="button"
            style={[styles.buttonSecondary, { borderColor: colors.primary }]}
          >
            <Text style={[styles.buttonSecondaryText, { color: colors.primary }]}>Create Account</Text>
          </A11yPressable>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <A11yWrapper
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
    >
      {step === 'role-select' && renderRoleSelect()}
      {step === 'welcome' && renderWelcome()}
      {step === 'accessibility' && renderAccessibility()}
      {step === 'disability' && userRole === 'pwd' && renderDisabilityProfile()}
      {step === 'supporter-info' && userRole === 'supporter' && renderSupporterProfile()}
      {step === 'ally-info' && userRole === 'ally' && renderAllyProfile()}
      {step === 'ready' && renderReady()}
    </A11yWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  roleCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  roleCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  stepSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    opacity: 0.7,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  preferenceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  preferenceDescription: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  fontSizeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  fontSizeButtonText: {
    fontWeight: 'bold',
  },
  disabilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  disabilityOptionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  accommodationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accommodationLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 24,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  readyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  readyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  readyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  readyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  readyCardText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});
