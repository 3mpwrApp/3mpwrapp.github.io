import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render } from '@testing-library/react';

import { MedicationsProvider, useMedications } from '../store/medications';

function Harness({ cb }: { cb: (api: ReturnType<typeof useMedications>) => void }) {
  const api = useMedications();
  cb(api);
  return null;
}

describe('medications store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('adds, updates and removes medication', async () => {
    let api: any;
    render(
      <MedicationsProvider>
        <Harness cb={(a) => (api = a)} />
      </MedicationsProvider>
    );

    await act(async () => {
      await api.addMedication({ id: '1', name: 'Med A', times: ['08:00'], enabled: true });
    });

    expect(api.medications.length).toBe(1);

    await act(async () => {
      await api.updateMedication('1', { name: 'Med B' });
    });

    expect(api.medications[0].name).toBe('Med B');

    await act(async () => {
      await api.removeMedication('1');
    });

    expect(api.medications.length).toBe(0);
  });
});
