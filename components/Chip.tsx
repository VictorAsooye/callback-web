import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'match' | 'miss' | 'warn' | 'solid';
  icon?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Chip({ children, variant = 'default', icon, onClick, style }: ChipProps) {
  return (
    <span
      className={`chip${variant !== 'default' ? ` ${variant}` : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    >
      {icon}
      {children}
    </span>
  );
}
