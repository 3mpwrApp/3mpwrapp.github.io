import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

const SOLIDARITY_GUIDES = [
  {
    id: 'union-basics',
    title: '🪧 Know Your Union Rights',
    items: [
      '• You have the right to union representation during disciplinary meetings',
      '• Your union can file grievances on your behalf for workplace violations',
      '• Collective agreements often include disability accommodations and modified work provisions',
      '• Union stewards must be trained on disability rights',
      '• You can request union assistance for WSIB/workers\' comp claims',
    ]
  },
  {
    id: 'document',
    title: '📝 Documenting Workplace Issues',
    items: [
      '• Keep a detailed log: date, time, witnesses, what happened',
      '• Save all emails, texts, and written communications',
      '• Take photos/videos of unsafe conditions (if safe to do so)',
      '• Note any verbal conversations in writing ASAP',
      '• Request copies of incident reports and disciplinary records',
      '• Share documentation with your union rep promptly',
    ]
  },
  {
    id: 'accommodations',
    title: '♿ Fighting for Accommodations',
    items: [
      '• Get medical documentation detailing functional limitations',
      '• Request accommodations in writing (email creates a paper trail)',
      '• Employer must accommodate to point of "undue hardship" (legal standard)',
      '• Propose specific accommodations (modified duties, flexible hours, assistive tech)',
      '• If denied, ask for explanation in writing',
      '• File human rights complaint if accommodation denied unfairly',
    ]
  },
  {
    id: 'organizing',
    title: '🤝 Organizing Workplace Support',
    items: [
      '• Build relationships with coworkers before you need help',
      '• Identify allies who will speak up with you',
      '• Present concerns as group issues, not just individual problems',
      '• Use union meetings to raise disability/safety concerns',
      '• Request disability committee or working group formation',
      '• Coordinate with other workers facing similar barriers',
    ]
  },
  {
    id: 'retaliation',
    title: '⚠️ Retaliation Protection',
    items: [
      '• It\'s illegal to retaliate for: filing complaints, requesting accommodations, joining union',
      '• Document any sudden changes in treatment after you speak up',
      '• Report retaliation immediately to union and HR',
      '• Keep timeline of events to show pattern',
      '• File complaint with labor board or human rights commission',
      '• Don\'t let fear silence you — you have legal protections',
    ]
  },
  {
    id: 'solidarity-actions',
    title: '✊ Solidarity in Action',
    items: [
      '• Attend union meetings and vote on disability issues',
      '• Support strike actions and picket lines (virtually if needed)',
      '• Sign solidarity statements for injured workers',
      '• Contribute to hardship funds and mutual aid',
      '• Speak at meetings about disability justice',
      '• Refuse to cross picket lines',
      '• Share knowledge and resources with new hires',
    ]
  },
];

const RESOURCES = [
  { title: 'Workers Action Centre', url: 'https://www.workersactioncentre.org/' },
  { title: 'Canadian Labour Congress - Disability Rights', url: 'https://canadianlabour.ca/' },
  { title: 'Your Union\'s Disability Committee', url: '#' },
];

export default function SolidarityToolkit() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
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
        Union & Worker Solidarity Toolkit
      </Text>
      <DisclaimerBanner type="general" compact={true} />
      <DyslexiaText style={s.text}>
        Step‑by‑step resources for organizing workplace support, fighting for accommodations, and building worker solidarity.
      </DyslexiaText>

      <View style={{ marginTop: 16 }}>
        {SOLIDARITY_GUIDES.map(section => (
          <View key={section.id} style={s.sectionCard}>
            <A11yPressable
              onPress={() => toggleSection(section.id)}
              accessibilityRole="button"
              accessibilityLabel={section.title}
              accessibilityHint={expanded.has(section.id) ? 'Collapse section' : 'Expand to read'}
              accessibilityState={{ expanded: expanded.has(section.id) }}
              hitSlop={HIT_SLOP_8}
              style={s.sectionHeader}
            >
              <Text style={s.sectionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {section.title}
              </Text>
              <Text style={s.chevron}>{expanded.has(section.id) ? '▼' : '▶'}</Text>
            </A11yPressable>
            
            {expanded.has(section.id) && (
              <View style={s.sectionContent}>
                {section.items.map((item, idx) => (
                  <DyslexiaText key={idx} style={s.itemText}>
                    {item}
                  </DyslexiaText>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={{ height: 20 }} />
      <Text style={s.h2} accessibilityRole="header">Templates & Tools</Text>
      <GapView gap={8}>
        <Link href={("/(tabs)/resources/templates-gallery" as any)} asChild={true}>
          <A11yPressable hitSlop={HIT_SLOP_8} style={s.linkButton}>
            <Text style={s.linkText}>📄 Letter Templates</Text>
          </A11yPressable>
        </Link>
        <Link href={("/(tabs)/resources/letter-accommodation" as any)} asChild={true}>
          <A11yPressable hitSlop={HIT_SLOP_8} style={s.linkButton}>
            <Text style={s.linkText}>♿ Accommodation Request</Text>
          </A11yPressable>
        </Link>
        <Link href={("/(tabs)/resources/letter-union-request" as any)} asChild={true}>
          <A11yPressable hitSlop={HIT_SLOP_8} style={s.linkButton}>
            <Text style={s.linkText}>🤝 Union Support Request</Text>
          </A11yPressable>
        </Link>
        <Link href={("/(tabs)/resources/doctor-visit-prep" as any)} asChild={true}>
          <A11yPressable hitSlop={HIT_SLOP_8} style={s.linkButton}>
            <Text style={s.linkText}>🩺 Doctor Visit Prep</Text>
          </A11yPressable>
        </Link>
        <Link href={("/(tabs)/resources/case-timeline" as any)} asChild={true}>
          <A11yPressable hitSlop={HIT_SLOP_8} style={s.linkButton}>
            <Text style={s.linkText}>📅 Case Timeline & Deadlines</Text>
          </A11yPressable>
        </Link>
      </GapView>

      <View style={{ height: 20 }} />
      <Text style={s.h2} accessibilityRole="header">External Resources</Text>
      {RESOURCES.map((resource, idx) => (
        <Text key={idx} style={s.resourceText}>
          • {resource.title}
        </Text>
      ))}

      <View style={[s.sectionCard, { backgroundColor: palette.warning + '11', marginTop: 20 }]}>
        <Text style={[s.sectionTitle, { color: palette.warning }]}>⚡ Emergency Contacts</Text>
        <DyslexiaText style={[s.text, { marginTop: 8 }]}>
          • Your Union Rep/Steward{'\n'}
          • Workers' Comp Board (WSIB, WCB){'\n'}
          • Human Rights Commission{'\n'}
          • Legal Aid or Community Legal Clinic{'\n'}
          • Occupational Health & Safety Inspector
        </DyslexiaText>
      </View>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6, lineHeight: 20 },
    h2: { color: palette.text, fontWeight: '700', fontSize: 18, marginBottom: 8 },
    sectionCard: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
      flex: 1,
    },
    chevron: {
      fontSize: 14,
      color: palette.primary,
      marginLeft: 8,
    },
    sectionContent: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: palette.muted,
    },
    itemText: {
      fontSize: 14,
      color: palette.text,
      lineHeight: 22,
      marginBottom: 6,
    },
    linkButton: {
      backgroundColor: palette.surface,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    linkText: {
      color: palette.primary,
      fontWeight: '600',
      fontSize: 15,
    },
    resourceText: {
      color: palette.text,
      fontSize: 14,
      marginBottom: 6,
      lineHeight: 20,
    },
  });
}
