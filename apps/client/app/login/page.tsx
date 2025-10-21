'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import loginAction from '@/lib/auth/login.action';

export default function LoginPage() {
  const [formState, formAction, isPending] = useActionState(loginAction, {});
  return (
    <main className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
      <div className='w-full max-w-md'>
        <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8'>
          <h1 className='text-center text-2xl font-semibold text-gray-900'>
            Sign in
          </h1>
          <p className='mt-2 text-center text-sm text-gray-600'>
            New here?{' '}
            <Link
              href='/register'
              className='font-medium text-indigo-600 hover:text-indigo-700'
            >
              Create an account
            </Link>
          </p>

          <form className='mt-6 space-y-4' action={formAction}>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700'
              >
                Username
              </label>
              <input
                id='username'
                name='username'
                type='text'
                autoComplete='username'
                required
                className='mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm'
                placeholder='username'
                minLength={3}
              />
            </div>

            <div>
              <div className='flex items-center justify-between'>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700'
                >
                  Password
                </label>
              </div>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                className='mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm'
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
              className='inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
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
