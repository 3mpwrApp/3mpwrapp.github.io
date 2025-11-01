import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { interpretDream, useDreams } from '../../../services/wellness/dreams';
import { useAppPalette } from '../../../theme/usePalette';

export default function Dreams() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const { entries, add } = useDreams();
  const [text, setText] = React.useState('');
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.dreams.title','Dream Tracker & Interpreter')}</Text>
      <DisclaimerBanner type="medical" compact={true} />
      <TextInput style={s.input} placeholder={t('wellness.dreams.placeholder','Describe your dream...')} value={text} onChangeText={setText} multiline={true} />
      <Pressable hitSlop={HIT_SLOP_8} accessibilityRole="button" style={s.button} onPress={()=> { if (!text.trim()) return; add(text); setText(''); }}>
        <Text style={s.buttonText}>{t('common.save','Save')}</Text>
      </Pressable>
      <FlatList data={[...entries].reverse()} keyExtractor={(e)=> e.id} renderItem={({item}) => (
        <View style={s.card}>
          <Text style={{ color: palette.text, fontWeight:'700' }}>{new Date(item.ts).toLocaleString()}</Text>
          <Text style={{ color: palette.text, marginTop:4 }}>{item.text}</Text>
          <Text style={{ color: palette.text, opacity:0.8, marginTop:8 }}>{interpretDream(item.text)}</Text>
        </View>
      )} />
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    input:{ borderWidth:1, borderColor: palette.muted, borderRadius:8, padding:10, color: palette.text, minHeight:100 },
    button:{ backgroundColor: palette.primary, padding:10, borderRadius:8, alignItems:'center', marginTop:8 },
    buttonText:{ color: palette.onPrimary, fontWeight:'700' },
    card:{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, padding:12, marginTop:12 }
  });
}
