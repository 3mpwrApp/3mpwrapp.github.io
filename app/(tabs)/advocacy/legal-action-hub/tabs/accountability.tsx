/**
 * Accountability Tab - Case tracking and action items
 * Consolidates: accountability-hub, accountability-cases, accountability-case, case-timeline
 */

import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Case {
  id: string;
  title: string;
  status: 'active' | 'resolved' | 'pending';
  lastUpdated: Date;
  description: string;
}

const AccountabilityTab: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cases from Firestore or AsyncStorage
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      // TODO: Load from Firestore
      setCases([]);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCaseCard = ({ item }: { item: Case }) => (
    <TouchableOpacity style={styles.caseCard}>
      <View style={styles.caseHeader}>
        <Text style={styles.caseTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.caseDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.lastUpdated}>
        Last updated: {item.lastUpdated.toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cases & Accountability Actions</Text>
      <FlatList
        data={cases}
        renderItem={renderCaseCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No cases yet. Start tracking your accountability journey.</Text>
          </View>
        }
      />
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return '#3b82f6';
    case 'resolved':
      return '#10b981';
    case 'pending':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1f2937',
  },
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  caseDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default AccountabilityTab;
