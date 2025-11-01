import { router, type Href } from "expo-router";
import React from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput
} from "react-native";

import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { channels as seedChannels } from "../../../data/community";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { trackEvent } from "../../../services/analyticsClient";
import { CommunityProvider, useCommunity } from "../../../store/community";
import { useAppPalette } from "../../../theme/usePalette";

function Inner() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t('advocacy.ask.title','Ask an Advocate'));
  useFocusOnRefOnMount(titleRef);
  const { createThread } = useCommunity();

  const [title, setTitle] = React.useState("");
  const [details, setDetails] = React.useState("");
  const topicChannels = seedChannels.filter((c) => c.type === "topic");
  const [channelId, setChannelId] = React.useState<string>("ch_topic_ask");

  const submit = () => {
    if(!title.trim()) { Alert.alert(t('advocacy.ask.missingTitleTitle','Title required'), t('advocacy.ask.missingTitleBody','Please enter a short title.')); return; }
    const ok = createThread(channelId, `${title} — ${details.slice(0, 120)}`, null);
    if (ok) {
      trackEvent('advocacy.ask.submitted',{ channelId });
      Alert.alert(t('advocacy.ask.submittedTitle','Submitted'), t('advocacy.ask.submittedBody','Your request has been posted. Community advocates may respond.'));
      const ch = seedChannels.find(c => c.id === channelId);
      const slug = ch?.slug ?? 'topic-ask-advocate';
      router.push((`/(tabs)/community/${slug}`) as Href);
    } else {
      Alert.alert(t('advocacy.ask.rateTitle','Slow down'), t('advocacy.ask.rateBody','Please wait a few seconds before posting again.'));
    }
  };

  return (
    <ResponsiveScreenWrapper 
      scrollable={true}
      testID="ask-advocate-screen"
    >
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('advocacy.ask.title','Ask an Advocate')}
      </Text>
      <Text style={styles.subtitle}>
        {t('advocacy.ask.subtitle','Briefly describe your issue. Do not include personal identifiers.')}
      </Text>

      <Text style={styles.label}>{t('advocacy.ask.category','Category')}</Text>
      <GapView
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 8,
        }}
        gap={8}
      >
        {topicChannels.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setChannelId(c.id)}
            style={[styles.chip, channelId === c.id && styles.chipActive]}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.chipText,
                channelId === c.id && styles.chipTextActive,
              ]}
            >
              {c.title}
            </Text>
          </Pressable>
        ))}
      </GapView>
      <Text style={styles.label}>{t('advocacy.ask.titleLabel','Title')}</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={t('advocacy.ask.titlePlaceholder','Short title')}
      />
      <Text style={styles.label}>{t('advocacy.ask.detailsLabel','Details')}</Text>
      <TextInput
        style={[styles.input, { minHeight: 100 }]}
        value={details}
        onChangeText={setDetails}
        multiline={true}
        placeholder={t('advocacy.ask.detailsPlaceholder','What happened? What help do you need?')}
      />

      <Pressable
        onPress={submit}
        style={styles.button}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{t('advocacy.ask.submit','Submit')}</Text>
      </Pressable>
    </ResponsiveScreenWrapper>
  );
}

export default function AskAdvocate() {
  return (
    <CommunityProvider>
      <Inner />
    </CommunityProvider>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    label: {
      color: palette.text,
      opacity: 0.95,
      marginTop: 8,
      marginBottom: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 10,
      color: palette.text,
    },
    button: {
      marginTop: 12,
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    chip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight: "700" },
  });
}
