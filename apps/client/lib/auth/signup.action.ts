'use server';

import createDb from '@/lib/db/db';
import argon from 'argon2';
import createToken from '@/lib/auth/createToken';

interface SignupActionProps {
  username: string;
  password: string;
}

type SignupActionResponse = { ok: true } | { ok: false; message: string };

export default async function signupAction(
  props: SignupActionProps,
): Promise<SignupActionResponse> {
  const db = await createDb();
  const passwordHash = await argon.hash(props.password);
  const profile = await db
    .insertInto('profile')
    .values({
      username: props.username,
      name: props.username,
      password_hash: passwordHash,
    })
    .returningAll()
    .executeTakeFirst();
  if (!profile) {
    return {
      ok: false,
      message: 'Failed to create profile',
    };
  }
  await createToken(profile);
  return {
    ok: true,
  };
}
