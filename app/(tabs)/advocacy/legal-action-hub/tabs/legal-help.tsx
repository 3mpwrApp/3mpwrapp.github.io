/**
 * Legal Help Tab - Find lawyers, collective action, legal DNA
 * Consolidates: lawyer-finder, collective-legal, legal-dna
 */

import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FALLBACK_COLORS = {
  text: '#1f2937', // eslint-disable-line no-restricted-syntax
  muted: '#6b7280', // eslint-disable-line no-restricted-syntax
  primary: '#3b82f6', // eslint-disable-line no-restricted-syntax
  border: '#e5e7eb', // eslint-disable-line no-restricted-syntax
};

const LegalHelpTab: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [activeSection, setActiveSection] = useState<'lawyers' | 'collective' | 'dna'>('lawyers');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Legal Help & Resources</Text>

      {/* Section Tabs */}
      <View style={styles.sectionTabs}>
        <TouchableOpacity
          style={[styles.sectionTab, activeSection === 'lawyers' && styles.sectionTabActive]}
          onPress={() => setActiveSection('lawyers')}
        >
          <Text style={[styles.sectionTabText, activeSection === 'lawyers' && styles.sectionTabTextActive]}>
            Find Lawyers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionTab, activeSection === 'collective' && styles.sectionTabActive]}
          onPress={() => setActiveSection('collective')}
        >
          <Text style={[styles.sectionTabText, activeSection === 'collective' && styles.sectionTabTextActive]}>
            Collective Action
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionTab, activeSection === 'dna' && styles.sectionTabActive]}
          onPress={() => setActiveSection('dna')}
        >
          <Text style={[styles.sectionTabText, activeSection === 'dna' && styles.sectionTabTextActive]}>
            Legal DNA
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Content */}
      {activeSection === 'lawyers' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Find Legal Help</Text>
          <Text style={styles.description}>
            Browse vetted lawyers specializing in your area of need
          </Text>
        </View>
      )}

      {activeSection === 'collective' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Collective Action</Text>
          <Text style={styles.description}>
            Join or start collective legal actions with others
          </Text>
        </View>
      )}

      {activeSection === 'dna' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Your Legal DNA</Text>
          <Text style={styles.description}>
            Understand your legal rights and protections
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (theme: any) => {
  const colors = {
    text: theme.colors?.text || FALLBACK_COLORS.text,
    muted: theme.colors?.text ? FALLBACK_COLORS.muted : FALLBACK_COLORS.muted,
    primary: theme.colors?.primary || FALLBACK_COLORS.primary,
    border: theme.colors?.border || FALLBACK_COLORS.border,
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
      color: colors.text,
    },
    sectionTabs: {
      flexDirection: 'row',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    sectionTabActive: {
      borderBottomColor: colors.primary,
    },
    sectionTabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.muted,
    },
    sectionTabTextActive: {
      color: colors.primary,
    },
    content: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: colors.muted,
      lineHeight: 20,
    },
  });
};

export default LegalHelpTab;
