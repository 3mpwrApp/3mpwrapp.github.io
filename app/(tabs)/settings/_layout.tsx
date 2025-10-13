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
      }}
    >
      <Stack.Screen
        name="advanced-accessibility"
        options={{ title: 'Advanced Accessibility' }}
      />
      <Stack.Screen
        name="advanced-security"
        options={{ title: 'Advanced Security' }}
      />
      <Stack.Screen
        name="cultural-safety"
        options={{ title: 'Cultural Safety' }}
      />
      <Stack.Screen
        name="neurodivergent"
        options={{ title: 'Neurodivergent Support' }}
      />
      <Stack.Screen
        name="indigenous-language"
        options={{ title: 'Indigenous Languages' }}
      />
    </Stack>
  );
}
