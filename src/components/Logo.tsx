/** App mark: a house inside a location pin, for "우리동네". */
export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="우리동네 로고"
      className={className}
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-bg)" />
      <path d="M32 9C22.6 9 15 16.4 15 25.6 15 38 32 55 32 55S49 38 49 25.6C49 16.4 41.4 9 32 9Z" fill="#fff" />
      <path d="M22.5 27.5 32 19l9.5 8.5" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25.5 26v9.5a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V26L32 20.5Z" fill="#059669" />
      <rect x="30" y="30.5" width="4" height="6.5" rx="1" fill="#fff" />
    </svg>
  );
}
