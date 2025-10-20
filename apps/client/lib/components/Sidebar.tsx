'use client';

import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  selectConversations,
  selectCurrentConversationId,
  setCurrentConversation,
} from '@/lib/redux/store/conversations.slice';
import clsx from 'clsx';

export default function Sidebar() {
  const conversations = useAppSelector(selectConversations);
  const currentConversationId = useAppSelector(selectCurrentConversationId);
  const dispatch = useAppDispatch();

  return (
    <aside className='bg-bg/60 h-full border-r border-zinc-800 backdrop-blur-sm'>
      <div className='flex items-center gap-2 border-b border-zinc-800 p-3'>
        <button
          type='button'
          className='w-full rounded-xl bg-zinc-800 px-3 py-2 text-left font-medium transition hover:bg-zinc-700'
        >
          + New chat
        </button>
      </div>

      <div className='scrollbar-thin h-[calc(100%-56px)] overflow-y-auto'>
        {conversations.length === 0 && (
          <p className='p-4 text-sm text-zinc-400'>
            No conversations yet. Start a new one!
          </p>
        )}

        <ul className='space-y-1 p-2'>
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                onClick={() =>
                  dispatch(setCurrentConversation(conversation.id))
                }
                className={clsx(
                  'group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-zinc-800/70',
                  { 'bg-zinc-800': conversation.id === currentConversationId },
                )}
              >
                <div className='truncate'>
                  <div className='truncate text-sm font-medium'>
                    {conversation.title || 'Untitled chat'}
                  </div>
                  <div className='truncate text-xs text-zinc-400'>
                    {conversation.updated_at.toLocaleString()}
                  </div>
                </div>
                <button
                  aria-label='Delete conversation'
                  className='ml-2 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-red-400'
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  ✕
                </button>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
