import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    AccessibilityInfo,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

import { HIT_SLOP_12 } from "../constants/A11Y";
import { checkTestLabBypass } from "../services/testLabBypass";
import { useAppPalette } from "../theme/usePalette";
import { createShadow } from "../utils/shadow";

import GapView from "./GapView";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (err) {
  console.error('[TermsGate] AsyncStorage not available:', err);
  // Provide mock AsyncStorage for environments where it's not available
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };
}

const STORAGE_KEY = "empowr.legal.acceptance.v3";
const PROGRESS_STORAGE_KEY = "empowr.legal.progress.v1";
const CURRENT_TERMS_VERSION = "3.0";
const CURRENT_PRIVACY_VERSION = "2.0";

// Accessibility constants - WCAG minimum 44px tap targets
const MIN_TAP_SIZE = 44;
const CHECKBOX_SIZE = 44;

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

// Progress state for resuming later
type ProgressState = {
  mode: ReviewMode;
  currentStep: Step;
  termsScrolledToBottom: boolean;
  privacyScrolledToBottom: boolean;
  medicalChecked: boolean;
  legalChecked: boolean;
  financialChecked: boolean;
  aiChecked: boolean;
  crisisChecked: boolean;
  emergencyChecked: boolean;
  responsibilityChecked: boolean;
  dataOwnershipChecked: boolean;
  lastSaved: number;
};

type ReviewMode = "quick" | "detailed";

type Step =
  | "mode-selection"
  | "welcome"
  | "terms"
  | "privacy"
  | "medical"
  | "legal"
  | "financial"
  | "ai"
  | "crisis"
  | "final"
  // Quick mode steps
  | "quick-overview"
  | "quick-disclaimers"
  | "quick-final";

const DETAILED_STEPS: Step[] = [
  "welcome", "terms", "privacy", "medical", "legal", "financial", "ai", "crisis", "final"
];
const QUICK_STEPS: Step[] = ["quick-overview", "quick-disclaimers", "quick-final"];

function getStepNumber(step: Step, mode: ReviewMode): number {
  const steps = mode === "quick" ? QUICK_STEPS : DETAILED_STEPS;
  const index = steps.indexOf(step);
  return index >= 0 ? index + 1 : 1;
}

function getTotalSteps(mode: ReviewMode): number {
  return mode === "quick" ? QUICK_STEPS.length : DETAILED_STEPS.length;
}

function getEstimatedTime(mode: ReviewMode): string {
  return mode === "quick" ? "~2 minutes" : "~8-10 minutes";
}

