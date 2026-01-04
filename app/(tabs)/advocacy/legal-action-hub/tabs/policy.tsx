/**
 * Policy Tab - Advocacy, laws, and campaigns
 * Consolidates: policy-simple
 */

import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Policy {
  id: string;
  title: string;
  jurisdiction: string;
  status: 'active' | 'proposed' | 'passed';
  impact: 'high' | 'medium' | 'low';
}

const PolicyTab: React.FC = () => {
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
              backgroundColor: item.impact === 'high' ? '#ef4444' : item.impact === 'medium' ? '#f59e0b' : '#10b981',
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1f2937',
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
  policyList: {
    paddingBottom: 20,
  },
  policyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#06b6d4',
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
    color: '#1f2937',
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
    color: '#fff',
  },
  policyStatus: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});

export default PolicyTab;
