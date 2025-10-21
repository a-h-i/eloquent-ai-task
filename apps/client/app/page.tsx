import Sidebar from '@/lib/components/Sidebar';
import ChatWindow from '@/lib/components/chat/ChatWindow';

export default function Page() {
  return (
    <div className='grid h-screen grid-cols-[280px_1fr]'>
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
