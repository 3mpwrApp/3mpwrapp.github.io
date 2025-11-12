/**
 * Accountability Network Search & Browse Screen
 * 
 * Search and review employers, insurers, lawyers, and medical providers
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { HIT_SLOP_8, MAX_FONT_SCALE } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import {
    getNetworkStats,
    searchEntity,
    type EntitySummary,
    type EntityType,
    type NetworkStats,
} from '../../../services/accountabilityNetwork';
import { useAppPalette } from '../../../theme/usePalette';

export default function AccountabilityNetworkScreen() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EntitySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [selectedType, setSelectedType] = useState<EntityType | 'all'>('all');
  
  useEffect(() => {
    loadStats();
  }, []);
  
  useEffect(() => {
    if (query.length >= 2) {
      handleSearch();
    } else {
      setResults([]);
    }
  }, [query]);
  
  const loadStats = async () => {
    const data = await getNetworkStats();
    setStats(data);
  };
  
  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await searchEntity(query);
      
      // Filter by type if selected
      const filtered = selectedType === 'all' 
        ? searchResults 
        : searchResults.filter(r => r.entityType === selectedType);
      
      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const entityTypes: Array<{ value: EntityType | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'employer', label: 'Employers' },
    { value: 'insurer', label: 'Insurers' },
    { value: 'lawyer', label: 'Lawyers' },
    { value: 'medical_provider', label: 'Medical' },
    { value: 'government_agency', label: 'Government' },
  ];
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <Text style={[styles.title, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Accountability Network
      </Text>
      
      <Text style={[styles.subtitle, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Search and rate employers, insurers, and service providers based on disability advocacy experiences
      </Text>
      
      {/* Network Stats */}
      {stats && (
        <View style={[styles.statsCard, { backgroundColor: palette.surface }]}>
          <Text style={[styles.statsTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Community Impact
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {stats.totalReviews}
              </Text>
              <Text style={[styles.statLabel, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Reviews
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {stats.totalEntities}
              </Text>
              <Text style={[styles.statLabel, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Entities
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {stats.avgRating.toFixed(1)}★
              </Text>
              <Text style={[styles.statLabel, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Avg Rating
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {Math.round(stats.overallSuccessRate)}%
              </Text>
              <Text style={[styles.statLabel, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Success Rate
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Add Review Button */}
      <Pressable
        onPress={() => router.push('/advocacy/accountability-network/add-review')}
        style={[styles.addButton, { backgroundColor: palette.primary }]}
        accessibilityRole="button"
        accessibilityLabel="Add a review"
      >
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Share Your Experience
        </Text>
      </Pressable>
      
      {/* Entity Type Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {entityTypes.map(type => (
          <Pressable
            key={type.value}
            onPress={() => setSelectedType(type.value)}
            style={[
              styles.filterChip,
              { 
                backgroundColor: selectedType === type.value ? palette.primary : palette.surface,
                borderColor: palette.muted,
              }
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${type.label}`}
            hitSlop={HIT_SLOP_8}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: selectedType === type.value ? '#FFFFFF' : palette.text }
              ]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {type.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
        <Ionicons name="search" size={20} color={palette.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: palette.text }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Search employers, insurers, lawyers..."
          placeholderTextColor={palette.textSecondary}
          accessibilityLabel="Search accountability network"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={HIT_SLOP_8}>
            <Ionicons name="close-circle" size={20} color={palette.textSecondary} />
          </Pressable>
        )}
      </View>
      
      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      )}
      
      {/* Results */}
      {!loading && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsCount, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </Text>
          {results.map(entity => (
            <EntityCard key={`${entity.entityName}_${entity.entityType}`} entity={entity} palette={palette} />
          ))}
        </View>
      )}
      
      {/* Empty State */}
      {!loading && query.length >= 2 && results.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={palette.textSecondary} />
          <Text style={[styles.emptyText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            No results found for "{query}"
          </Text>
          <Text style={[styles.emptySubtext, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Be the first to review this entity
          </Text>
        </View>
      )}
      
      {/* Initial State */}
      {!loading && query.length < 2 && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={palette.textSecondary} />
          <Text style={[styles.emptyText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Search for an employer, insurer, or service provider
          </Text>
          <Text style={[styles.emptySubtext, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Share your experience to help the community
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function EntityCard({ entity, palette }: { entity: EntitySummary; palette: any }) {
  const getTypeIcon = (type: EntityType) => {
    switch (type) {
      case 'employer': return 'business';
      case 'insurer': return 'shield-checkmark';
      case 'lawyer': return 'briefcase';
      case 'medical_provider': return 'medical';
      case 'government_agency': return 'flag';
      default: return 'ellipse';
    }
  };
  
  const getTypeLabel = (type: EntityType) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };
  
  return (
    <Pressable
      style={[styles.entityCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}
      onPress={() => {
        // Navigate to entity details
        router.push({
          pathname: '/advocacy/accountability-network/entity-details',
          params: { name: entity.entityName, type: entity.entityType },
        });
      }}
      accessibilityRole="button"
      accessibilityLabel={`View ${entity.entityName} reviews`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons name={getTypeIcon(entity.entityType) as any} size={24} color={palette.primary} />
          <Text style={[styles.entityName, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {entity.entityName}
          </Text>
        </View>
        <Text style={[styles.entityType, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {getTypeLabel(entity.entityType)}
        </Text>
      </View>
      
      <View style={styles.cardStats}>
        <View style={styles.statRow}>
          <Text style={[styles.rating, { color: '#FFB900' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {'★'.repeat(Math.round(entity.averageRating))}
            {'☆'.repeat(5 - Math.round(entity.averageRating))}
          </Text>
          <Text style={[styles.ratingText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {entity.averageRating.toFixed(1)} ({entity.totalReviews} reviews)
          </Text>
        </View>
        
        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {Math.round(entity.successRate)}%
            </Text>
            <Text style={[styles.metricLabel, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Success Rate
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {Math.round(entity.recommendationRate)}%
            </Text>
            <Text style={[styles.metricLabel, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Would Recommend
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContainer: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 12,
  },
  entityCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  entityName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  entityType: {
    fontSize: 14,
  },
  cardStats: {
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 18,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
