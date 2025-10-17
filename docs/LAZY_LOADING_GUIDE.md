# Lazy Loading & Code Splitting Guide

## Overview

This document describes the Phase 3 optimization that implements lazy loading for large feature components, reducing initial bundle size and improving app startup performance.

## Bundle Size Impact

- **Before**: ~3.2MB (over hard limit)
- **After**: 2.75MB (within hard 3.0MB limit, but exceeding soft 2.5MB target)
- **Reduction**: ~460KB (~14% smaller)

The remaining soft budget overage is acceptable given the feature complexity and can be addressed in future phases through additional lazy loading.

## Lazy-Loaded Components

### 1. Letter Wizard Content (67.9KB)
**Location**: `components/LetterWizardContent.tsx`  
**Route**: `app/(tabs)/resources/letter-wizard.tsx`  
**Features**:
- 22 letter template types with customizable fields
- Template preview generation
- PDF export functionality
- Accessibility-enhanced text input

**Usage**:
```tsx
import { Suspense, lazy } from 'react';
import { LazyLoadWrapper } from '../components/LazyLoadWrapper';

const LetterWizardContent = lazy(() => 
  import('../components/LetterWizardContent')
);

export default function LetterWizardScreen() {
  return (
    <LazyLoadWrapper>
      <LetterWizardContent />
    </LazyLoadWrapper>
  );
}
```

### 2. Legal Automation Content (55.8KB)
**Location**: `components/LegalAutomationContent.tsx`  
**Route**: `app/(tabs)/advocacy/legal-automation.tsx`  
**Features**:
- Legal workflow automation
- Document generation
- Jurisdiction-aware templates
- Form validation

### 3. Peer Support Content (44.4KB)
**Location**: `components/PeerSupportContent.tsx`  
**Route**: `app/(tabs)/community/peer-support.tsx`  
**Features**:
- Peer matching system
- Compatibility scoring algorithm
- User profile management
- Connection facilitation

### 4. Enhanced Hub Content (44.0KB)
**Location**: `components/EnhancedHubContent.tsx`  
**Route**: `app/(tabs)/community/enhanced-hub.tsx`  
**Features**:
- Community hub interface
- Discussion threads
- Resource sharing
- Moderation tools

## LazyLoadWrapper Component

The `LazyLoadWrapper` component provides:
- Automatic loading state with spinner
- Error boundary with retry functionality
- Accessibility announcements for screen readers
- Loading progress indication

**Location**: `components/LazyLoadWrapper.tsx`

**API**:
```tsx
interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Custom loading UI
  errorMessage?: string;
}
```

## Data Files Converted to Async Loading

### Provincial Legal Templates
- **File**: `assets/data/provincialLegalTemplates.json`
- **Loader**: `data/provincialLegalTemplates.ts`
- **Size**: ~180KB (loaded on-demand)

### FAQs Database
- **File**: `assets/data/faqs.json`
- **Loader**: `data/faqs.ts`
- **Size**: ~120KB (loaded on-demand)

These are loaded asynchronously when needed, keeping initial bundle small.

## Performance Metrics

### File Size Compliance
All lazy-loaded components must stay under 35KB per file (enforced by `scripts/perf-max-file-size.mjs`).

**Whitelist for larger content files**:
```bash
components.*Content\.tsx         # Lazy-loaded feature content
LegalWorkflowEngine\.tsx         # Supporting logic
campaign-coordinator\.tsx        # Coordinator feature
advanced-security\.tsx          # Security settings
```

### Bundle Size Budget
- **Soft limit**: 2.5MB (warning if exceeded)
- **Hard limit**: 3.0MB (blocks build)
- **Current**: 2.75MB (acceptable, targets future optimization)

## Adding New Lazy-Loaded Components

### Step 1: Create the Component
```tsx
// components/MyFeatureContent.tsx
export function MyFeatureContent() {
  return (
    <View>
      {/* Feature implementation */}
    </View>
  );
}

export default MyFeatureContent;
```

### Step 2: Create Route Wrapper
```tsx
// app/(tabs)/my-feature.tsx
import { Suspense, lazy } from 'react';
import { LazyLoadWrapper } from '../components/LazyLoadWrapper';

const MyFeatureContent = lazy(() => 
  import('../components/MyFeatureContent')
);

export default function MyFeatureScreen() {
  return (
    <LazyLoadWrapper>
      <MyFeatureContent />
    </LazyLoadWrapper>
  );
}
```

### Step 3: Update Performance Allowlist
If component exceeds 35KB, add to `package.json` `perf:max-file` script:
```json
{
  "scripts": {
    "perf:max-file": "set PERF_MAX_ALLOW=components.*Content\\.tsx,...,components/MyFeatureContent\\.tsx&& node ./scripts/perf-max-file-size.mjs"
  }
}
```

### Step 4: Test
```bash
npm run perf:breakdown        # Verify size
npm run perf:budget           # Check total
npm run perf:max-file         # Check individual files
npm test                      # Run test suite
```

## Monitoring & Maintenance

### Regular Checks
```bash
# Monthly bundle analysis
npm run perf:breakdown

# Pre-release verification
npm run perf:budget
npm run perf:max-file

# Performance regression testing
npm run perf:budget -- --compare
```

### Potential Future Optimizations

1. **Additional Lazy Loading**
   - Campaign coordinator (43KB)
   - Advanced security settings (43KB)
   - Settings features (27KB each)

2. **Data Splitting**
   - Separate jurisdiction data by region
   - Lazy-load specialized medical content

3. **Code Optimization**
   - Tree-shake unused utilities
   - Remove dead code from large types files
   - Consolidate duplicate logic

## Troubleshooting

### Component Not Loading
```tsx
// Ensure proper error handling
<LazyLoadWrapper errorMessage="Failed to load feature">
  <MyComponent />
</LazyLoadWrapper>
```

### Bundle Size Increased
1. Check `npm run perf:breakdown` for new large files
2. Verify no accidental bundling of dev dependencies
3. Run `npm run metro:clear` to clear cache

### Performance Regression
1. Compare with baseline: `npm run perf:budget -- --compare`
2. Check for new imports or dependencies
3. Profile with source maps: `npm run build -- --profile`

## References

- **Pre-optimization**: See git commit `49eb040` for bundle optimization changes
- **Performance scripts**: `scripts/perf-*.mjs` directory
- **Metro config**: `metro.config.js` for bundler configuration
- **TypeScript config**: `tsconfig.json` for type checking

## Related Documentation

- [Performance Monitoring](./PERFORMANCE_MONITORING.md)
- [Bundle Analysis Report](./analytics-report.md)
- [CI/CD Quality Gates](./.github/workflows/ci.yml)
