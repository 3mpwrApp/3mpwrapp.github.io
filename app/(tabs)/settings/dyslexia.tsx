/**
 * Dyslexia Support Settings Screen
 *
 * UI for configuring dyslexia-friendly reading preferences:
 * - Font family & size scaling
 * - Letter / word / line spacing
 * - Colored overlays & contrast presets
 * - Reading ruler, word highlighting
 * - Quick presets (Standard, Recommended, High Contrast, Dark Mode)
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { GapView } from '../../../components/GapView';
import {
    COLORED_OVERLAYS,
    DYSLEXIA_FONTS,
    DYSLEXIA_PRESETS,
    LETTER_SPACING,
    LINE_HEIGHT,
    READING_RULER,
    TEXT_CONTRAST,
    WORD_SPACING,
    type ColoredOverlayKey,
    type DyslexiaFontKey,
    type DyslexiaPresetKey,
    type LetterSpacingKey,
    type LineHeightKey,
    type ReadingRulerKey,
    type TextContrastKey,
    type WordSpacingKey,
} from '../../../constants/Dyslexia';
import { useDyslexia } from '../../../context/DyslexiaContext';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useDyslexiaFont } from '../../../hooks/useDyslexiaFont';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';

export default function DyslexiaSettingsScreen() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const dys = useDyslexia();
  const { preferences, currentPreset } = dys;
  const { loading } = useDyslexiaFont(true);

  const [saving, setSaving] = useState(false);

  const applyPreset = async (preset: DyslexiaPresetKey) => {
    setSaving(true);
    try { await dys.applyPreset(preset); }
    catch { Alert.alert(t('common.error', 'Error'), t('dyslexia.presetError', 'Failed to apply preset')); }
    finally { setSaving(false); }
  };

  const update = async (partial: Partial<typeof preferences>) => {
    setSaving(true);
    try { await dys.setPreferences(partial); }
    catch { /* silent */ }
    finally { setSaving(false); }
  };

  const reset = async () => {
    Alert.alert(
      t('dyslexia.resetTitle', 'Reset Dyslexia Settings?'),
      t('dyslexia.resetMessage', 'This will restore default reading settings.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { text: t('common.ok', 'OK'), style: 'destructive', onPress: () => dys.reset() },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('dyslexia.settingsTitle', 'Dyslexia Support'),
          headerRight: () => (
            <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
              {saving ? t('common.saving', 'Saving...') : currentPreset === 'custom' ? t('dyslexia.custom', 'Custom') : DYSLEXIA_PRESETS[currentPreset].name}
            </Text>
          ),
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Presets */}
        <Section title={t('dyslexia.presets', 'Quick Presets')} description={t('dyslexia.presetsDesc', 'Start with a preset and fine-tune')}>
          {(Object.keys(DYSLEXIA_PRESETS) as DyslexiaPresetKey[]).map(p => {
            const preset = DYSLEXIA_PRESETS[p];
            const active = currentPreset === p;
            return (
              <A11yPressable
                key={p}
                onPress={() => applyPreset(p)}
                style={[styles.card, { borderColor: active ? palette.primary : palette.border, backgroundColor: palette.card }]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{preset.name}</Text>
                  {active && <Ionicons name="checkmark-circle" size={20} color={palette.primary} />}
                </View>
                <Text style={[styles.cardDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{preset.description}</Text>
              </A11yPressable>
            );
          })}
        </Section>

        {/* Font */}
        <Section title={t('dyslexia.font', 'Font')} description={loading ? t('dyslexia.loadingFonts', 'Loading fonts...') : t('dyslexia.fontDesc', 'Choose a font that improves readability')}>
          <RowChoices
            current={preferences.font}
            onSelect={(v: DyslexiaFontKey) => update({ font: v })}
            items={Object.keys(DYSLEXIA_FONTS) as DyslexiaFontKey[]}
            getLabel={(k) => DYSLEXIA_FONTS[k].name}
            palette={palette}
            t={t}
          />
          <SliderRow
            label={t('dyslexia.fontSize', 'Font Size (%)')}
            value={preferences.fontSize}
            min={80}
            max={200}
            step={10}
            onChange={(v) => update({ fontSize: v })}
            palette={palette}
          />
        </Section>

        {/* Spacing */}
        <Section title={t('dyslexia.spacing', 'Spacing')} description={t('dyslexia.spacingDesc', 'Adjust spacing to reduce visual crowding')}>
          <ChoiceRow title={t('dyslexia.letterSpacing', 'Letter Spacing')} current={preferences.letterSpacing} items={Object.keys(LETTER_SPACING) as LetterSpacingKey[]} onSelect={(v) => update({ letterSpacing: v })} palette={palette} />
          <ChoiceRow title={t('dyslexia.wordSpacing', 'Word Spacing')} current={preferences.wordSpacing} items={Object.keys(WORD_SPACING) as WordSpacingKey[]} onSelect={(v) => update({ wordSpacing: v })} palette={palette} />
          <ChoiceRow title={t('dyslexia.lineHeight', 'Line Height')} current={preferences.lineHeight} items={Object.keys(LINE_HEIGHT) as LineHeightKey[]} onSelect={(v) => update({ lineHeight: v })} palette={palette} />
        </Section>

        {/* Visual */}
        <Section title={t('dyslexia.visual', 'Visual')} description={t('dyslexia.visualDesc', 'Overlays and contrast for comfort')}>
          <ChoiceRow title={t('dyslexia.overlay', 'Colored Overlay')} current={preferences.coloredOverlay} items={Object.keys(COLORED_OVERLAYS) as ColoredOverlayKey[]} onSelect={(v) => update({ coloredOverlay: v })} palette={palette} />
          <ChoiceRow title={t('dyslexia.contrast', 'Contrast')} current={preferences.textContrast} items={Object.keys(TEXT_CONTRAST) as TextContrastKey[]} onSelect={(v) => update({ textContrast: v })} palette={palette} />
          <ChoiceRow title={t('dyslexia.readingRuler', 'Reading Ruler')} current={preferences.readingRuler} items={Object.keys(READING_RULER) as ReadingRulerKey[]} onSelect={(v) => update({ readingRuler: v })} palette={palette} />
        </Section>

        {/* Advanced */}
        <Section title={t('dyslexia.advanced', 'Advanced')} description={t('dyslexia.advancedDesc', 'Experimental and assistive options')}>
          <ToggleRow
            label={t('dyslexia.wordHighlighting', 'Word Highlighting')}
            description={t('dyslexia.wordHighlightingDesc', 'Tap words to highlight them')}
            value={preferences.wordHighlighting}
            onChange={(v) => update({ wordHighlighting: v })}
            palette={palette}
          />
          <ToggleRow
            label={t('dyslexia.syllableBreaks', 'Syllable Breaks')}
            description={t('dyslexia.syllableBreaksDesc', 'Show hyphenation markers (experimental)')}
            value={preferences.syllableBreaks}
            onChange={(v) => update({ syllableBreaks: v })}
            palette={palette}
          />
          <ToggleRow
            label={t('dyslexia.autoScrolling', 'Auto Scrolling')}
            description={t('dyslexia.autoScrollingDesc', 'Slow automatic scroll for continuous reading')}
            value={preferences.autoScrolling}
            onChange={(v) => update({ autoScrolling: v })}
            palette={palette}
          />
        </Section>

        {/* Actions */}
        <Section title={t('dyslexia.actions', 'Actions')}>
          <A11yPressable
            onPress={reset}
            style={[styles.actionBtn, { backgroundColor: palette.card, borderColor: palette.border }]}
            accessibilityRole="button"
            accessibilityLabel={t('dyslexia.reset', 'Reset to defaults')}
          >
            <GapView gap={8} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="refresh" size={20} color={palette.error} />
              <Text style={[styles.actionLabel, { color: palette.error }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('dyslexia.reset', 'Reset to defaults')}</Text>
            </GapView>
          </A11yPressable>
        </Section>

        <GapView gap={10} style={[styles.helpBox, { backgroundColor: palette.info + '20', borderColor: palette.info }]}>
          <Ionicons name="information-circle" size={20} color={palette.info} />
          <Text style={[styles.helpText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('dyslexia.help', 'These tools support readers with dyslexia by reducing visual stress, improving letter differentiation, and enhancing tracking. Experiment to find what feels best for you.')}
          </Text>
        </GapView>
      </ScrollView>
    </>
  );
}

// Reusable UI subcomponents
function Section({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  const palette = useAppPalette();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{title}</Text>
      {description ? (
        <Text style={[styles.sectionDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{description}</Text>
      ) : null}
      {children}
    </View>
  );
}

function RowChoices<T extends string>({ current, onSelect, items, getLabel, palette }: { current: T; onSelect: (v: T) => void; items: T[]; getLabel: (k: T) => string; palette: ReturnType<typeof useAppPalette>; t?: any }) {
  return (
    <GapView gap={8} style={styles.rowChoicesWrap}>
      {items.map(item => {
        const active = item === current;
        return (
          <A11yPressable
            key={item}
            onPress={() => onSelect(item)}
            style={[styles.choicePill, { backgroundColor: active ? palette.primary : palette.card, borderColor: active ? palette.primary : palette.border }]}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
          >
            <Text style={[styles.choicePillText, { color: active ? palette.onPrimary : palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{getLabel(item)}</Text>
          </A11yPressable>
        );
      })}
    </GapView>
  );
}

function ChoiceRow<T extends string>({ title, current, items, onSelect, palette }: { title: string; current: T; items: T[]; onSelect: (v: T) => void; palette: ReturnType<typeof useAppPalette>; }) {
  return (
    <View style={styles.choiceRow}>
      <Text style={[styles.choiceRowTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{title}</Text>
      <GapView gap={8} style={styles.choiceRowChips}>
        {items.map(item => {
          const active = item === current;
          return (
            <A11yPressable
              key={item}
              onPress={() => onSelect(item)}
              style={[styles.chip, { backgroundColor: active ? palette.primary : palette.card, borderColor: active ? palette.primary : palette.border }]}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
            >
              <Text style={[styles.chipText, { color: active ? palette.onPrimary : palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{item}</Text>
            </A11yPressable>
          );
        })}
      </GapView>
    </View>
  );
}

function ToggleRow({ label, description, value, onChange, palette }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void; palette: ReturnType<typeof useAppPalette>; }) {
  return (
    <View style={[styles.toggleRow, { borderColor: palette.border }]}>      
      <View style={styles.toggleInfo}>        
        <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{label}</Text>
        <Text style={[styles.toggleDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

function SliderRow({ label, value, min, max, step, onChange, palette }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; palette: ReturnType<typeof useAppPalette>; }) {
  // Minimal slider mock using chips (avoid adding new dependency)
  const values: number[] = [];
  for (let v = min; v <= max; v += step) values.push(v);
  return (
    <View style={styles.choiceRow}>
      <Text style={[styles.choiceRowTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{label}: {value}%</Text>
      <View style={styles.choiceRowChips}>
        {values.map(v => {
          const active = v === value;
          return (
            <A11yPressable
              key={v}
              onPress={() => onChange(v)}
              style={[styles.chip, { backgroundColor: active ? palette.primary : palette.card, borderColor: active ? palette.primary : palette.border }]}
              accessibilityRole="button"
            >
              <Text style={[styles.chipText, { color: active ? palette.onPrimary : palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{v}</Text>
            </A11yPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  sectionDesc: { fontSize: 14, marginBottom: 12 },
  rowChoicesWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  choicePill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  choicePillText: { fontSize: 14, fontWeight: '500' },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  choiceRow: { marginBottom: 18 },
  choiceRowTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  choiceRowChips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 13 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  toggleInfo: { flex: 1, paddingRight: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  toggleDesc: { fontSize: 13 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1 },
  actionLabel: { fontSize: 14, fontWeight: '600' },
  helpBox: { borderWidth: 1, padding: 12, borderRadius: 8, flexDirection: 'row', marginBottom: 64 },
  helpText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
