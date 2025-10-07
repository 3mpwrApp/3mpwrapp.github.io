import { Alert } from 'react-native';
// Defensively mock expo-router to avoid pulling native-stack assets in this test environment
jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
  useLocalSearchParams: () => ({}),
}));
// Use the global react-native mock's Linking and override methods for assertions
jest.mock('react-native/Libraries/Linking/Linking', () => require('react-native').Linking);

// Silence analytics console noise in this test
jest.mock('../services/analyticsClient', () => ({
  trackEvent: jest.fn(),
}));

// Import the isolated helper to test directly (no heavy rendering)
import { sendFeedbackEmailInternal } from '../utils/feedback';

describe('Settings About & Contact', () => {
  afterEach(() => {
    const { Linking } = require('react-native');
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockReset();
    jest.spyOn(Alert, 'alert').mockRestore?.();
    jest.clearAllMocks();
  });

  it('opens mailto link via helper when available', async () => {
    const { Linking } = require('react-native');
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    const ok = await sendFeedbackEmailInternal((k:string, fb?:string)=> fb || k);
    expect(ok).toBe(true);
    expect(Linking.canOpenURL).toHaveBeenCalled();
    expect(Linking.openURL).toHaveBeenCalled();
    const urlArg = (Linking.openURL as jest.Mock).mock.calls[0][0];
    expect(urlArg).toMatch(/^mailto:/);
  });

  it('shows alert when no email client available (canOpenURL=false)', async () => {
    const { Linking } = require('react-native');
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const ok = await sendFeedbackEmailInternal((k:string, fb?:string)=> fb || k);
    expect(ok).toBe(false);
    expect(Linking.canOpenURL).toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
    const [title, body] = (alertSpy as jest.Mock).mock.calls[0];
    expect(String(title)).toMatch(/Email not configured/i);
    expect(String(body)).toMatch(/Please email/i);
  });
});
