import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useEnergyAwareUI } from '../../../services/energyAwareUI';
import { useAppPalette } from '../../../theme/usePalette';

export default function EnergyAwareUIScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const energyUI = useEnergyAwareUI();
  const { config } = energyUI;

  const [autoAdjust, setAutoAdjust] = useState(true);
  const [learnPatterns, setLearnPatterns] = useState(true);
  const [resumableTasks, setResumableTasks] = useState<any[]>([]);

  useEffect(() => {
    energyUI.getResumableTasks().then(setResumableTasks);
    const interval = setInterval(() => {
      energyUI.getResumableTasks().then(setResumableTasks);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const energyStateIcons: Record<string, string> = {
    crashed: 'battery-dead',
    depleted: 'battery-charging',
    conserving: 'battery-half',
    baseline: 'battery-three-quarters',
    energized: 'battery-full',
    hyperfocus: 'flash',
    manic_warning: 'warning',
  };

  const energyStateColors: Record<string, string> = {
    crashed: palette.error,
    depleted: palette.warning,
    conserving: palette.warning,
    baseline: palette.success,
    energized: palette.success,
    hyperfocus: palette.primary,
    manic_warning: palette.error,
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Energy-Aware UI'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}> 
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.stateHeader}>
            <Ionicons
              name={energyStateIcons[config.currentEnergyState] as any}
              size={48}
              color={energyStateColors[config.currentEnergyState]}
            />
            <View style={styles.stateInfo}>
              <Text style={[styles.stateName, { color: palette.text }]}>
                {config.currentEnergyState.toUpperCase()}
              </Text>
              <Text style={[styles.stateDescription, { color: palette.textSecondary }]}>
                Current energy level
              </Text>
            </View>
          </View>

          <View style={[styles.progressBar, { backgroundColor: palette.muted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: '75%',
                  backgroundColor: energyStateColors[config.currentEnergyState],
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: palette.textSecondary }]}>
            75/100
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Active Adjustments</Text>

          <View style={styles.adjustmentRow}>
            <Text style={[styles.adjustmentLabel, { color: palette.textSecondary }]}>
              Button Size
            </Text>
            <Text style={[styles.adjustmentValue, { color: palette.text }]}>
              {config.buttonSize}
            </Text>
          </View>

          <View style={styles.adjustmentRow}>
            <Text style={[styles.adjustmentLabel, { color: palette.textSecondary }]}>Font Size</Text>
            <Text style={[styles.adjustmentValue, { color: palette.text }]}>
              {config.fontSize}
            </Text>
          </View>

          <View style={styles.adjustmentRow}>
            <Text style={[styles.adjustmentLabel, { color: palette.textSecondary }]}>
              Color Scheme
            </Text>
            <Text style={[styles.adjustmentValue, { color: palette.text }]}>
              {config.colorScheme}
            </Text>
          </View>

          <View style={styles.adjustmentRow}>
            <Text style={[styles.adjustmentLabel, { color: palette.textSecondary }]}>
              UI Complexity
            </Text>
            <Text style={[styles.adjustmentValue, { color: palette.text }]}>
              {config.uiComplexity}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Usage Patterns</Text>

          <View style={styles.patternRow}>
            <Ionicons name="finger-print" size={20} color={palette.textSecondary} />
            <Text style={[styles.patternLabel, { color: palette.textSecondary }]}>
              Taps per minute
            </Text>
            <Text style={[styles.patternValue, { color: palette.text }]}>24</Text>
          </View>

          <View style={styles.patternRow}>
            <Ionicons name="swap-vertical" size={20} color={palette.textSecondary} />
            <Text style={[styles.patternLabel, { color: palette.textSecondary }]}>Scroll Speed</Text>
            <Text style={[styles.patternValue, { color: palette.text }]}>180 px/s</Text>
          </View>

          <View style={styles.patternRow}>
            <Ionicons name="alert-circle" size={20} color={palette.textSecondary} />
            <Text style={[styles.patternLabel, { color: palette.textSecondary }]}>Error Rate</Text>
            <Text style={[styles.patternValue, { color: palette.text }]}>1.2 /min</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Resume-Later Tasks</Text>

          {resumableTasks.length === 0 ? (
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No saved tasks. Start a multi-step task to see it here.
            </Text>
          ) : (
            resumableTasks.map((task, index) => (
              <View key={index} style={[styles.taskCard, { borderColor: palette.border }]}>
                <Text style={[styles.taskTitle, { color: palette.text }]}>{task.taskType}</Text>
                <Text style={[styles.taskProgress, { color: palette.textSecondary }]}>
                  Progress: {(task.progress * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.taskTime, { color: palette.textSecondary }]}>
                  Last active: {new Date(task.lastActiveAt).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: palette.text }]}>Auto-Adjust UI</Text>
              <Text style={[styles.settingDescription, { color: palette.textSecondary }]}>
                Automatically adapt interface based on energy
              </Text>
            </View>
            <Switch value={autoAdjust} onValueChange={setAutoAdjust} />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: palette.text }]}>Learn Patterns</Text>
              <Text style={[styles.settingDescription, { color: palette.textSecondary }]}>
                Identify your low-energy times automatically
              </Text>
            </View>
            <Switch value={learnPatterns} onValueChange={setLearnPatterns} />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16, padding: 16, borderRadius: 12, elevation: 3 },
  stateHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stateInfo: { marginLeft: 16 },
  stateName: { fontSize: 24, fontWeight: 'bold' },
  stateDescription: { fontSize: 14, marginTop: 4 },
  progressBar: { height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%' },
  progressText: { fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  adjustmentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  adjustmentLabel: { fontSize: 14 },
  adjustmentValue: { fontSize: 14, fontWeight: '600' },
  patternRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  patternLabel: { fontSize: 14, marginLeft: 8, flex: 1 },
  patternValue: { fontSize: 14, fontWeight: '600' },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  taskCard: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8 },
  taskTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  taskProgress: { fontSize: 13, marginBottom: 2 },
  taskTime: { fontSize: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  settingDescription: { fontSize: 13 },
  bottomSpacer: { height: 32 },
});

