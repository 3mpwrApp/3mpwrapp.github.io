#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Bundle Analysis Script
 * Reports current bundle size and provides optimization recommendations
 * Run with: npm run perf:analyze
 */

const report = {
  timestamp: new Date().toISOString(),
  projectRoot,
  metrics: {},
  recommendations: [],
  details: {},
};

function log(message, level = 'info') {
  const prefix = {
    info: '📊',
    warn: '⚠️',
    success: '✅',
    error: '❌',
  }[level] || '•';

  console.log(`${prefix} ${message}`);
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function analyzeNodeModules() {
  log('Analyzing node_modules...', 'info');
  const nodeModulesPath = path.join(projectRoot, 'node_modules');

  if (!fs.existsSync(nodeModulesPath)) {
    log('node_modules not found', 'warn');
    return { size: 0, packages: 0, topPackages: [] };
  }

  let totalSize = 0;
  const packageSizes = [];

  try {
    const packages = fs.readdirSync(nodeModulesPath);

    packages.forEach(pkg => {
      const pkgPath = path.join(nodeModulesPath, pkg);
      try {
        const stats = fs.statSync(pkgPath);
        if (stats.isDirectory()) {
          const size = getDirectorySize(pkgPath);
          if (size > 0) {
            packageSizes.push({ name: pkg, size });
            totalSize += size;
          }
        }
      } catch (e) {
        // Skip inaccessible packages
      }
    });
  } catch (e) {
    log(`Error analyzing node_modules: ${e.message}`, 'warn');
  }

  const topPackages = packageSizes
    .sort((a, b) => b.size - a.size)
    .slice(0, 20);

  return {
    size: totalSize,
    packages: packageSizes.length,
    topPackages,
  };
}

function getDirectorySize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    });
  } catch (e) {
    // Ignore errors for inaccessible paths
  }
  return size;
}

function analyzeSourceCode() {
  log('Analyzing source code...', 'info');

  const patterns = {
    largeArrays: 0,
    largeObjects: 0,
    inlineImages: 0,
    heavyDependencies: 0,
  };

  const sourceDir = path.join(projectRoot, 'app');
  const servicesDir = path.join(projectRoot, 'services');
  const dataDir = path.join(projectRoot, 'data');

  [sourceDir, servicesDir, dataDir].forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = getAllFiles(dir);
    files.forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        analyzeFile(file, patterns);
      }
    });
  });

  return patterns;
}

function getAllFiles(dir) {
  let results = [];
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (file.startsWith('.')) return;
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        results = results.concat(getAllFiles(filePath));
      } else {
        results.push(filePath);
      }
    });
  } catch (e) {
    // Ignore errors
  }
  return results;
}

function analyzeFile(filePath, patterns) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check for large inline arrays
    if (/const\s+\w+\s*=\s*\[/.test(content) && lines.length > 50) {
      patterns.largeArrays++;
    }

    // Check for large inline objects
    if (/{[\s\S]*?[\s\S]{100,}[\s\S]*?}/.test(content)) {
      patterns.largeObjects++;
    }

    // Check for base64 images
    if (/data:image/.test(content)) {
      patterns.inlineImages++;
    }

    // Check for heavy dependencies
    if (
      /require.*moment|require.*lodash|require.*axios/.test(content) ||
      /import.*moment|import.*lodash|import.*axios/.test(content)
    ) {
      patterns.heavyDependencies++;
    }
  } catch (e) {
    // Ignore errors
  }
}

function analyzeDataFiles() {
  log('Analyzing bundled data files...', 'info');

  const dataDir = path.join(projectRoot, 'data');
  const dataFiles = {
    faqs: 0,
    jurisdictions: 0,
    resources: 0,
    other: 0,
  };

  let totalSize = 0;

  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir);
    files.forEach(file => {
      const filePath = path.join(dataDir, file);
      const size = getFileSize(filePath);
      totalSize += size;

      if (file.includes('faq')) dataFiles.faqs += size;
      else if (file.includes('jurisdiction')) dataFiles.jurisdictions += size;
      else if (file.includes('resource')) dataFiles.resources += size;
      else dataFiles.other += size;
    });
  }

  return { totalSize, breakdown: dataFiles };
}

