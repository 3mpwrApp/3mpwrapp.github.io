import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { GapView } from '../../components/GapView';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

const articles = [
  // Disabilities - Rights & Advocacy
  {
    id: 'know-your-rights',
    title: 'Know Your Rights as a Disabled Worker',
    description: 'Comprehensive guide to workplace rights, accommodations, and legal protections under Canadian human rights law.',
    link: 'https://www.chrc-ccdp.gc.ca/en/resources/duty-accommodate',
    category: 'Disabilities',
    readTime: '8 min read'
  },
  {
    id: 'uncrpd-explained',
    title: 'The UN CRPD and Your Rights',
    description: 'Understanding the UN Convention on the Rights of Persons with Disabilities and how it applies in Canada.',
    link: 'https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-rights-persons-disabilities',
    category: 'Disabilities',
    readTime: '11 min read'
  },
  {
    id: 'accommodations-work',
    title: 'Effective Workplace Accommodations',
    description: 'Real-world examples of workplace accommodations, how to request them, and your employer\'s duties.',
    link: 'https://www.canada.ca/en/employment-social-development/services/disability/accommodations.html',
    category: 'Disabilities',
    readTime: '10 min read'
  },
  {
    id: 'disability-tax-credit-guide',
    title: 'Disability Tax Credit: Complete Guide',
    description: 'How to qualify, apply, and maximize the Disability Tax Credit and retroactive claims.',
    link: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit.html',
    category: 'Disabilities',
    readTime: '12 min read'
  },
  
  // Poverty
  {
    id: 'navigating-odsp',
    title: 'Navigating ODSP: Survivor\'s Guide',
    description: 'Practical guide to Ontario Disability Support Program eligibility, application process, and appeals.',
    link: 'https://www.ontario.ca/page/ontario-disability-support-program-income-support',
    category: 'Poverty',
    readTime: '15 min read'
  },
  {
    id: 'poverty-disability-intersections',
    title: 'Breaking the Disability-Poverty Cycle',
    description: 'Analysis of systemic factors trapping persons with disabilities in poverty and pathways to change.',
    link: 'https://cwp-csp.ca/poverty-and-human-rights',
    category: 'Poverty',
    readTime: '9 min read'
  },
  {
    id: 'cpp-disability-benefits',
    title: 'CPP Disability Benefits: What You Need to Know',
    description: 'Eligibility criteria, application tips, and common denial reasons for Canada Pension Plan Disability.',
    link: 'https://www.canada.ca/en/services/benefits/publicpensions/cpp/cpp-disability-benefit.html',
    category: 'Poverty',
    readTime: '13 min read'
  },
  {
    id: 'food-bank-reality',
    title: 'The Food Bank Reality for Disabled Canadians',
    description: 'Investigation into food insecurity rates and lived experiences of persons with disabilities relying on food banks.',
    link: 'https://foodbankscanada.ca/poverty-and-disability',
    category: 'Poverty',
    readTime: '8 min read'
  },
  
  // Addictions
  {
    id: 'substance-use-disability',
    title: 'Substance Use, Disability, and Stigma',
    description: 'Understanding the connection between disability, chronic pain, and substance use disorders.',
    link: 'https://www.ccsa.ca/disability-and-substance-use-stigma',
    category: 'Addictions',
    readTime: '10 min read'
  },
  {
    id: 'opioid-crisis-injured-workers',
    title: 'Opioid Crisis: The Injured Worker Story',
    description: 'How workplace injury pain management contributes to opioid dependency and what needs to change.',
    link: 'https://www.iwh.on.ca/articles/opioid-prescribing-injured-workers',
    category: 'Addictions',
    readTime: '12 min read'
  },
  {
    id: 'harm-reduction-disability',
    title: 'Harm Reduction and Disability Justice',
    description: 'Why harm reduction approaches are essential for persons with disabilities and concurrent disorders.',
    link: 'https://www.camh.ca/en/health-info/guides-and-publications/harm-reduction',
    category: 'Addictions',
    readTime: '9 min read'
  },
  {
    id: 'recovery-accessibility',
    title: 'Making Addiction Recovery Accessible',
    description: 'Barriers persons with disabilities face in accessing addiction treatment and recovery supports.',
    link: 'https://www.canada.ca/en/health-canada/services/substance-use/problematic-prescription-drug-use.html',
    category: 'Addictions',
    readTime: '11 min read'
  },
  
  // Abuse
  {
    id: 'recognizing-disability-abuse',
    title: 'Recognizing Abuse of Persons with Disabilities',
    description: 'Types of abuse, warning signs, and how to report abuse in institutional and community settings.',
    link: 'https://www.canada.ca/en/public-health/services/health-promotion/stop-family-violence/prevention-resource-centre/women/women-disabilities-violence-fact-sheet.html',
    category: 'Abuse',
    readTime: '10 min read'
  },
  {
    id: 'financial-abuse-disability',
    title: 'Financial Abuse and Exploitation',
    description: 'How to identify financial abuse targeting persons with disabilities and steps to protect yourself.',
    link: 'https://www.canada.ca/en/financial-consumer-agency/services/vulnerable-persons.html',
    category: 'Abuse',
    readTime: '8 min read'
  },
  {
    id: 'institutional-abuse-advocacy',
    title: 'Fighting Institutional Abuse',
    description: 'Advocacy strategies for addressing systemic abuse in care homes, hospitals, and disability services.',
    link: 'https://www.ontario.ca/page/long-term-care-homes-residents-bill-rights',
    category: 'Abuse',
    readTime: '14 min read'
  },
  {
    id: 'domestic-violence-disability',
    title: 'Domestic Violence and Disability',
    description: 'Resources and safety planning for disabled individuals experiencing intimate partner violence.',
    link: 'https://endingviolence.org/disability-and-violence',
    category: 'Abuse',
    readTime: '9 min read'
  },
  
  // Homelessness
  {
    id: 'disability-homelessness-crisis',
    title: 'The Disability-Homelessness Crisis',
    description: 'Why persons with disabilities are overrepresented in homeless populations and what needs to change.',
    link: 'https://www.homelesshub.ca/about-homelessness/topics/disability',
    category: 'Homelessness',
    readTime: '10 min read'
  },
  {
    id: 'navigating-housing-waitlists',
    title: 'Surviving Housing Waitlists',
    description: 'Practical guide to navigating 5-7 year social housing waitlists while homeless or precariously housed.',
    link: 'https://www.cmhc-schl.gc.ca/en/consumers/housing-accessibility',
    category: 'Homelessness',
    readTime: '12 min read'
  },
  {
    id: 'mental-health-housing-first',
    title: 'Housing First and Mental Health Disabilities',
    description: 'How Housing First programs serve persons with mental health disabilities and addiction.',
    link: 'https://www.mentalhealthcommission.ca/english/what-we-do/housing-and-homelessness',
    category: 'Homelessness',
    readTime: '11 min read'
  },
  {
    id: 'accessible-housing-shortage',
    title: 'The Accessible Housing Crisis',
    description: 'Investigation into Canada\'s shortage of accessible, affordable housing and its impact on disabled persons.',
    link: 'https://www.cmhc-schl.gc.ca/en/developing-and-renovating/accessible-adaptable-housing',
    category: 'Homelessness',
    readTime: '13 min read'
  },
  
  // Disability-born / Congenital
  {
    id: 'growing-up-disabled-canada',
    title: 'Growing Up Disabled in Canada',
    description: 'First-person narratives of Canadians born with disabilities navigating education, healthcare, and independence.',
    link: 'https://www.canada.ca/en/public-health/services/diseases/developmental-disabilities.html',
    category: 'Disability-born',
    readTime: '10 min read'
  },
  {
    id: 'transition-to-adulthood',
    title: 'The Transition Cliff: Turning 18 with Disabilities',
    description: 'Navigating the loss of pediatric services and transition to adult systems for youth with congenital disabilities.',
    link: 'https://www.cihr-irsc.gc.ca/e/193.html',
    category: 'Disability-born',
    readTime: '11 min read'
  },
  {
    id: 'rdsp-planning-guide',
    title: 'Registered Disability Savings Plan (RDSP) Guide',
    description: 'Complete guide to RDSPs, grants, bonds, and long-term financial planning for persons with disabilities.',
    link: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-disability-savings-plan-rdsp.html',
    category: 'Disability-born',
    readTime: '14 min read'
  },
  
  // Indigenous/Aboriginal Disabilities
  {
    id: 'indigenous-disability-advocacy',
    title: 'Indigenous Disability Advocacy and Self-Determination',
    description: 'Guide to navigating disability systems as Indigenous person, including Jordan\'s Principle, cultural accommodations, and Two-Spirit perspectives.',
    link: 'https://www.sac-isc.gc.ca/eng/1602010609492/1602010631711',
    category: 'Indigenous',
    readTime: '12 min read'
  },
  {
    id: 'first-nations-disability-services',
    title: 'Accessing Disability Services on Reserve',
    description: 'Practical guide to on-reserve disability supports, jurisdictional issues, and how to leverage Jordan\'s Principle.',
    link: 'https://fnigc.ca/resources/',
    category: 'Indigenous',
    readTime: '10 min read'
  },
  {
    id: 'inuit-disability-northern-barriers',
    title: 'Disability in Inuit Communities: Unique Barriers',
    description: 'Understanding northern accessibility challenges, medical travel, and culturally-appropriate disability supports in Inuit Nunangat.',
    link: 'https://www.itk.ca/disability/',
    category: 'Indigenous',
    readTime: '11 min read'
  },
  {
    id: 'metis-disability-rights',
    title: 'Métis Disability Rights and Recognition',
    description: 'How Métis citizens can access federal and provincial disability supports, plus Métis Nation-specific programs.',
    link: 'https://www.metisnation.ca/health-disability',
    category: 'Indigenous',
    readTime: '9 min read'
  },
  {
    id: 'indigenous-traditional-healing',
    title: 'Traditional Healing and Western Disability Systems',
    description: 'Integrating Indigenous wellness approaches with conventional disability supports and medical evidence.',
    link: 'https://www.ccnsa-nccah.ca/traditional-healing',
    category: 'Indigenous',
    readTime: '13 min read'
  },
  
  // Visual Disabilities
  {
    id: 'navigating-vision-loss',
    title: 'Navigating Life with Vision Loss',
    description: 'Guide to assistive technology, CNIB services, accessible employment, and advocating for workplace accommodations.',
    link: 'https://www.cnib.ca/en/programs-and-services',
    category: 'Visual Disability',
    readTime: '14 min read'
  },
  {
    id: 'blind-disability-benefits',
    title: 'Disability Benefits for Blind and Low Vision',
    description: 'How to document vision loss, qualify for CPP-D and provincial benefits, and access disability tax credits.',
    link: 'https://www.nib.ca/resources/benefits-guide',
    category: 'Visual Disability',
    readTime: '12 min read'
  },
  
  // Hearing/Deaf Disabilities
  {
    id: 'deaf-workplace-rights',
    title: 'Deaf Workers: Know Your Rights',
    description: 'Legal guide to ASL/LSQ interpreter access, communication accommodations, and fighting audism in the workplace.',
    link: 'https://www.cad.ca/workplace-rights/',
    category: 'Deaf',
    readTime: '11 min read'
  },
  {
    id: 'hard-of-hearing-accommodations',
    title: 'Hard of Hearing: Accommodation Strategies',
    description: 'Practical accommodations for partial hearing loss, including assistive devices, captioning, and disclosure decisions.',
    link: 'https://www.chha.ca/accommodations-guide',
    category: 'Deaf',
    readTime: '10 min read'
  },
  {
    id: 'deaf-disability-claims',
    title: 'Navigating Disability Claims as Deaf Person',
    description: 'How to ensure interpreter access throughout disability application, assessment, and appeals processes.',
    link: 'https://www.cad.ca/disability-benefits/',
    category: 'Deaf',
    readTime: '13 min read'
  },
  
  // Mobility/Physical Disabilities
  {
    id: 'wheelchair-user-employment',
    title: 'Wheelchair Users: Employment Rights',
    description: 'Guide to physical accessibility accommodations, attendant care at work, and fighting discrimination.',
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/mobility.html',
    category: 'Mobility',
    readTime: '12 min read'
  },
  {
    id: 'spinal-cord-injury-life',
    title: 'Life After Spinal Cord Injury',
    description: 'Comprehensive guide to rehabilitation, attendant care, accessible housing, and long-term health management.',
    link: 'https://sci-can.ca/living-with-sci/',
    category: 'Mobility',
    readTime: '15 min read'
  },
  {
    id: 'ms-workplace-management',
    title: 'Managing MS in the Workplace',
    description: 'Strategies for fatigue management, episodic disability disclosure, and maintaining employment with MS.',
    link: 'https://mssociety.ca/managing-ms/employment',
    category: 'Mobility',
    readTime: '11 min read'
  },
  {
    id: 'cerebral-palsy-adults',
    title: 'Cerebral Palsy: Adult Life and Advocacy',
    description: 'Resources for adults with CP navigating aging, pain management, attendant care, and employment.',
    link: 'https://www.cpresearch.ca/living-with-cp/',
    category: 'Mobility',
    readTime: '10 min read'
  },
  
  // Cognitive/Intellectual Disabilities
  {
    id: 'intellectual-disability-self-advocacy',
    title: 'Self-Advocacy for Intellectual Disabilities',
    description: 'People First language, rights to supported decision-making, and fighting for inclusive employment.',
    link: 'https://inclusioncanada.ca/self-advocacy/',
    category: 'Cognitive',
    readTime: '9 min read'
  },
  {
    id: 'autism-employment-guide',
    title: 'Autistic Adults: Employment Survival Guide',
    description: 'Sensory accommodations, social communication supports, disclosure strategies, and finding inclusive employers.',
    link: 'https://www.autismcanada.org/employment-guide/',
    category: 'Autism',
    readTime: '14 min read'
  },
  {
    id: 'brain-injury-recovery-advocacy',
    title: 'Brain Injury Recovery and Advocacy',
    description: 'Understanding cognitive changes, accessing rehab, managing fatigue, and rebuilding your life post-ABI.',
    link: 'https://www.braininjurycanada.ca/resources/',
    category: 'Brain Injury',
    readTime: '13 min read'
  },
  {
    id: 'learning-disabilities-workplace',
    title: 'Learning Disabilities in the Workplace',
    description: 'Accommodations for dyslexia, ADHD, and other learning disabilities. When and how to disclose.',
    link: 'https://www.ldac-acta.ca/workplace-accommodations/',
    category: 'Cognitive',
    readTime: '10 min read'
  },
  
  // Invisible/Episodic Disabilities
  {
    id: 'fibromyalgia-validation-fight',
    title: 'Fibromyalgia: The Validation Fight',
    description: 'How to document invisible pain, find validating doctors, and strengthen disability claims for fibromyalgia.',
    link: 'https://www.fmaware.org/disability-advocacy/',
    category: 'Invisible Disability',
    readTime: '12 min read'
  },
  {
    id: 'me-cfs-disability-guide',
    title: 'ME/CFS: Disability Claims Strategy',
    description: 'Navigating the medical establishment, documenting post-exertional malaise, and appealing denials.',
    link: 'https://meaction.net/resources/disability-benefits/',
    category: 'Invisible Disability',
    readTime: '14 min read'
  },
  {
    id: 'crohns-colitis-workplace',
    title: 'Crohn\'s and Colitis: Workplace Rights',
    description: 'Washroom access rights, flare-up management, episodic disability disclosure, and medical leave.',
    link: 'https://crohnsandcolitis.ca/Employment',
    category: 'Episodic Disability',
    readTime: '10 min read'
  },
  {
    id: 'epilepsy-employment-disclosure',
    title: 'Epilepsy: To Disclose or Not?',
    description: 'Making informed disclosure decisions, accommodation rights, and combating seizure-related discrimination.',
    link: 'https://epilepsy.ca/workplace-rights/',
    category: 'Episodic Disability',
    readTime: '11 min read'
  },
  {
    id: 'invisible-disability-validation',
    title: 'Invisible Disabilities: Being Believed',
    description: 'Strategies for documenting, proving, and advocating for disabilities that aren\'t visible to others.',
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/invisible-disabilities.html',
    category: 'Invisible Disability',
    readTime: '9 min read'
  },
  
  // Psychosocial Disabilities
  {
    id: 'schizophrenia-recovery-employment',
    title: 'Schizophrenia: Recovery and Employment',
    description: 'Supported employment, medication management at work, disclosure decisions, and fighting stigma.',
    link: 'https://www.schizophrenia.ca/employment-recovery',
    category: 'Psychosocial',
    readTime: '12 min read'
  },
  {
    id: 'bipolar-workplace-management',
    title: 'Bipolar Disorder: Workplace Management',
    description: 'Managing mood episodes at work, episodic disability accommodations, and medical leave planning.',
    link: 'https://www.mdsc.ca/workplace-bipolar/',
    category: 'Psychosocial',
    readTime: '11 min read'
  },
  {
    id: 'ptsd-disability-claims',
    title: 'PTSD and Complex PTSD: Disability Guide',
    description: 'Documenting trauma-based disability, finding trauma-informed practitioners, and accessing benefits.',
    link: 'https://www.ptsdassociation.com/disability-benefits',
    category: 'Psychosocial',
    readTime: '13 min read'
  },
  
  // Original Articles
  {
    id: 'navigating-appeals',
    title: 'Navigating the Appeals Process',
    description: 'Step-by-step guide to appealing disability benefit denials, including timelines, evidence requirements, and hearing preparation.',
    link: 'https://www.canada.ca/en/employment-social-development/programs/disability/arc/appeals.html',
    category: 'Advocacy',
    readTime: '12 min read'
  },
  {
    id: 'chronic-pain-validation',
    title: 'Chronic Pain: Fighting for Validation',
    description: 'Strategies for documenting and advocating for chronic pain recognition in disability claims and workplace settings.',
    link: 'https://painbc.ca/resources/chronic-pain-advocacy',
    category: 'Health',
    readTime: '10 min read'
  },
  {
    id: 'mental-health-stigma',
    title: 'Breaking Mental Health Stigma at Work',
    description: 'How to advocate for mental health accommodations and combat stigma in workplace and claims processes.',
    link: 'https://www.mentalhealthcommission.ca/english/what-we-do/workplace',
    category: 'Mental Health',
    readTime: '7 min read'
  },
  {
    id: 'evidence-collection',
    title: 'Building Your Evidence File',
    description: 'What documentation to collect, how to organize it, and strategies for strengthening your disability claim.',
    link: 'https://www.disabilityalliancebc.org/factsheet/building-your-case',
    category: 'Advocacy',
    readTime: '15 min read'
  },
  {
    id: 'intersectionality',
    title: 'Disability and Intersectionality',
    description: 'Examining how race, gender, class, and other identities intersect with disability experiences and advocacy.',
    link: 'https://www.ohrc.on.ca/en/policy-ableism-and-discrimination-based-disability',
    category: 'Justice',
    readTime: '9 min read'
  }
];

