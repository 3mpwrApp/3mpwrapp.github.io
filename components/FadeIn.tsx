import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

import { useReduceMotionEnabled } from '../hooks/useA11y';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number; // default 500ms
  delay?: number; // default 0ms
  style?: ViewStyle;
}

/**
 * Fade-in animation wrapper for smooth skeleton -> content transitions
 * Prevents layout shifts by using consistent heights
 * 
 * @example
 * <FadeIn duration={300}>
 *   <Text>Your content here</Text>
 * </FadeIn>
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 500,
  delay = 0,
  style,
}) => {
  const reduceMotion = useReduceMotionEnabled();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      // If reduce motion is enabled, show immediately
      fadeAnim.setValue(1);
      return;
    }

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay, reduceMotion]);

  return (
    <Animated.View
      style={[
        {
          opacity: reduceMotion ? 1 : fadeAnim,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface FadeInSequenceProps {
  children: React.ReactNode;
  duration?: number;
  staggerDelay?: number; // delay between items
  isReady: boolean; // when true, start animation
  style?: ViewStyle;
}

/**
 * Staggered fade-in for list items
 * Each item fades in with a delay for a cascade effect
 * 
 * @example
 * <FadeInSequence isReady={!loading} staggerDelay={100}>
 *   {items.map(item => <Item key={item.id} {...item} />)}
 * </FadeInSequence>
 */
export const FadeInSequence: React.FC<FadeInSequenceProps> = ({
  children,
  duration = 400,
  staggerDelay = 80,
  isReady,
  style,
}) => {
  const reduceMotion = useReduceMotionEnabled();

  if (!isReady) {
    return null;
  }

  const childArray = React.Children.toArray(children);

  return (
    <>
      {childArray.map((child, index) => (
        <FadeIn
          key={index}
          duration={duration}
          delay={reduceMotion ? 0 : index * staggerDelay}
          style={style}
        >
          {child}
        </FadeIn>
      ))}
    </>
  );
};

interface FadeInWhenLoadedProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  duration?: number; // fade-in duration
  style?: ViewStyle;
}

/**
 * Automatically fades content in when loading completes
 * Shows skeleton while loading, fades in real content when ready
 * 
 * @example
 * <FadeInWhenLoaded
 *   loading={loading}
 *   skeleton={<SkeletonCard />}
 * >
 *   <Card data={data} />
 * </FadeInWhenLoaded>
 */
export const FadeInWhenLoaded: React.FC<FadeInWhenLoadedProps> = ({
  loading,
  skeleton,
  children,
  duration = 300,
  style,
}) => {
  if (loading) {
    return <>{skeleton}</>;
  }

  return (
    <FadeIn duration={duration} style={style}>
      {children}
    </FadeIn>
  );
};
