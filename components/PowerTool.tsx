/**
 * PowerTool - Unified tabbed interface for consolidated features
 * 
 * Combines multiple related features into a single tabbed interface,
 * reducing navigation complexity while maintaining full functionality.
 * 
 * Features:
 * - Internal tabbed navigation
 * - Complexity mode integration (shows/hides tabs based on mode)
 * - Accessible design with proper screen reader support
 * - Lazy loading of tab content
 * - Offline indicator
 * - Search within Power Tool
 */

import { Ionicons } from '@expo/vector-icons';
import React, { Suspense, useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { logEvent } from '../services/analytics';
import { useComplexityMode } from '../store/complexityMode';
import { useNetwork } from '../store/network';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';
import GapView from './GapView';
import SearchBar from './SearchBar';

export interface PowerToolTab {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Emoji or icon name */
  icon: string;
  /** Minimum complexity level to show this tab */
  complexity: 'simple' | 'standard' | 'power_user';
  /** Tab content component */
  component: React.ComponentType<PowerToolTabProps>;
  /** Optional badge (new, beta, etc.) */
  badge?: 'new' | 'beta' | 'coming';
  /** Searchable keywords for this tab */
  keywords?: string[];
}

export interface PowerToolTabProps {
  /** Current search query within the Power Tool */
  searchQuery: string;
  /** Whether this tab is currently active */
  isActive: boolean;
  /** Callback to navigate to another tab */
  navigateToTab: (tabId: string) => void;
}

interface PowerToolProps {
  /** Power Tool title */
  title: string;
  /** Power Tool subtitle/description */
  subtitle?: string;
  /** Main icon (emoji) */
  icon: string;
  /** Array of tabs */
  tabs: PowerToolTab[];
  /** Default selected tab ID */
  defaultTab?: string;
  /** Show search bar */
  showSearch?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Analytics event prefix */
  analyticsPrefix?: string;
  /** Header right component */
  headerRight?: React.ReactNode;
  /** Show offline indicator */
  showOfflineIndicator?: boolean;
}

// Loading fallback for lazy-loaded tabs
function TabLoadingFallback() {
  const palette = useAppPalette();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <ActivityIndicator size="large" color={palette.primary} />
      <Text style={{ color: palette.muted, marginTop: 12, fontSize: 14 }}>
        Loading...
      </Text>
    </View>
  );
}

