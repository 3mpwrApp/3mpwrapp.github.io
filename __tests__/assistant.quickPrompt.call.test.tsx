// Shared assistant test setup (palette, typography, i18n, A11yPressable)
import { fireEvent, render } from '@testing-library/react';
import { router } from 'expo-router';
import './__helpers__/assistantTestSetup';

import AssistantHub from '../app/(tabs)/advocacy/assistant-hub';
import * as analyticsClient from '../services/analyticsClient';

// Use global expo-router mock; capture router.push
const pushMock = router.push as jest.Mock;
beforeEach(() => pushMock.mockReset());

describe('Assistant Hub quick prompts (call script)', () => {
  it('emits assistant.quick_prompt and navigates with q when tapping the HR call script prompt', () => {
    const events: analyticsClient.AnalyticsEvent[] = [] as any;
    analyticsClient.setAnalyticsSink((n, p) => { events.push({ name: n, params: p }); });
    try {
      const { getByText } = render(<AssistantHub />);
      const chip = getByText('Draft a call script to HR');
      fireEvent.click(chip);
    } finally {
      analyticsClient.setAnalyticsSink(null);
    }
    const found = events.find(e => e.name === 'assistant.quick_prompt');
    expect(found).toBeTruthy();
    expect(found?.params).toBeTruthy();
    expect((found as any).params.label).toEqual(expect.any(String));
    // ensure navigation passes q param
    expect(pushMock).toHaveBeenCalled();
    const arg = pushMock.mock.calls[0][0];
    expect(arg?.params?.q).toEqual(expect.any(String));
  });
});
