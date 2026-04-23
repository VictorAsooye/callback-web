'use client';

import React from 'react';

export interface Segment {
  label: string;
  value: number;
  type: 'pos' | 'neg' | 'neu';
}

interface ScoreSegmentsProps {
  segments: Segment[];
  height?: number;
  showLegend?: boolean;
}

export function ScoreSegments({ segments, height = 8, showLegend = false }: ScoreSegmentsProps) {
  const total = segments.reduce((s, x) => s + Math.abs(x.value), 0) || 1;

  return (
    <div>
      <div className="score-bar" style={{ height }}>
        {segments.map((s, i) => (
          <span
            key={i}
            className={s.type === 'neg' ? 'seg-neg' : s.type === 'neu' ? 'seg-neu' : 'seg-pos'}
            style={{ width: `${(Math.abs(s.value) / total) * 100}%` }}
            title={`${s.label}: ${s.value > 0 ? '+' : ''}${s.value}`}
          />
        ))}
      </div>
      {showLegend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 10, fontSize: 11, color: 'var(--ink-mute)' }}>
          {segments.map((s, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 8, height: 8, borderRadius: 2,
                background: s.type === 'neg' ? 'var(--penalty)' : s.type === 'neu' ? 'var(--accent)' : 'var(--positive)',
              }} />
              {s.label}{' '}
              <span
                className="mono"
                style={{ color: s.type === 'neg' ? 'var(--penalty)' : 'var(--ink-soft)' }}
              >
                {s.value > 0 ? '+' : ''}{s.value}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
