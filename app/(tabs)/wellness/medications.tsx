import React from 'react';
import { Button, FlatList, Pressable, Text, View } from 'react-native';

import MedicationEditor from '../../../components/MedicationEditor';
import { A11Y_ROLES, HIT_SLOP_12 } from '../../../constants/a11y';
import { MedicationsProvider, useMedications } from '../../../store/medications';
import { useAppPalette } from '../../../theme/usePalette';

function MedicationsInner() {
  const { medications, loading, removeMedication, toggleMedication } = useMedications();
  const [editing, setEditing] = React.useState<string | null>(null);
  const [showEditor, setShowEditor] = React.useState(false);

  const palette = useAppPalette();

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Button title="Add Medication" onPress={() => { setEditing(null); setShowEditor(true); }} />
      <FlatList
        data={medications}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => { setEditing(item.id); setShowEditor(true); }} style={{ padding: 12, borderBottomWidth: 1 }} accessibilityRole={A11Y_ROLES.button} hitSlop={HIT_SLOP_12}>
            <Text style={{ fontWeight: '700' }}>{item.name} {item.dose ? `· ${item.dose}` : ''}</Text>
            <Text>{item.times.join(', ')}</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <Button title={item.enabled ? 'Disable' : 'Enable'} onPress={() => toggleMedication(item.id)} />
              <View style={{ width: 8 }} />
              <Button title="Remove" onPress={() => removeMedication(item.id)} />
            </View>
          </Pressable>
        )}
      />

      {showEditor && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: palette.background }}>
          <Button title="Close" onPress={() => setShowEditor(false)} />
          <MedicationEditor
            initial={medications.find((m) => m.id === editing) || undefined}
            onDone={() => setShowEditor(false)}
          />
        </View>
      )}
    </View>
  );
}

export default function MedicationsScreen() {
  return (
    <MedicationsProvider>
      <MedicationsInner />
    </MedicationsProvider>
  );
}
