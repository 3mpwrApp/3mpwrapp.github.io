// Mock for @sentry/react-native in Jest tests
module.exports = {
  init: jest.fn(),
  wrap: jest.fn((component) => component),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  captureEvent: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setTags: jest.fn(),
  setExtra: jest.fn(),
  setExtras: jest.fn(),
  setContext: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setExtra: jest.fn() })),
  getCurrentScope: jest.fn(() => ({
    setTag: jest.fn(),
    setExtra: jest.fn(),
    setUser: jest.fn(),
  })),
  getGlobalScope: jest.fn(() => ({
    setTag: jest.fn(),
    setExtra: jest.fn(),
  })),
  getIsolationScope: jest.fn(() => ({
    setTag: jest.fn(),
    setExtra: jest.fn(),
  })),
  getClient: jest.fn(() => null),
  setCurrentClient: jest.fn(),
  addEventProcessor: jest.fn(),
  lastEventId: jest.fn(),
  Scope: jest.fn(),
  startSpan: jest.fn(),
  startSpanManual: jest.fn(),
  startInactiveSpan: jest.fn(),
  getActiveSpan: jest.fn(),
  getRootSpan: jest.fn(),
  withActiveSpan: jest.fn(),
  suppressTracing: jest.fn(),
  spanToJSON: jest.fn(),
  spanIsSampled: jest.fn(),
  setMeasurement: jest.fn(),
  addIntegration: jest.fn(),
  captureFeedback: jest.fn(),
  
  // React Native specific
  ReactNativeTracing: jest.fn(),
  ReactNavigationInstrumentation: jest.fn(),
  
  // Feedback integration
  feedbackIntegration: jest.fn(() => ({
    name: 'Feedback',
  })),
  showFeedbackWidget: jest.fn(),
  showFeedbackButton: jest.fn(),
  hideFeedbackButton: jest.fn(),
  
  // Native methods
  nativeCrash: jest.fn(),
  flush: jest.fn(() => Promise.resolve(true)),
  close: jest.fn(() => Promise.resolve()),
};
