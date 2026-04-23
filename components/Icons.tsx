import React from 'react';

interface IconProps {
  d: string | React.ReactNode;
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  viewBox?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function Icon({ d, size = 16, fill = 'none', stroke = 'currentColor', strokeWidth = 1.5, viewBox = 24, style, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      {typeof d === 'string' ? <path d={d} /> : d}
    </svg>
  );
}

export const Icons = {
  check:    'M5 12.5l4 4L19 7',
  x:        'M6 6l12 12M18 6L6 18',
  bolt:     'M13 3L5 13h6l-1 8 8-10h-6l1-8z',
  loc:      <><path d="M12 21s-7-6.5-7-12a7 7 0 1114 0c0 5.5-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  clock:    <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  briefcase:<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" /></>,
  shield:   'M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z',
  cash:     <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></>,
  rotate:   <><path d="M3 12a9 9 0 019-9 9 9 0 018 5" /><path d="M21 4v5h-5" /></>,
  up:       'M12 19V5M5 12l7-7 7 7',
  right:    'M5 12h14M13 5l7 7-7 7',
  search:   <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  upload:   <><path d="M12 17V5" /><path d="M5 12l7-7 7 7" /><path d="M4 19h16" /></>,
  sparkle:  'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  filter:   'M4 5h16M7 12h10M10 19h4',
  sun:      <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon:     'M21 13A9 9 0 1111 3a7 7 0 0010 10z',
  arrow:    'M5 12h14M13 6l6 6-6 6',
  back:     'M15 6l-6 6 6 6',
  save:     'M12 19V5M5 12l7-7 7 7',
  share:    'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13',
  trash:    <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></>,
} as const;

export type IconKey = keyof typeof Icons;
