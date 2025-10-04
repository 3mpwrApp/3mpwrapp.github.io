import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useAppPalette } from '../../../theme/usePalette';

const provinces = ['ON','QC','BC','AB','MB','SK','NS','NB','NL','PE','YT','NT','NU'] as const;
const issues = ['CPP-D','EI','WSIB','ODSP','AISH','SAID'] as const;

const links: Record<string, { deadline: string; url: string; }> = {
  'ON:CPP-D': { deadline: '90 days from decision', url: 'https://www.canada.ca/en/services/benefits/publicpensions/cpp/cpp-disability-benefit/after-you-apply.html' },
  'ON:EI': { deadline: '30 days from decision', url: 'https://www.canada.ca/en/services/benefits/ei/ei-regular-benefit/after.html' },
  'QC:CPP-D': { deadline: '90 days', url: 'https://www.canada.ca/fr/services/prestations/pensionsrpc/rpc-invalidite.html' },
  'BC:WSIB': { deadline: '6 months typical', url: 'https://www.worksafebc.com/' },
};

export default function PrepareAppeal(){
  const palette = useAppPalette();
  const [prov, setProv] = React.useState<typeof provinces[number]>('ON');
  const [issue, setIssue] = React.useState<typeof issues[number]>('CPP-D');
  const key = `${prov}:${issue}`;
  const meta = links[key as keyof typeof links];

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }} accessibilityLabel="Prepare to appeal">
      <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700' }}>Prepare to Appeal</Text>
      <Text>Pick your province and benefit to see deadlines, steps, and official links. This is a starting point—always confirm details with the official site.</Text>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: '600' }}>Province or Territory</Text>
        <Picker selectedValue={prov} onValueChange={(v: typeof provinces[number])=>setProv(v)}>
          {provinces.map(p => <Picker.Item key={p} label={p} value={p} />)}
        </Picker>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: '600' }}>Benefit or Program</Text>
        <Picker selectedValue={issue} onValueChange={(v: typeof issues[number])=>setIssue(v)}>
          {issues.map(i => <Picker.Item key={i} label={i} value={i} />)}
        </Picker>
      </View>

      {meta ? (
        <View style={{ padding: 12, borderWidth: 1, borderColor: palette.muted, borderRadius: 10, backgroundColor: palette.card, gap: 6 }}>
          <Text style={{ fontWeight: '600' }}>Estimated deadline</Text>
          <Text>{meta.deadline}</Text>
          {/* External URL: use asChild with Pressable and handle via Linking.openURL to satisfy types */}
          <Link href={{ pathname: meta.url as any }} asChild>
            <Pressable accessibilityRole="link" style={{ paddingVertical: 10 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ color: palette.primary, fontWeight: '600' }}>Open official guidance</Text>
            </Pressable>
          </Link>
        </View>
      ): (
        <Text>No guidance found yet for this selection. We're expanding coverage.</Text>
      )}

      <View style={{ height: 1, backgroundColor: palette.muted, marginVertical: 10 }} />
      <Text style={{ fontWeight: '600' }}>Export plan</Text>
      <Text>You can add these steps to your Evidence Locker as a private note.</Text>
      <Link href="/(tabs)/resources/evidence-locker" asChild>
        <Pressable accessibilityRole="button" style={{ marginTop: 8, padding: 12, backgroundColor: palette.primary, borderRadius: 10 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ color: palette.onPrimary, textAlign: 'center', fontWeight: '700' }}>Open Evidence Locker</Text>
        </Pressable>
      </Link>
    </View>
  );
}