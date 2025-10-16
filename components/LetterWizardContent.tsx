/**
 * Master Letter Generator Wizard
 * 
 * Unified wizard with 22 comprehensive letter templates covering:
 * - Workplace accommodations and return-to-work planning
 * - Medical leave requests and extensions
 * - Workplace harassment and discrimination complaints
 * - WSIB/workers' compensation claims
 * - Insurance disputes (LTD appeals, IME objections)
 * - Medical documentation requests (doctor letters, records)
 * - Prescription coverage appeals
 * - Housing accessibility modifications
 * - Service animal approval and parking permits
 * - Human rights complaints and legal demands
 * 
 * Multi-step flow:
 * 1. Select situation type (11 categories)
 * 2. Choose letter type (22 templates)
 * 3. Fill form fields (customized per template)
 * 4. Preview and export (copy, PDF, doc)
 */

import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { HIT_SLOP_8 } from "../constants/a11y";
import { type TaskComplexity } from "../constants/cognitive";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../hooks/useA11y";
import { useTranslation } from "../i18n";
import { buildCombinedEvidenceSummary, buildSymptomSummary } from "../services/insights";
import { useProfileLocal } from "../store/profileLocal";
import { useAppPalette } from "../theme/usePalette";

import A11yPressable from "./A11yPressable";
import { ComplexityBadge, SimplifiedView } from "./CognitiveAccessibility";
import { DyslexiaText } from './DyslexiaText';
import LetterActionsBar from "./letters/LetterActionsBar";

const { trackEvent } = require("../services/analyticsClient");

// ============================================================================
// Letter Types & Situations
// ============================================================================

