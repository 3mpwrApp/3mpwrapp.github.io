import { Link } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  SectionList,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import RepTracker from "../../components/RepTracker";
import ResponsiveScreenWrapper from "../../components/ResponsiveScreenWrapper";
import SearchBar from "../../components/SearchBar";
import SkeletonRow from "../../components/SkeletonRow";
import { useAuth } from "../../context/AuthContext";
import { campaigns as localCampaigns } from "../../data/campaigns";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import { usePostLoadAnnounce } from "../../hooks/usePostLoadAnnounce";
import { useTranslation } from "../../i18n";
import { logActivity } from "../../services/activity";
import { fetchCampaigns } from "../../services/campaigns";
import { syncCampaignToWebsite } from "../../services/campaignSync";
import {
  fsAddCampaign,
  fsIncrementCampaignMembers,
  fsJoinCampaign,
  fsLeaveCampaign,
} from "../../services/firestore";
import {
  CampaignsLocalProvider,
  useCampaignsLocal,
} from "../../store/campaignsLocal";
import { useCounts } from "../../store/counts";
import { useNetwork } from "../../store/network";
import { useRefresh } from "../../store/refresh";
import { colors, type Palette } from "../../theme/colors";
import { logger } from "../../utils/logger";

 
const { trackEvent } = require("../../services/analyticsClient");

/**
 * Format sync time as relative time (e.g., "2 minutes ago")
 */
function formatSyncTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  return `${Math.floor(seconds / 3600)} hours ago`;
}

