'use client';

import { useMemo } from 'react';

interface DecorationItem {
  id: string;
  type: 'star' | 'heart' | 'butterfly';
  startX: number;
  startY: number;
  duration: number;
  delay: number;
  size: number;
}

const EMOJIS: Record<DecorationItem['type'], string> = {
  star: '⭐',
  heart: '💕',
  butterfly: '🦋',
};

function generateDecorations(count: number): DecorationItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `decoration-${i}`,
    type: (['star', 'heart', 'butterfly'] as const)[i % 3],
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    duration: 4 + Math.random() * 8,
    delay: Math.random() * 4,
    size: 16 + Math.random() * 24,
  }));
}

export default function FloatingDecorations() {
  const decorations = useMemo(() => generateDecorations(15), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {decorations.map((d) => (
        <div
          key={d.id}
          className="absolute animate-float"
          style={{
            left: `${d.startX}%`,
            top: `${d.startY}%`,
            fontSize: `${d.size}px`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            opacity: 0.6,
            filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))',
          }}
        >
          {EMOJIS[d.type]}
        </div>
      ))}
    </div>
  );
}
