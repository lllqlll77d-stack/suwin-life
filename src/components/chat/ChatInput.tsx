'use client';

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);
  useEffect(() => { if (!disabled) textareaRef.current?.focus(); }, [disabled]);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="chat-input-shell">
      <textarea ref={textareaRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown}
        aria-label="聊天消息" disabled={disabled} rows={1} />
      <button className="send-button" onClick={handleSend} disabled={disabled || !input.trim()} aria-label="发送消息">
        <span className="send-label">SEND</span><span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
