# Disability Wizard - Quick Start Guide

## For Developers

### Using the Disability Wizard Component

```tsx
import DisabilityWizard from '../../components/DisabilityWizard';

// Basic usage (in any screen)
<DisabilityWizard />

// Customized usage
<DisabilityWizard 
  maxSuggestions={3}                    // Show top 3 suggestions
  title="Recommended For You"           // Custom title
  subtitle="Based on your needs"        // Custom subtitle
  showReasons={true}                    // Show reasoning chips
/>
```

### Accessing Profile Data

```tsx
import { useDisabilityProfile } from '../services/disabilityWizard';

function MyComponent() {
  const profile = useDisabilityProfile();
  
  // Access profile data
  console.log(profile.disabilityTypes);      // ['physical', 'cognitive']
  console.log(profile.energyPeakHours);      // [6, 7, 8, 9, 10]
  console.log(profile.cognitiveLoadPreference); // 'light'
  console.log(profile.screenReaderUser);     // true
}
```

### Updating Profile

```tsx
import { updateDisabilityProfile } from '../services/disabilityWizard';

// Update specific fields
await updateDisabilityProfile({
  disabilityTypes: ['physical', 'neurodivergent'],
  energyPeakHours: [18, 19, 20, 21], // Evening energy
  cognitiveLoadPreference: 'moderate',
});
```

### Getting Suggestions Manually

```tsx
import { getWizardSuggestions } from '../services/disabilityWizard';

// Get suggestions with custom context
const suggestions = await getWizardSuggestions({
  coachProgress: 0.75,  // 75% complete
  energyOverride: 'low', // Override current energy detection
});

console.log(suggestions[0].title);     // "Wellness Mood Tracker"
console.log(suggestions[0].reasoning); // Array of reason chips
```

### Finding Next Steps

```tsx
import { findNextSteps } from '../services/disabilityWizard';

// After user uses a tool, suggest what's next
const nextSteps = findNextSteps('legal_workflow');

nextSteps.forEach(step => {
  console.log(step.title);        // "Find an Advocate"
  console.log(step.reasoning[0]); // { label: "Recommended next step" }
});
```

## For Designers

### Wizard Card Anatomy

```
┌─────────────────────────────────┐
│ ⭐ Today's Pick                 │  ← Featured badge (optional)
├─────────────────────────────────┤
│  📱                             │  ← Tool icon (colored)
│                                 │
│  Tool Title                     │  ← Bold, 18pt
│  Brief description explaining   │  ← Regular, 14pt
│  what this tool does            │
│                                 │
│  ⏱️ 5min  🔋 Low  💡 Light     │  ← Metadata row
│                                 │
│  🎯 Reason chip                │  ← Reasoning (optional)
│  🎯 Another reason             │
└─────────────────────────────────┘
```

### Color Palette

**Energy Levels**:
- Low: `#4CAF50` (Green) - Can do with minimal energy
- Medium: `#FF9800` (Orange) - Requires moderate effort
- High: `#F44336` (Red) - Needs significant energy

**Cognitive Load**:
- Light: `bulb-outline` icon - Simple tasks
- Moderate: `bulb` icon - Mixed complexity  
- Heavy: `flash` icon - Deep focus required

**Featured Badge**: `#FFD700` (Gold) with star icon

### Accessibility Requirements

- Minimum contrast ratio: **4.5:1** for text
- Touch targets: **44x44pt minimum**
- Support dynamic text scaling up to **200%**
- Screen reader labels on all interactive elements
- Respect reduced motion: No auto-animations
- High contrast mode compatible

## For Content Writers

### Writing Reasoning Chips

Good reasoning chips are:
- **Specific**: "Good for low energy days" not "Helpful"
- **Actionable**: "Continue your 75% complete goal" not "Recommended"
- **Empathetic**: "Designed for physical support" not "For physical users"
- **Timely**: "Perfect for morning focus" not "Time-appropriate"

### Tool Descriptions

Format: `<Action> for <benefit>`

Examples:
- ✅ "Track your mood and identify patterns"
- ✅ "Simplify complex legal documents into plain language"
- ✅ "Find lawyers and advocates in your area"
- ❌ "This tool helps you with mood tracking"
- ❌ "Legal document assistance"

