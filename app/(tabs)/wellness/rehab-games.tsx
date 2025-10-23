import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import { HIT_SLOP_8 } from "../../../constants/A11Y";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useAppPalette } from "../../../theme/usePalette";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

function usePoints() {
  const [points, setPoints] = React.useState(0);
  React.useEffect(() => {
    (async () => {
      const raw = await AsyncStorage?.getItem?.("rehab_points");
      if (raw) setPoints(Number(raw) || 0);
    })();
  }, []);
  React.useEffect(() => {
    AsyncStorage?.setItem?.("rehab_points", String(points));
  }, [points]);
  return {
    points,
    add: (n: number) => setPoints((p) => p + n),
    reset: () => setPoints(0),
  };
}

export const options = { href: null };

export default function RehabGames() {
  // Info section for discoverability
  const openLearnMore = () => {
    // Example: open FAQ or resource link
    require('react-native').Linking.openURL('https://empowrapp.com/rehab-games-info');
  };
  // Add missing state hooks
  const [taps, setTaps] = React.useState(0);
  const [breaths, setBreaths] = React.useState(0);
  const [round, setRound] = React.useState(0);

  // Add markPlayedToday function
  const markPlayedToday = () => {
    // Could add logic to mark today's play, e.g. AsyncStorage or analytics
  };
  const [history, setHistory] = React.useState<any[]>([]);
  const HISTORY_KEY = 'rehab.history.v1';
  React.useEffect(()=>{ (async()=>{ try { const a = require('@react-native-async-storage/async-storage').default; const raw = await a.getItem(HISTORY_KEY); if (raw) setHistory(JSON.parse(raw)); } catch {} })(); },[]);
  const saveHistory = async (entry: any) => {
    const next = [entry, ...history].slice(0, 30);
    setHistory(next);
    try { const a = require('@react-native-async-storage/async-storage').default; await a.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
  };
  const exportHistory = async () => {
    try {
      const rows = [["date", "taps", "breaths", "sit-stand", "points"], ...history.map(h => [h.date, h.taps, h.breaths, h.round, h.points])];
      const csv = rows.map(r => r.map(x => `"${(x || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
      if (!baseDir) return;
      const path = `${baseDir}rehab_progress_${Date.now()}.csv`;
      await (FileSystem as any).writeAsStringAsync(path, csv, { encoding: (FileSystem as any).EncodingType?.UTF8 });
      if (Sharing?.isAvailableAsync && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Rehab Progress CSV' });
      } else {
        Alert.alert('Export ready', 'CSV saved to cache directory.');
      }
    } catch {
      Alert.alert("Export failed", "Could not share rehab progress.");
    }
  };
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Virtual Rehab Games");
  useFocusOnRefOnMount(titleRef);
  const { t } = useTranslation();
  const { points, add, reset } = usePoints();
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
        <View style={[s.card, { backgroundColor: palette.surface, marginBottom: 12 }]}> 
          <Text style={[s.cardTitle, { color: palette.primary }]}>How to Use Rehab Games</Text>
          <Text style={s.cardText}>
            These mini-games are designed to encourage gentle movement and support your rehab journey. Tap each button to log your progress. Always adapt to comfort and stop if pain increases.
          </Text>
          <A11yPressable
            onPress={openLearnMore}
            style={[s.button, { backgroundColor: palette.primary }]}
            accessibilityRole="link"
            accessibilityLabel="Learn more about rehab games"
            accessibilityHint="Opens a page with more information about these games"
            hitSlop={HIT_SLOP_8}
          >
            <Text style={s.buttonText}>Learn More</Text>
          </A11yPressable>
      </View>
      <A11yPressable
        onPress={exportHistory}
        style={[s.button, { marginBottom: 8 }]}
        accessibilityRole="button"
        accessibilityLabel="Export rehab progress as CSV"
        accessibilityHint="Shares your progress as a CSV file for tracking or sharing with your care team"
        hitSlop={HIT_SLOP_8}
      >
        <Text style={s.buttonText}>Export Progress (CSV)</Text>
      </A11yPressable>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t("wellness.rehab.title", "Virtual Rehab Games")}
      </Text>
      <Text style={s.subtitle}>
        {t(
          "wellness.rehab.subtitle",
          "Fun, accessible mini-games to encourage gentle movement and physio-style exercises. Always adapt to comfort and stop if pain increases.",
        )}
      </Text>
      <Text style={s.points}>Points: {points}</Text>
      <View style={s.card}>
        <Text style={s.cardTitle}>Reach & Tap</Text>
        <Text style={s.cardText}>
          Gently raise your arm and tap the button. Aim for 10 slow taps.
        </Text>
        <Text style={s.cardText}>Taps: {taps}</Text>
        <A11yPressable
          onPress={async () => {
            const np = taps + 1;
            setTaps(np);
            add(1);
            markPlayedToday();
            saveHistory({ date: new Date().toISOString().slice(0,10), taps: np, breaths, round, points: points+1 });
            if (np === 10) {
              Alert.alert("Great job", "You completed 10 taps!");
              try {
                await AsyncStorage?.setItem?.("achieve_first_steps", "1");
              } catch {}
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Tap to log reach & tap exercise"
          accessibilityHint="Logs a reach & tap exercise. Aim for 10 slow taps."
          style={s.button}
          hitSlop={HIT_SLOP_8}
        >
          <Text style={s.buttonText}>Tap</Text>
        </A11yPressable>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Breath Pacing</Text>
        <Text style={s.cardText}>
          Box breathing: inhale 4, hold 4, exhale 4, hold 4. Do 3 cycles.
        </Text>
        <Text style={s.cardText}>Cycles: {breaths}</Text>
        <A11yPressable
          onPress={async () => {
            const nb = breaths + 1;
            setBreaths(nb);
            add(2);
            markPlayedToday();
            saveHistory({ date: new Date().toISOString().slice(0,10), taps, breaths: nb, round, points: points+2 });
            if (nb === 3) {
              Alert.alert("Nice pacing", "Three breathing cycles complete.");
              try {
                await AsyncStorage?.setItem?.("achieve_calm_breather", "1");
              } catch {}
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Tap to log breath pacing exercise"
          accessibilityHint="Logs a breath pacing cycle. Complete 3 cycles for a milestone."
          style={s.button}
          hitSlop={HIT_SLOP_8}
        >
          <Text style={s.buttonText}>Complete cycle</Text>
        </A11yPressable>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Gentle Sit-to-Stand</Text>
        <Text style={s.cardText}>
          Stand up from a chair slowly and sit back down. 5 repetitions. Use
          supports as needed.
        </Text>
        <Text style={s.cardText}>Round: {round}/5</Text>
        <A11yPressable
          onPress={async () => {
            if (round < 5) {
              const nr = round + 1;
              setRound(nr);
              add(3);
              markPlayedToday();
              saveHistory({ date: new Date().toISOString().slice(0,10), taps, breaths, round: nr, points: points+3 });
              if (nr === 5) {
                Alert.alert(
                  "Milestone",
                  "Completed 5 sit-to-stand reps!",
                );
                try {
                  await AsyncStorage?.setItem?.("achieve_chair_hero", "1");
                } catch {}
              }
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Tap to log sit-to-stand exercise"
          accessibilityHint="Logs a sit-to-stand rep. Complete 5 reps for a milestone."
          style={s.button}
          hitSlop={HIT_SLOP_8}
        >
          <Text style={s.buttonText}>Mark rep</Text>
        </A11yPressable>
      </View>
      <A11yPressable
        onPress={() => {
          reset();
          setTaps(0);
          setBreaths(0);
          setRound(0);
        }}
        style={[s.button, {
          backgroundColor: palette.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: palette.muted,
        }]}
  accessibilityRole="button"
  accessibilityLabel="Reset all rehab progress"
  accessibilityHint="Resets all progress and counters for rehab games."
        hitSlop={HIT_SLOP_8}
      >
        <Text style={[s.buttonText, { color: palette.text }]}>Reset</Text>
      </A11yPressable>
      <Text style={[s.tip, { marginTop: 8 }]}>Tip: Celebrate small wins. Consistency beats intensity.</Text>
      {history.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Progress Chart (last 10 days)</Text>
          {history.slice(0,10).map((h,i) => (
            <View key={i} style={{ flexDirection:'row', alignItems:'center', marginBottom:4 }}>
              <Text style={{ color: palette.text, width: 90 }}>{h.date}</Text>
              <View style={{ height: 8, backgroundColor: palette.muted, borderRadius: 4, flex: 1 }}>
                <View style={{ width: `${Math.min(100, h.points*2)}%`, height: 8, backgroundColor: palette.primary, borderRadius: 4 }} />
              </View>
              <Text style={{ color: palette.text, marginLeft: 6 }}>{h.points} pts</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// Fix styles definition

function styles(palette: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "bold", color: palette.primary, marginBottom: 8 },
    subtitle: { fontSize: 16, color: palette.text, marginBottom: 12 },
    points: { fontSize: 16, color: palette.primary, marginBottom: 12 },
    card: { backgroundColor: palette.surface, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, // native shadow
      // Web box shadow replacement for deprecated shadow* props
      boxShadow: '0 2px 4px rgba(0,0,0,0.12)' },
    cardTitle: { fontSize: 18, fontWeight: "bold", color: palette.primary, marginBottom: 4 },
    cardText: { fontSize: 15, color: palette.text, marginBottom: 6 },
    button: { backgroundColor: palette.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18, alignItems: "center", marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    tip: { color: palette.text, opacity: 0.9 },
  });
}
