# Technical Verification Guide: 100% User Data Ownership

## Overview

This guide provides step-by-step instructions for technically verifying that 3mpwr App delivers on its 100% user data ownership guarantee. Users can perform these checks to confirm that their data never leaves their control.

---

## Prerequisites

- Development environment (for code inspection)
- Network monitoring tools (optional)
- BYOC storage provider (WebDAV/Nextcloud) for full verification

---

## Verification Methods

### 1. 🔍 **BYOC Strict Mode Verification**

**Purpose**: Confirm that strict mode completely disables app storage

**Steps**:
1. **Enable Strict Mode**: Deploy with `EXPO_PUBLIC_DATA_POLICY=strict_byoc`
2. **Check Runtime Configuration**:
   ```javascript
   // In browser console or debug environment
   const { db, auth, storage } = require('./firebase/config');
   console.log('Firebase DB:', db);    // Should be: null
   console.log('Firebase Auth:', auth); // Should be: null  
   console.log('Firebase Storage:', storage); // Should be: null
   ```
3. **Verify Data Policy**:
   ```javascript
   const { isStrictBYOC } = require('./services/dataPolicy');
   console.log('Strict BYOC enabled:', isStrictBYOC()); // Should be: true
   ```

**Expected Results**: All Firebase services should return `null` when strict mode is active.

---

### 2. 🔌 **Storage Provider Audit**

**Purpose**: Verify that data only goes to user-controlled storage

**Steps**:
1. **Check Active Storage Provider**:
   ```javascript
   const { getActiveStorage } = require('./services/storageProviders');
   const provider = getActiveStorage();
   console.log('Active provider:', provider.id);
   // Should be: 'webdav' (if configured) or 'ephemeral' (no storage)
   ```

2. **Test Storage Operations**:
   ```javascript
   // Try to save data - should only go to your WebDAV endpoint
   const result = await provider.save('test.txt', 'verification test');
   console.log('Save result:', result); // true if WebDAV configured, true but ephemeral otherwise
   ```

**Expected Results**: Data should only save to your configured WebDAV endpoint or be ephemeral (not persisted).

---

### 3. 🌐 **Network Traffic Monitoring**

**Purpose**: Confirm no unauthorized network calls to app servers

**Tools**: Browser DevTools, Charles Proxy, Wireshark, or similar

**Steps**:
1. **Enable Network Monitoring** in your preferred tool
2. **Use the App Normally**:
   - Add notes to Evidence Locker
   - Save preferences
   - Use wellness tracking
   - Create backups

3. **Analyze Network Calls**:
   - ✅ **Allowed**: Calls to your WebDAV endpoint
   - ✅ **Allowed**: Initial app/asset loading
   - ❌ **Prohibited**: Calls to Firebase (`*.firebaseapp.com`, `*.googleapis.com`)
   - ❌ **Prohibited**: Analytics or tracking endpoints
   - ❌ **Prohibited**: Any 3mpwr App servers with user data

**Expected Results**: Zero network calls to Firebase or analytics services when strict mode is enabled.

---

### 4. 📱 **Local Storage Verification**

**Purpose**: Confirm all user data stays on device or goes to user storage

**Steps**:
1. **AsyncStorage Inspection**:
   ```javascript
   // Check what's stored locally
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   AsyncStorage.getAllKeys().then(keys => {
     console.log('Local storage keys:', keys);
     // Should only contain user preferences, no external sync data
   });
   ```

2. **Evidence Locker Check**:
   ```javascript
   // Verify evidence encryption and local storage
   const { loadEncryptedNotes } = require('./services/evidenceCrypto');
   loadEncryptedNotes().then(notes => {
     console.log('Notes stored locally:', notes.length);
     // All notes should be encrypted and stored on-device only
   });
   ```

**Expected Results**: Data should be encrypted locally with no external references.

---

### 5. 🔐 **Credential Security Audit**

**Purpose**: Verify BYOC credentials are never persisted

**Steps**:
1. **Configure WebDAV Storage** in app settings
2. **Check Session Storage**:
   ```javascript
   const { getBYOCConfig } = require('./services/dataPolicy');
   const config = getBYOCConfig();
   console.log('BYOC config (session only):', config);
   ```

3. **Restart App** and check if credentials persist:
   ```javascript
   // After restart
   const configAfterRestart = getBYOCConfig();
   console.log('Config after restart:', configAfterRestart); // Should be: null
   ```

4. **Search AsyncStorage** for credential remnants:
   ```javascript
   AsyncStorage.getAllKeys().then(keys => {
     const credentialKeys = keys.filter(key => 
       key.includes('password') || 
       key.includes('auth') || 
       key.includes('webdav') ||
       key.includes('byoc')
     );
     console.log('Credential keys found:', credentialKeys); // Should be: []
   });
   ```