export default function ArticlesScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = styles(palette, factor);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Articles</Text>
      <Text style={s.intro}>Insights on disability rights, workplace advocacy, and navigating support systems.</Text>
      
      <GapView gap={16} style={{ marginTop: 16 }}>
        {articles.map(article => (
          <View key={article.id} style={s.card}>
            <View style={s.categoryBadge}>
              <Text style={s.categoryText}>{article.category}</Text>
            </View>
            <Text style={s.articleTitle}>{article.title}</Text>
            <Text style={s.articleDesc}>{article.description}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <Text style={s.readTime}>{article.readTime}</Text>
              <A11yPressable
                accessibilityRole="link"
                accessibilityLabel={`Read ${article.title}`}
                onPress={() => Linking.openURL(article.link).catch(() => {})}
                style={s.linkButton}
                hitSlop={HIT_SLOP_8}
              >
                <Text style={s.linkText}>Read Article →</Text>
              </A11yPressable>
            </View>
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
    categoryBadge: { backgroundColor: palette.primary, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
    categoryText: { fontSize: 11, color: palette.onPrimary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    articleTitle: { fontSize: Math.round(18 * factor), fontWeight: '600', color: palette.text, marginBottom: 8 },
    articleDesc: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85, lineHeight: 20 },
    readTime: { fontSize: 12, color: palette.text, opacity: 0.6, fontStyle: 'italic' },
    linkButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: palette.card, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.primary },
    linkText: { color: palette.primary, fontWeight: '700', fontSize: Math.round(14 * factor) },
  });
}
