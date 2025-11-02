# Firebase Configuration - IMPORTANT

## ⚠️ DO NOT USE DEFAULT CONFIG IN PRODUCTION ⚠️

The default Firebase configuration in `config.ts` points to **3mpwr's demo Firebase project**.

**This is for development/testing ONLY.**

---

## 🚨 Why This Matters

If you deploy the app with the default config:
- ❌ User data will be stored on **3mpwr's Firebase project** (our servers)
- ❌ You will NOT have control over user data
- ❌ 3mpwr will be responsible for user data (privacy/GDPR issues)
- ❌ You may hit 3mpwr's Firebase quotas/limits
- ❌ This violates the "Bring Your Own Cloud" principle

---

## ✅ Required: Create YOUR OWN Firebase Project

### Step 1: Create Firebase Account
1. Go to https://firebase.google.com
2. Sign in with your Google account
3. Click "Get Started" or "Go to Console"

### Step 2: Create New Project
1. Click "Add Project"
2. Enter project name (e.g., "myapp-production")
3. Enable/disable Google Analytics (optional)
4. Wait for project creation

### Step 3: Get Your Firebase Config
1. In Firebase Console, click the gear icon → Project Settings
2. Scroll down to "Your apps"
3. Click the Web icon (</>)
4. Register your app (give it a nickname)
5. Copy the `firebaseConfig` object

### Step 4: Update config.ts
Replace the config in `firebase/config.ts` with YOUR config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR-API-KEY-HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR-SENDER-ID",
  appId: "YOUR-APP-ID",
  measurementId: "YOUR-MEASUREMENT-ID", // optional
};
```

### Step 5: Enable Required Services
In Firebase Console:
1. **Authentication** → Enable Email/Password, Google Sign-In
2. **Firestore Database** → Create database (start in production mode)
3. **Storage** → Get started
4. **Cloud Functions** → Upgrade to Blaze plan (pay-as-you-go, includes free tier)

### Step 6: Deploy Security Rules
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

### Step 7: Deploy Cloud Functions
```bash
cd firebase/functions
npm install
npm run build
npm run deploy
```

See `firebase/functions/README.md` for detailed Cloud Functions setup.

---

## 🔒 Data Privacy Guarantee

Once you use YOUR own Firebase project:
- ✅ User data stored in **YOUR Firebase project**
- ✅ **YOU** own and control 100% of user data
- ✅ **NO data** on 3mpwr servers
- ✅ Users can verify in Firebase Console it's YOUR project
- ✅ Full GDPR compliance under YOUR control

---

## 💰 Firebase Free Tier

Firebase offers a generous free tier:
- **Firestore:** 1GB storage, 50K reads/day, 20K writes/day
- **Storage:** 5GB storage, 1GB/day downloads
- **Cloud Functions:** 2M invocations/month, 400K GB-seconds
- **Authentication:** Unlimited users

For most small apps, this is sufficient. Upgrade to Blaze (pay-as-you-go) only when needed.

---

## ⚙️ Environment Variables (Optional)

Instead of hardcoding config, you can use environment variables:

```typescript
// firebase/config.ts
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR-API-KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  // ... etc
};
```

Create `.env`:
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... etc
```

**⚠️ Never commit `.env` to git!** Add to `.gitignore`.

---

## 🧪 Testing with Demo Config

For local development/testing, you can temporarily use the demo config:
- Demo project has limited data
- DO NOT use for production
- DO NOT store real user data
- Switch to your own project before deploying

---

## 🆘 Troubleshooting

### "User data being stored on 3mpwr servers!"
- Check `firebase/config.ts` → `projectId` should be YOUR project, not "empowrapp"
- If still using default, replace with your config
- Redeploy app

### "Firebase quota exceeded"
- You're using 3mpwr's Firebase (default config)
- Create YOUR own Firebase project
- Update config.ts with your credentials

### "Can't deploy Cloud Functions"
- Ensure you created YOUR Firebase project
- Install Firebase CLI: `npm install -g firebase-tools`
- Login: `firebase login`
- Init project: `firebase init` (select YOUR project)
- Deploy: `cd firebase/functions && npm run deploy`

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

## ✅ Checklist Before Production Deploy

- [ ] Created my own Firebase project (not using 3mpwr's)
- [ ] Updated `firebase/config.ts` with MY credentials
- [ ] Verified `projectId` is NOT "empowrapp"
- [ ] Enabled Authentication (Email/Password + Google)
- [ ] Created Firestore Database
- [ ] Created Storage bucket
- [ ] Deployed Firestore security rules
- [ ] Deployed Storage security rules
- [ ] Upgraded to Blaze plan (if using Cloud Functions)
- [ ] Deployed Cloud Functions to MY project
- [ ] Tested with test user to verify data in MY Firebase Console

---

**Remember: The whole point of 3mpwr App is "Bring Your Own Cloud"!**  
**Users must use THEIR cloud storage, which means YOU must provide YOUR Firebase project for them to connect to.**
