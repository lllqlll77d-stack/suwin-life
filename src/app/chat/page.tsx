'use client';

import { ChatProvider, useChatContext } from '@/contexts/ChatContext';
import NavBar from '@/components/layout/NavBar';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';

function ChatContent() {
  const { state, sendMessage } = useChatContext();

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundImage: 'url(/图片/chat-bg-new.png)',
        backgroundSize: '100% auto',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Main chat area */}
      <main className="flex-1 flex flex-col pb-24 md:pb-0 relative">

        {/* Dog decoration — bottom right */}
        <img
          src="/图片/IMG_3945-removebg-preview.png"
          alt=""
          className="absolute right-4 -bottom-4 w-32 md:w-48 pointer-events-none z-10"
        />

        {/* Messages */}
        <ChatMessageList messages={state.messages} />

        {/* Input area */}
        <div className="sticky bottom-0 left-0 right-0 md:relative mx-auto md:max-w-2xl w-full">
          <ChatInput onSend={sendMessage} disabled={state.isStreaming} />
        </div>
      </main>

      {/* Navigation */}
      <NavBar />
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
}
