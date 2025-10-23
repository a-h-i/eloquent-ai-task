'use client';
import { selectCurrentConversation } from '@/lib/redux/store/conversations.slice';
import { useAppSelector } from '@/lib/redux/hooks';
import { startTransition, useEffect, useRef, useState } from 'react';
import { Message } from '@/lib/db/schema';
import getMessages from '@/lib/conversation/getMessages.action';
import { Selectable } from 'kysely';
import ChatMessages from '@/lib/components/chat/ChatMessages';
import { v4 as uuidv4 } from 'uuid';
import ChatComposer from '@/lib/components/chat/ChatComposer';
import {
  assistantTokenSchema,
  decodeStreamChunk,
} from '@/lib/conversation/decodeStreamChunk';

function NoConversationSelected() {
  return (
    <main className='grid h-full place-items-center'>
      <div className='max-w-md text-center text-zinc-300'>
        <h1 className='text-2xl font-semibold'>Welcome 👋</h1>
        <p className='mt-2'>Start a conversation from the left sidebar.</p>
      </div>
    </main>
  );
}

export default function ChatWindow() {
  const currentConversation = useAppSelector(selectCurrentConversation);
  const [messages, setMessages] = useState<Selectable<Message>[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [streamChunks, setStreamChunks] = useState<string[]>([]);

  useEffect(() => {
    if (!currentConversation?.id) return;
    getMessages(currentConversation.id).then(setMessages);
  }, [currentConversation?.id]);

  useEffect(() => {
    const eventSource = eventSourceRef.current;
    return () => {
      eventSource?.close(); // cleanup
    };
  }, [eventSourceRef]);

  if (!currentConversation) {
    return <NoConversationSelected />;
  }

  const onSend = (content: string) => {
    if (isStreaming) return;
    setIsStreaming(true);
    setStreamChunks([]);
    setMessages((prev) => {
      const now = new Date();
      return prev.concat([
        {
          id: uuidv4(),
          content,
          created_at: now,
          updated_at: now,
          author: 'user',
          conversation_id: currentConversation.id,
        },
      ]);
    });
    const url = '/api/chat';
    const searchParams = new URLSearchParams();
    searchParams.set('conversation_id', currentConversation.id);
    searchParams.set('message', content);
    const eventSource = new EventSource(url + '?' + searchParams.toString());
    eventSourceRef.current = eventSource;
    eventSource.onmessage = (event) => {
      const decoded = decodeStreamChunk(event.data);
      const streamedTokens: string[] = [];
      for (const chunk of decoded) {
        if (chunk.event === 'assistant_stream_start') {
        } else if (chunk.event === 'assistant_token') {
          const parsed = assistantTokenSchema.parse(chunk);
          streamedTokens.push(parsed.data);
        } else if (chunk.event === 'assistant_stream_end') {
          startTransition(() => {
            setIsStreaming(false);
            setMessages((prev) => {
              const now = new Date();
              return prev.concat([
                {
                  id: uuidv4(),
                  content: streamChunks.join('') + streamedTokens.join(''),
                  created_at: now,
                  updated_at: now,
                  author: 'bot',
                  conversation_id: currentConversation.id,
                },
              ]);
            });
          });
          eventSource.close();
        }
      }
      setStreamChunks((prev) => prev.concat(streamedTokens));
    };
    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      setIsStreaming(false);
      eventSource.close();
    };
  };

  return (
    <main className='flex h-full flex-col'>
      <header className='flex items-center p-4'>
        <h1 className='font-medium'>
          {currentConversation.title || 'New chat'}
        </h1>
      </header>
      <ChatMessages
        messages={messages}
        isStreaming={isStreaming}
        streamChunks={streamChunks}
      />
      <ChatComposer onSend={onSend} disabled={isStreaming} />
    </main>
  );
}
