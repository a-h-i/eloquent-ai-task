'use server';

import isGuest from '@/lib/auth/isGuest';
import verifyToken from '@/lib/auth/verifyToken';
import createDb from '@/lib/db/db';

export default async function getConversationsAction() {
  const guest = await isGuest();
  if (guest) {
    return [];
  }
  const { username } = await verifyToken();
  const db = await createDb();
  return await db
    .selectFrom('conversation')
    .selectAll()
    .where('owner_username', '=', username)
    .execute();
}
