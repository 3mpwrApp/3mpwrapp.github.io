#!/usr/bin/env python3
"""
Batch fix gap properties in React Native files
Replaces View with GapView where gap properties are used
"""

import os
import re
from pathlib import Path

# Files that need fixing
FILES_TO_FIX = [
    # Components
    "components/settings/WellnessPrefsSection.tsx",
    "components/settings/MediaLockerSection.tsx", 
    "components/settings/EnhancedPrivacySection.tsx",
    "components/ProvincePicker.tsx",
    "components/EnergyForecast.tsx",
    "components/badges/UserBadgesDisplay.tsx",
    
    # Wellness screens
    "app/(tabs)/wellness/exercise-favorites.tsx",
    "app/(tabs)/wellness/exercise-hub.tsx",
    "app/(tabs)/wellness/energy-coins.tsx",
    "app/(tabs)/wellness/dbt.tsx",
    "app/(tabs)/wellness/daily-planner.tsx",
    "app/(tabs)/wellness/ai-companion.tsx",
    
    # Resources screens
    "app/(tabs)/resources/voice-notes.tsx",
    "app/(tabs)/resources/[id].tsx",
    "app/(tabs)/resources/rtw-planner.tsx",
    "app/(tabs)/resources/rehab-tracker.tsx",
    "app/(tabs)/resources/rights-checker.tsx",
    "app/(tabs)/resources/policy-simulator.tsx",
    "app/(tabs)/resources/meds-tracker.tsx",
    "app/(tabs)/resources/impact-simulator.tsx",
    "app/(tabs)/resources/body-mechanics-advisor.tsx",
    "app/(tabs)/resources/chronic-tracker.tsx",
]

def calculate_import_path(file_path):
    """Calculate relative path to GapView component"""
    if file_path.startswith("components/"):
        return "./GapView"
    
    # Count directory depth from app/
    depth = file_path.count("/") - 1
    if depth < 0:
        depth = 0
    return "../" * depth + "components/GapView"

def add_gapview_import(content, file_path):
    """Add GapView import if not present"""
    if "import" in content and "GapView" in content:
        return content  # Already imported
    
    import_path = calculate_import_path(file_path)
    
    # Find last import statement
    import_pattern = r"(import[^;]+from\s+['\"][^'\"]+['\"];?\s*\n)"
    matches = list(re.finditer(import_pattern, content))
    
    if matches:
        last_import = matches[-1]
        insert_pos = last_import.end()
        gapview_import = f"import GapView from '{import_path}';\n"
        content = content[:insert_pos] + gapview_import + content[insert_pos:]
    
    return content

def fix_gap_in_styles(content):
    """Remove gap properties from StyleSheet definitions"""
    # Remove gap: N, from style objects
    content = re.sub(r'gap\s*:\s*\d+\s*,', '', content)
    content = re.sub(r',\s*gap\s*:\s*\d+', '', content)
    content = re.sub(r'rowGap\s*:\s*\d+\s*,', '', content)
    content = re.sub(r',\s*rowGap\s*:\s*\d+', '', content)
    content = re.sub(r'columnGap\s*:\s*\d+\s*,', '', content)
    content = re.sub(r',\s*columnGap\s*:\s*\d+', '', content)
    
    return content

def fix_gap_in_jsx(content):
    """Replace <View style={{...gap:...}}> with <GapView> in JSX"""
    
    # Pattern 1: <View style={{ ... gap: 8 ... }}>
    # Extract gap value and convert to prop
    def replace_view_with_gap(match):
        before_gap = match.group(1)
        gap_value = match.group(2)
        after_gap = match.group(3)
        
        # Clean up style object (remove gap property)
        style_content = before_gap + after_gap
        style_content = re.sub(r',\s*,', ',', style_content)  # Fix double commas
        style_content = re.sub(r'{\s*,', '{', style_content)  # Fix leading comma
        style_content = re.sub(r',\s*}', '}', style_content)  # Fix trailing comma
        
        return f'<GapView style={{{style_content}}} gap={{{gap_value}}}>'
    
    # Match: <View style={{ ... gap: N ... }}>
    content = re.sub(
        r'<View\s+style=\{\{([^}]*?)gap\s*:\s*(\d+)([^}]*?)\}\}>',
        replace_view_with_gap,
        content
    )
    
    # Simple replacements for closing tags are handled manually
    # as they require context to ensure correctness
    
    return content

def process_file(file_path):
    """Process a single file"""
    full_path = Path(__file__).parent.parent / file_path
    
    if not full_path.exists():
        print(f"  ⚠️  Not found: {file_path}")
        return False
    
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Check if file has gap properties
        if not re.search(r'gap\s*:\s*\d+', content):
            print(f"  ✓ No gaps: {file_path}")
            return False
        
        # Apply fixes
        content = add_gapview_import(content, file_path)
        content = fix_gap_in_styles(content)
        content = fix_gap_in_jsx(content)
        
        if content != original:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Fixed: {file_path}")
            return True
        else:
            print(f"  ℹ️  No changes: {file_path}")
            return False
            
    except Exception as e:
        print(f"  ❌ Error in {file_path}: {e}")
        return False

def main():
    print("\n🔧 Batch Gap Property Fixer\n")
    
    fixed = 0
    for file_path in FILES_TO_FIX:
        if process_file(file_path):
            fixed += 1
    
    print(f"\n📊 Fixed {fixed} files")
    print("\n⚠️  Note: You may need to manually fix closing tags")
    print("   Run: npm run lint\n")

if __name__ == "__main__":
    main()
