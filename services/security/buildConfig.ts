/**
 * Build Security Configuration
 * Defines security settings for production builds
 */

export const BUILD_SECURITY_CONFIG = {
  // Code obfuscation settings
  obfuscation: {
    enabled: true,
    minify: true,
    compress: true,
    mangle: true,
    dropDebugger: true,
    dropConsole: process.env.NODE_ENV === 'production'
  },

  // Bundle analysis
  bundleAnalysis: {
    enabled: true,
    reportPath: './bundle-analysis.json',
    maxBundleSize: '3.5MB'
  },

  // Source map settings (disabled in production for security)
  sourceMaps: {
    enabled: process.env.NODE_ENV !== 'production',
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map'
  },

  // Environment variable validation
  environmentValidation: {
    requiredVars: [
      'EXPO_PUBLIC_DATA_POLICY'
    ],
    forbiddenVars: [
      'EXPO_PUBLIC_API_KEY',
      'EXPO_PUBLIC_SECRET_KEY'
    ]
  }
};

/**
 * Validate build security configuration
 */
export function validateBuildSecurity(): boolean {
  try {
    // Check if obfuscation is enabled
    if (!BUILD_SECURITY_CONFIG.obfuscation.enabled) {
      console.warn('⚠️ Code obfuscation is disabled');
      return false;
    }

    // Check for forbidden environment variables
    const forbiddenVars = BUILD_SECURITY_CONFIG.environmentValidation.forbiddenVars;
    for (const varName of forbiddenVars) {
      if (process.env[varName]) {
        console.error(`❌ Forbidden environment variable found: ${varName}`);
        return false;
      }
    }

    // Check for required environment variables
    const requiredVars = BUILD_SECURITY_CONFIG.environmentValidation.requiredVars;
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        console.error(`❌ Required environment variable missing: ${varName}`);
        return false;
      }
    }

    console.log('✅ Build security configuration validated');
    return true;
  } catch (error) {
    console.error('❌ Build security validation failed:', error);
    return false;
  }
}