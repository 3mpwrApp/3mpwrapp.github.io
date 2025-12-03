/* eslint-disable no-restricted-syntax */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from "expo-router";
import * as Updates from 'expo-updates';
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

import A11yPressable from '../../components/A11yPressable';
import CalendarSubscriptionCard from '../../components/CalendarSubscriptionCard';
import ContrastToggle from "../../components/ContrastToggle";
import ErrorBoundary from '../../components/ErrorBoundary';
import EventActionsBar from '../../components/EventActionsBar';
import EventDetailCard from '../../components/EventDetailCard';
import EventFilters, { type EventFilterOptions } from '../../components/EventFilters';
import { GapView } from "../../components/GapView";
import SearchBar from "../../components/SearchBar";
import SettingsLink from "../../components/SettingsLink";
import SimpleModeWelcome from "../../components/SimpleModeWelcome";
import { SkeletonList } from '../../components/SkeletonLoader';
import SkeletonRow from "../../components/SkeletonRow";
import { HIT_SLOP_8 } from "../../constants/A11Y";
import { useAuth } from "../../context/AuthContext";
import { generateDisabilityObservances } from "../../data/disability-observances";
import { generateHealthAwarenessEvents } from "../../data/health-awareness-months";
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
import { addToSyncQueue, getSyncQueueStats, processSyncQueue, startBackgroundSync } from "../../services/eventAutoSync";
import { fetchEvents } from "../../services/events";
import { deleteEventFromProduction, isFirestoreSyncAvailable, syncEventToProduction } from "../../services/firestoreEventSync";
import { useComplexityMode } from "../../store/complexityMode";
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
  const router = useRouter?.() || null;
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('nav.events','Events'));
  useFocusOnRefOnMount(titleRef);

  const [baseItems, setBaseItems] = React.useState<any[]>([]);
  const [month, setMonth] = React.useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState<EventFilterOptions>({});
  const [systemItems, setSystemItems] = React.useState(() => {
    const y = new Date().getFullYear();
    return [
      ...generateCanadianHolidays(y),
      ...generateDisabilityObservances(y),
      ...generateHealthAwarenessEvents(y),
    ];
  });

  // Load locally created events from storage on mount
  React.useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem('events:local:v1');
        if (cached) {
          const localCreatedEvents = JSON.parse(cached);
          setBaseItems(prev => [...localCreatedEvents, ...prev]);
        }
      } catch (err) {
        console.warn('[Events] Failed to load cached events:', err);
      }
    })();
  }, []);
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
    if (mode === "community") return baseItems.filter(e => e.category === "community");
    if (mode === "observances") return systemForMonth;
    return [...baseItems, ...systemForMonth];
  }, [baseItems, systemForMonth, mode]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { setCount } = useCounts();
  const { isFeatureVisible } = useComplexityMode();
  const { setOffline } = useNetwork();
  const { user } = useAuth();

  const reload = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchEvents();
      
      // Fetch community events from Firestore (events_preview for dev/preview, events_production for production)
      let firestoreEvents: any[] = [];
      try {
        const { fetchEventUpdates } = await import('../../services/firestoreEventSync');
        // Use preview collection for development and EAS preview channel, production for release builds
        // __DEV__ is only true in development, not in EAS preview builds
        // Use expo-updates channel to detect if we're on preview channel
        const isPreviewChannel = Updates.channel === 'preview';
        const collection = (__DEV__ || isPreviewChannel) ? 'events_preview' : 'events_production';
        // Debug logging for Firestore sync
        if (__DEV__) { console.warn('[Events] Fetching from Firestore:', { 
          __DEV__, 
          channel: Updates.channel, 
          isPreviewChannel, 
          collection 
        }); }
        firestoreEvents = await fetchEventUpdates(collection);
        if (__DEV__) { console.warn('[Events] Fetched', firestoreEvents.length, 'events from Firestore'); }
      } catch (err) {
        console.warn('[Events] Failed to fetch from Firestore:', err);
      }
      
      // Merge events with PRIORITY: Firestore > LocalStorage > Hardcoded
      // Firestore community events override hardcoded events with same IDs
      let mergedData = [...firestoreEvents];
      
      // Add hardcoded events that don't conflict with Firestore
      const firestoreIds = new Set(firestoreEvents.map(e => e.id));
      const nonConflictingHardcoded = data.filter((e: any) => !firestoreIds.has(e.id));
      mergedData = [...mergedData, ...nonConflictingHardcoded];
      
      // Add local AsyncStorage events that don't conflict
      try {
        const cached = await AsyncStorage.getItem('events:local:v1');
        if (cached) {
          const localEvents = JSON.parse(cached);
          const existingIds = new Set(mergedData.map(e => e.id));
          const newLocalEvents = localEvents.filter((e: any) => !existingIds.has(e.id));
          mergedData = [...mergedData, ...newLocalEvents];
        }
      } catch (err) {
        console.warn('[Events] Failed to merge cached events:', err);
      }
      
      setBaseItems(mergedData);
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

  // Reload events when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  React.useEffect(() => {
    setCount("events", items.length);
  }, [items, setCount]);

  // One-time post-load announcement
  usePostLoadAnnounce({ loading, count: items.length, ns: 'eventsFeature', emptyKey: 'eventsFeature.empty' });

  // @ts-ignore - Reserved for future event meta formatting feature
  const _formatMeta = (date: string, isVirtual?: boolean, location?: string) => {
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
      ...generateHealthAwarenessEvents(y),
      ...provincials,
    ]);
  }, [month, includeProvincialHolidays, province]);

  const daysMatrix = React.useMemo(() => buildMonthMatrix(month), [month]);
  const eventsByDay = React.useMemo(() => mapEventsByDay(items), [items]);
  const filtered = React.useMemo(
    () => {
      let base = selectedDay
        ? items.filter((e) => toDayKey(e.date) === selectedDay)
        : items;
      
      // Filter out past events - only show present and future events
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      base = base.filter((e: any) => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0); // Start of event day
        return eventDate >= now; // Keep events today or in the future
      });
      
      // Apply text search
      const q = query.trim().toLowerCase();
      if (q) {
        base = base.filter((e: any) => {
          const place = e.isVirtual ? 'virtual' : (e.location || '');
          const tag = e.id.startsWith('holiday-') ? 'holiday' : e.id.startsWith('prov-') ? 'provincial' : e.id.startsWith('obs-') ? 'observance' : '';
          return (
            e.title.toLowerCase().includes(q) ||
            (e.description || '').toLowerCase().includes(q) ||
            place.toLowerCase().includes(q) ||
            tag.includes(q)
          );
        });
      }
      
      // Apply accessibility filters
      if (activeFilters.wheelchairAccessible) {
        base = base.filter((e: any) => e.wheelchairAccessible === true);
      }
      if (activeFilters.quietRoom) {
        base = base.filter((e: any) => e.quietRoom === true);
      }
      if (activeFilters.parkingAccessible) {
        base = base.filter((e: any) => e.parkingAccessible === true);
      }
      if (activeFilters.assistiveListening) {
        base = base.filter((e: any) => e.assistiveListening === true);
      }
      if (activeFilters.braille) {
        base = base.filter((e: any) => e.braille === true);
      }
      if (activeFilters.serviceAnimalsWelcome) {
        base = base.filter((e: any) => e.serviceAnimalsWelcome === true);
      }
      
      // Apply energy cost filter
      if (activeFilters.energyCost && activeFilters.energyCost.length > 0) {
        base = base.filter((e: any) => 
          e.energyCost && activeFilters.energyCost?.includes(e.energyCost)
        );
      }
      
      // Apply location type filter
      if (activeFilters.locationType === 'virtual') {
        base = base.filter((e: any) => e.isVirtual === true || e.virtualLink);
      } else if (activeFilters.locationType === 'in-person') {
        base = base.filter((e: any) => !e.isVirtual && !e.virtualLink && e.location);
      }
      
      return base;
    },
    [items, selectedDay, query, activeFilters],
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
  const [syncStatus, setSyncStatus] = React.useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = React.useState<number | null>(null);
  const [pendingSyncs, setPendingSyncs] = React.useState(0);

  // Start background sync service on mount
  React.useEffect(() => {
    const stopBackgroundSync = startBackgroundSync();
    
    // Update pending syncs count periodically
    const updateStats = async () => {
      const stats = await getSyncQueueStats();
      setPendingSyncs(stats.pending);
    };
    
    updateStats();
    // WCAG 2.2.1: Timing is user-adjustable via app Settings > Accessibility > Auto-refresh interval
    const statsInterval = setInterval(updateStats, 10000); // Every 10 seconds

    return () => {
      stopBackgroundSync();
      clearInterval(statsInterval);
    };
  }, []);

  // Auto-sync function that runs in background
  const autoSyncEvent = React.useCallback(async (event: any) => {
    try {
      const isSyncAvailable = await isFirestoreSyncAvailable();
      
      if (!isSyncAvailable || !user?.uid) {
        // eslint-disable-next-line no-console
        console.log('[AutoSync] Sync not available - adding to queue for retry');
        // Add to queue for background retry
        if (user?.uid) {
          await addToSyncQueue(event.id, event, user.uid);
          setPendingSyncs(prev => prev + 1);
        }
        return false;
      }

      setSyncStatus('syncing');
      
      // Prepare event payload
      const eventPayload = {
        id: event.id,
        title: event.title,
        description: event.description,
        date: new Date(event.date),
        time: event.time,
        duration: event.duration,
        location: event.location,
        isVirtual: event.isVirtual,
        asl: event.asl,
        captions: event.captions,
        stepFree: event.stepFree,
        sensorySpace: event.sensorySpace,
        energyLevel: event.energyLevel,
        requiresRSVP: event.requiresRSVP,
        rsvpDetails: event.rsvpDetails,
        createdBy: user.uid,
        createdAt: event.createdAt || Date.now(),
        status: 'published' as const,
        category: 'community',
      };

      // Sync to both production and preview collections
      const productionSuccess = await syncEventToProduction(eventPayload, user.uid, 'events_production');
      const previewSuccess = await syncEventToProduction(eventPayload, user.uid, 'events_preview');
      
      const firestoreSuccess = productionSuccess && previewSuccess;

      // Also sync to Cloudflare Worker (website)
      let workerSuccess = false;
      if (firestoreSuccess) {
        try {
          const { syncEventToWebsite } = await import('../../services/eventSyncToWorker');
          workerSuccess = await syncEventToWebsite({
            ...eventPayload,
            date: eventPayload.date.toISOString(),
          });
        } catch (err) {
          console.warn('[AutoSync] Failed to sync to Cloudflare Worker:', err);
        }
      }

      const syncSuccess = firestoreSuccess && workerSuccess;

      if (syncSuccess) {
        setSyncStatus('success');
        setLastSyncTime(Date.now());
        // eslint-disable-next-line no-console
        console.log(`[AutoSync] ✓ Event ${event.id} synced to Firestore and Cloudflare Worker`);
        return true;
      } else if (productionSuccess || previewSuccess) {
        // Partial success - add to queue for retry
        await addToSyncQueue(event.id, event, user.uid);
        setPendingSyncs(prev => prev + 1);
        setSyncStatus('error');
        console.warn(`[AutoSync] ⚠ Partial sync (prod: ${productionSuccess}, preview: ${previewSuccess}) - added to retry queue`);
        return false;
      } else {
        // Failed - add to queue for retry
        await addToSyncQueue(event.id, event, user.uid);
        setPendingSyncs(prev => prev + 1);
        setSyncStatus('error');
        console.warn(`[AutoSync] ✗ Event ${event.id} sync failed - added to retry queue`);
        return false;
      }
    } catch (err) {
      console.error('[AutoSync] Error:', err);
      // Add to queue for retry
      if (user?.uid) {
        await addToSyncQueue(event.id, event, user.uid);
        setPendingSyncs(prev => prev + 1);
      }
      setSyncStatus('error');
      return false;
    } finally {
      // Reset status after 3 seconds
      // WCAG 2.2.1: Status display timing - users can disable auto-dismiss via Settings > Accessibility
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, [user?.uid]);

  const handleCreate = async (data: {
    title: string; description: string; date: string; time?: string; duration?: number; location?: string; isVirtual?: boolean; asl?: boolean; captions?: boolean; stepFree?: boolean; sensorySpace?: boolean; energyLevel?: string; requiresRSVP?: boolean; rsvpDetails?: string;
  }) => {
    const id = `evt-${Date.now()}`;
    
    // Combine date and time if time is provided, convert to EST
    let fullDate = data.date;
    if (data.time) {
      fullDate = `${data.date}T${data.time}:00.000`;
    }
    
    // Convert to EST (America/New_York) - subtract 5 hours from UTC
    const eventDate = new Date(fullDate);
    const estDate = new Date(eventDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    fullDate = estDate.toISOString();
    
    const newEvt = { 
      id, 
      ...data,
      date: fullDate, // Use combined date/time
      createdBy: user?.uid || 'anonymous',
      createdAt: Date.now(),
      category: 'community',
      status: 'published',
    } as any;
    
    // Add to UI immediately (optimistic update)
    setBaseItems(prev => [newEvt, ...prev]);
    
    // Save to local storage for offline persistence
    try {
      const cached = await AsyncStorage.getItem('events:local:v1');
      const localEvents = cached ? JSON.parse(cached) : [];
      const updated = [newEvt, ...localEvents];
      await AsyncStorage.setItem('events:local:v1', JSON.stringify(updated));
    } catch (err) {
      console.warn('[Events] Failed to cache event:', err);
    }
    
    // Auto-sync to cloud (no user interaction needed)
    const synced = await autoSyncEvent(newEvt);
    
    // Send push notification to all users about new event
    if (synced) {
      try {
        const { sendEventNotification } = await import('../../services/notifications');
        await sendEventNotification(newEvt);
      } catch (notifErr) {
        console.warn('[Events] Failed to send push notification:', notifErr);
      }
    }
    
    if (synced) {
      Alert.alert(
        '✅ Event Published!',
        `"${newEvt.title}" is now live on the 3mpwr website and will appear in the calendar feed within minutes.`,
        [{ text: 'Great!' }]
      );
      trackEvent(ANALYTICS_EVENTS.EVENTS_CREATE, { id: newEvt.id, synced: true, autoSync: true });
    } else {
      Alert.alert(
        '📱 Event Saved Locally',
        user?.uid 
          ? 'Event created on your device. Cloud sync will retry automatically when connection is available.'
          : 'Event saved locally. Sign in to publish to the 3mpwr website.',
        [{ text: 'OK' }]
      );
      trackEvent(ANALYTICS_EVENTS.EVENTS_CREATE, { id: newEvt.id, synced: false });
    }
    
    setShowCreate(false);
    
    // Reload events to ensure fresh data from Firestore
    // WCAG 2.2.1: Brief delay for data consistency - no user interaction affected
    setTimeout(() => reload(), 500);
  };

  return (
    <View style={[styles.container, { flex: 1 }]}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 }}
      >
        <View style={{ position: 'relative', minHeight: 60, marginBottom: 8 }}>
          <Text
            ref={titleRef}
            nativeID="events-title"
            accessibilityRole="header"
            style={styles.title}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t('nav.events','Events')}
          </Text>

          <View style={{ position: "absolute", right: 0, top: 0, flexDirection: 'row' }}>
            <ContrastToggle style={{ marginRight: 8 }} />
            <SettingsLink />
          </View>
        </View>

        <Text style={styles.subtitle}>
          {t('eventsFeature.subtitle','Community events, workshops, and meetups.')}
        </Text>

        {/* Simple Mode Welcome - shows when user is in Simple mode */}
        <SimpleModeWelcome 
          tabName="Events"
          availableFeatures={['View Events', 'Calendar', 'Search']}
          hiddenCount={8}
        />

        {loading ? (
          <SkeletonList count={6} />
        ) : (
          <>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={t('eventsFeature.search.placeholder','Search events, tags, places')}
            />

            {/* Filter Button */}
            <A11yPressable
              onPress={() => setShowFilters(true)}
              style={styles.filterButton}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel="Open event filters"
            >
              <Text style={styles.filterButtonText}>
                🔍 Filters
                {Object.keys(activeFilters).filter(k => 
                  k !== 'searchQuery' && activeFilters[k as keyof EventFilterOptions]
                ).length > 0 && (
                  <Text style={styles.filterBadge}>
                    {' '}• {Object.keys(activeFilters).filter(k => 
                      k !== 'searchQuery' && activeFilters[k as keyof EventFilterOptions]
                    ).length}
                  </Text>
                )}
              </Text>
            </A11yPressable>

            {/* Filter Modal */}
            <EventFilters
              visible={showFilters}
              filters={activeFilters}
              onApply={setActiveFilters}
              onClose={() => setShowFilters(false)}
            />
          </>
        )}

        {/* Auto-Sync Status Indicator - Power User only */}
        {isFeatureVisible('power_user') && syncStatus !== 'idle' && (
          <View style={{ 
            padding: 10, 
            backgroundColor: syncStatus === 'syncing' ? palette.surface : syncStatus === 'success' ? '#047857' : '#991B1B', 
            borderRadius: 8, 
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: syncStatus === 'syncing' ? palette.text : palette.onPrimary, fontWeight: '600', fontSize: 14 }}>
              {syncStatus === 'syncing' && '🔄 Syncing to website...'}
              {syncStatus === 'success' && '✅ Synced! Live on 3mpwr website'}
              {syncStatus === 'error' && '⚠️ Sync pending (will retry)'}
            </Text>
          </View>
        )}

        {/* Pending syncs indicator - Power User only */}
        {isFeatureVisible('power_user') && pendingSyncs > 0 && (
          <View style={{ 
            padding: 8, 
            backgroundColor: palette.surface, 
            borderRadius: 6, 
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Text style={{ color: palette.text, fontSize: 12 }}>
              ⏳ {pendingSyncs} event{pendingSyncs > 1 ? 's' : ''} pending sync
            </Text>
            <A11yPressable
              onPress={async () => {
                setSyncStatus('syncing');
                const result = await processSyncQueue();
                if (result.synced > 0) {
                  setSyncStatus('success');
                  setLastSyncTime(Date.now());
                  setPendingSyncs(result.pending);
                  Alert.alert('✅ Sync Complete', `${result.synced} event(s) synced successfully!`);
                } else {
                  setSyncStatus('error');
                  Alert.alert('⚠️ Sync Pending', 'Unable to sync now. Will retry automatically.');
                }
                // WCAG 2.2.1: Status display timing - users can disable auto-dismiss via Settings > Accessibility
                setTimeout(() => setSyncStatus('idle'), 3000);
              }}
              style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: palette.primary, borderRadius: 4 }}
            >
              <Text style={{ color: palette.onPrimary, fontSize: 11, fontWeight: '700' }}>Retry Now</Text>
            </A11yPressable>
          </View>
        )}

        {/* Last sync timestamp - Power User only */}
        {isFeatureVisible('power_user') && lastSyncTime && (
          <Text style={{ fontSize: 11, color: palette.muted, textAlign: 'center', marginBottom: 8 }}>
            Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
          </Text>
        )}

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

        {/* Create Event - Standard+ only */}
        {isFeatureVisible('standard') && (
          <A11yPressable
            accessibilityRole="button"
            accessibilityLabel={showCreate ? t('eventsFeature.createToggleClose','Close Form') : t('eventsFeature.createToggleOpen','Create Event')}
            onPress={() => setShowCreate(v => !v)}
            style={{ alignSelf:'flex-start', marginBottom: 8, paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor: palette.primary }}
          >
            <Text style={{ color: palette.onPrimary, fontWeight:'700' }}>{showCreate ? t('eventsFeature.createToggleClose','Close Form') : t('eventsFeature.createToggleOpen','Create Event')}</Text>
          </A11yPressable>
        )}

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

        {/* Calendar Section */}
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
              <Text style={[styles.calTitle, { color: palette.textSecondary }]} accessibilityLiveRegion="polite">
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

        {/* Calendar Subscription Card - Auto-sync feature with error boundary */}
        <View style={{ marginTop: 20, marginBottom: 16 }}>
          <ErrorBoundary>
            <CalendarSubscriptionCard />
          </ErrorBoundary>
        </View>

        {/* One-time Export Options - Power User only */}
        {isFeatureVisible('power_user') && (
          <>
            <Text style={{ fontSize: 12, color: palette.textSecondary, marginBottom: 6, fontWeight: '600' }}>
              One-time exports (no auto-updates):
            </Text>
            <GapView gap={8} style={{ flexDirection:'row', marginBottom: 24 }}>
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
          </>
        )}

        {/* Events List Section */}
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.subtitle, { fontSize: Math.round(18 * factor), fontWeight: '700', marginBottom: 8 }]}>
            {filtered.length > 0 ? t('eventsFeature.upcomingEvents', 'Upcoming Events') : t('eventsFeature.empty','No events match your filters')}
          </Text>
        </View>

        {filtered.length === 0 ? (
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
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={{ marginBottom:12 }}>
              <EventDetailCard 
                event={item}
                onPress={() => {
                  if (router) {
                    router.push({ pathname: "/events/[id]", params: { id: item.id } } as any);
                  }
                }}
              />
              <EventActionsBar 
                event={item} 
                palette={palette}
                showEditDelete={item.id.startsWith('evt-')}
                showSubmitTo3mpwr={item.id.startsWith('evt-')}
                onEdit={() => {
                  // Navigate to event detail page for editing
                  if (router) {
                    router.push({ pathname: "/events/[id]", params: { id: item.id } });
                  }
                }}
                onDelete={async () => {
                  // Delete from local state (optimistic update)
                  setBaseItems(prev => prev.filter(e => e.id !== item.id));
                  
                  // Remove from local storage
                  try {
                    const cached = await AsyncStorage.getItem('events:local:v1');
                    if (cached) {
                      const localEvents = JSON.parse(cached);
                      const updated = localEvents.filter((e: any) => e.id !== item.id);
                      await AsyncStorage.setItem('events:local:v1', JSON.stringify(updated));
                    }
                  } catch (err) {
                    console.warn('[Events] Failed to update cache:', err);
                  }
                  
                  // Auto-sync deletion to cloud (no manual intervention)
                  setSyncStatus('syncing');
                  try {
                    // Delete from both production and preview collections
                    const prodDeleteSuccess = await deleteEventFromProduction(item.id, 'events_production');
                    const previewDeleteSuccess = await deleteEventFromProduction(item.id, 'events_preview');
                    
                    const deleteSuccess = prodDeleteSuccess && previewDeleteSuccess;
                    
                    if (deleteSuccess) {
                      setSyncStatus('success');
                      setLastSyncTime(Date.now());
                      Alert.alert(
                        '✅ Event Deleted', 
                        `"${item.title}" has been removed from the 3mpwr website and will disappear from calendar feeds shortly.`
                      );
                      trackEvent(ANALYTICS_EVENTS.EVENTS_DELETE, { id: item.id, synced: true, autoSync: true });
                    } else if (prodDeleteSuccess || previewDeleteSuccess) {
                      setSyncStatus('error');
                      Alert.alert(
                        '⚠️ Partially Deleted', 
                        `"${item.title}" removed from your device and partially synced. Cloud sync will retry automatically.`
                      );
                      trackEvent(ANALYTICS_EVENTS.EVENTS_DELETE, { id: item.id, synced: false, partial: true });
                    } else {
                      setSyncStatus('error');
                      Alert.alert(
                        '📱 Deleted Locally', 
                        `"${item.title}" removed from your device. Cloud sync will retry automatically when available.`
                      );
                      trackEvent(ANALYTICS_EVENTS.EVENTS_DELETE, { id: item.id, synced: false });
                    }
                  } catch (err) {
                    console.warn('[Events] Failed to delete from cloud:', err);
                    setSyncStatus('error');
                    Alert.alert('📱 Deleted Locally', `"${item.title}" removed from this device.`);
                    trackEvent(ANALYTICS_EVENTS.EVENTS_DELETE, { id: item.id, synced: false });
                  } finally {
                    // WCAG 2.2.1: Status display timing - users can disable auto-dismiss via Settings > Accessibility
                    setTimeout(() => setSyncStatus('idle'), 3000);
                  }
                }}
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(
  palette: ReturnType<typeof useAppPalette>,
  factor: number,
) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
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
    filterButton: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 8,
      marginBottom: 8,
      alignItems: 'center',
    },
    filterButtonText: {
      color: palette.text,
      fontSize: Math.round(15 * factor),
      fontWeight: '600',
    },
    filterBadge: {
      color: palette.primary,
      fontWeight: '700',
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
      width: '100%',
      marginBottom: 16,
    },
    weekHdr: {
      flex: 1,
      textAlign: "center",
      color: palette.textSecondary,
      fontSize: 11,
      paddingVertical: 4,
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      maxHeight: 40,
      borderRadius: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      alignItems: "center",
      justifyContent: "center",
      margin: 1,
    },
    dayText: { color: palette.text, fontSize: 12 },
  });
}

