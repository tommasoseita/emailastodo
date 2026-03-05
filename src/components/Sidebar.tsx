'use client';

import { useEmailStore } from '@/store/emailStore';
import { Folder } from '@/types/email';

const folders: { id: Folder; label: string; icon: React.ReactNode }[] = [
  {
    id: 'inbox', label: 'Inbox',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 13h6l2 2h2l2-2h6" /></svg>,
  },
  {
    id: 'starred', label: 'Starred',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
  {
    id: 'snoozed', label: 'Snoozed',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  },
  {
    id: 'sent', label: 'Sent',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  },
  {
    id: 'drafts', label: 'Drafts',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  },
  {
    id: 'trash', label: 'Trash',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  },
];

export default function Sidebar() {
  const { currentFolder, setCurrentFolder, emails } = useEmailStore();

  const unreadCount = emails.filter((e) => !e.isRead && e.labels.includes('INBOX')).length;

  return (
    <aside className="w-[56px] min-w-[56px] bg-[#0a0a15] border-r border-[#1e1e3a] flex flex-col items-center py-4 gap-1">
      {/* Logo */}
      <div className="mb-4 text-white">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 7l-10 7L2 7" />
        </svg>
      </div>

      {/* Folder icons */}
      <nav className="flex flex-col items-center gap-0.5">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setCurrentFolder(folder.id)}
            className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              currentFolder === folder.id
                ? 'bg-[#1a1a35] text-white'
                : 'text-[#555577] hover:text-[#8888aa] hover:bg-[#111128]'
            }`}
            title={folder.label}
          >
            {folder.icon}
            {folder.id === 'inbox' && unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-[#6366f1] text-white rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
