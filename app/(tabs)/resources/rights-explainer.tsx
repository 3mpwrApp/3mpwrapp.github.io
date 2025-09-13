import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type Lang = 'en'|'fr'|'es';
type Region = 'canada'|'province'|'world';
type Province = 'ON'|'QC'|'BC'|'AB'|'MB'|'SK'|'NS'|'NB'|'NL'|'PE'|'YT'|'NT'|'NU';

const PROVINCES: Province[] = ['ON','QC','BC','AB','MB','SK','NS','NB','NL','PE','YT','NT','NU'];

export default function RightsExplainer() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [lang, setLang] = React.useState<Lang>('en');
  const [region, setRegion] = React.useState<Region>('canada');
  const [prov, setProv] = React.useState<Province>('ON');

  const sectionTitle = region === 'province' ? `${prov} – Provincial Rights` : region === 'canada' ? 'Canada – Federal Rights' : 'Global – International Rights';

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>Multi‑Language Rights Explainer</Text>
      <Text style={s.text}>Plain‑language summaries of basic rights. Select language and region.</Text>

      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 8 }}>
        {(['en','fr','es'] as Lang[]).map(l => (
          <Pressable key={l} onPress={()=>setLang(l)} style={[s.chip, lang===l&&s.chipActive]}>
            <Text style={{ color: lang===l? palette.onPrimary: palette.text, fontWeight:'700' }}>{l.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 8 }}>
        {(['canada','province','world'] as Region[]).map(r => (
          <Pressable key={r} onPress={()=>setRegion(r)} style={[s.chip, region===r&&s.chipActive]}>
            <Text style={{ color: region===r? palette.onPrimary: palette.text, fontWeight:'700' }}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {region==='province' && (
        <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 8 }}>
          {PROVINCES.map(p => (
            <Pressable key={p} onPress={()=>setProv(p)} style={[s.chip, prov===p&&s.chipActive]}>
              <Text style={{ color: prov===p? palette.onPrimary: palette.text, fontWeight:'700' }}>{p}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={[s.title,{ fontSize:18, marginTop: 12 }]}>{sectionTitle}</Text>
      <RightsContent lang={lang} region={region} province={prov} palette={palette} />
    </ScrollView>
  );
}

function RightsContent({ lang, region, province, palette }:{ lang:Lang; region:Region; province:Province; palette:any }) {
  const s = styles(palette);
  // Placeholder content. In future, hydrate from Firestore/remote or localized JSON.
  const blocks: Record<Lang,string[]> = {
    en: [
      '1. You have the right to reasonable accommodations at work and services (undue hardship applies to employers/service providers).',
      '2. You have the right to access medical records and request corrections.',
      '3. You can appeal benefit denials (e.g., Workers’ Comp, EI, CPP‑D) — strict deadlines apply.',
    ],
    fr: [
      '1. Vous avez droit à des mesures d’adaptation raisonnables au travail et dans les services (contrainte excessive pour l’employeur/fournisseur).',
      '2. Vous avez le droit d’accéder à vos dossiers médicaux et de demander des corrections.',
      '3. Vous pouvez contester les refus de prestations (ex. CNESST, AE, RPC‑I) — respectez les délais.',
    ],
    es: [
      '1. Tiene derecho a adaptaciones razonables en el trabajo y en servicios (carga excesiva para empleadores/proveedores).',
      '2. Tiene derecho a acceder a sus registros médicos y solicitar correcciones.',
      '3. Puede apelar rechazos de beneficios (p. ej., Compensación laboral, EI, CPP‑D) — hay plazos estrictos.',
    ],
  };
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={[s.text,{ fontWeight:'700' }]}>Language: {lang.toUpperCase()}</Text>
      <Text style={s.text}>Region: {region==='province'? province: region}</Text>
      {blocks[lang].map((t,i)=>(<Text key={i} style={s.text}>• {t}</Text>))}
      <Text style={[s.text,{ marginTop:8, opacity:0.8 }]}>This is a simplified explainer. Always check official sources for details.</Text>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  });
}

