import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = ({ size = 18, ...rest }: P) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...rest,
});

export const IconPlus = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconSend = (p: P) => (<svg {...base(p)}><path d="M12 19V5M5 12l7-7 7 7" /></svg>);
export const IconStop = (p: P) => (<svg {...base(p)}><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" /></svg>);
export const IconCopy = (p: P) => (<svg {...base(p)}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>);
export const IconCheck = (p: P) => (<svg {...base(p)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const IconTrash = (p: P) => (<svg {...base(p)}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>);
export const IconEdit = (p: P) => (<svg {...base(p)}><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" /></svg>);
export const IconLogout = (p: P) => (<svg {...base(p)}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" /></svg>);
export const IconSun = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>);
export const IconMoon = (p: P) => (<svg {...base(p)}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>);
export const IconMenu = (p: P) => (<svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h10" /></svg>);
export const IconClose = (p: P) => (<svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const IconChevron = (p: P) => (<svg {...base(p)}><path d="M6 9l6 6 6-6" /></svg>);
export const IconSearch = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></svg>);
export const IconShare = (p: P) => (<svg {...base(p)}><path d="M12 15V3M8 7l4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>);
export const IconRefresh = (p: P) => (<svg {...base(p)}><path d="M20 11a8 8 0 0 0-14.9-3M4 5v4h4M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4" /></svg>);
export const IconAlert = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></svg>);
export const IconChat = (p: P) => (<svg {...base(p)}><path d="M5 18l-1 3 4-1.5A8.5 8.5 0 1 0 5 18z" /></svg>);
export const IconGithub = ({ size = 18, ...rest }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...rest}>
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
  </svg>
);
