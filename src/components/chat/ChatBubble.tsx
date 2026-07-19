'use client';

import type { ChatMessage } from '@/types';
import { formatTime } from '@/lib/utils';
import CategoryTag from './CategoryTag';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex flex-col gap-1 animate-slide-up ${isUser ? 'items-end' : 'items-start'}`}
    >
      {/* Bubble */}
      <div
        className={`
          max-w-[85%] md:max-w-[75%] px-4 py-3
          ${isUser ? 'gel-bubble' : 'glass-bubble'}
        `}
        style={isUser ? {
          borderBottomRightRadius: '6px',
        } : {
          borderBottomLeftRadius: '6px',
        }}
      >
        {/* Streaming cursor */}
        {message.isStreaming && (
          <span className="inline-block w-2 h-4 bg-[var(--pink-barbie)] rounded-sm ml-0.5 animate-typing-cursor" />
        )}

        {/* Content */}
        <p className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${isUser ? 'text-white' : 'text-[var(--text-primary)]'}`}>
          {message.content}
          {message.isStreaming && (
            <span
              className="inline-block w-1.5 h-4 ml-0.5 rounded-sm align-text-bottom"
              style={{
                background: 'var(--pink-barbie)',
                animation: 'typing-cursor 0.8s infinite',
              }}
            />
          )}
        </p>
      </div>

      {/* Categories (only for AI messages after streaming) */}
      {!isUser && message.categories && message.categories.length > 0 && !message.isStreaming && (
        <div className="flex flex-wrap gap-1 px-1">
          {message.categories.map(cat => (
            <CategoryTag key={cat} category={cat} size="sm" />
          ))}
        </div>
      )}

      {/* Timestamp */}
      <span className="text-[10px] text-[var(--text-secondary)] px-2 opacity-60">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}
