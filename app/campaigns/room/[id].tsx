import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import { useAuth } from "../../../context/AuthContext";
import { getCachedJSON, setCachedJSON } from "../../../services/cache";
import {
    fsRoomAcceptInvite,
    fsRoomAddTask,
    fsRoomCreateInvite,
    fsRoomEnsureMeta,
    fsRoomSetNotes,
    fsRoomSubscribe,
    fsRoomToggleTask,
} from "../../../services/firestore";
import { useAppPalette } from "../../../theme/usePalette";

type Task = {
  id: string;
  kind: "petition" | "social" | "letters";
  title: string;
  done?: boolean;
};

export const options = { href: null };

export default function CampaignRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const palette = useAppPalette();
  const s = styles(palette);
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: "p1", kind: "petition", title: "Create petition + share link" },
    { id: "s1", kind: "social", title: "Hashtags + sample tweet/thread" },
    {
      id: "l1",
      kind: "letters",
      title: "Letter-writing kit (targets + template)",
    },
  ]);
  const [newTask, setNewTask] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (user?.uid && id) fsRoomEnsureMeta(String(id), user.uid);
    (async () => {
      const savedTasks = await getCachedJSON<Task[]>(
        `campaign_room_${id}_tasks`,
      );
      if (savedTasks) setTasks(savedTasks);
      const savedNotes = await getCachedJSON<string>(
        `campaign_room_${id}_notes`,
      );
      if (savedNotes) setNotes(savedNotes);
    })();
  }, [id]);
  React.useEffect(() => {
    try {
      const params = new URLSearchParams((globalThis as any)?.location?.search ?? "");
      const token = params.get("token");
      if (token && user?.uid && id) {
        fsRoomAcceptInvite(String(id), token, user.uid).then((ok) => {
          if (ok) Alert.alert("Joined", "You are now a moderator for this room.");
        });
      }
    } catch {}
  }, [user?.uid, id]);
  React.useEffect(() => {
    setCachedJSON(`campaign_room_${id}_tasks`, tasks);
  }, [id, tasks]);
  React.useEffect(() => {
    setCachedJSON(`campaign_room_${id}_notes`, notes);
    fsRoomSetNotes(String(id || ""), notes);
  }, [id, notes]);

  const toggle = async (tid: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === tid ? { ...t, done: !t.done } : t)),
    );
    const t = tasks.find((x) => x.id === tid);
    if (t) fsRoomToggleTask(String(id || ""), tid, !t.done);
  };
  const add = async () => {
    if (!newTask.trim()) return;
    const task = {
      id: String(Date.now()),
      kind: "social" as const,
      title: newTask.trim(),
    };
    setTasks((prev) => [task as any, ...prev]);
    setNewTask("");
    fsRoomAddTask(String(id || ""), task);
  };

  React.useEffect(() => {
    let unsub: any = null;
    (async () => {
      try {
        const sub = await fsRoomSubscribe(String(id || ""), {
          onTasks: (list) => setTasks(list as any),
          onNotes: (txt) => setNotes((prev) => (prev === txt ? prev : txt)),
        });
        unsub = sub.unsubscribe;
      } catch {}
    })();
    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, [id]);
  const exportCSV = () => {
    const rows = [
      ["kind", "title", "done"],
      ...tasks.map((t) => [t.kind, t.title, t.done ? "yes" : "no"]),
    ];
    const csv = rows
      .map((r) => r.map((x) => `"${(x || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    Share.share({ message: csv, title: "Campaign Room Tasks" }).catch(() => {});
  };
  const shareRoom = () => {
    const url = `https://empowr.app/campaigns/room/${id}`;
    Share.share({
      title: "Campaign Room",
      message: `Join our campaign room: ${url}`,
      url,
    }).catch(() => {});
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Stack.Screen options={{ title: `Campaign Room ${id ?? ""}` }} />
      <Text style={s.title}>Digital Protest & Campaign Room</Text>
      <Text style={s.subtitle}>
        Collaborate on petitions, social pushes, and letter drives.
      </Text>
      <TextInput
        style={s.input}
        value={newTask}
        onChangeText={setNewTask}
        placeholder="Add a task (e.g., contact media list)"
      />
      <A11yPressable onPress={add} style={s.button}>
        <Text style={s.buttonText}>Add Task</Text>
      </A11yPressable>
      <View style={{ height: 8 }} />
      {tasks.map((t) => (
        <A11yPressable
          key={t.id}
          onPress={() => toggle(t.id)}
          style={[s.task, t.done && { opacity: 0.6 }]}
        >
          <Text style={s.taskText}>
            {t.done ? "✓ " : "• "}
            {t.title} <Text style={{ color: palette.textSecondary }}>({t.kind})</Text>
          </Text>
        </A11yPressable>
      ))}
      <View style={{ height: 8 }} />
      <A11yPressable onPress={exportCSV} style={s.button}>
        <Text style={s.buttonText}>Export Tasks (CSV)</Text>
      </A11yPressable>
      <View style={{ height: 8 }} />
  <A11yPressable onPress={shareRoom} style={s.button}>
    <Text style={s.buttonText}>Share Room Link</Text>
  </A11yPressable>
  <A11yPressable
    onPress={async () => {
      const token = await fsRoomCreateInvite(String(id || ""));
      if (!token) return Alert.alert("Invite", "Unable to create invite.");
      const url = `${String((globalThis as any)?.location?.origin || "https://empowr.app")}/campaigns/room/${id}?token=${token}`;
      Share.share({ message: `Join as moderator: ${url}`, url, title: "Invite" }).catch(() => {});
    }}
    style={[s.button, { marginTop: 8 }]}
  >
    <Text style={s.buttonText}>Invite Moderator</Text>
  </A11yPressable>
      <View style={{ height: 12 }} />
      <Text style={s.title}>Shared Notes</Text>
      <TextInput
        style={[s.input, { minHeight: 120 }]}
        value={notes}
        onChangeText={setNotes}
        multiline={true}
        placeholder="Shared notes: announce dates, media contacts, progress, links"
      />
      <A11yPressable
        onPress={async () => {
          try {
            const mod = await import("expo-clipboard");
            await mod.setStringAsync(notes);
            Alert.alert("Copied", "Notes copied.");
          } catch {}
        }}
        style={s.button}
      >
        <Text style={s.buttonText}>Copy Notes</Text>
      </A11yPressable>
      <A11yPressable
        onPress={() =>
          Share.share({ message: notes, title: "Campaign Room Notes" }).catch(
            () => {},
          )
        }
        style={[s.button, { marginTop: 8 }]}
      >
        <Text style={s.buttonText}>Share Notes</Text>
      </A11yPressable>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { color: palette.text, fontWeight: "700", fontSize: 20 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 10,
      color: palette.text,
      marginBottom: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    task: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    taskText: { color: palette.text },
  });
}
