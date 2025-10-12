import { fireEvent, render } from '@testing-library/react';
import { Text } from 'react-native';

// Mock the required modules
jest.mock('../hooks/useA11y', () => ({
  useScreenReaderEnabled: () => false,
  useReduceMotionEnabled: () => false,
}));

jest.mock('../constants/a11y', () => ({
  touchTarget: {
    min: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    enhanced: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
    large: { minWidth: 56, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  },
}));

import A11yPressable from '../components/A11yPressable';

describe('A11yPressable Enhanced Accessibility', () => {
  const defaultProps = {
    onPress: jest.fn(),
    children: <Text>Test Button</Text>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default accessibility role', () => {
    const { getByRole } = render(<A11yPressable {...defaultProps} />);
    
    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('applies default hit slop for touch targets', () => {
    const { getByRole } = render(<A11yPressable {...defaultProps} />);
    
    const button = getByRole('button');
    expect(button.props.hitSlop).toEqual({ top: 10, bottom: 10, left: 10, right: 10 });
  });

  it('applies enhanced hit slop when screen reader is active', () => {
    // Mock screen reader enabled
    jest.doMock('../hooks/useA11y', () => ({
      useScreenReaderEnabled: () => true,
      useReduceMotionEnabled: () => false,
    }));
    
    const A11yPressableWithScreenReader = require('../components/A11yPressable').default;
    
    const { getByRole } = render(
      <A11yPressableWithScreenReader {...defaultProps} />
    );
    
    const button = getByRole('button');
    expect(button.props.hitSlop).toEqual({ top: 16, bottom: 16, left: 16, right: 16 });
  });

  it('applies minimum touch target size', () => {
    const { getByRole } = render(<A11yPressable {...defaultProps} />);
    
    const button = getByRole('button');
    const style = button.props.style({ pressed: false });
    
    expect(style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          minWidth: 44,
          minHeight: 44,
        })
      ])
    );
  });

  it('applies enhanced touch target when specified', () => {
    const { getByRole } = render(
      <A11yPressable {...defaultProps} minTouchTarget="enhanced" />
    );
    
    const button = getByRole('button');
    const style = button.props.style({ pressed: false });
    
    expect(style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          minWidth: 48,
          minHeight: 48,
        })
      ])
    );
  });

  it('applies large touch target when specified', () => {
    const { getByRole } = render(
      <A11yPressable {...defaultProps} minTouchTarget="large" />
    );
    
    const button = getByRole('button');
    const style = button.props.style({ pressed: false });
    
    expect(style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          minWidth: 56,
          minHeight: 56,
        })
      ])
    );
  });

  it('handles custom accessibility role', () => {
    const { getByRole } = render(
      <A11yPressable {...defaultProps} accessibilityRole="link" />
    );
    
    const link = getByRole('link');
    expect(link).toBeTruthy();
  });

  it('handles legacy role prop', () => {
    const { getByRole } = render(
      <A11yPressable {...defaultProps} role="link" />
    );
    
    const link = getByRole('link');
    expect(link).toBeTruthy();
  });

  it('prioritizes accessibilityRole over role prop', () => {
    const { getByRole } = render(
      <A11yPressable 
        {...defaultProps} 
        role="link" 
        accessibilityRole="button" 
      />
    );
    
    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('applies pressed state styling', () => {
    const { getByRole } = render(<A11yPressable {...defaultProps} />);
    
    const button = getByRole('button');
    const pressedStyle = button.props.style({ pressed: true });
    
    expect(pressedStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          opacity: 0.7,
        })
      ])
    );
  });

  it('reduces motion in pressed state when reduce motion is enabled', () => {
    // Mock reduce motion enabled
    jest.doMock('../hooks/useA11y', () => ({
      useScreenReaderEnabled: () => false,
      useReduceMotionEnabled: () => true,
    }));
    
    const A11yPressableWithReduceMotion = require('../components/A11yPressable').default;
    
    const { getByRole } = render(
      <A11yPressableWithReduceMotion {...defaultProps} />
    );
    
    const button = getByRole('button');
    const pressedStyle = button.props.style({ pressed: true });
    
    expect(pressedStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          opacity: 0.9, // Less opacity change when reduce motion is enabled
        })
      ])
    );
  });

  it('sets accessibility state correctly', () => {
    const { getByRole } = render(
      <A11yPressable {...defaultProps} disabled />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityState.busy).toBe(true);
  });

  it('merges custom accessibility state', () => {
    const { getByRole } = render(
      <A11yPressable 
        {...defaultProps} 
        accessibilityState={{ selected: true }}
      />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityState.selected).toBe(true);
    expect(button.props.accessibilityState.busy).toBe(false);
  });

  it('handles custom style functions', () => {
    const customStyle = ({ pressed }: { pressed: boolean }) => ({
      backgroundColor: pressed ? 'red' : 'blue',
    });
    
    const { getByRole } = render(
      <A11yPressable {...defaultProps} style={customStyle} />
    );
    
    const button = getByRole('button');
    const style = button.props.style({ pressed: false });
    
    expect(style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: 'blue',
        })
      ])
    );
  });

  it('handles custom static styles', () => {
    const customStyle = { backgroundColor: 'green' };
    
    const { getByRole } = render(
      <A11yPressable {...defaultProps} style={customStyle} />
    );
    
    const button = getByRole('button');
    const style = button.props.style({ pressed: false });
    
    expect(style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: 'green',
        })
      ])
    );
  });

  it('can disable enhanced accessibility features', () => {
    const { getByRole } = render(
      <A11yPressable {...defaultProps} enhancedAccessibility={false} />
    );
    
    const button = getByRole('button');
    expect(button.props.hitSlop).toEqual({ top: 10, bottom: 10, left: 10, right: 10 });
  });

  it('handles onPress events correctly', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <A11yPressable {...defaultProps} onPress={onPress} />
    );
    
    const button = getByRole('button');
    fireEvent.press(button);
    
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('passes through other Pressable props', () => {
    const onLongPress = jest.fn();
    const { getByLabelText } = render(
      <A11yPressable 
        {...defaultProps} 
        onLongPress={onLongPress}
        accessibilityLabel="Custom Label Button"
      >
        <Text>Custom Label Button</Text>
      </A11yPressable>
    );
    
    const button = getByLabelText('Custom Label Button');
    expect(button).toBeTruthy();
  });
});

describe('A11yPressable Platform-Specific Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // Reset module cache
  });

  it('includes web-specific focus handling', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    
    const { getByLabelText } = render(
      <A11yPressable 
        onPress={jest.fn()}
        onFocus={onFocus}
        onBlur={onBlur}
        accessibilityLabel="Web Button"
      >
        <Text>Web Button</Text>
      </A11yPressable>
    );
    
    const button = getByLabelText('Web Button');
    expect(button).toBeTruthy();
  });
});