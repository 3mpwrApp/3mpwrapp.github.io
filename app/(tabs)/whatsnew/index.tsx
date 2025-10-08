import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ContrastToggle from "../../../components/ContrastToggle";
import SettingsLink from "../../../components/SettingsLink";
import { whatsnew as defaultWN } from "../../../data/whatsnew";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { subscribeToActivityFeed } from "../../../services/activity";
import {
  addLocalWhatsNew,
  getLocalWhatsNew, getWhatsNewSplit, setLocalWhatsNew
} from "../../../services/localContent";
import { useTextScale } from "../../../theme/typography";
import { useAppPalette } from "../../../theme/usePalette";
import type { AnyActivityEvent } from "../../../types/activity";

export default function WhatsNewScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t("whatsNew.title", "What’s New"));
  useFocusOnRefOnMount(titleRef);

  const now = React.useMemo(() => new Date(), []);
  // Track last-seen timestamp to badge unread items
  const [lastSeen, setLastSeen] = React.useState<string | null>(null);
  const AsyncStorageRef = React.useRef<any>(null);
  const [items, setItems] = React.useState(defaultWN);
  const [activity, setActivity] = React.useState<AnyActivityEvent[]>([]);
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  React.useEffect(() => {
    (async () => {
      try {
        const mod = await import("@react-native-async-storage/async-storage");
        AsyncStorageRef.current = mod.default;
      } catch {}
  const local = await getLocalWhatsNew();
  // Merge, then auto-archive items older than 30 days by marking a transient flag (computed at render)
  if (local.length) setItems([...local, ...defaultWN]);
      const AsyncStorage = AsyncStorageRef.current;
      if (AsyncStorage) {
        try {
          const seen = await AsyncStorage.getItem("whatsnew:lastSeen:v1");
          if (seen) setLastSeen(seen);
        } catch {}
      }
    })();
  }, []);

  // Ensure auto-generated feed is merged with defaults and local, and older items archived in UI
  React.useEffect(() => {
    (async () => {
      try {
        const { current } = await getWhatsNewSplit();
        // Keep current + archived accessible; here we merge into items for display grouping already below
        // We only set items to current list; archived will still show via sections based on date checks
        if (current?.length) setItems(current);
      } catch {}
    })();
  }, []);

  // Real-time activity subscription
  React.useEffect(() => {
    const unsub = subscribeToActivityFeed(evts => {
      setActivity(evts);
    }, { limit: 120 });
    return () => unsub();
  }, []);

  // Map activity events to display items (light transformation)
  const activityItems = React.useMemo(() => {
    return activity.map(a => ({
      id: a.id || `act-${a.ts}-${a.type}`,
      title: readableTitle(a),
      summary: readableSummary(a),
      date: new Date(a.ts).toISOString()
    }));
  }, [activity]);

  // Mark as seen when visiting this tab
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const mod = await import("@react-native-async-storage/async-storage");
          const AsyncStorage = mod.default;
          await AsyncStorage.setItem("whatsnew:lastSeen:v1", new Date().toISOString());
        } catch {}
      })();
    }, []),
  );
  const daysSince = (d: string) => (now.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24);
  const isWithin30Days = (d: string) => daysSince(d) <= 30;
  const isUnread = (d: string) =>
    lastSeen ? new Date(d).getTime() > new Date(lastSeen).getTime() : true;
  const combined = [...activityItems, ...items];
  const recent = combined.filter((i) => isWithin30Days(i.date));
  const older = combined.filter((i) => !isWithin30Days(i.date));

  // Persist auto-archive state for local items: keep only last 90 days of local entries to prevent unbounded growth
  React.useEffect(() => {
    (async () => {
      try {
        // Only operate on locally-added items (we can detect these by id prefix we assign in this screen)
        const localOnly = items.filter(it => it.id.startsWith('wn-'));
        const within90 = localOnly.filter(it => daysSince(it.date) <= 90);
        if (within90.length !== localOnly.length) {
          const keepIds = new Set(within90.map(i => i.id));
          const merged = items.filter(i => keepIds.has(i.id));
          setItems(merged);
          await setLocalWhatsNew(merged.filter(i => i.id.startsWith('wn-')));
        }
      } catch {}
    })();
  }, [items]);
  const sections = [
    ...(recent.length ? [{ title: t("whatsNew.new", "New"), data: recent }] : []),
    ...(older.length ? [{ title: t("whatsNew.archive", "Archive"), data: older }] : []),
  ];

  return (
    <View
      style={styles.container}
      accessibilityLabel="What's New screen"
      accessible
    >
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t("whatsNew.title", "What’s New")}
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <Text style={styles.subtitle}>
        {t(
          "whatsNew.subtitle",
          "Latest updates & live activity (bookmarks, petitions, resources). Older than 30 days move to Archive.",
        )}
      </Text>
      <View style={{ marginBottom: 8 }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder={t("whatsNew.addTitle", "Add title")}
          placeholderTextColor={palette.text}
        />
        <TextInput
          value={summary}
          onChangeText={setSummary}
          style={styles.input}
          placeholder={t("whatsNew.addSummary", "Add summary")}
          placeholderTextColor={palette.text}
        />
        <Pressable
          disabled={!title.trim() || !summary.trim()}
          onPress={async () => {
            const item = {
              id: `wn-${Date.now()}`,
              title: title.trim(),
              summary: summary.trim(),
              date: new Date().toISOString(),
            };
            await addLocalWhatsNew(item);
            setItems((prev) => [item, ...prev]);
            setTitle("");
            setSummary("");
          }}
          accessibilityRole="button"
          accessibilityLabel={t("whatsNew.addA11y", "Add what’s new")}
          style={({ pressed }) => [
            styles.button,
            (!title.trim() || !summary.trim() || pressed) && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.buttonText}>{t("whatsNew.addBtn", "Add")}</Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("whatsNew.markAllReadA11y", "Mark all as read")}
        onPress={async () => {
          const newest = items.reduce(
            (acc, cur) => Math.max(acc, new Date(cur.date).getTime()),
            0,
          );
          const AsyncStorage = AsyncStorageRef.current;
          if (AsyncStorage && newest) {
            await AsyncStorage.setItem(
              "whatsnew:lastSeen:v1",
              new Date(newest).toISOString(),
            );
            setLastSeen(new Date(newest).toISOString());
          }
        }}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.buttonText}>{t("whatsNew.markAllReadBtn", "Mark all as read")}</Text>
      </Pressable>

      <SectionList
  sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.section}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const unread = isUnread(item.date);
          return (
            <View style={styles.item}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text style={[styles.itemDate]}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                  {unread && (
                    <Text
                      style={{
                        backgroundColor: palette.primary,
                        color: palette.onPrimary,
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        fontWeight: "700",
                      }}
                    >
                      {t("whatsNew.badgeNew", "New")}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={styles.itemText}>{item.summary}</Text>
            </View>
          );
        }}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </View>
  );
}

