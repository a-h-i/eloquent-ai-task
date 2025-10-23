'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import isUsernameTakenAction from '@/lib/auth/isUsernameTaken.action';
import signupAction from '@/lib/auth/signup.action';
import { useRouter } from 'next/navigation';
import {
  registrationSchema,
  RegistrationSchemaType,
} from '@/lib/schemas/registration.schema';

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isValidating },
    setError,
    watch,
    clearErrors,
  } = useForm<RegistrationSchemaType>({
    resolver: zodResolver(registrationSchema),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: { username: '', password: '', confirm: '', name: '' },
  });

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const usernameValue = watch('username');

  // Debounced username availability check
  useEffect(() => {
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const exists = await isUsernameTakenAction(usernameValue);
        if (exists) {
          setError('username', {
            type: 'validate',
            message: 'Username is already taken',
          });
        } else if (errors.username?.type === 'validate') {
          clearErrors('username');
        }
      } catch (e) {
        // Optional: show soft error but don't block form
        console.error('Error during username availability check:', e);
      }
    }, 400);

    return () => {
      ctrl.abort();
      clearTimeout(id);
    };
  }, [usernameValue, setError, clearErrors, errors.username]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await signupAction({
        username: values.username.trim(),
        password: values.password,
        name: values.name.trim(),
        confirm: values.confirm,
      });
      if (res.ok) {
        router.push('/');
      } else {
        setError('root', {
          type: 'server',
          message: res.message || 'Registration failed',
        });
      }
    } catch (e) {
      console.error('Error during signup:', e);
      setError('root', { type: 'server', message: 'Something went wrong' });
    }
  });

  return (
    <main className='grid min-h-[calc(100dvh-0px)] place-items-center px-4'>
      <div className='bg-panel/70 w-full max-w-md rounded-xl border border-white/10 shadow-xl backdrop-blur'>
        <div className='p-6 sm:p-8'>
          <h1 className='text-2xl font-semibold'>Create your account</h1>
          <p className='mt-1 text-sm text-white/70'>
            Already have an account?{' '}
            <Link
              href='/login'
              className='text-blue-400 underline underline-offset-4 hover:text-blue-300'
            >
              Sign in
            </Link>
          </p>

          <form onSubmit={onSubmit} className='mt-6 space-y-4' noValidate>
            {errors.root?.message && (
              <div className='rounded-md border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-300'>
                {errors.root.message}
              </div>
            )}

            <div>
              <label htmlFor='username' className='mb-1 block text-sm'>
                Username
              </label>
              <input
                id='username'
                type='text'
                autoComplete='username'
                className='bg-bg-softer w-full rounded-lg border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50'
                placeholder='username'
                {...register('username')}
              />
              <div className='mt-1 h-5'>
                {errors.username?.message ? (
                  <p className='text-xs text-red-300'>
                    {errors.username.message}
                  </p>
                ) : isValidating ? (
                  <p className='text-xs text-white/50'>
                    Checking availability…
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor='password' className='mb-1 block text-sm'>
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  className='bg-bg-softer w-full rounded-lg border border-white/10 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500/50'
                  placeholder='••••••••'
                  {...register('password')}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((s) => !s)}
                  className='absolute inset-y-0 right-0 px-3 text-white/70 hover:text-white/90'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className='mt-1 h-5'>
                {errors.password?.message ? (
                  <p className='text-xs text-red-300'>
                    {errors.password.message}
                  </p>
                ) : (
                  <p className='text-xs text-white/50'>
                    Use at least 8 characters.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor='confirm' className='mb-1 block text-sm'>
                Confirm password
              </label>
              <input
                id='confirm'
                type={showPassword ? 'text' : 'password'}
                autoComplete='new-password'
                className='bg-bg-softer w-full rounded-lg border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50'
                placeholder='••••••••'
                {...register('confirm')}
              />
              <div className='mt-1 h-5'>
                {errors.confirm?.message ? (
                  <p className='text-xs text-red-300'>
                    {errors.confirm.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor='name' className='mb-1 block text-sm'>
                Name
              </label>
              <input
                id='name'
                type='text'
                autoComplete='name'
                className='bg-bg-softer w-full rounded-lg border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50'
                placeholder='your name'
                {...register('name')}
              />
              <div className='mt-1 h-5'>
                {errors.name?.message && (
                  <p className='text-xs text-red-300'>{errors.name.message}</p>
                )}
              </div>
            </div>

            <button
              type='submit'
              disabled={isSubmitting || !isValid}
              className='w-full rounded-lg bg-blue-600 px-4 py-2 font-medium transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className='mt-6'>
            <p className='text-xs text-white/50'>
              By creating an account, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
