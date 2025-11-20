import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from '../../../i18n';
import { useLegalDNASequencer } from '../../../services/legalDNASequencer';

export default function LegalDNAScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const legalDNA = useLegalDNASequencer();

  const [cases, setCases] = useState(legalDNA.getAllCases());
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const analyzeCase = (caseId: string) => {
    const caseData = cases.find(c => c.id === caseId);
    if (!caseData) return;

    setSelectedCase(caseData);
  };

  const getClaimTemplates = () => {
    const templates = legalDNA.getClaimTemplates();
    alert(
      `Available Claim Templates:\n\n${templates.map(t => `• ${t.category}: ${t.title}`).join('\n')}`
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Legal DNA Sequencer'),
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Ionicons name="analytics" size={32} color={colors.primary} />
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>Case DNA Analysis</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Map your case genome, find weak points, match precedents
              </Text>
            </View>
          </View>
        </View>

        {/* Cases List */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Cases</Text>
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add Case</Text>
            </Pressable>
          </View>

          {cases.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No cases yet. Add your first case to start analysis.
            </Text>
          ) : (
            cases.map(caseItem => (
              <Pressable
                key={caseItem.id}
                style={[styles.caseCard, { borderColor: colors.border }]}
                onPress={() => analyzeCase(caseItem.id)}
              >
                <View style={styles.caseHeader}>
                  <Text style={[styles.caseName, { color: colors.text }]}>
                    {caseItem.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          caseItem.status === 'active'
                            ? '#28A745'
                            : caseItem.status === 'pending'
                            ? '#FFC107'
                            : '#6C757D',
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>{caseItem.status.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={[styles.caseDate, { color: colors.textSecondary }]}>
                  Filed: {new Date(caseItem.filingDate).toLocaleDateString()}
                </Text>

                {caseItem.genome && (
                  <View style={styles.genomePreview}>
                    <Text style={[styles.genomeLabel, { color: colors.textSecondary }]}>
                      DNA Nodes: {caseItem.genome.nodes.length}
                    </Text>
                    <Text style={[styles.genomeLabel, { color: colors.textSecondary }]}>
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
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Case Genome Map</Text>

                <View style={styles.genomeStats}>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {selectedCase.genome.nodes.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Nodes</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {selectedCase.genome.edges.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Connections
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {
                        selectedCase.genome.nodes.filter((n: any) => n.type === 'evidence')
                          .length
                      }
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Evidence
                    </Text>
                  </View>
                </View>

                <Text style={[styles.nodeTitle, { color: colors.text }]}>Key Nodes:</Text>
                {selectedCase.genome.nodes.slice(0, 5).map((node: any, index: number) => (
                  <View
                    key={index}
                    style={[styles.nodeCard, { borderColor: colors.border }]}
                  >
                    <View
                      style={[
                        styles.nodeType,
                        {
                          backgroundColor:
                            node.type === 'claim'
                              ? '#007BFF'
                              : node.type === 'evidence'
                              ? '#28A745'
                              : node.type === 'witness'
                              ? '#FFC107'
                              : '#6C757D',
                        },
                      ]}
                    >
                      <Text style={styles.nodeTypeText}>{node.type.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.nodeLabel, { color: colors.text }]}>{node.label}</Text>
                    <Text style={[styles.nodeWeight, { color: colors.textSecondary }]}>
                      Weight: {node.weight.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Weak Points */}
            {selectedCase.weakPoints && selectedCase.weakPoints.length > 0 && (
              <View style={[styles.card, { backgroundColor: '#FFF3CD' }]}>
                <View style={styles.weakHeader}>
                  <Ionicons name="warning" size={24} color="#856404" />
                  <Text style={[styles.weakTitle, { color: '#856404' }]}>
                    Vulnerability Assessment
                  </Text>
                </View>

                {selectedCase.weakPoints.map((weak: any, index: number) => (
                  <View key={index} style={[styles.weakCard, { borderColor: '#FFC107' }]}>
                    <Text style={[styles.weakNode, { color: '#721C24' }]}>
                      {weak.nodeId}
                    </Text>
                    <Text style={[styles.weakReason, { color: '#856404' }]}>
                      {weak.reason}
                    </Text>
                    <Text style={[styles.weakSeverity, { color: '#721C24' }]}>
                      Severity: {weak.severity}/5
                    </Text>
                    <Text style={[styles.weakSuggestion, { color: '#856404' }]}>
                      💡 {weak.suggestion}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Precedents */}
            {selectedCase.precedents && selectedCase.precedents.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Matching Precedents
                </Text>

                {selectedCase.precedents.slice(0, 3).map((precedent: any, index: number) => (
                  <View
                    key={index}
                    style={[styles.precedentCard, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.precedentCitation, { color: colors.text }]}>
                      {precedent.citation}
                    </Text>
                    <Text style={[styles.precedentSimilarity, { color: colors.textSecondary }]}>
                      Similarity: {(precedent.similarity * 100).toFixed(0)}%
                    </Text>
                    <Text style={[styles.precedentOutcome, { color: colors.textSecondary }]}>
                      Outcome: {precedent.outcome}
                    </Text>
                    {precedent.keyFactors && precedent.keyFactors.length > 0 && (
                      <View style={styles.factorsSection}>
                        <Text style={[styles.factorsLabel, { color: colors.textSecondary }]}>
                          Key Factors:
                        </Text>
                        {precedent.keyFactors.map((factor: string, i: number) => (
                          <Text key={i} style={[styles.factorText, { color: colors.text }]}>
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
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Analysis Tools</Text>

          <Pressable
            style={[styles.toolButton, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
            onPress={getClaimTemplates}
          >
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <View style={styles.toolInfo}>
              <Text style={[styles.toolTitle, { color: colors.text }]}>Claim Templates</Text>
              <Text style={[styles.toolDescription, { color: colors.textSecondary }]}>
                Pre-built templates for common disability claims
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
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
    color: '#FFF',
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
    color: '#FFF',
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
    color: '#FFF',
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
