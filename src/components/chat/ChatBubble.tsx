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
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      editInputRef.current?.focus();
      editInputRef.current?.setSelectionRange(editText.length, editText.length);
    }
  }, [editing, editText.length]);

  const handleEdit = () => {
    setEditText(message.content);
    setEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit?.(message.id, trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setEditText(message.content);
    }
  };

  return (
    <div
      className={`flex flex-col gap-1 animate-slide-up ${isUser ? 'items-end' : 'items-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setEditing(false); }}
    >
      {/* Action buttons (user messages only, appears on hover) */}
      {isUser && !message.isStreaming && showActions && !editing && (
        <div className="flex items-center gap-1 px-1 animate-fade-in">
          <button
            onClick={handleEdit}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
            style={{
              background: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,20,147,0.2)',
              color: 'var(--text-secondary)',
            }}
            title="编辑"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete?.(message.id)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
            style={{
              background: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,20,147,0.2)',
              color: 'var(--text-secondary)',
            }}
            title="删除"
          >
            🗑️
          </button>
        </div>
      )}

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
        {/* Streaming cursor (only when streaming and empty) */}
        {message.isStreaming && !message.content && (
          <span className="inline-block w-2 h-4 bg-[var(--pink-barbie)] rounded-sm ml-0.5 animate-typing-cursor" />
        )}

        {/* Content or Edit input */}
        {editing ? (
          <textarea
            ref={editInputRef}
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            className="w-full min-w-[120px] bg-transparent text-sm md:text-base leading-relaxed outline-none resize-none"
            style={{
              color: 'white',
              fontFamily: 'inherit',
            }}
            rows={Math.min(editText.split('\n').length, 6)}
          />
        ) : (
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
        )}
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
