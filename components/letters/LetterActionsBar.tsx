import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { useTranslation } from '../../i18n';
import { announce } from '../../utils/announce';
import A11yPressable from '../A11yPressable';
import { GapView } from '../GapView';

export interface LetterActionsBarProps {
  showInfo: boolean;
  onToggleInfo(): void;
  onCopy(): void;
  onInsertTrackers?: () => void;
  onExportPdf?: () => void;
  onExportDoc?: () => void;
  palette: any;
}

export function LetterActionsBar({ showInfo, onToggleInfo, onCopy, onInsertTrackers, onExportPdf, onExportDoc, palette }: LetterActionsBarProps) {
  const { t } = useTranslation();
  const s = React.useMemo(() => createStyles(palette), [palette]);
  return (
    <GapView style={s.actionsRow} gap={8}>
      <A11yPressable
        onPress={() => { onToggleInfo(); announce(showInfo ? t('common.hide','Hide') : t('templates.letters.common.toggleInfo','Toggle instructions')); }}
        style={s.infoBtn}
        accessibilityRole="button"
        accessibilityLabel={t('templates.letters.common.toggleInfo','Toggle instructions')}
      >
  <Text testID="letterActionToggle" style={s.infoBtnText}>{showInfo ? t('common.hide','Hide') : t('common.show','Show')}</Text>
      </A11yPressable>
      <A11yPressable onPress={onCopy} style={s.secondaryBtn} accessibilityRole="button" accessibilityLabel={t('templates.letters.common.copy','Copy')}>
  <Text testID="letterActionCopy" style={s.secondaryBtnText}>{t('templates.letters.common.copy','Copy')}</Text>
      </A11yPressable>
      {onInsertTrackers && (
        <A11yPressable onPress={onInsertTrackers} style={s.secondaryBtn} accessibilityRole="button" accessibilityLabel={t('templates.letters.common.insertTrackers','Insert from trackers')}>
          <Text testID="letterActionInsert" style={s.secondaryBtnText}>{t('templates.letters.common.insertTrackers','Insert from trackers')}</Text>
        </A11yPressable>
      )}
      {onExportPdf && (
        <A11yPressable onPress={onExportPdf} style={s.secondaryBtn} accessibilityRole="button" accessibilityLabel={t('templates.letters.common.exportPdf','Export as PDF')}>
          <Text testID="letterActionPdf" style={s.secondaryBtnText}>{t('templates.letters.common.exportPdf','Export as PDF')}</Text>
        </A11yPressable>
      )}
      {onExportDoc && (
        <A11yPressable onPress={onExportDoc} style={s.secondaryBtn} accessibilityRole="button" accessibilityLabel={t('templates.letters.common.exportDoc','Export as .doc')}>
          <Text testID="letterActionDoc" style={s.secondaryBtnText}>{t('templates.letters.common.exportDoc','Export as .doc')}</Text>
        </A11yPressable>
      )}
    </GapView>
  );
}

function createStyles(palette: any) {
  return StyleSheet.create({
    actionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
    infoBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
    infoBtnText: { color: palette.text, fontWeight: '600', fontSize: 13 },
    secondaryBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
    secondaryBtnText: { color: palette.text, fontWeight: '600' },
  });
}

export default LetterActionsBar;
