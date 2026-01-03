// Harden Metro config to avoid path errors on Windows by filtering modules
// without a real filepath. Export a static config object as expected by Expo.

const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add resolver to handle Firebase modules on web
config.resolver = {
  ...(config.resolver || {}),
  resolveRequest: (context, moduleName, platform) => {
    // Exclude Firebase native modules on web platform
    if (platform === 'web' && moduleName.startsWith('@react-native-firebase/')) {
      // Return a mock module path for web
      return {
        type: 'empty',
      };
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
      return true;
    } catch {
      return false;
    }
  },
  experimentalSerializerHook(graph /*: any*/) {
    try {
      // For Metro >=0.80 graph.dependencies is a Map
      const deps = graph?.dependencies;
      if (deps && typeof deps.forEach === "function") {
        const toDelete = [];
        deps.forEach((mod, key) => {
          if (!mod || !mod.path) toDelete.push(key);
        });
        toDelete.forEach((k) => deps.delete(k));
      }
    } catch {}
  },
};

module.exports = config;
