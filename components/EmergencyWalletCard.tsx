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
import { HIT_SLOP_8 } from "../constants/a11y";
import { MAX_FONT_SCALE } from "../hooks/useA11y";
import { useTextScale } from "../theme/typography";
import { useAppPalette } from "../theme/usePalette";
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
    } catch (error) {
      console.warn("Failed to load emergency info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEmergencyInfo = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(info));
      Alert.alert("Saved", "Emergency information has been saved securely on your device.");
    } catch (error) {
      Alert.alert("Error", "Failed to save emergency information.");
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
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      accessibilityLabel="Emergency wallet card form"
      accessible
    >
      <View style={styles.header}>
        <Ionicons name="medical" size={24} color={palette.primary} />
        <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Emergency Wallet Card
        </Text>
      </View>

      <Text style={styles.description} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Create a digital emergency card with your key medical and contact information for quick access when needed.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Personal Information
        </Text>
        
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={info.fullName}
          onChangeText={(text) => setInfo({ ...info, fullName: text })}
          placeholder="Enter your full name"
          accessibilityLabel="Full name"
          accessibilityHint="Enter your complete legal name"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          value={info.dateOfBirth}
          onChangeText={(text) => setInfo({ ...info, dateOfBirth: text })}
          placeholder="MM/DD/YYYY"
          accessibilityLabel="Date of birth"
          accessibilityHint="Enter your date of birth in month, day, year format"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />

        <Text style={styles.label}>Blood Type (if known)</Text>
        <TextInput
          style={styles.input}
          value={info.bloodType}
          onChangeText={(text) => setInfo({ ...info, bloodType: text })}
          placeholder="e.g., A+, O-, AB+"
          accessibilityLabel="Blood type"
          accessibilityHint="Enter your blood type if known"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Medical Information
        </Text>
        
        <Text style={styles.label}>Medical Conditions</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={info.medicalConditions}
          onChangeText={(text) => setInfo({ ...info, medicalConditions: text })}
          placeholder="List any medical conditions, disabilities, or chronic illnesses"
          multiline
          numberOfLines={3}
          accessibilityLabel="Medical conditions"
          accessibilityHint="List any medical conditions that emergency responders should know about"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />

        <Text style={styles.label}>Current Medications</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={info.medications}
          onChangeText={(text) => setInfo({ ...info, medications: text })}
          placeholder="List medications with dosages"
          multiline
          numberOfLines={3}
          accessibilityLabel="Current medications"
          accessibilityHint="List all medications you currently take"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />

        <Text style={styles.label}>Allergies</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={info.allergies}
          onChangeText={(text) => setInfo({ ...info, allergies: text })}
          placeholder="List any allergies or adverse reactions"
          multiline
          numberOfLines={2}
          accessibilityLabel="Allergies"
          accessibilityHint="List any known allergies or adverse reactions"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Emergency Contacts
        </Text>
        
        {info.emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactTitle}>Contact {index + 1}</Text>
              {info.emergencyContacts.length > 1 && (
                <A11yPressable
                  onPress={() => removeEmergencyContact(index)}
                  style={styles.removeButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove contact ${index + 1}`}
                  hitSlop={HIT_SLOP_8}
                >
                  <Ionicons name="close-circle" size={20} color={palette.error} />
                </A11yPressable>
              )}
            </View>
            
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={contact.name}
              onChangeText={(text) => updateEmergencyContact(index, "name", text)}
              placeholder="Contact name"
              accessibilityLabel={`Emergency contact ${index + 1} name`}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />

            <Text style={styles.label}>Relationship</Text>
            <TextInput
              style={styles.input}
              value={contact.relationship}
              onChangeText={(text) => updateEmergencyContact(index, "relationship", text)}
              placeholder="e.g., Spouse, Parent, Friend"
              accessibilityLabel={`Emergency contact ${index + 1} relationship`}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={contact.phone}
              onChangeText={(text) => updateEmergencyContact(index, "phone", text)}
              placeholder="Phone number"
              keyboardType="phone-pad"
              accessibilityLabel={`Emergency contact ${index + 1} phone number`}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
          </View>
        ))}

        <A11yPressable
          style={styles.addContactButton}
          onPress={addEmergencyContact}
          accessibilityRole="button"
          accessibilityLabel="Add another emergency contact"
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="add" size={20} color={palette.primary} />
          <Text style={styles.addContactText}>Add Another Contact</Text>
        </A11yPressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Additional Notes
        </Text>
        
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={info.additionalNotes}
          onChangeText={(text) => setInfo({ ...info, additionalNotes: text })}
          placeholder="Any additional information that might be helpful in an emergency"
          multiline
          numberOfLines={4}
          accessibilityLabel="Additional emergency notes"
          accessibilityHint="Add any other information that would be helpful in an emergency"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />
      </View>

      <A11yPressable
        style={styles.saveButton}
        onPress={saveEmergencyInfo}
        accessibilityRole="button"
        accessibilityLabel="Save emergency information"
        accessibilityHint="Saves your emergency information securely on this device"
        hitSlop={HIT_SLOP_8}
      >
        <Ionicons name="save" size={20} color="white" />
        <Text style={styles.saveButtonText}>Save Emergency Information</Text>
      </A11yPressable>

      <View style={styles.privacyNote}>
        <Ionicons name="shield-checkmark" size={16} color={palette.text} />
        <Text style={styles.privacyText}>
          All information is stored securely on your device only. Nothing is shared with external servers.
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