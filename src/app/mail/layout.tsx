'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import StatusBar from '@/components/StatusBar';
import ComposeModal from '@/components/ComposeModal';
import CommandPalette from '@/components/CommandPalette';
import ShortcutsHelp from '@/components/ShortcutsHelp';
import SnoozePopover from '@/components/SnoozePopover';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function MailLayoutInner({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();

  return (
    <div className="h-screen flex flex-col bg-[#0a0a15]">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {children}
      </div>
      <StatusBar />

      {/* Modals */}
      <ComposeModal />
      <CommandPalette />
      <ShortcutsHelp />
      <SnoozePopover />
    </div>
  );
}

export default function MailLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a15]">
        <div className="text-[#555577] text-sm">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return <MailLayoutInner>{children}</MailLayoutInner>;
}
