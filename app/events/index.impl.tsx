import { Link } from "expo-router";
import React from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    Share,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import A11yPressable from '../../components/A11yPressable';
import Card from "../../components/Card";
import ContrastToggle from "../../components/ContrastToggle";
import { GapView } from "../../components/GapView";
import ResponsiveScreenWrapper from "../../components/ResponsiveScreenWrapper";
import SearchBar from "../../components/SearchBar";
import SettingsLink from "../../components/SettingsLink";
import SkeletonRow from "../../components/SkeletonRow";
import { HIT_SLOP_8 } from "../../constants/A11Y";
import { generateDisabilityObservances } from "../../data/disability-observances";
import { events as localEvents } from "../../data/events";
import {
    generateCanadianHolidays,
    generateProvincialHolidays,
} from "../../data/holidays-ca";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import { usePostLoadAnnounce } from "../../hooks/usePostLoadAnnounce";
import { useTranslation } from "../../i18n";
import { ANALYTICS_EVENTS, trackEvent } from "../../services/analyticsClient";
import { fetchEvents } from "../../services/events";
import { fsAddEvent } from "../../services/firestore";
import { useCounts } from "../../store/counts";
import { useNetwork } from "../../store/network";
import { useRefresh } from "../../store/refresh";
import { useSettings } from "../../store/settings";
import { useTextScale } from "../../theme/typography";
import { useAppPalette } from "../../theme/usePalette";
import { makeCSVRow, makeICS, shareText } from "../../utils/eventsExport";

