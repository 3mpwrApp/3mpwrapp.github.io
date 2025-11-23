import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import ContrastToggle from '../../components/ContrastToggle';
import { GapView } from '../../components/GapView';
import ResponsiveScreenWrapper from '../../components/ResponsiveScreenWrapper';
import SearchBar from '../../components/SearchBar';
import SettingsLink from '../../components/SettingsLink';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { researchHubs } from '../../data/research-hubs';
import {
    allRegions,
    allTopics,
    filterByRegion,
    filterByTopic,
    filterByType,
    type ResearchItem,
    researchLibrary,
    type ResearchRegion,
    type ResearchTopic,
    type ResearchType,
    searchResearch,
} from '../../data/research-library';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';
export default function ResearchLibraryScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  
  useAnnounceOnMount(t('research.library.screenLabel', 'Research Library screen'));
  useFocusOnRefOnMount(titleRef);

  // Filter states
  const [query, setQuery] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<ResearchType | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = React.useState<ResearchTopic | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = React.useState<ResearchRegion | 'all'>('all');
  const [showFilters, setShowFilters] = React.useState(false);

  // Filter and search results
  const filteredResults = React.useMemo(() => {
    let results = researchLibrary;

    // Apply type filter
    if (selectedType !== 'all') {
      results = filterByType(results, selectedType);
    }

    // Apply topic filter
    if (selectedTopic !== 'all') {
      results = filterByTopic(results, selectedTopic);
    }

    // Apply region filter
    if (selectedRegion !== 'all') {
      results = filterByRegion(results, selectedRegion);
    }

    // Apply search
    if (query.trim()) {
      results = searchResearch(results, query);
    }

    return results;
  }, [selectedType, selectedTopic, selectedRegion, query]);

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedTopic('all');
    setSelectedRegion('all');
    setQuery('');
  };

  const hasActiveFilters = selectedType !== 'all' || selectedTopic !== 'all' || selectedRegion !== 'all' || query.trim();

  return (
    <ResponsiveScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text
            ref={titleRef}
            style={styles.title}
            accessibilityRole="header"
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t('research.library.title', 'Research Library')}
          </Text>
          <SettingsLink style={styles.settingsLink} />
          <ContrastToggle style={styles.contrastToggle} />
        </View>

        <Text style={styles.subtitle}>
          {t('research.library.subtitle', 'Consolidated studies, reports, and articles on disability rights, workplace advocacy, and support systems.')}
        </Text>

        {/* Search */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('research.library.search', 'Search research...')}
        />

        {/* Filter Toggle */}
        <A11yPressable
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterToggle}
          accessibilityRole="button"
          accessibilityLabel={showFilters ? t('research.library.hideFilters', 'Hide filters') : t('research.library.showFilters', 'Show filters')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="filter-outline" size={20} color={palette.primary} />
          <Text style={styles.filterToggleText}>
            {showFilters ? t('research.library.hideFilters', 'Hide Filters') : t('research.library.showFilters', 'Show Filters')}
          </Text>
          {hasActiveFilters && <View style={styles.filterBadge} />}
        </A11yPressable>

        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            {/* Type Filter */}
            <Text style={styles.filterLabel}>{t('research.library.filterType', 'Type')}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <GapView gap={8} style={styles.filterRow}>
                <FilterChip
                  label={t('research.library.all', 'All')}
                  selected={selectedType === 'all'}
                  onPress={() => setSelectedType('all')}
                  palette={palette}
                  factor={factor}
                />
                <FilterChip
                  label={t('research.library.studies', 'Studies')}
                  selected={selectedType === 'study'}
                  onPress={() => setSelectedType('study')}
                  palette={palette}
                  factor={factor}
                />
                <FilterChip
                  label={t('research.library.reports', 'Reports')}
                  selected={selectedType === 'report'}
                  onPress={() => setSelectedType('report')}
                  palette={palette}
                  factor={factor}
                />
                <FilterChip
                  label={t('research.library.articles', 'Articles')}
                  selected={selectedType === 'article'}
                  onPress={() => setSelectedType('article')}
                  palette={palette}
                  factor={factor}
                />
              </GapView>
            </ScrollView>

            {/* Topic Filter */}
            <Text style={styles.filterLabel}>{t('research.library.filterTopic', 'Topic')}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <GapView gap={8} style={styles.filterRow}>
                <FilterChip
                  label={t('research.library.all', 'All')}
                  selected={selectedTopic === 'all'}
                  onPress={() => setSelectedTopic('all')}
                  palette={palette}
                  factor={factor}
                />
                {allTopics.slice(0, 10).map(topic => (
                  <FilterChip
                    key={topic}
                    label={topic}
                    selected={selectedTopic === topic}
                    onPress={() => setSelectedTopic(topic)}
                    palette={palette}
                    factor={factor}
                  />
                ))}
              </GapView>
            </ScrollView>

            {/* Region Filter */}
            <Text style={styles.filterLabel}>{t('research.library.filterRegion', 'Region')}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <GapView gap={8} style={styles.filterRow}>
                <FilterChip
                  label={t('research.library.all', 'All')}
                  selected={selectedRegion === 'all'}
                  onPress={() => setSelectedRegion('all')}
                  palette={palette}
                  factor={factor}
                />
                {allRegions.map(region => (
                  <FilterChip
                    key={region}
                    label={region}
                    selected={selectedRegion === region}
                    onPress={() => setSelectedRegion(region)}
                    palette={palette}
                    factor={factor}
                  />
                ))}
              </GapView>
            </ScrollView>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <A11yPressable
                onPress={clearFilters}
                style={styles.clearButton}
                accessibilityRole="button"
                accessibilityLabel={t('research.library.clearFilters', 'Clear all filters')}
                hitSlop={HIT_SLOP_8}
              >
                <Text style={styles.clearButtonText}>{t('research.library.clearFilters', 'Clear Filters')}</Text>
              </A11yPressable>
            )}
          </View>
        )}

        {/* Results Count */}
        <Text style={styles.resultsCount} accessibilityLiveRegion="polite">
          {t('research.library.resultsCount', '{{count}} results', { count: filteredResults.length })}
        </Text>

        {/* Results */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {filteredResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={palette.muted} />
              <Text style={styles.emptyStateText}>
                {t('research.library.noResults', 'No results found. Try adjusting your filters.')}
              </Text>
            </View>
          ) : (
            <GapView gap={16}>
              {filteredResults.map(item => (
                <ResearchCard key={item.id} item={item} palette={palette} factor={factor} />
              ))}
            </GapView>
          )}

          {/* Research & Data Hubs Section */}
          <GapView gap={16} style={styles.hubsContainer} accessibilityRole="summary">
            <Text style={styles.hubsHeader} accessibilityRole="header">
              {t('research.landing.hubsHeader', 'Research & Data Hubs')}
            </Text>
            <Text style={styles.hubsIntro}>
              {t('research.landing.hubsIntro', 'Trusted national and global sources for disability, return-to-work, accessibility, assistive tech, and social protection evidence.')}
            </Text>
            {(['canada', 'world'] as const).map(region => {
              const hubs = researchHubs.filter(h => h.region === region);
              if (!hubs.length) return null;
              return (
                <GapView gap={12} key={region} style={styles.hubRegion} accessibilityRole="header" accessibilityLabel={region === 'canada' ? 'Canada hubs' : 'Worldwide hubs'}>
                  <Text style={styles.regionTitle}>
                    {region === 'canada' ? t('research.landing.regionCanada', 'Canada') : t('research.landing.regionWorldwide', 'Worldwide')}
                  </Text>
                  {hubs.map(h => (
                    <GapView gap={8} key={h.id} style={styles.hubCard} accessibilityRole="summary">
                      <Text style={styles.hubName}>{h.name}</Text>
                      <Text style={styles.hubDescription}>{h.description}</Text>
                      <GapView gap={12} style={styles.linksRow}>
                        {h.links.map(l => (
                          <A11yPressable
                            key={l.url}
                            accessibilityRole="link"
                            accessibilityLabel={`Open ${l.label}`}
                            style={styles.hubLinkPress}
                            onPress={() => Linking.openURL(l.url).catch(() => {})}
                            hitSlop={HIT_SLOP_8}
                          >
                            <Text style={styles.hubLinkText}>{l.label}</Text>
                          </A11yPressable>
                        ))}
                      </GapView>
                      {h.tags && (
                        <GapView gap={6} style={styles.tagRow}>
                          {h.tags.map(t => (
                            <View key={t} style={styles.tagChip}>
                              <Text style={styles.tagText}>{t}</Text>
                            </View>
                          ))}
                        </GapView>
                      )}
                    </GapView>
                  ))}
                </GapView>
              );
            })}
          </GapView>
        </ScrollView>
      </View>
    </ResponsiveScreenWrapper>
  );
}

