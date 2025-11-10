import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { GapView } from '../../components/GapView';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

const studies = [
  // Disabilities - Federal
  {
    id: 'can-disability-survey-2022',
    title: 'Canadian Survey on Disability (CSD) 2022',
    description: 'Statistics Canada\'s national study on disability prevalence, severity, and barriers faced by Canadians aged 15+. Shows 27% of Canadians (8 million) have one or more disabilities.',
    link: 'https://www.statcan.gc.ca/en/survey/household/3251',
    tags: ['Disabilities', 'Federal', 'Statistics Canada', 'National Data']
  },
  {
    id: 'disability-employment-gaps',
    title: 'Labour Force Survey: Disability Employment Gap',
    description: 'Federal analysis showing employment rate for persons with disabilities is 59% vs 80% for those without disabilities. Highlights systemic workplace barriers.',
    link: 'https://www150.statcan.gc.ca/n1/pub/75-006-x/2021001/article/00001-eng.htm',
    tags: ['Disabilities', 'Employment', 'Federal', 'Barriers']
  },
  {
    id: 'ont-disability-outcomes',
    title: 'Ontario Disability Employment Strategy Outcomes',
    description: 'Provincial study measuring effectiveness of employment supports for persons with disabilities in Ontario.',
    link: 'https://www.ontario.ca/page/accessibility-ontarians-disability-act',
    tags: ['Disabilities', 'Ontario', 'Employment', 'Provincial']
  },
  
  // Poverty - Federal & Provincial
  {
    id: 'poverty-disability-intersections',
    title: 'Disability and Poverty: Persistent Barriers in Canada',
    description: 'Research showing persons with disabilities are twice as likely to live in poverty. 1 in 5 (21.2%) Canadians with disabilities live below poverty line.',
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/arc/reference2.html',
    tags: ['Poverty', 'Disabilities', 'Federal', 'Economic Barriers']
  },
  {
    id: 'bc-poverty-disability-rates',
    title: 'BC Poverty Reduction Strategy: Disability Focus',
    description: 'Provincial data showing 41.5% of BC residents on disability assistance live in poverty despite provincial supports.',
    link: 'https://www2.gov.bc.ca/gov/content/governments/about-the-bc-government/poverty-reduction-strategy',
    tags: ['Poverty', 'BC', 'Provincial', 'Disability Benefits']
  },
  {
    id: 'food-insecurity-disability',
    title: 'Food Insecurity Among Canadians with Disabilities',
    description: 'Study showing 1 in 3 Canadian households with disabilities experience food insecurity, 2.5x the national rate.',
    link: 'https://proof.utoronto.ca/food-insecurity/disability/',
    tags: ['Poverty', 'Food Insecurity', 'Federal', 'Health Impacts']
  },
  
  // Addictions
  {
    id: 'substance-use-disability',
    title: 'Substance Use and Disability: National Study',
    description: 'Research on co-occurrence of substance use disorders and disability. Shows 42% higher rates of substance use among persons with disabilities.',
    link: 'https://www.ccsa.ca/disability-and-substance-use',
    tags: ['Addictions', 'Federal', 'Mental Health', 'Disabilities']
  },
  {
    id: 'opioid-crisis-injured-workers',
    title: 'Opioid Prescribing Patterns in WCB Claimants',
    description: 'Study examining opioid dependency rates among injured workers across Canadian compensation systems.',
    link: 'https://www.iwh.on.ca/scientific-reports/opioid-prescribing',
    tags: ['Addictions', 'Injured Workers', 'Opioids', 'WSIB']
  },
  {
    id: 'ont-concurrent-disorders',
    title: 'Concurrent Mental Health and Addiction Disorders in Ontario',
    description: 'Provincial research on prevalence and treatment gaps for concurrent disorders, particularly in disability populations.',
    link: 'https://www.camh.ca/en/science-and-research/research-areas/concurrent-disorders',
    tags: ['Addictions', 'Mental Health', 'Ontario', 'Provincial']
  },
  
  // Disability-born / Congenital Disabilities
  {
    id: 'early-childhood-disability',
    title: 'Early Childhood Disability in Canada',
    description: 'Federal study on prevalence and support needs for children born with disabilities. Examines access to early intervention services.',
    link: 'https://www.canada.ca/en/public-health/services/diseases/developmental-disabilities.html',
    tags: ['Disability-born', 'Federal', 'Children', 'Early Intervention']
  },
  {
    id: 'congenital-disabilities-lifespan',
    title: 'Lifespan Outcomes for Congenital Disabilities',
    description: 'Longitudinal research tracking health, employment, and social outcomes for Canadians with congenital disabilities.',
    link: 'https://www.cihr-irsc.gc.ca/e/193.html',
    tags: ['Disability-born', 'Federal', 'Longitudinal', 'Outcomes']
  },
  {
    id: 'ndis-comparison-study',
    title: 'Disability Supports: Canada vs International Models',
    description: 'Comparative analysis of supports for persons born with disabilities, examining gaps in Canadian system.',
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/arc.html',
    tags: ['Disability-born', 'Federal', 'Policy Comparison', 'International']
  },
  
  // Abuse
  {
    id: 'violence-women-disabilities',
    title: 'Violence Against Women with Disabilities',
    description: 'Federal research showing women with disabilities experience violence at rates 2-5x higher than women without disabilities.',
    link: 'https://www.canada.ca/en/public-health/services/health-promotion/stop-family-violence/publications/women-disabilities-violence.html',
    tags: ['Abuse', 'Disabilities', 'Federal', 'Gender-based Violence']
  },
  {
    id: 'elder-abuse-disability',
    title: 'Elder Abuse and Disability in Canadian Care Settings',
    description: 'Study examining abuse prevalence in long-term care and community settings for older adults with disabilities.',
    link: 'https://www.canada.ca/en/employment-social-development/corporate/seniors/forum/elder-abuse.html',
    tags: ['Abuse', 'Seniors', 'Federal', 'Long-term Care']
  },
  {
    id: 'ont-vulnerable-persons-abuse',
    title: 'Ontario Vulnerable Persons Abuse Prevention Study',
    description: 'Provincial research on financial, physical, and emotional abuse of persons with disabilities.',
    link: 'https://www.ontario.ca/page/prevent-abuse-and-neglect-older-adults',
    tags: ['Abuse', 'Ontario', 'Provincial', 'Vulnerable Persons']
  },
  
  // Homelessness
  {
    id: 'disability-homelessness-federal',
    title: 'Disability and Homelessness: National Study',
    description: 'Federal research showing persons with disabilities represent 45% of Canada\'s homeless population despite being 22% of general population.',
    link: 'https://www.infrastructure.gc.ca/homelessness-sans-abri/index-eng.html',
    tags: ['Homelessness', 'Disabilities', 'Federal', 'Housing']
  },
  {
    id: 'mental-health-homelessness',
    title: 'Mental Health Disabilities and Housing Instability',
    description: 'Study examining pathways between mental health disabilities and homelessness in Canadian cities.',
    link: 'https://www.mentalhealthcommission.ca/english/what-we-do/housing-and-homelessness',
    tags: ['Homelessness', 'Mental Health', 'Federal', 'Housing']
  },
  {
    id: 'bc-homelessness-count',
    title: 'BC Homeless Count: Disability Prevalence',
    description: 'Provincial point-in-time count showing 54% of homeless individuals in BC report having a disability.',
    link: 'https://www2.gov.bc.ca/gov/content/governments/about-the-bc-government/poverty-reduction-strategy/homelessness',
    tags: ['Homelessness', 'BC', 'Provincial', 'Data']
  },
  {
    id: 'ont-housing-waitlist-disability',
    title: 'Ontario Social Housing Waitlist Analysis',
    description: 'Provincial study showing persons with disabilities wait 30% longer for accessible housing, averaging 5-7 years.',
    link: 'https://www.ontario.ca/page/social-housing',
    tags: ['Homelessness', 'Housing', 'Ontario', 'Provincial', 'Waitlists']
  },
  
  
  // Indigenous/Aboriginal Disabilities
  {
    id: 'indigenous-disability-health-survey',
    title: 'First Nations Regional Health Survey: Disability',
    description: 'National study showing Indigenous peoples experience disability at rates 1.5x higher than non-Indigenous Canadians. Examines barriers in on-reserve and urban settings.',
    link: 'https://fnigc.ca/fnrehs/',
    tags: ['Indigenous', 'Aboriginal', 'Federal', 'Health Disparities']
  },
  {
    id: 'jordan-principle-disability',
    title: 'Jordan\'s Principle and Disability Supports',
    description: 'Research on access to disability services for First Nations children, examining jurisdictional barriers and Jordan\'s Principle implementation.',
    link: 'https://www.canada.ca/en/indigenous-services-canada/services/jordans-principle.html',
    tags: ['Indigenous', 'Children', 'Disability-born', 'Federal']
  },
  {
    id: 'inuit-disability-nunavut',
    title: 'Disability and Accessibility in Inuit Communities',
    description: 'Territorial study on disability prevalence, service access barriers, and cultural approaches to disability in Nunavut Inuit communities.',
    link: 'https://www.gov.nu.ca/health',
    tags: ['Indigenous', 'Inuit', 'Nunavut', 'Accessibility']
  },
  {
    id: 'metis-disability-outcomes',
    title: 'Métis Nation Health and Disability Study',
    description: 'Multi-provincial research on disability rates, chronic conditions, and healthcare access among Métis populations.',
    link: 'https://www.metisnation.ca/health',
    tags: ['Indigenous', 'Métis', 'Federal', 'Healthcare Access']
  },
  {
    id: 'indigenous-residential-schools-disability',
    title: 'Intergenerational Trauma and Disability',
    description: 'Study linking residential school trauma to higher disability rates in Indigenous communities, including PTSD, addiction, and chronic illness.',
    link: 'https://www.rcaanc-cirnac.gc.ca/eng/1450124405592/1529106060525',
    tags: ['Indigenous', 'Trauma', 'Mental Health', 'Federal']
  },
  
  // Visual Disabilities
  {
    id: 'vision-loss-canada-study',
    title: 'Vision Loss and Blindness in Canada',
    description: 'National epidemiological study showing 1.5 million Canadians have vision loss. Examines employment barriers and assistive technology gaps.',
    link: 'https://www.nib.ca/research',
    tags: ['Visual Disability', 'Blindness', 'Federal', 'Accessibility']
  },
  {
    id: 'low-vision-workplace-barriers',
    title: 'Low Vision Employment Barriers Study',
    description: 'Research on accommodation needs and workplace barriers for persons with partial sight and low vision.',
    link: 'https://www.cnib.ca/en/research',
    tags: ['Visual Disability', 'Employment', 'Accommodations', 'Federal']
  },
  
  // Hearing/Deaf Disabilities
  {
    id: 'deaf-employment-canada',
    title: 'Deaf and Hard of Hearing Employment Study',
    description: 'Federal research showing unemployment rate for Deaf Canadians is 2.5x national average. Examines communication barriers and discrimination.',
    link: 'https://www.cad.ca/research',
    tags: ['Deaf', 'Hard of Hearing', 'Employment', 'Federal']
  },
  {
    id: 'asl-access-healthcare',
    title: 'ASL/LSQ Access in Healthcare Settings',
    description: 'Study on interpreter access barriers for Deaf patients in hospitals, clinics, and disability assessment processes.',
    link: 'https://www.casli.ca/research',
    tags: ['Deaf', 'Healthcare', 'ASL', 'Access Barriers']
  },
  
  // Mobility/Physical Disabilities
  {
    id: 'spinal-cord-injury-outcomes',
    title: 'Spinal Cord Injury Canada: Long-term Outcomes',
    description: 'Longitudinal study tracking employment, housing, and health outcomes for Canadians with spinal cord injuries.',
    link: 'https://sci-can.ca/research/',
    tags: ['Mobility', 'Physical Disability', 'Federal', 'Outcomes']
  },
  {
    id: 'cerebral-palsy-lifespan',
    title: 'Cerebral Palsy: Lifespan Health and Participation',
    description: 'Research on aging with CP, examining secondary conditions, pain management, and accessibility barriers.',
    link: 'https://www.cpresearch.ca',
    tags: ['Mobility', 'Cerebral Palsy', 'Federal', 'Aging']
  },
  {
    id: 'ms-workplace-accommodation',
    title: 'Multiple Sclerosis: Workplace Accommodation Study',
    description: 'Analysis of MS-specific accommodation needs, fatigue management, and employment retention strategies.',
    link: 'https://mssociety.ca/research',
    tags: ['Mobility', 'MS', 'Accommodations', 'Employment']
  },
  
  // Cognitive/Intellectual Disabilities
  {
    id: 'intellectual-disability-employment',
    title: 'Employment Outcomes for Intellectual Disabilities',
    description: 'Federal study on supported employment, job coaching, and inclusive hiring practices for persons with intellectual disabilities.',
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/research.html',
    tags: ['Cognitive', 'Intellectual Disability', 'Employment', 'Federal']
  },
  {
    id: 'autism-adults-canada',
    title: 'Autism in Adulthood: Canadian Study',
    description: 'Research on transition challenges, underemployment, and mental health outcomes for autistic adults in Canada.',
    link: 'https://www.autismcanada.org/research/',
    tags: ['Autism', 'Cognitive', 'Federal', 'Adults']
  },
  {
    id: 'brain-injury-recovery',
    title: 'Acquired Brain Injury: Recovery and Rehabilitation',
    description: 'Multi-site study on ABI rehabilitation outcomes, cognitive supports, and return-to-work success rates.',
    link: 'https://www.braininjurycanada.ca/research/',
    tags: ['Brain Injury', 'Cognitive', 'Rehabilitation', 'Federal']
  },
  
  // Invisible/Episodic Disabilities
  {
    id: 'fibromyalgia-disability-recognition',
    title: 'Fibromyalgia and Disability Claim Outcomes',
    description: 'Study on validation barriers for fibromyalgia in disability systems, examining denial rates and appeal strategies.',
    link: 'https://www.fmaware.org/research',
    tags: ['Invisible Disability', 'Chronic Pain', 'Federal', 'Claims']
  },
  {
    id: 'me-cfs-canada-study',
    title: 'ME/CFS (Chronic Fatigue) in Canada',
    description: 'Research on prevalence, medical validation barriers, and disability benefit access for persons with ME/CFS.',
    link: 'https://meaction.net/canada/',
    tags: ['Invisible Disability', 'ME/CFS', 'Federal', 'Medical']
  },
  {
    id: 'epilepsy-workplace-disclosure',
    title: 'Epilepsy: Workplace Disclosure and Stigma',
    description: 'Study examining employment discrimination and accommodation needs for persons with epilepsy.',
    link: 'https://epilepsy.ca/research',
    tags: ['Episodic Disability', 'Epilepsy', 'Employment', 'Stigma']
  },
  
  // Psychosocial Disabilities
  {
    id: 'schizophrenia-employment-barriers',
    title: 'Schizophrenia and Employment Participation',
    description: 'Research on supported employment models and workplace integration for persons with schizophrenia.',
    link: 'https://www.schizophrenia.ca/research',
    tags: ['Psychosocial', 'Mental Health', 'Employment', 'Federal']
  },
  {
    id: 'bipolar-disability-benefits',
    title: 'Bipolar Disorder: Disability Benefit Access',
    description: 'Study on episodic disability recognition in CPP-D and provincial systems for persons with bipolar disorder.',
    link: 'https://www.mdsc.ca/research/',
    tags: ['Psychosocial', 'Bipolar', 'Benefits', 'Federal']
  },
  
  // Original Studies
  {
    id: 'wsib-cptsd',
    title: 'CPTSD in Injured Workers',
    description: 'Research on Complex Post-Traumatic Stress Disorder prevalence and impacts in workplace injury cases.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/topics/workplace-ptsd',
    tags: ['Mental Health', 'WSIB', 'Trauma']
  },
  {
    id: 'rtw-barriers',
    title: 'Return-to-Work Barriers Study',
    description: 'Comprehensive study on systemic barriers preventing successful return-to-work outcomes for injured workers.',
    link: 'https://www.iwh.on.ca/scientific-reports',
    tags: ['Return to Work', 'Barriers', 'Policy']
  },
  {
    id: 'chronic-pain',
    title: 'Chronic Pain in Disability Claims',
    description: 'Evidence-based research on chronic pain management and its recognition in disability benefit adjudication.',
    link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/chronic-pain-disability',
    tags: ['Chronic Pain', 'Benefits', 'Medical']
  }
];

