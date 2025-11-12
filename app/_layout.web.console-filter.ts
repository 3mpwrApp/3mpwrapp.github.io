// Web-specific console filtering to reduce React Native Web noise
// This runs before any React components mount

if (typeof window !== 'undefined' && __DEV__) {
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  
  // Comprehensive list of noisy but non-critical messages
  const webSuppressedPatterns = [
    // React Native Web deprecation warnings
    /shadow.*style props are deprecated/i,
    /Use.*boxShadow.*instead/i,
    
    // Expo notifications on web
    /expo-notifications.*not yet fully supported on web/i,
    /Listening to push token changes.*not yet fully supported on web/i,
    
    // Firebase verbose logs
    /Firebase.*performance.*not supported/i,
    /Firebase.*analytics.*not available/i,
    
    // React Native component warnings
    /VirtualizedLists should never be nested/i,
    /componentWillReceiveProps has been renamed/i,
    /componentWillMount has been renamed/i,
    /componentWillUpdate has been renamed/i,
    
    // Metro HMR logs
    /\[HMR\]/i,
    /\[Fast Refresh\]/i,
    
    // React DevTools
    /Download the React DevTools/i,
  ];
  
  const shouldSuppress = (message: string): boolean => {
    if (!message) return false;
    return webSuppressedPatterns.some(pattern => pattern.test(message));
  };
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalWarn.apply(console, args);
    }
  };
  
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalError.apply(console, args);
    }
  };
  
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    // For logs, be more selective - only suppress really noisy patterns
    const isVeryNoisy = /\[HMR\]|\[Fast Refresh\]|shadow.*deprecated/.test(message);
    if (!isVeryNoisy) {
      originalLog.apply(console, args);
    }
  };
  
  // Restore after 15 seconds to ensure real errors are visible during development
  setTimeout(() => {
    console.warn = originalWarn;
    console.error = originalError;
    console.log = originalLog;
    console.info('[3mpwr] Console filtering disabled - all messages will now appear');
  }, 15000);
}

export { };

