import React, { useState } from 'react';

type Props = {
  onSubmit: (data: { email: string; name?: string; notes?: string }) => Promise<{ ok: boolean; message?: string }>;
};

export function BetaSignupForm({ onSubmit }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot (bot trap)
    const hp = String(formData.get('company') || '');
    if (hp) return; // silently drop

    const email = String(formData.get('email') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const notes = String(formData.get('notes') || '').trim();

    if (!email) {
      setStatus('error');
      setMessage('Please enter a valid email.');
      return;
    }

    try {
      setStatus('submitting');
      setMessage('');
      const res = await onSubmit({ email, name, notes });
      if (res.ok) {
        setStatus('success');
        setMessage(res.message || 'Thanks! We’ll be in touch soon.');
        form.reset();
      } else {
        setStatus('error');
        setMessage(res.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-describedby="beta-status">
      {/* Honeypot field (hidden) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm text-muted">Name (optional)</label>
        <input id="name" name="name" type="text" className="mt-1 w-full rounded-md border px-3 py-2 bg-bg text-fg" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-muted">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          className="mt-1 w-full rounded-md border px-3 py-2 bg-bg text-fg"
          aria-invalid={status === 'error' && !message.startsWith('Thanks') ? 'true' : 'false'}
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm text-muted">Notes (optional)</label>
        <textarea id="notes" name="notes" rows={3} className="mt-1 w-full rounded-md border px-3 py-2 bg-bg text-fg" />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-md bg-primary text-[rgb(var(--color-primary-foreground))] px-4 py-2"
      >
        {status === 'submitting' ? 'Submitting…' : 'Join Beta'}
      </button>

      <p id="beta-status" role="status" aria-live="polite" className="text-sm">
        {message}
      </p>
    </form>
  );
}
