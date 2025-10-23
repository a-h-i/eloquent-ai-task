'use server';

import createDb from '@/lib/db/db';
import argon from 'argon2';
import createToken from '@/lib/auth/createToken';
import { registrationSchema } from '@/lib/schemas/registration.schema';

interface SignupActionProps {
  username: string;
  password: string;
  confirm: string;
  name: string;
}

type SignupActionResponse = { ok: true } | { ok: false; message: string };

export default async function signupAction(
  props: SignupActionProps,
): Promise<SignupActionResponse> {
  const values = registrationSchema.parse(props);
  const db = await createDb();
  const passwordHash = await argon.hash(values.password);
  const profile = await db
    .insertInto('profile')
    .values({
      username: values.username,
      name: values.name,
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
