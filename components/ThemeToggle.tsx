'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ inline = false }: { inline?: boolean }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const current = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    setTheme(current);
    document.documentElement.setAttribute('data-theme', current);
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  const className = `theme-toggle${inline ? ' theme-toggle-inline' : ''}`;

  if (!mounted) {
    return <span className={`${className} theme-toggle-ghost`} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Moon size={18} strokeWidth={1.6} aria-hidden="true" />
      ) : (
        <Sun size={18} strokeWidth={1.6} aria-hidden="true" />
      )}
    </button>
  );
}
