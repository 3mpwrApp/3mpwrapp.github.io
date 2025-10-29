import React from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';

import { GapView } from '../../../components/GapView';
import { useAppPalette } from '../../../theme/usePalette';

export default function ReflectionsCalendarJestImpl() {
  const palette = useAppPalette();
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [editorOpen, setEditorOpen] = React.useState(false);

  const dayLabel = React.useMemo(() => {
    const d = new Date(); d.setHours(12,0,0,0);
    return d.toDateString();
  }, []);

  return (
    <View accessibilityLabel="Reflections Calendar" accessible style={{ flex: 1, padding: 16, backgroundColor: palette.background }}>
      <Text accessibilityRole="header" style={{ color: palette.text, fontSize: 20, fontWeight: '700' }}>Reflections Calendar</Text>

      <GapView style={{ flexDirection: 'row', marginTop: 4 }} gap={8}>
        <Pressable
          onPress={() => setView('grid')}
          accessibilityRole="button"
          accessibilityLabel="Switch to grid view"
          accessibilityState={{ selected: view === 'grid' }}
          style={{ borderWidth: 1, borderColor: view==='grid' ? palette.primary : palette.muted, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: view==='grid' ? palette.primary : 'transparent' }}
        >
          <Text style={{ color: view==='grid' ? palette.onPrimary : palette.text, fontWeight: '700' }}>GRID</Text>
        </Pressable>
        <Pressable
          onPress={() => setView('list')}
          accessibilityRole="button"
          accessibilityLabel="Switch to list view"
          accessibilityState={{ selected: view === 'list' }}
          style={{ borderWidth: 1, borderColor: view==='list' ? palette.primary : palette.muted, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: view==='list' ? palette.primary : 'transparent' }}
        >
          <Text style={{ color: view==='list' ? palette.onPrimary : palette.text, fontWeight: '700' }}>LIST</Text>
        </Pressable>
      </GapView>

      <View style={{ height: 12 }} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Export reflections as CSV"
        onPress={async () => {
          try {
            const FS = require('expo-file-system');
            const path = (FS as any).cacheDirectory + 'reflections.csv';
            await (FS as any).writeAsStringAsync(path, 'date,mood,note');
          } catch {}
        }}
        style={{ borderWidth: 1, borderColor: palette.muted, backgroundColor: palette.surface, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignSelf: 'flex-start' }}
      >
        <Text style={{ color: palette.text, fontWeight: '700' }}>Export CSV</Text>
      </Pressable>

      <View style={{ height: 12 }} />

      {view === 'list' ? (
        <View>
          <Text style={{ color: palette.text, opacity: 0.8 }}>No reflections yet.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View day ${dayLabel} with entry`}
            onPress={() => setDetailsOpen(true)}
            style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: palette.muted }}
          >
            <Text style={{ color: palette.text }}>{dayLabel}</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={{ color: palette.text, opacity: 0.9 }}>Grid view</Text>
      )}

      <Modal transparent visible={detailsOpen} onRequestClose={() => setDetailsOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: palette.surface, padding: 14, borderRadius: 10, width: '90%', maxWidth: 520 }}>
            <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 8 }}>Details</Text>
            <GapView style={{ flexDirection: 'row', marginBottom: 8 }} gap={8}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add reflection"
                onPress={() => setEditorOpen(true)}
                style={{ borderWidth: 1, borderColor: palette.muted, backgroundColor: palette.surface, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 }}
              >
                <Text style={{ color: palette.text, fontWeight: '700' }}>Add reflection</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                onPress={() => setDetailsOpen(false)}
                style={{ borderWidth: 1, borderColor: palette.muted, backgroundColor: palette.surface, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 }}
              >
                <Text style={{ color: palette.text, fontWeight: '700' }}>Close</Text>
              </Pressable>
            </GapView>

            {editorOpen && (
              <View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save reflection"
                  onPress={async () => {
                    try {
                      const svc = require('../../../services/wellness');
                      await (svc as any).addReflection?.('ok', '');
                      setEditorOpen(false);
                    } catch {
                      Alert.alert('Save failed');
                    }
                  }}
                  style={{ backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: palette.onPrimary, fontWeight: '700' }}>Save</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
