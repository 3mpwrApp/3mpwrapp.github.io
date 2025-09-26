import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useAppPalette } from "../../../theme/usePalette";

export const options = { href: null };

export default function AdaptiveMeditation() {
  // Info card for discoverability
  const openLearnMore = () => {
    require('react-native').Linking.openURL('https://empowrapp.com/adaptive-meditation-info');
  };
  // Export/share meditation links
  const exportMeditations = async () => {
    try {
      const rows = [
        ["Type", "Label", "URL"],
        ["Breathing", "Breathing – 1 min", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"],
        ["Body Scan", "Body Scan – 2 min", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"],
        ["Calm Reset", "Calm Reset – 30 sec", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"],
      ];
      const csv = rows.map(r => r.map(x => `"${(x || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
      if (!baseDir) return;
      const path = `${baseDir}adaptive_meditations_${Date.now()}.csv`;
      await (FileSystem as any).writeAsStringAsync(path, csv, { encoding: (FileSystem as any).EncodingType?.UTF8 });
      if (Sharing?.isAvailableAsync && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Meditation Links CSV' });
      }
    } catch {
      // Optionally show error
    }
  };
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Adaptive Meditation & Relaxation");
  useFocusOnRefOnMount(titleRef);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const soundRef = React.useRef<any>(null);
  const play = async (kind: "breath" | "body" | "calm") => {
    try {
      const { Audio } = await import("expo-av");
      const urls: Record<string, string> = {
        breath: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        body: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        calm: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      };
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
        setIsPlaying(false);
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: urls[kind] },
        { shouldPlay: true },
      );
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
    } catch {
      Alert.alert(
        "Audio unavailable",
        "Streaming not available in this build.",
      );
    }
  };

  return (
    <View style={s.container}>
      <View style={{ backgroundColor: palette.surface, borderRadius: 10, marginBottom: 12, padding: 12 }}>
        <Text style={[s.title, { color: palette.primary }]}>How to Use Adaptive Meditation</Text>
        <Text style={s.subtitle}>
          Tap a button below for a short guided meditation. Audio is streamed and may require internet. You can export the links or learn more about meditation.
        </Text>
        <A11yPressable
          onPress={exportMeditations}
          style={[s.button, { backgroundColor: palette.primary, marginBottom: 6 }]}
          accessibilityRole="button"
          accessibilityLabel="Export meditation links as CSV"
          accessibilityHint="Shares the meditation audio links as a CSV file for tracking or sharing."
        >
          <Text style={[s.buttonText, { color: palette.onPrimary }]}>Export Meditation Links (CSV)</Text>
        </A11yPressable>
        <A11yPressable
          onPress={openLearnMore}
          style={[s.button, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
          accessibilityRole="link"
          accessibilityLabel="Learn more about adaptive meditation"
          accessibilityHint="Opens a page with more information about meditation and relaxation."
        >
          <Text style={[s.buttonText, { color: palette.primary }]}>Learn More</Text>
        </A11yPressable>
      </View>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Adaptive Meditation & Relaxation
      </Text>
      <Text style={s.subtitle}>
        Gentle guidance for chronic pain and limited mobility.
      </Text>
      <A11yPressable onPress={() => play("breath")} style={s.button}>
        <Text style={s.buttonText}>
          Breathing – 1 min {isPlaying ? "▶️" : ""}
        </Text>
      </A11yPressable>
      <A11yPressable
        onPress={() => play("body")}
        style={[s.button, { marginTop: 8 }]} 
        accessibilityRole="button"
        accessibilityLabel="Play body scan meditation"
        accessibilityHint="Plays a 2-minute guided body scan."
      >
        <Text style={s.buttonText}>Body Scan – 2 min</Text>
      </A11yPressable>
      <A11yPressable
        onPress={() => play("calm")}
        style={[s.button, { marginTop: 8 }]} 
        accessibilityRole="button"
        accessibilityLabel="Play calm reset meditation"
        accessibilityHint="Plays a 30-second calming reset."
      >
        <Text style={s.buttonText}>Calm Reset – 30 sec</Text>
      </A11yPressable>
      <Text style={[s.subtitle, { marginTop: 12 }]}> 
        Note: For full audio programs, curate links in Self–Care Library.
      </Text>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9 },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
  });
}



