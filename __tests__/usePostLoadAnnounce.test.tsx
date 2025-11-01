import { render } from '@testing-library/react';

jest.mock('../i18n', () => ({
  useTranslation: () => ({
    t: (k: string, fb?: string) => ({
      'feature.itemsLoaded.one': '{{count}} item loaded',
      'feature.itemsLoaded.other': '{{count}} items loaded',
      'feature.empty': 'No items',
    } as any)[k] || fb || k,
  }),
}));

jest.useFakeTimers();

// Spy on announce to verify calls
jest.mock('../utils/announce', () => ({
  announce: jest.fn(),
}));

import { usePostLoadAnnounce } from '../hooks/usePostLoadAnnounce';
import { announce } from '../utils/announce';

function TestComp({ loading, count, ns, emptyKey }: any){
  usePostLoadAnnounce({ loading, count, ns, emptyKey });
  return <div />;
}

describe('usePostLoadAnnounce', () => {
  beforeEach(() => {
    (announce as jest.Mock).mockClear();
  });

  it('announces once when loading completes with pluralization', () => {
    const { rerender } = render(<TestComp loading={true} count={0} ns="feature" />);
    rerender(<TestComp loading={false} count={1} ns="feature" />);
    // advance timers to flush setTimeout in hook
    jest.runAllTimers();
    expect(announce).toHaveBeenCalledTimes(1);
    expect((announce as jest.Mock).mock.calls[0][0]).toMatch('1 item loaded');
  });

  it('uses other form for counts >1', () => {
    const { rerender } = render(<TestComp loading={true} count={0} ns="feature" />);
    rerender(<TestComp loading={false} count={5} ns="feature" />);
    jest.runAllTimers();
    expect(announce).toHaveBeenCalledWith('5 items loaded');
  });

  it('announces emptyKey when count is 0', () => {
    const { rerender } = render(<TestComp loading={true} count={0} ns="feature" emptyKey="feature.empty" />);
    rerender(<TestComp loading={false} count={0} ns="feature" emptyKey="feature.empty" />);
    jest.runAllTimers();
    expect(announce).toHaveBeenCalledWith('No items');
  });

  it('does not announce again on subsequent updates', () => {
    const { rerender } = render(<TestComp loading={true} count={0} ns="feature" />);
    rerender(<TestComp loading={false} count={3} ns="feature" />);
    rerender(<TestComp loading={false} count={10} ns="feature" />);
    jest.runAllTimers();
    expect(announce).toHaveBeenCalledTimes(1);
  });
});
