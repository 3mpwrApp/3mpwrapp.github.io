/**
 * Legal Help Tab - Find lawyers, collective action, legal DNA
 * Consolidates: lawyer-finder, collective-legal, legal-dna
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LegalHelpTab: React.FC = () => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1f2937',
  },
  sectionTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  sectionTabActive: {
    borderBottomColor: '#3b82f6',
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  sectionTabTextActive: {
    color: '#3b82f6',
  },
  content: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default LegalHelpTab;
