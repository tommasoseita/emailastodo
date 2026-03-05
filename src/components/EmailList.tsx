'use client';

import { useEmailStore } from '@/store/emailStore';
import { useEmails } from '@/hooks/useEmails';
import EmailRow, { getDateGroup } from './EmailRow';
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
  const { archiveEmail, starEmail, snoozeEmail } = useEmails();

  const emails = getCurrentEmails();

  // Group emails by date
  let lastDateGroup = '';

  return (
    <div className="flex-1 min-w-[400px] bg-[#0d0d1a] border-r border-[#1e1e3a] flex flex-col">
      {/* Header with tabs */}
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
          emails.map((email, index) => {
            const dateGroup = getDateGroup(email.date);
            const showDateSeparator = dateGroup !== lastDateGroup && dateGroup !== 'Today';
            lastDateGroup = dateGroup;

            return (
              <div key={email.id}>
                {showDateSeparator && (
                  <div className="px-4 py-2 text-xs text-[#555577] font-medium border-t border-[#1a1a30] mt-1">
                    {dateGroup}
                  </div>
                )}
                <EmailRow
                  email={email}
                  isSelected={email.id === selectedEmailId}
                  onClick={() => {
                    setSelectedEmailId(email.id);
                    setSelectedIndex(index);
                  }}
                  onArchive={archiveEmail}
                  onSnooze={(e) => {
                    setSelectedEmailId(e.id);
                    useEmailStore.getState().setSnoozeOpen(true);
                  }}
                  onStar={starEmail}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
