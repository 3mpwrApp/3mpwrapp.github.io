# import.meta Error - Complete Technical Fix

**Error**: `Uncaught SyntaxError: Cannot use 'import.meta' outside a module`  
**Date Fixed**: January 9, 2026  
**Status**: ✅ COMPLETE  

---

## Root Cause Analysis

### The Problem
Metro bundler was including Node.js server-side scripts in the web bundle:
- `server/check-events.js` - Uses `import.meta.url`
- `server/seed-events.js` - Uses `import.meta.url`
- `server/proxy-server.js` - Uses `import.meta.url`

These files use ES module syntax (`import.meta`) which is **only valid in Node.js ES modules**, not browser bundles.

When Metro bundled these files into the web bundle, the browser tried to parse them as JavaScript and encountered `import.meta`, which is not valid in a classic script context (non-module).

### Why It Happened
Metro's auto-discovery was including server files because:
1. They're in the project root
2. They use modern ES module syntax
3. Metro doesn't have explicit rules excluding them
4. The bundler doesn't understand they're Node.js-only code

---

## The Fix (Applied to metro.config.js)

### Layer 1: Resolver Blocking
```javascript
blockList: [
  /\/server\//,
  /\/scripts\//,
  /\/firebase\/functions/,
  /check-events/,
  /seed-events/,
  /proxy-server/,
],
resolveRequest: (context, moduleName, platform) => {
  // Explicitly reject server module imports
  if (serverModules.some(mod => moduleName.includes(mod))) {
    throw new Error('Cannot import Node.js module in app bundle');
  }
  // ... rest of resolver logic
}
```

**Effect**: Prevents the module resolver from ever resolving imports to server files.

### Layer 2: Serializer Filtering
```javascript
processModuleFilter(module) {
  // If module path contains server/scripts/functions, don't include it
  if (modulePath.includes('/server/') || ...) {
    return false; // Exclude from bundle
  }
  return true;
}
```

**Effect**: If a module somehow gets discovered anyway, it's filtered out during serialization.

### Layer 3: Dependency Graph Cleanup
```javascript
experimentalSerializerHook(graph) {
  // Remove server modules from the dependency graph
  deps.forEach((mod, key) => {
    if (modPath.includes('/server/') || ...) {
      toDelete.push(key); // Remove this dependency
    }
  });
}
```

**Effect**: Even if a server module is in the graph, it's removed before bundling.

---

## Why This Fix Works

**The Problem Chain**:
```
Server files discovered → Metro tries to bundle → Browser receives import.meta
```

**The Solution Chain**:
```
Layer 1: Reject imports
  ↓ (if somehow bypassed)
Layer 2: Filter during serialization
  ↓ (if somehow bypassed)
Layer 3: Clean dependency graph
  ↓
Result: Server files never reach the bundle
```

**Outcome**: Browser never sees server code → No `import.meta` error ✅

---

## Testing the Fix

### Step 1: Clear Cache
```bash
npm run metro:clear
```

### Step 2: Watch Metro Output
Look for:
- ✅ "Building bundle" without errors
- ❌ "Cannot use 'import.meta'" would appear here if not fixed

### Step 3: Check Browser Console (F12)
- ✅ No red "import.meta" errors
- ✅ App loads normally
- ✅ Diagnostics page accessible

---

## Verification

The fix is working if:

| Check | Expected | Status |
|-------|----------|--------|
| `npm run metro:clear` starts | No errors | ✅ |
| Bundle builds | Completes successfully | ✅ |
| Browser console | No import.meta error | ✅ |
| App loads | Shows home/login screen | ✅ |
| /diagnostics works | Components initialize | ✅ |

---

## Technical Details

### Why Filtering Works
- Metro respects `processModuleFilter` return value
- Returning `false` completely excludes module from bundle
- Multiple layers ensure no module slips through

### Why Server Modules Shouldn't Be Imported
Server modules use:
- `import.meta.url` (Node.js only)
- Native Node modules (`fs`, `path`, `crypto`)
- require() (Node.js only)

None of these work in the browser.

### Why import.meta is Valid in Node.js
Node.js v12.20+ supports ES modules with `import.meta`:
```javascript
// Valid in Node.js with "type": "module"
console.log(import.meta.url); // file:///path/to/file.mjs
```

But this **only works in Node.js**, not browsers.

---

## Prevention Going Forward

### 1. File Organization
Keep server code **completely separate**:
```
/server           ← Node.js only
/scripts          ← Node.js only  
/firebase/functions ← Node.js only (Cloud Functions)

/app              ← Browser code
/components       ← Browser code
/services         ← Browser code (may have Node.js in functions/ subdir)
```

### 2. Metro Config
Always include module filtering:
```javascript
processModuleFilter(module) {
  // Exclude Node.js-only directories
  if (nodejsOnlyPaths.some(p => module.path.includes(p))) {
    return false;
  }
  return true;
}
```

### 3. Code Review
When reviewing PRs:
- ❌ Watch for imports from `/server`, `/scripts`
- ❌ Warn if new ES module features in server code
- ✅ Verify server code never imported in app/

### 4. Testing
After changing `metro.config.js`:
```bash
npm run metro:clear  # Test with clean cache
```

---

## If Error Returns

1. **Check metro.config.js** still has all layers
2. **Verify no app code imports server modules**
   ```bash
   grep -r "from.*[/]server" app/
   grep -r "from.*[/]scripts" app/
   ```
3. **Check node_modules for problematic packages**
   - Some npm packages might use `import.meta`
   - If found, would need to be excluded in resolver

4. **Clear everything and rebuild**
   ```bash
   npm run clean:win
   npm install
   npm run metro:clear
   ```

---

## Related Files

- `metro.config.js` - Metro bundler configuration (THE FIX)
- `server/check-events.js` - Uses import.meta.url
- `server/seed-events.js` - Uses import.meta.url
- `server/proxy-server.js` - Uses import.meta.url

These server files are **correct** - they're Node.js code that **should** use `import.meta`. The fix is simply preventing them from being bundled for the browser.

---

## Summary

✅ **Problem**: Server files bundled → Browser sees `import.meta` → Error  
✅ **Solution**: Three-layer filtering in metro.config.js  
✅ **Result**: Server files never reach browser bundle  
✅ **Prevention**: Keep server code separate + maintain metro config  

**Status**: FIXED AND TESTED ✅
