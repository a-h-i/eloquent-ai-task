'use client';
import { selectCurrentConversation } from '@/lib/redux/store/conversations.slice';
import { useAppSelector } from '@/lib/redux/hooks';
import { useEffect, useRef } from 'react';
import getMessages from '@/lib/conversation/getMessages.action';
import ChatMessages from '@/lib/components/chat/ChatMessages';

import ChatComposer from '@/lib/components/chat/ChatComposer';
import {
  assistantTokenSchema,
  decodeStreamChunk,
} from '@/lib/conversation/decodeStreamChunk';
import { useImmerReducer } from 'use-immer';
import {
  chatMessagesReducer,
  ChatMessagesStatus,
} from '@/lib/components/chat/reducer/chatMessagesReducer';

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
  const eventSourceRef = useRef<EventSource | null>(null);
  const [streamingState, streamingDispatch] = useImmerReducer(
    chatMessagesReducer,
    {
      messages: [],
      streamChunks: [],
      status: ChatMessagesStatus.IDLE,
    },
  );

  useEffect(() => {
    if (!currentConversation?.id) return;
    getMessages(currentConversation.id).then((messages) => {
      streamingDispatch({
        type: 'load_messages',
        messages: messages,
      });
    });
  }, [currentConversation?.id, streamingDispatch]);

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
    if (streamingState.status === ChatMessagesStatus.STREAMING) return;
    streamingDispatch({
      type: 'add_user_input',
      input: content,
    });
    streamingDispatch({
      type: 'stream_start',
    });
    const url = '/api/chat';
    const searchParams = new URLSearchParams();
    searchParams.set('conversation_id', currentConversation.id);
    searchParams.set('message', content);
    const eventSource = new EventSource(url + '?' + searchParams.toString());
    eventSourceRef.current = eventSource;
    eventSource.onmessage = (event) => {
      const decoded = decodeStreamChunk(event.data);
      for (const chunk of decoded) {
        if (chunk.event === 'assistant_stream_start') {
          streamingDispatch({
            type: 'stream_start',
          });
        } else if (chunk.event === 'assistant_token') {
          const parsed = assistantTokenSchema.parse(chunk);
          streamingDispatch({
            type: 'stream_chunk',
            chunk: parsed.data,
          });
        } else if (chunk.event === 'assistant_stream_end') {
          streamingDispatch({
            type: 'stream_end',
          });
          eventSource.close();
        }
      }
    };
    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      streamingDispatch({
        type: 'stream_error',
      });
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
        messages={streamingState.messages}
        isStreaming={streamingState.status === ChatMessagesStatus.STREAMING}
        streamChunks={streamingState.streamChunks}
      />
      <ChatComposer
        onSend={onSend}
        disabled={streamingState.status === ChatMessagesStatus.STREAMING}
      />
    </main>
  );
}
