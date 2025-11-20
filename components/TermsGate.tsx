import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

import { useAppPalette } from "../theme/usePalette";

import GapView from "./GapView";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

const STORAGE_KEY = "empowr.legal.acceptance.v3";
const CURRENT_TERMS_VERSION = "3.0";
const CURRENT_PRIVACY_VERSION = "2.0";

type AcceptanceState = {
  termsVersion: string | null;
  privacyVersion: string | null;
  medicalDisclaimer: boolean;
  legalDisclaimer: boolean;
  financialDisclaimer: boolean;
  aiDisclaimer: boolean;
  crisisDisclaimer: boolean;
  emergencyDisclaimer: boolean;
  userResponsibility: boolean;
  dataOwnership: boolean;
};

type Step =
  | "welcome"
  | "terms"
  | "privacy"
  | "medical"
  | "legal"
  | "financial"
  | "ai"
  | "crisis"
  | "final";

export default function TermsGate({ children }: { children: React.ReactNode }) {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  
  const [loading, setLoading] = React.useState(true);
  const [accepted, setAccepted] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<Step>("welcome");
  
  // Individual acceptance checkboxes
  const [medicalChecked, setMedicalChecked] = React.useState(false);
  const [legalChecked, setLegalChecked] = React.useState(false);
  const [financialChecked, setFinancialChecked] = React.useState(false);
  const [aiChecked, setAiChecked] = React.useState(false);
  const [crisisChecked, setCrisisChecked] = React.useState(false);
  const [emergencyChecked, setEmergencyChecked] = React.useState(false);
  const [responsibilityChecked, setResponsibilityChecked] = React.useState(false);
  const [dataOwnershipChecked, setDataOwnershipChecked] = React.useState(false);
  
  // Scroll tracking
  const [termsScrolledToBottom, setTermsScrolledToBottom] = React.useState(false);
  const [privacyScrolledToBottom, setPrivacyScrolledToBottom] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage?.getItem?.(STORAGE_KEY);
        if (raw) {
          const state: AcceptanceState = JSON.parse(raw);
          // Check if versions match and all disclaimers accepted
          if (
            state.termsVersion === CURRENT_TERMS_VERSION &&
            state.privacyVersion === CURRENT_PRIVACY_VERSION &&
            state.medicalDisclaimer &&
            state.legalDisclaimer &&
            state.financialDisclaimer &&
            state.aiDisclaimer &&
            state.crisisDisclaimer &&
            state.emergencyDisclaimer &&
            state.userResponsibility &&
            state.dataOwnership
          ) {
            setAccepted(true);
          }
        }
      } catch {
        // If error, require re-acceptance
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null; // splash/loading handled by app
  if (accepted) return <>{children}</>;

  const saveAcceptance = async () => {
    const state: AcceptanceState = {
      termsVersion: CURRENT_TERMS_VERSION,
      privacyVersion: CURRENT_PRIVACY_VERSION,
      medicalDisclaimer: true,
      legalDisclaimer: true,
      financialDisclaimer: true,
      aiDisclaimer: true,
      crisisDisclaimer: true,
      emergencyDisclaimer: true,
      userResponsibility: true,
      dataOwnership: true,
    };
    try {
      await AsyncStorage?.setItem?.(STORAGE_KEY, JSON.stringify(state));
      setAccepted(true);
    } catch {
      // Handle error - could show alert
    }
  };

  const allDisclaimersAccepted =
    medicalChecked &&
    legalChecked &&
    financialChecked &&
    aiChecked &&
    crisisChecked &&
    emergencyChecked &&
    responsibilityChecked &&
    dataOwnershipChecked;

  const handleScroll = (event: any, type: "terms" | "privacy") => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (type === "terms" && isAtBottom) {
      setTermsScrolledToBottom(true);
    } else if (type === "privacy" && isAtBottom) {
      setPrivacyScrolledToBottom(true);
    }
  };

  const openFullDocument = (type: "terms" | "privacy") => {
    const url =
      type === "terms"
        ? "https://3mpwrapp.pages.dev/terms/"
        : "https://3mpwrapp.pages.dev/privacy/";
    Linking.openURL(url).catch(() => {});
  };

  const renderCheckbox = (
    checked: boolean,
    onToggle: () => void,
    label: string
  ) => (
    <Pressable
      onPress={onToggle}
      style={styles.checkboxRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={16} color={palette.onPrimary} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <View style={styles.card}>
            <Text style={styles.title}>⚠️ Welcome to 3mpwrApp</Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={[styles.text, { fontSize: 16, fontWeight: "600", marginBottom: 12 }]}>
                Before you begin, you must review and accept our legal terms and disclaimers.
              </Text>
              <Text style={styles.text}>
                This app provides information and tools for people with disabilities, but it is NOT a substitute for professional services.
              </Text>
              <Text style={[styles.text, { marginTop: 12, fontWeight: "600" }]}>
                📋 You will be asked to review:
              </Text>
              <Text style={styles.text}>
                • Terms of Service (v{CURRENT_TERMS_VERSION}){'\n'}
                • Privacy Policy (v{CURRENT_PRIVACY_VERSION}){'\n'}
                • Medical Disclaimer{'\n'}
                • Legal Disclaimer{'\n'}
                • Financial Disclaimer{'\n'}
                • AI Content Disclaimer{'\n'}
                • Crisis & Emergency Services Disclaimer{'\n'}
                • User Responsibility Agreement
              </Text>
              <Text style={[styles.text, { marginTop: 12, fontWeight: "600", color: palette.error }]}>
                ⚠️ You must accept ALL terms to use this app.
              </Text>
            </ScrollView>
            <Pressable
              onPress={() => setCurrentStep("terms")}
              style={styles.button}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </View>
        );

      case "terms":
        return (
          <View style={styles.card}>
            <Text style={styles.title}>Terms of Service v{CURRENT_TERMS_VERSION}</Text>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={{ paddingBottom: 12 }}
              onScroll={(e) => handleScroll(e, "terms")}
              scrollEventThrottle={400}
            >
              <Text style={[styles.text, { fontWeight: "600", marginBottom: 8 }]}>
                BY USING THIS APP, YOU AGREE TO THESE TERMS AND ALL DISCLAIMERS.
              </Text>
              <Text style={styles.text}>
                This app provides general information and tools only. It does NOT provide:{'\n\n'}
                • Medical advice, diagnosis, or treatment{'\n'}
                • Legal advice or attorney-client relationship{'\n'}
                • Financial, investment, or tax advice{'\n'}
                • Emergency or crisis intervention services{'\n'}
                • Professional counseling or therapy{'\n\n'}
                
                <Text style={{ fontWeight: "600" }}>LIMITATION OF LIABILITY:{'\n'}</Text>
                We are not liable for any damages resulting from your use of this app. Maximum liability: $100 USD or $0 for free users.{'\n\n'}
                
                <Text style={{ fontWeight: "600" }}>NO WARRANTY:{'\n'}</Text>
                This app is provided "AS IS" without any warranty. We do not guarantee accuracy, completeness, or fitness for any purpose.{'\n\n'}
                
                <Text style={{ fontWeight: "600" }}>USER RESPONSIBILITY:{'\n'}</Text>
                You are solely responsible for your decisions and actions. Always consult qualified professionals.{'\n\n'}
                
                <Text style={{ fontWeight: "600" }}>Please scroll to the bottom to continue.</Text>
              </Text>
              <Pressable
                onPress={() => openFullDocument("terms")}
                style={styles.link}
                accessibilityRole="link"
              >
                <Text style={styles.linkText}>📄 Read Full Terms of Service</Text>
              </Pressable>
            </ScrollView>
            <GapView style={styles.buttonRow}>
              <Pressable
                onPress={() => setCurrentStep("welcome")}
                style={[styles.button, styles.buttonSecondary]}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => setCurrentStep("privacy")}
                style={[styles.button, !termsScrolledToBottom && styles.buttonDisabled]}
                disabled={!termsScrolledToBottom}
              >
                <Text style={styles.buttonText}>
                  {termsScrolledToBottom ? "Next" : "Scroll to Bottom"}
                </Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "privacy":
        return (
          <View style={styles.card}>
            <Text style={styles.title}>Privacy Policy v{CURRENT_PRIVACY_VERSION}</Text>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={{ paddingBottom: 12 }}
              onScroll={(e) => handleScroll(e, "privacy")}
              scrollEventThrottle={400}
            >
              <Text style={[styles.text, { fontWeight: "600", marginBottom: 8 }]}>
                🔐 100% USER DATA OWNERSHIP GUARANTEE
              </Text>
              <Text style={styles.text}>
                Your data belongs entirely to you. 3mpwrApp is built on complete user data sovereignty:{'\n\n'}
                
                • 🏠 100% User Ownership: All data belongs to you{'\n'}
                • 🔒 Local-First & Air-Gapped: Processing on your device{'\n'}
                • ☁️ Your Cloud, Your Control: Optional sync to YOUR services{'\n'}
                • 🚫 Zero Tracking: No analytics without consent{'\n'}
                • 🛡️ AES-256 Encryption: Military-grade security{'\n'}
                • 🤖 Local AI Processing: No external AI model access{'\n\n'}
                
                <Text style={{ fontWeight: "600" }}>WHAT WE COLLECT:{'\n'}</Text>
                • Account info (if you create one): name, email{'\n'}
                • Preferences: accessibility, language, settings{'\n'}
                • Community posts (if enabled): messages, media{'\n'}
                • Optional analytics: pseudonymous identifiers{'\n\n'}
                
                <Text style={{ fontWeight: "600" }}>WE DO NOT:{'\n'}</Text>
                • Sell your personal data{'\n'}
                • Share data with third parties without consent{'\n'}
                • Track you across other apps or websites{'\n'}
                • Store sensitive data on our servers{'\n\n'}
                
                <Text style={{ fontWeight: "600" }}>Please scroll to the bottom to continue.</Text>
              </Text>
              <Pressable
                onPress={() => openFullDocument("privacy")}
                style={styles.link}
                accessibilityRole="link"
              >
                <Text style={styles.linkText}>📄 Read Full Privacy Policy</Text>
              </Pressable>
            </ScrollView>
            <GapView style={styles.buttonRow}>
              <Pressable
                onPress={() => setCurrentStep("terms")}
                style={[styles.button, styles.buttonSecondary]}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => setCurrentStep("medical")}
                style={[styles.button, !privacyScrolledToBottom && styles.buttonDisabled]}
                disabled={!privacyScrolledToBottom}
              >
                <Text style={styles.buttonText}>
                  {privacyScrolledToBottom ? "Next" : "Scroll to Bottom"}
                </Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "medical":
        return (
          <View style={styles.card}>
            <Text style={styles.title}>🏥 Medical Disclaimer</Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={[styles.text, { fontWeight: "700", color: palette.error, marginBottom: 8 }]}>
                ⚠️ THIS APP DOES NOT PROVIDE MEDICAL ADVICE
              </Text>
              <Text style={styles.text}>
                3mpwrApp is NOT a medical device and does NOT provide medical advice, diagnosis, or treatment.{'\n\n'}
                
                • All wellness features are informational tools only{'\n'}
                • Symptom trackers, mood logs, and pain forecasts cannot diagnose conditions{'\n'}
                • Exercise guides and nutrition information are general guidance only{'\n'}
                • DO NOT rely on this app for medical decisions{'\n'}
                • Always consult qualified healthcare providers{'\n'}
                • IN EMERGENCIES, CALL 911 IMMEDIATELY{'\n\n'}
                
                We are not licensed medical professionals and assume NO responsibility for health outcomes.
              </Text>
            </ScrollView>
            {renderCheckbox(
              medicalChecked,
              () => setMedicalChecked(!medicalChecked),
              "I understand this app does not provide medical advice and I will consult healthcare professionals for medical decisions."
            )}
            <GapView style={styles.buttonRow}>
              <Pressable
                onPress={() => setCurrentStep("privacy")}
                style={[styles.button, styles.buttonSecondary]}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => setCurrentStep("legal")}
                style={[styles.button, !medicalChecked && styles.buttonDisabled]}
                disabled={!medicalChecked}
              >
                <Text style={styles.buttonText}>Next</Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "legal":
        return (
          <View style={styles.card}>
            <Text style={styles.title}>⚖️ Legal Disclaimer</Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={[styles.text, { fontWeight: "700", color: palette.error, marginBottom: 8 }]}>
                ⚠️ THIS APP DOES NOT PROVIDE LEGAL ADVICE
              </Text>
              <Text style={styles.text}>
                3mpwrApp does NOT provide legal advice and does NOT create an attorney-client relationship.{'\n\n'}
                
                • All legal resources are general information only{'\n'}
                • Form generators and templates may not fit your situation{'\n'}
                • Laws and procedures vary by jurisdiction{'\n'}
                • Legal information may be incomplete or outdated{'\n'}
                • DO NOT rely on this app for legal decisions{'\n'}
                • Always consult a licensed attorney in your jurisdiction{'\n'}
                • Filing errors can have serious legal consequences{'\n\n'}
                
                We are not licensed attorneys and assume NO responsibility for legal outcomes.
              </Text>
            </ScrollView>
            {renderCheckbox(
              legalChecked,
              () => setLegalChecked(!legalChecked),
              "I understand this app does not provide legal advice and I will consult licensed attorneys for legal matters."
            )}
            <GapView style={styles.buttonRow}>
              <Pressable
                onPress={() => setCurrentStep("medical")}
                style={[styles.button, styles.buttonSecondary]}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => setCurrentStep("financial")}
                style={[styles.button, !legalChecked && styles.buttonDisabled]}
                disabled={!legalChecked}
              >
                <Text style={styles.buttonText}>Next</Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "financial":
        return (
          <View style={styles.card}>
            <Text style={styles.title}>💰 Financial Disclaimer</Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={[styles.text, { fontWeight: "700", color: palette.error, marginBottom: 8 }]}>
                ⚠️ THIS APP DOES NOT PROVIDE FINANCIAL ADVICE
              </Text>
              <Text style={styles.text}>
                3mpwrApp does NOT provide financial, investment, or tax advice.{'\n\n'}
                
                • Benefits information is general guidance only{'\n'}
                • Financial situations are unique to each person{'\n'}
                • Tax laws and benefit regulations vary and change frequently{'\n'}
                • DO NOT rely on this app for financial decisions{'\n'}
                • Always consult qualified financial advisors and tax professionals{'\n\n'}
                
                We are not licensed financial professionals and assume NO responsibility for financial outcomes.
              </Text>
            </ScrollView>
            {renderCheckbox(
              financialChecked,
              () => setFinancialChecked(!financialChecked),
              "I understand this app does not provide financial advice and I will consult financial professionals for financial decisions."
            )}
            <GapView style={styles.buttonRow}>
              <Pressable
                onPress={() => setCurrentStep("legal")}
                style={[styles.button, styles.buttonSecondary]}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => setCurrentStep("ai")}
                style={[styles.button, !financialChecked && styles.buttonDisabled]}
                disabled={!financialChecked}
              >
                <Text style={styles.buttonText}>Next</Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "ai":
        return (
          <View style={styles.card}>
            <Text style={styles.title}>🤖 AI Content Disclaimer</Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={[styles.text, { fontWeight: "700", color: palette.error, marginBottom: 8 }]}>
                ⚠️ AI-GENERATED CONTENT MAY CONTAIN ERRORS
              </Text>
              <Text style={styles.text}>
                This app uses artificial intelligence for document generation, case interpretation, translation, and other features.{'\n\n'}
                
                • AI models can produce incorrect or incomplete content{'\n'}
                • AI may have biases or cultural insensitivities{'\n'}
                • AI does not understand context like human professionals{'\n'}
                • AI has knowledge cutoffs and may not reflect current laws{'\n'}
                • AI translations may not capture legal terminology accurately{'\n'}
                • ALWAYS verify AI-generated content with professionals{'\n\n'}
                
                AI is a tool only—final responsibility rests with YOU.
              </Text>
            </ScrollView>
            {renderCheckbox(
              aiChecked,
              () => setAiChecked(!aiChecked),
              "I understand AI-generated content may contain errors and I will verify all AI output with qualified professionals."
            )}
            <GapView style={styles.buttonRow}>
              <Pressable
                onPress={() => setCurrentStep("financial")}
                style={[styles.button, styles.buttonSecondary]}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => setCurrentStep("crisis")}
                style={[styles.button, !aiChecked && styles.buttonDisabled]}
                disabled={!aiChecked}
              >
                <Text style={styles.buttonText}>Next</Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "crisis":
        return (
          <View style={styles.card}>
            <Text style={styles.title}>🚨 Crisis & Emergency Disclaimer</Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={[styles.text, { fontWeight: "700", color: palette.error, marginBottom: 8 }]}>
                ⚠️ THIS APP IS NOT A SUBSTITUTE FOR EMERGENCY SERVICES
              </Text>
              <Text style={styles.text}>
                IF YOU OR SOMEONE ELSE IS IN IMMEDIATE DANGER:{'\n\n'}
                
                <Text style={{ fontWeight: "700", fontSize: 18 }}>CALL 911 IMMEDIATELY{'\n\n'}</Text>
                
                • This app CANNOT detect, prevent, or respond to emergencies{'\n'}
                • Crisis resource listings are informational only{'\n'}
                • The panic button and safe landing page are support tools—they do NOT alert emergency services{'\n'}
                • We are not responsible for delays or consequences in emergencies{'\n\n'}
                
                <Text style={{ fontWeight: "600" }}>Crisis Resources:{'\n'}</Text>
                • 988 Suicide & Crisis Lifeline: Call/text 988{'\n'}
                • Crisis Text Line: Text HOME to 741741{'\n'}
                • Emergency: 911 (US/Canada){'\n'}
                • Domestic Violence: 1-800-799-7233
              </Text>
            </ScrollView>
            {renderCheckbox(
              crisisChecked,
              () => setCrisisChecked(!crisisChecked),
              "I understand this app is not a substitute for emergency services and I will call 911 in emergencies."
            )}
            {renderCheckbox(
              emergencyChecked,
              () => setEmergencyChecked(!emergencyChecked),
              "I confirm I know how to access emergency services in my location (911 or equivalent)."
            )}
            <GapView style={styles.buttonRow}>
              <Pressable
                onPress={() => setCurrentStep("ai")}
                style={[styles.button, styles.buttonSecondary]}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => setCurrentStep("final")}
                style={[styles.button, !(crisisChecked && emergencyChecked) && styles.buttonDisabled]}
                disabled={!(crisisChecked && emergencyChecked)}
              >
                <Text style={styles.buttonText}>Next</Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "final":
        const uncheckedItems = [];
        if (!medicalChecked) uncheckedItems.push("Medical disclaimer");
        if (!legalChecked) uncheckedItems.push("Legal disclaimer");
        if (!financialChecked) uncheckedItems.push("Financial disclaimer");
        if (!aiChecked) uncheckedItems.push("AI disclaimer");
        if (!crisisChecked) uncheckedItems.push("Crisis disclaimer");
        if (!emergencyChecked) uncheckedItems.push("Emergency services");
        if (!responsibilityChecked) uncheckedItems.push("Personal responsibility");
        if (!dataOwnershipChecked) uncheckedItems.push("Data ownership");

        return (
          <View style={styles.card}>
            <Text style={styles.title}>✅ Final Agreement</Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={[styles.text, { fontWeight: "600", marginBottom: 8 }]}>
                Please confirm you understand and accept:
              </Text>
              {uncheckedItems.length > 0 && (
                <Text style={[styles.text, { color: palette.warning, marginBottom: 12, fontWeight: "600" }]}>
                  ⚠️ You must complete all checkboxes from previous steps. Missing:{'\n'}
                  {uncheckedItems.map((item, i) => `  ${i + 1}. ${item}`).join('\n')}
                  {'\n\n'}Use the "Back" button to review previous steps.
                </Text>
              )}
            </ScrollView>
            {renderCheckbox(
              responsibilityChecked,
              () => setResponsibilityChecked(!responsibilityChecked),
              "I am solely responsible for my decisions and actions. I will not rely on this app as a substitute for professional services."
            )}
            {renderCheckbox(
              dataOwnershipChecked,
              () => setDataOwnershipChecked(!dataOwnershipChecked),
              "I understand my data is 100% owned by me and stored locally on my device unless I choose to sync."
            )}
            <Text style={[styles.text, { marginTop: 12, fontSize: 12, opacity: 0.8 }]}>
              By clicking "I Accept All Terms", you agree to our Terms of Service (v{CURRENT_TERMS_VERSION}), Privacy Policy (v{CURRENT_PRIVACY_VERSION}), and all disclaimers above.
            </Text>
            <GapView style={styles.buttonRow}>
              <Pressable
                onPress={() => setCurrentStep("crisis")}
                style={[styles.button, styles.buttonSecondary]}
                accessibilityRole="button"
                accessibilityLabel="Go back to previous step"
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                onPress={saveAcceptance}
                style={[
                  styles.button, 
                  !allDisclaimersAccepted && styles.buttonDisabled,
                  allDisclaimersAccepted && styles.buttonEnabled
                ]}
                disabled={!allDisclaimersAccepted}
                accessibilityRole="button"
                accessibilityLabel={allDisclaimersAccepted 
                  ? "Accept all terms and continue" 
                  : "Please check all boxes to enable this button"}
                accessibilityState={{ disabled: !allDisclaimersAccepted }}
              >
                <Text style={[
                  styles.buttonText,
                  allDisclaimersAccepted && styles.buttonTextEnabled
                ]}>
                  {allDisclaimersAccepted ? '✓ I Accept All Terms' : 'I Accept All Terms'}
                </Text>
              </Pressable>
            </GapView>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.overlay} accessibilityLabel="Legal Terms and Disclaimers">
      {renderStep()}
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 9999,
    },
    card: {
      width: "100%",
      maxWidth: 560,
      maxHeight: "90%", // Allow card to grow but not exceed screen
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 20,
      shadowColor: palette.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    scrollView: {
      flexGrow: 1,
      flexShrink: 1,
    },
    title: { 
      fontSize: 20, 
      fontWeight: "700", 
      marginBottom: 12, 
      color: palette.text,
      textAlign: "center"
    },
    text: { 
      color: palette.text, 
      opacity: 0.9,
      lineHeight: 20,
      fontSize: 14
    },
    link: { 
      marginTop: 12,
      padding: 8,
      alignItems: "center"
    },
    linkText: { 
      color: palette.primary, 
      fontWeight: "700",
      textDecorationLine: "underline"
    },
    button: {
      marginTop: 12,
      backgroundColor: palette.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      flex: 1,
    },
    buttonText: { 
      color: palette.onPrimary, 
      fontWeight: "700",
      fontSize: 16
    },
    buttonSecondary: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: palette.primary,
    },
    buttonTextSecondary: {
      color: palette.primary,
      fontWeight: "700",
      fontSize: 16
    },
    buttonDisabled: {
      backgroundColor: palette.muted,
      opacity: 0.5,
    },
    buttonEnabled: {
      backgroundColor: palette.success || palette.primary, // Success green color
      borderWidth: 2,
      borderColor: palette.success || palette.primary,
    },
    buttonTextEnabled: {
      fontSize: 17,
      fontWeight: '800',
      color: palette.primary, // White text on green background for contrast
    },
    buttonRow: {
      flexDirection: "row",
      marginTop: 16,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 12,
      paddingVertical: 8,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: palette.primary,
      borderRadius: 4,
      marginRight: 12,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    checkboxChecked: {
      backgroundColor: palette.primary,
    },
    checkboxLabel: {
      flex: 1,
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
    },
  });
}