Keep under 80 characters for mobile display.

## For QA Testers

### Test Scenarios

**Profile Setup**:
1. Fresh install → Profile wizard appears
2. Complete all 4 steps → Saves correctly
3. Skip wizard → Uses defaults
4. Back button navigation → Preserves selections
5. Progress bar updates correctly

**Daily Rotation**:
1. Monday → See Mon rotation tools featured
2. Wait until midnight → Rotation resets
3. View same tool 3 times → Priority decreases
4. New day → Fresh suggestions

**Energy Matching**:
1. Set profile as "Morning person"
2. Open app at 8am → High-energy tools suggested
3. Open app at 8pm → Low-energy tools suggested

**Accessibility**:
1. Enable VoiceOver → All cards announce properly
2. Enable reduced motion → No animations
3. Large text (200%) → All text scales correctly
4. High contrast → Colors meet requirements

### Bug Report Template

```markdown
**Issue**: Suggestion card not tapping
**Steps to reproduce**:
1. Open home screen
2. See wizard suggestions
3. Tap first card
**Expected**: Navigate to tool
**Actual**: Nothing happens
**Device**: iPhone 14 Pro, iOS 17.2
**Build**: Beta 1.0.0
**Profile**: Physical disability, morning energy
```

## For Product Managers

### Key Metrics Dashboard

Track these in analytics:

```javascript
// Engagement
- wizard_suggestion_viewed (toolId, position)
- wizard_suggestion_clicked (toolId, position, reasoning)
- wizard_next_step_clicked (fromTool, toTool)

// Profile
- profile_setup_started
- profile_setup_completed (steps completed)
- profile_setup_skipped
- profile_updated (fields changed)

// Satisfaction
- suggestion_feedback (toolId, helpful: boolean)
- tool_used_after_suggestion (toolId, timeSinceSuggestion)
```

### Success Criteria

**Launch Goals** (Week 1-4):
- ≥70% of users complete profile setup
- ≥40% click at least one suggestion per day
- ≥3 tools discovered via wizard that weren't previously used

**Growth Goals** (Month 2-3):
- ≥60% daily active users engage with wizard
- Average 2.5+ suggestions clicked per session
- ≥85% positive feedback on suggestions

**Maturity Goals** (Month 4+):
- ≥80% of feature discovery happens via wizard
- Average session time increases 20%
- Support tickets decrease 15% (better feature discoverability)

## Common Questions

**Q: How often do suggestions update?**
A: Real-time when profile changes, plus daily rotation at midnight.

**Q: Can users customize which tools appear?**
A: Not yet, but planned for Phase 2 with tool preferences.

**Q: Does it work offline?**
A: Yes! Profile and suggestions are fully local.

**Q: How much storage does it use?**
A: ~2KB for profile, ~5KB for rotation state. Minimal impact.

**Q: Can I test with different profiles?**
A: Yes! Clear AsyncStorage and restart to see setup wizard again.

```javascript
// In settings or dev menu
AsyncStorage.removeItem('disability_profile:v1');
AsyncStorage.removeItem('wizard_rotation:v1');
```

**Q: What if a user has multiple disabilities?**
A: Select all that apply in profile setup. Scoring considers all types.

**Q: How do I add a new tool to the wizard?**
A: Edit `WIZARD_TOOLS` array in `services/disabilityWizard.ts`:

```typescript
{
  id: 'my_new_tool',
  category: 'wellness',
  title: 'My New Tool',
  description: 'What it does',
  icon: 'heart',
  route: '/(tabs)/my-tool',
  importance: 2,
  energyLevel: 'low',
  cognitiveLoad: 'light',
  estimatedTime: 10,
  accessibilityFeatures: ['screen_reader'],
  helpsWith: ['all'],
  bestTimeOfDay: 'anytime',
  relatedTools: ['other_tool'],
  flowsInto: ['next_tool'],
  rotationDays: [1, 3, 5], // Mon, Wed, Fri
}
```

---

**Need help?** Check `docs/DISABILITY_WIZARD_INTEGRATION.md` for full details.
