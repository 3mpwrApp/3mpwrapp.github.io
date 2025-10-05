import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { useBlocks } from '../../../store/blocks';
import { useAppPalette } from '../../../theme/usePalette';

export default function CommunitySafety() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { blocked, blockUser, unblockUser } = useBlocks();
  const [uid, setUid] = React.useState('');
  return (
    <View style={s.container}>
      <Text style={s.title}>Community Safety</Text>
      <Text style={s.text}>Manage your blocked users. Blocking hides content and prevents DMs from those users. Coming soon: report and moderation tools.</Text>
      <View style={{ flexDirection:'row', gap:8, marginTop: 8 }}>
        <TextInput value={uid} onChangeText={setUid} placeholder="User ID" placeholderTextColor={palette.text+'77'} style={[s.input,{ flex:1 }]} />
        <A11yPressable accessibilityRole="button" accessibilityLabel="Block user" hitSlop={HIT_SLOP_8} onPress={async()=>{ if (uid.trim()) { await blockUser(uid.trim()); setUid(''); } }} style={s.button}>
          <Text style={s.buttonText}>Block</Text>
        </A11yPressable>
      </View>
      <FlatList
        data={blocked}
        keyExtractor={(i) => i}
        renderItem={({ item }) => (
          <View style={s.row}>
            <Text style={s.rowText}>{item}</Text>
            <A11yPressable accessibilityRole="button" accessibilityLabel={`Unblock ${item}`} onPress={()=>unblockUser(item)} hitSlop={HIT_SLOP_8} style={[s.button,{ paddingVertical:6 }]}>
              <Text style={s.buttonText}>Unblock</Text>
            </A11yPressable>
          </View>
        )}
        ListEmptyComponent={<Text style={s.text}>No blocked users</Text>}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 8 },
    button: { backgroundColor: palette.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, alignItems:'center' },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    row: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    rowText: { color: palette.text },
  });
}
