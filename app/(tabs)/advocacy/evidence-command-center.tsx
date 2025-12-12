/**
 * Evidence Command Center - Power Tool
 * 
 * Consolidates 6 documentation features into 4 tabs:
 * - Locker: Evidence Manager, Evidence Vault
 * - Timeline: Case Timeline
 * - Voice: Voice Notes
 * - Checklist: Evidence Checklist
 */

/* eslint-disable no-restricted-syntax */ // Recording indicator colors are intentional

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import GapView from '../../../components/GapView';
import PowerTool, {
    PowerToolAction,
    PowerToolSection,
    PowerToolTabContent,
    type PowerToolTab,
    type PowerToolTabProps,
} from '../../../components/PowerTool';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { trackEvent } from '../../../services/analyticsClient';
import { useAppPalette } from '../../../theme/usePalette';


// ============================================
// TAB 1: LOCKER (Simple Mode)
// ============================================
function LockerTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  
  const [recentFiles] = useState([
    { id: '1', type: 'image', name: 'Medical_Report_Dec2024.pdf', date: '2024-12-10' },
    { id: '2', type: 'document', name: 'Denial_Letter.pdf', date: '2024-12-08' },
    { id: '3', type: 'audio', name: 'Doctor_Call_Notes.m4a', date: '2024-12-05' },
  ]);

  const quickActions = [
    { id: 'photo', emoji: '📷', name: 'Take Photo', action: 'camera' },
    { id: 'document', emoji: '📄', name: 'Scan Document', action: 'scan' },
    { id: 'audio', emoji: '🎙️', name: 'Record Audio', action: 'audio' },
    { id: 'upload', emoji: '📁', name: 'Upload File', action: 'upload' },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return 'image';
      case 'document': return 'document-text';
      case 'audio': return 'mic';
      default: return 'document';
    }
  };

  const styles = createLockerStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Quick Add */}
      <PowerToolSection title={t('evidence.add.title', 'Add Evidence')}>
        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <A11yPressable
              key={action.id}
              onPress={() => {
                trackEvent('evidence.add', { type: action.action });
                router.push({
                  pathname: '/advocacy/evidence-manager',
                  params: { action: action.action },
                } as any);
              }}
              accessibilityLabel={action.name}
              hitSlop={HIT_SLOP_8}
              style={[styles.actionCard, { backgroundColor: palette.primary + '15' }]}
            >
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
              <Text style={[styles.actionName, { color: palette.text }]}>{action.name}</Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Storage Status */}
      <View style={[styles.storageCard, { backgroundColor: palette.card }]}>
        <View style={styles.storageHeader}>
          <Text style={[styles.storageTitle, { color: palette.text }]}>
            {t('evidence.storage.title', 'Evidence Vault')}
          </Text>
          <Text style={[styles.storageCount, { color: palette.primary }]}>
            23 {t('evidence.storage.items', 'items')}
          </Text>
        </View>
        <View style={styles.storageBar}>
          <View style={[styles.storageUsed, { backgroundColor: palette.primary, width: '35%' }]} />
        </View>
        <Text style={[styles.storageText, { color: palette.secondaryText }]}>
          {t('evidence.storage.usage', '350 MB of 1 GB used')}
        </Text>
      </View>

      <GapView style={{ height: 16 }} />

      {/* Recent Files */}
      <PowerToolSection title={t('evidence.recent.title', 'Recent Evidence')}>
        {recentFiles.map((file) => (
          <A11yPressable
            key={file.id}
            onPress={() => {
              trackEvent('evidence.file.open', { id: file.id });
              router.push('/advocacy/evidence-manager' as any);
            }}
            accessibilityLabel={file.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.fileCard, { backgroundColor: palette.card }]}
          >
            <View style={[styles.fileIcon, { backgroundColor: palette.primary + '20' }]}>
              <Ionicons name={getFileIcon(file.type) as any} size={24} color={palette.primary} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={[styles.fileName, { color: palette.text }]} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={[styles.fileDate, { color: palette.secondaryText }]}>
                {file.date}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('evidence.timeline.explore', 'View Timeline')}
        icon="time"
        onPress={() => navigateToTab('timeline')}
      />
    </PowerToolTabContent>
  );
}

