import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  ScrollView,
} from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";

type Item = { label: string; url: string; description?: string };

export const options = { href: null };

export default function GriefSupport() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Grief + Identity Support");
  useFocusOnRefOnMount(titleRef);

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  const sections: { title: string; items: Item[] }[] = [
    {
      title: "Finding Identity After Injury",
      items: [
        {
          label: "Identity & Chronic Illness (Essay)",
          url: "https://www.psychologytoday.com/ca/blog/turning-straw-gold/201509/when-chronic-illness-changes-your-identity",
          description: "Reflecting on identity shifts.",
        },
        {
          label: "Purpose After Trauma (Guide)",
          url: "https://www.helpguide.org/articles/ptsd-trauma/coping-with-traumatic-events.htm",
          description: "Coping and purpose.",
        },
      ],
    },
    {
      title: "Peer & Community",
      items: [
        {
          label: "Injury/Disability Forums",
          url: "https://www.reddit.com/r/ChronicIllness/",
          description: "Peer experiences and support.",
        },
        {
          label: "Local Support Groups",
          url: "https://www.mentalhealthcommission.ca/English/find-your-way",
          description: "Find community resources.",
        },
      ],
    },
    {
      title: "Gentle Practices",
      items: [
        {
          label: "Writing Prompts for Loss",
          url: "https://grief.com/grief-the-6th-stage/",
          description: "Journal prompts for grief.",
        },
        {
          label: "Compassionate SelfÃ¢â‚¬â€˜Talk",
          url: "https://self-compassion.org/",
          description: "SelfÃ¢â‚¬â€˜kindness basics.",
        },
      ],
    },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Grief + Identity Support Hub
      </Text>
      <Text style={s.subtitle}>
        Resources for the loss of identity and purpose that can follow injury or
        disability.
      </Text>
      {sections.map((sec) => (
        <View
          key={sec.title}
          style={s.section}
          accessibilityLabel={`${sec.title} section`}
          accessible
        >
          <Text style={s.sectionTitle}>{sec.title}</Text>
          {sec.items.map((it) => (
            <Pressable
              key={it.label}
              onPress={() => open(it.url)}
              accessibilityRole="link"
              style={({ pressed }) => [s.linkRow, pressed && { opacity: 0.85 }]}
            >
              <Text style={s.linkLabel}>{it.label}</Text>
              {!!it.description && (
                <Text style={s.tipText}>{it.description}</Text>
              )}
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
    section: {
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.muted,
    },
    sectionTitle: {
      color: palette.text,
      fontWeight: "700",
      marginBottom: 8,
      fontSize: 18,
    },
    linkRow: { marginBottom: 10 },
    linkLabel: { color: palette.primary, fontWeight: "600", marginBottom: 2 },
    tipText: { color: palette.text, opacity: 0.9 },
  });
}
