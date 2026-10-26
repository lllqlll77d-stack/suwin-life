'use client';

import { ChatProvider, useChatContext } from '@/contexts/ChatContext';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';

function ChatContent() {
  const { state, sendMessage } = useChatContext();
  return (
    <div className="site-page">
      <div className="chat-page">
      <main id="main-content" className="chat-main">
        <div className="chat-heading"><span className="eyebrow">01 / CHAT</span><span className="eyebrow">{state.isStreaming ? '正在倾听…' : 'A SPACE TO BE YOURSELF'}</span></div>
        <ChatMessageList messages={state.messages} />
        <div className="chat-composer">
          <ChatInput onSend={sendMessage} disabled={state.isStreaming} />
        </div>
      </main>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return <ChatProvider><ChatContent /></ChatProvider>;
}
