// Harden Metro config to avoid path errors on Windows by filtering modules
// without a real filepath. Export a static config object as expected by Expo.

const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add resolver to handle Firebase modules on web
config.resolver = {
  ...(config.resolver || {}),
  resolveRequest: (context, moduleName, platform) => {
    // Reject problematic packages that use import.meta or are Node.js-only
    const problematicPackages = [
      'deepl-node',          // Uses import.meta
      'firebase-admin',      // Node.js admin SDK
      'pdf-parse',           // Node.js only
      'puppeteer',           // Browser automation (Node.js)
      '@vitalets/google-translate-api', // Uses import.meta
      'cheerio',             // Node.js parsing
      'crypto-js',           // Can cause issues on web
    ];
    
    if (problematicPackages.some(pkg => moduleName.includes(pkg))) {
      return { type: 'empty' };
    }

    // Exclude Firebase native modules on web platform
    if (platform === 'web' && moduleName.startsWith('@react-native-firebase/')) {
      return { type: 'empty' };
    }

    // Use default resolution for everything else
    return context.resolveRequest(context, moduleName, platform);
  },
};

// Enable inlineRequires to improve startup/TTI on RN
// Set unstable_allowRequireContext to fix React Navigation module interop
config.transformer = {
  ...(config.transformer || {}),
  inlineRequires: true,
  unstable_allowRequireContext: true,
};

config.serializer = {
  ...(config.serializer || {}),
  processModuleFilter(module) {
    try {
      if (!module || !module.path) return false;
      
      // Filter out Node.js-only packages from bundle
      const nodejsPackages = [
        'deepl-node',
        'firebase-admin',
        'pdf-parse',
        'puppeteer',
        'google-translate-api',
        'cheerio',
        '/server/',
        '/scripts/',
        '/firebase/functions',
      ];
      
      const modulePath = module.path;
      if (nodejsPackages.some(pkg => modulePath.includes(pkg))) {
        return false; // Exclude from bundle
      }
      
      return true;
    } catch {
      return false;
    }
  },
};

module.exports = config;
