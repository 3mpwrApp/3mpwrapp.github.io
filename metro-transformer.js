// Custom Metro transformer to replace import.meta with polyfill for web builds
// This prevents "Cannot use 'import.meta' outside a module" errors

const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = async ({ src, filename, options }) => {
  // Apply default Expo transformation first
  const result = await upstreamTransformer.transform({ src, filename, options });
  
  // On web platform, replace import.meta with a polyfill
  if (options.platform === 'web' && result.output && result.output[0]) {
    result.output[0].data.code = result.output[0].data.code.replace(
      /import\.meta/g,
      '({url:typeof document!=="undefined"?document.currentScript?.src||window.location.href:""})'
    );
  }
  
  return result;
};
