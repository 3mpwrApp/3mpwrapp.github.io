/**
 * Master Letter Generator Wizard
 * 
 * Unified wizard combining all 5 letter templates:
 * - Accommodation Request
 * - Appeal Letter
 * - Reconsideration Request
 * - Return-to-Work Plan
 * - Union Request
 * 
 * Multi-step flow:
 * 1. Select situation type
 * 2. Choose letter type
 * 3. Fill form fields
 * 4. Preview and export
 */

import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import LetterActionsBar from "../../../components/letters/LetterActionsBar";
import { HIT_SLOP_8 } from "../../../constants/a11y";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { buildCombinedEvidenceSummary, buildSymptomSummary } from "../../../services/insights";
import { useProfileLocal } from "../../../store/profileLocal";
import { useAppPalette } from "../../../theme/usePalette";

const { trackEvent } = require("../../../services/analyticsClient");

export const options = { href: null };

// ============================================================================
// Letter Types & Situations
// ============================================================================

type LetterType = 'accommodation' | 'appeal' | 'reconsideration' | 'rtw_plan' | 'union_request';

interface SituationOption {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
  recommendedLetters: LetterType[];
}

const SITUATIONS: SituationOption[] = [
  {
    id: 'need_accommodation',
    icon: '🏢',
    titleKey: 'letterWizard.situations.accommodation.title',
    descKey: 'letterWizard.situations.accommodation.desc',
    recommendedLetters: ['accommodation', 'union_request'],
  },
  {
    id: 'benefit_denied',
    icon: '📋',
    titleKey: 'letterWizard.situations.benefitDenied.title',
    descKey: 'letterWizard.situations.benefitDenied.desc',
    recommendedLetters: ['appeal', 'reconsideration'],
  },
  {
    id: 'returning_work',
    icon: '↩️',
    titleKey: 'letterWizard.situations.returningWork.title',
    descKey: 'letterWizard.situations.returningWork.desc',
    recommendedLetters: ['rtw_plan', 'accommodation'],
  },
  {
    id: 'need_union_help',
    icon: '🤝',
    titleKey: 'letterWizard.situations.unionHelp.title',
    descKey: 'letterWizard.situations.unionHelp.desc',
    recommendedLetters: ['union_request'],
  },
  {
    id: 'other',
    icon: '📝',
    titleKey: 'letterWizard.situations.other.title',
    descKey: 'letterWizard.situations.other.desc',
    recommendedLetters: ['accommodation', 'appeal', 'reconsideration', 'rtw_plan', 'union_request'],
  },
];

interface LetterTemplate {
  type: LetterType;
  titleKey: string;
  descKey: string;
  icon: string;
  fields: FieldDefinition[];
  generatePreview: (fields: Record<string, string>) => string;
}

interface FieldDefinition {
  key: string;
  labelKey: string;
  placeholderKey: string;
  multiline?: boolean;
  defaultFromProfile?: 'name' | 'contact';
}

// ============================================================================
// Letter Templates Configuration
// ============================================================================

