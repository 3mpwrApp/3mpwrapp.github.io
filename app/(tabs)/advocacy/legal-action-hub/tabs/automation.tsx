/**
 * Automation Tab - Legal workflows, AI analysis
 * Consolidates: legal-automation, justice-as-a-service
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AutomationWorkflow {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'beta' | 'coming-soon';
}

const AutomationTab: React.FC = () => {
  const workflows: AutomationWorkflow[] = [
    {
      id: '1',
      title: 'Document Analysis',
      description: 'AI-powered analysis of legal documents',
      status: 'available',
    },
    {
      id: '2',
      title: 'Legal Timeline',
      description: 'Auto-organize your legal journey',
      status: 'available',
    },
    {
      id: '3',
      title: 'Case Summary Generator',
      description: 'Generate summaries from case notes',
      status: 'beta',
    },
  ];

  const renderWorkflow = (item: AutomationWorkflow) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.workflowCard, item.status === 'coming-soon' && styles.workflowCardDisabled]}
    >
      <View style={styles.workflowHeader}>
        <View style={styles.workflowInfo}>
          <Text style={styles.workflowTitle}>{item.title}</Text>
          <Text style={styles.workflowDescription}>{item.description}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status === 'coming-soon' ? 'Soon' : item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Legal Automation & AI Tools</Text>
      <Text style={styles.subtitle}>Power user workflows for advanced legal management</Text>

      <View style={styles.workflowsList}>
        {workflows.map(renderWorkflow)}
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return '#10b981';
    case 'beta':
      return '#f59e0b';
    case 'coming-soon':
      return '#d1d5db';
    default:
      return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  workflowsList: {
    marginBottom: 20,
  },
  workflowCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  workflowCardDisabled: {
    opacity: 0.5,
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workflowInfo: {
    flex: 1,
    marginRight: 12,
  },
  workflowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  workflowDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AutomationTab;
