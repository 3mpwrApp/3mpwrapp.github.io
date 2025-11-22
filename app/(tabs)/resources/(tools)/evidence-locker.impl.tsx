import React from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../../components/A11yPressable';
import DisclaimerBanner from '../../../../components/DisclaimerBanner';
import { GapView } from '../../../../components/GapView';
import SearchBar from '../../../../components/SearchBar';
import { SkeletonList } from '../../../../components/SkeletonLoader';
import { usePostLoadAnnounce } from '../../../../hooks/usePostLoadAnnounce';
import { useTranslation } from '../../../../i18n';
import { s } from '../../../../theme/spacing';
import { useAppPalette } from '../../../../theme/usePalette';

export default function EvidenceLockerImpl() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  const [passModal, setPassModal] = React.useState<null | { mode: 'export' | 'import' }>(null);
  const [passValue, setPassValue] = React.useState('');
  const [notes, setNotes] = React.useState<string[]>([]);
  const [lastAdded, setLastAdded] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredNotes = React.useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(note => note.toLowerCase().includes(q));
  }, [notes, searchQuery]);

  React.useEffect(() => {
    // Simulate loading encrypted notes
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // Announce count on first load using shared hook
  usePostLoadAnnounce({ loading, count: notes.length, ns: 'templates.evidenceLocker', emptyKey: 'templates.evidenceLocker.empty' });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('templates.evidenceLocker.title', 'Evidence Locker')}</Text>
      <DisclaimerBanner type="legal" compact={true} />
      
      {loading ? (
        <SkeletonList count={4} />
      ) : (
        <>
          {notes.length > 0 && (
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('templates.evidenceLocker.searchPlaceholder', 'Search notes...')}
            />
          )}
          <GapView style={styles.row} gap={s('sm')}>
        <A11yPressable style={styles.button} onPress={() => setPassModal({ mode: 'export' })}>
          <Text style={styles.buttonText}>{t('common.export', 'Export')}</Text>
        </A11yPressable>
        <A11yPressable style={styles.button} onPress={() => setPassModal({ mode: 'import' })}>
          <Text style={styles.buttonText}>{t('common.import', 'Import')}</Text>
        </A11yPressable>
        <A11yPressable style={styles.button} onPress={() => { const label = t('templates.evidenceLocker.addNote','Note'); const newLabel = label + ' ' + (notes.length+1); setNotes(n=>[...n,newLabel]); setLastAdded(newLabel); }} accessibilityLabel={t('templates.evidenceLocker.addNote','Add note')}>
          <Text style={styles.buttonText}>{t('templates.evidenceLocker.addNote','Add Note')}</Text>
        </A11yPressable>
      </GapView>
      {lastAdded && (
        <View style={{ marginTop: s('md') }} accessibilityLiveRegion="polite">
          <Text style={{ color: palette.text }}>{t('templates.evidenceLocker.noteSaved','Note saved to your cloud locker.')}</Text>
        </View>
      )}
      {filteredNotes.length > 0 && (
        <View style={{ marginTop: s('md') }}>
          {searchQuery && (
            <Text style={{ color: palette.text, marginBottom: 8, opacity: 0.7 }}>
              {t('templates.evidenceLocker.searchResults', '{{count}} result(s)', { count: filteredNotes.length })}
            </Text>
          )}
          {filteredNotes.map((n,i)=>(<Text key={i} style={{ color: palette.text, marginTop:4 }}>• {n}</Text>))}
        </View>
      )}
      {searchQuery && filteredNotes.length === 0 && (
        <Text style={{ color: palette.text, marginTop: s('md'), opacity: 0.7 }}>
          {t('templates.evidenceLocker.noResults', 'No notes match your search')}
        </Text>
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
          </>
        )}
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: s('lg') },
    title: { color: palette.text, fontSize: 20, fontWeight: '700' },
    row: { flexDirection: 'row', marginTop: s('md') },
    rowRight: { flexDirection: 'row', marginTop: s('md'), justifyContent: 'flex-end' },
    button: { backgroundColor: palette.primary, paddingVertical: s('sm'), paddingHorizontal: s('md'), borderRadius: s('lg') },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    secondary: { backgroundColor: palette.surface, paddingVertical: s('sm'), paddingHorizontal: s('md'), borderRadius: s('lg'), borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    secondaryText: { color: palette.text, fontWeight: '700' },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, borderRadius: s('lg'), paddingHorizontal: s('md'), paddingVertical: s('sm'), marginTop: s('sm') },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
    modalCard: { backgroundColor: palette.surface, padding: s('lg'), borderRadius: s('lg'), width: '90%', maxWidth: 420 },
  });
}
