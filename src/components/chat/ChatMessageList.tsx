'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types';
import { useChatContext } from '@/contexts/ChatContext';
import ChatBubble from './ChatBubble';

export default function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { deleteMessage, editMessage } = useChatContext();
  const lastContent = messages.at(-1)?.content;
  useEffect(() => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, [messages.length, lastContent]);

  if (messages.length === 0) {
    return (
      <div className="chat-welcome">
        <div className="pixel-star" aria-hidden="true">✧</div>
        <h1>what&apos;s on<br />your mind?</h1>
      </div>
    );
  }
  return (
    <div className="message-list" role="log" aria-label="聊天记录" aria-live="polite" aria-relevant="additions">
      {messages.map((message) => <ChatBubble key={message.id} message={message} onDelete={deleteMessage} onEdit={editMessage} />)}
      <div ref={bottomRef} />
    </div>
  );
}
