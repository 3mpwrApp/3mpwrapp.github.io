/**
 * Energy Forecast Component
 * Displays predicted energy levels for the next 24 hours
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View
} from 'react-native';

import type { EnergyForecast as EnergyForecastType } from '../services/energyPrediction';
import type { Palette } from '../theme/usePalette';
import { useAppPalette } from '../theme/usePalette';

import { GapView } from './GapView';
import { ThemedText } from './ThemedText';

interface EnergyForecastComponentProps {
  forecast: EnergyForecastType | null;
  isLoading?: boolean;
  currentEnergy?: number;
}

export const EnergyForecast: React.FC<EnergyForecastComponentProps> = ({
  forecast,
  isLoading = false,
  currentEnergy,
}) => {
  const palette = useAppPalette();
  const { width } = useWindowDimensions();

  const styles = useMemo(() => createStyles(palette), [palette]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading energy forecast...</ThemedText>
      </View>
    );
  }

  if (!forecast) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>
          Unable to generate forecast
        </ThemedText>
      </View>
    );
  }

  const chartWidth = width - 32; // Padding
  // Calculate min/max for scaling (reserved for future normalization)
  const _maxEnergyInForecast = Math.max(
    ...forecast.predictions.map(p => p.level)
  );
  const _minEnergyInForecast = Math.min(
    ...forecast.predictions.map(p => p.level)
  );
  // These values are intentionally unused but kept for future scaling implementation
  void _maxEnergyInForecast;
  void _minEnergyInForecast;

  // Generate accessibility label
  const a11yLabel = `Energy forecast for next ${forecast.predictions.length} hours. ${
    forecast.trend === 'increasing' ? 'Energy trending up' : ''
  } ${forecast.trend === 'decreasing' ? 'Energy trending down' : ''}. Best time at ${
    forecast.bestTime?.hour
  }:00 with ${forecast.bestTime?.level}% energy.`;

  return (
    <GapView
      style={styles.container}
      gap={16}
      accessible
      accessibilityLabel={a11yLabel}
      accessibilityRole="list"
    >
      {/* Header */}
      <View style={styles.header}>
        <GapView style={styles.titleRow} gap={8}>
          <Ionicons name="flash" size={20} color={palette.warning} />
          <ThemedText style={styles.title}>
            Energy Forecast
          </ThemedText>
        </GapView>
        <TrendBadge
          trend={forecast.trend}
          palette={palette}
        />
      </View>

      {/* Current Energy */}
      {currentEnergy !== undefined && (
        <GapView style={styles.currentEnergySection} gap={8}>
          <ThemedText style={styles.sectionLabel}>
            Current Energy
          </ThemedText>
          <EnergyBar
            level={currentEnergy}
            palette={palette}
            width={chartWidth}
          />
          <ThemedText style={styles.energyValue}>
            {currentEnergy}%
          </ThemedText>
        </GapView>
      )}

      {/* Chart */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chartScroll}
        accessible
        accessibilityLabel="Energy level chart for next 24 hours"
        accessibilityRole="image"
      >
        <GapView style={styles.chart} gap={8}>
          {forecast.predictions.map((prediction, index) => (
            <GapView
              key={index}
              style={styles.chartBar}
              gap={4}
              accessible
              accessibilityLabel={`${prediction.hourOfDay}:00 - ${prediction.level}% energy`}
            >
              <EnergyBar
                level={prediction.level}
                palette={palette}
                width={30}
                height={120}
                showLabel={false}
              />
              <ThemedText
                style={[
                  styles.barLabel,
                  {
                    color:
                      prediction.level > 60
                        ? palette.success
                        : prediction.level > 30
                          ? palette.warning
                          : palette.error,
                  },
                ]}
              >
                {prediction.hourOfDay}h
              </ThemedText>
            </GapView>
          ))}
        </GapView>
      </ScrollView>

      {/* Summary */}
      <GapView style={styles.summary} gap={16}>
        <SummaryItem
          label="Best Time"
          value={`${forecast.bestTime?.hour}:00`}
          subValue={`${forecast.bestTime?.level}% energy`}
          icon="trending-up"
          palette={palette}
        />
        <SummaryItem
          label="Lowest Time"
          value={`${forecast.worstTime?.hour}:00`}
          subValue={`${forecast.worstTime?.level}% energy`}
          icon="trending-down"
          palette={palette}
        />
      </GapView>

      {/* Recommendations */}
      {forecast.recommendations.length > 0 && (
        <GapView style={styles.recommendations} gap={8}>
          <ThemedText style={styles.sectionLabel}>
            Recommendations
          </ThemedText>
          {forecast.recommendations.map((rec, index) => (
            <GapView
              key={index}
              style={styles.recommendationItem}
              gap={8}
              accessible
              accessibilityLabel={`Recommendation ${index + 1}: ${rec}`}
            >
              <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={palette.success}
                  style={styles.recIcon}
                />
              <ThemedText style={styles.recText}>
                {rec}
              </ThemedText>
            </GapView>
          ))}
        </GapView>
      )}
    </GapView>
  );
};

