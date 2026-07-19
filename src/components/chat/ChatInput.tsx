'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [input]);

  // Re-focus after sending
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3">
      {/* Input area */}
      <div
        className="flex-1 flex items-end rounded-[28px] overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '2px solid rgba(255,20,147,0.3)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(255,20,147,0.08)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="记录今天的点滴... ✨"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent px-4 py-3 text-xs md:text-sm placeholder:text-[var(--text-secondary)] placeholder:opacity-50 focus:outline-none text-[var(--text-primary)]"
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className={`
          flex-shrink-0 w-11 h-11 rounded-full
          flex items-center justify-center
          transition-all duration-300
          ${disabled || !input.trim()
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:scale-110 active:scale-95 cursor-pointer'
          }
        `}
        style={{
          background: 'linear-gradient(135deg, #FF69B4, #FF1493)',
          boxShadow: '0 4px 16px rgba(255,20,147,0.35)',
          border: 'none',
        }}
      >
        <span className="text-white text-lg">✨</span>
      </button>
    </div>
  );
}
