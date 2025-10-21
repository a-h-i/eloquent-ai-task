'use server';
import createDb from '@/lib/db/db';
import isGuest from '@/lib/auth/isGuest';
import verifyToken from '@/lib/auth/verifyToken';

export default async function getMessages(conversationId: string) {
  const db = await createDb();
  const guest = await isGuest();
  if (guest) {
    return [];
  }
  const { username } = await verifyToken();

  return await db
    .selectFrom('message')
    .innerJoin('conversation', 'conversation.id', 'message.conversation_id')
    .selectAll('message')
    .where('conversation.owner_username', '=', username)
    .where('conversation_id', '=', conversationId)
    .execute();
}
