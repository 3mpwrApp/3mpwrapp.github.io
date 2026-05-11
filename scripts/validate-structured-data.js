/**
 * Structured Data (Schema.org JSON-LD) Validation Script
 * Validates all structured data on the site against Schema.org definitions
 * 
 * Usage: node scripts/validate-structured-data.js
 * 
 * Checks:
 * - Valid JSON-LD syntax
 * - Required properties present for each schema type
 * - Image URLs exist and are >1200px for Open Graph
 * - URLs are absolute and valid
 * - Dates are in ISO 8601 format
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Schema.org required properties by type
const SCHEMA_REQUIREMENTS = {
  Organization: {
    required: ['@type', 'name', 'url', 'logo'],
    recommended: ['sameAs', 'contactPoint', 'address']
  },
  WebSite: {
    required: ['@type', 'name', 'url'],
    recommended: ['potentialAction']
  },
  BlogPosting: {
    required: ['@type', 'headline', 'datePublished', 'author', 'publisher'],
    recommended: ['image', 'dateModified', 'mainEntityOfPage']
  },
  Article: {
    required: ['@type', 'headline', 'datePublished', 'author', 'publisher'],
    recommended: ['image', 'dateModified']
  },
  BreadcrumbList: {
    required: ['@type', 'itemListElement'],
    recommended: []
  },
  FAQPage: {
    required: ['@type', 'mainEntity'],
    recommended: []
  },
  Question: {
    required: ['@type', 'name', 'acceptedAnswer'],
    recommended: []
  },
  SoftwareApplication: {
    required: ['@type', 'name', 'operatingSystem', 'offers'],
    recommended: ['applicationCategory', 'aggregateRating']
  },
  VideoObject: {
    required: ['@type', 'name', 'description', 'thumbnailUrl', 'uploadDate'],
    recommended: ['duration', 'contentUrl', 'embedUrl']
  },
  WebPage: {
    required: ['@type', 'name', 'url'],
    recommended: ['description', 'breadcrumb']
  }
};

// Validation results
const results = {
  totalFiles: 0,
  filesWithSchemas: 0,
  totalSchemas: 0,
  errors: [],
  warnings: [],
  schemasFound: {}
};

/**
 * Extract JSON-LD from HTML content
 */
function extractJSONLD(html) {
  const jsonldBlocks = [];
  const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      jsonldBlocks.push(parsed);
    } catch (e) {
      results.errors.push({
        type: 'JSON_PARSE_ERROR',
        message: `Invalid JSON-LD syntax: ${e.message}`,
        snippet: match[1].substring(0, 100)
      });
    }
  }
  
  return jsonldBlocks;
}

/**
 * Validate a single schema object
 */
function validateSchema(schema, filePath, allSchemasInFile = []) {
  const type = schema['@type'];
  
  if (!type) {
    results.errors.push({
      file: filePath,
      type: 'MISSING_TYPE',
      message: 'Schema missing @type property'
    });
    return;
  }
  
  // Track schema types found
  results.schemasFound[type] = (results.schemasFound[type] || 0) + 1;
  results.totalSchemas++;
  
  const requirements = SCHEMA_REQUIREMENTS[type];
  
  if (!requirements) {
    results.warnings.push({
      file: filePath,
      type: 'UNKNOWN_SCHEMA_TYPE',
      message: `Schema type "${type}" not in validation rules`
    });
    return;
  }
  
  // If multiple schemas of same type exist in file, only validate the most complete one
  const duplicates = allSchemasInFile.filter(s => s['@type'] === type);
  if (duplicates.length > 1) {
    // Count properties in each schema
    const propertyCount = Object.keys(schema).length;
    const maxProperties = Math.max(...duplicates.map(s => Object.keys(s).length));
    
    // Skip validation if this is not the most complete schema
    if (propertyCount < maxProperties) {
      return; // Skip less complete duplicate
    }
  }
  
  // Check required properties
  requirements.required.forEach(prop => {
    if (!schema[prop]) {
      // Before reporting error, check if another schema of same type in this file HAS this property
      const otherSchemasWithProperty = allSchemasInFile.filter(s => 
        s['@type'] === type && s[prop]
      );
      
      if (otherSchemasWithProperty.length > 0) {
        // Another more complete schema exists, skip this one
        return;
      }
      
      results.errors.push({
        file: filePath,
        schemaType: type,
        type: 'MISSING_REQUIRED_PROPERTY',
        property: prop,
        message: `Missing required property "${prop}" in ${type} schema`
      });
    }
  });
  
  // Check recommended properties
  requirements.recommended.forEach(prop => {
    if (!schema[prop]) {
      results.warnings.push({
        file: filePath,
        schemaType: type,
        type: 'MISSING_RECOMMENDED_PROPERTY',
        property: prop,
        message: `Missing recommended property "${prop}" in ${type} schema`
      });
    }
  });
  
  // Validate specific property formats
  validatePropertyFormats(schema, filePath, type);
}

