import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/lib/redux/types';
import createConversationAction from '@/lib/conversation/createConversation.action';
import deleteConversationAction from '@/lib/conversation/deleteConversaion.action';
import getConversationsAction from '@/lib/conversation/getConversations.action';

export interface IConversation {
  id: string;
  title?: string | null;
  isPersisted: boolean;
  updated_at: string;
  created_at: string;
}
export interface IConversationsState {
  conversations: IConversation[];
  currentConversationId?: string;
}

export const initialState: IConversationsState = {
  conversations: [],
  currentConversationId: undefined,
};
const createTypedAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: Error;
}>();

export const createConversation = createTypedAsyncThunk(
  'conversations/create',
  async (): Promise<IConversation> => {
    const conversation = await createConversationAction();
    return {
      ...conversation,
      created_at: conversation.created_at.toISOString(),
      updated_at: conversation.updated_at.toISOString(),
    };
  },
);

export const getConversations = createTypedAsyncThunk(
  'conversations/fetch',
  async (): Promise<IConversation[]> => {
    const conversations = await getConversationsAction();
    return conversations.map(
      (conversation): IConversation => ({
        ...conversation,
        created_at: conversation.created_at.toISOString(),
        updated_at: conversation.updated_at.toISOString(),
        isPersisted: true,
      }),
    );
  },
);

export const deleteConversation = createTypedAsyncThunk(
  'conversations/delete',
  async (args: string, thunkAPI) => {
    const conversation = thunkAPI
      .getState()
      .conversations.conversations.find((c) => c.id === args);
    if (!conversation) {
      return;
    }
    if (conversation.isPersisted) {
      await deleteConversationAction(conversation.id);
    }
    return conversation;
  },
);

export const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    addConversation: (state, action: PayloadAction<IConversation>) => {
      state.conversations.push(action.payload);
    },
    setCurrentConversation: (state, action: PayloadAction<string>) => {
      state.currentConversationId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.push(action.payload);
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        const conversationId = action.payload?.id;
        if (conversationId != null) {
          state.conversations = state.conversations.filter(
            (c) => c.id !== conversationId,
          );
        }
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversations.push(...action.payload);
      });
  },
});

export const { addConversation, setCurrentConversation } =
  conversationsSlice.actions;

export const selectConversations = (state: RootState) =>
  state.conversations.conversations;
export const selectCurrentConversationId = (state: RootState) =>
  state.conversations.currentConversationId;

export const selectCurrentConversation = (state: RootState) => {
  const id = selectCurrentConversationId(state);
  if (!id) {
    return;
  }
  return state.conversations.conversations.find((c) => c.id === id);
};
