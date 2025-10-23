'use client';

import { Message } from '@/lib/db/schema';
import { Selectable } from 'kysely';
import { v4 as uuidv4 } from 'uuid';
export enum ChatMessagesStatus {
  IDLE,
  STREAMING,
}

interface ChatMessagesState {
  status: ChatMessagesStatus;
  messages: Selectable<Message>[];
  streamChunks: string[];
}
type AddUserInputAction = { type: 'add_user_input'; input: string };
type StreamStartAction = { type: 'stream_start' };
type StreamChunkAction = { type: 'stream_chunk'; chunk: string };
type StreamEndAction = { type: 'stream_end' };
type LoadMessagesAction = {
  type: 'load_messages';
  messages: Selectable<Message>[];
};
type StreamErrorAction = { type: 'stream_error' };

type ChatMessagesAction =
  | StreamStartAction
  | StreamChunkAction
  | StreamEndAction
  | LoadMessagesAction
  | AddUserInputAction
  | StreamErrorAction;

export function chatMessagesReducer(
  state: ChatMessagesState,
  action: ChatMessagesAction,
): void {
  switch (action.type) {
    case 'stream_start':
      state.status = ChatMessagesStatus.STREAMING;
      state.streamChunks = [];
      break;
    case 'stream_chunk':
      state.streamChunks.push(action.chunk);
      break;
    case 'stream_end':
      state.status = ChatMessagesStatus.IDLE;
      state.messages.push({
        id: 'stream_end',
        content: state.streamChunks.join(''),
        author: 'bot',
        conversation_id:
          state.messages[state.messages.length - 1]?.conversation_id ||
          'stream_end',
        created_at: new Date(),
        updated_at: new Date(),
      });
      state.streamChunks = [];
      break;
    case 'load_messages':
      state.messages = action.messages;
      break;
    case 'add_user_input':
      state.messages.push({
        conversation_id:
          state.messages[state.messages.length - 1]?.conversation_id ||
          'add_user_input',
        content: action.input,
        author: 'user',
        created_at: new Date(),
        updated_at: new Date(),
        id: uuidv4(),
      });
      break;
    case 'stream_error':
      state.status = ChatMessagesStatus.IDLE;
      state.streamChunks = [];
      break;
  }
}
