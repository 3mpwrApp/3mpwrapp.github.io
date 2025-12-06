import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { touchTarget } from "../constants/A11Y";
import type { ResourceFormat, TextScale } from "../store/settings";
import { useSettings } from "../store/settings";
import { useAppPalette } from "../theme/usePalette";

import A11yPressable from "./A11yPressable";
import GapView from "./GapView";

export default function A11yQuickSettings() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const {
    highContrast,
    setHighContrast,
    textScale,
    setTextScale,
    dyslexiaFriendly,
    setDyslexiaFriendly,
    plainLanguage,
    setPlainLanguage,
    captionsPreferred,
    setCaptionsPreferred,
    resourcePreferredFormat,
    setResourcePreferredFormat,
  } = useSettings();

  const [open, setOpen] = React.useState(false);

  const cycleScale = () => {
    const next: Record<TextScale, TextScale> = {
      normal: "large",
      large: "xlarge",
      xlarge: "normal",
    };
    setTextScale(next[textScale]);
  };

  const iconColor = palette.text;

  return (
    <View>
      <A11yPressable
        onPress={() => setOpen((v) => !v)}
        accessibilityLabel={open ? "Close accessibility settings" : "Open accessibility settings"}
        style={({ pressed }) => [touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Ionicons name="accessibility-outline" size={20} color={iconColor} />
      </A11yPressable>

      {open && (
        <View style={styles.panel} accessibilityLabel="Accessibility settings" accessible={true} collapsable={false}>
          <Row
            icon="contrast-outline"
            label={highContrast ? "High contrast: On" : "High contrast: Off"}
            onPress={() => setHighContrast(!highContrast)}
          />
          <Row icon="resize-outline" label={`Text size: ${textScale}`} onPress={cycleScale} />
          <Row
            icon="book-outline"
            label={dyslexiaFriendly ? "Dyslexia font: On" : "Dyslexia font: Off"}
            onPress={() => setDyslexiaFriendly(!dyslexiaFriendly)}
          />
          <Row
            icon="reader-outline"
            label={plainLanguage ? "Plain language: On" : "Plain language: Off"}
            onPress={() => setPlainLanguage(!plainLanguage)}
          />
          <Row
            icon="chatbubble-ellipses-outline"
            label={captionsPreferred ? "Captions: On" : "Captions: Off"}
            onPress={() => setCaptionsPreferred(!captionsPreferred)}
          />
          <FormatRow
            value={resourcePreferredFormat}
            onChange={setResourcePreferredFormat}
          />
        </View>
      )}
    </View>
  );
}

function Row({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const palette = useAppPalette();
  return (
    <A11yPressable onPress={onPress} accessibilityLabel={label} style={({ pressed }) => [{ paddingVertical: 8, paddingHorizontal: 10 }, pressed && { opacity: 0.7 }]}>
      <GapView style={{ flexDirection: "row", alignItems: "center" }} gap={8}>
        <Ionicons name={icon} size={18} color={palette.text} />
        <Text style={{ color: palette.text }}>{label}</Text>
      </GapView>
    </A11yPressable>
  );
}

function FormatRow({ value, onChange }: { value: ResourceFormat; onChange: (v: ResourceFormat) => void }) {
  const palette = useAppPalette();
  const opts: ResourceFormat[] = ["text", "audio", "asl", "easy"];
  return (
    <View style={{ paddingVertical: 8, paddingHorizontal: 10 }}>
      <Text style={{ color: palette.text, fontWeight: "700", marginBottom: 6 }}>Preferred format</Text>
      <GapView style={{ flexDirection: "row", flexWrap: "wrap" }} gap={8}>
        {opts.map((opt) => (
          <A11yPressable
            key={opt}
            onPress={() => onChange(opt)}
            accessibilityLabel={`Set format to ${opt}`}
            style={({ pressed }) => [
              {
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: palette.muted,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 14,
                backgroundColor: value === opt ? palette.primary : "transparent",
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={{ color: value === opt ? palette.onPrimary : palette.text }}>
              {opt.toUpperCase()}
            </Text>
          </A11yPressable>
        ))}
      </GapView>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    panel: {
      position: "absolute",
      right: 12,
      top: 36,
      minWidth: 220,
      backgroundColor: palette.surface ?? palette.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 10,
      zIndex: 9999,
    },
  });
}
