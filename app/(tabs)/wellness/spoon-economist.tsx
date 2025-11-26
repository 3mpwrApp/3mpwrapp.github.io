import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useSpoonEconomist } from '../../../services/spoonEconomist';
import { useAppPalette } from '../../../theme/usePalette';

export default function SpoonEconomistScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const spoons = useSpoonEconomist();
  const { account } = spoons;

  const [showCustomTaskModal, setShowCustomTaskModal] = useState(false);
  const [customTaskName, setCustomTaskName] = useState('');
  const [customTaskCost, setCustomTaskCost] = useState('');
  const [monthlyReport, setMonthlyReport] = useState<any>(null);

  useEffect(() => {
    const now = new Date();
    spoons.getMonthlyReport(now.getFullYear(), now.getMonth() + 1).then(setMonthlyReport);
  }, []);

  const spendTask = async (taskName: string, cost: number) => {
    await spoons.spendSpoons(taskName, cost);
  };

  const borrowSpoons = async (amount: number) => {
    await spoons.borrowSpoons(amount);
  };

  const addCustomTask = async () => {
    const cost = parseInt(customTaskCost);
    if (customTaskName && !isNaN(cost)) {
      await spendTask(customTaskName, cost);
      setShowCustomTaskModal(false);
      setCustomTaskName('');
      setCustomTaskCost('');
    }
  };

  const QUICK_TASKS = [
    { name: 'Shower', cost: 2 },
    { name: 'Get Dressed', cost: 1 },
    { name: 'Cook Meal', cost: 4 },
    { name: 'Groceries', cost: 6 },
    { name: 'Laundry', cost: 3 },
    { name: 'Dishes', cost: 2 },
    { name: 'Doctor Appointment', cost: 8 },
    { name: 'Social Event', cost: 7 },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Spoon Economist'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.budgetHeader}>
            <Text style={[styles.budgetTitle, { color: palette.text }]}>Today's Spoon Budget</Text>
            <Text style={[styles.budgetAmount, { color: palette.primary }]}>
              {account?.currentSpoons || 0}/{account?.todayAllocated || 12} 🥄
            </Text>
          </View>

          <View style={styles.spoonVisual}>
            {Array.from({ length: account?.todayAllocated || 12 }).map((_, index) => (
              <Text key={index} style={[styles.spoonIcon, { opacity: index < (account?.currentSpoons || 0) ? 1 : 0.3 }]}>
                🥄
              </Text>
            ))}
          </View>
        </View>

        {account && account.currentSpoons < 3 && account.currentSpoons > 0 && (
          <View style={[styles.warningCard, { backgroundColor: palette.warningBackground }]}>
            <Ionicons name="warning" size={24} color={palette.warning} />
            <Text style={[styles.warningText, { color: palette.warning }]}>
              Low energy! Only {account.currentSpoons} spoons left today.
            </Text>
          </View>
        )}

        {account && account.currentSpoons === 0 && (
          <View style={[styles.warningCard, { backgroundColor: palette.errorBackground }]}>
            <Ionicons name="alert-circle" size={24} color={palette.error} />
            <Text style={[styles.warningText, { color: palette.error }]}>
              Depleted! Consider resting or borrowing spoons.
            </Text>
          </View>
        )}

        {account && account.debtSpoons > 0 && (
          <View style={[styles.card, { backgroundColor: palette.errorBackground }]}>
            <View style={styles.debtHeader}>
              <Ionicons name="warning" size={24} color={palette.error} />
              <Text style={[styles.debtTitle, { color: palette.error }]}>Energy Debt</Text>
            </View>

            <Text style={[styles.debtAmount, { color: palette.error }]}>
              {account.debtSpoons.toFixed(1)} spoons owed
            </Text>
            <Text style={[styles.debtDescription, { color: palette.warning }]}>
              Compound interest: 50% per day
            </Text>
            <Text style={[styles.debtDescription, { color: palette.warning }]}>
              Auto-repaying at 30% of daily allocation
            </Text>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Quick Tasks</Text>

          <View style={styles.taskGrid}>
            {QUICK_TASKS.map((task) => (
              <Pressable
                key={task.name}
                style={[styles.taskButton, { backgroundColor: palette.primary + '20', borderColor: palette.primary }]}
                onPress={() => spendTask(task.name, task.cost)}
              >
                <Text style={[styles.taskName, { color: palette.text }]}>{task.name}</Text>
                <Text style={[styles.taskCost, { color: palette.primary }]}>{task.cost} 🥄</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.customButton, { backgroundColor: palette.surface, borderColor: palette.border }]}
            onPress={() => setShowCustomTaskModal(true)}
          >
            <Ionicons name="add-circle" size={20} color={palette.primary} />
            <Text style={[styles.customButtonText, { color: palette.primary }]}>Custom Task</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Borrow Spoons</Text>
          <Text style={[styles.sectionDescription, { color: palette.textSecondary }]}>
            Borrow from tomorrow at 50% interest (compounds daily)
          </Text>

          <View style={styles.borrowButtons}>
            <Pressable
              style={[styles.borrowButton, { backgroundColor: palette.error }]}
              onPress={() => borrowSpoons(2)}
            >
              <Text style={[styles.borrowButtonText, { color: palette.onPrimary }]}>+2 🥄</Text>
            </Pressable>
            <Pressable
              style={[styles.borrowButton, { backgroundColor: palette.error }]}
              onPress={() => borrowSpoons(5)}
            >
              <Text style={[styles.borrowButtonText, { color: palette.onPrimary }]}>+5 🥄</Text>
            </Pressable>
            <Pressable
              style={[styles.borrowButton, { backgroundColor: palette.error }]}
              onPress={() => borrowSpoons(10)}
            >
              <Text style={[styles.borrowButtonText, { color: palette.onPrimary }]}>+10 🥄</Text>
            </Pressable>
          </View>
        </View>

        {monthlyReport && monthlyReport.topTasks.length > 0 && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Monthly Report</Text>

            <View style={styles.reportRow}>
              <Text style={[styles.reportLabel, { color: palette.textSecondary }]}>Top Task</Text>
              <Text style={[styles.reportValue, { color: palette.text }]}>
                {monthlyReport.topTasks[0]?.taskId || 'N/A'}
              </Text>
            </View>

            <View style={styles.reportRow}>
              <Text style={[styles.reportLabel, { color: palette.textSecondary }]}>Rest Days</Text>
              <Text style={[styles.reportValue, { color: palette.text }]}>
                {monthlyReport.restDays || 0}
              </Text>
            </View>

            <View style={styles.reportRow}>
              <Text style={[styles.reportLabel, { color: palette.textSecondary }]}>Debt Days</Text>
              <Text style={[styles.reportValue, { color: palette.text }]}>
                {monthlyReport.debtDays || 0}
              </Text>
            </View>
          </View>
        )}

        <Modal visible={showCustomTaskModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>Custom Task</Text>

              <TextInput
                style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
                placeholder="Task name"
                placeholderTextColor={palette.textSecondary}
                value={customTaskName}
                onChangeText={setCustomTaskName}
              />

              <TextInput
                style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
                placeholder="Spoon cost (1-12)"
                placeholderTextColor={palette.textSecondary}
                keyboardType="numeric"
                value={customTaskCost}
                onChangeText={setCustomTaskCost}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: palette.border }]}
                  onPress={() => setShowCustomTaskModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: palette.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: palette.primary }]}
                  onPress={addCustomTask}
                >
                  <Text style={[styles.modalButtonText, { color: palette.onPrimary }]}>Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16, padding: 16, borderRadius: 12, elevation: 3 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  budgetTitle: { fontSize: 18, fontWeight: '600' },
  budgetAmount: { fontSize: 20, fontWeight: 'bold' },
  spoonVisual: { flexDirection: 'row', flexWrap: 'wrap' },
  spoonIcon: { fontSize: 24, marginRight: 4 },
  warningCard: { margin: 16, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  warningText: { fontSize: 14, marginLeft: 12, flex: 1 },
  debtHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  debtTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  debtAmount: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  debtDescription: { fontSize: 14, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  sectionDescription: { fontSize: 14, marginBottom: 16 },
  taskGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  taskButton: { width: '48%', padding: 12, borderRadius: 8, borderWidth: 1 },
  taskName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  taskCost: { fontSize: 13 },
  customButton: { padding: 12, borderRadius: 8, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  customButtonText: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  borrowButtons: { flexDirection: 'row', gap: 8 },
  borrowButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  borrowButtonText: { fontSize: 14, fontWeight: '600' },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reportLabel: { fontSize: 14 },
  reportValue: { fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', gap: 8 },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { fontSize: 14, fontWeight: '600' },
  bottomSpacer: { height: 32 },
});


