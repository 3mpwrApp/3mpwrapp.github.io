import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { forecastPain } from '../../../services/wellness/painForecast';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function PainForecast(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const [state, setState] = React.useState<any>(null);
  React.useEffect(()=>{ logView('wellness/pain-forecast'); (async()=>{ try{ setState(await forecastPain()); }catch{ setState({ avg7d:0, trend:'unknown', tips:[], next3d:[]}); } })(); },[]);
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.painForecast.title','Pain Forecast')}</Text>
      {state && (
        <View style={s.card}>
          <Text style={s.text}>{t('wellness.painForecast.avg7d','7‑day average pain: {{n}}',{ n: state.avg7d.toFixed ? state.avg7d.toFixed(1) : state.avg7d })}</Text>
          <Text style={s.text}>{t('wellness.painForecast.trend','Trend: {{t}}',{ t: state.trend })}</Text>
          <Text style={[s.text,{ marginTop:8, fontWeight:'700' }]}>{t('wellness.painForecast.next','Next 3 days')}</Text>
          {state.next3d.map((d:any)=>(<Text key={d.date} style={s.text}>• {d.date}: {d.expected}</Text>))}
          {state.tips.length? (<Text style={[s.text,{ marginTop:8, fontWeight:'700' }]}>{t('wellness.painForecast.tips','Tips')}</Text>): null}
          {state.tips.map((x:string,i:number)=>(<Text key={i} style={s.text}>• {x}</Text>))}
        </View>
      )}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>){
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    card:{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, padding:12 },
    text:{ color: palette.text, marginTop:6 }
  });
}
