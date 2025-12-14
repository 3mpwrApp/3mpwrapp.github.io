// Dynamic Expo config that properly handles environment variables for EAS builds
// This file wraps app.json and ensures EXPO_PUBLIC_* variables are available at runtime

const appJson = require('./app.json');

// Helper to get env var with fallback to app.json extra value
// This ensures OTA updates don't overwrite hardcoded values with undefined
function getEnvOrDefault(key, defaultValue) {
  return process.env[key] || appJson.expo.extra?.[key] || defaultValue;
}

module.exports = ({ config }) => {
  // Merge app.json config with dynamic environment variables
  // Important: Only override with process.env if the value exists, 
  // otherwise keep the hardcoded value from app.json
  return {
    ...config,
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      // Ensure all EXPO_PUBLIC_* env vars are available via Constants.expoConfig.extra
      // Use getEnvOrDefault to prevent undefined from overwriting good values
      EXPO_PUBLIC_DATA_POLICY: getEnvOrDefault('EXPO_PUBLIC_DATA_POLICY', 'hybrid_byoc'),
      EXPO_PUBLIC_GOOGLE_CLIENT_ID: getEnvOrDefault('EXPO_PUBLIC_GOOGLE_CLIENT_ID', '733708119893-vagikeh1bu36n9boma32ic2lbfvbff08.apps.googleusercontent.com'),
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: getEnvOrDefault('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID', '733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com'),
      EXPO_PUBLIC_SENTRY_DSN: getEnvOrDefault('EXPO_PUBLIC_SENTRY_DSN', undefined),
      EXPO_PUBLIC_EVENTS_API_BASE: getEnvOrDefault('EXPO_PUBLIC_EVENTS_API_BASE', 'https://3mpwrapp.pages.dev/api'),
      EXPO_PUBLIC_CAMPAIGNS_API_BASE: getEnvOrDefault('EXPO_PUBLIC_CAMPAIGNS_API_BASE', 'https://3mpwrapp.pages.dev/api'),
      EXPO_PUBLIC_API_BASE: getEnvOrDefault('EXPO_PUBLIC_API_BASE', 'https://3mpwrapp.pages.dev/api'),
      EXPO_PUBLIC_CALENDAR_FEED_URL: getEnvOrDefault('EXPO_PUBLIC_CALENDAR_FEED_URL', undefined),
      EXPO_PUBLIC_DISCORD_WEBHOOK_URL: getEnvOrDefault('EXPO_PUBLIC_DISCORD_WEBHOOK_URL', undefined),
      EXPO_PUBLIC_YT_API_KEY: getEnvOrDefault('EXPO_PUBLIC_YT_API_KEY', undefined),
      EXPO_PUBLIC_LLM_BASE: getEnvOrDefault('EXPO_PUBLIC_LLM_BASE', undefined),
      // EAS config - use the correct project ID from app.json
      eas: appJson.expo.extra?.eas || {
        projectId: "d9ce9c9a-c721-4a1a-9467-6ab3586cab4a"
      },
      router: appJson.expo.extra?.router || {},
    },
  };
};
