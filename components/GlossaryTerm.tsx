/**
 * GlossaryTerm Component
 * 
 * Interactive component that displays legal/medical terms with tap-to-define
 * tooltips. Makes complex jargon accessible with plain-language definitions.
 * 
 * Usage:
 * <GlossaryTerm term="FAF">FAF</GlossaryTerm>
 * <GlossaryTerm term="WSIB" showFullForm>WSIB benefits</GlossaryTerm>
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
    AccessibilityInfo,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { HIT_SLOP_12 } from '../constants/A11Y';
import { getRelatedTerms, getTerm, type GlossaryTerm as GlossaryTermType } from '../data/legalGlossary';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

interface GlossaryTermProps {
  /** The glossary term key to look up */
  term: string;
  /** Display text - if not provided, uses the term */
  children?: React.ReactNode;
  /** Whether to show the full form inline (e.g., "FAF (Functional Abilities Form)") */
  showFullForm?: boolean;
  /** Use simplified definition */
  useSimpleDefinition?: boolean;
  /** Style for the term text */
  textStyle?: object;
  /** Callback when term is tapped */
  onPress?: () => void;
}

export default function GlossaryTerm({
  term,
  children,
  showFullForm = false,
  useSimpleDefinition: _useSimpleDefinition = false,
  textStyle,
  onPress,
}: GlossaryTermProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const [modalVisible, setModalVisible] = useState(false);
  
  const glossaryTerm = getTerm(term);
  const relatedTerms = glossaryTerm ? getRelatedTerms(term) : [];
  
  const handlePress = useCallback(() => {
    onPress?.();
    setModalVisible(true);
    
    if (glossaryTerm) {
      const announcement = glossaryTerm.fullForm 
        ? `${glossaryTerm.term} means ${glossaryTerm.fullForm}. ${glossaryTerm.simpleDefinition}`
        : `${glossaryTerm.term}: ${glossaryTerm.simpleDefinition}`;
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  }, [glossaryTerm, onPress]);
  
  const closeModal = () => setModalVisible(false);
  
  // If term not found, just render children without interaction
  if (!glossaryTerm) {
    return <Text style={textStyle}>{children || term}</Text>;
  }
  
  // Inline display with optional full form
  const inlineText = showFullForm && glossaryTerm.fullForm
    ? `${children || glossaryTerm.term} (${glossaryTerm.fullForm})`
    : children || glossaryTerm.term;
  
  return (
    <>
      <A11yPressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${glossaryTerm.term}${glossaryTerm.fullForm ? `, which stands for ${glossaryTerm.fullForm}` : ''}. Tap to learn more.`}
        accessibilityHint="Opens definition popup"
        hitSlop={HIT_SLOP_12}
        style={styles.termContainer}
      >
        <Text 
          style={[
            styles.termText, 
            { color: palette.primary, borderBottomColor: palette.primary },
            textStyle,
          ]}
        >
          {inlineText}
        </Text>
        <Ionicons 
          name="help-circle-outline" 
          size={14} 
          color={palette.primary}
          style={styles.helpIcon}
        />
      </A11yPressable>
      
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
        accessibilityViewIsModal
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.card }]}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.termHeader}>
                  <Text 
                    style={[styles.modalTerm, { color: palette.text }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                    accessibilityRole="header"
                  >
                    {glossaryTerm.term}
                  </Text>
                  {glossaryTerm.fullForm && (
                    <Text 
                      style={[styles.fullForm, { color: palette.textSecondary }]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                    >
                      {glossaryTerm.fullForm}
                    </Text>
                  )}
                </View>
                <A11yPressable
                  onPress={closeModal}
                  style={[styles.closeButton, { backgroundColor: palette.surface }]}
                  accessibilityLabel={t('common.close', 'Close')}
                  hitSlop={HIT_SLOP_12}
                >
                  <Ionicons name="close" size={24} color={palette.text} />
                </A11yPressable>
              </View>
              
              {/* Category badge */}
              <View style={[styles.categoryBadge, { backgroundColor: palette[getCategoryColorKey(glossaryTerm.category)] + '20' }]}>
                <Ionicons 
                  name={getCategoryIcon(glossaryTerm.category)} 
                  size={16} 
                  color={palette[getCategoryColorKey(glossaryTerm.category)]} 
                />
                <Text 
                  style={[styles.categoryText, { color: palette[getCategoryColorKey(glossaryTerm.category)] }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {formatCategory(glossaryTerm.category)}
                </Text>
              </View>
              
              {/* Simple definition */}
              <View style={[styles.simpleBox, { backgroundColor: palette.primary + '10', borderColor: palette.primary }]}>
                <Text 
                  style={[styles.simpleLabel, { color: palette.primary }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {t('glossary.inSimpleTerms', '📝 In Simple Terms')}
                </Text>
                <Text 
                  style={[styles.simpleDefinition, { color: palette.text }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {glossaryTerm.simpleDefinition}
                </Text>
              </View>
              
              {/* Full definition */}
              <Text 
                style={[styles.sectionLabel, { color: palette.textSecondary }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t('glossary.fullExplanation', 'Full Explanation')}
              </Text>
              <Text 
                style={[styles.definition, { color: palette.text }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {glossaryTerm.definition}
              </Text>
              
              {/* Example */}
              {glossaryTerm.example && (
                <>
                  <Text 
                    style={[styles.sectionLabel, { color: palette.textSecondary }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {t('glossary.example', '💡 Example')}
                  </Text>
                  <View style={[styles.exampleBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                    <Text 
                      style={[styles.exampleText, { color: palette.text }]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                    >
                      "{glossaryTerm.example}"
                    </Text>
                  </View>
                </>
              )}
              
              {/* Jurisdiction notes */}
              {glossaryTerm.jurisdictionNotes && Object.keys(glossaryTerm.jurisdictionNotes).length > 0 && (
                <>
                  <Text 
                    style={[styles.sectionLabel, { color: palette.textSecondary }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {t('glossary.jurisdictionNotes', '🗺️ Regional Differences')}
                  </Text>
                  {Object.entries(glossaryTerm.jurisdictionNotes).map(([region, note]) => (
                    <View 
                      key={region} 
                      style={[styles.jurisdictionRow, { borderBottomColor: palette.border }]}
                    >
                      <Text 
                        style={[styles.jurisdictionRegion, { color: palette.primary }]}
                        maxFontSizeMultiplier={MAX_FONT_SCALE}
                      >
                        {region}:
                      </Text>
                      <Text 
                        style={[styles.jurisdictionNote, { color: palette.text }]}
                        maxFontSizeMultiplier={MAX_FONT_SCALE}
                      >
                        {note}
                      </Text>
                    </View>
                  ))}
                </>
              )}
              
              {/* Related terms */}
              {relatedTerms.length > 0 && (
                <>
                  <Text 
                    style={[styles.sectionLabel, { color: palette.textSecondary }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {t('glossary.relatedTerms', '🔗 Related Terms')}
                  </Text>
                  <View style={styles.relatedTermsContainer}>
                    {relatedTerms.slice(0, 5).map(related => (
                      <View 
                        key={related.term}
                        style={[styles.relatedChip, { backgroundColor: palette.surface, borderColor: palette.border }]}
                      >
                        <Text 
                          style={[styles.relatedChipText, { color: palette.text }]}
                          maxFontSizeMultiplier={MAX_FONT_SCALE}
                        >
                          {related.term}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
            
            {/* Close button */}
            <A11yPressable
              onPress={closeModal}
              style={[styles.doneButton, { backgroundColor: palette.primary }]}
              accessibilityLabel={t('common.done', 'Done')}
              hitSlop={HIT_SLOP_12}
            >
              <Text style={[styles.doneButtonText, { color: palette.onPrimary }]}>
                {t('common.gotIt', 'Got It')}
              </Text>
            </A11yPressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

/**
 * Inline component for auto-expanding acronyms on first use
 */
export function ExpandedAcronym({ 
  acronym, 
  textStyle 
}: { 
  acronym: string; 
  textStyle?: object;
}) {
  const term = getTerm(acronym);
  
  if (!term?.fullForm) {
    return <Text style={textStyle}>{acronym}</Text>;
  }
  
  return (
    <GlossaryTerm term={acronym} textStyle={textStyle}>
      {term.fullForm} ({acronym})
    </GlossaryTerm>
  );
}

// Helper functions - category colors use palette in component
function getCategoryColorKey(category: GlossaryTermType['category']): 'primary' | 'success' | 'warning' | 'error' | 'muted' {
  const colorKeys: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'muted'> = {
    legal: 'primary',
    medical: 'success',
    financial: 'warning',
    administrative: 'muted',
    rights: 'primary',
    workplace: 'error',
  };
  return colorKeys[category] || 'muted';
}

function getCategoryIcon(category: GlossaryTermType['category']): keyof typeof Ionicons.glyphMap {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    legal: 'document-text-outline',
    medical: 'medkit-outline',
    financial: 'cash-outline',
    administrative: 'folder-outline',
    rights: 'shield-checkmark-outline',
    workplace: 'briefcase-outline',
  };
  return icons[category] || 'information-circle-outline';
}

function formatCategory(category: GlossaryTermType['category']): string {
  const labels: Record<string, string> = {
    legal: 'Legal Term',
    medical: 'Medical Term',
    financial: 'Financial Term',
    administrative: 'Administrative',
    rights: 'Human Rights',
    workplace: 'Workplace',
  };
  return labels[category] || category;
}

const styles = StyleSheet.create({
  termContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termText: {
    borderBottomWidth: 1,
    borderStyle: 'dotted',
  },
  helpIcon: {
    marginLeft: 2,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: 16,
    padding: 20,
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  termHeader: {
    flex: 1,
    marginRight: 12,
  },
  modalTerm: {
    fontSize: 24,
    fontWeight: '700',
  },
  fullForm: {
    fontSize: 16,
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  simpleBox: {
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  simpleLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  simpleDefinition: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  definition: {
    fontSize: 15,
    lineHeight: 22,
  },
  exampleBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  jurisdictionRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    gap: 8,
  },
  jurisdictionRegion: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 48,
  },
  jurisdictionNote: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  relatedTermsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  relatedChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  doneButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