function ScreenInner() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);

  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Campaigns");
  useFocusOnRefOnMount(titleRef);

  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState(localCampaigns);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showRepTracker, setShowRepTracker] = React.useState(false);
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);

  const { setCount } = useCounts();
  const { setOffline } = useNetwork();
  const { state: local, createCampaign, join, leave, isJoined } = useCampaignsLocal();
  const { user } = useAuth();
  const { t } = useTranslation();
  const inFlightRef = React.useRef<Record<string, number>>({});

  const reload = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchCampaigns();
      setItems(data);
      setOffline(false);
      setLastSyncTime(new Date());
    } catch {
      setError("Failed to load campaigns");
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [setOffline]);

  const { tick } = useRefresh();
  React.useEffect(() => {
    reload();
  }, [reload, tick]);

  // Real-time sync: Poll API every 5 minutes
  React.useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [reload]);

  React.useEffect(() => {
    setCount("campaigns", items.length);
  }, [items, setCount]);

  // One-time polite announcement of loaded count
  usePostLoadAnnounce({ loading, count: items.length, ns: 'campaigns' });

  type Mixed = (typeof local.myCampaigns[number] & { kind?: 'campaign' });
  const allItems = React.useMemo<Mixed[]>(
    () => [
      ...local.myCampaigns.map(c => ({ ...c, kind: 'campaign' as const })),
      ...items.map(c => ({ ...c, kind: 'campaign' as const })),
    ],
    [local.myCampaigns, items],
  );

  const joinedCount = React.useMemo(() => Object.keys(local.joined).length, [local.joined]);

  const sections = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const campaigns = allItems;
    // Your campaigns: joined or created locally
    const your = campaigns.filter(i => isJoined(i.id) || local.myCampaigns.some(m => m.id === i.id));
    const yourIds = new Set(your.map(i => i.id));
    // Other campaigns (dedup your)
    const others = campaigns.filter(i => !yourIds.has(i.id));

    const match = (c: any) => {
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        (c.summary || '').toLowerCase().includes(q)
      );
    };

    const sec = [
      { title: 'Your Campaigns', data: your.filter(match) },
      { title: 'All Campaigns', data: others.filter(match) },
    ].filter(s => s.data.length > 0);
    return sec as { title: string; data: Mixed[] }[];
  }, [query, allItems, local.myCampaigns, isJoined]);

  return (
    <ResponsiveScreenWrapper>
      <View style={[styles.container, { flex: 1 }]}>
        {showRepTracker ? (
          <View style={{ flex: 1 }}>
            <Pressable
              onPress={() => setShowRepTracker(false)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                backgroundColor: palette.surface,
                borderBottomWidth: 1,
                borderBottomColor: palette.muted,
              }}
            >
              <Text style={{ color: palette.primary, fontSize: 16, fontWeight: '600' }}>
                ← Back to Campaigns
              </Text>
            </Pressable>
            <RepTracker />
          </View>
        ) : (
          <>
        <View style={styles.headerCard}>
          <Text
            ref={titleRef}
            nativeID="campaigns-title"
            accessibilityRole="header"
            style={styles.title}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            📣 Campaigns
          </Text>
          <Text style={styles.subtitle}>Browse, create, and join campaigns for disability justice and workers' rights.</Text>
          
          {/* Real-time sync status */}
          <View style={styles.syncStatus}>
            <Text style={styles.syncText}>
              {loading ? '🔄 Syncing...' : lastSyncTime 
                ? `✅ Synced with https://3mpwrapp.pages.dev/campaigns/ - ${formatSyncTime(lastSyncTime)}`
                : '🔄 Connecting to API...'}
            </Text>
            <Pressable
              onPress={reload}
              style={styles.syncButton}
              accessibilityLabel="Refresh campaigns"
              accessibilityRole="button"
            >
              <Text style={styles.syncButtonText}>↻ Refresh</Text>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{joinedCount}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{allItems.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{local.myCampaigns.length}</Text>
              <Text style={styles.statLabel}>Created</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowRepTracker(true)}
            style={{
              marginTop: 16,
              backgroundColor: palette.primary,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: palette.onPrimary, fontSize: 16, fontWeight: '700' }}>
              🗳️ Rep Tracker
            </Text>
          </Pressable>
        </View>

        <CreateCampaignBox
          onCreate={async (data) => {
            const c = createCampaign(data.title, data.summary);
            try { trackEvent("campaign_create", { id: c.id }); } catch {}
            const campaignData = {
              id: c.id,
              title: data.title,
              summary: data.summary,
              target: data.target || undefined,
              goalCount: data.goalCount || undefined,
              contactEmail: data.contactEmail || undefined,
              createdBy: user?.uid || 'anonymous',
              createdAt: Date.now(),
            };
            // Add to Firestore
            await fsAddCampaign(campaignData);
            // Sync to website (fire and forget, don't block UI)
            syncCampaignToWebsite({
              ...campaignData,
              membersCount: 0,
            }).catch((error) => {
              logger.error('[Campaigns] Failed to sync to website:', error);
            });
            Alert.alert('Campaign Created!', 'Your campaign has been created and will be synced to the website shortly.');
          }}
          palette={palette}
        />

        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search campaigns"
        />

        {loading && (
          <View>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </View>
        )}

        {error && (
          <>
            <Text accessibilityRole="alert" style={styles.subtitle}>
              {error}
            </Text>
            <Text
              onPress={reload}
              style={[styles.subtitle, { textDecorationLine: "underline" }]}
              accessibilityRole="button"
              accessibilityLabel="Try again"
            >
              Try again
            </Text>
          </>
        )}

        <SectionList
          sections={sections}
          keyExtractor={(item) => `thread-${item.id}`}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.subtitle, { marginTop: 8, fontWeight:'700' }]}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <View style={styles.campaignCard}>
              <Link
                href={{ pathname: "/(tabs)/campaigns/[id]", params: { id: item.id } } as any}
                asChild={true}
              >
                <Pressable style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      {/* Featured badge for important campaigns */}
                      {(item as any).petitionId && (
                        <View style={styles.featuredBadge}>
                          <Text style={styles.featuredBadgeText}>⭐ FEATURED PETITION</Text>
                        </View>
                      )}
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title}
                        {(item as any).petitionId && ' 📝'}
                      </Text>
                      {(item as any).target && (
                        <Text style={styles.targetText}>
                          → {(item as any).target}
                        </Text>
                      )}
                    </View>
                    {isJoined(item.id) && (
                      <View style={styles.joinedBadge}>
                        <Text style={styles.joinedBadgeText}>✓ Joined</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.cardSummary} numberOfLines={3}>
                    {item.summary}
                  </Text>
                  
                  {/* Progress Bar for campaigns with goals */}
                  {item.goalCount && item.goalCount > 0 && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBarWrapper}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${Math.min(
                                ((item.membersCount || 0) / item.goalCount) * 100,
                                100
                              )}%`,
                              backgroundColor: 
                                ((item.membersCount || 0) / item.goalCount) >= 0.75
                                  ? palette.success || '#22c55e'
                                  : ((item.membersCount || 0) / item.goalCount) >= 0.5
                                  ? palette.warning || '#f59e0b'
                                  : palette.primary,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.progressTextRow}>
                        <Text style={styles.progressText}>
                          {(item.membersCount || 0).toLocaleString()} / {item.goalCount.toLocaleString()}
                          {(item as any).petitionId ? ' signatures' : ' supporters'}
                        </Text>
                        <Text style={[styles.progressText, { fontWeight: '700', color: palette.primary }]}>
                          {Math.round(((item.membersCount || 0) / item.goalCount) * 100)}%
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {!item.goalCount && item.membersCount && (
                    <View style={styles.cardFooter}>
                      <Text style={styles.supportersText}>
                        👥 {item.membersCount.toLocaleString()} supporters
                      </Text>
                    </View>
                  )}
                </Pressable>
              </Link>
              <View style={styles.actionRow}>
                {/* Quick action for petitions - Sign Now */}
                {(item as any).petitionUrl && (
                  <Pressable
                    onPress={() => {
                      Linking.openURL((item as any).petitionUrl);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Sign petition ${(item as any).petitionId || ''}`}
                    style={[styles.actionButton, styles.signPetitionButton]}
                  >
                    <Text style={styles.actionButtonText}>📝 Sign Now</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={async () => {
                    try {
                      const shareMessage = (item as any).shareTemplates?.twitter || 
                        `📣 ${item.title}\n\n${item.summary}\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/campaigns/`;
                      await Share.share({
                        message: shareMessage,
                        title: item.title,
                      });
                    } catch {}
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('a11y.shareCampaign').replace('{{title}}', item.title)}
                  style={[styles.actionButton, styles.shareButton]}
                >
                  <Text style={styles.actionButtonText}>📤</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    const now = Date.now();
                    if (inFlightRef.current[item.id] && now - inFlightRef.current[item.id] < 1200) return;
                    inFlightRef.current[item.id] = now;
                    const joined = isJoined(item.id);
                    if (joined) {
                      leave(item.id);
                      const uid = user?.uid || 'anonymous';
                      const ok = await fsLeaveCampaign(item.id, uid);
                      if (!ok) {
                        join(item.id);
                        Alert.alert('Leave Failed', 'Could not leave campaign (offline?)');
                      } else {
                        Alert.alert('Left Campaign', 'You have left this campaign.');
                        logActivity({ type: 'feature.use', payload: { feature: 'campaign.leave', id: item.id } });
                      }
                    } else {
                      join(item.id);
                      const uid = user?.uid || 'anonymous';
                      const ok = await fsJoinCampaign(item.id, uid);
                      if (!ok) {
                        leave(item.id);
                        Alert.alert('Join Failed', 'Could not join campaign (offline?)');
                      } else {
                        Alert.alert('Joined Campaign', 'You are now supporting this campaign.');
                        logActivity({ type: 'feature.use', payload: { feature: 'campaign.join', id: item.id } });
                      }
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={isJoined(item.id) ? t('a11y.leaveCampaign').replace('{{title}}', item.title) : t('a11y.joinCampaign').replace('{{title}}', item.title)}
                  style={[
                    styles.actionButton,
                    isJoined(item.id) ? styles.joinedButton : styles.joinButton,
                    ((inFlightRef.current[item.id] && Date.now() - inFlightRef.current[item.id] < 400) ? { opacity: 0.6 } : null)
                  ]}
                >
                  <Text style={[styles.actionButtonText, isJoined(item.id) && styles.joinedButtonText]}>
                    {isJoined(item.id) ? '✓ Joined' : '➕ Join'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    try { await fsIncrementCampaignMembers(item.id, 1); } catch {}
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('a11y.supportCampaign')}
                  style={[styles.actionButton, styles.supportButton]}
                >
                  <Text style={styles.actionButtonText}>👍 +1</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={!loading && !error ? (
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: palette.text, opacity: 0.8, marginBottom: 6 }}>{t('campaigns.empty','No campaigns match your filters')}</Text>
              {query ? (
                <Pressable
                  onPress={() => setQuery('')}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.resetFilters','Reset filters')}
                  style={({ pressed }) => [{ alignSelf:'flex-start', paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }, pressed && { opacity: 0.8 }]}
                >
                  <Text style={{ color: palette.text, fontWeight:'700' }}>{t('common.resetFilters','Reset filters')}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          contentContainerStyle={{ paddingVertical: 12 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={reload} />
          }
        />
        </>
        )}
      </View>
    </ResponsiveScreenWrapper>
  );
}

export default function CampaignsScreen() {
  return (
    <CampaignsLocalProvider>
      <ScreenInner />
    </CampaignsLocalProvider>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    headerCard: {
      backgroundColor: palette.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 8,
      color: palette.text,
    },
    subtitle: {
      fontSize: 15,
      color: palette.text,
      opacity: 0.85,
      marginBottom: 12,
      lineHeight: 21,
    },
    syncStatus: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: palette.background,
      padding: 10,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    syncText: {
      fontSize: 12,
      color: palette.textSecondary,
      flex: 1,
      marginRight: 8,
      lineHeight: 16,
    },
    syncButton: {
      backgroundColor: palette.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    syncButtonText: {
      color: palette.onPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.muted,
    },
    statBox: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: palette.text,
      opacity: 0.7,
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    campaignCard: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      overflow: 'hidden',
    },
    cardContent: {
      padding: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      flex: 1,
      marginRight: 8,
      lineHeight: 24,
    },
    targetText: {
      fontSize: 12,
      color: palette.textSecondary,
      fontWeight: '600',
      marginTop: 4,
      fontStyle: 'italic',
    },
    featuredBadge: {
      backgroundColor: palette.warning || '#f59e0b',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    featuredBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    joinedBadge: {
      backgroundColor: palette.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    joinedBadgeText: {
      color: palette.onPrimary,
      fontSize: 11,
      fontWeight: '700',
    },
    cardSummary: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.8,
      lineHeight: 20,
      marginBottom: 8,
    },
    progressContainer: {
      marginTop: 8,
      marginBottom: 8,
    },
    progressBarWrapper: {
      height: 8,
      backgroundColor: palette.muted,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 6,
    },
    progressBar: {
      height: '100%',
      borderRadius: 4,
    },
    progressTextRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressText: {
      fontSize: 12,
      color: palette.text,
      fontWeight: '600',
      opacity: 0.8,
    },
    cardFooter: {
      marginTop: 4,
    },
    supportersText: {
      fontSize: 13,
      color: palette.text,
      opacity: 0.7,
      fontWeight: '600',
    },
    actionRow: {
      flexDirection: 'row',
      padding: 12,
      gap: 8,
      backgroundColor: palette.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.muted,
      flexWrap: 'wrap',
    },
    actionButton: {
      flex: 1,
      minWidth: 80,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signPetitionButton: {
      backgroundColor: palette.primary,
      flex: 2,
    },
    shareButton: {
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      flex: 0.8,
    },
    joinButton: {
      backgroundColor: palette.primary,
    },
    joinedButton: {
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.primary,
    },
    supportButton: {
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: palette.onPrimary,
    },
    joinedButtonText: {
      color: palette.primary,
    },
  });
}

function CreateCampaignBox({
  onCreate,
  palette,
}: {
  onCreate: (data: {
    title: string;
    summary: string;
    target?: string;
    goalCount?: number;
    contactEmail?: string;
  }) => void;
  palette: Palette;
}) {
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [goalCount, setGoalCount] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);
  const canCreate = title.trim().length > 2 && summary.trim().length > 4;

  const boxStyles = StyleSheet.create({
    container: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: expanded ? 16 : 0,
    },
    headerText: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
    },
    toggleButton: {
      padding: 4,
    },
    toggleText: {
      fontSize: 24,
      color: palette.primary,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      marginBottom: 10,
      backgroundColor: palette.background,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
      opacity: 0.8,
    },
    createButton: {
      backgroundColor: palette.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 6,
    },
    createButtonText: {
      color: palette.onPrimary,
      fontWeight: "700",
      fontSize: 15,
    },
  });

  const field = (label: string, ph: string, val: string, set: (v: string) => void, multiline = false) => (
    <View>
      <Text style={boxStyles.inputLabel}>{label}</Text>
      <TextInput
        placeholder={ph}
        placeholderTextColor={palette.muted}
        value={val}
        onChangeText={set}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        style={[boxStyles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
      />
    </View>
  );

  return (
    <View style={boxStyles.container}>
      <Pressable onPress={() => setExpanded(!expanded)} style={boxStyles.header}>
        <Text style={boxStyles.headerText}>✨ Create New Campaign</Text>
        <View style={boxStyles.toggleButton}>
          <Text style={boxStyles.toggleText}>{expanded ? '−' : '+'}</Text>
        </View>
      </Pressable>
      {expanded && (
        <>
          {field("Campaign Title *", "Enter campaign title", title, setTitle)}
          {field("Summary *", "Brief description of your campaign", summary, setSummary, true)}
          {field("Target (Optional)", "e.g., Ministry of Labour", target, setTarget)}
          {field("Goal Count (Optional)", "Number of supporters needed", goalCount, setGoalCount)}
          {field("Contact Email (Optional)", "Your email for campaign updates", contactEmail, setContactEmail)}
          <Pressable
            onPress={() => {
              if (!canCreate) return;
              onCreate({
                title: title.trim(),
                summary: summary.trim(),
                target: target.trim() || undefined,
                goalCount: goalCount ? Number(goalCount) : undefined,
                contactEmail: contactEmail.trim() || undefined,
              });
              setTitle("");
              setSummary("");
              setTarget("");
              setGoalCount("");
              setContactEmail("");
              setExpanded(false);
            }}
            disabled={!canCreate}
            style={[boxStyles.createButton, !canCreate && { opacity: 0.5 }]}
          >
            <Text style={boxStyles.createButtonText}>
              🚀 Create Campaign
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}





