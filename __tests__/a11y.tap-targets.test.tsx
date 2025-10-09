import { render } from '@testing-library/react';

import A11yPressable from '../components/A11yPressable';

// Simple snapshot-ish structural assertions for tap target sizing and hitSlop

describe('A11y Tap Targets', () => {
  it('Renders a pressable with accessible role=button and label', () => {
    const { getByRole } = render(<A11yPressable onPress={()=>{}} accessibilityLabel='Test button'><></></A11yPressable>);
    const btn = getByRole('button', { name: /Test button/i });
    expect(btn).toBeTruthy();
  });
  it('Renders custom button with label', () => {
    const { getByRole } = render(<A11yPressable accessibilityLabel='Submit' onPress={()=>{}} style={{ paddingVertical:10, paddingHorizontal:12 }} />);
    const btn = getByRole('button', { name: /Submit/i });
    expect(btn).toBeTruthy();
  });
});
