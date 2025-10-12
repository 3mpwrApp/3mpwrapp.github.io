/**
 * Security Testing Configuration - MobSF, OWASP, and security scanning setup
 * Implements comprehensive security testing pipeline using free tools
 */

// MobSF (Mobile Security Framework) Configuration
export const mobsfConfig = {
  // Docker setup for MobSF
  docker: {
    image: 'opensecurity/mobsf:latest',
    ports: ['8000:8000'],
    volumes: [
      './builds:/app/uploads',
      './mobsf-reports:/app/StaticAnalyzer/reports'
    ],
    environment: {
      MOBSF_API_KEY: process.env.MOBSF_API_KEY || 'generate-secure-key'
    }
  },

  // API configuration
  api: {
    baseUrl: 'http://localhost:8000',
    endpoints: {
      upload: '/api/v1/upload',
      scan: '/api/v1/scan',
      report: '/api/v1/report_json',
      delete: '/api/v1/delete_scan'
    }
  },

  // Analysis configuration
  analysis: {
    // Static analysis settings
    static: {
      enabled: true,
      checkCode: true,
      checkManifest: true,
      checkResources: true,
      checkCertificates: true
    },

    // Dynamic analysis settings (requires emulator/device)
    dynamic: {
      enabled: false, // Enable when testing environment is ready
      duration: 300, // 5 minutes
      activity: 'comprehensive' // or 'basic'
    }
  },

  // Report configuration
  reporting: {
    format: ['json', 'pdf'],
    includeSource: false, // Don't include source code in reports
    outputDir: './security-reports/mobsf'
  }
};

// OWASP Dependency Check Configuration
export const owaspDependencyConfig = {
  // CLI configuration
  cli: {
    command: 'dependency-check',
    args: [
      '--project', 'EmpowrApp',
      '--scan', './package.json',
      '--scan', './node_modules',
      '--format', 'ALL',
      '--out', './security-reports/dependency-check',
      '--enableExperimental',
      '--prettyPrint'
    ]
  },

  // Suppression rules for false positives
  suppressions: [
    {
      cve: 'CVE-YYYY-XXXXX', // Example suppression
      reason: 'False positive - not applicable to our usage'
    }
  ],

  // Vulnerability database settings
  database: {
    autoUpdate: true,
    url: 'https://nvd.nist.gov/feeds/json/cve/1.1/'
  },

  // Thresholds for build failure
  thresholds: {
    critical: 0,   // Fail build if any critical vulnerabilities
    high: 0,       // Fail build if any high vulnerabilities
    medium: 5,     // Allow up to 5 medium vulnerabilities
    low: -1        // No limit on low vulnerabilities
  }
};

