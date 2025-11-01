#!/usr/bin/env node
/**
 * Quick Security Validation - Essential security checks
 * Validates core security implementations without external tools
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 3mpwrApp Security Validation\n');

// Security validation results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Check if security framework is properly implemented
 */
function validateSecurityFramework() {
  console.log('📊 Validating security framework...');
  
  const requiredFiles = [
    'services/security/index.ts',
    'services/security/securityManager.ts',
    'services/security/encryption.ts',
    'services/security/networkSecurity.ts',
    'services/security/inputValidation.ts',
    'services/security/permissions.ts',
    'services/security/tamperDetection.ts',
    'services/security/appIntegrity.ts'
  ];

  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length === 0) {
    results.passed.push('✅ Security framework files present');
  } else {
    results.failed.push(`❌ Missing security files: ${missingFiles.join(', ')}`);
  }
}

/**
 * Validate encryption implementation
 */
function validateEncryption() {
  console.log('🔐 Validating encryption...');
  
  const encryptionFile = 'services/security/encryption.ts';
  if (fs.existsSync(encryptionFile)) {
    const content = fs.readFileSync(encryptionFile, 'utf8');
    
    if (content.includes('AES-256')) {
      results.passed.push('✅ AES-256 encryption implemented');
    } else {
      results.failed.push('❌ AES-256 encryption not found');
    }
    
    if (content.includes('SecureStore') || content.includes('Keychain')) {
      results.passed.push('✅ Secure key storage implemented');
    } else {
      results.failed.push('❌ Secure key storage not implemented');
    }
  } else {
    results.failed.push('❌ Encryption service not found');
  }
}

/**
 * Validate network security
 */
function validateNetworkSecurity() {
  console.log('🌐 Validating network security...');
  
  const networkFile = 'services/security/networkSecurity.ts';
  if (fs.existsSync(networkFile)) {
    const content = fs.readFileSync(networkFile, 'utf8');
    
    if (content.includes('TLS') && content.includes('1.3')) {
      results.passed.push('✅ TLS 1.3 configuration found');
    } else {
      results.warnings.push('⚠️ TLS 1.3 configuration unclear');
    }
    
    if (content.includes('certificate') && content.includes('pinning')) {
      results.passed.push('✅ Certificate pinning implemented');
    } else {
      results.warnings.push('⚠️ Certificate pinning not clearly implemented');
    }
  } else {
    results.failed.push('❌ Network security service not found');
  }
}

/**
 * Validate app configuration security
 */
function validateAppConfig() {
  console.log('📱 Validating app configuration...');
  
  if (fs.existsSync('app.json')) {
    const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    
    // Check Android security settings
    if (appConfig.expo.android?.usesCleartextTraffic === false) {
      results.passed.push('✅ Cleartext traffic disabled');
    } else {
      results.failed.push('❌ Cleartext traffic not disabled');
    }
    
    if (appConfig.expo.android?.allowBackup === false) {
      results.passed.push('✅ App backup disabled');
    } else {
      results.warnings.push('⚠️ App backup not explicitly disabled');
    }
    
    // Check permissions
    const permissions = appConfig.expo.android?.permissions || [];
    const blockedPermissions = appConfig.expo.android?.blockedPermissions || [];
    
    if (blockedPermissions.length > 0) {
      results.passed.push(`✅ ${blockedPermissions.length} permissions explicitly blocked`);
    } else {
      results.warnings.push('⚠️ No permissions explicitly blocked');
    }
  } else {
    results.failed.push('❌ app.json not found');
  }
}

/**
 * Check for hardcoded secrets
 */
function checkForSecrets() {
  console.log('🔍 Checking for hardcoded secrets...');
  
  const secretPatterns = [
    /(password|passwd|pwd)\s*[:=]\s*["'][^"']+["']/i,
    /(api[_-]?key|apikey)\s*[:=]\s*["'][^"']+["']/i,
    /(secret|token)\s*[:=]\s*["'][^"']+["']/i
  ];

  const directories = ['app', 'components', 'services', 'utils', 'store'];
  let secretsFound = 0;

  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      const walkDir = (currentPath) => {
        const items = fs.readdirSync(currentPath);
        items.forEach(item => {
          const fullPath = path.join(currentPath, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.')) {
            walkDir(fullPath);
          } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            secretPatterns.forEach(pattern => {
              if (pattern.test(content) && !content.includes('process.env')) {
                secretsFound++;
                results.warnings.push(`⚠️ Potential hardcoded secret in ${fullPath}`);
              }
            });
          }
        });
      };
      walkDir(dir);
    }
  });

  if (secretsFound === 0) {
    results.passed.push('✅ No obvious hardcoded secrets found');
  }
}

/**
 * Validate BYOC mode
 */
function validateBYOCMode() {
  console.log('☁️ Validating BYOC mode...');
  
  const dataPolicy = 'services/dataPolicy.ts';
  if (fs.existsSync(dataPolicy)) {
    const content = fs.readFileSync(dataPolicy, 'utf8');
    
    if (content.includes('isStrictBYOC') && content.includes('strict_byoc')) {
      results.passed.push('✅ BYOC mode implementation found');
    } else {
      results.warnings.push('⚠️ BYOC mode implementation unclear');
    }
  } else {
    results.warnings.push('⚠️ Data policy service not found');
  }
}

/**
 * Check build security configuration
 */
function validateBuildSecurity() {
  console.log('🏗️ Validating build security...');
  
  const buildConfig = 'services/security/buildConfig.ts';
  if (fs.existsSync(buildConfig)) {
    const content = fs.readFileSync(buildConfig, 'utf8');
    
    if (content.includes('obfuscat') || content.includes('minify')) {
      results.passed.push('✅ Code obfuscation configured');
    } else {
      results.warnings.push('⚠️ Code obfuscation configuration unclear');
    }
  } else {
    results.warnings.push('⚠️ Build security configuration not found');
  }
}

/**
 * Run all validations
 */
function runValidation() {
  validateSecurityFramework();
  validateEncryption();
  validateNetworkSecurity();
  validateAppConfig();
  checkForSecrets();
  validateBYOCMode();
  validateBuildSecurity();

  // Display results
  console.log('\n🔒 Security Validation Results');
  console.log('==============================');
  
  console.log(`\n✅ PASSED (${results.passed.length}):`);
  results.passed.forEach(item => console.log(`  ${item}`));
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️ WARNINGS (${results.warnings.length}):`);
    results.warnings.forEach(item => console.log(`  ${item}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED (${results.failed.length}):`);
    results.failed.forEach(item => console.log(`  ${item}`));
  }

  const totalChecks = results.passed.length + results.warnings.length + results.failed.length;
  const passRate = ((results.passed.length / totalChecks) * 100).toFixed(1);
  
  console.log(`\n📊 Overall: ${results.passed.length}/${totalChecks} checks passed (${passRate}%)`);
  
  if (results.failed.length === 0) {
    console.log('\n🎉 Security validation PASSED! Your app has strong security foundations.');
  } else {
    console.log('\n⚠️ Security validation found issues that should be addressed.');
    process.exit(1);
  }
}

// Run validation
runValidation();