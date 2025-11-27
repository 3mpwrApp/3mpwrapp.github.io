import { useRouter } from 'expo-router';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { auth, db } from '../../../firebase/config';
import * as Notifier from '../../../services/notifications';
import {
    calculateActivityStreaks,
    checkBodyMindSync,
    checkPacingAlerts,
    forecastEnergyLevels,
    generateAdaptiveSuggestions,
    type ActivityLog,
    type AdaptiveSuggestion,
    type EnergyForecast,
    type PacingAlert,
} from '../../../services/pacingAi';
import { useMood } from '../../../store/mood';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function PacingPartner() {
  const palette = useAppPalette();
  const s = styles(palette);
  const router = useRouter();
  
  // Activity logging state
  const [minutes, setMinutes] = React.useState('');
  const [type, setType] = React.useState('walk');
  const [intensity, setIntensity] = React.useState<'low' | 'moderate' | 'high'>('moderate');
  const [painLevel, setPainLevel] = React.useState('');
  const [fatigueLevel, setFatigueLevel] = React.useState('');
  const [items, setItems] = React.useState<ActivityLog[]>([]);
  
  // AI features state
  const [showForecasts, setShowForecasts] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  
  // Try to get mood data for body-mind sync
  let moodEntries: any[] = [];
  try {
    const moodCtx = useMood();
    moodEntries = moodCtx?.entries || [];
  } catch {
    // Mood provider not available
  }

  // Load activities
  const load = React.useCallback(async()=>{
    try {
      const uid = auth.currentUser?.uid || 'anon';
      const snap = await getDocs(query(collection(db,'users',uid,'activity_logs'), orderBy('createdAt','desc')));
      setItems(snap.docs.map(d=>({ id:d.id, ...(d.data() as any) })));
    } catch {}
  },[]);

  React.useEffect(()=>{ load(); },[load]);

  // Calculate AI insights
  const forecasts = React.useMemo(() => forecastEnergyLevels(items), [items]);
  const alerts = React.useMemo(() => checkPacingAlerts(items), [items]);
  const suggestions = React.useMemo(() => 
    generateAdaptiveSuggestions(
      items.slice(0, 10),
      painLevel ? parseFloat(painLevel) : undefined,
      fatigueLevel ? parseFloat(fatigueLevel) : undefined
    ),
    [items, painLevel, fatigueLevel]
  );
  const bodyMindSync = React.useMemo(() => checkBodyMindSync(items, moodEntries), [items, moodEntries]);
  const streaks = React.useMemo(() => calculateActivityStreaks(items), [items]);

  // Add activity with enhanced tracking
  const add = async () => {
    try {
      const uid = auth.currentUser?.uid || 'anon';
      const activity: Partial<ActivityLog> = {
        minutes: Number(minutes)||0,
        type,
        intensity,
        createdAt: serverTimestamp(),
      };
      
      if (painLevel) activity.painLevel = parseFloat(painLevel);
      if (fatigueLevel) activity.fatigueLevel = parseFloat(fatigueLevel);
      
      await addDoc(collection(db,'users',uid,'activity_logs'), activity);
      setMinutes('');
      setPainLevel('');
      setFatigueLevel('');
      load();
      checkOverexertion();
    } catch {
      Alert.alert('Error', 'Could not save');
    }
  };

  const checkOverexertion = async () => {
    const last24h = items.filter(i => (Date.now() - (i.createdAt?.toDate?.()?.getTime?.()||0)) < 24*3600000);
    const total = last24h.reduce((s,i)=> s + (i.minutes||0), 0);
    if (total > 180) {
      try {
        const d = new Date();
        d.setMinutes(d.getMinutes()+5);
        await Notifier.scheduleAt(d, 'Pacing Partner', '💙 You\'ve been very active. Your body is asking for rest. That\'s completely okay.');
      } catch {}
    }
  };

  // Export activities
  const exportActivities = async () => {
    try {
      const rows = [
        ["Date", "Type", "Minutes", "Intensity", "Pain", "Fatigue"],
        ...items.slice(0,20).map(i => [
          new Date(i.createdAt?.toDate?.()||Date.now()).toLocaleString(),
          i.type||'activity',
          String(i.minutes),
          i.intensity||'',
          String(i.painLevel||''),
          String(i.fatigueLevel||''),
        ]),
      ];
      const csv = rows.map(r => r.map(x => `"${(x || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
      if (!baseDir) return;
      const path = `${baseDir}pacing_activities_${Date.now()}.csv`;
      await (FileSystem as any).writeAsStringAsync(path, csv, { encoding: (FileSystem as any).EncodingType?.UTF8 });
      if (Sharing?.isAvailableAsync && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Pacing Partner Activities CSV' });
      }
    } catch {}
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title} accessibilityRole="header">⚡ AI Pacing Partner</Text>
      <Text style={s.subtitle}>Smart energy forecasting with compassionate guidance</Text>
      
      <DisclaimerBanner type="ai" compact={true} />

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <View style={[s.section, { backgroundColor: palette.surface }]}>
          <Text style={[s.sectionTitle, { color: palette.primary }]}>🚨 Pacing Alerts</Text>
          {alerts.map((alert, idx) => (
            <AlertCard key={idx} alert={alert} palette={palette} />
          ))}
        </View>
      )}

      {/* Body-Mind Sync */}
      {moodEntries.length > 0 && (
        <View style={[s.section, { backgroundColor: palette.surface }]}>
          <Text style={[s.sectionTitle, { color: palette.primary }]}>🧘 Body & Mind Sync</Text>
          <View style={[s.card, { borderLeftColor: bodyMindSync.aligned ? palette.primary : palette.warning }]}>
            <Text style={[s.cardText, { color: palette.text }]}>{bodyMindSync.message}</Text>
            <Text style={[s.cardSubtext, { color: palette.text }]}>{bodyMindSync.suggestion}</Text>
          </View>
          <A11yPressable
            onPress={() => router.push('/(tabs)/wellness.mood')}
            style={[s.linkButton, { borderColor: palette.muted }]}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="link"
            accessibilityLabel="View mood tracker"
          >
            <Text style={[s.linkButtonText, { color: palette.text }]}>
              📊 View Mood Tracker →
            </Text>
          </A11yPressable>
        </View>
      )}

      {/* Activity Streaks */}
      {items.length >= 7 && (
        <View style={[s.section, { backgroundColor: palette.surface }]}>
          <Text style={[s.sectionTitle, { color: palette.primary }]}>🏆 Your Achievements</Text>
          <GapView gap={8}>
            {streaks.consistentPacing > 0 && (
              <View style={[s.achievementCard, { borderColor: palette.primary }]}>
                <Text style={s.achievementIcon}>📅</Text>
                <View>
                  <Text style={[s.achievementTitle, { color: palette.text }]}>
                    Consistent Pacing
                  </Text>
                  <Text style={[s.achievementSubtitle, { color: palette.text }]}>
                    {streaks.consistentPacing} week{streaks.consistentPacing > 1 ? 's' : ''} with 5+ activity days
                  </Text>
                </View>
              </View>
            )}
            {streaks.balancedWeeks > 0 && (
              <View style={[s.achievementCard, { borderColor: palette.primary }]}>
                <Text style={s.achievementIcon}>⚖️</Text>
                <View>
                  <Text style={[s.achievementTitle, { color: palette.text }]}>
                    Balanced Weeks
                  </Text>
                  <Text style={[s.achievementSubtitle, { color: palette.text }]}>
                    {streaks.balancedWeeks} week{streaks.balancedWeeks > 1 ? 's' : ''} at sustainable pace
                  </Text>
                </View>
              </View>
            )}
            {streaks.restDays > 0 && (
              <View style={[s.achievementCard, { borderColor: palette.primary }]}>
                <Text style={s.achievementIcon}>🛌</Text>
                <View>
                  <Text style={[s.achievementTitle, { color: palette.text }]}>
                    Rest Days Honored
                  </Text>
                  <Text style={[s.achievementSubtitle, { color: palette.text }]}>
                    {streaks.restDays} rest day{streaks.restDays > 1 ? 's' : ''} in last 2 weeks
                  </Text>
                </View>
              </View>
            )}
          </GapView>
        </View>
      )}

      {/* Log Activity Section */}
      <View style={[s.section, { backgroundColor: palette.surface }]}>
        <Text style={[s.sectionTitle, { color: palette.primary }]}>📝 Log Activity</Text>
        
        <Text style={[s.label, { color: palette.text }]}>Activity Type</Text>
        <TextInput
          placeholder="walk, work, chores..."
          placeholderTextColor={palette.text+'77'}
          value={type}
          onChangeText={setType}
          style={s.input}
          accessibilityLabel="Activity type input"
        />

        <Text style={[s.label, { color: palette.text }]}>Minutes</Text>
        <TextInput
          placeholder="30"
          placeholderTextColor={palette.text+'77'}
          value={minutes}
          onChangeText={setMinutes}
          style={s.input}
          keyboardType="numeric"
          accessibilityLabel="Minutes input"
        />

        <Text style={[s.label, { color: palette.text }]}>Intensity</Text>
        <GapView gap={8} style={{ flexDirection: 'row' }}>
          {(['low', 'moderate', 'high'] as const).map(i => (
            <Pressable
              key={i}
              hitSlop={HIT_SLOP_8}
              style={[
                s.intensityBtn,
                { borderColor: palette.muted },
                intensity === i && { backgroundColor: palette.primary, borderColor: palette.primary },
              ]}
              onPress={() => setIntensity(i)}
            >
              <Text style={[s.intensityText, { color: intensity === i ? palette.onPrimary : palette.text }]}>
                {i}
              </Text>
            </Pressable>
          ))}
        </GapView>

        <Text style={[s.label, { color: palette.text }]}>Current Pain Level (0-10, optional)</Text>
        <TextInput
          placeholder="0 = none, 10 = severe"
          placeholderTextColor={palette.text+'77'}
          value={painLevel}
          onChangeText={setPainLevel}
          style={s.input}
          keyboardType="numeric"
        />

        <Text style={[s.label, { color: palette.text }]}>Current Fatigue Level (0-10, optional)</Text>
        <TextInput
          placeholder="0 = none, 10 = exhausted"
          placeholderTextColor={palette.text+'77'}
          value={fatigueLevel}
          onChangeText={setFatigueLevel}
          style={s.input}
          keyboardType="numeric"
        />

        <A11yPressable
          onPress={add}
          style={s.button}
          accessibilityRole="button"
          accessibilityLabel="Log activity"
          hitSlop={HIT_SLOP_8}
        >
          <Text style={s.buttonText}>Log Activity</Text>
        </A11yPressable>
      </View>

      {/* Adaptive Suggestions */}
      {suggestions.length > 0 && (
        <View style={[s.section, { backgroundColor: palette.surface }]}>
          <Pressable
            hitSlop={HIT_SLOP_8}
            onPress={() => setShowSuggestions(!showSuggestions)}
            accessibilityRole="button"
            accessibilityLabel={showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
          >
            <Text style={[s.sectionTitle, { color: palette.primary }]}>
              {showSuggestions ? '▼' : '▶'} 💡 Adaptive Suggestions
            </Text>
          </Pressable>
          {showSuggestions && suggestions.map(sug => (
            <SuggestionCard key={sug.id} suggestion={sug} palette={palette} />
          ))}
        </View>
      )}

      {/* Energy Forecast */}
      {items.length >= 7 && (
        <View style={[s.section, { backgroundColor: palette.surface }]}>
          <Pressable
            hitSlop={HIT_SLOP_8}
            onPress={() => setShowForecasts(!showForecasts)}
            accessibilityRole="button"
            accessibilityLabel={showForecasts ? 'Hide forecast' : 'Show forecast'}
          >
            <Text style={[s.sectionTitle, { color: palette.primary }]}>
              {showForecasts ? '▼' : '▶'} 📈 Energy Forecast
            </Text>
          </Pressable>
          {showForecasts && forecasts.map((forecast, idx) => (
            <ForecastCard key={idx} forecast={forecast} palette={palette} />
          ))}
        </View>
      )}

      {/* Recent Activities */}
      <View style={[s.section, { backgroundColor: palette.surface }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[s.sectionTitle, { color: palette.primary }]}>📋 Recent Activities</Text>
          <A11yPressable
            onPress={exportActivities}
            style={[s.smallButton, { borderColor: palette.muted }]}
            accessibilityRole="button"
            accessibilityLabel="Export pacing activities as CSV"
            hitSlop={HIT_SLOP_8}
          >
            <Text style={[s.smallButtonText, { color: palette.text }]}>Export CSV</Text>
          </A11yPressable>
        </View>
        {items.slice(0,10).map(i=> (
          <View key={i.id} style={[s.activityItem, { borderColor: palette.muted }]}>
            <Text style={[s.activityTime, { color: palette.text }]}>
              {new Date(i.createdAt?.toDate?.()||Date.now()).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
            <Text style={[s.activityDetails, { color: palette.text }]}>
              {i.type || 'activity'}: {i.minutes} min {i.intensity ? `(${i.intensity})` : ''}
            </Text>
            {(i.painLevel || i.fatigueLevel) && (
              <Text style={[s.activityMetrics, { color: palette.text }]}>
                {i.painLevel ? `Pain: ${i.painLevel}/10` : ''} {i.fatigueLevel ? `Fatigue: ${i.fatigueLevel}/10` : ''}
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// Subcomponents
function AlertCard({ alert, palette }: { alert: PacingAlert; palette: ReturnType<typeof useAppPalette> }) {
  const colors = {
    info: palette.primary,
    warning: palette.warning,
    critical: palette.error,
  };

  return (
    <View
      style={[
        styles(palette).alertCard,
        { borderLeftColor: colors[alert.severity] },
      ]}
      accessibilityLabel={`${alert.type} alert: ${alert.compassionateMessage}`}
    >
      <Text style={[styles(palette).alertTitle, { color: palette.text }]}>
        {alert.compassionateMessage}
      </Text>
      {alert.suggestion && (
        <Text style={[styles(palette).alertSuggestion, { color: palette.text }]}>
          💡 {alert.suggestion}
        </Text>
      )}
    </View>
  );
}

function SuggestionCard({ suggestion, palette }: { suggestion: AdaptiveSuggestion; palette: ReturnType<typeof useAppPalette> }) {
  const categoryIcons = {
    rest: '🛌',
    'gentle-movement': '🚶',
    breathing: '🫁',
    adjustment: '⚙️',
  };

  return (
    <View
      style={[styles(palette).suggestionCard, { borderColor: palette.muted }]}
      accessibilityLabel={`${suggestion.title}. ${suggestion.description}. Estimated ${suggestion.estimatedMinutes} minutes.`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 20, marginRight: 8 }}>{categoryIcons[suggestion.category]}</Text>
        <Text style={[styles(palette).suggestionTitle, { color: palette.text }]}>
          {suggestion.title}
        </Text>
      </View>
      <Text style={[styles(palette).suggestionDescription, { color: palette.text }]}>
        {suggestion.description}
      </Text>
      <Text style={[styles(palette).suggestionTime, { color: palette.muted }]}>
        ⏱ {suggestion.estimatedMinutes} min • {suggestion.energyCost} energy
      </Text>
    </View>
  );
}

function ForecastCard({ forecast, palette }: { forecast: EnergyForecast; palette: ReturnType<typeof useAppPalette> }) {
  const levelColors = {
    low: palette.warning,
    moderate: palette.primary,
    high: palette.success,
  };

  return (
    <View
      style={[styles(palette).forecastCard, { borderLeftColor: levelColors[forecast.energyLevel] }]}
      accessibilityLabel={`${forecast.hour}:00 - ${forecast.energyLevel} energy. ${forecast.suggestion}`}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={[styles(palette).forecastTime, { color: palette.text }]}>
          {forecast.hour}:00
        </Text>
        <Text style={[styles(palette).forecastLevel, { color: levelColors[forecast.energyLevel] }]}>
          {forecast.energyLevel}
        </Text>
      </View>
      <Text style={[styles(palette).forecastSuggestion, { color: palette.text }]}>
        {forecast.suggestion}
      </Text>
      <Text style={[styles(palette).forecastConfidence, { color: palette.muted }]}>
        {Math.round(forecast.confidence * 100)}% confidence
      </Text>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: palette.text, opacity: 0.8, marginBottom: 12 },
    section: { marginTop: 16, padding: 16, borderRadius: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    label: { fontSize: 14, fontWeight: '500', marginTop: 12, marginBottom: 6 },
    input: { borderWidth: 1, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginBottom: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
    buttonText: { color: palette.onPrimary, fontWeight: '700', fontSize: 16 },
    smallButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
    smallButtonText: { fontSize: 12, fontWeight: '600' },
    intensityBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, alignItems: 'center' },
    intensityText: { fontSize: 14, fontWeight: '500', textTransform: 'capitalize' },
    card: { padding: 12, borderRadius: 8, backgroundColor: palette.background, borderLeftWidth: 4, marginTop: 8 },
    cardText: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
    cardSubtext: { fontSize: 13, color: palette.textSecondary },
    linkButton: { marginTop: 12, padding: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
    linkButtonText: { fontSize: 14, fontWeight: '500' },
    achievementCard: { flexDirection: 'row', padding: 12, borderRadius: 8, borderWidth: 2, alignItems: 'center' },
    achievementIcon: { fontSize: 28, marginRight: 12 },
    achievementTitle: { fontSize: 16, fontWeight: '600' },
    achievementSubtitle: { fontSize: 13, color: palette.textSecondary },
    alertCard: { padding: 12, borderRadius: 8, backgroundColor: palette.background, borderLeftWidth: 4, marginTop: 8 },
    alertTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
    alertSuggestion: { fontSize: 13, color: palette.textSecondary, fontStyle: 'italic' },
    suggestionCard: { padding: 12, borderRadius: 8, borderWidth: 1, marginTop: 8 },
    suggestionTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
    suggestionDescription: { fontSize: 14, color: palette.textSecondary, marginBottom: 6 },
    suggestionTime: { fontSize: 12, color: palette.textSecondary },
    forecastCard: { padding: 12, borderRadius: 8, backgroundColor: palette.background, borderLeftWidth: 4, marginTop: 8 },
    forecastTime: { fontSize: 16, fontWeight: '600' },
    forecastLevel: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
    forecastSuggestion: { fontSize: 14, color: palette.textSecondary, marginTop: 4 },
    forecastConfidence: { fontSize: 12, color: palette.textSecondary, marginTop: 4 },
    activityItem: { padding: 10, borderRadius: 6, borderWidth: 1, marginTop: 8 },
    activityTime: { fontSize: 12, color: palette.textSecondary, marginBottom: 4 },
    activityDetails: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
    activityMetrics: { fontSize: 13, color: palette.textSecondary },
  });
}
