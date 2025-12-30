import { Stack } from 'expo-router';

/**
 * Layout for settings sub-screens.
 * These are navigated to from the main settings screen
 * and should NOT appear as tabs at the bottom.
 */
export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTitleStyle: {
          fontSize: 16,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="advanced-accessibility"
        options={{ title: 'Advanced Accessibility' }}
      />
      <Stack.Screen
        name="advanced-accessibility.impl"
        options={{ title: 'Advanced Accessibility' }}
      />
      <Stack.Screen
        name="advanced-security"
        options={{ title: 'Advanced Security' }}
      />
      <Stack.Screen
        name="advanced-security.impl"
        options={{ title: 'Advanced Security' }}
      />
      <Stack.Screen
        name="cognitive-accessibility"
        options={{ title: 'Cognitive Accessibility' }}
      />
      <Stack.Screen
        name="cognitive-accessibility.impl"
        options={{ title: 'Cognitive Accessibility' }}
      />
      <Stack.Screen
        name="cultural-safety"
        options={{ title: 'Cultural Safety' }}
      />
      <Stack.Screen
        name="dyslexia"
        options={{ title: 'Dyslexia Settings' }}
      />
      <Stack.Screen
        name="indigenous-language"
        options={{ title: 'Indigenous Languages' }}
      />
      <Stack.Screen
        name="motor-accessibility"
        options={{ title: 'Motor Accessibility' }}
      />
      <Stack.Screen
        name="neurodivergent"
        options={{ title: 'Neurodivergent Support' }}
      />
      <Stack.Screen
        name="neurodivergent.impl"
        options={{ title: 'Neurodivergent Support' }}
      />
      <Stack.Screen
        name="profile-editor"
        options={{ title: 'Profile Editor' }}
      />
      <Stack.Screen
        name="cognitive-comfort"
        options={{ title: 'Cognitive Comfort' }}
      />
      <Stack.Screen
        name="complexity-mode"
        options={{ title: 'Complexity Mode' }}
      />
      <Stack.Screen
        name="impact-dashboard"
        options={{ title: 'Impact Dashboard' }}
      />
      <Stack.Screen
        name="security"
        options={{ title: 'Security' }}
      />
      <Stack.Screen
        name="admin"
        options={{ title: 'Admin Panel' }}
      />
      <Stack.Screen
        name="admin-analytics"
        options={{ title: 'Analytics Dashboard' }}
      />
    </Stack>
  );
}
