# Wellness Features Overview

This app ships a set of lightweight, evidence‑informed wellness tools aimed at accessibility and pacing. All data stays on‑device unless exported.

- Ambience Sync AI: Suggests in‑app ambience based on mood trends
- Dream Tracker & Interpreter: Log dreams and view symbolic interpretations
- Resilience Points: Track micro‑wins across therapeutic skills
- DBT Skill Matcher: Suggests skills by current emotion
- Opposite Action Companion: Stepper for opposite‑action practice
- Radical Acceptance Guide: 3 concise reminders to reduce suffering
- CBT Virtual Coach: Generate balanced reframes from thoughts/evidence
- Sleep Reframe: Gentle tips and routines for sleep
- Pain Forecast: 7‑day trend summary with simple pacing suggestions
- Micro‑Movement Coach: Chair‑friendly movement prompts
- Energy Coins: Daily energy budgeting with spend/reset
- Distress Tolerance (TIPP): Temperature, Intense (gentle) exercise, Paced breathing, Progressive relax
- Belief Strength Meter: Track belief intensity pre/post reframe
- CBT Mini‑Games: Grounding games to shift attention
- Trigger Detector: Naive correlation suggestions from recent logs
- Harm Reduction Guide: Safety planning and de‑escalation tips
- Acceptance & Function Tracker: Track acceptance/function over time

Navigation: open the Wellness tab, then choose a tool. All strings are translatable via `locales/*/common.json` under `wellness.*`.

Testing: see `__tests__/painForecast.test.ts` and `__tests__/energyCoins.store.test.tsx` for examples.