const createLockerStyles = (_palette: any) => StyleSheet.create({
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionName: {
    fontSize: 14,
    fontWeight: '600',
  },
  storageCard: {
    padding: 16,
    borderRadius: 12,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  storageCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  storageBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  storageUsed: {
    height: '100%',
    borderRadius: 4,
  },
  storageText: {
    fontSize: 12,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileDate: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// TAB 2: TIMELINE (Standard Mode)
// ============================================
function TimelineTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const timelineEvents = [
    { id: '1', date: 'Dec 10, 2024', event: 'Medical report received', type: 'document', important: true },
    { id: '2', date: 'Dec 8, 2024', event: 'Denial letter received', type: 'denial', important: true },
    { id: '3', date: 'Dec 5, 2024', event: 'Doctor appointment', type: 'appointment', important: false },
    { id: '4', date: 'Nov 28, 2024', event: 'Claim submitted', type: 'claim', important: true },
    { id: '5', date: 'Nov 15, 2024', event: 'Initial application', type: 'application', important: true },
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'denial': return palette.error;
      case 'claim': return palette.warning;
      case 'document': return palette.success;
      default: return palette.primary;
    }
  };

  const styles = createTimelineStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Timeline View */}
      <PowerToolSection title={t('evidence.timeline.title', 'Case Timeline')}>
        {timelineEvents.map((event, index) => (
          <View key={event.id} style={styles.timelineItem}>
            {/* Timeline line */}
            {index < timelineEvents.length - 1 && (
              <View style={[styles.timelineLine, { backgroundColor: palette.border }]} />
            )}
            {/* Dot */}
            <View style={[
              styles.timelineDot,
              { 
                backgroundColor: getEventColor(event.type),
                borderColor: event.important ? getEventColor(event.type) : palette.border,
              },
            ]} />
            {/* Content */}
            <A11yPressable
              onPress={() => {
                trackEvent('evidence.timeline.event', { id: event.id });
                router.push('/advocacy/case-timeline' as any);
              }}
              accessibilityLabel={`${event.date}: ${event.event}`}
              hitSlop={HIT_SLOP_8}
              style={[styles.timelineContent, { backgroundColor: palette.card }]}
            >
              <Text style={[styles.timelineDate, { color: palette.secondaryText }]}>
                {event.date}
              </Text>
              <Text style={[styles.timelineEvent, { color: palette.text }]}>
                {event.event}
              </Text>
              {event.important && (
                <View style={[styles.importantBadge, { backgroundColor: palette.warning + '20' }]}>
                  <Text style={[styles.importantText, { color: palette.warning }]}>Important</Text>
                </View>
              )}
            </A11yPressable>
          </View>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('evidence.timeline.add', 'Add Timeline Event')}
        icon="add-circle"
        onPress={() => {
          trackEvent('evidence.timeline.add');
          router.push('/advocacy/case-timeline' as any);
        }}
        variant="primary"
      />

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('evidence.voice.explore', 'Voice Notes')}
        icon="mic"
        onPress={() => navigateToTab('voice')}
      />
    </PowerToolTabContent>
  );
}

const createTimelineStyles = (_palette: any) => StyleSheet.create({
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
    position: 'relative',
    minHeight: 80,
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    width: 2,
    height: '100%',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  timelineDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  timelineEvent: {
    fontSize: 14,
    fontWeight: '600',
  },
  importantBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 8,
  },
  importantText: {
    fontSize: 10,
    fontWeight: '600',
  },
});


