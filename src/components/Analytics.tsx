import React, { useEffect, useState } from 'react';

type Provider = 'plausible' | 'ga4';

type Props =
  | { provider: 'plausible'; domain: string }
  | { provider: 'ga4'; measurementId: string };

const CONSENT_KEY = 'analytics-consent'; // 'granted' | 'denied'

export function Analytics(props: Props) {
  const [consent, setConsent] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  useEffect(() => {
    const saved = (localStorage.getItem(CONSENT_KEY) as 'granted' | 'denied') || 'unknown';
    setConsent(saved);
  }, []);

  if (consent !== 'granted') return null;

  if (props.provider === 'plausible') {
    return (
      // eslint-disable-next-line @next/next/no-sync-scripts
      <script defer data-domain={props.domain} src="https://plausible.io/js/script.js" />
    );
  }

  if (props.provider === 'ga4') {
    return (
      <>
        {/* eslint-disable @next/next/no-sync-scripts */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${props.measurementId}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments)}
            gtag('js', new Date());
            gtag('config', '${props.measurementId}', { anonymize_ip: true });
          `,
          }}
        />
      </>
    );
  }

  return null;
}

export function ConsentBanner() {
  const CONSENT_KEY = 'analytics-consent';
  const [visible, setVisible] = useState(!localStorage.getItem(CONSENT_KEY));
  if (!visible) return null;
  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 p-4 bg-fg text-bg"
    >
      <p className="text-sm">
        We use privacy-friendly analytics to improve your experience. See our Privacy Policy.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => { localStorage.setItem(CONSENT_KEY,'granted'); setVisible(false); }}
          className="bg-bg text-fg rounded px-3 py-1"
        >
          Accept
        </button>
        <button
          onClick={() => { localStorage.setItem(CONSENT_KEY,'denied'); setVisible(false); }}
          className="bg-bg/20 text-bg rounded px-3 py-1"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
