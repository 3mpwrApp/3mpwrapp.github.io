// app/modal.tsx
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import useReducedMotion from "../hooks/useReducedMotion";

export default function GlobalModal() {
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1); // Skip animations if user prefers reduced motion
    } else {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [reduceMotion]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.title}>Modal Content</Text>
      <Text style={styles.subtitle}>
        This modal respects “Reduce Motion” accessibility settings.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center", color: "#555" },
});