// Tab button component
const TabButton = React.memo<{
  tab: PowerToolTab;
  isActive: boolean;
  onPress: () => void;
  palette: ReturnType<typeof useAppPalette>;
}>(({ tab, isActive, onPress, palette }) => {
  const getBadgeColor = () => {
    switch (tab.badge) {
      case 'new': return palette.success;
      case 'beta': return palette.warning;
      case 'coming': return palette.muted;
      default: return undefined;
    }
  };

  const styles = StyleSheet.create({
    tabButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: isActive ? palette.primary : 'transparent',
      borderWidth: isActive ? 0 : 1,
      borderColor: palette.border,
      gap: 6,
    },
    tabLabel: {
      fontSize: 13,
      fontWeight: isActive ? '600' : '500',
      color: isActive ? palette.onPrimary : palette.text,
    },
    tabIcon: {
      fontSize: 16,
    },
    badge: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginLeft: 2,
    },
  });

  const badgeColor = getBadgeColor();

  return (
    <A11yPressable
      style={styles.tabButton}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${tab.label}${tab.badge ? ` (${tab.badge})` : ''}. Tab ${isActive ? 'selected' : ''}`}
      hitSlop={HIT_SLOP_8}
    >
      <Text style={styles.tabIcon}>{tab.icon}</Text>
      <Text style={styles.tabLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {tab.label}
      </Text>
      {badgeColor && <View style={[styles.badge, { backgroundColor: badgeColor }]} />}
    </A11yPressable>
  );
});
TabButton.displayName = 'TabButton';

export default function PowerTool({
  title,
  subtitle,
  icon,
  tabs,
  defaultTab,
  showSearch = true,
  searchPlaceholder,
  analyticsPrefix = 'power_tool',
  headerRight,
  showOfflineIndicator = true,
}: PowerToolProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { mode } = useComplexityMode();
  const { offline } = useNetwork();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Filter tabs based on complexity mode
  const visibleTabs = useMemo(() => {
    return tabs.filter(tab => {
      if (mode === 'simple') return tab.complexity === 'simple';
      if (mode === 'standard') return tab.complexity !== 'power_user';
      return true;
    });
  }, [tabs, mode]);

  // Set initial active tab
  const currentActiveTab = useMemo(() => {
    if (activeTabId && visibleTabs.find(t => t.id === activeTabId)) {
      return activeTabId;
    }
    if (defaultTab && visibleTabs.find(t => t.id === defaultTab)) {
      return defaultTab;
    }
    return visibleTabs[0]?.id || null;
  }, [activeTabId, defaultTab, visibleTabs]);

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    logEvent(`${analyticsPrefix}.tab.changed`, { tab: tabId });
  }, [analyticsPrefix]);

  // Navigate to tab from within a tab component
  const navigateToTab = useCallback((tabId: string) => {
    const tab = visibleTabs.find(t => t.id === tabId);
    if (tab) {
      handleTabChange(tabId);
    }
  }, [visibleTabs, handleTabChange]);

  // Get active tab component
  const activeTab = useMemo(() => {
    return visibleTabs.find(t => t.id === currentActiveTab);
  }, [visibleTabs, currentActiveTab]);

  // Filter tabs by search (if searching for a tab)
  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return visibleTabs;
    const q = searchQuery.toLowerCase();
    return visibleTabs.filter(tab => 
      tab.label.toLowerCase().includes(q) ||
      tab.keywords?.some(k => k.toLowerCase().includes(q))
    );
  }, [visibleTabs, searchQuery]);

  const styles = createStyles(palette);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.titleContainer}>
            <Text 
              style={styles.title} 
              accessibilityRole="header"
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {subtitle}
              </Text>
            )}
          </View>
          {headerRight}
        </View>

        {/* Offline indicator */}
        {showOfflineIndicator && offline && (
          <View style={styles.offlineIndicator}>
            <Ionicons name="cloud-offline" size={14} color={palette.warning} />
            <Text style={styles.offlineText}>{t('common.offline', 'Offline')}</Text>
          </View>
        )}
      </View>

      {/* Search */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={searchPlaceholder || t('common.search', 'Search...')}
          />
        </View>
      )}

      {/* Tab Bar */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
        accessibilityRole="tablist"
      >
        {filteredTabs.map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={tab.id === currentActiveTab}
            onPress={() => handleTabChange(tab.id)}
            palette={palette}
          />
        ))}
      </ScrollView>

      {/* Mode indicator */}
      {visibleTabs.length < tabs.length && (
        <View style={styles.modeIndicator}>
          <Ionicons name="information-circle-outline" size={14} color={palette.muted} />
          <Text style={styles.modeText}>
            {t('powerTool.moreTabs', '{{count}} more tabs in {{mode}} mode', {
              count: tabs.length - visibleTabs.length,
              mode: mode === 'simple' ? 'Standard' : 'Power User',
            })}
          </Text>
        </View>
      )}

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab ? (
          <Suspense fallback={<TabLoadingFallback />}>
            <activeTab.component
              searchQuery={searchQuery}
              isActive={true}
              navigateToTab={navigateToTab}
            />
          </Suspense>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {t('powerTool.noTabs', 'No tabs available')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Wrapper component for individual Power Tool tabs
 * Use this to wrap existing screen content
 */
export function PowerToolTabContent({ 
  children,
  scrollable = true,
}: { 
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  if (scrollable) {
    return (
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      {children}
    </View>
  );
}

/**
 * Quick action button for use within Power Tool tabs
 */
export function PowerToolAction({
  label,
  icon,
  onPress,
  variant = 'default',
}: {
  label: string;
  icon: string;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'destructive';
}) {
  const palette = useAppPalette();
  
  const getColors = () => {
    switch (variant) {
      case 'primary': return { bg: palette.primary, text: palette.onPrimary };
      case 'destructive': return { bg: palette.error, text: palette.onPrimary };
      default: return { bg: palette.card, text: palette.text };
    }
  };
  
  const colors = getColors();
  
  return (
    <A11yPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT_SLOP_8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: variant === 'default' ? 1 : 0,
        borderColor: palette.border,
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{ 
        color: colors.text, 
        fontSize: 15, 
        fontWeight: '600',
        flex: 1,
      }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.text} />
    </A11yPressable>
  );
}

/**
 * Section header for use within Power Tool tabs
 */
export function PowerToolSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const palette = useAppPalette();
  
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 16,
        fontWeight: '700',
        color: palette.text,
        marginBottom: 12,
      }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {title}
      </Text>
      <GapView gap={10}>
        {children}
      </GapView>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.surface,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      fontSize: 32,
      marginRight: 12,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.text,
    },
    subtitle: {
      fontSize: 14,
      color: palette.muted,
      marginTop: 2,
    },
    offlineIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.warning + '20',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      marginTop: 8,
      alignSelf: 'flex-start',
      gap: 6,
    },
    offlineText: {
      fontSize: 12,
      color: palette.warning,
      fontWeight: '500',
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    tabBar: {
      flexGrow: 0,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.border,
    },
    tabBarContent: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 8,
    },
    modeIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: palette.muted + '10',
      gap: 6,
    },
    modeText: {
      fontSize: 12,
      color: palette.muted,
    },
    content: {
      flex: 1,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 14,
      color: palette.muted,
    },
  });
}
