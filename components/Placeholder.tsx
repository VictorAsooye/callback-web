import React from 'react';

interface PlaceholderProps {
  label?: string;
  w?: number;
  h?: number;
  tone?: number;
}

const COLORS: [string, string][] = [
  ['oklch(0.92 0.04 262)', 'oklch(0.52 0.14 262)'],
  ['oklch(0.92 0.05 25)',  'oklch(0.62 0.14 25)'],
  ['oklch(0.92 0.05 155)', 'oklch(0.55 0.12 155)'],
  ['oklch(0.92 0.04 80)',  'oklch(0.58 0.12 80)'],
  ['oklch(0.92 0.04 205)', 'oklch(0.55 0.10 205)'],
];

export function Placeholder({ label = 'CO', w = 40, h = 40, tone }: PlaceholderProps) {
  const i = (label.charCodeAt(0) + (label.charCodeAt(1) || 0)) % COLORS.length;
  const c = COLORS[tone ?? i];

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: Math.min(w, h) * 0.22,
        background: c[0],
        color: c[1],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: w * 0.34,
        letterSpacing: -0.02,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}
