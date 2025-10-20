import { MessageAuthor } from '@/lib/db/schema';
import clsx from 'clsx';

interface MessageBubbleProps {
  content: string;
  author: MessageAuthor;
}

export default function MessageBubble({ content, author }: MessageBubbleProps) {
  const isUser = author === 'user';
  return (
    <div
      className={clsx('flex w-full', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={clsx(
          'w-fit max-w-3xl rounded-2xl px-4 py-3 shadow-sm',
          isUser
            ? 'rounded-br-md bg-blue-600/90 text-white'
            : 'rounded-bl-md bg-zinc-900 ring-1 ring-zinc-800',
        )}
      >
        <p className='leading-relaxed whitespace-pre-wrap'>{content}</p>
      </div>
    </div>
  );
}
