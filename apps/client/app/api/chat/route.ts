import { NextRequest, NextResponse } from 'next/server';
import assert from 'node:assert';
import isGuest from '@/lib/auth/isGuest';
import { z } from 'zod';
import verifyToken from '@/lib/auth/verifyToken';
import createDb from '@/lib/db/db';
import { Kysely } from 'kysely';
import { DB } from '@/lib/db/schema';
import {
  assistantTokenSchema,
  decodeStreamChunk,
} from '@/lib/conversation/decodeStreamChunk';

const querySchema = z.object({
  message: z.string().min(1),
  conversation_id: z.uuid(),
});

export async function GET(req: NextRequest) {
  const baseAiUrl = process.env.AI_BASE_URL;
  assert(baseAiUrl, 'AI_BASE_URL is not set');
  const db = await createDb();
  const guest = await isGuest();

  let username: string | undefined;

  if (!guest) {
    const claims = await verifyToken();
    username = claims.username;
  }
  const parsedQuery = querySchema.parse(
    Object.fromEntries(req.nextUrl.searchParams.entries()),
  );
  const conversation = await db
    .selectFrom('conversation')
    .where('id', '=', parsedQuery.conversation_id)
    .selectAll()
    .executeTakeFirst();
  if (
    conversation != null &&
    (guest || conversation.owner_username != username)
  ) {
    return NextResponse.json(
      {
        message: 'You are not allowed to send messages in this conversation',
      },
      { status: 403 },
    );
  }

  const url = new URL('/chatbot', baseAiUrl);
  url.searchParams.set('message', parsedQuery.message);
  url.searchParams.set('thread_id', parsedQuery.conversation_id);
  url.searchParams.set('is_guest', guest.toString());

  if (conversation != null) {
    // We need to add the message to the conversation.
    await db
      .insertInto('message')
      .values({
        conversation_id: conversation.id,
        author: 'user',
        content: parsedQuery.message,
      })
      .execute();
  }
  const response = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-cache',
  });
  assert(response.body != null, 'Response body is null');
  // we create two streams, one to return to the user immediately and the other
  // to consume and save to the db
  const [stream1, stream2] = response.body.tee();

  if (conversation != null) {
    saveToDb(stream2, db, conversation.id).catch((e) => {
      console.error('Error saving streamed response to db', e);
    });
  } else {
    stream2.cancel();
  }

  return new NextResponse(stream1, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Transfer-Encoding': 'chunked',
      Connection: 'keep-alive',
    },
  });
}

async function saveToDb(
  stream: ReadableStream<Uint8Array<ArrayBufferLike>>,
  db: Kysely<DB>,
  conversationId: string,
) {
  const reader = stream.getReader();
  const generator = createStreamGenerator(reader);
  const tokens: string[] = [];
  for await (const chunk of generator()) {
    const decoded = decodeStreamChunk(chunk);
    for (const event of decoded) {
      if (event.event === 'assistant_token') {
        const parsed = assistantTokenSchema.parse(event);
        tokens.push(parsed.data);
      }
    }
  }
  await db
    .insertInto('message')
    .values({
      content: tokens.join(''),
      author: 'bot',
      conversation_id: conversationId,
    })
    .execute();
}

/**
 * Creates an asynchronous generator function to read and yield chunks of data
 * from a given ReadableStreamDefaultReader.
 *
 * @param {ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>} reader - The reader for the readable stream to retrieve data from.
 * @return  An asynchronous generator function that yields chunks of data until the stream ends.
 */
function createStreamGenerator(
  reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>,
) {
  return async function* () {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  };
}
