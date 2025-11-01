import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../../components/A11yPressable';
import { GapView } from '../../../../components/GapView';
import { createFaq, deleteFaq, subscribeFaqs, updateFaq } from '../../../../services/faqs';
import { useAppPalette } from '../../../../theme/usePalette';

export default function FaqEditor() {
  const palette = useAppPalette();
  const [faqs, setFaqs] = React.useState<any[]>([]);
  const [faqQ, setFaqQ] = React.useState('');
  const [faqA, setFaqA] = React.useState('');
  const [editingFaqId, setEditingFaqId] = React.useState<string | null>(null);

  React.useEffect(()=> {
    const unsub = subscribeFaqs(rows => setFaqs(rows));
    return () => unsub();
  }, []);

  return (
    <View>
      <Text style={{ color: palette.text, marginTop: 16, fontWeight: '700' }}>FAQs</Text>
      <Text style={{ color: palette.text }}>Create or edit FAQ entries (remote collection).</Text>
      <TextInput
        value={faqQ}
        onChangeText={setFaqQ}
        placeholder="Question"
        style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding:8, borderRadius:6, marginBottom:6 }}
      />
      <TextInput
        value={faqA}
        onChangeText={setFaqA}
        placeholder="Answer"
        multiline={true}
        style={{ borderWidth: StyleSheet.hairlineWidth, minHeight:70, borderColor: palette.muted, color: palette.text, padding:8, borderRadius:6, marginBottom:6 }}
      />
      <GapView style={{ flexDirection:'row', marginBottom: 8 }} gap={8}>
        <A11yPressable
          accessibilityLabel={editingFaqId? 'Update FAQ' : 'Create FAQ'}
          disabled={!faqQ.trim() || !faqA.trim()}
          onPress={async ()=> {
            try {
              if (editingFaqId) {
                await updateFaq(editingFaqId, { q: faqQ.trim(), a: faqA.trim() });
              } else {
                await createFaq({ q: faqQ.trim(), a: faqA.trim(), source: 'admin' });
              }
              setFaqQ(''); setFaqA(''); setEditingFaqId(null);
            } catch { Alert.alert('Failed','Could not save FAQ'); }
          }}
          style={{ paddingHorizontal:14, paddingVertical:10, backgroundColor: palette.primary, borderRadius:6, opacity: (!faqQ.trim() || !faqA.trim())?0.6:1 }}
        >
          <Text style={{ color: palette.onPrimary, fontWeight:'700' }}>{editingFaqId? 'Update' : 'Create'}</Text>
        </A11yPressable>
        {editingFaqId && (
          <A11yPressable
            accessibilityLabel="Cancel editing"
            onPress={()=> { setEditingFaqId(null); setFaqQ(''); setFaqA(''); }}
            style={{ paddingHorizontal:14, paddingVertical:10, backgroundColor: palette.surface, borderRadius:6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
          >
            <Text style={{ color: palette.text, fontWeight:'700' }}>Cancel</Text>
          </A11yPressable>
        )}
      </GapView>
      {faqs.map(f => (
        <View key={f.id} style={{ marginBottom:6, paddingBottom:6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted }}>
          <Text style={{ color: palette.text, fontWeight:'700', marginBottom:2 }}>{f.q}</Text>
          <Text style={{ color: palette.text, opacity:0.9 }}>{f.a}</Text>
          <GapView style={{ flexDirection:'row', marginTop:4 }} gap={8}>
            <A11yPressable
              accessibilityLabel="Edit FAQ"
              onPress={()=> { setEditingFaqId(f.id); setFaqQ(f.q); setFaqA(f.a); }}
              style={{ paddingHorizontal:10, paddingVertical:6, backgroundColor: palette.surface, borderRadius:6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
            >
              <Text style={{ color: palette.text, fontWeight:'700' }}>Edit</Text>
            </A11yPressable>
            <A11yPressable
              accessibilityLabel="Delete FAQ"
              onPress={()=> Alert.alert('Delete','Remove this FAQ?', [ { text:'Cancel' }, { text:'Delete', style:'destructive', onPress: async()=> { try { await deleteFaq(f.id); } catch { Alert.alert('Failed','Could not delete'); } } } ]) }
              style={{ paddingHorizontal:10, paddingVertical:6, backgroundColor: palette.surface, borderRadius:6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
            >
              <Text style={{ color: palette.text, fontWeight:'700' }}>Delete</Text>
            </A11yPressable>
          </GapView>
        </View>
      ))}
    </View>
  );
}
