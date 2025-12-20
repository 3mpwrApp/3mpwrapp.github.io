module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Fix for "Cannot set property default" error with @react-navigation on web
      ["@babel/plugin-transform-modules-commonjs", {
        strict: false,
        allowTopLevelThis: true
      }]
    ]
  };
};
