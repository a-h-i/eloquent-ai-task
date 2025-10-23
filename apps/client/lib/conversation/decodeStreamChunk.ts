import { z } from 'zod';

export const chunkSchema = z.object({
  event: z.enum([
    'assistant_stream_start',
    'assistant_token',
    'assistant_stream_end',
  ]),
  data: z.string().optional().nullish(),
});

export const assistantTokenSchema = z.object({
  event: z.literal('assistant_token'),
  data: z.string(),
});

export type ChunkSchemaType = z.infer<typeof chunkSchema>;

export type AssistantTokenSchemaType = z.infer<typeof assistantTokenSchema>;

export function decodeStreamChunk(chunk: Uint8Array<ArrayBufferLike> | string) {
  let text: string;
  if (typeof chunk === 'string') {
    text = chunk;
  } else {
    text = new TextDecoder().decode(chunk);
  }
  try {
    // we can receive multiple events in a single chunk, so we need to split them
    const lines = text.split(/\n+/);
    const data: ChunkSchemaType[] = [];
    for (const line of lines) {
      const cleanedLine = line.replace(/data:/, '');
      if (line.trim().length === 0) {
        continue;
      }
      data.push(chunkSchema.parse(JSON.parse(cleanedLine)));
    }
    return data;
  } catch (e) {
    console.error('Error decoding stream chunk', e);
    throw e;
  }
}
