/**
 * DEPRECATED: Letter Factory has been merged into Letter Wizard.
 * This file redirects to the unified letter tool.
 * Use (tools)/letter-wizard.tsx for all letter generation.
 */
import { useRouter } from 'expo-router';
import React from 'react';

export const options = { href: null };

export default function LetterFactoryRedirect() {
  const router = useRouter();
  
  React.useEffect(() => {
    router.replace('/(tabs)/resources/letter-wizard');
  }, [router]);
  
  return null;
}

/* DEPRECATED CODE BELOW - NOW IN LETTER WIZARD
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };
*/

type LetterTemplate = {
  id: string;
  category: 'accommodation' | 'appeal' | 'complaint' | 'request' | 'union';
  name: string;
  description: string;
  tone: 'friendly' | 'formal' | 'legal';
  content: string;
};

type ToneOption = 'friendly' | 'formal' | 'legal';

const TEMPLATES: LetterTemplate[] = [
  {
    id: 'acc1',
    category: 'accommodation',
    name: 'Accommodation Request (Medical)',
    description: 'Request workplace accommodation for medical condition',
    tone: 'formal',
    content: `[Date]

[Employer Name]
[HR/Manager Name]
[Address]

Dear [Manager Name],

RE: Request for Workplace Accommodation

I am writing to formally request workplace accommodations under the duty to accommodate as outlined in the Canadian Human Rights Act and [Provincial Human Rights Code].

MEDICAL CONDITION:
I have been diagnosed with [condition] which creates the following functional limitations:
• [Limitation 1]
• [Limitation 2]
• [Limitation 3]

REQUESTED ACCOMMODATIONS:
To enable me to perform my essential job duties, I respectfully request the following accommodations:
1. [Specific accommodation, e.g., "Ergonomic chair and desk setup"]
2. [Specific accommodation, e.g., "Flexible start times to manage morning symptoms"]
3. [Specific accommodation, e.g., "Work from home 2 days per week"]

SUPPORTING DOCUMENTATION:
Attached is a letter from my treating physician, Dr. [Name], confirming my diagnosis and recommending these accommodations. I am willing to provide additional medical information as needed through the appropriate confidential channels.

I am committed to working collaboratively with you to identify effective accommodations that balance operational needs with my medical requirements. I am available to meet at your earliest convenience to discuss this request.

I look forward to your response within [10 business days] as required under the duty to accommodate.

Sincerely,
[Your Name]
[Employee ID]
[Contact Information]

Attachments: Medical documentation`
  },
  {
    id: 'app1',
    category: 'appeal',
    name: 'Benefits Appeal Letter',
    description: 'Appeal denial of disability benefits (LTD/CPP-D/WSIB)',
    tone: 'formal',
    content: `[Date]

[Insurance Company / Service Canada / WSIB]
Appeals Department
[Address]

RE: Appeal of Claim Denial – [Claim/Policy Number]

Dear Appeals Officer,

I am writing to formally appeal the decision dated [denial date] denying my claim for [Long-Term Disability / CPP Disability / WSIB] benefits.

GROUNDS FOR APPEAL:

1. INSUFFICIENT CONSIDERATION OF MEDICAL EVIDENCE
The decision failed to adequately consider the comprehensive medical evidence from my treating specialists:
• Dr. [Specialist Name]'s report dated [date] confirming [diagnosis and prognosis]
• Functional capacity evaluation showing [specific limitations]
• Ongoing treatment records demonstrating [severity and persistence]

2. MISAPPLICATION OF POLICY CRITERIA
[For LTD: The policy defines "totally disabled" as unable to perform substantial duties of my occupation. My condition clearly meets this standard because...]
[For CPP-D: My condition is both "severe" (unable to regularly pursue substantially gainful employment) and "prolonged" (expected to be long-continued)...]
[For WSIB: The evidence establishes causation between my workplace duties and injury...]

3. FACTUAL ERRORS IN DECISION
The decision contains the following errors:
• [Error 1, e.g., "States I returned to full duties when I only attempted modified work for 2 weeks"]
• [Error 2]

NEW EVIDENCE:
Since the original decision, I have obtained:
• Updated medical opinion from [specialist] dated [date]
• [Additional test results / imaging / assessments]

REQUESTED REMEDY:
I respectfully request that this decision be overturned and that benefits be approved retroactive to [date of disability]. I am willing to provide any additional information required.

The attached documentation supports my appeal. I request written confirmation of receipt and a timeline for decision.

Sincerely,
[Your Name]
[SIN / Policy Number / Claim Number]
[Contact Information]

Enclosures: [List attached evidence]`
  },
  {
    id: 'comp1',
    category: 'complaint',
    name: 'Discrimination Complaint',
    description: 'File complaint with Human Rights Tribunal',
    tone: 'legal',
    content: `[Date]

[Human Rights Tribunal of Ontario / Canadian Human Rights Commission]
[Address]

RE: Complaint of Discrimination Based on Disability

COMPLAINANT:
Name: [Your Full Name]
Address: [Your Address]
Phone: [Phone]
Email: [Email]

RESPONDENT:
Name: [Company/Organization Name]
Address: [Respondent Address]
Contact: [If known]

GROUNDS OF DISCRIMINATION:
I am filing this complaint on the grounds of disability discrimination contrary to the [Human Rights Code / Canadian Human Rights Act].

PROTECTED CHARACTERISTIC:
I have [disability/medical condition] which substantially limits [major life activity]. This condition is protected under human rights legislation.

DISCRIMINATORY CONDUCT:

1. FAILURE TO ACCOMMODATE
Despite my request for accommodation dated [date], the respondent:
• [Specific action/inaction, e.g., "Refused to provide requested ergonomic equipment"]
• [Specific action/inaction, e.g., "Terminated my employment without exploring accommodation options"]
• [Specific action/inaction]

2. ADVERSE TREATMENT
I was subjected to the following adverse treatment because of my disability:
• [Specific incident with date]
• [Specific incident with date]

3. FAILURE TO MEET DUTY TO ACCOMMODATE
The respondent failed to accommodate me to the point of undue hardship by:
• Not engaging in meaningful dialogue about my needs
• Not obtaining medical information through proper channels
• Not considering available accommodations
• [Other failures]

IMPACT:
This discrimination has caused:
• Loss of employment and income
• Worsening of medical condition due to stress
• Emotional distress and loss of dignity

REMEDY SOUGHT:
1. Declaration that the respondent discriminated against me
2. Compensation for lost wages: $[amount]
3. Compensation for injury to dignity: $[amount]
4. Order requiring [specific remedy, e.g., reinstatement, policy changes]
5. Order prohibiting future discrimination

SUPPORTING EVIDENCE:
I have the following evidence supporting this complaint:
• Accommodation request letter dated [date]
• Medical documentation
• Email correspondence
• Witness statements
• [Other evidence]

I am prepared to participate in mediation and provide additional information as required.

Respectfully submitted,

[Your Name]
[Signature]
[Date]`
  },
  {
    id: 'req1',
    category: 'request',
    name: 'File Access Request',
    description: 'Request complete claim file under privacy legislation',
    tone: 'formal',
    content: `[Date]

[Organization Name]
Access to Information Officer / Privacy Officer
[Address]

RE: Access to Personal Information Request

Dear Privacy Officer,

Pursuant to [the Freedom of Information and Protection of Privacy Act / Personal Information Protection and Electronic Documents Act (PIPEDA)], I am requesting access to all personal information held by your organization concerning me.

REQUESTER INFORMATION:
Name: [Your Full Legal Name]
Date of Birth: [DOB]
Claim/File Number: [Number if applicable]
Policy Number: [If applicable]
Employment Dates: [If workplace request]

SCOPE OF REQUEST:
I request complete copies of ALL records containing my personal information, including but not limited to:

1. CLAIM FILES (if applicable):
   • Complete adjudication file
   • All medical reports, assessments, and opinions obtained
   • Internal notes, memoranda, and decision rationale
   • Surveillance reports or investigative materials
   • Communications with third parties about my claim

2. EMPLOYMENT RECORDS (if applicable):
   • Personnel file
   • Performance reviews
   • Accommodation requests and responses
   • Incident reports
   • Communications regarding my employment

3. CORRESPONDENCE:
   • All emails, letters, and internal communications
   • Phone call logs and notes

4. POLICIES AND GUIDELINES:
   • Applicable policies and decision-making guidelines used in my case

FORMAT:
Please provide records in electronic format (PDF) if possible. If certain records are withheld, please provide:
• Index of withheld records
• Specific exemption cited for each withheld record
• Notice of my right to appeal

TIMELINE:
I expect a response within 30 days as required by legislation. If you require an extension, please notify me in writing with reasons.

FEES:
Please advise of any fees before processing. I may be entitled to fee waivers under [legislation].

CONTACT:
Please send all correspondence to:
[Your Mailing Address]
Email: [Your Email]
Phone: [Your Phone]

Thank you for your attention to this request.

Sincerely,

[Your Name]
[Signature]

Identification enclosed: [e.g., Copy of driver's license]`
  },
  {
    id: 'union1',
    category: 'union',
    name: 'Union Grievance',
    description: 'File grievance through union representative',
    tone: 'formal',
    content: `[Date]

[Union Name]
[Union Representative Name]
[Address]

CC: [Employer Name], [HR Director]

RE: Formal Grievance – [Your Name] – [Issue Summary]

Dear [Union Representative],

I am filing this formal grievance under Article [X] of the Collective Agreement regarding [specific violation].

GRIEVOR INFORMATION:
Name: [Your Name]
Employee ID: [ID]
Department: [Department]
Classification: [Job Title]
Union Member Since: [Date]

NATURE OF GRIEVANCE:

1. VIOLATION OF COLLECTIVE AGREEMENT:
The employer has violated Article [X] of the Collective Agreement which states: "[quote relevant clause]"

2. FACTS:
On [date], the following occurred:
• [Chronological fact 1]
• [Chronological fact 2]
• [Chronological fact 3]

3. IMPACT:
This violation has resulted in:
• [Specific harm, e.g., "Loss of wages totaling $X"]
• [Specific harm, e.g., "Denial of accommodation rights"]
• [Specific harm, e.g., "Discriminatory treatment"]

ARTICLES VIOLATED:
• Article [X]: [Description]
• Article [Y]: [Description]
• [Relevant workplace policies]

RESOLUTION SOUGHT:
1. Make me whole financially: Payment of $[amount] for [lost wages/benefits]
2. [Specific remedy, e.g., "Rescind the disciplinary action"]
3. [Specific remedy, e.g., "Provide the accommodation as requested"]
4. Cease and desist from [future violations]
5. Written apology

SUPPORTING EVIDENCE:
• Collective Agreement Articles [list]
• Documentation: [list what you're providing]
• Witnesses: [names and contact info if applicable]

TIMELINE:
This grievance is being filed within the [X day] timeline required by Article [X]. I request a Step 1 meeting with management within [X days] as per the grievance procedure.

I am available to meet at your convenience to discuss this matter further and prepare for the grievance process.

Solidarity,

[Your Name]
[Signature]
Union Member #[Number]
[Contact Information]

CC: Union Steward, Union President, [Management as required by collective agreement]`
  },
  {
    id: 'acc2',
    category: 'accommodation',
    name: 'Return to Work (Modified Duties)',
    description: 'Propose modified return-to-work plan',
    tone: 'friendly',
    content: `[Date]

[Manager Name]
[Company Name]

Dear [Manager Name],

I hope this message finds you well. I am writing to discuss my return to work with temporary modified duties as I recover from [condition/injury].

My healthcare provider, Dr. [Name], has cleared me to return to work with the following restrictions:
• [Restriction 1, e.g., "No lifting over 10 lbs"]
• [Restriction 2, e.g., "Frequent breaks for movement"]
• [Restriction 3, e.g., "Reduced hours: 4 hours/day initially"]

PROPOSED TIMELINE:
• Weeks 1-2: [4 hours/day, modified duties]
• Weeks 3-4: [6 hours/day, gradual increase]
• Week 5+: [Full duties pending medical clearance]

SUGGESTED MODIFICATIONS:
I believe I can perform my essential duties with these temporary adjustments:
1. [Modification to regular duty]
2. [Alternative task I can perform]
3. [Support needed, e.g., "Assistance with heavy lifting"]

I'm eager to return to work and contribute to the team while ensuring a safe recovery. I'm happy to meet with you and [HR/Occupational Health] to finalize a return-to-work plan.

Please let me know your availability to discuss this week.

Best regards,

[Your Name]
[Contact Info]

Attached: Medical clearance letter from Dr. [Name]`
  },
];

