# Firebase Admin Setup - SUPER ADMIN ONLY

## 🔐 Super Admin Access

**Super Admin Email**: `empowrapp08162025@gmail.com`

This account has **FULL FIREBASE CONSOLE ACCESS** and absolute administrative privileges.

## ⚠️ CRITICAL: Hybrid BYOC Mode for Regular Users

The app uses **hybrid_byoc** mode:
- ✅ Firebase Auth for authentication (all users)
- ✅ User data stored on USER's own cloud (not Firebase)
- ✅ Super admin gets full Firebase Console access
- ✅ Regular users authenticate but data stays private

## 🚀 Firebase Console Configuration (SUPER ADMIN ONLY)

### Step 1: Add Authorized Domains

1. Login to [Firebase Console](https://console.firebase.google.com) with `empowrapp08162025@gmail.com`
2. Select project: **empowrapp**
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:

```
localhost
127.0.0.1
empowrapp.firebaseapp.com
auth.expo.io
*.expo.dev
```

**For Expo Go Development**:
```
https://auth.expo.io/@3mpwrapp/empowrapp
exp://localhost:8081
exp://192.168.1.*:8081
```

**For Standalone Builds**:
```
empowrapp://
com.3mpwrapp.empowrapp://
```

**For Web Deployment**:
```
https://empowrapp.com
https://www.empowrapp.com
https://*.empowrapp.com
```

### Step 2: Enable Sign-In Methods

In Firebase Console → **Authentication** → **Sign-in method**:

1. **Email/Password**: ✅ ENABLED
2. **Google**: ✅ ENABLED
   - Web Client ID: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`
3. **Apple**: ✅ ENABLED (iOS only)
4. **Anonymous**: ✅ ENABLED (for guest mode)

### Step 3: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Login with `empowrapp08162025@gmail.com`
3. Select project: **empowrapp**
4. Navigate to **APIs & Services** → **Credentials**
5. Edit OAuth 2.0 Client ID
6. Add **Authorized redirect URIs**:

```
https://empowrapp.firebaseapp.com/__/auth/handler
https://auth.expo.io/@3mpwrapp/empowrapp
```

7. Add **Authorized JavaScript origins**:
```
http://localhost
http://localhost:8081
https://empowrapp.firebaseapp.com
https://auth.expo.io
```

### Step 4: Super Admin Privileges

The super admin email `empowrapp08162025@gmail.com` has:

1. **Automatic Admin Access**: Hardcoded in `context/AuthContext.tsx`
2. **Firebase Console Access**: Full project management
3. **Firestore Rules**: Admin-only write access to critical collections
4. **Cloud Functions**: Deploy and manage
5. **Authentication**: Manage all users

### Step 5: Firestore Security Rules

Current rules already grant admin access. Verify in Firebase Console → **Firestore Database** → **Rules**:

```javascript
function isAdmin() { 
  return request.auth.token.admin == true; 
}

function isSuperAdmin() {
  return request.auth != null && 
         request.auth.token.email == 'empowrapp08162025@gmail.com';
}

// Super admin has god-mode access
match /{document=**} {
  allow read, write: if isSuperAdmin();
}
```

The super admin is granted via code in `context/AuthContext.tsx`:
```typescript
const superAdminEmail = 'empowrapp08162025@gmail.com';
const isSuperAdmin = firebaseUser.email === superAdminEmail;
setIsAdmin(isSuperAdmin || Boolean((res.claims as any)?.admin));
```

### Step 6: Deploy Firestore Rules

```bash
npm run rules:deploy
```

This deploys the security rules with super admin privileges.

## 🔒 Security Considerations

### For Super Admin:
- ✅ Full Firebase Console access
- ✅ Read/write all Firestore collections
- ✅ Manage all users
- ✅ Deploy Cloud Functions
- ✅ View all analytics
- ✅ Absolute god-mode privileges

### For Regular Users:
- ✅ Authenticate via Firebase Auth (hybrid mode)
- ✅ Data stored on THEIR cloud (not Firebase)
- ✅ No access to other users' data
- ✅ Privacy-first architecture
- ✅ BYOC compliance

## 📝 Configuration Checklist

- [ ] Login to Firebase Console with `empowrapp08162025@gmail.com`
- [ ] Add all authorized domains (development + production)
- [ ] Enable Email/Password authentication
- [ ] Enable Google authentication with Web Client ID
- [ ] Enable Apple authentication (iOS)
- [ ] Enable Anonymous authentication (guest mode)
- [ ] Configure Google OAuth redirect URIs
- [ ] Verify super admin email in AuthContext.tsx
- [ ] Deploy Firestore rules with admin access
- [ ] Test authentication on all platforms

## 🧪 Testing Super Admin Access

### Test Email Login:
```
Email: empowrapp08162025@gmail.com
Password: [Your password]
```

Expected behavior:
1. ✅ Login successful
2. ✅ `isAdmin` flag set to true
3. ✅ Full app access including admin features
4. ✅ Can access admin panel
5. ✅ God-mode privileges

### Test Regular User:
```
Email: regularuser@example.com
Password: [Their password]
```

Expected behavior:
1. ✅ Login successful
2. ❌ `isAdmin` flag false
3. ✅ Standard user access
4. ❌ No admin panel access
5. ✅ Data stays on their cloud (hybrid BYOC)

## 🚨 Troubleshooting

### "Access Blocked" Error
**Cause**: Domain not in authorized domains list  
**Fix**: Add domain to Firebase Console → Authentication → Authorized domains

### "Operation Not Allowed" Error
**Cause**: Sign-in method not enabled  
**Fix**: Enable in Firebase Console → Authentication → Sign-in method

### "Invalid API Key" Error
**Cause**: Wrong Firebase config  
**Fix**: Verify `firebase/config.ts` has correct credentials

### Super Admin Not Recognized
**Cause**: Email mismatch or claims not refreshed  
**Fix**: 
1. Verify email is exactly `empowrapp08162025@gmail.com`
2. Force token refresh: Sign out and sign in again
3. Check `context/AuthContext.tsx` for hardcoded super admin check

## 📞 Support

For Firebase Console access issues:
- Email: empowrapp08162025@gmail.com
- Project: empowrapp
- Console: https://console.firebase.google.com/project/empowrapp

## 🔗 Resources

- [Firebase Console](https://console.firebase.google.com/project/empowrapp)
- [Google Cloud Console](https://console.cloud.google.com)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Authorized Domains Guide](https://firebase.google.com/docs/auth/web/redirect-best-practices)

---

**Last Updated**: November 10, 2025  
**Super Admin**: empowrapp08162025@gmail.com  
**Mode**: Hybrid BYOC (Auth + User Cloud Storage)  
**Status**: ✅ Ready for configuration