function generateRecommendations(nodeModules, sourceCode, dataFiles) {
  const recs = [];

  // Recommendations based on metrics
  if (nodeModules.topPackages.length > 0) {
    const largestPkg = nodeModules.topPackages[0];
    if (largestPkg.size > 5 * 1024 * 1024) {
      recs.push(
        `Large package detected: "${largestPkg.name}" (${formatBytes(largestPkg.size)}) - Consider lazy loading or finding alternatives`
      );
    }
  }

  if (sourceCode.largeArrays > 5) {
    recs.push(
      `Found ${sourceCode.largeArrays} files with large inline arrays - Consider using lazyData service`
    );
  }

  if (sourceCode.inlineImages > 0) {
    recs.push(
      `Found ${sourceCode.inlineImages} base64 inline images - Use CDN image service instead`
    );
  }

  if (dataFiles.breakdown.faqs > 500 * 1024) {
    recs.push(
      `FAQs data (${formatBytes(dataFiles.breakdown.faqs)}) is bundled - Use lazyLoadFAQs()`
    );
  }

  if (dataFiles.breakdown.resources > 500 * 1024) {
    recs.push(
      `Resources data (${formatBytes(dataFiles.breakdown.resources)}) is bundled - Use lazyLoadResources()`
    );
  }

  if (dataFiles.breakdown.jurisdictions > 500 * 1024) {
    recs.push(
      `Jurisdictions data (${formatBytes(dataFiles.breakdown.jurisdictions)}) is bundled - Use lazyLoadJurisdictions()`
    );
  }

  return recs;
}

function analyzePackageJson() {
  log('Analyzing package.json...', 'info');

  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  const deps = {
    production: Object.keys(pkg.dependencies || {}).length,
    development: Object.keys(pkg.devDependencies || {}).length,
  };

  return deps;
}

function main() {
  console.log('\n🚀 Bundle Analysis Report\n');
  log(`Project: ${projectRoot}`, 'info');

  // Node modules analysis
  const nodeModules = analyzeNodeModules();
  report.metrics.nodeModules = {
    totalSize: formatBytes(nodeModules.size),
    packages: nodeModules.packages,
    topPackages: nodeModules.topPackages.slice(0, 10).map(p => ({
      name: p.name,
      size: formatBytes(p.size),
    })),
  };
  log(`node_modules: ${report.metrics.nodeModules.totalSize}`, 'info');

  // Source code analysis
  const sourceCode = analyzeSourceCode();
  report.metrics.sourceCode = sourceCode;
  log(
    `Found patterns: ${sourceCode.largeArrays} large arrays, ${sourceCode.inlineImages} inline images`,
    'info'
  );

  // Data files analysis
  const dataFiles = analyzeDataFiles();
  report.metrics.dataFiles = {
    totalSize: formatBytes(dataFiles.totalSize),
    breakdown: Object.entries(dataFiles.breakdown).reduce(
      (acc, [key, val]) => ({
        ...acc,
        [key]: formatBytes(val),
      }),
      {}
    ),
  };
  log(`Bundled data: ${report.metrics.dataFiles.totalSize}`, 'info');

  // Dependencies
  const deps = analyzePackageJson();
  report.metrics.dependencies = deps;
  log(
    `Dependencies: ${deps.production} production, ${deps.development} dev`,
    'info'
  );

  // Generate recommendations
  const recommendations = generateRecommendations(nodeModules, sourceCode, dataFiles);
  report.recommendations = recommendations;

  if (recommendations.length > 0) {
    console.log('\n📋 Optimization Recommendations:\n');
    recommendations.forEach((rec, idx) => {
      log(`${idx + 1}. ${rec}`, 'warn');
    });
  } else {
    log('No major optimizations recommended', 'success');
  }

  // Summary
  console.log('\n📈 Summary:\n');
  console.log(`  Total bundled data: ${report.metrics.dataFiles.totalSize}`);
  console.log(`  Dependencies: ${deps.production} prod`);
  console.log(`  Code patterns: ${sourceCode.largeArrays + sourceCode.largeObjects} large structures`);

  // Save detailed report
  const reportPath = path.join(projectRoot, 'bundle-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Report saved to: ${reportPath}`, 'success');

  console.log('\n✨ Use lazyData service for FAQs, jurisdictions, and resources');
  console.log('✨ Use cdnImage service for responsive image optimization\n');
}

try {
  main();
} catch (error) {
  log(`Analysis failed: ${error.message}`, 'error');
  process.exit(1);
}
