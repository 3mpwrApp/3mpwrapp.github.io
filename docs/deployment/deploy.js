#!/usr/bin/env node

/**
 * DEPLOYMENT VERIFICATION & STARTUP SCRIPT
 * 
 * This script verifies the environment and starts the autonomous agents.
 * 
 * Usage:
 *   node deploy.js
 *   npm start
 * 
 * Requirements:
 *   - Node.js >= 18
 *   - ANTHROPIC_API_KEY environment variable
 *   - npm dependencies installed
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const LOG_DIR = path.join(__dirname, 'logs', 'agents');
const CONFIG_DIR = path.join(__dirname, '_data');

class DeploymentVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icon = {
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${icon} ${message}`);

    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
    if (type === 'success') this.success.push(message);
  }

  verifyNodeVersion() {
    const version = process.version.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!version) {
      this.log('Unable to determine Node.js version', 'error');
      return false;
    }

    const [, major] = version;
    if (parseInt(major) < 18) {
      this.log(`Node.js version ${process.version} is too old. Requires 18.0.0 or higher`, 'error');
      return false;
    }

    this.log(`Node.js version check passed: ${process.version}`, 'success');
    return true;
  }

  verifyEnvironmentVariables() {
    if (!process.env.GITHUB_TOKEN) {
      this.log('GITHUB_TOKEN environment variable not found!', 'error');
      
      // Detect OS and provide appropriate command
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        this.log('PowerShell: $env:GITHUB_TOKEN = "ghp_..."', 'warning');
        this.log('Or create .env file with: GITHUB_TOKEN=ghp_...', 'warning');
      } else {
        this.log('Bash/Mac/Linux: export GITHUB_TOKEN="ghp_..."', 'warning');
      }
      return false;
    }

    const keyPrefix = process.env.GITHUB_TOKEN.substring(0, 10);
    this.log(`GITHUB_TOKEN found (${keyPrefix}...)`, 'success');
    return true;
  }

  verifyDependencies() {
    const requiredPackages = [
      'openai',
      'rss-parser',
      'luxon',
      'dotenv'
    ];

    const packageJsonPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.log('package.json not found', 'error');
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    let allPresent = true;
    for (const pkg of requiredPackages) {
      if (allDeps[pkg]) {
        this.log(`Dependency found: ${pkg} (${allDeps[pkg]})`, 'success');
      } else {
        this.log(`Dependency missing: ${pkg}`, 'error');
        allPresent = false;
      }
    }

    if (!allPresent) {
      this.log('Run: npm install', 'warning');
    }

    return allPresent;
  }

  verifyNodeModules() {
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      this.log('node_modules directory not found', 'error');
      this.log('Run: npm install', 'warning');
      return false;
    }

    this.log('node_modules directory found', 'success');
    return true;
  }

  verifyAgentFiles() {
    const agentFiles = [
      'scripts/agent-orchestrator.js',
      'scripts/agent-curation-production.js',
      'scripts/agent-blog-production.js'
    ];

    let allPresent = true;
    for (const file of agentFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        this.log(`Agent file found: ${file} (${stats.size} bytes)`, 'success');
      } else {
        this.log(`Agent file missing: ${file}`, 'error');
        allPresent = false;
      }
    }

    return allPresent;
  }

  verifyConfigFiles() {
    const configFiles = [
      '_data/curator.json',
      '_data/content-linking.json',
      '_data/email-segmentation.json'
    ];

    let allPresent = true;
    for (const file of configFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        this.log(`Config file found: ${file} (${stats.size} bytes)`, 'success');
      } else {
        this.log(`Config file missing: ${file}`, 'warning');
        allPresent = false;
      }
    }

    return allPresent;
  }

  createLogsDirectory() {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
      this.log(`Created logs directory: ${LOG_DIR}`, 'success');
    } else {
      this.log(`Logs directory exists: ${LOG_DIR}`, 'success');
    }
    return true;
  }

  runAllVerifications() {
    console.log('\n' + '='.repeat(60));
    console.log('AUTONOMOUS AGENT DEPLOYMENT VERIFICATION');
    console.log('='.repeat(60) + '\n');

    this.log('Starting verification...', 'info');
    console.log();

    this.log('Step 1: Verifying Node.js version', 'info');
    const nodeOk = this.verifyNodeVersion();
    console.log();

    this.log('Step 2: Verifying environment variables', 'info');
    const envOk = this.verifyEnvironmentVariables();
    console.log();

    this.log('Step 3: Verifying npm dependencies declared', 'info');
    const depsOk = this.verifyDependencies();
    console.log();

    this.log('Step 4: Verifying node_modules installed', 'info');
    const modulesOk = this.verifyNodeModules();
    console.log();

    this.log('Step 5: Verifying agent files', 'info');
    const agentsOk = this.verifyAgentFiles();
    console.log();

    this.log('Step 6: Verifying config files', 'info');
    const configOk = this.verifyConfigFiles();
    console.log();

    this.log('Step 7: Creating logs directory', 'info');
    this.createLogsDirectory();
    console.log();

    // Summary
    console.log('='.repeat(60));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(60) + '\n');

    this.log(`✅ Successful checks: ${this.success.length}`, 'info');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, 'info');
    this.log(`❌ Errors: ${this.errors.length}`, 'info');
    console.log();

    if (this.errors.length > 0) {
      console.log('ERRORS FOUND:');
      this.errors.forEach(err => console.log(`  ❌ ${err}`));
      console.log();
    }

    if (this.warnings.length > 0) {
      console.log('WARNINGS:');
      this.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
      console.log();
    }

    const allOk = nodeOk && envOk && depsOk && modulesOk && agentsOk;
    return allOk;
  }

  async startAgents() {
    console.log('='.repeat(60));
    console.log('STARTING AUTONOMOUS AGENTS');
    console.log('='.repeat(60) + '\n');

    this.log('Launching agent orchestrator...', 'info');
    console.log();

    // Start the orchestrator
    const orchestrator = spawn('node', ['scripts/agent-orchestrator.js', 'deploy'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    });

    orchestrator.on('error', (error) => {
      this.log(`Failed to start agents: ${error.message}`, 'error');
      process.exit(1);
    });

    orchestrator.on('exit', (code) => {
      if (code !== 0) {
        this.log(`Agents exited with code ${code}`, 'error');
        process.exit(code);
      }
    });
  }

  async run() {
    // Verify environment
    const verified = this.runAllVerifications();

    if (!verified) {
      console.log('\n❌ Deployment verification failed!');
      console.log('Please fix the errors above and try again.\n');
      process.exit(1);
    }

    console.log('✅ All verifications passed! Ready to deploy.\n');
    console.log('Starting agents in 3 seconds...');
    console.log('Press Ctrl+C to stop agents.\n');

    // Wait 3 seconds then start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start agents
    this.startAgents();
  }
}

// Run deployment verification and start
const verifier = new DeploymentVerifier();
verifier.run().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
