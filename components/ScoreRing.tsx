'use client';

import React from 'react';

interface ScoreRingProps {
  value: number;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
}

export function ScoreRing({ value = 0, size = 72, stroke = 6, showLabel = true }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - clamped / 100);
  const color = clamped >= 70 ? 'var(--positive)' : clamped >= 45 ? 'var(--accent)' : 'var(--penalty)';

  return (
    <div
      className="score-ring"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--score-track)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.2,.7,.3,1)' }}
        />
      </svg>
      {showLabel && (
        <div
          className="val mono"
          style={{ position: 'absolute', fontSize: size * 0.34, fontVariantNumeric: 'tabular-nums', fontWeight: 500, letterSpacing: '-0.02em' }}
        >
          {Math.round(clamped)}
          <span style={{ fontSize: size * 0.18, color: 'var(--ink-mute)', marginLeft: 1 }}>%</span>
        </div>
      )}
    </div>
  );
}