**Expected Results**: Credentials should never be found in persistent storage.

---

### 6. 📁 **Code Audit Checklist**

**Purpose**: Manual inspection of data handling code

**Key Files to Review**:

1. **`services/dataPolicy.ts`**:
   - ✅ Verify `isStrictBYOC()` controls all data flows
   - ✅ Confirm `setBYOCConfig()` doesn't persist credentials

2. **`firebase/config.ts`**:
   - ✅ Check that `STRICT` variable disables Firebase initialization
   - ✅ Verify exports return `null` when strict mode is enabled

3. **`services/storageProviders.ts`**:
   - ✅ Confirm `ephemeralProvider` doesn't actually store data
   - ✅ Verify `webdavProvider` only talks to user's endpoint

4. **`services/firestore.ts`**:
   - ✅ Check that all functions return early when `getDB()` returns null
   - ✅ Verify no fallback storage mechanisms

5. **`services/evidenceCrypto.ts`**:
   - ✅ Confirm encryption uses device keys only
   - ✅ Verify no external key exchange or storage

**Expected Results**: Code should show clear barriers preventing data leakage when strict mode is enabled.

---

### 7. 🔄 **Data Export/Import Verification**

**Purpose**: Confirm user has complete control over their data

**Steps**:
1. **Create Test Data**:
   - Add evidence notes
   - Set preferences
   - Use wellness tracking

2. **Export Backup**:
   ```javascript
   const { exportBackup } = require('./services/backup');
   exportBackup().then(bundle => {
     console.log('Backup contains:', Object.keys(bundle.items));
     // Should contain all your data in readable format
   });
   ```

3. **Clear All Data**:
   ```javascript
   const { clearAllData } = require('./services/backup');
   clearAllData().then(result => {
     console.log('Data cleared:', result); // Should be: true
   });
   ```

4. **Verify Data Removal**:
   ```javascript
   AsyncStorage.getAllKeys().then(keys => {
     const dataKeys = keys.filter(key => key.startsWith('empowr.') || key.startsWith('wellness_'));
     console.log('Remaining data keys:', dataKeys); // Should be: []
   });
   ```

5. **Import Backup**:
   ```javascript
   const { importBackup } = require('./services/backup');
   importBackup(previousBundle).then(result => {
     console.log('Data restored:', result); // Should be: true
   });
   ```

**Expected Results**: Complete data export/wipe/restore cycle under user control.

---

## 🛡️ **Security Verification**

### Encryption Verification
```javascript
// Test evidence encryption
const { encryptString, decryptString } = require('./services/evidenceCrypto');

const testData = "Sensitive evidence note";
encryptString(testData).then(encrypted => {
  console.log('Encrypted data:', encrypted);
  return decryptString(encrypted);
}).then(decrypted => {
  console.log('Decrypted matches:', decrypted === testData); // Should be: true
});
```

### Device Key Security
```javascript
// Verify device key isolation
const { getOrCreateDeviceKey } = require('./services/evidenceCrypto');

getOrCreateDeviceKey().then(key => {
  console.log('Device key exists:', !!key); // Should be: true
  console.log('Key stored securely'); // Should use SecureStore when available
});
```

---

## ✅ **Verification Checklist**

- [ ] Strict mode disables Firebase completely
- [ ] No network calls to app servers during normal usage  
- [ ] BYOC credentials are session-only (never persisted)
- [ ] All user data stored locally or on user's WebDAV
- [ ] Evidence Locker data is encrypted with device keys
- [ ] Complete data export/import under user control
- [ ] Code audit confirms no data leakage paths
- [ ] Storage provider correctly routes to user's endpoint only

---

## 🚨 **Red Flags to Watch For**

If you encounter any of these during verification, the data ownership guarantee may be compromised:

- ❌ Firebase services available when `isStrictBYOC() === true`
- ❌ Network calls to `*.firebaseapp.com` or `*.googleapis.com` in strict mode
- ❌ BYOC credentials found in AsyncStorage after app restart
- ❌ Data persisting after "Clear All Data" operation
- ❌ Evidence notes stored in plaintext
- ❌ Inability to export complete data backup

---

## 📞 **Support & Questions**

If you find any issues during verification:

1. **Technical Issues**: Report via GitHub issues with verification logs
2. **Security Concerns**: Contact directly at empowrapp08162025@gmail.com
3. **Code Questions**: Review open source codebase for implementation details

---

**Remember**: The goal is 100% user data ownership. If any verification step fails, the guarantee is not met and should be addressed immediately.