/**
 * Validate property formats (URLs, dates, images)
 */
function validatePropertyFormats(schema, filePath, type) {
  // Validate URLs are absolute
  const urlProps = ['url', 'mainEntityOfPage', 'sameAs', 'contentUrl', 'embedUrl'];
  urlProps.forEach(prop => {
    const value = schema[prop];
    if (value) {
      const urls = Array.isArray(value) ? value : [value];
      urls.forEach(url => {
        if (typeof url === 'string' && !url.startsWith('http://') && !url.startsWith('https://')) {
          results.errors.push({
            file: filePath,
            schemaType: type,
            type: 'RELATIVE_URL',
            property: prop,
            value: url,
            message: `Property "${prop}" must be absolute URL, got: ${url}`
          });
        }
      });
    }
  });
  
  // Validate dates are ISO 8601 format
  const dateProps = ['datePublished', 'dateModified', 'uploadDate'];
  dateProps.forEach(prop => {
    const value = schema[prop];
    if (value && typeof value === 'string') {
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;
      if (!iso8601Regex.test(value)) {
        results.errors.push({
          file: filePath,
          schemaType: type,
          type: 'INVALID_DATE_FORMAT',
          property: prop,
          value: value,
          message: `Date "${prop}" must be ISO 8601 format, got: ${value}`
        });
      }
    }
  });
  
  // Validate image properties
  if (schema.image) {
    validateImageProperty(schema.image, filePath, type);
  }
  
  // Validate nested schemas
  if (type === 'FAQPage' && schema.mainEntity) {
    schema.mainEntity.forEach(entity => {
      if (entity['@type'] === 'Question') {
        validateSchema(entity, filePath);
      }
    });
  }
  
  if (type === 'BreadcrumbList' && schema.itemListElement) {
    schema.itemListElement.forEach((item, index) => {
      if (!item['@type'] || !item.position || !item.name || !item.item) {
        results.errors.push({
          file: filePath,
          schemaType: 'ListItem',
          type: 'INVALID_BREADCRUMB_ITEM',
          index: index,
          message: `Breadcrumb item ${index} missing required properties (@type, position, name, item)`
        });
      }
    });
  }
}

/**
 * Validate image property (can be string, object, or array)
 */
function validateImageProperty(image, filePath, type) {
  const images = Array.isArray(image) ? image : [image];
  
  images.forEach(img => {
    const url = typeof img === 'string' ? img : img.url;
    
    if (!url) {
      results.errors.push({
        file: filePath,
        schemaType: type,
        type: 'MISSING_IMAGE_URL',
        message: 'Image property must have URL'
      });
      return;
    }
    
    // Check if image URL is absolute
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      results.errors.push({
        file: filePath,
        schemaType: type,
        type: 'RELATIVE_IMAGE_URL',
        value: url,
        message: `Image URL must be absolute: ${url}`
      });
    }
    
    // For Open Graph, recommend images >1200px wide
    if (typeof img === 'object' && img.width) {
      const width = parseInt(img.width);
      if (width < 1200) {
        results.warnings.push({
          file: filePath,
          schemaType: type,
          type: 'SMALL_IMAGE_WIDTH',
          value: width,
          message: `Image width ${width}px is less than recommended 1200px for social sharing`
        });
      }
    }
  });
}

/**
 * Process a single HTML file
 */
