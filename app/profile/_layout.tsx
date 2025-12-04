import { Stack } from 'expo-router';

import { useTranslation } from '../../i18n';
import { useAppPalette } from '../../theme/usePalette';

export default function ProfileLayout() {
  const palette = useAppPalette();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // ThemedHeader is shown at root level
        contentStyle: { backgroundColor: palette.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('nav.profile', 'Profile'),
        }}
      />
      <Stack.Screen
        name="editor"
        options={{
          title: t('profile.editProfile', 'Edit Profile'),
          presentation: 'modal',
          headerShown: true, // Show header for modal
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Stack>
  );
}
