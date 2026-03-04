'use client';

import { useEmailStore } from '@/store/emailStore';
import { Folder } from '@/types/email';

const folders: { id: Folder; label: string; icon: string }[] = [
  { id: 'inbox', label: 'Inbox', icon: '📥' },
  { id: 'starred', label: 'Starred', icon: '⭐' },
  { id: 'snoozed', label: 'Snoozed', icon: '⏰' },
  { id: 'sent', label: 'Sent', icon: '📤' },
  { id: 'drafts', label: 'Drafts', icon: '📝' },
  { id: 'trash', label: 'Trash', icon: '🗑️' },
];

export default function Sidebar() {
  const { currentFolder, setCurrentFolder, emails } = useEmailStore();

  const unreadCount = emails.filter((e) => !e.isRead && e.labels.includes('INBOX')).length;

  return (
    <aside className="w-[200px] min-w-[200px] bg-[#0f0f1a] border-r border-[#1e1e3a] flex flex-col py-4">
      <div className="px-4 mb-6">
        <h1 className="text-lg font-semibold text-white tracking-tight">Supermail</h1>
      </div>

      <nav className="flex-1">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setCurrentFolder(folder.id)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              currentFolder === folder.id
                ? 'bg-[#1a1a35] text-white'
                : 'text-[#8888aa] hover:text-white hover:bg-[#1a1a35]/50'
            }`}
          >
            <span className="text-base">{folder.icon}</span>
            <span className="flex-1 text-left">{folder.label}</span>
            {folder.id === 'inbox' && unreadCount > 0 && (
              <span className="text-xs bg-[#6366f1] text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-4 py-2 text-xs text-[#555577]">
        Press <kbd className="px-1 py-0.5 bg-[#1a1a35] rounded text-[#8888aa]">?</kbd> for shortcuts
      </div>
    </aside>
  );
}