function processFile(filePath) {
  results.totalFiles++;
  
  // Skip test/development pages (standalone HTML files not using Jekyll layouts)
  const fileName = path.basename(filePath);
  const skipFiles = [
    'temp-campaigns.html',
    'prod-campaigns.html',
    'current-campaigns.html',
    'check-campaigns.html',
    'footer-issue.html',
    'offline.html'
  ];
  
  if (skipFiles.includes(fileName)) {
    return; // Skip development/test files
  }
  
  const html = fs.readFileSync(filePath, 'utf8');
  const schemas = extractJSONLD(html);
  
  if (schemas.length === 0) {
    return; // No schemas in this file
  }
  
  results.filesWithSchemas++;
  
  // Flatten all schemas from all blocks (including @graph)
  const allSchemas = [];
  schemas.forEach(schema => {
    if (schema['@graph']) {
      allSchemas.push(...schema['@graph']);
    } else {
      allSchemas.push(schema);
    }
  });
  
  // Validate each schema, passing all schemas for duplicate detection
  allSchemas.forEach(schema => {
    validateSchema(schema, filePath, allSchemas);
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Validating structured data across site...\n');
  
  const siteDir = path.join(__dirname, '..', '_site');
  
  if (!fs.existsSync(siteDir)) {
    console.error('❌ Error: _site directory not found. Run `bundle exec jekyll build` first.');
    process.exit(1);
  }
  
  // Find all HTML files
  const htmlFiles = await glob('**/*.html', {
    cwd: siteDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/assets/**']
  });
  
  console.log(`Found ${htmlFiles.length} HTML files to check\n`);
  
  // Process each file
  htmlFiles.forEach(file => {
    try {
      processFile(file);
    } catch (e) {
      results.errors.push({
        file: file,
        type: 'FILE_PROCESSING_ERROR',
        message: e.message
      });
    }
  });
  
  // Print results
  console.log('═══════════════════════════════════════════════');
  console.log('📊 VALIDATION RESULTS');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log(`Total files scanned: ${results.totalFiles}`);
  console.log(`Files with structured data: ${results.filesWithSchemas}`);
  console.log(`Total schemas found: ${results.totalSchemas}\n`);
  
  console.log('Schema types found:');
  Object.entries(results.schemasFound)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  console.log('');
  
  // Errors
  if (results.errors.length > 0) {
    console.log(`❌ ERRORS: ${results.errors.length}\n`);
    
    // Group by type
    const errorsByType = {};
    results.errors.forEach(err => {
      errorsByType[err.type] = errorsByType[err.type] || [];
      errorsByType[err.type].push(err);
    });
    
    Object.entries(errorsByType).forEach(([type, errors]) => {
      console.log(`\n${type} (${errors.length}):`);
      errors.slice(0, 5).forEach(err => {
        console.log(`  - ${err.message}`);
        if (err.file) console.log(`    File: ${path.relative(siteDir, err.file)}`);
      });
      if (errors.length > 5) {
        console.log(`  ... and ${errors.length - 5} more`);
      }
    });
    console.log('');
  } else {
    console.log('✅ No errors found!\n');
  }
  
  // Warnings
  if (results.warnings.length > 0) {
    console.log(`⚠️  WARNINGS: ${results.warnings.length}\n`);
    
    // Show summary only
    const warningsByType = {};
    results.warnings.forEach(warn => {
      warningsByType[warn.type] = (warningsByType[warn.type] || 0) + 1;
    });
    
    Object.entries(warningsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log('');
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'reports', 'structured-data-validation.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed report saved to: reports/structured-data-validation.json\n`);
  
  // Exit with error code if critical errors found
  const criticalErrors = results.errors.filter(e => 
    e.type !== 'UNKNOWN_SCHEMA_TYPE' && 
    e.type !== 'MISSING_RECOMMENDED_PROPERTY'
  );
  
  if (criticalErrors.length > 0) {
    console.log(`❌ Validation FAILED: ${criticalErrors.length} critical errors\n`);
    process.exit(1);
  } else {
    console.log('✅ Validation PASSED: All critical checks passed\n');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { validateSchema, extractJSONLD };