// SonarQube Community Edition Configuration
export const sonarqubeConfig = {
  // Docker setup
  docker: {
    image: 'sonarqube:community',
    ports: ['9000:9000'],
    environment: {
      SONAR_ES_BOOTSTRAP_CHECKS_DISABLE: 'true'
    },
    volumes: [
      'sonarqube_data:/opt/sonarqube/data',
      'sonarqube_logs:/opt/sonarqube/logs',
      'sonarqube_extensions:/opt/sonarqube/extensions'
    ]
  },

  // Project configuration
  project: {
    key: 'empowrapp',
    name: 'EmpowrApp',
    version: '1.0.0',
    sources: './app,./components,./services,./utils',
    exclusions: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/dist/**',
      '**/build/**'
    ]
  },

  // Security-focused rules
  qualityGate: {
    rules: [
      { metric: 'security_rating', condition: 'GT', threshold: '1' },
      { metric: 'reliability_rating', condition: 'GT', threshold: '1' },
      { metric: 'vulnerabilities', condition: 'GT', threshold: '0' },
      { metric: 'security_hotspots', condition: 'GT', threshold: '0' },
      { metric: 'bugs', condition: 'GT', threshold: '0' },
      { metric: 'code_smells', condition: 'GT', threshold: '20' },
      { metric: 'coverage', condition: 'LT', threshold: '80' }
    ]
  },

  // Scanner configuration
  scanner: {
    command: 'sonar-scanner',
    args: [
      '-Dsonar.projectKey=empowrapp',
      '-Dsonar.sources=./app,./components,./services,./utils',
      '-Dsonar.host.url=http://localhost:9000',
      '-Dsonar.login=' + (process.env.SONAR_TOKEN || ''),
      '-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info',
      '-Dsonar.typescript.lcov.reportPaths=coverage/lcov.info'
    ]
  }
};

// OWASP Mobile Top 10 Testing Framework
export const owaspMobileTop10Tests = {
  // M1: Improper Platform Usage
  m1_improper_platform_usage: {
    description: 'Testing for misuse of platform features or security controls',
    tests: [
      'Check for hardcoded encryption keys',
      'Verify proper keystore/keychain usage',
      'Test certificate validation bypasses',
      'Validate secure storage implementation',
      'Check for improper platform API usage'
    ],
    automated: true,
    tools: ['MobSF', 'Custom scripts']
  },

  // M2: Insecure Data Storage
  m2_insecure_data_storage: {
    description: 'Testing for insecure data storage vulnerabilities',
    tests: [
      'Check for unencrypted local storage',
      'Verify keychain/keystore protection',
      'Test database encryption',
      'Check for data in application logs',
      'Validate cache security',
      'Test backup security'
    ],
    automated: true,
    tools: ['MobSF', 'Custom data analysis']
  },

  // M3: Insecure Communication
  m3_insecure_communication: {
    description: 'Testing for insecure network communication',
    tests: [
      'Verify TLS 1.3 enforcement',
      'Test certificate pinning',
      'Check for cleartext traffic',
      'Validate hostname verification',
      'Test weak cipher suites',
      'Check for MITM vulnerabilities'
    ],
    automated: true,
    tools: ['Network analysis', 'Certificate validation']
  },

  // M4: Insecure Authentication
  m4_insecure_authentication: {
    description: 'Testing for authentication weaknesses',
    tests: [
      'Test passcode strength requirements',
      'Verify biometric authentication',
      'Check for authentication bypasses',
      'Test session management',
      'Validate multi-factor authentication'
    ],
    automated: false,
    tools: ['Manual testing', 'Custom authentication tests']
  },

  // M5: Insufficient Cryptography
  m5_insufficient_cryptography: {
    description: 'Testing for cryptographic vulnerabilities',
    tests: [
      'Verify AES-256 usage',
      'Test key generation randomness',
      'Check for deprecated algorithms',
      'Validate key management',
      'Test encryption implementation'
    ],
    automated: true,
    tools: ['MobSF', 'Cryptography analysis']
  },

  // M6: Insecure Authorization
  m6_insecure_authorization: {
    description: 'Testing for authorization flaws',
    tests: [
      'Test privilege escalation',
      'Verify access controls',
      'Check for authorization bypasses',
      'Test role-based access',
      'Validate permission checks'
    ],
    automated: false,
    tools: ['Manual testing', 'Access control tests']
  },

  // M7: Client Code Quality
  m7_client_code_quality: {
    description: 'Testing for code quality issues',
    tests: [
      'Static code analysis',
      'Buffer overflow testing',
      'Integer overflow testing',
      'Format string vulnerabilities',
      'Memory corruption testing'
    ],
    automated: true,
    tools: ['SonarQube', 'Static analysis tools']
  },

  // M8: Code Tampering
  m8_code_tampering: {
    description: 'Testing for code tampering protections',
    tests: [
      'Test anti-debugging measures',
      'Verify runtime application self-protection',
      'Check obfuscation effectiveness',
      'Test integrity verification',
      'Validate tamper detection'
    ],
    automated: true,
    tools: ['Custom tampering tests', 'Reverse engineering tools']
  },

  // M9: Reverse Engineering
  m9_reverse_engineering: {
    description: 'Testing for reverse engineering protections',
    tests: [
      'Test code obfuscation',
      'Verify anti-debugging mechanisms',
      'Check symbol stripping',
      'Test control flow obfuscation',
      'Validate string encryption'
    ],
    automated: true,
    tools: ['Reverse engineering tools', 'Obfuscation analysis']
  },

  // M10: Extraneous Functionality
  m10_extraneous_functionality: {
    description: 'Testing for hidden backdoors and functionality',
    tests: [
      'Check for debug code',
      'Test for hidden endpoints',
      'Verify functionality enumeration',
      'Check for testing backdoors',
      'Test for admin interfaces'
    ],
    automated: true,
    tools: ['Code review', 'Functionality testing']
  }
};

// Automated Security Testing Pipeline
export const securityTestingPipeline = {
  // Pre-commit hooks
  preCommit: [
    'Run dependency vulnerability scan',
    'Execute static security analysis',
    'Check for hardcoded secrets',
    'Validate input sanitization'
  ],

  // CI/CD integration
  cicd: [
    'Build security-hardened app',
    'Run MobSF static analysis',
    'Execute OWASP dependency check',
    'Run SonarQube security scan',
    'Perform OWASP Mobile Top 10 tests',
    'Generate security reports'
  ],

  // Manual testing checklist
  manual: [
    'Penetration testing',
    'Social engineering assessment',
    'Physical device security',
    'User privacy validation',
    'Compliance verification'
  ],

  // Reporting
  reporting: {
    formats: ['JSON', 'PDF', 'HTML'],
    distribution: ['Security team', 'Development team', 'Management'],
    schedule: 'After each build and weekly'
  }
};

// Security Testing Scripts
export const testingScripts = {
  // Install security tools
  setup: `
    # Install OWASP Dependency Check
    wget https://github.com/jeremylong/DependencyCheck/releases/download/v8.4.0/dependency-check-8.4.0-release.zip
    unzip dependency-check-8.4.0-release.zip

    # Setup MobSF
    docker pull opensecurity/mobsf:latest

    # Setup SonarQube
    docker pull sonarqube:community

    # Install additional tools
    npm install -g retire
    npm install -g audit-ci
  `,

  // Run all security tests
  runTests: `
    #!/bin/bash
    set -e

    echo "Starting security testing pipeline..."

    # 1. Dependency vulnerability scan
    echo "Running dependency check..."
    ./dependency-check/bin/dependency-check.sh --project EmpowrApp --scan package.json --format ALL --out ./security-reports/dependency-check

    # 2. Node.js security audit
    echo "Running npm audit..."
    npm audit --audit-level moderate

    # 3. Retire.js scan
    echo "Running retire.js scan..."
    retire --path . --outputformat json --outputpath ./security-reports/retire.json

    # 4. Build app for analysis
    echo "Building app..."
    npx eas build --platform android --profile production --local

    # 5. MobSF analysis
    echo "Starting MobSF analysis..."
    docker run -d -p 8000:8000 opensecurity/mobsf:latest
    # Wait for MobSF to start and upload APK for analysis

    # 6. SonarQube analysis
    echo "Running SonarQube scan..."
    docker run -d -p 9000:9000 sonarqube:community
    # Wait for SonarQube to start and run scanner

    echo "Security testing pipeline completed!"
  `,

  // Generate security report
  generateReport: `
    #!/bin/bash
    
    echo "Generating comprehensive security report..."
    
    # Collect all reports
    mkdir -p ./security-reports/consolidated
    
    # Merge JSON reports
    node ./scripts/merge-security-reports.js
    
    # Generate executive summary
    node ./scripts/generate-security-summary.js
    
    echo "Security report generated at ./security-reports/consolidated/"
  `
};

export default {
  mobsf: mobsfConfig,
  owaspDependency: owaspDependencyConfig,
  sonarqube: sonarqubeConfig,
  owaspMobile: owaspMobileTop10Tests,
  pipeline: securityTestingPipeline,
  scripts: testingScripts
};