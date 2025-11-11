# Auth Flow Quick Reference Guide

## 🚀 Quick Start

All authentication is managed through **Firebase Auth** + **React Context** + **Expo Router**.

## 📍 Key Files

| File | Purpose |
|------|---------|
| `context/AuthContext.tsx` | Firebase auth listener, user state management |
| `app/index.tsx` | Navigation logic based on auth state |
| `app/(auth)/signin.tsx` | Email login & guest mode |
| `app/(auth)/signup.tsx` | Email registration |
| `services/auth/oauth.ts` | Google & Apple OAuth |

## 🔑 Core Principle

**NEVER manually navigate after login/signup!**

✅ **Correct Flow**:
```typescript
await signInWithEmailAndPassword(auth, email, password);
// That's it! AuthContext detects the state change and triggers navigation
```

❌ **Wrong Flow**:
```typescript
await signInWithEmailAndPassword(auth, email, password);
router.replace('/(tabs)'); // ❌ DON'T DO THIS
```

## 🎯 How It Works

```
Firebase Auth Method → onAuthStateChanged → AuthContext updates user
                                                     ↓
                                           app/index.tsx detects user
                                                     ↓
                                           router.replace('/(tabs)')
```

## 📖 Adding New Auth Method

If you need to add a new authentication method:

1. **Add the Firebase Auth call**:
```typescript
// In your auth screen
const handleNewAuthMethod = async () => {
  try {
    setWorking(true);
    logger.log('[NewAuth] Starting auth...');
    
    // Call Firebase auth method
    await someFirebaseAuthMethod(auth, ...params);
    
    logger.log('[NewAuth] Success! Auth state will trigger navigation.');
    // DON'T CALL router.replace() here!
  } catch (err) {
    logger.error('[NewAuth] Failed:', err);
    Alert.alert('Error', err.message);
  } finally {
    setWorking(false);
  }
};
```

2. **That's it!** The rest is automatic.

## 🐛 Debugging

Check logs in this order:

1. **Auth screen logs** (signin/signup/oauth)
   - `[Login] ===== STARTING LOGIN PROCESS =====`
   - `[Login] ===== LOGIN SUCCESSFUL =====`

2. **AuthContext logs**
   - `[AuthContext] ===== AUTH STATE CHANGED =====`
   - `[AuthContext] User state updated, loading set to false`

3. **Navigation logs**
   - `[Index] Navigation check { hasUser: true, ... }`
   - `[Index] ✅ User logged in - navigating to home/(tabs)`

If any step is missing, that's where the issue is!

## 🔧 Common Fixes

**Navigation not working?**
- Check: Is Firebase initialized? (`firebase/config.ts`)
- Check: Is `onAuthStateChanged` firing? (Look for AuthContext logs)
- Check: Are segments detected correctly? (Check segmentArray in logs)

**User stuck in auth screen?**
- Verify: `loading` is set to `false` in AuthContext
- Verify: `user` is not null after login
- Verify: No error in Firebase auth (check console)

**Navigation happens but crashes?**
- Check: Home screen `/(tabs)/index.tsx` renders correctly
- Check: No missing dependencies or broken imports

## 📚 Further Reading

- Full documentation: `AUTH_FLOW_COMPLETE_FIX_NOV10.md`
- Firebase Auth Docs: https://firebase.google.com/docs/auth
- Expo Router Docs: https://docs.expo.dev/router/introduction/
