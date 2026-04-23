import React from 'react';
import Link from 'next/link';

interface WordmarkProps {
  size?: number;
  inverted?: boolean;
  href?: string;
}

export function Wordmark({ size = 22, inverted = false, href = '/' }: WordmarkProps) {
  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 22 22">
        <circle
          cx="11" cy="11" r="10"
          fill="none"
          stroke={inverted ? 'var(--bg)' : 'var(--ink)'}
          strokeWidth="1.5"
        />
        <path
          d="M6 11a5 5 0 015-5"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="11" cy="11" r="2" fill={inverted ? 'var(--bg)' : 'var(--ink)'} />
      </svg>
      <span style={{
        fontSize: size * 0.82,
        fontWeight: 600,
        letterSpacing: -0.02,
        color: inverted ? 'var(--bg)' : 'var(--ink)',
      }}>
        Callback
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
}
