'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types';
import { useChatContext } from '@/contexts/ChatContext';
import ChatBubble from './ChatBubble';

export default function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const { deleteMessage, editMessage } = useChatContext();
  const lastContent = messages.at(-1)?.content;
  useEffect(() => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior });
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
    <div ref={listRef} className="message-list" role="log" aria-label="聊天记录" aria-live="polite" aria-relevant="additions">
      {messages.map((message) => <ChatBubble key={message.id} message={message} onDelete={deleteMessage} onEdit={editMessage} />)}
    </div>
  );
}
