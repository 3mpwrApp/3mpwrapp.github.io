import React from 'react';
import { View, Text } from 'react-native';

import { useAppPalette } from '../theme/usePalette';

export default function SimpleBarChart({ data, labelKey, valueKey, height = 140 }: { data: any[]; labelKey: string; valueKey: string; height?: number }) {
  const palette = useAppPalette();
  let Svg: any, Rect: any, TextSvg: any;
  try {
    const svg = require('react-native-svg');
    Svg = svg.Svg; Rect = svg.Rect; TextSvg = svg.Text;
  } catch {}
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey]) || 0));
  const width = Math.max(200, data.length * 48);
  if (!Svg) {
    return (
      <View style={{ padding: 8 }}>
        <Text style={{ color: palette.text, opacity: 0.9 }}>Chart unavailable (react-native-svg not installed). Values:</Text>
        {data.map((d) => (
          <Text key={String(d[labelKey])} style={{ color: palette.text }}>{String(d[labelKey])}: {String(d[valueKey])}</Text>
        ))}
      </View>
    );
  }
  return (
    <Svg width={width} height={height}>
      {data.map((d, i) => {
        const v = Number(d[valueKey]) || 0; const h = (v / max) * (height - 20);
        return (
          <React.Fragment key={String(d[labelKey])}>
            <Rect x={i * 48 + 12} y={height - h - 20} width={28} height={h} fill={palette.primary} />
            <TextSvg x={i * 48 + 12} y={height - 4} fill={palette.text} fontSize={10}>{String(d[labelKey])}</TextSvg>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

