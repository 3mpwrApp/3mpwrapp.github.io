import React, { useEffect, useState } from 'react';

const THEME_KEY = 'theme'; // 'light' | 'dark' | 'system'

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  root.dataset.theme = theme;
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Initialize
  useEffect(() => {
    const saved = (localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system') || 'system';
    setTheme(saved);
    applyTheme(saved === 'system' ? getSystemTheme() : saved);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (saved === 'system') applyTheme(getSystemTheme());
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function update(next: 'light' | 'dark' | 'system') {
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next === 'system' ? getSystemTheme() : next);
  }

  return (
    <div className="inline-flex items-center gap-2">
      <label className="text-sm text-muted">Theme</label>
      <select
        aria-label="Theme"
        value={theme}
        onChange={(e) => update(e.target.value as 'light' | 'dark' | 'system')}
        className="rounded-md border px-2 py-1 bg-bg text-fg"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