const LETTER_TEMPLATES: Record<LetterType, LetterTemplate> = {
  accommodation: {
    type: 'accommodation',
    titleKey: 'letterWizard.types.accommodation.title',
    descKey: 'letterWizard.types.accommodation.desc',
    icon: '🏢',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'employer', labelKey: 'letterWizard.fields.employer', placeholderKey: 'letterWizard.fields.employerPlaceholder' },
      { key: 'jobTitle', labelKey: 'letterWizard.fields.jobTitle', placeholderKey: 'letterWizard.fields.jobTitlePlaceholder' },
      { key: 'date', labelKey: 'letterWizard.fields.date', placeholderKey: 'letterWizard.fields.datePlaceholder' },
      { key: 'limitations', labelKey: 'letterWizard.fields.limitations', placeholderKey: 'letterWizard.fields.limitationsPlaceholder', multiline: true },
      { key: 'accommodations', labelKey: 'letterWizard.fields.accommodations', placeholderKey: 'letterWizard.fields.accommodationsPlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${fields.date || new Date().toLocaleDateString()}\n\n` +
      `${fields.employer || "[Employer Name]"}\n` +
      `Re: Workplace Accommodation Request\n\n` +
      `Dear ${fields.employer || "Employer"},\n\n` +
      `I am writing to request reasonable workplace accommodations under applicable human rights and accessibility laws. I am employed as ${fields.jobTitle || "[Job Title]"}. Due to disability-related limitations (${fields.limitations || "[briefly describe limitations]"}), I am requesting the following accommodations: ${fields.accommodations || "[list requested accommodations]"}.\n\n` +
      `These accommodations will help me perform the essential duties of my role. I would welcome a discussion to explore options and provide any supporting documentation if needed.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  appeal: {
    type: 'appeal',
    titleKey: 'letterWizard.types.appeal.title',
    descKey: 'letterWizard.types.appeal.desc',
    icon: '📋',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'claim', labelKey: 'letterWizard.fields.claimNumber', placeholderKey: 'letterWizard.fields.claimNumberPlaceholder' },
      { key: 'decisionDate', labelKey: 'letterWizard.fields.decisionDate', placeholderKey: 'letterWizard.fields.decisionDatePlaceholder' },
      { key: 'decisionSummary', labelKey: 'letterWizard.fields.decisionSummary', placeholderKey: 'letterWizard.fields.decisionSummaryPlaceholder', multiline: true },
      { key: 'appealArgs', labelKey: 'letterWizard.fields.appealArgs', placeholderKey: 'letterWizard.fields.appealArgsPlaceholder', multiline: true },
      { key: 'contact', labelKey: 'letterWizard.fields.contact', placeholderKey: 'letterWizard.fields.contactPlaceholder', defaultFromProfile: 'contact' },
    ],
    generatePreview: (fields) => (
      `Re: Appeal of Decision (Claim ${fields.claim || "[number]"})\n\n` +
      `Dear Appeals Officer,\n\n` +
      `I am appealing the decision dated ${fields.decisionDate || "[date]"} regarding my workers' compensation/disability claim. ` +
      `The decision states: ${fields.decisionSummary || "[summarize reasons]"}. I believe this is incorrect because: ${fields.appealArgs || "[state key arguments and evidence]"}.\n\n` +
      `I request that this decision be reconsidered and overturned. I can provide any additional documentation required. Please confirm receipt of this appeal and advise of next steps.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}\n${fields.contact || "[Phone/Email]"}`
    ),
  },
  reconsideration: {
    type: 'reconsideration',
    titleKey: 'letterWizard.types.reconsideration.title',
    descKey: 'letterWizard.types.reconsideration.desc',
    icon: '🔄',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'claim', labelKey: 'letterWizard.fields.claimNumber', placeholderKey: 'letterWizard.fields.claimNumberPlaceholder' },
      { key: 'date', labelKey: 'letterWizard.fields.date', placeholderKey: 'letterWizard.fields.datePlaceholder' },
      { key: 'points', labelKey: 'letterWizard.fields.keyPoints', placeholderKey: 'letterWizard.fields.keyPointsPlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${fields.date || new Date().toLocaleDateString()}\n\n` +
      `Re: Request for Reconsideration (Claim ${fields.claim || "[ID]"})\n\n` +
      `Dear Claims Officer,\n\n` +
      `I am requesting reconsideration of my claim decision. Key points: ${fields.points || "[list facts/evidence]"}.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  rtw_plan: {
    type: 'rtw_plan',
    titleKey: 'letterWizard.types.rtwPlan.title',
    descKey: 'letterWizard.types.rtwPlan.desc',
    icon: '↩️',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'employer', labelKey: 'letterWizard.fields.employer', placeholderKey: 'letterWizard.fields.employerPlaceholder' },
      { key: 'position', labelKey: 'letterWizard.fields.position', placeholderKey: 'letterWizard.fields.positionPlaceholder' },
      { key: 'returnDate', labelKey: 'letterWizard.fields.returnDate', placeholderKey: 'letterWizard.fields.returnDatePlaceholder' },
      { key: 'restrictions', labelKey: 'letterWizard.fields.restrictions', placeholderKey: 'letterWizard.fields.restrictionsPlaceholder', multiline: true },
      { key: 'gradualReturn', labelKey: 'letterWizard.fields.gradualReturn', placeholderKey: 'letterWizard.fields.gradualReturnPlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `${fields.employer || "[Employer Name]"}\n` +
      `Re: Return to Work Plan\n\n` +
      `Dear ${fields.employer || "Employer"},\n\n` +
      `I am planning to return to work as ${fields.position || "[Position]"} on ${fields.returnDate || "[Date]"}. Based on medical advice, I have the following temporary restrictions: ${fields.restrictions || "[list restrictions]"}.\n\n` +
      `I propose a gradual return-to-work plan: ${fields.gradualReturn || "[e.g., part-time hours initially, modified duties]"}.\n\n` +
      `I look forward to discussing this plan and ensuring a safe and successful return.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  union_request: {
    type: 'union_request',
    titleKey: 'letterWizard.types.unionRequest.title',
    descKey: 'letterWizard.types.unionRequest.desc',
    icon: '🤝',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'union', labelKey: 'letterWizard.fields.union', placeholderKey: 'letterWizard.fields.unionPlaceholder' },
      { key: 'date', labelKey: 'letterWizard.fields.date', placeholderKey: 'letterWizard.fields.datePlaceholder' },
      { key: 'issue', labelKey: 'letterWizard.fields.issue', placeholderKey: 'letterWizard.fields.issuePlaceholder', multiline: true },
      { key: 'assistance', labelKey: 'letterWizard.fields.assistance', placeholderKey: 'letterWizard.fields.assistancePlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${fields.date || new Date().toLocaleDateString()}\n\n` +
      `${fields.union || "[Union Local/Representative]"}\n` +
      `Re: Request for Union Assistance\n\n` +
      `Dear Union Representative,\n\n` +
      `I am a member of your union and am requesting assistance with a workplace issue: ${fields.issue || "[describe situation]"}.\n\n` +
      `I am seeking the following support: ${fields.assistance || "[e.g., representation in meetings, grievance filing, accommodation process]"}.\n\n` +
      `Please contact me to discuss next steps.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
};

// ============================================================================
// Main Component
// ============================================================================

export default function LetterWizard() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  const { profile } = useProfileLocal();
  
  useAnnounceOnMount(t('letterWizard.title', 'Master Letter Generator'));
  useFocusOnRefOnMount(titleRef);
  
  // Wizard state
  const [step, setStep] = React.useState<'situation' | 'letter_type' | 'form' | 'preview'>('situation');
  const [selectedSituation, setSelectedSituation] = React.useState<string | null>(null);
  const [selectedLetterType, setSelectedLetterType] = React.useState<LetterType | null>(null);
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [showInfo, setShowInfo] = React.useState(false);

  // Get current template
  const currentTemplate = selectedLetterType ? LETTER_TEMPLATES[selectedLetterType] : null;

  // Initialize form data with profile defaults
  React.useEffect(() => {
    if (currentTemplate && Object.keys(formData).length === 0) {
      const initialData: Record<string, string> = {};
      currentTemplate.fields.forEach(field => {
        if (field.defaultFromProfile === 'name' && profile.name) {
          initialData[field.key] = profile.name;
        } else if (field.defaultFromProfile === 'contact' && profile.contact) {
          initialData[field.key] = profile.contact;
        } else {
          initialData[field.key] = '';
        }
      });
      setFormData(initialData);
    }
  }, [currentTemplate]);

  // Generate preview
  const preview = React.useMemo(() => {
    if (!currentTemplate) return '';
    return currentTemplate.generatePreview(formData);
  }, [currentTemplate, formData]);

  // ============================================================================
  // Actions
  // ============================================================================

  const resetWizard = () => {
    setStep('situation');
    setSelectedSituation(null);
    setSelectedLetterType(null);
    setFormData({});
  };

  const selectSituation = (situationId: string) => {
    setSelectedSituation(situationId);
    const situation = SITUATIONS.find(s => s.id === situationId);
    // Auto-select letter if only one option
    if (situation && situation.recommendedLetters.length === 1) {
      setSelectedLetterType(situation.recommendedLetters[0]);
      setStep('form');
    } else {
      setStep('letter_type');
    }
  };

  const selectLetterType = (type: LetterType) => {
    setSelectedLetterType(type);
    setFormData({});
    setStep('form');
  };

  const goToPreview = () => {
    setStep('preview');
  };

  const copyLetter = async () => {
    try {
      const Clipboard = await import("expo-clipboard");
      await Clipboard.setStringAsync(preview);
      Alert.alert(
        t("letterWizard.copied", "Copied"),
        t("letterWizard.copiedBody", "Letter copied to clipboard.")
      );
    } catch {
      Alert.alert(
        t("letterWizard.clipboardNA", "Clipboard not available"),
        t("letterWizard.clipboardNABody", "Install expo-clipboard in a dev build to enable copy.")
      );
    }
  };

  const exportPdf = async () => {
    try {
      const mod = await import("expo-print");
      const html = `<pre style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;">${preview.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
      const { uri } = await mod.printToFileAsync({ html });
      const Share = await import("expo-sharing").catch(() => null);
      if (Share?.isAvailableAsync) {
        if (await Share.isAvailableAsync()) {
          await Share.shareAsync(uri);
        } else {
          Alert.alert(
            t("letterWizard.shareUnavailable", "Share unavailable"),
            t("letterWizard.shareUnavailableBody", "System share sheet not available.")
          );
        }
      }
    } catch {
      Alert.alert(
        t("letterWizard.pdfNA", "PDF not available"),
        t("letterWizard.pdfNABody", "Install expo-print in a dev build to export PDFs.")
      );
    }
  };

  const exportDoc = async () => {
    try {
      const FS: any = await import("expo-file-system");
      const cacheDir: string = (FS && (FS.cacheDirectory || FS.default?.cacheDirectory)) || "";
      const writeFn = FS?.writeAsStringAsync || FS?.default?.writeAsStringAsync;
      const encodingType = FS?.EncodingType?.UTF8 || FS?.default?.EncodingType?.UTF8;
      if (!cacheDir || !writeFn || !encodingType) throw new Error("fs module incomplete");
      const html = `<html><meta charset="utf-8"/><body><pre style="font-family: Arial; white-space: pre-wrap;">${preview.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre></body></html>`;
      const filename = currentTemplate ? `${currentTemplate.type}_${Date.now()}.doc` : `letter_${Date.now()}.doc`;
      const path = cacheDir + filename;
      await writeFn(path, html, { encoding: encodingType });
      const Share = await import("expo-sharing").catch(() => null);
      if (Share?.isAvailableAsync) {
        if (await Share.isAvailableAsync()) {
          await Share.shareAsync(path);
        } else {
          Alert.alert(
            t("letterWizard.shareUnavailable", "Share unavailable"),
            t("letterWizard.shareUnavailableBody", "System share sheet not available.")
          );
        }
      }
    } catch {
      Alert.alert(
        t("letterWizard.exportFailed", "Export failed"),
        t("letterWizard.exportFailedBody", "Could not create file.")
      );
    }
  };

  const insertFromTrackers = async () => {
    if (!currentTemplate) return;
    
    let ins = '';
    // Use appropriate summary based on letter type
    if (currentTemplate.type === 'accommodation') {
      ins = await buildSymptomSummary();
    } else {
      ins = await buildCombinedEvidenceSummary();
    }
    
    try {
      trackEvent("letter_wizard_insert_trackers", { letterType: currentTemplate.type });
    } catch {}
    
    // Insert into appropriate field
    const targetField = currentTemplate.type === 'accommodation' ? 'limitations' :
                       currentTemplate.type === 'reconsideration' ? 'points' :
                       currentTemplate.type === 'appeal' ? 'appealArgs' :
                       currentTemplate.type === 'rtw_plan' ? 'restrictions' :
                       'issue';
    
    setFormData(prev => ({
      ...prev,
      [targetField]: (prev[targetField] ? prev[targetField] + '\n\n' : '') + ins,
    }));
    
    Alert.alert(
      t("letterWizard.inserted", "Added"),
      t("letterWizard.insertedBody", "Evidence inserted from your trackers.")
    );
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const placeholderColor = palette.text + "88";

  const renderSituationStep = () => (
    <View>
      <Text style={s.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('letterWizard.step1Title', 'Step 1: What is your situation?')}
      </Text>
      <Text style={s.stepDesc} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('letterWizard.step1Desc', 'Select the situation that best matches your needs.')}
      </Text>
      <View style={s.optionsGrid}>
        {SITUATIONS.map(situation => (
          <A11yPressable
            key={situation.id}
            onPress={() => selectSituation(situation.id)}
            hitSlop={HIT_SLOP_8}
            style={s.optionCard}
            accessibilityRole="button"
            accessibilityLabel={t(situation.titleKey, situation.titleKey)}
            accessibilityHint={t(situation.descKey, situation.descKey)}
          >
            <Text style={s.optionIcon}>{situation.icon}</Text>
            <Text style={s.optionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t(situation.titleKey, situation.titleKey)}
            </Text>
            <Text style={s.optionDesc} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t(situation.descKey, situation.descKey)}
            </Text>
          </A11yPressable>
        ))}
      </View>
    </View>
  );

  const renderLetterTypeStep = () => {
    const situation = SITUATIONS.find(s => s.id === selectedSituation);
    if (!situation) return null;

    return (
      <View>
        <Text style={s.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('letterWizard.step2Title', 'Step 2: Choose letter type')}
        </Text>
        <Text style={s.stepDesc} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('letterWizard.step2Desc', 'Based on your situation, these letters are recommended:')}
        </Text>
        <View style={s.optionsGrid}>
          {situation.recommendedLetters.map(type => {
            const template = LETTER_TEMPLATES[type];
            return (
              <A11yPressable
                key={type}
                onPress={() => selectLetterType(type)}
                hitSlop={HIT_SLOP_8}
                style={s.optionCard}
                accessibilityRole="button"
                accessibilityLabel={t(template.titleKey, template.titleKey)}
                accessibilityHint={t(template.descKey, template.descKey)}
              >
                <Text style={s.optionIcon}>{template.icon}</Text>
                <Text style={s.optionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t(template.titleKey, template.titleKey)}
                </Text>
                <Text style={s.optionDesc} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t(template.descKey, template.descKey)}
                </Text>
              </A11yPressable>
            );
          })}
        </View>
        <A11yPressable
          onPress={() => setStep('situation')}
          hitSlop={HIT_SLOP_8}
          style={s.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('letterWizard.back', 'Go back')}
        >
          <Text style={s.backBtnText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            ← {t('letterWizard.back', 'Back')}
          </Text>
        </A11yPressable>
      </View>
    );
  };

  const renderFormStep = () => {
    if (!currentTemplate) return null;

    return (
      <View>
        <Text style={s.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('letterWizard.step3Title', 'Step 3: Fill in details')}
        </Text>
        <Text style={s.stepDesc} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t(currentTemplate.titleKey, currentTemplate.titleKey)}
        </Text>
        
        {currentTemplate.fields.map(field => (
          <View key={field.key} style={s.fieldContainer}>
            <Text style={s.fieldLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t(field.labelKey, field.labelKey)}
            </Text>
            <TextInput
              style={[s.input, field.multiline && s.inputMultiline]}
              placeholder={t(field.placeholderKey, field.placeholderKey)}
              placeholderTextColor={placeholderColor}
              value={formData[field.key] || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, [field.key]: text }))}
              multiline={field.multiline}
              numberOfLines={field.multiline ? 4 : 1}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
          </View>
        ))}
        
        <View style={s.formActions}>
          <A11yPressable
            onPress={() => setStep('letter_type')}
            hitSlop={HIT_SLOP_8}
            style={s.secondaryBtn}
            accessibilityRole="button"
            accessibilityLabel={t('letterWizard.back', 'Go back')}
          >
            <Text style={s.secondaryBtnText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              ← {t('letterWizard.back', 'Back')}
            </Text>
          </A11yPressable>
          
          <A11yPressable
            onPress={insertFromTrackers}
            hitSlop={HIT_SLOP_8}
            style={s.secondaryBtn}
            accessibilityRole="button"
            accessibilityLabel={t('letterWizard.insertTrackers', 'Insert evidence from trackers')}
          >
            <Text style={s.secondaryBtnText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('letterWizard.insertTrackers', 'Insert Evidence')}
            </Text>
          </A11yPressable>
          
          <A11yPressable
            onPress={goToPreview}
            hitSlop={HIT_SLOP_8}
            style={s.primaryBtn}
            accessibilityRole="button"
            accessibilityLabel={t('letterWizard.preview', 'Preview letter')}
          >
            <Text style={s.primaryBtnText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('letterWizard.preview', 'Preview')} →
            </Text>
          </A11yPressable>
        </View>
      </View>
    );
  };

  const renderPreviewStep = () => {
    if (!currentTemplate) return null;

    return (
      <View>
        <Text style={s.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('letterWizard.step4Title', 'Step 4: Review & Export')}
        </Text>
        
        <LetterActionsBar
          showInfo={showInfo}
          onToggleInfo={() => setShowInfo(v => !v)}
          onCopy={copyLetter}
          onInsertTrackers={insertFromTrackers}
          onExportPdf={exportPdf}
          onExportDoc={exportDoc}
          palette={palette}
        />
        
        {showInfo && (
          <View style={s.infoCard} accessibilityRole="summary">
            <Text style={s.infoTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t("letterWizard.infoTitle", "How to Use")}
            </Text>
            <Text style={s.infoLine} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t("letterWizard.infoLine1", "Review your letter below. Use Copy, PDF, or Doc buttons to export.")}
            </Text>
            <Text style={s.infoLine} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t("letterWizard.infoLine2", "Adapt wording to your specific facts. This is not legal advice.")}
            </Text>
          </View>
        )}
        
        <View style={s.previewBox}>
          <Text style={s.previewText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {preview}
          </Text>
        </View>
        
        <View style={s.formActions}>
          <A11yPressable
            onPress={() => setStep('form')}
            hitSlop={HIT_SLOP_8}
            style={s.secondaryBtn}
            accessibilityRole="button"
            accessibilityLabel={t('letterWizard.editLetter', 'Edit letter')}
          >
            <Text style={s.secondaryBtnText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              ← {t('letterWizard.edit', 'Edit')}
            </Text>
          </A11yPressable>
          
          <A11yPressable
            onPress={resetWizard}
            hitSlop={HIT_SLOP_8}
            style={s.primaryBtn}
            accessibilityRole="button"
            accessibilityLabel={t('letterWizard.startOver', 'Start over with new letter')}
          >
            <Text style={s.primaryBtnText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('letterWizard.startOver', 'Start Over')}
            </Text>
          </A11yPressable>
        </View>
      </View>
    );
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={{ padding: 16 }}
      accessibilityLabel={t('letterWizard.screenLabel', 'Master Letter Generator screen')}
    >
      <Text
        ref={titleRef}
        style={s.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('letterWizard.title', 'Master Letter Generator')}
      </Text>
      
      <Text style={s.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('letterWizard.subtitle', 'Create professional letters for any disability advocacy situation.')}
      </Text>
      
      {step === 'situation' && renderSituationStep()}
      {step === 'letter_type' && renderLetterTypeStep()}
      {step === 'form' && renderFormStep()}
      {step === 'preview' && renderPreviewStep()}
    </ScrollView>
  );
}