export default function StudiesScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = styles(palette, factor);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Studies</Text>
      <Text style={s.intro}>Clinical and workplace research studies on disability, injury, and return-to-work outcomes.</Text>
      
      <GapView gap={16} style={{ marginTop: 16 }}>
        {studies.map(study => (
          <View key={study.id} style={s.card}>
            <Text style={s.studyTitle}>{study.title}</Text>
            <Text style={s.studyDesc}>{study.description}</Text>
            <GapView gap={6} style={s.tagRow}>
              {study.tags.map(tag => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagText}>{tag}</Text>
                </View>
              ))}
            </GapView>
            <A11yPressable
              accessibilityRole="link"
              accessibilityLabel={`Open ${study.title}`}
              onPress={() => Linking.openURL(study.link).catch(() => {})}
              style={s.linkButton}
              hitSlop={HIT_SLOP_8}
            >
              <Text style={s.linkText}>Read Study →</Text>
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
    studyTitle: { fontSize: Math.round(18 * factor), fontWeight: '600', color: palette.text, marginBottom: 8 },
    studyDesc: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85, lineHeight: 20, marginBottom: 12 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
    tag: { backgroundColor: palette.card, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    tagText: { fontSize: 11, color: palette.text, opacity: 0.8, fontWeight: '600' },
    linkButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, backgroundColor: palette.primary, borderRadius: 8 },
    linkText: { color: palette.onPrimary, fontWeight: '700', fontSize: Math.round(14 * factor) },
  });
}
