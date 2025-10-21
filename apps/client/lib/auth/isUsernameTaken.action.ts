'use server';
import createDb from '@/lib/db/db';

export default async function isUsernameTakenAction(username: string) {
  const db = await createDb();

  const profile = await db
    .selectFrom('profile')
    .where('username', '=', username)
    .select('username')
    .executeTakeFirst();
  return profile != null;
}
