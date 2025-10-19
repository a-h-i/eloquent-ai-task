import { configureStore } from '@reduxjs/toolkit';
import { conversationsSlice } from '@/lib/redux/store/conversations.slice';


export function makeStore() {
  return configureStore({
    reducer: {
      conversations: conversationsSlice.reducer,
    }
  })
}