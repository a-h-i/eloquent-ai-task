'use client';
import { selectCurrentConversation } from '@/lib/redux/store/conversations.slice';
import { useAppSelector } from '@/lib/redux/hooks';
import { useEffect, useState } from 'react';
import { Message } from '@/lib/db/schema';
import getMessages from '@/lib/conversation/getMessages.action';
import { Selectable } from 'kysely';
import ChatMessages from '@/lib/components/chat/ChatMessages';

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

  useEffect(() => {
    if (!currentConversation?.id) return;
    getMessages(currentConversation.id).then(setMessages);
  }, [currentConversation?.id]);

  if (!currentConversation) {
    return <NoConversationSelected />;
  }

  return (
    <main className='flex h-full flex-col'>
      <header className='flex items-center'>
        <h1 className='font-medium'>
          {currentConversation.title || 'New chat'}
        </h1>
      </header>
      <ChatMessages messages={messages} />
    </main>
  );
}
