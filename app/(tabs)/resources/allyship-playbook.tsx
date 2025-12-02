import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

export const options = { href: null };

type TabType = 'guides' | 'scenarios' | 'progress' | 'share';

// Comprehensive allyship guides
const GUIDES = [
  {
    id: 'offer-help',
    title: 'How to Offer Help',
    icon: 'hand-heart' as const,
    category: 'basics',
    content: [
      { type: 'do', text: 'Ask "What would be most helpful?" instead of assuming' },
      { type: 'do', text: 'Offer specific help: "Can I pick up groceries?" vs vague offers' },
      { type: 'do', text: 'Respect "no thank you" — independence matters' },
      { type: 'do', text: 'Follow through on commitments reliably' },
      { type: 'dont', text: 'Don\'t make them feel like a burden' },
      { type: 'dont', text: 'Don\'t assume what they need' },
      { type: 'tip', text: 'Recurring offers ("Every Tuesday I can help") are often more useful than one-time offers' },
    ]
  },
  {
    id: 'language',
    title: 'Respectful Language',
    icon: 'message-text' as const,
    category: 'communication',
    content: [
      { type: 'do', text: 'Use person-first OR identity-first based on their preference' },
      { type: 'do', text: 'Ask their preference if unsure' },
      { type: 'do', text: 'Say "uses a wheelchair," "has a disability," "needs accommodations"' },
      { type: 'dont', text: 'Avoid: "suffering from," "confined to wheelchair," "special needs"' },
      { type: 'dont', text: 'Never say "you don\'t look disabled"' },
      { type: 'dont', text: 'Don\'t ask invasive medical questions' },
      { type: 'tip', text: 'When in doubt, ask how they\'d like to be referred to' },
    ]
  },
  {
    id: 'events',
    title: 'Event Accessibility Checklist',
    icon: 'calendar-check' as const,
    category: 'practical',
    content: [
      { type: 'check', text: 'Wheelchair-accessible venue (ramps, elevators, wide doorways)' },
      { type: 'check', text: 'Accessible parking nearby' },
      { type: 'check', text: 'Gender-neutral & accessible washrooms' },
      { type: 'check', text: 'Seating with back support and space for mobility aids' },
      { type: 'check', text: 'Quiet space for sensory breaks' },
      { type: 'check', text: 'Visual and audio information (captions, large print)' },
      { type: 'check', text: 'Scent-free policy announced' },
      { type: 'check', text: 'Flexible schedule (breaks, early exit option)' },
      { type: 'check', text: 'Ask attendees about needs in advance' },
      { type: 'tip', text: 'Create and share an accessibility statement before events' },
    ]
  },
  {
    id: 'workplace',
    title: 'Workplace Solidarity',
    icon: 'briefcase-check' as const,
    category: 'workplace',
    content: [
      { type: 'do', text: 'Support accommodation requests publicly' },
      { type: 'do', text: 'Offer to help document safety issues or violations' },
      { type: 'do', text: 'Stand with injured workers during return-to-work disputes' },
      { type: 'do', text: 'Join or support union disability committees' },
      { type: 'do', text: 'Share workload when a colleague is struggling' },
      { type: 'dont', text: 'Don\'t question if someone "really needs" accommodations' },
      { type: 'dont', text: 'Don\'t gossip about someone\'s health or accommodations' },
      { type: 'action', text: 'Speak up against ableist comments or jokes immediately' },
    ]
  },
  {
    id: 'advocacy',
    title: 'Supporting Advocacy',
    icon: 'bullhorn' as const,
    category: 'advocacy',
    content: [
      { type: 'do', text: 'Amplify (don\'t speak over) disabled voices' },
      { type: 'do', text: 'Attend rallies and actions when invited' },
      { type: 'do', text: 'Sign petitions and write letters to representatives' },
      { type: 'do', text: 'Share fundraisers and mutual aid requests' },
      { type: 'do', text: 'Challenge inaccessible systems and spaces' },
      { type: 'dont', text: 'Don\'t expect disabled people to teach you everything' },
      { type: 'action', text: 'Use your privilege to open doors and make introductions' },
      { type: 'action', text: 'Call out ableism from friends, family, colleagues' },
    ]
  },
  {
    id: 'family',
    title: 'Supporting Family Members',
    icon: 'account-heart' as const,
    category: 'family',
    content: [
      { type: 'do', text: 'Believe them when they describe their symptoms and struggles' },
      { type: 'do', text: 'Learn about their condition from reputable sources' },
      { type: 'do', text: 'Offer to accompany them to medical appointments' },
      { type: 'do', text: 'Help navigate paperwork and bureaucracy' },
      { type: 'do', text: 'Celebrate small victories and progress' },
      { type: 'dont', text: 'Don\'t compare their disability to others' },
      { type: 'dont', text: 'Don\'t minimize struggles ("at least you...")' },
      { type: 'dont', text: 'Don\'t push unsolicited advice or "cures"' },
      { type: 'tip', text: 'Taking care of yourself is important too — burnout helps no one' },
    ]
  },
  {
    id: 'invisible',
    title: 'Invisible Disabilities',
    icon: 'eye-off' as const,
    category: 'understanding',
    content: [
      { type: 'do', text: 'Understand that many disabilities are not visible' },
      { type: 'do', text: 'Accept that symptoms can fluctuate day to day' },
      { type: 'do', text: 'Recognize that "looking fine" doesn\'t mean feeling fine' },
      { type: 'dont', text: 'Don\'t say "but you don\'t look sick"' },
      { type: 'dont', text: 'Don\'t assume what activities they can or can\'t do' },
      { type: 'dont', text: 'Don\'t question their use of accessibility features' },
      { type: 'tip', text: 'Chronic pain, mental health, autoimmune conditions, and many more are often invisible' },
    ]
  },
];

