'use client';

import { useEffect, useState } from 'react';

interface ProgressBarProps {
  duration?: number;
  label?: string;
  onComplete?: () => void;
}

export default function ProgressBar({
  duration = 3000,
  label = 'Loading memories...',
  onComplete,
}: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [labelIndex, setLabelIndex] = useState(0);

  const loadingLabels = [
    '💭 Loading memories...',
    '✨ 正在加载回忆碎片...',
    '🌸 整理今日心情...',
    '💕 唤醒数字伙伴...',
    '🎀 准备你的小世界...',
    '☆ 马上就好...',
  ];

  useEffect(() => {
    const startTime = Date.now();
    let raf: number;

    const update = () => {
      const elapsed = Date.now() - startTime;
      // Ease-out progress curve
      const raw = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - raw, 3); // easeOutCubic
      setProgress(Math.round(eased * 100));

      // Cycle labels
      const newLabelIndex = Math.min(
        Math.floor((elapsed / duration) * loadingLabels.length),
        loadingLabels.length - 1
      );
      setLabelIndex(newLabelIndex);

      if (raw < 1) {
        raf = requestAnimationFrame(update);
      } else {
        setProgress(100);
        setLabelIndex(loadingLabels.length - 1);
        onComplete?.();
      }
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [duration, onComplete]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
      {/* Label */}
      <p className="text-white/90 text-sm font-medium tracking-wide transition-all duration-500">
        {loadingLabels[labelIndex]}
      </p>

      {/* Progress bar track */}
      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out animate-progress-shimmer"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #F8C8DC, #FF69B4, #FFB6C1, #FF1493)',
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      {/* Percentage */}
      <span className="text-white/70 text-xs font-mono tabular-nums">
        {progress}%
      </span>
    </div>
  );
}
