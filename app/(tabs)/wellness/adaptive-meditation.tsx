import React from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import GapView from "../../../components/GapView";
import { HIT_SLOP_8 } from "../../../constants/A11Y";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useAppPalette } from "../../../theme/usePalette";

export const options = { href: null };

type MeditationType = "breath" | "body" | "calm";

interface MeditationOption {
  id: MeditationType;
  title: string;
  duration: string;
  icon: string;
  description: string;
  url: string;
}

const meditations: MeditationOption[] = [
  {
    id: "breath",
    title: "Breathing Exercise",
    duration: "1 min",
    icon: "🫁",
    description: "Simple breathing techniques to calm your mind",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "body",
    title: "Body Scan",
    duration: "2 min",
    icon: "🧘",
    description: "Progressive relaxation through your body",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "calm",
    title: "Calm Reset",
    duration: "30 sec",
    icon: "✨",
    description: "Quick reset for overwhelming moments",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

export default function AdaptiveMeditation() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Adaptive Meditation & Relaxation");
  useFocusOnRefOnMount(titleRef);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentPlaying, setCurrentPlaying] = React.useState<MeditationType | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const soundRef = React.useRef<any>(null);

  const openLearnMore = () => {
    require('react-native').Linking.openURL('https://empowrapp.com/adaptive-meditation-info')
      .catch(() => {
        Alert.alert('Error', 'Could not open link');
      });
  };

  const exportMeditations = async () => {
    try {
      const rows = [
        ["Type", "Label", "Duration", "URL"],
        ...meditations.map(m => [m.icon, m.title, m.duration, m.url]),
      ];
      const csv = rows.map(r => r.map(x => `"${(x || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
      if (!baseDir) {
        Alert.alert('Error', 'File system not available');
        return;
      }
      const path = `${baseDir}adaptive_meditations_${Date.now()}.csv`;
      await (FileSystem as any).writeAsStringAsync(path, csv, { encoding: (FileSystem as any).EncodingType?.UTF8 });
      if (Sharing?.isAvailableAsync && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Meditation Links CSV' });
      } else {
        Alert.alert('Export Complete', 'CSV saved successfully');
      }
    } catch (err) {
      console.error('Error exporting meditations:', err);
      Alert.alert('Export Failed', 'Could not export meditation links');
    }
  };

  const stopCurrentSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (err) {
        console.error('Error stopping sound:', err);
      } finally {
        soundRef.current = null;
      }
    }
  };

  const play = async (kind: MeditationType) => {
    try {
      setIsLoading(true);
      await stopCurrentSound();
      
      const { Audio } = await import("expo-av");
      const meditation = meditations.find(m => m.id === kind);
      if (!meditation) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri: meditation.url },
        { shouldPlay: true },
      );
      
      soundRef.current = sound;
      setCurrentPlaying(kind);
      setIsPlaying(true);
      setIsLoading(false);
      
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setCurrentPlaying(null);
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsLoading(false);
      setIsPlaying(false);
      setCurrentPlaying(null);
      Alert.alert(
        "Audio Unavailable",
        "Cannot stream audio. Please check your internet connection.",
      );
    }
  };

  const stop = async () => {
    setIsLoading(true);
    await stopCurrentSound();
    setIsPlaying(false);
    setCurrentPlaying(null);
    setIsLoading(false);
  };

  React.useEffect(() => {
    return () => {
      stopCurrentSound();
    };
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Adaptive Meditation & Relaxation
      </Text>
      <DisclaimerBanner type="medical" compact={true} />
      
      {/* Info Card */}
      <View style={s.infoCard}>
        <Text style={s.infoTitle}>💡 How It Works</Text>
        <Text style={s.infoText}>
          Tap a meditation below to begin. Audio is streamed and requires internet connection. Designed for chronic pain and limited mobility.
        </Text>
        <GapView style={{ marginTop: 12 }} gap={8}>
          <A11yPressable
            onPress={exportMeditations}
            style={s.secondaryButton}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel="Export meditation links as CSV"
          >
            <Text style={s.secondaryButtonText}>📊 Export Links (CSV)</Text>
          </A11yPressable>
          <A11yPressable
            onPress={openLearnMore}
            style={s.secondaryButton}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="link"
            accessibilityLabel="Learn more about adaptive meditation"
          >
            <Text style={s.secondaryButtonText}>ℹ️ Learn More</Text>
          </A11yPressable>
        </GapView>
      </View>

      {/* Meditation Options */}
      <Text style={s.sectionTitle}>Choose a Meditation</Text>
      {meditations.map((meditation) => (
        <View key={meditation.id} style={s.meditationCard}>
          <View style={s.meditationHeader}>
            <Text style={s.meditationIcon}>{meditation.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.meditationTitle}>{meditation.title}</Text>
              <Text style={s.meditationDuration}>{meditation.duration}</Text>
            </View>
            {currentPlaying === meditation.id && isPlaying && (
              <View style={s.playingIndicator}>
                <ActivityIndicator size="small" color={palette.success} />
              </View>
            )}
          </View>
          <Text style={s.meditationDescription}>{meditation.description}</Text>
          <GapView style={{ marginTop: 12 }} gap={8}>
            <A11yPressable
              onPress={() => play(meditation.id)}
              style={[
                s.playButton,
                currentPlaying === meditation.id && isPlaying && s.playButtonActive
              ]}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel={`Play ${meditation.title}`}
              disabled={isLoading || (isPlaying && currentPlaying !== meditation.id)}
            >
              {isLoading && currentPlaying === meditation.id ? (
                <ActivityIndicator size="small" color={palette.onPrimary} />
              ) : (
                <Text style={s.playButtonText}>
                  {currentPlaying === meditation.id && isPlaying ? '▶️ Playing...' : '▶️ Play'}
                </Text>
              )}
            </A11yPressable>
            {currentPlaying === meditation.id && isPlaying && (
              <A11yPressable
                onPress={stop}
                style={s.stopButton}
                hitSlop={HIT_SLOP_8}
                accessibilityRole="button"
                accessibilityLabel="Stop meditation"
              >
                <Text style={s.stopButtonText}>⏹️ Stop</Text>
              </A11yPressable>
            )}
          </GapView>
        </View>
      ))}

      {/* Footer Note */}
      <View style={[s.infoCard, { backgroundColor: palette.info + '22', marginTop: 8 }]}>
        <Text style={s.footerText}>
          💡 Tip: For full audio programs and custom playlists, visit the Self-Care Library
        </Text>
      </View>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: palette.background 
    },
    title: { 
      fontSize: 24, 
      fontWeight: "700", 
      color: palette.text,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: palette.text,
      marginBottom: 12,
    },
    infoCard: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: palette.text,
      marginBottom: 8,
    },
    infoText: {
      color: palette.text,
      opacity: 0.9,
      fontSize: 14,
      lineHeight: 20,
    },
    footerText: {
      color: palette.text,
      fontSize: 13,
      lineHeight: 18,
      fontStyle: 'italic',
    },
    meditationCard: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    meditationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    meditationIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    meditationTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: palette.text,
    },
    meditationDuration: {
      fontSize: 13,
      color: palette.text,
      opacity: 0.7,
      marginTop: 2,
    },
    meditationDescription: {
      color: palette.text,
      opacity: 0.85,
      fontSize: 14,
      lineHeight: 20,
    },
    playingIndicator: {
      marginLeft: 8,
    },
    playButton: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: "center",
    },
    playButtonActive: {
      backgroundColor: palette.success,
    },
    playButtonText: { 
      color: palette.onPrimary, 
      fontWeight: "700",
      fontSize: 15,
    },
    stopButton: {
      backgroundColor: palette.error,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: "center",
    },
    stopButtonText: {
      color: palette.onPrimary,
      fontWeight: "700",
      fontSize: 15,
    },
    secondaryButton: {
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    secondaryButtonText: {
      color: palette.text,
      fontWeight: "600",
      fontSize: 14,
    },
  });
}



