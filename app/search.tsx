/**
 * Global Search Screen
 * 
 * Universal search across all app features with intelligent recommendations
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import A11yPressable from '../components/A11yPressable';
import GapView from '../components/GapView';
import ResponsiveScreenWrapper from '../components/ResponsiveScreenWrapper';
import { HIT_SLOP_12, HIT_SLOP_8 } from '../constants/a11y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import {
    getPopularSearches,
    type SearchCategory,
    type SearchResult,
    useGlobalSearch,
} from '../services/globalSearch';
import { useAppPalette } from '../theme/usePalette';

const CATEGORY_FILTERS: { key: SearchCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '🔍' },
  { key: 'wellness', label: 'Wellness', icon: '❤️' },
  { key: 'resources', label: 'Resources', icon: '💼' },
  { key: 'advocacy', label: 'Advocacy', icon: '⚖️' },
  { key: 'community', label: 'Community', icon: '👥' },
  { key: 'campaigns', label: 'Campaigns', icon: '📢' },
  { key: 'events', label: 'Events', icon: '📅' },
  { key: 'research', label: 'Research', icon: '🔬' },
];

export default function GlobalSearchScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const [inputFocused, setInputFocused] = useState(false);
  
  const {
    query,
    setQuery,
    results,
    suggestions,
    selectedCategory,
    setSelectedCategory,
  } = useGlobalSearch();

  const popularSearches = getPopularSearches();
  const showSuggestions = inputFocused && query.length > 0 && suggestions.length > 0;
  const showPopular = !query && !inputFocused;
  const showResults = query.length > 0 && !inputFocused;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: t('search.title', 'Search'),
          headerShown: true,
        }} 
      />
      <ResponsiveScreenWrapper>
        {/* Search Input */}
        <View 
          style={[
            styles.searchContainer,
            { 
              backgroundColor: palette.surface,
              borderColor: inputFocused ? palette.primary : palette.muted,
            }
          ]}
        >
          <Ionicons 
            name="search" 
            size={20} 
            color={palette.text} 
            style={{ opacity: 0.6 }}
          />
          <TextInput
            style={[styles.searchInput, { color: palette.text }]}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setInputFocused(true)}
            // WCAG 2.2.1: 200ms delay is user-initiated blur handling, not a timed limit on interaction
            onBlur={() => setTimeout(() => setInputFocused(false), 200)}
            placeholder={t('search.placeholder', 'Search for tools, resources, help...')}
            placeholderTextColor={palette.muted}
            autoFocus={true}
            returnKeyType="search"
            accessibilityLabel={t('search.inputLabel', 'Search input')}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={HIT_SLOP_12}
              accessibilityRole="button"
              accessibilityLabel={t('search.clear', 'Clear search')}
            >
              <Ionicons name="close-circle" size={20} color={palette.muted} />
            </Pressable>
          )}
        </View>

        {/* Category Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORY_FILTERS}
            keyExtractor={(item) => item.key}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => {
              const isActive = selectedCategory === item.key || (!selectedCategory && item.key === 'all');
              return (
                <Pressable
                  onPress={() => setSelectedCategory(item.key === 'all' ? undefined : item.key as SearchCategory)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? palette.primary : palette.surface,
                      borderColor: isActive ? palette.primary : palette.muted,
                    }
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${item.label}`}
                  accessibilityState={{ selected: isActive }}
                  hitSlop={HIT_SLOP_12}
                >
                  <Text style={{ fontSize: 14 }}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isActive ? palette.onPrimary : palette.text }
                    ]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Search Suggestions (when typing) */}
        {showSuggestions && (
          <View style={styles.suggestionsContainer}>
            <Text 
              style={[styles.sectionTitle, { color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('search.suggestions', 'Suggestions')}
            </Text>
            <GapView gap={8}>
              {suggestions.map((suggestion, index) => (
                <Pressable
                  key={`${suggestion}-${index}`}
                  onPress={() => {
                    setQuery(suggestion);
                    setInputFocused(false);
                  }}
                  style={[
                    styles.suggestionItem,
                    { 
                      backgroundColor: palette.surface,
                      borderColor: palette.muted,
                    }
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Search for ${suggestion}`}
                  hitSlop={HIT_SLOP_12}
                >
                  <Ionicons name="search" size={16} color={palette.muted} />
                  <Text 
                    style={[styles.suggestionText, { color: palette.text }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </GapView>
          </View>
        )}

        {/* Popular Searches (when empty) */}
        {showPopular && (
          <View style={styles.popularContainer}>
            <Text 
              style={[styles.sectionTitle, { color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('search.popular', 'Popular Searches')}
            </Text>
            <GapView gap={8} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {popularSearches.map((search, index) => (
                <Pressable
                  key={`${search}-${index}`}
                  onPress={() => setQuery(search)}
                  style={[
                    styles.popularChip,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.primary,
                    }
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Search for ${search}`}
                  hitSlop={HIT_SLOP_12}
                >
                  <Text 
                    style={[styles.popularChipText, { color: palette.primary }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {search}
                  </Text>
                </Pressable>
              ))}
            </GapView>
          </View>
        )}

        {/* Search Results */}
        {showResults && (
          <View style={styles.resultsContainer}>
            <Text 
              style={[styles.resultsCount, { color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              accessibilityLiveRegion="polite"
            >
              {results.length === 0 
                ? t('search.noResults', 'No results found') 
                : t('search.resultsCount', '{{count}} result(s)', { count: results.length })}
            </Text>
            
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <SearchResultCard result={item} palette={palette} />}
              contentContainerStyle={{ gap: 12 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Empty State - Quick Tips */}
        {!query && !showPopular && (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={48} color={palette.muted} />
            <Text 
              style={[styles.emptyText, { color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('search.emptyTip', 'Try searching for:')}
            </Text>
            <Text 
              style={[styles.emptySubtext, { color: palette.muted }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('search.emptyExamples', 'mood tracker, ask advocate, pain management, letter builder')}
            </Text>
          </View>
        )}
      </ResponsiveScreenWrapper>
    </>
  );
}

// Search Result Card Component
const SearchResultCard = React.memo<{ result: SearchResult; palette: any }>(
  ({ result, palette }) => {
    const { t } = useTranslation();
    const router = useRouter();
    
    return (
      <A11yPressable
        onPress={() => router.push(result.route)}
        style={[
          styles.resultCard,
          {
            backgroundColor: palette.card,
            borderColor: palette.muted,
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${result.title}. ${result.description}`}
        hitSlop={HIT_SLOP_8}
      >
          <View style={styles.resultIcon}>
            <Text style={{ fontSize: 24 }}>{result.icon}</Text>
          </View>
          
          <View style={styles.resultContent}>
            <View style={styles.resultHeader}>
              <Text 
                style={[styles.resultTitle, { color: palette.text }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {result.title}
              </Text>
              <View 
                style={[
                  styles.categoryBadge,
                  { backgroundColor: palette.primary + '20' }
                ]}
              >
                <Text 
                  style={[styles.categoryText, { color: palette.primary }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {result.category}
                </Text>
              </View>
            </View>
            
            <Text 
              style={[styles.resultDescription, { color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              numberOfLines={2}
            >
              {result.description}
            </Text>
            
            {result.relevanceScore && result.relevanceScore > 80 && (
              <View style={styles.relevanceBadge}>
                <Ionicons name="star" size={12} color={palette.primary} />
                <Text 
                  style={[styles.relevanceText, { color: palette.primary }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {t('search.topMatch', 'Top match')}
                </Text>
              </View>
            )}
          </View>
          
        <Ionicons name="chevron-forward" size={20} color={palette.muted} />
      </A11yPressable>
    );
  }
);
SearchResultCard.displayName = 'SearchResultCard';

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  suggestionText: {
    fontSize: 15,
  },
  popularContainer: {
    marginBottom: 16,
  },
  popularChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  popularChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  resultIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
    gap: 6,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  resultDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  relevanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  relevanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
