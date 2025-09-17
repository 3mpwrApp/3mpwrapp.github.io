import React from 'react';
import { View, Text, Pressable, Modal, Platform } from 'react-native';
import { useAppPalette } from '../theme/usePalette';

type Props = {
  label: string;
  mode: 'date' | 'time';
  value?: string; // ISO for date (YYYY-MM-DD) or HH:MM for time
  onChange: (val: string) => void;
};

export default function DateTimeField({ label, mode, value, onChange }: Props) {
  const palette = useAppPalette();
  const [open, setOpen] = React.useState(false);
  const hasPicker = (() => {
    try { require('@react-native-community/datetimepicker'); return true; } catch { return false; }
  })();

  const dt = React.useMemo(() => {
    if (mode === 'date') {
      const d = value ? new Date(value) : new Date();
      if (isNaN(d.getTime())) return new Date();
      return d;
    } else {
      const now = new Date();
      if (!value || !/^\d{2}:\d{2}$/.test(value)) return now;
      const [hh, mm] = value.split(':').map((x) => Number(x));
      now.setHours(hh, mm, 0, 0);
      return now;
    }
  }, [value, mode]);

  const displayValue = React.useMemo(() => {
    if (mode === 'date') return (value ? new Date(value).toLocaleDateString() : 'Choose');
    return value || 'Choose';
  }, [value, mode]);

  return (
    <View style={{ marginTop: 8 }}>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          borderWidth: 1,
          borderColor: palette.muted,
          borderRadius: 6,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: palette.surface,
        }}
      >
        <Text style={{ color: palette.text, opacity: 0.8 }}>{label}</Text>
        <Text style={{ color: palette.text, fontWeight: '700', marginTop: 2 }}>{displayValue}</Text>
      </Pressable>
      {open && hasPicker && (
        <Modal transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={{ flex: 1, backgroundColor: '#0008', alignItems: 'center', justifyContent: 'center' }} onPress={() => setOpen(false)}>
            <View style={{ backgroundColor: palette.surface, padding: 12, borderRadius: 8, minWidth: 260 }}>
              {(() => {
                try {
                  const DateTimePicker = require('@react-native-community/datetimepicker').default;
                  return (
                    <DateTimePicker
                      value={dt}
                      mode={mode}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(_e: any, selected?: Date) => {
                        const d = selected || dt;
                        if (mode === 'date') {
                          const iso = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
                          onChange(iso);
                        } else {
                          const hh = String(d.getHours()).padStart(2, '0');
                          const mm = String(d.getMinutes()).padStart(2, '0');
                          onChange(`${hh}:${mm}`);
                        }
                        if (Platform.OS !== 'ios') setOpen(false);
                      }}
                      style={{ backgroundColor: palette.surface }}
                    />
                  );
                } catch { return null; }
              })()}
              <Pressable onPress={() => setOpen(false)} style={{ marginTop: 8, alignSelf: 'flex-end' }}>
                <Text style={{ color: palette.primary, fontWeight: '700' }}>Done</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

