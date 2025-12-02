# Deep-link q-parameter seeding

Some Assistant tools accept a `q` query parameter to prefill input fields when navigating via deep links. This supports quick prompts from the Assistant Hub and external links.

Supported screens:
- Translator: `/(tabs)/advocacy/ai-advocate-translator`
- Policy Simplifier: `/(tabs)/advocacy/policy-simple`

Pattern:
- Always call routing hooks at the top of the component:
  - `const { q } = useLocalSearchParams<{ q?: string }>()`
- Use a seeding effect that runs once when `q` is present and the local input is empty:
  - `useEffect(() => { if (q && !input) setInput(String(q)); }, [q, input])`

Notes:
- This keeps React hooks order safe and avoids rules-of-hooks warnings.
- Assistant Hub uses this by pushing `router.push({ pathname, params: { q } })` and emits `assistant.quick_prompt` analytics.
- Tests use the real `SettingsProvider` and RN/Expo mocks to avoid native dependencies.