type LetterType = 
  // Original 5
  | 'accommodation' 
  | 'appeal' 
  | 'reconsideration' 
  | 'rtw_plan' 
  | 'union_request'
  // Government & Benefits
  | 'medical_leave_request'
  | 'leave_extension'
  | 'wsib_claim'
  | 'harassment_complaint'
  | 'wrongful_termination'
  // Insurance & Medical
  | 'ltd_appeal'
  | 'ime_objection'
  | 'doctor_support_request'
  | 'medical_records_request'
  | 'prescription_coverage_appeal'
  // Housing & Accessibility
  | 'housing_accommodation'
  | 'service_animal_approval'
  | 'parking_permit_appeal'
  // Human Rights & Legal
  | 'human_rights_complaint'
  | 'cease_and_desist'
  | 'demand_letter';

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
    recommendedLetters: ['appeal', 'reconsideration', 'ltd_appeal'],
  },
  {
    id: 'returning_work',
    icon: '↩️',
    titleKey: 'letterWizard.situations.returningWork.title',
    descKey: 'letterWizard.situations.returningWork.desc',
    recommendedLetters: ['rtw_plan', 'accommodation', 'medical_leave_request'],
  },
  {
    id: 'need_union_help',
    icon: '🤝',
    titleKey: 'letterWizard.situations.unionHelp.title',
    descKey: 'letterWizard.situations.unionHelp.desc',
    recommendedLetters: ['union_request'],
  },
  {
    id: 'medical_leave',
    icon: '🏥',
    titleKey: 'letterWizard.situations.medicalLeave.title',
    descKey: 'letterWizard.situations.medicalLeave.desc',
    recommendedLetters: ['medical_leave_request', 'leave_extension', 'wsib_claim'],
  },
  {
    id: 'workplace_issues',
    icon: '⚠️',
    titleKey: 'letterWizard.situations.workplaceIssues.title',
    descKey: 'letterWizard.situations.workplaceIssues.desc',
    recommendedLetters: ['harassment_complaint', 'wrongful_termination', 'human_rights_complaint'],
  },
  {
    id: 'insurance_dispute',
    icon: '📄',
    titleKey: 'letterWizard.situations.insuranceDispute.title',
    descKey: 'letterWizard.situations.insuranceDispute.desc',
    recommendedLetters: ['ltd_appeal', 'ime_objection', 'prescription_coverage_appeal'],
  },
  {
    id: 'medical_support',
    icon: '🩺',
    titleKey: 'letterWizard.situations.medicalSupport.title',
    descKey: 'letterWizard.situations.medicalSupport.desc',
    recommendedLetters: ['doctor_support_request', 'medical_records_request', 'prescription_coverage_appeal'],
  },
  {
    id: 'housing_accessibility',
    icon: '🏠',
    titleKey: 'letterWizard.situations.housingAccessibility.title',
    descKey: 'letterWizard.situations.housingAccessibility.desc',
    recommendedLetters: ['housing_accommodation', 'service_animal_approval', 'parking_permit_appeal'],
  },
  {
    id: 'human_rights',
    icon: '⚖️',
    titleKey: 'letterWizard.situations.humanRights.title',
    descKey: 'letterWizard.situations.humanRights.desc',
    recommendedLetters: ['human_rights_complaint', 'cease_and_desist', 'demand_letter'],
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
  complexity?: TaskComplexity; // Add complexity scoring
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
    complexity: { 
      level: 'moderate', 
      steps: 6, 
      estimatedMinutes: 15,
      requiresDecisions: 2,
      requiresReading: 'light',
      requiresWriting: true
    },
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
  
  // ============================================================================
  // Medical Leave & Workplace Issues
  // ============================================================================
  
  medical_leave_request: {
    type: 'medical_leave_request',
    titleKey: 'letterWizard.types.medicalLeaveRequest.title',
    descKey: 'letterWizard.types.medicalLeaveRequest.desc',
    icon: '🏥',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'position', labelKey: 'letterWizard.fields.position', placeholderKey: 'letterWizard.fields.positionPlaceholder' },
      { key: 'startDate', labelKey: 'letterWizard.fields.leaveStartDate', placeholderKey: 'letterWizard.fields.leaveStartDatePlaceholder' },
      { key: 'duration', labelKey: 'letterWizard.fields.leaveDuration', placeholderKey: 'letterWizard.fields.leaveDurationPlaceholder' },
      { key: 'medicalReason', labelKey: 'letterWizard.fields.medicalReason', placeholderKey: 'letterWizard.fields.medicalReasonPlaceholder', multiline: true },
      { key: 'contact', labelKey: 'letterWizard.fields.contact', placeholderKey: 'letterWizard.fields.contactPlaceholder', defaultFromProfile: 'contact' },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Medical Leave Request\n\n` +
      `Dear Employer,\n\n` +
      `I am writing to formally request a medical leave of absence from my position as ${fields.position || "[Position]"}, effective ${fields.startDate || "[Start Date]"}. ` +
      `Based on medical advice, I require approximately ${fields.duration || "[Duration]"} to address health concerns: ${fields.medicalReason || "[Brief medical reason - avoid detailed diagnosis]"}.\n\n` +
      `I will provide medical documentation as required by company policy. Please advise on the process for short-term/long-term disability benefits and maintaining my health coverage during leave.\n\n` +
      `I can be reached at: ${fields.contact || "[Contact Information]"}\n\n` +
      `Thank you for your understanding.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  leave_extension: {
    type: 'leave_extension',
    titleKey: 'letterWizard.types.leaveExtension.title',
    descKey: 'letterWizard.types.leaveExtension.desc',
    icon: '📅',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'originalEndDate', labelKey: 'letterWizard.fields.originalEndDate', placeholderKey: 'letterWizard.fields.originalEndDatePlaceholder' },
      { key: 'newReturnDate', labelKey: 'letterWizard.fields.newReturnDate', placeholderKey: 'letterWizard.fields.newReturnDatePlaceholder' },
      { key: 'medicalUpdate', labelKey: 'letterWizard.fields.medicalUpdate', placeholderKey: 'letterWizard.fields.medicalUpdatePlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Request to Extend Medical Leave\n\n` +
      `Dear Employer,\n\n` +
      `I am currently on medical leave, originally scheduled to end on ${fields.originalEndDate || "[Original End Date]"}. ` +
      `Based on updated medical advice, I am requesting an extension to ${fields.newReturnDate || "[New Return Date]"}.\n\n` +
      `Medical Update: ${fields.medicalUpdate || "[Brief update on recovery progress and need for extension]"}\n\n` +
      `I will provide updated medical documentation as required. Please advise if additional information is needed.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  wsib_claim: {
    type: 'wsib_claim',
    titleKey: 'letterWizard.types.wsibClaim.title',
    descKey: 'letterWizard.types.wsibClaim.desc',
    icon: '🏗️',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'incidentDate', labelKey: 'letterWizard.fields.incidentDate', placeholderKey: 'letterWizard.fields.incidentDatePlaceholder' },
      { key: 'incidentDescription', labelKey: 'letterWizard.fields.incidentDescription', placeholderKey: 'letterWizard.fields.incidentDescriptionPlaceholder', multiline: true },
      { key: 'injuries', labelKey: 'letterWizard.fields.injuries', placeholderKey: 'letterWizard.fields.injuriesPlaceholder', multiline: true },
      { key: 'witnesses', labelKey: 'letterWizard.fields.witnesses', placeholderKey: 'letterWizard.fields.witnessesPlaceholder' },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Workplace Injury Report - WSIB Claim\n\n` +
      `To Whom It May Concern,\n\n` +
      `I am reporting a workplace injury that occurred on ${fields.incidentDate || "[Date]"}.\n\n` +
      `Incident Description:\n${fields.incidentDescription || "[Detailed description of how injury occurred, including location, time, and circumstances]"}\n\n` +
      `Injuries Sustained:\n${fields.injuries || "[Description of injuries]"}\n\n` +
      `Witnesses: ${fields.witnesses || "[Names of witnesses, if any]"}\n\n` +
      `I have sought/will seek medical attention and will provide documentation. Please advise on the WSIB claim process.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  harassment_complaint: {
    type: 'harassment_complaint',
    titleKey: 'letterWizard.types.harassmentComplaint.title',
    descKey: 'letterWizard.types.harassmentComplaint.desc',
    icon: '⚠️',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'harasserName', labelKey: 'letterWizard.fields.harasserName', placeholderKey: 'letterWizard.fields.harasserNamePlaceholder' },
      { key: 'incidents', labelKey: 'letterWizard.fields.incidentDetails', placeholderKey: 'letterWizard.fields.incidentDetailsPlaceholder', multiline: true },
      { key: 'witnesses', labelKey: 'letterWizard.fields.witnesses', placeholderKey: 'letterWizard.fields.witnessesPlaceholder' },
      { key: 'desiredResolution', labelKey: 'letterWizard.fields.desiredResolution', placeholderKey: 'letterWizard.fields.desiredResolutionPlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Formal Harassment Complaint\n\n` +
      `Dear [HR Manager/Supervisor],\n\n` +
      `I am filing a formal complaint of workplace harassment involving ${fields.harasserName || "[Harasser Name/Title]"}.\n\n` +
      `Incident Details:\n${fields.incidents || "[Detailed description of harassment incidents with dates, times, and locations]"}\n\n` +
      `Witnesses: ${fields.witnesses || "[Names of witnesses]"}\n\n` +
      `This behavior has created a hostile work environment and violates workplace harassment policies. ` +
      `I request the following resolution: ${fields.desiredResolution || "[Desired outcome - e.g., investigation, training, separation from harasser]"}.\n\n` +
      `I expect this matter to be taken seriously and investigated promptly. Please confirm receipt and advise on next steps.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  wrongful_termination: {
    type: 'wrongful_termination',
    titleKey: 'letterWizard.types.wrongfulTermination.title',
    descKey: 'letterWizard.types.wrongfulTermination.desc',
    icon: '🚫',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'terminationDate', labelKey: 'letterWizard.fields.terminationDate', placeholderKey: 'letterWizard.fields.terminationDatePlaceholder' },
      { key: 'reasonGiven', labelKey: 'letterWizard.fields.reasonGiven', placeholderKey: 'letterWizard.fields.reasonGivenPlaceholder', multiline: true },
      { key: 'discriminationEvidence', labelKey: 'letterWizard.fields.discriminationEvidence', placeholderKey: 'letterWizard.fields.discriminationEvidencePlaceholder', multiline: true },
      { key: 'desiredOutcome', labelKey: 'letterWizard.fields.desiredOutcome', placeholderKey: 'letterWizard.fields.desiredOutcomePlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Wrongful Termination / Disability Discrimination\n\n` +
      `Dear [Employer],\n\n` +
      `I am writing regarding my termination on ${fields.terminationDate || "[Date]"}. ` +
      `The stated reason was: ${fields.reasonGiven || "[Reason given]"}.\n\n` +
      `I believe my termination was discriminatory based on my disability. Evidence includes:\n${fields.discriminationEvidence || "[List evidence: timing relative to accommodation requests, comments made, differential treatment, etc.]"}\n\n` +
      `This violates human rights legislation and employment standards. I request: ${fields.desiredOutcome || "[e.g., reinstatement, severance, accommodation, written apology]"}.\n\n` +
      `I am prepared to pursue all available legal remedies if this matter is not resolved. Please respond within 14 days.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  // ============================================================================
  // Insurance & Medical Letters
  // ============================================================================
  
  ltd_appeal: {
    type: 'ltd_appeal',
    titleKey: 'letterWizard.types.ltdAppeal.title',
    descKey: 'letterWizard.types.ltdAppeal.desc',
    icon: '📄',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'policyNumber', labelKey: 'letterWizard.fields.policyNumber', placeholderKey: 'letterWizard.fields.policyNumberPlaceholder' },
      { key: 'denialDate', labelKey: 'letterWizard.fields.denialDate', placeholderKey: 'letterWizard.fields.denialDatePlaceholder' },
      { key: 'denialReasons', labelKey: 'letterWizard.fields.denialReasons', placeholderKey: 'letterWizard.fields.denialReasonsPlaceholder', multiline: true },
      { key: 'appealArguments', labelKey: 'letterWizard.fields.appealArguments', placeholderKey: 'letterWizard.fields.appealArgumentsPlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Appeal of LTD Denial - Policy #${fields.policyNumber || "[Policy Number]"}\n\n` +
      `Dear Claims Adjudicator,\n\n` +
      `I am appealing the denial of my Long Term Disability claim dated ${fields.denialDate || "[Date]"}. ` +
      `The denial stated: ${fields.denialReasons || "[Reasons for denial]"}.\n\n` +
      `I disagree with this decision for the following reasons:\n${fields.appealArguments || "[Detailed arguments with supporting medical evidence, functional limitations, why denial is incorrect]"}\n\n` +
      `I am submitting additional medical evidence from my treating physicians. Under the policy terms and applicable law, I am entitled to these benefits.\n\n` +
      `I request a full reconsideration of my claim. Please confirm receipt of this appeal.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  ime_objection: {
    type: 'ime_objection',
    titleKey: 'letterWizard.types.imeObjection.title',
    descKey: 'letterWizard.types.imeObjection.desc',
    icon: '🩺',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'imeDate', labelKey: 'letterWizard.fields.imeDate', placeholderKey: 'letterWizard.fields.imeDatePlaceholder' },
      { key: 'imeDoctorName', labelKey: 'letterWizard.fields.imeDoctorName', placeholderKey: 'letterWizard.fields.imeDoctorNamePlaceholder' },
      { key: 'objections', labelKey: 'letterWizard.fields.objections', placeholderKey: 'letterWizard.fields.objectionsPlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Objection to Independent Medical Examination Report\n\n` +
      `Dear Claims Manager,\n\n` +
      `I am objecting to the IME report conducted by ${fields.imeDoctorName || "[IME Doctor Name]"} on ${fields.imeDate || "[Date]"}.\n\n` +
      `My objections are:\n${fields.objections || "[e.g., examiner spent only 15 minutes, ignored treating physician opinions, mischaracterized symptoms, failed to review medical records, used outdated assessment methods]"}\n\n` +
      `This report does not accurately reflect my condition or functional limitations. My treating physicians, who have years of medical relationship with me, disagree with the IME conclusions.\n\n` +
      `I request that you disregard this biased report and rely on my treating physicians' opinions. I am willing to undergo an examination by a mutually agreed-upon specialist.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  doctor_support_request: {
    type: 'doctor_support_request',
    titleKey: 'letterWizard.types.doctorSupportRequest.title',
    descKey: 'letterWizard.types.doctorSupportRequest.desc',
    icon: '📋',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'doctorName', labelKey: 'letterWizard.fields.doctorName', placeholderKey: 'letterWizard.fields.doctorNamePlaceholder' },
      { key: 'purposeOfLetter', labelKey: 'letterWizard.fields.purposeOfLetter', placeholderKey: 'letterWizard.fields.purposeOfLetterPlaceholder', multiline: true },
      { key: 'specificPoints', labelKey: 'letterWizard.fields.specificPoints', placeholderKey: 'letterWizard.fields.specificPointsPlaceholder', multiline: true },
      { key: 'deadline', labelKey: 'letterWizard.fields.deadline', placeholderKey: 'letterWizard.fields.deadlinePlaceholder' },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Dear Dr. ${fields.doctorName || "[Doctor Name]"},\n\n` +
      `I am requesting your assistance in providing a medical letter for: ${fields.purposeOfLetter || "[e.g., LTD appeal, workplace accommodation, disability tax credit]"}.\n\n` +
      `It would be helpful if the letter could address the following points:\n${fields.specificPoints || "[List specific functional limitations, prognosis, treatment history, impact on work/daily activities]"}\n\n` +
      `The letter is needed by: ${fields.deadline || "[Deadline Date]"}\n\n` +
      `Please focus on my functional limitations rather than detailed diagnoses. If there is a fee for this letter, please advise.\n\n` +
      `Thank you for your continued support.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  medical_records_request: {
    type: 'medical_records_request',
    titleKey: 'letterWizard.types.medicalRecordsRequest.title',
    descKey: 'letterWizard.types.medicalRecordsRequest.desc',
    icon: '📁',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'dateOfBirth', labelKey: 'letterWizard.fields.dateOfBirth', placeholderKey: 'letterWizard.fields.dateOfBirthPlaceholder' },
      { key: 'recordsPeriod', labelKey: 'letterWizard.fields.recordsPeriod', placeholderKey: 'letterWizard.fields.recordsPeriodPlaceholder' },
      { key: 'purposeOfRequest', labelKey: 'letterWizard.fields.purposeOfRequest', placeholderKey: 'letterWizard.fields.purposeOfRequestPlaceholder' },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Request for Medical Records\n\n` +
      `Dear Medical Records Department,\n\n` +
      `I am requesting copies of my complete medical records.\n\n` +
      `Patient Name: ${fields.name || "[Your Name]"}\n` +
      `Date of Birth: ${fields.dateOfBirth || "[Date of Birth]"}\n` +
      `Records Period: ${fields.recordsPeriod || "[e.g., January 2020 to present]"}\n` +
      `Purpose: ${fields.purposeOfRequest || "[e.g., personal records, second opinion, legal matter]"}\n\n` +
      `Please provide records in both electronic and paper format if possible. I understand there may be a fee and am prepared to pay reasonable copying costs.\n\n` +
      `Please confirm receipt of this request and advise of the timeline and any fees.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  prescription_coverage_appeal: {
    type: 'prescription_coverage_appeal',
    titleKey: 'letterWizard.types.prescriptionCoverageAppeal.title',
    descKey: 'letterWizard.types.prescriptionCoverageAppeal.desc',
    icon: '💊',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'drugName', labelKey: 'letterWizard.fields.drugName', placeholderKey: 'letterWizard.fields.drugNamePlaceholder' },
      { key: 'prescribingDoctor', labelKey: 'letterWizard.fields.prescribingDoctor', placeholderKey: 'letterWizard.fields.prescribingDoctorPlaceholder' },
      { key: 'denialReason', labelKey: 'letterWizard.fields.denialReason', placeholderKey: 'letterWizard.fields.denialReasonPlaceholder', multiline: true },
      { key: 'medicalNecessity', labelKey: 'letterWizard.fields.medicalNecessity', placeholderKey: 'letterWizard.fields.medicalNecessityPlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Appeal of Prescription Coverage Denial - ${fields.drugName || "[Drug Name]"}\n\n` +
      `Dear Formulary Committee,\n\n` +
      `I am appealing the denial of coverage for ${fields.drugName || "[Drug Name]"}, prescribed by ${fields.prescribingDoctor || "[Doctor Name]"}.\n\n` +
      `Denial Reason: ${fields.denialReason || "[Reason given]"}\n\n` +
      `Medical Necessity:\n${fields.medicalNecessity || "[Explain why this medication is necessary, alternatives tried and failed, impact of not having this medication, supporting medical evidence]"}\n\n` +
      `Denying coverage for this medically necessary medication violates the duty to accommodate and may constitute discrimination based on disability.\n\n` +
      `I request immediate approval of coverage. Please respond within 7 days.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  // ============================================================================
  // Housing & Accessibility Letters
  // ============================================================================
  
  housing_accommodation: {
    type: 'housing_accommodation',
    titleKey: 'letterWizard.types.housingAccommodation.title',
    descKey: 'letterWizard.types.housingAccommodation.desc',
    icon: '🏠',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'landlordName', labelKey: 'letterWizard.fields.landlordName', placeholderKey: 'letterWizard.fields.landlordNamePlaceholder' },
      { key: 'address', labelKey: 'letterWizard.fields.address', placeholderKey: 'letterWizard.fields.addressPlaceholder' },
      { key: 'modificationsRequested', labelKey: 'letterWizard.fields.modificationsRequested', placeholderKey: 'letterWizard.fields.modificationsRequestedPlaceholder', multiline: true },
      { key: 'medicalNecessity', labelKey: 'letterWizard.fields.medicalNecessity', placeholderKey: 'letterWizard.fields.medicalNecessityPlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Request for Accessibility Modifications\n\n` +
      `Dear ${fields.landlordName || "[Landlord Name]"},\n\n` +
      `I am a tenant at ${fields.address || "[Address]"} and am requesting the following accessibility modifications:\n\n` +
      `${fields.modificationsRequested || "[e.g., ramp installation, grab bars in bathroom, widened doorways, accessible parking space]"}\n\n` +
      `Medical Necessity:\n${fields.medicalNecessity || "[Explain how modifications will enable you to live independently and access your home safely]"}\n\n` +
      `Under human rights legislation, landlords have a duty to accommodate tenants with disabilities. I am willing to discuss cost-sharing arrangements if appropriate.\n\n` +
      `Please respond within 14 days to discuss implementation. I can provide medical documentation if required.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  service_animal_approval: {
    type: 'service_animal_approval',
    titleKey: 'letterWizard.types.serviceAnimalApproval.title',
    descKey: 'letterWizard.types.serviceAnimalApproval.desc',
    icon: '🐕‍🦺',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'animalType', labelKey: 'letterWizard.fields.animalType', placeholderKey: 'letterWizard.fields.animalTypePlaceholder' },
      { key: 'training', labelKey: 'letterWizard.fields.training', placeholderKey: 'letterWizard.fields.trainingPlaceholder', multiline: true },
      { key: 'medicalNecessity', labelKey: 'letterWizard.fields.medicalNecessity', placeholderKey: 'letterWizard.fields.medicalNecessityPlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Service Animal Approval Request\n\n` +
      `Dear [Landlord/Employer/Manager],\n\n` +
      `I am requesting approval to be accompanied by my service animal, a ${fields.animalType || "[Type of animal]"}.\n\n` +
      `Training & Certification:\n${fields.training || "[Describe training, certifications, and tasks the animal performs]"}\n\n` +
      `Medical Necessity:\n${fields.medicalNecessity || "[Explain disability-related need for service animal without detailed diagnosis]"}\n\n` +
      `The animal is well-behaved, trained for public access, and poses no safety risk. Under human rights and accessibility laws, service animals must be accommodated.\n\n` +
      `I am willing to provide medical documentation and discuss any reasonable concerns you may have.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  parking_permit_appeal: {
    type: 'parking_permit_appeal',
    titleKey: 'letterWizard.types.parkingPermitAppeal.title',
    descKey: 'letterWizard.types.parkingPermitAppeal.desc',
    icon: '🅿️',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'denialReason', labelKey: 'letterWizard.fields.denialReason', placeholderKey: 'letterWizard.fields.denialReasonPlaceholder', multiline: true },
      { key: 'mobilityLimitations', labelKey: 'letterWizard.fields.mobilityLimitations', placeholderKey: 'letterWizard.fields.mobilityLimitationsPlaceholder', multiline: true },
      { key: 'functionalImpact', labelKey: 'letterWizard.fields.functionalImpact', placeholderKey: 'letterWizard.fields.functionalImpactPlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Appeal of Accessible Parking Permit Denial\n\n` +
      `Dear [Permit Authority],\n\n` +
      `I am appealing the denial of my accessible parking permit application. The denial stated: ${fields.denialReason || "[Reason given]"}.\n\n` +
      `Mobility Limitations:\n${fields.mobilityLimitations || "[Describe mobility limitations without detailed diagnosis - e.g., cannot walk more than 50m without severe pain/fatigue]"}\n\n` +
      `Functional Impact:\n${fields.functionalImpact || "[Explain how lack of accessible parking prevents you from accessing essential services, employment, medical appointments]"}\n\n` +
      `My treating physician has confirmed that I meet the medical criteria for an accessible parking permit. The denial appears to be based on misconceptions about invisible disabilities.\n\n` +
      `I request immediate reconsideration with review of my complete medical documentation.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  // ============================================================================
  // Human Rights & Legal Letters
  // ============================================================================
  
  human_rights_complaint: {
    type: 'human_rights_complaint',
    titleKey: 'letterWizard.types.humanRightsComplaint.title',
    descKey: 'letterWizard.types.humanRightsComplaint.desc',
    icon: '⚖️',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'respondentName', labelKey: 'letterWizard.fields.respondentName', placeholderKey: 'letterWizard.fields.respondentNamePlaceholder' },
      { key: 'incidentDetails', labelKey: 'letterWizard.fields.incidentDetails', placeholderKey: 'letterWizard.fields.incidentDetailsPlaceholder', multiline: true },
      { key: 'attemptedResolution', labelKey: 'letterWizard.fields.attemptedResolution', placeholderKey: 'letterWizard.fields.attemptedResolutionPlaceholder', multiline: true },
      { key: 'desiredRemedy', labelKey: 'letterWizard.fields.desiredRemedy', placeholderKey: 'letterWizard.fields.desiredRemedyPlaceholder', multiline: true },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Re: Human Rights Complaint Against ${fields.respondentName || "[Respondent Name]"}\n\n` +
      `To: [Human Rights Tribunal]\n\n` +
      `I am filing a formal complaint of discrimination based on disability.\n\n` +
      `Respondent: ${fields.respondentName || "[Organization/Individual Name]"}\n\n` +
      `Incident Details:\n${fields.incidentDetails || "[Detailed description of discriminatory acts, dates, locations, witnesses, impact on you]"}\n\n` +
      `Attempted Resolution:\n${fields.attemptedResolution || "[Describe attempts to resolve informally before filing complaint]"}\n\n` +
      `This conduct violates [Provincial/Federal] Human Rights Code protections against disability discrimination.\n\n` +
      `I request the following remedies:\n${fields.desiredRemedy || "[e.g., compensation, policy changes, apology, anti-discrimination training, lost wages]"}\n\n` +
      `I am prepared to provide evidence and testimony. Please advise on next steps.\n\n` +
      `Sincerely,\n${fields.name || "[Your Name]"}`
    ),
  },
  
  cease_and_desist: {
    type: 'cease_and_desist',
    titleKey: 'letterWizard.types.ceaseAndDesist.title',
    descKey: 'letterWizard.types.ceaseAndDesist.desc',
    icon: '🛑',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'recipientName', labelKey: 'letterWizard.fields.recipientName', placeholderKey: 'letterWizard.fields.recipientNamePlaceholder' },
      { key: 'harmfulBehavior', labelKey: 'letterWizard.fields.harmfulBehavior', placeholderKey: 'letterWizard.fields.harmfulBehaviorPlaceholder', multiline: true },
      { key: 'legalBasis', labelKey: 'letterWizard.fields.legalBasis', placeholderKey: 'letterWizard.fields.legalBasisPlaceholder', multiline: true },
      { key: 'deadline', labelKey: 'letterWizard.fields.deadline', placeholderKey: 'letterWizard.fields.deadlinePlaceholder' },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `CEASE AND DESIST LETTER\n\n` +
      `To: ${fields.recipientName || "[Recipient Name]"}\n\n` +
      `This letter serves as formal notice to immediately CEASE AND DESIST the following behavior:\n\n` +
      `${fields.harmfulBehavior || "[Detailed description of behavior - e.g., harassment, defamation, privacy violation, discrimination]"}\n\n` +
      `Legal Basis:\n${fields.legalBasis || "[Cite applicable laws, rights violated, potential claims]"}\n\n` +
      `DEMAND: You must immediately stop this behavior and confirm in writing by ${fields.deadline || "[Date]"} that you will comply.\n\n` +
      `If you fail to comply, I will pursue all available legal remedies including but not limited to: civil lawsuit, human rights complaint, criminal charges (if applicable), and requests for restraining orders.\n\n` +
      `This letter is sent without prejudice to my rights and remedies, all of which are expressly reserved.\n\n` +
      `${fields.name || "[Your Name]"}\n` +
      `Sent via: [Email/Registered Mail/Courier]`
    ),
  },
  
  demand_letter: {
    type: 'demand_letter',
    titleKey: 'letterWizard.types.demandLetter.title',
    descKey: 'letterWizard.types.demandLetter.desc',
    icon: '📨',
    fields: [
      { key: 'name', labelKey: 'letterWizard.fields.name', placeholderKey: 'letterWizard.fields.namePlaceholder', defaultFromProfile: 'name' },
      { key: 'recipientName', labelKey: 'letterWizard.fields.recipientName', placeholderKey: 'letterWizard.fields.recipientNamePlaceholder' },
      { key: 'wrongDescription', labelKey: 'letterWizard.fields.wrongDescription', placeholderKey: 'letterWizard.fields.wrongDescriptionPlaceholder', multiline: true },
      { key: 'demandedAction', labelKey: 'letterWizard.fields.demandedAction', placeholderKey: 'letterWizard.fields.demandedActionPlaceholder', multiline: true },
      { key: 'compensationRequested', labelKey: 'letterWizard.fields.compensationRequested', placeholderKey: 'letterWizard.fields.compensationRequestedPlaceholder' },
      { key: 'deadline', labelKey: 'letterWizard.fields.deadline', placeholderKey: 'letterWizard.fields.deadlinePlaceholder' },
    ],
    generatePreview: (fields) => (
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `FORMAL DEMAND LETTER\n\n` +
      `To: ${fields.recipientName || "[Recipient Name/Organization]"}\n\n` +
      `This letter constitutes formal demand for immediate action regarding the following:\n\n` +
      `Description of Wrong:\n${fields.wrongDescription || "[Detailed description of breach of duty, contractual violation, discrimination, or other wrong]"}\n\n` +
      `DEMAND FOR ACTION:\n${fields.demandedAction || "[Specific actions required - e.g., provide accommodation, cease discrimination, comply with policy]"}\n\n` +
      `DEMAND FOR COMPENSATION:\n$${fields.compensationRequested || "[Amount]"} for: [lost wages, medical expenses, pain and suffering, punitive damages]\n\n` +
      `DEADLINE: You must comply with this demand and provide written confirmation by ${fields.deadline || "[Date - typically 14-30 days]"}.\n\n` +
      `Failure to respond or comply will result in immediate legal action without further notice. This may include:\n` +
      `- Civil lawsuit seeking damages and costs\n` +
      `- Human rights complaint\n` +
      `- Complaint to professional regulator\n` +
      `- Public disclosure of discriminatory conduct\n\n` +
      `This letter is sent without prejudice to all rights and remedies.\n\n` +
      `${fields.name || "[Your Name]"}`
    ),
  },
};

// ============================================================================
// Main Component
// ============================================================================

export default function LetterWizardContent() {
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
        <SimplifiedView>
          {situation.recommendedLetters.map(type => {
            const template = LETTER_TEMPLATES[type];
            return (
              <View key={type} style={{ marginBottom: 12 }}>
                <A11yPressable
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
                {template.complexity && (
                  <View style={{ marginTop: 8 }}>
                    <ComplexityBadge complexity={template.complexity} showDetails={false} />
                  </View>
                )}
              </View>
            );
          })}
        </SimplifiedView>
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
      
      <DyslexiaText style={s.subtitle}>
        {t('letterWizard.subtitle', 'Create professional letters for any disability advocacy situation.')}
      </DyslexiaText>
      
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
