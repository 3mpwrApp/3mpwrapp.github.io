# Accessibility Notes

## Loading states

Use `components/ScreenSkeleton.tsx` as the Suspense fallback for heavy screens. It:
- Announces a loading state using i18n strings
- Sets `accessibilityRole="progressbar"` and marks the container busy
- Hides descendants from screen readers until content is ready

## RN Web pointerEvents deprecation

Avoid setting `pointerEvents` as a prop on React Native Web elements. Instead use style:

```tsx
<View style={[styles.wrap, { pointerEvents: 'box-none' as any }]}>
  {/* content */}
</View>
```

Patterns updated in the app:
- Global Assistant pill (`components/GlobalAssistant.tsx`)
- Voice Controller (`components/VoiceController.tsx`)
- Toast viewport (`utils/toast.tsx`)
