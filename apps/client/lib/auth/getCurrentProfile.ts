'use server'


import { Selectable } from 'kysely';
import { Profile } from '@/lib/db/schema';
import isGuest from '@/lib/auth/isGuest';
import verifyToken from '@/lib/auth/verifyToken';
import createDb from '@/lib/db/db';

export default async function getCurrentProfile(): Promise<Selectable<Profile> | null> {
  const guest = await isGuest();
  if (guest) {
    return null;
  }
  const { username } = await verifyToken();

  const db = await createDb();

  return await db
    .selectFrom('profile')
    .where('username', '=', username)
    .selectAll()
    .executeTakeFirstOrThrow();
}