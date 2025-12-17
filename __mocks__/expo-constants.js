/**
 * Mock for expo-constants
 * Provides test values for Constants.expoConfig
 */
module.exports = {
  default: {
    expoConfig: {
      extra: {
        EXPO_PUBLIC_DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/test/test',
        EXPO_PUBLIC_DATA_POLICY: 'hybrid_byoc',
        EXPO_PUBLIC_EVENTS_API_BASE: 'https://3mpwrapp.pages.dev/api',
        EXPO_PUBLIC_CAMPAIGNS_API_BASE: 'https://3mpwrapp.pages.dev/api',
        EXPO_PUBLIC_API_BASE: 'https://3mpwrapp.pages.dev/api',
        eas: {
          projectId: 'd9ce9c9a-c721-4a1a-9467-6ab3586cab4a',
        },
      },
      name: '3mpwr',
      slug: '3mpwr',
      version: '1.0.0',
    },
    appOwnership: 'standalone',
    debugMode: false,
    deviceName: 'Test Device',
    expoVersion: '52.0.0',
    isDevice: true,
    platform: {
      ios: {},
      android: {},
    },
  },
  Constants: {
    expoConfig: {
      extra: {
        EXPO_PUBLIC_DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/test/test',
      },
    },
  },
};
