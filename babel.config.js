module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // No manual plugins needed: the Expo preset handles expo-router and Reanimated.
  };
};
