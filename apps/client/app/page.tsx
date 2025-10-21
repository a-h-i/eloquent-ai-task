import Sidebar from '@/lib/components/Sidebar';
import ChatWindow from '@/lib/components/chat/ChatWindow';
import getCurrentProfile from '@/lib/auth/getCurrentProfile';

export default async function Page() {
  const profile = await getCurrentProfile();
  return (
    <div className='grid h-screen grid-cols-[280px_1fr]'>
      <Sidebar profile={profile} />
      <ChatWindow />
    </div>
  );
}
