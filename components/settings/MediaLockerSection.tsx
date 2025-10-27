import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { useSettings } from '../../store/settings';
import { useAppPalette } from '../../theme/usePalette';

export default function MediaLockerSection() {
  const palette = useAppPalette();
  const [thumbs, setThumbs] = useState(true);
  const { youtubeOpenPreference, setYoutubeOpenPreference } = useSettings();
  useEffect(()=>{ (async()=>{ try { const v = await AsyncStorage.getItem('locker.videoThumbnails'); setThumbs(v!=='0'); } catch {} })(); },[]);
  const save = async (val:boolean) => { setThumbs(val); try { await AsyncStorage.setItem('locker.videoThumbnails', val? '1':'0'); } catch {} };
  return (
    <View>
      <Text style={{ color: palette.text, opacity:0.9, marginTop:10, marginBottom:6 }}>Video thumbnails (cloud videos)</Text>
      <A11yPressable onPress={()=> save(!thumbs)} style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 10, alignSelf:'flex-start' }}>
        <Text style={{ color: palette.text, fontWeight:'700' }}>{thumbs? 'Disable thumbnails' : 'Enable thumbnails'}</Text>
      </A11yPressable>
      <Text style={{ color:palette.text, opacity:0.8, marginTop:6 }}>When enabled, the app may request thumbnails from YouTube or an optional server (if configured).</Text>
      <View style={{ height:12 }} />
      <Text style={{ color: palette.text, opacity:0.9, marginTop:10, marginBottom:6 }}>Open YouTube links in</Text>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
        {(['ask','app','browser'] as const).map(mode => (
          <A11yPressable
            key={mode}
            accessibilityRole='button'
            accessibilityState={{ selected: youtubeOpenPreference === mode }}
            onPress={() => setYoutubeOpenPreference(mode)}
            style={{ paddingHorizontal:12, paddingVertical:8, borderRadius:8, borderWidth:1, borderColor: youtubeOpenPreference === mode ? palette.primary : palette.muted, backgroundColor: youtubeOpenPreference === mode ? palette.primary : 'transparent', minHeight:44, alignItems:'center', justifyContent:'center' }}
          >
            <Text style={{ color: youtubeOpenPreference === mode ? palette.onPrimary : palette.text, fontWeight:'600' }}>
              {mode === 'ask' ? 'Ask' : mode === 'app' ? 'YouTube App' : 'Browser'}
            </Text>
          </A11yPressable>
        ))}
      </View>
    </View>
  );
}
