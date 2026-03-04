'use client';

import { useEmailStore } from '@/store/emailStore';
import EmailRow from './EmailRow';
import SplitInboxTabs from './SplitInboxTabs';

export default function EmailList() {
  const {
    selectedEmailId,
    setSelectedEmailId,
    setSelectedIndex,
    isLoading,
    getCurrentEmails,
    currentFolder,
  } = useEmailStore();

  const emails = getCurrentEmails();

  const folderLabels: Record<string, string> = {
    inbox: 'Inbox',
    starred: 'Starred',
    snoozed: 'Snoozed',
    sent: 'Sent',
    drafts: 'Drafts',
    trash: 'Trash',
    all: 'All Mail',
  };

  return (
    <div className="w-[380px] min-w-[380px] bg-[#0d0d1a] border-r border-[#1e1e3a] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1e1e3a]">
        <h2 className="text-sm font-semibold text-white">{folderLabels[currentFolder] || 'Inbox'}</h2>
      </div>

      {/* Split Inbox Tabs */}
      <SplitInboxTabs />

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && emails.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-[#555577]">Loading emails...</div>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="text-2xl">✨</div>
            <div className="text-sm text-[#555577]">You&apos;re all done!</div>
            <div className="text-xs text-[#333355]">No emails in this view</div>
          </div>
        ) : (
          emails.map((email, index) => (
            <EmailRow
              key={email.id}
              email={email}
              isSelected={email.id === selectedEmailId}
              onClick={() => {
                setSelectedEmailId(email.id);
                setSelectedIndex(index);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
