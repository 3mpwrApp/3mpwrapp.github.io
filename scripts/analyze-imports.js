#!/usr/bin/env node
/**
 * Analyze imports across the codebase
 * - Detect circular dependencies
 * - Find unused imports
 * - Identify large dependency chains
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const ignoreDirs = ['node_modules', '.expo', 'dist', 'build', '__tests__', 'scripts'];

// Store all file imports
const fileImports = new Map(); // filePath -> Set of imported file paths
const fileExports = new Map(); // filePath -> Set of exported symbols
const importGraph = new Map(); // filePath -> Set of files that import it

/**
 * Extract imports from a file
 */
function extractImports(filePath, content) {
  const imports = new Set();
  
  // Match: import ... from './path' or "../path" or "path"
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Resolve relative imports
    if (importPath.startsWith('.')) {
      const dir = path.dirname(filePath);
      let resolved = path.join(dir, importPath);
      
      // Try adding extensions
      if (!fs.existsSync(resolved)) {
        for (const ext of sourceExtensions) {
          const withExt = resolved + ext;
          if (fs.existsSync(withExt)) {
            resolved = withExt;
            break;
          }
        }
      }
      
      // Try index files
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        for (const ext of sourceExtensions) {
          const indexFile = path.join(resolved, 'index' + ext);
          if (fs.existsSync(indexFile)) {
            resolved = indexFile;
            break;
          }
        }
      }
      
      imports.add(resolved);
    }
    // Ignore node_modules imports for now
  }
  
  return imports;
}

/**
 * Recursively scan directory for source files
 */
function scanDirectory(dir, files = []) {
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(entry)) {
        scanDirectory(fullPath, files);
      }
    } else if (sourceExtensions.some(ext => entry.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Detect circular dependencies using DFS
 */
function detectCircularDeps() {
  const circular = [];
  const visited = new Set();
  const recursionStack = new Set();
  
  function dfs(file, path = []) {
    if (recursionStack.has(file)) {
      // Found a cycle
      const cycleStart = path.indexOf(file);
      const cycle = [...path.slice(cycleStart), file];
      circular.push(cycle);
      return;
    }
    
    if (visited.has(file)) {
      return;
    }
    
    visited.add(file);
    recursionStack.add(file);
    path.push(file);
    
    const imports = fileImports.get(file) || new Set();
    for (const importedFile of imports) {
      if (fileImports.has(importedFile)) {
        dfs(importedFile, [...path]);
      }
    }
    
    recursionStack.delete(file);
  }
  
  for (const file of fileImports.keys()) {
    if (!visited.has(file)) {
      dfs(file);
    }
  }
  
  return circular;
}

/**
 * Find unused imports (imports that aren't used in the file)
 */
function findUnusedImports() {
  const unused = [];
  
  for (const [filePath, content] of Array.from(fileImports.entries()).slice(0, 50)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // Extract all imported symbols
      const importedSymbols = new Set();
      const importRegex = /import\s+\{([^}]+)\}\s+from/g;
      const defaultImportRegex = /import\s+(\w+)\s+from/g;
      
      let match;
      while ((match = importRegex.exec(fileContent)) !== null) {
        const symbols = match[1].split(',').map(s => s.trim().split(' as ')[0]);
        symbols.forEach(s => importedSymbols.add(s));
      }
      
      while ((match = defaultImportRegex.exec(fileContent)) !== null) {
        importedSymbols.add(match[1]);
      }
      
      // Check if each symbol is used (simple check)
      for (const symbol of importedSymbols) {
        const regex = new RegExp(`\\b${symbol}\\b`, 'g');
        const matches = (fileContent.match(regex) || []).length;
        
        // If only appears once (in the import), it's unused
        if (matches <= 1) {
          unused.push({ file: filePath, symbol });
        }
      }
    } catch (e) {
      // Skip files with read errors
    }
  }
  
  return unused;
}

/**
 * Find files with most dependencies
 */
function findLargeDependencies() {
  const deps = [];
  
  for (const [file, imports] of fileImports.entries()) {
    if (imports.size > 0) {
      deps.push({ file, count: imports.size });
    }
  }
  
  return deps.sort((a, b) => b.count - a.count).slice(0, 20);
}

// Main analysis
console.log('🔍 Analyzing imports...\n');

const files = scanDirectory(rootDir);
console.log(`Found ${files.length} source files\n`);

// Build import graph
for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const imports = extractImports(file, content);
    fileImports.set(file, imports);
    
    // Build reverse graph
    for (const importedFile of imports) {
      if (!importGraph.has(importedFile)) {
        importGraph.set(importedFile, new Set());
      }
      importGraph.get(importedFile).add(file);
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e.message);
  }
}

console.log(`Analyzed ${fileImports.size} files\n`);

// Detect circular dependencies
console.log('📊 Circular Dependencies:');
const circular = detectCircularDeps();
if (circular.length === 0) {
  console.log('✅ No circular dependencies detected!\n');
} else {
  console.log(`Found ${circular.length} circular dependencies:\n`);
  circular.slice(0, 10).forEach((cycle, i) => {
    console.log(`${i + 1}. Cycle length: ${cycle.length}`);
    cycle.forEach(file => {
      console.log(`   → ${path.relative(rootDir, file)}`);
    });
    console.log();
  });
}

// Find files with most dependencies
console.log('📦 Files with Most Dependencies:');
const largeDeps = findLargeDependencies();
largeDeps.slice(0, 15).forEach((dep, i) => {
  const relPath = path.relative(rootDir, dep.file);
  console.log(`${i + 1}. ${dep.count} imports - ${relPath}`);
});

console.log('\n✅ Analysis complete!');
