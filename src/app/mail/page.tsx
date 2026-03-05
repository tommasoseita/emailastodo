'use client';

import EmailList from '@/components/EmailList';
import EmailView from '@/components/EmailView';
import SearchBar from '@/components/SearchBar';
import { useEmailStore } from '@/store/emailStore';

export default function MailPage() {
  const { isSearching, selectedEmailId } = useEmailStore();

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className={`flex flex-col ${selectedEmailId ? 'w-[45%] min-w-[400px]' : 'flex-1'} transition-all duration-150`}>
        {isSearching && <SearchBar />}
        <div className="flex-1 overflow-hidden flex">
          <EmailList />
        </div>
      </div>
      {selectedEmailId && <EmailView />}
    </div>
  );
}
