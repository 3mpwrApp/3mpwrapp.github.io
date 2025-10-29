import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

import { useAppPalette } from '../../theme/usePalette';
import GapView from '../GapView';

export default function WellnessPrefsSection() {
  const palette = useAppPalette();
  const [tap, setTap] = useState<'details'|'editor'>('details');
  const [backdate, setBackdate] = useState(true);
  useEffect(()=>{ (async()=>{ try { const v = await AsyncStorage.getItem('reflections.tapAction'); if (v==='details'||v==='editor') setTap(v as any); const b = await AsyncStorage.getItem('reflections.useServerBackdate'); setBackdate(b!=='0'); } catch {} })(); },[]);
  const saveTap = async (next: 'details'|'editor') => { setTap(next); try { await AsyncStorage.setItem('reflections.tapAction', next); } catch {} };
  const saveBackdate = async (val: boolean) => { setBackdate(val); try { await AsyncStorage.setItem('reflections.useServerBackdate', val? '1':'0'); } catch {} };
  return (
    <View>
      <Text style={{ color: palette.text, opacity: 0.9, marginTop: 10, marginBottom: 6 }}>Reflections Calendar: default tap action</Text>
      <GapView style={{ flexDirection:'row', flexWrap:'wrap' }} gap={8}>
        <Button title={`Details ${tap==='details'?'✓':''}`} onPress={()=> saveTap('details')} />
        <Button title={`Editor ${tap==='editor'?'✓':''}`} onPress={()=> saveTap('editor')} />
      </GapView>
      <View style={{ height:10 }} />
      <Text style={{ color: palette.text, opacity: 0.9, marginTop: 10, marginBottom: 6 }}>Backdate via server (when adding past days)</Text>
      <Button title={backdate? 'Disable backdating' : 'Enable backdating'} onPress={()=> saveBackdate(!backdate)} />
      <Text style={{ color:palette.text, opacity:0.8, marginTop:6 }}>Tip: You can still change this from inside the calendar.</Text>
    </View>
  );
}
