import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { getCachedJSON } from '../../../services/cache';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type Entry = { date: string; pain?: string; tags?: string };

export default function TriggerDetector(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const [insights, setInsights] = React.useState<string[]>([]);
  React.useEffect(()=>{ 
    logView('wellness/trigger-detector'); 
    let mounted = true;
    (async()=>{
      const entries = (await getCachedJSON<Entry[]>("wellness_symptom_entries")) || [];
      const high = entries.filter(e => (parseFloat(e.pain||'0')||0) >= 6);
      const tags = ['stress','sleep','work','flare','med-change'];
      const out: string[] = [];
      for (const tTag of tags){
        const rate = high.length? high.filter(e => (e.tags||'').toLowerCase().includes(tTag)).length / high.length : 0;
        if (rate >= 0.4) out.push(`${t('wellness.triggers.maybe','Possible trigger')}: ${tTag} (${Math.round(rate*100)}%)`);
      }
      if (!out.length) out.push(t('wellness.triggers.none','No strong correlations found. Keep logging.'));
      if (mounted) setInsights(out);
    })();
    return () => { mounted = false; };
  },[]);
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.triggers.title','Trigger Detector')}</Text>
      <DisclaimerBanner type="medical" compact={true} />
      <Text style={s.desc}>{t('wellness.triggers.desc','Suggests possible correlations from recent logs.')}</Text>
      {insights.map((l,i)=>(<Text key={i} style={s.line}>• {l}</Text>))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>){
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    desc:{ color: palette.text, opacity:0.9, marginBottom:8 },
    line:{ color: palette.text, marginTop:6 }
  });
}
