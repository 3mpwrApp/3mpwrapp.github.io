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
  const _maxEnergyInForecast = Math.max(
    ...forecast.predictions.map(p => p.level)
  );
  const _minEnergyInForecast = Math.min(
    ...forecast.predictions.map(p => p.level)
  );

  // Generate accessibility label
  const a11yLabel = `Energy forecast for next ${forecast.predictions.length} hours. ${
    forecast.trend === 'increasing' ? 'Energy trending up' : ''
  } ${forecast.trend === 'decreasing' ? 'Energy trending down' : ''}. Best time at ${
    forecast.bestTime?.hour
  }:00 with ${forecast.bestTime?.level}% energy.`;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={a11yLabel}
      accessibilityRole="list"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flash" size={20} color={palette.warning} />
          <ThemedText style={styles.title}>
            Energy Forecast
          </ThemedText>
        </View>
        <TrendBadge
          trend={forecast.trend}
          palette={palette}
        />
      </View>

      {/* Current Energy */}
      {currentEnergy !== undefined && (
        <View style={styles.currentEnergySection}>
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
        </View>
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
        <View style={styles.chart}>
          {forecast.predictions.map((prediction, index) => (
            <View
              key={index}
              style={styles.chartBar}
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
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Summary */}
      <View style={styles.summary}>
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
      </View>

      {/* Recommendations */}
      {forecast.recommendations.length > 0 && (
        <View style={styles.recommendations}>
          <ThemedText style={styles.sectionLabel}>
            Recommendations
          </ThemedText>
          {forecast.recommendations.map((rec, index) => (
            <View
              key={index}
              style={styles.recommendationItem}
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
            </View>
          ))}
        </View>
      )}
    </View>
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
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: `${info.color}20`,
        borderRadius: 6,
      }}
    >
      <Ionicons name={info.icon} size={14} color={info.color} />
      <ThemedText style={{ color: info.color, fontWeight: '600' }}>
        {info.label}
      </ThemedText>
    </View>
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
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
    </View>
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
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      color: palette.text,
    },
    currentEnergySection: {
      gap: 8,
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
      gap: 8,
    },
    chartBar: {
      alignItems: 'center',
      gap: 4,
    },
    barLabel: {
      fontWeight: '500',
    },
    summary: {
      flexDirection: 'row',
      gap: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    recommendations: {
      gap: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    recommendationItem: {
      flexDirection: 'row',
      gap: 8,
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
