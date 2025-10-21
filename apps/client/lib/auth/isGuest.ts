'use server';

import { cookies } from 'next/headers';
import { COOKIE_NAME_JWT } from '@/lib/auth/constants';

export default async function isGuest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME_JWT)?.value;
  return token == null;
}
