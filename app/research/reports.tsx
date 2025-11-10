import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { GapView } from '../../components/GapView';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

const reports = [
  // Disabilities - Federal
  {
    id: 'disability-canada-2024',
    title: 'Canadian Survey on Disability 2024',
    description: 'Statistics Canada\'s comprehensive report on disability prevalence, barriers, and supports across Canada.',
    link: 'https://www.statcan.gc.ca/disability-survey',
    source: 'Statistics Canada',
    year: '2024',
    tags: ['Disabilities', 'National', 'Federal']
  },
  {
    id: 'accessibility-progress-2024',
    title: 'Accessible Canada Act Progress Report',
    description: 'Federal government report on progress implementing the Accessible Canada Act and removing barriers.',
    link: 'https://www.canada.ca/en/employment-social-development/programs/accessible-canada.html',
    source: 'ESDC Canada',
    year: '2024',
    tags: ['Disabilities', 'Accessibility', 'Federal']
  },
  {
    id: 'aoda-annual-2024',
    title: 'AODA Annual Report 2024',
    description: 'Ontario\'s Accessibility for Ontarians with Disabilities Act compliance report. Tracks provincial accessibility standards implementation.',
    link: 'https://www.ontario.ca/page/accessibility-laws',
    source: 'Ontario Government',
    year: '2024',
    tags: ['Disabilities', 'Ontario', 'Provincial']
  },
  {
    id: 'bc-accessibility-plan',
    title: 'BC Accessibility Strategy 2024',
    description: 'Provincial plan to make BC the most progressive province for accessibility by 2030.',
    link: 'https://www2.gov.bc.ca/gov/content/governments/about-the-bc-government/accessibility',
    source: 'BC Government',
    year: '2024',
    tags: ['Disabilities', 'BC', 'Provincial']
  },
  
  // Poverty - Federal & Provincial
  {
    id: 'poverty-disability-2024',
    title: 'Disability and Poverty in Canada',
    description: 'Community report examining the intersection of disability and poverty, with policy recommendations. Shows 21% poverty rate vs 10% national average.',
    link: 'https://cwp-csp.ca/poverty-and-human-rights/poverty-in-canada',
    source: 'Canada Without Poverty',
    year: '2024',
    tags: ['Poverty', 'Disabilities', 'Federal']
  },
  {
    id: 'poverty-reduction-federal-2024',
    title: 'Canada Poverty Reduction Strategy Annual Report',
    description: 'Federal report tracking poverty reduction targets, including specific measures for persons with disabilities.',
    link: 'https://www.canada.ca/en/employment-social-development/programs/poverty-reduction.html',
    source: 'ESDC Canada',
    year: '2024',
    tags: ['Poverty', 'Federal', 'Strategy']
  },
  {
    id: 'ont-odsp-rates-report',
    title: 'Ontario ODSP Adequacy Report',
    description: 'Independent analysis showing ODSP rates are 45% below poverty line, calling for immediate rate increases.',
    link: 'https://www.ontario.ca/page/ontario-disability-support-program-income-support',
    source: 'Income Security Advocacy',
    year: '2024',
    tags: ['Poverty', 'Ontario', 'ODSP', 'Provincial']
  },
  {
    id: 'que-social-assistance-review',
    title: 'Quebec Social Assistance Review',
    description: 'Provincial review of social assistance adequacy for persons with disabilities in Quebec.',
    link: 'https://www.quebec.ca/en/employment/financial-assistance',
    source: 'Quebec Government',
    year: '2023',
    tags: ['Poverty', 'Quebec', 'Provincial']
  },
  
  // Addictions
  {
    id: 'ccsa-substance-use-2024',
    title: 'Canadian Substance Use Costs and Harms Report',
    description: 'National report examining substance use impacts, including specific analysis of disability populations.',
    link: 'https://www.ccsa.ca/canadian-substance-use-costs-and-harms',
    source: 'CCSA',
    year: '2024',
    tags: ['Addictions', 'Federal', 'Health Costs']
  },
  {
    id: 'opioid-crisis-canada-2024',
    title: 'Opioid Crisis: Annual Report',
    description: 'Federal surveillance data on opioid-related deaths and harms. Highlights disabled and injured worker populations.',
    link: 'https://health-infobase.canada.ca/substance-related-harms/opioids-stimulants',
    source: 'PHAC Canada',
    year: '2024',
    tags: ['Addictions', 'Opioids', 'Federal']
  },
  {
    id: 'ont-mental-health-addictions',
    title: 'Ontario Mental Health and Addictions Strategy',
    description: 'Provincial roadmap for improving concurrent mental health and addiction treatment services.',
    link: 'https://www.ontario.ca/page/roadmap-wellness-mental-health-and-addictions-strategy',
    source: 'Ontario Health',
    year: '2023',
    tags: ['Addictions', 'Mental Health', 'Ontario', 'Provincial']
  },
  
  // Abuse
  {
    id: 'family-violence-disability-2024',
    title: 'Family Violence and Disability Report',
    description: 'Federal report documenting violence rates against persons with disabilities. Shows 2-5x higher victimization rates.',
    link: 'https://www.canada.ca/en/public-health/services/health-promotion/stop-family-violence.html',
    source: 'PHAC Canada',
    year: '2024',
    tags: ['Abuse', 'Disabilities', 'Federal']
  },
  {
    id: 'elder-abuse-report-2023',
    title: 'Elder Abuse in Canada: National Report',
    description: 'Comprehensive federal report on elder abuse, with focus on older adults with disabilities in institutional settings.',
    link: 'https://www.canada.ca/en/employment-social-development/corporate/seniors/forum/elder-abuse.html',
    source: 'ESDC Canada',
    year: '2023',
    tags: ['Abuse', 'Seniors', 'Federal']
  },
  {
    id: 'ont-vulnerable-persons-2024',
    title: 'Ontario Vulnerable Persons Protection Report',
    description: 'Provincial report on financial, physical, and systemic abuse of vulnerable persons with disabilities.',
    link: 'https://www.ontario.ca/page/reporting-abuse-and-neglect',
    source: 'Ontario Government',
    year: '2024',
    tags: ['Abuse', 'Ontario', 'Provincial']
  },
  
  // Homelessness
  {
    id: 'homelessness-federal-strategy-2024',
    title: 'Reaching Home: Canada\'s Homelessness Strategy',
    description: 'Federal homelessness prevention report showing persons with disabilities comprise 45% of homeless population.',
    link: 'https://www.infrastructure.gc.ca/homelessness-sans-abri/index-eng.html',
    source: 'Infrastructure Canada',
    year: '2024',
    tags: ['Homelessness', 'Federal', 'Housing']
  },
  {
    id: 'ont-homelessness-counts-2023',
    title: 'Ontario Point-in-Time Homeless Counts',
    description: 'Provincial homeless count data showing disability prevalence, mental health needs, and service gaps.',
    link: 'https://www.ontario.ca/page/homelessness-ontario',
    source: 'Ontario Government',
    year: '2023',
    tags: ['Homelessness', 'Ontario', 'Provincial']
  },
  {
    id: 'bc-housing-report-2024',
    title: 'BC Housing Affordability and Homelessness Report',
    description: 'Provincial analysis showing 54% of homeless individuals in BC have disabilities, with average 5-7 year housing waitlists.',
    link: 'https://www.bchousing.org/research-centre',
    source: 'BC Housing',
    year: '2024',
    tags: ['Homelessness', 'Housing', 'BC', 'Provincial']
  },
  
  // Disability-born / Congenital
  {
    id: 'early-intervention-report-2024',
    title: 'Early Childhood Intervention Services in Canada',
    description: 'Federal review of early intervention services for children born with disabilities, identifying access gaps.',
    link: 'https://www.canada.ca/en/public-health/services/diseases/developmental-disabilities.html',
    source: 'PHAC Canada',
    year: '2024',
    tags: ['Disability-born', 'Federal', 'Children']
  },
  {
    id: 'ont-special-needs-strategy',
    title: 'Ontario Special Needs Strategy',
    description: 'Provincial framework for supporting children and youth with developmental disabilities.',
    link: 'https://www.ontario.ca/page/ontario-autism-program',
    source: 'Ontario MCCSS',
    year: '2024',
    tags: ['Disability-born', 'Ontario', 'Provincial']
  },
  
  // Indigenous/Aboriginal Disabilities
  {
    id: 'indigenous-disability-federal-2024',
    title: 'Indigenous Peoples and Disability in Canada',
    description: 'Federal report showing Indigenous peoples experience disability at 1.5x national rate. Examines systemic barriers, jurisdictional gaps, and cultural approaches.',
    link: 'https://www.sac-isc.gc.ca/eng/1602010609492/1602010631711',
    source: 'ISC Canada',
    year: '2024',
    tags: ['Indigenous', 'Aboriginal', 'Federal']
  },
  {
    id: 'first-nations-disability-services',
    title: 'First Nations Disability Services Report',
    description: 'Analysis of on-reserve disability supports, Jordan\'s Principle implementation, and service delivery gaps.',
    link: 'https://fnigc.ca/research-reports/',
    source: 'FNIGC',
    year: '2024',
    tags: ['Indigenous', 'First Nations', 'Federal']
  },
  {
    id: 'inuit-accessibility-strategy',
    title: 'Inuit Nunangat Accessibility Strategy',
    description: 'Regional report on disability and accessibility in Inuit territories, addressing northern barriers and cultural inclusion.',
    link: 'https://www.itk.ca/disability-accessibility/',
    source: 'ITK',
    year: '2023',
    tags: ['Indigenous', 'Inuit', 'Territorial']
  },
  {
    id: 'metis-health-disability-report',
    title: 'Métis Nation Disability and Health Report',
    description: 'Multi-provincial analysis of disability prevalence, healthcare access, and support needs in Métis communities.',
    link: 'https://www.metisnation.ca/publications',
    source: 'Métis National Council',
    year: '2024',
    tags: ['Indigenous', 'Métis', 'Federal']
  },
  
  // Visual Disabilities
  {
    id: 'vision-loss-report-2024',
    title: 'Vision Loss and Blindness: National Report',
    description: 'Federal report on 1.5 million Canadians with vision loss. Details employment barriers, technology access, and CNIB service gaps.',
    link: 'https://www.nib.ca/reports',
    source: 'National Institute for the Blind',
    year: '2024',
    tags: ['Visual Disability', 'Blindness', 'Federal']
  },
  
  // Hearing/Deaf Disabilities
  {
    id: 'deaf-community-rights-report',
    title: 'Deaf Community Rights and Recognition',
    description: 'Advocacy report calling for official recognition of ASL/LSQ, interpreter access, and ending Deaf unemployment crisis.',
    link: 'https://www.cad.ca/advocacy-reports/',
    source: 'CAD',
    year: '2024',
    tags: ['Deaf', 'Hard of Hearing', 'Federal']
  },
  
  // Mobility/Physical Disabilities
  {
    id: 'spinal-cord-injury-report',
    title: 'Spinal Cord Injury Canada: Annual Report',
    description: 'National report on SCI prevalence, rehabilitation access, attendant care shortages, and employment outcomes.',
    link: 'https://sci-can.ca/annual-reports/',
    source: 'SCI Canada',
    year: '2024',
    tags: ['Mobility', 'Physical Disability', 'Federal']
  },
  {
    id: 'ms-canada-report',
    title: 'Multiple Sclerosis: Impact and Needs',
    description: 'Report on 90,000+ Canadians living with MS, examining disability progression, treatment access, and financial strain.',
    link: 'https://mssociety.ca/reports',
    source: 'MS Society Canada',
    year: '2024',
    tags: ['Mobility', 'MS', 'Federal']
  },
  
  // Cognitive/Intellectual Disabilities
  {
    id: 'intellectual-disability-inclusion',
    title: 'Inclusion Canada: State of the Nation',
    description: 'Federal report on employment, housing, and social inclusion for persons with intellectual disabilities.',
    link: 'https://inclusioncanada.ca/resources/',
    source: 'Inclusion Canada',
    year: '2024',
    tags: ['Cognitive', 'Intellectual Disability', 'Federal']
  },
  {
    id: 'autism-adults-canada-report',
    title: 'Autism in Adulthood: Canada Report',
    description: 'National analysis showing 80% underemployment rate for autistic adults, calling for policy reform.',
    link: 'https://www.autismcanada.org/reports/',
    source: 'Autism Canada',
    year: '2024',
    tags: ['Autism', 'Cognitive', 'Federal']
  },
  {
    id: 'brain-injury-report',
    title: 'Acquired Brain Injury: National Strategy',
    description: 'Federal report calling for coordinated ABI supports, rehabilitation standards, and long-term care access.',
    link: 'https://www.braininjurycanada.ca/reports/',
    source: 'Brain Injury Canada',
    year: '2023',
    tags: ['Brain Injury', 'Cognitive', 'Federal']
  },
  
  // Invisible/Episodic Disabilities
  {
    id: 'invisible-disabilities-recognition',
    title: 'Invisible Disabilities: Validation Crisis',
    description: 'Advocacy report on systemic barriers for persons with fibromyalgia, ME/CFS, chronic pain, and other invisible disabilities.',
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/invisible.html',
    source: 'Disability Alliance',
    year: '2024',
    tags: ['Invisible Disability', 'Federal', 'Advocacy']
  },
  {
    id: 'episodic-disabilities-policy',
    title: 'Episodic Disabilities: Policy Framework',
    description: 'Federal policy recommendations for accommodating episodic conditions like MS, epilepsy, Crohn\'s, and mental health disabilities.',
    link: 'https://www.canada.ca/en/public-health/services/chronic-diseases/episodic-disability.html',
    source: 'PHAC Canada',
    year: '2023',
    tags: ['Episodic Disability', 'Federal', 'Policy']
  },
  
  // Psychosocial Disabilities
  {
    id: 'psychosocial-disability-rights',
    title: 'Psychosocial Disability Rights in Canada',
    description: 'Report examining discrimination, forced treatment, and rights violations for persons with mental health disabilities.',
    link: 'https://www.ohrc.on.ca/en/policy-preventing-discrimination-based-mental-health-disabilities-and-addictions',
    source: 'OHRC',
    year: '2024',
    tags: ['Psychosocial', 'Mental Health', 'Rights']
  },
  
  // Original Reports
  {
    id: 'wsib-annual-2023',
    title: 'WSIB Annual Report 2023',
    description: 'Workplace Safety and Insurance Board annual statistics on workplace injuries, claims, and return-to-work outcomes.',
    link: 'https://www.wsib.ca/en/annualreport',
    source: 'WSIB Ontario',
    year: '2023',
    tags: ['Workplace', 'Ontario', 'Statistics']
  },
  {
    id: 'mental-health-work-2023',
    title: 'Mental Health in the Workplace',
    description: 'Report on mental health accommodations, stigma, and workplace supports across Canadian industries.',
    link: 'https://www.mentalhealthcommission.ca/english/what-we-do/workplace',
    source: 'Mental Health Commission',
    year: '2023',
    tags: ['Mental Health', 'Workplace', 'Federal']
  },
  {
    id: 'uncrpd-canada-review',
    title: 'UN CRPD Canada Review 2023',
    description: 'United Nations review of Canada\'s implementation of the Convention on the Rights of Persons with Disabilities.',
    link: 'https://www.ohchr.org/EN/HRBodies/CRPD/Pages/CountryReports.aspx',
    source: 'UN Human Rights',
    year: '2023',
    tags: ['International', 'Rights', 'Federal']
  }
];

