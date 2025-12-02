// Mock for expo-updates in test environment
module.exports = {
  channel: 'development',
  isEmbeddedLaunch: true,
  isEmergencyLaunch: false,
  createdAt: null,
  manifest: null,
  manifestDigest: null,
  runtimeVersion: '1.0.0',
  checkForUpdateAsync: jest.fn().mockResolvedValue({ isAvailable: false }),
  fetchUpdateAsync: jest.fn().mockResolvedValue({ isNew: false }),
  reloadAsync: jest.fn(),
  useUpdates: jest.fn(() => ({
    isChecking: false,
    isDownloading: false,
    isUpdateAvailable: false,
    isUpdatePending: false,
    downloadedUpdate: null,
    availableUpdate: null,
  })),
};
