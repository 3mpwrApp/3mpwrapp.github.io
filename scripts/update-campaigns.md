# Update Campaigns in Firebase

## Remove Test Campaign

### Using Firebase Console:
1. Go to https://console.firebase.google.com
2. Select project: **empowrapp**
3. Navigate to **Firestore Database**
4. Go to collection: `campaigns_production`
5. Find document: `test-campaign-001` 
6. Click the three dots and select **Delete**

### Using Firebase Admin SDK (if you have Node.js script):
```javascript
// Delete test campaign
await db.collection('campaigns_production').doc('test-campaign-001').delete();
```

---

## Add "Every Canadian Counts" Campaign

The "Every Canadian Counts" campaign should be created from the app. If it's not showing up:

1. **Check if it exists in Firestore:**
   - Go to Firebase Console → Firestore Database
   - Look in `campaigns_production` collection
   - Search for campaigns with title containing "Every Canadian Counts"

2. **If it's not there, create it in the app:**
   - Open the 3mpwr app
   - Go to Campaigns section
   - Create new campaign with:
     - Title: "Every Canadian Counts"
     - Summary: [Your campaign description]
     - Target: [Target organization/government]
     - Make sure it's set to **public** so it appears on the website

3. **Manually add via Firebase Console:**
   - Go to `campaigns_production` collection
   - Click "Add document"
   - Set document fields:
     ```
     title: "Every Canadian Counts"
     summary: "[Your campaign description]"
     target: "[Target organization]"
     goalCount: [Number]
     membersCount: 0
     createdBy: "empowrapp08162025@gmail.com"
     createdAt: [Current timestamp]
     updatedAt: [Current timestamp]
     ```

---

## Expected Result

After removing the test campaign and adding "Every Canadian Counts", the campaigns page at:
https://3mpwrapp.github.io/campaigns/

Should display the real campaign instead of the test data.

---

## Verify Changes

After making changes in Firebase, verify by checking:
1. Direct API: https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns
2. Website: https://3mpwrapp.github.io/campaigns/

Note: Changes should appear within 30 seconds due to the auto-refresh feature.
