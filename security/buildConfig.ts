/**
 * Security Build Configuration - App hardening and obfuscation settings
 * This file configures build-time security measures for production builds
 */

// Android ProGuard/R8 Configuration
export const androidSecurityConfig = {
  // ProGuard/R8 obfuscation settings
  proguard: {
    enabled: true,
    shrinkResources: true,
    minifyEnabled: true,
    rules: [
      // Keep essential classes
      '-keep class com.empowrapp2.empowrapp.** { *; }',
      '-keep class expo.** { *; }',
      '-keep class com.facebook.react.** { *; }',
      
      // Obfuscate everything else
      '-obfuscationdictionary proguard-dictionary.txt',
      '-classobfuscationdictionary proguard-dictionary.txt',
      '-packageobfuscationdictionary proguard-dictionary.txt',
      
      // Anti-debugging
      '-assumenosideeffects class android.util.Log { *; }',
      '-assumenosideeffects class java.io.PrintStream { *; }',
      
      // Security hardening
      '-dontusemixedcaseclassnames',
      '-dontskipnonpubliclibraryclasses',
      '-verbose',
      
      // Anti-tampering
      '-adaptclassstrings',
      '-adaptresourcefilenames',
      '-adaptresourcefilecontents **.properties,META-INF/MANIFEST.MF'
    ]
  },

  // Additional Android hardening
  manifest: {
    permissions: {
      // Only essential permissions
      required: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE'
      ],
      // Explicitly deny dangerous permissions
      denied: [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.READ_CONTACTS',
        'android.permission.WRITE_CONTACTS',
        'android.permission.READ_CALENDAR',
        'android.permission.WRITE_CALENDAR',
        'android.permission.READ_SMS',
        'android.permission.SEND_SMS',
        'android.permission.CALL_PHONE',
        'android.permission.READ_PHONE_STATE'
      ]
    },
    
    security: {
      // Prevent debugging
      'android:debuggable': false,
      
      // Prevent backups
      'android:allowBackup': false,
      'android:fullBackupContent': false,
      
      // Network security
      'android:usesCleartextTraffic': false,
      'android:networkSecurityConfig': '@xml/network_security_config',
      
      // Hardware acceleration
      'android:hardwareAccelerated': true,
      
      // Screen capture protection for sensitive screens
      'android:allowScreenCapture': false // For sensitive activities
    }
  },

  // Build configuration
  build: {
    // Enable R8 full mode for maximum obfuscation
    r8FullMode: true,
    
    // Resource shrinking
    shrinkResources: true,
    
    // Split APKs for smaller size
    splits: {
      abi: {
        enable: true,
        universalApk: false
      },
      density: {
        enable: true
      }
    },

    // Signing configuration
    signing: {
      storeFile: 'release-key.keystore',
      keyAlias: 'release',
      // Note: Store passwords securely, not in code
      storePassword: process.env.ANDROID_KEYSTORE_PASSWORD,
      keyPassword: process.env.ANDROID_KEY_PASSWORD
    }
  }
};

// iOS Security Configuration
export const iosSecurityConfig = {
  // Code obfuscation settings
  obfuscation: {
    enabled: true,
    // Use built-in LLVM obfuscation
    swiftOptimization: '-O', // Optimize for speed
    bitcodeEnabled: true,
    
    // Symbol stripping
    stripDebugSymbols: true,
    stripSwiftSymbols: true,
    
    // Dead code elimination
    deadCodeStripping: true
  },

  // Info.plist security settings
  infoPlist: {
    // Prevent debugging
    'UIViewControllerBasedStatusBarAppearance': true,
    
    // Network security
    'NSAppTransportSecurity': {
      'NSAllowsArbitraryLoads': false,
      'NSExceptionDomains': {
        // Only allow user-configured domains in BYOC mode
        'localhost': {
          'NSExceptionAllowsInsecureHTTPLoads': true, // Only for development
          'NSExceptionMinimumTLSVersion': '1.3'
        }
      }
    },

    // Privacy descriptions (minimal set)
    'NSCameraUsageDescription': 'Used to capture evidence photos',
    'NSPhotoLibraryUsageDescription': 'Used to import evidence from your photo library',
    'NSMicrophoneUsageDescription': 'Used to record audio evidence',
    
    // Explicitly no location services
    // 'NSLocationUsageDescription': Intentionally omitted
    
    // Background execution
    'UIBackgroundModes': ['background-processing'], // Minimal background usage
    
    // Document types
    'CFBundleDocumentTypes': [
      {
        'CFBundleTypeName': 'Evidence File',
        'CFBundleTypeExtensions': ['empowr'],
        'CFBundleTypeRole': 'Editor'
      }
    ]
  },

  // Build settings
  build: {
    // Code signing
    codeSignIdentity: 'iPhone Distribution',
    provisioningProfile: process.env.IOS_PROVISIONING_PROFILE,
    
    // Security flags
    enableBitcode: true,
    validateWorkspace: true,
    
    // Optimization
    swiftOptimizationLevel: '-O',
    gccOptimizationLevel: 's', // Optimize for size
    
    // Debug settings for release
    debugInformationFormat: 'dwarf-with-dsym',
    stripDebugSymbolsInRelease: true,
    stripSwiftSymbolsInRelease: true,
    
    // Runtime checks
    enableAddressSanitizer: false, // Disable in release
    enableThreadSanitizer: false,  // Disable in release
    enableUndefinedBehaviorSanitizer: false // Disable in release
  }
};

