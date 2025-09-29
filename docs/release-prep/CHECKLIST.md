# Release Prep Checklist (no paid accounts needed)

Use this checklist to prepare everything before paying for developer accounts.

## App identifiers
- [ ] Confirm app display name: 3mpowr App (in `app.json` → `expo.name`)
- [ ] Decide iOS bundle identifier (e.g., `com.empowrapp2.empowrapp`) — add to `app.json` when ready
- [ ] Confirm Android package (currently `android.package` in `app.json`)

## Store listing content
- [ ] App descriptions (short + long)
- [ ] Keywords (iOS)
- [ ] Category & content rating (notes)
- [ ] Screenshots plan (devices/locales)
- [ ] Feature graphic (Android)
- [ ] Promo text (optional)
- [ ] Support URL & Marketing URL
- [ ] Privacy Policy URL (hosted)

## Privacy & data disclosures
- [ ] Apple App Privacy answers drafted (see `store/app-privacy.apple.template.yml`)
- [ ] Google Data Safety answers drafted (see `store/data-safety.play.template.yml`)

## Assets
- [ ] App icon PNG (1024x1024, no transparency for iOS)
- [ ] Adaptive icon (Android foreground)
- [ ] Splash/launch artwork
- [ ] 6–8 screenshots per platform
- [ ] Optional: preview video(s)

## Build & testing
- [ ] EAS build profiles defined (`eas.json`) for internal/preview/production
- [ ] Run `npm run test:ci` locally (typecheck, lint, tests, analytics, i18n, perf)
- [ ] Optional: create a dev client build (no store accounts needed)

## Compliance & URLs
- [ ] Privacy Policy drafted (see `legal/privacy-policy.template.md`)
- [ ] Terms of Service URL (if applicable)
- [ ] Support email and contact method

When accounts are ready, you can copy/paste the prepared content into the stores and upload assets.
