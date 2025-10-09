import * as React from 'react';
 
import { useTranslation } from '../i18n';
import { announce } from '../utils/announce';

/**
 * One-time post-load item count announcement hook.
 * Announces a localized "items loaded" message on first transition from loading->ready.
 */
export function usePostLoadAnnounce(
  opts: { loading: boolean; count: number; ns: string; emptyKey?: string }
) {
  const first = React.useRef(true);
  const { t } = useTranslation();
  React.useEffect(() => {
    if (!opts.loading && first.current) {
      first.current = false;
      const c = opts.count;
      if (c <= 0) {
        if (opts.emptyKey) announce(t(opts.emptyKey, 'No items'));
        return;
      }
      const base = `${opts.ns}.itemsLoaded`;
      const msg = c === 1
        ? t(`${base}.one`, '{{count}} item loaded').replace('{{count}}', String(c))
        : t(`${base}.other`, '{{count}} items loaded').replace('{{count}}', String(c));
      // small delay to avoid competing with initial header focus
      setTimeout(() => announce(msg), 50);
    }
  }, [opts.loading, opts.count, opts.ns, opts.emptyKey, t]);
}
