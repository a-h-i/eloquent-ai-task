import verifyToken from '@/lib/auth/verifyToken';
import createDb from '@/lib/db/db';

export default async function deleteConversationAction(conversationId: string) {
  const { username } = await verifyToken();

  const db = await createDb();

  await db
    .deleteFrom('conversation')
    .where('owner_username', '=', username)
    .where('id', '=', conversationId)
    .execute();
}
