#!/usr/bin/env node
// Lightweight validation before starting Metro (especially helpful on Windows)
const fs = require("fs");
const path = require("path");

function readJSON(file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    // Strip BOM if present
    const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON in ${file}: ${e.message}`);
  }
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

const errors = [];
const warns = [];

// Validate core JSON configs
const jsonFiles = [
  "app.json",
  "locales/en/common.json",
  "locales/es/common.json",
  "locales/fr/common.json",
].map((f) => path.join(__dirname, "..", f));

for (const file of jsonFiles) {
  if (!exists(file)) continue;
  try {
    readJSON(file);
  } catch (e) {
    errors.push(e.message);
  }
}

// Validate metro.config exports an object
try {
  const metroPath = path.join(__dirname, "..", "metro.config.js");
  if (exists(metroPath)) {
    const metro = require(metroPath);
    if (typeof metro !== "object" || metro == null) {
      errors.push("metro.config.js must export a plain object.");
    }
  }
} catch (e) {
  errors.push(`metro.config.js import failed: ${e.message}`);
}

// Quick sanity check for expo-router entry point
try {
  const pkg = readJSON(path.join(__dirname, "..", "package.json"));
  if (!pkg.main || !String(pkg.main).includes("expo-router/entry")) {
    errors.push('package.json "main" should be "expo-router/entry"');
  }
} catch {}

// Validate assets in app.json
try {
  const app = readJSON(path.join(__dirname, "..", "app.json"));
  const base = path.join(__dirname, "..");
  const icon = app?.expo?.icon && path.join(base, app.expo.icon);
  if (icon && !exists(icon)) warns.push(`Missing app icon at ${app.expo.icon}`);
  const fg =
    app?.expo?.android?.adaptiveIcon?.foregroundImage &&
    path.join(base, app.expo.android.adaptiveIcon.foregroundImage);
  if (fg && !exists(fg))
    {warns.push(
      `Missing android adaptiveIcon.foregroundImage at ${app.expo.android.adaptiveIcon.foregroundImage}`,
    );}
  const fav = app?.expo?.web?.favicon && path.join(base, app.expo.web.favicon);
  if (fav && !exists(fav))
    {warns.push(`Missing web favicon at ${app.expo.web.favicon}`);}
} catch (e) {
  warns.push(`app.json asset check warning: ${e.message}`);
}

// Validate Firebase config presence
try {
  const cfg = path.join(__dirname, "..", "firebase", "config.ts");
  if (!exists(cfg)) warns.push("Missing firebase/config.ts");
} catch {}

// Warn on malformed LLM base env var
try {
  const base = process.env.EXPO_PUBLIC_LLM_BASE;
  if (base && !/^https?:\/\//.test(base))
    {warns.push("EXPO_PUBLIC_LLM_BASE should be http(s) URL");}
} catch {}

// Simple import path case check for relative imports (helps CI on case-sensitive FS)
function realpathCaseSensitive(p) {
  // Build actual path by iterating directory entries at each level
  const parts = p.split(path.sep);
  let cur = path.isAbsolute(p) ? path.sep : "";
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    if (!seg) continue;
    const dir = i === 0 && path.isAbsolute(p) ? path.sep : cur || ".";
    const base = i === 0 && path.isAbsolute(p) ? path.sep : cur;
    const targetDir =
      i === parts.length - 1
        ? path.dirname(path.join(base, seg))
        : path.join(cur, "");
    try {
      const list = fs.readdirSync(path.dirname(path.join(cur, seg)));
      const found = list.find(
        (name) => name.toLowerCase() === path.basename(seg).toLowerCase(),
      );
      if (!found) return null;
      cur = path.join(path.dirname(path.join(cur, seg)), found);
    } catch {
      return null;
    }
  }
  return cur;
}

try {
  const roots = ["app", "components", "services", "store", "theme", "utils"];
  const base = path.join(__dirname, "..");
  const files = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) walk(p);
      else if (/\.(tsx?|jsx?)$/.test(name)) files.push(p);
    }
  }
  roots.forEach((r) => {
    const p = path.join(base, r);
    if (exists(p)) walk(p);
  });
  const importRE =
    /import\s+[^'"`]*from\s+['"](\.\.?\/[^'"`]+)['"];?|require\(\s*['"](\.\.?\/[^'"`]+)['"]\s*\)/g;
  for (const f of files.slice(0, 800)) {
    // limit to avoid long scans
    const text = fs.readFileSync(f, "utf8");
    let m;
    while ((m = importRE.exec(text))) {
      const rel = m[1] || m[2];
      if (!rel) continue;
      // Resolve extension variants
      const exts = [
        "",
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        "/index.ts",
        "/index.tsx",
        "/index.js",
      ];
      const baseDir = path.dirname(f);
      let found = null;
      for (const ext of exts) {
        const p = path.join(baseDir, rel + ext);
        if (exists(p)) {
          found = p;
          break;
        }
      }
      if (!found) continue;
      const real = realpathCaseSensitive(found);
      if (real && path.basename(real) !== path.basename(found)) {
        warns.push(
          `Import case differs from FS: ${path.relative(base, f)} -> ${rel}`,
        );
      }
    }
  }
} catch (e) {
  warns.push(`Import case check warning: ${e.message}`);
}

// Validate locales contain expected keys
try {
  const root = path.join(__dirname, "..", "locales");
  const langs = ["en", "es", "fr"];
  const required = ["nav", "resources.tools", "wellness.tools"];
  langs.forEach((lng) => {
    const file = path.join(root, lng, "common.json");
    if (!exists(file)) return;
    const json = readJSON(file);
    required.forEach((r) => {
      const val = r.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), json);
      const ok = val !== undefined;
      if (!ok) warns.push(`Locale ${lng} missing key: ${r}`);
    });
  });
} catch (e) {
  warns.push(`Locale validation warning: ${e.message}`);
}

// Ensure router layouts exist
[
  path.join(__dirname, "..", "app", "_layout.tsx"),
  path.join(__dirname, "..", "app", "(tabs)", "_layout.tsx"),
].forEach((p) => {
  if (!exists(p)) errors.push(`Missing router layout: ${p}`);
});

if (errors.length) {
  console.error("\nConfiguration validation failed:\n");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
} else {
  console.log("✓ Config validation passed");
  if (warns.length) {
    console.warn("\nWarnings:");
    for (const w of warns) console.warn(" -", w);
  }
}