// Filter Chip Component
function FilterChip({
  label,
  selected,
  onPress,
  palette,
  factor,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  palette: ReturnType<typeof useAppPalette>;
  factor: number;
}) {
  return (
    <A11yPressable
      onPress={onPress}
      style={[
        {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: selected ? palette.primary : palette.muted,
          backgroundColor: selected ? palette.primary : palette.surface,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label}${selected ? ' selected' : ''}`}
      accessibilityState={{ selected }}
      hitSlop={HIT_SLOP_8}
    >
      <Text
        style={{
          fontSize: Math.round(14 * factor),
          fontWeight: selected ? '700' : '500',
          color: selected ? palette.onPrimary : palette.text,
        }}
      >
        {label}
      </Text>
    </A11yPressable>
  );
}

// Research Card Component
function ResearchCard({
  item,
  palette,
  factor,
}: {
  item: ResearchItem;
  palette: ReturnType<typeof useAppPalette>;
  factor: number;
}) {
  const getTypeIcon = () => {
    switch (item.type) {
      case 'study':
        return 'flask-outline';
      case 'report':
        return 'document-text-outline';
      case 'article':
        return 'newspaper-outline';
      default:
        return 'document-outline';
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'study':
        return '#2563eb'; // blue
      case 'report':
        return '#7c3aed'; // purple
      case 'article':
        return '#059669'; // green
      default:
        return palette.primary;
    }
  };

  return (
    <View style={{ backgroundColor: palette.surface, borderRadius: 12, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
      {/* Type Badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ backgroundColor: getTypeColor(), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name={getTypeIcon()} size={14} color="#fff" />
          <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {item.type}
          </Text>
        </View>
        {item.readTime && (
          <Text style={{ fontSize: 12, color: palette.text, opacity: 0.6, marginLeft: 8, fontStyle: 'italic' }}>
            {item.readTime}
          </Text>
        )}
      </View>

      {/* Title */}
      <Text style={{ fontSize: Math.round(18 * factor), fontWeight: '600', color: palette.text, marginBottom: 8 }}>
        {item.title}
      </Text>

      {/* Meta */}
      {(item.source || item.year) && (
        <Text style={{ fontSize: Math.round(13 * factor), color: palette.text, opacity: 0.7, fontWeight: '500', marginBottom: 10 }}>
          {[item.source, item.year].filter(Boolean).join(' • ')}
        </Text>
      )}

      {/* Description */}
      <Text style={{ fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85, lineHeight: 20, marginBottom: 12 }}>
        {item.description}
      </Text>

      {/* Topics */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {item.topics.slice(0, 3).map(topic => (
          <View key={topic} style={{ backgroundColor: palette.card, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
            <Text style={{ fontSize: 11, color: palette.text, opacity: 0.8, fontWeight: '600' }}>
              {topic}
            </Text>
          </View>
        ))}
        {item.topics.length > 3 && (
          <View style={{ backgroundColor: palette.card, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
            <Text style={{ fontSize: 11, color: palette.text, opacity: 0.8, fontWeight: '600' }}>
              +{item.topics.length - 3}
            </Text>
          </View>
        )}
      </View>

      {/* Regions */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {item.regions.map(region => (
          <Text key={region} style={{ fontSize: 11, color: palette.text, opacity: 0.6 }}>
            📍 {region}
          </Text>
        ))}
      </View>

      {/* Link Button */}
      <A11yPressable
        accessibilityRole="link"
        accessibilityLabel={`Open ${item.title}`}
        onPress={() => Linking.openURL(item.link).catch(() => {})}
        style={{ alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, backgroundColor: palette.primary, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        hitSlop={HIT_SLOP_8}
      >
        <Text style={{ color: palette.onPrimary, fontWeight: '700', fontSize: Math.round(14 * factor) }}>
          {item.type === 'article' ? 'Read Article' : item.type === 'report' ? 'View Report' : 'Read Study'}
        </Text>
        <Ionicons name="arrow-forward" size={16} color={palette.onPrimary} />
      </A11yPressable>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: Math.round(24 * factor), fontWeight: '700', color: palette.text, flex: 1 },
    settingsLink: { position: 'absolute', right: 0, top: 0 },
    contrastToggle: { position: 'absolute', right: 36, top: 0 },
    subtitle: { fontSize: Math.round(16 * factor), color: palette.text, opacity: 0.9, marginBottom: 16, lineHeight: 22 },
    filterToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, marginBottom: 12 },
    filterToggleText: { fontSize: Math.round(15 * factor), fontWeight: '600', color: palette.primary },
    filterBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.primary },
    filtersPanel: { backgroundColor: palette.surface, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    filterLabel: { fontSize: Math.round(14 * factor), fontWeight: '600', color: palette.text, marginBottom: 8, marginTop: 8 },
    filterScroll: { marginBottom: 4 },
    filterRow: { flexDirection: 'row' },
    clearButton: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: palette.card, borderRadius: 8, alignSelf: 'flex-start' },
    clearButtonText: { fontSize: Math.round(14 * factor), fontWeight: '600', color: palette.primary },
    resultsCount: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.7, marginBottom: 12, fontWeight: '500' },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyStateText: { fontSize: Math.round(16 * factor), color: palette.text, opacity: 0.6, marginTop: 16, textAlign: 'center' },
    hubsContainer: { marginTop: 32, paddingTop: 24, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.muted },
    hubsHeader: { fontSize: Math.round(20 * factor), fontWeight: '700', color: palette.text },
    hubsIntro: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85, lineHeight: 20 },
    hubRegion: {},
    regionTitle: { fontSize: Math.round(18 * factor), fontWeight: '600', color: palette.text, marginTop: 8 },
    hubCard: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, padding: 16, borderRadius: 10 },
    hubName: { fontSize: Math.round(15 * factor), fontWeight: '600', color: palette.text },
    hubDescription: { fontSize: Math.round(13 * factor), color: palette.text, opacity: 0.85, lineHeight: 18 },
    linksRow: { flexDirection: 'row', flexWrap: 'wrap' },
    hubLinkPress: { paddingVertical: 4 },
    hubLinkText: { fontSize: Math.round(13 * factor), color: palette.primary, textDecorationLine: 'underline' },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
    tagChip: { backgroundColor: palette.card, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
    tagText: { fontSize: 11, color: palette.text, opacity: 0.8 },
  });
}