// ============================================================================
// Styles
// ============================================================================

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: palette.text,
      opacity: 0.9,
      marginBottom: 24,
    },
    stepTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    stepDesc: {
      fontSize: 15,
      color: palette.text,
      opacity: 0.85,
      marginBottom: 16,
    },
    optionsGrid: {
      gap: 12,
      marginBottom: 16,
    },
    optionCard: {
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 16,
    },
    optionIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    optionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 4,
    },
    optionDesc: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.75,
    },
    fieldContainer: {
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 6,
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      backgroundColor: palette.surface,
    },
    inputMultiline: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    formActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 20,
    },
    primaryBtn: {
      backgroundColor: palette.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flex: 1,
      minWidth: 100,
    },
    primaryBtnText: {
      color: palette.onPrimary,
      fontWeight: '700',
      fontSize: 16,
      textAlign: 'center',
    },
    secondaryBtn: {
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    secondaryBtnText: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 15,
    },
    backBtn: {
      marginTop: 12,
      padding: 8,
    },
    backBtnText: {
      color: palette.text,
      fontSize: 15,
    },
    previewBox: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 10,
      padding: 16,
      backgroundColor: palette.surface,
      marginVertical: 16,
    },
    previewText: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
    },
    infoCard: {
      backgroundColor: palette.card,
      borderRadius: 8,
      padding: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      marginBottom: 12,
    },
    infoTitle: {
      color: palette.primary,
      fontWeight: '700',
      fontSize: 16,
      marginBottom: 6,
    },
    infoLine: {
      color: palette.text,
      fontSize: 14,
      marginTop: 4,
    },
  });
}
