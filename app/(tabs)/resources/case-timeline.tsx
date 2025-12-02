/**
 * Case Timeline Tracker - Enhanced Visual Timeline Builder
 * 
 * Comprehensive features:
 * - Visual timeline with categories
 * - Event type categorization (medical, legal, administrative, deadline)
 * - Reminder/deadline alerts
 * - Attachments per event
 * - Export to PDF/DOC formats
 * - Filter and search capabilities
 * - Statistics and case duration tracking
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import { DyslexiaText } from "../../../components/DyslexiaText";
import { GapView } from "../../../components/GapView";
import ResponsiveScreenWrapper from "../../../components/ResponsiveScreenWrapper";
import { HIT_SLOP_8 } from "../../../constants/A11Y";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useAppPalette } from "../../../theme/usePalette";
import { announce } from "../../../utils/announce";

let AsyncStorage: any;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

const TIMELINE_KEY = 'caseTimeline:data:v2';

type EventCategory = 'medical' | 'legal' | 'administrative' | 'deadline' | 'communication' | 'financial' | 'other';
type EventImportance = 'low' | 'medium' | 'high' | 'critical';

interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  details?: string;
  category: EventCategory;
  importance: EventImportance;
  location?: string;
  contacts?: string[];
  attachments?: { name: string; uri: string }[];
  reminderDays?: number;
  outcome?: string;
  followUpDate?: string;
  tags?: string[];
  createdAt: string;
}

interface TimelineStats {
  totalEvents: number;
  daysSinceStart: number;
  byCategory: Record<EventCategory, number>;
  upcomingDeadlines: number;
  recentActivity: number;
}

/* eslint-disable no-restricted-syntax -- Config objects with hex colors for dynamic styling */
const CATEGORY_CONFIG: Record<EventCategory, { icon: string; label: string; color: string }> = {
  medical: { icon: '🏥', label: 'Medical', color: '#10b981' },
  legal: { icon: '⚖️', label: 'Legal', color: '#8b5cf6' },
  administrative: { icon: '📋', label: 'Administrative', color: '#3b82f6' },
  deadline: { icon: '⏰', label: 'Deadline', color: '#ef4444' },
  communication: { icon: '📞', label: 'Communication', color: '#f59e0b' },
  financial: { icon: '💰', label: 'Financial', color: '#06b6d4' },
  other: { icon: '📌', label: 'Other', color: '#6b7280' },
};

const IMPORTANCE_CONFIG: Record<EventImportance, { label: string; color: string }> = {
  low: { label: 'Low', color: '#6b7280' },
  medium: { label: 'Medium', color: '#3b82f6' },
  high: { label: 'High', color: '#f59e0b' },
  critical: { label: 'Critical', color: '#ef4444' },
};
/* eslint-enable no-restricted-syntax */

const QUICK_EVENTS = [
  { title: 'Medical Appointment', category: 'medical' as EventCategory },
  { title: 'Form Submitted', category: 'administrative' as EventCategory },
  { title: 'Phone Call', category: 'communication' as EventCategory },
  { title: 'Deadline', category: 'deadline' as EventCategory },
  { title: 'Hearing Date', category: 'legal' as EventCategory },
  { title: 'Payment Received', category: 'financial' as EventCategory },
  { title: 'Letter Sent', category: 'communication' as EventCategory },
  { title: 'Decision Received', category: 'legal' as EventCategory },
];

