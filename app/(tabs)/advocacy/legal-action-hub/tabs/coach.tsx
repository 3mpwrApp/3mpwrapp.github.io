/**
 * Coach Tab - Scripts, support, and coaching resources
 * Consolidates: accountability-coach, accountability-network
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CoachResource {
  id: string;
  title: string;
  category: 'script' | 'support' | 'evidence';
  difficulty: 'easy' | 'medium' | 'advanced';
  duration: string;
}

const CoachTab: React.FC = () => {
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
      return '#10b981';
    case 'medium':
      return '#f59e0b';
    case 'advanced':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1f2937',
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
    borderColor: '#d1d5db',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  resourcesList: {
    paddingHorizontal: 16,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
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
    color: '#1f2937',
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
    color: '#fff',
  },
  resourceDuration: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default CoachTab;
