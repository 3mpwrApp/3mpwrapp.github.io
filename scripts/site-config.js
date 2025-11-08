#!/usr/bin/env node
/**
 * SITE-CONFIG.JS
 * Centralized site configuration for all scripts
 * 
 * This ensures all scripts use the same site URL and configuration,
 * preventing hardcoded URLs and inconsistencies.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load site URL from _config.yml
 */
function loadSiteUrl() {
  const configPath = path.join(process.cwd(), '_config.yml');
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    // Parse the url line from _config.yml (handles both quoted and unquoted values)
    const urlMatch = configContent.match(/^url:\s*(?:["'](.+?)["']|([^\s#]+))/m);
    if (urlMatch) {
      // Return the captured group (either quoted or unquoted)
      return urlMatch[1] || urlMatch[2];
    }
  } catch (err) {
    console.warn('Warning: Could not read _config.yml, using default URL');
  }
  
  // Fallback to Cloudflare Pages URL (primary site)
  return 'https://3mpwrapp.pages.dev';
}

/**
 * Site configuration object
 */
const siteConfig = {
  // Site URL (from _config.yml or environment variable)
  url: process.env.SITE_URL || loadSiteUrl(),
  
  // Site title
  title: '3mpwrApp',
  
  // Default user agent for API requests
  userAgent: '3mpwrApp/1.0',
  
  /**
   * Get full user agent string with site URL
   */
  getUserAgent() {
    return `${this.userAgent} (+${this.url}/)`;
  },
  
  /**
   * Construct absolute URL from path
   * @param {string} path - Path starting with / 
   * @returns {string} - Full URL
   */
  getAbsoluteUrl(path) {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    // Remove trailing slash from url and add path
    return `${this.url.replace(/\/$/, '')}${normalizedPath}`;
  }
};

module.exports = siteConfig;
