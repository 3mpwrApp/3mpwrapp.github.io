import type { Href } from "expo-router";
import { router } from "expo-router";
import React from "react";
import { SectionList, StyleSheet, Text, useColorScheme, View } from "react-native";

import A11yPressable from '../../../components/A11yPressable';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import SearchBar from '../../../components/SearchBar';
import { SkeletonList } from '../../../components/SkeletonLoader';
import { HIT_SLOP_8, touchTarget } from "../../../constants/A11Y";
import { channels, seedComments, seedThreads } from "../../../data/community";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { usePostLoadAnnounce } from "../../../hooks/usePostLoadAnnounce";
import { useTranslation } from "../../../i18n";
import { getChannelUnread, setChannelLastRead } from "../../../services/community";
import { CommunityProvider, useCommunity } from "../../../store/community";
import { colors, type Palette } from "../../../theme/colors";

const ChannelListItem = React.memo<{ item: any; unread: Record<string, number>; palette: Palette; onPress: (slug: string) => Promise<void> }>(({ item, unread, palette, onPress }) => {
  const styles = React.useMemo(() => ({
    row: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    rowText: { color: palette.text, fontSize: 16 },
  }), [palette]);

  return (
    <A11yPressable
      onPress={() => onPress(item.slug)}
      accessibilityRole="button"
      accessibilityLabel={`Open channel ${item.title}`}
      hitSlop={HIT_SLOP_8}
      style={({ pressed }) => [styles.row, touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={styles.rowText}>{item.title}{unread[item.slug] ? ` (${unread[item.slug]})` : ''}</Text>
    </A11yPressable>
  );
});
ChannelListItem.displayName = 'ChannelListItem';

function ScreenInner() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Community Hub");
  useFocusOnRefOnMount(titleRef);
  const { state, seed } = useCommunity();
  const { t } = useTranslation();
  const [unread, setUnread] = React.useState<Record<string, number>>({});
  const [query, setQuery] = React.useState("");
  const [mode, setMode] = React.useState<'all'|'provinces'|'topics'>('all');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (state.channels.length === 0) {
      seed({ channels, threads: seedThreads, comments: seedComments });
    }
    // Simulate initial data load
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [state.channels.length, seed]);

  const prov = state.channels.filter((c) => c.type === "province");
  const topics = state.channels.filter((c) => c.type === "topic");

  const q = query.trim().toLowerCase();
  const filteredProv = React.useMemo(() =>
    q ? prov.filter((c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)) : prov
  , [prov, q]);
  const filteredTopics = React.useMemo(() =>
    q ? topics.filter((c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)) : topics
  , [topics, q]);

  React.useEffect(() => {
    (async () => {
      try {
        const all = [...prov, ...topics];
        const out: Record<string, number> = {};
        for (const ch of all) {
          out[ch.slug] = await getChannelUnread(ch.slug, 50);
        }
        setUnread(out);
      } catch {}
    })();
  }, [prov.length, topics.length]);

  const totalChannels = prov.length + topics.length;
  usePostLoadAnnounce({ loading, count: totalChannels, ns: 'community', emptyKey: 'community.empty' });

  return (
    <ResponsiveScreenWrapper scrollable={false} testID="community-screen">
      <View style={styles.container} accessibilityLabel="Community Hub screen" accessible={true}>
        <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Community Hub
        </Text>
        <Text style={styles.subtitle}>Connect, share, and support each other through various community features.</Text>

        {loading ? (
          <SkeletonList count={8} />
        ) : (
          <>
            <GapView style={{ flexDirection:'row', marginBottom:8 }} gap={8}>
              <FilterChip label="All" active={mode==='all'} onPress={() => setMode('all')} palette={palette} />
              <FilterChip label="Provinces" active={mode==='provinces'} onPress={() => setMode('provinces')} palette={palette} />
              <FilterChip label="Topics" active={mode==='topics'} onPress={() => setMode('topics')} palette={palette} />
            </GapView>

            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search channels & tools"
            />

        {/* Community Features Navigation */}
        <View style={styles.featuresContainer}>
          {(() => {
            type Feature = { key: string; title: string; desc: string; href: Href; compose?: boolean };
            const features: Feature[] = [
              { key: 'media', title: '🎨 Media Studio', desc: 'Create & share memes, posters, graphics (Beta)', href: '/(tabs)/community/media-studio' as Href },
              { key: 'aid', title: '🤝 Mutual Aid', desc: 'Exchange support, resources, peer help (Beta)', href: '/(tabs)/community/mutual-aid' as Href },
              { key: 'chat', title: '💬 Mutual Chat', desc: 'Real-time group & 1-1 conversations (Beta)', href: '/(tabs)/community/mutual-chat?id=general' as Href },
              { key: 'testers', title: '🧪 Beta Testers Chat', desc: 'Live chat to collaborate & give feedback (Beta)', href: '/(tabs)/community/testers-chat' as Href },
              { key: 'dm', title: '📥 Direct Messages', desc: 'Private 1‑1 conversations (beta)', href: '/(tabs)/community/dms' as Href },
              { key: 'compose', title: '✏️ Compose Post', desc: 'Create a new forum post (Beta)', href: '/(tabs)/community/compose' as Href, compose: true },
            ];
            const fMatches: Feature[] = q
              ? features.filter(f =>
                  f.title.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q)
                )
              : features;
            if (fMatches.length === 0 && q) {
              return (
                <Text style={[styles.subtitle, { marginBottom: 0, opacity: 0.7 }]}>\
                  {t('community.toolsEmpty','No tools match your search')}\
                </Text>
              );
            }
            const rows: Feature[][] = [];
            for (let i = 0; i < fMatches.length; i += 2) rows.push(fMatches.slice(i, i + 2));
            return rows.map((row, idx) => (
              <GapView key={`feat-row-${idx}`} style={styles.featuresRow} gap={12}>
                {row.map((f) => (
                  <A11yPressable
                    key={f.key}
                    accessibilityRole="button"
                    accessibilityLabel={(f.title + ' ' + f.desc).trim()}
                    style={({ pressed }) => [styles.featureButton, f.compose && styles.composeButton, pressed && { opacity: 0.7 }]}
                    onPress={() => router.push(f.href)}
                  >
                    <Text style={[styles.featureTitle, f.compose && { color: palette.onPrimary }]}>{f.title}</Text>
                    <Text style={[styles.featureDesc, f.compose && { color: palette.onPrimary }]}>{f.desc}</Text>
                  </A11yPressable>
                ))}
                {row.length === 1 && <View style={[styles.featureButton, { opacity: 0 }]} />}
              </GapView>
            ));
          })()}
        </View>

        <Text style={styles.sectionHeader}>Community Forum</Text>
        <Text style={styles.subtitle}>Join a province or topic channel to participate in discussions.</Text>

        <SectionList
          sections={(() => {
            const secs: { title: string; data: typeof filteredProv }[] = [];
            if (mode === 'all' || mode === 'provinces') secs.push({ title: "Provinces & Territories", data: filteredProv });
            if (mode === 'all' || mode === 'topics') secs.push({ title: "Topics", data: filteredTopics });
            return secs.filter(s => s.data.length > 0);
          })()}
          keyExtractor={(item) => `channel-${item.id}`}
          renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
          renderItem={({ item }) => (
            <ChannelListItem
              item={item}
              unread={unread}
              palette={palette}
              onPress={async (slug) => { await setChannelLastRead(slug); router.push(`/(tabs)/community/${slug}` as Href); }}
            />
          )}
          ListEmptyComponent={(
            <View style={{ paddingVertical: 12 }}>
              <Text style={[styles.subtitle, { marginBottom: 6, opacity: 0.8 }]}>\
                {t('community.empty','No channels match your filters')}\
              </Text>
              {(query || mode !== 'all') && (
                <A11yPressable
                  onPress={() => { setQuery(''); setMode('all'); }}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.resetFilters','Reset filters')}
                  style={({ pressed }) => [
                    { alignSelf:'flex-start', paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
                    pressed && { opacity: 0.8 }
                  ]}
                >
                  <Text style={{ color: palette.text, fontWeight:'700' }}>{t('common.resetFilters','Reset filters')}</Text>
                </A11yPressable>
              )}
            </View>
          )}
          contentContainerStyle={{ paddingTop: 8 }}
        />
        <View style={{ marginTop: 16 }}>
          <A11yPressable
            accessibilityRole="button"
            accessibilityLabel="Open My Posts"
            style={({ pressed }) => [styles.row, touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push('/(tabs)/community/my-posts' as Href)}
          >
            <Text style={styles.rowText}>My Posts</Text>
          </A11yPressable>
          <A11yPressable
            accessibilityRole="button"
            accessibilityLabel="Open Direct Messages"
            style={({ pressed }) => [styles.row, touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push('/(tabs)/community/dms' as Href)}
          >
            <Text style={styles.rowText}>Direct Messages (beta)</Text>
          </A11yPressable>
          <A11yPressable
            accessibilityRole="button"
            accessibilityLabel="Open Community Safety"
            style={({ pressed }) => [styles.row, touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push('/(tabs)/community/safety' as Href)}
          >
            <Text style={styles.rowText}>Safety & Blocking</Text>
          </A11yPressable>
        </View>
          </>
        )}
      </View>
    </ResponsiveScreenWrapper>
  );
}

export default function CommunityIndex() {
  return (
    <CommunityProvider>
      <ScreenInner />
    </CommunityProvider>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1 },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: 17, color: palette.text, opacity: 1, marginBottom: 8 },
    sectionHeader: { fontSize: 20, fontWeight: "700", marginTop: 16, marginBottom: 8, color: palette.text },
    featuresContainer: { marginBottom: 16 },
    featuresRow: { 
      flexDirection: 'row', 
      marginBottom: 12,
      justifyContent: 'space-between'
    },
    featureButton: {
      flex: 1,
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      minHeight: 80,
      justifyContent: 'center'
    },
    composeButton: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 4
    },
    featureDesc: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.8,
      lineHeight: 18
    },
    section: { marginTop: 12, marginBottom: 6, fontWeight: "700", color: palette.text },
    row: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    rowText: { color: palette.text, fontSize: 16 },
  });
}

function FilterChip({ label, active, onPress, palette }: { label: string; active: boolean; onPress: () => void; palette: Palette }) {
  return (
    <A11yPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        { borderWidth: 1, borderColor: active? palette.primary: palette.muted, backgroundColor: active? palette.primary: 'transparent', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
        pressed && { opacity: 0.8 }
      ]}
    >
      <Text style={{ color: active? palette.onPrimary: palette.text, fontWeight:'700', fontSize:12 }}>{label}</Text>
    </A11yPressable>
  );
}
