/**
 * GapView - A cross-platform View component that supports the `gap` property
 * 
 * React Native Web doesn't properly support the CSS `gap` property in inline styles,
 * which causes "Failed to set an indexed property on CSSStyleDeclaration" errors.
 * 
 * This component provides a polyfill that converts `gap` to appropriate margins
 * on child elements, working seamlessly on both native and web platforms.
 * 
 * Usage:
 *   <GapView style={{ flexDirection: 'row', gap: 8 }}>
 *     <Text>Item 1</Text>
 *     <Text>Item 2</Text>
 *   </GapView>
 * 
 * Features:
 * - Supports horizontal gap (row direction)
 * - Supports vertical gap (column direction)
 * - Works with flexWrap
 * - Maintains all other View props and styles
 * - Zero runtime overhead when gap is not used
 */

import React from 'react';
import type { ViewProps, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

interface GapViewProps extends ViewProps {
  gap?: number;
  rowGap?: number;
  columnGap?: number;
}

export const GapView: React.FC<GapViewProps> = ({ 
  children, 
  style, 
  gap,
  rowGap,
  columnGap,
  ...props 
}) => {
  // Extract gap from style if provided there
  // Use try-catch for test environments where StyleSheet.flatten might not be available
  let flatStyle: ViewStyle & { gap?: number; rowGap?: number; columnGap?: number } = {};
  try {
    flatStyle = (StyleSheet.flatten && typeof StyleSheet.flatten === 'function' 
      ? StyleSheet.flatten(style) 
      : style) as ViewStyle & { gap?: number; rowGap?: number; columnGap?: number };
  } catch {
    flatStyle = (style || {}) as ViewStyle & { gap?: number; rowGap?: number; columnGap?: number };
  }
  
  const gapValue = gap ?? flatStyle?.gap;
  const rowGapValue = rowGap ?? flatStyle?.rowGap;
  const columnGapValue = columnGap ?? flatStyle?.columnGap;
  
  // If no gap is specified, render normal View
  if (gapValue === undefined && rowGapValue === undefined && columnGapValue === undefined) {
    return <View style={style} {...props}>{children}</View>;
  }

  // Determine direction
  const isRow = flatStyle?.flexDirection === 'row' || flatStyle?.flexDirection === 'row-reverse';
  const isWrap = flatStyle?.flexWrap === 'wrap' || flatStyle?.flexWrap === 'wrap-reverse';
  
  // Calculate actual gap values
  const horizontalGap = columnGapValue ?? (isRow ? gapValue : 0);
  const verticalGap = rowGapValue ?? (!isRow ? gapValue : 0);
  
  // If wrapping, we need both horizontal and vertical gaps
  const effectiveHorizontalGap = isWrap ? (horizontalGap ?? gapValue ?? 0) : horizontalGap;
  const effectiveVerticalGap = isWrap ? (verticalGap ?? gapValue ?? 0) : verticalGap;

  // Remove gap properties from style to avoid errors
  const cleanStyle = { ...flatStyle };
  delete cleanStyle.gap;
  delete cleanStyle.rowGap;
  delete cleanStyle.columnGap;

  // Clone children and add margins
  const childrenArray = React.Children.toArray(children);
  const enhancedChildren = childrenArray.map((child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    const isLast = index === childrenArray.length - 1;
    let childStyle: ViewStyle = {};
    try {
      childStyle = (StyleSheet.flatten && typeof StyleSheet.flatten === 'function'
        ? StyleSheet.flatten((child as any).props.style as ViewStyle)
        : (child as any).props.style) as ViewStyle || {};
    } catch {
      childStyle = ((child as any).props?.style || {}) as ViewStyle;
    }
    
    let marginStyle: ViewStyle = {};
    
    if (isRow) {
      // Horizontal layout
      if (!isLast && effectiveHorizontalGap) {
        marginStyle.marginRight = effectiveHorizontalGap;
      }
      if (isWrap && effectiveVerticalGap) {
        marginStyle.marginBottom = effectiveVerticalGap;
      }
    } else {
      // Vertical layout
      if (!isLast && effectiveVerticalGap) {
        marginStyle.marginBottom = effectiveVerticalGap;
      }
      if (isWrap && effectiveHorizontalGap) {
        marginStyle.marginRight = effectiveHorizontalGap;
      }
    }

    // Merge margins with existing child styles, preserving explicit margins
    const finalChildStyle = {
      ...childStyle,
      ...marginStyle,
      // Preserve any explicit margins from child
      ...(childStyle.marginRight !== undefined && { marginRight: childStyle.marginRight }),
      ...(childStyle.marginBottom !== undefined && { marginBottom: childStyle.marginBottom }),
    };

    return React.cloneElement(child, {
      ...(child.props as Record<string, any>),
      style: finalChildStyle,
    } as any);
  });

  return (
    <View style={cleanStyle} {...props}>
      {enhancedChildren}
    </View>
  );
};

export default GapView;
