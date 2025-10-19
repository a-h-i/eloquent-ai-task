'use client'

import { useAppSelector } from '@/lib/redux/hooks';
import { selectConversations } from '@/lib/redux/store/conversations.slice';


export default function Sidebar() {
  const conversations = useAppSelector(selectConversations);
}