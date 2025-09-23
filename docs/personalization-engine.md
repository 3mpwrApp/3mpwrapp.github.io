# Personalization Engine Design (Draft)

## Goals
- Surface the most relevant next action/tool on Home based on recent behavior and stated intent.
- Lightweight client-side scoring first; optionally augment with remote model later.
- Privacy: all on-device unless user opts into cloud sync.

## Inputs (Events)
Events unified under `usage.*` namespace (to add):
- `usage.view` { tool: string, route?: string }
- `usage.complete` { tool: string, route?: string, durationMs?: number }
- `usage.start` { tool: string, route?: string }
- `usage.error` { tool: string, route?: string, code?: string }
- Existing activity events can be mapped (e.g., `coach.start` => usage.start tool=coach)

Additional context state:
- Bookmarks (frequency, recency per route)
- Notifications interacted (delivered recently but not viewed boost)
- Jurisdiction (filters advocacy resources)

## Tool Registry
Create `personalization/tools.ts` describing each suggestible tool:
```
export interface SuggestibleTool {
  id: string; // e.g. 'coach', 'translator', 'policy_simplifier'
  category: 'advocacy' | 'wellness' | 'community' | 'resources';
  importance: 1|2|3; // hand-tuned weighting baseline
  cooldownMs?: number; // minimum time before surfacing again
  prereq?: () => boolean; // feature flag / data requirement gate
}
```

## Scoring Dimensions
- Recency: exponential decay based on last interaction (encourage continuity)
- Novelty: slight boost if never used
- Diversity: penalty if same tool shown repeatedly (rotate among top-N)
- Intent match: (future) if user provides free-text intent, simple keyword match map
- Engagement Gap: boost if tool partially completed (e.g., coach 40% complete)

Formula (initial):
```
score(tool) = baseWeight
  + recencyBoost(tool)
  + noveltyBoost(tool)
  + engagementGapBoost(tool)
  - repetitionPenalty(tool)
```
Each subcomponent normalized 0..1 then scaled.

## Recency Boost
```
recencyBoost = exp(-deltaMinutes / halfLife)
```
Default halfLife 180 (3h) for continuity tools; 1440 (1 day) for episodic tools.

## Novelty Boost
If never started: +0.35 (capped) else 0.

## Engagement Gap Boost
If progressAvailable(tool): (1 - completionFraction) * 0.5 else 0.

## Repetition Penalty
If lastSuggested == tool within last hour: -0.4 else 0.

## Output Structure
```
interface Suggestion {
  toolId: string;
  score: number;
  reason: { key: string; data?: any }[]; // for UI explanation badges
}
```
Return ordered list; UI shows top 1-3.

## Data Persistence
- Maintain rolling event buffer (max 500) in AsyncStorage `usageEvents:v1`.
- Persist lastSuggested tool + timestamp.

## Incremental Rollout Plan
1. Implement usage events emission wrappers.
2. Build `personalization/store` with buffer + scoring function.
3. Add Home Guide component reading top suggestion; simple CTA.
4. Add settings toggle to disable personalization.
5. Expand events mapping (coach, translator, policy simplifier).

## Future Enhancements
- Session clustering (group events into sessions for better continuity metrics)
- Lightweight collaborative filtering (aggregate anonymized trending tools)
- Natural language intent input with vector matching to tool descriptors
- A/B testing of scoring parameter sets

## Open Questions
- Should negative signals (dismissals) decay tool priority faster? (Likely yes; add later.)
- Multi-user device parity? (Out of scope early.)
