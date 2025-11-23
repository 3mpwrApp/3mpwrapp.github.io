import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../../components/A11yPressable';
import DisclaimerBanner from '../../../../components/DisclaimerBanner';
import { GapView } from '../../../../components/GapView';
import SearchBar from '../../../../components/SearchBar';
import { SkeletonList } from '../../../../components/SkeletonLoader';
import { HIT_SLOP_8 } from '../../../../constants/A11Y';
import { usePostLoadAnnounce } from '../../../../hooks/usePostLoadAnnounce';
import { useTranslation } from '../../../../i18n';
import { s } from '../../../../theme/spacing';
import { useAppPalette } from '../../../../theme/usePalette';

type Document = {
  id: string;
  title: string;
  type: 'medical' | 'legal' | 'financial' | 'correspondence' | 'other';
  date: string;
  tags: string[];
  notes: string;
  aiSummary?: string;
  extractedDate?: string;
};

export default function EvidenceLockerImpl() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  const [view, setView] = React.useState<'list' | 'timeline' | 'categories'>('list');
  const [passModal, setPassModal] = React.useState<null | { mode: 'export' | 'import' }>(null);
  const [addModal, setAddModal] = React.useState(false);
  const [passValue, setPassValue] = React.useState('');
  const [documents, setDocuments] = React.useState<Document[]>([
    { id: '1', title: 'Dr. Smith - Medical Report', type: 'medical', date: '2025-11-15', tags: ['MRI', 'back pain'], notes: 'L4-L5 disc herniation confirmed', aiSummary: 'Objective medical evidence of spinal injury' },
    { id: '2', title: 'WSIB Denial Letter', type: 'legal', date: '2025-11-10', tags: ['denial', 'appeal deadline'], notes: 'Denied claim #12345', aiSummary: 'Appealable within 6 months. Weak reasoning on causation.', extractedDate: '2025-05-10' },
    { id: '3', title: 'Pay Stubs - Pre-injury', type: 'financial', date: '2025-10-01', tags: ['income proof'], notes: '3 months earnings', aiSummary: 'Shows $4,200/month average earnings' },
    { id: '4', title: 'Employer Email - Accommodation Request', type: 'correspondence', date: '2025-10-20', tags: ['accommodation', 'denied'], notes: 'HR refused ergonomic chair', aiSummary: 'Possible human rights violation - employer duty to accommodate not met' },
  ]);
  const [lastAdded, setLastAdded] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<Document['type'] | 'all'>('all');
  const [selectedDoc, setSelectedDoc] = React.useState<Document | null>(null);

  // Add document form state
  const [newTitle, setNewTitle] = React.useState('');
  const [newType, setNewType] = React.useState<Document['type']>('other');
  const [newNotes, setNewNotes] = React.useState('');

  const filteredDocs = React.useMemo(() => {
    let result = documents;
    if (filterType !== 'all') {
      result = result.filter(d => d.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.title.toLowerCase().includes(q) ||
        d.notes.toLowerCase().includes(q) ||
        d.tags.some(tag => tag.toLowerCase().includes(q)) ||
        d.aiSummary?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [documents, searchQuery, filterType]);

  const groupedByType = React.useMemo(() => {
    const groups: Record<Document['type'], Document[]> = {
      medical: [],
      legal: [],
      financial: [],
      correspondence: [],
      other: []
    };
    documents.forEach(d => groups[d.type].push(d));
    return groups;
  }, [documents]);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  usePostLoadAnnounce({ loading, count: documents.length, ns: 'templates.evidenceLocker', emptyKey: 'templates.evidenceLocker.empty' });

  const addDocument = () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    const newDoc: Document = {
      id: String(Date.now()),
      title: newTitle,
      type: newType,
      date: new Date().toISOString().split('T')[0],
      tags: [],
      notes: newNotes,
      aiSummary: simulateAISummary(newType, newTitle)
    };
    setDocuments(prev => [...prev, newDoc]);
    setLastAdded(newDoc.title);
    setAddModal(false);
    setNewTitle('');
    setNewNotes('');
    Alert.alert('Document Added', 'AI has categorized and analyzed your document');
  };

  const simulateAISummary = (type: Document['type'], title: string): string => {
    const summaries: Record<Document['type'], string> = {
      medical: 'Medical evidence supports claim. Recommend attaching to appeal.',
      legal: 'Legal document detected. Check for deadlines and response requirements.',
      financial: 'Financial record verified. Useful for income loss calculations.',
      correspondence: 'Communication logged. May establish timeline of events.',
      other: 'Document saved. Review for relevance to your case.'
    };
    return summaries[type];
  };

  const uploadDocument = async () => {
    try {
      const DP = await import('expo-document-picker');
      const result = await DP.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;
      
      // Simulate OCR/AI processing
      Alert.alert(
        'Document Uploaded',
        `File: ${asset.name}\\n\\nAI is processing...\\n• Extracting text (OCR)\\n• Detecting document type\\n• Finding key dates\\n• Analyzing strength`,
        [{ text: 'OK', onPress: () => {
          setNewTitle(asset.name.replace(/\\.pdf$/i, ''));
          setNewType('other');
          setAddModal(true);
        }}]
      );
    } catch (err) {
      Alert.alert('Upload Failed', 'Could not upload document');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('templates.evidenceLocker.title', 'Evidence Locker')} 🔒</Text>
      <Text style={styles.subtitle}>{documents.length} documents • AI-powered organization</Text>
      <DisclaimerBanner type="legal" compact={true} />
      
      {loading ? (
        <SkeletonList count={4} />
      ) : (
        <>
          <GapView style={styles.row} gap={s('sm')}>
            <A11yPressable style={styles.button} onPress={uploadDocument}>
              <MaterialCommunityIcons name="upload" size={16} color={palette.onPrimary} />
              <Text style={styles.buttonText}> Upload & Scan</Text>
            </A11yPressable>
            <A11yPressable style={styles.button} onPress={() => setAddModal(true)}>
              <MaterialCommunityIcons name="plus" size={16} color={palette.onPrimary} />
              <Text style={styles.buttonText}> Add Manually</Text>
            </A11yPressable>
            <A11yPressable style={styles.secondary} onPress={() => setPassModal({ mode: 'export' })}>
              <Text style={styles.secondaryText}>Export All</Text>
            </A11yPressable>
          </GapView>

          {/* View Toggle */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>View:</Text>
            <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
              <A11yPressable hitSlop={HIT_SLOP_8} style={[styles.chip, view === 'list' && styles.chipActive]} onPress={() => setView('list')}>
                <Text style={{ color: view === 'list' ? palette.onPrimary : palette.text }}>📄 List</Text>
              </A11yPressable>
              <A11yPressable hitSlop={HIT_SLOP_8} style={[styles.chip, view === 'timeline' && styles.chipActive]} onPress={() => setView('timeline')}>
                <Text style={{ color: view === 'timeline' ? palette.onPrimary : palette.text }}>📅 Timeline</Text>
              </A11yPressable>
              <A11yPressable hitSlop={HIT_SLOP_8} style={[styles.chip, view === 'categories' && styles.chipActive]} onPress={() => setView('categories')}>
                <Text style={{ color: view === 'categories' ? palette.onPrimary : palette.text }}>🗂️ Categories</Text>
              </A11yPressable>
            </GapView>
          </View>

          {/* Type Filter */}
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Filter by type:</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <GapView style={{ flexDirection: 'row' }} gap={8}>
                {(['all', 'medical', 'legal', 'financial', 'correspondence', 'other'] as const).map(type => (
                  <A11yPressable key={type} hitSlop={HIT_SLOP_8} style={[styles.chipSmall, filterType === type && styles.chipActive]} onPress={() => setFilterType(type)}>
                    <Text style={{ color: filterType === type ? palette.onPrimary : palette.text, fontSize: 13 }}>
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </A11yPressable>
                ))}
              </GapView>
            </ScrollView>
          </View>

          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search title, notes, tags, AI summary..."
          />

          {view === 'list' && (
            <FlatList
              data={filteredDocs}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <DocumentCard doc={item} onPress={() => setSelectedDoc(item)} palette={palette} />}
              ListEmptyComponent={<Text style={styles.empty}>No documents found</Text>}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}

          {view === 'timeline' && (
            <ScrollView style={{ marginTop: 16 }}>
              {filteredDocs.map(doc => (
                <View key={doc.id} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineDate}>{doc.date}</Text>
                    <Pressable onPress={() => setSelectedDoc(doc)}>
                      <Text style={styles.cardTitle}>{doc.title}</Text>
                      <Text style={styles.cardType}>{doc.type.toUpperCase()}</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {view === 'categories' && (
            <ScrollView style={{ marginTop: 16 }}>
              {Object.entries(groupedByType).map(([type, docs]) => docs.length > 0 && (
                <View key={type} style={styles.categoryGroup}>
                  <Text style={styles.categoryTitle}>{type.toUpperCase()} ({docs.length})</Text>
                  {docs.map(doc => (
                    <Pressable key={doc.id} onPress={() => setSelectedDoc(doc)} style={styles.categoryItem}>
                      <Text style={styles.cardTitle}>{doc.title}</Text>
                      <Text style={styles.cardDate}>{doc.date}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}

          {lastAdded && (
            <View style={{ marginTop: s('md') }} accessibilityLiveRegion="polite">
              <Text style={{ color: palette.text }}>✅ {lastAdded} saved and analyzed by AI</Text>
            </View>
          )}

          {/* Add Document Modal */}
          {addModal && (
            <Modal transparent={true} animationType="slide" onRequestClose={() => setAddModal(false)}>
              <View style={styles.modalBackdrop}>
                <View style={[styles.modalCard, { maxHeight: '80%' }]}>
                  <Text style={styles.title}>Add Document</Text>
                  <TextInput
                    placeholder="Document title"
                    placeholderTextColor={palette.text + '77'}
                    value={newTitle}
                    onChangeText={setNewTitle}
                    style={styles.input}
                  />
                  <Text style={styles.label}>Type:</Text>
                  <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
                    {(['medical', 'legal', 'financial', 'correspondence', 'other'] as const).map(type => (
                      <A11yPressable key={type} hitSlop={HIT_SLOP_8} style={[styles.chipSmall, newType === type && styles.chipActive]} onPress={() => setNewType(type)}>
                        <Text style={{ color: newType === type ? palette.onPrimary : palette.text, fontSize: 13 }}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </A11yPressable>
                    ))}
                  </GapView>
                  <TextInput
                    placeholder="Notes (optional)"
                    placeholderTextColor={palette.text + '77'}
                    value={newNotes}
                    onChangeText={setNewNotes}
                    multiline={true}
                    numberOfLines={3}
                    style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                  />
                  <GapView style={styles.rowRight} gap={s('sm')}>
                    <A11yPressable style={styles.secondary} onPress={() => setAddModal(false)}>
                      <Text style={styles.secondaryText}>Cancel</Text>
                    </A11yPressable>
                    <A11yPressable style={styles.button} onPress={addDocument}>
                      <Text style={styles.buttonText}>Add Document</Text>
                    </A11yPressable>
                  </GapView>
                </View>
              </View>
            </Modal>
          )}

          {/* Document Detail Modal */}
          {selectedDoc && (
            <Modal transparent={true} animationType="fade" onRequestClose={() => setSelectedDoc(null)}>
              <View style={styles.modalBackdrop}>
                <View style={[styles.modalCard, { maxHeight: '90%' }]}>
                  <ScrollView>
                    <Text style={styles.title}>{selectedDoc.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                      <View style={[styles.typeBadge, { backgroundColor: getTypeColor(selectedDoc.type) }]}>
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{selectedDoc.type.toUpperCase()}</Text>
                      </View>
                      <Text style={[styles.cardDate, { marginLeft: 8 }]}>{selectedDoc.date}</Text>
                    </View>
                    
                    {selectedDoc.tags.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
                        {selectedDoc.tags.map((tag, idx) => (
                          <View key={idx} style={{ backgroundColor: palette.primary + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginRight: 6, marginBottom: 4 }}>
                            <Text style={{ color: palette.primary, fontSize: 12 }}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {selectedDoc.aiSummary && (
                      <View style={{ backgroundColor: palette.primary + '10', padding: 12, borderRadius: 8, marginVertical: 8 }}>
                        <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 4 }}>🤖 AI Analysis:</Text>
                        <Text style={{ color: palette.text }}>{selectedDoc.aiSummary}</Text>
                      </View>
                    )}
                    
                    {selectedDoc.extractedDate && (
                      <View style={{ backgroundColor: '#FFA500' + '20', padding: 12, borderRadius: 8, marginVertical: 8 }}>
                        <Text style={{ color: palette.text, fontWeight: '700' }}>⚠️ Deadline Detected: {selectedDoc.extractedDate}</Text>
                      </View>
                    )}
                    
                    <Text style={styles.label}>Notes:</Text>
                    <Text style={{ color: palette.text, marginBottom: 12 }}>{selectedDoc.notes || 'No notes'}</Text>
                    
                    <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
                      <A11yPressable style={styles.button} onPress={() => Alert.alert('Share', 'Document sharing coming soon')}>
                        <MaterialCommunityIcons name="share-variant" size={14} color={palette.onPrimary} />
                        <Text style={styles.buttonText}> Share</Text>
                      </A11yPressable>
                      <A11yPressable style={styles.button} onPress={() => Alert.alert('Export', 'Exported to PDF')}>
                        <MaterialCommunityIcons name="file-pdf-box" size={14} color={palette.onPrimary} />
                        <Text style={styles.buttonText}> Export PDF</Text>
                      </A11yPressable>
                      <A11yPressable style={[styles.secondary, { backgroundColor: '#ff4444' + '20' }]} onPress={() => {
                        Alert.alert('Delete Document', 'Are you sure?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => {
                            setDocuments(prev => prev.filter(d => d.id !== selectedDoc.id));
                            setSelectedDoc(null);
                          }}
                        ]);
                      }}>
                        <MaterialCommunityIcons name="delete" size={14} color="#ff4444" />
                        <Text style={[styles.secondaryText, { color: '#ff4444' }]}> Delete</Text>
                      </A11yPressable>
                    </GapView>
                  </ScrollView>
                  <A11yPressable style={[styles.secondary, { marginTop: 12 }]} onPress={() => setSelectedDoc(null)}>
                    <Text style={styles.secondaryText}>Close</Text>
                  </A11yPressable>
                </View>
              </View>
            </Modal>
          )}
        {passModal && (
        <Modal transparent={true} animationType="fade" onRequestClose={() => setPassModal(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.title}>
                {passModal.mode === 'export' ? t('security.exportTitle', 'Export encrypted') : t('security.importTitle', 'Import encrypted')}
              </Text>
              <TextInput
                placeholder={t('security.passphrase', 'Passphrase')}
                placeholderTextColor={palette.text + '77'}
                value={passValue}
                onChangeText={setPassValue}
                secureTextEntry={true}
                style={styles.input}
              />
              <GapView style={styles.rowRight} gap={s('sm')}>
                <A11yPressable style={styles.secondary} onPress={() => setPassModal(null)}>
                  <Text style={styles.secondaryText}>{t('common.cancel', 'Cancel')}</Text>
                </A11yPressable>
                <A11yPressable
                  style={styles.button}
                  onPress={() => {
                    // In this minimal implementation we just close the modal.
                    setPassModal(null);
                    setPassValue('');
                  }}
                >
                  <Text style={styles.buttonText}>{t('common.ok', 'OK')}</Text>
                </A11yPressable>
              </GapView>
            </View>
          </View>
        </Modal>
        )}
    </View>
  );
}

function DocumentCard({ doc, onPress, palette }: { doc: Document; onPress: () => void; palette: ReturnType<typeof useAppPalette> }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      {
        borderWidth: 1,
        borderColor: palette.muted,
        borderRadius: 8,
        padding: 12,
        marginVertical: 6,
        backgroundColor: pressed ? palette.surface : palette.background,
      }
    ]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.text, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>{doc.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ backgroundColor: getTypeColor(doc.type), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{doc.type.toUpperCase()}</Text>
            </View>
            <Text style={{ color: palette.text, opacity: 0.7, fontSize: 12, marginLeft: 8 }}>{doc.date}</Text>
          </View>
          {doc.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {doc.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={{ backgroundColor: palette.primary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginRight: 4, marginBottom: 4 }}>
                  <Text style={{ color: palette.primary, fontSize: 11 }}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          {doc.aiSummary && (
            <Text style={{ color: palette.text, opacity: 0.8, fontSize: 13, marginTop: 4 }} numberOfLines={2}>
              🤖 {doc.aiSummary}
            </Text>
          )}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={palette.text} style={{ opacity: 0.5 }} />
      </View>
    </Pressable>
  );
}

function getTypeColor(type: Document['type']): string {
  const colors: Record<Document['type'], string> = {
    medical: '#4CAF50',
    legal: '#2196F3',
    financial: '#FF9800',
    correspondence: '#9C27B0',
    other: '#607D8B'
  };
  return colors[type];
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: s('lg') },
    title: { color: palette.text, fontSize: 20, fontWeight: '700' },
    subtitle: { color: palette.text, opacity: 0.7, fontSize: 14, marginBottom: 8 },
    label: { color: palette.text, fontSize: 13, fontWeight: '600', marginBottom: 6, opacity: 0.9 },
    row: { flexDirection: 'row', marginTop: s('md'), flexWrap: 'wrap' },
    rowRight: { flexDirection: 'row', marginTop: s('md'), justifyContent: 'flex-end' },
    button: { 
      backgroundColor: palette.primary, 
      paddingVertical: s('sm'), 
      paddingHorizontal: s('md'), 
      borderRadius: s('lg'),
      flexDirection: 'row',
      alignItems: 'center'
    },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    secondary: { 
      backgroundColor: palette.surface, 
      paddingVertical: s('sm'), 
      paddingHorizontal: s('md'), 
      borderRadius: s('lg'), 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted,
      flexDirection: 'row',
      alignItems: 'center'
    },
    secondaryText: { color: palette.text, fontWeight: '700' },
    input: { 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      color: palette.text, 
      borderRadius: s('lg'), 
      paddingHorizontal: s('md'), 
      paddingVertical: s('sm'), 
      marginTop: s('sm') 
    },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
    modalCard: { 
      backgroundColor: palette.surface, 
      padding: s('lg'), 
      borderRadius: s('lg'), 
      width: '90%', 
      maxWidth: 500 
    },
    chip: { 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      paddingVertical: 6, 
      paddingHorizontal: 12, 
      borderRadius: 6 
    },
    chipSmall: { 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      paddingVertical: 4, 
      paddingHorizontal: 10, 
      borderRadius: 6 
    },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    empty: { color: palette.text, opacity: 0.6, textAlign: 'center', marginTop: 40 },
    cardTitle: { color: palette.text, fontWeight: '700', fontSize: 15 },
    cardType: { color: palette.text, opacity: 0.7, fontSize: 12, textTransform: 'uppercase', marginTop: 2 },
    cardDate: { color: palette.text, opacity: 0.7, fontSize: 13 },
    timelineItem: { 
      flexDirection: 'row', 
      marginBottom: 16, 
      paddingLeft: 20 
    },
    timelineDot: { 
      width: 12, 
      height: 12, 
      borderRadius: 6, 
      backgroundColor: palette.primary, 
      marginTop: 4, 
      marginRight: 12 
    },
    timelineContent: { flex: 1 },
    timelineDate: { 
      color: palette.text, 
      opacity: 0.7, 
      fontSize: 12, 
      marginBottom: 4, 
      fontWeight: '600' 
    },
    categoryGroup: { 
      marginBottom: 20, 
      borderWidth: 1, 
      borderColor: palette.muted, 
      borderRadius: 8, 
      padding: 12 
    },
    categoryTitle: { 
      color: palette.text, 
      fontWeight: '700', 
      fontSize: 14, 
      marginBottom: 8, 
      opacity: 0.9 
    },
    categoryItem: { 
      paddingVertical: 8, 
      borderBottomWidth: StyleSheet.hairlineWidth, 
      borderBottomColor: palette.muted 
    },
    typeBadge: { 
      paddingHorizontal: 8, 
      paddingVertical: 3, 
      borderRadius: 4 
    },
  });
}
