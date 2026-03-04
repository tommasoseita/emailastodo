'use client';

import { useEmailStore } from '@/store/emailStore';
import { SplitCategory } from '@/types/email';

const tabs: { id: SplitCategory; label: string }[] = [
  { id: 'important', label: 'Important' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'newsletters', label: 'Newsletters' },
  { id: 'other', label: 'Other' },
];

export default function SplitInboxTabs() {
  const { currentSplitCategory, setCurrentSplitCategory, classifiedEmails, currentFolder } = useEmailStore();

  if (currentFolder !== 'inbox') return null;

  return (
    <div className="flex border-b border-[#1e1e3a]">
      {tabs.map((tab) => {
        const count = classifiedEmails[tab.id]?.length || 0;
        const isActive = currentSplitCategory === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentSplitCategory(tab.id)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors relative ${
              isActive
                ? 'text-white'
                : 'text-[#666688] hover:text-[#9999bb]'
            }`}
          >
            {tab.label}
            {count > 0 && (
              <span className={`ml-1.5 text-[10px] ${isActive ? 'text-[#8888ff]' : 'text-[#444466]'}`}>
                {count}
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6366f1]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