function createStyles(
  palette: ReturnType<typeof useAppPalette>,
  factor: number,
) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: {
      fontSize: Math.round(24 * factor),
      fontWeight: "700",
      color: palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 1,
      marginBottom: 8,
    },
    section: {
      color: palette.text,
      fontWeight: "700",
      marginTop: 12,
      marginBottom: 6,
    },
    item: {
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    itemTitle: { color: palette.text, fontWeight: "600" },
    itemText: { color: palette.text, opacity: 1 },
    itemDate: {
      color: palette.text,
      opacity: 0.7,
      fontSize: Math.round(12 * factor),
    },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      marginBottom: 6,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontSize: 16, fontWeight: "700" },
  });
}

// Map raw activity events to simple human-readable lines.
function readableTitle(a: AnyActivityEvent): string {
  switch(a.type){
    case 'bookmark.add': return 'Bookmark Added';
    case 'bookmark.remove': return 'Bookmark Removed';
    case 'petition.sign': return 'Petition Signed';
    case 'resource.view': return 'Resource Viewed';
    case 'broadcast': return a.payload?.title || 'Broadcast';
    case 'feature.use': return 'Feature Used';
    case 'a11y.toggle': return 'Accessibility Toggle';
    case 'faq.create': return 'FAQ Created';
    case 'faq.update': return 'FAQ Updated';
    case 'faq.delete': return 'FAQ Deleted';
    default: return a.type;
  }
}
function readableSummary(a: AnyActivityEvent): string {
  switch(a.type){
    case 'bookmark.add': return `Added: ${a.payload?.targetId || ''}`.trim();
    case 'bookmark.remove': return `Removed: ${a.payload?.targetId || ''}`.trim();
    case 'petition.sign': return `Signed petition ${a.payload?.petitionId || ''}`.trim();
    case 'resource.view': return `Viewed resource ${a.payload?.resourceId || ''}`.trim();
    case 'broadcast': return a.payload?.body || a.payload?.title || 'Announcement';
    case 'feature.use': return a.payload?.feature ? `Used ${a.payload.feature}` : 'Feature interaction';
    case 'a11y.toggle': return `${a.payload?.feature} set to ${a.payload?.enabled}`;
    case 'faq.create': return `Created FAQ: ${a.payload?.q || a.payload?.id || ''}`.trim();
    case 'faq.update': return `Updated FAQ: ${a.payload?.q || a.payload?.id || ''}`.trim();
    case 'faq.delete': return `Deleted FAQ ${a.payload?.id || ''}`.trim();
    default: return a.type;
  }
}



