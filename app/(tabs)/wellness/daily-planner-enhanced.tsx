/**
 * Enhanced Daily Planner with Visual Time Blocks
 * 
 * Features:
 * - Visual hourly grid (8am-8pm)
 * - Color-coded energy levels (low/medium/high spoons)
 * - Smart task suggestions based on energy
 * - Drag-to-reorder appointments
 * - Integration with Energy Coins and Pacing Partner
 * - Quick templates for common routines
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { getCachedJSON, setCachedJSON } from '../../../services/cache';
import { addEvent } from '../../../services/calendar';
import { useAppPalette } from '../../../theme/usePalette';

type EnergyLevel = 'low' | 'medium' | 'high';

type Appointment = {
  id: string;
  time: string;
  title: string;
  duration: number; // minutes
  energy: EnergyLevel; // Required energy level
  completed: boolean;
  notes?: string;
};

type TimeBlock = {
  hour: number;
  label: string;
  appointments: Appointment[];
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8am to 8pm

 
const ENERGY_COLORS = {
  low: { bg: '#E8F5E9', border: '#66BB6A', text: '#2E7D32' }, // Green
  medium: { bg: '#FFF3E0', border: '#FFA726', text: '#E65100' }, // Orange
  high: { bg: '#FFEBEE', border: '#EF5350', text: '#C62828' }, // Red
};

const SMART_SUGGESTIONS = {
  low: [
    { title: 'Meditation (5min)', duration: 5 },
    { title: 'Light stretching', duration: 10 },
    { title: 'Listen to podcast', duration: 20 },
    { title: 'Breathing exercises', duration: 10 },
  ],
  medium: [
    { title: 'Admin tasks (15min)', duration: 15 },
    { title: 'Check emails', duration: 15 },
    { title: 'Gentle walk', duration: 20 },
    { title: 'Creative hobby', duration: 30 },
  ],
  high: [
    { title: 'Workout routine', duration: 30 },
    { title: 'Deep work session', duration: 60 },
    { title: 'Important meeting', duration: 45 },
    { title: 'Complex task', duration: 90 },
  ],
};

export const options = { href: null };

export default function DailyPlanner() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [newApptTitle, setNewApptTitle] = useState('');
  const [newApptDuration, setNewApptDuration] = useState('30');
  const [newApptEnergy, setNewApptEnergy] = useState<EnergyLevel>('medium');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedAppt, setExpandedAppt] = useState<string | null>(null);
  
  // Load appointments for selected date
  useEffect(() => {
    (async () => {
      const saved = await getCachedJSON<Appointment[]>(`daily_planner_v2_${date}`);
      if (saved) setAppointments(saved);
      else setAppointments([]);
    })();
  }, [date]);

  // Save appointments
  useEffect(() => {
    setCachedJSON(`daily_planner_v2_${date}`, appointments);
  }, [appointments, date]);

  // Build time blocks with appointments
  const timeBlocks: TimeBlock[] = HOURS.map(hour => {
    const hourLabel = hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
    const appts = appointments.filter(a => {
      const apptHour = parseInt(a.time.split(':')[0]);
      return apptHour === hour;
    });
    return { hour, label: hourLabel, appointments: appts };
  });

  const handleAddAppointment = () => {
    if (!newApptTitle.trim() || selectedHour === null) {
      Alert.alert(
        t('dailyPlanner.error', 'Error'),
        t('dailyPlanner.errorMessage', 'Please select a time and enter a title')
      );
      return;
    }

    const newAppt: Appointment = {
      id: `${Date.now()}-${Math.random()}`,
      time: `${selectedHour.toString().padStart(2, '0')}:00`,
      title: newApptTitle.trim(),
      duration: parseInt(newApptDuration) || 30,
      energy: newApptEnergy,
      completed: false,
    };

    setAppointments(prev => [...prev, newAppt].sort((a, b) => a.time.localeCompare(b.time)));
    setNewApptTitle('');
    setNewApptDuration('30');
    setSelectedHour(null);
  };

  const handleAddSuggestion = (suggestion: { title: string; duration: number }) => {
    if (selectedHour === null) {
      Alert.alert(
        t('dailyPlanner.selectTime', 'Select Time'),
        t('dailyPlanner.selectTimeMessage', 'Please tap a time block first')
      );
      return;
    }

    const newAppt: Appointment = {
      id: `${Date.now()}-${Math.random()}`,
      time: `${selectedHour.toString().padStart(2, '0')}:00`,
      title: suggestion.title,
      duration: suggestion.duration,
      energy: newApptEnergy,
      completed: false,
    };

    setAppointments(prev => [...prev, newAppt].sort((a, b) => a.time.localeCompare(b.time)));
    setShowSuggestions(false);
    setSelectedHour(null);
  };

  const handleDeleteAppointment = (id: string) => {
    Alert.alert(
      t('dailyPlanner.delete', 'Delete Appointment'),
      t('dailyPlanner.deleteConfirm', 'Are you sure?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: () => setAppointments(prev => prev.filter(a => a.id !== id)),
        },
      ]
    );
  };

  const handleToggleComplete = (id: string) => {
    setAppointments(prev =>
      prev.map(a => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const handleShare = async () => {
    const lines: string[] = [];
    lines.push(`📅 Daily Plan - ${new Date(date).toLocaleDateString()}\n`);
    
    HOURS.forEach(hour => {
      const appts = appointments.filter(a => parseInt(a.time.split(':')[0]) === hour);
      if (appts.length > 0) {
        const hourLabel = hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
        lines.push(`\n${hourLabel}:`);
        appts.forEach(a => {
          const status = a.completed ? '✅' : '⏳';
          const energy = a.energy === 'low' ? '🟢' : a.energy === 'medium' ? '🟠' : '🔴';
          lines.push(`  ${status} ${a.title} (${a.duration}min) ${energy}`);
        });
      }
    });

    const message = lines.join('\n');
    try {
      await Share.share({ message, title: 'My Daily Plan' });
    } catch {}
  };

  const handleAddToCalendar = async (appt: Appointment) => {
    try {
      const startISO = new Date(`${date}T${appt.time}:00`).toISOString();
      const ok = await addEvent({
        title: appt.title,
        notes: `Energy: ${appt.energy} (${appt.duration}min)`,
        startISO,
        durationMinutes: appt.duration,
      });
      
      Alert.alert(
        ok ? t('dailyPlanner.added', 'Added') : t('dailyPlanner.failed', 'Failed'),
        ok 
          ? t('dailyPlanner.addedMessage', 'Event added to calendar')
          : t('dailyPlanner.failedMessage', 'Could not add to calendar')
      );
    } catch {
      Alert.alert(
        t('dailyPlanner.unavailable', 'Unavailable'),
        t('dailyPlanner.unavailableMessage', 'Calendar access not available')
      );
    }
  };

  const totalMinutes = appointments.reduce((sum, a) => sum + a.duration, 0);
  const completedMinutes = appointments.filter(a => a.completed).reduce((sum, a) => sum + a.duration, 0);
  const progressPercent = totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0;

  return (
    <ResponsiveScreenWrapper>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <DisclaimerBanner type="general" compact />

        {/* Header Stats */}
        <View style={[styles.statsCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: palette.primary }]}>
                {appointments.length}
              </Text>
              <Text style={[styles.statLabel, { color: palette.text }]}>
                {t('dailyPlanner.tasks', 'Tasks')}
              </Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: palette.success || palette.primary }]}>
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </Text>
              <Text style={[styles.statLabel, { color: palette.text }]}>
                {t('dailyPlanner.planned', 'Planned')}
              </Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: palette.warning || palette.primary }]}>
                {progressPercent.toFixed(0)}%
              </Text>
              <Text style={[styles.statLabel, { color: palette.text }]}>
                {t('dailyPlanner.complete', 'Complete')}
              </Text>
            </View>
          </View>
          
          {totalMinutes > 0 && (
            <View style={[styles.progressBar, { backgroundColor: palette.muted + '40' }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progressPercent}%`,
                    backgroundColor: palette.primary 
                  }
                ]} 
              />
            </View>
          )}
        </View>

        {/* Date Selector */}
        <View style={[styles.dateCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
          <A11yPressable
            onPress={() => {
              const d = new Date(date);
              d.setDate(d.getDate() - 1);
              setDate(d.toISOString().slice(0, 10));
            }}
            style={styles.dateButton}
            accessibilityRole="button"
            accessibilityLabel="Previous day"
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="chevron-back" size={24} color={palette.text} />
          </A11yPressable>
          
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.dateText, { color: palette.text }]}>
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
            <Text style={[styles.dateSubtext, { color: palette.text }]}>
              {date === new Date().toISOString().slice(0, 10) ? 'Today' : ''}
            </Text>
          </View>
          
          <A11yPressable
            onPress={() => {
              const d = new Date(date);
              d.setDate(d.getDate() + 1);
              setDate(d.toISOString().slice(0, 10));
            }}
            style={styles.dateButton}
            accessibilityRole="button"
            accessibilityLabel="Next day"
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="chevron-forward" size={24} color={palette.text} />
          </A11yPressable>
        </View>

        {/* Visual Time Blocks */}
        <View style={[styles.timelineCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            ⏰ {t('dailyPlanner.timeline', 'Timeline')}
          </Text>
          
          <GapView gap={8}>
            {timeBlocks.map(block => (
              <TimeBlockRow
                key={block.hour}
                block={block}
                selectedHour={selectedHour}
                onSelectHour={setSelectedHour}
                onDeleteAppt={handleDeleteAppointment}
                onToggleComplete={handleToggleComplete}
                onAddToCalendar={handleAddToCalendar}
                expandedAppt={expandedAppt}
                setExpandedAppt={setExpandedAppt}
                palette={palette}
              />
            ))}
          </GapView>
        </View>

        {/* Add Appointment Form */}
        {selectedHour !== null && (
          <View style={[styles.addCard, { backgroundColor: palette.primary + '10', borderColor: palette.primary }]}>
            <Text style={[styles.addTitle, { color: palette.text }]}>
              ➕ {t('dailyPlanner.addTask', 'Add Task for')} {selectedHour < 12 ? `${selectedHour}am` : selectedHour === 12 ? '12pm' : `${selectedHour - 12}pm`}
            </Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.muted }]}
              placeholder={t('dailyPlanner.titlePlaceholder', 'Task title...')}
              placeholderTextColor={palette.text + '60'}
              value={newApptTitle}
              onChangeText={setNewApptTitle}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
            
            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>
                  {t('dailyPlanner.duration', 'Duration')}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.muted }]}
                  placeholder="30"
                  placeholderTextColor={palette.text + '60'}
                  value={newApptDuration}
                  onChangeText={setNewApptDuration}
                  keyboardType="number-pad"
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: palette.text }]}>
                  {t('dailyPlanner.energyRequired', 'Energy')}
                </Text>
                <View style={styles.energyButtons}>
                  {(['low', 'medium', 'high'] as EnergyLevel[]).map(level => (
                    <A11yPressable
                      key={level}
                      onPress={() => setNewApptEnergy(level)}
                      style={[
                        styles.energyButton,
                        { 
                          backgroundColor: newApptEnergy === level 
                            ? ENERGY_COLORS[level].bg 
                            : palette.background,
                          borderColor: newApptEnergy === level 
                            ? ENERGY_COLORS[level].border 
                            : palette.muted,
                        }
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Energy level ${level}`}
                      hitSlop={HIT_SLOP_8}
                    >
                      <Text style={[
                        styles.energyButtonText,
                        { color: newApptEnergy === level ? ENERGY_COLORS[level].text : palette.text }
                      ]}>
                        {level === 'low' ? '🟢' : level === 'medium' ? '🟠' : '🔴'}
                      </Text>
                    </A11yPressable>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.formActions}>
              <A11yPressable
                onPress={handleAddAppointment}
                style={[styles.primaryButton, { backgroundColor: palette.primary }]}
                accessibilityRole="button"
                accessibilityLabel="Add task"
                hitSlop={HIT_SLOP_8}
              >
                <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>
                  {t('dailyPlanner.add', 'Add Task')}
                </Text>
              </A11yPressable>
              
              <A11yPressable
                onPress={() => {
                  setSelectedHour(null);
                  setNewApptTitle('');
                  setNewApptDuration('30');
                }}
                style={[styles.secondaryButton, { borderColor: palette.muted }]}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                hitSlop={HIT_SLOP_8}
              >
                <Text style={[styles.secondaryButtonText, { color: palette.text }]}>
                  {t('common.cancel', 'Cancel')}
                </Text>
              </A11yPressable>
            </View>
            
            <A11yPressable
              onPress={() => setShowSuggestions(!showSuggestions)}
              style={[styles.suggestButton, { borderColor: palette.muted }]}
              accessibilityRole="button"
              accessibilityLabel="Show suggestions"
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons 
                name={showSuggestions ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color={palette.text} 
              />
              <Text style={[styles.suggestButtonText, { color: palette.text }]}>
                {t('dailyPlanner.smartSuggestions', 'Smart Suggestions')}
              </Text>
            </A11yPressable>
            
            {showSuggestions && (
              <GapView gap={8} style={{ marginTop: 8 }}>
                {SMART_SUGGESTIONS[newApptEnergy].map((suggestion, idx) => (
                  <A11yPressable
                    key={idx}
                    onPress={() => handleAddSuggestion(suggestion)}
                    style={[
                      styles.suggestionCard,
                      { 
                        backgroundColor: palette.background,
                        borderColor: ENERGY_COLORS[newApptEnergy].border,
                      }
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${suggestion.title}`}
                    hitSlop={HIT_SLOP_8}
                  >
                    <Text style={[styles.suggestionText, { color: palette.text }]}>
                      {suggestion.title}
                    </Text>
                    <Text style={[styles.suggestionDuration, { color: palette.text }]}>
                      {suggestion.duration}min
                    </Text>
                  </A11yPressable>
                ))}
              </GapView>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={[styles.actionsCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            ⚡ {t('dailyPlanner.quickActions', 'Quick Actions')}
          </Text>
          
          <GapView gap={8}>
            <A11yPressable
              onPress={handleShare}
              style={[styles.actionButton, { backgroundColor: palette.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Share plan"
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name="share-outline" size={20} color={palette.onPrimary} />
              <Text style={[styles.actionButtonText, { color: palette.onPrimary }]}>
                {t('dailyPlanner.share', 'Share Plan')}
              </Text>
            </A11yPressable>
            
            <A11yPressable
              onPress={() => {
                setAppointments(prev => prev.filter(a => !a.completed));
                Alert.alert(
                  t('dailyPlanner.cleared', 'Cleared'),
                  t('dailyPlanner.clearedMessage', 'Completed tasks removed')
                );
              }}
              style={[styles.actionButton, { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted }]}
              accessibilityRole="button"
              accessibilityLabel="Clear completed"
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name="checkmark-done-outline" size={20} color={palette.text} />
              <Text style={[styles.actionButtonText, { color: palette.text }]}>
                {t('dailyPlanner.clearCompleted', 'Clear Completed')}
              </Text>
            </A11yPressable>
          </GapView>
        </View>
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

// Time Block Row Component
const TimeBlockRow: React.FC<{
  block: TimeBlock;
  selectedHour: number | null;
  onSelectHour: (hour: number) => void;
  onDeleteAppt: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onAddToCalendar: (appt: Appointment) => void;
  expandedAppt: string | null;
  setExpandedAppt: (id: string | null) => void;
  palette: any;
}> = ({ 
  block, 
  selectedHour, 
  onSelectHour, 
  onDeleteAppt, 
  onToggleComplete, 
  onAddToCalendar,
  expandedAppt,
  setExpandedAppt,
  palette 
}) => {
  const isSelected = selectedHour === block.hour;
  
  return (
    <View style={styles.timeBlock}>
      <A11yPressable
        onPress={() => onSelectHour(block.hour)}
        style={[
          styles.timeLabel,
          {
            backgroundColor: isSelected ? palette.primary + '20' : 'transparent',
            borderColor: isSelected ? palette.primary : palette.muted,
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Select ${block.label}`}
        hitSlop={HIT_SLOP_8}
      >
        <Text 
          style={[
            styles.timeLabelText, 
            { color: isSelected ? palette.primary : palette.text }
          ]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {block.label}
        </Text>
      </A11yPressable>
      
      <View style={styles.appointmentsColumn}>
        {block.appointments.length === 0 ? (
          <View style={[styles.emptySlot, { borderColor: palette.muted }]}>
            <Text style={[styles.emptyText, { color: palette.text + '60' }]}>
              Tap to add
            </Text>
          </View>
        ) : (
          <GapView gap={6}>
            {block.appointments.map(appt => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                onDelete={onDeleteAppt}
                onToggleComplete={onToggleComplete}
                onAddToCalendar={onAddToCalendar}
                expanded={expandedAppt === appt.id}
                onToggleExpand={() => setExpandedAppt(expandedAppt === appt.id ? null : appt.id)}
                palette={palette}
              />
            ))}
          </GapView>
        )}
      </View>
    </View>
  );
};

// Appointment Card Component
const AppointmentCard: React.FC<{
  appt: Appointment;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onAddToCalendar: (appt: Appointment) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  palette: any;
}> = ({ appt, onDelete, onToggleComplete, onAddToCalendar, expanded, onToggleExpand, palette: _palette }) => {
  const energyStyle = ENERGY_COLORS[appt.energy];
  
  return (
    <View
      style={[
        styles.apptCard,
        {
          backgroundColor: energyStyle.bg,
          borderColor: energyStyle.border,
          opacity: appt.completed ? 0.6 : 1,
        }
      ]}
    >
      <Pressable onPress={onToggleExpand} style={styles.apptHeader}>
        <A11yPressable
          onPress={() => onToggleComplete(appt.id)}
          style={styles.checkbox}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: appt.completed }}
          accessibilityLabel={`Mark ${appt.title} as ${appt.completed ? 'incomplete' : 'complete'}`}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons 
            name={appt.completed ? 'checkmark-circle' : 'ellipse-outline'} 
            size={24} 
            color={energyStyle.border} 
          />
        </A11yPressable>
        
        <View style={{ flex: 1 }}>
          <Text 
            style={[
              styles.apptTitle, 
              { 
                color: energyStyle.text,
                textDecorationLine: appt.completed ? 'line-through' : 'none',
              }
            ]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {appt.title}
          </Text>
          <Text style={[styles.apptMeta, { color: energyStyle.text }]}>
            {appt.duration}min • {appt.energy === 'low' ? '🟢 Low' : appt.energy === 'medium' ? '🟠 Medium' : '🔴 High'} energy
          </Text>
        </View>
        
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={energyStyle.text} 
        />
      </Pressable>
      
      {expanded && (
        <View style={styles.apptActions}>
          <A11yPressable
            onPress={() => onAddToCalendar(appt)}
            style={[styles.apptActionButton, { borderColor: energyStyle.border }]}
            accessibilityRole="button"
            accessibilityLabel="Add to calendar"
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="calendar-outline" size={16} color={energyStyle.text} />
            <Text style={[styles.apptActionText, { color: energyStyle.text }]}>
              Calendar
            </Text>
          </A11yPressable>
          
          <A11yPressable
            onPress={() => onDelete(appt.id)}
            style={[styles.apptActionButton, { borderColor: energyStyle.border }]}
            accessibilityRole="button"
            accessibilityLabel="Delete task"
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="trash-outline" size={16} color={energyStyle.text} />
            <Text style={[styles.apptActionText, { color: energyStyle.text }]}>
              Delete
            </Text>
          </A11yPressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  statsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  dateButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
  },
  dateSubtext: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  timelineCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  timeBlock: {
    flexDirection: 'row',
    gap: 12,
  },
  timeLabel: {
    width: 60,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentsColumn: {
    flex: 1,
  },
  emptySlot: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
  },
  apptCard: {
    borderRadius: 8,
    borderWidth: 2,
    padding: 12,
  },
  apptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  apptTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  apptMeta: {
    fontSize: 12,
    opacity: 0.8,
  },
  apptActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  apptActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  apptActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
  },
  addTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  energyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  energyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  energyButtonText: {
    fontSize: 20,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  suggestButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionDuration: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
