'use client';

import DecorativeBorder from '@/components/shared/DecorativeBorder';

interface SummaryData {
  id: string;
  date: string;
  content: string;
  highlights: string[];
  suggestions: string[];
  generatedAt: number;
}

interface SummaryCardProps {
  summary: SummaryData;
  extraInfo?: string; // e.g. "📝 23 条记录"
}

export default function SummaryCard({ summary, extraInfo }: SummaryCardProps) {
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
            <span>✨</span> 亮点
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
            <span>💡</span> 建议
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

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-[10px] text-[var(--text-secondary)] opacity-50">
        {extraInfo && <span>{extraInfo}</span>}
        <span className={extraInfo ? '' : 'ml-auto'}>
          Generated at {new Date(summary.generatedAt).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </DecorativeBorder>
  );
}
