import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { useTranslation } from '../i18n';
import { trackEvent } from '../services/analyticsClient';
import { ANALYTICS_EVENTS } from '../services/analyticsEvents';
import { useJurisdiction } from '../store/jurisdiction';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

type SituationType = 'workplace_injury' | 'disability_benefit' | 'human_rights' | 'appeal';

interface FormRecommendation {
  formName: string;
  purpose: string;
  required: boolean;
  notes?: string;
  link?: string;
}

/**
 * JurisdictionFormHelper
 * 
 * Suggests required forms based on user's situation and selected jurisdiction.
 * 
 * Features:
 * - Situation-based form recommendations
 * - Required vs optional form indicators
 * - Links to official forms where available
 * - Jurisdiction-specific guidance
 */
export default function JurisdictionFormHelper() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const factor = useTextScale();
  const { data: jurisdiction } = useJurisdiction();

  const [selectedSituation, setSelectedSituation] = useState<SituationType | null>(null);
  const [recommendations, setRecommendations] = useState<FormRecommendation[]>([]);

  const situations = [
    {
      type: 'workplace_injury' as SituationType,
      icon: 'medkit-outline',
      title: t('jurisdiction.forms.workplaceInjury', 'Workplace Injury Claim'),
      description: t('jurisdiction.forms.workplaceInjuryDesc', 'Filing a new workplace injury or illness claim'),
    },
    {
      type: 'disability_benefit' as SituationType,
      icon: 'wallet-outline',
      title: t('jurisdiction.forms.disabilityBenefit', 'Disability Benefit Application'),
      description: t('jurisdiction.forms.disabilityBenefitDesc', 'Applying for provincial/territorial disability income support'),
    },
    {
      type: 'human_rights' as SituationType,
      icon: 'shield-checkmark-outline',
      title: t('jurisdiction.forms.humanRights', 'Human Rights Complaint'),
      description: t('jurisdiction.forms.humanRightsDesc', 'Filing a discrimination complaint'),
    },
    {
      type: 'appeal' as SituationType,
      icon: 'arrow-up-circle-outline',
      title: t('jurisdiction.forms.appeal', 'Appeal a Decision'),
      description: t('jurisdiction.forms.appealDesc', 'Appealing a WCB or benefit decision'),
    },
  ];

  const generateRecommendations = (situation: SituationType): FormRecommendation[] => {
    if (!jurisdiction) return [];

    const recs: FormRecommendation[] = [];

    switch (situation) {
      case 'workplace_injury':
        if (jurisdiction.workplaceInjury?.initialClaimForm) {
          recs.push({
            formName: jurisdiction.workplaceInjury.initialClaimForm,
            purpose: t('jurisdiction.forms.purposeInitialClaim', 'Initial injury/illness report - submit as soon as possible after incident'),
            required: true,
          });
        }
        recs.push({
          formName: t('jurisdiction.forms.functionalAbilities', 'Functional Abilities Form (FAF)'),
          purpose: t('jurisdiction.forms.purposeFAF', 'Medical assessment of work restrictions and capabilities'),
          required: true,
          notes: t('jurisdiction.forms.notesFAF', 'Usually completed by treating physician'),
        });
        recs.push({
          formName: t('jurisdiction.forms.employerAccident', 'Employer\'s Accident Report'),
          purpose: t('jurisdiction.forms.purposeEmployerReport', 'Employer\'s account of incident (employer completes)'),
          required: true,
          notes: t('jurisdiction.forms.notesEmployerReport', 'Request from employer if not provided'),
        });
        break;

      case 'disability_benefit':
        if (jurisdiction.benefitPrograms && jurisdiction.benefitPrograms.length > 0) {
          jurisdiction.benefitPrograms.forEach((program) => {
            if (program.keyForms && program.keyForms.length > 0) {
              program.keyForms.forEach((form) => {
                recs.push({
                  formName: form,
                  purpose: `${program.name} - ${program.description}`,
                  required: true,
                  notes: program.evidenceTips?.join('; '),
                });
              });
            }
          });
        }
        if (recs.length === 0) {
          recs.push({
            formName: t('jurisdiction.forms.benefitApplication', 'Disability Benefit Application'),
            purpose: t('jurisdiction.forms.purposeBenefitApp', 'Application for disability income support'),
            required: true,
          });
          recs.push({
            formName: t('jurisdiction.forms.medicalAssessment', 'Medical Assessment'),
            purpose: t('jurisdiction.forms.purposeMedical', 'Physician report on disability and functional limitations'),
            required: true,
          });
        }
        break;

      case 'human_rights':
        recs.push({
          formName: t('jurisdiction.forms.hrComplaint', 'Human Rights Complaint Form'),
          purpose: t('jurisdiction.forms.purposeHRComplaint', `File with ${jurisdiction.humanRights?.name || 'Human Rights Commission'}`),
          required: true,
          notes: jurisdiction.humanRights?.complaintDeadlineMonths
            ? t('jurisdiction.forms.notesHRDeadline', 'Deadline: {{months}} months from last incident', { months: jurisdiction.humanRights.complaintDeadlineMonths })
            : undefined,
          link: jurisdiction.humanRights?.url,
        });
        recs.push({
          formName: t('jurisdiction.forms.supportingDocuments', 'Supporting Documents'),
          purpose: t('jurisdiction.forms.purposeSupporting', 'Evidence of discrimination (emails, witness statements, medical records)'),
          required: false,
          notes: t('jurisdiction.forms.notesSupporting', 'Strengthen your case with documentation'),
        });
        break;

      case 'appeal':
        if (jurisdiction.workplaceInjury?.appealLevels && jurisdiction.workplaceInjury.appealLevels.length > 0) {
          jurisdiction.workplaceInjury.appealLevels?.forEach((level) => {
            recs.push({
              formName: t('jurisdiction.forms.appealForm', 'Appeal / Review Request Form - {{level}}', { level: level.name }),
              purpose: t('jurisdiction.forms.purposeAppeal', 'Submit to {{body}}', { body: level.body }),
              required: true,
              notes: t('jurisdiction.forms.notesAppealDeadline', 'Deadline: {{days}} days from decision. {{notes}}', { 
                days: level.typicalDeadlineDays ?? 'N/A',
                notes: level.notes || ''
              }),
            });
          });
        }
        recs.push({
          formName: t('jurisdiction.forms.newEvidence', 'New Medical Evidence'),
          purpose: t('jurisdiction.forms.purposeNewEvidence', 'Updated reports supporting your appeal'),
          required: false,
          notes: t('jurisdiction.forms.notesNewEvidence', 'Stronger appeals include new information not in original decision'),
        });
        break;
    }

    return recs;
  };

  const handleSituationSelect = (situation: SituationType) => {
    setSelectedSituation(situation);
    const recs = generateRecommendations(situation);
    setRecommendations(recs);
    
    // Track form helper usage
    trackEvent(ANALYTICS_EVENTS.JURISDICTION_FORM_HELPER_USED, {
      jurisdiction_code: jurisdiction?.code,
      situation_type: situation,
      forms_recommended: recs.length,
      required_forms_count: recs.filter(r => r.required).length,
    });
  };

  const clearSelection = () => {
    setSelectedSituation(null);
    setRecommendations([]);
  };

  const styles = makeStyles(palette, factor.factor);

  if (!jurisdiction) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>
          {t('jurisdiction.forms.noJurisdiction', 'Please select a jurisdiction first.')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={24} color={palette.primary} />
        <Text style={styles.title}>
          {t('jurisdiction.forms.helper', 'Form Helper - {{jurisdiction}}', { jurisdiction: jurisdiction.name })}
        </Text>
      </View>

      <Text style={styles.description}>
        {t('jurisdiction.forms.helperDesc', 'Select your situation to see which forms you need.')}
      </Text>

      {!selectedSituation ? (
        <View style={styles.situationsContainer}>
          {situations.map((situation) => (
            <A11yPressable
              key={situation.type}
              onPress={() => handleSituationSelect(situation.type)}
              style={styles.situationCard}
              accessibilityLabel={`${situation.title}: ${situation.description}`}
              hitSlop={HIT_SLOP_8}
            >
              <View style={styles.situationIconContainer}>
                <Ionicons name={situation.icon as any} size={32} color={palette.primary} />
              </View>
              <View style={styles.situationContent}>
                <Text style={styles.situationTitle}>{situation.title}</Text>
                <Text style={styles.situationDescription}>{situation.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={palette.muted} />
            </A11yPressable>
          ))}
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <A11yPressable
            onPress={clearSelection}
            style={styles.backButton}
            accessibilityLabel={t('jurisdiction.forms.back', 'Back to situations')}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="arrow-back" size={20} color={palette.primary} />
            <Text style={styles.backButtonText}>
              {t('jurisdiction.forms.changeSelection', 'Change Selection')}
            </Text>
          </A11yPressable>

          <ScrollView style={styles.recommendationsScroll}>
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <View key={index} style={styles.formCard}>
                  <View style={styles.formHeader}>
                    <View style={[styles.requiredBadge, !rec.required && styles.optionalBadge]}>
                      <Text style={[styles.requiredBadgeText, !rec.required && styles.optionalBadgeText]}>
                        {rec.required
                          ? t('jurisdiction.forms.required', 'REQUIRED')
                          : t('jurisdiction.forms.optional', 'OPTIONAL')
                        }
                      </Text>
                    </View>
                    {rec.link && (
                      <Ionicons name="link" size={16} color={palette.primary} />
                    )}
                  </View>
                  <Text style={styles.formName}>{rec.formName}</Text>
                  <Text style={styles.formPurpose}>{rec.purpose}</Text>
                  {rec.notes && (
                    <View style={styles.notesBox}>
                      <Ionicons name="information-circle" size={16} color={palette.muted} />
                      <Text style={styles.notesText}>{rec.notes}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noFormsText}>
                {t('jurisdiction.forms.noFormsAvailable', 'No specific forms available for this situation in the selected jurisdiction.')}
              </Text>
            )}
          </ScrollView>

          <View style={styles.disclaimerBox}>
            <Ionicons name="alert-circle-outline" size={16} color={palette.warning} />
            <Text style={styles.disclaimerText}>
              {t('jurisdiction.forms.disclaimer', 
                'Always check with the official website for the most current forms. Form numbers and requirements may change.'
              )}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function makeStyles(palette: any, factor: number) {
  return StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: palette.surface,
      borderRadius: 12,
      marginVertical: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    title: {
      fontSize: Math.round(18 * factor),
      fontWeight: '600',
      color: palette.text,
      flex: 1,
    },
    description: {
      fontSize: Math.round(14 * factor),
      color: palette.muted,
      marginBottom: 16,
      lineHeight: Math.round(20 * factor),
    },
    situationsContainer: {
      gap: 12,
    },
    situationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: palette.muted + '20',
    },
    situationIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: palette.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    situationContent: {
      flex: 1,
    },
    situationTitle: {
      fontSize: Math.round(15 * factor),
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    situationDescription: {
      fontSize: Math.round(13 * factor),
      color: palette.muted,
      lineHeight: Math.round(18 * factor),
    },
    resultsContainer: {
      minHeight: 300,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
      padding: 8,
    },
    backButtonText: {
      fontSize: Math.round(14 * factor),
      color: palette.primary,
      fontWeight: '500',
    },
    recommendationsScroll: {
      maxHeight: 400,
    },
    formCard: {
      backgroundColor: palette.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: palette.primary,
    },
    formHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    requiredBadge: {
      backgroundColor: palette.error + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    requiredBadgeText: {
      fontSize: Math.round(10 * factor),
      fontWeight: '700',
      color: palette.error,
    },
    optionalBadge: {
      backgroundColor: palette.muted + '20',
    },
    optionalBadgeText: {
      color: palette.muted,
    },
    formName: {
      fontSize: Math.round(15 * factor),
      fontWeight: '600',
      color: palette.text,
      marginBottom: 6,
    },
    formPurpose: {
      fontSize: Math.round(13 * factor),
      color: palette.muted,
      lineHeight: Math.round(19 * factor),
      marginBottom: 8,
    },
    notesBox: {
      flexDirection: 'row',
      gap: 6,
      padding: 10,
      backgroundColor: palette.primary + '08',
      borderRadius: 6,
    },
    notesText: {
      flex: 1,
      fontSize: Math.round(12 * factor),
      color: palette.text,
      lineHeight: Math.round(17 * factor),
    },
    disclaimerBox: {
      flexDirection: 'row',
      gap: 8,
      padding: 12,
      backgroundColor: palette.warning + '10',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.warning + '30',
      marginTop: 12,
    },
    disclaimerText: {
      flex: 1,
      fontSize: Math.round(12 * factor),
      color: palette.muted,
      lineHeight: Math.round(18 * factor),
    },
    noDataText: {
      fontSize: Math.round(14 * factor),
      color: palette.muted,
      textAlign: 'center',
      padding: 16,
    },
    noFormsText: {
      fontSize: Math.round(14 * factor),
      color: palette.muted,
      textAlign: 'center',
      padding: 24,
    },
  });
}
