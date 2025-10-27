import { useMemo, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import { useProfileLocal } from '../../../store/profileLocal';
import { useAppPalette } from '../../../theme/usePalette';

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return {
    input: { borderWidth:1, borderColor:palette.muted, padding:12, borderRadius:8, marginBottom:10, color:palette.text, minHeight:44 },
  } as const;
}

export default function LocalProfileSection() {
  const palette = useAppPalette();
  const s = useMemo(() => createStyles(palette), [palette]);
  const { profile, setProfile } = useProfileLocal();
  const [name, setName] = useState(profile.name ?? '');
  const [contact, setContact] = useState(profile.contact ?? '');
  const [province, setProvince] = useState(profile.province ?? '');
  return (
    <View>
      <Text style={{ color:palette.text, opacity:0.9, marginBottom:6 }}>Name</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholder='Your name' />
      <Text style={{ color:palette.text, opacity:0.9, marginBottom:6 }}>Contact (email/phone)</Text>
      <TextInput style={s.input} value={contact} onChangeText={setContact} placeholder='name at example dot com' />
      <Text style={{ color:palette.text, opacity:0.9, marginBottom:6 }}>Province (e.g., ON, QC)</Text>
      <TextInput style={s.input} value={province} onChangeText={setProvince} placeholder='ON' autoCapitalize='characters' maxLength={2} />
      <Button title='Save' onPress={()=> setProfile({ name, contact, province })} />
    </View>
  );
}
