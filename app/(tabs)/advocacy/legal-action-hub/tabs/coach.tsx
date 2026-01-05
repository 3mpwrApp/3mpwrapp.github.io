/**
 * Coach Tab - Scripts, support, and coaching resources
 * Consolidates: accountability-coach, accountability-network
 */

import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CoachResource {
  id: string;
  title: string;
  category: 'script' | 'support' | 'evidence';
  difficulty: 'easy' | 'medium' | 'advanced';
  duration: string;
}

const FALLBACK_COLORS = {
  text: '#1f2937', // eslint-disable-line no-restricted-syntax
  muted: '#6b7280', // eslint-disable-line no-restricted-syntax
  mutedLight: '#9ca3af', // eslint-disable-line no-restricted-syntax
  primary: '#3b82f6', // eslint-disable-line no-restricted-syntax
  card: '#fff', // eslint-disable-line no-restricted-syntax
  border: '#d1d5db', // eslint-disable-line no-restricted-syntax
  accent: '#8b5cf6', // eslint-disable-line no-restricted-syntax
  success: '#10b981', // eslint-disable-line no-restricted-syntax
  warning: '#f59e0b', // eslint-disable-line no-restricted-syntax
  error: '#ef4444', // eslint-disable-line no-restricted-syntax
};

const CoachTab: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedCategory, setSelectedCategory] = useState<'script' | 'support' | 'evidence' | 'all'>('all');

  const resources: CoachResource[] = [
    {
      id: '1',
      title: 'Speaking to Medical Professionals',
      category: 'script',
      difficulty: 'easy',
      duration: '5 min',
    },
    {
      id: '2',
      title: 'Building Your Support Network',
      category: 'support',
      difficulty: 'medium',
      duration: '15 min',
    },
  ];

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(r => r.category === selectedCategory);

  const renderResourceCard = (item: CoachResource) => (
    <TouchableOpacity key={item.id} style={styles.resourceCard}>
      <View style={styles.resourceHeader}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>
      <Text style={styles.resourceDuration}>{item.duration}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Coaching & Support Resources</Text>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {['all', 'script', 'support', 'evidence'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterButton,
              selectedCategory === cat && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === cat && styles.filterButtonTextActive,
              ]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Resources List */}
      <View style={styles.resourcesList}>
        {filteredResources.map(renderResourceCard)}
      </View>
    </ScrollView>
  );
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return FALLBACK_COLORS.success;
    case 'medium':
      return FALLBACK_COLORS.warning;
    case 'advanced':
      return FALLBACK_COLORS.error;
    default:
      return FALLBACK_COLORS.muted;
  }
};

const createStyles = (theme: any) => {
  const colors = {
    text: theme.colors?.text || FALLBACK_COLORS.text,
    muted: theme.colors?.text ? FALLBACK_COLORS.muted : FALLBACK_COLORS.muted,
    mutedLight: FALLBACK_COLORS.mutedLight,
    primary: theme.colors?.primary || FALLBACK_COLORS.primary,
    card: theme.colors?.card || FALLBACK_COLORS.card,
    border: theme.colors?.border || FALLBACK_COLORS.border,
    accent: FALLBACK_COLORS.accent,
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
      color: colors.text,
      paddingHorizontal: 16,
    },
    filterBar: {
      paddingHorizontal: 16,
      marginBottom: 16,
      flexDirection: 'row',
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.muted,
    },
    filterButtonTextActive: {
      color: '#fff', // eslint-disable-line no-restricted-syntax
    },
    resourcesList: {
      paddingHorizontal: 16,
    },
    resourceCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    resourceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    resourceTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginLeft: 8,
    },
    difficultyText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#fff', // eslint-disable-line no-restricted-syntax
    },
    resourceDuration: {
      fontSize: 12,
      color: colors.mutedLight,
    },
  });
};

export default CoachTab;
