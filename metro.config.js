// Harden Metro config to avoid path errors on Windows by filtering modules
// without a real filepath. Export a static config object as expected by Expo.
// Additionally, disable the Expo forked serializer which can trigger
// path.relative calls on undefined module paths in some environments.
process.env.EXPO_USE_METRO_FORK = "0";
process.env.EXPO_NO_METRO_FORK = "1";
const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

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
