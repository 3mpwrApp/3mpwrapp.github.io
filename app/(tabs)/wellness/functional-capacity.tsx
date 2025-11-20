import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';

export default function FunctionalCapacityScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const capacity = useFunctionalCapacity();

  const [_assessment, _setAssessment] = useState(capacity.getLatestAssessment());
  const [showClaimData, setShowClaimData] = useState(false);

  const categories = capacity.getICFCategories();

  const startWeeklyAssessment = async () => {
    // Navigate to assessment wizard (would be a separate screen in production)
    alert('Weekly assessment wizard coming soon!');
  };

  const viewClaimData = () => {
    const _claimData = capacity.generateDisabilityClaimData();
    setShowClaimData(!showClaimData);
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'Body Functions': 'fitness',
      'Body Structures': 'body',
      Activities: 'walk',
      Participation: 'people',
      'Environmental Factors': 'earth',
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
            International Classification of Functioning, Disability and Health. Takes 2 minutes
            weekly to track 50 functional domains.
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

            <View style={styles.scoreGrid}>
              {Object.entries(assessment.categoryScores).map(([category, score]) => (
                <View key={category} style={[styles.scoreCard, { borderColor: palette.border }]}>
                  <Ionicons
                    name={getCategoryIcon(category) as any}
                    size={24}
                    color={score > 50 ? palette.primary : score > 25 ? palette.primary : palette.primary}
                  />
                  <Text style={[styles.scoreCategoryName, { color: palette.text }]}>
                    {category}
                  </Text>
                  <Text
                    style={[
                      styles.scoreValue,
                      {
                        color: score > 50 ? palette.primary : score > 25 ? palette.primary : palette.primary,
                      },
                    ]}
                  >
                    {score.toFixed(0)}%
                  </Text>
                  <Text style={[styles.scoreLabel, { color: palette.textSecondary }]}>
                    impairment
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.trendSection}>
              <Text style={[styles.trendTitle, { color: palette.text }]}>Trends</Text>
              {capacity.getTrends(30) && (
                <View>
                  <View style={styles.trendRow}>
                    <Ionicons name="trending-up" size={20} color={palette.textSecondary} />
                    <Text style={[styles.trendText, { color: palette.text }]}>
                      Since last month: {capacity.getTrends(30)?.oneMonthChange.toFixed(1)}%
                      change
                    </Text>
                  </View>
                  <View style={styles.trendRow}>
                    <Ionicons name="calendar" size={20} color={palette.textSecondary} />
                    <Text style={[styles.trendText, { color: palette.text }]}>
                      3-month trend:{' '}
                      {capacity.getTrends(90)?.threeMonthChange
                        ? capacity.getTrends(90)!.threeMonthChange.toFixed(1) + '%'
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No assessments yet. Start your first weekly assessment to establish a baseline.
            </Text>
          </View>
        )}

        {/* ICF Categories */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>50 ICF Domains</Text>
          <Text style={[styles.description, { color: palette.textSecondary }]}>
            Each assessment covers these functional areas:
          </Text>

          {Object.entries(categories).map(([category, domains]) => (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Ionicons
                  name={getCategoryIcon(category) as any}
                  size={20}
                  color={palette.primary}
                />
                <Text style={[styles.categoryName, { color: palette.text }]}>{category}</Text>
              </View>
              <View style={styles.domainList}>
                {domains.map((domain, index) => (
                  <View key={index} style={styles.domainItem}>
                    <View style={[styles.domainBullet, { backgroundColor: palette.primary }]} />
                    <Text style={[styles.domainText, { color: palette.textSecondary }]}>
                      {domain}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Disability Claim Data */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.claimHeader}>
            <Ionicons name="document-text" size={24} color={palette.primary} />
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Disability Claim Support
            </Text>
          </View>
          <Text style={[styles.description, { color: palette.textSecondary }]}>
            Generate standardized functional capacity data for SSDI, LTD, or other disability
            applications.
          </Text>

          <Pressable
            style={[styles.claimButton, { backgroundColor: palette.primary }]}
            onPress={viewClaimData}
          >
            <Ionicons name="document" size={20} color="#FFF" />
            <Text style={styles.claimButtonText}>
              {showClaimData ? 'Hide' : 'View'} Claim Data
            </Text>
          </Pressable>

          {showClaimData && assessment && (
            <View style={[styles.claimDataCard, { backgroundColor: palette.background }]}>
              {(() => {
                const _claimData = capacity.generateDisabilityClaimData();
                if (!claimData) return null;

                return (
                  <View>
                    <Text style={[styles.claimDataTitle, { color: palette.text }]}>
                      Claim Strength: {claimData.claimStrength.toUpperCase()}
                    </Text>

                    <View style={styles.claimDataSection}>
                      <Text style={[styles.claimDataLabel, { color: palette.textSecondary }]}>
                        Severe Limitations:
                      </Text>
                      {claimData.severeLimitations.map((limitation, index) => (
                        <Text key={index} style={[styles.claimDataText, { color: palette.text }]}>
                          • {limitation}
                        </Text>
                      ))}
                    </View>

                    <View style={styles.claimDataSection}>
                      <Text style={[styles.claimDataLabel, { color: palette.textSecondary }]}>
                        Functional Decline:
                      </Text>
                      <Text style={[styles.claimDataText, { color: palette.text }]}>
                        {claimData.functionalDeclineRate.toFixed(1)}% per month
                      </Text>
                    </View>

                    <View style={styles.claimDataSection}>
                      <Text style={[styles.claimDataLabel, { color: palette.textSecondary }]}>
                        Population Percentile:
                      </Text>
                      <Text style={[styles.claimDataText, { color: palette.text }]}>
                        {claimData.populationPercentile.toFixed(0)}th percentile
                      </Text>
                    </View>

                    <Text style={[styles.claimDataNote, { color: palette.textSecondary }]}>
                      This data can be exported and attached to disability applications.
                    </Text>
                  </View>
                );
              })()}
            </View>
          )}
        </View>

        {/* Start Assessment */}
        <View style={[styles.card, { backgroundColor: palette.primary }]}>
          <Pressable style={styles.startButton} onPress={startWeeklyAssessment}>
            <Ionicons name="play-circle" size={32} color="#FFF" />
            <View style={styles.startButtonText}>
              <Text style={styles.startButtonTitle}>Start Weekly Assessment</Text>
              <Text style={styles.startButtonSubtitle}>Takes 2 minutes • 50 questions</Text>
            </View>
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
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  scoreCard: {
    width: '47%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  scoreCategoryName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 11,
  },
  trendSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTop// color removed,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendText: {
    fontSize: 14,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  categorySection: {
    marginTop: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  domainList: {
    marginLeft: 28,
  },
  domainItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  domainBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    marginRight: 8,
  },
  domainText: {
    fontSize: 13,
    flex: 1,
  },
  claimHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  claimButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  claimDataCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  claimDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  claimDataSection: {
    marginBottom: 16,
  },
  claimDataLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  claimDataText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
  },
  claimDataNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonText: {
    marginLeft: 16,
  },
  startButtonTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startButtonSubtitle: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 32,
  },
});



