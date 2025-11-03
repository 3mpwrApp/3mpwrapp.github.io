/**
 * Cognitive Accessibility Settings Screen
 * 
 * Configure cognitive accessibility features including:
 * - Simplified mode
 * - Auto-save frequency
 * - Navigation memory
 * - Task reminders
 * - Focus assistance
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { AutoSaveIndicator } from '../../../components/CognitiveAccessibility';
import type {
    CognitiveMode,
    TaskReminder
} from '../../../constants/Cognitive';
import {
    COGNITIVE_MODES,
    COMPLEXITY_INDICATORS
} from '../../../constants/Cognitive';
import { useCognitiveAccessibility } from '../../../context/CognitiveAccessibilityContext';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';
import { logError } from '../../../utils/errorLogger';

export default function CognitiveAccessibilityScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const cognitive = useCognitiveAccessibility();
  
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const currentMode = cognitive.preferences.mode;
  const currentPrefs = cognitive.preferences;
  
  // Handle mode change
  const handleModeChange = async (mode: CognitiveMode) => {
    if (mode === currentMode) return;
    
    setIsSaving(true);
    try {
      await cognitive.setMode(mode);
      setLastSaved(Date.now());
      
      const modeConfig = COGNITIVE_MODES[mode];
      announce(
        t('cognitive.modeChanged', 'Cognitive mode changed to {{mode}}', { mode: modeConfig.name })
      );
      
      // Show helpful info about the new mode
      Alert.alert(
        t('cognitive.modeChangeTitle', 'Mode Changed'),
        t('cognitive.modeChangeMessage', 'Cognitive accessibility mode is now set to {{mode}}. {{description}}', {
          mode: modeConfig.name,
          description: modeConfig.description,
        }),
        [{ text: t('common.ok', 'OK') }]
      );
    } catch (error) {
      logError('CognitiveAccessibility', 'Failed to change cognitive mode', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('cognitive.modeChangeError', 'Failed to change cognitive mode. Please try again.'),
        [{ text: t('common.ok', 'OK') }]
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle preference
  const togglePreference = async (key: keyof typeof currentPrefs, value: boolean) => {
    setIsSaving(true);
    try {
      await cognitive.updatePreferences({ [key]: value });
      setLastSaved(Date.now());
      
      announce(
        t('cognitive.preferenceUpdated', 'Preference updated')
      );
    } catch (error) {
      logError('CognitiveAccessibility', 'Failed to update preference', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Clear all saved data
  const handleClearData = () => {
    Alert.alert(
      t('cognitive.clearDataTitle', 'Clear Saved Data?'),
      t('cognitive.clearDataMessage', 'This will clear all navigation history, scroll positions, saved forms, and incomplete tasks. This cannot be undone.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('cognitive.clearData', 'Clear All Data'),
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              await cognitive.reset();
              setLastSaved(Date.now());
              
              announce(
                t('cognitive.dataCleared', 'All cognitive accessibility data has been cleared')
              );
              
              Alert.alert(
                t('common.success', 'Success'),
                t('cognitive.dataClearedMessage', 'All saved data has been cleared.'),
                [{ text: t('common.ok', 'OK') }]
              );
            } catch (error) {
              logError('CognitiveAccessibility', 'Failed to clear data', error);
              Alert.alert(
                t('common.error', 'Error'),
                t('cognitive.clearDataError', 'Failed to clear data. Please try again.'),
                [{ text: t('common.ok', 'OK') }]
              );
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };
  
  // View incomplete tasks
  const handleViewTasks = () => {
    const tasks = cognitive.getIncompleteTasks();
    
    if (tasks.length === 0) {
      Alert.alert(
        t('cognitive.noTasksTitle', 'No Incomplete Tasks'),
        t('cognitive.noTasksMessage', 'You have no incomplete tasks at the moment.'),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }
    
    const taskList = tasks.map((task: TaskReminder, i: number) => `${i + 1}. ${task.taskName}`).join('\n');
    
    Alert.alert(
      t('cognitive.incompleteTasksTitle', 'Incomplete Tasks ({{count}})', { count: tasks.length }),
      taskList,
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('cognitive.clearTasks', 'Clear All Tasks'),
          style: 'destructive',
          onPress: () => {
            cognitive.clearIncompleteTasks();
            announce(
              t('cognitive.tasksCleared', 'All tasks have been cleared')
            );
          },
        },
      ]
    );
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: t('cognitive.settingsTitle', 'Cognitive Accessibility'),
          headerRight: () => <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />,
        }}
      />
      
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Mode Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.modeTitle', 'Cognitive Mode')}
          </Text>
          <Text style={[styles.sectionDescription, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.modeDescription', 'Choose how the app should adapt to your cognitive needs. Simplified modes reduce choices, enhance auto-save, and provide more guidance.')}
          </Text>
          
          {(Object.keys(COGNITIVE_MODES) as CognitiveMode[]).map((mode) => {
            const config = COGNITIVE_MODES[mode];
            const isSelected = mode === currentMode;
            
            return (
              <A11yPressable
                key={mode}
                onPress={() => handleModeChange(mode)}
                style={[
                  styles.modeCard,
                  { backgroundColor: palette.card, borderColor: isSelected ? palette.primary : palette.border },
                  isSelected && styles.modeCardSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${config.name}: ${config.description}`}
              >
                <View style={styles.modeHeader}>
                  <View style={[styles.modeRadio, { borderColor: palette.primary }]}>
                    {isSelected && <View style={[styles.modeRadioSelected, { backgroundColor: palette.primary }]} />}
                  </View>
                  <View style={styles.modeInfo}>
                    <Text style={[styles.modeName, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {config.name}
                    </Text>
                    <Text style={[styles.modeDescription, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {config.description}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modeDetails}>
                  <View style={styles.modeDetailItem}>
                    <Ionicons name="list" size={16} color={palette.textSecondary} />
                    <Text style={[styles.modeDetailText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {t('cognitive.maxItems', 'Max {{count}} items per screen', { count: config.maxItemsPerScreen })}
                    </Text>
                  </View>
                  <View style={styles.modeDetailItem}>
                    <Ionicons name="save" size={16} color={palette.textSecondary} />
                    <Text style={[styles.modeDetailText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {t('cognitive.autoSaveEvery', 'Auto-save every {{seconds}}s', { seconds: config.autoSaveFrequency / 1000 })}
                    </Text>
                  </View>
                </View>
              </A11yPressable>
            );
          })}
        </View>
        
        {/* Feature Toggles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.featuresTitle', 'Features')}
          </Text>
          
          {/* Navigation Memory */}
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="map" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.navigationMemory', 'Navigation Memory')}
                </Text>
                <Text style={[styles.toggleDescription, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.navigationMemoryDesc', 'Remember where you were and offer to go back')}
                </Text>
              </View>
            </View>
            <Switch
              value={currentPrefs.showRecentLocations}
              onValueChange={(value) => togglePreference('showRecentLocations', value)}
              accessibilityLabel={t('cognitive.toggleNavigationMemory', 'Toggle navigation memory')}
            />
          </View>
          
          {/* Scroll Position Memory */}
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="arrow-down-circle" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.scrollMemory', 'Scroll Position Memory')}
                </Text>
                <Text style={[styles.toggleDescription, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.scrollMemoryDesc', 'Return to where you were scrolling on each screen')}
                </Text>
              </View>
            </View>
            <Switch
              value={currentPrefs.saveScrollPosition}
              onValueChange={(value) => togglePreference('saveScrollPosition', value)}
              accessibilityLabel={t('cognitive.toggleScrollMemory', 'Toggle scroll position memory')}
            />
          </View>
          
          {/* Progress Breadcrumbs */}
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="trail-sign" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.breadcrumbs', 'Progress Breadcrumbs')}
                </Text>
                <Text style={[styles.toggleDescription, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.breadcrumbsDesc', 'Show "You are here" navigation breadcrumbs')}
                </Text>
              </View>
            </View>
            <Switch
              value={currentPrefs.showProgressBars}
              onValueChange={(value) => togglePreference('showProgressBars', value)}
              accessibilityLabel={t('cognitive.toggleBreadcrumbs', 'Toggle breadcrumbs')}
            />
          </View>
          
          {/* Task Complexity Indicators */}
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleIcon}>{COMPLEXITY_INDICATORS.moderate.icon}</Text>
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.complexityIndicators', 'Task Complexity Indicators')}
                </Text>
                <Text style={[styles.toggleDescription, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.complexityIndicatorsDesc', 'Show how complex or time-consuming tasks are')}
                </Text>
              </View>
            </View>
            <Switch
              value={currentPrefs.showTimeEstimates}
              onValueChange={(value) => togglePreference('showTimeEstimates', value)}
              accessibilityLabel={t('cognitive.toggleComplexityIndicators', 'Toggle complexity indicators')}
            />
          </View>
          
          {/* Step-by-Step Guidance */}
          <View style={[styles.toggleRow, { borderColor: palette.border }]}>
            <View style={styles.toggleInfo}>
              <Ionicons name="footsteps" size={24} color={palette.primary} />
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.stepByStep', 'Step-by-Step Guidance')}
                </Text>
                <Text style={[styles.toggleDescription, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('cognitive.stepByStepDesc', 'Break complex tasks into smaller steps')}
                </Text>
              </View>
            </View>
            <Switch
              value={currentPrefs.showStepNumbers}
              onValueChange={(value) => togglePreference('showStepNumbers', value)}
              accessibilityLabel={t('cognitive.toggleStepByStep', 'Toggle step-by-step guidance')}
            />
          </View>
        </View>
        
        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.actionsTitle', 'Actions')}
          </Text>
          
          {/* View Incomplete Tasks */}
          <A11yPressable
            onPress={handleViewTasks}
            style={[styles.actionButton, { backgroundColor: palette.card, borderColor: palette.border }]}
            accessibilityRole="button"
            accessibilityLabel={t('cognitive.viewIncompleteTasks', 'View incomplete tasks')}
          >
            <Ionicons name="checkbox-outline" size={24} color={palette.primary} />
            <View style={styles.actionText}>
              <Text style={[styles.actionLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('cognitive.viewTasks', 'View Incomplete Tasks')}
              </Text>
              <Text style={[styles.actionDescription, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('cognitive.viewTasksDesc', 'See tasks you started but didn\'t finish')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </A11yPressable>
          
          {/* Clear All Data */}
          <A11yPressable
            onPress={handleClearData}
            style={[styles.actionButton, { backgroundColor: palette.card, borderColor: palette.border }]}
            accessibilityRole="button"
            accessibilityLabel={t('cognitive.clearAllData', 'Clear all saved data')}
          >
            <Ionicons name="trash-outline" size={24} color={palette.error} />
            <View style={styles.actionText}>
              <Text style={[styles.actionLabel, { color: palette.error }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('cognitive.clearData', 'Clear All Data')}
              </Text>
              <Text style={[styles.actionDescription, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('cognitive.clearDataDesc', 'Remove all navigation history, saved forms, and tasks')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </A11yPressable>
        </View>
        
        {/* Help Text */}
        <View style={[styles.helpBox, { backgroundColor: palette.info + '20', borderColor: palette.info }]}>
          <Ionicons name="information-circle" size={24} color={palette.info} />
          <Text style={[styles.helpText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.helpText', 'Cognitive accessibility features help users with ADHD, autism, learning disabilities, and anyone who benefits from simplified interfaces, memory aids, and step-by-step guidance.')}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  
  // Mode Card
  modeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  modeCardSelected: {
    borderWidth: 3,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modeRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  modeRadioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  modeDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  modeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  modeDetailText: {
    fontSize: 12,
    marginLeft: 8,
  },
  
  // Toggle Row
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
  toggleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Help Box
  helpBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
});
