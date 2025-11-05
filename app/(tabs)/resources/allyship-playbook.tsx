import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

const GUIDES = [
  {
    id: 'offer-help',
    title: '🤝 How to Offer Help',
    content: [
      '• Ask "What would be most helpful?" instead of assuming',
      '• Offer specific help: "Can I pick up groceries?" vs "Let me know if you need anything"',
      '• Respect "no thank you" — sometimes people need independence',
      '• Don\'t make them feel like a burden',
      '• Follow through on commitments',
    ]
  },
  {
    id: 'language',
    title: '💬 Respectful Language',
    content: [
      '• Use person-first ("person with a disability") OR identity-first ("disabled person") based on preference',
      '• Ask their preference if unsure',
      '• Avoid: "suffering from," "confined to wheelchair," "special needs"',
      '• Better: "uses a wheelchair," "has a disability," "needs accommodations"',
      '• Never say "you don\'t look disabled"',
      '• Don\'t ask invasive medical questions',
    ]
  },
  {
    id: 'events',
    title: '📋 Event Accessibility Checklist',
    content: [
      '✓ Wheelchair-accessible venue (ramps, elevators, wide doorways)',
      '✓ Accessible parking nearby',
      '✓ Gender-neutral & accessible washrooms',
      '✓ Seating with back support and space for mobility aids',
      '✓ Quiet space for sensory breaks',
      '✓ Visual and audio information (captions, large print)',
      '✓ Scent-free policy',
      '✓ Flexible schedule (breaks, early exit option)',
      '✓ Ask attendees about needs in advance',
    ]
  },
  {
    id: 'workplace',
    title: '💼 Workplace Solidarity',
    content: [
      '• Support accommodation requests publicly',
      '• Don\'t question if someone "really needs" accommodations',
      '• Offer to help document safety issues or violations',
      '• Stand with injured workers during return-to-work disputes',
      '• Join or support union disability committees',
      '• Speak up against ableist comments or jokes',
      '• Share workload when colleague is struggling',
      '• Don\'t gossip about someone\'s health or accommodations',
    ]
  },
  {
    id: 'advocacy',
    title: '📣 Supporting Advocacy',
    content: [
      '• Amplify (don\'t speak over) disabled voices',
      '• Attend rallies and actions when invited',
      '• Sign petitions and write letters to representatives',
      '• Share fundraisers and mutual aid requests',
      '• Challenge inaccessible systems and spaces',
      '• Educate yourself — don\'t expect disabled people to teach you',
      '• Call out ableism from friends, family, colleagues',
      '• Use your privilege to open doors and make introductions',
    ]
  },
  {
    id: 'dos-donts',
    title: '✅ Quick Do\'s and Don\'ts',
    content: [
      'DO:',
      '• Listen and believe',
      '• Respect boundaries and privacy',
      '• Offer flexibility and patience',
      '• Advocate for systemic change',
      '',
      'DON\'T:',
      '• Assume or patronize',
      '• Touch mobility aids without permission',
      '• Compare disabilities or pain',
      '• Minimize struggles ("at least you...")',
      '• Share medical info without consent',
    ]
  },
];

export default function AllyshipPlaybook() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggleGuide = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Allyship Playbook
      </Text>
      <DisclaimerBanner type="general" compact={true} />
      <DyslexiaText style={s.text}>
        Mini‑guides for friends, family, and coworkers on supporting injured workers and people with disabilities.
      </DyslexiaText>
      
      <View style={{ marginTop: 16 }}>
        {GUIDES.map(guide => (
          <View key={guide.id} style={s.guideCard}>
            <A11yPressable
              onPress={() => toggleGuide(guide.id)}
              accessibilityRole="button"
              accessibilityLabel={guide.title}
              accessibilityHint={expanded.has(guide.id) ? 'Collapse guide' : 'Expand to read guide'}
              accessibilityState={{ expanded: expanded.has(guide.id) }}
              hitSlop={HIT_SLOP_8}
              style={s.guideHeader}
            >
              <Text style={s.guideTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {guide.title}
              </Text>
              <Text style={s.chevron}>{expanded.has(guide.id) ? '▼' : '▶'}</Text>
            </A11yPressable>
            
            {expanded.has(guide.id) && (
              <View style={s.guideContent}>
                {guide.content.map((line, idx) => (
                  <DyslexiaText 
                    key={idx} 
                    style={[
                      s.contentLine, 
                      (line.startsWith('DO') || line.startsWith('DON')) && s.sectionHeader,
                      line === '' && { height: 8 }
                    ].filter((item): item is Exclude<typeof item, false> => Boolean(item))}
                  >
                    {line}
                  </DyslexiaText>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={[s.guideCard, { backgroundColor: palette.info + '11', marginTop: 16 }]}>
        <Text style={[s.guideTitle, { color: palette.info }]}>💡 Remember</Text>
        <DyslexiaText style={[s.text, { marginTop: 8 }]}>
          Being a good ally is an ongoing practice. Listen, learn, make mistakes, apologize, and do better. 
          Center disabled voices and experiences. Challenge ableism everywhere you see it.
        </DyslexiaText>
      </View>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
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
      fontSize: 18,
      fontWeight: '600',
      color: palette.text,
      flex: 1,
    },
    chevron: {
      fontSize: 16,
      color: palette.primary,
      marginLeft: 8,
    },
    guideContent: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: palette.muted,
    },
    contentLine: {
      fontSize: 14,
      color: palette.text,
      lineHeight: 22,
      marginBottom: 4,
    },
    sectionHeader: {
      fontWeight: '700',
      marginTop: 8,
      marginBottom: 4,
    },
  });
}