function CreateEventBox({ onCreate, palette }: { onCreate: (d: { title: string; description: string; date: string; time?: string; duration?: number; location?: string; isVirtual?: boolean; asl?: boolean; captions?: boolean; stepFree?: boolean; sensorySpace?: boolean; energyLevel?: string; requiresRSVP?: boolean; rsvpDetails?: string; }) => void; palette: any; }) {
  const { t } = useTranslation();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [isVirtual, setIsVirtual] = React.useState(false);
  const [asl, setAsl] = React.useState(false);
  const [captions, setCaptions] = React.useState(false);
  const [stepFree, setStepFree] = React.useState(false);
  const [sensorySpace, setSensory] = React.useState(false);
  const [energyLevel, setEnergyLevel] = React.useState<string>('medium'); // low, medium, high
  const [requiresRSVP, setRequiresRSVP] = React.useState(false);
  const [rsvpDetails, setRsvpDetails] = React.useState("");
  const valid = title.trim().length>2 && description.trim().length>4 && date.trim().length>3;
  const fieldStyle = { borderWidth:1, borderColor: palette.muted, borderRadius:8, paddingHorizontal:10, paddingVertical:8, color: palette.text, marginBottom:6 };
  return (
    <View style={{ marginBottom:12, alignSelf:'stretch', maxHeight: 500 }}>
      <ScrollView scrollEnabled={true} nestedScrollEnabled={true}>
        <TextInput placeholder={t('eventsFeature.form.titlePlaceholder','Event Name')} placeholderTextColor={palette.muted} value={title} onChangeText={setTitle} style={fieldStyle} />
        <TextInput placeholder={t('eventsFeature.form.descriptionPlaceholder','Description')} placeholderTextColor={palette.muted} value={description} onChangeText={setDescription} style={[fieldStyle,{ minHeight:60 }]} multiline={true} />
        <TextInput placeholder={t('eventsFeature.form.datePlaceholder','Date (YYYY-MM-DD)')} placeholderTextColor={palette.muted} value={date} onChangeText={setDate} style={fieldStyle} />
        <TextInput placeholder={t('eventsFeature.form.timePlaceholder','Time (HH:MM)')} placeholderTextColor={palette.muted} value={time} onChangeText={setTime} style={fieldStyle} />
        <TextInput placeholder={t('eventsFeature.form.durationPlaceholder','Duration (minutes)')} placeholderTextColor={palette.muted} value={duration} onChangeText={setDuration} style={fieldStyle} keyboardType="numeric" />
        <TextInput placeholder={t('eventsFeature.form.locationPlaceholder','Location (physical/virtual address)')} placeholderTextColor={palette.muted} value={location} onChangeText={setLocation} style={fieldStyle} />
        
        <Text style={{ color: palette.text, fontSize: 12, fontWeight: '600', marginTop: 8, marginBottom: 4 }}>Accessibility Features:</Text>
        <GapView gap={8} style={{ flexDirection:'row', flexWrap:'wrap', marginBottom:8 }}>
          <ToggleChip label={t('eventsFeature.chips.virtual','Virtual')} active={isVirtual} onToggle={()=>setIsVirtual(v=>!v)} palette={palette} />
          <ToggleChip label={t('eventsFeature.chips.asl','ASL')} active={asl} onToggle={()=>setAsl(v=>!v)} palette={palette} />
          <ToggleChip label={t('eventsFeature.chips.captions','Captions')} active={captions} onToggle={()=>setCaptions(v=>!v)} palette={palette} />
          <ToggleChip label={t('eventsFeature.chips.stepFree','Step-free')} active={stepFree} onToggle={()=>setStepFree(v=>!v)} palette={palette} />
          <ToggleChip label={t('eventsFeature.chips.sensory','Sensory Space')} active={sensorySpace} onToggle={()=>setSensory(v=>!v)} palette={palette} />
        </GapView>
        
        <Text style={{ color: palette.text, fontSize: 12, fontWeight: '600', marginTop: 8, marginBottom: 4 }}>Energy Cost Level:</Text>
        <GapView gap={8} style={{ flexDirection:'row', flexWrap:'wrap', marginBottom:8 }}>
          <ToggleChip label="Low" active={energyLevel==='low'} onToggle={()=>setEnergyLevel('low')} palette={palette} />
          <ToggleChip label="Medium" active={energyLevel==='medium'} onToggle={()=>setEnergyLevel('medium')} palette={palette} />
          <ToggleChip label="High" active={energyLevel==='high'} onToggle={()=>setEnergyLevel('high')} palette={palette} />
        </GapView>
        
        <Text style={{ color: palette.text, fontSize: 12, fontWeight: '600', marginTop: 8, marginBottom: 4 }}>RSVP/Registration:</Text>
        <GapView gap={8} style={{ flexDirection:'row', flexWrap:'wrap', marginBottom:8 }}>
          <ToggleChip label="Requires RSVP" active={requiresRSVP} onToggle={()=>setRequiresRSVP(v=>!v)} palette={palette} />
        </GapView>
        {requiresRSVP && (
          <TextInput 
            placeholder={t('eventsFeature.form.rsvpPlaceholder','RSVP link or email (optional)')} 
            placeholderTextColor={palette.muted} 
            value={rsvpDetails} 
            onChangeText={setRsvpDetails} 
            style={fieldStyle} 
          />
        )}
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
            onCreate({ 
              title: title.trim(), 
              description: description.trim(), 
              date: date.trim(), 
              time: time.trim() || undefined,
              duration: duration ? parseInt(duration, 10) : undefined,
              location: location.trim() || undefined, 
              isVirtual, 
              asl, 
              captions, 
              stepFree, 
              sensorySpace,
              energyLevel,
              requiresRSVP,
              rsvpDetails: requiresRSVP ? rsvpDetails.trim() : undefined
            }); 
            setTitle(''); 
            setDescription(''); 
            setDate(''); 
            setTime('');
            setDuration('');
            setLocation(''); 
            setIsVirtual(false); 
            setAsl(false); 
            setCaptions(false); 
            setStepFree(false); 
            setSensory(false);
            setEnergyLevel('medium');
            setRequiresRSVP(false);
            setRsvpDetails('');
          }}
          style={{ backgroundColor: valid ? palette.primary : palette.muted, paddingVertical:10, borderRadius:8, alignItems:'center', minHeight: 44, marginBottom: 8 }}
        >
          <Text style={{ color: valid ? palette.onPrimary : palette.text, fontWeight:'700' }}>{t('eventsFeature.form.add','Add Event')}</Text>
        </A11yPressable>
      </ScrollView>
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

