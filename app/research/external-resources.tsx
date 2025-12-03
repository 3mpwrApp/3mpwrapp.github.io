import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import ContrastToggle from '../../components/ContrastToggle';
import ResponsiveScreenWrapper from '../../components/ResponsiveScreenWrapper';
import SearchBar from '../../components/SearchBar';
import SettingsLink from '../../components/SettingsLink';
import { HIT_SLOP_12, HIT_SLOP_8 } from '../../constants/A11Y';
import externalResources from '../../data/externalResources.json';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../hooks/useA11y';
import { useSettings } from '../../store/settings';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

type ExternalResource = {
  id: string;
  title: string;
  description: string;
  url: string;
  scope: 'canada' | 'province';
  province?: string;
  category: 'employment' | 'human_rights' | 'benefits' | 'advocacy' | 'workers_comp' | 'crisis';
};

const PROVINCE_NAMES: Record<string, string> = {
  AB: 'Alberta',
  BC: 'British Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NL: 'Newfoundland & Labrador',
  NS: 'Nova Scotia',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  ON: 'Ontario',
  PE: 'Prince Edward Island',
  QC: 'Quebec',
  SK: 'Saskatchewan',
  YT: 'Yukon',
};

const CATEGORY_LABELS: Record<string, string> = {
  employment: 'Employment Standards & Rights',
  human_rights: 'Human Rights Commissions',
  benefits: 'Disability Benefits & Income Support',
  advocacy: 'Advocacy & Accessibility',
  workers_comp: "Workers' Compensation",
  crisis: 'Crisis & Emergency Resources',
};

export default function ExternalResourcesScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  const { province } = useSettings();
  const [query, setQuery] = React.useState('');
  const [provinceFilter, setProvinceFilter] = React.useState<string>('all');

  useAnnounceOnMount('External Resources - Government sites and data sources');
  useFocusOnRefOnMount(titleRef);

  // Filter and organize resources
  const sections = React.useMemo(() => {
    const q = query.toLowerCase();
    let filtered: ExternalResource[] = externalResources as ExternalResource[];

    // Filter by query
    if (q) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    // Filter by province
    if (provinceFilter !== 'all') {
      if (provinceFilter === 'canada') {
        filtered = filtered.filter((r) => r.scope === 'canada');
      } else {
        filtered = filtered.filter((r) => r.scope === 'canada' || r.province === provinceFilter);
      }
    }

    // Group by category
    const grouped: Record<string, ExternalResource[]> = {};
    filtered.forEach((r) => {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push(r);
    });

    return Object.entries(grouped)
      .map(([category, data]) => ({
        title: CATEGORY_LABELS[category] || category,
        data,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [query, provinceFilter]);

  const provinceOptions = React.useMemo(
    () => ['all', 'canada', ...Object.keys(PROVINCE_NAMES)],
    []
  );

  return (
    <ResponsiveScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <Text
          ref={titleRef}
          style={styles.title}
          accessibilityRole="header"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          External Resources
        </Text>
        <SettingsLink style={{ position: 'absolute', right: 20, top: 20 }} />
        <ContrastToggle style={{ position: 'absolute', right: 56, top: 20 }} />
        
        <Text style={styles.subtitle}>
          Government programs, human rights resources, and external data sources
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={palette.primary} />
          <Text style={styles.infoText}>
            These links open external government and advocacy websites
          </Text>
        </View>

        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search resources..."
        />

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Filter by region:</Text>
          <View style={styles.filterButtons}>
            {provinceOptions.slice(0, 3).map((opt) => (
              <Pressable
                key={opt}
                style={[
                  styles.filterButton,
                  provinceFilter === opt && styles.filterButtonActive,
                ]}
                onPress={() => setProvinceFilter(opt)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${opt === 'all' ? 'All regions' : opt === 'canada' ? 'Canada-wide' : opt}`}
                accessibilityState={{ selected: provinceFilter === opt }}
                hitSlop={HIT_SLOP_12}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    provinceFilter === opt && styles.filterButtonTextActive,
                  ]}
                >
                  {opt === 'all' ? 'All' : opt === 'canada' ? 'Canada' : opt}
                </Text>
              </Pressable>
            ))}
            {province && (
              <Pressable
                style={[
                  styles.filterButton,
                  provinceFilter === province && styles.filterButtonActive,
                ]}
                onPress={() => setProvinceFilter(province)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by my province ${province}`}
                accessibilityState={{ selected: provinceFilter === province }}
                hitSlop={HIT_SLOP_12}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    provinceFilter === province && styles.filterButtonTextActive,
                  ]}
                >
                  My Province ({province})
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <A11yPressable
              onPress={() => Linking.openURL(item.url)}
              style={styles.resourceItem}
              accessibilityRole="link"
              accessibilityLabel={`${item.title}. ${item.description}. Opens in browser.`}
              hitSlop={HIT_SLOP_8}
            >
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{item.title}</Text>
                {item.province && (
                  <Text style={styles.provinceTag}>{PROVINCE_NAMES[item.province]}</Text>
                )}
                <Text style={styles.resourceDescription}>{item.description}</Text>
              </View>
              <Ionicons name="open-outline" size={20} color={palette.primary} />
            </A11yPressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={palette.muted} />
              <Text style={styles.emptyText}>No resources match your search</Text>
              <Pressable 
                onPress={() => { setQuery(''); setProvinceFilter('all'); }}
                accessibilityRole="button"
                accessibilityLabel="Reset search filters"
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.resetButton}>Reset filters</Text>
              </Pressable>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </ResponsiveScreenWrapper>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: palette.background,
    },
    title: {
      fontSize: Math.round(24 * factor),
      fontWeight: '700',
      marginBottom: 8,
      color: palette.text,
    },
    subtitle: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 0.9,
      marginBottom: 16,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.primary + '15',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      gap: 8,
    },
    infoText: {
      flex: 1,
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.9,
    },
    filterRow: {
      marginTop: 16,
      marginBottom: 16,
    },
    filterLabel: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      marginBottom: 8,
      fontWeight: '600',
    },
    filterButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
    },
    filterButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    filterButtonText: {
      fontSize: Math.round(12 * factor),
      color: palette.text,
    },
    filterButtonTextActive: {
      color: palette.onPrimary,
      fontWeight: '600',
    },
    sectionHeader: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: palette.surface,
      marginTop: 8,
      borderRadius: 8,
    },
    sectionHeaderText: {
      fontSize: Math.round(16 * factor),
      fontWeight: '700',
      color: palette.primary,
    },
    resourceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: palette.card,
      borderRadius: 8,
      marginVertical: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.border,
      gap: 12,
    },
    resourceContent: {
      flex: 1,
    },
    resourceTitle: {
      fontSize: Math.round(16 * factor),
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    provinceTag: {
      fontSize: Math.round(12 * factor),
      color: palette.primary,
      marginBottom: 4,
      fontWeight: '500',
    },
    resourceDescription: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.8,
    },
    emptyState: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: Math.round(16 * factor),
      color: palette.muted,
      marginTop: 12,
      textAlign: 'center',
    },
    resetButton: {
      fontSize: Math.round(14 * factor),
      color: palette.primary,
      marginTop: 12,
      textDecorationLine: 'underline',
    },
  });
}
