'use server';
import createDb from '@/lib/db/db';

export default async function getMessages(conversationId: string) {
  // TODO: check current user is owner of conversation
  const db = await createDb();

  return await db
    .selectFrom('message')
    .where('conversation_id', '=', conversationId)
    .selectAll()
    .execute();
}