export default function EventsScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('nav.events','Events'));
  useFocusOnRefOnMount(titleRef);

  const [baseItems, setBaseItems] = React.useState(localEvents);
  const [month, setMonth] = React.useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [systemItems, setSystemItems] = React.useState(() => {
    const y = new Date().getFullYear();
    return [
      ...generateCanadianHolidays(y),
      ...generateDisabilityObservances(y),
    ];
  });
  const { includeProvincialHolidays, province } = useSettings();

  type FilterMode = "all" | "community" | "observances";
  const [mode, setMode] = React.useState<FilterMode>("all");

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

  // One-time post-load announcement
  usePostLoadAnnounce({ loading, count: items.length, ns: 'eventsFeature', emptyKey: 'eventsFeature.empty' });

  const formatMeta = (date: string, isVirtual?: boolean, location?: string) => {
    const place = isVirtual ? t('eventsFeature.chips.virtual','Virtual') : (location ?? t('eventsFeature.tbd','TBD'));
    return `${date} • ${place}`;
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
    () => {
      const base = selectedDay
        ? items.filter((e) => toDayKey(e.date) === selectedDay)
        : items;
      const q = query.trim().toLowerCase();
      if (!q) return base;
      return base.filter((e: any) => {
        const place = e.isVirtual ? 'virtual' : (e.location || '');
        const tag = e.id.startsWith('holiday-') ? 'holiday' : e.id.startsWith('prov-') ? 'provincial' : e.id.startsWith('obs-') ? 'observance' : '';
        return (
          e.title.toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          place.toLowerCase().includes(q) ||
          tag.includes(q)
        );
      });
    },
    [items, selectedDay, query],
  );

  const selectToday = React.useCallback(() => {
    const today = toDayKey(new Date().toISOString());
    setSelectedDay(today);
  }, []);

  const clearFilters = React.useCallback(() => {
    setSelectedDay(null);
    setQuery('');
    setMode('all');
  }, []);

  const [showCreate, setShowCreate] = React.useState(false);
  const handleCreate = async (data: {
    title: string; description: string; date: string; location?: string; isVirtual?: boolean; asl?: boolean; captions?: boolean; stepFree?: boolean; sensorySpace?: boolean;
  }) => {
    const id = `evt-${Date.now()}`;
    const newEvt = { id, ...data } as any;
    setBaseItems(prev => [newEvt, ...prev]);
    try { await fsAddEvent(newEvt); } catch { /* silent fail keeps local */ }
  };

  return (
    <ResponsiveScreenWrapper>
      <View
        style={[styles.container, { flex: 1 }]}
        accessibilityLabel="Events screen"
        accessible={true}
      >
        <Text
          ref={titleRef}
          nativeID="events-title"
          accessibilityRole="header"
          style={styles.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t('nav.events','Events')}
        </Text>

        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
        <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />

        <Text style={styles.subtitle}>
          {t('eventsFeature.subtitle','Community events, workshops, and meetups.')}
        </Text>

        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('eventsFeature.search.placeholder','Search events, tags, places')}
        />

        <GapView gap={8} style={{ flexDirection:'row', marginBottom:8 }}>
          <A11yPressable
            accessibilityRole="button"
            accessibilityLabel={t('deadlines.today','Today')}
            onPress={selectToday}
            style={{ paddingHorizontal:10, paddingVertical:6, borderRadius:20, backgroundColor: palette.card, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
          >
            <Text style={{ color: palette.text, fontWeight:'700', fontSize:12 }}>{t('deadlines.today','Today')}</Text>
          </A11yPressable>
          <A11yPressable
            accessibilityRole="button"
            accessibilityLabel={t('common.resetFilters','Reset filters')}
            onPress={clearFilters}
            style={{ paddingHorizontal:10, paddingVertical:6, borderRadius:20, backgroundColor: palette.card, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
          >
            <Text style={{ color: palette.text, fontWeight:'700', fontSize:12 }}>{t('common.resetFilters','Reset filters')}</Text>
          </A11yPressable>
        </GapView>

        <A11yPressable
          accessibilityRole="button"
          accessibilityLabel={showCreate ? t('a11y.toggleCreateEventFormClose') : t('a11y.toggleCreateEventFormOpen')}
          onPress={() => setShowCreate(v => !v)}
          style={{ alignSelf:'flex-start', marginBottom: 8, paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor: palette.primary }}
        >
          <Text style={{ color: palette.onPrimary, fontWeight:'700' }}>{showCreate ? t('eventsFeature.createToggleClose','Close Form') : t('eventsFeature.createToggleOpen','Create Event')}</Text>
        </A11yPressable>

        {/* Filter chips */}
        <GapView gap={8} style={{ flexDirection:'row', marginBottom:8 }}>
          <FilterChip label={t('common.all','All')} active={mode==='all'} onPress={() => setMode('all')} palette={palette} />
          <FilterChip label={t('eventsFeature.section.community','Community Events')} active={mode==='community'} onPress={() => setMode('community')} palette={palette} />
          <FilterChip label={t('eventsFeature.section.observances','Holidays & Observances')} active={mode==='observances'} onPress={() => setMode('observances')} palette={palette} />
        </GapView>

        {showCreate && (
          <CreateEventBox onCreate={handleCreate} palette={palette} />
        )}

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
              {t('eventsFeature.loadFailed','Failed to load events')}
            </Text>
            <Text
              onPress={reload}
              accessibilityRole="button"
              accessibilityLabel={t('deadlines.reloadShort','Reload')}
              style={styles.subtitle}
            >
              {t('deadlines.reloadShort','Reload')}
            </Text>
          </>
        )}

        <View style={styles.calHeader}>
          <A11yPressable
            accessibilityRole="button"
            accessibilityLabel={t('deadlines.prevMonth','Previous')}
            hitSlop={HIT_SLOP_8}
            onPress={() =>
              setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
            }
          >
            <Text style={styles.calNav}>{"<"}</Text>
          </A11yPressable>
          <Text style={styles.calTitle}>{monthLabel}</Text>
          <Text style={[styles.calTitle, { opacity:0.7 }]} accessibilityLiveRegion="polite">
            {t('eventsFeature.loadedCount','{{n}} events loaded',{ n: filtered.length })}
          </Text>
          <A11yPressable
            accessibilityRole="button"
            accessibilityLabel={t('deadlines.nextMonth','Next')}
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

        <View style={styles.calendarContainer}>
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
                    key ? `${t('common.select','Select')} ${key}${has ? ", " + t('eventsFeature.hasEvents','has events') : ""}` : t('common.empty','Empty')
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
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={(
            <View style={{ paddingVertical: 16 }}>
              <Text style={[styles.subtitle, { marginBottom: 6 }]}>
                {t('eventsFeature.empty','No events match your filters')}
              </Text>
              {(selectedDay || query || mode !== 'all') && (
                <A11yPressable
                  onPress={clearFilters}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.resetFilters','Reset filters')}
                  style={{ alignSelf:'flex-start', paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
                >
                  <Text style={{ color: palette.text, fontWeight:'700' }}>{t('common.resetFilters','Reset filters')}</Text>
                </A11yPressable>
              )}
            </View>
          )}
          renderItem={({ item }) => (
            <View style={{ marginBottom:12 }}>
              <Link
                href={{ pathname: "/(tabs)/events/[id]", params: { id: item.id } } as any}
                asChild={true}
                accessibilityRole="link"
                accessibilityLabel={`${t('home.guide.open','Open')} ${item.title}`}
              >
                <Card
                  title={item.title}
                  subtitle={formatMeta(item.date, item.isVirtual, item.location)}
                  left={(() => {
                    const label = item.id.startsWith("holiday-")
                      ? t('eventsFeature.tags.holiday','Holiday')
                      : item.id.startsWith("prov-")
                        ? t('eventsFeature.tags.provincial','Provincial')
                        : item.id.startsWith("obs-")
                          ? t('eventsFeature.tags.observance','Observance')
                          : null;
                    if (!label) return null;
                    return (
                      <View style={{ backgroundColor: palette.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ color: palette.onPrimary, fontSize: 11, fontWeight: "700" }}>{label}</Text>
                      </View>
                    );
                  })()}
                  testID={`event-${item.id}`}
                />
              </Link>
              <GapView gap={8} style={{ flexDirection:'row', marginTop:4 }}>
                <A11yPressable
                  onPress={async () => {
                    try {
                      await Share.share({
                        message: `${item.title}\n${item.date}\n${item.isVirtual? t('eventsFeature.chips.virtual','Virtual'): (item.location||t('eventsFeature.tbd','TBD'))}\n\n${item.description || ''}`.trim(),
                        title: item.title,
                      });
                    } catch {}
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('common.share','Share')} ${item.title}`}
                  style={{ paddingVertical:6, paddingHorizontal:12, borderRadius:6, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
                >
                  <Text style={{ color: palette.text, fontSize:12, fontWeight:'600' }}>{t('common.share','Share')}</Text>
                </A11yPressable>
                <A11yPressable
                  onPress={async () => {
                    const ics = makeICS(item);
                    await shareText(`${item.title}.ics`, ics);
                    trackEvent(ANALYTICS_EVENTS.EVENTS_EXPORT_ICS, { id: item.id });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('common.export','Export')} ${item.title} ICS`}
                  style={{ paddingVertical:6, paddingHorizontal:12, borderRadius:6, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
                >
                  <Text style={{ color: palette.text, fontSize:12, fontWeight:'600' }}>ICS</Text>
                </A11yPressable>
                <A11yPressable
                  onPress={async () => {
                    const header = '"Date","Title","Description","Location"';
                    const row = makeCSVRow(item as any);
                    await shareText(`${item.title}.csv`, `${header}\n${row}`);
                    trackEvent(ANALYTICS_EVENTS.EVENTS_EXPORT_CSV, { id: item.id });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('common.export','Export')} ${item.title} CSV`}
                  style={{ paddingVertical:6, paddingHorizontal:12, borderRadius:6, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
                >
                  <Text style={{ color: palette.text, fontSize:12, fontWeight:'600' }}>CSV</Text>
                </A11yPressable>
              </GapView>
            </View>
          )}
          contentContainerStyle={{ paddingTop: 12 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={reload} />
          }
          ListHeaderComponent={(
            <View style={{ marginBottom: 8 }}>
              <GapView gap={8} style={{ flexDirection:'row' }}>
                <A11yPressable
                  onPress={async () => {
                    // Export all filtered as single ICS concatenation
                    try {
                      const payload = filtered.map(it => makeICS(it as any)).join('\n');
                      await shareText('events.ics', payload);
                      trackEvent(ANALYTICS_EVENTS.EVENTS_EXPORT_ICS, { count: filtered.length, mode });
                    } catch {}
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.export','Export') + ' ICS'}
                  style={{ paddingVertical:6, paddingHorizontal:12, borderRadius:6, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
                >
                  <Text style={{ color: palette.text, fontSize:12, fontWeight:'600' }}>Export ICS</Text>
                </A11yPressable>
                <A11yPressable
                  onPress={async () => {
                    // Export CSV of filtered
                    const header = '"Date","Title","Description","Location"';
                    const rows = filtered.map(it => makeCSVRow(it as any)).join('\n');
                    await shareText('events.csv', `${header}\n${rows}`);
                    trackEvent(ANALYTICS_EVENTS.EVENTS_EXPORT_CSV, { count: filtered.length, mode });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.export','Export') + ' CSV'}
                  style={{ paddingVertical:6, paddingHorizontal:12, borderRadius:6, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
                >
                  <Text style={{ color: palette.text, fontSize:12, fontWeight:'600' }}>Export CSV</Text>
                </A11yPressable>
              </GapView>
            </View>
          )}
        />
      </View>
    </ResponsiveScreenWrapper>
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
      marginTop: 6,
      marginBottom: 4,
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
      marginBottom: 2,
    },
    calendarContainer: {
      maxHeight: 160, // Constrain calendar to ~5 weeks height (32px * 5 + margins)
      marginBottom: 8,
    },
    weekHdr: {
      width: 32,
      textAlign: "center",
      color: palette.text,
      opacity: 0.7,
      fontSize: 12,
    },
    dayCell: {
      width: 32,
      height: 32,
      borderRadius: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    dayText: { color: palette.text, fontSize: 13 },
  });
}

function CreateEventBox({ onCreate, palette }: { onCreate: (d: { title: string; description: string; date: string; location?: string; isVirtual?: boolean; asl?: boolean; captions?: boolean; stepFree?: boolean; sensorySpace?: boolean; }) => void; palette: any; }) {
  const { t } = useTranslation();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [isVirtual, setIsVirtual] = React.useState(false);
  const [asl, setAsl] = React.useState(false);
  const [captions, setCaptions] = React.useState(false);
  const [stepFree, setStepFree] = React.useState(false);
  const [sensorySpace, setSensory] = React.useState(false);
  const valid = title.trim().length>2 && description.trim().length>4 && date.trim().length>3;
  const fieldStyle = { borderWidth:1, borderColor: palette.muted, borderRadius:8, paddingHorizontal:10, paddingVertical:8, color: palette.text, marginBottom:6 };
  return (
    <View style={{ marginBottom:12, alignSelf:'stretch' }}>
      <TextInput placeholder={t('eventsFeature.form.titlePlaceholder','Title')} placeholderTextColor={palette.muted} value={title} onChangeText={setTitle} style={fieldStyle} />
      <TextInput placeholder={t('eventsFeature.form.descriptionPlaceholder','Description')} placeholderTextColor={palette.muted} value={description} onChangeText={setDescription} style={[fieldStyle,{ minHeight:60 }]} multiline={true} />
      <TextInput placeholder={t('eventsFeature.form.datePlaceholder','Date (YYYY-MM-DD HH:MM)')} placeholderTextColor={palette.muted} value={date} onChangeText={setDate} style={fieldStyle} />
      <TextInput placeholder={t('eventsFeature.form.locationPlaceholder','Location (optional)')} placeholderTextColor={palette.muted} value={location} onChangeText={setLocation} style={fieldStyle} />
      <GapView gap={8} style={{ flexDirection:'row', flexWrap:'wrap', marginBottom:8 }}>
        <ToggleChip label={t('eventsFeature.chips.virtual','Virtual')} active={isVirtual} onToggle={()=>setIsVirtual(v=>!v)} palette={palette} />
        <ToggleChip label={t('eventsFeature.chips.asl','ASL')} active={asl} onToggle={()=>setAsl(v=>!v)} palette={palette} />
        <ToggleChip label={t('eventsFeature.chips.captions','Captions')} active={captions} onToggle={()=>setCaptions(v=>!v)} palette={palette} />
        <ToggleChip label={t('eventsFeature.chips.stepFree','Step-free')} active={stepFree} onToggle={()=>setStepFree(v=>!v)} palette={palette} />
        <ToggleChip label={t('eventsFeature.chips.sensory','Sensory')} active={sensorySpace} onToggle={()=>setSensory(v=>!v)} palette={palette} />
      </GapView>
      <A11yPressable
        accessibilityRole="button"
        accessibilityLabel={t('eventsFeature.createToggleOpen','Create Event')}
        onPress={() => { 
          if(!valid) {
            Alert.alert(
              t('eventsFeature.form.incomplete','Incomplete Form'),
              t('eventsFeature.form.incompleteMsg','Please fill in title (3+ chars), description (5+ chars), and date fields.')
            );
            return;
          }
          onCreate({ title: title.trim(), description: description.trim(), date: date.trim(), location: location.trim()||undefined, isVirtual, asl, captions, stepFree, sensorySpace }); 
          setTitle(''); 
          setDescription(''); 
          setDate(''); 
          setLocation(''); 
          setIsVirtual(false); 
          setAsl(false); 
          setCaptions(false); 
          setStepFree(false); 
          setSensory(false);
        }}
        style={{ backgroundColor: valid ? palette.primary : palette.muted, paddingVertical:10, borderRadius:8, alignItems:'center', minHeight: 44 }}
      >
        <Text style={{ color: valid ? palette.onPrimary : palette.text, fontWeight:'700' }}>{t('eventsFeature.form.add','Add Event')}</Text>
      </A11yPressable>
    </View>
  );
}

function ToggleChip({ label, active, onToggle, palette }: { label: string; active: boolean; onToggle: () => void; palette: any; }) {
  return (
    <A11yPressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={label} style={{ borderWidth:1, borderColor: active? palette.primary: palette.muted, backgroundColor: active? palette.primary: 'transparent', paddingHorizontal:10, paddingVertical:6, borderRadius:20 }}>
      <Text style={{ color: active? palette.onPrimary: palette.text, fontWeight:'700', fontSize:12 }}>{label}</Text>
    </A11yPressable>
  );
}

function FilterChip({ label, active, onPress, palette }: { label: string; active: boolean; onPress: () => void; palette: any; }) {
  return (
    <A11yPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ borderWidth:1, borderColor: active? palette.primary: palette.muted, backgroundColor: active? palette.primary: 'transparent', paddingHorizontal:10, paddingVertical:6, borderRadius:20 }}>
      <Text style={{ color: active? palette.onPrimary: palette.text, fontWeight:'700', fontSize:12 }}>{label}</Text>
    </A11yPressable>
  );
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