// Web Security Configuration
export const webSecurityConfig = {
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"], // React requires unsafe-inline
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "blob:"],
    'font-src': ["'self'"],
    'connect-src': ["'self'", "https:"], // HTTPS only for external connections
    'media-src': ["'self'", "blob:"],
    'object-src': ["'none'"],
    'frame-src': ["'none'"],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"]
  },

  // Security headers
  headers: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  },

  // Webpack configuration for obfuscation
  webpack: {
    optimization: {
      minimize: true,
      concatenateModules: true,
      mangleExports: true,
      
      // Obfuscation plugins
      plugins: [
        // Add JavaScript obfuscation plugin
        // Add bundle analyzer for security review
      ]
    },

    // Source map handling
    devtool: 'hidden-source-map', // Source maps for debugging but not exposed
    
    // Module resolution security
    resolve: {
      symlinks: false, // Prevent symlink attacks
    }
  }
};

// EAS Build Configuration
export const easBuildConfig = {
  // Production build profile
  production: {
    android: {
      buildType: 'app-bundle',
      gradleCommand: ':app:bundleRelease',
      
      // Security environment variables
      env: {
        EXPO_PUBLIC_DATA_POLICY: 'strict_byoc',
        EXPO_NO_TELEMETRY: '1',
        NODE_ENV: 'production'
      },
      
      // Build caching for faster builds
      cache: {
        disabled: false,
        key: 'production-android-v1'
      }
    },

    ios: {
      buildConfiguration: 'Release',
      scheme: 'empowrapp',
      
      // Security environment variables
      env: {
        EXPO_PUBLIC_DATA_POLICY: 'strict_byoc',
        EXPO_NO_TELEMETRY: '1',
        NODE_ENV: 'production'
      },
      
      // Build caching
      cache: {
        disabled: false,
        key: 'production-ios-v1'
      }
    }
  },

  // Preview build for testing
  preview: {
    android: {
      buildType: 'apk',
      env: {
        EXPO_PUBLIC_DATA_POLICY: 'strict_byoc',
        NODE_ENV: 'production'
      }
    },
    
    ios: {
      buildConfiguration: 'Release',
      env: {
        EXPO_PUBLIC_DATA_POLICY: 'strict_byoc',
        NODE_ENV: 'production'
      }
    }
  }
};

// Security validation checks for builds
export const buildValidation = {
  // Pre-build security checks
  preBuild: [
    'Check for hardcoded secrets',
    'Validate environment variables',
    'Verify code signing certificates',
    'Run security linting',
    'Check dependency vulnerabilities'
  ],

  // Post-build security checks
  postBuild: [
    'Verify app signature',
    'Check binary obfuscation',
    'Validate permissions',
    'Test anti-debugging measures',
    'Run static analysis'
  ],

  // Required security tools
  tools: [
    'OWASP Dependency Check',
    'Semgrep for security scanning',
    'MobSF for mobile analysis',
    'SonarQube for code quality'
  ]
};

export default {
  android: androidSecurityConfig,
  ios: iosSecurityConfig,
  web: webSecurityConfig,
  eas: easBuildConfig,
  validation: buildValidation
};