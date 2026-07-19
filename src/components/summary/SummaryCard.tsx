'use client';

import type { DailySummary } from '@/types';
import DecorativeBorder from '@/components/shared/DecorativeBorder';

interface SummaryCardProps {
  summary: DailySummary;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <DecorativeBorder variant="watercolor" className="animate-slide-up">
      {/* Summary content */}
      <div className="prose prose-sm max-w-none">
        <p className="text-sm md:text-base text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
          {summary.content}
        </p>
      </div>

      {/* Highlights */}
      {summary.highlights.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[var(--pink-blush)]">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-1">
            <span>✨</span> 今日亮点
          </h4>
          <ul className="space-y-1.5">
            {summary.highlights.map((h, i) => (
              <li
                key={i}
                className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
              >
                <span className="text-[var(--pink-barbie-soft)] mt-1 flex-shrink-0">☆</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {summary.suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--pink-blush)]">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-1">
            <span>💡</span> 小建议
          </h4>
          <ul className="space-y-1.5">
            {summary.suggestions.map((s, i) => (
              <li
                key={i}
                className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
              >
                <span className="text-[var(--pink-lotus)] mt-1 flex-shrink-0">♡</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Generated time */}
      <p className="mt-4 text-[10px] text-[var(--text-secondary)] opacity-50 text-right">
        Generated at {new Date(summary.generatedAt).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </DecorativeBorder>
  );
}
