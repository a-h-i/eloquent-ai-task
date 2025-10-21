'use server';

import { z } from 'zod';
import createDb from '@/lib/db/db';
import argon from 'argon2';
import createToken from '@/lib/auth/createToken';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export interface LoginActionState {
  errors?: string[];
  success?: boolean;
}

export default async function loginAction(
  _initialState: LoginActionState,
  data: FormData,
): Promise<LoginActionState> {
  const parsedData = loginSchema.safeParse(Object.fromEntries(data.entries()));
  if (!parsedData.success) {
    return {
      success: false,
      errors: parsedData.error.issues.map((issue) => issue.message),
    };
  }
  const db = await createDb();
  const profile = await db
    .selectFrom('profile')
    .where('username', '=', parsedData.data.username)
    .selectAll()
    .executeTakeFirst();

  if (!profile) {
    return {
      success: false,
      errors: ['Invalid username or password'],
    };
  }
  const passwordMatch = await argon.verify(
    profile.password_hash,
    parsedData.data.password,
  );

  if (!passwordMatch) {
    return {
      success: false,
      errors: ['Invalid username or password'],
    };
  }

  await createToken(profile);
  redirect('/');
}
