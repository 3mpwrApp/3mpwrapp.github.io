export const options = { href: null };
import React from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Share } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useAppPalette } from "../../../../theme/usePalette";

type Task = { id: string; kind: 'petition' | 'social' | 'letters'; title: string; done?: boolean };

export default function CampaignRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useAppPalette();
  const s = styles(palette);
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: 'p1', kind: 'petition', title: 'Create petition + share link' },
    { id: 's1', kind: 'social', title: 'Hashtags + sample tweet/thread' },
    { id: 'l1', kind: 'letters', title: 'Letter-writing kit (targets + template)' },
  ]);
  const [newTask, setNewTask] = React.useState('');

  const toggle = (tid: string) => setTasks((prev) => prev.map(t => t.id===tid ? { ...t, done: !t.done } : t));
  const add = () => { if (!newTask.trim()) return; setTasks((prev) => [{ id: String(Date.now()), kind: 'social', title: newTask.trim() }, ...prev]); setNewTask(''); };
  const exportCSV = () => {
    const rows = [["kind","title","done"], ...tasks.map(t => [t.kind, t.title, t.done ? 'yes' : 'no'])];
    const csv = rows.map(r => r.map(x => `"${(x||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    Share.share({ message: csv, title: 'Campaign Room Tasks' }).catch(()=>{});
  };

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: `Campaign Room ${id ?? ''}` }} />
      <Text style={s.title}>Digital Protest & Campaign Room</Text>
      <Text style={s.subtitle}>Collaborate on petitions, social pushes, and letter drives.</Text>
      <TextInput style={s.input} value={newTask} onChangeText={setNewTask} placeholder="Add a task (e.g., contact media list)" />
      <Pressable onPress={add} style={s.button}><Text style={s.buttonText}>Add Task</Text></Pressable>
      <View style={{ height: 8 }} />
      {tasks.map((t) => (
        <Pressable key={t.id} onPress={() => toggle(t.id)} accessibilityRole="button" style={[s.task, t.done && { opacity: 0.6 }]}> 
          <Text style={s.taskText}>{t.done ? '✓ ' : '• '}{t.title} <Text style={{ opacity: 0.7 }}>({t.kind})</Text></Text>
        </Pressable>
      ))}
      <View style={{ height: 8 }} />
      <Pressable onPress={exportCSV} style={s.button}><Text style={s.buttonText}>Export Tasks (CSV)</Text></Pressable>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { color: palette.text, fontWeight: '700', fontSize: 20 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 10, color: palette.text, marginBottom: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    task: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    taskText: { color: palette.text },
  });
}

