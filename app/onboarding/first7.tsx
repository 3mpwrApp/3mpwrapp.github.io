import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { useFirst7 } from '../../store/onboardingFirst7';
import { useAppPalette } from '../../theme/usePalette';

const steps = [
  { id: 'capture_basics', label: 'Capture your basics', hint: 'Profile and personal details' },
  { id: 'first_evidence_note', label: 'Add your first Evidence Locker note', hint: 'Secure, encrypted' },
  { id: 'tag_key_contacts', label: 'Tag key contacts', hint: 'Doctors, advocates' },
  { id: 'bookmark_resources', label: 'Bookmark top resources', hint: 'Save for quick access' },
  { id: 'set_reminders', label: 'Set reminders', hint: 'Follow-ups and deadlines' },
  { id: 'record_denial_dates', label: 'Record denial dates', hint: 'Track appeal windows' },
  { id: 'setup_privacy', label: 'Review privacy & security', hint: 'Passcode, backups' },
  { id: 'export_backup', label: 'Export a backup', hint: 'Keep a copy somewhere safe' },
] as const;

type Step = typeof steps[number]['id'];

export default function First7Screen(){
  const { state, toggle, start } = useFirst7();
  const router = useRouter();
  const palette = useAppPalette();
  React.useEffect(()=>{ start(); }, [start]);
  const chipStyle = React.useMemo(() => ({ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 9999, borderWidth: 1, borderColor: palette.muted, backgroundColor: palette.surface } as const), [palette]);
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }} accessibilityRole="summary" accessibilityLabel="First 7 days onboarding">
      <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700', color: palette.text }}>Your first 7 days</Text>
      <Text style={{ color: palette.text }}>Get oriented with a few quick wins. Your progress is private to your device.</Text>
      <View style={{ gap: 8 }}>
        {steps.map(s => (
          <Pressable key={s.id} accessibilityRole="checkbox" accessibilityState={{ checked: !!state.completed[s.id as Step] }} onPress={()=>toggle(s.id as Step)} style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: palette.muted, backgroundColor: state.completed[s.id as Step]? palette.card: palette.surface }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontWeight: '600', color: palette.text }}>{s.label}</Text>
            <Text style={{ color: palette.text, opacity: 0.8 }}>{s.hint}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ height: 1, backgroundColor: palette.muted, marginVertical: 8 }} />
      <Text style={{ fontWeight: '600', color: palette.text }}>Quick links</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Link href="/(tabs)/resources/evidence-locker" asChild>
          <Pressable accessibilityRole="button" style={chipStyle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}> <Text style={{ color: palette.text }}>Evidence Locker</Text></Pressable>
        </Link>
        <Link href="/(tabs)/resources" asChild>
          <Pressable accessibilityRole="button" style={chipStyle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}> <Text style={{ color: palette.text }}>Resources</Text></Pressable>
        </Link>
        <Link href="/(tabs)/advocacy" asChild>
          <Pressable accessibilityRole="button" style={chipStyle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}> <Text style={{ color: palette.text }}>Advocacy Hub</Text></Pressable>
        </Link>
        <Link href="/profile" asChild>
          <Pressable accessibilityRole="button" style={chipStyle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}> <Text style={{ color: palette.text }}>Profile</Text></Pressable>
        </Link>
        {Platform.OS !== 'web' && (
          <Link href="/modal" asChild>
            <Pressable accessibilityRole="button" style={chipStyle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}> <Text style={{ color: palette.text }}>Notifications</Text></Pressable>
          </Link>
        )}
      </View>
      <Pressable accessibilityRole="button" style={{ marginTop: 'auto', padding: 14, backgroundColor: palette.primary, borderRadius: 12 }} onPress={()=>router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={{ color: palette.onPrimary, textAlign: 'center', fontWeight: '700' }}>Done</Text>
      </Pressable>
    </View>
  );
}

// chip style moved into component to use palette tokens
