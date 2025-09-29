# App Store and Google Play: Placeholder Listing Guide

This guide explains how to reserve your app name and set up a draft/placeholder store listing for iOS (App Store Connect) and Android (Google Play Console).

## Costs (not free)
- Apple Developer Program: $99 USD/year
- Google Play Developer account: $25 USD one‑time

Creating/maintaining listings requires these paid developer accounts. There are no extra fees to create drafts beyond the account costs.

## iOS (App Store Connect)
1. Enroll in the Apple Developer Program.
2. Ensure your bundle identifier is decided (matches `ios.bundleIdentifier` in your app config).
3. In App Store Connect → My Apps → New App:
   - Name: 3mpowr App (or your final display name; must be unique)
   - Primary language
   - Bundle ID: choose the exact bundle ID you’ll ship with
   - SKU: any internal identifier
   - User Access: Full Access
4. Save. This reserves the name for the chosen bundle ID across the App Store.
5. Fill out Store Listing (can be placeholders while in draft):
   - Description, Keywords, Screenshots, Privacy Policy URL, Support URL
   - App Privacy (data collection) and Age Rating
6. You do NOT need a build to save a draft, but you do need a build to submit for review or TestFlight.

Notes:
- Pre‑order requires a build and complete metadata; it’s not a pure placeholder.
- TestFlight (internal/external testing) keeps the listing non‑public until you migrate to App Store release.

## Android (Google Play Console)
1. Register a Google Play Developer account.
2. Create App → Default language → App name: 3mpowr App → App type: App → Free/Paid → Declarations.
3. Complete the mandatory sections (you can save drafts):
   - App content: Data Safety, Ads, Target audience, etc.
   - Store listing: Short/Full description, Screenshots, Privacy Policy URL
4. To keep it private, use Internal or Closed testing tracks. Open testing will create a public listing (“Early Access”).

Notes:
- App name isn’t globally reserved until you publish, but creating the app in your console is usually sufficient for planning.

## Expo/EAS mapping
- Display name on device: `expo.name` in `app.json` (currently set to "3mpowr App").
- Android package: `android.package` in `app.json` (e.g., `com.empowrapp2.empowrapp`). This must match the app you create in Play Console.
- iOS bundle identifier: Add `ios.bundleIdentifier` in `app.json` when you’re ready. This must match the app record in App Store Connect.
- Scheme/deep links: `expo.scheme` (optional to change).

## Tips
- Keep screenshots real where possible; stores may reject placeholder imagery for public listings.
- Ensure the Privacy Policy URL is live before submission.
- You can keep both listings in draft until you’re ready to ship to production.

If you want, we can wire `ios.bundleIdentifier` now and prepare EAS build profiles for Internal Testing (TestFlight) and Internal App Sharing on Play.
