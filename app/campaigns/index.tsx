import { useRouter } from "expo-router";
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
    useColorScheme,
    View
} from "react-native";

import { CampaignsErrorBoundary } from "../../components/CampaignsErrorBoundary";
import CreateCampaignBox from "../../components/CreateCampaignBox";
import { RepTrackerSafe } from "../../components/RepTrackerSafe";
import ResponsiveScreenWrapper from "../../components/ResponsiveScreenWrapper";
import SearchBar from "../../components/SearchBar";
import SimpleModeWelcome from "../../components/SimpleModeWelcome";
import { SkeletonList } from '../../components/SkeletonLoader';
import SkeletonRow from "../../components/SkeletonRow";
import { useAuth } from "../../context/AuthContext";
import { campaigns as localCampaigns } from "../../data/campaigns";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import { usePostLoadAnnounce } from "../../hooks/usePostLoadAnnounce";
import { useTranslationSafe } from "../../i18n";
import { logActivity } from "../../services/activity";
import { trackEvent } from "../../services/analyticsClient";
import { fetchCampaigns } from "../../services/campaigns";
import {
    fsAddCampaign,
    fsIncrementCampaignMembers,
    fsJoinCampaign,
    fsLeaveCampaign,
} from "../../services/firestore";
import {
    isFirestoreSyncAvailable,
    syncCampaignToProduction,
} from "../../services/firestoreCampaignSync";
import { submitCampaignTo3mpwr } from "../../services/submitTo3mpwr";
import {
    CampaignsLocalProvider,
    useCampaignsLocal,
} from "../../store/campaignsLocal";
import { useComplexityMode } from "../../store/complexityMode";
import { useCounts } from "../../store/counts";
import { useNetwork } from "../../store/network";
import { useRefresh } from "../../store/refresh";
import { colors, type Palette } from "../../theme/colors";
import { logger } from "../../utils/logger";

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
  const router = useRouter();

  const titleRef = React.useRef<Text>(null);
  
  try {
    useAnnounceOnMount("Campaigns");
  } catch (err) {
    console.error('[Campaigns] useAnnounceOnMount failed:', err);
  }
  
  try {
    useFocusOnRefOnMount(titleRef);
  } catch (err) {
    console.error('[Campaigns] useFocusOnRefOnMount failed:', err);
  }

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = React.useRef(true);
  const isInitializedRef = React.useRef(false);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Ensure initial state is always a valid array
  const safeLocalCampaigns = React.useMemo(() => {
    return Array.isArray(localCampaigns) ? localCampaigns : [];
  }, []);

  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState(safeLocalCampaigns);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showRepTracker, setShowRepTracker] = React.useState(false);
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);

  // Context hooks - now safe with default fallbacks
  const { setCount } = useCounts();
  const { setOffline } = useNetwork();
  const { tick } = useRefresh();
  
  const campaignsContext = useCampaignsLocal();
  const { state: local, createCampaign, join, leave, isJoined } = campaignsContext || {
    state: { myCampaigns: [], joined: {} },
    createCampaign: () => ({ id: 'error', title: '', summary: '' }),
    join: () => {},
    leave: () => {},
    isJoined: () => false,
  };
  const { user } = useAuth();
  const { t } = useTranslationSafe();
  const { mode, isFeatureVisible } = useComplexityMode();
  const inFlightRef = React.useRef<Record<string, number>>({});

  const reload = React.useCallback(async () => {
    // Don't reload if component is unmounted
    if (!isMountedRef.current) {
      logger.warn('[Campaigns] Skipping reload - component unmounted');
      return;
    }

    try {
      if (isMountedRef.current) setError(null);
      if (isMountedRef.current) setLoading(true);
      
      const data = await fetchCampaigns();
      
      // Fetch campaigns from Firestore (campaigns_preview for dev/preview, campaigns_production for production)
      let firestoreCampaigns: any[] = [];
      try {
        const { fetchCampaignUpdates } = await import('../../services/firestoreCampaignSync');
        // Use preview collection for development, production collection for release builds
        // __DEV__ is true in development and EAS preview builds
        const collection = __DEV__ ? 'campaigns_preview' : 'campaigns_production';
        firestoreCampaigns = await fetchCampaignUpdates(collection);
      } catch (err) {
        console.warn('[Campaigns] Failed to fetch from Firestore:', err);
      }
      
      // Only update state if still mounted
      if (!isMountedRef.current) {
        logger.warn('[Campaigns] Skipping state update - component unmounted during fetch');
        return;
      }
      
      // Critical: Ensure data is always an array
      const validData = Array.isArray(data) ? data : [];
      
      // Merge Firestore campaigns with fetched data
      const existingIds = new Set(validData.map((c: any) => c.id));
      const newFirestoreCampaigns = firestoreCampaigns.filter((c: any) => !existingIds.has(c.id));
      const mergedData = [...newFirestoreCampaigns, ...validData];
      
      setItems(mergedData);
      setOffline(false);
      setLastSyncTime(new Date());
      
      isInitializedRef.current = true;
    } catch (err) {
      if (!isMountedRef.current) return;
      
      logger.error('[Campaigns] Failed to reload campaigns:', err);
      setError("Failed to load campaigns");
      setOffline(true);
      // Don't crash - use existing items or fallback to local campaigns
      if (!items || !Array.isArray(items) || items.length === 0) {
        setItems(safeLocalCampaigns);
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [setOffline, items, safeLocalCampaigns]);
  
  React.useEffect(() => {
    // Don't reload if already initialized and this is just a tab switch
    if (isInitializedRef.current) {
      logger.log('[Campaigns] Skipping reload - already initialized');
      return;
    }

    // Protect against multiple simultaneous loads
    let cancelled = false;
    
    const doLoad = async () => {
      if (cancelled || !isMountedRef.current) return;
      
      try {
        await reload();
      } catch (err) {
        if (!cancelled && isMountedRef.current) {
          logger.error('[Campaigns] Error in initial load:', err);
          // Fallback to local campaigns with safety check
          setItems(safeLocalCampaigns);
          setLoading(false);
        }
      }
    };
    
    doLoad();
    
    return () => {
      cancelled = true;
    };
  }, [tick, reload, safeLocalCampaigns]); // Added dependencies back but with initialization guard

  // Real-time sync: Poll API every 5 minutes
  React.useEffect(() => {
    const interval = setInterval(() => {
      reload().catch((err) => {
        logger.error('[Campaigns] Error in background sync:', err);
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [reload]);

  React.useEffect(() => {
    setCount("campaigns", items.length);
  }, [items, setCount]);

  // One-time polite announcement of loaded count
  try {
    usePostLoadAnnounce({ loading, count: items.length, ns: 'campaigns' });
  } catch (err) {
    console.error('[Campaigns] usePostLoadAnnounce failed:', err);
  }

  // Safe wrapper for isJoined to prevent crashes
  const safeIsJoined = React.useCallback((id: any) => {
    try {
      if (!id || typeof isJoined !== 'function') return false;
      return isJoined(id);
    } catch (err) {
      logger.error('[Campaigns] Error checking isJoined:', err);
      return false;
    }
  }, [isJoined]);

  type Mixed = (typeof local.myCampaigns[number] & { kind?: 'campaign' });
  const allItems = React.useMemo<Mixed[]>(
    () => {
      // Safety checks - ensure all inputs are arrays
      const safeMyCampaigns = Array.isArray(local?.myCampaigns) ? local.myCampaigns : [];
      const safeItems = Array.isArray(items) ? items : [];
      
      // Deduplicate: combine campaigns by ID to avoid showing duplicates
      const campaignMap = new Map<string, Mixed>();
      
      // Add all campaigns from items first (these are from Firestore/API)
      for (const c of safeItems) {
        if (c?.id) {
          campaignMap.set(c.id, { ...c, kind: 'campaign' as const });
        }
      }
      
      // Add/override with myCampaigns (user-created campaigns take precedence)
      for (const c of safeMyCampaigns) {
        if (c?.id) {
          campaignMap.set(c.id, { ...c, kind: 'campaign' as const });
        }
      }
      
      return Array.from(campaignMap.values());
    },
    [local?.myCampaigns, items],
  );

  const joinedCount = React.useMemo(() => {
    if (!local?.joined || typeof local.joined !== 'object') return 0;
    return Object.keys(local.joined).length;
  }, [local?.joined]);

  const sections = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let campaigns = Array.isArray(allItems) ? allItems : [];
    
    // In Simple Mode, show only featured/important campaigns (max 5)
    if (mode === 'simple') {
      campaigns = campaigns
        .filter((c: any) => c.petitionId || c.featured) // Show only petitions or featured campaigns
        .slice(0, 5); // Limit to 5 campaigns
    }
    
    // Your campaigns: joined or created locally
    const safeMyCampaigns = Array.isArray(local?.myCampaigns) ? local.myCampaigns : [];
    const your = campaigns.filter(i => {
      try {
        return safeIsJoined(i?.id) || safeMyCampaigns.some(m => m?.id === i?.id);
      } catch {
        return false;
      }
    });
    const yourIds = new Set(your.map(i => i?.id).filter(Boolean));
    
    // Other campaigns (dedup your)
    const others = campaigns.filter(i => !yourIds.has(i?.id));

    const match = (c: any) => {
      if (!q || !c) return !q;
      try {
        const title = c.title || '';
        const summary = c.summary || '';
        return (
          title.toLowerCase().includes(q) ||
          summary.toLowerCase().includes(q)
        );
      } catch {
        return false;
      }
    };

    const sec = [
      { title: mode === 'simple' ? 'Featured Campaigns' : 'Your Campaigns', data: your.filter(match) },
      { title: mode === 'simple' ? 'Important Petitions' : 'All Campaigns', data: others.filter(match) },
    ].filter(s => Array.isArray(s.data) && s.data.length > 0);
    return sec as { title: string; data: Mixed[] }[];
  }, [query, allItems, local?.myCampaigns, safeIsJoined, mode]);

  // Handle campaign submission to 3mpwr App
  const handleSubmitTo3mpwr = React.useCallback(async (campaign: any) => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to submit campaigns to the 3mpwr App.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Submit Campaign to 3mpwr App',
      `Submit "${campaign.title}" for review by the 3mpwr team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              const result = await submitCampaignTo3mpwr(campaign, {
                uid: user.uid,
                email: user.email ?? undefined,
                displayName: user.displayName ?? undefined,
              });
              
              if (result.success) {
                Alert.alert(
                  '✅ Campaign Submitted',
                  result.message || 'Your campaign has been submitted for review.',
                  [{ text: 'Great!' }]
                );
                
                // Track analytics
                try {
                  trackEvent('campaign.submit_to_3mpwr', {
                    campaignId: campaign.id,
                    title: campaign.title,
                  });
                } catch {}
              } else {
                Alert.alert(
                  '⏳ Submission Queued',
                  result.message || 'Your submission will retry automatically when online.',
                  [{ text: 'OK' }]
                );
              }
            } catch (err) {
              logger.error('[Campaigns] Submit error:', err);
              Alert.alert(
                'Submission Failed',
                'Unable to submit campaign. Please try again later.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  }, [user]);

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
            <RepTrackerSafe />
          </View>
        ) : loading ? (
          <View style={{ padding: 20 }}>
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
            <SkeletonList count={8} />
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
          
          {/* Simple Mode Welcome */}
          <SimpleModeWelcome 
            tabName="Campaigns"
            availableFeatures={['Featured Campaigns', 'Top Petitions']}
            hiddenCount={mode === 'simple' ? Math.max(0, (Array.isArray(allItems) ? allItems.length : 0) - 5) : 0}
          />
          
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
              <Text style={styles.statNumber}>{joinedCount || 0}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{Array.isArray(allItems) ? allItems.length : 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{Array.isArray(local?.myCampaigns) ? local.myCampaigns.length : 0}</Text>
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

        {/* Hide Create Campaign in Simple Mode */}
        {isFeatureVisible('standard') && (
          <CreateCampaignBox
            onCreate={async (data) => {
            try {
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
                membersCount: 0,
                status: 'published' as const,
              };
              
              // Check if Firestore sync is available
              const isSyncAvailable = await isFirestoreSyncAvailable();
              
              if (isSyncAvailable && user?.uid) {
                // Auto-sync to Firestore production & preview collections
                const productionSuccess = await syncCampaignToProduction(
                  campaignData,
                  user.uid,
                  'campaigns_production'
                );
                const previewSuccess = await syncCampaignToProduction(
                  campaignData,
                  user.uid,
                  'campaigns_preview'
                );
                
                const firestoreSuccess = productionSuccess && previewSuccess;
                
                // Also sync to Cloudflare Worker (website)
                let workerSuccess = false;
                if (firestoreSuccess) {
                  try {
                    const { syncCampaignToWebsite } = await import('../../services/campaignSync');
                    workerSuccess = await syncCampaignToWebsite(campaignData);
                  } catch (err) {
                    console.warn('[Campaigns] Failed to sync to Cloudflare Worker:', err);
                  }
                }
                
                const syncSuccess = firestoreSuccess && workerSuccess;
                
                if (syncSuccess) {
                  // Send push notification to all users about new campaign
                  try {
                    const { sendCampaignNotification } = await import('../../services/notifications');
                    await sendCampaignNotification(campaignData);
                  } catch (notifErr) {
                    console.warn('[Campaigns] Failed to send push notification:', notifErr);
                  }
                  
                  Alert.alert(
                    '✅ Campaign Published!',
                    `"${campaignData.title}" is now live on the 3mpwr website and Cloudflare Workers.`,
                    [{ text: 'Great!' }]
                  );
                } else {
                  // Fallback: Add to local Firestore (old behavior)
                  await fsAddCampaign(campaignData);
                  Alert.alert(
                    'Campaign Created',
                    'Campaign saved locally. Cloud sync will retry automatically.',
                    [{ text: 'OK' }]
                  );
                }
              } else {
                // Offline or not signed in - save locally only
                await fsAddCampaign(campaignData);
                Alert.alert(
                  '📱 Campaign Saved Locally',
                  user?.uid
                    ? 'Campaign created. Cloud sync will retry when connection is available.'
                    : 'Campaign saved locally. Sign in to publish to the 3mpwr website.',
                  [{ text: 'OK' }]
                );
              }
            } catch (createErr) {
              logger.error('[Campaigns] Failed to create campaign:', createErr);
              Alert.alert('Creation Failed', 'Could not create campaign. Please try again later.');
            }
          }}
          palette={palette}
        />
        )}

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
          sections={Array.isArray(sections) ? sections : []}
          keyExtractor={(item) => `thread-${item?.id || Math.random()}`}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.subtitle, { marginTop: 8, fontWeight:'700' }]}>
              {section?.title || 'Campaigns'}
            </Text>
          )}
          renderItem={({ item }) => {
            // Safety check - skip invalid items
            if (!item || !item.id) return null;
            
            return (
            <View style={styles.campaignCard}>
              <Pressable // a11y-scan: accessibilityRole and hitSlop on next lines
                onPress={() => router.push({ pathname: "/campaigns/[id]", params: { id: item.id } } as any)}
                style={styles.cardContent}
                accessibilityRole="button"
                accessibilityLabel={`View campaign: ${item.title}`}
                accessibilityHint="Opens campaign details"
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
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
                    {safeIsJoined(item.id) && (
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
                                  ? palette.success
                                  : ((item.membersCount || 0) / item.goalCount) >= 0.5
                                  ? palette.warning
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
              <View style={styles.actionRow}>
                {/* Submit to 3mpwr App button for user-created campaigns */}
                {item.id.startsWith('cmp-') && (
                  <Pressable
                    onPress={() => handleSubmitTo3mpwr(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Submit campaign ${item.title} to 3mpwr App`}
                    style={[styles.actionButton, styles.submitTo3mpwrButton]}
                  >
                    <Text style={styles.actionButtonText}>🚀 Submit to 3mpwr App</Text>
                  </Pressable>
                )}
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
                {/* Quick action for creator page - Visit Creator */}
                {(item as any).websiteUrl && (
                  <Pressable
                    onPress={() => {
                      Linking.openURL((item as any).websiteUrl);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Visit creator page for ${item.title}`}
                    style={[styles.actionButton, styles.websiteButton]}
                  >
                    <Text style={styles.actionButtonText}>🌐 Visit Creator</Text>
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
                  accessibilityLabel={(t('a11y.shareCampaign') || 'Share campaign {{title}}').replace('{{title}}', item.title)}
                  style={[styles.actionButton, styles.shareButton]}
                >
                  <Text style={styles.actionButtonText}>📤</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    try {
                      const now = Date.now();
                      if (inFlightRef.current[item.id] && now - inFlightRef.current[item.id] < 1200) return;
                      inFlightRef.current[item.id] = now;
                      const joined = safeIsJoined(item.id);
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
                    } catch (err) {
                      logger.error('[Campaigns] Join/leave error:', err);
                      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={
                    safeIsJoined(item.id) 
                      ? (t('a11y.leaveCampaign') || 'Leave campaign {{title}}').replace('{{title}}', item.title)
                      : (t('a11y.joinCampaign') || 'Join campaign {{title}}').replace('{{title}}', item.title)
                  }
                  style={[
                    styles.actionButton,
                    safeIsJoined(item.id) ? styles.joinedButton : styles.joinButton,
                    ((inFlightRef.current[item.id] && Date.now() - inFlightRef.current[item.id] < 400) ? { opacity: 0.6 } : null)
                  ]}
                >
                  <Text style={[styles.actionButtonText, safeIsJoined(item.id) && styles.joinedButtonText]}>
                    {safeIsJoined(item.id) ? '✓ Joined' : '➕ Join'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    try { await fsIncrementCampaignMembers(item.id, 1); } catch {}
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('a11y.supportCampaign') || 'Support this campaign'}
                  style={[styles.actionButton, styles.supportButton]}
                >
                  <Text style={styles.actionButtonText}>👍 +1</Text>
                </Pressable>
              </View>
            </View>
            );
          }}
          ListEmptyComponent={!loading && !error ? (
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: palette.text, opacity: 0.8, marginBottom: 6 }}>{t('campaigns.empty','No campaigns match your filters')}</Text>
              {query ? (
                <Pressable
                  onPress={() => setQuery('')}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.resetFilters','Reset filters')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
    <CampaignsErrorBoundary>
      <CampaignsLocalProvider>
        <ScreenInner />
      </CampaignsLocalProvider>
    </CampaignsErrorBoundary>
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
      backgroundColor: palette.warning,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    featuredBadgeText: {
      color: palette.onPrimary,
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
    websiteButton: {
      backgroundColor: palette.accent || palette.primary,
      flex: 1.5,
    },
    submitTo3mpwrButton: {
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





