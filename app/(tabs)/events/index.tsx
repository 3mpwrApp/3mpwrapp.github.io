import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList, RefreshControl } from "react-native";
import { colors, type Palette } from "../../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount, useAnnounceOnChange } from "../../../hooks/useA11y";
import { events as localEvents } from "../../../data/events";
import { fetchEvents } from "../../../services/events";
import { useCounts } from "../../../store/counts";
import Card from "../../../components/Card";
import { Link } from "expo-router";
import SkeletonRow from "../../../components/SkeletonRow";
import { useRefresh } from "../../../store/refresh";
import { useNetwork } from "../../../store/network";

export default function EventsScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Events");
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState(localEvents);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { setCount } = useCounts();
  const { setOffline } = useNetwork();
  const reload = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchEvents();
      setItems(data);
      setOffline(false);
    } catch (e) {
      setError("Failed to load events");
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const { tick } = useRefresh();
  React.useEffect(() => {
    reload();
  }, [reload, tick]);

  React.useEffect(() => {
    setCount("events", items.length);
  }, [items, setCount]);

  useAnnounceOnChange(items.length, (n) => `${n} events loaded`);

  const formatMeta = (date: string, isVirtual?: boolean, location?: string) => {
    const place = isVirtual ? "Virtual" : (location ?? "TBD");
    return `${date} • ${place}`;
  };

  return (
    <View style={styles.container} accessibilityLabel="Events screen" accessible>
      <Text ref={titleRef} nativeID="events-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Events
      </Text>
      <Text style={styles.subtitle}>Community events, workshops, and meetups. Add reminders from details.</Text>
      {loading && (
        <View>
          <SkeletonRow testID="skeleton-event-1" />
          <SkeletonRow testID="skeleton-event-2" />
          <SkeletonRow testID="skeleton-event-3" />
        </View>
      )}
      {error && (
        <Text style={styles.subtitle} accessibilityRole="alert">
          {error}
        </Text>
      )}
      {error && (
        <Text onPress={reload} accessibilityRole="button" accessibilityLabel="Try again" style={styles.subtitle}>
          Try again
        </Text>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/(tabs)/events/[id]", params: { id: item.id } }} asChild accessibilityRole="link" accessibilityLabel={`Open ${item.title}`}>
            <Card title={item.title} subtitle={formatMeta(item.date, item.isVirtual, item.location)} testID={`event-${item.id}`} />
          </Link>
        )}
        contentContainerStyle={{ paddingTop: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
      />
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text, fontFamily: "Poppins" },
    subtitle: { fontSize: 16, color: palette.muted, marginBottom: 8, fontFamily: "Roboto" },
    button: { backgroundColor: palette.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, minHeight: 44, minWidth: 44 },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
  });
}
