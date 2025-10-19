import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/lib/redux/types';


export interface IConversation {
  id: string;
  title?: string;
}

export interface IConversationsState {
  conversations: IConversation[];
  currentConversationId?: string;
}

export const initialState: IConversationsState = {
  conversations: [],
  currentConversationId: undefined,
};
const createConversationAsyncThunk = createAsyncThunk.withTypes<{
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

export const selectConversations = (state: RootState) => state.conversations.conversations;
