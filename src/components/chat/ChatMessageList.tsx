'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types';
import ChatBubble from './ChatBubble';

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export default function ChatMessageList({ messages }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="glass-card max-w-sm w-full p-6 text-center">
          <p className="text-5xl mb-4">✧</p>
          <h2
            className="text-xl font-bold mb-3"
            style={{
              fontFamily: 'var(--font-pixel)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              lineHeight: 2,
              letterSpacing: '0.05em',
            }}
          >
            START YOUR DAY
          </h2>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            写下任何你想记录的——
            <br />
            今天做了什么、心情如何、体重多少...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4">
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
