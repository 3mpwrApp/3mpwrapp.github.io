# OTA Updates (EAS Update)

Use EAS Update to publish over‑the‑air (JS/assets) updates to specific audiences without shipping a new store build. This repo is configured for updates; no native changes are included in the recent fixes.

- Channels: Devices listen to a channel (e.g., `production`, `staging`). Publishing to that channel delivers the latest compatible update to those devices.
- Compatibility: Updates apply only when the app binary’s `runtimeVersion` matches the update’s runtime. Native changes require a new build.

## Suggested flow

1. Configure once: `eas update:configure`
2. Create channels: `eas channel:create production` and `eas channel:create staging`
3. From `main`, publish to staging first:
   - `eas update --branch main --channel staging -m "Pre‑prod: admin route fix + a11y toast"`
4. Validate on staging devices. If good, publish the same commit to production:
   - `eas update --branch main --channel production -m "Admin route fix + a11y toast"`

## Notes

- Consider enabling Code Signing for updates (see Expo docs). Set `EXPO_UPDATE_CODE_SIGNING_CERTIFICATE`, etc.
- Keep channels private unless you intend public access.
- Avoid OTA for SDK/runtime upgrades or when adding/removing native modules; ship a new build instead.
