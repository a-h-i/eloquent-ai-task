'use client';

import { Provider } from 'react-redux';
import { makeStore } from '@/lib/redux/store';
import { ReactNode } from 'react';

interface StoreProviderProps {
  children: ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const store = makeStore();
  return <Provider store={store}>{children}</Provider>;
}
