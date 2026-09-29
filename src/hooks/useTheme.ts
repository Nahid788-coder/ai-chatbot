import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
const KEY = 'aurora-theme';

const initial = (): Theme => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    /* storage blocked */
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0B0D17' : '#F6F7FB');
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* storage blocked */
    }
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) };
};