// Interactive scenarios for learning
interface Scenario {
  id: string;
  title: string;
  context: string;
  situation: string;
  options: { text: string; isGood: boolean; feedback: string }[];
  category: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'scenario-1',
    title: 'Coworker Returns from Leave',
    context: 'workplace',
    category: 'workplace',
    situation: 'Your coworker Sarah returns to work after 3 months of medical leave. She seems slower and needs more breaks. Another coworker complains about "picking up her slack."',
    options: [
      { text: 'Agree with the coworker and vent together', isGood: false, feedback: 'This creates a hostile environment and isn\'t supportive. Sarah is likely doing her best while recovering.' },
      { text: 'Tell Sarah she should work harder to catch up', isGood: false, feedback: 'This puts unfair pressure on someone recovering. Accommodations exist for good reason.' },
      { text: 'Speak privately to the complaining coworker about supporting Sarah\'s return', isGood: true, feedback: 'Great choice! Educating others helps build a supportive workplace. You can explain that accommodations are a legal right.' },
      { text: 'Ignore both and stay out of it', isGood: false, feedback: 'While not actively harmful, silence enables ableism. Speaking up for colleagues matters.' },
    ],
  },
  {
    id: 'scenario-2',
    title: 'Planning a Group Outing',
    context: 'social',
    category: 'social',
    situation: 'You\'re planning a birthday dinner with friends. One friend uses a wheelchair. Someone suggests a trendy restaurant with stairs.',
    options: [
      { text: 'Choose the inaccessible restaurant anyway — it\'s really popular', isGood: false, feedback: 'This excludes your friend with a disability. Accessibility should be non-negotiable for group events.' },
      { text: 'Tell the wheelchair user they can join next time when you pick somewhere accessible', isGood: false, feedback: 'This still excludes them from THIS event and treats accessibility as optional.' },
      { text: 'Research and suggest an accessible alternative that everyone can enjoy', isGood: true, feedback: 'Perfect! You\'re ensuring everyone can participate equally while still finding a great venue.' },
      { text: 'Call the restaurant to ask about accessibility and suggest alternatives if needed', isGood: true, feedback: 'Excellent! Checking accessibility proactively shows care and ensures inclusion.' },
    ],
  },
  {
    id: 'scenario-3',
    title: 'Medical Advice Situation',
    context: 'family',
    category: 'family',
    situation: 'Your cousin has fibromyalgia. Your aunt keeps suggesting various "cures" she read about online and says "have you tried yoga?"',
    options: [
      { text: 'Stay silent — it\'s not your place to get involved', isGood: false, feedback: 'Your cousin may appreciate backup. Silence lets the unsolicited advice continue.' },
      { text: 'Share your own cure suggestions too', isGood: false, feedback: 'Adding more unsolicited advice isn\'t helpful, even if well-intentioned.' },
      { text: 'Gently redirect: "I\'m sure Cousin has explored options with their doctors. What movie should we watch?"', isGood: true, feedback: 'Great! You\'ve validated their autonomy and redirected without creating conflict.' },
      { text: 'Privately tell your aunt that chronic conditions are complex and medical advice should come from doctors', isGood: true, feedback: 'Good approach! Educating family members privately can be very effective.' },
    ],
  },
  {
    id: 'scenario-4',
    title: 'Accommodation Request Backlash',
    context: 'workplace',
    category: 'workplace',
    situation: 'A coworker with chronic pain gets a standing desk accommodation. Others grumble: "If they get one, we should all get one."',
    options: [
      { text: 'Agree — it does seem unfair', isGood: false, feedback: 'Accommodations aren\'t perks; they level the playing field. Fair ≠ same treatment for everyone.' },
      { text: 'Stay quiet and hope it blows over', isGood: false, feedback: 'Silence enables the backlash. Your colleague may feel unsupported.' },
      { text: 'Explain that accommodations meet specific needs and others can request their own if they have needs', isGood: true, feedback: 'Excellent! You\'re educating while not disclosing your colleague\'s private information.' },
      { text: 'Tell your colleague about the complaints so they can defend themselves', isGood: false, feedback: 'This puts the burden on the person who just got their accommodation. They shouldn\'t have to justify it.' },
    ],
  },
  {
    id: 'scenario-5',
    title: 'Service Animal Encounter',
    context: 'public',
    category: 'public',
    situation: 'At a café, you see someone with a service dog. Your child wants to pet the cute dog.',
    options: [
      { text: 'Let your child pet the dog — dogs love attention!', isGood: false, feedback: 'Service animals are working and shouldn\'t be distracted. This could be dangerous for the handler.' },
      { text: 'Ask the handler if your child can pet the dog', isGood: false, feedback: 'While more polite, this puts pressure on the handler to say yes. It\'s better not to ask.' },
      { text: 'Explain to your child that the dog is working and can\'t be petted right now', isGood: true, feedback: 'Perfect! You\'re teaching your child about service animals while respecting the handler.' },
      { text: 'Ignore the dog completely and tell your child to do the same', isGood: true, feedback: 'Good choice! Service animals should be treated as invisible while working. You can explain why later.' },
    ],
  },
  {
    id: 'scenario-6',
    title: 'WSIB Denial Support',
    context: 'support',
    category: 'support',
    situation: 'Your friend\'s WSIB claim was denied. They\'re devastated and don\'t know what to do.',
    options: [
      { text: 'Say "that sucks" and move on to a different topic', isGood: false, feedback: 'While you may be uncomfortable, minimizing their struggle isn\'t supportive.' },
      { text: 'Say "maybe you should just accept it and move on"', isGood: false, feedback: 'Denials can often be appealed successfully. Don\'t discourage them from fighting for their rights.' },
      { text: 'Listen, validate their feelings, and offer to help research the appeal process together', isGood: true, feedback: 'Excellent! You\'re providing emotional support AND practical help. This is true allyship.' },
      { text: 'Tell them about the 3mpwr app\'s Denial Decoder and Appeal resources', isGood: true, feedback: 'Great! Connecting them with resources empowers them to take action.' },
    ],
  },
];

