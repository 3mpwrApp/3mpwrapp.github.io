declare module '@react-native-community/netinfo' {
  export type NetInfoState = {
    type?: string;
    isConnected?: boolean | null;
    isInternetReachable?: boolean | null;
  };
  const NetInfo: {
    addEventListener: (fn: (state: NetInfoState) => void) => () => void;
    fetch: () => Promise<NetInfoState>;
  };
  export default NetInfo;
}
