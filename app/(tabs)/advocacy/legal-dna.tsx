import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useLegalDNASequencer } from '../../../services/legalDNASequencer';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

export default function LegalDNAScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const legalDNA = useLegalDNASequencer();

  const [cases, _setCases] = useState(legalDNA.cases);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [_showAddModal, _setShowAddModal] = useState(false);

  const analyzeCase = (caseId: string) => {
    const caseData = cases.find((c: any) => c.id === caseId);
    if (!caseData) return;

    setSelectedCase(caseData);
  };

  const getClaimTemplates = () => {
    const templates = legalDNA.getClaimTemplates();
    if (Array.isArray(templates)) {
      alert(
        `Available Claim Templates:\n\n${templates.map((t: any) => `• ${t.category}: ${t.title}`).join('\n')}`
      );
    } else {
      alert('Claim templates coming soon!');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Legal DNA Sequencer'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Header */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.header}>
            <Ionicons name="analytics" size={32} color={palette.primary} />
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: palette.text }]}>Case DNA Analysis</Text>
              <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                Map your case genome, find weak points, match precedents
              </Text>
            </View>
          </View>
        </View>

        {/* Cases List */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Your Cases</Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.addButton, { backgroundColor: palette.primary }]}
              onPress={() => _setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color={palette.onPrimary} />
              <Text style={[styles.addButtonText, { color: palette.onPrimary }]}>Add Case</Text>
            </Pressable>
          </View>

          {cases.length === 0 ? (
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No cases yet. Add your first case to start analysis.
            </Text>
          ) : (
            cases.map((caseItem: any) => (
              <Pressable
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                key={caseItem.id}
                style={[styles.caseCard, { borderColor: palette.border }]}
                onPress={() => analyzeCase(caseItem.id)}
              >
                <View style={styles.caseHeader}>
                  <Text style={[styles.caseName, { color: palette.text }]}>
                    {caseItem.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          caseItem.status === 'active'
                            ? palette.success
                            : caseItem.status === 'pending'
                            ? palette.warning
                            : palette.textSecondary,
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: palette.onPrimary }]}>{caseItem.status.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={[styles.caseDate, { color: palette.textSecondary }]}>
                  Filed: {new Date(caseItem.filingDate).toLocaleDateString()}
                </Text>

                {caseItem.genome && (
                  <View style={styles.genomePreview}>
                    <Text style={[styles.genomeLabel, { color: palette.textSecondary }]}>
                      DNA Nodes: {caseItem.genome.nodes.length}
                    </Text>
                    <Text style={[styles.genomeLabel, { color: palette.textSecondary }]}>
                      Connections: {caseItem.genome.edges.length}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))
          )}
        </View>

        {/* Selected Case Analysis */}
        {selectedCase && (
          <>
            {/* Case Genome */}
            {selectedCase.genome && (
              <View style={[styles.card, { backgroundColor: palette.surface }]}>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>Case Genome Map</Text>

                <View style={styles.genomeStats}>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: palette.primary }]}>
                      {selectedCase.genome.nodes.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Nodes</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: palette.primary }]}>
                      {selectedCase.genome.edges.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: palette.textSecondary }]}>
                      Connections
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: palette.primary }]}>
                      {
                        selectedCase.genome.nodes.filter((n: any) => n.type === 'evidence')
                          .length
                      }
                    </Text>
                    <Text style={[styles.statLabel, { color: palette.textSecondary }]}>
                      Evidence
                    </Text>
                  </View>
                </View>

                <Text style={[styles.nodeTitle, { color: palette.text }]}>Key Nodes:</Text>
                {selectedCase.genome.nodes.slice(0, 5).map((node: any, index: number) => (
                  <View
                    key={index}
                    style={[styles.nodeCard, { borderColor: palette.border }]}
                  >
                    <View
                      style={[
                        styles.nodeType,
                        {
                          backgroundColor:
                            node.type === 'claim'
                              ? palette.primary
                              : node.type === 'evidence'
                              ? palette.success
                              : node.type === 'witness'
                              ? palette.warning
                              : palette.textSecondary,
                        },
                      ]}
                    >
                      <Text style={[styles.nodeTypeText, { color: palette.onPrimary }]}>{node.type.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.nodeLabel, { color: palette.text }]}>{node.label}</Text>
                    <Text style={[styles.nodeWeight, { color: palette.textSecondary }]}>
                      Weight: {node.weight.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Weak Points */}
            {selectedCase.weakPoints && selectedCase.weakPoints.length > 0 && (
              <View style={[styles.card, { backgroundColor: palette.warningBackground || palette.surface }]}>
                <View style={styles.weakHeader}>
                  <Ionicons name="warning" size={24} color={palette.warning} />
                  <Text style={[styles.weakTitle, { color: palette.text }]}>
                    Vulnerability Assessment
                  </Text>
                </View>

                {selectedCase.weakPoints.map((weak: any, index: number) => (
                  <View key={index} style={[styles.weakCard, { borderColor: palette.warning }]}>
                    <Text style={[styles.weakNode, { color: palette.error }]}>
                      {weak.nodeId}
                    </Text>
                    <Text style={[styles.weakReason, { color: palette.text }]}>
                      {weak.reason}
                    </Text>
                    <Text style={[styles.weakSeverity, { color: palette.error }]}>
                      Severity: {weak.severity}/5
                    </Text>
                    <Text style={[styles.weakSuggestion, { color: palette.text }]}>
                      💡 {weak.suggestion}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Precedents */}
            {selectedCase.precedents && selectedCase.precedents.length > 0 && (
              <View style={[styles.card, { backgroundColor: palette.surface }]}>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>
                  Matching Precedents
                </Text>

                {selectedCase.precedents.slice(0, 3).map((precedent: any, index: number) => (
                  <View
                    key={index}
                    style={[styles.precedentCard, { borderColor: palette.border }]}
                  >
                    <Text style={[styles.precedentCitation, { color: palette.text }]}>
                      {precedent.citation}
                    </Text>
                    <Text style={[styles.precedentSimilarity, { color: palette.textSecondary }]}>
                      Similarity: {(precedent.similarity * 100).toFixed(0)}%
                    </Text>
                    <Text style={[styles.precedentOutcome, { color: palette.textSecondary }]}>
                      Outcome: {precedent.outcome}
                    </Text>
                    {precedent.keyFactors && precedent.keyFactors.length > 0 && (
                      <View style={styles.factorsSection}>
                        <Text style={[styles.factorsLabel, { color: palette.textSecondary }]}>
                          Key Factors:
                        </Text>
                        {precedent.keyFactors.map((factor: string, i: number) => (
                          <Text key={i} style={[styles.factorText, { color: palette.text }]}>
                            • {factor}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Tools */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Analysis Tools</Text>

          <Pressable
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.toolButton, { backgroundColor: palette.primaryBackground || palette.surface, borderColor: palette.primary }]}
            onPress={getClaimTemplates}
          >
            <Ionicons name="document-text" size={24} color={palette.primary} />
            <View style={styles.toolInfo}>
              <Text style={[styles.toolTitle, { color: palette.text }]}>Claim Templates</Text>
              <Text style={[styles.toolDescription, { color: palette.textSecondary }]}>
                Pre-built templates for common disability claims
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  caseCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  caseDate: {
    fontSize: 13,
    marginBottom: 8,
  },
  genomePreview: {
    flexDirection: 'row',
    gap: 16,
  },
  genomeLabel: {
    fontSize: 12,
  },
  genomeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  nodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  nodeCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  nodeType: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  nodeTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  nodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  nodeWeight: {
    fontSize: 12,
  },
  weakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  weakCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  weakNode: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  weakReason: {
    fontSize: 14,
    marginBottom: 4,
  },
  weakSeverity: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  weakSuggestion: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  precedentCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  precedentCitation: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  precedentSimilarity: {
    fontSize: 13,
    marginBottom: 2,
  },
  precedentOutcome: {
    fontSize: 13,
    marginBottom: 8,
  },
  factorsSection: {
    marginTop: 8,
  },
  factorsLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  factorText: {
    fontSize: 13,
    marginLeft: 8,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  toolInfo: {
    flex: 1,
    marginLeft: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  toolDescription: {
    fontSize: 13,
  },
  bottomSpacer: {
    height: 32,
  },
});


