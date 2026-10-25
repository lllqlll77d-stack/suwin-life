'use client';

interface SummaryData {
  id: string;
  date: string;
  content: string;
  highlights: string[];
  suggestions: string[];
  generatedAt: number;
}

export default function SummaryCard({ summary, extraInfo }: { summary: SummaryData; extraInfo?: string }) {
  return (
    <article className="summary-card animate-fade-in" aria-label={`${summary.date} 总结`}>
      <p className="eyebrow mb-6">{summary.date}</p>
      <p className="summary-prose">{summary.content}</p>
      {summary.highlights.length > 0 && <section className="summary-section"><h3>亮点 / HIGHLIGHTS</h3><ul>{summary.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}</ul></section>}
      {summary.suggestions.length > 0 && <section className="summary-section"><h3>建议 / A LITTLE DIRECTION</h3><ul>{summary.suggestions.map((suggestion, index) => <li key={index}>{suggestion}</li>)}</ul></section>}
      <footer className="summary-footer"><span>{extraInfo || 'SUWIN’S COSMOS'}</span><span>GENERATED AT {new Date(summary.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span></footer>
    </article>
  );
}
