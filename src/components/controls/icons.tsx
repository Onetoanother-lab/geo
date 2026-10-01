type IconProps = { size?: number };
const base = (size = 18) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true });

export const IconSound = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);
export const IconMuted = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </svg>
);
export const IconSources = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 4.5h10.5L19 8v11.5H5z" />
    <path d="M8.5 10h7M8.5 13h7M8.5 16h4.5" />
  </svg>
);
export const IconChapters = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 6h14M5 12h10M5 18h6" />
  </svg>
);
export const IconFullscreen = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
  </svg>
);
export const IconMotion = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 12c3-5 6-5 9 0s6 5 9 0" />
  </svg>
);
export const IconClose = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IconPresenter = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <rect x="3.5" y="4.5" width="17" height="11" rx="1" />
    <path d="M12 15.5v4M8.5 19.5h7" />
  </svg>
);
