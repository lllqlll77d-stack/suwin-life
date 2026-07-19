'use client';

import { ReactNode } from 'react';

interface DecorativeBorderProps {
  children: ReactNode;
  className?: string;
  variant?: 'lace' | 'watercolor' | 'simple';
}

export default function DecorativeBorder({
  children,
  className = '',
  variant = 'lace',
}: DecorativeBorderProps) {
  const borderStyles: Record<string, React.CSSProperties> = {
    lace: {
      border: '3px solid transparent',
      borderImage: 'repeating-linear-gradient(45deg, #F8C8DC, #FFB6C1 10px, #F8C8DC 20px) 30',
      borderRadius: '20px',
    },
    watercolor: {
      border: '2px solid transparent',
      background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #FFB6C1, #D8BFD8, #F8C8DC) border-box',
      borderRadius: '20px',
    },
    simple: {
      border: '2px dashed rgba(255,105,180,0.3)',
      borderRadius: '16px',
    },
  };

  return (
    <div
      className={className}
      style={{ ...borderStyles[variant], padding: '20px' }}
    >
      {children}
    </div>
  );
}
