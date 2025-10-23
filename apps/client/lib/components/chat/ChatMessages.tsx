'use client';
import { Selectable } from 'kysely';
import { Message } from '@/lib/db/schema';
import { useEffect, useRef } from 'react';
import MessageBubble from '@/lib/components/chat/MessageBubble';

interface ChatMessagesProps {
  messages: Selectable<Message>[];
  isStreaming: boolean;
  streamChunks: string[];
}

export default function ChatMessages({
  messages,
  isStreaming,
  streamChunks,
}: ChatMessagesProps) {
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    listRef.current?.scrollTo({
      behavior: 'smooth',
      top: listRef.current.scrollHeight,
    });
  }, [messages.length, listRef]);
  return (
    <ol
      ref={listRef}
      className='flex-1 list-none space-y-4 overflow-y-auto p-6'
    >
      {messages.length === 0 && (
        <li className='text-sm text-zinc-400'>Say hi to get started ✨</li>
      )}
      {messages.map((message) => (
        <li key={message.id} className='flex items-start gap-4'>
          <MessageBubble
            key={message.id}
            content={message.content}
            author={message.author}
          />
        </li>
      ))}
      {isStreaming && <li className='flex items-start gap-4'>Thinking...</li>}

      {isStreaming && (
        <li className='flex items-start gap-4'>
          <MessageBubble
            key={streamChunks.length}
            content={streamChunks.join('')}
            author='bot'
          />
        </li>
      )}
    </ol>
  );
}