// Progress tracking
interface AllyProgress {
  guidesRead: string[];
  scenariosCompleted: string[];
  correctAnswers: number;
  totalAnswers: number;
  lastActivity: string;
}

const STORAGE_KEY = 'allyship_progress_v1';

// Shareable resources
const SHAREABLE_RESOURCES = [
  {
    id: 'quick-tips',
    title: 'Allyship Quick Tips',
    description: 'One-page summary for friends and family',
    icon: 'file-document-outline' as const,
  },
  {
    id: 'workplace-guide',
    title: 'Workplace Ally Guide',
    description: 'For coworkers and managers',
    icon: 'briefcase-outline' as const,
  },
  {
    id: 'event-checklist',
    title: 'Event Accessibility Checklist',
    description: 'Printable checklist for event planning',
    icon: 'clipboard-check-outline' as const,
  },
  {
    id: 'language-card',
    title: 'Language Guide Card',
    description: 'Do\'s and don\'ts for respectful language',
    icon: 'card-text-outline' as const,
  },
];

export default function AllyshipPlaybook() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Allyship Playbook');
  useFocusOnRefOnMount(titleRef);

  // State
  const [activeTab, setActiveTab] = React.useState<TabType>('guides');
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [progress, setProgress] = React.useState<AllyProgress>({
    guidesRead: [],
    scenariosCompleted: [],
    correctAnswers: 0,
    totalAnswers: 0,
    lastActivity: new Date().toISOString(),
  });
  const [activeScenario, setActiveScenario] = React.useState<Scenario | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [showFeedback, setShowFeedback] = React.useState(false);

  // Load progress
  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) setProgress(JSON.parse(data));
    }).catch(() => {});
  }, []);

  const saveProgress = async (newProgress: AllyProgress) => {
    setProgress(newProgress);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  const toggleGuide = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Mark guide as read
    if (!progress.guidesRead.includes(id)) {
      const newProgress = {
        ...progress,
        guidesRead: [...progress.guidesRead, id],
        lastActivity: new Date().toISOString(),
      };
      saveProgress(newProgress);
    }
  };

  const startScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const selectOption = (idx: number) => {
    setSelectedOption(idx);
    setShowFeedback(true);
    
    const isCorrect = activeScenario?.options[idx].isGood || false;
    const alreadyCompleted = progress.scenariosCompleted.includes(activeScenario?.id || '');
    
    if (!alreadyCompleted) {
      const newProgress = {
        ...progress,
        scenariosCompleted: [...progress.scenariosCompleted, activeScenario?.id || ''],
        correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
        totalAnswers: progress.totalAnswers + 1,
        lastActivity: new Date().toISOString(),
      };
      saveProgress(newProgress);
    }
    
    announce(isCorrect ? 'Good choice!' : 'Learning opportunity');
  };

  const resetProgress = () => {
    Alert.alert('Reset Progress', 'This will clear all your allyship training progress. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => {
        const newProgress: AllyProgress = {
          guidesRead: [],
          scenariosCompleted: [],
          correctAnswers: 0,
          totalAnswers: 0,
          lastActivity: new Date().toISOString(),
        };
        saveProgress(newProgress);
      }},
    ]);
  };

  const shareResource = async (resource: typeof SHAREABLE_RESOURCES[0]) => {
    try {
      const FS = await import('expo-file-system');
      const Share = await import('expo-sharing');
      
      let content = '';
      
      if (resource.id === 'quick-tips') {
        content = `ALLYSHIP QUICK TIPS\n\n` +
          `DO:\n` +
          `• Listen and believe\n` +
          `• Ask "What would be most helpful?"\n` +
          `• Respect boundaries and privacy\n` +
          `• Follow through on commitments\n` +
          `• Support accommodation requests\n` +
          `• Amplify disabled voices\n\n` +
          `DON'T:\n` +
          `• Assume what help they need\n` +
          `• Touch mobility aids without permission\n` +
          `• Say "you don't look disabled"\n` +
          `• Give unsolicited medical advice\n` +
          `• Compare disabilities or pain\n` +
          `• Share their medical info without consent\n\n` +
          `Remember: Being a good ally is an ongoing practice. Listen, learn, make mistakes, apologize, and do better.`;
      } else if (resource.id === 'workplace-guide') {
        content = `WORKPLACE ALLY GUIDE\n\n` +
          `SUPPORTING COLLEAGUES WITH DISABILITIES:\n\n` +
          `• Support accommodation requests publicly\n` +
          `• Don't question if someone "really needs" accommodations\n` +
          `• Offer to help document safety issues\n` +
          `• Stand with injured workers during RTW disputes\n` +
          `• Share workload when a colleague is struggling\n` +
          `• Speak up against ableist comments or jokes\n` +
          `• Don't gossip about health or accommodations\n\n` +
          `FOR MANAGERS:\n\n` +
          `• Accommodations are a legal right, not a favor\n` +
          `• Engage in good-faith interactive process\n` +
          `• Keep medical information confidential\n` +
          `• Focus on job functions, not limitations\n` +
          `• Foster an inclusive team culture`;
      } else if (resource.id === 'event-checklist') {
        content = `EVENT ACCESSIBILITY CHECKLIST\n\n` +
          `BEFORE THE EVENT:\n` +
          `☐ Ask attendees about accessibility needs\n` +
          `☐ Choose accessible venue (ramps, elevators)\n` +
          `☐ Confirm accessible parking nearby\n` +
          `☐ Arrange for ASL interpretation if needed\n` +
          `☐ Prepare materials in accessible formats\n` +
          `☐ Announce scent-free policy\n\n` +
          `AT THE VENUE:\n` +
          `☐ Accessible entrance clearly marked\n` +
          `☐ Gender-neutral & accessible washrooms\n` +
          `☐ Seating with space for mobility aids\n` +
          `☐ Quiet space for sensory breaks\n` +
          `☐ Good lighting and acoustics\n` +
          `☐ Microphones for speakers\n\n` +
          `DURING THE EVENT:\n` +
          `☐ Regular breaks scheduled\n` +
          `☐ Early exit option available\n` +
          `☐ Captions for videos\n` +
          `☐ Staff know accessibility features`;
      } else if (resource.id === 'language-card') {
        content = `RESPECTFUL LANGUAGE GUIDE\n\n` +
          `INSTEAD OF:\n` +
          `"Suffering from..." → "Has..." or "Lives with..."\n` +
          `"Confined to wheelchair" → "Uses a wheelchair"\n` +
          `"Special needs" → "Accessibility needs"\n` +
          `"Handicapped" → "Disabled" or "Person with disability"\n` +
          `"Normal" → "Non-disabled"\n\n` +
          `NEVER SAY:\n` +
          `• "You don't look disabled"\n` +
          `• "What happened to you?"\n` +
          `• "I could never live like that"\n` +
          `• "You're so inspiring just for existing"\n` +
          `• "At least you don't have..."\n\n` +
          `BEST PRACTICE:\n` +
          `Ask the person how they prefer to be referred to. Some prefer person-first ("person with a disability"), while others prefer identity-first ("disabled person").`;
      }
      
      const path = FS.cacheDirectory + `${resource.id}_${Date.now()}.txt`;
      await FS.writeAsStringAsync(path, content);
      if (await Share.isAvailableAsync()) await Share.shareAsync(path);
    } catch {
      Alert.alert('Error', 'Could not share resource.');
    }
  };

  // Calculate progress percentage
  const totalGuides = GUIDES.length;
  const totalScenarios = SCENARIOS.length;
  const guidesProgress = (progress.guidesRead.length / totalGuides) * 100;
  const scenariosProgress = (progress.scenariosCompleted.length / totalScenarios) * 100;
  const overallProgress = ((progress.guidesRead.length + progress.scenariosCompleted.length) / (totalGuides + totalScenarios)) * 100;

  const TabButton = ({ tab, label, icon }: { tab: TabType; label: string; icon: string }) => (
    <A11yPressable
      onPress={() => setActiveTab(tab)}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeTab === tab }}
      style={[s.tabButton, activeTab === tab && s.tabButtonActive]}
    >
      <MaterialCommunityIcons name={icon as any} size={18} color={activeTab === tab ? palette.onPrimary : palette.text} />
      <Text style={[s.tabButtonText, activeTab === tab && { color: palette.onPrimary }]}>{label}</Text>
    </A11yPressable>
  );

  const ContentBadge = ({ type }: { type: string }) => {
    const badgeStyles: Record<string, { bg: string; color: string; icon: string }> = {
      do: { bg: palette.success + '20', color: palette.success, icon: 'check' },
      dont: { bg: palette.error + '20', color: palette.error, icon: 'close' },
      tip: { bg: palette.info + '20', color: palette.info, icon: 'lightbulb' },
      check: { bg: palette.primary + '20', color: palette.primary, icon: 'checkbox-marked-outline' },
      action: { bg: palette.warning + '20', color: palette.warning, icon: 'star' },
    };
    const style = badgeStyles[type] || badgeStyles.tip;
    return (
      <View style={[s.badge, { backgroundColor: style.bg }]}>
        <MaterialCommunityIcons name={style.icon as any} size={14} color={style.color} />
      </View>
    );
  };

  return (
    <ResponsiveScreenWrapper scrollable>
      <View style={{ padding: 16 }}>
        <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Allyship Playbook
        </Text>
        <DisclaimerBanner type="general" compact={true} />
        <DyslexiaText style={s.subtitle}>
          Interactive guides and scenarios for friends, family, and coworkers on supporting injured workers and people with disabilities.
        </DyslexiaText>

        {/* Progress Summary */}
        <View style={s.progressSummary}>
          <View style={{ flex: 1 }}>
            <Text style={s.progressLabel}>Your Progress</Text>
            <View style={s.progressBarContainer}>
              <View style={[s.progressBar, { width: `${overallProgress}%` }]} />
            </View>
          </View>
          <Text style={s.progressPercent}>{Math.round(overallProgress)}%</Text>
        </View>

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
          <GapView style={{ flexDirection: 'row' }} gap={8}>
            <TabButton tab="guides" label="Guides" icon="book-open-variant" />
            <TabButton tab="scenarios" label="Scenarios" icon="head-question" />
            <TabButton tab="progress" label="Progress" icon="chart-line" />
            <TabButton tab="share" label="Share" icon="share-variant" />
          </GapView>
        </ScrollView>

        {/* GUIDES TAB */}
        {activeTab === 'guides' && (
          <>
            {GUIDES.map(guide => (
              <View key={guide.id} style={s.guideCard}>
                <A11yPressable
                  onPress={() => toggleGuide(guide.id)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: expanded.has(guide.id) }}
                  hitSlop={HIT_SLOP_8}
                  style={s.guideHeader}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <MaterialCommunityIcons name={guide.icon} size={22} color={palette.primary} />
                    <Text style={s.guideTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {guide.title}
                    </Text>
                    {progress.guidesRead.includes(guide.id) && (
                      <MaterialCommunityIcons name="check-circle" size={18} color={palette.success} style={{ marginLeft: 8 }} />
                    )}
                  </View>
                  <MaterialCommunityIcons
                    name={expanded.has(guide.id) ? 'chevron-down' : 'chevron-right'}
                    size={22}
                    color={palette.primary}
                  />
                </A11yPressable>

                {expanded.has(guide.id) && (
                  <View style={s.guideContent}>
                    {guide.content.map((item, idx) => (
                      <View key={idx} style={s.contentItem}>
                        <ContentBadge type={item.type} />
                        <DyslexiaText style={s.contentText}>{item.text}</DyslexiaText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* SCENARIOS TAB */}
        {activeTab === 'scenarios' && (
          <>
            <DyslexiaText style={[s.subtitle, { marginBottom: 16 }]}>
              Practice responding to real-world situations. Choose the best response and learn from feedback.
            </DyslexiaText>

            {SCENARIOS.map(scenario => {
              const isCompleted = progress.scenariosCompleted.includes(scenario.id);
              return (
                <A11yPressable
                  key={scenario.id}
                  onPress={() => startScenario(scenario)}
                  style={s.scenarioCard}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={[s.contextBadge, { backgroundColor: palette.primary + '20' }]}>
                      <Text style={{ color: palette.primary, fontWeight: '600', fontSize: 12 }}>{scenario.context.toUpperCase()}</Text>
                    </View>
                    {isCompleted && (
                      <MaterialCommunityIcons name="check-circle" size={18} color={palette.success} style={{ marginLeft: 8 }} />
                    )}
                  </View>
                  <Text style={s.scenarioTitle}>{scenario.title}</Text>
                  <Text style={s.scenarioPreview} numberOfLines={2}>{scenario.situation}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <MaterialCommunityIcons name="play-circle" size={18} color={palette.primary} />
                    <Text style={{ color: palette.primary, fontWeight: '600', marginLeft: 6 }}>
                      {isCompleted ? 'Try Again' : 'Start Scenario'}
                    </Text>
                  </View>
                </A11yPressable>
              );
            })}
          </>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <>
            {/* Overall Stats */}
            <View style={s.statsCard}>
              <Text style={s.statsTitle}>Your Allyship Journey</Text>
              
              <View style={s.statRow}>
                <View style={s.statItem}>
                  <Text style={s.statNumber}>{progress.guidesRead.length}</Text>
                  <Text style={s.statLabel}>Guides Read</Text>
                </View>
                <View style={s.statItem}>
                  <Text style={s.statNumber}>{progress.scenariosCompleted.length}</Text>
                  <Text style={s.statLabel}>Scenarios Done</Text>
                </View>
                <View style={s.statItem}>
                  <Text style={[s.statNumber, { color: palette.success }]}>
                    {progress.totalAnswers > 0 ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100) : 0}%
                  </Text>
                  <Text style={s.statLabel}>Correct Answers</Text>
                </View>
              </View>
            </View>

            {/* Detailed Progress */}
            <View style={s.progressCard}>
              <Text style={s.progressTitle}>Guide Progress</Text>
              <View style={s.progressBarLarge}>
                <View style={[s.progressBarFill, { width: `${guidesProgress}%` }]} />
              </View>
              <Text style={s.progressText}>{progress.guidesRead.length} of {totalGuides} guides read</Text>
            </View>

            <View style={s.progressCard}>
              <Text style={s.progressTitle}>Scenario Progress</Text>
              <View style={s.progressBarLarge}>
                <View style={[s.progressBarFill, { width: `${scenariosProgress}%`, backgroundColor: palette.info }]} />
              </View>
              <Text style={s.progressText}>{progress.scenariosCompleted.length} of {totalScenarios} scenarios completed</Text>
            </View>

            {/* Achievements */}
            <View style={s.achievementsCard}>
              <Text style={s.achievementsTitle}>🏆 Achievements</Text>
              <View style={s.achievementsList}>
                <View style={[s.achievement, progress.guidesRead.length >= 1 && s.achievementUnlocked]}>
                  <MaterialCommunityIcons name="book-open-page-variant" size={24} color={progress.guidesRead.length >= 1 ? palette.success : palette.muted} />
                  <Text style={s.achievementText}>First Guide Read</Text>
                </View>
                <View style={[s.achievement, progress.guidesRead.length >= totalGuides && s.achievementUnlocked]}>
                  <MaterialCommunityIcons name="library" size={24} color={progress.guidesRead.length >= totalGuides ? palette.success : palette.muted} />
                  <Text style={s.achievementText}>Guide Master</Text>
                </View>
                <View style={[s.achievement, progress.scenariosCompleted.length >= 1 && s.achievementUnlocked]}>
                  <MaterialCommunityIcons name="head-check" size={24} color={progress.scenariosCompleted.length >= 1 ? palette.success : palette.muted} />
                  <Text style={s.achievementText}>First Scenario</Text>
                </View>
                <View style={[s.achievement, progress.scenariosCompleted.length >= totalScenarios && s.achievementUnlocked]}>
                  <MaterialCommunityIcons name="trophy" size={24} color={progress.scenariosCompleted.length >= totalScenarios ? palette.success : palette.muted} />
                  <Text style={s.achievementText}>Scenario Expert</Text>
                </View>
              </View>
            </View>

            <A11yPressable onPress={resetProgress} style={s.resetButton}>
              <MaterialCommunityIcons name="refresh" size={18} color={palette.error} />
              <Text style={{ color: palette.error, fontWeight: '600', marginLeft: 8 }}>Reset Progress</Text>
            </A11yPressable>
          </>
        )}

        {/* SHARE TAB */}
        {activeTab === 'share' && (
          <>
            <DyslexiaText style={[s.subtitle, { marginBottom: 16 }]}>
              Share these resources with friends, family, and coworkers to help them become better allies.
            </DyslexiaText>

            {SHAREABLE_RESOURCES.map(resource => (
              <A11yPressable
                key={resource.id}
                onPress={() => shareResource(resource)}
                style={s.shareCard}
              >
                <MaterialCommunityIcons name={resource.icon} size={28} color={palette.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.shareTitle}>{resource.title}</Text>
                  <Text style={s.shareDescription}>{resource.description}</Text>
                </View>
                <MaterialCommunityIcons name="share" size={22} color={palette.primary} />
              </A11yPressable>
            ))}

            {/* Remember Card */}
            <View style={[s.guideCard, { backgroundColor: palette.info + '15', marginTop: 20 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialCommunityIcons name="lightbulb" size={24} color={palette.info} />
                <Text style={[s.guideTitle, { color: palette.info }]}>Remember</Text>
              </View>
              <DyslexiaText style={s.contentText}>
                Being a good ally is an ongoing practice. Listen, learn, make mistakes, apologize, and do better. Center disabled voices and experiences. Challenge ableism everywhere you see it.
              </DyslexiaText>
            </View>
          </>
        )}

        {/* Scenario Modal */}
        <Modal visible={!!activeScenario} animationType="slide" transparent>
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: palette.background }]}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>{activeScenario?.title}</Text>
                <A11yPressable onPress={() => setActiveScenario(null)}>
                  <MaterialCommunityIcons name="close" size={24} color={palette.text} />
                </A11yPressable>
              </View>
              <ScrollView style={{ padding: 16 }}>
                <View style={s.situationCard}>
                  <Text style={s.situationLabel}>THE SITUATION</Text>
                  <DyslexiaText style={s.situationText}>{activeScenario?.situation}</DyslexiaText>
                </View>

                <Text style={s.optionsLabel}>What would you do?</Text>

                {activeScenario?.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const showResult = showFeedback && isSelected;
                  
                  return (
                    <A11yPressable
                      key={idx}
                      onPress={() => !showFeedback && selectOption(idx)}
                      disabled={showFeedback}
                      style={[
                        s.optionCard,
                        isSelected && (option.isGood ? s.optionGood : s.optionBad),
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <View style={[s.optionNumber, isSelected && { backgroundColor: option.isGood ? palette.success : palette.error }]}>
                          <Text style={{ color: palette.onPrimary, fontWeight: '700' }}>{String.fromCharCode(65 + idx)}</Text>
                        </View>
                        <DyslexiaText style={[s.optionText, isSelected ? { fontWeight: '600' as const } : {}]}>{option.text}</DyslexiaText>
                      </View>
                      {showResult && (
                        <View style={[s.feedbackBox, { backgroundColor: option.isGood ? palette.success + '15' : palette.error + '15' }]}>
                          <MaterialCommunityIcons 
                            name={option.isGood ? 'check-circle' : 'information'} 
                            size={20} 
                            color={option.isGood ? palette.success : palette.error} 
                          />
                          <DyslexiaText style={[s.feedbackText, { color: option.isGood ? palette.success : palette.error }]}>
                            {option.feedback}
                          </DyslexiaText>
                        </View>
                      )}
                    </A11yPressable>
                  );
                })}

                {showFeedback && (
                  <A11yPressable
                    onPress={() => setActiveScenario(null)}
                    style={s.nextButton}
                  >
                    <Text style={s.nextButtonText}>Continue</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={palette.onPrimary} />
                  </A11yPressable>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </ResponsiveScreenWrapper>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: '700', color: palette.text, marginBottom: 8 },
    subtitle: { color: palette.text, opacity: 0.9, lineHeight: 22 },
    
    // Progress Summary
    progressSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.primary + '15',
      padding: 12,
      borderRadius: 12,
      marginTop: 12,
    },
    progressLabel: { color: palette.text, fontWeight: '600', marginBottom: 6 },
    progressBarContainer: {
      height: 8,
      backgroundColor: palette.muted,
      borderRadius: 4,
    },
    progressBar: {
      height: '100%',
      backgroundColor: palette.primary,
      borderRadius: 4,
    },
    progressPercent: { color: palette.primary, fontWeight: '700', fontSize: 20, marginLeft: 12 },
    
    // Tabs
    tabButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    tabButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    tabButtonText: { fontSize: 13, fontWeight: '600', color: palette.text },
    
    // Guide Cards
    guideCard: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    guideHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    guideTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
      marginLeft: 10,
      flex: 1,
    },
    guideContent: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: palette.muted,
    },
    
    // Content Items
    contentItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    badge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    contentText: {
      flex: 1,
      color: palette.text,
      lineHeight: 22,
    },
    
    // Scenario Cards
    scenarioCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    contextBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    scenarioTitle: { fontSize: 17, fontWeight: '700', color: palette.text, marginBottom: 6 },
    scenarioPreview: { color: palette.text, opacity: 0.8, lineHeight: 20 },
    
    // Stats
    statsCard: {
      backgroundColor: palette.primary + '10',
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
    },
    statsTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 16, textAlign: 'center' },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: { fontSize: 32, fontWeight: '700', color: palette.primary },
    statLabel: { color: palette.text, opacity: 0.8, marginTop: 4, fontSize: 13 },
    
    // Progress Cards
    progressCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    progressTitle: { color: palette.text, fontWeight: '600', marginBottom: 10 },
    progressBarLarge: {
      height: 10,
      backgroundColor: palette.muted,
      borderRadius: 5,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: palette.success,
      borderRadius: 5,
    },
    progressText: { color: palette.text, opacity: 0.8, marginTop: 8, fontSize: 13 },
    
    // Achievements
    achievementsCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    achievementsTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 16 },
    achievementsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    achievement: {
      width: '47%',
      backgroundColor: palette.surface,
      borderRadius: 10,
      padding: 12,
      alignItems: 'center',
      opacity: 0.5,
    },
    achievementUnlocked: {
      opacity: 1,
      borderWidth: 1,
      borderColor: palette.success,
    },
    achievementText: { color: palette.text, fontWeight: '600', marginTop: 8, textAlign: 'center', fontSize: 13 },
    
    // Share
    shareCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    shareTitle: { color: palette.text, fontWeight: '700', fontSize: 16 },
    shareDescription: { color: palette.text, opacity: 0.7, marginTop: 2 },
    
    // Buttons
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.error,
      marginTop: 16,
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: palette.primary,
      padding: 16,
      borderRadius: 12,
      marginTop: 20,
    },
    nextButtonText: { color: palette.onPrimary, fontWeight: '700', fontSize: 16 },
    
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: palette.muted,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: palette.text },
    
    // Scenario UI
    situationCard: {
      backgroundColor: palette.info + '15',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    situationLabel: { color: palette.info, fontWeight: '700', fontSize: 12, marginBottom: 8 },
    situationText: { color: palette.text, lineHeight: 24, fontSize: 15 },
    optionsLabel: { color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 12 },
    optionCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: palette.muted,
    },
    optionGood: {
      borderColor: palette.success,
      backgroundColor: palette.success + '10',
    },
    optionBad: {
      borderColor: palette.error,
      backgroundColor: palette.error + '10',
    },
    optionNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: palette.muted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    optionText: { flex: 1, color: palette.text, lineHeight: 22 },
    feedbackBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 12,
      padding: 12,
      borderRadius: 8,
    },
    feedbackText: { flex: 1, marginLeft: 10, lineHeight: 20 },
  });
}