interface EnergyBarProps {
  level: number;
  palette: Palette;
  width?: number;
  height?: number;
  showLabel?: boolean;
}

function EnergyBar({
  level,
  palette,
  width = 50,
  height = 40,
  showLabel = true,
}: EnergyBarProps) {
  const getColor = (level: number) => {
    if (level >= 75) return palette.success;
    if (level >= 50) return palette.warning;
    if (level >= 25) return palette.info;
    return palette.error;
  };

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: palette.card,
        borderRadius: 4,
        overflow: 'hidden',
        justifyContent: 'flex-end',
      }}
    >
      <View
        style={{
          height: `${level}%`,
          backgroundColor: getColor(level),
          borderRadius: 4,
        }}
      />
      {showLabel && (
        <ThemedText
          style={{
            position: 'absolute',
            alignSelf: 'center',
            color: palette.textSecondary,
            fontSize: 11,
          }}
        >
          {level}%
        </ThemedText>
      )}
    </View>
  );
}

interface TrendBadgeProps {
  trend: 'increasing' | 'decreasing' | 'stable';
  palette: Palette;
}

function TrendBadge({ trend, palette }: TrendBadgeProps) {
  const getTrendInfo = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return { icon: 'trending-up' as const, color: palette.success, label: 'Increasing' };
      case 'decreasing':
        return { icon: 'trending-down' as const, color: palette.error, label: 'Decreasing' };
      default:
        return { icon: 'remove' as const, color: palette.info, label: 'Stable' };
    }
  };

  const info = getTrendInfo(trend);

  return (
    <GapView
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: `${info.color}20`,
        borderRadius: 6,
      }}
      gap={4}
    >
      <Ionicons name={info.icon} size={14} color={info.color} />
      <ThemedText style={{ color: info.color, fontWeight: '600' }}>
        {info.label}
      </ThemedText>
    </GapView>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
  subValue: string;
  icon: string;
  palette: Palette;
}

function SummaryItem({ label, value, subValue, icon, palette }: SummaryItemProps) {
  const iconColor = palette.primary;
  
  return (
    <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={12}>
      <Ionicons name={icon as any} size={24} color={iconColor} />
      <View style={{ flex: 1 }}>
        <ThemedText style={{ color: palette.textSecondary }}>
          {label}
        </ThemedText>
        <ThemedText style={{ color: palette.text }}>
          {value}
        </ThemedText>
        <ThemedText
          style={{ color: palette.textSecondary, fontSize: 11 }}
        >
          {subValue}
        </ThemedText>
      </View>
    </GapView>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 12,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      color: palette.text,
    },
    currentEnergySection: {
    },
    sectionLabel: {
      color: palette.textSecondary,
      fontWeight: '600',
    },
    energyValue: {
      color: palette.textSecondary,
    },
    chartScroll: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
    },
    chart: {
      flexDirection: 'row',
    },
    chartBar: {
      alignItems: 'center',
    },
    barLabel: {
      fontWeight: '500',
    },
    summary: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    recommendations: {
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    recommendationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    recIcon: {
      marginTop: 2,
    },
    recText: {
      flex: 1,
      color: palette.textSecondary,
    },
    errorText: {
      color: palette.error,
    },
  });

export default EnergyForecast;