export default function CaseTimelineTracker() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = useMemo(() => createStyles(palette), [palette]);
  const titleRef = React.useRef<Text>(null);
  const router = useRouter();
  
  useAnnounceOnMount(t('templates.timeline.title','Case Timeline Tracker'));
  useFocusOnRefOnMount(titleRef);

  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [filter, setFilter] = useState<EventCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);

  // Form state
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTitle, setNewTitle] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newCategory, setNewCategory] = useState<EventCategory>('administrative');
  const [newImportance, setNewImportance] = useState<EventImportance>('medium');
  const [newLocation, setNewLocation] = useState('');
  const [newContacts, setNewContacts] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [newFollowUp, setNewFollowUp] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const raw = await AsyncStorage?.getItem?.(TIMELINE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  };

  const saveEntries = useCallback(async (data: TimelineEntry[]) => {
    try {
      await AsyncStorage?.setItem?.(TIMELINE_KEY, JSON.stringify(data));
      setEntries(data);
    } catch {}
  }, []);

  const addEntry = () => {
    if (!newTitle.trim()) {
      Alert.alert(t('templates.timeline.missingTitle','Missing title'), t('templates.timeline.missingTitleBody','Please enter a title for this event.'));
      return;
    }
    const entry: TimelineEntry = {
      id: `tl_${Date.now()}`,
      date: newDate,
      title: newTitle.trim(),
      details: newDetails.trim() || undefined,
      category: newCategory,
      importance: newImportance,
      location: newLocation.trim() || undefined,
      contacts: newContacts ? newContacts.split(',').map(c => c.trim()).filter(Boolean) : undefined,
      outcome: newOutcome.trim() || undefined,
      followUpDate: newFollowUp || undefined,
      createdAt: new Date().toISOString(),
    };
    const updated = [...entries, entry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    saveEntries(updated);
    resetForm();
    setShowAddModal(false);
    announce(t('templates.timeline.entryAdded','Timeline entry added'));
  };

  const updateEntry = () => {
    if (!editingEntry || !newTitle.trim()) return;
    const updated = entries.map(e => {
      if (e.id === editingEntry.id) {
        return {
          ...e,
          date: newDate,
          title: newTitle.trim(),
          details: newDetails.trim() || undefined,
          category: newCategory,
          importance: newImportance,
          location: newLocation.trim() || undefined,
          contacts: newContacts ? newContacts.split(',').map(c => c.trim()).filter(Boolean) : undefined,
          outcome: newOutcome.trim() || undefined,
          followUpDate: newFollowUp || undefined,
        };
      }
      return e;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    saveEntries(updated);
    resetForm();
    setEditingEntry(null);
    setShowAddModal(false);
    announce('Entry updated');
  };

  const deleteEntry = (id: string) => {
    Alert.alert(
      t('templates.timeline.deleteTitle', 'Delete Entry?'),
      t('templates.timeline.deleteBody', 'This action cannot be undone.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: () => {
            const updated = entries.filter(e => e.id !== id);
            saveEntries(updated);
            announce('Entry deleted');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setNewDate(new Date().toISOString().slice(0, 10));
    setNewTitle('');
    setNewDetails('');
    setNewCategory('administrative');
    setNewImportance('medium');
    setNewLocation('');
    setNewContacts('');
    setNewOutcome('');
    setNewFollowUp('');
    setEditingEntry(null);
  };

  const openEditModal = (entry: TimelineEntry) => {
    setEditingEntry(entry);
    setNewDate(entry.date);
    setNewTitle(entry.title);
    setNewDetails(entry.details || '');
    setNewCategory(entry.category);
    setNewImportance(entry.importance);
    setNewLocation(entry.location || '');
    setNewContacts(entry.contacts?.join(', ') || '');
    setNewOutcome(entry.outcome || '');
    setNewFollowUp(entry.followUpDate || '');
    setShowAddModal(true);
  };

  const quickAdd = (preset: typeof QUICK_EVENTS[0]) => {
    setNewTitle(preset.title);
    setNewCategory(preset.category);
    setShowAddModal(true);
  };

  // Filtered and searched entries
  const filteredEntries = useMemo(() => {
    let result = entries;
    if (filter !== 'all') {
      result = result.filter(e => e.category === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) ||
        e.details?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [entries, filter, searchQuery]);

  // Statistics
  const stats = useMemo((): TimelineStats => {
    const byCategory = Object.fromEntries(
      Object.keys(CATEGORY_CONFIG).map(cat => [cat, 0])
    ) as Record<EventCategory, number>;
    
    entries.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    });

    const dates = entries.map(e => new Date(e.date).getTime());
    const earliest = dates.length ? Math.min(...dates) : Date.now();
    const daysSinceStart = Math.ceil((Date.now() - earliest) / (1000 * 60 * 60 * 24));

    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const recentActivity = entries.filter(e => e.date >= weekAgo && e.date <= today).length;

    const upcomingDeadlines = entries.filter(e => 
      e.category === 'deadline' && e.date >= today
    ).length;

    return {
      totalEvents: entries.length,
      daysSinceStart,
      byCategory,
      upcomingDeadlines,
      recentActivity,
    };
  }, [entries]);

  const buildPlainText = () => {
    return entries
      .slice()
      .reverse()
      .map(e => {
        const cat = CATEGORY_CONFIG[e.category];
        let text = `${e.date} — ${cat.icon} [${cat.label}] ${e.title}`;
        if (e.details) text += `\n   Details: ${e.details}`;
        if (e.location) text += `\n   Location: ${e.location}`;
        if (e.outcome) text += `\n   Outcome: ${e.outcome}`;
        return text;
      })
      .join('\n\n');
  };

  const copyAll = async () => {
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(buildPlainText());
      Alert.alert(t('templates.timeline.copied','Copied'), t('templates.timeline.copiedBody','Timeline copied to clipboard.'));
    } catch {
      Alert.alert(t('templates.timeline.copyFailed','Copy failed'));
    }
  };

  const shareAll = async () => {
    try {
      await Share.share({ message: buildPlainText(), title: t('templates.timeline.shareTitle','Case Timeline') });
    } catch {}
  };

  const exportPDF = async () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #2563eb; }
          .stats { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .event { border-left: 4px solid #e5e7eb; padding: 12px 16px; margin: 12px 0; background: #fafafa; }
          .event.medical { border-color: #10b981; }
          .event.legal { border-color: #8b5cf6; }
          .event.administrative { border-color: #3b82f6; }
          .event.deadline { border-color: #ef4444; }
          .event.communication { border-color: #f59e0b; }
          .event.financial { border-color: #06b6d4; }
          .date { color: #6b7280; font-size: 13px; }
          .title { font-weight: 600; font-size: 16px; margin: 4px 0; }
          .category { font-size: 12px; color: #fff; padding: 2px 8px; border-radius: 4px; display: inline-block; }
          .details { color: #374151; margin-top: 8px; }
          .meta { font-size: 12px; color: #6b7280; margin-top: 6px; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>📋 Case Timeline</h1>
        <div class="stats">
          <strong>Summary:</strong> ${stats.totalEvents} events over ${stats.daysSinceStart} days<br>
          <strong>Upcoming Deadlines:</strong> ${stats.upcomingDeadlines}
        </div>
        ${entries.map(e => {
          const cat = CATEGORY_CONFIG[e.category];
          return `
            <div class="event ${e.category}">
              <div class="date">${e.date}</div>
              <div class="title">${e.title}</div>
              <span class="category" style="background:${cat.color}">${cat.icon} ${cat.label}</span>
              ${e.details ? `<div class="details">${e.details}</div>` : ''}
              ${e.location ? `<div class="meta">📍 ${e.location}</div>` : ''}
              ${e.outcome ? `<div class="meta">✅ Outcome: ${e.outcome}</div>` : ''}
            </div>
          `;
        }).join('')}
        <div class="footer">Generated with 3MPWR App - Case Timeline</div>
      </body>
      </html>
    `;
    
    try {
      const { printAsync } = await import('expo-print');
      await printAsync({ html });
    } catch {
      Alert.alert(t('templates.timeline.exportFailed','Export failed'));
    }
  };

  const reset = () => {
    Alert.alert(
      t('templates.timeline.resetTitle','Reset timeline?'),
      t('templates.timeline.resetBody','This will remove all entries.'),
      [
        { text: t('common.cancel','Cancel'), style: 'cancel' },
        {
          text: t('common.ok','OK'),
          style: 'destructive',
          onPress: () => {
            saveEntries([]);
            announce('Timeline cleared');
          },
        },
      ]
    );
  };

  return (
    <ResponsiveScreenWrapper testID="case-timeline-screen">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={s.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          📋 {t('templates.timeline.title','Case Timeline Tracker')}
        </Text>
        
        <DyslexiaText style={s.subtitle}>
          {t('templates.timeline.subtitle','Track every event, decision, and deadline in your case. Build a complete history for appeals and meetings.')}
        </DyslexiaText>
        
        <DisclaimerBanner type="legal" compact />

        {/* Stats Summary */}
        {entries.length > 0 && (
          <Pressable onPress={() => setShowStatsModal(true)} style={s.statsCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={s.statsTitle}>📊 Case Overview</Text>
                <Text style={s.statsText}>{stats.totalEvents} events • {stats.daysSinceStart} days</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {stats.upcomingDeadlines > 0 && (
                  <Text style={[s.statsAlert, { color: palette.error }]}>
                    ⚠️ {stats.upcomingDeadlines} upcoming deadline{stats.upcomingDeadlines > 1 ? 's' : ''}
                  </Text>
                )}
                <Text style={s.statsLink}>View Details →</Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* Quick Add Buttons */}
        <Text style={s.sectionTitle}>⚡ Quick Add</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
            {QUICK_EVENTS.map((preset, idx) => (
              <Pressable
                key={idx}
                onPress={() => quickAdd(preset)}
                style={[s.quickChip, { borderColor: CATEGORY_CONFIG[preset.category].color }]}
              >
                <Text style={s.quickChipText}>
                  {CATEGORY_CONFIG[preset.category].icon} {preset.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Main Add Button */}
        <A11yPressable 
          onPress={() => { resetForm(); setShowAddModal(true); }} 
          style={s.primaryButton}
        >
          <Ionicons name="add-circle-outline" size={20} color={palette.onPrimary} />
          <Text style={s.primaryButtonText}>{t('templates.timeline.addEntry','Add Entry')}</Text>
        </A11yPressable>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => setFilter('all')}
              style={[s.filterTab, filter === 'all' && s.filterTabActive]}
            >
              <Text style={[s.filterTabText, filter === 'all' && s.filterTabTextActive]}>
                All ({entries.length})
              </Text>
            </Pressable>
            {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map(cat => {
              const count = entries.filter(e => e.category === cat).length;
              if (count === 0) return null;
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <Pressable
                  key={cat}
                  onPress={() => setFilter(cat)}
                  style={[s.filterTab, filter === cat && { backgroundColor: cfg.color }]}
                >
                  <Text style={[s.filterTabText, filter === cat && s.filterTabTextActive]}>
                    {cfg.icon} {cfg.label} ({count})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Search */}
        <View style={s.searchContainer}>
          <Ionicons name="search-outline" size={20} color={palette.muted} />
          <TextInput
            placeholder="Search events..."
            placeholderTextColor={palette.text + '77'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={s.searchInput}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={HIT_SLOP_8}>
              <Ionicons name="close-circle" size={20} color={palette.muted} />
            </Pressable>
          ) : null}
        </View>

        {/* Timeline */}
        {filteredEntries.length > 0 ? (
          <View style={{ marginTop: 16 }}>
            {filteredEntries.map((entry, index) => {
              const cat = CATEGORY_CONFIG[entry.category];
              const imp = IMPORTANCE_CONFIG[entry.importance];
              return (
                <View key={entry.id} style={{ flexDirection: 'row' }}>
                  {/* Timeline Line */}
                  <View style={{ width: 24, alignItems: 'center' }}>
                    <View style={[s.timelineDot, { backgroundColor: cat.color }]} />
                    {index < filteredEntries.length - 1 && (
                      <View style={s.timelineLine} />
                    )}
                  </View>
                  
                  {/* Event Card */}
                  <View style={[s.eventCard, { flex: 1, marginBottom: 12 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.eventDate}>{entry.date}</Text>
                        <Text style={s.eventTitle}>{entry.title}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        <Pressable onPress={() => openEditModal(entry)} hitSlop={HIT_SLOP_8}>
                          <Ionicons name="pencil-outline" size={18} color={palette.primary} />
                        </Pressable>
                        <Pressable onPress={() => deleteEntry(entry.id)} hitSlop={HIT_SLOP_8}>
                          <Ionicons name="trash-outline" size={18} color={palette.error} />
                        </Pressable>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      <View style={[s.categoryBadge, { backgroundColor: cat.color }]}>
                        <Text style={s.categoryBadgeText}>{cat.icon} {cat.label}</Text>
                      </View>
                      {entry.importance !== 'medium' && (
                        <View style={[s.importanceBadge, { backgroundColor: imp.color + '20', borderColor: imp.color }]}>
                          <Text style={[s.importanceBadgeText, { color: imp.color }]}>{imp.label}</Text>
                        </View>
                      )}
                    </View>
                    
                    {entry.details && (
                      <Text style={s.eventDetails}>{entry.details}</Text>
                    )}
                    
                    {entry.location && (
                      <Text style={s.eventMeta}>📍 {entry.location}</Text>
                    )}
                    
                    {entry.contacts?.length ? (
                      <Text style={s.eventMeta}>👤 {entry.contacts.join(', ')}</Text>
                    ) : null}
                    
                    {entry.outcome && (
                      <View style={s.outcomeBox}>
                        <Text style={s.outcomeText}>✅ Outcome: {entry.outcome}</Text>
                      </View>
                    )}
                    
                    {entry.followUpDate && (
                      <Text style={[s.eventMeta, { color: palette.warning }]}>
                        📅 Follow-up: {entry.followUpDate}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={s.emptyState}>
            <MaterialCommunityIcons name="timeline-clock-outline" size={48} color={palette.muted} />
            <Text style={s.emptyText}>
              {searchQuery || filter !== 'all'
                ? t('templates.timeline.noResults', 'No events match your search or filter.')
                : t('templates.timeline.noEntries', 'Start building your case timeline. Add your first event to track your journey.')}
            </Text>
          </View>
        )}

        {/* Export Actions */}
        {entries.length > 0 && (
          <View style={{ marginTop: 24, gap: 12 }}>
            <Text style={s.sectionTitle}>📤 Export & Share</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <A11yPressable onPress={exportPDF} style={s.exportBtn}>
                <MaterialCommunityIcons name="file-pdf-box" size={18} color={palette.primary} />
                <Text style={s.exportBtnText}>PDF</Text>
              </A11yPressable>
              <A11yPressable onPress={copyAll} style={s.exportBtn}>
                <Ionicons name="copy-outline" size={18} color={palette.primary} />
                <Text style={s.exportBtnText}>Copy</Text>
              </A11yPressable>
              <A11yPressable onPress={shareAll} style={s.exportBtn}>
                <Ionicons name="share-outline" size={18} color={palette.primary} />
                <Text style={s.exportBtnText}>Share</Text>
              </A11yPressable>
              <A11yPressable onPress={reset} style={[s.exportBtn, { borderColor: palette.error }]}>
                <Ionicons name="trash-outline" size={18} color={palette.error} />
                <Text style={[s.exportBtnText, { color: palette.error }]}>Reset</Text>
              </A11yPressable>
            </View>
          </View>
        )}

        {/* Quick Links */}
        <GapView gap={8} style={{ marginTop: 24 }}>
          <A11yPressable 
            onPress={() => router.push("/(tabs)/resources/deadlines" as any)} 
            style={s.linkButton}
          >
            <MaterialCommunityIcons name="calendar-clock" size={20} color={palette.primary} />
            <Text style={s.linkButtonText}>Deadline Calculator</Text>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </A11yPressable>
          <A11yPressable 
            onPress={() => router.push("/(tabs)/resources/evidence-locker" as any)} 
            style={s.linkButton}
          >
            <MaterialCommunityIcons name="folder-lock" size={20} color={palette.primary} />
            <Text style={s.linkButtonText}>Evidence Locker</Text>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </A11yPressable>
        </GapView>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: palette.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={s.modalTitle}>{editingEntry ? 'Edit Event' : 'Add Event'}</Text>
              <Pressable onPress={() => { setShowAddModal(false); resetForm(); }} hitSlop={HIT_SLOP_8}>
                <Ionicons name="close-circle" size={28} color={palette.muted} />
              </Pressable>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.formLabel}>Date</Text>
              <TextInput
                value={newDate}
                onChangeText={setNewDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={palette.text + '77'}
                style={s.formInput}
              />
              
              <Text style={s.formLabel}>Title *</Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Event title"
                placeholderTextColor={palette.text + '77'}
                style={s.formInput}
              />
              
              <Text style={s.formLabel}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map(cat => {
                  const cfg = CATEGORY_CONFIG[cat];
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setNewCategory(cat)}
                      style={[s.catChip, newCategory === cat && { backgroundColor: cfg.color }]}
                    >
                      <Text style={[s.catChipText, newCategory === cat && { color: palette.onPrimary }]}>
                        {cfg.icon} {cfg.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              
              <Text style={s.formLabel}>Importance</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {(Object.keys(IMPORTANCE_CONFIG) as EventImportance[]).map(imp => {
                  const cfg = IMPORTANCE_CONFIG[imp];
                  return (
                    <Pressable
                      key={imp}
                      onPress={() => setNewImportance(imp)}
                      style={[s.impChip, newImportance === imp && { backgroundColor: cfg.color }]}
                    >
                      <Text style={[s.impChipText, newImportance === imp && { color: palette.onPrimary }]}>
                        {cfg.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              
              <Text style={s.formLabel}>Details</Text>
              <TextInput
                value={newDetails}
                onChangeText={setNewDetails}
                placeholder="Additional details..."
                placeholderTextColor={palette.text + '77'}
                multiline
                numberOfLines={3}
                style={[s.formInput, { minHeight: 80, textAlignVertical: 'top' }]}
              />
              
              <Text style={s.formLabel}>Location (optional)</Text>
              <TextInput
                value={newLocation}
                onChangeText={setNewLocation}
                placeholder="Where did this happen?"
                placeholderTextColor={palette.text + '77'}
                style={s.formInput}
              />
              
              <Text style={s.formLabel}>Contacts (optional, comma-separated)</Text>
              <TextInput
                value={newContacts}
                onChangeText={setNewContacts}
                placeholder="Dr. Smith, Case Worker Jane"
                placeholderTextColor={palette.text + '77'}
                style={s.formInput}
              />
              
              <Text style={s.formLabel}>Outcome (optional)</Text>
              <TextInput
                value={newOutcome}
                onChangeText={setNewOutcome}
                placeholder="What was the result?"
                placeholderTextColor={palette.text + '77'}
                style={s.formInput}
              />
              
              <Text style={s.formLabel}>Follow-up Date (optional)</Text>
              <TextInput
                value={newFollowUp}
                onChangeText={setNewFollowUp}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={palette.text + '77'}
                style={s.formInput}
              />
              
              <A11yPressable 
                onPress={editingEntry ? updateEntry : addEntry} 
                style={[s.primaryButton, { marginTop: 16, marginBottom: 20 }]}
              >
                <Text style={s.primaryButtonText}>
                  {editingEntry ? 'Update Event' : 'Add Event'}
                </Text>
              </A11yPressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Stats Modal */}
      <Modal visible={showStatsModal} transparent animationType="fade" onRequestClose={() => setShowStatsModal(false)}>
        <Pressable 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}
          onPress={() => setShowStatsModal(false)}
        >
          <View style={{ backgroundColor: palette.surface, borderRadius: 16, padding: 20 }}>
            <Text style={s.modalTitle}>📊 Case Statistics</Text>
            
            <View style={{ marginTop: 16 }}>
              <View style={s.statRow}>
                <Text style={s.statLabel}>Total Events</Text>
                <Text style={s.statValue}>{stats.totalEvents}</Text>
              </View>
              <View style={s.statRow}>
                <Text style={s.statLabel}>Days Since Start</Text>
                <Text style={s.statValue}>{stats.daysSinceStart}</Text>
              </View>
              <View style={s.statRow}>
                <Text style={s.statLabel}>Recent Activity (7 days)</Text>
                <Text style={s.statValue}>{stats.recentActivity}</Text>
              </View>
              <View style={s.statRow}>
                <Text style={s.statLabel}>Upcoming Deadlines</Text>
                <Text style={[s.statValue, stats.upcomingDeadlines > 0 && { color: palette.error }]}>
                  {stats.upcomingDeadlines}
                </Text>
              </View>
            </View>
            
            <Text style={[s.formLabel, { marginTop: 16 }]}>By Category</Text>
            {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map(cat => {
              const count = stats.byCategory[cat];
              if (count === 0) return null;
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <View key={cat} style={s.statRow}>
                  <Text style={s.statLabel}>{cfg.icon} {cfg.label}</Text>
                  <Text style={s.statValue}>{count}</Text>
                </View>
              );
            })}
            
            <A11yPressable onPress={() => setShowStatsModal(false)} style={[s.primaryButton, { marginTop: 20 }]}>
              <Text style={s.primaryButtonText}>Close</Text>
            </A11yPressable>
          </View>
        </Pressable>
      </Modal>
    </ResponsiveScreenWrapper>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    title: { fontSize: 24, fontWeight: '700', color: palette.text, marginBottom: 8 },
    subtitle: { fontSize: 15, color: palette.text, opacity: 0.9, marginBottom: 12, lineHeight: 22 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 12 },
    statsCard: { backgroundColor: palette.surface, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: palette.muted },
    statsTitle: { fontSize: 16, fontWeight: '700', color: palette.text },
    statsText: { fontSize: 14, color: palette.textSecondary, marginTop: 4 },
    statsAlert: { fontSize: 13, fontWeight: '600' },
    statsLink: { fontSize: 13, color: palette.primary, marginTop: 4 },
    quickChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: palette.surface, borderWidth: 1 },
    quickChipText: { fontSize: 13, color: palette.text },
    primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primary, padding: 16, borderRadius: 12, gap: 8, marginTop: 16 },
    primaryButtonText: { color: palette.onPrimary, fontSize: 16, fontWeight: '700' },
    filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    filterTabActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    filterTabText: { fontSize: 13, fontWeight: '600', color: palette.text },
    filterTabTextActive: { color: palette.onPrimary },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, borderRadius: 12, padding: 12, marginTop: 16, gap: 8, borderWidth: 1, borderColor: palette.muted },
    searchInput: { flex: 1, color: palette.text, fontSize: 15 },
    timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
    timelineLine: { width: 2, flex: 1, backgroundColor: palette.muted + '50', marginVertical: 4 },
    eventCard: { backgroundColor: palette.surface, borderRadius: 12, padding: 14, marginLeft: 12, borderWidth: 1, borderColor: palette.muted },
    eventDate: { fontSize: 12, color: palette.textSecondary },
    eventTitle: { fontSize: 16, fontWeight: '600', color: palette.text, marginTop: 2 },
    categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    categoryBadgeText: { fontSize: 11, fontWeight: '600', color: palette.onPrimary },
    importanceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
    importanceBadgeText: { fontSize: 11, fontWeight: '600' },
    eventDetails: { fontSize: 14, color: palette.text, marginTop: 8, lineHeight: 20 },
    eventMeta: { fontSize: 13, color: palette.textSecondary, marginTop: 6 },
    outcomeBox: { backgroundColor: palette.success + '15', padding: 8, borderRadius: 6, marginTop: 8 },
    outcomeText: { fontSize: 13, color: palette.success, fontWeight: '500' },
    emptyState: { alignItems: 'center', padding: 32, marginTop: 24 },
    emptyText: { fontSize: 14, color: palette.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 20 },
    exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    exportBtnText: { fontSize: 14, fontWeight: '600', color: palette.text },
    linkButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted, padding: 14, borderRadius: 12, gap: 12 },
    linkButtonText: { flex: 1, fontSize: 15, fontWeight: '600', color: palette.text },
    modalTitle: { fontSize: 20, fontWeight: '700', color: palette.text },
    formLabel: { fontSize: 14, fontWeight: '600', color: palette.text, marginBottom: 6, marginTop: 12 },
    formInput: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 12, color: palette.text, backgroundColor: palette.background },
    catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    catChipText: { fontSize: 12, color: palette.text },
    impChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted },
    impChipText: { fontSize: 13, fontWeight: '600', color: palette.text },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    statLabel: { fontSize: 14, color: palette.text },
    statValue: { fontSize: 14, fontWeight: '700', color: palette.primary },
  });
}
