import React from 'react';

interface SignalRowProps {
  icon: React.ReactNode;
  label: string;
  why?: string;
  value: number;
  max?: number;
}

export function SignalRow({ icon, label, why, value, max }: SignalRowProps) {
  const pos = value > 0;
  const neg = value < 0;

  return (
    <div className="signal-row">
      <div className="sig-ico">{icon}</div>
      <div className="sig-label">
        {label}
        {why && <span className="sig-why">{why}</span>}
      </div>
      <div className={`sig-val mono${pos ? ' pos' : neg ? ' neg' : ''}`}>
        {pos ? '+' : ''}{value}
        {max !== undefined && <span style={{ color: 'var(--ink-mute)' }}> / {max}</span>}
      </div>
    </div>
  );
}
