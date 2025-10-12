import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { A11yText, A11yTitle, A11yWrapper } from '../../../components/A11yWrapper';
import { useIndigenousLanguage } from '../../../context/IndigenousLanguageContext';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { useTranslation } from '../../../i18n';

interface LanguageOptionProps {
  language: string;
  nativeName: string;
  isSelected: boolean;
  hasSyllabics: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const LanguageOption: React.FC<LanguageOptionProps> = ({
  language,
  nativeName,
  isSelected,
  hasSyllabics,
  onPress,
  disabled = false,
}) => {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  const colors = {
    primary: textColor,
    card: backgroundColor,
    border: textColor + '20',
    text: textColor,
    textSecondary: textColor + '60',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled }}
      accessibilityLabel={`${language} (${nativeName})${hasSyllabics ? ' with syllabics support' : ''}`}
      style={[
        styles.languageOption,
        {
          backgroundColor: isSelected ? colors.primary + '20' : colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.languageInfo}>
        <Text style={[styles.languageName, { color: colors.text }]}>
          {language}
        </Text>
        <Text style={[styles.nativeName, { color: colors.textSecondary }]}>
          {nativeName}
        </Text>
        {hasSyllabics && (
          <Text style={[styles.syllabicsIndicator, { color: colors.textSecondary }]}>
            ✦ Syllabics supported
          </Text>
        )}
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </Pressable>
  );
};

interface ProtocolSwitchProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  iconName: keyof typeof Ionicons.glyphMap;
}

