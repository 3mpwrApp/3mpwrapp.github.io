/**
 * Cognitive Comfort Settings Screen
 * 
 * Configure enhanced memory and navigation aids for users with
 * brain fog, memory challenges, and cognitive fatigue.
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import {
    clearNavigationHistory,
    DEFAULT_COGNITIVE_COMFORT_PREFERENCES,
    getNavigationHistory,
    getPreferences,
    getVoiceNotes,
    loadCognitiveComfortData,
    subscribe,
    updatePreferences,
    type CognitiveComfortPreferences,
} from '../../../store/cognitiveComfort';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

export default function CognitiveComfortScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  
  const [prefs, setPrefs] = useState<CognitiveComfortPreferences>(DEFAULT_COGNITIVE_COMFORT_PREFERENCES);
  const [historyCount, setHistoryCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load data on mount
  useEffect(() => {
    loadCognitiveComfortData().then(() => {
      setPrefs(getPreferences());
      setHistoryCount(getNavigationHistory().length);
      setNotesCount(getVoiceNotes().length);
      setIsLoaded(true);
    });
    
    return subscribe(() => {
      setPrefs(getPreferences());
      setHistoryCount(getNavigationHistory().length);
      setNotesCount(getVoiceNotes().length);
    });
  }, []);
  
  const handleToggle = async (key: keyof CognitiveComfortPreferences, value: boolean) => {
    await updatePreferences({ [key]: value });
    announce(t('cognitive.settingUpdated', 'Setting updated'));
  };
  
  const handleClearHistory = () => {
    Alert.alert(
      t('cognitive.clearHistoryTitle', 'Clear Navigation History?'),
      t('cognitive.clearHistoryMessage', 'This will remove all saved navigation history. This cannot be undone.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('cognitive.clearNow', 'Clear Now'),
          style: 'destructive',
          onPress: async () => {
            await clearNavigationHistory();
            announce(t('cognitive.historyCleared', 'Navigation history cleared'));
          },
        },
      ]
    );
  };
  
  if (!isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: palette.background }]}>
        <Text style={{ color: palette.text }}>{t('common.loading', 'Loading...')}</Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen
        options={{
          title: t('cognitive.comfortTitle', 'Cognitive Comfort'),
        }}
      />
      
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Header Info */}
        <View style={[styles.infoBox, { backgroundColor: palette.info + '15', borderColor: palette.info }]}>
          <Ionicons name="bulb" size={24} color={palette.info} />
          <Text style={[styles.infoText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.comfortDescription', 'These features help if you experience brain fog, memory challenges, or get easily distracted. Enable what helps you most.')}
          </Text>
        </View>
        
        {/* Where Was I? */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.navigationMemoryTitle', '📍 Navigation Memory')}
          </Text>
          
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="footsteps" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.whereWasI', '"Where Was I?" Button')}
                </Text>
                <Text style={[styles.toggleDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.whereWasIDesc', 'Floating button to see recent pages and go back')}
                </Text>
              </View>
            </View>
            <Switch
              value={prefs.showWhereWasI}
              onValueChange={(v) => handleToggle('showWhereWasI', v)}
              accessibilityLabel={t('cognitive.toggleWhereWasI', 'Toggle Where Was I button')}
            />
          </View>
          
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="trail-sign" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.breadcrumbTrail', 'Breadcrumb Trail')}
                </Text>
                <Text style={[styles.toggleDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.breadcrumbTrailDesc', 'Show "You are here" path at top of screens')}
                </Text>
              </View>
            </View>
            <Switch
              value={prefs.showBreadcrumbTrail}
              onValueChange={(v) => handleToggle('showBreadcrumbTrail', v)}
              accessibilityLabel={t('cognitive.toggleBreadcrumb', 'Toggle breadcrumb trail')}
            />
          </View>
          
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="location" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.locationIndicator', 'Persistent Location Indicator')}
                </Text>
                <Text style={[styles.toggleDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.locationIndicatorDesc', 'Always show which section of the app you\'re in')}
                </Text>
              </View>
            </View>
            <Switch
              value={prefs.persistentLocationIndicator}
              onValueChange={(v) => handleToggle('persistentLocationIndicator', v)}
              accessibilityLabel={t('cognitive.toggleLocationIndicator', 'Toggle location indicator')}
            />
          </View>
        </View>
        
        {/* Session Memory */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.sessionMemoryTitle', '🕐 Session Memory')}
          </Text>
          
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="time" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.sessionSummary', 'Session Summary')}
                </Text>
                <Text style={[styles.toggleDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.sessionSummaryDesc', 'Show what you did last time when returning to the app')}
                </Text>
              </View>
            </View>
            <Switch
              value={prefs.showSessionSummary}
              onValueChange={(v) => handleToggle('showSessionSummary', v)}
              accessibilityLabel={t('cognitive.toggleSessionSummary', 'Toggle session summary')}
            />
          </View>
        </View>
        
        {/* Focus Assistance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.focusAssistanceTitle', '🎯 Focus Assistance')}
          </Text>
          
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="lock-closed" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.focusLock', 'Focus Lock')}
                </Text>
                <Text style={[styles.toggleDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.focusLockDesc', 'Lock on a screen to prevent accidental navigation')}
                </Text>
              </View>
            </View>
            <Switch
              value={prefs.focusLockEnabled}
              onValueChange={(v) => handleToggle('focusLockEnabled', v)}
              accessibilityLabel={t('cognitive.toggleFocusLock', 'Toggle focus lock')}
            />
          </View>
          
          {prefs.focusLockEnabled && (
            <View style={[styles.toggleRow, { borderColor: palette.border }]}>
              <View style={styles.toggleInfo}>
                <Ionicons name="alert-circle" size={24} color={palette.warning} />
                <View style={styles.toggleText}>
                  <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {t('cognitive.confirmExit', 'Confirm Before Leaving')}
                  </Text>
                  <Text style={[styles.toggleDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {t('cognitive.confirmExitDesc', 'Ask before unlocking focus lock')}
                  </Text>
                </View>
              </View>
              <Switch
                value={prefs.focusLockConfirmExit}
                onValueChange={(v) => handleToggle('focusLockConfirmExit', v)}
                accessibilityLabel={t('cognitive.toggleConfirmExit', 'Toggle exit confirmation')}
              />
            </View>
          )}
        </View>
        
        {/* Screen Help */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.screenHelpTitle', '❓ Screen Help')}
          </Text>
          
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="help-circle" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.explainButton', '"Explain This Screen" Button')}
                </Text>
                <Text style={[styles.toggleDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.explainButtonDesc', 'Show help button to explain what each screen does')}
                </Text>
              </View>
            </View>
            <Switch
              value={prefs.showExplainButton}
              onValueChange={(v) => handleToggle('showExplainButton', v)}
              accessibilityLabel={t('cognitive.toggleExplainButton', 'Toggle explain button')}
            />
          </View>
          
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="text" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.simpleExplanations', 'Simple Explanations')}
                </Text>
                <Text style={[styles.toggleDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.simpleExplanationsDesc', 'Use shorter, simpler explanations')}
                </Text>
              </View>
            </View>
            <Switch
              value={prefs.useSimpleExplanations}
              onValueChange={(v) => handleToggle('useSimpleExplanations', v)}
              accessibilityLabel={t('cognitive.toggleSimpleExplanations', 'Toggle simple explanations')}
            />
          </View>
        </View>
        
        {/* Voice Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.voiceNotesTitle', '🎤 Voice Notes')}
          </Text>
          
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="mic" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.voiceNotes', 'Voice Notes')}
                </Text>
                <Text style={[styles.toggleDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.voiceNotesDesc', 'Record quick audio reminders to yourself')}
                </Text>
              </View>
            </View>
            <Switch
              value={prefs.voiceNotesEnabled}
              onValueChange={(v) => handleToggle('voiceNotesEnabled', v)}
              accessibilityLabel={t('cognitive.toggleVoiceNotes', 'Toggle voice notes')}
            />
          </View>
          
          {notesCount > 0 && (
            <A11yPressable
              onPress={() => router.push('/resources/voice-notes' as any)}
              style={[styles.actionCard, { backgroundColor: palette.card, borderColor: palette.border }]}
              accessibilityRole="button"
              accessibilityLabel={t('cognitive.viewVoiceNotes', 'View {{count}} voice notes', { count: notesCount })}
            >
              <Ionicons name="play-circle" size={24} color={palette.primary} />
              <Text style={[styles.actionText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('cognitive.youHaveNotes', 'You have {{count}} voice note(s)', { count: notesCount })}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
            </A11yPressable>
          )}
        </View>
        
        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.dataManagement', '📁 Data Management')}
          </Text>
          
          <A11yPressable
            onPress={handleClearHistory}
            style={[styles.actionCard, { backgroundColor: palette.card, borderColor: palette.border }]}
            accessibilityRole="button"
            accessibilityLabel={t('cognitive.clearHistory', 'Clear navigation history')}
          >
            <Ionicons name="trash-outline" size={24} color={palette.error} />
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: palette.error }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('cognitive.clearHistory', 'Clear Navigation History')}
              </Text>
              <Text style={[styles.actionDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('cognitive.historyCount', '{{count}} pages tracked', { count: historyCount })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </A11yPressable>
        </View>
        
        {/* Spacing at bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  toggleText: {
    marginLeft: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
