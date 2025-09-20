import { Link } from "expo-router";
import React from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import A11yPressable from '../../../components/A11yPressable';
import Card from "../../../components/Card";
import ContrastToggle from "../../../components/ContrastToggle";
import SettingsLink from "../../../components/SettingsLink";
import SkeletonRow from "../../../components/SkeletonRow";
import { HIT_SLOP_8 } from "../../../constants/a11y";
import { generateDisabilityObservances } from "../../../data/disability-observances";
import { events as localEvents } from "../../../data/events";
import {
    generateCanadianHolidays,
    generateProvincialHolidays,
} from "../../../data/holidays-ca";
import {
    MAX_FONT_SCALE,
    useAnnounceOnChange,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { fetchEvents } from "../../../services/events";
import { useCounts } from "../../../store/counts";
import { useNetwork } from "../../../store/network";
import { useRefresh } from "../../../store/refresh";
import { useSettings } from "../../../store/settings";
import { useTextScale } from "../../../theme/typography";
import { useAppPalette } from "../../../theme/usePalette";

export default function EventsScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Events");
  useFocusOnRefOnMount(titleRef);

  const [baseItems, setBaseItems] = React.useState(localEvents);
  const [month, setMonth] = React.useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const [systemItems, setSystemItems] = React.useState(() => {
    const y = new Date().getFullYear();
    return [
      ...generateCanadianHolidays(y),
      ...generateDisabilityObservances(y),
    ];
  });
  const { includeProvincialHolidays, province } = useSettings();

  type FilterMode = "all" | "community" | "observances";
  const [mode] = React.useState<FilterMode>("all");

  const systemForMonth = React.useMemo(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    return systemItems.filter((it) => {
      const d = new Date(it.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }, [systemItems, month]);

  const items = React.useMemo(() => {
    if (mode === "community") return baseItems;
    if (mode === "observances") return systemForMonth;
    return [...baseItems, ...systemForMonth];
  }, [baseItems, systemForMonth, mode]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { setCount } = useCounts();
  const { setOffline } = useNetwork();

  const reload = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchEvents();
      setBaseItems(data);
      setOffline(false);
    } catch {
      setError("Failed to load events");
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [setOffline]);

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
    return `${date} Ã¢â‚¬Â¢ ${place}`;
  };

  const monthLabel = React.useMemo(
    () => month.toLocaleString(undefined, { month: "long", year: "numeric" }),
    [month],
  );

  React.useEffect(() => {
    const y = month.getFullYear();
    const national = generateCanadianHolidays(y);
    const provincials = includeProvincialHolidays
      ? generateProvincialHolidays(y, province)
      : [];
    const hasNamedFeb = provincials.some((e) =>
      /prov-\d{4}-02-\d{2}-/.test(e.id),
    );
    const filteredNational = hasNamedFeb
      ? national.filter((e) => !/-family$/.test(e.id))
      : national;
    setSystemItems([
      ...filteredNational,
      ...generateDisabilityObservances(y),
      ...provincials,
    ]);
  }, [month, includeProvincialHolidays, province]);

  const daysMatrix = React.useMemo(() => buildMonthMatrix(month), [month]);
  const eventsByDay = React.useMemo(() => mapEventsByDay(items), [items]);
  const filtered = React.useMemo(
    () =>
      selectedDay
        ? items.filter((e) => toDayKey(e.date) === selectedDay)
        : items,
    [items, selectedDay],
  );

  return (
    <View
      style={styles.container}
      accessibilityLabel="Events screen"
      accessible
    >
      <Text
        ref={titleRef}
        nativeID="events-title"
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Events
      </Text>

      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />

      <Text style={styles.subtitle}>
        Community events, workshops, and meetups.
      </Text>

      {loading && (
        <View>
          <SkeletonRow testID="skeleton-event-1" />
          <SkeletonRow testID="skeleton-event-2" />
          <SkeletonRow testID="skeleton-event-3" />
        </View>
      )}

      {error && (
        <>
          <Text style={styles.subtitle} accessibilityRole="alert">
            {error}
          </Text>
          <Text
            onPress={reload}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            style={styles.subtitle}
          >
            Try again
          </Text>
        </>
      )}

      <View style={styles.calHeader}>
        <A11yPressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          hitSlop={HIT_SLOP_8}
          onPress={() =>
            setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
          }
        >
          <Text style={styles.calNav}>{"<"}</Text>
        </A11yPressable>
        <Text style={styles.calTitle}>{monthLabel}</Text>
        <A11yPressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          hitSlop={HIT_SLOP_8}
          onPress={() =>
            setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
          }
        >
          <Text style={styles.calNav}>{">"}</Text>
        </A11yPressable>
      </View>

      <View style={styles.weekRow}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <Text key={`dow-${i}`} style={styles.weekHdr}>
            {d}
          </Text>
        ))}
      </View>

      {daysMatrix.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((d, di) => {
            const key = dayKeyFromMatrix(month, d);
            const has = !!key && eventsByDay.has(key);
            const isSel = !!key && selectedDay === key;
            return (
              <A11yPressable
                key={`${wi}-${di}`}
                style={[
                  styles.dayCell,
                  isSel && { backgroundColor: palette.primary },
                  has && { borderColor: palette.primary },
                ]}
                onPress={() =>
                  key && setSelectedDay((cur) => (cur === key ? null : key))
                }
                accessibilityRole="button"
                accessibilityLabel={
                  key ? `Select ${key}${has ? ", has events" : ""}` : "Empty"
                }
                disabled={!key}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSel && { color: palette.onPrimary },
                  ]}
                >
                  {d ?? ""}
                </Text>
              </A11yPressable>
            );
          })}
        </View>
      ))}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link
            href={
              {
                pathname: "/(tabs)/events/[id]",
                params: { id: item.id },
              } as any
            }
            asChild
            accessibilityRole="link"
            accessibilityLabel={`Open ${item.title}`}
          >
            <Card
              title={item.title}
              subtitle={formatMeta(item.date, item.isVirtual, item.location)}
              left={(() => {
                const label = item.id.startsWith("holiday-")
                  ? "Holiday"
                  : item.id.startsWith("prov-")
                    ? "Provincial"
                    : item.id.startsWith("obs-")
                      ? "Observance"
                      : null;
                if (!label) return null;
                return (
                  <View
                    style={{
                      backgroundColor: palette.primary,
                      borderRadius: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: palette.onPrimary,
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                );
              })()}
              testID={`event-${item.id}`}
            />
          </Link>
        )}
        contentContainerStyle={{ paddingTop: 12 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} />
        }
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
      marginBottom: 8,
      color: palette.text,
    },
    subtitle: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 0.9,
      marginBottom: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
    },
    calHeader: {
      marginTop: 8,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    calTitle: { color: palette.text, fontWeight: "700" },
    calNav: {
      color: palette.text,
      fontSize: 18,
      width: 24,
      textAlign: "center",
    },
    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    weekHdr: {
      width: 36,
      textAlign: "center",
      color: palette.text,
      opacity: 0.7,
    },
    dayCell: {
      width: 36,
      height: 36,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    dayText: { color: palette.text },
  });
}

// Calendar helpers
function toDayKey(input: string): string {
  const d = new Date(input);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mapEventsByDay(items: { date: string }[]) {
  const m = new Map<string, number>();
  for (const e of items) {
    const k = toDayKey(e.date);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

function buildMonthMatrix(firstOfMonth: Date): (number | null)[][] {
  const y = firstOfMonth.getFullYear();
  const m = firstOfMonth.getMonth();
  const first = new Date(y, m, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const matrix: (number | null)[][] = [];
  let current = 1 - startDay;
  for (let w = 0; w < 6; w++) {
    const week: (number | null)[] = [];
    for (let d = 0; d < 7; d++) {
      if (current < 1 || current > daysInMonth) week.push(null);
      else week.push(current);
      current++;
    }
    matrix.push(week);
    if (current > daysInMonth) break;
  }
  return matrix;
}

function dayKeyFromMatrix(baseMonth: Date, day: number | null) {
  if (!day) return "";
  const y = baseMonth.getFullYear();
  const m = `${baseMonth.getMonth() + 1}`.padStart(2, "0");
  const dd = `${day}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

