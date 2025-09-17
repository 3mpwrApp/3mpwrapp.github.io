import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";

const SECTIONS = [
  {
    title: "Human Rights & Duty to Accommodate",
    items: [
      {
        label: "What is the duty to accommodate?",
        url: "https://www.chrc-ccdp.gc.ca/en/resources/what-duty-accommodate",
      },
      {
        label: "Ontario Human Rights Commission",
        url: "https://www.ohrc.on.ca/",
      },
    ],
  },
  {
    title: "Accessibility Laws",
    items: [
      { label: "Accessibility (Canada)", url: "https://accessible.canada.ca/" },
      {
        label: "AODA (Ontario)",
        url: "https://www.ontario.ca/page/accessibility-laws",
      },
    ],
  },
  {
    title: "Disability Benefits",
    items: [
      {
        label: "CPPÃ¢â‚¬â€˜D",
        url: "https://www.canada.ca/en/services/benefits/publicpensions/cpp/cpp-disability-benefit.html",
      },
      {
        label: "Employment Standards (ON)",
        url: "https://www.ontario.ca/document/your-guide-employment-standards-act-0",
      },
    ],
  },
];

export const options = { href: null };

export default function PolicySimple() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Policy Made Simple");
  useFocusOnRefOnMount(titleRef);
  const open = (url: string) => Linking.openURL(url).catch(() => {});
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Policy Made Simple
      </Text>
      <Text style={s.subtitle}>
        EasyÃ¢â‚¬â€˜read guides to accessibility, human rights, and benefits.
      </Text>
      {SECTIONS.map((sec) => (
        <View key={sec.title} style={s.card}>
          <Text style={s.cardTitle}>{sec.title}</Text>
          {sec.items.map((it) => (
            <Pressable
              key={it.label}
              onPress={() => open(it.url)}
              accessibilityRole="link"
            >
              <Text style={s.link}>{it.label}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      backgroundColor: palette.surface,
      marginTop: 8,
    },
    cardTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    link: { color: palette.primary, fontWeight: "700", marginBottom: 6 },
  });
}
