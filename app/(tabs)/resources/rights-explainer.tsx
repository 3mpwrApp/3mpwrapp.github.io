import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';
import { announce as globalAnnounce } from '../../../utils/announce';

export const options = { href: null };

type Lang = 'en'|'fr'|'es';
type Region = 'canada'|'province'|'world';
type Province = 'ON'|'QC'|'BC'|'AB'|'MB'|'SK'|'NS'|'NB'|'NL'|'PE'|'YT'|'NT'|'NU';

const PROVINCES: Province[] = ['ON','QC','BC','AB','MB','SK','NS','NB','NL','PE','YT','NT','NU'];

export default function RightsExplainer() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const [lang, setLang] = React.useState<Lang>('en');
  const [region, setRegion] = React.useState<Region>('canada');
  const [prov, setProv] = React.useState<Province>('ON');
  const [showInfo, setShowInfo] = React.useState(true);
  const [lastAnnouncedKey, setLastAnnouncedKey] = React.useState('');

  const sectionTitle = React.useMemo(()=> region === 'province' ? `${prov} – ${t('rightsExplainer.provincial','Provincial Rights')}` : region === 'canada' ? t('rightsExplainer.federal','Canada – Federal Rights') : t('rightsExplainer.international','Global – International Rights'), [region, prov, t]);

  const announce = (key:string, msg:string) => {
    if(lastAnnouncedKey===key) return; setLastAnnouncedKey(key); globalAnnounce(msg);
  };

  React.useEffect(()=>{ announce('lang_'+lang, t('rightsExplainer.langChanged','Language changed')); }, [lang]);
  React.useEffect(()=>{ announce('region_'+region, t('rightsExplainer.regionChanged','Region changed')); }, [region]);
  React.useEffect(()=>{ if(region==='province') announce('prov_'+prov, t('rightsExplainer.provinceChanged','Province changed')); }, [prov, region]);

  const contentRef = React.useRef<Text>(null);
  React.useEffect(()=>{ setTimeout(()=>contentRef.current?.focus?.(), 40); }, [lang, region, prov]);

  const getCurrentText = () => {
    return buildBlocks()[lang].join('\n');
  };

  const copyCurrent = async () => {
    try { const mod = await import('expo-clipboard'); await mod.setStringAsync(sectionTitle + '\n\n' + getCurrentText()); Alert.alert(t('rightsExplainer.copied','Copied'), t('rightsExplainer.copiedBody','Current rights explainer copied.')); }
    catch { Alert.alert(t('rightsExplainer.clipboardMissingTitle','Clipboard not available'), t('rightsExplainer.clipboardMissingMsg','Install expo-clipboard in a dev build to enable copy.')); }
  };

  const shareCurrent = async () => {
    try { const FS = await import('expo-file-system'); const Share = await import('expo-sharing'); const body = sectionTitle + '\n' + new Date().toLocaleString() + '\n\n' + getCurrentText(); const path = FS.cacheDirectory + `rights_explainer_${Date.now()}.txt`; await FS.writeAsStringAsync(path, body); if(await Share.isAvailableAsync()) await Share.shareAsync(path); else Alert.alert(t('rightsExplainer.shareUnavailable','Share unavailable'), t('rightsExplainer.shareUnavailableBody','System share sheet not available.')); }
    catch { Alert.alert(t('rightsExplainer.shareError','Share failed'), t('rightsExplainer.shareErrorBody','Could not share rights explainer file.')); }
  };

  const reset = () => { setLang('en'); setRegion('canada'); setProv('ON'); globalAnnounce(t('rightsExplainer.resetAnnounce','Explainer reset to defaults')); };

  // buildBlocks() invoked directly where needed; no local variable retained (clears TS6133)

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }} accessibilityLabel={t('rightsExplainer.screenLabel','Rights Explainer screen')}>
      <View style={s.infoCard} accessibilityRole="summary" accessibilityLabel={t('rightsExplainer.howToUse','How to use Rights Explainer')}>
        <Pressable onPress={()=>setShowInfo(v=>!v)} accessibilityRole="button" accessibilityLabel={t('rightsExplainer.toggleInfo', showInfo? 'Hide instructions':'Show instructions')} style={s.infoHeader}>
          <Text style={s.infoTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsExplainer.infoTitle','How to Use')}</Text>
          <Text style={s.infoToggle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{showInfo ? t('rightsExplainer.hide','Hide'): t('rightsExplainer.show','Show')}</Text>
        </Pressable>
        {showInfo && (
          <View>
            <Text style={s.infoText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsExplainer.infoLine1','Select a language and region to view simplified rights statements.')}</Text>
            <Text style={s.infoText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsExplainer.infoLine2','Use Copy or Share to reuse the current list; Reset returns to English / Canada default.')}</Text>
            <Text style={s.infoText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsExplainer.infoLine3','This is an educational tool, not legal advice. Reference official sources for decisions.')}</Text>
          </View>
        )}
        <View style={s.actionRow}>
          <Pressable onPress={copyCurrent} accessibilityRole='button' accessibilityLabel={t('rightsExplainer.copyLabel','Copy rights explainer')} accessibilityHint={t('rightsExplainer.copyHint','Copies the current rights statements.')} style={[s.smallBtn,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}>
            <Text style={[s.smallBtnText,{ color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsExplainer.copy','Copy')}</Text>
          </Pressable>
            <Pressable onPress={shareCurrent} accessibilityRole='button' accessibilityLabel={t('rightsExplainer.shareLabel','Share rights explainer file')} accessibilityHint={t('rightsExplainer.shareHint','Opens system share sheet with a text file of current statements.')} style={[s.smallBtn,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}>
            <Text style={[s.smallBtnText,{ color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsExplainer.share','Share')}</Text>
          </Pressable>
          <Pressable onPress={reset} accessibilityRole='button' accessibilityLabel={t('rightsExplainer.resetLabel','Reset explainer')} accessibilityHint={t('rightsExplainer.resetHint','Restores default language and region.')} style={[s.smallBtn,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}>
            <Text style={[s.smallBtnText,{ color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsExplainer.reset','Reset')}</Text>
          </Pressable>
        </View>
      </View>
      <Text style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsExplainer.heading','Multi‑Language Rights Explainer')}</Text>
      <Text style={s.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsExplainer.subhead','Plain‑language summaries of basic rights. Select language and region.')}</Text>

      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 8 }}>
        {(['en','fr','es'] as Lang[]).map(l => (
          <Pressable key={l} onPress={()=>setLang(l)} accessibilityRole='button' accessibilityState={{ selected: lang===l }} accessibilityLabel={t('rightsExplainer.langChip','Language ' + l.toUpperCase())} style={[s.chip, lang===l&&s.chipActive]}>
            <Text style={{ color: lang===l? palette.onPrimary: palette.text, fontWeight:'700' }} maxFontSizeMultiplier={MAX_FONT_SCALE}>{l.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 8 }}>
        {(['canada','province','world'] as Region[]).map(r => (
          <Pressable key={r} onPress={()=>setRegion(r)} accessibilityRole='button' accessibilityState={{ selected: region===r }} accessibilityLabel={t('rightsExplainer.regionChip', `Region ${r}`)} style={[s.chip, region===r&&s.chipActive]}>
            <Text style={{ color: region===r? palette.onPrimary: palette.text, fontWeight:'700' }} maxFontSizeMultiplier={MAX_FONT_SCALE}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {region==='province' && (
        <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 8 }}>
          {PROVINCES.map(p => (
            <Pressable key={p} onPress={()=>setProv(p)} accessibilityRole='button' accessibilityState={{ selected: prov===p }} accessibilityLabel={t('rightsExplainer.provinceChip','Province '+p)} style={[s.chip, prov===p&&s.chipActive]}>
              <Text style={{ color: prov===p? palette.onPrimary: palette.text, fontWeight:'700' }} maxFontSizeMultiplier={MAX_FONT_SCALE}>{p}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text ref={contentRef as any} accessibilityRole='header' style={[s.title,{ fontSize:18, marginTop: 12 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{sectionTitle}</Text>
      <RightsContent lang={lang} region={region} province={prov} palette={palette} />
    </ScrollView>
  );
}

function RightsContent({ lang, region, province, palette }:{ lang:Lang; region:Region; province:Province; palette:any }) {
  const s = styles(palette);
  const blocks = buildBlocks();
  return (
    <View style={{ marginTop: 8 }} accessibilityLabel='Rights statements list' accessible>
      <Text style={[s.text,{ fontWeight:'700' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Language: {lang.toUpperCase()}</Text>
      <Text style={s.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>Region: {region==='province'? province: region}</Text>
      {blocks[lang].map((t,i)=>(<Text key={i} style={s.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>• {t}</Text>))}
      <Text style={[s.text,{ marginTop:8, opacity:0.8 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>This is a simplified explainer. Always check official sources for details.</Text>
    </View>
  );
}

function buildBlocks(): Record<Lang,string[]> {
  return {
    en: [
      '1. You have the right to reasonable accommodations at work and services (undue hardship applies to employers/service providers).',
      '2. You have the right to access medical records and request corrections.',
      '3. You can appeal benefit denials (e.g., Workers\' Comp, EI, CPP‑D) — strict deadlines apply.',
      '4. You have the right to be free from discrimination based on disability (human rights codes).',
      '5. You can request plain‑language communications and accessible formats (where feasible).',
    ],
    fr: [
      '1. Vous avez droit à des mesures d’adaptation raisonnables au travail et dans les services (contrainte excessive pour l’employeur/fournisseur).',
      '2. Vous avez le droit d’accéder à vos dossiers médicaux et de demander des corrections.',
      '3. Vous pouvez contester les refus de prestations (ex. CNESST, AE, RPC‑I) — respectez les délais.',
      '4. Droit à l’égalité sans discrimination liée au handicap (codes des droits de la personne).',
      '5. Droit à des communications en langage clair et formats accessibles (dans la mesure du possible).',
    ],
    es: [
      '1. Tiene derecho a adaptaciones razonables en el trabajo y en servicios (carga excesiva para empleadores/proveedores).',
      '2. Tiene derecho a acceder a sus registros médicos y solicitar correcciones.',
      '3. Puede apelar rechazos de beneficios (p. ej., Compensación laboral, EI, CPP‑D) — hay plazos estrictos.',
      '4. Derecho a la igualdad sin discriminación por discapacidad (códigos de derechos humanos).',
      '5. Puede solicitar lenguaje sencillo y formatos accesibles (cuando sea posible).',
    ],
  };
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    infoCard: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface, padding:12, borderRadius:10, marginBottom:12 },
    infoHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
    infoTitle: { color: palette.primary, fontWeight:'700', fontSize:16 },
    infoToggle: { color: palette.text, fontSize:12 },
    infoText: { color: palette.text, marginTop:4 },
    actionRow: { flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:8 },
    smallBtn: { backgroundColor: palette.primary, paddingHorizontal:14, paddingVertical:10, borderRadius:8 },
    smallBtnText: { color: palette.onPrimary, fontWeight:'700' },
  });
}
