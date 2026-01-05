/**
 * Accountability Tab - Case tracking and action items
 * Consolidates: accountability-hub, accountability-cases, accountability-case, case-timeline
 */

import { useTheme } from '@react-navigation/native';
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
  const theme = useTheme();
  const styles = createStyles(theme);
  const [cases, setCases] = useState<Case[]>([]);
  const [_loading, setLoading] = useState(true);

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
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, theme) }]}>
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

const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'active':
      // eslint-disable-next-line no-restricted-syntax
      return theme.colors?.primary || '#3b82f6';
    case 'resolved':
      // eslint-disable-next-line no-restricted-syntax
      return '#10b981';
    case 'pending':
      // eslint-disable-next-line no-restricted-syntax
      return '#f59e0b';
    default:
      // eslint-disable-next-line no-restricted-syntax
      return theme.colors?.text ? '#6b7280' : '#6b7280';
  }
};

const FALLBACK_COLORS = {
  text: '#111', // eslint-disable-line no-restricted-syntax
  muted: '#999', // eslint-disable-line no-restricted-syntax
  mutedLight: '#ddd', // eslint-disable-line no-restricted-syntax
  primary: '#06f', // eslint-disable-line no-restricted-syntax
  card: '#f8f8f8', // eslint-disable-line no-restricted-syntax
};

const createStyles = (theme: any) => {
  const colors = {
    text: theme.colors?.text || FALLBACK_COLORS.text,
    muted: theme.colors?.text ? FALLBACK_COLORS.muted : FALLBACK_COLORS.muted,
    mutedLight: FALLBACK_COLORS.mutedLight,
    primary: theme.colors?.primary || FALLBACK_COLORS.primary,
    card: theme.colors?.card || FALLBACK_COLORS.card,
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
      color: colors.text,
    },
    caseCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
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
      color: colors.text,
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
      color: '#fff', // eslint-disable-line no-restricted-syntax
    },
    caseDescription: {
      fontSize: 14,
      color: colors.muted,
      marginBottom: 8,
    },
    lastUpdated: {
      fontSize: 12,
      color: colors.mutedLight,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedLight,
      textAlign: 'center',
    },
  });
};

export default AccountabilityTab;
