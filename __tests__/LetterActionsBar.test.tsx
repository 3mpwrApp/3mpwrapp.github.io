// Placeholder skipped test for LetterActionsBar.
// Original implementation attempted to use react-test-renderer with React 19 + RN 0.79
// which produced unstable mounting ("Can't access .root on unmounted test renderer") and
// deprecation warnings. Until we adopt a supported RN testing approach (e.g. upgrading
// to a version of @testing-library/react-native compatible with React 19 or swapping to
// a different integration test strategy), we keep this file as a skipped suite so CI stays green.
//
// TODO: Re-implement once testing stack is updated.

import { fireEvent, render, screen } from '@testing-library/react';

// Minimal mocks for RN + palette
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ background:'#fff', text:'#111', primary:'#06f', onPrimary:'#fff', muted:'#ccc', surface:'#f9f9f9' }) }));
jest.mock('react-native', () => ({
	StyleSheet: { create: (o:any)=> o },
	View: ({children}:any)=> <div>{children}</div>,
	Text: ({children}:any)=> <span>{children}</span>,
	Pressable: ({children,onPress, accessibilityLabel}:any)=> <button aria-label={accessibilityLabel} onClick={onPress}>{children}</button>
}));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k:string, fb?:string) => fb || k }) }));

try { jest.mock('../services/analyticsClient', () => ({ trackEvent: jest.fn() })); } catch {}

// Import component under test
import LetterActionsBar from '../components/letters/LetterActionsBar';

describe('LetterActionsBar', () => {
		it('renders toggle + copy actions and triggers callbacks', () => {
			const onToggleInfo = jest.fn();
			const onCopy = jest.fn();
			const palette = { background:'#fff', text:'#111', primary:'#06f', onPrimary:'#fff', muted:'#ccc', surface:'#f9f9f9' };
			render(<LetterActionsBar showInfo={false} onToggleInfo={onToggleInfo} onCopy={onCopy} palette={palette} />);
			const toggle = screen.getByRole('button', { name: /toggle instructions/i });
			const copy = screen.getByRole('button', { name: /copy/i });
			fireEvent.click(toggle);
			fireEvent.click(copy);
			expect(onToggleInfo).toHaveBeenCalledTimes(1);
			expect(onCopy).toHaveBeenCalledTimes(1);
		});
});
