/**
 * Google Drive Help Content
 * User-facing help text for Google Drive BYOC setup
 */

export const GDRIVE_HELP = {
  title: 'Google Drive Setup',
  
  overview: `Connect your personal Google Drive to store all your app data in your own cloud account. You maintain complete ownership and control of your data.`,
  
  benefits: [
    'Complete data ownership - your Google account, your data',
    'Access your data from any device',
    'No app servers - everything stays in your Drive',
    'Encrypted in transit and at rest',
    'Free with any Google account (15GB free storage)',
  ],
  
  howItWorks: [
    {
      step: 1,
      title: 'Connect Your Account',
      description: 'Tap "Connect Google Drive" and sign in with your Google account. You\'ll be asked to grant the app permission to create and access its own files.',
    },
    {
      step: 2,
      title: 'Automatic Folder Creation',
      description: 'The app creates a folder called "3mpwr_App_Data" in your Google Drive. All app data is stored here.',
    },
    {
      step: 3,
      title: 'Seamless Sync',
      description: 'Your data automatically syncs to Google Drive whenever you save. Works offline too - changes sync when you\'re back online.',
    },
  ],
  
  whatStored: [
    'Your settings and preferences',
    'Evidence entries and photos',
    'Health and wellness tracking data',
    'Campaign participation records',
    'Bookmarked resources',
    'Notes and journal entries',
  ],
  
  privacy: {
    title: 'Privacy & Security',
    points: [
      'Only the app can access its own files - other apps cannot see this data',
      'You can view, download, or delete files anytime from your Google Drive',
      'No data is stored on app servers - it goes directly to your Google Drive',
      'Connection is encrypted using Google\'s security protocols',
      'You can disconnect anytime - your data stays in your Google Drive',
    ],
  },
  
  permissions: {
    title: 'Why We Need Permissions',
    explanation: `When you connect, you'll see a permission request for "See, create, and delete its own files in your Google Drive." This is the minimum permission needed for the app to work.`,
    whatItMeans: [
      '✅ App CAN: Create and update its own files in the 3mpwr_App_Data folder',
      '✅ App CAN: Read files it previously created',
      '❌ App CANNOT: See your other Google Drive files',
      '❌ App CANNOT: Access your emails, contacts, or other Google services',
      '❌ App CANNOT: Share your files with others',
    ],
  },
  
  troubleshooting: [
    {
      issue: 'Connection failed or timed out',
      solution: 'Make sure you have an internet connection and try again. If the popup was blocked, allow popups for this app and try again.',
    },
    {
      issue: 'Files not syncing',
      solution: 'Check your internet connection. If offline, files will sync automatically when you\'re back online. You can also manually trigger a sync in Settings.',
    },
    {
      issue: 'Want to disconnect',
      solution: 'Tap "Disconnect Google Drive" in Settings → BYOC. Your data will remain in your Google Drive, but the app will no longer sync to it.',
    },
    {
      issue: 'Storage space running low',
      solution: 'Google Drive gives 15GB free. You can upgrade for more space at drive.google.com, or delete old files from your 3mpwr_App_Data folder.',
    },
  ],
  
  viewYourData: {
    title: 'How to View Your Data',
    steps: [
      'Open Google Drive on web or mobile',
      'Look for a folder called "3mpwr_App_Data"',
      'All your app data is stored here',
      'You can download, backup, or delete files anytime',
    ],
  },
  
  faq: [
    {
      q: 'Does this use my Google Drive storage quota?',
      a: 'Yes, the data counts toward your Google Drive storage (15GB free, upgradable).',
    },
    {
      q: 'Can I use a different Google account?',
      a: 'Yes! Disconnect the current account and connect with a different one. Your old data stays in the first account\'s Drive.',
    },
    {
      q: 'What happens if I run out of storage?',
      a: 'The app will show an error when trying to save. You\'ll need to free up space in your Google Drive or upgrade your plan.',
    },
    {
      q: 'Is my data encrypted?',
      a: 'Yes, data is encrypted in transit (HTTPS). Google also encrypts data at rest in their datacenters. For additional security, you can enable local encryption in Settings.',
    },
    {
      q: 'Can I export my data?',
      a: 'Absolutely! Your data is in standard formats (JSON, text) in your Google Drive. You can download it anytime.',
    },
  ],
};

export default GDRIVE_HELP;
