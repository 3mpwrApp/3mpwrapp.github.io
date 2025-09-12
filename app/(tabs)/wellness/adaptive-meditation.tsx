import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import A11yPressable from "../../../components/A11yPressable";
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";

export const options = { href: null };

export default function AdaptiveMeditation() {
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
          Breathing Ã¢â‚¬â€œ 1 min {isPlaying ? "Ã¢â€“Â¶Ã¯Â¸Å½" : ""}
        </Text>
      </A11yPressable>
      <A11yPressable
        onPress={() => play("body")}
        style={[s.button, { marginTop: 8 }]}
      >
        <Text style={s.buttonText}>Body Scan Ã¢â‚¬â€œ 2 min</Text>
      </A11yPressable>
      <A11yPressable
        onPress={() => play("calm")}
        style={[s.button, { marginTop: 8 }]}
      >
        <Text style={s.buttonText}>Calm Reset Ã¢â‚¬â€œ 30 sec</Text>
      </A11yPressable>
      <Text style={[s.subtitle, { marginTop: 12 }]}>
        Note: For full audio programs, curate links in SelfÃ¢â‚¬â€˜Care Library.
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



