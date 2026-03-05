'use client';

import { useEmailStore } from '@/store/emailStore';
import { SplitCategory } from '@/types/email';

const tabs: { id: SplitCategory; label: string }[] = [
  { id: 'important', label: 'Important' },
  { id: 'other', label: 'Other' },
];

export default function SplitInboxTabs() {
  const { currentSplitCategory, setCurrentSplitCategory, classifiedEmails, currentFolder } = useEmailStore();

  if (currentFolder !== 'inbox') {
    const folderLabels: Record<string, string> = {
      starred: 'Starred',
      snoozed: 'Snoozed',
      sent: 'Sent',
      drafts: 'Drafts',
      trash: 'Trash',
      all: 'All Mail',
    };
    return (
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1e1e3a]">
        <h2 className="text-base font-semibold text-white">{folderLabels[currentFolder] || 'Mail'}</h2>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-5 py-3 border-b border-[#1e1e3a]">
      {tabs.map((tab, i) => {
        const count = tab.id === 'other'
          ? (classifiedEmails.notifications?.length || 0) + (classifiedEmails.newsletters?.length || 0) + (classifiedEmails.other?.length || 0)
          : classifiedEmails[tab.id]?.length || 0;
        const isActive = (tab.id === 'important' && currentSplitCategory === 'important')
          || (tab.id === 'other' && currentSplitCategory !== 'important');

        return (
          <div key={tab.id} className="flex items-center">
            {i > 0 && <span className="text-[#333355] mx-2">•</span>}
            <button
              onClick={() => setCurrentSplitCategory(tab.id)}
              className={`text-base font-semibold transition-colors ${
                isActive ? 'text-white' : 'text-[#555577] hover:text-[#8888aa]'
              }`}
            >
              {tab.label}
            </button>
            {count > 0 && (
              <span className={`ml-1.5 text-sm ${isActive ? 'text-[#8888aa]' : 'text-[#444466]'}`}>
                {count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
