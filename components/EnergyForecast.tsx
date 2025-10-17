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
import { TextV2 } from '../components/TextV2';

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
        <TextV2 variant="body2">Loading energy forecast...</TextV2>
      </View>
    );
  }

  if (!forecast) {
    return (
      <View style={styles.container}>
        <TextV2 variant="body2" style={styles.errorText}>
          Unable to generate forecast
        </TextV2>
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
          <Ionicons name="flash" size={20} color={palette.warning.main} />
          <TextV2 variant="subtitle2" style={styles.title}>
            Energy Forecast
          </TextV2>
        </View>
        <TrendBadge
          trend={forecast.trend}
          palette={palette}
        />
      </View>

      {/* Current Energy */}
      {currentEnergy !== undefined && (
        <View style={styles.currentEnergySection}>
          <TextV2 variant="caption" style={styles.sectionLabel}>
            Current Energy
          </TextV2>
          <EnergyBar
            level={currentEnergy}
            palette={palette}
            width={chartWidth}
          />
          <TextV2 variant="caption" style={styles.energyValue}>
            {currentEnergy}%
          </TextV2>
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
              <TextV2
                variant="caption"
                style={[
                  styles.barLabel,
                  {
                    color:
                      prediction.level > 60
                        ? palette.success.main
                        : prediction.level > 30
                          ? palette.warning.main
                          : palette.error.main,
                  },
                ]}
              >
                {prediction.hourOfDay}h
              </TextV2>
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
          <TextV2 variant="caption" style={styles.sectionLabel}>
            Recommendations
          </TextV2>
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
                  color={typeof palette.success === 'string' ? palette.success : palette.success.main}
                  style={styles.recIcon}
                />
              <TextV2 variant="body2" style={styles.recText}>
                {rec}
              </TextV2>
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
    if (level >= 75) return palette.success.main;
    if (level >= 50) return palette.warning.main;
    if (level >= 25) return palette.info.main;
    return palette.error.main;
  };

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: palette.background.secondary,
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
        <TextV2
          variant="caption"
          style={{
            position: 'absolute',
            alignSelf: 'center',
            color: palette.text.secondary,
            fontSize: 11,
          }}
        >
          {level}%
        </TextV2>
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
        return { icon: 'trending-up' as const, color: palette.success.main, label: 'Increasing' };
      case 'decreasing':
        return { icon: 'trending-down' as const, color: palette.error.main, label: 'Decreasing' };
      default:
        return { icon: 'remove' as const, color: palette.info.main, label: 'Stable' };
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
      <TextV2 variant="caption" style={{ color: info.color, fontWeight: '600' }}>
        {info.label}
      </TextV2>
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
  const iconColor = typeof palette.primary === 'string' ? palette.primary : palette.primary.main;
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Ionicons name={icon as any} size={24} color={iconColor} />
      <View style={{ flex: 1 }}>
        <TextV2 variant="caption" style={{ color: palette.text.secondary }}>
          {label}
        </TextV2>
        <TextV2 variant="body2" style={{ color: palette.text.primary }}>
          {value}
        </TextV2>
        <TextV2
          variant="caption"
          style={{ color: palette.text.secondary, fontSize: 11 }}
        >
          {subValue}
        </TextV2>
      </View>
    </View>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      backgroundColor: palette.background.elevated,
      borderWidth: 1,
      borderColor: palette.divider,
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
      color: palette.text.primary,
    },
    currentEnergySection: {
      gap: 8,
    },
    sectionLabel: {
      color: palette.text.secondary,
      fontWeight: '600',
    },
    energyValue: {
      color: palette.text.secondary,
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
      borderTopColor: palette.divider,
    },
    recommendations: {
      gap: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: palette.divider,
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
      color: palette.text.secondary,
    },
    errorText: {
      color: palette.error.main,
    },
  });

export default EnergyForecast;
