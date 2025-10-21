'use server';

import { Selectable } from 'kysely';
import { Conversation } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import createDb from '@/lib/db/db';
import verifyToken from '@/lib/auth/verifyToken';
import isGuest from '@/lib/auth/isGuest';

type CreateConversationActionReturnValue = Selectable<Conversation> & {
  isPersisted: boolean;
};

export default async function createConversationAction(): Promise<CreateConversationActionReturnValue> {
  const guest = await isGuest();
  if (guest) {
    const now = new Date();
    return {
      isPersisted: false,
      id: uuidv4(),
      updated_at: now,
      created_at: now,
      title: null,
      owner_username: 'guest',
    };
  }
  const { username } = await verifyToken();
  const db = await createDb();
  const conversation = await db
    .insertInto('conversation')
    .values({
      title: null,
      owner_username: username,
    })
    .returningAll()
    .executeTakeFirst();
  if (!conversation) {
    throw new Error('Failed to create conversation');
  }
  return {
    isPersisted: true,
    ...conversation,
  };
}
