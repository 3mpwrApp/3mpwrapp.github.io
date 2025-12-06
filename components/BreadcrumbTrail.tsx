/**
 * Breadcrumb Trail Component
 * 
 * Shows a persistent visual path of how user got to current screen.
 * Helps users with brain fog understand their navigation context.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_12 } from '../constants/A11Y';
import { useTranslation } from '../i18n';
import {
    getRecentHistory,
    subscribe,
    type NavigationHistoryEntry,
} from '../store/cognitiveComfort';
import { useAppPalette } from '../theme/usePalette';

interface BreadcrumbTrailProps {
  visible?: boolean;
  maxItems?: number;
  showHome?: boolean;
}

// Map segments to readable names
const SEGMENT_NAMES: Record<string, string> = {
  '(tabs)': 'Home',
  'wellness': 'Wellness',
  'community': 'Community',
  'resources': 'Resources',
  'advocacy': 'Advocacy',
  'settings': 'Settings',
  'campaigns': 'Campaigns',
  'profile': 'Profile',
  'events': 'Events',
  'research': 'Research',
  'podcasts': 'Podcasts',
  'admin': 'Admin',
};

export function BreadcrumbTrail({ 
  visible = true, 
  maxItems = 4,
  showHome = true,
}: BreadcrumbTrailProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  const segments = useSegments();
  
  const [_history, setHistory] = useState<NavigationHistoryEntry[]>([]);
  
  useEffect(() => {
    const updateHistory = () => {
      setHistory(getRecentHistory(maxItems));
    };
    
    updateHistory();
    return subscribe(updateHistory);
  }, [maxItems]);
  
  if (!visible) return null;
  
  // Build breadcrumb items from current path
  const buildBreadcrumbs = () => {
    const items: { name: string; path: string }[] = [];
    
    if (showHome) {
      items.push({ name: t('nav.home', 'Home'), path: '/(tabs)' });
    }
    
    let currentPath = '';
    for (const segment of segments) {
      if (segment.startsWith('(') && segment.endsWith(')')) {
        // Skip route groups but note them
        if (segment !== '(tabs)') {
          currentPath += `/${segment}`;
        }
        continue;
      }
      
      currentPath += `/${segment}`;
      const name = SEGMENT_NAMES[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      // Don't duplicate home
      if (name === 'Home' && items.length > 0 && items[0].name === 'Home') continue;
      
      items.push({ name, path: currentPath });
    }
    
    return items;
  };
  
  const breadcrumbs = buildBreadcrumbs();
  
  // Don't show if just at home
  if (breadcrumbs.length <= 1) return null;
  
  const handleNavigate = (path: string, isLast: boolean) => {
    if (isLast) return; // Don't navigate to current page
    router.push(path as any);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Ionicons name="navigate" size={14} color={palette.primary} style={styles.icon} />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.youAreHere, { color: palette.muted }]}>
          {t('cognitive.youAreHere', 'You are here:')}
        </Text>
        
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <React.Fragment key={item.path}>
              {index > 0 && (
                <Ionicons 
                  name="chevron-forward" 
                  size={12} 
                  color={palette.muted} 
                  style={styles.separator}
                />
              )}
              <Pressable
                onPress={() => handleNavigate(item.path, isLast)}
                disabled={isLast}
                accessibilityRole="link"
                accessibilityLabel={item.name}
                accessibilityState={{ selected: isLast }}
                hitSlop={HIT_SLOP_12}
                style={styles.breadcrumb}
              >
                <Text
                  style={[
                    styles.breadcrumbText,
                    { color: isLast ? palette.text : palette.primary },
                    isLast && styles.currentPage,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </Pressable>
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  youAreHere: {
    fontSize: 11,
    fontWeight: '500',
    marginRight: 8,
  },
  separator: {
    marginHorizontal: 4,
  },
  breadcrumb: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: '500',
  },
  currentPage: {
    fontWeight: '700',
  },
});

export default BreadcrumbTrail;
