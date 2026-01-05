/**
 * Automation Tab - Legal workflows, AI analysis
 * Consolidates: legal-automation, justice-as-a-service
 */

import { useTheme } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AutomationWorkflow {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'beta' | 'coming-soon';
}

const FALLBACK_COLORS = {
  text: '#1f2937', // eslint-disable-line no-restricted-syntax
  muted: '#6b7280', // eslint-disable-line no-restricted-syntax
  primary: '#3b82f6', // eslint-disable-line no-restricted-syntax
  card: '#fff', // eslint-disable-line no-restricted-syntax
  border: '#d1d5db', // eslint-disable-line no-restricted-syntax
  accentWarning: '#f59e0b', // eslint-disable-line no-restricted-syntax
  success: '#10b981', // eslint-disable-line no-restricted-syntax
  coming: '#d1d5db', // eslint-disable-line no-restricted-syntax
};

const AutomationTab: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
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
      return FALLBACK_COLORS.success;
    case 'beta':
      return FALLBACK_COLORS.accentWarning;
    case 'coming-soon':
      return FALLBACK_COLORS.coming;
    default:
      return FALLBACK_COLORS.muted;
  }
};

const createStyles = (theme: any) => {
  const colors = {
    text: theme.colors?.text || FALLBACK_COLORS.text,
    muted: theme.colors?.text ? FALLBACK_COLORS.muted : FALLBACK_COLORS.muted,
    primary: theme.colors?.primary || FALLBACK_COLORS.primary,
    card: theme.colors?.card || FALLBACK_COLORS.card,
    border: theme.colors?.border || FALLBACK_COLORS.border,
    accentWarning: FALLBACK_COLORS.accentWarning,
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      marginBottom: 16,
    },
    workflowsList: {
      marginBottom: 20,
    },
    workflowCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.accentWarning,
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
      color: colors.text,
      marginBottom: 4,
    },
    workflowDescription: {
      fontSize: 13,
      color: colors.muted,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#fff', // eslint-disable-line no-restricted-syntax
    },
  });
};

export default AutomationTab;
