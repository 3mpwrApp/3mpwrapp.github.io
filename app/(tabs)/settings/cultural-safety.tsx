import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ComprehensiveDisclaimer from '../../../components/ComprehensiveDisclaimer';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';

interface CulturalSafetyPreferences {
  // Indigenous preferences
  indigenousProtocols: boolean;
  traditionalKnowledgeRespect: boolean;
  ceremonialConsiderations: boolean;
  landAcknowledgment: boolean;
  
  // Cultural communication
  culturalContextAwareness: boolean;
  respectfulLanguage: boolean;
  culturalCompetentResources: boolean;
  communitySpecificGuidance: boolean;
  
  // Religious/spiritual considerations
  religiousAccommodations: boolean;
  spiritualPracticeSupport: boolean;
  faithBasedResources: boolean;
  
  // Intersectional identity support
  intersectionalAwareness: boolean;
  culturalDisabilityModels: boolean;
  familyCenteredApproach: boolean;
  
  // Language and communication
  preferredLanguage: string;
  culturalMediators: boolean;
  interpretationServices: boolean;
  
  // Privacy and consent
  culturalPrivacy: boolean;
  communityConsent: boolean;
  dataGovernance: boolean;
}

const defaultPreferences: CulturalSafetyPreferences = {
  indigenousProtocols: false,
  traditionalKnowledgeRespect: false,
  ceremonialConsiderations: false,
  landAcknowledgment: false,
  culturalContextAwareness: false,
  respectfulLanguage: false,
  culturalCompetentResources: false,
  communitySpecificGuidance: false,
  religiousAccommodations: false,
  spiritualPracticeSupport: false,
  faithBasedResources: false,
  intersectionalAwareness: false,
  culturalDisabilityModels: false,
  familyCenteredApproach: false,
  preferredLanguage: 'en',
  culturalMediators: false,
  interpretationServices: false,
  culturalPrivacy: false,
  communityConsent: false,
  dataGovernance: false,
};

