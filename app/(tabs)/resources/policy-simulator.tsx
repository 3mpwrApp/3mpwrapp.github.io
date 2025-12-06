/**
 * Interactive Policy Simulator - Enhanced Decision Tree Navigator
 * 
 * Comprehensive scenario exploration for:
 * - Workers' compensation claims and appeals
 * - Disability insurance processes
 * - Accommodation requests
 * - Return-to-work planning
 * - Human rights complaints
 * - Medical leave options
 * 
 * Features:
 * - Branching decision paths with outcomes
 * - Timeline predictions
 * - Risk assessment
 * - Document checklists per path
 * - Success probability indicators
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import { GapView } from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

export const options = { href: null };

interface Choice {
  id: string;
  label: string;
  next: string;
  effect?: string;
  risk?: 'low' | 'medium' | 'high';
  timeline?: string;
  documents?: string[];
  successRate?: number;
}

interface Step {
  id: string;
  title: string;
  text: string;
  icon: string;
  category: 'start' | 'claims' | 'appeal' | 'accommodation' | 'rtw' | 'rights' | 'outcome';
  choices: Choice[];
  tips?: string[];
}

const SCENARIOS: Record<string, Step> = {
  start: {
    id: 'start',
    title: '🎯 What\'s Your Situation?',
    text: 'Select the scenario that best describes your current situation. We\'ll guide you through the process step by step.',
    icon: 'compass',
    category: 'start',
    choices: [
      { id: 'c1', label: '🏗️ File a Workers\' Comp Claim', next: 'wc_start', timeline: '1-4 weeks for initial decision', successRate: 75 },
      { id: 'c2', label: '⚖️ Appeal a Denied Claim', next: 'appeal_type', timeline: '3-12 months', successRate: 45 },
      { id: 'c3', label: '♿ Request Workplace Accommodation', next: 'accommodation_start', timeline: '2-8 weeks', successRate: 70 },
      { id: 'c4', label: '↩️ Plan Return to Work', next: 'rtw_start', timeline: 'Varies', successRate: 65 },
      { id: 'c5', label: '🏥 Apply for Disability Benefits', next: 'disability_type', timeline: '2-6 months', successRate: 40 },
      { id: 'c6', label: '📋 File Human Rights Complaint', next: 'hr_start', timeline: '6-24 months', successRate: 35 },
    ]
  },

  // Workers' Compensation Path
  wc_start: {
    id: 'wc_start',
    title: '🏗️ Workers\' Compensation Claim',
    text: 'Filing a WC claim requires proper documentation and timely reporting. Let\'s check your situation.',
    icon: 'hard-hat',
    category: 'claims',
    tips: [
      'Report injury to employer within 24-48 hours if possible',
      'Seek medical attention immediately',
      'Document everything - photos, witnesses, symptoms',
    ],
    choices: [
      { id: 'a1', label: 'Injury just happened (within 1 week)', next: 'wc_fresh', risk: 'low', successRate: 85 },
      { id: 'a2', label: 'Injury happened 1-4 weeks ago', next: 'wc_delayed', risk: 'medium', successRate: 70 },
      { id: 'a3', label: 'Injury happened months ago', next: 'wc_late', risk: 'high', successRate: 50 },
      { id: 'a4', label: 'Repetitive strain / gradual onset', next: 'wc_gradual', risk: 'medium', successRate: 60 },
    ]
  },
  wc_fresh: {
    id: 'wc_fresh',
    title: '✅ Fresh Injury - Good Position',
    text: 'Reporting quickly is crucial. Here\'s your action plan:',
    icon: 'check-circle',
    category: 'claims',
    choices: [
      { id: 'f1', label: 'I have medical documentation', next: 'wc_docs_good', effect: 'Strong foundation for claim', documents: ['Medical report', 'Incident report', 'Witness statements'], successRate: 90 },
      { id: 'f2', label: 'I need to see a doctor first', next: 'wc_get_docs', effect: 'Slight delay but manageable', documents: ['Emergency room visit', 'Walk-in clinic report'], successRate: 80 },
      { id: 'b', label: '← Back', next: 'start' },
    ]
  },
  wc_delayed: {
    id: 'wc_delayed',
    title: '⚠️ Delayed Reporting',
    text: 'A delay may require explanation. Document why you waited (fear of retaliation, didn\'t realize severity, etc.)',
    icon: 'alert-circle',
    category: 'claims',
    choices: [
      { id: 'd1', label: 'Employer discouraged reporting', next: 'wc_retaliation', effect: 'Potential reprisal claim', risk: 'medium' },
      { id: 'd2', label: 'Symptoms developed gradually', next: 'wc_gradual', effect: 'Normal for some injuries' },
      { id: 'd3', label: 'I have good medical evidence now', next: 'wc_docs_good', effect: 'Focus on current documentation' },
      { id: 'b', label: '← Back', next: 'wc_start' },
    ]
  },
  wc_late: {
    id: 'wc_late',
    title: '🔴 Significant Delay',
    text: 'Late claims are harder but not impossible. You\'ll need strong medical evidence linking your condition to work.',
    icon: 'alert',
    category: 'claims',
    tips: [
      'Get detailed medical opinion on work-relatedness',
      'Document the timeline of symptom progression',
      'Explain delay in cover letter',
    ],
    choices: [
      { id: 'l1', label: 'Proceed with strong documentation', next: 'wc_docs_good', risk: 'high', documents: ['Specialist opinion', 'Work history', 'Symptom timeline'] },
      { id: 'l2', label: 'Consult a lawyer first', next: 'outcome_legal', effect: 'May improve chances significantly' },
      { id: 'b', label: '← Back', next: 'wc_start' },
    ]
  },
  wc_gradual: {
    id: 'wc_gradual',
    title: '🔄 Gradual Onset / Repetitive Strain',
    text: 'RSI and gradual conditions require proving the work connection. Focus on job duties and exposure.',
    icon: 'repeat',
    category: 'claims',
    tips: [
      'Document repetitive tasks and duration',
      'Get ergonomic assessment if possible',
      'Medical opinion linking duties to condition is crucial',
    ],
    choices: [
      { id: 'g1', label: 'Office work (typing, computer)', next: 'wc_docs_good', documents: ['Job description', 'Ergonomic report', 'Medical diagnosis'] },
      { id: 'g2', label: 'Physical labor (lifting, bending)', next: 'wc_docs_good', documents: ['Physical demands analysis', 'Medical records'] },
      { id: 'g3', label: 'Workplace stress / mental health', next: 'wc_mental', risk: 'high' },
      { id: 'b', label: '← Back', next: 'wc_start' },
    ]
  },
  wc_mental: {
    id: 'wc_mental',
    title: '🧠 Mental Health / Workplace Stress',
    text: 'Psychological claims are challenging but valid. Many workers develop PTSD, anxiety, or depression from workplace trauma or chronic stress.',
    icon: 'brain',
    category: 'claims',
    tips: [
      'Psychiatric assessment is essential',
      'Document triggering events or conditions',
      'Keep records of workplace stressors',
      'Consider filing harassment/discrimination complaint too',
    ],
    choices: [
      { id: 'm1', label: 'Single traumatic event', next: 'wc_docs_good', successRate: 55, documents: ['Incident report', 'Psychiatric evaluation', 'Witness statements'] },
      { id: 'm2', label: 'Chronic workplace stress', next: 'wc_docs_good', risk: 'high', successRate: 35, documents: ['Work environment documentation', 'Medical history'] },
      { id: 'm3', label: 'Harassment / bullying related', next: 'hr_start', effect: 'May also pursue human rights complaint' },
      { id: 'b', label: '← Back', next: 'wc_gradual' },
    ]
  },
  wc_docs_good: {
    id: 'wc_docs_good',
    title: '📋 Ready to File',
    text: 'You have what you need to submit your claim. Follow these steps carefully.',
    icon: 'file-document-check',
    category: 'outcome',
    tips: [
      'Keep copies of EVERYTHING you submit',
      'Submit by registered mail or get confirmation',
      'Note the date and claim number',
      'Follow up if no response in 2 weeks',
    ],
    choices: [
      { id: 'x1', label: '📝 Go to Letter Wizard', next: 'tool_letters' },
      { id: 'x2', label: '📁 Go to Evidence Locker', next: 'tool_evidence' },
      { id: 'x3', label: '⏰ Set Deadline Reminder', next: 'tool_deadlines' },
      { id: 'r', label: '🔄 Start Over', next: 'start' },
    ]
  },
  wc_retaliation: {
    id: 'wc_retaliation',
    title: '⚠️ Potential Retaliation',
    text: 'If your employer discouraged or punished you for reporting, you may have additional claims.',
    icon: 'shield-alert',
    category: 'claims',
    choices: [
      { id: 'r1', label: 'Document and file anyway', next: 'wc_docs_good', effect: 'Include retaliation concerns in claim' },
      { id: 'r2', label: 'File reprisal complaint', next: 'hr_start', effect: 'Separate but related process' },
      { id: 'b', label: '← Back', next: 'wc_delayed' },
    ]
  },

  // Appeal Path
  appeal_type: {
    id: 'appeal_type',
    title: '⚖️ What Was Denied?',
    text: 'Different types of denials have different appeal processes.',
    icon: 'gavel',
    category: 'appeal',
    choices: [
      { id: 'at1', label: 'Workers\' Comp Claim', next: 'appeal_wc', timeline: '6-12 months' },
      { id: 'at2', label: 'LTD / Disability Insurance', next: 'appeal_ltd', timeline: '3-18 months' },
      { id: 'at3', label: 'CPP-D / Social Security', next: 'appeal_cppd', timeline: '4-24 months' },
      { id: 'at4', label: 'Accommodation Request', next: 'appeal_accommodation' },
      { id: 'b', label: '← Back', next: 'start' },
    ]
  },
  appeal_wc: {
    id: 'appeal_wc',
    title: '⚖️ Workers\' Comp Appeal',
    text: 'WC appeals typically go through internal review first, then tribunal/board hearing.',
    icon: 'scale-balance',
    category: 'appeal',
    tips: [
      'Check your deadline - usually 30-90 days from decision',
      'Request your complete claim file',
      'Get new or updated medical evidence',
      'Address every reason for denial',
    ],
    choices: [
      { id: 'w1', label: 'I have new medical evidence', next: 'appeal_ready', successRate: 55 },
      { id: 'w2', label: 'I need to gather evidence', next: 'appeal_prep', effect: 'Take time to build case' },
      { id: 'w3', label: 'Deadline is very close', next: 'appeal_urgent', risk: 'high' },
      { id: 'b', label: '← Back', next: 'appeal_type' },
    ]
  },
  appeal_ltd: {
    id: 'appeal_ltd',
    title: '📄 LTD Insurance Appeal',
    text: 'Private insurance appeals are governed by the policy. Read it carefully for deadlines and process.',
    icon: 'file-document',
    category: 'appeal',
    tips: [
      'Request complete copy of your policy',
      'Get "own occupation" vs "any occupation" definition',
      'Independent medical exam (IME) can be challenged',
      'Consider legal help - many work on contingency',
    ],
    choices: [
      { id: 'l1', label: 'Denied based on IME', next: 'appeal_ime', successRate: 50 },
      { id: 'l2', label: 'Denied for "any occupation"', next: 'appeal_any_occ', risk: 'high' },
      { id: 'l3', label: 'Denied for paperwork issues', next: 'appeal_paperwork', successRate: 70 },
      { id: 'b', label: '← Back', next: 'appeal_type' },
    ]
  },
  appeal_cppd: {
    id: 'appeal_cppd',
    title: '🏛️ CPP-D / Government Benefits',
    text: 'Government disability benefits have specific appeal processes with strict timelines.',
    icon: 'bank',
    category: 'appeal',
    tips: [
      '90-day reconsideration deadline is firm',
      'Provide new evidence not in original application',
      'Detailed functional limitations from doctor crucial',
      'Social Security Tribunal is next step after reconsideration',
    ],
    choices: [
      { id: 'c1', label: 'Within 90 days - Reconsideration', next: 'appeal_prep', successRate: 35 },
      { id: 'c2', label: 'Past 90 days - Tribunal', next: 'appeal_ready', successRate: 50 },
      { id: 'c3', label: 'Need to reapply', next: 'disability_type', effect: 'Fresh application with better evidence' },
      { id: 'b', label: '← Back', next: 'appeal_type' },
    ]
  },
  appeal_ime: {
    id: 'appeal_ime',
    title: '👨‍⚕️ Challenging IME Results',
    text: 'Independent Medical Exams often favor insurers. You can challenge them.',
    icon: 'stethoscope',
    category: 'appeal',
    tips: [
      'Your treating doctor\'s opinion carries weight',
      'Point out that IME was one-time vs ongoing relationship',
      'Research the IME doctor\'s history of insurer-favorable opinions',
      'Get peer review of IME if possible',
    ],
    choices: [
      { id: 'i1', label: 'Get treating doctor rebuttal', next: 'appeal_ready', documents: ['Doctor rebuttal letter', 'Updated records'], successRate: 55 },
      { id: 'i2', label: 'Request second IME', next: 'appeal_ready', risk: 'medium', effect: 'May help or hurt' },
      { id: 'b', label: '← Back', next: 'appeal_ltd' },
    ]
  },
  appeal_any_occ: {
    id: 'appeal_any_occ',
    title: '💼 "Any Occupation" Denial',
    text: 'This is the hardest denial to appeal. You must prove you cannot work ANY job, not just your own.',
    icon: 'briefcase-off',
    category: 'appeal',
    tips: [
      'Focus on transferable skills analysis',
      'Document cognitive/psychological limitations',
      'Show unrealistic jobs were considered',
      'Vocational assessment may help',
    ],
    choices: [
      { id: 'a1', label: 'Get vocational assessment', next: 'appeal_ready', documents: ['Vocational report', 'Functional assessment'], successRate: 40 },
      { id: 'a2', label: 'Consult disability lawyer', next: 'outcome_legal', effect: 'Strongly recommended for these denials' },
      { id: 'b', label: '← Back', next: 'appeal_ltd' },
    ]
  },
  appeal_paperwork: {
    id: 'appeal_paperwork',
    title: '📋 Paperwork Issue Denial',
    text: 'Good news - this is often fixable. Provide the missing documentation.',
    icon: 'file-alert',
    category: 'appeal',
    choices: [
      { id: 'p1', label: 'Missing forms identified', next: 'appeal_ready', successRate: 75, effect: 'Submit complete package' },
      { id: 'p2', label: 'Unclear what\'s missing', next: 'tool_decoder', effect: 'Analyze denial letter' },
      { id: 'b', label: '← Back', next: 'appeal_ltd' },
    ]
  },
  appeal_accommodation: {
    id: 'appeal_accommodation',
    title: '♿ Accommodation Denial',
    text: 'Employers must accommodate to point of undue hardship. Many denials are challengeable.',
    icon: 'wheelchair-accessibility',
    category: 'appeal',
    choices: [
      { id: 'ac1', label: 'They said undue hardship', next: 'accommodation_hardship', successRate: 60 },
      { id: 'ac2', label: 'They ignored my request', next: 'hr_start', effect: 'Human rights violation' },
      { id: 'ac3', label: 'They offered inadequate accommodation', next: 'accommodation_negotiate', successRate: 65 },
      { id: 'b', label: '← Back', next: 'appeal_type' },
    ]
  },
  appeal_prep: {
    id: 'appeal_prep',
    title: '📚 Building Your Appeal',
    text: 'Take time to build the strongest possible case. Quality evidence wins appeals.',
    icon: 'folder-open',
    category: 'appeal',
    tips: [
      'Address every reason for denial point by point',
      'Get updated medical opinions',
      'Include new evidence not in original claim',
      'Organize documents clearly with cover letter',
    ],
    choices: [
      { id: 'ap1', label: '📝 Use Appeal Preparation Guide', next: 'tool_appeal_prep' },
      { id: 'ap2', label: '🔍 Analyze Denial Letter', next: 'tool_decoder' },
      { id: 'ap3', label: '📁 Organize Evidence', next: 'tool_evidence' },
      { id: 'r', label: '🔄 Start Over', next: 'start' },
    ]
  },
  appeal_ready: {
    id: 'appeal_ready',
    title: '✅ Ready to Appeal',
    text: 'You have what you need. File your appeal before the deadline.',
    icon: 'check-decagram',
    category: 'outcome',
    choices: [
      { id: 'ar1', label: '📝 Write Appeal Letter', next: 'tool_letters' },
      { id: 'ar2', label: '⏰ Check Deadlines', next: 'tool_deadlines' },
      { id: 'ar3', label: '📁 Final Evidence Check', next: 'tool_evidence' },
      { id: 'r', label: '🔄 Start Over', next: 'start' },
    ]
  },
  appeal_urgent: {
    id: 'appeal_urgent',
    title: '🚨 Urgent: Deadline Approaching',
    text: 'If your deadline is within days, file what you have now. You can often supplement later.',
    icon: 'clock-alert',
    category: 'appeal',
    tips: [
      'File a short letter preserving your appeal rights',
      'Request extension in writing',
      'Submit more evidence after initial filing',
      'Late is better than never - some tribunals allow extensions',
    ],
    choices: [
      { id: 'u1', label: 'File placeholder appeal now', next: 'tool_letters', effect: 'Preserves your rights' },
      { id: 'u2', label: 'Request deadline extension', next: 'tool_letters', effect: 'May or may not be granted' },
      { id: 'b', label: '← Back', next: 'appeal_wc' },
    ]
  },

  // Accommodation Path
  accommodation_start: {
    id: 'accommodation_start',
    title: '♿ Workplace Accommodation',
    text: 'You have the right to reasonable accommodations for disabilities under human rights law.',
    icon: 'wheelchair-accessibility',
    category: 'accommodation',
    tips: [
      'Request in writing (email creates paper trail)',
      'Be specific about what you need',
      'You don\'t need to disclose diagnosis, only limitations',
      'Employer must engage in interactive process',
    ],
    choices: [
      { id: 'ac1', label: 'I haven\'t requested yet', next: 'accommodation_request', successRate: 70 },
      { id: 'ac2', label: 'Request was denied', next: 'appeal_accommodation' },
      { id: 'ac3', label: 'Employer is being difficult', next: 'accommodation_negotiate' },
      { id: 'b', label: '← Back', next: 'start' },
    ]
  },
  accommodation_request: {
    id: 'accommodation_request',
    title: '📝 Making Your Request',
    text: 'A clear, written request is your foundation. Include your limitations and proposed solutions.',
    icon: 'file-sign',
    category: 'accommodation',
    choices: [
      { id: 'r1', label: '📝 Go to Letter Wizard', next: 'tool_letters', documents: ['Accommodation request letter', 'Medical documentation if needed'] },
      { id: 'r2', label: 'I need medical documentation first', next: 'tool_doctor', effect: 'Get doctor to document limitations' },
      { id: 'b', label: '← Back', next: 'accommodation_start' },
    ]
  },
  accommodation_negotiate: {
    id: 'accommodation_negotiate',
    title: '🤝 Negotiating Accommodations',
    text: 'Accommodation is an interactive process. Both sides should participate in finding solutions.',
    icon: 'handshake',
    category: 'accommodation',
    tips: [
      'Propose multiple options',
      'Be flexible where possible',
      'Document all discussions',
      'Request union support if available',
    ],
    choices: [
      { id: 'n1', label: 'They\'re negotiating in good faith', next: 'accommodation_request', effect: 'Continue dialogue' },
      { id: 'n2', label: 'They\'re refusing to engage', next: 'hr_start', effect: 'May be human rights violation' },
      { id: 'n3', label: 'I need union support', next: 'tool_solidarity' },
      { id: 'b', label: '← Back', next: 'accommodation_start' },
    ]
  },
  accommodation_hardship: {
    id: 'accommodation_hardship',
    title: '⚠️ "Undue Hardship" Claim',
    text: 'Employers often claim undue hardship prematurely. The bar is actually quite high.',
    icon: 'alert-circle',
    category: 'accommodation',
    tips: [
      'Hardship must be proven, not assumed',
      'Cost alone rarely qualifies',
      'They must explore ALL options',
      'Tax credits may offset costs',
    ],
    choices: [
      { id: 'h1', label: 'Challenge the hardship claim', next: 'hr_start', effect: 'File human rights complaint' },
      { id: 'h2', label: 'Propose alternative accommodations', next: 'accommodation_negotiate' },
      { id: 'h3', label: 'Get legal advice', next: 'outcome_legal' },
      { id: 'b', label: '← Back', next: 'appeal_accommodation' },
    ]
  },

  // RTW Path
  rtw_start: {
    id: 'rtw_start',
    title: '↩️ Return to Work Planning',
    text: 'A gradual, supported return is often best. Know your rights and options.',
    icon: 'door-open',
    category: 'rtw',
    choices: [
      { id: 'rtw1', label: 'Employer wants me back', next: 'rtw_employer', successRate: 70 },
      { id: 'rtw2', label: 'I\'m ready but employer won\'t cooperate', next: 'rtw_barriers' },
      { id: 'rtw3', label: 'I\'m not ready but being pushed', next: 'rtw_pressure' },
      { id: 'rtw4', label: 'Need modified duties plan', next: 'tool_rtw' },
      { id: 'b', label: '← Back', next: 'start' },
    ]
  },
  rtw_employer: {
    id: 'rtw_employer',
    title: '✅ Employer-Supported Return',
    text: 'Good! Work together on a gradual return plan with appropriate accommodations.',
    icon: 'check-circle',
    category: 'rtw',
    choices: [
      { id: 'e1', label: 'Create RTW Plan', next: 'tool_rtw' },
      { id: 'e2', label: 'Request Accommodations', next: 'accommodation_request' },
      { id: 'e3', label: 'Get Medical Clearance', next: 'tool_doctor' },
      { id: 'b', label: '← Back', next: 'rtw_start' },
    ]
  },
  rtw_barriers: {
    id: 'rtw_barriers',
    title: '🚧 RTW Barriers',
    text: 'If you\'re cleared to work but employer won\'t accommodate, that\'s potentially discriminatory.',
    icon: 'block-helper',
    category: 'rtw',
    choices: [
      { id: 'b1', label: 'Document the barriers', next: 'tool_evidence', effect: 'Build case for complaint' },
      { id: 'b2', label: 'Request union help', next: 'tool_solidarity' },
      { id: 'b3', label: 'File human rights complaint', next: 'hr_start' },
      { id: 'b', label: '← Back', next: 'rtw_start' },
    ]
  },
  rtw_pressure: {
    id: 'rtw_pressure',
    title: '⚠️ Being Pressured to Return',
    text: 'You cannot be forced to return before medically cleared. Get documentation.',
    icon: 'alert',
    category: 'rtw',
    tips: [
      'Medical clearance is required',
      'Document all pressure tactics',
      'Premature return can worsen injury',
      'May constitute reprisal',
    ],
    choices: [
      { id: 'p1', label: 'Get doctor to confirm not ready', next: 'tool_doctor' },
      { id: 'p2', label: 'Document pressure (reprisal)', next: 'tool_evidence' },
      { id: 'p3', label: 'Report to workers\' comp', next: 'wc_docs_good' },
      { id: 'b', label: '← Back', next: 'rtw_start' },
    ]
  },

  // Disability Benefits Path
  disability_type: {
    id: 'disability_type',
    title: '🏥 Disability Benefits Application',
    text: 'Multiple programs may be available. Understanding eligibility is the first step.',
    icon: 'medical-bag',
    category: 'claims',
    choices: [
      { id: 'd1', label: 'CPP Disability (federal)', next: 'disability_cppd', timeline: '4-6 months' },
      { id: 'd2', label: 'Provincial Disability (ODSP, etc.)', next: 'disability_provincial' },
      { id: 'd3', label: 'Private LTD Insurance', next: 'disability_ltd' },
      { id: 'd4', label: 'Not sure what I qualify for', next: 'disability_assess' },
      { id: 'b', label: '← Back', next: 'start' },
    ]
  },
  disability_cppd: {
    id: 'disability_cppd',
    title: '🏛️ CPP Disability',
    text: 'CPP-D requires a "severe and prolonged" disability. The application process is detailed.',
    icon: 'bank',
    category: 'claims',
    tips: [
      'Must have contributed to CPP for minimum period',
      '"Severe" means can\'t work any job regularly',
      '"Prolonged" means 12+ months or terminal',
      'Doctor\'s report is critical',
    ],
    choices: [
      { id: 'c1', label: 'I meet the criteria', next: 'wc_docs_good', documents: ['Application form', 'Doctor\'s report', 'Medical records', 'Work history'] },
      { id: 'c2', label: 'I\'m not sure if I qualify', next: 'disability_assess' },
      { id: 'c3', label: 'Previously denied - appeal', next: 'appeal_cppd' },
      { id: 'b', label: '← Back', next: 'disability_type' },
    ]
  },
  disability_provincial: {
    id: 'disability_provincial',
    title: '🏢 Provincial Disability',
    text: 'Provincial programs (ODSP, PWD, AISH, etc.) have different eligibility rules.',
    icon: 'city',
    category: 'claims',
    choices: [
      { id: 'p1', label: 'Apply with medical evidence', next: 'wc_docs_good', documents: ['Application', 'Doctor forms', 'Financial info'] },
      { id: 'p2', label: 'Need help with application', next: 'tool_letters' },
      { id: 'b', label: '← Back', next: 'disability_type' },
    ]
  },
  disability_ltd: {
    id: 'disability_ltd',
    title: '📄 Private LTD Insurance',
    text: 'Check your employer benefits or personal policy for long-term disability coverage.',
    icon: 'file-certificate',
    category: 'claims',
    tips: [
      'Read your policy carefully',
      'Note elimination period (waiting period)',
      'Understand "own occ" vs "any occ" definitions',
      'Document everything you submit',
    ],
    choices: [
      { id: 'l1', label: 'I have workplace LTD', next: 'wc_docs_good', documents: ['Claim form', 'Attending physician statement', 'Employer info'] },
      { id: 'l2', label: 'I have private policy', next: 'wc_docs_good' },
      { id: 'l3', label: 'I was denied - appeal', next: 'appeal_ltd' },
      { id: 'b', label: '← Back', next: 'disability_type' },
    ]
  },
  disability_assess: {
    id: 'disability_assess',
    title: '❓ Eligibility Assessment',
    text: 'Not sure what you qualify for? Let\'s figure it out.',
    icon: 'help-circle',
    category: 'claims',
    choices: [
      { id: 'a1', label: 'Use Rights Checker Tool', next: 'tool_rights' },
      { id: 'a2', label: 'Talk to advocate/worker', next: 'outcome_advocate' },
      { id: 'b', label: '← Back', next: 'disability_type' },
    ]
  },

  // Human Rights Path
  hr_start: {
    id: 'hr_start',
    title: '📋 Human Rights Complaint',
    text: 'If you\'ve experienced discrimination based on disability, you can file a complaint.',
    icon: 'scale-balance',
    category: 'rights',
    tips: [
      'Deadline is usually 1 year from last incident',
      'Document the discrimination thoroughly',
      'Include impact on you',
      'Remedies can include compensation and policy changes',
    ],
    choices: [
      { id: 'hr1', label: 'Workplace discrimination', next: 'hr_workplace', successRate: 40 },
      { id: 'hr2', label: 'Service/housing discrimination', next: 'hr_service' },
      { id: 'hr3', label: 'Not sure if it\'s discrimination', next: 'tool_rights' },
      { id: 'b', label: '← Back', next: 'start' },
    ]
  },
  hr_workplace: {
    id: 'hr_workplace',
    title: '💼 Workplace Discrimination',
    text: 'Workplace discrimination includes failure to accommodate, harassment, and termination.',
    icon: 'briefcase',
    category: 'rights',
    choices: [
      { id: 'w1', label: 'Failed to accommodate', next: 'hr_file', documents: ['Accommodation request', 'Denial/response', 'Medical documentation'] },
      { id: 'w2', label: 'Harassment/hostile environment', next: 'hr_file', documents: ['Incident log', 'Witnesses', 'Reports made'] },
      { id: 'w3', label: 'Fired after disclosure/request', next: 'hr_file', documents: ['Termination letter', 'Timeline of events', 'Accommodation request'], effect: 'Potential reprisal claim' },
      { id: 'b', label: '← Back', next: 'hr_start' },
    ]
  },
  hr_service: {
    id: 'hr_service',
    title: '🏠 Service/Housing Discrimination',
    text: 'You have the right to accessible services, housing, and public spaces.',
    icon: 'home',
    category: 'rights',
    choices: [
      { id: 's1', label: 'Inaccessible service/business', next: 'hr_file' },
      { id: 's2', label: 'Housing denied/modified work refused', next: 'hr_file' },
      { id: 's3', label: 'Service animal/assistive device refused', next: 'hr_file' },
      { id: 'b', label: '← Back', next: 'hr_start' },
    ]
  },
  hr_file: {
    id: 'hr_file',
    title: '📝 Filing Your Complaint',
    text: 'A well-documented complaint has better chances. Organize your evidence.',
    icon: 'file-document-edit',
    category: 'outcome',
    choices: [
      { id: 'f1', label: '📝 Use Letter Wizard', next: 'tool_letters' },
      { id: 'f2', label: '📁 Organize Evidence', next: 'tool_evidence' },
      { id: 'f3', label: '✅ Use Rights Checker', next: 'tool_rights' },
      { id: 'r', label: '🔄 Start Over', next: 'start' },
    ]
  },

  // Tool Redirects
  tool_letters: {
    id: 'tool_letters',
    title: '📝 Letter Wizard',
    text: 'Create professional letters for your situation.',
    icon: 'file-document-edit',
    category: 'outcome',
    choices: [{ id: 'x', label: 'Open Letter Wizard', next: 'ROUTE:/(tabs)/resources/(tools)/letter-wizard' }, { id: 'r', label: '🔄 Start Over', next: 'start' }]
  },
  tool_evidence: {
    id: 'tool_evidence',
    title: '📁 Evidence Locker',
    text: 'Securely store and organize your documents.',
    icon: 'folder-lock',
    category: 'outcome',
    choices: [{ id: 'x', label: 'Open Evidence Locker', next: 'ROUTE:/(tabs)/resources/evidence-locker' }, { id: 'r', label: '🔄 Start Over', next: 'start' }]
  },
  tool_deadlines: {
    id: 'tool_deadlines',
    title: '⏰ Deadline Tracker',
    text: 'Never miss an important deadline.',
    icon: 'clock-alert',
    category: 'outcome',
    choices: [{ id: 'x', label: 'Open Deadline Tracker', next: 'ROUTE:/(tabs)/resources/deadlines' }, { id: 'r', label: '🔄 Start Over', next: 'start' }]
  },
  tool_decoder: {
    id: 'tool_decoder',
    title: '🔍 Denial Decoder',
    text: 'Analyze your denial letter for appeal strategy.',
    icon: 'file-search',
    category: 'outcome',
    choices: [{ id: 'x', label: 'Open Denial Decoder', next: 'ROUTE:/(tabs)/resources/denial-decoder' }, { id: 'r', label: '🔄 Start Over', next: 'start' }]
  },
  tool_doctor: {
    id: 'tool_doctor',
    title: '🩺 Doctor Visit Prep',
    text: 'Prepare for your medical appointments.',
    icon: 'stethoscope',
    category: 'outcome',
    choices: [{ id: 'x', label: 'Open Doctor Visit Prep', next: 'ROUTE:/(tabs)/resources/doctor-visit-prep' }, { id: 'r', label: '🔄 Start Over', next: 'start' }]
  },
  tool_rtw: {
    id: 'tool_rtw',
    title: '↩️ RTW Planner',
    text: 'Create your return-to-work plan.',
    icon: 'door-open',
    category: 'outcome',
    choices: [{ id: 'x', label: 'Open RTW Planner', next: 'ROUTE:/(tabs)/resources/rtw-planner' }, { id: 'r', label: '🔄 Start Over', next: 'start' }]
  },
  tool_rights: {
    id: 'tool_rights',
    title: '✅ Rights Checker',
    text: 'Check your rights and options.',
    icon: 'check-decagram',
    category: 'outcome',
    choices: [{ id: 'x', label: 'Open Rights Checker', next: 'ROUTE:/(tabs)/resources/rights-checker' }, { id: 'r', label: '🔄 Start Over', next: 'start' }]
  },
  tool_solidarity: {
    id: 'tool_solidarity',
    title: '✊ Solidarity Toolkit',
    text: 'Get union and worker support resources.',
    icon: 'hand-heart',
    category: 'outcome',
    choices: [{ id: 'x', label: 'Open Solidarity Toolkit', next: 'ROUTE:/(tabs)/resources/solidarity-toolkit' }, { id: 'r', label: '🔄 Start Over', next: 'start' }]
  },
  tool_appeal_prep: {
    id: 'tool_appeal_prep',
    title: '⚖️ Appeal Preparation',
    text: 'Step-by-step appeal preparation guide.',
    icon: 'clipboard-list',
    category: 'outcome',
    choices: [{ id: 'x', label: 'Open Prepare to Appeal', next: 'ROUTE:/(tabs)/resources/(tools)/prepare-appeal' }, { id: 'r', label: '🔄 Start Over', next: 'start' }]
  },

  // Outcome Nodes
  outcome_legal: {
    id: 'outcome_legal',
    title: '⚖️ Legal Consultation Recommended',
    text: 'Your situation may benefit from legal advice. Many disability lawyers offer free consultations.',
    icon: 'scale-balance',
    category: 'outcome',
    tips: [
      'Many work on contingency (no upfront cost)',
      'Legal aid may be available',
      'Community legal clinics offer free help',
      'Union may have legal resources',
    ],
    choices: [{ id: 'r', label: '🔄 Start Over', next: 'start' }]
  },
  outcome_advocate: {
    id: 'outcome_advocate',
    title: '🤝 Connect with Advocate',
    text: 'Disability advocates and case workers can help navigate the system.',
    icon: 'account-heart',
    category: 'outcome',
    tips: [
      'Many communities have free advocacy services',
      'Peer support from others who\'ve been through it',
      'Social workers at hospitals/clinics',
      'Independent Living Centres',
    ],
    choices: [{ id: 'r', label: '🔄 Start Over', next: 'start' }]
  },
};

export default function PolicySimulator() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const router = useRouter();
  const titleRef = React.useRef<Text>(null);
  const s = useMemo(() => styles(palette), [palette]);
  
  useAnnounceOnMount(t('simulator.screenLabel', 'Policy Simulator'));
  useFocusOnRefOnMount(titleRef);
  
  const [step, setStep] = useState<Step>(SCENARIOS.start);
  const [history, setHistory] = useState<string[]>(['start']);
  const [log, setLog] = useState<{ effect: string; risk?: string; documents?: string[] }[]>([]);

  const choose = (c: Choice) => {
    // Handle route navigation
    if (c.next.startsWith('ROUTE:')) {
      const route = c.next.replace('ROUTE:', '');
      router.push(route as any);
      return;
    }

    if (c.effect) {
      setLog(prev => [...prev, { 
        effect: c.effect!, 
        risk: c.risk, 
        documents: c.documents 
      }]);
    }
    setHistory(prev => [...prev, c.next]);
    setStep(SCENARIOS[c.next]);
    announce(SCENARIOS[c.next]?.title || 'Next step');
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setStep(SCENARIOS[newHistory[newHistory.length - 1]]);
    }
  };

  const reset = () => {
    setStep(SCENARIOS.start);
    setHistory(['start']);
    setLog([]);
    announce(t('simulator.reset', 'Simulator reset'));
  };

  const getCategoryColor = (category: Step['category']) => {
    const colors: Record<Step['category'], string> = {
      start: palette.primary,
      claims: palette.warning,
      appeal: palette.error,
      accommodation: palette.success,
      rtw: palette.info,
      rights: palette.primary,
      outcome: palette.success,
    };
    return colors[category];
  };

  return (
    <ResponsiveScreenWrapper testID="policy-simulator-screen">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={s.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          🎮 {t('simulator.title', 'Interactive Policy Simulator')}
        </Text>
        
        <DyslexiaText style={s.subtitle}>
          {t('simulator.subtitle', 'Explore different paths and understand your options. See timelines, success rates, and required documents.')}
        </DyslexiaText>
        
        <DisclaimerBanner type="legal" compact />

        {/* Progress Breadcrumb */}
        {history.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {history.map((h, i) => (
                <React.Fragment key={i}>
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => {
                      const newHistory = history.slice(0, i + 1);
                      setHistory(newHistory);
                      setStep(SCENARIOS[h]);
                    }}
                    style={[s.breadcrumb, i === history.length - 1 && s.breadcrumbActive]}
                  >
                    <Text style={[s.breadcrumbText, i === history.length - 1 && s.breadcrumbTextActive]}>
                      {SCENARIOS[h]?.title?.slice(0, 20) || h}
                    </Text>
                  </Pressable>
                  {i < history.length - 1 && (
                    <Ionicons name="chevron-forward" size={16} color={palette.muted} style={{ marginHorizontal: 4 }} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Current Step Card */}
        <View style={[s.stepCard, { borderLeftColor: getCategoryColor(step.category) }]}>
          <Text style={s.stepTitle}>{step.title}</Text>
          <DyslexiaText style={s.stepText}>{step.text}</DyslexiaText>
          
          {step.tips && step.tips.length > 0 && (
            <View style={s.tipsBox}>
              <Text style={s.tipsTitle}>💡 Tips:</Text>
              {step.tips.map((tip, i) => (
                <Text key={i} style={s.tipItem}>• {tip}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Choices */}
        <GapView gap={12} style={{ marginTop: 16 }}>
          {step.choices.map(c => (
            <A11yPressable
              key={c.id}
              onPress={() => choose(c)}
              accessibilityRole="button"
              accessibilityLabel={c.label}
              style={[s.choiceCard, c.risk === 'high' && s.choiceHighRisk]}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.choiceLabel}>{c.label}</Text>
                {c.timeline && (
                  <Text style={s.choiceMeta}>⏱️ {c.timeline}</Text>
                )}
                {c.successRate !== undefined && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={s.choiceMeta}>📊 Success rate: </Text>
                    <View style={s.successBar}>
                      <View style={[s.successFill, { width: `${c.successRate}%`, backgroundColor: c.successRate >= 60 ? palette.success : c.successRate >= 40 ? palette.warning : palette.error }]} />
                    </View>
                    <Text style={[s.choiceMeta, { marginLeft: 6 }]}>{c.successRate}%</Text>
                  </View>
                )}
                {c.risk && (
                  <Text style={[s.choiceMeta, { color: c.risk === 'high' ? palette.error : c.risk === 'medium' ? palette.warning : palette.success }]}>
                    ⚠️ Risk: {c.risk}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={palette.muted} />
            </A11yPressable>
          ))}
        </GapView>

        {/* Journey Log */}
        {log.length > 0 && (
          <View style={s.logSection}>
            <Text style={s.logTitle}>📋 Your Journey Log</Text>
            {log.map((entry, i) => (
              <View key={i} style={s.logEntry}>
                <Text style={s.logEffect}>• {entry.effect}</Text>
                {entry.documents && (
                  <Text style={s.logDocs}>📄 Docs: {entry.documents.join(', ')}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Navigation */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
          {history.length > 1 && (
            <A11yPressable onPress={goBack} style={s.navButton}>
              <Ionicons name="arrow-back" size={20} color={palette.text} />
              <Text style={s.navButtonText}>{t('common.back', 'Back')}</Text>
            </A11yPressable>
          )}
          <A11yPressable onPress={reset} style={[s.navButton, { borderColor: palette.error }]}>
            <Ionicons name="refresh" size={20} color={palette.error} />
            <Text style={[s.navButtonText, { color: palette.error }]}>{t('simulator.restart', 'Start Over')}</Text>
          </A11yPressable>
        </View>
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    title: { fontSize: 24, fontWeight: '700', color: palette.text, marginBottom: 8 },
    subtitle: { fontSize: 15, color: palette.text, opacity: 0.9, marginBottom: 12, lineHeight: 22 },
    breadcrumb: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: palette.surface },
    breadcrumbActive: { backgroundColor: palette.primary },
    breadcrumbText: { fontSize: 12, color: palette.text },
    breadcrumbTextActive: { color: palette.onPrimary, fontWeight: '600' },
    stepCard: { backgroundColor: palette.surface, borderRadius: 12, padding: 20, borderLeftWidth: 4 },
    stepTitle: { fontSize: 20, fontWeight: '700', color: palette.text, marginBottom: 12 },
    stepText: { fontSize: 15, color: palette.text, lineHeight: 22 },
    tipsBox: { backgroundColor: palette.primary + '10', borderRadius: 8, padding: 12, marginTop: 16 },
    tipsTitle: { fontSize: 14, fontWeight: '700', color: palette.text, marginBottom: 6 },
    tipItem: { fontSize: 13, color: palette.text, lineHeight: 20 },
    choiceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: palette.muted },
    choiceHighRisk: { borderColor: palette.error },
    choiceLabel: { fontSize: 15, fontWeight: '600', color: palette.text },
    choiceMeta: { fontSize: 12, color: palette.textSecondary, marginTop: 4 },
    successBar: { width: 60, height: 6, backgroundColor: palette.muted + '40', borderRadius: 3, overflow: 'hidden' },
    successFill: { height: '100%', borderRadius: 3 },
    logSection: { backgroundColor: palette.surface, borderRadius: 12, padding: 16, marginTop: 24 },
    logTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 12 },
    logEntry: { marginBottom: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    logEffect: { fontSize: 14, color: palette.text },
    logDocs: { fontSize: 12, color: palette.primary, marginTop: 4 },
    navButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: palette.muted, gap: 6 },
    navButtonText: { fontSize: 14, fontWeight: '600', color: palette.text },
  });
}

