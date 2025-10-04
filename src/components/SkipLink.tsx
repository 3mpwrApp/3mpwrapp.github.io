import React from 'react';

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50
                 focus:bg-primary focus:text-[rgb(var(--color-primary-foreground))]
                 rounded-md px-3 py-2 shadow"
    >
      Skip to content
    </a>
  );
}
