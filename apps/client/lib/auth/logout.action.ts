'use server'
import { cookies } from 'next/headers';
import { COOKIE_NAME_JWT } from '@/lib/auth/constants';


export default async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME_JWT);
}