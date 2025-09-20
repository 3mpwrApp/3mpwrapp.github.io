import { act, render } from '@testing-library/react';
import { BookmarksProvider, useBookmarks } from '../store/bookmarks';

function Harness({ cb }: { cb: (api: ReturnType<typeof useBookmarks>) => void }) {
  const api = useBookmarks();
  cb(api);
  return null;
}

describe('bookmarks store', () => {
  test('add, prevent duplicate, remove, clear', () => {
    const calls: any[] = [];
    const spy = (global as any).logEvent;
    (global as any).logEvent = (...args:any[]) => { calls.push(args); };

    let api: any;
    render(<BookmarksProvider><Harness cb={(a)=> (api=a)} /></BookmarksProvider>);

    act(()=> api.addBookmark('/route/one','One','key.one'));
    expect(api.items).toHaveLength(1);
    act(()=> api.addBookmark('/route/one','One','key.one')); // duplicate
    expect(api.items).toHaveLength(1);
    const id = api.items[0].id;
    act(()=> api.removeBookmark(id));
    expect(api.items).toHaveLength(0);

    act(()=> api.addBookmark('/a','A'));
    act(()=> api.addBookmark('/b','B'));
    expect(api.items).toHaveLength(2);
    act(()=> api.clearBookmarks());
    expect(api.items).toHaveLength(0);

    (global as any).logEvent = spy;
  });
});
