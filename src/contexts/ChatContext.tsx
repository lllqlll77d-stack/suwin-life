'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type { ChatMessage, Category } from '@/types';
import { uuid } from '@/lib/utils';
import { getDB } from '@/lib/db';

// ---- State ----

type PetState = 'idle' | 'thinking' | 'happy' | 'sad';

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  petState: PetState;
}

const initialState: ChatState = {
  messages: [],
  isStreaming: false,
  petState: 'idle',
};

// ---- Actions ----

type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; payload: ChatMessage }
  | { type: 'START_AI_RESPONSE'; payload: { msgId: string } }
  | { type: 'APPEND_AI_CHUNK'; payload: { msgId: string; chunk: string } }
  | { type: 'FINISH_AI_RESPONSE'; payload: { msgId: string; categories: Category[]; cleanContent?: string } }
  | { type: 'AI_ERROR'; payload: { msgId: string; error: string } }
  | { type: 'SET_PET_STATE'; payload: PetState }
  | { type: 'CLEAR' };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'START_AI_RESPONSE': {
      const aiMsg: ChatMessage = {
        id: action.payload.msgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };
      return {
        ...state,
        messages: [...state.messages, aiMsg],
        isStreaming: true,
        petState: 'thinking',
      };
    }

    case 'APPEND_AI_CHUNK': {
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.msgId
            ? { ...m, content: m.content + action.payload.chunk }
            : m
        ),
      };
    }

    case 'FINISH_AI_RESPONSE': {
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.msgId
            ? { ...m, isStreaming: false, categories: action.payload.categories,
                content: action.payload.cleanContent || m.content }
            : m
        ),
        isStreaming: false,
        petState: 'happy',
      };
    }

    case 'AI_ERROR': {
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.msgId
            ? { ...m, content: action.payload.error, isStreaming: false }
            : m
        ),
        isStreaming: false,
        petState: 'sad',
      };
    }

    case 'SET_PET_STATE':
      return { ...state, petState: action.payload };

    case 'CLEAR':
      return initialState;

    default:
      return state;
  }
}

// ---- Context ----

interface ChatContextValue {
  state: ChatState;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = useCallback(async (text: string) => {
    // 1. Add user message
    const userMsg: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_USER_MESSAGE', payload: userMsg });

    // 2. Build conversation history (last 20 messages before this one)
    const currentHistory = state.messages.slice(-20).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Generate AI message ID and dispatch
    const aiMsgId = uuid();
    dispatch({ type: 'START_AI_RESPONSE', payload: { msgId: aiMsgId } });

    try {
      // Use the pre-generated ID pattern
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: currentHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // 4. Read SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';
      let savedCategories: Category[] = [];
      let classifyStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const dataStr = trimmed.slice(6);
          try {
            const data = JSON.parse(dataStr);

            if (data.token) {
              fullResponse += data.token;
              // Stop displaying once CLASSIFY marker starts
              if (fullResponse.includes('<<<CLASSIFY')) {
                classifyStarted = true;
              }
              if (!classifyStarted) {
                dispatch({
                  type: 'APPEND_AI_CHUNK',
                  payload: { msgId: aiMsgId, chunk: data.token },
                });
              }
            }

            if (data.done) {
              savedCategories = data.categories ?? [];
              // Strip any CLASSIFY block that leaked through
              const cleanContent = fullResponse
                .replace(/<<<CLASSIFY>>>[\s\S]*?<<<END>>>/gi, '')
                .trim();
              dispatch({
                type: 'FINISH_AI_RESPONSE',
                payload: {
                  msgId: aiMsgId,
                  categories: savedCategories,
                  cleanContent: cleanContent || fullResponse,
                },
              });
            }

            if (data.error) {
              throw new Error(data.error);
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
              throw parseErr;
            }
          }
        }
      }

      // 5. Save record to IndexedDB after successful exchange
      try {
        const db = getDB();
        await db.records.add({
          content: text,
          timestamp: Date.now(),
          categories: savedCategories,
          aiResponse: fullResponse,
          aiFeedback: '',
        });
      } catch (dbErr) {
        console.warn('Failed to save record to IndexedDB:', dbErr);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      dispatch({
        type: 'AI_ERROR',
        payload: {
          msgId: aiMsgId,
          error: `抱歉，我遇到了一些问题 💦\n${errorMessage}`,
        },
      });
    }
  }, [state.messages]);

  const clearChat = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  return (
    <ChatContext.Provider value={{ state, sendMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return ctx;
}
