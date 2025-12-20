module.exports = function (api) {
  api.cache(true);

  // Apply CommonJS transform only for web platform to fix React Navigation module interop
  const platform = api.caller(caller => caller?.platform);
  const isWeb = platform === 'web';

  return {
    presets: ["babel-preset-expo"],
    plugins: isWeb ? [
      // Fix for "Cannot set property default" error with @react-navigation on web
      ["@babel/plugin-transform-modules-commonjs", {
        strict: false,
        allowTopLevelThis: true,
      }]
    ] : []
  };
};