export default function LetterFactory() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('resources.letterFactory.title', 'Letter Factory'));
  useFocusOnRefOnMount(titleRef);

  const [selectedCategory, setSelectedCategory] = React.useState<LetterTemplate['category'] | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = React.useState<LetterTemplate | null>(null);
  const [customContent, setCustomContent] = React.useState('');
  const [tone, setTone] = React.useState<ToneOption>('formal');
  const [showEditor, setShowEditor] = React.useState(false);

  const filteredTemplates = selectedCategory === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === selectedCategory);

  const loadTemplate = (template: LetterTemplate) => {
    setSelectedTemplate(template);
    setCustomContent(template.content);
    setTone(template.tone);
    setShowEditor(true);
  };

  const adjustTone = (newTone: ToneOption) => {
    setTone(newTone);
    if (!customContent) return;

    let adjusted = customContent;
    
    if (newTone === 'friendly') {
      adjusted = adjusted
        .replace(/I am writing to formally/g, "I'm reaching out to")
        .replace(/I respectfully request/g, "I'd appreciate if we could")
        .replace(/Pursuant to/g, "According to")
        .replace(/RE:/g, "Regarding:")
        .replace(/Sincerely,/g, "Best regards,");
    } else if (newTone === 'legal') {
      adjusted = adjusted
        .replace(/I'm reaching out/g, "I am writing to formally")
        .replace(/I'd appreciate/g, "I respectfully request")
        .replace(/Regarding:/g, "RE:")
        .replace(/Best regards,/g, "Respectfully submitted,");
    }
    
    setCustomContent(adjusted);
    Alert.alert('Tone Adjusted', `Letter tone changed to ${newTone}`);
  };

  const shareLetter = async () => {
    try {
      await Share.share({
        message: customContent,
        title: selectedTemplate?.name || 'Letter',
      });
    } catch {}
  };

  const exportPdf = async () => {
    try {
      const Print = await import('expo-print');
      const html = `<html><head><meta charset="utf-8"/><style>body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; } pre { white-space: pre-wrap; font-family: Arial; }</style></head><body><pre>${customContent.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Share.share({ url: uri, title: selectedTemplate?.name || 'Letter' });
    } catch {
      Alert.alert('PDF Export', 'Install expo-print in dev build for PDF export');
    }
  };

  const copyToClipboard = async () => {
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(customContent);
      Alert.alert('Copied', 'Letter copied to clipboard');
    } catch {
      Alert.alert('Clipboard', 'Clipboard not available');
    }
  };

  const getCategoryIcon = (category: LetterTemplate['category']) => {
    switch (category) {
      case 'accommodation': return 'account-heart';
      case 'appeal': return 'gavel';
      case 'complaint': return 'alert-circle';
      case 'request': return 'file-document';
      case 'union': return 'account-group';
      default: return 'file-document-outline';
    }
  };

  const getCategoryColor = (category: LetterTemplate['category']) => {
    switch (category) {
      case 'accommodation': return '#4CAF50';
      case 'appeal': return '#2196F3';
      case 'complaint': return '#F44336';
      case 'request': return '#FF9800';
      case 'union': return '#9C27B0';
      default: return palette.primary;
    }
  };

  if (showEditor && selectedTemplate) {
    return (
      <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
        <Pressable onPress={() => setShowEditor(false)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={palette.text} />
          <Text style={{ color: palette.text, marginLeft: 8, fontSize: 16 }}>Back to Templates</Text>
        </Pressable>

        <Text style={s.title} ref={titleRef} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {selectedTemplate.name}
        </Text>
        <Text style={s.subtitle}>{selectedTemplate.description}</Text>

        <DisclaimerBanner type="legal" compact={true} />

        {/* Tone Adjuster */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🎭 Tone Adjuster</Text>
          <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
            {(['friendly', 'formal', 'legal'] as ToneOption[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => adjustTone(t)}
                style={[s.toneChip, tone === t && { backgroundColor: palette.primary, borderColor: palette.primary }]}
              >
                <Text style={[s.toneChipText, tone === t && { color: palette.onPrimary }]}>
                  {t === 'friendly' ? '😊 Friendly' : t === 'formal' ? '📋 Formal' : '⚖️ Legal Demand'}
                </Text>
              </Pressable>
            ))}
          </GapView>
        </View>

        {/* Editor */}
        <View style={s.card}>
          <Text style={s.cardTitle}>✍️ Edit Your Letter</Text>
          <Text style={{ color: palette.text, opacity: 0.8, fontSize: 12, marginBottom: 8 }}>
            Replace placeholders like [Your Name], [Date], [Manager Name] with your details
          </Text>
          <TextInput
            style={s.editorInput}
            value={customContent}
            onChangeText={setCustomContent}
            multiline
            numberOfLines={20}
            textAlignVertical="top"
          />
        </View>

        {/* Actions */}
        <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
          <Pressable onPress={copyToClipboard} style={s.actionButton}>
            <MaterialCommunityIcons name="content-copy" size={18} color={palette.onPrimary} />
            <Text style={s.actionButtonText}>Copy</Text>
          </Pressable>
          <Pressable onPress={shareLetter} style={s.actionButton}>
            <MaterialCommunityIcons name="share-variant" size={18} color={palette.onPrimary} />
            <Text style={s.actionButtonText}>Share</Text>
          </Pressable>
          <Pressable onPress={exportPdf} style={s.actionButton}>
            <MaterialCommunityIcons name="file-pdf-box" size={18} color={palette.onPrimary} />
            <Text style={s.actionButtonText}>PDF</Text>
          </Pressable>
        </GapView>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title} ref={titleRef} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        ✍️ Letter & Template Factory
      </Text>
      <Text style={s.subtitle}>
        Professional advocacy letter templates with AI tone adjustment. Generate accommodation requests, appeals, complaints, and more.
      </Text>

      <DisclaimerBanner type="legal" compact={true} />

      {/* Category Filter */}
      <View style={s.card}>
        <Text style={s.cardTitle}>📁 Filter by Category</Text>
        <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
          <Pressable
            onPress={() => setSelectedCategory('all')}
            style={[s.categoryChip, selectedCategory === 'all' && { backgroundColor: palette.primary, borderColor: palette.primary }]}
          >
            <Text style={[s.categoryChipText, selectedCategory === 'all' && { color: palette.onPrimary }]}>
              All ({TEMPLATES.length})
            </Text>
          </Pressable>
          {(['accommodation', 'appeal', 'complaint', 'request', 'union'] as LetterTemplate['category'][]).map((cat) => {
            const count = TEMPLATES.filter(t => t.category === cat).length;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  s.categoryChip,
                  selectedCategory === cat && { backgroundColor: getCategoryColor(cat), borderColor: getCategoryColor(cat) }
                ]}
              >
                <MaterialCommunityIcons 
                  name={getCategoryIcon(cat)} 
                  size={16} 
                  color={selectedCategory === cat ? '#fff' : palette.text} 
                />
                <Text style={[s.categoryChipText, selectedCategory === cat && { color: '#fff' }]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
                </Text>
              </Pressable>
            );
          })}
        </GapView>
      </View>

      {/* Template Grid */}
      <Text style={[s.cardTitle, { marginTop: 16, marginBottom: 8 }]}>
        {filteredTemplates.length} Templates Available
      </Text>
      {filteredTemplates.map((template) => (
        <Pressable
          key={template.id}
          onPress={() => loadTemplate(template)}
          style={s.templateCard}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={[s.categoryBadge, { backgroundColor: getCategoryColor(template.category) }]}>
              <MaterialCommunityIcons name={getCategoryIcon(template.category)} size={24} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.templateName}>{template.name}</Text>
              <Text style={s.templateDesc}>{template.description}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <View style={s.toneBadge}>
                  <Text style={s.toneBadgeText}>
                    {template.tone === 'friendly' ? '😊 Friendly' : template.tone === 'formal' ? '📋 Formal' : '⚖️ Legal'}
                  </Text>
                </View>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={palette.muted} />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12, lineHeight: 20 },
    card: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 8 },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.muted,
      backgroundColor: palette.surface,
    },
    categoryChipText: { fontSize: 13, fontWeight: '600', color: palette.text },
    templateCard: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    categoryBadge: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    templateName: { fontSize: 16, fontWeight: '700', color: palette.text },
    templateDesc: { fontSize: 14, color: palette.text, opacity: 0.8, marginTop: 4, lineHeight: 20 },
    toneBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    toneBadgeText: { fontSize: 11, color: palette.text, fontWeight: '600' },
    toneChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.muted,
      backgroundColor: palette.surface,
    },
    toneChipText: { fontSize: 14, fontWeight: '600', color: palette.text },
    editorInput: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
      minHeight: 400,
      fontFamily: 'monospace',
    },
    actionButton: {
      backgroundColor: palette.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    actionButtonText: { color: palette.onPrimary, fontWeight: '700', fontSize: 14 },
  });
}
