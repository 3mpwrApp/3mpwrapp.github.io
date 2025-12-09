// Dynamic Expo config that properly handles environment variables for EAS builds
// This file wraps app.json and ensures EXPO_PUBLIC_* variables are available at runtime

const appJson = require('./app.json');

module.exports = ({ config }) => {
  // Merge app.json config with dynamic environment variables
  return {
    ...config,
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      // Ensure all EXPO_PUBLIC_* env vars are available via Constants.expoConfig.extra
      EXPO_PUBLIC_DATA_POLICY: process.env.EXPO_PUBLIC_DATA_POLICY || 'hybrid_byoc',
      EXPO_PUBLIC_GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
      EXPO_PUBLIC_EVENTS_API_BASE: process.env.EXPO_PUBLIC_EVENTS_API_BASE,
      EXPO_PUBLIC_CAMPAIGNS_API_BASE: process.env.EXPO_PUBLIC_CAMPAIGNS_API_BASE,
      EXPO_PUBLIC_API_BASE: process.env.EXPO_PUBLIC_API_BASE,
      EXPO_PUBLIC_CALENDAR_FEED_URL: process.env.EXPO_PUBLIC_CALENDAR_FEED_URL,
      EXPO_PUBLIC_DISCORD_WEBHOOK_URL: process.env.EXPO_PUBLIC_DISCORD_WEBHOOK_URL,
      EXPO_PUBLIC_YT_API_KEY: process.env.EXPO_PUBLIC_YT_API_KEY,
      EXPO_PUBLIC_LLM_BASE: process.env.EXPO_PUBLIC_LLM_BASE,
      // EAS config
      eas: appJson.expo.extra?.eas || {
        projectId: "6dd0264f-d796-4f63-9590-f82284a48354"
      },
      router: appJson.expo.extra?.router || {},
    },
  };
};