// ============================================
// TAB 3: VOICE (Standard Mode)
// ============================================
function VoiceTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  // router reserved for future voice recording feature
  
  const [isRecording, setIsRecording] = useState(false);

  const recentRecordings = [
    { id: '1', name: 'Doctor call notes', duration: '2:34', date: 'Dec 10' },
    { id: '2', name: 'Symptoms today', duration: '1:12', date: 'Dec 9' },
    { id: '3', name: 'Insurance call', duration: '5:47', date: 'Dec 5' },
  ];

  const styles = createVoiceStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Record Button */}
      <View style={styles.recordSection}>
        <A11yPressable
          onPress={() => {
            setIsRecording(!isRecording);
            trackEvent('evidence.voice.toggle', { recording: !isRecording });
          }}
          accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
          style={[
            styles.recordButton,
            { backgroundColor: isRecording ? palette.error : palette.primary },
          ]}
        >
          <Ionicons 
            name={isRecording ? 'stop' : 'mic'} 
            size={48} 
            color="#FFFFFF" 
          />
        </A11yPressable>
        <Text style={[styles.recordHint, { color: palette.secondaryText }]}>
          {isRecording 
            ? t('evidence.voice.recording', 'Recording...') 
            : t('evidence.voice.tap', 'Tap to start recording')}
        </Text>
        {isRecording && (
          <Text style={[styles.recordTime, { color: palette.error }]}>0:15</Text>
        )}
      </View>

      <GapView gap={24} />

      {/* Quick Tips */}
      <View style={[styles.tipCard, { backgroundColor: palette.primary + '15' }]}>
        <Text style={styles.tipEmoji}>💡</Text>
        <Text style={[styles.tipText, { color: palette.text }]}>
          {t('evidence.voice.tip', 'Voice notes are automatically transcribed and searchable')}
        </Text>
      </View>

      <GapView style={{ height: 16 }} />

      {/* Recent Recordings */}
      <PowerToolSection title={t('evidence.voice.recent', 'Recent Recordings')}>
        {recentRecordings.map((recording) => (
          <A11yPressable
            key={recording.id}
            onPress={() => {
              trackEvent('evidence.voice.play', { id: recording.id });
              Alert.alert(recording.name, `Playing ${recording.duration}...`);
            }}
            accessibilityLabel={`${recording.name}, ${recording.duration}`}
            hitSlop={HIT_SLOP_8}
            style={[styles.recordingCard, { backgroundColor: palette.card }]}
          >
            <View style={[styles.playButton, { backgroundColor: palette.primary + '20' }]}>
              <Ionicons name="play" size={20} color={palette.primary} />
            </View>
            <View style={styles.recordingInfo}>
              <Text style={[styles.recordingName, { color: palette.text }]}>{recording.name}</Text>
              <Text style={[styles.recordingMeta, { color: palette.secondaryText }]}>
                {recording.duration} • {recording.date}
              </Text>
            </View>
            <Ionicons name="ellipsis-vertical" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('evidence.checklist.explore', 'Evidence Checklist')}
        icon="checkbox"
        onPress={() => navigateToTab('checklist')}
      />
    </PowerToolTabContent>
  );
}

