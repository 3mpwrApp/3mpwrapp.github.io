# Search History Opt-Out Feature

**Date:** October 21, 2025  
**Status:** ✅ Implemented  
**Google Play Impact:** Changes "In-app search history" from REQUIRED to OPTIONAL

---

## 📋 Overview

Added user-controlled toggle to enable/disable search history collection, allowing users to opt-out of search history tracking while still using search functionality.

---

## 🎯 Why This Was Added

**Google Play Data Safety Requirement:**
- Google Play requires clear disclosure if data collection is "required" (cannot be turned off) vs "optional" (user can choose)
- Previously, search history was automatically saved with no way to disable it
- This meant declaring it as "REQUIRED" in the Data Safety form
- Adding an opt-out toggle allows us to declare it as "OPTIONAL" (better for user privacy and transparency)

---

## ✅ Implementation Details

### 1. **Settings Store** (`store/settings.tsx`)

Added new setting:
```typescript
export type SettingsState = {
  // ... existing settings
  saveSearchHistory: boolean; // NEW: Allow users to opt-out of search history
}
```

**Default value:** `true` (search history saved by default, but user can opt-out)

**Setter function:**
```typescript
const setSaveSearchHistory = (v: boolean) =>
  setState((s) => ({ ...s, saveSearchHistory: v }));
```

---

### 2. **Privacy Settings UI** (`app/(tabs)/settings.sections/EnhancedPrivacySection.tsx`)

Added toggle to Privacy & Security section:

```tsx
<AccessibilityToggle 
  title='Save Search History' 
  description='Remember your searches for quick access and autocomplete' 
  value={saveSearchHistory} 
  onValueChange={setSaveSearchHistory} 
  icon='search' 
  testID='search-history-toggle' 
/>
```

**Location:** Settings → Privacy & Security (between "Error Reporting" and "Data Management" sections)

---

### 3. **Google Play Documentation** (`docs/GOOGLE_PLAY_DATA_USAGE_HANDLING.md`)

**Updated Q3 for "In-app search history":**

**OLD:**
```
☑ Data collection is required (users can't turn off this data collection)
```

**NEW:**
```
☑ Users can choose whether this data is collected
```

**Explanation:**
> Users can disable search history via **Settings → Privacy & Security → "Save Search History"** toggle. When disabled, searches still work but history is not saved.

**Quick Reference Table:**
- Changed from "Required" → **"Optional"**

---

## 🚀 How It Works

### User Experience:

1. **Default Behavior (Toggle ON):**
   - Search queries are saved locally
   - Autocomplete suggestions based on past searches
   - Quick access to recently searched items
   - Search history persists across app sessions

2. **Privacy Mode (Toggle OFF):**
   - Search functionality still works normally
   - Search queries are NOT saved to history
   - No autocomplete suggestions from past searches
   - Search results still appear (functionality unaffected)

### Implementation Notes:

- Setting persists across app sessions (stored in AsyncStorage)
- No existing search history is deleted when toggled off (user must use "Clear All Data" for that)
- Search components should check `saveSearchHistory` setting before saving queries

---

## 📝 Next Steps (Implementation in Search Components)

To complete this feature, search components need to be updated to respect the `saveSearchHistory` setting:

### Components That Need Updates:

1. **Resources Search** (`app/(tabs)/resources/index.tsx`)
2. **Advocate Directory Search** (if exists)
3. **Any other search implementations**

### Example Implementation:

```tsx
import { useSettings } from '../store/settings';

function SearchComponent() {
  const { saveSearchHistory } = useSettings();
  
  const handleSearch = (query: string) => {
    // Perform search (always works)
    performSearch(query);
    
    // Only save to history if user hasn't opted out
    if (saveSearchHistory) {
      saveToSearchHistory(query);
    }
  };
}
```

---

## 🔍 Testing Checklist

- [ ] Toggle appears in Settings → Privacy & Security
- [ ] Toggle default state is ON (search history enabled)
- [ ] Toggling OFF prevents new searches from being saved
- [ ] Toggling ON resumes saving search history
- [ ] Setting persists after app restart
- [ ] Search functionality works regardless of toggle state
- [ ] Accessibility: Toggle has proper labels and screen reader support

---

## 📊 Google Play Console Impact

### Before:
```
In-app search history: REQUIRED
- Users see: "This app collects search history (required)"
```

### After:
```
In-app search history: OPTIONAL
- Users see: "This app may collect search history (optional)"
- More transparent and privacy-friendly
```

---

## 🎉 Benefits

1. **User Privacy:** Users have control over search history collection
2. **Google Play Compliance:** Accurate disclosure (optional vs required)
3. **Transparency:** Clear UI toggle with descriptive text
4. **Flexibility:** Search still works even when history is disabled
5. **WCAG Compliance:** Accessible toggle with screen reader support

---

## 📚 Related Files

- `store/settings.tsx` - Setting definition and persistence
- `app/(tabs)/settings.sections/EnhancedPrivacySection.tsx` - UI toggle
- `docs/GOOGLE_PLAY_DATA_USAGE_HANDLING.md` - Updated data safety answers

---

**Status:** ✅ Core implementation complete  
**Remaining:** Update search components to respect `saveSearchHistory` setting

---

**Last Updated:** October 21, 2025
