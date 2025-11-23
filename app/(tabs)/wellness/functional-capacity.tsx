import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useFunctionalCapacity } from '../../../services/functionalCapacityEvaluator';
import { useAppPalette } from '../../../theme/usePalette';

export default function FunctionalCapacityScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  const capacity = useFunctionalCapacity();

  const assessment = capacity.getLatestAssessment();
  const domains = capacity.getDomains();

  const startWeeklyAssessment = () => {
      router.push('/wellness/functional-capacity-wizard' as any);
  };

  // Group domains by category
  const domainsByCategory: Record<string, typeof domains> = {};
  domains.forEach(domain => {
    if (!domainsByCategory[domain.category]) {
      domainsByCategory[domain.category] = [];
    }
    domainsByCategory[domain.category].push(domain);
  });

  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      body_function: 'Body Functions',
      body_structure: 'Body Structures',
      activity: 'Activities',
      participation: 'Participation',
      environment: 'Environmental Factors',
    };
    return names[category] || category;
  };

  const getCategoryIcon = (category: string): any => {
    const icons: Record<string, any> = {
      body_function: 'fitness',
      body_structure: 'body',
      activity: 'walk',
      participation: 'people',
      environment: 'earth',
    };
    return icons[category] || 'help-circle';
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Functional Capacity'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Introduction */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.headerRow}>
            <Ionicons name="clipboard" size={32} color={palette.primary} />
            <Text style={[styles.title, { color: palette.text }]}>WHO ICF Assessment</Text>
          </View>
          <Text style={[styles.description, { color: palette.textSecondary }]}>
            Self-administered functional assessment based on the World Health Organization's
            International Classification of Functioning, Disability and Health.
          </Text>
        </View>

        {/* Latest Assessment Summary */}
        {assessment ? (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Latest Assessment
            </Text>
            <Text style={[styles.dateText, { color: palette.textSecondary }]}>
              {new Date(assessment.timestamp).toLocaleDateString()}
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreValue, { color: palette.primary }]}>
                {assessment.overallScore}%
              </Text>
              <Text style={[styles.scoreLabel, { color: palette.textSecondary }]}>
                Overall Functional Capacity
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No assessments yet. Start your first assessment to establish a baseline.
            </Text>
          </View>
        )}

        {/* ICF Categories */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>ICF Domains</Text>
          {Object.entries(domainsByCategory).map(([category, categoryDomains]) => (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Ionicons
                  name={getCategoryIcon(category)}
                  size={20}
                  color={palette.primary}
                />
                <Text style={[styles.categoryName, { color: palette.text }]}>
                  {getCategoryName(category)} ({categoryDomains.length})
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Start Assessment */}
        <View style={[styles.card, { backgroundColor: palette.primary }]}>
          <Pressable onPress={startWeeklyAssessment} style={styles.startButton}>
            <Ionicons name="play-circle" size={32} color="#FFF" />
            <Text style={styles.startButtonText}>Start Assessment</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 14,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  categorySection: {
    marginTop: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 32,
  },
});



