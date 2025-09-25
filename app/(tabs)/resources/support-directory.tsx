import React from "react";
import {
    FlatList,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { supportOrgs } from "../../../data/support";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useSettings } from "../../../store/settings";
import { useAppPalette } from "../../../theme/usePalette";

export const options = { href: null };

export default function SupportDirectory() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t('advocacy.support.title','Support Directory'));
  useFocusOnRefOnMount(titleRef);
  const { province } = useSettings();
  const filtered = React.useMemo(
    () =>
      province
        ? supportOrgs.filter((o) => o.province === province)
        : supportOrgs,
    [province],
  );
  const [suggestion, setSuggestion] = React.useState("");
  const AsyncStorageRef = React.useRef<any>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const mod = await import("@react-native-async-storage/async-storage");
        AsyncStorageRef.current = mod.default;
      } catch {}
    })();
  }, []);
  return (
    <View
      style={styles.container}
  accessibilityLabel={t('advocacy.support.screenLabel','Support directory screen')}
      accessible
    >
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('advocacy.support.title','Support Directory')}
      </Text>
      <Text style={styles.subtitle}>
        {t('advocacy.support.subtitle','Organizations that may help with claims, accommodations, and advocacy.')}
      </Text>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.province}
              {item.accessible ? ` • ${t('advocacy.support.accessible','Accessible')}` : ''}
            </Text>
            {!!item.phone && (
              <Text style={styles.meta}>{t('advocacy.support.phoneIcon','☎')} {item.phone}</Text>
            )}
            {!!item.url && (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={t('advocacy.support.openWebsiteLabel','Open {{name}} website',{ name: item.name })}
                onPress={() => Linking.openURL(item.url!)}
              >
                <Text
                  style={[styles.meta, { textDecorationLine: "underline" }]}
                >
                  {t('advocacy.support.website','Website')}
                </Text>
              </Pressable>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingTop: 8 }}
      />
      <View style={{ marginTop: 12 }}>
        <Text style={styles.subtitle}>{t('advocacy.support.suggestHeader','Suggest a correction')}</Text>
        <TextInput
          value={suggestion}
          onChangeText={setSuggestion}
          placeholder={t('advocacy.support.suggestPlaceholder','Org ID and your suggestion')}
          placeholderTextColor={palette.text + "77"}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('advocacy.support.submitSuggestion','Submit suggestion')}
          onPress={async () => {
            const AsyncStorage = AsyncStorageRef.current;
            if (!suggestion.trim() || !AsyncStorage) return;
            try {
              const key = "support:suggestions:v1";
              const cur = await AsyncStorage.getItem(key);
              const list = cur ? JSON.parse(cur) : [];
              list.push({
                ts: Date.now(),
                suggestion: suggestion.trim(),
                province,
              });
              await AsyncStorage.setItem(key, JSON.stringify(list));
              setSuggestion("");
            } catch {}
          }}
          style={({ pressed }) => [
            {
              backgroundColor: palette.primary,
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: "center",
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={{ color: palette.onPrimary, fontWeight: "700" }}>
            {t('common.submit','Submit')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginVertical: 8 },
    row: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    name: { color: palette.text, fontWeight: "600" },
    meta: { color: palette.text, opacity: 0.85 },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 10,
      color: palette.text,
    },
  });
}