const createVoiceStyles = (_palette: any) => StyleSheet.create({
  recordSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordHint: {
    fontSize: 14,
  },
  recordTime: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
  },
  recordingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingName: {
    fontSize: 14,
    fontWeight: '600',
  },
  recordingMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// TAB 4: CHECKLIST (Power User Mode)
// ============================================
function ChecklistTab(_props: PowerToolTabProps) {
  const { t: _t } = useTranslation();
  const palette = useAppPalette();

  const checklistCategories = [
    {
      id: 'medical',
      name: 'Medical Evidence',
      emoji: '🏥',
      items: [
        { id: 'm1', name: 'Doctor\'s letter', required: true, done: true },
        { id: 'm2', name: 'Medical records', required: true, done: true },
        { id: 'm3', name: 'Test results', required: false, done: false },
        { id: 'm4', name: 'Prescription history', required: false, done: true },
      ],
    },
    {
      id: 'legal',
      name: 'Legal Documents',
      emoji: '⚖️',
      items: [
        { id: 'l1', name: 'Denial letter', required: true, done: true },
        { id: 'l2', name: 'Appeal form', required: true, done: false },
        { id: 'l3', name: 'Supporting statements', required: false, done: false },
      ],
    },
    {
      id: 'personal',
      name: 'Personal Documentation',
      emoji: '📝',
      items: [
        { id: 'p1', name: 'Daily symptom log', required: false, done: true },
        { id: 'p2', name: 'Photos/videos', required: false, done: false },
        { id: 'p3', name: 'Impact statement', required: false, done: false },
      ],
    },
  ];

  const styles = createChecklistStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {checklistCategories.map((category) => {
        const completedCount = category.items.filter(i => i.done).length;
        const totalCount = category.items.length;
        
        return (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[styles.categoryName, { color: palette.text }]}>{category.name}</Text>
              <Text style={[styles.categoryProgress, { color: palette.secondaryText }]}>
                {completedCount}/{totalCount}
              </Text>
            </View>
            
            {category.items.map((item) => (
              <A11yPressable
                key={item.id}
                onPress={() => {
                  trackEvent('evidence.checklist.toggle', { item: item.id, done: !item.done });
                }}
                accessibilityLabel={`${item.name}, ${item.done ? 'completed' : 'not completed'}${item.required ? ', required' : ''}`}
                hitSlop={HIT_SLOP_8}
                style={[styles.checklistItem, { backgroundColor: palette.card }]}
              >
                <View style={[
                  styles.checkbox,
                  { 
                    backgroundColor: item.done ? palette.success : 'transparent',
                    borderColor: item.done ? palette.success : palette.border,
                  },
                ]}>
                  {item.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={[
                  styles.itemName, 
                  { 
                    color: palette.text,
                    textDecorationLine: item.done ? 'line-through' : 'none',
                    opacity: item.done ? 0.6 : 1,
                  },
                ]}>
                  {item.name}
                </Text>
                {item.required && (
                  <View style={[styles.requiredBadge, { backgroundColor: palette.error + '20' }]}>
                    <Text style={[styles.requiredText, { color: palette.error }]}>Required</Text>
                  </View>
                )}
              </A11yPressable>
            ))}
            
            <GapView style={{ height: 16 }} />
          </View>
        );
      })}
    </PowerToolTabContent>
  );
}

const createChecklistStyles = (_palette: any) => StyleSheet.create({
  categorySection: {
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  categoryProgress: {
    fontSize: 14,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '600',
  },
});


// ============================================
// MAIN EXPORT
// ============================================
export default function EvidenceCommandCenter() {
  const { t } = useTranslation();

  const tabs: PowerToolTab[] = [
    {
      id: 'locker',
      label: t('evidence.tabs.locker', 'Locker'),
      icon: '📁',
      component: LockerTab,
      complexity: 'simple',
      keywords: ['evidence', 'upload', 'photo', 'document', 'file'],
    },
    {
      id: 'timeline',
      label: t('evidence.tabs.timeline', 'Timeline'),
      icon: '📅',
      component: TimelineTab,
      complexity: 'standard',
      keywords: ['timeline', 'history', 'events', 'dates'],
    },
    {
      id: 'voice',
      label: t('evidence.tabs.voice', 'Voice'),
      icon: '🎙️',
      component: VoiceTab,
      complexity: 'standard',
      keywords: ['voice', 'record', 'audio', 'notes'],
    },
    {
      id: 'checklist',
      label: t('evidence.tabs.checklist', 'Checklist'),
      icon: '✅',
      component: ChecklistTab,
      complexity: 'power_user',
      badge: 'beta',
      keywords: ['checklist', 'required', 'documents'],
    },
  ];

  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('evidence.title', 'Evidence Command Center')}
        subtitle={t('evidence.subtitle', 'Organize and manage your case evidence')}
        icon="📁"
        tabs={tabs}
        defaultTab="locker"
        showSearch
        searchPlaceholder={t('evidence.search', 'Search evidence...')}
        analyticsPrefix="evidence_command"
      />
    </ResponsiveScreenWrapper>
  );
}


