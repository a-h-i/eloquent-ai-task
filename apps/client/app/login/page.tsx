'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import loginAction from '@/lib/auth/login.action';

export default function LoginPage() {
  const [formState, formAction, isPending] = useActionState(loginAction, {});
  return (
    <main className='bg-bg/60 flex min-h-screen items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <div className='rounded-xl border border-zinc-800 bg-zinc-800 p-6 shadow-sm sm:p-8'>
          <h1 className='text-center text-2xl font-semibold'>Sign in</h1>
          <p className='mt-2 text-center text-sm'>
            New here?{' '}
            <Link
              href='/register'
              className='font-medium text-blue-400 underline hover:text-blue-300'
            >
              Create an account
            </Link>
          </p>

          <form className='mt-6 space-y-4' action={formAction}>
            <div>
              <label htmlFor='username' className='block text-sm font-medium'>
                Username
              </label>
              <input
                id='username'
                name='username'
                type='text'
                autoComplete='username'
                required
                className='bg-bg-softer w-full rounded-lg border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50'
                placeholder='username'
                minLength={3}
              />
            </div>

            <div>
              <div className='flex items-center justify-between'>
                <label htmlFor='password' className='block text-sm font-medium'>
                  Password
                </label>
              </div>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                className='bg-bg-softer w-full rounded-lg border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50'
                placeholder='••••••••'
                minLength={6}
              />
            </div>

            <div>
              {formState.errors?.map((error, index) => (
                <p key={index} className='text-sm text-red-500'>
                  {error}
                </p>
              ))}
            </div>

            <button
              type='submit'
              className='inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2'
              disabled={isPending}
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
