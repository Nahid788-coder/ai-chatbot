export const LogoMark = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="logo-mark">
    <defs>
      <linearGradient id="aurora-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8B6CFF" />
        <stop offset="1" stopColor="#22D3EE" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" className="logo-bg" />
    <path
      d="M32 11c1.6 9.6 5.8 13.9 15.4 15.6-9.6 1.6-13.8 5.9-15.4 15.5-1.6-9.6-5.8-13.9-15.4-15.5C26.2 24.9 30.4 20.6 32 11z"
      fill="url(#aurora-g)"
    />
    <circle cx="46" cy="45" r="4.5" fill="url(#aurora-g)" opacity=".85" />
  </svg>
);

export const Logo = ({ size = 28 }: { size?: number }) => (
  <span className="logo">
    <LogoMark size={size} />
    <span className="logo-text">
      Aurora<span className="logo-accent"> Chat</span>
    </span>
  </span>
);