export default function CulturalSafetyScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const [preferences, setPreferences] = useState<CulturalSafetyPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);
  const styles = createStyles(palette);

  React.useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('cultural-safety-preferences:v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load cultural safety preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const savePreferences = async (newPreferences: CulturalSafetyPreferences) => {
    try {
      await AsyncStorage.setItem('cultural-safety-preferences:v1', JSON.stringify(newPreferences));
    } catch (error) {
      console.warn('Failed to save cultural safety preferences:', error);
    }
  };

  const updatePreference = async <K extends keyof CulturalSafetyPreferences>(
    key: K,
    value: CulturalSafetyPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  const SectionHeader = ({ title, description }: { title: string; description?: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {title}
      </Text>
      {description && (
        <Text style={styles.sectionDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {description}
        </Text>
      )}
    </View>
  );

  const SettingItem = ({ 
    title, 
    description, 
    value, 
    onValueChange, 
    disabled = false 
  }: {
    title: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, disabled && styles.disabledText]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.settingDescription, disabled && styles.disabledText]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: palette.muted, true: palette.primary }}
        thumbColor={value ? palette.surface : palette.text}
      />
    </View>
  );

  const CulturalProfileButton = ({ 
    profile, 
    title, 
    description, 
    icon,
    onPress 
  }: {
    profile: string;
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.profileButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${description}`}
    >
      <Text style={styles.profileIcon}>{icon}</Text>
      <View style={styles.profileContent}>
        <Text style={styles.profileTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {title}
        </Text>
        <Text style={styles.profileDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleIndigenousProfile = async () => {
    Alert.alert(
      t('cultural.indigenous.profileTitle', 'Indigenous Cultural Safety'),
      t('cultural.indigenous.profileMessage', 'Enable protocols that respect Indigenous ways of knowing, ceremonial considerations, and traditional approaches to wellness and advocacy?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.enable', 'Enable'),
          onPress: async () => {
            const indigenousPrefs = {
              ...preferences,
              indigenousProtocols: true,
              traditionalKnowledgeRespect: true,
              ceremonialConsiderations: true,
              landAcknowledgment: true,
              culturalContextAwareness: true,
              respectfulLanguage: true,
              intersectionalAwareness: true,
              familyCenteredApproach: true,
              culturalPrivacy: true,
              communityConsent: true,
              dataGovernance: true,
            };
            setPreferences(indigenousPrefs);
            await savePreferences(indigenousPrefs);
          },
        },
      ]
    );
  };

  const handleReligiousProfile = async () => {
    Alert.alert(
      t('cultural.religious.profileTitle', 'Faith-Based Cultural Safety'),
      t('cultural.religious.profileMessage', 'Enable accommodations for religious practices, spiritual wellness approaches, and faith-based resources?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.enable', 'Enable'),
          onPress: async () => {
            const religiousPrefs = {
              ...preferences,
              religiousAccommodations: true,
              spiritualPracticeSupport: true,
              faithBasedResources: true,
              culturalContextAwareness: true,
              respectfulLanguage: true,
              familyCenteredApproach: true,
            };
            setPreferences(religiousPrefs);
            await savePreferences(religiousPrefs);
          },
        },
      ]
    );
  };

  const handleNewcomerProfile = async () => {
    Alert.alert(
      t('cultural.newcomer.profileTitle', 'Newcomer Cultural Safety'),
      t('cultural.newcomer.profileMessage', 'Enable supports for newcomers including interpretation services, cultural navigation, and settlement-specific resources?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.enable', 'Enable'),
          onPress: async () => {
            const newcomerPrefs = {
              ...preferences,
              culturalMediators: true,
              interpretationServices: true,
              culturalContextAwareness: true,
              culturalCompetentResources: true,
              communitySpecificGuidance: true,
              familyCenteredApproach: true,
            };
            setPreferences(newcomerPrefs);
            await savePreferences(newcomerPrefs);
          },
        },
      ]
    );
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cultural.title', 'Cultural Safety & Respect')}
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cultural.subtitle', 'Ensure culturally safe and respectful experiences that honor diverse ways of knowing and being')}
          </Text>
        </View>

        <ComprehensiveDisclaimer type="cultural-safety" />

        {/* Cultural Profiles */}
        <SectionHeader 
          title={t('cultural.profiles.title', 'Cultural Profile Setup')}
          description={t('cultural.profiles.description', 'Quick setup for specific cultural contexts and needs')}
        />
        
        <CulturalProfileButton
          profile="indigenous"
          title={t('cultural.profiles.indigenous', 'Indigenous Cultural Protocols')}
          description={t('cultural.profiles.indigenousDesc', 'Traditional knowledge respect, ceremonial considerations, land acknowledgment')}
          icon="🪶"
          onPress={handleIndigenousProfile}
        />
        
        <CulturalProfileButton
          profile="religious"
          title={t('cultural.profiles.religious', 'Faith-Based Accommodations')}
          description={t('cultural.profiles.religiousDesc', 'Religious practices, spiritual wellness, faith-based resources')}
          icon="🙏"
          onPress={handleReligiousProfile}
        />
        
        <CulturalProfileButton
          profile="newcomer"
          title={t('cultural.profiles.newcomer', 'Newcomer & Immigrant Support')}
          description={t('cultural.profiles.newcomerDesc', 'Cultural navigation, interpretation services, settlement resources')}
          icon="🌍"
          onPress={handleNewcomerProfile}
        />

        {/* Indigenous Considerations */}
        <SectionHeader 
          title={t('cultural.indigenous.title', 'Indigenous Cultural Protocols')}
          description={t('cultural.indigenous.description', 'Respect for Indigenous ways of knowing, being, and healing')}
        />
        
        <SettingItem
          title={t('cultural.indigenous.protocols', 'Indigenous Protocols')}
          description={t('cultural.indigenous.protocolsDesc', 'Apply Indigenous-specific protocols for wellness and advocacy')}
          value={preferences.indigenousProtocols}
          onValueChange={(value) => updatePreference('indigenousProtocols', value)}
        />
        
        <SettingItem
          title={t('cultural.indigenous.traditionalKnowledge', 'Traditional Knowledge Respect')}
          description={t('cultural.indigenous.traditionalDesc', 'Honor traditional healing and wellness practices alongside Western approaches')}
          value={preferences.traditionalKnowledgeRespect}
          onValueChange={(value) => updatePreference('traditionalKnowledgeRespect', value)}
        />
        
        <SettingItem
          title={t('cultural.indigenous.ceremonial', 'Ceremonial Considerations')}
          description={t('cultural.indigenous.ceremonialDesc', 'Acknowledge ceremonial time, sacred practices, and spiritual obligations')}
          value={preferences.ceremonialConsiderations}
          onValueChange={(value) => updatePreference('ceremonialConsiderations', value)}
        />
        
        <SettingItem
          title={t('cultural.indigenous.landAcknowledgment', 'Land Acknowledgment')}
          description={t('cultural.indigenous.landDesc', 'Show acknowledgment of traditional territories and relationships to land')}
          value={preferences.landAcknowledgment}
          onValueChange={(value) => updatePreference('landAcknowledgment', value)}
        />

        {/* Cultural Communication */}
        <SectionHeader 
          title={t('cultural.communication.title', 'Cultural Communication')}
          description={t('cultural.communication.description', 'Respectful and culturally appropriate communication approaches')}
        />
        
        <SettingItem
          title={t('cultural.communication.contextAwareness', 'Cultural Context Awareness')}
          description={t('cultural.communication.contextDesc', 'Consider cultural context in all information and recommendations')}
          value={preferences.culturalContextAwareness}
          onValueChange={(value) => updatePreference('culturalContextAwareness', value)}
        />
        
        <SettingItem
          title={t('cultural.communication.respectfulLanguage', 'Respectful Language')}
          description={t('cultural.communication.respectfulDesc', 'Use culturally appropriate and respectful terminology')}
          value={preferences.respectfulLanguage}
          onValueChange={(value) => updatePreference('respectfulLanguage', value)}
        />
        
        <SettingItem
          title={t('cultural.communication.competentResources', 'Culturally Competent Resources')}
          description={t('cultural.communication.competentDesc', 'Prioritize culturally competent service providers and resources')}
          value={preferences.culturalCompetentResources}
          onValueChange={(value) => updatePreference('culturalCompetentResources', value)}
        />
        
        <SettingItem
          title={t('cultural.communication.communityGuidance', 'Community-Specific Guidance')}
          description={t('cultural.communication.communityDesc', 'Provide guidance specific to cultural communities and contexts')}
          value={preferences.communitySpecificGuidance}
          onValueChange={(value) => updatePreference('communitySpecificGuidance', value)}
        />

        {/* Religious/Spiritual */}
        <SectionHeader 
          title={t('cultural.religious.title', 'Religious & Spiritual Considerations')}
          description={t('cultural.religious.description', 'Accommodations for faith-based approaches to wellness and advocacy')}
        />
        
        <SettingItem
          title={t('cultural.religious.accommodations', 'Religious Accommodations')}
          description={t('cultural.religious.accommodationsDesc', 'Provide accommodations for religious practices and observances')}
          value={preferences.religiousAccommodations}
          onValueChange={(value) => updatePreference('religiousAccommodations', value)}
        />
        
        <SettingItem
          title={t('cultural.religious.spiritualSupport', 'Spiritual Practice Support')}
          description={t('cultural.religious.spiritualDesc', 'Include spiritual wellness practices and considerations')}
          value={preferences.spiritualPracticeSupport}
          onValueChange={(value) => updatePreference('spiritualPracticeSupport', value)}
        />
        
        <SettingItem
          title={t('cultural.religious.faithResources', 'Faith-Based Resources')}
          description={t('cultural.religious.faithDesc', 'Include faith-based support services and resources')}
          value={preferences.faithBasedResources}
          onValueChange={(value) => updatePreference('faithBasedResources', value)}
        />

        {/* Intersectional Identity */}
        <SectionHeader 
          title={t('cultural.intersectional.title', 'Intersectional Identity Support')}
          description={t('cultural.intersectional.description', 'Recognition of multiple, intersecting identities and experiences')}
        />
        
        <SettingItem
          title={t('cultural.intersectional.awareness', 'Intersectional Awareness')}
          description={t('cultural.intersectional.awarenessDesc', 'Consider how cultural, racial, and other identities intersect with disability')}
          value={preferences.intersectionalAwareness}
          onValueChange={(value) => updatePreference('intersectionalAwareness', value)}
        />
        
        <SettingItem
          title={t('cultural.intersectional.disabilityModels', 'Cultural Disability Models')}
          description={t('cultural.intersectional.modelsDesc', 'Acknowledge different cultural understandings of disability and wellness')}
          value={preferences.culturalDisabilityModels}
          onValueChange={(value) => updatePreference('culturalDisabilityModels', value)}
        />
        
        <SettingItem
          title={t('cultural.intersectional.familyCentered', 'Family-Centered Approach')}
          description={t('cultural.intersectional.familyDesc', 'Recognize the role of family and community in cultural contexts')}
          value={preferences.familyCenteredApproach}
          onValueChange={(value) => updatePreference('familyCenteredApproach', value)}
        />

        {/* Language & Interpretation */}
        <SectionHeader 
          title={t('cultural.language.title', 'Language & Interpretation')}
          description={t('cultural.language.description', 'Language access and cultural mediation support')}
        />
        
        <SettingItem
          title={t('cultural.language.mediators', 'Cultural Mediators')}
          description={t('cultural.language.mediatorsDesc', 'Access to cultural mediators who understand both disability and cultural contexts')}
          value={preferences.culturalMediators}
          onValueChange={(value) => updatePreference('culturalMediators', value)}
        />
        
        <SettingItem
          title={t('cultural.language.interpretation', 'Interpretation Services')}
          description={t('cultural.language.interpretationDesc', 'Include information about interpretation services and language access')}
          value={preferences.interpretationServices}
          onValueChange={(value) => updatePreference('interpretationServices', value)}
        />

        {/* Privacy & Consent */}
        <SectionHeader 
          title={t('cultural.privacy.title', 'Cultural Privacy & Consent')}
          description={t('cultural.privacy.description', 'Respect for cultural approaches to privacy, consent, and data sharing')}
        />
        
        <SettingItem
          title={t('cultural.privacy.culturalPrivacy', 'Cultural Privacy Practices')}
          description={t('cultural.privacy.privacyDesc', 'Apply cultural protocols for privacy and information sharing')}
          value={preferences.culturalPrivacy}
          onValueChange={(value) => updatePreference('culturalPrivacy', value)}
        />
        
        <SettingItem
          title={t('cultural.privacy.communityConsent', 'Community Consent Protocols')}
          description={t('cultural.privacy.consentDesc', 'Consider community consent protocols for sensitive cultural information')}
          value={preferences.communityConsent}
          onValueChange={(value) => updatePreference('communityConsent', value)}
        />
        
        <SettingItem
          title={t('cultural.privacy.dataGovernance', 'Cultural Data Governance')}
          description={t('cultural.privacy.governanceDesc', 'Respect cultural data governance principles and community ownership')}
          value={preferences.dataGovernance}
          onValueChange={(value) => updatePreference('dataGovernance', value)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 16,
    },
    header: {
      paddingVertical: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: palette.text,
      opacity: 0.7,
      lineHeight: 22,
    },
    sectionHeader: {
      marginTop: 32,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    sectionDescription: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.7,
      lineHeight: 20,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      backgroundColor: palette.surface,
      borderRadius: 8,
      marginBottom: 8,
    },
    settingItemDisabled: {
      opacity: 0.6,
    },
    settingContent: {
      flex: 1,
      marginRight: 16,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: palette.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.7,
      lineHeight: 18,
    },
    disabledText: {
      opacity: 0.6,
    },
    profileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: palette.surface,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    profileIcon: {
      fontSize: 24,
      marginRight: 16,
    },
    profileContent: {
      flex: 1,
    },
    profileTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    profileDescription: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.7,
      lineHeight: 18,
    },
  });
}