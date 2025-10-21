'use server';

import assert from 'node:assert';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { COOKIE_NAME_JWT } from '@/lib/auth/constants';

export default async function verifyToken(): Promise<{
  username: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME_JWT)?.value;
  if (!token) {
    throw new Error('Unauthorized');
  }
  const secret = process.env.JWT_SECRET;
  assert(secret, 'JWT_SECRET is not set');
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  const username = payload.sub;
  if (!username) {
    throw new Error('Invalid token');
  }
  return {
    username,
  };
}
