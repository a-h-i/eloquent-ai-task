import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/lib/redux/types';

export interface IConversation {
  id: string;
  title?: string;
  updated_at: Date;
  created_at: Date;
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