export default function TermsGate({ children }: { children: React.ReactNode }) {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  
  const [loading, setLoading] = React.useState(true);
  const [accepted, setAccepted] = React.useState(false);
  const [reviewMode, setReviewMode] = React.useState<ReviewMode | null>(null);
  const [currentStep, setCurrentStep] = React.useState<Step>("mode-selection");
  const [hasResumableProgress, setHasResumableProgress] = React.useState(false);
  
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
  
  // Refs for scroll views
  const termsScrollRef = React.useRef<ScrollView>(null);
  const privacyScrollRef = React.useRef<ScrollView>(null);

  // Save progress to AsyncStorage
  const saveProgress = React.useCallback(async (step: Step, mode: ReviewMode) => {
    const progress: ProgressState = {
      mode,
      currentStep: step,
      termsScrolledToBottom,
      privacyScrolledToBottom,
      medicalChecked,
      legalChecked,
      financialChecked,
      aiChecked,
      crisisChecked,
      emergencyChecked,
      responsibilityChecked,
      dataOwnershipChecked,
      lastSaved: Date.now(),
    };
    try {
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Silent failure
    }
  }, [termsScrolledToBottom, privacyScrolledToBottom, medicalChecked, legalChecked, 
      financialChecked, aiChecked, crisisChecked, emergencyChecked, 
      responsibilityChecked, dataOwnershipChecked]);

  // Load saved progress
  const loadProgress = async (): Promise<ProgressState | null> => {
    try {
      const raw = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      if (raw) {
        const progress: ProgressState = JSON.parse(raw);
        // Check if progress is less than 24 hours old
        const isRecent = Date.now() - progress.lastSaved < 24 * 60 * 60 * 1000;
        return isRecent ? progress : null;
      }
    } catch {}
    return null;
  };

  // Resume from saved progress
  const resumeProgress = async () => {
    const progress = await loadProgress();
    if (progress) {
      setReviewMode(progress.mode);
      setCurrentStep(progress.currentStep);
      setTermsScrolledToBottom(progress.termsScrolledToBottom);
      setPrivacyScrolledToBottom(progress.privacyScrolledToBottom);
      setMedicalChecked(progress.medicalChecked);
      setLegalChecked(progress.legalChecked);
      setFinancialChecked(progress.financialChecked);
      setAiChecked(progress.aiChecked);
      setCrisisChecked(progress.crisisChecked);
      setEmergencyChecked(progress.emergencyChecked);
      setResponsibilityChecked(progress.responsibilityChecked);
      setDataOwnershipChecked(progress.dataOwnershipChecked);
      
      AccessibilityInfo.announceForAccessibility(
        `Resuming from step ${getStepNumber(progress.currentStep, progress.mode)} of ${getTotalSteps(progress.mode)}`
      );
    }
  };

  // Clear saved progress
  const clearProgress = async () => {
    try {
      await AsyncStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {}
  };

  React.useEffect(() => {
    (async () => {
      try {
        // Check for Firebase Test Lab / E2E test bypass FIRST
        const testLabBypass = await checkTestLabBypass();
        if (testLabBypass) {
          setAccepted(true);
          setLoading(false);
          return;
        }

        const raw = await AsyncStorage.getItem(STORAGE_KEY);
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
            await clearProgress();
          }
        }
        
        // Check for resumable progress
        const progress = await loadProgress();
        if (progress) {
          setHasResumableProgress(true);
        }
      } catch (err) {
        console.error('[TermsGate] Init error:', err);
        // If error, require re-acceptance
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null; // splash/loading handled by app
  if (accepted) return <>{children}</>;

  // Quick accept all for automated testing (triggered by testID button)
  const quickAcceptAll = async () => {
    await saveAcceptance();
  };

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
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      await clearProgress(); // Clear progress on successful completion
      setAccepted(true);
    } catch {
      // Handle error - could show alert
    }
  };

  // Navigate to next step with progress saving
  const goToStep = async (step: Step) => {
    setCurrentStep(step);
    if (reviewMode) {
      await saveProgress(step, reviewMode);
      // Announce step change for screen readers
      const stepNum = getStepNumber(step, reviewMode);
      const total = getTotalSteps(reviewMode);
      AccessibilityInfo.announceForAccessibility(
        `Step ${stepNum} of ${total}`
      );
    }
  };

  // Skip to bottom for screen reader users
  const skipToBottom = (scrollRef: React.RefObject<ScrollView | null>) => {
    scrollRef.current?.scrollToEnd({ animated: true });
    AccessibilityInfo.announceForAccessibility(
      "Scrolled to bottom. You can now proceed to the next step."
    );
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
      accessibilityLabel={label}
      hitSlop={HIT_SLOP_12}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={24} color={palette.onPrimary} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );

  // Progress indicator component
  const renderProgressIndicator = () => {
    if (!reviewMode) return null;
    const stepNum = getStepNumber(currentStep, reviewMode);
    const total = getTotalSteps(reviewMode);
    const progress = stepNum / total;
    
    return (
      <View 
        style={styles.progressContainer}
        accessibilityRole="progressbar"
        accessibilityValue={{ now: stepNum, min: 1, max: total }}
        accessibilityLabel={`Step ${stepNum} of ${total}`}
      >
        <View style={styles.progressHeader}>
          <Text style={[styles.progressText, { color: palette.text }]}>
            Step {stepNum} of {total}
          </Text>
          <Text style={[styles.progressTime, { color: palette.textSecondary }]}>
            {getEstimatedTime(reviewMode)} total
          </Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: palette.surface }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { backgroundColor: palette.primary, width: `${progress * 100}%` }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case "mode-selection":
        return (
          <View style={styles.card} testID="terms-gate-mode-selection">
            <Text style={styles.title} accessibilityRole="header">
              ⚖️ Legal Review Required
            </Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={[styles.text, { fontSize: 16, marginBottom: 16 }]}>
                Before using 3mpwrApp, you must review and accept our legal terms and disclaimers.
              </Text>
              
              {/* Resume option if progress exists */}
              {hasResumableProgress && (
                <Pressable
                  onPress={() => resumeProgress()}
                  style={[styles.modeCard, { borderColor: palette.success, backgroundColor: palette.success + '15' }]}
                  accessibilityRole="button"
                  accessibilityLabel="Resume previous progress"
                  hitSlop={HIT_SLOP_12}
                >
                  <View style={styles.modeCardContent}>
                    <Ionicons name="bookmark" size={28} color={palette.success} />
                    <View style={styles.modeCardText}>
                      <Text style={[styles.modeTitle, { color: palette.success }]}>
                        📌 Continue Where You Left Off
                      </Text>
                      <Text style={[styles.modeDesc, { color: palette.text }]}>
                        Resume your saved progress from before.
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )}
              
              <Text style={[styles.text, { fontWeight: "600", marginBottom: 12, marginTop: 8 }]}>
                Choose your review style:
              </Text>
              
              {/* Quick Review Option */}
              <Pressable
                onPress={() => {
                  setReviewMode("quick");
                  goToStep("quick-overview");
                }}
                style={[styles.modeCard, { borderColor: palette.primary }]}
                accessibilityRole="button"
                accessibilityLabel="Quick Review, 3 steps, about 2 minutes. Recommended for most users."
                hitSlop={HIT_SLOP_12}
              >
                <View style={styles.modeCardContent}>
                  <Ionicons name="flash" size={28} color={palette.primary} />
                  <View style={styles.modeCardText}>
                    <Text style={[styles.modeTitle, { color: palette.primary }]}>
                      ⚡ Quick Review
                    </Text>
                    <Text style={[styles.modeDesc, { color: palette.text }]}>
                      3 steps • ~2 minutes{'\n'}
                      Summarized terms with single acceptance
                    </Text>
                    <Text style={[styles.modeBadge, { color: palette.success }]}>
                      ✓ Recommended for most users
                    </Text>
                  </View>
                </View>
              </Pressable>
              
              {/* Detailed Review Option */}
              <Pressable
                onPress={() => {
                  setReviewMode("detailed");
                  goToStep("welcome");
                }}
                style={[styles.modeCard, { borderColor: palette.textSecondary }]}
                accessibilityRole="button"
                accessibilityLabel="Detailed Review, 9 steps, about 8 to 10 minutes. For those who want to read everything."
                hitSlop={HIT_SLOP_12}
              >
                <View style={styles.modeCardContent}>
                  <Ionicons name="document-text" size={28} color={palette.textSecondary} />
                  <View style={styles.modeCardText}>
                    <Text style={[styles.modeTitle, { color: palette.text }]}>
                      📋 Detailed Review
                    </Text>
                    <Text style={[styles.modeDesc, { color: palette.text }]}>
                      9 steps • ~8-10 minutes{'\n'}
                      Full text of each disclaimer separately
                    </Text>
                    <Text style={[styles.modeBadge, { color: palette.textSecondary }]}>
                      For those who want to read everything
                    </Text>
                  </View>
                </View>
              </Pressable>
            </ScrollView>
            
            {/* Quick-accept for automated testing */}
            <Pressable
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={quickAcceptAll}
              accessibilityLabel="Quick Accept All Terms"
              accessibilityHint="Accept all terms for automated testing"
              testID="terms-quick-accept"
              style={styles.testSkipButton}
            >
              <Text style={{ fontSize: 10, color: palette.muted }}>Skip (Test)</Text>
            </Pressable>
          </View>
        );

      // QUICK MODE STEPS
      case "quick-overview":
        return (
          <View style={styles.card}>
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">
              📋 Terms Overview
            </Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={[styles.text, { fontSize: 16, fontWeight: "600", marginBottom: 12 }]}>
                Here's a plain-language summary of what you're agreeing to:
              </Text>
              
              <View style={styles.summaryBox}>
                <Text style={[styles.summaryItem, { color: palette.text }]}>
                  <Text style={{ fontWeight: "700" }}>🏥 Medical:</Text> This app doesn't provide medical advice. Always see real doctors for health decisions.
                </Text>
              </View>
              
              <View style={styles.summaryBox}>
                <Text style={[styles.summaryItem, { color: palette.text }]}>
                  <Text style={{ fontWeight: "700" }}>⚖️ Legal:</Text> This app isn't a lawyer. Get professional legal help for legal matters.
                </Text>
              </View>
              
              <View style={styles.summaryBox}>
                <Text style={[styles.summaryItem, { color: palette.text }]}>
                  <Text style={{ fontWeight: "700" }}>💰 Financial:</Text> This app can't give financial advice. Consult professionals for money decisions.
                </Text>
              </View>
              
              <View style={styles.summaryBox}>
                <Text style={[styles.summaryItem, { color: palette.text }]}>
                  <Text style={{ fontWeight: "700" }}>🤖 AI Content:</Text> AI can make mistakes. Always double-check AI-generated content.
                </Text>
              </View>
              
              <View style={styles.summaryBox}>
                <Text style={[styles.summaryItem, { color: palette.text }]}>
                  <Text style={{ fontWeight: "700" }}>🚨 Emergencies:</Text> In any emergency, call 911 immediately. This app cannot help in emergencies.
                </Text>
              </View>
              
              <View style={styles.summaryBox}>
                <Text style={[styles.summaryItem, { color: palette.text }]}>
                  <Text style={{ fontWeight: "700" }}>🔐 Your Data:</Text> You own 100% of your data. It stays on your device unless you choose to sync.
                </Text>
              </View>
              
              <View style={styles.linksRow}>
                <Pressable
                  onPress={() => openFullDocument("terms")}
                  style={styles.link}
                  accessibilityRole="link"
                  hitSlop={HIT_SLOP_12}
                >
                  <Text style={styles.linkText}>📄 Full Terms</Text>
                </Pressable>
                <Pressable
                  onPress={() => openFullDocument("privacy")}
                  style={styles.link}
                  accessibilityRole="link"
                  hitSlop={HIT_SLOP_12}
                >
                  <Text style={styles.linkText}>🔐 Privacy Policy</Text>
                </Pressable>
              </View>
            </ScrollView>
            <GapView style={styles.buttonRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("mode-selection")}
                style={[styles.button, styles.buttonSecondary]}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("quick-disclaimers")}
                style={styles.button}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonText}>Next</Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "quick-disclaimers":
        return (
          <View style={styles.card}>
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">
              ⚠️ Important Disclaimers
            </Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={[styles.text, { fontSize: 15, fontWeight: "600", marginBottom: 16, color: palette.error }]}>
                Please read and check each box to confirm you understand:
              </Text>
            </ScrollView>
            
            {renderCheckbox(
              medicalChecked && legalChecked && financialChecked,
              () => {
                const newValue = !(medicalChecked && legalChecked && financialChecked);
                setMedicalChecked(newValue);
                setLegalChecked(newValue);
                setFinancialChecked(newValue);
              },
              "I understand this app does NOT provide medical, legal, or financial advice. I will consult qualified professionals for these matters."
            )}
            
            {renderCheckbox(
              aiChecked,
              () => setAiChecked(!aiChecked),
              "I understand AI-generated content may contain errors and I will verify important information."
            )}
            
            {renderCheckbox(
              crisisChecked && emergencyChecked,
              () => {
                const newValue = !(crisisChecked && emergencyChecked);
                setCrisisChecked(newValue);
                setEmergencyChecked(newValue);
              },
              "I understand that in any emergency, I must call 911 immediately. This app is NOT a substitute for emergency services."
            )}
            
            <GapView style={styles.buttonRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("quick-overview")}
                style={[styles.button, styles.buttonSecondary]}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("quick-final")}
                style={[
                  styles.button, 
                  !(medicalChecked && legalChecked && financialChecked && aiChecked && crisisChecked && emergencyChecked) && styles.buttonDisabled
                ]}
                disabled={!(medicalChecked && legalChecked && financialChecked && aiChecked && crisisChecked && emergencyChecked)}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[
                  styles.buttonText, 
                  !(medicalChecked && legalChecked && financialChecked && aiChecked && crisisChecked && emergencyChecked) && styles.buttonTextDisabled
                ]}>
                  Next
                </Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "quick-final":
        return (
          <View style={styles.card}>
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">
              ✅ Final Agreement
            </Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={[styles.text, { fontSize: 15, marginBottom: 12 }]}>
                You're almost done! Please confirm these final items:
              </Text>
            </ScrollView>
            
            {renderCheckbox(
              responsibilityChecked,
              () => setResponsibilityChecked(!responsibilityChecked),
              "I am responsible for my own decisions. This app is a tool to help me, not a replacement for professional services."
            )}
            
            {renderCheckbox(
              dataOwnershipChecked,
              () => setDataOwnershipChecked(!dataOwnershipChecked),
              "I understand my data belongs to me and is stored on my device."
            )}
            
            <Text style={[styles.text, { marginTop: 16, fontSize: 12, opacity: 0.8 }]}>
              By clicking "I Accept All Terms", you agree to our Terms of Service (v{CURRENT_TERMS_VERSION}), Privacy Policy (v{CURRENT_PRIVACY_VERSION}), and all disclaimers.
            </Text>
            
            <GapView style={styles.buttonRow}>
              <Pressable
                onPress={() => goToStep("quick-disclaimers")}
                style={[styles.button, styles.buttonSecondary]}
                accessibilityRole="button"
                hitSlop={HIT_SLOP_12}
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
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[
                  styles.buttonText,
                  !allDisclaimersAccepted && styles.buttonTextDisabled,
                  allDisclaimersAccepted && styles.buttonTextEnabled
                ]}>
                  {allDisclaimersAccepted ? '✓ I Accept All Terms' : 'I Accept All Terms'}
                </Text>
              </Pressable>
            </GapView>
          </View>
        );

      // DETAILED MODE STEPS
      case "welcome":
        return (
          <View style={styles.card} testID="terms-gate-welcome">
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">⚠️ Welcome to 3mpwrApp</Text>
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
            <GapView style={styles.buttonRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("mode-selection")}
                style={[styles.button, styles.buttonSecondary]}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => goToStep("terms")}
                style={styles.button}
                accessibilityRole="button"
                accessibilityLabel="Continue to terms"
                testID="terms-continue-button"
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </Pressable>
            </GapView>
            {/* Quick-accept for automated testing - Robo can tap this 
                Made visible as small button in corner for Robo to find */}
            <Pressable
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={quickAcceptAll}
              accessibilityLabel="Quick Accept All Terms"
              accessibilityHint="Accept all terms for automated testing"
              testID="terms-quick-accept"
              style={styles.testSkipButton}
            >
              <Text style={{ fontSize: 10, color: palette.muted }}>Skip (Test)</Text>
            </Pressable>
          </View>
        );

      case "terms":
        return (
          <View style={styles.card}>
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">Terms of Service v{CURRENT_TERMS_VERSION}</Text>
            
            {/* Skip to bottom button for screen reader users */}
            <Pressable
              onPress={() => skipToBottom(termsScrollRef)}
              style={styles.skipToBottomButton}
              accessibilityRole="button"
              accessibilityLabel="Skip to bottom of terms. Use this if you've read the terms before."
              hitSlop={HIT_SLOP_12}
            >
              <Ionicons name="arrow-down" size={16} color={palette.primary} />
              <Text style={[styles.skipToBottomText, { color: palette.primary }]}>
                Skip to Bottom
              </Text>
            </Pressable>
            
            <ScrollView
              ref={termsScrollRef}
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
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.linkText}>📄 Read Full Terms of Service</Text>
              </Pressable>
            </ScrollView>
            <GapView style={styles.buttonRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("welcome")}
                style={[styles.button, styles.buttonSecondary]}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("privacy")}
                style={[styles.button, !termsScrolledToBottom && styles.buttonDisabled]}
                disabled={!termsScrolledToBottom}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[styles.buttonText, !termsScrolledToBottom && styles.buttonTextDisabled]}>
                  {termsScrolledToBottom ? "Next" : "Scroll to Bottom"}
                </Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "privacy":
        return (
          <View style={styles.card}>
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">Privacy Policy v{CURRENT_PRIVACY_VERSION}</Text>
            
            {/* Skip to bottom button for screen reader users */}
            <Pressable
              onPress={() => skipToBottom(privacyScrollRef)}
              style={styles.skipToBottomButton}
              accessibilityRole="button"
              accessibilityLabel="Skip to bottom of privacy policy. Use this if you've read it before."
              hitSlop={HIT_SLOP_12}
            >
              <Ionicons name="arrow-down" size={16} color={palette.primary} />
              <Text style={[styles.skipToBottomText, { color: palette.primary }]}>
                Skip to Bottom
              </Text>
            </Pressable>
            
            <ScrollView
              ref={privacyScrollRef}
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
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.linkText}>📄 Read Full Privacy Policy</Text>
              </Pressable>
            </ScrollView>
            <GapView style={styles.buttonRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("terms")}
                style={[styles.button, styles.buttonSecondary]}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("medical")}
                style={[styles.button, !privacyScrolledToBottom && styles.buttonDisabled]}
                disabled={!privacyScrolledToBottom}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[styles.buttonText, !privacyScrolledToBottom && styles.buttonTextDisabled]}>
                  {privacyScrolledToBottom ? "Next" : "Scroll to Bottom"}
                </Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "medical":
        return (
          <View style={styles.card}>
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">🏥 Medical Disclaimer</Text>
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
                accessibilityRole="button"
                onPress={() => goToStep("privacy")}
                style={[styles.button, styles.buttonSecondary]}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("legal")}
                style={[styles.button, !medicalChecked && styles.buttonDisabled]}
                disabled={!medicalChecked}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[styles.buttonText, !medicalChecked && styles.buttonTextDisabled]}>Next</Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "legal":
        return (
          <View style={styles.card}>
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">⚖️ Legal Disclaimer</Text>
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
                accessibilityRole="button"
                onPress={() => goToStep("medical")}
                style={[styles.button, styles.buttonSecondary]}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("financial")}
                style={[styles.button, !legalChecked && styles.buttonDisabled]}
                disabled={!legalChecked}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[styles.buttonText, !legalChecked && styles.buttonTextDisabled]}>Next</Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "financial":
        return (
          <View style={styles.card}>
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">💰 Financial Disclaimer</Text>
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
                accessibilityRole="button"
                onPress={() => goToStep("legal")}
                style={[styles.button, styles.buttonSecondary]}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("ai")}
                style={[styles.button, !financialChecked && styles.buttonDisabled]}
                disabled={!financialChecked}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[styles.buttonText, !financialChecked && styles.buttonTextDisabled]}>Next</Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "ai":
        return (
          <View style={styles.card}>
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">🤖 AI Content Disclaimer</Text>
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
                accessibilityRole="button"
                onPress={() => goToStep("financial")}
                style={[styles.button, styles.buttonSecondary]}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("crisis")}
                style={[styles.button, !aiChecked && styles.buttonDisabled]}
                disabled={!aiChecked}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[styles.buttonText, !aiChecked && styles.buttonTextDisabled]}>Next</Text>
              </Pressable>
            </GapView>
          </View>
        );

      case "crisis":
        return (
          <View style={styles.card}>
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">🚨 Crisis & Emergency Disclaimer</Text>
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
                accessibilityRole="button"
                onPress={() => goToStep("ai")}
                style={[styles.button, styles.buttonSecondary]}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => goToStep("final")}
                style={[styles.button, !(crisisChecked && emergencyChecked) && styles.buttonDisabled]}
                disabled={!(crisisChecked && emergencyChecked)}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[styles.buttonText, !(crisisChecked && emergencyChecked) && styles.buttonTextDisabled]}>Next</Text>
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
            {renderProgressIndicator()}
            <Text style={styles.title} accessibilityRole="header">✅ Final Agreement</Text>
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
                onPress={() => goToStep("crisis")}
                style={[styles.button, styles.buttonSecondary]}
                accessibilityRole="button"
                accessibilityLabel="Go back to previous step"
                hitSlop={HIT_SLOP_12}
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
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[
                  styles.buttonText,
                  !allDisclaimersAccepted && styles.buttonTextDisabled,
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
      ...createShadow({
        shadowColor: palette.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }),
    },
    scrollView: {
      flexGrow: 0,
      flexShrink: 1,
      maxHeight: 400, // Fixed height for scrollable area
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
      paddingVertical: 12,
      paddingHorizontal: 16,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center"
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
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    buttonText: { 
      color: palette.onPrimary, 
      fontWeight: "700",
      fontSize: 16
    },
    buttonSecondary: {
      backgroundColor: palette.card || palette.surface,
      borderWidth: 2,
      borderColor: palette.primary,
    },
    buttonTextSecondary: {
      color: palette.text,
      fontWeight: "700",
      fontSize: 16
    },
    buttonDisabled: {
      backgroundColor: palette.muted,
    },
    buttonTextDisabled: {
      color: palette.textSecondary,
      fontWeight: "700",
      fontSize: 16,
      opacity: 0.7,
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
      minHeight: MIN_TAP_SIZE,
    },
    checkbox: {
      width: CHECKBOX_SIZE,
      height: CHECKBOX_SIZE,
      borderWidth: 2,
      borderColor: palette.text,
      backgroundColor: palette.surface,
      borderRadius: 6,
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
      fontSize: 15,
      lineHeight: 22,
    },
    // Progress indicator styles
    progressContainer: {
      marginBottom: 16,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressText: {
      fontSize: 14,
      fontWeight: '600',
    },
    progressTime: {
      fontSize: 12,
    },
    progressBarBg: {
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    // Mode selection styles
    modeCard: {
      borderWidth: 2,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      minHeight: MIN_TAP_SIZE,
    },
    modeCardContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    modeCardText: {
      flex: 1,
    },
    modeTitle: {
      fontSize: 17,
      fontWeight: '700',
      marginBottom: 4,
    },
    modeDesc: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 4,
    },
    modeBadge: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    // Skip to bottom button
    skipToBottomButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 8,
      minHeight: MIN_TAP_SIZE,
      gap: 4,
    },
    skipToBottomText: {
      fontSize: 14,
      fontWeight: '600',
    },
    // Summary box for quick mode
    summaryBox: {
      padding: 12,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.03)',
    },
    summaryItem: {
      fontSize: 14,
      lineHeight: 20,
    },
    // Links row
    linksRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 16,
    },
    // Test skip button
    testSkipButton: {
      position: 'absolute', 
      top: 8, 
      right: 8, 
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderRadius: 4,
    },
  });
}

