import React, { useState } from 'react';

type Props = {
  onSubmit: (data: { email: string }) => Promise<{ ok: boolean; message?: string }>;
};

export function NewsletterForm({ onSubmit }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot
    const hp = String(formData.get('website') || '');
    if (hp) return;

    const email = String(formData.get('email') || '').trim();
    if (!email) {
      setStatus('error');
      setMessage('Please enter a valid email.');
      return;
    }

    try {
      setStatus('submitting');
      setMessage('');
      const res = await onSubmit({ email });
      if (res.ok) {
        setStatus('success');
        setMessage(res.message || 'Subscribed! Check your inbox.');
        form.reset();
      } else {
        setStatus('error');
        setMessage(res.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2" aria-describedby="newsletter-status">
      {/* Honeypot */}
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <label htmlFor="newsletter-email" className="sr-only">Email</label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        className="flex-1 rounded-md border px-3 py-2 bg-bg text-fg"
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-md bg-accent text-[rgb(var(--color-accent-foreground))] px-4 py-2"
      >
        {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
      </button>

      <p id="newsletter-status" role="status" aria-live="polite" className="text-sm">
        {message}
      </p>
    </form>
  );
}
