'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types';
import { formatTime } from '@/lib/utils';
import CategoryTag from './CategoryTag';

interface ChatBubbleProps {
  message: ChatMessage;
  onDelete?: (msgId: string) => void;
  onEdit?: (msgId: string, newContent: string) => void;
}

export default function ChatBubble({ message, onDelete, onEdit }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (editing) editInputRef.current?.focus(); }, [editing]);

  const saveEdit = () => {
    if (editText.trim() && editText.trim() !== message.content) onEdit?.(message.id, editText.trim());
    setEditing(false);
  };
  return (
    <div className={`flex flex-col gap-2 animate-slide-up ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="message-meta"><span>{isUser ? 'YOU' : 'COSMOS'}</span><time>{formatTime(message.timestamp)}</time></div>
      <div className={`message-bubble ${isUser ? 'gel-bubble' : 'glass-bubble'}`}>
        {editing ? (
          <div>
            <textarea ref={editInputRef} className="message-edit" aria-label="编辑消息" value={editText} onChange={(event) => setEditText(event.target.value)} rows={3}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setEditing(false);
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); saveEdit(); }
              }} />
            <div className="message-actions mt-2"><button className="mini-button" onClick={saveEdit}>保存</button><button className="mini-button" onClick={() => setEditing(false)}>取消</button></div>
          </div>
        ) : (
          <p className="message-text">{message.content}{message.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--text-primary)] align-text-bottom animate-typing-cursor" aria-label="正在回复" />}</p>
        )}
      </div>
      {isUser && !message.isStreaming && !editing && (
        <div className="message-actions">
          <button className="mini-button" onClick={() => { setEditText(message.content); setEditing(true); }} aria-label="编辑消息">编辑</button>
          <button className="mini-button" onClick={() => onDelete?.(message.id)} aria-label="删除消息">删除</button>
        </div>
      )}
      {!isUser && Boolean(message.categories?.length) && !message.isStreaming && (
        <div className="flex flex-wrap gap-1">{message.categories?.map(category => <CategoryTag key={category} category={category} />)}</div>
      )}
    </div>
  );
}
