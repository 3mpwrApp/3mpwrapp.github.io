# Contributing

Thanks for helping improve 3mpwr App!

## Development workflow

- Install: `npm install`
- Run: `npx expo start`
- Lint: `npm run lint` (or `npm run lint:ci`)
- Tests: `npm test`
- Typecheck (strict): `npm run typecheck:strict`

## Documentation updates (required)

If your change impacts users (UI text, flows, notable behaviors), update docs in the same PR:

- `docs/user-guide.md` — end‑user documentation (screens, features, labels like “Coming soon”).
- `docs/CHANGELOG.md` — add a brief entry under the current date.
- `docs/UNFINISHED_WORK.md` — if you resolve or add placeholders, re-run the scan per the README and commit the updated file.

CI and reviews will expect these to be in sync. If a change is purely internal (refactor, test-only), you can skip `user-guide.md` but still note it in the changelog when appropriate.

## Git and Commit style

- Conventional commits encouraged (e.g., `feat:`, `fix:`, `docs:`, `test:`, `chore:`)
- Small, focused commits with meaningful messages
- Reference issues/PRs in the body when relevant

## Tests

- Add or update unit tests for user-visible changes
- Keep tests resilient to RN Web differences (e.g., avoid brittle exact text queries where a11y mirrors can appear)

## i18n

- Run `npm run i18n:validate` locally
- Add new keys to `locales/en/common.json` and ensure parity in `es` and `fr` where enforced

## Accessibility

- Use accessible roles and sufficient hitSlop
- Respect `MAX_FONT_SCALE` and avoid hidden duplicate text nodes that confuse screen readers

## Firestore & Server

- If adding rules or endpoints, document in `README.md` and update any related docs under `docs/`

Thanks again for contributing!
