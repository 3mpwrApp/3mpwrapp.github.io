import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useFunctionalCapacity } from '../../../services/functionalCapacityEvaluator';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

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

  const downloadReport = async () => {
    if (!assessment) {
      Alert.alert('No Assessment', 'Complete an assessment first to generate a report.');
      return;
    }

    try {
      const Print = await import('expo-print');
      
      // Build detailed report
      const qualifierLabels = ['No Problem (0-4%)', 'Mild (5-24%)', 'Moderate (25-49%)', 'Severe (50-95%)', 'Complete (96-100%)'];
      
      const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>WHO ICF Functional Capacity Assessment Report</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563EB;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1E40AF;
              margin: 10px 0;
              font-size: 24px;
            }
            .header .subtitle {
              color: #6B7280;
              font-size: 14px;
            }
            .summary-box {
              background: #EFF6FF;
              border-left: 4px solid #2563EB;
              padding: 15px;
              margin: 20px 0;
            }
            .score-display {
              text-align: center;
              font-size: 48px;
              font-weight: bold;
              color: #2563EB;
              margin: 20px 0;
            }
            .score-label {
              text-align: center;
              color: #6B7280;
              font-size: 14px;
              margin-bottom: 30px;
            }
            .section {
              margin: 30px 0;
            }
            .section h2 {
              color: #1F2937;
              font-size: 18px;
              border-bottom: 2px solid #E5E7EB;
              padding-bottom: 8px;
            }
            .domain-item {
              padding: 12px;
              margin: 10px 0;
              background: #F9FAFB;
              border-radius: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .domain-name {
              font-weight: 600;
              color: #374151;
            }
            .domain-code {
              color: #6B7280;
              font-size: 12px;
              display: block;
              margin-top: 4px;
            }
            .domain-score {
              font-weight: bold;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 14px;
            }
            .score-0 { background: #D1FAE5; color: #065F46; }
            .score-1 { background: #DBEAFE; color: #1E40AF; }
            .score-2 { background: #FEF3C7; color: #92400E; }
            .score-3 { background: #FEE2E2; color: #991B1B; }
            .score-4 { background: #FEE2E2; color: #7C2D12; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #E5E7EB;
              font-size: 12px;
              color: #6B7280;
            }
            .disclaimer {
              background: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 12px;
              margin: 20px 0;
              font-size: 12px;
            }
            .category-group {
              margin: 20px 0;
              padding: 15px;
              background: white;
              border: 1px solid #E5E7EB;
              border-radius: 8px;
            }
            .category-title {
              font-weight: 700;
              color: #1F2937;
              margin-bottom: 12px;
              font-size: 16px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #E5E7EB;
            }
            th {
              background: #F9FAFB;
              font-weight: 600;
              color: #374151;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>WHO ICF Functional Capacity Assessment</h1>
            <p class="subtitle">International Classification of Functioning, Disability and Health</p>
            <p class="subtitle">Assessment Date: ${new Date(assessment.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div class="summary-box">
            <div class="score-display">${assessment.overallScore}%</div>
            <div class="score-label">Overall Functional Capacity Score</div>
            <p style="text-align: center; color: #6B7280; margin: 0;">
              This score represents your self-reported functional capacity across ${Object.keys(assessment.assessments).length} ICF domains.
            </p>
          </div>

          <div class="section">
            <h2>Assessment Summary by Category</h2>
            ${Object.entries(domainsByCategory).map(([category, categoryDomains]) => {
              const categoryName = getCategoryName(category);
              const categoryAssessments = categoryDomains.map(d => {
                const qualifier = assessment.assessments[d.code];
                return { domain: d, qualifier };
              });
              
              return `
                <div class="category-group">
                  <div class="category-title">${categoryName}</div>
                  ${categoryAssessments.map(({ domain, qualifier }) => `
                    <div class="domain-item">
                      <div>
                        <div class="domain-name">${domain.name}</div>
                        <span class="domain-code">ICF Code: ${domain.code}</span>
                      </div>
                      <div class="domain-score score-${qualifier}">
                        ${qualifierLabels[qualifier]}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `;
            }).join('')}
          </div>

          <div class="section">
            <h2>ICF Qualifier Scale Reference</h2>
            <table>
              <thead>
                <tr>
                  <th>Qualifier</th>
                  <th>Impairment Level</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>0</td><td>0-4%</td><td>No problem (absent, negligible)</td></tr>
                <tr><td>1</td><td>5-24%</td><td>Mild problem (slight, low)</td></tr>
                <tr><td>2</td><td>25-49%</td><td>Moderate problem (medium, fair)</td></tr>
                <tr><td>3</td><td>50-95%</td><td>Severe problem (high, extreme)</td></tr>
                <tr><td>4</td><td>96-100%</td><td>Complete problem (total)</td></tr>
              </tbody>
            </table>
          </div>

          <div class="disclaimer">
            <strong>Medical Documentation Notice:</strong> This self-assessment report is based on the WHO International Classification of Functioning, Disability and Health framework. It may be used to supplement medical documentation for disability claims, workplace accommodation requests, or healthcare discussions. This is a self-reported assessment and should be reviewed by qualified healthcare professionals.
          </div>

          <div class="footer">
            <p><strong>Report generated by:</strong> 3mpwr App - Disability Advocacy Platform</p>
            <p><strong>WHO ICF Framework:</strong> World Health Organization International Classification of Functioning, Disability and Health</p>
            <p><strong>Date Generated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: reportHTML });
      
      await Share.share({
        url: uri,
        title: `WHO ICF Functional Capacity Report - ${new Date(assessment.timestamp).toLocaleDateString()}`,
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert(
        'Export Not Available',
        'PDF export requires expo-print. This feature is available in development builds. For now, you can take screenshots of your results.',
        [{ text: 'OK' }]
      );
    }
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
            
            {/* Download Report Button */}
            <Pressable 
              onPress={downloadReport} 
              style={[styles.downloadButton, { backgroundColor: palette.success, marginTop: 16 }]}
            >
              <Ionicons name="document-text" size={20} color={palette.onPrimary} />
              <Text style={styles.downloadButtonText}>Download Medical Report (PDF)</Text>
            </Pressable>
            <Text style={[styles.reportHint, { color: palette.textSecondary }]}>
              Suitable for disability claims, accommodation requests, and medical files
            </Text>
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
            <Ionicons name="play-circle" size={32} color={palette.onPrimary} />
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
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
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
    color: palette.onPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  downloadButtonText: {
    color: palette.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  reportHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 32,
  },
});



