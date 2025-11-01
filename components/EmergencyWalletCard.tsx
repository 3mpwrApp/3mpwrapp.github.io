import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { HIT_SLOP_8 } from "../constants/A11Y";
import { MAX_FONT_SCALE } from "../hooks/useA11y";
import { useTranslation } from "../i18n";
import { useTextScale } from "../theme/typography";
import { useAppPalette } from "../theme/usePalette";
import { logger } from '../utils/logger';

import A11yPressable from "./A11yPressable";

type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
};

type EmergencyInfo = {
  fullName: string;
  dateOfBirth: string;
  medicalConditions: string;
  medications: string;
  allergies: string;
  bloodType: string;
  emergencyContacts: EmergencyContact[];
  additionalNotes: string;
};

const STORAGE_KEY = "emergency_wallet_card_v1";

export default function EmergencyWalletCard() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const { t } = useTranslation();

  const [info, setInfo] = useState<EmergencyInfo>({
    fullName: "",
    dateOfBirth: "",
    medicalConditions: "",
    medications: "",
    allergies: "",
    bloodType: "",
    emergencyContacts: [{ name: "", relationship: "", phone: "" }],
    additionalNotes: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    loadEmergencyInfo();
  }, []);

  const loadEmergencyInfo = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setInfo(JSON.parse(saved));
      }
    } catch {
      logger.warn("Failed to load emergency info");
    } finally {
      setIsLoading(false);
    }
  };

  const saveEmergencyInfo = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(info));
      Alert.alert(t('common.saved','Saved'), t('emergencyWalletCard.savedBody','Emergency information has been saved securely on your device.'));
  } catch {
      Alert.alert(t('common.error','Error'), t('emergencyWalletCard.saveFailed','Failed to save emergency information.'));
    }
  };

  const addEmergencyContact = () => {
    setInfo({
      ...info,
      emergencyContacts: [
        ...info.emergencyContacts,
        { name: "", relationship: "", phone: "" },
      ],
    });
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...info.emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setInfo({ ...info, emergencyContacts: updated });
  };

  const removeEmergencyContact = (index: number) => {
    if (info.emergencyContacts.length > 1) {
      const updated = info.emergencyContacts.filter((_, i) => i !== index);
      setInfo({ ...info, emergencyContacts: updated });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading','Loading...')}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      accessibilityLabel={t('emergencyWalletCard.a11y.form','Emergency wallet card form')}
      accessible={true}
    >
      <View style={styles.header}>
        <Ionicons name="medical" size={24} color={palette.primary} />
        <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('settings.emergency.title','Emergency Wallet Card')}
        </Text>
      </View>

      <Text style={styles.description} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('settings.emergency.description','Create a digital emergency card with your key information for quick access when needed')}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {t('emergencyWalletCard.personalInfo','Personal Information')}
        </Text>
        
        <Text style={styles.label}>{t('emergencyWalletCard.fullName','Full Name')}</Text>
        <TextInput
          style={styles.input}
          value={info.fullName}
          onChangeText={(text) => setInfo({ ...info, fullName: text })}
          placeholder={t('emergencyWalletCard.fullNamePh','Enter your full name')}
          accessibilityLabel={t('emergencyWalletCard.fullName','Full Name')}
          accessibilityHint={t('emergencyWalletCard.fullNameHint','Enter your complete legal name')}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />

        <Text style={styles.label}>{t('emergencyWalletCard.dob','Date of Birth')}</Text>
        <TextInput
          style={styles.input}
          value={info.dateOfBirth}
          onChangeText={(text) => setInfo({ ...info, dateOfBirth: text })}
          placeholder={t('emergencyWalletCard.dobPh','MM/DD/YYYY')}
          accessibilityLabel={t('emergencyWalletCard.dob','Date of Birth')}
          accessibilityHint={t('emergencyWalletCard.dobHint','Enter your date of birth in month, day, year format')}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />

        <Text style={styles.label}>{t('emergencyWalletCard.blood','Blood Type (if known)')}</Text>
        <TextInput
          style={styles.input}
          value={info.bloodType}
          onChangeText={(text) => setInfo({ ...info, bloodType: text })}
          placeholder={t('emergencyWalletCard.bloodPh','e.g., A+, O-, AB+')}
          accessibilityLabel={t('emergencyWalletCard.blood','Blood Type (if known)')}
          accessibilityHint={t('emergencyWalletCard.bloodHint','Enter your blood type if known')}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {t('emergencyWalletCard.medicalInfo','Medical Information')}
        </Text>
        
        <Text style={styles.label}>{t('emergencyWalletCard.conditions','Medical Conditions')}</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={info.medicalConditions}
          onChangeText={(text) => setInfo({ ...info, medicalConditions: text })}
          placeholder={t('emergencyWalletCard.conditionsPh','List any medical conditions, disabilities, or chronic illnesses')}
          multiline={true}
          numberOfLines={3}
          accessibilityLabel={t('emergencyWalletCard.conditions','Medical Conditions')}
          accessibilityHint={t('emergencyWalletCard.conditionsHint','List any medical conditions that emergency responders should know about')}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />

        <Text style={styles.label}>{t('emergencyWalletCard.meds','Current Medications')}</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={info.medications}
          onChangeText={(text) => setInfo({ ...info, medications: text })}
          placeholder={t('emergencyWalletCard.medsPh','List medications with dosages')}
          multiline={true}
          numberOfLines={3}
          accessibilityLabel={t('emergencyWalletCard.meds','Current Medications')}
          accessibilityHint={t('emergencyWalletCard.medsHint','List all medications you currently take')}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />

        <Text style={styles.label}>{t('emergencyWalletCard.allergies','Allergies')}</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={info.allergies}
          onChangeText={(text) => setInfo({ ...info, allergies: text })}
          placeholder={t('emergencyWalletCard.allergiesPh','List any allergies or adverse reactions')}
          multiline={true}
          numberOfLines={2}
          accessibilityLabel={t('emergencyWalletCard.allergies','Allergies')}
          accessibilityHint={t('emergencyWalletCard.allergiesHint','List any known allergies or adverse reactions')}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {t('emergencyWalletCard.contacts','Emergency Contacts')}
        </Text>
        
        {info.emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactTitle}>{t('emergencyWalletCard.contactN','Contact {{n}}',{ n: index + 1 })}</Text>
              {info.emergencyContacts.length > 1 && (
                <A11yPressable
                  onPress={() => removeEmergencyContact(index)}
                  style={styles.removeButton}
                  accessibilityRole="button"
                  accessibilityLabel={t('emergencyWalletCard.removeContactN','Remove contact {{n}}',{ n: index + 1 })}
                  hitSlop={HIT_SLOP_8}
                >
                  <Ionicons name="close-circle" size={20} color={palette.error} />
                </A11yPressable>
              )}
            </View>
            
            <Text style={styles.label}>{t('emergencyWalletCard.name','Name')}</Text>
            <TextInput
              style={styles.input}
              value={contact.name}
              onChangeText={(text) => updateEmergencyContact(index, "name", text)}
              placeholder={t('emergencyWalletCard.namePh','Contact name')}
              accessibilityLabel={t('emergencyWalletCard.contactNameN','Emergency contact {{n}} name',{ n: index + 1 })}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />

            <Text style={styles.label}>{t('emergencyWalletCard.relationship','Relationship')}</Text>
            <TextInput
              style={styles.input}
              value={contact.relationship}
              onChangeText={(text) => updateEmergencyContact(index, "relationship", text)}
              placeholder={t('emergencyWalletCard.relationshipPh','e.g., Spouse, Parent, Friend')}
              accessibilityLabel={t('emergencyWalletCard.contactRelationshipN','Emergency contact {{n}} relationship',{ n: index + 1 })}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />

            <Text style={styles.label}>{t('emergencyWalletCard.phone','Phone Number')}</Text>
            <TextInput
              style={styles.input}
              value={contact.phone}
              onChangeText={(text) => updateEmergencyContact(index, "phone", text)}
              placeholder={t('emergencyWalletCard.phonePh','Phone number')}
              keyboardType="phone-pad"
              accessibilityLabel={t('emergencyWalletCard.contactPhoneN','Emergency contact {{n}} phone number',{ n: index + 1 })}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
          </View>
        ))}

        <A11yPressable
          style={styles.addContactButton}
          onPress={addEmergencyContact}
          accessibilityRole="button"
          accessibilityLabel={t('emergencyWalletCard.addContact','Add another emergency contact')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="add" size={20} color={palette.primary} />
          <Text style={styles.addContactText}>{t('emergencyWalletCard.addContactBtn','Add Another Contact')}</Text>
        </A11yPressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {t('emergencyWalletCard.notes','Additional Notes')}
        </Text>
        
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={info.additionalNotes}
          onChangeText={(text) => setInfo({ ...info, additionalNotes: text })}
          placeholder={t('emergencyWalletCard.notesPh','Any additional information that might be helpful in an emergency')}
          multiline={true}
          numberOfLines={4}
          accessibilityLabel={t('emergencyWalletCard.notes','Additional Notes')}
          accessibilityHint={t('emergencyWalletCard.notesHint','Add any other information that would be helpful in an emergency')}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />
      </View>

      <A11yPressable
        style={styles.saveButton}
        onPress={saveEmergencyInfo}
        accessibilityRole="button"
        accessibilityLabel={t('emergencyWalletCard.save','Save emergency information')}
        accessibilityHint={t('emergencyWalletCard.saveHint','Saves your emergency information securely on this device')}
        hitSlop={HIT_SLOP_8}
      >
        <Ionicons name="save" size={20} color="white" />
        <Text style={styles.saveButtonText}>{t('emergencyWalletCard.saveBtn','Save Emergency Information')}</Text>
      </A11yPressable>

      <View style={styles.privacyNote}>
        <Ionicons name="shield-checkmark" size={16} color={palette.text} />
        <Text style={styles.privacyText}>
          {t('emergencyWalletCard.privacy','All information is stored securely on your device only. Nothing is shared with external servers.')}
        </Text>
      </View>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
      padding: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: Math.round(20 * factor),
      fontWeight: "700",
      color: palette.text,
      marginLeft: 8,
    },
    description: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.8,
      marginBottom: 24,
      lineHeight: Math.round(20 * factor),
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: Math.round(16 * factor),
      fontWeight: "600",
      color: palette.text,
      marginBottom: 12,
    },
    label: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      marginBottom: 4,
      marginTop: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      fontSize: Math.round(14 * factor),
      color: palette.text,
      backgroundColor: palette.background,
      minHeight: 44, // WCAG minimum tap target
    },
    multilineInput: {
      minHeight: Math.round(80 * factor),
      textAlignVertical: "top",
    },
    contactCard: {
      backgroundColor: palette.card,
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    contactHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    contactTitle: {
      fontSize: Math.round(14 * factor),
      fontWeight: "600",
      color: palette.text,
    },
    removeButton: {
      padding: 4,
      minWidth: 44,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    addContactButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderWidth: 1,
      borderColor: palette.primary,
      borderRadius: 8,
      borderStyle: "dashed",
      minHeight: 44,
    },
    addContactText: {
      color: palette.primary,
      fontSize: Math.round(14 * factor),
      marginLeft: 8,
    },
    saveButton: {
      backgroundColor: palette.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
      minHeight: 44,
    },
    saveButtonText: {
      color: "white",
      fontSize: Math.round(16 * factor),
      fontWeight: "600",
      marginLeft: 8,
    },
    privacyNote: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 12,
      backgroundColor: palette.card,
      borderRadius: 8,
      marginBottom: 20,
    },
    privacyText: {
      fontSize: Math.round(12 * factor),
      color: palette.text,
      opacity: 0.7,
      marginLeft: 8,
      flex: 1,
      lineHeight: Math.round(16 * factor),
    },
    loadingText: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      textAlign: "center",
      marginTop: 50,
    },
  });
}
