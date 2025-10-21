'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const composerSchema = z.object({
  message: z.string().min(1),
});
type ComposerSchemaType = z.infer<typeof composerSchema>;

export default function ChatComposer(props: ChatComposerProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<ComposerSchemaType>({
    resolver: zodResolver(composerSchema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const onSubmit = handleSubmit((data) => {
    if (props.disabled) return;
    props.onSend(data.message);
  });

  return (
    <form
      onSubmit={onSubmit}
      className='border-t border-zinc-800 p-4'
      noValidate
    >
      <div className='mx-auto max-w-3xl'>
        <div className='rounded-2xl bg-zinc-900 ring-1 ring-zinc-800 focus-within:ring-zinc-700'>
          <textarea
            className='block w-full resize-none bg-transparent p-4 outline-none placeholder:text-zinc-500'
            rows={3}
            id='message'
            {...register('message')}
          />
          <div className='flex items-center justify-between gap-3 px-3 pb-3'>
            <div className='text-xs text-zinc-400'>Shift+Enter for newline</div>
            <button
              type='submit'
              className='rounded-xl bg-white/90 px-4 py-2 font-medium text-black hover:bg-white'
              disabled={isSubmitting || !isValid || props.disabled}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
