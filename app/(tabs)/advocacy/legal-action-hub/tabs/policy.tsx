/**
 * Policy Tab - Advocacy, laws, and campaigns
 * Consolidates: policy-simple
 */

import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Policy {
  id: string;
  title: string;
  jurisdiction: string;
  status: 'active' | 'proposed' | 'passed';
  impact: 'high' | 'medium' | 'low';
}

const FALLBACK_COLORS = {
  text: '#1f2937', // eslint-disable-line no-restricted-syntax
  muted: '#6b7280', // eslint-disable-line no-restricted-syntax
  border: '#d1d5db', // eslint-disable-line no-restricted-syntax
  card: '#fff', // eslint-disable-line no-restricted-syntax
  primary: '#3b82f6', // eslint-disable-line no-restricted-syntax
  accent: '#06b6d4', // eslint-disable-line no-restricted-syntax
  error: '#ef4444', // eslint-disable-line no-restricted-syntax
  warning: '#f59e0b', // eslint-disable-line no-restricted-syntax
  success: '#10b981', // eslint-disable-line no-restricted-syntax
};

const PolicyTab: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('federal');

  const jurisdictions = ['federal', 'state', 'local'];

  const policies: Policy[] = [
    {
      id: '1',
      title: 'Disability Rights Act',
      jurisdiction: 'federal',
      status: 'active',
      impact: 'high',
    },
    {
      id: '2',
      title: 'Medical Discrimination Prevention',
      jurisdiction: 'state',
      status: 'proposed',
      impact: 'high',
    },
  ];

  const filteredPolicies = policies.filter((p) => p.jurisdiction === selectedJurisdiction);

  const renderPolicyCard = ({ item }: { item: Policy }) => (
    <TouchableOpacity style={styles.policyCard}>
      <View style={styles.policyHeader}>
        <Text style={styles.policyTitle}>{item.title}</Text>
        <View
          style={[
            styles.impactBadge,
            {
              backgroundColor: item.impact === 'high' ? FALLBACK_COLORS.error : item.impact === 'medium' ? FALLBACK_COLORS.warning : FALLBACK_COLORS.success,
            },
          ]}
        >
          <Text style={styles.impactText}>{item.impact}</Text>
        </View>
      </View>
      <Text style={styles.policyStatus}>{item.status.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Policy & Advocacy</Text>

      {/* Jurisdiction Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {jurisdictions.map((juris) => (
          <TouchableOpacity
            key={juris}
            style={[
              styles.filterButton,
              selectedJurisdiction === juris && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedJurisdiction(juris)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedJurisdiction === juris && styles.filterButtonTextActive,
              ]}
            >
              {juris.charAt(0).toUpperCase() + juris.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Policies List */}
      <FlatList
        data={filteredPolicies}
        renderItem={renderPolicyCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.policyList}
      />
    </View>
  );
};

const createStyles = (theme: any) => {
  const colors = {
    text: theme.colors?.text || FALLBACK_COLORS.text,
    border: theme.colors?.border || FALLBACK_COLORS.border,
    muted: theme.colors?.muted || FALLBACK_COLORS.muted,
    card: theme.colors?.card || FALLBACK_COLORS.card,
    primary: theme.colors?.primary || FALLBACK_COLORS.primary,
    accent: FALLBACK_COLORS.accent,
  };

  return StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.text,
  },
  filterBar: {
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
    color: colors.card, // '#fff'
  },
  policyList: {
    paddingBottom: 20,
  },
  policyCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  impactText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff', // eslint-disable-line no-restricted-syntax
  },
  policyStatus: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },
  });
};

export default PolicyTab;
