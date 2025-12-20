module.exports = function (api) {
  api.cache(true);

  // Only apply CommonJS transform for web platform (fixes React Navigation web bundling)
  // Native platforms (iOS/Android) need ES6 modules for Hermes bytecode generation
  const isWeb = process.env.EXPO_PLATFORM === 'web' || api.caller(caller => caller?.platform === 'web');

  return {
    presets: ["babel-preset-expo"],
    plugins: isWeb ? [
      // Fix for "Cannot set property default" error with @react-navigation on web
      ["@babel/plugin-transform-modules-commonjs", {
        strict: false,
        allowTopLevelThis: true
      }]
    ] : []
  };
};
