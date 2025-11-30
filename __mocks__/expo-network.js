/**
 * Mock for expo-network
 */

module.exports = {
  NetworkStateType: {
    UNKNOWN: 0,
    NONE: 1,
    WIFI: 2,
    CELLULAR: 3,
    OTHER: 4,
  },
  getNetworkStateAsync: jest.fn(async () => ({
    type: 2, // WIFI
    isConnected: true,
    isInternetReachable: true,
  })),
};
