import { Link } from "expo-router";
import React from "react";
import {
    Alert,
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

import Card from "../../components/Card";
import { GapView } from "../../components/GapView";
import ResponsiveScreenWrapper from "../../components/ResponsiveScreenWrapper";
import SearchBar from "../../components/SearchBar";
import SkeletonRow from "../../components/SkeletonRow";
import { useAuth } from "../../context/AuthContext";
import { campaigns as localCampaigns } from "../../data/campaigns";
import { petitions } from "../../data/petitions";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import { usePostLoadAnnounce } from "../../hooks/usePostLoadAnnounce";
import { useTranslation } from "../../i18n";
import { logActivity } from "../../services/activity";
import { fetchCampaigns } from "../../services/campaigns";
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

 
const { trackEvent } = require("../../services/analyticsClient");

function ScreenInner() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);

  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Campaigns");
  useFocusOnRefOnMount(titleRef);

  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState(localCampaigns);
  const [localPetitions] = React.useState(petitions);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  React.useEffect(() => {
    setCount("campaigns", items.length);
  }, [items, setCount]);

  // One-time polite announcement of loaded count
  usePostLoadAnnounce({ loading, count: items.length, ns: 'campaigns' });

  type Mixed = (typeof local.myCampaigns[number] & { kind?: 'campaign' | 'petition' });
  const allItems = React.useMemo<Mixed[]>(
    () => [
      ...local.myCampaigns.map(c => ({ ...c, kind: 'campaign' as const })),
      ...items.map(c => ({ ...c, kind: 'campaign' as const })),
      ...localPetitions.map(p => ({ ...p, kind: 'petition' as const })),
    ],
    [local.myCampaigns, items, localPetitions],
  );

  const joinedCount = React.useMemo(() => Object.keys(local.joined).length, [local.joined]);

  const sections = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const campaigns = allItems.filter(i => (i as any).kind !== 'petition');
    // Your campaigns: joined or created locally
    const your = campaigns.filter(i => isJoined(i.id) || local.myCampaigns.some(m => m.id === i.id));
    const yourIds = new Set(your.map(i => i.id));
    // Other campaigns (dedup your)
    const others = campaigns.filter(i => !yourIds.has(i.id));
    const petitionsOnly = allItems.filter(i => (i as any).kind === 'petition');

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
      { title: 'Petitions', data: petitionsOnly.filter(match) },
    ].filter(s => s.data.length > 0);
    return sec as { title: string; data: Mixed[] }[];
  }, [query, allItems, local.myCampaigns, isJoined]);

  return (
    <ResponsiveScreenWrapper scrollable>
      <View style={[styles.container, { flex: 1 }]}>
        <Text
          ref={titleRef}
          nativeID="campaigns-title"
          accessibilityRole="header"
          style={styles.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          Campaigns
        </Text>
        <Text style={styles.subtitle}>Browse, create, and join campaigns.</Text>
        <Text style={[styles.subtitle, { fontSize:14, opacity:0.8 }]} accessibilityLabel={`You have joined ${joinedCount} campaigns`}>
          Joined: {joinedCount} / {allItems.length}
        </Text>

        <CreateCampaignBox
          onCreate={async (data) => {
            const c = createCampaign(data.title, data.summary);
            try { trackEvent("campaign_create", { id: c.id }); } catch {}
            await fsAddCampaign({
              id: c.id,
              title: data.title,
              summary: data.summary,
              target: data.target || undefined,
              goalCount: data.goalCount || undefined,
              contactEmail: data.contactEmail || undefined,
              createdAt: Date.now(),
            });
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
            <View style={{ marginBottom:12 }}>
              <Link
                href={{ pathname: "/(tabs)/campaigns/[id]", params: { id: item.id } } as any}
                asChild
              >
                <Card
                  title={item.title + ((item as any).kind === 'petition' ? ' (Petition)' : '')}
                  subtitle={`${item.summary}${item.membersCount ? ` - ${item.membersCount} supporters` : ""}`}
                />
              </Link>
              <GapView gap={8} style={{ flexDirection:'row', marginTop:6 }}>
                <Pressable
                  onPress={async () => {
                    try {
                      await Share.share({
                        message: `${item.title}\n${item.summary}`,
                        title: item.title,
                      });
                    } catch {}
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('a11y.shareCampaign').replace('{{title}}', item.title)}
                  style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, paddingHorizontal:10, paddingVertical:6 }}
                >
                  <Text style={{ color: palette.text, fontWeight:'700', fontSize:12 }}>Share</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    const now = Date.now();
                    if (inFlightRef.current[item.id] && now - inFlightRef.current[item.id] < 1200) return; // rate limit
                    inFlightRef.current[item.id] = now;
                    const joined = isJoined(item.id);
                    if (joined) {
                      // optimistic leave
                      leave(item.id);
                      const uid = user?.uid || 'anonymous';
                      const ok = await fsLeaveCampaign(item.id, uid);
                      if (!ok) {
                        // rollback
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
                        // Treat petitions specially for signing event.
                        if ((item as any).kind === 'petition') {
                          logActivity({ type: 'petition.sign', payload: { petitionId: item.id } });
                        } else {
                          logActivity({ type: 'feature.use', payload: { feature: 'campaign.join', id: item.id } });
                        }
                      }
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={isJoined(item.id) ? t('a11y.leaveCampaign').replace('{{title}}', item.title) : t('a11y.joinCampaign').replace('{{title}}', item.title)}
                  style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, paddingHorizontal:10, paddingVertical:6, backgroundColor: isJoined(item.id)? palette.primary: 'transparent', opacity: inFlightRef.current[item.id] && Date.now()-inFlightRef.current[item.id]<400? 0.6:1 }}
                >
                  <Text style={{ color: isJoined(item.id)? palette.onPrimary: palette.text, fontWeight:'700', fontSize:12 }}>{isJoined(item.id)? 'Joined':'Join'}</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    try { await fsIncrementCampaignMembers(item.id, 1); } catch {}
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('a11y.supportCampaign')}
                  style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, paddingHorizontal:10, paddingVertical:6 }}
                >
                  <Text style={{ color: palette.text, fontWeight:'700', fontSize:12 }}>+1</Text>
                </Pressable>
              </GapView>
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
    title: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    subtitle: {
      fontSize: 17,
      color: palette.text,
      opacity: 1,
      marginBottom: 8,
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
  const canCreate = title.trim().length > 2 && summary.trim().length > 4;

  const field = (ph: string, val: string, set: (v: string) => void) => (
    <TextInput
      placeholder={ph}
      placeholderTextColor={palette.muted}
      value={val}
      onChangeText={set}
      style={{
        borderWidth: 1,
        borderColor: palette.muted,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: palette.text,
        marginBottom: 6,
      }}
    />
  );

  return (
    <View style={{ marginBottom: 12 }}>
      {field("Campaign title", title, setTitle)}
      {field("Brief summary", summary, setSummary)}
      {field("Target (e.g., Ministry of Labour)", target, setTarget)}
      {field("Goal (supporters count)", goalCount, setGoalCount)}
      {field("Contact email (optional)", contactEmail, setContactEmail)}
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
        }}
        disabled={!canCreate}
        style={{
          backgroundColor: palette.primary,
          borderRadius: 10,
          paddingVertical: 10,
          alignItems: "center",
          opacity: canCreate ? 1 : 0.6,
        }}
      >
        <Text style={{ color: palette.onPrimary, fontWeight: "700" }}>
          Create Campaign
        </Text>
      </Pressable>
    </View>
  );
}





