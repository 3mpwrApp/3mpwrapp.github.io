import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { forecastPain } from '../../../services/wellness/painForecast';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function PainForecast(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Pain Forecast');
  useFocusOnRefOnMount(titleRef);
  const [state, setState] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(()=>{ 
    logView('wellness/pain-forecast'); 
    (async()=>{ 
      try { 
        setIsLoading(true);
        setError(null);
        const forecast = await forecastPain();
        setState(forecast);
      } catch (err) {
        console.error('Error loading pain forecast:', err);
        setError('Unable to load forecast. Please try again later.');
        setState({ avg7d:0, trend:'unknown', tips:[], next3d:[]});
      } finally {
        setIsLoading(false);
      }
    })(); 
  },[]);
  
  const getTrendColor = (trend: string) => {
    if (trend === 'improving') return palette.success;
    if (trend === 'worsening') return palette.error;
    return palette.warning;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return '📉';
    if (trend === 'worsening') return '📈';
    return '➡️';
  };

  const getPainLevelColor = (level: number) => {
    if (level >= 7) return palette.error;
    if (level >= 4) return palette.warning;
    return palette.success;
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text 
        ref={titleRef}
        accessibilityRole="header" 
        style={s.header}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('wellness.painForecast.title','Pain Forecast')}
      </Text>
      <DisclaimerBanner type="medical" compact={true} />
      
      {isLoading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={[s.text, { marginTop: 12 }]}>Analyzing your pain patterns...</Text>
        </View>
      ) : error ? (
        <View style={[s.card, { backgroundColor: palette.error + '22' }]}>
          <Text style={[s.text, { color: palette.error, fontWeight: '700' }]}>⚠️ {error}</Text>
        </View>
      ) : state && (
        <>
          {/* 7-Day Average Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>7-Day Average</Text>
            <View style={s.metricRow}>
              <Text style={[s.metricValue, { color: getPainLevelColor(state.avg7d) }]}>
                {state.avg7d.toFixed ? state.avg7d.toFixed(1) : state.avg7d}/10
              </Text>
            </View>
          </View>

          {/* Trend Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Trend Analysis</Text>
            <View style={s.trendRow}>
              <Text style={s.trendIcon}>{getTrendIcon(state.trend)}</Text>
              <Text style={[s.trendText, { color: getTrendColor(state.trend) }]}>
                {state.trend.charAt(0).toUpperCase() + state.trend.slice(1)}
              </Text>
            </View>
          </View>

          {/* 3-Day Forecast Card */}
          {state.next3d && state.next3d.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>{t('wellness.painForecast.next','Next 3 Days Forecast')}</Text>
              <View style={s.forecastList}>
                {state.next3d.map((d:any, idx: number)=>(
                  <View key={d.date || idx} style={s.forecastItem}>
                    <Text style={s.forecastDate}>{d.date}</Text>
                    <Text style={s.forecastExpected}>{d.expected}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tips Card */}
          {state.tips && state.tips.length > 0 && (
            <View style={[s.card, { backgroundColor: palette.info + '22' }]}>
              <Text style={s.cardTitle}>💡 {t('wellness.painForecast.tips','Tips for Management')}</Text>
              <View style={s.tipsList}>
                {state.tips.map((tip:string,i:number)=>(
                  <View key={i} style={s.tipItem}>
                    <Text style={s.tipBullet}>•</Text>
                    <Text style={s.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {(!state.next3d || state.next3d.length === 0) && (!state.tips || state.tips.length === 0) && (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>📊</Text>
              <Text style={s.emptyText}>
                Log more pain data in the Symptom Tracker to see personalized forecasts and tips.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>){
  return StyleSheet.create({
    container: { 
      flex:1, 
      backgroundColor: palette.background 
    },
    header: { 
      color: palette.text, 
      fontSize: 24, 
      fontWeight: '800', 
      marginBottom: 12 
    },
    loadingContainer: {
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: { 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      borderRadius: 12, 
      padding: 16,
      marginBottom: 12,
      backgroundColor: palette.surface,
    },
    cardTitle: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 12,
    },
    metricRow: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    metricValue: {
      fontSize: 36,
      fontWeight: '800',
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    trendIcon: {
      fontSize: 28,
      marginRight: 12,
    },
    trendText: {
      fontSize: 20,
      fontWeight: '700',
    },
    forecastList: {
      gap: 8,
    },
    forecastItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: palette.background,
      borderRadius: 8,
    },
    forecastDate: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '600',
    },
    forecastExpected: {
      color: palette.text,
      fontSize: 14,
      opacity: 0.8,
    },
    tipsList: {
      gap: 8,
      marginTop: 4,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    tipBullet: {
      color: palette.info,
      fontSize: 16,
      marginRight: 8,
      marginTop: 2,
    },
    tipText: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
      flex: 1,
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surface,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyText: {
      color: palette.text,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      opacity: 0.8,
    },
    text: { 
      color: palette.text, 
      marginTop: 6,
      fontSize: 14,
      lineHeight: 20,
    },
  });
}