export default function ReportsScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = styles(palette, factor);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Reports</Text>
      <Text style={s.intro}>Community and government reports on disability, workplace safety, and social policy.</Text>
      
      <GapView gap={16} style={{ marginTop: 16 }}>
        {reports.map(report => (
          <View key={report.id} style={s.card}>
            <Text style={s.reportTitle}>{report.title}</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={s.meta}>{report.source} • {report.year}</Text>
            </View>
            <Text style={s.reportDesc}>{report.description}</Text>
            <GapView gap={6} style={s.tagRow}>
              {report.tags.map(tag => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagText}>{tag}</Text>
                </View>
              ))}
            </GapView>
            <A11yPressable
              accessibilityRole="link"
              accessibilityLabel={`Open ${report.title}`}
              onPress={() => Linking.openURL(report.link).catch(() => {})}
              style={s.linkButton}
              hitSlop={HIT_SLOP_8}
            >
              <Text style={s.linkText}>View Report →</Text>
            </A11yPressable>
          </View>
        ))}
      </GapView>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 20 },
    title: { fontSize: Math.round(24 * factor), fontWeight:'700', color: palette.text, marginBottom: 12 },
    intro: { fontSize: Math.round(16 * factor), color: palette.text, opacity: 0.85, lineHeight: 22, marginBottom: 8 },
    card: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, padding: 16, borderRadius: 12 },
    reportTitle: { fontSize: Math.round(18 * factor), fontWeight: '600', color: palette.text, marginBottom: 6 },
    meta: { fontSize: Math.round(13 * factor), color: palette.text, opacity: 0.7, fontWeight: '500' },
    reportDesc: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85, lineHeight: 20, marginBottom: 12 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
    tag: { backgroundColor: palette.card, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    tagText: { fontSize: 11, color: palette.text, opacity: 0.8, fontWeight: '600' },
    linkButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, backgroundColor: palette.primary, borderRadius: 8 },
    linkText: { color: palette.onPrimary, fontWeight: '700', fontSize: Math.round(14 * factor) },
  });
}