const ProtocolSwitch: React.FC<ProtocolSwitchProps> = ({
  title,
  description,
  value,
  onValueChange,
  iconName,
}) => {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  const colors = {
    primary: textColor,
    card: backgroundColor,
    border: textColor + '20',
    text: textColor,
    textSecondary: textColor + '60',
  };

  return (
    <View
      style={[styles.protocolItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      accessible
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={`${title}: ${description}`}
    >
      <View style={styles.protocolHeader}>
        <Ionicons name={iconName} size={24} color={colors.primary} />
        <View style={styles.protocolTextContainer}>
          <Text style={[styles.protocolTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.protocolDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={value ? colors.primary : colors.textSecondary}
          ios_backgroundColor={colors.border}
        />
      </View>
    </View>
  );
};

export default function IndigenousLanguageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const { t: _t } = useTranslation();
  const {
    selectedLanguage,
    setSelectedLanguage,
    enableSyllabics,
    setEnableSyllabics,
    culturalProtocols,
    setCulturalProtocols,
    territorialAcknowledgment,
    setTerritorialAcknowledgment,
    availableLanguages,
    getLandAcknowledgment,
    isLoaded,
  } = useIndigenousLanguage();

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

  const handleLanguageSelect = (languageCode: string) => {
    const language = availableLanguages.find(lang => lang.code === languageCode);
    if (language) {
      setSelectedLanguage(languageCode);
      
      // Show acknowledgment for language selection
      Alert.alert(
        'Language Selected',
        `${language.name} (${language.nativeName}) has been selected. Traditional protocols and territorial acknowledgments will be updated accordingly.`,
        [{ text: 'Understood', style: 'default' }]
      );
    }
  };

  const handleProtocolChange = (protocolKey: string) => (value: boolean) => {
    // Since culturalProtocols is a boolean in the context, we'll just toggle it
    setCulturalProtocols(value);
  };

  const showTerritorialAcknowledgment = () => {
    const acknowledgment = getLandAcknowledgment();
    if (acknowledgment) {
      Alert.alert(
        'Territorial Acknowledgment',
        acknowledgment,
        [{ text: 'Mīgwečh / Miigwech / ᖁᔭᓐᓇᒦᒃ', style: 'default' }]
      );
    }
  };

  const showTraditionalProtocols = () => {
    Alert.alert(
      'Traditional Protocols',
      'Traditional protocols help ensure respectful engagement with Indigenous knowledge and cultural practices.',
      [{ text: 'Understood', style: 'default' }]
    );
  };

  if (!isLoaded) {
    return (
      <A11yWrapper style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading Indigenous language settings...
        </Text>
      </A11yWrapper>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[styles.backButton, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <A11yTitle level={1} style={[styles.title, { color: colors.text }]}>
          Indigenous Languages
        </A11yTitle>
      </View>

      {/* Land Acknowledgment Banner */}
      {territorialAcknowledgment && selectedLanguage && (
        <Pressable
          onPress={showTerritorialAcknowledgment}
          accessibilityRole="button"
          accessibilityLabel="View territorial acknowledgment"
          style={[styles.acknowledgmentBanner, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}
        >
          <Ionicons name="location" size={20} color={colors.primary} />
          <A11yText style={[styles.acknowledgmentText, { color: colors.primary }]}>
            Tap to view territorial acknowledgment
          </A11yText>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </Pressable>
      )}

      {/* Language Selection */}
      <View style={styles.section}>
        <A11yTitle level={2} style={[styles.sectionTitle, { color: colors.text }]}>
          Select Indigenous Language
        </A11yTitle>
        <A11yText style={[styles.sectionDescription, { color: colors.textSecondary }]}>
          Choose your preferred Indigenous language for cultural content and protocols.
        </A11yText>

        {availableLanguages.map((language) => (
          <LanguageOption
            key={language.code}
            language={language.name}
            nativeName={language.nativeName}
            isSelected={selectedLanguage === language.code}
            hasSyllabics={false}
            onPress={() => handleLanguageSelect(language.code)}
          />
        ))}
      </View>

      {/* Syllabics Support */}
      {selectedLanguage && false && (
        <View style={styles.section}>
          <ProtocolSwitch
            title="Enable Syllabics"
            description="Display text in traditional syllabic writing system when available"
            value={enableSyllabics}
            onValueChange={setEnableSyllabics}
            iconName="text"
          />
        </View>
      )}

      {/* Cultural Protocols */}
      <View style={styles.section}>
        <A11yTitle level={2} style={[styles.sectionTitle, { color: colors.text }]}>
          Cultural Protocols
        </A11yTitle>
        <A11yText style={[styles.sectionDescription, { color: colors.textSecondary }]}>
          Configure traditional protocols and cultural considerations.
        </A11yText>

        <ProtocolSwitch
          title="Enable Cultural Protocols"
          description="Apply traditional protocols for ceremonial and sacred content, elder guidance, traditional healing, community-centered approach, and seasonal protocols"
          value={culturalProtocols}
          onValueChange={setCulturalProtocols}
          iconName="star"
        />
      </View>

      {/* Territorial Acknowledgment */}
      <View style={styles.section}>
        <ProtocolSwitch
          title="Territorial Acknowledgment"
          description="Display traditional territory acknowledgments"
          value={territorialAcknowledgment}
          onValueChange={setTerritorialAcknowledgment}
          iconName="map"
        />
      </View>

      {/* View Protocols Button */}
      {selectedLanguage && (
        <Pressable
          onPress={showTraditionalProtocols}
          accessibilityRole="button"
          accessibilityLabel="View traditional protocols for selected language"
          style={[styles.protocolsButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="book" size={20} color="white" />
          <Text style={styles.protocolsButtonText}>
            View Traditional Protocols
          </Text>
        </Pressable>
      )}

      {/* Cultural Safety Note */}
      <View style={[styles.culturalNote, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
        <A11yText style={[styles.culturalNoteText, { color: colors.textSecondary }]}>
          These settings ensure cultural safety and appropriate protocols are followed when accessing Indigenous content and traditional knowledge.
        </A11yText>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 12,
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
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  acknowledgmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  acknowledgmentText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 14,
    marginBottom: 2,
  },
  syllabicsIndicator: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  protocolItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  protocolTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  protocolTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  protocolDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  protocolsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  protocolsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  culturalNote: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  culturalNoteText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
});
