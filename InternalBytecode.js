// Placeholder file to prevent Metro bundler ENOENT errors during symbolication
// This file is referenced by Metro's internal error handling but may not exist in all projects
// See: https://github.com/facebook/metro/issues/issues with symbolication

// Polyfill minimal tslib helper to prevent sentry-expo from crashing in Expo Go
// sentry-expo@7.x requires tslib@1.x but may try to load from non-existent paths
// This provides the __extends helper that Sentry needs (most commonly used)
if (typeof global !== 'undefined') {
  global.tslib = global.tslib || {};
  
  // Minimal __extends implementation (TypeScript class inheritance helper)
  global.tslib.__extends = global.tslib.__extends || function (d, b) {
    for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  
  // Minimal __assign implementation (Object.assign polyfill)
  global.tslib.__assign = global.tslib.__assign || function () {
    return Object.assign.apply(Object, arguments);
  };
  
  // Add other commonly used tslib helpers if needed
  global.tslib.__rest = global.tslib.__rest || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") {
      for (var i = 0, syms = Object.getOwnPropertySymbols(s); i < syms.length; i++) {
        if (e.indexOf(syms[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, syms[i])) t[syms[i]] = s[syms[i]];
      }
    }
    return t;
  };
}

// No-op export - this file prevents symbolication errors but has no runtime impact
module.exports = global.tslib || {};
