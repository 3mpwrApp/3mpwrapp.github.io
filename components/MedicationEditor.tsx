import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import type { MedicationSchedule} from '../store/medications';
import { useMedications } from '../store/medications';

export default function MedicationEditor({
  initial,
  onDone,
}: {
  initial?: MedicationSchedule;
  onDone?: () => void;
}) {
  const { addMedication, updateMedication } = useMedications();
  const [name, setName] = React.useState(initial?.name || '');
  const [dose, setDose] = React.useState(initial?.dose || '');
  const [times, setTimes] = React.useState((initial?.times || ['08:00']).join(','));

  const save = async () => {
    const timesArr = times.split(',').map((s) => s.trim()).filter(Boolean);
    if (initial) {
      await updateMedication(initial.id, { name, dose, times: timesArr });
    } else {
      const m: MedicationSchedule = {
        id: `med-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`,
        name,
        dose,
        times: timesArr,
        enabled: true,
      };
      await addMedication(m);
    }
    onDone?.();
  };

  return (
    <View style={{ padding: 12 }}>
      <Text style={{ fontWeight: '700', marginBottom: 8 }}>Medication</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <TextInput placeholder="Dose (optional)" value={dose} onChangeText={setDose} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Text style={{ marginBottom: 4 }}>Times (comma separated, HH:MM)</Text>
      <TextInput placeholder="08:00, 20:00" value={times} onChangeText={setTimes} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />
      <Button title={initial ? 'Save' : 'Add Medication'} onPress={save} />
    </View>
  );
}
