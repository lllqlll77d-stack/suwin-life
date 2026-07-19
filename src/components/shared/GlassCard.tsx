'use client';

import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  style,
  onClick,
}: GlassCardProps) {
  return (
    <div
      className={`glass-card ${className}`}
      style={{
        boxShadow: '0 4px 16px rgba(255,20,147,0.08), 0 1px 3px rgba(0,0,0,0.04)',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
